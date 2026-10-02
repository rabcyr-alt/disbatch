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
use MongoDB;
use Try::Tiny::Retry;
use Safe::Isa;
use Symbol 'gensym';
use Sys::Hostname;

use lib '.';
use ParamsResult;

$| = 1;

my ($task_id, $config_file);

GetOptions(
    'task=s'     => \$task_id,
    'config=s'   => \$config_file,
);

die "Config file must be passed with --config option\n" unless defined $config_file;
die "No --task\n" unless defined $task_id;

my $json = Cpanel::JSON::XS->new->utf8->convert_blessed;

my $config = $json->decode(scalar read_file $config_file);
my $node = hostname;
my $mongo = mongo($config, 'task_runner');

my $oid = try { BSON::OID->new(oid => pack 'H*', $task_id) } catch { die "--task value error: $_" };
my $doc = retry {
    $mongo->coll('tasks')->find_one({_id => $oid, status => 0, node => $node});
} catch {
    die "Could not find task $task_id with status 0 on node $node: $_\n";
};

die "No task found for $task_id\n" unless defined $doc;

my ($result, $extra) = ParamsResult::params2result($doc->{params});
$result->{_id} = $oid;

# GridFS: this prefers `stderr` as a string in the task document even when it's large, as on failures `stderr` is more likely needed to be parsed
#         if `stderr` ends up in GridFS, so will `stdout` (unless it is empty)
my $total = 0;
for my $field (qw/ stderr stdout /) {
    my $size = defined $result->{$field} ? length encode_utf8($result->{$field}) : 0;
    $total += $size;
    if ($size and $total > 1024*1024*15) {
        my $id = retry { put_gfs($result->{$field}, $field, { task_id => $oid }) } retry_if { !/^MongoDB::DatabaseError: not authorized on / }
                catch { warn "Could not create GridFS content for task $oid $field: $_"; undef; };
        $result->{$field} = $id;
    }
}

retry { $mongo->coll('results')->insert_one($result) } catch { die "Could not insert results for task $task_id with status $result->{status} after completion: $_" };

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

sub put_gfs {
    my ($content, $filename, $metadata) = @_;
    my $gfs = $mongo->gfs({bucket_name => 'tasks'});
    my $stream = $gfs->open_upload_stream($filename, { metadata => $metadata });
    $stream->print($content);
    $stream->close;
    $stream->id;
}
