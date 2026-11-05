import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The Maimoon Digital mark: a dark rounded tile with a single-stroke "M".
 * The M is three strokes (left leg, the V, right leg) so it can draw itself.
 *
 * - `intro`: on first paint the tile pops in and the M draws stroke by stroke.
 * - Inside the header link (`.brand`) or the pinned logo (`.brand-pin`), hovering
 *   tilts the tile forward and the middle of the M dips and springs back.
 */
@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class.mark--intro]': 'intro()' },
  template: `
    <svg viewBox="0 0 32 32" focusable="false">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="currentColor" />
      <g fill="none" stroke="var(--mark-ink, #fff)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
        <path class="s s--l" pathLength="1" d="M9.5 21.5V11.25" />
        <g class="v"><path class="s s--v" pathLength="1" d="M9.5 11.25L16 17.75L22.5 11.25" /></g>
        <path class="s s--r" pathLength="1" d="M22.5 11.25V21.5" />
      </g>
    </svg>
  `,
  styles: `
    :host { display: inline-block; width: 1.25em; height: 1.25em; flex: none; position: relative; z-index: 1; }
    svg { display: block; width: 100%; height: 100%; overflow: visible; }

    /* On load: the tile pops in, then the M draws left leg, V, right leg. */
    :host(.mark--intro) svg { animation: mark-pop 560ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms both; }
    :host(.mark--intro) .s { stroke-dasharray: 1; animation: mark-draw 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    :host(.mark--intro) .s--l { animation-delay: 300ms; }
    :host(.mark--intro) .s--v { animation-delay: 400ms; animation-duration: 380ms; }
    :host(.mark--intro) .s--r { animation-delay: 620ms; }

    @keyframes mark-pop {
      from { opacity: 0; transform: scale(0.55) rotate(-14deg); }
      to { opacity: 1; transform: none; }
    }
    @keyframes mark-draw {
      from { stroke-dashoffset: 1; }
      to { stroke-dashoffset: 0; }
    }

    /* On hover: the tile nudges forward and the M's middle dips, then springs back.
       These rules must stay outside any @media block: Angular renames this
       component's @keyframes in production builds, but not the animation names
       used inside media queries, so a hover rule inside @media (hover: hover)
       would point at a name that no longer exists on the live site. */
    .v { transform-box: fill-box; transform-origin: 50% 0; }
    :host-context(.brand:hover), :host-context(.brand-pin:hover) { animation: mark-nudge 720ms cubic-bezier(0.34, 1.56, 0.64, 1); }
    :host-context(.brand:hover) .v, :host-context(.brand-pin:hover) .v { animation: mark-dip 720ms ease-out; }
    /* No hover on touch screens (a tap would leave it stuck in hover). */
    @media (hover: none) {
      :host-context(.brand:hover), :host-context(.brand-pin:hover),
      :host-context(.brand:hover) .v, :host-context(.brand-pin:hover) .v { animation: none; }
    }
    @keyframes mark-nudge {
      0% { transform: none; }
      32% { transform: translateX(2px) rotate(-12deg) scale(1.06); }
      62% { transform: rotate(4deg); }
      82% { transform: rotate(-1.5deg); }
      100% { transform: none; }
    }
    @keyframes mark-dip {
      0% { transform: none; }
      30% { transform: scaleY(1.45); }
      56% { transform: scaleY(0.84); }
      78% { transform: scaleY(1.08); }
      100% { transform: none; }
    }
  `,
})
export class BrandMarkComponent {
  /** Play the draw-in on first paint (used by the header logo only). */
  readonly intro = input(false);
}
