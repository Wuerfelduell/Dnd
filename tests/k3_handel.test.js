// Kapitel 3 (BC/BD): Handel, Schichtbund und Einzelgänger in Dunscar; Tag und Nacht folgen der Spielzeit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { DAY_NIGHT_SECONDS, NIGHT_FLAG, isNightAt } from '../src/core/Clock.js';
import { BC_FIGURES, BC_LONERS, CHARACTER_SHEETS, SHEETS, PORTRAITS, BATTLE_SHEETS, headUrl, itemIconUrl, mapMarkerOf } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const pub = (url) => new URL(`../public/${url.replace(/^\.\//, '')}`, import.meta.url);

test('Nacht: das Flag folgt der Spielzeit und steht nie im Spielstand', () => {
  const s = new GameState(content);
  assert.equal(isNightAt(0), false);
  assert.equal(isNightAt(DAY_NIGHT_SECONDS), true);
  assert.equal(s.isNight(), false);
  s.tickGatherings(DAY_NIGHT_SECONDS + 1);
  assert.ok(s.flags.has(NIGHT_FLAG), 'nachts gesetzt');
  assert.ok(!s.serialize().flags.includes(NIGHT_FLAG), 'nicht gespeichert');
  const t = new GameState(content);
  t.load({ ...s.serialize(), flags: [...s.serialize().flags, NIGHT_FLAG], playTime: 10 });
  assert.ok(!t.flags.has(NIGHT_FLAG), 'beim Laden aus der Spielzeit abgeleitet');
  s.tickGatherings(DAY_NIGHT_SECONDS);
  assert.ok(!s.flags.has(NIGHT_FLAG), 'tags wieder gelöscht');
});

test('Schichtbund: Zirkel, Treffpunkt, Pin und Händler sind im Spiel', () => {
  assert.ok(content.gatherings.circles.schichtbund);
  assert.deepEqual(content.gatherings.rules.orders.dunscar, ['schichtbund']);
  assert.ok(content.gatherings.rules.order.length && content.gatherings.rules.orders.wexmoor?.length, 'Kettlegate und Wexmoor bleiben');
  assert.ok(content.maps.treffen_schichtbund && content.travelRules.cities.dunscar.pins.treffen_schichtbund);
  assert.ok(content.travel.some((t) => t.map === 'treffen_schichtbund' && t.city === 'dunscar'));
  assert.ok(existsSync(pub(mapMarkerOf('treffen_schichtbund')[0])));
  for (const id of ['k3h_troedlerin', 'k3h_steinmetz', 'k3h_lampenwart']) assert.ok(content.market.merchants[id]?.stock.length, id);
  assert.ok(content.market.sell_prices.k3o_rufwachs ?? content.market.sell_prices.k3h_schichtkappe !== undefined);
  for (const id of BC_LONERS) assert.ok(content.loners.list[id] && content.encounters[id]?.sheet === `enemy_${id}`, id);
  for (const id of Object.keys(content.artifacts.list).filter((a) => a.startsWith('ez_ds_'))) assert.ok(content.items[id], id);
});

test('BE: alle zwölf BC-Figuren haben Lauf-Sheet, Portrait und Kopf, die Einzelgänger ein Kampf-Sheet, die Waren ein Bild', () => {
  for (const id of BC_FIGURES) {
    assert.ok(content.npcs[id], id);
    assert.ok(existsSync(pub(`sprites/${SHEETS[CHARACTER_SHEETS[`npc_${id}`]]}`)), id);
    assert.ok(existsSync(pub(`sprites/portraits/${PORTRAITS[id]}`)), id);
    assert.ok(existsSync(pub(`sprites/portraits/AK_${id}_emotions2.png`)), id);
    assert.ok(headUrl(id) && existsSync(pub(headUrl(id))), id);
  }
  for (const id of BC_LONERS) assert.ok(existsSync(pub(`sprites/${BATTLE_SHEETS[`enemy_${id}`][0]}`)), id);
  for (const id of Object.keys(content.items).filter((i) => i.startsWith('k3h_') || i.endsWith('_gabe'))) assert.ok(existsSync(pub(itemIconUrl(id))), id);
});
