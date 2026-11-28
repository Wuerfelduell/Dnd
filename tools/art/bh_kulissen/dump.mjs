// Löst Kacheln (tileIndexFor wie im Spiel) und Deko der Briarholt-Karten in Bildausschnitte auf (JSON auf stdout).
// node --import ./tools/art/bh_kulissen/stub/register.mjs tools/art/bh_kulissen/dump.mjs [karte ...]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { png } from './stub/canvas.mjs';
import { loadContent } from '../../../tests/helpers.js';
import { tileIndexFor } from '../../../src/world/WorldScene.js';
import { TILE_KEYS, createTextures, TILE } from '../../../src/world/textures.js';
import * as A from '../../../src/world/assets.js';

const c = loadContent();
// Prozedurale Texturen (Kettlegate-Kacheln, Stände, Laternen …) wie im Spiel erzeugen, als PNG unter /tmp/proc ablegen
const store = new Map();
const scene = { textures: { exists: (k) => store.has(k), addCanvas: (k, cv) => { store.set(k, cv); return { add() {} }; }, addSpriteSheet: (k, cv) => store.set(k, cv), get: (k) => ({ getSourceImage: () => store.get(k) }) },
  cache: { json: { get: () => null, exists: () => false } }, anims: { exists: () => true, create() {} }, make: {}, add: {} };
try { createTextures(scene); } catch (e) { /* unvollständig ist für Vorschauen in Ordnung */ }
const PROC = '/tmp/proc';
mkdirSync(PROC, { recursive: true });
const procFile = (key, cv, rect) => { const f = PROC + '/' + key.replace(/[^a-z0-9_]/gi, '_') + '.png'; writeFileSync(f, png(cv, ...(rect ?? []))); return f; };
const ids = process.argv.slice(2);
const man = {};
const manifest = (key) => (man[key] ??= JSON.parse(readFileSync(new URL(`../../../public/sprites/manifest-${key.replace(/^manifest/, '').replace(/([a-z])([A-Z0-9])/g, '$1$2').toLowerCase()}.json`, import.meta.url), 'utf8')));
import { existsSync } from 'node:fs';
/** Manifest-Key → Datei: manifestTreffen → manifest-treffen.json, manifestFigurenNachzuegler → manifest-figuren_nachzuegler.json usw. */
function manifestDatei(key) {
  const rest = key.replace(/^manifest/, '');
  for (const name of [rest.toLowerCase(), rest.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase(), rest.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(), rest.replace(/^(\D+)(\d+)$/, '$1$2').toLowerCase()]) {
    const u = new URL(`../../../public/sprites/manifest-${name}.json`, import.meta.url);
    if (existsSync(u)) return u;
  }
  return null;
}
const MANIFEST_FILE = new Proxy({}, { get: (_, k) => manifestDatei(String(k)) });
const mf = (key) => (man[key] ??= JSON.parse(readFileSync(MANIFEST_FILE[key], 'utf8')));
const rect = (r) => (Array.isArray(r) ? r : [r.x, r.y, r.width ?? r.w, r.height ?? r.h]);

const welt = (() => { try { return JSON.parse(readFileSync(new URL('../../../public/sprites/manifest-welt.json', import.meta.url), 'utf8')); } catch { return null; } })();
function procTile(key) {
  const cv = store.get('tiles');
  const i = TILE_KEYS.indexOf(key);
  if (!cv || i < 0) return null;
  const cols = Math.floor(cv.width / TILE);
  return { file: procFile('tile_' + key, cv, [(i % cols) * TILE, Math.floor(i / cols) * TILE, TILE, TILE]), index: 0, base: null };
}
function cellOf(key) {
  const cell = A.TILE_CELLS[key];
  if (!cell) return procTile(key);
  const [sheet, index, base] = cell;
  if (typeof index === 'string') { // benannte Region aus manifest-welt.json
    const r = welt?.assets?.find((a) => a.file === A.SHEETS[sheet])?.regions?.[index];
    if (!r) return procTile(key);
    return { file: A.SHEETS[sheet], rectTile: [r.x, r.y], index: 0, base: base ? cellOf(base) : null };
  }
  return { file: A.SHEETS[sheet], index, base: base ? cellOf(base) : null };
}
function decorSrc(sprite, frame = 0) {
  if (A.PROP_CELLS?.[sprite]) { const [sheet, x, y, w, h] = A.PROP_CELLS[sprite]; return { file: A.SHEETS[sheet], rect: [x, y, w, h] }; }
  if (A.ANIM_SHEETS[sprite]) { const [file, w, h] = A.ANIM_SHEETS[sprite]; return { file, frame, w, h, grid: true }; }
  if (A.WHOLE_PROPS?.[sprite]) return { file: A.WHOLE_PROPS[sprite], rect: null };
  const prefixes = Object.keys(A.REGION_SHEETS).filter((p) => sprite.startsWith(p + '_')).sort((a, b) => b.length - a.length);
  for (const p of prefixes) {
    const [mk, id] = A.REGION_SHEETS[p];
    if (!MANIFEST_FILE[mk]) continue;
    const def = mf(mk).assets.find((a) => a.id === id);
    const name = sprite.slice(p.length + 1);
    const regions = Array.isArray(def.regions) ? Object.fromEntries(def.regions.map((r) => [r.name, r])) : def.regions ?? {};
    if (regions[name]) return { file: A.SHEETS[p], rect: rect(regions[name]) };
    const an = def.regionAnimations?.[name] ?? def.animations?.[name];
    if (an) {
      const f0 = (an.regions ?? an.frames)[0];
      if (typeof f0 === 'string') return { file: A.SHEETS[p], rect: rect(regions[f0]) };
      if (typeof f0 === 'number') { return { file: A.SHEETS[p], grid16: f0, w: an.frameWidth ?? 16, h: an.frameHeight ?? 16 }; }
      return { file: A.SHEETS[p], rect: rect(f0) };
    }
  }
  return null;
}
const out = {};
for (const [id, m] of Object.entries(c.maps)) {
  if (ids.length ? !ids.includes(id) : m.city !== 'briarholt') continue;
  const tiles = m.rows.map((row, y) => [...row].map((_, x) => { const i = tileIndexFor(m.rows, x, y, m.tiles, m.facade ?? null); return TILE_KEYS[i]; }));
  const cells = {};
  for (const k of new Set(tiles.flat())) cells[k] = cellOf(k);
  const decor = (m.decor ?? []).map((d) => {
    let src = decorSrc(d.sprite, d.frame ?? 0);
    if (!src && store.has(d.sprite)) { const cv = store.get(d.sprite); src = { file: procFile(d.sprite, cv), rect: null }; }
    return { ...d, src };
  });
  out[id] = { rows: m.rows, tiles, cells, decor, origins: Object.fromEntries(decor.map((d) => [d.sprite, A.PROP_ORIGINS[d.sprite] ?? null])) };
}
console.log(JSON.stringify(out));
