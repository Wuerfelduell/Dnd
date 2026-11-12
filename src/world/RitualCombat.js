// Codex DN (Seq-4-Rituale), DO (Schattensteuerung), DQ (Seq 5): Ritualgrafiken im Kampfbildschirm.
// CombatScene ruft die Haken; die Regeln selbst stehen in core/Combat.js (combat.rules aus Seq4.seq4CombatRules).
// Fehlt ein Bild, bleibt alles beim Alten (hasArt/ritualFx liefern dann false bzw. null).
import { hasArt, ritualFx, ritualImage, artFrame, artRegion } from './ritualArt.js';
import { kesselWurfSound } from '../core/sounds.js';
import { TRAUM_ID } from '../core/Seq4.js';

/** Kampfkulisse eines Rituals (Traum des Fadens, Schattenseite des Schlüssels) oder null. */
export function ritualBackground(scene, combat) {
  const r = combat?.rules;
  const key = combat?.id === TRAUM_ID || r?.dream ? 'bg_s4fa_traum' : r?.shadow ? 'bg_schattenseite' : null;
  return key && hasArt(scene, key) ? key : null;
}

/** Welches Ritual-Kampfblatt trägt Spieler n? 'shadow' (Schlüssel), 'zivil' (Maske) oder null. */
export function ritualLook(state, combat, n) {
  if (combat?.rules?.shadow) return 'shadow';
  return state.withPlayer?.(n, () => (state.seq4Masked?.() ? 'zivil' : null), { quiet: true }) ?? null;
}

const ICON_Y = 96; // links über der Spielerfigur, frei von Meldungsfeld und Lebensleiste

export class RitualCombat {
  constructor(scene) {
    this.scene = scene;
    this.hud = [];
    this.loops = [];
    this.rollShown = null;
  }

  get c() { return this.scene.combat; }

  /** Nach dem Aufbau der Bühne: Dauer-Überlagerungen und die Regel-Leiste. */
  start() {
    const sc = this.scene;
    const r = this.c.rules;
    if (!r) return;
    const e = sc.enemyCenter();
    // Faden: die Traumgegner hängen an Fäden; im Traum heilt nichts
    if (r.dream) this.loop(ritualFx(sc, 's4fa_traumschleier', e.x, e.y, { loop: true, follow: sc.enemy, dy: -sc.enemy.displayHeight * 0.45, depth: 12, scale: Math.max(1, sc.enemy.displayHeight / 64) }));
    // Echo: entsättigter Rand während der ganzen Taubheit
    if (r.deaf) this.loop(ritualFx(sc, 's4ec_taub_rand', 0, 0, { screen: true, loop: true, depth: 45 }));
    // Eisen: der Boden reißt unter der Last; Nietring schützt den Wächter bis Runde 6
    if (r.noDodge) {
      const p = sc.players[1];
      this.loop(ritualFx(sc, 's4ei_ueberlast_kampf', p.x, p.y - 8, { loop: true, depth: 9, scale: 1.5 }));
    }
    if (r.minKillRound) this.shield = ritualFx(sc, 's4ei_waechter_unsterblich', e.x, e.y, { loop: true, depth: 12, alpha: 0.85 });
    // Maske: der Handschuh fällt vor dem Gegner (nicht beim Wächter)
    if (r.spare) sc.time.delayedCall(450, () => ritualFx(sc, 's4ma_herausforderung', sc.enemy.x - 30, sc.enemy.y - 12, { depth: 31, scale: 1.5 }));
    this.refresh();
  }

  loop(o) { if (o) this.loops.push(o); return o; }

