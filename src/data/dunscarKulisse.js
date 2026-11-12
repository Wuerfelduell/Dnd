/**
 * Dunscar-Raster und Kulisse (Seb 2026-11-12: „die Map ist nicht standardisiert, alles ist irgendwo“).
 *
 * Paket AS hatte jede Außenkarte als leeren Kasten geliefert; die Pakete danach haben Figuren, Lesestellen und Türen
 * dort abgelegt, wo gerade Platz war (meist oben links). Hier bekommt jedes Viertel dasselbe Raster, ohne die
 * Kartendateien anzufassen:
 *
 *   Nordseite (Reihe 1–3)  Häuserzeile; Türen in Innenräume immer dort, mit Fassade (Reihe 4)
 *   Hauptstraßen           waagrecht Reihe 10–11, senkrecht Spalte 21–22; Ausgänge an ihren Enden in Himmelsrichtung
 *                          des Ziels auf der Stadtkarte (N oben, S unten, W links, O rechts)
 *   Platz (Kreuzung)       Ankunft, Stadtkarte, Viertelstafel und ein Ortskundiger
 *   Nordwest               Aushänge, Spuren und Lesestellen
 *   Nordost                Leute und Gespräche
 *   Südwest                Händler und Dienste
 *   Südost                 weitere Leute
 *   Südrand (Reihe 18–20)  Kulisse, Streifen
 *
 * Gefahrengebiete: Eingang auf der Seite, von der man kommt; gleich dahinter das Lager (Lesestellen, Gespräche),
 * dann die Gegner, der Gebietsboss am weitesten weg. Jede Tür trägt ein Schild (`label`), wer durch eine Tür kommt,
 * steht an der Tür, die zurückführt (Spawn `von_<karte>`).
 */
import { DS_KULISSE, DS_STRASSE } from './dunscarKulisseDaten.js';
import { DS_ORTSKUNDIGE } from './dunscarOrtskundige.js';
import { DS_ZIRKEL } from './dunscarZirkel.js';

/** Stadtkarten-Pins (k3_orte/city.json) plus Orte ohne eigenen Pin. */
const EXTRA_PINS = { ds_letzter_bahnsteig: [440, 150] };
const PIN_W = 480;
const PIN_H = 270;
const ARROW = { W: '← ', E: '', N: '↑ ', S: '↓ ' };
const ARROW_END = { E: ' →' };
const SEITE = { N: 'Norden', S: 'Süden', W: 'Westen', E: 'Osten' };
/** Fassade vor der Haustür, je Ziel. */
const FASSADE = {
  ds_teesaal: 'dsp_kalkmarkt_tea_room_facade', ds_pruefhaus: 'dsp_bruchsignal_sound_testing_house_facade', ds_runddepot: 'dsp_schwellenring_roundhouse_doors',
  ds_lohnbuero: 'dsp_arbeiterbogen_limestone_doorway', ds_speisewagen: 'dsp_arbeiterbogen_limestone_doorway',
};
/** Zirkel, deren Treffpunkt nicht über DS_ZIRKEL läuft. */
const ZIRKEL_EXTRA = { ds_schwellenring: 'Der Schichtbund (Eingang im Runddepot)' };

// --- Viertel-Raster (44 x 22) -----------------------------------------------------------------------------------------
export const RASTER = {
  W: 44, H: 22,
  strasseY: [10, 11], strasseX: [21, 22],
  haeuser: [8, 14, 29, 35], hausY: 4,
  ausgang: { W: [[1, 10], [1, 6], [1, 15]], E: [[42, 10], [42, 6], [42, 15]], N: [[21, 1], [22, 1]], S: [[21, 20], [14, 20], [29, 20]] },
  stadtkarte: [19, 9], tafel: [24, 9], ortskundig: [24, 12], ankunft: [21, 12],
  zonen: { NW: [2, 5, 18, 8], NE: [25, 5, 41, 8], SW: [2, 13, 18, 17], SE: [25, 13, 41, 17] },
  streifen: [[6, 19], [16, 19], [28, 19], [38, 19]],
};
const BAHN_ZONEN = { haendler: ['SW', 'SE', 'NE', 'NW'], leute: ['NE', 'SE', 'SW', 'NW'], lesen: ['NW', 'SW', 'SE', 'NE'] };

