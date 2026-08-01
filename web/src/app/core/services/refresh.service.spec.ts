import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RefreshService } from './refresh.service';

interface Tick {
  manual: boolean;
}

describe('RefreshService', () => {
  let service: RefreshService;
  let appRef: ApplicationRef;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(RefreshService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    vi.useRealTimers();
    setHidden(false);
  });

  /** Drives the zoneless effect that propagates signal changes into tick$, then flushes RxJS timers. */
  const flush = (): void => {
    appRef.tick();
    vi.runOnlyPendingTimers();
  };

  it('defaults to a 30s interval (matches the backend refresh_ms default)', () => {
    expect(service.intervalSeconds()).toBe(30);
  });

  const setHidden = (hidden: boolean): void => {
    Object.defineProperty(document, 'hidden', { value: hidden, configurable: true });
  };

  it('pauses auto-refresh at interval 0 but still honors manual refresh', () => {
    service.setInterval(0); // pause before subscribing
    flush();
    const ticks: Tick[] = [];
    const sub = service.tick$.subscribe((t) => ticks.push(t));
    flush();
    expect(ticks).toEqual([]); // no timer tick when paused

    service.refresh();
    flush();
    expect(ticks).toEqual([{ manual: true }]);
    sub.unsubscribe();
  });

  it('suppresses auto-ticks while the tab is hidden but always honors manual refresh', () => {
    service.setInterval(1); // 1s for fast testing
    flush();
    const ticks: Tick[] = [];
    const sub = service.tick$.subscribe((t) => ticks.push(t));
    flush(); // immediate timer(0) tick, tab visible
    expect(ticks).toEqual([{ manual: false }]);

    setHidden(true);
    ticks.length = 0;
    vi.advanceTimersByTime(5000); // 5s of auto-ticks, all suppressed
    flush();
    expect(ticks).toEqual([]);

    service.refresh(); // manual passes through even when hidden
    flush();
    expect(ticks).toEqual([{ manual: true }]);
    sub.unsubscribe();
  });

  it('emits an immediate tick when the interval changes (switchMap resets the timer)', () => {
    service.setInterval(0); // paused: no immediate tick
    flush();
    const ticks: Tick[] = [];
    const sub = service.tick$.subscribe((t) => ticks.push(t));
    flush();
    expect(ticks).toEqual([]);

    service.setInterval(2); // resume → timer(0, 2000) → immediate tick
    flush();
    expect(ticks).toEqual([{ manual: false }]);
    sub.unsubscribe();
  });
});
