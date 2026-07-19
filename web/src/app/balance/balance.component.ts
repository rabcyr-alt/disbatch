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

import { ApiService } from '../core/api.service';
import { BalanceDoc, BalancePost, BalanceSettings } from '../core/models';
import { apiErrorMessage } from '../core/api-error';

interface MaxTaskRow {
  dow: string;
  time: string;
  size: string;
}

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

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const QUEUE_NAME_RE = /^[\w-]+$/;

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
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.scss',
})
export class BalanceComponent implements OnInit {
  private api = inject(ApiService);
  private snack = inject(MatSnackBar);

  readonly dowOptions = DOW_OPTIONS;
  readonly durationOptions = DURATION_OPTIONS;

  readonly notice = signal<string | null>(null);
  readonly settings = signal<BalanceSettings | null>(null);
  readonly knownQueues = signal<string[]>([]);
  readonly currentlyDisabled = signal<number | null>(null);

  queueGroups: string[] = [''];
  maxTasksRows: MaxTaskRow[] = [{ dow: '', time: '', size: '' }];
  disableMinutes: number | '' = '';
  reenable = false;

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

    this.queueGroups =
      doc.queues && doc.queues.length ? doc.queues.map((g) => g.join(',')) : [''];

    const rows: MaxTaskRow[] = [];
    for (const [key, size] of Object.entries(doc.max_tasks ?? {})) {
      const [dow, time] = key.split(' ');
      rows.push({ dow: dow ?? '', time: time ?? '', size: String(size) });
    }
    this.maxTasksRows = rows.length ? rows : [{ dow: '', time: '', size: '' }];

    this.disableMinutes = '';
    this.reenable = false;
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

  addQueueGroup(): void {
    this.queueGroups = [...this.queueGroups, ''];
    this.recompute();
  }

  removeQueueGroup(): void {
    if (this.queueGroups.length > 1) {
      this.queueGroups = this.queueGroups.slice(0, -1);
    } else {
      this.queueGroups = [''];
    }
    this.recompute();
  }

  queueGroupLabel(i: number): string {
    return i === 0 ? 'default priority' : 'higher priority';
  }

  // ---- Max tasks ----

  addMaxTaskRow(): void {
    this.maxTasksRows = [...this.maxTasksRows, { dow: '', time: '', size: '' }];
    this.recompute();
  }

  removeMaxTaskRow(): void {
    if (this.maxTasksRows.length > 1) {
      this.maxTasksRows = this.maxTasksRows.slice(0, -1);
    } else {
      this.maxTasksRows = [{ dow: '', time: '', size: '' }];
    }
    this.recompute();
  }

  /** Recomputes validation errors and the JSON preview. Returns the body if valid. */
  recompute(): BalancePost | null {
    let queueError: string | null = null;
    let intervalError: string | null = null;
    let generalError: string | null = null;
    const invalidGroups = new Set<number>();
    const invalidRows = new Set<number>();

    const json: BalancePost = { max_tasks: {}, queues: [] };

    // disable / re-enable
    if (this.disableMinutes !== '' && this.reenable) {
      generalError = "can't set both a disable duration and re-enable together";
    } else if (this.disableMinutes !== '') {
      json.disabled = Math.round(Number(this.disableMinutes) * 60 + Date.now() / 1000);
    } else if (this.reenable) {
      json.disabled = null;
    }

    // queues
    const allNames: string[] = [];
    const known = this.knownQueues();
    this.queueGroups.forEach((raw, i) => {
      const normalized = raw.trim().replace(/,\s+/g, ',');
      if (normalized === '') {
        return;
      }
      if (!/^[\w-]+(?:,[\w-]+)*$/.test(normalized)) {
        queueError = queueError ?? `invalid queue list: "${normalized}"`;
        invalidGroups.add(i);
        return;
      }
      const names = normalized.split(',');
      for (const name of names) {
        if (!QUEUE_NAME_RE.test(name) || !known.includes(name)) {
          queueError = queueError ?? `unknown queue name: "${name}"`;
          invalidGroups.add(i);
        }
      }
      json.queues.push(names);
      allNames.push(...names);
    });

    // duplicate queue names across all groups
    const sorted = [...allNames].sort();
    const dups: string[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] === sorted[i] && !dups.includes(sorted[i])) {
        dups.push(sorted[i]);
      }
    }
    if (dups.length) {
      queueError = `duplicate queue names: ${dups.join(', ')}`;
      this.queueGroups.forEach((raw, i) => {
        const names = raw.trim().replace(/,\s+/g, ',').split(',');
        if (names.some((n) => dups.includes(n))) {
          invalidGroups.add(i);
        }
      });
    }

    // max_tasks
    this.maxTasksRows.forEach((row, i) => {
      const dow = row.dow;
      const time = row.time.trim();
      const size = String(row.size ?? '').trim();
      if (dow === '' && time === '' && size === '') {
        return;
      }
      if (dow === '' || time === '' || size === '') {
        intervalError = intervalError ?? 'fields left blank for interval(s)';
        invalidRows.add(i);
        return;
      }
      if (!TIME_RE.test(time)) {
        intervalError = intervalError ?? `invalid time: "${time}" (use 24-hour HH:MM)`;
        invalidRows.add(i);
        return;
      }
      if (!/^\d+$/.test(size)) {
        intervalError = intervalError ?? `not an integer: "${size}"`;
        invalidRows.add(i);
        return;
      }
      const key = `${dow} ${time}`;
      if (key in json.max_tasks) {
        intervalError = intervalError ?? 'dow+time duplicated for intervals';
        invalidRows.add(i);
        return;
      }
      json.max_tasks[key] = Number(size);
    });

    this.queueError.set(queueError);
    this.intervalError.set(intervalError);
    this.generalError.set(generalError);
    this.invalidGroups.set(invalidGroups);
    this.invalidRows.set(invalidRows);

    const valid = !queueError && !intervalError && !generalError;
    this.jsonPreview.set(valid ? JSON.stringify(json, null, 2) : '');
    return valid ? json : null;
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
