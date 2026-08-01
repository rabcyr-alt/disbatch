import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Monitoring } from './monitoring';
import { MonitoringService } from '../../core/services/monitoring.service';
import { RefreshService } from '../../core/services/refresh.service';
import { MonitoringReport } from '../../core/models/monitoring';

const report: MonitoringReport = {
  disbatch: { status: 'OK', message: 'Disbatch is running on one or more nodes' },
  queuebalance: { status: 'OK', message: 'queuebalance disabled' },
};

describe('Monitoring', () => {
  it('renders without throwing', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MonitoringService, useValue: { get: vi.fn(() => of(report)) } },
        {
          provide: RefreshService,
          useValue: { tick$: of({ manual: false }), setInterval: vi.fn(), refresh: vi.fn() },
        },
      ],
    });
    const fixture = TestBed.createComponent(Monitoring);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('Monitoring');
  });
});
