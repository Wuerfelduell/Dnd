// Gestufte Tipps im Notizbuch für die nächste Schlussfolgerung.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { caseHints, nextDeduction, clueOrigins } from '../src/core/hints.js';
import { loadContent } from './helpers.js';

const content = loadContent();

/** Fall 2 wie auf Sebs Bildschirm: zwei Schlussfolgerungen gesichert, Moll erst eine Vermutung. */
function stuckInCase2() {
  const s = new GameState(content);
  s.quests.case_02 = 'active';
  ['vey_payment', 'anselm_silver', 'hester_diary', 'medallion', 'anselm_song', 'hymn_sheet', 'music_box', 'box_engraving',
    'fire_report', 'church_plan', 'cold_draft', 'open_grave', 'moll_shovel', 'anselm_book', 'police_runaway', 'rook_runaway']
    .forEach((c) => s.addClue(c));
  assert.equal(s.combine('song_calls', 'lullaby_for_lilian').result, 'new');
  assert.equal(s.combine('lilian_return', 'lullaby_for_lilian').result, 'new');
  return s;
}

test('Jeder Hinweis aus einem Gespräch oder Objekt hat einen Fundort', () => {
  const origins = clueOrigins(content);
  assert.ok(origins.ivy_saw_moll.some((o) => o.text.includes('Ivy Marsh')));
  assert.ok(origins.moll_shovel.some((o) => o.text.includes('Spaten')));
  assert.ok(origins.kit_moll_night.length);
});

test('Tipps werden stufenweise konkreter: Vermutung, Fundort, Paar', () => {
  const s = stuckInCase2();
  const t = nextDeduction(s, 'case_02');
  assert.equal(t.deduction.id, 'grave_for_vey');
  const [one, two, three] = [1, 2, 3].map((l) => caseHints(s, 'case_02', l));
  assert.equal(one.lines.length, 1);
  assert.match(one.lines[0], /zweite Quelle/);
  assert.ok(!one.lines.join(' ').includes('Moll'), 'Stufe 1 verrät nichts Konkretes');
  assert.match(two.lines.join(' '), /Totengräber Moll/);
  assert.match(two.lines.join(' '), /Ivy Marsh|Kit/);
  assert.match(three.lines.at(-1), /Verknüpfe .*Moll hat Lilian.* mit .*Silber des Chors/);
  assert.equal(one.key, three.key);
  // Mit der zweiten Quelle wechselt der Tipp zum Verknüpfen
  s.addClue('ivy_saw_moll');
  const after = caseHints(s, 'case_02', 1);
  assert.notEqual(after.key, one.key);
  assert.match(after.lines[0], /verknüpfe/);
  assert.equal(s.combine('dug_by_moll', 'paid_by_vey').result, 'new');
  assert.match(caseHints(s, 'case_02', 1).lines[0], /Auflösung/);
});

test('Ohne Informationen rät der Tipp zum Umhören, Fallen werden nicht empfohlen', () => {
  const s = new GameState(content);
  assert.match(caseHints(s, 'case_02', 1).lines[0], /fehlt noch eine Information/);
  // Die Anselm-Falle (Ansehen 0) ist nie das Ziel
  for (let i = 0; i < 3; i++) assert.notEqual(nextDeduction(s, 'case_02')?.deduction.id, 'anselm_guilty');
});
