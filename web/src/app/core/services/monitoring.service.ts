import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonitoringReport } from '../models/monitoring';

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private readonly http = inject(HttpClient);

  get(): Observable<MonitoringReport> {
    return this.http.get<MonitoringReport>('/monitoring');
  }
}
