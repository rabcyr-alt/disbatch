import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Dashboard } from './dashboard';
import { QueuesService } from '../../core/services/queues.service';
import { NodesService } from '../../core/services/nodes.service';
import { PluginsService } from '../../core/services/plugins.service';
import { InfoService } from '../../core/services/info.service';
import { RefreshService } from '../../core/services/refresh.service';
import { DenNode } from '../../core/models/node';

const infoResponse = {
  database: 'test',
  web_extensions: [],
  routes: { GET: ['/'] },
  dashboard: { refresh_ms: 30000, live_window_ms: 15000 },
};

function setup(nodes: DenNode[] = []): void {
  TestBed.configureTestingModule({
    imports: [MatDialogModule, MatSnackBarModule],
    providers: [
      provideZonelessChangeDetection(),
      { provide: QueuesService, useValue: { list: vi.fn(() => of([])) } },
      { provide: NodesService, useValue: { list: vi.fn(() => of(nodes)) } },
      { provide: PluginsService, useValue: { list: vi.fn(() => of([])) } },
      { provide: InfoService, useValue: { get: vi.fn(() => of(infoResponse)) } },
      {
        provide: RefreshService,
        useValue: { tick$: of({ manual: false }), setInterval: vi.fn(), refresh: vi.fn() },
      },
    ],
  });
}

describe('Dashboard', () => {
  it('renders without throwing', () => {
    setup();
    const fixture = TestBed.createComponent(Dashboard);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('Queues');
  });

  // Regression guard for M2/M4: the live/dead split must be a pure function of
  // the server-side `live` flag, not of the browser's Date.now().
  it('splits live/dead nodes via the server-side live flag', () => {
    const nodes: DenNode[] = [
      { id: '1', _id: '1', node: 'alive', timestamp: Date.now(), live: true },
      { id: '2', _id: '2', node: 'dead', timestamp: 0, live: false },
    ];
    setup(nodes);
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.liveNodes().length).toBe(1);
    expect(c.liveNodes()[0].node).toBe('alive');
    expect(c.deadNodes().length).toBe(1);
    expect(c.deadNodes()[0].node).toBe('dead');
  });
});
