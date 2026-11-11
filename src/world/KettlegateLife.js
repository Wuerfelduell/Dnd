import { DEPTH } from './Lighting.js';
import { SPRITE_BASE as BASE, KGL_KEYS, KGL_FILES, KGL_TIERE, KGL_WETTER, KGL_STAENDE, KGL_NACHT, MAP_WEATHER } from './assets.js';

// Paket CN: Kettlegate lebt (fx/kgl_tiere.png, fx/kgl_wetter.png, props/kgl_staende.png, props/kgl_nacht.png).
// Die Karte sagt in `leben` nur, was es gibt (weather: Pool aus kgl_nebel_duenn | kgl_nebel_dicht | kgl_nieselregen | kgl_russschnee | kgl_kanalgeruch;
// animals: { kgl_taube, kgl_ratte, kgl_katze, kgl_hund, kgl_moewe, kgl_fledermaus, kgl_pferd }). Der Pool ist kein Auftrag, alles gleichzeitig zu zeigen:
// je Besuch höchstens eine Nebelstufe und höchstens ein Niederschlag (nicht auf Karten mit eigenem Wetter, z. B. Regen am Hafen).
// Tauben und Möwen tags, Fledermäuse nachts, Ratten eher nachts; Tauben fliegen bei Annäherung auf, Möwen und Fledermäuse ziehen übers Bild.
// Stände (`stand` an Objekten, aus tools/packs/runde8_sync.mjs) stehen als Bild auf ihrem Feld; nachts leuchten Fenster und rauchen Schlote.

const VIEW_W = 480;
const VIEW_H = 270;
const TILE = 16;
const NIGHT_ONLY = new Set(['kgl_fledermaus']);
const DAY_ONLY = new Set(['kgl_taube', 'kgl_moewe']);
const FLYERS = new Set(['kgl_moewe', 'kgl_fledermaus']);
/** Tier → Region beim Sitzen. */
const SITTING = { kgl_taube: 'kgl_taube_picken', kgl_ratte: 'kgl_ratte', kgl_katze: 'kgl_katze', kgl_hund: 'kgl_hund', kgl_pferd: 'kgl_pferd' };
const SCARE_RANGE = 40;
const isKgl = (def) => !!def && ([...(def.weather ?? []), ...Object.keys(def.animals ?? {})].some((k) => k.startsWith('kgl_')));

