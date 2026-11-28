/**
 * Briarholt-Kulissen, Runde 2 der Skript-Kulissen (tools/art/bh_kulissen/assets.py; Bilder docs/art/agent-runde2-briarholt/).
 * Läuft nach applyBriarholtKulisse über alle bh_-Karten (kalt und warm):
 * - Dächer: Die Dachfelder trugen bisher generische Vorratstexturen (future200: Kupfer, Schiefer, Ziegel, Basalt) ohne Kanten,
 *   die oberste Reihe nur halbtransparent. Jetzt kommen sie aus eigenen Briarholt-Dachsätzen mit First, Traufe, Giebelkanten,
 *   Ecken und Einzelstücken (Lüfter, Schornstein, Dachfenster, Wurzelknoten); kalte Karten mit Reif (Zeile 0), warme ohne (Zeile 1).
 * - Innenräume: geliehene Stücke aus anderen Vierteln werden an Ort und Stelle getauscht (gleiches Feld, gleiche Kollision),
 *   dazu wenige neue Stücke, fest nur, wenn danach alles erreichbar bleibt.
 */
import { erreichbarMit } from './briarholtKulisse.js';

/** Vorratstextur → eigener Dachsatz (public/sprites/props/bhk_dach_*.png, 11 Kacheln je Zeile). */
export const BH_DACH_ERSATZ = { bhd_kupfer: 'bhk_dach_kupfer', bhd_schiefer: 'bhk_dach_schiefer', bhd_ziegel: 'bhk_dach_ziegel', bhd_basalt: 'bhk_dach_basalt' };
export const DACH_FRAMES = ['innen_a', 'innen_b', 'innen_detail', 'oben', 'unten', 'links', 'rechts', 'oben_links', 'oben_rechts', 'unten_links', 'unten_rechts'];

/** Je Innenraum (beide Fassungen): tausch = [altes Sprite, neues Sprite, Frame, Versatz x in px (optional)]; dazu = neue Stücke [Sprite, x, y, { frame, fest: [b, h] }]. */
export const BH_INNEN = {
  bh_labor: { tausch: [['bhp_wurzelkranz_pumpenrad', 'bhk_laborregal', 0]], dazu: [['bhk_labortisch', 17, 9, { fest: [40, 10] }]] },
  bh_mutterhaus: { tausch: [['bhp_stillenhaeuser_teewagen', 'bhk_planschrank', 0], ['bhp_stillenhaeuser_kinderzeichnung', 'bhk_rollenstaender', 0]] },
  bh_aktenraum: { dazu: [['bhk_aktenschrank', 11, 2, { frame: 0, fest: [26, 10] }], ['bhk_aktenschrank', 18, 2, { frame: 1, fest: [26, 10] }], ['bhk_aktenschrank', 21, 9, { frame: 0, fest: [26, 10] }]] },
  // die Stapel sind breiter als die Kohlenkisten: 12 px nach rechts, damit sie nicht über den Bänken liegen (Feld und Kollision bleiben)
  // Runde 4: Laternen je Viertel statt der Promenaden-Gaslaterne, Probenkisten statt Kohlenkisten, Gepäck statt Kohlenkisten am Kutschenhof
  bh_glasgaerten: { tausch: [['bhp_promenade_gaslaterne', 'bhk_glashauslaterne', 0]] },
  bh_kesselgrund: { tausch: [['bhp_promenade_gaslaterne', 'bhk_rohrlaterne', 0]] },
  bh_wurzelkranz: { tausch: [['bhp_promenade_gaslaterne', 'bhk_rohrlaterne', 0], ['bhp_kesselgrund_kiste', 'bhk_probenkiste', 0]] },
  bh_stillenhaeuser: { tausch: [['bhp_promenade_gaslaterne', 'bhk_stillenlaterne', 0]] },
  bh_wurzelkammer: { tausch: [['bhp_kesselgrund_kiste', 'bhk_probenkiste', 0]] },
  bh_kutschenhof: { tausch: [['bhp_kesselgrund_kiste', 'bhk_gepaeckstapel', 0, 12]] },
  bh_kutschenhalle: { tausch: [['bhp_kesselgrund_kiste', 'bhk_gepaeckstapel', 0, 12]] },
};

