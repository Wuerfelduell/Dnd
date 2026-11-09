// Fall 9 „Der Sternsammler“: Finale von Kapitel 1. Professor Starling hat die Fälle 1–8 als Ernte inszeniert und hängt sie dir an.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, use, fight, EXPERT } from './helpers.js';

const content = loadContent();
const BOSS = { defend: EXPERT, healBelow: 15 };

/** Zustand nach Fall 7/8 (bestes Ende, Epilog gesehen). */
function afterCase8() {
  const s = new GameState(content);
  s.honor = 90;
  ['briefed_01', 'travel_ashgrove', 'travel_ebba', 'travel_docks', 'travel_nordtor', 'case_01_closed', 'elias_rescued', 'reported_01', 'case_02_closed',
    'hester_saved', 'briefed_03', 'case_03_raid', 'case_03_closed', 'rook_arrested', 'epilogue3_seen', 'briefed_04', 'case_04_closed', 'felix_arrested',
    'epilogue4_seen', 'briefed_05', 'case_05_closed', 'vey_arrested', 'epilogue5_seen', 'briefed_06', 'case_06_closed', 'mews_arrested', 'epilogue6_seen',
    'briefed_07', 'briefed_08', 'case_07_closed', 'case_08_closed', 'wren_arrested', 'benji_found', 'epilogue78_seen']
    .forEach((f) => s.flags.add(f));
  ['case_01', 'case_02', 'case_03', 'case_04', 'case_05', 'case_06', 'case_07', 'case_08'].forEach((q) => { s.quests[q] = 'done'; });
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem('verband', 4);
  // Nach Fall 7/8 hat man Sequenz 7 längst erreicht (Starling ist ohne Durchbruch nicht zu schaffen).
  s.pathway = { id: 'eisen', seq: 7, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  return s;
}

function brief(s) {
  talk(s, 'marlowe', ['Brief']);
  assert.equal(s.quests.case_09, 'active');
  assert.ok(s.flags.has('travel_sternwarte'));
  assert.ok(content.travel.some((t) => t.map === 'sternwarte' && s.meets(t)), 'Sternwarte ist erreichbar');
}

/** Alle Spuren: Sternwarte, Zellen, Ezra, Ada, Bram, Price. */
function investigate(s) {
  for (const id of ['lenses9', 'letters9', 'blotter9', 'karte9', 'ledger9', 'scope9']) use(s, 'sternwarte', id);
  assert.equal(s.factStatus('starling_victim'), 'refuted', 'Der Professor wurde nicht entführt');
  talk(s, 'zellen9', ['Felix']);
  talk(s, 'zellen9', ['Mews']);
  talk(s, 'ezra', ['neuen Stern']);
  talk(s, 'ezra', ['Lichter']);
  talk(s, 'fotografin', ['Himmel']);
  talk(s, 'bram', ['Ochsenblut']);
  talk(s, 'price', ['Starling']);
}

test('Fall 9 beginnt nach Fall 7/8, der Professor ist verschwunden, und über dich gehen Briefe ein', () => {
  const s = afterCase8();
  const sw = content.maps.sternwarte.npcs.find((n) => n.id === 'astronom');
  assert.ok(s.meets(sw.visible_if), 'Vorher steht Starling in seiner Sternwarte');
  brief(s);
  assert.ok(!s.meets(sw.visible_if), 'Danach ist er fort');
  assert.ok(s.hasClue('marlowe_letters'), 'Marlowe zeigt den anonymen Brief');
  // Auch nach dem schlechten Ende von Fall 8 geht es weiter
  const t = afterCase8();
  ['epilogue78_seen', 'wren_arrested', 'benji_found'].forEach((f) => t.flags.delete(f));
  ['c8_wrong', 'epilogue8_seen', 'epilogue7_seen'].forEach((f) => t.flags.add(f));
  talk(t, 'marlowe', ['Sternwarte']);
  assert.equal(t.quests.case_09, 'active');
});

test('Fall 9: bestes Ende, Starling gestellt, die Lichter heimgeschickt, trotzdem Flucht nach Wexmoor', () => {
  const s = afterCase8();
  brief(s);
  investigate(s);
  assert.equal(s.combine('harvest', 'sky_lights').result, 'new');
  assert.equal(s.combine('star_near', 'star_night').result, 'new');
  assert.equal(s.combine('frame', 'harvest').result, 'new');
  assert.ok(s.isCertain('d9_ernte') && s.isCertain('d9_stern') && s.isCertain('d9_falle'));
  talk(s, 'marlowe', ['hinter allen Fällen', 'Professor Starling']);
  assert.ok(s.flags.has('case_09_showdown'));
  assert.equal(fight(s, 'sternlicht', BOSS).result.outcome, 'won');
  s.heal(s.maxHp); // zwischendurch durchatmen (Sofa, Revier-Pritsche)
  const { combat, result } = fight(s, 'starling_fight', BOSS);
  assert.ok(combat.weak, 'Wer die Ernte kennt, trifft Starling an der schwachen Stelle');
  assert.equal(result.outcome, 'won');
  use(s, 'sternwarte', 'spiegel9');
  talk(s, 'sternspiegel9', ['Namen']);
  assert.equal(s.endings.case_09, 'c9_perfect');
  assert.equal(s.quests.case_09, 'done');
  assert.ok(s.flags.has('kapitel1_done'));
  assert.equal(s.itemCount('fahrkarte_wexmoor'), 1);
  assert.equal(s.itemCount('empfehlungsschreiben'), 1);
  assert.match(content.endings.c9_perfect.chapter.title, /Kapitel 1/);
  talk(s, 'marlowe', ['Danke']);
  assert.ok(s.flags.has('farewell9_seen'));
});

test('Fall 9: ohne die Briefe zu durchschauen bleibt nur, den Spiegel zu zerschlagen', () => {
  const s = afterCase8();
  brief(s);
  investigate(s);
  s.combine('harvest', 'sky_lights');
  s.combine('star_near', 'star_night');
  talk(s, 'marlowe', ['hinter allen Fällen', 'Professor Starling']);
  fight(s, 'sternlicht', BOSS);
  s.heal(s.maxHp);
  assert.equal(fight(s, 'starling_fight', BOSS).result.outcome, 'won');
  assert.throws(() => talk(s, 'sternspiegel9', ['Namen']));
  talk(s, 'sternspiegel9', ['zerschlagen']);
  assert.equal(s.endings.case_09, 'c9_good');
  assert.ok(s.flags.has('kapitel1_done'));
});

test('Fall 9: mit nur einer Quelle schickt Marlowe einen zurück, vorschnell und falsch endet es schlecht', () => {
  const s = afterCase8();
  brief(s);
  use(s, 'sternwarte', 'ledger9');
  talk(s, 'ezra', ['Lichter']);
  use(s, 'sternwarte', 'karte9');
  s.combine('harvest', 'sky_lights');
  s.combine('star_near', 'star_night');
  talk(s, 'marlowe', ['hinter allen Fällen', 'Professor Starling']);
  assert.ok(!s.flags.has('case_09_showdown'), 'Vermutungen reichen nicht');
  talk(s, 'marlowe', ['hinter allen Fällen', 'stürmen', 'Schicken']);
  assert.equal(s.endings.case_09, 'c9_early');
  assert.ok(s.flags.has('kapitel1_done'));

  const t = afterCase8();
  brief(t);
  talk(t, 'marlowe', ['hinter allen Fällen', 'Miriam Vey']);
  assert.equal(t.endings.case_09, 'c9_vey');
  assert.ok(t.flags.has('kapitel1_done'));
});

test('Fall 9: jedes Ende schließt Kapitel 1 ab und gibt die Fahrkarte', () => {
  for (const id of ['c9_perfect', 'c9_good', 'c9_early', 'c9_vey']) {
    const e = content.endings[id];
    assert.equal(e.case, 'case_09');
    assert.ok(e.chapter?.title && e.chapter?.text, id);
    assert.ok(e.sets_flags.includes('kapitel1_done'), id);
    assert.equal(e.gives_items.fahrkarte_wexmoor, 1, id);
  }
});
