import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BalanceService } from '../../core/services/balance.service';
import { Balance, BalanceSubmit } from '../../core/models/balance';
import { JsonViewerComponent } from '../../shared/components/json-viewer';

interface MaxTaskRow {
  dow: string;
  time: string;
  size: string;
}

const DOW_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '' },
  { value: '*', label: 'Daily' },
  { value: '0', label: 'Sun' },
  { value: '1', label: 'Mon' },
  { value: '2', label: 'Tue' },
  { value: '3', label: 'Wed' },
  { value: '4', label: 'Thu' },
  { value: '5', label: 'Fri' },
  { value: '6', label: 'Sat' },
];

const DISABLE_OPTIONS = [
  { value: '', label: "[don't disable]" },
  { value: '5', label: '5 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '240', label: '4 hours' },
  { value: '480', label: '8 hours' },
  { value: '720', label: '12 hours' },
  { value: '1440', label: '24 hours' },
];

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const INT_RE = /^\d+$/;
const QUEUE_LIST_RE = /^[\w-]+(?:,[\w-]+)*$/;

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    MatTooltipModule,
    JsonViewerComponent,
  ],
  templateUrl: './balance.html',
  styleUrl: './balance.scss',
})
export class BalanceComponent implements OnInit {
  private readonly balanceService = inject(BalanceService);
  private readonly fb = inject(FormBuilder);

  readonly dowOptions = DOW_OPTIONS;
  readonly disableOptions = DISABLE_OPTIONS;

  readonly knownQueues = signal<string[]>([]);
  readonly settings = signal<Balance['settings'] | null>(null);
  readonly notice = signal<string | null>(null);
  readonly disabledUntil = signal<number | null>(null);
  readonly errors = signal<string[]>([]);
  readonly preview = signal<BalanceSubmit | null>(null);
  readonly submitted = signal(false);
  /** Indices of queue groups / max-task rows failing validation (for highlighting). */
  readonly invalidQueueGroups = signal<Set<number>>(new Set());
  readonly invalidMaxTaskRows = signal<Set<number>>(new Set());

