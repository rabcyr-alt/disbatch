import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface NewQueueDialogData {
  plugins: string[];
}

@Component({
  selector: 'app-new-queue-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Create new queue</h2>
    <mat-dialog-content class="new-queue-form">
      <mat-form-field appearance="outline" class="full">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="name" name="name" cdkFocusInitial />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Type</mat-label>
        <mat-select [(ngModel)]="plugin" name="plugin">
          @for (p of data.plugins; track p) {
            <mat-option [value]="p">{{ p }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!name.trim() || !plugin"
              (click)="create()">Create</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .new-queue-form {
        display: flex;
        flex-direction: column;
        padding-top: 8px;
      }
      .full {
        width: 100%;
      }
    `,
  ],
})
export class NewQueueDialogComponent {
  name = '';
  plugin = '';

  constructor(
    public dialogRef: MatDialogRef<NewQueueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewQueueDialogData,
  ) {}

  create(): void {
    const name = this.name.trim();
    if (!name || !this.plugin) {
      return;
    }
    this.dialogRef.close({ name, plugin: this.plugin });
  }
}
