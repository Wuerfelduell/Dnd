// Tragkraft: Gewicht, Überlast, Wegwerfen und weitere Verstecke.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState, BASE_CARRY } from '../src/core/GameState.js';
import { canHurry } from '../src/core/Travel.js';

const content = loadContent();

test('Startausrüstung ist weit unter der Grenze, Beweisstücke wiegen nichts', () => {
  const s = new GameState(content);
  assert.ok(s.carryWeight() < BASE_CARRY / 2, `Start: ${s.carryWeight()}`);
  assert.equal(s.carryCapacity(), BASE_CARRY);
  const before = s.carryWeight();
  s.addItem('taschenuhr');
  assert.equal(s.carryWeight(), before);
  for (const id of Object.keys(content.items)) assert.ok(s.itemWeight(id) >= 0, id);
});

test('Überlast: Beute geht nicht verloren, aber kein schneller Weg und eine Warnung', () => {
  const s = new GameState(content);
  s.composure = 100;
  const notes = [];
  s.on('notice', (t) => notes.push(t));
  assert.equal(canHurry(s), true);
  s.addItem('ankerhaken', 7); // 49 Pfund
  assert.equal(s.itemCount('ankerhaken'), 7);
  assert.equal(s.isOverloaded(), true);
  assert.equal(canHurry(s), false);
  assert.equal(notes.filter((t) => t.includes('Zu schwer')).length, 1);
  s.addItem('verband');
  assert.equal(notes.filter((t) => t.includes('Zu schwer')).length, 1, 'nur beim Überschreiten warnen');
  assert.equal(s.storeItem('ankerhaken', 7).ok, true);
  assert.equal(s.isOverloaded(), false);
});

test('Pfad des Eisens trägt mehr', () => {
  const s = new GameState(content);
  assert.ok(content.pathways.eisen.seqs['9'].passives.some((p) => p.key === 'carry'));
  assert.equal(s.carryCapacity(), BASE_CARRY);
});

test('Wegwerfen: nicht bei Beweisstücken, mit Rückmeldung', () => {
  const s = new GameState(content);
  s.addItem('taschenuhr');
  assert.equal(s.dropItem('taschenuhr').ok, false);
  s.addItem('rattenschwanz', 3);
  assert.equal(s.dropItem('rattenschwanz', 2).ok, true);
  assert.equal(s.itemCount('rattenschwanz'), 1);
});

test('Eigenes Versteck neben dem Büroschrank, beide werden gespeichert', () => {
  const s = new GameState(content);
  s.addItem('rattenschwanz', 4);
  s.storeItem('rattenschwanz', 1);
  s.storeItem('rattenschwanz', 2, 'kahn');
  assert.equal(s.storedCount('rattenschwanz'), 1);
  assert.equal(s.storedCount('rattenschwanz', 'kahn'), 2);
  assert.equal(s.retrieveItem('rattenschwanz', 1, 'buero').ok, true);
  assert.equal(s.storedCount('rattenschwanz', 'kahn'), 2, 'anderes Lager bleibt unberührt');
  const copy = new GameState(content);
  assert.ok(copy.load(JSON.parse(JSON.stringify(s.serialize(null)))));
  assert.deepEqual(copy.stashes, { kahn: { rattenschwanz: 2 } });
  assert.deepEqual(copy.storage, {});
});
