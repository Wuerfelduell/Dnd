// Echte Pixel-Art (von Codex erzeugt, liegt unter public/sprites/).
// Die PNGs ersetzen die prozedural gezeichneten Platzhalter aus textures.js unter
// denselben Texture-Keys. Alles, was hier nicht zugeordnet ist (oder nicht lädt),
// bleibt automatisch beim Platzhalter.
import { PATHWAY_STANDIN } from '../data/sequenzen.js';

const BASE = './sprites/';
export const SPRITE_BASE = BASE;

/** Quell-Sheets: Key → Pfad unter public/sprites/. */
export const SHEETS = {
  cobble: 'tilesets/02_01_cobblestone.png',
  sidewalk: 'tilesets/02_02_sidewalk.png',
  facades: 'tilesets/02_03_facades.png',
  roofs: 'tilesets/02_04_roofs_v2.png',
  canal: 'tilesets/02_05_canal.png',
  station: 'tilesets/11_01_police_station_tiles.png',
  ebba: 'tilesets/12b_01_st_ebba_cemetery_tiles.png',
  crypt: 'tilesets/12b_03_crypt_tiles.png',
  streetProps: 'props/05_01_street_props_v2.png',
  clues: 'props/05_02_clues_v2.png',
  clues2: 'props/12b_06_case2_clues.png',
  cryptProps: 'props/12b_04_crypt_props.png',
  player: 'characters/03_01_investigator_walk.png',
  marlowe: 'characters/12_agatha_marlowe_walk.png',
  holt: 'characters/12_sergeant_holt_walk.png',
  rook: 'characters/12_constable_rook_walk.png',
  barnaby: 'characters/12_barnaby_walk.png',
  elias: 'characters/12_elias_thorne_walk.png',
  greta: 'characters/12_greta_walk.png',
  halloway: 'characters/12_mr_halloway_walk.png',
  price: 'characters/12_constable_price_walk.png',
  kit: 'characters/12_kit_walk.png',
  ivy: 'characters/12_ivy_marsh_walk.png',
  hester: 'characters/12_hester_marsh_walk.png',
  anselm: 'characters/12_sexton_anselm_walk.png',
  moll: 'characters/12_moll_walk.png',
  miriam: 'characters/12_miriam_vey_walk.png',
  docks: 'tilesets/13_01_docks_tiles.png',
  doctor: 'characters/04_doctor_walk.png',
  widow: 'characters/04_widow_walk.png',
  newsboy: 'characters/04_newspaper_boy_walk.png',
  dockworker: 'characters/04_dock_worker_walk.png',
  cultist: 'characters/04_cultist_walk.png',
  tavernkeeper: 'characters/04_tavern_keeper_walk.png',
  stranger: 'characters/04_stranger_walk.png',
  beggar: 'characters/04_beggar_walk.png',
  antique: 'characters/04_antique_dealer_walk.png',
  priest: 'characters/04_priest_walk.png',
  lamplighter: 'characters/04_lamplighter_walk.png',
  constable: 'characters/04_constable_walk.png',
  apparition: 'characters/04_13_apparition.png',
  auction: 'props/13_02_auction_props.png',
  // Paket A: Nachtmarkt, Händler, Kessel
  nachtmarkt: 'tilesets/A_07_nachtmarkt_tiles.png',
  marketProps: 'props/A_08_nachtmarkt_props.png',
  pit: 'props/A_08_kampfgrube.png',
  cauldron: 'props/cauldron.png',
  nell: 'characters/A_nell_walk.png',
  kittering: 'characters/A_kittering_walk.png',
  gorse: 'characters/A_gorse_walk.png',
  sabeth: 'characters/A_sabeth_walk.png',
  brock: 'characters/A_brock_walk.png',
  // Paket C: Orte und Props (Regionen in manifest-welt.json)
  lagerhaus: 'tilesets/C_03_lagerhaus_tiles.png',
  lagerhausProps: 'props/C_03_lagerhaus_props.png',
  altmarktTiles: 'tilesets/C_04_altmarkt_tiles.png',
  altmarktProps: 'props/C_04_altmarkt_props.png',
  taverne: 'tilesets/C_05_taverne.png',
  revierExtra: 'props/C_06_revier_extra.png',
  theater: 'tilesets/C_09_theater.png',
  uhrturm: 'tilesets/C_09_uhrturm.png',
  schlachthof: 'tilesets/C_09_schlachthof.png',
  gaskanaele: 'tilesets/C_09_gaskanaele.png',
  sternwarte: 'tilesets/C_09_sternwarte.png',
  g_marsch: 'tilesets/G_01_marsch.png', g_pestgassen: 'tilesets/G_01_pestgassen.png',
  g_katakomben: 'tilesets/G_01_katakomben.png', g_kraterwald: 'tilesets/G_01_kraterwald.png',
  j_giesserei: 'tilesets/J_giesserei_tiles.png', j_haus_vey: 'tilesets/J_haus_vey_tiles.png',
  j_resonanzkammer: 'tilesets/J_resonanzkammer_tiles.png',
  k_atelier: 'tilesets/K_atelier_tiles.png', k_ballsaal: 'tilesets/K_ballsaal_tiles.png',
  k_spiegelkabinett: 'tilesets/K_spiegelkabinett_tiles.png',
  m_kontor: 'tilesets/M_kontor_tiles.png', m_waisenhaus: 'tilesets/M_waisenhaus_tiles.png', m_traumkeller: 'tilesets/M_traumkeller_tiles.png',
  q_kajuete: 'tilesets/Q_kajuete_tiles_v2.png',
  r_wexmoor: 'tilesets/R_wexmoor_tiles_v2.png', r_innen: 'tilesets/R_innen_wexmoor_v2.png', r_vergessmoor: 'tilesets/R_vergessmoor_tiles_v2.png',
  // Paket BT: eigene Blätter für Oberstadt, Salzmarkt, Torfstich und den Güterbahnhof (nur Wexmoor), gleiches Zellenraster
  r_oberstadt_boden: 'tilesets/R_oberstadt_tiles_v2.png', r_salzmarkt_boden: 'tilesets/R_salzmarkt_tiles_v2.png', r_torf_boden: 'tilesets/R_torf_tiles_v2.png',
  c_bahnhof_wx: 'tilesets/C_bahnhof_wexmoor_v2.png',
  r_leuchtturm: 'tilesets/R_leuchtturm_tiles_v2.png',
  // Paket AV (Kapitel 3, Dunscar): Straßen, Bahn, Steinbruch, Schlucht, Innenräume, Zug (8 Spalten à 16 px)
  ds_stadt: 'tilesets/ds_stadt.png', ds_bahn: 'tilesets/ds_bahn.png', ds_bruch: 'tilesets/ds_bruch.png', ds_schlucht: 'tilesets/ds_schlucht.png',
  ds_innen: 'tilesets/ds_innen.png', ds_zug: 'tilesets/ds_zug.png',
  // Paket CI (Kapitel 5, Briarholt): sechs Blätter je kalt/warm (8 Spalten à 16 px, Reihe 5 = Animationsphasen)
  ...Object.fromEntries(['promenade', 'kessel', 'glas', 'stille', 'klinik', 'wurzel'].flatMap((t) => ['kalt', 'warm'].map((v) => [`bh_${t}_${v}`, `tilesets/bh_${t}_${v}.png`]))),
  v_glocke: 'tilesets/V_01_glocke_tiles.png',
  w_altstadt: 'tilesets/W_01_altstadt_tiles.png',
  s_salzwatt: 'tilesets/S_salzwatt_tiles_v2.png', s_lichtlose: 'tilesets/S_lichtlose_tiles.png', s_salz: 'tilesets/S_salz_tiles.png',
  // Grundpaket und Paket D: bisher ungenutzte Innenraum-Tilesets (8 Spalten à 16 px)
  d_wohnung_tiles: 'tilesets/D_08_wohnung_tiles.png', b_interieur: 'tilesets/02_07_interiors.png', b_keller: 'tilesets/02_08_occult_basement.png',
  b_auktion: 'tilesets/13_02_auction_tiles.png', b_sanatorium: 'tilesets/13_03_sanatorium_tiles.png', c_bahnhof: 'tilesets/C_06_bahnhof_tiles.png',
  d_nachtmarkt_boden: 'tilesets/D_01_nachtmarkt_boden.png', b_friedhof: 'tilesets/02_06_cemetery.png',
  // Grundpaket: Möbel, Okkultes, Revier, Archiv, Friedhof, Sigillen
  b_moebel: 'props/05_03_furniture.png', b_okkult: 'props/05_04_occult_props.png', b_revier: 'props/11_02_police_station_props.png',
  b_archiv: 'props/11_03_police_archive.png', b_friedhof_props: 'props/12b_02_st_ebba_cemetery_props.png', b_sigillen: 'props/12b_07_eye_circle_sigils.png',
  o_waage: 'tilesets/O_waage_tiles.png', o_kreide: 'tilesets/O_kreide_tiles.png', o_russ: 'tilesets/O_russ_tiles.png',
};
/** Paket C: Lauf-Sheets (characters/C_<id>_walk.png), Key = Figuren-Id. */
export const C_CHARACTERS = ['pimm', 'fenwick', 'agnes', 'pip', 'tobias', 'cultist', 'maud', 'silas', 'ned', 'quill', 'ambrose',
  'wick', 'grimes', 'nate', 'diva', 'souffleur', 'maskenmacher', 'uhrmacherin', 'turmwaechter', 'schlachtermeister', 'lehrling',
  'gaswerker', 'astronom'];
for (const id of C_CHARACTERS) SHEETS[`c_${id}`] = `characters/C_${id}_walk.png`;

/**
 * Tile-Key → Zelle in einem 16x16-Tileset (Index in Leserichtung).
 * `base`: Tile, das zuerst gezeichnet wird (für Zellen mit transparenten Stellen).
 * Nicht aufgeführte Tiles bleiben Platzhalter.
 */
export const TILE_CELLS = {
  cobble0: ['cobble', 0], cobble1: ['cobble', 1], cobble2: ['cobble', 2], cobble3: ['cobble', 3],
  walk0: ['sidewalk', 0], walk1: ['sidewalk', 2],
  brick: ['facades', 0], window: ['facades', 8], door: ['facades', 16],
  roofEaveBottom: ['roofs', 8], roofEaveTop: ['roofs', 0],
  water0: ['canal', 0], water1: ['canal', 1],
  wood0: ['station', 0], wood1: ['station', 1],
  wallFace: ['station', 9], wallDoor: ['station', 21],
  bars: ['station', 32, 'wood0'],
  path: ['ebba', 3], charred: ['ebba', 6],
  grave: ['ebba', 35, 'grass0'], deadTree: ['ebba', 39, 'grass0'], rubble: ['ebba', 22, 'charred'],
  fence: ['ebba', 42, 'grass0'],
  stone: ['crypt', 11], cryptFace: ['crypt', 29],
  planks0: ['docks', 0], planks1: ['docks', 1], quay: ['docks', 8],
  crate: ['docks', 24, 'planks0'], barrel: ['docks', 37, 'planks1'],
  // Nachtmarkt (Paket A): Zeilen laut manifest-pfade.json
  // (Das Kopfsteinpflaster aus Zeile 0 liest sich im Spiel wie Mauerwerk, daher bleibt der Boden beim normalen Pflaster.)
  nmArch: ['nachtmarkt', 16], nmArchDrip: ['nachtmarkt', 17],
  nmWall0: ['nachtmarkt', 40], nmWall1: ['nachtmarkt', 41], nmChalk: ['nachtmarkt', 42], nmLedge: ['nachtmarkt', 48],
  nmQuay: ['nachtmarkt', 28], nmRail: ['pit', 4, 'cobble0'],
};

/**
 * Paket C: Kartenthemen aus benannten Regionen (manifest-welt.json). Jeder Eintrag erzeugt den
 * Tile-Key `<thema>_<name>`; `solid` blockiert, `base` liegt unter transparenten Zellen.
 * Welche Kartenzeichen welche Keys nutzen, steht in THEMES (WorldScene.js).
 */
/**
 * Paket CI (Briarholt, Batch briarholt1): sechs Blätter je kalt und warm, gleiche Zellenbelegung (Zellindex im 8er-Raster laut
 * manifest-briarholt1.json). Labor und Mutterhaus sind eigene Themen auf dem Klinik-Blatt (Fliesen bzw. Parkett statt Pumpenboden).
 */
const BH_THEME_SPECS = {
  bh_promenade: { fallback: 'cobble0', floor: [0, 1], stain: [2], wet: [4], wallTop: [8], wallFace: [9], window: [12] },
  bh_kessel: { fallback: 'cobble0', floor: [0, 1, 2], wet: [3], wallTop: [24], wallFace: [25], window: [26] },
  bh_glas: { fallback: 'stone', floor: [0, 1], debris: [36], wallTop: [8], wallFace: [9], window: [10] },
  bh_stille: { fallback: 'stone', floor: [0, 5], wear: [1], wallTop: [8], wallFace: [9], window: [12, 13] },
  bh_klinik: { fallback: 'stone', floor: [0], wear: [1], wallTop: [11], wallFace: [12], window: [10] },
  bh_labor: { sheet: 'bh_klinik', fallback: 'stone', floor: [2], wear: [3], wallTop: [21], wallFace: [22], window: [23] },
  bh_mutterhaus: { sheet: 'bh_klinik', fallback: 'wood0', floor: [4, 5], wear: [35], wallTop: [27], wallFace: [28], window: [29] },
  bh_wurzel: { fallback: 'stone', floor: [0, 1, 31], debris: [2], wet: [5], wallTop: [8], wallFace: [9, 37], window: [10, 11] },
};
export const BH_THEME_KEYS = Object.keys(BH_THEME_SPECS).flatMap((t) => [`${t}_kalt`, `${t}_warm`]);
const BH_THEME_TILES = Object.fromEntries(Object.entries(BH_THEME_SPECS).flatMap(([t, { sheet = t, ...spec }]) => ['kalt', 'warm'].map((v) => [`${t}_${v}`, { ...spec, sheet: `${sheet}_${v}` }])));
export const THEME_TILES = {
  // Paket G: Gefahrengebiete (tilesets/G_01_<gebiet>.png, Zahlen = Zellindex im 8x8-Raster)
  g_marsch: { sheet: 'g_marsch', fallback: 'grass0', floor: [24, 25, 28, 30, 48, 49, 51], mud: [8, 9, 10, 11], wood: [16, 17, 18],
    water: [0, 1, 2, 3], gas: [4, 5, 6, 7], shoreN: [32, 33, 34], shoreS: [40, 42], rocks: [52, 53, 54, 55], reeds: [13, 14, 15] },
  g_katakomben: { sheet: 'g_katakomben', fallback: 'stone', floor: [0, 4, 5, 6, 37, 40, 42, 43, 49, 51], moss: [1, 38],
    wallTop: [8], wallFace: [9, 10, 60, 61], niche: [11, 12, 13], candle: [14, 15], grave: [16, 17, 18, 19], pillar: [30, 31],
    bones: [62, 63], rubble: [44, 45, 46, 47] },
  g_kraterwald: { sheet: 'g_kraterwald', fallback: 'grass0', floor: [0, 1, 8, 16, 23], tufts: [2, 10, 20, 28],
    path: [17, 24, 25, 34], ash: [33, 35, 42, 43, 50], shards: [9, 15, 21, 22, 40, 41, 47], rocks: [4, 5, 12, 13], trees: [6, 7, 14, 48] },
  g_pestgassen: { sheet: 'g_pestgassen', fallback: 'cobble0', floor: [0, 1, 8, 9, 12, 13, 14, 15], weeds: [2, 3, 10, 11],
    rubble: [37, 38, 39], barricade: [41, 42, 43] },
  // Bisher ungenutzte Innenräume: Mietwohnung (D_08), Haus Morrow (02_07), Schleierhaus-Keller (02_08),
  // Pfandhaus (13_02), Bestatter (13_03)
  c_bahnhof: { sheet: 'c_bahnhof', fallback: 'stone', floor: [0, 1, 2, 3, 24, 25, 26], edge: [4, 5, 6, 7], rails: [8, 9, 10, 11] },
  // Paket BT: Güterbahnhof auf Pfählen (nur Wexmoor-Karten), Zellen wie c_bahnhof
  c_bahnhof_wx: { sheet: 'c_bahnhof_wx', fallback: 'stone', floor: [0, 1, 2, 3, 24, 25, 26], edge: [4, 5, 6, 7], rails: [8, 9, 10, 11] },
  d_nachtmarkt: { sheet: 'd_nachtmarkt_boden', fallback: 'stone', floor: [0, 1, 2, 3, 22, 23], accent: [4, 5, 6, 7, 8, 9] },
  d_wohnung: { sheet: 'd_wohnung_tiles', fallback: 'wood0', floor: [0, 1], carpet: [12, 13], wallTop: [48, 49, 50], wallFace: [16, 17, 18, 24, 25, 26] },
  b_interieur: { sheet: 'b_interieur', fallback: 'wood0', floor: [8, 9, 10], wallTop: [24, 25, 26], wallFace: [16, 17, 18, 19, 20, 21] },
  b_keller: { sheet: 'b_keller', fallback: 'stone', floor: [0, 1, 8, 9, 16, 17], wallTop: [28], wallFace: [3, 4, 11, 12] },
  b_auktion: { sheet: 'b_auktion', fallback: 'wood0', floor: [0, 1, 2], wallTop: [3], wallFace: [4, 5, 6, 7] },
  b_sanatorium: { sheet: 'b_sanatorium', fallback: 'stone', floor: [1, 4, 5, 6], wallTop: [8, 9, 10, 11], wallFace: [8, 9, 10, 11] },
  // Paket J (Fall 5): Gießerei, Haus Vey, Resonanzkammer (8x8-Raster)
  j_giesserei: { sheet: 'j_giesserei', fallback: 'stone', floor: [0, 1, 2, 3], sand: [12, 13, 56, 57], slag: [52, 53, 54, 55],
    wallFace: [20, 22, 23, 24, 25, 26, 27], window: [28], wallTop: [4, 5, 8, 9], crate: [33, 34, 35, 36], shelf: [42, 43], bench: [41] },
  j_haus_vey: { sheet: 'j_haus_vey', fallback: 'wood0', floor: [0, 1, 5, 6, 56, 57, 61, 62], wear: [4, 58, 60, 63],
    wallTop: [17, 18, 21, 22], wallFace: [24, 25, 26, 27, 29, 30], picture: [28], cabinet: [32, 33, 34, 35] },
  j_resonanzkammer: { sheet: 'j_resonanzkammer', fallback: 'stone', floor: [0, 7, 8, 15, 56, 63],
    ring: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 56, 57, 58, 59, 60, 61, 62, 63], wallTop: [16, 17, 18, 19, 20, 21, 22, 23],
    wallFace: [24, 25, 26, 27, 28, 29, 30, 31], wallDark: [32, 33, 37, 38, 39], dais: [34, 35, 36, 44, 45, 46, 47], steps: [41, 42] },
  // Paket K (Fall 6): Atelier, Ballsaal, Spiegelkabinett (8x8-Raster)
  k_atelier: { sheet: 'k_atelier', fallback: 'wood0', floor: [0, 0, 0, 1], dark: [4, 5, 6, 7], stain: [11, 12, 13, 14, 15],
    checker: [8, 9, 10, 16, 17, 18, 24, 25, 26], wallTop: [32, 35, 36], wallFace: [40, 41, 42, 43, 44, 46], skylight: [48, 49, 50, 51],
    wallDark: [27, 28, 30], curtain: [52], grate: [53] },
  k_ballsaal: { sheet: 'k_ballsaal', fallback: 'stone', floor: [0, 1, 0, 1, 2], parquet: [8, 9, 10, 16, 17, 18, 24, 25, 26],
    carpet: [11, 12, 13, 19, 20, 21, 27, 28, 29], wallTop: [14, 15], wallFace: [22, 30, 56, 57, 58], mirrorTop: [32, 33],
    mirrorFace: [40, 41], curtainTop: [34, 35], curtainFace: [42, 43], wallSide: [48, 49], stage: [60, 61, 62, 63], railing: [39, 47, 55] },
  k_spiegelkabinett: { sheet: 'k_spiegelkabinett', fallback: 'wood0', floor: [0, 1, 2, 3, 4, 5, 6, 7, 48, 50, 52, 54], arrow: [40],
    chalk: [41, 42, 43, 45, 46, 47], wallTop: [8, 9, 10, 11, 12, 13, 14, 15], wallFace: [16, 17, 18, 19, 20, 21, 22, 23],
    mirror: [32, 33, 34, 35] },
  // Paket M (Fall 7/8): Kontor Thorne mit Kohlenkeller, Waisenhaus, Traumkeller (8x6-Raster)
  m_kontor: { sheet: 'm_kontor', fallback: 'wood0', floor: [0, 1, 2, 3], stone: [24, 25, 26, 28, 29, 30], wet: [27, 41, 43],
    wallTop: [16, 17, 18], wallFace: [8, 9, 11, 12, 15], cellarTop: [31], cellarFace: [40, 42], coal: [33, 34, 35] },
  m_waisenhaus: { sheet: 'm_waisenhaus', fallback: 'wood0', floor: [0, 1, 2, 3], dorm: [8, 9, 10, 11], under: [9],
    wallTop: [24, 25, 26, 27, 28], window: [29], wallFace: [32, 33, 34, 35, 40, 41, 42, 43] },
  m_traumkeller: { sheet: 'm_traumkeller', fallback: 'stone', floor: [0, 1, 2, 3, 22, 23, 30, 31], threads: [4, 5, 6, 7, 35, 37, 39],
    wallTop: [8, 10], wallFace: [16, 17, 18, 19, 20, 21], wallDark: [45, 46, 47], dais: [24, 25, 26, 27, 28, 29] },
  // Paket Q (Wexmoor): Zunders Kahn (8x3-Raster)
  q_kajuete: { sheet: 'q_kajuete', fallback: 'wood0', floor: [0, 1, 2, 3], wet: [6, 7], wallTop: [8], wallFace: [9, 15, 16],
    porthole: [12] },
  // Paket R (Wexmoor): Stege, Wasser, Schilf, Torf, Pflaster der Oberstadt, Kai (8x8-Raster)
  r_wexmoor: { sheet: 'r_wexmoor', fallback: 'wood0', floor: [0, 1, 2, 3], wood: [4, 5, 6, 7], edgeN: [8], edgeE: [9], edgeS: [10], edgeW: [11],
    water: [20, 22, 24, 26], reeds: [28, 29], mud: [42, 43, 44, 45], wet: [46, 47], path: [48, 49, 50, 51], bridge: [52, 53],
    sand: [56, 57], quayN: [58], quayE: [59], quayS: [60], quayW: [61] },
  // Varianten auf demselben Blatt: Oberstadt-Pflaster, Salzkruste am Markt, Torfschlamm
  r_oberstadt: { sheet: 'r_oberstadt_boden', fallback: 'cobble0', floor: [48, 49, 50, 51] },
  r_salzmarkt: { sheet: 'r_salzmarkt_boden', fallback: 'wood0', floor: [0, 1, 2, 3], sand: [56, 57] },
  r_torf: { sheet: 'r_torf_boden', fallback: 'path', floor: [42, 43, 44, 45], wet: [46, 47] },
  // Innenräume: Akademie, Haus Lucent, Wachhaus, Zelle (je Boden 4, Wand oben/vorn/links/rechts)
  r_akademie: { sheet: 'r_innen', fallback: 'wood0', floor: [0, 1, 2, 3], wallTop: [4], wallFace: [5], wallSide: [6, 7] },
  r_lucent: { sheet: 'r_innen', fallback: 'wood0', floor: [8, 9, 10, 11], wallTop: [12], wallFace: [13], wallSide: [14, 15] },
  r_wachhaus: { sheet: 'r_innen', fallback: 'stone', floor: [16, 17, 18, 19], wallTop: [20], wallFace: [21], wallSide: [22, 23] },
  r_zelle: { sheet: 'r_innen', fallback: 'stone', floor: [24, 25, 26, 27], wallTop: [28], wallFace: [29], wallSide: [30, 31], bars: [32] },
  r_vergessmoor: { sheet: 'r_vergessmoor', fallback: 'water0', water: [0, 1, 2, 3], ghost: [4], floor: [6, 7, 8, 9] },
  r_leuchtturm: { sheet: 'r_leuchtturm', fallback: 'stone', floor: [0, 1, 2, 3], ring: [4, 6], wallTop: [8], wallFace: [9],
    niche: [16, 17, 18, 19], glow: [24, 25, 26, 27], sand: [28, 29, 30, 31] },
  // Paket V: Gasthaus „Zur Ertrunkenen Glocke“ (8x3-Raster)
  v_glocke: { sheet: 'v_glocke', fallback: 'wood0', floor: [0, 1, 2, 3], wallTop: [4], wallFace: [5, 6], porthole: [18], curtain: [20], carpet: [21] },
  // Paket W: Versunkene Altstadt (Pflaster im Schlick, Flutwasser, Häuser mit Kupferdach, Stege auf Pfählen; 8x4-Raster)
  w_altstadt: { sheet: 'w_altstadt', fallback: 'path', floor: [0, 1, 2, 3], debris: [22], water: [4, 6, 8, 10], deep: [12],
    wallTop: [13], wallFace: [14], window: [21], roof: [31], reeds: [28], wood: [29], bridge: [30] },
  // Paket S: Salzwatt (Schlick, Salzkruste, Priele, Meer, Pfähle, Damm), Keller der Lichtlosen, Salzspeicher (8x4-Raster)
  s_salzwatt: { sheet: 's_salzwatt', fallback: 'path', floor: [0, 1, 2, 3], sand: [4, 5, 6, 7], debris: [22], water: [30, 31], deep: [20, 21],
    stakes: [23], path: [24, 25, 26, 27] },
  s_lichtlose: { sheet: 's_lichtlose', fallback: 'wood0', floor: [0, 1, 2, 3], ash: [4, 5, 6, 7], wallFace: [8, 9, 10, 11], wallTop: [12, 13, 14, 15] },
  s_salz: { sheet: 's_salz', fallback: 'wood0', floor: [0, 1, 2, 3], sand: [4, 5, 6, 7], wallFace: [12, 13, 14, 15], wallTop: [8, 9, 10, 11] },
  // Paket O (Geheime Treffen): Gewölbe der Stillen Waage, Hinterzimmer des Kreidezirkels, Kohlenschuppen (8x4-Raster)
  o_waage: { sheet: 'o_waage', fallback: 'stone', floor: [0, 1, 2, 3], wet: [4, 7], wallTop: [17, 20, 21], wallFace: [16, 22, 23],
    niche: [19], grate: [24] },
  o_kreide: { sheet: 'o_kreide', fallback: 'wood0', floor: [0, 1, 2, 3], chalk: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    wallTop: [16, 17, 21], wallFace: [18, 20, 22], board: [19], shelf: [26, 28] },
  o_russ: { sheet: 'o_russ', fallback: 'stone', floor: [0, 1, 2, 3], ash: [6], wallTop: [16, 17], wallFace: [20, 21, 23],
    door: [18, 19] },
  // Paket AV (Kapitel 3, Dunscar): Zellindex im 8er-Raster laut manifest-dunscar1.json
  ds_stadt: { sheet: 'ds_stadt', fallback: 'cobble0', floor: [0, 1, 2], chalk: [4], debris: [5, 6, 7], wallTop: [8], wallFace: [9], window: [12, 13] },
  ds_bahn: { sheet: 'ds_bahn', fallback: 'stone', floor: [9, 45], debris: [31, 46, 47], rails: [0] },
  ds_bruch: { sheet: 'ds_bruch', fallback: 'stone', floor: [0, 1, 2, 3], debris: [4, 5], wet: [6, 7], wallTop: [8], wallFace: [9] },
  ds_schlucht: { sheet: 'ds_schlucht', fallback: 'stone', floor: [16, 17, 18, 19], debris: [22], wallTop: [20], wallFace: [0, 1], grooves: [2, 3] },
  ds_innen: { sheet: 'ds_innen', fallback: 'wood0', floor: [0, 1, 2, 3], wear: [4, 5], wallTop: [8], wallFace: [9] },
  ds_teesaal: { sheet: 'ds_innen', fallback: 'wood0', floor: [0, 1, 2, 3], carpet: [6, 7], wallTop: [12], wallFace: [13] },
  ds_zug: { sheet: 'ds_zug', fallback: 'wood0', floor: [0, 1], wallTop: [31], wallFace: [11], window: [12, 13, 14, 15] },
  warehouse: {
    sheet: 'lagerhaus', base: 'floor_1', fallback: 'wood0',
    floor: ['floor_1', 'floor_2', 'floor_3'], debris: ['floor_broken', 'tile_04', 'tile_05', 'tile_06', 'tile_07'],
    wallFace: ['tile_08', 'tile_09', 'tile_10', 'tile_12'], wallTop: ['tile_16', 'tile_17', 'tile_18'],
  },
  tavern: {
    sheet: 'taverne', base: 'floor_1', fallback: 'wood0',
    floor: ['floor_1', 'floor_2', 'floor_3'],
    wallTop: ['wall_0', 'wall_3'], wallFace: ['wall_1', 'wall_2', 'wall_4', 'wall_window_0', 'wall_window_1', 'wall_window_3'],
    bar: ['bar_0', 'bar_1', 'bar_2'], shelf: ['bar_3', 'bar_4', 'bar_5', 'bar_6'], barrel: ['barrel_side'], tableBase: ['floor_2'],
  },
  altmarkt: {
    sheet: 'altmarktTiles', base: 'cobble_1', fallback: 'cobble0',
    floor: ['cobble_1', 'cobble_2', 'cobble_3'], stallBase: ['cobble_2'],
  },
  theater: {
    sheet: 'theater', base: 'floor_0', fallback: 'wood0',
    floor: ['floor_0', 'floor_1', 'floor_2', 'floor_3', 'floor_4'], wallFace: ['backstage_0', 'backstage_1', 'backstage_2', 'backstage_3'],
    wallTop: ['backstage_0'], seat: ['seat_0', 'seat_1', 'seat_2'],
  },
  uhrturm: {
    sheet: 'uhrturm', base: 'floor_0', fallback: 'wood0',
    floor: ['floor_0', 'floor_1', 'floor_2', 'floor_3', 'floor_4', 'floor_5', 'floor_6', 'floor_7'],
    wallFace: ['wall_0', 'wall_1', 'wall_2', 'wall_3', 'wall_5'], wallTop: ['wall_12', 'wall_13', 'wall_14', 'wall_15'],
  },
  schlachthof: {
    sheet: 'schlachthof', base: 'floor_0', fallback: 'stone',
    floor: ['floor_0', 'floor_1', 'floor_2', 'floor_3', 'floor_4'], wet: ['wet_floor_0', 'wet_floor_1', 'wet_floor_2', 'wet_floor_3', 'wet_floor_4'],
    wood: ['floor_5', 'floor_6', 'floor_7', 'floor_8'], wallFace: ['wall_0', 'wall_1', 'wall_2', 'wall_3', 'wall_4', 'wall_5', 'wall_6', 'wall_7'],
    wallTop: ['wall_8', 'wall_9', 'wall_10', 'wall_11'],
  },
  gaskanaele: {
    sheet: 'gaskanaele', base: 'floor_0', fallback: 'stone',
    floor: ['floor_0', 'floor_1', 'floor_2', 'floor_3', 'floor_4', 'floor_5', 'floor_6'],
    wallFace: ['wall_0', 'wall_1', 'wall_2', 'wall_3', 'wall_4', 'wall_5', 'wall_6', 'wall_7'],
    wallTop: ['wall_8', 'wall_9', 'wall_10', 'wall_11'], water: ['water'],
  },
  sternwarte: {
    sheet: 'sternwarte', base: 'floor_round_0', fallback: 'stone',
    floor: ['floor_round_0', 'floor_round_1', 'floor_round_2'], wallFace: ['wall_0', 'wall_1', 'wall_2', 'wall_3'], wallTop: ['wall_4', 'wall_5', 'wall_6', 'wall_7'],
  },
  ...BH_THEME_TILES,
};
/** Gruppen, die begehbar bleiben; alles andere blockiert. */
const WALKABLE_GROUPS = ['floor', 'bridge', 'glow', 'debris', 'wet', 'wood', 'mud', 'moss', 'tufts', 'path', 'ash', 'shards', 'weeds', 'sand', 'slag', 'wear', 'ring',
  'dark', 'stain', 'checker', 'parquet', 'carpet', 'arrow', 'chalk', 'stone', 'dorm', 'threads',
  'edge', 'rails']; // Bahnhof Wexmoor: Bahnsteigkante und Gleise sind begehbar (sonst sind Bahnsteig und Ausgang abgeschnitten)
/** Ersatz-Painter (textures.js) je Gruppe, falls das PNG fehlt. */
const GROUP_FALLBACK = { wallFace: 'wallFace', wallTop: 'wallTop', bar: 'desk', shelf: 'shelf', barrel: 'barrel', seat: 'desk', water: 'water0' };

/** Alle Themen-Tiles: [{ key, sheet, region, solid, fallback, theme, group }]. */
export const THEME_TILE_LIST = Object.entries(THEME_TILES).flatMap(([theme, spec]) => Object.entries(spec)
  .filter(([group, v]) => Array.isArray(v))
  .flatMap(([group, regions]) => regions.map((region) => ({
    key: `${theme}_${group}_${region}`, theme, group, sheet: spec.sheet, region,
    solid: !WALKABLE_GROUPS.includes(group), fallback: GROUP_FALLBACK[group] ?? spec.fallback,
    base: WALKABLE_GROUPS.includes(group) ? null : `${theme}_floor_${spec.floor[0]}`,
  }))));
/** Tile-Keys einer Themen-Gruppe (für tileIndexFor). */
export const themeKeys = (theme, group) => (THEME_TILES[theme]?.[group] ?? []).map((r) => `${theme}_${group}_${r}`);
for (const t of THEME_TILE_LIST) TILE_CELLS[t.key] = [t.sheet, t.region, t.base];

