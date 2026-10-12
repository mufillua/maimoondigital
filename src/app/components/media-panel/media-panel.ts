import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MediaSlot, Project } from '../../core/site.config';

/**
 * One media item of a project, sitting on a soft grey panel as in the
 * reference's work view. Shows the real screenshot when `slot.src` is set;
 * until then it shows a preview card composed only from the project's real
 * details (domain, wording and categories from the live site).
 */
@Component({
  selector: 'app-media-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"panel panel--" + slot().kind',
    '[style.--surface]': 'project().brand.surface',
    '[style.--surface-ink]': 'project().brand.ink',
    '[style.--accent]': 'project().brand.accent',
  },
  templateUrl: './media-panel.html',
  styleUrl: './media-panel.scss',
})
export class MediaPanelComponent {
  readonly project = input.required<Project>();
  readonly slot = input.required<MediaSlot>();

  /** Fades the screenshot in once decoded. */
  readonly loaded = signal(false);
  readonly failed = signal(false);
  readonly showImage = computed(() => !!this.slot().src && !this.failed());
  readonly src = computed(() => (this.slot().src ? `/${this.slot().src}` : ''));
}
