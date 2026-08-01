import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { TaskDetail } from './task-detail';
import { TasksService } from '../../../core/services/tasks.service';

describe('TaskDetail', () => {
  it('renders without throwing', () => {
    const id = '000000000000000000000000';
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id })) } },
        { provide: TasksService, useValue: { get: vi.fn(() => of({ error: 'not found' })) } },
      ],
    });
    const fixture = TestBed.createComponent(TaskDetail);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain(`Task ${id}`);
  });
});
