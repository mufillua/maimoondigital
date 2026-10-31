import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A small chat bubble with three "typing" dots, used to mark client sites
 * that have an on-site chatbot. Takes the text colour; the dots use
 * `--chat-dot` (white by default). Sized in `em`.
 */
@Component({
  selector: 'app-chat-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 16 16" focusable="false">
      <path
        d="M4.5 2.5h7a2.75 2.75 0 0 1 2.75 2.75v3.5a2.75 2.75 0 0 1-2.75 2.75H7.6l-2.8 2.4a.4.4 0 0 1-.65-.3V11.5h.1A2.75 2.75 0 0 1 1.75 8.75v-3.5A2.75 2.75 0 0 1 4.5 2.5z"
        fill="currentColor"
      />
      <circle class="d" cx="5.4" cy="7" r=".95" />
      <circle class="d" cx="8" cy="7" r=".95" />
      <circle class="d" cx="10.6" cy="7" r=".95" />
    </svg>
  `,
  styles: `
    :host { display: inline-block; width: 1em; height: 1em; flex: none; line-height: 0; }
    svg { width: 100%; height: 100%; overflow: visible; }
    .d { fill: var(--chat-dot, #fff); animation: typing 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .d:nth-of-type(2) { animation-delay: 0.15s; }
    .d:nth-of-type(3) { animation-delay: 0.3s; }
    @keyframes typing {
      0%, 30%, 100% { transform: none; opacity: 1; }
      12% { transform: translateY(-0.9px); opacity: 0.55; }
    }
    @media (prefers-reduced-motion: reduce) {
      .d { animation: none; }
    }
  `,
})
export class ChatIconComponent {}
