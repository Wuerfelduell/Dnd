/**
 * Calderwick-Stadtplan (Seb 2026-11-26: „Calderwick ist ein Krampf, Kulisse unschön, wenig zu erkunden“).
 * Die sechs Terrassen waren alle dasselbe leere 44x22-Rechteck mit sechs 3x3-Klötzen; alle Aushänge, Zettel und Figuren
 * standen in einer Reihe oben links. Hier bekommt jede Terrasse einen eigenen, größeren Stadtplan (52x28):
 * - Häuserzeilen an der Nordmauer, freistehende Häuser mit Dach, Fassade, Fenstern und Türen (Fassaden-Blätter D_03/BT),
 *   dazwischen Straßen, Gassen, Sackgassen und ein Platz je Terrasse.
 * - Die Türen zu den Innenräumen sitzen an echten Haustüren; wer herauskommt, steht vor genau dieser Tür (Spawn `tuer_<raum>`).
 * - Treppen zur nächsten bzw. vorigen Terrasse an festen Enden (oben rechts / unten links), mit Stufen.
 * - Aushänge und Zettel hängen an Hauswänden, Figuren stehen auf Straßen und Plätzen, Requisiten verteilt; alles nach
 *   größtem Abstand, Spielobjekte mit gleichem Feld bleiben zusammen. Nichts geht verloren, alles bleibt erreichbar.
 * Läuft in buildContent direkt vor applyCalderwickKulisse (die dann Laternen, Streu und Licht ergänzt).
 */

export const CW_TERRASSEN = ['cw_gleisfuss', 'cw_setzergasse', 'cw_quittungsmarkt', 'cw_roehrenhof', 'cw_witwenterrasse', 'cw_kronenarchiv'];
const W = 52;
const H = 28;

/**
 * Häuser: [x, y, breite, höhe, türen (x relativ), fassade?]. Die unterste Reihe trägt die Türen, darüber Fenster, oben Dach.
 * tueren: Zielkarte → [x, y] der Haustür (D); das Türobjekt steht davor (y + 1), wer herauskommt, eine Reihe tiefer.
 * ort: Objekt-Id → Feld. gleis: Reihe der Bahngleise (nur Gleisfuß). platz: Mittelpunkt des Platzes (Brunnen/Statue).
 */
