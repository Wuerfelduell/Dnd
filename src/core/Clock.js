// Tag und Nacht (Kapitel 3, BC/BD): das Spiel hat keine eigene Uhr, Tag- und Nachtphase wechseln alle 15 Minuten
// Spielzeit (dieselbe Phase wie die Musik). Das flüchtige Flag `k3h_nacht` steht nachts in den Flags und wird
// weder gespeichert noch aus einem Spielstand übernommen; es folgt immer der Spielzeit.
export const DAY_NIGHT_SECONDS = 15 * 60;
export const NIGHT_FLAG = 'k3h_nacht';

export const isNightAt = (playTime) => Math.floor((playTime ?? 0) / DAY_NIGHT_SECONDS) % 2 === 1;

// Paket BV: Jahreszeiten und Feste. Eine Jahreszeit dauert zwei Tage (vier Phasen), das Jahr beginnt im Herbst.
// Flüchtige Flags `saison_<name>` und `fest_<id>` stehen wie das Nachtflag nur zur Laufzeit in den Flags.
export const SEASONS = ['herbst', 'winter', 'fruehling', 'sommer'];
export const SEASON_SECONDS = DAY_NIGHT_SECONDS * 4;
export const seasonAt = (playTime) => SEASONS[Math.floor((playTime ?? 0) / SEASON_SECONDS) % SEASONS.length];
/** Drei Feste: Laternennacht in Kettlegates Herbstnächten, Salzsegen an Wexmoors Frühlingstagen, Schichtwechsel an Dunscars Sommertagen. */
export const FESTE = {
  laternennacht: { city: 'kettlegate', season: 'herbst', night: true, name: 'Laternennacht', text: 'Kettlegate hängt Papierlaternen in die Gassen; Kerzenboote treiben den Kanal hinunter, und am Altmarkt steht eine Bühne. Für eine Nacht schauen die Leute nicht in den Nebel, sondern in die Lichter.' },
  salzsegen: { city: 'wexmoor', season: 'fruehling', night: false, name: 'Salzsegen', text: 'Wexmoor segnet das Salz: Kähne mit Kränzen ziehen vor dem Leuchtturm vorbei, auf dem Markt raucht der Fisch, und auf einem Thron aus Fässern sitzt die Salzkönigin.' },
  schichtwechsel: { city: 'dunscar', season: 'sommer', night: false, name: 'Schichtwechsel', text: 'Dunscar feiert den Schichtwechsel: Blech bläst auf der Drehscheibe, Lohntüten wechseln die Hände, ein Boxring aus Seilen steht im Kalkstaub, und niemand fragt nach der Uhr.' },
};
export const festAt = (playTime, city) => Object.entries(FESTE).find(([, f]) => f.city === city && f.season === seasonAt(playTime) && f.night === isNightAt(playTime))?.[0] ?? null;
export const VOLATILE_FLAGS = (f) => f === NIGHT_FLAG || f.startsWith('saison_') || f.startsWith('fest_aktiv_');

export const clockMethods = {
  isNight() {
    return isNightAt(this.playTime);
  },

  season() {
    return seasonAt(this.playTime);
  },

  /** Fest, das gerade in einer Stadt gefeiert wird (Id oder null). */
  festAktiv(city) {
    return festAt(this.playTime, city);
  },

  /** Nachtflag an die Spielzeit angleichen; meldet true, wenn sich die Phase geändert hat. */
  syncClock() {
    const night = this.isNight();
    this.syncSeason();
    if (night === this.flags.has(NIGHT_FLAG)) return false;
    if (night) this.flags.add(NIGHT_FLAG); else this.flags.delete(NIGHT_FLAG);
    this.emit('clock', { night });
    return true;
  },

  /** Paket BV: Jahreszeit- und Festflags nachziehen (für Zeitung, Gerede und Bedingungen). */
  syncSeason() {
    const season = this.season();
    const want = new Set([`saison_${season}`, ...Object.entries(FESTE).filter(([id]) => festAt(this.playTime, FESTE[id].city) === id).map(([id]) => `fest_aktiv_${id}`)]);
    let changed = false;
    for (const f of [...this.flags]) if ((f.startsWith('saison_') || f.startsWith('fest_aktiv_')) && !want.has(f)) { this.flags.delete(f); changed = true; }
    for (const f of want) if (!this.flags.has(f)) { this.flags.add(f); changed = true; }
    if (changed) this.emit('season', { season });
    return changed;
  },
};
