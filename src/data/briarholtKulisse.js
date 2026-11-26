/**
 * Briarholt-Kulisse (Seb 2026-11-26: „Briarholt verschönern, ungenutzte Assets einbauen“), wie Dunscar in PR #548.
 * Läuft nach allen Paketen über jede bh_-Karte (kalt und warm) und legt nur Deko, Licht und Nebel dazu; Kartenraster, Objekte und
 * Wege bleiben, wie runde8_sync sie gesetzt hat.
 * - Dächer: das bisher schwarze Innere der Häuserblöcke bekommt Dachkacheln (Vorrat future200: Kupfer, Schiefer, Ziegel, Basalt;
 *   Glashäuser ihr eigenes Glasdach aus Paket CI).
 * - Fassaden: Fenster, Lüftungen, Manometer, Wandlampen, Wurzeln aus den CI-Tilesets auf den Hausfronten (warm mit Fensterlicht).
 * - Boden: Kanaldeckel, Messingplatten, Gitterroste, Rinnen, Wurzelstränge … als seltene Einzelstücke, dazu Möbelstücke an den Wänden.
 * - Leitungen: das Wärmenetz (fx/bh_waerme) läuft an der Nordwand entlang und zweigt zu den Häusern ab; warm golden mit Dampf,
 *   kalt grau, in den Gefahrengebieten violett belastet.
 * - Requisiten: weitere CI-Stücke (Dampfentladung, Feuerstelle, Pumpenrad, Sudkessel, sprechende Pflanze …) je Ort, mit Licht.
 * Feste Stücke bekommen nur dann eine Kollision, wenn danach noch jedes Objekt und jeder Eingang erreichbar ist.
 */

const ZELLEN = {
  promenade: 'pflaster_1 pflaster_2 pflaster_messing pflaster_rinne pflaster_pfuetze pavillon_boden pavillon_rosette pavillon_stufe kurhaus_gesims kurhaus_wand kurhaus_ecke_links kurhaus_ecke_rechts kurhaus_fenster kurhaus_tuer_oben kurhaus_tuer_unten kurhaus_sockel glasgang_dach_links glasgang_dach_mitte glasgang_dach_rechts glasgang_scheibe glasgang_pfosten glasgang_boden messinggelaender steintreppe palme_krone palme_kuebel postkarten_oben postkarten_fuss bank_links bank_rechts beet kanaldeckel glasgang_scheibe_f2 glasgang_dach_mitte_f2 pflaster_kante_n pflaster_kante_o pflaster_kante_s pflaster_kante_w laternensockel pavillon_saeule',
  kessel: 'werkstatt_boden kopfstein kopfstein_kohlenstaub kondensat_pfuetze gitterrost bordstein_n bordstein_s werkbank rohr_h rohr_v rohr_bogen_so rohr_bogen_sw rohr_bogen_no rohr_bogen_nw rohr_t rohrbruecke_stuetze ventil_zu ventil_kalt ventil_warm dampfaustritt kohlenrutsche kohlenhaufen rohrbruecke_traeger rohr_isoliert waescherei_traufe waescherei_wand waescherei_fenster waescherei_tor_oben waescherei_tor_unten waescherei_lueftung waescherei_sockel waescherei_schild dampfaustritt_f1 dampfaustritt_f2 dampfaustritt_f3 kondensat_rinne rohr_v_manometer abflussgitter kopfstein_2 werkstatt_boden_2',
  glas: 'kiesweg kiesweg_2 kies_kante_n kies_kante_s kies_kante_w kies_kante_o erde trittplatten glaswand_traufe glaswand glaswand_schrift glaswand_pfosten_links glaswand_pfosten_rechts glastuer_oben glastuer_unten glaswand_sockel beet_geschlossen beet_geschlossen_schild beet_offen beet_pflanze beet_bluete beet_rand_n beet_rand_s beet_ecke rinne_h rinne_v rinne_ecke rinne_kreuzung rinne_ende rinne_schieber eisensaeule anzucht_regal beet_bluete_f2 rinne_h_f2 rinne_v_f2 rinne_ecke_f2 kies_laub erde_saatreihen glasdach glasdach_first',
  stille: 'fliesen fliesen_abfluss dielen dielen_2 linoleum fliesen_dielen_kante schwelle dielen_fleck wand_oben wand wand_ecke_links wand_ecke_rechts fenster_links fenster_rechts tuer_oben tuer_unten bett_kopf bett_fuss tafel_radiert nachttisch stuhl speisetisch_links speisetisch_rechts bank herd_oben herd_unten teeschrank spuele stationstresen_links stationstresen_rechts aktenregal heizkoerper herd_oben_f2 herd_unten_f2 fenster_links_f2 fenster_rechts_f2 vorhang garderobe wanduhr dielen_teppich',
  wurzel: 'boden boden_2 geroell boden_wurzel_h boden_wurzel_v boden_pfuetze boden_wandfuss stufen wand_oben wand wand_wurzel_a wand_wurzel_b wand_wurzelknoten wand_wurzel_schild wand_tropfen wand_stuetze wurzelwand_ol wurzelwand_om wurzelwand_or wurzelwand_ul wurzelwand_um wurzelwand_ur wurzel_spitze wurzel_schild_haengend decke_wurzeln stollen_ecke_links stollen_ecke_rechts eingang_oben eingang_unten tropfstelle kiste boden_3 wurzelwand_om_f1 wurzelwand_om_f2 wurzelwand_om_f3 wand_tropfen_f2 tropfstelle_f2 wand_2 boden_wurzel_duenn wand_wurzel_quer',
  klinik: 'pumpen_boden pumpen_boden_adern labor_fliesen labor_fliesen_adern parkett parkett_2 stollen_boden stollen_boden_adern pumpe_oben pumpe_unten manometer gusswand_oben gusswand rohr_gross_v hebelbank laufsteg sudkessel_fundament_links sudkessel_fundament_rechts labortisch_links labortisch_rechts abzug fliesenwand_oben fliesenwand ausguss zeichenschrank_oben zeichenschrank_unten zeichenpult tapete_oben tapete kamin stollen_eingang_oben stollen_eingang_unten pumpen_boden_adern_f1 pumpen_boden_adern_f2 pumpen_boden_adern_f3 parkett_adern stollen_wand stollen_stuetze wandlampe gittertor',
};
const zelle = (set, name) => {
  const i = ZELLEN[set].split(' ').indexOf(name);
  if (i < 0) throw new Error(`Briarholt-Kulisse: Zelle ${name} fehlt in ${set}`);
  return i;
};

