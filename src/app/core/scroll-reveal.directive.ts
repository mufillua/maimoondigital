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
        // Fonts change word widths; measure again once they settle.
        document.fonts?.ready.then(remeasure);

        const ro = new ResizeObserver(remeasure);
        ro.observe(this.host);
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });

        destroyRef.onDestroy(() => {
          ro.disconnect();
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
    const scrollY = window.scrollY;
    const previous = new Map(this.items.map((i) => [i.el, i.on]));

    this.items = Array.from(this.host.querySelectorAll<HTMLElement>('[data-w]')).map((el) => {
      const rect = el.getBoundingClientRect();
      const across = Math.min(Math.max((rect.left - hostRect.left) / width, 0), 1);
      const lead = el.hasAttribute('data-lead');
      return {
        el,
        key: rect.top + scrollY + across * lineHeight,
        lead,
        on: previous.get(el) ?? el.classList.contains('is-on'),
      };
    });
    const leads = this.items.filter((i) => i.lead);
    this.leadEnd = leads.length ? Math.max(...leads.map((i) => i.key)) : 0;
    for (const i of leads) i.key = -Infinity;
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
    let line = Math.min(this.leadEnd + scrollY * 1.6, scrollY + vh * LINE);
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
