// Seq-4-Rituale auf der Karte (core/Seq4.js): die Laternennacht in Echtzeit (core/Laternenwacht.js),
// die Schattensteuerung (Körper bleibt stehen, man führt den Schatten), die Taubheit des Echos (Ton aus)
// und der Wächter des Eisens, der kommt, wo man steht (vorgemerkter Kampf startet von selbst).
import Phaser from 'phaser';
import { Laternenwacht, WACHT } from '../core/Laternenwacht.js';
import { laternenSound } from '../core/sounds.js';
import { TRAUM_ID, HG_FAEDEN } from '../core/Seq4.js';
import { hasArt, ritualFx, ritualAnim, playRitual, artFrame, artRegion, lookOf } from './ritualArt.js';
const VIEW_W = 480; // wie WorldScene (kein Import, sonst Kreis)
const LIT = 2201; // knapp über der Dunkelheit (Lighting DEPTH.dark = 2200)
const ESSENZ_FARBEN = ['tuerkis', 'gruen', 'amber', 'eisblau', 'rost'];

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
    // Codex DN/DO/DQ: Ritualgrafiken auf der Karte
    this.fxQueue = [];
    this.siegeArt = null;
    this.hud = null;
    this.hudSig = '';
    this.intro = null;
    this.seen = { masked: false, drunk: 0, kokon: false, eisenLoad: false };
    const off = this.state.on?.('ritualFx', (e) => { this.fxQueue.push(e); if (/gescheitert/.test(e.fx)) this.lastFailAt = Date.now(); });
    scene.events.once('shutdown', () => { off?.(); this.scene.registry.get('audio')?.stopLoop?.('s4la_nachfuellen_loop', 30); });
    scene.events.once('destroy', () => off?.());
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
    this.wasRefilling = false;
  }

  /** DS: Klang (still ohne Audio). */
  sfx(id, opts) {
    if (id) this.scene.registry.get('audio')?.play(id, opts);
  }

  finishSiege(result) {
    this.scene.registry.get('audio')?.stopLoop('s4la_nachfuellen_loop', 30);
    const r = this.state.endSiege?.(result);
    this.siege = null;
    this.siegeText?.destroy();
    this.siegeText = null;
    this.gfx.clear();
    this.clearSiegeArt(result?.won);
    if (r?.text) this.scene.ui.showMessage(this.state.seq4Name?.('laterne') ?? 'Laternennacht', r.text);
  }

  update(delta, blocked) {
    this.updateDeaf();
    this.updateShadow();
    this.updateArt(blocked);
    // Wächter des Eisens (und jeder andere vorgemerkte Kampf ohne offenes Fenster); Codex DN/DQ: erst der Auftritt
    if (!blocked && this.state.pendingCombat && !this.scene.scene.isActive('combat') && !this.combatIntro(this.state.pendingCombat)) this.scene.startCombat(this.state.pendingCombat);
    if (!this.siege) return;
    const dt = Math.min(0.1, delta / 1000);
    const p = this.scene.player;
    if (!blocked) {
      const events = this.siege.update(dt, { x: p.x, y: p.y - 6, refill: this.keys.R.isDown, sunrise: Phaser.Input.Keyboard.JustDown(this.keys.F) });
      // DS: Ölgluckern nur, solange R gehalten wird; Loslassen ohne vollen Behälter bricht hörbar ab
      const refilling = !!this.siege.refill;
      const audio = this.scene.registry.get('audio');
      if (refilling && !this.wasRefilling) audio?.loop('s4la_nachfuellen_loop');
      if (!refilling && this.wasRefilling) {
        audio?.stopLoop('s4la_nachfuellen_loop', 30);
        if (!events.some((e) => e.type === 'refill' || e.type === 'tired')) this.sfx('s4la_nachfuellen_abbruch');
      }
      this.wasRefilling = refilling;
      const w0 = this.siege;
      for (const e of events) {
        const sound = laternenSound(e);
        if (sound) this.sfx(sound);
        if (e.type === 'guardian') this.scene.time.delayedCall(1200, () => this.sfx('hg_schwellenwaechter_kalk'));
        if (e.type === 'hit') {
          ritualFx(this.scene, 's4la_rueckstoss', p.x, p.y - 12, { depth: 5003 });
          p.x += e.knock.x;
          p.y += e.knock.y;
          this.scene.cameras.main.shake(120, 0.01);
          p.setTint(0xff8080);
          this.scene.time.delayedCall(140, () => p.clearTint());
        } else if (e.type === 'kill') this.state.seq4().siegeKills = e.kills;
        else if (e.type === 'sunrise') { this.sunriseFx(); this.scene.cameras.main.flash(900, 255, 240, 200); this.toast('sonnenaufgang'); }
        else if (e.type === 'lantern_attacked') this.siegeArt?.lanterns[e.lantern]?.spr && playRitual(this.siegeArt.lanterns[e.lantern].spr, 's4la_ritual_laterne', 'angegriffen', () => { if (this.siegeArt?.lanterns[e.lantern]) this.siegeArt.lanterns[e.lantern].state = null; });
        else if (e.type === 'refill' && this.siegeArt?.lanterns[e.lantern]?.spr) { const l = this.siegeArt.lanterns[e.lantern]; playRitual(l.spr, 's4la_ritual_laterne', 'nachfuellen', () => { l.state = null; }); l.state = 'nachfuellen'; }
        else if (e.type === 'sunrise_fail' && w0.guardian && ritualFx(this.scene, 's4r_waechter_immun', w0.guardian.x, w0.guardian.y - 28, { depth: 5003 })) this.scene.ui.toast?.(`Er steht nicht zwischen drei brennenden Laternen. ${this.state.seq4Msg?.('laterne', 'waechter_immun') ?? ''}`.trim(), 'warn');
        else if (e.type === 'sunrise_fail') this.scene.ui.toast?.(`Er steht nicht zwischen drei brennenden Laternen. ${this.state.seq4Msg?.('laterne', 'waechter_immun') ?? ''}`.trim(), 'warn');
        else if (e.type === 'tired') this.scene.ui.toast?.('Zu wenig Nerven zum Nachfüllen.', 'warn');
        else if (e.type === 'lantern_weak') this.toast('laterne_schwach', { n: e.lantern + 1 }, 'warn');
        else if (e.type === 'lantern_out') this.toast('laterne_erloschen', { n: e.lantern + 1 }, 'warn');
        else if (e.type === 'guardian') { if (w0.guardian) ritualFx(this.scene, 's4r_waechter_erscheint', w0.guardian.x, w0.guardian.y - 40, { depth: 5003 }); this.scene.cameras.main.shake(400, 0.006); this.scene.ui.toast?.(`${this.state.seq4Msg?.('laterne', 'waechter_erscheint') || 'Der Wächter tritt aus dem Dunkel.'} Nur der Sonnenaufgang (F) zwischen drei Flammen fällt ihn.`, 'warn'); }
      }
      if (this.siege.outcome) { this.finishSiege({ won: this.siege.outcome === 'won', reason: this.siege.reason }); return; }
    }
    this.drawSiege();
  }

  /** Kurzmeldung aus Codex DR als Toast. */
  toast(key, vars, kind = 'info') {
    const t = this.state.seq4Msg?.('laterne', key, vars);
    if (t) this.scene.ui.toast?.(t, kind);
  }

  drawSiege() {
    if (this.drawSiegeArt()) return;
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

  /**
   * Echo: völlige Taubheit, solange die Prüfung läuft. DS: s4ec_taub_an verliert in 1,5 s alle Höhen, erst dann verstummt alles
   * (Musik sofort); beim Verlassen kommt der Ton zurück und s4ec_taub_aus führt sanft in die Welt.
   */
  updateDeaf() {
    const deaf = !!this.state.seq4Deaf?.();
    if (deaf === this.deaf) return;
    this.deaf = deaf;
    const music = this.scene.registry.get('music');
    if (music?.synth) { if (deaf) music.synth.lautstaerke = 0; else music.applyVolume?.(); }
    if (deaf) {
      this.sfx('s4ec_taub_an');
      this.scene.time.delayedCall(1500, () => { if (this.deaf) this.scene.sound.mute = true; });
    } else {
      this.scene.sound.mute = false;
      this.sfx('s4ec_taub_aus');
    }
  }

  /** Schlüssel: der Körper bleibt als regungslose Gestalt stehen, die Spielfigur ist der Schatten. */
  updateShadow() {
    const active = !!this.state.shadowActive?.();
    const p = this.scene.player;
    if (active && !this.body) {
      const st = this.state.seq4();
      st.body ??= { x: p.x, y: p.y, facing: this.scene.facing ?? 'down' };
      // Codex DO: der zurückgelassene Körper atmet regungslos (eigenes Blatt je Spielfigur), sonst das Standbild der Figur
      const bodyKey = `schatten_koerper_${lookOf(this.state, 1)}`;
      if (hasArt(this.scene, bodyKey)) {
        this.body = this.scene.add.sprite(st.body.x, st.body.y, bodyKey, 0).setOrigin(0.5, 1).setDepth(100 + st.body.y);
        playRitual(this.body, bodyKey, st.body.facing ?? 'down');
        this.band = this.scene.add.graphics().setDepth(99 + st.body.y);
        if (!st.bodyFx) { st.bodyFx = true; ritualFx(this.scene, 'schatten_trennen', st.body.x, st.body.y - 24, { depth: 5002 }); }
      } else {
        this.body = this.scene.add.sprite(st.body.x, st.body.y, p.texture.key, p.frame.name).setOrigin(0.5, 1).setDepth(100 + st.body.y).setAlpha(0.95);
      }
      this.bodyMark = this.scene.add.text(st.body.x, st.body.y - 34, '◇', { fontFamily: 'monospace', fontSize: '8px', color: '#c0b0ff' }).setOrigin(0.5).setDepth(5000);
    }
    if (active) {
      if (!this.scene.playerKey?.startsWith('schatten_')) { p.setTint(SHADOW_TINT); p.setAlpha(0.8); } // ohne eigenes Schattenblatt: getönt
      this.drawBand();
      return;
    }
    if (this.body) {
      const failed = this.lastFailAt && Date.now() - this.lastFailAt < 8000; // eben gescheitert: der Schatten zerfasert
      ritualFx(this.scene, failed ? 'schatten_verloren' : 'schatten_rueckkehr', p.x, p.y - 24, { depth: 5002 });
      this.band?.destroy();
      this.band = null;
      this.bandParts?.forEach((o) => o.destroy());
      this.bandParts = null;
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

  // --- Codex DN: Laternennacht mit echten Grafiken --------------------------------------------------------
  /** Zeichnet die Laternennacht mit den DN-Blättern; false, wenn sie fehlen (dann die alten Kreise). */
  drawSiegeArt() {
    const sc = this.scene;
    if (!hasArt(sc, 's4la_ritual_laterne')) return false;
    const w = this.siege;
    const g = this.gfx;
    g.clear();
    const a = (this.siegeArt ??= { lanterns: [], monsters: new Map(), hud: null });
    // Laternen: Zustand nach Ölstand, Lichtkreis um jede brennende
    w.lanterns.forEach((l, i) => {
      let o = a.lanterns[i];
      if (!o) {
        o = a.lanterns[i] = { spr: sc.add.sprite(l.x, l.y + 6, 's4la_ritual_laterne', 0).setOrigin(0.5, 1).setDepth(LIT + 2 + l.y / 1000), state: null }; // über der Nacht: sie sind das Licht
        if (hasArt(sc, 's4la_lichtkreis')) o.light = sc.add.sprite(l.x, l.y - 4, 's4la_lichtkreis', 0).setDepth(LIT + 1).setAlpha(0.5);
        if (o.light) o.light.play(ritualAnim(sc, 's4la_lichtkreis'));
      }
      const k = l.oil / WACHT.oilMax;
      const want = l.oil <= 0 ? 'erloschen' : k < 0.25 ? 'schwach' : k < 0.6 ? 'halb' : 'voll';
      if (o.state !== 'nachfuellen' && !(o.spr.anims.isPlaying && o.spr.anims.currentAnim?.key?.endsWith(':angegriffen')) && o.state !== want) { o.state = want; playRitual(o.spr, 's4la_ritual_laterne', want); }
      if (o.light) { o.light.setVisible(l.oil > 0).setScale((WACHT.light * 2 * (0.6 + 0.4 * k)) / 64); }
      g.fillStyle(0x000000, 0.7).fillRect(l.x - 7, l.y + 8, 14, 2);
      g.fillStyle(k > 0.3 ? 0xe8c070 : 0xe05050, 1).fillRect(l.x - 7, l.y + 8, 14 * k, 2);
    });
    // Wesen: dunkle Schemen; im Licht zischt es (monster_licht), wer fällt, zerfällt zu Asche
    const lit = w.lanterns.filter((l) => l.oil > 0);
    const p = sc.player;
    const alive = new Set();
    for (const m of w.monsters) {
      alive.add(m.id);
      g.fillStyle(0x0c0a14, 0.85).fillEllipse(m.x, m.y, 12, 9);
      g.fillStyle(0xb0f0ff, 1).fillRect(m.x - 3, m.y - 2, 1, 1).fillRect(m.x + 2, m.y - 2, 1, 1);
      const burning = lit.some((l) => Math.hypot(m.x - l.x, m.y - l.y) <= WACHT.light) || (w.aura && Math.hypot(m.x - p.x, m.y - p.y + 6) <= WACHT.auraRadius);
      let o = a.monsters.get(m.id);
      if (!o) { o = { x: m.x, y: m.y, burn: null }; a.monsters.set(m.id, o); }
      o.x = m.x; o.y = m.y;
      if (burning && !o.burn) o.burn = ritualFx(sc, 's4la_monster_licht', m.x, m.y - 6, { loop: true, depth: 5002 });
      if (!burning && o.burn) { o.burn.destroy(); o.burn = null; }
      o.burn?.setPosition(m.x, m.y - 6);
    }
    for (const [id, o] of a.monsters) {
      if (alive.has(id)) continue;
      o.burn?.destroy();
      ritualFx(sc, 's4la_monster_zerfall', o.x, o.y - 6, { depth: 5002 });
      a.monsters.delete(id);
    }
    // Wächter auf der Karte (Codex DN: s4r_waechter_welt), leuchtet, sobald der Sonnenaufgang greift
    if (w.guardian) {
      const gd = w.guardian;
      if (!a.guardian && hasArt(sc, 's4r_waechter_welt')) a.guardian = sc.add.sprite(gd.x, gd.y, 's4r_waechter_welt', 0).setOrigin(0.5, 62 / 64);
      if (a.guardian) {
        const dx = gd.x - (a.guardian.x ?? gd.x);
        const dy = gd.y - (a.guardian.y ?? gd.y);
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
        if (Math.abs(dx) + Math.abs(dy) > 0.01 && a.guardianDir !== dir) { a.guardianDir = dir; playRitual(a.guardian, 's4r_waechter_welt', dir); }
        a.guardian.setPosition(gd.x, gd.y).setDepth(LIT + 3 + gd.y / 1000);
        if (w.sunriseReady()) a.guardian.setTint(0xfff0c0); else a.guardian.clearTint();
      } else {
        g.fillStyle(0x10101c, 0.9).fillEllipse(gd.x, gd.y - 8, 18, 28);
      }
    }
    // Eigenleuchten des Spielers
    if (w.aura && !a.aura) a.aura = ritualFx(sc, 's4la_spielerlicht', p.x, p.y - 12, { loop: true, follow: p, dy: -12, depth: 99 + p.y });
    if (!w.aura && a.aura) { a.aura.destroy(); a.aura = null; }
    a.aura?.setDepth(p.depth - 1);
    // Nachfüllen: Halte-Ring über dem Kopf (8 Stufen), bei Unterbrechung kurz gesprungen
    if (w.refill) {
      a.hold ??= sc.add.image(p.x, p.y - 40, 's4la_halten', 0).setDepth(5003);
      a.hold.setVisible(true).setPosition(p.x, p.y - 40).setFrame(Math.min(7, Math.floor((w.refill.t / WACHT.refillSec) * 8)));
      a.holding = true;
    } else if (a.hold && a.holding) {
      a.holding = false;
      if (this.keys.R.isDown) { a.hold.setFrame(8); sc.time.delayedCall(300, () => a.hold?.setVisible(false)); } else a.hold.setVisible(false);
    }
    // Unruhe: Rußschlieren am Rand, je länger die Nacht dauert
    if (!a.unruhe && hasArt(sc, 's4la_unruhe')) a.unruhe = ritualFx(sc, 's4la_unruhe', 0, 0, { screen: true, loop: true, depth: 4990, alpha: 0 });
    a.unruhe?.setAlpha(Math.min(0.85, (w.t ?? 0) / 150));
    this.drawSiegeHud(a, w);
    const n = w.lanterns.filter((l) => l.oil > 0).length;
    this.siegeText?.setY(30).setText(`${this.state.seq4Name?.('laterne') ?? ''} · ${w.guardian ? 'WÄCHTER' : `Wesen ${w.kills}/${WACHT.monsters}`} · Laternen ${n}/${WACHT.lanterns}\nR halten: nachfüllen · F: Sonnenaufgang${w.guardian && w.sunriseReady() ? ' · JETZT!' : ''}`);
    return true;
  }

  /** Laternen-Leiste oben in der Mitte: Rahmen mit sechs Plätzen, je Laterne voll/halb/schwach/erloschen. */
  drawSiegeHud(a, w) {
    const sc = this.scene;
    if (!hasArt(sc, 's4la_hud_rahmen') || !hasArt(sc, 's4la_hud')) return;
    if (!a.hud) {
      const x = VIEW_W / 2 - 48;
      const frame = sc.add.image(x, 6, 's4la_hud_rahmen', 0).setOrigin(0).setScrollFactor(0).setDepth(5001);
      const slots = Array.from({ length: WACHT.lanterns }, (_, i) => {
        const r = artRegion('s4la_hud_rahmen', `slot_${i}`) ?? [4 + i * 15, 2, 12, 16];
        return sc.add.image(x + r[0] + r[2] / 2, 6 + r[1] + r[3] / 2, 's4la_hud', 0).setScrollFactor(0).setDepth(5002);
      });
      a.hud = [frame, ...slots];
    }
    w.lanterns.forEach((l, i) => {
      const k = l.oil / WACHT.oilMax;
      a.hud[i + 1]?.setFrame(l.oil <= 0 ? 3 : k < 0.25 ? 2 : k < 0.6 ? 1 : 0);
    });
  }

  /** Sonnenaufgang: das Lichtdreieck bricht über dem Wächter auf. */
  sunriseFx() {
    const gd = this.siegeArt?.guardian;
    const lit = this.siege?.lanterns.filter((l) => l.oil > 0) ?? [];
    const at = gd ? { x: gd.x, y: gd.y - 24 } : lit.length ? { x: lit.reduce((s, l) => s + l.x, 0) / lit.length, y: lit.reduce((s, l) => s + l.y, 0) / lit.length } : null;
    if (at) ritualFx(this.scene, 's4la_sonnenaufgang', at.x, at.y, { depth: 5004, scale: 1.25 });
  }

  /** Räumt die Laternennacht weg; bei Sieg verblassen die Laternen langsam. */
  clearSiegeArt(won) {
    const a = this.siegeArt;
    this.siegeArt = null;
    if (!a) return;
    const parts = [...a.lanterns.flatMap((l) => [l.spr, l.light]), a.guardian, a.aura, a.hold, a.unruhe, ...(a.hud ?? []), ...[...a.monsters.values()].map((m) => m.burn)].filter(Boolean);
    if (won) this.scene.tweens.add({ targets: parts, alpha: 0, delay: 1200, duration: 1500, onComplete: () => parts.forEach((o) => o.destroy()) });
    else parts.forEach((o) => o.destroy());
  }

  // --- Codex DO: Schattenband zwischen Körper und Schatten ----------------------------------------------
  drawBand() {
    const sc = this.scene;
    if (!this.band || !this.body || !hasArt(sc, 'schatten_band')) return;
    const p = sc.player;
    const from = { x: this.body.x, y: this.body.y - 2 };
    const to = { x: p.x, y: p.y - 2 };
    const d = Math.hypot(to.x - from.x, to.y - from.y);
    const n = Math.max(0, Math.min(24, Math.floor(d / 14)));
    this.bandParts ??= [];
    const frame = Math.floor(sc.time.now / 140) % 4;
    for (let i = 0; i < 25; i++) {
      let o = this.bandParts[i];
      if (i > n) { o?.setVisible(false); continue; }
      if (!o) o = this.bandParts[i] = sc.add.image(0, 0, i === n ? 'schatten_band_ende' : 'schatten_band', 0).setDepth(98 + from.y).setAlpha(0.8);
      const t = n ? i / n : 0;
      o.setVisible(true).setPosition(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t).setRotation(Math.atan2(to.y - from.y, to.x - from.x));
      if (o.texture.key === 'schatten_band') o.setFrame((frame + i) % 4);
    }
  }

  // --- Auftritte vor Kämpfen (Codex DN: einschlafen, Wächter erscheint; DQ: Laternenkreis) ------------------
  /** Spielt den Auftritt vor einem vorgemerkten Kampf. true = läuft noch (Kampf wartet), false = jetzt starten. */
  combatIntro(id) {
    if (this.intro?.id === id) return !this.intro.done;
    const sc = this.scene;
    const p = sc.player;
    const done = () => { if (this.intro?.id === id) this.intro.done = true; };
    this.intro = { id, done: false };
    if (id === TRAUM_ID && hasArt(sc, 's4fa_einschlafen')) {
      // Das Zimmer kippt, Fäden ziehen die Ränder zu (Vollbild, 6 Frames), dann der Traum
      const fx = ritualFx(sc, 's4fa_einschlafen', 0, 0, { screen: true, depth: 6000, loop: true, fps: 4 });
      if (!fx) { done(); return false; }
      fx.once(`animationcomplete-${ritualAnim(sc, 's4fa_einschlafen')}`, () => sc.time.delayedCall(300, () => { done(); sc.time.delayedCall(400, () => fx.destroy()); }));
      return true;
    }
    if (id === 'laternenbestie' && hasArt(sc, 's5_laternen_kreis')) {
      // Seq 5 (Laterne): die zehn Lichter ziehen sich zusammen, in der Mitte richtet sich die Bestie auf
      ritualFx(sc, 's5_laternen_kreis', p.x, p.y - 30, { depth: 5004, scale: 1.25 })?.once('destroy', done);
      return true;
    }
    if (/^hg_schwellenwaechter_/.test(id) && hasArt(sc, 's4r_waechter_erscheint')) {
      // Kalkstaub sammelt sich zu einer Schwelle, der Wächter tritt heraus, wo man steht
      const x = p.x + (sc.facing === 'left' ? -36 : 36);
      const y = p.y;
      const fx = ritualFx(sc, 's4r_waechter_erscheint', x, y - 40, { depth: 5004 });
      if (!fx) { done(); return false; }
      fx.once('destroy', () => {
        const gd = hasArt(sc, 's4r_waechter_welt') ? sc.add.sprite(x, y + 6, 's4r_waechter_welt', 0).setOrigin(0.5, 62 / 64).setDepth(100 + y) : null;
        if (gd) playRitual(gd, 's4r_waechter_welt', x > p.x ? 'left' : 'right');
        sc.time.delayedCall(700, () => { gd?.destroy(); done(); });
      });
      return true;
    }
    done();
    return false;
  }

  // --- Zustände auf der Karte: Taubheit, Last, Zivilist, Essenzen, Kokon, Fehlschläge, Fortschritt ----------
  updateArt(blocked) {
    const sc = this.scene;
    const s = this.state;
    const p = sc.player;
    if (!p) return;
    // Echo: Schallwellen erstarren, danach bleibt der entsättigte Rand
    if (this.deaf && !this.deafArt) {
      this.deafArt = ritualFx(sc, 's4ec_taub_rand', 0, 0, { screen: true, loop: true, depth: 4980, alpha: 0 });
      if (this.deafArt) sc.tweens.add({ targets: this.deafArt, alpha: 1, delay: 900, duration: 600 });
      ritualFx(sc, 's4ec_taubheit_an', 0, 0, { screen: true, depth: 4981, fps: 5 });
    } else if (!this.deaf && this.deafArt) { this.deafArt.destroy(); this.deafArt = null; }
    // Eisen: unter doppelter Last reißt der Boden um die Füße
    const heavy = s.seq4Kind?.() === 'eisen' && (s.eisenConditions?.().load ?? 0) >= 2;
    if (heavy && !this.loadArt) this.loadArt = ritualFx(sc, 's4ei_ueberlast_welt', p.x, p.y - 8, { loop: true, follow: p, dy: -8, depth: 99 });
    if (!heavy && this.loadArt) { this.loadArt.destroy(); this.loadArt = null; }
    this.loadArt?.setDepth(p.depth - 0.5);
    // Maske: das Gesicht wird gewöhnlich (einmal beim Anlegen)
    const masked = !!s.seq4Masked?.();
    if (masked && !this.seen.masked) ritualFx(sc, 's4ma_verwandeln', p.x, p.y - 40, { depth: 5002 });
    this.seen.masked = masked;
    // Kessel: jede getrunkene Essenz ein eigener Farbhauch über dem Kopf
    const drunk = s.seq4Kind?.() === 'kessel' ? (s.seq4().drunk ?? []).length : 0;
    if (drunk > this.seen.drunk && drunk > 0) {
      const fx = ritualFx(sc, 's4ke_trinken_reihe', p.x, p.y - 44, { anim: ESSENZ_FARBEN[(drunk - 1) % 5], depth: 5002, follow: p, dy: -44, loop: true });
      if (fx) sc.tweens.add({ targets: fx, alpha: 0, delay: 1400, duration: 500, onComplete: () => fx.destroy() });
    }
    this.seen.drunk = drunk;
    // Seq 5 (Faden): Kokon über der Figur, solange man eingewickelt ist; reißt er, platzt er sichtbar auf
    const kokon = !!s.cocoonActive?.();
    const kokonKey = `s5_kokon_${lookOf(s, 1)}`;
    if (kokon && !this.kokon && hasArt(sc, kokonKey)) this.kokon = sc.add.sprite(p.x, p.y, kokonKey, 0).setOrigin(0.5, 1);
    if (this.kokon) {
      if (!kokon) {
        ritualFx(sc, 's5_kokon_platzt', p.x, p.y - 20, { depth: 5002 });
        this.kokon.destroy();
        this.kokon = null;
      } else {
        this.kokon.setPosition(p.x, p.y).setDepth(p.depth + 0.5).setFrame(Number(p.frame.name) % 16 || 0);
      }
    }
    // Fehlschläge aus dem Kern: das Siegel springt über der Figur
    while (this.fxQueue.length) {
      const e = this.fxQueue.shift();
      ritualFx(sc, e.fx, p.x, p.y - 40, { depth: 5003 });
    }
    this.updateHud(blocked);
  }

  /** Kleine Ritualleiste oben links: Fäden (Faden), Essenzen (Kessel), taub (Echo), Last (Eisen), Schatten (Schlüssel). */
  updateHud(blocked) {
    const sc = this.scene;
    const s = this.state;
    const kind = s.seq4Kind?.();
    const st = kind ? s.seq4() : {};
    let spec = null;
    if (kind === 'faden' && !st.dreamWon) spec = { frame: 's4fa_hud_rahmen', icons: 's4fa_hud', n: HG_FAEDEN, on: (st.marks ?? []).length, off: 'offen', onName: 'markiert' };
    else if (kind === 'kessel' && (st.drunk ?? []).length) spec = { frame: 's4ke_hud_rahmen', icons: 's4ke_hud', n: 5, on: st.drunk.length, off: 'leer', onName: 'getrunken' };
    else if (kind === 'echo' && st.active) spec = { single: ['s4ec_taub_hud', 0] };
    else if (kind === 'schluessel' && st.shadow) spec = { single: ['schatten_hud', 3] }; // body_waiting
    const sig = spec && !this.siege ? JSON.stringify(spec) : '';
    if (sig === this.hudSig) return;
    this.hudSig = sig;
    this.hud?.forEach((o) => o.destroy());
    this.hud = null;
    if (!sig) return;
    const parts = [];
    const x = 6;
    const y = 30;
    if (spec.single) {
      const [key, frame] = spec.single;
      if (hasArt(sc, key)) {
        const e = key === 's4ec_taub_hud' ? sc.add.image(x, y, key).setCrop(0, 0, 16, 16) : sc.add.image(x, y, key, frame);
        parts.push(e.setOrigin(0).setScrollFactor(0).setDepth(4999));
      }
    } else if (hasArt(sc, spec.frame) && hasArt(sc, spec.icons)) {
      parts.push(sc.add.image(x, y, spec.frame, 0).setOrigin(0).setScrollFactor(0).setDepth(4999));
      for (let i = 0; i < spec.n; i++) {
        const r = artRegion(spec.frame, `slot_${i}`) ?? [4 + i * 18, 2, 16, 16];
        const f = artFrame(spec.icons, i < spec.on ? `${spec.onName}_${i + 5}` : `${spec.off}_${i}`) ?? (i < spec.on ? 5 + i : i);
        parts.push(sc.add.image(x + r[0] + r[2] / 2, y + r[1] + r[3] / 2, spec.icons, f).setScrollFactor(0).setDepth(5000));
      }
    }
    this.hud = parts;
  }
}