  /** Regel-Leiste oben links im Kampf: Verbote und Zähler der laufenden Prüfung. */
  refresh() {
    const sc = this.scene;
    const c = this.c;
    const r = c?.rules;
    this.hud.forEach((o) => o.destroy());
    this.hud = [];
    if (!r) return;
    let x = 8;
    const add = (key, frame, opts = {}) => {
      const img = ritualImage(sc, key, frame, x, ICON_Y, { origin: [0, 0], depth: 60, ...opts });
      if (img) { this.hud.push(img); x += img.displayWidth + 3; }
      return img;
    };
    const bar = (frameKey, iconKey, n, on, offName, onName) => {
      if (!hasArt(sc, frameKey) || !hasArt(sc, iconKey)) return;
      const x0 = x;
      const fr = add(frameKey, 0);
      for (let i = 0; i < n; i++) {
        const rg = artRegion(frameKey, `slot_${i}`) ?? [4 + i * 18, 2, 16, 16];
        const f = artFrame(iconKey, i < on ? `${onName}_${i + 5}` : `${offName}_${i}`) ?? i;
        this.hud.push(sc.add.image(x0 + rg[0] + rg[2] / 2, ICON_Y + rg[1] + rg[3] / 2, iconKey, f).setDepth(61));
      }
      return fr;
    };
    if (r.noHeal && r.dream) add('s4fa_heilung_gesperrt', 0);
    if (r.shadow && hasArt(sc, 'schatten_hud')) {
      for (const name of ['no_healing', 'no_parry', 'no_equipment']) {
        const rg = artRegion('schatten_hud', name);
        if (!rg) continue;
        const img = sc.add.image(x, ICON_Y, 'schatten_hud').setOrigin(0).setCrop(rg[0], rg[1], rg[2], rg[3]).setDepth(60);
        img.x -= rg[0]; img.y -= rg[1];
        this.hud.push(img);
        x += rg[2] + 3;
      }
    }
    if (r.deaf && hasArt(sc, 's4ec_taub_hud')) {
      const rg = artRegion('s4ec_taub_hud', 'small') ?? [0, 0, 16, 16];
      const img = sc.add.image(x - rg[0], ICON_Y - rg[1], 's4ec_taub_hud').setOrigin(0).setCrop(...rg).setDepth(60);
      this.hud.push(img);
      x += rg[2] + 3;
    }
    if (r.onlyAttack) add('s4ma_gabe_verboten', 0, { scale: 0.75 });
    if (r.potionOnly) {
      add('s4ke_angriff_verboten', 0);
      bar('s4ke_hud_rahmen', 's4ke_hud', 5, (c.state.seq4?.().drunk ?? []).length, 'leer', 'getrunken');
    }
    if (r.noDodge) add('s4ei_ausweichen_verboten', 0);
    if (r.minKillRound) bar('s4ei_hud_rahmen', 's4ei_hud', r.minKillRound - 1, Math.min(r.minKillRound - 1, c.round - 1), 'offen', 'geschlagen');
    if (r.uhr === 'monster') {
      add('s4uh_monsterphase', 0);
      add('s4uh_hat_angegriffen', (c.enemyAttacks ?? 0) > 0 ? 1 : 0);
    } else if (r.uhr === 'guardian' && hasArt(sc, 's4uh_hud')) {
      for (let i = 0; i < 3; i++) add('s4uh_hud', i < (c.dodgeErrors ?? 0) ? 3 + i : i);
    }
  }

  /** Treffer-Effekt ersetzen: taub nur ein Staubring, der Schatten trifft mit Schattenfetzen. true = erledigt. */
  hitFx(kind, who) {
    const sc = this.scene;
    const r = this.c?.rules;
    if (!r || who !== 'enemy' || ['miss', 'heal', 'nerves', 'item'].includes(kind)) return false;
    const p = sc.enemyCenter();
    if (r.deaf) return !!ritualFx(sc, 's4ec_stille_treffer', p.x, p.y, { scale: 1.5 });
    if (r.shadow) return !!ritualFx(sc, 'schatten_attacke_treffer', p.x, p.y, { scale: 1.25 });
    return false;
  }

  /** Eigene Fertigkeit eingesetzt (resolveSkill). */
  skill(skillId) {
    const sc = this.scene;
    const c = this.c;
    const r = c?.rules;
    if (!r) return;
    if (r.shadow && skillId === 'attack') {
      const e = sc.enemyCenter();
      ritualFx(sc, 'schatten_attacke', e.x - 20, e.y, { scale: 1.5, depth: 31 });
    } else if (r.shadow && skillId === c.roundSkill) {
      const p = sc.playerCenter();
      ritualFx(sc, 'schatten_faehigkeit', p.x, p.y, { depth: 31 });
    }
    // Eisen: vor Runde 6 prallt jeder tödliche Schlag am Nietring ab
    if (r.minKillRound && c.round < r.minKillRound && c.enemy.hp <= 1) this.immune();
  }

