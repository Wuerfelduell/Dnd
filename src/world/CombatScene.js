import Phaser from 'phaser';
import { Combat, WINDOW, EARLY_LIMIT, DODGE_COST, RING_CURVES, judgeDefense, judgeTiming } from '../core/Combat.js';
import { createTextures, createCharacterSheet } from './textures.js';
import {
  BATTLE_BACKGROUNDS, ENCOUNTER_BACKGROUNDS, ENEMY_BATTLE_SHEETS, ENCOUNTER_SHEETS, FADING_SHEETS,
  SKILL_FX, SELF_FX, PATHWAY_POSES, WEAPON_POSES, ENCOUNTER_FX, BOSS_INTROS, BOSS_FORMS, CASE_SHEETS, playBattleAnim, playCaseAnim,
} from './assets.js';
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
    this.deferLoot = !!data.deferLoot; // Gegner auf der Karte: Beute fällt als Behälter auf den Boden
    this.transformed = false;
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
    // transition_out deckt auf (Schwarz → Bild), transition_in deckt zu
    this.playTransition('transition_out', () => this.bossIntro()) || (this.cameras.main.fadeIn(250, 0, 0, 0), this.bossIntro());
  }

  /** Paket F: Boss-Band schiebt sich ins Bild, Büste und Name, dann wieder weg. */
  bossIntro() {
    const bust = BOSS_INTROS[this.encounterId];
    if (!bust || !this.textures.exists('F_08_boss_band')) return;
    const band = this.add.sprite(0, 0, 'F_08_boss_band', 0).setOrigin(0).setDepth(90);
    const key = 'F_08_boss_band-enter';
    if (!this.anims.exists(key)) {
      const def = this.cache.json.get('manifestKampf2')?.assets?.find((a) => a.id === 'F_08_boss_band')?.animations?.enter;
      this.anims.create({ key, frames: (def?.frames ?? [0, 1, 2, 3, 4, 5]).map((frame) => ({ key: 'F_08_boss_band', frame })), frameRate: def?.frameRate ?? 12, repeat: 0 });
    }
    band.play(key);
    const parts = [band];
    const bustKey = `F_08_boss_${bust}`;
    if (this.textures.exists(bustKey)) {
      const img = this.add.image(VIEW_W + 80, 135, bustKey).setDepth(91).setScale(0.75);
      this.tweens.add({ targets: img, x: VIEW_W - 90, duration: 380, delay: 200, ease: 'Cubic.out' });
      parts.push(img);
    }
    const name = this.add.text(-200, 135, this.combat.enc.name.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#e8c070', stroke: '#1a1c2c', strokeThickness: 4,
    }).setOrigin(0, 0.5).setDepth(92);
    this.tweens.add({ targets: name, x: 40, duration: 380, delay: 250, ease: 'Cubic.out' });
    parts.push(name);
    this.tweens.add({ targets: parts, alpha: 0, delay: 1900, duration: 400, onComplete: () => parts.forEach((o) => o.destroy()) });
  }

  /** Vollbild-Übergang (Paket B). Liefert false, wenn das Sheet fehlt. */
  playTransition(sheet, then) {
    if (!this.textures.exists(sheet)) return false;
    const t = this.add.sprite(0, 0, sheet, 0).setOrigin(0).setDepth(100);
    const ok = playBattleAnim(t, 'play', () => {
      if (sheet === 'transition_out') t.destroy();
      then();
    });
    if (!ok) t.destroy();
    return ok;
  }

  /** Fußpunkt laut Manifest (Kampf-Sheets aus Paket B haben unten 3 px Luft). */
  sheetOriginY(sheet) {
    const a = this.cache.json.get('manifestKampf')?.assets?.find((x) => x.id === sheet);
    if (a?.origin) return a.origin[1];
    // Paket F: Fußlinie als Pixelzeile
    const b = ['manifestKampf2', 'manifestReise'].map((m) => this.cache.json.get(m)?.assets?.find((x) => x.id === sheet)).find(Boolean);
    return b?.baseline ? (b.baseline + 1) / b.frameHeight : 1;
  }

  /** Effekt-Streifen an einer Position abspielen und danach entfernen. */
  playFx(sheet, anim, x, y, scale = 1.5) {
    if (!this.textures.exists(sheet)) return false;
    const fx = this.add.sprite(x, y, sheet, 0).setScale(scale).setDepth(30);
    if (!playBattleAnim(fx, anim, () => fx.destroy())) { fx.destroy(); return false; }
    return true;
  }

  /** Fall-Effekt (Paket E) an Spieler oder Gegner, z. B. der Stimmenraub. */
  caseFx(sheet, who, scale = 1.5) {
    if (!sheet) return;
    const p = who === 'enemy' ? this.enemyCenter() : this.playerCenter();
    if (!CASE_SHEETS[sheet]) { this.playFx(sheet, 'play', p.x, p.y, scale); return; } // Paket-F-Effekt
    const fx = this.add.sprite(p.x, p.y, sheet, 0).setScale(scale).setDepth(30);
    if (!playCaseAnim(fx, sheet, () => fx.destroy())) fx.destroy();
  }

  /** Treffer-Effekt am Ziel: blunt, slash, parry, dodge, critical, heal, nerves, item, miss. */
  hitFx(kind, who) {
    const p = who === 'enemy' ? this.enemyCenter() : this.playerCenter();
    this.playFx('hits', kind, p.x, p.y, 1);
  }

  /** Effekt einer Pfad-Fähigkeit, am Spieler oder am Gegner. */
  skillFx(skillId) {
    if (!SKILL_FX[skillId]) return;
    const p = SELF_FX.includes(skillId) ? this.playerCenter() : this.enemyCenter();
    this.playFx(`fx_${skillId}`, 'cast', p.x, p.y);
  }

  /** Schlaganimation passend zur Waffe. */
  attackAnim() {
    const pose = WEAPON_POSES[this.state.weapon];
    if (pose && playBattleAnim(this.player, pose, () => this.idle(this.player), 'battle_player_weapons')) return;
    this.anim(this.player, 'attack');
  }

  /** Zauberpose des eigenen Pfades; ohne Pfad (oder ohne Sheet) die 14b-Okkult-Pose. */
  castAnim() {
    const pose = PATHWAY_POSES[this.state.pathway?.id];
    if (pose && playBattleAnim(this.player, pose, () => this.idle(this.player), 'battle_player_skills')) return true;
    return this.anim(this.player, 'occult');
  }

  // --- Bühne -------------------------------------------------------------------

  buildStage() {
    const map = this.state.content.maps[this.state.map];
    const bg = [ENCOUNTER_BACKGROUNDS[this.encounterId], BATTLE_BACKGROUNDS[map.id]].find((k) => k && this.textures.exists(k));
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
    const battleSheet = [this.combat.enc.sheet, ENCOUNTER_SHEETS[this.encounterId], ENEMY_BATTLE_SHEETS[spr]].find((k) => k && this.textures.exists(k));
    this.enemySheet = battleSheet ?? null;
    if (battleSheet) {
      this.enemy = this.add.sprite(ENEMY_X, GROUND_Y + 14, battleSheet, 0).setOrigin(0.5, this.sheetOriginY(battleSheet)).setScale(1.5);
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
    // Gefahrengebiete: Platzhalter-Sheets werden getönt, Elite und Boss sind größer
    const enc = this.combat.enc;
    this.enemyTint = enc.elite ? 0xff9080 : enc.tint ? Number.parseInt(enc.tint.slice(1), 16) : null;
    if (this.enemyTint !== null) this.enemy.setTint(this.enemyTint);
    if (enc.elite || enc.boss) this.enemy.setScale(this.enemy.scaleX * (enc.boss ? 1.35 : 1.18));
    this.add.ellipse(ENEMY_X, GROUND_Y + 14, 50, 10, 0x000000, 0.35).setDepth(9);
    if (this.combat.enemy.occult) {
      const aura = this.add.image(ENEMY_X, GROUND_Y - 30, 'glow').setScale(2.5).setTint(0x6fe0d0).setAlpha(0.25).setDepth(8);
      aura.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: aura, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });
    }
  }

  /** Kampfanimation abspielen, danach zurück in die Idle-Schleife. Ohne Kampf-Sheet: nichts. */
  anim(sprite, name, back = true) {
    return playBattleAnim(sprite, name, back ? () => this.idle(sprite) : null, this.baseSheet(sprite));
  }

  idle(sprite) {
    if (this.phase !== 'over' || !this.combat.outcome) playBattleAnim(sprite, 'idle', null, this.baseSheet(sprite));
  }

  /** Grund-Sheet einer Figur (Zusatz-Sheets wie Waffen oder Zauber kehren hierher zurück). */
  baseSheet(sprite) {
    if (sprite === this.player) return 'battle_player';
    return this.enemySheet ?? sprite.texture.key;
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
    this.time.delayedCall(80, () => (target === this.enemy && this.enemyTint !== null ? target.setTint(this.enemyTint) : target.clearTint()));
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
      this.ui.combatRefresh();
      if (!this.anim(this.player, 'item')) this.flash(this.player);
      const used = c.state.item(action.id);
      this.hitFx(used.damage ? 'item' : used.composure ? 'nerves' : 'heal', used.damage ? 'enemy' : 'player');
      if (c.state.item(action.id).damage) { this.flash(this.enemy); this.float(`-${c.state.item(action.id).damage * (c.enemy.occult ? 2 : 1)}`, 'enemy', 'dmg'); }
      this.phase = 'anim';
      this.time.delayedCall(600, () => this.afterAction(false));
    } else if (action.type === 'end') {
      this.phase = 'anim';
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
      if (!this.castAnim()) this.flash(this.player);
      this.skillFx(skillId);
      if (sk.heal) this.hitFx('heal', 'player');
      this.float(sk.name, 'player', 'good');
      if (r.stunned) this.flash(this.enemy);
      this.ui.combatMessage(`${sk.name}: ${r.effects.join(', ') || 'wirkt'}.${r.stunned ? ` ${c.enemy.name} setzt eine Runde aus.` : ''}`);
      this.ui.combatRefresh();
      this.time.delayedCall(700, () => this.afterAction(c.endsTurn(skillId)));
      return;
    }
    if (SKILL_FX[skillId]) { this.castAnim(); this.skillFx(skillId); } else this.attackAnim();
    const blade = this.state.weapon === 'stockdegen';
    this.tweens.add({
      targets: this.player, x: ENEMY_X - 50, duration: 160, yoyo: true, ease: 'Quad.out',
      onYoyo: () => {
        r.hits.forEach((h, i) => this.time.delayedCall(i * 140, () => {
          this.flash(this.enemy);
          this.hitFx(h.grade === 'miss' ? 'miss' : h.grade === 'perfect' ? 'critical' : blade ? 'slash' : 'blunt', 'enemy');
          this.float(`-${h.damage}`, 'enemy', h.grade === 'perfect' ? 'crit' : 'dmg');
        }));
        this.cameras.main.shake(90, 0.006);
      },
    });
    let msg = `${sk.name}: ${r.total} Schaden.`;
    if (r.effects.length) msg += ` ${r.effects.join(', ')}.`;
    if (r.stunned) msg += ` ${c.enemy.name} ${skillId === 'blind' ? 'ist geblendet und ' : ''}setzt aus.`;
    if (skillId === 'blind' && !r.stunned) msg += ' Die Blende verfehlt ihr Ziel.';
    this.ui.combatMessage(msg);
    this.ui.combatRefresh();
    this.time.delayedCall(700, () => this.afterAction(c.endsTurn(skillId)));
  }

  /** Nach einer Aktion: weiter im eigenen Zug (Konzentration) oder an den Gegner abgeben. */
  afterAction(endTurn) {
    if (endTurn || this.combat.outcome) { this.afterPlayer(); return; }
    this.ui.combatRefresh();
    this.toMenu();
  }

  afterPlayer() {
    this.ui.combatRefresh();
    if (this.combat.outcome) { this.time.delayedCall(300, () => this.over()); return; }
    const wait = this.transform();
    this.time.delayedCall(350 + wait, () => this.enemyTurn());
  }

  /** Paket I: Sektenoberhäupter verwandeln sich in Rage in ihre große Gestalt. Liefert die Dauer in ms. */
  transform() {
    const sheet = BOSS_FORMS[this.encounterId];
    if (!sheet || this.transformed || !this.combat.enraged() || !this.textures.exists(sheet) || !this.enemySheet) return 0;
    this.transformed = true;
    this.enemySheet = sheet;
    this.enemy.setTexture(sheet, 0).setOrigin(0.5, this.sheetOriginY(sheet)).setScale(1.2);
    this.cameras.main.shake(300, 0.006);
    this.cameras.main.flash(200, 120, 60, 40);
    this.float('Verwandlung!', 'enemy', 'crit');
    if (!this.anim(this.enemy, 'phase2')) this.idle(this.enemy);
    return 900;
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
      if (c.lastAction) {
        // Kniff der Sekten: Panzer, Heilung, Schleier, Einschüchterung
        const a = c.lastAction;
        this.ui.combatMessage(`${c.enemy.name}: ${a.name}\n\n${a.text}`);
        const float = { guard: [`Panzer +${a.value}`, 'good'], heal: [`+${a.value}`, 'good'], veil: ['Schleier', 'miss'], taunt: [`-${a.value} Nerven`, 'hurt'] }[a.action];
        if (float) this.float(float[0], a.action === 'taunt' ? 'player' : 'enemy', float[1]);
        this.anim(this.enemy, 'special');
        this.ui.combatRefresh();
        this.time.delayedCall(1100, () => this.endRound());
        return;
      }
      this.ui.combatMessage(`${c.enemy.name} taumelt und greift nicht an.`);
      this.time.delayedCall(900, () => this.endRound());
      return;
    }
    this.phase = 'enemy';
    this.attack = atk;
    const t0 = now() + TELEGRAPH;
    this.hits = atk.hits.map((h, i) => ({ impact: t0 + h, result: null, applied: false, ring: atk.rings?.[i] ?? { curve: 'linear', lead: RING_LEAD } }));
    const tags = [atk.unparryable ? '⚠ nicht parierbar, ausweichen!' : '', atk.enraged ? 'in Rage' : '', atk.followup ? 'setzt nach!' : '', atk.bleed ? 'Treffer bluten nach' : '', atk.nerves ? `Treffer kosten ${atk.nerves} Nerven` : ''].filter(Boolean).join(' · ');
    this.ui.combatMessage(`${c.enemy.name}: ${atk.name}${atk.hits.length > 1 ? ` (${atk.hits.length} Schläge)` : ''}${tags ? `\n\n${tags}` : ''}${c.evading ? '\n\nDu weißt schon, wohin er schlägt.' : ''}`, `Leertaste: ausweichen (${DODGE_COST} Nerven) · F: parieren`);
    this.tweens.add({ targets: this.enemy, x: ENEMY_X + 8, duration: TELEGRAPH * 0.6, ease: 'Sine.out' });
    // Paket-B-Gegner haben zwei Angriffe: mehrteilige Attacken nutzen 'special'
    if (!(atk.hits.length > 1 && this.anim(this.enemy, 'special'))) this.anim(this.enemy, 'attack');
    const efx = ENCOUNTER_FX[this.encounterId];
    if (efx) this.caseFx(atk.hits.length > 2 ? efx.multi ?? efx.attack : atk.hits.length === 1 && atk.damage >= 10 ? efx.heavy ?? efx.attack : efx.attack, 'player');
  }

  pressDefense(kind, t) {
    const hit = this.hits.find((h) => !h.result && t >= h.impact - EARLY_LIMIT);
    if (!hit) return;
    hit.result = judgeDefense(kind, t - hit.impact, this.state.passive('dodge_window'), this.combat.parryWindow());
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
      this.hitFx('parry', 'player');
      this.time.delayedCall(90, () => { this.flash(this.enemy); this.float(`-${r.counter}`, 'enemy', 'dmg'); });
      this.cameras.main.flash(60, 255, 240, 200);
    } else if (hit.result === 'dodge') {
      this.float('Ausgewichen', 'player', 'good');
      this.anim(this.player, 'dodge');
      this.hitFx('dodge', 'player');
      this.tweens.add({ targets: this.player, x: PLAYER_X - 26, duration: 110, yoyo: true, ease: 'Quad.out' });
    } else {
      this.time.delayedCall(90, () => { this.flash(this.player); if (r.damage) this.hitFx('blunt', 'player'); this.float(r.damage ? `-${r.damage}` : 'Abgefangen', 'player', r.damage ? 'hurt' : 'good'); if (r.damage) this.cameras.main.shake(120, 0.01); });
      if (hit.early) this.float('Zu früh', 'player', 'miss');
      else if (r.note === 'unparryable') this.float('Nicht parierbar!', 'player', 'miss');
      else if (r.note === 'exhausted') this.float('Erschöpft', 'player', 'miss');
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
      this.attackAnim();
      this.tweens.add({
        targets: this.player, x: ENEMY_X - 50, duration: 140, yoyo: true,
        onYoyo: () => { this.flash(this.enemy); this.hitFx('critical', 'enemy'); this.float(`-${dmg}`, 'enemy', 'crit'); this.cameras.main.shake(120, 0.008); },
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
    const bleed = this.combat.bleedTick;
    if (bleed) {
      this.flash(this.player);
      this.float(`-${bleed}`, 'player', 'hurt');
    }
    if (dot || bleed) {
      if (dot) { this.flash(this.enemy); this.float(`-${dot}`, 'enemy', 'dmg'); }
      this.ui.combatRefresh();
      this.ui.combatMessage([dot ? `${this.combat.enemy.name} leidet unter Brand und Gift: ${dot} Schaden.` : '', bleed ? `Deine Wunde blutet: ${bleed} Schaden.` : ''].filter(Boolean).join('\n\n'));
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
      const human = this.enemySheet ? !FADING_SHEETS.includes(this.enemySheet) : this.combat.enc.sprite.startsWith('npc:');
      if (this.anim(this.enemy, 'defeated', false)) { if (!human) this.tweens.add({ targets: this.enemy, alpha: 0, delay: 900, duration: 700 }); }
      else this.tweens.add({ targets: this.enemy, alpha: 0, y: '+=10', duration: 700 });
    }
    if (c.outcome === 'won') playBattleAnim(this.player, 'victory', null, 'battle_player_weapons');
    if (c.outcome === 'won') {
      const efx = ENCOUNTER_FX[this.encounterId];
      this.caseFx(efx?.won, 'enemy');
      if (efx?.after) this.time.delayedCall(700, () => this.caseFx(efx.after, 'enemy', 1));
    }
    if (c.outcome === 'lost' && !this.anim(this.player, 'defeated', false)) this.tweens.add({ targets: this.player, angle: -90, y: '+=4', duration: 500 });
    const title = { won: 'Sieg', lost: 'Ohnmacht', fled: 'Rückzug' }[c.outcome];
    this.ui.combatOver(title);
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    const result = this.combat.finish({ deferLoot: this.deferLoot });
    const done = () => {
      this.ui.closeCombat(result, this.combat.enc);
      this.onDone?.(result);
      this.scene.stop();
    };
    if (this.playTransition('transition_in', done)) return;
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, done);
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
        const lead = hit.ring.lead;
        if (left > lead || hit.result) continue;
        const u = Math.min(1, Math.max(0, 1 - left / lead));
        const closed = (RING_CURVES[hit.ring.curve] ?? RING_CURVES.linear)(u);
        const r = 16 + Math.max(0, 1 - closed) * 60;
        const near = Math.abs(left) <= this.combat.parryWindow();
        const color = this.attack?.unparryable ? (near ? 0xff70ff : 0xa040e0) : near ? 0xffd890 : 0xe05050;
        g.lineStyle(this.attack?.unparryable ? 3 : 2, color, 0.95).strokeCircle(c.x, c.y, r);
      }
      if (this.hits.every((h) => h.applied)) this.finishEnemyTurn();
    }
  }
}
