import { Component, OnInit, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { InfoService } from '../../core/services/info.service';
import { Info } from '../../core/models/info';
import { JsonViewerComponent } from '../../shared/components/json-viewer.component';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatToolbarModule, JsonViewerComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
})
export class InfoComponent implements OnInit {
  private readonly infoService = inject(InfoService);
  private readonly destroy$ = new Subject<void>();

  readonly info = signal<Info | null>(null);

  ngOnInit(): void {
    this.infoService
      .get()
      .pipe(takeUntil(this.destroy$))
      .subscribe((i) => this.info.set(i));
  }

  routeEntries(routes: Record<string, string[]>): { verb: string; paths: string[] }[] {
    return Object.entries(routes).map(([verb, paths]) => ({ verb, paths }));
  }
}
