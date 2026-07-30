import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Queue, CreateQueueResponse, MongoResult } from '../models/queue';

@Injectable({ providedIn: 'root' })
export class QueuesService {
  private readonly http = inject(HttpClient);

  list(): Observable<Queue[]> {
    return this.http.get<Queue[]>('/queues');
  }

  get(queue: string): Observable<Queue> {
    return this.http.get<Queue>(`/queues/${encodeURIComponent(queue)}`);
  }

  create(name: string, plugin: string, threads?: number, sort?: string): Observable<CreateQueueResponse> {
    const body: Record<string, unknown> = { name, plugin };
    if (threads != null) body['threads'] = threads;
    if (sort != null) body['sort'] = sort;
    return this.http.post<CreateQueueResponse>('/queues', body);
  }

  update(queue: string, changes: Record<string, unknown>): Observable<MongoResult> {
    return this.http.post<MongoResult>(`/queues/${encodeURIComponent(queue)}`, changes);
  }

  delete(queue: string): Observable<MongoResult> {
    return this.http.delete<MongoResult>(`/queues/${encodeURIComponent(queue)}`);
  }

  /** Convenience: build HttpParams for queue-scoped task queries. */
  static queueParam(queue: string): { queue: string } {
    return { queue };
  }
}
