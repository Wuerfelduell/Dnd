/**
 * Je fünf Requisiten für Dunscar und Briarholt (tools/art/ds_bh_kulissen/assets.py; Bilder docs/art/agent-dunscar-briarholt/).
 * Dunscar: Die Klötze im Klopfbruch (3x3 und 3x2, bisher Felsnasen aus Wandzellen) werden zu Kalkbrechern und Kalkkarren (Feld Y, fest wie vorher);
 * dazu Prellböcke an den Gleisenden, Läutewerke in Rufschlucht und Rangierwüste, Schlackenkübel in der Schlackengrube (leerste Gebiete).
 * Briarholt: siehe briarholtKulisse2.js (Laternen je Viertel, Probenkisten), hier nur die Wärmeschalen auf der Winterpromenade.
 * Neue Stücke stehen nur auf freiem Boden mit Abstand zu Objekten, Türen und Figuren; fest nur, wenn danach alles erreichbar bleibt.
 */
import { erreichbarMit } from './briarholtKulisse.js';
import { klotze } from './calderwickKlotze.js';

export const DS_BH_SPRITES = { dsk_kalkbrecher: [48, 48], dsk_kalkkarren: [48, 32], dsk_prellbock: [32, 32], dsk_laeutewerk: [24, 48], dsk_schlackenkuebel: [48, 40],
  bhk_glashauslaterne: [16, 48], bhk_rohrlaterne: [16, 48], bhk_stillenlaterne: [16, 48], bhk_probenkiste: [32, 32], bhk_waermeschale: [32, 32] };

export const DS_KLOTZ_PLAN = { ds_klopfbruch: { '3x3': 'dsk_kalkbrecher', '3x2': 'dsk_kalkkarren' } };

const GLUT = '#ff9a4a';
/** Neue Stücke auf freien Flächen: [Karte, Sprite, Anzahl, { fest: [b, h], licht, tiles (feste Plätze statt Suche) }]. */
export const DS_BH_DAZU = [
  // Prellböcke an den Gleisenden (Gleisdeko dst_bahn, Endstücke bei x=2 und x=41, Reihen 18-19)
  ['ds_endbahnhof', 'dsk_prellbock', 2, { fest: [24, 8], tiles: [[2, 19], [41, 19]] }],
  ['ds_letzter_bahnsteig', 'dsk_prellbock', 2, { fest: [24, 8], tiles: [[2, 19], [41, 19]] }],
  ['ds_runddepot', 'dsk_prellbock', 1, { fest: [24, 8] }],
  ['ds_rufschlucht', 'dsk_laeutewerk', 3, { fest: [10, 6] }],
  ['ds_rangierwueste', 'dsk_laeutewerk', 2, { fest: [10, 6] }],
  ['ds_schlackengrube', 'dsk_schlackenkuebel', 3, { fest: [36, 10], licht: { dy: -34, radius: 56, intensity: 0.85, color: GLUT } }],
  ['bh_winterpromenade', 'bhk_waermeschale', 3, { fest: [20, 8], licht: { dy: -22, radius: 50, intensity: 0.8, color: GLUT } }],
  ['bh_winterpromenade__warm', 'bhk_waermeschale', 3, { fest: [20, 8], licht: { dy: -22, radius: 50, intensity: 0.8, color: GLUT } }],
];

