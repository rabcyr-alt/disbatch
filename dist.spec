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
# runner. (An RPM can only have noarch subpackages, so a separate arch-specific go-task-runner subpackage is not possible
# while the Perl part is noarch.)
# go-task-runner is not built here: `dzil build` builds it for every platform (dev/build-go-task-runner, which also fails on
# any gofmt or go vet output) as prebuilt/go-task-runner-OS-ARCH in the tarball, and Makefile.PL installs the one for
# `go_target` (default `linux-` and the architecture being built for, so `rpmbuild --target aarch64` makes an aarch64 package,
# with no need to be on that architecture, as everything else is Perl). Use `--define 'go_target linux-aarch64'` to pick
# another, such as when `--target` is not the same name as `uname -m` gives.
%{!?go_target: %global go_target linux-%{_target_cpu}}
BuildRequires: perl >= 0:5.032001

# go-task-runner is already built static and stripped, so there is no debuginfo to package, and nothing to strip, which would
# fail for a binary for another architecture
%global debug_package %{nil}
%global __strip /bin/true

Requires: perl(Limper::Engine::PSGI) perl(Starwoman)

Suggests: perl(Template) perl(Template::Plugin::SimpleJson)

%description
<% $zilla->abstract %>

%prep
%setup -q

%build
DISBATCH_GO_TARGET=%{go_target} PERL_MB_OPT="" PERL_MM_OPT="" CFLAGS="$RPM_OPT_FLAGS" perl Makefile.PL INSTALLDIRS=vendor
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

# installed by `make install` from prebuilt/go-task-runner-%{go_target}, or not at all if there is none for it
test -x %{buildroot}/usr/bin/go-task-runner || { echo "ERROR: no prebuilt/go-task-runner-%{go_target} in the tarball, so go-task-runner was not installed: use the tarball made by dzil build, and a go_target it has"; exit 1; }

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
