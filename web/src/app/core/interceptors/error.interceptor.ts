import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

/**
 * Surfaces API errors via a MatSnackBar, mapping the `{ error: "..." }` and
 * `{ status: "..." }` bodies the API already returns. Re-throws so callers can
 * also handle the error (e.g. abort a table update).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = `HTTP ${err.status}`;
      if (err.status === 0) {
        message = 'Network error: could not reach the Disbatch server';
      } else if (err.error) {
        if (typeof err.error === 'string') {
          message = err.error;
        } else if (typeof err.error === 'object') {
          const body = err.error as Record<string, unknown>;
          if (typeof body['error'] === 'string') {
            message = body['error'];
          } else if (typeof body['status'] === 'string') {
            message = body['status'];
          } else {
            message = JSON.stringify(body);
          }
        }
      } else if (err.message) {
        message = err.message;
      }
      snackBar.open(message, 'Dismiss', { duration: 6000, panelClass: 'error-snackbar' });
      return throwError(() => err);
    }),
  );
};