  immune() {
    const e = this.scene.enemyCenter();
    ritualFx(this.scene, 's4r_waechter_immun', e.x, e.y, { depth: 32 });
  }

  /** Gegenstand benutzt: Wurfflaschen der Kessel-Prüfung platzen sichtbar. true = eigener Effekt gespielt. */
  item(id, it) {
    if (!it?.damage && !it?.burn && !it?.stun) return false;
    if (!this.c?.rules?.potionOnly && !/^(s4ke_|wurf_)/.test(id)) return false;
    const key = kesselWurfSound(id, it);
    const e = this.scene.enemyCenter();
    return !!(key && ritualFx(this.scene, key, e.x, e.y, { scale: key === 's4ke_wurf_glut' ? 1.5 : 1.25, depth: 31 }));
  }

  /** Maske: verschont, die Pfadaura bekommt Risse. Liefert die Wartezeit in ms. */
  spare() {
    const e = this.scene.enemyCenter();
    return ritualFx(this.scene, 's4ma_zweifel', e.x, e.y, { scale: 1.5, depth: 31 }) ? 900 : 0;
  }

  /** Faden: der Schicksalsfaden schlingt sich um das Wesen. */
  mark() {
    const e = this.scene.enemyCenter();
    ritualFx(this.scene, 's4fa_markieren', e.x, e.y, { scale: 1.5, depth: 31 });
  }

  /** Abwehr ausgewertet: Uhr perfekt/Fehler, Eisen verbotenes Ausweichen. */
  defense(result, perfect, note, errorsBefore) {
    const sc = this.scene;
    const r = this.c?.rules;
    if (!r) return;
    const p = sc.playerCenter();
    if (r.uhr && perfect && result === 'dodge') ritualFx(sc, 's4uh_perfekt', p.x, p.y, { depth: 31 });
    else if (r.uhr && (this.c.dodgeErrors ?? 0) > errorsBefore) ritualFx(sc, 's4uh_fehler', p.x, p.y, { depth: 31 });
    if (note === 'forbidden' && r.noDodge) {
      const icon = ritualImage(sc, 's4ei_ausweichen_verboten', 0, p.x, p.y - 40, { depth: 40, scale: 2 });
      if (icon) sc.tweens.add({ targets: icon, y: icon.y - 12, alpha: 0, duration: 900, onComplete: () => icon.destroy() });
    }
    this.refresh();
  }

  /** Rundenende: Eisen gibt den Wächter in Runde 6 frei. */
  round() {
    const c = this.c;
    const r = c?.rules;
    if (!r) return;
    if (r.minKillRound && c.round >= r.minKillRound && this.shield) {
      const e = this.scene.enemyCenter();
      this.shield.destroy();
      this.shield = null;
      ritualFx(this.scene, 's4ei_waechter_frei', e.x, e.y, { depth: 32 });
    }
    this.refresh();
  }

  /** Schatten: jede Runde wird eine zufällige eigene Fähigkeit gezogen; der Würfelschlitz zeigt es. */
  menu() {
    const sc = this.scene;
    const c = this.c;
    if (!c?.rules?.shadow || !c.roundSkill || this.rollShown === `${c.round}:${c.roundSkill}`) return;
    this.rollShown = `${c.round}:${c.roundSkill}`;
    const p = sc.playerCenter();
    const slot = ritualFx(sc, 'schatten_wuerfelslot', p.x, p.y - 52, { anim: 'draw', depth: 41, scale: 1.25 });
    slot?.once('destroy', () => {
      const set = ritualImage(sc, 'schatten_wuerfelslot', artFrame('schatten_wuerfelslot', 'set') ?? 8, p.x, p.y - 52, { depth: 41, scale: 1.25 });
      if (set) sc.tweens.add({ targets: set, alpha: 0, delay: 900, duration: 400, onComplete: () => set.destroy() });
    });
  }

  destroy() {
    this.hud.forEach((o) => o.destroy());
    this.loops.forEach((o) => o.destroy());
    this.shield?.destroy();
  }
}
