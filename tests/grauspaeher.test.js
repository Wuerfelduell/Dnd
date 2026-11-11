// Wexmoor: Gestellt von den Grauspähern darf man kämpfen, aber die Streife besteht aus Beyondern (min_seq 4).
// Seb (2026-11-11): Wer kein Halbgott ist, verliert, auch zu zweit; sonst wären sie keine Gefahr.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, fight, talk, EXPERT, SKILLED, SKILLED_HIT } from './helpers.js';

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
    const { result, combat } = fight(s, ID, { defend, attack: SKILLED_HIT, skill, chain, healBelow: 25 });
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
  assert.equal(e.fleeable, false, 'wer gestellt ist, läuft nicht einfach weg');
  assert.ok(e.hp >= content.encounters.leuchtfeuer.hp * 0.9, 'so zäh wie ein Kapitelboss');
  assert.ok(e.armor >= 3 && e.ramp >= 0.05 && e.max_round_dmg, 'Panzer, Steigerung und Schadensgrenze');
  assert.ok(e.attacks.some((a) => a.action === 'heal'), 'die Salbe macht Nadelstiche zunichte');
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
  const { result } = fight(s, ID, { defend: EXPERT, attack: SKILLED_HIT, skill: 'double', healBelow: 25 });
  assert.equal(result.outcome, 'lost');
  assert.equal(s.arrests, 1);
  assert.equal(s.money, 50, 'Widerstand kostet das Doppelte');
  assert.equal(s.wanted, 2);
  assert.ok(s.flags.has('k2_in_cell'));
  assert.deepEqual(s.pendingTravel, { map: 'wx_zelle', spawn: 'default' });
  assert.ok(s.hp > 0);
});

test('Unter Sequenz 4 verliert jeder Pfad, allein wie zu zweit, auch mit bester Ausrüstung', () => {
  for (const seq of [7, 5]) {
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
    assert.ok(r.round <= 14, `${pid}: ein Halbgott braucht keine Ewigkeit (${r.round} Runden)`);
  }
  const duo = bestTry(() => pair(4));
  assert.equal(duo.won, true);
  const s = duo.state;
  assert.equal(s.wanted, content.polices.wexmoor.max_level, 'Widerstand mit Erfolg: Höchststufe');
  assert.ok(s.flags.has('k2_grauspaeher_besiegt'));
  assert.equal(s.arrests, 0);
  // Zu zweit schlägt die Streife voll zu (keine Duo-Milderung für höhere Wesen)
  const mixed = bestTry(() => { const p = pair(4); p.withPlayer(2, () => { p.pathway.seq = 5; p.updateMaxHp(); p.hp = p.maxHp; }); return p; });
  assert.equal(mixed.won, true, 'ein Halbgott trägt den Partner');
});
