import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfoService } from '../core/services/info.service';
import { RefreshService } from '../core/services/refresh.service';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const SIDENAV_STORAGE_KEY = 'disbatch.sidenav.expanded';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit {
  private readonly infoService = inject(InfoService);
  protected readonly refreshService = inject(RefreshService);

  readonly database = signal<string>('');
  /** GET routes starting with '/', surfaced as clickable links (incl. web extensions). */
  readonly getRoutes = signal<string[]>([]);

  readonly links: NavLink[] = [
    { path: '/', label: 'Dashboard', icon: 'dashboard', exact: true },
    { path: '/tasks', label: 'Tasks', icon: 'assignment' },
    { path: '/balance', label: 'Balance', icon: 'balance' },
    { path: '/monitoring', label: 'Monitoring', icon: 'monitor_heart' },
    { path: '/info', label: 'Info', icon: 'info' },
  ];

  /** Expanded (full labels) vs collapsed (icons only) sidenav. Persisted. */
  readonly sidenavExpanded = signal<boolean>(readSidenavPref());

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.infoService
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((info) => {
        this.database.set(info.database);
        this.getRoutes.set((info.routes?.['GET'] ?? []).filter((r) => r.startsWith('/')));
        // The refresh interval is backend-configured (dashboard.refresh_ms);
        // seed the shared RefreshService from it. Falls back to the service's
        // default when the server omits it.
        const refreshMs = info.dashboard?.refresh_ms;
        if (refreshMs && refreshMs > 0) {
          this.refreshService.setInterval(Math.round(refreshMs / 1000));
        }
      });
  }

  toggleSidenav(): void {
    const next = !this.sidenavExpanded();
    this.sidenavExpanded.set(next);
    writeSidenavPref(next);
  }

  refresh(): void {
    this.refreshService.refresh();
  }
}

function readSidenavPref(): boolean {
  try {
    return localStorage.getItem(SIDENAV_STORAGE_KEY) !== '0';
  } catch {
    return true;
  }
}

function writeSidenavPref(expanded: boolean): void {
  try {
    localStorage.setItem(SIDENAV_STORAGE_KEY, expanded ? '1' : '0');
  } catch {
    // ignore (private mode, etc.)
  }
}
