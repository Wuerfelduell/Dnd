// Prozedural erzeugte Platzhalter-Pixelgrafik.
// Alles hält sich an die Asset-Maße (Tiles 16x16, Figuren 16x32, Sheets 64x128),
// damit echte PNGs später 1:1 die Platzhalter ersetzen können (siehe README).

export const TILE = 16;

const OUTLINE = '#1a1c2c';

// Reihenfolge = Tile-Index im generierten Tileset.
export const TILE_KEYS = [
  'cobble0', 'cobble1', 'cobble2', 'cobble3',
  'walk0', 'walk1',
  'brick', 'window', 'door',
  'roofEaveBottom', 'roofEaveTop',
  'fence',
  'water0', 'water1',
  'bridgeLeft', 'bridgeMid', 'bridgeRight',
];
export const TILE_INDEX = Object.fromEntries(TILE_KEYS.map((k, i) => [k, i]));
export const SOLID_KEYS = ['brick', 'window', 'door', 'roofEaveBottom', 'roofEaveTop', 'fence', 'water0', 'water1'];

/** Deterministischer Hash für Variationen pro Tile. */
export function hash2(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
}

function painter(ctx, ox = 0, oy = 0) {
  return (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(ox + x, oy + y, w, h);
  };
}

// --- Tiles -------------------------------------------------------------------

function drawCobble(p, v) {
  p(0, 0, 16, 16, '#343744');
  const stones = ['#4f5463', '#575c6b', '#4a4e5c', '#5e6374'];
  // Versetzte Reihen aus Pflastersteinen
  const rows = [
    [0, 0, 7], [8, 0, 7],
    [-4, 5, 7], [4, 5, 7], [12, 5, 7],
    [0, 10, 7], [8, 10, 7],
  ];
  rows.forEach(([x, y, w], i) => {
    const c = stones[(i + v) % stones.length];
    const xx = Math.max(0, x);
    const ww = Math.min(16, x + w) - xx;
    p(xx, y + 1, ww, 4, c);
    p(xx, y + 1, ww, 1, '#666b7c'); // Glanzkante (nasses Pflaster)
  });
  if (v === 1) p(9, 12, 4, 2, '#3c5250'); // Moos
  if (v === 2) { p(3, 7, 5, 2, '#2c3a4a'); p(4, 7, 3, 1, '#4a6a80'); } // Pfütze
  if (v === 3) p(11, 2, 1, 3, '#2e303a'); // Riss
}

function drawWalk(p, v) {
  p(0, 0, 16, 16, '#625e68');
  p(0, 15, 16, 1, '#48454f');
  p(15, 0, 1, 16, '#48454f');
  p(0, 0, 16, 1, '#6f6b75');
  if (v === 1) { p(4, 6, 3, 1, '#55525c'); p(9, 10, 2, 1, '#55525c'); }
}

function drawBrick(p) {
  p(0, 0, 16, 16, '#3e2b29');
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 4 : 0;
    for (let col = -1; col < 2; col++) {
      const x = col * 8 + off;
      const xx = Math.max(0, x);
      const ww = Math.min(16, x + 7) - xx;
      if (ww > 0) {
        p(xx, row * 4, ww, 3, row % 2 ? '#563834' : '#5c3d38');
        p(xx, row * 4, ww, 1, '#6a4741');
      }
    }
  }
}

function drawWindow(p) {
  drawBrick(p);
  p(2, 2, 12, 12, '#2b2220');
  p(3, 3, 10, 10, '#e2b25c');
  p(3, 3, 10, 2, '#f2cf80');
  p(7, 3, 2, 10, '#4a3420');
  p(3, 7, 10, 1, '#4a3420');
  p(1, 14, 14, 1, '#6a6670'); // Fensterbank
}

function drawDoor(p) {
  drawBrick(p);
  p(3, 1, 10, 15, '#2a1c14');
  p(4, 2, 8, 14, '#4a3020');
  p(4, 2, 8, 1, '#5a3c28');
  p(7, 2, 1, 14, '#3a2418');
  p(10, 9, 1, 1, '#c8a050');
}

