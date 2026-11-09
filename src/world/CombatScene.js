import Phaser from 'phaser';
import { Combat, WINDOW, EARLY_LIMIT, judgeDefense, judgeTiming } from '../core/Combat.js';
import { createTextures, createCharacterSheet } from './textures.js';
import { BATTLE_BACKGROUNDS, ENEMY_BATTLE_SHEETS, playBattleAnim } from './assets.js';
import { VIEW_W, VIEW_H, PLAYER_PALETTE } from './WorldScene.js';

// Kampfbildschirm in Seitenansicht: Spieler links, Gegner rechts, Bodenstreifen unten.
// Die Regeln stecken in core/Combat.js, hier nur Timing, Eingabe und Animation.

const GROUND_Y = 200;
const PLAYER_X = 140;
const ENEMY_X = 345;
const RING_LEAD = 750; // so lange vor dem Einschlag erscheint der Ring
const TELEGRAPH = 650; // Ankündigung vor der ersten Attacke
const BAR = { x: 140, y: 96, w: 200, h: 8 };

const now = () => performance.now();

export class CombatScene extends Phaser.Scene {
  constructor() {
    super('combat');
  }

  init(data) {
    this.encounterId = data.id;
    this.onDone = data.onDone;
  }

  create() {
    this.state = this.registry.get('state');
    this.ui = this.registry.get('ui');
    this.combat = new Combat(this.state, this.encounterId);
    this.phase = 'intro';
    this.leaving = false; // Szenen-Objekt wird wiederverwendet: Zustand jedes Mal zurücksetzen
    this.attack = null;
    this.hits = [];
    this.qte = null;
    createTextures(this);
    this.buildStage();
    this.gfx = this.add.graphics().setDepth(50);
    this.ui.openCombat(this);
    this.ui.combatMessage(this.combat.enc.intro + (this.combat.weak ? `\n\n${this.combat.enc.weak_text}` : ''), 'Weiter mit E');
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  // --- Bühne -------------------------------------------------------------------

  buildStage() {
    const map = this.state.content.maps[this.state.map];
    const bg = BATTLE_BACKGROUNDS[map.id];
    if (bg && this.textures.exists(bg)) {
      this.add.image(0, 0, bg).setOrigin(0);
    } else {
      const ground = { revier: 0x3a2e24, crypt: 0x2e2e36, ebba: 0x26301e }[map.id] ?? 0x343744;
      this.add.rectangle(0, 0, VIEW_W, VIEW_H, 0x080a12).setOrigin(0);
      // Ferne Silhouetten
      for (let i = 0; i < 12; i++) {
        const w = 30 + ((i * 37) % 40);
        const h = 40 + ((i * 53) % 70);
        this.add.rectangle(i * 44 - 10, GROUND_Y - h, w, h, 0x111522).setOrigin(0);
      }
      this.add.rectangle(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y, ground).setOrigin(0);
      this.add.rectangle(0, GROUND_Y, VIEW_W, 2, 0x000000, 0.5).setOrigin(0);
    }
    const glow = this.add.image(VIEW_W / 2, GROUND_Y - 20, 'glow').setScale(7, 3).setAlpha(0.18).setTint(0xffb860);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    this.fog = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog_a').setOrigin(0).setAlpha(0.2).setDepth(40);

    if (this.textures.exists('battle_player')) {
      // Kampf-Sheet (48x48, Blick nach rechts); Füße liegen am unteren Zellrand.
      this.player = this.add.sprite(PLAYER_X, GROUND_Y + 14, 'battle_player', 0).setOrigin(0.5, 1).setScale(1.5).setDepth(10);
      this.idle(this.player);
    } else {
      createCharacterSheet(this, 'player', PLAYER_PALETTE);
      this.player = this.add.sprite(PLAYER_X, GROUND_Y + 14, 'player', 8).setOrigin(0.5, 1).setScale(2).setDepth(10);
    }
    this.add.ellipse(PLAYER_X, GROUND_Y + 14, 34, 8, 0x000000, 0.35).setDepth(9);

    const spr = this.combat.enc.sprite;
    const battleSheet = ENEMY_BATTLE_SHEETS[spr];
    if (battleSheet && this.textures.exists(battleSheet)) {
      this.enemy = this.add.sprite(ENEMY_X, GROUND_Y + 14, battleSheet, 0).setOrigin(0.5, 1).setScale(1.5);
      this.idle(this.enemy);
    } else if (spr.startsWith('npc:')) {
      const id = spr.slice(4);
      createCharacterSheet(this, `npc_${id}`, this.state.content.npcs[id].palette);
      this.enemy = this.add.sprite(ENEMY_X, GROUND_Y + 14, `npc_${id}`, 4).setOrigin(0.5, 1).setScale(2);
    } else {
      this.enemy = this.add.image(ENEMY_X, GROUND_Y + 18, spr).setOrigin(0.5, 1).setScale(1.35);
      this.tweens.add({ targets: this.enemy, y: GROUND_Y + 15, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    this.enemy.setDepth(10);
    this.add.ellipse(ENEMY_X, GROUND_Y + 14, 50, 10, 0x000000, 0.35).setDepth(9);
    if (this.combat.enemy.occult) {
      const aura = this.add.image(ENEMY_X, GROUND_Y - 30, 'glow').setScale(2.5).setTint(0x6fe0d0).setAlpha(0.25).setDepth(8);
      aura.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: aura, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });
    }
  }

  /** Kampfanimation abspielen, danach zurück in die Idle-Schleife. Ohne Kampf-Sheet: nichts. */
  anim(sprite, name, back = true) {
    playBattleAnim(sprite, name, back ? () => this.idle(sprite) : null);
  }

  idle(sprite) {
    if (this.phase !== 'over' || !this.combat.outcome) playBattleAnim(sprite, 'idle');
  }

  playerCenter() {
    return { x: PLAYER_X, y: GROUND_Y - 30 };
  }

  enemyCenter() {
    return { x: ENEMY_X, y: GROUND_Y - 30 };
  }

  float(text, who, cls = '') {
    const p = who === 'enemy' ? this.enemyCenter() : this.playerCenter();
    this.ui.combatFloat(text, (p.x / VIEW_W) * 100, ((p.y - 30) / VIEW_H) * 100, cls);
  }

  flash(target) {
    if (this.phase !== 'over') this.anim(target, 'hurt');
    target.setTintFill(0xffffff);
    this.time.delayedCall(80, () => target.clearTint());
  }

  // --- Ablauf ------------------------------------------------------------------

  /** Tastendruck aus der Oberfläche: 'confirm' | 'dodge' | 'parry' */
  onKey(kind) {
    const t = now();
    if (this.phase === 'intro' && kind !== 'parry') { this.toMenu(); return true; }
    if (this.phase === 'qte' && (kind === 'confirm' || kind === 'dodge')) { this.pressQte(t); return true; }
    if (this.phase === 'enemy' && (kind === 'dodge' || kind === 'parry')) { this.pressDefense(kind, t); return true; }
    if (this.phase === 'over' && kind !== 'parry') { this.leave(); return true; }
    return false;
  }

  toMenu() {
    this.phase = 'menu';
    this.ui.combatMenu();
  }

  /** Aus dem Menü: { type: 'skill', id } | { type: 'item', id } | { type: 'flee' } */
  choose(action) {
    if (this.phase !== 'menu') return;
    const c = this.combat;
    if (action.type === 'skill') {
      if (!c.canUse(action.id)) return;
      this.startQte(action.id);
    } else if (action.type === 'item') {
      const r = c.useItem(action.id);
      if (!r) return;
      this.ui.combatMessage(r.text);
      if (!playBattleAnim(this.player, 'item', () => this.idle(this.player))) this.flash(this.player);
      if (c.state.item(action.id).damage) { this.flash(this.enemy); this.float(`-${c.state.item(action.id).damage * (c.enemy.occult ? 2 : 1)}`, 'enemy', 'dmg'); }
      this.afterPlayer();
    } else if (action.type === 'flee') {
      if (!c.flee()) { this.ui.combatMessage('Kein Entkommen. Der Weg nach oben ist versperrt.'); return; }
      this.over();
    }
  }

  // Angriff im Takt: ein Zeiger läuft über die Leiste, im goldenen Bereich drücken.
  startQte(skillId) {
    const sk = this.combat.skillDef(skillId);
    if (!sk.hits) { this.qte = { skillId, grades: [] }; this.phase = 'anim'; this.resolveSkill(); return; }
    this.phase = 'qte';
    this.qte = { skillId, grades: [], total: sk.hits, bar: null };
    this.ui.combatMessage(`${sk.name}: Drücke E oder Leertaste, wenn der Zeiger im goldenen Bereich ist.`);
    this.nextBar();
  }

  nextBar() {
    const i = this.qte.grades.length;
    const center = 0.55 + Math.random() * 0.3;
    this.qte.bar = { start: now() + 250, dur: i === 0 ? 950 : 750, zone: { center, perfect: 0.045, good: 0.13 }, done: false };
  }

  qtePos(t) {
    const b = this.qte.bar;
    return Math.max(0, Math.min(1, (t - b.start) / b.dur));
  }

  pressQte(t) {
    const b = this.qte?.bar;
    if (!b || b.done || t < b.start) return;
    this.gradeBar(judgeTiming(this.qtePos(t), b.zone));
  }

  gradeBar(grade) {
    const b = this.qte.bar;
    b.done = true;
    b.grade = grade;
    this.qte.grades.push(grade);
    this.float({ perfect: 'Präzise!', good: 'Treffer', miss: 'Daneben' }[grade], 'player', grade);
    this.time.delayedCall(320, () => {
      if (this.qte.grades.length < this.qte.total) this.nextBar();
      else this.resolveSkill();
    });
  }

  resolveSkill() {
    const { skillId, grades } = this.qte;
    this.qte = null;
    this.phase = 'anim';
    const c = this.combat;
    const sk = c.skillDef(skillId);
    const r = c.useSkill(skillId, grades);
    if (!sk.hits) {
      if (!playBattleAnim(this.player, 'occult', () => this.idle(this.player))) this.flash(this.player);
      this.float(sk.name, 'player', 'good');
      if (r.stunned) this.flash(this.enemy);
      this.ui.combatMessage(`${sk.name}: ${r.effects.join(', ') || 'wirkt'}.${r.stunned ? ` ${c.enemy.name} setzt eine Runde aus.` : ''}`);
      this.ui.combatRefresh();
      this.time.delayedCall(700, () => this.afterPlayer());
      return;
    }
    this.anim(this.player, 'attack');
    this.tweens.add({
      targets: this.player, x: ENEMY_X - 50, duration: 160, yoyo: true, ease: 'Quad.out',
      onYoyo: () => {
        r.hits.forEach((h, i) => this.time.delayedCall(i * 140, () => { this.flash(this.enemy); this.float(`-${h.damage}`, 'enemy', h.grade === 'perfect' ? 'crit' : 'dmg'); }));
        this.cameras.main.shake(90, 0.006);
      },
    });
    let msg = `${sk.name}: ${r.total} Schaden.`;
    if (r.effects.length) msg += ` ${r.effects.join(', ')}.`;
    if (r.stunned) msg += ` ${c.enemy.name} ${skillId === 'blind' ? 'ist geblendet und ' : ''}setzt aus.`;
    if (skillId === 'blind' && !r.stunned) msg += ' Die Blende verfehlt ihr Ziel.';
    this.ui.combatMessage(msg);
    this.ui.combatRefresh();
    this.time.delayedCall(700, () => this.afterPlayer());
  }

  afterPlayer() {
    this.ui.combatRefresh();
    if (this.combat.outcome) { this.time.delayedCall(300, () => this.over()); return; }
    this.time.delayedCall(350, () => this.enemyTurn());
  }

  // Gegnerzug: Ankündigung, dann ein Ring pro Schlag. Leertaste weicht aus, F pariert.
  enemyTurn() {
    const c = this.combat;
    const atk = c.nextEnemyAttack();
    if (!atk) {
      if (c.selfHit) {
        this.ui.combatMessage(`${c.enemy.name} schlägt verwirrt nach einem Trugbild und trifft sich selbst: ${c.selfHit} Schaden.`);
        this.flash(this.enemy);
        this.float(`-${c.selfHit}`, 'enemy', 'dmg');
        c.selfHit = 0;
        this.ui.combatRefresh();
        this.time.delayedCall(900, () => (c.outcome ? this.over() : this.endRound()));
        return;
      }
      this.ui.combatMessage(`${c.enemy.name} taumelt und greift nicht an.`);
      this.time.delayedCall(900, () => this.endRound());
      return;
    }
    this.phase = 'enemy';
    this.attack = atk;
    const t0 = now() + TELEGRAPH;
    this.hits = atk.hits.map((h) => ({ impact: t0 + h, result: null, applied: false }));
    this.ui.combatMessage(`${c.enemy.name}: ${atk.name}${atk.hits.length > 1 ? ` (${atk.hits.length} Schläge)` : ''}${c.evading ? '\n\nDu weißt schon, wohin er schlägt.' : ''}`, 'Leertaste: ausweichen · F: parieren');
    this.tweens.add({ targets: this.enemy, x: ENEMY_X + 8, duration: TELEGRAPH * 0.6, ease: 'Sine.out' });
    this.anim(this.enemy, 'attack');
  }

  pressDefense(kind, t) {
    const hit = this.hits.find((h) => !h.result && t >= h.impact - EARLY_LIMIT);
    if (!hit) return;
    hit.result = judgeDefense(kind, t - hit.impact, this.state.passive('dodge_window'));
    if (hit.result === 'miss') hit.early = t < hit.impact;
    else this.applyHit(hit);
  }

  applyHit(hit) {
    if (hit.applied) return;
    hit.applied = true;
    const r = this.combat.resolveHit(this.attack, hit.result);
    hit.result = r.result;
    this.tweens.add({ targets: this.enemy, x: PLAYER_X + 70, duration: 90, yoyo: true, ease: 'Quad.in' });
    if (hit.result === 'parry') {
      this.float('Parade!', 'player', 'perfect');
      this.anim(this.player, 'parry');
      this.time.delayedCall(90, () => { this.flash(this.enemy); this.float(`-${r.counter}`, 'enemy', 'dmg'); });
      this.cameras.main.flash(60, 255, 240, 200);
    } else if (hit.result === 'dodge') {
      this.float('Ausgewichen', 'player', 'good');
      this.anim(this.player, 'dodge');
      this.tweens.add({ targets: this.player, x: PLAYER_X - 26, duration: 110, yoyo: true, ease: 'Quad.out' });
    } else {
      this.time.delayedCall(90, () => { this.flash(this.player); this.float(r.damage ? `-${r.damage}` : 'Abgefangen', 'player', r.damage ? 'hurt' : 'good'); if (r.damage) this.cameras.main.shake(120, 0.01); });
      if (hit.early) this.float('Zu früh', 'player', 'miss');
    }
    this.ui.combatRefresh();
  }

  finishEnemyTurn() {
    const c = this.combat;
    this.phase = 'anim';
    const allParried = this.hits.every((h) => h.result === 'parry');
    c.endEnemyTurn();
    this.tweens.add({ targets: this.enemy, x: ENEMY_X, duration: 200 });
    if (allParried && !c.outcome) {
      const dmg = c.riposte();
      this.ui.combatMessage(`Alles pariert! Gegenschlag: ${dmg} Schaden.`);
      this.anim(this.player, 'attack');
      this.tweens.add({
        targets: this.player, x: ENEMY_X - 50, duration: 140, yoyo: true,
        onYoyo: () => { this.flash(this.enemy); this.float(`-${dmg}`, 'enemy', 'crit'); this.cameras.main.shake(120, 0.008); },
      });
      this.ui.combatRefresh();
      this.time.delayedCall(800, () => this.endRound());
      return;
    }
    this.time.delayedCall(400, () => this.endRound());
  }

  endRound() {
    this.ui.combatRefresh();
    if (this.combat.outcome) { this.over(); return; }
    const dot = this.combat.endRound();
    if (dot) {
      this.flash(this.enemy);
      this.float(`-${dot}`, 'enemy', 'dmg');
      this.ui.combatRefresh();
      this.ui.combatMessage(`${this.combat.enemy.name} leidet unter Brand und Gift: ${dot} Schaden.`);
      this.time.delayedCall(700, () => (this.combat.outcome ? this.over() : this.toMenu()));
      return;
    }
    this.toMenu();
  }

  over() {
    this.phase = 'over';
    const c = this.combat;
    if (c.outcome === 'won') {
      // Menschen (z. B. Holt beim Training) geben auf und bleiben stehen, Wesen vergehen.
      const human = this.combat.enc.sprite.startsWith('npc:');
      if (playBattleAnim(this.enemy, 'defeated')) { if (!human) this.tweens.add({ targets: this.enemy, alpha: 0, delay: 900, duration: 700 }); }
      else this.tweens.add({ targets: this.enemy, alpha: 0, y: '+=10', duration: 700 });
    }
    if (c.outcome === 'lost' && !playBattleAnim(this.player, 'defeated')) this.tweens.add({ targets: this.player, angle: -90, y: '+=4', duration: 500 });
    const title = { won: 'Sieg', lost: 'Ohnmacht', fled: 'Rückzug' }[c.outcome];
    this.ui.combatOver(title);
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    const result = this.combat.finish();
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.ui.closeCombat(result, this.combat.enc);
      this.onDone?.(result);
      this.scene.stop();
    });
  }

