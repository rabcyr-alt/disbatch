import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Api } from './api';

/**
 * Contract tests for the Disbatch JSON API as seen from the browser.
 *
 * These run against a mocked HTTP backend -- no disbatchd, no mongod, no
 * network. They pin down what the UI *sends and expects*; they cannot verify
 * what Disbatch::Web actually returns. Treat them as executable documentation
 * of the contract: if an endpoint changes shape, these say what has to change
 * on this side.
 */
describe('Api', () => {
  let api: Api;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(Api);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify(); // fails the test on any unexpected or outstanding request
  });

  describe('task queries', () => {
    it('sends a single indexed field as one param', () => {
      api.getTasks({ queue: 'alpha' }, {}).subscribe();
      const req = http.expectOne((r) => r.url === '/tasks');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.getAll('queue')).toEqual(['alpha']);
      req.flush([]);
    });

    it('repeats the key for OR-able values', () => {
      api.getTasks({ status: ['1', '2'] }, {}).subscribe();
      const req = http.expectOne((r) => r.url === '/tasks');
      expect(req.request.params.getAll('status')).toEqual(['1', '2']);
      req.flush([]);
    });

    it('drops empty values rather than sending blank params', () => {
      api.getTasks({ queue: '', node: ['', 'den1'] }, {}).subscribe();
      const req = http.expectOne((r) => r.url === '/tasks');
      expect(req.request.params.has('queue')).toBe(false);
      expect(req.request.params.getAll('node')).toEqual(['den1']);
      req.flush([]);
    });

    it('passes options through as dot-prefixed params', () => {
      api.getTasks({}, { '.limit': 100, '.skip': 200 }).subscribe();
      const req = http.expectOne((r) => r.url === '/tasks');
      expect(req.request.params.get('.limit')).toBe('100');
      expect(req.request.params.get('.skip')).toBe('200');
      req.flush([]);
    });

    it('encodes boolean options as 1 and omits the false ones', () => {
      api.getTasks({}, { '.count': true, '.terse': false, '.full': null }).subscribe();
      const req = http.expectOne((r) => r.url === '/tasks');
      expect(req.request.params.get('.count')).toBe('1');
      expect(req.request.params.has('.terse')).toBe(false);
      expect(req.request.params.has('.full')).toBe(false);
      req.flush({ count: 7 });
    });
  });

  describe('mutations', () => {
    it('posts max threads to the node endpoint', () => {
      api.updateNode('den1', { maxthreads: 8 }).subscribe();
      const req = http.expectOne('/nodes/den1');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ maxthreads: 8 });
      req.flush({});
    });

    it('sends null max threads to mean unlimited', () => {
      api.updateNode('den1', { maxthreads: null }).subscribe();
      const req = http.expectOne('/nodes/den1');
      expect(req.request.body).toEqual({ maxthreads: null });
      req.flush({});
    });

    it('url-encodes identifiers in the path', () => {
      api.updateNode('host with space', { maxthreads: null }).subscribe();
      http.expectOne('/nodes/host%20with%20space').flush({});
    });

    it('creates a queue with a name and plugin', () => {
      api.createQueue({ name: 'q1', plugin: 'Disbatch::Plugin::Demo' }).subscribe();
      const req = http.expectOne('/queues');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'q1', plugin: 'Disbatch::Plugin::Demo' });
      req.flush({});
    });
  });

  describe('reads', () => {
    it('requests JSON explicitly, since the API also speaks HTML', () => {
      api.getQueues().subscribe();
      const req = http.expectOne('/queues');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush([]);
    });

    it('fetches a single task by id', () => {
      api.getTask('65f000000000000000000000').subscribe();
      http.expectOne('/tasks/65f000000000000000000000').flush({});
    });
  });
});
