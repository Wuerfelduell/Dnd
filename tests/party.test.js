import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Spieler 2 kommt mit eigener Startausrüstung und eigenem Leben dazu', () => {
  const s = new GameState(content);
  assert.equal(s.hasP2(), false);
  s.addP2();
  assert.equal(s.hasP2(), true);
  assert.deepEqual(s.p2.inventory, { spazierstock: 1, verband: 2 });
  assert.equal(s.p2.weapon, 'spazierstock');
  s.damage(10);
  assert.equal(s.hp, 30);
  assert.equal(s.p2.hp, 40);
});

test('Getrenntes Inventar: Gegenstände landen bei dem Spieler, der gerade handelt', () => {
  const s = new GameState(content);
  s.addP2();
  s.withPlayer(2, () => s.addItem('tonikum', 2));
  assert.equal(s.itemCount('tonikum'), 0);
  assert.equal(s.p2.inventory.tonikum, 2);
  assert.equal(s.acting, 1);
  // Gegenstand weitergeben
  const r = s.giveItem('tonikum', 2, 1);
  assert.equal(r.ok, true);
  assert.equal(s.itemCount('tonikum'), 1);
  assert.equal(s.p2.inventory.tonikum, 1);
});

test('Spieler 2 benutzt eigene Heilmittel und heilt nur sich selbst', () => {
  const s = new GameState(content);
  s.addP2();
  s.withPlayer(2, () => s.damage(20));
  assert.equal(s.p2.hp, 20);
  assert.equal(s.hp, 40);
  const msg = s.withPlayer(2, () => s.useItem('verband'));
  assert.ok(msg);
  assert.ok(s.p2.hp > 20);
  assert.equal(s.p2.inventory.verband, 1);
  assert.equal(s.itemCount('verband'), 2);
});

test('Beweisstücke wandern immer zum Ermittler', () => {
  const s = new GameState(content);
  s.addP2();
  const key = Object.keys(content.items).find((id) => content.items[id].kind === 'key');
  s.withPlayer(2, () => s.addItem(key));
  assert.equal(s.p2.inventory[key], undefined);
  assert.equal(s.itemCount(key), 1);
  assert.equal(s.giveItem(key, 1).ok, false);
});

test('Entfernen und wieder Hinzufügen behält die Sachen von Spieler 2, Speichern auch', () => {
  const s = new GameState(content);
  s.addP2();
  s.withPlayer(2, () => s.addItem('tonikum'));
  s.removeP2();
  assert.equal(s.hasP2(), false);
  assert.equal(s.giveItem('verband', 1).ok, false);
  s.addP2();
  assert.equal(s.p2.inventory.tonikum, 1);
  const save = JSON.parse(JSON.stringify(s.serialize([10, 10])));
  const t = new GameState(content);
  assert.equal(t.load(save), true);
  assert.equal(t.hasP2(), true);
  assert.equal(t.p2.inventory.tonikum, 1);
  assert.equal(t.p2.weapon, 'spazierstock');
});

test('Rast heilt beide, ohne Spieler 2 bleibt alles wie gehabt', () => {
  const s = new GameState(content);
  s.applyEffects({ heal: 'full' });
  s.addP2();
  s.damage(15);
  s.withPlayer(2, () => s.damage(15));
  s.applyEffects({ heal: 'full' });
  assert.equal(s.hp, s.maxHp);
  assert.equal(s.p2.hp, s.p2.maxHp);
});
