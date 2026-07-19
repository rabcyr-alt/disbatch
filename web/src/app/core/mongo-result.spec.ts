import { describe, expect, it } from 'vitest';

import { unwrapMongoResult } from './mongo-result';

describe('unwrapMongoResult', () => {
  it('unwraps an update result', () => {
    const r = unwrapMongoResult({
      'MongoDB::UpdateResult': { matched_count: 1, modified_count: 1 },
    });
    expect(r.kind).toBe('MongoDB::UpdateResult');
    expect(r.result).toEqual({ matched_count: 1, modified_count: 1 });
  });

  it('surfaces the inserted id alongside the envelope', () => {
    const r = unwrapMongoResult({
      'MongoDB::InsertOneResult': { inserted_id: 'x' },
      id: '65f000000000000000000000',
    });
    expect(r.kind).toBe('MongoDB::InsertOneResult');
    expect(r.id).toBe('65f000000000000000000000');
  });

  it('surfaces a top-level error', () => {
    const r = unwrapMongoResult({
      'MongoDB::DeleteResult': { deleted_count: 0 },
      error: 'not found',
    });
    expect(r.error).toBe('not found');
  });

  it('degrades safely on unrecognized bodies', () => {
    expect(unwrapMongoResult({}).kind).toBeUndefined();
    expect(unwrapMongoResult(null).result).toEqual({});
    expect(unwrapMongoResult('nonsense').result).toEqual({});
  });
});
