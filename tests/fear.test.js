// Ab Sequenz 7 halten gewöhnliche Gegner Abstand; Bosse, Auftragsziele und Gefahrengebiete erst bei deutlichem Stufenabstand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fearsPlayer, enemySeq, FEAR_SEQ } from '../src/core/Fear.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const all = Object.values(content.maps).flatMap((m) => (m.roamers ?? []).map((def) => ({ def, map: m })));

test('Stadtgegner fürchten dich ab Sequenz 7, vorher nicht', () => {
  const city = all.filter(({ def, map }) => !map.danger && !def.boss && !def.encounter.startsWith('kopfgeld_'));
  assert.ok(city.length >= 10);
  for (const { def, map } of city) {
    for (const seq of [null, 9, 8]) assert.equal(fearsPlayer(seq, def, map), false, `${def.encounter} bei Seq ${seq}`);
    for (const seq of [FEAR_SEQ, 6, 5]) assert.equal(fearsPlayer(seq, def, map), true, `${def.encounter} bei Seq ${seq}`);
  }
});

test('Bosse, Kopfgeld-Ziele und Gefahrengebiete bleiben gefährlich, bis du deutlich über ihnen stehst', () => {
  const bounty = all.find(({ def }) => def.encounter === 'kopfgeld_laternendieb');
  assert.equal(enemySeq(bounty.def, bounty.map), 8);
  assert.equal(fearsPlayer(7, bounty.def, bounty.map), false);
  assert.equal(fearsPlayer(6, bounty.def, bounty.map), true);
  const marsch = content.maps.marsch;
  const normal = marsch.roamers.find((r) => !r.boss);
  const boss = marsch.roamers.find((r) => r.boss);
  assert.equal(fearsPlayer(8, normal, marsch), false);
  assert.equal(fearsPlayer(7, normal, marsch), true, 'Marsch (Stufe 1) ist für Seq 7 deutlich darunter');
  assert.equal(fearsPlayer(7, boss, marsch), false, 'die Moorkönigin lauert weiter');
  assert.equal(fearsPlayer(6, boss, marsch), true);
  const krater = content.maps.kraterwald;
  for (const seq of [7, 6, 5]) assert.equal(fearsPlayer(seq, krater.roamers.find((r) => !r.boss), krater), false, `Kraterwald bei Seq ${seq}`);
  for (const id of ['wx_leuchtturm', 'wx_salzwatt', 'wx_altstadt']) {
    const m = content.maps[id];
    assert.equal(fearsPlayer(7, m.roamers[0], m), false, `${id} bei Seq 7`);
  }
});
