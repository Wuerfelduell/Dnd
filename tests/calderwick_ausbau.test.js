import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { CW_TERRASSEN } from '../src/data/calderwickStadtplan.js';
import { aufstiegHinweise, wichtigeOrte, woher, wegbeschreibung } from '../src/data/aufstiegHinweise.js';
import { rollLoot } from '../src/core/Loot.js';

// Calderwick-Ausbau (Seb 2026-11-26): Ziele, Erkunden, Beute
const content = loadContent();

test('Beute: Calderwicker Gegner haben einen Fund-Topf ohne Formeln, Gefahrengebiete Grundzutaten', () => {
  const l = content.loot.vg_cw_letternlaeufer;
  assert.ok(l.alt?.pool.length > 30 && l.alt.chance === 0.3);
  assert.ok(content.loot.o3_eisen_g1.alt?.pool.length > 30);
  for (const e of l.alt.pool) assert.ok(content.items[e.item] && content.items[e.item].kind !== 'formula', e.item);
  assert.ok(!l.alt.pool.some((e) => /^sq_zutat_.+_[12]$/.test(e.item)), 'keine Kernzutat 2/1');
  assert.ok(l.drops.some((d) => d.item === 'silberstaub'));
  let fund = 0;
  for (let i = 0; i < 400; i++) { const r = rollLoot(l, Math.random); if (Object.keys(r.items).some((id) => l.alt.pool.some((e) => e.item === id))) fund++; }
  assert.ok(fund > 60 && fund < 200, `Fund ${fund}/400`);
});

test('Erkunden: je Terrasse bewachtes Versteck und Brief, zwei Nebenaufträge mit Belohnung', () => {
  for (const id of CW_TERRASSEN) {
    const m = content.maps[id];
    const v = m.interactables.find((i) => i.id === `cwx_${id}_versteck`);
    const w = m.interactables.find((i) => i.id === `cwx_${id}_waechter`);
    assert.ok(v && w && content.encounters[w.encounter], id);
    assert.ok(v.visible_if.requires_flags.includes(`won_${w.encounter}`));
    assert.ok(m.interactables.find((i) => i.id === `cwx_${id}_brief`), id);
  }
  assert.equal(content.quests.cwx_verstecke.steps.length, 7);
  assert.equal(content.quests.cwx_briefe.steps.length, 7);
  assert.ok(content.maps.cw_kueche.interactables.some((i) => i.kind === 'brew'), 'Braukessel');
});

test('Ziele: Hinweise nennen Quellen, Wegbeschreibungen nennen Ort und Lage', () => {
  assert.match(woher(content, 'eisen', 'sq_zutat_eisen_3'), /Oberhaupt/);
  assert.match(woher(content, 'eisen', 'formel_eisen_3'), /krämer.*30\.000/);
  assert.match(woher(content, 'eisen', 'formel_eisen_1'), /Herz/);
  assert.match(wegbeschreibung(content, 'cw_gepaeckhalle', 'cw_darnell'), /Gepäckhalle, .* · Eingang: Gleisfuß, /);
  assert.equal(wegbeschreibung(content, 'wx_bahnhof', 'marlowe_telegramm'), null, 'nur in Calderwick');
  const state = { pathway: { id: 'eisen', seq: 4 }, content, seqDef: (p, n) => content.pathways[p].seqs[n], itemCount: () => 0, ritualDone: () => false, meets: () => true, flags: new Set(['k4_arrived']) };
  const h = aufstiegHinweise(state);
  assert.deepEqual(h.map((b) => b.seq), [3, 2]);
  assert.ok(h[0].zeilen.every((z) => z.ok || z.wo), 'jede fehlende Zeile sagt, wo');
  assert.ok(wichtigeOrte(state).some((o) => /krämer/i.test(o.name) && /Nietenviertel/.test(o.wo)));
});
