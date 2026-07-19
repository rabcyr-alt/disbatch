import { describe, expect, it } from 'vitest';

import { isUnchanged, normalizeEdit, parseMaxThreads } from './threads';

describe('normalizeEdit', () => {
  // Regression: <input type="number"> writes a number into the model, so a bare
  // .trim() threw and silently aborted the edit. See bug-fix.md.
  it('accepts a number without throwing', () => {
    expect(normalizeEdit(42)).toBe('42');
  });

  it('trims strings', () => {
    expect(normalizeEdit('  8  ')).toBe('8');
  });

  it('treats null and undefined as blank', () => {
    expect(normalizeEdit(null)).toBe('');
    expect(normalizeEdit(undefined)).toBe('');
  });

  it('keeps zero rather than treating it as blank', () => {
    expect(normalizeEdit(0)).toBe('0');
  });
});

describe('parseMaxThreads', () => {
  it('maps blank to null, meaning unlimited', () => {
    expect(parseMaxThreads('')).toBeNull();
    expect(parseMaxThreads('   ')).toBeNull();
    expect(parseMaxThreads(null)).toBeNull();
  });

  it('parses numbers from either a string or a number', () => {
    expect(parseMaxThreads('16')).toBe(16);
    expect(parseMaxThreads(16)).toBe(16);
  });

  it('preserves an explicit zero', () => {
    expect(parseMaxThreads(0)).toBe(0);
    expect(parseMaxThreads('0')).toBe(0);
  });
});

describe('isUnchanged', () => {
  it('compares a numeric edit against the original number', () => {
    expect(isUnchanged(8, 8)).toBe(true);
    expect(isUnchanged(9, 8)).toBe(false);
  });

  it('ignores type differences between string and number', () => {
    expect(isUnchanged('8', 8)).toBe(true);
  });

  it('ignores surrounding whitespace', () => {
    expect(isUnchanged(' 8 ', 8)).toBe(true);
  });

  it('treats blank and null as the same unlimited value', () => {
    expect(isUnchanged('', null)).toBe(true);
  });

  it('detects clearing a value to unlimited', () => {
    expect(isUnchanged('', 8)).toBe(false);
  });
});
