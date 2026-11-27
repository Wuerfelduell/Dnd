// Pflicht-Kampftraining mit Holt (core/Lehrstunde.js): `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { Lehrstunde, trainingNode, skipTraining, TRAINING_ENC, PARRY_TRIES } from '../src/core/Lehrstunde.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);

test('Neues Spiel: Training startet von selbst, danach Nachbesprechung, dann nichts mehr', () => {
  const s = fresh();
  assert.equal(trainingNode(s), 'training_start');
  s.flags.add('training_done');
  assert.equal(trainingNode(s), 'training_nach');
  s.flags.add('training_nach');
  assert.equal(trainingNode(s), null);
  for (const n of ['training_start', 'training_go', 'training_nach', 'training_nach2']) assert.ok(content.dialogues.holt.nodes[n], n);
  assert.equal(content.dialogues.holt.nodes.training_go.combat, TRAINING_ENC);
});

test('Schnellstart und Testmodus überspringen das Training, alte Spielstände nach Marlowe auch', () => {
  const s = fresh();
  skipTraining(s);
  assert.equal(trainingNode(s), null);
  const t = fresh();
  t.testmodus = true;
  assert.equal(trainingNode(t), null);
  const old = fresh();
  old.flags.add('briefed_01');
  assert.equal(trainingNode(old), null);
});

test('Lehrstunde: Schritte der Reihe nach, Koop braucht beide beim Angreifen und Ausweichen', () => {
  const l = new Lehrstunde([1, 2]);
  assert.equal(l.step.id, 'angriff');
  l.note('attack', 1);
  assert.equal(l.step.id, 'angriff');
  assert.match(l.view(true).open, /Spieler 2/);
  l.note('attack', 2);
  assert.equal(l.step.id, 'ausweichen');
  l.note('parry', 1); // schon erledigt, zählt später
  l.note('dodge', 1);
  l.note('dodge', 2);
  assert.equal(l.step.id, 'fertigkeit');
  l.note('skill', 2);
  l.note('item', 1);
  assert.ok(l.done);
});

test('Parieren: nach einigen Angriffen geht es auch ohne geglückte Parade weiter', () => {
  const l = new Lehrstunde([1]);
  l.note('attack');
  l.note('dodge');
  for (let i = 0; i < PARRY_TRIES; i++) l.note('enemyTurn');
  assert.equal(l.step.id, 'fertigkeit');
});

test('Übungskampf: Holt fällt erst nach allen Übungen, der Spieler nie', () => {
  const s = fresh();
  const c = new Combat(s, TRAINING_ENC);
  assert.ok(c.lehre);
  assert.equal(c.canFlee(), false);
  c.hurtEnemy(999);
  assert.equal(c.enemy.hp, 1);
  assert.equal(c.outcome, null);
  const atk = c.enc.attacks[0];
  for (let i = 0; i < 30; i++) c.resolveHit({ ...atk, damage: 50 }, 'miss');
  assert.equal(s.hp, 1);
  assert.equal(c.outcome, null);
  // Übungen abarbeiten
  c.useSkill('attack', ['good']);
  c.resolveHit(atk, 'dodge');
  c.resolveHit(atk, 'parry');
  c.ap = 3;
  c.useSkill('double', ['good', 'good']);
  c.useItem('verband');
  assert.ok(c.lehre.done);
  c.hurtEnemy(999);
  assert.equal(c.outcome, 'won');
});
