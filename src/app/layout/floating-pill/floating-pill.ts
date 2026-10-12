import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { WorkStateService } from '../../core/work-state.service';

/**
 * The fixed dark pill at the bottom centre — the reference's main control.
 * On the home view it opens the work view; in the work view it names the
 * media currently on screen and closes the view.
 */
@Component({
  selector: 'app-floating-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './floating-pill.html',
  styleUrl: './floating-pill.scss',
})
export class FloatingPillComponent {
  private readonly work = inject(WorkStateService);

  readonly mode = input.required<'home' | 'work'>();
  readonly active = this.work.active;
  readonly label = computed(() => this.active()?.label ?? 'Selected work');
  readonly kind = computed(() => this.active()?.kind ?? 'desktop');

  open(event: Event): void {
    event.preventDefault();
    this.work.open();
  }

  close(): void {
    this.work.close();
  }
}