  // --- Zeichnen & Timing ---------------------------------------------------------

  update() {
    const t = now();
    const g = this.gfx;
    g.clear();
    this.fog.tilePositionX += 0.15;

    if (this.phase === 'qte' && this.qte?.bar) {
      const b = this.qte.bar;
      const { x, y, w, h } = BAR;
      const z = b.zone;
      g.fillStyle(0x000000, 0.6).fillRect(x - 2, y - 2, w + 4, h + 4);
      g.fillStyle(0x3a3d48, 1).fillRect(x, y, w, h);
      g.fillStyle(0x8a6a2a, 1).fillRect(x + (z.center - z.good) * w, y, z.good * 2 * w, h);
      g.fillStyle(0xffd890, 1).fillRect(x + (z.center - z.perfect) * w, y, z.perfect * 2 * w, h);
      const pos = b.done ? null : this.qtePos(t);
      if (pos !== null && t >= b.start) {
        g.fillStyle(0xffffff, 1).fillRect(x + pos * w - 1, y - 4, 2, h + 8);
        if (pos >= 1) this.gradeBar('miss');
      }
    }

    if (this.phase === 'enemy') {
      const c = this.playerCenter();
      g.lineStyle(1, 0xffffff, 0.35).strokeCircle(c.x, c.y, 16);
      for (const hit of this.hits) {
        if (hit.applied) continue;
        const left = hit.impact - t;
        if (hit.result === 'miss' && left <= 0) { this.applyHit(hit); continue; }
        if (!hit.result && left < -WINDOW.dodge) { hit.result = 'miss'; this.applyHit(hit); continue; }
        if (left > RING_LEAD || hit.result) continue;
        const r = 16 + Math.max(0, left / RING_LEAD) * 60;
        const near = Math.abs(left) <= WINDOW.parry;
        g.lineStyle(2, near ? 0xffd890 : 0xe05050, 0.95).strokeCircle(c.x, c.y, r);
      }
      if (this.hits.every((h) => h.applied)) this.finishEnemyTurn();
    }
  }
}
