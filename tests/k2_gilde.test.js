import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { AO_FIGURES, SHEETS, CHARACTER_SHEETS, PORTRAITS, AK_FIGURES, itemIconUrl } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const sprite = (p) => new URL(`../public/sprites/${p}`, import.meta.url);

test('Paket AQ: Täfelchengilde ist dritter Wexmoorer Zirkel mit Treffpunkt, Pin und Reiseziel', () => {
  const g = content.gatherings;
  assert.deepEqual(g.rules.orders.wexmoor, ['lichtlose', 'salz', 'namensgilde']);
  assert.ok(g.rules.orders.kettlegate ?? g.rules.interval ?? Object.keys(g.rules).length > 1, 'übrige Regeln bleiben');
  assert.equal(g.circles.namensgilde.map, 'treffen_namensgilde');
  assert.ok(content.maps.treffen_namensgilde);
  assert.deepEqual(content.travelRules.cities.wexmoor.pins.treffen_namensgilde, [364, 230]);
  assert.ok(content.travel.some((t) => t.map === 'treffen_namensgilde' && t.requires_gathering === 'namensgilde'));
  for (const id of ['k2g_zeugenklammer', 'k2g_nachhallspule']) {
    assert.ok(content.artifacts.list[id], id);
    assert.equal(content.items[id].kind, 'artifact');
  }
  for (const q of ['k2g_aufnahme', 'k2g_esse_stempel', 'k2g_kerbe_hand', 'k2g_mulde_ruf']) assert.ok(content.quests[q], q);
});

test('Paket AQ: in Wexmoor wechseln sich drei Zirkel ab', () => {
  const s = new GameState(content);
  for (const f of ['treffen_namensgilde', 'briefed_04', 'k2_akt2_done']) s.flags.add(f);
  s.map = 'wx_pfahldorf';
  assert.deepEqual([0, 1, 2].map((c) => s.gatheringSlot(c).id), ['lichtlose', 'salz', 'namensgilde']);
  s.playTime = s.gatheringSlot(2).start + 1;
  assert.ok(s.startSession('namensgilde').ok);
});

test('Paket AO: elf Wexmoor-Figuren mit Lauf-Sheet, Portraits und Kopf', () => {
  assert.equal(AO_FIGURES.length, 11);
  for (const id of AO_FIGURES) {
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), id);
    assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
    assert.ok(existsSync(sprite(`portraits/AK_${id}_emotions2.png`)), id);
    assert.ok(existsSync(sprite(`ui/heads/${id}.png`)), id);
    assert.ok(AK_FIGURES.has(id), id);
  }
  for (const id of Object.keys(content.items).filter((i) => i.startsWith('k2g_'))) {
    assert.ok(existsSync(new URL(`../public/${itemIconUrl(id).replace(/^\.?\//, '')}`, import.meta.url)), id);
  }
});
