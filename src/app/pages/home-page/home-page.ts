import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { FloatingPillComponent } from '../../layout/floating-pill/floating-pill';
import { SiteFooterComponent } from '../../layout/site-footer/site-footer';
import { SiteHeaderComponent } from '../../layout/site-header/site-header';
import { HomeStackComponent } from '../../sections/home-stack/home-stack';
import { WorkViewComponent } from '../../sections/work-view/work-view';

/**
 * The whole site is one page with two views, as on the reference:
 * the editorial home stack, and the work view at `?work=open`.
 */
@Component({
  selector: 'app-home-page',
  imports: [SiteHeaderComponent, HomeStackComponent, SiteFooterComponent, WorkViewComponent, FloatingPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePageComponent {
  readonly isWork = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((q) => q.get('work') === 'open')),
    { initialValue: false },
  );
}
