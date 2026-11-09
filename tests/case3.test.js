// Fall 3 und die neuen Nebenaufträge über die echten Dialoge und Objekte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, use, fight, SKILLED, EXPERT } from './helpers.js';

const content = loadContent();
const WIN = { defend: SKILLED, healBelow: 15 };

/** Zustand nach Fall 2 (gutes Ende), ohne Ansehens-Vorteile. */
function afterCase2({ hester = true, honor = 20 } = {}) {
  const s = new GameState(content);
  s.honor = honor;
  ['briefed_01', 'travel_ashgrove', 'travel_ebba', 'case_01_closed', 'elias_rescued', 'reported_01', 'case_02_closed'].forEach((f) => s.flags.add(f));
  if (hester) s.flags.add('hester_saved');
  s.quests.case_01 = 'done';
  s.quests.case_02 = 'done';
  s.addItem('schlagstock');
  return s;
}

function solveCase3(s, { bell = true } = {}) {
  talk(s, 'marlowe', ['Arzt', 'Verstanden']);
  assert.equal(s.quests.case_03, 'active');
  talk(s, 'fenwick', ['Krypta']);
  use(s, 'revier', 'boots');
  assert.equal(s.factStatus('mole'), 'likely');
  talk(s, 'holt', ['Herkunft']);
  talk(s, 'anselm', ['Thomas Rook']);
  assert.equal(s.factStatus('rook_choir'), 'likely');
  use(s, 'revier', 'roster');
  talk(s, 'price', ['ablösen']);
  assert.equal(s.factStatus('rook_nights'), 'likely');
  assert.equal(use(s, 'revier', 'locker'), 'locked', 'Spind erst mit begründetem Verdacht');
  assert.equal(s.combine('mole', 'rook_choir').result, 'new');
  assert.ok(s.isCertain('rook_mole'));
  use(s, 'revier', 'locker');
  talk(s, 'pip', ['sonst']);
  assert.equal(s.factStatus('docks'), 'likely');
  assert.equal(s.combine('docks', 'rook_nights').result, 'new');
  assert.ok(s.isCertain('choir_docks'));
  if (bell) {
    talk(s, 'agnes', ['als Nächstes']);
    use(s, 'ebba', 'bell');
    assert.equal(s.combine('ritual_bell', 'docks').result, 'new');
  }
  talk(s, 'marlowe', ['Maulwurf', 'Constable Rook']);
  assert.ok(s.flags.has('case_03_raid'));
  assert.ok(s.meets({ requires_flags: ['travel_docks'] }));
  // Lagerhaus 7
  talk(s, 'price_docks', ['Verbandszeug']);
  assert.equal(fight(s, 'choir_zealots', WIN).result.outcome, 'won');
  talk(s, 'rook_final', ['Hester', 'Nein']);
  assert.equal(s.pendingCombat, 'rook_fight');
  assert.equal(fight(s, 'rook_fight', { ...WIN, defend: EXPERT }).result.outcome, 'won'); // Bosskampf
}

test('Fall 3: Rook enttarnen, Lagerhaus stürmen, Glocke sichern (perfektes Ende)', () => {
  const s = afterCase2();
  solveCase3(s);
  talk(s, 'vey', ['Glocke', 'Weiter']);
  assert.equal(s.endings.case_03, 'c3_perfect');
  assert.equal(s.itemCount('glocke'), 1);
  assert.equal(s.quests.case_03, 'done');
});

test('Fall 3: ohne Glocke gutes Ende, auch wenn Hester nicht gerettet wurde', () => {
  const s = afterCase2({ hester: false });
  solveCase3(s, { bell: false });
  talk(s, 'vey', ['entführt', 'Weiter']);
  assert.equal(s.endings.case_03, 'c3_good');
});

test('Fall 3: Die Spur zu Holt ist falsch und wird widerlegt', () => {
  const s = afterCase2();
  talk(s, 'marlowe', ['Arzt', 'Verstanden']);
  talk(s, 'rook', ['gesehen']);
  use(s, 'revier', 'holt_desk');
  assert.equal(s.factStatus('holt_mole'), 'likely', 'zwei Quellen, trotzdem falsch');
  talk(s, 'pimm', ['Holt']);
  assert.equal(s.factStatus('holt_mole'), 'refuted');
  talk(s, 'holt', ['Hospital']);
  assert.ok(s.flags.has('rook_lore'), 'Holt verrät Rooks Schwäche');
});

test('Fall 3: Holt zu beschuldigen kostet Ansehen und beendet den Fall schlecht', () => {
  const s = afterCase2();
  talk(s, 'marlowe', ['Arzt', 'Verstanden']);
  const before = s.honor;
  talk(s, 'marlowe', ['Maulwurf', 'Holt']);
  assert.equal(s.endings.case_03, 'c3_holt');
  assert.equal(s.honor, before - 12);
});

test('Nebenauftrag: Die Uhr ohne Besitzer', () => {
  const s = afterCase2();
  talk(s, 'halloway', ['nie abgeholt']);
  assert.equal(s.itemCount('taschenuhr'), 1);
  talk(s, 'greta', ['Taschenuhr', 'bringe sie ihm']);
  talk(s, 'elias', ['gehört Ihnen']);
  assert.equal(s.quests.lost_watch, 'done');
  assert.equal(s.itemCount('taschenuhr'), 0);
});

test('Nebenauftrag: Barnabys Unschuld (falscher Polizeibericht)', () => {
  const s = afterCase2();
  talk(s, 'barnaby', ['Warum sitzt']);
  assert.equal(s.factStatus('barnaby_thief'), 'suspected');
  talk(s, 'anselm', ['Silberleuchter']);
  talk(s, 'halloway', ['Silberleuchter']);
  assert.equal(s.factStatus('barnaby_thief'), 'refuted');
  talk(s, 'holt', ['unschuldig']);
  assert.equal(s.quests.barnaby_case, 'done');
  talk(s, 'marlowe', ['Arzt', 'Verstanden']);
  talk(s, 'barnaby_free', ['klopfte']);
  assert.equal(s.factSources('mole').length, 1);
});

test('Nebenaufträge: Ratten im Archiv, Der Ertrunkene, Die Schlagzeile', () => {
  const s = afterCase2();
  talk(s, 'pimm', ['raschelt']);
  assert.equal(fight(s, 'archive_rats', WIN).result.outcome, 'won');
  talk(s, 'pimm', ['Ratten sind fort']);
  assert.equal(s.quests.archive_rats, 'done');

  talk(s, 'tobias', ['verschwunden']);
  talk(s, 'ghost', ['Polizist']);
  talk(s, 'tobias', ['Nate gesprochen']);
  assert.equal(s.quests.drowned, 'done');

  const honor = s.honor;
  talk(s, 'pip', ['Was willst du', 'Ich überleg']);
  talk(s, 'pip', ['Ich hab eine', 'Hexe']);
  assert.equal(s.quests.pip_headline, 'done');
  assert.equal(s.honor, honor - 3);
});
