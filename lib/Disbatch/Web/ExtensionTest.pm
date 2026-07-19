package Disbatch::Web::ExtensionTest;

use 5.32.0;
use warnings;

use Disbatch::Web;      # exports: parse_params send_json_options template
use Limper::SendJSON;
use Limper;
use Template;

my $tt;

# this should be compatible with Dancer's template(), except we do not support the optional settings (third value), and it was unused by RemoteControl
sub template {
    my ($template, $params) = @_;
    my $output = '';
    $params->{perl_version} = $];
    $params->{limper_version} = $Limper::VERSION;
    $params->{request} = request;
    $tt->process($template, $params, \$output) || die $tt->error();
    headers 'Content-Type' => 'text/html';
    $output;
}

my $disbatch;

sub init {
    ($disbatch, my $args) = @_;
    # the following options should be compatible with previous Dancer usage:
    $tt = Template->new(ANYCASE => 1, ABSOLUTE => 1, ENCODING => 'utf8', INCLUDE_PATH => $disbatch->{config}{views_dir} // '/etc/disbatch/views/', START_TAG => '\[%', END_TAG => '%\]', WRAPPER => 'layouts/main.tt');
}

sub parse_accept {
    +{ map { @_ = split(/;q=/, $_); $_[0] => $_[1] // 1 } split /,\s*/, request->{headers}{accept} // '' };
}

sub want_json {
    my $accept = parse_accept;
    # prefer 'text/html' over 'application/json' if equal, but default to 'application/json'
    ($accept->{'text/html'} // 0) >= ($accept->{'application/json'} // 1) ? 0 : 1;
}

get '/test' => sub {
    send_json { node => $disbatch->nodes->find_one(), checks => Disbatch::Web::checks() }, send_json_options;
}
