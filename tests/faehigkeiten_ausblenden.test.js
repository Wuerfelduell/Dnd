// Kampffertigkeiten im Pfad-Tab ausblenden: je Spieler, im Spielstand, nur Anzeige.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Ausblenden gilt je Spieler und übersteht Speichern/Laden', () => {
  const s = new GameState(content);
  s.addP2();
  assert.equal(s.skillHiddenInCombat('x'), false);
  assert.equal(s.toggleSkillHidden('x').hidden, true);
  assert.equal(s.skillHiddenInCombat('x'), true);
  assert.equal(s.withPlayer(2, () => s.skillHiddenInCombat('x'), { quiet: true }), false, 'Spieler 2 hat eigene Auswahl');
  s.withPlayer(2, () => s.toggleSkillHidden('y'), { quiet: true });
  const t = new GameState(content);
  t.load(JSON.parse(JSON.stringify(s.serialize())));
  assert.equal(t.skillHiddenInCombat('x'), true);
  assert.equal(t.skillHiddenInCombat('y'), false);
  assert.equal(t.withPlayer(2, () => t.skillHiddenInCombat('y'), { quiet: true }), true);
  assert.equal(t.toggleSkillHidden('x').hidden, false);
  assert.equal(t.skillHiddenInCombat('x'), false);
});
