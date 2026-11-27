/**
 * Kettlegate-Feinschliff (Seb 2026-11-27: „manche Orte zu crowded und vollgemüllt, manche sehr leer, das muss mehr harmonieren“).
 * Läuft nach allen Kettlegate-Paketen über die Karten der ersten Stadt und gleicht die Dichte aus:
 * - überladene Orte: lose Kleinteile und Möbel mitten im Weg fallen weg, Stapel werden auseinandergezogen,
 *   die Einwohner (kgl_e_*), die die Pakete alle in die oberste Straßenreihe gestellt hatten, verteilen sich über Platz und Ufer;
 * - der Nachtmarkt bekommt zehn Felder mehr Gasse nach Osten, damit Stände, Feuerkörbe und Leute Luft haben;
 * - leere Orte (Gaskanäle, Schlachthof, Hafenmeisterei, Ankerhof, Gießerei, Südseite Nordtor, Hinterhof Ashgrove, Ebbas Kapelle, Altmarkt-Platz)
 *   bekommen Requisiten aus den vorhandenen Kettlegate-Blättern, mit Licht, wo es passt.
 * Die Bodenstreu der Jahreszeit (Feste.js) ist in Kettlegate dünner gesät (KETTLEGATE_STREU).
 * Neue Stücke stehen nur auf freiem Boden, nie auf oder direkt neben einem Objekt, einer Figur oder einem Spawn;
 * feste Stücke blockieren nur, wenn danach alles erreichbar bleibt.
 */
import { erreichbarMit } from './briarholtKulisse.js';

/** Anteil der Bodenfelder ohne Jahreszeiten-Streu: Kettlegate 99 % (vorher wie überall 95,5 %). */
export const KETTLEGATE_STREU = 0.99;

export const BODEN = new Set(['.', ',', 'g', 'P', 's', 'w', 'p', 'c', '=']);
const LAMPE = '#ffb060';
const GAS = '#9fe0a0';
const steh = (sprite, x, y, o = {}) => ({ sprite, x, y, ...o });

/**
 * Je Karte: weg = Deko [Sprite, x, y] entfernen; schieb = Deko [Sprite, [x, y], [nx, ny]] versetzen;
 * figuren = [id, [altX, altY], [x, y]] versetzen; dazu = neue Requisiten (fest = [b, h] Blocker, licht, flach = am Boden, wasser = Boot auf dem Kanal).
 */
