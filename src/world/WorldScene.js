import Phaser from 'phaser';
import { questTarget, nextHop } from '../core/Guide.js';
import { createTextures, createCharacterSheet, hash2, TILE, TILE_INDEX, SOLID_KEYS } from './textures.js';
import { Lighting, DEPTH } from './Lighting.js';
import { preloadSprites, playSheetAnim, themeKeys, facadeKeys, PROP_ORIGINS, MAP_WEATHER } from './assets.js';
import { Roamers } from './Roamers.js';

export const VIEW_W = 480;
export const VIEW_H = 270;

const PLAYER_SPEED = 72;
const INTERACT_RANGE = 22;
const DIRS = ['down', 'left', 'right', 'up'];

export const PLAYER_PALETTE = {
  coat: '#6a5a48', hat: '#2e2a26', skin: '#e0b894', hair: '#3a2a20', legs: '#2c2a30', scarf: '#7a3a3a',
};

/** Wählt deterministisch eine Variante aus einer Liste von Tile-Keys. */
const pickKey = (keys, x, y, seed) => keys[Math.floor(hash2(x, y, seed) * keys.length)];

/**
 * Paket-C-Themen nach gleichem Muster: Boden, Wandkrone (Wand darunter), Wandfront.
 * `extra(ch, at, x, y)` deutet weitere Zeichen um.
 */
function roomTheme(theme, { floorChars = '.ws', extra = null, floorMix = null } = {}) {
  const floor = themeKeys(theme, 'floor');
  return (ch, at, v, x, y) => {
    const special = extra?.(ch, at, x, y);
    if (special) return special;
    if (floorChars.includes(ch)) return floorMix?.(x, y) ?? pickKey(floor, x, y, 0);
    if (ch === 'I' || ch === '#') {
      const below = at(0, 1);
      const top = below === undefined || below === 'I' || below === '#' || below === 'E';
      return pickKey(themeKeys(theme, top ? 'wallTop' : 'wallFace'), x, y, 2);
    }
    return null;
  };
}
/** Länge der waagrechten Reihe gleicher Zeichen, in der (x, y) liegt. */
const runOf = (at, ch) => {
  let l = 0;
  while (at(-l - 1, 0) === ch) l += 1;
  let r = 0;
  while (at(r + 1, 0) === ch) r += 1;
  return { l, r, len: l + r + 1 };
};

/** Kartenthemen: ersetzen einzelne Zeichen durch eigene Tiles (Map-Feld "tiles"). */
const THEMES = {
  warehouse: roomTheme('warehouse', {
    floorMix: (x, y) => (hash2(x, y, 31) > 0.95 ? themeKeys('warehouse', 'debris')[0] : pickKey(themeKeys('warehouse', 'floor'), x, y, 0)),
  }),
  tavern: roomTheme('tavern', {
    extra: (ch, at, x, y) => {
      if (ch === 'T') {
        const { l, r, len } = runOf(at, 'T');
        if (len < 3) return themeKeys('tavern', 'tableBase')[0]; // kleine Tische: Deko obendrauf
        const [left, mid, right] = themeKeys('tavern', 'bar');
        return l === 0 ? left : r === 0 ? right : mid;
      }
      if (ch === 'B') return pickKey(themeKeys('tavern', 'shelf'), x, y, 7);
      if (ch === 'V') return themeKeys('tavern', 'barrel')[0];
      return null;
    },
  }),
  altmarkt: roomTheme('altmarkt', {
    floorChars: '.',
    extra: (ch) => (ch === 'T' ? themeKeys('altmarkt', 'stallBase')[0] : null), // Stände kommen als Deko
  }),
  theater: roomTheme('theater', { extra: (ch, at, x, y) => (ch === 'T' ? pickKey(themeKeys('theater', 'seat'), x, y, 3) : null) }),
  uhrturm: roomTheme('uhrturm'),
  schlachthof: roomTheme('schlachthof', {
    floorChars: '.s',
    extra: (ch, at, x, y) => (ch === 'w' ? pickKey(themeKeys('schlachthof', 'wood'), x, y, 4) : null),
    floorMix: (x, y) => pickKey(themeKeys('schlachthof', hash2(x, y, 8) > 0.85 ? 'wet' : 'floor'), x, y, 0),
  }),
  gaskanaele: roomTheme('gaskanaele', { extra: (ch) => (ch === '~' ? themeKeys('gaskanaele', 'water')[0] : null) }),
  sternwarte: roomTheme('sternwarte'),
  // Paket G: Gefahrengebiete
  g_marsch(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('g_marsch', g), x, y, seed);
    const land = (c) => c !== undefined && c !== '~';
    switch (ch) {
      case 'g': return k('floor');
      case 'p': return k('mud', 1);
      case 'P': return k('wood', 2);
      case '~':
        if (land(at(0, -1))) return k('shoreN', 3);
        if (land(at(0, 1))) return k('shoreS', 3);
        return hash2(x, y, 41) > 0.97 ? k('gas', 4) : k('water', 4);
      case 'r': return k('rocks', 5);
      case 'Y': return k('reeds', 6);
      case 'G': return k('rocks', 7);
      default: return null;
    }
  },
  g_katakomben(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('g_katakomben', g), x, y, seed);
    switch (ch) {
      case 's': return hash2(x, y, 42) > 0.9 ? k('moss', 1) : k('floor');
      case 'I': {
        const below = at(0, 1);
        if (below === undefined || 'IK'.includes(below)) {
          // nur die Kante über einer Wandfront bekommt die Steinplatte, das Innere bleibt dunkel
          const below2 = at(0, 2);
          return below2 !== undefined && !'IK'.includes(below2) ? k('wallTop', 2) : null;
        }
        const r = hash2(x, y, 43);
        return r > 0.93 ? k('candle', 3) : r > 0.8 ? k('niche', 3) : k('wallFace', 3);
      }
      case 'G': return k('grave', 4);
      case 'K': return k('pillar', 5);
      case 'B': return k('bones', 6);
      case 'r': return k('rubble', 7);
      default: return null;
    }
  },
  g_kraterwald(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('g_kraterwald', g), x, y, seed);
    switch (ch) {
      case 'g': return hash2(x, y, 44) > 0.85 ? k('tufts', 1) : k('floor');
      case 'p': return k('path', 2);
      case 'c': return k('ash', 3);
      case 's': return k('shards', 4);
      case 'r': return k('rocks', 5);
      case 'Y': return k('trees', 6);
      default: return null;
    }
  },
  g_pestgassen(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('g_pestgassen', g), x, y, seed);
    switch (ch) {
      case '.': return hash2(x, y, 45) > 0.85 ? k('weeds', 1) : k('floor');
      case ',': return hash2(x, y, 46) > 0.6 ? k('weeds', 1) : k('floor');
      case 'r': return k('rubble', 2);
      case 'f': return k('barricade', 3);
      default: return null;
    }
  },
  nachtmarkt(ch, at, v, x, y) {
    switch (ch) {
      case '#':
        if ('#WB'.includes(at(0, 1) ?? '')) return hash2(x, y, 4) > 0.7 ? 'nmArchDrip' : 'nmArch';
        return hash2(x, y, 6) > 0.8 ? 'nmChalk' : `nmWall${v(2, 2)}`;
      case 'W': return 'nmLedge';
      case 'Q': return 'nmQuay';
      case 'f': return 'nmRail';
      default: return null;
    }
  },
};