/** Thema der Karte → Tileset (Labor und Mutterhaus liegen auf dem Klinik-Blatt). */
const SET_OF = { bh_promenade: 'promenade', bh_kessel: 'kessel', bh_glas: 'glas', bh_stille: 'stille', bh_klinik: 'klinik', bh_labor: 'klinik', bh_mutterhaus: 'klinik', bh_wurzel: 'wurzel' };
/** Dachkacheln aus dem Vorrat future200 (Textur-Keys, in assets.js als 16er-Blätter registriert). */
export const BH_DACH_TEXTUREN = {
  bhd_kupfer: 'future200/tiles/future200_196_copper_patina_roofing.png',
  bhd_schiefer: 'future200/tiles/future200_187_slate_roof_shingles.png',
  bhd_ziegel: 'future200/tiles/future200_188_weathered_clay_roof_tiles.png',
  bhd_basalt: 'future200/tiles/future200_191_dark_basalt_blocks.png',
  bhd_kohle: 'future200/tiles/future200_176_coal_scattered_ground.png',
  bhd_schneeruss: 'future200/tiles/future200_185_soot_covered_snow.png',
};

/**
 * Stil je Tileset: dach (Textur oder [Zelle oben, Zelle innen] aus dem eigenen Blatt), streu = [Zelle, Anteil] auf freiem Boden,
 * wand = Stücke (eine oder mehrere Zellen nebeneinander) auf dem Boden vor einer Wand, fassade = Zellen auf Hausfronten
 * (licht: warm leuchtend), anim = Animationsname je Zelle (ohne „reif_“, die kalte Fassung bekommt das Präfix).
 */
