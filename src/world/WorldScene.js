import { HalbgottRitual } from './HalbgottRitual.js';
import { ritualFx } from './ritualArt.js';
import Phaser from 'phaser';
import { questTarget, leadTarget, nextHop } from '../core/Guide.js';
import { createTextures, createCharacterSheet, hash2, TILE, TILE_INDEX, SOLID_KEYS } from './textures.js';
import { Lighting, DEPTH } from './Lighting.js';
import { WexmoorLife, preloadWexmoorLife, speechBubble } from './WexmoorLife.js';
import { GearOverlay, preloadGear } from './GearOverlay.js';
import { Feste, preloadFeste } from './Feste.js';
import { DunscarLife, preloadDunscarLife } from './DunscarLife.js';
import { KettlegateLife, preloadKettlegateLife } from './KettlegateLife.js';
import { KoopLife } from './Koop.js';
import { SektenLife } from './SektenLife.js';
import { preloadSprites, playSheetAnim, themeKeys, facadeKeys, facadeAtNight, buildingFacades, WX2_TILE_ANIMS, PROP_ORIGINS, MAP_WEATHER, DISGUISE_SHEETS, pathwayArt, P2_LOOKS, skinKeyOf , leseSceneOf, BH_THEME_KEYS, CW_THEME_KEYS, HG_PATHS, HG_FURCHT } from './assets.js';
import { Roamers } from './Roamers.js';
import { Critters } from './Critters.js';
import { Patrols } from './Patrols.js';
import { TapMove } from './TapMove.js';
import { footstepSound, ambienceFor, weatherLoop, randomSoundsFor, worldSound } from '../core/sounds.js';
import { isOutdoorMap } from './assets.js';
import { cityOf } from '../core/Travel.js';
import { Combat } from '../core/Combat.js';
import { p2View } from '../core/Split.js';

export const VIEW_W = 480;
export const VIEW_H = 270;

const PLAYER_SPEED = 72;
const OVERLOAD_SPEED = 0.5; // zu schwer beladen: halbes Tempo
const INTERACT_RANGE = 22;
const DIRS = ['down', 'left', 'right', 'up'];
const P2_TINT = 0x9ab8ff; // Spieler 2: gleiche Figur, kühler Mantel
// Beide Spieler müssen ins Bild passen: so weit dürfen sie auseinander (Pixel)
const LEASH_X = VIEW_W - 48;
const LEASH_Y = VIEW_H - 64;

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

/**
 * Paket R (Wexmoor): Stege auf Pfählen über schwarzem Wasser. `ground` liefert den Belag für
 * Straße ('.') und Gehweg (','), Wasser bekommt an Stegen eine Kante mit Pfählen, der Kai eine Steinkante.
 */
function cBahnhof(theme, ch, at, v, x, y) {
  const k = (g, seed) => pickKey(themeKeys(theme, g), x, y, seed);
  const water = (c) => '~Q='.includes(c ?? '~');
  if (ch === 'P' && !water(at(0, 1)) && !water(at(0, -1))) return k('rails', 7);
  if (ch === '.' && at(0, 1) === 'P') return k('edge', 8);
  if (ch === '.' || ch === ',') return k('floor', 9);
  return THEMES.r_wexmoor(ch, at, v, x, y);
}

function rWexmoor(ground) {
  const deck = 'P.,L=CV';
  return (ch, at, v, x, y) => {
    const k = (g, seed = 0, theme = 'r_wexmoor') => pickKey(themeKeys(theme, g), x, y, seed);
    switch (ch) {
      case '.': case ',': case 'L': return ground(ch, k, x, y);
      case 'P': {
        const run = at(-1, 0) === 'P' || at(1, 0) === 'P';
        return run ? k('floor', 1) : k('wood', 1);
      }
      case 'p': return k('floor', 3, 'r_torf');
      case '=': {
        const [h, vert] = themeKeys('r_wexmoor', 'bridge');
        return at(-1, 0) === '=' || at(1, 0) === '=' ? h : vert;
      }
      case 'Q': return k(at(0, 1) === '~' ? 'quayS' : at(0, -1) === '~' ? 'quayN' : at(-1, 0) === '~' ? 'quayW' : 'quayE', 4);
      case '~': {
        const near = (dx, dy) => deck.includes(at(dx, dy) ?? '~');
        if (near(0, -1)) return k('edgeN', 5);
        if (near(0, 1)) return k('edgeS', 5);
        if (near(-1, 0)) return k('edgeW', 5);
        if (near(1, 0)) return k('edgeE', 5);
        return hash2(x, y, 61) > 0.94 ? k('reeds', 6) : k('water', 6);
      }
      default: return null;
    }
  };
}

/** Kartenthemen: ersetzen einzelne Zeichen durch eigene Tiles (Map-Feld "tiles"). */
/** Theke, Regale und Fässer aus der Taverne (für Innenräume mit eigenem Boden und eigenen Wänden). */
function tavernExtra(ch, at, x, y) {
  if (ch === 'T') {
    const { l, r, len } = runOf(at, 'T');
    if (len < 3) return themeKeys('tavern', 'tableBase')[0]; // kleine Tische: Deko obendrauf
    const [left, mid, right] = themeKeys('tavern', 'bar');
    return l === 0 ? left : r === 0 ? right : mid;
  }
  if (ch === 'B') return pickKey(themeKeys('tavern', 'shelf'), x, y, 7);
  if (ch === 'V') return themeKeys('tavern', 'barrel')[0];
  return null;
}

/**
 * Paket AV (Dunscar): Boden mit seltenen Varianten, Wände mit Front über dem Boden, Kante darüber,
 * das Innere dunkel. `walls` kann die Wände aus einem anderen Blatt nehmen (Bahn nutzt die Kalksteinhäuser).
 */
function dsTheme(theme, { floorChars = '.sgw', walls = theme, mix = [], accent = null, cap = false } = {}) {
  return (ch, at, v, x, y) => {
    const k = (t, g, seed = 0) => pickKey(themeKeys(t, g), x, y, seed);
    if (floorChars.includes(ch)) {
      const r = hash2(x, y, 81);
      let acc = 0;
      for (const [g, p] of mix) if (r > 1 - (acc += p)) return k(theme, g, 2);
      return k(theme, 'floor');
    }
    if (ch !== 'I') return null;
    const wall = (c) => c === undefined || c === 'I';
    if (!wall(at(0, 1))) return accent && hash2(x, y, 82) > 0.8 ? k(walls, accent, 3) : k(walls, 'wallFace', 3);
    if (!wall(at(0, 2))) return k(walls, 'wallTop', 4);
    // CE1 (Calderwick): die oberste Reihe freistehender Häuserblöcke bekommt ebenfalls ein Dach statt Schwarz
    if (cap && !wall(at(0, -1))) return k(walls, 'wallTop', 5);
    return null;
  };
}

