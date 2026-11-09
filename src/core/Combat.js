// Rundenbasierter Kampf mit Timing (ohne Phaser, in Node testbar).
//
// Ablauf: Du wählst eine Aktion (Angriff, Fertigkeit, Gegenstand, Flucht). Angriffe
// werden im Takt ausgeführt: Wer im richtigen Moment drückt, trifft präzise.
// Danach greift der Gegner an. Jeder Schlag kann ausgewichen (großzügiges Fenster)
// oder pariert werden (enges Fenster). Paraden bringen Konzentration und einen
// Konter; wer alle Schläge einer Attacke pariert, setzt zum Gegenschlag an.
// Konzentration (K) bezahlt Fertigkeiten.

import { rollLoot, takeLoot } from './Loot.js';

export const WINDOW = { parry: 80, dodge: 140 }; // ± Millisekunden um den Einschlag
export const ELITE_PARRY = 65; // Eliten und Bosse: noch engeres Parierfenster
// Schwierigkeit: echte Gegner (keine Übung) halten mehr aus und schlagen härter.
export const ENEMY_HP_MULT = 1.4;
export const ENEMY_DMG_MULT = 1.4;
export const ELITE_HP_MULT = 1.0; // zusätzlich zu den Daten (Elite ×1,5 der Grundform)
export const ELITE_DMG_MULT = 0.9; // Eliten haben in den Daten schon +30 % Schaden, so bleibt es bei etwa +60 %
// Zu zweit: der Gegner hält mehr aus, je nachdem wie stark Spieler 2 zuschlägt (gleich stark: ×1,9,
// halb so stark: ×1,45), und er greift jede Runde jeden stehenden Spieler einmal an, dafür etwas
// schwächer pro Schlag. So muss sich jeder selbst verteidigen, und keiner steht nur daneben.
export const DUO_HP_SHARE = 0.9; // Anteil Zusatzleben bei gleich starkem Spieler 2
export const DUO_POWER_MIN = 0.5; // Spieler 2 zählt mindestens halb ...
export const DUO_POWER_MAX = 1.25; // ... und höchstens so viel wie 1,25 Ermittler
export const DUO_HP_MULT = 1 + DUO_HP_SHARE; // bei gleich starken Spielern
export const DUO_DMG_MULT = 0.85;
export const ARMOR = { elite: 2, boss: 3 }; // zieht jedem Treffer so viel ab (mindestens 1 bleibt)
export const COUNTER_MULT = 0.3; // Konter nach einer Parade
export const RIPOSTE_MULT = 1.0; // Gegenschlag nach voll parierter Attacke
export const FOLLOWUP_CHANCE = 0.3; // Eliten und Bosse hängen manchmal einen Schlag an
export const RING_GAP = 80; // ms Pause zwischen Einschlag und nächstem Ring
export const RING_FOLLOW_LEAD = 500; // Vorlauf der Folgeringe in der Übung
export const JITTER = 160; // Schläge kommen zufällig bis zu so viel früher/später
// Wie sich der Ring zusammenzieht: u = vergangene Zeit (0..1) -> Anteil geschlossen (0..1).
// Der Einschlag bleibt immer bei u = 1, nur das Tempo des Rings täuscht.
export const RING_CURVES = {
  linear: (u) => u,
  schnell_langsam: (u) => 1 - (1 - u) ** 2.6, // schließt erst schnell, kriecht dann
  langsam_schnell: (u) => u ** 2.6, // trödelt, dann schnappt er zu
  stocken: (u) => (u < 0.35 ? u * 1.6 : u < 0.65 ? 0.56 : 0.56 + (u - 0.65) * (0.44 / 0.35)), // hält in der Mitte an
  finte: (u) => (u < 0.45 ? u * 1.7 : u < 0.7 ? 0.765 - (u - 0.45) * 1.4 : 0.415 + (u - 0.7) * (0.585 / 0.3)), // zuckt zurück
};
export const DODGE_COST = 3; // Ausweichen kostet Nerven, Paraden geben welche zurück
export const PARRY_GAIN = 2;
export const ENRAGE_AT = 0.4; // unter 40 % Leben wird der Gegner schneller und härter
export const EARLY_LIMIT = 450; // frühere Tastendrücke zählen noch nicht
export const AP_MAX = 6;
export const AP_START = 1;
export const GRADE_MULT = { perfect: 1.3, good: 1, miss: 0.4 };
export const WEAK_MULT = 1.5;
/**
 * Sequenz-Schranke: Gegner mit `min_seq` (z. B. Starling 7, die Namenlose 6, das Leuchtfeuer 5) sind höhere Wesen.
 * Wer eine schwächere Sequenz hat (oder gar keinen Pfad), richtet nur einen Bruchteil seines Schadens an.
 */
