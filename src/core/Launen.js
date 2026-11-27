// Launische Artefakte (Seb 2026-11-27): Bindung durch Tragezeit, Stärkestufen, Tagesforderungen und Groll.
//
// Persönlicher Wert `launen` (Party.PERSONAL), Spieler 1 und 2 getrennt: Jeder bindet sich an seine eigenen Stücke.
// - Tragezeit zählt in gespielten Sekunden, solange das Artefakt im Inventar ist (nicht beiseitegelegt).
//   Eingelagert (Büro, Versteck) ruht die Bindung samt Groll. Verlässt das Stück dich ganz (verkauft, weggeworfen,
//   weitergegeben, zurückgegeben), reißt die Bindung: Der nächste Träger fängt bei null an.
// - Ab „Gebunden“ will das Artefakt jeden Spieltag etwas, je nach Wesen (Blutdurst, Wachsamkeit, Neugier,
//   Wissbegier, Habgier); ab „Verwachsen“ doppelt so viel und dazu eine Tat nach dem Grundsatz des eigenen Pfades.
// - Was gemeinsam geschieht (Siege, Gespräche, Beute ...), zählt im Koop für beide; Paraden und Geistsicht nur für den,
//   der sie macht (wie die Verdauung, Pathways.PERSONAL_DIGEST).
// - Wer einen ganzen halben Spieltag mit einem fordernden Artefakt verbracht hat und es nicht satt bekommt, erntet
//   Groll (bis 3): Vorteile schwächer bis ruhend, Flüche stärker, Unruhe. Wird es satt, sinkt der Groll um 1.
import { DAY_SECONDS } from './Clock.js';
import { MULT_KEYS } from './Pathways.js';
import {
  LAUNE_STUFEN, GROLL_STUFEN, GROLL_MAX, LAUNE_TAG_MIN, WESEN, WESEN_KEYS, PFAD_MENGE, PFAD_VISION_SEK,
  LAUNE_FEST, LAUNE_UNTEN, LAUNE_GANZ, cleanLaunen, STUFE_MELDUNG, GROLL_MELDUNG, SATT_MELDUNG, BESAENFTIGT_MELDUNG, RISS_MELDUNG,
} from '../data/launen.js';

/** Artefakte, die sich nicht binden: das Relikt des Verfalls hat seine eigene Verstärkung (Artifacts.reliktEffects). */
const OHNE_LAUNE = new Set(['s4mo_relikt']);

/** Eine Eigenschaft um `f` verstärken oder schwächen. Gibt null zurück, wenn sie ganz ruht. */
export function launeScale(p, f, fluch = false) {
  if (typeof p.value !== 'number' || f === 1) return p;
  if (f <= 0) return null;
  if (!fluch && LAUNE_FEST.has(p.key)) return p;
  let value;
  if (MULT_KEYS.has(p.key)) {
    value = 1 + (p.value - 1) * f;
    if (!fluch && LAUNE_UNTEN[p.key] != null) value = Math.max(LAUNE_UNTEN[p.key], value);
    value = Math.max(0.05, Math.round(value * 100) / 100);
  } else if (LAUNE_GANZ.has(p.key)) {
    value = Math.sign(p.value) * Math.floor(Math.abs(p.value * f));
    if (f > 1 && Math.abs(value) < Math.abs(p.value)) value = p.value;
  } else {
    value = Math.round(p.value * f * 100) / 100;
  }
  return { ...p, value };
}

/** Wesen eines Artefakts aus seinen Vorteilen (erster passender Vorteil), sonst Wissbegier. */
export function wesenOf(item) {
  for (const b of item?.boons ?? []) {
    for (const [w, keys] of Object.entries(WESEN_KEYS)) if (keys.includes(b.key)) return w;
  }
  return 'geist';
}

const tagAt = (playTime) => Math.floor((playTime ?? 0) / DAY_SECONDS);
const fmt = (n) => String(Math.round(n * 10) / 10).replace('.', ',');

