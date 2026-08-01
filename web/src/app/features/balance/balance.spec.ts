import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Balance } from './balance';
import { BalanceService } from '../../core/services/balance.service';
import { BalanceDoc } from '../../core/models/balance';

describe('Balance', () => {
  it('renders without throwing', () => {
    const doc: BalanceDoc = {
      known_queues: [],
      settings: { log: false, verbose: false, pretend: false, enabled: false },
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: BalanceService, useValue: { get: vi.fn(() => of(doc)), submit: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(Balance);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('QueueBalancer');
  });
});
