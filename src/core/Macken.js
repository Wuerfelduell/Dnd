// Bleibende Macken (Seb 2026-11-26): knapp am Kontrollverlust vorbei → manchmal eine dauerhafte, pfadpassende Eigenheit.
// Persönlicher Wert `macken` (Party.PERSONAL): { ids: [...], nah: bool }. Spieler 1 und 2 getrennt.
// Auslöser: Unruhe stieg auf MACKE_NAH und fiel ohne Kontrollverlust unter MACKE_ENTWARNUNG, oder ein riskanter Trank gelang.
import { MACKEN, MACKEN_BY_ID, MACKE_NAH, MACKE_ENTWARNUNG, MACKE_CHANCE, MACKE_MAX } from '../data/macken.js';

/** Gespeicherte Macken säubern (alte Stände haben keine). */
export function cleanMacken(m) {
  const ids = [...new Set(Array.isArray(m?.ids) ? m.ids : [])].filter((id) => MACKEN_BY_ID[id]).slice(0, MACKE_MAX);
  return { ids, nah: !!m?.nah };
}

export const mackenMethods = {
  mackenState() {
    if (!this.macken || !Array.isArray(this.macken.ids)) this.macken = cleanMacken(this.macken);
    return this.macken;
  },

  /** Die Macken des handelnden Spielers. */
  mackenList() {
    return (this.macken?.ids ?? []).map((id) => MACKEN_BY_ID[id]).filter(Boolean);
  },

  /** Für Pathways.passive: alle Wirkungen der Macken. */
  mackenEffects() {
    return this.mackenList().flatMap((m) => m.effects);
  },

  /** Nach jeder Änderung der Unruhe (Pathways.setUnruhe). */
  mackenUnruhe(before, after) {
    if (!this.pathway || this.testmodus) return;
    const st = this.mackenState();
    if (after >= MACKE_NAH) st.nah = true;
    else if (st.nah && after < MACKE_ENTWARNUNG && before >= MACKE_ENTWARNUNG) {
      st.nah = false;
      this.mackeWurf('Die Unruhe ebbt ab. Das war knapp, knapper als je zuvor.');
    }
  },

  /** Ein Kontrollverlust ist kein knappes Vorbeischrammen. */
  mackenKontrollverlust() {
    if (this.macken) this.macken.nah = false;
  },

  /**
   * Knapp vorbei: mit MACKE_CHANCE bleibt eine Macke des eigenen Pfades, die man noch nicht hat. rng: Tests.
   * Gibt die neue Macke zurück (oder null).
   */
  mackeWurf(anlass, rng = this.rng ?? Math.random) {
    const st = this.mackenState();
    const pool = (MACKEN[this.pathway?.id] ?? []).filter((m) => !st.ids.includes(m.id));
    if (!pool.length || st.ids.length >= MACKE_MAX) return null;
    if (rng() >= MACKE_CHANCE) return null;
    const m = pool[Math.floor(rng() * pool.length) % pool.length];
    st.ids.push(m.id);
    if (m.effects.some((e) => e.key === 'max_nerves')) this.updateMaxHp?.();
    const text = `${anlass}\n\nAber etwas ist geblieben: ${m.name}. ${m.text}\n\n${m.effects.map((e) => e.text).join(' ')} Das geht nicht mehr weg.`;
    this.emit('macke', { id: m.id, name: m.name, text, player: this.acting ?? 1 });
    this.emit('changed');
    return m;
  },
};
