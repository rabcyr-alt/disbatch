# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Disbatch is a scalable distributed batch processing framework written in Perl, using MongoDB as its data store and message broker. It processes tasks across one or more Disbatch Execution Nodes (DENs), each handling hundreds to thousands of concurrent tasks via a plugin architecture.

## Build & Development Commands

**Build distribution** (requires Dist::Zilla):
```bash
dzil build
```

**Install from built tarball:**
```bash
cpanm disbatch-<VERSION>.tar.gz
```

**Run DEN daemon in development:**
```bash
perl -Ilib ./bin/disbatchd --config etc/disbatch/config.json
```

**Run web server (DCI) in development:**
```bash
perl -Ilib dev/disbatch-web
```

**Build the Angular SPA** (requires Node.js + npm; builds into `etc/disbatch/htdocs/` so the existing static route serves it):
```bash
cd web && ./scripts/build.sh
```

**Run the Angular dev server** (port 4200, proxies API paths to the Perl dev server at `http://localhost:8080`):
```bash
cd web && npx ng serve
```

**Run basic test:**
```bash
perl -Ilib t/001_base.t
```

**Run full integration tests** (requires a `mongod` binary available; the test spawns its own MongoDB instance):
```bash
AUTHOR_TESTING=1 perl -Ilib t/002_full.t
```

Integration tests accept `USE_SSL=0` and `USE_AUTH=0` env vars to disable SSL/auth testing (both default to enabled).

## Architecture

### Core Components

1. **DEN (`bin/disbatchd`)** — Daemon that monitors queues in a 1-second loop: runs pre-hook, cleans orphaned tasks, claims and dispatches tasks, updates node status in MongoDB.

2. **DTR (`bin/task_runner`)** — Subprocess spawned by DEN for each claimed task. Loads the appropriate plugin, executes it, and writes status/stdout/stderr back to MongoDB.

3. **DCI (`lib/Disbatch/Web.pm`)** — PSGI-based REST API and web UI using the Limper framework and Starwoman server. Provides JSON endpoints for queue/task/node management and serves an Angular SPA (built into `etc/disbatch/htdocs/`) at `GET /`. Client-side routing is hash-based, so the server only ever serves the SPA shell for `/`; all other paths are JSON API calls or static assets. Entry point for development: `dev/disbatch-web`; production: `etc/disbatch/app.psgi`. The SPA source lives in `web/` (Angular 22 + TypeScript + Angular Material); build with `web/scripts/build.sh`.

4. **CLI (`bin/disbatch`)** — Command-line client that talks to the DCI REST API for queue and task management.

5. **QueueBalance (`lib/Disbatch/QueueBalance.pm`, `bin/queuebalanced`)** — Optional daemon for time-of-day-based automatic thread limit adjustment.

### Key Modules

- **`lib/Disbatch.pm`** — Base class: MongoDB connection management, config loading, logging (Log4perl), task claiming/unclaiming, orphan cleanup, queue processing loop, plugin validation, GridFS file storage.
- **`lib/Disbatch/Web.pm`** — All REST API routes and SPA shell serving. Uses `Limper` for routing. `GET /` serves the Angular SPA shell; `GET /tasks`, `/tasks/:id`, and `/balance` always return JSON (the old Template Toolkit HTML branches were removed with the SPA migration).
- **`lib/Disbatch/Web/Files.pm`** — Static file serving routes.
- **`lib/Disbatch/Roles.pm`** — MongoDB RBAC: defines 5 roles (`disbatchd`, `disbatch_web`, `task_runner`, `queuebalance`, `plugin`) and user/role creation utilities.
- **`lib/Disbatch/Plugin/Demo.pm`** — Reference plugin implementation showing the required interface.

### Task Lifecycle & Status Codes

Tasks flow through: `-2` (queued) → `-1` (claimed by DEN) → `0` (running in DTR) → `1` (success) or `2` (failure). Status `-6` marks orphaned tasks.

### Plugin Interface

Plugins must implement `new({workerthread => $disbatch_obj, task => $task_doc})` and `run()` which returns `{status => $int, stdout => $str, stderr => $str}`. Status `1` = success, `2` = failure. Plugins must be whitelisted in config `plugins` array. See `docs/Plugins.md` and `lib/Disbatch/Plugin/Demo.pm`.

### MongoDB Collections

`nodes`, `queues`, `tasks`, `tasks.files`/`tasks.chunks` (GridFS for large stdout/stderr), `balance`, `changelog`, `reports` (optional, per-plugin).

## Configuration

Config is JSON at `/etc/disbatch/config.json` (dev: `etc/disbatch/config.json-example`). Mandatory keys: `mongohost` (MongoDB URI), `database`. Optional: `auth`, `attributes.ssl`, `plugins`, `task_runner`, `gfs`, `web_root`, `views_dir`, `log4perl`, `activequeues`/`ignorequeues`, `node_increase`/`queue_increase` (throttling), `pre_hook`, `web_extensions`, `monitoring`, `balance`.

## Key Dependencies

- Perl 5.32.1+, MongoDB 2.2.2, BSON::OID, Cpanel::JSON::XS, Log::Log4perl, Limper 0.015+, Limper::Engine::PSGI, Starwoman, Try::Tiny::Retry, Template::Plugin::SimpleJson

## Conventions

- Uses `BSON::OID` (not the older `MongoDB::OID`) for ObjectId handling.
- Uses `count_documents()` and `insert_one()` (modern MongoDB driver API, not deprecated `count()`/`insert()`).
- Config JSON uses relaxed parsing (comments allowed via Cpanel::JSON::XS `relaxed` mode).
- Web templates use Template Toolkit 2 format in `etc/disbatch/views/`.
- Web static files in `etc/disbatch/htdocs/` (jQuery, EditableGrid).
- RPM packaging defined in `dist.spec`; dependencies must be mirrored between `dist.ini` and `dist.spec`.
