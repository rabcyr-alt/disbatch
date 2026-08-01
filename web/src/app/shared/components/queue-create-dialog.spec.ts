import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { describe, expect, it } from 'vitest';

import { QueueCreateDialog, QueueCreateResult } from './queue-create-dialog';

describe('QueueCreateDialog', () => {
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MatDialogModule] });
    dialog = TestBed.inject(MatDialog);
  });

  /** Opens the dialog and seeds the plugin list, returning the live component instance. */
  function open(plugins: string[]): QueueCreateDialog {
    const ref = dialog.open(QueueCreateDialog, { width: '420px' });
    ref.componentInstance.setPlugins(plugins);
    return ref.componentInstance;
  }

  it('defaults the type to the first available plugin', () => {
    const c = open(['Disbatch::Plugin::Demo', 'Disbatch::Plugin::Other']);
    expect(c.form.controls.plugin.value).toBe('Disbatch::Plugin::Demo');
  });

  it('leaves the type empty (and invalid) when no plugins are configured', () => {
    const c = open([]);
    expect(c.form.controls.plugin.value).toBe('');
    expect(c.form.controls.plugin.invalid).toBe(true);
  });

  it('does not overwrite an already-selected plugin', () => {
    const c = open(['Disbatch::Plugin::Demo', 'Disbatch::Plugin::Other']);
    c.form.controls.plugin.setValue('Disbatch::Plugin::Other');
    c.setPlugins(['Disbatch::Plugin::Demo', 'Disbatch::Plugin::Other']);
    expect(c.form.controls.plugin.value).toBe('Disbatch::Plugin::Other');
  });

  it('emits name + first plugin + null threads/sort when only a name is typed', async () => {
    const ref = TestBed.inject(MatDialog).open<QueueCreateDialog, unknown, QueueCreateResult>(
      QueueCreateDialog,
      { width: '420px' },
    );
    ref.componentInstance.setPlugins(['Disbatch::Plugin::Demo']);
    ref.componentInstance.form.controls.name.setValue('q1');
    const result = await new Promise<QueueCreateResult | undefined>((resolve) => {
      ref.afterClosed().subscribe(resolve);
      ref.componentInstance.submit();
    });
    expect(result).toEqual({
      name: 'q1',
      plugin: 'Disbatch::Plugin::Demo',
      threads: null,
      sort: null,
    });
  });
});
