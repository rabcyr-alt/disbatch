#!/usr/bin/env perl

# This software is Copyright (c) 2016, 2019 by Ashley Willis.
# This is free software, licensed under:
#   The Apache License, Version 2.0, January 2004

use Test::More;

use 5.12.0;
use warnings;

use Cpanel::JSON::XS;
use Data::Dumper;
use File::Path qw/remove_tree/;
use File::Slurp;
use MongoDB 2.2.2;
use Net::HTTP::Client;
use POSIX qw(setsid);
use Sys::Hostname;
use Try::Tiny::Retry ':all';

use lib 'lib';
use Disbatch;
use Disbatch::Roles;
use Disbatch::Web;

my $use_ssl = $ENV{USE_SSL} // 1;
my $use_auth = $ENV{USE_AUTH} // 1;

if (!$ENV{AUTHOR_TESTING} or $ENV{SKIP_FULL_TESTS}) {
    plan skip_all => 'Skipping author tests';
    exit;
}

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

my $mongoport = get_free_port;

# define config and make up a database name:
my $config = {
    monitoring => 1,
    balance => {
        log => 1,
        verbose => 0,
        pretend => 0,
        enabled => 0,
    },
    mongohost => "localhost:$mongoport",
    database => "disbatch_test$$" . int(rand(10000)),
    attributes => { ssl => { SSL_ca_file => 't/rootCA.crt', SSL_cert_file => 't/serverCert.pem' } },
    auth => {
        disbatchd => 'qwerty1',		# { username => 'disbatchd', password => 'qwerty1' },
        disbatch_web => 'qwerty2',	# { username => 'disbatch_web', password => 'qwerty2' },
        task_runner => 'qwerty3',	# { username => 'task_runner', password => 'qwerty3' },
        queuebalance => 'qwerty4',	# { username => 'queuebalance', password => 'qwerty4' },
        plugin => 'qwerty5',		# { username => 'plugin', password => 'qwerty5' },
    },
    plugins => [ 'Disbatch::Plugin::Demo' ],
    web_extensions => {
    },
    web_root => 'etc/disbatch/htdocs/',
    views_dir => 'etc/disbatch/views/',
    task_runner => './bin/task_runner',
    testing => 1,	# for task_runner to use lib 'lib'
    gfs => 'auto',	# default
    log4perl => {
        level => 'TRACE',
        appenders => {
            filelog => {
                type => 'Log::Log4perl::Appender::File',
                layout => '[%p] %d %F{1} %L %C %c> %m %n',
                args => { filename => 'disbatchd.log' },
            },
            screenlog => {
                type => 'Log::Log4perl::Appender::ScreenColoredLevels',
                layout => '[%p] %d %F{1} %L %C %c> %m %n',
                args => { },
            }
        }
    },
};
delete $config->{auth} unless $use_auth;
delete $config->{attributes} unless $use_ssl;

mkdir "/tmp/$config->{database}";
my $config_file = "/tmp/$config->{database}/config.json";
write_file $config_file, encode_json $config;

diag "database = $config->{database}";

my @mongo_args = (
    '--logpath' => "/tmp/$config->{database}/mongod.log",
    '--dbpath' => "/tmp/$config->{database}/",
    '--pidfilepath' => "/tmp/$config->{database}/mongod.pid",
    '--port' => $mongoport,
    #'--noprealloc',	# not on 8.2 nor 4.4
    #'--nojournal',	# not on 8.2 but is on 6.0
    '--fork'		# NOTE: fork did not work on whatever 8.2 version I used at work on Rocky 9, but it does on 8.2.4 on my personal Rocky 9
);
push @mongo_args, $use_auth ? '--auth' : '--noauth';
push @mongo_args, '--tlsMode' => 'requireTLS', '--tlsCertificateKeyFile' => 't/serverCert.pem', '--tlsCAFile' => 't/rootCAcombined.pem' if $use_ssl;
my $mongo_args = join ' ', @mongo_args;
say `mongod $mongo_args`;	# IDEA: use system or IPC::Open3 instead (note from 2016-05-05, it's now 2025)

# Get test database, authed as root:
my $attributes = {};
$attributes->{ssl} = $config->{attributes}{ssl} if $use_ssl;
if ($use_auth) {
    my $admin = MongoDB->connect($config->{mongohost}, $attributes)->get_database('admin');
    retry { $admin->run_command([createUser => 'root', pwd => 'kjfiwey76r3gjm', roles => [ { role => 'root', db => 'admin' } ]]) } catch { die $_ };
    $attributes->{username} = 'root';
    $attributes->{password} = 'kjfiwey76r3gjm';
}
my $test_db_root = retry { MongoDB->connect($config->{mongohost}, $attributes)->get_database($config->{database}) } catch { die $_ };

