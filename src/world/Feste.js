import Phaser from 'phaser';
import { DEPTH } from './Lighting.js';
import { TILE, hash2 } from './textures.js';
import { SPRITE_BASE as BASE, FEST_MAPS, FEST_GEREDE, SEASON_FACADE, isOutdoorMap } from './assets.js';
import { FESTE, SEASONS, SEASON_SECONDS } from '../core/Clock.js';

// Paket BV: Jahreszeiten und Feste (manifest-feste.json). Draußen liegt je nach Jahreszeit Deko auf dem Boden
// (Laub, Reif, Moos, Staub), Partikel ziehen übers Bild, über den Türen hängen Girlanden, Schneehauben, Blumenkästen
// oder Sonnensegel. Zu dritt im Jahr feiert eine Stadt: dann stehen Buden, Kähne oder Kalkkreise auf den Plätzen,
// Gäste schlendern umher und zeigen, was sie gerade tun, ein Banner kündigt das Fest an, einmal gibt es ein Sequenzbild.

const WALK = new Set(['.', ',', 'g', 'p', 'c', 's', 'P', 'w']);
const DIRS = ['down', 'left', 'right', 'up'];
const CITY_OF = (m) => m.city ?? (m.id?.startsWith('ds_') ? 'dunscar' : m.id?.startsWith('wx_') ? 'wexmoor' : 'kettlegate');
/** Boden-Deko je Jahreszeit: erste acht Regionen sind kleine Streuer, die hinteren Pfützen/Flächen. */
const DECAL_COUNT = 12;
const PARTICLE = { herbst: { alpha: 0.32, dx: -6, dy: 9 }, winter: { alpha: 0.4, dx: -9, dy: 14 }, fruehling: { alpha: 0.26, dx: 0, dy: 16 }, sommer: { alpha: 0.22, dx: 3, dy: -2 } };

/** Lädt Blätter und Manifest (WorldScene.preload). Ausschnitte werden später über ensureRegions angelegt. */
export function preloadFeste(scene) {
  if (!scene.cache.json.exists('manifestFeste')) scene.load.json('manifestFeste', `${BASE}manifest-feste.json`);
  const img = (key, file) => { if (!scene.textures.exists(key)) scene.load.image(key, BASE + file); };
  const sheet = (key, file, w, h) => { if (!scene.textures.exists(key)) scene.load.spritesheet(key, BASE + file, { frameWidth: w, frameHeight: h }); };
  for (const s of SEASONS) {
    img(`bv_saison_${s}`, `fx/saison_${s}.png`);
    img(`bv_saison_${s}_fassaden`, `props/saison_${s}_fassaden.png`);
    sheet(`bv_saison_${s}_partikel`, `fx/saison_${s}_partikel.png`, 64, 64);
  }
  sheet('bv_winter_atem', 'fx/saison_winter_atem.png', 8, 8);
  sheet('bv_sommer_hitze', 'fx/saison_sommer_hitzeflimmern.png', 480, 270);
  for (const f of Object.keys(FESTE)) {
    img(`bv_fest_${f}`, `props/fest_${f}.png`);
    img(`bv_fest_${f}_gross`, `props/fest_${f}_gross.png`);
    img(`bv_fest_${f}_gerede`, `ui/fest_${f}_gerede.png`);
    for (let n = 1; n <= 4; n++) sheet(`bv_fest_${f}_gast_${n}`, `characters/fest_${f}_gast_${n}_walk.png`, 16, 32);
  }
}

/** Legt die benannten Regionen eines Manifest-Eintrags als Frames an (einmalig). Gibt die Regionsnamen zurück. */
function ensureRegions(scene, key, assetId) {
  const tex = scene.textures.get(key);
  if (!tex || tex.key === '__MISSING') return [];
  const def = scene.cache.json.get('manifestFeste')?.assets?.find((a) => a.id === assetId);
  if (!def?.regions) return [];
  for (const [name, r] of Object.entries(def.regions)) if (!tex.has(name)) tex.add(name, 0, r.x, r.y, r.width, r.height);
  return Object.keys(def.regions);
}

function ensureLoop(scene, key, frames, frameRate, repeat = -1) {
  if (!scene.textures.exists(key) || scene.anims.exists(key)) return scene.anims.exists(key);
  scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(key, { start: 0, end: frames - 1 }), frameRate, repeat });
  return true;
}

