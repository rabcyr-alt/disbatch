import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Sets `Accept: application/json` on every request.
 *
 * Not strictly required under hash-based routing (the API routes always return
 * JSON, and GET / is only ever hit by the browser), but included for hygiene and
 * self-documentation.
 */
export const acceptJsonInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ setHeaders: { Accept: 'application/json' } }));
};
