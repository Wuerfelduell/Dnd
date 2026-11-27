/**
 * Sequenz 3 bis 1 (Seb, 2026-11-12): je Pfad Formel, Trank und Ritual. Die Regeln stehen in core/SeqHoch.js.
 * Läuft nach applySeq4 in buildContent.
 *
 * Standard wie bei Sequenz 4: ortsunabhängig, solo, Fehlschlag −17 % Verdauung und +10 Unruhe, beliebig wiederholbar.
 * Jedes Ritual ist mindestens doppelt so schwer wie das vorige und funktioniert anders, nur das Thema bleibt.
 * Seb 2026-11-26 („immer nach oben“, Aufbau siehe HOCH): 3 Kette + Pfadschritt + Heiligenwächter, 2 Weltwandel + Kette +
 * Pfadschritt + Grenzwächter, 1 nahezu unmöglich: langer Schritt ohne Kampf + Kette + Grenz- und Engelswächter am Stück.
 *
 * Sequenz 3 (Seb 2026-11-12, nach #411 umgebaut): Trankformel und Ritualformel getrennt, beide beim Gildenkrämer 30 000 oder ab Seq 4 zufällig je Zirkeltreffen (Seb 2026-11-26),
 * sehr seltene Monster-Beute). Man tritt der Gilde seines Pfades bei (Sitz o3_<pfad>), die Kernzutat 3 gibt nur ihr Oberhaupt.
 * Im Sitz liegen außerdem die Formeln der 2 (Archiv nach dem Oberhaupt) und der 1 (fünf Inschriften).
 */
import { seeded } from '../core/Gatherings.js';
import { NACHBARPFADE } from './nachbarpfade.js';
import { pfadAngriffe, beyonderSatz } from './gegnerBeyonder.js';

/** Kernzutat eines Pfades für Sequenz n (Paket AF: sq_zutat_<pfad ohne sq_>_<n>). */
export const kernzutat = (pid, n) => `sq_zutat_${pid.replace(/^sq_/, '')}_${n}`;
/** Seb (2026-11-12): Seq 3 hat Trankformel (formel_<pfad>_3) und Ritualformel getrennt, „immerhin wirst du ein Heiliger“. */
export const ritualformel = (pid) => `ritualformel_${pid}_3`;
/** Vor applyDunscarZirkel: die Ritualformeln als Gegenstände (gleich selten und teuer wie die Trankformel). */
export function addRitualformeln(content) {
  for (const [pid, p] of Object.entries(content.pathways)) {
    const r = p.seqs?.[3]?.ritual;
    if (!r || content.items[ritualformel(pid)]) continue;
    content.items[ritualformel(pid)] = { name: `Ritualformel: ${p.seqs[3].name}`, kind: 'trophy', weight: 0, price: 0, pathway: pid,
      desc: `Die Ritualformel der dritten Sequenz (${p.name}). Ohne sie lässt sich das Ritual nicht beginnen; die Trankformel allein reicht nicht.` };
  }
}
export const gildeFlag = (pid, what) => `gilde_${pid}_${what}`; // bekannt, mitglied, chef, chef_tot

/** Seb (2026-11-12): Seq 3 und 2 passen, Seq 1 ist noch nicht abgestimmt und bleibt bis dahin versiegelt. */
export const HOCH_SEQ1_VERSIEGELT = false; // Seb 2026-11-26: Seq 1 neu gebaut und freigegeben
/** Seb 2026-11-27: Wer in Varrowmouth auf Sequenz 1 verzichtet (k6_ende_verbrennen/k6_ende_teilen), dem bleibt sie für immer verschlossen. */
export const SEQ1_VERZICHT_FLAG = 'k6_seq1_verzicht';
export const SEQ1_VERZICHT_TEXT = 'Du hast in Varrowmouth auf die erste Sequenz verzichtet. Dieser Weg ist für immer verschlossen.';
export const HOCH_FAIL_PCT = 17;
export const HOCH_FAIL_UNRUHE = 10;
/** Gegner im Ritual der Sequenz 3 (gestärkt) und Grenzwächter der Sequenz 2 (brutal). */
export const HOCH_SCALE = { 3: { hp: 2.6, dmg: 1.9 }, 2: { hp: 3.4, dmg: 2.1 }, 1: { hp: 4.4, dmg: 2.4 } }; // Seb 2026-11-12/26: je Stufe schwerer
export const GRENZ_SCALE = { hp: 5.5, dmg: 1.1 }; // Seb 2026-11-26: schwer, aber nicht unmöglich (vorher 10/1,8)
/** Seq 1: derselbe Grenzwächter, aber härter, weil gleich danach der Engelswächter kommt. */
export const GRENZ_SCALE_1 = { hp: 12, dmg: 2 };
/**
 * Wächter der Rituale 3 bis 1 (Seb 2026-11-26): Körper vom Schwellen- bzw. Grenzwächter (data/sequenzen.js), kämpfen mit
 * den Fertigkeiten deines Pfades (machBeyonder). `scale` wirkt im Ritual auf die Daten des Körpers.
 */
export const HOCH_WAECHTER = {
  heilig: { id: (pid) => `hg_heiligenwaechter_${pid}`, from: 'hg_schwellenwaechter', titel: 'Heiligenwächter', seq: 3, scale: { hp: 3.2, dmg: 1.6 } },
  grenz: { id: (pid) => `hg_grenzwaechter_${pid}`, from: 'hg_grenzwaechter', titel: 'Grenzwächter', seq: 2, scale: GRENZ_SCALE },
  engel: { id: (pid) => `hg_engelswaechter_${pid}`, from: 'hg_grenzwaechter', titel: 'Engelswächter', seq: 1, scale: { hp: 15, dmg: 2.3 } },
};
/** Spuren zum Ort: Chance je Sieg in einem Monstergebiet ab Kapitel 3, so viele braucht man. */
export const SPUR_CHANCE = 0.2;
export const SPUREN = 3;
/** Seq-2-Weltwandel: je aktivem Wandel werden alle Gegner so viel stärker (bleibt für immer). */
export const WELT_MULT = { hp: 0.3, dmg: 0.2 };

const K = (n, ziel, rules, text, extra = {}) => ({ type: 'kampf', n, ziel, rules, text, ...extra });
const Z = (sek, need, forbid, text, extra = {}) => ({ type: 'zeit', sek, need, forbid, text, ...extra });
const P = (kind, n, text) => ({ type: 'probe', kind, n, text });
const O = (what, text) => ({ type: 'opfer', ...what, text });
const W = (text) => ({ type: 'welt', text });
/** Wächter: `w` heilig (Seq 3), grenz (Seq 2 und 1), engel (Seq 1). Jeder kämpft mit den Fertigkeiten deines eigenen Pfades. */
const G = (w, rules, text, extra = {}) => ({ type: 'waechter', w, rules, text, ...extra });