/** Prop-Texture-Key → Ausschnitt [sheet, x, y, w, h, scale?]. Ausgabegröße = w x h (mal scale). */
export const PROP_CELLS = {
  lamp_lit: ['streetProps', 16, 0, 16, 48],
  lamp_frost: ['streetProps', 64, 0, 16, 48],
  paper: ['clues', 0, 0, 16, 16],
  seal: ['clues', 80, 0, 16, 16],
  coins: ['clues', 112, 0, 16, 16],
  bottle: ['clues', 0, 16, 16, 16],
  file: ['clues', 96, 16, 16, 16],
  musicbox: ['clues2', 0, 0, 16, 16],
  medallion: ['clues2', 32, 0, 16, 16],
  shovel: ['clues2', 64, 0, 16, 16],
  candle: ['cryptProps', 16, 16, 16, 16],
  mirror: ['auction', 80, 80, 32, 32],
  apparition: ['apparition', 0, 0, 16, 32, 2], // für den Kampf auf 32x64 vergrößert
  cauldron: ['cauldron', 0, 0, 32, 32],
  // Nachtmarkt-Deko (Regionen aus manifest-pfade.json)
  herb_stall: ['marketProps', 0, 0, 48, 32],
  formula_booth: ['marketProps', 64, 0, 32, 32],
  pawn_table: ['marketProps', 112, 0, 48, 32],
  fortune_corner: ['marketProps', 0, 48, 32, 32],
  crow_sign: ['marketProps', 80, 80, 32, 16],
  noticeboard: ['marketProps', 128, 80, 16, 32],
  sleeping_crows: ['marketProps', 160, 80, 32, 16],
  betting_board: ['pit', 64, 32, 16, 32],
  coin_barrel: ['pit', 96, 32, 16, 32],
  pit_bench: ['pit', 0, 64, 32, 16],
  pit_floor: ['pit', 0, 0, 48, 48],
  // Paket C
  circle: ['lagerhausProps', 80, 0, 48, 48], // Kreidezeichen im Lagerhaus
  altar_c: ['lagerhausProps', 0, 0, 32, 16],
  robes: ['lagerhausProps', 32, 16, 32, 32],
  chain_hoist: ['lagerhausProps', 64, 16, 16, 48],
  overturned_chair: ['lagerhausProps', 16, 32, 16, 16],
  hymn_sheets: ['lagerhausProps', 16, 16, 16, 16],
  crate_stack: ['lagerhausProps', 0, 16, 16, 32],
  locker: ['revierExtra', 0, 0, 16, 32],
  bellmount: ['revierExtra', 16, 0, 32, 32],
  boot_rack: ['revierExtra', 48, 0, 32, 16],
  kettle_stove: ['revierExtra', 112, 0, 16, 16],
  market_stall_0: ['altmarktTiles', 48, 48, 32, 32],
  market_stall_1: ['altmarktTiles', 80, 48, 32, 32],
  market_stall_2: ['altmarktTiles', 112, 48, 32, 32],
  market_stall_3: ['altmarktTiles', 144, 48, 32, 32],
  chapel: ['altmarktTiles', 176, 48, 48, 48],
  veg_crate: ['altmarktTiles', 240, 0, 16, 16],
  veg_basket: ['altmarktTiles', 240, 16, 16, 16],
  fruit_cart: ['altmarktProps', 96, 0, 32, 16],
  weighing_scale: ['altmarktProps', 80, 0, 16, 32],
  table_stools: ['taverne', 64, 16, 32, 32],
  corner_booth: ['taverne', 96, 16, 32, 32],
  barrels_stacked: ['taverne', 128, 16, 16, 32],
  moon_sign: ['taverne', 32, 32, 32, 16],
  chalkboard: ['taverne', 48, 48, 16, 16],
  mugs: ['taverne', 144, 32, 16, 16],
  // Grundpaket (bisher ungenutzt): Möbel, Okkultes, Revier, Archiv, Friedhof, Sigillen
  c_bahn_bank: ['c_bahnhof', 0, 64, 32, 16], c_bahn_karren: ['c_bahnhof', 32, 64, 32, 16], c_bahn_kiosk: ['c_bahnhof', 64, 64, 32, 32], c_bahn_koffer: ['c_bahnhof', 96, 64, 32, 16],
  c_bahn_saeule: ['c_bahnhof', 0, 80, 16, 48], c_bahn_uhr: ['c_bahnhof', 16, 80, 16, 48],
  b_moebel_schreibtisch: ['b_moebel', 16, 16, 32, 32], b_moebel_buecherregal: ['b_moebel', 80, 16, 32, 32], b_moebel_stuhl: ['b_moebel', 144, 16, 16, 32], b_moebel_esstisch: ['b_moebel', 192, 16, 48, 32], b_moebel_bett: ['b_moebel', 16, 64, 32, 48], b_moebel_schrank: ['b_moebel', 80, 64, 32, 48], b_moebel_standuhr: ['b_moebel', 144, 64, 16, 48], b_moebel_kandelaber: ['b_moebel', 208, 81, 16, 31], b_moebel_truhe: ['b_moebel', 16, 144, 32, 16], b_moebel_staffelei: ['b_moebel', 80, 144, 16, 32], b_moebel_pflanze: ['b_moebel', 144, 144, 16, 32], b_moebel_globus: ['b_moebel', 208, 144, 16, 32],
  b_okkult_altar: ['b_okkult', 0, 0, 32, 31], b_okkult_armillarsphaere: ['b_okkult', 64, 0, 16, 32], b_okkult_schrein: ['b_okkult', 112, 16, 16, 16], b_okkult_opferschale: ['b_okkult', 160, 16, 16, 16], b_okkult_spiegel: ['b_okkult', 16, 48, 16, 32], b_okkult_schaedel: ['b_okkult', 64, 64, 16, 16], b_okkult_kaestchen: ['b_okkult', 112, 64, 16, 16], b_okkult_tarot: ['b_okkult', 144, 64, 32, 16],
  b_revier_tresen: ['b_revier', 0, 16, 48, 32], b_revier_schreibtisch: ['b_revier', 80, 16, 32, 32], b_revier_aktenschrank: ['b_revier', 144, 16, 16, 32], b_revier_asservaten: ['b_revier', 208, 0, 32, 48], b_revier_pinnwand: ['b_revier', 16, 80, 32, 32], b_revier_steckbriefe: ['b_revier', 80, 80, 32, 16], b_revier_telefontisch: ['b_revier', 144, 80, 16, 32], b_revier_schreibmaschine: ['b_revier', 208, 80, 16, 16], b_revier_bank: ['b_revier', 16, 144, 32, 16], b_revier_pritsche: ['b_revier', 80, 144, 16, 32], b_revier_eimer: ['b_revier', 144, 144, 16, 16], b_revier_garderobe: ['b_revier', 208, 144, 16, 32], b_revier_uhr: ['b_revier', 16, 208, 16, 16], b_revier_waffenschrank: ['b_revier', 80, 208, 16, 32], b_revier_aktenstapel: ['b_revier', 144, 208, 16, 32],
  b_archiv_kiste: ['b_archiv', 16, 16, 16, 16], b_archiv_regal_a: ['b_archiv', 80, 0, 16, 48], b_archiv_regal_b: ['b_archiv', 144, 0, 16, 48], b_archiv_lesetisch: ['b_archiv', 16, 80, 32, 32], b_archiv_leiter: ['b_archiv', 80, 64, 16, 48], b_archiv_gitter: ['b_archiv', 144, 81, 32, 31], b_archiv_saeulen: ['b_archiv', 16, 144, 32, 32], b_archiv_akte: ['b_archiv', 80, 144, 16, 16], b_archiv_spinnweben: ['b_archiv', 144, 144, 16, 15],
  b_grab_grabstein: ['b_friedhof_props', 16, 16, 16, 16], b_grab_stele: ['b_friedhof_props', 80, 16, 16, 32], b_grab_kreuz: ['b_friedhof_props', 145, 16, 15, 16], b_grab_obelisk: ['b_friedhof_props', 208, 16, 16, 32], b_grab_engel: ['b_friedhof_props', 16, 80, 16, 32], b_grab_grabmal_a: ['b_friedhof_props', 80, 80, 16, 32], b_grab_grabmal_b: ['b_friedhof_props', 144, 80, 16, 32], b_grab_truemmer: ['b_friedhof_props', 208, 80, 31, 16], b_grab_baum_a: ['b_friedhof_props', 16, 129, 32, 47], b_grab_baum_b: ['b_friedhof_props', 81, 128, 31, 48], b_grab_schaufel: ['b_friedhof_props', 144, 144, 15, 32], b_grab_urne: ['b_friedhof_props', 208, 144, 16, 16], b_grab_gruft: ['b_friedhof_props', 16, 208, 32, 32], b_grab_huette: ['b_friedhof_props', 64, 192, 48, 48], b_grab_laterne: ['b_friedhof_props', 144, 208, 16, 32],
  b_sigil_auge: ['b_sigillen', 16, 16, 16, 16], b_sigil_kreis: ['b_sigillen', 80, 16, 16, 16], b_sigil_zeichen: ['b_sigillen', 144, 17, 16, 14], b_sigil_gross: ['b_sigillen', 208, 16, 32, 32],
};

/** Senkrechter Ankerpunkt für Props, die höher als ein Tile sind (Fuß auf der Tile-Unterkante). */
export const PROP_ORIGINS = { locker: 0.75, bellmount: 0.75 };

/** Animierte Deko aus Regionen eines Sheets: Key → [sheet, [[x, y, w, h], ...], frameRate]. */
export const PROP_ANIMS = {
  market_lanterns: ['marketProps', [[48, 48, 48, 16], [112, 48, 48, 16]], 4],
  brazier: ['marketProps', [[0, 96, 16, 32], [16, 96, 16, 32], [32, 96, 16, 32], [48, 96, 16, 32]], 6],
  fountain: ['altmarktTiles', [[96, 0, 48, 48], [144, 0, 48, 48], [192, 0, 48, 48], [0, 16, 48, 48]], 4],
  fireplace: ['taverne', [[160, 16, 32, 32], [192, 16, 32, 32], [224, 16, 32, 32], [0, 32, 32, 32]], 6],
};

/** Figur → Lauf-Sheet (64x128, Zeilen: unten, links, rechts, oben – wie DIRS). */
export const CHARACTER_SHEETS = {
  player: 'player',
  npc_marlowe: 'marlowe', npc_holt: 'holt', npc_rook: 'rook', npc_barnaby: 'barnaby',
  npc_elias: 'elias', npc_greta: 'greta', npc_halloway: 'halloway', npc_price: 'price',
  npc_kit: 'kit', npc_ivy: 'ivy', npc_hester: 'hester', npc_anselm: 'anselm', npc_moll: 'moll',
  npc_miriam: 'miriam',
  npc_fenwick: 'doctor', npc_agnes: 'widow', npc_pip: 'newsboy', npc_tobias: 'dockworker', npc_cultist: 'cultist',
  npc_maud: 'tavernkeeper', npc_silas: 'stranger', npc_ned: 'beggar', npc_quill: 'antique', npc_ambrose: 'priest',
  npc_wick: 'lamplighter', npc_grimes: 'constable', npc_elsbeth: 'widow', npc_price_wx: 'price',
  npc_nell: 'nell', npc_kittering: 'kittering', npc_gorse: 'gorse', npc_sabeth: 'sabeth', npc_grubenwirt: 'brock',
};
// Paket C ersetzt die älteren Lauf-Sheets und bringt Miss Pimm, Nate und die Figuren der neuen Orte.
for (const id of C_CHARACTERS) CHARACTER_SHEETS[`npc_${id}`] = `c_${id}`;

/** Figur → Portrait-Streifen (256x64, vier Ausdrücke à 64x64) unter public/sprites/portraits/. */
export const PORTRAITS = {
  ...Object.fromEntries(['holt', 'pimm', 'rook', 'barnaby', 'elias', 'greta', 'halloway', 'price', 'kit', 'ivy', 'anselm', 'moll',
    'hester', 'fenwick', 'agnes', 'pip', 'tobias', 'cultist', 'miriam', 'maud', 'silas', 'ned', 'quill', 'ambrose', 'wick', 'grimes',
    'nate', 'diva', 'souffleur', 'maskenmacher', 'uhrmacherin', 'turmwaechter', 'schlachtermeister', 'lehrling', 'gaswerker', 'astronom']
    .map((id) => [id, `C_${id}_emotions.png`])),
  nell: 'A_nell_emotions.png', kittering: 'A_kittering_emotions.png', gorse: 'A_gorse_emotions.png',
  sabeth: 'A_sabeth_emotions.png', grubenwirt: 'A_brock_emotions.png',
  marlowe: '12_agatha_marlowe_police_emotions.png', player: '06_investigator_emotions.png',
  // Kapitel 2: Price reist nach Wexmoor, Elsbeth Rowe trägt die Witwentracht aus dem Grundpaket.
  price_wx: 'C_price_emotions.png', elsbeth: '06_widow_emotions.png',
  // Streife der Fahndung (Festnahme): Constable aus dem Grundpaket.
  streife: '06_constable_emotions.png',
};
/** Ausdruck (Dialogknoten-Feld "mood") → Spalte im Portrait-Streifen. */
export const PORTRAIT_MOODS = { neutral: 0, suspicious: 1, skeptical: 1, shocked: 2, smile: 3, faint_smile: 3, approving: 2, angry: 3, bidding: 3 };
export const portraitUrl = (id) => (PORTRAITS[id] ? `${BASE}portraits/${PORTRAITS[id]}` : null);

/** Stadtkarte: Karte → Zelle in ui/C_08_map_markers.png (13 Spalten, Zeile 2 = hervorgehoben). */
export const MAP_MARKERS = {
  revier: 0, ashgrove: 1, ebba: 2, docks: 3, altmarkt: 4, tavern: 5, nachtmarkt: 6, warehouse: 7,
  theater: 8, uhrturm: 9, schlachthof: 10, gaskanaele: 11, sternwarte: 12, nordtor: 9,
  // Gefahrengebiete (bis es eigene Marker gibt)
  marsch: 3, katakomben: 2, pestgassen: 7, kraterwald: 12,
  ankerhof: 3, haus_morrow: 4, schleierhaus: 8, // Sekten: Platzhalter-Marker
  giesserei: 7, haus_vey: 1, resonanzkammer: 9, atelier: 4, ballsaal: 8, spiegelkabinett: 8, // Fall 5/6: Platzhalter
  treffen_waage: 6, treffen_kreide: 5, treffen_russ: 7, // Geheime Treffen: Platzhalter
  kontor_thorne: 4, waisenhaus: 1, traumkeller: 11, // Fall 7/8: Platzhalter
  wx_bahnhof: 3, wx_torfstich: 3, wx_salzmarkt: 4, wx_bojenhafen: 3, wx_oberstadt: 0, wx_pfahldorf: 2, wx_vergessmoor: 3, wx_leuchtturm: 12, wx_salzwatt: 3, wx_altstadt: 2, treffen_lichtlose: 7, treffen_salz: 6, treffen_namensgilde: 7, // Kapitel 2 (Wexmoor): Platzhalter
};
export const MAP_MARKERS_URL = `${BASE}ui/C_08_map_markers.png`;
/** Paket J: eigene Marker (gleiches Raster, 13 Spalten) für spätere Orte. */
export const J_MAP_MARKERS = Object.fromEntries(['giesserei', 'ballsaal', 'nordtor', 'marsch', 'katakomben', 'pestgassen', 'kraterwald',
  'ankerhof', 'haus_morrow', 'schleierhaus', 'rostkapelle', 'atelier', 'spiegelkabinett'].map((id, i) => [id, i]));
/** Stadtkarte: Bild des Ziels neben der Beschreibung (Paket J: Gießerei von außen). */
export const PLACE_PICTURES = { giesserei: `${BASE}props/J_giesserei_aussen.png` };
export const J_MAP_MARKERS_URL = `${BASE}ui/J_map_markers.png`;
/** Paket O: Treffen-Marker (3 Spalten; Zeile 2 hervorgehoben, Zeilen 3/4 = Treffen läuft, pulsierend). */
export const O_MAP_MARKERS = { treffen_waage: 0, treffen_kreide: 1, treffen_russ: 2 };
export const O_MAP_MARKERS_URL = `${BASE}ui/O_map_markers.png`;
/** Paket Q: Wexmoor-Marker (7 Spalten, Zeile 2 hervorgehoben). */
export const Q_MAP_MARKERS = Object.fromEntries(['wx_bahnhof', 'wx_torfstich', 'wx_salzmarkt', 'wx_bojenhafen', 'wx_oberstadt', 'wx_pfahldorf',
  'wx_leuchtturm'].map((id, i) => [id, i]));
export const Q_MAP_MARKERS_URL = `${BASE}ui/Q_wexmoor_marker.png`;
/** Batch X: Marker der Wexmoor-Zirkel (2 Spalten, Zeilen wie Paket O). */
export const X_MAP_MARKERS = { treffen_lichtlose: 0, treffen_salz: 1, treffen_namensgilde: 0 }; // Täfelchengilde: Marker der Lichtlosen, bis es einen eigenen gibt
export const X_MAP_MARKERS_URL = `${BASE}ui/X_map_markers_zirkel.png`;
/** Paket AN: Floßfriedhof, Lichtamt, Torfbrüche (3 Spalten, eine Zeile; Bild unten in der 16x32-Zelle). */
export const AN_MAP_MARKERS = { wx_flossfriedhof: 0, wx_lichtamt: 1, wx_torfbrueche: 2 };
export const AN_MAP_MARKERS_URL = `${BASE}ui/AN_marker.png`;
/** Kapitel 3 (AV): Dunscar-Marker, 6x3 Felder zu 16x16, je Ort ein Feld (ohne Hervorhebungszeile). */
export const DS_MAP_MARKERS = Object.fromEntries(['ds_endbahnhof', 'ds_schwellenring', 'ds_arbeiterbogen', 'ds_kalkmarkt', 'ds_bruchstufen', 'ds_signalhang',
  'ds_speisewagen', 'ds_runddepot', 'ds_pruefhaus', 'ds_teesaal', 'ds_lohnbuero', 'ds_nachtzug_wagen', 'ds_nachtzug_lok', 'ds_rangierwueste', 'ds_klopfbruch',
  'ds_rufschlucht', 'ds_letzter_bahnsteig', 'ds_unterschicht'].map((id, i) => [id, i]));
export const DS_MAP_MARKERS_URL = `${BASE}ui/ds_marker.png`;
/** Kapitel 5 (CI): Briarholt-Marker, 6x3 Felder zu 16x16 in Manifest-Reihenfolge; warme Zwillingskarten nutzen dasselbe Feld. */
export const BH_MAP_IDS = ['bh_kutschenhof', 'bh_kesselgrund', 'bh_winterpromenade', 'bh_glasgaerten', 'bh_stillenhaeuser', 'bh_wurzelkranz', 'bh_buegelraum', 'bh_kutschenhalle',
  'bh_pavillon', 'bh_verkaufshalle', 'bh_speisesaal', 'bh_aktenraum', 'bh_labor', 'bh_mutterhaus', 'bh_verteilanlage', 'bh_kaltes_palmhaus', 'bh_verlassene_waescherei', 'bh_wurzelkammer'];
export const BH_MAP_MARKERS = Object.fromEntries(BH_MAP_IDS.flatMap((id, i) => [[id, i], [`${id}__warm`, i]]));
export const BH_MAP_MARKERS_URL = `${BASE}ui/bh_marker.png`;
/** Marker eines Ortes: [Bild-URL, Feld, Spalten im Bild, live, Raster ohne Hervorhebungszeile {rows, row}]. */
export const mapMarkerOf = (map) => {
  if (O_MAP_MARKERS[map] !== undefined) return [O_MAP_MARKERS_URL, O_MAP_MARKERS[map], 3, true];
  if (X_MAP_MARKERS[map] !== undefined) return [X_MAP_MARKERS_URL, X_MAP_MARKERS[map], 2, true];
  if (Q_MAP_MARKERS[map] !== undefined) return [Q_MAP_MARKERS_URL, Q_MAP_MARKERS[map], 7];
  if (AN_MAP_MARKERS[map] !== undefined) return [AN_MAP_MARKERS_URL, AN_MAP_MARKERS[map], 3, false, { rows: 2, row: 1 }];
  if (CW_MAP_MARKERS[map] !== undefined) return [CW_MAP_MARKERS_URL, CW_MAP_MARKERS[map], 6, false, { rows: 3, row: Math.floor(CW_MAP_MARKERS[map] / 6) }];
  if (DS_MAP_MARKERS[map] !== undefined) return [DS_MAP_MARKERS_URL, DS_MAP_MARKERS[map], 6, false, { rows: 3, row: Math.floor(DS_MAP_MARKERS[map] / 6) }];
  if (BH_MAP_MARKERS[map] !== undefined) return [BH_MAP_MARKERS_URL, BH_MAP_MARKERS[map], 6, false, { rows: 3, row: Math.floor(BH_MAP_MARKERS[map] / 6) }];
  if (BE_MAP_MARKERS[map]) return BE_MAP_MARKERS[map];
  if (J_MAP_MARKERS[map] !== undefined) return [J_MAP_MARKERS_URL, J_MAP_MARKERS[map], 13];
  return [MAP_MARKERS_URL, MAP_MARKERS[map], 13];
};
/** Notizbuch: Status → Zelle in ui/C_07_log_markers.png. */
export const LOG_MARKERS = { suspected: 0, likely: 1, refuted: 2 };
export const LOG_MARKERS_URL = `${BASE}ui/C_07_log_markers.png`;
/** Quellen-Symbole im Notizbuch (core/sources.js): Typ → [Atlas-URL, Zelle, Spalten]. Figuren nutzen ihr Portrait. */
export const SOURCE_ICONS_URL = `${BASE}ui/14_06_information_source_icons.png`;
export const SOURCE_ICONS = {
  note: [SOURCE_ICONS_URL, 0, 7], npc: [SOURCE_ICONS_URL, 1, 7], object: [SOURCE_ICONS_URL, 2, 7],
  archive: [SOURCE_ICONS_URL, 5, 7], vision: [SOURCE_ICONS_URL, 6, 7], police: [LOG_MARKERS_URL, 3, 7],
};

/** Wetter pro Karte (Animation aus C_08_weather). "fog" verdichtet den vorhandenen Nebel statt Kacheln zu zeigen. */
/** Paket AE: Titelbild in Ebenen (je 480x270; Animationen als Streifen nebeneinander). */
export const TITLE_LAYERS = [
  { file: 'ebene_0_himmel' }, { file: 'ebene_1_mond', frames: 2, sec: 3.3 }, { file: 'ebene_2_ferne', depth: 1 },
  { file: 'ebene_3_nebel', drift: 70 }, { file: 'ebene_4_stadt', depth: 2 }, { file: 'ebene_4_fenster', frames: 4, sec: 10, depth: 2 },
  { file: 'ebene_5_vorne', depth: 3 }, { file: 'ebene_5_laterne', frames: 4, sec: 0.5, depth: 3, box: [64, 96, 16, 16] }, { file: 'ebene_6_regen', frames: 4, sec: 0.4 },
].map((l) => ({ ...l, url: `${BASE}ui/AE_titel/${l.file}.png` }));
export const MAP_WEATHER = { docks: 'rain_light', ebba: 'ash' };

// --- Paket A: animierte Sheets (Frames/Animationen in manifest-pfade.json) ----------

/** Texture-Key → [Pfad, Framebreite, Framehöhe]. */
export const ANIM_SHEETS = {
  cauldron_bubble: ['props/cauldron_bubble.png', 32, 32],
  cauldron_success: ['props/cauldron_success.png', 32, 32],
  cauldron_fail: ['props/cauldron_fail.png', 32, 32],
  player_drink: ['characters/A_player_drink.png', 16, 32],
  potion_ascend: ['fx/potion_ascend.png', 32, 32],
  aura_pfade: ['fx/aura_pfade.png', 24, 36],
  control_cracks: ['ui/A_11_control_cracks.png', 480, 270],
  // Paket C
  player_extras: ['characters/C_player_extras.png', 16, 32],
  creatures: ['fx/C_08_creatures.png', 16, 16],
  weather: ['fx/C_08_weather.png', 64, 64],
  // Paket H
  player_inspect: ['characters/H_player_untersuchen.png', 16, 32],
  risk_fx: ['fx/H_06_risiko.png', 480, 270],
  // Paket BP: Kontrollverlust (manifest-kontrollverlust.json)
  tentakel_fx: ['fx/BP_tentakel_kontrollverlust.png', 64, 64],
  player_korruption: ['characters/BP_player_korruption.png', 16, 32],
};

/** Manifest-Id, falls sie vom Texture-Key abweicht. */
const MANIFEST_IDS = { player_drink: 'A_player_drink', control_cracks: 'A_11_control_cracks', creatures: 'C_08_creatures', weather: 'C_08_weather',
  player_inspect: 'H_player_untersuchen', risk_fx: 'H_06_risiko', player_korruption: 'BP_player_korruption' };

/** Pfad-Embleme und Karten (public/sprites/pathways/). */
/** Neue Pfade (Paket AF) zeigen bis zur eigenen Grafik die eines Bestandspfads. */
export const pathwayArt = (pid) => PATHWAY_STANDIN[pid] ?? pid;
// Paket AG: Waage, Moor und Uhr haben eigene Embleme und Karten; pathwayArt bleibt für die Aura-Platzhalter
export const pathwayEmblemUrl = (pid, size = 32) => `${BASE}pathways/emblem_${pid}_${size}.png`;
export const pathwayCardUrl = (pid) => `${BASE}pathways/card_${pid}.png`;
export const COIN_URL = `${BASE}items/schilling.png`;
/**
 * Oberflächen-Bögen, die das UI als CSS-Variablen bekommt (--<name>: url(...)), siehe style.css.
 * Pakete: Grundpaket (07_*, 14_*), A (Laden, Verdauung, Münze), B (Kampf-HUD), C (Notizbuch), F (Ausrüstung),
 * G (Beute), I (Fraktionen, Routen).
 */
export const UI_SKINS = {
  coinspin: 'ui/coin_spin.png',
  title_bg: 'ui/07_06_title.png',
  dlgframe: 'ui/07_01_dialogue_frame.png',
  qframe: 'ui/14_05_quest_log_frame.png',
  bmenu: 'ui/battle_menu.png',
  shopframe: 'ui/A_10_shop.png',
  lootframe: 'ui/G_03_loot_ui.png',
  logstrips: 'ui/C_07_log_strips.png',
  routes: 'ui/I_reise_routen.png',
  notebook_bg: 'ui/07_02_notebook.png',
  korrframe: 'ui/BP_korruption_rahmen.png', // Paket BP: 9-slice, 16 px je Rand
};
/** Bögen für Symbole aus Regionen: Name → [Pfad, Breite, Höhe]. Regionen [x, y, w, h] in UI_REGIONS. */
export const UI_SHEETS = {
  hud: ['ui/battle_hud.png', 384, 144],
  bmenu: ['ui/battle_menu.png', 128, 96],
  bresult: ['ui/battle_result.png', 192, 144],
  dmg: ['ui/damage_font.png', 96, 50],
  shop: ['ui/A_10_shop.png', 160, 96],
  digest: ['ui/A_11_digestion.png', 96, 64],
  equip: ['ui/F_07_ausruestung.png', 192, 160],
  loot: ['ui/G_03_loot_ui.png', 256, 64],
  frak: ['ui/I_fraktionen.png', 256, 192],
  routes: ['ui/I_reise_routen.png', 64, 32],
  icons: ['ui/07_03_icons.png', 128, 32],
  vial: ['ui/07_04_sanity_vial.png', 96, 48],
  interact: ['ui/07_05_interaction.png', 64, 48],
  ranks: ['ui/14_01_rank_badges_small.png', 80, 16],
  repbar: ['ui/14_02_reputation_bar.png', 64, 40],
  reppop: ['ui/14_02_reputation_popups.png', 32, 16],
  locked: ['ui/14_03_locked_information.png', 64, 16],
  qstatus: ['ui/14_05_quest_status_icons.png', 112, 16],
  ladder: ['pathways/ladder_sockets.png', 96, 24],
  // Paket AE: Einstellungs-Symbole, Touch-Knöpfe, Zeitung
  aeset: ['ui/AE_einstellungen.png', 128, 32],
  aetouch: ['ui/AE_touch.png', 320, 64],
  aezeitung: ['ui/AE_zeitung.png', 320, 160],
  // Paket BP: Korruptionsabzeichen (Knoten, Puls 1–3, gereinigt, beiseitegelegt)
  bpkorr: ['ui/BP_korruption.png', 96, 16],
};
const cell = (i, size = 16, cols = 8) => [(i % cols) * size, Math.floor(i / cols) * size, size, size];
const steps = (prefix, x0, y, w, h, n, dx) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`${prefix}${i}`, [x0 + i * dx, y, w, h]]));
/** Paket AE: Namen der Einstellungs-Symbole (8 Spalten) und Touch-Knöpfe (10 Spalten, Reihe 2 gedrückt). */
const AE_SET = ['lautstaerke', 'stumm', 'musik', 'effekte', 'vollbild', 'fenster', 'steuerung', 'speichern', 'laden', 'zurueck', 'zahnrad', 'info', 'beenden', 'pause', 'weiter', 'handy'];
const AE_TOUCH = ['aktion', 'geistsicht', 'notizbuch', 'inventar', 'karte', 'angriff', 'ausweichen', 'parieren', 'faehigkeit', 'gegenstand'];
export const UI_REGIONS = {
  bpkorr: { corrupted: [0, 0, 16, 16], pulse1: [16, 0, 16, 16], pulse2: [32, 0, 16, 16], pulse3: [48, 0, 16, 16], cleansed: [64, 0, 16, 16], set_aside: [80, 0, 16, 16] },
  aeset: Object.fromEntries(AE_SET.map((n, i) => [n, cell(i)])),
  aetouch: Object.fromEntries(AE_TOUCH.flatMap((n, i) => [[n, [i * 32, 0, 32, 32]], [`${n}_down`, [i * 32, 32, 32, 32]]])),
  aezeitung: { kopf_kurier: [0, 48, 160, 24], kopf_bote: [160, 48, 160, 24], foto_polizeiwache: [0, 80, 64, 48], foto_menschenmenge: [64, 80, 64, 48], foto_hafen: [128, 80, 64, 48], foto_leuchtturm: [192, 80, 64, 48] },
  hud: { ...steps('hp', 0, 0, 64, 8, 6, 64), ...steps('nerves', 0, 16, 64, 8, 6, 64), ...steps('enemy', 0, 32, 64, 6, 6, 64),
    conc_empty: [0, 48, 8, 8], conc_full: [8, 48, 8, 8], conc_glow: [16, 48, 8, 8], occult: [32, 48, 16, 16],
    ...steps('target', 0, 64, 24, 24, 4, 24), your_turn: [0, 112, 160, 24], enemy_turn: [192, 112, 160, 24] },
  bmenu: { attack: [0, 64, 16, 16], attack_off: [0, 80, 16, 16], skill: [16, 64, 16, 16], skill_off: [16, 80, 16, 16],
    item: [32, 64, 16, 16], item_off: [32, 80, 16, 16], defend: [48, 64, 16, 16], defend_off: [48, 80, 16, 16],
    flee: [64, 64, 16, 16], flee_off: [64, 80, 16, 16], pointer: [80, 0, 8, 8] },
  bresult: { victory: [0, 0, 192, 40], defeat: [0, 48, 192, 40], loot: [64, 96, 16, 16] },
  shop: { price_tag: [64, 0, 16, 8], buy: [64, 24, 16, 16], sell: [80, 24, 16, 16], locked_pathway: [96, 24, 16, 16], locked_rank: [112, 24, 16, 16],
    only_once: [128, 24, 16, 16], slot: [0, 64, 20, 20], slot_hi: [24, 64, 20, 20], slot_sel: [48, 64, 20, 20], slot_sold: [72, 64, 20, 20], slot_locked: [96, 64, 20, 20] },
  digest: { ...Object.fromEntries([0, 20, 40, 60, 80, 100].map((p, i) => [`fill${p}`, [0, i * 10, 64, 10]])), warning: [72, 0, 16, 16], digested: [72, 24, 16, 16] },
  equip: { doll: [0, 0, 96, 128], slot: [112, 0, 20, 20], slot_hi: [144, 0, 20, 20], slot_filled: [112, 32, 20, 20],
    hat: [112, 64, 8, 8], coat: [128, 64, 8, 8], amulet: [144, 64, 8, 8], weapon: [160, 64, 8, 8] },
  loot: { take_all: [144, 0, 16, 16], full: [160, 0, 16, 16], ...steps('pickup', 0, 0, 16, 32, 6, 16) },
  frak: { ...Object.fromEntries([0, 1, 2, 3, 4, 5].flatMap((i) => [[`rostbrueder${i}`, [0, i * 8, 64, 8]], [`schleierschwestern${i}`, [64, i * 8, 64, 8]]])),
    hostile: [0, 64, 16, 16], suspicious: [16, 64, 16, 16], unknown: [32, 64, 16, 16], tolerated: [48, 64, 16, 16], infiltrated: [64, 64, 16, 16],
    dossier: [144, 0, 96, 128] },
  routes: { sicher: [0, 0, 8, 8], schnell: [32, 0, 8, 8], dest: [0, 16, 8, 16] },
  icons: Object.fromEntries(['notebook', 'lupe', 'sprechen', 'karte', 'schluessel', 'laterne', 'auge', 'herz', 'muenze', 'zahnrad', 'uhr', 'frage',
    'ausruf', 'spuren', 'brief', 'tuer'].map((n, i) => [n, cell(i)])),
  vial: steps('v', 0, 0, 16, 48, 6, 16),
  interact: { ...steps('lupe', 0, 0, 16, 16, 4, 16), ...steps('sprechen', 0, 16, 16, 16, 4, 16), ...steps('hand', 0, 32, 16, 16, 4, 16) },
  ranks: steps('r', 0, 0, 16, 16, 5, 16),
  reppop: { up: [0, 0, 16, 16], down: [16, 0, 16, 16] },
  locked: { schloss: [0, 0, 16, 16], offen: [16, 0, 16, 16], gespraech: [32, 0, 16, 16], akte: [48, 0, 16, 16] },
  qstatus: steps('q', 0, 0, 16, 16, 7, 16),
  ladder: { empty: [0, 0, 24, 24], unlocked: [24, 0, 24, 24], cracked: [48, 0, 24, 24], locked: [72, 0, 24, 24] },
  // Rufleiste: fünf Füllstände untereinander
  repbar: Object.fromEntries([3, 10, 18, 25, 33].map((y, i) => [`f${i}`, [0, y, 64, 7]])),
};
/** Schadensschrift (8x10, 12 Spalten): Zeile nach Art, Spalte nach Zeichen. */
export const DAMAGE_FONT = { glyphs: '0123456789+-', rows: { damage: 0, critical: 1, player_damage: 2, nerves: 3, healing: 4 } };
/** Geld-Symbol nach Betrag: einzelne Münze, Stapel, Haufen, Geldbeutel (Paket A). */
export const moneyIconUrl = (n) => `${BASE}items/${n >= 60 ? 'geldbeutel' : n >= 25 ? 'schilling_haufen' : n >= 10 ? 'schilling_stapel' : 'schilling'}.png`;

// --- Kampf (Paket 14b) ----------------------------------------------------------
// Animierte Seitenansichts-Sheets; Frames und Animationen stehen in manifest-14b.json.

/** Texture-Key → [Pfad, Framebreite, Framehöhe = Breite]. Frames/Animationen: manifest-14b.json bzw. manifest-kampf.json. */
export const BATTLE_SHEETS = {
  battle_player: ['battle/battle_player.png', 48],
  enemy_holt: ['battle/enemy_holt.png', 48],
  enemy_nebelhund: ['battle/enemy_nebelhund.png', 64],
  enemy_aschewaechter: ['battle/enemy_aschewaechter.png', 64],
  // Paket B (Kampf)
  battle_player_skills: ['battle/battle_player_skills.png', 48],
  battle_player_weapons: ['battle/battle_player_weapons.png', 48],
  enemy_chorfanatiker: ['battle/enemy_chorfanatiker.png', 48],
  enemy_rook: ['battle/enemy_rook.png', 48],
  enemy_silas: ['battle/enemy_silas.png', 48],
  enemy_schattenpuppe: ['battle/enemy_schattenpuppe.png', 48],
  enemy_grubenkaempfer: ['battle/enemy_grubenkaempfer.png', 48],
  enemy_maskenspieler: ['battle/enemy_maskenspieler.png', 48],
  enemy_schlachtergehilfe: ['battle/enemy_schlachtergehilfe.png', 48],
  enemy_aktenfresser: ['battle/enemy_aktenfresser.png', 64],
  enemy_spiegelschatten: ['battle/enemy_spiegelschatten.png', 64],
  enemy_kanalkroete: ['battle/enemy_kanalkroete.png', 64],
  enemy_uhrwerkwaechter: ['battle/enemy_uhrwerkwaechter.png', 64],
  enemy_gasgeist: ['battle/enemy_gasgeist.png', 64],
  hits: ['fx/hits.png', 48],
  // Paket F: Bosse und Fall-4-Gegner, Felix-Effekte (manifest-kampf2.json)
  enemy_felix: ['battle/enemy_felix.png', 48],
  enemy_miriam: ['battle/enemy_miriam.png', 96],
  enemy_chorschatten: ['battle/enemy_chorschatten.png', 48],
  fx_felix_stimme: ['fx/fx_felix_stimme.png', 48],
  fx_felix_phiole: ['fx/fx_felix_phiole.png', 32],
  fx_felix_chor: ['fx/fx_felix_chor.png', 64],
  fx_felix_befreit: ['fx/fx_felix_befreit.png', 64],
  transition_in: ['fx/transition_in.png', 480, 270],
  transition_out: ['fx/transition_out.png', 480, 270],
};

