# Plan: Modernize the Disbatch Web Interface to Angular + TypeScript

## 1. Goal & Scope

Replace the current server-rendered / jQuery / Bootstrap / EditableGrid web UI
entirely with a modern **Angular + TypeScript** single-page application (SPA),
while making **minimal, surgical changes to the Perl backend**.

**In scope:**
- New Angular SPA living in a new `web/` directory at the repo root.
- The SPA consumes the **existing JSON REST API** (unchanged).
- Replace all of `etc/disbatch/htdocs/` (jQuery, EditableGrid, old CSS/JS/images,
  static `index.html`) and the built-in Template Toolkit views (`index.tt`,
  `query.tt`, `balance.tt`) with the Angular build output.
- Update packaging, tests, and third-party notices.

**Out of scope (intentionally untouched):**
- The JSON REST API endpoints and their request/response shapes.
- The `disbatch` CLI (it only uses JSON).
- MongoDB auth/roles (`lib/Disbatch/Roles.pm`).
- The `web_extensions` plugin mechanism (it keeps working; see §4.4).
- `disbatchd`, `task_runner`, `queuebalanced`, plugins.

---

## 2. Current State (what we are replacing)

**Backend (`lib/Disbatch/Web.pm`, PSGI via Limper/Starwoman):**
- A JSON REST API: `GET /info`, `/plugins`, `/nodes[/:node]`, `/queues[/:queue]`,
  `/tasks[/:id]`, `/balance`, `/monitoring`; `POST /nodes/:node`, `/queues`,
  `/queues/:queue`, `/tasks`, `/balance`; `DELETE /queues/:queue`.
- `GET /` renders `views/index.tt` (Template Toolkit).
- `GET /tasks` and `GET /tasks/:id` return **HTML** (`query.tt`) when the
  `Accept` header prefers `text/html`, else JSON — via the existing `want_json()`.
- `GET /balance` likewise returns HTML (`balance.tt`) or JSON.
- `Disbatch::Web::Files` registers a catch-all `GET qr{^/}` that serves static
  files from `config.web_root` (default `/etc/disbatch/htdocs/`).
- `want_json()`: returns **false** (wants HTML) when `Accept` has `text/html`
  with q ≥ the `application/json` q (json defaults to 1, html defaults to 0).
  Crucially, a bare `*/*` (Angular `HttpClient` default) resolves to **JSON**.

**Frontend (to be deleted):**
- `etc/disbatch/htdocs/index.html` — static queue browser shell.
- `etc/disbatch/htdocs/js/queues.js` — queue/node tables via EditableGrid.
- `etc/disbatch/htdocs/js/editablegrid*.js` — EditableGrid library (~125 KB).
- `etc/disbatch/htdocs/javascripts/` — `jquery.js` (1.4.2), `jquery.serialize-object.min.js`,
  `balance.js`, `custom.js`, `expander.js`.
- `etc/disbatch/htdocs/css/` — `editablegrid.css`, `simple.css`, `style.css`, `balance.css`.
- `etc/disbatch/htdocs/images/` — bullet arrows, expand/collapse gifs.
- Bootstrap 3.3.6 + jQuery 1.11.3 loaded from CDNs inside `index.tt`.
- `etc/disbatch/views/index.tt`, `query.tt`, `balance.tt`.

**Dead code discovered:** `query.tt` renders Cancel/Reset/Clone buttons that call
`modifyDocument()` → `POST|DELETE /tasks/:id`, but **no such routes exist** in
`Web.pm`. These buttons are non-functional today and will simply not be ported
(see §5.5).

---

## 3. Proposed Architecture

```
Browser ──> nginx (SSL) ──> Starwoman (app.psgi) ──> Disbatch::Web (Limper)
                                  │
                  ┌───────────────┴────────────────┐
                  │                                 │
          JSON REST API (unchanged)        Static SPA assets
          /info /plugins /nodes /queues      (Angular build output in
          /tasks /balance /monitoring         web_root) + SPA shell at GET /
```

- The Angular SPA is built to `etc/disbatch/htdocs/` (the existing `web_root`),
  so the **existing catch-all static route serves it with zero new serving logic**.
- All data interaction goes through the **existing JSON endpoints**.
- `GET /` serves the SPA shell (`index.html`); all other paths are pure JSON
  API calls. Browser navigation uses hash routing (see "Routing strategy" below).

