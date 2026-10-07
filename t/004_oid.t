#!/usr/bin/env perl

# This software is Copyright (c) 2016, 2019 by Ashley Willis.
# This is free software, licensed under:
#   The Apache License, Version 2.0, January 2004

use Test::More;

use 5.12.0;
use warnings;

use BSON;

use lib 'lib';
use Disbatch;	# replaces BSON::OID::_packed_oid

# BSON v1.12.2 makes new random bytes for every OID made in a forked process, so OIDs made by a forked process (like
# the Disbatch::Web workers) would not be in order. Disbatch.pm replaces it with one that gets new random bytes once per process.

BSON::OID->new;	# made before forking, so every child would have the same random bytes if they were only made once

my $children = 4;
my $each = 6;
pipe(my $read, my $write) or die "pipe failed: $!";
for my $child (1 .. $children) {
    defined(my $pid = fork) or die "fork failed: $!";
    if (!$pid) {
        close $read;
        # all the ways to make an OID:
        my @makers = (sub { BSON::OID->new }, sub { BSON->create_oid }, sub { BSON->new->create_oid });
        print $write join(',', map { $makers[$_ % 3]->()->to_string } 1 .. $each), "\n";
        exit 0;
    }
}
close $write;
my %seen;
my $in_order = 1;
my %random;
while (my $line = <$read>) {
    chomp $line;
    my @oids = split /,/, $line;
    $in_order = 0 if "@oids" ne join(' ', sort @oids);
    $seen{$_}++ for @oids;
    $random{substr($_, 8, 10)}++ for @oids;
}
1 while wait != -1;

is scalar(keys %seen), $children * $each, 'all OIDs from forked processes are unique';
ok $in_order, 'OIDs from each forked process are in order';
is scalar(keys %random), $children, 'each forked process has its own random bytes in its OIDs';

done_testing;
