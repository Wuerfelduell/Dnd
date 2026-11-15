// Calderwick-Pfadviertel (Seb 2026-11-15): jeder Pfad hat dort lange zu tun, alle Zutaten der Formeln 3/2/1 sind dort zu finden
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { STURZ_FLAGS } from '../src/data/aufstieg.js';
import { HERDE, FORMEL3_PREIS } from '../src/data/pfadviertel.js';
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

test('Herzkette: Spur → Herd nacheinander, Kernzutat 2 nach Herd 4, Kernzutat 1 im Herz', () => {
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
    assert.deepEqual(content.encounters[`o3_${pid}_herz`].first_win.gives_items, { [kernzutat(pid, 1)]: 1 });
    assert.ok(s.meets(herz.visible_if));
    assert.ok(s.quests[`o3_${pid}_herzkette`] !== undefined);
  }
});

test('Codex-Ersatzquellen fragen nach echten Pfad-Ids', () => {
  for (const n of [1, 2]) for (const node of Object.values(content.dialogues[`cwo_kern_${n}`].nodes)) for (const c of node.choices ?? []) if (c.requires_pathway) assert.ok(content.pathways[c.requires_pathway[0]], c.requires_pathway[0]);
});
