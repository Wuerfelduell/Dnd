// Codex-Runde 8: kopiert die Datenpakete aus docs/story/ nach src/data/packs/ und legt die Einbaudaten an,
// die die Pakete selbst nicht liefern (Stadtkarten, Zonenbindungen, Streifen, Wärme-Varianten).
// Aufruf vom Repository-Stamm: node tools/packs/runde8_sync.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { BH_MAP_THEMES, CW_MAP_THEMES } from '../../src/world/assets.js';

const SRC = 'docs/story';
const DST = 'src/data/packs';
const PACKS = ['vorrat_gegner', 'vorrat_figuren', 'vorrat_items', 'k4_orte', 'k4_akte', 'k4_nebenquests', 'k5_orte', 'k5_akte', 'k5_nebenquests', 'feste_leben', 'kg_leben'];
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const write = (p, o) => writeFileSync(p, `${JSON.stringify(o, null, 1)}\n`);
const file = (pack, name) => path.join(DST, pack, `${name}.json`);
const WALK = new Set([...'.,=wgpcsP']);

for (const pack of PACKS) {
  mkdirSync(path.join(DST, pack), { recursive: true });
  for (const f of readdirSync(path.join(SRC, pack))) if (f.endsWith('.json') && f !== 'ereignisse.json') write(file(pack, f.slice(0, -5)), read(path.join(SRC, pack, f))); // CN: ereignisse.json ist nur ein Auszug aus dialogues.json
}

/**
 * CE1 (calderwick1): Props je Ort als Deko (`cwp_<blatt>_<region>`, Fußpunkt unten, nach Tiefe sortiert); Schienen am Gleisfuß aus dem Gleisblatt
 * (Spritesheet cwt_gleis, Zelle 0 = waagrechte Schienen, 8 = Prellbock). [x, y, sprite, solid?] – x/y ist das Fußfeld.
 */