/**
 * Seb (2026-11-26): Seq 3 bis 1 neu, „immer nach oben“. Jede Stufe hat mehr Schritte, größere Ketten, stärkere Gegner
 * und am Ende Wächter, die mit deinem eigenen Pfad kämpfen. Alles in jedem Monstergebiet ab Dunscar ausführbar
 * (Dunscar, Calderwick, Briarholt, Gildensitze), keine Bindung an einen Ort.
 * - Sequenz 3 (schwer, machbar): Kampfkette gegen Zweiergruppen unter der Pfadregel, Pfadschritt, Heiligenwächter.
 * - Sequenz 2 (schwerer, machbar): Weltwandel, Kette gegen Dreiergruppen, Pfadschritt, Grenzwächter.
 * - Sequenz 1 (nahezu unmöglich): langer Schritt ohne Kampf, doppelter Pfadschritt, lange Kette gegen Dreiergruppen,
 *   dann Grenzwächter und Engelswächter hintereinander, ohne Heilung dazwischen.
 * Gruppen: `gruppe: n` gibt dem Gegner n Begleiter (Combat, PR #547). Kampfregeln (Combat.js): noItems, noParry, noDodge,
 * noHeal, spare, maxRounds, minKillRound, startHp, decayPct, minItems, endMin {hp, nerves}, gruppe. Zeitbedingungen
 * (need: Timer läuft nur dann, forbid: bricht die Prüfung): danger, vision, form, noArtifacts, load, unruhe; forbid combat.
 * Schrittzusatz noHealAll: keine Heilung, auch außerhalb des Kampfes.
 */
