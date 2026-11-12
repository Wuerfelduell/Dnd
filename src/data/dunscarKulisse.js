/**
 * Dunscar-Kulisse (Seb 2026-11-12: „Dunscar besser machen“, vorher undurchsichtig).
 *
 * Die Außenkarten von Paket AS waren leere Kästen: alle Ausgänge lagen unsichtbar in einer Reihe unten links,
 * jede Ankunft landete am selben Fleck, und die fertigen Requisiten aus Paket AV (props/ds_*.png) wurden nie eingebaut.
 * Hier, ohne die Kartendateien anzufassen:
 *  1. Ausgänge liegen am Kartenrand in der Himmelsrichtung, in der das Ziel auf der Stadtkarte liegt; Häuser haben ihre Tür
 *     an der Nordwand mit Fassade. Jeder Ausgang trägt ein Schild (`label`) und eine Laterne.
 *  2. Wer durch eine Tür kommt, steht an der Tür, die zurückführt (Spawn `von_<karte>`), nicht immer unten links.
 *  3. Je Viertel Requisiten, Gleise und Lampen, damit man die Viertel auseinanderhält.
 */
import { DS_KULISSE } from './dunscarKulisseDaten.js';

/** Stadtkarten-Pins (k3_orte/city.json) plus Orte ohne eigenen Pin. */
const EXTRA_PINS = { ds_letzter_bahnsteig: [440, 150] };
const PIN_W = 480;
const PIN_H = 270;
const ARROW = { W: '← ', E: '', N: '↑ ', S: '↓ ' };
const ARROW_END = { E: ' →' };
/** Fassade vor der Haustür, je Ziel. */
const FASSADE = {
  ds_teesaal: 'dsp_kalkmarkt_tea_room_facade', ds_pruefhaus: 'dsp_bruchsignal_sound_testing_house_facade', ds_runddepot: 'dsp_schwellenring_roundhouse_doors',
  ds_lohnbuero: 'dsp_arbeiterbogen_limestone_doorway', ds_speisewagen: 'dsp_arbeiterbogen_limestone_doorway',
};

const key = (x, y) => `${x},${y}`;
const isFloor = (m, x, y) => /[.swg]/.test(m.rows[y]?.[x] ?? '');

/** Alles, worauf keine Tür, Requisite oder Laterne stehen soll. */
function besetzt(m) {
  const s = new Set();
  const add = (t) => t && s.add(key(t[0], t[1]));
  for (const o of [...(m.npcs ?? []), ...(m.interactables ?? []), ...(m.roamers ?? [])]) add(o.tile);
  for (const p of m.patrols ?? []) for (const t of p.route ?? []) add(t);
  for (const t of Object.values(m.spawns ?? {})) add(t);
  return s;
}

/** Freie Bodenkachel am Rand `side`, möglichst nahe an `want` (0..1 entlang der Kante), Abstand ≥ 4 zu `used`. */
function randplatz(m, side, want, taken, used, haus = false) {
  const W = m.rows[0].length;
  const H = m.rows.length;
  const cands = [];
  if (side === 'W' || side === 'E') {
    const x = side === 'W' ? 1 : W - 2;
    for (let y = 2; y < H - 2; y++) cands.push([x, y, Math.abs(y - (1 + want * (H - 3)))]);
  } else {
    const y = side === 'N' ? (haus ? 4 : 1) : H - 2;
    for (let x = 3; x < W - 3; x++) cands.push([x, y, Math.abs(x - (1 + want * (W - 3)))]);
  }
  cands.sort((a, b) => a[2] - b[2]);
  for (const [x, y] of cands) {
    if (!isFloor(m, x, y) || taken.has(key(x, y))) continue;
    // Platz zum Davorstehen (Richtung Kartenmitte) und keine Nachbartür
    const [ix, iy] = side === 'W' ? [x + 1, y] : side === 'E' ? [x - 1, y] : side === 'N' ? [x, y + 1] : [x, y - 1];
    if (!isFloor(m, ix, iy) || taken.has(key(ix, iy))) continue;
    if (haus && [-1, 0, 1].some((dx) => [1, 2, 3].some((dy) => !isFloor(m, x + dx, y - dy) || taken.has(key(x + dx, y - dy))))) continue;
    if (used.some(([ux, uy]) => Math.abs(ux - x) + Math.abs(uy - y) < 5)) continue;
    return [x, y, ix, iy];
  }
  return null;
}