const D = (x, y, sprite, solid = null) => ({ x, y, sprite, solid });
const CW_DECOR = {
  cw_gleisfuss: [D(40, 6, 'cwp_gleisfuss_aufzug', [28, 12]), D(42, 7, 'cwp_gleisfuss_gegengewicht', [10, 6]), D(24, 13, 'cwp_gleisfuss_schalter', [28, 12]), D(27, 13, 'cwp_gleisfuss_fahrgastbuch', [12, 8]),
    D(16, 13, 'cwp_gleisfuss_stationsschild_1', [20, 8]), D(36, 13, 'cwp_gleisfuss_stationsschild_2', [20, 8]), D(6, 13, 'cwp_gleisfuss_stationsschild_3', [20, 8]),
    D(18, 20, 'cwp_gleisfuss_gueterwaggon_offen', [44, 12]), D(27, 20, 'cwp_gleisfuss_gueterwaggon_zu', [44, 12])],
  cw_setzergasse: [D(6, 13, 'cwp_setzergasse_druckerpresse', [28, 12]), D(14, 13, 'cwp_setzergasse_setzkasten', [28, 12]), D(26, 13, 'cwp_setzergasse_papierballen', [28, 12]),
    D(36, 13, 'cwp_setzergasse_streiktopf', [24, 12]), D(17, 12, 'cwp_setzergasse_brotdose'), D(25, 7, 'cwp_setzergasse_fenster'), D(16, 20, 'cwp_setzergasse_papierballen', [28, 12])],
  cw_quittungsmarkt: [D(4, 13, 'cwp_quittungsmarkt_marktstand_buecher', [28, 12]), D(14, 13, 'cwp_quittungsmarkt_marktstand_werkzeug', [28, 12]), D(24, 13, 'cwp_quittungsmarkt_marktstand_tee', [28, 12]),
    D(36, 7, 'cwp_quittungsmarkt_pfandhaus', [60, 14]), D(16, 20, 'cwp_quittungsmarkt_schuldscheine', [28, 10]), D(26, 19, 'cwp_quittungsmarkt_waage'), D(36, 20, 'cwp_quittungsmarkt_herkunftskiste', [28, 12])],
  cw_roehrenhof: [D(4, 13, 'cwp_roehrenhof_rohrpost', [10, 8]), D(16, 13, 'cwp_roehrenhof_rohrpost', [10, 8]), D(26, 13, 'cwp_roehrenhof_rohrpost', [10, 8]), D(36, 13, 'cwp_roehrenhof_rohrpost', [10, 8]),
    D(24, 7, 'cwp_roehrenhof_warenbahn', [28, 12]), D(14, 7, 'cwp_roehrenhof_fahrplantafel', [28, 10]), D(34, 7, 'cwp_roehrenhof_sichtfenster'), D(18, 20, 'cwp_roehrenhof_stempelhand', [28, 12])],
  cw_witwenterrasse: [D(14, 7, 'cwp_witwenterrasse_eingang'), D(4, 13, 'cwp_witwenterrasse_heizungsrohr', [10, 8]), D(26, 13, 'cwp_witwenterrasse_heizungsrohr', [10, 8]),
    D(16, 13, 'cwp_witwenterrasse_waescheleine', [40, 6]), D(36, 13, 'cwp_witwenterrasse_picknicktisch', [28, 12]), D(24, 7, 'cwp_witwenterrasse_klopftuer'), D(16, 20, 'cwp_witwenterrasse_picknicktisch', [28, 12])],
  cw_kronenarchiv: [D(16, 7, 'cwp_kronenarchiv_archivportal', [60, 14]), D(36, 7, 'cwp_kronenarchiv_direktorenvilla', [60, 14]), D(24, 13, 'cwp_kronenarchiv_brunnen', [28, 12]),
    D(6, 13, 'cwp_kronenarchiv_statue', [20, 12]), D(16, 20, 'cwp_kronenarchiv_hauptpresse', [60, 14]), D(27, 19, 'cwp_kronenarchiv_austrittsliste'), D(40, 13, 'cwp_kronenarchiv_rechenblatt')],
  cw_buchbinderei: [D(20, 12, 'cwp_buchbinderei_bett', [28, 8]), D(16, 12, 'cwp_buchbinderei_ofen', [24, 10]), D(11, 12, 'cwp_buchbinderei_kiste', [20, 10]), D(7, 12, 'cwp_buchbinderei_fallwand'),
    D(20, 6, 'cwp_buchbinderei_buergenbrett_leer'), D(14, 6, 'cwp_buchbinderei_buchpresse', [24, 10])],
  cw_gepaeckhalle: [D(6, 12, 'cwp_gleisfuss_schalter', [28, 12]), D(9, 12, 'cwp_gleisfuss_fahrgastbuch', [12, 8]), D(20, 6, 'cwp_gleisfuss_stationsschild_2', [20, 8]), D(16, 12, 'cwp_gleisfuss_gueterwaggon_zu', [44, 12])],
  cw_pfandhaus: [D(6, 12, 'cwp_quittungsmarkt_schuldscheine', [28, 10]), D(14, 6, 'cwp_quittungsmarkt_waage'), D(18, 12, 'cwp_quittungsmarkt_herkunftskiste', [28, 12]), D(11, 12, 'cwp_buchbinderei_kiste', [20, 10])],
  cw_sortierhalle: [D(6, 12, 'cwp_roehrenhof_rohrpost', [10, 8]), D(20, 12, 'cwp_roehrenhof_rohrpost', [10, 8]), D(14, 12, 'cwp_roehrenhof_warenbahn', [28, 12]), D(20, 6, 'cwp_roehrenhof_fahrplantafel', [28, 10]),
    D(8, 6, 'cwp_roehrenhof_sichtfenster'), D(17, 6, 'cwp_roehrenhof_stempelhand', [28, 12])],
  cw_kueche: [D(14, 6, 'cwp_setzergasse_brotdose'), D(8, 12, 'cwp_witwenterrasse_picknicktisch', [28, 12]), D(18, 12, 'cwp_witwenterrasse_picknicktisch', [28, 12])],
  cw_archivsaal: [D(6, 12, 'cwp_kronenarchiv_austrittsliste'), D(14, 12, 'cwp_kronenarchiv_rechenblatt'), D(20, 12, 'cwp_kronenarchiv_statue', [20, 12]), D(18, 6, 'cwp_buchbinderei_buchpresse', [24, 10])],
  cw_villa: [D(6, 6, 'cwp_kronenarchiv_statue', [20, 12]), D(20, 12, 'cwp_kronenarchiv_austrittsliste'), D(14, 12, 'cwp_witwenterrasse_picknicktisch', [28, 12]), D(8, 12, 'cwp_buchbinderei_bett', [28, 8])],
  cw_druckkammer: [D(14, 12, 'cwp_kronenarchiv_hauptpresse', [60, 14]), D(6, 12, 'cwp_setzergasse_papierballen', [28, 12]), D(20, 6, 'cwp_setzergasse_setzkasten', [28, 12])],
  cw_alte_setzerei: [D(6, 13, 'cwp_setzergasse_druckerpresse', [28, 12]), D(26, 13, 'cwp_setzergasse_druckerpresse', [28, 12]), D(16, 13, 'cwp_setzergasse_setzkasten', [28, 12]), D(36, 13, 'cwp_setzergasse_setzkasten', [28, 12]),
    D(16, 21, 'cwp_setzergasse_papierballen', [28, 12]), D(36, 21, 'cwp_setzergasse_papierballen', [28, 12]), D(6, 21, 'cwp_setzergasse_brotdose')],
  cw_sortiergrube: [D(6, 13, 'cwp_roehrenhof_rohrpost', [10, 8]), D(16, 21, 'cwp_roehrenhof_rohrpost', [10, 8]), D(26, 13, 'cwp_roehrenhof_rohrpost', [10, 8]), D(36, 21, 'cwp_roehrenhof_rohrpost', [10, 8]),
    D(16, 13, 'cwp_roehrenhof_warenbahn', [28, 12]), D(36, 13, 'cwp_roehrenhof_warenbahn', [28, 12]), D(26, 21, 'cwp_roehrenhof_stempelhand', [28, 12]), D(45, 13, 'cwp_roehrenhof_sichtfenster')],
  cw_nullfundament: [D(26, 13, 'cwp_kronenarchiv_hauptpresse', [60, 14]), D(6, 13, 'cwp_buchbinderei_kiste', [20, 10]), D(36, 21, 'cwp_buchbinderei_kiste', [20, 10]), D(16, 13, 'cwp_buchbinderei_fallwand')],
};
/** Schienen am Gleisfuß: waagrecht durch die untere Halle, Prellböcke an beiden Enden; die Güterwaggons stehen darauf. */
const CW_RAILS = { cw_gleisfuss: { y: 20, from: 12, to: 31 } };
function cwDecor(m) {
  const taken = new Set([...(m.interactables ?? []).map((i) => i.tile.join(',')), ...(m.npcs ?? []).map((n) => n.tile.join(',')), ...Object.values(m.spawns ?? {}).map((t) => t.join(','))]);
  const out = (CW_DECOR[m.id] ?? []).map(({ x, y, sprite, solid }) => {
    if (!WALK.has(m.rows[y]?.[x])) throw new Error(`${m.id}: Deko ${sprite} auf ${x},${y} steht nicht auf Boden`);
    if (taken.has(`${x},${y}`)) throw new Error(`${m.id}: Deko ${sprite} auf ${x},${y} kollidiert mit Figur oder Objekt`);
    return { tile: [x, y], sprite, origin: [0.5, 1], offset: [0, 8], alpha: 1, ysort: true, ...(solid ? { solid } : {}) };
  });
  const rails = CW_RAILS[m.id];
  if (rails) {
    for (let x = rails.from; x <= rails.to; x++) out.unshift({ tile: [x, rails.y], sprite: 'cwt_gleis', frame: 0, alpha: 1, depth: 40 });
    for (const x of [rails.from - 1, rails.to + 1]) out.unshift({ tile: [x, rails.y], sprite: 'cwt_gleis', frame: 8, alpha: 1, depth: 40, flip: x > rails.to });
  }
  return out;
}

