import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Eine Quelle = Vermutung, zwei Quellen = sehr wahrscheinlich', () => {
  const s = new GameState(content);
  const events = [];
  s.on('fact', (e) => events.push(e));
  assert.equal(s.factStatus('lamp_frozen'), 'unknown');
  s.addClue('frosted_lamp');
  assert.equal(s.factStatus('lamp_frozen'), 'suspected');
  s.addClue('greta_frost');
  assert.equal(s.factStatus('lamp_frozen'), 'likely');
  assert.deepEqual(events.map((e) => e.status), ['suspected', 'likely']);
});

test('Falsche Polizei-Info wird widerlegt, und widerlegte Infos lassen sich nicht verknüpfen', () => {
  const s = new GameState(content);
  s.addClue('price_drunk');
  assert.equal(s.factStatus('drunk'), 'suspected');
  s.addClue('gin_bottle');
  assert.equal(s.factStatus('drunk'), 'refuted');
  s.addClue('lamp_frozen' in content.facts ? 'frosted_lamp' : 'x');
  assert.equal(s.combine('drunk', 'lamp_frozen').result, 'refuted');
});

test('Eine von zwei Constables wiederholte Lüge kippt, sobald die Wahrheit bestätigt ist', () => {
  const s = new GameState(content);
  s.addClue('police_runaway');
  s.addClue('rook_runaway');
  assert.equal(s.factStatus('runaway'), 'likely', 'zwei Quellen, noch nicht widerlegt');
  s.addClue('hester_diary');
  assert.equal(s.factStatus('runaway'), 'likely');
  s.addClue('medallion');
  assert.equal(s.factStatus('song_calls'), 'likely');
  assert.equal(s.factStatus('runaway'), 'refuted');
});

test('Schlussfolgerung ist erst gesichert, wenn beide Informationen bestätigt sind', () => {
  const s = new GameState(content);
  s.addClue('frosted_lamp');
  s.addClue('testimony_humming');
  assert.equal(s.combine('lamp_frozen', 'lullaby').result, 'new');
  assert.equal(s.isCertain('unnatural_cold'), false);
  s.addClue('greta_frost');
  s.addClue('kit_heard');
  assert.equal(s.isCertain('unnatural_cold'), true);
  assert.equal(s.combine('lullaby', 'lamp_frozen').result, 'known');
});

test('Ansehen: Ränge, Belohnungen und Gesperrtes', () => {
  const s = new GameState(content);
  const ranks = [];
  s.on('rank', (r) => ranks.push(r.rank.name));
  assert.equal(s.rank().name, 'Zivilist');
  assert.equal(s.meets({ requires_honor: 20 }), false);
  s.addHonor(5, 'test');
  assert.equal(s.rank().name, 'Hilfsermittler');
  assert.equal(s.meets({ requires_honor: 20 }), true);
  assert.equal(s.meets({ max_honor: 20 }), false);
  s.addHonor(-50, 'test');
  assert.equal(s.honor, 0);
  assert.deepEqual(ranks, ['Hilfsermittler', 'Zivilist']);
});

test('Aufträge: Schritte haken sich ab, Belohnung kommt beim Abschluss', () => {
  const s = new GameState(content);
  assert.equal(s.quests.arrival, 'active');
  s.startQuest('lost_file');
  assert.deepEqual(s.questSteps('lost_file').map((x) => x.done), [false, false]);
  s.flags.add('has_file_47');
  assert.deepEqual(s.questSteps('lost_file').map((x) => x.done), [true, false]);
  const before = s.honor;
  s.finishQuest('lost_file', 'done');
  assert.equal(s.honor, before + 6);
  assert.equal(s.finishQuest('lost_file', 'done'), false, 'nicht doppelt');
});

test('Speichern und Laden', () => {
  const s = new GameState(content);
  s.addClue('frosted_lamp');
  s.flags.add('travel_ashgrove');
  s.addHonor(10);
  s.map = 'ashgrove';
  const data = JSON.parse(JSON.stringify(s.serialize([100, 120])));
  const t = new GameState(content);
  assert.equal(t.load(data), true);
  assert.equal(t.map, 'ashgrove');
  assert.deepEqual(t.position, [100, 120]);
  assert.ok(t.hasClue('frosted_lamp') && t.flags.has('travel_ashgrove') && t.honor === 25);
  assert.equal(t.load({ v: 1 }), false, 'alte Spielstände werden abgelehnt');
});

test('Geistsicht kostet Nerven und schaltet sich bei 0 ab', () => {
  const s = new GameState(content);
  s.setSpiritVision(true);
  s.tick(60);
  assert.equal(s.composure, 0);
  assert.equal(s.spiritVision, false);
  assert.equal(s.setSpiritVision(true), false);
});
