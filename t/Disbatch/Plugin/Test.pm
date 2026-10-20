package Disbatch::Plugin::Test;

use 5.12.0;
use warnings;

use ParamsResult;

sub new {
    my $class = shift;

    my $self = { @_ };

    bless $self, $class;
}

sub run {
    my ($self) = @_;
    my ($result) = ParamsResult::params2result($self->{task}{params});
    $result;
}

1;

__END__

=head1 NAME

Disbatch::Plugin::Test - Perl module test plugin for Disbatch

=head1 DESCRIPTION

The Perl module counterpart of the C<t/task-*.pl> test plugins, used by F<t/003_go_task_runner.t>. It is in F<t/> so it
is not installed, so C<t> must be in C<@INC> for both C<disbatchd> and C<task_runner>, such as with C<PERL5LIB=t>.

The task's C<params> decide the result, via C<ParamsResult::params2result()> in F<t/ParamsResult.pm>. Params that act
after the result is returned (C<wait> with C<die>, C<exit>, or C<kill>) are ignored, as C<task_runner> writes the result.

=head1 SUBROUTINES

=over 2

=item new(workerthread => $workerthread, task => $doc);

Parameters: C<$workerthread> is a C<Disbatch> object from C<task_runner> using the C<plugin> MongoDB user and role,
C<$doc> is the task document from MongoDB.

Returns a C<Disbatch::Plugin::Test> object.

=item run

Parameters: none

Returns the result from C<ParamsResult::params2result()>, which will die, exit, or kill the process instead if the
C<params> say to.

=back

=head1 SEE ALSO

L<Disbatch>

L<task_runner>

L<go-task-runner>

=head1 AUTHORS

Ashley Willis <consul-5flap@icloud.com>

=head1 COPYRIGHT AND LICENSE

This software is Copyright (c) 2016, 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004
