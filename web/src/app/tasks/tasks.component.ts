import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { ApiService, TaskQueryOptions, TaskQueryParams } from '../core/api.service';
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
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  private api = inject(ApiService);

  /** Index sets from the API; the first element of each is the leading field. */
  readonly indexes = signal<string[][]>([]);
  /** Unique indexed fields, one input group each. */
  readonly fields = signal<string[]>([]);
  readonly bootstrapError = signal<string | null>(null);

  /** OR-able values per field (each starts with a single empty input). */
  values: Record<string, string[]> = {};

  limit = 100;
  count = false;
  terse = false;
  full = false;
  epoch = false;

  // Results state
  readonly results = signal<Task[] | null>(null);
  readonly countResult = signal<number | null>(null);
  readonly errorMsg = signal<string | null>(null);
  readonly invalidParams = signal<string[]>([]);
  readonly errorIndexes = signal<string[][]>([]);
  readonly searched = signal(false);

  private lastParams: TaskQueryParams = {};
  lastLimit = 100;
  private skip = 0;

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
    for (const field of fields) {
      if (!this.values[field]) {
        this.values[field] = [''];
      }
    }
  }

  addValue(field: string): void {
    this.values[field] = [...(this.values[field] ?? ['']), ''];
  }

  removeValue(field: string, i: number): void {
    const arr = this.values[field] ?? [''];
    if (arr.length <= 1) {
      this.values[field] = [''];
    } else {
      this.values[field] = arr.filter((_, idx) => idx !== i);
    }
  }

  trackByIndex(i: number): number {
    return i;
  }

  private buildParams(): TaskQueryParams {
    const params: TaskQueryParams = {};
    for (const field of this.fields()) {
      const vals = (this.values[field] ?? []).map((v) => v.trim()).filter((v) => v !== '');
      if (vals.length === 1) {
        params[field] = vals[0];
      } else if (vals.length > 1) {
        params[field] = vals;
      }
    }
    return params;
  }

  private buildOptions(skip: number): TaskQueryOptions {
    const options: TaskQueryOptions = { '.limit': this.limit, '.skip': skip };
    if (this.count) options['.count'] = true;
    if (this.terse) options['.terse'] = true;
    if (this.full) options['.full'] = true;
    if (this.epoch) options['.epoch'] = true;
    return options;
  }

  submit(): void {
    this.lastParams = this.buildParams();
    this.lastLimit = this.limit;
    this.skip = 0;
    this.runQuery();
  }

  nextPage(): void {
    this.skip += this.lastLimit;
    this.runQuery();
  }

  private runQuery(): void {
    this.searched.set(true);
    this.errorMsg.set(null);
    this.invalidParams.set([]);
    this.errorIndexes.set([]);

    this.api.getTasks(this.lastParams, this.buildOptions(this.skip)).subscribe({
      next: (body: unknown) => {
        if (Array.isArray(body)) {
          this.countResult.set(null);
          this.results.set(body as Task[]);
        } else if (this.count && body && typeof body === 'object' && 'count' in body) {
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

  get canPaginate(): boolean {
    const r = this.results();
    return !this.count && this.lastLimit > 0 && r != null && r.length === this.lastLimit;
  }

  get pageNumber(): number {
    return this.lastLimit > 0 ? Math.floor(this.skip / this.lastLimit) + 1 : 1;
  }
}
