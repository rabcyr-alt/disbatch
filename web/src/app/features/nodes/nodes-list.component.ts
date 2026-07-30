import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NodesService } from '../../core/services/nodes.service';
import { RefreshService } from '../../core/services/refresh.service';
import { DenNode } from '../../core/models/node';

@Component({
  selector: 'app-nodes-list',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatTableModule, MatToolbarModule, MatTooltipModule],
  templateUrl: './nodes-list.component.html',
  styleUrl: './nodes-list.component.scss',
})
export class NodesListComponent implements OnInit, OnDestroy {
  private readonly nodesService = inject(NodesService);
  private readonly refreshService = inject(RefreshService);

  readonly nodes = signal<DenNode[]>([]);
  readonly loading = signal(false);

  /** A node is "active" if its timestamp is within the last 15 minutes. */
  readonly active = computed(() => this.nodes().filter((n) => n.timestamp + 900000 >= Date.now()));
  readonly dead = computed(() => this.nodes().filter((n) => n.timestamp + 900000 < Date.now()));

  readonly displayedColumns = ['id', 'node', 'maxthreads', 'timestamp'];

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.refreshService.tick$.pipe(takeUntil(this.destroy$)).subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading.set(true);
    this.nodesService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ns) => {
          this.nodes.set(ns);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onEditMaxThreads(n: DenNode, value: string): void {
    const normalized: number | null = value === '' ? null : Number(value);
    if (normalized !== null && (Number.isNaN(normalized) || normalized < 0)) return;
    if (n.maxthreads === normalized) return;
    this.nodesService
      .updateMaxThreads(n.node, normalized)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.nodes.update((list) => list.map((row) => (row.id === n.id ? { ...row, maxthreads: normalized } : row)));
        },
        error: () => this.load(),
      });
  }

  formatTimestamp(ms: number): string {
    return new Date(ms).toISOString();
  }
}
