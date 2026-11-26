// Kapitel 4: Koop-Splitscreen in Calderwick, bis beide Spieler ihr Seq-3-Ritual geschafft haben (Seb 2026-11-12)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { p2View, SPLIT_ENDE_FLAG } from '../src/core/Split.js';
import { Combat } from '../src/core/Combat.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const duo = () => {
  const s = new GameState(content);
  s.addP2();
  s.pathway = { id: 'eisen', seq: 4, digestion: 0 };
  s.p2.pathway = { id: 'laterne', seq: 4, digestion: 0 };
  s.map = 'cw_gleisfuss';
  return s;
};

test('Splitscreen: erst zu zweit in Calderwick, Spieler 2 hat dann eigene Karte, withPlayer(2) sieht sie', () => {
  const s = duo();
  s.splitTick();
  assert.equal(s.splitOn, false, 'ohne Ankunft nicht');
  s.flags.add('k4_arrived');
  assert.equal(s.splitTick(), false, 'draußen in Calderwick gemeinsames Bild');
  assert.equal(s.splitOn, false);
  s.map = 'o3_eisen'; // Spieler 1 geht in sein Pfadviertel
  s.flags.add('o3_rueck:cw_gleisfuss');
  assert.equal(s.splitTick(), true);
  assert.equal(s.splitOn, true);
  assert.equal(s.p2.map, 'cw_gleisfuss', 'Spieler 2 bleibt draußen');
  s.map = 'cw_gleisfuss';
  s.p2.map = 'o3_laterne';
  assert.equal(s.withPlayer(2, () => s.map, { quiet: true }), 'o3_laterne');
  assert.equal(s.map, 'cw_gleisfuss');
  // Die rechte Welt sieht dauerhaft Spieler 2
  const v = p2View(s);
  assert.equal(v.map, 'o3_laterne');
  assert.equal(v.pathway.id, 'laterne');
  assert.equal(v.acting, 2);
  v.map = 'o3_eisen';
  assert.equal(s.p2.map, 'o3_eisen');
  assert.equal(s.map, 'cw_gleisfuss');
  assert.ok(v.meets({ requires_pathway: ['laterne', 9] }));
  assert.ok(!s.meets({ requires_pathway: ['laterne', 9] }));
  // Speichern und laden behält die Karte von Spieler 2
  const t = new GameState(content);
  t.load(JSON.parse(JSON.stringify(s.serialize(null))));
  assert.equal(t.splitOn, true);
  assert.equal(t.p2.map, 'o3_eisen');
});

test('Splitscreen: Kämpfe allein; Spieler 2 kämpft mit seinen Werten auf seiner Karte', () => {
  const s = duo();
  s.flags.add('k4_arrived');
  s.p2.map = 'o3_laterne';
  assert.equal(s.splitBetreten(2, 'o3_laterne', 'default', null), true);
  s.splitTick();
  assert.equal(s.splitOn, true);
  s.combatBy = 2;
  const c = new Combat(s, 'o3_laterne_g1');
  assert.equal(c.duo, false);
  assert.equal(c.swapped, true);
  assert.equal(s.map, 'o3_laterne', 'während des Kampfes steht Spieler 2 vorn');
  c.outcome = 'won';
  c.finish();
  assert.equal(s.map, 'cw_gleisfuss');
  assert.equal(s.pathway.id, 'eisen');
});

test('Splitscreen endet für immer, wenn beide Seq 3 haben', () => {
  const s = duo();
  s.flags.add('k4_arrived');
  s.map = 'o3_eisen';
  s.splitTick();
  assert.equal(s.splitOn, true);
  s.pathway.seq = 3;
  s.splitTick();
  assert.equal(s.splitOn, true, 'einer allein reicht nicht');
  s.p2.pathway.seq = 3;
  assert.equal(s.splitTick(), true);
  assert.equal(s.splitOn, false);
  assert.ok(s.flags.has(SPLIT_ENDE_FLAG));
  assert.equal(s.p2.map, undefined);
  s.pathway.seq = 4;
  s.splitTick();
  assert.equal(s.splitOn, false);
});

test('Splitscreen nur in Pfadvierteln: wer hineingeht, teilt das Bild; sind beide draußen, wird es wieder eins', () => {
  const s = duo();
  s.flags.add('k4_arrived');
  s.map = 'cw_kronenarchiv';
  s.splitTick();
  assert.equal(s.splitOn, false, 'andere Calderwick-Orte: gemeinsames Bild');
  // Spieler 2 benutzt im gemeinsamen Bild die Tür zu seinem Viertel: nur er geht hinein
  assert.equal(s.splitBetreten(2, 'o3_laterne', 'default', null), true);
  s.splitTick();
  assert.equal(s.splitOn, true);
  assert.equal(s.map, 'cw_kronenarchiv');
  assert.equal(s.p2.map, 'o3_laterne');
  // Spieler 1 geht woandershin in Calderwick: weiter geteilt, Spieler 2 ist noch im Viertel
  s.map = 'cw_gleisfuss';
  s.splitTick();
  assert.equal(s.splitOn, true);
  // Spieler 2 kommt heraus: gemeinsames Bild bei Spieler 1
  s.p2.map = 'cw_kronenarchiv';
  assert.equal(s.splitTick(), true);
  assert.equal(s.splitOn, false);
  assert.equal(s.p2.map, undefined);
  // Spieler 1 geht hinein: Spieler 2 bleibt an seiner Stelle draußen
  assert.equal(s.splitBetreten(1, 'o3_eisen', 'default', [40, 50]), false);
  s.map = 'o3_eisen';
  s.splitTick();
  assert.equal(s.splitOn, true);
  assert.equal(s.p2.map, 'cw_gleisfuss');
  assert.deepEqual(s.p2.position, [40, 50]);
});

test('Splitscreen-Kampf in der eigenen Hälfte: Spieler 2 kämpft auf seiner Sicht, ohne Tausch, Spieler 1 bleibt unberührt', () => {
  const s = duo();
  s.flags.add('k4_arrived');
  s.map = 'o3_eisen';
  s.splitTick();
  s.p2.map = 'o3_laterne';
  s.combatBy = 2;
  const c = new Combat(p2View(s), 'o3_laterne_g1');
  assert.equal(c.duo, false);
  assert.equal(c.swapped, false, 'kein Tausch: Spieler 1 spielt links weiter');
  assert.equal(c.alsP2, true);
  assert.equal(s.pathway.id, 'eisen');
  assert.equal(s.map, 'o3_eisen');
  s.splitKampf = 2;
  s.p2.map = 'cw_gleisfuss';
  assert.equal(s.splitTick(), false, 'während des Kampfes bleibt das Bild geteilt');
  s.splitKampf = 0;
  c.outcome = 'won';
  c.finish();
  assert.equal(s.pathway.id, 'eisen');
  assert.equal(s.map, 'o3_eisen');
});
