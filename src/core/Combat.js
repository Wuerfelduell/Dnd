// Rundenbasierter Kampf mit Timing (ohne Phaser, in Node testbar).
//
// Ablauf: Du wählst eine Aktion (Angriff, Fertigkeit, Gegenstand, Flucht). Angriffe
// werden im Takt ausgeführt: Wer im richtigen Moment drückt, trifft präzise.
// Danach greift der Gegner an. Jeder Schlag kann ausgewichen (großzügiges Fenster)
// oder pariert werden (enges Fenster). Paraden bringen Konzentration und einen
// Konter; wer alle Schläge einer Attacke pariert, setzt zum Gegenschlag an.
// Konzentration (K) bezahlt Fertigkeiten.

export const WINDOW = { parry: 110, dodge: 220 }; // ± Millisekunden um den Einschlag
export const EARLY_LIMIT = 450; // frühere Tastendrücke zählen noch nicht
export const AP_MAX = 6;
export const AP_START = 1;
export const GRADE_MULT = { perfect: 1.5, good: 1, miss: 0.4 };
export const WEAK_MULT = 1.5;

export const SKILLS = {
  attack: { name: 'Angriff', cost: 0, hits: 1, mult: 1, desc: 'Ein Schlag im Takt. +1 Konzentration, +2 bei präzisem Treffer.' },
  double: { name: 'Doppelschlag', cost: 2, hits: 2, mult: 0.85, desc: 'Zwei schnelle Schläge, beide im Takt.' },
  blind: { name: 'Laternenblende', cost: 2, hits: 1, mult: 0.3, desc: 'Blendet den Gegner. Trifft sie, setzt er eine Runde aus.' },
  ward: { name: 'Bannwort', cost: 3, hits: 1, flat: 12, composure: 15, desc: 'Ein Wort aus den Archivakten. 12 Schaden, doppelt gegen Okkultes. Kostet 15 Nerven.' },
};

