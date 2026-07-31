import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NodesService } from './nodes.service';

describe('NodesService', () => {
  let service: NodesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NodesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('lists nodes from GET /nodes', () => {
    service.list().subscribe();
    http.expectOne((r) => r.url === '/nodes' && r.method === 'GET').flush([]);
  });

  it('posts a maxthreads number to /nodes/:node', () => {
    service.updateMaxThreads('den1', 8).subscribe();
    const req = http.expectOne('/nodes/den1');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ maxthreads: 8 });
    req.flush({});
  });

  it('sends null maxthreads to mean unlimited', () => {
    service.updateMaxThreads('den1', null).subscribe();
    const req = http.expectOne('/nodes/den1');
    expect(req.request.body).toEqual({ maxthreads: null });
    req.flush({});
  });

  it('url-encodes the node name in the path', () => {
    service.updateMaxThreads('host with space', null).subscribe();
    http.expectOne('/nodes/host%20with%20space').flush({});
  });
});
