package Disbatch::Web::TT;

use parent qw/ Disbatch::Web /;

use 5.12.0;
use warnings;

use Disbatch::Web;	# exports: parse_params send_json_options query
use Limper::SendJSON;
use Limper;
use Template;

our @EXPORT = (@Disbatch::Web::EXPORT, 'template', 'want_json');

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
    my $args = { @_ };
    Disbatch::Web::init(@_);
    $disbatch = $Disbatch::Web::disbatch;
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

1;

__END__

=encoding utf8

=head1 NAME

Disbatch::Web::TT - Disbatch Command Interface with Template support (JSON REST API and web browser interface to Disbatch).

=head1 SYNOPSIS

    use Disbatch::Web::TT;

    Disbatch::Web::TT::init(config_file => '/etc/disbatch/config.json');

=head1 DESCRIPTION

Provides the Disbatch Command Interface (DCI) with legacy Template support: a PSGI-based JSON REST API and
web browser interface using L<Limper> for routing and L<Starwoman> as the server. Entry point for production
use is C<etc/disbatch/app.psgi>; for development use C<dev/disbatch-web>.

=head1 EXPORTED

parse_params, send_json_options, query, template, want_json

=head1 NOTE

This extends L<Disbatch::Web>. See its documenation for JSON routes, browser routes, and custom routes.

=head1 SUBROUTINES

=over 2

=item init(config_file => $config_file)

Parameters: path to the Disbatch config file. Default is C</etc/disbatch/config.json>.

Initializes the settings for the web server, including loading any custom routes via C<config.web_extensions> (see L<CUSTOM ROUTES> below).

Returns nothing.

=item template($template, $params)

Parameters: template (C<.tt>) file name in the C<config.views_dir> directory, C<HASH> of parameters for the template.

Creates a web page based on the passed data.

Sets C<Content-Type> to C<text/html>.

Returns the generated html document.

NOTE: this sub is automatically exported, so any package using L<Disbatch::Web::TT> can call it.

=item parse_accept

Parameters: none

Parses C<Accept> header.

Returns a C<HASH> where keys are types and values are q-factor weights.

=item want_json

Parameters: none

Returns true if C<Accept> header has C<application/json> with a higher q-factor weight than C<text/html>.

Note: if not specified, C<text/html> has an assumed q-factor weight of C<0> and C<application/json> has an assumed q-factor weight of C<1>.

NOTE: this sub is automatically exported, so any package using L<Disbatch::Web::TT> can call it.

=back

=head1 SEE ALSO

L<Disbatch::Web>

=head1 AUTHORS

Ashley Willis <consul-5flap@icloud.com>

=head1 COPYRIGHT AND LICENSE

This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004
