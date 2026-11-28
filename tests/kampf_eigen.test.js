// Zehn eigene Kampffiguren für Gegner, die das Bild eines anderen Gegners trugen (data/kampfEigen.js, tools/art/kampf_eigen)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { KAMPF_EIGEN } from '../src/data/kampfEigen.js';
import { BATTLE_SHEETS, BATTLE_MANIFESTS, ENCOUNTER_SHEETS, ENEMY_BATTLE_SHEETS } from '../src/world/assets.js';

const content = loadContent();
const man = JSON.parse(readFileSync(new URL('../public/sprites/manifest-kampf-eigen.json', import.meta.url), 'utf8'));
const blatt = (id) => { const e = content.encounters[id]; return e.sheet ?? ENCOUNTER_SHEETS[id] ?? ENEMY_BATTLE_SHEETS[e.sprite]; };
const datei = (id) => BATTLE_SHEETS[blatt(id)]?.[0];

test('Kampf-Eigen: zehn Blätter, 48er-Zellen 6x5, registriert, alle Kampfanimationen', () => {
  assert.equal(man.assets.length, 10);
  assert.deepEqual(man.assets.map((a) => a.id).sort(), Object.keys(KAMPF_EIGEN).sort());
  assert.ok(BATTLE_MANIFESTS.includes('manifestKampfEigen'));
  for (const a of man.assets) {
    assert.ok(existsSync(new URL('../public/sprites/' + a.file, import.meta.url)), a.file);
    assert.deepEqual(BATTLE_SHEETS[a.id], [a.file, 48]);
    assert.equal((a.width / a.frameWidth) * (a.height / a.frameHeight), 30);
    for (const n of ['idle', 'attack', 'special', 'hurt', 'defeated']) {
      assert.ok(a.animations[n]?.frames.length, a.id + ' ' + n);
      for (const fr of a.animations[n].frames) assert.ok(fr < 30, a.id + ' ' + n);
    }
    assert.deepEqual(a.begegnungen, KAMPF_EIGEN[a.id]);
  }
});

test('Kampf-Eigen: jede Begegnung kämpft mit ihrer eigenen Figur, keine andere teilt sie', () => {
  const ziel = new Map(Object.entries(KAMPF_EIGEN).flatMap(([s, ids]) => ids.map((id) => [id, s])));
  for (const [id, s] of ziel) {
    assert.ok(content.encounters[id], id);
    assert.equal(blatt(id), s, id);
  }
  for (const id of Object.keys(content.encounters)) {
    const s = blatt(id);
    if (KAMPF_EIGEN[s]) assert.equal(ziel.get(id), s, id + ' nutzt ' + s);
  }
  // das bisherige Bild bleibt beim ursprünglichen Gegner
  for (const a of man.assets) assert.ok(Object.keys(content.encounters).some((id) => !ziel.has(id) && datei(id) === BATTLE_SHEETS[a.bisher]?.[0]), a.bisher);
});

test('Torfmutter und Schleusenuhrmacher kämpfen mit ihren schon vorhandenen eigenen Bildern statt mit Kalkbrennerin und Rangierer', () => {
  assert.equal(blatt('ez_torfmutter'), 'enemy_ez_torfmutter');
  assert.equal(blatt('ez_schleusenuhr'), 'enemy_ez_schleusenuhr');
  for (const id of ['ez_torfmutter', 'ez_schleusenuhr']) assert.ok(existsSync(new URL('../public/sprites/' + datei(id), import.meta.url)), id);
  assert.notEqual(datei('ez_torfmutter'), datei('ez_ds_kalkbrennerin'));
  assert.notEqual(datei('ez_schleusenuhr'), datei('ez_ds_rangierer'));
});
