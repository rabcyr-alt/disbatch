import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PluginsService {
  private readonly http = inject(HttpClient);

  list(): Observable<string[]> {
    return this.http.get<string[]>('/plugins');
  }
}
