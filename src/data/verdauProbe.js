/**
 * Verdauungs-Herausforderung je Calderwicker Pfadviertel (Seb 2026-11-26), Logik in core/VerdauProbe.js.
 * Ein Prüfstein am Rand jedes Viertels o3_<pfad>: einmal je Spieltag, solo, gegen einen Gegner auf Stärke des 4. Herdes
 * (data/pfadviertel.js HERDE), unter der Regel des Pfades. Auf Seq 3 bis 1 wächst der Gegner mit (wie die Rituale 3/2/1).
 * Kampfregeln: die vorhandenen der Rituale (Combat.js): noItems, noParry, noDodge, noHeal, spare, maxRounds, minKillRound,
 * startHp, decayPct, minItems, endMin, gruppe.
 */
import { CW_GEBIETE } from './aufstieg.js';
import { freieKachel } from './calderwickStory.js';
import { HOCH_SCALE } from './seqHoch.js';

export const verdauEncId = (pid) => `o3_${pid}_verdau`;
const BASIS = { hp: 3600, dmg: 66 }; // 4. Herd
// Seb 2026-11-27: viel schwerer, und nach jedem Sieg schwerer. Grundaufschlag auf alle Stufen, dazu je bisherigem Sieg
// (pro Spieler und Spielstand, pathway.verdauSiege) +30 % Leben und +15 % Schaden, linear.
export const VERDAU_HART = { hp: 1.8, dmg: 1.4 };
export const VERDAU_JE_SIEG = { hp: 0.3, dmg: 0.15 };
/** Faktor der Stufe (1 = noch kein Sieg). */
export const verdauStufeMult = (stufe) => ({ hp: VERDAU_HART.hp * (1 + VERDAU_JE_SIEG.hp * (stufe - 1)), dmg: VERDAU_HART.dmg * (1 + VERDAU_JE_SIEG.dmg * (stufe - 1)) });
const S = (hp, dmg) => ({ 4: { hp, dmg }, 3: { hp: hp * HOCH_SCALE[3].hp, dmg: dmg * HOCH_SCALE[3].dmg }, 2: { hp: hp * HOCH_SCALE[2].hp, dmg: dmg * HOCH_SCALE[2].dmg }, 1: { hp: hp * HOCH_SCALE[1].hp, dmg: dmg * HOCH_SCALE[1].dmg } });

/** Je Pfad: Name, Gegner, Regeltext (für Prüfstein und Liste) und Regeln. */
export const VERDAU_PROBE = {
  laterne: { name: 'Die drei Dochte', gegner: 'Die Dochtwächter', regel: 'Drei Gegner auf einmal, ohne Gegenstände und ohne Parade. Nur dein Licht.',
    rules: { gruppe: 2, noItems: true, noParry: true }, scale: S(0.75, 0.85) },
  faden: { name: 'Der angerissene Faden', gegner: 'Die Haspel der Nachbarn', regel: 'Du beginnst mit 60 % Leben und darfst dich nicht heilen.',
    rules: { startHp: 0.6, noHeal: true }, scale: S(1, 1) },
  maske: { name: 'Das Gesicht, das bleibt', gegner: 'Der Mann mit dem fremden Gesicht', regel: 'Bring ihn unter 15 % Leben und verschone ihn, ohne auszuweichen. Wer tötet, scheitert.',
    rules: { spare: true, noDodge: true }, scale: S(1.1, 1) },
  echo: { name: 'Der kurze Nachhall', gegner: 'Der Chor im Schacht', regel: 'Zwei Gegner, beide in höchstens fünf Runden besiegt.',
    rules: { gruppe: 1, maxRounds: 5 }, scale: S(0.8, 0.9) },
  kessel: { name: 'Der brodelnde Sud', gegner: 'Die Mutter aller Sude', regel: 'Der Sud verbrüht dich jede Runde (4 % Leben), und du musst mindestens vier Gegenstände benutzen.',
    rules: { decayPct: 0.04, minItems: 4 }, scale: S(1, 1) },
  eisen: { name: 'Das Gewicht tragen', gegner: 'Der Amboss, der schlägt', regel: 'Kein Ausweichen, keine Parade, und siegen erst ab Runde 6. Halte aus.',
    rules: { noDodge: true, noParry: true, minKillRound: 6 }, scale: S(1.2, 1) },
  schluessel: { name: 'Zwei Türen, kein Werkzeug', gegner: 'Die Türsteher aller Türen', regel: 'Zwei Gegner, ohne Gegenstände und ohne Parade.',
    rules: { gruppe: 1, noItems: true, noParry: true }, scale: S(0.85, 0.95) },
  sq_waage: { name: 'Die Waage im Gleichgewicht', gegner: 'Der Wäger der Nachbarn', regel: 'Ohne Gegenstände, und am Ende mindestens 40 % Leben und 60 % Nerven.',
    rules: { noItems: true, endMin: { hp: 0.4, nerves: 0.6 } }, scale: S(1, 1) },
  sq_moor: { name: 'Das zehrende Moor', gegner: 'Die Moorleiche vom Brunnen', regel: 'Das Moor zehrt jede Runde 5 % Leben, und am Ende stehst du mit mindestens 60 % Leben.',
    rules: { decayPct: 0.05, endMin: { hp: 0.6 } }, scale: S(1, 1) },
  sq_uhr: { name: 'Die rechte Stunde', gegner: 'Die Unruh im Keller', regel: 'Sieg genau in Runde 5, 6 oder 7. Nicht früher, nicht später.',
    rules: { minKillRound: 5, maxRounds: 7 }, scale: S(1.1, 1) },
};

