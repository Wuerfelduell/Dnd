import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { TITLE_LAYERS, CHAPTER_CARDS, sceneUrl, UI_SHEETS, UI_REGIONS } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const file = (url) => new URL(`../public/${url.replace(/^\.\//, '')}`, import.meta.url);

test('Paket AE: Titelebenen, Kapitelkarten und UI-Bögen liegen vor', () => {
  for (const l of TITLE_LAYERS) assert.ok(existsSync(file(l.url)), l.file);
  for (const id of CHAPTER_CARDS) assert.ok(existsSync(file(sceneUrl(id))), id);
  for (const k of ['aeset', 'aetouch', 'aezeitung']) {
    assert.ok(existsSync(file(`sprites/${UI_SHEETS[k][0]}`)), k);
    assert.ok(Object.keys(UI_REGIONS[k]).length, k);
  }
});

test('Paket AE: Wetter und Tiere nur auf vorhandenen Wexmoor-Karten', () => {
  const content = loadContent();
  const src = readFileSync(new URL('../src/world/WexmoorLife.js', import.meta.url), 'utf8');
  const ids = [...src.matchAll(/^\s+(wx_\w+): \{/gm)].map((m) => m[1]);
  assert.ok(ids.length >= 8);
  for (const id of ids) assert.equal(content.maps[id]?.city, 'wexmoor', id);
});
