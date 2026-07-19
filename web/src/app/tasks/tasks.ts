import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { Api, TaskQueryOptions, TaskQueryParams } from '../core/api';
import { Task } from '../core/models';

@Component({
  selector: 'app-tasks',
  imports: [
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  private api = inject(Api);

  /** Index sets from the API; the first element of each is the leading field. */
  readonly indexes = signal<string[][]>([]);
  /** Unique indexed fields, one input group each. */
  readonly fields = signal<string[]>([]);
  readonly bootstrapError = signal<string | null>(null);

  /** OR-able values per field (each starts with a single empty input). */
  readonly values = signal<Record<string, string[]>>({});

  readonly limit = signal(100);
  readonly count = signal(false);
  readonly terse = signal(false);
  readonly full = signal(false);
  readonly epoch = signal(false);

  // Results state
  readonly results = signal<Task[] | null>(null);
  readonly countResult = signal<number | null>(null);
  readonly errorMsg = signal<string | null>(null);
  readonly invalidParams = signal<string[]>([]);
  readonly errorIndexes = signal<string[][]>([]);
  readonly searched = signal(false);

  private lastParams: TaskQueryParams = {};
  readonly lastLimit = signal(100);
  private readonly skip = signal(0);

  ngOnInit(): void {
    // Bootstrap the form from the API's own 400 error (its `indexes`).
    this.api.getTasks({}, {}).subscribe({
      next: () => {
        // Unexpected 200 with no params; leave the form empty.
      },
      error: (err: HttpErrorResponse) => {
        const body = err.error;
        if (body && Array.isArray(body.indexes)) {
          this.setIndexes(body.indexes);
        } else {
          this.bootstrapError.set('Could not load task indexes.');
        }
      },
    });
  }

  private setIndexes(indexes: string[][]): void {
    this.indexes.set(indexes);
    const seen = new Set<string>();
    const fields: string[] = [];
    for (const set of indexes) {
      for (const field of set) {
        if (!seen.has(field)) {
          seen.add(field);
          fields.push(field);
        }
      }
    }
    this.fields.set(fields);
    this.values.update((values) => {
      const next = { ...values };
      for (const field of fields) {
        next[field] ??= [''];
      }
      return next;
    });
  }

  /** Writes one value back; `[(ngModel)]` cannot assign into a signal's array. */
  setValue(field: string, i: number, value: string): void {
    this.values.update((values) => ({
      ...values,
      [field]: (values[field] ?? ['']).map((v, idx) => (idx === i ? value : v)),
    }));
  }

  addValue(field: string): void {
    this.values.update((values) => ({ ...values, [field]: [...(values[field] ?? ['']), ''] }));
  }

  removeValue(field: string, i: number): void {
    this.values.update((values) => {
      const arr = values[field] ?? [''];
      return { ...values, [field]: arr.length <= 1 ? [''] : arr.filter((_, idx) => idx !== i) };
    });
  }

  private buildParams(): TaskQueryParams {
    const params: TaskQueryParams = {};
    const values = this.values();
    for (const field of this.fields()) {
      const vals = (values[field] ?? []).map((v) => String(v).trim()).filter((v) => v !== '');
      if (vals.length === 1) {
        params[field] = vals[0];
      } else if (vals.length > 1) {
        params[field] = vals;
      }
    }
    return params;
  }

  private buildOptions(skip: number): TaskQueryOptions {
    const options: TaskQueryOptions = { '.limit': this.limit(), '.skip': skip };
    if (this.count()) options['.count'] = true;
    if (this.terse()) options['.terse'] = true;
    if (this.full()) options['.full'] = true;
    if (this.epoch()) options['.epoch'] = true;
    return options;
  }

  submit(): void {
    this.lastParams = this.buildParams();
    this.lastLimit.set(this.limit());
    this.skip.set(0);
    this.runQuery();
  }

  nextPage(): void {
    this.skip.update((skip) => skip + this.lastLimit());
    this.runQuery();
  }

  private runQuery(): void {
    this.searched.set(true);
    this.errorMsg.set(null);
    this.invalidParams.set([]);
    this.errorIndexes.set([]);

    this.api.getTasks(this.lastParams, this.buildOptions(this.skip())).subscribe({
      next: (body: unknown) => {
        if (Array.isArray(body)) {
          this.countResult.set(null);
          this.results.set(body as Task[]);
        } else if (this.count() && body && typeof body === 'object' && 'count' in body) {
          this.countResult.set((body as { count: number }).count);
          this.results.set(null);
        } else if (body && typeof body === 'object' && Object.keys(body).length === 0) {
          // Empty object => no documents found.
          this.countResult.set(null);
          this.results.set([]);
        } else if (body && typeof body === 'object') {
          // Single document (.limit == 1).
          this.countResult.set(null);
          this.results.set([body as Task]);
        } else {
          this.results.set([]);
          this.countResult.set(null);
        }
      },
      error: (err: HttpErrorResponse) => {
        const body = err.error;
        this.results.set(null);
        this.countResult.set(null);
        if (body && typeof body === 'object') {
          this.errorMsg.set(body.error ? String(body.error) : `HTTP ${err.status}`);
          if (Array.isArray(body.invalid_params)) {
            this.invalidParams.set(body.invalid_params);
          }
          if (Array.isArray(body.indexes)) {
            this.errorIndexes.set(body.indexes);
          }
        } else {
          this.errorMsg.set(`HTTP ${err.status}`);
        }
      },
    });
  }

  taskId(task: Task): string | null {
    const id = task['_id'];
    return typeof id === 'string' ? id : null;
  }

  pretty(task: Task): string {
    return JSON.stringify(task, null, 2);
  }

  readonly canPaginate = computed(() => {
    const results = this.results();
    const limit = this.lastLimit();
    return !this.count() && limit > 0 && results != null && results.length === limit;
  });

  readonly pageNumber = computed(() => {
    const limit = this.lastLimit();
    return limit > 0 ? Math.floor(this.skip() / limit) + 1 : 1;
  });
}