export const SEQ_WARD_MULT = 0.08;

export const SKILLS = {
  attack: { name: 'Angriff', cost: 0, hits: 1, mult: 1, desc: 'Ein Schlag im Takt. +1 Konzentration, +2 bei präzisem Treffer.' },
  double: { name: 'Doppelschlag', cost: 2, hits: 2, mult: 0.85, desc: 'Zwei schnelle Schläge, beide im Takt.' },
  blind: { name: 'Laternenblende', cost: 2, hits: 1, mult: 0.3, desc: 'Blendet den Gegner. Trifft sie, setzt er eine Runde aus.' },
  ward: { name: 'Bannwort', cost: 3, hits: 1, flat: 12, composure: 15, desc: 'Ein Wort aus den Archivakten. 12 Schaden, doppelt gegen Okkultes. Kostet 15 Nerven.' },
};

/** Bewertet einen Verteidigungsdruck. offset = Drückzeit - Einschlagzeit (ms). */
export function judgeDefense(kind, offset, dodgeMult = 1, parryWindow = WINDOW.parry) {
  const a = Math.abs(offset);
  if (kind === 'parry' && a <= parryWindow) return 'parry';
  if (kind === 'dodge' && a <= WINDOW.dodge * dodgeMult) return 'dodge';
  return 'miss';
}

/** Bewertet einen Angriffs-Takt. pos und zone.center liegen zwischen 0 und 1. */
export function judgeTiming(pos, zone) {
  if (pos === null || pos === undefined) return 'miss';
  const d = Math.abs(pos - zone.center);
  if (d <= zone.perfect) return 'perfect';
  if (d <= zone.good) return 'good';
  return 'miss';
}

// Werte, die jeder Spieler im Kampf für sich hat (zu zweit: Spieler 1 und 2).
const PER_FIGHTER = ['ap', 'shield', 'evading', 'bleed', 'actions', 'itemUsed'];

/** Schlagkraft eines Spielers: Waffe mal Schadens-Passiven (Durchbrüche, Artefakte). */
export function playerPower(state, n) {
  return state.withPlayer(n, () => state.weaponStats().atk * state.passive('dmg_mult'), { quiet: true });
}

/** Zusatzleben des Gegners zu zweit: richtet sich danach, wie stark Spieler 2 im Vergleich zuschlägt. */
export function duoHpMult(state) {
  const ratio = playerPower(state, 2) / Math.max(1, playerPower(state, 1));
  return 1 + DUO_HP_SHARE * Math.min(DUO_POWER_MAX, Math.max(DUO_POWER_MIN, ratio));
}

