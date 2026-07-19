import { describe, expect, it } from 'vitest';

import { formatDuration } from './dashboard';

describe('formatDuration', () => {
  it('renders sub-minute values in seconds', () => {
    expect(formatDuration(15_000)).toBe('15 seconds');
  });

  it('renders whole minutes in minutes', () => {
    expect(formatDuration(60_000)).toBe('1 minute');
    expect(formatDuration(900_000)).toBe('15 minutes');
  });

  it('keeps seconds when the value is not a whole number of minutes', () => {
    expect(formatDuration(90_000)).toBe('90 seconds');
  });

  it('singularizes one second', () => {
    expect(formatDuration(1_000)).toBe('1 second');
  });
});
