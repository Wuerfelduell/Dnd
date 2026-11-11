// Einzelgänger (Kapitel 2, Daten in wexmoor.json → loners): Beyonder ohne Zirkel, jeder mit eigenem Pfad und eigener Sequenz.
// Man kann sich mit ihnen anfreunden oder sie sich zum Feind machen. Die Beziehung ist eine Zahl (bond):
// - Effekt `bond: { ez_x: +1 }` in Dialogen, Bedingungen `requires_bond: { ez_x: 2 }` (mindestens) und `requires_bond_max` (höchstens).
// - Ab `friend_at` ist man befreundet (Flag <id>_freund), ab `foe_at` verfeindet (Flag <id>_feind). Danach ändert sich nichts mehr.
// - Befreundete Einzelgänger bürgen für neue Zirkel (siehe treffen.json), Feinde greifen an und lassen ihre Zutat fallen.

/** Gefährten mit eigenem Vertrauenswert (kein Einzelgänger). */
export const COMPANIONS = ['zunder', 'k3_pfiff', 'cw_ida_bellcross', 'cw_crayford', 'bh_bellweather']; // Kapitel 3: Pfiff (AR); Kapitel 4/5: Ida, Klammer, Bellweather (CC/CG)

export const bondMethods = {
  resetBonds() {
    this.bonds = {};
  },

  lonerRules() {
    return this.content.loners ?? null;
  },

  loner(id) {
    return this.lonerRules()?.list?.[id] ?? null;
  },

  bond(id) {
    return this.bonds[id] ?? 0;
  },

  /** 'freund', 'feind' oder null (noch offen). */
  bondStatus(id) {
    if (this.flags.has(`${id}_freund`)) return 'freund';
    if (this.flags.has(`${id}_feind`)) return 'feind';
    return null;
  },

  changeBond(id, delta) {
    const r = this.lonerRules();
    // Gefährten wie Zunder (Paket AB): Vertrauen wird gezählt, ohne Freund/Feind-Umschlag der Einzelgänger
    if (!this.loner(id) && COMPANIONS.includes(id)) {
      const v = this.bond(id) + delta;
      this.bonds[id] = v;
      this.emit('bond', { id, value: v, delta, status: null, name: this.content.npcs[id]?.name ?? id, companion: true });
      this.emit('changed');
      return v;
    }
    if (!r || !this.loner(id) || this.bondStatus(id)) return this.bond(id);
    const v = Math.max(r.foe_at, Math.min(r.friend_at, this.bond(id) + delta));
    this.bonds[id] = v;
    let status = null;
    if (v >= r.friend_at) { this.flags.add(`${id}_freund`); status = 'freund'; }
    else if (v <= r.foe_at) { this.flags.add(`${id}_feind`); status = 'feind'; }
    this.emit('bond', { id, value: v, delta, status, name: this.loner(id).name });
    this.emit('changed');
    return v;
  },

  /** Für meets(): requires_bond (mindestens) und requires_bond_max (höchstens). */
  meetsBond(o) {
    for (const [id, n] of Object.entries(o.requires_bond ?? {})) if (this.bond(id) < n) return false;
    for (const [id, n] of Object.entries(o.requires_bond_max ?? {})) if (this.bond(id) > n) return false;
    return true;
  },

  /** Übersicht für das Notizbuch: [{ id, name, pathway, seq, value, status }] aller schon getroffenen. */
  knownLoners() {
    return Object.entries(this.lonerRules()?.list ?? {})
      .filter(([id]) => this.flags.has(`${id}_getroffen`))
      .map(([id, l]) => ({ id, ...l, value: this.bond(id), status: this.bondStatus(id) }));
  },

  serializeBonds() {
    return { ...this.bonds };
  },

  loadBonds(data) {
    this.bonds = {};
    for (const [id, v] of Object.entries(data ?? {})) if (Number.isFinite(v)) this.bonds[id] = v;
  },
};