function hash2(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/** Kachel eines Dachfelds nach seinen Nachbarn (dach(x, y) = ist auch Dachfeld). */
export function dachFrame(dach, x, y, warm) {
  const o = !dach(x, y - 1);
  const u = !o && !dach(x, y + 1);
  const l = !dach(x - 1, y);
  const r = !l && !dach(x + 1, y);
  let name;
  if (o || u) name = (o ? 'oben' : 'unten') + (l ? '_links' : r ? '_rechts' : '');
  else if (l || r) name = l ? 'links' : 'rechts';
  else {
    const h = hash2(x, y, 611);
    name = h < 0.07 ? 'innen_detail' : h < 0.42 ? 'innen_b' : 'innen_a';
  }
  return DACH_FRAMES.indexOf(name) + (warm ? DACH_FRAMES.length : 0);
}

function daecher(m, warm) {
  const felder = new Set();
  for (const d of m.decor ?? []) if (BH_DACH_ERSATZ[d.sprite]) felder.add(d.tile[0] + ',' + d.tile[1]);
  const dach = (x, y) => felder.has(x + ',' + y);
  for (const d of m.decor ?? []) {
    const neu = BH_DACH_ERSATZ[d.sprite];
    if (!neu) continue;
    d.sprite = neu;
    d.frame = dachFrame(dach, d.tile[0], d.tile[1], warm);
    d.alpha = 1;
    d.kulisse = 'bh2';
  }
}

function innen(m, plan) {
  for (const [alt, neu, frame, dx = 0] of plan.tausch ?? []) {
    for (const d of m.decor ?? []) {
      if (d.sprite !== alt) continue;
      Object.assign(d, { sprite: neu, frame, origin: [0.5, 1], offset: [dx, 8], ysort: true, alpha: 1, kulisse: 'bh2', getauscht: alt });
    }
  }
  if (!plan.dazu?.length) return;
  const W = m.rows[0].length;
  const H = m.rows.length;
  const key = (x, y) => x + ',' + y;
  const boden = (x, y) => '.swg'.includes(m.rows[y]?.[x] ?? 'I');
  const objekte = [...(m.interactables ?? []).map((i) => i.tile), ...(m.npcs ?? []).map((n) => n.tile), ...Object.values(m.spawns ?? {})];
  const nah = new Set();
  for (const [x, y] of objekte) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) nah.add(key(x + dx, y + dy));
  const belegt = new Set((m.decor ?? []).filter((d) => d.ysort || d.solid).map((d) => key(...d.tile)));
  const fest = new Set((m.decor ?? []).filter((d) => d.solid).map((d) => key(...d.tile)));
  for (const [sprite, wx, wy, o = {}] of plan.dazu) {
    const kand = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) kand.push([wx + dx, wy + dy, Math.abs(dx) + Math.abs(dy)]);
    kand.sort((a, b) => a[2] - b[2]);
    const ziel = kand.find(([x, y]) => boden(x, y) && !nah.has(key(x, y)) && !belegt.has(key(x, y)));
    if (!ziel) continue;
    const [x, y] = ziel;
    const d = { sprite, frame: o.frame ?? 0, tile: [x, y], offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true, kulisse: 'bh2' };
    if (o.fest && erreichbarMit(m, { W, H, boden, fest, neu: [key(x, y)] })) {
      d.solid = [o.fest[0], o.fest[1], 0, -3];
      fest.add(key(x, y));
    }
    belegt.add(key(x, y));
    m.decor.push(d);
  }
}

export function applyBriarholtKulisse2(content) {
  for (const m of Object.values(content.maps ?? {})) {
    if (m.city !== 'briarholt' || !m.id.startsWith('bh_')) continue;
    daecher(m, m.tiles?.endsWith('_warm'));
    const plan = BH_INNEN[m.id.replace(/__warm$/, '')];
    if (plan) innen(m, plan);
  }
}
