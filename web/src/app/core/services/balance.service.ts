import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BalanceDoc, BalanceResult, BalanceSubmit } from '../models/balance';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private readonly http = inject(HttpClient);

  get(): Observable<BalanceDoc> {
    return this.http.get<BalanceDoc>('/balance');
  }

  submit(payload: BalanceSubmit): Observable<BalanceResult> {
    return this.http.post<BalanceResult>('/balance', payload);
  }
}
