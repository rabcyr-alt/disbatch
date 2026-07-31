import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TasksService } from './tasks.service';

/**
 * Contract tests for TasksService — what the UI sends to and expects from the
 * Disbatch JSON API. Runs against a mocked HTTP backend; no disbatchd/mongod.
 */
describe('TasksService', () => {
  let service: TasksService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TasksService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('GET /tasks with no params fetches the schema', () => {
    service.schema().subscribe();
    const req = http.expectOne((r) => r.url === '/tasks' && r.method === 'GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ schema: { limit: 100 }, indexes: [['queue']] });
  });

  it('repeats a key for OR-able values', () => {
    service.query({ status: ['1', '2'] }, {}).subscribe();
    const req = http.expectOne((r) => r.url === '/tasks');
    expect(req.request.params.getAll('status')).toEqual(['1', '2']);
    req.flush([]);
  });

  it('encodes boolean options as 1 and omits false ones', () => {
    service.query({}, { '.limit': 100, '.terse': true, '.full': false }).subscribe();
    const req = http.expectOne((r) => r.url === '/tasks');
    expect(req.request.params.get('.limit')).toBe('100');
    expect(req.request.params.get('.terse')).toBe('1');
    expect(req.request.params.has('.full')).toBe(false);
    req.flush([]);
  });

  it('fetches a single task by id, with .full when requested', () => {
    service.get('65f000000000000000000000', true).subscribe();
    const req = http.expectOne((r) => r.url === '/tasks/65f000000000000000000000');
    expect(req.request.params.get('.full')).toBe('1');
    req.flush({});
  });
});
