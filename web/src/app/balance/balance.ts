import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Api } from '../core/api';
import { BalanceDoc, BalancePost, BalanceSettings } from '../core/models';
import { apiErrorMessage } from '../core/api-error';
import { MaxTaskRow, validateBalance } from './validate';

const DOW_OPTIONS: { value: string; label: string }[] = [
  { value: '*', label: 'Daily' },
  { value: '0', label: 'Sun' },
  { value: '1', label: 'Mon' },
  { value: '2', label: 'Tue' },
  { value: '3', label: 'Wed' },
  { value: '4', label: 'Thu' },
  { value: '5', label: 'Fri' },
  { value: '6', label: 'Sat' },
];

const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: '5 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
  { value: 720, label: '12 hours' },
  { value: 1440, label: '24 hours' },
];

@Component({
  selector: 'app-balance',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
  ],
  templateUrl: './balance.html',
  styleUrl: './balance.scss',
})
export class Balance implements OnInit {
  private api = inject(Api);
  private snack = inject(MatSnackBar);

  readonly dowOptions = DOW_OPTIONS;
  readonly durationOptions = DURATION_OPTIONS;

  readonly notice = signal<string | null>(null);
  readonly settings = signal<BalanceSettings | null>(null);
  readonly knownQueues = signal<string[]>([]);
  readonly currentlyDisabled = signal<number | null>(null);

  readonly queueGroups = signal<string[]>(['']);
  readonly maxTasksRows = signal<MaxTaskRow[]>([{ dow: '', time: '', size: '' }]);
  readonly disableMinutes = signal<number | ''>('');
  readonly reenable = signal(false);

  // Validation / preview state
  readonly queueError = signal<string | null>(null);
  readonly intervalError = signal<string | null>(null);
  readonly generalError = signal<string | null>(null);
  readonly jsonPreview = signal<string>('');
  readonly invalidGroups = signal<Set<number>>(new Set());
  readonly invalidRows = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getBalance().subscribe({
      next: (doc) => this.applyDoc(doc),
      error: (err) => this.snack.open(apiErrorMessage(err), 'Dismiss', { duration: 5000 }),
    });
  }

  private applyDoc(doc: BalanceDoc): void {
    this.notice.set(doc.notice ?? null);
    this.settings.set(doc.settings ?? null);
    this.knownQueues.set([...(doc.known_queues ?? [])].sort());
    this.currentlyDisabled.set(typeof doc.disabled === 'number' ? doc.disabled : null);

    this.queueGroups.set(
      doc.queues && doc.queues.length ? doc.queues.map((g) => g.join(',')) : [''],
    );

    const rows: MaxTaskRow[] = [];
    for (const [key, size] of Object.entries(doc.max_tasks ?? {})) {
      const [dow, time] = key.split(' ');
      rows.push({ dow: dow ?? '', time: time ?? '', size: String(size) });
    }
    this.maxTasksRows.set(rows.length ? rows : [{ dow: '', time: '', size: '' }]);

    this.disableMinutes.set('');
    this.reenable.set(false);
    this.recompute();
  }

  isEnabled(): boolean {
    return !!this.settings()?.enabled;
  }

  isPretend(): boolean {
    return !!this.settings()?.pretend;
  }

  disabledUntil(): string | null {
    const d = this.currentlyDisabled();
    return d ? new Date(d * 1000).toLocaleString() : null;
  }

  // ---- Queue groups ----

  /** Writes one group back; `[(ngModel)]` cannot assign into a signal's array. */
  setQueueGroup(i: number, value: string): void {
    this.queueGroups.update((groups) => groups.map((g, idx) => (idx === i ? value : g)));
    this.recompute();
  }

  addQueueGroup(): void {
    this.queueGroups.update((groups) => [...groups, '']);
    this.recompute();
  }

  removeQueueGroup(): void {
    this.queueGroups.update((groups) => (groups.length > 1 ? groups.slice(0, -1) : ['']));
    this.recompute();
  }

  queueGroupLabel(i: number): string {
    return i === 0 ? 'default priority' : 'higher priority';
  }

  // ---- Max tasks ----

  /** Writes one field of one row back; see {@link setQueueGroup}. */
  setMaxTaskField(i: number, field: keyof MaxTaskRow, value: string): void {
    this.maxTasksRows.update((rows) =>
      rows.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    );
    this.recompute();
  }

  addMaxTaskRow(): void {
    this.maxTasksRows.update((rows) => [...rows, { dow: '', time: '', size: '' }]);
    this.recompute();
  }

  removeMaxTaskRow(): void {
    this.maxTasksRows.update((rows) =>
      rows.length > 1 ? rows.slice(0, -1) : [{ dow: '', time: '', size: '' }],
    );
    this.recompute();
  }

  // ---- Disable / re-enable ----

  setDisableMinutes(value: number | ''): void {
    this.disableMinutes.set(value);
    this.recompute();
  }

  setReenable(value: boolean): void {
    this.reenable.set(value);
    this.recompute();
  }

  /** Recomputes validation errors and the JSON preview. Returns the body if valid. */
  recompute(): BalancePost | null {
    const result = validateBalance({
      queueGroups: this.queueGroups(),
      maxTasksRows: this.maxTasksRows(),
      disableMinutes: this.disableMinutes(),
      reenable: this.reenable(),
      knownQueues: this.knownQueues(),
    });

    this.queueError.set(result.queueError);
    this.intervalError.set(result.intervalError);
    this.generalError.set(result.generalError);
    this.invalidGroups.set(result.invalidGroups);
    this.invalidRows.set(result.invalidRows);
    this.jsonPreview.set(result.json ? JSON.stringify(result.json, null, 2) : '');

    return result.json;
  }

  submit(): void {
    const json = this.recompute();
    if (!json) {
      return;
    }
    this.api.postBalance(json).subscribe({
      next: (res) => {
        this.snack.open(res.status ?? 'queuebalance modified', 'Dismiss', { duration: 5000 });
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        const body = err.error;
        const msg =
          body && typeof body === 'object' && body.status
            ? String(body.status)
            : apiErrorMessage(err);
        this.snack.open(msg, 'Dismiss', { duration: 8000 });
      },
    });
  }
}
