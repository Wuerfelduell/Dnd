// Freies Trankbrauen (Seb, 2026-11-12): ab Sequenz 6 des Pfads des Kessels. Bis zu drei Zutaten in den Kessel,
// ein leeres Gefäß dazu, fertig ist ein Sud (Rezepte in data/sude.js) oder ein Trüber Sud, wenn nichts passt.
// Jedes Rezept, das man zum ersten Mal trifft, gilt als eigene Erfindung (für das Seq-5-Ritual des Kessels).
// Sude mit `buff` wirken auf Zeit wie Welt-Fähigkeiten (Talents.js, Quelle „sud:<id>“).
import { SUDE, SUD_MAX_ZUTATEN, SUD_PFUSCH, LEERES_GEFAESS, sudRecipeFor } from '../data/sude.js';
import { buffLabel, fmtSec } from './Talents.js';

export const SUD_SEQ = 6;
export const SUD_PATHWAY = 'kessel';

export const sudeMethods = {
  resetSude() {
    this.sudeBekannt = []; // Rezepte, die man schon einmal getroffen hat (gemeinsam, wie das Notizbuch)
  },

  /** Darf der Spieler, dessen Werte gerade gelten, frei brauen? */
  freeBrewUnlocked() {
    return this.pathway?.id === SUD_PATHWAY && this.pathway.seq <= SUD_SEQ;
  },

  /** Warum das freie Brauen gerade nicht geht (oder null). */
  freeBrewBlock() {
    if (!this.pathway) return 'Ohne Pfad kocht der Kessel nur nach Formel.';
    if (this.pathway.id !== SUD_PATHWAY) return `Nur der Pfad des Kessels braut ohne Formel. ${this.pathwayDef().name} nicht.`;
    if (this.pathway.seq > SUD_SEQ) return `Freies Brauen ab Sequenz ${SUD_SEQ} des Kessels (du bist ${this.pathway.seq}).`;
    return null;
  },

  /** Zutaten in der Tasche, die in den Kessel dürfen: [{id, name, count}]. */
  sudIngredients() {
    return Object.keys(this.inventory).filter((id) => this.item(id)?.kind === 'ingredient' && id !== LEERES_GEFAESS)
      .map((id) => ({ id, name: this.item(id).name, count: this.itemCount(id) })).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  },

  /** Schon getroffene Rezepte mit Zutaten: [{id, name, zutaten: [{id, name}], item}] */
  knownSude() {
    return SUDE.filter((s) => (this.sudeBekannt ?? []).includes(s.id)).map((s) => ({ id: s.id, name: s.name, item: `sud_${s.id}`, zutaten: s.zutaten.map((z) => ({ id: z, name: this.item(z)?.name ?? z })) }));
  },

  /**
   * Braut aus bis zu drei Zutaten (Ids, Mehrfachnennung = mehrere Stück) einen Sud ins leere Gefäß.
   * Ergebnis: { ok, text, item?, neu? }
   */
  brewSud(ids) {
    const block = this.freeBrewBlock();
    if (block) return { ok: false, text: block };
    const list = (ids ?? []).filter(Boolean);
    if (!list.length) return { ok: false, text: 'Wirf erst etwas in den Kessel.' };
    if (list.length > SUD_MAX_ZUTATEN) return { ok: false, text: `Höchstens ${SUD_MAX_ZUTATEN} Zutaten passen in einen Sud.` };
    if (!this.itemCount(LEERES_GEFAESS)) return { ok: false, text: 'Dir fehlt ein leeres Gefäß zum Abfüllen (Nell, Crane, Maud Keel oder die Trödlerin führen welche).' };
    const need = {};
    for (const id of list) {
      if (this.item(id)?.kind !== 'ingredient' || id === LEERES_GEFAESS) return { ok: false, text: `${this.item(id)?.name ?? id} gehört nicht in den Kessel.` };
      need[id] = (need[id] ?? 0) + 1;
    }
    for (const [id, n] of Object.entries(need)) if (this.itemCount(id) < n) return { ok: false, text: `Davon hast du nicht genug: ${this.item(id).name}.` };
    const recipe = sudRecipeFor(list);
    for (const [id, n] of Object.entries(need)) this.removeItem(id, n);
    this.removeItem(LEERES_GEFAESS);
    const item = recipe ? `sud_${recipe.id}` : SUD_PFUSCH;
    this.addItem(item);
    this.act('brew');
    let neu = false;
    if (recipe) {
      this.sudeBekannt ??= [];
      if (!this.sudeBekannt.includes(recipe.id)) { this.sudeBekannt.push(recipe.id); neu = true; }
    }
    this.emit('sud', { item, recipe: recipe?.id ?? null, neu, player: this.acting ?? 1 });
    this.emit('changed');
    const it = this.item(item);
    const text = recipe
      ? `${neu ? 'Der Kessel färbt sich, wie du es noch nie gesehen hast. Eine eigene Schöpfung: ' : 'Der Dampf riecht vertraut: '}${it.name}. ${it.desc}`
      : `Der Kessel spuckt und wird grau. Das ist kein Rezept, das ist ${it.name}. ${it.desc}`;
    return { ok: true, text, item, neu, recipe: recipe?.id ?? null };
  },

  /** Zeitweilige Wirkung eines Suds anlegen (aus applyConsumable). Gibt den Textteil zurück. */
  applySudBuff(it) {
    if (!it.buff) return null;
    this.buffs ??= [];
    const source = it.sud ? `sud:${it.sud}` : `item:${it.name}`; // gekaufte Mittel (Geisterlaterne) zählen nicht als eigener Sud
    this.buffs = this.buffs.filter((x) => !(x.source === source && x.key === it.buff.key));
    this.buffs.push({ key: it.buff.key, value: it.buff.value, until: (this.talentTime ?? 0) + it.buff.seconds, source });
    return `${buffLabel(it.buff)} (${fmtSec(it.buff.seconds)})`;
  },

  /** Läuft gerade die Wirkung eines eigenen Suds? Gibt den Buff zurück (oder null). */
  activeSudBuff() {
    return this.activeBuffs().find((b) => typeof b.source === 'string' && b.source.startsWith('sud:')) ?? null;
  },

  serializeSude() {
    return { sudeBekannt: [...(this.sudeBekannt ?? [])] };
  },

  loadSude(data) {
    this.sudeBekannt = Array.isArray(data.sudeBekannt) ? data.sudeBekannt.filter((id) => SUDE.some((s) => s.id === id)) : [];
  },
};
