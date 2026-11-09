// Kapitel 3 (AS/AR): Pfiffs Signalgerät mit Rufladungen (Vertrag: docs/story/k3_orte/rufmechanik.md).
// Ein Ruf an einer Station kostet genau eine Ladung, jede Station hat eine einmalige Notladung, Pfiff füllt im
// Speisewagen kostenlos auf drei auf. Horchen, Journal und Deduktionen bleiben kostenlos. Ohne Ladung bleibt jeder
// Ausgang erreichbar: Notladung oder Rückweg zu Pfiff. Noch offen: Linienprojektion, Hörreichweite, private Bindung.

export const SIGNAL_DEVICE = 'k3a_signalgeraet';
export const SIGNAL_MAX = 3;

export const signalMethods = {
  resetSignal() {
    this.signal = { charges: SIGNAL_MAX, reserveUsed: [] }; // der erste Erhalt des Geräts beginnt voll
  },

  hasSignalDevice() {
    return this.itemCount(SIGNAL_DEVICE) > 0;
  },

  /** Dialogbedingungen: requires_signal_charge, requires_signal_empty, requires_signal_reserve: Stations-ID. */
  meetsSignal(o) {
    const device = this.hasSignalDevice();
    if (o.requires_signal_charge && !(device && this.signal.charges > 0)) return false;
    if (o.requires_signal_empty && !(device && this.signal.charges === 0)) return false;
    if (o.requires_signal_reserve !== undefined) {
      if (!device || this.signal.charges >= SIGNAL_MAX || this.signal.reserveUsed.includes(o.requires_signal_reserve)) return false;
    }
    return true;
  },

  /** Effekte: signal 'call' (eine Ladung), 'fill' (Pfiff, auf drei), signal_reserve: Stations-ID (+1, einmalig). */
  applySignal(e) {
    const before = this.signal.charges;
    if (e.signal === 'call') this.signal.charges = Math.max(0, before - 1);
    if (e.signal === 'fill') this.signal.charges = SIGNAL_MAX;
    const st = e.signal_reserve;
    if (st && before < SIGNAL_MAX && !this.signal.reserveUsed.includes(st)) {
      this.signal.reserveUsed.push(st);
      this.signal.charges = Math.min(SIGNAL_MAX, this.signal.charges + 1);
    }
    if (this.signal.charges !== before) this.emit('signal', { charges: this.signal.charges, delta: this.signal.charges - before });
  },

  serializeSignal() {
    return { signal: { charges: this.signal.charges, reserveUsed: [...this.signal.reserveUsed] } };
  },

  loadSignal(data) {
    const s = data.signal ?? {};
    const n = Number.isInteger(s.charges) ? s.charges : SIGNAL_MAX;
    this.signal = { charges: Math.max(0, Math.min(SIGNAL_MAX, n)), reserveUsed: [...new Set(s.reserveUsed ?? [])] };
  },
};
