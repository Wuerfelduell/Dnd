import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { formStageKeys, HG_FORMS } from '../src/core/Pathways.js';

test('Gestalt-Stufen: Seq 4 Grundform, Seq 3 _s3, Seq 2 _s2→_s3, Seq 1 still zuerst', () => {
  assert.deepEqual(formStageKeys('laterne', 4, 'map'), ['hg_form_laterne']);
  assert.deepEqual(formStageKeys('laterne', 3, 'map'), ['hg_form_laterne_s3', 'hg_form_laterne']);
  assert.deepEqual(formStageKeys('laterne', 2, 'battle'), ['hg_battle_laterne_s2', 'hg_battle_laterne_s3', 'hg_battle_laterne']);
  assert.deepEqual(formStageKeys('laterne', 1, 'battle')[0], 'hg_form_laterne_still_battle');
  assert.deepEqual(formStageKeys('laterne', 1, 'face'), ['hgzug_laterne_s2', 'hgzug_laterne_s3', 'hgzug_laterne']);
  assert.deepEqual(formStageKeys(null, 3), []);
});

test('Seq-3-Blätter (Codex DZ) liegen für alle zehn Pfade vor', () => {
  for (const p of Object.keys(HG_FORMS)) {
    for (const f of [`characters/hg_form_${p}_s3.png`, `battle/hg_battle_${p}_s3.png`, `ui/hg_zug_${p}_s3.png`]) {
      assert.ok(existsSync(new URL(`../public/sprites/${f}`, import.meta.url)), f);
    }
  }
});
