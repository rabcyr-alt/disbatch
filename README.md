disbatch
========
a scalable distributed batch processing framework


Disbatch 4.4 is a scalable distributed batch processing framework using MongoDB.
It runs on one-to-many Disbatch Execution Nodes (DEN), where each DEN handles
hundreds to thousands of concurrent tasks for one or more plugins.
Disbatch 4.4 can be updated and restarted as needed to deploy changes without
interrupting currently running tasks.

Each DEN starts independent tasks using the specified plugin, and a separate
process provides the Disbatch Command Interface (DCI) for the JSON REST API and
web browser interface.

This is almost a complete rewrite of Disbatch 3, written by Matt Busigin.

For an in-depth description of the design, see
[Design](docs/Design.md).


#### Installing

* From CPAN (not yet published):

        cpanm Disbatch

* From Git:

        git clone https://github.com/mbusigin/disbatch.git
        cd disbatch
        dzil build
        cpanm disbatch-<VERSION>.tar.gz

  `dzil build` also builds `go-task-runner`, the default task runner, with
  `dev/build-go-task-runner`, for Linux and macOS on x86_64 and arm64. They are
  in the tarball as `prebuilt/go-task-runner-OS-ARCH`, where `OS-ARCH` is the
  lowercase `uname -s` and `uname -m`, such as `linux-x86_64`. You need Go (the
  version in `go/go.mod`) installed, and it fails if `gofmt -l` or `go vet` have
  any output. It builds from `go/vendor` without downloading anything. To build
  only for this platform, such as to make `dzil test` faster:

        GO_TARGETS=host dev/build-go-task-runner

  `perl Makefile.PL` (so `cpanm`) installs the one for the platform it is run on
  as `go-task-runner`, in the same directory as the other programs (so
  `/usr/bin` for the RPM, but `/usr/local/bin` for `cpanm` by default, in which
  case set `task_runner` in the config file to its path). Set
  `DISBATCH_GO_TARGET` to install another, such as
  `DISBATCH_GO_TARGET=linux-aarch64 perl Makefile.PL`. If there is none for the
  platform, it is not installed, and `task_runner` in the config file needs to
  be the Perl `task_runner`.

  The RPM (built from `dist.spec`) installs the one for the architecture it is
  built for, and so is not `noarch`. Build for another architecture without
  being on it with `rpmbuild --target aarch64` (or `RPM_TARGET=aarch64
  ./rpm-demo-build.sh`).


#### Configuring Disbatch 4.4

See [Configuring](docs/Configuring.md)


#### Creating task plugins

See [Plugins](docs/Plugins.md). A plugin is either a Perl module, or a program
in any language that is run by `go-task-runner`, the default task runner. The
Perl `bin/task_runner` is still included, and can be used by setting
`task_runner` in the config file.


#### Creating web extension plugins

See [WebExtensions](docs/WebExtensions.md)


#### Running Disbatch 4.4

See [Running](docs/Running.md)


#### Running QueueBalance

See [QueueBalance](docs/QueueBalance.md)


#### Changes from Previous Versions

See [Differences](docs/Differences.md)


#### Upgrading from Previous Versions

See [Upgrading](docs/Upgrading.md)


#### Configuring and Using Authentication with MongoDB

See [Authentication_MongoDB](docs/Authentication_MongoDB.md)


#### Configuring and Using SSL with MongoDB

See [SSL_MongoDB](docs/SSL_MongoDB.md)


#### Configuring and Using SSL with the Disbatch Command Interface

See [SSL_DCI](docs/SSL_DCI.md)


#### Authors

Ashley Willis (<consul-5flap@icloud.com>)

Matt Busigin (<mbusigin@hovernetworks.com>)


#### Copyright and License

This software is Copyright (c) 2016, 2019, 2026 by Ashley Willis.

This is free software, licensed under:

> The Apache License, Version 2.0, January 2004

Some web browser code in `etc/disbatch/htdocs/` includes third-party libraries copyright others and licensed under their own terms.
See [THIRD-PARTY-LIBS](THIRD-PARTY-LIBS).
