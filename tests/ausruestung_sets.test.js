// Seb 2026-11-27: Ausrüstungs-Sets (Kampf/Tragen) speichern und per Taste wechseln, für beide Spieler.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { GEAR_SET_NAMES } from '../src/core/Gear.js';
import { loadContent } from './helpers.js';

const content = loadContent();

function rig() {
  const s = new GameState(content);
  s.addItem('mantel_wolle');
  s.addItem('mantel_flicken');
  s.addItem('revolver');
  s.equip('revolver');
  s.wear('mantel_wolle');
  return s;
}

test('Zwei Sets: Kampf und Tragen', () => {
  assert.deepEqual(GEAR_SET_NAMES, ['Kampf', 'Tragen']);
  const s = new GameState(content);
  assert.deepEqual(s.gearSetList(), [null, null]);
  assert.equal(s.cycleGearSet().ok, false, 'ohne gespeichertes Set passiert nichts');
});

test('Speichern, anlegen und mit der Taste hin und her wechseln', () => {
  const s = rig();
  const weapon0 = Object.keys(s.inventory).find((id) => s.item(id).kind === 'weapon' && id !== 'revolver');
  assert.ok(s.saveGearSet(0).ok);
  if (weapon0) s.equip(weapon0);
  s.wear('mantel_flicken');
  const carry = s.carryCapacity?.();
  s.saveGearSet(1);
  assert.ok(s.gearSetWorn(1));
  assert.equal(s.cycleGearSet().text, 'Set „Kampf“ angelegt.');
  assert.equal(s.weapon, 'revolver');
  assert.equal(s.gear.mantel, 'mantel_wolle');
  assert.ok(s.gearSetWorn(0) && !s.gearSetWorn(1));
  if (carry != null) assert.ok(s.carryCapacity() < carry, 'Trage-Mantel weg: weniger Tragkraft');
  s.cycleGearSet();
  assert.equal(s.gear.mantel, 'mantel_flicken');
  assert.ok(s.gearSetWorn(1));
});

test('Fehlende Stücke werden genannt, der Rest wird trotzdem angelegt', () => {
  const s = rig();
  s.saveGearSet(0);
  s.takeOff('mantel');
  s.dropItem('mantel_wolle', 1);
  const r = s.applyGearSet(0);
  assert.ok(r.ok);
  assert.equal(r.missing.length, 1);
  assert.match(r.text, /Fehlt: /);
  assert.equal(s.weapon, 'revolver');
});

test('Sets bleiben im Spielstand und gehören jedem Spieler selbst', () => {
  const s = rig();
  s.saveGearSet(1);
  s.addP2();
  s.withPlayer(2, () => assert.deepEqual(s.gearSetList(), [null, null]));
  s.withPlayer(2, () => { s.saveGearSet(0); });
  const data = JSON.parse(JSON.stringify(s.serialize()));
  const t = new GameState(content);
  t.load(data);
  assert.equal(t.gearSetList()[1].mantel, 'mantel_wolle');
  assert.equal(t.gearSets.active, 1);
  t.withPlayer(2, () => { assert.ok(t.gearSetList()[0]); assert.equal(t.gearSetList()[1], null); });
  // kaputte Daten
  assert.deepEqual(t.cleanGearSets({ sets: [{ weapon: 'gibtsnicht', mantel: 'revolver' }], active: 5 }), { sets: [{ weapon: null, hut: null, mantel: null, amulett: null }, null], active: -1 });
});
