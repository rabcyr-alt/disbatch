package Disbatch::Plugin::Demo::Extension;

use 5.12.0;
use warnings;

use Disbatch::Web;      # exports: parse_params send_json_options query
use Limper::SendJSON;
use Limper;

my $disbatch;

sub init {
    ($disbatch, my $args) = @_;
    # do whatever you may need to do with $args
}

get '/test' => sub {
    send_json { node => $disbatch->nodes->find_one(), checks => Disbatch::Web::checks() }, send_json_options;
};

1;

__END__

=encoding utf8

=head1 NAME

Disbatch::Plugin::Demo::Extension - basic web extension demo

=head1 SUBROUTINES

=over 2

=item init($disbatch, $args)

Allows interfacing with Disbatch as the `disbatch_web` user. `$args` is optional.

=back

=head1 JSON ROUTES

=over 2

=item GET /test

Returns JSON with keys `node` and `checks`.

=back

=head1 SEE ALSO

L<Disbatch::Web>

L<Disbatch::Web::TT>

L<Disbatch::Plugin::Demo::TTExtension>

=head1 AUTHORS

Ashley Willis <consul-5flap@icloud.com>

=head1 COPYRIGHT AND LICENSE

This software is Copyright (c) 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004