/** Fähigkeit → Effekt-Streifen (fx/fx_<id>.png) mit Framegröße. */
export const SKILL_FX = {
  lichtstoss: 48, funkenregen: 48, leuchtfeuer: 64, schwachstelle: 48, vorahnung: 48, schicksalsfaden: 64,
  trugbild: 48, verwirrung: 48, spiegelschritt: 48, klagelaut: 48, grabesstimme: 64, seelenzug: 64,
  wundsalbe: 32, giftphiole: 48, aetzwolke: 64, wuchtschlag: 48, eisenhaut: 48, klingenwirbel: 64,
  hinterhalt: 48, fallstrick: 48, schattenschritt: 48,
};
for (const [id, size] of Object.entries(SKILL_FX)) BATTLE_SHEETS[`fx_${id}`] = [`fx/fx_${id}.png`, size];

/** Effekte, die am Spieler statt am Gegner erscheinen. */
export const SELF_FX = ['vorahnung', 'trugbild', 'wundsalbe', 'eisenhaut', 'spiegelschritt', 'schattenschritt'];

/** Pfad → Zauberpose in battle_player_skills. */
export const PATHWAY_POSES = { laterne: 'lantern', faden: 'thread', maske: 'mask', echo: 'echo', kessel: 'cauldron', eisen: 'iron', schluessel: 'key' };
for (const [pid, standin] of Object.entries(PATHWAY_STANDIN)) PATHWAY_POSES[pid] = PATHWAY_POSES[standin];
/** Waffe → Schlaganimation in battle_player_weapons (sonst battle_player 'attack'). */
export const WEAPON_POSES = { schlagstock: 'truncheon', stockdegen: 'cane_sword' };

/** Begegnung → Kampf-Sheet. Fehlt eine, greift ENEMY_BATTLE_SHEETS über den Sprite-Key. */
export const ENCOUNTER_SHEETS = {
  sparring: 'enemy_holt', fog_hound: 'enemy_nebelhund', ash_warden: 'enemy_aschewaechter',
  archive_rats: 'enemy_aktenfresser', choir_zealots: 'enemy_chorfanatiker', rook_fight: 'enemy_rook',
  silas_fight: 'enemy_silas', mirror_shade: 'enemy_spiegelschatten', schattenpuppe: 'enemy_schattenpuppe',
  grubenkampf: 'enemy_grubenkaempfer',
  // Bonusgegner (Begegnungen kommen mit Fall 4)
  kanalkroete: 'enemy_kanalkroete', uhrwerkwaechter: 'enemy_uhrwerkwaechter', maskenspieler: 'enemy_maskenspieler',
  schlachtergehilfe: 'enemy_schlachtergehilfe', gasgeist: 'enemy_gasgeist',
  felix_fight: 'enemy_felix', miriam: 'enemy_miriam', chorschatten: 'enemy_chorschatten',
  // Sekten (factions.json): Platzhalter, bis die eigenen Sheets enemy_<id> kommen
  rost_schlaeger: 'enemy_grubenkaempfer', rost_streife: 'enemy_grubenkaempfer', rost_werfer: 'enemy_schlachtergehilfe',
  rost_schmied: 'enemy_schlachtergehilfe', rost_vater: 'enemy_grubenkaempfer',
  schleier_novizin: 'enemy_maskenspieler', schleier_messerin: 'enemy_maskenspieler', schleier_schatten: 'enemy_maskenspieler',
  schleier_seherin: 'enemy_chorfanatiker', schleier_mutter: 'enemy_chorfanatiker',
};

/** Gegner-Sprite aus encounters.json → Kampf-Sheet (Rückfall für Begegnungen ohne eigenen Eintrag). */
export const ENEMY_BATTLE_SHEETS = {
  'npc:holt': 'enemy_holt',
  hound: 'enemy_nebelhund',
  warden: 'enemy_aschewaechter',
  rats: 'enemy_aktenfresser',
  apparition: 'enemy_spiegelschatten',
  'npc:cultist': 'enemy_chorfanatiker',
  'npc:rook': 'enemy_rook',
  'npc:silas': 'enemy_silas',
};

/** Wesen vergehen nach der Niederlage; Menschen bleiben am Boden liegen. */
export const FADING_SHEETS = ['enemy_chorschatten', 'enemy_nebelhund', 'enemy_aschewaechter', 'enemy_aktenfresser', 'enemy_spiegelschatten',
  'enemy_schattenpuppe', 'enemy_kanalkroete', 'enemy_uhrwerkwaechter', 'enemy_gasgeist'];

/** Karte → Kampfhintergrund (480x270). Karten ohne Eintrag behalten die gezeichnete Bühne. */
export const BATTLE_BACKGROUNDS = {
  revier: 'bg_revier', ashgrove: 'bg_ashgrove', crypt: 'bg_krypta', ebba: 'bg_ebba', altmarkt: 'bg_altmarkt',
  docks: 'bg_hafen', warehouse: 'bg_lagerhaus', tavern: 'bg_taverne', nachtmarkt: 'bg_nachtmarkt',
  // Paket F: eigene Kulissen für die neuen Orte
  theater: 'bg_theater', uhrturm: 'bg_uhrturm', sternwarte: 'bg_sternwarte', schlachthof: 'bg_schlachthof', gaskanaele: 'bg_gaskanaele',
  nordtor: 'bg_nordtor', haus_morrow: 'bg_villa', schleierhaus: 'bg_villa', pestgassen: 'bg_elend', rostkapelle: 'bg_gaswerk',
  // Gefahrengebiete ohne eigene Kulisse
  marsch: 'bg_ashgrove', katakomben: 'bg_krypta', kraterwald: 'bg_sternwarte', ankerhof: 'bg_hafen',
};
/** Begegnung → eigener Hintergrund (vor dem der Karte). */
export const ENCOUNTER_BACKGROUNDS = {
  archive_rats: 'bg_archiv', grubenkampf: 'bg_grube', mirror_shade: 'bg_spiegel',
  felix_fight: 'bg_glockenstube', miriam: 'bg_glockenstube', gasgeist: 'bg_gaswerk',
  bronzeengel: 'bg_glockenstube', glockenecho: 'bg_glockenstube', silberbad_schleim: 'bg_spiegel', dreizehnter_gast: 'bg_spiegel',
  ertrunkener: 'bg_archiv', pfandeintreiber: 'bg_ashgrove', traumfaden: 'bg_gaswerk', miss_wren: 'bg_gaswerk',
  sternlicht: 'bg_sternwarte', starling_fight: 'bg_sternwarte', starling_stern: 'bg_sternwarte',
  // Begegnungen auf dem schnellen Reiseweg (travel.json)
  reise_ratten: 'bg_hafen', reise_strassenraeuber: 'bg_ashgrove', reise_nebelhund: 'bg_ashgrove', reise_irrlicht: 'bg_hafen', reise_kultist: 'bg_altmarkt',
};

/**
 * Gefahrengebiete: Lauf-Sheets der Gegner auf der Karte (characters/G_ow_<id>.png, 4 Reihen unten/links/rechts/oben
 * x 4 Frames). Begegnung → [Pfad, Framebreite, Framehöhe]. Solange ein Eintrag fehlt, läuft das Kampf-Sheet
 * verkleinert und getönt als Platzhalter über die Karte.
 */
export const OVERWORLD_SHEETS = {};
// Paket F: zehn Kartengegner (characters/F_ow_<id>.png). Sie gelten für jede Begegnung, deren Kampf-Sheet passt.
export const F_OVERWORLD = { nebelhund: 32, aktenfresser: 32, kanalkroete: 32, gasgeist: 16, uhrwerkwaechter: 16, maskenspieler: 16,
  schlachtergehilfe: 16, chorfanatiker: 16, spiegelschatten: 16, chorschatten: 16 };
for (const [id, w] of Object.entries(F_OVERWORLD)) OVERWORLD_SHEETS[id] = [`characters/F_ow_${id}.png`, w, 32];
/** Kartengegner-Sheet für eine Begegnung: eigener Eintrag, sonst über das Kampf-Sheet (enemy_<id> → ow_<id>). */
export const overworldIdFor = (encId, enc) => {
  if (OVERWORLD_SHEETS[encId]) return encId;
  const sheet = enc?.sheet ?? ENCOUNTER_SHEETS[encId];
  const id = sheet?.replace(/^enemy_/, '');
  return id && OVERWORLD_SHEETS[id] ? id : null;
};
/** Beutebehälter am Boden (props/G_loot_<behaelter>.png, 16x16, Frame 0 zu, Frame 1 offen). Fehlt einer, gibt es ein gezeichnetes Symbol. */
export const LOOT_SHEETS = {};

/** Fähigkeit → Zelle in ui/skill_icons.png (7 Pfadspalten x Sequenz 9/8/7). */
export const SKILL_ICONS = {
  lichtstoss: 0, schwachstelle: 1, trugbild: 2, klagelaut: 3, wundsalbe: 4, wuchtschlag: 5, hinterhalt: 6,
  funkenregen: 7, vorahnung: 8, verwirrung: 9, grabesstimme: 10, giftphiole: 11, eisenhaut: 12, fallstrick: 13,
  leuchtfeuer: 14, schicksalsfaden: 15, spiegelschritt: 16, seelenzug: 17, aetzwolke: 18, klingenwirbel: 19, schattenschritt: 20,
};
/** Zustand → Zelle in ui/status_icons.png. */
export const STATUS_ICONS = {
  brennen: 0, gift: 1, betaeubt: 2, starre: 3, schwachstelle: 4, vorahnung: 5, trugbild: 6, verwirrt: 7, eisenhaut: 8, zerfressen: 9, schatten: 10, blutung: 11,
};
export const SKILL_ICONS_URL = `${BASE}ui/skill_icons.png`;
export const STATUS_ICONS_URL = `${BASE}ui/status_icons.png`;

// --- Paket D (Stadt) und E (Fälle) -----------------------------------------------
// Benannte Regionen stehen in manifest-stadt.json bzw. manifest-faelle.json. Jede Region wird
// zur Texture `<prefix>_<region>`, jede Animation zur animierten Texture `<prefix>_<animation>`
// (Deko spielt sie automatisch ab), z. B. d_strassenmoebel_police_box oder e_felix_versteck_shimmer.

/** Prefix → [Manifest-Key, Manifest-Id]. Das Sheet wird als SHEETS[prefix] geladen. */
export const REGION_SHEETS = {
  d_theater: ['manifestStadt', 'D_05_theater'], d_uhrturm: ['manifestStadt', 'D_05_uhrturm'],
  d_nordtor: ['manifestStadt', 'D_05_nordtor'], d_gaswerk: ['manifestStadt', 'D_05_gaswerk'],
  d_sternwarte: ['manifestStadt', 'D_05_sternwarte'], d_villen: ['manifestStadt', 'D_05_villen'],
  d_elend: ['manifestStadt', 'D_05_elend'],
  d_theater_props: ['manifestStadt', 'D_05_theater_props'], d_uhrturm_props: ['manifestStadt', 'D_05_uhrturm_props'],
  d_nordtor_props: ['manifestStadt', 'D_05_nordtor_props'], d_gaswerk_props: ['manifestStadt', 'D_05_gaswerk_props'],
  d_sternwarte_props: ['manifestStadt', 'D_05_sternwarte_props'], d_villen_props: ['manifestStadt', 'D_05_villen_props'],
  d_elend_props: ['manifestStadt', 'D_05_elend_props'], d_bruecken: ['manifestStadt', 'D_06_bruecken'],
  d_strassenmoebel: ['manifestStadt', 'D_07_strassenmoebel'], d_wohnung: ['manifestStadt', 'D_08_wohnung_props'],
  e_theater: ['manifestFaelle', 'theater'], e_felix_versteck: ['manifestFaelle', 'felix_versteck'],
  e_quest: ['manifestFaelle', 'quest_ui'],
  h_fundbuero: ['manifestJournal', 'H_07_fundbuero'],
  i_rost: ['manifestReise', 'I_rostbrueder_versteck'], i_schleier: ['manifestReise', 'I_schleierschwestern_versteck'],
  i_orte: ['manifestReise', 'I_ankerhof_haus_morrow'],
  g_marsch_props: ['manifestWildnis', 'props_marsch'], g_pestgassen_props: ['manifestWildnis', 'props_pestgassen'],
  g_katakomben_props: ['manifestWildnis', 'props_katakomben'], g_kraterwald_props: ['manifestWildnis', 'props_kraterwald'],
  g_rast: ['manifestWildnis', 'rest'], g_gefahr: ['manifestWildnis', 'danger'], g_monster_fx: ['manifestWildnis', 'monster_fx'],
  g_beute: ['manifestWildnis', 'loot_extras'], g_selten: ['manifestWildnis', 'rarity'],
  l_marker: ['manifestGegner3', 'L_marker'],
  j_giesserei_props: ['manifestFall5', 'J_giesserei_props'], j_haus_vey_props: ['manifestFall5', 'J_haus_vey_props'],
  j_resonanzkammer_props: ['manifestFall5', 'J_resonanzkammer_props'],
  k_atelier_props: ['manifestFall6', 'props_atelier'], k_ballsaal_props: ['manifestFall6', 'props_ballsaal'],
  k_spiegelkabinett_props: ['manifestFall6', 'props_spiegelkabinett'], k_jahrmarkt: ['manifestFall6', 'props_jahrmarkt_aussen'],
  k_schatten: ['manifestFall6', 'shadows'],
  m_kontor_props: ['manifestFall78', 'M_kontor_props'], m_waisenhaus_props: ['manifestFall78', 'M_waisenhaus_props'],
  m_traumkeller_props: ['manifestFall78', 'M_traumkeller_props'],
  o_waage_props: ['manifestTreffen', 'waage_props'], o_kreide_props: ['manifestTreffen', 'kreide_props'],
  o_russ_props: ['manifestTreffen', 'russ_props'], o_zirkel: ['manifestTreffen', 'zirkel'],
  q_kajuete_props: ['manifestWexmoor', 'kajuete_props'],
  r_fassaden: ['manifestWexmoor2', 'R_wexmoor_fassaden'], r_bahnhof: ['manifestWexmoor2', 'R_bahnhof_props'],
  r_torfstich: ['manifestWexmoor2', 'R_torfstich_props'], r_salzmarkt: ['manifestWexmoor2', 'R_salzmarkt_props'],
  r_bojenhafen: ['manifestWexmoor2', 'R_bojenhafen_props'], r_oberstadt: ['manifestWexmoor2', 'R_oberstadt_props'],
  r_pfahldorf: ['manifestWexmoor2', 'R_pfahldorf_props'], r_innen_props: ['manifestWexmoor2', 'R_innen_props'],
  r_vergessmoor_props: ['manifestWexmoor2', 'R_vergessmoor_props'], r_leuchtturm_props: ['manifestWexmoor2', 'R_leuchtturm_props'],
  v_glocke_props: ['manifestWexmoor4', 'V_glocke_props'],
  w_altstadt_props: ['manifestWexmoor5', 'props'],
  s_salzwatt_props: ['manifestWexmoor3', 'salzwatt_props'], s_lichtlose_props: ['manifestWexmoor3', 'lichtlose_props'], s_salz_props: ['manifestWexmoor3', 'salz_props'], q_lichtkegel: ['manifestWexmoor', 'lichtkegel'],
};
/** Animationen aus benannten Regionen, die das Manifest nicht selbst mitbringt (Prefix → Name → Regionen). */
export const REGION_ANIMS = {
  o_waage_props: { scale: [['scale_0', 'scale_1', 'scale_2', 'scale_3', 'scale_2', 'scale_1'], 3],
    candles: [['candles_0', 'candles_1', 'candles_2', 'candles_3', 'candles_4', 'candles_5'], 6] },
  o_kreide_props: { lamp: [['lamp_0', 'lamp_1'], 3], dust: [['dust_0', 'dust_1', 'dust_2', 'dust_3'], 4] },
  q_kajuete_props: { stove: [['stove_1', 'stove_2', 'stove_3'], 6], lamp: [['lamp_1', 'lamp_2', 'lamp_3', 'lamp_4'], 4] },
  // Lichtkegel der Grauspäher: Ursprung links mittig, normal 96x48, im Verdacht 96x56
  q_lichtkegel: {
    normal: [[0, 96, 192, 288].map((x) => ({ x, y: 4, w: 96, h: 48 })), 8],
    suspicious: [[0, 96, 192, 288].map((x) => ({ x, y: 56, w: 96, h: 56 })), 8],
  },
  o_russ_props: { stove: [['stove_0', 'stove_1'], 4], lantern: [['lantern_0', 'lantern_1'], 3], cage: [['cage_0', 'cage_1'], 2] },
};
/** Dateien der Region-Sheets (die Manifeste kommen erst nach dem Laden der Bilder an). */
const REGION_FILES = {
  d_theater: 'tilesets/D_05_theater.png', d_uhrturm: 'tilesets/D_05_uhrturm.png', d_nordtor: 'tilesets/D_05_nordtor.png',
  d_gaswerk: 'tilesets/D_05_gaswerk.png', d_sternwarte: 'tilesets/D_05_sternwarte.png', d_villen: 'tilesets/D_05_villen.png',
  d_elend: 'tilesets/D_05_elend.png', d_bruecken: 'tilesets/D_06_bruecken.png',
  d_strassenmoebel: 'props/D_07_strassenmoebel.png', d_wohnung: 'props/D_08_wohnung_props.png',
  e_theater: 'props/E_01_theater_buehne.png', e_felix_versteck: 'props/E_01_felix_versteck.png', e_quest: 'ui/E_04_quest_ui.png',
  h_fundbuero: 'props/H_07_fundbuero.png',
  i_rost: 'tilesets/I_rostbrueder_versteck.png', i_schleier: 'tilesets/I_schleierschwestern_versteck.png', i_orte: 'props/I_ankerhof_haus_morrow.png',
  g_rast: 'props/G_06_rast.png', g_gefahr: 'ui/G_01_gefahr.png', g_monster_fx: 'fx/G_02_monster_fx.png',
  g_beute: 'props/G_03_loot_extras.png', g_selten: 'ui/G_03_seltenheit.png',
  l_marker: 'ui/L_marker.png',
  j_giesserei_props: 'props/J_giesserei_props.png', j_haus_vey_props: 'props/J_haus_vey_props.png',
  j_resonanzkammer_props: 'props/J_resonanzkammer_props.png',
  k_atelier_props: 'props/K_atelier_props.png', k_ballsaal_props: 'props/K_ballsaal_props.png',
  k_spiegelkabinett_props: 'props/K_spiegelkabinett_props.png', k_jahrmarkt: 'props/K_jahrmarkt_aussen.png', k_schatten: 'fx/K_schatten.png',
  o_waage_props: 'props/O_waage_props.png', o_kreide_props: 'props/O_kreide_props.png', o_russ_props: 'props/O_russ_props.png',
  o_zirkel: 'ui/O_zirkel.png',
  q_kajuete_props: 'props/Q_kajuete_props.png',
  r_fassaden: 'props/R_wexmoor_fassaden.png', r_bahnhof: 'props/R_bahnhof_props.png', r_torfstich: 'props/R_torfstich_props.png',
  r_salzmarkt: 'props/R_salzmarkt_props.png', r_bojenhafen: 'props/R_bojenhafen_props.png', r_oberstadt: 'props/R_oberstadt_props.png',
  r_pfahldorf: 'props/R_pfahldorf_props.png', r_innen_props: 'props/R_innen_props.png', r_vergessmoor_props: 'props/R_vergessmoor_props.png',
  r_leuchtturm_props: 'props/R_leuchtturm_props.png', q_lichtkegel: 'fx/Q_lichtkegel.png',
  v_glocke_props: 'props/V_glocke_props.png',
  w_altstadt_props: 'props/W_altstadt_props.png',
  s_salzwatt_props: 'props/S_salzwatt_props.png', s_lichtlose_props: 'props/S_lichtlose_props.png', s_salz_props: 'props/S_salz_props.png',
  m_kontor_props: 'props/M_kontor_props.png', m_waisenhaus_props: 'props/M_waisenhaus_props.png', m_traumkeller_props: 'props/M_traumkeller_props.png',
};
for (const z of ['marsch', 'pestgassen', 'katakomben', 'kraterwald']) REGION_FILES[`g_${z}_props`] = `props/G_01_${z}_props.png`;
for (const id of ['theater', 'uhrturm', 'nordtor', 'gaswerk', 'sternwarte', 'villen', 'elend']) REGION_FILES[`d_${id}_props`] = `props/D_05_${id}_props.png`;
Object.assign(SHEETS, REGION_FILES);

/** Ganze Bilder als Deko: Key → Pfad. Läden (48x48) ersetzen ein Erdgeschoss, die Krähenbrücke ist 96x48. */
export const WHOLE_PROPS = { d_kraehenbruecke: 'props/D_06_kraehenbruecke.png' };
export const SHOPS = ['apotheke', 'baeckerei', 'schneider', 'buchladen', 'uhrmacher', 'pfandhaus', 'kneipe', 'bestatter', 'zeitung', 'fotograf'];
for (const id of SHOPS) WHOLE_PROPS[`d_shop_${id}`] = `tilesets/D_04_${id}.png`;
Object.assign(SHEETS, WHOLE_PROPS);

/** Einzelne 16x16-Zellen aus Icon-Streifen: Prefix → [Sheet-Pfad, Manifest-Id]. Key `<prefix>_<icon>`. */
export const ICON_STRIPS = {
  e_spur: ['props/E_07_spuren.png', 'spuren'],
  e_hinweis: ['props/E_01_fall4_hinweise.png', 'fall4_hinweise'],
};
for (const [prefix, [path]] of Object.entries(ICON_STRIPS)) SHEETS[prefix] = path;

/** Spritesheets mit festen Frames: Key → [Pfad, Breite, Höhe, Manifest-Id]. Animationen aus manifest-faelle.json. */
export const CASE_SHEETS = {
  e_turmuhr: ['props/E_01_turmuhr.png', 48, 48, 'turmuhr'], // Frame 0: stehengeblieben, 1: okkult beleuchtet
  stimme_raub: ['fx/E_01_stimme_raub.png', 32, 32, 'stimme_raub'],
  phiole_bricht: ['fx/E_01_phiole_bricht.png', 32, 32, 'phiole_bricht'],
  glocke_stimme: ['fx/E_01_glocke_stimme.png', 48, 48, 'glocke_stimme'],
};

/** Hausfassaden aus D_03 (gleiches 8x6-Raster für alle Materialien). Map-Feld "facade": putz|holz|stein|slum|fabrik. */
export const FACADES = ['putz', 'holz', 'stein', 'slum', 'fabrik'];
/** Paket BT: Wexmoor-Fassaden (facades/wexmoor_v2_<name>.png, gleiches 8x6-Raster); sechs davon mit beleuchteter Nachtvariante. */
export const WX_FACADES = ['pfahlhaus', 'fischerhaus', 'seilerhaus', 'schilfhuette', 'bojenwart', 'torfschuppen', 'oberstadt', 'ratshaus', 'apotheke',
  'salzspeicher', 'fischhalle', 'wachhaus', 'akademie', 'lucent', 'glocke', 'altstadt', 'leuchtturm', 'bahnhof'].map((n) => `wx_${n}`);
export const WX_FACADE_NIGHT = ['pfahlhaus', 'oberstadt', 'salzspeicher', 'wachhaus', 'akademie', 'lucent'].map((n) => `wx_${n}`);
const ALL_FACADES = [...FACADES, ...WX_FACADES, ...WX_FACADE_NIGHT.map((m) => `${m}_nacht`)];
/** Fassade bei Nacht: beleuchtete Variante, falls es eine gibt. */
export const facadeAtNight = (m) => (WX_FACADE_NIGHT.includes(m) ? `${m}_nacht` : m);
/**
 * Paket BT: mehrere Fassaden auf einer Karte. Zusammenhängende Gebäudeflächen (#, W, D, R) werden gesucht;
 * eine Häuserzeile mit mehreren Türen wird zwischen den Türen in einzelne Häuser geteilt, sonst in Bänder von
 * zehn Feldern. Jedes Haus bekommt der Reihe nach eine Fassade aus `facades`; Rückgabe "x,y" → Fassade.
 */
