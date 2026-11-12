// Codex DE: Fahrende Auktion – Halt 2 von 5 Spieltagen in der Stadt, in der man ist, eine Runde je Halt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { DAY_SECONDS } from '../src/core/Clock.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Fahrende Auktion: Vance steht auf Salzmarkt und Kalkmarkt, nur während eines Halts', () => {
  for (const map of ['wx_salzmarkt', 'ds_kalkmarkt']) assert.ok(content.maps[map].npcs.some((n) => n.id === 'fa2_vance' && n.visible_if), map);
  const s = new GameState(content);
  s.flags.add('k2_arrived');
  s.playTime = 0;
  assert.ok(s.fa2Halt());
  s.playTime = 3 * DAY_SECONDS;
  assert.ok(!s.fa2Halt());
  assert.equal(s.fa2TageBisHalt(), 2);
});

test('Fahrende Auktion: eine Runde je Halt, nur in der eigenen Stadt', () => {
  const s = new GameState(content);
  s.flags.add('k2_arrived');
  s.flags.add('fa2_kontakt');
  s.map = 'wx_salzmarkt';
  s.playTime = 10;
  assert.equal(s.startSession('fa2_dunscar').ok, false);
  assert.ok(s.startSession('fa2_wexmoor').ok);
  assert.ok(s.auction.lot, 'erstes Los');
  s.auction = null;
  assert.equal(s.startSession('fa2_wexmoor').ok, false, 'schon gehalten');
  s.playTime = 5 * DAY_SECONDS + 10;
  assert.ok(s.startSession('fa2_wexmoor').ok, 'nächster Halt');
});
