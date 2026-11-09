// Reiner Spielzustand ohne Phaser-Abhängigkeit, damit er auch in Node-Tests läuft.
import { pathwayMethods } from './Pathways.js';
import { gatheringMethods } from './Gatherings.js';
//
// Begriffe:
// - Hinweis (clue): eine einzelne Quelle, z. B. eine Spur oder eine Zeugenaussage.
// - Information (fact): die Behauptung, die ein Hinweis stützt. Mehrere Hinweise
//   können dieselbe Information stützen. 1 Quelle = Vermutung, ab 2 Quellen = sehr
//   wahrscheinlich. Falsche Informationen können widerlegt werden.
// - Schlussfolgerung (deduction): entsteht im Notizbuch aus zwei Informationen.
//   Sie gilt als gesichert, wenn beide Informationen sehr wahrscheinlich sind.
// - Ansehen (honor): Ruf bei der Polizei. Höhere Ränge öffnen Akten und Gespräche.
// - Leben (hp) und Inventar: Gegenstände heilen, beruhigen die Nerven oder helfen im Kampf.

export const COMPOSURE_MAX = 100;
export const VISION_DRAIN_PER_SEC = 9;
export const VISION_REGEN_PER_SEC = 6;
export const LIKELY_SOURCES = 2;
export const SAVE_VERSION = 4;
export const DEFAULT_HP = 40;

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
    this.maxHp = s.hp ?? DEFAULT_HP;
    this.hp = this.maxHp;
    this.inventory = { ...(s.items ?? {}) }; // id -> Anzahl
    this.storage = {}; // Lagerschrank im eigenen Büro: id -> Anzahl
    this.weapon = s.weapon ?? null;
    this.pendingCombat = null;
    this.tracked = null; // verfolgter Auftrag (Journal-Wegweiser)
    this.random = Math.random; // in Tests austauschbar
    for (const q of s.quests ?? []) this.quests[q] = 'active';
    this.tracked = s.quests?.[0] ?? null;
    this.resetPathway();
    this.resetGatherings();
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
      if (now !== old) {
        this.emit('fact', { id: f, status: now, previous: old });
        if (now === 'likely') this.act('fact_likely');
        if (now === 'refuted') this.act('fact_refuted');
      }
    }
    this.act('clue');
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
    this.addHonor((d.honor ?? 2) + (d.honor === 0 ? 0 : this.passive('conclusion_honor')), `Schlussfolgerung: ${d.name}`);
    this.act('conclusion');
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
    if (delta < 0) delta = Math.round(delta * this.passive('honor_loss'));
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
      none(o.hide_if_quests, (q) => this.quests[q] !== undefined) &&
      all(o.requires_items, (i) => this.itemCount(i) > 0) &&
      (o.requires_money === undefined || this.money >= o.requires_money) &&
      (o.requires_money_below === undefined || this.money < o.requires_money_below) &&
      (o.requires_beyonder === undefined || this.isBeyonder() === o.requires_beyonder) &&
      none(o.hide_if_items, (i) => this.itemCount(i) > 0) &&
      (o.requires_nerves === undefined || this.composure >= o.requires_nerves) &&
      (o.max_nerves === undefined || this.composure < o.max_nerves) &&
      (o.requires_gathering === undefined || this.gatheringOpen(o.requires_gathering) && this.isMember(o.requires_gathering)) &&
      (o.requires_gatherings_unlocked === undefined || this.gatheringsUnlocked() === o.requires_gatherings_unlocked)
    );
  }

  /** Erste passende Variante aus einer Liste [{node, ...bedingungen}] oder ein fester String. */
  pick(spec) {
    if (typeof spec === 'string' || spec === undefined || spec === null) return spec;
    // "chance" (0..1) macht eine Variante zum Wagnis: sie greift nur mit dieser Wahrscheinlichkeit.
    return spec.find((v) => this.meets(v) && (v.chance === undefined || this.random() < v.chance))?.node;
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
    for (const [id, n] of Object.entries(e.gives_items ?? {})) this.addItem(id, n);
    for (const [id, n] of Object.entries(e.takes_items ?? {})) this.removeItem(id, n);
    if (e.heal) this.heal(e.heal === 'full' ? this.maxHp : e.heal);
    if (e.gives_money) this.addMoney(e.gives_money, { loot: true, reason: e.honor_reason ?? '' });
    if (e.takes_money) this.addMoney(-e.takes_money);
    if (e.ending) this.setEnding(e.ending);
    if (e.damage) this.damage(Math.min(e.damage, this.hp - 1)); // außerhalb des Kampfes nie tödlich
    if (e.nerves) this.setComposure(this.composure + e.nerves);
    // Unruhe trifft nur Beyonder; wer keinen Trank hat, verliert stattdessen Nerven.
    if (e.unruhe) { if (this.isBeyonder()) this.setUnruhe(this.unruhe + e.unruhe); else this.setComposure(this.composure - e.unruhe); }
    if (e.combat) this.startCombat(e.combat);
    if (gained.length || e.sets_flags || e.start_quests || e.complete_quests || e.honor || e.gives_items || e.takes_items || e.gives_money || e.takes_money) this.emit('changed');
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
    // Neuer Hauptfall oder gerade nichts verfolgt: direkt als Ziel übernehmen
    if (!this.tracked || (this.quest(id).kind === 'main' && this.quest(this.tracked)?.kind !== 'main')) this.tracked = id;
    this.emit('quest', { id, status: 'active' });
    return true;
  }

  finishQuest(id, status) {
    const q = this.quest(id);
    if (!q) throw new Error(`Unbekannter Auftrag: ${id}`);
    if (this.quests[id] === 'done' || this.quests[id] === 'failed') return false;
    this.quests[id] = status;
    if (this.tracked === id) this.tracked = null;
    this.emit('quest', { id, status });
    if (status === 'done' && q.reward) this.applyEffects(q.reward);
    if (status === 'done') {
      const money = q.reward?.gives_money === undefined ? this.content.market?.quest_money?.[q.kind] ?? 0 : 0;
      if (money) this.addMoney(money, { loot: true, reason: q.title });
      this.act('quest');
      if (q.kind !== 'main') this.act('side_quest');
    }
    return true;
  }

  /** Auftrag im Journal verfolgen (Wegweiser im HUD, im Ort und auf der Stadtkarte). */
  track(id) {
    this.tracked = id && this.quests[id] === 'active' ? id : null;
    this.emit('track', this.tracked);
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

  // --- Leben & Inventar ----------------------------------------------------------------
  item(id) {
    return this.content.items[id];
  }

  itemCount(id) {
    return this.inventory[id] ?? 0;
  }

  addItem(id, n = 1) {
    const it = this.item(id);
    if (!it) throw new Error(`Unbekannter Gegenstand: ${id}`);
    this.inventory[id] = this.itemCount(id) + n;
    // Bessere Waffe automatisch ausrüsten
    if (it.kind === 'weapon' && (!this.weapon || it.atk > this.item(this.weapon).atk)) this.weapon = id;
    this.emit('item', { id, delta: n });
  }

  removeItem(id, n = 1) {
    if (this.itemCount(id) < n) return false;
    this.inventory[id] -= n;
    if (this.inventory[id] <= 0) delete this.inventory[id];
    if (this.weapon === id && !this.inventory[id]) this.weapon = null;
    this.emit('item', { id, delta: -n });
    return true;
  }

  /** Liste für das Inventar: [{id, count, ...gegenstand}] */
  items() {
    return Object.keys(this.inventory).map((id) => ({ id, count: this.inventory[id], ...this.item(id) }));
  }

  // --- Lager im eigenen Büro ------------------------------------------------------
  /** Beweisstücke (Art "key") bleiben beim Ermittler, alles andere darf in den Schrank. */
  canStore(id) {
    const it = this.item(id);
    return !!it && it.kind !== 'key';
  }

  storedCount(id) {
    return this.storage[id] ?? 0;
  }

  /** Liste für den Schrank: [{id, count, ...gegenstand}] */
  storedItems() {
    return Object.keys(this.storage).map((id) => ({ id, count: this.storage[id], ...this.item(id) }));
  }

  storeItem(id, n = 1) {
    if (!this.canStore(id)) return { ok: false, text: 'Beweisstücke behältst du lieber bei dir.' };
    n = Math.min(n, this.itemCount(id));
    if (n <= 0) return { ok: false, text: 'Davon hast du nichts dabei.' };
    this.removeItem(id, n);
    this.storage[id] = this.storedCount(id) + n;
    this.emit('changed');
    return { ok: true, text: `Eingelagert: ${this.item(id).name}${n > 1 ? ` ×${n}` : ''}.` };
  }

  retrieveItem(id, n = 1) {
    n = Math.min(n, this.storedCount(id));
    if (n <= 0) return { ok: false, text: 'Das liegt nicht im Schrank.' };
    this.storage[id] -= n;
    if (this.storage[id] <= 0) delete this.storage[id];
    this.addItem(id, n);
    this.emit('changed');
    return { ok: true, text: `Herausgenommen: ${this.item(id).name}${n > 1 ? ` ×${n}` : ''}.` };
  }

  weaponStats() {
    const w = this.weapon ? this.item(this.weapon) : { name: 'Fäuste', atk: 3 };
    const bonus = this.passive('atk');
    return bonus ? { ...w, atk: w.atk + bonus } : w;
  }

  equip(id) {
    if (this.item(id)?.kind !== 'weapon' || !this.itemCount(id)) return false;
    this.weapon = id;
    this.emit('changed');
    return true;
  }

  heal(n) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + n);
    if (this.hp !== before) this.emit('hp', { value: this.hp, delta: this.hp - before });
    return this.hp - before;
  }

  damage(n) {
    const before = this.hp;
    this.hp = Math.max(0, this.hp - n);
    if (this.hp !== before) this.emit('hp', { value: this.hp, delta: this.hp - before });
    return before - this.hp;
  }

  setComposure(v) {
    this.composure = Math.max(0, Math.min(COMPOSURE_MAX, v));
    this.emit('composure', this.composure);
  }

  /** Verbraucht einen Gegenstand außerhalb des Kampfes. Gibt eine Meldung zurück oder null. */
  useItem(id) {
    const it = this.item(id);
    if (!it || it.kind !== 'consumable' || !this.itemCount(id)) return null;
    if (it.combat_only) return `${it.name} hilft nur im Kampf.`;
    if (it.heal && this.hp >= this.maxHp && !it.composure && !it.calm) return 'Du bist unverletzt.';
    if (it.composure && this.composure >= COMPOSURE_MAX && !it.heal && !(it.calm && this.unruhe > 0)) return 'Deine Nerven sind ruhig.';
    this.removeItem(id);
    const parts = this.applyConsumable(it);
    this.emit('changed');
    return `${it.name}: ${parts.join(', ')}`;
  }

  /** Wirkung eines Verbrauchsguts (auch im Kampf). Gibt Textteile zurück. */
  applyConsumable(it) {
    const parts = [];
    if (it.heal) parts.push(`+${this.heal(Math.round(it.heal * this.passive('heal_bonus')))} Leben`);
    if (it.composure) { this.setComposure(this.composure + it.composure); parts.push(`+${it.composure} Nerven`); }
    const calm = (it.calm ?? 0) + (it.heal ? this.passive('use_calm') : 0);
    if (calm && this.unruhe > 0) { this.setUnruhe(this.unruhe - calm); parts.push(`-${calm} Unruhe`); }
    this.act('use_item');
    return parts;
  }

  /** Merkt einen Kampf vor. Die Oberfläche startet ihn, sobald das aktuelle Fenster zu ist. */
  startCombat(id) {
    if (!this.content.encounters[id]) throw new Error(`Unbekannter Kampf: ${id}`);
    this.pendingCombat = id;
    this.emit('combat', id);
  }

  // --- Enden -------------------------------------------------------------------------
  setEnding(id) {
    const end = this.content.endings[id];
    if (!end) throw new Error(`Unbekanntes Ende: ${id}`);
    this.endings[end.case] = id;
    this.emit('ending', id);
    this.applyEffects({ ...end, ending: undefined, honor_reason: end.title });
    if (end.honor > 0) this.addMoney(end.honor * 2, { loot: true, reason: end.title });
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
      this.composure = Math.max(0, this.composure - VISION_DRAIN_PER_SEC * this.passive('vision_cost') * dtSeconds);
      if (this.composure === 0) {
        this.setSpiritVision(false);
        this.emit('notice', 'Ein stechender Kopfschmerz reißt dich aus der Geistsicht.');
        if (this.pathway) this.setUnruhe(this.unruhe + 15);
      }
    } else {
      const calmMind = this.unruhe >= 60 ? 0.5 : 1;
      this.composure = Math.min(COMPOSURE_MAX, this.composure + VISION_REGEN_PER_SEC * this.passive('composure_regen') * calmMind * dtSeconds);
    }
    if (this.composure !== before) this.emit('composure', this.composure);
    this.tickPathway(dtSeconds);
    this.tickGatherings(dtSeconds);
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
      hp: this.hp,
      inventory: this.inventory,
      storage: this.storage,
      weapon: this.weapon,
      tracked: this.tracked,
      ...this.serializePathway(),
      ...this.serializeGatherings(),
    };
  }

  load(data) {
    if (!data || ![2, 3, SAVE_VERSION].includes(data.v)) return false;
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
    this.tracked = this.quests[data.tracked] === 'active' ? data.tracked : null;
    // Ab Version 3: Leben und Inventar (ältere Stände behalten die Startausrüstung)
    if (data.v >= 3) {
      this.hp = Math.max(1, Math.min(this.maxHp, data.hp ?? this.maxHp));
      this.inventory = Object.fromEntries(Object.entries(data.inventory ?? {}).filter(([i, n]) => this.item(i) && n > 0));
      this.weapon = this.inventory[data.weapon] ? data.weapon : null;
      this.storage = Object.fromEntries(Object.entries(data.storage ?? {}).filter(([i, n]) => this.item(i) && n > 0));
    }
    // Ab Version 4: Schilling, Pfad und Unruhe
    if (data.v >= 4) this.loadPathway(data);
    this.loadGatherings(data);
    if (!this.content.maps[this.map]) { this.map = this.content.start.map; this.position = null; }
    return true;
  }
}

Object.assign(GameState.prototype, pathwayMethods, gatheringMethods);
