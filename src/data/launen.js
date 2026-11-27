/**
 * Launische Artefakte (Seb 2026-11-27): Ein Artefakt, das du lange bei dir trägst, bindet sich an dich.
 * Es wird stärker, aber auch eigenwilliger: Ab „Gebunden“ will es jeden Spieltag etwas, und wer es enttäuscht,
 * spürt seinen Groll. Logik: core/Launen.js. Werte hier, damit Balance an einer Stelle bleibt.
 */
import { DAY_SECONDS } from '../core/Clock.js';

/**
 * Bindungsstufen nach Tragezeit (gespielte Sekunden im Inventar, nicht beiseitegelegt).
 * boon: Faktor auf die Vorteile, curse: Faktor auf die Flüche, fordert: ab hier gibt es eine Tagesforderung,
 * pfad: zusätzlich eine Handlung nach dem Grundsatz des eigenen Pfades.
 */
export const LAUNE_STUFEN = [
  { stufe: 0, ab: 0, name: 'Fremd', boon: 1, curse: 1, fordert: false, pfad: false, text: 'Es kennt dich noch nicht.' },
  { stufe: 1, ab: DAY_SECONDS, name: 'Vertraut', boon: 1.25, curse: 1, fordert: false, pfad: false, text: 'Es hat sich an deine Hand gewöhnt.' },
  { stufe: 2, ab: DAY_SECONDS * 3, name: 'Gebunden', boon: 1.5, curse: 1, fordert: true, pfad: false, text: 'Es gehört zu dir. Und es will etwas.' },
  { stufe: 3, ab: DAY_SECONDS * 6, name: 'Verwachsen', boon: 2, curse: 1.25, fordert: true, pfad: true, text: 'Es ist ein Teil von dir geworden, mit eigenem Willen.' },
];

/**
 * Groll: steigt um 1 für jeden Spieltag, an dem ein gebundenes Artefakt nicht bekommt, was es will,
 * und sinkt um 1, sobald es an einem Tag wieder satt wird. boon: Faktor auf die Vorteile (0 = sie ruhen),
 * curse: Faktor auf die Flüche, unruhe: zusätzliche Unruhe pro Sekunde.
 */
export const GROLL_STUFEN = [
  { groll: 0, name: 'Zufrieden', boon: 1, curse: 1, unruhe: 0 },
  { groll: 1, name: 'Verstimmt', boon: 0.5, curse: 1.25, unruhe: 0.1 },
  { groll: 2, name: 'Zornig', boon: 0, curse: 1.5, unruhe: 0.2 },
  { groll: 3, name: 'Abtrünnig', boon: 0, curse: 2, unruhe: 0.4 },
];
export const GROLL_MAX = 3;

/** Nur wer an einem Tag mindestens so lange (Sekunden) dabei war, wird an diesem Tag beurteilt. */
export const LAUNE_TAG_MIN = DAY_SECONDS / 2;

/**
 * Wesen eines Artefakts (aus seinen Vorteilen abgeleitet) und was es ab „Gebunden“ jeden Spieltag will.
 * kinds: Handlungen (GameState.act) und wie viel jede zählt; menge: nötig bei Gebunden, bei Verwachsen doppelt.
 */
export const WESEN = {
  kampf: { name: 'Blutdurst', will: 'Kampfsiege', kinds: { combat_win: 1 }, menge: 1, text: 'Es will kämpfen. Ein Tag ohne Sieg macht es ungeduldig.' },
  wacht: { name: 'Wachsamkeit', will: 'Paraden', kinds: { parry: 1 }, menge: 3, text: 'Es will, dass du dich wehrst. Pariere, sonst hält es dich für schwach.' },
  seher: { name: 'Neugier', will: 'Sekunden Geistsicht', kinds: { vision: 1, hidden_clue: 20 }, menge: 30, text: 'Es will sehen, was hinter dem Nebel liegt. Öffne die Geistsicht für es.' },
  geist: { name: 'Wissbegier', will: 'Gespräche oder Hinweise', kinds: { dialogue: 1, clue: 1, hidden_clue: 1, conclusion: 2, fact_likely: 1, fact_refuted: 1 }, menge: 3, text: 'Es will Stimmen hören und Geheimnisse sammeln.' },
  gier: { name: 'Habgier', will: 'Beute, Handel oder Schlösser', kinds: { loot: 1, trade: 1, lock: 1 }, menge: 2, text: 'Es will mehr. Mehr Münzen, mehr Dinge, mehr offene Türen.' },
};

