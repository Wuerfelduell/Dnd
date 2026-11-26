import Phaser from 'phaser';
import { Combat, WINDOW, EARLY_LIMIT, DODGE_COST, RING_CURVES, judgeDefense, judgeTiming, isPrecise, skillBars, PRECISE_WINDOW, MEISTER_WINDOW, isPerfectGrade, isPerfectDodge } from '../core/Combat.js';
import { createTextures, createCharacterSheet } from './textures.js';
import {
  BATTLE_BACKGROUNDS, battleBackgroundFor, ENCOUNTER_BACKGROUNDS, ENEMY_BATTLE_SHEETS, ENCOUNTER_SHEETS, FADING_SHEETS,
  SKILL_FX, SELF_FX, AG_SKILL_FX, PATHWAY_POSES, WEAPON_POSES, battleSheetsOf, ENCOUNTER_FX, BOSS_INTROS, bossIntroImage, BOSS_FORMS, BOSS_FORM_BACKGROUNDS, BOSS_FORM_INTROS, battleSheetDef, CASE_SHEETS, playBattleAnim, playCaseAnim, HG_PATHS,
  BATTLE_SHEET_SCALE, ENTER_ANIMS, ENCOUNTER_STAGE, STARLING2_HUD, ritualBattleSheet,
} from './assets.js';
import { RitualCombat, ritualBackground, ritualLook } from './RitualCombat.js';
import { VIEW_W, VIEW_H, PLAYER_PALETTE } from './WorldScene.js';
import { koopBark, koopStartEvent } from '../core/Koop.js';
import { combatSound, skillSound, ritualSkillSound, kesselWurfSound } from '../core/sounds.js';
import { combatCue } from '../core/musicCues.js';
import { speechBubble } from './WexmoorLife.js';
import { p2View } from '../core/Split.js';

// Kampfbildschirm in Seitenansicht: Spieler links, Gegner rechts, Bodenstreifen unten.
// Die Regeln stecken in core/Combat.js, hier nur Timing, Eingabe und Animation.

// Die ganze Bühne (Kulisse + Figuren) sitzt STAGE_LIFT Pixel höher, damit das Kampfmenü unten
// die Füße von Spieler und Gegner nicht verdeckt. Den frei werdenden Streifen unten füllt ein dunkler Boden.
const STAGE_LIFT = 32;
const GROUND_Y = 200 - STAGE_LIFT;
const PLAYER_X = 140;
const ENEMY_X = 345;
const RING_LEAD = 750; // so lange vor dem Einschlag erscheint der Ring
const TELEGRAPH = 650; // Ankündigung vor der ersten Attacke
const BAR = { x: 140, y: 96, w: 200, h: 8 };

const now = () => performance.now();
const P2_TINT = 0x9ab8ff; // Spieler 2: gleiche Figur, kühler Mantel
// Zu zweit stehen die Spieler versetzt: Spieler 1 vorn, Spieler 2 dahinter
const DUO_HOMES = { 1: { x: PLAYER_X + 12, y: GROUND_Y + 10 }, 2: { x: PLAYER_X - 46, y: GROUND_Y + 20 } };
// Gegnergruppen: Plätze je Gruppengröße (dx/dy zur gewohnten Gegnerposition), der Anführer steht vorn
const FOE_SLOTS = {
  1: [{ dx: 0, dy: 0 }],
  2: [{ dx: -18, dy: 4 }, { dx: 62, dy: -8 }],
  3: [{ dx: -28, dy: 6 }, { dx: 38, dy: -10 }, { dx: 92, dy: 8 }],
};

export class CombatScene extends Phaser.Scene {
  constructor() {
    super('combat');
  }

  /** Sprite des Gegners, für den die Kampfwerte gerade gelten (Gruppen: Ziel bzw. Angreifer). */
  get enemy() {
    return this.enemies?.[this.combat?.fi ?? 0] ?? this.enemies?.[0];
  }

  /** Kampf-Sheet bzw. Tönung des aktuellen Gegners. */
  get enemySheet() {
    return this.enemy?.foeSheet ?? null;
  }

  set enemySheet(v) {
    if (this.enemy) this.enemy.foeSheet = v;
  }

  get enemyTint() {
    return this.enemy?.foeTint ?? null;
  }

  init(data) {
    this.encounterId = data.id;
    this.onDone = data.onDone;
    this.deferLoot = !!data.deferLoot; // Gegner auf der Karte: Beute fällt als Behälter auf den Boden
    this.noLoot = !!data.noLoot; // BQ: Schreinwachen ohne eigene Beute
    this.splitHalf = data.splitHalf ?? 0; // Splitscreen im Pfadviertel: Kampf nur in der Hälfte dieses Spielers (1 links, 2 rechts)
    this.pack = data.pack ?? []; // Gegnergruppe: Begleiter des Anführers (Encounter-Ids)
    this.transformed = false;
  }

  create() {
    this.realState = this.registry.get('state');
    // Splitscreen: Spieler 2 kämpft auf seiner eigenen Sicht (kein Tausch), damit Spieler 1 links weiterspielen kann
    this.state = this.splitHalf === 2 ? p2View(this.realState) : this.realState;
    this.ui = this.registry.get('ui');
    this.combat = new Combat(this.state, this.encounterId, { pack: this.pack });
    // Die ganze Kampfbühne verkleinert in der eigenen Bildhälfte; die andere Hälfte läuft weiter
    if (this.splitHalf) this.cameras.main.setViewport(this.splitHalf === 2 ? VIEW_W / 2 : 0, 0, VIEW_W / 2, VIEW_H).setZoom(0.5).centerOn(VIEW_W / 2, VIEW_H / 2).setBackgroundColor('#040408');
    else this.cameras.main.setViewport(0, 0, VIEW_W, VIEW_H).setZoom(1).centerOn(VIEW_W / 2, VIEW_H / 2).setBackgroundColor('rgba(0,0,0,0)');
    this.phase = 'intro';
    this.leaving = false; // Szenen-Objekt wird wiederverwendet: Zustand jedes Mal zurücksetzen
    this.attack = null;
    this.hits = [];
    this.qte = null;
    createTextures(this);
    this.buildStage();
    this.gfx = this.add.graphics().setDepth(50);
    // Gamepad (Spieler 2): A Takt/Aktion, X ausweichen, B parieren
    this.padHandler = (pad, button) => {
      if ((button.index === 4 || button.index === 5) && this.cycleTarget(button.index === 5 ? 1 : -1)) return; // Gruppen: Schultertasten wechseln das Ziel
      const kind = { 0: 'confirm', 2: 'dodge', 1: 'parry' }[button.index];
      const solo2 = !this.combat.duo && this.combat.alsP2; // Spieler 2 kämpft allein (Splitscreen, Solo-Prüfung): sein Gamepad gilt
      if (!kind || (!this.combat.duo && !solo2)) return;
      if (this.phase === 'menu' && kind === 'confirm' && (this.combat.actor === 2 || solo2)) { this.ui.combatPadPick?.(); return; }
      this.onKey(kind, solo2 ? 1 : 2);
    };
    this.input.gamepad?.on('down', this.padHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.gamepad?.off('down', this.padHandler));
    this.ui.openCombat(this);
    const ward = this.combat.wardMult() < 1 ? `\n\n${this.combat.log[0]}` : ''; // Sequenz-Schranke
    const more = this.combat.foes.length - 1; // Gegnergruppe
    const pack = more === 1 ? '\n\nNicht allein: Ein weiterer Gegner tritt dazu.' : more > 1 ? `\n\nNicht allein: ${more} weitere Gegner treten dazu.` : '';
    const wt = this.combat.wetterText?.(); // Wetter und Nebelnacht (core/Wetter.js)
    if (this.combat.wetter) {
      const w = this.combat.wetter;
      const label = w.nebelnacht ? '≋ Nebelnacht' : `${w.def.icon} ${w.def.name}`;
      this.add.text(VIEW_W - 4, 4, label, { fontFamily: 'monospace', fontSize: '9px', color: w.nebelnacht ? '#9fd0b0' : '#c8d0e0', stroke: '#1a1c2c', strokeThickness: 3 }).setOrigin(1, 0).setDepth(80);
    }
    this.ui.combatMessage(this.combat.enc.intro + (this.combat.weak ? `\n\n${this.combat.enc.weak_text}` : '') + ward + pack + (wt ? `\n\n${wt}` : ''), 'Weiter mit E', this.combat.enc.scene);
    // transition_out deckt auf (Schwarz → Bild), transition_in deckt zu
    this.playTransition('transition_out', () => this.bossIntro()) || (this.cameras.main.fadeIn(250, 0, 0, 0), this.bossIntro());
  }