/** Paket D: Hausfassaden für Wände, Fenster, Türen und Dächer (Map-Feld "facade"). */
function facadeTile(m, ch, at, x, y) {
  const pick = (group, seed) => pickKey(facadeKeys(m, group), x, y, seed);
  switch (ch) {
    case '#': return pick('wall', 43);
    case 'W': return pick('window', 44);
    case 'D': return pick('door', 45);
    case 'R': return at(0, 1) && at(0, 1) !== 'R' ? pick('eave', 46) : pick('roof', 47);
    default: return null;
  }
}

/** Wählt für ein Kartenzeichen den passenden Tile-Index (inkl. Variationen). */
export function tileIndexFor(rows, x, y, theme = null, facade = null) {
  const ch = rows[y][x];
  const at = (dx, dy) => rows[y + dy]?.[x + dx];
  const v = (n, seed) => Math.floor(hash2(x, y, seed) * n);
  const themed = theme && THEMES[theme]?.(ch, at, v, x, y);
  if (themed) return TILE_INDEX[themed];
  const fac = facade && facadeTile(facade, ch, at, x, y);
  if (fac) return TILE_INDEX[fac];
  switch (ch) {
    case '.': return TILE_INDEX[`cobble${v(4, 0)}`];
    case 'L': case 'X': {
      // Laternen übernehmen den Boden ihrer Nachbarn (Friedhof: Gras/Weg)
      const n = [at(-1, 0), at(1, 0)];
      if (n.includes('p')) return TILE_INDEX.path;
      if (n.includes('g')) return TILE_INDEX[`grass${v(2, 9)}`];
      return TILE_INDEX[hash2(x, y, 3) > 0.8 ? 'walk1' : 'walk0'];
    }
    case ',': return TILE_INDEX[hash2(x, y, 3) > 0.8 ? 'walk1' : 'walk0'];
    case '#': return TILE_INDEX.brick;
    case 'W': return TILE_INDEX.window;
    case 'D': return TILE_INDEX.door;
    case 'R': return TILE_INDEX[at(0, 1) && at(0, 1) !== 'R' ? 'roofEaveBottom' : 'roofEaveTop'];
    case 'f': return TILE_INDEX.fence;
    case '~': return TILE_INDEX[v(2, 5) ? 'water1' : 'water0'];
    case '=':
      if (at(-1, 0) !== '=') return TILE_INDEX.bridgeLeft;
      if (at(1, 0) !== '=') return TILE_INDEX.bridgeRight;
      return TILE_INDEX.bridgeMid;
    case 'w': case 'O': return TILE_INDEX[`wood${v(2, 7)}`];
    case 'I': return TILE_INDEX[at(0, 1) === 'I' || at(0, 1) === 'E' || at(0, 1) === undefined ? 'wallTop' : 'wallFace'];
    case 'E': return TILE_INDEX.wallDoor;
    case 'T': return TILE_INDEX.desk;
    case 'B': return TILE_INDEX.shelf;
    case 'H': return TILE_INDEX.bars;
    case 'g': return TILE_INDEX[`grass${v(2, 9)}`];
    case 'p': return TILE_INDEX.path;
    case 'G': return TILE_INDEX.grave;
    case 'U': return TILE_INDEX.openGrave;
    case 'c': return TILE_INDEX.charred;
    case 'r': return TILE_INDEX.rubble;
    case 'Y': return TILE_INDEX.deadTree;
    case 's': case 'K': return TILE_INDEX.stone;
    case '|': return TILE_INDEX[at(0, 1) === '|' || at(0, 1) === undefined ? 'cryptTop' : 'cryptFace'];
    case 'A': return TILE_INDEX.altar;
    case 'P': return TILE_INDEX[v(2, 11) ? 'planks1' : 'planks0'];
    case 'Q': return TILE_INDEX.quay;
    case 'C': return TILE_INDEX.crate;
    case 'V': return TILE_INDEX.barrel;
    default: throw new Error(`Unbekanntes Kartenzeichen "${ch}" bei ${x},${y}`);
  }
}

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('world');
  }

  preload() {
    preloadSprites(this);
  }

  create() {
    this.state = this.registry.get('state');
    this.ui = this.registry.get('ui');
    this.mapDef = this.state.content.maps[this.state.map];
    this.interactables = [];
    this.conditional = []; // Objekte mit visible_if
    this.lamps = []; // Laternen, die per Bedingung an- oder ausgehen
    this.hidden = []; // nur in der Geistsicht sichtbar
    this.cleanups = [];
    this.leaving = false;
    this.focus = null;
    this.pending = null;
    this.playerBusy = false;
    this.aura = null;
    this.cracks = null;

    createTextures(this);
    this.buildMap();
    const amb = this.mapDef.ambient ?? {};
    this.lighting = new Lighting(this, { width: VIEW_W, height: VIEW_H });
    this.baseNight = amb.night ?? 0.88;
    this.blockers = this.physics.add.staticGroup();
    this.buildLamps();
    this.buildWindows();
    this.buildObjects();
    this.buildNpcs();
    this.buildPlayer();
    this.roamers = new Roamers(this);
    this.roamers.build();
    this.roamers.buildCaches();
    this.buildAtmosphere(amb);
    this.buildWeather();
    this.bindInput();
    this.bindState();
    this.refreshVisibility();
    this.buildGoalMarker();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanups.forEach((fn) => fn()));
    this.cameras.main.fadeIn(350, 0, 0, 0);
    this.ui.onSceneReady(this);
  }

  // --- Aufbau ---------------------------------------------------------------

  buildMap() {
    const rows = this.mapDef.rows;
    this.mapW = rows[0].length * TILE;
    this.mapH = rows.length * TILE;
    const data = rows.map((row, y) => [...row].map((_, x) => tileIndexFor(rows, x, y, this.mapDef.tiles, this.mapDef.facade)));
    const map = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0);
    this.groundLayer = map.createLayer(0, tileset, 0, 0).setDepth(0);
    this.groundLayer.setCollision(SOLID_KEYS.map((k) => TILE_INDEX[k]));
    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);
  }

  forEachTile(chars, fn) {
    this.mapDef.rows.forEach((row, y) => [...row].forEach((ch, x) => chars.includes(ch) && fn(x, y, ch)));
  }

  addBlocker(x, y, w, h) {
    const zone = this.add.zone(x, y, w, h);
    this.physics.add.existing(zone, true);
    this.blockers.add(zone);
    return zone;
  }

  buildLamps() {
    const vision = () => this.state.spiritVision;
    // Zusätzliche Lichtquellen aus der Karte (z. B. Wasserschimmer am Brunnen)
    for (const l of this.mapDef.lights ?? []) {
      const [tx, ty] = l.tile;
      this.lighting.add({ x: tx * TILE + 8, y: ty * TILE + 8, radius: l.radius ?? 60, intensity: l.intensity ?? 0.6,
        color: Number.parseInt((l.color ?? '#6a9ad0').slice(1), 16), glowAlpha: l.glow ?? 0.2, flicker: l.flicker ?? 0.06 });
    }
    this.forEachTile(['L', 'X', 'O', 'K'], (tx, ty, ch) => {
      const x = tx * TILE + 8;
      const y = ty * TILE + 15;
      if (ch === 'L' || ch === 'X') {
        const lit = ch === 'L';
        this.add.image(x, y + 1, lit ? 'lamp_lit' : 'lamp_frost').setOrigin(0.5, 1).setDepth(100 + y);
        this.addBlocker(x, y - 2, 6, 4);
        if (lit) this.lighting.add({ x, y: y - 36, radius: 78, intensity: 1, color: 0xffb860, glowAlpha: 0.32, flicker: 0.12 });
        else this.lighting.add({ x, y: y - 36, radius: 34, intensity: 0.55, color: 0x6fe0d0, glowAlpha: 0.35, flicker: 0.3, active: vision });
      } else if (ch === 'O') {
        this.add.image(x, y + 1, 'oil_lamp').setOrigin(0.5, 1).setDepth(100 + y);
        this.addBlocker(x, y - 2, 6, 4);
        this.lighting.add({ x, y: y - 22, radius: 70, intensity: 1, color: 0xffb060, glowAlpha: 0.28, flicker: 0.08 });
      } else {
        this.add.image(x, y - 7, 'candle').setDepth(100 + y);
        this.lighting.add({ x, y: y - 10, radius: 40, intensity: 0.9, color: 0xffa050, glowAlpha: 0.3, flicker: 0.25 });
      }
    });
  }

  buildWindows() {
    // Elendsviertel und Fabriken: die meisten Fenster sind dunkel oder vernagelt
    const dim = { slum: 0.18, fabrik: 0.3 }[this.mapDef.facade] ?? 0.5;
    this.mapDef.rows.forEach((row, ty) => {
      for (const m of row.matchAll(/W+/g)) {
        const x = (m.index + m[0].length / 2) * TILE;
        this.lighting.add({ x, y: ty * TILE + 8, radius: 22 + m[0].length * 6, intensity: dim, color: 0xffa040, glowAlpha: 0.14, flicker: 0.04 });
      }
    });
  }

  registerVisibility(obj, def, parts) {
    if (def.visible_if) this.conditional.push({ obj, def, parts });
  }

  buildObjects() {
    for (const def of this.mapDef.decor ?? []) {
      const [tx, ty] = def.tile;
      if (!this.textures.exists(def.sprite)) continue; // nur PNG-Deko ohne Platzhalter
      const [ox, oy] = def.offset ?? [0, 0];
      const x = tx * TILE + 8 + ox;
      const y = ty * TILE + 8 + oy;
      const img = this.add.sprite(x, y, def.sprite, def.frame ?? 0).setAlpha(def.alpha ?? 0.85);
      if (def.origin) img.setOrigin(...def.origin);
      else if (PROP_ORIGINS[def.sprite]) img.setOrigin(0.5, PROP_ORIGINS[def.sprite]);
      if (def.flip) img.setFlipX(true);
      // ysort: Tiefe nach Fußpunkt, damit Figuren davor oder dahinter stehen können
      img.setDepth(def.ysort ? 100 + img.y + img.displayHeight * (1 - img.originY) : def.depth ?? 50);
      if (def.anim) playSheetAnim(img, ...def.anim);
      else if (this.anims.exists(def.sprite)) img.play({ key: def.sprite, startFrame: Math.floor(hash2(tx, ty, 1) * (img.texture.frameTotal - 1)) });
      if (def.solid) this.addBlocker(x + (def.solid[2] ?? 0), y + (def.solid[3] ?? 0), def.solid[0], def.solid[1]);
      if (def.light) {
        const l = def.light;
        this.lighting.add({ x: x + (l.dx ?? 0), y: y + (l.dy ?? 0), radius: l.radius ?? 50, intensity: l.intensity ?? 0.8,
          color: Number.parseInt((l.color ?? '#ffb060').slice(1), 16), glowAlpha: l.glow ?? 0.25, flicker: l.flicker ?? 0.12 });
      }
      if (def.hidden) this.hidden.push(img);
      this.registerVisibility(null, def, [img]);
    }
    for (const def of this.mapDef.interactables ?? []) {
      const [tx, ty] = def.tile;
      const x = tx * TILE + 8;
      const y = ty * TILE + 8;
      const item = { kind: def.kind ?? 'clue', def, x, y, hidden: !!def.hidden, prompt: def.prompt, reach: def.reach ?? INTERACT_RANGE, active: true, parts: [] };
      if (def.sprite?.startsWith('npc:')) {
        // Gegner in Menschengestalt: Figur aus dem Lauf-Sheet (Frame 0 = nach unten)
        const id = def.sprite.slice(4);
        createCharacterSheet(this, `npc_${id}`, this.state.content.npcs[id].palette);
        item.sprite = this.add.sprite(x, y + 7, `npc_${id}`, 0).setOrigin(0.5, 1).setDepth(100 + y + 7);
        item.parts.push(item.sprite);
      } else if (def.sprite) {
        item.sprite = this.add.sprite(x, y, def.sprite).setDepth(50);
        if (PROP_ORIGINS[def.sprite]) item.sprite.setOrigin(0.5, PROP_ORIGINS[def.sprite]).setDepth(100 + y + 8);
        // Animiertes PNG (z. B. blubbernder Kessel); fehlt es, bleibt das Standbild
        if (def.anim) {
          item.idleAnim = def.anim;
          playSheetAnim(item.sprite, ...def.anim);
        }
        item.parts.push(item.sprite);
        if (item.hidden) this.hidden.push(item.sprite);
      }
      if (def.lamp) this.buildLamp(x, ty * TILE + 16, def.lamp);
      const isClue = item.kind === 'clue' || item.kind === 'read';
      if (def.marker ?? isClue) {
        item.glint = this.add.image(x + 3, y - 5, 'glint').setDepth(60).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
        item.parts.push(item.glint);
        this.tweens.add({ targets: item.glint, alpha: 0.9, duration: 700, yoyo: true, repeat: -1, repeatDelay: 1800 + Math.random() * 1500, delay: Math.random() * 2000 });
      }
      if (item.kind === 'combat') {
        this.lighting.add({ x, y: y - 4, radius: 30, intensity: 0.6, color: 0x6fe0d0, glowAlpha: 0.35, flicker: 0.25, active: () => item.active });
      }
      if (def.solid) item.blocker = this.addBlocker(x, y + 2, def.solid[0] ?? 16, def.solid[1] ?? 12);
      if (def.sprite_scale) item.sprite?.setScale(def.sprite_scale).setOrigin(0.5, 0.75);
      if (item.hidden) {
        item.light = this.lighting.add({ x, y, radius: 22, intensity: 0.7, color: 0x6fe0d0, glowAlpha: 0.4, flicker: 0.2, active: () => this.state.spiritVision && item.active });
      }
      this.interactables.push(item);
      this.registerVisibility(item, def, item.parts);
    }
  }

  /** Laterne, die brennt, sobald die Bedingung `litIf` erfüllt ist (sonst vereist). */
  buildLamp(x, y, litIf) {
    const isLit = () => this.state.meets(litIf);
    const frost = this.add.image(x, y, 'lamp_frost').setOrigin(0.5, 1).setDepth(100 + y);
    const lit = this.add.image(x, y, 'lamp_lit').setOrigin(0.5, 1).setDepth(100 + y);
    this.addBlocker(x, y - 3, 6, 4);
    this.lighting.add({ x, y: y - 37, radius: 78, intensity: 1, color: 0xffb860, glowAlpha: 0.32, flicker: 0.12, active: isLit });
    this.lighting.add({ x, y: y - 37, radius: 34, intensity: 0.55, color: 0x6fe0d0, glowAlpha: 0.35, flicker: 0.3, active: () => !isLit() && this.state.spiritVision });
    this.lamps.push({ frost, lit, isLit });
  }

  buildNpcs() {
    for (const def of this.mapDef.npcs ?? []) {
      const npc = this.state.content.npcs[def.id];
      if (!npc) throw new Error(`Unbekannte Figur: ${def.id}`);
      const key = `npc_${def.id}`;
      createCharacterSheet(this, key, npc.palette);
      const [tx, ty] = def.tile;
      const x = tx * TILE + 8;
      const y = ty * TILE + 15;
      const facing = def.facing ?? 'down';
      const sprite = this.add.sprite(x, y, key, DIRS.indexOf(facing) * 4).setOrigin(0.5, 1).setDepth(100 + y);
      const blocker = this.addBlocker(x, y - 3, 10, 6);
      const item = {
        kind: 'npc', def: { ...npc, ...def, dialogue: def.dialogue ?? npc.dialogue }, sprite, blocker, x, y: y - 4,
        prompt: `Mit ${npc.name} sprechen`, facing, reach: def.reach ?? INTERACT_RANGE, active: true, parts: [sprite],
      };
      this.interactables.push(item);
      this.registerVisibility(item, def, item.parts);
    }
  }

  buildPlayer() {
    createCharacterSheet(this, 'player', PLAYER_PALETTE);
    DIRS.forEach((dir, row) => {
      if (this.anims.exists(`walk-${dir}`)) return;
      this.anims.create({ key: `walk-${dir}`, frames: this.anims.generateFrameNumbers('player', { start: row * 4, end: row * 4 + 3 }), frameRate: 8, repeat: -1 });
    });
    let px;
    let py;
    if (this.state.position) {
      [px, py] = this.state.position;
      this.state.position = null;
    } else {
      const spawns = this.mapDef.spawns;
      const [tx, ty] = spawns[this.state.spawn] ?? spawns.default;
      px = tx * TILE + 8;
      py = ty * TILE + 15;
    }
    this.player = this.physics.add.sprite(px, py, 'player', 0).setOrigin(0.5, 1);
    this.player.body.setSize(10, 6).setOffset(3, 26);
    this.player.setCollideWorldBounds(true);
    this.facing = 'down';
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, this.blockers);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, Math.max(this.mapW, VIEW_W), Math.max(this.mapH, VIEW_H));
    if (this.mapW < VIEW_W || this.mapH < VIEW_H) {
      cam.setBounds(-(VIEW_W - Math.min(this.mapW, VIEW_W)) / 2, -(VIEW_H - Math.min(this.mapH, VIEW_H)) / 2, Math.max(this.mapW, VIEW_W), Math.max(this.mapH, VIEW_H));
    }
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.setRoundPixels(true);
    cam.setBackgroundColor('#06070d');

    this.lighting.add({ follow: this.player, offsetX: 0, offsetY: -14, radius: 46, intensity: 0.6, color: 0xffc888, glowAlpha: 0.12, flicker: 0.06 });
  }

  buildAtmosphere(amb) {
    const fog = amb.fog ?? 0.4;
    this.fogA = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog_a').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.fog).setAlpha(fog);
    this.fogB = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog_b').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.fog).setAlpha(fog * 0.6);
    this.visionOverlay = this.add.rectangle(0, 0, VIEW_W, VIEW_H, 0x30c0a8, 0.1)
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.vision).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
    this.applyVision(this.state.spiritVision);
  }

  /** Wetter (Paket C): Raster aus 64er-Kacheln über dem Bild, z. B. Regen am Hafen. */
  buildWeather() {
    const kind = this.mapDef.weather ?? MAP_WEATHER[this.mapDef.id];
    if (!kind) return;
    if (kind === 'fog') {
      // Die Nebelkacheln aus C_08 sind nicht nahtlos (harte 64er-Kanten): stattdessen den Nebel dichter machen
      this.fogA.setAlpha(Math.min(0.9, this.fogA.alpha * 1.8 + 0.15));
      this.fogB.setAlpha(Math.min(0.7, this.fogB.alpha * 1.8 + 0.1));
      return;
    }
    if (!this.textures.exists('weather')) return;
    for (let gy = 0; gy < Math.ceil(VIEW_H / 64); gy++) {
      for (let gx = 0; gx < Math.ceil(VIEW_W / 64); gx++) {
        const w = this.add.sprite(gx * 64, gy * 64, 'weather', 0).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.dark + 2)
          .setAlpha(0.35);
        if (!playSheetAnim(w, 'weather', kind)) { w.destroy(); return; }
        w.anims.setProgress(hash2(gx, gy, 3));
      }
    }
  }

  /** Kurze Spieleraktion (Paket C): door, pickup, read, rest, badge. Blockiert solange die Bewegung. */
  playPlayerAction(name) {
    const p = this.player;
    if (this.playerBusy || !this.textures.exists('player_extras')) return;
    const done = () => { this.playerBusy = false; p.setTexture('player', DIRS.indexOf(this.facing) * 4); };
    if (playSheetAnim(p, 'player_extras', name, done)) this.playerBusy = true;
  }

  bindInput() {
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.input.keyboard.addCapture('TAB,SPACE');
    // Aktionen per Event statt JustDown: so geht auch ein sehr kurzer Tastendruck nicht verloren.
    this.pending = null;
    const queue = (action) => (e) => { if (!e.repeat) this.pending = action; };
    this.input.keyboard.on('keydown-E', queue('interact'));
    this.input.keyboard.on('keydown-Q', queue('vision'));
    this.input.keyboard.on('keydown-J', queue('notebook'));
    this.input.keyboard.on('keydown-TAB', queue('notebook'));
    this.input.keyboard.on('keydown-I', queue('inventory'));
    this.input.keyboard.on('keydown-P', queue('pathway'));
  }

  bindState() {
    const s = this.state;
    const refresh = () => this.refreshVisibility();
    this.cleanups.push(
      s.on('vision', (on) => this.applyVision(on)),
      s.on('clue', (id) => {
        for (const it of this.interactables) {
          if (it.def.clue === id && it.glint) { it.glint.destroy(); it.parts = it.parts.filter((p) => p !== it.glint); it.glint = null; }
        }
        refresh();
      }),
      s.on('changed', refresh),
      s.on('conclusion', refresh),
      s.on('quest', refresh),
      s.on('ascend', ({ pathway }) => this.playDrinkFx(pathway)),
      s.on('unruhe', () => this.updateCracks()),
    );
    this.updateCracks();
    // Paket G: pulsierender Rand in Gefahrengebieten
    if (this.mapDef.danger && this.textures.exists('g_gefahr_vignette')) {
      this.add.sprite(0, 0, 'g_gefahr_vignette').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.vision + 1)
        .setAlpha(0.35 + 0.08 * this.mapDef.danger).play('g_gefahr_vignette');
    }
    // Bereits bekannte Hinweise: kein Funkeln mehr
    for (const it of this.interactables) {
      if ((it.def.clue && s.hasClue(it.def.clue)) || (it.def.done_flag && s.flags.has(it.def.done_flag))) {
        it.glint?.destroy();
        it.parts = it.parts.filter((p) => p !== it.glint);
        it.glint = null;
      }
    }
  }

  refreshVisibility() {
    for (const l of this.lamps) {
      const on = l.isLit();
      l.lit.setVisible(on);
      l.frost.setVisible(!on);
    }
    for (const c of this.conditional) {
      const on = this.state.meets(c.def.visible_if);
      if (c.obj) c.obj.active = on;
      for (const p of c.parts) {
        if (!p.active) continue;
        const hiddenNow = this.hidden.includes(p) && !this.state.spiritVision;
        p.setVisible(on && !hiddenNow);
      }
      if (c.obj?.blocker) c.obj.blocker.body.enable = on;
    }
  }

  applyVision(on) {
    for (const o of this.hidden) {
      const owner = this.conditional.find((c) => c.parts.includes(o));
      o.setVisible(on && (!owner || this.state.meets(owner.def.visible_if)));
    }
    this.visionOverlay.setVisible(on);
    this.setVisionFx(on);
    this.updateAura();
    this.lighting.nightAlpha = on ? Math.max(0.5, this.baseNight - 0.1) : this.baseNight;
  }

  /** Teil-Entsättigung + Vignette per WebGL-Post-FX (fällt bei Canvas-Renderer einfach weg). */
  setVisionFx(on) {
    const fx = this.cameras.main.postFX;
    if (!fx) return;
    try {
      fx.clear();
      if (on) {
        const cm = fx.addColorMatrix();
        cm.saturate(-0.55);
        cm.brightness(1.08, true);
        fx.addVignette(0.5, 0.5, 0.75, 0.45);
      }
    } catch (e) {
      console.warn('Post-FX nicht verfügbar', e);
    }
  }

  // --- Spielschleife ----------------------------------------------------------

  update(time, delta) {
    const blocked = this.ui.isBlocking() || this.leaving;
    if (!blocked) this.state.tick(delta / 1000);
    this.updateMovement(blocked);
    this.roamers.update(time, delta, blocked || this.leaving);
    this.updateFocus(blocked);
    this.checkAuto(blocked);
    this.handleKeys(blocked);
    this.lighting.update(time);
    this.updateGoalMarker(time);
    const cam = this.cameras.main;
    this.fogA.setTilePosition(cam.scrollX * 0.9 + time * 0.006, cam.scrollY * 0.9 + time * 0.002);
    this.fogB.setTilePosition(cam.scrollX * 1.1 - time * 0.004, cam.scrollY * 1.1);
  }

  updateMovement(blocked) {
    if (this.playerBusy) { this.player.setVelocity(0, 0); return; }
    const k = this.keys;
    let vx = 0;
    let vy = 0;
    if (!blocked) {
      vx = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
      vy = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0);
    }
    const v = new Phaser.Math.Vector2(vx, vy).normalize().scale(PLAYER_SPEED);
    this.player.setVelocity(v.x, v.y);
    if (vx || vy) {
      this.facing = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
      this.player.anims.play(`walk-${this.facing}`, true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(DIRS.indexOf(this.facing) * 4);
    }
    this.player.setDepth(100 + this.player.y);
    if (this.aura) {
      this.aura.setPosition(this.player.x, this.player.y + 2);
    }
  }

  // --- Paket A: Trank, Kessel, Aura, Kontrollrisse --------------------------------------

  /** Trinkanimation und Aufstiegs-Funken (nach erfolgreichem Trank). */
  playDrinkFx(pathway) {
    const p = this.player;
    const done = () => { this.playerBusy = false; p.setTexture('player', DIRS.indexOf(this.facing) * 4); this.updateAura(); };
    if (playSheetAnim(p, 'player_drink', 'drink', done)) this.playerBusy = true;
    else this.updateAura();
    if (!this.textures.exists('potion_ascend')) return;
    const fx = this.add.sprite(p.x, p.y - 12, 'potion_ascend').setDepth(p.depth + 1).setBlendMode(Phaser.BlendModes.ADD);
    const color = this.state.content.pathways[pathway]?.color;
    if (color) fx.setTint(Number.parseInt(color.slice(1), 16));
    this.time.delayedCall(450, () => playSheetAnim(fx, 'potion_ascend', 'ascend', () => fx.destroy()) || fx.destroy());
  }

  /** Kessel-Animation nach dem Brauen (Erfolg oder Fehlschlag), danach wieder Blubbern. */
  playBrewFx(ok) {
    const k = this.interactables.find((it) => it.kind === 'brew' && it.idleAnim);
    if (!k) return;
    const back = () => playSheetAnim(k.sprite, ...k.idleAnim);
    playSheetAnim(k.sprite, ok ? 'cauldron_success' : 'cauldron_fail', ok ? 'success' : 'fail', back);
  }

  // --- Paket H: Untersuchen ----------------------------------------------------------------

  /** Spieler liest, zuckt zurück, hält den Kopf oder notiert (beim Untersuchen eines Fundstücks). */
  playInspect(name) {
    const p = this.player;
    if (!p || this.leaving) return;
    const done = () => { this.playerBusy = false; p.setTexture('player', DIRS.indexOf(this.facing) * 4); };
    if (playSheetAnim(p, 'player_inspect', name, done)) this.playerBusy = true;
  }

  /** Risiko-Effekt über dem Bild: unrest (Unruhe), curse (Fluch), ambush (Hinterhalt), bonus_clue (Hinweis). */
  playRiskFx(kind) {
    if (!this.textures.exists('risk_fx')) return;
    this.riskFx?.destroy();
    const fx = this.add.sprite(0, 0, 'risk_fx', 0).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.vision + 2);
    this.riskFx = fx;
    const end = () => { if (this.riskFx === fx) this.riskFx = null; fx.destroy(); };
    if (!playSheetAnim(fx, 'risk_fx', kind, end)) { end(); return; }
    if (kind === 'unrest') this.time.delayedCall(2000, () => this.tweens.add({ targets: fx, alpha: 0, duration: 400, onComplete: end }));
  }

  /** Pfad-Aura um die Figur, sichtbar mit Geistsicht. */
  updateAura() {
    const pid = this.state.pathway?.id;
    const show = pid && this.state.spiritVision && this.textures.exists('aura_pfade');
    if (!show) { this.aura?.setVisible(false); return; }
    if (!this.aura) this.aura = this.add.sprite(0, 0, 'aura_pfade').setOrigin(0.5, 1).setAlpha(0.7).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.dark + 1); // über der Dunkelheit, wie ein Leuchten
    if (this.aura.anims.currentAnim?.key !== `aura_pfade-${pid}`) playSheetAnim(this.aura, 'aura_pfade', pid);
    this.aura.setVisible(true).setPosition(this.player.x, this.player.y + 2);
  }

  /** Risse am Bildrand, wenn die Unruhe hoch ist (ab 50). */
  updateCracks() {
    if (!this.textures.exists('control_cracks')) return;
    const u = this.state.unruhe ?? 0;
    const frame = u >= 90 ? 3 : u >= 80 ? 2 : u >= 65 ? 1 : u >= 50 ? 0 : -1;
    if (frame < 0) { this.cracks?.setVisible(false); return; }
    if (!this.cracks) this.cracks = this.add.image(0, 0, 'control_cracks', 0).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.vision + 1).setAlpha(0.85);
    this.cracks.setFrame(frame).setVisible(true);
  }

  updateFocus(blocked) {
    let best = null;
    let bestScore = Infinity;
    if (!blocked) {
      const px = this.player.x;
      const py = this.player.y - 3;
      for (const it of this.interactables) {
        if (!it.active || (it.hidden && !this.state.spiritVision)) continue;
        const d = Phaser.Math.Distance.Between(px, py, it.x, it.y);
        if (d < it.reach && d / it.reach < bestScore) { best = it; bestScore = d / it.reach; }
      }
    }
    this.focus = best;
    this.ui.setPrompt(best ? best.prompt : null);
  }

  /** Objekte mit "auto" lösen von selbst aus (z. B. ein Hinterhalt), sobald man nah genug ist. */
  checkAuto(blocked) {
    if (blocked) return;
    for (const it of this.interactables) {
      if (!it.def.auto || !it.active) continue;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y - 3, it.x, it.y) < it.def.auto) { this.interact(it); return; }
    }
  }

  handleKeys(blocked) {
    const action = this.pending;
    this.pending = null;
    if (blocked || !action) return;
    if (action === 'interact' && this.focus) this.interact(this.focus);
    else if (action === 'vision') this.state.setSpiritVision(!this.state.spiritVision);
    else if (action === 'notebook') this.ui.openNotebook();
    else if (action === 'inventory') this.ui.openNotebook('items');
    else if (action === 'pathway') this.ui.openNotebook('pfad');
  }

  interact(it) {
    const def = it.def;
    if (def.lock && !this.state.meetsLock(def.lock)) {
      this.ui.showMessage(def.title ?? def.prompt, def.lock.text, { footer: def.lock.footer ?? '' });
      return;
    }
    switch (it.kind) {
      case 'npc': {
        const dx = this.player.x - it.sprite.x;
        const dy = this.player.y - it.sprite.y;
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        if (!def.static) it.sprite.setFrame(DIRS.indexOf(dir) * 4);
        this.ui.openDialogue(def, () => it.sprite.setFrame(DIRS.indexOf(it.facing) * 4));
        break;
      }
      case 'dialogue':
        this.ui.openDialogue({ name: def.title, role: def.role ?? '', dialogue: def.dialogue });
        break;
      case 'travel':
        this.playPlayerAction('door');
        this.ui.openTravel(this.state.map);
        break;
      case 'brew':
        this.ui.openBrew();
        break;
      case 'combat':
        this.startCombat(def.encounter);
        break;
      case 'loot':
        this.playPlayerAction('pickup');
        this.roamers.open(it);
        break;
      case 'rest': {
        this.playPlayerAction('rest');
        const healed = this.state.heal(this.state.maxHp);
        this.state.setComposure(100);
        this.ui.showMessage(def.title, def.text, { footer: healed > 0 ? `+${healed} Leben, Nerven beruhigt.` : 'Du bist ausgeruht.' });
        break;
      }
      case 'door':
        this.travelTo(def.to, def.spawn);
        break;
      case 'read': {
        this.playPlayerAction('read');
        const isNew = !def.done_flag || !this.state.flags.has(def.done_flag);
        this.ui.showMessage(def.title, def.text, { footer: def.footer ?? '', scene: def.scene });
        if (isNew) this.state.applyEffects({ ...def.effects, sets_flags: [...(def.effects?.sets_flags ?? []), ...(def.done_flag ? [def.done_flag] : [])] });
        if (isNew && def.lock && def.done_flag) this.state.act('lock');
        break;
      }
      default: { // 'clue'
        this.playPlayerAction('pickup');
        const clue = this.state.clue(def.clue);
        const isNew = this.state.addClue(def.clue);
        if (isNew && it.hidden) this.state.act('hidden_clue');
        this.state.applyEffects(def.effects);
        this.ui.showClue(def.clue, isNew);
        if (!isNew && !clue) throw new Error(`Hinweis fehlt: ${def.clue}`);
      }
    }
  }

  travelTo(mapId, spawn) {
    if (this.leaving) return;
    if (!this.state.content.maps[mapId]) throw new Error(`Unbekannter Ort: ${mapId}`);
    this.leaving = true;
    this.state.setSpiritVision(false);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.state.map = mapId;
      this.state.spawn = spawn ?? 'default';
      this.state.position = null;
      this.state.emit('travel', mapId);
      this.scene.restart();
    });
  }

  /** Pausiert die Welt und startet den Kampfbildschirm. `after(result)` läuft nach dem Kampf, `roamer` ist ein Gegner auf der Karte. */
  startCombat(id, after = null, { roamer = null } = {}) {
    if (this.leaving || this.scene.isActive('combat')) return;
    this.state.pendingCombat = null;
    this.state.setSpiritVision(false);
    this.player.setVelocity(0, 0);
    this.player.anims.stop();
    this.scene.pause();
    this.scene.launch('combat', {
      id,
      deferLoot: !!roamer,
      onDone: (result) => {
        this.scene.resume();
        if (roamer) this.roamers.afterCombat(roamer, result);
        this.refreshVisibility();
        if (result.travel) this.travelTo(result.travel.map, result.travel.spawn);
        after?.(result);
      },
    });
  }

  // --- Wegweiser (verfolgter Auftrag aus dem Journal) -----------------------------

  buildGoalMarker() {
    if (!this.textures.exists('goal_arrow')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x000000, 1).fillTriangle(0, 0, 10, 0, 5, 7);
      g.fillStyle(0xe8c070, 1).fillTriangle(2, 1, 8, 1, 5, 5);
      g.generateTexture('goal_arrow', 10, 8);
      g.destroy();
    }
    this.goalArrow = this.add.image(0, 0, 'goal_arrow').setDepth(DEPTH.vision + 2).setVisible(false);
    // Paket E: gemaltes Auftragszeichen über dem Ziel, solange es im Bild ist
    this.goalMark = this.anims.exists('e_quest_in_progress')
      ? this.add.sprite(0, 0, 'e_quest_in_progress').play('e_quest_in_progress').setDepth(DEPTH.vision + 2).setVisible(false) : null;
    this.goalPos = null;
    this.goalCheck = 0;
  }

  /** Weltposition des Ziels auf dieser Karte (oder der Tür/Stadtkarte dorthin). */
  findGoalPosition() {
    const s = this.state;
    const t = s.tracked ? questTarget(s, s.tracked) : null;
    if (!t || !t.map) return null;
    const id = t.map === s.map ? t.id : nextHop(s.content, s.map, t.map)?.via;
    if (!id) return null;
    const it = this.interactables.find((x) => x.def.id === id && x.active);
    if (!it) return null;
    return { x: it.x, y: it.y - (it.kind === 'npc' ? 26 : 12) };
  }

  updateGoalMarker(time) {
    if (!this.goalArrow) return;
    if (time > this.goalCheck) { this.goalPos = this.findGoalPosition(); this.goalCheck = time + 400; }
    const p = this.goalPos;
    this.goalArrow.setVisible(!!p && !this.leaving);
    this.goalMark?.setVisible(false);
    if (!p) return;
    const view = this.cameras.main.worldView;
    const m = 10;
    const inside = p.x > view.x + m && p.x < view.right - m && p.y > view.y + m && p.y < view.bottom - m;
    if (inside && this.goalMark) {
      this.goalArrow.setVisible(false);
      this.goalMark.setVisible(true).setPosition(p.x, p.y - 4 + Math.sin(time / 180) * 2);
    } else if (inside) {
      this.goalArrow.setPosition(p.x, p.y + Math.sin(time / 180) * 2).setRotation(0);
    } else {
      // Am Bildrand, Spitze zeigt zum Ziel
      const x = Phaser.Math.Clamp(p.x, view.x + m, view.right - m);
      const y = Phaser.Math.Clamp(p.y, view.y + m, view.bottom - m);
      const ang = Math.atan2(p.y - this.player.y, p.x - this.player.x);
      this.goalArrow.setPosition(x, y).setRotation(ang - Math.PI / 2);
    }
  }

  playerPosition() {
    return [Math.round(this.player.x), Math.round(this.player.y)];
  }

  /** Hilfen für automatische Tests im Browser. */
  debugTeleport(tx, ty) {
    this.player.setPosition(tx * TILE + 8, ty * TILE + 15);
    this.player.body.reset(this.player.x, this.player.y);
  }
}
