export interface Queue {
  id: string;
  plugin: string;
  name: string;
  threads: number | null;
  queued: number;
  running: number;
  completed: number;
  sort?: string | null;
}

/** Shape returned by POST/DELETE on queues/nodes: the MongoDB result object keyed by ref type. */
export interface MongoResult {
  [ref: string]: unknown;
  error?: string | Record<string, unknown>;
}

export interface CreateQueueResponse extends MongoResult {
  id?: string;
}