function angleichen(base, { hp, dmg }) {
  const top = Math.max(1, ...base.attacks.filter((a) => !a.action).map((a) => a.damage ?? 0));
  return { hp, attacks: base.attacks.map((a) => (a.action ? a : { ...a, damage: Math.round(((a.damage ?? 0) * dmg) / top) })) };
}

export function applyVerdauProbe(content) {
  for (const [pid, def] of Object.entries(VERDAU_PROBE)) {
    const map = content.maps[`o3_${pid}`];
    const cw = CW_GEBIETE[pid];
    if (!map || !cw || !content.pathways[pid]) continue;
    const base = content.encounters[`o3_${pid}_tiefe`] ?? content.encounters[`o3_${pid}_g1`];
    if (!base) continue;
    const { hp, attacks } = angleichen(base, BASIS);
    content.encounters[verdauEncId(pid)] = {
      id: verdauEncId(pid), name: def.gegner, sprite: 'wild', sheet: base.sheet, tint: '#e0ffe0', occult: true, pathway: pid,
      chapter: 5, boss: false, elite: true, hp, armor: 10, dmg_mult: 1, max_round_dmg: 0.3, fleeable: true, zone: `o3_${pid}`,
      attacks, verdau_probe: true,
      intro: `Der Prüfstein im ${cw.viertel.replace(/^Das /, '')} erwacht: ${def.gegner}. ${def.regel}`,
      win_text: `${def.gegner} sinkt in den Stein zurück.`,
      lose_to: { map: `o3_${pid}`, spawn: 'default' }, lose_money: 0, lose_text: 'Der Prüfstein lässt dich los. Du kommst am Rand des Viertels zu dir.', flee_text: 'Du weichst vom Prüfstein zurück. Für heute ist er kalt.',
      on_win: {},
    };
    const near = map.spawns.default;
    map.interactables.push({ id: `o3_${pid}_pruefstein`, kind: 'read', tile: freieKachel(map, { near: [near[0] + 7, near[1] + 1] }), prompt: 'Der Prüfstein des Viertels', marker: true, label: 'Prüfstein (Verdauung)', // gut sichtbar rechts vom Eingang, nicht unter der Anzeige am linken Rand
      title: `Prüfstein: ${def.name}`, visible_if: { requires_flags: ['k4_arrived'], requires_pathway: [pid, 4] }, effects: { verdau_probe: pid },
      text: `Ein Stein, der warm ist wie eine Hand. Wer diesen Pfad geht, kann sich ihm einmal am Tag stellen.\n\n${def.regel}\n\nBestanden: 15 % deines Tranks sofort verdaut. Misslungen: 1 bis 5 %. Allein, ein Versuch je Spieltag. Mit jedem Sieg wird der Prüfstein stärker.` });
  }
  return content;
}
