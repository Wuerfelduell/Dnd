// Aufstieg über Tränke: Pfade, Sequenzen, Verdauung, Unruhe und Schilling.
//
// Begriffe:
// - Pfad (pathway): eine von sieben Linien (Laterne, Faden, Maske, Echo, Kessel, Eisen, Schlüssel).
// - Sequenz: Stufe auf dem Pfad. Man beginnt mit 9 und steigt bis 5 auf (kleiner = stärker).
//   Jede erreichte Sequenz bringt mehr Leben und Nerven (growth im Pfad).
// - Verdauung (digestion, 0–100): wächst, wenn man nach dem Grundsatz des Pfades handelt
//   (state.act). Erst bei 100 verträgt man den nächsten Trank gefahrlos.
// - Unruhe (0–100): kommt mit jedem Trank, mit Geistsicht und zerrütteten Nerven. Klingt mit der
//   Zeit und durch passendes Handeln ab. Bei 100 droht der Kontrollverlust (Ohnmacht, nie Game Over).
// - Schilling: Währung für die Händler auf dem Nachtmarkt.
//
// Die Methoden werden in GameState eingehängt (siehe unten in GameState.js).

import { encounterSeq } from './Fear.js';
import { PROBE_NAMEN } from './Proben.js';

export const SEQ_START = 9;
export const SEQ_MAX = 1; // höchste erreichbare Stufe (Kapitel 3 bringt die Kernzutaten für 4 bis 1)
// Verdauungstempo je Sequenz. Bis Sequenz 7 wie gehabt; ab Sequenz 6 wird es brutal:
// jede weitere Sequenz verdaut zehnmal so langsam wie die davor (6 = 1/10 von 7, 5 = 1/100, ...).
export const DIGEST_SLOW_FACTOR = 10;
export const DIGEST_RATE = { 9: 1, 8: 0.7, 7: 0.5, 6: 0.05, 5: 0.005, 4: 0.0005, 3: 0.00005, 2: 0.000005, 1: 0.0000005 };
/** Verdauungstempo einer Sequenz im Verhältnis zu Sequenz 7 (1 bis Sequenz 7, danach 1/10, 1/100, ...). */
/** Faktor für jede Unruhe-Steigerung ab Sequenz 5 (Seb 2026-11-12). */
export const UNRUHE_GAIN_HOCH = 0.5;
export function digestSlowdown(seq) { return Math.min(1, (DIGEST_RATE[seq] ?? DIGEST_RATE[1]) / DIGEST_RATE[7]); }
/** Prozentwert fürs Auge: große Werte mit einer Nachkommastelle, winzige mit zwei gültigen Ziffern. */
export function fmtDigest(v) {
  if (v >= 1) return String(Math.round(v * 10) / 10);
  if (v <= 0) return '0';
  return String(Number(v.toPrecision(2)));
}
export const COMPOSURE_BASE = 100;
export const DEFAULT_GROWTH = { hp: 5, nerves: 5 };
// Durchbrüche: Sequenz 7 und 6 zählen beim Wachstum doppelt (große Sprünge an Leben und Nerven).
// Sequenz 5 ist der große Durchbruch (Kapitel 2); 4 bis 1 wie von AF/AU empfohlen auf den Bestand aufgesetzt
/** Mindestsprung der maximalen Leben beim Aufstieg 6 → 5 (Seb 2026-11-12). */
export const SEQ5_HP_JUMP = 1.35;
/** Mindestsprung beim Aufstieg 5 → 4 (Seb 2026-11-12): doppelte Leben, +50 % Nerven gegenüber Sequenz 5. */
export const SEQ4_HP_JUMP = 2;
export const SEQ4_NERVES_JUMP = 1.5;
export const SEQ_GROWTH_STEPS = { 7: 2, 6: 2, 5: 3, 4: 4, 3: 2, 2: 5, 1: 3 };
/**
 * Die hohen Durchbrüche (Seb, 2026-11-11): Sequenz 4 macht einen Halbgott aus dem Ermittler, Sequenz 2 einen Engel.
 * Dazwischen (3 und 1) gute, aber keine brutalen Sprünge. Die Passiven werden beim Laden an die Stufen 4 bis 1
 * aller zehn Pfade gehängt (data/sequenzen.js), zusätzlich zu dem, was jeder Pfad dort schon mitbringt.
 */
export const HOCH_DURCHBRUCH = {
  4: {
    titel: 'Halbgott',
    passives: [
      { key: 'ap_start', value: 2, text: 'Halbgott: Jeder Kampf beginnt mit zwei weiteren Punkten Konzentration.' },
      { key: 'ap_max', value: 1, text: 'Halbgott: +1 maximale Konzentration.' },
      { key: 'dmg_mult', value: 1.6, text: 'Halbgott: +60 % Schaden mit allen Angriffen und Fertigkeiten.' },
      { key: 'damage_taken', value: 0.7, text: 'Halbgott: Du nimmst 30 % weniger Schaden.' },
      { key: 'max_hp', value: 25, text: 'Halbgott: doppelt so viele Leben wie auf Sequenz 5.' },
      { key: 'max_nerves', value: 25, text: 'Halbgott: mindestens 50 % mehr Nerven als auf Sequenz 5.' },
      { key: 'composure_regen', value: 1.25, text: 'Halbgott: Nerven erholen sich 25 % schneller.' },
    ],
  },
  3: {
    titel: 'Gefestigter Halbgott',
    passives: [
      { key: 'ap_start', value: 1, text: 'Durchbruch: Jeder Kampf beginnt mit einer weiteren Konzentration.' },
      { key: 'dmg_mult', value: 1.2, text: 'Durchbruch: weitere +20 % Schaden.' },
      { key: 'damage_taken', value: 0.9, text: 'Durchbruch: Du nimmst 10 % weniger Schaden.' },
      { key: 'max_hp', value: 10, text: 'Durchbruch: +10 Leben.' },
      { key: 'max_nerves', value: 10, text: 'Durchbruch: +10 Nerven.' },
    ],
  },
  2: {
    titel: 'Engel',
    passives: [
      { key: 'ap_start', value: 2, text: 'Engel: Jeder Kampf beginnt mit zwei weiteren Punkten Konzentration.' },
      { key: 'dmg_mult', value: 1.6, text: 'Engel: +60 % Schaden mit allen Angriffen und Fertigkeiten.' },
      { key: 'damage_taken', value: 0.7, text: 'Engel: Du nimmst 30 % weniger Schaden.' },
      { key: 'max_hp', value: 35, text: 'Engel: +35 Leben.' },
      { key: 'max_nerves', value: 35, text: 'Engel: +35 Nerven.' },
      { key: 'composure_regen', value: 1.25, text: 'Engel: Nerven erholen sich 25 % schneller.' },
    ],
  },
  1: {
    titel: 'Vollendeter Engel',
    passives: [
      { key: 'ap_start', value: 1, text: 'Durchbruch: Jeder Kampf beginnt mit einer weiteren Konzentration.' },
      { key: 'dmg_mult', value: 1.25, text: 'Durchbruch: weitere +25 % Schaden.' },
      { key: 'damage_taken', value: 0.85, text: 'Durchbruch: Du nimmst 15 % weniger Schaden.' },
      { key: 'max_hp', value: 15, text: 'Durchbruch: +15 Leben.' },
      { key: 'max_nerves', value: 15, text: 'Durchbruch: +15 Nerven.' },
    ],
  },
};
/** Eigenheit jedes Pfades auf Sequenz 4: was ihn als Halbgott von den anderen unterscheidet. */
export const HALBGOTT_EIGENHEIT = {
  laterne: { key: 'occult_mult', value: 1.3, text: 'Halbgott der Laterne: +30 % Schaden gegen Okkultes.' },
  faden: { key: 'parry_ap', value: 1, text: 'Halbgott des Fadens: Paraden geben eine Konzentration mehr.' },
  maske: { key: 'dodge_window', value: 1.3, text: 'Halbgott der Maske: Ausweichfenster +30 %.' },
  echo: { key: 'composure_regen', value: 1.3, text: 'Halbgott des Echos: Nerven erholen sich noch einmal 30 % schneller.' },
  kessel: { key: 'heal_bonus', value: 1.5, text: 'Halbgott des Kessels: Heilmittel wirken 50 % stärker.' },
  eisen: { key: 'damage_taken', value: 0.85, text: 'Halbgott des Eisens: noch einmal 15 % weniger Schaden.' },
  schluessel: { key: 'money_bonus', value: 1.3, text: 'Halbgott des Schlüssels: +30 % Schilling aus Beute und Belohnungen.' },
  sq_waage: { key: 'damage_taken', value: 0.85, text: 'Halbgott der Waage: noch einmal 15 % weniger Schaden.' },
  sq_moor: { key: 'heal_bonus', value: 1.5, text: 'Halbgott des Moors: Heilmittel wirken 50 % stärker.' },
  sq_uhr: { key: 'parry_ap', value: 1, text: 'Halbgott der Uhr: Paraden geben eine Konzentration mehr.' },
};
/**
 * Was die Rituale der hohen Stufen über die offene Probe hinaus verlangen. Sequenz 4 und 2 sind die
 * schweren: Tribut, viele Siege und Schlussfolgerungen, volle Nerven und ein Kampf gegen den
 * Schwellenwächter des eigenen Pfades (`ordeal`, Gegner hg_schwellenwaechter_<pfad> und hg_grenzwaechter_<pfad>, siehe data/sequenzen.js).
 */