export class Combat {
  constructor(state, encounterId) {
    const enc = state.content.encounters[encounterId];
    if (!enc) throw new Error(`Unbekannter Kampf: ${encounterId}`);
    this.state = state;
    this.id = encounterId;
    this.enc = enc;
    const duo = !!state.hasP2?.();
    this.duoHpMult = duo ? duoHpMult(state) : 1;
    const hp = enc.practice ? enc.hp : Math.round(enc.hp * ENEMY_HP_MULT * (enc.elite ? ELITE_HP_MULT : 1) * this.duoHpMult);
    // Panzer wächst mit der Gefahrenstufe des Gebiets (Marsch 1, ...), Bosse eine Stufe mehr
    const tier = state.content.zones?.[enc.zone]?.tier ?? 2;
    this.armor = enc.practice ? 0 : enc.armor ?? (enc.boss ? Math.min(ARMOR.boss, tier) : enc.elite ? Math.min(ARMOR.elite, tier - 1) : 0);
    this.enemy = { name: enc.name, hp, maxHp: hp, occult: !!enc.occult };
    this.rng = state.rng ?? Math.random;
    // Die härteste Einzelattacke kann man nicht parieren, nur ausweichen (außer die Daten sagen es anders)
    const flagged = enc.attacks.some((a) => a.unparryable !== undefined);
    const heavy = enc.attacks.filter((a) => a.hits?.length === 1).sort((a, b) => b.damage - a.damage)[0];
    this.unparryable = new Set(enc.attacks.filter((a) => (flagged ? a.unparryable : a === heavy && enc.attacks.length > 2)).map((a) => a.name));
    this.weak = !!enc.weak_if && state.meets(enc.weak_if);
    // Kämpfer: Spieler 1 und (lokaler Koop) Spieler 2, jeder mit eigener Konzentration, Schutz, Blutung, Zug.
    // ap, shield, evading, bleed, actions, itemUsed lesen sich über Zugriffe beim gerade betroffenen Kämpfer.
    // Ab Sequenz 7 beginnt man den Kampf mit mehr Konzentration (Passiv ap_start)
    const fighter = (hp, n) => ({
      ap: Math.min(AP_MAX, AP_START + state.withPlayer(n, () => state.passive('ap_start'))), shield: 0, evading: false, bleed: null, actions: 0, itemUsed: false, down: false, hpBefore: hp, bleedTick: 0,
    });
    this.fighters = { 1: fighter(state.hp, 1) };
    if (duo) this.fighters[2] = fighter(state.p2.hp, 2);
    this.actor = 1; // wer am Zug ist
    this.target = 1; // wen der Gegner gerade angreift
    this.struck = []; // wen der Gegner in dieser Runde schon angegriffen hat (zu zweit jeden einmal)
    this.cur = null; // für wen die Werte gerade gelten (null = wer am Zug ist)
    this.stunned = false;
    this.round = 1;
    this.attackIndex = 0;
    this.outcome = null; // 'won' | 'lost' | 'fled'
    this.log = [];
    if (this.wardMult() < 1) this.log.push(`${enc.name} ist zu mächtig für dich: Ohne Sequenz ${enc.min_seq} prallt fast alles an ${enc.name.startsWith('Die ') ? 'ihr' : 'ihm'} ab.`);
    this.confused = false; // nächster gegnerischer Angriff trifft den Gegner selbst
    this.burn = null; // { damage, rounds, source } Brand oder Gift
    // Menschliche Gegner (Sekten) haben Kniffe: Panzer, Schleier, Blutung, Einschüchterung
    this.enemyGuard = 0; // fängt Schaden am Gegner ab
    this.veiled = false; // nächste Aktion des Spielers trifft nur mit präzisem Takt
    this.lastAction = null; // { name, text } Kniff des Gegners statt eines Angriffs
  }

  // --- Zwei Spieler -----------------------------------------------------------
  /** Spielen zwei mit? */
  get duo() {
    return !!this.fighters[2];
  }

  fighter(n = this.cur ?? this.actor) {
    return this.fighters[n] ?? this.fighters[1];
  }

  /** Noch stehende Spieler (1 und/oder 2). */
  standing() {
    return Object.keys(this.fighters).map(Number).filter((n) => !this.fighters[n].down);
  }

  /** Führt fn für Spieler n aus: Leben, Inventar, Waffe und Kampfwerte gehören dann ihm. */
  on(n, fn) {
    const prev = this.cur;
    this.cur = n;
    try {
      return this.state.withPlayer(n, fn);
    } finally {
      this.cur = prev;
    }
  }

  /** Nach dem Zug von Spieler 1 ist Spieler 2 dran (falls er steht). true = noch ein Spielerzug. */
  passTurn() {
    if (this.actor === 1 && this.duo && !this.fighters[2].down && !this.outcome) { this.actor = 2; return true; }
    return false;
  }

  /** Ein Spieler geht zu Boden. Erst wenn alle liegen, ist der Kampf verloren. */
  knockOut(n) {
    this.fighters[n].down = true;
    this.fighters[n].bleed = null;
    if (!this.standing().length) this.outcome = 'lost';
  }

