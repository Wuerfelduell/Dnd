import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { CHARACTER_SHEETS } from '../src/world/assets.js';

const content = loadContent();
const placements = JSON.parse(readFileSync(new URL('../src/data/packs/k2_akte/platzierung.json', import.meta.url), 'utf8'));

test('Paket AP: zehn Fährten und Krabbes Geschichte sind im Spiel, Krabbe hat seine AO-Figur', () => {
  const ids = Object.keys(content.quests).filter((q) => q.startsWith('k2v_'));
  assert.equal(ids.length, 11);
  assert.ok(content.npcs.wxn_krabbe);
  assert.equal(CHARACTER_SHEETS.npc_wxn_krabbe, 'ao_wxn_krabbe');
  assert.equal(content.quests.k2_akt5.steps.length, 3, 'Akt V bleibt bis zum separaten Einbau unverändert');
});

test('Paket AP: Platzierungen liegen nicht auf Objekten anderer Pakete', () => {
  for (const p of placements) {
    const m = content.maps[p.map];
    const id = p.npc ?? p.interactable.id;
    const others = [...(m.npcs ?? []), ...(m.interactables ?? [])].filter((o) => o.tile && o.id !== id && !o.id.startsWith('k2v_') && o.id !== 'wxn_krabbe');
    assert.ok(!others.some((o) => o.tile[0] === p.tile[0] && o.tile[1] === p.tile[1]), `${p.map} ${p.tile}: ${id}`);
  }
});
