import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { beyonderInfo, pfadZeile } from '../src/core/Combat.js';
import { WILDE_SEQ } from '../src/data/gegnerBeyonder.js';

const c = loadContent();
const en = JSON.parse(readFileSync(new URL('../src/i18n/en/gegner_beyonder.json', import.meta.url), 'utf8'));

test('Wilde Beyonder: ab Dunscar ist jede Elite-Spielart ein Beyonder mit Pfad-Fertigkeiten, ohne Formel', () => {
  const elites = Object.entries(c.encounters).filter(([id, e]) => id.endsWith('_elite') && !e.boss && WILDE_SEQ[e.chapter]);
  assert.ok(elites.length >= 30);
  for (const [id, e] of elites) {
    assert.ok(e.beyonder && e.beyonder_pfad, id);
    assert.ok(e.attacks.some((a) => a.pfad), `${id}: keine Pfad-Fertigkeit`);
    if (e.rest_chance !== undefined) assert.ok(!(c.loot[id]?.drops ?? []).some((d) => /^formel_/.test(d.item)), `${id}: Formel in der Beute`);
  }
});

test('Beyonder-Daten: Pfad, Sequenz, Farbe; Protokollzeile verrät den Pfad nicht', () => {
  const e = c.encounters.schichtgaenger_elite;
  const b = beyonderInfo(c, e);
  assert.equal(b.pid, e.beyonder_pfad);
  assert.equal(b.seq, 5);
  assert.match(b.color, /^#[0-9a-f]{6}$/i);
  const atk = e.attacks.find((a) => a.pfad);
  assert.equal(pfadZeile({ name: 'X', beyonder: b }, atk), `X: ${atk.name}`);
  assert.equal(beyonderInfo(c, c.encounters.schichtgaenger), null);
});

test('EN: Ankündigung der Pfadfähigkeit im Wörterbuch', () => {
  assert.ok(en['✦ Pfadfähigkeit']);
});
