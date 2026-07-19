import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  BalanceDoc,
  BalancePost,
  DenNode,
  Info,
  Monitoring,
  Queue,
  Task,
} from './models';

/** OR-able query values keyed by indexed field name. */
export type TaskQueryParams = { [field: string]: string | string[] };

/** Dot-prefixed query options (.limit, .skip, .count, .terse, .full, .epoch, .pretty, .fields). */
export type TaskQueryOptions = { [dotKey: string]: string | number | boolean | null | undefined };

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private readonly jsonHeaders = new HttpHeaders({ Accept: 'application/json' });

  getInfo(): Observable<Info> {
    return this.http.get<Info>('/info', { headers: this.jsonHeaders });
  }

  getMonitoring(): Observable<Monitoring> {
    return this.http.get<Monitoring>('/monitoring', { headers: this.jsonHeaders });
  }

  // ---- Nodes ----

  getNodes(): Observable<DenNode[]> {
    return this.http.get<DenNode[]>('/nodes', { headers: this.jsonHeaders });
  }

  updateNode(node: string, body: { maxthreads: number | null }): Observable<unknown> {
    return this.http.post('/nodes/' + encodeURIComponent(node), body, { headers: this.jsonHeaders });
  }

  // ---- Plugins ----

  getPlugins(): Observable<string[]> {
    return this.http.get<string[]>('/plugins', { headers: this.jsonHeaders });
  }

  // ---- Queues ----

  getQueues(): Observable<Queue[]> {
    return this.http.get<Queue[]>('/queues', { headers: this.jsonHeaders });
  }

  createQueue(body: { name: string; plugin: string }): Observable<unknown> {
    return this.http.post('/queues', body, { headers: this.jsonHeaders });
  }

  updateQueue(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.post('/queues/' + encodeURIComponent(id), body, { headers: this.jsonHeaders });
  }

  // ---- Tasks ----

  getTasks(params: TaskQueryParams, options: TaskQueryOptions): Observable<Task[]> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          if (v !== '') {
            httpParams = httpParams.append(key, v);
          }
        }
      } else if (value !== '' && value != null) {
        httpParams = httpParams.append(key, value);
      }
    }
    for (const [key, value] of Object.entries(options)) {
      if (value == null || value === '' || value === false) {
        continue;
      }
      httpParams = httpParams.append(key, value === true ? '1' : String(value));
    }
    return this.http.get<Task[]>('/tasks', { headers: this.jsonHeaders, params: httpParams });
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>('/tasks/' + encodeURIComponent(id), { headers: this.jsonHeaders });
  }

  // ---- Balance ----

  getBalance(): Observable<BalanceDoc> {
    return this.http.get<BalanceDoc>('/balance', { headers: this.jsonHeaders });
  }

  postBalance(body: BalancePost): Observable<{ status: string }> {
    return this.http.post<{ status: string }>('/balance', body, { headers: this.jsonHeaders });
  }
}
