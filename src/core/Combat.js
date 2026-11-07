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
export function judgeDefense(kind, offset) {
  const a = Math.abs(offset);
  if (kind === 'parry' && a <= WINDOW.parry) return 'parry';
  if (kind === 'dodge' && a <= WINDOW.dodge) return 'dodge';
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
  }

  // --- Spieler -------------------------------------------------------------
  skills() {
    return Object.entries(SKILLS).map(([id, sk]) => ({
      id, ...sk,
      usable: this.ap >= sk.cost && (!sk.composure || this.state.composure >= sk.composure),
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
    if (this.weak) dmg *= WEAK_MULT;
    return Math.max(1, Math.round(dmg));
  }

  /**
   * Führt eine Fertigkeit aus. grades: Bewertungen der Takt-Drücke ('perfect'|'good'|'miss').
   * Ergebnis: { hits: [{grade, damage}], total, stunned }
   */
  useSkill(skillId, grades) {
    const sk = SKILLS[skillId];
    if (!this.canUse(skillId)) throw new Error(`Fertigkeit nicht möglich: ${skillId}`);
    this.ap -= sk.cost;
    if (sk.composure) this.state.setComposure(this.state.composure - sk.composure);
    const hits = grades.slice(0, sk.hits).map((grade) => {
      let damage;
      if (sk.flat) {
        damage = sk.flat * GRADE_MULT[grade] * (this.enemy.occult ? 2 : 1) * (this.weak ? WEAK_MULT : 1);
        damage = Math.max(1, Math.round(damage));
      } else {
        damage = this.hitDamage(sk.mult, grade);
      }
      return { grade, damage };
    });
    const total = hits.reduce((n, h) => n + h.damage, 0);
    this.hurtEnemy(total);
    if (skillId === 'attack') this.gainAp(hits[0]?.grade === 'perfect' ? 2 : 1);
    let stunned = false;
    if (skillId === 'blind' && hits[0]?.grade !== 'miss') { this.stunned = true; stunned = true; }
    this.log.push(`${sk.name}: ${total} Schaden`);
    return { hits, total, stunned };
  }

  /** Gegenstand im Kampf. Ergebnis: { text } oder null, wenn nicht möglich. */
  useItem(id) {
    const it = this.state.item(id);
    if (!it || it.kind !== 'consumable' || !this.state.itemCount(id)) return null;
    this.state.removeItem(id);
    const parts = [];
    if (it.heal) parts.push(`+${this.state.heal(it.heal)} Leben`);
    if (it.composure) { this.state.setComposure(this.state.composure + it.composure); parts.push(`+${it.composure} Nerven`); }
    if (it.damage) {
      const dmg = it.damage * (this.enemy.occult ? 2 : 1);
      this.hurtEnemy(dmg);
      parts.push(`${dmg} Schaden`);
    }
    const text = `${it.name}: ${parts.join(', ')}`;
    this.log.push(text);
    return { text };
  }

  flee() {
    if (!this.enc.fleeable) return false;
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
    return atk;
  }

  /**
   * Wertet einen einzelnen Schlag aus. result: 'parry' | 'dodge' | 'miss'.
   * Ergebnis: { damage, counter }
   */
  resolveHit(attack, result) {
    if (result === 'parry') {
      this.gainAp(1);
      const counter = this.hitDamage(0.5, 'good');
      this.hurtEnemy(counter);
      return { damage: 0, counter };
    }
    if (result === 'dodge') return { damage: 0, counter: 0 };
    const damage = this.state.damage(attack.damage);
    if (this.state.hp === 0) this.outcome = 'lost';
    return { damage, counter: 0 };
  }

  /** Alle Schläge pariert: Gegenschlag. */
  riposte() {
    const dmg = this.hitDamage(1.5, 'perfect');
    this.hurtEnemy(dmg);
    this.log.push(`Gegenschlag: ${dmg} Schaden`);
    return dmg;
  }

  endRound() {
    this.round += 1;
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