/** Bewertet einen Verteidigungsdruck. offset = Drückzeit - Einschlagzeit (ms). */
export function judgeDefense(kind, offset, dodgeMult = 1) {
  const a = Math.abs(offset);
  if (kind === 'parry' && a <= WINDOW.parry) return 'parry';
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

export class Combat {
  constructor(state, encounterId) {
    const enc = state.content.encounters[encounterId];
    if (!enc) throw new Error(`Unbekannter Kampf: ${encounterId}`);
    this.state = state;
    this.id = encounterId;
    this.enc = enc;
    this.enemy = { name: enc.name, hp: enc.hp, maxHp: enc.hp, occult: !!enc.occult };
    this.weak = !!enc.weak_if && state.meets(enc.weak_if);
    this.ap = AP_START;
    this.stunned = false;
    this.round = 1;
    this.attackIndex = 0;
    this.outcome = null; // 'won' | 'lost' | 'fled'
    this.hpBefore = state.hp;
    this.log = [];
    this.shield = 0; // fängt Schaden ab (Trugbild, Eiserne Haut)
    this.evading = false; // nächster gegnerischer Angriff geht ins Leere
    this.confused = false; // nächster gegnerischer Angriff trifft den Gegner selbst
    this.burn = null; // { damage, rounds } Brand oder Gift
  }

  /** Grundfertigkeiten plus die Fähigkeiten des eigenen Pfades. */
  skillDef(id) {
    return SKILLS[id] ?? this.state.pathwaySkills()[id];
  }

  /** Nervenkosten einer Fertigkeit (Pfad des Echos halbiert sie). */
  composureCost(sk) {
    return sk.composure ? Math.round(sk.composure * this.state.passive('skill_composure')) : 0;
  }

  // --- Spieler -------------------------------------------------------------
  skills() {
    const all = { ...SKILLS, ...this.state.pathwaySkills() };
    return Object.entries(all).map(([id, sk]) => ({
      id, ...sk, composure: this.composureCost(sk),
      usable: this.ap >= sk.cost && this.state.composure >= this.composureCost(sk),
    }));
  }

  canUse(skillId) {
    return !!this.skills().find((s) => s.id === skillId && s.usable);
  }

  /** Schaden eines Treffers mit Waffe und Bewertung. */
  hitDamage(mult, grade) {
    const w = this.state.weaponStats();
    let dmg = w.atk * mult * GRADE_MULT[grade];
    if (this.enemy.occult && w.occult) dmg *= w.occult;
    if (this.enemy.occult) dmg *= this.state.passive('occult_mult');
    if (this.weak) dmg *= WEAK_MULT;
    return Math.max(1, Math.round(dmg));
  }

  /**
   * Führt eine Fertigkeit aus. grades: Bewertungen der Takt-Drücke ('perfect'|'good'|'miss').
   * Ergebnis: { hits: [{grade, damage}], total, stunned }
   */
  useSkill(skillId, grades = []) {
    const sk = this.skillDef(skillId);
    if (!this.canUse(skillId)) throw new Error(`Fertigkeit nicht möglich: ${skillId}`);
    this.ap -= sk.cost;
    const cc = this.composureCost(sk);
    if (cc) this.state.setComposure(this.state.composure - cc);
    const hits = grades.slice(0, sk.hits).map((g) => {
      const grade = sk.sure && g === 'miss' ? 'good' : g;
      let damage;
      if (sk.flat) {
        const holy = sk.holy || skillId === 'ward';
        damage = sk.flat * GRADE_MULT[grade] * (this.enemy.occult && holy ? 2 : 1) * (this.weak ? WEAK_MULT : 1);
        if (this.enemy.occult) damage *= this.state.passive('occult_mult');
        damage = Math.max(1, Math.round(damage));
      } else {
        damage = this.hitDamage(sk.mult, grade);
      }
      return { grade, damage };
    });
    const total = hits.reduce((n, h) => n + h.damage, 0);
    this.hurtEnemy(total);
    if (skillId === 'attack') this.gainAp(hits[0]?.grade === 'perfect' ? 2 : 1);
    const landed = sk.hits === 0 || hits.some((h) => h.grade !== 'miss');
    const effects = [];
    let stunned = false;
    if ((skillId === 'blind' || sk.stun) && landed && !this.outcome) { this.stunned = true; stunned = true; }
    if (sk.weak && landed && !this.weak) { this.weak = true; effects.push('Schwachstelle erkannt'); }
    if (sk.heal) effects.push(`+${this.state.heal(sk.heal)} Leben`);
    if (sk.drain && total) effects.push(`+${this.state.heal(Math.round(total * sk.drain))} Leben`);
    if (sk.shield) { this.shield += sk.shield; effects.push(`Schutz ${this.shield}`); }
    if (sk.evade) { this.evading = true; effects.push('nächster Angriff geht ins Leere'); }
    if (sk.confuse && landed) { this.confused = true; effects.push('Gegner verwirrt'); }
    if (sk.burn && landed) { this.burn = { damage: sk.burn[0], rounds: sk.burn[1] }; effects.push(`${sk.burn[1]} Runden je ${sk.burn[0]} Schaden`); }
    this.log.push(`${sk.name}: ${total} Schaden`);
    return { hits, total, stunned, effects };
  }

  /** Gegenstand im Kampf. Ergebnis: { text } oder null, wenn nicht möglich. */
  useItem(id) {
    const it = this.state.item(id);
    if (!it || it.kind !== 'consumable' || !this.state.itemCount(id)) return null;
    this.state.removeItem(id);
    const parts = this.state.applyConsumable(it);
    if (it.damage) {
      const dmg = it.damage * (this.enemy.occult ? 2 : 1);
      this.hurtEnemy(dmg);
      parts.push(`${dmg} Schaden`);
    }
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

  hurtEnemy(n) {
    this.enemy.hp = Math.max(0, this.enemy.hp - n);
    if (this.enemy.hp === 0) this.outcome = 'won';
  }

  // --- Gegner --------------------------------------------------------------
  /** Nächste Attacke des Gegners, oder null, wenn er geblendet aussetzt. */
  nextEnemyAttack() {
    if (this.stunned) { this.stunned = false; return null; }
    const list = this.enc.attacks;
    const atk = list[this.attackIndex % list.length];
    this.attackIndex += 1;
    if (this.confused) {
      // Verwirrt: der Gegner trifft sich selbst und greift diese Runde nicht an
      this.confused = false;
      this.selfHit = atk.damage * atk.hits.length;
      this.hurtEnemy(this.selfHit);
      return null;
    }
    return atk;
  }

  /**
   * Wertet einen einzelnen Schlag aus. result: 'parry' | 'dodge' | 'miss'.
   * Ergebnis: { damage, counter }
   */
  resolveHit(attack, given) {
    const result = this.evading && given === 'miss' ? 'dodge' : given;
    if (result === 'parry') {
      if (!this.enc.practice) this.state.act('parry');
      this.gainAp(1 + this.state.passive('parry_ap'));
      const counter = this.hitDamage(0.5, 'good');
      this.hurtEnemy(counter);
      return { damage: 0, counter, result };
    }
    if (result === 'dodge') return { damage: 0, counter: 0, result };
    let incoming = attack.damage;
    const absorbed = Math.min(this.shield, incoming);
    this.shield -= absorbed;
    incoming -= absorbed;
    const damage = this.state.damage(incoming);
    if (this.state.hp === 0) this.outcome = 'lost';
    return { damage, counter: 0, result, absorbed };
  }

  /** Ende des gegnerischen Zuges: Ausweichen verfällt. */
  endEnemyTurn() {
    this.evading = false;
  }

  /** Alle Schläge pariert: Gegenschlag. */
  riposte() {
    const dmg = this.hitDamage(1.5, 'perfect');
    this.hurtEnemy(dmg);
    this.log.push(`Gegenschlag: ${dmg} Schaden`);
    return dmg;
  }

  /** Rundenende: Brand/Gift wirkt. Gibt den Schaden zurück. */
  endRound() {
    this.round += 1;
    if (!this.burn || this.outcome) return 0;
    const dmg = this.burn.damage;
    this.hurtEnemy(dmg);
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
  finish() {
    const s = this.state;
    const enc = this.enc;
    const firstFlag = `won_${this.id}`;
    let text = '';
    let travel = null;
    if (enc.practice) s.hp = Math.max(s.hp, this.hpBefore);
    if (this.outcome === 'won') {
      const first = !s.flags.has(firstFlag);
      s.applyEffects({ ...enc.on_win, sets_flags: [...(enc.on_win?.sets_flags ?? []), firstFlag] });
      if (first && enc.first_win) s.applyEffects(enc.first_win);
      if (!enc.practice) {
        const loot = s.content.loot?.[this.id];
        if (loot && (first || loot.repeat)) {
          if (loot.money) s.addMoney(loot.money, { loot: true, reason: enc.name });
          if (first) for (const [id, n] of Object.entries(loot.items ?? {})) s.addItem(id, n);
        }
        s.act('combat_win');
        if (enc.occult) s.act('occult_win');
      }
      text = enc.win_text ?? `${enc.name} ist besiegt.`;
    } else if (this.outcome === 'lost') {
      if (!enc.practice) {
        s.hp = Math.max(1, Math.round(s.maxHp * 0.4));
        s.applyEffects(enc.on_lose);
        travel = enc.lose_to ?? null;
      } else {
        s.hp = Math.max(1, this.hpBefore);
      }
      text = enc.lose_text ?? (enc.practice ? 'Du liegst auf dem Rücken. Holt reicht dir die Hand.' : 'Dir wird schwarz vor Augen.');
    } else if (this.outcome === 'fled') {
      text = enc.flee_text ?? 'Du ziehst dich zurück.';
    }
    s.emit('hp', { value: s.hp, delta: 0 });
    s.emit('changed');
    return { outcome: this.outcome, text, travel };
  }
}
