import { Component, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApiService } from '../core/api.service';
import { Queue } from '../core/models';
import { unwrapMongoResult } from '../core/mongo-result';
import { apiErrorMessage, messageFromBody } from '../core/api-error';
import { NewQueueDialogComponent } from './new-queue-dialog.component';

type EditableField = 'name' | 'threads';

@Component({
  selector: 'app-queue-table',
  imports: [
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './queue-table.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './table.shared.scss',
})
export class QueueTableComponent {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  readonly queues = input<Queue[]>([]);
  readonly plugins = input<string[]>([]);

  /** Emitted when data changed and the parent should reload. */
  readonly changed = output<void>();
  /** Emitted true while an editor/dialog is open (pauses auto-refresh). */
  readonly editingChange = output<boolean>();

  readonly columns = [
    'id',
    'plugin',
    'name',
    'threads',
    'queued',
    'running',
    'completed',
  ];

  editing: { id: string; field: EditableField } | null = null;
  editValue: string | number = '';

  isEditing(row: Queue, field: EditableField): boolean {
    return this.editing?.id === row.id && this.editing?.field === field;
  }

  startEdit(row: Queue, field: EditableField): void {
    if (this.isEditing(row, field)) {
      return;
    }
    this.editing = { id: row.id, field };
    this.editValue = row[field];
    this.editingChange.emit(true);
  }

  cancelEdit(): void {
    if (this.editing) {
      this.editing = null;
      this.editingChange.emit(false);
    }
  }

  commitEdit(row: Queue, field: EditableField): void {
    if (!this.isEditing(row, field)) {
      return;
    }
    this.editing = null;
    this.editingChange.emit(false);

    const raw = this.editValue;
    if (String(raw) === String(row[field])) {
      return; // no change
    }
    const value: string | number = field === 'threads' ? Number(raw) : String(raw);
    this.postUpdate(row.id, { [field]: value });
  }

  /** Commits a plugin change from the always-present inline select. */
  commitPlugin(row: Queue, plugin: string): void {
    if (plugin === row.plugin) {
      return;
    }
    this.postUpdate(row.id, { plugin });
  }

  private postUpdate(id: string, body: Record<string, unknown>): void {
    this.api.updateQueue(id, body).subscribe({
      next: (res) => {
        const msg = messageFromBody(res);
        if (msg) {
          this.snack.open(msg, 'Dismiss', { duration: 5000 });
        }
        this.changed.emit();
      },
      error: (err) => {
        this.snack.open(apiErrorMessage(err), 'Dismiss', { duration: 5000 });
        this.changed.emit();
      },
    });
  }

  openNewQueue(): void {
    this.editingChange.emit(true);
    const ref = this.dialog.open(NewQueueDialogComponent, {
      data: { plugins: this.plugins() },
      width: '360px',
    });
    ref.afterClosed().subscribe((result?: { name: string; plugin: string }) => {
      this.editingChange.emit(false);
      if (!result) {
        return;
      }
      this.api.createQueue(result).subscribe({
        next: (res) => {
          const unwrapped = unwrapMongoResult(res);
          const msg = messageFromBody(res);
          if (msg && !unwrapped.id) {
            this.snack.open(msg, 'Dismiss', { duration: 5000 });
          }
          this.changed.emit();
        },
        error: (err) => {
          this.snack.open(apiErrorMessage(err), 'Dismiss', { duration: 5000 });
          this.changed.emit();
        },
      });
    });
  }
}
