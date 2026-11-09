// Fall 6 „Der dreizehnte Gast“ und der Nebenauftrag „Das Wundertonikum“ über die echten Dialoge und Objekte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, talk, use, fight, SKILLED, EXPERT } from './helpers.js';

const content = loadContent();
const WIN = { defend: SKILLED, healBelow: 15 };
const BOSS = { defend: EXPERT, healBelow: 15 }; // Bosse verlangen sauberes Timing

/** Zustand nach Fall 5 (Epilog gesehen). */
function afterCase5() {
  const s = new GameState(content);
  s.honor = 70;
  ['briefed_01', 'travel_ashgrove', 'travel_ebba', 'travel_docks', 'travel_nordtor', 'case_01_closed', 'elias_rescued', 'reported_01', 'case_02_closed',
    'hester_saved', 'briefed_03', 'case_03_raid', 'case_03_closed', 'rook_arrested', 'epilogue3_seen', 'briefed_04', 'case_04_closed', 'felix_arrested',
    'epilogue4_seen', 'briefed_05', 'case_05_closed', 'vey_arrested', 'epilogue5_seen'].forEach((f) => s.flags.add(f));
  ['case_01', 'case_02', 'case_03', 'case_04', 'case_05'].forEach((q) => { s.quests[q] = 'done'; });
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem('verband', 4);
  return s;
}

function brief(s) {
  talk(s, 'marlowe', ['Villa']);
  assert.equal(s.quests.case_06, 'active');
  assert.ok(s.meets(content.travel.find((t) => t.map === 'ballsaal')));
  assert.equal(s.factStatus('seer_curse'), 'suspected');
}

function investigate(s, { plate = true } = {}) {
  talk(s, 'ashcombe', ['Ball passiert']);
  talk(s, 'ashcombe', ['gut']);
  talk(s, 'student', ['untersucht']);
  assert.equal(s.factStatus('shadows_lost'), 'likely');
  use(s, 'atelier', 'bath');
  talk(s, 'fotografin', ['entwickelt']);
  assert.equal(s.factStatus('plates_tampered'), 'likely');
  assert.equal(s.factStatus('seer_curse'), 'refuted');
  use(s, 'spiegelkabinett', 'scraped');
  talk(s, 'kutscher', ['Ball gefahren']);
  assert.equal(s.combine('plates_tampered', 'mirror_source').result, 'new');
  use(s, 'ballsaal', 'guests');
  talk(s, 'wahrsagerin', ['vorhergesagt']);
  assert.equal(s.combine('mews_absent', 'shadows_lost').result, 'new');
  assert.ok(s.isCertain('shadow_bath') && s.isCertain('thirteenth'));
  if (plate) {
    talk(s, 'fotografin', ['Platte mitnehmen']);
    talk(s, 'inspect_platte', ['Licht']);
    talk(s, 'student', ['fremde Schatten']);
    assert.equal(s.combine('guest_made', 'plates_tampered').result, 'new');
    assert.ok(s.isCertain('shadow_man'));
  }
}

test('Fall 6: bestes Ende, die Schatten kehren zurück', () => {
  const s = afterCase5();
  brief(s);
  investigate(s);
  talk(s, 'marlowe', ['dreizehnte Gast', 'Spiegelkabinett']);
  assert.ok(s.flags.has('case_06_showdown'));
  const { combat, result } = fight(s, 'dreizehnter_gast', BOSS);
  assert.ok(combat.weak);
  assert.equal(result.outcome, 'won');
  talk(s, 'kabinett6', ['Silberbad']);
  assert.equal(s.endings.case_06, 'c6_perfect');
  assert.ok(s.itemCount('kamera_alt') > 0);
  talk(s, 'marlowe', ['Danke']);
  assert.ok(s.flags.has('epilogue6_seen'));
});

test('Fall 6: ohne Wissen um den Schattenmann nur die Spiegel zerschlagen', () => {
  const s = afterCase5();
  brief(s);
  investigate(s, { plate: false });
  talk(s, 'marlowe', ['dreizehnte Gast', 'Spiegelkabinett']);
  fight(s, 'dreizehnter_gast', BOSS);
  talk(s, 'kabinett6', ['zerschlagen']);
  assert.equal(s.endings.case_06, 'c6_good');
});

test('Fall 6: falsche Spur Wahrsagerin', () => {
  const s = afterCase5();
  brief(s);
  talk(s, 'marlowe', ['dreizehnte Gast', 'Orsolya']);
  assert.equal(s.endings.case_06, 'c6_seer');
  talk(s, 'marlowe', ['leid']);
  assert.ok(s.flags.has('epilogue6_seen'));
});

test('Nebenauftrag Wundertonikum: kein Gift, sondern Betrug und verdorbener Fisch', () => {
  const s = afterCase5();
  talk(s, 'marlowe', []);
  talk(s, 'marktfrau', ['Pratt']);
  assert.equal(s.quests.wundertonikum, 'active');
  assert.equal(s.factStatus('tonic_poison'), 'suspected');
  use(s, 'nachtmarkt', 'pratt_crate');
  talk(s, 'student', ['Tonikum']);
  assert.equal(s.factStatus('tonic_poison'), 'refuted');
  use(s, 'docks', 'bess_barrel');
  talk(s, 'student', ['grün']);
  assert.equal(s.combine('tonic_laudanum', 'husband_fish').result, 'new');
  talk(s, 'schwindler', ['Laudanum', 'Fisch']);
  assert.equal(s.quests.wundertonikum, 'done');
  talk(s, 'marktfrau', ['Fisch']);
  assert.ok(s.flags.has('bess_told'));
});

test('Nebenauftrag Wundertonikum: Pratt wehrt sich, wenn man ihn verhaften will', () => {
  const s = afterCase5();
  talk(s, 'marktfrau', ['Pratt']);
  use(s, 'nachtmarkt', 'pratt_crate');
  talk(s, 'student', ['Tonikum']);
  talk(s, 'schwindler', ['Laudanum', 'Revier']);
  assert.equal(fight(s, 'pratt_fight', WIN).result.outcome, 'won');
  assert.equal(s.quests.wundertonikum, 'done');
});
