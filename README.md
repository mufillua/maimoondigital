# Maimoon Digital

Studio website for Maimoon Digital, founded by Mufaddal Maimoon. Built with
Angular 21 (standalone components, signals, zoneless), modelled on the layout,
type and motion of reboot.studio.

## Run it

```bash
npm install
npm start            # http://localhost:4200
npm run build        # production build → dist/maimoon-digital/browser
npm test             # unit tests (Vitest)
```

Needs Node.js 20.19+ or 22.12+. The `.npmrc` sets `legacy-peer-deps=true`
because some npm 10 releases crash while resolving the Angular test tooling's
optional peer dependencies. Delete it if your npm installs cleanly without it.

The build output is plain static files. Deploy `dist/maimoon-digital/browser`
to any static host (Vercel, Netlify, Firebase, Hostinger). No server is needed,
and no rewrites are needed either, because the site is a single page: the work
view is `/?work=open`.

## How the page works

The site is one page with two views, like the reference:

| View | URL | What it is |
| --- | --- | --- |
| Home | `/` | One narrow column of large text. Words turn from grey to black as you scroll. Small icons sit inside the sentences. A dark "Explore our work" pill is fixed at the bottom. |
| Work | `/?work=open` | Project details stay fixed on the left (desktop). Project images run down a centred column. The bottom pill names whatever is on screen, and its × closes the view. |

The navigation links (Work, Services, About, Contact) are in the header pill.
On phones they move into a small menu. They are repeated in the footer.

## Where things live

```
src/app/
  core/
    site.config.ts          studio name, contact links, navigation, the four projects
    home-content.ts         the home view's text, paragraph by paragraph
    scroll-reveal.directive.ts   the grey-to-black scroll reveal
    work-state.service.ts   opening/closing the work view, section scrolling
  layout/                   header, footer, floating pill
  components/               brand mark, inline icons, media panel
  sections/                 home-stack (home text), work-view
  pages/home-page/          switches between the two views
```

