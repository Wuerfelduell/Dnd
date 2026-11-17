// Seb (2026-11-17): Nach Zunders Befreiung zeigte der Wegweiser („Haftregister im Wachhaus“) auf eine verschlossene Tür.
// Die Wachhaus-Tür muss offen sein, solange Zunder dort sitzt UND danach.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const tuer = content.maps.wx_oberstadt.interactables.find((o) => o.id === 'wachhaus');

test('Wachhaus-Tür: zu vor Hale, offen mit Zunder in Haft und nach der Befreiung', () => {
  const s = new GameState(content);
  assert.equal(s.meetsLock(tuer.lock), false);
  s.flags.add('k2_zunder_gone');
  assert.equal(s.meetsLock(tuer.lock), true);
  s.flags.delete('k2_zunder_gone');
  s.flags.add('k2_zunder_free');
  assert.equal(s.meetsLock(tuer.lock), true);
});
