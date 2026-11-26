/**
 * Calderwick-Kulisse (Seb 2026-11-26: „Calderwick verschönern“, wie Dunscar #548 und Briarholt #553).
 * Läuft ganz zuletzt über alle cw_-Karten und die zehn Pfadviertel (o3_*) und legt nur Deko, Licht und Nebel dazu;
 * Kartenraster, Objekte, Figuren und Wege bleiben, wie die Pakete sie gesetzt haben.
 * - Häuser: die Wandblöcke der Terrassen werden zu Häusern (Dach aus dem Vorrat future200, Fassade mit Fenstern, Sockel und Tür
 *   aus dem CE1-Blatt cw_terrasse; erleuchtete Fenster werfen Licht).
 * - Innen und in den Gefahrengebieten werden dieselben Blöcke zu Möbeln ihres Blattes: Setzkastenwände, Aktenregale, Lohnbuchregale,
 *   Geschirrborde, im Nullfundament Namensnischen mit türkisem Glimmen und Druckwalzensäulen.
 * - Fassaden: Rohre, Klappen, Schilder, Pinnwände, Regale auf den Außenwänden; unten an den Terrassen ein Geländer.
 * - Rohrpost: eine Leitung unter der Nordwand, Abzweige hinunter zu den Häusern (Röhrenhof dichter).
 * - Boden: Gullys, Rinnen, Radrillen, lose Lettern, Gitter als seltene flache Einzelstücke; Möbel an den Innenwänden.
 * - Requisiten: Straßenlaternen und weitere CE1-Stücke je Ort, mit Licht. Feste Stücke blockieren nur, wenn alles erreichbar bleibt.
 * - Pfadviertel: Häuser bzw. Briarholt-Kulisse je Blatt, dazu Verderbnis-Glimmen in der Farbe des Pfades, Nebel bleibt dicht.
 */
import { briarholtKulisseFuer, erreichbarMit } from './briarholtKulisse.js';

/** Zellen der CE1-Blätter (Index = Position im 8-spaltigen Blatt, laut manifest-calderwick1.json). */
const T = { gully: 6, rinne: 4, beet_trocken: 30, gelaender: 7, sockel: 12, fassade: 16, f_links: 17, f_rechts: 18, fenster_dunkel: 19, fenster_licht: 20, fenster_trueb: 21,
  tuer: 22, rohr_v: 23, rohr_h: 24, rohr_ne: 25, rohr_sw: 26, rohr_t: 27, klappe: 28, schild: 29, russ: 31 };
const BLATT = { cw_terrasse: 'cwt_terrasse', cw_druckerei: 'cwt_druckerei', cw_amt: 'cwt_amt', cw_sortierhalle: 'cwt_amt', cw_archivsaal: 'cwt_amt', cw_kueche: 'cwt_kueche', cw_fundament: 'cwt_fundament' };
/** Blätter, die assets.js zusätzlich als 16er-Spritesheets registriert (cwt_gleis und cwt_fundament gab es schon). */
export const CW_KULISSE_BLAETTER = { cwt_terrasse: 'tilesets/cw_terrasse.png', cwt_druckerei: 'tilesets/cw_druckerei.png', cwt_amt: 'tilesets/cw_amt.png', cwt_kueche: 'tilesets/cw_kueche.png' };

/**
 * Möbelblöcke je Innenblatt: oben = oberste Reihe, mitte/links/rechts = übrige Reihen, unten = Mitte der untersten Reihe (optional),
 * fassade = Zellen auf Außenwänden, streu = [Zelle, Anteil], wand = Stücke vor der Nordwand.
 */