function hash2(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/** Klopfbruch: Klötze zu Y mit Requisit (vor applyDunscarKulisse, damit sie keine Felsnasen mehr bekommen). */
export function applyDunscarKlotze(content) {
  for (const [id, plan] of Object.entries(DS_KLOTZ_PLAN)) {
    const m = content.maps?.[id];
    if (!m?.rows) continue;
    const rows = m.rows.map((r) => [...r]);
    m.decor ??= [];
    for (const k of klotze(m.rows)) {
      const sprite = plan[(k.x1 - k.x0 + 1) + 'x' + (k.y1 - k.y0 + 1)];
      if (!sprite) continue;
      for (let y = k.y0; y <= k.y1; y++) for (let x = k.x0; x <= k.x1; x++) rows[y][x] = 'Y';
      const cx = ((k.x0 + k.x1 + 1) / 2) * 16;
      m.decor.push({ sprite, tile: [k.x0, k.y1], offset: [cx - (k.x0 * 16 + 8), 8], origin: [0.5, 1], alpha: 1, ysort: true, kulisse: 'dsbh', block: [k.x0, k.y0, k.x1, k.y1] });
    }
    m.rows = rows.map((r) => r.join(''));
  }
}

/** Freie Plätze: Boden, zwei Felder Abstand zu Objekten/Figuren/Spawns/Gegnern, ein Feld zu Wänden und festen Stücken, untereinander verteilt. */
export function freiePlaetze(m, n, abstand = 8, seed = 0) {
  const W = m.rows[0].length;
  const H = m.rows.length;
  const boden = (x, y) => '.swgc,'.includes(m.rows[y]?.[x] ?? 'I');
  const objekte = [...(m.interactables ?? []).map((i) => i.tile), ...(m.npcs ?? []).map((q) => q.tile), ...Object.values(m.spawns ?? {}), ...(m.roamers ?? []).map((r) => r.tile)].filter(Boolean);
  // Requisiten, feste Stücke und flache Deko auf hoher Ebene (Haufen, Dächer; Bodenstreu liegt tiefer)
  const besetzt = (m.decor ?? []).filter((d) => d.ysort || d.solid || (d.depth ?? 50) >= 30).map((d) => d.tile);
  const kand = [];
  for (let y = 3; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    if (!boden(x, y)) continue;
    if (objekte.some(([a, b]) => Math.abs(a - x) <= 2 && Math.abs(b - y) <= 2)) continue;
    if (besetzt.some(([a, b]) => Math.abs(a - x) <= 1 && Math.abs(b - y) <= 1)) continue;
    let ok = true;
    for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) if (!boden(x + dx, y + dy)) { ok = false; break; }
    if (ok) kand.push([x, y, hash2(x, y, 700 + seed)]);
  }
  kand.sort((a, b) => a[2] - b[2]);
  const out = [];
  for (const [x, y] of kand) {
    if (out.length >= n) break;
    if (out.every(([a, b]) => Math.abs(a - x) + Math.abs(b - y) >= abstand)) out.push([x, y]);
  }
  return out;
}

/** Nach allen Kulissen: Stücke auf freie Flächen. */
export function applyDsBhDazu(content) {
  for (const [id, sprite, n, o] of DS_BH_DAZU) {
    const m = content.maps?.[id];
    if (!m?.rows) continue;
    m.decor ??= [];
    const W = m.rows[0].length;
    const H = m.rows.length;
    const boden = (x, y) => '.swgc,'.includes(m.rows[y]?.[x] ?? 'I');
    const fest = new Set(m.decor.filter((d) => d.solid).map((d) => d.tile[0] + ',' + d.tile[1]));
    const objekte = new Set([...(m.interactables ?? []).map((i) => i.tile + ''), ...(m.npcs ?? []).map((q) => q.tile + ''), ...Object.values(m.spawns ?? {}).map(String)]);
    const plaetze = o.tiles ? o.tiles.filter(([x, y]) => boden(x, y) && !objekte.has(x + ',' + y)) : freiePlaetze(m, n, 8, sprite.length);
    for (const [x, y] of plaetze) {
      const d = { sprite, tile: [x, y], offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true, kulisse: 'dsbh' };
      if (o.licht) d.light = { flicker: 0.12, glow: 0.22, ...o.licht };
      if (o.fest && erreichbarMit(m, { W, H, boden, fest, neu: [x + ',' + y] })) {
        d.solid = [o.fest[0], o.fest[1], 0, -3];
        fest.add(x + ',' + y);
      }
      m.decor.push(d);
    }
  }
}
