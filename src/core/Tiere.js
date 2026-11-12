// Codex DF: Tiergefährten. Ein Tier folgt (tiere.aktiv), weitere warten (Wechsel im Notizbuch, Reiter „Tiere“).
// Vereinfachter Einbau (Seb, 2026-11-12): statt eines eigenen Kampfknopfs greift das aktive Tier zu Beginn
// jedes Kampfes einmal ein (Rabe: Gegner setzt aus, Kater: +8 Nerven, Hund: erster Treffer halbiert);
// dazu kleine dauerhafte Vorteile je Stufe (wie Kleidung) und beim Kater ein Tagesfund.
// Beziehung: einmal je Spieltag mit einem gern genommenen Bissen füttern, Schwellen 0/2/5/9 → Stufe 0–3.
// Im Koop ein gemeinsames Tier für beide (beide sitzen am selben Rechner).
import { DAY_SECONDS } from './Clock.js';

export const TIER_SCHWELLEN = [0, 2, 5, 9];
/** Dauerhafte Vorteile des aktiven Tiers je Stufe 0–3. */
export const TIER_VORTEILE = {
  tier_rabe: (l) => [{ key: 'vision_cost', value: +(0.92 - 0.04 * l).toFixed(2), text: 'Geistsicht kostet weniger Nerven' }],
  tier_kater: (l) => [{ key: 'composure_regen', value: +(1.08 + 0.04 * l).toFixed(2), text: 'Nerven erholen sich schneller' }, { key: 'max_nerves', value: 3 + 2 * l, text: 'mehr maximale Nerven' }],
  tier_hund: (l) => [{ key: 'max_hp', value: 6 + 6 * l, text: 'mehr maximales Leben' }],
};
/** Kampfeingriff: Text in der Kampfzeile. */
export const TIER_KAMPF = {
  tier_rabe: 'setzt den ersten Zug des Gegners aus',
  tier_kater: '+8 Nerven zu Kampfbeginn',
  tier_hund: 'halbiert den ersten Treffer gegen dich',
};

const leer = () => ({ owned: {}, aktiv: null, fundTag: -1 });

