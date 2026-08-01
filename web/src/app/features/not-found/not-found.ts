import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatToolbarModule],
  template: `
    <mat-toolbar>
      <span>Page not found</span>
    </mat-toolbar>
    <p class="hint">The page you requested does not exist. Use the navigation to return to the dashboard.</p>
  `,
  styles: [
    `
      .hint {
        color: rgba(0, 0, 0, 0.54);
        padding: 16px;
      }
    `,
  ],
})
export class NotFound {}
