// Echte Pixel-Art (von Codex erzeugt, liegt unter public/sprites/).
// Die PNGs ersetzen die prozedural gezeichneten Platzhalter aus textures.js unter
// denselben Texture-Keys. Alles, was hier nicht zugeordnet ist (oder nicht lädt),
// bleibt automatisch beim Platzhalter.

const BASE = './sprites/';

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
const WALKABLE_GROUPS = ['floor', 'debris', 'wet', 'wood'];
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

/** Wetter pro Karte (Animation aus C_08_weather). */
export const MAP_WEATHER = { docks: 'rain_light', ebba: 'ash', gaskanaele: 'fog' };

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
};

/** Manifest-Id, falls sie vom Texture-Key abweicht. */
const MANIFEST_IDS = { player_drink: 'A_player_drink', control_cracks: 'A_11_control_cracks', creatures: 'C_08_creatures', weather: 'C_08_weather' };

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
  felix_fight: 'enemy_chorfanatiker', // bis es ein eigenes Felix-Sheet gibt
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
export const FADING_SHEETS = ['enemy_nebelhund', 'enemy_aschewaechter', 'enemy_aktenfresser', 'enemy_spiegelschatten',
  'enemy_schattenpuppe', 'enemy_kanalkroete', 'enemy_uhrwerkwaechter', 'enemy_gasgeist'];

/** Karte → Kampfhintergrund (480x270). Karten ohne Eintrag behalten die gezeichnete Bühne. */
export const BATTLE_BACKGROUNDS = {
  revier: 'bg_revier', ashgrove: 'bg_ashgrove', crypt: 'bg_krypta', ebba: 'bg_ebba', altmarkt: 'bg_altmarkt',
  docks: 'bg_hafen', warehouse: 'bg_lagerhaus', tavern: 'bg_taverne', nachtmarkt: 'bg_nachtmarkt',
  // Neue Orte (bis es eigene Hintergründe gibt)
  theater: 'bg_spiegel', uhrturm: 'bg_archiv', sternwarte: 'bg_archiv', schlachthof: 'bg_lagerhaus', gaskanaele: 'bg_hafen',
};
/** Begegnung → eigener Hintergrund (vor dem der Karte). */
export const ENCOUNTER_BACKGROUNDS = { archive_rats: 'bg_archiv', grubenkampf: 'bg_grube', mirror_shade: 'bg_spiegel' };

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

/** 16x16-Icon unter public/sprites/items/<id>.png (tests/sprites.test.js prüft, dass es zu jedem Item eins gibt). */
export const itemIconUrl = (id) => `${BASE}items/${id}.png`;
/** 32x32-Fassung (gibt es nur für Tränke). */
export const itemIcon32Url = (id) => (id.startsWith('trank_') ? `${BASE}items/32/${id}.png` : null);

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
  if (!scene.cache.json.exists('manifest14b')) scene.load.json('manifest14b', `${BASE}manifest-14b.json`);
  if (!scene.cache.json.exists('manifestKampf')) scene.load.json('manifestKampf', `${BASE}manifest-kampf.json`);
  if (!scene.cache.json.exists('manifestWelt')) scene.load.json('manifestWelt', `${BASE}manifest-welt.json`);
  if (!scene.cache.json.exists('manifestPfade')) scene.load.json('manifestPfade', `${BASE}manifest-pfade.json`);
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
    const def = ['manifestPfade', 'manifestWelt'].map((m) => scene.cache.json.get(m)?.assets?.find((a) => a.id === id)?.animations?.[name]).find(Boolean);
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
  for (const m of ['manifest14b', 'manifestKampf']) {
    const def = scene.cache.json.get(m)?.assets?.find((a) => a.id === sheet)?.animations?.[name];
    if (def) return def;
  }
  return null;
}

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
}