const key = (x, y) => `${x},${y}`;
const isFloor = (m, x, y) => /[.swg]/.test(m.rows[y]?.[x] ?? '');
const istAussen = (m) => m?.id?.startsWith('ds_') && m.rows?.[0]?.length >= 40;
const istGefahr = (m) => istAussen(m) && m.rows.length >= 28;

/** Häuserzeile oben, Ränder als Wand, Rest Boden; oben in der Mitte bleibt die Straße nach Norden offen. */
function rasterZeilen(fc) {
  const { W, H, strasseX } = RASTER;
  return Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    if (x === 0 || x === W - 1 || y === 0 || y === H - 1) return 'I';
    if (y <= 3 && !(x >= strasseX[0] - 1 && x <= strasseX[1] + 1)) return 'I';
    return fc;
  }).join(''));
}

/** Seite und Lage entlang der Kante aus den Stadtkarten-Pins. */
function richtung(pins, from, to) {
  const a = pins[from];
  const b = pins[to];
  if (!a || !b) return 'S';
  const dx = (b[0] - a[0]) / PIN_W;
  const dy = (b[1] - a[1]) / PIN_H;
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'W' : 'E';
  return dy < 0 ? 'N' : 'S';
}
const GEGEN = { N: 'S', S: 'N', W: 'E', E: 'W' };
const NACHBAR = { N: ['E', 'W', 'S'], S: ['W', 'E', 'N'], W: ['S', 'N', 'E'], E: ['N', 'S', 'W'] };
const innen = (side, [x, y]) => (side === 'W' ? [x + 1, y] : side === 'E' ? [x - 1, y] : side === 'N' ? [x, y + 1] : [x, y - 1]);

function kategorie(content, o, isNpc) {
  if (isNpc) return content.market?.merchants?.[o.id] ? 'haendler' : 'leute';
  return o.kind === 'read' || o.kind === 'clue' ? 'lesen' : 'leute';
}

/** Freie Plätze einer Zone: Leute jede zweite Reihe, Lesestellen jede Reihe, immer jede zweite Spalte. */
function zonenPlaetze(rect, leute) {
  const [x0, y0, x1, y1] = rect;
  const out = [];
  for (let y = y0; y <= y1; y += leute ? 2 : 1) for (let x = x0 + (x0 % 2); x <= x1; x += 2) out.push([x, y]);
  return out;
}

