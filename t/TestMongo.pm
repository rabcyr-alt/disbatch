package TestMongo;

# Shared setup for the tests that need a real mongod: free port, config, TLS/auth, roles and users.

use 5.12.0;
use warnings;

use Cpanel::JSON::XS;
use File::Path qw/remove_tree/;
use File::Slurp;
use IO::Socket::INET;
use MongoDB 2.2.2;
use Try::Tiny::Retry ':all';

use Disbatch::Roles;

our $ROOT_PASSWORD = 'kjfiwey76r3gjm';

# Returns an unused TCP port on localhost.
sub get_free_port {
    my ($port, $sock);
    do {
        $port = int rand()*32767+32768;
        $sock = IO::Socket::INET->new(Listen => 1, ReuseAddr => 1, LocalAddr => 'localhost', LocalPort => $port, Proto => 'tcp')
                or warn "\n# cannot bind to port $port: $!";
    } while (!defined $sock);
    $sock->shutdown(2);
    $sock->close();
    $port;
}

# Returns the path to the `go-task-runner` to test, or undef if there is none. This is `$ENV{GO_TASK_RUNNER}` if set, otherwise
# `./go/go-task-runner` (which `Makefile.PL` builds if Go is installed, so `dzil test` has it, or you can build it by hand),
# otherwise an installed `/usr/bin/go-task-runner`.
sub go_task_runner {
    return $ENV{GO_TASK_RUNNER} if defined $ENV{GO_TASK_RUNNER};
    for my $path ('./go/go-task-runner', '/usr/bin/go-task-runner') {
        return $path if -x $path;
    }
    undef;
}

# Returns the path to `mongod` ($ENV{MONGOD}, or the first one found in $PATH), or undef if none.
sub mongod_path {
    return $ENV{MONGOD} if defined $ENV{MONGOD};
    for my $dir (split /:/, $ENV{PATH} // '') {
        return "$dir/mongod" if -f "$dir/mongod" and -x _;
    }
    undef;
}

# Parameters:
#   use_ssl, use_auth: default to $ENV{USE_SSL} and $ENV{USE_AUTH}, which both default to 1
#   plugin_perms, additional_perms: passed to Disbatch::Roles
#   log_file: Log4perl file appender filename, default 'disbatchd.log'
#   config: hash of keys that override or add to the base config
sub new {
    my ($class, %args) = @_;
    my $self = bless {
        use_ssl => $args{use_ssl} // $ENV{USE_SSL} // 1,
        use_auth => $args{use_auth} // $ENV{USE_AUTH} // 1,
        plugin_perms => $args{plugin_perms} // {},
        additional_perms => $args{additional_perms},
        mongoport => get_free_port(),
    }, $class;

    # define config and make up a database name:
    my $config = {
        mongohost => "mongodb://localhost:$self->{mongoport}",
        database => "disbatch_test$$" . int(rand(10000)),
        auth => {
            disbatchd => 'qwerty1',		# { username => 'disbatchd', password => 'qwerty1' },
            disbatch_web => 'qwerty2',	# { username => 'disbatch_web', password => 'qwerty2' },
            task_runner => 'qwerty3',	# { username => 'task_runner', password => 'qwerty3' },
            queuebalance => 'qwerty4',	# { username => 'queuebalance', password => 'qwerty4' },
            plugin => 'qwerty5',		# { username => 'plugin', password => 'qwerty5' },
        },
        gfs => 'auto',	# default, deprecated in 4.4
        log4perl => {
            level => 'TRACE',
            appenders => {
                filelog => {
                    type => 'Log::Log4perl::Appender::File',
                    layout => '[%p] %d %F{1} %L %C %c> %m %n',
                    args => { filename => $args{log_file} // 'disbatchd.log' },
                },
                screenlog => {
                    type => 'Log::Log4perl::Appender::ScreenColoredLevels',
                    layout => '[%p] %d %F{1} %L %C %c> %m %n',
                    args => { },
                }
            }
        },
        %{$args{config} // {}},
    };
    delete $config->{auth} unless $self->{use_auth};
    $config->{mongohost} .= "/?tlsCAFile=t/rootCA.crt&tlsCertificateKeyFile=t/serverCert.pem" if $self->{use_ssl};

    $self->{config} = $config;
    $self->{dir} = "/tmp/$config->{database}";
    $self->{config_file} = "$self->{dir}/config.json";
    mkdir $self->{dir};
    $self->write_config;

    $self;
}

# Writes the config file. Call this again after changing anything in `config` that should be in the file.
sub write_config {
    my ($self) = @_;
    write_file $self->{config_file}, encode_json $self->{config};
}

sub config { $_[0]{config} }
sub config_file { $_[0]{config_file} }
sub dir { $_[0]{dir} }
sub mongoport { $_[0]{mongoport} }
sub use_ssl { $_[0]{use_ssl} }
sub use_auth { $_[0]{use_auth} }

# Starts mongod, then creates the root user, roles, and users (when auth is enabled).
# Returns a MongoDB::Database for the test database, authenticated as root.
sub start {
    my ($self) = @_;
    my $config = $self->{config};

    my @mongo_args = (
        '--logpath' => "$self->{dir}/mongod.log",
        '--dbpath' => "$self->{dir}/",
        '--pidfilepath' => "$self->{dir}/mongod.pid",
        '--port' => $self->{mongoport},
        #'--noprealloc',	# not on 8.2 nor 6.0
        #'--nojournal',	# not on 8.2 but is on 6.0
        '--fork'		# NOTE: fork did not work on whatever 8.2 version I used at work on Rocky 9, but it does on 8.2.4 on my personal Rocky 9
    );
    push @mongo_args, $self->{use_auth} ? '--auth' : '--noauth';
    push @mongo_args, '--tlsMode' => 'requireTLS', '--tlsCertificateKeyFile' => 't/serverCert.pem', '--tlsCAFile' => 't/rootCAcombined.pem' if $self->{use_ssl};
    my $mongo_args = join ' ', @mongo_args;
    my $mongod = mongod_path() // 'mongod';
    say `$mongod $mongo_args`;	# IDEA: use system or IPC::Open3 instead (note from 2016-05-05, it's now 2025)

    # Get test database, authed as root:
    my $attributes = {};
    if ($self->{use_auth}) {
        my $admin = MongoDB->connect($config->{mongohost}, $attributes)->get_database('admin');
        retry { $admin->run_command([createUser => 'root', pwd => $ROOT_PASSWORD, roles => [ { role => 'root', db => 'admin' } ]]) } catch { die $_ };
        $attributes->{username} = 'root';
        $attributes->{password} = $ROOT_PASSWORD;
    }
    $self->{db} = retry { MongoDB->connect($config->{mongohost}, $attributes)->get_database($config->{database}) } catch { die $_ };

    # Create roles and users for a database:
    Disbatch::Roles->new(db => $self->{db}, plugin_perms => $self->{plugin_perms}, additional_perms => $self->{additional_perms}, %{$config->{auth}})->create_roles_and_users if $self->{use_auth};

    $self->{db};
}

# the test database, authenticated as root. only valid after `start`
sub db { $_[0]{db} }

# Kills mongod and removes the temporary directory
sub cleanup {
    my ($self) = @_;
    my $pidfile = "$self->{dir}/mongod.pid";
    if (-e $pidfile) {
        my $mongopid = read_file $pidfile;
        chomp $mongopid;
        kill 9, $mongopid;
    }
    remove_tree $self->{dir};
}

1;