const STIL = {
  promenade: {
    dach: 'bhd_kupfer',
    streu: [['kanaldeckel', 0.01], ['pflaster_messing', 0.018], ['pflaster_rinne', 0.012], ['pflaster_pfuetze', 0.01]],
    wand: [['bank_links', 'bank_rechts'], ['beet'], ['palme_kuebel'], ['postkarten_fuss']],
    fassade: [['kurhaus_fenster', true], ['kurhaus_sockel']],
  },
  kessel: {
    dach: 'bhd_schiefer',
    streu: [['gitterrost', 0.012], ['abflussgitter', 0.012], ['kondensat_pfuetze', 0.014], ['kopfstein_kohlenstaub', 0.03], ['werkstatt_boden_2', 0.01]],
    wand: [['kohlenhaufen'], ['werkbank'], ['kohlenrutsche'], ['dampfaustritt']],
    fassade: [['waescherei_fenster', true], ['waescherei_lueftung'], ['rohr_v_manometer'], ['waescherei_schild']],
    anim: { dampfaustritt: 'dampf' },
  },
  glas: {
    dach: ['glasdach_first', 'glasdach'],
    streu: [['kies_laub', 0.025], ['trittplatten', 0.015], ['erde_saatreihen', 0.012], ['rinne_schieber', 0.006]],
    wand: [['anzucht_regal'], ['eisensaeule'], ['beet_pflanze'], ['beet_bluete'], ['beet_geschlossen_schild']],
    fassade: [['glaswand_schrift'], ['glaswand_pfosten_links'], ['glaswand_pfosten_rechts']],
    anim: { beet_bluete: 'bluete' },
  },
  stille: {
    dach: 'bhd_ziegel',
    streu: [['fliesen_abfluss', 0.015], ['dielen_fleck', 0.012], ['dielen_teppich', 0.015]],
    wand: [['heizkoerper'], ['bank'], ['nachttisch'], ['garderobe'], ['teeschrank'], ['stuhl']],
    fassade: [['fenster_links', true], ['fenster_rechts', true], ['wanduhr'], ['vorhang']],
    anim: { fenster_links: 'fenster_links_tropfen', fenster_rechts: 'fenster_rechts_tropfen' },
  },
  klinik: {
    dach: 'bhd_schiefer',
    streu: [['pumpen_boden_adern', 0.02], ['laufsteg', 0.012], ['parkett_adern', 0.008]],
    wand: [['hebelbank'], ['ausguss'], ['labortisch_links', 'labortisch_rechts'], ['zeichenpult'], ['pumpe_unten']],
    fassade: [['manometer'], ['wandlampe', true], ['rohr_gross_v'], ['abzug']],
    anim: { pumpen_boden_adern: 'wurzeladern' },
  },
  wurzel: {
    dach: 'bhd_basalt',
    streu: [['geroell', 0.03], ['boden_wurzel_h', 0.02], ['boden_wurzel_v', 0.02], ['boden_wurzel_duenn', 0.02], ['tropfstelle', 0.01], ['boden_pfuetze', 0.01]],
    wand: [['kiste'], ['wurzel_spitze'], ['geroell']],
    fassade: [['wand_wurzel_a'], ['wand_wurzel_b'], ['wand_wurzelknoten'], ['wand_tropfen'], ['wand_stuetze'], ['wand_wurzel_quer']],
    anim: { tropfstelle: 'tropfstelle', wand_tropfen: 'wand_tropfen' },
  },
};

