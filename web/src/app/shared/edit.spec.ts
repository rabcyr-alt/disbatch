import { describe, expect, it } from 'vitest';

import { isUnchanged, normalizeEdit, parseMaxThreads } from './edit';

describe('normalizeEdit', () => {
  it('trims a string', () => {
    expect(normalizeEdit('  5  ')).toBe('5');
  });

  it('coerces a number to a trimmed string (number-input regression)', () => {
    expect(normalizeEdit(5)).toBe('5');
  });

  it('treats null/undefined as empty', () => {
    expect(normalizeEdit(null)).toBe('');
    expect(normalizeEdit(undefined)).toBe('');
  });
});

describe('parseMaxThreads', () => {
  it('returns null for blank (unlimited)', () => {
    expect(parseMaxThreads('')).toBeNull();
    expect(parseMaxThreads('   ')).toBeNull();
  });

  it('parses an integer string', () => {
    expect(parseMaxThreads('8')).toBe(8);
  });

  it('coerces a number input', () => {
    expect(parseMaxThreads(8)).toBe(8);
  });
});

describe('isUnchanged', () => {
  it('matches equal string values', () => {
    expect(isUnchanged('5', '5')).toBe(true);
  });

  it('matches a number edit against a string original', () => {
    expect(isUnchanged(5, '5')).toBe(true);
  });

  it('treats null and blank as equal', () => {
    expect(isUnchanged('', null)).toBe(true);
  });

  it('detects a real change', () => {
    expect(isUnchanged('6', '5')).toBe(false);
  });
});
