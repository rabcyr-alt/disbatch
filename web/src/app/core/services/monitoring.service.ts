import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Monitoring } from '../models/monitoring';

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private readonly http = inject(HttpClient);

  get(): Observable<Monitoring> {
    return this.http.get<Monitoring>('/monitoring');
  }
}