function viertel(content, id, m, pins, schilder, fest) {
  const fc = (m.rows.join('').match(/[.swg]/g) ?? ['.'])[0];
  const old = { ...m };
  // Horchstellen der Signalrouten (Paket BN) bleiben begehbar und an ihrem Platz, auch in der Häuserzeile (Nischen)
  m.rows = rasterZeilen(fc).map((row, y) => [...row].map((c, x) => (fest.has(key(x, y)) && x > 0 && x < RASTER.W - 1 && y > 0 && y < RASTER.H - 1 ? fc : c)).join(''));
  const taken = new Set(fest);
  const nimm = (t) => taken.add(key(...t));
  const bleibt = (o) => fest.has(key(...o.tile));
  const spawns = { default: RASTER.ankunft };
  // Platz
  for (const t of [RASTER.stadtkarte, RASTER.tafel, RASTER.ortskundig, RASTER.ankunft]) nimm(t);
  // Straßen frei halten
  for (let x = 1; x < RASTER.W - 1; x++) for (const y of RASTER.strasseY) nimm([x, y]);
  for (let y = 1; y < RASTER.H - 1; y++) for (const x of RASTER.strasseX) nimm([x, y]);

  const frei = { ...Object.fromEntries(Object.entries(RASTER.ausgang).map(([k, v]) => [k, [...v]])), haus: RASTER.haeuser.map((x) => [x, RASTER.hausY]) };
  const ausgaenge = [];
  const inter = [];
  const rest = [];
  for (const d of old.interactables ?? []) {
    if (d.kind === 'travel') { inter.push({ ...d, tile: RASTER.stadtkarte, label: 'Stadtkarte', marker: true }); continue; }
    if (d.kind !== 'door' || !content.maps[d.to]) { (bleibt(d) ? inter : rest).push(d); continue; }
    const ziel = content.maps[d.to];
    const haus = !istAussen(ziel);
    let side = haus ? 'haus' : richtung(pins, id, d.to);
    if (!frei[side]?.length) side = [...(NACHBAR[side] ?? []), 'S', 'N', 'W', 'E'].find((s) => frei[s].length);
    const tile = frei[side].shift();
    nimm(tile);
    const vor = haus ? [tile[0], tile[1] + 1] : innen(side, tile);
    nimm(vor);
    spawns[`von_${d.to}`] = vor;
    const gefahr = ziel.danger ? ` ⚠${ziel.danger}` : '';
    const label = haus ? (ziel.name ?? d.to) : `${ARROW[side]}${ziel.name ?? d.to}${gefahr}${ARROW_END[side] ?? ''}`;
    ausgaenge.push({ side, name: ziel.name ?? d.to, haus, gefahr: ziel.danger, to: d.to });
    inter.push({ ...d, tile, label, marker: true });
  }
  // Übrige Objekte: Gruppen gleicher alter Kachel bleiben zusammen (Tag/Nacht, Aktwechsel)
  const items = [
    ...(old.npcs ?? []).filter((o) => !bleibt(o)).map((o) => ({ o, npc: true })),
    ...rest.map((o) => ({ o, npc: false })),
  ].sort((a, b) => a.o.tile[1] - b.o.tile[1] || a.o.tile[0] - b.o.tile[0]);
  const neu = new Map(); // `${kat}|${alte Kachel}` → neue Kachel
  const plaetze = {};
  const naechster = (kat) => {
    for (const z of BAHN_ZONEN[kat]) {
      const leute = kat !== 'lesen';
      const list = (plaetze[`${z}|${leute}`] ??= zonenPlaetze(RASTER.zonen[z], leute));
      while (list.length) {
        const t = list.shift();
        if (taken.has(key(...t))) continue;
        // Figuren nicht direkt übereinander stapeln
        if (leute && (taken.has(key(t[0], t[1] - 1)) || taken.has(key(t[0], t[1] + 1)))) continue;
        nimm(t);
        return t;
      }
    }
    // Notfall: irgendeine freie Bodenkachel
    for (let y = 5; y < RASTER.H - 2; y++) for (let x = 2; x < RASTER.W - 2; x++) if (!taken.has(key(x, y))) { nimm([x, y]); return [x, y]; }
    return RASTER.ankunft;
  };
  const npcs = (old.npcs ?? []).filter(bleibt);
  for (const { o, npc } of items) {
    const kat = kategorie(content, o, npc);
    const k = `${kat}|${o.tile}`;
    if (!neu.has(k)) neu.set(k, naechster(kat));
    (npc ? npcs : inter).push({ ...o, tile: neu.get(k) });
  }
  // Viertelstafel und Ortskundiger
  const ok = DS_ORTSKUNDIGE[id];
  if (ok) npcs.push({ id: ok.id, tile: RASTER.ortskundig, facing: 'down', visible_if: { requires_flags: ['k3_arrived'] } });
  inter.push({ id: `ds_tafel_${id.slice(3)}`, kind: 'read', tile: RASTER.tafel, prompt: 'Viertelstafel lesen', title: `Viertelstafel: ${old.name}`,
    text: tafelText(content, id, old.name, ausgaenge, npcs), marker: false, label: 'Viertelstafel' });
  // Streifen der Aufsicht laufen auf der Hauptstraße, Stadtgegner am Südrand
  const patrols = (old.patrols ?? []).map((p, i) => {
    const [bx] = p.route?.[0] ?? [0, 0];
    const x0 = 26 + i * 6;
    return { ...p, route: (p.route ?? []).map(([x]) => [Math.min(RASTER.W - 3, x0 + (x - bx)), RASTER.strasseY[1]]) };
  });
  const roamers = (old.roamers ?? []).map((r, i) => ({ ...r, tile: RASTER.streifen[i % RASTER.streifen.length] }));
  // Eigene Spawns (Zug, Steg): auf den Platz
  for (const [name, t] of Object.entries(old.spawns ?? {})) {
    if (name in spawns || name.startsWith('von_')) continue;
    spawns[name] = isFloor(m, ...t) && !taken.has(key(...t)) ? t : RASTER.ankunft;
    nimm(spawns[name]);
  }
  Object.assign(m, { interactables: inter, npcs, patrols, roamers, spawns });
  for (const a of ausgaenge) schilder.push([id, a]);
  // Straßen sichtbar machen
  const st = DS_STRASSE[m.tiles];
  if (st) {
    for (let x = 1; x < RASTER.W - 1; x++) for (const y of RASTER.strasseY) m.decor.push({ sprite: st[0], frame: st[1], tile: [x, y], alpha: 1, depth: 40 });
    for (let y = 4; y < RASTER.H - 1; y++) for (const x of RASTER.strasseX) if (!RASTER.strasseY.includes(y)) m.decor.push({ sprite: st[0], frame: st[1], tile: [x, y], alpha: 1, depth: 40 });
  }
  for (const a of inter.filter((d) => d.kind === 'door')) {
    const ziel = content.maps[a.to];
    if (!istAussen(ziel)) {
      const f = FASSADE[a.to];
      if (f) m.decor.push({ sprite: f, tile: a.tile, offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true });
      m.lights.push({ tile: a.tile, radius: 40, intensity: 0.6, color: '#ffc782', flicker: 0.1 });
    } else m.lights.push({ tile: a.tile, radius: 56, intensity: 0.75, color: ziel.danger ? '#ff8a6a' : '#ffc782', glow: 0.2, flicker: 0.1 });
  }
  // Stadtkarte und Viertelstafel stehen als Tafeln am Platz
  for (const t of [RASTER.tafel, ...(m.interactables.some((d) => d.kind === 'travel') ? [RASTER.stadtkarte] : [])]) m.decor.push({ sprite: 'dsp_endbahnhof_blank_timetable_board', tile: t, offset: [0, 8], origin: [0.5, 1], alpha: 1, ysort: true });
  for (const d of m.interactables) if (d.tile === RASTER.stadtkarte || d.tile === RASTER.tafel) d.label_dy = 44;
  m.lights.push({ tile: RASTER.tafel, radius: 60, intensity: 0.7, color: '#ffc782', glow: 0.2, flicker: 0.06 });
  return taken;
}

