// Eigene Laufblätter statt Leihbildern (tools/art/figuren/figuren.py): zehn Figuren, gleiches Raster wie die NPC-Blätter
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { CHARACTER_SHEETS, SHEETS, FIGUREN_EIGEN } from '../src/world/assets.js';

const content = loadContent();
const man = JSON.parse(readFileSync(new URL('../public/sprites/manifest-figuren-eigen.json', import.meta.url), 'utf8'));

test('Eigene Figuren: zehn Blätter 64x128, registriert, Datei vorhanden', () => {
  assert.equal(FIGUREN_EIGEN.length, 10);
  assert.equal(man.assets.length, 10);
  for (const id of FIGUREN_EIGEN) {
    const a = man.assets.find((x) => x.npc === id);
    assert.ok(a, id);
    assert.deepEqual([a.width, a.height, a.frameWidth, a.frameHeight], [64, 128, 16, 32], id);
    assert.equal(CHARACTER_SHEETS['npc_' + id], 'fig_' + id);
    assert.equal(SHEETS['fig_' + id], a.file);
    assert.ok(existsSync(new URL('../public/sprites/' + a.file, import.meta.url)), a.file);
    assert.ok(content.npcs[id], id + ' fehlt im Inhalt');
  }
});

test('Eigene Figuren: kein anderes NPC auf einer Karte teilt sich das Blatt', () => {
  const datei = (id) => SHEETS[CHARACTER_SHEETS['npc_' + id]];
  const aufKarte = new Set(Object.values(content.maps).flatMap((m) => (m.npcs ?? []).map((n) => n.id)));
  for (const id of FIGUREN_EIGEN) {
    assert.ok(aufKarte.has(id), id + ' steht auf keiner Karte');
    const andere = [...aufKarte].filter((o) => o !== id && datei(o) === datei(id));
    assert.deepEqual(andere, [], id);
  }
});
