import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

/**
 * Live doodle wallpaper.
 *
 * Draws the same doodles as `public/bg/doodles.svg` (layout in
 * `public/bg/doodles.json`, both made by the wallpaper generator) on a
 * canvas fixed behind the page, so they can move:
 *  - about a third of them play a small loop that suits what they are
 *    (the gear turns, the bell rings, the cursor taps, the toggle flips…);
 *  - on devices with a mouse, doodles near the pointer drift away from it,
 *    tilt and darken, then ease back. A click makes them hop further.
 *
 * Doodles that are at rest are kept in a cached layer; only the ones that
 * are moving right now are redrawn each frame, so it stays light.
 * The static SVG remains the first-paint fallback and what visitors who ask
 * for reduced motion see; once the canvas has drawn, it takes over.
 */

interface DoodleData {
  tile: number;
  ink: string;
  stroke: number;
  icons: Record<string, string>;
  fillers: string[];
  /** x, y, icon name, size, rotation (degrees) — in tile pixels. */
  items: [number, number, string, number, number][];
  /** x, y, filler index, rotation (degrees). */
  dots: [number, number, number, number][];
}

type Anim =
  | 'spin' | 'steps' | 'turn' | 'swing' | 'pulse' | 'glow' | 'twinkle' | 'bob' | 'lift'
  | 'fly' | 'drop' | 'tap' | 'toggle' | 'wifi' | 'wiggle' | 'blink' | 'zoom' | 'shimmer';

/** Which doodles move, and how. Everything else stays still. */
const ANIMS: Record<string, Anim> = {
  gear: 'spin', sun: 'spin', spinner: 'steps', refresh: 'turn',
  bell: 'swing', tag: 'swing',
  heart: 'pulse', bulb: 'glow',
  star: 'twinkle', spark: 'twinkle',
  cloud: 'bob', chat: 'bob', mail: 'bob', cube: 'bob',
  rocket: 'lift', send: 'fly', pin: 'drop', download: 'drop',
  cursor: 'tap', hand: 'tap', button: 'tap', thumb: 'tap', mouse: 'tap',
  toggle: 'toggle', wifi: 'wifi',
  bug: 'wiggle', wand: 'wiggle', pen: 'wiggle', bucket: 'wiggle', scissors: 'wiggle',
  eraser: 'wiggle', smile: 'wiggle',
  eye: 'blink', zoom: 'zoom',
};

interface Pose { x: number; y: number; r: number; sx: number; sy: number; a: number; on: boolean; frame?: string }

interface Inst {
  cx: number; cy: number;      // centre, CSS px
  size: number;                // icon size in tile px (fillers: 0)
  rot: number;                 // base rotation, radians
  sprite: string;              // sprite key
  anim?: Anim;
  ph: number;                  // phase 0..1
  cells: number[];             // cache cells this doodle overlaps
  free: boolean;               // drawn live this frame instead of from the cache
  // pointer reaction, eased towards a target every frame
  px: number; py: number; pr: number; ps: number; pb: number;
}

const ICON_BOX = 64;           // sprite covers the 48-unit icon plus room to rotate
const DOT_BOX = 16;
const REACH = 170;             // px around the pointer that doodles react to
const CELL = 160;              // cache cell size, px
const TAU = Math.PI * 2;

