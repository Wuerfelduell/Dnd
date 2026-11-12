// Händler zum Beute-Verkauf in Wexmoor (Seb, 2026-11-11): Bisher konnte man Beute („Klumps“) in Wexmoor nur über Gorse
// in Zunders Schmuggelkiste loswerden. Jetzt steht Pfandleiherin Maud Keel sichtbar am Salzmarkt, kauft alles
// Verkäufliche an und führt Grundvorräte. Funktioniert für beide Spieler im Koop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { SHEETS, CHARACTER_SHEETS } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const ID = 'wx_pfandleiherin';
const sprite = (path) => new URL(`../public/sprites/${path}`, import.meta.url);

test('Maud Keel steht am Salzmarkt, hat Figur, Lauf-Sheet, Gespräch und Laden mit Ankauf', () => {
  const sm = content.maps.wx_salzmarkt;
  const npc = sm.npcs.find((n) => n.id === ID);
  assert.ok(npc && (!npc.visible_if || new GameState(content).meets(npc.visible_if)), 'immer da, sobald man den Salzmarkt betritt (bis man sie als Beyonderin besiegt)');
  assert.ok(content.npcs[ID]?.palette && content.npcs[ID].dialogue === ID);
  assert.ok(existsSync(sprite(SHEETS[CHARACTER_SHEETS[`npc_${ID}`]])), 'Lauf-Sheet');
  const m = content.market.merchants[ID];
  assert.ok(m?.buys, 'kauft an');
  assert.ok(m.stock.length >= 6);
  for (const e of m.stock) assert.ok(content.items[e.item] && e.price > 0, e.item);
  const d = content.dialogues[ID];
  const sell = d.nodes.start.choices.find((c) => c.shop_mode === 'sell');
  assert.equal(sell?.shop, ID, 'Verkaufen-Auswahl öffnet den Ankauf direkt');
  assert.ok(d.nodes.start.choices.some((c) => c.shop === ID && !c.shop_mode), 'Kaufen-Auswahl');
  // Zunders Schmuggelkiste bleibt daneben bestehen
  assert.ok(content.dialogues.wx_schmuggelkiste.nodes.start.choices.some((c) => c.shop === 'gorse'));
});

test('Beute lässt sich bei ihr verkaufen, Schlüssel und Formeln nicht, der Hinweistext nennt sie', () => {
  const s = new GameState(content);
  const trophy = Object.keys(content.items).find((id) => content.items[id].kind === 'trophy' && s.sellPrice(id));
  s.addItem(trophy);
  const before = s.money;
  const r = s.sell(trophy, ID);
  assert.ok(r.ok, r.text);
  assert.equal(s.itemCount(trophy), 0);
  assert.ok(s.money > before);
  assert.match(s.sell(trophy, ID).text, /Maud Keel/);
  const key = Object.keys(content.items).find((id) => content.items[id].kind === 'key');
  assert.match(s.sell(key).text, /Gorse/, 'ohne Händler bleibt Gorse der Standard');
  for (const e of content.market.merchants[ID].stock.filter((x) => x.rare === undefined)) { // Restposten wechseln je Markttag
    s.money = 1000;
    assert.ok(s.buy(ID, e.item).ok, e.item);
  }
});

test('Koop: Spieler 2 verkauft aus dem eigenen Beutel, Spieler 1 behält seine Sachen', () => {
  const s = new GameState(content);
  s.addP2();
  const trophy = Object.keys(content.items).find((id) => content.items[id].kind === 'trophy' && s.sellPrice(id));
  s.addItem(trophy);
  s.withPlayer(2, () => s.addItem(trophy));
  const r = s.withPlayer(2, () => s.sell(trophy, ID));
  assert.ok(r.ok, r.text);
  assert.equal(s.withPlayer(2, () => s.itemCount(trophy)), 0);
  assert.equal(s.itemCount(trophy), 1, 'Spieler 1 behält seine Trophäe');
});
