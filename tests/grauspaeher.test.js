// Wexmoor: Gestellt von den Grauspähern darf man kämpfen, aber die Streife besteht aus Beyondern (min_seq 4).
// Seb (2026-11-11): Wer kein Halbgott ist, verliert, auch zu zweit; sonst wären sie keine Gefahr.
// Seb (2026-11-12): aber nicht erzwungen (kein Schadensdeckel, keine Schranke): voller Schaden kommt an, dafür haben
// sie brutal viel Leben und schlagen Nicht-Halbgötter in zwei Treffern um. Verlieren heißt Zelle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { loadContent, fight, talk, seeded, EXPERT, SKILLED, SKILLED_HIT } from './helpers.js';

const content = loadContent();
const ID = 'wx_grauspaeher_fight';
const PATHS = Object.keys(content.pathways);

/** Ermittler in Wexmoor mit allem, was man haben kann: Ossuarklinge, fünf Tonika, Verbände. */
function hero(seq, id = 'eisen', weapon = 'ossuarklinge') {
  const s = new GameState(content);
  s.map = 'wx_torfstich';
  s.flags.add('kapitel1_done');
  s.flags.add('k2_arrived');
  s.addItem(weapon);
  s.equip(weapon);
  s.addItem('tonikum', 5);
  s.addItem('verband', 3);
  s.pathway = { id, seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  return s;
}

/** Zwei Spieler, beide gleich gut ausgerüstet, Spieler 2 auf eigenem Pfad. */
function pair(seq, id1 = 'eisen', id2 = 'laterne') {
  const s = hero(seq, id1);
  s.addP2();
  s.withPlayer(2, () => {
    s.addItem('ossuarklinge');
    s.equip('ossuarklinge');
    s.addItem('tonikum', 5);
    s.addItem('verband', 2);
    s.pathway = { id: id2, seq, digestion: 0 };
    s.updateMaxHp();
    s.hp = s.maxHp;
  });
  return s;
}

/** Bester Versuch: jede Fertigkeit, verkettet oder nicht, mit sehr guter oder guter Deckung. */
function bestTry(mk) {
  const skills = [...Object.keys(mk().pathwaySkills()), 'attack', 'double'];
  let best = null;
  for (const skill of skills) for (const chain of [false, true]) for (const defend of [EXPERT, SKILLED]) {
    const s = mk();
    const { result, combat } = fight(s, ID, { defend, attack: SKILLED_HIT, skill, chain, healBelow: Math.round(s.maxHp * 0.5) }); // heilt wie ein Mensch: bei halbem Leben
    const r = { won: result.outcome === 'won', round: combat.round, hpLeft: combat.enemy.hp, state: s };
    if (!best || (r.won && !best.won) || (r.won === best.won && (r.won ? r.round < best.round : r.hpLeft < best.hpLeft))) best = r;
  }
  return best;
}

test('Regeln: in Wexmoor darf man sich der Streife stellen, in Kettlegate nicht', () => {
  assert.equal(content.polices.wexmoor.resist, ID);
  assert.equal(content.polices.wexmoor.resist_dialogue, 'wx_festnahme');
  assert.ok(content.dialogues.wx_festnahme);
  assert.equal(content.polices.kettlegate.resist, undefined);
  const e = content.encounters[ID];
  assert.equal(e.min_seq, 4, 'nur Halbgötter (Sequenz 4) richten etwas aus');
  assert.equal(e.fleeable, true);
  assert.equal(e.flee_rounds, 2, 'wer gestellt ist, läuft nicht einfach weg: zwei Runden durchhalten');
  assert.equal(e.on_flee.wanted, 2, 'Flucht vor der Streife macht dich gesucht');
  assert.ok(e.hp >= content.encounters.leuchtfeuer.hp * 2.5, 'brutal viel Leben: mehr als das Doppelte eines Kapitelbosses');
  assert.equal(e.max_round_dmg, undefined, 'kein Schadensdeckel (Seb: fühlt sich erzwungen an)');
  assert.equal(e.ward, false, 'keine Sequenz-Schranke: der Spieler macht vollen Schaden');
  assert.ok(e.armor >= 3 && e.ramp > 0, 'Panzer und Steigerung');
  assert.ok(e.attacks.some((a) => a.action === 'heal'), 'die Salbe macht Nadelstiche zunichte');
});

test('Voller Schaden, aber zwei Treffer legen jeden Nicht-Halbgott um; Tricks prallen an ihnen ab', () => {
  const c = new Combat(hero(7), ID);
  assert.equal(c.wardMult(), 1, 'kein Bruchteil-Schaden mehr');
  assert.equal(c.maxRoundDmg, 0);
  const before = c.enemy.hp;
  c.hurtEnemy(100);
  assert.equal(before - c.enemy.hp, 100 - c.armor, 'ein Treffer zieht voll ab (nur Panzer)');
  // Dienstgriff: jeder Treffer nimmt Sequenz 5–7 mindestens die Hälfte der Leben; der Wachsknüppel Seq 6/7 die Hälfte, Seq 5 ein Drittel
  for (const seq of [7, 6, 5]) {
    const s = hero(seq);
    const k = new Combat(s, ID);
    for (const [name, share] of [['Wachsknüppel', seq === 5 ? 1 / 3 : 1 / 2], ['Dienstgriff', 1 / 2]]) {
      const atk = k.prepareAttack(k.enc.attacks.find((a) => a.name === name));
      const taken = Math.round(atk.damage * s.passive('damage_taken'));
      assert.ok(taken >= s.maxHp * share, `${name} gegen Seq ${seq}: ${taken} von ${s.maxHp} Leben`);
    }
  }
  // Ein Halbgott steckt deutlich mehr weg
  const h = hero(4);
  const k4 = new Combat(h, ID);
  const griff = k4.prepareAttack(k4.enc.attacks.find((a) => a.name === 'Dienstgriff'));
  assert.ok(Math.round(griff.damage * h.passive('damage_taken')) < h.maxHp / 3, 'Halbgott: ein Dienstgriff ist kein Drittel');
  // Rollentausch (Maske) und Laternenblende: unter Sequenz 4 lassen sich die Grauspäher nicht verwirren oder betäuben
  const m = new Combat(hero(5, 'maske'), ID);
  m.rng = seeded(1);
  m.useSkill('rollentausch', ['perfect']);
  assert.equal(m.confused, false);
  const b = new Combat(hero(5, 'laterne'), ID);
  b.rng = seeded(1);
  b.useSkill('blind', ['perfect']);
  assert.equal(b.stunned, false);
  const m4 = new Combat(hero(4, 'maske'), ID);
  m4.rng = seeded(1);
  m4.useSkill('rollentausch', ['perfect']);
  assert.equal(m4.confused, true, 'ein Halbgott verwirrt sie sehr wohl');
});

test('Gestellt: Gespräch mit Widerstand oder Mitgehen; Mitgehen ist die normale Festnahme', () => {
  const s = hero(7);
  s.money = 100;
  const path = talk(s, 'wx_festnahme', ['Mitgehen']);
  assert.deepEqual(path, ['start', 'mitgehen']);
  assert.equal(s.arrests, 1);
  assert.equal(s.money, 75, 'normale Beschlagnahme');
  assert.ok(s.flags.has('k2_in_cell'));
  assert.deepEqual(s.pendingTravel, { map: 'wx_zelle', spawn: 'default' });
  const k = hero(7);
  talk(k, 'wx_festnahme', ['Widerstand']);
  assert.equal(k.pendingCombat, ID, 'Widerstand startet den Kampf');
  assert.equal(k.arrests, 0);
  // Halbgötter bekommen eine eigene Begrüßung
  assert.equal(talk(hero(4), 'wx_festnahme', [])[0], 'start_halbgott');
  assert.equal(talk(hero(5), 'wx_festnahme', [])[0], 'start');
});

test('Verloren: Zelle, doppelte Beschlagnahme, Fahndungsstufe 2', () => {
  const s = hero(7);
  s.money = 100;
  const { result } = fight(s, ID, { defend: EXPERT, attack: SKILLED_HIT, skill: 'double', healBelow: 40 });
  assert.equal(result.outcome, 'lost');
  assert.deepEqual(result.travel, { map: 'wx_zelle', spawn: 'default' }, 'der Kampf selbst schickt dich in die Zelle, nicht erst das Fenster');
  assert.equal(s.arrests, 1);
  assert.equal(s.money, 50, 'Widerstand kostet das Doppelte');
  assert.equal(s.wanted, 2);
  assert.ok(s.flags.has('k2_in_cell'));
  assert.equal(s.pendingTravel, null, 'kein zweiter Ortswechsel nach dem Fenster');
  assert.ok(s.hp > 0);
});

test('Unter Sequenz 4 verliert jeder Pfad, allein wie zu zweit, auch mit bester Ausrüstung', () => {
  for (const seq of [7, 6, 5]) {
    for (const pid of PATHS) {
      const solo = bestTry(() => hero(seq, pid));
      assert.equal(solo.won, false, `${pid} Seq ${seq} allein darf die Streife nicht schaffen`);
      const duo = bestTry(() => pair(seq, pid, pid === 'laterne' ? 'eisen' : 'laterne'));
      assert.equal(duo.won, false, `${pid} Seq ${seq} zu zweit darf die Streife nicht schaffen (Rest ${duo.hpLeft})`);
    }
  }
});

test('Halbgötter (Sequenz 4) schaffen die Streife, allein und zu zweit; danach sucht die ganze Stadt', () => {
  for (const pid of PATHS) {
    const r = bestTry(() => hero(4, pid));
    assert.equal(r.won, true, `${pid} Seq 4 schafft die Streife`);
    assert.ok(r.round <= 30, `${pid}: zäh, aber kein Ende offen (${r.round} Runden)`);
  }
  const duo = bestTry(() => pair(4));
  assert.equal(duo.won, true);
  const s = duo.state;
  assert.equal(s.wanted, content.polices.wexmoor.max_level, 'Widerstand mit Erfolg: Höchststufe');
  assert.ok(s.flags.has('k2_grauspaeher_besiegt'));
  assert.equal(s.arrests, 0);
  // Zu zweit schlägt die Streife voll zu (keine Duo-Milderung für höhere Wesen)
  assert.equal(new Combat(pair(4), ID).duoFull, true);
});