  /** Paket Y: Soundeffekt (still, wenn der Ton fehlt oder noch gesperrt ist). */
  sfx(id, opts) {
    if (this.combat?.rules?.deaf) return; // Seq 4 (Echo): taub, kein einziger Klang
    if (id) this.registry.get('audio')?.play(id, opts);
  }

  /** Paket F: Boss-Band schiebt sich ins Bild, Büste und Name, dann wieder weg. */
  bossIntro() {
    const bust = BOSS_INTROS[this.encounterId];
    // Paket AI: zu zweit sagt einer etwas zum Kampfbeginn (Boss vor normalem Beginn)
    // Paket BF: Schichtgänger, Nachhall und Prüfungen haben eigene Anfänge; bei der Prüfung spricht, wer zuschaut
    if (this.combat.duo) {
      const special = koopStartEvent(this.encounterId, this.combat.enc);
      const watcher = special === 'koop_pruefung' ? (this.state.combatBy === 2 ? 1 : 2) : null;
      this.time.delayedCall(bust ? 2400 : 600, () => this.bark(special ?? (bust || this.combat.enc.boss ? 'koop_bossbeginn' : 'koop_kampfbeginn'), watcher));
    }
    this.sfx(combatSound('start', { id: this.encounterId, boss: !!bust })); // CM: Sekten überfallen aus dem Nebel, Starling verwandelt sich
    if (this.combat.rules?.spare) this.time.delayedCall(500, () => this.sfx('s4ma_handschuh')); // DS (Maske): der Handschuh fällt auf Stein
    if (!bust || !this.textures.exists('F_08_boss_band')) return;
    const band = this.add.sprite(0, 0, 'F_08_boss_band', 0).setOrigin(0).setDepth(90);
    const key = 'F_08_boss_band-enter';
    if (!this.anims.exists(key)) {
      const def = this.cache.json.get('manifestKampf2')?.assets?.find((a) => a.id === 'F_08_boss_band')?.animations?.enter;
      this.anims.create({ key, frames: (def?.frames ?? [0, 1, 2, 3, 4, 5]).map((frame) => ({ key: 'F_08_boss_band', frame })), frameRate: def?.frameRate ?? 12, repeat: 0 });
    }
    band.play(key);
    const parts = [band];
    const [bustKey] = bossIntroImage(bust);
    if (this.textures.exists(bustKey) && this.textures.get(bustKey).getSourceImage().width >= VIEW_W) {
      // Paket W: ganzes Intro-Bild (480x270) statt Büste, blendet hinter dem Band ein
      const img = this.add.image(0, 0, bustKey).setOrigin(0).setDepth(89).setAlpha(0);
      this.tweens.add({ targets: img, alpha: 1, duration: 300 });
      parts.push(img);
    } else if (this.textures.exists(bustKey)) {
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
    const b = battleSheetDef(this, sheet);
    const base = b?.baseline ?? b?.baselineY;
    return base ? (base + 1) / b.frameHeight : 1;
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
    if (!CASE_SHEETS[sheet]) { const [sh, anim = 'play'] = sheet.split(':'); this.playFx(sh, anim, p.x, p.y, scale); return; } // Paket-F-Effekt, BS: "sheet:animation"
    const fx = this.add.sprite(p.x, p.y, sheet, 0).setScale(scale).setDepth(30);
    if (!playCaseAnim(fx, sheet, () => fx.destroy())) fx.destroy();
  }

  /** Treffer-Effekt am Ziel: blunt, slash, parry, dodge, critical, heal, nerves, item, miss. */
  hitFx(kind, who) {
    const p = typeof who === 'number' ? this.enemyCenter(who) : who === 'enemy' ? this.enemyCenter() : this.playerCenter();
    // Paket Y: passender Klang zum Treffer
    const sound = combatSound('hit', { id: this.encounterId, kind, who }) // CM: gepolsterte Treffer im Fest-Boxring
      ?? { miss: 'verfehlt', critical: 'treffer_krit', parry: 'parade', dodge: 'ausweichen', heal: 'heilen', item: 'trank', nerves: 'nerven' }[kind]
      ?? (who === 'player' ? (this.combat?.rules?.shadow ? 'schatten_treffer' : 'treffer_spieler') : 'treffer'); // DS: der Schatten verliert Leben
    this.sfx(sound);
    if (this.ritualArt?.hitFx(kind, who)) return; // Codex DN/DO: lautloser Staubring (Echo), Schattenfetzen (Schlüssel)
    this.playFx('hits', kind, p.x, p.y, 1);
  }

  /** Effekt einer Pfad-Fähigkeit, am Spieler oder am Gegner. */
  skillFx(skillId, foes = null) {
    const def = this.combat?.skillDef(skillId);
    skillId = this.fxId(skillId);
    if (!SKILL_FX[skillId]) return;
    // Paket AG: Stufen ohne Treffer (Schutz, Heilung, Ruhe) wirken am Spieler
    const self = SELF_FX.includes(skillId) || (AG_SKILL_FX.includes(skillId) && def && !def.hits);
    // Flächenfertigkeiten: der Effekt erscheint an jedem getroffenen Gegner
    for (const i of self ? [null] : foes ?? [null]) {
      const p = self ? this.playerCenter() : this.enemyCenter(i);
      this.playFx(`fx_${skillId}`, 'cast', p.x, p.y);
    }
  }

  /** Effekt-Id einer Fähigkeit: neue Fähigkeiten leihen sich bis zur eigenen Grafik einen Effekt (fx). */
  fxId(skillId) {
    if (AG_SKILL_FX.includes(skillId)) return skillId; // Paket AG: eigener Effekt statt des geliehenen
    return this.combat?.skillDef(skillId)?.fx ?? skillId;
  }

  /** Schlaganimation passend zur Waffe. */
  attackAnim(n = this.combat.actor) {
    const pose = WEAPON_POSES[this.combat.on(n, () => this.state.weapon)];
    if (pose && playBattleAnim(this.player, pose, () => this.idle(this.player), this.sheetsOf(this.player).weapons)) return;
    this.anim(this.player, 'attack');
  }

  /** Zauberpose des eigenen Pfades; ohne Pfad (oder ohne Sheet) die 14b-Okkult-Pose. */
  castAnim() {
    const pid = this.combat.on(this.combat.actor, () => this.state.pathway?.id);
    const sheets = this.sheetsOf(this.player);
    // Paket AH: Spieler 2 hat eigene Posen auch für die neuen Pfade (sq_waage, sq_moor, sq_uhr)
    // Paket AG: eigene Posen der neuen Pfade für die Hauptfigur (vor der geliehenen Pose)
    if (!sheets.own && pid?.startsWith('sq_') && playBattleAnim(this.player, pid, () => this.idle(this.player), 'battle_player_skills2')) return true;
    for (const pose of [sheets.own && pid?.startsWith('sq_') && pid, PATHWAY_POSES[pid]]) {
      if (pose && playBattleAnim(this.player, pose, () => this.idle(this.player), sheets.skills)) return true;
    }
    return this.anim(this.player, 'occult');
  }

  // --- Bühne -------------------------------------------------------------------

  buildStage() {
    const map = this.state.content.maps[this.state.map];
    // Paket BU: vier Kulissen haben eine Nachtfassung
    const bg = [ritualBackground(this, this.combat), ENCOUNTER_BACKGROUNDS[this.encounterId], battleBackgroundFor(map.id, this.state.isNight?.() ?? false), BATTLE_BACKGROUNDS[map.id]].find((k) => k && this.textures.exists(k));
    this.bgImage = null;
    if (bg && this.textures.exists(bg)) {
      this.add.rectangle(0, VIEW_H - STAGE_LIFT - 2, VIEW_W, STAGE_LIFT + 2, 0x0b0a0c).setOrigin(0);
      this.bgImage = this.add.image(0, -STAGE_LIFT, bg).setOrigin(0);
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

    this.players = {};
    this.homes = this.combat.duo ? DUO_HOMES : { 1: { x: PLAYER_X, y: GROUND_Y + 14 } };
    for (const n of Object.keys(this.homes).map(Number)) {
      const h = this.homes[n];
      let spr;
      // Paket AH: Spieler 2 kämpft mit seiner eigenen Figur, sonst getönt mit dem Ermittler-Sheet
      const look = n === 2 ? this.state.p2Look?.() : null;
      // Paket CO: wer seine Kreaturform trägt, kämpft mit ihrem 96er-Blatt (hg_battle_<pfad>), ohne eigene Posen-Sheets
      const formPid = this.state.withPlayer?.(n, () => (this.state.formActive?.() ? this.state.pathway?.id : null), { quiet: true });
      const stillKey = formPid && this.state.withPlayer?.(n, () => this.state.pathway?.seq === 1, { quiet: true }) && `hg_form_${formPid}_still_battle`; // Seq 1: stille Endgestalt
      const formSheet = stillKey && this.textures.exists(stillKey) ? stillKey : formPid && this.textures.exists(`hg_battle_${formPid}`) ? `hg_battle_${formPid}` : null;
      // Codex DN/DO: in der Maskenprüfung kämpft der Zivilist, beim Schlüssel der Schatten (eigene 6x9-Blätter je Figur)
      const ritualSheet = ritualBattleSheet(ritualLook(this.state, this.combat, n), n === 2 ? look ?? 'p2a' : 'player');
      const sheets = ritualSheet && this.textures.exists(ritualSheet) ? { base: ritualSheet, skills: ritualSheet, weapons: ritualSheet, own: true, ritual: true }
        : formSheet ? { base: formSheet, skills: formSheet, weapons: formSheet, own: true, form: true }
        : look && this.textures.exists(`${look}_battle`) ? { ...battleSheetsOf(look), own: true } : battleSheetsOf(null);
      if (this.textures.exists(sheets.base)) {
        // Kampf-Sheet (48x48, Blick nach rechts); Füße liegen am unteren Zellrand. Kreaturformen (96x96) in Originalgröße.
        spr = this.add.sprite(h.x, h.y, sheets.base, 0).setOrigin(0.5, 1).setScale(sheets.form ? 1 : 1.5).setDepth(n === 2 ? 11 : 10);
      } else {
        createCharacterSheet(this, 'player', PLAYER_PALETTE);
        spr = this.add.sprite(h.x, h.y, 'player', 8).setOrigin(0.5, 1).setScale(2).setDepth(n === 2 ? 11 : 10);
      }
      spr.homeX = h.x;
      spr.homeY = h.y;
      spr.sheets = sheets;
      spr.baseTint = this.combat.rules?.shadow && !sheets.ritual ? 0x2a2238 : n === 2 && !sheets.own ? P2_TINT : null; // Seq 4: der Schatten kämpft
      if (spr.baseTint) spr.setTint(spr.baseTint);
      this.players[n] = spr;
      this.add.ellipse(h.x, h.y, 34, 8, 0x000000, 0.35).setDepth(9);
      if (this.textures.exists(sheets.base)) this.idle(spr);
    }
    this.player = this.players[1];

    // Gegner: einer oder eine Gruppe (Anführer vorn, Begleiter dahinter)
    const c = this.combat;
    const slots = FOE_SLOTS[c.foes.length] ?? FOE_SLOTS[1];
    this.enemies = c.foes.map((f, i) => this.buildFoe(f.enc, i ? f.id : this.encounterId, ENEMY_X + slots[i].dx, GROUND_Y + 14 + slots[i].dy, i));
    this.ritualArt = new RitualCombat(this);
    this.events.once('shutdown', () => this.ritualArt?.destroy());
    this.ritualArt.start();
  }

  /** Baut die Figur eines Gegners (i: Platz in der Gruppe) samt Schatten, Aura und Siegel. */
  buildFoe(enc, encId, x, y, i) {
    const spr = enc.sprite;
    const battleSheet = [enc.sheet, ENCOUNTER_SHEETS[encId], ENEMY_BATTLE_SHEETS[spr]].find((k) => k && this.textures.exists(k));
    let e;
    if (battleSheet) {
      e = this.add.sprite(x, y, battleSheet, 0).setOrigin(0.5, this.sheetOriginY(battleSheet)).setScale(1.5);
    } else if (spr.startsWith('npc:')) {
      const id = spr.slice(4);
      createCharacterSheet(this, `npc_${id}`, this.state.content.npcs[id].palette);
      e = this.add.sprite(x, y, `npc_${id}`, 4).setOrigin(0.5, 1).setScale(2);
    } else {
      e = this.add.image(x, y + 4, spr).setOrigin(0.5, 1).setScale(1.35);
      this.tweens.add({ targets: e, y: y + 1, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    e.foeSheet = battleSheet ?? null;
    e.foeIndex = i;
    e.homeX = x;
    e.homeY = y;
    e.setDepth(i ? 9.5 - i * 0.1 + (y > GROUND_Y + 14 ? 0.6 : 0) : 10);
    if (battleSheet) this.idle(e);
    // Gefahrengebiete: Platzhalter-Sheets werden getönt, Elite und Boss sind größer
    e.foeTint = enc.elite ? 0xff9080 : enc.tint ? Number.parseInt(enc.tint.slice(1), 16) : null;
    if (e.foeTint !== null) e.setTint(e.foeTint);
    if (enc.elite || enc.boss) e.setScale(e.scaleX * (enc.boss ? 1.35 : 1.18));
    if (battleSheet && BATTLE_SHEET_SCALE[battleSheet]) e.setScale(BATTLE_SHEET_SCALE[battleSheet]);
    if (battleSheet && ENTER_ANIMS[battleSheet]) this.anim(e, ENTER_ANIMS[battleSheet]); // BS: Starling fährt als Sternsammler ein
    if (i === 0) {
      // Paket CO: der Schwellen-/Grenzwächter trägt das Siegel des geprüften Pfades vor der Brust (eigenes Overlay, 32x32)
      this.siegel = null;
      if (enc.waechter && this.textures.exists('hg_siegel') && HG_PATHS.includes(enc.pathway)) {
        this.siegel = this.add.image(e.x, e.y, 'hg_siegel', HG_PATHS.indexOf(enc.pathway)).setDepth(11).setScale(0.75);
        this.siegelOffset = -Math.round(e.displayHeight * 0.55);
      }
      this.buildStageExtras();
    }
    e.shadow = this.add.ellipse(x, y, 50, 10, 0x000000, 0.35).setDepth(e.depth - 1);
    if (enc.occult) {
      e.aura = this.add.image(x, y - 44, 'glow').setScale(2.5).setTint(0x6fe0d0).setAlpha(0.25).setDepth(8);
      e.aura.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: e.aura, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });
    }
    // Gruppen: Gegner anklicken bzw. antippen wählt das Ziel
    if (this.combat.group) e.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.pickTarget(i));
    return e;
  }

  /** Gruppen: Ziel wählen (nur im Menü). */
  pickTarget(i) {
    if (this.phase !== 'menu' || !this.combat.setAim(i)) return;
    this.ui.combatRefresh();
  }

  /** Gruppen: Ziel weiterschalten (Tab, Pfeiltasten, Schultertasten). */
  cycleTarget(dir = 1) {
    if (this.phase !== 'menu' || !this.combat.cycleAim(dir)) return false;
    this.ui.combatRefresh();
    return true;
  }

  /** Ein Gegner der Gruppe fällt (letzter Sieg: über(); vorher mitten im Kampf). */
  foeDown(e) {
    if (!e || e.downed) return;
    e.downed = true;
    e.disableInteractive?.();
    const f = this.combat.foes[e.foeIndex];
    const human = e.foeSheet ? !FADING_SHEETS.includes(e.foeSheet) : f.enc.sprite.startsWith('npc:');
    this.sfx(combatSound('defeated', { id: f.id, sheet: e.foeSheet ?? f.enc.sprite, human }));
    const fade = [e.shadow, e.aura].filter(Boolean);
    if (playBattleAnim(e, 'defeated', null, e.foeSheet ?? e.texture.key)) { if (!human || this.combat.outcome !== 'won') this.tweens.add({ targets: [e, ...fade], alpha: 0, delay: 900, duration: 700 }); }
    else this.tweens.add({ targets: [e, ...fade], alpha: 0, y: '+=10', duration: 700 });
    if (!this.combat.outcome) this.float('Besiegt!', e.foeIndex, 'good');
  }

  /** BS: Kuppel-Overlay, Bodenstreifen, Sternen-HUD und Koop-Marken für Begegnungen mit eigener Bühne (ENCOUNTER_STAGE). */
  buildStageExtras() {
    const st = ENCOUNTER_STAGE[this.encounterId];
    this.stars = null;
    if (!st) return;
    if (st.dome && this.textures.exists(st.dome[0])) {
      const dome = this.add.sprite(0, -STAGE_LIFT, st.dome[0], 0).setOrigin(0).setDepth(5).setAlpha(0.9);
      playBattleAnim(dome, st.dome[1], null, st.dome[0]);
    }
    if (st.ground && this.textures.exists(st.ground)) this.add.image(0, VIEW_H - STAGE_LIFT, st.ground).setOrigin(0, 1).setDepth(12);
    if (st.hud && this.textures.exists(st.hud) && this.textures.exists('starling2_sterne')) {
      const H = STARLING2_HUD;
      // Die Leiste liegt auf dem Boden zwischen den Kämpfern, wo weder Meldung noch Gegnerkarte sie verdecken
      const x0 = Math.round(VIEW_W / 2 - H.bar[2] / 2);
      const y0 = GROUND_Y - 46;
      this.add.image(x0, y0, st.hud).setOrigin(0).setCrop(...H.bar).setDepth(60).setAlpha(0.9);
      this.stars = H.sockets.map(([sx, sy, sw], i) => {
        const star = this.add.sprite(x0 + sx + sw / 2, y0 + sy + 2, 'starling2_sterne', i).setDepth(61).setAlpha(0);
        return star;
      });
      this.starRound = 0;
      this.updateStars();
    }
    if (st.koop && this.combat.duo && this.textures.exists(st.koop)) {
      for (const n of Object.keys(this.players).map(Number)) {
        const p = this.players[n];
        const mark = this.add.image(p.homeX, p.homeY - 70, st.koop, n === 2 ? 1 : 0).setDepth(12).setScale(0.5).setAlpha(0.85);
        this.tweens.add({ targets: mark, y: p.homeY - 74, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
    }
  }

  /** Ein Stern je Kampfrunde leuchtet auf: Starling sammelt die acht Fälle in sich, je länger der Kampf dauert. */
  updateStars() {
    if (!this.stars) return;
    const lit = Math.min(this.stars.length, this.combat.round);
    this.starRound = this.combat.round;
    this.stars.forEach((star, i) => {
      if (i >= lit || star.lit) return;
      star.lit = true;
      this.sfx('starling_stern', { variant: i + 1 }); // CM: acht Sterne, tonal gestuft D4 bis D5
      this.tweens.add({ targets: star, alpha: 1, scale: { from: 1.6, to: 1 }, duration: 400, ease: 'Back.out' });
    });
  }

  /** Kampfanimation abspielen, danach zurück in die Idle-Schleife. Ohne Kampf-Sheet: nichts. */
  anim(sprite, name, back = true) {
    return playBattleAnim(sprite, name, back ? () => this.idle(sprite) : null, this.baseSheet(sprite));
  }

  idle(sprite) {
    if (sprite.downed) return; // wer K.o. ist, bleibt liegen
    if (this.phase !== 'over' || !this.combat.outcome) playBattleAnim(sprite, 'idle', null, this.baseSheet(sprite));
  }

  /** Grund-Sheet einer Figur (Zusatz-Sheets wie Waffen oder Zauber kehren hierher zurück). */
  baseSheet(sprite) {
    if (Object.values(this.players ?? {}).includes(sprite)) return this.sheetsOf(sprite).base;
    return sprite.foeSheet ?? sprite.texture.key;
  }

  /**
   * Paket AI: ein Kampfspruch zu zweit, als Sprechblase über dem Sprecher. Nur stehende Spieler sprechen,
   * vier Sekunden Pause dazwischen (force: wichtige Anlässe wie K.o. oder Sieg gehen vor).
   */
  bark(event, speaker = null, force = false) {
    const c = this.combat;
    if (!c.duo) return;
    const now = this.time.now;
    if (!force && now - (this.barkAt ?? -Infinity) < 4000) return;
    const standing = c.standing();
    const n = speaker && standing.includes(speaker) ? speaker : standing[Math.floor(Math.random() * standing.length)];
    const spr = this.players?.[n];
    if (!spr) return;
    const text = koopBark(this.state, event, n, this.lastBark);
    if (!text) return;
    this.barkAt = now;
    this.lastBark = text;
    this.barkBubble?.destroy();
    const b = speechBubble(this, text, { x: spr.homeX ?? spr.x, y: (spr.homeY ?? spr.y) - 40 }, this.cameras.main.worldView).setDepth(95);
    this.barkBubble = b;
    this.tweens.add({ targets: b, alpha: 0.95, duration: 150 });
    this.tweens.add({ targets: b, alpha: 0, delay: 2400, duration: 300, onComplete: () => b.destroy() });
  }

  /** Kampf-Sheets eines Spieler-Sprites (Paket AH). */
  sheetsOf(sprite) {
    return sprite?.sheets ?? battleSheetsOf(null);
  }

  /**
   * Seq 4 (Echo): taub gibt es keinen Ring und keinen Klang. Stattdessen fliegt eine stumme Schallwelle vom Gegner zum Spieler
   * und trifft genau im Moment des Einschlags (gleiche Vorlaufzeit und Kurve wie der Ring). p: 0 beim Gegner, 1 am Spieler.
   */
  drawSchallwelle(g, target, p, near) {
    const from = this.enemyCenter();
    const x = from.x + (target.x - from.x) * p;
    const y = from.y + (target.y - from.y) * p;
    const color = near ? 0xffffff : 0x9fd8ff;
    for (let i = 0; i < 3; i++) {
      const r = 10 + i * 7 + (1 - p) * 8;
      g.lineStyle(near ? 3 : 2, color, (0.95 - i * 0.25) * (0.4 + 0.6 * p));
      g.beginPath();
      g.arc(x + i * 6, y, r, Math.PI * 0.7, Math.PI * 1.3); // nach links offen: die Welle läuft auf den Spieler zu
      g.strokePath();
    }
  }

  playerCenter(n = null) {
    const p = n ? this.players?.[n] ?? this.player : this.player;
    return { x: p?.homeX ?? PLAYER_X, y: (p?.homeY ?? GROUND_Y + 14) - 44 };
  }

  /** Spieler n rückt in den Mittelpunkt: Animationen, Ringe und Zahlen gelten ihm. */
  focusPlayer(n) {
    this.player = this.players[n] ?? this.players[1];
    this.ui.combatRefresh();
  }

  /** Kurzer Name für Meldungen zu zweit. */
  who(n) {
    return this.combat.duo ? `Spieler ${n}` : 'Du';
  }

  /** Mitte eines Gegners (i: Platz in der Gruppe, sonst der aktuelle). */
  enemyCenter(i = null) {
    const e = i === null ? this.enemy : this.enemies?.[i];
    return { x: e?.homeX ?? ENEMY_X, y: (e?.homeY ?? GROUND_Y + 14) - 44 };
  }

  /** who: 'enemy' (aktueller Gegner), eine Zahl (Gegner dieses Platzes) oder sonst der Spieler im Mittelpunkt. */
  float(text, who, cls = '') {
    if (who === 'enemy' || typeof who === 'number') {
      const p = this.enemyCenter(typeof who === 'number' ? who : null);
      this.ui.combatFloat(text, (p.x / VIEW_W) * 100, ((p.y - 30) / VIEW_H) * 100, cls);
      return;
    }
    // Zahlen stehen direkt über dem Kopf der getroffenen Figur; zu zweit mit Namensschild
    const spr = this.player;
    const x = spr?.homeX ?? PLAYER_X;
    const top = (spr?.homeY ?? GROUND_Y + 14) - (spr?.displayHeight || 72) - 6;
    const n = Number(Object.keys(this.players ?? {}).find((k) => this.players[k] === spr)) || 1;
    this.ui.combatFloat(text, (x / VIEW_W) * 100, (top / VIEW_H) * 100, cls, this.combat.duo ? `Sp. ${n}` : null);
  }

  flash(target) {
    if (this.phase !== 'over' && !target.downed) this.anim(target, 'hurt');
    target.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      if (target.foeTint !== undefined && target.foeTint !== null) target.setTint(target.foeTint);
      else if (target.baseTint) target.setTint(target.baseTint);
      else target.clearTint();
    });
  }

  /**
   * Pfad-Fähigkeit eines Beyonder-Gegners sichtbar machen: Name in Pfadfarbe über dem Gegner,
   * kurzes Aufglühen der Figur und ein Ring, der sich ausbreitet.
   */
  pfadFx(name) {
    const b = this.combat.enemy?.beyonder;
    const hex = b?.color ?? '#c8b0e8';
    const col = Number.parseInt(hex.slice(1), 16);
    const p = this.enemyCenter();
    this.ui.combatFloat(name, (p.x / VIEW_W) * 100, ((p.y - 62) / VIEW_H) * 100, 'pfad', null, hex);
    const e = this.enemy;
    if (e && !e.downed) {
      e.setTint(col);
      this.time.delayedCall(420, () => {
        if (e.foeTint !== undefined && e.foeTint !== null) e.setTint(e.foeTint);
        else if (e.baseTint) e.setTint(e.baseTint);
        else e.clearTint();
      });
    }
    const ring = this.add.graphics().setDepth(49);
    const fx = { r: 10, a: 0.9 };
    this.tweens.add({
      targets: fx, r: 70, a: 0, duration: 520, ease: 'Sine.out',
      onUpdate: () => { ring.clear(); ring.lineStyle(3, col, fx.a).strokeCircle(p.x, p.y, fx.r); },
      onComplete: () => ring.destroy(),
    });
  }

  // --- Ablauf ------------------------------------------------------------------

  /**
   * Tastendruck aus der Oberfläche: 'confirm' | 'dodge' | 'parry'. who: welcher Spieler gedrückt hat.
   * Zu zweit zählt der Takt nur für den, der am Zug ist, und die Abwehr nur für den Angegriffenen.
   */
  onKey(kind, who = 1) {
    const t = now();
    const c = this.combat;
    if (this.phase === 'intro' && kind !== 'parry') {
      // Hinterhalt (Wexmoor): der Gegner schlägt zu, bevor das Menü aufgeht
      if (c.ambush() && !this.ambushShown) {
        this.ambushShown = true;
        this.phase = 'anim';
        this.ui.combatMessage(`Hinterhalt! ${c.enemy.name} ist schneller als du.`);
        this.time.delayedCall(700, () => this.enemyTurn());
        return true;
      }
      this.toMenu(); return true;
    }
    if (this.phase === 'qte' && (kind === 'confirm' || kind === 'dodge')) {
      if (!c.duo || who === c.actor) this.pressQte(t);
      return true;
    }
    if (this.phase === 'enemy' && (kind === 'dodge' || kind === 'parry')) {
      if (!c.duo || c.targets.includes(who)) this.pressDefense(kind, t, c.duo ? who : c.target);
      return true;
    }
    if (this.phase === 'over' && kind !== 'parry') { this.leave(); return true; }
    return false;
  }

  toMenu() {
    this.combat.focusAim(); // Gruppen: Werte und Anzeige zeigen wieder das Ziel
    this.phase = 'menu';
    this.focusPlayer(this.combat.actor);
    this.ui.combatMenu();
    this.ritualArt?.menu();
  }

  /** Aus dem Menü: { type: 'skill', id } | { type: 'item', id } | { type: 'flee' } */
  choose(action) {
    if (this.phase !== 'menu') return;
    const c = this.combat;
    if (action.type === 'skill') {
      if (!c.canUse(action.id)) return;
      c.healTarget = action.target ?? null; // Moor im Koop: gewähltes Heilziel
      this.startQte(action.id);
    } else if (action.type === 'item') {
      const r = c.useItem(action.id);
      if (!r) return;
      this.ui.combatMessage(r.text);
      this.ui.combatRefresh();
      if (!this.anim(this.player, 'item')) this.flash(this.player);
      const used = c.state.item(action.id);
      if (c.rules?.potionOnly) this.sfx(kesselWurfSound(action.id, used)); // DS (Kessel): Druckstoß, Eis oder Glut
      if (!this.ritualArt?.item(action.id, used)) this.hitFx(used.damage ? 'item' : used.composure ? 'nerves' : 'heal', used.damage ? 'enemy' : 'player');
      if (c.state.item(action.id).damage) { this.flash(this.enemy); this.float(`-${c.state.item(action.id).damage * (c.enemy.occult ? 2 : 1)}`, 'enemy', 'dmg'); }
      this.phase = 'anim';
      this.time.delayedCall(600, () => this.afterAction(false));
    } else if (action.type === 'spare' || action.type === 'mark') { // Seq 4: Maske verschont, Faden markiert
      const r = action.type === 'spare' ? c.spare() : c.markFate();
      if (!r) return;
      this.ui.combatMessage(r.text);
      this.ui.combatRefresh();
      if (action.type === 'spare') { const wait = this.ritualArt?.spare() ?? 0; this.phase = 'anim'; this.time.delayedCall(wait, () => this.over()); return; }
      this.ritualArt?.mark();
      this.float('Schicksalsfaden', 'enemy', 'good');
      this.toMenu();
    } else if (action.type === 'voice') { // Seq-5-Ritual des Echos: verschonen und die Stimme rauben
      const r = c.stealVoice();
      if (!r) return;
      this.ui.combatMessage(r.text);
      this.ui.combatRefresh();
      this.over();
    } else if (action.type === 'end') {
      this.phase = 'anim';
      this.afterPlayer();
    } else if (action.type === 'flee') {
      if (!c.flee()) { this.ui.combatMessage('Kein Entkommen. Der Weg nach oben ist versperrt.'); return; }
      if (c.outcome) { this.over(); return; }
      // Starker Gegner: der Rückzug läuft, der Zug ist vorbei, der Gegner setzt nach
      this.float('Rückzug!', 'player', 'good');
      this.ui.combatMessage(c.fleeStartText());
      this.ui.combatRefresh();
      this.phase = 'anim';
      this.time.delayedCall(900, () => this.afterPlayer());
    }
  }

  // Angriff im Takt: ein Zeiger läuft über die Leiste, im goldenen Bereich drücken.
  startQte(skillId) {
    const sk = this.combat.skillDef(skillId);
    const bars = skillBars(sk);
    if (!bars) { this.qte = { skillId, grades: [] }; this.phase = 'anim'; this.resolveSkill(); return; }
    this.phase = 'qte';
    // Präzise Fertigkeiten (Betäubung, große Wucht): das goldene Fenster ist nur ein Fünftel so breit
    const precise = isPrecise(sk);
    // `window` in den Fertigkeitsdaten vergrößert das ganze Fenster (Gold + Silber), z. B. Kehlschnitt 1.1
    this.qte = { skillId, grades: [], total: bars, bar: null, precise, win: sk.window || 1 };
    const keys = !this.combat.duo ? (this.combat.alsP2 ? (this.splitHalf ? 'Enter' : 'Enter oder E') : 'E oder Leertaste') : this.combat.actor === 2 ? 'Enter (Gamepad A)' : 'E oder Leertaste';
    this.ui.combatMessage(`${this.combat.duo ? `${this.who(this.combat.actor)}, ` : ''}${sk.name}: Drücke ${keys}, wenn der Zeiger im goldenen Bereich ist, im roten Kern trifft es meisterhaft.${precise ? ` Nur ein präziser Treffer ${sk.stun ? 'betäubt' : 'entfaltet die volle Wucht'}.` : ''}`);
    this.nextBar();
  }

  nextBar() {
    const i = this.qte.grades.length;
    const center = 0.55 + Math.random() * 0.3;
    this.qte.bar = { start: now() + 250, dur: i === 0 ? 950 : 750, zone: { center, meister: 0.045 * MEISTER_WINDOW, perfect: 0.045 * (this.qte.precise ? PRECISE_WINDOW : 1) * this.qte.win, good: 0.13 * this.qte.win }, done: false };
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
    this.float({ meister: 'Meisterhaft!', perfect: 'Präzise!', good: 'Treffer', miss: 'Daneben' }[grade], 'player', grade === 'meister' ? 'perfect' : grade);
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
    this.ritualArt?.skill(skillId);
    this.sfx(ritualSkillSound(skillId, sk, c.rules) ?? skillSound(sk, c.on(c.actor, () => this.state.pathway?.id))); // Y: Pfadklang (Licht, Salz, Glocke, Geist, Feuer, Schwächung); DS: Schattenattacke, Faust der Maske
    const struck = r.per.map((p) => p.i); // getroffene Gegner (Flächenfertigkeit: alle)
    const stunNote = r.stunned ? (r.aoe ? ' Die Gegner setzen eine Runde aus.' : ` ${c.enemy.name} setzt eine Runde aus.`) : '';
    if (!sk.hits) {
      if (!this.castAnim()) this.flash(this.player);
      this.skillFx(skillId, r.aoe ? struck : null);
      if (sk.heal) this.hitFx('heal', 'player');
      this.float(sk.name, 'player', isPerfectGrade(grades[0]) ? 'perfect' : 'good');
      if (r.stunned || r.aoe) for (const i of struck) this.flash(this.enemies[i]);
      this.ui.combatMessage(`${sk.name}: ${r.effects.join(', ') || 'wirkt'}.${stunNote}`);
      this.ui.combatRefresh();
      this.time.delayedCall(700, () => this.afterAction(c.endsTurn(skillId)));
      return;
    }
    if (SKILL_FX[this.fxId(skillId)]) { this.castAnim(); this.skillFx(skillId, r.aoe ? struck : null); } else this.attackAnim();
    const blade = c.on(c.actor, () => this.state.weapon) === 'stockdegen';
    const main = this.enemies[r.main] ?? this.enemy;
    this.tweens.add({
      targets: this.player, x: main.homeX - 50, duration: 160, yoyo: true, ease: 'Quad.out',
      onYoyo: () => {
        for (const p of r.per) {
          p.hits.forEach((h, k) => this.time.delayedCall(k * 140, () => {
            this.flash(this.enemies[p.i]);
            this.hitFx(h.grade === 'miss' ? 'miss' : isPerfectGrade(h.grade) ? 'critical' : blade ? 'slash' : 'blunt', p.i);
            this.float(`-${h.damage}`, p.i, isPerfectGrade(h.grade) ? 'crit' : 'dmg');
          }));
        }
        this.cameras.main.shake(r.aoe ? 140 : 90, r.aoe ? 0.008 : 0.006);
      },
    });
    let msg = `${sk.name}: ${r.total} Schaden.`;
    if (r.effects.length) msg += ` ${r.effects.join(', ')}.`;
    if (r.stunned) msg += r.aoe ? stunNote : ` ${c.enemy.name} ${skillId === 'blind' ? 'ist geblendet und ' : ''}setzt aus.`;
    if (skillId === 'blind' && r.stunMissed) msg += ' Die Blende verfehlt ihr Ziel.';
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
    // Zu zweit: nach Spieler 1 ist Spieler 2 dran, erst danach der Gegner
    if (this.combat.passTurn()) { this.time.delayedCall(250, () => this.toMenu()); return; }
    const wait = this.transform();
    this.time.delayedCall(350 + wait, () => this.enemyTurn());
  }

  /** Paket I: Sektenoberhäupter verwandeln sich in Rage in ihre große Gestalt. Liefert die Dauer in ms. */
  transform() {
    // Gruppen: Phasenwechsel und Verwandlung gehören dem Gegner, der sie auslöst (Verwandlung nur der stehende Anführer)
    const c = this.combat;
    const phased = c.foes.findIndex((f) => f.phaseNote);
    if (phased >= 0) c.fi = phased;
    else if (c.group) { if (c.foes[0].enemy.hp <= 0) return 0; c.fi = 0; }
    // Codex DR: Zwischenruf des Schwellenwächters (beim Echo nur, was man sieht)
    if (this.combat.rufNote && !this.combat.phaseNote) {
      const note = this.combat.rufNote;
      this.combat.rufNote = null;
      this.ui.combatMessage(note.say ? `${this.combat.enemy.name}: „${note.text}“` : note.text);
      return 700;
    }
    // BQ: zweite Phase eines Sektenhaupts: Meldung, Ruck durchs Bild, eigene Reihe `phase2` im Sheet
    if (this.combat.phaseNote) {
      const note = this.combat.phaseNote;
      this.combat.phaseNote = null;
      this.cameras.main.shake(250, 0.005);
      this.float('Zweite Phase!', 'enemy', 'crit');
      this.ui.combatMessage(note);
      if (!this.anim(this.enemy, 'phase2')) this.idle(this.enemy);
      return 900;
    }
    const sheet = BOSS_FORMS[this.encounterId];
    if (!sheet || this.transformed || !this.combat.enraged() || !this.textures.exists(sheet) || !this.enemySheet) return 0;
    this.transformed = true;
    this.enemySheet = sheet;
    this.enemy.setTexture(sheet, 0).setOrigin(0.5, this.sheetOriginY(sheet)).setScale(1.2);
    this.cameras.main.shake(300, 0.006);
    this.cameras.main.flash(200, 120, 60, 40);
    this.float('Verwandlung!', 'enemy', 'crit');
    if (!this.anim(this.enemy, 'phase2')) this.idle(this.enemy);
    // Paket J: die Kulisse bricht auf, die Büste der neuen Gestalt blitzt auf
    const bg = BOSS_FORM_BACKGROUNDS[this.encounterId];
    if (bg && this.bgImage && this.textures.exists(bg)) this.bgImage.setTexture(bg);
    const [bust] = BOSS_FORM_INTROS[this.encounterId] ?? [];
    if (bust && this.textures.exists(bust)) {
      const img = this.add.image(VIEW_W - 90, 135, bust).setDepth(91).setScale(0.75).setAlpha(0);
      this.tweens.add({ targets: img, alpha: 1, duration: 200, yoyo: true, hold: 700, onComplete: () => img.destroy() });
    }
    return 900;
  }

  // Gegnerzug: Ankündigung, dann ein Ring pro Schlag. Leertaste weicht aus, F pariert.
  enemyTurn() {
    this.ui.combatTurn?.('enemy');
    const c = this.combat;
    const atk = c.nextEnemyAttack();
    if (!atk) {
      if (c.selfHit) {
        this.ui.combatMessage(`${c.enemy.name} schlägt verwirrt nach einem Trugbild und trifft sich selbst: ${c.selfHit} Schaden.`);
        this.flash(this.enemy);
        this.float(`-${c.selfHit}`, 'enemy', 'dmg');
        c.selfHit = 0;
        this.ui.combatRefresh();
        this.time.delayedCall(900, () => (c.outcome ? this.over() : this.afterStrike()));
        return;
      }
      if (c.lastAction) {
        // Kniff der Sekten: Panzer, Heilung, Schleier, Einschüchterung
        const a = c.lastAction;
        this.sfx(combatSound('act', a));
        if (a.pfad && !c.rules?.deaf) this.pfadFx(a.name);
        this.ui.combatMessage(a.pfad && c.enemy.beyonder ? `${c.enemy.name}: ${a.name}\n\n✦ Pfadfähigkeit · ${c.enemy.beyonder.pfad}\n${a.text}` : `${c.enemy.name}: ${a.name}\n\n${a.text}`);
        const float = { guard: [`Panzer +${a.value}`, 'good'], heal: [`+${a.value}`, 'good'], veil: ['Schleier', 'miss'], taunt: [`-${a.value} Nerven`, 'hurt'], drain: [`-${a.value} Konzentration`, 'hurt'] }[a.action];
        if (a.action === 'taunt' || a.action === 'drain') this.focusPlayer(c.target);
        if (float) this.float(float[0], a.action === 'taunt' || a.action === 'drain' ? 'player' : 'enemy', float[1]);
        if (a.action === 'drain' && a.healed) this.float(`+${a.healed}`, 'enemy', 'good');
        this.anim(this.enemy, 'special');
        this.ui.combatRefresh();
        this.time.delayedCall(1100, () => this.afterStrike());
        return;
      }
      this.ui.combatMessage(`${c.enemy.name} taumelt und greift nicht an.`);
      this.time.delayedCall(900, () => this.afterStrike());
      return;
    }
    this.phase = 'enemy';
    this.attack = atk;
    this.focusPlayer(c.target);
    this.sfx(combatSound('telegraph')); // Y: Warnsignal, der Gegner holt aus
    const t0 = now() + TELEGRAPH;
    // Jeder Schlag hat je Getroffenem ein eigenes Ergebnis (Flächenangriff: beide wehren denselben Ring ab)
    this.hits = atk.hits.map((h, i) => ({
      impact: t0 + h, ring: atk.rings?.[i] ?? { curve: 'linear', lead: RING_LEAD },
      by: Object.fromEntries(c.targets.map((n) => [n, { result: null, applied: false }])),
    }));
    const deaf = !!c.rules?.deaf; // Seq 4 (Echo): keine Ankündigung, kein Hinweis
    const tags = deaf ? '' : [atk.sweep ? '⚠ Flächenangriff: trifft beide!' : '', atk.unparryable ? '⚠ nicht parierbar, ausweichen!' : '', atk.enraged ? 'in Rage' : '', atk.followup ? 'setzt nach!' : '', atk.bleed ? 'Treffer bluten nach' : '', atk.nerves ? `Treffer kosten ${atk.nerves} Nerven` : ''].filter(Boolean).join(' · ');
    const evading = c.targets.every((n) => c.fighters[n].evading);
    const dodge = (n) => c.on(n, () => c.dodgeCost());
    const help1 = `Spieler 1 · Leertaste: ausweichen (${dodge(1)} Nerven) · F: parieren`;
    const help2 = `Spieler 2 · ←: ausweichen (${dodge(2)} Nerven) · →: parieren (Gamepad X / B)`;
    const help = !c.duo ? (c.alsP2 ? (this.splitHalf ? `←: ausweichen (${dodge(1)} Nerven) · →: parieren` : `Leertaste oder ←: ausweichen (${dodge(1)} Nerven) · F oder →: parieren`) : `Leertaste: ausweichen (${dodge(1)} Nerven) · F: parieren`)
      : atk.sweep ? `${help1}\n${help2}` : c.target === 2 ? help2 : help1;
    const whom = !c.duo ? '' : atk.sweep ? ' → beide Spieler' : ` → ${this.who(c.target)}`;
    if (deaf) this.ui.combatMessage(`${c.enemy.name} holt aus. Du hörst nichts, du siehst nur die Welle.`, help);
    else if (atk.pfad && c.enemy.beyonder) {
      this.pfadFx(atk.name);
      this.ui.combatMessage(`${c.enemy.name}: ${atk.name}${whom}${atk.hits.length > 1 ? ` (${atk.hits.length} Schläge)` : ''}\n\n✦ Pfadfähigkeit · ${c.enemy.beyonder.pfad}${tags ? `\n${tags}` : ''}${evading ? '\n\nDu weißt schon, wohin er schlägt.' : ''}`, help);
    } else this.ui.combatMessage(`${c.enemy.name}: ${atk.name}${whom}${atk.hits.length > 1 ? ` (${atk.hits.length} Schläge)` : ''}${tags ? `\n\n${tags}` : ''}${evading ? '\n\nDu weißt schon, wohin er schlägt.' : ''}`, help);
    this.tweens.add({ targets: this.enemy, x: this.enemy.homeX + 8, duration: TELEGRAPH * 0.6, ease: 'Sine.out' });
    if (atk.sweep) this.cameras.main.shake(TELEGRAPH * 0.5, 0.003); // der Boden bebt: gleich trifft es beide
    // Paket-B-Gegner haben zwei Angriffe: mehrteilige Attacken und Flächenangriffe nutzen 'special'
    if (!((atk.hits.length > 1 || atk.sweep) && this.anim(this.enemy, 'special'))) this.anim(this.enemy, 'attack');
    const efx = ENCOUNTER_FX[this.encounterId];
    if (efx) this.caseFx(atk.hits.length > 2 ? efx.multi ?? efx.attack : atk.hits.length === 1 && atk.damage >= 10 ? efx.heavy ?? efx.attack : efx.attack, 'player');
  }

  /** Abwehrdruck von Spieler n (allein: der Angegriffene). */
  pressDefense(kind, t, n = this.combat.target) {
    const hit = this.hits.find((h) => h.by[n] && !h.by[n].result && t >= h.impact - EARLY_LIMIT);
    if (!hit) return;
    const d = hit.by[n];
    d.result = judgeDefense(kind, t - hit.impact, this.combat.on(n, () => this.state.passive('dodge_window')), this.combat.parryWindow());
    d.perfect = isPerfectDodge(kind, t - hit.impact); // Seq 4 (Uhr): perfektes Ausweichen
    if (d.result === 'miss') d.early = t < hit.impact;
    else this.applyHit(hit, n);
  }

  /** Wendet einen Schlag auf Spieler n an (Flächenangriff: einmal je Getroffenem). */
  applyHit(hit, n = this.combat.target) {
    const d = hit.by[n];
    if (!d || d.applied) return;
    d.applied = true;
    this.player = this.players[n] ?? this.player; // Zahlen und Animationen am Getroffenen
    const errorsBefore = this.combat.dodgeErrors ?? 0;
    const r = this.combat.resolveHit(this.attack, d.result, n, !!d.perfect);
    d.result = r.result;
    this.ritualArt?.defense(r.result, !!d.perfect, r.note, errorsBefore);
    if (this.combat.rules?.uhr && d.perfect && r.result === 'dodge') this.float('Perfekt!', 'player', 'perfect');
    if (!this.attack?.sweep || n === this.combat.target) this.tweens.add({ targets: this.enemy, x: this.player.homeX + 70, duration: 90, yoyo: true, ease: 'Quad.in' });
    if (d.result === 'parry') {
      this.float('Parade!', 'player', 'perfect');
      this.bark('koop_parade', n);
      this.anim(this.player, 'parry');
      this.hitFx('parry', 'player');
      this.time.delayedCall(90, () => { this.flash(this.enemy); this.float(`-${r.counter}`, 'enemy', 'dmg'); });
      this.cameras.main.flash(60, 255, 240, 200);
    } else if (d.result === 'dodge') {
      if (r.note === 'imperfect') this.float('Nicht perfekt', 'player', 'miss');
      else this.float('Ausgewichen', 'player', 'good');
      this.anim(this.player, 'dodge');
      this.hitFx('dodge', 'player');
      this.tweens.add({ targets: this.player, x: this.player.homeX - 26, duration: 110, yoyo: true, ease: 'Quad.out' });
    } else {
      const struck = this.player; // bei Flächenangriffen wechselt this.player vor Ablauf der Verzögerung
      this.time.delayedCall(90, () => { this.player = struck; this.flash(struck); if (r.damage) this.hitFx('blunt', 'player'); this.float(r.damage ? `-${r.damage}` : 'Abgefangen', 'player', r.damage ? 'hurt' : 'good'); if (r.damage) this.cameras.main.shake(120, 0.01); });
      if (d.early) this.float('Zu früh', 'player', 'miss');
      else if (r.note === 'unparryable') this.float('Nicht parierbar!', 'player', 'miss');
      else if (r.note === 'exhausted') this.float('Erschöpft', 'player', 'miss');
      else if (r.note === 'forbidden') this.float('Verboten!', 'player', 'miss');
      if (r.down && !this.combat.outcome) this.knockedOut(this.player);
      if (r.rescued) this.time.delayedCall(260, () => this.float('Der Torf hält!', 'player', 'perfect'));
    }
    this.ui.combatRefresh();
  }

  /** Zu zweit: ein Spieler bleibt liegen, der andere kämpft weiter. */
  knockedOut(sprite) {
    if (sprite.downed) return;
    sprite.downed = true;
    this.bark('koop_partner_ko', null, true);
    this.time.delayedCall(200, () => {
      if (!this.anim(sprite, 'defeated', false)) this.tweens.add({ targets: sprite, angle: -90, y: '+=4', duration: 500 });
      sprite.setAlpha(0.7);
      this.float('K.o.!', 'player', 'miss');
    });
    const n = Number(Object.keys(this.players).find((k) => this.players[k] === sprite));
    this.ui.combatMessage(`${this.who(n)} geht zu Boden! ${this.who(n === 1 ? 2 : 1)} muss den Kampf allein beenden.`);
  }

  finishEnemyTurn() {
    const c = this.combat;
    this.phase = 'anim';
    // Wer alle Schläge pariert hat, setzt zum Gegenschlag an (Flächenangriff: jeder für sich)
    const parried = c.targets.filter((n) => !c.fighters[n].down && this.hits.every((h) => h.by[n]?.result === 'parry'));
    c.endEnemyTurn();
    this.tweens.add({ targets: this.enemy, x: this.enemy.homeX, duration: 200 });
    if (parried.length && !c.outcome) {
      const dmgs = parried.map((n) => c.riposte(n));
      const total = dmgs.reduce((a, b) => a + b, 0);
      this.ui.combatMessage(parried.length > 1 ? `Beide parieren alles! Doppelter Gegenschlag: ${total} Schaden.` : `Alles pariert! Gegenschlag: ${total} Schaden.`);
      if (parried.length > 1) this.bark('koop_kombi', null, true);
      parried.forEach((n, i) => {
        const spr = this.players[n];
        this.player = spr;
        this.attackAnim(n);
        this.tweens.add({
          targets: spr, x: this.enemy.homeX - 50 - i * 18, duration: 140, yoyo: true, delay: i * 160,
          onYoyo: () => { this.flash(this.enemy); this.hitFx('critical', 'enemy'); this.float(`-${dmgs[i]}`, 'enemy', 'crit'); this.cameras.main.shake(120, 0.008); },
        });
      });
      this.ui.combatRefresh();
      this.time.delayedCall(800 + (parried.length - 1) * 160, () => this.afterStrike());
      return;
    }
    this.time.delayedCall(400, () => this.afterStrike());
  }

  /** Zu zweit greift der Gegner danach noch den anderen Spieler an, sonst ist die Runde vorbei. */
  afterStrike() {
    if (this.combat.outcome) { this.over(); return; }
    if (this.combat.moreStrikes()) { this.time.delayedCall(250, () => this.enemyTurn()); return; }
    this.endRound();
  }

  endRound() {
    this.ui.combatRefresh();
    if (this.combat.outcome) { this.over(); return; }
    const dot = this.combat.endRound();
    this.ritualArt?.round();
    if (this.combat.outcome === 'fled') { this.ui.combatRefresh(); this.over(); return; } // Rückzug durchgehalten
    const bleed = this.combat.bleedTick;
    if (this.combat.drainTick) { this.focusPlayer(this.combat.actor); this.float(`-${this.combat.drainTick} Nerven`, 'player', 'hurt'); }
    if (this.combat.regenTick) { this.focusPlayer(this.combat.actor); this.float(`+${this.combat.regenTick} Nerven`, 'player', 'good'); }
    for (const [n, f] of Object.entries(this.combat.fighters)) {
      if (!f.bleedTick && !f.focusTick && !f.focusGain) continue;
      this.focusPlayer(Number(n));
      if (f.bleedTick || f.focusTick) this.flash(this.player);
      if (f.bleedTick) this.float(`-${f.bleedTick}`, 'player', 'hurt');
      if (f.focusTick) this.float(`-${f.focusTick} (Konzentration)`, 'player', 'hurt'); // Fluch ap_burn
      if (f.focusGain) this.float(`+${f.focusGain} K`, 'player', 'good'); // Segen ap_round
      if (f.down) this.knockedOut(this.player);
    }
    if (dot || bleed) {
      for (const d of this.combat.dots ?? []) { this.flash(this.enemies[d.i]); this.float(`-${d.dmg}`, d.i, 'dmg'); }
      this.ui.combatRefresh();
      this.ui.combatMessage([dot ? (this.combat.dots?.length > 1 ? `Brand und Gift fressen an den Gegnern: ${dot} Schaden.` : `${this.combat.withFoe(this.combat.dots?.[0]?.i ?? this.combat.fi, () => this.combat.enemy.name)} leidet unter Brand und Gift: ${dot} Schaden.`) : '', bleed ? `${this.combat.duo ? 'Wunden bluten' : 'Deine Wunde blutet'}: ${bleed} Schaden.` : ''].filter(Boolean).join('\n\n'));
      this.time.delayedCall(700, () => (this.combat.outcome ? this.over() : this.toMenu()));
      return;
    }
    this.toMenu();
  }

  over() {
    this.phase = 'over';
    const c = this.combat;
    this.sfx(combatSound('over', { id: this.encounterId, outcome: c.outcome }));
    this.registry.get('music')?.cue?.(combatCue(c.outcome, c.enc)); // Z: Bosssieg und Flucht als Ereignisstück
    // Menschen (z. B. Holt beim Training) geben auf und bleiben stehen, Wesen vergehen (foeDown); in Gruppen jeder, der noch stand
    if (c.outcome === 'won') for (const e of this.enemies) this.foeDown(e);
    c.fi = 0; // Siegesfolgen und Effekte gehören dem Anführer
    if (c.outcome === 'won') for (const n of c.standing()) playBattleAnim(this.players[n], 'victory', null, this.sheetsOf(this.players[n]).weapons);
    if (c.outcome === 'won') {
      const efx = ENCOUNTER_FX[this.encounterId];
      this.caseFx(efx?.won, 'enemy');
      if (efx?.after) this.time.delayedCall(700, () => this.caseFx(efx.after, 'enemy', 1));
    }
    if (c.outcome === 'lost' && !this.anim(this.player, 'defeated', false)) this.tweens.add({ targets: this.player, angle: -90, y: '+=4', duration: 500 });
    if (c.outcome !== 'lost') for (const n of c.standing()) this.players[n].setAlpha(1);
    if (c.outcome === 'won') {
      const close = Object.keys(c.fighters).map(Number).some((n) => c.fighters[n].down || this.state.playerView(n).hp <= this.state.playerView(n).maxHp * 0.25);
      this.bark(close ? 'koop_knapper_sieg' : 'koop_sieg', null, true);
    } else if (c.outcome === 'fled') this.bark('koop_flucht', null, true);
    if (c.outcome === 'escaped') this.tweens.add({ targets: this.enemy, alpha: 0, x: '-=40', duration: 600 }); // BD: der Gegner macht sich davon
    if (c.outcome === 'spared') this.tweens.add({ targets: this.enemy, y: '+=6', angle: -8, duration: 700 }); // verschont: sackt zusammen, bleibt sichtbar (er lebt)
    const title = { won: 'Sieg', lost: 'Ohnmacht', fled: 'Rückzug', escaped: 'Entkommen', spared: 'Verschont' }[c.outcome];
    this.ui.combatOver(title);
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    const result = this.combat.finish({ deferLoot: this.deferLoot, noLoot: this.noLoot });
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

  /** Gruppen: gefallene Gegner abräumen, Zielmarke (Gold) im Menü und Takt, Angreifermarke (Rot) im Gegnerzug. */
  drawFoeMarks(g) {
    const c = this.combat;
    this.enemies.forEach((e, i) => {
      if (c.foes[i].enemy.hp <= 0 && !e.downed && this.phase !== 'over') this.foeDown(e);
      e.shadow?.setPosition(e.x, e.homeY);
    });
    const mark = this.phase === 'menu' || this.phase === 'qte' ? [c.aim, 0xffd890] : this.phase === 'enemy' ? [c.fi, 0xe05050] : null;
    const e = mark && this.enemies[mark[0]];
    if (!e || e.downed) return;
    const top = e.homeY - 88 + Math.sin(this.time.now * 0.008) * 2; // über dem Kopf (Sheets haben viel Leerraum, darum fest)
    g.fillStyle(0x000000, 0.6).fillTriangle(e.homeX - 6, top - 7, e.homeX + 6, top - 7, e.homeX, top + 1);
    g.fillStyle(mark[1], 1).fillTriangle(e.homeX - 4, top - 6, e.homeX + 4, top - 6, e.homeX, top - 1);
  }

  update(time, delta) {
    // Die Spielzeit läuft im Kampf weiter (Seb 2026-11-12); nur im Pausenmenü o. Ä. steht sie
    if (this.ui.modal === 'combat' && delta > 0) this.state.tickClock(Math.min(delta, 250) / 1000);
    const t = now();
    const g = this.gfx;
    g.clear();
    this.fog.tilePositionX += 0.15;
    const lead = this.enemies?.[0];
    if (this.siegel && lead) this.siegel.setPosition(lead.x, lead.y + this.siegelOffset).setAlpha(lead.alpha).setVisible(lead.visible);
    if (this.stars && this.combat.round !== this.starRound) this.updateStars();
    if (this.combat.group) this.drawFoeMarks(g);

    if (this.phase === 'qte' && this.qte?.bar) {
      const b = this.qte.bar;
      const { x, y, w, h } = BAR;
      const z = b.zone;
      g.fillStyle(0x000000, 0.6).fillRect(x - 2, y - 2, w + 4, h + 4);
      g.fillStyle(0x3a3d48, 1).fillRect(x, y, w, h);
      g.fillStyle(0x8a6a2a, 1).fillRect(x + (z.center - z.good) * w, y, z.good * 2 * w, h);
      g.fillStyle(0xffd890, 1).fillRect(x + (z.center - z.perfect) * w, y, z.perfect * 2 * w, h);
      if (z.meister) g.fillStyle(0xd8402a, 1).fillRect(x + (z.center - z.meister) * w, y, Math.max(2, z.meister * 2 * w), h); // Meistertreffer: roter Kern
      const pos = b.done ? null : this.qtePos(t);
      if (pos !== null && t >= b.start) {
        g.fillStyle(0xffffff, 1).fillRect(x + pos * w - 1, y - 4, 2, h + 8);
        if (pos >= 1) this.gradeBar('miss');
      }
    }

    if (this.phase === 'enemy') {
      // Ein Ring je Getroffenem (Flächenangriff: über beiden Spielern zugleich)
      const deaf = !!this.combat.rules?.deaf; // Seq 4 (Echo): keine Angriffskreise
      for (const n of this.combat.targets) {
        const c = this.playerCenter(n);
        if (!deaf) g.lineStyle(1, 0xffffff, 0.35).strokeCircle(c.x, c.y, 16);
        for (const hit of this.hits) {
          const d = hit.by[n];
          if (!d || d.applied) continue;
          const left = hit.impact - t;
          if (d.result === 'miss' && left <= 0) { this.applyHit(hit, n); continue; }
          if (!d.result && left < -WINDOW.dodge) { d.result = 'miss'; this.applyHit(hit, n); continue; }
          const lead = hit.ring.lead;
          if (left > lead || d.result) continue;
          const u = Math.min(1, Math.max(0, 1 - left / lead));
          const closed = (RING_CURVES[hit.ring.curve] ?? RING_CURVES.linear)(u);
          const near = Math.abs(left) <= this.combat.parryWindow();
          if (deaf) { this.drawSchallwelle(g, c, closed, near); continue; } // Seq 4 (Echo, Seb 2026-11-18): Schallwelle statt Ring
          const r = 16 + Math.max(0, 1 - closed) * 60;
          const color = this.attack?.unparryable ? (near ? 0xff70ff : 0xa040e0) : near ? 0xffd890 : 0xe05050;
          g.lineStyle(this.attack?.unparryable ? 3 : 2, color, 0.95).strokeCircle(c.x, c.y, r);
        }
      }
      if (this.hits.every((h) => Object.values(h.by).every((d) => d.applied))) this.finishEnemyTurn();
    }
  }
}