export const tiereMethods = {
  tierDaten() { return this.content.tiere ?? null; },
  tierListe() { return Object.keys(this.tierDaten()?.list ?? {}).filter((id) => this.tiere?.owned?.[id]); },
  tierTag() { return Math.floor((this.playTime ?? 0) / DAY_SECONDS); },

  tierStufe(id) {
    const p = this.tiere?.owned?.[id]?.punkte ?? 0;
    return TIER_SCHWELLEN.filter((s) => p >= s).length - 1;
  },

  /** Fundszene: Tier aufnehmen (folgt sofort, wenn noch keins folgt). */
  tierClaim(id) {
    if (!this.tierDaten()?.list?.[id]) return;
    this.tiere ??= leer();
    if (this.tiere.owned[id]) return;
    this.tiere.owned[id] = { punkte: 0, futterTag: -1 };
    this.flags.add(`${id}_gefunden`);
    if (!this.tiere.aktiv) this.tiere.aktiv = id;
    this.updateMaxHp?.();
    this.emit('tier', { id });
    this.emit('notice', `${this.tierDaten().list[id].name} begleitet dich jetzt. Im Notizbuch unter „Tiere“ kannst du füttern und wechseln.`);
  },

  tierAktiv() { return this.tiere?.aktiv ?? null; },

  tierWaehlen(id) {
    if (id && !this.tiere?.owned?.[id]) return false;
    this.tiere.aktiv = id;
    this.updateMaxHp?.();
    this.emit('tier', { id });
    return true;
  },

  /** Passive Vorteile für passive() (Pathways.js). */
  tierEffects() {
    const id = this.tierAktiv();
    return id && TIER_VORTEILE[id] ? TIER_VORTEILE[id](this.tierStufe(id)) : [];
  },

  /** Futter, das man dabei hat: gern genommen oder nicht. */
  tierFutter(id) {
    const a = this.tierDaten()?.beziehung?.animals?.[id];
    if (!a) return [];
    return [...a.likes.map((f) => ({ id: f, gern: true })), ...a.dislikes.map((f) => ({ id: f, gern: false }))].filter((f) => this.itemCount(f.id) > 0 && this.item(f.id));
  },

  tierFuettern(id, futter) {
    const d = this.tierDaten();
    const o = this.tiere?.owned?.[id];
    const a = d?.beziehung?.animals?.[id];
    if (!o || !a || !this.itemCount(futter)) return { text: 'Nichts zum Füttern da.' };
    if (!a.likes.includes(futter)) return { text: d.beziehung.feeding.dislikedMessage };
    if (o.futterTag === this.tierTag()) return { text: `${d.list[id].name} hat heute schon gefressen.` };
    this.removeItem(futter, 1);
    o.futterTag = this.tierTag();
    const vorher = this.tierStufe(id);
    o.punkte = Math.min(9, o.punkte + 1);
    const stufe = this.tierStufe(id);
    this.updateMaxHp?.();
    const zeilen = d.list[id].feedReactions?.[String(stufe)] ?? [];
    const text = zeilen[o.punkte % Math.max(1, zeilen.length)] ?? '';
    return { text: `${text}${stufe > vorher ? `\n\nVertrauen wächst: Stufe ${stufe}.` : ''}` };
  },

  /** Kater: einmal je Spieltag ein Grundvorrat (ab Stufe 1 Verband im Wechsel, ab Stufe 2 zwei Stück). Nicht in Gefahrengebieten. */
  tierTick() {
    const id = this.tierAktiv();
    if (id !== 'tier_kater' || this.tierGefahr()) return;
    const tag = this.tierTag();
    if (this.tiere.fundTag === tag) return;
    this.tiere.fundTag = tag;
    const l = this.tierStufe(id);
    const item = l >= 1 && tag % 2 && this.item('verband') ? 'verband' : 'salzbrot';
    if (!this.item(item)) return;
    this.addItem(item, l >= 2 ? 2 : 1);
    const msg = this.tierDaten().list[id].giftMessages ?? [];
    this.emit('notice', `${msg[tag % Math.max(1, msg.length - 1)] ?? 'Rußfleck bringt dir etwas.'} (+${l >= 2 ? 2 : 1} ${this.item(item).name})`);
  },

  /** In Gefahrengebieten versteckt sich das Tier (kein Folgen, kein Tagesfund). */
  tierGefahr() {
    const zone = this.map;
    this._tierZonen ??= new Set(Object.values(this.content.encounters ?? {}).map((e) => e.zone).filter(Boolean));
    return this._tierZonen.has(zone);
  },

  /** Kampfbeginn (Combat.js): das aktive Tier greift einmal ein. */
  tierKampfStart(combat) {
    const id = this.tierAktiv();
    if (!id || combat.enc?.practice) return;
    const name = this.tierDaten().list[id].name;
    const msg = this.tierDaten().list[id].battleMessages?.[0];
    if (id === 'tier_rabe') {
      if (combat.unshakable?.()) return;
      combat.stunned = true;
    } else if (id === 'tier_kater') this.setComposure(this.composure + 8);
    else if (id === 'tier_hund') combat.tierSchutz = 1;
    combat.log.push(msg ?? `${name} greift ein.`);
  },

  serializeTiere() { return { tiere: this.tiere ?? leer() }; },
  loadTiere(data) {
    const t = data.tiere ?? leer();
    const ids = Object.keys(this.tierDaten()?.list ?? {});
    this.tiere = { owned: Object.fromEntries(Object.entries(t.owned ?? {}).filter(([id]) => ids.includes(id))), aktiv: ids.includes(t.aktiv) && t.owned?.[t.aktiv] ? t.aktiv : null, fundTag: t.fundTag ?? -1 };
  },
};