/** Text der Viertelstafel: was es hier gibt und wohin es geht. */
function tafelText(content, id, name, ausgaenge, npcs) {
  const zeilen = [`${name}. Jedes Viertel in Dunscar ist gleich angelegt: Häuser im Norden, Hauptstraßen über Kreuz, Ausgänge an den Straßenenden. Nordwest Aushänge und Spuren, Nordost Leute, Südwest Händler, Südost weitere Leute.`];
  const wege = ausgaenge.filter((a) => !a.haus).map((a) => `${SEITE[a.side]}: ${a.name}${a.gefahr ? ` (Gefahr ${a.gefahr})` : ''}`);
  if (wege.length) zeilen.push(`Wege: ${wege.join(' · ')}.`);
  const haeuser = ausgaenge.filter((a) => a.haus).map((a) => a.name);
  if (haeuser.length) zeilen.push(`Häuser an der Nordseite: ${haeuser.join(', ')}.`);
  const haendler = [...new Set(npcs.filter((n) => content.market?.merchants?.[n.id]).map((n) => content.npcs[n.id]?.name).filter(Boolean))];
  if (haendler.length) zeilen.push(`Händler (Südwest): ${haendler.join(', ')}.`);
  const zirkel = [...Object.values(DS_ZIRKEL).filter((z) => z.exit === id).map((z) => `${z.name} (Treffpunkt auf der Stadtkarte)`), ...(ZIRKEL_EXTRA[id] ? [ZIRKEL_EXTRA[id]] : [])];
  if (zirkel.length) zeilen.push(`Zirkel: ${zirkel.join(', ')}.`);
  const ok = DS_ORTSKUNDIGE[id];
  if (ok?.tafel) zeilen.push(ok.tafel);
  return zeilen.join('\n');
}

