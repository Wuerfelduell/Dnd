import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { AK_FIGURES, portraitFor } from '../src/world/assets.js';
import { DIALOG_MOODS } from '../src/data/moods.js';
import { guessMood } from '../src/core/Moods.js';
import { loadContent } from './helpers.js';

const manifest = JSON.parse(readFileSync(new URL('../public/sprites/manifest-emotionen2.json', import.meta.url)));

test('AK: jede Figur aus dem Manifest hat ein Sheet und ist eingetragen', () => {
  for (const a of manifest.assets) {
    assert.ok(AK_FIGURES.has(a.characterId), a.characterId);
    assert.ok(existsSync(new URL(`../public/sprites/${a.file}`, import.meta.url)), a.file);
    assert.deepEqual(a.emotions, ['angry', 'sad', 'thoughtful', 'determined']);
  }
  assert.equal(AK_FIGURES.size, manifest.assets.length);
});

test('AK: Stimmungen wählen die neuen Spalten, Sonder-Streifen bleiben', () => {
  assert.deepEqual(portraitFor('marlowe', 'angry'), { url: './sprites/portraits/AK_marlowe_emotions2.png', col: 0 });
  assert.equal(portraitFor('holt', 'determined').col, 3);
  assert.equal(portraitFor('elsbeth', 'sad').url.includes('AK_elsbeth'), true);
  assert.ok(portraitFor('miriam', 'wuetend').url.includes('J_miriam_glocke')); // Glockenszene behält ihr Bild
  assert.ok(!portraitFor('marlowe', 'neutral').url.includes('AK_'));
  assert.ok(!portraitFor('tilly', 'angry')?.url.includes('AK_'));
});

test('AK: handgesetzte Stimmungen zeigen auf echte Knoten', async () => {
  const c = await loadContent();
  for (const [key, mood] of Object.entries(DIALOG_MOODS)) {
    const [d, n] = key.split('/');
    assert.equal(c.dialogues[d]?.nodes?.[n]?.mood, mood, key);
  }
});

test('AK: Stimmung aus dem Text nur bei deutlichem Signal', () => {
  assert.equal(guessMood('Verdammt, raus hier!'), 'angry');
  assert.equal(guessMood('Sie weint leise.'), 'sad');
  assert.equal(guessMood('Hm. Ich frage mich, wer das war.'), 'thoughtful');
  assert.equal(guessMood('Wir müssen heute Nacht los.'), 'determined');
  assert.equal(guessMood('Guten Abend, Ermittler.'), null);
});
