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

my $result = {};	# { status => 1, stdout => 'success', stderr => '' };
# set status, stdout, and stderr via $doc->{params}
for my $param (keys %{$doc->{params}}) {
    # TEST ideas:
    # * status of [1,"1",2,3,44,undef,0,-9,"fizz",{},[],'{"json":"true"}']
    # * stdout and stderr of: undef,-1,'',{hash: [1,2,'hi']},[1,2,'hi',{hash:1}]	NOTE: should be strings, encode_utf8() is called on these
    # * large_stdout and large_stderr of 1024*1024*1,1024*1024*7,1024*1024*8,1024*1024*14,1024*1024*15,1024*1024*16
    # copy matching params to $result
    if (grep {$_ eq $param} qw/status stdout stderr/) {
        $result->{$param} = $doc->{params}{$param};
    }
    # make large stdout and stderr
    if ($param eq 'large_stdout') {
        # value is size in bytes. max size without gfs kicking in is 1024*1024*15 each and total
        $result->{stdout} = 'x' x $doc->{params}{$param};
    } elsif ($param eq 'large_stderr') {
        # value is size in bytes. max size without gfs kicking in is 1024*1024*15 each and total
        $result->{stderr} = 'x' x $doc->{params}{$param};
    }
}

write_file $out_file, $json->encode($result);

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
