// Echte Pixel-Art (von Codex erzeugt, liegt unter public/sprites/).
// Die PNGs ersetzen die prozedural gezeichneten Platzhalter aus textures.js unter
// denselben Texture-Keys. Alles, was hier nicht zugeordnet ist (oder nicht lädt),
// bleibt automatisch beim Platzhalter.

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
};
/** Gruppen, die begehbar bleiben; alles andere blockiert. */
const WALKABLE_GROUPS = ['floor', 'debris', 'wet', 'wood', 'mud', 'moss', 'tufts', 'path', 'ash', 'shards', 'weeds'];
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
  npc_wick: 'lamplighter', npc_grimes: 'constable',
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
};
/** Ausdruck (Dialogknoten-Feld "mood") → Spalte im Portrait-Streifen. */
export const PORTRAIT_MOODS = { neutral: 0, suspicious: 1, skeptical: 1, shocked: 2, smile: 3, faint_smile: 3, approving: 2, angry: 3 };
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
  wx_bahnhof: 3, wx_torfstich: 3, wx_salzmarkt: 4, wx_bojenhafen: 3, wx_oberstadt: 0, wx_pfahldorf: 2, // Kapitel 2 (Wexmoor): Platzhalter
};
export const MAP_MARKERS_URL = `${BASE}ui/C_08_map_markers.png`;
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
};

/** Manifest-Id, falls sie vom Texture-Key abweicht. */
const MANIFEST_IDS = { player_drink: 'A_player_drink', control_cracks: 'A_11_control_cracks', creatures: 'C_08_creatures', weather: 'C_08_weather',
  player_inspect: 'H_player_untersuchen', risk_fx: 'H_06_risiko' };

/** Pfad-Embleme und Karten (public/sprites/pathways/). */
export const pathwayEmblemUrl = (pid, size = 32) => `${BASE}pathways/emblem_${pid}_${size}.png`;
export const pathwayCardUrl = (pid) => `${BASE}pathways/card_${pid}.png`;
export const COIN_URL = `${BASE}items/schilling.png`;

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
  sternlicht: 'bg_sternwarte', starling_fight: 'bg_sternwarte',
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
const FACADE_CELLS = { wall: [0, 0, 0, 0, 1, 2], window: [8, 8, 12, 12, 9, 10, 13], door: [16, 17], eave: [24, 25], roof: [32, 33, 34, 35] };
const FACADE_FALLBACK = { wall: 'brick', window: 'window', door: 'door', eave: 'roofEaveBottom', roof: 'roofEaveTop' };
/** [{ key, sheet, cell, group, fallback }] – Tile-Key `fac_<material>_<gruppe>_<n>`. */
/** Abweichungen je Material: In Elendsvierteln und Fabriken brennt kaum Licht, viele Fenster sind vernagelt. */
const FACADE_OVERRIDES = { slum: { window: [9, 11, 11, 13, 9, 15, 8] }, fabrik: { window: [9, 13, 9, 8, 12] } };
const facadeCells = (m, group) => FACADE_OVERRIDES[m]?.[group] ?? FACADE_CELLS[group];
export const FACADE_TILE_LIST = FACADES.flatMap((m) => Object.keys(FACADE_CELLS).flatMap((group) => facadeCells(m, group).map((cell, n) => ({
  key: `fac_${m}_${group}_${n}`, sheet: `fac_${m}`, cell, group, fallback: FACADE_FALLBACK[group],
}))));
/** Tile-Keys einer Fassadengruppe. */
export const facadeKeys = (m, group) => facadeCells(m, group).map((_, n) => `fac_${m}_${group}_${n}`);
for (const m of FACADES) SHEETS[`fac_${m}`] = `tilesets/D_03_fassade_${m}.png`;
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
/** Portrait-URL und Spalte für Figur + Stimmung (oder null). */
export function portraitFor(id, mood) {
  const special = PORTRAIT_SPECIAL[id];
  if (special && special[1][mood] !== undefined) return { url: `${BASE}portraits/${special[0]}`, col: special[1][mood] };
  const url = portraitUrl(id);
  return url ? { url, col: PORTRAIT_MOODS[mood] ?? 0 } : null;
}

