import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { lootPreview, chanceWord } from '../src/core/Loot.js';

test('Bestiarium: Beute-Vorschau zeigt Drops, feste Items und Elite-Extras', () => {
  const items = { a: { name: 'A', price: 5 }, b: { name: 'B', price: 50 }, c: { name: 'C' } };
  const p = lootPreview({ repeat: true, money: [2, 6], drops: [{ item: 'a', chance: 0.7 }], items: { c: 1 } }, items, { drops: [{ item: 'a', chance: 1 }, { item: 'b', chance: 0.1 }] });
  assert.deepEqual(p.money, [2, 6]);
  assert.equal(p.repeat, true);
  assert.deepEqual(p.items.map((e) => e.id), ['b', 'c', 'a']);
  assert.equal(p.items.find((e) => e.id === 'c').first, true);
  assert.equal(p.items.find((e) => e.id === 'b').elite, true);
  assert.equal(chanceWord(0.7), 'häufig');
  assert.equal(chanceWord(0.05), 'kaum');
});

test('Bestiarium: alle Beute-Items der Gegner existieren', () => {
  const c = loadContent();
  for (const [id, table] of Object.entries(c.loot)) {
    if (!c.encounters[id]) continue;
    for (const e of lootPreview(table, c.items).items) assert.ok(c.items[e.id], `${id}: ${e.id}`);
  }
});

test('Bestiarium: Formeln stehen nie in der Beute-Vorschau, droppen aber weiter', () => {
  const c = loadContent();
  const t = c.loot.salzgeist_elite;
  assert.ok(t.drops.some((d) => d.item.startsWith('formel_')));
  const p = lootPreview(c.loot.salzgeist, c.items, t);
  assert.ok(!p.items.some((e) => e.id.startsWith('formel_')));
});
