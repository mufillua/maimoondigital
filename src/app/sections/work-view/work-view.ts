import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ClientLogoComponent } from '../../components/client-logo/client-logo';
import { MediaPanelComponent } from '../../components/media-panel/media-panel';
import { PROJECTS, SITE } from '../../core/site.config';
import { WorkStateService } from '../../core/work-state.service';

/**
 * The reference's `?work=open` view: a fixed project rail on the left
 * (desktop), a centred column of media panels, and the floating pill naming
 * whatever is on screen. On tablet and phone the rail folds into a short
 * info block above each project so nothing is hidden.
 */
@Component({
  selector: 'app-work-view',
  imports: [MediaPanelComponent, ClientLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work-view.html',
  styleUrl: './work-view.scss',
})
export class WorkViewComponent {
  private readonly work = inject(WorkStateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly projects = PROJECTS;
  readonly contact = SITE.contact;
  readonly activeSlug = signal<string | null>(null);
  readonly activeProject = computed(() => this.projects.find((p) => p.slug === this.activeSlug()) ?? null);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const panels = Array.from(this.host.querySelectorAll<HTMLElement>('[data-showreel], [data-media]'));
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Blur/fade each panel in the first time it enters the viewport.
      const revealIo = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('is-in');
              revealIo.unobserve(e.target);
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      );

      // Track which panel crosses the middle band of the viewport.
      const visible = new Set<HTMLElement>();
      const activeIo = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const el = e.target as HTMLElement;
            if (e.isIntersecting) visible.add(el);
            else visible.delete(el);
          }
          const current = panels.find((el) => visible.has(el));
          if (current && 'showreel' in current.dataset) {
            this.activeSlug.set(null);
            this.work.active.set({ label: 'Showreel', kind: 'catalogue' });
          } else if (current) {
            const project = this.projects.find((p) => p.slug === current.dataset['project']);
            const slot = project?.media[Number(current.dataset['index'])];
            if (project && slot) {
              this.activeSlug.set(project.slug);
              this.work.active.set({ label: slot.label, kind: slot.kind });
            }
          } else if (panels[0] && panels[0].getBoundingClientRect().top > window.innerHeight * 0.5) {
            this.activeSlug.set(null);
            this.work.active.set(null);
          }
        },
        { rootMargin: '-40% 0px -40% 0px' },
      );

      for (const el of panels) {
        if (reduce) el.classList.add('is-in');
        else revealIo.observe(el);
        activeIo.observe(el);
      }

      destroyRef.onDestroy(() => {
        revealIo.disconnect();
        activeIo.disconnect();
        this.work.active.set(null);
      });
    });
  }

  /** From the showreel, glide down to a project's first media. */
  scrollToProject(event: Event, slug: string): void {
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(slug)?.scrollIntoView({ block: 'start', behavior: reduce ? 'instant' : 'smooth' });
    history.replaceState(history.state, '', `?work=open#${slug}`);
  }
}
