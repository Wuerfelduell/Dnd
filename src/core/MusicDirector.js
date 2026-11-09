import { MusicSynth } from './MusicSynth.js';

/**
 * Paket Z: Hintergrundmusik aus Notendaten (MusicSynth). Wählt alle halbe Sekunde das passende Stück
 * aus der Zuordnung der Manifeste: Titel, Kampf (Boss je Kapitel, Okkultes, Standard), Geistsicht,
 * Karte (Tag/Nacht), Gefahrengebiet und zuletzt die Stadt. Startet erst nach der ersten Eingabe.
 */
export const MUSIC_MANIFESTS = ['basis', 'kettlegate', 'wexmoor'].map((n) => `audio/manifest-musik-${n}.json`);

/** Stadtmusik, wenn eine Karte keine eigene Zuordnung hat (Dunscar bis zu seinem eigenen Paket). */
const CITY_MUSIC = {
  kettlegate: { tag: 'kettlegate_tag', nacht: 'kettlegate_nacht' },
  wexmoor: { tag: 'wexmoor_tag', nacht: 'wexmoor_nacht' },
  dunscar: { tag: 'ermittlung', nacht: 'ermittlung' },
};
/** Tag- und Nachtfassung wechseln alle 15 Minuten Spielzeit (das Spiel hat keine eigene Uhr). */
export const DAY_NIGHT_SECONDS = 15 * 60;
/** Gegner, die keine Menschen sind, bekommen die okkulte Kampfmusik. */
const OCCULT = /geist|leiche|schatten|nebel|egel|ruf|nachhall|wurm|braut|engel|chor|hund|kraehe|motte|phantom/;

const variant = (entry, night) => (entry && typeof entry === 'object' ? entry[night ? 'nacht' : 'tag'] ?? entry.nacht ?? entry.tag : entry);

/**
 * Welches Stück passt gerade? `z` ist die zusammengeführte Zuordnung aller Manifeste.
 * ctx: { title, combat: { id, enc } | null, vision, map, city, zone, playTime }
 */
export function pickTrack(z, ctx) {
  if (ctx.title) return z.ereignisse?.titel ?? 'titel';
  const night = Math.floor((ctx.playTime ?? 0) / DAY_NIGHT_SECONDS) % 2 === 1;
  if (ctx.combat) {
    const { id, enc } = ctx.combat;
    if (enc?.boss) return z.kampf?.[`boss_kapitel${enc.chapter ?? (ctx.city === 'wexmoor' ? 2 : 1)}`] ?? z.kampf?.boss_kapitel1 ?? 'kampf';
    if (OCCULT.test(id)) return z.kampf?.okkult ?? z.kampf?.standard ?? 'kampf';
    return z.kampf?.standard ?? 'kampf';
  }
  if (ctx.vision) return z.ereignisse?.geistsicht ?? 'geistsicht';
  const own = variant(z.maps?.[ctx.map], night) ?? variant(z.zonen?.[ctx.zone ?? ctx.map], night);
  if (own) return own;
  return variant(CITY_MUSIC[ctx.city] ?? CITY_MUSIC.kettlegate, night);
}

export class MusicDirector {
  constructor({ audio, base = import.meta.env?.BASE_URL ?? './' } = {}) {
    this.audio = audio;
    this.base = base.endsWith('/') ? base : `${base}/`;
    this.synth = null;
    this.ready = null;
    this.current = null;
    this.failed = false;
  }

  /** Nach der ersten Eingabe (Browser verlangen eine Geste für Web Audio). */
  start() {
    if (this.ready || this.failed) return this.ready;
    try {
      this.synth = new MusicSynth();
      this.applyVolume();
      this.ready = Promise.all(MUSIC_MANIFESTS.map((m) => this.synth.ladeManifest(`${this.base}${m}`))).catch((e) => {
        this.failed = true;
        console.warn('Musik nicht verfügbar', e);
      });
    } catch (e) {
      this.failed = true;
      console.warn('Musik nicht verfügbar', e);
    }
    return this.ready;
  }

  applyVolume() {
    if (!this.synth) return;
    const l = this.audio?.levels ?? { master: 0.8, musik: 0.65 };
    // Die Notenmusik ist leise gemischt; 1,5-fach ergibt bei Standardpegeln etwa die Lautstärke der Effekte
    this.synth.lautstaerke = Math.max(0, Math.min(1, l.master * l.musik * 1.5));
  }

  /** Wechselt das Stück, wenn sich die Lage geändert hat. */
  update(ctx) {
    if (!this.synth || this.failed || !this.synth.zuordnung || !this.synth.tracks.size) return;
    const id = pickTrack(this.synth.zuordnung, ctx);
    if (!id || id === this.current || !this.synth.tracks.has(id)) return;
    this.current = id;
    this.synth.spiele(id, { blende: 1.5 }).catch((e) => console.warn('Musik', id, e));
  }

  pause() { this.synth?.pause(); }
  resume() { if (this.synth) this.synth.weiter().catch(() => {}); }
}
