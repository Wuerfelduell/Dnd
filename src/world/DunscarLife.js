import { DEPTH } from './Lighting.js';
import { SPRITE_BASE as BASE, BA_LIFE_KEY, BA_WEATHER_KEY, BA_TIERE, BA_WETTER } from './assets.js';

// Paket BA/BD: Leben und Wetter in Dunscar (fx/BA_dunscar_tiere.png, fx/BA_dunscar_wetter.png).
// Die Karte sagt in `leben` nur, was es gibt (weather: kalkstaub | wind | nachtnebel; animals: { ds_kraehe, ds_motte, … }).
// Die Tageszeit entscheidet hier: Kalkstaub nur tags, Nachtnebel nur nachts, Wind immer; Motten nur nachts, die übrigen Tiere tags.
// Krähen fliegen bei Annäherung auf, Schwalben ziehen Bögen vor dem Runddepot, Staubteufel sind kleine Deko-Wirbel.

const VIEW_W = 480;
const VIEW_H = 270;
const NIGHT_ONLY = new Set(['ds_motte']);
/** Tier → Region beim Sitzen. */
const SITTING = { ds_kraehe: 'ds_kraehe_sitzen', ds_kalkziege: 'ds_kalkziege_stehen', ds_eidechse: 'ds_eidechse_sitzen', ds_schwalbe: 'ds_schwalbe_sitzen', ds_motte: 'ds_motte_kreisen', ds_staubteufel: 'ds_staubteufel' };
const SCARE_RANGE = 40;

