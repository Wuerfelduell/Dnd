// Paket AL: vier Wexmoorer Akten als Paket im Spiel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { BATTLE_SHEETS, ENCOUNTER_SHEETS, itemIconUrl } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const AKTEN = ['k2a_tinte', 'k2a_bittere_mittel', 'k2a_hafenrecht', 'k2a_letztes_bild'];

test('AL: Akten mit Fallregister, Enden und Zeitungsmeldungen', () => {
  for (const id of AKTEN) {
    assert.ok(content.quests[id], id);
    assert.ok(content.cases.some((c) => c.id === id), id);
    assert.equal(Object.values(content.endings).filter((e) => e.case === id).length, 3, id);
  }
  assert.equal(content.newspapers.filter((n) => n.id.startsWith('k2a_')).length, 12);
});

test('AL: jeder Kampf hat ein Sheet, jede Abschrift ein Symbol', () => {
  for (const [id, enc] of Object.entries(content.encounters)) {
    if (!id.startsWith('k2a_')) continue;
    const sheet = enc.sheet ?? ENCOUNTER_SHEETS[id];
    assert.ok(BATTLE_SHEETS[sheet] && existsSync(new URL(`../public/sprites/${BATTLE_SHEETS[sheet][0]}`, import.meta.url)), id);
  }
  for (const id of Object.keys(content.items).filter((i) => i.startsWith('k2a_'))) {
    assert.ok(existsSync(new URL(`../public/sprites/${itemIconUrl(id).replace(/^.*?sprites\//, '')}`, import.meta.url)), id);
  }
});
