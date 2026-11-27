/**
 * Wexmoor-Orte harmonischer (Seb 2026-11-27: „manche Orte zu crowded und vollgemüllt, manche sehr leer, das muss mehr harmonieren“).
 * Die Bodenkacheln selbst werden in WorldScene ruhiger gemischt (Bahnhof, Salzmarkt, Torfstich, Oberstadt). Hier bekommen die leeren
 * Orte Requisiten an sinnvollen Stellen: Gräber und Laternen auf den Flößen, Schreibstuben im Lichtamt, Schilf und Reusen im Torfsee,
 * Gärten in der Oberstadt und Stege am Bojenhafen. Jede neue Requisite landet nur auf einem freien Feld: kein Ausgang, kein Auftrag,
 * keine Figur, kein Ankunftspunkt, keine Streifenroute – der Test wexmoor_ordnung.test.js prüft das und die Erreichbarkeit.
 * Alles trägt `ordnung: true`, damit man die Zusätze wiederfindet.
 */

const steh = (sprite, solid = null, extra = {}) => ({ offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true, ...(solid ? { solid } : {}), sprite, ...extra });
const wasser = (sprite, extra = {}) => ({ alpha: 1, depth: 6, sprite, ...extra }); // Tiefe 6 = Requisite im Wasser (wie wx2g_kahn)
const licht = { light: { dy: -12, radius: 56, intensity: 0.55, flicker: 0.15 } };

