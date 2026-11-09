// Balance der späten Stufen: Sequenz 7 und 6 sind Durchbrüche, Fall 7/8 sind härter als die Fälle davor,
// und zu zweit hält der Gegner mehr aus.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, AP_START, ENEMY_HP_MULT, DUO_HP_MULT } from '../src/core/Combat.js';
import { loadContent, fight, EXPERT, SKILLED } from './helpers.js';

const content = loadContent();

function hero(seq = null, id = 'eisen') {
  const s = new GameState(content);
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem('verband', 3);
  if (seq) {
    s.pathway = { id, seq, digestion: 0 };
    s.updateMaxHp();
    s.hp = s.maxHp;
  }
  return s;
}

test('Durchbrüche: Sequenz 7 und 6 bringen doppeltes Wachstum, Konzentration zu Beginn und mehr Schaden', () => {
  const hp = (seq) => hero(seq).maxHp;
  const step98 = hp(8) - hp(9);
  assert.ok(hp(7) - hp(8) >= 2 * step98, 'Seq 7 wächst doppelt');
  assert.ok(hp(6) - hp(7) >= 2 * step98, 'Seq 6 wächst doppelt');
  assert.equal(new Combat(hero(8), 'miriam').fighters[1].ap, AP_START);
  assert.equal(new Combat(hero(7), 'miriam').fighters[1].ap, AP_START + 1);
  assert.equal(new Combat(hero(6), 'miriam').fighters[1].ap, AP_START + 2);
  const hit = (seq) => new Combat(hero(seq), 'rook_fight').hitDamage(2, 'good');
  assert.ok(hit(7) > hit(8) && hit(6) > hit(7), 'Seq 7 und 6 treffen härter');
  for (const [id, p] of Object.entries(content.pathways)) {
    for (const seq of ['7', '6']) {
      const keys = p.seqs[seq].passives.map((x) => x.key);
      assert.ok(keys.includes('ap_start') && keys.includes('dmg_mult'), `${id} Seq ${seq}: Durchbruch fehlt`);
    }
  }
});

test('Fall 7/8: Gegner halten mehr aus als in den Fällen davor', () => {
  const E = content.encounters;
  const early = ['miriam', 'dreizehnter_gast', 'bronzeengel', 'felix_fight', 'rook_fight'];
  const maxEarly = Math.max(...early.map((id) => E[id].hp));
  assert.ok(E.miss_wren.hp > maxEarly + 15, 'Miss Wren ist der zäheste Boss bis Fall 8');
  assert.ok(E.traumfaden.hp > maxEarly, 'Traumfäden zäher als jeder Boss davor');
  for (const id of ['ertrunkener', 'pfandeintreiber']) assert.ok(E[id].hp >= 42, id);
});

test('Fall 7/8: ohne Durchbruch verliert man gegen Miss Wren, mit Sequenz 7 gewinnt man', () => {
  for (const seq of [null, 8]) {
    const { result } = fight(hero(seq), 'miss_wren', { defend: EXPERT, healBelow: 15 });
    assert.equal(result.outcome, 'lost', `Seq ${seq ?? 'ohne'} sollte verlieren`);
  }
  for (const seq of [7, 6]) {
    const { result } = fight(hero(seq), 'miss_wren', { defend: SKILLED, skill: 'klingenwirbel', healBelow: 15 });
    assert.equal(result.outcome, 'won', `Seq ${seq} sollte gewinnen`);
  }
});

test('Zu zweit: der Gegner hält mehr aus', () => {
  const s = hero();
  s.addP2();
  const c = new Combat(s, 'miss_wren');
  assert.equal(c.enemy.maxHp, Math.round(content.encounters.miss_wren.hp * ENEMY_HP_MULT * DUO_HP_MULT));
  assert.equal(new Combat(hero(), 'miss_wren').enemy.maxHp, Math.round(content.encounters.miss_wren.hp * ENEMY_HP_MULT));
  // Übungskämpfe bleiben gleich
  assert.equal(new Combat(s, 'sparring').enemy.maxHp, content.encounters.sparring.hp);
});
