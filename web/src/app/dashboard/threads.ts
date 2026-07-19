/**
 * Coercion helpers for the inline "threads" / "max threads" editors.
 *
 * `<input type="number">` bound with ngModel writes a real *number* into the
 * model regardless of the declared TypeScript type. Calling string methods on
 * that value throws and silently aborts the edit, which is exactly the bug that
 * once made dashboard "Max Threads" unsaveable (see bug-fix.md). Everything
 * here coerces before inspecting.
 */

/** Trims an edit-field value that may be a string or a number. */
export function normalizeEdit(value: string | number | null | undefined): string {
  return String(value ?? '').trim();
}

/**
 * Interprets an edited max-threads value.
 * Blank means "unlimited", which the API expects as null.
 */
export function parseMaxThreads(value: string | number | null | undefined): number | null {
  const trimmed = normalizeEdit(value);
  return trimmed === '' ? null : Number(trimmed);
}

/** True when an edit left the value unchanged, so no request is needed. */
export function isUnchanged(
  edited: string | number | null | undefined,
  original: string | number | null | undefined,
): boolean {
  return normalizeEdit(edited) === normalizeEdit(original);
}
