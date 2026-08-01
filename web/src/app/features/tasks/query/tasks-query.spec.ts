import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { TasksQuery } from './tasks-query';
import { TasksService } from '../../../core/services/tasks.service';
import { TasksSchemaResponse } from '../../../core/models/task';

const schema: TasksSchemaResponse = {
  schema: { verb: 'GET', limit: 100, title: 'Tasks', subtitle: '', params: {} },
  indexes: [['id']],
};

function stubSchema(value: unknown): void {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: TasksService, useValue: { schema: vi.fn(() => value) } },
    ],
  });
}

describe('TasksQuery', () => {
  // Regression for bug #1: fieldForm was a definite-assignment field never
  // initialized before the schema resolved, so [formGroup] bound undefined and
  // the page threw (NG01052 / TypeError) if GET /tasks was slow or failed.
  it('renders without throwing before the schema resolves', () => {
    stubSchema(EMPTY);
    const fixture = TestBed.createComponent(TasksQuery);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('Disbatch Tasks Query');
    // The form region is guarded, so no [formGroup] binding fires on undefined.
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('shows a schema-error banner when GET /tasks fails', () => {
    stubSchema(throwError(() => new HttpErrorResponse({ status: 500 })));
    const fixture = TestBed.createComponent(TasksQuery);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Could not load query schema');
  });

  it('builds the query form when the schema resolves', () => {
    stubSchema(of(schema));
    const fixture = TestBed.createComponent(TasksQuery);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Index sets');
  });
});
