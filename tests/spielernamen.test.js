// Seb: Spieler 1/2 im Inventar umbenennen (max. 9 Zeichen), gespeichert im Spielstand, überall angezeigt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { tr, setPlayerNames, NAME_MAX } from '../src/core/I18n.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Namen werden gekürzt, gesäubert und im Spielstand gespeichert', () => {
  const s = new GameState(content);
  assert.equal(s.setPlayerName(1, '  Sebastian123 '), 'Sebastian');
  assert.equal(s.setPlayerName(2, '<b>Lena</b>'), 'bLena/b');
  assert.ok(NAME_MAX === 9);
  const data = JSON.parse(JSON.stringify(s.serialize()));
  assert.deepEqual(data.playerNames, ['Sebastian', 'bLena/b']);
  const t = new GameState(content);
  t.load(data);
  assert.deepEqual(t.playerNames, ['Sebastian', 'bLena/b']);
  t.reset();
  assert.deepEqual(t.playerNames, ['', '']);
});

test('Angezeigter Text ersetzt „Spieler 1/2“ durch die eigenen Namen', () => {
  setPlayerNames(['Seb', '']);
  assert.equal(tr('Spieler 1 · Ermittler'), 'Seb · Ermittler');
  assert.equal(tr('Spieler 2: +3 % verdaut'), 'Spieler 2: +3 % verdaut');
  assert.equal(tr('Mitspieler 1 bleibt'), 'Mitspieler 1 bleibt');
  setPlayerNames(['', '']);
  assert.equal(tr('Spieler 1 · Ermittler'), 'Spieler 1 · Ermittler');
});
