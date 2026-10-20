# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Disbatch 4.4: a distributed batch processing framework in Perl that uses MongoDB both as its data store and for all
message passing between components. `docs/Design.md` is the spec: the DEN protocol, the collection schemas, task status
codes, and every config file setting. Read it before changing how tasks are claimed, run, or written back.

## Components

- **DEN (Disbatch Execution Node)**: `bin/disbatchd`, with most of its logic in `lib/Disbatch.pm`. Once a second it
  upserts its `nodes` document, cleans up orphaned tasks, and claims queued tasks (`status -2` → `-1`) with
  `findOneAndUpdate` (bounded by the queue's `threads` and the node's `maxthreads`). For each claimed task it starts one
  DTR process.
- **DTR (Disbatch Task Runner)**: runs one task and writes its result to the task document (`status` first, then
  `stdout` and `stderr`; `complete` is only set with `--testing`). `disbatchd` forks and execs it with
  `--config <config_file>-task_runner --task <id>`.
  - `go/main.go` builds `go-task-runner`, the default DTR. It runs a plugin as a separate program of type `file` (the
    default), `collection`, or `handoff`, validates the result, and also sets `cmdExit`/`cmdErr`. Its documentation is
    `go/go-task-runner.pod`.
  - `bin/task_runner` is the legacy Perl DTR. It can only run Perl module plugins. `go-task-runner` also uses it, through
    the config's `plugin_runner`, to run Perl module plugins (`bin/task_runner --handoff`).
- **DCI (Disbatch Command Interface)**: `lib/Disbatch/Web.pm` is a JSON REST API built on Limper (PSGI via
  `etc/disbatch/app.psgi`). If Template Toolkit is installed it uses `lib/Disbatch/Web/TT.pm`, which is deprecated (see
  the `TT-*.md` notes). `bin/disbatch` is the CLI client for this API. It does not read `config.json`, but its own
  config file (`--config`, `~/.disbatch.json`, or `/etc/disbatch/cli.json`), which only has `ssl_opts`. Web extensions
  add routes (`docs/WebExtensions.md`).
- **QueueBalance**: `lib/Disbatch/QueueBalance.pm` and `bin/queuebalanced`.
- **MongoDB roles/users**: `lib/Disbatch/Roles.pm` and `bin/disbatch-create-users`. Each component connects as its own
  user (`disbatchd`, `disbatch_web`, `task_runner`, `plugin`). If you add a MongoDB operation, check that the role
  running it has the permission.
- **Web UI**: an Angular SPA whose source is in `web/` (excluded from the dist). The built bundle is **committed** to
  `etc/disbatch/htdocs/`, which the DCI serves as `web_root`. Commits that change frontend source deliberately do not
  rebuild `htdocs/`; `web/scripts/build.sh` regenerates it at release time.

