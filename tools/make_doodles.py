"""Generate a seamless WhatsApp-style doodle wallpaper on a web-design theme.

Every icon is an original line drawing on a 48x48 grid. Icons are scattered
over a square tile with random size and tilt, kept apart by a minimum
distance, and any icon near an edge is repeated on the opposite edge so the
tile repeats without seams. Small dots, rings and plus signs fill the gaps,
as in the WhatsApp wallpaper.

Usage: python3 make_doodles.py OUT.svg [tile_px] [seed] [stroke_colour]

For this site: python3 tools/make_doodles.py public/bg/doodles.svg 640 11 "#12305e"
(writes public/bg/doodles.svg and public/bg/doodles.json together)
"""
import math
import random
import sys
import json

OUT = sys.argv[1]
TILE = int(sys.argv[2]) if len(sys.argv) > 2 else 640
SEED = int(sys.argv[3]) if len(sys.argv) > 3 else 7
INK = sys.argv[4] if len(sys.argv) > 4 else '#12305e'

# --- Icons (48x48, stroke only unless noted) ------------------------------
ICONS = {
    'cursor': '<path d="M13 8v28l8-7 5 11 5-2-5-11h10z"/>',
    'browser': '<rect x="6" y="9" width="36" height="30" rx="4"/><path d="M6 17h36"/>'
               '<circle cx="11" cy="13" r="1" fill="INK"/><circle cx="15" cy="13" r="1" fill="INK"/>'
               '<circle cx="19" cy="13" r="1" fill="INK"/><path d="M12 24h14M12 30h22"/>',
    'code': '<path d="M17 14 7 24l10 10M31 14l10 10-10 10M27 10l-6 28"/>',
    'braces': '<path d="M18 8c-5 0-5 3-5 7s0 7-5 9c5 2 5 5 5 9s0 7 5 7M30 8c5 0 5 3 5 7s0 7 5 9c-5 2-5 5-5 9s0 7-5 7"/>',
    'pen': '<path d="M24 6 34 22l-4 14H18l-4-14z"/><path d="M24 6v13"/><circle cx="24" cy="22" r="3"/>'
           '<path d="M17 42h14"/>',
    'bezier': '<path d="M8 36C14 10 34 38 40 12"/><path d="M8 36 18 18M40 12 30 30"/>'
              '<rect x="15.5" y="15.5" width="5" height="5"/><rect x="27.5" y="27.5" width="5" height="5"/>'
              '<circle cx="8" cy="36" r="2.5"/><circle cx="40" cy="12" r="2.5"/>',
    'phone': '<rect x="15" y="5" width="18" height="38" rx="4"/><path d="M21 9h6M22 38h4"/>',
    'laptop': '<rect x="10" y="10" width="28" height="20" rx="2"/><path d="M5 35h38l-3 4H8z"/>',
    'palette': '<path d="M24 6C13 6 6 14 6 23c0 9 7 16 15 16 3 0 4-2 3-4-1-3 1-5 4-5h5c6 0 9-4 9-9C42 13 34 6 24 6z"/>'
               '<circle cx="15" cy="20" r="2.5"/><circle cx="22" cy="13" r="2.5"/><circle cx="31" cy="14" r="2.5"/>'
               '<circle cx="35" cy="22" r="2.5"/>',
    'type': '<path d="M6 38 16 10l10 28M10 28h12"/><circle cx="35" cy="31" r="6"/><path d="M41 24v14"/>',
    'layout': '<rect x="7" y="8" width="34" height="32" rx="3"/><path d="M7 17h34M20 17v23M20 28h21"/>',
    'ruler': '<rect x="4" y="17" width="40" height="14" rx="2" transform="rotate(-30 24 24)"/>'
             '<path d="M12 27.5l-2.2-3.8M17.5 24.3l-3-5.2M23 21.2l-2.2-3.8M28.5 18l-3-5.2M34 14.8l-2.2-3.8"/>',
    'hash': '<path d="M19 8 15 40M33 8l-4 32M9 18h32M7 30h32"/>',
    'wifi': '<path d="M6 19c10-9 26-9 36 0M12 26c7-6 17-6 24 0M18 33c4-3 8-3 12 0"/>'
            '<circle cx="24" cy="39" r="1.8" fill="INK"/>',
    'wand': '<path d="M9 39 31 17"/><path d="M28 14l6 6"/><path d="M36 6v6M33 9h6M40 22v4M38 24h4M19 8v4M17 10h4"/>',
    'dropper': '<path d="M29 9a5 5 0 0 1 7 7l-4 4-7-7z"/><path d="M27 15 12 30l-2 7 7-2 15-15"/>'
               '<path d="M22 20h-5"/>',
    'crop': '<path d="M14 6v28h28M6 14h28v28"/>',
    'zoom': '<circle cx="21" cy="21" r="12"/><path d="M30 30l10 10M16 21h10M21 16v10"/>',
    'gear': '<circle cx="24" cy="24" r="6"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.3 11.3l4.2 4.2M32.5 32.5l4.2 4.2'
            'M11.3 36.7l4.2-4.2M32.5 15.5l4.2-4.2"/><circle cx="24" cy="24" r="12"/>',
    'cloud': '<path d="M14 34h-1a7 7 0 0 1 0-14 10 10 0 0 1 19-3 8 8 0 0 1 4 17h-2"/><path d="M24 40V25M18 30l6-6 6 6"/>',
    'rocket': '<path d="M24 5c7 5 9 13 7 22l-4 5h-6l-4-5c-2-9 0-17 7-22z"/><circle cx="24" cy="17" r="3"/>'
              '<path d="M17 25l-6 6 1 6 7-5M31 25l6 6-1 6-7-5M21 36l3 7 3-7"/>',
    'bulb': '<path d="M18 31c0-4-5-7-5-13a11 11 0 0 1 22 0c0 6-5 9-5 13z"/><path d="M19 36h10M21 41h6"/>'
            '<path d="M24 31v-8l-3-3M24 23l3-3"/>',
    'coffee': '<path d="M9 18h26v10a11 11 0 0 1-11 11h-4A11 11 0 0 1 9 28z"/><path d="M35 21h3a5 5 0 0 1 0 10h-4"/>'
              '<path d="M17 6c-2 3 2 5 0 8M24 6c-2 3 2 5 0 8"/>',
    'layers': '<path d="M24 8 42 17 24 26 6 17z"/><path d="M6 24l18 9 18-9M6 31l18 9 18-9"/>',
    'mouse': '<rect x="13" y="6" width="22" height="36" rx="11"/><path d="M24 6v10"/><path d="M24 20v4"/>',
    'spark': '<path d="M24 6c1.5 9 4.5 12 13.5 13.5C28.5 21 25.5 24 24 33c-1.5-9-4.5-12-13.5-13.5C19.5 18 22.5 15 24 6z"/>'
             '<path d="M37 32v8M33 36h8"/>',
    'toggle': '<rect x="5" y="15" width="38" height="18" rx="9"/><circle cx="34" cy="24" r="6" fill="INK"/>',
    'check': '<rect x="7" y="7" width="34" height="34" rx="7"/><path d="M15 25l6 6 13-14"/>',
    'slider': '<path d="M6 14h36M6 24h36M6 34h36"/><circle cx="16" cy="14" r="3.5" fill="#fff"/>'
              '<circle cx="31" cy="24" r="3.5" fill="#fff"/><circle cx="22" cy="34" r="3.5" fill="#fff"/>',
    'terminal': '<rect x="5" y="8" width="38" height="32" rx="4"/><path d="M12 19l7 5-7 5M23 31h12"/>',
    'swatch': '<rect x="8" y="8" width="13" height="13" rx="3"/><rect x="27" y="8" width="13" height="13" rx="3" fill="INK"/>'
              '<rect x="8" y="27" width="13" height="13" rx="3" fill="INK" fill-opacity=".35"/><rect x="27" y="27" width="13" height="13" rx="3"/>',
    'pixel': '<path d="M8 8h8v8H8zM24 8h8v8h-8zM16 16h8v8h-8zM32 16h8v8h-8zM8 24h8v8H8zM24 24h8v8h-8zM16 32h8v8h-8zM32 32h8v8h-8z"/>',
    'chat': '<path d="M8 10h32a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H22l-9 8v-8H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z"/>'
            '<path d="M14 20h20M14 26h12"/>',
    'image': '<rect x="6" y="9" width="36" height="30" rx="3"/><circle cx="17" cy="19" r="3.5"/>'
             '<path d="M6 34l11-10 8 7 6-5 11 9"/>',
    'link': '<path d="M20 28l8-8"/><path d="M17 22l-5 5a7 7 0 0 0 10 10l5-5M31 26l5-5a7 7 0 0 0-10-10l-5 5"/>',
    'tablet': '<rect x="10" y="5" width="28" height="38" rx="4"/><circle cx="24" cy="38" r="1.5" fill="INK"/>',
    'heart': '<path d="M24 40S7 30 7 18a8.5 8.5 0 0 1 17-2 8.5 8.5 0 0 1 17 2c0 12-17 22-17 22z"/>',
    'squiggle': '<path d="M5 28c4-8 8-8 11 0s7 8 11 0 7-8 11 0 6 6 6 6"/>',
    'star': '<path d="M24 7l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z"/>',
    # --- More variety (v2) ---
    'hand': '<path d="M19 24V10a3 3 0 0 1 6 0v12M25 21v-3a3 3 0 0 1 6 0v4M31 21a3 3 0 0 1 6 0v8c0 7-5 12-11 12h-2c-4 0-7-2-9-5l-6-9a3 3 0 0 1 5-3l3 4v-6"/>',
    'eye': '<path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/><circle cx="24" cy="24" r="2" fill="INK"/>',
    'lock': '<rect x="10" y="21" width="28" height="21" rx="4"/><path d="M16 21v-6a8 8 0 0 1 16 0v6"/><path d="M24 29v5"/>',
    'cart': '<path d="M5 8h6l5 22h21l4-15H14"/><circle cx="19" cy="38" r="3"/><circle cx="34" cy="38" r="3"/>',
    'database': '<ellipse cx="24" cy="11" rx="14" ry="5"/><path d="M10 11v26c0 3 6 5 14 5s14-2 14-5V11M10 24c0 3 6 5 14 5s14-2 14-5"/>',
    'server': '<rect x="7" y="7" width="34" height="14" rx="3"/><rect x="7" y="27" width="34" height="14" rx="3"/>'
              '<circle cx="14" cy="14" r="1.6" fill="INK"/><circle cx="14" cy="34" r="1.6" fill="INK"/><path d="M22 14h12M22 34h12"/>',
    'branch': '<circle cx="14" cy="10" r="4"/><circle cx="14" cy="38" r="4"/><circle cx="34" cy="16" r="4"/><path d="M14 14v20M34 20c0 9-20 6-20 14"/>',
    'bug': '<rect x="15" y="15" width="18" height="24" rx="9"/><path d="M24 22v17M18 10l3 5M30 10l-3 5M15 23H8M15 31H8M33 23h7M33 31h7M16 37l-5 4M32 37l5 4"/>',
    'folder': '<path d="M5 13a3 3 0 0 1 3-3h10l4 5h18a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M5 20h38"/>',
    'filecode': '<path d="M11 5h18l9 9v29H11z"/><path d="M29 5v9h9"/><path d="M20 23l-4 5 4 5M28 23l4 5-4 5"/>',
    'calendar': '<rect x="6" y="9" width="36" height="33" rx="4"/><path d="M6 18h36M15 5v8M33 5v8"/>'
                '<rect x="13" y="24" width="6" height="5" fill="INK"/><path d="M23 26.5h5M32 26.5h3M13 35h5M23 35h5"/>',
    'bell': '<path d="M12 33V22a12 12 0 0 1 24 0v11l3 4H9z"/><path d="M20 40a4 4 0 0 0 8 0"/><circle cx="35" cy="11" r="4" fill="INK"/>',
    'mail': '<rect x="5" y="10" width="38" height="28" rx="3"/><path d="M6 12l18 14 18-14"/>',
    'globe': '<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c6 6 6 28 0 34M24 7c-6 6-6 28 0 34"/>',
    'monitor': '<rect x="5" y="7" width="38" height="26" rx="3"/><path d="M18 41h12M24 33v8"/><path d="M11 13h10M11 18h16"/>',
    'keyboard': '<rect x="4" y="13" width="40" height="22" rx="3"/><path d="M10 20h2M16 20h2M22 20h2M28 20h2M34 20h4M10 26h4M18 26h2M24 26h2M30 26h2M36 26h2M15 30h18"/>',
    'pin': '<path d="M24 43s-13-13-13-23a13 13 0 0 1 26 0c0 10-13 23-13 23z"/><circle cx="24" cy="20" r="5"/>',
    'play': '<rect x="5" y="9" width="38" height="30" rx="7"/><path d="M20 17v14l12-7z"/>',
    'menu': '<path d="M9 14h30M9 24h30M9 34h20"/>',
    'search': '<rect x="4" y="15" width="40" height="18" rx="9"/><circle cx="35" cy="24" r="4"/><path d="M38 27l3 3M11 24h14"/>',
    'button': '<rect x="5" y="14" width="38" height="20" rx="10"/><path d="M15 24h14M25 20l4 4-4 4"/>',
    'spinner': '<path d="M24 6v8M24 34v8M6 24h8M34 24h8M11.3 11.3l5.6 5.6M31.1 31.1l5.6 5.6M11.3 36.7l5.6-5.6"/>',
    'chart': '<path d="M6 42h36M6 6v36"/><rect x="12" y="26" width="6" height="12"/><rect x="22" y="16" width="6" height="22"/><rect x="32" y="21" width="6" height="17"/>',
    'sitemap': '<rect x="18" y="5" width="12" height="9" rx="2"/><rect x="5" y="34" width="12" height="9" rx="2"/>'
               '<rect x="18" y="34" width="12" height="9" rx="2"/><rect x="31" y="34" width="12" height="9" rx="2"/>'
               '<path d="M24 14v20M11 34v-8h26v8"/>',
    'refresh': '<path d="M39 20A16 16 0 0 0 10 15M9 28a16 16 0 0 0 29 5"/><path d="M10 7v8h8M38 41v-8h-8"/>',
    'download': '<path d="M24 6v24M15 21l9 9 9-9"/><path d="M7 32v6a3 3 0 0 0 3 3h28a3 3 0 0 0 3-3v-6"/>',
    'bucket': '<path d="M10 22 24 8l14 14-14 14z"/><path d="M10 22h28"/><path d="M41 28c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7z" fill="INK"/>',
    'scissors': '<circle cx="12" cy="36" r="5"/><circle cx="36" cy="36" r="5"/><path d="M15 32 34 7M33 32 14 7"/>',
    'compass': '<circle cx="24" cy="8" r="3"/><path d="M22.5 11 12 41M25.5 11 36 41M15 31c6 3 12 3 18 0"/>',
    'eraser': '<path d="M27 8 41 22 22 41H13L7 35z"/><path d="M17 18l14 14M22 41h20"/>',
    'bold': '<path d="M14 8h12a7 7 0 0 1 0 14H14zM14 22h14a8 8 0 0 1 0 16H14z"/>',
    'italic': '<path d="M20 8h16M12 40h16M30 8 18 40"/>',
    'align': '<path d="M8 10h32M8 19h22M8 28h32M8 37h18"/>',
    'h1': '<path d="M6 10v28M22 10v28M6 24h16M32 16l6-5v27M32 38h12"/>',
    'www': '<path d="M3 17l3 14 3-10 3 10 3-14M17 17l3 14 3-10 3 10 3-14M31 17l3 14 3-10 3 10 3-14"/>',
    'px': '<path d="M8 40V14h7a6 6 0 0 1 0 12H8M27 14l14 18M41 14 27 32"/>',
    'percent': '<circle cx="14" cy="14" r="5"/><circle cx="34" cy="34" r="5"/><path d="M38 9 10 39"/>',
    'app': '<rect x="7" y="7" width="14" height="14" rx="4"/><rect x="27" y="7" width="14" height="14" rx="4"/>'
           '<rect x="7" y="27" width="14" height="14" rx="4"/><circle cx="34" cy="34" r="7"/>',
    'smile': '<circle cx="24" cy="24" r="17"/><path d="M16 28c4 5 12 5 16 0"/><circle cx="18" cy="19" r="1.8" fill="INK"/><circle cx="30" cy="19" r="1.8" fill="INK"/>',
    'thumb': '<path d="M15 21v20H7V21z"/><path d="M15 22l7-14c3 0 5 2 4 6l-2 7h11a4 4 0 0 1 4 5l-3 11a4 4 0 0 1-4 3H15"/>',
    'send': '<path d="M42 6 6 21l14 6 6 14z"/><path d="M20 27 42 6"/>',
    'qr': '<rect x="7" y="7" width="12" height="12" rx="1"/><rect x="29" y="7" width="12" height="12" rx="1"/>'
          '<rect x="7" y="29" width="12" height="12" rx="1"/><path d="M29 29h4v4h-4zM37 33h4v8h-8M29 37v4"/>'
          '<rect x="11" y="11" width="4" height="4" fill="INK"/><rect x="33" y="11" width="4" height="4" fill="INK"/><rect x="11" y="33" width="4" height="4" fill="INK"/>',
    'battery': '<rect x="5" y="15" width="34" height="18" rx="4"/><path d="M42 21v6"/><rect x="9" y="19" width="16" height="10" rx="1" fill="INK"/>',
    'moon': '<path d="M33 30A15 15 0 0 1 20 8a16 16 0 1 0 20 20 15 15 0 0 1-7 2z"/><path d="M35 8v6M32 11h6"/>',
    'sun': '<circle cx="24" cy="24" r="8"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M10 38l4-4M34 14l4-4"/>',
    'tag': '<path d="M6 8v14l20 20 16-16L22 6H8z"/><circle cx="15" cy="15" r="3"/>',
    'shield': '<path d="M24 5 39 11v11c0 10-7 17-15 21-8-4-15-11-15-21V11z"/><path d="M17 24l5 5 9-10"/>',
    'cube': '<path d="M24 5 41 14v20L24 43 7 34V14z"/><path d="M7 14l17 9 17-9M24 23v20"/>',
    'arrows': '<path d="M24 5v38M5 24h38M19 10l5-5 5 5M19 38l5 5 5-5M10 19l-5 5 5 5M38 19l5 5-5 5"/>',
    'cmd': '<path d="M18 18v-5a5 5 0 1 0-5 5h22a5 5 0 1 0-5-5v22a5 5 0 1 0 5-5H13a5 5 0 1 0 5 5z"/>',
    'tabs': '<path d="M5 40V16a3 3 0 0 1 3-3h9l3 5h20a3 3 0 0 1 3 3v19z"/><path d="M20 13h7l3 5"/>',
}

