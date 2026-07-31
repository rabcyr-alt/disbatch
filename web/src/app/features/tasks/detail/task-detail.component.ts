import { Component, OnInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TasksService } from '../../../core/services/tasks.service';
import { Task, TaskOutput } from '../../../core/models/task';
import { TASK_STATUS_LABELS } from '../query/tasks-query.component';
import { JsonViewerComponent } from '../../../shared/components/json-viewer.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatSlideToggleModule, MatToolbarModule, JsonViewerComponent],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tasksService = inject(TasksService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = signal('');
  readonly task = signal<Task | null>(null);
  readonly notFound = signal(false);
  readonly loading = signal(false);
  readonly full = signal(false);

  readonly statusLabel = computed(() => {
    const t = this.task();
    return t ? (TASK_STATUS_LABELS[t.status] ?? String(t.status)) : '';
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          this.id.set(params.get('id') ?? '');
          return this.tasksService.get(this.id(), this.full());
        }),
      )
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  toggleFull(): void {
    this.full.update((v) => !v);
    this.loading.set(true);
    this.tasksService
      .get(this.id(), this.full())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  private handleResponse(res: Task | { error: string }): void {
    this.loading.set(false);
    if ('error' in res) {
      this.task.set(null);
      this.notFound.set(true);
      return;
    }
    this.task.set(res);
    this.notFound.set(false);
  }

  private handleError(err: HttpErrorResponse): void {
    this.loading.set(false);
    this.task.set(null);
    this.notFound.set(err.status === 404);
  }

  outputText(out: TaskOutput): string {
    if (out === null || out === undefined) return '(none)';
    if (typeof out === 'string') return out;
    // GridFS ObjectId reference (not resolved).
    return '(stored in GridFS — toggle "full" to load)';
  }
}
