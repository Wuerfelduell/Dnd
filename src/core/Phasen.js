// Kampfphasen: wann und wie ein Gegner im Kampf die Haltung wechselt (der „Tease“ bei soundso viel Leben).
//
// Daten je Gegner (encounters):
//   phase2: { at, attacks, meldung, ... }   eine zweite Phase (BQ, Sektenhäupter); `at` = Anteil der Leben (Standard 0,5)
//   phases: [{ at, ... }, ...]              beliebig viele Phasen, jede löst einmal aus, sobald die Leben unter `at` fallen
//   enrage_at: 0.4                          ab wann der Gegner in Rage ist (schneller, härter; Standard ENRAGE_AT)
//   phases: false                           keine automatische Phase
// Felder einer Phase: attacks (ersetzt die Angriffsliste), add (hängt Angriffe an), meldung (Text),
//   armor (+N Panzer), guard (+N Schutz, wie der Kniff guard), heal (Anteil der Höchstleben, wird geheilt),
//   dmg (Schadensfaktor ab jetzt), speed (Taktfaktor ab jetzt, <1 = schneller), name (Beiname fürs Protokoll).
//
// Bosse und Eliten ohne eigene Phasen bekommen eine automatische: Schwelle und Muster hängen fest an der Kennung,
// so hat jeder Gegner seinen eigenen Moment (60 %, 50 %, 40 %, ein Drittel, ein Viertel) und sein eigenes Muster.
// Gegner, die ihre Phasen als eigene Begegnungen haben (`<id>_phase2`, Vorrat-Bosse) oder eine Szene wechseln, bleiben außen vor.

export const PHASE_DEFAULT_AT = 0.5;
/** Schwellen für Bosse: früh (60 %) bis spät (ein Viertel). */
export const BOSS_THRESHOLDS = [0.6, 0.5, 0.4, 1 / 3, 0.25];
/** Eliten wechseln seltener und bekommen nur zwei Schwellen: knapp über der Hälfte oder bei einem Drittel. */
export const ELITE_THRESHOLDS = [0.55, 1 / 3];
/** Nur jede zweite Elite hat überhaupt eine Phase. */
export const ELITE_SHARE = 0.5;

