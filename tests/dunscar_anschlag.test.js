// Anschlagbrett Dunscar (Seb 2026-11-13): mehr Inhalt für Seq 5→4, feste Verdauung aus großen Taten.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { ANSCHLAG_NPC, JAGDEN, JAGD_STUFE2_AB, LIEFERUNGEN, SPUR } from '../src/data/dunscarAnschlag.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const tree = content.dialogues[ANSCHLAG_NPC];

function neu(seq = 5) {
  const s = new GameState(content);
  s.flags.add('k3_arrived');
  s.pathway = { id: 'eisen', seq, digestion: 10 };
  return s;
}
const sichtbar = (s) => tree.nodes.start.choices.filter((ch) => s.meets(ch)).map((ch) => ch.next);

test('Ezra Pell steht am Endbahnhof, jedes Gesuch hat Quest und Ziel', () => {
  assert.ok(content.maps.ds_endbahnhof.npcs.some((n) => n.id === ANSCHLAG_NPC));
  for (const j of JAGDEN) {
    const e = content.encounters[`dan_${j.id}_elite`];
    assert.ok(e?.elite && e.attacks?.length, j.id);
    assert.ok(content.maps[j.map].roamers.some((r) => r.encounter === `dan_${j.id}_elite`), j.id);
    assert.ok(content.quests[`dan_jagd_${j.id}`], j.id);
  }
  for (const l of LIEFERUNGEN) assert.ok(content.quests[`dan_liefer_${l.id}`], l.id);
  assert.ok(content.encounters.dan_hueter_boss.boss);
  for (const m of SPUR.marken) assert.ok(content.maps[m.map].interactables.some((i) => i.id === `dan_${m.id}`), m.id);
});

test('digest_pct: voll auf Seq 5, ein Zehntel auf Seq 4, nie über 100', () => {
  const s = neu(5);
  s.applyEffects({ digest_pct: 2 });
  assert.equal(s.pathway.digestion, 12);
  const t = neu(4);
  t.applyEffects({ digest_pct: 2 });
  assert.ok(Math.abs(t.pathway.digestion - 10.2) < 1e-9);
  s.pathway.digestion = 99.5;
  s.applyEffects({ digest_pct: 2 });
  assert.equal(s.pathway.digestion, 100);
});

test('Jagd: annehmen, Ziel sichtbar, Lohn mit Verdauung; Stufe 2 erst nach drei Jagden', () => {
  const s = neu();
  const j = JAGDEN[0];
  assert.ok(!sichtbar(s).includes('jagd_aschenmutter'), 'Stufe 2 noch verdeckt');
  s.applyEffects(tree.nodes[`jagd_${j.id}_an`]);
  const ziel = content.maps[j.map].roamers.find((r) => r.encounter === `dan_${j.id}_elite`);
  assert.ok(s.meets(ziel.visible_if));
  s.applyEffects(content.encounters[`dan_${j.id}_elite`].on_win);
  assert.ok(!s.meets(ziel.visible_if));
  const geld = s.money;
  s.applyEffects(tree.nodes[`jagd_${j.id}_lohn`]);
  assert.equal(s.money - geld, j.geld);
  assert.equal(s.quests[`dan_jagd_${j.id}`], 'done');
  assert.ok(s.pathway.digestion >= 10 + j.digest);
  for (const k of JAGDEN.filter((x) => x.stufe === 1).slice(1, JAGD_STUFE2_AB)) s.flags.add(`dan_jagd_${k.id}_bezahlt`);
  assert.ok(sichtbar(s).includes('jagd_aschenmutter'), 'Stufe 2 offen');
});

test('Lieferung nur mit der Ware, nimmt sie und zahlt', () => {
  const s = neu();
  const l = LIEFERUNGEN[0];
  const abgeben = tree.nodes[`liefer_${l.id}`].choices[0];
  assert.ok(!s.meets(abgeben));
  s.addItem('ds_beute_signalsilber', 3);
  assert.ok(s.meets(abgeben));
  s.applyEffects(tree.nodes[`liefer_${l.id}_lohn`]);
  assert.equal(s.itemCount('ds_beute_signalsilber'), 0);
  assert.equal(s.quests[`dan_liefer_${l.id}`], 'done');
  assert.ok(!sichtbar(s).includes(`liefer_${l.id}`));
});

test('Spur des Alten: erst nach dem Gerücht, Marken → Bote → Hüter → Bericht', () => {
  const s = neu();
  assert.ok(!sichtbar(s).includes('spur'));
  s.flags.add('k3r_gott_gehoert');
  assert.ok(sichtbar(s).includes('spur'));
  s.applyEffects(tree.nodes.spur_an);
  const bote = content.maps.ds_rangierwueste.roamers.find((r) => r.encounter === 'dan_bote_elite');
  assert.ok(!s.meets(bote.visible_if));
  for (const m of SPUR.marken) {
    const it = content.maps[m.map].interactables.find((i) => i.id === `dan_${m.id}`);
    assert.ok(s.meets(it.visible_if));
    s.applyEffects({ ...it.effects, sets_flags: [it.done_flag] });
  }
  assert.ok(s.meets(bote.visible_if));
  s.applyEffects(content.encounters.dan_bote_elite.on_win);
  const hueter = content.maps.ds_schlackengrube.roamers.find((r) => r.encounter === 'dan_hueter_boss');
  assert.ok(s.meets(hueter.visible_if));
  s.applyEffects(content.encounters.dan_hueter_boss.on_win);
  assert.ok(sichtbar(s).includes('spur_ende'));
  s.applyEffects(tree.nodes.spur_ende);
  assert.equal(s.quests[SPUR.quest], 'done');
  const erwartet = 10 + SPUR.marken.length * SPUR.markeDigest + SPUR.bote.digest + SPUR.hueter.digest;
  assert.ok(Math.abs(s.pathway.digestion - erwartet) < 0.2, `${s.pathway.digestion} ≈ ${erwartet}`);
});
