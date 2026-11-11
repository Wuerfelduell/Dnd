// Kapitel 2 (Wexmoor): Fahndung und Festnahme. Regeln in wexmoor.json → police.
// Kapitel-1-Finale: Nach Fall 9 gelten auch in Kettlegate Regeln (packs/k1_finale/police.json), Price lässt nach dir suchen.
// content.polices hält die Regeln je Stadt; `active_if` schaltet sie erst mit einem Flag frei.
// Die Grauspäher (world/Patrols.js) melden Sichtungen; hier steht nur die Spiellogik, damit Tests sie direkt prüfen.
// - Fahndungsstufe 0..max: jede Sichtung, der man entkommt, +1. Sinkt mit der Zeit und beim Schlafen im Unterschlupf.
// - Festnahme: Zelle im Wachhaus, ein Teil der Schillinge wird beschlagnahmt. Zunder holt dich zweimal umsonst raus, danach kostet es.
// - Widerstand (Regel `resist`, Wexmoor): Wer gestellt wird, darf kämpfen (Gespräch `resist_dialogue`). Die Grauspäher sind
//   Beyonder mit min_seq 4: unter Sequenz 4 verliert man den Kampf auch zu zweit und landet mit doppelter Beschlagnahme in der Zelle.

export const wantedMethods = {
  resetWanted() {
    this.wanted = 0;
    this.arrests = 0;
    this.wantedClock = 0;
  },

  /** Fahndungsregeln der Stadt, in der die Karte liegt; sonst die allgemeinen (Wexmoor), damit Stufe und Festnahme überall rechnen. */
  policeRules(mapId = this.map) {
    return this.cityPolice(mapId) ?? this.content.police ?? null;
  },

  /** Wird auf dieser Karte gerade nach dir gesucht? Regeln der Stadt, sofern ihr `active_if` erfüllt ist (null: hier nicht). */
  cityPolice(mapId = this.map) {
    const city = this.content.maps[mapId]?.city ?? 'kettlegate';
    const r = this.content.polices?.[city] ?? null;
    if (!r) return null;
    if (r.active_if && !this.meets(r.active_if)) return null;
    return r;
  },

  /** Grauspäher-Gebiet: Karten mit `police: true` (die Viertel von Wexmoor). */
  isPoliced(mapId = this.map) {
    return !!this.content.maps[mapId]?.police;
  },

  /** Sichtkegel der Laterne bei der aktuellen Stufe: { range (px), angle (Grad), catchSec }. */
  policeCone(level = this.wanted, mapId = this.map) {
    const r = this.policeRules(mapId);
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
    const r = this.policeRules() ?? this.content.police;
    if (!r) return this.wanted;
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
    const r = this.policeRules();
    if (!r || this.wanted <= 0 || this.clockStopped?.()) return;
    this.wantedClock += dt;
    if (this.wantedClock >= r.decay_sec) this.setWanted(this.wanted - 1, 'Die Wache sucht woanders');
  },

  /** In der Koje des Unterschlupfs geschlafen. */
  restWanted() {
    const r = this.policeRules();
    if (r && this.wanted > 0) this.setWanted(this.wanted - r.rest_lowers, 'Untergetaucht');
  },

  /**
   * Festnahme. Ergebnis: { map, spawn, seized, text }. Setzt Flags für die Zelle (Regel `cell_flag`, Wexmoor:
   * k2_in_cell bis man raus ist) und `bail_flag` (k2_bail_due: ab der dritten Festnahme kostet Zunders Hilfe).
   * Kettlegate hat keine Zelle: Marlowe schmuggelt dich nachts hinaus, du wachst am Nachtmarkt auf.
   * `seize_mult`: Wer sich der Streife widersetzt hat und verliert, dem wird entsprechend mehr abgenommen.
   */
  arrest({ seize_mult = 1 } = {}) {
    const r = this.policeRules();
    this.arrests += 1;
    const seized = Math.floor(this.money * Math.min(1, r.seize_pct * seize_mult));
    if (seized > 0) this.addMoney(-seized, { reason: 'Beschlagnahmt' });
    const cellFlag = r.cell_flag === undefined ? 'k2_in_cell' : r.cell_flag;
    const bailFlag = r.bail_flag === undefined ? 'k2_bail_due' : r.bail_flag;
    if (cellFlag) this.flags.add(cellFlag);
    if (bailFlag && this.arrests > r.free_bails) this.flags.add(bailFlag);
    if (r.on_arrest) this.applyEffects(r.on_arrest);
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
