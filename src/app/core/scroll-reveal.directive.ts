import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Item {
  el: HTMLElement;
  key: number;
  lead: boolean;
  on: boolean;
}

/** Where the reveal line sits, as a fraction of the viewport height. */
const LINE = 0.5;

/** How many extra lines are revealed ahead of that point while scrolling. */
const LEAD_LINES = 1.8;

/** Long enough for the opening word-by-word entrance to finish. */
const ENTRANCE_MS = 2000;

function translateY(el: HTMLElement): number {
  const t = getComputedStyle(el).transform;
  return t && t !== 'none' ? new DOMMatrixReadOnly(t).m42 : 0;
}

/**
 * Word-by-word, scroll-scrubbed reveal. Every descendant marked with
 * `data-w` is grey until its reading position passes a line ~50% down the
 * viewport, then it turns solid. Positions are measured once (and again on
 * resize), so the scroll handler does no layout reads — it only compares
 * numbers and flips classes on the items that changed.
 *
 * The reading position folds the word's horizontal offset into its line, so
 * a line fills in left to right rather than all at once.
 */
@Directive({ selector: '[appScrollReveal]' })
export class ScrollRevealDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private items: Item[] = [];
  private frame = 0;
  /** Reading position of the end of the opening (lead) sentence. */
  private leadEnd = 0;
  /** One line of the running text, in px (the reveal runs this far ahead). */
  private lineHeight = 48;

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (reduce.matches) {
        this.host.querySelectorAll<HTMLElement>('[data-w]').forEach((el) => el.classList.add('is-on'));
        return;
      }

      this.zone.runOutsideAngular(() => {
        const schedule = () => {
          if (!this.frame) this.frame = requestAnimationFrame(() => this.update());
        };
        const remeasure = () => {
          this.measure();
          schedule();
        };

        this.measure();
        this.update();
        // Fonts change word widths; measure again once they settle, and once
        // the page's entrance animation has finished moving things.
        document.fonts?.ready.then(remeasure);
        const settled = window.setTimeout(remeasure, ENTRANCE_MS);

        const ro = new ResizeObserver(remeasure);
        ro.observe(this.host);
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });

        destroyRef.onDestroy(() => {
          ro.disconnect();
          clearTimeout(settled);
          window.removeEventListener('scroll', schedule);
          window.removeEventListener('resize', schedule);
          cancelAnimationFrame(this.frame);
        });
      });
    });
  }

  private measure(): void {
    const hostRect = this.host.getBoundingClientRect();
    const width = Math.max(hostRect.width, 1);
    const lineHeight = parseFloat(getComputedStyle(this.host).lineHeight) || 48;
    this.lineHeight = lineHeight;
    const scrollY = window.scrollY;
    const previous = new Map(this.items.map((i) => [i.el, i.on]));

    let leadEnd = 0;
    this.items = Array.from(this.host.querySelectorAll<HTMLElement>('[data-w]')).map((el) => {
      const rect = el.getBoundingClientRect();
      const across = Math.min(Math.max((rect.left - hostRect.left) / width, 0), 1);
      const lead = el.hasAttribute('data-lead');
      const key = rect.top + scrollY + across * lineHeight;
      // The opening words rise in with a translateY; measure where they will
      // rest, not where the animation has them right now.
      if (lead && el.classList.contains('w')) {
        leadEnd = Math.max(leadEnd, key - translateY(el));
      }
      return {
        el,
        key: lead ? -Infinity : key,
        lead,
        on: previous.get(el) ?? el.classList.contains('is-on'),
      };
    });
    this.leadEnd = leadEnd;
  }

  private update(): void {
    this.frame = 0;
    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - vh;

    // The reading line starts just after the opening sentence (so only it
    // is solid on load), runs ahead of the scroll until it reaches the
    // middle of the viewport, then stays there. Near the end of the page it
    // is pushed down so the closing paragraph can fully reveal.
    // LEAD_LINES extra lines are revealed ahead of the middle while scrolling.
    let line = Math.min(this.leadEnd + scrollY * 1.6, scrollY + vh * LINE + this.lineHeight * LEAD_LINES);
    const tail = vh * 0.5;
    if (maxScroll > 0 && scrollY > maxScroll - tail) {
      const t = (scrollY - (maxScroll - tail)) / tail;
      line = Math.max(line, scrollY + vh * (LINE + (1 - LINE) * t));
    }

    for (const item of this.items) {
      const on = item.key <= line;
      if (on !== item.on) {
        item.on = on;
        item.el.classList.toggle('is-on', on);
      }
    }
  }
}