function drawRoof(p, eaveBottom) {
  p(0, 0, 16, 16, '#353a4c');
  for (let y = 1; y < 16; y += 4) {
    p(0, y, 16, 1, '#2a2e3e');
    const off = (y >> 2) % 2 ? 2 : 6;
    p(off, y + 1, 1, 3, '#2a2e3e');
    p(off + 8, y + 1, 1, 3, '#2a2e3e');
  }
  if (eaveBottom) { p(0, 13, 16, 3, '#22252f'); p(0, 13, 16, 1, '#454b60'); }
  else { p(0, 0, 16, 3, '#22252f'); p(0, 2, 16, 1, '#454b60'); }
}

function drawFence(p) {
  drawWalk(p, 0);
  p(0, 4, 16, 2, OUTLINE);
  p(0, 4, 16, 1, '#3a3d48');
  for (let x = 1; x < 16; x += 4) {
    p(x, 4, 2, 10, OUTLINE);
    p(x, 2, 2, 2, '#2a2c36');
  }
  p(0, 12, 16, 1, '#2a2c36');
}

function drawWater(p, v) {
  p(0, 0, 16, 16, '#1c3640');
  const ripples = v ? [[2, 3, 5], [9, 9, 4], [4, 13, 3]] : [[8, 2, 4], [1, 8, 5], [11, 12, 3]];
  ripples.forEach(([x, y, w]) => { p(x, y, w, 1, '#2c5560'); p(x + 1, y + 1, w - 2, 1, '#18303a'); });
}

function drawBridge(p, side) {
  p(0, 0, 16, 16, '#5a452e');
  for (let y = 0; y < 16; y += 4) { p(0, y, 16, 1, '#3e2e1e'); p(0, y + 1, 16, 1, '#6b5236'); }
  if (side === 'left') { p(0, 0, 3, 16, '#2e2216'); p(0, 0, 1, 16, '#4a3622'); }
  if (side === 'right') { p(13, 0, 3, 16, '#2e2216'); p(15, 0, 1, 16, '#4a3622'); }
}

const TILE_PAINTERS = {
  cobble0: (p) => drawCobble(p, 0), cobble1: (p) => drawCobble(p, 1),
  cobble2: (p) => drawCobble(p, 2), cobble3: (p) => drawCobble(p, 3),
  walk0: (p) => drawWalk(p, 0), walk1: (p) => drawWalk(p, 1),
  brick: drawBrick, window: drawWindow, door: drawDoor,
  roofEaveBottom: (p) => drawRoof(p, true), roofEaveTop: (p) => drawRoof(p, false),
  fence: drawFence,
  water0: (p) => drawWater(p, 0), water1: (p) => drawWater(p, 1),
  bridgeLeft: (p) => drawBridge(p, 'left'), bridgeMid: (p) => drawBridge(p, 'mid'),
  bridgeRight: (p) => drawBridge(p, 'right'),
};

// --- Figuren ---------------------------------------------------------------

const DIRS = ['down', 'left', 'right', 'up'];

