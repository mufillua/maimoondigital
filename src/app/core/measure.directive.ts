import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Writes its parent element's rendered size ("412 × 52") into the host, like
 * the dimension badge a design tool shows under a selected layer. The numbers
 * are the element's real size and update when it resizes.
 */
@Directive({ selector: '[appMeasure]' })
export class MeasureDirective {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const target = host.parentElement;
      if (!target) return;
      const write = () => {
        const r = target.getBoundingClientRect();
        host.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
      };
      const ro = new ResizeObserver(write);
      ro.observe(target);
      write();
      destroyRef.onDestroy(() => ro.disconnect());
    });
  }
}
