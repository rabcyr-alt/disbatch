import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Info } from './info';
import { InfoService } from '../../core/services/info.service';
import { InfoResponse } from '../../core/models/info';

const info: InfoResponse = {
  database: 'test',
  web_extensions: [],
  routes: { GET: ['/'] },
};

describe('Info', () => {
  it('renders without throwing', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: InfoService, useValue: { get: vi.fn(() => of(info)) } },
      ],
    });
    const fixture = TestBed.createComponent(Info);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('Info');
  });
});
