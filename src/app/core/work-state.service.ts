import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MediaSlot } from './site.config';

/**
 * Coordinates the two views of the single page, mirroring the reference:
 * the home stack at `/` and the work view at `/?work=open`.
 */
@Injectable({ providedIn: 'root' })
export class WorkStateService {
  private readonly router = inject(Router);

  /** Label + kind of the media currently centred in the work view. */
  readonly active = signal<Pick<MediaSlot, 'label' | 'kind'> | null>(null);

  /** Where the home view was scrolled to when the work view opened. */
  private homeScroll = 0;

  private get inWork(): boolean {
    return this.router.parseUrl(this.router.url).queryParamMap.get('work') === 'open';
  }

  open(projectSlug?: string): void {
    if (!this.inWork) this.homeScroll = window.scrollY;
    leaveThen(() =>
      this.router.navigate([], { queryParams: { work: 'open' }, fragment: projectSlug }).then(() => {
        afterPaint(() => {
          if (projectSlug) document.getElementById(projectSlug)?.scrollIntoView({ block: 'start', behavior: 'instant' });
          else window.scrollTo({ top: 0, behavior: 'instant' });
          settle();
        });
      }),
    );
  }

  close(): void {
    const y = this.homeScroll;
    this.homeScroll = 0;
    leaveThen(() =>
      this.router.navigate([], { queryParams: {} }).then(() => {
        this.active.set(null);
        afterPaint(() => {
          window.scrollTo({ top: y, behavior: 'instant' });
          settle();
        });
      }),
    );
  }

  /** Scroll to a home section, closing the work view first if needed. */
  goToSection(fragment: string): void {
    if (!this.inWork) {
      document.getElementById(fragment)?.scrollIntoView({ block: 'start' });
      history.replaceState(history.state, '', `#${fragment}`);
      return;
    }
    this.homeScroll = 0;
    leaveThen(() =>
      this.router.navigate([], { queryParams: {}, fragment }).then(() => {
        this.active.set(null);
        afterPaint(() => {
          document.getElementById(fragment)?.scrollIntoView({ block: 'start', behavior: 'instant' });
          settle();
        });
      }),
    );
  }
}

const LEAVE_MS = 260;

/** Fade the current view out (see `view-leave` in styles.scss), then swap. */
function leaveThen(swap: () => void): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    swap();
    return;
  }
  document.documentElement.classList.add('is-leaving');
  window.setTimeout(swap, LEAVE_MS);
}

function settle(): void {
  document.documentElement.classList.remove('is-leaving');
}

/** Runs after the next rendered frame, once the swapped view is in the DOM. */
function afterPaint(fn: () => void): void {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}
