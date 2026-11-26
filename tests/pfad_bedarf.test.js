// Pfad-Bedarf (core/Bedarf.js): Zutaten der nächsten Sequenzen werden markiert, Verkauf warnt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Bedarf: nächste zwei Sequenzen, Hauptzutat markiert, erreichte Stufen nicht', () => {
  const s = new GameState(content);
  assert.equal(s.pfadBedarf().size, 0); // ohne Pfad nichts
  s.pathway = { id: 'laterne', seq: 4, digestion: 0 };
  const b = s.pfadBedarf();
  assert.ok(b.get('sq_zutat_laterne_3').reasons.some((r) => r.seq === 3 && r.main));
  assert.ok(b.has('sq_zutat_laterne_2'));
  assert.ok(!b.has('sq_zutat_laterne_1')); // zu weit weg
  assert.ok(!b.has('sq_zutat_laterne_4')); // schon erreicht
  assert.ok(b.has('ritualformel_laterne_3'));
});

test('Bedarf: gebrauter Trank zählt seine Zutaten nicht mehr', () => {
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 4, digestion: 0 };
  s.addItem('trank_laterne_3');
  assert.ok(!s.pfadBedarf().get('sq_zutat_laterne_3'));
});

test('Verkaufswarnung nur, wenn danach zu wenig bleibt', () => {
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 4, digestion: 0 };
  s.addItem('sq_zutat_laterne_3');
  assert.equal(s.verkaufWarnung('sq_zutat_laterne_3').length, 1);
  s.addItem('sq_zutat_laterne_3');
  assert.equal(s.verkaufWarnung('sq_zutat_laterne_3').length, 0);
});
