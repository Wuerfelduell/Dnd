// Beziehungen: Jede Figur hat einen Beziehungswert zum Ermittler und daraus eine von drei Stimmungen:
// feindselig (ab `feindselig_ab`), neutral, freundlich (ab `freundlich_ab`). Daten in data/beziehungen.json
// (Regeln, allgemeine Sätze, Figuren mit Vorlieben und Begrüßungen, Knoten-Wirkungen); Pakete können
// `beziehungen` mitbringen (siehe data/questPacks.js).
//
// Woher der Wert kommt:
// - Effekt `relation: { marlowe: 1 }` an Dialogknoten (einmal pro Knoten), Auftragsbelohnungen und Objekten.
// - Geschenke im Gespräch („Etwas schenken …“): mag die Figur es, +1 (höchstens `geschenk_max` Mal),
//   verabscheut sie es, -1 und sie behält es nicht. Alles andere lehnt sie höflich ab.
// - Wer im Gespräch mit einer Figur einen Kampf beginnt (außer Übung), ist bei ihr unten durch.
// - Einzelgänger und Gefährten (core/Bonds.js) behalten ihren Vertrauenswert; er zählt hier als Beziehung.
//
// Was die Stimmung bewirkt:
// - Portrait (lächelnd / misstrauisch) und Abzeichen neben dem Namen, ein Begrüßungssatz am Gesprächsanfang.
// - Bedingungen `requires_relation`, `requires_relation_max`, `requires_mood`, `hide_if_mood` an Optionen.
// - Händler: freundliche geben Nachlass, feindselige schlagen auf (`preis` in den Regeln).
// Zu zweit gehört die Beziehung dem Ermittler (wie Ansehen und Geld), beide Spieler wirken auf sie.

import { COMPANIONS } from './Bonds.js';

export const MOODS = ['feindselig', 'neutral', 'freundlich'];
export const MOOD_LABEL = { feindselig: 'Feindselig', neutral: 'Neutral', freundlich: 'Freundlich' };

const DEFAULT_RULES = { min: -5, max: 6, feindselig_ab: -2, freundlich_ab: 3, geschenk_max: 2, preis: { freundlich: 0.9, feindselig: 1.2 } };

