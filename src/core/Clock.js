// Tag und Nacht (Kapitel 3, BC/BD): das Spiel hat keine eigene Uhr, Tag- und Nachtphase wechseln alle 15 Minuten
// Spielzeit (dieselbe Phase wie die Musik). Das flüchtige Flag `k3h_nacht` steht nachts in den Flags und wird
// weder gespeichert noch aus einem Spielstand übernommen; es folgt immer der Spielzeit.
export const DAY_NIGHT_SECONDS = 15 * 60;
export const NIGHT_FLAG = 'k3h_nacht';

export const isNightAt = (playTime) => Math.floor((playTime ?? 0) / DAY_NIGHT_SECONDS) % 2 === 1;

// Paket BV/CK: Jahreszeiten und Feste. Ein Spieltag hat Tag und Nacht (30 Minuten), eine Jahreszeit sechs Spieltage,
// das Jahr beginnt im Herbst. Am vierten Tag jeder Jahreszeit feiert eine Stadt (den ganzen Tag); an Tag 2 und 3
// kündigt sich das Fest an, an Tag 5 und 6 wird nachgelesen. Am vierten Wintertag ruht überall der Handel (Stiller Abend).
// Flüchtige Flags (`saison_<name>`, `fs_<name>`, `fest_aktiv_<id>`, `fs_fest_<id>_aktiv`, `fs_<id>_ankuendigung|nachlese`,
// `fs_stiller_abend_aktiv`) stehen wie das Nachtflag nur zur Laufzeit in den Flags.
export const SEASONS = ['herbst', 'winter', 'fruehling', 'sommer'];
export const DAY_SECONDS = DAY_NIGHT_SECONDS * 2;
export const SEASON_DAYS = 6;
export const SEASON_SECONDS = DAY_SECONDS * SEASON_DAYS;
export const FEST_DAY = 4;
export const seasonAt = (playTime) => SEASONS[Math.floor((playTime ?? 0) / SEASON_SECONDS) % SEASONS.length];
/** Tag innerhalb der Jahreszeit, 1 bis 6. */
export const seasonDayAt = (playTime) => (Math.floor((playTime ?? 0) / DAY_SECONDS) % SEASON_DAYS) + 1;
/** Drei Feste: Laternennacht in Kettlegates Herbst, Salzsegen in Wexmoors Frühling, Schichtwechsel in Dunscars Sommer. */
export const FESTE = {
  laternennacht: { city: 'kettlegate', season: 'herbst', night: true, name: 'Laternennacht', text: 'Kettlegate hängt Papierlaternen in die Gassen; Kerzenboote treiben den Kanal hinunter, und am Altmarkt steht eine Bühne. Für eine Nacht schauen die Leute nicht in den Nebel, sondern in die Lichter.' },
  salzsegen: { city: 'wexmoor', season: 'fruehling', night: false, name: 'Salzsegen', text: 'Wexmoor segnet das Salz: Kähne mit Kränzen ziehen vor dem Leuchtturm vorbei, auf dem Markt raucht der Fisch, und auf einem Thron aus Fässern sitzt die Salzkönigin.' },
  schichtwechsel: { city: 'dunscar', season: 'sommer', night: false, name: 'Schichtwechsel', text: 'Dunscar feiert den Schichtwechsel: Blech bläst auf der Drehscheibe, Lohntüten wechseln die Hände, ein Boxring aus Seilen steht im Kalkstaub, und niemand fragt nach der Uhr.' },
};
/** Fest einer Stadt am Festtag ihrer Jahreszeit (den ganzen Tag), sonst null. */
export const festAt = (playTime, city) => (seasonDayAt(playTime) === FEST_DAY
  ? Object.entries(FESTE).find(([, f]) => f.city === city && f.season === seasonAt(playTime))?.[0] ?? null : null);
/** Stiller Abend: vierter Wintertag, in allen Städten. */
export const isStillerAbendAt = (playTime) => seasonAt(playTime) === 'winter' && seasonDayAt(playTime) === FEST_DAY;
const FS_SEASON = new Set(SEASONS.map((s) => `fs_${s}`));
export const VOLATILE_FLAGS = (f) => f === NIGHT_FLAG || f.startsWith('saison_') || f.startsWith('fest_aktiv_') || FS_SEASON.has(f)
  || /^fs_fest_\w+_aktiv$/.test(f) || /^fs_\w+_(ankuendigung|nachlese)$/.test(f) || f === 'fs_stiller_abend_aktiv';
/** Einmal je Jahreszeit nutzbare Wirkungen (CK wirkungen.json) werden mit der neuen Jahreszeit wieder frei. */
const SEASON_USE = /^fs_\w+_wirkung_\d+_genutzt$/;
const SEASON_MARK = 'fs_saison_stand_';

/** Alle Flags, die zur Spielzeit gehören. */
export function clockFlagsAt(playTime) {
  const season = seasonAt(playTime);
  const day = seasonDayAt(playTime);
  const want = new Set([`saison_${season}`, `fs_${season}`]);
  for (const [id, f] of Object.entries(FESTE)) {
    if (festAt(playTime, f.city) === id) { want.add(`fest_aktiv_${id}`); want.add(`fs_fest_${id}_aktiv`); }
    if (f.season !== season) continue;
    if (day < FEST_DAY) want.add(`fs_${id}_ankuendigung`);
    if (day > FEST_DAY) want.add(`fs_${id}_nachlese`);
  }
  if (isStillerAbendAt(playTime)) want.add('fs_stiller_abend_aktiv');
  return want;
}

export const clockMethods = {
  isNight() {
    return isNightAt(this.playTime);
  },

  season() {
    return seasonAt(this.playTime);
  },

  /** Tag der Jahreszeit (1 bis 6). */
  seasonDay() {
    return seasonDayAt(this.playTime);
  },

  /** Fest, das gerade in einer Stadt gefeiert wird (Id oder null). */
  festAktiv(city) {
    return festAt(this.playTime, city);
  },

  /** Stiller Abend: Läden geschlossen, Türen zu Zeugen und Fällen offen. */
  stillerAbend() {
    return isStillerAbendAt(this.playTime);
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

  /** Paket BV/CK: Jahreszeit- und Festflags nachziehen (für Zeitung, Gerede und Bedingungen). */
  syncSeason() {
    const season = this.season();
    const want = clockFlagsAt(this.playTime);
    let changed = false;
    for (const f of [...this.flags]) if (VOLATILE_FLAGS(f) && f !== NIGHT_FLAG && !want.has(f)) { this.flags.delete(f); changed = true; }
    for (const f of want) if (!this.flags.has(f)) { this.flags.add(f); changed = true; }
    // Die Saison-Marke bleibt im Spielstand: wechselt die Jahreszeit (auch zwischen Speichern und Laden), sind die Saisonwirkungen wieder frei
    const mark = `${SEASON_MARK}${season}`;
    if (!this.flags.has(mark)) {
      for (const f of [...this.flags]) if (f.startsWith(SEASON_MARK) || SEASON_USE.test(f)) this.flags.delete(f);
      this.flags.add(mark);
      changed = true;
    }
    if (changed) this.emit('season', { season, day: this.seasonDay() });
    return changed;
  },
};