/** [Karte, [[Vorlage, x, y], ...]] */
const ZUSAETZE = {
  // Flößerfriedhof: fünf Flöße waren fast leer – je Floß zwei, drei Grabzeichen und eine Laterne, Schilf im Wasser dazwischen
  wx_flossfriedhof: [
    [steh('b_grab_stele', [10, 8, 0, -2], { cover: true }), 10, 3], [steh('r_vergessmoor_props_namenstafel_0'), 6, 3], [steh('b_grab_laterne', null, licht), 11, 6],
    [steh('b_grab_kreuz', [10, 8, 0, -2], { cover: true }), 17, 3], [steh('b_grab_grabstein', [10, 8, 0, -2], { cover: true }), 22, 3], [steh('b_grab_laterne', null, licht), 16, 6],
    [steh('b_grab_kreuz', [10, 8, 0, -2], { cover: true }), 29, 3], [steh('r_vergessmoor_props_namenstafel_1'), 35, 5], [steh('b_grab_laterne', null, licht), 36, 2],
    [steh('b_grab_stele', [10, 8, 0, -2], { cover: true }), 14, 13], [steh('r_vergessmoor_props_namenstafel_2'), 9, 13], [steh('b_grab_laterne', null, licht), 15, 16],
    [steh('b_grab_kreuz', [10, 8, 0, -2], { cover: true }), 22, 13], [steh('b_grab_stele', [10, 8, 0, -2], { cover: true }), 28, 13], [steh('b_grab_laterne', null, licht), 21, 16],
    [steh('wx2a_laterne', null, licht), 14, 8], [steh('wx2a_laterne', null, licht), 27, 8],
    [wasser('wx2a_schilf'), 13, 3], [wasser('wx2a_schilf'), 26, 4], [wasser('wx2a_schilf'), 3, 13], [wasser('wx2a_schilf'), 18, 14], [wasser('wx2a_schilf'), 35, 14],
    [wasser('wx2_treibholz'), 2, 4], [wasser('wx2_treibholz'), 33, 15], [wasser('wx2_boje'), 38, 6],
  ],
  // Lichtamt: zwei Schreibstuben oben und ein großer Saal unten mit nur vier Möbeln – Aktenschränke an den Wänden, Pulte, Wartebank, Laternenregal
  wx_lichtamt: [
    [steh('r_innen_props_aktenschrank_0', [12, 6, 0, -2]), 6, 2], [steh('r_innen_props_aktenschrank_1', [12, 6, 0, -2]), 9, 2], [steh('r_innen_props_aktenschrank_0', [12, 6, 0, -2]), 14, 2],
    [steh('r_innen_props_buecher_0'), 2, 5], [steh('r_innen_props_lesetisch'), 14, 8],
    [steh('r_innen_props_laternenregal', [28, 6, 0, -2]), 19, 2], [steh('r_innen_props_aktenschrank_1', [12, 6, 0, -2]), 29, 2], [steh('i2_petroleumlampe', null, { offset: [8, 8], bw: true, ...licht }), 29, 6],
    [steh('r_innen_props_schreibtisch_hale', null, { offset: [8, 8] }), 5, 13], [steh('r_innen_props_pult'), 14, 15], [steh('r_innen_props_pult'), 22, 15], [steh('r_innen_props_schreibtisch_lucent', null, { offset: [8, 8] }), 26, 13],
    [steh('i2_akademie_buecherregal', [28, 6, 0, -2], { offset: [8, 8], bw: true }), 3, 11], [steh('r_innen_props_archiv', [28, 6, 0, -2]), 9, 11], [steh('i2_akademie_buecherregal', [28, 6, 0, -2], { offset: [8, 8], bw: true }), 24, 11],
    [steh('i2_revier_wartebank', [28, 8, 0, -4], { offset: [8, 8], bw: true }), 18, 17], [steh('r_innen_props_laternenregal', [28, 6, 0, -2]), 13, 11],
    [steh('r_innen_props_buecher_1'), 2, 12], [steh('r_innen_props_oelfaesser'), 29, 11], [steh('i2_leuchter', null, { offset: [8, 8], bw: true, ...licht }), 20, 11],
  ],
  // Torfstich: der See rechts war eine leere Wasserfläche – Schilfsäume am Ufer, Reusen und Markierpfähle am Steg, ein Einbaum
  wx_torfstich: [
    [wasser('wx2a_schilf'), 23, 2], [wasser('wx2a_schilf'), 21, 5], [wasser('wx2a_schilf'), 20, 9], [wasser('wx2a_schilf'), 25, 14], [wasser('wx2a_schilf'), 27, 15],
    [wasser('wx2a_schilf'), 37, 2], [wasser('wx2a_schilf'), 38, 9], [wasser('wx2a_reuse'), 31, 8], [wasser('wx2a_reuse'), 35, 11],
    [wasser('wx2_pegelpfahl'), 26, 5], [wasser('wx2_pricke'), 30, 3], [wasser('wx2_pricke'), 36, 6], [wasser('wx2_treibholz'), 25, 12],
    [wasser('r_pfahldorf_einbaum', { offset: [8, 8] }), 28, 13], [wasser('wx2a_boje'), 32, 14],
  ],
  // Oberstadt: vier Gärten waren dunkle, leere Rechtecke – Moorwiese (WorldScene), Hecke als Saum zur Straße, Moorpflanzen, Bänke davor
  wx_oberstadt: [
    ...[2, 4, 5, 14, 15, 16, 17, 28, 29, 31, 40, 41].map((x) => [steh('r_oberstadt_hecke', [16, 8, 0, -2]), x, 6]),
    [steh('wx2_moorpflanze'), 4, 5], [steh('wx2_wollgras'), 2, 5], [steh('wx2_moorpflanze'), 14, 5], [steh('wx2_wollgras'), 16, 5],
    [steh('wx2_moorpflanze'), 29, 5], [steh('wx2_wollgras'), 31, 5], [steh('wx2_moorpflanze'), 40, 5],
    [steh('wx2_bahn_bank', [28, 6, 0, -2]), 29, 7], [steh('wx2_bahn_bank', [28, 6, 0, -2]), 16, 7],
  ],
  // Bojenhafen: der untere Steg war leer, oben stand alles dicht – Taurollen, Fischkisten und eine Laterne auf den Steg
  wx_bojenhafen: [
    [steh('wx2_taurolle'), 7, 9], [steh('wx2_fischkiste'), 14, 9], [steh('wx2a_laterne', null, licht), 19, 9], [steh('wx2_muschelkorb'), 25, 9],
    [wasser('wx2_pricke'), 12, 11], [wasser('wx2_pricke'), 28, 11], [wasser('wx2a_schilf'), 3, 10], [wasser('wx2a_schilf'), 37, 9],
  ],
  // Namensgilde: großer Versammlungsraum mit drei Requisiten – Namenstafeln an den Wänden, verhängte Laternen, ein Schrein
  treffen_namensgilde: [
    [steh('r_vergessmoor_props_namenstafel_0'), 7, 2], [steh('r_vergessmoor_props_namenstafel_1'), 12, 2], [steh('r_vergessmoor_props_namenstafel_2'), 18, 6],
    [steh('s_lichtlose_props_covered_lantern', null, licht), 2, 10], [steh('s_lichtlose_props_covered_lantern', null, licht), 17, 10],
    [steh('r_torfstich_namensschrein', [24, 8, 0, -2]), 2, 6], [steh('wx2_kalktopf'), 8, 9], [steh('wx2_torfsode'), 13, 9],
  ],
};

