import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { PROJECTS } from '../../core/site.config';
import { WorkStateService } from '../../core/work-state.service';
import { ClientLogoComponent } from '../client-logo/client-logo';

/** How long each project stays on screen. */
const SCENE_MS = 2800;

/**
 * The small card that sits between the first two paragraphs on phones and
 * tablets — the reference shows a card there that cycles through short
 * animations. Here it cycles through the real client logos. It only runs
 * while on screen, pauses on hover/focus, and stays still for reduced motion.
 */
@Component({
  selector: 'app-showcase-reel',
  imports: [ClientLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-paused]': 'paused() || !visible()',
    '[style.--scene-ms]': '"' + SCENE_MS + 'ms"',
    '(mouseenter)': 'paused.set(true)',
    '(mouseleave)': 'paused.set(false)',
    '(focusin)': 'paused.set(true)',
    '(focusout)': 'paused.set(false)',
  },
  templateUrl: './showcase-reel.html',
  styleUrl: './showcase-reel.scss',
})
export class ShowcaseReelComponent {
  private readonly work = inject(WorkStateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly projects = PROJECTS;
  readonly index = signal(0);
  readonly paused = signal(false);
  readonly visible = signal(false);
  readonly still = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.still.set(true);
        return;
      }
      const io = new IntersectionObserver(([e]) => this.visible.set(e.isIntersecting), { threshold: 0.35 });
      io.observe(this.host);

      let elapsed = 0;
      let last = performance.now();
      const timer = window.setInterval(() => {
        const now = performance.now();
        const running = this.visible() && !this.paused() && document.visibilityState === 'visible';
        if (running) elapsed += now - last;
        last = now;
        if (elapsed >= SCENE_MS) {
          elapsed = 0;
          this.index.update((i) => (i + 1) % this.projects.length);
        }
      }, 100);

      destroyRef.onDestroy(() => {
        io.disconnect();
        clearInterval(timer);
      });
    });
  }

  go(i: number): void {
    this.index.set(i);
  }

  open(event: Event, slug: string): void {
    event.preventDefault();
    this.work.open(slug);
  }
}
