// Verwirrung: Eliten und Bosse durchschauen die Täuschung nach einem Treffer einige Runden lang (CONFUSE_LOCK).
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, CONFUSE_LOCK } from '../src/core/Combat.js';
import { loadContent, seeded } from './helpers.js';

const content = loadContent();
const bossId = Object.keys(content.encounters).find((id) => content.encounters[id].boss && !content.encounters[id].min_seq && !content.encounters[id].practice && content.encounters[id].chapter === 3);
const normalId = 'schichtgaenger';

function fight(enc) {
  const s = new GameState(content);
  s.pathway = { id: 'schluessel', seq: 5, digestion: 60 }; s.updateMaxHp(); s.hp = s.maxHp;
  const c = new Combat(s, enc); c.rng = seeded(1);
  c.enemy.hp = c.enemy.maxHp = 1e7;
  return c;
}
function confuseEachRound(c, rounds) {
  const got = [];
  for (let r = 0; r < rounds; r++) {
    c.actor = 1; c.fighters[1].ap = 10;
    c.useSkill('taschenspiel', ['good', 'good']);
    got.push(c.confused);
    c.nextEnemyAttack(); // verwirrt: trifft sich selbst
    c.endEnemyTurn?.();
    c.endRound();
  }
  return got;
}

test('Boss lässt sich nur jede dritte Runde verwirren', () => {
  assert.ok(bossId, 'Kapitel-3-Boss gefunden');
  assert.equal(CONFUSE_LOCK.boss, 2);
  assert.deepEqual(confuseEachRound(fight(bossId), 6), [true, false, false, true, false, false]);
});

test('normale Gegner lassen sich jede Runde verwirren', () => {
  assert.deepEqual(confuseEachRound(fight(normalId), 4), [true, true, true, true]);
});
