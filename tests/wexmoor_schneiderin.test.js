// Kleiderladen in Wexmoor (Seb, 2026-11-12): Mäntel, Hüte und Anhänger gab es nach der Abreise aus Kettlegate nur noch
// über Gorse in Zunders Schmuggelkiste. Jetzt steht Schneiderin Ottilie Fenn sichtbar am Salzmarkt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { SHEETS, CHARACTER_SHEETS } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const ID = 'wx_schneiderin';

test('Ottilie Fenn steht am Salzmarkt und verkauft Hüte, Mäntel und Amulette', () => {
  const npc = content.maps.wx_salzmarkt.npcs.find((n) => n.id === ID);
  assert.ok(npc && !npc.visible_if, 'immer sichtbar');
  assert.ok(existsSync(new URL(`../public/sprites/${SHEETS[CHARACTER_SHEETS[`npc_${ID}`]]}`, import.meta.url)), 'Lauf-Sheet');
  const m = content.market.merchants[ID];
  const slots = new Set(m.stock.map((e) => content.items[e.item]?.slot));
  for (const s of ['hut', 'mantel', 'amulett']) assert.ok(slots.has(s), s);
  for (const e of m.stock) {
    assert.equal(content.items[e.item]?.kind, 'gear', e.item);
    assert.ok(e.price >= content.items[e.item].price, `${e.item} nicht billiger als in Kettlegate`);
  }
  assert.ok(content.dialogues[ID].nodes.start.choices.some((c) => c.shop === ID));
});

test('Kauf bei Fenn legt den Mantel direkt an', () => {
  const s = new GameState(content);
  s.money = 500;
  assert.ok(s.shopStock(ID).some((e) => e.item === 'mantel_leder'));
  assert.equal(s.buy(ID, 'mantel_leder').ok, true);
  assert.equal(s.gear.mantel, 'mantel_leder');
});
