// Reiner Spielzustand ohne Phaser-Abhängigkeit, damit er auch in Node-Tests läuft.
//
// Begriffe:
// - Hinweis (clue): eine einzelne Quelle, z. B. eine Spur oder eine Zeugenaussage.
// - Information (fact): die Behauptung, die ein Hinweis stützt. Mehrere Hinweise
//   können dieselbe Information stützen. 1 Quelle = Vermutung, ab 2 Quellen = sehr
//   wahrscheinlich. Falsche Informationen können widerlegt werden.
// - Schlussfolgerung (deduction): entsteht im Notizbuch aus zwei Informationen.
//   Sie gilt als gesichert, wenn beide Informationen sehr wahrscheinlich sind.
// - Ansehen (honor): Ruf bei der Polizei. Höhere Ränge öffnen Akten und Gespräche.

export const COMPOSURE_MAX = 100;
export const VISION_DRAIN_PER_SEC = 9;
export const VISION_REGEN_PER_SEC = 6;
export const LIKELY_SOURCES = 2;
export const SAVE_VERSION = 2;

export class GameState {
  constructor(content) {
    this.content = content;
    this.listeners = new Map();
    this.reset();
  }

  reset() {
    const s = this.content.start;
    this.map = s.map;
    this.spawn = s.spawn;
    this.clues = [];
    this.conclusions = [];
    this.flags = new Set();
    this.quests = {}; // id -> 'active' | 'done' | 'failed'
    this.honor = s.honor;
    this.composure = COMPOSURE_MAX;
    this.spiritVision = false;
    this.endings = {}; // caseId -> endingId
    this.position = null;
    for (const q of s.quests ?? []) this.quests[q] = 'active';
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

  // --- Nachschlagen ----------------------------------------------------------
  clue(id) {
    return this.content.clues[id];
  }

  fact(id) {
    return this.content.facts[id];
  }

  deduction(id) {
    return this.content.deductions.find((d) => d.id === id);
  }

  hasClue(id) {
    return this.clues.includes(id);
  }

  hasConclusion(id) {
    return this.conclusions.includes(id);
  }

  // --- Informationen & Quellen ------------------------------------------------
  factSources(factId) {
    return this.clues.filter((c) => this.clue(c).fact === factId);
  }

  /** 'unknown' | 'suspected' | 'likely' | 'refuted' */
  factStatus(factId) {
    const f = this.fact(factId);
    const n = this.factSources(factId).length;
    if (n === 0) return 'unknown';
    const refuted = (f.refuted_by ?? []).some((c) => this.hasClue(c))
      || (f.refuted_if_likely ?? []).some((other) => this.factStatus(other) === 'likely');
    if (refuted) return 'refuted';
    return n >= LIKELY_SOURCES ? 'likely' : 'suspected';
  }

  knownFacts(caseId) {
    const seen = new Set(this.clues.map((c) => this.clue(c).fact));
    return Object.keys(this.content.facts).filter((f) => seen.has(f) && (!caseId || this.fact(f).case === caseId));
  }

  /** Eine Schlussfolgerung ist gesichert, wenn ein Paar komplett "sehr wahrscheinlich" ist. */
  isCertain(deductionId) {
    if (!this.hasConclusion(deductionId)) return false;
    return this.deduction(deductionId).pairs.some(([a, b]) => this.factStatus(a) === 'likely' && this.factStatus(b) === 'likely');
  }

  /** Fügt einen Hinweis hinzu. Gibt true zurück, wenn er neu war. */
  addClue(id) {
    const clue = this.clue(id);
    if (!clue) throw new Error(`Unbekannter Hinweis: ${id}`);
    if (this.hasClue(id)) return false;
    const before = this.snapshotFacts();
    this.clues.push(id);
    this.emit('clue', id);
    // Statuswechsel aller Informationen melden (auch indirekt widerlegte)
    for (const [f, old] of before) {
      const now = this.factStatus(f);
      if (now !== old) this.emit('fact', { id: f, status: now, previous: old });
    }
    return true;
  }

  snapshotFacts() {
    return Object.keys(this.content.facts).map((f) => [f, this.factStatus(f)]);
  }

  addConclusion(id) {
    const d = this.deduction(id);
    if (!d) throw new Error(`Unbekannte Schlussfolgerung: ${id}`);
    if (this.hasConclusion(id)) return false;
    this.conclusions.push(id);
    this.emit('conclusion', id);
    this.addHonor(d.honor ?? 2, `Schlussfolgerung: ${d.name}`);
    return true;
  }

  /**
   * Verknüpft zwei Informationen im Notizbuch.
   * Ergebnis: { result: 'new' | 'known' | 'none' | 'refuted', deduction? }
   */
  combine(a, b) {
    if (a === b) return { result: 'none' };
    const sa = this.factStatus(a);
    const sb = this.factStatus(b);
    if (sa === 'unknown' || sb === 'unknown') return { result: 'none' };
    if (sa === 'refuted' || sb === 'refuted') return { result: 'refuted' };
    const match = this.content.deductions.find((d) =>
      d.pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a)),
    );
    if (!match) return { result: 'none' };
    if (this.hasConclusion(match.id)) return { result: 'known', deduction: match };
    this.addConclusion(match.id);
    return { result: 'new', deduction: match };
  }

  // --- Ansehen -----------------------------------------------------------------
  rank(honor = this.honor) {
    const ranks = this.content.ranks;
    let r = ranks[0];
    for (const x of ranks) if (honor >= x.min) r = x;
    return r;
  }

  nextRank() {
    return this.content.ranks.find((r) => r.min > this.honor) ?? null;
  }

  addHonor(delta, reason) {
    if (!delta) return;
    const before = this.rank();
    this.honor = Math.max(0, Math.min(100, this.honor + delta));
    this.emit('honor', { delta, reason, value: this.honor });
    const after = this.rank();
    if (after !== before) this.emit('rank', { rank: after, up: after.min > before.min });
  }

  // --- Bedingungen & Effekte -------------------------------------------------------
  /** Prüft alle bekannten Bedingungsschlüssel eines Objekts (Dialogoption, Objekt, ...). */
  meets(o) {
    if (!o) return true;
    const all = (list, test) => (list ?? []).every(test);
    const none = (list, test) => !(list ?? []).some(test);
    const known = (f) => this.factStatus(f) !== 'unknown';
    return (
      all(o.requires_clues, (c) => this.hasClue(c)) &&
      (!o.requires_any_clues || o.requires_any_clues.some((c) => this.hasClue(c))) &&
      all(o.requires_facts, known) &&
      all(o.requires_likely, (f) => this.factStatus(f) === 'likely') &&
      all(o.requires_suspected, (f) => this.factStatus(f) === 'suspected') &&
      all(o.requires_conclusions, (c) => this.hasConclusion(c)) &&
      all(o.requires_certain, (c) => this.isCertain(c)) &&
      all(o.requires_flags, (f) => this.flags.has(f)) &&
      all(o.requires_quests_active, (q) => this.quests[q] === 'active') &&
      all(o.requires_quests_done, (q) => this.quests[q] === 'done') &&
      (o.requires_honor === undefined || this.honor >= o.requires_honor) &&
      (o.max_honor === undefined || this.honor < o.max_honor) &&
      none(o.hide_if_clues, (c) => this.hasClue(c)) &&
      none(o.hide_if_flags, (f) => this.flags.has(f)) &&
      none(o.hide_if_conclusions, (c) => this.hasConclusion(c)) &&
      none(o.hide_if_quests, (q) => this.quests[q] !== undefined)
    );
  }

  /** Erste passende Variante aus einer Liste [{node, ...bedingungen}] oder ein fester String. */
  pick(spec) {
    if (typeof spec === 'string' || spec === undefined || spec === null) return spec;
    return spec.find((v) => this.meets(v))?.node;
  }

  /** Wendet Effekte an (Dialogknoten, Objekte, Enden). Gibt die neuen Hinweise zurück. */
  applyEffects(e) {
    if (!e) return [];
    const gained = (e.gives_clues ?? []).filter((c) => this.addClue(c));
    for (const f of e.sets_flags ?? []) this.flags.add(f);
    for (const f of e.clears_flags ?? []) this.flags.delete(f);
    for (const q of e.start_quests ?? []) this.startQuest(q);
    for (const q of e.complete_quests ?? []) this.finishQuest(q, 'done');
    for (const q of e.fail_quests ?? []) this.finishQuest(q, 'failed');
    if (e.honor) this.addHonor(e.honor, e.honor_reason ?? '');
    if (e.ending) this.setEnding(e.ending);
    if (gained.length || e.sets_flags || e.start_quests || e.complete_quests || e.honor) this.emit('changed');
    return gained;
  }

  // --- Aufträge ---------------------------------------------------------------------
  quest(id) {
    return this.content.quests[id];
  }

  startQuest(id) {
    if (!this.quest(id)) throw new Error(`Unbekannter Auftrag: ${id}`);
    if (this.quests[id]) return false;
    this.quests[id] = 'active';
    this.emit('quest', { id, status: 'active' });
    return true;
  }

  finishQuest(id, status) {
    const q = this.quest(id);
    if (!q) throw new Error(`Unbekannter Auftrag: ${id}`);
    if (this.quests[id] === 'done' || this.quests[id] === 'failed') return false;
    this.quests[id] = status;
    this.emit('quest', { id, status });
    if (status === 'done' && q.reward) this.applyEffects(q.reward);
    return true;
  }

  questSteps(id) {
    return (this.quest(id).steps ?? []).map((s) => ({ text: s.text, done: this.meets(s.done) }));
  }

  /** Nächster offener Schritt des wichtigsten aktiven Auftrags (für Tipps). */
  nextHint() {
    const active = Object.keys(this.quests).filter((q) => this.quests[q] === 'active');
    active.sort((a, b) => (this.quest(a).kind === 'main' ? -1 : 1) - (this.quest(b).kind === 'main' ? -1 : 1));
    for (const q of active) {
      const step = this.questSteps(q).find((s) => !s.done);
      if (step) return { quest: this.quest(q).title, text: step.text };
    }
    return null;
  }

  // --- Enden -------------------------------------------------------------------------
  setEnding(id) {
    const end = this.content.endings[id];
    if (!end) throw new Error(`Unbekanntes Ende: ${id}`);
    this.endings[end.case] = id;
    this.emit('ending', id);
    this.applyEffects({ ...end, ending: undefined, honor_reason: end.title });
  }

  // --- Geistsicht & Nerven -------------------------------------------------------------
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

  // --- Speichern -------------------------------------------------------------------------
  serialize(position) {
    return {
      v: SAVE_VERSION,
      map: this.map,
      position: position ?? null,
      clues: this.clues,
      conclusions: this.conclusions,
      flags: [...this.flags],
      quests: this.quests,
      honor: this.honor,
      endings: this.endings,
    };
  }

  load(data) {
    if (!data || data.v !== SAVE_VERSION) return false;
    this.reset();
    this.map = data.map;
    this.spawn = null;
    this.position = data.position;
    // Nur noch existierende Inhalte übernehmen (falls sich die Daten geändert haben)
    this.clues = data.clues.filter((c) => this.clue(c));
    this.conclusions = data.conclusions.filter((c) => this.deduction(c));
    this.flags = new Set(data.flags);
    this.quests = Object.fromEntries(Object.entries(data.quests).filter(([q]) => this.quest(q)));
    this.honor = data.honor;
    this.endings = data.endings ?? {};
    if (!this.content.maps[this.map]) { this.map = this.content.start.map; this.position = null; }
    return true;
  }
}
