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
  return !!(def.visible_if?.requires_quests_active?.length || def.visible_if?.requires_any_quests_active?.length) || def.encounter?.startsWith('kopfgeld_');
}

/** Hält dieser Gegner Abstand zum Spieler? `playerSeq` ist null ohne Pfad. */
export function fearsPlayer(playerSeq, def, mapDef = {}) {
  if (!playerSeq) return false;
  return enemySeq(def, mapDef) - playerSeq >= FEAR_MARGIN;
}

/**
 * Stufe eines Gegners nach seinen Kampfdaten (für die mythische Gestalt, Pathways.js):
 * ausdrückliches Feld `tier_seq`, sonst die Gefahrenstufe seines Gebiets (zones), sonst nach Kapitel
 * (Kettlegate 9/8, Wexmoor 7, Dunscar 6, Calderwick und Briarholt 5). Bosse eine Sequenz darüber.
 */
export const CHAPTER_SEQ = { 1: 9, 2: 7, 3: 6, 4: 5, 5: 5 };
export function encounterSeq(enc, content = {}) {
  let seq;
  if (enc.tier_seq) seq = enc.tier_seq;
  else {
    const tier = content.zones?.[enc.zone]?.tier;
    if (tier) seq = 10 - tier;
    else if (enc.chapter) seq = CHAPTER_SEQ[enc.chapter] ?? 5;
    else seq = enc.city ? 9 : 8;
  }
  if (enc.boss) seq -= 1;
  if (enc.elite) seq -= 0.5;
  return seq;
}