/** Gefahrengebiet: Eingang auf der Heimseite, Lager dahinter, Gegner verteilt, Gebietsboss am weitesten weg. */
function gefahrengebiet(content, id, m, side, fest) {
  const W = m.rows[0].length;
  const H = m.rows.length;
  const taken = new Set(fest);
  const nimm = (t) => taken.add(key(...t));
  const mitte = { W: [1, Math.floor(H / 2)], E: [W - 2, Math.floor(H / 2)], N: [Math.floor(W / 2), 1], S: [Math.floor(W / 2), H - 2] }[side];
  // nächste Bodenkachel an der Kante
  const kante = [];
  for (let i = 1; i < (side === 'W' || side === 'E' ? H - 1 : W - 1); i++) {
    const t = side === 'W' || side === 'E' ? [mitte[0], i] : [i, mitte[1]];
    if (isFloor(m, ...t) && isFloor(m, ...innen(side, t))) kante.push(t);
  }
  kante.sort((a, b) => Math.abs(a[0] - mitte[0]) + Math.abs(a[1] - mitte[1]) - (Math.abs(b[0] - mitte[0]) + Math.abs(b[1] - mitte[1])));
  const tor = kante[0] ?? mitte;
  const vor = innen(side, tor);
  nimm(tor);
  nimm(vor);
  const tiefe = (t) => (side === 'W' ? t[0] : side === 'E' ? W - 1 - t[0] : side === 'N' ? t[1] : H - 1 - t[1]);
  const dist = (t) => Math.abs(t[0] - tor[0]) + Math.abs(t[1] - tor[1]);
  const boden = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (isFloor(m, x, y)) boden.push([x, y]);
  // Lager: Lesestellen und Gespräche gleich hinter dem Eingang, jede zweite Kachel
  const lager = boden.filter((t) => tiefe(t) <= 5 && (t[0] + t[1]) % 2 === 0 && dist(t) >= 2).sort((a, b) => dist(a) - dist(b));
  const neu = new Map();
  const inter = (m.interactables ?? []).map((d) => {
    if (fest.has(key(...d.tile))) return d;
    if (d.kind === 'door' && content.maps[d.to]) return { ...d, tile: tor, marker: true, label: `${ARROW[side]}${content.maps[d.to].name}${ARROW_END[side] ?? ''}` };
    if (!neu.has(`${d.tile}`)) {
      let t = lager.shift();
      while (t && taken.has(key(...t))) t = lager.shift();
      neu.set(`${d.tile}`, t ?? d.tile);
      if (t) nimm(t);
    }
    return { ...d, tile: neu.get(`${d.tile}`) };
  });
  // Gegner: Gebietsboss hinten in der Mitte, die übrigen gleichmäßig verteilt (immer der Platz, der am weitesten von allen anderen liegt)
  const feld = boden.filter((t) => tiefe(t) >= 9 && !taken.has(key(...t)));
  const quer = (t) => (side === 'N' || side === 'S' ? Math.abs(t[0] - W / 2) : Math.abs(t[1] - H / 2));
  const bossPlatz = [...feld].sort((a, b) => tiefe(b) - tiefe(a) || quer(a) - quer(b))[0];
  const gewaehlt = [tor, ...(bossPlatz ? [bossPlatz] : [])];
  const md = (t) => Math.min(...gewaehlt.map((g) => Math.abs(g[0] - t[0]) + Math.abs(g[1] - t[1])));
  const roamers = (m.roamers ?? []).map((r) => {
    if (r.respawn && /gebietsboss/.test(r.id ?? '') && bossPlatz) return { ...r, tile: bossPlatz };
    let best = null;
    let bd = -1;
    for (const t of feld) { const d = md(t); if (d > bd) { bd = d; best = t; } }
    if (!best) return r;
    gewaehlt.push(best);
    return { ...r, tile: best };
  });
  Object.assign(m, { interactables: inter, roamers, spawns: { ...m.spawns, default: vor } });
  m.lights.push({ tile: tor, radius: 60, intensity: 0.8, color: '#ffc782', glow: 0.2, flicker: 0.1 });
  return taken;
}