### Routing strategy: hash-based (Option B) — DECIDED

The SPA uses **hash-based routing**: Angular routes live after the URL fragment
(`#`), e.g. `/#/queues`, `/#/queues/<id>`, `/#/tasks/<id>`, `/#/balance`. The
fragment is never sent to the server, so the browser only ever requests the path
`/`. This means:

- The **only** routing change the backend needs is `GET /` serving the SPA shell.
- There is **zero** possibility of collision between Angular view URLs and JSON
  API URLs (views are all client-side, after `#`).
- Refresh / bookmark / deep-link all work, because the server only ever sees `/`.
- The existing `want_json()` HTML branches on `/tasks`, `/tasks/:id`, `/balance`
  become dead code (browsers never request those paths directly), so they are
  simplified to always return JSON (§4.2) — which also lets us delete the `.tt`
  files cleanly.

Trade-off: URLs contain a `#` (e.g. `https://host/#/tasks/507f...`). This is
accepted in exchange for the absolute-minimum backend footprint.

> **Not chosen — Option A (path-based + content negotiation), for reference:**
> clean URLs (`/queues`, `/tasks/<id>`) where browser deep-links return the SPA
> shell via the existing `want_json()` while Angular's `HttpClient` calls (Accept
> `*/*` → JSON) return data. Requires ~6–8 one-line `unless want_json` fallbacks
> on GET routes. Rejected to keep backend changes to a single route.
>
> | | Option A (path) | Option B (hash, chosen) |
> |---|---|---|
> | Example URL | `/tasks/507f...` | `/#/tasks/507f...` |
> | Backend routing edits | ~6–8 one-liners + `GET /` | just `GET /` |
> | Route/API collision risk | low (handled by `want_json`) | none |
> | URL aesthetics | clean | has `#` |
> | Deep-link/refresh | works (server returns shell) | works (server only sees `/`) |

---

## 4. Backend Changes (minimal)

All JSON request/response behavior is preserved. Edits live in
`lib/Disbatch/Web.pm` unless noted.

### 4.1 Serve the SPA shell (the one routing change)

Add a small helper and point `GET /` at it:

```perl
sub serve_spa {
    # serve the Angular index.html from web_root
    send_file 'index.html';
}
```

Replace the body of `get '/' => sub { ... }` (currently renders `index.tt`) with
`serve_spa()`. This is the **only** routing change required for hash-based
routing (Option B): the browser never requests any other path directly.

### 4.2 Simplify the HTML-returning GET routes to always return JSON

With hash routing, browsers never request `/tasks`, `/tasks/:id`, or `/balance`
directly (those are all after `#`), so the existing `want_json()` HTML branches
on those routes are dead code. Since we are deleting `query.tt` and `balance.tt`
(§4.4), remove the HTML branches so these routes **always return JSON**:

- `GET /tasks` — drop the `!$want_json` `template 'query.tt'` branches (both the
  empty-params form and the results branch). The with-params JSON path is
  unchanged. **Plus** the indexes decision (§4.3): the no-params-no-options case
  becomes a `200` returning `{ schema, indexes }` instead of a `400` error body.
- `GET /tasks/:id` — drop the `!$want_json` `template 'query.tt'` branch; always
  return JSON (task object, or `{ error => "no task with id ..." }` with 404).
- `GET /balance` — drop the `!$want_json` `template 'balance.tt'` branch; always
  return the JSON balance object.

This makes the API uniformly JSON and removes the last references to the deleted
templates. No `Accept`-header handling is needed on the Angular side because
these routes now ignore `Accept` entirely.

**Cruft removed vs. kept** (constraint: do not break the JSON API or
`web_extensions`):

*Removed* (dead under hash routing):
- The `want_json()` branches and `template 'query.tt'` / `template 'balance.tt'`
  calls in the three route handlers above.
- The `$want_json` local and its use as `query()`'s `$raw` argument in those
  routes (core now always passes `1`).

*Kept* (documented / extension-facing / used by the JSON path):
- `template()`, the `$tt` Template instance, `views/layouts/main.tt`, `Template`,
  `Template::Plugin::SimpleJson` — `web_extensions` call `template()` (§4.4).
