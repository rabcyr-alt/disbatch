package Disbatch::Plugin::Test;

use 5.12.0;
use warnings;

use boolean;
use Data::Dumper;

sub new {
    my $class = shift;

    my $self = { @_ };
    warn Dumper $self->{task}{params};

    $self->{queue_id} = $self->{task}{queue};
    $self->{id} = $self->{task}{_id};

    bless $self, $class;
}

sub run {
    my ($self) = @_;
    # set status, stdout, and stderr via $self->{task}{params}
    for my $param (keys %{$self->{task}{params}}) {
        # TEST ideas:
        # * status of [1,"1",2,3,44,undef,0,-9,"fizz",{},[],'{"json":"true"}']
        # * stdout and stderr of: undef,-1,'',{hash: [1,2,'hi']},[1,2,'hi',{hash:1}]	NOTE: should be strings, encode_utf8() is called on these
        # * large_stdout and large_stderr of 1024*1024*1,1024*1024*7,1024*1024*8,1024*1024*14,1024*1024*15,1024*1024*16
        # copy matching params to $self
        if (grep {$_ eq $param} qw/status stdout stderr/) {
            $self->{$param} = $self->{task}{params}{$param};
        }
        # make large stdout and stderr
        if ($param eq 'large_stdout') {
            # value is size in bytes. max size without gfs auto kicking in is 1024*1024*15 each and total
            $self->{stdout} = 'x' x $self->{task}{params}{$param};
        } elsif ($param eq 'large_stderr') {
            # value is size in bytes. max size without gfs auto kicking in is 1024*1024*15 each and total
            $self->{stderr} = 'x' x $self->{task}{params}{$param};
        }
    }
    $self->finish;
}

sub finish {
    my ($self) = @_;
    # anything that must get done goes here:
    warn "Finished with status $self->{status}\n";
    {status => $self->{status}, stdout => $self->{stdout}, stderr => $self->{stderr}};
}

1;

__END__

=head1 NAME

Disbatch::Plugin::Test - test plugin for Disbatch

=head1 DESCRIPTION

A sample Disbatch plugin.

Tasks for this plugin should have in C<params> combinations of keys C<status>, C<stdout>, C<stderr>, C<large_stdout>, and C<large_stderr>, like in the
C<t/task-*.pl> test scripts.

=head1 SUBROUTINES

=over 2

=item new(workerthread => $workerthread, task => $doc);

Parameters: C<<$workerthread>> is a C<Disbatch> object from C<task_runner> using the `plugin` MongoDB user and role,
C<$doc> is the task document from MongoDB.

Returns a C<Disbatch::Plugin::Test> object.

In this demo, the parameters passed become C<$self>.  In addition, C<<$self->{queue_id}>> is set to the task's queue id, and C<<$self->{id}>> is set to the task's id.

=item run

Parameters: none

Runs the task.

Returns the result of C<finish()>.

=item finish

Parameters: none

Returns a C<HASH> result to update the task with.

The result I<SHOULD> have the keys C<status> (1 for success, 2 for failure), C<stdout>, and C<stderr>.
Other keys will be ignored.

=back

=head1 SEE ALSO

L<Disbatch>

L<Disbatch::Web>

L<Disbatch::Roles>

L<disbatchd>

L<disbatch>

L<task_runner>

L<disbatch-create-users>

=head1 AUTHORS

Ashley Willis <consul-5flap@icloud.com>

=head1 COPYRIGHT AND LICENSE

This software is Copyright (c) 2016, 2026 by Ashley Willis.

This is free software, licensed under:

  The Apache License, Version 2.0, January 2004