const THEMES = {
  ds_stadt: dsTheme('ds_stadt', { mix: [['debris', 0.03]], accent: 'window' }), // ruhiger Boden: keine hellen Kalkkacheln mehr im Raster (Kulisse streut sie vereinzelt)
  ds_bahn: dsTheme('ds_bahn', { walls: 'ds_stadt', mix: [['debris', 0.03]] }),
  ds_bruch: dsTheme('ds_bruch', { mix: [['debris', 0.05], ['wet', 0.03]] }),
  ds_schlucht: dsTheme('ds_schlucht', { mix: [['debris', 0.025]], accent: 'grooves' }),
  ds_innen: dsTheme('ds_innen', { mix: [['wear', 0.05]] }),
  ds_teesaal: dsTheme('ds_teesaal', { mix: [['carpet', 0.3]] }),
  ds_zug: dsTheme('ds_zug', { accent: 'window' }),
  // Paket CI (Briarholt): wie Dunscar, je kalt und warm dasselbe Zellenraster; seltene Bodenvarianten je Thema
  ...Object.fromEntries(BH_THEME_KEYS.map((t) => [t, dsTheme(t, {
    mix: { bh_promenade: [['stain', 0.04], ['wet', 0.05]], bh_kessel: [['wet', 0.06]], bh_glas: [['debris', 0.06]], bh_stille: [['wear', 0.05]], bh_klinik: [['wear', 0.06]],
      bh_labor: [['wear', 0.05]], bh_mutterhaus: [['wear', 0.05]], bh_wurzel: [['debris', 0.06], ['wet', 0.04]] }[t.replace(/_(kalt|warm)$/, '')],
    accent: 'window',
  })])),
  // Paket CE1 (Calderwick): Terrassenpflaster mit Gully und trockenem Beet, Druckerei mit verstreuten Lettern, Amt, Blechgang, Teppich, Küche, Nullfundament
  ...Object.fromEntries(CW_THEME_KEYS.map((t) => [t, dsTheme(t, {
    mix: { cw_terrasse: [['wet', 0.03], ['debris', 0.02]], cw_gleis: [], cw_druckerei: [['debris', 0.08]], cw_amt: [['wear', 0.05]], cw_sortierhalle: [['debris', 0.08], ['wear', 0.03]],
      cw_archivsaal: [['edge', 0.1]], cw_kueche: [['wear', 0.08]], cw_fundament: [['debris', 0.1]] }[t],
    accent: 'window',
    cap: true,
  })])),
  warehouse: roomTheme('warehouse', {
    floorMix: (x, y) => (hash2(x, y, 31) > 0.95 ? themeKeys('warehouse', 'debris')[0] : pickKey(themeKeys('warehouse', 'floor'), x, y, 0)),
  }),
  tavern: roomTheme('tavern', { extra: tavernExtra }),
  // Bisher ungenutzte Innenraum-Tilesets: Boden und Wände eigen, Theke/Regale/Fässer wie in der Taverne
  d_wohnung: roomTheme('d_wohnung', { extra: tavernExtra }),
  b_interieur: roomTheme('b_interieur', { extra: tavernExtra }),
  b_keller: roomTheme('b_keller', { extra: tavernExtra }),
  b_auktion: roomTheme('b_auktion', { extra: tavernExtra }),
  b_sanatorium: roomTheme('b_sanatorium', { extra: tavernExtra }),
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
  // Paket J (Fall 5): Gießerei, Haus Vey und Resonanzkammer
  j_giesserei(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('j_giesserei', g), x, y, seed);
    switch (ch) {
      case 's': { const r = hash2(x, y, 51); return r > 0.94 ? k('slag', 1) : r > 0.86 ? k('sand', 1) : k('floor'); }
      case 'I': {
        const below = at(0, 1);
        if (below === undefined || 'IE'.includes(below)) return k('wallTop', 2);
        return hash2(x, y, 52) > 0.9 ? k('window', 3) : k('wallFace', 3);
      }
      case 'C': return runOf(at, 'C').len >= 6 ? k('sand', 4) : k('crate', 4); // breite Blöcke sind die Gießgrube
      case 'B': return k('shelf', 5);
      case 'T': return k('bench', 6);
      default: return null;
    }
  },
  j_haus_vey(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('j_haus_vey', g), x, y, seed);
    switch (ch) {
      case 'w': return hash2(x, y, 53) > 0.9 ? k('wear', 1) : k('floor');
      case 'I': {
        const below = at(0, 1);
        if (below === undefined || 'IE'.includes(below)) return k('wallTop', 2);
        return hash2(x, y, 54) > 0.9 ? k('picture', 3) : k('wallFace', 3);
      }
      case 'B': return k('cabinet', 4);
      default: return THEMES.tavern(ch, at, v, x, y);
    }
  },
  j_resonanzkammer(ch, at, v, x, y) {
    const keys = (g) => themeKeys('j_resonanzkammer', g);
    const k = (g, seed = 0) => pickKey(keys(g), x, y, seed);
    switch (ch) {
      case 's': {
        // Kreidekreis um den Platz vor der Glocke (8x3 Zellen aus dem Raster)
        const cx = x - 6, cy = y - 9;
        if (cx >= 0 && cx < 8 && cy >= 0 && cy < 3) return `j_resonanzkammer_ring_${cx + [0, 8, 56][cy]}`;
        return k('floor');
      }
      case 'I': {
        const below = at(0, 1);
        if (below !== undefined && !'IE'.includes(below)) return keys('wallFace')[x % 8];
        if (at(0, 2) !== undefined && !'IE'.includes(at(0, 2))) return keys('wallTop')[x % 8];
        return k('wallDark', 2);
      }
      case 'C': return k('dais', 3);
      case 'V': return k('steps', 4);
      default: return null;
    }
  },
  // Paket K (Fall 6): Atelier (rechts die Dunkelkammer), Ballsaal, Spiegelkabinett
  k_atelier(ch, at, v, x, y) {
    const keys = (g) => themeKeys('k_atelier', g);
    const k = (g, seed = 0) => pickKey(keys(g), x, y, seed);
    const dark = x >= 16;
    if ('wC'.includes(ch) && x >= 3 && x <= 5 && y >= 3 && y <= 5) return keys('checker')[(x - 3) + (y - 3) * 3]; // Posierfläche
    switch (ch) {
      case 'w': return dark ? (hash2(x, y, 61) > 0.8 ? k('stain', 1) : k('dark')) : k('floor');
      case 'I': {
        const below = at(0, 1);
        if (below !== undefined && !'IE'.includes(below)) return !dark && y === 1 && x >= 6 && x <= 9 ? keys('skylight')[x - 6] : k('wallFace', 2);
        if (at(0, 2) !== undefined && !'IE'.includes(at(0, 2))) return k('wallTop', 3);
        return k('wallDark', 4);
      }
      default: return THEMES.tavern(ch, at, v, x, y);
    }
  },
  k_ballsaal(ch, at, v, x, y) {
    const keys = (g) => themeKeys('k_ballsaal', g);
    const k = (g, seed = 0) => pickKey(keys(g), x, y, seed);
    const nine = (g, x0, x1, y0, y1) => keys(g)[(x === x0 ? 0 : x === x1 ? 2 : 1) + (y === y0 ? 0 : y === y1 ? 2 : 1) * 3];
    switch (ch) {
      case 'w':
        if (x >= 13 && x <= 22 && y >= 6 && y <= 13) return nine('parquet', 13, 22, 6, 13); // Tanzfläche
        if (x >= 16 && x <= 19 && y >= 14) return nine('carpet', 16, 19, 14, 18); // Läufer zur Tür
        return k('floor');
      case 'I': {
        const below = at(0, 1);
        const side = x === 0 || x === 35;
        if (below !== undefined && !'IE'.includes(below) && !side) {
          const r = hash2(x, y, 62);
          return r > 0.85 ? keys('mirrorFace')[x % 2] : r > 0.72 ? keys('curtainFace')[x % 2] : k('wallFace', 2);
        }
        if (!side && at(0, 2) !== undefined && !'IE'.includes(at(0, 2))) {
          const r = hash2(x, y + 1, 62);
          return r > 0.85 ? keys('mirrorTop')[x % 2] : r > 0.72 ? keys('curtainTop')[x % 2] : k('wallTop', 3);
        }
        return k('wallSide', 4);
      }
      case 'C': return k('stage', 5);
      case 'B': return k('railing', 6);
      default: return THEMES.tavern(ch, at, v, x, y);
    }
  },
  k_spiegelkabinett(ch, at, v, x, y) {
    const keys = (g) => themeKeys('k_spiegelkabinett', g);
    const k = (g, seed = 0) => pickKey(keys(g), x, y, seed);
    switch (ch) {
      case 'w':
        if (y >= 2 && y <= 3 && x >= 10 && x <= 14) return k('chalk', 1); // Kreidezeichen um den Gast
        return hash2(x, y, 63) > 0.97 ? keys('arrow')[0] : k('floor');
      case 'I': {
        const below = at(0, 1);
        if (below !== undefined && !'IE'.includes(below)) return k('wallFace', 2);
        return keys('wallTop')[x % 8];
      }
      case 'B': return k('mirror', 3);
      default: return null;
    }
  },
  // Paket M (Fall 7/8): Kontor mit Kohlenkeller, Waisenhaus (rechts der Schlafsaal), Traumkeller
  m_kontor(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('m_kontor', g), x, y, seed);
    const cellar = x >= 16;
    switch (ch) {
      case 'w': return k('floor');
      case 's': return hash2(x, y, 71) > 0.88 ? k('wet', 1) : k('stone');
      case 'C': return k('coal', 2);
      case 'I': {
        const below = at(0, 1);
        const face = below !== undefined && !'IE'.includes(below);
        if (cellar && x > 16) return face ? k('cellarFace', 3) : k('cellarTop', 3);
        return face ? k('wallFace', 3) : k('wallTop', 4);
      }
      default: return THEMES.tavern(ch, at, v, x, y);
    }
  },
  m_waisenhaus(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('m_waisenhaus', g), x, y, seed);
    const dorm = x >= 16;
    switch (ch) {
      case 'w': return dorm ? k('dorm') : k('floor');
      case 'T': return dorm ? k('under', 1) : THEMES.tavern(ch, at, v, x, y); // Betten stehen als Deko darauf
      case 'I': {
        const below = at(0, 1);
        if (below !== undefined && !'IE'.includes(below)) return k('wallFace', 2);
        if (at(0, 2) !== undefined && !'IE'.includes(at(0, 2))) return hash2(x, y, 72) > 0.85 ? k('window', 3) : k('wallTop', 3);
        return k('wallTop', 4);
      }
      default: return THEMES.tavern(ch, at, v, x, y);
    }
  },
  m_traumkeller(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('m_traumkeller', g), x, y, seed);
    switch (ch) {
      case 's': return hash2(x, y, 73) > 0.85 ? k('threads', 1) : k('floor');
      case 'C': return k('dais', 2);
      case 'I': {
        const below = at(0, 1);
        if (below !== undefined && !'IE'.includes(below)) return k('wallFace', 3);
        if (at(0, 2) !== undefined && !'IE'.includes(at(0, 2))) return k('wallTop', 4);
        return k('wallDark', 5);
      }
      default: return null;
    }
  },
  // Paket R (Wexmoor): Stege, Markt, Oberstadt, Torfstich, Innenräume, Vergessmoor, Leuchtturm
  // Paket C: Bahnhof Wexmoor mit Bahnsteig, Gleisen und Bahnsteigkante; Brücke und Kai bleiben Wexmoor
  c_bahnhof: (ch, at, v, x, y) => cBahnhof('c_bahnhof', ch, at, v, x, y),
  // Paket BT: derselbe Bahnhof auf dem Wexmoor-Blatt (Holzrampen, nasse Kohle)
  c_bahnhof_wx: (ch, at, v, x, y) => cBahnhof('c_bahnhof_wx', ch, at, v, x, y),
  r_wexmoor: rWexmoor((ch, k) => (ch === '.' ? k('floor') : k('wood', 2))),
  r_salzmarkt: rWexmoor((ch, k, x, y) => (ch === '.' ? (hash2(x, y, 62) > 0.8 ? k('sand', 2, 'r_salzmarkt') : k('floor')) : k('wood', 2))),
  r_oberstadt(ch, at, v, x, y) {
    if ('.,L'.includes(ch)) return pickKey(themeKeys('r_oberstadt', 'floor'), x, y, ch === '.' ? 0 : 2);
    return null;
  },
  r_torf(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('r_torf', g), x, y, seed);
    if (ch === 'p') return hash2(x, y, 63) > 0.88 ? k('wet', 1) : k('floor');
    if (ch === 'P') return pickKey(themeKeys('r_wexmoor', at(-1, 0) === 'P' || at(1, 0) === 'P' ? 'floor' : 'wood'), x, y, 1);
    if (ch === '~' && ['P'].some((c) => [at(0, -1), at(0, 1), at(-1, 0), at(1, 0)].includes(c))) return THEMES.r_wexmoor(ch, at, v, x, y);
    if (ch === '~' && !['g', 'p', 'Y', 'r'].some((c) => [at(0, -1), at(0, 1)].includes(c))) return pickKey(themeKeys('r_wexmoor', 'water'), x, y, 6);
    return THEMES.g_marsch(ch, at, v, x, y);
  },
  r_akademie: roomTheme('r_akademie', { floorChars: 'wO.' }),
  r_lucent: roomTheme('r_lucent', { floorChars: 'wO.' }),
  r_wachhaus: roomTheme('r_wachhaus', { floorChars: 'wO.', extra: (ch) => (ch === 'H' ? themeKeys('r_zelle', 'bars')[0] : null) }),
  r_zelle: roomTheme('r_zelle', { floorChars: 'wO.', extra: (ch) => (ch === 'H' ? themeKeys('r_zelle', 'bars')[0] : null) }),
  r_vergessmoor(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('r_vergessmoor', g), x, y, seed);
    if (ch === 'P') return k('floor');
    if (ch === '~') return hash2(x, y, 64) > 0.95 ? k('ghost', 1) : k('water', 1);
    return THEMES.g_marsch(ch, at, v, x, y);
  },
  r_leuchtturm(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('r_leuchtturm', g), x, y, seed);
    switch (ch) {
      case 's': {
        if (x < 10 && y > 23) return hash2(x, y, 65) > 0.5 ? k('sand', 1) : k('floor');
        const r = hash2(x, y, 66);
        return r > 0.96 ? k('ring', 1) : r > 0.93 ? k('glow', 1) : k('floor');
      }
      case 'I': {
        const below = at(0, 1);
        if (below === undefined || below === 'I') {
          const below2 = at(0, 2);
          return below2 !== undefined && below2 !== 'I' ? k('wallTop', 2) : null;
        }
        return hash2(x, y, 67) > 0.8 ? k('niche', 3) : k('wallFace', 3);
      }
      default: return THEMES.g_katakomben(ch, at, v, x, y);
    }
  },
  // Paket V: Gasthaus „Zur Ertrunkenen Glocke“: Planken, geteerte Wände mit Bullaugen, Binsenmatten
  v_glocke: roomTheme('v_glocke', {
    floorChars: 'wO.',
    floorMix: (x, y) => (hash2(x, y, 74) > 0.93 ? themeKeys('v_glocke', 'carpet')[0] : pickKey(themeKeys('v_glocke', 'floor'), x, y, 0)),
    extra: (ch, at, x, y) => {
      if (ch !== 'I') return null;
      const below = at(0, 1);
      if (below === undefined || 'IE'.includes(below)) return pickKey(themeKeys('v_glocke', 'wallTop'), x, y, 2);
      return hash2(x, y, 75) > 0.85 ? themeKeys('v_glocke', 'porthole')[0] : themeKeys('v_glocke', 'wallFace')[0];
    },
  }),
  // Paket S: Salzwatt (Schlick mit Salzkruste, Priele, offenes Meer am Rand, Pfähle, Damm) und die zwei Wexmoor-Zirkel
  s_salzwatt(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('s_salzwatt', g), x, y, seed);
    switch (ch) {
      case 'g': { const r = hash2(x, y, 71); return r > 0.93 ? k('debris', 1) : r > 0.78 ? k('sand', 1) : k('floor'); }
      case 'P': return k('path', 2);
      case 'Y': return k('stakes', 3);
      case '~': {
        const land = [at(0, -1), at(0, 1), at(-1, 0), at(1, 0)].filter((c) => c !== undefined && c !== '~').length;
        return land >= 1 ? k('water', 4) : k('deep', 4);
      }
      default: return THEMES.g_marsch(ch, at, v, x, y);
    }
  },
  // Paket W: Versunkene Altstadt. Häuser ('r') bekommen Kupferdach und Fassade mit Spitzbogenfenstern,
  // Wasser am Ufer ist Flutwasser, weiter draußen tief; 'P' sind Stege auf Pfählen.
  w_altstadt(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('w_altstadt', g), x, y, seed);
    switch (ch) {
      case 'g': return hash2(x, y, 75) > 0.95 ? k('debris', 1) : k('floor');
      case 'P': return at(0, -1) === 'P' || at(0, 1) === 'P' ? k('bridge', 2) : k('wood', 2);
      case 'Y': return k('reeds', 3);
      case 'r': {
        if (at(0, 1) !== 'r') return hash2(x, y, 76) > 0.6 ? k('window', 4) : k('wallFace', 4);
        return at(0, -1) !== 'r' ? k('wallTop', 5) : k('roof', 5);
      }
      case '~': {
        const land = [at(0, -1), at(0, 1), at(-1, 0), at(1, 0)].filter((c) => c !== undefined && c !== '~').length;
        return land >= 1 ? k('water', 6) : k('deep', 6);
      }
      default: return THEMES.g_marsch(ch, at, v, x, y);
    }
  },
  s_lichtlose: roomTheme('s_lichtlose', { floorChars: 'wO.', floorMix: (x, y) => pickKey(themeKeys('s_lichtlose', hash2(x, y, 72) > 0.85 ? 'ash' : 'floor'), x, y, 0) }),
  s_salz: roomTheme('s_salz', { floorChars: 'wO.', floorMix: (x, y) => pickKey(themeKeys('s_salz', hash2(x, y, 73) > 0.8 ? 'sand' : 'floor'), x, y, 0) }),
  // Paket Q (Wexmoor): Zunders Kahn mit Bullaugen in der Bordwand
  q_kajuete(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('q_kajuete', g), x, y, seed);
    switch (ch) {
      case 'w': case 'O': return hash2(x, y, 91) > 0.9 ? k('wet', 1) : k('floor');
      case 'I': {
        const below = at(0, 1);
        if (below !== undefined && !'IE'.includes(below)) return hash2(x, y, 92) > 0.8 ? k('porthole', 2) : k('wallFace', 3);
        return k('wallTop', 4);
      }
      default: return THEMES.tavern(ch, at, v, x, y);
    }
  },
  // Paket O (Geheime Treffen): Gewölbe der Stillen Waage, Hinterzimmer des Kreidezirkels, Kohlenschuppen
  o_waage(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('o_waage', g), x, y, seed);
    switch (ch) {
      case 's': case 'K': return hash2(x, y, 81) > 0.88 ? k('wet', 1) : k('floor');
      case '|': {
        const below = at(0, 1);
        if (below !== undefined && below !== '|') {
          const r = hash2(x, y, 82);
          return r > 0.9 ? k('grate', 2) : r > 0.75 ? k('niche', 2) : k('wallFace', 3);
        }
        return k('wallTop', 4);
      }
      default: return null;
    }
  },
  o_kreide(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('o_kreide', g), x, y, seed);
    switch (ch) {
      case 'w': return hash2(x, y, 83) > 0.9 ? k('chalk', 1) : k('floor');
      case 'B': return k('shelf', 2);
      case 'I': {
        const below = at(0, 1);
        if (below !== undefined && !'IE'.includes(below)) return k('wallFace', 3);
        return k('wallTop', 4);
      }
      default: return THEMES.tavern(ch, at, v, x, y);
    }
  },
  o_russ(ch, at, v, x, y) {
    const k = (g, seed = 0) => pickKey(themeKeys('o_russ', g), x, y, seed);
    switch (ch) {
      case 'w': return hash2(x, y, 84) > 0.97 ? k('ash', 1) : k('floor');
      case 'I': {
        const below = at(0, 1);
        if (below !== undefined && !'IE'.includes(below)) return k('wallFace', 3);
        return k('wallTop', 4);
      }
      default: return THEMES.warehouse?.(ch, at, v, x, y) ?? null;
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
      // Paket D: eigener Kopfsteinboden, ab und zu Pfützen mit Laternenschein, Kreide und Gullys
      case '.': return pickKey(themeKeys('d_nachtmarkt', hash2(x, y, 47) > 0.9 ? 'accent' : 'floor'), x, y, 48);
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
  /** Kapitel 4: 'world2' ist die rechte Hälfte des Splitscreens in Calderwick, dort läuft Spieler 2 auf seiner eigenen Karte. */
  constructor(key = 'world') {
    super(key);
    this.splitRole = key === 'world2' ? 2 : 1;
  }

  preload() {
    preloadSprites(this);
    preloadWexmoorLife(this); // Paket AE
    preloadGear(this, this.registry.get('state')); // Paket BU: sichtbare Ausrüstung
    preloadFeste(this); // Paket BV: Jahreszeiten und Feste
    preloadDunscarLife(this); // Paket BA/BD
    preloadKettlegateLife(this); // Paket CN
    this.registry.get('audio')?.preload(this);
  }

  /** Paket Y: Schritte im Takt der Laufanimation, Klang je nach Boden. */
  stepSound(delta) {
    this.stepT = (this.stepT ?? 0) - delta;
    if (this.stepT > 0) return;
    this.stepT = 300;
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);
    // CM: im Winter Schnee, im Herbst Laub unter den Schritten im Freien
    // DS: der Schatten (Seq-4-Ritual des Schlüssels) streift nur leise über den Boden
    const shadow = !!this.state.shadowActive?.();
    const step = shadow ? 'schatten_schritt' : footstepSound(this.mapDef.tiles, this.mapDef.rows?.[ty]?.[tx], { season: this.state.season?.(), outdoor: this.outdoor });
    this.registry.get('audio')?.play(step, { volume: 0.6 });
    // DS: unter doppelter Last (Ritual des Eisens) ächzt das Metall bei jedem dritten, vierten Schritt
    if (!shadow && this.state.seq4Kind?.() === 'eisen' && this.state.eisenConditions?.().load >= 1 && Math.random() < 0.25) this.sfx('s4ei_last_aechzt', { volume: 0.7 });
    if (step === 'schritt_laub' && Math.random() < 0.15) this.sfx('saison_laub', { volume: 0.4 }); // Herbstlaub raschelt hin und wieder lauter
  }

  /** Y/CM: Soundeffekt der Welt (still ohne Audio). */
  sfx(id, opts) {
    if (id) this.registry.get('audio')?.play(id, opts);
  }

  /** CM: zweite Schleife für Wetter und Feste neben der Ortsatmo; wechselt mit Jahreszeit und Festtag. */
  updateWeatherLoop() {
    const audio = this.registry.get('audio');
    if (!audio || this.splitRole === 2) return;
    const id = weatherLoop({ mapId: this.state.map, outdoor: this.outdoor, season: this.state.season?.(), fest: this.state.festAktiv?.(cityOf(this.state, this.state.map)) ?? null });
    if (audio.weather === id) return;
    if (audio.weather) audio.stopLoop(audio.weather, 800);
    audio.weather = id;
    if (id) audio.loop(id);
  }

  /** Y/CM: Zufallsklänge des Ortes (Glocke fern, Frösche, Ratten, Kalk rieselt, Kondensat …), jeder in seinem eigenen Takt. */
  updateRandomSounds(delta) {
    if (!this.randomSounds?.length) return;
    for (const r of this.randomSounds) {
      r.t -= delta / 1000;
      if (r.t > 0) continue;
      r.t = r.every * (0.5 + Math.random());
      this.sfx(r.id, { volume: 0.55 });
      if (r.then) for (let i = 0; i < (r.then[2] ?? 1); i++) this.time.delayedCall(r.then[1] + i * 450, () => this.sfx(r.then[0], { volume: 0.6 }));
      if (r.id === 'fest_feuerwerk_start') this.registry.get('music')?.cue?.('fest_feuerwerk'); // CL: Feuerwerksstück zur Festnacht
    }
  }

  /**
   * Paket AD: Gerede. Alle 9–16 Sekunden sagt eine sichtbare Figur in der Nähe einen kurzen Satz,
   * passend zu Karte und Spielstand, ohne die letzten Sätze zu wiederholen.
   */
  updateGossip(delta, blocked) {
    this.gossipT = (this.gossipT ?? 6000) - delta;
    if (this.gossipT > 0 || blocked) return;
    this.gossipT = 9000 + Math.random() * 7000;
    const city = this.mapDef.city ?? 'kettlegate';
    const lines = (this.state.content.gossip?.[city]?.[this.state.map] ?? []).filter((g) => this.state.meets(g));
    if (!lines.length) return;
    const near = this.interactables.filter((i) => i.kind === 'npc' && i.active && i.sprite?.visible
      && Phaser.Math.Distance.Between(i.x, i.y, this.player.x, this.player.y) < 150);
    if (!near.length) return;
    this.gossipSeen ??= [];
    const fresh = lines.filter((g) => !this.gossipSeen.includes(g.text));
    const line = (fresh.length ? fresh : lines)[Math.floor(Math.random() * (fresh.length || lines.length))];
    this.gossipSeen = [...this.gossipSeen.slice(-6), line.text];
    const who = near[Math.floor(Math.random() * near.length)];
    this.gossipBubble?.destroy();
    // Paket AE: gezeichnete Sprechblase mit Zipfel, im Bild gehalten (oben zu knapp → unter die Figur)
    const bubble = speechBubble(this, line.text, who.sprite, this.cameras.main.worldView);
    this.gossipBubble = bubble;
    this.tweens.add({ targets: bubble, alpha: 0.95, duration: 200 });
    this.tweens.add({ targets: bubble, alpha: 0, delay: 3800, duration: 400, onComplete: () => bubble.destroy() });
  }

  /** Paket Y: Hintergrundgeräusch des Ortes (eine Schleife, wechselt mit der Karte). */
  startAmbience() {
    const audio = this.registry.get('audio');
    if (!audio || this.splitRole === 2) return; // Klang folgt Spieler 1

    const id = ambienceFor(this.state.map, this.mapDef);
    if (audio.ambience && audio.ambience !== id) audio.stopLoop(audio.ambience, 600);
    audio.ambience = id;
    if (id) audio.loop(id);
    this.outdoor = isOutdoorMap(this.mapDef);
    this.updateWeatherLoop();
    this.randomSounds = randomSoundsFor(this.state.map, this.mapDef, { night: this.state.isNight?.() ?? false, fest: this.state.festAktiv?.(cityOf(this.state, this.state.map)) ?? null }).map((r) => ({ ...r, t: r.every * (0.3 + Math.random()) }));
    // Y: Geistsicht summt, solange sie an ist (Kartenwechsel schaltet sie aus)
    if (audio.loops?.has('geistsicht_schleife')) audio.stopLoop('geistsicht_schleife', 300);
  }

  create() {
    this.realState = this.registry.get('state');
    // Splitscreen (core/Split.js): die rechte Welt sieht den Spielstand dauerhaft als Spieler 2
    this.state = this.splitRole === 2 ? p2View(this.realState) : this.realState;
    this.split = !!this.realState.splitOn;
    this.ui = this.registry.get('ui');
    const hausGedanke = this.state.hausBetreten?.(this.state.map); // Codex DG: Gast, Trophäen, Heimkehrgedanke
    if (hausGedanke) this.time.delayedCall(600, () => this.state.emit('notice', hausGedanke));
    this.mapDef = this.state.content.maps[this.state.map];
    this.interactables = [];
    this.conditional = []; // Objekte mit visible_if
    this.visitRolls = {}; // CN: Zufallsereignisse werden je Kartenbesuch einmal gewürfelt
    this.lamps = []; // Laternen, die per Bedingung an- oder ausgehen
    this.hidden = []; // nur in der Geistsicht sichtbar
    this.cleanups = [];
    this.coverRects = []; // Sichtschutz vor Grauspähern (Deko mit cover)
    this.leaving = false;
    this.focus = null;
    this.pending = null;
    this.playerBusy = false;
    this.p2 = null; // Sprite von Spieler 2 (lokaler Koop)
    this.p2Facing = 'down';
    this.focus2 = null;
    this.pending2 = null;
    this.aura = null;
    this.cracks = null;

    createTextures(this);
    this.freshVisit = !this.state.position; // Reise oder Start (kein geladener Stand): zählt als echter Kartenbesuch (BQ)
    this.buildMap();
    const amb = this.mapDef.ambient ?? {};
    this.lighting = new Lighting(this, { width: VIEW_W, height: VIEW_H });
    // Kartendunkel; Karten mit `day` sind tagsüber heller (Dunscar: Kalkstadt im Tageslicht)
    this.baseNight = (!this.state.isNight?.() && amb.day !== undefined ? amb.day : amb.night) ?? 0.88;
    this.blockers = this.physics.add.staticGroup();
    this.critters = new Critters(this);
    this.buildLamps();
    this.buildWindows();
    this.buildObjects();
    this.startAmbience();
    this.buildNpcs();
    this.buildPlayer();
    this.roamers = new Roamers(this);
    this.roamers.build();
    this.roamers.buildCaches();
    this.patrols = new Patrols(this);
    this.patrols.build();
    this.buildAtmosphere(amb);
    this.buildWeather();
    this.gearOverlay = new GearOverlay(this); // Paket BU: Hut, Mantel, Waffe, Amulett über der Figur
    this.wexLife = new WexmoorLife(this); // Paket AE: Nieselregen, Nebelbänke und Tiere in Wexmoor
    this.wexLife.build();
    this.dsLife = new DunscarLife(this); // Paket BA/BD: Kalkstaub, Nachtnebel, Krähen, Ziegen, Motten in Dunscar
    this.dsLife.build();
    this.kgLife = new KettlegateLife(this); // Paket CN: Nebel, Niesel, Rußschnee, Tauben, Katzen, Stände und Nachtfenster in Kettlegate
    this.kgLife.build();
    // Paket AI: Koop-Rätsel, Platz-Flags und Geplauder zu zweit (Platz-Flags fallen beim Kartenwechsel weg)
    this.state.syncKoop?.();
    this.koop = new KoopLife(this);
    this.sekten = new SektenLife(this); // BQ/BR: Sekten-Ereignisse, abgeworbene Figuren, Sabotage
    this.sekten.build(this.freshVisit);
    this.feste = new Feste(this); // BV: Jahreszeit draußen, Fest in der Stadt
    this.hg = this.splitRole === 2 ? null : new HalbgottRitual(this); // Seq-4-Rituale: Laternennacht, Schatten, Taubheit, Wächter des Eisens
    this.feste.build();
    this.bindInput();
    this.bindState();
    this.refreshVisibility();
    this.buildGoalMarker();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanups.forEach((fn) => fn()));
    this.cameras.main.fadeIn(350, 0, 0, 0);
    this.layoutSplit();
    if (this.splitRole === 2) this.ui.scene2 = this;
    else this.ui.onSceneReady(this);
  }

  /**
   * Kapitel 4: Splitscreen. Die Hauptwelt zeigt Spieler 1 links, 'world2' Spieler 2 rechts auf seiner eigenen Karte.
   * Ändert sich der Zustand (Ankunft in Calderwick zu zweit, beide Seq 3), baut sich die Hauptwelt neu auf.
   */
  layoutSplit() {
    const half = VIEW_W / 2;
    if (this.splitRole === 2) {
      this.koop = null;
      this.tap = null;
      this.cameras.main.setViewport(half, 0, half, VIEW_H);
      this.add.rectangle(0, 0, 1, VIEW_H, 0x000000, 1).setOrigin(0).setScrollFactor(0).setDepth(100000); // Trennlinie
      this.cleanups.push(this.realState.on('split', (on) => { if (!on) this.scene.stop(); }));
      return;
    }
    this.cleanups.push(this.realState.on('split', () => { if (!this.leaving) this.scene.restart(); }));
    const running = this.scene.isActive('world2') || this.scene.isPaused('world2');
    if (this.split) {
      this.cameras.main.setViewport(0, 0, half, VIEW_H);
      if (!running && this.scene.get('world2')) this.scene.launch('world2');
    } else if (running) this.scene.stop('world2');
    this.ui.setSplit?.(this.split);
  }

  /** Die andere Hälfte des Splitscreens (oder null). */
  splitOther() {
    if (!this.split) return null;
    const other = this.scene.get(this.splitRole === 2 ? 'world' : 'world2');
    return other?.sys?.isActive() || other?.sys?.isPaused() ? other : null;
  }

  // --- Aufbau ---------------------------------------------------------------

  buildMap() {
    const rows = this.mapDef.rows;
    this.mapW = rows[0].length * TILE;
    this.mapH = rows.length * TILE;
    // Paket BT: mehrere Fassaden je Karte, nachts die beleuchtete Variante
    const night = this.state?.isNight?.() ?? false;
    const perHouse = buildingFacades(rows, this.mapDef.facades);
    const facadeAt = (x, y) => { const f = perHouse.get(`${x},${y}`) ?? this.mapDef.facade; return f && night ? facadeAtNight(f) : f; };
    const data = rows.map((row, y) => [...row].map((_, x) => tileIndexFor(rows, x, y, this.mapDef.tiles, facadeAt(x, y))));
    const map = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0);
    this.groundLayer = map.createLayer(0, tileset, 0, 0).setDepth(0);
    this.groundLayer.setCollision(SOLID_KEYS.map((k) => TILE_INDEX[k]));
    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);
    this.animateTiles();
  }

  /** Paket BT: Wasser, Geisterlicht und Lichtrisse in Wexmoor wechseln alle 260 ms zwischen vier Phasen (fx/wexmoor_v2_tileanim.png). */
  animateTiles() {
    const theme = this.mapDef.tiles;
    const spec = WX2_TILE_ANIMS[theme] ?? (theme?.startsWith('r_') || theme === 'c_bahnhof_wx' ? WX2_TILE_ANIMS.r_wexmoor : null);
    if (!spec || !this.textures.exists('tiles')) return;
    const animOf = {};
    for (const [t, groups] of Object.entries(WX2_TILE_ANIMS)) {
      if (t !== theme && t !== 'r_wexmoor') continue; // Oberstadt, Salzmarkt, Torf, Bahnhof nutzen die Wasserzellen von r_wexmoor
      for (const [g, names] of Object.entries(groups)) themeKeys(t, g).forEach((k, i) => { if (names[i]) animOf[TILE_INDEX[k]] = names[i]; });
    }
    const cells = [];
    this.groundLayer.forEachTile((tile) => { const a = animOf[tile.index]; if (a && TILE_INDEX[`wx2anim_${a}_0`] !== undefined) cells.push([tile.x, tile.y, a]); });
    if (!cells.length) return;
    let phase = 0;
    const step = () => {
      phase = (phase + 1) % 4;
      for (const [x, y, a] of cells) this.groundLayer.putTileAt(TILE_INDEX[`wx2anim_${a}_${(phase + x + y) % 4}`], x, y, false);
    };
    step();
    this.time.addEvent({ delay: 260, loop: true, callback: step });
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
      if (def.anim) {
        playSheetAnim(img, ...def.anim);
        this.critters.add(img, def);
      } else if (this.anims.exists(def.sprite)) img.play({ key: def.sprite, startFrame: Math.floor(hash2(tx, ty, 1) * (img.texture.frameTotal - 1)) });
      if (def.solid) this.addBlocker(x + (def.solid[2] ?? 0), y + (def.solid[3] ?? 0), def.solid[0], def.solid[1]);
      // Kapitel 2: Deko mit `cover` verdeckt die Sicht der Grauspäher (Fläche des Bildes, unteres Drittel bis Fuß)
      if (def.cover) this.coverRects.push(new Phaser.Geom.Rectangle(img.x - img.displayWidth / 2, img.y - img.displayHeight * img.originY, img.displayWidth, img.displayHeight));
      if (def.light) {
        const l = def.light;
        this.lighting.add({ x: x + (l.dx ?? 0), y: y + (l.dy ?? 0), radius: l.radius ?? 50, intensity: l.intensity ?? 0.8,
          color: Number.parseInt((l.color ?? '#ffb060').slice(1), 16), glowAlpha: l.glow ?? 0.25, flicker: l.flicker ?? 0.12 });
      }
      if (def.hidden) this.hidden.push(img);
      this.registerVisibility(null, def, [img]);
    }
    for (const def of this.mapDef.interactables ?? []) {
      if (!this.visitAllows(def)) continue;
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
        item.sprite = this.add.sprite(x, y, def.sprite, def.frame).setDepth(50);
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
      // Dunscar-Kulisse: Ausgänge tragen ein Schild mit dem Ziel
      if (def.label) {
        const tag = this.add.text(x, y - (def.label_dy ?? 10), def.label, { fontFamily: 'monospace', fontSize: '8px', color: '#f0ce80', stroke: '#1a1c2c', strokeThickness: 3 })
          .setOrigin(0.5, 1).setDepth(4900).setResolution(2);
        item.parts.push(tag);
      }
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
        item.light = this.lighting.add({ x, y, radius: 22, intensity: 0.7, color: 0x6fe0d0, glowAlpha: 0.4, flicker: 0.2, active: () => this.state.seesHidden() && item.active });
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
      if (def.roam) item.roam = { home: [tx, ty], speed: def.roam.speed ?? 12, radius: def.roam.radius ?? 3, wait: 1500 + Math.random() * 3000, target: null, key };
      this.interactables.push(item);
      this.registerVisibility(item, def, item.parts);
    }
  }

  /**
   * Figuren mit `roam` (Einwohner mit Tagesplan, Pfad-Beyonder in Wexmoor) schlendern um ihre Stelle herum:
   * Pause, dann ein paar Felder in eine Richtung, nie auf feste Kacheln, nie weiter als `radius` von zu Hause.
   */
  updateNpcRoam(delta, blocked) {
    for (const it of this.interactables) {
      const r = it.roam;
      if (!r || !it.active || !it.sprite.visible) continue;
      if (blocked) { if (r.target) { r.target = null; it.sprite.anims?.stop(); } continue; }
      if (!r.target) {
        r.wait -= delta;
        if (r.wait > 0) continue;
        r.wait = 2000 + Math.random() * 4000;
        const [hx, hy] = r.home;
        const tx = hx + Math.round((Math.random() * 2 - 1) * r.radius);
        const ty = hy + Math.round((Math.random() * 2 - 1) * Math.max(1, Math.floor(r.radius / 2)));
        const tile = this.groundLayer.getTileAt(tx, ty);
        if (!tile || tile.collides) continue;
        r.target = { x: tx * TILE + 8, y: ty * TILE + 15 };
      }
      const dx = r.target.x - it.sprite.x;
      const dy = r.target.y - it.sprite.y;
      const dist = Math.hypot(dx, dy);
      const step = (r.speed * delta) / 1000;
      if (dist <= step) {
        it.sprite.setPosition(r.target.x, r.target.y);
        r.target = null;
        it.sprite.anims?.stop();
        it.sprite.setFrame(DIRS.indexOf(it.facing) * 4);
      } else {
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        const anim = `${r.key}-walk-${dir}`;
        if (!this.anims.exists(anim) && this.textures.exists(r.key) && this.textures.get(r.key).frameTotal > DIRS.indexOf(dir) * 4 + 3) {
          this.anims.create({ key: anim, frames: this.anims.generateFrameNumbers(r.key, { start: DIRS.indexOf(dir) * 4, end: DIRS.indexOf(dir) * 4 + 3 }), frameRate: 6, repeat: -1 });
        }
        if (this.anims.exists(anim) && it.sprite.anims?.currentAnim?.key !== anim) it.sprite.play(anim);
        it.facing = dir;
        it.sprite.setPosition(it.sprite.x + (dx / dist) * step, it.sprite.y + (dy / dist) * step);
      }
      it.sprite.setDepth(100 + it.sprite.y);
      it.x = it.sprite.x;
      it.y = it.sprite.y - 4;
      it.blocker.setPosition(it.sprite.x, it.sprite.y - 3);
      it.blocker.body.updateFromGameObject();
    }
  }

  buildPlayer() {
    createCharacterSheet(this, 'player', PLAYER_PALETTE);
    // Lauf-Animationen für den Mantel und jede Verkleidung (Paket R), Schlüssel <sheet>-walk-<dir>
    // Paket AH: dazu die beiden Figuren von Spieler 2 mit ihren Verkleidungen
    const worn = Object.keys(DISGUISE_SHEETS);
    // Paket CO: die zehn Kreaturformen (32x48) laufen mit demselben Schlüsselschema, etwas langsamer (6 fps)
    // Codex DN/DO: Zivilistengestalt der Maske und der Schatten des Schlüssels, je Spielfigur
    const ritualSkins = ['player', ...Object.keys(P2_LOOKS)].flatMap((b) => [`s4ma_zivil_${b}`, `schatten_${b}`]);
    for (const key of [...['player', ...Object.keys(P2_LOOKS)].flatMap((b) => [b, ...worn.map((w) => skinKeyOf(b, w))]), ...HG_PATHS.map((p) => `hg_form_${p}`), ...ritualSkins]) {
      if (!this.textures.exists(key)) continue;
      DIRS.forEach((dir, row) => {
        if (this.anims.exists(`${key}-walk-${dir}`)) return;
        this.anims.create({ key: `${key}-walk-${dir}`, frames: this.anims.generateFrameNumbers(key, { start: row * 4, end: row * 4 + 3 }), frameRate: key.startsWith('hg_form_') ? 6 : 8, repeat: -1 });
      });
    }
    this.playerKey = this.skinKey();
    let px;
    let py;
    // Gespeicherte Stelle nur, wenn sie noch Boden ist (Karten können neu angeordnet worden sein, z. B. Dunscar-Raster)
    const pos = this.state.position;
    const onFloor = pos && /[^I#WDRf~]/.test(this.mapDef.rows?.[Math.floor((pos[1] - 1) / TILE)]?.[Math.floor(pos[0] / TILE)] ?? 'I');
    this.state.position = null;
    if (pos && onFloor) {
      [px, py] = pos;
    } else {
      const spawns = this.mapDef.spawns;
      const [tx, ty] = spawns[this.state.spawn] ?? spawns.default;
      px = tx * TILE + 8;
      py = ty * TILE + 15;
    }
    this.player = this.physics.add.sprite(px, py, this.playerKey, 0).setOrigin(0.5, 1);
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
    // Die Kamera folgt der Mitte zwischen beiden Spielern (allein: dem Ermittler)
    this.camTarget = { x: px, y: py };
    cam.startFollow(this.camTarget, true, 0.12, 0.12);
    cam.setRoundPixels(true);
    cam.setBackgroundColor('#06070d');

    this.lighting.add({ follow: this.player, offsetX: 0, offsetY: -14, radius: 46, intensity: 0.6, color: 0xffc888, glowAlpha: 0.12, flicker: 0.06 });
    // Spieler 2 trägt seine eigene Laterne (leuchtet nur, solange er mitspielt)
    const scene = this;
    this.p2Light = { get x() { return scene.p2?.x ?? scene.player.x; }, get y() { return scene.p2?.y ?? scene.player.y; } };
    this.lighting.add({ follow: this.p2Light, offsetX: 0, offsetY: -14, radius: 40, intensity: 0.5, color: 0xc8d8ff, glowAlpha: 0.1, flicker: 0.06, active: () => !!scene.p2 });
    if (this.state.hasP2() && !this.split) this.spawnP2();
  }

  // --- Spieler 2 (lokaler Koop) -----------------------------------------------------

  /** Spieler 2 erscheint neben dem Ermittler. */
  spawnP2() {
    if (this.p2) return;
    const p = this.player;
    const x = p.x + 14;
    const y = p.y + 2;
    this.p2Key = this.p2SkinKey();
    this.p2 = this.physics.add.sprite(x, y, this.p2Key, 0).setOrigin(0.5, 1);
    if (this.p2Key === 'player') this.p2.setTint(P2_TINT);
    this.p2.body.setSize(10, 6).setOffset(3, 26);
    this.p2.setCollideWorldBounds(true);
    this.p2Colliders = [this.physics.add.collider(this.p2, this.groundLayer), this.physics.add.collider(this.p2, this.blockers)];
    // Steckt er in einer Wand? Dann direkt auf den Ermittler
    if (this.groundLayer?.getTileAtWorldXY?.(x, y - 3)?.collides) this.p2.body.reset(p.x, p.y);
    this.p2Tag = this.add.text(x, y - 34, '2', { fontFamily: 'monospace', fontSize: '8px', color: '#9ab8ff', stroke: '#000', strokeThickness: 2 })
      .setOrigin(0.5, 1).setResolution(2);
    this.tweens.add({ targets: this.p2, alpha: { from: 0, to: 1 }, duration: 300 });
  }

  despawnP2() {
    if (!this.p2) return;
    this.p2Colliders?.forEach((c) => c.destroy());
    this.p2Tag?.destroy();
    this.p2.destroy();
    this.p2 = null;
    this.focus2 = null;
  }

  /** Alle Spielerfiguren auf der Karte. */
  playerSprites() {
    return this.p2 ? [this.player, this.p2] : [this.player];
  }

  /** Nächster Spieler zu einem Punkt (Gegner jagen den, der näher ist). */
  nearestPlayer(x, y) {
    if (!this.p2) return this.player;
    const d1 = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
    const d2 = Phaser.Math.Distance.Between(x, y, this.p2.x, this.p2.y);
    return d2 < d1 ? this.p2 : this.player;
  }

  /** Erstes angeschlossenes Gamepad (steuert Spieler 2). */
  pad() {
    const gp = this.input.gamepad;
    if (!gp || !gp.total) return null;
    return gp.getAll().find((p) => p?.connected) ?? null;
  }

  buildAtmosphere(amb) {
    const fog = amb.fog ?? 0.4;
    this.fogA = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog_a').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.fog).setAlpha(fog);
    this.fogB = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog_b').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.fog).setAlpha(fog * 0.6);
    const welt = this.state.weltTint?.(); // Seq 2: der Weltwandel färbt jede Karte
    if (welt) this.add.rectangle(0, 0, VIEW_W, VIEW_H, welt.color, welt.alpha).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.vision - 1);
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
    const done = () => { this.playerBusy = false; p.setTexture(this.playerKey, DIRS.indexOf(this.facing) * 4); };
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
    // Welt-Fähigkeiten: Zahlenreihe 1–9 für Spieler 1, Ziffernblock für Spieler 2 (allein auch für Spieler 1)
    this.input.keyboard.on('keydown', (e) => {
      if (e.code === 'Numpad0' && !e.repeat && (this.p2 || this.splitRole === 2)) { this.pending2 = 'vision'; return; } // Seb: Ziffernblock 0 = Geistsicht von Spieler 2
      const m = /^(Digit|Numpad)([1-9])$/.exec(e.code ?? '');
      if (!m || e.repeat) return;
      const slot = `talent:${Number(m[2]) - 1}`;
      if (m[1] === 'Numpad' && (this.p2 || this.splitRole === 2)) this.pending2 = slot;
      else this.pending = slot;
    });
    // Handy/Maus: hintippen zum Hinlaufen und Interagieren
    this.tap = new TapMove(this);
    this.setupSignalContext(); // BN: Kollision und Lauscher für Rufwege
    this.input.mouse?.disableContextMenu();
    // Spieler 2: Enter interagiert (Pfeile laufen, siehe updateMovement)
    const p2Siege = () => !!this.hg?.siege && this.hg.siegeWho === 2; // Laternennacht von Spieler 2: Enter/A füllt nach statt zu interagieren
    this.input.keyboard.on('keydown-ENTER', (e) => { if (!e.repeat && (this.p2 || this.splitRole === 2) && !p2Siege()) this.pending2 = 'interact'; });
    this.input.gamepad?.on('down', (pad, button) => {
      if (!this.p2 && this.splitRole !== 2) return;
      if (button.index === 0) { if (!p2Siege()) this.pending2 = 'interact'; } // A
      else if (button.index === 3) this.pending2 = 'inventory'; // Y
      else if (button.index === 2) this.pending2 = 'talent:sel'; // X: gewählte Welt-Fähigkeit
      else if (button.index === 4 || button.index === 5) this.ui.moveTalentSel2(button.index === 4 ? -1 : 1); // LB/RB
    });
  }

  bindState() {
    const s = this.state;
    const refresh = () => this.refreshVisibility();
    this.cleanups.push(
      s.on('vision', () => this.time.delayedCall(0, () => this.applyVision(this.visionOn()))), // nach einem Tausch: wer hier gerade sieht (Spieler 2 per Ziffernblock 0)
      s.on('talent', (e) => { if (e.effect === 'scout') this.scoutEnemies(); }),
      s.on('clue', (id) => {
        for (const it of this.interactables) {
          if (it.def.clue === id && it.glint) { it.glint.destroy(); it.parts = it.parts.filter((p) => p !== it.glint); it.glint = null; }
        }
        refresh();
      }),
      s.on('changed', refresh),
      s.on('conclusion', refresh),
      s.on('clock', () => { this.clockDirty = true; }), // BD: Tageswechsel erst, wenn kein Gespräch/Fenster offen ist
      s.on('signal_route', (r) => this.showSignalRoute(r)), // BN: Ruflinie, Nischen, Suchzone
      s.on('signal_alarm_end', () => this.roamers?.alarmEnd()),
      s.on('signal_lock', () => this.roamers?.alarmEnd()),
      s.on('quest', refresh),
      s.on('ascend', ({ pathway, player, ascension, seq }) => { this.playDrinkFx(pathway, player, seq); if (ascension) this.playAscension(ascension, player); }),
      s.on('form', () => this.updateForm()),
      s.on('unruhe', () => this.updateCracks()),
      s.on('party', () => { if (s.hasP2() && !this.split && this.splitRole !== 2) this.spawnP2(); else this.despawnP2(); }),
    );
    this.updateCracks();
    if (this.state.formActive?.()) this.updateForm();
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

  /**
   * Tageswechsel (BD): Einwohner stehen über das Nachtflag an ihren Tag-/Nachtplätzen, Gegner, Aufseher und
   * Tiere werden neu aufgestellt. Läuft nur außerhalb von Dialogen und Fenstern (Kämpfe halten die Uhr ohnehin an).
   */
  applyClock() {
    this.clockDirty = false;
    this.refreshVisibility();
    this.roamers?.rebuild();
    this.patrols?.rebuild();
    this.dsLife?.rebuild();
    this.kgLife?.rebuild();
  }

  refreshVisibility() {
    for (const l of this.lamps) {
      const on = l.isLit();
      l.lit.setVisible(on);
      l.frost.setVisible(!on);
    }
    for (const c of this.conditional) {
      const on = this.state.sichtbar(c.def);
      if (c.obj) c.obj.active = on;
      for (const p of c.parts) {
        if (!p.active) continue;
        const hiddenNow = this.hidden.includes(p) && !this.state.seesHidden();
        p.setVisible(on && !hiddenNow);
      }
      if (c.obj?.blocker) c.obj.blocker.body.enable = on;
    }
  }

  /** Geistsicht auf dieser Karte: Spieler 1, oder Spieler 2, wenn er hier mitläuft (rechte Hälfte: nur Spieler 2). */
  visionOn() {
    if (this.state.spiritVision) return true;
    return !!this.p2 && !!this.realState.withPlayer(2, () => this.realState.spiritVision, { quiet: true });
  }

  applyVision(on) {
    const hiddenOn = on || this.state.seesHidden(); // Welt-Fähigkeiten zeigen Spuren auch ohne Geistsicht
    for (const o of this.hidden) {
      const owner = this.conditional.find((c) => c.parts.includes(o));
      o.setVisible(hiddenOn && (!owner || this.state.sichtbar(owner.def)));
    }
    this.visionOverlay.setVisible(on);
    this.setVisionFx(on);
    const audio = this.registry.get('audio');
    if (audio) { if (on) audio.loop('geistsicht_schleife'); else audio.stopLoop('geistsicht_schleife', 400); } // Y: leises Schweben, solange die Geistsicht an ist
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

  /** Codex DF: das aktive Tier läuft ein Stück hinter Spieler 1 her (nicht in Gefahrengebieten). */
  updateTier(delta) {
    const id = this.state.tierAktiv?.();
    const show = id && this.player && !this.state.tierGefahr() && this.textures.exists(id);
    if (!show) { if (this.tierSprite) { this.tierSprite.destroy(); this.tierSprite = null; } return; }
    if (!this.tierSprite || this.tierSprite.texture.key !== id) {
      this.tierSprite?.destroy();
      this.tierSprite = this.add.sprite(this.player.x - 12, this.player.y, id, 0).setOrigin(0.5, 1);
      this.tierStep = 0;
    }
    const t = this.tierSprite;
    const dx = this.player.x - t.x;
    const dy = this.player.y - t.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 120) { t.setPosition(this.player.x - 12, this.player.y); return; } // Kartenwechsel oder Sprung
    const moving = dist > 18;
    if (moving) {
      const sp = Math.min(dist - 18, (dist > 40 ? 0.11 : 0.07) * delta);
      t.x += (dx / dist) * sp;
      t.y += (dy / dist) * sp;
      this.tierStep = (this.tierStep + delta / 140) % 4;
    }
    const row = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 1) : dy > 0 ? 0 : 3;
    t.setFrame(row * 4 + (moving ? Math.floor(this.tierStep) : 0));
    t.setDepth(100 + t.y);
  }

  update(time, delta) {
    const blocked = this.ui.isBlocking() || this.leaving;
    if (!blocked && this.splitRole !== 2) this.state.tick(delta / 1000); // im Splitscreen tickt nur die Hauptwelt
    // Codex DL: Erfolge alle 1,5 s prüfen (die erste Prüfung trägt still nach)
    this.erfTimer = (this.erfTimer ?? 0) + delta;
    if (this.erfTimer > 1500 && this.splitRole !== 2) { this.erfTimer = 0; this.state.checkPost?.(); this.state.checkErfolge?.(); }
    this.updateMovement(blocked);
    this.updateTier(delta);
    // Schlüssel Seq 5: die Schattengestalt ist durchscheinend
    this.playerSprites().forEach((q, i) => q.setAlpha(this.state.inShadow?.(i + 1) ? 0.4 : 1));
    const frozen = !!this.hg?.freezesWorld(); // Laternennacht: nur ihre eigenen Wesen bewegen sich
    this.roamers.update(time, delta, blocked || this.leaving || frozen);
    this.patrols.update(time, delta, blocked || this.leaving || frozen);
    this.critters.update(time, delta, blocked);
    this.updateNpcRoam(delta, blocked || frozen);
    this.wexLife?.update(delta);
    this.dsLife?.update(delta);
    this.kgLife?.update(delta);
    if (this.clockDirty && !blocked) { this.applyClock(); this.updateWeatherLoop(); }
    if (!blocked && this.splitRole !== 2) this.updateRandomSounds(delta);
    this.koop?.update(delta, blocked);
    this.feste?.update(delta, blocked);
    this.hg?.update(delta, blocked || this.leaving);
    if (!blocked) this.checkLocks(delta); // BN: Schallschleusen an den Ausgängen
    this.updateFocus(blocked);
    this.checkAuto(blocked);
    this.handleKeys(blocked);
    this.lighting.update(time);
    this.updateGoalMarker(time);
    this.updateGossip(delta, blocked);
    const cam = this.cameras.main;
    this.fogA.setTilePosition(cam.scrollX * 0.9 + time * 0.006, cam.scrollY * 0.9 + time * 0.002);
    this.fogB.setTilePosition(cam.scrollX * 1.1 - time * 0.004, cam.scrollY * 1.1);
  }

  /** Sheet der Spielerfigur: getragene Verkleidung (falls ihr Sheet geladen ist), sonst der Mantel. */
  skinKey() {
    if (this.splitRole === 2) return this.p2SkinKey();
    const ritual = this.ritualSkin(1);
    if (ritual) return ritual;
    const form = this.formKey(1);
    if (form) return form;
    const key = skinKeyOf('player', this.state.disguise?.());
    return this.textures.exists(key) ? key : 'player';
  }

  /** Codex DN/DO: Schatten (Schlüssel, Seq 4) oder Zivilist (Maske, Seq 4) als eigenes Laufblatt der gewählten Figur; sonst null. */
  ritualSkin(n) {
    if (n === 2 && !this.state.p2) return null;
    const kind = this.state.withPlayer(n, () => (this.state.shadowActive?.() ? 'schatten' : this.state.seq4Masked?.() ? 's4ma_zivil' : null), { quiet: true });
    const key = kind && `${kind}_${n === 2 ? this.state.p2Look?.() ?? 'p2a' : 'player'}`;
    return key && this.textures.exists(key) ? key : null;
  }

  /** Paket CO: Sheet der Kreaturform (hg_form_<pfad>), wenn dieser Spieler seine Gestalt trägt und das Sheet geladen ist; sonst null. */
  formKey(n) {
    const pid = this.state.withPlayer(n, () => (this.state.formActive?.() ? this.state.pathway?.id : null), { quiet: true });
    const key = pid && `hg_form_${pid}`;
    return key && this.textures.exists(key) ? key : null;
  }

  /** Kollisionskörper je nach Sheetgröße: Figuren 16x32, Kreaturformen 32x48 (Fußpunkt bleibt derselbe). */
  fitBody(sprite, key) {
    if (key.startsWith('hg_form_')) sprite.body.setSize(10, 6).setOffset(11, 42);
    else sprite.body.setSize(10, 6).setOffset(3, 26);
  }

  /** Paket AH: Sheet von Spieler 2 (gewählte Figur, ggf. verkleidet); ohne Sheet der getönte Ermittler. */
  p2SkinKey() {
    const ritual = this.ritualSkin(2);
    if (ritual) return ritual;
    const form = this.formKey(2);
    if (form) return form;
    const look = this.state.p2Look?.();
    if (!look || !this.textures.exists(look)) return 'player';
    const key = skinKeyOf(look, this.state.withPlayer(2, () => this.state.disguise?.(), { quiet: true }));
    return this.textures.exists(key) ? key : look;
  }

  updateMovement(blocked) {
    this.updateP2Movement(blocked);
    if (this.playerBusy) { this.player.setVelocity(0, 0); this.updateCamTarget(); return; }
    const k = this.keys;
    let vx = 0;
    let vy = 0;
    if (!blocked) {
      // Zu zweit gehören die Pfeiltasten Spieler 2
      // Splitscreen: links nur WASD, rechts nur Pfeile und Gamepad
      const arrows = !this.p2 && (!this.split || this.splitRole === 2);
      const wasd = this.splitRole !== 2;
      vx = ((arrows && k.RIGHT.isDown) || (wasd && k.D.isDown) ? 1 : 0) - ((arrows && k.LEFT.isDown) || (wasd && k.A.isDown) ? 1 : 0);
      vy = ((arrows && k.DOWN.isDown) || (wasd && k.S.isDown) ? 1 : 0) - ((arrows && k.UP.isDown) || (wasd && k.W.isDown) ? 1 : 0);
      const pad = this.splitRole === 2 && !vx && !vy ? this.pad() : null;
      if (pad) {
        const ax = pad.leftStick?.x ?? 0;
        const ay = pad.leftStick?.y ?? 0;
        vx = (pad.right || ax > 0.35 ? 1 : 0) - (pad.left || ax < -0.35 ? 1 : 0);
        vy = (pad.down || ay > 0.35 ? 1 : 0) - (pad.up || ay < -0.35 ? 1 : 0);
      }
      if (vx || vy) this.tap?.cancel(); // Tastatur hat Vorrang
      else if (this.tap?.active) [vx, vy] = this.tap.steer(this.game.loop.delta) ?? [0, 0];
      [vx, vy] = this.leash(this.player, this.p2, vx, vy);
    } else this.tap?.cancel();
    const skin = this.skinKey();
    if (skin !== this.playerKey) { // Verkleidung an- oder abgelegt
      if (!skin.startsWith('hg_form_') && !this.playerKey.startsWith('hg_form_')) this.sfx(worldSound('disguise'));
      this.playerKey = skin;
      this.player.anims.stop();
      this.player.setTexture(skin, DIRS.indexOf(this.facing) * 4);
      this.fitBody(this.player, skin);
    }
    const v = new Phaser.Math.Vector2(vx, vy).normalize().scale(PLAYER_SPEED * (this.state.isOverloaded() ? OVERLOAD_SPEED : 1));
    this.player.setVelocity(v.x, v.y);
    if (vx || vy) {
      this.facing = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
      this.player.anims.play(`${this.playerKey}-walk-${this.facing}`, true);
      this.stepSound(this.game.loop.delta);
    } else {
      this.player.anims.stop();
      this.player.setFrame(DIRS.indexOf(this.facing) * 4);
    }
    this.player.setDepth(100 + this.player.y);
    if (this.formAura?.follow) this.formAura.setPosition(this.formAura.follow.x, this.formAura.follow.y + 1).setDepth(this.formAura.follow.depth - 1);
    this.gearOverlay?.sync();
    if (this.aura) {
      this.aura.setPosition(this.player.x, this.player.y + 2);
    }
    this.updateCamTarget();
  }

  /** Kamera auf die Mitte zwischen beiden Spielern. */
  updateCamTarget() {
    const t = this.camTarget;
    if (!t) return;
    const p = this.player;
    t.x = this.p2 ? (p.x + this.p2.x) / 2 : p.x;
    t.y = this.p2 ? (p.y + this.p2.y) / 2 : p.y;
  }

  /** Unsichtbares Band: niemand läuft dem anderen aus dem Bild. Gibt die erlaubte Richtung zurück. */
  leash(me, other, vx, vy) {
    if (!other) return [vx, vy];
    const dx = me.x - other.x;
    const dy = me.y - other.y;
    if (Math.abs(dx) >= LEASH_X && Math.sign(vx) === Math.sign(dx)) vx = 0;
    if (Math.abs(dy) >= LEASH_Y && Math.sign(vy) === Math.sign(dy)) vy = 0;
    return [vx, vy];
  }

  /** Spieler 2: Pfeiltasten oder Gamepad (Stick/Steuerkreuz). */
  updateP2Movement(blocked) {
    const p = this.p2;
    if (!p) return;
    let vx = 0;
    let vy = 0;
    if (!blocked && !this.playerBusy && !this.p2Busy) {
      const k = this.keys;
      vx = (k.RIGHT.isDown ? 1 : 0) - (k.LEFT.isDown ? 1 : 0);
      vy = (k.DOWN.isDown ? 1 : 0) - (k.UP.isDown ? 1 : 0);
      const pad = this.pad();
      if (pad && !vx && !vy) {
        const ax = pad.leftStick?.x ?? 0;
        const ay = pad.leftStick?.y ?? 0;
        vx = (pad.right || ax > 0.35 ? 1 : 0) - (pad.left || ax < -0.35 ? 1 : 0);
        vy = (pad.down || ay > 0.35 ? 1 : 0) - (pad.up || ay < -0.35 ? 1 : 0);
      }
      [vx, vy] = this.leash(p, this.player, vx, vy);
    }
    const heavy = this.state.withPlayer(2, () => this.state.isOverloaded(), { quiet: true });
    const v = new Phaser.Math.Vector2(vx, vy).normalize().scale(PLAYER_SPEED * (heavy ? OVERLOAD_SPEED : 1));
    p.setVelocity(v.x, v.y);
    const skin = this.p2Busy ? this.p2Key : this.p2SkinKey();
    if (skin !== this.p2Key) { // andere Figur gewählt oder Verkleidung gewechselt
      this.p2Key = skin;
      p.anims.stop();
      p.setTexture(skin, DIRS.indexOf(this.p2Facing) * 4);
      this.fitBody(p, skin);
      if (skin === 'player') p.setTint(P2_TINT); else p.clearTint();
    }
    if (this.p2Busy) {
      // Trinkanimation läuft
    } else if (vx || vy) {
      this.p2Facing = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
      p.anims.play(`${this.p2Key}-walk-${this.p2Facing}`, true);
    } else {
      p.anims.stop();
      p.setFrame(DIRS.indexOf(this.p2Facing) * 4);
    }
    p.setDepth(100 + p.y);
    this.p2Tag?.setPosition(p.x, p.y - 33).setDepth(p.depth + 1);
    // Abgehängt (z. B. hinter einer Tür hängen geblieben)? Zurück zum Ermittler
    if (Math.abs(p.x - this.player.x) > LEASH_X + 40 || Math.abs(p.y - this.player.y) > LEASH_Y + 40) p.body.reset(this.player.x, this.player.y);
  }

  // --- Paket A: Trank, Kessel, Aura, Kontrollrisse --------------------------------------

  /** Trinkanimation und Aufstiegs-Funken (nach erfolgreichem Trank). */
  playDrinkFx(pathway, player = 1, seq = null) {
    const p = player === 2 && this.p2 ? this.p2 : this.player;
    // Paket CO: eigene Trink-Sheets für die großen Tränke (Sequenz 4 = halbgott, 2 = engel)
    const big = seq === 4 ? 'halbgott' : seq === 2 ? 'engel' : null;
    if (p === this.player) {
      const done = () => { this.playerBusy = false; p.setTexture(this.playerKey, DIRS.indexOf(this.facing) * 4); this.updateAura(); };
      if ((big && playSheetAnim(p, `player_drink_${big}`, 'drink', done)) || playSheetAnim(p, 'player_drink', 'drink', done)) this.playerBusy = true;
      else this.updateAura();
    } else if (this.p2Key !== 'player') {
      // Paket AH: Spieler 2 trinkt mit seiner eigenen Figur
      const done = () => { this.p2Busy = false; p.setTexture(this.p2Key, DIRS.indexOf(this.p2Facing ?? 'down') * 4); };
      const look = this.state.p2Look();
      if ((big && playSheetAnim(p, `${look}_drink_${big}`, 'drink', done)) || playSheetAnim(p, `${look}_drink`, 'drink', done)) this.p2Busy = true;
    }
    if (!this.textures.exists('potion_ascend')) return;
    const fx = this.add.sprite(p.x, p.y - 12, 'potion_ascend').setDepth(p.depth + 1).setBlendMode(Phaser.BlendModes.ADD);
    const color = this.state.content.pathways[pathway]?.color;
    if (color) fx.setTint(Number.parseInt(color.slice(1), 16));
    this.time.delayedCall(450, () => playSheetAnim(fx, 'potion_ascend', 'ascend', () => fx.destroy()) || fx.destroy());
  }

  /**
   * Aufstieg zum Halbgott (Sequenz 4) oder Engel (Sequenz 2): weißer Blitz, die Kamera zieht an die Figur heran und
   * zittert, drei Lichtringe in der Pfadfarbe laufen über die Karte, ein Lichtkegel steht Sekunden über der Figur.
   * Die Oberfläche legt dazu ihre Lichtflut mit dem Wort darüber (Ui.playAscension).
   */
  playAscension(asc, player = 1) {
    const who = player === 2 && this.p2 ? this.p2 : this.player;
    if (!who) return;
    const cam = this.cameras.main;
    const color = Number.parseInt((asc.color ?? '#e8c070').slice(1), 16);
    // Paket CO: das Aufstiegs-Vollbild (240x135, acht Frames) liegt bildschirmfüllend hinter der Lichtflut der Oberfläche
    const sheet = `HG_aufstieg_${asc.seq}`;
    if (this.textures.exists(sheet)) {
      const full = this.add.sprite(VIEW_W / 2, VIEW_H / 2, sheet, 0).setScrollFactor(0).setDepth(DEPTH.vision + 2).setScale(VIEW_W / 240).setAlpha(0.92);
      if (!playSheetAnim(full, sheet, 'ascend', () => this.tweens.add({ targets: full, alpha: 0, duration: 700, onComplete: () => full.destroy() }))) full.destroy();
    }
    cam.flash(900, 255, 255, 255);
    cam.shake(1200, 0.006);
    const zoom0 = cam.zoom;
    this.tweens.add({ targets: cam, zoom: zoom0 * 1.5, duration: 1400, ease: 'Sine.easeInOut', yoyo: true, hold: 1200 });
    let lit = true;
    this.lighting?.add({ follow: { get x() { return who.x; }, get y() { return who.y - 12; } }, radius: 120, intensity: 1, color, glowAlpha: 0.5, flicker: 0.05, active: () => lit });
    for (let i = 0; i < 3; i++) {
      const g = this.add.graphics().setDepth(DEPTH.vision + 1).setBlendMode(Phaser.BlendModes.ADD);
      const ring = { r: 4 };
      this.tweens.add({ targets: ring, r: 220, delay: 300 + i * 450, duration: 1800, ease: 'Cubic.easeOut',
        onUpdate: () => { g.clear(); g.lineStyle(3, color, Math.max(0, 1 - ring.r / 220)).strokeCircle(who.x, who.y - 10, ring.r); },
        onComplete: () => g.destroy() });
    }
    this.time.delayedCall(4300, () => { lit = false; this.updateForm(); });
  }

  /** Mythische Gestalt: die Figur wächst, leuchtet in der Pfadfarbe und trägt ihre Aura auch ohne Geistsicht. */
  updateForm() {
    const active = !!this.state.formActive?.();
    const who = this.state.acting === 2 && this.p2 ? this.p2 : this.player;
    if (!who) return;
    const color = this.state.content.pathways[this.state.pathway?.id]?.color;
    const own = !!this.formKey(who === this.p2 ? 2 : 1); // Paket CO: echtes Formen-Sheet statt vergrößerter Figur
    if (active !== !!this.formWas && this.textures.exists('HG_kreatur_wechsel')) {
      const fx = this.add.sprite(who.x, who.y - 16, 'HG_kreatur_wechsel', 0).setDepth(who.depth + 2);
      if (!playSheetAnim(fx, 'HG_kreatur_wechsel', active ? 'transform' : 'revert', () => fx.destroy())) fx.destroy();
    }
    this.formWas = active;
    this.formAura?.destroy();
    this.formAura = null;
    if (active && own) {
      const auraKey = (this.state.pathway?.seq ?? 4) <= 2 ? 'HG_aura_engel' : 'HG_aura_halbgott';
      if (this.textures.exists(auraKey)) {
        this.formAura = this.add.sprite(who.x, who.y, auraKey, 0).setOrigin(0.5, 1).setDepth(who.depth - 1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.8);
        this.formAura.follow = who;
        if (!playSheetAnim(this.formAura, auraKey, 'loop')) { this.formAura.destroy(); this.formAura = null; }
      }
    }
    if (active) {
      who.setScale(own ? 1 : 1.3);
      if (color && !own) who.setTint(Number.parseInt(color.slice(1), 16));
      if (!this.formLight) {
        // Das Licht bleibt an der Figur, solange die Gestalt steht (active fragt den Spielstand)
        this.lighting?.add({ follow: { get x() { return who.x; }, get y() { return who.y - 12; } }, radius: 80, intensity: 0.9, color: color ? Number.parseInt(color.slice(1), 16) : 0xffd98a, glowAlpha: 0.4, flicker: 0.12, active: () => !!this.state.formActive?.() });
        this.formLight = true;
      }
    } else {
      who.setScale(1);
      if (who === this.p2 && this.p2Key === 'player') who.setTint(P2_TINT); else who.clearTint();
    }
    this.updateAura();
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
    const done = () => { this.playerBusy = false; p.setTexture(this.playerKey, DIRS.indexOf(this.facing) * 4); };
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
    const show = pid && (this.state.spiritVision || this.state.formActive?.()) && this.textures.exists('aura_pfade');
    if (!show) { this.aura?.setVisible(false); return; }
    if (!this.aura) this.aura = this.add.sprite(0, 0, 'aura_pfade').setOrigin(0.5, 1).setAlpha(0.7).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.dark + 1); // über der Dunkelheit, wie ein Leuchten
    // Paket AG: Waage, Moor und Uhr haben eine eigene Aura (48x64), sonst die eines Bestandspfads
    const own = pid.startsWith('sq_') ? `sq_aura_${pid.slice(3)}` : null;
    if (own && this.textures.exists(own)) {
      if (this.aura.anims.currentAnim?.key !== `${own}-loop`) playSheetAnim(this.aura, own, 'loop');
    } else {
      const art = pathwayArt(pid);
      if (this.aura.anims.currentAnim?.key !== `aura_pfade-${art}`) playSheetAnim(this.aura, 'aura_pfade', art);
    }
    this.aura.setVisible(true).setPosition(this.player.x, this.player.y + 2);
  }

  /** Risse am Bildrand, wenn die Unruhe hoch ist (ab 50). */
  updateCracks() {
    if (!this.textures.exists('control_cracks') || this.state.acting === 2) return;
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
        if (!it.active || (it.hidden && !this.state.seesHidden())) continue;
        const d = Phaser.Math.Distance.Between(px, py, it.x, it.y);
        if (d < it.reach && d / it.reach < bestScore) { best = it; bestScore = d / it.reach; }
      }
    }
    this.focus = best;
    if (this.splitRole === 2) { this.ui.setPrompt2?.(best?.prompt ?? null, 'Enter', best?.kind); return; }
    this.focus2 = this.p2 && !blocked ? this.nearestInteractable(this.p2.x, this.p2.y - 3) : null;
    if (best) this.ui.setPrompt(best.prompt, 'E', best.kind);
    else if (this.focus2) this.ui.setPrompt(`Spieler 2: ${this.focus2.prompt}`, 'Enter', this.focus2.kind);
    else this.ui.setPrompt(null);
  }

  /** Welt-Fähigkeit „scout“: zählt die Gegner dieser Karte (Streifen und Kreaturen). */
  scoutEnemies() {
    const list = (this.roamers?.list ?? []).filter((r) => r.alive);
    const elites = list.filter((r) => r.elite || r.boss).length;
    const text = !list.length ? 'Hier lauert niemand. Die Karte ist frei von Gegnern.'
      : `${list.length} ${list.length === 1 ? 'Gegner lauert' : 'Gegner lauern'} auf dieser Karte${elites ? `, davon ${elites} ${elites === 1 ? 'Elite oder Boss' : 'Eliten oder Bosse'}` : ''}.`;
    this.state.emit('notice', text);
  }

  nearestInteractable(px, py) {
    let best = null;
    let bestScore = Infinity;
    for (const it of this.interactables) {
      if (!it.active || (it.hidden && !this.state.seesHidden())) continue;
      const d = Phaser.Math.Distance.Between(px, py, it.x, it.y);
      if (d < it.reach && d / it.reach < bestScore) { best = it; bestScore = d / it.reach; }
    }
    return best;
  }

  /** Objekte mit "auto" lösen von selbst aus (z. B. ein Hinterhalt), sobald man nah genug ist. */
  checkAuto(blocked) {
    if (blocked) return;
    for (const it of this.interactables) {
      if (!it.def.auto || !it.active) continue;
      if (this.playerSprites().some((p) => Phaser.Math.Distance.Between(p.x, p.y - 3, it.x, it.y) < it.def.auto)) { this.interact(it); return; }
    }
  }

  handleKeys(blocked) {
    const a2 = this.pending2;
    this.pending2 = null;
    if (this.splitRole === 2) { // rechte Hälfte: nur Spieler 2 (Enter, Ziffernblock, Gamepad)
      this.pending = null;
      if (blocked || !a2) return;
      if (a2 === 'interact' && this.focus) this.interactAs2(this.focus);
      else if (a2 === 'vision') this.state.setSpiritVision(!this.state.spiritVision);
      else if (a2 === 'inventory') this.ui.openNotebook('items', 2);
      else if (a2.startsWith('talent:')) this.useTalentKey(2, a2.slice(7));
      return;
    }
    if (!blocked && a2 && this.p2) {
      if (a2 === 'interact' && this.focus2) this.interactAs2(this.focus2);
      else if (a2 === 'vision') this.state.withPlayer(2, () => this.state.setSpiritVision(!this.state.spiritVision));
      else if (a2 === 'inventory') this.ui.openNotebook('items', 2);
      else if (a2.startsWith('talent:')) this.useTalentKey(2, a2.slice(7));
    }
    const action = this.pending;
    this.pending = null;
    const forced = this.tap?.forced;
    if (this.tap) this.tap.forced = null;
    if (blocked || !action) return;
    if (action === 'interact' && (forced ?? this.focus)) this.interact(forced ?? this.focus);
    else if (action === 'vision') this.state.setSpiritVision(!this.state.spiritVision);
    else if (action === 'notebook') this.ui.openNotebook();
    else if (action === 'inventory') this.ui.openNotebook('items');
    else if (action === 'pathway') this.ui.openNotebook('pfad');
    else if (action.startsWith('talent:')) this.useTalentKey(1, action.slice(7));
  }

  /** Taste 1–9 / Ziffernblock / Gamepad-X: Welt-Fähigkeit aus der Schnellleiste. */
  useTalentKey(n, slot) {
    this.ui.useTalentSlot(n, slot === 'sel' ? 'sel' : Number(slot));
  }

  /** Spieler 2 benutzt etwas: Beute, Käufe und Gesprächsbelohnungen landen in seiner Tasche. */
  interactAs2(it) {
    this.ui.actor = 2;
    this.state.withPlayer(2, () => this.interact(it));
    if (!this.ui.modal) this.ui.actor = 1;
  }

  interact(it) {
    const def = it.def;
    const refused = this.koop?.refuse(it, this.state.acting);
    if (refused) { this.ui.showMessage(def.title ?? def.prompt, refused); return; }
    // Ab Fall 5 bleibt Lagerhaus 7 auch in bestehenden Spielständen zugänglich.
    const warehouseOpen = def.to === 'warehouse'
      && (this.state.flags.has('briefed_05') || ['active', 'done'].includes(this.state.quests.case_05));
    if (def.lock && !warehouseOpen && !this.state.meetsLock(def.lock)) {
      // Knackbare Schlösser (lock.pick): Pfad des Schlüssels, Brecheisen oder Haarnadel öffnen sie trotzdem (Ritual des Schlüssels zählt mit)
      const picked = this.state.tryPick(def.lock, `${this.state.map}:${def.id}`);
      if (!picked) {
        this.sfx(def.lock.pick ? 'schloss_misslungen' : worldSound('locked')); // DS: knackbar, aber ohne Werkzeug springt der Stift zurück
        this.ui.showMessage(def.title ?? def.prompt, def.lock.text, { footer: [def.lock.footer, def.lock.pick ? this.state.pickHint() : ''].filter(Boolean).join(' ') });
        return;
      }
      if (picked.first) this.ui.toast(picked.text, 'good'); // DS: Dietrich/Brecheisen klingen aus tryPick
      ritualFx(this, { pfad: 'schloss_knacken', brecheisen: 'schloss_brecheisen', haarnadel: 'schloss_haarnadel' }[picked.tool] ?? 'schloss_knacken', it.x ?? this.player.x, (it.y ?? this.player.y) - 18, { depth: DEPTH.vision + 1 }); // Codex DQ
    }
    switch (it.kind) {
      case 'npc': {
        const dx = this.player.x - it.sprite.x;
        const dy = this.player.y - it.sprite.y;
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        if (!def.static) it.sprite.setFrame(DIRS.indexOf(dir) * 4);
        // Paket CN: Sonderpose, solange das Gespräch läuft (characters/<id>_pose.png), danach wieder die Blickrichtung
        const pose = `pose_${def.id}`;
        if (!def.static && this.textures.exists(pose)) it.sprite.setTexture(pose, 0);
        this.ui.openDialogue({ ...def, start: this.fahndungNode(def) }, () => { if (it.sprite.texture.key === pose) it.sprite.setTexture(`npc_${def.id}`); it.sprite.setFrame(DIRS.indexOf(it.facing) * 4); });
        break;
      }
      case 'dialogue':
        this.ui.openDialogue({ name: def.title, role: def.role ?? '', dialogue: def.dialogue, start: this.fahndungNode(def) });
        break;
      case 'travel':
        this.playPlayerAction('door');
        this.ui.openTravel(this.state.map);
        break;
      case 'signal': // BN: Horchstelle
        this.playPlayerAction('read');
        this.ui.openSignalStation(def.station);
        break;
      case 'brew':
        this.ui.openBrew();
        break;
      case 'ort3_exit': { // Ort der Sequenz 3: zurück, woher man kam
        this.playPlayerAction('door');
        const back = [...this.state.flags].find((f) => f.startsWith('o3_rueck:'))?.slice(9);
        this.travelTo(back && this.state.content.maps[back] ? back : 'ds_speisewagen', 'default');
        break;
      }
      case 'storage':
        this.playPlayerAction('pickup');
        this.ui.openStorage('', def.store ?? 'buero', def.store_title);
        break;
      case 'casewall':
        this.ui.showCaseWall();
        break;
      case 'combat':
        this.startCombat(def.encounter, def.after ?? null, { noLoot: !!def.no_loot }); // BQ: Schreinwachen ohne Beute, mit Folge
        break;
      case 'loot':
        this.playPlayerAction('pickup');
        this.sfx(worldSound('loot'));
        this.roamers.open(it);
        break;
      case 'rest': {
        this.playPlayerAction('rest');
        this.sfx(worldSound('rest'));
        const healed = this.state.heal(this.state.maxHp);
        this.state.setComposure(100);
        if (this.state.cityPolice()) this.state.restWanted(); // Untertauchen senkt die Fahndung (Wexmoor, nach Fall 9 auch Kettlegate)
        const calm = this.state.kahnRestBonus(); // Paket AB: Waschtisch im Kahn
        const dream = this.state.seq4Rest?.(); // Seq 4 (Faden): mit fünf Fäden zieht der Schlaf in den Traum
        this.ui.showMessage(def.title, dream ? `${def.text}\n\n${dream}` : def.text, { footer: (healed > 0 ? `+${healed} Leben, Nerven beruhigt.` : 'Du bist ausgeruht.') + (calm ? ` Am Waschtisch: -${calm} Unruhe.` : '') });
        break;
      }
      case 'nebel': // Codex DH: Übergang zur Nebelseite (keine Straßentür)
      case 'door':
        this.playPlayerAction('door');
        this.sfx(worldSound('door', { to: def.to, from: this.state.map }));
        this.travelTo(def.to, def.spawn);
        break;
      case 'read': {
        this.playPlayerAction('read');
        this.sfx(worldSound('read'));
        const isNew = !def.done_flag || !this.state.flags.has(def.done_flag);
        this.ui.showMessage(def.title, def.text, { footer: def.footer ?? '', scene: def.scene ?? leseSceneOf(`${def.title ?? ''} ${def.prompt ?? ''}`) }); // BW: Lesestellen-Bild
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
    const hold = this.hg?.blocksTravel(); // Seq 4: Laternennacht und Schatten halten dich auf der Karte
    if (hold && !this.state.pendingTravel) { this.ui.toast?.(hold, 'warn'); return; }
    if (!this.state.content.maps[mapId]) throw new Error(`Unbekannter Ort: ${mapId}`);
    mapId = this.state.variantOf?.(mapId) ?? mapId; // CH: Briarholt kalt oder warm
    this.leaving = true;
    this.state.cancelPrivateAnswer?.(1); // BN: offene Namensantwort verfällt beim Kartenwechsel
    this.state.cancelPrivateAnswer?.(2);
    this.state.setSpiritVision(false);
    const maps = this.state.content.maps;
    const toCity = maps[mapId]?.city ?? 'kettlegate';
    if (toCity !== (maps[this.state.map]?.city ?? 'kettlegate')) this.ui.showLoading?.(toCity); // Codex DM: Ladebild beim Stadtwechsel
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (mapId.startsWith('o3_') && !this.state.map.startsWith('o3_')) { // Ort der Sequenz 3: Rückweg merken
        for (const f of [...this.state.flags]) if (f.startsWith('o3_rueck:')) this.state.flags.delete(f);
        this.state.flags.add(`o3_rueck:${this.state.map}`);
      }
      this.state.map = mapId;
      this.state.spawn = spawn ?? 'default';
      this.state.position = null;
      this.state.emit('travel', mapId);
      this.scene.restart();
    });
  }

  /** Paket CN: Einwohner und Stände weichen ab Fahndungsstufe `fahndung.min` aus – das Gespräch beginnt dann nur mit dem genannten Knoten. */
  fahndungNode(def) {
    const f = def.fahndung;
    return f && (this.state.wanted ?? 0) >= (f.min ?? 2) ? f.node : undefined;
  }

  /** Paket CN: Ereignisse mit `visit_chance` erscheinen je Kartenbesuch nur mit dieser Wahrscheinlichkeit; einmal begonnen (`visit_started`) immer. */
  visitAllows(def) {
    if (def.visit_chance === undefined || (def.visit_started && this.state.flags.has(def.visit_started))) return true;
    this.visitRolls[def.id] ??= Math.random() < def.visit_chance;
    return this.visitRolls[def.id];
  }

  /** Paket BN: aktuelle Kollision (Boden + Hindernisse) und lebende Gegner für Rufvorschau und Hörweite. */
  setupSignalContext() {
    let cache = null;
    const grid = () => {
      const now = this.time.now;
      if (!cache || now - cache.at > 100) cache = { ...this.tap.blockedGrid(), at: now };
      return cache;
    };
    const ctx = {
      isWalkable: (map, x, y) => { if (map !== this.state.map) return false; const g = grid(); return x >= 0 && y >= 0 && x < g.w && y < g.h && !g.grid[y * g.w + x]; },
      listeners: (map) => (map !== this.state.map ? [] : this.roamers.list.filter((r) => r.alive).map((r) => ({ id: r.def.id ?? r.id, encounter: r.id, alive: true, tile: [Math.floor(r.body.x / TILE), Math.floor(r.body.y / TILE)] }))),
    };
    this.state.signalRouteContext = ctx;
    this.cleanups.push(() => { if (this.state.signalRouteContext === ctx) this.state.signalRouteContext = null; });
  }

  /** BN: Ruflinie (gold richtig, rot falsch), sichere Nischen grün, Suchzone rot umrandet; verblasst nach ein paar Sekunden. */
  showSignalRoute(r) {
    if (r.map !== this.state.map) return;
    this.signalGfx?.destroy();
    const g = this.add.graphics().setDepth(DEPTH.dark - 1);
    const color = r.form === 'linie_fehl' ? 0xe07a8a : r.form === 'linie_aktiv' ? 0xe8b860 : 0xabb3ae;
    g.fillStyle(color, 0.45);
    for (const [x, y] of r.tiles ?? []) g.fillRect(x * TILE + 5, y * TILE + 5, 6, 6);
    g.lineStyle(1, 0x9ad06a, 0.9);
    for (const [x, y] of r.safeTiles ?? []) g.strokeRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
    g.lineStyle(1, 0xe07a8a, 0.9);
    for (const [x, y] of r.alarm?.tiles ?? []) g.strokeRect(x * TILE + 3, y * TILE + 3, TILE - 6, TILE - 6);
    this.signalGfx = g;
    this.tweens.add({ targets: g, alpha: 0, delay: 6000, duration: 1500, onComplete: () => { if (this.signalGfx === g) this.signalGfx = null; g.destroy(); } });
    if (r.alarm) this.roamers?.alarm(r);
  }

  /** BN: Schallschleusen liegen an den Ausgängen; wer hindurchgeht, verliert Bindung und Alarm. */
  checkLocks(delta) {
    const sr = this.state.content.signalRoutes;
    if (!sr || !this.player) return;
    this.lockT = (this.lockT ?? 0) - delta;
    if (this.lockT > 0) return;
    this.lockT = 300;
    const s = this.state;
    const px = Math.floor(this.player.x / TILE);
    const py = Math.floor((this.player.y - 3) / TILE);
    this.locksNear ??= new Set();
    for (const st of sr.stationen) {
      const l = st.lock;
      if (l.map !== s.map) continue;
      const near = Math.abs(l.tile[0] - px) + Math.abs(l.tile[1] - py) <= 2; // Ankunftsplatz und Türzugang liegen zwei Kacheln auseinander
      if (!near) { this.locksNear.delete(l.id); continue; }
      if (this.locksNear.has(l.id)) continue;
      this.locksNear.add(l.id);
      const r = s.enterLock(l.map, l.id);
      if (r.ok && r.ended.length) this.ui.showMessage('Schallschleuse', [r.text, ...r.ended.map((e) => e.text)].join('\n\n'));
    }
  }

  /** Pausiert die Welt und startet den Kampfbildschirm. `after(result)` läuft nach dem Kampf, `roamer` ist ein Gegner auf der Karte. */
  startCombat(id, after = null, { roamer = null, noLoot = false } = {}) {
    if (this.leaving || this.scene.isActive('combat')) return;
    // Ein vorgemerkter Kampf aus einem Gespräch (z. B. Widerstand gegen die Streife) kann sich eine Nacharbeit wünschen
    if (!after && this.combatHook) { after = this.combatHook; }
    this.combatHook = null;
    if (!this.state.pendingCombat) this.state.combatBy = this.state.acting;
    this.state.pendingCombat = null;
    // Mythische Gestalt (ab Sequenz 4): Nicht-Beyonder und schwächere Wesen brechen beim Anblick zusammen, kein Kampf
    if (this.state.awes?.(id)) {
      const c = new Combat(this.state, id);
      c.outcome = 'won';
      const result = c.finish({ deferLoot: !!roamer, noLoot });
      this.cameras.main.flash(250, 255, 240, 200);
      // Paket CP/CO: Reaktion nach Klasse (Bürger, Polizei, Händler, Tiere, schwache Beyonder) mit Furcht-Zeichen und Umfallen
      const fear = this.state.formFearReaction?.(id);
      this.ui.toast?.(fear?.text ? `${c.enc.name}: ${fear.text}` : `${c.enc.name} bricht vor deiner Gestalt zusammen.`, 'good');
      if (roamer?.body) {
        const { x, y } = roamer.body;
        if (this.textures.exists('HG_furcht')) {
          const mark = this.add.image(x, y - 24, 'HG_furcht', HG_FURCHT[fear?.wirkung === 'fliehen' ? 'schreck' : 'ohnmacht'] ?? 5).setDepth(100 + y + 40);
          this.tweens.add({ targets: mark, y: y - 34, alpha: 0, duration: 1100, onComplete: () => mark.destroy() });
        }
        if (fear?.wirkung === 'umfallen' && this.textures.exists('HG_umfallen')) {
          const fall = this.add.sprite(x, y + 8, 'HG_umfallen', 0).setOrigin(0.5, 1).setDepth(100 + y + 8);
          if (!playSheetAnim(fall, 'HG_umfallen', 'loop', () => this.tweens.add({ targets: fall, alpha: 0, delay: 1500, duration: 600, onComplete: () => fall.destroy() }))) fall.destroy();
        }
      }
      if (roamer) this.roamers.afterCombat(roamer, result);
      this.refreshVisibility();
      if (result.travel) this.travelTo(result.travel.map, result.travel.spawn);
      after?.(result);
      return;
    }
    this.state.setSpiritVision(false);
    this.player.setVelocity(0, 0);
    this.player.anims.stop();
    this.p2?.setVelocity(0, 0);
    this.p2?.anims.stop();
    if (this.split) this.state.combatBy = this.splitRole; // Splitscreen: wer auf seiner Hälfte angegriffen wird, kämpft allein
    const other = this.splitOther();
    other?.scene.pause();
    this.scene.pause();
    this.scene.launch('combat', {
      id,
      deferLoot: !!roamer,
      noLoot,
      onDone: (result) => {
        this.scene.resume();
        if (other?.sys?.isPaused()) other.scene.resume();
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
    // Ein laufendes geheimes Treffen hat Vorrang (es dauert nur ein paar Minuten)
    const t = s.gatheringTarget?.() ?? (s.tracked ? questTarget(s, s.tracked) : leadTarget(s, s.openLeads()[0]));
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
  /** Paket P: Ritualkreis des Pfads unter dem Spieler, zeichnet sich auf, leuchtet eine Weile, verblasst. */
  playRitual(pid, player = 1) {
    const key = `ritual_${pid}`;
    if (!this.textures.exists(key) || !this.player) return;
    const who = player === 2 && this.p2 ? this.p2 : this.player;
    if (!this.anims.exists(`${key}_draw`)) {
      this.anims.create({ key: `${key}_draw`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 2 }), frameRate: 8, repeat: 0 });
      this.anims.create({ key: `${key}_loop`, frames: this.anims.generateFrameNumbers(key, { start: 3, end: 7 }), frameRate: 8, repeat: -1 });
    }
    const circle = this.add.sprite(who.x, who.y - 4, key, 0).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
    circle.play(`${key}_draw`);
    circle.once('animationcomplete', () => circle.play(`${key}_loop`));
    let lit = true;
    this.lighting?.add({ follow: { get x() { return circle.x; }, get y() { return circle.y; } }, radius: 56, intensity: 0.8, color: 0xd8c8ff, glowAlpha: 0.3, flicker: 0.15, active: () => lit });
    this.tweens.add({ targets: circle, alpha: 0, delay: 6000, duration: 1500, onComplete: () => { lit = false; circle.destroy(); } });
  }

  /**
   * Kontrollverlust: Tentakel wachsen aus der Figur (Paket BP: fx/BP_tentakel_kontrollverlust.png als 'tentakel_fx',
   * zwölf 64x64-Frames, einmal abgespielt). Die Figur selbst krümmt sich, greift sich an die Schulter, kniet und
   * liegt (characters/BP_player_korruption.png, Reihe je Figur) und wird violett eingefärbt. Fehlt das Sheet,
   * zeichnet die Szene selbst wabernde Tentakel. Dazu Bildschirmzittern und ein violetter Blitz.
   */
  playCorruption(player = 1) {
    if (!this.player) return;
    const who = player === 2 && this.p2 ? this.p2 : this.player;
    const cam = this.cameras.main;
    cam.shake(700, 0.012);
    cam.flash(500, 70, 20, 110);
    who.setTint?.(0x9a6ad0);
    this.playCorruptionPose(who, player);
    this.time.delayedCall(3200, () => { if (player === 2 && this.p2Key === 'player') who.setTint?.(P2_TINT); else who.clearTint?.(); });
    let lit = true;
    this.lighting?.add({ follow: { get x() { return who.x; }, get y() { return who.y - 10; } }, radius: 64, intensity: 0.9, color: 0x8a40d0, glowAlpha: 0.35, flicker: 0.3, active: () => lit });
    const done = () => { lit = false; };
    if (this.textures.exists('tentakel_fx')) {
      const key = 'tentakel_fx';
      if (!this.anims.exists(`${key}_grow`)) {
        const n = this.textures.get(key).frameTotal - 1;
        this.anims.create({ key: `${key}_grow`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: Math.max(0, n - 1) }), frameRate: 8, repeat: 0 });
      }
      // Effektmitte (32,33) laut Manifest über der Figurmitte; die Figur bleibt in der freien Mitte sichtbar
      const fx = this.add.sprite(who.x, who.y - 15, key, 0).setDepth(who.depth + 1);
      fx.play(`${key}_grow`);
      fx.once('animationcomplete', () => this.tweens.add({ targets: fx, alpha: 0, duration: 500, onComplete: () => { fx.destroy(); done(); } }));
      return;
    }
    // Platzhalter: 7 Tentakel aus Schultern und Rücken, die wachsen, wabern und sich zurückziehen
    const g = this.add.graphics().setDepth(who.depth + 1);
    const arms = Array.from({ length: 7 }, (_, i) => ({
      a: -Math.PI / 2 + (i - 3) * 0.42 + (Math.random() - 0.5) * 0.2, len: 24 + Math.random() * 20, ph: Math.random() * 6.28, w: 3 + (i % 2),
    }));
    const t0 = this.time.now;
    const total = 3000;
    const ev = this.time.addEvent({
      delay: 40, loop: true, callback: () => {
        const t = this.time.now - t0;
        const grow = t < 900 ? t / 900 : t > total - 700 ? Math.max(0, (total - t) / 700) : 1;
        g.clear();
        if (t >= total) { ev.remove(); g.destroy(); done(); return; }
        for (const arm of arms) {
          const segs = 8;
          let x = who.x + Math.cos(arm.a) * 3; let y = who.y - 16 + Math.sin(arm.a) * 4;
          g.lineStyle(arm.w, 0x3a1850, 1);
          g.beginPath(); g.moveTo(x, y);
          for (let k = 1; k <= segs; k++) {
            const f = k / segs;
            const wob = Math.sin(t / 140 + arm.ph + f * 4) * 3 * f;
            x += Math.cos(arm.a + wob * 0.12) * (arm.len * grow / segs);
            y += Math.sin(arm.a + wob * 0.12) * (arm.len * grow / segs) - 0.3;
            g.lineTo(x + wob, y);
          }
          g.strokePath();
          // Spitze in Okkult-Türkis
          if (grow > 0.2) g.fillStyle(0x6fe0d0, 0.9).fillCircle(x + Math.sin(t / 140 + arm.ph + 4) * 3, y, 1.2);
        }
      },
    });
  }

  /** Paket BP: Zusammenbruch-Posen der Figur beim Kontrollverlust; danach steht sie wieder in Blickrichtung. */
  playCorruptionPose(who, player = 1) {
    const isP1 = who === this.player;
    if (!isP1 && this.p2Key === 'player') return; // Spieler 2 ohne eigene Figur: nur Tönung
    const row = isP1 ? 'player' : this.state.p2Look?.() ?? 'p2a';
    const restore = () => {
      if (isP1) { this.playerBusy = false; who.setTexture(this.playerKey, DIRS.indexOf(this.facing) * 4); this.updateAura?.(); }
      else { this.p2Busy = false; who.setTexture(this.p2Key, DIRS.indexOf(this.p2Facing ?? 'down') * 4); }
    };
    if (!playSheetAnim(who, 'player_korruption', row, () => this.time.delayedCall(1800, restore))) return;
    who.setVelocity?.(0, 0);
    if (isP1) this.playerBusy = true; else this.p2Busy = true;
  }

  debugTeleport(tx, ty) {
    this.player.setPosition(tx * TILE + 8, ty * TILE + 15);
    this.player.body.reset(this.player.x, this.player.y);
  }
}

/** Kapitel 4: rechte Hälfte des Splitscreens (Spieler 2 auf seiner eigenen Karte). */
export class WorldScene2 extends WorldScene {
  constructor() {
    super('world2');
  }

  preload() {} // die Hauptwelt hat schon alles geladen
}
