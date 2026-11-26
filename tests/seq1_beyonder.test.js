// Seq-1-Beyonder in Briarholt (Seb 2026-11-26): je Pfad einer, für das spätere Seq 0. Zwei Engel (Seq 2) im Koop gewinnen nicht.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { SEQ1_BEYONDER, charId } from '../src/data/seq1Beyonder.js';
import { seq1Woerterbuch } from '../tools/i18n-seq1-beyonder.mjs';
import { duo, play } from '../tools/sim/zugwaechter.mjs';
import { loadContent, EXPERT } from './helpers.js';

const content = loadContent();
const PIDS = Object.keys(content.pathways);

test('zehn Seq-1-Beyonder, je Pfad einer, in Briarholt (kalt und warm), ansprechbar und herausforderbar', () => {
  assert.deepEqual(Object.keys(SEQ1_BEYONDER).sort(), [...PIDS].sort());
  for (const pid of PIDS) {
    const id = `s1b_${pid}`;
    const e = content.encounters[id];
    assert.equal(e.min_seq, 1, `${id}: höheres Wesen`);
    assert.equal(e.tier_seq, 1);
    assert.ok(e.attacks.some((a) => a.pfad), `${id}: Pfad-Fertigkeiten`);
    assert.ok(e.spaet_leben, `${id}: keine Spätleben-Skalierung`);
    for (const mid of [SEQ1_BEYONDER[pid].map, `${SEQ1_BEYONDER[pid].map}__warm`]) {
      const m = content.maps[mid];
      assert.equal(m.city, 'briarholt');
      assert.ok(m.npcs.some((n) => n.id === id), `${id} steht in ${mid}`);
    }
    const d = content.dialogues[content.npcs[id].dialogue];
    const kampf = d.nodes[d.nodes.hub.choices.find((c) => c.next === 'kampf').next];
    assert.equal(kampf.combat, id);
    assert.deepEqual(content.loot[id].drops, [{ item: charId(pid), chance: 1 }]);
  }
});

test('Charakteristik Seq 1: Platzhalter, wird nirgends verbraucht', () => {
  const ids = new Set(PIDS.map(charId));
  for (const id of ids) assert.ok(content.items[id]?.charakteristik);
  const txt = JSON.stringify({ items: Object.fromEntries(Object.entries(content.items).filter(([k]) => !ids.has(k))), quests: content.quests, market: content.market });
  for (const id of ids) assert.ok(!txt.includes(id), `${id} wird irgendwo gebraucht`);
  const s = new GameState(content);
  s.addItem(charId('eisen'));
  assert.equal(s.itemCount(charId('eisen')), 1);
});

test('Englisch: Wörterbuch vollständig (node tools/i18n-seq1-beyonder.mjs)', () => {
  const json = JSON.parse(readFileSync(new URL('../src/i18n/en/seq1_beyonder.json', import.meta.url), 'utf8'));
  assert.deepEqual(json, seq1Woerterbuch(content));
});

test('zwei Engel (Seq 2) im Koop schaffen ihn nicht, zwei Seq-1 schon', () => {
  for (const [a, b] of [['laterne', 'laterne'], ['eisen', 'schluessel']]) {
    assert.ok(play(duo(a, 2, b, 2, 100), 's1b_eisen', 1, EXPERT).left > 0, `Seq 2 ${a}+${b}`);
  }
  assert.ok(play(duo('laterne', 1, 'laterne', 1, 100), 's1b_eisen', 1, EXPERT).left <= 0, 'Seq 1 laterne+laterne');
});
