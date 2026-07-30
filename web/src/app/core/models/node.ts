export interface DenNode {
  id: string;
  _id: string;
  node: string;
  /** Epoch milliseconds. */
  timestamp: number;
  maxthreads?: number | null;
}
