import Phaser from 'phaser';
import { DEPTH } from './Lighting.js';
import { SPRITE_BASE as BASE } from './assets.js';

// Paket AE: Leben und Wetter in Wexmoor (fx/AE_wexmoor_tiere.png, fx/AE_wexmoor_wetter.png).
// Die Sheets haben benannte Regionen; jede Region wird hier in eigene Frames <region>_<i> zerlegt.
// Tiere sind reine Deko: Frösche, Krabben und Irrlichter sitzen auf freien Feldern, Möwen fliegen übers Bild.

export const AE_LIFE_KEY = 'ae_tiere';
export const AE_WEATHER_KEY = 'ae_wetter';
/** Zeitungs-/Sprechblasen-Sheet (ui/AE_zeitung.png): Blase als 9-Slice mit 8px-Rändern und Zipfel. */
export const AE_BUBBLE_KEY = 'ae_zeitung';
const BLASE = { sprechblase: [48, 0, 24, 24, 1, 1], sprechzipfel: [96, 0, 8, 8, 1, 1] };

/** Region → [x, y, Framebreite, Framehöhe, Frames, fps] (aus manifest-oberflaeche.json). */
const TIERE = {
  moorfrosch_sitzen: [0, 0, 16, 16, 2, 3], moorfrosch_huepfen: [0, 16, 16, 16, 4, 8],
  moewe_fliegen: [0, 32, 16, 16, 4, 8], moewe_sitzen: [0, 48, 16, 16, 2, 2],
  irrlicht_schweben: [0, 96, 16, 16, 6, 7], schlickkrabbe_laufen: [0, 112, 16, 16, 4, 7],
  motten_kreisen: [0, 128, 16, 16, 4, 8], kraehe_sitzen: [0, 144, 16, 16, 2, 2],
  graureiher_stehen: [0, 176, 32, 32, 2, 2],
};
const WETTER = { nieselregen: [0, 16, 240, 135, 4, 10], nebelbank_1: [0, 151, 240, 135, 1, 1], nebelbank_2: [240, 151, 240, 135, 1, 1] };

/** Karte → Wetter und Tiere. Innenräume und die versunkene Altstadt bleiben ruhig. */
export const WEXMOOR_LIFE = {
  wx_bahnhof: { weather: ['niesel'], animals: { kraehe_sitzen: 2, moewe_sitzen: 1 }, gulls: true },
  wx_torfstich: { weather: ['niesel'], animals: { moorfrosch_sitzen: 3, graureiher_stehen: 1, motten_kreisen: 1 } },
  wx_salzmarkt: { animals: { moewe_sitzen: 2, kraehe_sitzen: 1 }, gulls: true },
  wx_bojenhafen: { weather: ['niesel'], animals: { moewe_sitzen: 3, schlickkrabbe_laufen: 2 }, gulls: true },
  wx_oberstadt: { animals: { kraehe_sitzen: 2, motten_kreisen: 1 } },
  wx_pfahldorf: { weather: ['niesel', 'nebel'], animals: { moorfrosch_sitzen: 3, graureiher_stehen: 1 }, gulls: true },
  wx_vergessmoor: { weather: ['nebel'], animals: { irrlicht_schweben: 4, moorfrosch_sitzen: 3, graureiher_stehen: 1 } },
  wx_salzwatt: { weather: ['nebel'], animals: { schlickkrabbe_laufen: 5, moewe_sitzen: 3 }, gulls: true },
  wx_leuchtturm: { weather: ['niesel'], animals: { moewe_sitzen: 3 }, gulls: true },
};

export function preloadWexmoorLife(scene) {
  if (!scene.textures.exists(AE_LIFE_KEY)) scene.load.image(AE_LIFE_KEY, `${BASE}fx/AE_wexmoor_tiere.png`);
  if (!scene.textures.exists(AE_WEATHER_KEY)) scene.load.image(AE_WEATHER_KEY, `${BASE}fx/AE_wexmoor_wetter.png`);
  if (!scene.textures.exists(AE_BUBBLE_KEY)) scene.load.image(AE_BUBBLE_KEY, `${BASE}ui/AE_zeitung.png`);
}

/** Sprechblase für Gerede: 9-Slice-Blase mit Zipfel zur Figur, sonst schlichtes Papierschild. */
export function speechBubble(scene, text, who, view) {
  const label = scene.add.text(0, 0, text, { fontFamily: 'monospace', fontSize: '8px', color: '#1a1c2c', wordWrap: { width: 130 }, align: 'center' }).setOrigin(0.5);
  const w = Math.ceil(label.width) + 12;
  const h = Math.ceil(label.height) + 10;
  const art = ensureFrames(scene, AE_BUBBLE_KEY, BLASE);
  const bg = art ? scene.add.nineslice(0, 0, AE_BUBBLE_KEY, 'sprechblase_0', w, h, 8, 8, 8, 8)
    : scene.add.rectangle(0, 0, w, h, 0xe9e0c8);
  const tail = art ? scene.add.image(0, h / 2 + 2, AE_BUBBLE_KEY, 'sprechzipfel_0') : null;
  let y = who.y - 34 - h / 2;
  const above = y - h / 2 >= view.y + 2;
  if (!above) { y = who.y + 4 + h / 2; tail?.setY(-h / 2 - 2).setFlipY(true); }
  const x = Phaser.Math.Clamp(who.x, view.x + w / 2 + 2, view.right - w / 2 - 2);
  tail?.setX(Phaser.Math.Clamp(who.x - x, -w / 2 + 6, w / 2 - 6));
  return scene.add.container(x, y, [bg, ...(tail ? [tail] : []), label]).setDepth(9000).setAlpha(0);
}

