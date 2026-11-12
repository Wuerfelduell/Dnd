import { MusicSynth } from './MusicSynth.js';
import { DAY_NIGHT_SECONDS, isNightAt } from './Clock.js';

/**
 * Paket Z: Hintergrundmusik aus Notendaten (MusicSynth). Wählt alle halbe Sekunde das passende Stück
 * aus der Zuordnung der Manifeste: Titel, Kampf (Boss je Kapitel, Okkultes, Standard), Geistsicht,
 * Karte (Tag/Nacht), Gefahrengebiet und zuletzt die Stadt. Startet erst nach der ersten Eingabe.
 */
export const MUSIC_MANIFESTS = ['basis', 'kettlegate', 'wexmoor', 'dunscar', 'k4k5', 'feste', 'rituale'].map((n) => `audio/manifest-musik-${n}.json`); // CL: Kapitel 4/5 und Feste; DS: Seq-4-Rituale

/** Stadtmusik, wenn eine Karte keine eigene Zuordnung hat. */
const CITY_MUSIC = {
  kettlegate: { tag: 'kettlegate_tag', nacht: 'kettlegate_nacht' },
  wexmoor: { tag: 'wexmoor_tag', nacht: 'wexmoor_nacht' },
  dunscar: { tag: 'ds_stadt_tag', nacht: 'ds_stadt_nacht' },
  calderwick: { tag: 'cw_terrassen_tag', nacht: 'cw_terrassen_nacht' },
  briarholt: { tag: 'bh_kalt', nacht: 'bh_kalt' },
};
/** CL: Kampfmusik je Stadt, wenn der Kampf kein eigenes Stück hat (Bosse stehen mit Namen in der Zuordnung). */
const CITY_COMBAT = { calderwick: 'calderwick', briarholt: 'briarholt' };
/** Festplätze (CK feste.json → karten): dort spielt am Festtag die Festmusik. */
export const FEST_MUSIC_MAPS = { laternennacht: ['altmarkt', 'docks'], salzsegen: ['wx_salzmarkt', 'wx_bojenhafen'], schichtwechsel: ['ds_kalkmarkt', 'ds_arbeiterbogen'] };
/** Tag- und Nachtfassung wechseln mit der Spieluhr (Clock.js). */
export { DAY_NIGHT_SECONDS };
/** Gegner, die keine Menschen sind, bekommen die okkulte Kampfmusik. */
const OCCULT = /geist|leiche|schatten|nebel|egel|ruf|nachhall|wurm|braut|engel|chor|hund|kraehe|motte|phantom/;

const variant = (entry, night) => (entry && typeof entry === 'object' ? entry[night ? 'nacht' : 'tag'] ?? entry.nacht ?? entry.tag : entry);

/**
 * Welches Stück passt gerade? `z` ist die zusammengeführte Zuordnung aller Manifeste.
 * ctx: { title, combat: { id, enc } | null, vision, map, city, zone, playTime, fest, season, stinger, mode }
 * `stinger` ist ein zeitlich begrenztes Ereignisstück (Sieg, Fall gelöst, Ende, Jahreszeit, Ankunft; MusicDirector.cue),
 * `mode` eine Lage, die eine Schleife aus `ereignisse` verlangt (horchen, treffen, streife), solange sie anhält.
 * `ritual` (DS) ein laufendes Seq-4-Ritual (laternennacht, schattenseite, traum): geht vor Karte, Geistsicht und Lage und
 * auch vor dem gewöhnlichen Kampf (Schattenkämpfe); Kämpfe mit eigenem Stück (Wächter, Traumgeflecht) behalten ihres.
 */
