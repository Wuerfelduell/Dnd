// Ab Sequenz 7 haben gewöhnliche Gegner auf der Karte Angst vor dir: sie halten Abstand, statt dich zu jagen.
// Bosse, Auftragsziele und Gegner aus Gefahrengebieten bleiben angriffslustig, solange sie nicht deutlich
// unter deiner Stufe liegen. Die Stufe eines Gegners wird in Sequenzen gemessen (9 = schwächste).

/** Ab dieser Sequenz (und darunter, also 7, 6, 5 …) fürchten dich die gewöhnlichen Stadtgegner. */
export const FEAR_SEQ = 7;
/** So viele Sequenzen muss ein Gegner unter dir liegen, damit er Abstand hält. */
export const FEAR_MARGIN = 9 - FEAR_SEQ;

/**
 * Stufe eines Gegners auf der Karte, ausgedrückt als Sequenz.
 * Stadtgegner: 9. Gefahrengebiet der Stufe n: 10 - n (Stufe 1 = Seq 9 … Stufe 4 = Seq 6).
 * Bosse und Auftragsziele liegen eine Sequenz darüber. Elite-Varianten zählen wie ihr Grundgegner.
 */
export function enemySeq(def, mapDef = {}) {
  let seq = mapDef.danger ? 10 - mapDef.danger : 9;
  if (def.boss || isQuestTarget(def)) seq -= 1;
  return seq;
}

/** Kopfgeld- und andere Auftragsziele: nur sichtbar, solange ein Auftrag läuft. */
export function isQuestTarget(def) {
  return !!def.visible_if?.requires_quests_active?.length || def.encounter?.startsWith('kopfgeld_');
}

/** Hält dieser Gegner Abstand zum Spieler? `playerSeq` ist null ohne Pfad. */
export function fearsPlayer(playerSeq, def, mapDef = {}) {
  if (!playerSeq) return false;
  return enemySeq(def, mapDef) - playerSeq >= FEAR_MARGIN;
}
