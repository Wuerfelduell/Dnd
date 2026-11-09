import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { GameState, K2_AKT5_STEPS } from '../src/core/GameState.js';
import { CHARACTER_SHEETS } from '../src/world/assets.js';

const content = loadContent();
const placements = JSON.parse(readFileSync(new URL('../src/data/packs/k2_akte/platzierung.json', import.meta.url), 'utf8'));

test('Paket AP: zehn Fährten und Krabbes Geschichte sind im Spiel, Krabbe hat seine AO-Figur', () => {
  const ids = Object.keys(content.quests).filter((q) => q.startsWith('k2v_'));
  assert.equal(ids.length, 11);
  assert.ok(content.npcs.wxn_krabbe);
  assert.equal(CHARACTER_SHEETS.npc_wxn_krabbe, 'ao_wxn_krabbe');
  assert.equal(content.quests.k2_akt5.steps.length, 7, 'Akt V mit Überfahrt, Keller, Winde und Abschied');
});

test('Paket AP: Platzierungen liegen nicht auf Objekten anderer Pakete', () => {
  for (const p of placements) {
    const m = content.maps[p.map];
    const id = p.npc ?? p.interactable.id;
    const others = [...(m.npcs ?? []), ...(m.interactables ?? [])].filter((o) => o.tile && o.id !== id && !o.id.startsWith('k2v_') && o.id !== 'wxn_krabbe');
    assert.ok(!others.some((o) => o.tile[0] === p.tile[0] && o.tile[1] === p.tile[1]), `${p.map} ${p.tile}: ${id}`);
  }
});

test('AP Akt V: Sperren im Turm öffnen sich nacheinander, alte Stände überspringen die neuen Schritte', () => {
  const sperren = content.maps.wx_leuchtturm.interactables.filter((i) => i.id.startsWith('k2v_sperre_'));
  assert.equal(sperren.length, 3);
  for (const sp of sperren) assert.ok(sp.solid, `${sp.id} blockiert den Weg`);
  const open = (s) => sperren.filter((sp) => !s.meets(sp.visible_if)).map((sp) => sp.id).sort();
  const s = new GameState(content);
  s.flags.add('k2_am_turm');
  assert.deepEqual(open(s), []);
  s.flags.add('k2v_keller_passiert');
  assert.deepEqual(open(s), [], 'der Keller allein öffnet nichts');
  s.flags.add('k2v_aufstieg_passiert');
  assert.deepEqual(open(s), ['k2v_sperre_klappe_ost', 'k2v_sperre_klappe_west']);
  s.flags.add('k2v_abschied_done');
  assert.equal(open(s).length, 3);
  // Spielstand von vor dem Einbau: Leuchtfeuer besiegt, keine neuen Flags, kein nachträgliches Vertrauen
  const old = new GameState(content);
  old.flags.add('k2_am_turm');
  old.flags.add('won_leuchtfeuer');
  assert.ok(old.load(JSON.parse(JSON.stringify(old.serialize()))));
  for (const f of K2_AKT5_STEPS) assert.ok(old.flags.has(f), f);
  assert.ok(!old.flags.has('k2v_zunder_vertraut'));
  assert.equal(open(old).length, 3);
});
