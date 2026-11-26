// Kopfgeld auf den Spieler (Aufbau in data/kopfgeldjaeger.js).
// Ab KGJ_AB_BEYONDERN getöteten Beyondern jagt einen je Stadt und Spieltag genau ein Kopfgeldjäger in einem zufälligen
// Gefahrengebiet. Gebiet und Jäger sind je Tag fest (Neuladen würfelt nicht neu). Nach seinem Sieg kommt erst am
// nächsten Spieltag wieder einer (Flag kgj_tag_<gruppe>_<tag>), damit sich Reste nicht farmen lassen.
import { seeded } from './Gatherings.js';
import { DAY_SECONDS } from './Clock.js';
import { isBeyonderFoe } from './Seq5.js';
import { KGJ_AB_BEYONDERN, KGJ_GRUPPEN, kgjZonen, kgjGebiet } from '../data/kopfgeldjaeger.js';

export const kopfgeldjaegerMethods = {
  kgjTag() {
    return Math.floor((this.playTime ?? 0) / DAY_SECONDS);
  },

  /** Wie viele verschiedene Beyonder hat man getötet (Jäger zählen nicht)? */
  kgjBeyonderSiege() {
    let n = 0;
    for (const [id, e] of Object.entries(this.content.encounters)) if (!e.kopfgeldjaeger && this.flags.has(`won_${id}`) && isBeyonderFoe(id, e)) n++;
    return n;
  },

  /** Ist ein Kopfgeld auf dich ausgesetzt? */
  kgjKopfgeld() {
    return this.kgjBeyonderSiege() >= KGJ_AB_BEYONDERN;
  },

  /** Heutiger Jäger einer Stadtgruppe: { zone, id } (oder null, wenn heute schon einer gefallen ist). */
  kgjHeute(gruppe) {
    const g = KGJ_GRUPPEN[gruppe];
    if (!g) return null;
    const tag = this.kgjTag();
    if (this.flags.has(`kgj_tag_${gruppe}_${tag}`)) return null;
    const zonen = [...new Set(kgjZonen(this.content, gruppe).map(kgjGebiet))];
    const jaeger = g.jaeger.map(([id]) => id).filter((id) => this.content.encounters[id]);
    if (!zonen.length || !jaeger.length) return null;
    const r = seeded(`${this.seed ?? ''}|kgj|${gruppe}|${tag}`);
    return { zone: zonen[Math.floor(r() * zonen.length) % zonen.length], id: jaeger[Math.floor(r() * jaeger.length) % jaeger.length] };
  },

  /** Steht dieser Jäger heute in diesem Gebiet? (Roamers.build) */
  kgjErscheint(id, zone) {
    const e = this.content.encounters[id];
    if (!e?.kopfgeldjaeger || !this.kgjKopfgeld()) return false;
    const h = this.kgjHeute(e.kgj_gruppe);
    if (!h || h.id !== id || h.zone !== kgjGebiet(zone)) return false;
    if (!this.flags.has('kgj_bekannt')) {
      this.flags.add('kgj_bekannt');
      this.emit('notice', 'Auf deinen Kopf ist ein Preis ausgesetzt. Du hast zu viele Beyonder getötet. Ab jetzt jagen dich Kopfgeldjäger, höchstens einer am Tag.');
    }
    return true;
  },

  /** Nach einem Sieg (Combat.finish): Kopfgeldjäger gefallen, heute kommt keiner mehr. */
  kgjSieg(id) {
    const e = this.content.encounters[id];
    if (!e?.kopfgeldjaeger) return;
    for (const f of [...this.flags]) if (f.startsWith(`kgj_tag_${e.kgj_gruppe}_`)) this.flags.delete(f);
    this.flags.add(`kgj_tag_${e.kgj_gruppe}_${this.kgjTag()}`);
  },
};
