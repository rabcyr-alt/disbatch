import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { QueuesService } from './queues.service';

describe('QueuesService', () => {
  let service: QueuesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QueuesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('lists queues from GET /queues', () => {
    service.list().subscribe();
    http.expectOne((r) => r.url === '/queues' && r.method === 'GET').flush([]);
  });

  it('creates a queue with name + plugin (and optional threads/sort)', () => {
    service.create('q1', 'Disbatch::Plugin::Demo', 4, 'fifo').subscribe();
    const req = http.expectOne((r) => r.url === '/queues' && r.method === 'POST');
    expect(req.request.body).toEqual({ name: 'q1', plugin: 'Disbatch::Plugin::Demo', threads: 4, sort: 'fifo' });
    req.flush({});
  });

  it('omits threads/sort when not provided', () => {
    service.create('q1', 'Disbatch::Plugin::Demo').subscribe();
    const req = http.expectOne((r) => r.url === '/queues' && r.method === 'POST');
    expect(req.request.body).toEqual({ name: 'q1', plugin: 'Disbatch::Plugin::Demo' });
    req.flush({});
  });

  it('posts changes to /queues/:id', () => {
    service.update('abc', { threads: 8 }).subscribe();
    const req = http.expectOne('/queues/abc');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ threads: 8 });
    req.flush({});
  });

  it('url-encodes the queue id in the path', () => {
    service.update('id with space', { name: 'x' }).subscribe();
    http.expectOne('/queues/id%20with%20space').flush({});
  });
});