/** Requisiten je Ort (beide Fassungen): [Sprite oder (warm) => Sprite, Anzahl, { licht, fest, nurWarm, nurKalt }]. Plätze sucht place() selbst. */
const LAMPE = '#ffcf8a';
const GLUT = '#ff8a3a';
const FROST = '#9fc4e8';
const WURZELLICHT = '#b78cff';
const pal = (w) => `bhp_promenade_palme_${w ? 'warm' : 'kalt'}`;
const REQ = {
  bh_kutschenhof: [['bhp_promenade_gaslaterne', 3, { licht: LAMPE }], ['bhp_kutschenhof_dampfentladung', 2, { nurWarm: true }], ['bhp_promenade_kurgaeste_bank', 2, { fest: true }],
    ['bhp_kesselgrund_kiste', 3, { fest: true }], [pal, 2, { fest: true }]],
  bh_kesselgrund: [['bhp_kesselgrund_feuerstelle', 2, { licht: GLUT, fest: true }], ['bhp_kesselgrund_kiste', 4, { fest: true }], ['bhp_kesselgrund_kohlenbunker_voll', 1, { fest: true }],
    ['bhp_kutschenhof_dampfentladung', 2, { nurWarm: true }], ['bhp_promenade_gaslaterne', 2, { licht: LAMPE }], ['bhp_kesselgrund_druckanzeige_hoch', 1, { nurWarm: true }], ['bhp_kesselgrund_druckanzeige_niedrig', 1, { nurKalt: true }]],
  bh_winterpromenade: [['bhp_promenade_gaslaterne', 4, { licht: LAMPE }], [pal, 3, { fest: true }], ['bhp_promenade_kurgaeste_bank', 2, { fest: true }], ['bhp_kutschenhof_wartebank_frost', 1, { fest: true, nurKalt: true }]],
  bh_glasgaerten: [['bhp_glasgaerten_sprechende_pflanze', 2, { nurWarm: true, licht: '#c8ff9a' }], ['bhp_glasgaerten_kapselhalter_kapsel', 2, { fest: true }], ['bhp_glasgaerten_beet_schild', 3, { fest: true }],
    [pal, 2, { fest: true }], ['bhp_promenade_gaslaterne', 2, { licht: LAMPE }]],
  bh_stillenhaeuser: [['bhp_stillenhaeuser_teewagen', 1, { fest: true }], ['bhp_stillenhaeuser_bett_tafel_radiert', 2, { fest: true }], ['bhp_promenade_gaslaterne', 3, { licht: LAMPE }],
    ['bhp_promenade_kurgaeste_bank', 1, { fest: true }]],
  bh_wurzelkranz: [['bhp_wurzelkranz_pumpenrad', 2, { fest: true }], ['bhp_wurzelkranz_sudkessel', 1, { fest: true, licht: GLUT }], ['bhp_promenade_gaslaterne', 3, { licht: LAMPE }],
    ['bhp_kesselgrund_kiste', 3, { fest: true }]],
  bh_buegelraum: [['bhp_kesselgrund_kiste', 2, { fest: true }]],
  bh_kutschenhalle: [['bhp_kesselgrund_kiste', 3, { fest: true }], ['bhp_promenade_gaslaterne', 1, { licht: LAMPE }]],
  bh_pavillon: [['bhp_promenade_kurgaeste_bank', 1, { fest: true }], ['bhp_promenade_gaslaterne', 2, { licht: LAMPE }]],
  bh_verkaufshalle: [['bhp_glasgaerten_kapselhalter_leer', 2, { fest: true }], ['bhp_glasgaerten_sprechende_pflanze', 1, { nurWarm: true, licht: '#c8ff9a' }]],
  bh_speisesaal: [['bhp_stillenhaeuser_kinderzeichnung', 1, {}]],
  bh_labor: [['bhp_wurzelkranz_pumpenrad', 1, { fest: true }]],
  bh_mutterhaus: [['bhp_stillenhaeuser_teewagen', 1, { fest: true }]],
  bh_verteilanlage: [['bhp_wurzelkranz_pumpenrad', 2, { fest: true }]],
  bh_kaltes_palmhaus: [[pal, 6, { fest: true }], ['bhp_glasgaerten_veredelungsschere_gross', 2, { fest: true }], ['bhp_glasgaerten_kapselhalter_leer', 3, { fest: true }],
    ['bhp_glasgaerten_sprechende_pflanze', 2, { nurWarm: true, licht: '#c8ff9a' }], ['bhp_glasgaerten_beet_schild_umgedreht', 2, { fest: true }]],
  bh_verlassene_waescherei: [['bhp_kesselgrund_buegelbrett', 2, { fest: true }], ['bhp_kesselgrund_kiste', 4, { fest: true }], ['bhp_kesselgrund_fallwand', 1, { fest: true }],
    ['bhp_kesselgrund_feuerstelle', 2, { nurWarm: true, fest: true, licht: GLUT }], ['bhp_kutschenhof_dampfentladung', 2, { nurWarm: true }], ['bhp_kesselgrund_lager', 1, { fest: true }]],
  bh_wurzelkammer: [['bhp_waerme_kondensat_sperre', 3, { licht: WURZELLICHT }], ['bhp_kesselgrund_kiste', 4, { fest: true }], ['bhp_wurzelkranz_ruecklauf_versiegelt', 1, { fest: true, nurKalt: true }],
    ['bhp_waerme_ruecklauf_puls', 4, { licht: WURZELLICHT }]],
};
/** Gefahrengebiete: belastete Leitungen, dichterer Nebel. */
const GEFAHR = new Set(['bh_kaltes_palmhaus', 'bh_verlassene_waescherei', 'bh_wurzelkammer']);

