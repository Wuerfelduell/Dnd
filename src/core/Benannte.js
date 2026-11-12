// Codex DJ: Erscheinen der benannten Gegner (Aufbau in data/benannte.js).
// Ein benannter Gegner zeigt sich nachts in seinem Gebiet, wenn jemand Sequenz 6 oder höher (Zahl 1–6) erreicht hat
// und er noch nicht besiegt ist. Je Gebiet, Spieltag und Nacht gibt es genau einen Wurf (10 %); Neuladen würfelt nicht neu.
// Er erscheint nur in einem seiner Gebiete gleichzeitig (das erste, in dem der Wurf gelingt, gilt für diese Nacht).
import { seeded } from './Gatherings.js';
import { DAY_SECONDS } from './Clock.js';

export const BN_CHANCE = 0.1;

export const benannteMethods = {
  bnDef(id) {
    return this.content.benannte?.gegner?.[id] ?? null;
  },

  bnSeqOk() {
    return [this.pathway, this.p2?.active ? this.p2.pathway : null].some((pw) => pw?.id && pw.seq >= 1 && pw.seq <= 6);
  },

  /** Würfel für Gegner, Gebiet und Spieltag (fest, damit Laden und Kartenwechsel nichts ändern). */
  bnWurf(id, zone) {
    const tag = Math.floor((this.playTime ?? 0) / DAY_SECONDS);
    return seeded(`${this.seed ?? ''}|bn|${id}|${zone}|${tag}`)() < (this.bnDef(id)?.erscheinen?.chance ?? BN_CHANCE);
  },

  /** Steht der benannte Gegner heute Nacht in diesem Gebiet? */
  bnErscheint(id, zone) {
    const g = this.bnDef(id);
    if (!g) return false;
    const e = g.erscheinen ?? {};
    if (this.flags.has(`${id}_besiegt`) || (e.forbids_flags ?? []).some((f) => this.flags.has(f))) return false;
    if ((e.requires_flags ?? []).some((f) => !this.flags.has(f))) return false;
    if (!this.bnSeqOk()) return false;
    if (e.zeit === 'nacht' && !this.isNight?.()) return false;
    const zonen = (e.zonen ?? []).map((z) => z.replace(/__warm$/, ''));
    const here = zone.replace(/__warm$/, '');
    const first = zonen.find((z) => this.bnWurf(id, z));
    if (first !== here) return false;
    this.flags.add(e.sichtung_flag ?? `${id}_gesichtet`);
    return true;
  },
};