Client logos live in `public/work/<project-slug>/logo.webp` and are set per
project in `site.config.ts` (`logo`, plus `logoStyle: 'tile'` for logos on a
white tile or `'full'` for one that is already a tile, like Burhani's). Social
links are under `SITE.social`. The founder's name links to LinkedIn, and
Instagram is in the footer.

To change wording, edit `home-content.ts`. To change contact details or
projects, edit `site.config.ts`. No component needs to change.

## Adding your project screenshots

The four client sites could not be screenshotted from the build environment.
Each image slot therefore shows a preview card built only from that site's
real details: its domain, its own tagline and its real product categories.
To replace a card with a real screenshot:

1. Save the image into `public/work/<project-slug>/`:

   | Slot | File name | Capture at |
   | --- | --- | --- |
   | Homepage | `home.webp` | 1440 × 900 browser window, top of the page |
   | Catalogue / products page | `catalogue.webp` | 1440 × 900 |
   | Mobile | `mobile.webp` | 390 × 844 (iPhone size), top of the page |

   The slugs are `western-hardware-mart`, `steel-tools-india`,
   `bh-rubber-products` and `burhani-seal-centre`. WebP, or JPG at about 80%
   quality, under ~250 KB each.

2. In `src/app/core/site.config.ts`, add `src` to that slot, for example:

   ```ts
   { kind: 'desktop', label: 'Western Hardware Mart site', src: 'work/western-hardware-mart/home.webp', alt: 'Western Hardware Mart homepage' },
   ```

The image fades in over the card. If a file is missing, the card stays.

## Motion

| Where | What happens |
| --- | --- |
| Opening sentence | Words rise in one by one on load; the app icon pops in after them. |
| All home text | Grey words turn black left to right, running one line ahead of the middle of the screen (`LEAD_LINES` in `scroll-reveal.directive.ts`). |
| Inline icons and client logos | Pop in with a small overshoot when reached. Logos tilt on hover. Three sparkles after "stand out." twinkle in turn; a globe turns with a pin landing on it after "presence online."; a tile flips between a pen nib and </> after "design and develop"; a laptop opens and builds a page after "every screen,"; two puzzle pieces (design and code) click together after "responsive development," |
| "Maimoon Digital" (2nd line) | The studio name inks in from left to right in brand navy and blue, then a soft shine crosses it every few seconds. |
| "That's where we step in." | A text-selection highlight (the browser's own #dbe7ff) sweeps across the sentence and on into the next line, as if dragged with the mouse. |
| Services | "Angular development" types itself out with a caret; "Product catalogues" writes in; "Responsive builds" stretches; "Redesigns" gets a marker sweep; "Deployment & domains" gets a selection box, cursor and its real size badge. |
| Showcase card (phones/tablets) | Cycles the four client logos with progress bars; pauses on touch/hover and when off screen. |
| Home ↔ work | The current view blurs away before the next one rises in. |
| Bottom pill | Its label and icon roll to name whatever is on screen in the work view. |
| Work view opening | A showreel panel with all four client logos rises in one by one, each drifting gently on a faint dot grid; clicking one glides down to that project. |
| Work panels | Blur and fade in as they arrive; the project panel on the left swaps with its logo landing. |

## Background wallpaper

The page has a faint doodle wallpaper, like a chat app's, made of about 90
original web-design line icons (cursors, browser windows, `</>`, pen tools,
phones, gears, rockets, toggles and more). It is fixed behind the page, so it
stays put while the text scrolls.

**It moves.** `src/app/components/doodle-wall` draws the wallpaper on a canvas
so that:

- about a third of the doodles play a small loop that suits them: the gear and
  sun turn, the loading spinner ticks, the bell and price tag swing, the heart
  beats, the bulb glows, stars twinkle, the rocket hovers, the paper plane flies
  off and comes back, the map pin and download arrow bounce, the cursor, hand,
  thumbs-up and button tap, the toggle switches on and off, the wifi bars fill
  up, the eye blinks and a few tools wiggle;
- on computers with a mouse, doodles near the pointer drift away from it, tilt
  and darken, then ease back. A click makes them hop further.

Doodles at rest are kept in a cached layer and only the moving ones are redrawn,
at 30 frames a second when the mouse is still. The animation stops when the tab
is hidden. Visitors whose device asks for reduced motion see the still image.

Files:

| File | What it is |
| --- | --- |
| `public/bg/doodles.svg` | The still wallpaper: shown first while the page loads, and for reduced motion. |
| `public/bg/doodles.json` | The same layout as data, used by the animated version. |
| `tools/make_doodles.py` | Makes both files. Run `python3 tools/make_doodles.py public/bg/doodles.svg 640 11 "#12305e"`. |

Which doodles move, and how, is the `ANIMS` list at the top of `doodle-wall.ts`.
The reach of the mouse effect is `REACH`.

Tune the look in `src/styles.scss`:

| Setting | Default | What it does |
| --- | --- | --- |
| `--doodle-opacity` | `0.085` (phones `0.055`) | How strong the doodles are. Try `0.05` for subtler, `0.12` for bolder. |
| `--doodle-size` | `640px` (phones `460px`) | Tile size. Smaller means smaller, denser doodles. |

On desktop the doodles are softer behind the text column and full strength in
the side margins, so the grey, not-yet-revealed words stay easy to read.
To remove the wallpaper, delete `<app-doodle-wall />` from `src/app/app.ts` and
the `body::before` rule.

## Cursor

The mouse pointer is a black arrow with a white edge (`public/cursor.svg`),
and a slightly bigger one over links and buttons (`public/cursor-link.svg`).
If an image can't load, the browser's normal cursor is used. The rules are
under "Custom cursor" in `src/styles.scss`.

## Accessibility and motion

- With `prefers-reduced-motion`, all text shows solid black, the icons stop
  moving and the work panels appear without the blur.
- The page has a skip link and one `h1` per view. Section headings are hidden
  visually but available to screen readers. In the work view, project details
  are always in the page for screen readers, even when the desktop panel shows
  them visually.
- The grey "not yet revealed" text is part of the design, so it has low
  contrast until it turns black. It reaches full contrast as the reader
  scrolls to it.
