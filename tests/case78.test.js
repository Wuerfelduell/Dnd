// Fall 7 „Ertrunken im Trockenen“ und Fall 8 „Die Schlafwandler von St. Brigid“: zwei parallele Fälle mit derselben Täterin.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, use, fight, SKILLED, EXPERT } from './helpers.js';
import { nextDeduction } from '../src/core/hints.js';
import { leadTarget } from '../src/core/Guide.js';

const content = loadContent();
const BOSS = { defend: EXPERT, healBelow: 15 };

/** Zustand nach Fall 6 (Epilog gesehen). */
function afterCase6() {
  const s = new GameState(content);
  s.honor = 80;
  ['briefed_01', 'travel_ashgrove', 'travel_ebba', 'travel_docks', 'travel_nordtor', 'case_01_closed', 'elias_rescued', 'reported_01', 'case_02_closed',
    'hester_saved', 'briefed_03', 'case_03_raid', 'case_03_closed', 'rook_arrested', 'epilogue3_seen', 'briefed_04', 'case_04_closed', 'felix_arrested',
    'epilogue4_seen', 'briefed_05', 'case_05_closed', 'vey_arrested', 'epilogue5_seen', 'briefed_06', 'case_06_closed', 'mews_arrested', 'epilogue6_seen']
    .forEach((f) => s.flags.add(f));
  ['case_01', 'case_02', 'case_03', 'case_04', 'case_05', 'case_06'].forEach((q) => { s.quests[q] = 'done'; });
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem('verband', 4);
  // Bis Fall 7/8 hat man über das Revier längst Sequenz 7 erreicht (Miss Wren ist ohne Durchbruch kaum zu schaffen).
  s.pathway = { id: 'eisen', seq: 7, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  return s;
}

function briefBoth(s) {
  talk(s, 'marlowe', ['Kontor']);
  assert.equal(s.quests.case_07, 'active');
  talk(s, 'kind_streuner', ['Erzähl', 'sehe mir']);
  assert.equal(s.quests.case_08, 'active');
}

function case7(s) {
  talk(s, 'finch', ['gefunden']);
  talk(s, 'finch', ['herein']);
  use(s, 'kontor_thorne', 'chute');
  assert.equal(s.combine('coal_prints', 'drowned_dry').result, 'new');
  use(s, 'kontor_thorne', 'desk');
  talk(s, 'matrose', ['Wasser']);
  assert.equal(s.combine('canal_water', 'drowned_dry').result, 'new');
  use(s, 'kontor_thorne', 'letter');
  talk(s, 'sufragette', ['protestiert']);
  talk(s, 'erbe', ['erben']);
  talk(s, 'matrose', ['Edmund']);
  assert.equal(s.factStatus('heir_motive'), 'refuted');
}

function case8(s) {
  talk(s, 'molly', ['träumst']);
  talk(s, 'molly', ['Abendtee']);
  use(s, 'waisenhaus', 'tea');
  assert.equal(s.combine('sleep_tea', 'sleepwalk').result, 'new');
  talk(s, 'gouvernante', ['wandeln']);
  talk(s, 'rattenfaenger', ['Miss Wren']);
  assert.equal(s.factStatus('piper_lure'), 'refuted');
  talk(s, 'rattenfaenger', ['Kanal']);
  use(s, 'waisenhaus', 'gowns');
  talk(s, 'rattenfaenger', ['Wohin']);
  use(s, 'waisenhaus', 'threads');
  assert.equal(s.combine('dream_thread', 'sleepwalk').result, 'new');
  talk(s, 'molly', ['Benji']);
  use(s, 'waisenhaus', 'benjibed');
}

test('Fall 7 und 8: beide Briefings nach Fall 6, die Fälle wirken erst getrennt', () => {
  const s = afterCase6();
  briefBoth(s);
  case7(s);
  // Bevor man in St. Brigid war, steht nichts aus Fall 7 bei Fall 8 und umgekehrt
  assert.ok(!s.knownFacts('case_07').includes('benji_missing'));
  assert.ok(!s.knownFacts('case_08').includes('coal_prints'));
  const cross = [];
  s.on('cross', (x) => cross.push(`${x.fact}>${x.case}`));
  case8(s);
  assert.ok(cross.includes('coal_prints>case_08'), 'Querverbindung wird gemeldet');
  // Benjis Kohlenstaub schlägt die Brücke: die Spuren tauchen im jeweils anderen Fall auf
  assert.ok(s.knownFacts('case_08').includes('coal_prints'));
  assert.ok(s.knownFacts('case_07').includes('benji_missing'));
  assert.ok(s.knownFacts('case_07').includes('canal_walk'));
  assert.ok(s.knownFacts('case_08').includes('foreclosure'));
  // Die Tipps finden die verbindenden Schlussfolgerungen
  assert.ok(['link_benji', 'link_motive'].includes(nextDeduction(s, 'case_08').deduction.id));
});

test('Fall 7 und 8: bestes Ende, beide Fälle über die Verbindung gelöst und Benji gefunden', () => {
  const s = afterCase6();
  briefBoth(s);
  case7(s);
  case8(s);
  assert.equal(s.combine('coal_prints', 'benji_missing').result, 'new');
  assert.equal(s.combine('foreclosure', 'sleep_tea').result, 'new');
  assert.equal(s.combine('canal_water', 'canal_walk').result, 'new');
  assert.ok(s.isCertain('link_motive') && s.isCertain('d8_thread'));
  talk(s, 'marlowe', ['St. Brigid', 'Traumfäden']);
  assert.ok(s.flags.has('case_78_showdown'));
  assert.equal(use(s, 'waisenhaus', 'keller'), 'ok');
  assert.equal(fight(s, 'traumfaden', BOSS).result.outcome, 'won');
  const { combat, result } = fight(s, 'miss_wren', BOSS);
  assert.ok(combat.weak);
  assert.equal(result.outcome, 'won');
  talk(s, 'webstuhl8', ['Namen']);
  assert.equal(s.endings.case_08, 'c8_perfect');
  assert.equal(s.quests.case_07, 'done');
  assert.equal(s.quests.case_08, 'done');
  assert.ok(s.flags.has('benji_found'));
  talk(s, 'marlowe', ['Danke']);
  assert.ok(s.flags.has('epilogue78_seen'));
});

test('Fall 7 und 8: ohne Benji-Verbindung nur den Webstuhl verbrennen', () => {
  const s = afterCase6();
  briefBoth(s);
  case7(s);
  case8(s);
  s.combine('foreclosure', 'sleep_tea');
  talk(s, 'marlowe', ['St. Brigid', 'Traumfäden']);
  fight(s, 'traumfaden', BOSS);
  fight(s, 'miss_wren', BOSS);
  talk(s, 'webstuhl8', ['anzünden']);
  assert.equal(s.endings.case_08, 'c8_good');
  assert.equal(s.quests.case_07, 'done');
});

test('Fall 7 und 8: falsche Spuren Erbe und Rattenfänger', () => {
  const s = afterCase6();
  briefBoth(s);
  talk(s, 'marlowe', ['Thorne ertrunken', 'Neffe']);
  assert.equal(s.endings.case_07, 'c7_heir');
  assert.equal(s.quests.case_08, 'active', 'Fall 8 läuft weiter');
  talk(s, 'marlowe', ['leid']);
  talk(s, 'marlowe', ['St. Brigid', 'Rattenfänger']);
  assert.equal(s.endings.case_08, 'c8_piper');
  talk(s, 'marlowe', ['leid']);
  assert.ok(s.flags.has('epilogue7_seen') && s.flags.has('epilogue8_seen'));
});

test('Fall 7 und 8: vorschnell über den Tee verhaften', () => {
  const s = afterCase6();
  briefBoth(s);
  talk(s, 'molly', ['träumst']);
  talk(s, 'molly', ['Abendtee']);
  use(s, 'waisenhaus', 'tea');
  s.combine('sleep_tea', 'sleepwalk');
  talk(s, 'marlowe', ['St. Brigid', 'Tee', 'Holen']);
  assert.equal(s.endings.case_08, 'c8_early');
  assert.equal(s.quests.case_07, 'done');
});

test('Fall 8 kommt von Nan Kettle: ohne Fall 8 zeigen Spur, Wegweiser und Marlowe zum Nachtmarkt', () => {
  const s = afterCase6();
  // Nach dem Epilog von Fall 6 wartet Fall 7 bei Marlowe
  assert.deepEqual(s.openLeads().map((l) => l.quest), ['case_07']);
  assert.equal(leadTarget(s, s.openLeads()[0]).id, 'marlowe');
  talk(s, 'marlowe', ['Kontor']);
  // Fall 7 läuft, Fall 8 ist noch nicht abgeholt: die Spur zeigt auf Nan am Nachtmarkt
  assert.deepEqual(s.openLeads().map((l) => l.quest), ['case_08']);
  const t = leadTarget(s, s.openLeads()[0]);
  assert.equal(t.map, 'nachtmarkt');
  assert.equal(t.id, 'kind_streuner');
  assert.equal(t.name, 'Nan Kettle');
  // Fall 7 falsch abgeschlossen, ohne je bei Nan gewesen zu sein
  talk(s, 'marlowe', ['Thorne ertrunken', 'Neffe']);
  assert.equal(s.endings.case_07, 'c7_heir');
  assert.equal(s.quests.case_08, undefined);
  const hint = s.nextHint();
  assert.ok(hint.lead && hint.quest.startsWith('Fall 8') && hint.text.includes('Nan Kettle'), 'Tipp nennt Nan');
  // Marlowe: erst der Epilog, dann die Erinnerung an Nan, dann der Hub
  talk(s, 'marlowe', ['leid']);
  assert.ok(s.flags.has('epilogue7_seen'));
  assert.equal(talk(s, 'marlowe', ['Was weiß', 'Nan'])[0], 'nan_reminder');
  assert.equal(talk(s, 'marlowe')[0], 'hub');
  // Bei Nan startet Fall 8, die Spur verschwindet
  talk(s, 'kind_streuner', ['Erzähl', 'sehe mir']);
  assert.equal(s.quests.case_08, 'active');
  assert.deepEqual(s.openLeads(), []);
  assert.equal(s.nextHint().lead, undefined);
});

test('Fall 7 und 8: Fall 7 vorschnell geschlossen, Fall 8 bleibt trotzdem lösbar (Brief im Kontor, Clara)', () => {
  const s = afterCase6();
  briefBoth(s);
  // Fall 7 falsch gelöst, bevor Brief, Schacht und Clara ausgewertet waren
  talk(s, 'marlowe', ['Thorne ertrunken', 'Neffe']);
  assert.equal(s.endings.case_07, 'c7_heir');
  talk(s, 'marlowe', ['leid']);
  case8(s);
  // Die zweite Quelle für die Räumung ist weiterhin erreichbar, solange Fall 8 läuft
  assert.equal(use(s, 'kontor_thorne', 'letter'), 'ok');
  talk(s, 'sufragette', ['protestiert']);
  assert.equal(s.factStatus('foreclosure'), 'likely');
  assert.equal(use(s, 'kontor_thorne', 'chute'), 'ok');
  assert.equal(s.combine('foreclosure', 'sleep_tea').result, 'new');
  assert.equal(s.combine('coal_prints', 'benji_missing').result, 'new');
  assert.ok(s.isCertain('link_motive') && s.isCertain('d8_thread'));
  talk(s, 'marlowe', ['St. Brigid', 'Traumfäden']);
  assert.ok(s.flags.has('case_78_showdown'));
  fight(s, 'traumfaden', BOSS);
  fight(s, 'miss_wren', BOSS);
  talk(s, 'webstuhl8', ['Namen']);
  assert.equal(s.endings.case_08, 'c8_perfect');
  // Ohne Fall 7 und 8 ist der Kontor-Brief nicht mehr zu sehen
  assert.throws(() => use(s, 'kontor_thorne', 'letter'), /unsichtbar/);
});
