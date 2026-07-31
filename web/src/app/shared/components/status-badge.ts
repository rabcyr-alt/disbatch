import { Component, input } from '@angular/core';
import { MonitoringStatus } from '../../core/models/monitoring';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="cls()">{{ status() }}</span>`,
  styles: [
    `
      .badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 10px;
        color: #fff;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.3px;
      }
      .OK {
        background: #2e7d32;
      }
      .WARNING {
        background: #ed6c02;
      }
      .CRITICAL {
        background: #c62828;
      }
    `,
  ],
})
export class StatusBadge {
  readonly status = input.required<MonitoringStatus>();
  protected cls() {
    return this.status();
  }
}