/** Seite und Lage entlang der Kante aus den Stadtkarten-Pins. */
function richtung(pins, from, to) {
  const a = pins[from];
  const b = pins[to];
  if (!a || !b) return null;
  const dx = (b[0] - a[0]) / PIN_W;
  const dy = (b[1] - a[1]) / PIN_H;
  const clamp = (v) => Math.max(0.08, Math.min(0.92, v));
  if (Math.abs(dx) >= Math.abs(dy)) return { side: dx < 0 ? 'W' : 'E', want: clamp(0.5 + dy / (2 * Math.abs(dx) || 1)) };
  return { side: dy < 0 ? 'N' : 'S', want: clamp(0.5 + dx / (2 * Math.abs(dy) || 1)) };
}

const istAussen = (m) => m?.id?.startsWith('ds_') && m.rows?.[0]?.length >= 40;

export function applyDunscarKulisse(content) {
  const pins = { ...(content.travelRules?.cities?.dunscar?.pins ?? {}), ...EXTRA_PINS };
  const maps = content.maps;
  const ids = Object.keys(maps).filter((id) => istAussen(maps[id]));
  for (const id of ids) {
    const m = (maps[id] = { ...maps[id], interactables: [...(maps[id].interactables ?? [])], decor: [...(maps[id].decor ?? [])], lights: [...(maps[id].lights ?? [])], spawns: { ...(maps[id].spawns ?? {}) } });
    const taken = besetzt(m);
    const used = [];
    // Reisepunkt (Stadtkarte) bleibt, bekommt aber Schild und Licht
    m.interactables = m.interactables.map((d) => {
      if (d.kind === 'travel') {
        used.push(d.tile);
        m.lights.push({ tile: d.tile, radius: 46, intensity: 0.55, color: '#ffc782', flicker: 0.08 });
        return { ...d, label: 'Stadtkarte', marker: true };
      }
      if (d.kind !== 'door' || !maps[d.to]) return d;
      const ziel = maps[d.to];
      const name = ziel.name ?? d.to;
      if ((d.spawn ?? 'default') !== 'default') return { ...d, label: name }; // Steg o. Ä.: eigener Ankunftsplatz, bleibt wo er ist
      const haus = !istAussen(ziel);
      const r = haus ? { side: 'N', want: 0.25 + 0.5 * ((used.length * 0.37) % 1) } : richtung(pins, id, d.to) ?? { side: 'S', want: 0.5 };
      taken.delete(key(...d.tile));
      const p = randplatz(m, r.side, r.want, taken, used, haus) ?? randplatz(m, 'S', 0.5, taken, used);
      if (!p) { taken.add(key(...d.tile)); return { ...d, label: name }; }
      const [x, y, ix, iy] = p;
      taken.add(key(x, y));
      taken.add(key(ix, iy));
      used.push([x, y]);
      m.spawns[`von_${d.to}`] = [ix, iy];
      if (haus) {
        const f = FASSADE[d.to];
        if (f) m.decor.push({ sprite: f, tile: [x, y], offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true });
        m.lights.push({ tile: [x, y], radius: 40, intensity: 0.6, color: '#ffc782', flicker: 0.1 });
      } else {
        m.lights.push({ tile: [x, y], radius: 52, intensity: 0.7, color: '#ffc782', glow: 0.2, flicker: 0.1 });
      }
      const label = `${ARROW[r.side]}${name}${ARROW_END[r.side] ?? ''}`;
      return { ...d, tile: [x, y], label, marker: true };
    });
    for (const t of used) taken.add(key(...t));
    kulisse(m, DS_KULISSE[id], taken);
  }
  // Rückweg: wer aus Karte A nach B geht, steht in B an der Tür, die nach A zurückführt (B.spawns.von_A)
  for (const [id, m] of Object.entries(maps)) {
    if (!id.startsWith('ds_')) continue;
    let changed = false;
    const inter = (m.interactables ?? []).map((d) => {
      if (d.kind !== 'door' || (d.spawn ?? 'default') !== 'default' || !maps[d.to]?.spawns?.[`von_${id}`]) return d;
      changed = true;
      return { ...d, spawn: `von_${id}` };
    });
    if (changed) maps[id] = { ...m, interactables: inter };
  }
}

