import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BrandMarkComponent } from '../../components/brand-mark/brand-mark';
import { NavItem, SITE } from '../../core/site.config';
import { WorkStateService } from '../../core/work-state.service';

/** Scroll distance after which the header has gone and the logo pins to the top. */
const PIN_AFTER = 120;

/**
 * Minimal header, as on the reference: wordmark on the left of the reading
 * column, one quiet pill on the right. The pill carries the four nav items
 * on larger screens and becomes a small disclosure menu on phones.
 *
 * The logo draws itself on load. Once the header scrolls away, the logo mark
 * (just the M) stays pinned at the top, whichever way the page is scrolled;
 * hovering it slides the name out.
 */
@Component({
  selector: 'app-site-header',
  imports: [BrandMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'menuOpen.set(false)', '(document:click)': 'onDocClick($event)' },
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeaderComponent {
  private readonly work = inject(WorkStateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly site = SITE;
  readonly nav = SITE.nav;
  readonly menuOpen = signal(false);
  readonly letters = Array.from(SITE.wordmark);
  readonly pinned = signal(false);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let frame = 0;
      const update = () => {
        frame = 0;
        this.pinned.set(window.scrollY > PIN_AFTER);
      };
      const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); });
    });
  }

  href(item: NavItem): string {
    return item.opensWork ? '?work=open' : `#${item.fragment}`;
  }

  go(event: Event, item: NavItem): void {
    event.preventDefault();
    this.menuOpen.set(false);
    if (item.opensWork) this.work.open();
    else if (item.fragment) this.work.goToSection(item.fragment);
  }

  toTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0 });
  }

  onDocClick(event: Event): void {
    if (this.menuOpen() && !this.host.contains(event.target as Node)) this.menuOpen.set(false);
  }
}
