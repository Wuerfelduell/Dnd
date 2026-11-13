// Sackgassen (Seb 2026-11-13): kein Auftragsschritt darf an etwas hängen, das im Spiel nie passieren kann,
// und Aufträge aus Städten ohne Rückweg dürfen nicht für immer offen im Notizbuch stehen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { journalQuestVisible, leftCities } from '../src/core/journal.js';
import { analyse, codeFlags } from '../tools/sackgassen.mjs';
import { loadContent } from './helpers.js';

const content = loadContent();
const a = analyse(content, { codeFlags: codeFlags(new URL('../src', import.meta.url).pathname) });

test('Jeder Schritt jedes startbaren Auftrags ist erreichbar', () => {
  assert.deepEqual(a.stuck.map((s) => `${s.quest} #${s.step + 1}: ${s.text}`), []);
});

test('Jeder Ort ist erreichbar (die Zelle in Wexmoor nur über eine Festnahme)', () => {
  assert.deepEqual(Object.keys(content.maps).filter((m) => !a.R.map.has(m) && m !== 'wx_zelle'), []);
});

test('Pfiffs Paket in Calderwick kommt auch nach dem neuen Kapitel-3-Ende (Sturz) an', () => {
  const s = new GameState(content);
  s.flags.add('k4_arrived');
  s.quests.cwn_brief_aus_dunscar = 'active';
  const tree = content.dialogues.cwn_brief_aus_dunscar_spur1;
  const node = s.pick(tree.start);
  s.applyEffects(tree.nodes[node]);
  assert.ok(s.flags.has('cwn_brief_aus_dunscar_spur1'));
});

test('Offene Aufträge aus verlassenen Städten verschwinden aus dem Notizbuch, laufende Kapitelziele bleiben', () => {
  const s = new GameState(content);
  s.map = 'ds_speisewagen';
  s.flags.add('k2_arrived').add('k3_arrived');
  s.quests.k2v_krabbe = 'active';
  s.quests.k3_rache = 'active';
  s.quests.k3h_nachtwalze = 'active';
  assert.deepEqual(leftCities(s), ['kettlegate', 'wexmoor']);
  assert.equal(journalQuestVisible(s, 'k2v_krabbe'), false, 'Wexmoor-Nebenauftrag ist in Dunscar nicht mehr lösbar');
  assert.equal(journalQuestVisible(s, 'k3_rache'), true);
  assert.equal(journalQuestVisible(s, 'k3h_nachtwalze'), true);
  s.flags.add('k4_arrived');
  s.map = 'cw_gleisfuss';
  assert.equal(journalQuestVisible(s, 'k3h_nachtwalze'), false, 'Dunscar-Auftrag nach dem Sturz');
  s.flags.add('auf_rueckweg');
  assert.equal(journalQuestVisible(s, 'k3h_nachtwalze'), true, 'Lastenzug-Rückweg: Dunscar wieder erreichbar');
  assert.equal(s.quests.k2v_krabbe, 'active', 'nur ausgeblendet, kein Fortschritt verloren');
});