/** Welche Vorteile welches Wesen verraten (der erste passende Vorteil entscheidet). */
export const WESEN_KEYS = {
  kampf: ['atk', 'dmg_mult', 'occult_mult', 'ap_max', 'ap_round', 'ap_start', 'attack_ap', 'opening_stun'],
  wacht: ['damage_taken', 'max_hp', 'heal_bonus', 'dodge_window', 'parry_nerves', 'parry_ap', 'round_nerves', 'always_flee'],
  seher: ['vision_cost', 'link_hints', 'conclusion_honor'],
  gier: ['money_bonus', 'price', 'sell', 'lock_bonus', 'carry', 'honor_loss'],
  geist: ['max_nerves', 'composure_regen', 'skill_composure', 'calm_decay', 'digest_mult'],
};

/** Ab „Verwachsen“ will es auch, dass du nach deinem Pfad lebst: eine Handlung des Grundsatzes (Geistsicht: 20 s). */
export const PFAD_MENGE = 1;
export const PFAD_VISION_SEK = 20;

/**
 * Vorteile, die die Bindung nicht verstärkt: Konzentration ist ohnehin knapp bemessen (Combat.AP_MAX_CAP),
 * Ja/Nein-Schalter haben nichts zu verstärken.
 */
export const LAUNE_FEST = new Set(['ap_max', 'ap_round', 'ap_start', 'attack_ap', 'parry_ap']);

/** Untergrenzen für Multiplikatoren, damit verstärkte Vorteile nicht ins Absurde kippen. */
export const LAUNE_UNTEN = { damage_taken: 0.5, vision_cost: 0.3, price: 0.6, skill_composure: 0.3, digest_mult: 0.3, honor_loss: 0.3, hurry_cost: 0.3, unruhe_gain: 0.3, dodge_cost: 0.3 };
/** Ganzzahlige Werte (abgerundet, nie unter dem Grundwert). */
export const LAUNE_GANZ = new Set(['atk', 'max_hp', 'max_nerves', 'round_nerves', 'parry_nerves', 'lock_bonus', 'carry', 'conclusion_honor', 'ap_blood']);

/** Gespeicherte Bindungen säubern (alte Stände haben keine). { tag, heute: {kind: menge}, art: {id: {t, d, groll, satt}} } */
export function cleanLaunen(l) {
  const art = {};
  for (const [id, e] of Object.entries(l?.art ?? {})) {
    if (!e || typeof e !== 'object') continue;
    art[id] = {
      t: Math.max(0, Number(e.t) || 0), d: Math.max(0, Number(e.d) || 0),
      groll: Math.max(0, Math.min(GROLL_MAX, Math.floor(Number(e.groll) || 0))), satt: !!e.satt,
    };
  }
  const heute = {};
  for (const [k, v] of Object.entries(l?.heute ?? {})) if (Number(v) > 0) heute[k] = Number(v);
  return { tag: Number.isFinite(l?.tag) ? l.tag : null, heute, art };
}

/** Meldungen beim Aufstieg der Bindung (Stufe 1–3). */
export const STUFE_MELDUNG = {
  1: 'Die Bindung wächst. Es ist dir jetzt vertraut, seine Vorteile wirken stärker.',
  2: 'Es ist jetzt an dich gebunden und noch stärker. Ab jetzt will es jeden Spieltag etwas von dir.',
  3: 'Es ist mit dir verwachsen. Seine Vorteile wirken doppelt, seine Flüche schwerer, und es will auch, dass du nach deinem Pfad lebst.',
};
/** Meldungen, wenn der Groll steigt (Stufe 1–3). */
export const GROLL_MELDUNG = {
  1: 'Es hat heute nicht bekommen, was es wollte, und ist verstimmt. Seine Vorteile wirken nur noch halb.',
  2: 'Es ist zornig. Seine Vorteile ruhen, seine Flüche beißen stärker.',
  3: 'Es hat sich gegen dich gewandt. Nur noch seine Flüche wirken, doppelt so stark. Gib ihm, was es will, oder trenn dich davon.',
};
export const SATT_MELDUNG = 'Es ist für heute zufrieden.';
export const BESAENFTIGT_MELDUNG = 'Es ist besänftigt, sein Groll lässt nach.';
export const RISS_MELDUNG = 'Die Bindung ist gerissen.';
/** Was ein grollendes Artefakt gerade tut (Anzeige im Inventar). */
export const GROLL_WIRKUNG = {
  1: 'Vorteile nur halb, Flüche stärker, etwas Unruhe.',
  2: 'Vorteile ruhen, Flüche deutlich stärker, mehr Unruhe.',
  3: 'Nur Flüche, doppelt so stark, viel Unruhe.',
};