/** Schlussbilder (480x270): Ende → Bild; sonst das Bild des Falls. */
export const ENDING_IMAGES = { c4_perfect: 'E_ende_fall4_gut', c4_good: 'E_ende_fall4_halb', c4_early: 'E_ende_fall4_schlecht', c4_mask: 'E_ende_fall4_haken' };
export const CASE_ENDING_IMAGES = { case_01: 'E_ende_fall1', case_02: 'E_ende_fall2', case_03: 'E_ende_fall3' };
export const endingImageUrl = (id, caseId) => {
  const f = ENDING_IMAGES[id] ?? CASE_ENDING_IMAGES[caseId];
  return f ? `${BASE}ui/endings/${f}.png` : null;
};
/** Fallakten (128x96) als Kopf im Notizbuch. */
export const CASE_FILES = { case_01: 'E_akte_fall1', case_02: 'E_akte_fall2', case_03: 'E_akte_fall3', case_04: 'E_akte_fall4', side: 'E_akte_altmarkt' };
export const caseFileUrl = (caseId) => `${BASE}ui/cases/${CASE_FILES[caseId] ?? 'E_akte_leer'}.png`;
/** Zwischensequenzbilder (240x135): Dialogknoten und Lesetexte mit `"scene": "<id>"`. */
export const SCENES = ['turmuhr', 'brief', 'rook', 'chor', 'marlowe', 'felix'];
/** Paket I: Bilder zu Ereignissen auf dem schnellen Reiseweg (travel.json, Ereignis-Id = Bild-Id). */
export const TRAVEL_SCENES = ['reise_nebel', 'reise_ratten', 'reise_irrlicht', 'reise_kultpatrouille', 'reise_ueberfall', 'reise_fund', 'reise_taschendieb'];
export const sceneUrl = (id) => (SCENES.includes(id) ? `${BASE}ui/scenes/E_szene_${id}.png`
  : TRAVEL_SCENES.includes(id) ? `${BASE}ui/scenes/I_${id}.png` : null);

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
    for (const [name, a] of Object.entries(def.regionAnimations ?? {})) anims[name] = { ...a, frames: a.regions.map((n) => regions[n]) };
    for (const [name, a] of Object.entries(anims)) {
      if (Array.isArray(a) || !a.frames?.length) continue;
      const cols = Math.floor(img.width / 16);
      // Zahlen = linke obere 16er-Zelle des Frames, sonst Rechtecke
      const frames = a.frames.map((f) => (typeof f === 'number'
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
export const bestiaryUrl = (id) => `${BASE}ui/bestiary/${BESTIARY_PACK[id] ?? (G_MONSTERS[id] ? 'G' : 'F')}_${id}.png`;
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
export const itemIconUrl = (id) => `${BASE}items/${id}.png`;
/** 32x32-Fassung (gibt es für Tränke und die Stimmphiole). */
const ICON32 = ['stimmphiole', 'verlorenes_gesangbuch', 'spiegelscherbe', ...F_EQUIPMENT,
  'rostwasser', 'schleierpuder', 'ankerhaken', 'schleierdolch', 'rostanker', 'porzellanmaske', 'rost_zeichen', 'schleier_zeichen'];
export const itemIcon32Url = (id) => (id.startsWith('trank_') || ICON32.includes(id) ? `${BASE}items/32/${id}.png` : null);

const srcKey = (sheet) => `src_${sheet}`;

/** Im preload() der Szene aufrufen. Bereits geladene Sheets werden übersprungen. */
export function preloadSprites(scene) {
  for (const [sheet, path] of Object.entries(SHEETS)) {
    if (!scene.textures.exists(srcKey(sheet))) scene.load.image(srcKey(sheet), BASE + path);
  }
  for (const [key, [path, w, h = w]] of Object.entries(BATTLE_SHEETS)) {
    if (!scene.textures.exists(key)) scene.load.spritesheet(key, BASE + path, { frameWidth: w, frameHeight: h });
  }
  for (const key of new Set([...Object.values(BATTLE_BACKGROUNDS), ...Object.values(ENCOUNTER_BACKGROUNDS)])) {
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
  for (const id of Object.values(BOSS_INTROS)) {
    const [key, path] = bossIntroImage(id);
    if (!scene.textures.exists(key)) scene.load.image(key, BASE + path);
  }
  if (!scene.cache.json.exists('manifestWelt')) scene.load.json('manifestWelt', `${BASE}manifest-welt.json`);
  if (!scene.cache.json.exists('manifestPfade')) scene.load.json('manifestPfade', `${BASE}manifest-pfade.json`);
  if (!scene.cache.json.exists('manifestStadt')) scene.load.json('manifestStadt', `${BASE}manifest-stadt.json`);
  if (!scene.cache.json.exists('manifestFaelle')) scene.load.json('manifestFaelle', `${BASE}manifest-faelle.json`);
  if (!scene.cache.json.exists('manifestWildnis')) scene.load.json('manifestWildnis', `${BASE}manifest-wildnis.json`);
  if (!scene.cache.json.exists('manifestReise')) scene.load.json('manifestReise', `${BASE}manifest-reise.json`);
  if (!scene.cache.json.exists('manifestJournal')) scene.load.json('manifestJournal', `${BASE}manifest-journal.json`);
  if (!scene.cache.json.exists('manifestGegner3')) scene.load.json('manifestGegner3', `${BASE}manifest-gegner3.json`);
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
    const def = ['manifestPfade', 'manifestWelt', 'manifestJournal'].map((m) => scene.cache.json.get(m)?.assets?.find((a) => a.id === id)?.animations?.[name]).find(Boolean);
    if (!def) return false;
    scene.anims.create({ key, frames: def.frames.map((frame) => ({ key: sheet, frame })), frameRate: def.frameRate, repeat: def.repeat });
  }
  sprite.setTexture(sheet);
  sprite.play(key);
  if (then) sprite.once(`animationcomplete-${key}`, then);
  return true;
}

/** Animationsdefinition aus manifest-14b.json oder manifest-kampf.json. */
function battleAnimDef(scene, sheet, name) {
  for (const n of [name, ANIM_ALIASES[sheet]?.[name]].filter(Boolean)) {
    for (const m of ['manifest14b', 'manifestKampf', 'manifestKampf2', 'manifestReise', 'manifestWildnis', 'manifestGegner3']) {
      const def = scene.cache.json.get(m)?.assets?.find((a) => a.id === sheet)?.animations?.[n];
      if (def) return def;
    }
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
  'lehrling', 'gaswerker', 'astronom', 'miriam', 'player', 'cultist', 'nate', 'unknown_man', 'unknown_woman', 'anonymous', 'crowd', 'spirit'];
const HEAD_ALIASES = { grubenwirt: 'brock' };
export const headUrl = (id) => {
  const h = HEAD_ALIASES[id] ?? id;
  return HEADS.includes(h) ? `${BASE}ui/heads/${h}.png` : null;
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
export const inspectUrl = (item, curse = false) => (INSPECT_VIEWS.includes(item) ? `${BASE}ui/inspect/${item}${curse ? '_fluch' : ''}.png` : null);

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
export const FACTION_EMBLEM = { 16: [0, 16], 32: [16, 32], 64: [48, 64] };
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
export const wantedUrl = (id) => `${BASE}ui/wanted/L_steckbrief_${WANTED.includes(id) ? id : 'leer'}.png`;