export const HOCH_RITUAL = {
  4: { tribute: 600, min_wins: 40, min_conclusions: 10, min_nerves: 80, ordeal: true },
  3: { tribute: 400, min_wins: 55 },
  2: { tribute: 1200, min_wins: 75, min_conclusions: 16, min_nerves: 100, ordeal: true },
  1: { tribute: 800, min_wins: 90 },
};
/** Kampf-Ids der Wächter je Pfad, nach den Eckdaten der Codex-Pakete CO/CP (hg_schwellenwaechter für 4, hg_grenzwaechter für 2). */
export const WAECHTER = { 4: 'hg_schwellenwaechter', 2: 'hg_grenzwaechter' };
export const ordealId = (pid, seq) => `${WAECHTER[seq] ?? 'hg_waechter'}_${pid}`;
export const ordealFlag = (pid, seq) => `won_${ordealId(pid, seq)}`;
/** Die mythischen Kreaturformen je Pfad (Ids und Namen verbindlich aus den Codex-Paketen CO/CP). */
export const HG_FORMS = {
  laterne: { id: 'hg_form_laterne', name: 'Leuchtgestalt' }, faden: { id: 'hg_form_faden', name: 'Nahtgespinst' },
  maske: { id: 'hg_form_maske', name: 'Hundertmiene' }, echo: { id: 'hg_form_echo', name: 'Hohlklang' },
  kessel: { id: 'hg_form_kessel', name: 'Siedeleib' }, eisen: { id: 'hg_form_eisen', name: 'Nietkoloss' },
  schluessel: { id: 'hg_form_schluessel', name: 'Türhüter' }, sq_waage: { id: 'hg_form_sq_waage', name: 'Gewichtsträger' },
  sq_moor: { id: 'hg_form_sq_moor', name: 'Torfleib' }, sq_uhr: { id: 'hg_form_sq_uhr', name: 'Pendelgestalt' },
};
/**
 * Mythische Gestalt (Seb, 2026-11-11): ab Sequenz 4 und 50 % Verdauung kann man die wahre Gestalt des Pfades
 * annehmen. Nicht-Beyonder (Menschen ohne Pfad) und Monster, die deutlich unter der eigenen Stufe liegen,
 * brechen beim bloßen Anblick zusammen (kein Kampf, aber Sieg mit Beute und Verdauung). Die Gestalt zehrt an
 * Nerven und Unruhe und fällt ab, wenn die Nerven ausgehen. Bosse, höhere Wesen (min_seq) und Übungskämpfe bleiben.
 */
export const FORM_SEQ = 4;
export const FORM_MIN_DIGEST = 50;
export const FORM_NERVES_PER_SEC = 1.5;
export const FORM_UNRUHE_PER_SEC = 0.4;
export const FORM_MIN_NERVES = 15;
export const FORM_MARGIN = 2; // so viele Sequenzen muss ein Monster unter dir liegen
/** Worte für die großen Tränke: Halbgott (4) und Engel (2). Die Oberfläche spielt dazu die Aufstiegs-Szene. */
export const ASCENSION_TEXT = {
  4: {
    title: 'Halbgott',
    intro: 'Der Trank schlägt nicht ein. Er bleibt. Er füllt dich aus wie Wasser ein Gefäß, bis das Gefäß nicht mehr das Maß ist. Die Wände rücken weg. Das Licht wird dünn und durchsichtig, und dahinter siehst du die Stadt, wie sie wirklich ist: ein Gewirr aus Fäden, Flammen und Atem, und jeder Faden kennt deinen Namen.',
    rank: 'Was du gerade warst, ein Ermittler mit einem Trank im Blut, ist vorbei. Man nennt diese Stufe Halbgott. Nicht, weil man dich anbeten wird. Weil nichts Menschliches dir mehr gewachsen ist.',
    outro: 'Dein Herz schlägt langsamer und lauter. Wunden, die dich gestern umgeworfen hätten, sind ein Kratzer. Dein Grundsatz ist kein Vorsatz mehr, sondern ein Naturgesetz, und die Welt richtet sich ein Stück weit nach dir. Vergiss nicht: Auch Halbgötter verdauen. Nur sehr, sehr langsam.',
  },
  2: {
    title: 'Engel',
    intro: 'Der Trank hat keinen Geschmack mehr. Du bist der Geschmack. Für einen Augenblick existierst du an jedem Ort, an dem dein Grundsatz je gegolten hat, in jeder Laterne, jedem Knoten, jedem Schlüssel, jeder Waage, und du musst dich entscheiden, zurückzukommen.',
    rank: 'Man nennt diese Stufe Engel. Die Alten in Dunscar schreiben das Wort nicht aus. Es gibt in dieser Welt kaum noch etwas, das dir im Weg stehen kann, außer dir selbst.',
    outro: 'Deine Schritte lassen den Nebel zur Seite weichen. Was dich trifft, trifft kaum noch. Und doch: Die Stimmen, die mit jedem Trank lauter wurden, sind jetzt ein Chor. Halte deinen Grundsatz fest. Er ist das Einzige, was zwischen dir und dem Kontrollverlust steht.',
  },
};
export const UNRUHE_MAX = 100;
export const UNRUHE_DECAY_PER_SEC = 0.25;
export const UNRUHE_VISION_PER_SEC = 0.35;
export const VISION_DIGEST_CAP = 25; // pro Kartenbesuch
// Nervenkosten der Fertigkeiten (Kampf): Wer keine eigenen `composure`-Kosten hat, zahlt nach Konzentration.
// Dicke Fähigkeiten (4–5 K) reißen ein tiefes Loch in die Nerven; wer sie spammt, steht bald ohne da.
export const SKILL_COMPOSURE_BY_COST = { 0: 0, 1: 4, 2: 6, 3: 10, 4: 16, 5: 22, 6: 30 };
// Gewöhnung: Jede Sequenz, die man über die Fertigkeit hinaus gestiegen ist, nimmt ihr 15 % Nervenkosten (bis 40 %).
// Die Fertigkeit der aktuellen Sequenz kostet immer voll, die aus Sequenz 9 ist mit Sequenz 5 schon zu 60 % Gewohnheit.
export const HABIT_STEP = 0.15;
export const HABIT_MIN = 0.4;
/** Was hinter den Verdauungs-Schlüsseln steckt (für Anzeige und Rückmeldungen). */
export const DIGEST_LABELS = {
  clue: 'Hinweis gefunden', hidden_clue: 'verborgene Spur gefunden', fact_likely: 'Information bestätigt',
  fact_refuted: 'Lüge widerlegt', conclusion: 'Schlussfolgerung gezogen', quest: 'Auftrag erledigt',
  side_quest: 'Nebenauftrag erledigt', combat_win: 'Kampf gewonnen', occult_win: 'okkultes Wesen besiegt',
  parry: 'Schlag pariert', vision: 'Geistsicht (pro Sekunde)', dialogue: 'neues Gespräch geführt',
  trade: 'gehandelt', brew: 'Trank gebraut', use_item: 'Heilmittel benutzt', lock: 'Verschlossenes geöffnet',
  loot: 'Belohnung eingestrichen',
  boss_win: 'Boss besiegt', elite_win: 'Elitegegner besiegt', talent: 'Welt-Fähigkeit eingesetzt (je 10 Nerven)',
  ritual: 'Ritual vollzogen', gathering: 'Zuschlag auf einem geheimen Treffen',
};
/**
 * Was jeden Pfad verdaut, ganz gleich nach welchem Grundsatz: die großen Prüfungen und das Wirken der eigenen Kraft.
 * Ein Pfad kann einen Schlüssel in seiner eigenen `digest`-Tabelle überschreiben.
 */
