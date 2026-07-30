export type MonitoringStatus = 'OK' | 'WARNING' | 'CRITICAL';

export interface MonitoringCheck {
  status: MonitoringStatus;
  message: string;
  nodes?: {
    fresh?: Record<string, number>;
    stale?: Record<string, number>;
  };
}

export interface Monitoring {
  disbatch: MonitoringCheck;
  queuebalance: MonitoringCheck;
}
