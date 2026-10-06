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

use FindBin;
use lib $FindBin::RealBin;
use ParamsResult;

$| = 1;

my ($task_file, $config_file);

GetOptions(
    'task=s'     => \$task_file,
    'config=s'   => \$config_file,
);

die "No --task\n" unless defined $task_file;
my $out_file = $task_file;
$out_file =~ s/\.json$/-response.json/ or die "--task value does not end in '.json'\n";

my $json = Cpanel::JSON::XS->new->utf8->convert_blessed;

my $config = $json->decode(scalar read_file $config_file) if defined $config_file;
my $node = hostname;
my $mongo = mongo($config, 'task_runner') if defined $config;

my $doc = $json->decode(scalar read_file $task_file);

my ($result, $extra) = ParamsResult::params2result($doc->{params});

write_file $out_file, $json->encode($result);

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