/** Gleicher Hash wie textures.js (hash2), damit die Fensterlichter auf den Fenstern des Kachel-Layers liegen. */
function hash2(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function applyBriarholtKulisse(content) {
  for (const m of Object.values(content.maps)) {
    if (!m.id?.startsWith('bh_') || !m.tiles?.startsWith('bh_')) continue;
    const warm = m.tiles.endsWith('_warm');
    const set = SET_OF[m.tiles.replace(/_(kalt|warm)$/, '')];
    if (!set) continue;
    kulisse(m, set, warm, m.id.replace(/__warm$/, ''));
  }
}

function kulisse(m, set, warm, base) {
  const rows = m.rows;
  const H = rows.length;
  const W = rows[0].length;
  const blatt = `bht_${set}_${warm ? 'warm' : 'kalt'}`;
  const stil = STIL[set];
  const at = (x, y) => rows[y]?.[x];
  const wand = (x, y) => { const c = at(x, y); return c === undefined || c === 'I'; };
  const boden = (x, y) => '.swg'.includes(at(x, y) ?? 'I');
  const key = (x, y) => `${x},${y}`;
  m.decor ??= [];
  m.lights ??= [];
  // Belegt: Objekte, Figuren, Eingänge, Gegner und vorhandene Deko; „nah“ hält Möbel und Requisiten ein Feld von Objekten fern
  const objekte = [...(m.interactables ?? []).map((i) => i.tile), ...(m.npcs ?? []).map((n) => n.tile), ...Object.values(m.spawns ?? {}), ...(m.roamers ?? []).map((r) => r.tile)];
  const belegt = new Set(objekte.map(([x, y]) => key(x, y)));
  for (const d of m.decor) belegt.add(key(...d.tile));
  const nah = new Set();
  for (const [x, y] of objekte) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) nah.add(key(x + dx, y + dy));
  const flach = new Set(); // Bodenfelder, die schon ein flaches Stück tragen
  const fest = new Set(); // Felder mit neuer Kollision
  const zell = (name, x, y, extra = {}) => {
    const anim = stil.anim?.[name];
    m.decor.push({ sprite: blatt, frame: zelle(set, name), tile: [x, y], alpha: 1, depth: extra.depth ?? 40, ...(anim ? { anim: [blatt, warm ? anim : `reif_${anim}`] } : {}),
      ...(extra.solid ? { solid: [14, 12, 0, 0] } : {}) });
  };
  const randHaus = (x, y) => x === 0 || y === 0 || x === W - 1 || y === H - 1;

  // 1) Dächer: Wandfelder, unter denen noch zwei Wandreihen liegen, waren schwarz (Kachel-Layer: null)
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!wand(x, y) || !wand(x, y + 1) || !wand(x, y + 2) || randHaus(x, y + 2)) continue;
    const oben = !wand(x, y - 1);
    if (Array.isArray(stil.dach)) m.decor.push({ sprite: blatt, frame: zelle(set, stil.dach[oben ? 0 : 1]), tile: [x, y], alpha: 1, depth: 40 });
    else m.decor.push({ sprite: stil.dach, frame: 0, tile: [x, y], alpha: oben ? 0.82 : 1, depth: 40 });
  }

  // 2) Fassaden: jede Hausfront (Wand mit Boden darunter) bekommt alle paar Felder ein Stück; warm leuchten die Fenster
  const fenster = [];
  for (let y = 0; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!wand(x, y) || !boden(x, y + 1)) continue;
    if (hash2(x, y, 82) > 0.8) { fenster.push([x, y]); continue; } // Fenster des Kachel-Layers (dsTheme accent)
    const r = hash2(x, y, 401);
    if (r > 0.3) continue;
    const [name, licht] = stil.fassade[Math.floor(hash2(x, y, 402) * stil.fassade.length)];
    zell(name, x, y);
    if (licht) fenster.push([x, y]);
  }
  for (const [x, y] of fenster) {
    if (warm) m.lights.push({ tile: [x, y], radius: 26, intensity: 0.45, color: LAMPE, flicker: 0.05 });
    else if (hash2(x, y, 403) > 0.7) m.lights.push({ tile: [x, y], radius: 20, intensity: 0.25, color: FROST, flicker: 0.02 });
  }

  // 3) Wärmenetz: Hauptleitung an der Nordwand, Abzweige nach unten bis zum nächsten Haus
  if (W >= 40) leitungen(m, { W, H, wand, boden, belegt, warm, art: GEFAHR.has(base) ? 'belastet' : warm ? 'warm' : 'kalt' });

  // 4) Möbel vor den Wänden: auf dem Boden direkt unter einer Front, mit Abstand, nie neben Objekten oder in engen Gängen
  let luecke = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!wand(x, y - 1) || !boden(x, y)) { luecke = 0; continue; }
    if (++luecke < 4 || hash2(x, y, 410) > 0.35 || (W >= 40 && y <= 2)) continue; // oben verläuft die Leitung
    const stueck = stil.wand[Math.floor(hash2(x, y, 411) * stil.wand.length)];
    const felder = stueck.map((_, i) => [x + i, y]);
    if (!felder.every(([fx, fy]) => boden(fx, fy) && wand(fx, fy - 1) && boden(fx, fy + 1) && boden(fx, fy + 2) && !nah.has(key(fx, fy)) && !belegt.has(key(fx, fy)))) continue;
    stueck.forEach((name, i) => {
      const [fx, fy] = felder[i];
      zell(name, fx, fy, { depth: 41 });
      belegt.add(key(fx, fy));
      fest.add(key(fx, fy));
    });
    luecke = -stueck.length;
  }

  // 5) Einzelstücke auf dem Boden (flach, begehbar)
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!boden(x, y) || belegt.has(key(x, y))) continue;
    let acc = 0;
    const r = hash2(x, y, 420);
    for (const [name, p] of stil.streu) {
      if (r < (acc += p)) { zell(name, x, y, { depth: 39 }); flach.add(key(x, y)); break; }
    }
  }

  // 6) Requisiten je Ort, verteilt nach größtem Abstand; Kollision nur, wenn alles erreichbar bleibt
  const plaetze = [];
  for (let y = 2; y < H - 1; y++) for (let x = 2; x < W - 2; x++) {
    const fuss = [[x - 1, y], [x, y], [x + 1, y]];
    if (!fuss.every(([fx, fy]) => boden(fx, fy) && !belegt.has(key(fx, fy)) && !nah.has(key(fx, fy)) && !fest.has(key(fx, fy)))) continue;
    if (!boden(x, y + 1) || !boden(x, y - 1)) continue;
    plaetze.push([x, y]);
  }
  const gesetzt = objekte.map(([x, y]) => [x, y]);
  for (const [spr, anzahl, opt] of REQ[base] ?? []) {
    if ((opt.nurWarm && !warm) || (opt.nurKalt && warm)) continue;
    const sprite = typeof spr === 'function' ? spr(warm) : spr;
    for (let i = 0; i < anzahl; i++) {
      let best = null;
      let bestD = -1;
      for (const [x, y] of plaetze) {
        if (belegt.has(key(x, y)) || belegt.has(key(x - 1, y)) || belegt.has(key(x + 1, y))) continue;
        const d = Math.min(...gesetzt.map(([gx, gy]) => Math.hypot(gx - x, gy - y))) + hash2(x, y, 430 + i) * 1.5;
        if (d > bestD) { bestD = d; best = [x, y]; }
      }
      if (!best || bestD < 3) break;
      const [x, y] = best;
      gesetzt.push(best);
      for (let dx = -1; dx <= 1; dx++) belegt.add(key(x + dx, y));
      const d = { sprite, tile: [x, y], origin: [0.5, 1], offset: [0, 8], alpha: 1, ysort: true };
      if (opt.fest && erreichbarMit(m, { W, H, boden, fest, neu: [key(x, y)] })) { d.solid = [12, 8, 0, -4]; fest.add(key(x, y)); }
      if (opt.licht) m.lights.push({ tile: [x, y - 2], radius: 52, intensity: warm ? 0.7 : 0.5, color: opt.licht, flicker: 0.1 });
      m.decor.push(d);
    }
  }
  // Wandmöbel: Kollision nur, wenn danach alles erreichbar ist, sonst begehbar lassen
  if (fest.size && !erreichbarMit(m, { W, H, boden, fest, neu: [] })) {
    for (const d of m.decor) if (d.sprite === blatt && d.depth === 41) delete d.solid;
  } else for (const d of m.decor) if (d.sprite === blatt && d.depth === 41) d.solid = [14, 12, 0, 0];

  // 7) Licht und Nebel: warm dampfig und golden, kalt klar und frostig, Gefahrengebiete dichter
  const gefahr = GEFAHR.has(base);
  m.ambient = { ...(m.ambient ?? {}), fog: (warm ? 0.14 : 0.09) + (gefahr ? 0.08 : 0) };
  if (!warm) for (let i = 0; i < Math.round(W * H / 220); i++) {
    const x = 2 + Math.floor(hash2(i, H, 440) * (W - 4));
    const y = 2 + Math.floor(hash2(W, i, 441) * (H - 4));
    if (boden(x, y)) m.lights.push({ tile: [x, y], radius: 40, intensity: 0.18, color: gefahr ? WURZELLICHT : FROST, flicker: 0.03 });
  }
}

