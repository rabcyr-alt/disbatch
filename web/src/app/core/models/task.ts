export type TaskStatus = -6 | -2 | -1 | 0 | 1 | 2;

/** stdout/stderr may be null, a plain string, or a GridFS ObjectId reference (object). */
export type TaskOutput = string | null | { $oid?: string; [k: string]: unknown };

export interface Task {
  _id: string;
  queue: string;
  status: TaskStatus;
  params: Record<string, unknown>;
  node: string | null;
  ctime: string | number;
  mtime: string | number;
  stdout: TaskOutput;
  stderr: TaskOutput;
  /** Present once the task has reached a terminal state. */
  complete?: number;
}

/** Index set, e.g. ['id'] or ['queue', 'status']. */
export type IndexSet = string[];

export interface TaskSchema {
  verb: string;
  limit: number;
  title: string;
  subtitle: string;
  params: Record<string, { repeatable: string; type: string[] }>;
}

/** Response for GET /tasks with no params and no options. */
export interface TasksSchemaResponse {
  schema: TaskSchema;
  indexes: IndexSet[];
}

/** Response for GET /tasks with .count = 1. */
export interface TaskCountResponse {
  count: number;
}

/** Error response from GET /tasks (e.g. non-indexed params). */
export interface TaskErrorResponse {
  error: string;
  invalid_params?: string[];
  indexes?: IndexSet[];
}

export interface TaskQueryOptions {
  '.limit'?: number;
  '.skip'?: number;
  '.count'?: boolean | number;
  '.fields'?: string;
  '.terse'?: boolean | number;
  '.full'?: boolean | number;
  '.epoch'?: boolean | number;
  '.pretty'?: boolean | number;
}