function drawCharacterFrame(p, pal, dir, frame) {
  const step = frame === 1 ? 1 : frame === 3 ? -1 : 0; // Beinwechsel
  const bob = frame % 2 ? 0 : 1; // leichtes Wippen
  const side = dir === 'left' || dir === 'right';
  // Beine & Schuhe
  if (side) {
    p(6 + step, 24, 3, 6, pal.legs);
    p(7 - step, 24, 3, 6, shade(pal.legs, -12));
    p(6 + step, 30, 4, 2, '#1e1a1c');
  } else {
    p(5, 24 + Math.max(0, -step), 3, 6 - Math.abs(step), pal.legs);
    p(8, 24 + Math.max(0, step), 3, 6 - Math.abs(step), pal.legs);
    p(5, 30, 3, 2, '#1e1a1c');
    p(8, 30, 3, 2, '#1e1a1c');
  }
  const y0 = bob; // Oberkörper wippt
  // Mantel
  if (side) {
    p(5, 14 + y0, 6, 11, pal.coat);
    p(dir === 'left' ? 10 : 5, 14 + y0, 1, 11, shade(pal.coat, -18));
    p(4, 21 + y0, 8, 4, pal.coat);
    p(7 + step, 16 + y0, 2, 7, shade(pal.coat, -24)); // Arm
  } else {
    p(4, 14 + y0, 8, 11, pal.coat);
    p(3, 21 + y0, 10, 4, pal.coat);
    p(11, 14 + y0, 1, 11, shade(pal.coat, -18));
    p(3, 15 + y0 + step, 1, 7, shade(pal.coat, -24));
    p(12, 15 + y0 - step, 1, 7, shade(pal.coat, -24));
    if (dir === 'down') p(7, 15 + y0, 2, 9, shade(pal.coat, 14)); // Knopfleiste
  }
  if (pal.scarf) p(side ? 5 : 4, 13 + y0, side ? 6 : 8, 2, pal.scarf);
  // Kopf
  p(5, 7 + y0, 6, 7, dir === 'up' ? pal.hair : pal.skin);
  if (dir === 'down') { p(6, 10 + y0, 1, 1, OUTLINE); p(9, 10 + y0, 1, 1, OUTLINE); }
  if (dir === 'left') { p(5, 10 + y0, 1, 1, OUTLINE); p(9, 7 + y0, 2, 5, pal.hair); }
  if (dir === 'right') { p(10, 10 + y0, 1, 1, OUTLINE); p(5, 7 + y0, 2, 5, pal.hair); }
  // Hut
  p(3, 6 + y0, 10, 1, pal.hat);
  p(5, 1 + y0, 6, 5, pal.hat);
  p(5, 5 + y0, 6, 1, shade(pal.hat, 20));
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** 1px-Umriss um alle deckenden Pixel (Stil-Vorgabe). */
function outline(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const out = new Uint8ClampedArray(d);
  const opaque = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (opaque(x, y)) continue;
      // Nicht über Frame-Grenzen hinweg umranden
      const fx = x % 16;
      const fy = y % 32;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const nx = fx + dx, ny = fy + dy;
        if (nx < 0 || nx > 15 || ny < 0 || ny > 31) return false;
        return opaque(x + dx, y + dy);
      });
      if (nb) {
        const i = (y * w + x) * 4;
        out[i] = 0x1a; out[i + 1] = 0x1c; out[i + 2] = 0x2c; out[i + 3] = 255;
      }
    }
  }
  img.data.set(out);
  ctx.putImageData(img, 0, 0);
}

export function createCharacterSheet(scene, key, palette) {
  if (scene.textures.exists(key)) return;
  const { c, ctx } = makeCanvas(64, 128);
  DIRS.forEach((dir, row) => {
    for (let f = 0; f < 4; f++) drawCharacterFrame(painter(ctx, f * 16, row * 32), palette, dir, f);
  });
  outline(ctx, 64, 128);
  scene.textures.addSpriteSheet(key, c, { frameWidth: 16, frameHeight: 32 });
}

// --- Props & Effekte -----------------------------------------------------------

function drawLamp(p, lit) {
  p(7, 14, 2, 30, '#2a2c34');
  p(7, 14, 1, 30, '#3a3d48');
  p(5, 43, 6, 3, '#22242c');
  p(4, 46, 8, 2, '#1a1c22');
  p(4, 4, 8, 2, '#22242c'); // Dach der Laterne
  p(6, 2, 4, 2, '#22242c');
  p(4, 6, 8, 7, '#22242c');
  if (lit) {
    p(5, 7, 6, 5, '#ffd890');
    p(6, 8, 4, 3, '#fff2c8');
  } else {
    p(5, 7, 6, 5, '#a9c6d4');
    p(5, 7, 2, 1, '#e8f4f8'); p(9, 10, 2, 1, '#e8f4f8'); p(7, 9, 1, 1, '#e8f4f8');
  }
  p(4, 12, 8, 2, '#22242c');
}

