import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Project } from '../../core/site.config';

/**
 * A client's real logo presented as a small app-icon tile, sized in `em`
 * so it scales with the text around it.
 */
@Component({
  selector: 'app-client-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-full]': 'project().logoStyle === "full"',
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : project().name + " logo"',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
  },
  template: `<img [src]="'/' + project().logo" alt="" width="128" height="128" decoding="async" draggable="false" />`,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      width: 1em;
      height: 1em;
      flex: none;
      overflow: hidden;
      border-radius: 23%;
      background: #fff;
      box-shadow:
        0 0 0 0.02em rgba(0, 0, 0, 0.08),
        0 0.06em 0.16em rgba(0, 0, 0, 0.12);
    }
    img {
      width: 84%;
      height: 84%;
      object-fit: contain;
      user-select: none;
    }
    :host(.is-full) { background: none; }
    :host(.is-full) img { width: 100%; height: 100%; }
  `,
})
export class ClientLogoComponent {
  readonly project = input.required<Project>();
  /** Hide from assistive tech when the name is already next to it. */
  readonly decorative = input(true);
}
