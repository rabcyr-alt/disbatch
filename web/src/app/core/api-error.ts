import { HttpErrorResponse } from '@angular/common/http';

// Normalizes the non-uniform error bodies the Disbatch API can return into a
// single display string suitable for a MatSnackBar.
//
// Order of preference:
//   1. string `body.error`
//   2. string `body.status`  (balance failures use { status: "failed..." })
//   3. stringified object `body.error`
//   4. `HTTP <code>`

export function apiErrorMessage(err: unknown): string {
  // HttpErrorResponse: the parsed JSON body (if any) is on `.error`.
  if (err instanceof HttpErrorResponse) {
    const fromBody = messageFromBody(err.error);
    if (fromBody) {
      return fromBody;
    }
    if (typeof err.error === 'string' && err.error.trim()) {
      return err.error;
    }
    return `HTTP ${err.status}`;
  }
  const fromBody = messageFromBody(err);
  if (fromBody) {
    return fromBody;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Unknown error';
}

/** Extracts a message from a decoded response body (not an HttpErrorResponse). */
export function messageFromBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const obj = body as Record<string, unknown>;
  if (typeof obj['error'] === 'string' && obj['error'].trim()) {
    return obj['error'];
  }
  if (typeof obj['status'] === 'string' && obj['status'].trim()) {
    return obj['status'];
  }
  if (obj['error'] && typeof obj['error'] === 'object') {
    try {
      return JSON.stringify(obj['error']);
    } catch {
      return String(obj['error']);
    }
  }
  return null;
}
