package ParamsResult;

use 5.12.0;
use warnings;

sub params2result {
    my ($params) = @_;
    my $result = {};	# { status => 1, stdout => 'success', stderr => '' };
    my $extra = {};
    # set status, stdout, and stderr via $doc->{params}
    for my $param (keys %$params) {
        # TEST ideas:
        # * status of [1,"1",2,3,44,undef,0,-9,"fizz",{},[],'{"json":"true"}']
        # * stdout and stderr of: undef,-1,'',{hash: [1,2,'hi']},[1,2,'hi',{hash:1}]	NOTE: should be strings, encode_utf8() is called on these
        # * large_stdout and large_stderr of 1024*1024*1,1024*1024*7,1024*1024*8,1024*1024*14,1024*1024*15,1024*1024*16
        # copy matching params to $result
        if (grep {$_ eq $param} qw/status stdout stderr/) {
            $result->{$param} = $params->{$param};
        } elsif ($param eq 'large_stdout') {
            # make large stdout
            # value is size in bytes. max size without gfs kicking in is 1024*1024*15 each and total
            $result->{stdout} = 'x' x $params->{$param};
            $extra->{quiet} = 1;	# hacky, for handoff
        } elsif ($param eq 'large_stderr') {
            # make large stderr
            # value is size in bytes. max size without gfs kicking in is 1024*1024*15 each and total
            $result->{stderr} = 'x' x $params->{$param};
            $extra->{quiet} = 1;	# hacky, for handoff
        } elsif ($param eq 'kill') {
            if ($params->{wait}) {
                $extra->{$param} = $params->{$param};
            } else{
                `kill -$params->{$param} $$`;
            }
        } elsif ($param eq 'die') {
            if ($params->{wait}) {
                $extra->{$param} = $params->{$param};
            } else{
                die $params->{$param};
            }
        } elsif ($param eq 'exit') {
            if ($params->{wait}) {
                $extra->{$param} = $params->{$param};
            } else{
                exit $params->{$param};
            }
        }
    }
    $result, $extra;
}
   
1;
