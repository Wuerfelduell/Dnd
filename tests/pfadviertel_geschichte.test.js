// Pfadviertel-Geschichten (Seb 2026-11-27): je Calderwick-Pfadviertel ein kleiner Auftrag, am Ende wartet der eigene Rivale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { PVG, pvgFlag, pvgWoerterbuch } from '../src/data/pfadviertelGeschichte.js';
import { rivaleText, rivaleWoerterbuch } from '../src/data/rivale.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('jedes Pfadviertel hat Bitte, drei Funde, Rivale und Lohn auf freien Feldern, dazu einen Auftrag', () => {
  for (const pid of Object.keys(PVG)) {
    const m = content.maps[`o3_${pid}`];
    assert.ok(m, pid);
    for (const s of ['bitte', 'fund1', 'fund2', 'fund3', 'rivale', 'lohn']) {
      const it = m.interactables.find((i) => i.id === `o3_${pid}_pvg_${s}`);
      assert.ok(it, `${pid} ${s}`);
      assert.equal(m.rows[it.tile[1]][it.tile[0]], '.', `${pid} ${s} ${it.tile}`);
    }
    const q = content.quests[`pvg_${pid}`];
    assert.equal(q.steps.length, 6);
    assert.ok(q.steps.every((st) => m.interactables.some((i) => i.id === st.target.id)));
  }
});

test('englisches Wörterbuch ist aktuell, Rivalen-Texte fürs Viertel inklusive', () => {
  const en = JSON.parse(readFileSync(new URL('../src/i18n/en/pfadviertel_geschichten.json', import.meta.url), 'utf8'));
  assert.deepEqual(en, pvgWoerterbuch());
  const rv = rivaleWoerterbuch();
  for (const k of ['viertel', 'viertel_verbuendet', 'viertel_sieg']) assert.ok(rv[rivaleText(k, 'eisen')], k);
});

test('Sieg über den Rivalen aus dem Viertel gibt das letzte Stück frei', () => {
  const s = new GameState(content);
  s.pathway = { id: 'eisen', seq: 4, digestion: 0 };
  s.flags.add('k2_arrived');
  let gestartet = null;
  s.startCombat = (id) => { gestartet = id; };
  assert.ok(s.rivaleKampf(1, 'laterne'));
  assert.ok(gestartet?.startsWith('rivale_eisen_'));
  const text = s.rivaleKampfEnde({ outcome: 'won', enc: content.encounters[gestartet] });
  assert.ok(s.flags.has(pvgFlag('laterne', 'rivale')));
  assert.match(text, /letzte Stück/);
  // ein späterer Straßenkampf zählt nicht mehr fürs Viertel
  s.flags.delete(pvgFlag('laterne', 'rivale'));
  s.rivaleKampf(1);
  s.rivaleKampfEnde({ outcome: 'won', enc: content.encounters[gestartet] });
  assert.ok(!s.flags.has(pvgFlag('laterne', 'rivale')));
});
