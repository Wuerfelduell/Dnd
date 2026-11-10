// Reiner Spielzustand ohne Phaser-Abhängigkeit, damit er auch in Node-Tests läuft.
import { pathwayMethods } from './Pathways.js';
import { gatheringMethods } from './Gatherings.js';
import { auctionMethods } from './Auction.js';
import { artisanMethods } from './Artisan.js';
import { wantedMethods } from './Wanted.js';
import { kahnMethods } from './Kahn.js';
import { newspaperMethods } from './Newspapers.js';
import { signalMethods } from './Signals.js';
import { claimMethods } from './Claims.js';
import { claimEinbauMethods } from './ClaimsEinbau.js';
import { clockMethods, NIGHT_FLAG } from './Clock.js';
import { bondMethods } from './Bonds.js';
import { relationMethods } from './Relations.js';
import { artifactMethods } from './Artifacts.js';
import { partyMethods } from './Party.js';
import { gearMethods } from './Gear.js';
import { corruptionMethods } from './Corruption.js';

/** Tragkraft in Pfund. Gegenstände ohne eigenes "weight" wiegen je nach Art so viel. */
export const BASE_CARRY = 40;
/** Pfund Tragkraft je Wachstumsstufe des Pfades (jede Sequenz eine, Durchbrüche mehr, siehe growthSteps). */
export const CARRY_PER_STEP = 3;
export const KIND_WEIGHT = { weapon: 4, gear: 2, artifact: 2, consumable: 1, potion: 1, ingredient: 0.5, trophy: 2, formula: 0, key: 0 };
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