const NORD = (xs, h = 4) => xs.map(([x, w, t, f]) => [x, 1, w, h, t ?? [], f]);
const PLAENE = {
  cw_gleisfuss: {
    facades: ['fabrik', 'stein', 'slum'],
    haeuser: [...NORD([[3, 8, [3]], [13, 9, [], 'stein'], [24, 8, [5]], [34, 9, []]]),
      [3, 9, 7, 4, []], [13, 9, 6, 5, [2]], [34, 9, 7, 4, [3]], [43, 9, 6, 5, []],
      [5, 16, 8, 4, [4]], [15, 16, 6, 4, []], [33, 16, 7, 4, [2]], [42, 16, 7, 4, []]],
    tueren: { cw_gepaeckhalle: [9, 19] },
    gleis: 24,
    platz: [26, 12],
    ort: {
      cwo_cw_gleisfuss_7: [3, 21], marlowe_telegramm: [5, 21], auf_cw_aufschlag: [2, 22],
      auf_cw_lastenzug: [10, 23], auf_pendel_ds: [13, 23], auf_cw_seq0: [24, 22], cwo_cw_gleisfuss_11: [44, 23],
      cwo_cw_gleisfuss_9: [47, 7], cw_hesk: [26, 14], cwn_aufzugswaerter: [48, 8],
      cwp_gleisfuss_aufzug: [46, 6], cwp_gleisfuss_gegengewicht: [49, 6], cwp_gleisfuss_schalter: [22, 21], cwp_gleisfuss_fahrgastbuch: [28, 21],
      cwp_gleisfuss_stationsschild_1: [17, 22], cwp_gleisfuss_stationsschild_2: [36, 22], cwp_gleisfuss_stationsschild_3: [7, 13],
      cwp_gleisfuss_gueterwaggon_offen: [20, 24], cwp_gleisfuss_gueterwaggon_zu: [32, 24],
    },
  },
  cw_setzergasse: {
    facades: ['putz', 'holz', 'stein'],
    haeuser: [...NORD([[3, 7, [3]], [12, 10, [2, 7]], [24, 7, []], [33, 10, [4], 'holz']]),
      [3, 9, 8, 5, [2]], [13, 9, 6, 4, []], [33, 9, 6, 4, []], [41, 9, 8, 5, [4]],
      [3, 17, 6, 4, []], [11, 17, 9, 4, [3]], [31, 17, 8, 4, []], [41, 17, 8, 4, [2, 6]]],
    tueren: { cw_buchbinderei: [5, 13], cw_alte_setzerei: [14, 20] },
    platz: [26, 13],
    ort: { cwo_cw_setzergasse_7: [3, 23], cwo_cw_setzergasse_10: [47, 7], cwp_setzergasse_druckerpresse: [23, 11], cwp_setzergasse_fenster: [29, 6] },
  },
  cw_quittungsmarkt: {
    facades: ['wx_oberstadt', 'putz', 'wx_apotheke', 'stein'],
    haeuser: [...NORD([[3, 9, [4]], [15, 7, []], [28, 8, [3]], [38, 7, [], 'wx_salzspeicher']]),
      [3, 9, 7, 4, []], [40, 9, 9, 5, [4]],
      [3, 17, 8, 4, [3]], [13, 17, 6, 4, []], [33, 17, 6, 4, [2]], [41, 17, 8, 4, []]],
    tueren: { cw_pfandhaus: [6, 20] },
    platz: [24, 12],
    ort: {
      cwo_cw_quittungsmarkt_7: [3, 23], cwo_cw_quittungsmarkt_10: [47, 7],
      cwp_quittungsmarkt_marktstand_buecher: [15, 10], cwp_quittungsmarkt_marktstand_werkzeug: [20, 10], cwp_quittungsmarkt_marktstand_tee: [29, 10],
      cwo_marktstand_tisch: [24, 15], cwo_marktstand: [24, 14], cw_pritch: [18, 13], cwn_saisonmarkt: [33, 12],
      cwp_quittungsmarkt_pfandhaus: [6, 20], cwp_quittungsmarkt_waage: [27, 15], nebel_kraemerin: [31, 14],
    },
  },
  cw_roehrenhof: {
    facades: ['fabrik', 'wx_salzspeicher', 'stein'],
    haeuser: [...NORD([[3, 8, []], [13, 8, [4]], [23, 10, [], 'wx_wachhaus'], [35, 8, [3]]]),
      [3, 9, 6, 5, [3]], [11, 9, 8, 4, []], [32, 9, 7, 4, []], [41, 9, 8, 5, [3]],
      [3, 17, 7, 4, []], [12, 17, 8, 4, [4]], [32, 17, 7, 4, [3]], [42, 17, 7, 4, []]],
    tueren: { cw_sortiergrube: [6, 13], cw_sortierhalle: [16, 20] },
    platz: [25, 13],
    ort: { cwo_cw_roehrenhof_7: [3, 23], cwo_cw_roehrenhof_10: [47, 7], cwo_cw_roehrenhof_13: [25, 15], cwp_roehrenhof_warenbahn: [22, 11], cwp_roehrenhof_fahrplantafel: [28, 11] },
  },
  cw_witwenterrasse: {
    facades: ['slum', 'holz', 'putz'],
    haeuser: [...NORD([[3, 7, [2]], [12, 8, [], 'holz'], [22, 7, [3]], [31, 6, []], [39, 6, [3]]]),
      [3, 9, 8, 4, [4]], [13, 9, 5, 4, []], [35, 9, 6, 4, [2]], [43, 9, 6, 5, []],
      [3, 17, 7, 4, []], [12, 17, 7, 4, [3]], [31, 17, 7, 4, []], [40, 17, 9, 4, [2, 6]]],
    tueren: { cw_kueche: [7, 12] },
    platz: [26, 13],
    ort: { cwo_cw_witwenterrasse_7: [3, 23], cwo_cw_witwenterrasse_10: [47, 7], cwp_witwenterrasse_eingang: [7, 12] },
  },
  cw_kronenarchiv: {
    facades: ['wx_ratshaus', 'wx_akademie', 'wx_altstadt'],
    haeuser: [...NORD([[3, 9, []], [15, 10, [5], 'wx_akademie'], [29, 8, []], [40, 6, [3]]]),
      [3, 9, 7, 4, [3]], [12, 9, 6, 4, []], [33, 9, 6, 4, [2]], [41, 9, 8, 5, []],
      [3, 17, 7, 4, []], [12, 17, 6, 4, [3]], [33, 17, 7, 4, [3]], [42, 17, 7, 4, []]],
    tueren: { cw_archivsaal: [20, 4], cw_villa: [36, 20], cw_nullfundament: [6, 12] },
    platz: [25, 13],
    ort: {
      cwo_cw_kronenarchiv_7: [3, 23], cwo_cw_kronenarchiv_9: [47, 7],
      cwp_kronenarchiv_archivportal: [20, 4], cwp_kronenarchiv_direktorenvilla: [36, 20],
      cwp_kronenarchiv_brunnen: [25, 13], cwp_kronenarchiv_hauptpresse: [14, 23],
      auf_cw_zug2: [30, 22], k4s_linie: [34, 23], k6_schaffner2_tuer: [27, 23], k6_zug_hoch: [27, 22],
      cwo_cw_kronenarchiv_13: [11, 15],
    },
  },
};

