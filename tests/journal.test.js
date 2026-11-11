// Notizbuch: Archiv gelöster Fälle und Personenliste.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { isSolved, knownPeople, journalQuestVisible } from '../src/core/journal.js';
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

test('Ab Wexmoor verschwinden alte Personen und offene Kettlegate-Aufträge ohne Fortschrittsverlust', () => {
  const s = new GameState(content);
  s.quests.quill_mirror = 'active';
  s.quests.case_01 = 'done';
  s.quests.k2_akt1 = 'active';
  s.seenNodes.add('quill.start');
  assert.equal(journalQuestVisible(s, 'quill_mirror'), true);
  assert.ok(knownPeople(s).some((p) => p.id === 'quill'));
  s.map = 'wx_bahnhof';
  assert.equal(journalQuestVisible(s, 'quill_mirror'), false);
  assert.equal(journalQuestVisible(s, 'case_01'), true);
  assert.equal(journalQuestVisible(s, 'k2_akt1'), true);
  assert.ok(!knownPeople(s).some((p) => p.id === 'quill'));
  assert.equal(s.quests.quill_mirror, 'active');
  assert.ok(s.seenNodes.has('quill.start'));
  s.flags.add('k2_arrived');
  const restored = new GameState(content);
  restored.load(JSON.parse(JSON.stringify(s.serialize())));
  restored.map = 'buero';
  assert.equal(journalQuestVisible(restored, 'quill_mirror'), false);
  assert.equal(journalQuestVisible(restored, 'case_01'), true);
});

test('Wexmoor bleibt nach Akt I und während Akt II offen, bis alle Hauptakte erledigt sind', () => {
  const s = new GameState(content);
  s.quests.k2_akt1 = 'done';
  assert.equal(isSolved(s, 'kapitel2'), false);
  s.quests.k2_akt2 = 'active';
  assert.equal(isSolved(s, 'kapitel2'), false);
  for (const [id, q] of Object.entries(content.quests)) {
    if (q.case === 'kapitel2' && q.kind === 'main') s.quests[id] = 'done';
  }
  assert.equal(isSolved(s, 'kapitel2'), true);
});
