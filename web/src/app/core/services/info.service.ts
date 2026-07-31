import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InfoResponse } from '../models/info';

@Injectable({ providedIn: 'root' })
export class InfoService {
  private readonly http = inject(HttpClient);

  get(): Observable<InfoResponse> {
    return this.http.get<InfoResponse>('/info');
  }
}
