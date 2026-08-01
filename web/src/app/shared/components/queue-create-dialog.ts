import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface QueueCreateResult {
  name: string;
  plugin: string;
  threads: number | null;
  sort: string | null;
}

@Component({
  selector: 'app-queue-create-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './queue-create-dialog.html',
})
export class QueueCreateDialog {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<QueueCreateDialog, QueueCreateResult>);

  readonly plugins = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    plugin: ['', Validators.required],
    threads: this.fb.control<number | null>(null),
    sort: this.fb.control<string | null>(null),
  });

  setPlugins(plugins: string[]): void {
    this.plugins.set(plugins);
    // Default the type to the first available plugin (matches the legacy
    // behavior) when none is selected yet, so Create is enabled as soon as a
    // name is typed.
    if (!this.form.controls.plugin.value && plugins.length) {
      this.form.controls.plugin.setValue(plugins[0]);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.ref.close({
      name: v.name.trim(),
      plugin: v.plugin,
      threads: v.threads,
      sort: v.sort,
    });
  }

  cancel(): void {
    this.ref.close();
  }
}