export function pickTrack(z, ctx) {
  if (ctx.title) return z.ereignisse?.titel ?? 'titel';
  if (ctx.stinger && (z.ereignisse?.[ctx.stinger] || ctx.stingerTrack)) return z.ereignisse?.[ctx.stinger] ?? ctx.stingerTrack; // auch ein Kartenstück (ds_ankunft) kann als Stinger dienen
  const night = isNightAt(ctx.playTime);
  if (ctx.combat) {
    const { id, enc } = ctx.combat;
    const k = z.kampf ?? {};
    // Kapitel 3 (AY): eigene Stücke für Gallowmere und die Unterschicht (auch ihre Folgeabschnitte) und die Pfadprüfungen
    const named = k[id] ?? k[/^k3o_(\w+?)_phase\d$/.exec(id)?.[1]] ?? k[/^(vg_\w+?)_phase\d$/.exec(id)?.[1]] ?? (id.startsWith('k3p_') ? k.pruefung : undefined);
    if (named) return named;
    if (ctx.ritual && z.ereignisse?.[ctx.ritual]) return z.ereignisse[ctx.ritual];
    // CL: Calderwick, Briarholt und die Landstraße haben eigene Kampfstücke
    const where = ctx.map === 'reise_landstrasse' ? 'landstrasse' : CITY_COMBAT[ctx.city];
    if (where && k[where]) return k[where];
    if (enc?.boss) return z.kampf?.[`boss_kapitel${enc.chapter ?? (ctx.city === 'wexmoor' ? 2 : 1)}`] ?? z.kampf?.boss_kapitel1 ?? 'kampf';
    if (k[`standard_kapitel${enc?.chapter}`]) return k[`standard_kapitel${enc.chapter}`];
    if (OCCULT.test(id)) return k.okkult ?? k.standard ?? 'kampf';
    return k.standard ?? 'kampf';
  }
  if (ctx.ritual && z.ereignisse?.[ctx.ritual]) return z.ereignisse[ctx.ritual];
  if (ctx.vision) return z.ereignisse?.geistsicht ?? 'geistsicht';
  if (ctx.mode && z.ereignisse?.[ctx.mode]) return z.ereignisse[ctx.mode];
  // CL: am Festtag spielt auf den Festplätzen die Festmusik; im Kettlegater Winter die Winterfassung des Tages
  if (ctx.fest && FEST_MUSIC_MAPS[ctx.fest]?.includes(ctx.map) && z.ereignisse?.[`fest_${ctx.fest}`]) return z.ereignisse[`fest_${ctx.fest}`];
  // CH: Briarholts warme Fassungen `<id>__warm` teilen die Zuordnung der kalten; wo dort das Kaltstück liegt, spielt das Warmstück
  const warm = !!ctx.map?.endsWith('__warm');
  const mapId = warm ? ctx.map.slice(0, -6) : ctx.map;
  const own = variant(z.maps?.[mapId], night) ?? variant(z.zonen?.[ctx.zone ?? mapId], night) ?? variant(CITY_MUSIC[ctx.city] ?? CITY_MUSIC.kettlegate, night);
  if (warm && own === z.ereignisse?.bh_zustand_kalt && z.ereignisse?.bh_zustand_warm) return z.ereignisse.bh_zustand_warm;
  if (own === 'kettlegate_tag' && ctx.season === 'winter' && z.ereignisse?.kettlegate_winter_tag) return z.ereignisse.kettlegate_winter_tag;
  return own;
}

export class MusicDirector {
  constructor({ audio, base = import.meta.env?.BASE_URL ?? './' } = {}) {
    this.audio = audio;
    this.base = base.endsWith('/') ? base : `${base}/`;
    this.synth = null;
    this.ready = null;
    this.current = null;
    this.failed = false;
    this.stinger = null; // { id, until } aus cue()
    this.now = () => (globalThis.performance?.now?.() ?? Date.now()) / 1000;
  }

  /**
   * Ereignisstück (Schlüssel aus `zuordnung.ereignisse`) für `seconds` Sekunden vor alles andere legen; ohne Angabe so lange,
   * wie das Stück dauert (Schleifen höchstens 60 s). Danach kehrt die laufende Lage zurück.
   */
  cue(id, seconds = null) {
    if (!id) return;
    const key = this.synth?.zuordnung?.ereignisse?.[id] ?? id;
    const data = this.synth?.tracks?.get(key);
    const dur = Number.isFinite(seconds) ? seconds : data ? (data.score?.loop ? 60 : Math.min(90, (data.duration ?? 20) + 1)) : 20;
    this.stinger = { id, track: data ? key : null, until: this.now() + dur };
    if (this.current === key) this.current = null; // dasselbe Stück noch einmal von vorn
  }

  /** Ereignisstück vorzeitig beenden (z. B. Abgleich abgeschlossen). */
  clearCue(id = null) {
    if (!this.stinger || (id && this.stinger.id !== id)) return;
    this.stinger = null;
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
    this.synth.spurFaktor = ctx.spuren ?? null; // DS: Laternenmusik dünnt mit jeder erloschenen Laterne aus
    if (this.stinger && this.now() >= this.stinger.until) this.stinger = null;
    const id = pickTrack(this.synth.zuordnung, this.stinger ? { ...ctx, stinger: this.stinger.id, stingerTrack: this.stinger.track } : ctx);
    if (!id || id === this.current || !this.synth.tracks.has(id)) return;
    this.current = id;
    this.synth.spiele(id, { blende: 1.5 }).catch((e) => console.warn('Musik', id, e));
  }

  pause() { this.synth?.pause(); }
  resume() { if (this.synth) this.synth.weiter().catch(() => {}); }
}
