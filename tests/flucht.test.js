// Flucht vor starken Gegnern: Eliten, Bosse und die Grauspäher halten dich nach „Fliehen“ noch zwei Runden fest.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, FLEE_ROUNDS_TOUGH } from '../src/core/Combat.js';
import { loadContent, seeded } from './helpers.js';

const content = loadContent();

function hero(seq = 7) {
  const s = new GameState(content);
  s.map = 'wx_torfstich';
  s.flags.add('kapitel1_done');
  s.flags.add('k2_arrived');
  s.addItem('ossuarklinge');
  s.equip('ossuarklinge');
  s.pathway = { id: 'eisen', seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  return s;
}

/** Eine Gegnerrunde: jeder Schlag wird genommen (miss), dann Rundenende. */
function enemyRound(c) {
  const atk = c.nextEnemyAttack();
  if (atk) { for (const h of atk.hits) { c.resolveHit(atk, 'miss'); if (c.outcome) break; } c.endEnemyTurn(); }
  c.endRound();
}

const start = (s, id) => { const c = new Combat(s, id); c.rng = seeded(3); return c; };

test('Normale Gegner: Fliehen wirkt sofort', () => {
  const c = start(hero(), 'moorleiche');
  assert.equal(c.fleeRounds, 0);
  assert.ok(c.canFlee());
  assert.ok(c.flee());
  assert.equal(c.outcome, 'fled');
});

test('Elite: Fliehen startet den Rückzug, zwei Gegnerrunden durchhalten, dann weg', () => {
  const s = hero();
  const c = start(s, 'moorleiche_elite');
  assert.equal(c.fleeRounds, FLEE_ROUNDS_TOUGH);
  assert.equal(FLEE_ROUNDS_TOUGH, 2);
  assert.ok(c.flee());
  assert.equal(c.outcome, null, 'noch nicht entkommen');
  assert.deepEqual(c.fleeing, { left: 2, by: 1 });
  assert.ok(!c.canFlee(), 'läuft schon, kein zweites Mal');
  assert.ok(c.actions > 0, 'der Zug ist verbraucht');
  assert.match(c.fleeStartText(), /2 Runden/);
  const hp = s.hp;
  enemyRound(c);
  assert.ok(s.hp < hp, 'der Gegner greift weiter an');
  assert.equal(c.outcome, null);
  assert.equal(c.fleeStatus(), 'noch 1 Runde');
  assert.equal(c.round, 2, 'in Runde 2 darf man noch handeln (heilen, abwehren)');
  assert.ok(c.canUse('attack'));
  enemyRound(c);
  assert.equal(c.outcome, 'fled');
  assert.match(c.finish().text, /./);
});

test('Wer den Rückzug nicht übersteht, verliert trotzdem', () => {
  const s = hero();
  const c = start(s, 'moorleiche_elite');
  s.hp = 1;
  c.flee();
  enemyRound(c);
  assert.equal(c.outcome, 'lost');
});

test('Bosse: wo Flucht erlaubt ist, gilt dieselbe Frist; Daten können sie je Gegner setzen', () => {
  const c = start(hero(), 'schwellenhund');
  assert.ok(c.enc.boss && c.enc.fleeable);
  assert.equal(c.fleeRounds, FLEE_ROUNDS_TOUGH);
  for (const [id, e] of Object.entries(content.encounters)) {
    if (!e.elite || e.practice) continue;
    assert.ok(new Combat(hero(), id).fleeRounds >= 1, `${id}: Elite ohne Fluchtfrist`);
  }
});

test('Grauspäher: Flucht möglich, aber zwei Runden Wachsknüppel, danach Fahndungsstufe 2', () => {
  const s = hero(4);
  const c = start(s, 'wx_grauspaeher_fight');
  assert.equal(c.fleeRounds, 2);
  assert.ok(c.canFlee());
  c.flee();
  enemyRound(c);
  enemyRound(c);
  assert.equal(c.outcome, 'fled');
  const r = c.finish();
  assert.equal(r.outcome, 'fled');
  assert.ok(s.wanted >= 2, 'Flucht vor der Streife: gesucht');
  assert.match(r.text, /Lichtamt/);
});

test('Koop: das Zeichen gilt für beide, der andere handelt noch, zusammen durchhalten', () => {
  const s = hero();
  s.addP2();
  const c = start(s, 'moorleiche_elite');
  assert.ok(c.duo);
  assert.equal(c.actor, 1);
  assert.ok(c.flee());
  assert.equal(c.outcome, null);
  assert.ok(c.passTurn(), 'Spieler 2 ist noch dran');
  assert.equal(c.actor, 2);
  assert.ok(!c.canFlee(), 'Spieler 2 kann nicht noch einmal fliehen, der Rückzug läuft schon');
  assert.match(c.fleeStartText(), /Spieler 1 gibt das Zeichen/);
  assert.ok(c.canUse('attack'), 'aber kämpfen oder heilen darf er');
  c.useSkill('attack', ['good']);
  // Gegner schlägt in jeder Runde beide an
  const round = () => { let guard = 0; do { const atk = c.nextEnemyAttack(); if (atk) { for (const h of atk.hits) c.resolveHit(atk, 'miss'); c.endEnemyTurn(); } } while (c.moreStrikes() && guard++ < 4); c.endRound(); };
  round();
  assert.equal(c.outcome, null);
  round();
  assert.equal(c.outcome, 'fled');
});
