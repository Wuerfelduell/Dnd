// Notizbuch: Archiv gelöster Fälle und Personenliste.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { isSolved, knownPeople } from '../src/core/journal.js';
import { loadContent, talk } from './helpers.js';

const content = loadContent();

test('Ein Fall ist gelöst, sobald er ein Ende hat oder sein Hauptauftrag erledigt ist', () => {
  const s = new GameState(content);
  assert.equal(isSolved(s, 'case_01'), false);
  s.endings.case_01 = 'c1_good';
  assert.equal(isSolved(s, 'case_01'), true);
  s.quests.case_02 = 'done';
  assert.equal(isSolved(s, 'case_02'), true);
  assert.equal(isSolved(s, 'side'), false, 'Nebenfälle werden nie archiviert');
});

test('Personenliste: nur Leute, mit denen man gesprochen hat, mit Ort und laufendem Auftrag', () => {
  const s = new GameState(content);
  assert.equal(knownPeople(s).length, 0);
  const visit = (dlg) => { const nodes = talk(s, dlg, []); nodes.forEach((n) => s.visitNode(dlg, n)); };
  visit('pimm');
  visit('quill');
  const people = knownPeople(s);
  assert.deepEqual(people.map((p) => p.id).sort(), ['pimm', 'quill']);
  const pimm = people.find((p) => p.id === 'pimm');
  assert.equal(pimm.name, 'Miss Pimm');
  assert.ok(pimm.places.includes(content.maps.revier.name));
  // Laufender Auftrag bringt die Person nach oben
  s.quests.quill_mirror = 'active';
  assert.equal(knownPeople(s)[0].id, 'quill');
  assert.ok(knownPeople(s)[0].quests.length);
});
