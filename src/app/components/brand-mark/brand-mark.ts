import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The Maimoon Digital mark: a dark rounded tile with a single-stroke "M". */
@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 32 32" focusable="false">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="currentColor" />
      <path d="M9.5 21.5V11.25L16 17.75L22.5 11.25V21.5" fill="none" stroke="var(--mark-ink, #fff)"
            stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  styles: `
    :host { display: inline-block; width: 1.25em; height: 1.25em; flex: none; }
    svg { width: 100%; height: 100%; }
  `,
})
export class BrandMarkComponent {}
