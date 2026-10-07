Name: <% $zilla->name %>
Version: <% (my $v = $zilla->version) =~ s/^v//; $v %>
Release: 1%{?_dist}

Summary: <% $zilla->abstract %>
License: <% $zilla->license->name %>
Group: System/Cluster
Vendor: <% $zilla->license->holder %>
Source: <% $archive %>

BuildRoot: %{_tmppath}/%{name}-%{version}-BUILD
# Not noarch, as it includes go-task-runner (/usr/bin/go-task-runner), which is a compiled program and is the default task
# runner. Makefile.PL builds it (go/go-task-runner, from go/vendor, nothing is downloaded) when Go is installed, and
# `make install` installs it. To build for another architecture, use `rpmbuild --target aarch64`: Go cross compiles, so it does
# not need to be on that architecture. `goarch` is the name Go uses for the architecture, and can be given with
# `--define 'goarch arm64'` if it is not what is mapped below.
BuildRequires: perl >= 0:5.032001
# go/go.mod requires this version of Go. If Go was not installed from an RPM, run `rpmbuild --nodeps`.
BuildRequires: golang >= 1.26.7

%ifarch x86_64
%{!?goarch: %global goarch amd64}
%endif
%ifarch aarch64
%{!?goarch: %global goarch arm64}
%endif
%{!?goarch: %global goarch %{_target_cpu}}

# go-task-runner is built static and stripped, so there is no debuginfo to package, and nothing to strip, which would fail for
# a binary for another architecture
%global debug_package %{nil}
%global __strip /bin/true

Requires: perl(Limper::Engine::PSGI) perl(Starwoman)

Suggests: perl(Template) perl(Template::Plugin::SimpleJson)

%description
<% $zilla->abstract %>

%prep
%setup -q

%build
# Makefile.PL builds go/go-task-runner (static, stripped) for GOOS and GOARCH. GOCACHE is where the build can write to
export GOOS=linux GOARCH=%{goarch} GOCACHE="$PWD/go/.gocache"
PERL_MB_OPT="" PERL_MM_OPT="" CFLAGS="$RPM_OPT_FLAGS" perl Makefile.PL INSTALLDIRS=vendor
make

%check
make test

%install
if [ "%{buildroot}" != "/" ] ; then
    rm -rf %{buildroot}
fi
make install DESTDIR=%{buildroot}
#find %{buildroot} | sed -e 's#%{buildroot}##' > %{_tmppath}/filelist

[ -x /usr/lib/rpm/brp-compress ] && /usr/lib/rpm/brp-compress

find %{buildroot} \( -name perllocal.pod -o -name .packlist \) -exec rm -v {} \;

# installed by `make install` if Makefile.PL built it
test -x %{buildroot}/usr/bin/go-task-runner || { echo "ERROR: go-task-runner was not built, so was not installed: see the output of Makefile.PL above"; exit 1; }

find %{buildroot}/usr -type f -print | \
        sed "s@^%{buildroot}@@g" | \
        grep -v perllocal.pod | \
        grep -v "\.packlist" > %{name}-%{version}-filelist
if [ "$(cat %{name}-%{version}-filelist)X" = "X" ] ; then
    echo "ERROR: EMPTY FILE LIST"
    exit -1
fi

install -d -m0755 %{buildroot}/etc/disbatch
cp -Lr etc/disbatch/* %{buildroot}/etc/disbatch

install -D -m0755 etc/init.d/disbatchd %{buildroot}/etc/init.d/disbatchd
install -D -m0755 etc/init.d/disbatch-webd %{buildroot}/etc/init.d/disbatch-webd
install -D -m0755 etc/init.d/queuebalanced %{buildroot}/etc/init.d/queuebalanced
install -D -m0644 etc/logrotate.d/disbatch %{buildroot}/etc/logrotate.d/disbatch

%post
/sbin/chkconfig --add disbatchd
/sbin/chkconfig --add disbatch-webd
/sbin/chkconfig --add queuebalanced

%preun
if [ $1 -lt 1 ]; then
	/sbin/service disbatchd stop > /dev/null 2>&1
	/sbin/chkconfig --del disbatchd
	/sbin/service disbatch-webd stop > /dev/null 2>&1
	/sbin/chkconfig --del disbatch-webd
	/sbin/service queuebalanced stop > /dev/null 2>&1
	/sbin/chkconfig --del queuebalanced
fi

%clean
if [ "%{buildroot}" != "/" ] ; then
    rm -rf %{buildroot}
fi

%files -f %{name}-%{version}-filelist
/etc/init.d/disbatchd
/etc/init.d/disbatch-webd
/etc/init.d/queuebalanced
/etc/disbatch/
/etc/logrotate.d/disbatch

%defattr(-,root,root)

%changelog
* %(date '+%a %b %d %Y') Ashley Willis <consul-5flap@icloud.com> %{version}-1
- Initial Synacor build.