const INNEN = {
  cw_druckerei: { oben: [6], mitte: [7], links: 8, rechts: 9, fassade: [16, 17, 7], streu: [[1, 0.03], [10, 0.012]], wand: [[12, 13], [11], [10]] },
  cw_amt: { oben: [4], mitte: [5], links: 6, rechts: 7, fassade: [8, 11, 5], streu: [[2, 0.01]], wand: [[6, 7]] },
  cw_sortierhalle: { oben: [20], mitte: [21], fassade: [8, 10, 11, 21], streu: [[18, 0.02], [19, 0.008]], wand: [[20]] },
  cw_archivsaal: { oben: [4], mitte: [5], links: 6, rechts: 7, fassade: [5, 11, 8], streu: [], wand: [[6, 7]] },
  cw_kueche: { oben: [12], mitte: [13], fassade: [14, 15, 13], streu: [[2, 0.02]], wand: [[14], [15], [8, 9, 10]] },
  cw_fundament: { oben: [4], mitte: [5], links: 6, rechts: 7, unten: 10, fassade: [8, 9, 10, 14], streu: [[3, 0.012]], wand: [[20]] },
};

const LAMPE = '#ffc782';
const TUERKIS = '#6fe0d0';
const L = { licht: LAMPE, lampe: true }; // Straßenlaterne (lamp_lit, 16x48)
/** Terrassen: Dach, Rohrpost (0 = keine, 1 = normal, 2 = dicht), Streu, Requisiten [Sprite, Anzahl, { licht, fest, lampe }]. */
const TERRASSEN = {
  cw_gleisfuss: { dach: 'bhd_schiefer', rohr: 0, streu: [['gleis', 21, 0.012], ['gleis', 22, 0.006]],
    req: [['lamp_lit', 4, L], ['cwp_gleisfuss_stationsschild_3', 1, { fest: true }]] },
  cw_setzergasse: { dach: 'bhd_ziegel', rohr: 1, streu: [['', T.rinne, 0.01]],
    req: [['lamp_lit', 4, L], ['cwp_setzergasse_papierballen', 2, { fest: true }], ['cwp_setzergasse_brotdose', 1, {}]] },
  cw_quittungsmarkt: { dach: 'bhd_kupfer', rohr: 1, streu: [['', T.rinne, 0.012]],
    req: [['lamp_lit', 4, L], ['cwp_quittungsmarkt_herkunftskiste', 2, { fest: true }], ['cwp_buchbinderei_kiste', 2, { fest: true }]] },
  cw_roehrenhof: { dach: 'bhd_schiefer', rohr: 2, streu: [['', T.klappe, 0.006], ['', T.rinne, 0.008]],
    req: [['lamp_lit', 4, L], ['cwp_roehrenhof_rohrpost', 2, { fest: true }], ['cwp_buchbinderei_kiste', 1, { fest: true }]] },
  cw_witwenterrasse: { dach: 'bhd_ziegel', rohr: 1, streu: [['', T.beet_trocken, 0.012]],
    req: [['lamp_lit', 3, L], ['cwp_witwenterrasse_waescheleine', 2, { fest: true }], ['cwp_witwenterrasse_heizungsrohr', 1, { fest: true }]] },
  cw_kronenarchiv: { dach: 'bhd_kupfer', rohr: 1, streu: [['', T.rinne, 0.008]],
    req: [['lamp_lit', 6, L], ['cwp_kronenarchiv_statue', 2, { fest: true }]] },
};
/** Innenräume und Gefahrengebiete: zusätzliche Requisiten. */
const REQ_INNEN = {
  cw_buchbinderei: [['oil_lamp', 1, { licht: LAMPE }]],
  cw_pfandhaus: [['cwp_quittungsmarkt_herkunftskiste', 1, { fest: true }], ['oil_lamp', 1, { licht: LAMPE }]],
  cw_kueche: [['cwp_setzergasse_brotdose', 1, {}], ['oil_lamp', 1, { licht: LAMPE }]],
  cw_villa: [['cwp_kronenarchiv_rechenblatt', 1, {}], ['oil_lamp', 2, { licht: LAMPE }]],
  cw_archivsaal: [['oil_lamp', 2, { licht: LAMPE }]],
  cw_gepaeckhalle: [['cwp_buchbinderei_kiste', 2, { fest: true }], ['oil_lamp', 1, { licht: LAMPE }]],
  cw_sortierhalle: [['oil_lamp', 1, { licht: LAMPE }]],
  cw_druckkammer: [['cwp_setzergasse_papierballen', 1, { fest: true }], ['oil_lamp', 1, { licht: LAMPE }]],
  cw_alte_setzerei: [['cwp_setzergasse_papierballen', 3, { fest: true }], ['cwp_buchbinderei_kiste', 3, { fest: true }], ['cwp_buchbinderei_fallwand', 2, {}]],
  cw_sortiergrube: [['cwp_roehrenhof_rohrpost', 2, { fest: true }], ['cwp_buchbinderei_kiste', 3, { fest: true }]],
  cw_nullfundament: [['cwp_buchbinderei_fallwand', 3, {}], ['cwp_kronenarchiv_hauptpresse', 1, { fest: true }]],
};
const GEFAHR = { cw_alte_setzerei: '#c86a3a', cw_sortiergrube: '#9fc4e8', cw_nullfundament: TUERKIS };

