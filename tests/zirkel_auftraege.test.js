// Zirkel-Aufträge in Dunscar (Seb 2026-11-12): Monster oder Polizisten erledigen, Lohn beim nächsten Treffen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { ZIRKEL_AUFTRAEGE } from '../src/data/zirkelAuftraege.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Jeder Dunscar-Zirkel vergibt einen Monster- und einen Polizei-Auftrag mit Ziel, Quest und Lohn', () => {
  for (const [cid, def] of Object.entries(ZIRKEL_AUFTRAEGE)) {
    const c = content.gatherings.circles[cid];
    assert.ok(c.members.some((m) => m.id === def.giver), `${def.giver} sitzt bei ${cid}`);
    assert.deepEqual(def.jobs.map((j) => j.kind).sort(), ['monster', 'polizei']);
    for (const j of def.jobs) {
      const e = content.encounters[`za_${j.id}_elite`];
      assert.ok(e?.elite && e.attacks?.length, j.id);
      assert.ok(content.maps[j.map].roamers.some((r) => r.encounter === `za_${j.id}_elite`), `${j.id} läuft in ${j.map}`);
      assert.ok(content.quests[`zirkelauftrag_${j.id}`], j.id);
      if (j.kind === 'polizei') assert.equal(e.on_win.wanted, 2, `${j.id}: Fahndung`);
    }
  }
});

test('Ablauf: annehmen, Ziel erscheint, nach dem Sieg Lohn mit Wertstück abholen', () => {
  const s = new GameState(content);
  s.flags.add('k3_arrived');
  const tree = content.dialogues.dsz_brenner;
  const sichtbar = () => tree.nodes.start.choices.filter((ch) => s.meets(ch)).map((ch) => ch.next);
  assert.ok(sichtbar().includes('auftrag_gerueststimme'));
  s.applyEffects(tree.nodes.auftrag_gerueststimme_an);
  assert.equal(s.quests.zirkelauftrag_gerueststimme, 'active');
  assert.ok(!sichtbar().includes('auftrag_gerueststimme'), 'nicht zweimal annehmen');
  const ziel = content.maps.ds_unterschicht.roamers.find((r) => r.encounter === 'za_gerueststimme_elite');
  assert.ok(s.meets(ziel.visible_if));
  s.applyEffects(content.encounters.za_gerueststimme_elite.on_win);
  assert.ok(!s.meets(ziel.visible_if), 'nach dem Sieg weg');
  assert.ok(sichtbar().includes('auftrag_gerueststimme_lohn'));
  const geld = s.money;
  s.applyEffects(tree.nodes.auftrag_gerueststimme_lohn);
  assert.equal(s.money - geld, 1500);
  assert.ok(s.hasItem?.('ds_beute_schichtgold') ?? s.inventory?.ds_beute_schichtgold);
  assert.equal(s.quests.zirkelauftrag_gerueststimme, 'done');
  assert.ok(!sichtbar().some((n) => n?.startsWith('auftrag_gerueststimme')));
});
