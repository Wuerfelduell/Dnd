// Seq-4-Rituale auf der Karte (core/Seq4.js): die Laternennacht in Echtzeit (core/Laternenwacht.js),
// die Schattensteuerung (Körper bleibt stehen, man führt den Schatten), die Taubheit des Echos (Ton aus)
// und der Wächter des Eisens, der kommt, wo man steht (vorgemerkter Kampf startet von selbst).
import Phaser from 'phaser';
import { Laternenwacht, WACHT } from '../core/Laternenwacht.js';
const VIEW_W = 480; // wie WorldScene (kein Import, sonst Kreis)

const SHADOW_TINT = 0x2a2238;

export class HalbgottRitual {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.siege = null;
    this.gfx = scene.add.graphics().setDepth(5000);
    this.keys = scene.input.keyboard.addKeys('R,F');
    this.deaf = false;
    this.body = null;
    // Wer mitten in der Laternennacht die Karte verlässt oder neu lädt, hat den Kreis verlassen
    const st = this.state.seq4?.() ?? {};
    if (st.siege) this.scene.time.delayedCall(300, () => this.finishSiege({ won: false, reason: 'Du hast den Kreis der Laternen verlassen.' }));
  }

  /** Blockiert die Laternennacht oder der Schatten den Kartenwechsel? Gibt den Grund zurück oder null. */
  blocksTravel() {
    if (this.siege) return 'Wer den Kreis verlässt, lässt die Laternen allein. Halte das Licht.';
    if (this.state.shadowActive?.()) return 'Der Schatten reicht nicht weiter als bis hierher. Dein Körper wartet.';
    return null;
  }

  /** Friert die Wesen auf der Karte ein, solange die Laternennacht läuft. */
  freezesWorld() {
    return !!this.siege;
  }

  startSiege() {
    if (this.siege) return;
    const s = this.state;
    const p = this.scene.player;
    this.siege = new Laternenwacht({ x: p.x, y: p.y - 6 }, {
      hooks: {
        nerves: () => s.composure,
        spend: (n) => s.setComposure(s.composure - n),
        hurt: (n) => { s.damage(n); if (s.hp < 1) s.hp = 1; return s.hp; },
        unruhe: (n) => s.setUnruhe(s.unruhe + n),
      },
    });
    this.siegeText = this.scene.add.text(VIEW_W / 2, 6, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffe8b0', stroke: '#000', strokeThickness: 3, align: 'center' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(5001);
    this.scene.cameras.main.flash(300, 255, 220, 140);
  }

  finishSiege(result) {
    const r = this.state.endSiege?.(result);
    this.siege = null;
    this.siegeText?.destroy();
    this.siegeText = null;
    this.gfx.clear();
    if (r?.text) this.scene.ui.showMessage(this.state.seq4Name?.('laterne') ?? 'Laternennacht', r.text);
  }

  update(delta, blocked) {
    this.updateDeaf();
    this.updateShadow();
    // Wächter des Eisens (und jeder andere vorgemerkte Kampf ohne offenes Fenster)
    if (!blocked && this.state.pendingCombat && !this.scene.scene.isActive('combat')) this.scene.startCombat(this.state.pendingCombat);
    if (!this.siege) return;
    const dt = Math.min(0.1, delta / 1000);
    const p = this.scene.player;
    if (!blocked) {
      const events = this.siege.update(dt, { x: p.x, y: p.y - 6, refill: this.keys.R.isDown, sunrise: Phaser.Input.Keyboard.JustDown(this.keys.F) });
      for (const e of events) {
        if (e.type === 'hit') {
          p.x += e.knock.x;
          p.y += e.knock.y;
          this.scene.cameras.main.shake(120, 0.01);
          p.setTint(0xff8080);
          this.scene.time.delayedCall(140, () => p.clearTint());
        } else if (e.type === 'kill') this.state.seq4().siegeKills = e.kills;
        else if (e.type === 'sunrise') this.scene.cameras.main.flash(900, 255, 240, 200);
        else if (e.type === 'sunrise_fail') this.scene.ui.toast?.('Er steht nicht zwischen drei brennenden Laternen.', 'warn');
        else if (e.type === 'tired') this.scene.ui.toast?.('Zu wenig Nerven zum Nachfüllen.', 'warn');
        else if (e.type === 'guardian') { this.scene.cameras.main.shake(400, 0.006); this.scene.ui.toast?.('Der Wächter tritt aus dem Dunkel. Nur der Sonnenaufgang (F) zwischen drei Flammen fällt ihn.', 'warn'); }
      }
      if (this.siege.outcome) { this.finishSiege({ won: this.siege.outcome === 'won', reason: this.siege.reason }); return; }
    }
    this.drawSiege();
  }

  drawSiege() {
    const w = this.siege;
    const g = this.gfx;
    const t = this.scene.time.now;
    g.clear();
    for (const l of w.lanterns) {
      const k = l.oil / WACHT.oilMax;
      if (l.oil > 0) {
        g.fillStyle(0xffd070, 0.08 + 0.1 * k).fillCircle(l.x, l.y, WACHT.light * (0.6 + 0.4 * k));
        g.fillStyle(0xffe8a0, 0.9).fillCircle(l.x, l.y - 4, 2.5 + Math.sin(t / 90 + l.i) * 0.6);
      }
      g.fillStyle(0x2a2a30, 1).fillRect(l.x - 1, l.y - 3, 2, 8);
      g.fillStyle(0x000000, 0.7).fillRect(l.x - 7, l.y + 7, 14, 3);
      g.fillStyle(k > 0.3 ? 0xe8c070 : 0xe05050, 1).fillRect(l.x - 7, l.y + 7, 14 * k, 3);
    }
    for (const m of w.monsters) {
      g.fillStyle(0x0c0a14, 0.85).fillEllipse(m.x, m.y, 12, 9);
      g.fillStyle(0xb0f0ff, 1).fillRect(m.x - 3, m.y - 2, 1, 1).fillRect(m.x + 2, m.y - 2, 1, 1);
    }
    if (w.guardian) {
      const gd = w.guardian;
      const ready = w.sunriseReady();
      g.fillStyle(0x10101c, 0.9).fillEllipse(gd.x, gd.y - 8, 18, 28);
      g.lineStyle(1, ready ? 0xfff0b0 : 0x8070a0, 1).strokeEllipse(gd.x, gd.y - 8, 20, 30);
      g.fillStyle(0xe8c070, 1).fillCircle(gd.x, gd.y - 12, 2);
    }
    const p = this.scene.player;
    if (w.aura) g.lineStyle(1, 0xffe8b0, 0.35).strokeCircle(p.x, p.y - 6, WACHT.auraRadius);
    if (w.refill) {
      const k = w.refill.t / WACHT.refillSec;
      g.lineStyle(2, 0xffe8a0, 1).beginPath().arc(p.x, p.y - 24, 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k).strokePath();
    }
    const lit = w.lit().length;
    this.siegeText?.setText(`${this.state.seq4Name?.('laterne') ?? ''} · Laternen ${lit}/${WACHT.lanterns} · ${w.guardian ? 'WÄCHTER' : `Wesen ${w.kills}/${WACHT.monsters}`}\nR halten: nachfüllen · F: Sonnenaufgang${w.guardian && w.sunriseReady() ? ' · JETZT!' : ''}`);
  }

  /** Echo: völlige Taubheit, solange die Prüfung läuft. */
  updateDeaf() {
    const deaf = !!this.state.seq4Deaf?.();
    if (deaf === this.deaf) return;
    this.deaf = deaf;
    this.scene.sound.mute = deaf;
    const music = this.scene.registry.get('music');
    if (music?.synth) { if (deaf) music.synth.lautstaerke = 0; else music.applyVolume?.(); }
  }

  /** Schlüssel: der Körper bleibt als regungslose Gestalt stehen, die Spielfigur ist der Schatten. */
  updateShadow() {
    const active = !!this.state.shadowActive?.();
    const p = this.scene.player;
    if (active && !this.body) {
      const st = this.state.seq4();
      st.body ??= { x: p.x, y: p.y };
      this.body = this.scene.add.sprite(st.body.x, st.body.y, p.texture.key, p.frame.name).setOrigin(0.5, 1).setDepth(100 + st.body.y).setAlpha(0.95);
      this.bodyMark = this.scene.add.text(st.body.x, st.body.y - 34, '◇', { fontFamily: 'monospace', fontSize: '8px', color: '#c0b0ff' }).setOrigin(0.5).setDepth(5000);
    }
    if (active) { p.setTint(SHADOW_TINT); p.setAlpha(0.8); return; }
    if (this.body) {
      p.setPosition(this.body.x, this.body.y);
      p.clearTint();
      p.setAlpha(1);
      this.body.destroy();
      this.bodyMark?.destroy();
      this.body = null;
      this.bodyMark = null;
      this.scene.cameras.main.flash(200, 60, 40, 90);
    }
  }
}
