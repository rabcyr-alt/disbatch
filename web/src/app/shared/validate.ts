import { BalanceSubmit } from '../core/models/balance';

/** One row of the max_tasks table: day-of-week, HH:MM, and a max task count. */
export interface MaxTaskRow {
  dow: string;
  time: string;
  /** `<input type="number">` writes a number here, not a string. */
  size: string | number;
}

export interface BalanceInput {
  queueGroups: string[];
  maxTasksRows: MaxTaskRow[];
  disableMinutes: number | '';
  reenable: boolean;
  /** Queue names the server reports as existing; anything else is rejected. */
  knownQueues: string[];
  /** Injectable clock, so `disabled` timestamps are deterministic in tests. */
  now?: () => number;
}

export interface BalanceValidation {
  /** All error messages found (queue, interval, and general), in order. Empty when valid. */
  errors: string[];
  /** Indices of queue-group inputs to flag in the UI. */
  invalidGroups: Set<number>;
  /** Indices of interval rows to flag in the UI. */
  invalidRows: Set<number>;
  /** The request body, or null when any error is present. */
  payload: BalanceSubmit | null;
}

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const QUEUE_NAME_RE = /^[\w-]+$/;
const QUEUE_LIST_RE = /^[\w-]+(?:,[\w-]+)*$/;

/** Normalizes a comma-separated queue list: trims, and drops spaces after commas. */
function normalizeGroup(raw: string): string {
  return raw.trim().replace(/,\s+/g, ',');
}

/**
 * Validates the QueueBalancer form and builds the POST body.
 *
 * Pure: no Angular, no signals, no I/O. The component owns the state and the
 * rendering; this owns the rules. See balance.ts `rebuildPreview()` / `submit()`.
 *
 * Error messages are lowercased to match the style the balance component has
 * always surfaced (e.g. "invalid queue list: ...", "unknown queue name: ...").
 */
export function validateBalance(input: BalanceInput): BalanceValidation {
  const { queueGroups, maxTasksRows, disableMinutes, reenable, knownQueues } = input;
  const now = input.now ?? Date.now;

  const errors: string[] = [];
  const invalidGroups = new Set<number>();
  const invalidRows = new Set<number>();

  const payload: BalanceSubmit = { max_tasks: {}, queues: [] };

  // disable / re-enable
  let disabled: number | null | undefined = undefined;
  if (disableMinutes !== '' && reenable) {
    errors.push("can't set both a disable duration and re-enable together");
  } else if (disableMinutes !== '') {
    disabled = Math.round(Number(disableMinutes) * 60 + now() / 1000);
  } else if (reenable) {
    disabled = null;
  }

  // queues
  const allNames: string[] = [];
  queueGroups.forEach((raw, i) => {
    const normalized = normalizeGroup(raw);
    if (normalized === '') {
      return;
    }
    if (!QUEUE_LIST_RE.test(normalized)) {
      errors.push(`invalid queue list: "${normalized}"`);
      invalidGroups.add(i);
      return;
    }
    const names = normalized.split(',');
    let bad = false;
    for (const name of names) {
      if (!QUEUE_NAME_RE.test(name) || !knownQueues.includes(name)) {
        errors.push(`unknown queue name: "${name}"`);
        bad = true;
      }
    }
    if (bad) invalidGroups.add(i);
    payload.queues.push(names);
    allNames.push(...names);
  });

  // duplicate queue names across all groups
  const sorted = [...allNames].sort();
  const dups: string[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] === sorted[i] && !dups.includes(sorted[i])) {
      dups.push(sorted[i]);
    }
  }
  if (dups.length) {
    errors.push(`duplicate queue names: ${dups.join(', ')}`);
    queueGroups.forEach((raw, i) => {
      const names = normalizeGroup(raw).split(',');
      if (names.some((n) => dups.includes(n))) {
        invalidGroups.add(i);
      }
    });
  }

  // max_tasks
  maxTasksRows.forEach((row, i) => {
    const dow = row.dow;
    const time = String(row.time ?? '').trim();
    const size = String(row.size ?? '').trim();
    if (dow === '' && time === '' && size === '') {
      return;
    }
    if (dow === '' || time === '' || size === '') {
      errors.push('fields left blank for interval(s)');
      invalidRows.add(i);
      return;
    }
    if (!TIME_RE.test(time)) {
      errors.push(`invalid time: "${time}" (use 24-hour HH:MM)`);
      invalidRows.add(i);
      return;
    }
    if (!/^\d+$/.test(size)) {
      errors.push(`not an integer: "${size}"`);
      invalidRows.add(i);
      return;
    }
    const key = `${dow} ${time}`;
    if (key in payload.max_tasks) {
      errors.push('dow+time duplicated for intervals');
      invalidRows.add(i);
      return;
    }
    payload.max_tasks[key] = Number(size);
  });

  const valid = errors.length === 0;
  if (disabled !== undefined) {
    payload.disabled = disabled;
  }
  return {
    errors,
    invalidGroups,
    invalidRows,
    payload: valid ? payload : null,
  };
}
