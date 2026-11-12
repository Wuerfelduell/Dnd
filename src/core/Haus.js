// Codex DG: Das eigene Haus – Trophäen-Flags aus Siegen, ein Gast pro Abend, Heimkehrgedanke (Daten: data/eigenesHaus.js).
import { DAY_SECONDS } from './Clock.js';

export const hausMethods = {
  /** Trophäen: troph_<id> sobald ein zugehöriger Kampf gewonnen ist (oder das Rückfall-Flag steht). */
  hausTrophaeen() {
    const h = this.content.haus;
    if (!h) return [];
    for (const t of h.trophies) {
      if (this.flags.has(t.id)) continue;
      if (t.won.some((e) => this.flags.has(`won_${e}`)) || t.flags.some((f) => this.flags.has(f))) this.flags.add(t.id);
    }
    return h.trophies.filter((t) => this.flags.has(t.id)).map((t) => t.id);
  },

  /** Wer heute Abend zu Besuch ist (eine Figur der Stadt, reihum je Spieltag; nur wenn die Stadt erreicht ist). */
  hausGast(city) {
    const h = this.content.haus;
    const reached = { wexmoor: 'k2_arrived', dunscar: 'k3_arrived' };
    const list = (h?.guests ?? []).filter((g) => g.city === city && this.flags.has(reached[city]) && this.content.npcs[g.npc]);
    if (!list.length || !this.isNight?.()) return null;
    return list[Math.floor((this.playTime ?? 0) / DAY_SECONDS) % list.length].npc;
  },

  /** Beim Betreten des Hauses: Flags für Gast und Trophäen setzen, ein Heimkehrgedanke. */
  hausBetreten(mapId) {
    const h = this.content.haus;
    const m = h?.maps.find((x) => x.id === mapId);
    if (!m || !this.flags.has('haus_owned')) return null;
    this.hausTrophaeen();
    for (const g of h.guests) this.flags.delete(`haus_gast_${g.npc}`);
    const gast = this.hausGast(m.city);
    if (gast) this.flags.add(`haus_gast_${gast}`);
    const ged = h.gedanken.filter((g) => g.condition?.city === m.city);
    return ged.length ? ged[Math.floor((this.playTime ?? 0) / 60) % ged.length].text : null;
  },
};
