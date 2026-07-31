import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { QueuesService } from '../../core/services/queues.service';
import { Queue } from '../../core/models/queue';
import { isUnchanged, normalizeEdit, parseMaxThreads } from '../edit';
import {
  QueueCreateDialogComponent,
  QueueCreateResult,
} from './queue-create-dialog.component';

type EditableField = 'name' | 'threads';

@Component({
  selector: 'app-queue-table',
  standalone: true,
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
  styleUrl: './table.shared.scss',
})
export class QueueTableComponent {
  private readonly queuesService = inject(QueuesService);
  private readonly dialog = inject(MatDialog);

  readonly queues = input<Queue[]>([]);
  readonly plugins = input<string[]>([]);

  /** Emitted when data changed and the parent should reload. */
  readonly changed = output<void>();
  /** Emitted true while an editor/dialog is open (pauses auto-refresh). */
  readonly editingChange = output<boolean>();

  readonly columns = ['id', 'plugin', 'name', 'threads', 'queued', 'running', 'completed'];

  private readonly editing = signal<{ id: string; field: EditableField } | null>(null);
  /** `<input type="number">` writes a number here, not a string. */
  readonly editValue = signal<string | number>('');

  isEditing(row: Queue, field: EditableField): boolean {
    const editing = this.editing();
    return editing?.id === row.id && editing?.field === field;
  }

  startEdit(row: Queue, field: EditableField): void {
    if (this.isEditing(row, field)) {
      return;
    }
    this.editing.set({ id: row.id, field });
    this.editValue.set(field === 'threads' ? (row.threads == null ? '' : String(row.threads)) : row[field]);
    this.editingChange.emit(true);
  }

  cancelEdit(): void {
    if (this.editing()) {
      this.editing.set(null);
      this.editingChange.emit(false);
    }
  }

  commitEdit(row: Queue, field: EditableField): void {
    if (!this.isEditing(row, field)) {
      return;
    }
    this.editing.set(null);
    this.editingChange.emit(false);

    const raw = this.editValue();
    const original = field === 'threads' ? row.threads : row[field];
    if (isUnchanged(raw, original)) {
      return;
    }
    const value: string | number | null =
      field === 'threads' ? parseMaxThreads(raw) : normalizeEdit(raw);
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
    this.queuesService.update(id, body).subscribe({
      next: () => this.changed.emit(),
      error: () => this.changed.emit(),
    });
  }

  openNewQueue(): void {
    this.editingChange.emit(true);
    const ref = this.dialog.open(QueueCreateDialogComponent, { width: '420px' });
    ref.componentInstance.setPlugins(this.plugins());
    ref.afterClosed().subscribe((result?: QueueCreateResult) => {
      this.editingChange.emit(false);
      if (!result) {
        return;
      }
      this.queuesService
        .create(result.name, result.plugin, result.threads ?? undefined, result.sort ?? undefined)
        .subscribe({
          next: () => this.changed.emit(),
          error: () => this.changed.emit(),
        });
    });
  }
}