// --- Kapitel 4 (CD): Streifen aus verknuepfungen.md, Elitechance aus BH, Stadtkarte, Zonenbindung -------------
{
  const maps = read(file('k4_orte', 'maps'));
  const STREIFEN = {
    cw_alte_setzerei: [['vg_cw_letternlaeufer', [24, 12]], ['vg_cw_letternlaeufer', [28, 12]], ['vg_cw_registerratte', [34, 20]], ['vg_cw_registerratte', [38, 20]], ['vg_cw_stempelhand', [40, 22]]],
    cw_sortiergrube: [['vg_cw_rohrpostwespe', [24, 12]], ['vg_cw_rohrpostwespe', [28, 12]], ['vg_cw_leerfracht', [34, 20]], ['vg_cw_durchschlag', [38, 20]]],
    cw_nullfundament: [['vg_cw_seilbahnwaechter', [24, 12]], ['vg_cw_tintenschatten', [38, 20]]],
    reise_landstrasse: [['vg_all_wegelagerer', [10, 13]], ['vg_all_nebelkraehe', [30, 20]], ['vg_all_fuhrmannsschatten', [26, 10]], ['vg_all_zollhund', [34, 5]], ['vg_all_kutschengeist', [14, 20]]],
  };
  for (const m of maps) {
    // CE1 (calderwick1): eigenes Thema je Ort und Deko aus den Props-Blättern; die Landstraße behält ihr Gefahrengebiets-Blatt
    if (CW_MAP_THEMES[m.id]) m.tiles = CW_MAP_THEMES[m.id];
    m.decor = cwDecor(m);
    const own = STREIFEN[m.id];
    if (!own) continue;
    m.elite_chance = 0.12;
    m.roamers = own.map(([encounter, tile], i) => ({ id: `${m.id}_streife_${i + 1}`, encounter, tile: nearestFloor(m, tile) }));
  }
  write(file('k4_orte', 'maps'), maps);
  // CE2: gemalte Stadtkarte mit Nebel (Pins auf ui/cw_karte.png gemessen: sechs Terrassen von unten nach oben, Gefahrengebiete an den Hängen)
  write(file('k4_orte', 'city'), {
    id: 'calderwick',
    title: 'Stadtkarte von Calderwick',
    map_image: 'ui/cw_karte.png',
    fog_image: 'ui/cw_karte_nebel.png',
    pins: {
      cw_gleisfuss: [240, 242], cw_setzergasse: [150, 200], cw_quittungsmarkt: [240, 160], cw_roehrenhof: [330, 120], cw_witwenterrasse: [150, 82], cw_kronenarchiv: [240, 40],
      cw_alte_setzerei: [40, 150], cw_sortiergrube: [440, 195], cw_nullfundament: [40, 255],
    },
  });
  // CE2: Szenenbilder an den Gesprächsknoten der Akte (Ankunft im Aufzug, Noels zwei Teller, Ida in der Sortierkabine)
  const dlg = read(file('k4_akte', 'dialogues'));
  dlg.cwa_ankunft.nodes.cwa_ankunft_zone.scene = 'cw_aufzug';
  dlg.cwa_12_dialog.nodes.cwa_12_start.scene = 'cw_zwei_teller';
  dlg.cwa_24_dialog.nodes.cwa_24_schluss.scene = 'cw_sortierkabine';
  write(file('k4_akte', 'dialogues'), dlg);
  write(file('k4_orte', 'zonen_bindung'), {
    cw_alte_setzerei: { quelle: 'vg_zone_cw_setzerei', gegner: ['vg_cw_letternlaeufer', 'vg_cw_stempelhand', 'vg_cw_registerratte'], bosse: ['vg_cw_boss_bleisammler', 'vg_cw_boss_bleisammler_phase2'] },
    cw_sortiergrube: { quelle: 'vg_zone_cw_sortiergrube', gegner: ['vg_cw_rohrpostwespe', 'vg_cw_durchschlag', 'vg_cw_leerfracht'], bosse: ['vg_cw_boss_blinder_zusteller', 'vg_cw_boss_blinder_zusteller_phase2'] },
    cw_nullfundament: { quelle: 'vg_zone_cw_nullfundament', gegner: ['vg_cw_seilbahnwaechter', 'vg_cw_tintenschatten'], bosse: ['vg_cw_boss_nullfundament', 'vg_cw_boss_nullfundament_phase2', 'vg_cw_boss_nullfundament_phase3', 'cwa_registerleib_rest'] },
    reise_landstrasse: { quelle: 'vg_zone_all_landstrasse', gegner: ['vg_all_wegelagerer', 'vg_all_kutschengeist', 'vg_all_zollhund', 'vg_all_nebelkraehe', 'vg_all_marktschreier', 'vg_all_grenzstein', 'vg_all_fuhrmannsschatten', 'vg_all_brueckenzoll'],
      bosse: ['vg_all_boss_landvermesser', 'vg_all_boss_landvermesser_phase2', 'vg_all_boss_schlafkutsche', 'vg_all_boss_schlafkutsche_phase2'] },
  });
}

/**
 * CI (briarholt1): Props je Ort als Deko (`bhp_<blatt>_<region>`, Fußpunkt unten, nach Tiefe sortiert). Warme Karten zeigen entfaltete
 * Palmen, geöffnete Verteilanlage und Rücklaufbehälter, blühende Pflanze. [x, y, sprite, solid?] – x/y ist das Fußfeld.
 */