/** Erreicht man von der Ankunft aus jedes Objekt (oder ein Nachbarfeld), auch wenn `neu` zusätzlich blockiert? */
function erreichbarMit(m, { W, H, boden, fest, neu }) {
  const zu = new Set([...fest, ...neu]);
  const start = m.spawns?.default ?? Object.values(m.spawns ?? {})[0];
  if (!start) return true;
  const seen = new Set([`${start[0]},${start[1]}`]);
  const q = [start];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const k = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen.has(k) || !boden(nx, ny) || zu.has(k)) continue;
      seen.add(k);
      q.push([nx, ny]);
    }
  }
  const ziele = [...(m.interactables ?? []).map((i) => i.tile), ...(m.npcs ?? []).map((n) => n.tile), ...Object.values(m.spawns ?? {})];
  return ziele.every(([x, y]) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`)));
}

function leitungen(m, { W, wand, boden, belegt, warm, art }) {
  const y0 = [1, 2].find((y) => [...Array(W - 2).keys()].filter((i) => boden(i + 1, y)).length > W * 0.7);
  if (y0 == null) return;
  const teil = (n) => `bhp_waerme_leitung_${art}_${n}`;
  const lege = (sprite, x, y) => { m.decor.push({ sprite, tile: [x, y], alpha: 0.95, depth: 38 }); belegt.add(`${x},${y}`); };
  // Abzweige: jede Hausoberkante, die man senkrecht von der Leitung aus erreicht (höchstens 12 Felder)
  const abzweig = new Map();
  for (let x = 2; x < W - 2; x++) {
    let y = y0 + 1;
    while (boden(x, y) && y - y0 <= 12) y++;
    if (!wand(x, y) || y - y0 > 12 || y - y0 < 3 || y >= m.rows.length - 1) continue;
    if (wand(x - 1, y) && wand(x + 1, y) && !abzweig.has(x - 1) && !abzweig.has(x - 2) && !abzweig.has(x - 3)) abzweig.set(x, y);
  }
  let start = 1;
  while (!boden(start, y0)) start++;
  for (let x = start; x < W - 1 && boden(x, y0); x++) {
    lege(teil(x === start ? 'ecke' : abzweig.has(x) ? 't' : 'h'), x, y0);
    if (!abzweig.has(x)) continue;
    const ende = abzweig.get(x);
    for (let y = y0 + 1; y < ende; y++) {
      if (y === ende - 1 && art === 'warm' && !belegt.has(`${x},${y}`)) { m.decor.push({ sprite: 'bhp_waerme_dampf_rohr', tile: [x, y], alpha: 1, depth: 38 }); belegt.add(`${x},${y}`); }
      else lege(teil('v'), x, y);
    }
  }
  if (art !== 'kalt') for (const [x] of abzweig) m.lights.push({ tile: [x, y0], radius: 24, intensity: 0.3, color: art === 'warm' ? GLUT : WURZELLICHT, flicker: 0.12 });
}