# Extra frames used only by the live animation, never placed on the tile.
EXTRA = {
    'toggle_off': '<rect x="5" y="15" width="38" height="18" rx="9"/><circle cx="14" cy="24" r="6"/>',
    'wifi_1': '<circle cx="24" cy="39" r="1.8" fill="INK"/>',
    'wifi_2': '<path d="M18 33c4-3 8-3 12 0"/><circle cx="24" cy="39" r="1.8" fill="INK"/>',
    'wifi_3': '<path d="M12 26c7-6 17-6 24 0M18 33c4-3 8-3 12 0"/><circle cx="24" cy="39" r="1.8" fill="INK"/>',
}

FILLERS = [
    '<circle cx="0" cy="0" r="2.2" fill="INK"/>',
    '<path d="M-6 2c2-4 4-4 6 0s4 4 6 0"/>',
    '<path d="M0-5 5 0 0 5-5 0z"/>',
    '<path d="M-5 4 0-5l5 9z"/>',
    '<circle cx="0" cy="0" r="4" />',
    '<path d="M-5 0h10M0-5v10"/>',
    '<path d="M-4-4l8 8M4-4l-8 8"/>',
]

rnd = random.Random(SEED)
names = list(ICONS)
rnd.shuffle(names)

# Poisson-disc style placement inside the tile with wrap-around distance.
placed = []
MIN_D = TILE / 11.2

