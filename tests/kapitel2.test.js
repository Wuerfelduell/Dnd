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

test('Grauspäher: Sichtkegel wächst mit der Fahndung, Stufe sinkt beim Untertauchen', () => {
  const s = afterChapter1();
  const c0 = s.policeCone();
  s.escapedPatrol();
  s.escapedPatrol();
  assert.equal(s.wanted, 2);
  const c2 = s.policeCone();
  assert.ok(c2.range > c0.range && c2.angle > c0.angle && c2.catchSec < c0.catchSec);
  s.escapedPatrol();
  s.escapedPatrol();
  assert.equal(s.wanted, content.police.max_level, 'nicht über die Höchststufe');
  s.restWanted();
  assert.equal(s.wanted, content.police.max_level - 1);
  s.tickWanted(content.police.decay_sec + 1);
  assert.equal(s.wanted, content.police.max_level - 2, 'die Zeit lässt die Wache vergessen');
  const saved = s.serialize();
  const t = new GameState(content);
  t.load(saved);
  assert.equal(t.wanted, s.wanted);
});

test('Festnahme: Zelle, zweimal holt Zunder dich umsonst raus, danach kostet es', () => {
  const s = afterChapter1();
  s.money = 100;
  for (let i = 1; i <= 3; i++) {
    const r = s.arrest();
    assert.equal(r.map, 'wx_zelle');
    assert.ok(content.maps.wx_zelle.spawns[r.spawn]);
    assert.ok(s.flags.has('k2_in_cell'));
    const before = s.money;
    const path = talk(s, 'wx_zelle', ['Zunder']);
    assert.equal(path.at(-1), i <= 2 ? 'bail_free' : 'bail_pay', `Festnahme ${i}`);
    assert.equal(before - s.money, i <= 2 ? 0 : 15);
    assert.ok(!s.flags.has('k2_in_cell'));
    assert.deepEqual(s.pendingTravel, { map: 'wx_kahn', spawn: 'default' });
    s.pendingTravel = null;
  }
  // Schloss knacken: mit Glück direkt zum Bahnhof
  s.arrest();
  s.random = () => 0;
  assert.equal(talk(s, 'wx_zelle', ['Schloss']).at(-1), 'pick_ok');
  assert.equal(s.pendingTravel.map, 'wx_bahnhof');
});

test('Streifen stehen nur in Wexmoor und laufen über freie Felder', () => {
  const WALK = new Set(['.', ',', '=', 'w', 'g', 'p', 'c', 's', 'P', 'L']);
  for (const m of Object.values(content.maps)) {
    for (const p of m.patrols ?? []) {
      assert.equal(m.city, 'wexmoor', `${m.id}/${p.id}`);
      assert.ok(m.police, `${m.id}: Karte mit Streifen braucht police: true`);
      const pts = [...p.route, p.route[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [[x0, y0], [x1, y1]] = [pts[i], pts[i + 1]];
        assert.ok(x0 === x1 || y0 === y1, `${m.id}/${p.id}: nur gerade Strecken`);
        for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) {
          for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) assert.ok(WALK.has(m.rows[y][x]), `${m.id}/${p.id}: ${x},${y} ist "${m.rows[y][x]}"`);
        }
      }
    }
  }
});
