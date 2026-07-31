export interface DashboardConfig {
  /** Auto-refresh interval in ms (default 30000). */
  refresh_ms?: number;
  /** Node-liveness window in ms; nodes quiet longer are "non-running" (default 15000). */
  live_window_ms?: number;
}

export interface InfoResponse {
  database: string;
  web_extensions: string[];
  routes: Record<string, string[]>;
  /** Optional dashboard tunables, sourced from the `dashboard` config key. */
  dashboard?: DashboardConfig;
}
