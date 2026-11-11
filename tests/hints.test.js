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

test('Tipps nennen nur erreichbare Fundorte (Kit nur, wenn er Informant ist)', () => {
  const s = stuckInCase2();
  const where = () => caseHints(s, 'case_02', 2).lines.join(' ');
  assert.ok(!where().includes('Kit'), 'Kit wurde nicht als Informant angeworben');
  assert.match(where(), /Ivy Marsh/);
  s.flags.add('kit_informant');
  assert.match(where(), /Kit/);
  // Nach Fall 2 (Hester gerettet) erzählt Ivy nichts mehr von der Nacht
  s.flags.add('hester_saved');
  assert.ok(!where().includes('Ivy'));
});

test('Ohne Informationen rät der Tipp zum Umhören, Fallen werden nicht empfohlen', () => {
  const s = new GameState(content);
  assert.match(caseHints(s, 'case_02', 1).lines[0], /fehlt noch eine Information/);
  // Die Anselm-Falle (Ansehen 0) ist nie das Ziel
  for (let i = 0; i < 3; i++) assert.notEqual(nextDeduction(s, 'case_02')?.deduction.id, 'anselm_guilty');
});

/** Fall 8 wie bei Seb: Schlafwandeln doppelt belegt, von den Traumfäden fehlt noch alles. */
function stuckInCase8() {
  const s = new GameState(content);
  s.quests.case_08 = 'active';
  s.flags.add('briefed_07');
  s.flags.add('briefed_08');
  ['nan_sleepwalk', 'nan_piper', 'molly_walk', 'molly_tea', 'tea_tin', 'wren_piper', 'piper_home'].forEach((c) => s.addClue(c));
  assert.equal(s.combine('sleep_tea', 'sleepwalk').result, 'new');
  return s;
}

test('Fall 8: der Tipp sagt, dass die Fäden nur in der Geistsicht zu sehen sind, und dass der Rattenfänger weitere Fragen braucht', () => {
  const s = stuckInCase8();
  assert.equal(nextDeduction(s, 'case_08').deduction.id, 'd8_thread');
  const lines = caseHints(s, 'case_08', 2).lines;
  assert.match(lines[1], /mit der Geistsicht im Ort „Waisenhaus St. Brigid“ umsehen/);
  assert.match(lines[1], /Jasper Reed weiter ausfragen/);
  // Sobald die Vorfrage gestellt ist, ist Jasper ein normaler Fundort
  s.addClue('piper_canal');
  assert.match(caseHints(s, 'case_08', 2).lines[1], /Jasper Reed fragen \(Ashgrove Lane\)/);
  // Mit Jaspers Aussage bleibt nur die Geistsicht, und der Tipp nennt sie weiter
  s.addClue('piper_thread');
  assert.equal(s.combine('dream_thread', 'sleepwalk').result, 'new');
  assert.match(caseHints(s, 'case_08', 2).lines[2], /Geistsicht/);
  s.addClue('thread_vision');
  assert.ok(s.isCertain('d8_thread'));
});
