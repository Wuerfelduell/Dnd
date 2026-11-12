// Seb 2026-11-12: Im Kampf vergeht die Spielzeit weiter (CombatScene ruft state.tickClock).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

test('Kampfzeit: tickClock zählt die Stadtuhr weiter, Fahndung bleibt stehen', () => {
  const s = new GameState(loadContent());
  const pt = s.playTime;
  const wc = s.wantedClock;
  s.tickClock(30);
  assert.equal(s.playTime, pt + 30);
  assert.equal(s.wantedClock, wc);
  s.tickClock(NaN);
  s.tickClock(-5);
  assert.equal(s.playTime, pt + 30);
});
