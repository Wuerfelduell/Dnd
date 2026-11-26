import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { K4_MONEY_MULT, KOOP_GELD_SPAET, K5_BOSS_MONEY_MIN } from '../src/data/kapitelAusgleich.js';

// Seb 2026-11-26: „Preise und Beute nach Dunscar richtig skalieren“ – Seq 3 (2 × 15.000 je Spieler) in Calderwick erfarmbar.
const c = loadContent();
const mid = (L) => (Array.isArray(L?.money) ? (L.money[0] + L.money[1]) / 2 : 0);
const beute = (L) => (L?.drops ?? []).reduce((s, d) => s + (d.chance ?? 1) * Math.round((c.items[d.item]?.kind === 'trophy' ? c.items[d.item].price ?? 0 : 0) * 0.5), 0);
const schnitt = (pred) => {
  const ids = Object.keys(c.encounters).filter((id) => pred(id, c.encounters[id]) && c.loot[id]?.repeat && !/_phase\d/.test(id));
  return ids.reduce((s, id) => s + mid(c.loot[id]) + beute(c.loot[id]), 0) / ids.length;
};

test('Calderwick zahlt je normalem Gegner klar mehr als Dunscar (Geld + Trophäen)', () => {
  const cw = schnitt((id, e) => e.chapter === 4 && id.startsWith('vg_cw') && !e.boss && !/_elite/.test(id));
  const ds = schnitt((id, e) => e.chapter === 3 && !e.boss && !e.elite && !/_elite/.test(id));
  assert.ok(cw >= 400 && cw >= 2 * ds, `Calderwick ${Math.round(cw)} vs Dunscar ${Math.round(ds)}`);
});

test('Trophäen Kapitel 4/5: Ankauf bleibt unter dem Ladenpreis (Händler-Deckel)', () => {
  for (const m of Object.values(c.market.merchants)) for (const e of m.stock ?? []) {
    const it = c.items[e.item];
    if (it?.spaet_buffed && e.price) assert.ok(it.price * 0.5 <= e.price * 0.8, `${e.item}: ${it.price} / ${e.price}`);
  }
  assert.ok(c.items.vt_cw_letternlaeufer.price >= 100);
});

test('Kapitel-5-Bosse zahlen mindestens so viel wie Calderwick-Bosse, Koop-Bonus ab Kapitel 4', () => {
  for (const [id, e] of Object.entries(c.encounters)) {
    if (e.chapter === 5 && e.boss && c.loot[id]?.repeat && c.loot[id].money?.[1]) assert.ok(c.loot[id].money[1] >= K5_BOSS_MONEY_MIN[0], id);
  }
  assert.ok(K4_MONEY_MULT > 15 && KOOP_GELD_SPAET > 1);
});