export const HOCH = {
  laterne: {
    3: { name: 'Das Licht, das nur Okkultes trifft', steps: [
      K(8, 'okkult', { noItems: true, noParry: true, gruppe: 1 }, 'Acht okkulte Zweiergruppen besiegen, ohne Gegenstände und ohne Parade'),
      Z(180, ['danger', 'vision'], [], '180 Sekunden Geistsicht in Monstergebieten'),
      G('heilig', { noItems: true }, 'Den Heiligenwächter besiegen, ohne Gegenstände')] },
    2: { name: 'Die ewige Dämmerung', welt: { titel: 'Ewige Dämmerung', farbe: 0x3a2a10, alpha: 0.16, wanted: 1, text: 'Über allen Städten hängt ein bernsteinfarbenes Zwielicht. Die Sonne geht nicht mehr ganz auf, und was im Dunkeln lebt, wird mutiger.', gerede: 'Seit dem Tag mit dem bernsteinfarbenen Himmel wird es nicht mehr richtig hell. Die Laternenanzünder arbeiten jetzt rund um die Uhr.' },
      steps: [W('Die ewige Dämmerung über die Welt legen'),
        K(8, 'okkult', { noItems: true, noParry: true, gruppe: 2 }, 'Acht okkulte Dreiergruppen besiegen, ohne Gegenstände und ohne Parade'),
        Z(600, ['danger', 'vision'], [], '600 Sekunden Geistsicht in Monstergebieten'),
        G('grenz', { noItems: true, noParry: true }, 'Den Grenzwächter besiegen, ohne Gegenstände und ohne Parade')] },
    1: { name: 'Das Licht ohne Schatten', steps: [
      Z(1500, ['danger', 'vision'], ['combat'], '1500 Sekunden Geistsicht in Monstergebieten, ohne einen einzigen Kampf'),
      K(15, 'okkult', { noItems: true, noParry: true, gruppe: 2 }, 'Fünfzehn okkulte Dreiergruppen in Folge, ohne Gegenstände und ohne Parade'),
      G('grenz', { noItems: true, noParry: true }, 'Den Grenzwächter besiegen, ohne Gegenstände und ohne Parade', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { noItems: true, noParry: true }, 'Sofort danach den Engelswächter, ohne Heilung dazwischen', { noHealAll: true })] },
  },
  faden: {
    3: { name: 'Der Faden reißt nicht zurück', steps: [
      K(6, 'wild', { noHeal: true, gruppe: 1 }, 'Sechs Zweiergruppen in Folge besiegen, ohne jede Heilung, auch nicht dazwischen', { noHealAll: true }),
      P('faden', 5, 'Fünf Fadenproben ohne einen Fehler'),
      G('heilig', { noDodge: true }, 'Den Heiligenwächter besiegen, ohne auszuweichen')] },
    2: { name: 'Das gespannte Netz', welt: { titel: 'Gespanntes Netz', farbe: 0x4a2a5a, alpha: 0.12, wanted: 1, text: 'Über alle Gassen spannen sich unsichtbare Fäden. Menschen stolpern über Entscheidungen, die sie nie getroffen haben, und Wesen finden ihre Beute schneller.', gerede: 'Alle reden von Zufällen, die keine sind. Mein Nachbar hat dreimal am selben Tag denselben Fremden getroffen.' },
      steps: [W('Das Netz über die Welt spannen'),
        K(6, 'wild', { noHeal: true, gruppe: 2 }, 'Sechs Dreiergruppen in Folge, ohne jede Heilung, auch nicht dazwischen', { noHealAll: true }),
        P('faden', 10, 'Zehn Fadenproben ohne einen Fehler'),
        G('grenz', { noDodge: true }, 'Den Grenzwächter besiegen, ohne auszuweichen')] },
    1: { name: 'Das Garn aller Leben', steps: [
      P('faden', 25, 'Fünfundzwanzig Fadenproben ohne einen Fehler'),
      K(10, 'wild', { noHeal: true, gruppe: 2 }, 'Zehn Dreiergruppen in Folge, ohne jede Heilung, auch nicht dazwischen', { noHealAll: true }),
      G('grenz', { noDodge: true, noHeal: true }, 'Den Grenzwächter besiegen, ohne auszuweichen und ohne Heilung', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { noDodge: true, noHeal: true }, 'Sofort danach den Engelswächter, ohne Heilung dazwischen', { noHealAll: true })] },
  },
  maske: {
    3: { name: 'Hundert Gesichter, kein Toter', steps: [
      K(12, 'wild', { spare: true, noDodge: true }, 'Zwölf Gegner unter 15 % Leben verschonen statt töten, ohne Ausweichen'),
      Z(300, ['danger', 'noArtifacts'], ['combat'], '300 Sekunden in Monstergebieten ohne Artefakt und ohne Kampf'),
      G('heilig', { noParry: true }, 'Den Heiligenwächter besiegen, ohne Parade')] },
    2: { name: 'Die Welt ohne Gesicht', welt: { titel: 'Welt ohne Gesicht', farbe: 0x5a4a5a, alpha: 0.12, wanted: 2, text: 'Niemand erkennt mehr ganz sicher den anderen. Die Wachen misstrauen jedem Gesicht und greifen härter durch.', gerede: 'Meine eigene Schwester stand vor der Tür, und ich war mir nicht sicher, ob sie es ist. Die Wache kontrolliert jetzt jeden.' },
      steps: [W('Allen Gesichtern die Sicherheit nehmen'),
        K(16, 'wild', { spare: true, noDodge: true }, 'Sechzehn Gegner unter 15 % Leben verschonen statt töten, ohne Ausweichen'),
        Z(90, ['form'], [], '90 Sekunden am Stück in deiner mythischen Gestalt'),
        G('grenz', { noParry: true }, 'Den Grenzwächter besiegen, ohne Parade')] },
    1: { name: 'Niemand', steps: [
      Z(1200, ['danger', 'noArtifacts'], ['combat'], '1200 Sekunden in Monstergebieten ohne Artefakt und ohne Kampf'),
      K(25, 'wild', { spare: true, noDodge: true, noParry: true }, 'Fünfundzwanzig Gegner verschonen, ohne Ausweichen und ohne Parade'),
      G('grenz', { noParry: true, noDodge: true }, 'Den Grenzwächter besiegen, ohne Parade und ohne Ausweichen', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { noParry: true }, 'Sofort danach den Engelswächter, ohne Heilung dazwischen', { noHealAll: true })] },
  },
  echo: {
    3: { name: 'Der letzte Ton', steps: [
      K(8, 'wild', { maxRounds: 5, gruppe: 1 }, 'Acht Zweiergruppen in Folge, jede in höchstens fünf Runden besiegt'),
      P('echo', 5, 'Fünf Stimmenprüfungen ohne einen Fehler'),
      G('heilig', { maxRounds: 30 }, 'Den Heiligenwächter in höchstens 30 Runden besiegen')] },
    2: { name: 'Die laute Welt', welt: { titel: 'Laute Welt', farbe: 0x203a4a, alpha: 0.12, wanted: 1, text: 'Jedes Geräusch trägt doppelt so weit. Wesen hören dich kommen, und in den Städten schläft niemand mehr ruhig.', gerede: 'Man hört das Flüstern drei Straßen weiter. Die Hunde bellen die ganze Nacht.' },
      steps: [W('Den Klang der Welt aufreißen'),
        K(8, 'wild', { maxRounds: 5, gruppe: 2 }, 'Acht Dreiergruppen in Folge, jede in höchstens fünf Runden besiegt'),
        P('echo', 10, 'Zehn Stimmenprüfungen ohne einen Fehler'),
        G('grenz', { maxRounds: 25 }, 'Den Grenzwächter in höchstens 25 Runden besiegen')] },
    1: { name: 'Das Echo aller Stimmen', steps: [
      P('echo', 25, 'Fünfundzwanzig Stimmenprüfungen ohne einen Fehler'),
      K(15, 'wild', { maxRounds: 4, gruppe: 2 }, 'Fünfzehn Dreiergruppen in Folge, jede in höchstens vier Runden besiegt'),
      G('grenz', { maxRounds: 20 }, 'Den Grenzwächter in höchstens 20 Runden besiegen', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { maxRounds: 25 }, 'Sofort danach den Engelswächter in höchstens 25 Runden, ohne Heilung dazwischen', { noHealAll: true })] },
  },
  kessel: {
    3: { name: 'Der lebende Kessel', steps: [
      K(8, 'wild', { minItems: 3, gruppe: 1 }, 'Acht Zweiergruppen in Folge, in jedem Kampf mindestens drei Gegenstände benutzt'),
      O({ items: { wurf_spreng: 5, wurf_saeure: 5, wurf_gift: 5 } }, 'Fünfzehn Wurfflaschen in den Kessel geben (je 5 Spreng, Säure, Gift)'),
      G('heilig', { minItems: 4 }, 'Den Heiligenwächter besiegen und dabei mindestens vier Gegenstände benutzen')] },
    2: { name: 'Der vergiftete Brunnen', welt: { titel: 'Vergifteter Brunnen', farbe: 0x2a4a1a, alpha: 0.14, wanted: 1, text: 'Ein grüner Schimmer liegt auf jedem Wasser. Wer trinkt, wird gereizt, und die Wesen der Gebiete fressen sich stark.', gerede: 'Das Wasser schmeckt nach Kupfer und Kräutern. Der Apotheker verkauft keine Tropfen mehr, sagt, er traut seinen eigenen nicht.' },
      steps: [W('Das Wasser der Welt vergiften'),
        K(8, 'wild', { minItems: 3, gruppe: 2 }, 'Acht Dreiergruppen in Folge, in jedem Kampf mindestens drei Gegenstände benutzt'),
        O({ items: { wurf_spreng: 10, wurf_saeure: 10, wurf_gift: 10 } }, 'Dreißig Wurfflaschen in den Kessel geben (je 10 Spreng, Säure, Gift)'),
        G('grenz', { noHeal: true }, 'Den Grenzwächter besiegen, ohne Heilung')] },
    1: { name: 'Der Kessel der Welt', steps: [
      O({ items: { wurf_spreng: 25, wurf_saeure: 25, wurf_gift: 25 } }, 'Fünfundsiebzig Wurfflaschen in den Kessel geben'),
      Z(600, ['unruhe'], ['combat'], '600 Sekunden mit Unruhe 60 oder mehr, ohne Kampf und ohne die Kontrolle zu verlieren'),
      K(15, 'wild', { minItems: 4, gruppe: 2 }, 'Fünfzehn Dreiergruppen in Folge, in jedem Kampf mindestens vier Gegenstände benutzt'),
      G('grenz', { noHeal: true }, 'Den Grenzwächter besiegen, ohne Heilung', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { noHeal: true }, 'Sofort danach den Engelswächter, ohne Heilung dazwischen', { noHealAll: true })] },
  },
  eisen: {
    3: { name: 'Der Amboss', steps: [
      K(6, 'wild', { startHp: 0.25, noHeal: true, gruppe: 1 }, 'Sechs Zweiergruppen, jeder Kampf mit 25 % Leben begonnen, ohne Heilung im Kampf'),
      O({ artefakte: 2 }, 'Zwei Artefakte im Feuer opfern (für immer weg)'),
      G('heilig', { minKillRound: 10, noDodge: true }, 'Den Heiligenwächter besiegen: er fällt nicht vor Runde 10, kein Ausweichen')] },
    2: { name: 'Die eiserne Ordnung', welt: { titel: 'Eiserne Ordnung', farbe: 0x3a3a3a, alpha: 0.14, wanted: 2, text: 'Die Städte verhärten. Mehr Wachen, schwerere Strafen, und selbst die Wesen tragen Panzer aus Rost.', gerede: 'Ausgangssperre ab der zehnten Stunde. Wer ohne Papiere gefunden wird, verschwindet.' },
      steps: [W('Die Welt unter eiserne Ordnung zwingen'),
        K(6, 'wild', { startHp: 0.2, noHeal: true, gruppe: 2 }, 'Sechs Dreiergruppen, jeder Kampf mit 20 % Leben begonnen, ohne Heilung im Kampf'),
        O({ artefakte: 5 }, 'Fünf Artefakte im Feuer opfern (für immer weg)'),
        G('grenz', { minKillRound: 15, noDodge: true }, 'Den Grenzwächter besiegen: er fällt nicht vor Runde 15, kein Ausweichen')] },
    1: { name: 'Die Last der Welt', steps: [
      Z(1500, ['danger', 'load'], ['combat'], '1500 Sekunden mit doppelter Last in Monstergebieten, ohne Kampf'),
      K(10, 'wild', { startHp: 0.15, noHeal: true, gruppe: 2 }, 'Zehn Dreiergruppen, jeder Kampf mit 15 % Leben begonnen, ohne Heilung im Kampf'),
      G('grenz', { minKillRound: 15, noDodge: true }, 'Den Grenzwächter besiegen: er fällt nicht vor Runde 15, kein Ausweichen', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { minKillRound: 20, noDodge: true }, 'Sofort danach den Engelswächter: er fällt nicht vor Runde 20, ohne Heilung dazwischen', { noHealAll: true })] },
  },
  schluessel: {
    3: { name: 'Tausend Türen', steps: [
      Z(480, ['danger'], ['combat'], '480 Sekunden unbemerkt in Monstergebieten (kein Kampf)'),
      K(8, 'wild', { noParry: true, noItems: true, gruppe: 1 }, 'Danach acht Zweiergruppen ohne Parade und ohne Gegenstände'),
      G('heilig', { noItems: true }, 'Den Heiligenwächter besiegen, ohne Gegenstände')] },
    2: { name: 'Alle Schlösser offen', welt: { titel: 'Offene Schlösser', farbe: 0x1a1a3a, alpha: 0.16, wanted: 2, text: 'In einer Nacht springen überall die Schlösser auf. Diebe werden dreist, Wachen nervös, und nichts ist mehr verschlossen, was dich aufhalten könnte.', gerede: 'Alle Türen der Straße standen heute Morgen offen. Nichts fehlte, aber jeder hat seither Angst.' },
      steps: [W('Alle Schlösser der Welt öffnen'),
        K(8, 'wild', { noParry: true, noItems: true, gruppe: 2 }, 'Acht Dreiergruppen ohne Parade und ohne Gegenstände'),
        O({ money: 50000 }, '50 000 Schilling an die Schatten zahlen'),
        G('grenz', { noParry: true, noItems: true }, 'Den Grenzwächter besiegen, ohne Parade und ohne Gegenstände')] },
    1: { name: 'Die letzte Tür', steps: [
      Z(1500, ['danger'], ['combat'], '1500 Sekunden in Monstergebieten ohne Kampf, dabei fünf verschiedene Gebiete betreten', { maps: 5 }),
      K(15, 'wild', { noParry: true, noItems: true, gruppe: 2 }, 'Fünfzehn Dreiergruppen in Folge, ohne Parade und ohne Gegenstände'),
      G('grenz', { noParry: true, noItems: true }, 'Den Grenzwächter besiegen, ohne Parade und ohne Gegenstände', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { noParry: true, noItems: true }, 'Sofort danach den Engelswächter, ohne Heilung dazwischen', { noHealAll: true })] },
  },
  sq_waage: {
    3: { name: 'Das Gleichgewicht', steps: [
      O({ money: 25000 }, '25 000 Schilling auf die Waage legen'),
      K(8, 'wild', { endMin: { hp: 0.5, nerves: 0.5 }, gruppe: 1 }, 'Acht Zweiergruppen, jeder Sieg mit mindestens halbem Leben und halben Nerven beendet'),
      G('heilig', { endMin: { hp: 0.4, nerves: 0 } }, 'Den Heiligenwächter besiegen und dabei über 40 % Leben bleiben')] },
    2: { name: 'Der Preis der Welt', welt: { titel: 'Teure Welt', farbe: 0x4a3a10, alpha: 0.12, wanted: 1, text: 'Jeder Preis kippt. Brot kostet wie Silber, und wer Geld hat, wird gejagt. Die Wesen werden gieriger und stärker.', gerede: 'Ein Laib Brot für den Wochenlohn. Wer jetzt noch Geld hat, sollte es nicht zeigen.' },
      steps: [W('Die Preise der Welt kippen'),
        O({ money: 50000 }, '50 000 Schilling auf die Waage legen'),
        K(8, 'wild', { endMin: { hp: 0.5, nerves: 0.5 }, gruppe: 2 }, 'Acht Dreiergruppen, jeder Sieg mit mindestens halbem Leben und halben Nerven beendet'),
        G('grenz', { endMin: { hp: 0.5, nerves: 0 } }, 'Den Grenzwächter besiegen und dabei über halbem Leben bleiben')] },
    1: { name: 'Die leere Waagschale', steps: [
      O({ money: 100000 }, '100 000 Schilling auf die Waage legen'),
      K(15, 'wild', { endMin: { hp: 0.6, nerves: 0.6 }, gruppe: 2 }, 'Fünfzehn Dreiergruppen, jeder Sieg mit mindestens 60 % Leben und Nerven beendet'),
      G('grenz', { endMin: { hp: 0.5, nerves: 0 } }, 'Den Grenzwächter besiegen und über halbem Leben bleiben', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { endMin: { hp: 0.25, nerves: 0 } }, 'Sofort danach den Engelswächter, über 25 % Leben, ohne Heilung dazwischen', { noHealAll: true })] },
  },
  sq_moor: {
    3: { name: 'Alles verrottet', steps: [
      K(8, 'wild', { decayPct: 0.06, gruppe: 1 }, 'Acht Zweiergruppen in Folge, jede Runde zerfallen 6 % deines Lebens'),
      P('moor', 5, 'Fünf Namensproben ohne einen Fehler'),
      G('heilig', { decayPct: 0.02 }, 'Den Heiligenwächter besiegen, jede Runde zerfallen 2 % deines Lebens')] },
    2: { name: 'Das steigende Moor', welt: { titel: 'Steigendes Moor', farbe: 0x1a2a1a, alpha: 0.16, wanted: 1, text: 'Das Moor kriecht in die Städte. Keller laufen voll, Holz fault in Tagen, und was im Torf schlief, wacht auf.', gerede: 'Unser Keller ist voll Torfwasser. Der Pfarrer sagt, das Moor holt sich zurück, was ihm gehört.' },
      steps: [W('Das Moor in die Welt steigen lassen'),
        K(8, 'wild', { decayPct: 0.08, gruppe: 2 }, 'Acht Dreiergruppen in Folge, jede Runde zerfallen 8 % deines Lebens'),
        P('moor', 10, 'Zehn Namensproben ohne einen Fehler'),
        G('grenz', { decayPct: 0.03 }, 'Den Grenzwächter besiegen, jede Runde zerfallen 3 % deines Lebens')] },
    1: { name: 'Das Gedächtnis des Moores', steps: [
      P('moor', 25, 'Fünfundzwanzig Namensproben ohne einen Fehler'),
      K(15, 'wild', { decayPct: 0.1, gruppe: 2 }, 'Fünfzehn Dreiergruppen in Folge, jede Runde zerfallen 10 % deines Lebens'),
      G('grenz', { decayPct: 0.03 }, 'Den Grenzwächter besiegen, jede Runde zerfallen 3 % deines Lebens', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { decayPct: 0.04 }, 'Sofort danach den Engelswächter, 4 % Zerfall je Runde, ohne Heilung dazwischen', { noHealAll: true })] },
  },
  sq_uhr: {
    3: { name: 'Die stehende Stunde', steps: [
      K(8, 'wild', { minKillRound: 6, maxRounds: 8, gruppe: 1 }, 'Acht Zweiergruppen, jede genau in Runde 6 bis 8 besiegt'),
      P('uhr', 5, 'Fünf Fristproben ohne einen Fehler'),
      G('heilig', { minKillRound: 10, maxRounds: 14 }, 'Den Heiligenwächter genau in Runde 10 bis 14 besiegen')] },
    2: { name: 'Die verrückte Zeit', welt: { titel: 'Verrückte Zeit', farbe: 0x2a2a4a, alpha: 0.12, wanted: 1, text: 'Alle Uhren der Welt gehen falsch. Wachen kommen zu früh, Züge zu spät, und die Wesen sind schneller als ihre Schatten.', gerede: 'Die Rathausuhr hat heute dreimal Mitternacht geschlagen. Keiner weiß mehr, wann die Wache wechselt.' },
      steps: [W('Die Zeit der Welt verrücken'),
        K(8, 'wild', { minKillRound: 6, maxRounds: 8, gruppe: 2 }, 'Acht Dreiergruppen, jede genau in Runde 6 bis 8 besiegt'),
        P('uhr', 10, 'Zehn Fristproben ohne einen Fehler'),
        G('grenz', { minKillRound: 12, maxRounds: 15 }, 'Den Grenzwächter genau in Runde 12 bis 15 besiegen')] },
    1: { name: 'Die Uhr ohne Zeiger', steps: [
      P('uhr', 25, 'Fünfundzwanzig Fristproben ohne einen Fehler'),
      K(15, 'wild', { minKillRound: 7, maxRounds: 7, gruppe: 2 }, 'Fünfzehn Dreiergruppen, jede genau in Runde 7 besiegt'),
      G('grenz', { minKillRound: 12, maxRounds: 15 }, 'Den Grenzwächter genau in Runde 12 bis 15 besiegen', { noHealAll: true, scale: GRENZ_SCALE_1 }),
      G('engel', { minKillRound: 18, maxRounds: 20 }, 'Sofort danach den Engelswächter genau in Runde 18 bis 20, ohne Heilung dazwischen', { noHealAll: true })] },
  },
};