function hash2(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function applyCalderwickKulisse(content) {
  for (const m of Object.values(content.maps)) {
    if (!m.rows?.length) continue;
    if (m.id?.startsWith('cw_') && BLATT[m.tiles]) kulisse(m, { theme: m.tiles });
    else if (m.id?.startsWith('o3_') && m.city === 'calderwick') pfadviertel(content, m);
  }
}

/** Pfadviertel: Briarholt-Blätter bekommen die Briarholt-Kulisse, die Calderwicker Blätter die eigene, alle anderen Häuser; dazu Verderbnis-Glimmen. */
function pfadviertel(content, m) {
  const fog = m.ambient?.fog;
  const pid = m.id.slice(3);
  const farbe = content.pathways?.[pid]?.color ?? '#b78cff';
  if (m.tiles?.startsWith('bh_')) briarholtKulisseFuer(m);
  else kulisse(m, { theme: BLATT[m.tiles] ? m.tiles : null, dach: 'bhd_basalt', pfad: true });
  m.ambient = { ...(m.ambient ?? {}), fog: Math.max(fog ?? 0, m.ambient?.fog ?? 0) };
  const H = m.rows.length;
  const W = m.rows[0].length;
  m.lights ??= [];
  for (let i = 0; i < Math.round((W * H) / 130); i++) {
    const x = 2 + Math.floor(hash2(i, H, 501) * (W - 4));
    const y = 2 + Math.floor(hash2(W, i, 502) * (H - 4));
    if ('.swg'.includes(m.rows[y][x])) m.lights.push({ tile: [x, y], radius: 44, intensity: 0.28, color: farbe, flicker: 0.15 });
  }
}

function kulisse(m, { theme, dach, pfad = false }) {
  const rows = m.rows;
  const H = rows.length;
  const W = rows[0].length;
  const aussen = !theme || theme === 'cw_terrasse';
  const terr = TERRASSEN[m.id];
  const innen = INNEN[theme];
  const blatt = BLATT[theme] ?? 'cwt_terrasse';
  const at = (x, y) => rows[y]?.[x];
  const wand = (x, y) => { const c = at(x, y); return c === undefined || c === 'I'; };
  const boden = (x, y) => '.swg'.includes(at(x, y) ?? 'I');
  const key = (x, y) => `${x},${y}`;
  m.decor ??= [];
  m.lights ??= [];
  const objekte = [...(m.interactables ?? []).map((i) => i.tile), ...(m.npcs ?? []).map((n) => n.tile), ...Object.values(m.spawns ?? {}), ...(m.roamers ?? []).map((r) => r.tile)].filter(Boolean);
  const belegt = new Set(objekte.map(([x, y]) => key(x, y)));
  for (const d of m.decor) belegt.add(key(...d.tile));
  const nah = new Set();
  for (const [x, y] of objekte) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) nah.add(key(x + dx, y + dy));
  const fest = new Set();
  const zell = (frame, x, y, extra = {}) => m.decor.push({ sprite: extra.sprite ?? blatt, frame, tile: [x, y], alpha: extra.alpha ?? 1, depth: extra.depth ?? 40, kulisse: true,
    ...(extra.anim ? { anim: extra.anim } : {}) });
  const fenster = [];

  // 1) Wandblöcke im Inneren der Karte: Häuser (außen) oder Möbel (innen)
  const gesehen = new Set();
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!wand(x, y) || gesehen.has(key(x, y))) continue;
    const teil = [];
    const q = [[x, y]];
    gesehen.add(key(x, y));
    let rand = false;
    while (q.length) {
      const [cx, cy] = q.pop();
      teil.push([cx, cy]);
      if (cx === 0 || cy === 0 || cx === W - 1 || cy === H - 1) rand = true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || gesehen.has(key(nx, ny)) || !wand(nx, ny)) continue;
        gesehen.add(key(nx, ny));
        q.push([nx, ny]);
      }
    }
    if (rand) continue;
    const xs = teil.map((p) => p[0]);
    const ys = teil.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    if (teil.length !== (x1 - x0 + 1) * (y1 - y0 + 1)) continue; // nur Rechtecke
    if (aussen) haus({ x0, x1, y0, y1 });
    else moebel({ x0, x1, y0, y1 });
  }

  function haus({ x0, x1, y0, y1 }) {
    const d = dach ?? terr?.dach ?? 'bhd_schiefer';
    if (x1 === x0) { // einzelner Pfeiler: Rußsäule mit Rohr
      for (let y = y0; y <= y1; y++) zell(y === y1 ? T.russ : T.rohr_v, x0, y, { sprite: 'cwt_terrasse' });
      return;
    }
    const hoch = y1 - y0 + 1;
    if (hoch === 1) { // niedrige Mauer: Stützmauer der Terrasse
      for (let x = x0; x <= x1; x++) zell(11, x, y0, { sprite: 'cwt_terrasse' });
      return;
    }
    const dachReihen = Math.max(1, hoch - 2);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (y < y0 + dachReihen) { m.decor.push({ sprite: d, frame: 0, tile: [x, y], alpha: 1, depth: 40, kulisse: true }); continue; }
      const unten = y === y1;
      let f;
      if (!unten) f = x === x0 ? T.f_links : x === x1 ? T.f_rechts : [T.fenster_licht, T.fenster_dunkel, T.fenster_trueb, T.fenster_licht][Math.floor(hash2(x, y, 610) * 4)];
      else f = x === Math.floor((x0 + x1) / 2) && hash2(x0, y0, 611) < 0.6 ? T.tuer : x === x0 || x === x1 ? T.sockel : hash2(x, y, 612) < 0.5 ? T.fenster_dunkel : T.sockel;
      zell(f, x, y, { sprite: 'cwt_terrasse' });
      if (f === T.fenster_licht) fenster.push([x, y, pfad ? 0.3 : 0.45]);
    }
    // Schornstein-Rauch: eine Rohrklappe auf dem Dach
    if (hash2(x0, y0, 613) < 0.5) zell(T.klappe, x1, y0, { sprite: 'cwt_terrasse', depth: 41 });
  }

  function moebel({ x0, x1, y0, y1 }) {
    if (theme === 'cw_fundament' && x1 === x0) { // Druckwalzensäule
      for (let y = y0; y <= y1; y++) zell(y === y0 ? 20 : y === y1 ? 22 : 21, x0, y);
      return;
    }
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      let f;
      if (y === y0) f = innen.oben[0];
      else if (y === y1 && innen.unten != null && x === Math.floor((x0 + x1) / 2)) f = innen.unten;
      else if (x === x0 && innen.links != null) f = innen.links;
      else if (x === x1 && innen.rechts != null) f = innen.rechts;
      else f = innen.mitte[0];
      zell(f, x, y, f === 10 && theme === 'cw_fundament' ? { anim: ['cwt_fundament', 'namensnische'] } : {});
      if (f === 10 && theme === 'cw_fundament') m.lights.push({ tile: [x, y], radius: 30, intensity: 0.4, color: TUERKIS, flicker: 0.1 });
    }
  }

  // 2) Außenwände mit Boden davor: Rohre, Klappen, Schilder (außen) bzw. Pinnwände, Regale, Nischen (innen)
  for (let y = 0; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!wand(x, y) || !boden(x, y + 1) || belegt.has(key(x, y))) continue;
    if (!(y === 0 || x === 0 || x === W - 1)) continue; // Blöcke hat Schritt 1 schon
    if (hash2(x, y, 620) > (aussen ? 0.22 : 0.3)) continue;
    if (aussen) {
      const f = [T.schild, T.rohr_v, T.russ, T.klappe, T.fenster_licht][Math.floor(hash2(x, y, 621) * 5)];
      zell(f, x, y, { sprite: 'cwt_terrasse' });
      if (f === T.fenster_licht) fenster.push([x, y, 0.4]);
    } else {
      const f = innen.fassade[Math.floor(hash2(x, y, 621) * innen.fassade.length)];
      zell(f, x, y, f === 10 && theme === 'cw_fundament' ? { anim: ['cwt_fundament', 'namensnische'] } : {});
      if (f === 10 && theme === 'cw_fundament') m.lights.push({ tile: [x, y], radius: 30, intensity: 0.4, color: TUERKIS, flicker: 0.1 });
    }
  }

  // 3) Terrassen: Geländer an der Südkante (die Stadt fällt dort zur nächsten Terrasse ab)
  if (terr) for (let x = 1; x < W - 1; x++) if (wand(x, H - 1) && boden(x, H - 2) && !belegt.has(key(x, H - 1))) zell(T.gelaender, x, H - 1, { sprite: 'cwt_terrasse', depth: 41 });

  // 4) Rohrpost unter der Nordwand, Abzweige zu den Häusern
  if (terr?.rohr) rohrpost(terr.rohr);

  // 5) Möbel vor der Nordwand (innen)
  if (innen?.wand?.length) {
    let luecke = 0;
    const y = 1;
    for (let x = 1; x < W - 1; x++) {
      if (!wand(x, 0) || !boden(x, y)) { luecke = 0; continue; }
      if (++luecke < 3 || hash2(x, y, 630) > 0.45) continue;
      const stueck = innen.wand[Math.floor(hash2(x, y, 631) * innen.wand.length)];
      const felder = stueck.map((_, i) => [x + i, y]);
      if (!felder.every(([fx, fy]) => boden(fx, fy) && wand(fx, fy - 1) && boden(fx, fy + 1) && boden(fx, fy + 2) && !nah.has(key(fx, fy)) && !belegt.has(key(fx, fy)))) continue;
      stueck.forEach((f, i) => {
        const [fx, fy] = felder[i];
        m.decor.push({ sprite: blatt, frame: f, tile: [fx, fy], alpha: 1, depth: 41, kulisse: true, moebel: true });
        belegt.add(key(fx, fy));
        fest.add(key(fx, fy));
      });
      luecke = -stueck.length;
    }
  }

  // 6) Flache Einzelstücke auf dem Boden
  const streu = terr?.streu ?? (innen ? innen.streu.map(([f, p]) => ['', f, p]) : [['', T.gully, 0.01]]);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!boden(x, y) || belegt.has(key(x, y))) continue;
    let acc = 0;
    const r = hash2(x, y, 640);
    for (const [sheet, f, p] of streu) {
      if (r < (acc += p)) {
        zell(f, x, y, { sprite: sheet === 'gleis' ? 'cwt_gleis' : aussen ? 'cwt_terrasse' : blatt, depth: 39 });
        belegt.add(key(x, y));
        break;
      }
    }
  }

  // 7) Requisiten, verteilt nach größtem Abstand; Kollision nur, wenn alles erreichbar bleibt
  const req = terr?.req ?? REQ_INNEN[m.id] ?? [];
  const plaetze = [];
  for (let y = 2; y < H - 1; y++) for (let x = 2; x < W - 2; x++) {
    const fuss = [[x - 1, y], [x, y], [x + 1, y]];
    if (!fuss.every(([fx, fy]) => boden(fx, fy) && !belegt.has(key(fx, fy)) && !nah.has(key(fx, fy)) && !fest.has(key(fx, fy)))) continue;
    if (!boden(x, y + 1) || !boden(x, y - 1) || !boden(x, y - 2)) continue;
    plaetze.push([x, y]);
  }
  const gesetzt = objekte.map(([x, y]) => [x, y]);
  for (const d of m.decor) if (d.sprite?.startsWith('cwp_')) gesetzt.push(d.tile);
  for (const [sprite, anzahl, opt] of req) {
    for (let i = 0; i < anzahl; i++) {
      let best = null;
      let bestD = -1;
      for (const [x, y] of plaetze) {
        if (belegt.has(key(x, y)) || belegt.has(key(x - 1, y)) || belegt.has(key(x + 1, y))) continue;
        const d = Math.min(...gesetzt.map(([gx, gy]) => Math.hypot(gx - x, gy - y))) + hash2(x, y, 650 + i) * 1.5;
        if (d > bestD) { bestD = d; best = [x, y]; }
      }
      if (!best || bestD < 3) break;
      const [x, y] = best;
      gesetzt.push(best);
      for (let dx = -1; dx <= 1; dx++) belegt.add(key(x + dx, y));
      const d = { sprite, tile: [x, y], origin: [0.5, 1], offset: [0, 8], alpha: 1, ysort: true, kulisse: true };
      const solid = opt.fest || opt.lampe;
      if (solid && erreichbarMit(m, { W, H, boden, fest, neu: [key(x, y)] })) { d.solid = opt.lampe ? [6, 6, 0, -3] : [12, 8, 0, -4]; fest.add(key(x, y)); }
      if (opt.licht) m.lights.push({ tile: [x, y - (opt.lampe ? 2 : 1)], radius: opt.lampe ? 60 : 44, intensity: 0.7, color: opt.licht, glow: 0.2, flicker: 0.08 });
      m.decor.push(d);
    }
  }
  // Wandmöbel: Kollision nur, wenn danach alles erreichbar ist
  const moebelStuecke = m.decor.filter((d) => d.moebel);
  const ok = !fest.size || erreichbarMit(m, { W, H, boden, fest, neu: [] });
  for (const d of moebelStuecke) {
    delete d.moebel;
    if (ok) d.solid = [14, 12, 0, 0];
  }

  // 8) Licht und Nebel
  for (const [x, y, i] of fenster) m.lights.push({ tile: [x, y], radius: 26, intensity: i, color: LAMPE, flicker: 0.05 });
  if (!pfad) {
    const g = GEFAHR[m.id];
    m.ambient = { ...(m.ambient ?? {}), fog: terr ? 0.13 : g ? 0.18 : m.ambient?.fog ?? 0.02 };
    if (g) for (let i = 0; i < Math.round((W * H) / 180); i++) {
      const x = 2 + Math.floor(hash2(i, H, 660) * (W - 4));
      const y = 2 + Math.floor(hash2(W, i, 661) * (H - 4));
      if (boden(x, y)) m.lights.push({ tile: [x, y], radius: 40, intensity: 0.22, color: g, flicker: 0.06 });
    }
  }

  function rohrpost(dicht) {
    const yr = [1, 2].find((y) => [...Array(W - 2).keys()].filter((i) => boden(i + 1, y)).length > W * 0.7);
    if (yr == null) return;
    const lege = (f, x, y) => { if (belegt.has(key(x, y))) return; zell(f, x, y, { sprite: 'cwt_terrasse', depth: 38, alpha: 0.95 }); belegt.add(key(x, y)); };
    const abzweig = new Map();
    const abstand = dicht === 2 ? 2 : 4;
    for (let x = 2; x < W - 2; x++) {
      let y = yr + 1;
      while (boden(x, y) && y - yr <= 12) y++;
      if (!wand(x, y) || y - yr > 12 || y - yr < 3 || y >= H - 1) continue;
      if (!wand(x - 1, y) || !wand(x + 1, y)) continue;
      if ([...abzweig.keys()].some((ax) => x - ax <= abstand)) continue;
      abzweig.set(x, y);
    }
    let start = 1;
    while (start < W - 1 && !boden(start, yr)) start++;
    for (let x = start; x < W - 1 && boden(x, yr); x++) {
      lege(x === start ? T.rohr_sw : abzweig.has(x) ? T.rohr_t : T.rohr_h, x, yr);
      if (!abzweig.has(x)) continue;
      const ende = abzweig.get(x);
      for (let y = yr + 1; y < ende; y++) lege(y === ende - 1 ? T.klappe : T.rohr_v, x, y);
    }
  }
}
