import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QueuesService } from '../../core/services/queues.service';
import { NodesService } from '../../core/services/nodes.service';
import { PluginsService } from '../../core/services/plugins.service';
import { InfoService } from '../../core/services/info.service';
import { RefreshService } from '../../core/services/refresh.service';
import { Queue } from '../../core/models/queue';
import { DenNode } from '../../core/models/node';
import { QueueTableComponent } from '../../shared/components/queue-table.component';
import { NodeTableComponent } from '../../shared/components/node-table.component';

/** Default node-liveness window when GET /info omits `dashboard.live_window_ms`. */
const DEFAULT_LIVE_WINDOW_MS = 15_000;

/** Human-readable duration for a millisecond value (e.g. "15 seconds", "15 minutes"). */
export function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds % 60 === 0 && seconds >= 60) {
    const minutes = seconds / 60;
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  return `${seconds} second${seconds === 1 ? '' : 's'}`;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
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
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly queuesService = inject(QueuesService);
  private readonly nodesService = inject(NodesService);
  private readonly pluginsService = inject(PluginsService);
  private readonly infoService = inject(InfoService);
  private readonly refreshService = inject(RefreshService);

  readonly queues = signal<Queue[]>([]);
  readonly nodes = signal<DenNode[]>([]);
  readonly plugins = signal<string[]>([]);
  readonly loading = signal(false);

  /** Number of open editors/dialogs across child tables; auto-refresh pauses when > 0. */
  private editCount = 0;
  readonly editing = signal(false);

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

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.pluginsService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe((plugins) => this.plugins.set(plugins));

    // Load the liveness window from /info (if the backend provides it) before
    // the first refresh; fall back to the default otherwise.
    this.infoService
      .get()
      .pipe(takeUntil(this.destroy$))
      .subscribe((info) => {
        const w = info.dashboard?.live_window_ms;
        if (w != null && w > 0) {
          this.liveWindowMs.set(w);
        }
      });

    this.refreshService.tick$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.editing()) {
        this.reload();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.queuesService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (queues) => {
          this.queues.set(queues);
          done();
        },
        error: () => done(),
      });
    this.nodesService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nodes) => {
          this.nodes.set(nodes);
          done();
        },
        error: () => done(),
      });
  }
}