function hash2(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const key = (x, y) => `${x},${y}`;

/** Leeres Raster mit Außenmauer und den Häusern. */
function raster(plan) {
  const g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 'I' : '.')));
  for (const [x0, y0, w, h, tueren] of plan.haeuser) {
    const unten = y0 + h - 1;
    for (let y = y0; y <= unten; y++) for (let x = x0; x < x0 + w; x++) {
      const i = x - x0;
      const rand = i === 0 || i === w - 1;
      let c;
      if (y < unten - 1) c = 'R';
      else if (y === unten - 1) c = rand || i % 3 === 0 ? '#' : 'W';
      else c = tueren.includes(i) ? 'D' : rand || i % 3 !== 1 ? '#' : 'W';
      g[y][x] = c;
    }
  }
  for (const [x, y] of Object.values(plan.tueren ?? {})) g[y][x] = 'D';
  return g;
}

const boden = (g, x, y) => g[y]?.[x] === '.';

/** Felder, die man von `start` aus erreicht (ohne `zu`). */
function erreichbar(g, start, zu = new Set()) {
  const seen = new Set([key(...start)]);
  const q = [start];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const k = key(nx, ny);
      if (seen.has(k) || zu.has(k) || !boden(g, nx, ny)) continue;
      seen.add(k);
      q.push([nx, ny]);
    }
  }
  return seen;
}

export function applyCalderwickStadtplan(content) {
  const maps = content.maps;
  // Rückwege aus Innenräumen und Gefahrengebieten: wer herauskommt, steht vor der Tür, durch die er hineinging
  const rueck = [];
  for (const id of CW_TERRASSEN) if (maps[id] && PLAENE[id]) rueck.push(...umbauen(maps, maps[id], PLAENE[id]));
  // Braukessel in der Gemeinschaftsküche: Seq 3–1 lassen sich in Calderwick brauen, ohne nach Dunscar zu fahren
  const kueche = maps.cw_kueche;
  if (kueche && !kueche.interactables.some((i) => i.kind === 'brew')) {
    kueche.interactables.push({ id: 'cw_braukessel', kind: 'brew', tile: [16, 10], prompt: 'Am Braukessel brauen', sprite: 'cauldron', marker: false, solid: [14, 10], title: 'Braukessel der Küche' });
  }
  for (const [von, nach, spawn] of rueck) {
    for (const i of maps[von]?.interactables ?? []) if (i.kind === 'door' && i.to === nach && (i.spawn ?? 'default') === 'default') i.spawn = spawn;
  }
}

