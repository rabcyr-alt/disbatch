import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NodesService } from '../../core/services/nodes.service';
import { DenNode } from '../../core/models/node';
import { isUnchanged, parseMaxThreads } from '../edit';

@Component({
  selector: 'app-node-table',
  standalone: true,
  imports: [FormsModule, MatTableModule, MatFormFieldModule, MatInputModule],
  templateUrl: './node-table.html',
  styleUrl: './table.shared.scss',
})
export class NodeTableComponent {
  private readonly nodesService = inject(NodesService);

  readonly nodes = input<DenNode[]>([]);

  readonly changed = output<void>();
  readonly editingChange = output<boolean>();

  readonly columns = ['id', 'node', 'maxthreads', 'timestamp'];

  private readonly editingNode = signal<string | null>(null);
  /** `<input type="number">` writes a number here, not a string. */
  readonly editValue = signal<string | number>('');

  isEditing(row: DenNode): boolean {
    return this.editingNode() === row.node;
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
    this.editingNode.set(row.node);
    this.editValue.set(row.maxthreads == null ? '' : String(row.maxthreads));
    this.editingChange.emit(true);
  }

  cancelEdit(): void {
    if (this.editingNode() !== null) {
      this.editingNode.set(null);
      this.editingChange.emit(false);
    }
  }

  commitEdit(row: DenNode): void {
    if (!this.isEditing(row)) {
      return;
    }
    this.editingNode.set(null);
    this.editingChange.emit(false);

    if (isUnchanged(this.editValue(), row.maxthreads)) {
      return;
    }
    const maxthreads = parseMaxThreads(this.editValue());
    this.nodesService.updateMaxThreads(row.node, maxthreads).subscribe({
      next: () => this.changed.emit(),
      error: () => this.changed.emit(),
    });
  }
}
