// Seb 2026-11-26: Moor ab Seq 5 verdaut fest 0,2 % je echter Heilung und 0,05 % je Schaden, den sein Schutz abfängt (je Kampf gedeckelt).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, MOOR_DIGEST } from '../src/core/Combat.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const hero = (seq) => {
  const s = new GameState(content);
  s.pathway = { id: 'sq_moor', seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = Math.round(s.maxHp / 3);
  s.composure = s.maxComposure();
  return s;
};

test('Seq 5: echte Heilung gibt fest 0,2 %, volle Leben nichts, je Kampf gedeckelt', () => {
  const s = hero(5);
  const c = new Combat(s, 'rook_fight');
  assert.equal(c.moorDigest('heal'), MOOR_DIGEST.heal);
  assert.ok(Math.abs(s.pathway.digestion - 0.2) < 1e-9);
  for (let i = 0; i < 10; i++) c.moorDigest('heal');
  assert.ok(Math.abs(s.pathway.digestion - 0.2 * MOOR_DIGEST.cap.heal) < 1e-9);
  s.hp = s.maxHp;
  const c2 = new Combat(s, 'rook_fight');
  const before = s.pathway.digestion;
  c2.digestHeal(0, 0);
  assert.equal(s.pathway.digestion, before);
});

test('Seq 6: keine feste Moor-Verdauung', () => {
  const s = hero(6);
  const c = new Combat(s, 'rook_fight');
  assert.equal(c.moorDigest('heal'), 0);
  assert.equal(c.moorDigest('shield'), 0);
});

test('Seq 4: abgefangener Schaden über Moor-Schutz verdaut den Wirker', () => {
  const s = hero(4);
  const c = new Combat(s, 'rook_fight');
  c.fighters[1].shield = 50;
  c.fighters[1].shieldFrom = 1;
  const r = c.resolveHit({ damage: 30 }, 'none', 1);
  assert.ok(r.absorbed > 0);
  assert.ok(Math.abs(s.pathway.digestion - MOOR_DIGEST.shield) < 1e-9);
});