export function buildingFacades(rows, facades) {
  const out = new Map();
  if (!facades?.length) return out;
  const isHouse = (x, y) => '#WDR'.includes(rows[y]?.[x] ?? ' ');
  const seen = new Set();
  let n = 0;
  rows.forEach((row, y0) => [...row].forEach((_, x0) => {
    if (!isHouse(x0, y0) || seen.has(`${x0},${y0}`)) return;
    const cells = [];
    const doors = new Set();
    const q = [[x0, y0]];
    while (q.length) {
      const [x, y] = q.pop();
      const key = `${x},${y}`;
      if (seen.has(key) || !isHouse(x, y)) continue;
      seen.add(key);
      cells.push([x, y]);
      if (rows[y][x] === 'D') doors.add(x);
      q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    const minX = Math.min(...cells.map(([x]) => x));
    const d = [...doors].sort((a, b) => a - b);
    // Grenzen zwischen den Häusern: Mitte zwischen zwei Türen, sonst alle zehn Felder
    const bounds = d.length >= 2 ? d.slice(1).map((x, i) => Math.ceil((d[i] + x) / 2)) : [];
    const segment = (x) => (bounds.length ? bounds.filter((b) => x >= b).length : Math.floor((x - minX) / 10));
    const first = n;
    let used = 0;
    for (const [x, y] of cells) { const sgm = segment(x); used = Math.max(used, sgm + 1); out.set(`${x},${y}`, facades[(first + sgm) % facades.length]); }
    n += used;
  }));
  return out;
}

const FACADE_CELLS = { wall: [0, 0, 0, 0, 1, 2], window: [8, 8, 12, 12, 9, 10, 13], door: [16, 17], eave: [24, 25], roof: [32, 33, 34, 35] };
const FACADE_FALLBACK = { wall: 'brick', window: 'window', door: 'door', eave: 'roofEaveBottom', roof: 'roofEaveTop' };
/** [{ key, sheet, cell, group, fallback }] – Tile-Key `fac_<material>_<gruppe>_<n>`. */
/** Abweichungen je Material: In Elendsvierteln und Fabriken brennt kaum Licht, viele Fenster sind vernagelt. */
const FACADE_OVERRIDES = { slum: { window: [9, 11, 11, 13, 9, 15, 8] }, fabrik: { window: [9, 13, 9, 8, 12] } };
const facadeCells = (m, group) => FACADE_OVERRIDES[m]?.[group] ?? FACADE_CELLS[group];
export const FACADE_TILE_LIST = ALL_FACADES.flatMap((m) => Object.keys(FACADE_CELLS).flatMap((group) => facadeCells(m, group).map((cell, n) => ({
  key: `fac_${m}_${group}_${n}`, sheet: `fac_${m}`, cell, group, fallback: FACADE_FALLBACK[group],
}))));
/** Tile-Keys einer Fassadengruppe. */
export const facadeKeys = (m, group) => facadeCells(m, group).map((_, n) => `fac_${m}_${group}_${n}`);
for (const m of FACADES) SHEETS[`fac_${m}`] = `tilesets/D_03_fassade_${m}.png`;
for (const m of ALL_FACADES) if (m.startsWith('wx_')) SHEETS[`fac_${m}`] = `facades/wexmoor_v2_${m.slice(3)}.png`;
for (const t of FACADE_TILE_LIST) TILE_CELLS[t.key] = [t.sheet, t.cell];

/** Paket E: 16 Auftragsfiguren mit Lauf-Sheet und Portrait (gameId aus manifest-faelle.json). */
export const E_CHARACTERS = ['waescherin', 'kaminkehrer', 'kutscher', 'fotografin', 'schwindler', 'wahrsagerin', 'matrose',
  'gouvernante', 'erbe', 'rattenfaenger', 'marktfrau', 'student', 'sufragette', 'nachtwaechter', 'kuenstler', 'kind_streuner'];
for (const id of E_CHARACTERS) {
  SHEETS[`e_${id}`] = `characters/E_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `e_${id}`;
  PORTRAITS[id] = `E_${id}_emotions.png`;
}

/**
 * Zusätzliche Portrait-Streifen für Fall 4: Figur → [Datei, { Stimmung → Spalte }].
 * Im Dialog wählt `"mood"` eines Knotens diese Streifen, sonst gilt PORTRAIT_MOODS.
 */
export const PORTRAIT_SPECIAL = {
  diva: ['E_diva_stimme.png', { stumm: 0, panik: 1, traenen: 2, strahlend: 3 }],
  souffleur: ['E_souffleur_enthuellung.png', { schuechtern: 0, ertappt: 1, entrueckt: 2, gebrochen: 3 }],
  maskenmacher: ['E_maskenmacher_maske.png', { maske: 0, ohne_maske: 1, beleidigt: 2, dankbar: 3 }],
  turmwaechter: ['E_turmwaechter_hoeren.png', { watte: 0, erschrocken: 1, erleichtert: 2, lauschen: 3 }],
};
/**
 * Weitere Sonder-Streifen aus Paket C (manifest-welt.json), zusätzlich zu PORTRAIT_SPECIAL:
 * Hester in Trance, Rook ohne Maske, Miriam mit leuchtenden Augen.
 */
export const PORTRAIT_EXTRA = {
  hester: ['C_hester_states.png', { trance: 0, verwirrt: 1, erleichtert: 2, zaghaft: 3 }],
  rook: ['C_rook_reveal.png', { maske: 0, laecheln_bricht: 1, kalt: 2, leuchtend: 3 }],
  miriam: ['C_miriam_special.png', { gelassen: 0, amuesiert: 1, verachtung: 2, leuchtend: 3 }],
};
/** Portrait-URL und Spalte für Figur + Stimmung (oder null). */
export function portraitFor(id, mood) {
  // Paket AK: wütend/traurig/nachdenklich/entschlossen (englisch) vor den Sonder-Streifen, deutsche Namen danach
  if (AK_FIGURES.has(id) && AK_MOODS_EN[mood] !== undefined) return { url: akUrl(id), col: AK_MOODS_EN[mood] };
  for (const special of [PORTRAIT_SPECIAL[id], PORTRAIT_EXTRA[id]]) {
    if (special && special[1][mood] !== undefined) return { url: `${BASE}portraits/${special[0]}`, col: special[1][mood] };
  }
  if (AK_FIGURES.has(id) && AK_MOODS_DE[mood] !== undefined) return { url: akUrl(id), col: AK_MOODS_DE[mood] };
  const url = portraitUrl(id);
  return url ? { url, col: PORTRAIT_MOODS[mood] ?? 0 } : null;
}

/** Schlussbilder (480x270): Ende → Bild; sonst das Bild des Falls. */
export const ENDING_IMAGES = { c4_perfect: 'E_ende_fall4_gut', c4_good: 'E_ende_fall4_halb', c4_early: 'E_ende_fall4_schlecht', c4_mask: 'E_ende_fall4_haken' };
export const CASE_ENDING_IMAGES = { case_01: 'E_ende_fall1', case_02: 'E_ende_fall2', case_03: 'E_ende_fall3' };
/** Paket CI: Schlussbilder von Kapitel 5 liegen als 240x135 unter ui/scenes/ (Variante mit Turm bei k2_end_lichtmeister). */
export const ENDING_SCENE_IMAGES = { cwa_widerspruch: 'cw_ende_widerspruch', cwa_amtsinhaber: 'cw_ende_amtsinhaber', cwa_buecher: 'cw_ende_buecher', cwa_ordnung: 'cw_ende_ordnung', // CE2
  bha_wahl: 'bh_ende_wahl', bha_winter: 'bh_ende_winter', bha_verwahrt: 'bh_ende_verwahrt', bha_schmerzlos: 'bh_ende_schmerzlos', bha_schmerzlos_lichtmeister: 'bh_ende_schmerzlos_lichtmeister' };
export const endingImageUrl = (id, caseId) => {
  if (ENDING_SCENE_IMAGES[id]) return `${BASE}ui/scenes/${ENDING_SCENE_IMAGES[id]}.png`;
  const f = ENDING_IMAGES[id] ?? CASE_ENDING_IMAGES[caseId];
  return f ? `${BASE}ui/endings/${f}.png` : null;
};
/** Fallakten (128x96) als Kopf im Notizbuch. */
export const CASE_FILES = { case_01: 'E_akte_fall1', case_02: 'E_akte_fall2', case_03: 'E_akte_fall3', case_04: 'E_akte_fall4', case_05: 'J_akte_fall5', side: 'E_akte_altmarkt' };
export const caseFileUrl = (caseId) => `${BASE}ui/cases/${CASE_FILES[caseId] ?? 'E_akte_leer'}.png`;
/** Zwischensequenzbilder (240x135): Dialogknoten und Lesetexte mit `"scene": "<id>"`. */
export const SCENES = ['turmuhr', 'brief', 'rook', 'chor', 'marlowe', 'felix'];
/** Paket I: Bilder zu Ereignissen auf dem schnellen Reiseweg (travel.json, Ereignis-Id = Bild-Id). */
export const TRAVEL_SCENES = ['reise_nebel', 'reise_ratten', 'reise_irrlicht', 'reise_kultpatrouille', 'reise_ueberfall', 'reise_fund', 'reise_taschendieb'];
/** Paket J: Bilder zu Fall 5. */
export const J_SCENES = ['giessgrube', 'kinderzimmer', 'oda', 'lilian', 'glocke_sinkt', 'stimmen_frei'];
/** Paket K: Bilder zu Fall 6. */
export const K_SCENES = ['abzuege', 'schattenlos', 'maskenball', 'dunkelkammer', 'spiegel', 'schatten_frei'];
/** Paket M: Bilder zu Fall 7 und 8. */
export const M_SCENES = ['kanal', 'finch', 'schlafsaal', 'molly', 'webstuhl', 'morgen'];
/** Paket AE: Kapitelkarten (480x270) für Spielbeginn, Kapitelwechsel und Kapitelende. */
export const CHAPTER_CARDS = ['kapitel1_karte', 'kapitel2_karte', 'kapitel3_karte', 'kapitel4_karte', 'kapitel5_karte', 'kapitel_ende'];
/** Kontrollverlust: Tentakel-Bild (240x135, Platzhalter bis Codex-Paket BP liefert). */
export const FX_SCENES = ['kontrollverlust'];
/** Paket CI: Ankunft in Briarholt (480x270), Trockenraum und Pfirsich (240x135) unter ui/scenes/<id>.png. */
export const BH_SCENES = ['bh_ankunft', 'bh_trockenraum', 'bh_pfirsich'];
/** Paket CE2: Szenen von Kapitel 4 (Aufzugsfahrt 480x270, zwei Teller 480x270, Sortierkabine 240x135). */
export const CW_SCENES = ['cw_aufzug', 'cw_zwei_teller', 'cw_sortierkabine'];
BH_SCENES.push(...CW_SCENES);
export const sceneUrl = (id) => (id?.startsWith('fest_') ? `${BASE}sequences/${id}.png` : CHAPTER_CARDS.includes(id) || FX_SCENES.includes(id) || BH_SCENES.includes(id) ? `${BASE}ui/scenes/${id}.png` : SCENES.includes(id) ? `${BASE}ui/scenes/E_szene_${id}.png`
  : TRAVEL_SCENES.includes(id) ? `${BASE}ui/scenes/I_${id}.png`
    : J_SCENES.includes(id) ? `${BASE}ui/scenes/J_szene_${id}.png`
      : K_SCENES.includes(id) ? `${BASE}ui/scenes/K_szene_${id}.png`
        : M_SCENES.includes(id) ? `${BASE}ui/scenes/M_szene_${id}.png`
          : R_SCENES.includes(id) ? `${BASE}ui/scenes/R_szene_${id.slice(2)}.png` : null);
/** Paket R: Kapitel 2 (Ids mit Präfix r_, damit sie nicht mit älteren kollidieren). */
export const R_SCENES = ['r_ankunft', 'r_lichter', 'r_lucent', 'r_schrein', 'r_brandt', 'r_ueberfahrt'];

/** Große Stadtkarte mit Nebel über unbesuchten Gegenden. */
export const CITY_MAP_URL = `${BASE}ui/D_09_stadtkarte_gross.png`;
export const CITY_FOG_URL = `${BASE}ui/D_09_stadtkarte_nebel.png`;
/** Kartennadeln (8x8) in ui/E_04_quest_ui.png. */
export const QUEST_UI_URL = `${BASE}ui/E_04_quest_ui.png`;
export const QUEST_PINS = { amber: [64, 144], lilac: [80, 144], turquoise: [96, 144] };
/** Banner (160x32) für angenommene und erledigte Aufträge. */
export const QUEST_BANNERS = { active: [0, 64], done: [0, 96] };

/** Legt Region-, Icon- und Fall-Texturen an (nach dem Laden der Manifeste). */
function createRegionTextures(scene) {
  const cut = (key, img, rects) => {
    if (scene.textures.exists(key)) return;
    const { w, h } = rects[0];
    const c = document.createElement('canvas');
    c.width = w * rects.length;
    c.height = h;
    const ctx = c.getContext('2d');
    rects.forEach((r, i) => ctx.drawImage(img, r.x, r.y, r.w, r.h, i * w, 0, w, h));
    const tex = scene.textures.addCanvas(key, c);
    if (rects.length > 1) {
      rects.forEach((_, i) => tex.add(i, 0, i * w, 0, w, h));
    }
    return tex;
  };
  const rect = (r) => (Array.isArray(r) ? { x: r[0], y: r[1], w: r[2], h: r[3] } : { x: r.x, y: r.y, w: r.width ?? r.w, h: r.height ?? r.h });
  for (const [prefix, [manifest, id]] of Object.entries(REGION_SHEETS)) {
    const img = sourceOf(scene, prefix);
    const def = scene.cache.json.get(manifest)?.assets?.find((a) => a.id === id);
    if (!img || !def) continue;
    // Regionen: Liste ({ name, ... }) oder Objekt (name → Rechteck)
    const regions = Array.isArray(def.regions) ? Object.fromEntries(def.regions.map((r) => [r.name, r])) : def.regions ?? {};
    for (const [name, r] of Object.entries(regions)) cut(`${prefix}_${name}`, img, [rect(r)]);
    const anims = { ...(def.animations ?? {}) };
    // Regionen-Animationen: `regions` (Paket D) oder `frames` mit Regionsnamen (Paket CI)
    for (const [name, a] of Object.entries(def.regionAnimations ?? {})) anims[name] = { ...a, frames: (a.regions ?? a.frames).map((n) => (typeof n === 'string' ? regions[n] : n)) };
    for (const [name, [frames, frameRate]] of Object.entries(REGION_ANIMS[prefix] ?? {})) anims[name] = { frames, frameRate };
    for (const [name, a] of Object.entries(anims)) {
      if (Array.isArray(a) || !a.frames?.length) continue;
      const cols = Math.floor(img.width / 16);
      // Zahlen = linke obere 16er-Zelle des Frames, sonst Rechtecke
      // Paket CE1: `regions` nennt die exakten Ausschnitte, `frames` wären nur 64er-Speicherplätze
      const frames = (a.regions ?? a.frames).map((f) => (typeof f === 'number'
        ? { x: (f % cols) * 16, y: Math.floor(f / cols) * 16, w: a.frameWidth ?? 16, h: a.frameHeight ?? 16 } : rect(typeof f === 'string' ? regions[f] : f)));
      const key = `${prefix}_${name}`;
      if (!cut(key, img, frames)) continue;
      if (!scene.anims.exists(key)) {
        scene.anims.create({ key, frames: frames.map((_, i) => ({ key, frame: i })), frameRate: a.frameRate ?? 5, repeat: a.repeat ?? -1 });
      }
    }
  }
  for (const key of Object.keys(WHOLE_PROPS)) {
    const img = sourceOf(scene, key);
    if (img) cut(key, img, [{ x: 0, y: 0, w: img.width, h: img.height }]);
  }
  for (const [prefix, [, id]] of Object.entries(ICON_STRIPS)) {
    const img = sourceOf(scene, prefix);
    const icons = scene.cache.json.get('manifestFaelle')?.assets?.find((a) => a.id === id)?.icons ?? {};
    if (img) for (const [name, i] of Object.entries(icons)) cut(`${prefix}_${name}`, img, [{ x: i * 16, y: 0, w: 16, h: 16 }]);
  }
}

/** Begegnung → Fall-Effekte im Kampf: beim Angriff am Spieler, beim Sieg am Gegner. */
export const ENCOUNTER_FX = {
  felix_fight: { attack: 'stimme_raub', multi: 'fx_felix_chor', heavy: 'fx_felix_stimme', won: 'fx_felix_befreit', after: 'phiole_bricht' },
};

/** Paket F: Oberflächen-Sheets [Pfad, Breite, Höhe]. Animationen aus manifest-kampf2.json. */
export const F_UI_SHEETS = {
  F_04_alarm: ['ui/F_04_alarm.png', 16, 16],
  F_08_boss_band: ['ui/F_08_boss_band.png', 480, 270],
};
/** Boss-Einblendung zu Kampfbeginn: Begegnung → Büste (ui/F_08_boss_<id>.png, 160x160). */
export const BOSS_INTROS = { felix_fight: 'felix', miriam: 'miriam' };
/** Boss-Büsten aus späteren Paketen: Büste → [Textur-Key, Pfad]; sonst ui/F_08_boss_<id>.png. */
export const BOSS_INTRO_IMAGES = {};
export const bossIntroImage = (id) => BOSS_INTRO_IMAGES[id] ?? [`F_08_boss_${id}`, `ui/F_08_boss_${id}.png`];
/** Zug-Portraits (16x16) in ui/F_05_zug_portraits.png: Begegnung → Spalte. Andere Streifen: TURN_PORTRAIT_URLS (Begegnung → [URL, Spalten]). */
export const TURN_PORTRAIT_URLS = {};
export const TURN_PORTRAITS_URL = `${BASE}ui/F_05_zug_portraits.png`;
export const TURN_PORTRAITS = Object.fromEntries(['player', 'sparring', 'fog_hound', 'ash_warden', 'archive_rats', 'choir_zealots', 'rook_fight',
  'silas_fight', 'mirror_shade', 'schattenpuppe', 'grubenkampf', 'kanalkroete', 'gasgeist', 'uhrwerkwaechter', 'maskenspieler',
  'schlachtergehilfe', 'felix_fight', 'miriam', 'chorschatten'].map((id, i) => [id, i]));
/** Bestiarium: Begegnung → Seite (ui/bestiary/F_<id>.png, 96x128). */
/** Paket G: Monster der Gefahrengebiete (Kampf, Karte, Bestiarium). Wert = [Kampf-Frame, Karten-Frame B, H]. */
export const G_MONSTERS = {
  moorleiche: [64, 16, 32], irrlicht: [64, 16, 16], schlammegel: [64, 32, 32], moorkoenigin: [96, 32, 32],
  schnabelmaske: [48, 16, 32], hustender: [64, 16, 32], pestratte: [64, 32, 32], rattenkoenig: [96, 32, 32],
  knochenwurm: [64, 32, 32], kerzenfresser: [64, 16, 32], schaedelschwarm: [64, 32, 32], ossuarwaechter: [96, 32, 32],
  glaskraehe: [64, 16, 16], kraterbrut: [64, 32, 32], splitterling: [48, 16, 32], sternhirsch: [96, 32, 32],
};
export const BESTIARY = [...Object.keys(TURN_PORTRAITS).filter((id) => id !== 'player'), ...Object.keys(G_MONSTERS)];
/** Paket → Präfix der Bestiariumsseite (Rest: F). */
const BESTIARY_PACK = {};
export const BESTIARY_FILES = {}; // Seiten ohne Paket-Präfix im Dateinamen (Paket AJ)
export const bestiaryUrl = (id) => (BESTIARY_FILES[id] ? `${BASE}ui/bestiary/${BESTIARY_FILES[id]}.png` : `${BASE}ui/bestiary/${BESTIARY_PACK[id] ?? (G_MONSTERS[id] ? 'G' : 'F')}_${id}.png`);
/** Ausrüstung aus Paket F: Items mit 16er- und 32er-Icon unter items/ (Werte kommen mit den Daten). */
export const F_EQUIPMENT = ['mantel_wolle', 'mantel_gewachst', 'mantel_polizei', 'mantel_samt', 'mantel_flicken', 'mantel_leder', 'mantel_chor',
  'mantel_nebel', 'hut_schirmmuetze', 'hut_melone', 'hut_zylinder', 'hut_helm', 'hut_kapuze', 'hut_schutzbrille', 'hut_witwenschleier', 'hut_maske',
  'amulett_laterne', 'amulett_faden', 'amulett_maske', 'amulett_echo', 'amulett_kessel', 'amulett_eisen', 'amulett_schluessel', 'amulett_stimme',
  'revolver', 'messingschlagring', 'brecheisen', 'regenschirmdegen', 'taktstock_silber', 'kette_rauchfass', 'laterne_kampf', 'stimmgabel_gross'];

/** Spielt eine Animation eines Fall-Sheets (CASE_SHEETS) ab. Liefert false, wenn etwas fehlt. */
export function playCaseAnim(sprite, sheet, then) {
  const scene = sprite.scene;
  const spec = CASE_SHEETS[sheet];
  if (!spec || !scene.textures.exists(sheet)) return false;
  const key = `${sheet}-anim`;
  if (!scene.anims.exists(key)) {
    const def = scene.cache.json.get('manifestFaelle')?.assets?.find((a) => a.id === spec[3])?.animations?.[spec[3]];
    if (!def) return false;
    scene.anims.create({ key, frames: def.frames.map((frame) => ({ key: sheet, frame })), frameRate: def.frameRate, repeat: def.repeat });
  }
  sprite.setTexture(sheet);
  sprite.play(key);
  if (then) sprite.once(`animationcomplete-${key}`, then);
  return true;
}

/** 16x16-Icon unter public/sprites/items/<id>.png (tests/sprites.test.js prüft, dass es zu jedem Item eins gibt). */
/** Items ohne eigenes Bild (noch): Platzhalter aus einem ähnlichen Item. */
export const ITEM_ICON_ALIASES = { // Paket AA/AB haben seit AJ eigene Symbole
  k2a_tinte_abschrift: 'pfaendungsbrief', k2a_bittere_mittel_abschrift: 'pfaendungsbrief', k2a_hafenrecht_abschrift: 'pfaendungsbrief', k2a_letztes_bild_abschrift: 'pfaendungsbrief' }; // Paket AL
/** Zutaten und Artefakte aus Paket AF haben seit AG eigene Bilder (16 und 32). */
const AF_ARTIFACTS = ['sq_offene_blende', 'sq_gegenakte', 'sq_ruecklaufbecher', 'sq_stegbolzen', 'sq_fristpendel', 'sq_torfsiegel'];
const AG_ICONS = (id) => AF_ARTIFACTS.includes(id) || /^sq_zutat_\w+_\d$/.test(id);
/** Trank/Formel eines neuen Pfads → Bild des Bestandspfads gleicher Stufe. */
const standinIcon = (id) => {
  if (AG_ICONS(id)) return id; // Paket AG: eigene Bilder für Zutaten und Artefakte
  const t = /^(trank|formel)_(\w+)_(\d)$/.exec(id);
  if (!t) return id;
  // Sequenz 4 bis 1 haben noch keine eigenen Trank- und Formelbilder: das Bild der Stufe 5 des Pfads
  return `${t[1]}_${PATHWAY_STANDIN[t[2]] ?? t[2]}_${Math.max(5, Number(t[3]))}`;
};
export const itemIconUrl = (id) => `${BASE}items/${ITEM_ICON_ALIASES[id] ?? standinIcon(id)}.png`;
/** 32x32-Fassung (gibt es für Tränke und die Stimmphiole). */
const ICON32 = ['stimmphiole', 'verlorenes_gesangbuch', 'spiegelscherbe', ...F_EQUIPMENT,
  'rostwasser', 'schleierpuder', 'ankerhaken', 'schleierdolch', 'rostanker', 'porzellanmaske', 'rost_zeichen', 'schleier_zeichen',
  // Ausrüstung aus Paket G, J und K
  'mantel_moor', 'hut_schnabel', 'amulett_moorperle', 'knochenmesser', 'wachsamulett', 'glasfibel', 'sternglasdolch', 'geweihreif',
  'amulett_wiegenlied', 'mantel_giesser', 'taktstock_vey', 'hut_chor', 'amulett_schatten', 'hut_maskenball', 'mantel_frack', 'blitzpulver'];
export const itemIcon32Url = (id) => {
  const k = ITEM_ICON_ALIASES[id] ?? id;
  return k.startsWith('trank_') || ICON32.includes(k) || AG_ICONS(k) ? `${BASE}items/32/${standinIcon(k)}.png` : null;
};

const srcKey = (sheet) => `src_${sheet}`;

/** Im preload() der Szene aufrufen. Bereits geladene Sheets werden übersprungen. */
export function preloadSprites(scene) {
  for (const [sheet, path] of Object.entries(SHEETS)) {
    if (!scene.textures.exists(srcKey(sheet))) scene.load.image(srcKey(sheet), BASE + path);
  }
  for (const [key, [path, w, h = w]] of Object.entries(BATTLE_SHEETS)) {
    if (!scene.textures.exists(key)) scene.load.spritesheet(key, BASE + path, { frameWidth: w, frameHeight: h });
  }
  for (const key of new Set([...Object.values(BATTLE_BACKGROUNDS), ...Object.values(BATTLE_BACKGROUNDS_NIGHT), ...Object.values(ENCOUNTER_BACKGROUNDS)])) {
    if (!scene.textures.exists(key)) scene.load.image(key, `${BASE}battle/${key}.png`);
  }
  for (const [key, [path, w, h]] of Object.entries(ANIM_SHEETS)) {
    if (!scene.textures.exists(key)) scene.load.spritesheet(key, BASE + path, { frameWidth: w, frameHeight: h });
  }
  for (const [id, [path, w, h = w]] of Object.entries(OVERWORLD_SHEETS)) {
    if (!scene.textures.exists(`ow_${id}`)) scene.load.spritesheet(`ow_${id}`, BASE + path, { frameWidth: w, frameHeight: h });
  }
  for (const [id, path] of Object.entries(LOOT_SHEETS)) {
    if (!scene.textures.exists(`G_loot_${id}`)) scene.load.spritesheet(`G_loot_${id}`, BASE + path, { frameWidth: 16, frameHeight: 16 });
  }
  if (!scene.cache.json.exists('manifest14b')) scene.load.json('manifest14b', `${BASE}manifest-14b.json`);
  if (!scene.cache.json.exists('manifestKampf')) scene.load.json('manifestKampf', `${BASE}manifest-kampf.json`);
  if (!scene.cache.json.exists('manifestKampf2')) scene.load.json('manifestKampf2', `${BASE}manifest-kampf2.json`);
  for (const [key, [path, w, h]] of Object.entries(F_UI_SHEETS)) {
    if (!scene.textures.exists(key)) scene.load.spritesheet(key, BASE + path, { frameWidth: w, frameHeight: h });
  }
  for (const [key, path] of [...Object.values(BOSS_INTROS).map(bossIntroImage), ...Object.values(BOSS_FORM_INTROS)]) {
    if (!scene.textures.exists(key)) scene.load.image(key, BASE + path);
  }
  for (const key of Object.values(BOSS_FORM_BACKGROUNDS)) {
    if (!scene.textures.exists(key)) scene.load.image(key, `${BASE}battle/${key}.png`);
  }
  if (!scene.cache.json.exists('manifestWelt')) scene.load.json('manifestWelt', `${BASE}manifest-welt.json`);
  if (!scene.cache.json.exists('manifestPfade')) scene.load.json('manifestPfade', `${BASE}manifest-pfade.json`);
  if (!scene.cache.json.exists('manifestStadt')) scene.load.json('manifestStadt', `${BASE}manifest-stadt.json`);
  if (!scene.cache.json.exists('manifestFaelle')) scene.load.json('manifestFaelle', `${BASE}manifest-faelle.json`);
  if (!scene.cache.json.exists('manifestWildnis')) scene.load.json('manifestWildnis', `${BASE}manifest-wildnis.json`);
  if (!scene.cache.json.exists('manifestReise')) scene.load.json('manifestReise', `${BASE}manifest-reise.json`);
  if (!scene.cache.json.exists('manifestJournal')) scene.load.json('manifestJournal', `${BASE}manifest-journal.json`);
  if (!scene.cache.json.exists('manifestWexmoor2')) scene.load.json('manifestWexmoor2', `${BASE}manifest-wexmoor2.json`);
  if (!scene.cache.json.exists('manifestWexmoor3')) scene.load.json('manifestWexmoor3', `${BASE}manifest-wexmoor3.json`);
  if (!scene.cache.json.exists('manifestWexmoor4')) scene.load.json('manifestWexmoor4', `${BASE}manifest-wexmoor4.json`);
  if (!scene.cache.json.exists('manifestWexmoor5')) scene.load.json('manifestWexmoor5', `${BASE}manifest-wexmoor5.json`);
  if (!scene.cache.json.exists('manifestPlatzhalter')) scene.load.json('manifestPlatzhalter', `${BASE}manifest-platzhalter.json`);
  if (!scene.cache.json.exists('manifestWexmoor7')) scene.load.json('manifestWexmoor7', `${BASE}manifest-wexmoor7.json`);
  if (!scene.cache.json.exists('manifestWexmoor6')) scene.load.json('manifestWexmoor6', `${BASE}manifest-wexmoor6.json`);
  if (!scene.cache.json.exists('manifestSequenzen3')) scene.load.json('manifestSequenzen3', `${BASE}manifest-sequenzen3.json`);
  if (!scene.cache.json.exists('manifestDunscar1')) scene.load.json('manifestDunscar1', `${BASE}manifest-dunscar1.json`);
  if (!scene.cache.json.exists('manifestDunscar3')) scene.load.json('manifestDunscar3', `${BASE}manifest-dunscar3.json`);
  if (!scene.cache.json.exists('manifestDunscar5')) scene.load.json('manifestDunscar5', `${BASE}manifest-dunscar5.json`);
  if (!scene.cache.json.exists('manifestStarling2')) scene.load.json('manifestStarling2', `${BASE}manifest-starling2.json`);
  if (!scene.cache.json.exists('manifestSekten')) scene.load.json('manifestSekten', `${BASE}manifest-sekten.json`);
  if (!scene.cache.json.exists('manifestVorrat1')) scene.load.json('manifestVorrat1', `${BASE}manifest-vorrat1.json`);
  if (!scene.cache.json.exists('manifestVorrat2')) scene.load.json('manifestVorrat2', `${BASE}manifest-vorrat2.json`);
  if (!scene.cache.json.exists('manifestBriarholt1')) scene.load.json('manifestBriarholt1', `${BASE}manifest-briarholt1.json`);
  if (!scene.cache.json.exists('manifestCalderwick1')) scene.load.json('manifestCalderwick1', `${BASE}manifest-calderwick1.json`);
  if (!scene.cache.json.exists('manifestNebenquests')) scene.load.json('manifestNebenquests', `${BASE}manifest-nebenquests.json`);
  if (!scene.cache.json.exists('manifestSpieler2')) scene.load.json('manifestSpieler2', `${BASE}manifest-spieler2.json`);
  if (!scene.cache.json.exists('manifestWexmoor')) scene.load.json('manifestWexmoor', `${BASE}manifest-wexmoor.json`);
  if (!scene.cache.json.exists('manifestSequenzen2')) scene.load.json('manifestSequenzen2', `${BASE}manifest-sequenzen2.json`);
  if (!scene.cache.json.exists('manifestTreffen')) scene.load.json('manifestTreffen', `${BASE}manifest-treffen.json`);
  if (!scene.cache.json.exists('manifestFall78')) scene.load.json('manifestFall78', `${BASE}manifest-fall78.json`);
  if (!scene.cache.json.exists('manifestFall6')) scene.load.json('manifestFall6', `${BASE}manifest-fall6.json`);
  if (!scene.cache.json.exists('manifestFall5')) scene.load.json('manifestFall5', `${BASE}manifest-fall5.json`);
  if (!scene.cache.json.exists('manifestGegner3')) scene.load.json('manifestGegner3', `${BASE}manifest-gegner3.json`);
  if (!scene.cache.json.exists('manifestKontrollverlust')) scene.load.json('manifestKontrollverlust', `${BASE}manifest-kontrollverlust.json`);
  for (const [key, [path, w, h]] of Object.entries(CASE_SHEETS)) {
    if (!scene.textures.exists(key)) scene.load.spritesheet(key, BASE + path, { frameWidth: w, frameHeight: h });
  }
}

/**
 * Spielt eine Animation aus manifest-pfade.json auf einem Sprite mit Paket-A-Sheet
 * (z. B. playSheetAnim(sprite, 'cauldron_bubble', 'bubble')). Liefert false, wenn etwas fehlt.
 */
export function playSheetAnim(sprite, sheet, name, then) {
  const scene = sprite.scene;
  if (!ANIM_SHEETS[sheet] || !scene.textures.exists(sheet)) return false;
  const key = `${sheet}-${name}`;
  if (!scene.anims.exists(key)) {
    const id = MANIFEST_IDS[sheet] ?? sheet;
    const def = ['manifestPfade', 'manifestWelt', 'manifestJournal', 'manifestSpieler2', 'manifestSequenzen3', 'manifestKontrollverlust', 'manifestSekten'].map((m) => scene.cache.json.get(m)?.assets?.find((a) => a.id === id)?.animations?.[name]).find(Boolean);
    if (!def) return false;
    scene.anims.create({ key, frames: def.frames.map((frame) => ({ key: sheet, frame })), frameRate: def.frameRate, repeat: def.repeat });
  }
  sprite.setTexture(sheet);
  sprite.play(key);
  if (then) sprite.once(`animationcomplete-${key}`, then);
  return true;
}

/** Übliche Reihennamen späterer Pakete (hit/death statt hurt/defeated). */
const ANIM_FALLBACK = { hurt: 'hit', defeated: 'death' };
/** Animationsdefinition aus manifest-14b.json oder manifest-kampf.json. */
function battleAnimDef(scene, sheet, name) {
  const def = battleSheetDef(scene, sheet);
  for (const n of [name, ANIM_ALIASES[sheet]?.[name], ANIM_FALLBACK[name]].filter(Boolean)) if (def?.animations?.[n]) return def.animations[n];
  return null;
}
/** Manifeste mit Kampf-Sheets; spätere Pakete nennen ihre Einträge nicht nach dem Sheet, darum auch über die Datei. */
export const BATTLE_MANIFESTS = ['manifest14b', 'manifestKampf', 'manifestKampf2', 'manifestReise', 'manifestWildnis', 'manifestGegner3', 'manifestFall5', 'manifestFall6', 'manifestFall78', 'manifestSequenzen2', 'manifestWexmoor2', 'manifestWexmoor3', 'manifestWexmoor4', 'manifestWexmoor5', 'manifestPlatzhalter', 'manifestSpieler2', 'manifestNebenquests', 'manifestWexmoor7', 'manifestWexmoor6', 'manifestSequenzen3', 'manifestDunscar3', 'manifestDunscar5', 'manifestStarling2', 'manifestSekten', 'manifestVorrat1', 'manifestVorrat2'];
export function battleSheetDef(scene, sheet) {
  const file = BATTLE_SHEETS[sheet]?.[0];
  for (const m of BATTLE_MANIFESTS) {
    const assets = scene.cache.json.get(m)?.assets ?? [];
    const def = assets.find((a) => a.id === sheet && a.animations) ?? (file && assets.find((a) => a.file === file && a.animations));
    if (def) return def;
  }
  return null;
}
/** Paket F: Bosse nennen ihre Animationen anders als der Kampfablauf. */
const ANIM_ALIASES = {
  enemy_felix: { attack: 'attack_a', special: 'attack_b', cast: 'special' },
  enemy_miriam: { attack: 'attack_conduct', special: 'attack_scream', cast: 'summon' },
  enemy_chorschatten: { special: 'attack', defeated: 'dissolve' },
};

/**
 * Spielt eine Kampfanimation (z. B. 'attack', 'hurt'). Mit `sheet` wechselt das Sprite
 * dafür auf ein anderes Kampf-Sheet (z. B. battle_player_skills).
 * Liefert false, wenn das Sprite kein Kampf-Sheet nutzt oder die Animation fehlt.
 */
export function playBattleAnim(sprite, name, then, sheet = sprite.texture.key) {
  if (!BATTLE_SHEETS[sheet] || !sprite.scene.textures.exists(sheet)) return false;
  const scene = sprite.scene;
  const key = `${sheet}-${name}`;
  if (!scene.anims.exists(key)) {
    const def = battleAnimDef(scene, sheet, name);
    if (!def) return false;
    scene.anims.create({ key, frames: def.frames.map((frame) => ({ key: sheet, frame })), frameRate: def.frameRate, repeat: def.repeat });
  }
  sprite.play(key);
  if (then) sprite.once(`animationcomplete-${key}`, then);
  return true;
}

function sourceOf(scene, sheet) {
  const key = srcKey(sheet);
  if (!scene.textures.exists(key)) return null;
  return scene.textures.get(key).getSourceImage();
}

/** Zeichnet ein Tile aus dem PNG an (dx, dy). Liefert false, wenn es keins gibt. */
export function drawTileFromSheet(scene, ctx, tileKey, dx, dy, drawFallback) {
  const cell = TILE_CELLS[tileKey];
  if (!cell) return false;
  const [sheet, index, base] = cell;
  const img = sourceOf(scene, sheet);
  if (!img) return false;
  if (base) {
    if (!drawTileFromSheet(scene, ctx, base, dx, dy, drawFallback)) drawFallback(base);
  }
  let sx;
  let sy;
  if (typeof index === 'string') {
    // Benannte Region aus manifest-welt.json
    const r = scene.cache.json.get('manifestWelt')?.assets?.find((a) => a.file === SHEETS[sheet])?.regions?.[index];
    if (!r) return false;
    sx = r.x;
    sy = r.y;
  } else {
    const cols = Math.floor(img.width / 16);
    sx = (index % cols) * 16;
    sy = Math.floor(index / cols) * 16;
  }
  ctx.drawImage(img, sx, sy, 16, 16, dx, dy, 16, 16);
  return true;
}

/** Legt Props und Figuren aus den PNGs unter ihren Spiel-Keys an. */
export function createSpriteTextures(scene) {
  for (const [key, [sheet, x, y, w, h, scale = 1]] of Object.entries(PROP_CELLS)) {
    if (scene.textures.exists(key)) continue;
    const img = sourceOf(scene, sheet);
    if (!img) continue;
    const c = document.createElement('canvas');
    c.width = w * scale;
    c.height = h * scale;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x, y, w, h, 0, 0, w * scale, h * scale);
    scene.textures.addCanvas(key, c);
  }
  for (const [key, [sheet, frames, frameRate]] of Object.entries(PROP_ANIMS)) {
    if (scene.textures.exists(key)) continue;
    const img = sourceOf(scene, sheet);
    if (!img) continue;
    const [, , w, h] = frames[0];
    const c = document.createElement('canvas');
    c.width = w * frames.length;
    c.height = h;
    const ctx = c.getContext('2d');
    frames.forEach(([x, y], i) => ctx.drawImage(img, x, y, w, h, i * w, 0, w, h));
    const tex = scene.textures.addCanvas(key, c);
    frames.forEach((_, i) => tex.add(i, 0, i * w, 0, w, h));
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames: frames.map((_, i) => ({ key, frame: i })), frameRate, repeat: -1 });
  }
  for (const [key, sheet] of Object.entries(CHARACTER_SHEETS)) {
    if (scene.textures.exists(key)) continue;
    const img = sourceOf(scene, sheet);
    if (img) scene.textures.addSpriteSheet(key, img, { frameWidth: 16, frameHeight: 32 });
  }
  createRegionTextures(scene);
}

// --- Paket H: Journal-Quellen, Fundstücke, Untersuchen (manifest-journal.json) -------------

/** Mini-Köpfe (24x24) für Quellen im Notizbuch. */
export const HEADS = ['marlowe', 'holt', 'pimm', 'rook', 'price', 'barnaby', 'fenwick', 'kit', 'elias', 'greta', 'halloway', 'ivy',
  'hester', 'anselm', 'moll', 'agnes', 'pip', 'tobias', 'maud', 'silas', 'ned', 'quill', 'ambrose', 'wick', 'grimes', 'nell',
  'kittering', 'gorse', 'sabeth', 'brock', 'diva', 'souffleur', 'maskenmacher', 'uhrmacherin', 'turmwaechter', 'schlachtermeister',
  'lehrling', 'gaswerker', 'astronom', 'miriam', 'schleierbote', 'tresswell', 'vellacourt', 'kohlenjem', 'player', 'cultist', 'nate', 'unknown_man', 'unknown_woman', 'anonymous', 'crowd', 'spirit'];
const HEAD_ALIASES = { grubenwirt: 'brock', price_wx: 'price' };
/** Köpfe, die nicht unter ui/heads/ liegen (Paket CN: portraits/heads/). */
export const HEAD_FILES = {};
export const headUrl = (id) => {
  const h = HEAD_ALIASES[id] ?? id;
  return HEADS.includes(h) ? `${BASE}${HEAD_FILES[h] ?? `ui/heads/${h}.png`}` : null;
};

/** Quellen-Symbole (24x24): Art der Quelle aus dem Quellentext, sonst aus dem Typ (core/sources.js). */
export const SOURCE_KINDS = ['brief', 'buch', 'tagebuch', 'foto', 'archivakte', 'belauscht', 'inschrift', 'kreide', 'beleg', 'karte'];
const SOURCE_KIND_RULES = [
  [/tagebuch/i, 'tagebuch'], [/pfandbuch|dienstbuch|kassenbuch|logbuch/i, 'beleg'], [/foto|lichtbild|platte/i, 'foto'], [/akte|archiv|register|kirchenbuch/i, 'archivakte'],
  [/belausch|gehört|gerücht|geflüster|getuschel/i, 'belauscht'], [/kreide|zeichen an|gekritzel/i, 'kreide'],
  [/inschrift|gravur|grabstein|tafel|schild/i, 'inschrift'], [/beleg|quittung|rechnung|liste|lieferschein|fahrplan|bericht/i, 'beleg'],
  [/karte|plan\b|stadtplan/i, 'karte'], [/brief|zettel|notiz|telegramm/i, 'brief'], [/buch|notenblatt|heft|chronik/i, 'buch'],
];
const SOURCE_KIND_BY_TYPE = { note: 'brief', archive: 'archivakte', police: 'beleg', object: 'inschrift' };
/** 24er-Symbol für eine Quelle oder null (dann altes Symbol aus SOURCE_ICONS). */
export function sourceKind(type, text = '') {
  if (type === 'npc' || type === 'observation' || type === 'vision') return null;
  for (const [re, kind] of SOURCE_KIND_RULES) if (re.test(text)) return kind;
  return SOURCE_KIND_BY_TYPE[type] ?? null;
}
export const sourceKindUrl = (kind) => `${BASE}ui/sources/24/${kind}.png`;

/** Nahansicht (160x120) eines Fundstücks, mit Fluch-Fassung. */
export const INSPECT_VIEWS = ['verlorenes_gesangbuch', 'spiegelscherbe', 'glocke', 'stimmphiole', 'sternsplitter', 'taschenuhr'];
/** Nahansichten mit anderem Dateinamen: Fundstück → [normal, verflucht]. */
export const INSPECT_FILES = {};
export const inspectUrl = (item, curse = false) => {
  if (INSPECT_FILES[item]) return `${BASE}ui/inspect/${INSPECT_FILES[item][curse ? 1 : 0]}.png`;
  return INSPECT_VIEWS.includes(item) ? `${BASE}ui/inspect/${item}${curse ? '_fluch' : ''}.png` : null;
};

/** Risiko-Symbole (ui/H_06_risiko_icons.png, 80x24): Name → [x, y, Größe]. */
export const RISK_ICONS_URL = `${BASE}ui/H_06_risiko_icons.png`;
export const RISK_ICONS = { unrest: [0, 0, 16], curse: [16, 0, 16], ambush: [32, 0, 16], bonus_clue: [48, 0, 16], safe: [64, 0, 16],
  risk_low: [0, 16, 8], risk_medium: [8, 16, 8], risk_high: [16, 16, 8] };

/** Journal-Rahmen (ui/H_journal_rahmen.png, 128x64): Foto-Rahmen um Köpfe und Marker zwischen Fakten. */
export const JOURNAL_FRAME_URL = `${BASE}ui/H_journal_rahmen.png`;
export const JOURNAL_FRAME = { photo: [0, 0, 32, 36], photo_unreliable: [32, 0, 32, 36], document: [64, 0, 32, 32],
  string_pin: [96, 16, 16, 16], same_source: [112, 16, 16, 16], contradicts: [96, 32, 16, 16] };

/**
 * Welcher Risiko-Effekt passt zu einem Dialogknoten beim Untersuchen?
 * Kampf → ambush, Schaden → curse, Hinweis → bonus_clue, viel Unruhe → unrest.
 */
export function riskOf(node) {
  if (node.combat) return 'ambush';
  if (node.damage) return 'curse';
  if (node.gives_clues?.length) return 'bonus_clue';
  if ((node.unruhe ?? 0) >= 8 || (node.nerves ?? 0) <= -15) return 'unrest';
  return null;
}
/** Risiko einer Wahl aus ihrem Text: "(gefährlich)", "(riskant)", "(wenig Risiko)". */
export function choiceRisk(text) {
  if (/\(gefährlich\)/i.test(text)) return 'risk_high';
  if (/\(riskant\)/i.test(text)) return 'risk_medium';
  if (/\(wenig risiko\)/i.test(text)) return 'risk_low';
  return null;
}

// --- Paket I: Reise und Sekten (manifest-reise.json) ------------------------------------------

/** Sektengegner: eigene Kampf-Sheets (48er) und Lauf-Sheets; Streifen auf dem Reiseweg nutzen die Kettenträger/Messerinnen. */
export const I_ENEMIES = ['rost_schlaeger', 'rost_werfer', 'rost_schmied', 'rost_vater', 'schleier_novizin', 'schleier_messerin', 'schleier_seherin', 'schleier_mutter'];
const I_ALIASES = { rost_streife: 'rost_schlaeger', schleier_schatten: 'schleier_messerin' };
for (const id of I_ENEMIES) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, 48];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/I_ow_${id}.png`, 16, 32];
  SHEETS[`i_ow_${id}`] = `characters/I_ow_${id}.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `i_ow_${id}`;
}
for (const [id, base] of Object.entries(I_ALIASES)) { ENCOUNTER_SHEETS[id] = `enemy_${base}`; OVERWORLD_SHEETS[id] = OVERWORLD_SHEETS[base]; }
/** Verwandlung der Sektenoberhäupter (96er-Sheet, Animation "phase2"), sobald sie in Rage geraten. */
export const BOSS_FORMS = { rost_vater: 'boss_rost_vater', schleier_mutter: 'boss_schleier_mutter' };
for (const sheet of Object.values(BOSS_FORMS)) BATTLE_SHEETS[sheet] = [`battle/${sheet}.png`, 96];
/** Neue Figuren mit Lauf-Sheet und Portrait. */
export const I_CHARACTERS = ['jory', 'lavinia', 'tilly'];
for (const id of I_CHARACTERS) {
  SHEETS[`i_${id}`] = `characters/I_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `i_${id}`;
  PORTRAITS[id] = `I_${id}_emotions.png`;
}
for (const id of ['rost_vater', 'schleier_mutter']) {
  PORTRAITS[id] = `I_${id}_emotions.png`;
  PORTRAIT_SPECIAL[id] = [`I_${id}_emotions.png`, { neutral: 0, suspicious: 1, angry: 2, arrogant: 3 }];
}
PORTRAITS.schleier_novizin = PORTRAITS.tilly; // die falsche Tilly trägt Tillys Gesicht
/** Sekten-Verstecke als Kampfkulisse. */
Object.assign(BATTLE_BACKGROUNDS, { rostkapelle: 'bg_rostbrueder', schleierhaus: 'bg_schleierschwestern' });
Object.assign(ENCOUNTER_BACKGROUNDS, { rost_vater: 'bg_rostbrueder', rost_schmied: 'bg_rostbrueder', schleier_mutter: 'bg_schleierschwestern', schleier_seherin: 'bg_schleierschwestern' });
/** Wappen (factions/<id>.png, 112x64: 16er, 32er, 64er nebeneinander). */
export const factionEmblemUrl = (id) => `${BASE}factions/${id}.png`;
/** Reise-UI: Reisearten (32x32) und Markierung des Standorts (16x16, vier Frames). */
export const TRAVEL_MODES_URL = `${BASE}ui/I_reise_modes.png`;
export const TRAVEL_MODE_ICONS = { sicher: 0, schnell: 1 };
export const TRAVEL_MARKER_URL = `${BASE}ui/I_reise_marker.png`;

