import Phaser from 'phaser';
import { TILE } from './textures.js';
import { DEPTH } from './Lighting.js';
import { overworldIdFor, LOOT_SHEETS, RARITY_SHEET } from './assets.js';
import { lootRarity, lootList, rollLoot, takeLoot, isEmptyLoot, RARITY_COLORS, CONTAINERS, CONTAINER_NAMES } from '../core/Loot.js';

// Gefahrengebiete: Gegner, die sichtbar über die Karte streifen, dich bemerken und jagen.
// Berührung startet den Kampf. Besiegte Gegner lassen einen Beutebehälter fallen.
// Beim nächsten Betreten der Karte sind alle wieder da (außer besiegten Bossen).

const DIRS = ['down', 'left', 'right', 'up'];
const ELITE_CHANCE = 0.15;
const CONTACT = 13; // Abstand in Pixeln, ab dem der Kampf beginnt
const GRACE_MS = 2600; // nach Flucht oder Sieg: so lange greift niemand an
const STUN_MS = 3500; // nach deiner Flucht steht der Gegner so lange benommen herum
const WANDER_TILES = 4;
const LEASH = 2.4; // jagt bis zum Vielfachen seines Wahrnehmungsradius
const hex = (c) => Number.parseInt(c.slice(1), 16);

export class Roamers {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.list = [];
    this.drops = [];
    this.graceUntil = 0;
    this.lastWarn = 0;
  }

  build() {
    const s = this.scene;
    const defs = s.mapDef.roamers ?? [];
    const encs = this.state.content.encounters;
    for (const def of defs) {
      if (def.boss && this.state.flags.has(`won_${def.encounter}`)) continue; // Bosse bleiben besiegt
      if (def.visible_if && !this.state.meets(def.visible_if)) continue; // Stadtgegner: erst ab einem Fall, Kopfgeld-Ziele nur mit Auftrag
      const eliteId = `${def.encounter}_elite`;
      const elite = !def.boss && !!encs[eliteId] && Math.random() < (def.elite_chance ?? s.mapDef.elite_chance ?? ELITE_CHANCE);
      const id = elite ? eliteId : def.encounter;
      const enc = encs[id];
      if (!enc) throw new Error(`Unbekannter Gegner auf ${s.mapDef.id}: ${id}`);
      const [tx, ty] = def.tile;
      const x = tx * TILE + 8;
      const y = ty * TILE + 12;
      const body = s.add.zone(x, y, 10, 8);
      s.physics.add.existing(body);
      body.body.setCollideWorldBounds(true);
      s.physics.add.collider(body, s.groundLayer);
      s.physics.add.collider(body, s.blockers);
      const r = {
        def, id, enc, body, elite, boss: !!def.boss, alive: true,
        home: { x, y }, mode: 'wander', target: null, wait: Math.random() * 1500, stunUntil: 0, noticed: false,
        roam: enc.roam ?? {}, phase: Math.random() * 6, lastPos: { x, y }, stuck: 0,
      };
      this.makeSprite(r, def.encounter);
      r.shadow = s.add.ellipse(x, y + 1, r.boss ? 26 : 14, r.boss ? 8 : 5, 0x000000, 0.35);
      r.alert = this.makeAlert(x, y - 30, enc.occult);
      // Paket G: Elite und Bosse tragen eine flackernde Aura
      if ((r.elite || r.boss) && s.textures.exists('g_monster_fx_elite')) {
        r.aura = s.add.sprite(x, y, 'g_monster_fx_elite').setOrigin(0.5, 0.8).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.75).setScale(r.boss ? 1.4 : 1);
        r.aura.play('g_monster_fx_elite');
      }
      // Leuchtende Augen bzw. Aura, damit man sie im Dunkeln kommen sieht
      const color = r.elite ? 0xff6050 : enc.tint ? hex(enc.tint) : 0x6fe0d0;
      r.light = s.lighting.add({ follow: r.sprite, offsetY: -r.sprite.displayHeight * 0.5, radius: r.boss ? 56 : r.elite ? 34 : 26, intensity: r.boss ? 0.6 : 0.42,
        color, glowAlpha: r.elite || r.boss ? 0.4 : 0.25, flicker: 0.25, active: () => r.alive });
      if (r.elite || r.boss) {
        r.label = s.add.text(x, y - 34, r.boss ? `☠ ${enc.name}` : `★ ${enc.name}`, {
          fontFamily: 'monospace', fontSize: '8px', color: r.boss ? '#ff7060' : '#ffb080', stroke: '#1a1c2c', strokeThickness: 2,
        }).setOrigin(0.5, 1).setDepth(DEPTH.dark + 3).setAlpha(0.9);
      }
      this.list.push(r);
    }
  }

  /** Bemerkt-Zeichen: gemaltes Alarm-Symbol (Paket F), sonst ein Ausrufezeichen. */
  makeAlert(x, y, occult) {
    const s = this.scene;
    if (s.textures.exists('F_04_alarm')) {
      const name = occult ? 'occult' : 'noticed';
      const key = `F_04_alarm-${name}`;
      if (!s.anims.exists(key)) {
        const def = s.cache.json.get('manifestKampf2')?.assets?.find((a) => a.id === 'F_04_alarm')?.animations?.[name];
        if (def) s.anims.create({ key, frames: def.frames.map((frame) => ({ key: 'F_04_alarm', frame })), frameRate: def.frameRate, repeat: def.repeat });
      }
      const spr = s.add.sprite(x, y, 'F_04_alarm', 0).setOrigin(0.5, 1).setDepth(DEPTH.dark + 3).setVisible(false);
      if (s.anims.exists(key)) spr.play(key);
      return spr;
    }
    return s.add.text(x, y, '!', {
      fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#ffb040', stroke: '#1a1c2c', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(DEPTH.dark + 3).setVisible(false);
  }

  /** Eigenes Lauf-Sheet, sonst das Kampf-Sheet verkleinert und getönt. */
  makeSprite(r, baseId) {
    const s = this.scene;
    const { x, y } = r.home;
    const owId = overworldIdFor(baseId, r.enc);
    const owKey = `ow_${owId}`;
    const size = r.boss ? 1.5 : r.elite ? 1.2 : 1;
    if (owId && s.textures.exists(owKey)) {
      r.sheet = owKey;
      r.sprite = s.add.sprite(x, y + 2, owKey, 0).setOrigin(0.5, 1).setScale(size);
      DIRS.forEach((dir, row) => {
        const key = `${owKey}-${dir}`;
        if (!s.anims.exists(key)) s.anims.create({ key, frames: s.anims.generateFrameNumbers(owKey, { start: row * 4, end: row * 4 + 3 }), frameRate: 7, repeat: -1 });
      });
    } else {
      const sheet = r.enc.sheet && s.textures.exists(r.enc.sheet) ? r.enc.sheet : null;
      const frameH = sheet ? s.textures.get(sheet).get(0).height : 32;
      r.sprite = sheet ? s.add.sprite(x, y + 2, sheet, 0) : s.add.image(x, y + 2, 'glow');
      r.sprite.setOrigin(0.5, 0.92).setScale(((r.boss ? 46 : 30) / frameH) * (r.elite ? 1.2 : 1));
    }
    if (r.elite) r.sprite.setTint(0xff9080);
    else if (r.enc.tint) r.sprite.setTint(hex(r.enc.tint)); // Varianten (z. B. Kraterbrut) bleiben erkennbar
  }

  // --- Spielschleife -----------------------------------------------------------

  update(time, delta, blocked) {
    const s = this.scene;
    // Uhren laufen nicht, solange ein Fenster offen ist; danach kurz durchatmen
    if (blocked) {
      if (this.graceUntil > time) this.graceUntil += delta;
      for (const r of this.list) if (r.stunUntil > time) r.stunUntil += delta;
      this.wasBlocked = true;
    } else if (this.wasBlocked) {
      this.wasBlocked = false;
      this.graceUntil = Math.max(this.graceUntil, time + 700);
    }
    for (const r of this.list) {
      if (!r.alive) continue;
      const b = r.body.body;
      if (blocked) { b.setVelocity(0, 0); this.sync(r, time); continue; }
      const p = s.nearestPlayer?.(r.body.x, r.body.y) ?? s.player; // zu zweit: wer näher ist
      const dx = p.x - r.body.x;
      const dy = (p.y - 3) - r.body.y;
      const d = Math.hypot(dx, dy);
      const roam = r.roam;
      const aggro = (roam.aggro ?? 72) * (r.elite ? 1.15 : 1) * (s.state.spiritVision ? 1.25 : 1);
      const home = Math.hypot(r.body.x - r.home.x, r.body.y - r.home.y);
      const graced = time < this.graceUntil;
      if (time < r.stunUntil) {
        b.setVelocity(0, 0);
        r.mode = 'wander';
      } else if (!graced && (d < aggro || (r.mode === 'chase' && d < aggro * LEASH && home < aggro * 4))) {
        if (r.mode !== 'chase') this.notice(r, time);
        r.mode = 'chase';
        const speed = (roam.chase ?? 54) * (r.elite ? 1.12 : 1);
        const v = new Phaser.Math.Vector2(dx, dy).normalize().scale(speed);
        // Festgefahren an einer Kante? Seitlich ausweichen
        if (r.stuck > 400) v.rotate(r.stuckDir ?? Math.PI / 2);
        b.setVelocity(v.x, v.y);
        if (d < CONTACT) { this.engage(r); return; }
      } else {
        if (r.mode === 'chase') { r.mode = 'return'; r.target = { ...r.home }; }
        this.wander(r, delta);
      }
      // Festhängen erkennen
      const moved = Math.hypot(r.body.x - r.lastPos.x, r.body.y - r.lastPos.y);
      const wants = Math.hypot(b.velocity.x, b.velocity.y) > 1;
      if (wants && moved < 0.2) {
        r.stuck += delta;
        if (r.stuck > 400 && !r.stuckDir) r.stuckDir = Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
        if (r.stuck > 1400) { r.stuck = 0; r.stuckDir = null; r.target = null; }
      } else if (moved > 0.5) { r.stuck = Math.max(0, r.stuck - delta); if (!r.stuck) r.stuckDir = null; }
      r.lastPos = { x: r.body.x, y: r.body.y };
      this.sync(r, time);
    }
  }

  wander(r, delta) {
    const b = r.body.body;
    const speed = r.roam.speed ?? 26;
    if (!speed && r.mode !== 'return') { b.setVelocity(0, 0); return; } // Bosse lauern an ihrem Platz
    if (r.wait > 0) { r.wait -= delta; b.setVelocity(0, 0); return; }
    if (!r.target) {
      const a = Math.random() * Math.PI * 2;
      const dist = (0.4 + Math.random() * 0.6) * WANDER_TILES * TILE;
      r.target = { x: r.home.x + Math.cos(a) * dist, y: r.home.y + Math.sin(a) * dist };
    }
    const tx = r.target.x - r.body.x;
    const ty = r.target.y - r.body.y;
    const dist = Math.hypot(tx, ty);
    if (dist < 4 || r.stuck > 900) {
      r.target = null;
      r.wait = 700 + Math.random() * 2200;
      if (r.mode === 'return') r.mode = 'wander';
      b.setVelocity(0, 0);
      return;
    }
    const v = new Phaser.Math.Vector2(tx, ty).normalize().scale(r.mode === 'return' ? Math.max(speed, 30) * 1.3 : speed);
    b.setVelocity(v.x, v.y);
  }

  /** Grafik folgt dem Körper: Laufanimation oder Wippen, Blickrichtung, Tiefe. */
  sync(r, time) {
    const { x, y } = r.body;
    const vx = r.body.body.velocity.x;
    const vy = r.body.body.velocity.y;
    const moving = Math.abs(vx) + Math.abs(vy) > 2;
    if (r.sheet) {
      if (moving) {
        const dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
        r.sprite.anims.play(`${r.sheet}-${dir}`, true);
      } else r.sprite.anims.stop();
      r.sprite.setPosition(x, y + 2);
    } else {
      const bob = Math.sin(time * (moving ? 0.018 : 0.005) + r.phase) * (moving ? 1.5 : 1);
      r.sprite.setPosition(x, y + 2 + bob);
      if (Math.abs(vx) > 2) r.sprite.setFlipX(vx > 0); // Kampf-Sheets schauen nach links
    }
    const depth = 100 + y + 2;
    r.sprite.setDepth(depth);
    r.shadow.setPosition(x, y + 2).setDepth(depth - 1);
    r.aura?.setPosition(x, y + 2).setDepth(depth - 0.5);
    const top = y + 2 - r.sprite.displayHeight * r.sprite.originY;
    r.alert.setPosition(x, top - 2 + Math.sin(time * 0.012) * 1.5).setVisible(r.mode === 'chase');
    r.label?.setPosition(x, top - (r.mode === 'chase' ? 14 : 2));
  }

  notice(r, time) {
    this.scene.tweens.add({ targets: r.alert, scale: { from: 1.8, to: 1 }, duration: 220 });
    if (time - this.lastWarn > 4000) {
      this.lastWarn = time;
      this.scene.ui.toast?.(`${r.enc.name} hat dich bemerkt!`, 'warn');
    }
  }

  engage(r) {
    r.body.body.setVelocity(0, 0);
    this.scene.startCombat(r.id, null, { roamer: r });
  }

  /** Ergebnis eines Kampfes gegen einen Gegner auf der Karte. */
  afterCombat(r, result) {
    const now = this.scene.time.now;
    if (result.outcome === 'won') {
      this.kill(r);
      this.graceUntil = now + 1200;
      if (result.loot && !isEmptyLoot(result.loot)) this.dropLoot(r.body.x, r.body.y + 2, result.loot, r.enc.name);
    } else if (result.outcome === 'fled') {
      r.stunUntil = now + STUN_MS;
      r.mode = 'wander';
      r.target = null;
      this.graceUntil = now + GRACE_MS;
      // Ein Stück zurückstoßen, damit man wegkommt
      const p = this.scene.player;
      const v = new Phaser.Math.Vector2(r.body.x - p.x, r.body.y - p.y).normalize().scale(10);
      r.body.body.reset(r.body.x + v.x, r.body.y + v.y);
    }
  }

  kill(r) {
    r.alive = false;
    r.body.body.enable = false;
    const parts = [r.sprite, r.shadow, r.alert, r.label, r.aura].filter(Boolean);
    r.alert.setVisible(false);
    this.scene.tweens.add({ targets: parts, alpha: 0, duration: 500, onComplete: () => parts.forEach((o) => o.destroy()) });
  }

  // --- Beute am Boden ------------------------------------------------------------

  /** Legt einen Behälter mit fertiger Beute (oder einer Beutetabelle) auf die Karte. */
  dropLoot(x, y, loot, source, { container = null, def = null } = {}) {
    const s = this.scene;
    const items = this.state.content.items;
    const rarity = loot ? lootRarity(loot, items) : 'gewoehnlich';
    const kind = container ?? CONTAINERS[rarity];
    const key = LOOT_SHEETS[kind] && s.textures.exists(`G_loot_${kind}`) ? `G_loot_${kind}` : `loot_${kind}`;
    const color = hex(RARITY_COLORS[loot ? rarity : 'selten']);
    const sprite = s.add.sprite(x, y, key, 0).setOrigin(0.5, 0.85).setDepth(100 + y);
    const item = {
      kind: 'loot', def: def ?? { title: CONTAINER_NAMES[kind] }, x, y: y - 4, hidden: false, reach: 20, active: true,
      prompt: def?.prompt ?? `${CONTAINER_NAMES[kind]} aufheben`, parts: [sprite], loot, source, container: kind, sprite,
    };
    if (!def) {
      sprite.setScale(0.2);
      s.tweens.add({ targets: sprite, scale: 1, y: { from: y - 10, to: y }, duration: 380, ease: 'Back.out' });
    }
    // Paket G: Lichtsäule in der Farbe der Seltenheit
    const beam = `g_selten_beam_${RARITY_SHEET[loot ? rarity : 'selten']}`;
    if (s.textures.exists(beam)) {
      const b = s.add.sprite(x, y - 2, beam).setOrigin(0.5, 1).setDepth(DEPTH.dark + 1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.7);
      b.play(beam);
      item.parts.push(b);
    }
    item.glow = s.lighting.add({ x, y: y - 6, radius: 24, intensity: 0.55, color, glowAlpha: 0.45, flicker: 0.3, active: () => item.active });
    item.glint = s.add.image(x + 3, y - 9, 'glint').setDepth(DEPTH.dark + 1).setAlpha(0).setTint(color).setBlendMode(Phaser.BlendModes.ADD);
    item.parts.push(item.glint);
    s.tweens.add({ targets: item.glint, alpha: 1, duration: 500, yoyo: true, repeat: -1, repeatDelay: 600 + Math.random() * 900 });
    s.interactables.push(item);
    this.drops.push(item);
    return item;
  }

  /** Statische Behälter aus der Karte (kind "loot"). */
  buildCaches() {
    for (const it of [...this.scene.interactables]) {
      if (it.kind !== 'loot' || it.loot !== undefined) continue;
      const def = it.def;
      it.active = false; // der Platzhalter aus buildObjects wird durch den Behälter ersetzt
      if (def.done_flag && this.state.flags.has(def.done_flag)) continue;
      this.dropLoot(it.x, it.y + 6, null, def.title ?? CONTAINER_NAMES[def.container], { container: def.container ?? 'kiste', def });
    }
  }

  /** E an einem Behälter: Beute würfeln (bei Kisten aus der Karte), zeigen, einsammeln. */
  open(item) {
    const def = item.def;
    const s = this.scene;
    let loot = item.loot;
    if (!loot) {
      const table = this.state.content.lootTables?.[def.table];
      if (!table) throw new Error(`Beutetabelle fehlt: ${def.table}`);
      loot = rollLoot(table, Math.random);
      for (const [id, n] of Object.entries(table.items ?? {})) loot.items[id] = (loot.items[id] ?? 0) + n;
      this.state.applyEffects({ ...def.effects, sets_flags: [...(def.effects?.sets_flags ?? []), ...(def.done_flag ? [def.done_flag] : [])] });
    }
    takeLoot(this.state, loot, item.source ?? '');
    item.active = false;
    if (s.textures.get(item.sprite.texture.key).frameTotal > 2) item.sprite.setFrame(1);
    s.tweens.add({ targets: item.parts, alpha: 0, delay: 500, duration: 500, onComplete: () => item.parts.forEach((o) => o.destroy()) });
    s.ui.showLoot(CONTAINER_NAMES[item.container] + (item.source ? `: ${item.source}` : ''), loot);
    return lootList(loot, this.state.content.items);
  }
}
