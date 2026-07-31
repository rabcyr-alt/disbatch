import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MonitoringService } from '../../core/services/monitoring.service';
import { RefreshService } from '../../core/services/refresh.service';
import { Monitoring, MonitoringCheck } from '../../core/models/monitoring';
import { StatusBadgeComponent } from '../../shared/components/status-badge';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [MatCardModule, MatToolbarModule, StatusBadgeComponent],
  templateUrl: './monitoring.html',
  styleUrl: './monitoring.scss',
})
export class MonitoringComponent implements OnInit {
  private readonly monitoringService = inject(MonitoringService);
  private readonly refreshService = inject(RefreshService);

  readonly monitoring = signal<Monitoring | null>(null);
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

  nodeEntries(check: MonitoringCheck): { host: string; age: number }[] {
    const out: { host: string; age: number }[] = [];
    for (const [host, age] of Object.entries(check.nodes?.fresh ?? {})) out.push({ host, age });
    for (const [host, age] of Object.entries(check.nodes?.stale ?? {})) out.push({ host, age });
    return out;
  }
}