def wrap_dist(a, b):
    dx = abs(a[0] - b[0]); dy = abs(a[1] - b[1])
    dx = min(dx, TILE - dx); dy = min(dy, TILE - dy)
    return math.hypot(dx, dy)

attempts = 0
idx = 0
while attempts < 40000 and len(placed) < 140:
    attempts += 1
    p = (rnd.uniform(0, TILE), rnd.uniform(0, TILE))
    if all(wrap_dist(p, q[:2]) >= MIN_D for q in placed):
        name = names[idx % len(names)]; idx += 1
        size = rnd.uniform(40, 54)
        rot = rnd.uniform(-28, 28)
        placed.append((p[0], p[1], name, size, rot))

# Fillers in the remaining gaps.
fillers = []
attempts = 0
while attempts < 30000 and len(fillers) < 80:
    attempts += 1
    p = (rnd.uniform(0, TILE), rnd.uniform(0, TILE))
    if all(wrap_dist(p, q[:2]) >= MIN_D * 0.6 for q in placed) and \
       all(wrap_dist(p, f[:2]) >= MIN_D * 0.5 for f in fillers):
        fillers.append((p[0], p[1], rnd.randrange(len(FILLERS)), rnd.uniform(0, 90)))

def copies(x, y, reach):
    """The positions to draw an item at so it tiles seamlessly."""
    xs = [x] + ([x + TILE] if x < reach else []) + ([x - TILE] if x > TILE - reach else [])
    ys = [y] + ([y + TILE] if y < reach else []) + ([y - TILE] if y > TILE - reach else [])
    return [(a, b) for a in xs for b in ys]

