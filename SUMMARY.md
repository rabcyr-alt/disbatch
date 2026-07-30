# Summary: Modernize the Disbatch Web Interface to Angular + TypeScript

This document summarizes the execution of `PLAN.md`: migrating the Disbatch web
UI from jQuery / EditableGrid / Template Toolkit to an Angular 22 + TypeScript
single-page application (SPA), with minimal, surgical changes to the Perl
backend.

## Backend changes (`lib/Disbatch/Web.pm`) — §4

- **`GET /`** → `serve_spa()` serves the Angular `index.html` shell. This is the
  single routing change required for hash-based routing (Option B).
- **`GET /tasks`** (no params/options) → now returns `200 { schema, indexes }`
  JSON instead of a `400` error body or HTML form (§4.3), so the SPA can build
  its query form.
- **`GET /tasks/:id`** and **`GET /balance`** → always return JSON. The dead
  `want_json()` / `template` HTML branches were removed.
- POD updated to document the new always-JSON behavior.
- `views/layouts/main.tt`, the `Template` instance, and
  `Template::Plugin::SimpleJson` are retained for `web_extensions`.

## Frontend removed — §8

- Deleted `etc/disbatch/htdocs/{js,javascripts,css,images,index.html}` (jQuery,
  EditableGrid, serialize-object, expander, old CSS/images).
- Deleted `etc/disbatch/views/{index,query,balance}.tt`.
- Kept `etc/disbatch/views/layouts/main.tt` (for `web_extensions`).

## Angular SPA (`web/`) — §5

- Scaffolded Angular 22 (standalone components, `provideRouter` with
  `withHashLocation()`, `provideHttpClient`, `provideAnimationsAsync`).
- Angular Material UI:
  - `ShellComponent` — `MatSidenav` nav + toolbar showing the database name and
    a global refresh-interval control.
  - **Queues** — editable `MatTable` (plugin/name/threads), create `MatDialog`,
    delete with confirm.
  - **Nodes** — active/dead tables (15-min threshold), editable `maxthreads`.
  - **Tasks query** — reactive form built dynamically from the index sets
    (`GET /tasks` schema), repeatable `$or` inputs, `.limit`/`.skip`/`.terse`/
    `.full`/`.epoch`/`.pretty` options, paginated results table.
  - **Task detail** — all fields, pretty-printed params, stdout/stderr with a
    "full" toggle (`GET /tasks/:id?.full=1` to resolve GridFS).
  - **Balance** — reactive form (queues priority groups, `max_tasks` intervals,
    disable/re-enable) with client-side validation ported from `balance.js` and a
    live JSON preview.
  - **Monitoring** — status cards (`StatusBadgeComponent`) for disbatch +
    queuebalance.
  - **Info** — database, loaded extensions, routes grouped by verb.
- Core layer: typed models, one `HttpClient` service per resource,
  `AcceptJsonInterceptor`, `ErrorInterceptor` (snackbar), `RefreshService`
  (timer + manual refresh + hidden-tab pause).
- `proxy.conf.json` for dev (`npx ng serve` → Perl dev server at :8080);
  `scripts/build.sh` syncs production output into `etc/disbatch/htdocs/`.

## Build & packaging — §6

- Built SPA artifacts are committed to `etc/disbatch/htdocs/` (as the old static
  assets were). `dist.spec`'s `cp -Lr etc/disbatch/*` ships them unchanged; no
  Node `BuildRequires`/`%build` changes.
- `dist.ini` prereqs unchanged (Template etc. retained for `web_extensions`).
- `.gitignore` ignores `web/node_modules/`, `web/dist/`, `web/.angular/cache/`.

## Tests — §7

Both `t/002_full.t` and root `002_full.t` updated identically:

- `GET /` asserts `text/html` + `<app-root>` + a built JS bundle reference.
- Removed the `GET /js/queues.js` assertion (file no longer exists).
- `GET /tasks/:id` and `GET /balance` with `Accept: text/html` now expect JSON
  (not the old HTML).
- Added `GET /tasks` (no params) → `200 { schema, indexes }` test.
- All other JSON API assertions unchanged; the `'non-indexed params given'` 400
  test (a different code path) is untouched.

## Validation

- Focused route-validation script: **39/40** passed. (The single "failure" was a
  flaw in the ad-hoc script — empty `max_tasks`/`queues` is genuinely valid, so
  the API correctly returns 200.)
- Full `002_full.t` (with `GFS_TESTS=none`, which skips only the slow GFS
  task-output sub-tests that do not touch the changed routes): **264/266 passed**.
  The 2 failures (`report success`, `task success`) are pre-existing flaky
  task_runner / Demo-plugin timing tests, entirely unrelated to the web routes
  changed here. A separate clean run passed 266/266.
- `GET /` smoke-tested directly against the Perl server: serves `text/html` with
  `<app-root>` and references the hashed JS bundle; static bundles serve as
  `application/javascript`.

## Docs — §9

- Rewrote `THIRD-PARTY-LIBS` (removed jQuery/EditableGrid/expander/serialize-
  object; added Angular + Angular Material, both MIT).
- Updated `CLAUDE.md` with the `web/scripts/build.sh` and `npx ng serve` commands
  and the SPA architecture notes for the DCI.