- `want_json()` / `parse_accept()` — no longer used by core, but documented in
  the POD and available to extensions. Left in place (harmless).
- `query()`, `get_indexes()`, `invalid_params()`, `params_to_query()`,
  `_munge_tasks()` — still used by the JSON path of `GET /tasks` / `/tasks/:id`.
  `query()`'s `$raw=0` return shape (`{ result => json_string, title, count, ... }`)
  is no longer exercised by core but is retained as a documented public helper;
  simplifying it is out of scope (risk to extensions).

### 4.3 Indexes for the Tasks query form — DECIDED (modify `GET /tasks`)

The Tasks query form needs the `tasks` collection index sets (e.g.
`[["id"], ["node","status","queue","id"], ["queue","status"]]`) to build its
search fields — the backend only allows querying indexed fields. Today these are
only surfaced via the (deleted) HTML form, or embedded in a `400` error body
from `GET /tasks` (no params).

**Decision:** make `GET /tasks` with **no params and no options** return a `200`
success with `{ schema, indexes }` — exactly what the current HTML-form branch
computes, just emitted as JSON instead of via `template 'query.tt'`. Concretely,
change the existing guard from:

```perl
if (!$want_json and !%$params and !%$options) {
    my $result = { schema => $schema, indexes => $indexes };
    return template 'query.tt', $result;
}
```

to:

```perl
if (!%$params and !%$options) {
    return send_json { schema => $schema, indexes => $indexes }, send_json_options;
}
```

(The `$schema`/`$indexes` are already computed just above this block, so this is
a two-line change.)

Why this is non-breaking:
- The CLI (`bin/disbatch tasks`) **always** sends options (at minimum `.limit =>
  20`), so it never hits the no-params-no-options case — unaffected.
- The existing test suite's `GET /tasks` calls all send a JSON body with `.count`
  or `.limit`; **none** hit the empty case. The `400` tests that remain assert
  the *non-indexed-params* error (`'non-indexed params given'`), a different code
  path that is untouched.
- A request with no params **but** options (e.g. `?.limit=20`) still proceeds to
  `query()` and returns up to 20 tasks — unchanged.

*Rejected alternatives:*
- **Parse the `400` body** for `indexes` — works but hacky; the
  `ErrorInterceptor` would have to treat a 400 as data.
- **Add `GET /tasks/indexes`** — clean, but a brand-new route (more surface).
- **Add indexes to `GET /info`** — clean, but adds a `tasks` index-listing DB
  query to a route that currently does none, on every call.

Modifying `GET /tasks` reuses the already-computed `$schema`/`$indexes` with no
new route and no extra DB query beyond what the route already does.

### 4.4 Keep the extension mechanism intact

`web_extensions` packages may call the exported `template()`, which uses
`WRAPPER => 'layouts/main.tt'`. Therefore:

- **Keep** `views/layouts/main.tt` (do not delete it).
- **Keep** the `Template` dependency and the `$tt` instance built in `init()`.
- **Keep** `Template::Plugin::SimpleJson` as a prereq (harmless; extensions may
  use it).
- Delete only `index.tt`, `query.tt`, `balance.tt`.

### 4.5 Backend change summary

| File | Change |
|---|---|
| `lib/Disbatch/Web.pm` | `GET /` → serve SPA shell (`serve_spa()`); drop dead HTML/template branches on `GET /tasks`, `/tasks/:id`, `/balance` (always JSON); change `GET /tasks` no-params-no-options from `400 {error,indexes}` to `200 {schema,indexes}` (§4.3). **No new routes.** |
| `lib/Disbatch/Web/Files.pm` | None (catch-all still serves static SPA assets). |
| `etc/disbatch/views/index.tt` | Delete. |
| `etc/disbatch/views/query.tt` | Delete. |
| `etc/disbatch/views/balance.tt` | Delete. |
| `etc/disbatch/views/layouts/main.tt` | **Keep** (for `web_extensions`). |
| `etc/disbatch/htdocs/**` | Delete all current contents; replaced by Angular build output. |
| `etc/disbatch/config.json`(-example) | `views_dir` becomes unused by core (leave it; extensions may use it). `web_root` unchanged. |
| `dist.ini` / `dist.spec` | No Perl dependency removals (keep Template/SimpleJson for extensions). **No build-flow change** — built artifacts are committed to `etc/disbatch/htdocs/` and shipped by the existing `cp -Lr etc/disbatch/*` (§6.3). |
| `THIRD-PARTY-LIBS` | Rewrite: remove jQuery/EditableGrid/expander/serialize-object; add Angular + Angular Material (MIT). |

