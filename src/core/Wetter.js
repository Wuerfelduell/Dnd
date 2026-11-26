// Tag-Nacht- und Wetterzyklus (Seb 2026-11-26, aus dem Brainstorming):
//  1. Wetter je Stadt und Tageshälfte (15 Minuten Spielzeit), passend zu Stadt und Jahreszeit: klar, Regen, Sturm, Frost, Nebel.
//     Schlafen nur noch einmal je Nacht; tagsüber höchstens ein Nickerchen (halbe Heilung) alle 15 Minuten. Das Bett ist nicht mehr spammbar.
//  2. Das Wetter wirkt im Kampf (nur draußen, nie in Übungen und Ritualen): Regen schwächt Brand und Gift, Sturm stärkt das Moor,
//     Frost verlangsamt alle, Nebel hilft Maske und Echo. Angezeigt im HUD und zu Beginn jedes Kampfes.
//  3. Nebelnächte: selten (etwa jede sechste Nacht, nie die erste) liegt dichter Nebel über der Stadt. Gegner +30 % Leben und Schaden,
//     doppelte Beutechance, mehr Geld, und auf dem Markt steht die Nebelkrämerin mit Hauptzutaten, die es sonst nur als Beute gibt.
//  4. Träume: beim Schlafen in der Nacht höchstens ein Traum. Hinweis zum laufenden Fall oder ein Wesen, das sich für den Pfad
//     interessiert. Es schenkt Traumklarheit (Schaden +), wird aber mit höherer Sequenz gefährlicher (Unruhe, Leben).
// Alles hängt nur an der Spielzeit (deterministisch), gespeichert werden nur der letzte Schlaf und die letzte Traumnacht.
import { DAY_NIGHT_SECONDS, seasonAt, isNightAt } from './Clock.js';
import { isOutdoorMap } from '../world/assets.js';

export const SEASON_NAMES = { herbst: 'Herbst', winter: 'Winter', fruehling: 'Frühling', sommer: 'Sommer' };
/** Uhrzeit eines Spieltags: der Tag läuft von 6 bis 18 Uhr, die Nacht von 18 bis 6 Uhr (je 15 Minuten Spielzeit). Minuten in Zehnerschritten. */
export function uhrzeitAt(playTime) {
  const t = ((playTime ?? 0) % (2 * DAY_NIGHT_SECONDS) + 2 * DAY_NIGHT_SECONDS) % (2 * DAY_NIGHT_SECONDS);
  const min = Math.floor((6 * 60 + (t / (2 * DAY_NIGHT_SECONDS)) * 24 * 60) / 10) * 10 % (24 * 60);
  return { h: Math.floor(min / 60), m: min % 60 };
}

export const WETTER_ARTEN = ['klar', 'regen', 'sturm', 'frost', 'nebel'];
/**
 * Kampfwirkung je Wetter. path: Fertigkeitsschaden je Pfad; burn: Brand und Gift; foe_dmg: Gegnerschaden;
 * slow: gegnerische Angriffe gedehnt (Ringe langsamer); ap: Konzentration zu Beginn.
 */
export const WETTER = {
  klar: { name: 'Klar', icon: '☀', wirkung: 'Keine Wirkung auf den Kampf.' }, // neutral (auch der allererste halbe Spieltag)
  regen: { name: 'Regen', icon: '☂', burn: 0.6, path: { kessel: 0.85, sq_moor: 1.15 }, wirkung: 'Brand und Gift −40 %, Kessel −15 %, Moor +15 % Fertigkeitsschaden.' },
  sturm: { name: 'Sturm', icon: '⚡', foe_dmg: 1.1, path: { sq_moor: 1.25, echo: 0.85 }, wirkung: 'Moor +25 %, Echo −15 % Fertigkeitsschaden, Gegner schlagen 10 % härter zu.' },
  frost: { name: 'Frost', icon: '❄', slow: 1.15, ap: -1, wirkung: 'Alles wird langsamer: gegnerische Angriffe kommen gedehnt, du beginnst mit 1 Konzentration weniger.' },
  nebel: { name: 'Nebel', icon: '≋', path: { maske: 1.15, echo: 1.15, laterne: 0.9 }, wirkung: 'Maske und Echo +15 %, Laterne −10 % Fertigkeitsschaden.' },
};
/** Nebelnacht: Gegner zäher und härter, Beute reicher. */
export const NEBELNACHT = { hp: 1.3, dmg: 1.3, luck: 2, money: 1.5, wirkung: 'Nebelnacht: Gegner +30 % Leben und Schaden, doppelte Beutechance, mehr Geld.' };
export const NEBELNACHT_FLAG = 'nebelnacht';
/** Etwa jede sechste Nacht; die ersten zwei Spieltage bleiben ruhig. */
export const NEBELNACHT_TAKT = 6;
const NEBELNACHT_AB = 4; // erste mögliche Tageshälfte (Index), also frühestens die dritte Nacht

