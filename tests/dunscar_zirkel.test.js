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

test('Drei Zirkel in Dunscar: alte Stücke zu alten Preisen, neue im Tausenderbereich, Seq-3-Formeln selten und teuer', () => {
  assert.deepEqual(dunscar.map(([id]) => id).sort(), ['kalkofen', 'schichtbund', 'stellwerk']);
  for (const [id, c] of dunscar) {
    for (const m of c.members) for (const o of m.offers) {
      const it = content.items[o.item];
      if (it.kind === 'formula') {
        assert.ok(it.seq >= 3, o.item);
        assert.equal(o.price, { 6: 640, 5: 900, 4: 4000, 3: 15000 }[it.seq], o.item);
        if (it.seq === 3) assert.equal(o.chance, 0.01, o.item);
      }
      if (o.item.startsWith('dsz_')) assert.ok(o.price >= 1500, `${id}/${o.item}: ${o.price}`);
    }
  }
  const lose = (cid) => C[cid].members.flatMap((m) => m.offers.map((o) => o.item));
  for (const pid of Object.keys(content.pathways)) {
    assert.ok(lose('kalkofen').includes(`formel_${pid}_4`), `Halbgott-Formel ${pid}`);
    assert.ok(dunscar.some(([cid]) => lose(cid).includes(`formel_${pid}_3`)), `Seq-3-Formel ${pid}`);
  }
  assert.ok(lose('schichtbund').includes('k3o_rufwachs'), 'alte Schichtbund-Lose bleiben');
  assert.equal(C.schichtbund.members.flatMap((m) => m.offers).filter((o) => /^sq_zutat_.+_4$/.test(o.item)).length, 10);
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
  assert.ok(s.auction.lot.price > 0, `Startgebot ${s.auction.lot.price}`);
});
