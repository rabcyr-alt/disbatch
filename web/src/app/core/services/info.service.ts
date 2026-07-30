import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Info } from '../models/info';

@Injectable({ providedIn: 'root' })
export class InfoService {
  private readonly http = inject(HttpClient);

  get(): Observable<Info> {
    return this.http.get<Info>('/info');
  }
}
