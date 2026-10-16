#!/usr/bin/env perl

# This software is Copyright (c) 2026 by Ashley Willis.
# This is free software, licensed under:
#   The Apache License, Version 2.0, January 2004

use Test::More;

use 5.12.0;
use warnings;

use Cpanel::JSON::XS;
use Cwd qw/abs_path/;
use File::Path qw/make_path/;
use File::Slurp;
use IPC::Run qw/run timeout/;
use MongoDB 2.2.2;
use Sys::Hostname;
use Time::Moment;

use lib 'lib';
use lib 't';
use Disbatch;
use TestMongo;

if (!$ENV{AUTHOR_TESTING} or $ENV{SKIP_FULL_TESTS}) {
    plan skip_all => 'Skipping author tests';
    exit;
}

my $binary = TestMongo::go_task_runner() // '';
if (!-x $binary) {
    plan skip_all => 'go-task-runner has not been built: (cd go && go build -mod=vendor -o go-task-runner .)';
    exit;
}

if (!TestMongo::mongod_path()) {
    plan skip_all => 'mongod not found';
    exit;
}

# The plugins need to read and update tasks, create results, and use GridFS:
my $plugin_perms = {
    tasks          => [ 'find', 'update' ],
    results        => [ 'insert' ],
    'tasks.files'  => [ 'find', 'insert', 'listIndexes' ],	# FIXME: tests pass without 'listIndexes', but manual testing fails
    'tasks.chunks' => [ 'insert', 'listIndexes' ],		# FIXME: tests pass without 'listIndexes', but manual testing fails
};

my $tm = TestMongo->new(plugin_perms => $plugin_perms);
my $config = $tm->config;

