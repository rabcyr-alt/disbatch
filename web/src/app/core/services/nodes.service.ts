import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DenNode } from '../models/node';
import { MongoResult } from '../models/queue';

@Injectable({ providedIn: 'root' })
export class NodesService {
  private readonly http = inject(HttpClient);

  list(): Observable<DenNode[]> {
    return this.http.get<DenNode[]>('/nodes');
  }

  updateMaxThreads(node: string, maxthreads: number | null): Observable<MongoResult> {
    return this.http.post<MongoResult>(`/nodes/${encodeURIComponent(node)}`, { maxthreads });
  }
}