export function applyDunscarKulisse(content) {
  const pins = { ...(content.travelRules?.cities?.dunscar?.pins ?? {}), ...EXTRA_PINS };
  const maps = content.maps;
  const kopie = (id) => (maps[id] = { ...maps[id], rows: [...maps[id].rows], interactables: [...(maps[id].interactables ?? [])], decor: [...(maps[id].decor ?? [])],
    lights: [...(maps[id].lights ?? [])], spawns: { ...(maps[id].spawns ?? {}) }, npcs: [...(maps[id].npcs ?? [])] });
  const schilder = [];
  const belegt = {};
  const fest = {};
  const halt = (map, t) => t && (fest[map] ??= new Set()).add(key(...t));
  for (const st of content.signalRoutes?.stationen ?? []) {
    for (const t of [st.tile, ...(st.safeTiles ?? []), ...(st.routeTiles ?? [])]) halt(st.map, t);
  }
  for (const id of Object.keys(maps).filter((i) => istAussen(maps[i]) && !istGefahr(maps[i]))) belegt[id] = viertel(content, id, kopie(id), pins, schilder, fest[id] ?? new Set());
  // Gefahrengebiete: Eingang dort, wo man aus dem Viertel herkommt
  for (const id of Object.keys(maps).filter((i) => istGefahr(maps[i]))) {
    const herkunft = schilder.find(([, a]) => a.to === id);
    belegt[id] = gefahrengebiet(content, id, kopie(id), herkunft ? GEGEN[herkunft[1].side] : 'W', fest[id] ?? new Set());
  }
  for (const id of Object.keys(belegt)) {
    const m = maps[id];
    const taken = belegt[id];
    for (const o of [...m.interactables, ...m.npcs, ...(m.roamers ?? [])]) taken.add(key(...o.tile));
    for (const t of Object.values(m.spawns)) taken.add(key(...t));
    rand(m, !istGefahr(m));
    kulisse(m, DS_KULISSE[id], taken);
  }
  // Rückweg: wer aus Karte A nach B geht, steht in B an der Tür, die nach A zurückführt (B.spawns.von_A);
  // Gefahrengebiete haben nur einen Eingang: dort heißt der Ankunftsplatz default.
  for (const [id, m] of Object.entries(maps)) {
    if (!id.startsWith('ds_')) continue;
    let changed = false;
    const inter = (m.interactables ?? []).map((d) => {
      if (d.kind !== 'door' || !maps[d.to]) return d;
      const back = maps[d.to].spawns?.[`von_${id}`] ? `von_${id}` : null;
      if (back && d.spawn !== back) { changed = true; return { ...d, spawn: back }; }
      return d;
    });
    if (changed) maps[id] = { ...m, interactables: inter };
  }
  applyOrtskundige(content);
}

