import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GEIST_CHANCE } from '../src/data/zutatDrops.js';

test('Geisteressenz ab Dunscar: jeder Gegner hat eine Grundchance, Wexmoor bleibt unverändert', () => {
  const c = loadContent();
  const chance = (id) => (c.loot[id]?.drops ?? []).find((d) => d.item === 'geisteressenz')?.chance ?? 0;
  assert.equal(chance('schichtgaenger'), GEIST_CHANCE.normal);
  assert.equal(chance('schichtgaenger_elite'), GEIST_CHANCE.elite);
  assert.ok(chance('ds_gb_bruchmeister') >= GEIST_CHANCE.boss);
  assert.equal(chance('vg_cw_letternlaeufer'), GEIST_CHANCE.normal);
  assert.equal(chance('vg_bh_glasmotte'), GEIST_CHANCE.normal);
  assert.equal(chance('o3_laterne_herd1'), 1); // Herden behalten ihre sichere Essenz
  assert.equal(chance('vg_cw_boss_bleisammler_phase2'), 0); // Boss-Phasen nicht doppelt
  assert.equal(chance('torfgaenger'), 0); // Wexmoor unverändert
});