export class Feste {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.map = scene.mapDef;
    this.rows = this.map.rows;
    this.city = CITY_OF(this.map);
    this.outdoor = isOutdoorMap(this.map);
    this.season = this.state.season?.() ?? 'herbst';
    this.fest = this.state.festAktiv?.(this.city) ?? null;
    if (this.fest && !FEST_MAPS[this.fest]?.includes(this.map.id)) this.fest = null;
    this.drift = [];
    this.guests = [];
    this.atemT = 2500;
    this.geredeT = 2000;
  }

  build() {
    if (!this.outdoor) return;
    this.buildSeason();
    if (this.fest) this.buildFest();
  }

  // --- Jahreszeit -----------------------------------------------------------

  buildSeason() {
    const s = this.scene;
    const names = ensureRegions(s, `bv_saison_${this.season}`, `feste_saison_${this.season}`);
    if (names.length) {
      this.rows.forEach((row, y) => [...row].forEach((ch, x) => {
        if (!'.,pPw'.includes(ch) || hash2(x, y, 77) < 0.955) return;
        const name = names[Math.floor(hash2(x, y, 78) * Math.min(DECAL_COUNT, names.length))];
        s.add.image(x * TILE + 8, y * TILE + 8, `bv_saison_${this.season}`, name).setDepth(1).setAlpha(0.9);
      }));
    }
    // Fassadenaufsätze über Türen
    const fac = ensureRegions(s, `bv_saison_${this.season}_fassaden`, `feste_saison_${this.season}_fassaden`);
    const kind = `${this.city}_${SEASON_FACADE[this.season]}`;
    if (fac.includes(kind)) {
      this.rows.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch !== 'D' || hash2(x, y, 79) < 0.4) return;
        s.add.image(x * TILE + 8, y * TILE + 4, `bv_saison_${this.season}_fassaden`, kind).setOrigin(0.5, 1).setDepth(3);
      }));
    }
    // Partikel übers ganze Bild
    const pk = `bv_saison_${this.season}_partikel`;
    if (ensureLoop(s, pk, 6, 6)) {
      const p = PARTICLE[this.season];
      const kids = [];
      for (let gy = 0; gy < 6; gy++) for (let gx = 0; gx < 9; gx++) {
        const spr = s.add.sprite(gx * 64 - 64, gy * 64 - 64, pk, 0).setOrigin(0);
        spr.play(pk);
        spr.anims.setProgress(((gx * 5 + gy * 2) % 6) / 6);
        kids.push(spr);
      }
      const c = s.add.container(0, 0, kids).setScrollFactor(0).setDepth(DEPTH.dark + 2).setAlpha(p.alpha);
      c.dx = p.dx; c.dy = p.dy;
      this.drift.push(c);
    }
    if (this.season === 'sommer' && ensureLoop(s, 'bv_sommer_hitze', 2, 3)) {
      const h = s.add.sprite(0, 0, 'bv_sommer_hitze', 0).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.dark + 1).setAlpha(0.16);
      h.play('bv_sommer_hitze');
    }
    ensureLoop(s, 'bv_winter_atem', 4, 6, 0);
  }

  /** Winter: alle paar Sekunden eine Atemwolke vor dem Gesicht der Spieler. */
  breathe(delta) {
    if (this.season !== 'winter' || !this.scene.anims.exists('bv_winter_atem')) return;
    this.atemT -= delta;
    if (this.atemT > 0) return;
    this.atemT = 2600 + Math.random() * 1800;
    for (const who of [this.scene.player, this.scene.p2].filter((p) => p?.active)) {
      const left = who.flipX || (who.frame.name >= 4 && who.frame.name < 8);
      const a = this.scene.add.sprite(who.x + (left ? -5 : 5), who.y - 24, 'bv_winter_atem', 0).setDepth(who.depth + 1).setAlpha(0.8);
      a.play('bv_winter_atem');
      this.scene.tweens.add({ targets: a, y: a.y - 4, alpha: 0, duration: 700, onComplete: () => a.destroy() });
    }
  }

  // --- Fest -------------------------------------------------------------------

  /** Freie Felder: begehbar, erreichbar vom Spawn, nicht neben Objekten, Figuren oder Deko, am Rand des Platzes. */
  freeTiles() {
    const rows = this.rows;
    const h = rows.length;
    const w = rows[0].length;
    const walk = (x, y) => y >= 0 && x >= 0 && y < h && x < w && WALK.has(rows[y][x]);
    const taken = new Set();
    const mark = (x, y, r) => { for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) taken.add(`${x + dx},${y + dy}`); };
    for (const it of this.scene.interactables) mark(Math.round((it.x - 8) / TILE), Math.round((it.y - 8) / TILE), 1);
    for (const d of this.map.decor ?? []) mark(d.tile[0], d.tile[1], 1);
    for (const n of this.map.npcs ?? []) if (n.tile) mark(n.tile[0], n.tile[1], 1);
    for (const sp of Object.values(this.map.spawns ?? {})) { const t = Array.isArray(sp) ? sp : sp.tile ?? sp.at; if (t) mark(t[0], t[1], 2); }
    const px = Math.floor(this.scene.player.x / TILE);
    const py = Math.floor(this.scene.player.y / TILE);
    const seen = new Set();
    const q = [[px, py]];
    while (q.length) {
      const [x, y] = q.shift();
      const k = `${x},${y}`;
      if (seen.has(k) || !walk(x, y)) continue;
      seen.add(k);
      q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    const n4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const out = [];
    for (const k of seen) {
      const [x, y] = k.split(',').map(Number);
      if (taken.has(k) || x < 1 || y < 1 || x > w - 2 || y > h - 2) continue;
      const free = n4.filter(([dx, dy]) => walk(x + dx, y + dy)).length;
      if (free >= 2) out.push([x, y, free === 4]);
    }
    return out;
  }

  buildFest() {
    const s = this.scene;
    const f = this.fest;
    const small = ensureRegions(s, `bv_fest_${f}`, `feste_${f}_props`);
    const gross = ensureRegions(s, `bv_fest_${f}_gross`, `feste_${f}_gross`);
    ensureRegions(s, `bv_fest_${f}_gerede`, `feste_${f}_gerede`);
    const tiles = this.freeTiles();
    const edge = tiles.filter((t) => !t[2]);
    const open = tiles.filter((t) => t[2]);
    const used = new Set();
    const pick = (list, seed) => {
      const cand = list.filter(([x, y]) => ![...used].some((k) => { const [ux, uy] = k.split(',').map(Number); return Math.abs(ux - x) <= 2 && Math.abs(uy - y) <= 2; }));
      if (!cand.length) return null;
      const t = cand[Math.floor(hash2(seed, tiles.length, 5) * cand.length)];
      used.add(`${t[0]},${t[1]}`);
      return t;
    };
    // Große Stücke mitten auf dem Platz, kleine am Rand
    gross.slice(0, 3).forEach((name, i) => {
      const t = pick(open.length ? open : edge, 100 + i);
      if (!t) return;
      const x = t[0] * TILE + 8;
      const y = t[1] * TILE + 12;
      s.add.image(x, y, `bv_fest_${f}_gross`, name).setOrigin(0.5, 0.85).setDepth(100 + y);
      s.addBlocker(x, y - 2, 26, 10);
    });
    const lanterns = small.filter((n) => /_0$/.test(n));
    for (let i = 0; i < 10; i++) {
      const t = pick(edge.length ? edge : open, 200 + i);
      if (!t) break;
      const x = t[0] * TILE + 8;
      const y = t[1] * TILE + 8;
      const name = small[Math.floor(hash2(i, 3, 9) * small.length)];
      const img = s.add.image(x, y, `bv_fest_${f}`, name).setDepth(100 + y);
      // Laternennacht: Papierlaternen flackern (zwei Frames je Farbe)
      if (lanterns.includes(name) || /_1$/.test(name)) {
        const base = name.replace(/_[01]$/, '');
        const key = `bv_${f}_${base}`;
        if (!s.anims.exists(key)) s.anims.create({ key, frames: [{ key: `bv_fest_${f}`, frame: `${base}_0` }, { key: `bv_fest_${f}`, frame: `${base}_1` }], frameRate: 3, repeat: -1 });
        const spr = s.add.sprite(x, y, `bv_fest_${f}`, `${base}_0`).setDepth(100 + y);
        spr.play(key);
        img.destroy();
        s.lighting?.add({ x, y: y - 2, radius: 22, intensity: 0.5, color: 0xffb060, glowAlpha: 0.3, flicker: 0.2 });
      }
    }
    // Gäste
    const walkable = tiles.filter((t) => t[2]);
    for (let n = 1; n <= 4; n++) {
      const key = `bv_fest_${f}_gast_${n}`;
      if (!s.textures.exists(key)) continue;
      DIRS.forEach((dir, row) => { if (!s.anims.exists(`${key}-walk-${dir}`)) s.anims.create({ key: `${key}-walk-${dir}`, frames: s.anims.generateFrameNumbers(key, { start: row * 4, end: row * 4 + 3 }), frameRate: 7, repeat: -1 }); });
      const t = pick(walkable.length ? walkable : tiles, 300 + n);
      if (!t) break;
      const x = t[0] * TILE + 8;
      const y = t[1] * TILE + 12;
      const body = s.add.zone(x, y, 10, 8);
      s.physics.add.existing(body);
      body.body.setCollideWorldBounds(true);
      s.physics.add.collider(body, s.groundLayer);
      s.physics.add.collider(body, s.blockers);
      const spr = s.add.sprite(x, y, key, 0).setOrigin(0.5, 1);
      const shadow = s.add.ellipse(x, y + 1, 14, 5, 0x000000, 0.3);
      this.guests.push({ body, spr, shadow, wait: Math.random() * 1500, dir: 'down', home: { x, y } });
    }
    // Ankündigung und (einmal) das Sequenzbild
    const cycle = Math.floor(this.state.playTime / SEASON_SECONDS);
    const seenKey = `fest_${f}_gesehen`;
    if (!this.state.flags.has(seenKey)) {
      this.state.flags.add(seenKey);
      s.ui.showMessage(FESTE[f].name, FESTE[f].text, { scene: `fest_${f}`, footer: 'Weiter mit E' });
    } else if (this.state.festBanner !== `${f}:${cycle}:${this.map.id}`) {
      s.ui.festBanner?.(f, FESTE[f].name);
    }
    this.state.festBanner = `${f}:${cycle}:${this.map.id}`;
  }

  /** Gäste schlendern; hin und wieder zeigt einer ein Gerede-Symbol. */
  updateGuests(delta, blocked) {
    const s = this.scene;
    for (const g of this.guests) {
      const b = g.body.body;
      g.wait -= delta;
      if (g.wait <= 0) {
        g.wait = 900 + Math.random() * 2200;
        if (Math.random() < 0.45 || Math.hypot(g.body.x - g.home.x, g.body.y - g.home.y) > 60) {
          const back = Math.hypot(g.body.x - g.home.x, g.body.y - g.home.y) > 60;
          const ang = back ? Math.atan2(g.home.y - g.body.y, g.home.x - g.body.x) : Math.random() * Math.PI * 2;
          b.setVelocity(Math.cos(ang) * 22, Math.sin(ang) * 22);
        } else b.setVelocity(0, 0);
      }
      if (blocked) b.setVelocity(0, 0);
      const vx = b.velocity.x;
      const vy = b.velocity.y;
      if (vx || vy) {
        g.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
        g.spr.anims.play(`${g.spr.texture.key}-walk-${g.dir}`, true);
      } else { g.spr.anims.stop(); g.spr.setFrame(DIRS.indexOf(g.dir) * 4); }
      g.spr.setPosition(g.body.x, g.body.y + 4).setDepth(100 + g.body.y + 4);
      g.shadow.setPosition(g.body.x, g.body.y + 5).setDepth(g.spr.depth - 1);
    }
    this.geredeT -= delta;
    if (this.geredeT > 0 || !this.guests.length || blocked) return;
    this.geredeT = 2800 + Math.random() * 3500;
    const g = this.guests[Math.floor(Math.random() * this.guests.length)];
    const key = `bv_fest_${this.fest}_gerede`;
    const name = FEST_GEREDE[Math.floor(Math.random() * FEST_GEREDE.length)];
    if (!s.textures.get(key)?.has(name)) return;
    const sym = s.add.image(g.spr.x, g.spr.y - 36, key, name).setDepth(DEPTH.dark + 3).setAlpha(0);
    s.tweens.add({ targets: sym, alpha: 1, y: sym.y - 4, duration: 250, yoyo: true, hold: 1500, onComplete: () => sym.destroy() });
  }

  update(delta, blocked) {
    if (!this.outdoor) return;
    const cam = this.scene.cameras.main;
    for (const d of this.drift) {
      d.x = ((d.x + (d.dx * delta) / 1000) % 64 + 64) % 64;
      d.y = ((d.y + (d.dy * delta) / 1000 - cam.scrollY * 0.002) % 64 + 64) % 64;
    }
    if (!blocked) this.breathe(delta);
    if (this.fest) this.updateGuests(delta, blocked);
  }
}
