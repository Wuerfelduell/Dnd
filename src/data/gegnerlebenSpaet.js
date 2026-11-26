// Seb 2026-11-26: „Gegner in Calderwick auf ca. 10–25k Leben, danach Briarholt weiter rauf, sodass es zur Heiligenstadt passt.“
// Die Zahlen gelten für die Koop-Anzeige (zwei gleich starke Spieler, Leben ×2,5). Allein ist es ein Zweieinhalbtel.
// Leben laufen über die Untergrenze (hp_floor_mult), damit Nebelnacht, Weltwandel, Gruppenanteil und Koop-Aufschlag weiter greifen.
// Schaden steigt mit, Geld mit der Wurzel des Lebenszuwachses (längere Kämpfe sollen nicht weniger je Stunde bringen).
import { hpFloor, ENEMY_HP_MULT, ELITE_HP_MULT } from '../core/Combat.js';

// Ziel-Leben allein (Koop gleich stark ×2,5): Calderwick 10.000 / 14.000 / 25.000, Briarholt 15.000 / 22.500 / 35.000.
// Zum Vergleich Heiligenstadt (hs2): Halbgott 9100, Heiliger 13.300, Engel 18.200–23.800 allein.
export const SPAET_LEBEN = {
  calderwick: { normal: 4000, elite: 5600, boss: 10000, dmg: 1.3 },
  briarholt: { normal: 6000, elite: 9000, boss: 14000, dmg: 1.3 },
};
// Seb 2026-11-26: Verdauung durch Monstersiege in Calderwick ×10 (combat_win, occult_win, elite_win; boss_win-Fixwert 3 % bleibt)
export const CALDERWICK_VERDAUUNG = 10;
const BRIARHOLT_ID = /^(vg_bh|kgj_bh)/;

function stadt(id, enc, content) {
  if (BRIARHOLT_ID.test(id)) return 'briarholt';
  const city = content.maps?.[enc.zone]?.city;
  return city === 'calderwick' || city === 'briarholt' ? city : null;
}

/** Leben, wie Combat sie allein ohne Koop/Wetter rechnet. */
export function spaetLeben(enc, content) {
  const zone = content.zones?.[enc.zone];
  const rank = enc.boss ? 'boss' : enc.elite ? 'elite' : 'normal';
  const zm = zone?.hp_mult;
  const hpMult = enc.hp_mult ?? (zm && typeof zm === 'object' ? zm[rank] : zm) ?? 1;
  const solo = enc.hp * ENEMY_HP_MULT * (enc.elite ? ELITE_HP_MULT : 1) * hpMult;
  return Math.max(solo, hpFloor(enc) * (enc.hp_floor_mult ?? 1));
}

export function applyGegnerlebenSpaet(content) {
  for (const [id, enc] of Object.entries(content.encounters)) {
    if (enc.spaet_leben || enc.practice || !(enc.chapter >= 4)) continue;
    const s = stadt(id, enc, content);
    if (s === 'calderwick' && !enc.verdau_mult) enc.verdau_mult = CALDERWICK_VERDAUUNG; // auch Oberhaupt, Herz, Stellvertretung
    const floor = hpFloor(enc);
    if (!s || !floor) continue;
    const z = SPAET_LEBEN[s];
    const rank = enc.boss ? 'boss' : enc.elite ? 'elite' : 'normal';
    const alt = spaetLeben(enc, content);
    // Herde der Verderbnis 1–6 bleiben gestaffelt (je Stufe +10 %); wer sonst schon darüber liegt (Oberhaupt, Herz, Stellvertretung), bleibt wie er ist
    const herd = /_herd(\d)$/.exec(id);
    const ziel = Math.round(z[rank] * (herd ? 1 + 0.1 * (Number(herd[1]) - 1) : 1));
    if (alt >= ziel) continue;
    enc.hp_floor_mult = ziel / floor;
    enc.spaet_leben = true;
    enc.attacks = enc.attacks.map((a) => (a.action || !a.damage ? a : { ...a, damage: Math.round(a.damage * z.dmg) }));
    if (enc.phase2?.attacks) enc.phase2 = { ...enc.phase2, attacks: enc.phase2.attacks.map((a) => (a.action || !a.damage ? a : { ...a, damage: Math.round(a.damage * z.dmg) })) };
    const L = content.loot?.[id];
    if (L?.money?.[1]) content.loot[id] = { ...L, money: L.money.map((v) => Math.round(v * Math.sqrt(ziel / alt))) };
  }
}
