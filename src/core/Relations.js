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

const DEFAULT_RULES = { min: -5, max: 6, feindselig_ab: -2, freundlich_ab: 3, geschenk_max: 3, geschenk_wert: 12, preis: { freundlich: 0.9, feindselig: 1.2 } };

/** Geschenk-Arten: Gegenstandsart → Bezeichnung im Fenster; jede Figur mag zwei davon (eigene `mag_arten` oder fest zugelost). */
export const GIFT_KINDS = { consumable: 'Stärkungsmittel', potion: 'Tränke', ingredient: 'Zutaten', trophy: 'Kuriositäten', gear: 'Kleidung und Schmuck', weapon: 'Waffen', artifact: 'Artefakte' };
const DRAWN_KINDS = ['consumable', 'trophy', 'gear', 'ingredient', 'potion'];
/** Wert eines Geschenks ohne Preis, je Art (Schilling). */
const KIND_VALUE = { consumable: 6, potion: 25, ingredient: 5, trophy: 10, gear: 15, weapon: 20, artifact: 40 };

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

  /** Was eine Figur mag: { items, kinds, hates, hateKinds }. Ohne eigenes Profil bekommt sie zwei feste Arten zugelost. */
  giftTastes(id) {
    const p = this.relationProfile(id) ?? {};
    let kinds = p.mag_arten;
    if (!kinds) {
      const h = hash(id);
      const a = DRAWN_KINDS[h % DRAWN_KINDS.length];
      const b = DRAWN_KINDS[(h / 7 + 1 + (h % (DRAWN_KINDS.length - 1))) % DRAWN_KINDS.length | 0];
      kinds = a === b ? [a] : [a, b];
    }
    return { items: p.mag ?? [], kinds, hates: p.verabscheut ?? [], hateKinds: p.verabscheut_arten ?? [] };
  },

  /** Wert eines Gegenstands als Geschenk (Schilling): Verkaufspreis, Preis oder Richtwert der Art. */
  giftValue(itemId) {
    const it = this.item(itemId);
    if (!it) return 0;
    return this.content.market?.sell_prices?.[itemId] ?? it.price ?? KIND_VALUE[it.kind] ?? 0;
  },

  /** Wie ein Geschenk ankäme: 'hass' | 'mag' | 'wertvoll' | 'nein'. */
  giftFit(npcId, itemId) {
    const it = this.item(itemId);
    if (!it) return 'nein';
    const t = this.giftTastes(npcId);
    if (t.hates.includes(itemId) || t.hateKinds.includes(it.kind)) return 'hass';
    if (t.items.includes(itemId) || t.kinds.includes(it.kind)) return 'mag';
    if (this.giftValue(itemId) >= this.relationRules().geschenk_wert) return 'wertvoll';
    return 'nein';
  },

  /** Gegenstände, die man verschenken kann: alles außer Beweisstücken, Formeln, Geliehenem und der einzigen Waffe. */
  giftOptions(npcId = null) {
    return this.items().filter((it) => it.kind !== 'key' && it.kind !== 'formula' && !(this.borrowed ?? []).includes(it.id)
      && !(this.weapon === it.id && it.count === 1))
      .map((it) => ({ ...it, fit: npcId ? this.giftFit(npcId, it.id) : null, value: this.giftValue(it.id) }));
  },

  /**
   * Verschenkt einen Gegenstand: { ok, text, delta, fit }.
   * Gemochtes (Ding oder Art) und Wertvolles (ab geschenk_wert) wird angenommen und zählt +1, bis zu geschenk_max Mal je Figur;
   * Verabscheutes kostet -1 und bleibt beim Spieler; Billiges wird abgelehnt, und die Figur verrät dabei, was sie mag.
   */
  giveGift(npcId, itemId) {
    const npc = this.content.npcs?.[npcId];
    const it = this.item(itemId);
    if (!npc || !it || !this.itemCount(itemId)) return { ok: false, text: 'Das hast du nicht.', delta: 0, fit: 'nein' };
    const name = npc.name;
    const p = this.relationProfile(npcId) ?? {};
    const texts = this.content.relations?.texte ?? {};
    const wish = this.giftTastes(npcId).kinds.map((k) => GIFT_KINDS[k] ?? k).join(' oder ');
    const fill = (t) => (t ?? '').replaceAll('{name}', name).replaceAll('{item}', it.name).replaceAll('{wunsch}', wish);
    const fit = this.giftFit(npcId, itemId);
    if (fit === 'hass') {
      this.changeRelation(npcId, -1, 'Geschenk');
      return { ok: false, delta: -1, fit, text: fill(p.ablehnung_beleidigt ?? texts.beleidigt ?? '{name} schiebt {item} zurück und sieht dich lange an.') };
    }
    if (fit === 'nein') {
      return { ok: false, delta: 0, fit, text: fill(p.ablehnung ?? texts.ablehnung ?? '„Behalten Sie das. Wenn Sie mir eine Freude machen wollen: {wunsch}.“') };
    }
    const r = this.relationRules();
    this.removeItem(itemId, 1);
    this.gifts[npcId] = (this.gifts[npcId] ?? 0) + 1;
    const counts = this.gifts[npcId] <= r.geschenk_max;
    if (counts) this.changeRelation(npcId, 1, 'Geschenk');
    this.act?.('trade', 0.5);
    this.emit('changed');
    const text = !counts ? p.dank_genug ?? texts.genug ?? '{name} nimmt {item} an, aber mehr Dankbarkeit kauft man damit nicht.'
      : fit === 'wertvoll' ? p.dank_wertvoll ?? texts.wertvoll ?? '{name} wiegt {item} in der Hand. „Das ist zu viel. Aber ich nehme es, und ich merke es mir.“'
        : p.dank ?? texts.dank ?? '{name} nimmt {item} an. „Das vergesse ich Ihnen nicht.“';
    return { ok: true, delta: counts ? 1 : 0, fit, text: fill(text) };
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