export const COMMON_DIGEST = { boss_win: 30, elite_win: 8, talent: 6, ritual: 25, gathering: 3 };
/** Bosse und Elitegegner zählen für die pfadeigenen Kampf-Handlungen (combat_win, occult_win, parry) mehrfach. */
export const FIGHT_DIGEST_MULT = { boss: 4, elite: 2 };
/** Gefahrenstufe des Gebiets: jede Stufe über 1 bringt 25 % mehr Verdauung aus dem Kampf. */
export const ZONE_DIGEST_STEP = 0.25;
/** Welt-Fähigkeit: Verdauung je 10 Nerven Einsatz, mindestens das Halbe, höchstens das Zweieinhalbfache. */
export const TALENT_DIGEST_PER_NERVES = 10;
export const TALENT_DIGEST_SPAN = [0.5, 2.5];
/** Handlungen, die nur den Pfad dessen verdauen, der sie selbst tut. Alles andere verdaut beide Spieler. */
export const PERSONAL_DIGEST = new Set(['parry', 'vision', 'use_item', 'brew', 'talent', 'ritual']);
const MULT_KEYS = new Set(['vision_cost', 'composure_regen', 'heal_bonus', 'price', 'sell', 'honor_loss', 'occult_mult',
  'money_bonus', 'skill_composure', 'calm_decay', 'dodge_window', 'damage_taken', 'digest_mult', 'dmg_mult', 'hurry_cost']);