/**
 * Seb (2026-11-12): für Sequenz 3 tritt man der Gilde (Sekte) seines Pfades bei, zehn Gilden ab Dunscar, je eine pro Pfad.
 * Die Kernzutat 3 gibt es nur von der eigenen Gilde: wenn man ihr Oberhaupt tötet oder selbst Oberhaupt wird.
 * Die Formel 3 bleibt selten (Zirkel-Los, sehr seltener Monster-Drop, data/dunscarZirkel.js + PfadHandel). Pfadwechsel (#413):
 * wer auf Sequenz 4 steht, darf auch der Gilde seines Nachbarpfads beitreten. Sitz der Gilde: eigene Karte aus vorhandenen Kacheln.
 */
export const ORTE = {
  laterne: { gilde: 'Der Orden der stillen Flamme', chef: 'Großlampenmeister', name: 'Die gläserne Leuchtkammer', tiles: 'bh_glas_warm', floor: 'g', from: 'bh_kaltes_palmhaus', adj: 'Lichtloser', farbe: '#ffd27a', text: 'Ein Gewächshaus aus Glas, in dem nie ein Licht brennt. Die Scheiben zeigen Bilder von Dingen, die gleich geschehen.' },
  faden: { gilde: 'Die Spinnergilde', chef: 'Erste Spinnerin', name: 'Der Spinnboden', tiles: 'cw_sortierhalle', floor: '.', from: 'cw_sortiergrube', adj: 'Verknoteter', farbe: '#c8a0ff', text: 'Ein Dachboden voller Garn. Jeder Faden führt zu einem Leben, und manche davon zu deinem.' },
  maske: { gilde: 'Die Gesellschaft der hundert Gesichter', chef: 'Gesichtsloser Vorsitz', name: 'Das Haus der leeren Gesichter', tiles: 'cw_druckerei', floor: '.', from: 'cw_alte_setzerei', adj: 'Gesichtsloser', farbe: '#e0c0d0', text: 'Eine Setzerei, in der statt Lettern Gesichter in den Kästen liegen. Keines davon gehört jemandem.' },
  echo: { gilde: 'Der Chor der Schweigenden', chef: 'Stimmführer', name: 'Die Schweigeschlucht', tiles: 'ds_schlucht', floor: 'g', from: 'ds_rufschlucht', adj: 'Stummer', farbe: '#9ad0ff', text: 'Eine Schlucht, die jeden Laut verschluckt und Tage später an anderer Stelle wieder ausspuckt.' },
  kessel: { gilde: 'Die Brühgilde', chef: 'Obersieder', name: 'Der Siedegrund', tiles: 'bh_kessel_warm', floor: 's', from: 'bh_verlassene_waescherei', adj: 'Kochender', farbe: '#a0ff80', text: 'Ein Kesselhaus unter der Erde. Was hier siedet, war einmal lebendig.' },
  eisen: { gilde: 'Die Ambossbruderschaft', chef: 'Schmiedeherr', name: 'Die Schmiede unter dem Fundament', tiles: 'cw_fundament', floor: '.', from: 'cw_nullfundament', adj: 'Genieteter', farbe: '#c0c0c0', text: 'Ein Gewölbe aus Nieten und Ambossen. Jeder Schritt wiegt hier doppelt.' },
  schluessel: { gilde: 'Die Gilde der offenen Türen', chef: 'Türvater', name: 'Das Gewölbe der Türen', tiles: 'g_katakomben', floor: 's', from: 'katakomben', adj: 'Verschlossener', farbe: '#7080ff', text: 'Ein Gang aus Türen, die alle irgendwohin führen, nur nie dorthin, wo man hinwollte.' },
  sq_waage: { gilde: 'Das Haus der rechten Waage', chef: 'Erster Wäger', name: 'Die leere Börse', tiles: 'ds_bahn', floor: '.', from: 'ds_unterschicht', adj: 'Gewogener', farbe: '#ffe080', text: 'Ein Handelssaal ohne Händler. Auf jeder Waage liegt ein Gewicht, das niemandem gehört.' },
  sq_moor: { gilde: 'Die Torfgemeinde', chef: 'Moorälteste', name: 'Der Wurzelgrund', tiles: 'bh_wurzel_kalt', floor: 'g', from: 'bh_wurzelkammer', adj: 'Fauliger', farbe: '#80a060', text: 'Unter den Wurzeln eines alten Baums liegt ein Moor, das nicht nass ist, sondern sich erinnert.' },
  sq_uhr: { gilde: 'Die Zunft der stehenden Stunde', chef: 'Zeitmeister', name: 'Das Stillwerk', tiles: 'ds_bruch', floor: 's', from: 'ds_klopfbruch', adj: 'Stehengebliebener', farbe: '#d0d0ff', text: 'Ein Uhrwerk so groß wie ein Steinbruch. Die Zahnräder stehen, und doch hört man es ticken.' },
};
export const ORT_STAEDTE = ['dunscar', 'calderwick', 'briarholt'];
const SIEGEL = 5;
const INSCHRIFTEN = [
  'Wer bis hierher kam, hat den Weg nicht gefunden. Der Weg hat ihn gefunden.',
  'Die Sequenz über dir ist kein Ziel. Sie ist eine Last, die man tragen lernt.',
  'Drei kamen vor dir. Zwei sind noch hier, in den Wänden.',
  'Der Trank verändert nicht dich. Er zeigt, was du schon warst.',
  'Am Ende steht nicht ein Gott, sondern ein Mensch, der vergessen hat, einer zu sein.',
];