  /** Grundfertigkeiten plus die Fähigkeiten des eigenen Pfades. */
  skillDef(id) {
    return this.on(this.actor, () => SKILLS[id] ?? this.state.pathwaySkills()[id]);
  }

  /** Nervenkosten einer Fertigkeit (Pfad des Echos halbiert sie). */
  composureCost(sk) {
    return sk.composure ? Math.round(sk.composure * this.state.passive('skill_composure')) : 0;
  }

  // --- Spieler -------------------------------------------------------------
  skills() {
    return this.on(this.actor, () => this.skillsNow());
  }

  skillsNow() {
    const all = { ...SKILLS, ...this.state.pathwaySkills() };
    return Object.entries(all).map(([id, sk]) => ({
      id, ...sk, composure: this.composureCost(sk),
      usable: this.ap >= sk.cost && this.state.composure >= this.composureCost(sk),
    }));
  }

  canUse(skillId) {
    return !!this.skills().find((s) => s.id === skillId && s.usable);
  }

  /**
   * Mehrere Aktionen pro Zug, solange Konzentration reicht. Der einfache Angriff
   * (kostet nichts, bringt Konzentration) beendet den Zug.
   */
  endsTurn(skillId) {
    return !this.skillDef(skillId)?.cost;
  }

  canUseItem() {
    return !this.itemUsed;
  }

  /** Neue Runde: alle Spieler dürfen wieder handeln, Spieler 1 beginnt (wenn er steht). */
  startTurn() {
    for (const f of Object.values(this.fighters)) { f.actions = 0; f.itemUsed = false; }
    this.struck = [];
    this.actor = this.fighters[1].down && this.duo ? 2 : 1;
  }

  /** Schaden eines Treffers mit Waffe und Bewertung. */
  hitDamage(mult, grade) {
    const w = this.state.weaponStats();
    let dmg = w.atk * mult * GRADE_MULT[grade];
    if (this.enemy.occult && w.occult) dmg *= w.occult;
    if (this.enemy.occult) dmg *= this.state.passive('occult_mult');
    if (this.weak) dmg *= WEAK_MULT;
    dmg *= this.state.passive('dmg_mult');
    return Math.max(1, Math.round(dmg));
  }

  /**
   * Führt eine Fertigkeit aus. grades: Bewertungen der Takt-Drücke ('perfect'|'good'|'miss').
   * Ergebnis: { hits: [{grade, damage}], total, stunned }
   */
  useSkill(skillId, grades = []) {
    return this.on(this.actor, () => this.useSkillNow(skillId, grades));
  }

  useSkillNow(skillId, grades) {
    const sk = this.skillDef(skillId);
    if (!this.canUse(skillId)) throw new Error(`Fertigkeit nicht möglich: ${skillId}`);
    this.ap -= sk.cost;
    this.actions += 1;
    const cc = this.composureCost(sk);
    if (cc) this.state.setComposure(this.state.composure - cc);
    const hits = grades.slice(0, sk.hits).map((g) => {
      const grade = sk.sure && g === 'miss' ? 'good' : g;
      let damage;
      if (sk.flat) {
        const holy = sk.holy || skillId === 'ward';
        damage = sk.flat * GRADE_MULT[grade] * (this.enemy.occult && holy ? 2 : 1) * (this.weak ? WEAK_MULT : 1);
        if (this.enemy.occult) damage *= this.state.passive('occult_mult');
        damage *= this.state.passive('dmg_mult');
        damage = Math.max(1, Math.round(damage));
      } else {
        damage = this.hitDamage(sk.mult, grade);
      }
      return { grade, damage };
    });
    const effects = [];
    if (this.veiled && hits.length) {
      // Schleier: nur präzise Treffer finden das echte Gesicht
      this.veiled = false;
      let lost = false;
      for (const h of hits) if (h.grade !== 'perfect' && h.damage) { h.damage = 0; lost = true; }
      if (lost) effects.push('der Schleier schluckt jeden ungenauen Treffer');
    }
    const raw = hits.reduce((n, h) => n + h.damage, 0);
    const total = this.hurtEnemy(raw, { pierce: !!sk.pierce });
    if (raw > total) effects.push(`Panzer fängt ${raw - total} ab`);
    if (skillId === 'attack') this.gainAp(hits[0]?.grade === 'perfect' ? 2 : 1);
    const landed = sk.hits === 0 || hits.some((h) => h.grade !== 'miss' && h.damage);
    let stunned = false;
    if ((skillId === 'blind' || sk.stun) && landed && !this.outcome) { this.stunned = true; stunned = true; }
    if (sk.weak && landed && !this.weak) { this.weak = true; effects.push('Schwachstelle erkannt'); }
    if (sk.heal) effects.push(`+${this.state.heal(sk.heal)} Leben`);
    if (sk.drain && total) effects.push(`+${this.state.heal(Math.round(total * sk.drain))} Leben`);
    if (sk.shield) { this.shield += sk.shield; effects.push(`Schutz ${this.shield}`); }
    if (sk.evade) { this.evading = true; effects.push('nächster Angriff geht ins Leere'); }
    if (sk.confuse && landed) { this.confused = true; effects.push('Gegner verwirrt'); }
    if (sk.burn && landed) { this.burn = { damage: sk.burn[0], rounds: sk.burn[1], source: skillId }; effects.push(`${sk.burn[1]} Runden je ${sk.burn[0]} Schaden`); }
    this.log.push(`${sk.name}: ${total} Schaden`);
    return { hits, total, stunned, effects };
  }

