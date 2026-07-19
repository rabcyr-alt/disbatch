# Bug fixes: number-input `.trim()` crash

Two bugs were found during manual testing of the new Angular web UI. They had the
**same root cause**.

## Symptoms

1. **Dashboard → "Max Threads" could not be changed** on either the "Disbatch Execution
   Nodes" or "Non-Running Disbatch Execution Nodes" table. Editing appeared to do nothing.
2. **Balance → interval validation always failed**, so the form could not be submitted.

## Root cause

Both broken fields are `<input type="number">` bound with `[(ngModel)]`. Angular's
number-input value accessor writes a real JavaScript **number** back into the model —
even though our TypeScript types declared the field as `string`. The code then called
`.trim()` on that value:

```ts
this.editValue.trim();   // TypeError: this.editValue.trim is not a function
row.size.trim();         // same
```

Calling `.trim()` on a number throws `TypeError`, which:

- silently aborted the node "Max Threads" commit (Bug 1), and
- broke `recompute()`, which is also called at the top of `submit()`, so Balance could
  neither validate nor submit (Bug 2).

The queue "Threads" field (also a number input) was unaffected because `queue-table`
uses `String(raw)` / `Number(raw)` and never calls `.trim()`.

## Fix

Defensive coercion that handles string, number, and empty/null in both places:

- `web/src/app/dashboard/node-table.component.ts` — `commitEdit()`:
  ```ts
  const trimmed = String(this.editValue ?? '').trim();
  ```
- `web/src/app/balance/balance.component.ts` — `recompute()`:
  ```ts
  const size = String(row.size ?? '').trim();
  ```

## Rebuild note

The app was rebuilt into `etc/disbatch/htdocs/` (new hashed chunk filenames, updated
`index.html`). The build was done in an offline environment, so Angular's build-time
Google-Fonts *inlining* could not run. Only that one optimization was disabled (via a
temporary `web/angular.json` edit that was then reverted); the rest of the production
build is unchanged (minified, ~502 kB initial).

The only visible effect: `index.html` loads the Roboto / Material Icons fonts via the
same `<link>` tags declared in `web/src/index.html` (fetched from Google's CDN at
runtime) instead of an inlined `<style>` block — functionally identical. Rebuilding on a
networked machine will inline the fonts again automatically.
