import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { apiErrorMessage } from '../api-error';

/**
 * Surfaces API errors via a MatSnackBar, normalizing the non-uniform bodies the
 * API returns (`{ error }`, `{ status }`, plain string, etc.) via
 * {@link apiErrorMessage}. Re-throws so callers can also handle the error
 * (e.g. abort a table update). Treats status 0 as a network failure.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message =
        err.status === 0
          ? 'Network error: could not reach the Disbatch server'
          : apiErrorMessage(err);
      snackBar.open(message, 'Dismiss', { duration: 6000, panelClass: 'error-snackbar' });
      return throwError(() => err);
    }),
  );
};