/** Klima je Stadt (Gewichte). Jahreszeiten verschieben es; Frost gibt es nur im Winter. */
const KLIMA = {
  kettlegate: { klar: 3, regen: 3, nebel: 3, sturm: 1 },
  wexmoor: { klar: 2, regen: 4, nebel: 3, sturm: 2 },
  dunscar: { klar: 4, regen: 1, nebel: 1, sturm: 2 },
  calderwick: { klar: 3, regen: 3, nebel: 2, sturm: 1 },
  briarholt: { klar: 3, regen: 1, nebel: 2, sturm: 2 },
  himmel: { klar: 1 },
};
const SAISON = {
  herbst: { nebel: 1, sturm: 1 },
  winter: { frost: 5, regen: -1 },
  fruehling: { regen: 1 },
  sommer: { klar: 2, nebel: -1 },
};

/** Kleine, stabile Zufallszahl 0..1 aus einem Text. */
function hash01(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Nummer der Tageshälfte (jede Tag- und Nachtphase zählt einzeln). */
export const phaseAt = (playTime) => Math.floor((playTime ?? 0) / DAY_NIGHT_SECONDS);

/** Ist die Nacht dieser Spielzeit eine Nebelnacht? Gilt für alle Städte außer der Himmelsstadt. */
export function nebelnachtAt(playTime, city = 'kettlegate') {
  if (city === 'himmel' || !isNightAt(playTime)) return false;
  const p = phaseAt(playTime);
  return p >= NEBELNACHT_AB && hash01(`nebelnacht|${p}`) < 1 / NEBELNACHT_TAKT;
}

/** Wetter einer Stadt zur Spielzeit (eine Art aus WETTER_ARTEN). */
export function wetterAt(playTime, city = 'kettlegate') {
  if (nebelnachtAt(playTime, city)) return 'nebel';
  if (phaseAt(playTime) === 0) return 'klar'; // Spielbeginn: ruhiges Wetter
  const base = { ...(KLIMA[city] ?? KLIMA.kettlegate) };
  if (city !== 'himmel') for (const [k, v] of Object.entries(SAISON[seasonAt(playTime)] ?? {})) base[k] = Math.max(0, (base[k] ?? 0) + v);
  const list = WETTER_ARTEN.filter((k) => base[k] > 0);
  const sum = list.reduce((n, k) => n + base[k], 0);
  let r = hash01(`wetter|${city}|${phaseAt(playTime)}`) * sum;
  for (const k of list) { r -= base[k]; if (r < 0) return k; }
  return list[list.length - 1];
}

// --- Schlafen ---------------------------------------------------------------------------
/** Tagsüber: Nickerchen frühestens so lange nach der letzten Rast. */
export const NAP_COOLDOWN = DAY_NIGHT_SECONDS;
export const NAP_HEAL = 0.5;
/** Chance auf einen Traum beim Schlafen in der Nacht. */
export const TRAUM_CHANCE = 0.6;

// --- Träume -----------------------------------------------------------------------------
/** Gefahr je Sequenz (niedrigere Zahl = höher aufgestiegen): Traumklarheit, Chance auf Albtraum, Unruhe, Lebensverlust. */
export function traumStufe(seq) {
  if (seq == null || seq >= 7) return { mult: 1.1, risk: 0, unruhe: 0, hp: 0 };
  if (seq >= 5) return { mult: 1.15, risk: 0.3, unruhe: 10, hp: 0 };
  if (seq >= 3) return { mult: 1.2, risk: 0.45, unruhe: 20, hp: 0.25 };
  return { mult: 1.25, risk: 0.6, unruhe: 30, hp: 0.4 };
}
export const TRAUM_KLARHEIT_SEK = DAY_NIGHT_SECONDS;

/** Wesen, die sich im Traum für den Pfad interessieren (je Pfad ein Satz). */
export const TRAUM_PFAD = {
  laterne: 'Eine Laterne ohne Träger schwebt vor dir her. Wo ihr Licht hinfällt, werfen die Dinge keine Schatten. Sie wartet, bis du ihr folgst, und will wissen, wie hell du schon brennst.',
  schluessel: 'Du stehst in einem Flur voller Türen. Hinter einer klopft jemand im Takt deines Herzens. Ein Schlüsselbund klirrt in einer Hand, die nicht deine ist.',
  echo: 'Jemand spricht deine Gedanken nach, kurz bevor du sie denkst. Die Stimme ist freundlich und sehr, sehr alt.',
  maske: 'Ein Gesicht ohne Züge sitzt dir gegenüber und probiert deines an. Es steht ihm besser als dir.',
  faden: 'Fäden laufen von deinen Fingern in die Dunkelheit. Am anderen Ende zieht etwas, geduldig, als hätte es Zeit bis zum Ende der Welt.',
  sq_uhr: 'Ein Uhrwerk tickt in deiner Brust. Eine Gestalt aus Zeigern beugt sich über dich und stellt es nach.',
  sq_waage: 'Eine Waage steht in einem leeren Saal. In der einen Schale liegt dein Name, in der anderen etwas, das schwerer ist.',
  eisen: 'Ein Amboss glüht im Dunkeln. Jemand mit Händen aus Eisen misst dich ab wie ein Stück Stahl, das noch gehärtet werden muss.',
  kessel: 'Ein Kessel brodelt ohne Feuer. Aus dem Dampf formt sich ein Mund, der deine Rezepte kennt und eines dazuflüstert.',
  sq_moor: 'Moorwasser steigt dir bis zur Brust. Aus der Tiefe sieht dich etwas an, das dich schon lange kennt, und lädt dich ein, tiefer zu kommen.',
};
export const TRAUM_TEXT = {
  ruhig: ['Du schläfst tief und traumlos.', 'Du träumst von Regen auf Dachziegeln und wachst ruhig auf.', 'Ein Traum von einer Zugfahrt ohne Ziel. Nichts davon bleibt hängen.'],
  fall: 'Im Traum blätterst du in deiner Akte. Die Seiten sind leer bis auf eine, und die leuchtet:',
  fall_ende: 'Du wachst auf und weißt noch genau, was dort stand.',
  geschenk: 'Als du aufwachst, ist dein Kopf klar wie lange nicht. Das Wesen hat dir etwas von seiner Aufmerksamkeit dagelassen.',
  albtraum: 'Dann schaut es genauer hin. Zu genau. Du wachst schweißnass auf, und etwas von seinem Blick ist noch in dir.',
  fremd: 'Eine Gestalt ohne Gesicht steht am Fußende deines Bettes. Sie sagt nichts. Als du aufwachst, steht dort niemand.',
};

export const wetterMethods = {
  /** Stadt der aktuellen Karte. */
  wetterStadt(mapId = this.map) {
    return this.content.maps[mapId]?.city ?? 'kettlegate';
  },
  /** Wetter hier und jetzt (Art). */
  wetter(mapId = this.map) {
    return wetterAt(this.playTime, this.wetterStadt(mapId));
  },
  nebelnacht(mapId = this.map) {
    return nebelnachtAt(this.playTime, this.wetterStadt(mapId));
  },
  uhrzeit() {
    return uhrzeitAt(this.playTime);
  },
  /** Kurztext fürs HUD, z. B. „Nacht · Regen“ oder „Nebelnacht“. */
  wetterHud() {
    if (this.nebelnacht()) return `${WETTER.nebel.icon} Nebelnacht`;
    const w = WETTER[this.wetter()];
    return `${this.isNight() ? 'Nacht' : 'Tag'} · ${w.icon} ${w.name}`;
  },

  /**
   * Wetter für einen Kampf: nur draußen, nie in Übungen und Ritualen. outdoor: ob die Karte draußen liegt.
   * Ergebnis: { art, def, nebelnacht } oder null.
   */
  kampfWetter(enc, { ritual = false, outdoor = isOutdoorMap(this.content.maps[this.map] ?? {}) } = {}) {
    if (!enc || enc.practice || enc.mirror || ritual) return null;
    const city = this.wetterStadt();
    if (city === 'himmel') return null;
    const nn = nebelnachtAt(this.playTime, city);
    if (!outdoor && !nn) return null;
    const art = outdoor ? this.wetter() : null;
    return { art, def: art ? WETTER[art] : null, nebelnacht: nn };
  },

  /** Flags für Sichtbarkeit (Nebelkrämerin) und Bedingungen: `nebelnacht`, `wetter_<art>`. Flüchtig, nie gespeichert. */
  wetterTick() {
    const nn = this.nebelnacht();
    const art = this.wetter();
    let changed = false;
    for (const f of [...this.flags]) if (f.startsWith('wetter_') && f !== `wetter_${art}`) { this.flags.delete(f); changed = true; }
    if (!this.flags.has(`wetter_${art}`)) { this.flags.add(`wetter_${art}`); changed = true; }
    if (nn !== this.flags.has(NEBELNACHT_FLAG)) {
      if (nn) this.flags.add(NEBELNACHT_FLAG); else this.flags.delete(NEBELNACHT_FLAG);
      changed = true;
      if (nn && this.wetterGesehen) this.emit('notice', 'Nebelnacht. Dichter Nebel kriecht durch die Gassen. Die Monster sind stärker, die Beute reicher, und auf dem Markt steht die Nebelkrämerin.');
    }
    if (changed && this.wetterGesehen) this.emit('wetter', { art, nebelnacht: nn });
    if (changed) this.emit('changed');
    this.wetterGesehen = true;
  },

  // --- Schlafen ------------------------------------------------------------------------
  /**
   * Darf man jetzt ins Bett? { kind: 'nacht' | 'nickerchen' | null, text }.
   * Nachts einmal je Nacht richtig schlafen; tagsüber ein Nickerchen frühestens NAP_COOLDOWN nach der letzten Rast.
   */
  schlafStatus() {
    if (this.testmodus) return { kind: this.isNight() ? 'nacht' : 'nickerchen' };
    const t = this.playTime ?? 0;
    const p = phaseAt(t);
    const s = this.schlaf ?? {};
    const toNext = DAY_NIGHT_SECONDS - (t % DAY_NIGHT_SECONDS);
    const min = (sec) => `${Math.max(1, Math.ceil(sec / 60))} Min`;
    if (this.isNight()) {
      if (s.nacht !== p) return { kind: 'nacht' };
      return { kind: null, text: `Du hast diese Nacht schon geschlafen. Der Morgen kommt in ${min(toNext)}.` };
    }
    const wait = (s.rast ?? -Infinity) + NAP_COOLDOWN - t;
    if (wait <= 0) return { kind: 'nickerchen' };
    return { kind: null, text: `Du bist nicht müde. Ein Nickerchen geht in ${min(wait)}, richtig schlafen kannst du nachts (in ${min(toNext)}).` };
  },

  /** Merkt sich die Rast (für Abklingzeit und „einmal je Nacht“). */
  schlafMerken(kind) {
    const t = this.playTime ?? 0;
    this.schlaf = { ...(this.schlaf ?? {}), rast: t, ...(kind === 'nacht' ? { nacht: phaseAt(t) } : {}) };
  },

  /**
   * Traum beim Schlafen in der Nacht (höchstens einer je Nacht). hint: Text zum laufenden Fall (oder null).
   * Ergebnis: { kind, text } oder null (traumlos). Wendet Wirkung (Traumklarheit, Albtraum) gleich an.
   */
  traeumen({ hint = null, rng = Math.random } = {}) {
    const p = phaseAt(this.playTime);
    if (!this.isNight() || (this.schlaf?.traum === p && !this.testmodus)) return null;
    this.schlaf = { ...(this.schlaf ?? {}), traum: p };
    if (!this.testmodus && rng() >= TRAUM_CHANCE) return { kind: 'ruhig', text: TRAUM_TEXT.ruhig[Math.floor(rng() * TRAUM_TEXT.ruhig.length)] };
    const pid = this.pathway?.id;
    const pfad = pid && TRAUM_PFAD[pid];
    const useHint = hint && (!pfad || rng() < 0.5);
    if (useHint) return { kind: 'fall', text: `${TRAUM_TEXT.fall}\n\n„${hint}“\n\n${TRAUM_TEXT.fall_ende}` };
    const st = traumStufe(pid ? this.pathway.seq : null);
    const bild = pfad || TRAUM_TEXT.fremd;
    this.buffs ??= [];
    this.buffs = this.buffs.filter((b) => b.source !== 'traum');
    this.buffs.push({ key: 'dmg_mult', value: st.mult, until: (this.talentTime ?? 0) + TRAUM_KLARHEIT_SEK, source: 'traum' });
    const lines = [bild, TRAUM_TEXT.geschenk, `Traumklarheit: +${Math.round((st.mult - 1) * 100)} % Schaden für 15 Min.`];
    if (st.risk && rng() < st.risk) {
      const parts = [];
      if (st.unruhe && this.pathway) { const before = this.unruhe; this.setUnruhe(this.unruhe + st.unruhe); const d = Math.round(this.unruhe - before); if (d > 0) parts.push(`+${d} Unruhe`); }
      if (st.hp) { const loss = Math.min(this.hp - 1, Math.round(this.maxHp * st.hp)); if (loss > 0) { this.hp -= loss; this.emit('hp', { value: this.hp, delta: -loss }); parts.push(`−${loss} Leben`); } }
      lines.push(TRAUM_TEXT.albtraum);
      if (parts.length) lines.push(`Albtraum: ${parts.join(', ')}.`);
      return { kind: 'albtraum', text: lines.join('\n\n') };
    }
    return { kind: 'pfad', text: lines.join('\n\n') };
  },

  serializeWetter() {
    return this.schlaf ? { schlaf: this.schlaf } : {};
  },
  loadWetter(data) {
    const s = data?.schlaf;
    this.schlaf = s && typeof s === 'object' ? { ...(Number.isFinite(s.rast) ? { rast: s.rast } : {}), ...(Number.isFinite(s.nacht) ? { nacht: s.nacht } : {}), ...(Number.isFinite(s.traum) ? { traum: s.traum } : {}) } : null;
    this.wetterGesehen = false;
  },
};
