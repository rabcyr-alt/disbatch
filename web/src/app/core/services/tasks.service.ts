import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Task,
  TaskCountResponse,
  TaskErrorResponse,
  TaskQueryOptions,
  TasksSchemaResponse,
} from '../models/task';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);

  /** GET /tasks with no params and no options -> { schema, indexes }. */
  schema(): Observable<TasksSchemaResponse> {
    return this.http.get<TasksSchemaResponse>('/tasks');
  }

  /**
   * GET /tasks with a query. `params` are indexed search fields (repeatable
   * values become $or). `options` are the dot-options (.limit, .skip, .count,
   * .fields, .terse, .full, .epoch, .pretty).
   *
   * Returns an array of tasks, a { count } object (if .count), or an error object.
   */
  query(
    params: Record<string, string | string[]>,
    options: TaskQueryOptions = {},
  ): Observable<Task[] | TaskCountResponse | TaskErrorResponse> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) httpParams = httpParams.append(key, v);
      } else if (value !== '') {
        httpParams = httpParams.set(key, value);
      }
    }
    for (const [key, value] of Object.entries(options)) {
      // The Perl backend parses query-string values as strings, where "false"
      // is truthy. So boolean options (.terse, .full, .epoch, .pretty, .count)
      // are sent as "1" when true and omitted entirely when false.
      if (typeof value === 'boolean') {
        if (value) httpParams = httpParams.set(key, '1');
        continue;
      }
      if (value === undefined || value === null) continue;
      httpParams = httpParams.set(key, String(value));
    }
    return this.http.get<Task[] | TaskCountResponse | TaskErrorResponse>('/tasks', { params: httpParams });
  }

  /** GET /tasks/:id -> task object, or { error } with 404. */
  get(id: string, full = false): Observable<Task | TaskErrorResponse> {
    const opts = full ? { params: new HttpParams().set('.full', '1') } : {};
    return this.http.get<Task | TaskErrorResponse>(`/tasks/${id}`, opts);
  }
}