// --- Paket G: Gefahrengebiete, Monster und Beute (manifest-wildnis.json) -----------------------

for (const [id, [w, ow, oh]] of Object.entries(G_MONSTERS)) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  ENCOUNTER_SHEETS[`${id}_elite`] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/G_ow_${id}.png`, ow, oh];
  OVERWORLD_SHEETS[`${id}_elite`] = OVERWORLD_SHEETS[id];
  if (!['schnabelmaske', 'hustender'].includes(id)) FADING_SHEETS.push(`enemy_${id}`);
}
/** Gebiet → eigener Kampfhintergrund. */
export const ZONES = ['marsch', 'pestgassen', 'katakomben', 'kraterwald'];
for (const z of ZONES) BATTLE_BACKGROUNDS[z] = `bg_${z}`;
/** Beutebehälter am Boden (Frame 0 zu, 1 offen). */
for (const k of ['beutel', 'kiste', 'truhe', 'okkulter_schrein']) LOOT_SHEETS[k] = `props/G_loot_${k}.png`;
/** Material und Ausrüstung aus den Gebieten (16er und 32er). */
export const G_ITEMS = ['moorwasser', 'irrlichtfunke', 'egelschleim', 'moorperle', 'schnabelfeder', 'hustenstaub', 'rattenschwanz', 'rattenkrone',
  'knochenmehl', 'wachsherz', 'schaedelsplitter', 'ossuarschluessel', 'glasfeder', 'brutschale', 'sternhirschgeweih', 'geisterkern',
  'mantel_moor', 'hut_schnabel', 'amulett_moorperle', 'knochenmesser', 'wachsamulett', 'glasfibel', 'sternglasdolch', 'geweihreif'];
ICON32.push(...G_ITEMS);
/** Seltenheit → Name im Sheet ui/G_03_seltenheit.png (Edelstein 8x8, Lichtsäule über Behältern). */
export const RARITY_SHEET = { gewoehnlich: 'common', ungewoehnlich: 'uncommon', selten: 'rare', okkult: 'occult' };
export const RARITY_SHEET_URL = `${BASE}ui/G_03_seltenheit.png`;
export const RARITY_GEMS = { common: [224, 48], uncommon: [240, 48], rare: [0, 96], occult: [16, 96] };
/** Gefahrenstufe (16x16) und Gebietsbanner (192x32) aus ui/G_01_gefahr.png. */
export const DANGER_URL = `${BASE}ui/G_01_gefahr.png`;
export const DANGER_ICONS = [[0, 0], [16, 0], [32, 0], [48, 0], [64, 0]];
export const DANGER_BANNER = [80, 0, 192, 32];

// --- Paket L: Stadtgegner, Kopfgelder und Nachtmarker (manifest-gegner3.json) -----------------

/** Stadtgegner: [Kampf-Frame, Karten-Frame-Breite]. Die Königin der Schmuggler ist der Boss. */
export const L_ENEMIES = {
  laternendieb: [48, 16], kanalschmuggler: [48, 16], nachtkraemer: [48, 16], falschgeldpraeger: [48, 16],
  russgeist: [64, 32], glockenhund: [64, 32], papierkraehe: [64, 32], wachsmann: [64, 16],
  fadenspinne: [64, 32], nebelaal: [64, 32], schmugglerkoenigin: [96, 16],
};
/** Wesen, die nach der Niederlage vergehen. */
const L_FADING = ['russgeist', 'papierkraehe', 'wachsmann', 'nebelaal'];
Object.keys(L_ENEMIES).forEach((id, i) => {
  const [w, ow] = L_ENEMIES[id];
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  ENCOUNTER_SHEETS[`${id}_elite`] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [id === 'schmugglerkoenigin' ? 'characters/L_schmugglerkoenigin_walk.png' : `characters/L_ow_${id}.png`, ow, 32];
  OVERWORLD_SHEETS[`${id}_elite`] = OVERWORLD_SHEETS[id];
  if (L_FADING.includes(id)) FADING_SHEETS.push(`enemy_${id}`);
  TURN_PORTRAITS[id] = i;
  TURN_PORTRAIT_URLS[id] = [`${BASE}ui/L_zug_portraits.png`, 11];
  BESTIARY_PACK[id] = 'L';
  BESTIARY.push(id);
});
/** Die Gewöhnlichen schlagen mit attack_a, die Spezialattacke ist attack_b; die Königin hat eigene Namen. */
for (const id of Object.keys(L_ENEMIES)) ANIM_ALIASES[`enemy_${id}`] = { attack: 'attack_a', special: 'attack_b' };
ANIM_ALIASES.enemy_schmugglerkoenigin = { attack: 'attack_cutlass', special: 'attack_crate', cast: 'summon' };
/** Boss-Einblendung, Portrait und Lauf-Sheet der Schmugglerkönigin. */
BOSS_INTROS.schmugglerkoenigin = 'schmugglerkoenigin_l';
BOSS_INTRO_IMAGES.schmugglerkoenigin_l = ['L_08_boss_schmugglerkoenigin', 'ui/L_08_boss_schmugglerkoenigin.png'];
SHEETS.l_schmugglerkoenigin = 'characters/L_schmugglerkoenigin_walk.png';
CHARACTER_SHEETS.npc_schmugglerkoenigin = 'l_schmugglerkoenigin';
PORTRAITS.schmugglerkoenigin = 'L_schmugglerkoenigin_emotions.png';
PORTRAIT_SPECIAL.schmugglerkoenigin = ['L_schmugglerkoenigin_emotions.png', { neutral: 0, suspicious: 1, angry: 2, smiling: 3 }];
/** Neue Kampfkulissen der Stadt. */
Object.assign(BATTLE_BACKGROUNDS, { daecher: 'bg_daecher', markthalle: 'bg_markthalle' });
Object.assign(ENCOUNTER_BACKGROUNDS, { schmugglerkoenigin: 'bg_markthalle', papierkraehe: 'bg_daecher', russgeist: 'bg_daecher' });
/** Gegner-Effekte (fx/fx_<id>.png, Animation "play"): beim Angriff am Spieler. */
const L_FX = { russ: 48, glockenheulen: 48, papierwirbel: 48, wachs: 32, fadennetz: 48, farbrauch: 32, status_gefesselt: 16 };
for (const [id, size] of Object.entries(L_FX)) BATTLE_SHEETS[`fx_${id}`] = [`fx/fx_${id}.png`, size];
Object.assign(ENCOUNTER_FX, {
  russgeist: { attack: 'fx_russ' }, glockenhund: { attack: 'fx_glockenheulen' }, papierkraehe: { attack: 'fx_papierwirbel' },
  wachsmann: { attack: 'fx_wachs' }, fadenspinne: { attack: 'fx_fadennetz' }, falschgeldpraeger: { attack: 'fx_farbrauch' },
});
/** Beute und Kopfgeld-Belohnungen (16er und 32er). */
export const L_ITEMS = ['gasgluehstrumpf', 'schmuggelware', 'falschgeld', 'russklumpen', 'bronzeglocke_klein', 'papierfeder', 'wachsdocht',
  'spinnfaden_lila', 'entermesser', 'fernrohr_messing', 'mantel_oelzeug', 'polizeimarke_gold'];
ICON32.push(...L_ITEMS);
/** Steckbriefe (64x80, Spalte 0 gesucht, 1 gefasst); ohne eigenen Steckbrief der leere. */
export const WANTED = ['laternendieb', 'falschgeldpraeger', 'nachtkraemer', 'schmugglerkoenigin'];
export const wantedUrl = (id) => (WANTED_SINGLE[id] ? `${BASE}${WANTED_SINGLE[id]}` : `${BASE}ui/wanted/L_steckbrief_${WANTED.includes(id) ? id : 'leer'}.png`);
/** Steckbriefe mit nur einem Bild (BE): die Oberfläche zeigt sie ganz und graut „gefasst“. */
export const wantedSingle = (id) => !!WANTED_SINGLE[id];

// --- Paket J: Fall 5, Miriam und die Glocke (manifest-fall5.json) ---------------------------------

/** Gegner aus Fall 5: [Kampf-Frame, Karten-Frame-Breite]. */
export const J_ENEMIES = { chorwaechter: [48, 16], stimmenfresser: [64, 16], bronzeengel: [64, 32], glockenecho: [64, 32] };
Object.keys(J_ENEMIES).forEach((id, i) => {
  const [w, ow] = J_ENEMIES[id];
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/J_ow_${id}.png`, ow, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  ANIM_ALIASES[`enemy_${id}`] = { attack: 'attack_a', special: 'attack_b' };
  if (id !== 'chorwaechter') FADING_SHEETS.push(`enemy_${id}`);
  TURN_PORTRAITS[id] = i;
  TURN_PORTRAIT_URLS[id] = [`${BASE}ui/J_zug_portraits.png`, 5];
  BESTIARY_PACK[id] = 'J';
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
});
/** Miriams Glockenphase: in Rage wird sie zur Glocke, die Kammer bricht auf. */
BATTLE_SHEETS.enemy_miriam_glocke = ['battle/enemy_miriam_glocke.png', 96];
BOSS_FORMS.miriam = 'enemy_miriam_glocke';
ANIM_ALIASES.enemy_miriam_glocke = { attack: 'grabgelaeut', special: 'chor_stimmen', cast: 'summon', phase2: 'summon' };
export const BOSS_FORM_BACKGROUNDS = { miriam: 'bg_resonanzkammer_2' };
export const BOSS_FORM_INTROS = { miriam: ['J_08_boss_miriam_glocke', 'ui/J_08_boss_miriam_glocke.png'] };
/** Effekte: Gegner beim Angriff; Miriam auch beim Sieg (die Stimmen kommen frei). */
const J_FX = { glocke_schlag: [48], stimme_sog: [64, 32], bronze_welle: [64, 32], echo_kopie: [48], status_stumm: [16],
  grabgelaeut: [96], chor_stimmen: [96, 48], wiegenlied: [64], stimmen_frei: [96] };
for (const [id, [w, h = w]] of Object.entries(J_FX)) BATTLE_SHEETS[`fx_${id}`] = [`fx/fx_${id}.png`, w, h];
Object.assign(ENCOUNTER_FX, {
  chorwaechter: { attack: 'fx_glocke_schlag' }, stimmenfresser: { attack: 'fx_stimme_sog' },
  bronzeengel: { attack: 'fx_bronze_welle' }, glockenecho: { attack: 'fx_echo_kopie' },
  miriam: { attack: 'fx_wiegenlied', multi: 'fx_chor_stimmen', heavy: 'fx_grabgelaeut', won: 'fx_stimmen_frei' },
});
/** Kampfkulissen der drei Orte. */
for (const id of ['giesserei', 'haus_vey', 'resonanzkammer']) BATTLE_BACKGROUNDS[id] = `bg_${id}`;
Object.assign(ENCOUNTER_BACKGROUNDS, { bronzeengel: 'bg_resonanzkammer', glockenecho: 'bg_resonanzkammer', miriam: 'bg_resonanzkammer' });
/** Figuren mit Lauf-Sheet und Portrait. */
for (const id of ['brannock', 'oda_vey', 'lilian_echo']) {
  SHEETS[`j_${id}`] = `characters/J_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `j_${id}`;
  PORTRAITS[id] = `J_${id}_emotions.png`;
}
PORTRAIT_SPECIAL.lilian_echo = ['J_lilian_echo_emotions.png', { neutral: 0, traurig: 1, sad: 1, aengstlich: 2, frightened: 2, smile: 3, laechelnd: 3 }];
PORTRAIT_SPECIAL.miriam = ['J_miriam_glocke_emotions.png', { kalt: 0, flehend: 1, wuetend: 2, gebrochen: 3 }];
/** Fallgegenstände und Belohnungen (16er und 32er), Nahansichten, Hinweis-Marker. */
export const J_ITEMS = ['lilians_spieluhr', 'stimmgabel_silber', 'glockenzunge', 'veys_tagebuch', 'giessform', 'chorliste',
  'amulett_wiegenlied', 'mantel_giesser', 'taktstock_vey', 'hut_chor'];
ICON32.push(...J_ITEMS);
INSPECT_VIEWS.push('lilians_spieluhr', 'veys_tagebuch', 'stimmgabel_silber');
for (const id of ['c5_perfect', 'c5_good', 'c5_early', 'c5_rust']) ENDING_IMAGES[id] = id;
ANIM_SHEETS.j_hinweise = ['props/J_fall5_hinweise.png', 16, 16];
// Frames von j_hinweise in Reihenfolge: bronze_shaving, chalk_bell, burned_score, white_lily, cracked_phial, robe_threads,
// sand_handprint, candle_ring, bronze_dust, tally_door.

// --- Paket K: Fall 6, der dreizehnte Gast (manifest-fall6.json) -----------------------------------

/** Gegner aus Fall 6: [Kampf-Frame, Karten-Frame-Breite]. Der Gast ist der Boss. */
export const K_ENEMIES = { schattenabzug: [48, 16], negativ_geist: [64, 16], silberbad_schleim: [64, 32], dreizehnter_gast: [96, 16] };
Object.keys(K_ENEMIES).forEach((id, i) => {
  const [w, ow] = K_ENEMIES[id];
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/K_ow_${id}.png`, ow, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  if (id !== 'dreizehnter_gast') FADING_SHEETS.push(`enemy_${id}`);
  TURN_PORTRAITS[id] = i;
  TURN_PORTRAIT_URLS[id] = [`${BASE}ui/K_zug_portraits.png`, 4];
  BESTIARY_PACK[id] = 'K';
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
});
/** Der Gast: eigene Angriffsnamen, in Rage die zweite Phase im selben Sheet, dazu das zerbrochene Kabinett. */
ANIM_ALIASES.enemy_dreizehnter_gast = { attack: 'belichtung', special: 'schattenschnitt', cast: 'gruppenbild' };
BOSS_FORMS.dreizehnter_gast = 'enemy_dreizehnter_gast';
BOSS_FORM_BACKGROUNDS.dreizehnter_gast = 'bg_spiegelkabinett_2';
BOSS_INTROS.dreizehnter_gast = 'gast_k';
BOSS_INTRO_IMAGES.gast_k = ['K_08_boss_gast', 'ui/K_08_boss_gast.png'];
const K_FX = { blitzlicht: [48], bilderrahmen: [48], silberspritzer: [32], schattenraub: [48, 32], status_schattenlos: [16],
  status_geblendet: [16], belichtung: [96], gruppenbild: [96], schatten_frei: [96] };
for (const [id, [w, h = w]] of Object.entries(K_FX)) BATTLE_SHEETS[`fx_${id}`] = [`fx/fx_${id}.png`, w, h];
Object.assign(ENCOUNTER_FX, {
  schattenabzug: { attack: 'fx_schattenraub' }, negativ_geist: { attack: 'fx_blitzlicht' }, silberbad_schleim: { attack: 'fx_silberspritzer' },
  dreizehnter_gast: { attack: 'fx_bilderrahmen', multi: 'fx_gruppenbild', heavy: 'fx_belichtung', won: 'fx_schatten_frei' },
});
for (const id of ['atelier', 'ballsaal', 'spiegelkabinett']) BATTLE_BACKGROUNDS[id] = `bg_${id}`;
Object.assign(ENCOUNTER_BACKGROUNDS, { silberbad_schleim: 'bg_spiegelkabinett', dreizehnter_gast: 'bg_spiegelkabinett' });
/** Figuren: Lady Ashcombe und Lucan Mews (enthüllt mit eigenen Stimmungen), dazu vier Ballgäste als Deko. */
for (const id of ['ashcombe', 'mews']) {
  SHEETS[`k_${id}`] = `characters/K_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `k_${id}`;
  PORTRAITS[id] = `K_${id}_emotions.png`;
}
PORTRAIT_SPECIAL.mews = ['K_mews_enthuellt_emotions.png', { kalt: 0, triumph: 1, panisch: 2, gebrochen: 3 }];
for (const n of [1, 2, 3, 4]) ANIM_SHEETS[`k_gast_${n}`] = [`characters/K_gast_${n}_walk.png`, 16, 32];
/** Fallgegenstände und Belohnungen, Nahansicht der Fotoplatte, Hinweis-Marker. */
export const K_ITEMS = ['belichtungsmesser', 'gaesteliste', 'silbernitrat', 'schattenrest', 'kamera_alt',
  'amulett_schatten', 'hut_maskenball', 'mantel_frack', 'blitzpulver'];
ICON32.push(...K_ITEMS);
INSPECT_FILES.fotoplatte = ['fotoplatte_1', 'fotoplatte_fluch'];
ANIM_SHEETS.k_hinweise = ['props/K_fall6_hinweise.png', 16, 16];
CASE_FILES.case_06 = 'K_akte_fall6';
for (const id of ['c6_perfect', 'c6_good', 'c6_early', 'c6_seer']) ENDING_IMAGES[id] = id;

// --- Paket M: Fall 7 und 8, Miss Wren (manifest-fall78.json) ---------------------------------------

/** Gegner aus Fall 7/8: [Kampf-Frame, Karten-Frame-Breite]. Miss Wren ist der Boss (zwei Sheets). */
export const M_ENEMIES = { ertrunkener: [64, 16], pfandeintreiber: [48, 16], traumfaden: [64, 16], miss_wren: [96, 0] };
Object.keys(M_ENEMIES).forEach((id, i) => {
  const [w, ow] = M_ENEMIES[id];
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  if (ow) {
    OVERWORLD_SHEETS[id] = [`characters/M_ow_${id}.png`, ow, 32];
    PROP_ORIGINS[`ow_${id}`] = 0.85;
  }
  if (['ertrunkener', 'traumfaden'].includes(id)) FADING_SHEETS.push(`enemy_${id}`);
  TURN_PORTRAITS[id] = i;
  TURN_PORTRAIT_URLS[id] = [`${BASE}ui/M_zug_portraits.png`, 5];
  BESTIARY_PACK[id] = 'M';
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
});
/** Miss Wren: Gouvernante, in Rage das Netz aus Schuldfäden; der Keller reißt auf. */
BATTLE_SHEETS.enemy_miss_wren_netz = ['battle/enemy_miss_wren_netz.png', 96];
ANIM_ALIASES.enemy_miss_wren = { attack: 'zurechtstutzen', special: 'strafe', cast: 'bettruhe', defeated: 'phase_transition' };
ANIM_ALIASES.enemy_miss_wren_netz = { attack: 'schere', special: 'schuldnetz', cast: 'albtraum', phase2: 'weak_point' };
BOSS_FORMS.miss_wren = 'enemy_miss_wren_netz';
BOSS_FORM_BACKGROUNDS.miss_wren = 'bg_traumkeller_2';
BOSS_INTROS.miss_wren = 'wren_m';
BOSS_INTRO_IMAGES.wren_m = ['M_08_boss_wren', 'ui/M_08_boss_wren.png'];
/** Effekte (Animation heißt hier "effect"). */
const M_FX = { kanalwelle: [64, 32], schuldsiegel: [48], fadenpeitsche: [48, 32], schattennaht: [48, 32], status_schlaf: [16],
  status_schuld: [16], scherenschnitt: [48], schuldnetz: [96], albtraum: [96], traeume_frei: [96] };
for (const [id, [w, h = w]] of Object.entries(M_FX)) {
  BATTLE_SHEETS[`fx_${id}`] = [`fx/fx_${id}.png`, w, h];
  ANIM_ALIASES[`fx_${id}`] = { play: 'effect' };
}
Object.assign(ENCOUNTER_FX, {
  ertrunkener: { attack: 'fx_kanalwelle' }, pfandeintreiber: { attack: 'fx_schuldsiegel' }, traumfaden: { attack: 'fx_fadenpeitsche' },
  miss_wren: { attack: 'fx_scherenschnitt', multi: 'fx_schuldnetz', heavy: 'fx_albtraum', won: 'fx_traeume_frei' },
});
Object.assign(BATTLE_BACKGROUNDS, { kontor_thorne: 'bg_kontor', waisenhaus: 'bg_waisenhaus', traumkeller: 'bg_traumkeller' });
Object.assign(ENCOUNTER_BACKGROUNDS, { ertrunkener: 'bg_kontor', traumfaden: 'bg_traumkeller', miss_wren: 'bg_traumkeller' });
/** Figuren: Finch und Molly (Lauf-Sheet, Portrait), Benji (Portrait), drei schlafwandelnde Kinder als Deko. */
for (const id of ['finch', 'molly']) {
  SHEETS[`m_${id}`] = `characters/M_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `m_${id}`;
  PORTRAITS[id] = `M_${id}_emotions.png`;
}
PORTRAITS.benji = 'M_benji_emotions.png';
for (const n of [1, 2, 3]) ANIM_SHEETS[`m_schlafkind_${n}`] = [`characters/M_schlafkind_${n}_walk.png`, 16, 32];
ANIM_SHEETS.m_benji = ['characters/M_benji_walk.png', 16, 32];
/** Fallgegenstände, Nahansichten, Hinweis-Marker, Fallakten und Enden. */
export const M_ITEMS = ['wasserprobe', 'pfaendungsbrief', 'kinder_murmel', 'schlaftee', 'schuldbuch', 'traumspule', 'silberschere'];
ICON32.push(...M_ITEMS);
INSPECT_VIEWS.push('schuldbuch', 'traumspule');
ANIM_SHEETS.m_hinweise = ['props/M_hinweise.png', 16, 16];
Object.assign(CASE_FILES, { case_07: 'M_akte_fall7', case_08: 'M_akte_fall8' });
for (const id of ['c7_heir', 'c7_wren', 'c8_perfect', 'c8_good', 'c8_early', 'c8_piper']) ENDING_IMAGES[id] = id;

// --- Paket O: Geheime Treffen (manifest-treffen.json) -----------------------------------------
/** Bote und die drei Gastgeber: Lauf-Sheet, Emotionsportrait (Kopf steht in HEADS). */
for (const id of ['schleierbote', 'tresswell', 'vellacourt', 'kohlenjem']) {
  SHEETS[`o_${id}`] = `characters/O_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `o_${id}`;
  PORTRAITS[id] = `O_${id}_emotions.png`;
}
/** Zirkel → Emblem/Einladung in ui/O_zirkel.png. */
export const ZIRKEL_URL = `${BASE}ui/O_zirkel.png`;
export const ZIRKEL_ICONS = { waage: [0, 2], kreide: [1, 3], russ: [2, 4] }; // [Emblem 32er-Spalte, Einladung 16er-Spalte]

// --- Paket N: Sequenz 6/5, Artefakte und Asservatenkammer (manifest-sequenzen2.json) -------------
// Tränke, Formeln und 16er-Icons ersetzen die Platzhalter unter gleichem Namen; hier kommt nur Neues dazu.
/** Fähigkeiten der Sequenzen 6 und 5: Effekt-Streifen (Animation "cast") und Icons in ui/skill_icons_2.png. */
Object.assign(SKILL_FX, {
  lichtbann: 48, fangnetz: 48, spiegelbild: 48, totenchor: 48, lebenselixier: 32, unbeugsam: 48, taschenspiel: 48,
  weissglut: 64, zerreissen: 64, maskenball: 64, stillgesang: 64, zersetzung: 48, hammerfall: 64, kehlschnitt: 48,
});
for (const id of ['lichtbann', 'fangnetz', 'spiegelbild', 'totenchor', 'lebenselixier', 'unbeugsam', 'taschenspiel',
  'weissglut', 'zerreissen', 'maskenball', 'stillgesang', 'zersetzung', 'hammerfall', 'kehlschnitt']) BATTLE_SHEETS[`fx_${id}`] = [`fx/fx_${id}.png`, SKILL_FX[id]];
SELF_FX.push('spiegelbild', 'lebenselixier', 'unbeugsam');
/** Fähigkeit → Zelle in ui/skill_icons_2.png (7 Pfadspalten x Sequenz 6/5). */
export const SKILL_ICONS_2 = Object.fromEntries([
  'lichtbann', 'fangnetz', 'spiegelbild', 'totenchor', 'lebenselixier', 'unbeugsam', 'taschenspiel',
  'weissglut', 'zerreissen', 'maskenball', 'stillgesang', 'zersetzung', 'hammerfall', 'kehlschnitt'].map((id, i) => [id, i]));
export const SKILL_ICONS_2_URL = `${BASE}ui/skill_icons_2.png`;
// --- Codex-Runde 7: Icons für alle Fähigkeiten (BZ, CA) ----------------------------------------
/** Zweite Kampffertigkeit je Sequenz (BZ): ui/skill_icons_3.png, 10 Pfadspalten x Sequenz 9..1. */
export const SKILL_ICONS_3 = Object.fromEntries([
  'dochtfunke', 'fadenzug', 'finte', 'fluestern', 'riechsalz', 'schulterstoss', 'griff_in_die_tasche', 'waage_pfandnahme', 'moor_torfschlag', 'uhr_vorgriff',
  'glutnadel', 'vorgefuehl', 'doppelgaenger', 'totenruf', 'rauchphiole', 'deckung', 'riegelgriff', 'waage_bleizunge', 'moor_namenslast', 'uhr_nachhinken',
  'signalfeuer', 'musterbruch', 'rollentausch', 'seelenfaden', 'laugenwurf', 'klingenbruch', 'schattenhaut', 'waage_frist', 'moor_schicht', 'uhr_pendel',
  'nebelriss', 'stolperfaden', 'zweite_haut', 'chorschild', 'destillat', 'hafenmauer', 'boersenschnitt', 'waage_ausgleich', 'moor_uferhalt', 'uhr_gangreserve',
  'flammenmantel', 'knotenloesung', 'gesichterwirbel', 'stillstand', 'wandlungstrunk', 'ambossschlag', 'siegelstich', 'waage_saldo', 'moor_luecke', 'uhr_fristschlag',
  'dochtschnitt', 'nahtriss', 'geliehene_miene', 'beschlagenes_wort', 'rueckstandsgift', 'nietenfaust', 'schwellentritt', 'waage_gewichtsschatten', 'moor_schichtdruck', 'uhr_zwischentakt',
  'aschenwort', 'bruchvorhersage', 'stehendes_gesicht', 'fremde_kehle', 'kreislaufsud', 'gegenlast', 'leerriegel', 'waage_halber_ton', 'moor_bodennamen', 'uhr_fristlauscher',
  'horizontglut', 'saumschnitt', 'leeres_gesicht', 'kuestenlaut', 'dampfstoss', 'traegerstoss', 'randsprung', 'waage_gegenbuchung', 'moor_vergessensrand', 'uhr_wiederkehr',
  'unbequeme_wahrheit', 'offener_knotenpunkt', 'eigenes_gesicht', 'letztes_zuhoeren', 'letzte_fraktion', 'bleibende_stuetze', 'offene_schwelle', 'waage_quittung', 'moor_fehlstelle', 'uhr_gewaehrte_minute'].map((id, i) => [id, i]));
export const SKILL_ICONS_3_URL = `${BASE}ui/skill_icons_3.png`;
/** Welt-Fähigkeiten (BZ): ui/talent_icons.png, 10 Pfadspalten x Sequenz 9..1. */
export const TALENT_ICONS = Object.fromEntries([
  'laternenschein', 'spur_lesen', 'gefaellige_miene', 'lauschen', 'kraeuterwickel', 'zaehne_zusammen', 'muenzen_finden', 'waage_druckstellen', 'moor_alte_spur', 'uhr_taktzaehlen',
  'ruhiges_licht', 'fadenblick', 'fremdes_gesicht', 'stille_bitte', 'beruhigender_sud', 'wachstand', 'schlossfluestern', 'waage_fairer_preis', 'moor_namen_sammeln', 'uhr_fruehe_minute',
  'wegleuchte', 'gewebe_lesen', 'feilschergesicht', 'nachhall', 'staerkende_tinktur', 'waffenpflege', 'schattenweg', 'waage_ruhige_hand', 'moor_aeltere_geschichte', 'uhr_zoegern',
  'klarer_blick', 'netz_spannen', 'unauffaellig', 'grabesstille', 'witterung', 'lastentraeger', 'nachtgang', 'waage_anteil', 'moor_bodenhaftung', 'uhr_anhalten',
  'wandelndes_signal', 'faden_zur_spur', 'gastgesicht', 'ohr_an_der_wand', 'schnellbrand', 'schmerzfrei', 'jede_tuer', 'waage_schuldschein', 'moor_torfgedaechtnis', 'uhr_naechster_schlag',
  'offene_lampe', 'nahtgefuehl', 'mietgesicht', 'stilleverwahrung', 'schichtung', 'standhaft', 'gute_beute', 'waage_pfandkoerper', 'moor_lesbare_haut', 'uhr_sekundenschatten',
  'aschenlese', 'bruchstellen', 'rollenverwahrung', 'nachruf', 'zehrende_wandlung', 'eingedrueckte_spur', 'spiegelhand', 'waage_saldenhut', 'moor_sediment', 'uhr_fristen',
  'lichtschranke', 'stadtgewebe', 'publikum_verlieren', 'schweigeufer', 'abwaerme', 'widerlager', 'innenrand', 'waage_zusagen', 'moor_ufer', 'uhr_zweiter_umriss',
  'fensterlicht', 'zusammenhang', 'hundert_gesichter', 'zuhoerstelle', 'kreislauf', 'stehender_schatten', 'unverwehrte_tuer', 'waage_erlass', 'moor_erinnertes', 'uhr_fehlender_strich'].map((id, i) => [id, i]));
export const TALENT_ICONS_URL = `${BASE}ui/talent_icons.png`;
/** Hauptfertigkeiten Sequenz 4..1 aller Pfade (CA): ui/skill_icons_hoch.png, 10 Spalten. */
export const SKILL_ICONS_HOCH = Object.fromEntries([
  'laterne_hoch_4', 'faden_hoch_4', 'maske_hoch_4', 'echo_hoch_4', 'kessel_hoch_4', 'eisen_hoch_4', 'schluessel_hoch_4', 'waage_hoch_4', 'moor_hoch_4', 'uhr_hoch_4',
  'laterne_hoch_3', 'faden_hoch_3', 'maske_hoch_3', 'echo_hoch_3', 'kessel_hoch_3', 'eisen_hoch_3', 'schluessel_hoch_3', 'waage_hoch_3', 'moor_hoch_3', 'uhr_hoch_3',
  'laterne_hoch_2', 'faden_hoch_2', 'maske_hoch_2', 'echo_hoch_2', 'kessel_hoch_2', 'eisen_hoch_2', 'schluessel_hoch_2', 'waage_hoch_2', 'moor_hoch_2', 'uhr_hoch_2',
  'laterne_hoch_1', 'faden_hoch_1', 'maske_hoch_1', 'echo_hoch_1', 'kessel_hoch_1', 'eisen_hoch_1', 'schluessel_hoch_1', 'waage_hoch_1', 'moor_hoch_1', 'uhr_hoch_1'].map((id, i) => [id, i]));
export const SKILL_ICONS_HOCH_URL = `${BASE}ui/skill_icons_hoch.png`;
/** Hauptfertigkeiten Sequenz 9..5 von Waage, Moor und Uhr (CA): ui/skill_icons_neu.png, 3 Spalten. */
export const SKILL_ICONS_NEU = Object.fromEntries([
  'waage_stufe_9', 'moor_stufe_9', 'uhr_stufe_9',
  'waage_stufe_8', 'moor_stufe_8', 'uhr_stufe_8',
  'waage_stufe_7', 'moor_stufe_7', 'uhr_stufe_7',
  'waage_stufe_6', 'moor_stufe_6', 'uhr_stufe_6',
  'waage_stufe_5', 'moor_stufe_5', 'uhr_stufe_5'].map((id, i) => [id, i]));
export const SKILL_ICONS_NEU_URL = `${BASE}ui/skill_icons_neu.png`;
/** Alle Fähigkeits-Atlanten: [Tabelle, URL, Spalten]. */
const SKILL_ATLASES = [[SKILL_ICONS, SKILL_ICONS_URL, 7], [SKILL_ICONS_2, SKILL_ICONS_2_URL, 7], [SKILL_ICONS_3, SKILL_ICONS_3_URL, 10],
  [SKILL_ICONS_HOCH, SKILL_ICONS_HOCH_URL, 10], [SKILL_ICONS_NEU, SKILL_ICONS_NEU_URL, 3]];
/** Icon einer Kampffertigkeit: [Bild-URL, Zelle, Spalten] oder null. */
export const skillIconOf = (id) => {
  for (const [table, url, cols] of SKILL_ATLASES) if (table[id] !== undefined) return [url, table[id], cols];
  return null;
};
/** Icon einer Welt-Fähigkeit: [Bild-URL, Zelle, Spalten] oder null. */
export const talentIconOf = (id) => (TALENT_ICONS[id] !== undefined ? [TALENT_ICONS_URL, TALENT_ICONS[id], 10] : null);
/** Verfluchte Artefakte und hohe Zutaten bekommen 32er-Icons (items/32/<id>.png). */
export const N_ARTIFACTS = ['uhr_ertrunkener', 'richterhammer', 'augenbinde_odile', 'bleiamulett', 'rahmenloser_spiegel', 'zahnkette',
  'hungriger_ring', 'knochenwuerfel', 'stille_glocke', 'kupferkrone', 'wachshand', 'schwarzes_herz'];
export const N_INGREDIENTS = ['flammenkern', 'lichtperle', 'knotengarn', 'spindelknochen', 'spiegelwachs', 'schminkasche', 'glockenerz',
  'atemglas', 'salamanderoel', 'goldschimmel', 'ambossstaub', 'schwertsplitter', 'dietrichsilber', 'schattenseide', 'nebelherz'];
ICON32.push(...N_ARTIFACTS, ...N_INGREDIENTS);
/** Pulsierende 16er-Icons (2 Frames nebeneinander). */
export const PULSE_ICONS = { nebelherz: `${BASE}items/nebelherz_pulse.png`, schwarzes_herz: `${BASE}items/schwarzes_herz_pulse.png` };
/** Artefakt-Oberfläche: Slots, Vor-/Nachteil-Marken, Unruhe-Leiste (ui/N_artefakt_ui.png, 128x64). */
export const ARTIFACT_UI_URL = `${BASE}ui/N_artefakt_ui.png`;
/** Asservatenwart Thale und Gutachterin Varga. */
for (const id of ['thale', 'varga']) {
  SHEETS[`n_${id}`] = `characters/N_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `n_${id}`;
  PORTRAITS[id] = `N_${id}_emotions.png`;
  HEADS.push(id);
}

