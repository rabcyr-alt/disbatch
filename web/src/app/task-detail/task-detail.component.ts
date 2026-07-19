import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ApiService } from '../core/api.service';
import { Task } from '../core/models';

@Component({
  selector: 'app-task-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './task-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  readonly id = signal<string>('');
  readonly task = signal<Task | null>(null);
  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.id.set(id);
    this.api.getTask(id).subscribe({
      next: (task) => {
        this.task.set(task);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const body = err.error;
        if (body && typeof body === 'object' && body.error) {
          this.errorMsg.set(String(body.error));
        } else if (err.status === 404) {
          this.errorMsg.set(`No task with id ${id}`);
        } else {
          this.errorMsg.set(`HTTP ${err.status}`);
        }
      },
    });
  }

  pretty(task: Task): string {
    return JSON.stringify(task, null, 2);
  }
}
