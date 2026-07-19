import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApiService } from '../core/api.service';
import { DenNode, Queue } from '../core/models';
import { apiErrorMessage } from '../core/api-error';
import { QueueTableComponent } from './queue-table.component';
import { NodeTableComponent } from './node-table.component';

/**
 * Defaults for the dashboard tunables, used when GET /info omits them or the
 * request fails. The server sources the live values from the `dashboard` config
 * key (see lib/Disbatch/Web.pm GET /info).
 */
const DEFAULT_REFRESH_MS = 30_000;
const DEFAULT_LIVE_WINDOW_MS = 15_000;

/** Human-readable duration for a millisecond value (e.g. "15 seconds", "15 minutes"). */
function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds % 60 === 0 && seconds >= 60) {
    const minutes = seconds / 60;
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  return `${seconds} second${seconds === 1 ? '' : 's'}`;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    QueueTableComponent,
    NodeTableComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  readonly queues = signal<Queue[]>([]);
  readonly nodes = signal<DenNode[]>([]);
  readonly plugins = signal<string[]>([]);
  readonly loading = signal(false);

  /** Number of open editors/dialogs across child tables; auto-refresh pauses when > 0. */
  private editCount = 0;
  readonly editing = signal(false);

  /** Effective tunables from GET /info (fall back to the defaults). */
  private refreshMs = DEFAULT_REFRESH_MS;
  readonly liveWindowMs = signal(DEFAULT_LIVE_WINDOW_MS);

  readonly liveNodes = computed(() => {
    const now = Date.now();
    const window = this.liveWindowMs();
    return this.nodes().filter((n) => n.timestamp + window >= now);
  });
  readonly deadNodes = computed(() => {
    const now = Date.now();
    const window = this.liveWindowMs();
    return this.nodes().filter((n) => n.timestamp + window < now);
  });

  readonly liveWindowLabel = computed(() => formatDuration(this.liveWindowMs()));

  ngOnInit(): void {
    this.api.getPlugins().subscribe({
      next: (plugins) => this.plugins.set(plugins),
      error: (err) => this.snack.open(apiErrorMessage(err), 'Dismiss', { duration: 5000 }),
    });

    // Load the dashboard tunables before starting auto-refresh; fall back to
    // the defaults if /info is unavailable or omits them.
    this.api.getInfo().subscribe({
      next: (info) => {
        const d = info.dashboard;
        if (d?.refresh_ms != null && d.refresh_ms > 0) {
          this.refreshMs = d.refresh_ms;
        }
        if (d?.live_window_ms != null && d.live_window_ms > 0) {
          this.liveWindowMs.set(d.live_window_ms);
        }
        this.startAutoRefresh();
      },
      error: () => this.startAutoRefresh(),
    });
  }

  private startAutoRefresh(): void {
    timer(0, this.refreshMs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.editing()) {
          this.reload();
        }
      });
  }

  setEditing(active: boolean): void {
    this.editCount += active ? 1 : -1;
    if (this.editCount < 0) {
      this.editCount = 0;
    }
    this.editing.set(this.editCount > 0);
  }

  reload(): void {
    this.loading.set(true);
    let pending = 2;
    const done = () => {
      pending -= 1;
      if (pending === 0) {
        this.loading.set(false);
      }
    };
    this.api.getQueues().subscribe({
      next: (queues) => {
        this.queues.set(queues);
        done();
      },
      error: (err) => {
        this.snack.open(apiErrorMessage(err), 'Dismiss', { duration: 5000 });
        done();
      },
    });
    this.api.getNodes().subscribe({
      next: (nodes) => {
        this.nodes.set(nodes);
        done();
      },
      error: (err) => {
        this.snack.open(apiErrorMessage(err), 'Dismiss', { duration: 5000 });
        done();
      },
    });
  }
}
