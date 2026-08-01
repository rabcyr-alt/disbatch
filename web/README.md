# Disbatch Web (Angular SPA)

The Disbatch Command Interface frontend — an Angular 22 + TypeScript
single-page application. The Perl backend serves the built bundle from
`etc/disbatch/htdocs/` (the `web_root`), so this directory holds only the
SPA **source**; the built artifacts are committed elsewhere (see below).

## Prerequisites

Node.js + npm are required only on the developer machine. RPM builds use the
committed `etc/disbatch/htdocs/` directly and do not run npm.

## Development server

```bash
npx ng serve
```

Starts the Angular dev server on `http://localhost:4200/`. API paths are
proxied to the Perl dev server at `http://localhost:8080` (see
`proxy.conf.json`), so run that too:

```bash
perl -Ilib dev/disbatch-web
```

The app reloads automatically on source changes.

## Building

```bash
./scripts/build.sh
```

Runs `npm ci`, `ng build --configuration production`, and syncs the output
into `../etc/disbatch/htdocs/` (the Disbatch `web_root`) so the existing
catch-all static route serves it. The built `3rdpartylicenses.txt` is copied
alongside the browser assets.

For development only (no htdocs sync):

```bash
npx ng build --configuration production
```

## Unit tests

```bash
npx ng test
```

Runs the Vitest suite via the `@angular/build:unit-test` runner (jsdom
environment). There is no e2e configuration.

## Committed bundle / RPM tradeoff

The production bundle under `etc/disbatch/htdocs/` **is** committed to the
repository (the old static assets were too), so an RPM built from the tree
serves a working UI without Node at build time. Consequence: after changing
SPA source, re-run `scripts/build.sh` and commit the regenerated `htdocs/`
before cutting a release. Frontend source commits intentionally do **not**
rebuild `htdocs/` (to keep diffs reviewable); the release process must do it.
