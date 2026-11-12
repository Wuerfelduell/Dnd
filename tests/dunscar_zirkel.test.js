// Dunscar-Zirkel (Seb, 2026-11-12): Lose im Tausenderbereich, seltene und „unmögliche“ Stücke,
// zwei weitere Zirkel (Kalter Ofen, Stummes Stellwerk) offen ab der Ankunft.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { SHEETS, CHARACTER_SHEETS } from '../src/world/assets.js';
import { DS_ZIRKEL_ICONS, DS_ZIRKEL_FIGUREN } from '../src/data/dunscarZirkel.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const C = content.gatherings.circles;
const dunscar = Object.entries(C).filter(([, c]) => c.city === 'dunscar');

test('Drei Zirkel in Dunscar, alle Lose ab 1500 Schilling, keine Formel unter Sequenz 4', () => {
  assert.deepEqual(dunscar.map(([id]) => id).sort(), ['kalkofen', 'schichtbund', 'stellwerk']);
  for (const [id, c] of dunscar) {
    for (const m of c.members) for (const o of m.offers) {
      assert.ok(o.price >= 1500, `${id}/${o.item}: ${o.price}`);
      const it = content.items[o.item];
      if (it.kind === 'formula') assert.ok(it.seq >= 4, `${o.item}: Seq-3-Formeln nur im Pfadgebiet`);
    }
  }
  const lose = (cid) => C[cid].members.flatMap((m) => m.offers.map((o) => o.item));
  for (const pid of Object.keys(content.pathways)) assert.ok(lose('kalkofen').includes(`formel_${pid}_4`), `Halbgott-Formel ${pid}`);
  const z4 = C.schichtbund.members.flatMap((m) => m.offers).filter((o) => /^sq_zutat_.+_4$/.test(o.item));
  assert.equal(z4.length, 10);
  for (const o of z4) assert.equal(Math.round(o.price * 0.6), 4500);
});

test('Neue Stücke haben Bilder, die Figuren Lauf-Sheets', () => {
  for (const id of DS_ZIRKEL_ICONS) {
    assert.ok(content.items[id], id);
    assert.ok(existsSync(`public/sprites/items/${id}.png`) && existsSync(`public/sprites/items/32/${id}.png`), id);
  }
  for (const id of DS_ZIRKEL_FIGUREN) assert.ok(existsSync(`public/sprites/${SHEETS[CHARACTER_SHEETS[`npc_${id}`]]}`), id);
});

test('Nach der Ankunft ist man in allen drei Zirkeln; die Treffen wechseln sich ab', () => {
  const s = new GameState(content);
  s.flags.add('k3_arrived');
  s.flags.add('treffen_schichtbund');
  s.flags.add('briefed_04');
  s.map = 'ds_kalkmarkt';
  for (const id of ['schichtbund', 'kalkofen', 'stellwerk']) assert.ok(s.isMember(id), id);
  const seen = new Set([0, 1, 2].map((c) => s.gatheringSlot(c).id));
  assert.equal(seen.size, 3);
  // Eine Runde im Kalten Ofen eröffnen
  let c = 0;
  while (s.gatheringSlot(c).id !== 'kalkofen') c++;
  s.playTime = s.gatheringSlot(c).start + 1;
  assert.ok(s.gatheringsUnlocked());
  assert.ok(s.startSession('kalkofen').ok);
  assert.ok(s.auction.lot.price >= 900, `Startgebot ${s.auction.lot.price}`);
});
