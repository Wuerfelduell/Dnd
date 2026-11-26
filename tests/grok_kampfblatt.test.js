import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { ENCOUNTER_SHEETS, BATTLE_SHEETS } from '../src/world/assets.js';

/** Seb 2026-11-26: Tiefenvorarbeiter zeigte beim Auftritt das Grok-Bild, im Kampf aber das alte Blatt der Vorlage.
 *  Die Kampfbühne nimmt das eigene Blatt der Begegnung vor dem geerbten `sheet`; hier: jedes eigene Blatt existiert als Datei. */
test('Gegner mit eigenem Kampfblatt: Datei vorhanden', () => {
  const c = loadContent();
  for (const [id, e] of Object.entries(c.encounters)) {
    const own = ENCOUNTER_SHEETS[id];
    if (!own || !e.sheet || own === e.sheet) continue;
    const file = BATTLE_SHEETS[own]?.[0];
    assert.ok(file && existsSync(new URL(`../public/sprites/${file}`, import.meta.url)), `${id}: ${own} fehlt`);
  }
});
