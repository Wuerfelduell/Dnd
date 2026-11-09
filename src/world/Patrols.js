import Phaser from 'phaser';
import { TILE, TILE_INDEX, SOLID_KEYS, createCharacterSheet } from './textures.js';
import { DEPTH } from './Lighting.js';

// Kapitel 2 (Wexmoor): Grauspäher laufen feste Runden mit Sturmlaterne.
// Wer im Lichtkegel steht und nicht hinter Kisten, Fässern oder Mauern verdeckt ist, wird gesehen.
// Bleibst du zu lange drin, folgt die Festnahme; kommst du rechtzeitig raus, steigt nur die Fahndungsstufe.
// Kartenfeld: patrols: [{ id, route: [[x, y], ...], speed?, wait?, visible_if? }] (Kacheln; die Route läuft im Kreis).

const DIRS = ['down', 'left', 'right', 'up'];
const LOSE_MS = 900; // so lange außer Sicht, dann gilt man als entkommen
const START_GRACE_MS = 1500; // nach dem Betreten der Karte
const FACING = { down: Math.PI / 2, up: -Math.PI / 2, left: Math.PI, right: 0 };

export class Patrols {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.list = [];
    this.graceUntil = 0;
    this.solid = new Set(SOLID_KEYS.map((k) => TILE_INDEX[k]));
  }

  build() {
    const s = this.scene;
    const defs = s.mapDef.patrols ?? [];
    if (!defs.length || !this.state.policeRules()) return;
    const npc = this.state.content.npcs.grauspaeher;
    createCharacterSheet(s, 'npc_grauspaeher', npc.palette);
    DIRS.forEach((dir, row) => {
      const key = `grauspaeher-${dir}`;
      if (!s.anims.exists(key)) s.anims.create({ key, frames: s.anims.generateFrameNumbers('npc_grauspaeher', { start: row * 4, end: row * 4 + 3 }), frameRate: 6, repeat: -1 });
    });
    // Paket Q: fünfte Reihe = Laterne heben und umsehen (nur im echten Sheet)
    this.lookAround = s.textures.get('npc_grauspaeher').frameTotal > 17;
    if (this.lookAround && !s.anims.exists('grauspaeher-look')) {
      s.anims.create({ key: 'grauspaeher-look', frames: s.anims.generateFrameNumbers('npc_grauspaeher', { start: 16, end: 19 }), frameRate: 4, repeat: -1 });
    }
    // Gemalter Lichtkegel (Ursprung links mittig), sonst gezeichnetes Kreissegment
    this.coneArt = s.textures.exists('q_lichtkegel_normal') && s.textures.exists('q_lichtkegel_suspicious');
    this.graceUntil = s.time.now + START_GRACE_MS;
    for (const def of defs) {
      if (def.visible_if && !this.state.meets(def.visible_if)) continue;
      const pts = def.route.map(([tx, ty]) => ({ x: tx * TILE + 8, y: ty * TILE + 15 }));
      const sprite = s.add.sprite(pts[0].x, pts[0].y, 'npc_grauspaeher', 0).setOrigin(0.5, 1);
      const cone = this.coneArt
        ? s.add.sprite(0, 0, 'q_lichtkegel_normal', 0).setOrigin(0, 0.5).setDepth(DEPTH.dark + 1).setBlendMode(Phaser.BlendModes.ADD).play('q_lichtkegel_normal')
        : s.add.graphics().setDepth(DEPTH.dark + 1).setBlendMode(Phaser.BlendModes.ADD);
      const alert = s.add.text(0, 0, '!', {
        fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold', color: '#ffd060', stroke: '#1a1c2c', strokeThickness: 3,
      }).setOrigin(0.5, 1).setDepth(DEPTH.dark + 3).setVisible(false);
      const lamp = { x: pts[0].x, y: pts[0].y };
      const g = {
        def, pts, sprite, cone, alert, lamp, next: 1 % pts.length, wait: 0, facing: 'down',
        speed: def.speed ?? 28, pause: def.wait ?? 900, seenMs: 0, lostMs: 0, spotting: false,
      };
      g.light = s.lighting.add({ follow: lamp, radius: 46, intensity: 0.9, color: 0xffd890, glowAlpha: 0.25, flicker: 0.1 });
      this.list.push(g);
    }
  }

  update(time, delta, blocked) {
    if (!this.list.length) return;
    if (blocked) { if (this.graceUntil > time) this.graceUntil += delta; for (const g of this.list) g.sprite.anims.stop(); return; }
    const p = this.scene.player;
    const graced = time < this.graceUntil;
    const cone = this.state.policeCone();
    for (const g of this.list) {
      const seen = !graced && this.sees(g, p.x, p.y - 8, cone);
      if (seen) {
        g.spotting = true;
        g.lostMs = 0;
        g.seenMs += delta;
        this.face(g, Math.atan2(p.y - g.sprite.y, p.x - g.sprite.x));
        g.sprite.anims.stop();
        if (g.seenMs >= cone.catchSec * 1000) { this.caught(); return; }
      } else if (g.spotting) {
        g.lostMs += delta;
        g.sprite.anims.stop();
        if (g.lostMs >= LOSE_MS) {
          g.spotting = false;
          g.seenMs = 0;
          this.state.escapedPatrol();
          this.graceUntil = time + START_GRACE_MS;
        }
      } else {
        this.walk(g, delta);
      }
      this.draw(g, cone, time);
    }
  }

  /** Läuft zum nächsten Wegpunkt, wartet dort kurz und schaut sich um. */
  walk(g, delta) {
    if (g.wait > 0) {
      g.wait -= delta;
      if (this.lookAround) g.sprite.anims.play('grauspaeher-look', true);
      else g.sprite.anims.stop();
      return;
    }
    const t = g.pts[g.next];
    const dx = t.x - g.sprite.x;
    const dy = t.y - g.sprite.y;
    const d = Math.hypot(dx, dy);
    const step = (g.speed * delta) / 1000;
    if (d <= step) {
      g.sprite.setPosition(t.x, t.y);
      g.next = (g.next + 1) % g.pts.length;
      g.wait = g.pause;
      return;
    }
    g.sprite.setPosition(g.sprite.x + (dx / d) * step, g.sprite.y + (dy / d) * step);
    this.face(g, Math.atan2(dy, dx));
    g.sprite.anims.play(`grauspaeher-${g.facing}`, true);
  }

  face(g, angle) {
    const deg = Phaser.Math.RadToDeg(angle);
    g.facing = deg > -45 && deg <= 45 ? 'right' : deg > 45 && deg <= 135 ? 'down' : deg < -45 && deg >= -135 ? 'up' : 'left';
    g.angle = angle;
    if (!g.sprite.anims.isPlaying) g.sprite.setFrame(DIRS.indexOf(g.facing) * 4);
  }

  /** Im Kegel, in Reichweite und keine feste Kachel dazwischen? */
  sees(g, px, py, cone) {
    const ox = g.sprite.x;
    const oy = g.sprite.y - 10;
    const d = Math.hypot(px - ox, py - oy);
    if (d > cone.range) return false;
    const dir = g.angle ?? FACING[g.facing];
    const diff = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(py - oy, px - ox) - dir));
    if (diff > Phaser.Math.DegToRad(cone.angle / 2)) return false;
    return this.clear(ox, oy, px, py) && !this.behindProp(ox, oy, px, py);
  }

  /** Sichtlinie über die Kacheln: Wände, Kisten, Fässer, Wasser zählen nicht (Wasser verdeckt nichts). */
  clear(x0, y0, x1, y1) {
    const layer = this.scene.groundLayer;
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6);
    for (let i = 1; i < steps; i++) {
      const t = layer.getTileAtWorldXY(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps);
      if (t && this.solid.has(t.index) && !String(this.scene.mapDef.rows[t.y]?.[t.x]).match(/[~]/)) return false;
    }
    return true;
  }

  /** Deko mit `cover: true` (Kohlenwagen, Fässer) verdeckt ebenfalls. */
  behindProp(x0, y0, x1, y1) {
    const line = new Phaser.Geom.Line(x0, y0, x1, y1);
    return (this.scene.coverRects ?? []).some((r) => Phaser.Geom.Intersects.LineToRectangle(line, r));
  }

  draw(g, cone, time) {
    const { sprite, alert, lamp } = g;
    sprite.setDepth(100 + sprite.y);
    const dir = g.angle ?? FACING[g.facing];
    lamp.x = sprite.x + Math.cos(dir) * 10;
    lamp.y = sprite.y - 12 + Math.sin(dir) * 6;
    const half = Phaser.Math.DegToRad(cone.angle / 2);
    const hot = g.spotting;
    if (this.coneArt) {
      // Länge = Reichweite, Breite = Öffnungswinkel am Ende des Kegels
      const key = hot ? 'q_lichtkegel_suspicious' : 'q_lichtkegel_normal';
      const c = g.cone;
      if (c.anims.currentAnim?.key !== key) c.play(key);
      c.setPosition(sprite.x, sprite.y - 10).setRotation(dir)
        .setScale(cone.range / 96, (2 * cone.range * Math.tan(half)) / (hot ? 56 : 48)).setAlpha(hot ? 0.5 : 0.3);
    } else {
      const c = g.cone.clear();
      const flick = 0.9 + 0.1 * Math.sin(time * 0.013 + sprite.x);
      c.fillStyle(hot ? 0xff7040 : 0xffd890, (hot ? 0.22 : 0.12) * flick);
      c.slice(sprite.x, sprite.y - 10, cone.range, dir - half, dir + half, false);
      c.fillPath();
    }
    alert.setPosition(sprite.x, sprite.y - 30).setVisible(hot);
    if (hot) alert.setText(g.seenMs > 0 && g.lostMs === 0 ? '!' : '?');
  }

  caught() {
    const s = this.scene;
    for (const g of this.list) { g.spotting = false; g.seenMs = 0; }
    s.player.setVelocity(0, 0);
    const res = this.state.arrest();
    s.ui.showMessage('Festgenommen', res.text, {
      aside: s.ui.portraitHtml('streife', 'angry'),
      footer: res.seized > 0 ? `Beschlagnahmt: ${res.seized} Schilling. Fahndungsstufe ${this.state.wanted}.` : `Fahndungsstufe ${this.state.wanted}.`,
      onClose: () => s.travelTo(res.map, res.spawn),
    });
  }
}