const P = (x, y, sprite, solid = null) => ({ x, y, sprite, solid });
const palme = (w) => `bhp_promenade_palme_${w ? 'warm' : 'kalt'}`;
const BH_DECOR = {
  bh_kutschenhof: (w) => [P(22, 4, 'bhp_kutschenhof_pferde', [60, 14]), P(3, 6, 'bhp_kutschenhof_gepaeckkarren_blumenerde', [28, 12]), P(5, 6, 'bhp_kutschenhof_patientenstuhl', [12, 10]),
    P(6, 6, 'bhp_kutschenhof_hinweistafel_pfirsich', [28, 6, 0, -6]), P(12, 6, 'bhp_kutschenhof_wartebank_frost', [28, 10]), P(32, 12, palme(w), [20, 10]), P(26, 11, 'bhp_promenade_gaslaterne', [8, 6])],
  bh_kesselgrund: (w) => [P(4, 3, `bhp_kesselgrund_ventil_${w ? 'warm' : 'kalt'}`), P(41, 2, `bhp_kesselgrund_druckanzeige_${w ? 'hoch' : 'niedrig'}`), P(20, 3, 'bhp_kesselgrund_kohlenbunker_voll', [28, 12]),
    P(23, 3, 'bhp_kesselgrund_kohlenbunker_leer', [28, 12]), P(40, 18, 'bhp_kesselgrund_wartungsschrank', [28, 12]), P(30, 12, 'bhp_kesselgrund_waeschemangel', [28, 12])],
  bh_winterpromenade: (w) => [P(22, 14, 'bhp_promenade_musikpavillon', [60, 24, 0, -4]), P(10, 12, 'bhp_promenade_gaslaterne', [8, 6]), P(30, 12, 'bhp_promenade_gaslaterne', [8, 6]),
    P(14, 20, palme(w), [20, 10]), P(36, 20, palme(w), [20, 10]), P(26, 20, 'bhp_promenade_kurgaeste_bank', [28, 10]), P(12, 5, 'bhp_promenade_schreibpult_postkarten', [28, 12]), P(40, 12, 'bhp_promenade_kurkiosk', [28, 14])],
  bh_glasgaerten: (w) => [P(6, 17, 'bhp_glasgaerten_beet_schild', [28, 12]), P(10, 17, `bhp_glasgaerten_beet_schild${w ? '_umgedreht' : ''}`, [28, 12]), P(14, 17, 'bhp_glasgaerten_beet_schild', [28, 12]),
    P(3, 3, 'bhp_glasgaerten_saatbuch_pult', [28, 12]), P(30, 3, 'bhp_glasgaerten_veredelungsschere_gross', [28, 12]), P(24, 18, `bhp_glasgaerten_sprechende_pflanze_${w ? 3 : 0}`, [12, 8]), P(36, 18, 'bhp_glasgaerten_kapselhalter_leer', [12, 8])],
  bh_stillenhaeuser: () => [P(3, 16, 'bhp_stillenhaeuser_bett_tafel_radiert', [28, 12]), P(7, 16, 'bhp_stillenhaeuser_bett_tafel_radiert', [28, 12]), P(30, 10, 'bhp_stillenhaeuser_teewagen', [28, 12]),
    P(20, 10, 'bhp_stillenhaeuser_speisesaal_tisch', [44, 12]), P(24, 10, 'bhp_stillenhaeuser_speisesaal_stuehle', [28, 10]), P(36, 4, 'bhp_stillenhaeuser_kinderzeichnung')],
  bh_wurzelkranz: (w) => [P(22, 13, 'bhp_wurzelkranz_pumpenrad', [28, 12]), P(34, 13, 'bhp_wurzelkranz_sudkessel', [28, 14]), P(40, 3, 'bhp_wurzelkranz_zeichentisch_fundamentplan', [28, 12]),
    P(10, 13, `bhp_wurzelkranz_ruecklauf_${w ? 'offen' : 'versiegelt'}`, [28, 12])],
  bh_buegelraum: () => [P(4, 2, 'bhp_kesselgrund_buegelbrett', [28, 12]), P(9, 2, 'bhp_kesselgrund_waeschemangel', [28, 12]), P(14, 3, 'bhp_kesselgrund_feuerstelle', [28, 12]), P(16, 4, 'bhp_kesselgrund_bett', [28, 12]),
    P(18, 4, 'bhp_kesselgrund_lager', [28, 12]), P(20, 4, 'bhp_kesselgrund_fallwand', [28, 6, 0, -6]), P(16, 6, 'bhp_kesselgrund_ventiltafel', [28, 6, 0, -6]), P(21, 2, 'bhp_kesselgrund_kiste', [12, 10])],
  bh_kutschenhalle: () => [P(8, 4, 'bhp_kutschenhof_gepaeckkarren_blumenerde', [28, 12]), P(10, 4, 'bhp_kutschenhof_patientenstuhl', [12, 10]), P(14, 9, 'bhp_kutschenhof_wartebank_frost', [28, 10])],
  bh_pavillon: (w) => [P(11, 4, 'bhp_promenade_kurkiosk', [28, 14]), P(8, 4, 'bhp_promenade_schreibpult_postkarten', [28, 12]), P(5, 10, palme(w), [20, 10]), P(19, 10, palme(w), [20, 10])],
  bh_verkaufshalle: (w) => [P(8, 4, 'bhp_glasgaerten_saatbuch_pult', [28, 12]), P(14, 9, 'bhp_glasgaerten_beet_schild', [28, 12]), P(18, 9, `bhp_glasgaerten_beet_schild${w ? '_umgedreht' : ''}`, [28, 12]), P(10, 4, 'bhp_glasgaerten_kapselhalter_kapsel', [12, 8])],
  bh_speisesaal: () => [P(14, 9, 'bhp_stillenhaeuser_speisesaal_tisch', [44, 12]), P(18, 9, 'bhp_stillenhaeuser_speisesaal_stuehle', [28, 10]), P(8, 4, 'bhp_stillenhaeuser_teewagen', [28, 12])],
  bh_aktenraum: () => [P(16, 10, 'bhp_stillenhaeuser_ennas_heft')],
  bh_labor: () => [P(10, 4, 'bhp_wurzelkranz_sudkessel', [28, 14])],
  bh_mutterhaus: () => [P(8, 4, 'bhp_wurzelkranz_zeichentisch_fundamentplan', [28, 12]), P(16, 10, 'bhp_stillenhaeuser_kinderzeichnung')],
  bh_verteilanlage: (w) => [P(16, 10, `bhp_wurzelkranz_verteilanlage_${w ? 'offen' : 'zu'}`, [60, 24, 0, -4]), P(20, 10, `bhp_wurzelkranz_ruecklauf_${w ? 'offen' : 'versiegelt'}`, [28, 12])],
  bh_kaltes_palmhaus: (w) => [P(6, 18, palme(w), [20, 10]), P(20, 18, palme(w), [20, 10]), P(34, 18, palme(w), [20, 10]), P(10, 26, 'bhp_glasgaerten_kapselhalter_leer', [12, 8])],
  bh_verlassene_waescherei: () => [P(6, 13, 'bhp_kesselgrund_waeschemangel', [28, 12]), P(20, 13, 'bhp_kesselgrund_waeschemangel', [28, 12]), P(34, 13, 'bhp_kesselgrund_kohlenbunker_leer', [28, 12])],
  bh_wurzelkammer: (w) => [P(10, 19, `bhp_wurzelkranz_ruecklauf_${w ? 'offen' : 'versiegelt'}`, [28, 12])],
};
function bhDecor(base, warm, m) {
  const taken = new Set([...(m.interactables ?? []).map((i) => i.tile.join(',')), ...(m.npcs ?? []).map((n) => n.tile.join(',')), ...Object.values(m.spawns ?? {}).map((t) => t.join(','))]);
  return (BH_DECOR[base]?.(warm) ?? []).map(({ x, y, sprite, solid }) => {
    const ventil = sprite.includes('_ventil_'); // das Ventil steht auf seinem Lesefeld
    if (!WALK.has(m.rows[y]?.[x])) throw new Error(`${m.id}: Deko ${sprite} auf ${x},${y} steht nicht auf Boden`);
    if (!ventil && taken.has(`${x},${y}`)) throw new Error(`${m.id}: Deko ${sprite} auf ${x},${y} kollidiert mit Figur oder Objekt`);
    return { tile: [x, y], sprite, origin: [0.5, 1], offset: [0, 8], alpha: 1, ysort: true, ...(solid ? { solid } : {}) };
  });
}

