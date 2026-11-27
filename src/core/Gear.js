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

// --- Ausrüstungs-Sets (Seb 2026-11-27) ---------------------------------------------
// Zwei gespeicherte Zusammenstellungen aus Waffe, Hut, Mantel und Amulett, z. B. ein Kampf-Set
// und ein Trage-Set (Kleidung mit Tragkraft, Handel). Taste R (Spieler 2: Ziffernblock +,
// Gamepad Select) wechselt zum jeweils anderen gespeicherten Set. Jeder Spieler hat eigene Sets.

export const GEAR_SET_NAMES = ['Kampf', 'Tragen'];
const SET_PARTS = ['weapon', ...GEAR_SLOTS];

export function emptyGearSets() {
  return { sets: GEAR_SET_NAMES.map(() => null), active: -1 };
}

Object.assign(gearMethods, {
  /** Gespeicherte Sets übernehmen: nur bekannte Waffen und Kleidung am richtigen Platz. */
  cleanGearSets(raw) {
    const out = emptyGearSets();
    GEAR_SET_NAMES.forEach((_, i) => {
      const s = raw?.sets?.[i];
      if (!s || typeof s !== 'object') return;
      const set = {};
      set.weapon = this.item(s.weapon)?.kind === 'weapon' ? s.weapon : null;
      for (const slot of GEAR_SLOTS) set[slot] = this.item(s[slot])?.kind === 'gear' && this.item(s[slot]).slot === slot ? s[slot] : null;
      out.sets[i] = set;
    });
    const a = Number(raw?.active);
    out.active = Number.isInteger(a) && out.sets[a] ? a : -1;
    return out;
  },

  gearSetList() {
    if (!this.gearSets?.sets) this.gearSets = emptyGearSets();
    return this.gearSets.sets;
  },

  /** Was gerade angelegt ist, als Set merken. */
  saveGearSet(i) {
    if (!GEAR_SET_NAMES[i]) return { ok: false, text: '' };
    const set = { weapon: this.weapon ?? null };
    for (const slot of GEAR_SLOTS) set[slot] = this.gear?.[slot] ?? null;
    const sets = [...this.gearSetList()];
    sets[i] = set;
    this.gearSets = { sets, active: i };
    this.emit('changed');
    return { ok: true, text: `Set „${GEAR_SET_NAMES[i]}“ gespeichert.` };
  },

  /** Ist das Set gerade vollständig angelegt? */
  gearSetWorn(i) {
    const set = this.gearSetList()[i];
    if (!set) return false;
    if (set.weapon && set.weapon !== this.weapon) return false;
    return GEAR_SLOTS.every((slot) => (set[slot] ?? null) === (this.gear?.[slot] ?? null));
  },

  /** Set anlegen. Was fehlt (verkauft, eingelagert, abgegeben), bleibt wie es ist und wird genannt. */
  applyGearSet(i) {
    const name = GEAR_SET_NAMES[i];
    const set = this.gearSetList()[i];
    if (!set) return { ok: false, text: `Set „${name}“ ist noch leer. Leg die Sachen an und speichere es im Inventar.` };
    const missing = [];
    if (set.weapon && set.weapon !== this.weapon) {
      if (this.itemCount(set.weapon) > 0) this.weapon = set.weapon;
      else missing.push(this.item(set.weapon)?.name ?? set.weapon);
    }
    const gear = { ...this.gear };
    for (const slot of GEAR_SLOTS) {
      const id = set[slot];
      if (!id) gear[slot] = null;
      else if (this.itemCount(id) > 0) gear[slot] = id;
      else missing.push(this.item(id)?.name ?? id);
    }
    this.gear = gear;
    this.gearSets = { sets: this.gearSetList(), active: i };
    this.refreshGearStats();
    this.emit('changed');
    return { ok: true, missing, text: `Set „${name}“ angelegt.${missing.length ? ` Fehlt: ${missing.join(', ')}.` : ''}` };
  },

  /** Taste R: zum nächsten gespeicherten Set wechseln. */
  cycleGearSet() {
    const sets = this.gearSetList();
    const saved = sets.map((s, i) => (s ? i : -1)).filter((i) => i >= 0);
    if (!saved.length) return { ok: false, text: 'Noch kein Ausrüstungs-Set gespeichert. Im Inventar unter der Figur speichern.' };
    const cur = this.gearSets.active;
    const next = saved.find((i) => i > cur) ?? saved[0];
    return this.applyGearSet(next);
  },
});