parts = []
for x, y, name, size, rot in placed:
    s = size / 48
    body = ICONS[name].replace('INK', INK)
    for cx, cy in copies(x, y, size * 0.8):
        parts.append(
            f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({rot:.1f}) scale({s:.3f}) translate(-24 -24)">{body}</g>'
        )
for x, y, k, rot in fillers:
    body = FILLERS[k].replace('INK', INK)
    for cx, cy in copies(x, y, 8):
        parts.append(f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({rot:.0f})">{body}</g>')

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{TILE}" height="{TILE}" viewBox="0 0 {TILE} {TILE}">'
    f'<g fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" '
    f'vector-effect="non-scaling-stroke">'
    + ''.join(parts)
    + '</g></svg>'
)
open(OUT, 'w').write(svg)
# The same layout as data, for the animated canvas wallpaper
# (src/app/components/doodle-wall). Positions are in tile pixels.
data = {
    'tile': TILE,
    'ink': INK,
    'stroke': 2.4,
    'icons': {k: v.replace('INK', INK) for k, v in {**ICONS, **EXTRA}.items()},
    'fillers': [f.replace('INK', INK) for f in FILLERS],
    'items': [[round(x, 1), round(y, 1), name, round(size, 1), round(rot, 1)] for x, y, name, size, rot in placed],
    'dots': [[round(x, 1), round(y, 1), k, round(rot)] for x, y, k, rot in fillers],
}
with open(OUT.rsplit('.', 1)[0] + '.json', 'w') as fh:
    json.dump(data, fh, separators=(',', ':'))
print(f'{OUT}: {len(placed)} icons, {len(fillers)} fillers, {len(svg)/1024:.1f} KB')
