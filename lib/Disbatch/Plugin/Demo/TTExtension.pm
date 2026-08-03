package Disbatch::Plugin::Demo::TTExtension;

use 5.12.0;
use warnings;

use Cpanel::JSON::XS;
use Disbatch::Web::TT;	# exports: parse_params send_json_options query template want_json
use File::Slurp;
use Limper::SendJSON;
use Limper;

my $disbatch;

my $oid_keys = [ qw/ queue / ]; # NOTE: in addition to _id

sub init {
    ($disbatch, my $args) = @_;
}

get qr'^/reports/(?<id>[0-9a-f]{24})$' => sub {
    my $title = "Disbatch Single Report Query";
    my $want_json = want_json;
    my $result = query({id => $+{id}}, {'.limit' => 1}, $title, $oid_keys, $disbatch->mongo->coll('reports'), request->{path}, $want_json, [['id']]);
    if ($want_json) {
        if (!keys %$result) {
            status 404;
            $result = { error => "no report with id $+{id}" };
        } elsif (exists $result->{error}) {
            status 400;
        }
        send_json $result, send_json_options, pretty => 1;
    } else {
        if (!defined $result->{result}) {
            status 404;
        } elsif (exists $result->{error}) {
            status 400;
        }
        template 'query.tt', $result;
    }
};

1;

__END__

=encoding utf8

=head1 NAME

Disbatch::Plugin::Demo::TTExtension - basic web extension demo

=head1 SUBROUTINES

=over 2

=item init($disbatch, $args)

Allows interfacing with Disbatch as the `disbatch_web` user. `$args` is optional.

=back

=head1 JSON ROUTES

=over 2

=item GET /reports/:id

Parameters: Report OID in URL

Returns the report matching OID as JSON, or C<{ "error": "no report with id :id" }> and status C<404> if OID not found.
Or, via a web browser (based on C<Accept> header value), returns the report matching OID with some formatting, or C<Document(s) not found.> if OID not found.

=back

=head1 SEE ALSO

L<Disbatch::Web>

L<Disbatch::Web::TT>

L<Disbatch::Plugin::Demo::Extension>

=head1 AUTHORS

Ashley Willis <consul-5flap@icloud.com>

=head1 COPYRIGHT AND LICENSE

This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004