export const launenMethods = {
  launenState() {
    if (!this.launen || typeof this.launen.art !== 'object' || !this.launen.heute) this.launen = cleanLaunen(this.launen);
    return this.launen;
  },

  /** Kann sich dieses Stück binden? */
  launeMoeglich(id) {
    return this.item(id)?.kind === 'artifact' && !OHNE_LAUNE.has(id);
  },

  launeEintrag(id) {
    return this.launen?.art?.[id] ?? null;
  },

  /** Bindungsstufe (LAUNE_STUFEN-Eintrag) des handelnden Spielers zu diesem Artefakt. */
  launeStufe(id) {
    const t = this.launeEintrag(id)?.t ?? 0;
    let st = LAUNE_STUFEN[0];
    for (const s of LAUNE_STUFEN) if (t >= s.ab) st = s;
    return st;
  },

  launeGroll(id) {
    return GROLL_STUFEN[this.launeEintrag(id)?.groll ?? 0] ?? GROLL_STUFEN[0];
  },

  launeWesen(id) {
    return wesenOf(this.item(id));
  },

  /** Wie viel eine Handlungsliste heute schon zählt. */
  launeZaehlt(kinds) {
    const h = this.launen?.heute ?? {};
    return Object.entries(kinds).reduce((sum, [k, w]) => sum + (h[k] ?? 0) * w, 0);
  },

  /** Grundsatz des eigenen Pfades als Handlungsliste (Geistsicht zählt je PFAD_VISION_SEK Sekunden). */
  launePfadKinds() {
    const d = this.pathwayDef?.()?.digest ?? {};
    return Object.fromEntries(Object.keys(d).filter((k) => k !== 'quest').map((k) => [k, k === 'vision' ? 1 / PFAD_VISION_SEK : 1]));
  },

  /** Was das Artefakt heute will: [{art: 'wesen'|'pfad', will, have, need, done}] (leer unter „Gebunden“). */
  launeForderung(id) {
    const st = this.launeStufe(id);
    if (!st.fordert) return [];
    const w = WESEN[this.launeWesen(id)];
    const mal = st.pfad ? 2 : 1;
    const out = [{ art: 'wesen', will: w.will, need: w.menge * mal, have: Math.min(w.menge * mal, Math.floor(this.launeZaehlt(w.kinds))) }];
    const pk = this.launePfadKinds();
    if (st.pfad && this.pathway && Object.keys(pk).length) {
      out.push({ art: 'pfad', will: 'Tat nach deinem Grundsatz', need: PFAD_MENGE, have: Math.min(PFAD_MENGE, Math.floor(this.launeZaehlt(pk))) });
    }
    for (const f of out) f.done = f.have >= f.need;
    return out;
  },

  /** Hat das Artefakt heute bekommen, was es will? (Ohne Forderung: immer.) */
  launeErfuellt(id) {
    return this.launeForderung(id).every((f) => f.done);
  },

  /** Faktoren auf Vorteile und Flüche aus Bindung und Groll. */
  launeFaktor(id) {
    if (!this.launeMoeglich(id)) return { boon: 1, curse: 1 };
    const st = this.launeStufe(id);
    const g = this.launeGroll(id);
    return { boon: st.boon * g.boon, curse: st.curse * g.curse };
  },

  /** Vorteile und Flüche eines Artefakts samt Bindung und Groll (zwischengespeichert je Stufe). */
  launeWirkung(id, it = this.item(id)) {
    const f = this.launeFaktor(id);
    if (f.boon === 1 && f.curse === 1) return { boons: it?.boons ?? [], curses: it?.curses ?? [] };
    const key = `${this.acting ?? 1}:${id}:${f.boon}:${f.curse}`;
    this._launeCache ??= new Map();
    let w = this._launeCache.get(key);
    if (!w) {
      w = {
        boons: (it.boons ?? []).map((b) => launeScale(b, f.boon)).filter(Boolean),
        curses: (it.curses ?? []).map((c) => launeScale(c, f.curse, true)).filter(Boolean),
      };
      if (this._launeCache.size > 500) this._launeCache.clear();
      this._launeCache.set(key, w);
    }
    return w;
  },

  /** Zusätzliche Unruhe pro Sekunde durch grollende Artefakte am Leib. */
  launeUnruhe() {
    if (!this.launen?.art) return 0;
    return this.activeArtifacts().reduce((sum, id) => sum + (this.launeMoeglich(id) ? this.launeGroll(id).unruhe : 0), 0);
  },

  launeMeldung(id, text) {
    const pre = (this.acting ?? 1) === 2 ? 'Spieler 2: ' : '';
    this.emit('notice', `${pre}${this.item(id)?.name ?? id}: ${text}`);
  },

  /** Wird aus act() aufgerufen: Was heute geschieht, füttert die Launen des handelnden Spielers. */
  launeNote(kind, amount = 1) {
    if (!(amount > 0)) return;
    const st = this.launenState();
    if (st.tag == null) st.tag = tagAt(this.playTime);
    st.heute[kind] = (st.heute[kind] ?? 0) + amount;
    let changed = false;
    for (const id of this.activeArtifacts()) {
      const e = st.art[id];
      if (!e || e.satt || !this.launeMoeglich(id) || !this.launeStufe(id).fordert || !this.launeErfuellt(id)) continue;
      e.satt = true;
      if (e.groll > 0) { e.groll -= 1; changed = true; this.launeMeldung(id, BESAENFTIGT_MELDUNG); } else this.launeMeldung(id, SATT_MELDUNG);
    }
    if (changed) { this.updateMaxHp?.(); this.emit('changed'); }
  },

  /** Wird aus tickPathway aufgerufen (für jeden Spieler): Tragezeit zählen, Tageswechsel auswerten. */
  launeTick(dt) {
    const st = this.launenState();
    const tag = tagAt(this.playTime);
    if (st.tag == null) st.tag = tag;
    else if (st.tag !== tag) this.launeTagEnde(tag);
    if (!(dt > 0)) return;
    let changed = false;
    for (const id of this.activeArtifacts()) {
      if (!this.launeMoeglich(id)) continue;
      const e = st.art[id] ??= { t: 0, d: 0, groll: 0, satt: false };
      const vorher = this.launeStufe(id).stufe;
      e.t += dt;
      e.d += dt;
      const jetzt = this.launeStufe(id).stufe;
      if (jetzt > vorher) {
        changed = true;
        this.launeMeldung(id, STUFE_MELDUNG[jetzt]);
        if (LAUNE_STUFEN[jetzt].fordert && this.launeErfuellt(id)) e.satt = true; // was heute schon geschah, zählt
      }
    }
    if (changed) { this.updateMaxHp?.(); this.emit('changed'); }
  },

  /** Ein Spieltag ist vorbei: Wer nicht bekam, was er wollte, grollt. */
  launeTagEnde(tag) {
    const st = this.launenState();
    let changed = false;
    for (const [id, e] of Object.entries(st.art)) {
      if (this.launeMoeglich(id) && this.launeStufe(id).fordert && e.d >= LAUNE_TAG_MIN && !e.satt && !this.launeErfuellt(id) && !this.testmodus) {
        if (e.groll < GROLL_MAX) {
          e.groll += 1;
          changed = true;
          if (this.itemCount(id) > 0) this.launeMeldung(id, GROLL_MELDUNG[e.groll]);
        }
      }
      e.d = 0;
      e.satt = false;
    }
    st.heute = {};
    st.tag = tag;
    if (changed) { this.updateMaxHp?.(); this.emit('changed'); }
  },

  /** Das Stück ist ganz weg (verkauft, weggeworfen, weitergegeben): Die Bindung reißt. */
  launeVergessen(id) {
    const e = this.launen?.art?.[id];
    if (!e) return;
    const spuerbar = this.launeStufe(id).stufe > 0;
    delete this.launen.art[id];
    if (spuerbar) this.launeMeldung(id, RISS_MELDUNG);
  },

  /** Für das Inventar: Bindung, Wesen, heutige Forderung und Groll als einfache Daten. */
  launeInfo(id) {
    if (!this.launeMoeglich(id)) return null;
    const st = this.launeStufe(id);
    const e = this.launeEintrag(id);
    const next = LAUNE_STUFEN[st.stufe + 1] ?? null;
    const g = this.launeGroll(id);
    const w = WESEN[this.launeWesen(id)];
    return {
      stufe: st, groll: g, wesen: w,
      bisNaechste: next ? { name: next.name, tage: fmt(Math.max(0.1, (next.ab - (e?.t ?? 0)) / DAY_SECONDS)) } : null,
      faktor: this.launeFaktor(id), forderung: this.launeForderung(id),
    };
  },
};
