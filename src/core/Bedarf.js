// Pfad-Bedarf (Seb 2026-11-26): Was braucht der Spieler noch für die nächsten Sequenzen seines Pfades?
// Trankzutaten (Haupt-/Kernzutat und Nebenzutaten), Ritualzutaten (consumes), Opfergaben der Prüfungen 3–1
// und die Ritualformel der Sequenz 3. Händler (Kaufen/Verkaufen) und Inventar markieren diese Stücke,
// beim Verkaufen warnt der Laden. Bereits erreichte Sequenzen zählen nicht, ein schon gebrauter Trank
// bzw. ein vollzogenes Ritual auch nicht mehr.
import { ritualformel } from '../data/seqHoch.js';
import { restTrankId, restId } from '../data/beyonderRest.js';

/** So viele kommende Sequenzen werden markiert (die nächste und die übernächste). */
export const BEDARF_SEQS = 2;

export const bedarfMethods = {
  /**
   * Bedarf des gerade handelnden Spielers: Map itemId → { need, reasons: [{ seq, kind: 'trank'|'ritual', main? }] }.
   */
  pfadBedarf() {
    const out = new Map();
    const p = this.pathway;
    if (!p?.id || !(p.seq > 1)) return out;
    const add = (id, n, seq, kind, main = false) => {
      if (!id || !(n > 0) || !this.item(id)) return;
      const e = out.get(id) ?? { need: 0, reasons: [] };
      e.need += n;
      if (!e.reasons.some((r) => r.seq === seq && r.kind === kind)) e.reasons.push({ seq, kind, ...(main ? { main: true } : {}) });
      else if (main) e.reasons.find((r) => r.seq === seq && r.kind === kind).main = true;
      out.set(id, e);
    };
    for (let seq = p.seq - 1; seq >= Math.max(1, p.seq - BEDARF_SEQS); seq--) {
      const sd = this.seqDef(p.id, seq);
      if (!sd) continue;
      const brewed = this.itemCount(`trank_${p.id}_${seq}`) || this.itemCount(restTrankId(p.id, seq));
      if (!brewed) Object.entries(sd.ingredients ?? {}).forEach(([id, n], i) => add(id, n, seq, 'trank', i === 0 || /zutat/.test(id)));
      if (!brewed && seq === 3) add(`formel_${p.id}_3`, 1, seq, 'trank'); // Seb 2026-11-26: Trankformel 3 auf Zirkeln markieren
      // Beyonder-Rest des eigenen Pfads taugt als Hauptzutat: markieren und vor dem Verkauf warnen, solange die echte fehlt
      const haupt = Object.entries(sd.ingredients ?? {})[0];
      if (!brewed && haupt && this.itemCount(haupt[0]) < haupt[1]) add(restId(p.id, seq), 1, seq, 'trank', true);
      const r = sd.ritual;
      if (!r || this.ritualDone(p.id, seq)) continue;
      for (const [id, n] of Object.entries(r.consumes ?? {})) add(id, n, seq, 'ritual');
      for (const st of r.hoch?.steps ?? []) for (const [id, n] of Object.entries(st.items ?? {})) add(id, n, seq, 'ritual');
      if (seq === 3) add(ritualformel(p.id), 1, seq, 'ritual', true);
    }
    return out;
  },

  /** Bedarf je Spieler: { 1: Map, 2?: Map } (Spieler 2 nur im Koop). */
  pfadBedarfAlle() {
    const me = this.acting ?? 1;
    const res = { [me]: this.pfadBedarf() };
    if (this.hasP2?.()) res[me === 1 ? 2 : 1] = this.withPartner(() => this.pfadBedarf());
    return res;
  },

  /**
   * Warnung vor dem Verkauf eines Stücks des handelnden Spielers: wer braucht es noch? Liefert [{ player, seq, kind }]
   * (leer, wenn nach dem Verkauf noch genug bleibt). Der Partner zählt mit, wenn ihm selbst welche fehlen.
   */
  verkaufWarnung(itemId) {
    const me = this.acting ?? 1;
    const out = [];
    for (const [n, map] of Object.entries(this.pfadBedarfAlle())) {
      const e = map.get(itemId);
      if (!e) continue;
      const have = Number(n) === me ? this.itemCount(itemId) - 1 : this.withPartner(() => this.itemCount(itemId));
      if (have < e.need) out.push({ player: Number(n), seq: Math.max(...e.reasons.map((r) => r.seq)), kind: e.reasons[0].kind });
    }
    return out;
  },
};
