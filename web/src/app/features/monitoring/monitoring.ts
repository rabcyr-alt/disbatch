import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MonitoringService } from '../../core/services/monitoring.service';
import { RefreshService } from '../../core/services/refresh.service';
import { MonitoringCheck, MonitoringReport } from '../../core/models/monitoring';
import { StatusBadge } from '../../shared/components/status-badge';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [MatCardModule, MatToolbarModule, StatusBadge],
  templateUrl: './monitoring.html',
  styleUrl: './monitoring.scss',
})
export class Monitoring implements OnInit {
  private readonly monitoringService = inject(MonitoringService);
  private readonly refreshService = inject(RefreshService);

  readonly monitoring = signal<MonitoringReport | null>(null);
  readonly loading = signal(false);

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.refreshService.tick$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    this.monitoringService
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (m) => {
          this.monitoring.set(m);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  nodeEntries(check: MonitoringCheck): { host: string; age: number; fresh: boolean }[] {
    const out: { host: string; age: number; fresh: boolean }[] = [];
    for (const [host, age] of Object.entries(check.nodes?.fresh ?? {}))
      out.push({ host, age, fresh: true });
    for (const [host, age] of Object.entries(check.nodes?.stale ?? {}))
      out.push({ host, age, fresh: false });
    return out;
  }
}