  readonly form = this.fb.group({
    queues: this.fb.array([this.fb.control('')]),
    max_tasks: this.fb.array<FormGroup>([]),
    disable: this.fb.control(''),
    reenable: this.fb.control(false),
  });

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.load();
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(150))
      .subscribe(() => this.rebuildPreview());
  }

  get queues(): FormArray {
    return this.form.get('queues') as FormArray;
  }

  get maxTasks(): FormArray {
    return this.form.get('max_tasks') as FormArray;
  }

  private load(): void {
    this.balanceService
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((b: Balance) => {
        this.knownQueues.set(b.known_queues ?? []);
        this.settings.set(b.settings ?? null);
        this.notice.set(b.notice ?? null);
        this.disabledUntil.set(b.disabled ?? null);

        // queues
        const queues = b.queues ?? [];
        this.queues.clear();
        if (queues.length) {
          for (const group of queues) this.queues.push(this.fb.control(group.join(',')));
        } else {
          this.queues.push(this.fb.control(''));
        }

        // max_tasks
        const maxTasks = b.max_tasks ?? {};
        this.maxTasks.clear();
        const entries = Object.entries(maxTasks);
        if (entries.length) {
          for (const [key, size] of entries) {
            const [dow, time] = key.split(' ');
            this.maxTasks.push(this.fb.group({ dow: [dow ?? ''], time: [time ?? ''], size: [String(size)] }));
          }
        } else {
          this.addMaxTaskRow();
        }

        this.rebuildPreview();
      });
  }

  addQueueRow(): void {
    this.queues.push(this.fb.control(''));
  }

  removeQueueRow(i: number): void {
    if (this.queues.length > 1) this.queues.removeAt(i);
  }

  addMaxTaskRow(): void {
    this.maxTasks.push(this.fb.group({ dow: [''], time: [''], size: [''] }));
  }

  removeMaxTaskRow(i: number): void {
    if (this.maxTasks.length > 1) this.maxTasks.removeAt(i);
  }

  private maxTaskRowValue(row: FormGroup): MaxTaskRow {
    const v = row.value as MaxTaskRow;
    return { dow: (v.dow ?? '').trim(), time: (v.time ?? '').trim(), size: (v.size ?? '').trim() };
  }

  private rebuildPreview(): void {
    const { payload, invalidGroups, invalidRows } = this.buildPayload();
    this.preview.set(payload);
    this.invalidQueueGroups.set(invalidGroups);
    this.invalidMaxTaskRows.set(invalidRows);
  }

  private buildPayload(): {
    payload: BalanceSubmit | null;
    errors: string[];
    invalidGroups: Set<number>;
    invalidRows: Set<number>;
  } {
    const errors: string[] = [];
    const invalidGroups = new Set<number>();
    const invalidRows = new Set<number>();
    const known = this.knownQueues();

    // queues
    const queues: string[][] = [];
    const allQueueNames: string[] = [];
    let i = 0;
    for (const ctrl of this.queues.controls) {
      const raw = ((ctrl.value as string) ?? '').trim().replace(/,\s+/g, ',');
      if (raw === '') {
        i++;
        continue;
      }
      if (!QUEUE_LIST_RE.test(raw)) {
        errors.push(`Invalid queue list: "${raw}"`);
        invalidGroups.add(i);
        i++;
        continue;
      }
      const parts = raw.split(',');
      let bad = false;
      for (const q of parts) {
        if (!known.includes(q)) {
          errors.push(`Unknown queue name: "${q}"`);
          bad = true;
        }
      }
      if (bad) invalidGroups.add(i);
      queues.push(parts);
      allQueueNames.push(...parts);
      i++;
    }
    const dupes = allQueueNames.filter((q, idx) => allQueueNames.indexOf(q) !== idx);
    if (dupes.length) {
      errors.push('duplicate queue names: ' + [...new Set(dupes)].join(', '));
      // Flag every group that contains a duplicated name.
      const dupeSet = new Set(dupes);
      this.queues.controls.forEach((ctrl, idx) => {
        const names = ((ctrl.value as string) ?? '').split(',').map((s) => s.trim());
        if (names.some((n) => dupeSet.has(n))) invalidGroups.add(idx);
      });
    }

    // max_tasks
    const max_tasks: Record<string, number> = {};
    const seenKeys = new Set<string>();
    let r = 0;
    for (const row of this.maxTasks.controls) {
      const { dow, time, size } = this.maxTaskRowValue(row as FormGroup);
      const empty = dow === '' && time === '' && size === '';
      if (empty) {
        r++;
        continue;
      }
      if (dow === '' || time === '' || size === '') {
        errors.push('fields left blank for interval(s)');
        invalidRows.add(r);
        r++;
        continue;
      }
      if (!TIME_RE.test(time)) {
        errors.push(`Invalid time: "${time}" (use HH:MM)`);
        invalidRows.add(r);
        r++;
        continue;
      }
      if (!INT_RE.test(size)) {
        errors.push(`Not an integer: "${size}"`);
        invalidRows.add(r);
        r++;
        continue;
      }
      const key = `${dow} ${time}`;
      if (seenKeys.has(key)) {
        errors.push('dow+time duplicated for intervals');
        invalidRows.add(r);
        r++;
        continue;
      }
      seenKeys.add(key);
      max_tasks[key] = Number(size);
      r++;
    }

    // disable / re-enable mutual exclusion
    const disable = this.form.controls.disable.value as string;
    const reenable = this.form.controls.reenable.value as boolean;
    if (disable !== '' && reenable) {
      errors.push("can't set both disable time and re-enable together");
    }

    let disabled: number | null | undefined = undefined;
    if (disable !== '') {
      disabled = Math.round(Number(disable) * 60 + Date.now() / 1000);
    } else if (reenable) {
      disabled = null;
    }

    if (errors.length) {
      return { payload: null, errors, invalidGroups, invalidRows };
    }

    const payload: BalanceSubmit = { max_tasks, queues };
    if (disabled !== undefined) payload.disabled = disabled;
    return { payload, errors, invalidGroups, invalidRows };
  }

  submit(): void {
    this.submitted.set(true);
    const { payload, errors, invalidGroups, invalidRows } = this.buildPayload();
    this.errors.set(errors);
    this.invalidQueueGroups.set(invalidGroups);
    this.invalidMaxTaskRows.set(invalidRows);
    if (!payload) return;
    this.balanceService
      .submit(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }
}
