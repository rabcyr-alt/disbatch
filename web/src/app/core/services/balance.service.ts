import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Balance, BalanceResult, BalanceSubmit } from '../models/balance';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private readonly http = inject(HttpClient);

  get(): Observable<Balance> {
    return this.http.get<Balance>('/balance');
  }

  submit(payload: BalanceSubmit): Observable<BalanceResult> {
    return this.http.post<BalanceResult>('/balance', payload);
  }
}
