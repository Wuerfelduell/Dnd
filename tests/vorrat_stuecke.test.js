// Vorratsstücke aus den Codex-Zips Reserve200/nebel200: Händler, Beute, Treffen-Lose, Bilder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { VS_ITEMS, VS_ARTEFAKTE, VS_HAENDLER, VS_LOSE, VS_ICONS } from '../src/data/vorratStuecke.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Vorratsstücke: alle Gegenstände und Artefakte im Spiel, mit Bild in 16 und 32', () => {
  for (const id of [...Object.keys(VS_ITEMS), ...Object.keys(VS_ARTEFAKTE)]) {
    assert.ok(content.items[id], id);
    assert.ok(VS_ICONS.includes(id), `${id}: Bildquelle`);
    assert.ok(existsSync(`public/sprites/items/${id}.png`) && existsSync(`public/sprites/items/32/${id}.png`), `${id}: Bild`);
  }
  for (const id of Object.keys(VS_ARTEFAKTE)) assert.equal(content.items[id].kind, 'artifact', id);
});

test('Vorratsstücke: bei Händlern, in Wexmoor- und Dunscar-Beute und auf Treffen', () => {
  for (const [m, ids] of Object.entries(VS_HAENDLER)) for (const id of ids) assert.ok(content.market.merchants[m].stock.some((e) => e.item === id), `${m}: ${id}`);
  const drops = (pre) => new Set(Object.entries(content.encounters).filter(([, e]) => String(e.zone ?? '').startsWith(pre)).flatMap(([id]) => (content.loot[id]?.drops ?? []).map((d) => d.item)));
  assert.ok(drops('wx_').has('vs_jagdmesser') && drops('wx_').has('vs_ritualkelch'));
  assert.ok(drops('ds_').has('vs_goldbarren') && drops('ds_').has('vs_dornenkrone'));
  const lose = new Set(Object.values(content.gatherings.circles).flatMap((c) => c.members.flatMap((m) => (m.offers ?? []).map((o) => o.item))));
  for (const l of Object.values(VS_LOSE)) for (const [id] of l) assert.ok(lose.has(id), id);
});
