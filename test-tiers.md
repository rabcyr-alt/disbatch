# Frontend testing: options and decision

Notes from deciding how (and whether) to test the Angular web UI in `web/`.

## Context that shapes the answer

Two facts about this repo matter more than any Angular advice:

- **There is no CI.** No `.github/workflows`, no `.gitlab-ci.yml`. Any test only ever
  runs when a human types a command.
- **`web/` is excluded from the release** (`exclude_match = ^web/` in `dist.ini`).
  Frontend tests never run as part of `dzil test`, the RPM build, or the Perl `t/` suite.
  They are a development-time tool, entirely separate from the backend test suite.

So the question was never "should the project have tests" but "would they be run, and
would they catch anything real."

Stated intent: run them after changes to the web frontend (rare) or the JSON API (rare),
as a sanity check *before* switching to manual testing.

## The case for testing at all

The two bugs found during manual QA of the Angular rewrite — "Max Threads" not saving on
the dashboard, and Balance interval validation refusing to submit — were the same bug:
`.trim()` called on a number, because `<input type="number">` writes a *number* into the
model regardless of the declared TypeScript type. Both lived in plain logic
(`commitEdit`, `recompute`), not in rendering. A three-line unit test on either would
have caught both instantly.

That is the argument for a narrow, logic-focused suite rather than "test the UI."

## The tiers considered

**Tier 0 — pure functions, no Angular.** `apiErrorMessage`, `messageFromBody`,
`unwrapMongoResult`, `formatDuration`. Import and call. Conceptually identical to
`Test::More` (`expect(x).toBe(y)` is `is($x, $y)`). Nothing framework-specific to learn,
and immune to Angular upgrades.

**Tier 1 — component logic, no rendering.** Where the value is concentrated:
`Balance.recompute()` (~100 lines of validation producing both error strings and the
JSON body) and `Tasks.buildParams()`. Set inputs, call, assert. No DOM, no clicking.

**Tier 2 — HTTP contract.** `HttpTestingController` (from `@angular/common/http/testing`)
swaps in a fake HTTP backend. **Requires no running server** — no `disbatchd`, no
`mongod`, no network.

> Important caveat: Tier 2 verifies what the *frontend sends and expects*. It cannot
> verify what Perl actually returns. Rename a field in `Disbatch::Web` and these tests
> keep passing while the real UI breaks. Their genuine value is as executable
> documentation of the contract — when you touch the API, they state precisely what the
> UI expects from each endpoint.

**Tier 3 — rendered components.** TestBed + Material component harnesses
(`MatSelectHarness`, etc.). The only tier that catches "an OnPush conversion broke a view
refresh." Also slow, brittle, and the most likely to break on the next Angular upgrade
(the 19->22 move already shifted TestBed's zoneless patterns). Declined.

**Tier 4 — E2E (Playwright) against a real `disbatchd` + `mongod`.** The only thing that
catches Perl<->Angular contract drift. Highest setup cost, and overlaps with what
`t/002_full.t` already spins up. Declined for now.

## Decision

**Tier 0 + Tier 1, via extraction rather than TestBed.**

The validation logic is not really Angular code — it is business rules that happen to
live in a component. Extracting it into a plain function means the tests import no
Angular at all, run instantly, and cannot be broken by a framework upgrade. `recompute()`
keeps its name, signature, and behavior; it just delegates the validation body to a
function in a new file. Signals, template, and API calls are untouched.

The alternative (test in place through TestBed) was rejected: no refactor risk, but
slower tests that are more coupled to a framework whose testing patterns just shifted.

**Tier 2 was subsequently added** (`core/api.spec.ts`), for the executable-documentation
value: when `Disbatch::Web` changes, that file states exactly what the UI sends to each
endpoint. It is the one spec that needs Angular's `TestBed`, because `HttpClient` comes
from dependency injection; everything else imports no Angular at all.

## What exists now

| File | Tier | Covers |
| --- | --- | --- |
| `balance/validate.spec.ts` | 1 | queue-list and interval validation, disable/re-enable, JSON body |
| `dashboard/threads.spec.ts` | 0 | number/string coercion in the inline editors |
| `core/api-error.spec.ts` | 0 | error-message extraction from the API's several body shapes |
| `core/mongo-result.spec.ts` | 0 | MongoDB driver result envelopes |
| `dashboard/dashboard.spec.ts` | 0 | duration formatting |
| `core/api.spec.ts` | 2 | endpoint URLs, methods, params, bodies |

55 tests, about 10 seconds, `ng test`. Two of them are explicit regression tests for the
`.trim()`-on-a-number bug.

## Practical note

`ng test` currently exits non-zero with "no tests found", so adding even one test makes
it usable in a script. The `refactor-jasmine-vitest` schematic is not needed here; it
converts existing Jasmine specs, and there were none.