Task stdout/stderr may be stored in GridFS (`tasks.files`/`tasks.chunks`). The two runners store chunks differently:
`bin/task_runner` uses `put_gfs()` (chunk `data` stored as String), while `go-task-runner` uses the driver's standard
format (BinData). `get_gfs()` reads both. TLS settings go in the `mongohost` connection string; the old `attributes`
config key is no longer used. `lib/Disbatch.pm` replaces `BSON::OID::_packed_oid` so that OIDs created in forked processes stay ordered
(tested by `t/004_oid.t`). `Disbatch::logger()` attaches the `log4perl` appenders to the root logger, so every category
(`disbatch`, `disbatch.DEN`, a plugin's class) logs no matter which is created first.

## Build and test

The build is driven by Dist::Zilla (`dist.ini`):

```sh
dzil build      # first runs dev/check-go: fails on any `gofmt -l *.go` or `go vet main.go` output for go/
dzil test       # author tests need MongoDB (mongod in PATH, or set MONGOD)
```

`dist.ini` uses MakeMaker::Awesome with `dev/Makefile.PL-header`, so the generated `Makefile.PL` builds
`go/go-task-runner` when a new enough Go (the version in `go/go.mod`) is installed. The Go build uses `go/vendor` and
downloads nothing. To build it by hand:

```sh
(cd go && go build -mod=vendor -o go-task-runner .)
```

Run tests individually:

```sh
prove -l t/001_base.t t/004_oid.t                                       # no MongoDB needed
AUTHOR_TESTING=1 USE_SSL=0 USE_AUTH=0 perl -Ilib t/002_full.t           # full: starts mongod, disbatchd, and the DCI
AUTHOR_TESTING=1 USE_SSL=0 USE_AUTH=0 prove -v t/003_go_task_runner.t   # runs go-task-runner directly against mongod
AUTHOR_TESTING=1 QUICK=1 prove t/003_go_task_runner.t                    # about 15s: a quick check after changing go/main.go
```

`002_full.t` tests everything through the DCI. Tests that call `Disbatch` methods or the runners directly (such as
`save_strict_config`, `validate_plugins`, and Perl module plugins via `plugin_runner`) go in `003_go_task_runner.t`.
Plain `dzil test` never runs the Perl DTR on its own; run `002_full.t` with `TASK_RUNNER=./bin/task_runner` for that.

Test environment variables:

- `USE_SSL`, `USE_AUTH`: both default to 1.
- `GFS_TESTS=none`: skips the slow GridFS tests.
- `QUICK=1`: makes `003_go_task_runner.t` skip the GridFS and Perl module plugin tests (the module tests start `bin/task_runner`).
- `TASK_RUNNER=./bin/task_runner`: makes `002_full.t` use the Perl DTR.
- `MODULE=1`: the opposite of `QUICK=1`: makes `003_go_task_runner.t` run only the Perl module plugin tests.
- `PERL_PLUGINS=1`: makes `003_go_task_runner.t` use the Perl test plugins instead of the Go ones.
- `GO_TASK_RUNNER`: path to the Go binary. If unset, tests use `go/go-task-runner`, then `/usr/bin/go-task-runner`.
- `SKIP_FULL_TESTS`: skips `002_full.t` and `003_go_task_runner.t`.

`t/TestMongo.pm` is the shared harness that starts mongod. The test plugins are `t/task-{file,collection,handoff,handoff-raw}.pl`
(one per plugin type) and the Perl module `Disbatch::Plugin::Test` (`t/Disbatch/Plugin/Test.pm`, not installed);
`t/ParamsResult.pm` reads each task's `params` to decide what the plugin returns. The program plugins have Go versions in
`go/t/` (`testplugin` is the Go `ParamsResult`), which `003_go_task_runner.t` builds and uses as they start much faster;
`PERL_PLUGINS=1` makes it use the Perl ones. Keep both versions in sync. `Disbatch::Plugin::Test` needs
`PERL5LIB=t` (not `-It`, as `bin/task_runner` is a separate process), which `dev/disbatchd` sets. `t/TLS` shows how the
test TLS certificates were generated.

Web UI (in `web/`): `npx ng serve` proxies the API to `perl -Ilib dev/disbatch-web` on port 8080; `npx ng test` runs
Vitest; `./scripts/build.sh` builds the bundle and syncs it into `etc/disbatch/htdocs/`.

To run locally from the checkout: `dev/disbatchd` and `dev/disbatch-web`. Both use `etc/disbatch/config.json`, which is
gitignored; copy it from `config.json-example`.

## Packaging

- The RPM is built from `dist.spec` (`rpm-demo-build.sh`; set `RPM_TARGET=aarch64` to cross-compile). It requires Go,
  so it is not noarch.
- A runtime prereq added to `[Prereqs]` in `dist.ini` must also be added to `Requires:` in `dist.spec`.
- `PkgVersion` has `die_on_existing_version`, so do not add `$VERSION` to modules by hand.
- A behavior change usually also needs updates to the matching `docs/*.md`, the POD in `bin/*`, and `go/go-task-runner.pod`.

## Repo conventions

- A commit that changes a single file has the file's path as its subject prefix, e.g. `lib/Disbatch/Web.pm: ...`.
  Commits that change several files use a plain summary.
- Untracked `*.md` files in the repo root (plans, summaries, reviews) are personal dev notes and are ignored by
  `.gitignore`. Files ending in `~` are editor backups and the `ignore/` directories are scratch; all are ignored.
- Make single-issue commits on the current branch. The author rebases (and reorders fixup commits by hand) later.
- Docs are terse, in the author's style. `docs/Running.md` is for admins and operators; details only needed when
  developing the runners themselves belong in the POD or `docs/Design.md`, not there.

## Decisions and known issues

The author has already decided these. Do not raise them again as problems:

- `go/main.go` is written only by the author, as an exercise in learning Go. Never modify it; report issues instead.
- An unknown `log4perl.level` falling back to TRACE in `go-task-runner` is fine.
- `config.auth` is meant to have all MongoDB users or none. `save_strict_config()` still gives a user missing from it an
  empty `auth` (never the others' passwords), as runners and plugins may later run as different users.
- `lib/Disbatch.pm` calls `Crypt::URandom::urandom` without `use Crypt::URandom`: it is only used in the
  `BSON::OID::_packed_oid` override, and `BSON::OID` (loaded by `MongoDB`) always loads it.
- `validate_plugins()` accepts program plugins even when `task_runner` is the Perl one: those tasks fail visibly with
  status `2`, and the fallback to the Perl runner already logs a warning.
- `docs/Configuring.md` does not mention `cli.json`: it is optional, and `docs/TLS_DCI.md` (linked from there) covers it.
- `--quiet` is only passed to plugins of type `handoff` (documented).
- For a valid `handoff` result, `go-task-runner` does not log `Task <id> succeeded.`/`failed.`: logging that is the
  `handoff` plugin's job, as `bin/task_runner --handoff` and `t/task-handoff.pl` do.
