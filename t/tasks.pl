#!/usr/bin/perl

use 5.12.0;
use warnings;

use Cpanel::JSON::XS;
use Data::Dumper;

use lib 'lib';
use Disbatch::Web;

my @params;
push @params, {};
push @params, { stdout => 'no status', stderr => 'no status' };
push @params, { status => 1, stdout => 'success' };
push @params, { status => 2, stderr => 'failed' };
# non-standard status: "1" succeeded, 3 and 4 failed, rest error and failed with status set as 2
push @params, { status => $_ } for ("1", 3, 44, undef, 0, -9, "fizz", {}, [], '{"json":"true"}');
# NOTE: stdout and stderr should be strings (or undef), and encode_utf8() is called on these
push @params, { status => 1, stdout => $_, stderr => $_ } for (undef, -1, '', {hash=>[1,2,'hi']}, [1,2,'hi',{hash=>1}]);
# * large_stdout and large_stderr
push @params, { status => 1, large_stdout => $_->[0], large_stderr => $_->[1] } for (
    [1024*1024*1, 1024*1024*14],	# task, task
    [1024*1024*1, 1024*1024*15],	# task, grid
    [1024*1024*0, 1024*1024*16],	# task, grid
    [1024*1024*7, 1024*1024*8],		# task, task
    [1024*1024*8, 1024*1024*8],		# grid, task

    [1024*1024*14, 1024*1024*1],	# task, task
    [1024*1024*15, 1024*1024*1],	# grid, task
    [1024*1024*16, 1024*1024*0],	# grid, task
    [1024*1024*8, 1024*1024*7],		# task, task
    [1024*1024*16, 1024*1024*16]	# grid, grid
);

#say Dumper \@params;
say scalar @params;

say Cpanel::JSON::XS->new->encode(\@params);

#my $queue;	# name or _id
#my $tasks = { queue => $queue, params => \@params };


__END__

./bin/disbatch --disable_ssl_verification

create-queue <name> <plugin>
update-queue <queue> <field> <value> [<field> <value> ...]
create-task <queue> [<key> <value> ...]
create-tasks <queue> <array_of_params>
tasks [<json_filter>] [[--limit <limit>] [--skip <skip>] [--fields <fields>] [--terse] [--epoch] [--pretty] | [--count]]
$ disbatch tasks '{"queue":"56eade3aeb6af81e0123ed21"}'

-------

./bin/disbatch --disable_ssl_verification create-queue default /root/git/disbatch/t/task-default.pl
./bin/disbatch --disable_ssl_verification create-queue nomongo /root/git/disbatch/t/task-nomongo.pl
./bin/disbatch --disable_ssl_verification create-queue mongo /root/git/disbatch/t/task-mongo.pl
./bin/disbatch --disable_ssl_verification create-queue handoff /root/git/disbatch/t/task-handoff.pl
./bin/disbatch --disable_ssl_verification create-queue test Disbatch::Plugin::Test