my $temp_dir = "$tm->{dir}/temp";
my $plugin_dir = abs_path('t');
my %plugin_file = (
    file       => "$plugin_dir/task-file.pl",
    collection => "$plugin_dir/task-collection.pl",
    handoff    => "$plugin_dir/task-handoff.pl",
    raw        => "$plugin_dir/task-handoff-raw.pl",	# handoff, but with no validation of its own
    module     => 'Disbatch::Plugin::Test',		# run via `plugin_runner --handoff`
);
# Use the Go versions (from go/t/) of the program plugins, as they start much faster, unless `PERL_PLUGINS=1` or they can't be built:
if (!$ENV{PERL_PLUGINS}) {
    my $go_plugin_dir = "$tm->{dir}/go-plugins";
    local @ENV{qw/ GOFLAGS GOTOOLCHAIN CGO_ENABLED /} = ('-mod=vendor', 'local', 0);
    delete local @ENV{qw/ GOOS GOARCH /};	# they run here
    my $err;
    if (eval { run [ $ENV{GO} // 'go', 'build', '-C', 'go', '-o', "$go_plugin_dir/", './t/...' ], \undef, \my $out, \$err }) {
        $plugin_file{$_} = "$go_plugin_dir/task-$_" for qw/ file collection handoff /;
        $plugin_file{raw} = "$go_plugin_dir/task-handoff-raw";
    } else {
        diag "Could not build the Go test plugins, so using the Perl ones: ", $err || $@;
    }
}
diag "plugins = $plugin_file{file}, $plugin_file{collection}, $plugin_file{handoff}, $plugin_file{raw}";
# `plugin_runner` needs to find `Disbatch` and the Perl module plugin, which is in `t/` so it is not installed:
$ENV{PERL5LIB} = join ':', abs_path('lib'), $plugin_dir, $ENV{PERL5LIB} // ();
$config->{task_runner} = $binary;	# the one being tested, and so it does not log that it is using the Perl one as the default is not installed
$config->{temp_dir} = $temp_dir;
$config->{plugin_runner} = abs_path('bin/task_runner');
$config->{plugins} = {
    $plugin_file{file}       => { type => 'file' },
    $plugin_file{collection} => { type => 'collection' },
    $plugin_file{handoff}    => { type => 'handoff' },
    $plugin_file{raw}        => { type => 'handoff' },
    $plugin_file{module}     => 1,
    'Disbatch::Plugin::NoSuchPlugin' => 1,
};
$config->{log4perl}{appenders}{filelog}{args}{filename} = "$tm->{dir}/disbatchd.log";
$tm->write_config;

diag "database = $config->{database}";

# Start mongod, get test database authed as root, and create roles and users:
my $db = $tm->start;

# Writes `$config_file-task_runner` and `$config_file-plugin`, and creates `temp_dir`:
my $disbatch = Disbatch->new(class => 'Disbatch', config_file => $tm->config_file);
$disbatch->load_config;
$disbatch->save_strict_config;
$disbatch->ensure_indexes;

# Each saved config file has mode 0600, and `-task_runner` and `-plugin` have only their own user's password:
subtest 'save_strict_config' => sub {
    my $auth = $config->{auth} // {};
    my %expected = (
        strict      => $auth,
        task_runner => $tm->use_auth ? { task_runner => $auth->{task_runner} } : {},
        plugin      => $tm->use_auth ? { plugin => $auth->{plugin} } : {},
    );
    for my $suffix (sort keys %expected) {
        my $file = $tm->config_file . "-$suffix";
        is((stat $file)[2] & 07777, 0600, "$suffix mode 0600");
        is_deeply decode_json(scalar read_file $file)->{auth}, $expected{$suffix}, "$suffix auth";
    }

    # A user missing from `auth` gets no passwords at all, not the full `auth`:
    if ($tm->use_auth) {
        my $partial_file = "$tm->{dir}/partial.json";
        write_file $partial_file, encode_json { %$config, auth => { disbatchd => $auth->{disbatchd}, task_runner => $auth->{task_runner} } };
        my $partial = Disbatch->new(class => 'Disbatch', config_file => $partial_file);
        $partial->load_config;
        $partial->save_strict_config;
        is_deeply decode_json(scalar read_file "$partial_file-task_runner")->{auth}, { task_runner => $auth->{task_runner} }, 'partial task_runner auth';
        is_deeply decode_json(scalar read_file "$partial_file-plugin")->{auth}, {}, 'partial plugin auth is empty';
    }
};

my $config_file = $tm->config_file . '-task_runner';
my $node = hostname;
my $json = Cpanel::JSON::XS->new->utf8->canonical;

my $MB = 1024 * 1024;
my $inf = 9**9**9;

my $queue_count = 0;
my $last_output;

# Returns `_id` of new queue
sub new_queue {
    my ($plugin) = @_;
    my $queue = { name => 'queue' . ++$queue_count, threads => 0 };
    $queue->{plugin} = $plugin if defined $plugin;
    $db->coll('queues')->insert_one($queue)->inserted_id;
}

# Returns an `_id` that does not exist in the collection. As documents are inserted with no `_id` so the server makes it, we
# insert one and delete it.
sub unused_id {
    my ($collection) = @_;
    my $id = $db->coll($collection)->insert_one({ name => 'unused' . ++$queue_count })->inserted_id;
    $db->coll($collection)->delete_one({ _id => $id });
    $id;
}

# Returns `_id` of new task, which can be claimed by the runner unless overridden by `%override`
sub new_task {
    my ($queue_id, $params, %override) = @_;
    my $task = {
        status => -1,
        node   => $node,
        mtime  => Time::Moment->now_utc,
        ctime  => Time::Moment->now_utc,
        queue  => $queue_id,
        params => $params,
        %override,
    };
    $db->coll('tasks')->insert_one($task)->inserted_id;
}

# Returns the exit code of the runner. Its output is saved in `$last_output` for diagnostics.
sub run_task {
    my ($task_id) = @_;
    my ($out, $err);
    run [ $binary, '--task', $task_id->to_string, '--config', $config_file, '--quiet' ], \undef, \$out, \$err, timeout(300) or 1;
    $last_output = "STDOUT:\n$out\nSTDERR:\n$err";
    $? >> 8;
}

sub get_task { $db->coll('tasks')->find_one({ _id => $_[0] }) }

# Returns the contents of the GridFS file
sub gfs_content {
    my ($id) = @_;
    open my $fh, '>', \my $content or die $!;
    $db->gfs({ bucket_name => 'tasks' })->download_to_stream($id, $fh);
    close $fh;
    $content;
}

# Compares `stdout` or `stderr` of the task with what was expected. `$expected` is one of:
# * undef: field must be null
# * a Regexp: field must match it
# * an ARRAY `[ 'gfs', $content ]`: field must be the _id of a GridFS file with this content
# * a HASH: field must be Extended JSON of this
# * a string: field must be this
sub check_field {
    my ($task, $field, $expected) = @_;
    my $value = $task->{$field};
    if (!defined $expected) {
        ok !defined $value, "$field is null" or diag explain $value;
    } elsif (ref $expected eq 'Regexp') {
        like $value, $expected, "$field matches";
    } elsif (ref $expected eq 'ARRAY') {
        my $content = $expected->[1];
        if (isa_ok $value, 'BSON::OID', "$field") {
            # NOTE: GridFS content is stored by either the Go or Perl MongoDB driver, and `gfs_content()` returns it using the driver.
            # However, we want to test that the custom Disbatch implementation returns it correctly (and the driver test seems superfluous)
            #ok gfs_content($value) eq $content, "$field in GridFS is " . length($content) . ' bytes as expected';
            ok $disbatch->get_gfs($value) eq $content, "$field in GridFS is " . length($content) . ' bytes as expected';
        }
    } elsif (ref $expected eq 'HASH') {
        my $got = eval { decode_json($value // '') };
        is_deeply $got, $expected, "$field is Extended JSON of the plugin's result" or diag explain $value;
    } else {
        is $value, $expected, "$field";
    }
}

# Runs one task with the given plugin type and params, and checks the runner's exit code and the task document.
# * $type: file, collection, handoff, or raw (a handoff plugin that does no validation of its own)
# * %expect: status (required), stdout, stderr (see `check_field`), exit (of the runner, default 0),
#            cmd_exit and cmd_err (what the runner saw from the plugin, default `0` and `<nil>`)
sub check_task {
    my ($type, $name, $params, %expect) = @_;
    my $ok = subtest "$type: $name" => sub {
        my $queue_id = new_queue($plugin_file{$type});
        my $task_id = new_task($queue_id, $params);
        my $id = $task_id->to_string;

        is run_task($task_id), $expect{exit} // 0, 'runner exit code';

        my $task = get_task($task_id);
        is $task->{status}, $expect{status}, 'status';
        check_field($task, 'stdout', $expect{stdout});
        check_field($task, 'stderr', $expect{stderr});
        is $task->{cmdExit}, $expect{cmd_exit} // 0, 'cmdExit';
        is $task->{cmdErr}, $expect{cmd_err} // '<nil>', 'cmdErr';

        if ($type eq 'file') {
            ok !-e "$temp_dir/$id.json", 'task file removed';
            ok !-e "$temp_dir/$id-response.json", 'response file removed';
        } elsif ($type eq 'collection') {
            ok !$db->coll('results')->find_one({ _id => $task_id }), 'result document removed';
        }
    };
    diag $last_output unless $ok;
}

# For tasks the runner does not start a plugin for: it sets status 2 and "Unable to start" in stdout.
sub check_unable_to_start {
    my ($name, $plugin, $stderr, %task_override) = @_;
    my $ok = subtest "unable to start: $name" => sub {
        my $queue_id = new_queue($plugin);
        my $task_id = new_task($task_override{queue} // $queue_id, { status => 1 });
        is run_task($task_id), 0, 'runner exit code';
        my $task = get_task($task_id);
        is $task->{status}, 2, 'status';
        is $task->{stdout}, 'Unable to start', 'stdout';
        like $task->{stderr}, $stderr, 'stderr';
        ok !exists $task->{cmdExit}, 'no cmdExit';
        ok !exists $task->{cmdErr}, 'no cmdErr';
        ok !-e "$temp_dir/" . $task_id->to_string . '.json', 'no task file';
    };
    diag $last_output unless $ok;
}

my @types = qw/ file collection handoff /;

my ($out, $err) = ('out', 'err');

for my $type (@types) {
    # "success": status 1, clean exit
    check_task $type, 'success', { status => 1, stdout => $out, stderr => $err },
        status => 1, stdout => $out, stderr => $err;

    # "plugin failure": status greater than 1, clean exit
    check_task $type, 'plugin failure', { status => 2, stdout => $out, stderr => $err },
        status => 2, stdout => $out, stderr => $err;
    check_task $type, 'plugin failure with another status', { status => 44, stdout => $out, stderr => $err },
        status => 44, stdout => $out, stderr => $err;

    # still a failure, but the runner logs a warning
    check_task $type, 'status > 1 but non-zero exit', { status => 2, stdout => $out, stderr => $err, exit => 3, wait => 1 },
        status => 2, stdout => $out, stderr => $err, cmd_exit => 3, cmd_err => 'exit status 3';

    # status 1 but non-zero exit becomes status 2, with the plugin's result in stdout
    check_task $type, 'status 1 but non-zero exit', { status => 1, stdout => $out, stderr => $err, exit => 3, wait => 1 },
        status => 2, stdout => { status => 1, stdout => $out, stderr => $err }, stderr => qr/^plugin returned status:1 but did not exit cleanly/,
        cmd_exit => 3, cmd_err => 'exit status 3';
}

# invalid `status`: becomes status 2, with the plugin's result in stdout as Extended JSON.
# `handoff` plugins are run via `raw` here, as `t/task-handoff.pl` fixes up the status itself.
# For `handoff`, a missing status needs to be unset, as it is otherwise 0.
my $unknown_type = qr/^plugin returned unknown type for status/;
my $non_positive = qr/^plugin returned non-positive status/;
my $negative = qr/^plugin returned negative status/;
my $not_updated = qr/^plugin did not update status/;
my @bad_status = (
    # name              status params                          result in stdout                      stderr           handoff stderr
    [ 'missing',        {},                                    {},                                   $unknown_type,   $unknown_type ],
    [ 'string',         { status => 'fizz' },                  { status => 'fizz' },                 $unknown_type,   $unknown_type ],
    [ 'non-integer',    { status => 1.5 },                     { status => 1.5 },                    $unknown_type,   $unknown_type ],
    [ 'infinite',       { status => $inf },                    { status => { '$numberDouble' => 'Infinity' } }, $unknown_type, $unknown_type ],
    [ 'zero',           { status => 0 },                       { status => 0 },                      $non_positive,   $not_updated ],
    [ 'negative',       { status => -1 },                      { status => -1 },                     $non_positive,   $negative ],
);
for my $bad (@bad_status) {
    my ($name, $status, $result, $stderr, $handoff_stderr) = @$bad;
    my %params = (stdout => $out, stderr => $err);
    for my $type (@types) {
        # an infinite status is not valid JSON, so it can't make it to a `file` plugin or back
        next if $name eq 'infinite' and $type eq 'file';

        my %expect_result = (%$result, stdout => $out, stderr => $err);
        if ($type eq 'handoff') {
            my %p = (%$status, %params, $name eq 'missing' ? (unset_status => 1) : ());
            check_task 'raw', "$name status", \%p, status => 2, stdout => { %expect_result }, stderr => $handoff_stderr;
        } else {
            check_task $type, "$name status", { %$status, %params }, status => 2, stdout => { %expect_result }, stderr => $stderr;
        }
    }
}

# plugin did not leave a response for the task runner
for my $type (qw/ file /) {
    my $missing = qr/^could not read task plugin response file/;
    check_task $type, 'response file missing after exiting cleanly', { exit => 0 }, status => 2, stderr => $missing;
    check_task $type, 'response file missing after non-zero exit', { exit => 3 }, status => 2, stderr => $missing,
        cmd_exit => 3, cmd_err => 'exit status 3';
    check_task $type, 'response file not valid JSON', { raw_response => 'this is not json' },
        status => 2, stdout => 'this is not json', stderr => qr/^plugin saved non-json in response file/;
    check_task $type, 'response file has an out of range status', { raw_response => '{"status":1e999}' },
        status => 2, stdout => '{"status":1e999}', stderr => qr/^plugin saved non-json in response file/;
    check_task $type, 'keys other than status, stdout and stderr in response file are ignored',
        { raw_response => '{"status":1,"stdout":"out","noise":"bar"}' }, status => 1, stdout => $out, stderr => undef;
}

check_task 'collection', 'plugin did not create a result', { no_result => 1 },
    status => 2, stderr => qr/^plugin did not create a document in 'results'/;

check_task 'raw', 'plugin did not update status', { },
    status => 2, stdout => { status => 0 }, stderr => $not_updated;

# set `QUICK=1` to skip these, as each starts `bin/task_runner`, which is slow to load
if (!$ENV{QUICK}) {
    # Perl module plugins are run via `plugin_runner --handoff` (`bin/task_runner`), which validates the result and writes it.
    # An invalid `status` becomes 2, keeping `stdout` and `stderr`.
    check_task 'module', 'success', { status => 1, stdout => $out, stderr => $err },
        status => 1, stdout => $out, stderr => $err;
    check_task 'module', 'plugin failure', { status => 2, stdout => $out, stderr => $err },
        status => 2, stdout => $out, stderr => $err;
    check_task 'module', 'plugin failure with another status', { status => 44, stdout => $out, stderr => $err },
        status => 44, stdout => $out, stderr => $err;
    check_task 'module', 'string status', { status => 'fizz', stdout => $out, stderr => $err },
        status => 2, stdout => $out, stderr => $err;
    check_task 'module', 'zero status', { status => 0, stdout => $out, stderr => $err },
        status => 2, stdout => $out, stderr => $err;
    check_task 'module', 'negative status', { status => -1, stdout => $out, stderr => $err },
        status => 2, stdout => $out, stderr => $err;
    check_task 'module', 'plugin dies', { die => "boom\n" },
        status => 2, stdout => 'Unable to complete', stderr => "Thread has uncaught exception: boom\n";
    check_task 'module', 'plugin exits before returning', { exit => 3 },
        status => 2, stdout => { status => 0 }, stderr => $not_updated, cmd_exit => 3, cmd_err => 'exit status 3';
    {
        my $ok = subtest 'module: plugin not found' => sub {
            my $task_id = new_task(new_queue('Disbatch::Plugin::NoSuchPlugin'), { status => 1 });
            is run_task($task_id), 0, 'runner exit code';
            my $task = get_task($task_id);
            is $task->{status}, 2, 'status';
            is $task->{stdout}, 'Unable to start', 'stdout';
            like $task->{stderr}, qr/^Disbatch::Plugin::NoSuchPlugin not found for task /, 'stderr';
            is $task->{cmdExit}, 0, 'cmdExit';
        };
        diag $last_output unless $ok;
    }
}

# output over 15MB combined goes to GridFS. `stderr` is kept in the task document if it fits, as it is the one more likely to be parsed
# set `GFS_TESTS=none` (or `QUICK=1`) to skip these, which are the slowest
for my $type ($ENV{QUICK} || ($ENV{GFS_TESTS} // '') eq 'none' ? () : (@types, 'module')) {
    check_task $type, 'stdout and stderr combined of 15MB stay in the task', { status => 1, large_stderr => 7*$MB, large_stdout => 8*$MB },
        status => 1, stdout => 'x' x (8*$MB), stderr => 'x' x (7*$MB);
    check_task $type, 'stdout goes to GridFS when over 15MB combined', { status => 1, large_stderr => 1*$MB, large_stdout => 15*$MB },
        status => 1, stdout => [ gfs => 'x' x (15*$MB) ], stderr => 'x' x (1*$MB);
    check_task $type, 'stderr over 15MB sends stdout to GridFS too', { status => 1, stdout => $out, large_stderr => 16*$MB },
        status => 1, stdout => [ gfs => $out ], stderr => [ gfs => 'x' x (16*$MB) ];
}

# tasks that can't be claimed are left alone
for my $case (
    [ 'on another node', { node => "not-$node" }, -1 ],
    [ 'with status 0',   { status => 0 },         0 ],
    [ 'with status 1',   { status => 1 },         1 ],
    [ 'with status -2',  { status => -2 },        -2 ],
) {
    my ($name, $override, $status) = @$case;
    my $ok = subtest "cannot claim task $name" => sub {
        my $queue_id = new_queue($plugin_file{file});
        my $task_id = new_task($queue_id, { status => 1 }, %$override);
        my $before = get_task($task_id);
        is run_task($task_id), 1, 'runner exit code';
        is_deeply get_task($task_id), $before, 'task untouched';
        is $before->{status}, $status, 'status';
    };
    diag $last_output unless $ok;
}

# a non-existent task is not claimed either
{
    my $ok = subtest 'cannot claim task that does not exist' => sub {
        is run_task(unused_id('tasks')), 1, 'runner exit code';
    };
    diag $last_output unless $ok;
}

# tasks that can't be started get status 2 and "Unable to start"
{
    my $missing_queue = unused_id('queues');
    check_unable_to_start 'queue not found', $plugin_file{file}, qr/^queue ObjectID\("\Q$missing_queue\E"\) not found for task /, queue => $missing_queue;
}
check_unable_to_start 'queue has no plugin', undef, qr/^no plugin defined for task /;
check_unable_to_start 'plugin is not an absolute path', 't/task-file.pl', qr/^plugin value 't\/task-file.pl' for task \w+ must be a full path/;
check_unable_to_start 'plugin does not exist', "$temp_dir/does-not-exist.pl", qr/^\Q$temp_dir\E\/does-not-exist.pl not found or not executable for task /;
{
    my $not_executable = "$temp_dir/not-executable.pl";
    open my $fh, '>', $not_executable or die "Could not create $not_executable: $!";
    print $fh "#!/bin/sh\nexit 0\n";
    close $fh;
    chmod 0644, $not_executable;
    check_unable_to_start 'plugin is not executable', $not_executable, qr/^\Q$not_executable\E not found or not executable for task /;
}
{
    # executable, but not in `config.plugins`, so it has no type
    my $copy = "$temp_dir/unlisted.sh";
    open my $fh, '>', $copy or die "Could not create $copy: $!";
    print $fh "#!/bin/sh\nexit 0\n";
    close $fh;
    chmod 0755, $copy;
    check_unable_to_start 'plugin is not in config.plugins', $copy, qr/^\Q$copy\E has unknown type '' for task /;
}

# `disbatchd` validates the plugin of each queue against `config.plugins`. A valid plugin is defined in `{plugins}`, one
# that cannot be loaded exists but is undefined (its queues are ignored), and an invalid one does not exist (only logged).
subtest 'validate_plugins' => sub {
    $db->coll('queues')->delete_many({});

    my $not_executable = "$temp_dir/validate-not-executable.sh";
    open my $fh, '>', $not_executable or die "Could not create $not_executable: $!";
    print $fh "#!/bin/sh\nexit 0\n";
    close $fh;
    chmod 0644, $not_executable;

    my %plugins = (
        $plugin_file{file}               => [ {}, 'valid' ],
        'Disbatch::Plugin::Demo'         => [ 1, 'valid' ],
        't/task-file.pl'                 => [ {}, 'invalid' ],	# not a full path
        $plugin_file{collection}         => [ { type => 'bogus' }, 'invalid' ],
        $not_executable                  => [ {}, 'ignored' ],
        'Disbatch::Plugin::NoSuchPlugin' => [ 1, 'ignored' ],
        'Bad Name!'                      => [ 1, 'invalid' ],
        $plugin_file{handoff}            => [ 0, 'invalid' ],	# neither `1` nor an object
    );

    my $den = Disbatch->new(class => 'Disbatch', config_file => $tm->config_file);
    $den->load_config;
    $den->{config}{plugins} = { map { $_ => $plugins{$_}[0] } keys %plugins };
    $db->coll('queues')->insert_one({ name => "validate$_", plugin => (sort keys %plugins)[$_], threads => 0 }) for 0 .. keys(%plugins) - 1;
    $den->validate_plugins;

    for my $plugin (sort keys %plugins) {
        my $expected = $plugins{$plugin}[1];
        if ($expected eq 'valid') {
            is $den->{plugins}{$plugin}, $plugin, "$plugin is valid";
        } elsif ($expected eq 'ignored') {
            ok exists $den->{plugins}{$plugin} && !defined $den->{plugins}{$plugin}, "$plugin is ignored";
        } else {
            ok !exists $den->{plugins}{$plugin}, "$plugin is invalid";
        }
    }
    is $den->{config}{plugins}{$plugin_file{file}}{type}, 'file', 'type defaults to file';
};

done_testing;

END {
    # Cleanup:
    $tm->cleanup if defined $tm;
}

__END__

=encoding utf8

=head1 NAME

t/003_go_task_runner.t - test C<go-task-runner> against a real MongoDB, running real plugins.

=head1 USAGE

Build C<go-task-runner> first. C<Makefile.PL> builds it as C<go/go-task-runner> if Go is installed (so C<dzil test> has it),
or you can build it by hand:

    (cd go && go build -mod=vendor -o go-task-runner .)

Then run the test with the following:

    AUTHOR_TESTING=1 prove -v t/003_go_task_runner.t

This starts its own C<mongod> (found via C<$PATH>, or set C<MONGOD>), but does not start C<disbatchd> or the web interface.
It runs C<go-task-runner> directly for each task, with C<--task>, C<--config>, and C<--quiet>, and checks the
task document afterwards. It uses C<$ENV{GO_TASK_RUNNER}>, or C<go/go-task-runner>, or an installed C</usr/bin/go-task-runner>.

You can disable MongoDB TLS and authentication like with F<t/002_full.t>:

    USE_SSL=0 USE_AUTH=0 AUTHOR_TESTING=1 prove -v t/003_go_task_runner.t

The plugins are F<t/task-file.pl>, F<t/task-collection.pl>, F<t/task-handoff.pl>, and
F<t/task-handoff-raw.pl>, and the Perl module plugin C<Disbatch::Plugin::Test> (F<t/Disbatch/Plugin/Test.pm>), which is
run via C<bin/task_runner --handoff>. They are told what to return via the C<params> of the task: see F<t/ParamsResult.pm>.

The program plugins have Go versions in F<go/t/>, which this builds and uses instead, as they start much faster. It uses
the Perl ones if they can't be built (such as when Go is not installed), or with C<PERL_PLUGINS=1>:

    PERL_PLUGINS=1 AUTHOR_TESTING=1 prove -v t/003_go_task_runner.t

To quickly check that C<go-task-runner> is not badly broken, C<QUICK=1> skips the slowest tests: those of the Perl module
plugin (each starts C<bin/task_runner>) and those of GridFS. It still runs every other test of the program plugins.

    QUICK=1 AUTHOR_TESTING=1 prove -v t/003_go_task_runner.t

=head1 AUTHORS

Ashley Willis <consul-5flap@icloud.com>

=head1 COPYRIGHT AND LICENSE

This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004
