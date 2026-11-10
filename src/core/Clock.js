// Tag und Nacht (Kapitel 3, BC/BD): das Spiel hat keine eigene Uhr, Tag- und Nachtphase wechseln alle 15 Minuten
// Spielzeit (dieselbe Phase wie die Musik). Das flüchtige Flag `k3h_nacht` steht nachts in den Flags und wird
// weder gespeichert noch aus einem Spielstand übernommen; es folgt immer der Spielzeit.
export const DAY_NIGHT_SECONDS = 15 * 60;
export const NIGHT_FLAG = 'k3h_nacht';

export const isNightAt = (playTime) => Math.floor((playTime ?? 0) / DAY_NIGHT_SECONDS) % 2 === 1;

export const clockMethods = {
  isNight() {
    return isNightAt(this.playTime);
  },

  /** Nachtflag an die Spielzeit angleichen; meldet true, wenn sich die Phase geändert hat. */
  syncClock() {
    const night = this.isNight();
    if (night === this.flags.has(NIGHT_FLAG)) return false;
    if (night) this.flags.add(NIGHT_FLAG); else this.flags.delete(NIGHT_FLAG);
    this.emit('clock', { night });
    return true;
  },
};
