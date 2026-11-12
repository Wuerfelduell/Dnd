import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { rollLoot, lootPreview } from '../src/core/Loot.js';
import { ALT_ZONES } from '../src/data/altbeute.js';

const c = loadContent();

test('Altfunde: Wexmoor-Monster lassen ab und zu Kettlegater Beute fallen, nie Formeln', () => {
  const wx = Object.entries(c.encounters).filter(([id, e]) => String(e.zone ?? '').startsWith('wx_') && c.loot[id]);
  assert.ok(wx.length > 20);
  for (const [id] of wx) {
    const alt = c.loot[id].alt;
    assert.ok(alt?.pool?.length >= 20, `${id}: Altfund-Topf`);
    assert.ok(alt.chance > 0 && alt.chance < 0.5, `${id}: nur manchmal`);
    for (const { item } of alt.pool) {
      assert.ok(c.items[item], `${id}: ${item} existiert`);
      assert.ok(!item.startsWith('formel_'), `${id}: keine Formel im Altfund (${item})`);
    }
  }
  // Kettlegater Gebiete selbst bekommen keinen Altfund
  for (const [id, e] of Object.entries(c.encounters)) if (ALT_ZONES.includes(e.zone)) assert.equal(c.loot[id]?.alt, undefined, id);
});

test('Altfunde: rollLoot zieht genau ein Stück, Bestiarium nennt den Altfund', () => {
  const alt = c.loot.torfgaenger.alt;
  let seq = [0, 0.5];
  const r = rollLoot({ alt }, () => seq.shift() ?? 0.99);
  assert.equal(Object.values(r.items).reduce((a, b) => a + b, 0), 1);
  assert.deepEqual(rollLoot({ alt }, () => 0.99).items, {});
  const p = lootPreview(c.loot.torfgaenger, c.items, c.loot.torfgaenger_elite);
  assert.ok(p.alt && p.alt.chance === alt.chance);
});

test('Altfunde: Nachtfalterstaub fällt im Leuchtturm fest mit 5 %', () => {
  const ids = Object.keys(c.encounters).filter((id) => c.encounters[id].zone === 'wx_leuchtturm' && c.loot[id]);
  assert.ok(ids.length);
  for (const id of ids) assert.equal(c.loot[id].drops.find((d) => d.item === 'nachtfalterstaub')?.chance, 0.05, id);
});
