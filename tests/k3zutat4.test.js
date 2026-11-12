import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';

const content = loadContent();

test('Schichtbund (Dunscar) bietet die Seq-4-Kernzutaten aller Pfade, aber keine Formel 4', () => {
  const offers = content.gatherings.circles.schichtbund.members.flatMap((m) => m.offers.map((o) => o.item));
  for (const pid of Object.keys(content.pathways)) {
    if (!content.pathways[pid].seqs[4]) continue;
    assert.ok(offers.includes(`sq_zutat_${pid.replace(/^sq_/, '')}_4`), pid);
  }
  assert.ok(!offers.some((i) => /^formel_.*_4$/.test(i)));
});

test('Kapitel-3-Elite droppt die Seq-4-Kernzutat nur auf Seq 5 und nur solange sie fehlt', () => {
  const s = new GameState(content);
  s.pathway = { ...(s.pathway ?? {}), id: 'laterne', seq: 5 };
  const enc = Object.values(content.encounters).find((e) => e.chapter === 3 && e.elite);
  const roll = () => { const loot = { items: {} }; s.pfadExtraLoot({ enc, id: 'x', rng: () => 0.9 }, loot, () => 0.01); return loot.items; };
  assert.equal(roll().sq_zutat_laterne_4, 1);
  s.inventory.sq_zutat_laterne_4 = 1;
  assert.equal(roll().sq_zutat_laterne_4, undefined);
  delete s.inventory.sq_zutat_laterne_4;
  s.pathway.seq = 6;
  assert.equal(roll().sq_zutat_laterne_4, undefined);
});