/** Kleiner fester Streuwert, damit jede Figur immer denselben allgemeinen Satz benutzt. */
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export const relationMethods = {
  resetRelations() {
    this.relations = {}; // npcId -> Wert
    this.gifts = {}; // npcId -> Anzahl angenommener Geschenke
  },

  relationRules() {
    const r = this.content.relations?.rules ?? {};
    return { ...DEFAULT_RULES, ...r, preis: { ...DEFAULT_RULES.preis, ...(r.preis ?? {}) } };
  },

  /** Eintrag einer Figur aus beziehungen.json (Vorlieben, Begrüßungen) oder null. */
  relationProfile(id) {
    return this.content.relations?.figuren?.[id] ?? null;
  },

  /** Einzelgänger und Gefährten (Zunder, Pfiff) führen ihren Wert in Bonds.js. */
  usesBond(id) {
    return !!this.loner?.(id) || COMPANIONS.includes(id);
  },

  relation(id) {
    return this.usesBond(id) ? this.bond(id) : this.relations[id] ?? 0;
  },

  /** 'feindselig' | 'neutral' | 'freundlich' */
  mood(id) {
    const st = this.bondStatus?.(id);
    if (st === 'freund') return 'freundlich';
    if (st === 'feind') return 'feindselig';
    const r = this.relationRules();
    const v = this.relation(id);
    return v <= r.feindselig_ab ? 'feindselig' : v >= r.freundlich_ab ? 'freundlich' : 'neutral';
  },

  /** Ändert die Beziehung; gibt den neuen Wert zurück. Unbekannte Figuren werden ignoriert. */
  changeRelation(id, delta, reason = '') {
    if (!Number.isFinite(delta) || !delta) return this.relation(id);
    if (this.usesBond(id)) return this.changeBond(id, delta);
    const npc = this.content.npcs?.[id];
    if (!npc) return 0;
    const r = this.relationRules();
    const before = this.mood(id);
    const old = this.relation(id);
    const v = Math.max(r.min, Math.min(r.max, old + delta));
    this.relations[id] = v;
    if (v === old) return v;
    const mood = this.mood(id);
    this.emit('relation', { id, name: npc.name, value: v, delta: v - old, mood, before, changed: mood !== before, reason });
    this.emit('changed');
    return v;
  },

  /** Kampf im Gespräch (außer Übung): die Figur wird feindselig. */
  hostileAfterFight(id, combat) {
    const enc = this.content.encounters?.[typeof combat === 'string' ? combat : combat?.encounter ?? combat?.id];
    if (enc?.practice || !this.content.npcs?.[id]) return;
    const r = this.relationRules();
    const v = this.relation(id);
    if (v > r.feindselig_ab) this.changeRelation(id, r.feindselig_ab - v, 'Kampf');
  },

  /** Für meets(): requires_relation (mindestens), requires_relation_max (höchstens), requires_mood, hide_if_mood. */
  meetsRelation(o) {
    for (const [id, n] of Object.entries(o.requires_relation ?? {})) if (this.relation(id) < n) return false;
    for (const [id, n] of Object.entries(o.requires_relation_max ?? {})) if (this.relation(id) > n) return false;
    for (const [id, m] of Object.entries(o.requires_mood ?? {})) if (!(Array.isArray(m) ? m : [m]).includes(this.mood(id))) return false;
    for (const [id, m] of Object.entries(o.hide_if_mood ?? {})) if ((Array.isArray(m) ? m : [m]).includes(this.mood(id))) return false;
    return true;
  },

  /** Begrüßungssatz je Stimmung (eigener der Figur, sonst ein allgemeiner), neutral = keiner. */
  greeting(id) {
    if (!this.content.npcs?.[id]) return null;
    const mood = this.mood(id);
    if (mood === 'neutral') return null;
    const own = this.relationProfile(id)?.begruessung?.[mood];
    if (own) return own;
    const pool = this.content.relations?.allgemein?.[mood] ?? [];
    return pool.length ? pool[hash(id) % pool.length] : null;
  },

  /** Preisfaktor eines Händlers nach Stimmung (1 = normal). */
  relationPriceFactor(merchantId) {
    if (!this.content.npcs?.[merchantId]) return 1;
    return this.relationRules().preis[this.mood(merchantId)] ?? 1;
  },

  /** Gegenstände, die man verschenken kann: alles außer Beweisstücken, Formeln und Geliehenem. */
  giftOptions() {
    return this.items().filter((it) => it.kind !== 'key' && it.kind !== 'formula' && !(this.borrowed ?? []).includes(it.id)
      && !(this.weapon === it.id && it.count === 1));
  },

  /** Verschenkt einen Gegenstand: { ok, text, delta }. */
  giveGift(npcId, itemId) {
    const npc = this.content.npcs?.[npcId];
    const it = this.item(itemId);
    if (!npc || !it || !this.itemCount(itemId)) return { ok: false, text: 'Das hast du nicht.', delta: 0 };
    const name = npc.name;
    const p = this.relationProfile(npcId) ?? {};
    const texts = this.content.relations?.texte ?? {};
    const fill = (t) => (t ?? '').replaceAll('{name}', name).replaceAll('{item}', it.name);
    if ((p.verabscheut ?? []).includes(itemId)) {
      this.changeRelation(npcId, -1, 'Geschenk');
      return { ok: false, delta: -1, text: fill(p.ablehnung_beleidigt ?? texts.beleidigt ?? '{name} schiebt {item} zurück und sieht dich lange an.') };
    }
    if (!(p.mag ?? []).includes(itemId)) {
      return { ok: false, delta: 0, text: fill(p.ablehnung ?? texts.ablehnung ?? '„Behalten Sie das, ich hätte keine Verwendung dafür.“') };
    }
    const r = this.relationRules();
    this.removeItem(itemId, 1);
    this.gifts[npcId] = (this.gifts[npcId] ?? 0) + 1;
    const counts = this.gifts[npcId] <= r.geschenk_max;
    if (counts) this.changeRelation(npcId, 1, 'Geschenk');
    this.act?.('trade', 0.5);
    this.emit('changed');
    return { ok: true, delta: counts ? 1 : 0, text: fill(counts ? p.dank ?? texts.dank ?? '{name} nimmt {item} an. „Das vergesse ich Ihnen nicht.“' : p.dank_genug ?? texts.genug ?? '{name} nimmt {item} an, aber mehr Dankbarkeit kauft man damit nicht.') };
  },

  /** Übersicht fürs Notizbuch: Figuren mit Wert ungleich null. */
  relationList() {
    return Object.keys(this.content.npcs ?? {}).filter((id) => this.relation(id) !== 0)
      .map((id) => ({ id, name: this.content.npcs[id].name, value: this.relation(id), mood: this.mood(id) }));
  },

  serializeRelations() {
    return { relations: { ...this.relations }, gifts: { ...this.gifts } };
  },

  loadRelations(data) {
    this.relations = {};
    this.gifts = {};
    for (const [id, v] of Object.entries(data?.relations ?? {})) if (Number.isFinite(v) && this.content.npcs?.[id]) this.relations[id] = v;
    for (const [id, v] of Object.entries(data?.gifts ?? {})) if (Number.isFinite(v) && this.content.npcs?.[id]) this.gifts[id] = v;
  },
};
