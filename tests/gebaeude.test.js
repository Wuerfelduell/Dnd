// Betretbare Gebäude, hinterer Flügel des Reviers und das eigene Büro mit Lager.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';

const content = loadContent();
const door = (map, id) => content.maps[map].interactables.find((i) => i.id === id);

test('Jedes Haus hat eine Tür im Viertel und eine Tür zurück', () => {
  for (const [map, id, inside] of [['altmarkt', 'pfandhaus_door', 'pfandhaus'], ['ashgrove', 'bestatter_door', 'bestatter'],
    ['docks', 'hafenmeister_door', 'hafenmeisterei'], ['pestgassen', 'mietskaserne_door', 'mietskaserne'], ['revier', 'fluegel_door', 'revier_fluegel']]) {
    const d = door(map, id);
    assert.equal(d?.kind, 'door', `${map}: Tür ${id}`);
    assert.equal(d.to, inside);
    const back = content.maps[inside].interactables.find((i) => i.kind === 'door' && i.to === map);
    assert.ok(back, `${inside}: Tür zurück nach ${map}`);
    assert.ok(content.maps[map].spawns[back.spawn], `${map}: Spawn ${back.spawn} vor der Tür`);
  }
});

test('Die Treppe zum Büro öffnet sich erst für geachtete Ermittler', () => {
  const s = new GameState(content);
  const stairs = door('revier_fluegel', 'stairs_up');
  s.honor = 69;
  assert.equal(s.meetsLock(stairs.lock), false);
  s.honor = 70;
  assert.equal(s.meetsLock(stairs.lock), true);
  assert.equal(s.rank().name, 'Geachteter Ermittler');
});

test('Lagerschrank: einlagern, herausnehmen, speichern und laden', () => {
  const s = new GameState(content);
  s.addItem('verband', 1); // jetzt 3
  assert.equal(s.storeItem('verband', 2).ok, true);
  assert.equal(s.itemCount('verband'), 1);
  assert.equal(s.storedCount('verband'), 2);
  assert.equal(s.storeItem('verband', 5).ok, true, 'mehr als vorhanden: nimmt den Rest');
  assert.equal(s.itemCount('verband'), 0);
  assert.equal(s.storedCount('verband'), 3);
  s.addItem('taschenuhr');
  assert.equal(s.storeItem('taschenuhr').ok, false, 'Beweisstücke bleiben beim Ermittler');
  assert.equal(s.retrieveItem('verband').ok, true);
  assert.equal(s.itemCount('verband'), 1);
  const copy = new GameState(content);
  assert.ok(copy.load(JSON.parse(JSON.stringify(s.serialize(null)))));
  assert.deepEqual(copy.storage, { verband: 2 });
  copy.reset();
  assert.deepEqual(copy.storage, {});
});

test('Die Pfandleiherin handelt', () => {
  const s = new GameState(content);
  s.money = 50;
  assert.equal(s.buy('crane', 'verband').ok, true);
  assert.ok(s.shopStock('crane').find((e) => e.item === 'bannsalz').locked, 'Bannsalz erst ab Hilfsermittler');
});
