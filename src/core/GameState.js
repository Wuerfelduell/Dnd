// Reiner Spielzustand ohne Phaser-Abhängigkeit, damit er auch in Node-Tests läuft.
// Alles, was ein Fall braucht (Hinweise, Schlussfolgerungen, Flags, Nerven,
// Geistsicht), lebt hier. Die Szene und das UI hören über on()/emit() zu.

export const COMPOSURE_MAX = 100;
export const VISION_DRAIN_PER_SEC = 9;
export const VISION_REGEN_PER_SEC = 6;

export class GameState {
  constructor(caseData) {
    this.caseData = caseData;
    this.listeners = new Map();
    this.reset();
  }

  reset() {
    this.clues = [];
    this.conclusions = [];
    this.flags = new Set();
    this.composure = COMPOSURE_MAX;
    this.spiritVision = false;
    this.ending = null;
  }

  // --- Events -------------------------------------------------------------
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  emit(event, payload) {
    for (const fn of this.listeners.get(event) ?? []) fn(payload);
  }

  // --- Hinweise & Schlussfolgerungen -----------------------------------------
  clue(id) {
    return this.caseData.clues[id];
  }

  deduction(id) {
    return this.caseData.deductions.find((d) => d.id === id);
  }

  hasClue(id) {
    return this.clues.includes(id);
  }

  hasConclusion(id) {
    return this.conclusions.includes(id);
  }

  /** Fügt einen Hinweis hinzu. Gibt true zurück, wenn er neu war. */
  addClue(id) {
    if (!this.clue(id)) throw new Error(`Unbekannter Hinweis: ${id}`);
    if (this.hasClue(id)) return false;
    this.clues.push(id);
    this.emit('clue', id);
    return true;
  }

  addConclusion(id) {
    if (!this.deduction(id)) throw new Error(`Unbekannte Schlussfolgerung: ${id}`);
    if (this.hasConclusion(id)) return false;
    this.conclusions.push(id);
    this.emit('conclusion', id);
    return true;
  }

  /**
   * Verknüpft zwei Hinweise im Notizbuch.
   * Ergebnis: { result: 'new' | 'known' | 'none', deduction? }
   */
  combine(a, b) {
    if (a === b || !this.hasClue(a) || !this.hasClue(b)) return { result: 'none' };
    const match = this.caseData.deductions.find((d) =>
      d.pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a)),
    );
    if (!match) return { result: 'none' };
    if (this.hasConclusion(match.id)) return { result: 'known', deduction: match };
    this.addConclusion(match.id);
    return { result: 'new', deduction: match };
  }

  // --- Dialoge -----------------------------------------------------------
  isChoiceAvailable(choice) {
    const all = (list, test) => (list ?? []).every(test);
    const none = (list, test) => !(list ?? []).some(test);
    return (
      all(choice.requires_clues, (c) => this.hasClue(c)) &&
      all(choice.requires_conclusions, (c) => this.hasConclusion(c)) &&
      all(choice.requires_flags, (f) => this.flags.has(f)) &&
      none(choice.hide_if_clues, (c) => this.hasClue(c)) &&
      none(choice.hide_if_flags, (f) => this.flags.has(f))
    );
  }

  /** Wendet die Effekte eines Dialogknotens an. Gibt die neu erhaltenen Hinweise zurück. */
  enterDialogueNode(node) {
    const gained = (node.gives_clues ?? []).filter((c) => this.addClue(c));
    for (const f of node.sets_flags ?? []) this.flags.add(f);
    if (node.ending) this.setEnding(node.ending);
    return gained;
  }

  setEnding(id) {
    if (!this.caseData.endings[id]) throw new Error(`Unbekanntes Ende: ${id}`);
    this.ending = id;
    this.emit('ending', id);
  }

  // --- Geistsicht & Nerven -------------------------------------------------
  setSpiritVision(active) {
    if (active && this.composure < 10) {
      this.emit('notice', 'Deine Nerven sind zu angespannt für die Geistsicht.');
      return false;
    }
    if (this.spiritVision === active) return true;
    this.spiritVision = active;
    this.emit('vision', active);
    return true;
  }

  tick(dtSeconds) {
    const before = this.composure;
    if (this.spiritVision) {
      this.composure = Math.max(0, this.composure - VISION_DRAIN_PER_SEC * dtSeconds);
      if (this.composure === 0) {
        this.setSpiritVision(false);
        this.emit('notice', 'Ein stechender Kopfschmerz reißt dich aus der Geistsicht.');
      }
    } else {
      this.composure = Math.min(COMPOSURE_MAX, this.composure + VISION_REGEN_PER_SEC * dtSeconds);
    }
    if (this.composure !== before) this.emit('composure', this.composure);
  }
}
