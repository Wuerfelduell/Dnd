/**
 * Flächenfertigkeiten (Seb 2026-11-26): Kämpfe können gegen bis zu drei Gegner gehen. Fertigkeiten, die vom Bild her
 * eine Fläche treffen (Funkenregen, Schallstöße, Chöre, Wolken, Dampf, Wirbel, Schockwellen, Netze, Licht über allem),
 * treffen jetzt jeden stehenden Gegner. Preis dafür:
 * - Schaden und Brand jeder Flächenfertigkeit wirken nur zu AOE_DMG_MULT (core/Combat.js), auch gegen einen einzelnen Gegner;
 * - reine Kniffe ohne Schaden (Betäuben, Schwächen, Verlangsamen aller Gegner) kosten 1 Konzentration mehr (`aoe_cost`).
 *
 * Die Liste ist bewusst reine Daten (Fertigkeits-Id → Zusatzwerte), damit auch Gegner (Beyonder mit Pfadfähigkeiten)
 * dieselben Fertigkeiten mit derselben Fläche nutzen können: `isAoe(sk)` / `AOE_SKILLS`.
 */

/** Id → { cost: Aufschlag auf die Konzentration } (leer = nur Schaden gedämpft). */
export const AOE_SKILLS = {
  // Laterne: Funken, Signallicht, glühender Horizont, Licht über allem
  funkenregen: {},
  signalfeuer: { cost: 1 },
  horizontglut: {},
  laterne_hoch_1: {},
  // Faden: ein Netz über alle, ein Schnitt am Saum aller
  fangnetz: { cost: 1 },
  saumschnitt: {},
  // Maske: der Ball, der Wirbel der Gesichter, das leere Parkett
  maskenball: {},
  gesichterwirbel: {},
  maske_hoch_2: {},
  // Echo: Schall und Stimmen
  grabesstimme: { cost: 1 },
  totenchor: {},
  stillstand: {},
  kuestenlaut: {},
  echo_hoch_2: {},
  // Kessel: Wolken, Rauch, Dampf, Abwärme
  aetzwolke: {},
  rauchphiole: {},
  dampfstoss: {},
  kessel_hoch_2: {},
  // Eisen: Wirbel, Schockwelle, Brückenstoß
  klingenwirbel: {},
  hammerfall: {},
  traegerstoss: {},
  // Schlüssel: Sprung durch alle Türrahmen
  randsprung: {},
  // Waage: der Ton, der jede Schuld spürt; Schatten an allen Handgelenken
  waage_halber_ton: { cost: 1 },
  waage_gewichtsschatten: {},
  // Moor: der Boden greift nach allen
  moor_bodennamen: {},
  moor_hoch_2: {},
  // Uhr: der Takt aller verschoben
  uhr_nachhinken: { cost: 1 },
  uhr_fristlauscher: { cost: 1 },
};

/** Ist die Fertigkeit eine Flächenfertigkeit? */
export const isAoe = (sk) => !!sk?.aoe;

/** Macht aus einer Fertigkeit ihre Flächenfassung (aoe, ggf. teurer). */
export function toAoe(sk) {
  const extra = sk?.id ? AOE_SKILLS[sk.id] : null;
  if (!extra || sk.aoe) return sk;
  return { ...sk, aoe: true, cost: (sk.cost ?? 0) + (extra.cost ?? 0) };
}

/** Nach withFaehigkeiten, vor withHalbgottFertigkeiten: skill und skill2 aller Sequenzen umstellen. */
export function withFlaechenFaehigkeiten(pathways) {
  if (!pathways?.pathways) return pathways;
  const out = {};
  for (const [pid, p] of Object.entries(pathways.pathways)) {
    const seqs = { ...p.seqs };
    for (const [n, s] of Object.entries(seqs)) {
      if (!s) continue;
      seqs[n] = { ...s, ...(s.skill ? { skill: toAoe(s.skill) } : {}), ...(s.skill2 ? { skill2: toAoe(s.skill2) } : {}) };
    }
    out[pid] = { ...p, seqs };
  }
  return { ...pathways, pathways: out };
}