export const KETTLEGATE_PLAN = {
  altmarkt: {
    figuren: [['kgl_e_laternenanzuender', [24, 4], [21, 12]], ['kgl_e_zeitungsjunge', [27, 4], [34, 20]], ['kgl_e_kutscher', [42, 4], [41, 12]],
      ['kgl_e_waescherin', [50, 4], [46, 18]], ['kgl_e_nachtwaechter', [40, 5], [22, 19]]],
    dazu: [
      steh('d_uhrturm_bench', 26, 19), steh('d_uhrturm_bench', 30, 11),
      steh('d_strassenmoebel_penny_farthing', 11, 15, { fest: [12, 6] }),
      steh('d_strassenmoebel_sandwich_board', 45, 14),
      steh('d_strassenmoebel_horse_trough', 9, 18, { fest: [24, 8] }),
      steh('veg_crate', 15, 22), steh('d_nordtor_props_salt_barrels', 52, 16, { fest: [14, 8] }),
      steh('lamp_lit', 38, 15, { licht: { dy: -36, radius: 70, intensity: 0.9, color: LAMPE } }),
      steh('lamp_lit', 17, 15, { licht: { dy: -36, radius: 70, intensity: 0.9, color: LAMPE } }),
    ],
  },
  nachtmarkt: {
    breiter: 10,
    figuren: [['kgl_e_waescherin', [20, 4], [33, 6]], ['schleierbote', [27, 5], [36, 6]], ['wahrsagerin', [9, 5], [9, 6]]],
    schieb: [['brazier', [9, 5], [5, 7]], ['brazier', [24, 6], [30, 7]]],
    dazu: [
      steh('market_lanterns', 34, 2, { flach: true }), steh('crate_stack', 38, 3), steh('barrels_stacked', 31, 3),
      steh('brazier', 37, 8, { licht: { dy: -8, radius: 56, intensity: 0.9, color: LAMPE } }),
    ],
  },
  ashgrove: {
    figuren: [['kgl_e_zeitungsjunge', [18, 4], [16, 14]], ['kgl_e_schornsteinfegerin', [21, 4], [33, 15]],
      ['kgl_e_leichenwaescherin', [36, 4], [30, 22]], ['kgl_e_bettler', [39, 4], [45, 15]]],
    dazu: [
      steh('d_elend_props_oil_drum_fire', 36, 24, { fest: [12, 6], licht: { dy: -10, radius: 60, intensity: 0.9, color: LAMPE } }),
      steh('d_wohnung_rocking_chair', 40, 25), steh('d_elend_props_laundry', 53, 25),
      steh('crate_stack', 61, 21, { fest: [14, 8] }), steh('barrels_stacked', 27, 25, { fest: [14, 8] }),
      steh('d_strassenmoebel_handcart', 44, 21), steh('d_wohnung_washstand', 25, 21),
      steh('d_strassenmoebel_milk_churns', 8, 15), steh('d_strassenmoebel_bollard', 50, 14, { fest: [8, 6] }),
    ],
  },
  nordtor: {
    figuren: [['kgl_e_kutscher', [17, 4], [12, 9]], ['kgl_e_uhrlehrling', [20, 4], [32, 8]], ['kgl_e_bettler', [23, 4], [15, 21]], ['kgl_e_nachtwaechter', [26, 4], [44, 18]]],
    dazu: [
      steh('d_strassenmoebel_bollard', 29, 17, { fest: [8, 6] }), steh('d_strassenmoebel_bollard', 34, 17, { fest: [8, 6] }),
      steh('d_elend_props_water_pump', 11, 21, { fest: [10, 6] }), steh('d_strassenmoebel_milk_churns', 13, 23),
      steh('d_strassenmoebel_sandwich_board', 27, 23), steh('d_uhrturm_bench', 40, 23),
      steh('crate_stack', 61, 20, { fest: [14, 8] }), steh('d_strassenmoebel_handcart', 9, 17),
    ],
  },
  docks: {
    figuren: [['kgl_e_fischweib', [5, 4], [18, 7]]],
    dazu: [steh('d_bruecken_rowboat', 31, 12, { flach: true, wasser: true })],
  },
  ankerhof: {
    dazu: [
      steh('barrels_stacked', 8, 6, { fest: [14, 8] }), steh('crate_stack', 24, 6, { fest: [14, 8] }),
      steh('d_bruecken_winch', 13, 8), steh('d_nordtor_props_salt_barrels', 20, 7),
      steh('d_bruecken_rowboat', 15, 10, { flach: true, wasser: true }), steh('d_bruecken_narrowboat', 24, 11, { flach: true, wasser: true }),
      steh('d_strassenmoebel_bollard', 4, 7, { fest: [8, 6] }), steh('d_strassenmoebel_bollard', 28, 7, { fest: [8, 6] }),
    ],
  },
  ebba: {
    figuren: [['kgl_e_leichenwaescherin', [13, 4], [10, 9]]],
    dazu: [
      steh('g_katakomben_props_candelabra', 17, 3, { licht: { dy: -12, radius: 46, intensity: 0.8, color: LAMPE } }),
      steh('g_katakomben_props_candelabra', 22, 3, { licht: { dy: -12, radius: 46, intensity: 0.8, color: LAMPE } }),
      steh('b_grab_urne', 14, 7), steh('g_katakomben_props_offering', 24, 8),
      steh('b_grab_grabstein', 34, 18), steh('b_grab_kreuz', 37, 12),
    ],
  },
  gaskanaele: {
    dazu: [
      steh('d_gaswerk_props_leaking_pipe', 22, 4), steh('d_gaswerk_props_valve', 44, 4), steh('d_gaswerk_props_pressure_gauge', 33, 4),
      steh('d_gaswerk_props_shovels_coal', 12, 8), steh('d_elend_props_rat_hole', 33, 8), steh('d_gaswerk_props_gas_canisters', 24, 8),
      steh('d_elend_props_junk', 18, 9), steh('d_elend_props_rat_hole', 22, 10),
      steh('lamp_lit', 6, 6, { licht: { dy: -36, radius: 60, intensity: 0.7, color: GAS } }),
      steh('lamp_lit', 27, 6, { licht: { dy: -36, radius: 60, intensity: 0.7, color: GAS } }),
    ],
  },
  schlachthof: {
    dazu: [
      steh('i_rost_hanging_chains', 13, 3), steh('i_rost_hook_rack', 18, 3), steh('i_rost_hanging_chains', 24, 3),
      steh('b_revier_eimer', 18, 9), steh('d_elend_props_water_pump', 27, 11, { fest: [10, 6] }),
      steh('crate_stack', 3, 11, { fest: [14, 8] }), steh('barrels_stacked', 27, 5, { fest: [14, 8] }),
      steh('i_rost_sacks', 22, 11), steh('i_rost_water_casks', 6, 8),
    ],
  },
  hafenmeisterei: {
    dazu: [steh('d_wohnung_coal_scuttle', 2, 4), steh('b_moebel_globus', 12, 4), steh('d_wohnung_rug', 9, 6, { flach: true }), steh('i_rost_rope_coil', 15, 8)],
  },
  giesserei: {
    dazu: [
      steh('j_giesserei_props_sand_sacks', 30, 15), steh('j_giesserei_props_coal_heap', 3, 15), steh('j_giesserei_props_bronze_ingots', 9, 13),
      steh('d_gaswerk_props_coal_cart', 18, 14, { fest: [20, 8] }), steh('i_rost_anvil', 29, 13), steh('j_giesserei_props_mould', 12, 4),
    ],
  },
  pestgassen: {
    // Gefahrengebiet bleibt dreckig, aber nicht jede Ecke mit Flaschen, Nestern und Masken
    weg: [['g_pestgassen_props_bottles', 54, 16], ['g_pestgassen_props_bottles', 14, 27], ['g_pestgassen_props_bottles', 1, 31],
      ['g_pestgassen_props_nest', 55, 1], ['g_pestgassen_props_nest', 22, 1], ['g_pestgassen_props_nest', 39, 22],
      ['g_pestgassen_props_mask', 16, 36], ['g_pestgassen_props_mask', 45, 34], ['g_pestgassen_props_board', 3, 1], ['g_pestgassen_props_board', 18, 1]],
  },
  revier: {
    // Archivregal, Leiter und Akte standen frei mitten im Wachraum
    weg: [['b_archiv_regal_a', 10, 6], ['b_archiv_leiter', 9, 9], ['b_archiv_akte', 21, 7]],
  },
  revier_fluegel: {
    // … und stehen jetzt als Aktenablage im leeren Treppenhaus des Flügels
    dazu: [steh('b_archiv_regal_a', 28, 4), steh('b_archiv_leiter', 30, 5), steh('b_archiv_akte', 28, 7)],
  },
};

