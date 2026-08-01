import { HttpRequest, HttpResponse } from '@angular/common/http';
import { describe, expect, it, vi } from 'vitest';
import { EMPTY, of } from 'rxjs';

import { acceptJsonInterceptor } from './accept-json.interceptor';

describe('acceptJsonInterceptor', () => {
  it('sets Accept: application/json on the outgoing request', () => {
    const next = vi.fn((_req: HttpRequest<unknown>) => of(new HttpResponse({ body: {} })));
    const req = new HttpRequest('GET', '/tasks');
    acceptJsonInterceptor(req, next);

    expect(next).toHaveBeenCalledTimes(1);
    const forwarded = next.mock.calls[0][0];
    expect(forwarded.headers.get('Accept')).toBe('application/json');
  });

  it('does not mutate the original request (clones instead)', () => {
    const next = vi.fn((_req: HttpRequest<unknown>) => EMPTY);
    const req = new HttpRequest('GET', '/tasks');
    acceptJsonInterceptor(req, next);

    expect(req.headers.has('Accept')).toBe(false);
  });
});