// --- Kapitel 5 (CH/CG/CJ): Platzhalterthemen, Wärmebedingung je Variante, Stadtkarte, Zonenbindung, Flagnamen ---
{
  // Kreis je Ort (CG ventile.json und CH travel.json): die warme Fassung gilt, solange der Kreis offen ist; der Bügelraum ist immer warm.
  const KREIS = { kutschenhof: 'hof', kutschenhalle: 'hof', kesselgrund: 'reserve', winterpromenade: 'pult', pavillon: 'pult', glasgaerten: 'beete', verkaufshalle: 'beete',
    stillenhaeuser: 'tee', speisesaal: 'tee', aktenraum: 'akten', wurzelkranz: 'kuehlung', labor: 'labor', mutterhaus: 'labor', verteilanlage: 'klappe',
    kaltes_palmhaus: 'palm', verlassene_waescherei: 'waesche', wurzelkammer: 'wurzel' };
  const maps = read(file('k5_orte', 'maps'));
  for (const m of maps) {
    // CI (briarholt1): eigenes Thema je Ort, die warme Zwillingskarte nimmt das warme Blatt; der Bügelraum ist immer warm
    const base = m.id.replace(/__warm$/, '');
    const warm = m.id.endsWith('__warm') || base === 'bh_buegelraum';
    m.tiles = `${BH_MAP_THEMES[base]}_${warm ? 'warm' : 'kalt'}`;
    m.decor = bhDecor(base, warm, m);
    if (!m.id.endsWith('__warm')) continue;
    const ort = m.id.slice(3, -6);
    m.warm_if = KREIS[ort] ? { requires_flags: [`bha_ventil_${KREIS[ort]}_offen`] } : {};
  }
  write(file('k5_orte', 'maps'), maps);
  const pins = { bh_kutschenhof: [70, 225], bh_kesselgrund: [160, 240], bh_winterpromenade: [200, 160], bh_glasgaerten: [330, 150], bh_stillenhaeuser: [120, 110], bh_wurzelkranz: [300, 60],
    bh_buegelraum: [215, 235], bh_kaltes_palmhaus: [420, 120], bh_verlassene_waescherei: [110, 40], bh_wurzelkammer: [410, 40] };
  // CI: gemalte Stadtkarte, Nebel und Leitungsplan-Overlay (Pins auf dem Grok-Bild gemessen, Innenräume beim Viertel)
  Object.assign(pins, { bh_kutschenhof: [75, 226], bh_kesselgrund: [282, 206], bh_winterpromenade: [328, 122], bh_glasgaerten: [112, 50], bh_stillenhaeuser: [170, 124], bh_wurzelkranz: [305, 48],
    bh_buegelraum: [240, 238], bh_kaltes_palmhaus: [160, 72], bh_verlassene_waescherei: [340, 232], bh_wurzelkammer: [430, 122] });
  write(file('k5_orte', 'city'), { id: 'briarholt', title: 'Stadtkarte von Briarholt', map_image: 'ui/bh_karte.png', fog_image: 'ui/bh_karte_nebel.png', overlay_image: 'ui/bh_karte_leitungen.png',
    pins: Object.fromEntries(Object.entries(pins).flatMap(([id, p]) => [[id, p], [`${id}__warm`, p]])) });
  // CI: Szenenbilder an den Gesprächsknoten der Akte (Ankunft, Pfirsich mit türkisem Kern, Orla im Trockenraum)
  const dlg = read(file('k5_akte', 'dialogues'));
  for (const [id, d] of Object.entries(dlg)) if (id.startsWith('bha_anreise_')) d.nodes[d.start].scene = id === 'bha_anreise_buecher' ? 'bh_pfirsich' : 'bh_ankunft';
  dlg.bha_34_dialog.nodes.bha_34_start.scene = 'bh_trockenraum';
  write(file('k5_akte', 'dialogues'), dlg);
  const bind = (quelle, gegner, bosse, warm) => ({ quelle, gegner: warm ? [...gegner, warm] : gegner, bosse, elite_chance: warm ? 0.12 : 0 });
  const glas = ['vg_bh_boss_glasgaertner', 'vg_bh_boss_glasgaertner_phase2'];
  const waes = ['vg_bh_boss_waescherei', 'vg_bh_boss_waescherei_phase2'];
  const wurz = ['vg_bh_boss_mutterwurzel', 'vg_bh_boss_mutterwurzel_phase2', 'vg_bh_boss_mutterwurzel_phase3', 'bha_aussaat_schwarm'];
  write(file('k5_orte', 'zonen_bindung'), {
    bh_kaltes_palmhaus: bind('vg_zone_bh_palmhaus', ['vg_bh_glasmotte', 'vg_bh_bluetenkopf'], glas),
    bh_kaltes_palmhaus__warm: bind('vg_zone_bh_palmhaus', ['vg_bh_glasmotte', 'vg_bh_bluetenkopf'], glas, 'vg_bh_wurzelgaenger'),
    bh_verlassene_waescherei: bind('vg_zone_bh_waescherei', ['vg_bh_rohrwurm', 'vg_bh_waeschegeist'], waes),
    bh_verlassene_waescherei__warm: bind('vg_zone_bh_waescherei', ['vg_bh_rohrwurm', 'vg_bh_waeschegeist'], waes, 'vg_bh_dampfschwester'),
    bh_wurzelkammer: bind('vg_zone_bh_wurzelkammer', ['vg_bh_sudtraeger', 'vg_bh_wurzelgaenger'], wurz),
    bh_wurzelkammer__warm: bind('vg_zone_bh_wurzelkammer', ['vg_bh_sudtraeger', 'vg_bh_wurzelgaenger'], wurz, 'vg_bh_rohrwurm'),
  });
  // CG prüft den Sieg über den ersten Abschnitt; maßgeblich ist der letzte (BH setzt <boss>_geloest, friedlich ebenso)
  const dial = JSON.parse(JSON.stringify(read(file('k5_akte', 'dialogues'))).replace(/"won_(vg_bh_boss_\w+?)"/g, '"$1_geloest"'));
  write(file('k5_akte', 'dialogues'), dial);
  // CJ nennt das Kurblatt anders als CG
  write(file('k5_nebenquests', 'zeitung'), read(file('k5_nebenquests', 'zeitung')).map((z) => ({ ...z, zeitung: z.zeitung === 'bhn_kurblatt' ? 'briarholter_kurblatt' : z.zeitung })));
  // CJ liest die Wärme über bha_ventil_<ort>_warm; CG setzt bha_ventil_<kreis>_offen
  const WARM = { kutschenhof: 'hof', kesselgrund: 'reserve', winterpromenade: 'pult', glasgaerten: 'beete', stillenhaeuser: 'tee', wurzelkranz: 'kuehlung' };
  for (const f of readdirSync(path.join(DST, 'k5_nebenquests'))) {
    const p = path.join(DST, 'k5_nebenquests', f);
    const text = readFileSync(p, 'utf8').replace(/bha_ventil_(\w+?)_warm/g, (all, ort) => (WARM[ort] ? `bha_ventil_${WARM[ort]}_offen` : all));
    writeFileSync(p, text);
  }
}

