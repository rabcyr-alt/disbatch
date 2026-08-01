import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { InfoResponse } from '../models/info';

@Injectable({ providedIn: 'root' })
export class InfoService {
  private readonly http = inject(HttpClient);

  // Cache /info so the Shell (database/routes/refresh interval) and the
  // Dashboard (liveness window) share a single fetch instead of each issuing
  // its own GET /info on every dashboard visit.
  private readonly cache$ = this.http.get<InfoResponse>('/info').pipe(
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  get(): Observable<InfoResponse> {
    return this.cache$;
  }
}