// --- Paket Q: Wexmoor, erster Abschnitt von Kapitel 2 (manifest-wexmoor.json) --------------------
/** Zunder, Druce und die Grauspäher (deren Sheet hat eine fünfte Reihe: Laterne heben). */
for (const id of ['zunder', 'druce']) {
  SHEETS[`q_${id}`] = `characters/Q_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `q_${id}`;
  PORTRAITS[id] = `Q_${id}_emotions.png`;
  HEADS.push(id);
}
SHEETS.q_grauspaeher = 'characters/npc_grauspaeher.png';
CHARACTER_SHEETS.npc_grauspaeher = 'q_grauspaeher';
PORTRAITS.grauspaeher = 'Q_grauspaeher_emotions.png';

// --- Paket P: Rituale für Sequenz 6/5 (manifest-rituale.json) -----------------------------------
/** Ritualkreis pro Pfad (8 Frames à 64x64: 0–2 Aufbau, 3–7 Schleife) und Szenenkarte (96x128) für die Meldung. */
export const RITUAL_PATHS = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel'];
/** Paket AG: Ritualbilder auch für Waage, Moor und Uhr (ohne Ritual-Animation). */
const RITUAL_CARDS = [...RITUAL_PATHS, 'sq_waage', 'sq_moor', 'sq_uhr'];
for (const p of RITUAL_PATHS) ANIM_SHEETS[`ritual_${p}`] = [`fx/ritual_${p}.png`, 64, 64];
export const ritualCardUrl = (pid) => (RITUAL_CARDS.includes(pid) ? `${BASE}pathways/ritual_${pid}.png` : null);

// --- Paket R: Wexmoor-Orte, Figuren, Bosse und Bilder von Kapitel 2 (manifest-wexmoor2.json) ----
/** Acht Figuren mit Lauf-Sheet, Emotionsportrait und Notizbuchkopf. */
export const R_FIGURES = ['hesper', 'brack', 'pedell', 'sedge', 'wyle', 'lichtmann', 'hale', 'brandt'];
for (const id of R_FIGURES) {
  SHEETS[`r_${id}`] = `characters/R_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `r_${id}`;
  PORTRAITS[id] = `R_${id}_emotions.png`;
  HEADS.push(id);
}
/** Starling verblasst: zweites Portrait-Set (gleiche Reihenfolge der Stimmungen). */
PORTRAIT_SPECIAL.lichtmann_verblassend = ['R_lichtmann_verblassend_emotions.png', { neutral: 0, suspicious: 1, shocked: 2, smile: 3, faint_smile: 3 }];
/** Verkleidungen des Spielers: Lauf-Sheet je Kleidungsstück (Key player_<item>). */
export const DISGUISE_SHEETS = { torfkittel: 'r_spieler_torfkittel', fischerjacke: 'r_spieler_fischerjacke', akademierobe: 'r_spieler_akademierobe' };
for (const [id, key] of Object.entries(DISGUISE_SHEETS)) {
  SHEETS[key] = `characters/R_spieler_${id}.png`;
  CHARACTER_SHEETS[`player_${id}`] = key;
}
ICON32.push(...Object.keys(DISGUISE_SHEETS));
/** Bosse: die Namenlose (Vergessmoor) und das Leuchtfeuer (Finale, in Rage zweite Phase im selben Sheet). */
for (const id of ['namenlose', 'leuchtfeuer']) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, 96];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  ANIM_ALIASES[`enemy_${id}`] = { attack: 'attack_a', special: 'attack_b', cast: 'skill' };
  BOSS_INTROS[id] = `${id}_r`;
  BOSS_INTRO_IMAGES[`${id}_r`] = [`R_08_boss_${id}`, `ui/R_08_boss_${id}.png`];
}
ANIM_ALIASES.enemy_namenlose.phase2 = 'summon';
BOSS_FORMS.leuchtfeuer = 'enemy_leuchtfeuer';
BOSS_FORM_BACKGROUNDS.leuchtfeuer = 'bg_leuchtturm_oben';
const R_FX = { namenstafel: [32], moor_steigt: [96, 48], leuchtstrahl: [96, 32], ernte: [64], blendung: [96], lichter_frei: [96] };
for (const [id, [w, h = w]] of Object.entries(R_FX)) BATTLE_SHEETS[`fx_${id}`] = [`fx/fx_${id}.png`, w, h];
Object.assign(ENCOUNTER_FX, {
  namenlose: { attack: 'fx_namenstafel', multi: 'fx_moor_steigt', heavy: 'fx_ernte', won: 'fx_namenstafel' },
  leuchtfeuer: { attack: 'fx_leuchtstrahl', multi: 'fx_leuchtstrahl', heavy: 'fx_blendung', won: 'fx_lichter_frei' },
});
/** Kampfhintergründe der Wexmoor-Orte. */
for (const m of ['wx_bahnhof', 'wx_torfstich', 'wx_salzmarkt', 'wx_bojenhafen', 'wx_pfahldorf', 'wx_salzwatt', 'wx_altstadt', 'wx_kahn']) BATTLE_BACKGROUNDS[m] = 'bg_wx_stege';
for (const m of ['wx_oberstadt', 'wx_akademie', 'wx_lucent', 'wx_wachhaus', 'wx_zelle']) BATTLE_BACKGROUNDS[m] = 'bg_wx_oberstadt';
Object.assign(BATTLE_BACKGROUNDS, { wx_vergessmoor: 'bg_vergessmoor', wx_leuchtturm: 'bg_leuchtturm' });
Object.assign(ENCOUNTER_BACKGROUNDS, { namenlose: 'bg_vergessmoor', leuchtfeuer: 'bg_leuchtturm' });
/** Fallakte und Enden von Kapitel 2. */
CASE_FILES.kapitel2 = 'R_akte_kapitel2';
for (const id of ['k2_rein', 'k2_moor', 'k2_lichtmeister', 'k2_meer']) ENDING_IMAGES[id] = id;
/** Paket T: die 18 Mitglieder der Treffen-Auktionen (Lauf-Sheet, vier Portraits mit "bidding" als viertem, Kopf). */
export const T_MEMBERS = ['halloran', 'rusk', 'oddny', 'ferro', 'sallow', 'corve', 'ashdown', 'pemberley', 'dot', 'brann', 'cobb', 'sorrel',
  'docht', 'mareike', 'fenn', 'gischt', 'lake', 'tam'].map((n) => `tm_${n}`);
for (const id of T_MEMBERS) {
  SHEETS[`t_${id}`] = `characters/T_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `t_${id}`;
  PORTRAITS[id] = `T_${id}_emotions.png`;
  HEADS.push(id);
}
/** Auktions-Atlas (128x64): Bietehand, Zirkelmarken, Hammerschlag, Zuschlag. Region → [x, y, w, h]. */
export const AUKTION_URL = `${BASE}ui/T_auktion.png`;
export const AUKTION_REGIONS = {
  bid_0: [0, 0, 16, 16], bid_1: [16, 0, 16, 16], sold: [104, 32, 24, 24],
  gavel_0: [0, 32, 24, 24], gavel_1: [24, 32, 24, 24], gavel_2: [48, 32, 24, 24], gavel_3: [72, 32, 24, 24],
  waage: [40, 0, 12, 12], kreide: [56, 0, 12, 12], russ: [72, 0, 12, 12], lichtlose: [88, 0, 12, 12], salz: [104, 0, 12, 12],
};
/** Paket U: Constable Dunn (Kantine), Odile Crane und Ambrosius Quint (Gebäude) mit eigener Figur, Portrait und Kopf. */
export const U_FIGURES = ['dunn', 'crane', 'quint'];
for (const id of U_FIGURES) {
  SHEETS[`u_${id}`] = `characters/U_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `u_${id}`;
  PORTRAITS[id] = `U_${id}_emotions.png`;
  HEADS.push(id);
}

// --- Paket S: Wexmoor-Monster, Einzelgänger, Salzwatt, Zirkel (manifest-wexmoor3.json) -----------------
/** Monster aus Vergessmoor, Leuchtturm und Salzwatt: [Kampf-Frame, Karten-Frame-Breite]. */
export const S_ENEMIES = { torfgaenger: [64, 16], weisslicht: [64, 32], schlickaal: [64, 32], reetmann: [64, 16], glasmoewe: [64, 32],
  lichtbrut: [64, 32], linsensplitter: [64, 16], salzgeist: [64, 16], bojenglocke: [64, 16], nebelfischer: [64, 16] };
const S_FADING = ['weisslicht', 'salzgeist', 'nebelfischer', 'lichtbrut'];
for (const [id, [w, ow]] of Object.entries(S_ENEMIES)) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/S_ow_${id}.png`, ow, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  ANIM_ALIASES[`enemy_${id}`] = { attack: 'attack_a', special: 'attack_b' };
  if (S_FADING.includes(id)) FADING_SHEETS.push(`enemy_${id}`);
}
/** Boss des Salzwatts: die Glockenmutter (96er-Sheet). */
BATTLE_SHEETS.enemy_glockenmutter = ['battle/enemy_glockenmutter.png', 96];
ENCOUNTER_SHEETS.glockenmutter = 'enemy_glockenmutter';
ANIM_ALIASES.enemy_glockenmutter = { attack: 'tide_toll', special: 'chains', cast: 'lullaby', phase2: 'summon' };
BOSS_INTROS.glockenmutter = 'glockenmutter_s';
BOSS_INTRO_IMAGES.glockenmutter_s = ['S_08_boss_glockenmutter', 'ui/S_08_boss_glockenmutter.png'];
/** Bestiarium-Karten (ui/bestiary/S_<id>.png), auch für die Bosse aus Paket R. */
for (const id of [...Object.keys(S_ENEMIES), 'glockenmutter', 'namenlose', 'leuchtfeuer']) {
  BESTIARY_PACK[id] = 'S';
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
}
/** Einzelgänger: Lauf-Sheet, Portrait (neutral, freundlich, feindselig, erschrocken), Kopf, Kampf-Sheet (48er, "yields" statt Tod). */
export const S_LONERS = ['ez_reetkoenig', 'ez_brennerin', 'ez_spinnerin', 'ez_baender', 'ez_maskenwirt', 'ez_glockenfischer', 'ez_schleusendieb'];
export const S_HOSTS = ['zirkel_lichtlose', 'zirkel_salzbruder'];
const S_MOODS = { neutral: 0, friendly: 1, smile: 1, smiling: 1, faint_smile: 1, hostile: 2, angry: 2, suspicious: 2, shocked: 3 };
for (const id of [...S_LONERS, ...S_HOSTS]) {
  SHEETS[`s_${id}`] = `characters/S_${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `s_${id}`;
  PORTRAITS[id] = `S_${id}_emotions.png`;
  PORTRAIT_SPECIAL[id] = [`S_${id}_emotions.png`, S_MOODS];
}
for (const id of S_LONERS) {
  HEADS.push(id);
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, 48];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  ANIM_ALIASES[`enemy_${id}`] = { special: 'skill', cast: 'skill', defeated: 'yields' };
}
/** Zug-Portraits (ui/S_zug_portraits.png, 20 Spalten). */
['torfgaenger', 'weisslicht', 'schlickaal', 'reetmann', 'glasmoewe', 'lichtbrut', 'linsensplitter', 'salzgeist', 'bojenglocke', 'nebelfischer',
  'glockenmutter', 'namenlose', 'leuchtfeuer', ...S_LONERS].forEach((id, i) => {
  TURN_PORTRAITS[id] = i;
  TURN_PORTRAIT_URLS[id] = [`${BASE}ui/S_zug_portraits.png`, 20];
});
/** Gegner-Effekte. */
const S_FX = { namensraub: [48], schlick: [48], reetsamen: [48], glassplitter: [48], salzkruste: [32], nebelnetz: [48], flutlaeuten: [96, 48], ketten: [64, 48] };
for (const [id, [w, h = w]] of Object.entries(S_FX)) BATTLE_SHEETS[`fx_${id}`] = [`fx/fx_${id}.png`, w, h];
Object.assign(ENCOUNTER_FX, {
  torfgaenger: { attack: 'fx_namensraub' }, weisslicht: { attack: 'fx_namensraub' }, schlickaal: { attack: 'fx_schlick' },
  reetmann: { attack: 'fx_reetsamen' }, glasmoewe: { attack: 'fx_glassplitter' }, linsensplitter: { attack: 'fx_glassplitter' },
  salzgeist: { attack: 'fx_salzkruste' }, nebelfischer: { attack: 'fx_nebelnetz' },
  glockenmutter: { attack: 'fx_flutlaeuten', multi: 'fx_flutlaeuten', heavy: 'fx_ketten' },
});
/** Salzwatt: eigene Kulisse. */
BATTLE_BACKGROUNDS.wx_salzwatt = 'bg_salzwatt';
ENCOUNTER_BACKGROUNDS.glockenmutter = 'bg_salzwatt';
/** Beute und Artefakte (16er und 32er). */
export const S_ITEMS = ['torfasche', 'fremdlicht_phiole', 'schlickperle', 'reetfaser', 'moewenglas', 'linsenscherbe', 'laternenoel_alt', 'salzkristall',
  'bojenglocke_klein', 'leuchtturmlinse', 'namenstaefelchen', 'torfmesser_alt'];
ICON32.push(...S_ITEMS);
/** Einzelgänger-Anzeige (ui/S_einzelgaenger_ui.png, 128x96): Region → [x, y, w, h]. */
export const LONER_UI_URL = `${BASE}ui/S_einzelgaenger_ui.png`;
export const LONER_UI = {
  bar: [0, 0, 64, 8], enemy_fill: [64, 0, 32, 8], friend_fill: [96, 0, 32, 8], needle: [0, 16, 4, 10],
  enemy: [16, 16, 16, 16], wary: [32, 16, 16, 16], neutral: [48, 16, 16, 16], friend: [64, 16, 16, 16], ally: [80, 16, 16, 16],
  pip_empty: [64, 40, 6, 6], pip_filled: [72, 40, 6, 6],
};
/** Pfad → Siegelfarbe (8x8) in der Einzelgänger-Anzeige. */
export const LONER_SEALS = { laterne: [0, 40], faden: [8, 40], maske: [16, 40], echo: [24, 40], kessel: [32, 40], eisen: [40, 40], schluessel: [48, 40] };
/** Zirkel aus Wexmoor (ui/S_zirkel.png): Emblem 32x32 und Einladung 16x16. */
export const S_ZIRKEL_URL = `${BASE}ui/S_zirkel.png`;
export const S_ZIRKEL = { lichtlose: { emblem: [0, 0, 32, 32], invite: [64, 0, 16, 16] }, salz: { emblem: [32, 0, 32, 32], invite: [80, 0, 16, 16] } };

// --- Paket V: Elsbeth, Gasthaus Glocke, Price als Gegner (manifest-wexmoor4.json) --------------------
/** Elsbeth Rowe mit eigener Figur; Portrait-Spalten benommen, besorgt, erschrocken, erleichtert. */
SHEETS.v_elsbeth = 'characters/V_elsbeth_walk.png';
CHARACTER_SHEETS.npc_elsbeth = 'v_elsbeth';
PORTRAITS.elsbeth = 'V_elsbeth_emotions.png';
PORTRAIT_SPECIAL.elsbeth = ['V_elsbeth_emotions.png', { dazed: 0, neutral: 0, worried: 1, suspicious: 1, sad: 1, shocked: 2, relieved: 3, smile: 3, faint_smile: 3 }];
HEADS.push('elsbeth');
/** Constable Price in Wexmoor: eigenes Kampf-Sheet (Schlagstock, Laternenblitz, Pfeife). */
BATTLE_SHEETS.enemy_price = ['battle/enemy_price.png', 48];
ENCOUNTER_SHEETS.price_wx_fight = 'enemy_price';
ANIM_ALIASES.enemy_price = { attack: 'truncheon', special: 'lantern_flash', cast: 'whistle', phase2: 'whistle' };


// --- Paket W: Versunkene Altstadt, ihre Monster und der Bürgermeister (manifest-wexmoor5.json) ------
/** Monster der Altstadt: 64er-Kampf-Sheet, Kartenfigur 16x32. */
export const W_ENEMIES = ['pfahlbohrer', 'ratsherr', 'kellerkrebs', 'namensmade'];
for (const id of W_ENEMIES) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, 64];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/W_ow_${id}.png`, 16, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  ANIM_ALIASES[`enemy_${id}`] = { attack: 'attack_a', special: 'attack_b' };
}
FADING_SHEETS.push('enemy_ratsherr');
/** Boss: der Ertrunkene Bürgermeister (96er-Sheet, sieben Reihen). */
BATTLE_SHEETS.enemy_buergermeister = ['battle/enemy_buergermeister.png', 96];
ENCOUNTER_SHEETS.buergermeister = 'enemy_buergermeister';
ANIM_ALIASES.enemy_buergermeister = { attack: 'chain_lash', special: 'council_bell', cast: 'verdict' };
BOSS_INTROS.buergermeister = 'buergermeister_w';
BOSS_INTRO_IMAGES.buergermeister_w = ['W_boss_buergermeister', 'ui/W_boss_buergermeister.png'];
for (const id of [...W_ENEMIES, 'buergermeister']) {
  BESTIARY_PACK[id] = 'W';
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
}
[...W_ENEMIES, 'buergermeister'].forEach((id, i) => {
  TURN_PORTRAITS[id] = i;
  TURN_PORTRAIT_URLS[id] = [`${BASE}ui/W_zug_portraits.png`, 5];
});
/** Effekte: Holzsplitter, Ratssiegel, Madenwachs, Ratsglocke. */
const W_FX = { splitter: [48], siegel: [48], madenwachs: [48], ratsglocke: [96, 48] };
for (const [id, [w, h = w]] of Object.entries(W_FX)) BATTLE_SHEETS[`fx_${id}`] = [`fx/fx_${id}.png`, w, h];
Object.assign(ENCOUNTER_FX, {
  pfahlbohrer: { attack: 'fx_splitter' }, kellerkrebs: { attack: 'fx_splitter' }, ratsherr: { attack: 'fx_siegel' }, namensmade: { attack: 'fx_madenwachs' },
  buergermeister: { attack: 'fx_siegel', multi: 'fx_ratsglocke', heavy: 'fx_siegel' },
});
/** Altstadt: eigene Kulisse. */
BATTLE_BACKGROUNDS.wx_altstadt = 'bg_altstadt';
ENCOUNTER_BACKGROUNDS.buergermeister = 'bg_altstadt';
/** Beute und Questgegenstände (16er und 32er). */
export const W_ITEMS = ['pfahlholz', 'ratssiegel', 'krebspanzer', 'madenwachs', 'moortee', 'salzbrot', 'amtskette', 'veys_stimmgabel', 'schreintaefelchen'];
ICON32.push(...W_ITEMS);

// --- Batch X: Treffen-Artefakte, Fall 9 und restliche Platzhalter (manifest-platzhalter.json) ---------
/** Artefakte und Gegenstände mit 32er-Fassung (die 16er liegen unter items/<id>.png). */
export const X_ITEMS = ['nachtauge_brosche', 'bleierne_waage', 'kreidestummel', 'russfingerhut', 'salzrosenkranz', 'schwarzer_docht', 'doppelter_trauring',
  'glaesernes_ohr', 'pfandmarke_alt', 'kleine_moorlaterne', 'eiserne_zunge', 'spiegelmuenze', 'fahrkarte_wexmoor', 'wundertonikum', 'pells_maske',
  'egelhaken', 'ossuarklinge', 'sternsplitter', 'empfehlungsschreiben'];
ICON32.push(...X_ITEMS);
/** Artefakte der Fasserin (geheime Treffen) haben seit BO eigene Bilder in 16 und 32px. */
export const ARTISAN_ARTEFAKTE = ['krone_der_sieben', 'sternlicht_gespinst', 'glaskielfeder', 'herzkerze', 'perlenpaar', 'geisterspindel', 'leuchtturmmonokel', 'namenssiegel', 'gluehglocke', 'doppelsiegel'];
ICON32.push(...ARTISAN_ARTEFAKTE);
// --- BW: Innenräume (manifest-innen2.json): 19 animierte Props (32x32, 4 Frames), 6 Möbel-Sets, 10 Lesestellen-Bilder ----------
SHEETS.i2_anim = 'props/innen2_anim.png';
/** Zeile im Sheet = Reihenfolge hier; Wert = Bilder je Sekunde. */
export const I2_ANIMS = { kamin_klein: 6, kamin_mittel: 6, kamin_gross: 6, kerze: 6, leuchter: 6, petroleumlampe: 6, pendeluhr: 3, kanarienkaefig: 6, schreibmaschine: 6, kessel: 6,
  wasserhahn: 6, lampenfliegen: 6, katze: 3, hund: 3, schaukelstuhl: 6, zugvorhang: 6, ventilator: 6, grammophon: 6, fernschreiber: 6 };
Object.keys(I2_ANIMS).forEach((name, row) => { PROP_ANIMS[`i2_${name}`] = ['i2_anim', [0, 1, 2, 3].map((f) => [f * 32, row * 32, 32, 32]), I2_ANIMS[name]]; });
/** Möbel-Sets: je Sheet 4 x 2 Stücke à 32x32 (das letzte Feld sind Boden-/Wandkacheln und bleibt frei). */
export const I2_SETS = {
  buero: ['aktenregal', 'aktenregal_breit', 'pinnwand', 'schreibtisch', 'garderobe', 'waschtisch', 'sessel', null],
  revier: ['zelle', 'pult', 'asservatenschrank', 'wartebank', 'aktenschrank', 'garderobe_uniform', 'regal_asservaten', null],
  laden: ['theke', 'regal_waren', 'regal_flaschen', 'vitrine', 'kasse', 'waage', 'regal_klein', null],
  akademie: ['sternglobus', 'fernrohr', 'lesepult', 'karten_tisch', 'lesepult_lampe', 'buecherregal', 'regal_karten', null],
  speisewagen: ['polsterbank', 'polsterbank2', 'samowar_theke', 'gepaecknetz', 'zugtuer', 'klapptisch', 'klapptisch2', null],
  lohnbuero: ['schalter', 'tafel', 'aushang', 'pinnwand', 'schreibtisch', 'kartei', 'pult', null],
};
for (const [set, names] of Object.entries(I2_SETS)) {
  SHEETS[`i2_${set}`] = `props/innen2_moebel_${set}.png`;
  names.forEach((n, i) => { if (n) PROP_CELLS[`i2_${set}_${n}`] = [`i2_${set}`, (i % 4) * 32, Math.floor(i / 4) * 32, 32, 32]; });
}
/** Lesestellen-Bilder (240x135) für das Lesefenster: aus Titel oder Aufforderung geraten, wenn die Lesestelle kein eigenes Bild hat. */
export const LESE_SCENES = ['lese_brief', 'lese_kassenbuch', 'lese_zeitung', 'lese_wandanschlag', 'lese_kalkbrett', 'lese_telegramm', 'lese_sternkarte', 'lese_lohnzettel', 'lese_kinderzeichnung', 'lese_tagebuch'];
FX_SCENES.push(...LESE_SCENES);
const LESE_RULES = [
  [/telegramm|depesche/i, 'lese_telegramm'], [/sternkarte|himmelskarte|sternen/i, 'lese_sternkarte'], [/lohnzettel|lohnliste|lohnbuch|gehalt/i, 'lese_lohnzettel'],
  [/zeichnung|gemalt|kritzel/i, 'lese_kinderzeichnung'], [/tagebuch|notizbuch|journal/i, 'lese_tagebuch'], [/kalkbrett|kreidetafel|tafel|kreide/i, 'lese_kalkbrett'],
  [/zeitung|kurier|bote|kalkblatt|ausgabe/i, 'lese_zeitung'], [/anschlag|aushang|plakat|zettel|warnschild|schild|steckbrief|befehl|bekanntmachung/i, 'lese_wandanschlag'],
  [/brief|schreiben|nachricht|karte an|kuvert/i, 'lese_brief'], [/buch|register|akte|rechnung|quittung|beleg|liste|ordnung|vorschrift|protokoll|kehrbuch|verzeichnis/i, 'lese_kassenbuch'],
];
export const leseSceneOf = (text) => LESE_RULES.find(([re]) => re.test(text ?? ''))?.[1] ?? null;

/** BO: Oda Kessel selbst (Laufbild, Sitzbild mit Werkbank, Portraits, Kopf) und ihre Werkbank als Requisiten. */
SHEETS.fasserin = 'characters/fasserin_walk.png';
CHARACTER_SHEETS.npc_fasserin = 'fasserin';
PORTRAITS.fasserin = 'fasserin_emotions.png';
HEADS.push('fasserin');
ANIM_SHEETS.fasserin_sit = ['characters/fasserin_sit.png', 16, 32];
for (const id of ['fasserin_werkbank', 'fasserin_zangen']) { WHOLE_PROPS[id] = `props/${id}.png`; SHEETS[id] = `props/${id}.png`; }
/** Die zehn Vorrats-Rezepte (fass_*) zeigen laut BO weiter das Bild ihres Hauptbeutestücks. */
export const FASS_ICONS = { fass_aschenlicht: 'fremdlicht_phiole', fass_salzspange: 'moewenglas', fass_pfahlherz: 'laternenoel_alt', fass_kerbhuelse: 'madenwachs', fass_wattpendel: 'schlickperle',
  fass_pausendose: 'spieldose_klein', fass_regenzeuge: 'wachszylinder', fass_gassenfuchs: 'landkarte_alt', fass_schalenfunke: 'irrlichtfunke', fass_knochenkiel: 'schaedelsplitter' };
Object.assign(ITEM_ICON_ALIASES, FASS_ICONS);
/** Nerven-Artefakte (BY) und Konzentrations-Artefakte (BX) haben eigene Icons; die 14 Nerven-Artefakte auch in 32px (items/32/). */
export const NERVEN_ARTEFAKTE = ['taktgeber_uhrturm', 'kerze_der_nachtwache', 'zahnrad_schlafwandlerin', 'atemperle', 'fiebermuenze', 'blutsalz_phiole', 'knoechelring_preisboxer',
  'metronom_komponist', 'trommelfell_ausrufer', 'glasnerv', 'nervenfaden_weberin', 'moorzunder'];
ICON32.push(...NERVEN_ARTEFAKTE);
export const KONZENTRATION_ARTEFAKTE = ['siebter_fingerring', 'metronom_ohne_feder', 'schlagzaehler', 'hohle_krone', 'tickender_zahn', 'nadel_der_naeherin', 'gedankenkaefig', 'stummer_chor',
  'zweites_herz', 'rangierlinse', 'kreidezirkel', 'sanduhr_voll_asche', 'uhrwerkherz', 'knoechelrosenkranz', 'kerzenkrone', 'aschestundenglas'];
/** Fall 9: eigene Kampf-Sheets für Pratt, den Gesangbuchgeist, das Sternlicht und Starling. */
export const X_FIGHTS = { pratt_fight: ['pratt', 48], gesangbuchgeist: ['gesangbuchgeist', 64], sternlicht: ['sternlicht', 64], starling_fight: ['starling', 96] }; // Phase 2 (starling_stern): BS-Sheet, siehe unten
for (const [enc, [id, w]] of Object.entries(X_FIGHTS)) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w];
  ENCOUNTER_SHEETS[enc] = `enemy_${id}`;
  ANIM_ALIASES[`enemy_${id}`] = { attack: 'attack_a', special: 'attack_b' };
}
FADING_SHEETS.push('enemy_gesangbuchgeist', 'enemy_sternlicht');
ANIM_ALIASES.enemy_starling = { attack: 'brennglas', special: 'sternregen', cast: 'gestohlene_stimme', phase2: 'geliehener_schatten', defeated: 'fallender_stern_defeat' };
/** Boss-Büsten (160x160) für Starling und die vier Gebietsbosse. */
for (const id of ['starling_fight', 'starling_stern', 'moorkoenigin', 'rattenkoenig', 'ossuarwaechter', 'sternhirsch']) {
  const file = `X_08_boss_${id.startsWith('starling') ? 'starling' : id}`;
  BOSS_INTROS[id] = `${id}_x`;
  BOSS_INTRO_IMAGES[`${id}_x`] = [file, `ui/${file}.png`];
}
/** Zug-Portraits, die bisher fehlten: Fall 9, Sekten, Gefahrengebiete, Price. */
for (const [file, ids] of Object.entries({
  X_zug_portraits_fall9: ['pratt_fight', 'gesangbuchgeist', 'sternlicht', 'starling_fight'],
  X_zug_portraits_sekten: ['rost_schlaeger', 'rost_streife', 'rost_werfer', 'rost_schmied', 'rost_vater', 'schleier_novizin', 'schleier_messerin', 'schleier_schatten', 'schleier_seherin', 'schleier_mutter'],
  X_zug_portraits_gebiete: ['moorleiche', 'irrlicht', 'schlammegel', 'moorkoenigin', 'schnabelmaske', 'hustender', 'pestratte', 'rattenkoenig', 'knochenwurm', 'kerzenfresser', 'schaedelschwarm', 'ossuarwaechter', 'glaskraehe', 'kraterbrut', 'splitterling', 'sternhirsch'],
  X_zug_portrait_price: ['price_wx_fight'],
})) {
  ids.forEach((id, i) => {
    TURN_PORTRAITS[id] = i;
    TURN_PORTRAIT_URLS[id] = [`${BASE}ui/${file}.png`, ids.length];
  });
}
// Phase 2 des Finales nutzt Starlings Zug-Portrait
TURN_PORTRAITS.starling_stern = TURN_PORTRAITS.starling_fight;
TURN_PORTRAIT_URLS.starling_stern = TURN_PORTRAIT_URLS.starling_fight;
/**
 * BS: Starlings zweite Phase (`starling_stern`) als Sternsammler. 128x96-Kampf-Sheet (idle, attack, special, cast, hit,
 * phase_in beim Auftritt, defeat ohne Tod), aufgerissene Sternwarte als Kulisse, eigene Büste, Effekte (starling2_fx),
 * die Sterne der acht Fälle über einer HUD-Leiste (ein Stern je Runde, weil er mit jeder Runde heller wird),
 * pulsierende Kuppel und Bodenstreifen, Koop-Marken, Portraits und das Sequenzbild vor dem Kampf (manifest-starling2.json).
 */
BATTLE_SHEETS.enemy_starling2 = ['battle/starling2.png', 128, 96];
ENCOUNTER_SHEETS.starling_stern = 'enemy_starling2';
ANIM_ALIASES.enemy_starling2 = { hurt: 'hit', defeated: 'defeat', phase2: 'phase_in' };
ENCOUNTER_BACKGROUNDS.starling_stern = 'bg_sternwarte2';
BOSS_INTRO_IMAGES.starling_stern_x = ['X_08_boss_starling2', 'battle/X_08_boss_starling2.png'];
/** Zusatz-Sheets der zweiten Phase: Effekte, Sterne, Kuppel, Boden, HUD, Koop-Marken. */
export const STARLING2_SHEETS = { starling2_fx: ['fx/starling2_fx.png', 48, 48], starling2_sterne: ['fx/starling2_sterne.png', 16, 16], starling2_kuppel: ['fx/starling2_kuppel.png', 480, 135],
  starling2_boden: ['battle/starling2_boden.png', 480, 64], starling2_hud: ['ui/starling2_hud.png', 192, 48], starling2_koop: ['ui/starling2_koop.png', 48, 48] };
Object.assign(BATTLE_SHEETS, STARLING2_SHEETS);
/** Sternsammler-HUD (ui/starling2_hud.png): Leiste 192x16 (leer Zeile 0, gefüllt Zeile 1), acht Sockel je 12x9, Sterne der Fälle 1..8 = Frames 0..7 in starling2_sterne. */
export const STARLING2_HUD = { bar: [0, 0, 192, 16], barFull: [0, 16, 192, 16], sockets: [25, 45, 64, 83, 102, 120, 139, 158].map((x) => [x, 4, 12, 9]), stars: 8 };
ENCOUNTER_FX.starling_stern = { attack: 'starling2_fx:linse', multi: 'starling2_fx:stern_fall', heavy: 'starling2_fx:lanze_treffer', won: 'starling2_fx:glas_bruch', after: 'starling2_fx:ernte_aufstieg' };
/** Große Sheets behalten ihre Grundgröße (kein Boss-Zuschlag), sonst ragen sie aus dem Bild. */
export const BATTLE_SHEET_SCALE = { enemy_starling2: 1.8 };
/** Auftrittsanimation beim Kampfbeginn (statt sofort idle). */
export const ENTER_ANIMS = { enemy_starling2: 'phase2' };
/** Kulissen-Zusätze je Begegnung: Kuppel-Overlay (Animation), Bodenstreifen, Sternen-HUD, Koop-Marken. */
export const ENCOUNTER_STAGE = { starling_stern: { dome: ['starling2_kuppel', 'puls'], ground: 'starling2_boden', hud: 'starling2_hud', koop: 'starling2_koop' } };
PORTRAITS.starling2 = 'starling2_emotions.png';
PORTRAIT_SPECIAL.starling2 = ['starling2_emotions.png', { neutral: 0, triumphierend: 1, zweifelnd: 2, erloschen: 3 }];
FX_SCENES.push('starling_phase2');
/** Bestiarium-Karten (ui/bestiary/X_<id>.png). */
for (const id of ['pratt_fight', 'gesangbuchgeist', 'sternlicht', 'starling_fight', 'rost_schlaeger', 'rost_werfer', 'rost_schmied', 'rost_vater',
  'schleier_novizin', 'schleier_messerin', 'schleier_seherin', 'schleier_mutter']) {
  BESTIARY_PACK[id] = 'X';
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
}
/** Fallakte und Endbilder von Fall 9. */
CASE_FILES.case_09 = 'X_akte_fall9';
for (const id of ['c9_perfect', 'c9_good', 'c9_early', 'c9_vey']) ENDING_IMAGES[id] = id;
/** Sekten-Mitglieder mit eigenem Gesicht (neutral, misstrauisch, erschrocken, leichtes Lächeln). */
const X_MOODS = { neutral: 0, suspicious: 1, angry: 1, hostile: 1, shocked: 2, faint_smile: 3, smile: 3, friendly: 3 };
for (const id of ['rost_schlaeger', 'rost_werfer', 'rost_schmied', 'schleier_messerin', 'schleier_seherin']) {
  PORTRAITS[id] = `X_${id}_emotions.png`;
  PORTRAIT_SPECIAL[id] = [`X_${id}_emotions.png`, X_MOODS];
}

// --- Paket AA/AB mit Grafik aus Paket AJ (manifest-nebenquests.json) -------------------------------------
/** Neue Figuren der Nebenaufträge: Lauf-Sheet und Portrait (neutral, misstrauisch, erschrocken, Lächeln). */
export const AJ_FIGURES = ['kg_kopfgeld_siegelbrecher', 'kg_kopfgeld_schichtdieb', 'kg_kopfgeld_pfandvogt', 'k2n_eichmeisterin', 'k2n_zeichner', 'k2n_student', 'k2n_waerter'];
for (const id of AJ_FIGURES) {
  SHEETS[`aj_${id}`] = `characters/${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `aj_${id}`;
  PORTRAITS[id] = `${id}_emotions.png`;
}
/** Die drei Gesuchten kämpfen mit eigenem Sheet (48x48) und haben eine Bestiariumsseite. */
for (const id of ['kg_kopfgeld_siegelbrecher', 'kg_kopfgeld_schichtdieb', 'kg_kopfgeld_pfandvogt']) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, 48];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  BESTIARY_FILES[id] = id;
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
}
/** Gegenstände (16er unter items/<id>.png, 32er unter items/32). */
ICON32.push('kg_kerzenbund', 'kg_bleiorakel', 'k2n_pfandzettel', 'k2n_ivys_brief', 'k2n_brief_hesper', 'k2n_brief_druce', 'k2n_brief_pedell');
/** Ausbauten von Zunders Kahn als Requisiten (ganzes PNG, Fuß unten). */
export const KAHN_PROPS = ['k2n_kahn_reet', 'k2n_kahn_kiste', 'k2n_kahn_glocke', 'k2n_kahn_waschtisch', 'k2n_kahn_ofen', 'k2n_kahn_kartentisch'];
for (const id of KAHN_PROPS) {
  WHOLE_PROPS[id] = `props/${id}.png`;
  SHEETS[id] = `props/${id}.png`;
  PROP_ORIGINS[id] = 0.75;
}

// --- Paket AK: zusätzliche Gesichtsausdrücke (manifest-emotionen2.json) -----------------------------------
/** Figuren mit portraits/AK_<id>_emotions2.png: Spalten wütend 0, traurig 1, nachdenklich 2, entschlossen 3. */
export const AK_FIGURES = new Set(['player', 'marlowe', 'holt', 'pimm', 'greta', 'quill', 'kit', 'pip', 'hester', 'ivy', 'rook', 'price',
  'barnaby', 'miriam', 'oda_vey', 'mews', 'astronom', 'lichtmann', 'maud', 'ned', 'wick', 'souffleur', 'zunder', 'druce', 'sedge',
  'hale', 'brack', 'hesper', 'wyle', 'pedell', 'brandt', 'elsbeth']);
export const AK_MOODS_EN = { angry: 0, sad: 1, thoughtful: 2, determined: 3 };
export const AK_MOODS_DE = { wuetend: 0, zornig: 0, traurig: 1, nachdenklich: 2, entschlossen: 3 };
const akUrl = (id) => `${BASE}portraits/AK_${id}_emotions2.png`;

