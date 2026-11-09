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
};

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
};

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
};

// --- Kampf (Paket 14b) ----------------------------------------------------------
// Animierte Seitenansichts-Sheets; Frames und Animationen stehen in manifest-14b.json.

/** Texture-Key → [Pfad, Framegröße]. */
export const BATTLE_SHEETS = {
  battle_player: ['battle/battle_player.png', 48],
  enemy_holt: ['battle/enemy_holt.png', 48],
  enemy_nebelhund: ['battle/enemy_nebelhund.png', 64],
  enemy_aschewaechter: ['battle/enemy_aschewaechter.png', 64],
};

/** Gegner-Sprite aus encounters.json → Kampf-Sheet. Fehlt eins, bleibt die alte Darstellung. */
export const ENEMY_BATTLE_SHEETS = {
  'npc:holt': 'enemy_holt',
  hound: 'enemy_nebelhund',
  warden: 'enemy_aschewaechter',
};

/** Karte → Kampfhintergrund (480x270). Karten ohne Eintrag behalten die gezeichnete Bühne. */
export const BATTLE_BACKGROUNDS = {
  revier: 'bg_revier', ashgrove: 'bg_ashgrove', altmarkt: 'bg_ashgrove', docks: 'bg_ashgrove', crypt: 'bg_krypta',
};

/** Items mit eigenem 16x16-Icon unter public/sprites/items/<id>.png. */
export const ITEM_ICONS = ['spazierstock', 'schlagstock', 'stockdegen', 'verband', 'tonikum', 'riechsalz', 'bannsalz'];

export const itemIconUrl = (id) => (ITEM_ICONS.includes(id) ? `${BASE}items/${id}.png` : null);

const srcKey = (sheet) => `src_${sheet}`;

/** Im preload() der Szene aufrufen. Bereits geladene Sheets werden übersprungen. */
export function preloadSprites(scene) {
  for (const [sheet, path] of Object.entries(SHEETS)) {
    if (!scene.textures.exists(srcKey(sheet))) scene.load.image(srcKey(sheet), BASE + path);
  }
  for (const [key, [path, size]] of Object.entries(BATTLE_SHEETS)) {
    if (!scene.textures.exists(key)) scene.load.spritesheet(key, BASE + path, { frameWidth: size, frameHeight: size });
  }
  for (const key of new Set(Object.values(BATTLE_BACKGROUNDS))) {
    if (!scene.textures.exists(key)) scene.load.image(key, `${BASE}battle/${key}.png`);
  }
  if (!scene.cache.json.exists('manifest14b')) scene.load.json('manifest14b', `${BASE}manifest-14b.json`);
}

/**
 * Spielt eine Kampfanimation aus manifest-14b.json (z. B. 'attack', 'hurt').
 * Liefert false, wenn das Sprite kein Kampf-Sheet nutzt oder die Animation fehlt.
 */
export function playBattleAnim(sprite, name, then) {
  const sheet = sprite.texture.key;
  if (!BATTLE_SHEETS[sheet]) return false;
  const scene = sprite.scene;
  const key = `${sheet}-${name}`;
  if (!scene.anims.exists(key)) {
    const def = scene.cache.json.get('manifest14b')?.assets?.find((a) => a.id === sheet)?.animations?.[name];
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
  const cols = Math.floor(img.width / 16);
  ctx.drawImage(img, (index % cols) * 16, Math.floor(index / cols) * 16, 16, 16, dx, dy, 16, 16);
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
  for (const [key, sheet] of Object.entries(CHARACTER_SHEETS)) {
    if (scene.textures.exists(key)) continue;
    const img = sourceOf(scene, sheet);
    if (img) scene.textures.addSpriteSheet(key, img, { frameWidth: 16, frameHeight: 32 });
  }
}