@Component({
  selector: 'app-doodle-wall',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<canvas #c></canvas>',
  styles: [':host canvas { display: block; width: 100%; height: 100%; }'],
  host: { 'aria-hidden': 'true' },
})
export class DoodleWall {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('c');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // The static wallpaper is already on screen, so start the animated one
      // only once the page has loaded and the browser is idle. This keeps it
      // from competing with the first paint and the first tap.
      const go = () =>
        'requestIdleCallback' in window
          ? requestIdleCallback(() => void this.start(), { timeout: 2500 })
          : setTimeout(() => void this.start(), 300);
      if (document.readyState === 'complete') go();
      else addEventListener('load', go, { once: true });
    });
  }

  private async start(): Promise<void> {
    let data: DoodleData;
    try {
      const res = await fetch('bg/doodles.json');
      if (!res.ok) return;
      data = (await res.json()) as DoodleData;
    } catch {
      return; // keep the static wallpaper
    }

    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    const cache = document.createElement('canvas');
    const cctx = cache.getContext('2d');
    if (!ctx || !cctx) return;

    const hasMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const root = document.documentElement;

    let W = 0, H = 0, dpr = 1, k = 1, alpha = 0.085;
    let sprites = new Map<string, CanvasImageSource>();
    let spriteKey = '';
    let insts: Inst[] = [];
    let moving: Inst[] = [];       // doodles with a loop of their own
    let cells: Inst[][] = [];
    let gridCols = 0, gridRows = 0;
    let free: Inst[] = [];
    const dirty = new Set<number>();
    let destroyed = false;

    // Seeded random so repeated tiles don't move in step.
    const rand = (n: number) => {
      const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    const rasterise = async (svgInner: string, box: number, scale: number, filler: boolean) => {
      const px = Math.ceil(box * scale);
      const half = box / 2;
      const view = filler ? `${-half} ${-half} ${box} ${box}` : `${-(box - 48) / 2} ${-(box - 48) / 2} ${box} ${box}`;
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="${view}">` +
        `<g fill="none" stroke="${data.ink}" stroke-width="${data.stroke}" stroke-linecap="round" stroke-linejoin="round">` +
        `${svgInner}</g></svg>`;
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await img.decode();
      const c = document.createElement('canvas');
      c.width = c.height = px;
      c.getContext('2d')!.drawImage(img, 0, 0, px, px);
      return c;
    };

    const buildSprites = async () => {
      // Icon units → device pixels, with headroom for the hover/pulse growth.
      const iconScale = (54 / 48) * 1.3 * k * dpr;
      const key = iconScale.toFixed(3);
      if (key === spriteKey) return;
      const next = new Map<string, CanvasImageSource>();
      await Promise.all([
        ...Object.entries(data.icons).map(async ([name, body]) =>
          next.set(name, await rasterise(body, ICON_BOX, iconScale, false))),
        ...data.fillers.map(async (body, i) =>
          next.set('dot' + i, await rasterise(body, DOT_BOX, 1.6 * k * dpr, true))),
      ]);
      sprites = next;
      spriteKey = key;
    };

    const readSize = () => {
      W = innerWidth;
      H = innerHeight;
      dpr = Math.min(devicePixelRatio || 1, 2);
      const cs = getComputedStyle(root);
      const tilePx = parseFloat(cs.getPropertyValue('--doodle-size')) || data.tile;
      k = tilePx / data.tile;
      alpha = parseFloat(cs.getPropertyValue('--doodle-opacity')) || 0.085;
      canvas.width = cache.width = Math.round(W * dpr);
      canvas.height = cache.height = Math.round(H * dpr);
    };

    const buildInstances = () => {
      const T = data.tile * k;
      const cols = Math.ceil(W / T), rows = Math.ceil(H / T);
      gridCols = Math.ceil(W / CELL);
      gridRows = Math.ceil(H / CELL);
      cells = Array.from({ length: gridCols * gridRows }, () => []);
      const out: Inst[] = [];
      let n = 0;
      const add = (d: Omit<Inst, 'cells' | 'free' | 'px' | 'py' | 'pr' | 'ps' | 'pb'>, m: number) => {
        if (d.cx < -m || d.cy < -m || d.cx > W + m || d.cy > H + m) return;
        const inst: Inst = { ...d, cells: [], free: false, px: 0, py: 0, pr: 0, ps: 0, pb: 0 };
        const c0 = Math.max(0, Math.floor((d.cx - m) / CELL)), c1 = Math.min(gridCols - 1, Math.floor((d.cx + m) / CELL));
        const r0 = Math.max(0, Math.floor((d.cy - m) / CELL)), r1 = Math.min(gridRows - 1, Math.floor((d.cy + m) / CELL));
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
          const ci = r * gridCols + c;
          inst.cells.push(ci);
          cells[ci].push(inst);
        }
        out.push(inst);
      };
      for (let j = -1; j <= rows; j++) {
        for (let i = -1; i <= cols; i++) {
          for (const [x, y, name, size, rot] of data.items) {
            n++;
            add({ cx: (x + i * data.tile) * k, cy: (y + j * data.tile) * k, size, rot: (rot * Math.PI) / 180,
              sprite: name, anim: ANIMS[name], ph: rand(n) }, (size * k * ICON_BOX) / 96 + 2);
          }
          for (const [x, y, f, rot] of data.dots) {
            n++;
            add({ cx: (x + i * data.tile) * k, cy: (y + j * data.tile) * k, size: 0, rot: (rot * Math.PI) / 180,
              sprite: 'dot' + f, anim: rand(n) < 0.15 ? 'shimmer' : undefined, ph: rand(n + 0.5) }, 10 * k + 2);
          }
        }
      }
      insts = out;
      moving = out.filter((d) => d.anim);
      free = [];
    };

    // --- Little loops, in tile pixels / radians. t is in seconds. -------
    // `on` is false while a doodle is resting between its moves, so it can
    // sit in the cache instead of being redrawn.
    const ease = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
    const bump = (u: number, at: number, w: number) => Math.exp(-((u - at) * (u - at)) / (2 * w * w));
    const pose = (anim: Anim, t: number, ph: number, size: number): Pose => {
      const p: Pose = { x: 0, y: 0, r: 0, sx: 1, sy: 1, a: 1, on: true };
      const cyc = (period: number) => ((t / period + ph) % 1) * period; // seconds into this cycle
      switch (anim) {
        case 'spin': p.r = TAU * (t / 16 + ph); break;
        case 'steps': p.r = Math.floor(t / 0.14 + ph * 8) * (Math.PI / 4); break;
        case 'turn': { const u = cyc(6); if (u < 1) p.r = TAU * ease(u); else p.on = false; break; }
        case 'swing': {
          const u = cyc(5);
          if (u < 1.8) {
            p.r = 0.38 * Math.sin(u * 13) * Math.exp(-u * 2.2);
            const h = size / 2; // swing from the top, like a bell on a hook
            p.x = -Math.sin(p.r) * h;
            p.y = Math.cos(p.r) * h - h;
          } else p.on = false;
          break;
        }
        case 'pulse': {
          const u = cyc(2.4) / 2.4;
          if (u < 0.4) { const b = bump(u, 0.1, 0.035) + 0.7 * bump(u, 0.24, 0.035); p.sx = p.sy = 1 + 0.17 * b; }
          else p.on = false;
          break;
        }
        case 'glow': {
          const u = cyc(3.5) / 3.5;
          if (u < 0.35) { const b = bump(u, 0.15, 0.06); p.sx = p.sy = 1 + 0.08 * b; p.a = 1 + 1.6 * b; }
          else p.on = false;
          break;
        }
        case 'twinkle': { const w = 0.5 + 0.5 * Math.sin(TAU * (t / 2.8 + ph)); p.sx = p.sy = 0.78 + 0.34 * w; p.r = 0.25 * (w - 0.5); p.a = 0.75 + 0.8 * w; break; }
        case 'shimmer': { const w = 0.5 + 0.5 * Math.sin(TAU * (t / 3.6 + ph)); p.sx = p.sy = 0.7 + 0.6 * w; break; }
        case 'bob': p.y = -3.5 * Math.sin(TAU * (t / 4.2 + ph)); break;
        case 'lift': {
          const w = Math.sin(TAU * (t / 3.4 + ph));
          p.y = -5 * w;
          if (w > 0.6) p.x = 0.7 * Math.sin(t * 55); // engine rumble at the top
          break;
        }
        case 'fly': {
          const u = cyc(5.5);
          if (u < 1.1) { const e = ease(u / 1.1); p.x = 14 * e; p.y = -10 * e; p.a = 1 - e; }
          else if (u < 1.6) { const e = (u - 1.1) / 0.5; p.sx = p.sy = 0.4 + 0.6 * ease(e); p.a = e; }
          else p.on = false;
          break;
        }
        case 'drop': { const u = cyc(4.6); if (u < 1) p.y = -9 * Math.abs(Math.sin(3 * Math.PI * u)) * (1 - u); else p.on = false; break; }
        case 'tap': {
          const u = cyc(3.6);
          if (u < 0.45) { const s = Math.sin((Math.PI * u) / 0.45); p.sx = p.sy = 1 - 0.17 * s; p.y = 1.8 * s; }
          else p.on = false;
          break;
        }
        case 'toggle': p.frame = cyc(3.2) < 1.6 ? 'toggle' : 'toggle_off'; break;
        case 'wifi': { const u = cyc(3.4); p.frame = u < 0.45 ? 'wifi_1' : u < 0.9 ? 'wifi_2' : u < 1.35 ? 'wifi_3' : 'wifi'; break; }
        case 'wiggle': { const u = cyc(4.4); if (u < 0.9) p.r = 0.2 * Math.sin((u / 0.9) * Math.PI * 6) * (1 - u / 0.9); else p.on = false; break; }
        case 'blink': { const u = cyc(4); if (u < 0.22) p.sy = 1 - 0.85 * Math.sin((Math.PI * u) / 0.22); else p.on = false; break; }
        case 'zoom': p.sx = p.sy = 1 + 0.12 * Math.sin(TAU * (t / 3 + ph)); break;
      }
      return p;
    };

    const still: Pose = { x: 0, y: 0, r: 0, sx: 1, sy: 1, a: 1, on: false };

    const draw = (g: CanvasRenderingContext2D, d: Inst, p: Pose) => {
      const img = sprites.get(p.frame ?? d.sprite);
      if (!img) return;
      const unit = d.size ? (d.size / 48) * k : k;
      const rot = d.rot + p.r + d.pr;
      const s = unit * dpr * (1 + d.ps);
      const c = Math.cos(rot) * s, sn = Math.sin(rot) * s;
      g.globalAlpha = Math.min(1, alpha * p.a * (1 + 3.2 * d.pb));
      g.setTransform(c * p.sx, sn * p.sx, -sn * p.sy, c * p.sy,
        (d.cx + p.x * k + d.px) * dpr, (d.cy + p.y * k + d.py) * dpr);
      const box = d.size ? ICON_BOX : DOT_BOX;
      g.drawImage(img, -box / 2, -box / 2, box, box);
    };

    // The cache holds every doodle that is at rest, drawn cell by cell so a
    // doodle can be lifted out (or put back) by redrawing only its cells.
    const cellRect = (ci: number) => {
      const c = ci % gridCols, r = (ci / gridCols) | 0;
      const x0 = Math.round(c * CELL * dpr), y0 = Math.round(r * CELL * dpr);
      return [x0, y0, Math.round((c + 1) * CELL * dpr) - x0, Math.round((r + 1) * CELL * dpr) - y0] as const;
    };
    const redrawCell = (ci: number) => {
      const [x, y, w, h] = cellRect(ci);
      cctx.save();
      cctx.setTransform(1, 0, 0, 1, 0, 0);
      cctx.beginPath();
      cctx.rect(x, y, w, h);
      cctx.clip();
      cctx.clearRect(x, y, w, h);
      for (const d of cells[ci]) if (!d.free) draw(cctx, d, still);
      cctx.restore();
    };
    const redrawCache = () => {
      cctx.setTransform(1, 0, 0, 1, 0, 0);
      cctx.clearRect(0, 0, cache.width, cache.height);
      for (const d of insts) if (!d.free) draw(cctx, d, still);
    };
    const lift = (d: Inst) => {
      if (d.free) return;
      d.free = true;
      free.push(d);
      for (const ci of d.cells) dirty.add(ci);
    };

    // --- Pointer ----------------------------------------------------------
    let mx = -1e5, my = -1e5, lastMove = 0, popAt = -1e5;
    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; lastMove = performance.now(); };
    const onLeave = (e: MouseEvent) => { if (!e.relatedTarget) { mx = my = -1e5; lastMove = performance.now(); } };
    const onDown = (e: PointerEvent) => { onMove(e); popAt = performance.now(); };
    if (hasMouse) {
      addEventListener('pointermove', onMove, { passive: true });
      addEventListener('pointerdown', onDown, { passive: true });
      document.addEventListener('mouseout', onLeave);
    }

    // --- Frame loop ---------------------------------------------------------
    let raf = 0, last = 0, live = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // Ambient motion is slow, so 30fps is plenty; go full rate while the mouse is busy.
      const busy = now - lastMove < 1200 || now - popAt < 900;
      if (!busy && now - last < 32) return;
      const dt = Math.min(now - last, 100);
      last = now;

      const t = now / 1000;
      const follow = 1 - Math.exp(-dt / 110);
      const pop = Math.max(0, 1 - (now - popAt) / 700);
      const reach = REACH * (1 + 0.35 * pop);

      // 1. Doodles whose own loop is playing come out of the cache.
      for (const d of moving) if (!d.free && pose(d.anim!, t, d.ph, d.size).on) lift(d);

      // 2. So do doodles near the pointer.
      if (mx > -reach && my > -reach && mx < W + reach && my < H + reach) {
        const c0 = Math.max(0, Math.floor((mx - reach) / CELL)), c1 = Math.min(gridCols - 1, Math.floor((mx + reach) / CELL));
        const r0 = Math.max(0, Math.floor((my - reach) / CELL)), r1 = Math.min(gridRows - 1, Math.floor((my + reach) / CELL));
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
          for (const d of cells[r * gridCols + c]) {
            if (!d.free && Math.hypot(d.cx - mx, d.cy - my) < reach) lift(d);
          }
        }
      }

      // 3. Move the free doodles; settle the ones that are back at rest.
      for (let i = free.length - 1; i >= 0; i--) {
        const d = free[i];
        const p = d.anim ? pose(d.anim, t, d.ph, d.size) : still;

        let tx = 0, ty = 0, tr = 0, ts = 0, tb = 0;
        const dx = d.cx - mx, dy = d.cy - my;
        const dist = Math.hypot(dx, dy);
        if (dist < reach) {
          const f = 1 - dist / reach;
          const push = (f * f * 30 + pop * f * 26) * (d.size ? 1 : 0.8);
          const inv = dist > 0.001 ? 1 / dist : 0;
          tx = dx * inv * push;
          ty = dy * inv * push;
          tr = (dx >= 0 ? 1 : -1) * f * 0.3;
          ts = d.size ? 0.22 * f : 0.6 * f;
          tb = f;
        }
        d.px += (tx - d.px) * follow;
        d.py += (ty - d.py) * follow;
        d.pr += (tr - d.pr) * follow;
        d.ps += (ts - d.ps) * follow;
        d.pb += (tb - d.pb) * follow;

        const resting = !p.on && dist >= reach &&
          Math.abs(d.px) < 0.06 && Math.abs(d.py) < 0.06 && Math.abs(d.pr) < 0.002 &&
          Math.abs(d.ps) < 0.002 && d.pb < 0.004;
        if (resting) {
          d.px = d.py = d.pr = d.ps = d.pb = 0;
          d.free = false;
          free[i] = free[free.length - 1];
          free.pop();
          for (const ci of d.cells) dirty.add(ci);
        }
      }

      if (!free.length && !dirty.size && live) return; // nothing changed

      for (const ci of dirty) redrawCell(ci);
      dirty.clear();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cache, 0, 0);
      for (let i = 0; i < free.length; i++) {
        const d = free[i];
        draw(ctx, d, d.anim ? pose(d.anim, t, d.ph, d.size) : still);
      }

      if (!live) {
        live = true;
        root.classList.add('doodles-live'); // hide the static fallback
      }
    };

    let resizeQueued = false;
    const onResize = () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(async () => {
        resizeQueued = false;
        readSize();
        await buildSprites();
        buildInstances();
        redrawCache();
        last = 0;
        live = false;
      });
    };

    readSize();
    await buildSprites();
    if (destroyed) return;
    buildInstances();
    redrawCache();
    addEventListener('resize', onResize, { passive: true });
    raf = requestAnimationFrame(frame);

    this.destroyRef.onDestroy(() => {
      destroyed = true;
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onDown);
      document.removeEventListener('mouseout', onLeave);
      root.classList.remove('doodles-live');
    });
  }
}