// --- Korrekturen an den Lieferungen ---------------------------------------------------------------------------
{
  const k4 = read(file('k4_orte', 'maps'));
  let k5 = read(file('k5_orte', 'maps'));
  // Der Bügelraum ist immer warm: die warme Fassung ersetzt die kalte unter der Grund-Id
  const warmBuegel = k5.find((m) => m.id === 'bh_buegelraum__warm');
  k5 = k5.filter((m) => m.id !== 'bh_buegelraum__warm').map((m) => (m.id === 'bh_buegelraum' ? { ...warmBuegel, id: 'bh_buegelraum', warm_if: undefined, name: m.name } : m));
  const unwarm = (o) => JSON.parse(JSON.stringify(o).replace(/bh_buegelraum__warm/g, 'bh_buegelraum'));
  k5 = unwarm(k5);
  // Türen auf warmen Karten führen in die warmen Fassungen (Wegweiser); zur Laufzeit entscheidet ohnehin der Ventilkreis
  const ids = new Set(k5.map((m) => m.id));
  for (const m of k5) if (m.id.endsWith('__warm')) for (const i of m.interactables ?? []) if (i.to && ids.has(`${i.to}__warm`)) i.to = `${i.to}__warm`;
  write(file('k5_orte', 'travel'), unwarm(read(file('k5_orte', 'travel'))));
  const city = read(file('k5_orte', 'city'));
  delete city.pins.bh_buegelraum__warm;
  write(file('k5_orte', 'city'), city);
  // Gefahrengebiete tragen ihre Stufe als Kartenfeld `danger` (wie alle Wildnis-Karten)
  for (const [pack, maps] of [['k4_orte', k4], ['k5_orte', k5]]) {
    const zones = read(file(pack, 'zones'));
    for (const m of maps) if (zones[m.id]) m.danger = zones[m.id].tier ?? 5;
    // CD lässt die Reiseziele der Gebiete ohne Bedingung: sie öffnen sich mit der Ankunft in der Stadt
    for (const z of Object.values(zones)) if (z.travel && !z.travel.requires_flags?.length) z.travel.requires_flags = [pack === 'k4_orte' ? 'k4_arrived' : 'k5_arrived'];
    write(file(pack, 'zones'), zones);
  }
  write(file('k4_orte', 'maps'), k4);
  write(file('k5_orte', 'maps'), k5);
  // Platzierungen der Akten und Nebenaufträge: in die Karte holen und aufs nächste Bodenfeld setzen (CC stellt Stationen auf Wände)
  const byId = Object.fromEntries([...k4, ...k5].map((m) => [m.id, m]));
  const fix = (mapId, tile) => {
    const m = byId[mapId];
    if (!m || !tile) return tile;
    const x = Math.min(m.rows[0].length - 2, Math.max(1, tile[0]));
    const y = Math.min(m.rows.length - 2, Math.max(1, tile[1]));
    return nearestFloor(m, [x, y]);
  };
  for (const pack of ['k4_orte', 'k4_akte', 'k4_nebenquests', 'k5_akte', 'k5_nebenquests']) {
    const pl = read(file(pack, 'platzierung')).map((p) => ({ ...p, tile: fix(p.map, p.tile) }));
    write(file(pack, 'platzierung'), pl);
    if (!pack.endsWith('nebenquests')) continue;
    write(file(pack, 'lesestuecke'), read(file(pack, 'lesestuecke')).map((p) => ({ ...p, tile: fix(p.map, p.tile) })));
    write(file(pack, 'einwohner'), read(file(pack, 'einwohner')).map((e) => ({ ...e, zeit: Object.fromEntries(Object.entries(e.zeit ?? {}).map(([k, s]) => [k, s && { ...s, tile: fix(s.map, s.tile) }])) })));
  }
  // CK: „Bis später.“ ohne Folgeknoten heißt im Spiel: kein `next`
  for (const name of ['dialogues', 'dialog_zusaetze']) write(file('feste_leben', name), JSON.parse(JSON.stringify(read(file('feste_leben', name)), (k, v) => (k === 'next' && v === null ? undefined : v))));
  // CH: Die kalte Handhabe hat Beschreibung, aber keine Wirkung
  const k5art = read(file('k5_orte', 'artifacts'));
  k5art.list.bho_kalte_handhabe = { ...k5art.list.bho_kalte_handhabe,
    boons: [{ key: 'dodge_window', value: 1.25, text: 'Der kommende Stoß ist leichter lesbar: Ausweichfenster 25 % weiter.' }],
    curses: [{ key: 'max_nerves', value: -10, text: 'Jedes Geräusch erscheint näher: 10 weniger maximale Nerven.' }] };
  write(file('k5_orte', 'artifacts'), k5art);
  // BL: Die acht Artefakte vergibt kein Auftrag; sie liegen wie überall als seltene Beute in den Gebieten (Durchschlag bleibt Bergungsbeute)
  const WILD = { vi_art_der_stille_stempel: ['cw_alte_setzerei'], vi_art_das_leere_tuerschild: ['cw_sortiergrube'], vi_art_das_bremserseil: ['cw_nullfundament'], vi_art_der_falsche_fahrplan: ['reise_landstrasse'],
    vi_art_die_kurglocke: ['bh_kaltes_palmhaus', 'bh_kaltes_palmhaus__warm'], vi_art_die_warme_postkarte: ['bh_verlassene_waescherei', 'bh_verlassene_waescherei__warm'], vi_art_die_gaertnerschnur: ['bh_wurzelkammer', 'bh_wurzelkammer__warm'] };
  const viart = read(file('vorrat_items', 'artifacts'));
  for (const [id, zones] of Object.entries(WILD)) viart.list[id] = { ...viart.list[id], source: 'wild', zones };
  write(file('vorrat_items', 'artifacts'), viart);
  // BL: Kleidung gehört in die Läden der drei Händler (Druckerei, Garten, Reise)
  const handel = read(file('vorrat_items', 'handel'));
  const items = read(file('vorrat_items', 'items'));
  const STOCK = { vi_handel_druckerei: ['vi_hut_setzerkappe', 'vi_mantel_druckerschurz', 'vi_mantel_archivrobe', 'vi_amulett_bleiletter', 'vi_amulett_rohrpostkapsel'],
    vi_handel_garten: ['vi_hut_kurhaube', 'vi_mantel_dampfmantel', 'vi_amulett_pfirsichkern'], vi_handel_reise: ['vi_hut_zylinder_vermesser', 'vi_hut_fuhrmannshut', 'vi_mantel_reisepelerine', 'vi_amulett_grenzsteinsplitter'] };
  for (const [mid, ids] of Object.entries(STOCK)) for (const id of ids) if (!handel.merchants[mid].stock.some((s) => s.item === id)) handel.merchants[mid].stock.push({ item: id, price: items[id].price });
  write(file('vorrat_items', 'handel'), handel);
  // BL: Kleidung wirkt nur über Schlüssel; reine Textversprechen (nicht umgesetzt) fallen weg
  for (const it of Object.values(items)) if (it.kind === 'gear') it.boons = it.boons.filter((b) => b.key);
  items.vi_amulett_rohrpostkapsel.boons = [{ key: 'damage_taken', value: 0.92, text: '8 % weniger Schaden.' }];
  // BL: Verbrauchsgüter mit Sonderwirkungen, die das Spiel nicht kennt, wirken hier auf Leben, Nerven oder Unruhe (Text sagt es)
  const WIRKUNG = { vi_v_durchschlagpapier: { composure: 8, desc: 'Blatt Kohlepapier; beim Abschreiben ordnen sich die Gedanken: +8 Nerven.' },
    vi_v_rohrpostmarke: { composure: 10, desc: 'Marke für die Rohrpost; ein Brief geht ab, die Sorge mit ihm: +10 Nerven.' },
    vi_v_dampfkompresse: { heal: 18, calm: 2, desc: 'Heiße Kompresse; löst Verspannung und Unruhe: +18 Leben, -2 Unruhe.' },
    vi_v_kurkarte: { composure: 12, desc: 'Blaue Kurkarte; ein freier Nachmittag im Kurgarten: +12 Nerven.' },
    vi_v_laternenoel_klar: { composure: 14, desc: 'Klares Öl; ruhiges Licht für die Geistsicht: +14 Nerven.' },
    vi_v_zollsiegel: { composure: 10, desc: 'Rotes Siegel; wer es zeigt, wird nicht aufgehalten: +10 Nerven.' },
    vi_v_riechsalz_stark: { heal: 10, composure: 10, desc: 'Starkes Riechsalz; bringt Benommene zu sich: +10 Leben, +10 Nerven.' },
    vi_v_nebelkerze: { composure: 12, calm: 2, desc: 'Kurze Kerze, blauer Rauch; eine Weile sieht dich niemand: +12 Nerven, -2 Unruhe.' },
    vi_v_schlafpulver: { composure: 16, desc: 'Pulver in Papier; eine Stunde traumloser Schlaf: +16 Nerven.' },
    vi_v_schreibfeder_eisen: { composure: 8, desc: 'Feder aus Eisen; ein sauberes Protokoll beruhigt: +8 Nerven.' },
    vi_v_bitterwasser: { heal: 14, calm: 3, desc: 'Trübes Wasser aus der Terrasse; bitter, aber reinigend: +14 Leben, -3 Unruhe.' } };
  for (const [id, w] of Object.entries(WIRKUNG)) Object.assign(items[id], w);
  write(file('vorrat_items', 'items'), items);
}

