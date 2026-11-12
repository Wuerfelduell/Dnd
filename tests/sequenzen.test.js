import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { SEQ_MAX } from '../src/core/Pathways.js';
import { itemIconUrl, itemIcon32Url, pathwayEmblemUrl, PATHWAY_POSES } from '../src/world/assets.js';

const content = loadContent();
const NEW = ['sq_waage', 'sq_moor', 'sq_uhr'];
const file = (url) => new URL(`../public/${url.replace(/^.*?sprites\//, 'sprites/')}`, import.meta.url);

test('Paket AF + Kapitel 3: alle zehn Pfade spielbar bis Sequenz 1, die Proben von AU ersetzen die Rituale 4 bis 1', () => {
  assert.equal(SEQ_MAX, 1);
  for (const pid of Object.keys(content.pathways)) {
    assert.deepEqual(Object.keys(content.pathways[pid].seqs).sort(), ['1', '2', '3', '4', '5', '6', '7', '8', '9'], pid);
    for (const n of [4, 3, 2, 1]) {
      assert.ok(content.items[`trank_${pid}_${n}`] && content.items[`formel_${pid}_${n}`], `${pid} ${n}`);
      if (n === 4) assert.ok(content.pathways[pid].seqs[n].ritual.hg, `${pid} 4: Halbgott-Prüfung (Seq4.js)`);
      else assert.ok(content.pathways[pid].seqs[n].ritual.hoch, `${pid} ${n}: Prüfung (SeqHoch.js)`);
    }
  }
  assert.ok(content.items.sq_zutat_laterne_4 && content.items.sq_zutat_uhr_1);
  assert.deepEqual(Object.keys(content.highItems), []);
});

test('Paket AF: Grundzutat und Formel 9 für jeden kaufbar, ab 7 nur auf Treffen, Kern für 5 in Wexmoor', () => {
  const s = new GameState(content);
  s.money = 999;
  for (const pid of NEW) {
    const z9 = `sq_zutat_${pid.slice(3)}_9`;
    assert.equal(s.buy('nell', z9).ok, true, z9);
    assert.equal(s.buy('kittering', `formel_${pid}_9`).ok, true);
    assert.ok(!s.shopStock('nell').some((e) => e.item === `sq_zutat_${pid.slice(3)}_8`), 'fremder Pfad sieht Seq-8-Zutat nicht');
  }
  const offers = (cid) => content.gatherings.circles[cid].members.flatMap((m) => m.offers.map((o) => o.item));
  const kg = ['waage', 'kreide', 'russ'].flatMap(offers);
  const wx = ['lichtlose', 'salz'].flatMap(offers);
  for (const pid of NEW) {
    const k = pid.slice(3);
    assert.ok(kg.includes(`sq_zutat_${k}_7`) && kg.includes(`sq_zutat_${k}_6`), pid);
    assert.ok(wx.includes(`sq_zutat_${k}_5`) && wx.includes(`formel_${pid}_6`) && wx.includes(`formel_${pid}_5`), pid);
  }
});

// Seb (2026-11-11): Die Halbgott-Formel (Sequenz 4) kostet 4000 bei Kittering und liegt dafür auch als Los auf den Wexmoorer Treffen.
test('Sequenz 4: Formel aller Pfade nur als Los bei Lichtlosen oder Salzbrüdern (nicht bei Kittering)', () => {
  const lots = ['lichtlose', 'salz'].flatMap((id) => content.gatherings.circles[id].members.flatMap((m) => m.offers));
  for (const pid of Object.keys(content.pathways)) {
    const kit = content.market.merchants.kittering.stock.find((e) => e.item === `formel_${pid}_4`);
    assert.equal(kit, undefined, `${pid}: Seb (2026-11-12) nur Treffen oder Elite-Beute`);
    const lot = lots.find((e) => e.item === `formel_${pid}_4`);
    assert.ok(lot && lot.price === 4000 && lot.chance >= 0.3, pid);
  }
  // Jede Kernzutat der Stufe 5 ist in Wexmoor zu haben, seit Kettlegate gesperrt ist
  for (const core of ['lichtperle', 'spindelknochen', 'schminkasche', 'atemglas', 'goldschimmel', 'schwertsplitter', 'schattenseide', 'nebelherz']) {
    assert.ok(lots.some((e) => e.item === core && e.chance >= 0.25), core);
  }
});

test('Paket AF: Waage schützt, Moor heilt, die Uhr trifft sicher', () => {
  const sk = (pid) => Object.values(content.pathways[pid].seqs).map((s) => s.skill);
  assert.ok(sk('sq_waage').every((k) => k.shield > 0));
  assert.ok(sk('sq_moor').some((k) => k.heal > 0));
  assert.ok(sk('sq_uhr').some((k) => k.sure));
});

test('Paket AF: Platzhalter für Embleme, Posen, Tränke, Zutaten und Artefakte', () => {
  for (const pid of NEW) {
    assert.ok(existsSync(file(pathwayEmblemUrl(pid, 32))), pid);
    assert.ok(PATHWAY_POSES[pid], pid);
    for (const n of [9, 8, 7, 6, 5]) {
      assert.ok(existsSync(file(itemIconUrl(`trank_${pid}_${n}`))), `trank_${pid}_${n}`);
      assert.ok(existsSync(file(itemIcon32Url(`trank_${pid}_${n}`))), `32 trank_${pid}_${n}`);
      assert.ok(existsSync(file(itemIconUrl(`formel_${pid}_${n}`))), `formel_${pid}_${n}`);
    }
  }
  for (const id of Object.keys(content.items).filter((i) => i.startsWith('sq_'))) assert.ok(existsSync(file(itemIconUrl(id))), id);
  assert.equal(Object.keys(content.artifacts.list).filter((i) => i.startsWith('sq_')).length, 6);
});

test('Seq 5 der neuen Pfade: keine Fallbedingung mehr, die Prüfung des Pfads steht lesbar in der Liste', () => {
  const s = new GameState(content);
  s.pathway = { id: 'sq_waage', seq: 6, digestion: 100 };
  const steps = s.ritualSteps('sq_waage', 5);
  assert.ok(!steps.some((st) => /abgeschlossen$/.test(st.text)), JSON.stringify(steps));
  assert.ok(steps.some((st) => st.trial === 'waage' && /geheimen Treffens/.test(st.text)), JSON.stringify(steps));
});
