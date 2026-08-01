import { describe, expect, it } from 'vitest';

import { BalanceInput, validateBalance } from './validate';

/** A valid baseline; individual tests override just what they exercise. */
function input(overrides: Partial<BalanceInput> = {}): BalanceInput {
  return {
    queueGroups: [''],
    maxTasksRows: [{ dow: '', time: '', size: '' }],
    disableMinutes: '',
    reenable: false,
    knownQueues: ['alpha', 'beta', 'gamma'],
    now: () => 1_700_000_000_000, // fixed clock
    ...overrides,
  };
}

/** True when the validation produced any error (queue, interval, or general). */
function hasError(r: ReturnType<typeof validateBalance>): boolean {
  return r.errors.length > 0;
}

describe('validateBalance', () => {
  it('accepts an empty form', () => {
    const r = validateBalance(input());
    expect(r.errors).toEqual([]);
    expect(r.payload).toEqual({ max_tasks: {}, queues: [] });
  });

  it('builds queue groups and intervals', () => {
    const r = validateBalance(
      input({
        queueGroups: ['alpha,beta', 'gamma'],
        maxTasksRows: [{ dow: '*', time: '09:30', size: '100' }],
      }),
    );
    expect(r.payload).toEqual({
      max_tasks: { '* 09:30': 100 },
      queues: [['alpha', 'beta'], ['gamma']],
    });
  });

  it('tolerates spaces after commas', () => {
    const r = validateBalance(input({ queueGroups: ['  alpha, beta  '] }));
    expect(r.errors).toEqual([]);
    expect(r.payload?.queues).toEqual([['alpha', 'beta']]);
  });

  describe('queues', () => {
    it('rejects an unknown queue name', () => {
      const r = validateBalance(input({ queueGroups: ['alpha,nope'] }));
      expect(r.errors).toContain('unknown queue name: "nope"');
      expect(r.invalidGroups.has(0)).toBe(true);
      expect(r.payload).toBeNull();
    });

    it('rejects a malformed list', () => {
      const r = validateBalance(input({ queueGroups: ['alpha,,beta'] }));
      expect(r.errors).toContain('invalid queue list: "alpha,,beta"');
      expect(r.payload).toBeNull();
    });

    it('rejects a name duplicated across groups, flagging both', () => {
      const r = validateBalance(input({ queueGroups: ['alpha,beta', 'beta'] }));
      expect(r.errors).toContain('duplicate queue names: beta');
      expect(r.invalidGroups.has(0)).toBe(true);
      expect(r.invalidGroups.has(1)).toBe(true);
      expect(r.payload).toBeNull();
    });

    it('ignores blank groups', () => {
      const r = validateBalance(input({ queueGroups: ['alpha', '', '  '] }));
      expect(r.errors).toEqual([]);
      expect(r.payload?.queues).toEqual([['alpha']]);
    });
  });

  describe('intervals', () => {
    it('rejects a partially filled row', () => {
      const r = validateBalance(input({ maxTasksRows: [{ dow: '*', time: '', size: '5' }] }));
      expect(r.errors).toContain('fields left blank for interval(s)');
      expect(r.invalidRows.has(0)).toBe(true);
    });

    it('rejects an out-of-range time', () => {
      const r = validateBalance(input({ maxTasksRows: [{ dow: '*', time: '25:00', size: '5' }] }));
      expect(r.errors).toContain('invalid time: "25:00" (use 24-hour HH:MM)');
    });

    it('rejects a non-integer size', () => {
      const r = validateBalance(
        input({ maxTasksRows: [{ dow: '*', time: '09:30', size: '1.5' }] }),
      );
      expect(r.errors).toContain('not an integer: "1.5"');
    });

    it('rejects a duplicated dow+time', () => {
      const r = validateBalance(
        input({
          maxTasksRows: [
            { dow: '*', time: '09:30', size: '10' },
            { dow: '*', time: '09:30', size: '20' },
          ],
        }),
      );
      expect(r.errors).toContain('dow+time duplicated for intervals');
      expect(r.invalidRows.has(1)).toBe(true);
    });

    // Regression: <input type="number"> writes a number, not a string. Calling
    // .trim() on it used to throw and make the form unsubmittable.
    it('accepts a numeric size from the number input', () => {
      const r = validateBalance(input({ maxTasksRows: [{ dow: '*', time: '09:30', size: 100 }] }));
      expect(r.errors).toEqual([]);
      expect(r.payload?.max_tasks).toEqual({ '* 09:30': 100 });
    });
  });

  describe('disable / re-enable', () => {
    it('computes an absolute epoch from a duration', () => {
      const r = validateBalance(input({ disableMinutes: 60 }));
      expect(r.payload?.disabled).toBe(Math.round(60 * 60 + 1_700_000_000_000 / 1000));
    });

    it('sends null to re-enable', () => {
      const r = validateBalance(input({ reenable: true }));
      expect(r.payload?.disabled).toBeNull();
    });

    it('rejects disabling and re-enabling at once', () => {
      const r = validateBalance(input({ disableMinutes: 60, reenable: true }));
      expect(r.errors).toContain("can't set both a disable duration and re-enable together");
      expect(r.payload).toBeNull();
    });
  });

  it('reports no errors and no invalid indices for a valid form', () => {
    const r = validateBalance(
      input({ queueGroups: ['alpha'], maxTasksRows: [{ dow: '*', time: '00:00', size: '1' }] }),
    );
    expect(hasError(r)).toBe(false);
    expect(r.invalidGroups.size).toBe(0);
    expect(r.invalidRows.size).toBe(0);
  });
});