export const ortMap = (pid) => `o3_${pid}`;
export const ortFlag = (pid) => `o3_${pid}_gefunden`;

/** Eigene Fassung des geliehenen Stadtmonsters je Pfad (Skript-Grafik, assets.js O3_VARIANTEN); ohne eigenes Sheet bleibt alles beim Alten. */
const o3Sheet = (e, pid, oberhaupt = false) => (e.sheet ? { sheet: `${e.sheet}__o3${oberhaupt ? 't' : ''}_${pid}` } : {});

/** Gegner eines Ortes: Grundgegner des Quellgebiets, umbenannt und gestärkt, dazu Siegelhüter und Tiefenhüter. */
function ortEncounters(content, pid, o) {
  const src = Object.entries(content.encounters).filter(([, e]) => e.zone === o.from && !e.practice && !/_phase\d$/.test(e.id ?? ''));
  const normal = src.filter(([id, e]) => !e.elite && !e.boss && !/_phase\d$/.test(id)).slice(0, 3);
  const strongest = [...src].filter(([id]) => !/_phase\d$/.test(id)).sort(([, a], [, b]) => b.hp - a.hp)[0];
  if (!normal.length || !strongest) return null;
  const zone = ortMap(pid);
  const lose_to = { map: zone, spawn: 'default' };
  const scale = (e, hp, dmg) => ({ ...e, hp: Math.round(e.hp * hp), attacks: e.attacks.map((a) => (a.action ? a : { ...a, damage: Math.round(a.damage * dmg) })) });
  const base = (e) => {
    const { phase2, phase_next, ...rest } = e;
    return { ...rest, zone, wild: true, occult: true, chapter: 5, tier_seq: 3, lose_to, lose_money: 0, lose_text: 'Der Ort spuckt dich am Eingang wieder aus. Du lebst.', flee_text: 'Du weichst bis zum Eingang zurück.', on_win: {} };
  };
  const out = {};
  const loot = {};
  normal.forEach(([id, e], i) => {
    const nid = `o3_${pid}_g${i + 1}`;
    out[nid] = { ...scale(base(e), 1.4, 1.3), id: nid, name: `${o.adj} ${e.name}`, boss: false, elite: false, ...o3Sheet(e, pid), roam: e.roam ?? { speed: 26, chase: 54, aggro: 78 } };
    loot[nid] = { repeat: true, money: [120, 260], drops: [] };
  });
  for (let i = 0; i < SIEGEL; i++) {
    const [, e] = normal[i % normal.length];
    const nid = `o3_${pid}_siegel${i + 1}`;
    out[nid] = { ...scale(base(e), 3.2, 1.6), id: nid, name: `${i + 1}. Rangprüfung: ${o.adj} ${e.name}`, elite: true, boss: false, ...o3Sheet(e, pid), fleeable: true,
      intro: `${o.gilde}: Wer aufsteigen will, besteht den ${i + 1}. Rang gegen das, was die Gilde hütet. ${o.text}`, win_text: `Der ${i + 1}. Rang ist dein.` };
    loot[nid] = { money: [400, 700], drops: [] };
  }
  const [, b] = strongest;
  out[`o3_${pid}_tiefe`] = { ...scale(base(b), 7, 1.9), id: `o3_${pid}_tiefe`, ...o3Sheet(b, pid, true), name: `${o.chef} der ${o.gilde.replace(/^(Der|Die|Das) /, '')}`, boss: true, elite: false, fleeable: true, max_round_dmg: 0.15,
    intro: `${o.chef} der Gilde erhebt sich. Wer das Oberhaupt besiegt, hält die Kernzutat der dritten Sequenz in der Hand, ob als Mörder oder als Nachfolger.`, win_text: `${o.chef} liegt am Boden. Jetzt entscheidest du: töten oder selbst Oberhaupt werden.` };
  loot[`o3_${pid}_tiefe`] = { money: [2000, 3000], drops: [] };
  return { encounters: out, loot, normal: Object.keys(out).filter((k) => /_g\d$/.test(k)) };
}

