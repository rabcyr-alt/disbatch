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

const SIDENAV_STORAGE_KEY = 'disbatch.sidenav.opened';

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
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  private readonly infoService = inject(InfoService);
  protected readonly refreshService = inject(RefreshService);

  readonly database = signal<string>('');
  /** GET routes starting with '/', surfaced as clickable links (incl. web extensions). */
  readonly getRoutes = signal<string[]>([]);
  readonly intervalSeconds = signal<number>(60);

  readonly links: NavLink[] = [
    { path: '/', label: 'Dashboard', icon: 'dashboard', exact: true },
    { path: '/tasks', label: 'Tasks', icon: 'assignment' },
    { path: '/balance', label: 'Balance', icon: 'balance' },
    { path: '/monitoring', label: 'Monitoring', icon: 'monitor_heart' },
    { path: '/info', label: 'Info', icon: 'info' },
  ];

  readonly intervalChoices = [0, 15, 30, 60, 120, 300];

  /** Persisted open/collapsed state of the sidenav. */
  readonly sidenavOpened = signal<boolean>(readSidenavPref());

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.infoService
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((info) => {
        this.database.set(info.database);
        this.getRoutes.set((info.routes?.['GET'] ?? []).filter((r) => r.startsWith('/')));
      });
    this.intervalSeconds.set(this.refreshService.intervalSeconds());
  }

  toggleSidenav(): void {
    const next = !this.sidenavOpened();
    this.sidenavOpened.set(next);
    writeSidenavPref(next);
  }

  setInterval(seconds: number): void {
    this.intervalSeconds.set(seconds);
    this.refreshService.setInterval(seconds);
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

function writeSidenavPref(opened: boolean): void {
  try {
    localStorage.setItem(SIDENAV_STORAGE_KEY, opened ? '1' : '0');
  } catch {
    // ignore (private mode, etc.)
  }
}