  /** Gegenstand im Kampf. Ergebnis: { text } oder null, wenn nicht möglich. */
  useItem(id) {
    return this.on(this.actor, () => this.useItemNow(id));
  }

  useItemNow(id) {
    const it = this.state.item(id);
    if (!it || it.kind !== 'consumable' || !this.state.itemCount(id) || this.itemUsed) return null;
    this.itemUsed = true;
    this.actions += 1;
    this.state.removeItem(id);
    const parts = this.state.applyConsumable(it);
    if (it.damage) {
      const dmg = this.hurtEnemy(it.damage * (this.enemy.occult ? 2 : 1));
      parts.push(`${dmg} Schaden`);
    }
    // Blitzpulver: grelles Licht, der Gegner setzt eine Runde aus
    if (it.stun && !this.outcome) { this.stunned = true; parts.push('geblendet'); }
    const text = `${it.name}: ${parts.join(', ')}`;
    this.log.push(text);
    return { text };
  }

  canFlee() {
    return !!this.enc.fleeable || !!this.state.passive('always_flee');
  }

  flee() {
    if (!this.canFlee()) return false;
    this.outcome = 'fled';
    return true;
  }

  gainAp(n) {
    this.ap = Math.min(AP_MAX, this.ap + n);
  }

  /** Schaden am Gegner (Panzer fängt zuerst ab). Gibt den tatsächlichen Schaden zurück. */
  /** Parierfenster für diesen Gegner (ms). */
  parryWindow() {
    return this.enc.elite || this.enc.boss ? ELITE_PARRY : WINDOW.parry;
  }

  /** Schadensfaktor der Sequenz-Schranke für den Spieler, der gerade handelt (zu zweit zählt jeder für sich). */
  wardMult() {
    const min = this.enc.min_seq;
    if (!min || this.enc.practice) return 1;
    return (this.state.pathway?.seq ?? 99) <= min ? 1 : SEQ_WARD_MULT;
  }

  hurtEnemy(n, { pierce = false } = {}) {
    if (n > 0) n = Math.max(1, Math.round(n * this.wardMult()));
    if (this.armor && !pierce && n > 0) n = Math.max(1, n - this.armor);
    const absorbed = Math.min(this.enemyGuard, n);
    this.enemyGuard -= absorbed;
    const dmg = n - absorbed;
    this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
    if (this.enemy.hp === 0) this.outcome = 'won';
    return dmg;
  }

