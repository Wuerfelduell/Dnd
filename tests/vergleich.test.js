// Ausrüstungsvergleich mit Pfeilen (core/Vergleich.js)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { vergleichWert } from '../src/core/Vergleich.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const zeile = (v, key) => v.zeilen.find((z) => z.key === key);

test('Waffe: gegen die geführte Waffe, ohne Waffe gegen Fäuste', () => {
  const s = new GameState(content);
  s.addItem('dsz_schienennagel');
  s.weapon = null; // Aufheben legt eine Waffe in leere Hände
  let v = s.vergleich('dsz_schienennagel');
  assert.equal(v.gegen, 'Fäuste');
  assert.equal(zeile(v, 'atk').besser, true);
  s.equip('dsz_schienennagel');
  assert.equal(s.vergleich('dsz_schienennagel'), null, 'die geführte Waffe vergleicht sich nicht mit sich selbst');
  s.addItem('dsz_bankrevolver');
  s.equip('dsz_schienennagel'); // Aufheben greift zur stärkeren Waffe
  v = s.vergleich('dsz_bankrevolver');
  assert.equal(v.gegen, 'Geweihter Schienennagel');
  assert.equal(zeile(v, 'atk').neu, 31);
  assert.equal(zeile(v, 'atk').besser, true);
  assert.equal(zeile(v, 'occult').besser, false, 'der Revolver hat keinen Okkult-Bonus');
});

test('Kleidung: gegen den gleichen Platz, weniger Schaden ist besser', () => {
  const s = new GameState(content);
  s.addItem('dsz_nebelpanzer');
  s.wear('dsz_nebelpanzer');
  s.addItem('dsz_direktorenmantel');
  const v = s.vergleich('dsz_direktorenmantel');
  assert.equal(v.gegen, 'Nebelpanzer der Toten Schicht');
  assert.equal(zeile(v, 'damage_taken').besser, false, '15 % Schutz fällt weg');
  assert.equal(zeile(v, 'dmg_mult').besser, true);
  assert.equal(zeile(v, 'max_hp').besser, false, '60 statt 110 Leben');
  assert.equal(zeile(v, 'gewicht').besser, true, 'leichter');
  assert.equal(s.vergleich('dsz_nebelpanzer'), null);
  s.addItem('dsz_stollenhelm');
  s.takeOff('hut'); // Aufheben füllt leere Plätze von selbst
  assert.equal(s.vergleich('dsz_stollenhelm').gegen, null, 'Kopf ist frei');
});

test('Koop: verglichen wird mit dem Spieler, der gerade schaut', () => {
  const s = new GameState(content);
  s.addP2?.() ?? s.joinP2?.();
  s.addItem('dsz_schienennagel');
  s.equip('dsz_schienennagel');
  const p2 = s.withPlayer(2, () => { s.weapon = null; return s.vergleich('dsz_bankrevolver'); }, { quiet: true });
  assert.equal(p2.gegen, 'Fäuste');
  assert.equal(s.vergleich('dsz_bankrevolver').gegen, 'Geweihter Schienennagel');
});

test('Artefakte: gegen das mitgeführte mit den meisten gemeinsamen Werten', () => {
  const s = new GameState(content);
  const arts = Object.entries(content.items).filter(([, it]) => it.kind === 'artifact' && it.boons?.length).map(([id]) => id);
  const a = arts.find((id) => content.items[id].boons.some((b) => b.key === 'max_hp'));
  const b = arts.find((id) => id !== a && content.items[id].boons.some((x) => x.key === 'max_hp'));
  assert.equal(s.vergleich(b).art, 'dazu');
  s.addItem(a);
  const v = s.vergleich(b);
  assert.equal(v.gegen, content.items[a].name);
  assert.ok(v.zeilen.length > 0);
  assert.equal(s.vergleich(a), null, 'wirkt schon');
});

test('Werte lesbar: Prozent, Vorzeichen, neutral als Strich', () => {
  assert.equal(vergleichWert('dmg_mult', 1.2), '+20 %');
  assert.equal(vergleichWert('damage_taken', 0.85), '−15 %');
  assert.equal(vergleichWert('max_hp', 0), '–');
  assert.equal(vergleichWert('max_hp', 110), '+110');
  assert.equal(vergleichWert('atk', 31), '31');
  assert.equal(vergleichWert('occult', 1.9), '×1,9');
});
