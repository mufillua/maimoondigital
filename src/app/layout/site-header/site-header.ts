import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { BrandMarkComponent } from '../../components/brand-mark/brand-mark';
import { NavItem, SITE } from '../../core/site.config';
import { WorkStateService } from '../../core/work-state.service';

/**
 * Minimal header, as on the reference: wordmark on the left of the reading
 * column, one quiet pill on the right. The pill carries the four nav items
 * on larger screens and becomes a small disclosure menu on phones.
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
