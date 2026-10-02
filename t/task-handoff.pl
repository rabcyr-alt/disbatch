#!/usr/bin/perl

use 5.12.0;
use warnings;

use BSON::OID;
use Cpanel::JSON::XS;
use Data::Dumper;
use Encode;
use File::Slurp;
use Getopt::Long;
use IO::Select;
use IPC::Open3;
use Log::Log4perl;
use MongoDB;
use Try::Tiny::Retry;
use Safe::Isa;
use Symbol 'gensym';
use Sys::Hostname;

use lib '.';
use ParamsResult;

$| = 1;

my ($task_id, $config_file, $quiet);

GetOptions(
    'task=s'     => \$task_id,
    'config=s'   => \$config_file,
    'quiet'      => \$quiet,
);

$quiet //= 0;

die "Config file must be passed with --config option\n" unless defined $config_file;
die "No --task\n" unless defined $task_id;

my $loggers_configured = 0;

my $json = Cpanel::JSON::XS->new->utf8->convert_blessed;

my $config = $json->decode(scalar read_file $config_file);
my $node = hostname;
my $mongo = mongo($config, 'task_runner');
my $logger = logger($config, 'task_runner');	# NOTE: my plugins did not use logger. i left it here for processing `$result` as that's what the standard task_runner does.

my $oid = try { BSON::OID->new(oid => pack 'H*', $task_id) } catch { die "--task value error: $_" };
my $doc = retry {
    $mongo->coll('tasks')->find_one({_id => $oid, status => 0, node => $node});
} catch {
    die "Could not find task $task_id with status 0 on node $node: $_\n";
};

die "No task found for $task_id\n" unless defined $doc;

my ($result, $extra) = ParamsResult::params2result($doc->{params});
$quiet = $extra->{quiet} if exists $extra->{quiet};

# verify $result is a HASH and $result->{status} is a postive integer, and if not fail task
if (ref $result ne 'HASH') {
    $logger->error("Task $oid did not return a HASH");
    my $bad = { status => 2, stdout => Dumper($result), stderr => 'Task did not return a HASH. See stdout for Dumper result'};
    $result = $bad;
}
if (ref $result->{status}) {
    $logger->error("Task $oid returned a ref as status: ", Dumper $result->{status});
    $result->{status} = 2;
}
if ($result->{status} !~ /^[1-9]\d*$/) {
    $logger->error("Task $oid returned other than a positive integer as status: '$result->{status}'");
    $result->{status} = 2;
}
$result->{status} += 0;		# force integer-as-string to integer

my $status = $result->{status} == 1 ? 'succeeded' : 'failed';
$logger->info("Task $task_id $status.");
if (!$quiet) {
    my $stdout = $result->{stdout} // 'null';
    chomp $stdout;
    warn "STDOUT: $stdout\n";
    my $stderr = $result->{stderr} // 'null';
    chomp $stderr;
    warn "STDERR: $stderr\n";
}

# set status first:
retry { $mongo->coll('tasks')->update_one({_id => $oid, status => 0, node => $node}, {'$set' => {status => $result->{status}}}) }
catch { $logger->logdie("Could not update task $task_id status to $result->{status} after completion: $_") };

# set rest of result:
# GridFS: this prefers `stderr` as a string in the task document even when it's large, as on failures `stderr` is more likely needed to be parsed
#         if `stderr` ends up in GridFS, so will `stdout` (unless it is empty)
my $total = 0;
for my $field (qw/ stderr stdout /) {
    my $size = defined $result->{$field} ? length encode_utf8($result->{$field}) : 0;
    $total += $size;
    if ($size and $total > 1024*1024*15) {
        my $id = retry { put_gfs($result->{$field}, $field, { task_id => $oid }) } retry_if { !/^MongoDB::DatabaseError: not authorized on / }
                catch { $logger->error("Could not create GridFS content for task $oid $field: $_"); undef; };
        $result->{$field} = $id;
    }
}

retry { $mongo->coll('tasks')->update_one({_id => $oid, status => $result->{status}, node => $node}, {'$set' => {stdout => $result->{stdout}, stderr => $result->{stderr}, complete => Cpanel::JSON::XS::true}}) }
on_retry {
    $logger->warn("Update to stdout/stderr failed for task $task_id: $_");
    # MongoDB::WriteError: Resulting document after update is larger than 16777216
    # MongoDB::DocumentError: Document exceeds maximum size 16777216
    $result->{stdout} = "$_" if $_->$_isa('MongoDB::DocumentError') or $_->$_isa('MongoDB::WriteError');
} catch {
    $mongo->coll('tasks')->update_one({_id => $oid, status => $result->{status}, node => $node}, {'$set' => {complete => Cpanel::JSON::XS::false}});
    $logger->logdie("Could not update task $task_id stdout/stderr after completion: $_")
};

for my $key (keys %$extra) {
    if ($key eq 'kill') {
        `kill -$extra->{$key} $$`;
    } elsif ($key eq 'die') {
        die $extra->{$key};
    } elsif ($key eq 'exit') {
        exit $extra->{$key};
    }
}

sub mongo {
    my ($config, $class) = @_;
    my %attributes = %{$config->{attributes}};
    if (keys %{$config->{auth}}) {
        $attributes{username} = 'plugin';
        $attributes{password} = $config->{auth}{plugin};
        $attributes{db_name} = $config->{database};
    }
    warn "Connecting ", scalar(localtime), "\n";
    MongoDB->connect($config->{mongohost}, \%attributes)->get_database($config->{database});
}

sub logger {
    my ($config, $logger) = @_;
    return Log::Log4perl->get_logger($logger) if $loggers_configured;
    my $lg = Log::Log4perl->get_logger('');
    $lg->level($config->{log4perl}{level});
    my $default_layout = "[%p] %d %F{1} %L %C %c> %m %n";
    for my $name (keys %{$config->{log4perl}{appenders}}) {
        my $ap = Log::Log4perl::Appender->new($config->{log4perl}{appenders}{$name}{type}, name => $name, %{$config->{log4perl}{appenders}{$name}{args}});
        $ap->layout(Log::Log4perl::Layout::PatternLayout->new($config->{log4perl}{appenders}{$name}{layout} // $default_layout));
        $lg->add_appender($ap);
    }
    $loggers_configured = 1;
    Log::Log4perl->get_logger($logger);
}

sub put_gfs {
    my ($content, $filename, $metadata) = @_;
    my $gfs = $mongo->gfs({bucket_name => 'tasks'});
    my $stream = $gfs->open_upload_stream($filename, { metadata => $metadata });
    $stream->print($content);
    $stream->close;
    $stream->id;
}