---

## 5. Frontend (Angular) Plan

### 5.1 Project layout

New `web/` directory at repo root (**Angular 22**, standalone components,
TypeScript, `npx ng build --configuration production` → `web/dist/<app>/`):

```
web/
  package.json
  angular.json
  tsconfig.json
  proxy.conf.json          # dev: forward API paths to http://localhost:8080
  scripts/build.sh         # npx ng build + sync dist → ../etc/disbatch/htdocs/
  src/
    main.ts
    index.html             # SPA shell (built into htdocs/index.html)
    styles.scss            # global theme
    app/
      app.config.ts        # provideRouter(routes, withHashLocation()), provideHttpClient, provideAnimations
      app.routes.ts        # lazy routes
      core/
        interceptors/accept-json.interceptor.ts   # sets Accept: application/json
        interceptors/error.interceptor.ts         # global error → snackbar
        models/            # queue.ts, node.ts, task.ts, balance.ts, monitoring.ts, info.ts
        services/          # queues.service.ts, nodes.service.ts, tasks.service.ts,
                           # plugins.service.ts, balance.service.ts, monitoring.service.ts, info.service.ts
      layout/shell.component.ts   # <mat-sidenav> nav + <router-outlet> + refresh control
      features/
        queues/            # list + create dialog + inline edit + delete
        nodes/             # active + dead tables, edit maxthreads
        tasks/
          query/           # dynamic form from indexes + results table + pagination
          detail/          # single task, stdout/stderr terse/full toggle
        balance/           # queues priority + intervals + disable/re-enable
        monitoring/        # status cards (disbatch + queuebalance)
        info/              # database, routes, extensions
      shared/
        components/        # status-badge, confirm-dialog, json-viewer, refresh-button
```

**UI library:** Angular Material (DECIDED) — replaces Bootstrap + EditableGrid:
`MatTable` for editable grids, `MatDialog` for the "New Queue" modal,
`MatFormField`/`MatSelect`/`MatInput` for forms, `MatSnackBar` for feedback,
`MatSidenav` + `MatToolbar` for the shell. Add it during scaffolding with
`npx ng add @angular/material`.

### 5.2 HTTP layer

- One `HttpClient`-based service per resource, calling the existing endpoints
  (same origin, base `/`).
- `ErrorInterceptor`: surfaces API errors via `MatSnackBar`; maps the
  `{ "error": "..." }` bodies the API already returns.
- `AcceptJsonInterceptor`: sets `Accept: application/json` on every request.
  Not strictly required for correctness under Option B (the API routes now
  always return JSON, and `GET /` is only hit by the browser), but included for
  hygiene and self-documentation.
- Typed models mirror the documented response shapes, e.g.:

  ```ts
  interface Queue { id: string; plugin: string; name: string;
                    threads: number | null; queued: number; running: number; completed: number; }
  interface Node  { id: string; node: string; maxthreads: number | null; timestamp: number; }
  type TaskStatus = -6 | -2 | -1 | 0 | 1 | 2;
  interface Task  { _id: string; queue: string; status: TaskStatus;
                    params: Record<string, unknown>; node: string | null;
                    ctime: string | number; mtime: string | number;
                    stdout: string | null; stderr: string | null; }
  ```

### 5.3 Feature: Queues (replaces `index.tt` queues section + `queues.js`)

- `MatTable` columns: ID, Type (plugin, editable select), Name (editable),
  Threads (editable number), Queued, Running, Completed (read-only).
- Inline edit → `POST /queues/:id` with the changed field; refresh row on success.
- "New Queue" `MatDialog`: Name input + Plugin select populated from
  `GET /plugins` → `POST /queues`.
- Delete (with confirm dialog) → `DELETE /queues/:id`.
- Auto-refresh via RxJS `timer`/`interval` + `switchMap` (default 60 s, configurable
  in the shell toolbar), replacing the `window.setInterval(..., 60000)` in `queues.js`.

