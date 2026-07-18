// Data models mirroring the Disbatch JSON REST API (see lib/Disbatch/Web.pm).

/** GET /info */
export interface Info {
  database: string;
  web_extensions: string[];
  routes: { [verb: string]: string[] };
}

/** An entry from GET /queues (Disbatch::scheduler_report). */
export interface Queue {
  id: string;
  plugin: string;
  name: string;
  threads: number;
  queued: number;
  running: number;
  completed: number;
}

/** An entry from GET /nodes. `timestamp` is epoch milliseconds. */
export interface DenNode {
  id: string;
  node: string;
  maxthreads: number | null;
  timestamp: number;
  [key: string]: unknown;
}

/** GET /balance */
export interface BalanceDoc {
  queues?: string[][];
  max_tasks?: { [dowTime: string]: number };
  disabled?: number | null;
  known_queues: string[];
  settings?: BalanceSettings;
  notice?: string;
  [key: string]: unknown;
}

export interface BalanceSettings {
  enabled?: boolean | number;
  pretend?: boolean | number;
  log?: boolean | number;
  verbose?: boolean | number;
}

/** Body posted to POST /balance. */
export interface BalancePost {
  queues: string[][];
  max_tasks: { [dowTime: string]: number };
  disabled?: number | null;
}

/** A single check result from GET /monitoring. */
export interface MonitoringCheck {
  status: string;
  message: string;
  nodes?: unknown;
}

export interface Monitoring {
  disbatch: MonitoringCheck;
  queuebalance: MonitoringCheck;
}

/** A task document from GET /tasks or GET /tasks/:id. Loosely typed (display-only). */
export interface Task {
  _id?: string;
  queue?: string;
  status?: number;
  node?: string | null;
  stdout?: unknown;
  stderr?: unknown;
  ctime?: unknown;
  mtime?: unknown;
  params?: unknown;
  [key: string]: unknown;
}

/** The 400 error body returned by GET /tasks for non-indexed / empty queries. */
export interface TasksQueryError {
  error: string;
  indexes?: string[][];
  invalid_params?: string[];
  title?: string;
  path?: string;
}
