// Calderwick-Pfadviertel (Seb 2026-11-15): jeder Pfad hat dort lange zu tun, alle Zutaten der Formeln 3/2/1 sind dort zu finden
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { STURZ_FLAGS } from '../src/data/aufstieg.js';
import { travelDestinations } from '../src/core/Travel.js';
import { HERDE, FORMEL3_PREIS, VIERTEL_SELTEN } from '../src/data/pfadviertel.js';
import { kernzutat, ritualformel } from '../src/data/seqHoch.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const PIDS = Object.keys(content.pathways);

test('jedes Viertel: Krämer mit Grundzutaten und Formeln 3 für 15.000, Monster lassen Grundzutaten fallen (Geisteressenz nur Beute)', () => {
  for (const pid of PIDS) {
    const m = content.market.merchants[`o3_${pid}_kraemer`];
    const preis = Object.fromEntries(m.stock.map((s) => [s.item, s.price]));
    assert.equal(preis[`formel_${pid}_3`], FORMEL3_PREIS, pid);
    assert.equal(preis[ritualformel(pid)], FORMEL3_PREIS, pid);
    for (const g of ['nebeltau', 'silberstaub']) assert.ok(preis[g] > 0, `${pid}: ${g}`);
    const beute = new Set(content.loot[`o3_${pid}_g1`].drops.map((d) => d.item));
    // alle Grundzutaten des Tranks 3/2/1 gibt es beim Krämer
    for (const n of [3, 2, 1]) for (const item of Object.keys(content.pathways[pid].seqs[n].ingredients)) assert.ok(preis[item] || beute.has(item) || /^sq_zutat_/.test(item), `${pid} Seq ${n}: ${item}`);
    assert.ok(content.loot[`o3_${pid}_g1`].drops.some((d) => d.item === 'silberstaub'));
    assert.ok(content.maps[`o3_${pid}`].interactables.some((i) => i.id === `o3_${pid}_kraemer`));
  }
});

test('Herzkette: Spur → Herd nacheinander, Kernzutat 2 nach Herd 4, Formel 1 im Herz', () => {
  for (const pid of PIDS) {
    const s = new GameState(content);
    for (const f of STURZ_FLAGS) s.flags.add(f);
    const ints = Object.fromEntries(content.maps[`o3_${pid}`].interactables.map((i) => [i.id, i]));
    const herz = ints[`o3_${pid}_herz`];
    for (let i = 1; i <= HERDE.length; i++) {
      const spur = ints[`o3_${pid}_spur${i}`];
      const herd = ints[`o3_${pid}_herd${i}`];
      assert.ok(spur.tile && herd.tile, `${pid} ${i}: Kacheln`);
      assert.ok(s.meets(spur.visible_if) && !s.meets(herd.visible_if), `${pid} ${i}: erst die Spur`);
      s.flags.add(spur.done_flag);
      if (spur.effects) s.applyEffects(spur.effects);
      assert.ok(s.meets(herd.visible_if));
      assert.ok(!s.meets(herz.visible_if));
      s.flags.add(`won_o3_${pid}_herd${i}`);
    }
    assert.deepEqual(content.encounters[`o3_${pid}_herd4`].first_win.gives_items, { [kernzutat(pid, 2)]: 1 });
    assert.deepEqual(content.encounters[`o3_${pid}_herz`].first_win.gives_items, { [`formel_${pid}_1`]: 1 });
    assert.ok(s.meets(herz.visible_if));
    assert.ok(s.quests[`o3_${pid}_herzkette`] !== undefined);
  }
});

test('Codex-Ersatzquellen fragen nach echten Pfad-Ids', () => {
  for (const n of [1, 2]) for (const node of Object.values(content.dialogues[`cwo_kern_${n}`].nodes)) for (const c of node.choices ?? []) if (c.requires_pathway) assert.ok(content.pathways[c.requires_pathway[0]], c.requires_pathway[0]);
});

// Seb 2026-11-26: Calderwick ist Seq-3-Gebiet. Seq 1 nur noch die Formel vom Herz, Seq 3 und 2 im eigenen Viertel farmbar.
test('Viertel: keine Seq-1-Zutat, Formel 1 nur vom Herz, Seq 3/2 als seltene Beute', () => {
  for (const pid of PIDS) {
    const id = `o3_${pid}`;
    const map = content.maps[id];
    assert.ok(!map.interactables.some((i) => i.id === `${id}_schrein1`), `${pid}: kein Inschriften-Schrein`);
    const gaben = [...map.interactables.map((i) => i.effects?.gives_items), ...Object.values(content.encounters).filter((e) => e.zone === id).map((e) => e.first_win?.gives_items)];
    for (const g of gaben) for (const item of Object.keys(g ?? {})) {
      assert.notEqual(item, kernzutat(pid, 1), `${pid}: Kernzutat 1 im Viertel`);
      if (item === `formel_${pid}_1`) assert.deepEqual(g, content.encounters[`${id}_herz`].first_win.gives_items);
    }
    for (const [mid, m] of Object.entries(content.market.merchants)) if (mid.startsWith(id)) assert.ok(!m.stock.some((s) => /_1$/.test(s.item) && /^(sq_zutat|formel|ritualformel)_/.test(s.item)), mid);
    for (const lid of Object.keys(content.loot).filter((k) => k.startsWith(`${id}_`))) assert.ok(!content.loot[lid].drops?.some((d) => /^(sq_zutat_.*_1|formel_.*_1)$/.test(d.item)), lid);
    const drops = Object.fromEntries(content.loot[`${id}_g1`].drops.map((d) => [d.item, d.chance]));
    assert.equal(drops[kernzutat(pid, 3)], VIERTEL_SELTEN.kern3, pid);
    assert.equal(drops[kernzutat(pid, 2)], VIERTEL_SELTEN.kern2, pid);
    assert.equal(drops[`formel_${pid}_2`], VIERTEL_SELTEN.formel2, pid);
    assert.ok(content.loot[`${id}_g1`].repeat, `${pid}: Beute wiederholbar`);
  }
  assert.ok(content.market.merchants.o3_kessel_kraemer.stock.some((s) => s.item === 'wurf_gift'));
  assert.ok(content.loot.o3_eisen_g1.drops.some((d) => content.items[d.item]?.kind === 'artifact'));
  // Kernzutat 1 bleibt anderswo erreichbar (keine Sackgasse)
  assert.ok(Object.values(content.dialogues.cwo_kern_1.nodes).some((n) => JSON.stringify(n).includes(kernzutat('eisen', 1))));
});

test('Viertel nur betreten, wer auf diesem Pfad Seq 4 oder besser ist', () => {
  const s = new GameState(content);
  for (const f of STURZ_FLAGS) s.flags.add(f);
  s.map = 'cw_gleisfuss';
  const viertel = () => travelDestinations(s, 'cw_gleisfuss').filter((t) => t.map.startsWith('o3_')).map((t) => t.map);
  s.pathway = { id: 'eisen', seq: 5 };
  assert.deepEqual(viertel(), []);
  s.pathway = { id: 'eisen', seq: 4 };
  assert.deepEqual(viertel(), ['o3_eisen']);
  s.pathway = { id: 'sq_waage', seq: 3 };
  assert.deepEqual(viertel(), ['o3_sq_waage']);
});