### 5.4 Feature: Nodes (replaces nodes section of `queues.js`)

- `GET /nodes` → split into **active** (timestamp within 15 min) and **dead**
  tables, matching the current `new Date(n.timestamp+900000) >= new Date()` logic.
- Editable `maxthreads` → `POST /nodes/:node`.
- Same auto-refresh cadence as Queues.

### 5.5 Feature: Tasks query (replaces `query.tt` + `custom.js`/`expander.js`)

- On entry, fetch index sets via `GET /tasks` with no params → `200 { schema, indexes }` (§4.3).
- Build a **reactive form** dynamically from the index sets: one repeatable input
  per indexed field (repeats become `$or`), plus options `.limit`, `.skip`,
  `.fields`, `.terse`, `.full`, `.epoch`, `.pretty` (matching the API's dot-options).
- Submit → `GET /tasks` with the assembled query string → `MatTable` of results
  (pretty-printed JSON per row, like the current `<pre>` blocks).
- Pagination via `.limit`/`.skip` "Next N results" (mirrors current `query.tt`).
- Row click → Task detail view.
- Note: Cancel/Reset/Clone buttons are **not** ported — they reference
  `POST|DELETE /tasks/:id` which do not exist (dead code today). They can be
  added later if those routes are introduced.

### 5.6 Feature: Task detail (replaces `query.tt` single-task branch)

- `GET /tasks/:id` → show all fields; pretty-print `params`.
- stdout/stderr: a "full" toggle calls `GET /tasks/:id?.full=1` to resolve GridFS
  content (replaces the `document.`/`_munge_tasks` `.full` behavior).
- 404 → "no task with id" message (matches current API behavior).

### 5.7 Feature: Balance (replaces `balance.tt` + `balance.js`)

- `GET /balance` (JSON) → reactive form:
  - **queues**: ordered list of comma-separated priority groups (add/remove rows).
  - **max_tasks**: rows of DOW select (`*`,`0`–`6`) + `HH:MM` + max int
    (add/remove rows).
  - **disable**: duration select + re-enable checkbox (mutually exclusive).
- Client-side validation ported from `balance.js` (time regex, integers, queue
  names against `known_queues`, no duplicates, no incomplete intervals).
- Submit → `POST /balance` with the exact JSON shape the API expects
  (`{ max_tasks: {...}, queues: [[...]], disabled?: number|null }`).
- Live JSON preview pane (replaces the `<pre id="result">`).

### 5.8 Features: Monitoring & Info

- **Monitoring** (`GET /monitoring`): status cards for `disbatch` and
  `queuebalance` using a shared `StatusBadgeComponent` (OK=green,
  WARNING=amber, CRITICAL=red). Auto-refresh.
- **Info** (`GET /info`): show database name, loaded `web_extensions`, and routes
  grouped by HTTP verb (replaces the `index.tt` dropdowns).
- A **Dashboard** is **not** added; `/` lands on the Queues + Nodes view
  (closest to today's behavior) — see §11 decision 5.

### 5.9 Shell / navigation

- `ShellComponent` with a `MatSidenav` (Queues, Nodes, Tasks, Balance,
  Monitoring, Info) and a top toolbar showing the database name (from `GET /info`)
  and the global refresh-interval control.
- Replaces the Bootstrap navbar + "routes"/"loaded extensions" dropdowns.

---

## 6. Build & Packaging

### 6.1 Build flow

`web/scripts/build.sh`:

```sh
#!/bin/sh
set -e
cd "$(dirname "$0")/.."
npm ci
npx ng build --configuration production
rm -rf ../etc/disbatch/htdocs/*
cp -a dist/*/.[!.]* dist/*/* ../etc/disbatch/htdocs/   # incl. hidden assets if any
```

(`rsync -a --delete dist/<app>/ ../etc/disbatch/htdocs/` is a cleaner equivalent.)

### 6.2 Development

**Prerequisites:** Node.js + npm are required on the dev machine (available in
the current environment: node v24, npm 11). The Angular CLI is a project
devDependency — invoke it as `npx ng ...`, not a global `ng`. Run the Perl dev
DCI with `perl -Ilib dev/disbatch-web`; run the full test suite with
`AUTHOR_TESTING=1 perl -Ilib t/002_full.t` (requires a `mongod` binary; see
`CLAUDE.md`).

- `npx ng serve` (port 4200) with `proxy.conf.json` forwarding the API paths
  (`/info`, `/plugins`, `/nodes`, `/queues`, `/tasks`, `/balance`, `/monitoring`)
  to the Perl dev server at `http://localhost:8080`
  (run via `perl -Ilib dev/disbatch-web`).
- SPA deep-links during dev hit the Angular dev server directly (no Perl routing
  involved), so no fallback config is needed in dev.

### 6.3 RPM / `dist.spec` — DECIDED (commit built artifacts)

Built SPA artifacts are committed to `etc/disbatch/htdocs/` in git (exactly as
the current static assets are today — `dist.spec` already ships that whole tree
via `cp -Lr etc/disbatch/*`).

- **No `BuildRequires: nodejs/npm`** — Node is a **development** dependency
  only. RPM builds use the committed `htdocs/` directly.
- **No `%build` change** — the spec's existing `cp -Lr etc/disbatch/*` already
  picks up the built files.
- **Cost:** each frontend rebuild produces noisy diffs from hashed asset
  filenames (e.g. `main-<hash>.js`). Mitigate by reviewing the `index.html`
  change as the meaningful part and treating the hashed files as generated.
  Rebuilds happen only when the frontend changes, not on every commit.
- Developers run `web/scripts/build.sh` (§6.1) locally and commit the resulting
  `etc/disbatch/htdocs/` contents.

`dist.ini`/`dist.spec` Perl `Requires` are unchanged (Template etc. retained for
`web_extensions`).

### 6.4 `.gitignore`

Add: `web/node_modules/`, `web/dist/`. Keep `etc/disbatch/htdocs/` **tracked**
(artifacts are committed per §6.3).

---

## 7. Testing Changes

Test files exist in two locations and **differ**: `t/002_full.t` and root
`002_full.t`. Both need the same updates.

| Current assertion | Change |
|---|---|
| `GET /` → `content_type` `text/html` | Still valid (SPA `index.html`). Optionally also assert the body contains `<app-root>` (or the Angular bundle script tag). |
| `GET /js/queues.js` → `application/javascript` | **Remove/replace** — that file no longer exists. Replace with a check that `GET /` references a built JS bundle, or drop the specific-asset assertion. |
| `GET /tasks/:id` Accept `text/html` → matches `<h1> Disbatch Single Task Query Results </h1>...` | **Update** — under Option B this route now always returns JSON (the task object, or a 404 JSON error). Change the assertion to expect JSON regardless of `Accept`. |
| `GET /balance` Accept `text/html` → matches `<h2>QueueBalancer` | **Update** — now always returns the JSON balance object. Change the assertion to expect JSON. |
| All JSON API assertions (queues, nodes, tasks, balance, monitoring, plugins, info) | **Unchanged.** The `400` "non-indexed params" test (`'non-indexed params given'`) is a different code path and stays. |
| `GET /tasks` (no params, no options) | **Add** a test: now returns `200 { schema, indexes }`. (This case was previously an **untested** `400 { error, indexes, ... }`, so no existing assertion breaks.) |

The CLI (`bin/disbatch`) is JSON-only and needs no changes; its existing behavior
is a good regression target.

---

## 8. Files Removed / Replaced

**Removed:**
- `etc/disbatch/htdocs/index.html`
- `etc/disbatch/htdocs/js/` (all `editablegrid*.js`, `queues.js`)
- `etc/disbatch/htdocs/javascripts/` (`jquery.js`, `jquery.serialize-object.min.js`,
  `balance.js`, `custom.js`, `expander.js`)
- `etc/disbatch/htdocs/css/` (`editablegrid.css`, `simple.css`, `style.css`, `balance.css`)
- `etc/disbatch/htdocs/images/` (bullet arrows, expand/collapse gifs)
- `etc/disbatch/views/index.tt`, `query.tt`, `balance.tt`

**Added (generated into `etc/disbatch/htdocs/`):**
- Angular production build: `index.html`, `main-*.js`, `polyfills-*.js`,
  `runtime-*.js`, `styles-*.css`, `assets/`, etc.

**Added (source):**
- `web/` — the entire Angular project (§5.1).
- `web/scripts/build.sh`.

**Kept:**
- `etc/disbatch/views/layouts/main.tt` (for `web_extensions`).
- `lib/Disbatch/Web/Files.pm` (catch-all static serving).
- All `lib/Disbatch/Web.pm` JSON routes (behavior preserved).

---

## 9. Migration Phases

1. **Scaffold:** create `web/` (Angular CLI), `build.sh`, `proxy.conf.json`;
   wire a build that syncs into `etc/disbatch/htdocs/`. Backend: change `GET /`
   to `serve_spa()`. Smoke-test `GET /` serving the empty SPA shell.
2. **Core:** models, `HttpClient` services, `ErrorInterceptor`,
   `ShellComponent` nav (hash routing via `withHashLocation()`), `GET /info`
   wiring.
3. **Queues + Nodes** views.
4. **Tasks query + Task detail.** Backend: change `GET /tasks` no-params-no-options
   to `200 { schema, indexes }` (§4.3).
5. **Balance** view.
6. **Monitoring + Info** views.
7. **Cleanup:** drop the remaining dead HTML/template branches on `GET /tasks`
   (results branch), `/tasks/:id`, `/balance` (always JSON); delete old `htdocs/*`
   and `views/index.tt`/`query.tt`/`balance.tt`; update `THIRD-PARTY-LIBS`; confirm
   `dist.spec` needs no build-flow change (§6.3); update `.gitignore`.
8. **Tests:** update `t/002_full.t` and `002_full.t` per §7; add a `GET /tasks`
   no-params `200 { schema, indexes }` test; run full `AUTHOR_TESTING=1` suite.
9. **Polish:** a11y, responsive layout, theme, error states, refresh controls,
   docs (note the new build step in `CLAUDE.md`/`docs/`).

Each phase leaves the system deployable: the JSON API and CLI keep working
throughout.

---

## 10. Risks & Considerations

- **Node.js on build hosts.** Decided: artifacts are committed (§6.3), so RPM
  builds need no Node — only developers running `web/scripts/build.sh` do.
- **Hashed asset filenames.** Tests should assert against `GET /` content, not
  specific hashed bundle paths, to avoid brittleness.
- **Hash routing (Option B).** URLs contain a `#` (e.g. `/#/queues`). This is
  the trade-off for the single-route backend change. Fragments are client-side
  only and never reach the server, so nginx / the catch-all static route cannot
  interfere with them — generally safe.
- **`web_extensions` compatibility.** Keep `layouts/main.tt`, `Template`, and
  `Template::Plugin::SimpleJson` so existing extensions that call `template()`
  continue to work. Extensions render their own pages independently of the SPA.
- **Backward compatibility of `GET /` and the HTML routes.** Any external tool
  expecting the old server-rendered HTML at `/` will get the SPA shell instead.
  Likewise, `GET /tasks`, `/tasks/:id`, and `/balance` with `Accept: text/html`
  previously returned HTML and will now return JSON (§4.2). The `disbatch` CLI
  and `disbatch-web` are JSON-only and are unaffected.
- **GridFS stdout/stderr.** Large task output is stored in GridFS; the `.full`
  option already resolves it server-side — reused as-is by the detail view.
- **Auth.** No frontend auth changes; the DCI has no login UI today and the SPA
  makes same-origin requests. (If HTTP basic auth is enforced by nginx, the
  browser handles it as today.)
- **Polling load.** Keep the 60 s default; make the interval user-controlled and
  pause on hidden tabs to avoid unnecessary load.

---

## 11. Decisions

**Decided:**
1. **Routing → Option B (hash-based).** Single backend route change (`GET /`);
   API routes simplified to always return JSON. See §3.
2. **Tasks indexes → modify `GET /tasks`.** No-params-no-options returns
   `200 { schema, indexes }`; no new route, no `/info` change, no 400-scraping.
   See §4.3.
3. **UI library → Angular Material.**
4. **Packaging → commit built artifacts.** Built `etc/disbatch/htdocs/` is
   committed in git (as today); Node is dev-only; no `BuildRequires`/`%build`
   changes to `dist.spec`. See §6.3.
5. **`/` landing → Queues + Nodes view** (no separate Dashboard). Closest to
   today's behavior; Monitoring and Info remain reachable from the sidenav.

All decisions closed. Implementation can begin at Phase 1.