  // --- Gegner --------------------------------------------------------------
  /** Nächste Attacke des Gegners, oder null, wenn er geblendet aussetzt. */
  nextEnemyAttack() {
    this.lastAction = null;
    // Zu zweit greift der Gegner jeden stehenden Spieler einmal pro Runde an, in zufälliger Reihenfolge
    const up = this.standing();
    const fresh = up.filter((n) => !this.struck.includes(n));
    const pool = fresh.length ? fresh : up;
    this.target = pool.length > 1 ? pool[Math.floor(this.rng() * pool.length)] : pool[0] ?? 1;
    this.struck.push(this.target);
    // Geblendet oder verwirrt: die ganze Runde ist für den Gegner vorbei
    if (this.stunned) { this.stunned = false; this.struck = [...up]; return null; }
    const list = this.enc.attacks;
    const atk = list[this.attackIndex % list.length];
    this.attackIndex += 1;
    if (this.confused) {
      // Verwirrt: der Gegner trifft sich selbst und greift diese Runde nicht an
      this.confused = false;
      this.struck = [...up];
      this.selfHit = atk.action ? 0 : atk.damage * atk.hits.length;
      this.hurtEnemy(this.selfHit);
      return null;
    }
    if (atk.action) { this.enemyAct(atk); return null; }
    return this.prepareAttack(atk);
  }

