import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TasksService } from '../../../core/services/tasks.service';
import {
  IndexSet,
  Task,
  TaskErrorResponse,
  TaskQueryOptions,
  TasksSchemaResponse,
} from '../../../core/models/task';

export const TASK_STATUS_LABELS: Record<number, string> = {
  [-6]: 'orphaned',
  [-2]: 'queued',
  [-1]: 'claimed',
  [0]: 'running',
  [1]: 'success',
  [2]: 'failure',
};

@Component({
  selector: 'app-tasks-query',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './tasks-query.html',
  styleUrl: './tasks-query.scss',
})
export class TasksQueryComponent implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly indexes = signal<IndexSet[]>([]);
  readonly indexFields = signal<string[]>([]);
  readonly loading = signal(false);
  readonly results = signal<Task[]>([]);
  readonly error = signal<TaskErrorResponse | null>(null);
  readonly skip = signal(0);
  readonly limit = signal(100);

  protected fieldForm!: FormGroup;
  private lastParams: Record<string, string | string[]> = {};

  readonly optionsForm = this.fb.nonNullable.group({
    limit: [100],
    fields: [''],
    terse: [false],
    full: [false],
    epoch: [false],
    pretty: [false],
  });

  ngOnInit(): void {
    this.tasksService
      .schema()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: TasksSchemaResponse) => {
        this.indexes.set(res.indexes);
        const fields = this.uniqueFields(res.indexes);
        this.indexFields.set(fields);
        this.buildFieldForm(fields);
        this.limit.set(res.schema.limit);
        this.optionsForm.controls.limit.setValue(res.schema.limit);
      });
  }

  private uniqueFields(indexes: IndexSet[]): string[] {
    const set = new Set<string>();
    for (const idx of indexes) for (const f of idx) set.add(f);
    return [...set];
  }

  private buildFieldForm(fields: string[]): void {
    const g = this.fb.group({});
    for (const f of fields) {
      g.addControl(f, this.fb.array([this.fb.nonNullable.control('')]));
    }
    this.fieldForm = g;
  }

  fieldArray(name: string): FormArray<FormControl<string>> {
    return this.fieldForm.get(name) as FormArray<FormControl<string>>;
  }

  addField(name: string): void {
    this.fieldArray(name).push(this.fb.nonNullable.control(''));
  }

  removeField(name: string, index: number): void {
    const arr = this.fieldArray(name);
    if (arr.length > 1) arr.removeAt(index);
  }

  statusLabel(status: number): string {
    return TASK_STATUS_LABELS[status] ?? String(status);
  }

  submit(): void {
    this.skip.set(0);
    this.runQuery();
  }

  next(): void {
    this.skip.update((s) => s + this.limit());
    this.runQuery();
  }

  prev(): void {
    this.skip.update((s) => Math.max(0, s - this.limit()));
    this.runQuery();
  }

  private runQuery(): void {
    const params: Record<string, string | string[]> = {};
    for (const field of this.indexFields()) {
      const values = this.fieldArray(field)
        .controls.map((c) => c.value.trim())
        .filter((v) => v !== '');
      if (values.length === 0) continue;
      params[field] = values.length === 1 ? values[0] : values;
    }
    this.lastParams = params;

    const opts = this.optionsForm.getRawValue();
    const limit = opts.limit || 0;
    this.limit.set(limit);
    const options: TaskQueryOptions = {
      '.limit': limit,
      '.skip': this.skip(),
      '.terse': opts.terse,
      '.full': opts.full,
      '.epoch': opts.epoch,
      '.pretty': opts.pretty,
    };
    if (opts.fields.trim()) options['.fields'] = opts.fields.trim();

    this.loading.set(true);
    this.error.set(null);
    this.tasksService
      .query(params, options)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (Array.isArray(res)) {
            this.results.set(res);
          } else {
            this.results.set([]);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.results.set([]);
          if (err.status === 400 && err.error && typeof err.error === 'object') {
            this.error.set(err.error as TaskErrorResponse);
          }
        },
      });
  }

  hasMore(): boolean {
    return this.limit() > 1 && this.results().length >= this.limit();
  }

  pretty(task: Task): string {
    return JSON.stringify(task, null, 2);
  }

  json(value: unknown): string {
    return JSON.stringify(value);
  }
}
