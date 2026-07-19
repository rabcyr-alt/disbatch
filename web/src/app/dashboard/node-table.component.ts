import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApiService } from '../core/api.service';
import { DenNode } from '../core/models';
import { apiErrorMessage, messageFromBody } from '../core/api-error';

@Component({
  selector: 'app-node-table',
  imports: [FormsModule, MatTableModule, MatFormFieldModule, MatInputModule],
  templateUrl: './node-table.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './table.shared.scss',
})
export class NodeTableComponent {
  private api = inject(ApiService);
  private snack = inject(MatSnackBar);

  @Input() nodes: DenNode[] = [];

  @Output() changed = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();

  readonly columns = ['id', 'node', 'maxthreads', 'timestamp'];

  editingNode: string | null = null;
  editValue: string = '';

  isEditing(row: DenNode): boolean {
    return this.editingNode === row.node;
  }

  formatTimestamp(ms: number): string {
    if (!ms && ms !== 0) {
      return '';
    }
    return new Date(ms).toLocaleString();
  }

  startEdit(row: DenNode): void {
    if (this.isEditing(row)) {
      return;
    }
    this.editingNode = row.node;
    this.editValue = row.maxthreads == null ? '' : String(row.maxthreads);
    this.editingChange.emit(true);
  }

  cancelEdit(): void {
    if (this.editingNode !== null) {
      this.editingNode = null;
      this.editingChange.emit(false);
    }
  }

  commitEdit(row: DenNode): void {
    if (!this.isEditing(row)) {
      return;
    }
    this.editingNode = null;
    this.editingChange.emit(false);

    const trimmed = String(this.editValue ?? '').trim();
    const previous = row.maxthreads == null ? '' : String(row.maxthreads);
    if (trimmed === previous) {
      return; // no change
    }
    const maxthreads = trimmed === '' ? null : Number(trimmed);
    this.api.updateNode(row.node, { maxthreads }).subscribe({
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
}