// --- Paket AH: eigene Figur für Spieler 2 (manifest-spieler2.json) ------------------------------------
/** Zwei Figuren zur Wahl: Laufen, Verkleidungen, Trinken, Kampf, Zugportrait und HUD-Kopf. */
export const P2_LOOKS = {
  p2a: { name: 'Schiebermütze', desc: 'Kurzer grüner Mantel, senfgelbes Halstuch, Notizbuch' },
  p2b: { name: 'Melone', desc: 'Langer ockerbrauner Mantel, Bart, runde Brille' },
};
export const P2_DEFAULT_LOOK = 'p2a';
for (const look of Object.keys(P2_LOOKS)) {
  SHEETS[`ah_${look}_walk`] = `characters/${look}_walk.png`;
  CHARACTER_SHEETS[look] = `ah_${look}_walk`;
  for (const id of Object.keys(DISGUISE_SHEETS)) {
    SHEETS[`ah_${look}_${id}`] = `characters/${look}_${id}.png`;
    CHARACTER_SHEETS[`${look}_${id}`] = `ah_${look}_${id}`;
  }
  ANIM_SHEETS[`${look}_drink`] = [`characters/${look}_drink.png`, 16, 32];
  BATTLE_SHEETS[`${look}_battle`] = [`battle/${look}_battle.png`, 48];
  BATTLE_SHEETS[`${look}_skills`] = [`battle/${look}_skills.png`, 48];
  BATTLE_SHEETS[`${look}_weapons`] = [`battle/${look}_weapons.png`, 48];
  TURN_PORTRAITS[look] = 0;
  TURN_PORTRAIT_URLS[look] = [`${BASE}ui/${look}_zug.png`, 1];
}
/** Lauf-Sheet einer Figur in Verkleidung (Texturschlüssel), sonst ihr Mantel. */
export const skinKeyOf = (base, worn) => (worn && DISGUISE_SHEETS[worn] ? `${base}_${worn}` : base);
/** Kampf-Sheets einer Figur: Grund, Zauberposen, Waffen. */
export const battleSheetsOf = (look) => (look ? { base: `${look}_battle`, skills: `${look}_skills`, weapons: `${look}_weapons` }
  : { base: 'battle_player', skills: 'battle_player_skills', weapons: 'battle_player_weapons' });
export const p2HeadUrl = (look) => `${BASE}ui/heads/${look}.png`;
export const p2PortraitUrl = (look) => `${BASE}portraits/${look}_emotions.png`;
/** Koop-Oberfläche (ui/AH_koop.png, 96x48) und Auswahlbild (ui/AH_wahl.png, 240x135). */
UI_SHEETS.ahkoop = ['ui/AH_koop.png', 96, 48];
UI_REGIONS.ahkoop = { beitreten: [0, 32, 16, 16], verlassen: [16, 32, 16, 16], tauschen: [32, 32, 16, 16], wiederbeleben: [48, 32, 16, 16], zusammen: [64, 32, 16, 16],
  p1_flag: [0, 0, 8, 8], p2_flag: [16, 0, 8, 8] };
export const P2_CHOICE_URL = `${BASE}ui/AH_wahl.png`;

// --- Paket AL: vier Wexmoorer Akten (data/packs/k2_akten) ---------------------------------------------
/** Senn, Veit und Noll kämpfen vorerst mit vorhandenen Sheets (docs/story/k2_akten/grafikwuensche.md); Vane und die gemalte Frau aus AO. */
Object.assign(ENCOUNTER_SHEETS, { k2a_tinte_kampf: 'enemy_kanalschmuggler', k2a_bittere_mittel_kampf: 'enemy_price', k2a_hafenrecht_kampf: 'enemy_kanalschmuggler' });
/** Lauf-Sheets der drei Auftraggeber: umgefärbte Vorratsfiguren (Senn aus ds_einwohner_6, Veit aus ds_einwohner_3, Noll aus ds_einwohner_1), bis eigene Grafik kommt. */
for (const id of ['k2a_senn', 'k2a_veit', 'k2a_noll']) {
  SHEETS[`al_${id}`] = `characters/${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `al_${id}`;
}
BATTLE_SHEETS.enemy_wxn_maler = ['battle/enemy_wxn_maler.png', 48];
BATTLE_SHEETS.enemy_gemalte_frau = ['battle/enemy_gemalte_frau.png', 64];
ANIM_ALIASES.enemy_wxn_maler = { attack: 'brush_slash', special: 'paint_throw' };
ANIM_ALIASES.enemy_gemalte_frau = { cast: 'emerge' };
FADING_SHEETS.push('enemy_gemalte_frau');

// --- Paket AO: elf neue Wexmoor-Figuren (manifest-wexmoor7.json) --------------------------------------
/** Acht Einwohner (AL, AM, AP) und drei Mitglieder der Täfelchengilde (AQ): Lauf-Sheet, Portrait, Kopf, AK-Gesichter. */
export const AO_FIGURES = ['wxn_bestatterin', 'wxn_lichtschreiber', 'wxn_torfgraeber', 'wxn_apothekerin', 'wxn_telegrafist',
  'wxn_hafenmeisterin', 'wxn_krabbe', 'wxn_maler', 'tm_esse', 'tm_kerbe', 'tm_mulde'];
for (const id of AO_FIGURES) {
  SHEETS[`ao_${id}`] = `characters/${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `ao_${id}`;
  PORTRAITS[id] = `${id}_emotions.png`;
  HEADS.push(id);
  AK_FIGURES.add(id);
  if (id.startsWith('tm_')) T_MEMBERS.push(id);
}
/** Staffelei des Malers: leer und mit dem Bild der gemalten Frau. */
for (const id of ['AO_staffelei', 'AO_staffelei_portraet']) {
  WHOLE_PROPS[id] = `props/${id}.png`;
  SHEETS[id] = `props/${id}.png`;
  PROP_ORIGINS[id] = 0.85;
}
/** Paket AQ: Waren der Täfelchengilde nutzen bis zu eigenen Icons die vorgeschlagenen Platzhalter. */
Object.assign(ITEM_ICON_ALIASES, { k2g_kerbstaub: 'torfasche', k2g_moorharz: 'salamanderoel', k2g_rufpastille: 'riechsalz',
  k2g_schreinbruehe: 'moortee', k2g_zeugenklammer: 'amulett_eisen', k2g_nachhallspule: 'spindelknochen' });

// --- Paket AN: Torfbrüche, Floßfriedhof, Lichtamt (manifest-wexmoor6.json) ----------------------------
/** Monster der Torfbrüche: [Kampf-Frame, Karten-Frame-Breite]. Kartenfiguren haben nur eine Laufreihe. */
export const AN_ENEMIES = { torfleiche: [64, 16], grubenlicht: [64, 32], torfwurm: [64, 32], schlickhund: [48, 32], moorbraut: [96, 32] };
for (const [id, [w, ow]] of Object.entries(AN_ENEMIES)) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/F_ow_${id}.png`, ow, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  ANIM_ALIASES[`enemy_${id}`] = { attack: 'attack_a', special: 'attack_b' };
  BESTIARY_FILES[id] = `AN_${id}`;
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
}
FADING_SHEETS.push('enemy_grubenlicht');
ANIM_ALIASES.enemy_moorbraut.phase2 = 'phase2';
BOSS_INTROS.moorbraut = 'moorbraut_an';
BOSS_INTRO_IMAGES.moorbraut_an = ['AN_boss_moorbraut', 'ui/AN_boss_moorbraut.png'];
BATTLE_BACKGROUNDS.wx_torfbrueche = 'bg_torfbrueche';
ENCOUNTER_BACKGROUNDS.moorbraut = 'bg_brautkammer';
/** Beute der Torfbrüche und der Brautkranz (16er und 32er). */
ICON32.push('schlickzahn', 'wurmseide', 'grubenglas', 'torfbernstein', 'brautschleier', 'brautring', 'brautkranz');
ITEM_ICON_ALIASES.k2o_amtsschluessel = 'amulett_schluessel';
/** Paket AP: Krabbes Fundstücke nutzen bis zu eigenen Icons die vorgeschlagenen Platzhalter. */
Object.assign(ITEM_ICON_ALIASES, { k2v_drucksplitter: 'schreintaefelchen', k2v_messingknopf: 'taschenuhr', k2v_fahrkartenhaelfte: 'fahrkarte_wexmoor',
  k2v_saumbrief: 'liebesbrief', k2v_tonnenholz: 'schreintaefelchen' });

// --- Paket AG: höhere Sequenzen und die drei neuen Pfade (manifest-sequenzen3.json) ---------------------
/** Effekte der Fähigkeiten: Seq 4–1 der sieben Pfade (<pfad>_hoch_<n>, auch für die neuen) und Seq 9–5 der neuen Pfade (<pfad>_stufe_<n>). Id = Fähigkeits-Id. */
export const AG_SKILL_FX = [];
for (const p of ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'waage', 'moor', 'uhr']) for (const n of [4, 3, 2, 1]) AG_SKILL_FX.push(`${p}_hoch_${n}`);
for (const p of ['waage', 'moor', 'uhr']) for (let n = 9; n >= 5; n--) AG_SKILL_FX.push(`${p}_stufe_${n}`);
for (const id of AG_SKILL_FX) {
  SKILL_FX[id] = 48;
  BATTLE_SHEETS[`fx_${id}`] = [`fx/sq_${id}.png`, 48];
}
/** Zauberposen der neuen Pfade (gleiche Figur wie battle_player_skills, Animation = Pfad-Id). */
BATTLE_SHEETS.battle_player_skills2 = ['battle/battle_player_skills2.png', 48];
/** Aura der neuen Pfade (Geistsicht), 48x64, Animation 'loop'. */
for (const p of ['waage', 'moor', 'uhr']) ANIM_SHEETS[`sq_aura_${p}`] = [`fx/sq_aura_${p}.png`, 48, 64];

// --- Kapitel 3 (AR/AS): Gegenstände ohne eigenes Bild nutzen die vorgeschlagenen Platzhalter --------------
Object.assign(ITEM_ICON_ALIASES, {
  k3o_kalkpastille: 'verband', k3o_schichttee: 'tonikum', k3o_filzverband: 'verband', k3o_ventilspan: 'glockenerz', k3o_kreidestaub: 'silberstaub',
  k3o_rufwachs: 'geisteressenz', k3o_schraubenzahn: 'glockenerz', k3o_schlagkern: 'salzkristall', k3o_trichterglas: 'glasauge', k3o_schichtknopf: 'ratssiegel',
  k3o_leitungsklemme: 'glockenerz', k3o_stillkiesel: 'salzkristall', k3o_stillring: 'amulett_eisen', k3o_prueflinse: 'glasauge',
  k3a_signalgeraet: 'fahrkarte_wexmoor', k3a_depotmarke: 'ratssiegel', k3a_leitungspruefer: 'amulett_eisen', k3a_bahnkarte: 'fahrkarte_wexmoor',
  k3a_werkzeuge: 'ratssiegel', k3a_aufsichtsmarke: 'ratssiegel',
});

// --- Kapitel 3: Dunscar (AV Orte, AW Figuren, AX Gegner; manifest-dunscar1/2/3.json) ----------------------
/** AW: die elf festen Figuren mit Lauf-Sheet, Portraits (vier plus AK-Stimmungen) und Kopf. */
export const DS_FIGURES = ['k3_pfiff', 'k3_gallowmere', 'k3_willa', 'k3_oren', 'k3_mabel', 'k3_pelham', 'k3_nellie', 'k3_huxford', 'k3_esther',
  'k3_adaine', 'k3_weichenstellerin'];
for (const id of DS_FIGURES) {
  SHEETS[`ds_${id}`] = `characters/${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `ds_${id}`;
  PORTRAITS[id] = `${id}_emotions.png`;
  HEADS.push(id);
  AK_FIGURES.add(id);
}
/** AX: sechs Gegner und fünf Bosse (Kampf-Sheet, Kartenfigur, Bestiarium, Bossbild). [Kampf-Frame-Breite, -Höhe] */
export const DS_ENEMIES = { schichtgaenger: [48], kalkstaubgeist: [64], signalkraehe: [48], lohnlistenmotte: [48], geruestklang: [64], nachhall: [64],
  schwellenhund: [96], vorhauer: [96], vielrufer: [96], gallowmere: [64], unterschicht: [128, 96] };
const DS_BOSSES = ['schwellenhund', 'vorhauer', 'vielrufer', 'gallowmere', 'unterschicht'];
for (const [id, [w, h = w]] of Object.entries(DS_ENEMIES)) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w, h];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/F_ow_${id}.png`, 16, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  ANIM_ALIASES[`enemy_${id}`] = { special: 'attack', cast: 'attack' };
  BESTIARY_FILES[id] = `F_${id}`;
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
}
for (const id of ['nachhall', 'kalkstaubgeist']) FADING_SHEETS.push(`enemy_${id}`);
for (const id of DS_BOSSES) {
  BOSS_INTROS[id] = `${id}_ds`;
  BOSS_INTRO_IMAGES[`${id}_ds`] = [`DS_boss_${id}`, `ui/DS_boss_${id}.png`];
}
/** Folgeabschnitte der Bosse zeigen dasselbe Sheet (Gallowmere 2, Unterschicht 2 und 3). */
for (const [id, base] of [['k3o_gallowmere_phase2', 'gallowmere'], ['k3o_unterschicht_phase2', 'unterschicht'], ['k3o_unterschicht_phase3', 'unterschicht']]) {
  ENCOUNTER_SHEETS[id] = `enemy_${base}`;
  BOSS_INTROS[id] = `${base}_ds`;
}
/** AV: Kampfkulissen der Viertel und Gefahrengebiete. */
for (const id of ['endbahnhof', 'schwellenring', 'arbeiterbogen', 'bruchstufen', 'rangierwueste', 'klopfbruch', 'rufschlucht', 'letzter_bahnsteig', 'unterschicht']) {
  BATTLE_BACKGROUNDS[`ds_${id}`] = `bg_ds_${id}`;
}
Object.assign(BATTLE_BACKGROUNDS, { ds_kalkmarkt: 'bg_ds_arbeiterbogen', ds_signalhang: 'bg_ds_bruchstufen', ds_nachtzug_wagen: 'bg_ds_nachtzug', ds_nachtzug_lok: 'bg_ds_nachtzug' });
// Paket AT (Kapitel 3 Nebenaufträge): Zunders vier Begleitbriefe nutzen vorerst Ivys Brief, bis eigene Icons kommen
for (const end of ['rein', 'moor', 'lichtmeister', 'meer']) ITEM_ICON_ALIASES[`k3n_brief_aus_wexmoor_brief_${end}`] = 'k2n_ivys_brief';
/** AU/AX: die zehn Prüfungsgegner (keine Bosse im Kampfsinn, aber mit Auftrittsbild). */
export const K3P_ENEMIES = ['lampengutachter', 'gegenzeugenknuepfer', 'garderobenpfaender', 'pausenfischer', 'chargenpruefer', 'brueckenpresser', 'zollriegel',
  'fristpfaender', 'schichtsammler', 'gangaufseher'].map((n) => `k3p_${n}`);
for (const id of K3P_ENEMIES) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, 64, 64];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/F_ow_${id}.png`, 16, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  ANIM_ALIASES[`enemy_${id}`] = { special: 'attack', cast: 'attack' };
  BESTIARY_FILES[id] = `F_${id}`;
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
}
for (const id of K3P_ENEMIES) {
  BOSS_INTROS[id] = `${id}_ds`;
  BOSS_INTRO_IMAGES[`${id}_ds`] = [`DS_boss_${id}`, `ui/DS_boss_${id}.png`];
}

// --- Kapitel 3: Handel und Schichtbund (BC Daten, BE Kunst; manifest-dunscar5.json) -------------------------
/** BE: die zwölf BC-Figuren mit Lauf-Sheet, Portraits (vier plus AK-Stimmungen) und Kopf (aus dem Atlas BE_koepfe geschnitten). */
export const BC_FIGURES = ['k3h_troedlerin', 'k3h_steinmetz', 'k3h_lampenwart', 'zirkel_schichtbund', 'tm_ds_lampe', 'tm_ds_kerbholz', 'tm_ds_stimme',
  'ez_ds_rangierer', 'ez_ds_kalkbrennerin', 'ez_ds_streckenlaeufer', 'ez_ds_walzenstimme', 'ez_ds_schrankenkind'];
export const BC_LONERS = BC_FIGURES.filter((id) => id.startsWith('ez_ds_'));
for (const id of BC_FIGURES) {
  SHEETS[`be_${id}`] = `characters/${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `be_${id}`;
  PORTRAITS[id] = `${id}_emotions.png`;
  HEADS.push(id);
  AK_FIGURES.add(id);
  if (id.startsWith('tm_')) T_MEMBERS.push(id);
}
/** Die fünf Dunscarer Einzelgänger kämpfen mit eigenem Sheet (48x48, Rückzug statt Tod), Kartenfigur und Bestiariumsseite. */
for (const id of BC_LONERS) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, 48];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/F_ow_${id}.png`, 16, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  ANIM_ALIASES[`enemy_${id}`] = { cast: 'special' };
  BESTIARY_FILES[id] = `F_${id}`;
}
/** Schichtbund-Atlas (256x128): Kerbholzwand, Stempeltisch, Walzenregal, Lampenreihe, Bank, Bodenmarke, Stadtkarten-Pin. */
export const BE_SCHICHTBUND_URL = `${BASE}props/BE_schichtbund.png`;
export const BE_SCHICHTBUND_REGIONS = { kerbholz_wand: [0, 0, 48, 48], stempeltisch: [64, 0, 32, 32], walzenregal: [128, 0, 32, 48], lampenreihe: [192, 0, 64, 16],
  versammlungsbank: [0, 64, 48, 16], bodenmarke: [64, 64, 16, 16], stadtkarten_pin: [128, 64, 16, 16] };
/** Stadtkarten-Pin des Schichtbund-Treffens: Feld 72 im 16er-Raster des Atlas (Spalte 8, Zeile 4). */
export const BE_MAP_MARKERS = { treffen_schichtbund: [BE_SCHICHTBUND_URL, 72, 16, false, { rows: 8, row: 4 }] };
/** Drei Werkstätten der Händler als ganze Props. */
for (const id of ['BE_troedelstand', 'BE_steinmetzwerkbank', 'BE_schaltbuden_theke', 'BE_lichtkegel']) {
  WHOLE_PROPS[id] = `props/${id}.png`;
  SHEETS[id] = `props/${id}.png`;
}
/** Dunscar-Gegenstände (CB, Batch icons3): 35 eigene Icons; Ausrüstung, Fundstücke und Gaben auch in 32px. */
export const CB_ITEMS = ['k3h_schichtkappe', 'k3h_staubhaube', 'k3h_rangiermantel', 'k3h_taschenrock', 'k3h_feierabendmarke', 'k3h_kupplungsring', 'k3h_faeustel', 'k3h_steinmeissel',
  'k3h_hilfe_laterne', 'k3h_hilfe_faden', 'k3h_hilfe_maske', 'k3h_hilfe_echo', 'k3h_hilfe_kessel', 'k3h_hilfe_eisen', 'k3h_hilfe_schluessel', 'k3h_hilfe_sq_waage', 'k3h_hilfe_sq_moor', 'k3h_hilfe_sq_uhr',
  'k3h_namenstaefelchen', 'k3h_kerbholz', 'k3h_mantelzettel', 'ez_ds_rangierer_gabe', 'ez_ds_kalkbrennerin_gabe', 'ez_ds_streckenlaeufer_gabe', 'ez_ds_walzenstimme_gabe', 'ez_ds_schrankenkind_gabe',
  ...Array.from({ length: 9 }, (_, i) => `k3e_ausgabe_${i + 1}`)];
export const CB_ITEMS_32 = ['k3h_schichtkappe', 'k3h_staubhaube', 'k3h_rangiermantel', 'k3h_taschenrock', 'k3h_feierabendmarke', 'k3h_kupplungsring', 'k3h_faeustel', 'k3h_steinmeissel',
  'k3h_namenstaefelchen', 'k3h_kerbholz', 'k3h_mantelzettel', 'ez_ds_rangierer_gabe', 'ez_ds_kalkbrennerin_gabe', 'ez_ds_streckenlaeufer_gabe', 'ez_ds_walzenstimme_gabe', 'ez_ds_schrankenkind_gabe'];
ICON32.push(...CB_ITEMS_32);

// --- Kapitel 3: Leben in Dunscar (BD Daten; BE Figuren und Kopfgeldgegner, BA Stände, Tiere und Wetter) ----------
/** BE: acht Einwohner und zwei Aufseher (Lauf-Sheet, Kopf aus BE_koepfe); dazu die Nachtschicht-Fassungen zweier Einwohner als Schichtgänger. */
export const BD_FIGURES = ['k3e_schichtwitwe', 'k3e_kalkjunge', 'k3e_wagenputzer', 'k3e_zeitungsfrau', 'k3e_bahnbettler', 'k3e_steinmetzgeselle', 'k3e_teesaalgast', 'k3e_signalkind',
  'k3e_aufseher_a', 'k3e_aufseher_b'];
for (const id of BD_FIGURES) {
  SHEETS[`be_${id}`] = `characters/${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `be_${id}`;
  HEADS.push(id);
}
for (const id of ['k3e_wagenputzer_schicht', 'k3e_steinmetzgeselle_schicht']) {
  SHEETS[`be_${id}`] = `characters/${id}.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `be_${id}`;
}
/** BE: die sechs Kopfgeld-Ziele (Kampf-Sheet, Kartenfigur, Bestiarium, Steckbrief); der Signalbrecher ist 64 groß, der Staubschmuggler hat eine Elite-Fassung. */
export const K3K_ENEMIES = ['k3k_kupferdieb', 'k3k_schienenlaeufer', 'k3k_lohnfaelscher', 'k3k_staubschmuggler', 'k3k_walzenhehler', 'k3k_signalbrecher'];
for (const id of K3K_ENEMIES) {
  const w = id === 'k3k_signalbrecher' ? 64 : 48;
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w, w];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/F_ow_${id}.png`, 16, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  ANIM_ALIASES[`enemy_${id}`] = { cast: 'special' };
  BESTIARY_FILES[id] = `F_${id}`;
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
}
BATTLE_SHEETS.enemy_k3k_staubschmuggler_elite = ['battle/enemy_k3k_staubschmuggler_elite.png', 48, 48];
ENCOUNTER_SHEETS.k3k_staubschmuggler_elite = 'enemy_k3k_staubschmuggler_elite';
OVERWORLD_SHEETS.k3k_staubschmuggler_elite = OVERWORLD_SHEETS.k3k_staubschmuggler;
ANIM_ALIASES.enemy_k3k_staubschmuggler_elite = { cast: 'special' };
ENCOUNTER_SHEETS.k3k_signalbrecher_phase2 = 'enemy_k3k_signalbrecher';
/** BE: Steckbriefe der Bahnaufsicht (48x64, ein Bild; „gefasst“ wird gegraut statt mit zweitem Bild). */
export const WANTED_SINGLE = Object.fromEntries(K3K_ENEMIES.map((id) => [id, `ui/BE_steckbrief_${id}.png`]));
/** BA: Ruth Bellwick (k3n_secondhaendler) mit eigener Figur, Portrait, AK-Stimmungen und Kopf (bisher Hespers Figur). */
SHEETS.ba_k3n_secondhaendler = 'characters/k3n_secondhaendler_walk.png';
CHARACTER_SHEETS.npc_k3n_secondhaendler = 'ba_k3n_secondhaendler';
PORTRAITS.k3n_secondhaendler = 'k3n_secondhaendler_emotions.png';
HEADS.push('k3n_secondhaendler');
AK_FIGURES.add('k3n_secondhaendler');
/** BA: zehn Marktstände (32x32, zwei Bilder: offen/geschlossen) als Lesestellen auf Kalkmarkt und Arbeiterbogen. */
ANIM_SHEETS.BA_staende = ['props/BA_staende.png', 32, 32];
PROP_ORIGINS.BA_staende = 0.9;
export const BA_STAENDE = ['stand_kreide', 'stand_kalkpastillen', 'stand_troedel', 'stand_stein', 'stand_tee', 'stand_werkzeug', 'stand_kartoffeln', 'stand_zeitungen', 'stand_kerzen', 'stand_flickzeug'];
/** BA: Tiere und Wetter (fx/BA_dunscar_tiere.png, fx/BA_dunscar_wetter.png), Regionen → [x, y, w, h, Frames, fps]; genutzt in world/DunscarLife.js. */
export const BA_LIFE_KEY = 'ba_tiere';
export const BA_WEATHER_KEY = 'ba_wetter';
export const BA_TIERE = {
  ds_kraehe_sitzen: [0, 0, 16, 16, 2, 4], ds_kraehe_auffliegen: [0, 16, 16, 16, 4, 8], ds_kraehe_fliegen: [0, 32, 16, 16, 4, 8],
  ds_kalkziege_stehen: [0, 48, 16, 16, 2, 4], ds_kalkziege_laufen: [0, 64, 16, 16, 4, 8], ds_kalkziege_klettern: [0, 80, 16, 32, 2, 8],
  ds_staubteufel: [0, 112, 16, 32, 6, 8], ds_motte_kreisen: [0, 144, 16, 16, 4, 8],
  ds_eidechse_sitzen: [0, 160, 16, 16, 2, 4], ds_eidechse_huschen: [0, 176, 16, 16, 4, 8],
  ds_schwalbe_fliegen: [0, 192, 16, 16, 4, 8], ds_schwalbe_sitzen: [0, 208, 16, 16, 2, 4],
};
export const BA_WETTER = { kalkstaub: [0, 0, 240, 135, 4, 5], nachtnebel_1: [0, 144, 240, 135, 1, 1], nachtnebel_2: [0, 288, 240, 135, 1, 1], wind_grasbueschel: [0, 432, 16, 16, 4, 5] };

// --- BQ/BR: Sekten (Aschenbund, Flutkinder, Stummer Chor) aus manifest-sekten.json --------------------------------
export const SK_KULTE = ['sk_asche', 'sk_flut', 'sk_chor'];
export const SK_KURZ = { sk_asche: 'asche', sk_flut: 'flut', sk_chor: 'chor' };
export const SK_RAENGE = ['novize', 'sprecher', 'hand', 'haupt'];
export const SK_FIGUREN = ['sk_asche_sprecher_ida', 'sk_asche_aussteiger_tobin', 'sk_asche_opfer_wenz', 'sk_flut_sprecher_maren', 'sk_flut_aussteiger_pell', 'sk_flut_opfer_lotte',
  'sk_chor_sprecher_ansgar', 'sk_chor_aussteiger_rike', 'sk_chor_opfer_jost'];
export const SK_ITEMS = ['ski_aschensiegel', 'ski_glutkohle', 'ski_flutknoten', 'ski_bojenoel', 'ski_chorkreide', 'ski_stimmwachs', 'ski_laeuterwasser', 'ski_seilschnitt', 'ski_stimmwachs_rein',
  'ski_art_aschenring', 'ski_art_flutkompass', 'ski_art_chorstimmgabel'];
const SK_MOODS = { neutral: 0, misstrauisch: 1, suspicious: 1, skeptical: 1, erschrocken: 2, shocked: 2, leichtes_laecheln: 3, smile: 3, faint_smile: 3, friendly: 3 };
/** Kampf-Sheets: Novize 48, Sprecher/Hand 64, Haupt 96 (Reihen idle/attack/hit/end, Haupt dazu phase2). */
export const SK_ENEMY_SIZE = { novize: 48, sprecher: 64, hand: 64, haupt: 96 };
for (const k of SK_KULTE) {
  for (const r of SK_RAENGE) {
    const id = `${k}_${r}`;
    SHEETS[id] = `characters/${id}.png`;
    CHARACTER_SHEETS[`npc_${id}`] = id;
    BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, SK_ENEMY_SIZE[r]];
    ENCOUNTER_SHEETS[`enemy_${id}`] = `enemy_${id}`;
    ANIM_ALIASES[`enemy_${id}`] = { hurt: 'hit', defeated: 'end', special: 'attack', cast: 'attack' };
    BESTIARY_FILES[`enemy_${id}`] = `enemy_${id}`;
    if (!BESTIARY.includes(`enemy_${id}`)) BESTIARY.push(`enemy_${id}`);
  }
  ANIM_SHEETS[`${k}_haupt_aura`] = [`characters/${k}_haupt_aura.png`, 32, 48];
  SHEETS[`sk_schrein_${SK_KURZ[k]}`] = `props/sk_schrein_${SK_KURZ[k]}.png`;
  PROP_CELLS[`sk_schrein_${SK_KURZ[k]}_base`] = [`sk_schrein_${SK_KURZ[k]}`, 0, 0, 48, 48];
  PROP_ANIMS[`sk_schrein_${SK_KURZ[k]}_effekt`] = [`sk_schrein_${SK_KURZ[k]}`, [0, 1, 2, 3].map((f) => [f * 16, 48, 16, 16]), 7];
}
for (const id of SK_FIGUREN) {
  SHEETS[id] = `characters/${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = id;
  PORTRAITS[id] = `${id}_emotions.png`;
  PORTRAIT_SPECIAL[id] = [`${id}_emotions.png`, SK_MOODS];
  HEADS.push(id);
}
ICON32.push(...SK_ITEMS);
SHEETS.sk_zeichen = 'props/sk_zeichen.png';
SHEETS.sk_sabotage = 'props/sk_sabotage.png';
/** Erkennungszeichen je Kult (Spur, Türmarkierung, Hausmarke, entfernt) und Sabotageobjekte, 16x16 aus den Bögen. */
export const SK_ZEICHEN = { asche: ['kreis', 'tuerrahmen', 'russhand', 'entfernt'], flut: ['knoten', 'fussspur', 'bojenmarke', 'entfernt'], chor: ['kreidemund', 'notenlinie', 'lippen', 'entfernt'] };
Object.entries(SK_ZEICHEN).forEach(([k, names], row) => names.forEach((n, i) => { PROP_CELLS[`sk_zeichen_${k}_${n}`] = ['sk_zeichen', i * 16, row * 16, 16, 16]; }));
export const SK_SABOTAGE = ['brunnen', 'laterne', 'faehre', 'bahnhebel', 'briefkasten', 'boje', 'chorplatz', 'haus'];
SK_SABOTAGE.forEach((n, i) => { PROP_CELLS[`sk_sabotage_${n}`] = ['sk_sabotage', (i % 4) * 16, Math.floor(i / 4) * 16, 16, 16]; });
ANIM_SHEETS.sk_ereignis = ['fx/sk_ereignis.png', 32, 32]; // Ereignis-Effekt je Kult: Reihen asche/flut/chor (manifest-sekten)
UI_SHEETS.skumtriebe = ['ui/sk_umtriebe.png', 80, 48];
UI_REGIONS.skumtriebe = Object.fromEntries(SK_KULTE.flatMap((k, row) => [...[0, 1, 2, 3].map((s) => [`${SK_KURZ[k]}_${s}`, [s * 16, row * 16, 16, 16]]), [`${SK_KURZ[k]}_niedergeschlagen`, [64, row * 16, 16, 16]]]));
UI_SHEETS.skpins = ['ui/sk_karte_pins.png', 36, 24];
UI_REGIONS.skpins = Object.fromEntries(SK_KULTE.flatMap((k, col) => [[`${SK_KURZ[k]}_normal`, [col * 12, 0, 12, 12]], [`${SK_KURZ[k]}_aktiv`, [col * 12, 12, 12, 12]]]));
export const SK_PINS_URL = `${BASE}ui/sk_karte_pins.png`;

// --- Paket BT: Wexmoor sieht nach Wexmoor aus (props/wexmoor_v2_*.png, fx/wexmoor_v2_tileanim.png) ---
SHEETS.wx2_props = 'props/wexmoor_v2_props.png';
SHEETS.wx2_gross = 'props/wexmoor_v2_gross.png';
SHEETS.wx2_anim = 'props/wexmoor_v2_anim.png';
SHEETS.wx2_tileanim = 'fx/wexmoor_v2_tileanim.png';
/** Straßenmöbel 16x16 (8x6-Raster), Texture-Key wx2_<name>. */
export const WX2_PROPS = ['bojenlaterne_an', 'bojenlaterne_aus', 'pfahlpoller', 'taurolle', 'salzfass', 'torfkarre', 'netz', 'reuse',
  'fischkiste', 'gelaender_h', 'gelaender_v', 'gangway_h', 'gangway_v', 'pricke', 'nebelhorn', 'boje',
  'anker', 'haken', 'eimer', 'salzsack', 'torfsode', 'wollgras', 'schilf', 'treibholz',
  'seilpfahl', 'muschelkorb', 'aalkorb', 'fischfass', 'rettungsring', 'stiefel', 'reusenleine', 'pegelpfahl',
  'kalktopf', 'teereimer', 'paddel', 'ruder', 'klappbruecke', 'schleusenhebel', 'kleiner_kran', 'ankerwinde',
  'kistenstapel', 'salzlampe', 'schuppenplane', 'fischgestell', 'briefkasten', 'wasserpumpe', 'bojenstange', 'moorpflanze'];
WX2_PROPS.forEach((n, i) => { PROP_CELLS[`wx2_${n}`] = ['wx2_props', (i % 8) * 16, Math.floor(i / 8) * 16, 16, 16]; });
/** Große Props 32x32 (4x4-Raster), Texture-Key wx2g_<name>. */
export const WX2_GROSS = ['kahn', 'torfstapel', 'kran', 'schleusenrad', 'fischkutter', 'salzwagen', 'netzgestell', 'torfkarre',
  'gangway', 'schleusentor', 'bojenmast', 'holzstapel', 'salzberg', 'reusengruppe', 'nebelhorn', 'rettungsboot'];
WX2_GROSS.forEach((n, i) => { PROP_CELLS[`wx2g_${n}`] = ['wx2_gross', (i % 4) * 32, Math.floor(i / 4) * 32, 32, 32]; PROP_ORIGINS[`wx2g_${n}`] = 0.85; });
/** Animierte Props (4 Frames je Zeile), Anim-Key wx2a_<name>. */
export const WX2_ANIMS = ['laterne', 'netz', 'reuse', 'boje', 'schilf', 'nebelhorn'];
WX2_ANIMS.forEach((n, row) => { PROP_ANIMS[`wx2a_${n}`] = ['wx2_anim', [0, 1, 2, 3].map((f) => [f * 16, row * 16, 16, 16]), 6]; });
/** Güterbahnhof Wexmoor: Bank, Karren, Kiosk, Säule und Uhr aus dem neuen Blatt (gleiche Plätze wie c_bahn_*). */
Object.entries({ bank: [0, 64, 32, 16], karren: [32, 64, 32, 16], kiosk: [64, 64, 32, 32], dach: [96, 64, 16, 16], dachecke: [112, 64, 16, 16], saeule: [0, 80, 16, 48], uhr: [16, 80, 16, 48] })
  .forEach(([n, c]) => { PROP_CELLS[`wx2_bahn_${n}`] = ['c_bahnhof_wx', ...c]; });
/** Vier-Phasen-Animationen für Wasser, Geisterlicht, Nebel, Lichtrisse und Salzschimmer (4 Spalten x 9 Zeilen). */
export const WX2_TILE_ANIM_NAMES = ['water_0', 'water_1', 'water_2', 'water_3', 'ghost_reflection', 'mist', 'cracks_1', 'cracks_2', 'shimmer'];
export const WX2_TILE_ANIM_KEYS = WX2_TILE_ANIM_NAMES.flatMap((n, row) => [0, 1, 2, 3].map((f) => `wx2anim_${n}_${f}`));
WX2_TILE_ANIM_NAMES.forEach((n, row) => [0, 1, 2, 3].forEach((f) => { TILE_CELLS[`wx2anim_${n}_${f}`] = ['wx2_tileanim', row * 4 + f]; }));
/** Welche Themen-Tiles animiert werden: Thema → Gruppe → Animationsname je Zelle (Reihenfolge wie in THEME_TILES). */
export const WX2_TILE_ANIMS = {
  r_wexmoor: { water: ['water_0', 'water_1', 'water_2', 'water_3'] },
  r_vergessmoor: { water: ['water_0', 'water_1', 'water_2', 'water_3'], ghost: ['ghost_reflection'] },
  r_leuchtturm: { ring: ['cracks_1', 'cracks_2'] },
  s_salzwatt: { water: ['shimmer', 'shimmer'] },
};
/** Begehbar bleiben nur die Lichtrisse im Leuchtturm. */
export const WX2_TILE_ANIM_WALKABLE = ['cracks_1', 'cracks_2'];

