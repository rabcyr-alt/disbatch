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

* From Git:

        git clone https://github.com/rabcyr-alt/disbatch.git
        cd disbatch
        dzil build
        cpanm disbatch-<VERSION>.tar.gz # NOTE: soft requirement on golang >= 1.26.7

* From CPAN (likely quite out of date):

        cpanm Disbatch # NOTE: soft requirement on golang >= 1.26.7

Set `DISBATCH_SKIP_GO=1` to not build optional `go-task-runner`.
Set `GO=<PATH>` to use other than the default `go`.

#### Configuring Disbatch 4.4

See [Configuring](docs/Configuring.md)


#### Creating task plugins

See [Plugins](docs/Plugins.md)


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


#### Configuring and Using TLS with MongoDB

See [TLS_MongoDB](docs/TLS_MongoDB.md)


#### Configuring and Using TLS with the Disbatch Command Interface

See [TLS_DCI](docs/TLS_DCI.md)


#### Authors

Ashley Willis (<consul-5flap@icloud.com>)

Matt Busigin (<mbusigin@hovernetworks.com>)


#### Copyright and License

This software is Copyright (c) 2016, 2019, 2026 by Ashley Willis.

This is free software, licensed under:

> The Apache License, Version 2.0, January 2004

This distribution includes third-party code copyright others and licensed under their own terms:

* web browser libraries in `etc/disbatch/htdocs/`, see [THIRD-PARTY-LIBS](THIRD-PARTY-LIBS)
* Go modules in `go/vendor/` (Apache License 2.0, MIT License, and BSD 3-Clause License), see `find go/vendor -name LICENSE`
