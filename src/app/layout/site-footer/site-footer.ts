import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BrandMarkComponent } from '../../components/brand-mark/brand-mark';
import { NavItem, SITE } from '../../core/site.config';
import { WorkStateService } from '../../core/work-state.service';

/** Small grey sentence-style footer, as on the reference. */
@Component({
  selector: 'app-site-footer',
  imports: [BrandMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooterComponent {
  private readonly work = inject(WorkStateService);

  readonly site = SITE;
  readonly contact = SITE.contact;
  readonly nav = SITE.nav;
  readonly year = new Date().getFullYear();

  go(event: Event, item: NavItem): void {
    event.preventDefault();
    if (item.opensWork) this.work.open();
    else if (item.fragment) this.work.goToSection(item.fragment);
  }

  toTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0 });
  }
}