// --- CK: Saisonwirkungen als Fundstellen auf den drei Marktplätzen (einmal je Jahreszeit, Flag fs_<saison>_wirkung_<n>_genutzt) ----
{
  const wirk = read(file('feste_leben', 'wirkungen'));
  const MARKT = [['altmarkt', JSON.parse(readFileSync('src/data/maps/altmarkt.json', 'utf8')), [10, 9]],
    ['wx_salzmarkt', JSON.parse(readFileSync('src/data/wexmoor.json', 'utf8')).maps.find((m) => m.id === 'wx_salzmarkt'), [12, 9]],
    ['ds_kalkmarkt', JSON.parse(readFileSync('src/data/packs/k3_orte/maps.json', 'utf8')).find((m) => m.id === 'ds_kalkmarkt'), [14, 9]]];
  const out = [];
  for (const list of Object.values(wirk)) {
    list.forEach((w, i) => {
      const [map, def, seed] = MARKT[i % MARKT.length];
      out.push({ map, tile: nearestFloor(def, [seed[0] + Math.floor(i / MARKT.length) * 2, seed[1]]), visible_if: w.visible_if,
        interactable: { id: w.id, kind: 'read', sprite: 'paper', prompt: w.title, title: w.title, text: w.text, footer: 'Einmal je Jahreszeit.', effects: w.effects, marker: false } });
    });
  }
  write(file('feste_leben', 'wirkungen_platzierung'), out);
}

