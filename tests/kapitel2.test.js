// Kapitel 2 „Die Moorstadt“: Ankunft in Wexmoor, Zunder aus der Rußgesellschaft, der Unterschlupf im Torfkahn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { travelDestinations, travelFast, cityOf } from '../src/core/Travel.js';
import { loadContent, talk, use } from './helpers.js';

const content = loadContent();

/** Nach Fall 9: Fahrkarte in der Tasche, Kapitel 1 vorbei. */
function afterChapter1() {
  const s = new GameState(content);
  s.flags.add('kapitel1_done');
  s.addItem('fahrkarte_wexmoor');
  s.map = 'revier';
  return s;
}

const names = (s, map) => travelDestinations(s, map).map((t) => t.map);

test('Mit der Fahrkarte führt die Stadtkarte von Kettlegate nach Wexmoor', () => {
  const s = new GameState(content);
  assert.ok(!names(s, 'revier').includes('wx_bahnhof'), 'ohne Fahrkarte kein Zug');
  const t = afterChapter1();
  assert.ok(names(t, 'revier').includes('wx_bahnhof'));
  assert.equal(cityOf(t, 'wx_bahnhof'), 'wexmoor');
});

test('Ankunft: Steckbrief, Zunder, Unterschlupf und die erste Schlussfolgerung', () => {
  const s = afterChapter1();
  s.map = 'wx_bahnhof';
  use(s, 'wx_bahnhof', 'ankunft');
  s.flags.add('k2_arrived'); // done_flag setzt sonst die Welt
  assert.equal(s.quests.k2_akt1, 'active');
  // Ohne Zunder kommt man nicht vom Bahnhof weg
  assert.equal(use(s, 'wx_bahnhof', 'exit'), 'locked');
  use(s, 'wx_bahnhof', 'steckbrief');
  talk(s, 'zunder_ankunft', ['Wer bist du', 'verstecken', 'vorher', 'Bring mich']);
  assert.ok(s.flags.has('k2_met_zunder'));
  assert.equal(use(s, 'wx_bahnhof', 'exit'), 'ok');
  // Auf der Wexmoorer Karte stehen nur Wexmoorer Ziele (und der Zug zurück)
  const dests = names(s, 'wx_bahnhof');
  assert.ok(dests.includes('wx_torfstich'));
  assert.ok(dests.every((m) => cityOf(s, m) === 'wexmoor' || m === 'docks'), dests.join(','));
  assert.ok(!dests.includes('revier'));
  // Zweite Quelle beim Schleusenwärter, dann die Schlussfolgerung
  talk(s, 'druce', ['Steckbriefe']);
  assert.equal(s.factStatus('wx_expected'), 'likely');
  assert.equal(s.factStatus('wx_star_paper'), 'likely');
  assert.equal(s.combine('wx_expected', 'wx_star_paper').result, 'new');
  assert.ok(s.hasConclusion('dk2_erwartet'));
  // Unterschlupf
  s.flags.add('k2_hideout');
  assert.ok(names(s, 'wx_torfstich').includes('docks'), 'Nachtzug zurück nach Kettlegate');
  assert.deepEqual(s.questSteps('k2_akt1').map((x) => x.done), [true, true, true, true, false]);
});

test('Schnelle Reisen in Wexmoor würfeln nur Wexmoorer Ereignisse', () => {
  const s = afterChapter1();
  s.map = 'wx_torfstich';
  s.setComposure(100);
  for (const r of [0, 0.3, 0.6, 0.99]) {
    const ev = travelFast(s, () => r);
    assert.equal(ev.city, 'wexmoor', ev.id);
    s.setComposure(100);
  }
});
