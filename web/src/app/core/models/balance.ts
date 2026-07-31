export interface BalanceSettings {
  log: boolean;
  verbose: boolean;
  pretend: boolean;
  enabled: boolean;
}

/** Keys: 'DOW HH:MM' (DOW is '*' or 0-6); values: max task count. */
export type MaxTasksMap = Record<string, number>;

export interface BalanceDoc {
  known_queues: string[];
  settings: BalanceSettings;
  notice?: string;
  max_tasks?: MaxTasksMap;
  queues?: string[][];
  disabled?: number | null;
}

export interface BalanceSubmit {
  max_tasks: MaxTasksMap;
  queues: string[][];
  disabled?: number | null;
}

export interface BalanceResult {
  status: string;
}
