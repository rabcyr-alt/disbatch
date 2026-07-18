# Done — Angular + TypeScript web UI, per PLAN.md

**Frontend (`web/`)** — Angular 19 (latest that supports this env's Node 18.20) + Angular Material, standalone components, TS strict, hash routing, `proxy.conf.json`, and `angular.json` building straight into `../etc/disbatch/htdocs`:

- **Core layer**: `models.ts`, `mongo-result.ts` (unwraps `MongoDB::*Result` envelopes), `api-error.ts` (the string→status→object→`HTTP <code>` normalizer), `api.service.ts` (all endpoints, `Accept: application/json`, repeated-key OR params, dot-options).
- **App shell**: `mat-toolbar` "Disbatch (`<database>`)" from `GET /info`, nav + Routes/Extensions menus.
- **Dashboard**: queue table with inline edit (name/threads click-to-edit; plugin an always-present inline `mat-select`), New Queue dialog, delete-with-confirm; two node tables split at the 15-minute mark with inline `maxthreads`; `timer(0,60s)` auto-refresh paused while any editor/dialog is open.
- **Tasks**: query form bootstrapped from the `GET /tasks` 400 `indexes` body, OR values, `.limit/.count/.terse/.full/.epoch`, "Next N" pagination, pretty-JSON results linking to detail.
- **Task detail**: display-only JSON, 404 message, no action buttons.
- **Balance**: banners, queue-group + interval rows with the ported `balance.js` validations, disable-duration select, live JSON preview → `POST /balance`.

**Backend (`lib/Disbatch/Web.pm`)**: removed `use Template`, the `template` export, `parse_accept`/`want_json`; `GET /` → `send_file '/index.html'`; `GET /tasks`, `/tasks/:id`, `/balance` are JSON-only; POD updated. Deleted `etc/disbatch/views/` and all legacy htdocs assets; removed `views_dir` from the config example + `docs/`; rewrote `THIRD-PARTY-LIBS`; added a `Changes` entry (incl. the breaking `template`-export removal).

**Packaging**: dropped `Template::Plugin::SimpleJson` from `dist.ini`/`dist.spec`; added `exclude_match = ^web/` so Angular sources stay out of the tarball while built `htdocs/` ships. `.gitignore` updated for `web/`.

**Build & tests**:

- `ng build` (production) succeeds cleanly → committed hashed assets in `htdocs/` (no source maps).
- `t/002_full.t` updated to the JSON-only assertions; `t/001_base.t` passes.
- Ran the full `t/002_full.t`: **373/375 pass**. The 2 failures are `GET /monitoring`'s disbatch check (line 697) reporting `CRITICAL` because in this slow sandbox the node's last-seen timestamp aged past the 60-second "active" window before the check ran — that code is untouched by this work and the failure is environment timing, not a regression.

**Notes:**

- To run the suite here I had to install CPAN deps (`Log::Log4perl`, `MongoDB`, `Limper*`, `Starwoman`, `Try::Tiny::Retry`, `URL::Encode`, `Safe::Isa`, `Time::Moment`, `DateTime`, `Net::HTTP::Client`) and temporarily disable `--nojournal` (removed in this env's mongod 8.2.4; the file kept it for mongod 6.0). **That temp change has been reverted** — the committed `t/002_full.t` diff is only the intended assertion changes.
- Not yet `git commit`ted. The tree has the legacy `htdocs`/`views` files deleted and new build assets + `web/` untracked. To finalize on the `angular` branch: `git add -A && git commit`. `web/node_modules`, `web/dist`, `web/.angular` are git-ignored.
