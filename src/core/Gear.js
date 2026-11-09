// Ausrüstung: Hut, Mantel und Amulett neben der Waffe.
//
// Kleidung und Schmuck (kind "gear", Feld "slot") wirken nur, solange sie angelegt sind.
// Ihre Vorteile ("boons", dasselbe Format wie bei Artefakten) zählen in passive() mit.
// Jeder Spieler hat eigene Plätze (this.gear ist ein persönlicher Wert, siehe Party.js).

/** Plätze in der Reihenfolge der Anzeige. */
export const GEAR_SLOTS = ['hut', 'mantel', 'amulett'];
export const GEAR_SLOT_NAMES = { hut: 'Kopf', mantel: 'Mantel', amulett: 'Amulett', waffe: 'Waffe' };

export const gearMethods = {
  /** Was gerade an den Plätzen hängt (nur Dinge, die noch im Inventar sind). */
  equippedGear() {
    return GEAR_SLOTS.map((slot) => this.gear?.[slot]).filter((id) => id && this.itemCount(id) > 0);
  },

  /** Vorteile der angelegten Kleidung als Listen für passive(). */
  gearEffects() {
    return this.equippedGear().map((id) => this.item(id)?.boons ?? []);
  },

  isWorn(id) {
    const it = this.item(id);
    return it?.kind === 'gear' && this.gear?.[it.slot] === id && this.itemCount(id) > 0;
  },

  /** Kleidung anlegen; was vorher an dem Platz hing, bleibt im Inventar. */
  wear(id) {
    const it = this.item(id);
    if (it?.kind !== 'gear' || !GEAR_SLOTS.includes(it.slot) || !this.itemCount(id)) return false;
    this.gear = { ...this.gear, [it.slot]: id };
    this.refreshGearStats();
    this.emit('changed');
    return true;
  },

  /** Platz leeren. */
  takeOff(slot) {
    if (!this.gear?.[slot]) return false;
    this.gear = { ...this.gear, [slot]: null };
    this.refreshGearStats();
    this.emit('changed');
    return true;
  },

  /** Höchstwerte neu rechnen. Anders als beim Aufstieg heilt das nicht (sonst heilt An- und Ablegen). */
  refreshGearStats() {
    this.maxHp = this.calcMaxHp();
    this.hp = Math.max(1, Math.min(this.hp, this.maxHp));
    this.emit('hp', { value: this.hp, delta: 0 });
    this.composure = Math.min(this.composure, this.maxComposure());
  },

  /** Beim Aufheben: leere Plätze füllen sich von selbst. */
  gearPickedUp(id) {
    const it = this.item(id);
    if (it?.kind === 'gear' && !this.gear?.[it.slot]) this.wear(id);
  },

  /** Beim Abgeben oder Verkaufen des letzten Stücks: Platz wird frei. */
  gearDropped(id) {
    const it = this.item(id);
    if (it?.kind === 'gear' && this.gear?.[it.slot] === id && !this.itemCount(id)) this.takeOff(it.slot);
  },

  /** Gespeicherte Plätze übernehmen (nur noch vorhandene Kleidung am richtigen Platz). */
  cleanGear(gear, inventory) {
    const out = {};
    for (const slot of GEAR_SLOTS) {
      const id = gear?.[slot];
      out[slot] = id && inventory?.[id] > 0 && this.item(id)?.slot === slot ? id : null;
    }
    return out;
  },
};
