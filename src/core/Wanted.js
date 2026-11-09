// Kapitel 2 (Wexmoor): Fahndung und Festnahme. Regeln in wexmoor.json → police.
// Die Grauspäher (world/Patrols.js) melden Sichtungen; hier steht nur die Spiellogik, damit Tests sie direkt prüfen.
// - Fahndungsstufe 0..max: jede Sichtung, der man entkommt, +1. Sinkt mit der Zeit und beim Schlafen im Unterschlupf.
// - Festnahme: Zelle im Wachhaus, ein Teil der Schillinge wird beschlagnahmt. Zunder holt dich zweimal umsonst raus, danach kostet es.

export const wantedMethods = {
  resetWanted() {
    this.wanted = 0;
    this.arrests = 0;
    this.wantedClock = 0;
  },

  policeRules() {
    return this.content.police ?? null;
  },

  /** Grauspäher-Gebiet: Karten mit `police: true` (die Viertel von Wexmoor). */
  isPoliced(mapId = this.map) {
    return !!this.content.maps[mapId]?.police;
  },

  /** Sichtkegel der Laterne bei der aktuellen Stufe: { range (px), angle (Grad), catchSec }. */
  policeCone(level = this.wanted, mapId = this.map) {
    const r = this.policeRules();
    const l = Math.min(level, r.max_level);
    // Verkleidung: im passenden Viertel kleinerer Kegel und mehr Zeit, anderswo fällt man eher auf
    const worn = this.disguise();
    const mod = !worn ? { range: 1, catch: 1 } : r.disguises[worn].maps.includes(mapId) ? r.disguise_fit : r.disguise_misfit;
    return {
      range: (r.cone.range + r.cone.range_per_level * l) * mod.range,
      angle: r.cone.angle + r.cone.angle_per_level * l,
      catchSec: Math.max(r.catch_min_sec, r.catch_sec - r.catch_per_level * l) * mod.catch,
    };
  },

  /** Getragene Verkleidung (Flag k2_wear_<id>, gesetzt am Kleiderhaken im Unterschlupf) oder null. */
  disguise() {
    const r = this.policeRules();
    return Object.keys(r?.disguises ?? {}).find((id) => this.flags.has(`k2_wear_${id}`) && this.itemCount(id) > 0) ?? null;
  },

  setWanted(level, reason = '') {
    const r = this.policeRules();
    const before = this.wanted;
    this.wanted = Math.max(0, Math.min(r.max_level, level));
    this.wantedClock = 0;
    if (this.wanted !== before) this.emit('wanted', { level: this.wanted, delta: this.wanted - before, reason });
    return this.wanted;
  },

  /** Einer Streife entkommen: die Stufe steigt. */
  escapedPatrol() {
    return this.setWanted(this.wanted + 1, 'Einer Streife entkommen');
  },

  /** Zeit verstreicht (nur ungestörte Spielzeit): alle decay_sec sinkt die Stufe um eins. */
  tickWanted(dt) {
    if (!this.content.police || this.wanted <= 0) return;
    this.wantedClock += dt;
    if (this.wantedClock >= this.policeRules().decay_sec) this.setWanted(this.wanted - 1, 'Die Wache sucht woanders');
  },

  /** In der Koje des Unterschlupfs geschlafen. */
  restWanted() {
    if (this.wanted > 0) this.setWanted(this.wanted - this.policeRules().rest_lowers, 'Untergetaucht');
  },

  /**
   * Festnahme. Ergebnis: { map, spawn, seized, text }. Setzt Flags für die Zelle:
   * k2_in_cell (bis man raus ist) und k2_bail_due (ab der dritten Festnahme kostet Zunders Hilfe).
   */
  arrest() {
    const r = this.policeRules();
    this.arrests += 1;
    const seized = Math.floor(this.money * r.seize_pct);
    if (seized > 0) this.addMoney(-seized, { reason: 'Beschlagnahmt' });
    this.flags.add('k2_in_cell');
    if (this.arrests > r.free_bails) this.flags.add('k2_bail_due');
    this.setWanted(Math.max(this.wanted, 1));
    this.emit('changed');
    return { map: r.cell.map, spawn: r.cell.spawn, seized, text: r.arrest_text };
  },

  serializeWanted() {
    return { wanted: this.wanted, arrests: this.arrests };
  },

  loadWanted(data) {
    this.wanted = Number.isFinite(data.wanted) ? data.wanted : 0;
    this.arrests = Number.isFinite(data.arrests) ? data.arrests : 0;
    this.wantedClock = 0;
  },
};