export const COMPOSURE_MAX = 100; // Grundwert; der echte Höchstwert ist maxComposure() (wächst mit den Sequenzen)
export const VISION_DRAIN_PER_SEC = 9;
export const VISION_REGEN_PER_SEC = 6;
export const LIKELY_SOURCES = 2;
/** Anteil, zu dem Ansehens-Gewinne zählen (Verluste zählen voll). So kommt Rang 4 etwa ab Fall 6/7, nicht schon nach Fall 3. */
export const HONOR_GAIN = 0.25;
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
    this.honorCarry = 0;
    this.composure = COMPOSURE_MAX;
    this.spiritVision = false;
    this.endings = {}; // caseId -> endingId
    this.position = null;
    this.maxHp = s.hp ?? DEFAULT_HP;
    this.hp = this.maxHp;
    this.inventory = { ...(s.items ?? {}) }; // id -> Anzahl
    this.storage = {}; // Lagerschrank im eigenen Büro: id -> Anzahl
    this.stashes = {}; // weitere Verstecke (z. B. der Torfkahn in Wexmoor): ort -> { id -> Anzahl }
    this.weapon = s.weapon ?? null;
    this.gear = { hut: null, mantel: null, amulett: null }; // angelegte Kleidung (Gear.js)
    this.pendingCombat = null;
    this.tracked = null; // verfolgter Auftrag (Journal-Wegweiser)
    this.random = Math.random; // in Tests austauschbar
    for (const q of s.quests ?? []) this.quests[q] = 'active';
    this.tracked = s.quests?.[0] ?? null;
    this.resetCorruption();
    this.resetPathway();
    this.resetGatherings();
    this.resetWanted();
    this.resetBonds();
    this.resetRelations();
    this.resetParty();
    this.resetClaims(); // Paket BG
    this.resetPapers();
    this.resetSignal();
    this.pendingTravel = null;
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
    return Object.keys(this.content.facts).filter((f) => seen.has(f) && (!caseId || this.fact(f).case === caseId || this.crossListed(f, caseId)));
  }

  /**
   * Querverbindung: Eine Information aus einem anderen Fall taucht auch in caseId auf, sobald ihre Bedingung erfüllt ist
   * (fact.also = [{ case, ...Bedingungen }]). So hängen zwei Fälle zusammen, die erst nichts miteinander zu tun haben.
   */
  /** Alle aktiven Querverbindungen bekannter Informationen als Set "fact>case". */
  crossLinks() {
    const out = new Set();
    for (const f of this.knownFacts()) for (const a of this.fact(f).also ?? []) if (this.meets(a)) out.add(`${f}>${a.case}`);
    return out;
  }

  crossListed(factId, caseId) {
    return (this.fact(factId).also ?? []).some((a) => a.case === caseId && this.meets(a));
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
    const crossBefore = this.crossLinks();
    this.clues.push(id);
    this.emit('clue', id);
    // Neue Querverbindungen zwischen Fällen melden
    for (const link of this.crossLinks()) if (!crossBefore.has(link)) this.emit('cross', { fact: link.split('>')[0], case: link.split('>')[1] });
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

  /**
   * Ansehen ändern. Gewinne zählen nur zu HONOR_GAIN (Rest wird mitgenommen), damit die Ränge
   * über das ganze Kapitel verteilt kommen und nicht schon nach Fall 3 voll sind. Verluste zählen voll.
   * Gibt die tatsächliche Änderung zurück.
   */
  addHonor(delta, reason) {
    if (!delta) return 0;
    if (delta < 0) delta = Math.round(delta * this.passive('honor_loss'));
    else {
      const raw = delta * HONOR_GAIN + (this.honorCarry ?? 0);
      delta = Math.floor(raw);
      this.honorCarry = raw - delta;
    }
    if (!delta) return 0;
    const before = this.rank();
    const old = this.honor;
    this.honor = Math.max(0, Math.min(100, this.honor + delta));
    delta = this.honor - old;
    this.emit('honor', { delta, reason, value: this.honor });
    const after = this.rank();
    if (after !== before) this.emit('rank', { rank: after, up: after.min > before.min });
    return delta;
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
      (!o.requires_any_quests_active || o.requires_any_quests_active.some((q) => this.quests[q] === 'active')) &&
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
      (o.requires_gatherings_unlocked === undefined || this.gatheringsUnlocked() === o.requires_gatherings_unlocked) &&
      this.meetsPathway(o.requires_pathway) &&
      this.meetsSignal(o) &&
      this.meetsBond(o) &&
      this.meetsRelation(o) &&
      this.meetsClaims(o) // Paket BG: requires_claim, requires_claim_missing, requires_p2, requires_replacement
    );
  }

  /**
   * Kapitel 3 (AU/AS): `requires_pathway: [pfad, grenze]` verlangt diesen Pfad mit Sequenz grenze oder besser,
   * ein bloßer Pfadname nur den Pfad. Ohne Pfad gilt die Bedingung als nicht erfüllt.
   */
  meetsPathway(req) {
    if (req === undefined) return true;
    const [pid, max] = Array.isArray(req) ? req : [req, 9];
    return this.pathway?.id === pid && this.pathway.seq <= max;
  }

  /** Erste passende Variante aus einer Liste [{node, ...bedingungen}] oder ein fester String. */
  pick(spec) {
    if (typeof spec === 'string' || spec === undefined || spec === null) return spec;
    // "chance" (0..1) macht eine Variante zum Wagnis: sie greift nur mit dieser Wahrscheinlichkeit.
    return spec.find((v) => this.meets(v) && (v.chance === undefined || this.random() < v.chance))?.node;
  }

  /**
   * Wendet Effekte an (Dialogknoten, Objekte, Enden). Gibt die neuen Hinweise zurück.
   * nodeKey ("dialog.knoten"): Beziehungswirkungen (`relation`) zählen nur beim ersten Besuch des Knotens.
   */
  applyEffects(e, { nodeKey = null, commandId = null } = {}) {
    if (!e) return [];
    const gained = (e.gives_clues ?? []).filter((c) => this.addClue(c));
    for (const f of e.sets_flags ?? []) { this.flags.add(f); this.openClaims(f); } // BG: bewältigte Quelle öffnet Ansprüche
    if (e.signal || e.signal_reserve) this.applySignal(e); // Kapitel 3: Rufladungen
    for (const f of e.clears_flags ?? []) this.flags.delete(f);
    for (const q of e.start_quests ?? []) this.startQuest(q);
    for (const q of e.complete_quests ?? []) this.finishQuest(q, 'done');
    for (const q of e.fail_quests ?? []) this.finishQuest(q, 'failed');
    if (e.honor) this.addHonor(e.honor, e.honor_reason ?? '');
    for (const [id, n] of Object.entries(e.gives_items ?? {})) this.addItem(id, n);
    if (e.gives_items) this.settleClaims(e.gives_items); // BG: Bestandsauszahlung erfüllt den eigenen Anspruch
    if (e.claim || e.replacement) this.applyClaims(e, { commandId }); // BG: persönliche Abholung bzw. Ersatzprobe (nur mit bestätigtem Befehl)
    for (const [id, n] of Object.entries(e.takes_items ?? {})) this.removeItem(id, n);
    if (e.heal) { this.heal(e.heal === 'full' ? this.maxHp : e.heal); this.healPartner(e.heal); }
    if (e.gives_money) this.addMoney(e.gives_money, { loot: true, reason: e.honor_reason ?? '' });
    if (e.takes_money) this.addMoney(-e.takes_money);
    if (e.ending) this.setEnding(e.ending);
    if (e.damage) this.damage(Math.min(e.damage, this.hp - 1)); // außerhalb des Kampfes nie tödlich
    if (e.nerves) this.setComposure(this.composure + e.nerves);
    // Unruhe trifft nur Beyonder; wer keinen Trank hat, verliert stattdessen Nerven.
    if (e.unruhe) { if (this.isBeyonder()) this.setUnruhe(this.unruhe + e.unruhe); else this.setComposure(this.composure - e.unruhe); }
    if (e.combat) this.startCombat(e.combat);
    // Fahndung: Zahl ≥ 0 = Mindeststufe (Ausbruch, Flucht), negative Zahl = um so viele Stufen senken (Paket AB)
    if (Number.isFinite(e.wanted) && this.content.police) this.setWanted(e.wanted < 0 ? Math.max(0, this.wanted + e.wanted) : Math.max(this.wanted, e.wanted), e.wanted_reason ?? '');
    for (const [id, n] of Object.entries(e.bond ?? {})) this.changeBond(id, n); // Einzelgänger: Freund oder Feind; Gefährten (Zunder): nur Vertrauen
    if (e.relation && !(nodeKey && this.seenNodes?.has(nodeKey))) for (const [id, n] of Object.entries(e.relation)) this.changeRelation(id, n); // Beziehung (Stimmung der Figur)
    if (e.travel) this.pendingTravel = e.travel; // Ortswechsel nach dem Fenster (z. B. aus der Zelle)
    if (e.sets_flags || e.ending) this.checkPapers(); // Paket AD: neue Zeitungsausgabe?
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

  /**
   * Offene Spuren: Aufträge, die noch nicht angenommen sind, aber schon abgeholt werden können
   * (Feld `lead` im Auftrag, einzeln oder als Liste von Varianten). Fall 8 kommt z. B. nicht von
   * Marlowe, sondern von Nan Kettle am Nachtmarkt. Ergebnis: [{ quest, title, text, target }].
   */
  openLeads() {
    const out = [];
    for (const [id, q] of Object.entries(this.content.quests)) {
      if (!q.lead || this.quests[id] !== undefined) continue;
      const lead = (Array.isArray(q.lead) ? q.lead : [q.lead]).find((l) => this.meets(l));
      if (lead) out.push({ quest: id, title: q.title, text: lead.text, target: lead.target ?? null });
    }
    return out;
  }

  /** Nächster offener Schritt des wichtigsten aktiven Auftrags (für Tipps); sonst die nächste offene Spur. */
  nextHint() {
    const active = Object.keys(this.quests).filter((q) => this.quests[q] === 'active');
    active.sort((a, b) => (this.quest(a).kind === 'main' ? -1 : 1) - (this.quest(b).kind === 'main' ? -1 : 1));
    for (const q of active) {
      const step = this.questSteps(q).find((s) => !s.done);
      if (step) return { quest: this.quest(q).title, text: step.text };
    }
    const lead = this.openLeads()[0];
    return lead ? { quest: lead.title, text: lead.text, lead: true } : null;
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
    const wasHeavy = this.isOverloaded();
    const had = this.itemCount(id);
    this.inventory[id] = had + n;
    // Bessere Waffe automatisch ausrüsten
    if (it.kind === 'weapon' && (!this.weapon || it.atk > this.item(this.weapon).atk)) this.weapon = id;
    if (n > 0) this.gearPickedUp(id);
    if (n > 0) this.recordClaimItem?.(id); // BG: Erwerbsquittung für Kernzutat oder Trank
    this.emit('item', { id, delta: n });
    if (it.kind === 'artifact' && !had && n > 0) this.artifactPickedUp(id);
    // Beute geht nie verloren: wer zu viel trägt, wird nur langsamer.
    if (!wasHeavy && this.isOverloaded()) this.emit('notice', `Zu schwer beladen (${this.carryText()}). Du kommst nur langsam voran. Lagere etwas ein oder wirf es weg.`);
  }

  removeItem(id, n = 1) {
    if (this.itemCount(id) < n) return false;
    this.inventory[id] -= n;
    if (this.inventory[id] <= 0) delete this.inventory[id];
    if (this.weapon === id && !this.inventory[id]) this.weapon = null;
    this.gearDropped(id);
    if (!this.inventory[id] && this.item(id)?.kind === 'artifact') this.dropArtifactIfGone(id);
    this.corruptionDropped(id);
    this.emit('item', { id, delta: -n });
    return true;
  }

  /** Liste für das Inventar: [{id, count, ...gegenstand}] */
  items() {
    return Object.keys(this.inventory).map((id) => ({ id, count: this.inventory[id], ...this.item(id) }));
  }

  // --- Tragkraft --------------------------------------------------------------------
  /** Gewicht eines Stücks in Pfund. Beweisstücke und Rezepte wiegen nichts. */
  itemWeight(id) {
    const it = this.item(id);
    if (!it) return 0;
    return it.weight ?? KIND_WEIGHT[it.kind] ?? 1;
  }

  carryWeight() {
    let w = 0;
    for (const [id, n] of Object.entries(this.inventory)) w += this.itemWeight(id) * n;
    return Math.round(w * 10) / 10;
  }

  /** Was die erreichten Sequenzen an Tragkraft bringen (Spieler 2 rechnet mit seinem eigenen Pfad). */
  carryFromSeq() {
    return CARRY_PER_STEP * this.growthSteps();
  }

  /** Grundlast plus Sequenzen plus Boni (Pfad des Eisens, Kleidung, Artefakte). */
  carryCapacity() {
    return BASE_CARRY + this.carryFromSeq() + this.passive('carry');
  }

  /** Woher die Tragkraft kommt, für Inventar und Pfad: "40 Grundlast + 6 Sequenzen + 15 Boni". */
  carryBreakdown() {
    const parts = [`${BASE_CARRY} Grundlast`];
    if (this.carryFromSeq()) parts.push(`${this.carryFromSeq()} Sequenzen`);
    if (this.passive('carry')) parts.push(`${this.passive('carry')} Boni`);
    return parts.join(' + ');
  }

  isOverloaded() {
    return this.carryWeight() > this.carryCapacity();
  }

  carryText() {
    const f = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
    return `${f(this.carryWeight())}/${f(this.carryCapacity())} Pfund`;
  }

  /** Wegwerfen: weg ist weg. Beweisstücke und geliehene Artefakte gehen nicht. */
  canDrop(id) {
    const it = this.item(id);
    return !!it && it.kind !== 'key' && !(this.borrowed ?? []).includes(id);
  }

  dropItem(id, n = 1) {
    if (!this.canDrop(id)) return { ok: false, text: 'Das kannst du nicht einfach wegwerfen.' };
    n = Math.min(n, this.itemCount(id));
    if (n <= 0) return { ok: false, text: 'Davon hast du nichts dabei.' };
    this.removeItem(id, n);
    this.emit('changed');
    return { ok: true, text: `Weggeworfen: ${this.item(id).name}${n > 1 ? ` ×${n}` : ''}.` };
  }

  // --- Lager im eigenen Büro ------------------------------------------------------
  /** Beweisstücke (Art "key") bleiben beim Ermittler, alles andere darf in den Schrank. */
  canStore(id) {
    const it = this.item(id);
    return !!it && it.kind !== 'key';
  }

  /** Inhalt eines Lagers. 'buero' ist der Asservatenschrank, alles andere ein eigenes Versteck. */
  stash(where = 'buero') {
    if (where === 'buero') return this.storage;
    return (this.stashes[where] ??= {});
  }

  storedCount(id, where = 'buero') {
    return this.stash(where)[id] ?? 0;
  }

  /** Liste für den Schrank: [{id, count, ...gegenstand}] */
  storedItems(where = 'buero') {
    const st = this.stash(where);
    return Object.keys(st).map((id) => ({ id, count: st[id], ...this.item(id) }));
  }

  storeItem(id, n = 1, where = 'buero') {
    if (!this.canStore(id)) return { ok: false, text: 'Beweisstücke behältst du lieber bei dir.' };
    n = Math.min(n, this.itemCount(id));
    if (n <= 0) return { ok: false, text: 'Davon hast du nichts dabei.' };
    // Erst in den Schrank, dann aus der Tasche: so bleibt ein geliehenes Artefakt Revier-Eigentum.
    const st = this.stash(where);
    st[id] = (st[id] ?? 0) + n;
    this.removeItem(id, n);
    this.emit('changed');
    return { ok: true, text: `Eingelagert: ${this.item(id).name}${n > 1 ? ` ×${n}` : ''}.` };
  }

  retrieveItem(id, n = 1, where = 'buero') {
    const st = this.stash(where);
    n = Math.min(n, st[id] ?? 0);
    if (n <= 0) return { ok: false, text: 'Das liegt nicht im Schrank.' };
    st[id] -= n;
    if (st[id] <= 0) delete st[id];
    this.addItem(id, n);
    this.emit('changed');
    return { ok: true, text: `Herausgenommen: ${this.item(id).name}${n > 1 ? ` ×${n}` : ''}.` };
  }

  weaponStats() {
    const w = this.weapon ? this.item(this.weapon) : { name: 'Fäuste', atk: 3 };
    // Eine korrumpierte Waffe beißt besser, aber sie beißt auch dich (Corruption.js)
    const bonus = this.passive('atk') + (this.weapon && this.isCorrupted(this.weapon) ? this.corruptionRules().weapon_atk_bonus : 0);
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

  /** Schaden am Spieler. Artefakte und Passive verändern ihn (damage_taken). */
  damage(n) {
    if (n > 0) n = Math.max(1, Math.round(n * this.passive('damage_taken')));
    const before = this.hp;
    this.hp = Math.max(0, this.hp - n);
    if (this.hp !== before) this.emit('hp', { value: this.hp, delta: this.hp - before });
    return before - this.hp;
  }

  setComposure(v) {
    this.composure = Math.max(0, Math.min(this.maxComposure(), v));
    this.emit('composure', this.composure);
  }

  /** Verbraucht einen Gegenstand außerhalb des Kampfes. Gibt eine Meldung zurück oder null. */
  useItem(id) {
    const it = this.item(id);
    if (!it || it.kind !== 'consumable' || !this.itemCount(id)) return null;
    if (it.combat_only) return `${it.name} hilft nur im Kampf.`;
    if (it.cleanse) return this.corruptedItems().length ? 'Reibe damit das korrumpierte Stück ein: Im Inventar steht bei ihm „Reinigen“.' : 'Nichts an dir ist korrumpiert. Heb das Salz auf.';
    if (it.heal && this.hp >= this.maxHp && !it.composure && !it.calm && !this.kahnFoodHelps(id)) return 'Du bist unverletzt.';
    if (it.composure && this.composure >= this.maxComposure() && !it.heal && !(it.calm && this.unruhe > 0)) return 'Deine Nerven sind ruhig.';
    this.removeItem(id);
    const parts = this.applyConsumable(it);
    parts.push(...this.kahnItemBonus(id));
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
    this.combatBy = this.acting; // Paket BF: wer den Kampf ausgelöst hat (Prüfling), der andere schaut zu
    this.emit('combat', id);
  }

  // --- Enden -------------------------------------------------------------------------
  setEnding(id) {
    const end = this.content.endings[id];
    if (!end) throw new Error(`Unbekanntes Ende: ${id}`);
    this.endings[end.case] = id;
    this.emit('ending', id);
    const before = this.honor;
    this.applyEffects({ ...end, ending: undefined, honor_reason: end.title });
    this.lastEndingHonor = this.honor - before; // fürs Endbild: tatsächlich gewonnenes Ansehen
    if (end.honor > 0) this.addMoney(end.honor * 2, { loot: true, reason: end.title });
  }

  /** AP/AR: Epilogszenen zum Ende, deren Bedingungen erfüllt sind, in Dateireihenfolge. */
  epilogue(endId) {
    return (this.content.epiloge ?? []).filter((e) => e.ending === endId
      && (e.requires_flags ?? []).every((f) => this.flags.has(f))
      && !(e.hide_if_flags ?? []).some((f) => this.flags.has(f)));
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
      this.composure = Math.min(this.maxComposure(), this.composure + VISION_REGEN_PER_SEC * this.passive('composure_regen') * calmMind * dtSeconds);
    }
    if (this.composure !== before) this.emit('composure', this.composure);
    this.tickPathway(dtSeconds);
    this.tickGatherings(dtSeconds);
    this.tickWanted(dtSeconds);
    this.tickParty(dtSeconds);
  }

  // --- Speichern -------------------------------------------------------------------------
  serialize(position) {
    return {
      v: SAVE_VERSION,
      map: this.map,
      position: position ?? null,
      clues: this.clues,
      conclusions: this.conclusions,
      flags: [...this.flags].filter((f) => f !== NIGHT_FLAG),
      quests: this.quests,
      honor: this.honor,
      honorCarry: this.honorCarry,
      endings: this.endings,
      hp: this.hp,
      inventory: this.inventory,
      storage: this.storage,
      stashes: this.stashes,
      weapon: this.weapon,
      gear: this.gear,
      tracked: this.tracked,
      ...this.serializePathway(),
      ...this.serializeCorruption(),
      ...this.serializeGatherings(),
      ...this.serializeWanted(),
      bonds: this.serializeBonds(),
      ...this.serializeRelations(),
      ...this.serializeParty(),
      papers: this.papers,
      ...this.serializeSignal(),
      ...this.serializeClaims(),
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
    this.honorCarry = data.honorCarry ?? 0;
    this.endings = data.endings ?? {};
    // Freischaltungen aus erreichten Enden nachtragen (z. B. der Kanalhafen nach dem falschen Ende von Fall 3,
    // das ihn in älteren Ständen nicht freigeschaltet hat). Ortsfreigaben werden nie zurückgenommen.
    for (const id of Object.values(this.endings)) {
      for (const f of this.content.endings[id]?.sets_flags ?? []) if (f.startsWith('travel_')) this.flags.add(f);
    }
    // AP Akt V: alte Stände mit besiegtem Leuchtfeuer überspringen die neuen Turmschritte (ohne Belohnungen
    // oder Zunders Vertrauen); wer die Insel schon erreicht hat, behält die Überfahrt
    if (this.flags.has('won_leuchtfeuer') || this.flags.has('kapitel2_done')) for (const f of K2_AKT5_STEPS) this.flags.add(f);
    else if (this.flags.has('k2_am_turm')) this.flags.add('k2v_boot_bereit');
    this.tracked = this.quests[data.tracked] === 'active' ? data.tracked : null;
    // Ab Version 3: Leben und Inventar (ältere Stände behalten die Startausrüstung)
    if (data.v >= 3) {
      this.hp = Math.max(1, Math.min(this.maxHp, data.hp ?? this.maxHp));
      this.inventory = Object.fromEntries(Object.entries(data.inventory ?? {}).filter(([i, n]) => this.item(i) && n > 0));
      this.weapon = this.inventory[data.weapon] ? data.weapon : null;
      this.gear = this.cleanGear(data.gear, this.inventory);
      this.storage = Object.fromEntries(Object.entries(data.storage ?? {}).filter(([i, n]) => this.item(i) && n > 0));
      this.stashes = Object.fromEntries(Object.entries(data.stashes ?? {}).map(([w, st]) => [w, Object.fromEntries(Object.entries(st ?? {}).filter(([i, n]) => this.item(i) && n > 0))]));
    }
    // Ab Version 4: Schilling, Pfad und Unruhe
    if (data.v >= 4) this.loadPathway(data);
    this.loadCorruption(data);
    this.loadGatherings(data);
    this.loadWanted(data);
    this.loadBonds(data.bonds);
    this.loadRelations(data);
    this.loadParty(data);
    this.loadClaims(data);
    if (data.claims === undefined) this.migrateLegacyClaims(); // BG: alte Spielstände ohne Register
    this.loadPapers(data);
    this.loadSignal(data);
    this.syncClock(); // Tag/Nacht folgt der Spielzeit, nicht dem Spielstand
    if (!this.content.maps[this.map]) { this.map = this.content.start.map; this.position = null; }
    return true;
  }
}

/** Fortschrittsflags der verlängerten Akt-V-Fassung (AP), in Spielreihenfolge. */
export const K2_AKT5_STEPS = ['k2v_boot_bereit', 'k2v_keller_passiert', 'k2v_aufstieg_passiert', 'k2v_abschied_done'];

Object.assign(GameState.prototype, partyMethods, gearMethods, corruptionMethods, pathwayMethods, artifactMethods, gatheringMethods, wantedMethods, bondMethods, relationMethods, auctionMethods, artisanMethods, kahnMethods, newspaperMethods, signalMethods, clockMethods, claimMethods, claimEinbauMethods);
