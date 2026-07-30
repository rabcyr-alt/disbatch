import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, merge, filter, map, switchMap, timer } from 'rxjs';

/**
 * Drives auto-refresh across feature views. Emits a tick on the configured
 * interval (seconds; 0 = paused) and on manual refresh requests. Timer ticks are
 * suppressed while the tab is hidden; manual refreshes always go through.
 */
@Injectable({ providedIn: 'root' })
export class RefreshService {
  /** Refresh interval in seconds. 0 pauses auto-refresh. */
  readonly intervalSeconds = signal(60);

  private readonly manual$ = new Subject<void>();

  readonly tick$ = merge(
    this.manual$.pipe(map(() => ({ manual: true }))),
    toObservable(this.intervalSeconds).pipe(
      switchMap((s) => (s > 0 ? timer(0, s * 1000) : EMPTY)),
      map(() => ({ manual: false })),
    ),
  ).pipe(filter((t) => t.manual || (typeof document !== 'undefined' && !document.hidden)));

  setInterval(seconds: number): void {
    this.intervalSeconds.set(seconds);
  }

  refresh(): void {
    this.manual$.next();
  }
}