export function preloadKettlegateLife(scene) {
  for (const [key, file] of Object.entries(KGL_FILES)) if (!scene.textures.exists(key)) scene.load.image(key, `${BASE}${file}`);
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

export class KettlegateLife {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.def = isKgl(scene.mapDef.leben) ? scene.mapDef.leben : null;
    this.hasStands = (scene.mapDef.interactables ?? []).some((i) => i.stand);
    this.objects = [];
    this.fog = [];
    this.animals = [];
    this.flyT = 4000;
  }

  build() {
    const s = this.scene;
    if (this.hasStands) this.buildStands();
    if (!this.def) return;
    const night = this.state.isNight?.() ?? false;
    this.buildWeather(night);
    if (this.def.animals && ensureFrames(s, KGL_KEYS.tiere, KGL_TIERE)) {
      for (const [name, count] of Object.entries(this.def.animals)) {
        if (FLYERS.has(name)) continue; // Möwen und Fledermäuse kommen als Überflug (update)
        if (NIGHT_ONLY.has(name) && !night) continue;
        if (DAY_ONLY.has(name) && night) continue;
        const n = name === 'kgl_ratte' && !night ? Math.ceil(count / 2) : count;
        for (let i = 0; i < n; i++) this.place(name);
      }
    }
    if (night && (this.def.weather ?? []).length) this.buildNight();
  }

  /** Tageswechsel: alles abbauen und für die neue Tageszeit neu aufstellen (Stände bleiben). */
  rebuild() {
    for (const o of this.objects) o.destroy();
    this.objects = [];
    this.fog = [];
    this.animals = [];
    this.build();
  }

  /** Stände und Ereignisbilder aus props/kgl_staende.png auf dem Feld ihres Objekts (Fußpunkt unten, sichtbar wie das Objekt). */
  buildStands() {
    const s = this.scene;
    if (!ensureFrames(s, KGL_KEYS.staende, KGL_STAENDE)) return;
    for (const it of s.interactables) {
      const region = it.def.stand;
      if (!region || !KGL_STAENDE[region]) continue;
      const [tx, ty] = it.def.tile;
      const spr = s.add.sprite(tx * TILE + 8, ty * TILE + 16, KGL_KEYS.staende, `${region}_0`).setOrigin(0.5, 1).setDepth(100 + ty * TILE + 16);
      if (s.anims.exists(`${KGL_KEYS.staende}-${region}`)) spr.play(`${KGL_KEYS.staende}-${region}`);
      spr.setVisible(this.state.meets(it.def.visible_if));
      it.parts.push(spr); // Sichtbarkeit folgt dem Objekt (refreshVisibility)
      const [, , w] = KGL_STAENDE[region];
      if (!it.def.solid && w >= 32) it.standBlocker = s.addBlocker(tx * TILE + 8, ty * TILE + 10, Math.min(w, 48) - 8, 8);
    }
  }

  buildWeather(night) {
    const s = this.scene;
    const pool = this.def.weather ?? [];
    if (!pool.length || !ensureFrames(s, KGL_KEYS.wetter, KGL_WETTER)) return;
    const r = this.roll();
    // Nebel: dünn oder dicht sind Alternativen (dicht eher nachts), nie beide
    const dicht = pool.includes('kgl_nebel_dicht') && r.fog < (night ? 0.5 : 0.3);
    const duenn = !dicht && pool.includes('kgl_nebel_duenn') && r.fog < 0.8;
    if (dicht || duenn) {
      for (const [i, speed] of (dicht ? [5, -3] : [4]).entries()) {
        const t = s.add.tileSprite(0, 0, VIEW_W, VIEW_H, KGL_KEYS.wetter, 'kgl_nebel_dicht_0').setOrigin(0).setScrollFactor(0)
          .setDepth(DEPTH.fog + 1).setAlpha(dicht ? (i ? 0.16 : 0.26) : 0.12);
        t.speed = speed;
        t.tilePositionY = i * 24;
        this.fog.push(t);
        this.objects.push(t);
      }
    }
    // Niederschlag: Niesel (mit Pfützen) oder Rußschnee, nur wo die Karte kein eigenes Wetter hat
    const own = s.mapDef.weather ?? MAP_WEATHER[s.mapDef.id];
    const kinds = ['kgl_nieselregen', 'kgl_russschnee'].filter((k) => pool.includes(k));
    if (!own && kinds.length && r.rain < 0.45) {
      const kind = kinds[Math.floor(r.kind * kinds.length)];
      for (let gy = 0; gy < Math.ceil(VIEW_H / 64); gy++) {
        for (let gx = 0; gx < Math.ceil(VIEW_W / 64); gx++) {
          const d = s.add.sprite(gx * 64, gy * 64, KGL_KEYS.wetter, `${kind}_0`).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.dark + 2).setAlpha(kind === 'kgl_russschnee' ? 0.45 : 0.4);
          d.play(`${KGL_KEYS.wetter}-${kind}`);
          d.anims.setProgress(((gx * 7 + gy * 3) % 10) / 10);
          this.objects.push(d);
        }
      }
      if (kind === 'kgl_nieselregen') for (let i = 0; i < 5; i++) this.placeFx('kgl_pfuetze', 0.7, 100 - 20);
    }
    // Kanalgeruch nur am Wasser
    if (pool.includes('kgl_kanalgeruch') && this.waterTiles().length) for (let i = 0; i < 3; i++) this.placeFx('kgl_kanalgeruch', 0.5, null, true);
  }

  /** Nachts: Fensterlichter an den Fassaden (W) und Rauch über einzelnen Dächern (R). */
  buildNight() {
    const s = this.scene;
    if (!ensureFrames(s, KGL_KEYS.nacht, KGL_NACHT)) return;
    const rows = s.mapDef.rows;
    let n = 0;
    rows.forEach((row, ty) => {
      for (let tx = 0; tx < row.length; tx++) {
        const ch = row[tx];
        const h = ((tx * 31 + ty * 17) % 10) / 10;
        if (ch === 'W' && h > 0.45) {
          const name = `kgl_fenster_${1 + ((tx + ty) % 4)}`;
          const w = s.add.sprite(tx * TILE, ty * TILE, KGL_KEYS.nacht, `${name}_0`).setOrigin(0).setDepth(DEPTH.dark + 1).setAlpha(0.75);
          w.play(`${KGL_KEYS.nacht}-${name}`);
          w.anims.setProgress(h);
          this.objects.push(w);
          n += 1;
        } else if (ch === 'R' && h > 0.9 && (ty === 0 || rows[ty - 1]?.[tx] !== 'R')) {
          const r = s.add.sprite(tx * TILE + 8, ty * TILE + 8, KGL_KEYS.nacht, 'kgl_rauch_0').setOrigin(0.5, 1).setDepth(DEPTH.dark + 1).setAlpha(0.55);
          r.play(`${KGL_KEYS.nacht}-kgl_rauch`);
          r.anims.setProgress(h);
          this.objects.push(r);
        }
      }
    });
    return n;
  }

  /** Zufallswerte je Kartenbesuch (die Szene würfelt einmal beim Aufbau). */
  roll() {
    this.rolls ??= { fog: Math.random(), rain: Math.random(), kind: Math.random() };
    return this.rolls;
  }

  waterTiles() {
    const out = [];
    this.scene.mapDef.rows.forEach((row, ty) => { for (let tx = 0; tx < row.length; tx++) if ('~Q='.includes(row[tx])) out.push([tx, ty]); });
    return out;
  }

  /** Effekt-Sprite (Pfütze, Kanalgeruch) auf einem freien Feld, bei `nearWater` neben einem Wasserfeld. */
  placeFx(name, alpha, depth, nearWater = false) {
    const s = this.scene;
    const water = nearWater ? this.waterTiles() : null;
    for (let tries = 0; tries < 30; tries++) {
      let x;
      let y;
      if (water) {
        const [wx, wy] = water[Math.floor(Math.random() * water.length)];
        x = wx * TILE + 8 + (Math.random() * 48 - 24);
        y = wy * TILE + 8 + (Math.random() * 48 - 24);
      } else {
        x = 16 + Math.random() * (s.mapW - 32);
        y = 24 + Math.random() * (s.mapH - 32);
      }
      if (!s.critters?.free(x, y)) continue;
      const spr = s.add.sprite(x, y, KGL_KEYS.wetter, `${name}_0`).setOrigin(0.5, nearWater ? 1 : 0.5).setAlpha(alpha).setDepth(depth ?? (nearWater ? DEPTH.dark + 1 : 60));
      if (s.anims.exists(`${KGL_KEYS.wetter}-${name}`)) {
        spr.play(`${KGL_KEYS.wetter}-${name}`);
        spr.anims.setProgress(Math.random());
      }
      this.objects.push(spr);
      return spr;
    }
    return null;
  }

  /** Setzt ein Tier auf ein zufälliges freies Feld (bis zu 30 Versuche); Pferde neben einer Droschke, Katzen an Mauern. */
  place(name) {
    const s = this.scene;
    const region = SITTING[name];
    if (!region || !s.textures.get(KGL_KEYS.tiere).has(`${region}_0`)) return null;
    const anchor = name === 'kgl_pferd' ? this.droschke() : null;
    for (let tries = 0; tries < 30; tries++) {
      let x = 16 + Math.random() * (s.mapW - 32);
      let y = 24 + Math.random() * (s.mapH - 32);
      if (anchor) { x = anchor.x + (tries % 2 ? 40 : -40); y = anchor.y + 2 + tries; }
      if (name === 'kgl_katze' && !this.nearWall(x, y)) continue;
      if (!s.critters?.free(x, y)) continue;
      const spr = s.add.sprite(x, y, KGL_KEYS.tiere, `${region}_0`).setOrigin(0.5, 1).setDepth(100 + y);
      if (s.anims.exists(`${KGL_KEYS.tiere}-${region}`)) {
        spr.play(`${KGL_KEYS.tiere}-${region}`);
        spr.anims.setProgress(Math.random());
      }
      if (name === 'kgl_ratte') {
        const dx = 24 + Math.random() * 30;
        spr.setFlipX(Math.random() < 0.5);
        s.tweens.add({ targets: spr, x: x + (spr.flipX ? -dx : dx), duration: 1500 + Math.random() * 1200, yoyo: true, repeat: -1, hold: 600, repeatDelay: 900, ease: 'Sine.inOut',
          onYoyo: () => spr.setFlipX(!spr.flipX), onRepeat: () => spr.setFlipX(!spr.flipX) });
      } else if (Math.random() < 0.5) spr.setFlipX(true);
      const a = { name, spr, scared: false };
      this.animals.push(a);
      this.objects.push(spr);
      return spr;
    }
    return null;
  }

  /** Droschke der Karte (Deko oder Standbild), damit das Pferd daneben steht. */
  droschke() {
    const s = this.scene;
    const d = (s.mapDef.decor ?? []).find((x) => /droschke|kutsche/i.test(x.sprite)) ?? (s.mapDef.interactables ?? []).find((x) => /droschke/.test(x.stand ?? ''));
    return d ? { x: d.tile[0] * TILE + 8, y: d.tile[1] * TILE + 16 } : null;
  }

  nearWall(x, y) {
    const rows = this.scene.mapDef.rows;
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    return [rows[ty - 1]?.[tx], rows[ty]?.[tx - 1], rows[ty]?.[tx + 1]].some((c) => c !== undefined && 'I#WD'.includes(c));
  }

  update(delta) {
    if (!this.def) return;
    const s = this.scene;
    const cam = s.cameras.main;
    for (const f of this.fog) {
      f.tilePositionX += (f.speed * delta) / 1000;
      f.tilePositionY = cam.scrollY * 0.3 + (f.speed > 0 ? 0 : 24);
    }
    // Tauben fliegen auf, wenn man ihnen zu nahe kommt
    const p = s.player;
    for (const a of this.animals) {
      if (a.name !== 'kgl_taube' || a.scared || !p) continue;
      if (Math.hypot(p.x - a.spr.x, p.y - a.spr.y) > SCARE_RANGE) continue;
      a.scared = true;
      const spr = a.spr;
      if (s.anims.exists(`${KGL_KEYS.tiere}-kgl_taube_auffliegen`)) spr.play(`${KGL_KEYS.tiere}-kgl_taube_auffliegen`);
      spr.setFlipX(p.x > spr.x);
      s.tweens.add({ targets: spr, x: spr.x + (spr.flipX ? -1 : 1) * 60, y: spr.y - 70, alpha: 0, duration: 1300, ease: 'Quad.out' });
    }
    // Möwen (tags) und Fledermäuse (nachts) ziehen übers Bild, nur auf Karten, die sie nennen
    const night = this.state.isNight?.() ?? false;
    const flyer = night ? 'kgl_fledermaus' : 'kgl_moewe';
    if (!this.def.animals?.[flyer]) return;
    this.flyT -= delta;
    if (this.flyT > 0) return;
    this.flyT = (night ? 3000 : 5000) + Math.random() * 7000;
    this.flyOver(flyer);
  }

  /** Ein Flieger zieht hoch über dem Bild von einer Seite zur anderen (Fledermäuse flattern in kurzen Bögen). */
  flyOver(name) {
    const s = this.scene;
    if (!s.anims.exists(`${KGL_KEYS.tiere}-${name}`)) return;
    const left = Math.random() < 0.5;
    const y = 12 + Math.random() * 60;
    const b = s.add.sprite(left ? -16 : VIEW_W + 16, y, KGL_KEYS.tiere, `${name}_0`).setScrollFactor(0).setDepth(DEPTH.dark + 1).setFlipX(!left);
    b.play(`${KGL_KEYS.tiere}-${name}`);
    this.objects.push(b);
    const bat = name === 'kgl_fledermaus';
    s.tweens.add({ targets: b, x: left ? VIEW_W + 16 : -16, duration: (bat ? 2600 : 4000) + Math.random() * 1500, onComplete: () => b.destroy() });
    s.tweens.add({ targets: b, y: y - (bat ? 14 : 30) - Math.random() * 20, duration: bat ? 500 : 1800, yoyo: true, repeat: bat ? 4 : 0, ease: 'Sine.inOut' });
  }
}