// --- Paket BU: sichtbare Ausrüstung, Kampfkulissen, Koop-Oberfläche (manifest-ausruestung2.json) ---
/** Figuren mit Overlay-Sheets: Ermittler und die beiden Gesichter von Spieler 2. */
export const GEAR_FIGURES = ['player', 'p2a', 'p2b'];
/** Slot → Items mit Overlay (characters/gear/<figur>_<slot>_<item>.png, 64x128 wie das Lauf-Sheet). */
export const GEAR_ITEMS = {
  weapon: ['spazierstock', 'schlagstock', 'stockdegen', 'glockenzunge', 'silberschere', 'messingschlagring', 'brecheisen', 'laterne_kampf', 'regenschirmdegen',
    'revolver', 'knochenmesser', 'kette_rauchfass', 'taktstock_silber', 'stimmgabel_gross', 'sternglasdolch', 'taktstock_vey'],
  hut: ['hut_schirmmuetze', 'hut_melone', 'hut_zylinder', 'hut_helm', 'hut_kapuze', 'hut_schutzbrille', 'hut_witwenschleier', 'hut_maske', 'hut_schnabel', 'hut_chor', 'hut_maskenball', 'geweihreif'],
  mantel: ['mantel_wolle', 'mantel_gewachst', 'mantel_flicken', 'mantel_samt', 'mantel_polizei', 'mantel_leder', 'mantel_chor', 'mantel_nebel', 'mantel_moor', 'mantel_giesser', 'mantel_frack'],
};
const GEAR_SLOT_EN = { weapon: 'weapon', hut: 'hat', mantel: 'coat' };
/** Reihenfolge von unten nach oben: Mantel, Amulett, Waffe, Hut, Korruptionsfaden. */
export const GEAR_ORDER = { mantel: 0.2, amulett: 0.3, weapon: 0.4, hut: 0.5, korruption: 0.6 };
/** Datei eines Overlays (relativ zu sprites/), null wenn es keins gibt. */
export function gearFile(figure, slot, item) {
  if (!GEAR_FIGURES.includes(figure)) return null;
  if (slot === 'amulett') return item ? `characters/gear/${figure}_amulet.png` : null;
  if (slot === 'korruption') return 'characters/gear/korruption_overlay.png';
  return GEAR_ITEMS[slot]?.includes(item) ? `characters/gear/${figure}_${GEAR_SLOT_EN[slot]}_${item}.png` : null;
}
export const gearKey = (file) => `gear_${file.slice('characters/gear/'.length, -4)}`;

/** Kampfkulissen aus BU; vier davon mit Nachtfassung (BATTLE_BACKGROUNDS_NIGHT, CombatScene wählt nach der Uhr). */
Object.assign(BATTLE_BACKGROUNDS, {
  ds_schwellenring: 'bg_ds_schwellenring_bu', ds_rangierwueste: 'bg_ds_rangierwueste_bu', ds_lohnbuero: 'bg_ds_lohnbuero', ds_signalhang: 'bg_ds_bruch',
  ds_rufschlucht: 'bg_ds_schlucht', ds_speisewagen: 'bg_ds_speisewagen', ds_unterschicht: 'bg_ds_unterschicht_bu',
  wx_torfstich: 'bg_wx_torfstich', wx_flossfriedhof: 'bg_wx_torfstich', wx_torfbrueche: 'bg_wx_torfstich', wx_pfahldorf: 'bg_wx_pfahldorf',
  wx_salzmarkt: 'bg_wx_salzmarkt_nacht', wx_leuchtturm: 'bg_wx_leuchtturm_sturm',
});
// Die versunkene Altstadt behält ihre Kulisse aus Paket W; bg_wx_altstadt_versunken bleibt für Begegnungen im Flutwasser
for (const id of ['enemy_sk_flut_novize', 'enemy_sk_flut_sprecher', 'enemy_sk_flut_hand', 'enemy_sk_flut_haupt']) ENCOUNTER_BACKGROUNDS[id] = 'bg_wx_altstadt_versunken';
export const BATTLE_BACKGROUNDS_NIGHT = {
  ds_schwellenring: 'bg_ds_schwellenring_night', ds_rangierwueste: 'bg_ds_rangierwueste_night',
  wx_salzmarkt: 'bg_wx_salzmarkt_nacht_night', wx_leuchtturm: 'bg_wx_leuchtturm_sturm_night',
};
/** Kulisse einer Karte zur Tageszeit. */
export const battleBackgroundFor = (mapId, night = false) => (night && BATTLE_BACKGROUNDS_NIGHT[mapId]) || BATTLE_BACKGROUNDS[mapId];

/** Koop-Oberfläche: Rahmen (9-Slice) je Spieler, 24 Zustandssymbole, Gesichter von Spieler 2 für Dialoge, Trennungsbild. */
UI_SHEETS.koop2 = ['ui/koop2_symbole.png', 192, 32];
export const KOOP2_SYMBOLE = ['am_zug', 'wartet', 'gebunden', 'anspruch_offen', 'trinkt', 'liest', 'im_kampf', 'zurueckgelassen', 'gibt_weiter', 'trennung', 'wiedersehen', 'geplauder'];
UI_REGIONS.koop2 = Object.fromEntries([1, 2].flatMap((p) => KOOP2_SYMBOLE.map((n, i) => [`p${p}_${n}`, [i * 16, (p - 1) * 16, 16, 16]])));
export const KOOP2_RAHMEN_URL = `${BASE}ui/koop2_rahmen.png`;
export const KOOP2_TRENNUNG_URL = `${BASE}ui/koop2_trennung.png`;
const P2_MOODS = { neutral: 0, misstrauisch: 1, erschrocken: 2, laecheln: 3, leichtes_laecheln: 3, suspicious: 1, scared: 2, smile: 3 };
PORTRAIT_SPECIAL.p2a = ['p2a_emotions_bu.png', P2_MOODS];
PORTRAIT_SPECIAL.p2b = ['p2b_emotions_bu.png', P2_MOODS];

// --- Paket BV: Jahreszeiten und Feste (manifest-feste.json; Laufzeit in world/Feste.js) ---
export const festBannerUrl = (id) => `${BASE}ui/fest_${id}_banner.png`;
export const FEST_GEREDE = ['musik', 'trinken', 'lachen', 'streit', 'kuss', 'schlaf'];
/** Welche Karten je Fest geschmückt werden (Außenkarten der drei Städte). */
export const FEST_MAPS = {
  laternennacht: ['altmarkt', 'docks', 'ashgrove', 'nordtor', 'ankerhof'],
  salzsegen: ['wx_salzmarkt', 'wx_bojenhafen', 'wx_pfahldorf', 'wx_oberstadt', 'wx_bahnhof'],
  schichtwechsel: ['ds_schwellenring', 'ds_arbeiterbogen', 'ds_kalkmarkt', 'ds_endbahnhof', 'ds_bruchstufen'],
};
/** Festbesucher mit festem Platz und Gespräch (Paket CK: Figuren fs_<fest>_gast_<n>) laufen mit den BV-Gast-Sheets statt mit dem Platzhalter. */
for (const f of Object.keys(FEST_MAPS)) {
  for (const n of [1, 2, 3, 4]) {
    SHEETS[`fest_${f}_gast_${n}`] = `characters/fest_${f}_gast_${n}_walk.png`;
    CHARACTER_SHEETS[`npc_fs_${f}_gast_${n}`] = `fest_${f}_gast_${n}`;
  }
}
/** Außenkarten ohne Dächer, Gras oder Wasser (Dunscar: Stadt, Bahn, Bruch, Schlucht). */
export const OUTDOOR_THEMES = ['ds_stadt', 'ds_bahn', 'ds_bruch', 'ds_schlucht', 'bh_promenade_kalt', 'bh_promenade_warm', 'bh_kessel_kalt', 'bh_kessel_warm'];
export const isOutdoorMap = (m) => /[Rg~]/.test((m.rows ?? []).join('')) || OUTDOOR_THEMES.includes(m.tiles) || !!m.outdoor;
/** Fassadenaufsatz je Jahreszeit (Spalten der saison_<s>_fassaden-Blätter). */
export const SEASON_FACADE = { herbst: 'girlande', winter: 'haube', fruehling: 'blumenkasten', sommer: 'sonnensegel' };

// --- Codex-Runde 8: Vorrat (BI Gegner, BK Figuren, BM Gegenstände; manifest-vorrat1/2/3.json) für Kapitel 4 und 5 ---------
/** BI: 24 Gegner und 8 Bosse (Kampf-Sheet, Kartenfigur, Bestiarium, Bossbild). [Kampf-Frame-Breite, -Höhe] */
export const VG_ENEMIES = {
  vg_cw_letternlaeufer: [64], vg_cw_rohrpostwespe: [48], vg_cw_stempelhand: [48], vg_cw_durchschlag: [48], vg_cw_registerratte: [48], vg_cw_seilbahnwaechter: [64],
  vg_cw_tintenschatten: [64], vg_cw_leerfracht: [64], vg_cw_boss_bleisammler: [96], vg_cw_boss_blinder_zusteller: [96], vg_cw_boss_nullfundament: [128, 96],
  vg_bh_dampfschwester: [64], vg_bh_wurzelgaenger: [64], vg_bh_glasmotte: [48], vg_bh_bluetenkopf: [48], vg_bh_rohrwurm: [64], vg_bh_postkartenschreiber: [48],
  vg_bh_waeschegeist: [64], vg_bh_sudtraeger: [64], vg_bh_boss_glasgaertner: [96], vg_bh_boss_waescherei: [96], vg_bh_boss_mutterwurzel: [128, 96],
  vg_all_wegelagerer: [48], vg_all_kutschengeist: [64], vg_all_zollhund: [48], vg_all_nebelkraehe: [48], vg_all_marktschreier: [48], vg_all_grenzstein: [64],
  vg_all_fuhrmannsschatten: [64], vg_all_brueckenzoll: [48], vg_all_boss_landvermesser: [96], vg_all_boss_schlafkutsche: [96],
};
export const VG_BOSSES = Object.keys(VG_ENEMIES).filter((id) => id.includes('_boss_'));
for (const [id, [w, h = w]] of Object.entries(VG_ENEMIES)) {
  BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, w, h];
  ENCOUNTER_SHEETS[id] = `enemy_${id}`;
  OVERWORLD_SHEETS[id] = [`characters/F_ow_${id}.png`, 16, 32];
  PROP_ORIGINS[`ow_${id}`] = 0.85;
  ANIM_ALIASES[`enemy_${id}`] = { special: 'attack', cast: 'attack' };
  BESTIARY_FILES[id] = `F_${id}`;
  if (!BESTIARY.includes(id)) BESTIARY.push(id);
}
for (const id of ['vg_cw_tintenschatten', 'vg_cw_leerfracht', 'vg_all_kutschengeist', 'vg_all_fuhrmannsschatten', 'vg_bh_waeschegeist', 'vg_bh_glasmotte']) FADING_SHEETS.push(`enemy_${id}`);
for (const id of VG_BOSSES) {
  BOSS_INTROS[id] = `${id}_bi`;
  BOSS_INTRO_IMAGES[`${id}_bi`] = [`BI_boss_${id}`, `ui/BI_boss_${id}.png`];
}
/** Folgeabschnitte und die Reste der Finale (CD/CH) zeigen das Sheet und Bossbild ihres Bosses. */
for (const [id, base] of [...VG_BOSSES.flatMap((b) => [[`${b}_phase2`, b], [`${b}_phase3`, b]]), ['cwa_registerleib_rest', 'vg_cw_boss_nullfundament'], ['bha_aussaat_schwarm', 'vg_bh_boss_mutterwurzel']]) {
  ENCOUNTER_SHEETS[id] = `enemy_${base}`;
  BOSS_INTROS[id] = `${base}_bi`;
}
/** BK: zwei Figuren mit Kampf-Sheet in zwei Phasen (Wetherby, Greavesend), vorerst ohne eigenen Kampf. */
for (const id of ['cw_wetherby', 'bh_greavesend']) BATTLE_SHEETS[`enemy_${id}`] = [`battle/enemy_${id}.png`, 64, 64];
/** BI: Kulissen der sieben Gefahrengebiete (Briarholt kalt und warm dieselbe). */
Object.assign(BATTLE_BACKGROUNDS, { cw_alte_setzerei: 'bg_vorrat_alte_setzerei', cw_sortiergrube: 'bg_vorrat_sortiergrube', cw_nullfundament: 'bg_vorrat_nullfundament', reise_landstrasse: 'bg_vorrat_landstrasse' });
for (const id of ['kaltes_palmhaus', 'verlassene_waescherei', 'wurzelkammer']) for (const v of ['', '__warm']) BATTLE_BACKGROUNDS[`bh_${id}${v}`] = `bg_vorrat_${id}`;
/** BK: 28 Figuren (10 Calderwick, 10 Briarholt, 8 Landstraße) mit Lauf-Sheet, Portraits (vier plus AK-Stimmungen) und Kopf (aus BK_koepfe geschnitten). */
export const BK_FIGURES = ['cw_crayford', 'cw_ida_bellcross', 'cw_noel_bellcross', 'cw_wetherby', 'cw_darnell', 'cw_hesk', 'cw_wicksend', 'cw_bexley', 'cw_malliver', 'cw_pritch',
  'bh_bellweather', 'bh_orla_fencrest', 'bh_felix_fencrest', 'bh_greavesend', 'bh_vellish', 'bh_malkin', 'bh_rookwell', 'bh_henshall', 'bh_crowther', 'bh_dipple',
  'vn_kutscherin', 'vn_zoellner', 'vn_hausiererin', 'vn_landarzt', 'vn_wanderprediger', 'vn_kartenzeichnerin', 'vn_fahrender_richter', 'vn_waisenjunge'];
for (const id of BK_FIGURES) {
  SHEETS[`bk_${id}`] = `characters/${id}_walk.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `bk_${id}`;
  PORTRAITS[id] = `${id}_emotions.png`;
  HEADS.push(id);
  AK_FIGURES.add(id);
}
/** BM: Kleidung, Waffen, Artefakte und Schlüsselstücke des Vorrats auch in 32px. */
ICON32.push(...['vi_hut_setzerkappe', 'vi_hut_kurhaube', 'vi_hut_zylinder_vermesser', 'vi_hut_fuhrmannshut', 'vi_mantel_druckerschurz', 'vi_mantel_dampfmantel', 'vi_mantel_reisepelerine',
  'vi_mantel_archivrobe', 'vi_amulett_bleiletter', 'vi_amulett_pfirsichkern', 'vi_amulett_grenzsteinsplitter', 'vi_amulett_rohrpostkapsel', 'vi_waffe_setzhaken', 'vi_waffe_bleihammer',
  'vi_waffe_veredelungsschere', 'vi_waffe_dampfrohr', 'vi_waffe_kutschpeitsche', 'vi_waffe_richterstab', 'vi_art_das_leere_tuerschild', 'vi_art_der_erste_durchschlag', 'vi_art_die_warme_postkarte',
  'vi_art_der_falsche_fahrplan', 'vi_art_die_gaertnerschnur', 'vi_art_der_stille_stempel', 'vi_art_das_bremserseil', 'vi_art_die_kurglocke', 'vi_k_cw_randkorrektur', 'vi_k_cw_ungestempelter_durchschlag',
  'vi_k_cw_falsche_quittung', 'vi_k_cw_pfandzettel', 'vi_k_cw_heizungsrohr_skizze', 'vi_k_cw_streiktopf_auszug', 'vi_k_bh_postkarte_verworfen', 'vi_k_bh_pflanzenkapsel', 'vi_k_bh_einweisung',
  'vi_k_bh_beetschild', 'vi_k_bh_namensheft', 'vi_k_bh_wurzelzeichnung']);
/** Gegenstände der Akte- und Ortepakete (CC/CD/CG/CH) und der Feste (CK) haben noch kein eigenes Bild: Platzhalter aus dem Vorrat (bis CN kommt). */
Object.assign(ITEM_ICON_ALIASES, {
  cwo_getrennte_klammer: 'vi_art_der_stille_stempel', bho_kalte_handhabe: 'vi_art_die_kurglocke',
  fs_laternennacht_andenken: 'vi_m_kutschenlaterne', fs_salzsegen_andenken: 'vi_m_grenzsteinmoos', fs_schichtwechsel_andenken: 'vi_m_wegzoll_marke',
  cwo_aufzugsmarke: 'vi_m_wegzoll_marke', cwo_aufzugsschluessel: 'vi_k_cw_pfandzettel', cwo_letternset: 'vi_m_bleiletter', cwo_terrassen_kaltbrot: 'vi_v_setzerbrot', cwo_walzenkeil: 'vi_m_seilbahnfett',
  cwo_kabinenfenster_scherbe: 'vi_m_glasscherbe_beschlagen', cwo_haushaltsknoten: 'vi_m_pferdehaar', cwo_satzwinkel: 'vi_m_bleiletter', cwo_gartenetikett: 'vi_k_bh_beetschild', cwo_ruecklaufpfropfen: 'vi_m_kupferrohrstueck',
  cwa_rohrpostsiegel: 'vi_m_rohrpostkapsel_leer', cwa_originalsatz: 'vi_k_cw_ungestempelter_durchschlag', cwa_zeugensiegel: 'vi_v_zollsiegel', cwa_amtsschluessel: 'vi_k_cw_randkorrektur',
  bha_heizvorrat: 'vi_v_dampfkompresse', bha_kapselhalter: 'vi_k_bh_pflanzenkapsel', bha_formelbeleg: 'vi_k_bh_einweisung', bha_laborschluessel: 'vi_k_bh_namensheft',
  bho_ventilschluessel: 'vi_m_kupferrohrstueck', bho_kondensatglas: 'vi_m_sudflasche', bho_kurgastmarke: 'vi_v_kurkarte', bho_palmhausdattel: 'vi_v_wurzelpastille', bho_ruecklaufplombe: 'vi_m_kupferrohrstueck',
  bho_porzellanschieber: 'vi_m_glasscherbe_beschlagen', bho_reifkamm: 'vi_m_kurwaesche', bho_ventilrose: 'vi_m_pfirsichholz', bho_kuehlfilz: 'vi_m_kurwaesche', bho_ruecklaufstreifen: 'vi_m_registerband',
  fs_laternennacht_papierlaterne: 'vi_m_kutschenlaterne', fs_laternennacht_kerzenboot: 'vi_v_laternenoel_klar', fs_laternennacht_gluehwein: 'vi_v_pfirsichsud', fs_laternennacht_kastanien: 'vi_v_wegzehrung',
  fs_laternennacht_kandis: 'vi_v_wurzelpastille', fs_laternennacht_apfel: 'vi_v_wegzehrung', fs_laternennacht_docht: 'vi_v_nebelkerze', fs_laternennacht_tee: 'vi_v_terrassentee',
  fs_salzsegen_raeucherfisch: 'vi_v_wegzehrung', fs_salzsegen_salzkranz: 'vi_m_grenzsteinmoos', fs_salzsegen_bruehe: 'vi_v_pfirsichsud', fs_salzsegen_brot: 'vi_v_setzerbrot', fs_salzsegen_birne: 'vi_v_wegzehrung',
  fs_salzsegen_kraeuter: 'vi_v_wurzelpastille', fs_salzsegen_wasser: 'vi_v_bitterwasser', fs_salzsegen_bonbon: 'vi_v_wurzelpastille',
  fs_schichtwechsel_lohntuetenlos: 'vi_m_wegzoll_marke', fs_schichtwechsel_bierkrug: 'vi_v_pfirsichsud', fs_schichtwechsel_kandis: 'vi_v_wurzelpastille', fs_schichtwechsel_stulle: 'vi_v_setzerbrot',
  fs_schichtwechsel_kaffee: 'vi_v_terrassentee', fs_schichtwechsel_gurke: 'vi_v_wegzehrung', fs_schichtwechsel_wasser: 'vi_v_bitterwasser', fs_schichtwechsel_gebinde: 'vi_v_dampfkompresse',
});
/** CD/CE2: Calderwicks Orte haben seit Paket CE2 eigene Marker (ui/cw_marker.png, 6x3 Felder in Manifest-Reihenfolge, Landstraße zuletzt). */
export const CW_MAP_IDS = ['cw_gleisfuss', 'cw_setzergasse', 'cw_quittungsmarkt', 'cw_roehrenhof', 'cw_witwenterrasse', 'cw_kronenarchiv', 'cw_buchbinderei', 'cw_gepaeckhalle', 'cw_pfandhaus',
  'cw_sortierhalle', 'cw_kueche', 'cw_archivsaal', 'cw_villa', 'cw_druckkammer', 'cw_alte_setzerei', 'cw_sortiergrube', 'cw_nullfundament', 'reise_landstrasse'];
export const CW_MAP_MARKERS = Object.fromEntries(CW_MAP_IDS.map((id, i) => [id, i]));
export const CW_MAP_MARKERS_URL = `${BASE}ui/cw_marker.png`;

// --- Kapitel 5: Briarholt-Grafik (Paket CI, Batch briarholt1; von Grok geliefert, manifest-briarholt1.json) --------------
/** Props je Viertel und das Wärme-Effektblatt: Regionen als `bhp_<blatt>_<region>`, Animationen gleichnamig (z. B. bhp_kutschenhof_pferde). */
export const BH_PROP_SHEETS = ['kutschenhof', 'kesselgrund', 'promenade', 'glasgaerten', 'stillenhaeuser', 'wurzelkranz'];
for (const n of BH_PROP_SHEETS) {
  SHEETS[`bhp_${n}`] = `props/bh_${n}.png`;
  REGION_SHEETS[`bhp_${n}`] = ['manifestBriarholt1', `bh_${n}`];
}
SHEETS.bhp_waerme = 'fx/bh_waerme.png';
REGION_SHEETS.bhp_waerme = ['manifestBriarholt1', 'bh_waerme'];
/** Kampfkulissen der Viertel (Kesselgrund und Glasgärten je kalt/warm); Innenräume nehmen die Kulisse ihres Viertels, der Bügelraum die warme des Kesselgrunds. */
const BH_BATTLE = { bh_kutschenhof: 'bg_bh_kutschenhof', bh_kutschenhalle: 'bg_bh_kutschenhof', bh_kesselgrund: 'bg_bh_kesselgrund_kalt', bh_buegelraum: 'bg_bh_kesselgrund_warm',
  bh_winterpromenade: 'bg_bh_promenade', bh_pavillon: 'bg_bh_promenade', bh_glasgaerten: 'bg_bh_glasgaerten_kalt', bh_verkaufshalle: 'bg_bh_glasgaerten_kalt',
  bh_stillenhaeuser: 'bg_bh_stillenhaeuser', bh_speisesaal: 'bg_bh_stillenhaeuser', bh_aktenraum: 'bg_bh_stillenhaeuser',
  bh_wurzelkranz: 'bg_bh_wurzelkranz', bh_labor: 'bg_bh_wurzelkranz', bh_mutterhaus: 'bg_bh_wurzelkranz', bh_verteilanlage: 'bg_bh_verteilanlage' };
for (const [id, bg] of Object.entries(BH_BATTLE)) {
  BATTLE_BACKGROUNDS[id] = bg;
  BATTLE_BACKGROUNDS[`${id}__warm`] = bg.replace(/_kalt$/, '_warm');
}
/** Ortskennung → Thema (kalt); die warme Zwillingskarte nimmt `_warm`. Labor und Mutterhaus haben eigene Böden auf dem Klinik-Blatt. */
export const BH_MAP_THEMES = { bh_kutschenhof: 'bh_promenade', bh_kutschenhalle: 'bh_promenade', bh_winterpromenade: 'bh_promenade', bh_pavillon: 'bh_promenade',
  bh_kesselgrund: 'bh_kessel', bh_buegelraum: 'bh_kessel', bh_verlassene_waescherei: 'bh_kessel', bh_glasgaerten: 'bh_glas', bh_verkaufshalle: 'bh_glas', bh_kaltes_palmhaus: 'bh_glas',
  bh_stillenhaeuser: 'bh_stille', bh_speisesaal: 'bh_stille', bh_aktenraum: 'bh_stille', bh_wurzelkranz: 'bh_klinik', bh_verteilanlage: 'bh_klinik', bh_labor: 'bh_labor', bh_mutterhaus: 'bh_mutterhaus',
  bh_wurzelkammer: 'bh_wurzel' };


// --- Kapitel 4: Calderwick-Grafik (Pakete CE1 calderwick1 und CE2 calderwick2) ------------------------------------
/**
 * CE1: sechs Tilesets (8 Spalten à 16 px, Zellindex laut manifest-calderwick1.json). Die Terrassen teilen ein Blatt; Amt, Sortierhalle und
 * Archivsaal liegen auf dem Amtsblatt (Marmor, Blechgang, Leseteppich); das Gleisblatt ist nur Deko (Schienen auf dem Terrassenpflaster).
 */
const CW_THEME_SPECS = {
  cw_terrasse: { fallback: 'cobble0', floor: [0, 1, 2, 3], wet: [6], debris: [30], wallTop: [15], wallFace: [16], window: [19, 20, 21], door: [22], tube: [23, 24, 25, 26, 27, 28] },
  cw_gleis: { fallback: 'cobble0', floor: [0], rails: [0, 1], bend: [2, 3, 4, 5], ramp: [9, 10, 11, 12], stop: [8], sign: [18, 19, 20], grooves: [21, 22], wallTop: [19], wallFace: [19] },
  cw_druckerei: { fallback: 'wood0', floor: [0], debris: [1], wallTop: [6], wallFace: [7], window: [16, 17], press: [2, 3, 4, 5], paper: [10, 11], bench: [12, 13] },
  cw_amt: { fallback: 'stone', floor: [0, 1], wear: [2], wallTop: [4], wallFace: [5], window: [8, 9], tube: [8, 9, 10, 11] },
  cw_sortierhalle: { sheet: 'cw_amt', fallback: 'stone', floor: [16, 17], debris: [18], wear: [19], wallTop: [20], wallFace: [21], window: [8, 10] },
  cw_archivsaal: { sheet: 'cw_amt', fallback: 'wood0', floor: [12], edge: [13, 15], wallTop: [4], wallFace: [5], window: [8, 11] },
  cw_kueche: { fallback: 'stone', floor: [0, 1], wear: [2], wallTop: [12], wallFace: [13], window: [14, 15], stove: [4, 5, 6, 7], table: [8, 9, 10, 11] },
  cw_fundament: { fallback: 'stone', floor: [0, 1], debris: [2, 3], wallTop: [4], wallFace: [5], window: [8, 9], niche: [8, 9, 10, 11, 12, 13], shelf: [16, 17, 18, 19], column: [20, 21, 22, 23] },
};
export const CW_THEME_KEYS = Object.keys(CW_THEME_SPECS);
for (const [theme, { sheet = theme, ...rest }] of Object.entries(CW_THEME_SPECS)) {
  if (!SHEETS[sheet]) SHEETS[sheet] = `tilesets/${sheet}.png`;
  const spec = (THEME_TILES[theme] = { ...rest, sheet });
  const list = Object.entries(spec).filter(([, v]) => Array.isArray(v)).flatMap(([group, regions]) => regions.map((region) => ({
    key: `${theme}_${group}_${region}`, theme, group, sheet, region, solid: !WALKABLE_GROUPS.includes(group), fallback: GROUP_FALLBACK[group] ?? spec.fallback,
    base: WALKABLE_GROUPS.includes(group) ? null : `${theme}_floor_${spec.floor[0]}`,
  })));
  THEME_TILE_LIST.push(...list);
  for (const t of list) TILE_CELLS[t.key] = [t.sheet, t.region, t.base];
}
/** CE1: Gleis- und Fundamentblatt zusätzlich als Spritesheets (16x16-Zellen als Deko: Schienen am Gleisfuß, leuchtende Namensnischen). */
ANIM_SHEETS.cwt_gleis = ['tilesets/cw_gleis.png', 16, 16];
ANIM_SHEETS.cwt_fundament = ['tilesets/cw_fundament.png', 16, 16];
/** Karte → Thema (CD-Orte; Gefahrengebiete: Setzerei = Druckerei, Sortiergrube = Blechgang, Nullfundament = Fundament). */
export const CW_MAP_THEMES = { cw_gleisfuss: 'cw_terrasse', cw_setzergasse: 'cw_terrasse', cw_quittungsmarkt: 'cw_terrasse', cw_roehrenhof: 'cw_terrasse', cw_witwenterrasse: 'cw_terrasse',
  cw_kronenarchiv: 'cw_terrasse', cw_buchbinderei: 'cw_druckerei', cw_gepaeckhalle: 'cw_sortierhalle', cw_pfandhaus: 'cw_druckerei', cw_sortierhalle: 'cw_sortierhalle', cw_kueche: 'cw_kueche',
  cw_archivsaal: 'cw_archivsaal', cw_villa: 'cw_archivsaal', cw_druckkammer: 'cw_druckerei', cw_alte_setzerei: 'cw_druckerei', cw_sortiergrube: 'cw_sortierhalle', cw_nullfundament: 'cw_fundament' };
/** CE1: sieben Props-Blätter, Regionen als `cwp_<blatt>_<region>` (Animationen gleichnamig: cwp_gleisfuss_aufzug, cwp_setzergasse_druckerpresse …). */
export const CW_PROP_SHEETS = ['gleisfuss', 'setzergasse', 'quittungsmarkt', 'roehrenhof', 'witwenterrasse', 'kronenarchiv', 'buchbinderei'];
for (const n of CW_PROP_SHEETS) {
  SHEETS[`cwp_${n}`] = `props/cw_${n}.png`;
  REGION_SHEETS[`cwp_${n}`] = ['manifestCalderwick1', `cw_${n}`];
}
/** CE2: Kampfkulissen je Terrasse; Innenräume nehmen die ihres Viertels, die Druckkammer ihre eigene; die Landstraße hat Tag und Nacht. */
Object.assign(BATTLE_BACKGROUNDS, { cw_gleisfuss: 'bg_cw_gleisfuss', cw_gepaeckhalle: 'bg_cw_gleisfuss', cw_setzergasse: 'bg_cw_setzergasse', cw_buchbinderei: 'bg_cw_setzergasse',
  cw_quittungsmarkt: 'bg_cw_quittungsmarkt', cw_pfandhaus: 'bg_cw_quittungsmarkt', cw_roehrenhof: 'bg_cw_roehrenhof', cw_sortierhalle: 'bg_cw_roehrenhof',
  cw_witwenterrasse: 'bg_cw_witwenterrasse', cw_kueche: 'bg_cw_witwenterrasse', cw_kronenarchiv: 'bg_cw_kronenarchiv', cw_archivsaal: 'bg_cw_kronenarchiv', cw_villa: 'bg_cw_kronenarchiv',
  cw_druckkammer: 'bg_cw_druckkammer', reise_landstrasse: 'bg_cw_landstrasse_tag' });
BATTLE_BACKGROUNDS_NIGHT.reise_landstrasse = 'bg_cw_landstrasse_nacht';
/** CE2: Abgleich-Atlas (fx/cw_abgleich.png): Straßenmarken, gefährdeter Kontakt, stabile Verbindung, Nebel-Rückweg – Regionen → [x, y, w, h, Frames, fps]. */
export const CW_ABGLEICH_KEY = 'cw_abgleich';
export const CW_ABGLEICH = { strasse_gerade: [0, 0, 16, 16, 4, 4], strasse_kurve: [0, 16, 16, 16, 4, 4], strasse_ende: [0, 32, 16, 16, 4, 4], kontakt_gefaehrdet: [0, 48, 16, 16, 4, 4],
  verbindung_stabil: [0, 64, 16, 16, 2, 4], nebel_rueckweg: [0, 80, 48, 48, 6, 8] };
SHEETS.cw_abgleich = 'fx/cw_abgleich.png';

// --- Paket CN: Kettlegate lebt (manifest-kettlegate-leben.json) ---------------------------------------------------
/** Zehn Einwohner: Lauf-Sheet, Kopf (24x24 unter portraits/heads/), Sonderpose (16x32, Schlüssel pose_<id>, läuft während des Gesprächs). */
export const KGL_FIGURES = ['kgl_e_laternenanzuender', 'kgl_e_zeitungsjunge', 'kgl_e_fischweib', 'kgl_e_schornsteinfegerin', 'kgl_e_kutscher', 'kgl_e_leichenwaescherin', 'kgl_e_uhrlehrling', 'kgl_e_bettler', 'kgl_e_waescherin', 'kgl_e_nachtwaechter'];
for (const id of KGL_FIGURES) {
  SHEETS[`kgl_${id}`] = `characters/${id}.png`;
  CHARACTER_SHEETS[`npc_${id}`] = `kgl_${id}`;
  HEADS.push(id);
  HEAD_FILES[id] = `portraits/heads/${id}.png`;
  ANIM_SHEETS[`pose_${id}`] = [`characters/${id}_pose.png`, 16, 32];
}
/** Tiere, Wetter, Stände und Nachtfassaden: Regionen → [x, y, w, h, Frames, fps]; genutzt in world/KettlegateLife.js. */
export const KGL_KEYS = { tiere: 'kgl_tiere', wetter: 'kgl_wetter', staende: 'kgl_staende', nacht: 'kgl_nacht' };
export const KGL_FILES = { kgl_tiere: 'fx/kgl_tiere.png', kgl_wetter: 'fx/kgl_wetter.png', kgl_staende: 'props/kgl_staende.png', kgl_nacht: 'props/kgl_nacht.png' };
export const KGL_TIERE = { kgl_taube_picken: [0, 0, 16, 16, 4, 3], kgl_taube_auffliegen: [0, 16, 16, 16, 4, 8], kgl_ratte: [0, 32, 16, 16, 4, 8], kgl_katze: [0, 48, 16, 32, 4, 3], kgl_hund: [0, 80, 16, 16, 4, 3], kgl_moewe: [0, 96, 16, 16, 4, 3], kgl_fledermaus: [0, 112, 16, 16, 4, 8], kgl_pferd: [0, 128, 32, 32, 2, 3] };
export const KGL_WETTER = { kgl_nieselregen: [0, 0, 64, 64, 6, 10], kgl_russschnee: [0, 64, 64, 64, 6, 6], kgl_nebel_dicht: [0, 128, 96, 48, 4, 3], kgl_kanalgeruch: [0, 176, 32, 32, 4, 4], kgl_pfuetze: [0, 208, 16, 16, 4, 6] };
export const KGL_STAENDE = { kgl_kastanien: [0, 0, 48, 32, 2, 4], kgl_zeitung: [0, 32, 32, 32, 1, 1], kgl_heisswasser: [0, 64, 48, 32, 2, 4], kgl_streichholz: [0, 96, 32, 32, 1, 1], kgl_drehorgel: [0, 128, 48, 32, 4, 5], kgl_schleifer: [0, 160, 48, 32, 4, 8], kgl_austern: [0, 192, 48, 32, 1, 1], kgl_oel: [0, 224, 48, 32, 1, 1], kgl_droschke: [0, 256, 64, 32, 2, 2], kgl_droschke_umgestuerzt: [0, 288, 64, 32, 1, 1], kgl_kreidekreis: [0, 320, 32, 32, 1, 1], kgl_schornsteinbrand: [0, 352, 16, 32, 4, 8] };
export const KGL_NACHT = { kgl_fenster_1: [0, 0, 16, 16, 2, 3], kgl_fenster_2: [0, 16, 16, 16, 2, 3], kgl_fenster_3: [0, 32, 16, 16, 2, 3], kgl_fenster_4: [0, 48, 16, 16, 2, 3], kgl_laterne: [0, 64, 16, 32, 2, 1], kgl_rauch: [0, 96, 16, 32, 4, 4] };
/** Stadtpins der zehn Einwohner (ui/kgl_karte_pins.png, 12x12 in Reihenfolge von KGL_FIGURES). */
export const KGL_PINS_URL = `${BASE}ui/kgl_karte_pins.png`;
