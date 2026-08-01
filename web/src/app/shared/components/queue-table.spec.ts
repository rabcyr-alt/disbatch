import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { describe, expect, it, vi } from 'vitest';
import { QueueTable } from './queue-table';
import { QueuesService } from '../../core/services/queues.service';

describe('QueueTable', () => {
  it('renders without throwing', () => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, MatSnackBarModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: QueuesService, useValue: { update: vi.fn(), create: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(QueueTable);
    fixture.componentRef.setInput('queues', []);
    fixture.componentRef.setInput('plugins', []);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