export function preloadDunscarLife(scene) {
  if (!scene.textures.exists(BA_LIFE_KEY)) scene.load.image(BA_LIFE_KEY, `${BASE}fx/BA_dunscar_tiere.png`);
  if (!scene.textures.exists(BA_WEATHER_KEY)) scene.load.image(BA_WEATHER_KEY, `${BASE}fx/BA_dunscar_wetter.png`);
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

export class DunscarLife {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.def = scene.mapDef.leben ?? null;
    this.objects = [];
    this.fog = [];
    this.animals = [];
    this.swallowT = 3000;
  }

  build() {
    if (!this.def) return;
    const s = this.scene;
    const night = this.state.isNight?.() ?? false;
    const weather = this.def.weather ?? [];
    if (weather.length && ensureFrames(s, BA_WEATHER_KEY, BA_WETTER)) {
      if (night && weather.includes('nachtnebel')) {
        for (const [i, name] of ['nachtnebel_1', 'nachtnebel_2'].entries()) {
          const t = s.add.tileSprite(0, 0, VIEW_W, VIEW_H, BA_WEATHER_KEY, `${name}_0`).setOrigin(0).setScrollFactor(0)
            .setDepth(DEPTH.fog + 1).setAlpha(i ? 0.2 : 0.3);
          t.speed = i ? -4 : 6;
          this.fog.push(t);
          this.objects.push(t);
        }
      }
      if (!night && weather.includes('kalkstaub')) {
        for (let gy = 0; gy < 2; gy++) {
          for (let gx = 0; gx < 2; gx++) {
            const d = s.add.sprite(gx * 240, gy * 135, BA_WEATHER_KEY, 'kalkstaub_0').setOrigin(0).setScrollFactor(0).setDepth(DEPTH.dark + 2).setAlpha(0.28);
            d.play(`${BA_WEATHER_KEY}-kalkstaub`);
            d.anims.setProgress(((gx + gy * 2) * 0.31) % 1);
            this.objects.push(d);
          }
        }
      }
      if (weather.includes('wind')) for (let i = 0; i < 4; i++) this.placeTuft();
    }
    if (this.def.animals && ensureFrames(s, BA_LIFE_KEY, BA_TIERE)) {
      for (const [name, count] of Object.entries(this.def.animals)) {
        if (NIGHT_ONLY.has(name) !== night) continue;
        for (let i = 0; i < count; i++) this.place(name);
      }
    }
  }

  /** Tageswechsel: alles abbauen und für die neue Tageszeit neu aufstellen. */
  rebuild() {
    for (const o of this.objects) o.destroy();
    this.objects = [];
    this.fog = [];
    this.animals = [];
    this.build();
  }

  /** Freies Feld in der Nähe des Randes für ein Grasbüschel im Wind. */
  placeTuft() {
    const s = this.scene;
    for (let tries = 0; tries < 20; tries++) {
      const x = 16 + Math.random() * (s.mapW - 32);
      const y = 24 + Math.random() * (s.mapH - 32);
      if (!s.critters?.free(x, y)) continue;
      const spr = s.add.sprite(x, y, BA_WEATHER_KEY, 'wind_grasbueschel_0').setOrigin(0.5, 1).setDepth(100 + y - 8).setAlpha(0.9);
      spr.play(`${BA_WEATHER_KEY}-wind_grasbueschel`);
      spr.anims.setProgress(Math.random());
      this.objects.push(spr);
      return;
    }
  }

  /** Setzt ein Tier auf ein zufälliges freies Feld (bis zu 30 Versuche). */
  place(name) {
    const s = this.scene;
    const region = SITTING[name];
    if (!region || !s.textures.get(BA_LIFE_KEY).has(`${region}_0`)) return null;
    for (let tries = 0; tries < 30; tries++) {
      const x = 16 + Math.random() * (s.mapW - 32);
      const y = 24 + Math.random() * (s.mapH - 32);
      if (!s.critters?.free(x, y)) continue;
      const spr = s.add.sprite(x, y, BA_LIFE_KEY, `${region}_0`).setOrigin(0.5, 1).setDepth(100 + y);
      if (s.anims.exists(`${BA_LIFE_KEY}-${region}`)) {
        spr.play(`${BA_LIFE_KEY}-${region}`);
        spr.anims.setProgress(Math.random());
      }
      if (name === 'ds_motte') {
        spr.setDepth(DEPTH.dark + 1).setAlpha(0.9);
        s.tweens.add({ targets: spr, x: x + (Math.random() * 30 - 15), y: y - 8 - Math.random() * 10, duration: 2200 + Math.random() * 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      } else if (name === 'ds_staubteufel') {
        spr.setAlpha(0.7);
        s.tweens.add({ targets: spr, x: x + (Math.random() * 60 - 30), duration: 4000 + Math.random() * 3000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      } else if (Math.random() < 0.5) spr.setFlipX(true);
      const a = { name, spr, scared: false };
      this.animals.push(a);
      this.objects.push(spr);
      return spr;
    }
    return null;
  }

  update(delta) {
    if (!this.def) return;
    const s = this.scene;
    const cam = s.cameras.main;
    for (const f of this.fog) {
      f.tilePositionX += (f.speed * delta) / 1000;
      f.tilePositionY = cam.scrollY * 0.3;
    }
    // Krähen fliegen auf, wenn man ihnen zu nahe kommt
    const p = s.player;
    for (const a of this.animals) {
      if (a.name !== 'ds_kraehe' || a.scared || !p) continue;
      if (Math.hypot(p.x - a.spr.x, p.y - a.spr.y) > SCARE_RANGE) continue;
      a.scared = true;
      const spr = a.spr;
      if (s.anims.exists(`${BA_LIFE_KEY}-ds_kraehe_auffliegen`)) spr.play(`${BA_LIFE_KEY}-ds_kraehe_auffliegen`);
      spr.setFlipX(p.x > spr.x);
      s.tweens.add({ targets: spr, x: spr.x + (spr.flipX ? -1 : 1) * 70, y: spr.y - 60, alpha: 0, duration: 1400, ease: 'Quad.out',
        onStart: () => { if (s.anims.exists(`${BA_LIFE_KEY}-ds_kraehe_fliegen`)) s.time.delayedCall(350, () => spr.active && spr.play(`${BA_LIFE_KEY}-ds_kraehe_fliegen`)); } });
    }
    // Schwalben ziehen am Tag Bögen übers Bild (nur auf Karten, die Schwalben nennen)
    if (!this.def.animals?.ds_schwalbe || (this.state.isNight?.() ?? false)) return;
    this.swallowT -= delta;
    if (this.swallowT > 0) return;
    this.swallowT = 6000 + Math.random() * 9000;
    this.flyOver();
  }

  /** Eine Schwalbe fliegt in einem Bogen hoch über dem Bild von einer Seite zur anderen. */
  flyOver() {
    const s = this.scene;
    if (!s.anims.exists(`${BA_LIFE_KEY}-ds_schwalbe_fliegen`)) return;
    const left = Math.random() < 0.5;
    const y = 16 + Math.random() * 70;
    const b = s.add.sprite(left ? -16 : VIEW_W + 16, y, BA_LIFE_KEY, 'ds_schwalbe_fliegen_0').setScrollFactor(0).setDepth(DEPTH.dark + 1).setFlipX(!left);
    b.play(`${BA_LIFE_KEY}-ds_schwalbe_fliegen`);
    this.objects.push(b);
    s.tweens.add({ targets: b, x: left ? VIEW_W + 16 : -16, duration: 3500 + Math.random() * 1500, onComplete: () => b.destroy() });
    s.tweens.add({ targets: b, y: y - 30 - Math.random() * 20, duration: 1800 + Math.random() * 600, yoyo: true, ease: 'Sine.inOut' });
  }
}
