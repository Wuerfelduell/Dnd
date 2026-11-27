import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadContent } from './helpers.js';
import { CW_ART, CW_DICHTE, CW_EREIGNISSE, cwTexte } from '../src/data/calderwickLeben.js';

const content = await loadContent();

test('Calderwick belebt: alle Terrassen haben Passanten mit Rändern und Türen auf freien Feldern', () => {
  for (const [id, art] of Object.entries(CW_ART)) {
    const m = content.maps[id];
    const p = m.passanten;
    assert.equal(p?.art, art, id);
    assert.ok(p.frei && CW_DICHTE[art], id);
    assert.ok(p.raender.length >= 2, `${id}: Ränder`);
    assert.ok(p.tueren.length >= 3, `${id}: Türen`);
    for (const e of [...p.raender, ...p.tueren]) assert.equal(m.rows[e.tile[1]][e.tile[0]], '.', `${id} ${e.tile}`);
  }
});

test('Calderwick belebt: Ereignisse gültig, jeder Text im englischen Wörterbuch, Töne vorhanden', () => {
  const en = JSON.parse(fs.readFileSync('src/i18n/en/calderwick_leben.json', 'utf8'));
  for (const t of cwTexte()) assert.ok(en[t], `fehlt: ${t}`);
  const sfx = ['manifest-sfx.json', 'manifest-sfx2.json'].map((f) => JSON.parse(fs.readFileSync(`public/audio/${f}`, 'utf8')).sounds);
  for (const e of Object.values(CW_EREIGNISSE)) {
    assert.ok(['ausruf', 'zeitung', 'streit', 'nachtwache'].includes(e.typ));
    if (e.ton) assert.ok(sfx.some((m) => m[e.ton]), e.ton);
  }
});