/**
 * Requisiten, Bodenzeichen und Lampen eines Viertels.
 * `props`: [sprite, x, y, { solid, light }] – große Bilder (64x64, Fuß unten), werden übersprungen, wenn ihre Grundfläche belegt ist.
 * `reihen`/`spalten`: Bodenzellen aus einem Tileset als Linie (Gleise, Bahnsteigkanten).
 * `lampen`: Gaslaternen mit Licht.
 */
function kulisse(m, k, taken) {
  if (!k) return;
  const W = m.rows[0].length;
  const H = m.rows.length;
  const frei = (x, y) => isFloor(m, x, y) && !taken.has(key(x, y));
  for (const [sheet, frame, y, x0 = 1, x1 = W - 2] of k.reihen ?? []) {
    for (let x = x0; x <= x1; x++) if (isFloor(m, x, y)) m.decor.push({ sprite: sheet, frame, tile: [x, y], alpha: 1, depth: 40 });
  }
  for (const [sheet, frame, x, y0 = 1, y1 = H - 2] of k.spalten ?? []) {
    for (let y = y0; y <= y1; y++) if (isFloor(m, x, y)) m.decor.push({ sprite: sheet, frame, tile: [x, y], alpha: 1, depth: 40 });
  }
  for (const [sheet, frame, x, y] of k.zellen ?? []) if (isFloor(m, x, y)) m.decor.push({ sprite: sheet, frame, tile: [x, y], alpha: 1, depth: 40 });
  for (const [sprite, x, y, opt = {}] of k.props ?? []) {
    // Grundfläche 3x1 am Fuß, Bild reicht 4 Kacheln nach oben; nichts davon darf auf einem Spielobjekt liegen
    const foot = [[x - 1, y], [x, y], [x + 1, y]];
    const bild = [-1, 0, 1].flatMap((dx) => [1, 2, 3].map((dy) => [x + dx, y - dy]));
    if (!foot.every(([fx, fy]) => frei(fx, fy)) || bild.some(([bx, by]) => taken.has(key(bx, by)))) continue;
    for (const [fx, fy] of foot) taken.add(key(fx, fy));
    m.decor.push({ sprite, tile: [x, y], offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true, ...(opt.solid ? { solid: [40, 8, 0, -4] } : {}), ...(opt.anim ? { anim: opt.anim } : {}) });
    if (opt.light) m.lights.push({ tile: [x, y - 2], radius: 50, intensity: 0.6, color: opt.light, flicker: 0.08 });
  }
  // Streugut: einzelne Bodenzellen (Schutt, Kalkpfützen, Nebelschwaden), fest je Kachel ausgewürfelt
  for (const [sheet, frames, anteil] of k.streu ?? []) {
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const r = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + frames[0] * 3.7) * 43758.5453) % 1;
      if (r < anteil && frei(x, y)) m.decor.push({ sprite: sheet, frame: frames[Math.floor(r * 1000) % frames.length], tile: [x, y], alpha: 1, depth: 40 });
    }
  }
  for (const [x, y] of k.lampen ?? []) {
    if (!frei(x, y)) continue;
    taken.add(key(x, y));
    m.decor.push({ sprite: 'dsp_endbahnhof_gas_lantern', tile: [x, y], offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true, solid: [8, 6, 0, -3] });
    m.lights.push({ tile: [x, y - 2], radius: 70, intensity: 0.8, color: '#ffb860', glow: 0.25, flicker: 0.1 });
  }
}