const PROPS = {
  pole: [16, 16, (p) => {
    for (let i = 0; i < 12; i++) p(1 + i, 13 - Math.floor(i * 0.8), 2, 1, '#4a3a2a');
    p(13, 3, 2, 2, '#b08840'); p(14, 1, 1, 2, '#b08840'); p(12, 1, 2, 1, '#b08840');
  }],
  bottle: [16, 16, (p) => {
    p(3, 9, 8, 4, '#2e4a36'); p(3, 9, 8, 1, '#4a7058'); p(11, 10, 3, 2, '#2e4a36'); p(14, 10, 1, 2, '#6b5a3a');
  }],
  seal: [16, 16, (p) => {
    p(4, 5, 8, 6, '#141016'); p(5, 4, 6, 8, '#141016');
    p(6, 7, 4, 2, '#7ef0d8'); p(7, 7, 2, 2, '#141016'); p(5, 8, 1, 1, '#7ef0d8'); p(10, 7, 1, 1, '#7ef0d8');
  }],
  footprint: [16, 16, (p) => {
    p(3, 5, 3, 5, '#6fe0d0'); p(3, 3, 1, 1, '#6fe0d0'); p(5, 3, 1, 1, '#6fe0d0');
    p(10, 8, 3, 5, '#6fe0d0'); p(10, 6, 1, 1, '#6fe0d0'); p(12, 6, 1, 1, '#6fe0d0');
  }],
  glint: [16, 16, (p) => { p(7, 5, 1, 5, '#fff2c8'); p(5, 7, 5, 1, '#fff2c8'); }],
};

function radialTexture(scene, key, size, stops) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, size, size);
  const ctx = tex.getContext();
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  tex.refresh();
}

function fogTexture(scene, key, seed) {
  if (scene.textures.exists(key)) return;
  const size = 256;
  const cell = 32;
  const tex = scene.textures.createCanvas(key, size, size);
  const ctx = tex.getContext();
  const n = size / cell;
  const val = (x, y) => hash2(((x % n) + n) % n, ((y % n) + n) % n, seed);
  const smooth = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const gx = x / cell, gy = y / cell;
      const ix = Math.floor(gx), iy = Math.floor(gy);
      const fx = smooth(gx - ix), fy = smooth(gy - iy);
      const a = val(ix, iy), b = val(ix + 1, iy), c = val(ix, iy + 1), d = val(ix + 1, iy + 1);
      const v = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
      const alpha = Math.max(0, (v - 0.35) / 0.65);
      if (alpha <= 0) continue;
      ctx.fillStyle = `rgba(150,165,190,${(alpha * 0.55).toFixed(3)})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }
  tex.refresh();
}

export function createTextures(scene) {
  // Tileset als Streifen (17 x 16px). Später einfach durch ein PNG ersetzen.
  if (!scene.textures.exists('tiles')) {
    const { c, ctx } = makeCanvas(TILE_KEYS.length * TILE, TILE);
    TILE_KEYS.forEach((k, i) => TILE_PAINTERS[k](painter(ctx, i * TILE, 0)));
    scene.textures.addCanvas('tiles', c);
  }
  for (const [key, lit] of [['lamp_lit', true], ['lamp_frost', false]]) {
    if (scene.textures.exists(key)) continue;
    const { c, ctx } = makeCanvas(16, 48);
    drawLamp(painter(ctx), lit);
    scene.textures.addCanvas(key, c);
  }
  for (const [key, [w, h, draw]] of Object.entries(PROPS)) {
    if (scene.textures.exists(key)) continue;
    const { c, ctx } = makeCanvas(w, h);
    draw(painter(ctx));
    scene.textures.addCanvas(key, c);
  }
  radialTexture(scene, 'light', 128, [[0, 'rgba(255,255,255,1)'], [0.45, 'rgba(255,255,255,0.75)'], [1, 'rgba(255,255,255,0)']]);
  radialTexture(scene, 'glow', 64, [[0, 'rgba(255,255,255,0.9)'], [1, 'rgba(255,255,255,0)']]);
  fogTexture(scene, 'fog_a', 7);
  fogTexture(scene, 'fog_b', 19);
}
