// Händler in Dunscar (Seb, 2026-11-12): Ohne Rückreise nach Kettlegate/Wexmoor braucht Dunscar Läden für die alten
// Waffen, Kleidung, Amulette, Kräuter und Grundvorräte, und jemanden, der Beute ankauft.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { SHEETS, CHARACTER_SHEETS } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const M = content.market.merchants;
const stockOf = (id) => M[id].stock.map((e) => e.item);
const sprite = (path) => new URL(`../public/sprites/${path}`, import.meta.url);

test('Drei neue Händlerinnen stehen am Kalkmarkt, mit Lauf-Sheet, Gespräch und Laden', () => {
  const map = content.maps.ds_kalkmarkt;
  for (const id of ['ds_waffenhaendlerin', 'ds_kleiderhaendlerin', 'ds_kraeuterfrau']) {
    const n = map.npcs.find((x) => x.id === id);
    assert.ok(n, id);
    assert.equal(map.rows[n.tile[1]][n.tile[0]], '.', `${id} steht auf freiem Boden`);
    assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${id}`]])), `${id}: Lauf-Sheet`);
    assert.equal(content.npcs[id].dialogue, id);
    assert.ok(content.dialogues[id].nodes.start.choices.some((c) => c.shop === id));
    assert.ok(M[id].stock.length >= 8, id);
    for (const e of M[id].stock) assert.ok(content.items[e.item] && e.price > 0, e.item);
  }
});

test('Sortiment: alte Waffen, Kleidung, Amulette, Kräuter, teurer als in Kettlegate', () => {
  for (const w of ['revolver', 'regenschirmdegen', 'brecheisen', 'taktstock_silber']) assert.ok(stockOf('ds_waffenhaendlerin').includes(w), w);
  for (const g of ['mantel_leder', 'hut_zylinder', 'amulett_laterne', 'amulett_stimme']) assert.ok(stockOf('ds_kleiderhaendlerin').includes(g), g);
  for (const z of ['nebeltau', 'silberstaub', 'mondmohn', 'leeres_gefaess']) assert.ok(stockOf('ds_kraeuterfrau').includes(z), z);
  const kg = (id) => [...M.gorse.stock, ...M.kittering.stock, ...M.nell.stock].find((e) => e.item === id)?.price;
  for (const e of M.ds_waffenhaendlerin.stock) assert.ok(e.price > kg(e.item), e.item);
});

test('Keine Formeln, keine Zutaten ab Sequenz 7, keine Treffen-Lose im normalen Sortiment', () => {
  const high = new Set(Object.values(content.pathways).flatMap((p) => [7, 6, 5, 4, 3, 2, 1].flatMap((q) => Object.keys(p.seqs[q]?.ingredients ?? {}))));
  high.delete('nebeltau'); high.delete('silberstaub');
  const lots = new Set(Object.values(content.gatherings.circles).flatMap((c) => (c.members ?? []).flatMap((m) => m.offers.map((e) => e.item))));
  for (const id of ['ds_waffenhaendlerin', 'ds_kleiderhaendlerin', 'ds_kraeuterfrau', 'k3h_troedlerin']) {
    for (const e of M[id].stock) {
      assert.notEqual(content.items[e.item].kind, 'formula', `${id}: ${e.item}`);
      assert.ok(!high.has(e.item), `${id}: ${e.item}`);
      if (id !== 'k3h_troedlerin') assert.ok(!lots.has(e.item), `${id}: ${e.item} ist ein Treffen-Los`);
    }
  }
});

test('Ida Marrow kauft Beute an und führt Grundvorräte', () => {
  assert.ok(M.k3h_troedlerin.buys);
  for (const v of ['bannsalz', 'ruhetee', 'lampenoel', 'verband', 'tonikum']) assert.ok(stockOf('k3h_troedlerin').includes(v), v);
  const sell = content.dialogues.k3h_troedlerin.nodes.start.choices.find((c) => c.shop_mode === 'sell');
  assert.equal(sell?.shop, 'k3h_troedlerin');
  const s = new GameState(content);
  const trophy = Object.keys(content.items).find((id) => content.items[id].kind === 'trophy' && s.sellPrice(id));
  s.addItem(trophy);
  const before = s.money;
  assert.ok(s.sell(trophy, 'k3h_troedlerin').ok);
  assert.ok(s.money > before);
});

test('Wilma Rook führt das Wachsamulett gegen Unruhe', async () => {
  const content = await loadContent();
  const e = content.market.merchants.ds_kleiderhaendlerin.stock.find((x) => x.item === 'wachsamulett');
  assert.ok(e && e.price === content.items.wachsamulett.price * 2);
});

test('Braukessel in Pfiffs Speisewagen (Unterkunft), auf freiem Boden, ohne Freischaltung', () => {
  const map = content.maps.ds_speisewagen;
  const k = map.interactables.filter((i) => i.kind === 'brew');
  assert.equal(k.length, 1);
  assert.equal(k[0].sprite, 'cauldron');
  assert.equal(k[0].visible_if, undefined);
  const [x, y] = k[0].tile;
  assert.equal(map.rows[y][x], 'w');
  const belegt = [...map.interactables, ...(map.npcs ?? []), ...(map.decor ?? [])].filter((i) => i !== k[0] && i.tile && i.tile[0] === x && i.tile[1] === y);
  assert.equal(belegt.length, 0);
});