/** Karte eines Ortes: 48×30, Wände, Säulen, Siegel im Kreis, Schreine in der Mitte, Inschriften am Rand. */
function ortMapDef(pid, o, enc) {
  const W = 48, H = 30;
  const rng = seeded(`o3|${pid}`);
  const g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 'I' : o.floor)));
  // Säulenblöcke im Raster, mit Lücken
  for (let by = 4; by < H - 4; by += 6) for (let bx = 6; bx < W - 5; bx += 8) {
    if (rng() < 0.25 || (bx > 18 && bx < 30 && by > 8 && by < 20)) continue;
    for (let y = by; y < by + 2; y++) for (let x = bx; x < bx + 3; x++) g[y][x] = 'I';
  }
  const siegel = [[8, 4], [40, 4], [44, 15], [40, 25], [8, 25]];
  const insch = [[4, 9], [24, 2], [44, 9], [24, 27], [4, 20]];
  for (const [tx, ty] of [...siegel, ...insch, [1, 15], [2, 15], [4, 15], [4, 13], [22, 14], [24, 14], [26, 14], [24, 18], [26, 18]]) { // um Siegel, Schreine und Eingang frei
    for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) if (x > 0 && y > 0 && x < W - 1 && y < H - 1) g[y][x] = o.floor;
  }
  const rows = g.map((r) => r.join(''));
  const free = [];
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) if (rows[y][x] !== 'I' && rows[y][x - 1] !== 'I' && rows[y][x + 1] !== 'I') if (Math.abs(x - 2) + Math.abs(y - 15) >= 10) free.push([x, y]);
  const pick = () => free.splice(Math.floor(rng() * free.length), 1)[0];
  const won = (n) => `won_o3_${pid}_siegel${n}`;
  const allSeals = Array.from({ length: SIEGEL }, (_, i) => won(i + 1));
  const nb = NACHBARPFADE[pid];
  const mit = gildeFlag(pid, 'mitglied');
  const chefDone = [gildeFlag(pid, 'chef'), gildeFlag(pid, 'chef_tot')];
  const kern = { [kernzutat(pid, 3)]: 1 };
  const interactables = [
    { id: `o3_${pid}_ausgang`, kind: 'ort3_exit', tile: [1, 15], prompt: 'Den Sitz verlassen', marker: true, label: '← Zurück' },
    { id: `o3_${pid}_bote`, kind: 'read', tile: [4, 13], prompt: `Mitglied von ${o.gilde}`, title: `Ein Mitglied von ${o.gilde}`, marker: true,
      text: `„Die Kernzutat für die dritte Sequenz gibt es nirgends sonst, nicht auf den Treffen, nicht bei den Händlern. Nur hier, beim Oberhaupt. Tritt bei, besteh die fünf Ränge und stell dich ${o.chef}. Töte das Oberhaupt oder werde selbst eins, für den Kern ist es fast dasselbe. Die Formel musst du dir woanders suchen: selten auf den Zirkeln, noch seltener bei Monstern.“` },
    // Beitreten: eigener Pfad, oder ab Sequenz 4 der Nachbarpfad (Pfadwechsel #413)
    ...[[pid, 9], ...(nb ? [[nb, 4]] : [])].map(([req, max], i) => ({ id: `o3_${pid}_beitritt${i ? '_nachbar' : ''}`, kind: 'read', tile: [4, 15], prompt: `${o.gilde} beitreten`, title: o.gilde, marker: true,
      text: `${o.text}\n\nDu legst die Hand auf das Zeichen der Gilde. Ab jetzt gehörst du zu ${o.gilde}. Die fünf Ränge stehen dir offen, und am Ende ${o.chef}.${i ? ' Dein Nachbarpfad öffnet dir diese Tür.' : ''}`,
      effects: { sets_flags: [mit] }, visible_if: { requires_pathway: [req, max], hide_if_flags: [mit] } })),
    ...siegel.map((t, i) => ({ id: `o3_${pid}_siegel${i + 1}`, kind: 'combat', encounter: `o3_${pid}_siegel${i + 1}`, tile: t, prompt: `${i + 1}. Rangprüfung`, marker: true, visible_if: { requires_flags: [mit], hide_if_flags: [won(i + 1)] } })),
    ...insch.map((t, i) => ({ id: `o3_${pid}_inschrift${i + 1}`, kind: 'read', tile: t, prompt: 'Inschrift', title: `${o.name}: Inschrift ${i + 1}`, text: INSCHRIFTEN[i], marker: false, done_flag: `o3_${pid}_gelesen${i + 1}` })),
    { id: `o3_${pid}_tiefe`, kind: 'combat', encounter: `o3_${pid}_tiefe`, tile: [26, 14], prompt: `${o.chef} herausfordern`, marker: true,
      visible_if: { requires_flags: [mit, ...allSeals], hide_if_flags: [`won_o3_${pid}_tiefe`] } },
    { id: `o3_${pid}_chef_toeten`, kind: 'read', tile: [24, 14], prompt: `${o.chef} töten`, title: o.gilde, marker: true,
      text: `Du tötest ${o.chef}. Aus dem Gewand fällt das Kernstück der Gilde: die Kernzutat der dritten Sequenz. Die Gilde schweigt, und keiner wird dir das je verzeihen.`,
      effects: { sets_flags: [gildeFlag(pid, 'chef_tot')], gives_items: kern }, visible_if: { requires_flags: [`won_o3_${pid}_tiefe`], hide_if_flags: chefDone } },
    { id: `o3_${pid}_chef_werden`, kind: 'read', tile: [22, 14], prompt: `Selbst ${o.chef} werden`, title: o.gilde, marker: true,
      text: `Du lässt ${o.chef} leben und nimmst den Platz ein. Mit dem Amt geht dir die Kernzutat der dritten Sequenz zu, die das Oberhaupt verwahrt. Fast dasselbe wie ein Mord, nur dass dich jetzt alle grüßen.`,
      effects: { sets_flags: [gildeFlag(pid, 'chef')], gives_items: kern }, visible_if: { requires_flags: [`won_o3_${pid}_tiefe`], hide_if_flags: chefDone } },
    { id: `o3_${pid}_schrein2`, kind: 'read', tile: [26, 18], prompt: 'Das Archiv des Oberhaupts', title: `${o.gilde}: das Archiv`, marker: true,
      text: 'Hinter dem Sitz des Oberhaupts liegt das Archiv. Darin die Formel der zweiten Sequenz, mit einer Warnung am Rand: Wer sie braut, verändert die Welt.',
      done_flag: `o3_${pid}_formel2`, effects: { gives_items: { [`formel_${pid}_2`]: 1 } }, visible_if: { requires_flags: [`won_o3_${pid}_tiefe`], hide_if_flags: [`o3_${pid}_formel2`] } },
    { id: `o3_${pid}_schrein1`, kind: 'read', tile: [24, 18], prompt: 'Der letzte Schrein', title: `${o.name}: der letzte Schrein`, marker: true,
      text: 'Die fünf Inschriften fügen sich zu einem Satz, und der Boden öffnet sich. Im letzten Schrein liegt die Formel der ersten Sequenz. Sie ist kurz. Fast zu kurz.',
      done_flag: `o3_${pid}_formel1`, effects: { gives_items: { [`formel_${pid}_1`]: 1 } },
      visible_if: { requires_flags: [`o3_${pid}_formel2`, ...insch.map((_, i) => `o3_${pid}_gelesen${i + 1}`)], hide_if_flags: [`o3_${pid}_formel1`] } },
  ];
  const roamers = Array.from({ length: 12 }, (_, i) => ({ id: `o3_${pid}_streife${i + 1}`, encounter: enc.normal[i % enc.normal.length], tile: pick(), elite_chance: 0 })).filter((r) => r.tile);
  return {
    id: ortMap(pid), name: o.name, city: 'ort3', danger: true, tiles: o.tiles, rows, spawns: { default: [2, 15] },
    lights: [{ tile: [2, 15], radius: 60, intensity: 0.6, color: o.farbe, glow: 0.2 }, { tile: [24, 15], radius: 90, intensity: 0.8, color: o.farbe, glow: 0.3, flicker: 0.1 }],
    ambient: { night: 0.82, fog: 0.22 }, interactables, roamers,
  };
}

