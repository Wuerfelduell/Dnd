// Kapitel 2 „Die Moorstadt“: Ankunft in Wexmoor, Zunder aus der Rußgesellschaft, der Unterschlupf im Torfkahn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { travelDestinations, travelFast, cityOf } from '../src/core/Travel.js';
import { loadContent, talk, use, fight, EXPERT } from './helpers.js';

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
  assert.deepEqual(s.questSteps('k2_akt1').map((x) => x.done), [true, true, true, true, false, false, false]);
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

test('Akt I komplett: sechs Viertel, Lichter und Öl, Abschluss bei Zunder', () => {
  const s = afterChapter1();
  use(s, 'wx_bahnhof', 'ankunft');
  use(s, 'wx_bahnhof', 'steckbrief');
  talk(s, 'zunder_ankunft', ['verstecken', 'vorher', 'Bring mich']);
  talk(s, 'druce', ['Steckbriefe']);
  s.combine('wx_expected', 'wx_star_paper');
  use(s, 'wx_kahn', 'willkommen');
  s.flags.add('k2_hideout');
  for (const m of ['wx_salzmarkt', 'wx_bojenhafen', 'wx_oberstadt', 'wx_pfahldorf']) assert.ok(names(s, 'wx_torfstich').includes(m), m);
  // Ohne alle Viertel gibt es den Abschluss noch nicht
  assert.throws(() => talk(s, 'zunder', ['alle Viertel']));
  talk(s, 'hesper', ['Lichtamt']);
  talk(s, 'brack', ['Bojen']);
  talk(s, 'pedell', ['Starling']);
  talk(s, 'sedge', ['setze', 'Lichter']);
  talk(s, 'zunder', ['Leuchtturm']);
  use(s, 'wx_oberstadt', 'lichtamt_tafel');
  assert.equal(s.factStatus('wx_lights'), 'likely');
  assert.equal(s.factStatus('wx_no_oil'), 'likely');
  assert.equal(s.combine('wx_lights', 'wx_no_oil').result, 'new');
  talk(s, 'zunder', ['alle Viertel']);
  assert.equal(s.quests.k2_akt1, 'done');
  assert.equal(s.quests.k2_akt2, 'active');
});

test('Verkleidung: im passenden Viertel kleiner Kegel, anderswo auffälliger', () => {
  const s = afterChapter1();
  const plain = s.policeCone(0, 'wx_bojenhafen');
  s.money = 50;
  talk(s, 'brack', ['Jacke']);
  assert.equal(s.itemCount('fischerjacke'), 1);
  talk(s, 'kleiderhaken', ['Fischerjacke']);
  assert.equal(s.disguise(), 'fischerjacke');
  const fit = s.policeCone(0, 'wx_bojenhafen');
  const misfit = s.policeCone(0, 'wx_oberstadt');
  assert.ok(fit.range < plain.range && fit.catchSec > plain.catchSec);
  assert.ok(misfit.range > plain.range && misfit.catchSec < plain.catchSec);
  talk(s, 'kleiderhaken', ['eigenen Mantel']);
  assert.equal(s.disguise(), null);
});

/** Akt I abgeschlossen (über die echten Dialoge). */
function afterAct1() {
  const s = afterChapter1();
  use(s, 'wx_bahnhof', 'ankunft');
  use(s, 'wx_bahnhof', 'steckbrief');
  talk(s, 'zunder_ankunft', ['verstecken', 'vorher', 'Bring mich']);
  talk(s, 'druce', ['Steckbriefe']);
  s.combine('wx_expected', 'wx_star_paper');
  use(s, 'wx_kahn', 'willkommen');
  s.flags.add('k2_hideout');
  talk(s, 'hesper', ['Salzmarkt']);
  talk(s, 'brack', ['Bojen']);
  talk(s, 'pedell', ['Lichtamt']);
  talk(s, 'sedge', ['setze', 'Lichter']);
  talk(s, 'zunder', ['Leuchtturm']);
  use(s, 'wx_oberstadt', 'lichtamt_tafel');
  s.combine('wx_lights', 'wx_no_oil');
  talk(s, 'zunder', ['alle Viertel']);
  return s;
}

test('Akt II: Akademie nur mit Robe, Starlings Tod widerlegt, Mr. Lucent entlarvt', () => {
  const s = afterAct1();
  s.money = 100;
  assert.equal(use(s, 'wx_oberstadt', 'akademie'), 'locked');
  talk(s, 'pedell', ['Robe']);
  talk(s, 'kleiderhaken', ['Akademie-Robe']);
  assert.equal(use(s, 'wx_oberstadt', 'akademie'), 'ok');
  use(s, 'wx_akademie', 'drin');
  s.flags.add('k2_in_akademie');
  use(s, 'wx_akademie', 'archiv');
  use(s, 'wx_akademie', 'zimmer');
  talk(s, 'wyle', ['Kannten']);
  talk(s, 'wyle', ['Kontakt']);
  assert.equal(s.combine('wx_starling_student', 'wx_letters_L').result, 'new');
  // Die Zeitung und der Pedell sagen: tot. Zunder und Hesper widerlegen es.
  use(s, 'wx_salzmarkt', 'bote');
  talk(s, 'pedell', ['wirklich tot']);
  assert.equal(s.factStatus('wx_starling_dead'), 'likely');
  talk(s, 'zunder', ['Oberstadt']);
  talk(s, 'hesper', ['Linsen']);
  assert.equal(s.factStatus('wx_starling_dead'), 'refuted');
  assert.equal(s.combine('wx_lucent', 'wx_lights').result, 'new');
  talk(s, 'zunder', ['Mr. Lucent']);
  assert.equal(s.quests.k2_akt2, 'done');
  assert.equal(s.quests.k2_akt3, 'active');
  return s;
});

test('Akt III: Lucents Haus, Spur ins Vergessmoor, Die Namenlose, Starling als Zeuge', () => {
  const s = afterAct1();
  ['k2_in_akademie', 'k2_akt2_done'].forEach((f) => s.flags.add(f));
  s.quests.k2_akt2 = 'done';
  s.startQuest('k2_akt3');
  assert.ok(!travelDestinations(s, 'wx_torfstich').some((t) => t.map === 'wx_vergessmoor'), 'Moor erst mit Spur');
  use(s, 'wx_lucent', 'spiegel');
  use(s, 'wx_lucent', 'zettel');
  talk(s, 'kit_wexmoor', ['leuchtet']);
  talk(s, 'brack', ['abhanden']);
  assert.equal(s.combine('wx_halblicht', 'wx_moor_flight').result, 'new');
  assert.ok(travelDestinations(s, 'wx_torfstich').some((t) => t.map === 'wx_vergessmoor'));
  // Ausrüstung wie für Bosse der Gefahrenstufe 2 (siehe wilds.test.js)
  s.addItem('egelhaken');
  s.equip('egelhaken');
  s.addItem('tonikum', 3);
  s.addItem('verband', 2);
  const { result } = fight(s, 'namenlose', { defend: EXPERT, skill: 'double', healBelow: 18 });
  assert.equal(result.outcome, 'won');
  assert.ok(s.flags.has('won_namenlose'));
  talk(s, 'lichtmann', ['Wofür', 'Zeuge']);
  assert.equal(s.factStatus('wx_collector'), 'suspected');
  assert.ok(s.flags.has('k2_starling_witness'));
  assert.equal(s.quests.k2_akt3, 'done');
  assert.equal(s.quests.k2_akt4, 'active');
});
