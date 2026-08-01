import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { NodeTable } from './node-table';
import { NodesService } from '../../core/services/nodes.service';

describe('NodeTable', () => {
  it('renders without throwing', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: NodesService, useValue: { updateMaxThreads: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(NodeTable);
    fixture.componentRef.setInput('nodes', []);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