/** Nächstes begehbares Feld zu einer vorgeschlagenen Kachel (Bodenzeichen wie in core/GameState WALKABLE). */

function nearestFloor(m, [x, y]) {
  const at = (px, py) => m.rows[py]?.[px];
  if (WALK.has(at(x, y))) return [x, y];
  for (let r = 1; r < 12; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (WALK.has(at(x + dx, y + dy))) return [x + dx, y + dy];
  }
  throw new Error(`${m.id}: kein Boden nahe ${x},${y}`);
}
console.log('Runde 8 synchronisiert:', PACKS.join(', '));

// --- CN (kg_leben): Kettlegate lebt – Einbauvertrag aus docs/story/kg_leben/offene_punkte.md -------------------------
{
  // Stände: Bild aus props/kgl_staende.png, bei Fahndung ab Stufe 2 nur „geschlossen“; der Kastanienröster nur im Herbst und Winter
  const STAND = { kgl_s_kastanien: 'kgl_kastanien', kgl_s_zeitung: 'kgl_zeitung', kgl_s_heisswasser: 'kgl_heisswasser', kgl_s_streichholz: 'kgl_streichholz', kgl_s_drehorgel: 'kgl_drehorgel',
    kgl_s_schleifer: 'kgl_schleifer', kgl_s_austern: 'kgl_austern', kgl_s_oel: 'kgl_oel' };
  // Ereignisse: je Kartenbesuch eine Chance von 10 %, begonnene bleiben; drei zeigen ihr Bild (umgestürzte Droschke, Schornsteinbrand, Kreidekreis)
  const EV_BILD = { kgl_ev_droschke: 'kgl_droschke_umgestuerzt', kgl_ev_brand: 'kgl_schornsteinbrand', kgl_ev_kreide: 'kgl_kreidekreis' };
  const plats = read(file('kg_leben', 'platzierung')).map((p) => {
    const { tile, ...i } = p.interactable; // CN schreibt das Feld ins Objekt, das Questpack-Format erwartet es daneben
    if (STAND[i.id]) {
      i.stand = STAND[i.id];
      i.fahndung = { min: 2, node: 'kgl_geschlossen' };
      if (i.id === 'kgl_s_kastanien') i.visible_if = { ...(i.visible_if ?? {}), requires_season: ['herbst', 'winter'] };
    }
    if (/^kgl_ev_\w+$/.test(i.id) && !i.id.includes('hinweis')) {
      i.visit_chance = 0.1;
      i.visit_started = `${i.id}_start`;
      if (EV_BILD[i.id]) i.stand = EV_BILD[i.id];
    }
    return { ...p, tile: p.tile ?? tile, interactable: i };
  });
  write(file('kg_leben', 'platzierung'), plats);
  // Einwohner weichen bei Fahndung ab Stufe 2 aus (Knoten kgl_fahndung in jedem Gespräch)
  write(file('kg_leben', 'einwohner'), read(file('kg_leben', 'einwohner')).map((e) => ({ ...e, fahndung: { min: 2, node: 'kgl_fahndung' } })));
}
