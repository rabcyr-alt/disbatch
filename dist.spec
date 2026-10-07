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
BuildRequires: perl >= 0:5.032001
# go/go.mod requires this version of Go. It is built offline from go/vendor, without downloading anything.
# If Go was not installed from an RPM, run `rpmbuild --nodeps`.
BuildRequires: golang >= 1.26.7

# go-task-runner is built static and stripped, so there is no debuginfo to package
%global debug_package %{nil}

Requires: perl(Limper::Engine::PSGI) perl(Starwoman)

Suggests: perl(Template) perl(Template::Plugin::SimpleJson)

%description
<% $zilla->abstract %>

%prep
%setup -q

%build
PERL_MB_OPT="" PERL_MM_OPT="" CFLAGS="$RPM_OPT_FLAGS" perl Makefile.PL INSTALLDIRS=vendor
make

# go-task-runner. GOTOOLCHAIN=local and -mod=vendor so nothing is downloaded, and -buildvcs=false as there is no git here
export GOCACHE="$PWD/go/.gocache" GOFLAGS=-mod=vendor GOTOOLCHAIN=local CGO_ENABLED=0
(cd go && go build -trimpath -buildvcs=false -ldflags="-s -w" -o go-task-runner .)

%check
export GOCACHE="$PWD/go/.gocache" GOFLAGS=-mod=vendor GOTOOLCHAIN=local CGO_ENABLED=0
# fail on any output from gofmt or go vet
cd go
unformatted="$(gofmt -l *.go)"
if [ -n "$unformatted" ]; then
    echo "ERROR: gofmt needs to be run on: $unformatted"
    exit 1
fi
vetted="$(go vet ./... 2>&1)" || { echo "$vetted"; echo "ERROR: go vet failed"; exit 1; }
if [ -n "$vetted" ]; then
    echo "$vetted"
    echo "ERROR: go vet had output"
    exit 1
fi
cd ..
make test

%install
if [ "%{buildroot}" != "/" ] ; then
    rm -rf %{buildroot}
fi
make install DESTDIR=%{buildroot}
#find %{buildroot} | sed -e 's#%{buildroot}##' > %{_tmppath}/filelist

[ -x /usr/lib/rpm/brp-compress ] && /usr/lib/rpm/brp-compress

find %{buildroot} \( -name perllocal.pod -o -name .packlist \) -exec rm -v {} \;

# before the file list is made, so it is included in it
install -D -m0755 go/go-task-runner %{buildroot}/usr/bin/go-task-runner

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
