export interface DenNode {
  id: string;
  _id: string;
  node: string;
  /** Epoch milliseconds. */
  timestamp: number;
  maxthreads?: number | null;
  /** Server-side liveness flag (reported within dashboard.live_window_ms). */
  live?: boolean;
}