function umbauen(maps, m, plan) {
  const g = raster(plan);
  const idx = CW_TERRASSEN.indexOf(m.id);
  const vorher = CW_TERRASSEN[idx - 1];
  const nachher = CW_TERRASSEN[idx + 1];
  const spawns = { ...m.spawns, default: [2, 24], oben: [48, 4] };
  const rueck = [];
  const decor = [];
  // Stufen: unten links hinab zur vorigen Terrasse, oben rechts hinauf zur nächsten
  if (vorher) for (const y of [23, 24, 25]) decor.push({ sprite: 'cwt_terrasse', frame: 10, tile: [1, y], alpha: 1, depth: 39, kulisse: true });
  if (nachher) for (const x of [46, 47, 48, 49, 50]) decor.push({ sprite: 'cwt_terrasse', frame: 9, tile: [x, 1], alpha: 1, depth: 39, kulisse: true });
  // Gleisfuß: Bahnsteig mit Gleis über die ganze Breite
  if (plan.gleis) {
    for (let x = 6; x < W - 6; x++) decor.push({ sprite: 'cwt_gleis', frame: 0, tile: [x, plan.gleis], alpha: 1, depth: 38 });
    decor.push({ sprite: 'cwt_gleis', frame: 8, tile: [5, plan.gleis], alpha: 1, depth: 38 }, { sprite: 'cwt_gleis', frame: 8, tile: [W - 6, plan.gleis], alpha: 1, depth: 38, flip: true });
  }

  // Platz: Brunnen in der Mitte, sofern der Ort dort kein eigenes Stück hat
  if (plan.platz && !Object.values(plan.ort ?? {}).some(([x, y]) => x === plan.platz[0] && y === plan.platz[1])) {
    decor.push({ sprite: plan.gleis ? 'cwp_kronenarchiv_statue' : 'cwp_kronenarchiv_brunnen', tile: [...plan.platz], origin: [0.5, 1], offset: [0, 8], alpha: 1, ysort: true, kulisse: true, solid: [24, 10, 0, -4] });
  }
  // Spielobjekte einsammeln: Gruppen gleicher Felder bewegen sich gemeinsam
  const alt = (m.decor ?? []).filter((d) => !d.kulisse && d.sprite !== 'cwt_gleis');
  const objekte = [
    ...(m.interactables ?? []).map((o) => ({ o, art: o.kind === 'door' ? 'tuer' : o.sprite === 'paper' || o.kind === 'read' ? 'wand' : 'frei' })),
    ...(m.npcs ?? []).map((o) => ({ o, art: 'figur' })),
    ...alt.map((o) => ({ o, art: 'deko' })),
  ];
  const gruppen = new Map();
  for (const e of objekte) {
    if (e.art === 'deko') { gruppen.set(Symbol('deko'), [e]); continue; }
    const k = key(...e.o.tile);
    if (!gruppen.has(k)) gruppen.set(k, []);
    gruppen.get(k).push(e);
  }
  const belegt = new Set();
  const gesetzt = [];
  const tuerVor = new Set();
  for (const [x, y] of Object.values(plan.tueren ?? {})) { tuerVor.add(key(x, y + 1)); tuerVor.add(key(x, y + 2)); }
  for (const [x, y] of Object.values(spawns)) tuerVor.add(key(x, y));
  if (plan.platz) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) tuerVor.add(key(plan.platz[0] + dx, plan.platz[1] + dy));
  const setze = (gr, t) => {
    for (const e of gr) e.o.tile = [...t];
    belegt.add(key(...t));
    gesetzt.push(t);
  };
  const offen = [];
  for (const gr of gruppen.values()) {
    const fest = gr.map((e) => plan.ort?.[e.o.id] ?? plan.ort?.[e.o.sprite]).find(Boolean);
    const tuer = gr.find((e) => e.art === 'tuer');
    if (fest) { setze(gr, fest); continue; }
    if (tuer) {
      const ziel = tuer.o.to;
      let t;
      if (ziel === vorher) t = [2, 23];
      else if (ziel === nachher) t = [48, 2];
      else if (plan.tueren?.[ziel]) {
        const [x, y] = plan.tueren[ziel];
        t = [x, y + 1];
        spawns[`tuer_${ziel}`] = [x, y + 2];
        rueck.push([ziel, m.id, `tuer_${ziel}`]);
      }
      if (t) { setze(gr, t); continue; }
    }
    offen.push(gr);
  }
  // Fehlende feste Stücke (Gleisfuß-Requisiten) und große Spielobjekte zuerst, dann Wandaushänge, Figuren, Freies
  const rang = { tuer: 0, deko: 1, frei: 2, figur: 3, wand: 4 };
  offen.sort((a, b) => rang[a[0].art] - rang[b[0].art]);
  const start = spawns.default;
  for (const gr of offen) {
    const art = gr[0].art;
    let best = null;
    let bestD = -1;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!boden(g, x, y) || belegt.has(key(x, y)) || tuerVor.has(key(x, y))) continue;
      if (plan.gleis && Math.abs(y - plan.gleis) <= 0) continue;
      const anWand = '#W'.includes(g[y - 1][x]);
      if (art === 'wand' && !anWand) continue;
      if (art === 'deko' && !(boden(g, x - 1, y) && boden(g, x + 1, y) && boden(g, x, y - 1))) continue;
      if ((art === 'figur' || art === 'frei') && (anWand || 'RD'.includes(g[y - 1][x]) || x < 2 || y < 5 || x > W - 3 || y > H - 3)) continue;
      const d = gesetzt.length ? Math.min(...gesetzt.map(([gx, gy]) => Math.hypot(gx - x, gy - y))) : 99;
      const dd = d + hash2(x, y, 700 + gesetzt.length) * 1.2;
      if (dd > bestD) { bestD = dd; best = [x, y]; }
    }
    if (best) setze(gr, best);
  }
  // Feste Requisiten dürfen keinen Weg versperren
  const zu = new Set();
  for (const d of alt) if (d.solid) zu.add(key(...d.tile));
  const ziele = [...objekte.filter((e) => e.art !== 'deko').map((e) => e.o.tile), ...Object.values(spawns)];
  const ok = (sperre) => { const r = erreichbar(g, start, sperre); return ziele.every(([x, y]) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => r.has(key(x + dx, y + dy)))); };
  if (!ok(zu)) for (const d of alt) if (d.solid) { zu.delete(key(...d.tile)); if (!ok(zu)) delete d.solid; else zu.add(key(...d.tile)); }

  m.rows = g.map((r) => r.join(''));
  m.facades = plan.facades;
  m.spawns = spawns;
  m.decor = [...alt, ...decor];
  m.lights = (m.lights ?? []).filter((l) => boden(g, ...l.tile));
  for (const [x, y] of [[3, 22], [48, 5]]) m.lights.push({ tile: [x, y], radius: 70, intensity: 0.6, color: '#ffc782', glow: 0.2, flicker: 0.08 });
  return rueck;
}
