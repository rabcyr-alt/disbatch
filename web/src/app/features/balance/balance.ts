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
import { BalanceDoc, BalanceSubmit } from '../../core/models/balance';
import { JsonViewer } from '../../shared/components/json-viewer';
import { validateBalance, type BalanceInput, type MaxTaskRow } from '../../shared/validate';

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
    JsonViewer,
  ],
  templateUrl: './balance.html',
  styleUrl: './balance.scss',
})
export class Balance implements OnInit {
  private readonly balanceService = inject(BalanceService);
  private readonly fb = inject(FormBuilder);

  readonly dowOptions = DOW_OPTIONS;
  readonly disableOptions = DISABLE_OPTIONS;

  readonly knownQueues = signal<string[]>([]);
  readonly settings = signal<BalanceDoc['settings'] | null>(null);
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
      .subscribe((b: BalanceDoc) => {
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
            this.maxTasks.push(
              this.fb.group({ dow: [dow ?? ''], time: [time ?? ''], size: [String(size)] }),
            );
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
    return { dow: (v.dow ?? '').trim(), time: (v.time ?? '').trim(), size: String(v.size ?? '').trim() };
  }

  /** Builds the {@link BalanceInput} for the pure validator from the current form. */
  private toValidatorInput(): BalanceInput {
    return {
      queueGroups: this.queues.controls.map((c) => (c.value as string) ?? ''),
      maxTasksRows: this.maxTasks.controls.map((c) => this.maxTaskRowValue(c as FormGroup)),
      disableMinutes: this.form.controls.disable.value as number | '',
      reenable: this.form.controls.reenable.value as boolean,
      knownQueues: this.knownQueues(),
    };
  }

  private rebuildPreview(): void {
    const result = validateBalance(this.toValidatorInput());
    this.preview.set(result.payload);
    this.invalidQueueGroups.set(result.invalidGroups);
    this.invalidMaxTaskRows.set(result.invalidRows);
    // Keep the error list current so the highlight reflects live state; the
    // banner is only shown after submit (see submit()).
    this.errors.set(result.errors);
  }

  submit(): void {
    this.submitted.set(true);
    const result = validateBalance(this.toValidatorInput());
    this.errors.set(result.errors);
    this.invalidQueueGroups.set(result.invalidGroups);
    this.invalidMaxTaskRows.set(result.invalidRows);
    if (!result.payload) return;
    this.balanceService
      .submit(result.payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }
}