export const pathwayMethods = {
  resetPathway() {
    this.money = this.content.market?.start_money ?? 0;
    this.pathway = null; // { id, seq, digestion }
    this.unruhe = 0;
    this.seenNodes = new Set();
    this.visionDigest = { map: null, total: 0 };
    this.wins = 0; // gewonnene Kämpfe (für Rituale)
    this.picks = 0; // geknackte Schlösser (Ritual des Schlüssels)
    this.pickedLocks = new Set(); // welche Schlösser schon geknackt sind (Karte:Objekt)
    this.resetArtifacts();
  },

  // --- Nachschlagen -----------------------------------------------------------
  pathwayDef(id = this.pathway?.id) {
    return id ? this.content.pathways?.[id] : null;
  },

  seqDef(id = this.pathway?.id, seq = this.pathway?.seq) {
    return this.pathwayDef(id)?.seqs[seq] ?? null;
  },

  isBeyonder() {
    return !!this.pathway;
  },

  /** Alle erreichten Sequenzen des eigenen Pfades, von 9 abwärts: [{seq, ...def}] */
  reachedSeqs() {
    if (!this.pathway) return [];
    const out = [];
    for (let s = SEQ_START; s >= this.pathway.seq; s--) out.push({ seq: s, ...this.seqDef(this.pathway.id, s) });
    return out;
  },

  /**
   * Wert einer passiven Fähigkeit (Multiplikatoren multiplizieren sich, sonst wird addiert).
   * Zählt die Passiven aller erreichten Sequenzen, die Vor- und Nachteile mitgeführter Artefakte und angelegte Kleidung.
   */
  passive(key) {
    const mult = MULT_KEYS.has(key);
    let v = mult ? 1 : 0;
    const lists = [...this.reachedSeqs().map((s) => s.passives ?? []), ...this.artifactEffects(), ...this.gearEffects(), this.bindingPassive?.(this.acting ?? 1) ?? [], this.buffEffects?.() ?? []]; // BN: persönliche Rufbindung; Welt-Fähigkeiten (Talents.js)
    for (const list of lists) {
      for (const p of list) {
        if (p.key !== key) continue;
        if (typeof p.value === 'boolean') v = v || p.value;
        else v = mult ? v * p.value : v + p.value;
      }
    }
    return v;
  },

  /** Wie viele Sequenzen schon erreicht sind (9 = 1, 5 = 5). */
  seqSteps() {
    return this.pathway ? SEQ_START + 1 - this.pathway.seq : 0;
  },

  /** Wachstumsstufen: jede erreichte Sequenz eine, die Durchbrüche (7 und 6) zwei. */
  growthSteps() {
    if (!this.pathway) return 0;
    let n = 0;
    for (let s = SEQ_START; s >= this.pathway.seq; s--) n += SEQ_GROWTH_STEPS[s] ?? 1;
    return n;
  },

  /** Zuwachs an Leben und Nerven pro erreichter Sequenz. */
  growth() {
    return { ...DEFAULT_GROWTH, ...(this.pathwayDef()?.growth ?? {}) };
  },

  /** Höchstwert der Nerven: Grundwert, Sequenzen, Passive und Artefakte. */
  maxComposure() {
    return Math.max(20, COMPOSURE_BASE + this.growth().nerves * this.growthSteps() + this.passive('max_nerves') + this.seq4NervesBonus());
  },

  /** Höchstwert des Lebens (ohne zu heilen oder zu verletzen). */
  calcMaxHp() {
    const base = this.content.start.hp ?? 40;
    return Math.max(10, base + this.growth().hp * this.growthSteps() + this.passive('max_hp') + this.seq5HpBonus() + this.seq4HpBonus());
  },

  /** Leben allein aus Pfad und Sequenzen bis einschließlich `seq` (ohne Artefakte, Kleidung, Zauber). */
  seqCoreHp(seq) {
    if (!this.pathway) return 0;
    let n = this.content.start.hp ?? 40;
    for (let s = SEQ_START; s >= seq; s--) {
      n += this.growth().hp * (SEQ_GROWTH_STEPS[s] ?? 1);
      for (const p of this.seqDef(this.pathway.id, s)?.passives ?? []) if (p.key === 'max_hp') n += p.value;
    }
    return n;
  },

  /**
   * Seb (2026-11-12): Der Aufstieg auf Sequenz 5 hebt das Leben um mindestens 35 % gegenüber Sequenz 6,
   * für jeden Pfad und jeden Spieler. Fehlt dem Pfad etwas, gleicht dieser Zuschlag es aus; er bleibt auf 4 bis 1.
   */
  seq5HpBonus() {
    if (!this.pathway || this.pathway.seq > 5) return 0;
    return Math.max(0, Math.ceil(this.seqCoreHp(6) * SEQ5_HP_JUMP) - this.seqCoreHp(5));
  },

  /** Leben aus Pfad und Sequenzen bis `seq` samt Seq-5-Ausgleich (ohne Artefakte, Kleidung, Zauber). */
  seqCoreHpFull(seq) {
    const n = this.seqCoreHp(seq);
    return seq > 5 ? n : n + Math.max(0, Math.ceil(this.seqCoreHp(6) * SEQ5_HP_JUMP) - this.seqCoreHp(5));
  },

  /**
   * Seb (2026-11-12): Sequenz 4 verdoppelt das Leben gegenüber Sequenz 5 (jeder Pfad, jeder Spieler).
   * Der Halbgott-Durchbruch zählt mit; was fehlt, gleicht dieser Zuschlag aus. Er bleibt auf 3 bis 1.
   */
  seq4HpBonus() {
    if (!this.pathway || this.pathway.seq > 4) return 0;
    return Math.max(0, Math.ceil(this.seqCoreHpFull(5) * SEQ4_HP_JUMP) - this.seqCoreHpFull(4));
  },

  /** Nerven allein aus Pfad und Sequenzen bis einschließlich `seq`. */
  seqCoreNerves(seq) {
    if (!this.pathway) return 0;
    let n = COMPOSURE_BASE;
    for (let s = SEQ_START; s >= seq; s--) {
      n += this.growth().nerves * (SEQ_GROWTH_STEPS[s] ?? 1);
      for (const p of this.seqDef(this.pathway.id, s)?.passives ?? []) if (p.key === 'max_nerves') n += p.value;
    }
    return n;
  },

  /** Seb (2026-11-12): Sequenz 4 hat mindestens 50 % mehr maximale Nerven als Sequenz 5. */
  seq4NervesBonus() {
    if (!this.pathway || this.pathway.seq > 4) return 0;
    return Math.max(0, Math.ceil(this.seqCoreNerves(5) * SEQ4_NERVES_JUMP) - this.seqCoreNerves(4));
  },

  /** Kampffertigkeiten des eigenen Pfades: { id: skill }. Jede erreichte Sequenz bringt zwei (skill und skill2). */
  pathwaySkills() {
    const out = {};
    for (const s of this.reachedSeqs()) {
      if (s.skill) out[s.skill.id] = { ...s.skill, pathway: this.pathway.id, seq: s.seq };
      if (s.skill2) out[s.skill2.id] = { ...s.skill2, pathway: this.pathway.id, seq: s.seq, second: true };
    }
    return out;
  },

  /**
   * Gewöhnung an eine Fertigkeit: Faktor auf ihre Nervenkosten. skillSeq = Sequenz, aus der sie stammt
   * (Grundfertigkeiten ohne Sequenz gewöhnt man sich mit jeder erreichten Sequenz nach der ersten an).
   */
  skillHabit(skillSeq) {
    if (!this.pathway) return 1;
    const steps = skillSeq === undefined ? Math.max(0, this.seqSteps() - 1) : Math.max(0, skillSeq - this.pathway.seq);
    return Math.max(HABIT_MIN, 1 - HABIT_STEP * steps);
  },

  /** Nervenkosten einer Fertigkeit: Grundkosten (eigene oder nach Konzentration), Gewöhnung, Passive (Pfad des Echos, Artefakte). */
  skillComposureCost(sk) {
    const base = sk.composure ?? SKILL_COMPOSURE_BY_COST[sk.cost] ?? 0;
    if (!base) return 0;
    return Math.max(1, Math.round(base * this.skillHabit(sk.seq) * this.passive('skill_composure')));
  },

  // --- Schilling ------------------------------------------------------------------
  /** Fügt Schilling hinzu. loot = Belohnung/Beute (zählt für Verdauung und Boni). */
  addMoney(n, { loot = false, reason = '' } = {}) {
    if (!n) return 0;
    let amount = n;
    if (loot && n > 0) amount = Math.round(n * this.passive('money_bonus'));
    const before = this.money;
    this.money = Math.max(0, this.money + amount);
    const delta = this.money - before;
    if (delta) this.emit('money', { delta, reason, value: this.money });
    if (loot && delta > 0) this.act('loot');
    return delta;
  },

  spendMoney(n) {
    if (this.money < n) return false;
    this.addMoney(-n);
    return true;
  },

  // --- Verdauung -------------------------------------------------------------------
  /**
   * Meldet eine Handlung. Passt sie zum Grundsatz des eigenen Pfades, wird der Trank verdaut.
   * Gibt die gewonnenen Verdauungspunkte zurück.
   */
  act(kind, amount = 1) {
    if (kind === 'combat_win') this.wins = (this.wins ?? 0) + 1;
    const gained = this.digestOwn(kind, amount);
    // Zu zweit: was beide gemeinsam erleben, verdaut auch den Trank des anderen Spielers
    if (this.hasP2?.() && !PERSONAL_DIGEST.has(kind)) this.withPartner(() => this.digestOwn(kind, amount));
    return gained;
  },

  /** Verdauung nur für den Spieler, dessen Werte gerade gelten. */
  digestOwn(kind, amount = 1) {
    const p = this.pathway;
    if (!p) return 0;
    const base = this.digestWeights()[kind];
    if (!base) return 0;
    let pts = base * amount * (DIGEST_RATE[p.seq] ?? DIGEST_RATE[1]) * this.passive('digest_mult');
    if (kind === 'vision') {
      if (this.visionDigest.map !== this.map) this.visionDigest = { map: this.map, total: 0 };
      pts = Math.min(pts, Math.max(0, VISION_DIGEST_CAP - this.visionDigest.total));
      this.visionDigest.total += pts;
    }
    if (pts <= 0) return 0;
    // Wer nach seinem Grundsatz handelt, kommt zur Ruhe
    this.setUnruhe(this.unruhe - pts * 0.5);
    if (p.digestion >= 100) return 0;
    const before = p.digestion;
    p.digestion = Math.min(100, p.digestion + pts);
    const player = this.acting ?? 1;
    this.emit('digest', { value: p.digestion, delta: p.digestion - before, kind, player });
    if (before < 100 && p.digestion >= 100) {
      this.emit('notice', `${player === 2 ? 'Spieler 2: ' : ''}Der Trank des ${this.seqDef().name} ist vollständig verdaut.`);
      this.emit('digested', { ...p, player });
    }
    return p.digestion - before;
  },

  /** Grundpunkte je Handlung für den eigenen Pfad: die pfadeigene Tabelle über den gemeinsamen Quellen. */
  digestWeights() {
    return { ...COMMON_DIGEST, ...(this.pathwayDef()?.digest ?? {}) };
  },

  /** Was den eigenen Pfad wie stark verdaut, auf der aktuellen Sequenz: [{kind, label, points}] */
  digestTable() {
    if (!this.pathway) return [];
    const rate = (DIGEST_RATE[this.pathway.seq] ?? DIGEST_RATE[1]) * this.passive('digest_mult');
    return Object.entries(this.digestWeights())
      .map(([kind, v]) => ({ kind, label: DIGEST_LABELS[kind] ?? kind, points: v * rate, text: fmtDigest(v * rate) }))
      .sort((a, b) => b.points - a.points);
  },

  // --- Unruhe ------------------------------------------------------------------------
  /** Ab Sequenz 5 steigt die Unruhe nur noch halb so stark (je Spieler, alle Pfade). */
  unruheGainMult() { const q = this.pathway?.seq; return q != null && q <= 5 ? UNRUHE_GAIN_HOCH : 1; },

  setUnruhe(v) {
    const before = this.unruhe;
    if (v > before) v = before + (v - before) * this.unruheGainMult();
    this.unruhe = Math.max(0, Math.min(UNRUHE_MAX, v));
    if (Math.round(this.unruhe) !== Math.round(before)) this.emit('unruhe', this.unruhe);
    if (this.unruhe >= UNRUHE_MAX && before < UNRUHE_MAX) this.loseControl('Die Stimmen werden zu laut.');
  },

  /** Kontrollverlust: Ohnmacht, Verlust von Leben, Schilling und Verdauung, und alles am Leib wird korrumpiert (Corruption.js). Nie Game Over. */
  loseControl(cause) {
    const lostMoney = Math.floor(this.money * 0.2);
    this.money -= lostMoney;
    this.hp = Math.max(1, Math.round(this.maxHp * 0.4));
    this.composure = 30;
    if (this.pathway) this.pathway.digestion = Math.max(0, this.pathway.digestion - 20);
    this.unruhe = 40;
    this.spiritVision = false;
    const shame = this.artifactShame();
    const hit = this.corruptEquipment();
    const names = hit.map((id) => this.item(id).name);
    const tentacles = hit.length
      ? `\n\nDann reißt etwas in dir auf. Aus deinen Schultern, deinem Rücken, deinen Handgelenken wachsen nasse, dunkle Tentakel, tasten über dich hinweg und finden alles, was du am Leib trägst: ${names.join(', ')}. Sie saugen sich fest. Als sie sich zurückziehen, bleibt in jedem Stück ein schwarzer Faden, der pulsiert wie ein Herz.\n\n${names.length === 1 ? 'Dieses Stück ist' : 'Diese Stücke sind'} jetzt korrumpiert: ${names.length === 1 ? 'Es zehrt' : 'Sie zehren'} an Leben und Nerven, solange du ${names.length === 1 ? 'es' : 'sie'} trägst. Ablegen geht im Inventar, bei korrumpierten Artefakten ausnahmsweise auch. Reinigen kann Dr. Varga im Revier, oder Läutersalz von Nell Rauhfuß.`
      : '\n\nAus deinen Schultern wachsen nasse, dunkle Tentakel, tasten über dich hinweg und finden nichts, in das sie sich fressen könnten. Diesmal.';
    const text = `${cause}\n\nDie Welt kippt zur Seite. Du siehst Dinge, die nicht da sind, und hörst deinen Namen in fremden Stimmen.${tentacles}\n\nAls du wieder zu dir kommst, liegst du auf kaltem Pflaster, die Hände zerkratzt. Du hast ${lostMoney} Schilling verloren${this.pathway ? ' und ein Stück deines Fortschritts beim Verdauen' : ''}.${shame}`;
    this.emit('vision', false);
    this.emit('hp', { value: this.hp, delta: 0 });
    this.emit('composure', this.composure);
    this.emit('unruhe', this.unruhe);
    this.emit('money', { delta: -lostMoney, value: this.money, reason: 'Kontrollverlust' });
    this.emit('lostcontrol', { text, player: this.acting ?? 1, corrupted: hit });
    this.emit('changed');
    return text;
  },

  /** Wird von tick() aufgerufen. */
  tickPathway(dt) {
    this.tickCorruption(dt);
    this.tickForm(dt);
    const pull = this.artifactUnruhe();
    if (!this.pathway && this.unruhe <= 0 && !pull) return;
    let u = this.unruhe + pull * dt;
    if (this.spiritVision && this.pathway) {
      u += UNRUHE_VISION_PER_SEC * dt;
      this.act('vision', dt);
    } else {
      u -= UNRUHE_DECAY_PER_SEC * this.passive('calm_decay') * dt;
    }
    this.setUnruhe(u);
  },

  // --- Trinken -------------------------------------------------------------------------
  /** Wie riskant wäre dieser Trank gerade? { ok, risk (0–1), reason? } */
  drinkCheck(itemId) {
    const it = this.item(itemId);
    if (!it || it.kind !== 'potion') return { ok: false, reason: 'Das ist kein Trank.' };
    const p = this.pathway;
    if (!p) {
      if (it.seq !== SEQ_START) return { ok: false, reason: 'Ohne die erste Stufe würde dich dieser Trank zerreißen. Beginne mit Sequenz 9.' };
      return { ok: true, risk: Math.min(0.9, this.unruhe / 200) };
    }
    if (it.pathway !== p.id) return { ok: false, reason: 'Ein zweiter Pfad in deinem Blut? Sabeth hat dich gewarnt. Lieber nicht.' };
    if (it.seq >= p.seq) return { ok: false, reason: 'Diese Stufe hast du längst erreicht.' };
    if (it.seq !== p.seq - 1) return { ok: false, reason: 'Du kannst keine Stufe überspringen.' };
    const rit = this.ritualDef(p.id, it.seq);
    if (rit && !this.ritualDone(p.id, it.seq)) return { ok: false, reason: `Ohne Ritual zerreißt dich dieser Trank. Vollziehe zuerst „${rit.name}“ (siehe Pfad).`, ritual: true };
    const block = rit && this.seq5DrinkBlock?.(p.id, it.seq);
    if (block) return { ok: false, reason: block, ritual: true };
    const missing = (100 - p.digestion) / 100;
    const risk = Math.min(0.95, 0.03 + missing * 0.85 + this.unruhe / 250);
    return { ok: true, risk };
  },

  /**
   * Trinkt einen Trank. rng: Zufallsquelle (Tests übergeben eine feste).
   * Ergebnis: { ok, text, lost? }
   */
  drink(itemId, rng = this.rng ?? Math.random) {
    const check = this.drinkCheck(itemId);
    if (!check.ok) return { ok: false, text: check.reason };
    const it = this.item(itemId);
    const sd = this.seqDef(it.pathway, it.seq);
    const premature = this.pathway ? (100 - this.pathway.digestion) : 0;
    this.removeItem(itemId);
    const roll = rng();
    if (roll < check.risk) {
      const text = this.loseControl(`Der Trank des ${sd.name} brennt sich durch deine Adern, aber dein Körper wehrt sich.`);
      return { ok: false, lost: true, text };
    }
    const first = !this.pathway;
    const carryBefore = this.carryCapacity();
    const relikt = this.pathway?.relikt; // Seq 4 (Moor): das Relikt des Verfalls bleibt nach dem Aufstieg
    this.pathway = { id: it.pathway, seq: it.seq, digestion: 0, ...(relikt ? { relikt } : {}) };
    if (HOCH_DURCHBRUCH[it.seq]) this.flags.add(`seq${it.seq}_erreicht`); // für Zeitung und Gerede (Paket CP)
    this.unruhe = Math.min(UNRUHE_MAX - 1, this.unruhe + (20 + premature * 0.4) * this.unruheGainMult());
    this.updateMaxHp();
    const pd = this.pathwayDef();
    // Aufstiegsmeldung: was der Körper dazugewonnen hat (Leben, Nerven, Tragkraft)
    const carryGain = this.carryCapacity() - carryBefore;
    const gains = `Dein Körper wächst mit: ${this.maxHp} Leben, ${this.maxComposure()} Nerven, Tragkraft ${this.carryText().split('/')[1]}${carryGain > 0 ? ` (+${carryGain})` : ''}.`;
    const asc = ASCENSION_TEXT[it.seq];
    const cp = asc ? this.hgDrinkText(it.pathway, it.seq) : null; // Paket CP: eigener Trinktext je Pfad und Stufe
    const formHint = it.seq === FORM_SEQ ? `\n\nAb ${FORM_MIN_DIGEST} % Verdauung kannst du im Pfad-Tab deine mythische Gestalt annehmen. Menschen ohne Pfad und schwächere Wesen brechen vor ihr zusammen.` : '';
    const text = cp
      ? `${cp.trinken}\n\nDu bist jetzt Sequenz ${it.seq}: ${sd.name}. ${asc.rank}\n\n${sd.desc}\n\n${asc.outro}\n\n${gains}${formHint}`
      : first
      ? `Du trinkst. Es schmeckt nach Nebel und Kupfer. Dann wird die Welt für einen Herzschlag zu laut, zu hell, zu nah.\n\nDu bist jetzt Sequenz 9 des ${pd.name.replace('Pfad', 'Pfads')}: ${sd.name}.\n\n${sd.desc}\n\n${gains}\n\nGrundsatz: „${pd.principle}“ Handle danach, um den Trank zu verdauen.`
      : asc
        ? `${asc.intro}\n\nDu bist jetzt Sequenz ${it.seq}: ${sd.name}. ${asc.rank}\n\n${sd.desc}\n\n${asc.outro}\n\n${gains}${it.seq === FORM_SEQ ? `\n\nAb ${FORM_MIN_DIGEST} % Verdauung kannst du im Pfad-Tab deine mythische Gestalt annehmen. Menschen ohne Pfad und schwächere Wesen brechen vor ihr zusammen.` : ''}`
        : `Der Trank schlägt ein wie ein Blitz. Als er abklingt, bist du jemand anderes. Ein bisschen.\n\nDu bist jetzt Sequenz ${sd ? it.seq : ''}: ${sd.name}.\n\n${sd.desc}\n\n${gains}`;
    this.emit('unruhe', this.unruhe);
    this.emit('ascend', { pathway: it.pathway, seq: it.seq, player: this.acting ?? 1, ascension: asc ? { ...asc, seq: it.seq, color: pd.color } : null });
    this.emit('changed');
    return { ok: true, text, ascension: asc ? { ...asc, seq: it.seq, color: pd.color, name: sd.name } : null };
  },

  /** Rechnet Leben und Nerven neu (nach Aufstieg oder Artefaktwechsel). Mehr Höchstwert heilt um die Differenz. */
  updateMaxHp() {
    const before = this.maxHp;
    this.maxHp = this.calcMaxHp();
    if (this.maxHp > before) this.hp += this.maxHp - before;
    this.hp = Math.max(1, Math.min(this.hp, this.maxHp));
    this.emit('hp', { value: this.hp, delta: 0 });
    const maxC = this.maxComposure();
    if (this.composure > maxC) this.composure = maxC;
    this.emit('composure', this.composure);
  },

  // --- Rituale ---------------------------------------------------------------------------
  // Ab Sequenz 6 verlangt jeder Trank ein ortsunabhängiges Ritual mit Zutaten, die dabei
  // verbraucht werden, und einer Bedingung (Geistsicht, Nerven, Wunden, Schlussfolgerungen, Siege, Tribut,
  // geknackte Schlösser, eine zufällige Probe (core/Proben.js) oder ein aufgedeckter Betrug (core/Auction.js)).
  // Keine Bedingung der Sequenz 6 hängt an einem Ort oder Fall, den man verpasst haben kann (keine Rückreise).
  // Danach darf genau dieser Trank getrunken werden (Flag ritual_<pfad>_<seq>).

  ritualDef(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    return this.seqDef(pid, seq)?.ritual ?? null;
  },

  /** Merker für ein vollzogenes Ritual. Spieler 2 hat eigene (er kann denselben Pfad gehen). */
  ritualFlag(pid, seq) {
    return `${this.acting === 2 ? 'p2_' : ''}ritual_${pid}_${seq}`;
  },

  ritualDone(pid, seq) {
    return this.flags.has(this.ritualFlag(pid, seq));
  },

  /** Schritte des nächsten Rituals mit Status: [{text, done}] (oder null, wenn keines nötig ist). */
  ritualSteps(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    const r = this.ritualDef(pid, seq);
    if (!r) return null;
    const steps = [];
    for (const [id, n] of Object.entries(r.consumes ?? {})) steps.push({ text: `${this.item(id).name} ×${n} (wird verbraucht)`, done: this.itemCount(id) >= n, consume: true });
    if (r.vision) steps.push({ text: 'Geistsicht ist aktiv', done: !!this.spiritVision });
    if (r.min_nerves) steps.push({ text: `Mindestens ${r.min_nerves} Nerven`, done: this.composure >= r.min_nerves });
    if (r.max_hp_pct) steps.push({ text: `Verwundet: höchstens ${Math.round(r.max_hp_pct * 100)} % Leben`, done: this.hp <= this.maxHp * r.max_hp_pct });
    if (r.min_conclusions) steps.push({ text: `${r.min_conclusions} Schlussfolgerungen gezogen (${this.conclusions.length})`, done: this.conclusions.length >= r.min_conclusions });
    if (r.requires?.min_wins) steps.push({ text: `${r.requires.min_wins} Kämpfe gewonnen (${this.wins ?? 0})`, done: (this.wins ?? 0) >= r.requires.min_wins });
    if (r.requires?.requires_flags) {
      for (const f of r.requires.requires_flags) {
        const enc = this.content.encounters[f.replace(/^won_/, '')];
        const fall = this.content.quests[/^(case_\d+)_closed$/.exec(f)?.[1]]; // Rituale der neuen Pfade (Paket AF)
        steps.push({ text: enc ? `${enc.name} besiegt` : fall ? `${fall.title} abgeschlossen` : f, done: this.flags.has(f) });
      }
    }
    if (r.tribute) steps.push({ text: `${r.tribute} Schilling als Tribut`, done: this.money >= r.tribute });
    // Seb (2026-11-12): ortsunabhängige Bedingungen, weil es keine Rückreise in frühere Städte gibt
    if (r.min_picks) steps.push({ text: `${r.min_picks === 1 ? 'Ein Schloss' : `${r.min_picks} Schlösser`} geknackt (${this.pickCount()})`, done: this.pickCount() >= r.min_picks });
    if (r.probe) steps.push({ text: `${PROBE_NAMEN[r.probe] ?? 'Probe'} bestanden`, done: this.probeDone(pid, seq), probe: r.probe });
    if (r.fraud) steps.push({ text: 'Einen Betrug auf einem geheimen Treffen aufgedeckt', done: this.fraudExposed(pid, seq), fraud: true });
    if (r.trial) { // Seq-5-Prüfungen (core/Seq5.js); bezahlte Zutaten (Echo) gelten als erledigt
      const paid = !!this.pathway?.seq5?.paid && this.pathway.id === pid;
      if (paid) for (const s of steps) if (s.consume) s.done = true;
      steps.push(...this.seq5Steps(r).map((s) => ({ ...s, trial: r.trial })));
    }
    if (r.hg) { // Seq-4-Prüfungen (core/Seq4.js): der Wächter ist ihr letzter Schritt
      steps.push(...this.seq4Steps(r).map((s, i, all) => ({ ...s, hg: r.hg, ...(i === all.length - 1 ? { ordeal: true } : {}) })));
    } else if (r.ordeal) {
      const enc = this.content.encounters[ordealId(pid, seq)];
      steps.push({ text: `${enc?.name ?? 'Schwellenwächter'} besiegt (erscheint, sobald alles andere bereit ist)`, done: this.ordealDone(pid, seq), ordeal: true });
    }
    if (!this.itemCount(`trank_${pid}_${seq}`)) steps.push({ text: `Trank der Sequenz ${seq} dabei`, done: false });
    return steps;
  },

  /** Ist der Schwellenwächter dieses Rituals schon besiegt? */
  ordealDone(pid, seq) {
    if (this.ritualDef(pid, seq)?.hg) return this.hgPassed(pid); // Seq 4: nur der Sieg unter den Regeln der Prüfung zählt
    return this.flags.has(ordealFlag(pid, seq));
  },

  // --- Schlösser knacken (Ritual des Schlüssels) -----------------------------------------------
  /** Geknackte Schlösser, dazu das Zellenschloss in Wexmoor (Gespräch wx_zelle, Flag k2_zelle_geknackt). */
  pickCount() {
    return (this.picks ?? 0) + (this.flags.has('k2_zelle_geknackt') ? 1 : 0);
  },

  /** Wer kann ein knackbares Schloss (`lock.pick`) öffnen: der Pfad des Schlüssels, oder wer Brecheisen oder Haarnadel dabeihat. */
  canPick() {
    return this.passive('lock_bonus') > 0 || this.itemCount('brecheisen') > 0 || this.itemCount('haarnadel') > 0;
  },

  /** Wie man dieses Schloss knacken würde (für die Sperrmeldung). */
  pickHint() {
    return 'Knackbar mit geübten Fingern (Pfad des Schlüssels), einem Brecheisen oder einer Haarnadel.';
  },

  /**
   * Versucht, ein verschlossenes Objekt zu knacken statt es regulär zu öffnen. `key` ist Karte:Objekt, damit
   * jedes Schloss nur einmal zählt. Ergebnis { ok, text } oder null, wenn das Schloss nicht knackbar ist.
   */
  tryPick(lock, key) {
    if (!lock?.pick || !this.canPick()) return null;
    const how = this.passive('lock_bonus') > 0 ? 'Deine Finger finden die Zuhaltungen von selbst.' : this.itemCount('brecheisen') ? 'Das Brecheisen knirscht, das Schloss gibt nach.' : 'Die Haarnadel biegt sich, dann klickt es.';
    // DS: Dietrich (geübte Finger oder Haarnadel) mit Riegel, oder das Brecheisen hebelt
    if (this.passive('lock_bonus') > 0 || !this.itemCount('brecheisen')) { this.sfx?.('schloss_dietrich'); this.sfx?.('schloss_auf', { delay: 750 }); } else this.sfx?.('schloss_brecheisen');
    const first = key && !this.pickedLocks.has(key);
    if (first) {
      this.pickedLocks.add(key);
      this.picks = (this.picks ?? 0) + 1;
      this.act('lock');
      this.emit('changed');
    }
    const tool = this.passive('lock_bonus') > 0 ? 'pfad' : this.itemCount('brecheisen') ? 'brecheisen' : 'haarnadel'; // Codex DQ: passende Schloss-Animation
    return { ok: true, first, tool, text: `Schloss geknackt. ${how}` };
  },

  /** Ritual der Waage: Betrug auf einem geheimen Treffen aufgedeckt (siehe Auction.js). */
  fraudFlag(pid, seq) {
    return `${this.acting === 2 ? 'p2_' : ''}fraud_${pid}_${seq}`;
  },

  fraudExposed(pid, seq) {
    return this.flags.has(this.fraudFlag(pid, seq));
  },

  /** Vollzieht das Ritual für den nächsten Trank. Ergebnis: { ok, text } */
  performRitual() {
    const p = this.pathway;
    const seq = (p?.seq ?? 0) - 1;
    const r = p && this.ritualDef(p.id, seq);
    if (!r) return { ok: false, text: 'Für deinen nächsten Trank brauchst du kein Ritual.' };
    if (this.ritualDone(p.id, seq)) return { ok: false, text: 'Das Ritual ist schon vollzogen. Trink den Trank.' };
    const open = this.ritualSteps(p.id, seq).filter((x) => !x.done);
    // Die schweren Rituale (4 und 2): Steht alles andere, tritt der Schwellenwächter des Pfades aus dem Nebel
    if (r.hg && open.some((x) => x.hg)) return { ok: false, text: `Erst die Prüfung: ${this.seq4Name(r.hg)}. Der Schwellenwächter kommt nur aus ihr heraus.` };
    if (open.length === 1 && open[0].ordeal) {
      const id = ordealId(p.id, seq);
      if (!this.content.encounters[id]) return { ok: false, text: 'Der Schwellenwächter dieses Pfades ist noch nicht im Spiel.' };
      this.startCombat(id);
      return { ok: false, fight: id, text: `${r.name}\n\nDer Kreis ist gezogen, der Tribut liegt bereit. Dann wird es still. Aus dem Nebel tritt ${this.content.encounters[id].name}: dein eigener Grundsatz, der wissen will, ob du ihn tragen kannst.` };
    }
    if (open.length) return { ok: false, text: `Es fehlt noch: ${open.map((x) => x.text).join(', ')}.` };
    const paid = r.trial && !!this.seq5().paid;
    if (!paid) for (const [id, n] of Object.entries(r.consumes ?? {})) this.removeItem(id, n);
    if (r.tribute) this.addMoney(-r.tribute, { reason: 'Tribut' });
    const rules = this.content.ritualRules ?? { unruhe: 20, nerves: 20 };
    this.flags.add(this.ritualFlag(p.id, seq));
    this.setComposure(this.composure - (rules.nerves ?? 20));
    this.setUnruhe(this.unruhe + (rules.unruhe ?? 20));
    this.act('ritual'); // das Ritual selbst ist ein Schritt auf dem Pfad
    if (r.trial) { // Prüfungsstand räumen; der Kessel bleibt scharf, bis der Trank getrunken ist (oder die Wirkung verfliegt)
      const st = this.seq5();
      for (const key of Object.keys(st)) delete st[key];
      if (r.trial === 'kessel') st.armed = true;
    }
    this.emit('ritual', { pathway: p.id, seq, player: this.acting ?? 1 });
    this.emit('changed');
    return { ok: true, text: `${r.name}\n\n${r.desc}\n\nDas Ritual ist vollzogen. Die Luft um dich summt. Jetzt kannst du den Trank der Sequenz ${seq} trinken.` };
  },

  // --- Brauen ---------------------------------------------------------------------------
  /** Rezepte aller Formeln im Inventar: [{ formula, potion, ingredients: [{id, need, have}], ready }] */
  recipes() {
    return Object.keys(this.inventory).filter((id) => this.item(id)?.kind === 'formula').map((fid) => {
      const f = this.item(fid);
      const ingredients = Object.entries(f.ingredients).map(([id, need]) => ({ id, need, have: this.itemCount(id), name: this.item(id).name }));
      return { formula: fid, potion: f.potion, name: this.item(f.potion).name, seq: f.seq, pathway: f.pathway, ingredients, ready: ingredients.every((i) => i.have >= i.need) };
    }).sort((a, b) => b.seq - a.seq);
  },

  brew(formulaId) {
    const r = this.recipes().find((x) => x.formula === formulaId);
    if (!r) return { ok: false, text: 'Dafür fehlt dir die Formel.' };
    if (!r.ready) return { ok: false, text: `Es fehlt: ${r.ingredients.filter((i) => i.have < i.need).map((i) => i.name).join(', ')}.` };
    for (const i of r.ingredients) this.removeItem(i.id, i.need);
    this.addItem(r.potion);
    this.act('brew');
    this.emit('changed');
    return { ok: true, text: `Der Kessel zischt und spuckt bunten Dampf. Du füllst ${r.name} in eine Phiole.` };
  },

  // --- Händler ---------------------------------------------------------------------------
  merchant(id) {
    return this.content.market?.merchants[id];
  },

  /** Angebot eines Händlers mit Preisen und Sperren: [{item, name, price, locked?, owned?}] */
  shopStock(merchantId) {
    const m = this.merchant(merchantId);
    // Höhere Formeln anderer Pfade bleiben unsichtbar, sonst wird die Liste endlos
    const visible = this.merchantStock(merchantId).filter((e) => !e.requires_pathway || this.pathway?.id === e.requires_pathway[0]);
    return visible.map((e) => {
      const it = this.item(e.item);
      const price = Math.max(1, Math.round(e.price * this.passive('price') * this.relationPriceFactor(merchantId))); // Stimmung des Händlers
      let locked = null;
      if (e.requires_pathway) {
        const [pid, seq] = e.requires_pathway;
        if (!this.pathway || this.pathway.id !== pid || this.pathway.seq > seq) locked = e.locked_text ?? 'Gesperrt';
      }
      if (!locked && e.requires_honor !== undefined && this.honor < e.requires_honor) locked = `Rang ${this.rank(e.requires_honor).name} (Ansehen ${e.requires_honor}) nötig`;
      const owned = e.once && this.itemCount(e.item) > 0;
      return this.gatheringEntry(merchantId, { ...e, name: it.name, desc: it.desc, kind: it.kind, price, locked, owned });
    });
  },

  buy(merchantId, itemId) {
    const e = this.shopStock(merchantId).find((x) => x.item === itemId);
    if (!e) return { ok: false, text: 'Das führt dieser Händler nicht.' };
    if (e.locked) return { ok: false, text: e.locked };
    if (e.soldOut) return { ok: false, text: 'Davon ist auf diesem Treffen nichts mehr übrig.' };
    if (e.owned) return { ok: false, text: 'Diese Formel besitzt du schon.' };
    if (!this.spendMoney(e.price)) return { ok: false, text: 'Dafür reichen deine Schilling nicht.' };
    this.addItem(itemId);
    this.noteGatheringBuy(merchantId, itemId);
    this.act('trade');
    this.emit('changed');
    return { ok: true, text: `Gekauft: ${e.name} für ${e.price} Schilling.` };
  },

  /** Verkaufspreis eines Gegenstands (null = unverkäuflich). */
  sellPrice(itemId) {
    const it = this.item(itemId);
    if (!it || it.kind === 'key' || it.kind === 'formula') return null;
    if (this.borrowed?.includes(itemId)) return null; // Revier-Eigentum
    const base = this.content.market?.sell_prices?.[itemId] ?? it.price;
    if (!base) return null;
    return Math.max(1, Math.round(base * 0.5 * this.passive('sell')));
  },

  sell(itemId, merchantId = 'gorse') {
    const price = this.sellPrice(itemId);
    if (price === null || !this.itemCount(itemId)) return { ok: false, text: `Das will ${this.merchant(merchantId)?.name ?? 'der Händler'} nicht.` };
    if (this.weapon === itemId && this.itemCount(itemId) === 1) return { ok: false, text: 'Deine ausgerüstete Waffe behältst du lieber.' };
    this.removeItem(itemId);
    this.addMoney(price, { reason: 'Verkauf' });
    this.act('trade', 0.5);
    this.emit('changed');
    return { ok: true, text: `Verkauft: ${this.item(itemId).name} für ${price} Schilling.` };
  },

  /** Schlösser (Aktenschränke, Türen): Schlossflüsterer kommen mit weniger Ansehen hinein. */
  meetsLock(lock) {
    if (!lock) return true;
    if (this.meets(lock)) return true;
    const bonus = this.passive('lock_bonus');
    if (!bonus || lock.requires_honor === undefined) return false;
    return this.meets({ ...lock, requires_honor: lock.requires_honor - bonus });
  },

  // --- Dialoge ----------------------------------------------------------------------------
  /** Merkt besuchte Gesprächsknoten (für den Pfad der Maske). */
  visitNode(dialogueId, nodeId) {
    const key = `${dialogueId}.${nodeId}`;
    if (this.seenNodes.has(key)) return false;
    this.seenNodes.add(key);
    this.act('dialogue');
    return true;
  },

  /** Text für Sabeths Einschätzung und das Notizbuch. */
  pathwayReport() {
    if (!this.pathway) return 'Du hast noch keinen Trank getrunken.';
    const pd = this.pathwayDef();
    const sd = this.seqDef();
    const d = Math.floor(this.pathway.digestion);
    let t = `${pd.name}, Sequenz ${this.pathway.seq}: ${sd.name}. Verdaut: ${d} %.`;
    if (d >= 100) t += this.pathway.seq > SEQ_MAX ? '\n\n„Der Trank ist ganz in dir aufgegangen. Du bist bereit für die nächste Stufe.“' : '\n\n„Weiter kommst du hier unten nicht. Noch nicht.“';
    else t += `\n\n„Denk an deinen Grundsatz: ${pd.principle} ${pd.digest_hint}“`;
    if (this.unruhe >= 60) t += '\n\n„Und trink einen Ruhetee. Du flackerst wie eine Gaslampe im Wind.“';
    return t;
  },

  // --- Mythische Gestalt (ab Sequenz 4) --------------------------------------------------------
  /** Hat man die Gestalt überhaupt schon (Sequenz 4 mit halb verdautem Trank, oder tiefer)? */
  formUnlocked() {
    const p = this.pathway;
    if (!p || p.seq > FORM_SEQ) return false;
    return p.seq < FORM_SEQ || p.digestion >= FORM_MIN_DIGEST;
  },

  formActive() {
    return !!this.pathway?.form;
  },

  /** Die Kreaturform des eigenen Pfades: { id, name } (Texte und Grafik kommen mit den Paketen CO/CP dazu). */
  formDef(pid = this.pathway?.id) {
    if (!pid) return null;
    const base = HG_FORMS[pid] ?? { id: `hg_form_${pid}`, name: `Gestalt ${this.pathwayDef(pid)?.name ?? pid}` };
    const cp = this.content.halbgott?.kreaturform?.[pid]; // Paket CP: Beschreibung, Annehmen, Ablegen, Sperre, zu lange, Koop-Sicht
    return cp ? { ...base, ...cp, id: base.id, name: cp.name ?? base.name } : base;
  },

  /** Paket CP: Trinktext und Ankunft für die großen Tränke (Sequenz 4 und 2) des Pfades, sonst null. */
  hgDrinkText(pid, seq) {
    return this.content.halbgott?.trinktexte?.[`${pid}_${seq}`] ?? null;
  },

  /**
   * Paket CP: Wie ein Gegner auf die Gestalt reagiert (nur wer vor ihr zusammenbricht, siehe awes): Klasse nach Art
   * der Begegnung, eine Zeile „beim Anblick“, bei Polizei Ansehensverlust (Folge hg_folge_01). Ergebnis { klasse, text } oder null.
   */
  formFearReaction(encounterId) {
    const f = this.content.halbgott?.furcht;
    const enc = this.content.encounters[encounterId];
    if (!f || !enc) return null;
    const blob = `${encounterId} ${enc.name ?? ''} ${enc.sheet ?? ''}`.toLowerCase();
    const klasse = enc.animal || /ratte|hund|katze|taube|moewe|tier/.test(blob) ? 'tiere'
      : enc.occult ? 'beyonder_schwach'
        : /polizei|wache|streife|konstabler|posten|aufseher|grausp/.test(blob) ? 'polizei'
          : /haendler|kraemer|markt|hehler|schmuggler/.test(blob) ? 'haendler' : 'buerger';
    const k = f.klassen?.[klasse] ?? f.klassen?.buerger;
    if (!k) return null;
    const lines = k.beim_anblick ?? [];
    const n = (this.formFearCount = (this.formFearCount ?? 0) + 1);
    if (klasse === 'polizei') this.addHonor?.(-3, 'Die Wache sah deine Gestalt');
    if (!this.flags.has('hg_form_oeffentlich') && klasse !== 'tiere') this.flags.add('hg_form_oeffentlich');
    return { klasse, wirkung: k.wirkung, text: lines.length ? lines[n % lines.length] : null };
  },

  /** Warum die Gestalt gerade nicht geht (oder null). */
  formBlock() {
    const p = this.pathway;
    if (!p || p.seq > FORM_SEQ) return `Erst ab Sequenz ${FORM_SEQ}.`;
    if (!this.formUnlocked()) return `Der Trank der Sequenz ${FORM_SEQ} muss zur Hälfte verdaut sein (${Math.floor(p.digestion)} von ${FORM_MIN_DIGEST} %).${this.formDef()?.gesperrt ? ` ${this.formDef().gesperrt}` : ''}`;
    if (!p.form && this.composure < FORM_MIN_NERVES * 2) return `Dafür fehlen dir die Nerven (mindestens ${FORM_MIN_NERVES * 2}).`;
    return null;
  },

  /** Nimmt die mythische Gestalt an oder legt sie ab. Ergebnis: { ok, text, active } */
  toggleForm() {
    const p = this.pathway;
    const form = this.formDef();
    if (p?.form) {
      this.endForm();
      return { ok: true, active: false, text: form.ablegen ?? `Du atmest aus. ${form.name} fällt von dir ab wie ein nasser Mantel, und du bist wieder nur ein Mensch mit zu hellen Augen.` };
    }
    const block = this.formBlock();
    if (block) return { ok: false, active: false, text: block };
    p.form = true;
    this.setUnruhe(this.unruhe + 5);
    // Merker für Zeitung, Gerede und Lesestücke (Paket CP): kreaturform_an, kreaturform_gezeigt, kreaturform_gezeigt_<n>
    this.formShown = (this.formShown ?? 0) + 1;
    this.flags.add('kreaturform_an');
    this.flags.add('kreaturform_gezeigt');
    for (const n of [1, 3, 10]) if (this.formShown >= n) this.flags.add(`kreaturform_gezeigt_${n}`);
    const pd = this.pathwayDef();
    this.emit('form', { active: true, player: this.acting ?? 1, form: form.id });
    this.emit('form_annehmen', { player: this.acting ?? 1, form: form.id });
    this.emit('changed');
    const rules = `Menschen ohne Pfad und schwächere Wesen brechen zusammen, wenn sie dich sehen. Die Gestalt kostet ${FORM_NERVES_PER_SEC} Nerven und ${FORM_UNRUHE_PER_SEC} Unruhe je Sekunde.`;
    return { ok: true, active: true, text: form.annehmen ? `${form.annehmen} ${form.name}${form.beschreibung ? `: ${form.beschreibung}` : '.'}\n\n${rules}` : `Du lässt los. Was unter deiner Haut gewartet hat, richtet sich auf: ${form.name}, die wahre Gestalt des ${pd.name.replace('Pfad', 'Pfads')}. ${rules}` };
  },

  /** Legt die Gestalt ab (von Hand oder weil die Nerven ausgehen). */
  endForm() {
    const p = this.pathway;
    if (!p?.form) return;
    delete p.form;
    this.flags.delete('kreaturform_an');
    this.emit('form', { active: false, player: this.acting ?? 1, form: this.formDef()?.id });
    this.emit('form_ablegen', { player: this.acting ?? 1, form: this.formDef()?.id });
    this.emit('changed');
  },

  /** Wird aus tickPathway aufgerufen: die Gestalt zehrt und fällt ab, wenn die Nerven ausgehen. */
  tickForm(dt) {
    const p = this.pathway;
    if (!p?.form) return;
    this.setComposure(this.composure - FORM_NERVES_PER_SEC * dt);
    this.unruhe += FORM_UNRUHE_PER_SEC * this.unruheGainMult() * dt; // setUnruhe folgt in tickPathway
    if (this.composure < FORM_MIN_NERVES) {
      this.endForm();
      this.emit('notice', this.formDef()?.zu_lange ?? 'Die Nerven reichen nicht mehr. Deine Gestalt schrumpft zurück in den Körper eines Menschen.');
    }
  },

  /** Bricht dieser Gegner beim Anblick deiner Gestalt zusammen? (Kein Kampf, sofortiger Sieg.) */
  awes(encounterId) {
    const p = this.pathway;
    const enc = this.content.encounters[encounterId];
    if (!p?.form || !enc) return false;
    if (enc.boss || enc.min_seq || enc.practice || enc.mirror) return false;
    if (!enc.occult) return true; // Nicht-Beyonder: Menschen, die dir nichts entgegenzusetzen haben
    return encounterSeq(enc, this.content) - p.seq >= FORM_MARGIN;
  },

  serializePathway() {
    return { money: this.money, pathway: this.pathway, unruhe: Math.round(this.unruhe), seenNodes: [...this.seenNodes], wins: this.wins, picks: this.picks ?? 0, pickedLocks: [...(this.pickedLocks ?? [])], formShown: this.formShown ?? 0, ...this.serializeArtifacts() };
  },

  loadPathway(data) {
    this.money = data.money ?? this.money;
    const p = data.pathway;
    this.pathway = p && this.seqDef(p.id, p.seq) ? { id: p.id, seq: p.seq, digestion: p.digestion ?? 0, ...(p.form ? { form: true } : {}), ...(p.seq5 && typeof p.seq5 === 'object' ? { seq5: p.seq5 } : {}) } : null;
    this.unruhe = Math.max(0, Math.min(UNRUHE_MAX - 1, data.unruhe ?? 0));
    this.seenNodes = new Set(data.seenNodes ?? []);
    this.wins = data.wins ?? 0;
    this.picks = data.picks ?? 0;
    this.pickedLocks = new Set(data.pickedLocks ?? []);
    this.formShown = data.formShown ?? 0;
    this.loadArtifacts(data);
    this.maxHp = this.calcMaxHp();
    this.hp = Math.max(1, Math.min(this.maxHp, data.hp ?? this.maxHp));
    this.composure = Math.min(this.composure, this.maxComposure());
  },
};
