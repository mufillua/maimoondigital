import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InlineObject } from '../../core/home-content';

/**
 * Small illustrated objects that sit inside the running text, as on the
 * reference (app icon, team avatars, toggle, emoji). All are drawn with
 * CSS/SVG — no third-party artwork. They stay muted until the scroll reveal
 * reaches them (the directive adds `.is-on` to the host).
 */
@Component({
  selector: 'app-inline-object',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-w': '',
    '[class]': '"obj obj--" + kind()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() ?? null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  template: `
    @switch (kind()) {
      @case ('appIcon') {
        <svg class="app-icon" viewBox="0 0 64 64" focusable="false">
          <defs>
            <linearGradient id="mdIconFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#3b82ff" />
              <stop offset="0.55" stop-color="#1f4fd1" />
              <stop offset="1" stop-color="#12305e" />
            </linearGradient>
            <linearGradient id="mdIconGloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#fff" stop-opacity="0.45" />
              <stop offset="0.5" stop-color="#fff" stop-opacity="0" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#mdIconFill)" />
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#mdIconGloss)" />
          <path d="M19 43V22.5L32 35.5L45 22.5V43" fill="none" stroke="#fff" stroke-width="6.5"
                stroke-linecap="round" stroke-linejoin="round" />
          <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="15.25" fill="none"
                stroke="#fff" stroke-opacity="0.18" stroke-width="1.5" />
        </svg>
      }
      @case ('monogram') {
        <span class="monogram"><span>MM</span>
          <span class="in-badge"><svg viewBox="0 0 16 16" focusable="false"><path fill="#fff"
            d="M3.6 6h2v6.5h-2zM4.6 3a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3zM7 6h1.9v.9h.03c.27-.5.92-1.04 1.9-1.04 2.03 0 2.4 1.33 2.4 3.07v3.57h-2V9.33c0-.75-.01-1.72-1.05-1.72-1.05 0-1.21.82-1.21 1.66v3.23H7z"/></svg></span>
        </span>
      }
      @case ('toggle') {
        <span class="toggle"><span class="knob"></span></span>
      }
      @case ('devices') {
        <svg class="phone" viewBox="0 0 40 40" focusable="false">
          <rect x="12" y="4" width="16" height="32" rx="4.5" fill="#fff" stroke="currentColor" stroke-width="2.4" />
          <rect x="17" y="7.5" width="6" height="2" rx="1" fill="currentColor" />
          <rect x="15.5" y="13" width="9" height="2.2" rx="1.1" fill="#2a6df4" />
          <rect x="15.5" y="17.5" width="7" height="2.2" rx="1.1" fill="#c8d3e6" />
          <rect x="15.5" y="22" width="9" height="7" rx="1.6" fill="#e6ecf7" />
        </svg>
      }
      @case ('sparkle') {
        <svg class="sparkle" viewBox="0 0 48 40" focusable="false">
          <path class="s s1" d="M17 4c1.4 7.6 4.4 10.6 12 12-7.6 1.4-10.6 4.4-12 12-1.4-7.6-4.4-10.6-12-12 7.6-1.4 10.6-4.4 12-12z" fill="#2a6df4" />
          <path class="s s2" d="M37 2c.8 4.4 2.6 6.2 7 7-4.4.8-6.2 2.6-7 7-.8-4.4-2.6-6.2-7-7 4.4-.8 6.2-2.6 7-7z" fill="#f5b81f" />
          <path class="s s3" d="M34 25c.6 3.3 1.9 4.6 5.2 5.2-3.3.6-4.6 1.9-5.2 5.2-.6-3.3-1.9-4.6-5.2-5.2 3.3-.6 4.6-1.9 5.2-5.2z" fill="#12305e" />
        </svg>
      }
      @case ('globe') {
        <svg class="globe" viewBox="0 0 48 48" focusable="false">
          <defs>
            <clipPath id="mdGlobeClip"><circle cx="24" cy="27" r="15" /></clipPath>
          </defs>
          <circle cx="24" cy="27" r="15" fill="#eaf1ff" />
          <g clip-path="url(#mdGlobeClip)" fill="none" stroke="#2a6df4" stroke-width="1.6">
            <path d="M9 27h30M11 20h26M11 34h26" opacity=".55" />
            <ellipse class="meridian m1" cx="24" cy="27" rx="15" ry="15" />
            <ellipse class="meridian m2" cx="24" cy="27" rx="15" ry="15" />
            <ellipse class="meridian m3" cx="24" cy="27" rx="15" ry="15" />
          </g>
          <circle cx="24" cy="27" r="15" fill="none" stroke="#12305e" stroke-width="2.2" />
          <g class="pin">
            <path d="M24 3.5c-3.9 0-7 3-7 6.8 0 4.9 7 11.2 7 11.2s7-6.3 7-11.2c0-3.8-3.1-6.8-7-6.8z" fill="#12305e" />
            <circle cx="24" cy="10.3" r="2.6" fill="#fff" />
          </g>
        </svg>
      }
      @case ('designDev') {
        <span class="flip">
          <span class="flip__face flip__face--design">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 2.5 18.5 9l-2.2 8.2L12 19.6l-4.3-2.4L5.5 9z" fill="#f5b81f" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" />
              <path d="M12 2.5v8.6" stroke="#12305e" stroke-width="1.4" stroke-linecap="round" />
              <circle cx="12" cy="12.4" r="1.6" fill="#12305e" />
              <path d="M8.6 21.3h6.8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          <span class="flip__face flip__face--dev">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M8.5 7 3.8 12l4.7 5M15.5 7l4.7 5-4.7 5" fill="none" stroke="#7fb0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13.4 5.5 10.6 18.5" stroke="#fff" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
        </span>
      }
      @case ('laptop') {
        <svg class="laptop" viewBox="0 0 64 44" focusable="false">
          <g class="lid">
            <rect x="9" y="3" width="46" height="31" rx="3" fill="#1b1f2a" />
            <rect x="11.5" y="5.5" width="41" height="26" rx="1.2" fill="#fff" />
            <g class="screen">
              <rect class="ui ui1" x="13.5" y="7.5" width="37" height="3" rx="1" fill="#12305e" />
              <rect class="ui ui2" x="13.5" y="12.5" width="22" height="3.2" rx="1" fill="#2a6df4" />
              <rect class="ui ui3" x="13.5" y="17.2" width="15" height="1.8" rx=".9" fill="#c9d6ee" />
              <rect class="ui ui4" x="13.5" y="22" width="11" height="7.5" rx="1" fill="#e6edf9" />
              <rect class="ui ui5" x="26.5" y="22" width="11" height="7.5" rx="1" fill="#e6edf9" />
              <rect class="ui ui6" x="39.5" y="22" width="11" height="7.5" rx="1" fill="#e6edf9" />
              <rect class="ui ui7" x="39.5" y="12.5" width="11" height="6.5" rx="1" fill="#f5b81f" />
            </g>
          </g>
          <path d="M3 35.5h58l-2.6 4.2a3 3 0 0 1-2.6 1.5H8.2a3 3 0 0 1-2.6-1.5z" fill="#c8ccd4" />
          <path d="M3 35.5h58" stroke="#9aa1ad" stroke-width="1.2" />
          <rect x="27" y="35.6" width="10" height="1.6" rx=".8" fill="#9aa1ad" />
        </svg>
      }
      @case ('puzzle') {
        <svg class="puzzle" viewBox="0 0 48 32" focusable="false">
          <circle class="snap" cx="22" cy="16" r="7" fill="none" stroke="#2a6df4" stroke-width="1.6" />
          <path class="pc pc--design" d="M6 8a2 2 0 0 1 2-2h14v6.2a4 4 0 1 1 0 7.6V26H8a2 2 0 0 1-2-2z"
                fill="#f5b81f" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" />
          <path class="pc pc--dev" d="M22 6h18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H22v-6.2a4 4 0 1 0 0-7.6z"
                fill="#2a6df4" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" />
          <path class="pc pc--dev glyph" d="M32 12.6 29.8 16l2.2 3.4M36.8 12.6 39 16l-2.2 3.4M35.3 12.1 33.5 19.9" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <circle class="pc pc--design glyph" cx="13" cy="16" r="3" fill="none" stroke="#12305e" stroke-width="1.5" />
        </svg>
      }
      @case ('wave') {
        <span class="wave">👋</span>
      }
    }
  `,
  styleUrl: './inline-object.scss',
})
export class InlineObjectComponent {
  readonly kind = input.required<InlineObject>();
  readonly label = input<string>();
}
