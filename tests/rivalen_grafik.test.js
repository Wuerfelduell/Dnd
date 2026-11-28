// Kampfblätter der Rivalen (Seq 9-5) und Kopfgeldjäger je Pfad (tools/art/rivalen/rivalen.py)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { BATTLE_SHEETS, BATTLE_MANIFESTS, RIVALEN_PFADE } from '../src/world/assets.js';
import { KAMPF_EIGEN } from '../src/data/kampfEigen.js';

const content = loadContent();
const man = JSON.parse(readFileSync(new URL('../public/sprites/manifest-rivalen.json', import.meta.url), 'utf8'));

test('Rivalen-Blätter: zehn Pfade, je Rivale und Jäger, 48er-Zellen mit allen Kampfanimationen', () => {
  assert.equal(RIVALEN_PFADE.length, 10);
  assert.ok(BATTLE_MANIFESTS.includes('manifestRivalen'));
  for (const p of RIVALEN_PFADE) for (const art of ['rv', 'kgj']) {
    const id = 'enemy_' + art + '_' + p;
    const a = man.assets.find((x) => x.id === id);
    assert.ok(a, id);
    assert.deepEqual(BATTLE_SHEETS[id], [a.file, 48]);
    assert.ok(existsSync(new URL('../public/sprites/' + a.file, import.meta.url)), a.file);
    for (const n of ['idle', 'attack', 'special', 'hurt', 'defeated']) assert.ok(a.animations[n]?.frames.length, id + ' ' + n);
  }
});

test('Rivalen Seq 9-5 kämpfen im Blatt ihres Pfads, ab Seq 4 in der Halbgott-Gestalt', () => {
  let n = 0;
  for (const [id, e] of Object.entries(content.encounters)) {
    const m = id.match(/^rivale2?_(.+)_(\d)$/);
    if (!m || !e.rivale) continue;
    const seq = Number(m[2]);
    assert.equal(e.sheet, seq <= 4 ? 'hg_battle_' + e.rivale : 'enemy_rv_' + e.rivale, id);
    n++;
  }
  assert.ok(n >= 150, n + ' Rivalen-Kämpfe');
});

test('Kopfgeldjäger tragen das Jäger-Blatt ihres eigenen Pfads (oder eine eigene Figur aus kampfEigen.js)', () => {
  const jaeger = Object.entries(content.encounters).filter(([, e]) => e.kopfgeldjaeger);
  assert.ok(jaeger.length >= 13);
  const eigen = Object.fromEntries(Object.entries(KAMPF_EIGEN).flatMap(([s, ids]) => ids.map((id) => [id, s])));
  for (const [id, e] of jaeger) assert.equal(e.sheet, eigen[id] ?? 'enemy_kgj_' + e.beyonder_pfad, id);
});