/** Je Viertel ein Ortskundiger mit Gespräch (dunscarOrtskundige.js). */
function applyOrtskundige(content) {
  for (const ok of Object.values(DS_ORTSKUNDIGE)) {
    content.npcs[ok.id] = { name: ok.name, role: ok.role, palette: ok.palette, dialogue: ok.id };
    content.dialogues[ok.id] = ok.dialog;
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
  // Streugut: einzelne Bodenzellen (Schutt, Kalkpfützen), fest je Kachel ausgewürfelt
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

/**
 * Wände sollen nicht nach Zelle aussehen (Seb: „sieht aus wie ein Gefängnis“). Wandkacheln bekommen ein Bild aus den
 * AV-Tilesets, das zum Ort passt; die Kollision bleibt, wie sie ist:
 *  - Häuserzeile (Viertel, Reihe 0–3): Fassaden mit Fenstern, Traufkante, Schornsteine; im Bruch eine Kalkterrasse
 *  - Kartenrand: niedrige Mauer (Stadt, Bahn) bzw. Klippenkante (Bruch, Schlucht) statt schwarzer Wand
 *  - Pfeilerblöcke in Gefahrengebieten: Bahnsteigdächer (Bahn), Felsnasen (Bruch), Felswand (Schlucht)
 */
const RAND = {
  ds_stadt: { sheet: 'dst_stadt', h: 18, v: 19 }, ds_bahn: { sheet: 'dst_stadt', h: 18, v: 19 },
  ds_bruch: { sheet: 'dst_bruch', n: 8, s: 9, w: 10, e: 11 }, ds_schlucht: { sheet: 'dst_schlucht', n: 4, s: 5, w: 6, e: 7 },
};
function rand(m, viertel) {
  const W = m.rows[0].length;
  const H = m.rows.length;
  const wall = (x, y) => (m.rows[y]?.[x] ?? 'I') === 'I';
  const put = (sheet, frame, x, y) => m.decor.push({ sprite: sheet, frame, tile: [x, y], alpha: 1, depth: 40 });
  const h = (x, y, n) => Math.abs(Math.sin(x * 91.7 + y * 47.3 + n) * 1e4) % 1;
  const r = RAND[m.tiles] ?? RAND.ds_stadt;
  const bruch = m.tiles === 'ds_bruch' || m.tiles === 'ds_schlucht';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!wall(x, y)) continue;
    const rahmen = x === 0 || x === W - 1 || y === H - 1 || (y === 0 && !viertel);
    if (viertel && y <= 3 && x > 0 && x < W - 1) {
      // Häuserzeile
      if (bruch) put('dst_bruch', y === 3 ? 9 : [0, 1, 2, 3][Math.floor(h(x, y, 1) * 4)], x, y);
      else if (y === 3) put('dst_stadt', h(x, y, 2) < 0.45 ? (h(x, y, 3) < 0.5 ? 13 : 12) : 9, x, y);
      else if (y === 2) put('dst_stadt', x % 3 === 1 ? 13 : 9, x, y);
      else if (y === 1) put('dst_stadt', 8, x, y);
      else put('dst_stadt', h(x, y, 4) < 0.15 ? 17 : 8, x, y);
      continue;
    }
    if (rahmen) {
      if (!bruch) put(r.sheet, x === 0 || x === W - 1 ? r.v : r.h, x, y);
      else put(r.sheet, x === 0 ? r.w : x === W - 1 ? r.e : y === 0 ? r.n : r.s, x, y);
      continue;
    }
    if (viertel) continue;
    // Pfeiler in Gefahrengebieten
    const oben = !wall(x, y - 1);
    const links = !wall(x - 1, y);
    const rechts = !wall(x + 1, y);
    if (m.tiles === 'ds_bahn') put('dst_bahn', oben ? (links ? 20 : rechts ? 22 : 21) : 23, x, y);
    else if (m.tiles === 'ds_bruch') put('dst_bruch', oben ? (links ? 12 : rechts ? 13 : 8) : links ? 14 : rechts ? 15 : 9, x, y);
    else put('dst_schlucht', h(x, y, 5) < 0.2 ? 21 : h(x, y, 6) < 0.5 ? 0 : 1, x, y);
  }
}
