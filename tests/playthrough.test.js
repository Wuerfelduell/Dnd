// Spielt beide Fälle über die echten Dialoge und Objekte durch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, use, fight } from './helpers.js';

const content = loadContent();

/** Krypta: Bannsalz bei Anselm holen, den Aschewächter besiegen, dann ist Hester erreichbar. */
function passWarden(s) {
  const hester = content.maps.crypt.npcs.find((n) => n.id === 'hester');
  assert.ok(!s.meets(hester.lock), 'Hester ist vor dem Kampf unerreichbar');
  talk(s, 'anselm', ['Unheiliges']);
  assert.equal(s.itemCount('bannsalz'), 2);
  const { result } = fight(s, 'ash_warden', { defend: (i) => (i % 2 ? 'miss' : 'dodge'), items: ['bannsalz', 'bannsalz'], healBelow: 15 });
  assert.equal(result.outcome, 'won');
  assert.ok(s.meets(hester.lock));
}

function playCase1(s, { sidequests = true } = {}) {
  talk(s, 'marlowe', ['auf den Weg']);
  assert.ok(s.flags.has('travel_ashgrove'));
  if (sidequests) talk(s, 'pimm', ['besorgt']);
  use(s, 'ashgrove', 'lamp_bridge');
  talk(s, 'greta', ['letzte Nacht', 'Noch etwas']);
  talk(s, 'greta', ['Brückenlaterne']);
  talk(s, 'greta', ['nach Elias gefragt', 'Silberschlüssel', 'Danke']);
  talk(s, 'greta', ['aufgebracht']);
  talk(s, 'price', ['bisher']);
  if (sidequests) talk(s, 'price', ['Akte 47']);
  talk(s, 'greta', ['getrunken']);
  assert.equal(s.factStatus('drunk'), 'refuted', 'Price lag');
  use(s, 'ashgrove', 'coins');
  talk(s, 'kit', ['gehört', 'gesehen', 'Schon gut']);
  talk(s, 'kit', ['Kasse', 'Price']);
  use(s, 'ashgrove', 'pole');
  use(s, 'ashgrove', 'scratches');
  use(s, 'ashgrove', 'seal');
  use(s, 'ashgrove', 'prints');
  use(s, 'ashgrove', 'coat');
  talk(s, 'greta', ['Symbol']);
  talk(s, 'halloway', ['Spur', 'heute Nacht']);
  assert.equal(s.factStatus('quiet_night'), 'refuted', 'Halloways Lüge ist widerlegt');
  for (const [a, b] of [['lamp_frozen', 'lullaby'], ['seal_at_bridge', 'vey_key'], ['pole_climb', 'to_pawnshop']]) {
    assert.equal(s.combine(a, b).result, 'new', `${a}+${b}`);
  }
  talk(s, 'halloway', ['nicht ertrunken']);
  talk(s, 'price', ['passiert', 'Elias lebt', 'Weiter'].slice(0, 2));
}

test('Fall 1: gutes Ende über echte Dialoge, Ansehen steigt', () => {
  const s = new GameState(content);
  playCase1(s);
  assert.equal(s.endings.case_01, 'c1_good');
  assert.ok(s.flags.has('elias_rescued'));
  assert.equal(s.quests.report_01, 'active');
  assert.ok(s.honor >= 35, `Ansehen ${s.honor}`);
});

test('Fall 1: Vermutungen reichen Price nicht', () => {
  const s = new GameState(content);
  talk(s, 'marlowe', ['auf den Weg']);
  use(s, 'ashgrove', 'lamp_bridge');
  talk(s, 'greta', ['letzte Nacht']);
  s.combine('lamp_frozen', 'lullaby');
  s.addClue('wax_seal');
  s.addClue('pawn_ledger');
  s.combine('seal_at_bridge', 'vey_key');
  const path = talk(s, 'price', ['passiert', 'Ritual in den Kanal']);
  assert.equal(path.at(-1), 'unsure');
  assert.equal(s.endings.case_01, undefined);
});

test('Fall 1: der Polizei glauben führt ins schlechte Ende und kostet Ansehen', () => {
  const s = new GameState(content);
  talk(s, 'marlowe', ['auf den Weg']);
  const before = s.honor;
  talk(s, 'price', ['passiert', 'betrunken']);
  assert.equal(s.endings.case_01, 'c1_drowned');
  assert.equal(s.honor, before - 10);
});

