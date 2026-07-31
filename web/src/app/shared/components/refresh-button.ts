import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RefreshService } from '../../core/services/refresh.service';

@Component({
  selector: 'app-refresh-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button mat-icon-button (click)="refresh()" [matTooltip]="'Refresh now'">
      <mat-icon>refresh</mat-icon>
    </button>
  `,
})
export class RefreshButtonComponent {
  private readonly refreshService = inject(RefreshService);
  refresh(): void {
    this.refreshService.refresh();
  }
}
