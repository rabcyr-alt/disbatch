#!/usr/bin/perl

# A "handoff" test plugin that does no validation of its own, unlike t/task-handoff.pl, so the task runner's
# validation can be tested. It sets the task's `status` (and `stdout` and `stderr`) in the task document to exactly
# what is given in `params` (see ParamsResult.pm), and:
# * does not touch the task document if `params` has none of `status`, `stdout`, `stderr`, so status stays 0
# * unsets `status` if `params.unset_status` is true
# * exits non-zero afterwards if `params.exit` and `params.wait` are given

use 5.12.0;
use warnings;

use BSON::OID;
use Cpanel::JSON::XS;
use Getopt::Long;
use MongoDB;
use Try::Tiny::Retry;
use Sys::Hostname;
use File::Slurp;

use FindBin;
use lib $FindBin::RealBin;
use ParamsResult;

$| = 1;

my ($task_id, $config_file, $quiet);

GetOptions(
    'task=s'     => \$task_id,
    'config=s'   => \$config_file,
    'quiet'      => \$quiet,
);

die "Config file must be passed with --config option\n" unless defined $config_file;
die "No --task\n" unless defined $task_id;

my $json = Cpanel::JSON::XS->new->utf8->convert_blessed;

my $config = $json->decode(scalar read_file $config_file);
my $node = hostname;
my $mongo = mongo($config);

my $oid = try { BSON::OID->new(oid => pack 'H*', $task_id) } catch { die "--task value error: $_" };
my $doc = retry {
    $mongo->coll('tasks')->find_one({_id => $oid, status => 0, node => $node});
} catch {
    die "Could not find task $task_id with status 0 on node $node: $_\n";
};

die "No task found for $task_id\n" unless defined $doc;

my ($result, $extra) = ParamsResult::params2result($doc->{params});

my $update = {};
$update->{'$set'} = { %$result, complete => Cpanel::JSON::XS::true } if keys %$result;
$update->{'$unset'} = { status => 1 } if $doc->{params}{unset_status};
if (keys %$update) {
    retry { $mongo->coll('tasks')->update_one({_id => $oid, status => 0, node => $node}, $update) }
    catch { die "Could not update task $task_id: $_" };
}

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
    my ($config) = @_;
    my %attributes = %{$config->{attributes}};
    if (keys %{$config->{auth}}) {
        $attributes{username} = 'plugin';
        $attributes{password} = $config->{auth}{plugin};
        $attributes{db_name} = $config->{database};
    }
    MongoDB->connect($config->{mongohost}, \%attributes)->get_database($config->{database});
}