test('Fall 2: gutes Ende mit minimalem Ansehen (keine Rang-Abkürzungen)', () => {
  const s = new GameState(content);
  talk(s, 'marlowe', ['auf den Weg']);
  talk(s, 'price', ['passiert', 'betrunken']); // schlechtes Ende in Fall 1
  s.honor = 10;
  talk(s, 'marlowe', ['Was gibt']);
  assert.equal(s.quests.case_02, 'active');
  use(s, 'ebba', 'grave');
  assert.equal(use(s, 'ebba', 'shovel'), 'ok');
  talk(s, 'ivy', ['Nacht']);
  talk(s, 'ivy', ['hinterlassen']);
  talk(s, 'ivy', ['verloren']);
  use(s, 'ebba', 'medallion');
  use(s, 'ebba', 'jacket');
  talk(s, 'anselm', ['Wer könnte']);
  assert.equal(s.combine('dug_by_moll', 'paid_by_vey').result, 'new');
  assert.ok(s.isCertain('grave_for_vey'));
  talk(s, 'moll', ['Silber']);
  use(s, 'ebba', 'draft');
  assert.equal(s.factStatus('crypt'), 'likely');
  use(s, 'ebba', 'hymn');
  passWarden(s);
  talk(s, 'hester', []);
  talk(s, 'musicbox', ['Lieber nichts']);
  assert.equal(s.combine('song_calls', 'lullaby_for_lilian').result, 'new');
  assert.ok(s.isCertain('lured_by_vey'));
  assert.equal(s.isCertain('vey_motive'), false);
  talk(s, 'marlowe', ['Hester geschehen', 'Krypta gelockt']);
  assert.equal(s.endings.case_02, 'c2_good');
});

test('Fall 2: perfektes Ende braucht Ansehen (Archiv oder Inspektorin)', () => {
  const s = new GameState(content);
  playCase1(s);
  talk(s, 'marlowe', ['Sie kennen sie']);
  assert.equal(use(s, 'revier', 'archive_a'), s.honor >= 35 ? 'ok' : 'locked');
  s.honor = Math.max(s.honor, 50);
  assert.equal(use(s, 'revier', 'archive_a'), 'ok');
  assert.equal(use(s, 'revier', 'archive_b'), 'ok');
  talk(s, 'marlowe', ['Miriam Vey']);
  assert.equal(s.factStatus('lilian_return'), 'likely');
  talk(s, 'barnaby', []);
  assert.equal(s.content.dialogues.barnaby.start[0].node, 'proud');
  talk(s, 'moll', ['Revier Kettlegate']);
  assert.equal(s.factStatus('crypt'), 'likely', 'Plan aus dem Archiv + Molls Geständnis');
  use(s, 'ebba', 'grave');
  use(s, 'ebba', 'shovel');
  talk(s, 'elias', ['erinnern']);
  talk(s, 'ivy', ['Nacht']);
  use(s, 'ebba', 'jacket');
  talk(s, 'anselm', ['nachts']);
  use(s, 'ebba', 'hymn');
  passWarden(s);
  talk(s, 'hester', []);
  talk(s, 'musicbox', ['Lieber nichts']);
  s.combine('dug_by_moll', 'paid_by_vey');
  s.combine('song_calls', 'lullaby_for_lilian');
  s.combine('lilian_return', 'lullaby_for_lilian');
  talk(s, 'musicbox', ['zerschlagen']);
  assert.ok(s.flags.has('box_destroyed'));
  talk(s, 'marlowe', ['Hester geschehen', 'Tochter Lilian']);
  assert.equal(s.endings.case_02, 'c2_perfect');
});

test('Falsche Spur: Anselm wird durch sein Kassenbuch entlastet', () => {
  const s = new GameState(content);
  s.addClue('moll_blames');
  s.addClue('rook_anselm');
  assert.equal(s.factStatus('anselm_thief'), 'likely');
  use(s, 'ebba', 'book');
  assert.equal(s.factStatus('anselm_thief'), 'refuted');
});

test('Rang-Abkürzung: mit Ansehen 35 rückt Halloway das Pfandbuch direkt heraus', () => {
  const s = new GameState(content);
  assert.throws(() => talk(s, 'halloway', ['Pfandbuch']));
  s.honor = 35;
  talk(s, 'halloway', ['Pfandbuch']);
  assert.ok(s.hasClue('pawn_ledger'));
});
