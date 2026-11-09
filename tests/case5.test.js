// Fall 5 „Der Chor in der Glocke“ über die echten Dialoge und Objekte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, use, fight, SKILLED, EXPERT } from './helpers.js';

const content = loadContent();
const WIN = { defend: SKILLED, healBelow: 15 };
const BOSS = { defend: EXPERT, healBelow: 15 }; // Bosse verlangen sauberes Timing

/** Zustand nach Fall 4 (gutes Ende, Epilog gesehen). */
function afterCase4() {
  const s = new GameState(content);
  s.honor = 60;
  ['briefed_01', 'travel_ashgrove', 'travel_ebba', 'travel_docks', 'travel_nordtor', 'case_01_closed', 'elias_rescued', 'reported_01', 'case_02_closed',
    'hester_saved', 'briefed_03', 'case_03_raid', 'case_03_closed', 'rook_arrested', 'epilogue3_seen', 'briefed_04', 'case_04_closed', 'felix_arrested', 'epilogue4_seen']
    .forEach((f) => s.flags.add(f));
  ['case_01', 'case_02', 'case_03', 'case_04'].forEach((q) => { s.quests[q] = 'done'; });
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem('verband', 4);
  return s;
}

function brief(s) {
  talk(s, 'marlowe', ['Gießerei']);
  assert.equal(s.quests.case_05, 'active');
  assert.ok(s.meets(content.travel.find((t) => t.map === 'giesserei')));
  assert.equal(s.factStatus('rost_bell'), 'suspected');
}

function investigate(s, { flaw = true } = {}) {
  use(s, 'giesserei', 'mould');
  talk(s, 'nachtwaechter', ['Gießerei']);
  assert.equal(s.factStatus('bell_cast'), 'likely');
  use(s, 'haus_vey', 'list');
  talk(s, 'waescherin', ['Kundinnen']);
  assert.equal(s.combine('bell_cast', 'seven_voices').result, 'new');
  // Brannock lügt erst und redet, wenn man ihm das Auftragsbuch zeigt
  talk(s, 'brannock', ['gemietet']);
  assert.ok(!s.hasClue('brannock_lady'));
  use(s, 'giesserei', 'ledger');
  assert.equal(s.factStatus('rost_bell'), 'refuted');
  talk(s, 'brannock', ['M. V.']);
  talk(s, 'oda_vey', ['Schwester']);
  s.money = Math.max(s.money, 1);
  talk(s, 'kind_streuner', ['Schleierfrau']);
  assert.equal(s.combine('foundry_buyer', 'vey_face').result, 'new');
  talk(s, 'brannock', ['Glocke jetzt']);
  assert.ok(s.isCertain('voice_bell') && s.isCertain('veiled_vey'));
  if (flaw) {
    talk(s, 'ezra', ['Glocke, die es nicht gibt']);
    talk(s, 'hettie', ['bricht man']);
    talk(s, 'starling', ['Glocke zerstören']);
    assert.ok(s.itemCount('stimmgabel_silber') > 0);
    assert.equal(s.combine('bell_hour', 'bell_flaw').result, 'new');
    assert.ok(s.isCertain('break_bell'));
  }
}

test('Fall 5: Briefing erst nach dem Epilog von Fall 4', () => {
  const s = afterCase4();
  s.flags.delete('epilogue4_seen');
  talk(s, 'marlowe', []);
  assert.ok(s.flags.has('epilogue4_seen'));
  assert.equal(s.quests.case_05, undefined);
  brief(s);
});

test('Fall 5: bestes Ende, die Glocke mit der Stimmgabel gebrochen', () => {
  const s = afterCase4();
  brief(s);
  investigate(s);
  talk(s, 'marlowe', ['Glocke hängt', 'Neumond']);
  assert.ok(s.flags.has('case_05_showdown'));
  assert.equal(use(s, 'giesserei', 'kammer'), 'ok');
  assert.equal(fight(s, 'bronzeengel', BOSS).result.outcome, 'won');
  const { combat, result } = fight(s, 'miriam', BOSS);
  assert.ok(combat.weak);
  assert.equal(result.outcome, 'won');
  talk(s, 'glocke5', ['Stimmgabel']);
  assert.equal(s.endings.case_05, 'c5_perfect');
  assert.equal(s.quests.case_05, 'done');
  talk(s, 'marlowe', ['Danke']);
  assert.ok(s.flags.has('epilogue5_seen'));
});

test('Fall 5: Lilians Bitte an Miriam weitergeben', () => {
  const s = afterCase4();
  brief(s);
  investigate(s);
  use(s, 'haus_vey', 'diary');
  talk(s, 'lilian_echo', ['schlafen']);
  assert.equal(s.combine('lilian_call', 'seven_voices').result, 'new');
  talk(s, 'marlowe', ['Glocke hängt', 'Neumond']);
  fight(s, 'bronzeengel', BOSS);
  fight(s, 'miriam', BOSS);
  talk(s, 'glocke5', ['schlafen', '…', 'Stimmgabel']);
  assert.ok(s.flags.has('lilian_told'));
  assert.equal(s.endings.case_05, 'c5_perfect');
});

test('Fall 5: ohne Stimmgabel bleibt nur, die Glocke zu zerschlagen, und Vey entkommt', () => {
  const s = afterCase4();
  brief(s);
  investigate(s, { flaw: false });
  talk(s, 'marlowe', ['Glocke hängt', 'Neumond']);
  fight(s, 'bronzeengel', BOSS);
  const { combat } = fight(s, 'miriam', BOSS);
  assert.ok(!combat.weak);
  talk(s, 'glocke5', ['Balken']);
  assert.equal(s.endings.case_05, 'c5_good');
  assert.ok(s.flags.has('vey_fled'));
});

test('Fall 5: falsche Spur Rostbrüder und vorschnelle Anklage', () => {
  const s = afterCase4();
  brief(s);
  talk(s, 'marlowe', ['Glocke hängt', 'Rostbrüder']);
  assert.equal(s.endings.case_05, 'c5_rust');
  assert.ok(s.flags.has('c5_wrong'));
  talk(s, 'marlowe', ['leid']);
  assert.ok(s.flags.has('epilogue5_seen'));

  const t = afterCase4();
  brief(t);
  investigate(t, { flaw: false });
  // Nur eine Quelle für den Schleier: Marlowe will mehr
  const u = afterCase4();
  brief(u);
  use(u, 'giesserei', 'mould');
  talk(u, 'nachtwaechter', ['Gießerei']);
  use(u, 'haus_vey', 'list');
  talk(u, 'waescherin', ['Kundinnen']);
  u.combine('bell_cast', 'seven_voices');
  use(u, 'giesserei', 'ledger');
  talk(u, 'oda_vey', ['Schwester']);
  assert.equal(u.combine('foundry_buyer', 'vey_face').result, 'new');
  talk(u, 'ezra', ['Glocke, die es nicht gibt']);
  const path = talk(u, 'marlowe', ['Glocke hängt', 'Neumond']);
  assert.equal(path.at(-1), 'unsure5');
  talk(t, 'marlowe', ['Glocke hängt', 'Wo die Glocke ist', 'Schicken']);
  assert.equal(t.endings.case_05, 'c5_early');
});
