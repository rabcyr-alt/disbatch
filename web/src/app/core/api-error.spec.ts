import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { apiErrorMessage, messageFromBody } from './api-error';

describe('messageFromBody', () => {
  it('prefers a string error', () => {
    expect(messageFromBody({ error: 'no such queue' })).toBe('no such queue');
  });

  it('falls back to status, which balance failures use', () => {
    expect(messageFromBody({ status: 'failed to update' })).toBe('failed to update');
  });

  it('stringifies a structured error', () => {
    expect(messageFromBody({ error: { code: 42 } })).toBe('{"code":42}');
  });

  it('returns null for bodies with no message', () => {
    expect(messageFromBody({})).toBeNull();
    expect(messageFromBody(null)).toBeNull();
    expect(messageFromBody('plain string')).toBeNull();
    expect(messageFromBody({ error: '   ' })).toBeNull();
  });
});

describe('apiErrorMessage', () => {
  it('reads the parsed JSON body of an HttpErrorResponse', () => {
    const err = new HttpErrorResponse({ status: 400, error: { error: 'bad request' } });
    expect(apiErrorMessage(err)).toBe('bad request');
  });

  it('uses a plain-text body when there is no JSON message', () => {
    const err = new HttpErrorResponse({ status: 500, error: 'Internal Server Error' });
    expect(apiErrorMessage(err)).toBe('Internal Server Error');
  });

  it('falls back to the status code', () => {
    const err = new HttpErrorResponse({ status: 502, error: null });
    expect(apiErrorMessage(err)).toBe('HTTP 502');
  });

  it('handles a thrown Error', () => {
    expect(apiErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('has a last resort', () => {
    expect(apiErrorMessage(undefined)).toBe('Unknown error');
  });
});