/** Zerlegt die Regionen einmalig in Frames und legt die Animationen an. */
function ensureFrames(scene, key, regions) {
  const tex = scene.textures.get(key);
  if (!tex || tex.key === '__MISSING') return false;
  for (const [name, [x, y, w, h, n, fps]] of Object.entries(regions)) {
    if (tex.has(`${name}_0`)) continue;
    for (let i = 0; i < n; i++) tex.add(`${name}_${i}`, 0, x + i * w, y, w, h);
    if (n > 1 && !scene.anims.exists(`${key}-${name}`)) {
      scene.anims.create({ key: `${key}-${name}`, frames: Array.from({ length: n }, (_, i) => ({ key, frame: `${name}_${i}` })), frameRate: fps, repeat: -1 });
    }
  }
  return true;
}

export class WexmoorLife {
  constructor(scene) {
    this.scene = scene;
    this.def = WEXMOOR_LIFE[scene.mapDef.id] ?? null;
    this.fog = [];
    this.gullT = 4000;
  }

  build() {
    if (!this.def) return;
    const s = this.scene;
    const W = 480;
    const H = 270;
    if (this.def.weather && ensureFrames(s, AE_WEATHER_KEY, WETTER)) {
      if (this.def.weather.includes('nebel')) {
        // Zwei Nebelbänke, unabhängig verschoben (beide kachelbar)
        for (const [i, name] of ['nebelbank_1', 'nebelbank_2'].entries()) {
          const t = s.add.tileSprite(0, 0, W, H, AE_WEATHER_KEY, `${name}_0`).setOrigin(0).setScrollFactor(0)
            .setDepth(DEPTH.fog + 1).setAlpha(i ? 0.22 : 0.32);
          t.speed = i ? -5 : 8;
          this.fog.push(t);
        }
      }
      if (this.def.weather.includes('niesel')) {
        for (let gy = 0; gy < 2; gy++) {
          for (let gx = 0; gx < 2; gx++) {
            const r = s.add.sprite(gx * 240, gy * 135, AE_WEATHER_KEY, 'nieselregen_0').setOrigin(0).setScrollFactor(0)
              .setDepth(DEPTH.dark + 2).setAlpha(0.4);
            r.play(`${AE_WEATHER_KEY}-nieselregen`);
            r.anims.setProgress(((gx + gy * 2) * 0.27) % 1);
          }
        }
      }
    }
    if (this.def.animals && ensureFrames(s, AE_LIFE_KEY, TIERE)) {
      for (const [name, count] of Object.entries(this.def.animals)) {
        for (let i = 0; i < count; i++) this.place(name);
      }
    }
  }

  /** Setzt ein Tier auf ein zufälliges freies Feld (bis zu 30 Versuche). */
  place(name) {
    const s = this.scene;
    for (let tries = 0; tries < 30; tries++) {
      const x = 16 + Math.random() * (s.mapW - 32);
      const y = 24 + Math.random() * (s.mapH - 32);
      if (!s.critters?.free(x, y)) continue;
      const spr = s.add.sprite(x, y, AE_LIFE_KEY, `${name}_0`).setOrigin(0.5, 1).setDepth(100 + y);
      if (s.anims.exists(`${AE_LIFE_KEY}-${name}`)) {
        spr.play(`${AE_LIFE_KEY}-${name}`);
        spr.anims.setProgress(Math.random());
      }
      if (name === 'irrlicht_schweben') {
        spr.setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.dark + 1).setAlpha(0.85);
        s.tweens.add({ targets: spr, x: x + (Math.random() * 40 - 20), y: y - 6 - Math.random() * 10, duration: 2600 + Math.random() * 2000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      } else if (Math.random() < 0.5) spr.setFlipX(true);
      return spr;
    }
    return null;
  }

  update(delta) {
    if (!this.def) return;
    const cam = this.scene.cameras.main;
    for (const f of this.fog) {
      f.tilePositionX += (f.speed * delta) / 1000;
      f.tilePositionY = cam.scrollY * 0.3;
    }
    if (!this.def.gulls) return;
    this.gullT -= delta;
    if (this.gullT > 0) return;
    this.gullT = 9000 + Math.random() * 14000;
    this.flyOver();
  }

  /** Eine Möwe zieht hoch über dem Bild von einer Seite zur anderen. */
  flyOver() {
    const s = this.scene;
    if (!s.anims.exists(`${AE_LIFE_KEY}-moewe_fliegen`)) return;
    const left = Math.random() < 0.5;
    const y = 20 + Math.random() * 90;
    const g = s.add.sprite(left ? -16 : 496, y, AE_LIFE_KEY, 'moewe_fliegen_0').setScrollFactor(0).setDepth(DEPTH.dark + 1).setFlipX(!left);
    g.play(`${AE_LIFE_KEY}-moewe_fliegen`);
    s.tweens.add({ targets: g, x: left ? 496 : -16, y: y + (Math.random() * 30 - 15), duration: 7000 + Math.random() * 3000, onComplete: () => g.destroy() });
  }
}
