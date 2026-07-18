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

/** A node is "live" if it reported within the last 15 minutes (matches legacy queues.js). */
const LIVE_WINDOW_MS = 900_000;
const REFRESH_MS = 60_000;

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

  readonly liveNodes = computed(() => {
    const now = Date.now();
    return this.nodes().filter((n) => n.timestamp + LIVE_WINDOW_MS >= now);
  });
  readonly deadNodes = computed(() => {
    const now = Date.now();
    return this.nodes().filter((n) => n.timestamp + LIVE_WINDOW_MS < now);
  });

  ngOnInit(): void {
    this.api.getPlugins().subscribe({
      next: (plugins) => this.plugins.set(plugins),
      error: (err) => this.snack.open(apiErrorMessage(err), 'Dismiss', { duration: 5000 }),
    });

    timer(0, REFRESH_MS)
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
