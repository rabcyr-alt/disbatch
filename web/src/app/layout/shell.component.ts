import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
}

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
export class ShellComponent implements OnInit, OnDestroy {
  private readonly infoService = inject(InfoService);
  protected readonly refreshService = inject(RefreshService);

  readonly database = signal<string>('');
  readonly intervalSeconds = signal<number>(60);

  readonly links: NavLink[] = [
    { path: '/queues', label: 'Queues', icon: 'queue' },
    { path: '/nodes', label: 'Nodes', icon: 'dns' },
    { path: '/tasks', label: 'Tasks', icon: 'assignment' },
    { path: '/balance', label: 'Balance', icon: 'balance' },
    { path: '/monitoring', label: 'Monitoring', icon: 'monitor_heart' },
    { path: '/info', label: 'Info', icon: 'info' },
  ];

  readonly intervalChoices = [0, 15, 30, 60, 120, 300];

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.infoService
      .get()
      .pipe(takeUntil(this.destroy$))
      .subscribe((info) => this.database.set(info.database));
    this.intervalSeconds.set(this.refreshService.intervalSeconds());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setInterval(seconds: number): void {
    this.intervalSeconds.set(seconds);
    this.refreshService.setInterval(seconds);
  }

  refresh(): void {
    this.refreshService.refresh();
  }
}
