// Geheime Treffen (Daten in src/data/treffen.json).
// Ab Fall 4 kann man Zirkeln beitreten, die sich im Verborgenen zum Handeln treffen.
// Die Treffen laufen auf einer Spielzeit-Uhr: alle `interval_min` Minuten beginnt reihum
// das Treffen eines Zirkels und bleibt `open_min` Minuten offen. Was dort angeboten wird,
// steht pro Treffen fest (Würfel mit festem Startwert), damit Laden und Neuladen nichts ändert.
// Dieselbe Uhr steuert die seltenen Angebote (`rare`) auf dem normalen Markt.

/** Kleiner Zufallsgenerator mit Startwert: gleicher Text, gleiches Ergebnis. */
export function seeded(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmt = (sec) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const gatheringMethods = {
  resetGatherings() {
    this.playTime = 0; // gespielte Sekunden (Dialoge, Menüs und Kämpfe zählen nicht)
    this.gatheringBought = { cycle: -1, items: {} };
    this.lastGatheringCycle = null;
  },

  gatheringRules() {
    return this.content.gatherings?.rules ?? null;
  },

  gatheringDef(id) {
    return this.content.gatherings?.circles?.[id] ?? null;
  },

  /** Ab wann gibt es die Treffen überhaupt (ab Fall 4)? */
  gatheringsUnlocked() {
    const r = this.gatheringRules();
    return !!r && this.meets(r.unlock);
  },

  isMember(id) {
    const g = this.gatheringDef(id);
    return !!g && this.flags.has(g.member_flag);
  },

  memberships() {
    return Object.keys(this.content.gatherings?.circles ?? {}).filter((id) => this.isMember(id));
  },

  /** Laufende Runde der Uhr (auch für seltene Marktangebote). */
  marketCycle(t = this.playTime) {
    const r = this.gatheringRules();
    return r ? Math.floor(t / (r.interval_min * 60)) : 0;
  },

  /** Welches Treffen gehört zur Runde `cycle`? { id, cycle, start, end } in Spielsekunden. */
  gatheringSlot(cycle) {
    const r = this.gatheringRules();
    // Jede Stadt hat ihre eigenen Zirkel (rules.orders.<stadt>); sonst die Reihenfolge von Kettlegate
    const order = r.orders?.[this.content.maps[this.map]?.city ?? 'kettlegate'] ?? r.order;
    const id = order[((cycle % order.length) + order.length) % order.length];
    const start = cycle * r.interval_min * 60;
    return { id, cycle, start, end: start + r.open_min * 60 };
  },

  /** Das gerade laufende Treffen (egal ob man dazugehört) oder null. */
  currentGathering() {
    if (!this.gatheringRules()) return null;
    const slot = this.gatheringSlot(this.marketCycle());
    return this.playTime < slot.end ? slot : null;
  },

  /** Ist das Treffen dieses Zirkels gerade offen? */
  gatheringOpen(id) {
    return this.gatheringsUnlocked() && this.currentGathering()?.id === id;
  },

  /** Das nächste Treffen eines Zirkels, dem man angehört (oder irgendeines, wenn `any`). */
  nextGathering({ any = false } = {}) {
    if (!this.gatheringRules()) return null;
    const mine = this.memberships();
    if (!any && !mine.length) return null;
    for (let c = this.marketCycle() + 1, i = 0; i < 50; c++, i++) {
      const slot = this.gatheringSlot(c);
      if (any || mine.includes(slot.id)) return slot;
    }
    return null;
  },

  /** Zustand für HUD und Journal: { open?, next?, text } oder null, solange es nichts zu zeigen gibt. */
  gatheringStatus() {
    if (!this.gatheringsUnlocked() || !this.memberships().length) return null;
    const cur = this.currentGathering();
    if (cur && this.isMember(cur.id)) {
      return { open: cur, text: `${this.gatheringDef(cur.id).name}: offen noch ${fmt(cur.end - this.playTime)}` };
    }
    const next = this.nextGathering();
    if (!next) return null;
    return { next, text: `${this.gatheringDef(next.id).name} in ${fmt(next.start - this.playTime)}` };
  },

  /** Läuft im Spiel-Tick mit: zählt die Zeit und meldet, wenn ein eigenes Treffen beginnt oder endet. */
  tickGatherings(dt) {
    this.playTime += dt;
    if (!this.gatheringRules() || !this.gatheringsUnlocked()) return;
    const cur = this.currentGathering();
    const key = cur ? cur.cycle : null;
    if (key === this.lastGatheringCycle) return;
    const prev = this.lastGatheringCycle;
    this.lastGatheringCycle = key;
    if (cur && this.isMember(cur.id)) {
      const g = this.gatheringDef(cur.id);
      this.emit('gathering', { id: cur.id, open: true, text: g.invite });
      this.emit('changed');
    } else if (!cur && prev !== null) {
      const slot = this.gatheringSlot(prev);
      if (this.isMember(slot.id)) {
        this.emit('gathering', { id: slot.id, open: false, text: `${this.gatheringDef(slot.id).name} hat sich aufgelöst.` });
        this.emit('changed');
      }
    }
  },

  /**
   * Angebot eines Händlers für die laufende Runde.
   * - `rare` (0..1): erscheint nur in manchen Runden (normaler Markt, z. B. Formeln ab Sequenz 7).
   * - Händler mit `gathering`: jedes Treffen würfelt sein Angebot aus dem Pool (`chance` je Eintrag).
   */
  merchantStock(merchantId) {
    const m = this.merchant(merchantId);
    const cycle = this.marketCycle();
    const roll = (e) => seeded(`${cycle}|${merchantId}|${e.item}`)();
    if (!m.gathering) return m.stock.filter((e) => e.rare === undefined || roll(e) < e.rare);
    const pool = m.stock.filter((e) => e.chance === undefined || roll(e) < e.chance);
    return pool.length ? pool : m.stock.slice(0, 1);
  },

  /** Sperren für Händler auf einem Treffen: nur offen, nur für Mitglieder, begrenzte Menge. */
  gatheringEntry(merchantId, e) {
    const m = this.merchant(merchantId);
    if (!m.gathering) return e;
    if (!this.gatheringOpen(m.gathering)) return { ...e, locked: e.locked ?? 'Das Treffen ist vorbei.' };
    if (!this.isMember(m.gathering)) return { ...e, locked: e.locked ?? 'Nur für Mitglieder.' };
    if (e.limit === undefined) return e;
    const bought = this.gatheringBought.cycle === this.marketCycle() ? this.gatheringBought.items[`${merchantId}:${e.item}`] ?? 0 : 0;
    return bought >= e.limit ? { ...e, owned: true, soldOut: true } : { ...e, left: e.limit - bought };
  },

  noteGatheringBuy(merchantId, itemId) {
    if (!this.merchant(merchantId)?.gathering) return;
    const cycle = this.marketCycle();
    if (this.gatheringBought.cycle !== cycle) this.gatheringBought = { cycle, items: {} };
    const key = `${merchantId}:${itemId}`;
    this.gatheringBought.items[key] = (this.gatheringBought.items[key] ?? 0) + 1;
  },

  serializeGatherings() {
    return { playTime: Math.round(this.playTime), gatheringBought: this.gatheringBought };
  },

  loadGatherings(data) {
    this.playTime = Math.max(0, data.playTime ?? 0);
    const b = data.gatheringBought;
    this.gatheringBought = b && typeof b.cycle === 'number' ? { cycle: b.cycle, items: { ...b.items } } : { cycle: -1, items: {} };
    // Ein beim Speichern laufendes Treffen nicht noch einmal ankündigen
    this.lastGatheringCycle = this.currentGathering()?.cycle ?? null;
  },
};
