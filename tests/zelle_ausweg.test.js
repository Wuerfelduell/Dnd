// Seb (2026-11-17): Nach mehrmaligem Erwischen darf man nie in der Wexmoor-Zelle festsitzen.
// Ohne Geld, ohne Zunder, mit Alarm und voller Fahndung bleibt immer „Die Strafe absitzen“: raus, Fahndung 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk } from './helpers.js';

const content = loadContent();

function jailed() {
  const s = new GameState(content);
  s.map = 'wx_salzmarkt';
  s.flags.add('kapitel1_done');
  s.flags.add('k2_arrived');
  for (let i = 0; i < 6; i++) s.arrest({ seize_mult: 1.5 });
  s.money = 0;
  s.setWanted(3);
  s.map = 'wx_zelle';
  return s;
}

test('ohne Geld, ohne Zunder, mit Alarm: Strafe absitzen führt immer raus', () => {
  for (const extra of [[], ['k2_zelle_alarm'], ['k2_zunder_gone'], ['k2_zunder_gone', 'k2_zelle_alarm']]) {
    const s = jailed();
    for (const f of extra) s.flags.add(f);
    talk(s, 'wx_zelle', ['Die Strafe absitzen.']);
    assert.equal(s.flags.has('k2_in_cell'), false);
    assert.equal(s.flags.has('k2_zelle_alarm'), false);
    assert.equal(s.wanted, 0);
    assert.equal(s.pendingTravel?.map, 'wx_bahnhof');
  }
});

test('Zunders Kaution senkt die Fahndung um zwei Stufen', () => {
  const s = jailed();
  s.money = 100;
  talk(s, 'wx_zelle', ['Auf Zunder warten.']);
  assert.equal(s.wanted, 1);
  assert.equal(s.flags.has('k2_in_cell'), false);
});