  /**
   * Kniff statt Angriff (Pfad-Fähigkeiten der Sekten). action:
   * guard (Panzer +value), heal (+value Leben), veil (nächste Aktion nur präzise), taunt (-value Nerven).
   */
  enemyAct(atk) {
    const v = atk.value ?? 0;
    let text = atk.text ?? '';
    if (atk.action === 'guard') { this.enemyGuard += v; text ||= `Panzer ${this.enemyGuard}.`; }
    else if (atk.action === 'heal') {
      const before = this.enemy.hp;
      this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + v);
      text ||= `+${this.enemy.hp - before} Leben.`;
    } else if (atk.action === 'veil') { this.veiled = true; text ||= 'Nur präzise Treffer zählen.'; }
    else if (atk.action === 'taunt') { this.on(this.target, () => this.state.setComposure(this.state.composure - v)); text ||= `-${v} Nerven.`; }
    else throw new Error(`Unbekannter Kniff: ${atk.action}`);
    this.lastAction = { name: atk.name, action: atk.action, value: v, text };
    this.log.push(`${atk.name}: ${text}`);
    return this.lastAction;
  }

  /** Zu zweit: greift der Gegner in dieser Runde noch einen anderen Spieler an? */
  moreStrikes() {
    return this.duo && !this.outcome && this.standing().some((n) => !this.struck.includes(n));
  }

  /** Ist der Gegner in Rage (wenig Leben)? */
  enraged() {
    return !this.enc.practice && this.enemy.hp <= this.enemy.maxHp * ENRAGE_AT;
  }

  /**
   * Macht aus einer Attacke der Daten den konkreten Angriff dieser Runde:
   * Schaden skaliert, Takt mit Zufall (man kann ihn nicht auswendig lernen), in Rage schneller.
   */
  prepareAttack(atk) {
    const rage = this.enraged();
    const tough0 = this.enc.elite;
    // Feld `ramp`: der Gegner wird mit jeder Runde stärker (gegen endloses Abwarten hinter Schilden)
    const ramp = 1 + (this.enc.ramp ?? 0) * Math.max(0, this.round - 1);
    const dmgMult = this.enc.practice ? 1 : ENEMY_DMG_MULT * (rage ? 1.2 : 1) * (tough0 ? ELITE_DMG_MULT : 1) * (this.duo ? DUO_DMG_MULT : 1) * ramp;
    const speed = rage ? 0.85 : 1;
    const hits = [];
    const src = [...atk.hits];
    // Eliten und Bosse setzen manchmal nach
    const tough = !this.enc.practice && (this.enc.elite || this.enc.boss);
    const followup = tough && this.rng() < FOLLOWUP_CHANCE;
    if (followup) src.push(src.at(-1) + 330 + Math.round(this.rng() * 200));
    // Jeder Ring bekommt ein eigenes Tempo und eine eigene Vorlaufzeit (Übung bleibt gleichmäßig).
    // Folgeschläge einer Kombo haben kürzeren Vorlauf.
    const names = Object.keys(RING_CURVES);
    const rings = src.map((_, i) => (this.enc.practice
      ? { curve: 'linear', lead: i ? RING_FOLLOW_LEAD : 750 }
      : {
        curve: names[Math.floor(this.rng() * names.length)],
        lead: Math.round(i ? 380 + this.rng() * 180 : 560 + this.rng() * 360),
      }));
    for (const [i, h] of src.entries()) {
      let t = h * speed + (this.enc.practice ? 0 : (this.rng() * 2 - 1) * JITTER);
      // Ein Ring erscheint erst, wenn der vorige eingeschlagen hat: keine Überlappung
      const prev = hits.at(-1);
      t = Math.max(450, t, prev === undefined ? 0 : prev + rings[i].lead + RING_GAP);
      hits.push(Math.round(t));
    }
    return { ...atk, damage: Math.max(1, Math.round(atk.damage * dmgMult)), hits, rings, followup, unparryable: this.unparryable.has(atk.name), enraged: rage };
  }

  /**
   * Wertet einen einzelnen Schlag aus. result: 'parry' | 'dodge' | 'miss'.
   * Ergebnis: { damage, counter }
   */
  resolveHit(attack, given) {
    return this.on(this.target, () => this.resolveHitNow(attack, given));
  }

  resolveHitNow(attack, given) {
    let result = this.evading && given === 'miss' ? 'dodge' : given;
    let note = null;
    if (result === 'parry' && attack.unparryable) { result = 'miss'; note = 'unparryable'; }
    if (result === 'dodge' && given === 'dodge' && !this.evading) {
      if (this.state.composure < DODGE_COST) { result = 'miss'; note = 'exhausted'; }
      else this.state.setComposure(this.state.composure - DODGE_COST);
    }
    if (result === 'parry') {
      if (!this.enc.practice) this.state.act('parry');
      this.state.setComposure(this.state.composure + PARRY_GAIN);
      this.gainAp(1 + this.state.passive('parry_ap'));
      const counter = this.hurtEnemy(this.hitDamage(COUNTER_MULT, 'good'));
      return { damage: 0, counter, result };
    }
    if (result === 'dodge') return { damage: 0, counter: 0, result };
    let incoming = attack.damage;
    const absorbed = Math.min(this.shield, incoming);
    this.shield -= absorbed;
    incoming -= absorbed;
    const damage = this.state.damage(incoming);
    if (damage && attack.bleed) this.bleed = { damage: attack.bleed[0], rounds: attack.bleed[1] };
    if (damage && attack.nerves) this.state.setComposure(this.state.composure - attack.nerves);
    if (this.state.hp === 0) this.knockOut(this.target);
    return { damage, counter: 0, result, absorbed, note, down: this.fighters[this.target].down };
  }

  /** Ende des gegnerischen Zuges: Ausweichen verfällt. */
  endEnemyTurn() {
    for (const f of Object.values(this.fighters)) f.evading = false;
  }

  /** Alle Schläge pariert: Gegenschlag. */
  riposte() {
    const dmg = this.on(this.target, () => this.hurtEnemy(this.hitDamage(RIPOSTE_MULT, 'good')));
    this.log.push(`Gegenschlag: ${dmg} Schaden`);
    return dmg;
  }

  /** Rundenende: Brand/Gift wirkt auf den Gegner, Blutung auf dich (bleedTick). Gibt den Schaden am Gegner zurück. */
  endRound() {
    this.round += 1;
    for (const f of Object.values(this.fighters)) f.bleedTick = 0;
    if (this.outcome) { this.startTurn(); return 0; }
    for (const n of this.standing()) {
      const f = this.fighters[n];
      if (!f.bleed) continue;
      this.on(n, () => {
        f.bleedTick = this.state.damage(f.bleed.damage);
        f.bleed.rounds -= 1;
        if (f.bleed.rounds <= 0) f.bleed = null;
        if (this.state.hp === 0) this.knockOut(n);
      });
    }
    this.startTurn();
    if (this.outcome) return 0;
    if (!this.burn) return 0;
    const dmg = this.hurtEnemy(this.burn.damage);
    this.burn.rounds -= 1;
    if (this.burn.rounds <= 0) this.burn = null;
    return dmg;
  }

  // --- Ende ---------------------------------------------------------------------
  /**
   * Wendet die Folgen an. Ergebnis: { outcome, text, travel? }
   * - Sieg: on_win, beim ersten Sieg zusätzlich first_win.
   * - Niederlage: Ohnmacht, du wachst mit wenig Leben auf (lose_to: anderer Ort).
   * - Übungskämpfe: Leben wie vorher, keine Folgen.
   */
  finish({ deferLoot = false } = {}) {
    const s = this.state;
    const enc = this.enc;
    const firstFlag = `won_${this.id}`;
    let text = '';
    let travel = null;
    let loot = null;
    const each = (fn) => { for (const n of Object.keys(this.fighters).map(Number)) this.on(n, () => fn(this.fighters[n], n)); };
    if (enc.practice) each((f) => { s.hp = Math.max(s.hp, f.hpBefore); });
    // Wer zu Boden ging, der Kampf aber nicht verloren ist, rappelt sich mit wenig Leben auf
    if (this.outcome !== 'lost') each((f) => { if (f.down || s.hp <= 0) s.hp = Math.max(1, Math.round(s.maxHp * 0.25)); });
    if (this.outcome === 'won') {
      const first = !s.flags.has(firstFlag);
      s.applyEffects({ ...enc.on_win, sets_flags: [...(enc.on_win?.sets_flags ?? []), firstFlag] });
      if (first && enc.first_win) s.applyEffects(enc.first_win);
      if (!enc.practice) {
        loot = this.rollLoot(first);
        // Bei Gegnern auf der Karte landet die Beute in einem Behälter am Boden (WorldScene)
        if (!deferLoot) takeLoot(s, loot, enc.name);
        s.act('combat_win');
        if (enc.occult) s.act('occult_win');
      }
      text = enc.win_text ?? `${enc.name} ist besiegt.`;
    } else if (this.outcome === 'lost') {
      if (!enc.practice) {
        each(() => { s.hp = Math.max(1, Math.round(s.maxHp * 0.4)); });
        s.applyEffects(enc.on_lose);
        travel = enc.lose_to ?? null;
      } else {
        each((f) => { s.hp = Math.max(1, f.hpBefore); });
      }
      text = enc.lose_text ?? (enc.practice ? 'Du liegst auf dem Rücken. Holt reicht dir die Hand.' : 'Dir wird schwarz vor Augen.');
      // Gefahrengebiete: Wer dort liegen bleibt, wird ausgeraubt
      if (!enc.practice && enc.lose_money && s.money > 0) {
        const lost = Math.max(1, Math.ceil(s.money * enc.lose_money));
        s.addMoney(-lost);
        text += `\n\nAls du zu dir kommst, fehlen dir ${lost} Schilling.`;
      }
    } else if (this.outcome === 'fled') {
      text = enc.flee_text ?? 'Du ziehst dich zurück.';
    }
    s.emit('hp', { value: s.hp, delta: 0 });
    s.emit('party', { active: s.hasP2?.() ?? false });
    s.emit('changed');
    return { outcome: this.outcome, text, travel, loot, lootDeferred: !!loot && deferLoot };
  }

  /**
   * Beute dieses Sieges (Tabelle `loot` aus market.json/wilds.json):
   * Geld und Drops beim ersten Sieg oder immer (repeat), feste Items nur beim ersten Sieg.
   */
  rollLoot(first) {
    const table = this.state.content.loot?.[this.id];
    const loot = { money: 0, items: {} };
    if (!table || !(first || table.repeat)) return loot;
    const rolled = rollLoot(table, this.rng);
    loot.money = rolled.money;
    loot.items = rolled.items;
    if (first) for (const [id, n] of Object.entries(table.items ?? {})) loot.items[id] = (loot.items[id] ?? 0) + n;
    return loot;
  }
}

// ap, shield, evading, bleed, actions, itemUsed: gehören dem gerade betroffenen Kämpfer
for (const key of PER_FIGHTER) {
  Object.defineProperty(Combat.prototype, key, {
    get() { return this.fighter()[key]; },
    set(v) { this.fighter()[key] = v; },
  });
}
Object.defineProperty(Combat.prototype, 'bleedTick', {
  get() { return Object.values(this.fighters).reduce((n, f) => n + (f.bleedTick ?? 0), 0); },
});
