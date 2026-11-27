// Rückreise in die alten Städte ab Seq 3 (Seb 2026-11-27): „Ab Seq 3 kann man wieder zurückreisen, immerhin kann dich da nix mehr
// aufhalten. Da sollten dann aber sichtbare Veränderungen in Kettlegate, Wexmoor und Dunscar sein.“
// Inhalte (Reiseziele, Nachhall, Stimmen, Kulisse) stehen in data/heimkehr.js, hier nur die Regeln.
import { HEIMKEHR_SEQ, nachhallPct } from '../data/seq3Weg.js';
import { GEBET_FLUESTERN, GLAEUBIGER_TEXT } from '../data/heimkehr.js';

/** Die alten Städte, in die man ab Seq 3 zurück darf und in denen einen nichts mehr aufhält. */
export const ALTE_STAEDTE = ['kettlegate', 'wexmoor', 'dunscar'];

export const heimkehrMethods = {
  /**
   * Darf die Gruppe zurück? Nach der Ankunft in Calderwick (k4_arrived) und sobald ein Spieler Seq 3 oder besser ist.
   * Im Koop reicht einer: der Halbgott nimmt den anderen mit (gemeinsame Karte, Splitscreen gibt es nur in den Pfadvierteln).
   */
  heimkehr() {
    if (!this.flags?.has('k4_arrived')) return false;
    const seqs = [this.pathway, ...(this.hasP2?.() ? [this.p2?.pathway] : [])].map((p) => p?.seq ?? 9);
    // withPlayer tauscht Pfade aus, darum beide Seiten ansehen (this.pathway ist immer der handelnde Spieler)
    return seqs.some((q) => q <= HEIMKEHR_SEQ);
  },

  /** Steht die Gruppe als Heimkehrer in einer alten Stadt? Dann fürchten und fallen dort alle gewöhnlichen Gegner. */
  heimkehrHier(mapId = this.map) {
    return this.heimkehr() && ALTE_STAEDTE.includes(this.content.maps[mapId]?.city ?? 'kettlegate');
  },

  /**
   * Effekt `nachhall: id`: ein Ort aus der eigenen Geschichte. Einmal je Ort (Flag hk_<id>), verdaut fest nach Sequenz
   * (NACHHALL_PCT, Seq 3 = 2 %), beide Spieler, wer schon Seq 3 oder besser ist. Gibt den Zuwachs des Handelnden zurück.
   */
  nachhall(id) {
    const flag = `hkv_${id}`; // verdaut; das Fundflag hk_<id> setzt der Ort selbst (sets_flags, für die Sackgassen-Prüfung)
    if (this.flags.has(flag)) return 0;
    this.flags.add(flag);
    this.flags.add(`hk_${id}`);
    const one = () => {
      const pct = nachhallPct(this.pathway?.seq);
      return pct > 0 ? this.addDigestion(pct, 'nachhall') : 0;
    };
    const gained = one();
    if (this.hasP2?.()) this.withPartner(one);
    this.emit('notice', 'Nachhall: Etwas in dir erinnert sich.'); // der Zuwachs selbst erscheint über das digest-Ereignis
    return gained;
  },

  /** Beste Sequenz der Gruppe (kleinste Zahl), 9 ohne Pfad. */
  besteSeq() {
    return Math.min(...[this.pathway, ...(this.hasP2?.() ? [this.p2?.pathway] : [])].map((p) => p?.seq ?? 9));
  },

  /**
   * Gebete (data/heimkehr.js GEBETE): ab Calderwick hört man sie, Kettlegate ab Seq 4, Wexmoor ab Seq 3, Dunscar ab Seq 2
   * (ein Spieler reicht). Dann steht die Bitte als Auftrag im Notizbuch; helfen kann man erst vor Ort.
   */
  gebeteTick() {
    if (!this.flags?.has('k4_arrived')) return;
    const best = this.besteSeq();
    let neu = false;
    for (const g of this.content.heimkehr?.gebete ?? []) {
      if (best > g.hoer || this.quests[g.quest] !== undefined) continue;
      this.startQuest(g.quest);
      neu = true;
    }
    if (neu) this.emit('notice', GEBET_FLUESTERN);
  },

  /** Effekt `glaeubiger: id`: die Person, der du geholfen hast, glaubt an dich (Flag glaeubiger_<id>, für spätere Rituale). */
  glaeubigerWerden(id) {
    const flag = `glaeubiger_${id}`;
    if (this.flags.has(flag)) return;
    this.flags.add(flag);
    const g = (this.content.heimkehr?.gebete ?? []).find((x) => x.id === id);
    if (g?.name) this.emit('notice', GLAEUBIGER_TEXT.replace('{0}', g.name));
  },

  /** Gläubiger je Stadt: { kettlegate: [namen], … , gesamt }. */
  glaeubiger() {
    const out = { gesamt: 0 };
    for (const g of this.content.heimkehr?.gebete ?? []) if (this.flags.has(`glaeubiger_${g.id}`)) { (out[g.city] ??= []).push(g.name); out.gesamt++; }
    return out;
  },

  /** Wie viele Nachhall-Orte gibt es und wie viele sind gefunden (für das Notizbuch). */
  nachhallStand() {
    const alle = this.content.heimkehr?.nachhall ?? [];
    return { gefunden: alle.filter((id) => this.flags.has(`hk_${id}`)).length, gesamt: alle.length };
  },
};
