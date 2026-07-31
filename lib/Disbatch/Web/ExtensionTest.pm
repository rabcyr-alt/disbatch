package Disbatch::Web::ExtensionTest;

use 5.32.0;
use warnings;

use Disbatch::Web;      # exports: parse_params send_json_options template
use Limper::SendJSON;
use Limper;

my $disbatch;

sub init {
    ($disbatch, my $args) = @_;
    # do whatever you may need to do with $args
}

get '/test' => sub {
    send_json { node => $disbatch->nodes->find_one(), checks => Disbatch::Web::checks() }, send_json_options;
}
