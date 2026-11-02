import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A small sky tile: the sun rises and sets, then the moon rises and sets,
 * on a loop. Both ride the same arc around a point just under the hills,
 * and the sky, hills and stars change colour with them. Used inside the
 * inline object after "any time of day."; it starts once the scroll reveal
 * turns that object on (`.is-on`). Sized by its parent.
 */
@Component({
  selector: 'app-day-night',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg class="sky" viewBox="0 0 48 36" focusable="false">
      <defs>
        <radialGradient id="mdSunGlow">
          <stop offset="0.45" stop-color="#fff2b0" stop-opacity="0.9" />
          <stop offset="1" stop-color="#fff2b0" stop-opacity="0" />
        </radialGradient>
        <clipPath id="mdSkyClip"><rect width="48" height="36" rx="9" /></clipPath>
        <mask id="mdMoonCut" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="36">
          <rect width="48" height="36" fill="#fff" />
          <circle cx="26.3" cy="9.2" r="3.5" fill="#000" />
        </mask>
      </defs>
      <g clip-path="url(#mdSkyClip)">
        <rect class="sky__bg" width="48" height="36" />
        <g class="stars" fill="#fff">
          <circle class="star" cx="9" cy="8" r="0.8" />
          <circle class="star" cx="38" cy="6.5" r="0.7" />
          <circle class="star" cx="33" cy="15" r="0.6" />
          <circle class="star" cx="14" cy="16" r="0.6" />
          <circle class="star" cx="21" cy="5" r="0.5" />
        </g>
        <g class="arm arm--sun">
          <circle class="sun-glow" cx="24" cy="11" r="8.5" fill="url(#mdSunGlow)" />
          <circle cx="24" cy="11" r="4.6" fill="#f5b81f" />
        </g>
        <g class="arm arm--moon">
          <circle cx="24" cy="11" r="4.2" fill="#fff3c4" mask="url(#mdMoonCut)" />
        </g>
        <path class="hill hill--back" d="M0 27C8 22.5 16 22.5 24 26S40 23 48 25V36H0Z" />
        <path class="hill hill--front" d="M0 30C10 26.5 19 27 28 30S42 28 48 29V36H0Z" />
      </g>
      <rect x="0.6" y="0.6" width="46.8" height="34.8" rx="8.4" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="1.2" />
    </svg>
  `,
  styles: `
    :host { display: block; width: 100%; height: 100%; }

    .sky {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      filter: drop-shadow(0 0.1em 0.18em rgba(18, 48, 94, 0.25));
      --cycle: 10s;
      /* Start in the morning, with the sun part way up. */
      --start: -1.3s;
    }

    .sky__bg { fill: #9fd3ff; }
    .hill--back { fill: #6fa3ff; }
    .hill--front { fill: #1f4fd1; }
    .stars { opacity: 0; }

    .arm {
      transform-box: view-box;
      transform-origin: 24px 30px;
    }

    .arm--sun { transform: rotate(-50deg); }
    .arm--moon { transform: rotate(-108deg); }

    .sun-glow {
      opacity: 0.8;
      transform-box: fill-box;
      transform-origin: center;
    }

    :host-context(.is-on) {
      .sky__bg { animation: sky-bg var(--cycle) linear var(--start) infinite; }
      .hill--back { animation: hill-back var(--cycle) linear var(--start) infinite; }
      .hill--front { animation: hill-front var(--cycle) linear var(--start) infinite; }
      .stars { animation: stars var(--cycle) linear var(--start) infinite; }
      .arm--sun { animation: sun var(--cycle) linear var(--start) infinite; }
      .arm--moon { animation: moon var(--cycle) linear var(--start) infinite; }
      .sun-glow { animation: glow 2.2s var(--ease-in-out) infinite; }
      .star { animation: twinkle 1.8s var(--ease-in-out) infinite; }
      .star:nth-child(2) { animation-delay: -0.6s; }
      .star:nth-child(3) { animation-delay: -1.2s; }
      .star:nth-child(4) { animation-delay: -0.3s; }
      .star:nth-child(5) { animation-delay: -0.9s; }
    }

    /* First half: the sun crosses, then waits out of sight under the hills. */
    @keyframes sun {
      0% { transform: rotate(-108deg); }
      50% { transform: rotate(108deg); animation-timing-function: steps(1, end); }
      100% { transform: rotate(-108deg); }
    }

    /* Second half: the moon crosses. */
    @keyframes moon {
      0% { transform: rotate(-108deg); animation-timing-function: steps(1, end); }
      50% { transform: rotate(-108deg); }
      100% { transform: rotate(108deg); }
    }

    /* Short hops between warm and cool colours, so the sky never passes
       through grey on its way from blue to orange and back. */
    @keyframes sky-bg {
      0% { fill: #ffb48a; }
      4% { fill: #ffcf9a; }
      8% { fill: #ffe6b8; }
      12% { fill: #b8e1ff; }
      16%, 36% { fill: #8fcfff; }
      40% { fill: #a6d8ff; }
      43% { fill: #ffe4a6; }
      47% { fill: #ffb070; }
      50% { fill: #f07c62; }
      54% { fill: #7a5a9e; }
      58% { fill: #2c3570; }
      62%, 88% { fill: #1d2a5a; }
      93% { fill: #33397a; }
      97% { fill: #8a6aa0; }
      100% { fill: #ffb48a; }
    }

    @keyframes hill-back {
      0%, 100% { fill: #9a8fd0; }
      12%, 42% { fill: #6fa3ff; }
      50% { fill: #6c7cd6; }
      60%, 90% { fill: #233668; }
    }

    @keyframes hill-front {
      0%, 100% { fill: #3a4a9a; }
      12%, 42% { fill: #1f4fd1; }
      50% { fill: #24419f; }
      60%, 90% { fill: #0e1c44; }
    }

    @keyframes stars {
      0%, 53% { opacity: 0; }
      60%, 90% { opacity: 1; }
      97%, 100% { opacity: 0; }
    }

    @keyframes glow {
      0%, 100% { opacity: 0.65; transform: scale(0.92); }
      50% { opacity: 1; transform: scale(1.08); }
    }

    @keyframes twinkle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }

    /* Reduced motion: a still morning sky. */
    @media (prefers-reduced-motion: reduce) {
      :host-context(.is-on) .sky * { animation: none !important; }
    }
  `,
})
export class DayNightComponent {}