const key = (x, y) => `${x},${y}`;

/** Felder, die belegt sind (Objekte, Figuren, Spawns, Streifenwege-Ecken) – mit Rand von einem Feld. */
function belegung(m, { rand = 1 } = {}) {
  const s = new Set();
  const setz = ([x, y], r) => { for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) s.add(key(x + dx, y + dy)); };
  for (const i of m.interactables ?? []) setz(i.tile, rand);
  for (const n of m.npcs ?? []) setz(n.tile, rand);
  for (const p of Object.values(m.spawns ?? {})) setz(p, rand);
  for (const d of m.decor ?? []) setz(d.tile, 0);
  return s;
}

function verbreitern(m, n) {
  m.rows = m.rows.map((row) => {
    const last = row.at(-1);
    // Wandreihen setzen das Fenstermuster der Fassade fort, alle anderen ihr letztes Feld
    const ext = /^[#WB]$/.test(last) && row.includes('W') ? row.slice(-n - 10, -10).padEnd(n, '#').slice(0, n) : last.repeat(n);
    return row + ext;
  });
  // Laterne über der neuen Gasse
  const ufer = m.rows.findIndex((r, y) => y > 2 && r.includes('L'));
  if (ufer >= 0) m.rows[ufer] = m.rows[ufer].slice(0, -6) + 'L' + m.rows[ufer].slice(-5);
}

/** Wendet den Plan auf eine Karte an. Gibt zurück, was gesetzt wurde (für die Tests). */
export function kettlegateKulisseFuer(m, plan) {
  const out = { dazu: [], figuren: [] };
  m.decor ??= [];
  if (plan.breiter) verbreitern(m, plan.breiter);
  for (const [sprite, x, y] of plan.weg ?? []) {
    const i = m.decor.findIndex((d) => d.sprite === sprite && d.tile[0] === x && d.tile[1] === y);
    if (i >= 0) m.decor.splice(i, 1);
  }
  for (const [sprite, [x, y], ziel] of plan.schieb ?? []) {
    const d = m.decor.find((e) => e.sprite === sprite && e.tile[0] === x && e.tile[1] === y);
    if (d) d.tile = [...ziel];
  }
  for (const [id, [x, y], ziel] of plan.figuren ?? []) {
    const n = (m.npcs ?? []).find((e) => e.id === id && e.tile[0] === x && e.tile[1] === y);
    if (!n) continue;
    n.tile = [...ziel];
    out.figuren.push(id);
  }
  const H = m.rows.length;
  const W = m.rows[0].length;
  const ch = (x, y) => m.rows[y]?.[x];
  const boden = (x, y) => BODEN.has(ch(x, y));
  const fest = new Set();
  for (const d of m.decor) if (d.solid) fest.add(key(...d.tile));
  for (let r of plan.dazu ?? []) {
    const belegt = belegung(m);
    const frei = (x, y) => (r.wasser ? ch(x, y) === '~' : boden(x, y) && !belegt.has(key(x, y)));
    // Wunschfeld, sonst das nächste freie Feld im Umkreis von zwei Feldern
    const ziel = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [2, 0], [-2, 0], [0, 2], [0, -2]]
      .map(([dx, dy]) => [r.x + dx, r.y + dy]).find(([x, y]) => frei(x, y));
    if (!ziel) continue;
    r = { ...r, x: ziel[0], y: ziel[1] };
    const d = r.flach
      ? { sprite: r.sprite, tile: [r.x, r.y], alpha: 1, depth: r.wasser ? 4 : 5, kulisse: true }
      : { sprite: r.sprite, tile: [r.x, r.y], offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true, kulisse: true };
    if (r.licht) d.light = { flicker: 0.12, glow: 0.22, ...r.licht };
    if (r.fest && erreichbarMit(m, { W, H, boden, fest, neu: [key(r.x, r.y)] })) {
      d.solid = [r.fest[0], r.fest[1], 0, -3];
      fest.add(key(r.x, r.y));
    }
    m.decor.push(d);
    out.dazu.push(r.sprite);
  }
  return out;
}

export function applyKettlegateKulisse(content) {
  const bericht = {};
  for (const [id, plan] of Object.entries(KETTLEGATE_PLAN)) {
    const m = content.maps?.[id];
    if (m) bericht[id] = kettlegateKulisseFuer(m, plan);
  }
  return bericht;
}
