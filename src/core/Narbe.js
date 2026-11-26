/**
 * Die Narbe aus Licht (Seb 2026-11-26, Kapitel 6): Wer oben verbrannt wurde (Flag `auf_verbrannt`, Sturz nach Calderwick),
 * trägt sie für immer. Die Wesen von oben (Gegner mit `himmel: true`) erkennen sie: Man trifft sie härter, sie einen aber auch.
 */
export const NARBE_FLAG = 'auf_verbrannt';
export const NARBE = { schaden: 1.15, erlitten: 1.1 };

export function hatNarbe(state) {
  return !!state?.flags?.has(NARBE_FLAG);
}

/** Faktor für eigenen Schaden (`richtung` 'schaden') oder erlittenen Schaden ('erlitten') gegen diesen Gegner. */
export function narbeMult(state, enc, richtung) {
  if (!enc?.himmel || !hatNarbe(state)) return 1;
  return richtung === 'erlitten' ? NARBE.erlitten : NARBE.schaden;
}
