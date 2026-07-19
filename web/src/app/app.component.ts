import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

import { ApiService } from './core/api.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private api = inject(ApiService);

  readonly database = signal<string | null>(null);
  readonly getRoutes = signal<string[]>([]);
  readonly extensions = signal<string[]>([]);

  ngOnInit(): void {
    this.api.getInfo().subscribe({
      next: (info) => {
        this.database.set(info.database);
        this.getRoutes.set((info.routes?.['GET'] ?? []).filter((r) => r.startsWith('/')));
        this.extensions.set(info.web_extensions ?? []);
      },
      error: () => {
        // Leave defaults; the individual pages surface their own errors.
      },
    });
  }
}
