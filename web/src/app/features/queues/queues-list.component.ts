import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QueuesService } from '../../core/services/queues.service';
import { PluginsService } from '../../core/services/plugins.service';
import { RefreshService } from '../../core/services/refresh.service';
import { Queue } from '../../core/models/queue';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog.component';
import { QueueCreateDialogComponent, QueueCreateResult } from './queue-create-dialog.component';

@Component({
  selector: 'app-queues-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './queues-list.component.html',
  styleUrl: './queues-list.component.scss',
})
export class QueuesListComponent implements OnInit, OnDestroy {
  private readonly queuesService = inject(QueuesService);
  private readonly pluginsService = inject(PluginsService);
  private readonly refreshService = inject(RefreshService);
  private readonly dialog = inject(MatDialog);

  readonly queues = signal<Queue[]>([]);
  readonly plugins = signal<string[]>([]);
  readonly loading = signal(false);

  readonly displayedColumns = ['id', 'plugin', 'name', 'threads', 'queued', 'running', 'completed', 'actions'];

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.pluginsService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe((p) => this.plugins.set(p));
    this.refreshService.tick$.pipe(takeUntil(this.destroy$)).subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading.set(true);
    this.queuesService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (qs) => {
          this.queues.set(qs);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  openCreate(): void {
    const ref = this.dialog.open(QueueCreateDialogComponent, { width: '420px' });
    ref.componentInstance.setPlugins(this.plugins());
    ref
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: QueueCreateResult) => {
        if (!result) return;
        this.queuesService
          .create(result.name, result.plugin, result.threads ?? undefined, result.sort ?? undefined)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => this.load());
      });
  }

  onEdit(q: Queue, field: 'plugin' | 'name' | 'threads' | 'sort', value: string | number | null): void {
    let normalized: unknown = value;
    if (field === 'threads') {
      normalized = value === '' || value === null ? null : Number(value);
      if (normalized !== null && (Number.isNaN(normalized as number) || (normalized as number) < 0)) return;
    }
    if (field === 'name' && (typeof value !== 'string' || value.trim() === '')) return;
    // No change.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((q as any)[field] === normalized) return;
    this.queuesService
      .update(q.id, { [field]: normalized })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Patch the row locally; periodic refresh will sync counts.
          this.queues.update((list) =>
            list.map((row) => (row.id === q.id ? { ...row, [field]: normalized } : row)),
          );
        },
        error: () => this.load(),
      });
  }

  confirmDelete(q: Queue): void {
    const data: ConfirmDialogData = {
      title: 'Delete queue',
      message: `Delete queue "${q.name}" (${q.id})? Tasks are not removed.`,
      okLabel: 'Delete',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.queuesService
          .delete(q.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => this.load());
      });
  }
}