./bin/disbatch --disable_ssl_verification create-tasks default '[{},{"stderr":"no status","stdout":"no status"},{"stdout":"success","status":1},{"status":2,"stderr":"failed"},{"status":"1"},{"status":3},{"status":44},{"status":null},{"status":0},{"status":-9},{"status":"fizz"},{"status":{}},{"status":[]},{"status":"{\"json\":\"true\"}"},{"stderr":null,"status":1,"stdout":null},{"stderr":-1,"status":1,"stdout":-1},{"stderr":"","status":1,"stdout":""},{"stdout":{"hash":[1,2,"hi"]},"stderr":{"hash":[1,2,"hi"]},"status":1},{"status":1,"stderr":[1,2,"hi",{"hash":1}],"stdout":[1,2,"hi",{"hash":1}]},{"large_stdout":1048576,"status":1,"large_stderr":14680064},{"large_stdout":1048576,"status":1,"large_stderr":15728640},{"large_stdout":0,"large_stderr":16777216,"status":1},{"large_stdout":7340032,"large_stderr":8388608,"status":1},{"status":1,"large_stderr":8388608,"large_stdout":8388608},{"large_stderr":1048576,"status":1,"large_stdout":14680064},{"large_stdout":15728640,"status":1,"large_stderr":1048576},{"large_stdout":16777216,"large_stderr":0,"status":1},{"large_stdout":8388608,"status":1,"large_stderr":7340032},{"status":1,"large_stderr":16777216,"large_stdout":16777216}]'
./bin/disbatch --disable_ssl_verification create-tasks nomongo '[{},{"stderr":"no status","stdout":"no status"},{"stdout":"success","status":1},{"status":2,"stderr":"failed"},{"status":"1"},{"status":3},{"status":44},{"status":null},{"status":0},{"status":-9},{"status":"fizz"},{"status":{}},{"status":[]},{"status":"{\"json\":\"true\"}"},{"stderr":null,"status":1,"stdout":null},{"stderr":-1,"status":1,"stdout":-1},{"stderr":"","status":1,"stdout":""},{"stdout":{"hash":[1,2,"hi"]},"stderr":{"hash":[1,2,"hi"]},"status":1},{"status":1,"stderr":[1,2,"hi",{"hash":1}],"stdout":[1,2,"hi",{"hash":1}]},{"large_stdout":1048576,"status":1,"large_stderr":14680064},{"large_stdout":1048576,"status":1,"large_stderr":15728640},{"large_stdout":0,"large_stderr":16777216,"status":1},{"large_stdout":7340032,"large_stderr":8388608,"status":1},{"status":1,"large_stderr":8388608,"large_stdout":8388608},{"large_stderr":1048576,"status":1,"large_stdout":14680064},{"large_stdout":15728640,"status":1,"large_stderr":1048576},{"large_stdout":16777216,"large_stderr":0,"status":1},{"large_stdout":8388608,"status":1,"large_stderr":7340032},{"status":1,"large_stderr":16777216,"large_stdout":16777216}]'
./bin/disbatch --disable_ssl_verification create-tasks mongo '[{},{"stderr":"no status","stdout":"no status"},{"stdout":"success","status":1},{"status":2,"stderr":"failed"},{"status":"1"},{"status":3},{"status":44},{"status":null},{"status":0},{"status":-9},{"status":"fizz"},{"status":{}},{"status":[]},{"status":"{\"json\":\"true\"}"},{"stderr":null,"status":1,"stdout":null},{"stderr":-1,"status":1,"stdout":-1},{"stderr":"","status":1,"stdout":""},{"stdout":{"hash":[1,2,"hi"]},"stderr":{"hash":[1,2,"hi"]},"status":1},{"status":1,"stderr":[1,2,"hi",{"hash":1}],"stdout":[1,2,"hi",{"hash":1}]},{"large_stdout":1048576,"status":1,"large_stderr":14680064},{"large_stdout":1048576,"status":1,"large_stderr":15728640},{"large_stdout":0,"large_stderr":16777216,"status":1},{"large_stdout":7340032,"large_stderr":8388608,"status":1},{"status":1,"large_stderr":8388608,"large_stdout":8388608},{"large_stderr":1048576,"status":1,"large_stdout":14680064},{"large_stdout":15728640,"status":1,"large_stderr":1048576},{"large_stdout":16777216,"large_stderr":0,"status":1},{"large_stdout":8388608,"status":1,"large_stderr":7340032},{"status":1,"large_stderr":16777216,"large_stdout":16777216}]'
./bin/disbatch --disable_ssl_verification create-tasks handoff '[{},{"stderr":"no status","stdout":"no status"},{"stdout":"success","status":1},{"status":2,"stderr":"failed"},{"status":"1"},{"status":3},{"status":44},{"status":null},{"status":0},{"status":-9},{"status":"fizz"},{"status":{}},{"status":[]},{"status":"{\"json\":\"true\"}"},{"stderr":null,"status":1,"stdout":null},{"stderr":-1,"status":1,"stdout":-1},{"stderr":"","status":1,"stdout":""},{"stdout":{"hash":[1,2,"hi"]},"stderr":{"hash":[1,2,"hi"]},"status":1},{"status":1,"stderr":[1,2,"hi",{"hash":1}],"stdout":[1,2,"hi",{"hash":1}]},{"large_stdout":1048576,"status":1,"large_stderr":14680064},{"large_stdout":1048576,"status":1,"large_stderr":15728640},{"large_stdout":0,"large_stderr":16777216,"status":1},{"large_stdout":7340032,"large_stderr":8388608,"status":1},{"status":1,"large_stderr":8388608,"large_stdout":8388608},{"large_stderr":1048576,"status":1,"large_stdout":14680064},{"large_stdout":15728640,"status":1,"large_stderr":1048576},{"large_stdout":16777216,"large_stderr":0,"status":1},{"large_stdout":8388608,"status":1,"large_stderr":7340032},{"status":1,"large_stderr":16777216,"large_stdout":16777216}]'
./bin/disbatch --disable_ssl_verification create-tasks test '[{},{"stderr":"no status","stdout":"no status"},{"stdout":"success","status":1},{"status":2,"stderr":"failed"},{"status":"1"},{"status":3},{"status":44},{"status":null},{"status":0},{"status":-9},{"status":"fizz"},{"status":{}},{"status":[]},{"status":"{\"json\":\"true\"}"},{"stderr":null,"status":1,"stdout":null},{"stderr":-1,"status":1,"stdout":-1},{"stderr":"","status":1,"stdout":""},{"stdout":{"hash":[1,2,"hi"]},"stderr":{"hash":[1,2,"hi"]},"status":1},{"status":1,"stderr":[1,2,"hi",{"hash":1}],"stdout":[1,2,"hi",{"hash":1}]},{"large_stdout":1048576,"status":1,"large_stderr":14680064},{"large_stdout":1048576,"status":1,"large_stderr":15728640},{"large_stdout":0,"large_stderr":16777216,"status":1},{"large_stdout":7340032,"large_stderr":8388608,"status":1},{"status":1,"large_stderr":8388608,"large_stdout":8388608},{"large_stderr":1048576,"status":1,"large_stdout":14680064},{"large_stdout":15728640,"status":1,"large_stderr":1048576},{"large_stdout":16777216,"large_stderr":0,"status":1},{"large_stdout":8388608,"status":1,"large_stderr":7340032},{"status":1,"large_stderr":16777216,"large_stdout":16777216}]'

./bin/disbatch --disable_ssl_verification update-queue default sort fifo threads 1
./bin/disbatch --disable_ssl_verification update-queue nomongo sort fifo threads 1
./bin/disbatch --disable_ssl_verification update-queue mongo sort fifo threads 1
./bin/disbatch --disable_ssl_verification update-queue handoff sort fifo threads 1
./bin/disbatch --disable_ssl_verification update-queue test sort fifo threads 1