/** Felder, die frei bleiben müssen: Aufträge, Figuren, Ankunftspunkte, Streifenrouten (mit Strecken dazwischen), Gegner. */
export function belegteFelder(m) {
  const zu = new Set();
  const add = ([x, y]) => zu.add(`${x},${y}`);
  for (const i of m.interactables ?? []) add(i.tile);
  for (const n of m.npcs ?? []) add(n.tile);
  for (const r of m.roamers ?? []) if (r.tile) add(r.tile);
  for (const s of Object.values(m.spawns ?? {})) add(s);
  for (const p of m.patrols ?? []) {
    const route = p.route ?? [];
    for (let i = 0; i < route.length; i++) {
      const [ax, ay] = route[i];
      const [bx, by] = route[(i + 1) % route.length];
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) if (ax === bx || ay === by) add([x, y]);
    }
  }
  return zu;
}

export const WX_ORDNUNG = ZUSAETZE;

/**
 * Gefahrengebiete Vergessmoor und Salzwatt: Die Karten sind aus Zufallsrauschen entstanden, jedes dritte Feld ein einzelnes Wasserloch –
 * das ergab ein Schachbrett. Einzelne Wasserfelder ohne Wasser-Nachbarn werden zu Land, damit zusammenhängende Tümpel
 * und Priele bleiben. Es wird nur Land dazugewonnen, kein Weg geht verloren.
 */
const GLAETTEN = ['wx_vergessmoor', 'wx_salzwatt'];
export function glaetteWasser(rows, runden = 1, bleibt = new Set()) {
  let g = rows.map((r) => [...r]);
  const h = g.length;
  const w = g[0].length;
  for (let n = 0; n < runden; n++) {
    const neu = g.map((r) => [...r]);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      if (g[y][x] !== '~' || bleibt.has(`${x},${y}`)) continue; // Boote, Pricken und Bojen behalten ihr Wasser
      const nass = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => g[y + dy][x + dx] === '~').length;
      if (nass === 0) neu[y][x] = 'g';
    }
    g = neu;
  }
  return g.map((r) => r.join(''));
}

export function applyWexmoorOrdnung(content) {
  for (const id of GLAETTEN) {
    const m = content.maps[id];
    if (m) m.rows = glaetteWasser(m.rows, 1, new Set((m.decor ?? []).filter((d) => (d.depth ?? 0) >= 5).map((d) => `${d.tile[0]},${d.tile[1]}`)));
  }
  for (const [id, liste] of Object.entries(ZUSAETZE)) {
    const m = content.maps[id];
    if (!m) continue;
    const zu = belegteFelder(m);
    const schonDa = new Set((m.decor ?? []).map((d) => `${d.tile[0]},${d.tile[1]}`));
    const neu = [];
    for (const [vorlage, x, y] of liste) {
      const k = `${x},${y}`;
      if (zu.has(k) || schonDa.has(k) || m.rows[y]?.[x] === undefined) continue; // spätere Aufträge haben Vorrang vor Requisiten
      neu.push({ ...vorlage, tile: [x, y], ordnung: true });
      schonDa.add(k);
    }
    m.decor = [...(m.decor ?? []), ...neu];
  }
}