/** Kleiner, stabiler Hash einer Kennung (FNV-1a), damit Schwelle und Muster je Gegner immer gleich sind. */
export function hashId(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

const pick = (list, seed) => list[seed % list.length];
const strikes = (atts) => atts.filter((a) => !a.action && a.hits?.length);
const heaviest = (atts) => [...strikes(atts)].sort((a, b) => b.damage - a.damage)[0];

/**
 * Die automatischen Muster. Jedes bekommt die Angriffsliste der ersten Phase und liefert eine Phase.
 * Namen werden mit einem Beinamen versehen, damit man im Kampf sieht, dass sich etwas geändert hat.
 */
export const AUTO_PATTERNS = {
  /** Bruch: dieselben Angriffe, etwas härter und schneller. */
  bruch: (atts, name) => ({
    name: 'Bruch',
    meldung: `${name} bricht aus dem Takt: schneller, härter.`,
    attacks: atts.map((a) => (a.action ? a : { ...a, name: `${a.name} – Bruch`, damage: Math.round(a.damage * 1.15), hits: a.hits.map((h) => Math.round(h * 0.9)) })),
  }),
  /** Ausholen: ein neuer, aufgeladener Schlag kommt dazu. Erst holt der Gegner eine Runde aus, dann trifft er doppelt so hart, zu zweit beide. */
  ausholen: (atts, name) => {
    const h = heaviest(atts);
    return {
      name: 'Ausholen',
      meldung: `${name} sammelt sich. Wenn der nächste große Schlag kommt, hilft nur Ausweichen.`,
      add: [{ name: `${h?.name ?? 'Schlag'} – aufgeladen`, damage: Math.round((h?.damage ?? 10) * 0.9), hits: [1900], charge: true, charge_mult: 1.8, unparryable: true }],
    };
  },
  /** Panzer: Schutz, einen Punkt Panzer dazu und ein Wutschrei, der die Schläge für zwei Runden härter macht. */
  panzer: (atts, name) => ({
    name: 'Panzer',
    meldung: `${name} zieht sich zusammen: Schutz, Panzer, und die Schläge werden schwerer.`,
    armor: 1,
    guard: Math.max(8, Math.round((heaviest(atts)?.damage ?? 10) * 1.2)),
    add: [{ name: 'Sammeln', action: 'rally', value: 30, rounds: 2, text: 'Die nächsten zwei Runden schlägt es 30 % härter.' }],
  }),
  /** Raserei: schnellerer Takt und ein dreiteiliger Wirbel, bei dem jeder Schlag härter ist als der vorige. */
  raserei: (atts, name) => {
    const h = heaviest(atts);
    const base = Math.max(3, Math.round((h?.damage ?? 10) * 0.55));
    return {
      name: 'Raserei',
      meldung: `${name} gerät in Raserei: der Takt zieht an, die Schläge steigern sich.`,
      speed: 0.88,
      add: [{ name: 'Wirbel', damage: base, hits: [1100, 1700, 2300], escalate: 1.3 }],
    };
  },
  /** Blutdurst: Treffer heilen den Gegner, der schwerste Schlag frisst Konzentration. */
  blutdurst: (atts, name) => {
    const h = heaviest(atts);
    return {
      name: 'Blutdurst',
      meldung: `${name} zehrt von jedem Treffer. Jetzt nicht getroffen werden.`,
      attacks: atts.map((a) => (a.action ? a : { ...a, lifesteal: 0.5, ...(a === h ? { name: `${a.name} – zehrend`, ap_drain: 2 } : {}) })),
    };
  },
  /** Zermürben: ein Schlag, dem man nicht ausweichen kann (nur parieren), und ein Kniff, der Schutz zerschlägt. */
  zermuerben: (atts, name) => {
    const h = heaviest(atts);
    return {
      name: 'Zermürben',
      meldung: `${name} stellt dich: dem nächsten Griff weicht niemand aus, nur die Parade hilft.`,
      add: [
        { name: `${h?.name ?? 'Griff'} – Griff`, damage: Math.round((h?.damage ?? 10) * 0.8), hits: [1500], undodgeable: true, unparryable: false },
        { name: 'Zerschlagen', action: 'shatter', value: 5, text: 'Schutz zerspringt, -5 Nerven.' },
      ],
    };
  },
};

export const AUTO_PATTERN_NAMES = Object.keys(AUTO_PATTERNS);

/** Hat der Gegner seine Phasen als eigene Begegnungen (Vorrat-Bosse) oder läuft über eine Szene? Dann keine automatische Phase. */
export function hasOwnPhasing(enc, id, encounters = {}) {
  return !!(enc.scene || /_phase\d$/.test(id ?? '') || (id && encounters[`${id}_phase2`]));
}

/** Normalisiert eine Phase aus den Daten (füllt `at`). */
function normalize(p, fallbackAt = PHASE_DEFAULT_AT) {
  return { ...p, at: p.at ?? fallbackAt };
}

/**
 * Liefert die Phasen eines Gegners, absteigend nach Schwelle sortiert (die früheste zuerst).
 * Explizite Daten (`phases`, `phase2`) gewinnen; `phases: false` schaltet die Automatik ab.
 */
export function phasesFor(enc, id = '', encounters = {}) {
  if (!enc || enc.practice) return [];
  let list = null;
  if (Array.isArray(enc.phases)) list = enc.phases.map((p) => normalize(p));
  else if (enc.phase2) list = [normalize(enc.phase2)];
  else if (enc.phases === false) list = [];
  else list = autoPhases(enc, id, encounters);
  return [...list].sort((a, b) => b.at - a.at);
}

/** Automatische Phase für Bosse und (jede zweite) Elite. Schwelle und Muster hängen an der Kennung. */
export function autoPhases(enc, id = '', encounters = {}) {
  if (!id || (!enc.boss && !enc.elite) || hasOwnPhasing(enc, id, encounters)) return [];
  const h = hashId(id);
  if (!enc.boss && (h % 100) / 100 >= ELITE_SHARE) return [];
  const at = enc.boss ? pick(BOSS_THRESHOLDS, h >>> 8) : pick(ELITE_THRESHOLDS, h >>> 8);
  const pattern = pick(AUTO_PATTERN_NAMES, h >>> 16);
  const phase = AUTO_PATTERNS[pattern](enc.attacks, enc.name);
  return [{ ...phase, at, auto: pattern }];
}

/** Kurztext einer Schwelle fürs Bestiarium/Protokoll: 0.5 → „bei halbem Leben“. */
export function thresholdText(at) {
  if (Math.abs(at - 0.5) < 0.01) return 'bei halbem Leben';
  if (Math.abs(at - 1 / 3) < 0.01) return 'bei einem Drittel der Leben';
  if (Math.abs(at - 0.25) < 0.01) return 'bei einem Viertel der Leben';
  return `bei ${Math.round(at * 100)} % der Leben`;
}