/** Nach applySeq4: Rituale 3 bis 1 umbauen, Orte anlegen, Weltwandel-Gerede, Kittering ohne Formeln 3 bis 1. */
export function applySeqHoch(content) {
  const pathways = {};
  for (const [pid, p] of Object.entries(content.pathways)) {
    const def = HOCH[pid];
    if (!def) { pathways[pid] = p; continue; }
    const seqs = { ...p.seqs };
    for (const n of [3, 2, 1]) {
      const r = seqs[n]?.ritual;
      if (!r || !def[n]) continue;
      const { map, also_maps, vision, requires, ordeal, ...rest } = r;
      const req = { ...(requires ?? {}) };
      delete req.requires_flags;
      seqs[n] = { ...seqs[n], ritual: { ...rest, name: def[n].name, hoch: { seq: n, pid, steps: def[n].steps, welt: def[n].welt ?? null }, ...(Object.keys(req).length ? { requires: req } : {}) } };
    }
    pathways[pid] = { ...p, seqs };
  }
  content.pathways = pathways;
  // Wächter der Rituale 3 bis 1: eigene Kämpfe aus den Körpern der Schwellen-/Grenzwächter, mit den Fertigkeiten des Pfades
  for (const pid of Object.keys(HOCH)) {
    const p = content.pathways[pid];
    if (!p) continue;
    for (const w of Object.values(HOCH_WAECHTER)) {
      const id = w.id(pid);
      const body = content.encounters[`${w.from}_${pid}`];
      if (!body) continue;
      if (id !== `${w.from}_${pid}`) {
        const was = p.name.replace('Pfad der', 'der').replace('Pfad des', 'des');
        content.encounters[id] = { ...body, id, name: `${w.titel} ${was}`,
          intro: `${body.intro ?? ''}\n\nDer ${w.titel} steht eine Stufe über allem, was du bisher gesehen hast.` };
      }
      // Pfad-Fertigkeiten kommen zu den eigenen Angriffen dazu (Welle und Zorn-Phase des Körpers bleiben)
      const e = content.encounters[id];
      // Eigenes Kampfblatt je Pfad (tools/art/claude_code/waechter_varianten.py): Heiligen-/Engelswächter in der geweihten Fassung
      if (e.sheet === w.from || e.sheet === `${w.from}__w_${pid}`) e.sheet = `${w.from}__w${id !== `${w.from}_${pid}` ? 't' : ''}_${pid}`;
      if (e.beyonder) continue;
      const extra = pfadAngriffe(content, pid, w.seq, e);
      const mit = (list) => [...(list ?? []).filter((a) => !a.pfad), ...extra];
      content.encounters[id] = { ...e, beyonder: true, beyonder_pfad: pid, beyonder_seq: w.seq, attacks: mit(e.attacks),
        ...(e.phase2?.attacks ? { phase2: { ...e.phase2, attacks: mit(e.phase2.attacks) } } : {}),
        intro: `${e.intro ?? ''}\n\n${beyonderSatz(content, pid, w.seq)}` };
    }
  }
  // Orte
  const maps = { ...content.maps };
  const encounters = { ...content.encounters };
  const loot = { ...content.loot };
  const travel = [...content.travel];
  for (const [pid, o] of Object.entries(ORTE)) {
    if (!content.pathways[pid] || maps[ortMap(pid)]) continue;
    const enc = ortEncounters(content, pid, o);
    if (!enc) continue;
    Object.assign(encounters, enc.encounters);
    Object.assign(loot, enc.loot);
    maps[ortMap(pid)] = ortMapDef(pid, o, enc);
    // kein Eintrag unter content.zones: die Orte sind keine Gefahrengebiete mit Gebietsboss und Elite-Beute
    ORT_STAEDTE.forEach((city) => {
      const c = content.travelRules?.cities?.[city];
      if (c?.pins) c.pins = { ...c.pins, [ortMap(pid)]: [24 + 38 * Object.keys(ORTE).indexOf(pid), 248] };
    });
    for (const city of ORT_STAEDTE) travel.push({ map: ortMap(pid), spawn: 'default', city, name: `${o.gilde} (${o.name})`, desc: `Sitz: ${o.gilde} (${content.pathways[pid].name}). ${o.text}`, requires_flags: [gildeFlag(pid, 'bekannt')] });
  }
  Object.assign(content, { maps, encounters, loot, travel });
  // Seb (2026-11-12): die Kernzutat 3 gibt es nur von der eigenen Gilde. Andere Gesprächsausgaben der Kern-3-Zutat fallen weg.
  const kern3 = /^sq_zutat_\w+_3$/;
  for (const d of Object.values(content.dialogues)) {
    const gives3 = new Set(Object.entries(d.nodes ?? {}).filter(([, n]) => Object.keys(n.gives_items ?? {}).some((id) => kern3.test(id))).map(([id]) => id));
    if (!gives3.size) continue;
    for (const n of Object.values(d.nodes)) if (n.choices) n.choices = n.choices.filter((c) => !gives3.has(c.next));
  }
  // dasselbe für die Koop-Ansprüche (Paket BG): Bosse zahlen keine Kernzutat 3 mehr aus
  if (content.claimSources) {
    content.claimSources = Object.fromEntries(Object.entries(content.claimSources).map(([id, c]) => [id, { ...c, rewards: (c.rewards ?? []).filter((r) => !kern3.test(r.item)) }]));
  }
  // Weltwandel: Gerede in allen späteren Städten
  content.gossip ??= {};
  for (const [pid, d] of Object.entries(HOCH)) {
    const w = d[2]?.welt;
    if (!w?.gerede) continue;
    for (const city of ORT_STAEDTE) {
      const own = content.gossip[city];
      if (!own) continue;
      for (const map of Object.keys(own)) own[map] = [...own[map], { text: w.gerede, requires_flags: [`weltwandel_${pid}`] }];
    }
  }
  return content;
}
