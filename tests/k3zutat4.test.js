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

test('Kapitel-3-Elite droppt die Seq-4-Kernzutat nur auf Seq 5 und nur bis zwei da sind', () => {
  const s = new GameState(content);
  s.pathway = { ...(s.pathway ?? {}), id: 'laterne', seq: 5 };
  const enc = Object.values(content.encounters).find((e) => e.chapter === 3 && e.elite);
  const roll = () => { const loot = { items: {} }; s.pfadExtraLoot({ enc, id: 'x', rng: () => 0.9 }, loot, () => 0.01); return loot.items; };
  assert.equal(roll().sq_zutat_laterne_4, 1);
  s.inventory.sq_zutat_laterne_4 = 1;
  assert.equal(roll().sq_zutat_laterne_4, 1, 'Formel 4 braucht zwei Kernzutaten');
  s.inventory.sq_zutat_laterne_4 = 2;
  assert.equal(roll().sq_zutat_laterne_4, undefined);
  delete s.inventory.sq_zutat_laterne_4;
  s.pathway.seq = 6;
  assert.equal(roll().sq_zutat_laterne_4, undefined);
});

test('Dunscar-Gegner droppen Formel 4 (Seq 5) und Formel 3 (Seq 4, nur Elite/Boss) sehr selten, auch für Spieler 2', async () => {
  const { FORMEL_K3_CHANCE } = await import('../src/data/pfadHandel.js');
  const k3 = (pred) => Object.values(content.encounters).find((e) => e.chapter === 3 && pred(e));
  const normal = k3((e) => !e.elite && !e.boss);
  const elite = k3((e) => e.elite && !e.boss);
  const boss = k3((e) => e.boss);
  const roll = (s, enc, r) => { const loot = { items: {} }; s.pfadExtraLoot({ enc, id: 'x' }, loot, () => r); return loot.items; };
  const s = new GameState(content);
  s.pathway = { ...(s.pathway ?? {}), id: 'laterne', seq: 5 };
  assert.equal(roll(s, normal, FORMEL_K3_CHANCE[4].normal + 0.0001).formel_laterne_4, undefined);
  assert.equal(roll(s, normal, FORMEL_K3_CHANCE[4].normal - 0.0001).formel_laterne_4, 1);
  assert.equal(roll(s, boss, 0).formel_laterne_4, undefined, 'nur einmal je Pfad');
  s.pathway.seq = 4;
  assert.equal(roll(s, normal, 0).formel_laterne_3, undefined, 'Formel 3 nie bei normalen Gegnern');
  assert.equal(roll(s, elite, FORMEL_K3_CHANCE[3].elite + 0.0001).formel_laterne_3, undefined);
  assert.equal(roll(s, boss, FORMEL_K3_CHANCE[3].boss - 0.0001).formel_laterne_3, 1);
  const t = new GameState(content);
  t.pathway = { ...(t.pathway ?? {}), id: 'laterne', seq: 7 };
  t.p2 = { active: true, pathway: { id: 'eisen', seq: 5 }, inventory: {} };
  assert.equal(roll(t, boss, 0).formel_eisen_4, 1, 'Spieler 2 zählt mit');
});

test('Formel 4 braucht zwei Kernzutaten: die eigene plus eine eigene oder vom Nachbarpfad', async () => {
  const seq = await import('../src/data/sequenzen.js');
  const s = new GameState(content);
  const base = { nebeltau: 2, geisteressenz: 2, silberstaub: 2 };
  s.inventory = { formel_laterne_4: 1, ...base, sq_zutat_laterne_4: 1 };
  let r = s.recipes().find((x) => x.formula === 'formel_laterne_4');
  assert.equal(r.ready, false, 'eine Kernzutat reicht nicht');
  assert.equal(s.brew('formel_laterne_4').ok, false);
  s.inventory.sq_zutat_laterne_4 = 2;
  assert.equal(s.brew('formel_laterne_4').ok, true);
  assert.equal(s.itemCount('sq_zutat_laterne_4'), 0);
  assert.equal(s.itemCount('trank_laterne_4'), 1);
  // Nachbarpfad: mit Testnachbarn neu bauen
  const n = Object.keys(content.pathways).find((p) => p !== 'laterne' && content.pathways[p].seqs[4]);
  const nz = `sq_zutat_${n.replace(/^sq_/, '')}_4`;
  content.items.formel_laterne_4 = { ...content.items.formel_laterne_4, zweitzutat: { need: 1, from: ['sq_zutat_laterne_4', nz] } };
  s.inventory = { formel_laterne_4: 1, ...base, sq_zutat_laterne_4: 1, [nz]: 1 };
  r = s.recipes().find((x) => x.formula === 'formel_laterne_4');
  assert.equal(r.ready, true);
  assert.equal(s.brew('formel_laterne_4').ok, true);
  assert.equal(s.itemCount(nz), 0);
  assert.equal(s.itemCount('sq_zutat_laterne_4'), 0);
  content.items.formel_laterne_4 = { ...content.items.formel_laterne_4, zweitzutat: seq.zweitzutat4('laterne', content.items) };
  // alle Formeln 4 tragen die Zweitzutat, eigene immer zuerst
  for (const pid of Object.keys(content.pathways)) {
    const f = content.items[`formel_${pid}_4`];
    if (f) assert.equal(f.zweitzutat?.from?.[0], `sq_zutat_${pid.replace(/^sq_/, '')}_4`, pid);
  }
});