# Create roles and users for a database:
my $plugin_perms = { reports => [ 'insert' ] };	# minimal permissions for Disbatch::Plugin::Demo
Disbatch::Roles->new(db => $test_db_root, plugin_perms => $plugin_perms, %{$config->{auth}})->create_roles_and_users if $use_auth;

# Create users collection:
for my $username (qw/ foo bar /) {
    retry { $test_db_root->coll('users')->insert_one({username => $username, migration => 'test'}) } catch { die $_ };
}

# Ensure indexes:
my $disbatch = Disbatch->new(class => 'Disbatch', config_file => $config_file);
$disbatch->load_config;
$disbatch->ensure_indexes;


#####################################
# Start web:
sub daemonize {
    open STDIN, '<', '/dev/null'  or die "can't read /dev/null: $!";
    open STDOUT, '>', '/dev/null' or die "can't write to /dev/null: $!";
    defined(my $pid = fork)       or die "can't fork: $!";
    return $pid if $pid;
    setsid != -1                  or die "Can't start a new session: $!";
    open STDERR, '>&', 'STDOUT'   or die "can't dup stdout: $!";
    0;
}

my $webport = get_free_port;

my $webpid = daemonize();
if ($webpid == 0) {
    Disbatch::Web::init(config_file => $config_file);
    Disbatch::Web::limp({workers => 5}, LocalPort => $webport);
    die "This shouldn't have happened";
} else {
    # Run tests:
    my $uri = "localhost:$webport";
    my ($res, $data, $content);

    my $queueid;	# OID
    my $threads;	# integer
    my $node;		# node name (host name)
    my $node_id;	# node _id
    my $name;	# queue name
    my $plugin;	# plugin name
    my $object;	# array of task parameter objects
    my $collection;	# name of the MongoDB collection to query
    my $filter;	# query. If you want to query by OID, use the key "id" and not "_id"
    my $params;	# object of task params. To insert a document value from a query into the params, prefix the desired key name with "document." as a value.
    my $limit;	# integer
    my $skip;	# integer
    my $count;	# boolean
    my $terse;	# boolean

    $name = 'test_queue';
    $plugin = $config->{plugins}[0];

    # make sure web server is running:
    retry { Net::HTTP::Client->request(GET => "$uri/") } catch { die $_ };

    ### BROWSER ROUTES ###

    # Returns the Angular SPA shell (index.html) from web_root.
    $res = Net::HTTP::Client->request(GET => "$uri/");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'text/html', 'text/html';
    like $res->content, qr/<app-root><\/app-root>/, 'SPA shell contains <app-root>';
    # index.html references an un-hashed main.js (outputHashing: none); match
    # flexibly so attribute reordering or a future hashed name doesn't break it.
    like $res->content, qr/main[^"]*\.js/, 'SPA shell references a main JS bundle';
    # index.html must not be cached across RPM upgrades (A1).
    like $res->header('Cache-Control'), qr/no-cache/, 'SPA shell served with Cache-Control: no-cache';

    # A stable, hash-independent built asset (replaces the old GET /js/queues.js).
    $res = Net::HTTP::Client->request(GET => "$uri/favicon.ico");
    is $res->status_line, '200 OK', 'favicon 200 status';
    ok length($res->content) > 0, 'favicon is non-empty';

    ### GET JSON ROUTES ####

    # Returns array of queues.
    # Each item has the following keys: id, plugin, name, threads, queued, running, completed
    $res = Net::HTTP::Client->request(GET => "$uri/queues");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    is $res->content, '[]', 'empty array';

    # Returns an array of allowed plugin names.
    $res = Net::HTTP::Client->request(GET => "$uri/plugins");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    is $res->content, "[\"$plugin\"]", 'plugin array';

    # GET /info returns the database name, web extensions, routes, and the
    # dashboard tunables (refresh_ms / live_window_ms) with their defaults.
    $res = Net::HTTP::Client->request(GET => "$uri/info");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'info is HASH';
    is $content->{database}, $config->{database}, 'info database';
    is ref $content->{routes}, 'HASH', 'info routes is HASH';
    is ref $content->{dashboard}, 'HASH', 'info dashboard is HASH';
    is $content->{dashboard}{refresh_ms}, 30000, 'dashboard.refresh_ms default';
    is $content->{dashboard}{live_window_ms}, 15000, 'dashboard.live_window_ms default';

    # GET /tasks with no params and no options returns the schema and index sets (200).
    $res = Net::HTTP::Client->request(GET => "$uri/tasks");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is ref $content->{schema}, 'HASH', 'schema present';
    is ref $content->{indexes}, 'ARRAY', 'indexes present';

    # Returns hash with key 'nodes' and value array of nodes.
    # Each item has the following keys: id, _id, node, timestamp
    # and optionally: maxthreads and queues (array: maxthreads, constructor, name, tasks_doing, tasks_done, preemptive, tasks_todo, tasks_backfill, id)
    $res = Net::HTTP::Client->request(GET => "$uri/nodes");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    is $res->content, '[]', 'empty nodes';

    my $time_in_ms = time * 1000;
    # make sure node document exists:
    $disbatch->update_node_status;

    # Returns hash with key 'nodes' and value array of nodes.
    # Each item has the following keys: id, _id, node, timestamp
    # and optionally: maxthreads and queues (array: maxthreads, constructor, name, tasks_doing, tasks_done, preemptive, tasks_todo, tasks_backfill, id)
    $res = Net::HTTP::Client->request(GET => "$uri/nodes");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'ARRAY', 'nodes is ARRAY';
    is scalar @$content, 1, 'nodes has 1 entry';
    like $content->[0]{id}, qr/^[0-9a-f]{24}$/, 'id is 24 char hex string';
    like $content->[0]{_id}, qr/^[0-9a-f]{24}$/, '_id is 24 char hex string';
    is $content->[0]{id}, $content->[0]{_id}, 'id matches _id';
    cmp_ok $content->[0]{timestamp}, '>' , $time_in_ms, 'timestamp is in milliseconds';
    is $content->[0]{node}, hostname, 'node is hostname';
    ok exists $content->[0]{live}, 'live flag exists';
    ok $content->[0]{live}, 'live is true (node just reported)';
    $node = $content->[0]{node};
    $node_id = $content->[0]{id};
    my $node_hash = $content->[0];

    # Returns hash of a single node, by name
    $res = Net::HTTP::Client->request(GET => "$uri/nodes/$node");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is_deeply $content, $node_hash, 'content matches previous node hash';

    # Returns hash of a single node, by id
    $res = Net::HTTP::Client->request(GET => "$uri/nodes/$node_id");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is_deeply $content, $node_hash, 'content matches previous node hash';

    ### POST JSON ROUTES ####

    # Set maxthreads to 5 via node name
    $data = { maxthreads => 5 };
    $res = Net::HTTP::Client->request(POST => "$uri/nodes/$node", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::UpdateResult'}{matched_count}, 1, 'matched success';
    is $content->{'MongoDB::UpdateResult'}{modified_count}, 1, 'modified success';

    # Returns hash of a single node, by id
    $res = Net::HTTP::Client->request(GET => "$uri/nodes/$node_id");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    ok exists $content->{maxthreads}, 'maxthreads exists';
    is $content->{maxthreads}, 5, 'maxthreads is 5';

    # Set maxthreads to null via node _id
    $data = { maxthreads => undef };
    $res = Net::HTTP::Client->request(POST => "$uri/nodes/$node_id", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::UpdateResult'}{matched_count}, 1, 'matched success';
    is $content->{'MongoDB::UpdateResult'}{modified_count}, 1, 'modified success';

    # Returns hash of a single node, by name
    $res = Net::HTTP::Client->request(GET => "$uri/nodes/$node");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    ok exists $content->{maxthreads}, 'maxthreads exists';
    is $content->{maxthreads}, undef, 'maxthreads is null';

    # Returns array: C<< [ success, inserted_id, $reponse_object ] >>
    # Returns hash: C<< { ref $res: Object, id: $inserted_id } >>
    $data = { name => $name, plugin => $plugin, sort => 'fifo' };	# IDEA: add tests below for other "sort" values (note from 2024-05-03, it's now 2025)
    $res = Net::HTTP::Client->request(POST => "$uri/queues", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    ok defined $content->{'MongoDB::InsertOneResult'}{'inserted_id'}, 'MongoDB::InsertOneResult inserted_id defined';
    ok defined $content->{id}, 'id defined';
    $queueid = $content->{id};

    my @task_ids;
    # new API
    # Returns {ref $res: Object}
    $data = { queue => $name, params => [ {commands => 'a'}, {commands => 'b'}, {commands => 'c'} ] };
    $res = Net::HTTP::Client->request(POST => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::InsertManyResult'}{acknowledged}, 1, 'success';
    is scalar @{$content->{'MongoDB::InsertManyResult'}{inserted}}, 3, 'count';
    push @task_ids, map { $_->{_id} } @{$content->{'MongoDB::InsertManyResult'}{inserted}};
    # new API
    $data = { queue => $queueid, params => [ {commands => 'a'}, {commands => 'b'} ] };
    $res = Net::HTTP::Client->request(POST => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::InsertManyResult'}{acknowledged}, 1, 'success';
    is scalar @{$content->{'MongoDB::InsertManyResult'}{inserted}}, 2, 'count';
    push @task_ids, map { $_->{_id} } @{$content->{'MongoDB::InsertManyResult'}{inserted}};

    # new API
    $data = { queue => $queueid, '.count' => 1 };
    $res = Net::HTTP::Client->request(GET => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{count}, scalar @task_ids, 'count';

    # new API: NOTE: this search is invalid, since 'params.commands' is not indexed!
    $data = { queue => $queueid, 'params.commands' => 'b', '.count' => 1 };
    $res = Net::HTTP::Client->request(GET => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '400 Bad Request', '400 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{error}, 'non-indexed params given', 'error message';
    is_deeply $content->{invalid_params}, ['params.commands'], 'invalid_params value';
    # again, but with the index added:
    $disbatch->tasks->indexes->create_one([ queue => 1, 'params.commands' => 1]);
    $res = Net::HTTP::Client->request(GET => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{count}, 2, 'count';

    # Returns array of tasks (empty if there is an error in the query), C<< [ status, $count_or_error ] >> if "count" is true, or C<< [ 0, error ] >> if other error.
    # All parameters are optional.
    # "filter" is the query. If you want to query by Object ID, use the key "id" and not "_id".
    # "limit" and "skip" are integers.
    # "count" and "terse" are booleans.
    # new API
    $data = { %{$filter // {}}, queue => $queueid, '.limit' => $limit, '.skip' => $skip, '.terse' => $terse };
    $res = Net::HTTP::Client->request(GET => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'ARRAY', 'content is ARRAY';
    is scalar @{$content}, scalar @task_ids, 'count';

    # Returns {ref $res: Object}
    # "collection" is the name of the MongoDB collection to query.
    # "filter" is the query.
    # "params" is an object of task params. To insert a document value from a query into the params, prefix the desired key name with C<document.> as a value.
    $collection = 'users';
    $filter = { migration => 'test' };
    $params = { user1 => 'document.username', migration => 'document.migration', commands => '*' };
    # new API
    # { "queue": queue, "params": generic_task_params, "collection": collection, "filter": collection_filter }
    $data = { queue => $queueid, params => $params, collection => $collection, filter => $filter };
    $res = Net::HTTP::Client->request(POST => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::InsertManyResult'}{acknowledged}, 1, 'success';
    is scalar @{$content->{'MongoDB::InsertManyResult'}{inserted}}, 2, 'count';
    push @task_ids, map { $_->{_id} } @{$content->{'MongoDB::InsertManyResult'}{inserted}};

    # new API
    $data = { queue => $name, params => $params, collection => $collection, filter => $filter };
    $res = Net::HTTP::Client->request(POST => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::InsertManyResult'}{acknowledged}, 1, 'success';
    is scalar @{$content->{'MongoDB::InsertManyResult'}{inserted}}, 2, 'count';
    push @task_ids, map { $_->{_id} } @{$content->{'MongoDB::InsertManyResult'}{inserted}};

    $res = Net::HTTP::Client->request(GET => "$uri/queues");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'ARRAY', 'content is ARRAY';
    is scalar @$content, 1, 'size';
    is $content->[0]{id}, $queueid, 'id';
    is $content->[0]{plugin}, $plugin, 'plugin';
    is $content->[0]{name}, 'test_queue', 'name';
    is $content->[0]{threads}, undef, 'threads';
    is $content->[0]{queued}, scalar @task_ids, 'queued';

    is $content->[0]{running}, 0, 'running';
    is $content->[0]{completed}, 0, 'completed';

    # Returns C<< { ref $res: Object } >> or C<< { "success": 0, "error": error } >>
    $data = { threads => 1 };
    $res = Net::HTTP::Client->request(POST => "$uri/queues/$queueid", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::UpdateResult'}{matched_count}, 1, 'matched success';
    is $content->{'MongoDB::UpdateResult'}{modified_count}, 1, 'modified success';

    $res = Net::HTTP::Client->request(GET => "$uri/queues");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'ARRAY', 'content is ARRAY';
    is scalar @$content, 1, 'size';
    is $content->[0]{threads}, 1, 'threads';

    # This will run 1 task:
    $disbatch->validate_plugins;
    $disbatch->process_queues;

    # Returns C<< { ref $res: Object } >> or C<< { "success": 0, "error": error } >>
    $data = { threads => 0 };
    $res = Net::HTTP::Client->request(POST => "$uri/queues/$name", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::UpdateResult'}{matched_count}, 1, 'matched success';
    is $content->{'MongoDB::UpdateResult'}{modified_count}, 1, 'modified success';

    $res = Net::HTTP::Client->request(GET => "$uri/queues");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'ARRAY', 'content is ARRAY';
    is scalar @$content, 1, 'size';
    is $content->[0]{threads}, 0, 'threads';

    # Make sure queue count updated:
    # new API
    $data = { queue => $queueid, status => -2, '.count' => 1 };
    $res = Net::HTTP::Client->request(GET => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{count}, scalar @task_ids - 1, 'count';

    # Set threads to null (unlimited) via queue id (bug #3: must not 400)
    $data = { threads => undef };
    $res = Net::HTTP::Client->request(POST => "$uri/queues/$queueid", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::UpdateResult'}{matched_count}, 1, 'matched success';
    is $content->{'MongoDB::UpdateResult'}{modified_count}, 1, 'modified success';

    $res = Net::HTTP::Client->request(GET => "$uri/queues");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'ARRAY', 'content is ARRAY';
    is $content->[0]{threads}, undef, 'threads is null (unlimited)';

    # Get report for task:
    my $report = retry { $disbatch->mongo->coll('reports')->find_one() or die 'No report found' } delay { return if $_[0] >= 5; sleep $_[0]; } catch { warn $_; {} };	# status done task_id
    is $report->{status}, 'SUCCESS', 'report success';

    # Get task of report:
    my $task = retry { $disbatch->tasks->find_one({_id => $report->{task_id}, status => {'$ne' => 0}}) or die 'status still 0' } delay { return if $_[0] >= 5; sleep $_[0]; } catch { warn $_; $disbatch->tasks->find_one({_id => $report->{task_id}}) };
    is $task->{status}, 1, 'task success';

    # GET /tasks/:id
    my $success_id = $task->{_id}->to_string;
    $res = Net::HTTP::Client->request(GET => "$uri/tasks/$success_id");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{_id}, $task->{_id}->to_string, 'oid matches';
    is $content->{status}, $task->{status}, 'status matches';
    is $content->{stdout}, $task->{stdout}, 'stdout matches';

    # GET /tasks/:id with a caller-supplied .limit must not 500 (bug #4)
    $res = Net::HTTP::Client->request(GET => "$uri/tasks/$success_id?.limit=5");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH (not an array)';
    is $content->{_id}, $success_id, 'oid matches';

    # GET /tasks/:id (now always JSON regardless of Accept header)
    $res = Net::HTTP::Client->request(GET => "$uri/tasks/$success_id", Accept => 'text/html');
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{_id}, $success_id, 'oid matches';

    # GET /tasks/:id
    my ($queued_id) = grep {  $_ ne $success_id } @task_ids;
    $res = Net::HTTP::Client->request(GET => "$uri/tasks/$queued_id");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{_id}, $queued_id, 'oid matches';
    is $content->{status}, -2, 'status is -2';
    is $content->{stdout}, undef, 'stdout is undef';

    # GET /tasks/:id
    my $zero_id = '000000000000000000000000';
    $res = Net::HTTP::Client->request(GET => "$uri/tasks/$zero_id");
    is $res->status_line, '404 Not Found', '404 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is_deeply $content, {error => "no task with id $zero_id" }, 'error message';

    # GET /tasks/:id (now always JSON regardless of Accept header)
    $res = Net::HTTP::Client->request(GET => "$uri/tasks/$zero_id", Accept => 'text/html');
    is $res->status_line, '404 Not Found', '404 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is_deeply $content, {error => "no task with id $zero_id" }, 'error message';

    # Returns hash: {ref $res: Object}
    $res = Net::HTTP::Client->request(DELETE => "$uri/queues/$queueid");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::DeleteResult'}{deleted_count}, 1, 'count';

    # GFS TESTING

    $name = 'test_queue2';

    # Returns array: C<< [ success, inserted_id, $reponse_object ] >>
    # Returns hash: C<< { ref $res: Object, id: $inserted_id } >>
    $data = { name => $name, plugin => $plugin };
    $res = Net::HTTP::Client->request(POST => "$uri/queues", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    ok defined $content->{'MongoDB::InsertOneResult'}{'inserted_id'}, 'MongoDB::InsertOneResult inserted_id defined';
    ok defined $content->{id}, 'id defined';
    $queueid = $content->{id};

    $data = { threads => 1 };
    $res = Net::HTTP::Client->request(POST => "$uri/queues/$name", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::UpdateResult'}{matched_count}, 1, 'matched success';
    is $content->{'MongoDB::UpdateResult'}{modified_count}, 1, 'modified success';

    my $gfs_tests = {
        'e'   => { auto => ['STR','NUL'], 0 => ['STR','NUL'] }, # 15,   0       15
        'eb'  => { auto => ['OID','STR'], 0 => ['STR','STR'] }, # 15,   0+      15+
        'aE'  => { auto => ['OID','STR'], 0 => ['STR','STR'] }, #  0+, 15       15+
        'ea'  => { auto => ['OID','NUL'], 0 => ['STR','NUL'] }, # 15+,  0       15+
        'E'   => { auto => ['NUL','STR'], 0 => ['NUL','STR'] }, #  0,  15       15
        'eA'  => { auto => ['OID','STR'], 0 => ['STR','STR'] }, # 15,   1       16      stdout will have error msg for document too large
        '1E'  => { auto => ['OID','STR'], 0 => ['STR','STR'] }, #  1,  15       16      stdout will have error msg for document too large
        '7aC' => { auto => ['OID','STR'], 0 => ['STR','STR'] }, #  7+,  8       15+
        '7C'  => { auto => ['STR','STR'], 0 => ['STR','STR'] }, #  7,   8       15
        'Eb'  => { auto => ['OID','OID'], 0 => ['NUL','STR'] }, #  0,  15+      15+
    };

    note "GFS loop start";
    $disbatch->{config}{quiet} = 1;
    for my $gfs ('auto', 1, 0) {
        if (exists $ENV{GFS_TESTS}) {
            next unless $ENV{GFS_TESTS} eq "$gfs";
            note "GFS: $gfs";
        }
        $disbatch->{config}{gfs} = $gfs;
        for my $key (keys  %$gfs_tests) {
            #note "GFS: $gfs $key $gfs_tests->{$key}{$gfs}[0] $gfs_tests->{$key}{$gfs}[1]";
            $data = { queue => $name, params => [ {commands => $key} ] };
            $res = Net::HTTP::Client->request(POST => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
            is $res->status_line, '200 OK', '200 status';
            $content = decode_json($res->content);
            is scalar @{$content->{'MongoDB::InsertManyResult'}{inserted}}, 1, 'count';
            my ($task_id) = map { $_->{_id} } @{$content->{'MongoDB::InsertManyResult'}{inserted}};

            # This will run 1 task:
            $disbatch->validate_plugins;
            $disbatch->process_queues;

            # get task, verify if stdout and stderr is in task or gfs
            $data = { id => $task_id, queue => $queueid, 'params.commands' => $key};
            my $max = 10;
            my $c = 0;
            do {
                select(undef, undef, undef, 0.5);
                $res = Net::HTTP::Client->request(GET => "$uri/tasks", 'Content-Type' => 'application/json', encode_json($data));
                $content = decode_json($res->content);
                if (ref $content ne 'ARRAY') {
                    warn Dumper $content;
                    BAIL_OUT("content is not an ARRAY");
                }
                note "status is $content->[0]{status}";
                if ($content->[0]{status} > 0) {
                    $c++;
                    BAIL_OUT("too many loops looking for complete") if $c >= $max;
                }
            } while (!exists $content->[0]{complete});
            is $res->status_line, '200 OK', '200 status';
            is $res->content_type, 'application/json', 'application/json';
            is ref $content, 'ARRAY', 'content is ARRAY';
            is scalar @$content, 1, 'count';
            is $content->[0]{status}, 1, 'status 1';
            ok exists $content->[0]{stdout}, 'stdout exists';
            ok exists $content->[0]{stderr}, 'stderr exists';
            if (!$gfs) {
                if ($gfs_tests->{$key}{0}[0] eq 'NUL') {
                    ok !defined $content->[0]{stdout}, 'stdout undefined';
                } elsif ($gfs_tests->{$key}{0}[0] eq 'STR') {
                    ok((defined $content->[0]{stdout} and !ref $content->[0]{stdout}), 'stdout string');
                #} elsif ($gfs_tests->{$key}{0}[0] eq 'OID') {
                } else {
                    die;
                }
                if ($gfs_tests->{$key}{0}[1] eq 'NUL') {
                    ok !defined $content->[0]{stderr}, 'stderr undefined';
                } elsif ($gfs_tests->{$key}{0}[1] eq 'STR') {
                    ok((defined $content->[0]{stderr} and !ref $content->[0]{stderr}), 'stderr string');
                #} elsif ($gfs_tests->{$key}{0}[1] eq 'OID') {
                } else {
                    die;
                }
            } elsif ($gfs eq 'auto') {
                if ($gfs_tests->{$key}{auto}[0] eq 'NUL') {
                    ok !defined $content->[0]{stdout}, 'stdout undefined';
                } elsif ($gfs_tests->{$key}{auto}[0] eq 'STR') {
                    ok((defined $content->[0]{stdout} and !ref $content->[0]{stdout}), 'stdout string');
                } elsif ($gfs_tests->{$key}{auto}[0] eq 'OID') {
                    ok defined $content->[0]{stdout}, 'stdout OID';
                } else {
                    die;
                }
                if ($gfs_tests->{$key}{auto}[1] eq 'NUL') {
                    ok !defined $content->[0]{stderr}, 'stderr undefined';
                } elsif ($gfs_tests->{$key}{auto}[1] eq 'STR') {
                    ok((defined $content->[0]{stderr} and !ref $content->[0]{stderr}), 'stderr string');
                } elsif ($gfs_tests->{$key}{auto}[1] eq 'OID') {
                    ok defined $content->[0]{stderr}, 'stderr OID';
                } else {
                    die;
                }
            } else {
                ok defined $content->[0]{stdout}, 'stdout OID';
                ok defined $content->[0]{stderr}, 'stderr OID';
            }
        }
    }
    note "GFS loop end";

    # Returns hash: {ref $res: Object}
    $res = Net::HTTP::Client->request(DELETE => "$uri/queues/$name");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is $content->{'MongoDB::DeleteResult'}{deleted_count}, 1, 'count';

    # Returns array of queues.
    # Each item has the following keys: id, plugin, name, threads, queued, running, completed
    $res = Net::HTTP::Client->request(GET => "$uri/queues");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    is $res->content, '[]', 'empty array';

    # MONITORING TESTS:
    # * get '/monitoring'	send_json checks(), send_json_options;
    # IDEA: this just runs one test based on the config settings above and not all possibilities, as changing settings requires restarting Disbatch::Web, and i don't want to figure out how to do that here rn (note from 2019-03-29, it's now 2025)
    my $monitoring;
    if ($disbatch->{config}{monitoring}) {
        if ($disbatch->{config}{balance}{enabled}) {
            my $time = time;	# IDEA: this is hacky, but should usually work. slight chance the response if off by 1 tho. alternatively, we could check a regex against $res->content since canonical is used. (note from 2019-03-29, it's now 2025)
            $monitoring = { disbatch => { status => 'OK', message => 'Disbatch is running on one or more nodes' }, queuebalance => { status => 'CRITICAL', message => "queuebalanced not running for ${time}s" } };
        } else {
            my $hostname = hostname;
            $monitoring = { disbatch => { status => 'OK', message => 'Disbatch is running on one or more nodes', nodes => { fresh => { $hostname => 1 } } }, queuebalance => { status => 'OK', message => 'queuebalance disabled' } };
        }
    } else {
        $monitoring = { disbatch => { status => 'OK', message => 'monitoring disabled' }, queuebalance => { status => 'OK', message => 'monitoring disabled' } };
    };
    $res = Net::HTTP::Client->request(GET => "$uri/monitoring");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    for my $type (qw/ disbatch queuebalance /) {
        for my $field (qw/ status message /) {
            is $content->{$type}{$field}, $monitoring->{$type}{$field}, "monitoring $type $field";
        }
    }
    if ($monitoring->{disbatch}{nodes}) {
        for my $status (keys %{$monitoring->{disbatch}{nodes}}) {
            for my $host (keys %{$monitoring->{disbatch}{nodes}{$status}}) {
                ok exists $monitoring->{disbatch}{nodes}{$status}{$host}, "monitoring node $status $host exists";
            }
        }
    }

    # BALANCE TESTS:
    # * get '/balance'		send_json get_balance(), send_json_options, pretty => 1;	template 'balance.tt', get_balance();
    # * post '/balance'		send_json post_balance(), send_json_options;

    # create some queues (and assume they succeed)
    Net::HTTP::Client->request(POST => "$uri/queues", 'Content-Type' => 'application/json', encode_json({ name => $_, plugin => $plugin })) for qw/ oneoff bulk api /;

    # get /balance (now always JSON regardless of Accept header)
    $res = Net::HTTP::Client->request(GET => "$uri/balance", Accept => 'text/html');
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';

    # get /balance
    $res = Net::HTTP::Client->request(GET => "$uri/balance");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is_deeply $content, { known_queues => [ 'api', 'bulk', 'oneoff' ], notice => 'balance document not found', settings => $config->{balance} }, 'content matches excepted HASH';

    # post /balance
    $data = { max_tasks => {'* 07:00' => 1, '* 19:00' => 5}, queues => [ ['bulk'], ['api'], ['oneoff'] ] };
    $res = Net::HTTP::Client->request(POST => "$uri/balance", 'Content-Type' => 'application/json', encode_json($data));
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is_deeply $content, { status => 'success: queuebalance modified' }, 'content matches excepted HASH';

    # get /balance (with changes)
    $res = Net::HTTP::Client->request(GET => "$uri/balance");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is_deeply $content, { known_queues => [ 'api', 'bulk', 'oneoff' ], max_tasks => $data->{max_tasks}, queues => $data->{queues}, settings => $config->{balance} }, 'content matches excepted HASH';

    # post /balance (bad data)
    my @bad_balance_data = (
        {},														# empty
        { max_tasks => {'7 07:00' => 1, '* 19:00' => 1}, queues => [['bulk'], ['api'], ['oneoff']]},			# invalid DOW
        { max_tasks => {'* 07:00' => 1.1, '* 19:00' => 1}, queues => [['bulk'], ['api'], ['oneoff']]},			# invalid max size
        #{ max_tasks => {'* 19:00' => 5, '* 19:00' => 1}, queues => [['bulk'], ['api'], ['oneoff']]},			# conflicting max_tasks entries - can't test this via perl, will change db! :/
        { max_tasks => {'* 07:00' => 1, '* 19:00' => 1}, queues => [['bu lk'], ['api'], ['oneoff']]},			# invalid queue name
        { max_tasks => {'* 07:00' => 1, '* 19:00' => 1}, queues => [['bulk,bulk'], ['api'], ['oneoff']]},		# dup queue name
        { max_tasks => {'* 07:00' => 1, '* 19:00' => 1}, queues => [['bulk'], ['api', 'bulk'], ['oneoff']]},		# dup queue name
        { max_tasks => {'* 07:00' => 1, '* 19:00' => 1}, queues => ['bulk', ['api'], ['oneoff']]},			# not array
        { max_tasks => {'* 07:00' => 1, '* 19:00' => 1}, queues => 'bulk'},						# not array
        { max_tasks => 'foo', queues => [['bulk'], ['api'], ['oneoff']]},						# not hash
        { max_tasks => {'* 07:00' => 1, '* 19:00' => 1}},								# missing queues
        { queues => [['bulk'], ['api'], ['oneoff']]},									# missing max_tasks
        { max_tasks => {'* 07:00' => 1, '* 19:00' => 1}, queues => [['bulk'], ['api'], ['oneoff']], 'foo' => 'bar'},	# unknown key
        { max_tasks => {'* 07:00' => 1, '* 19:00' => 1}, queues => [['bulk'], ['api'], ['oneoff', 'FOOBAR']]},		# unknown queue FOOBAR
    );
    for my $bad (@bad_balance_data) {
        $res = Net::HTTP::Client->request(POST => "$uri/balance", 'Content-Type' => 'application/json', encode_json($bad));
        is $res->status_line, '400 Bad Request', '400 Bad Request';
        is $res->content_type, 'application/json', 'application/json';
        $content = decode_json($res->content);
        is ref $content, 'HASH', 'content is HASH';
        is join(',', sort keys %$content), 'status', "content has key 'status'";
        like $content->{status}, qr/^failed: invalid json passed\b/, 'status message';
    }

    # get /balance (make sure we haven't actually changed anything with our bad data above)
    $res = Net::HTTP::Client->request(GET => "$uri/balance");
    is $res->status_line, '200 OK', '200 status';
    is $res->content_type, 'application/json', 'application/json';
    $content = decode_json($res->content);
    is ref $content, 'HASH', 'content is HASH';
    is_deeply $content, { known_queues => [ 'api', 'bulk', 'oneoff' ], max_tasks => $data->{max_tasks}, queues => $data->{queues}, settings => $config->{balance} }, 'content matches excepted HASH';

    done_testing;
}

END {
    # Cleanup:
    if (defined $config and $config->{database}) {
        kill -9, $webpid if $webpid;
        my $pidfile = "/tmp/$config->{database}/mongod.pid";
        if (-e $pidfile) {
            my $mongopid = read_file $pidfile;
            chomp $mongopid;
            kill 9, $mongopid;
        }
        remove_tree "/tmp/$config->{database}";
    }
}

__END__

=encoding utf8

=head1 NAME

t/002_full.t - test everything about Disbatch.

=head1 USAGE

Run the full test suite with the following:

    dzil test

You can also disable MongoDB SSL and authentication via:

    USE_SSL=0 USE_AUTH=0 dzil test

You can test only one type of GFS tests by setting C<GFS_TESTS> to C<auto>, C<1>, or C<0>. Or set to any other value to not run those tests.

    GFS_TESTS=none dzil test


=head1 AUTHORS

Ashley Willis <consul-5flap@icloud.com>

=head1 COPYRIGHT AND LICENSE

This software is Copyright (c) 2016, 2019 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004
