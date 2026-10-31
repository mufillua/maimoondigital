import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
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
  private readonly route = inject(ActivatedRoute);
  private readonly wantsWork = toSignal(this.route.queryParamMap.pipe(map((q) => q.get('work') === 'open')), {
    initialValue: false,
  });

  /**
   * The prerendered HTML always contains the home view. When the browser
   * takes over that HTML (hydration) it must start from the same view, so a
   * direct visit to `?work=open` switches to the work view one frame later.
   */
  private readonly hydrating = !!inject(DOCUMENT).querySelector('[ng-server-context]');
  private readonly ready = signal(!this.hydrating);

  readonly isWork = computed(() => this.ready() && this.wantsWork());

  constructor() {
    if (!this.hydrating) return;
    afterNextRender(() => {
      this.ready.set(true);
      const fragment = this.route.snapshot.fragment;
      if (this.wantsWork() && fragment) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => document.getElementById(fragment)?.scrollIntoView({ block: 'start' })),
        );
      }
    });
  }
}
