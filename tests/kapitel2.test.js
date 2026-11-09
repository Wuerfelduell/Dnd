// Kapitel 2 „Die Moorstadt“: Ankunft in Wexmoor, Zunder aus der Rußgesellschaft, der Unterschlupf im Torfkahn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { travelDestinations, travelFast, cityOf } from '../src/core/Travel.js';
import { loadContent, talk, use, fight, EXPERT, SKILLED } from './helpers.js';

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
  assert.deepEqual(s.questSteps('k2_akt1').map((x) => x.done), [true, true, true, true, false, false, false, false]);
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
  // Ohne die Nachtzug-Liste noch kein Abschluss
  assert.throws(() => talk(s, 'zunder', ['alle Viertel']));
  talk(s, 'druce', ['Nachtzug']);
  use(s, 'wx_glocke', 'gaestebuch');
  assert.equal(s.combine('wx_fremde_zug', 'wx_expected').result, 'new');
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
  talk(s, 'druce', ['Nachtzug']);
  use(s, 'wx_glocke', 'gaestebuch');
  s.combine('wx_fremde_zug', 'wx_expected');
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
  // Brandts Rechnung: Die Stadt sinkt nicht mehr
  assert.throws(() => talk(s, 'zunder', ['Mr. Lucent']));
  talk(s, 'wyle', ['Brandt']);
  use(s, 'wx_bojenhafen', 'pegel');
  assert.equal(s.combine('wx_sinking', 'wx_lights').result, 'new');
  talk(s, 'zunder', ['Mr. Lucent']);
  assert.equal(s.quests.k2_akt2, 'done');
  assert.equal(s.quests.k2_akt3, 'active');
  return s;
});

function afterAct3() {
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
  // Price aus Kettlegate: Brief von L., gegen Geld zurück in den Zug
  talk(s, 'price_wexmoor', ['Wer hat']);
  assert.ok(s.hasClue('wx_price_brief'));
  s.money += 40;
  talk(s, 'price_wexmoor', ['Vierzig']);
  assert.ok(s.flags.has('k2_price_done'));
  talk(s, 'lichtmann', ['Wofür', 'Zeuge']);
  assert.equal(s.factStatus('wx_collector'), 'suspected');
  assert.ok(s.flags.has('k2_starling_witness'));
  assert.equal(s.quests.k2_akt3, 'done');
  assert.equal(s.quests.k2_akt4, 'active');
  return s;
}

test('Akt III: Lucents Haus, Spur ins Vergessmoor, Die Namenlose, Starling als Zeuge', () => { afterAct3(); });

/** Akt IV bis zum Abschluss bei Zunder. ally: Hale und Marlowe auf deiner Seite. */
function afterAct4({ ally = true } = {}) {
  const s = afterAct3();
  ['wx_briefe_L', 'wx_wyle_L'].forEach((c) => s.addClue(c)); // aus Akt II (Akademie)
  talk(s, 'zunder', ['nur gezählt']);
  assert.ok(s.flags.has('k2_akt4_talk'));
  // Hale verrät die Befehle, in derselben Nacht wird Zunder geholt
  talk(s, 'hale', ['Befehle', 'Zunder']);
  assert.ok(s.hasClue('wx_hale_befehl'));
  assert.ok(!s.meets(content.maps.wx_kahn.npcs.find((n) => n.id === 'zunder').visible_if), 'Zunder ist weg');
  use(s, 'wx_kahn', 'leer');
  // Aus der Zelle holt dich jetzt niemand
  s.arrest();
  assert.equal(talk(s, 'wx_zelle', ['warten']).at(-1), 'bail_none');
  s.flags.delete('k2_in_cell');
  // Einbruch ins Wachhaus
  assert.equal(use(s, 'wx_oberstadt', 'wachhaus'), 'ok');
  assert.equal(talk(s, 'zunder_zelle', ['Schlüssel']).at(-1), 'wie');
  use(s, 'wx_wachhaus', 'befehl');
  use(s, 'wx_wachhaus', 'haushalt');
  use(s, 'wx_wachhaus', 'schluessel');
  s.flags.add('k2_wache_schluessel'); // done_flag setzt sonst die Welt
  talk(s, 'zunder_zelle', ['den Schlüssel']);
  assert.ok(s.flags.has('k2_zunder_free'));
  assert.equal(s.wanted, 3, 'Ausbruch: volle Fahndung');
  assert.deepEqual(s.pendingTravel, { map: 'wx_kahn', spawn: 'default' });
  assert.ok(s.meets(content.maps.wx_kahn.npcs.find((n) => n.id === 'zunder').visible_if), 'Zunder wieder im Kahn');
  // L. ist Brandt
  assert.equal(s.factStatus('wx_order_lichtamt'), 'likely');
  assert.equal(s.combine('wx_order_lichtamt', 'wx_letters_L').result, 'new');
  // Pfahldorf: Sedge und die Chronik am Schrein
  talk(s, 'sedge', ['Seit wann']);
  use(s, 'wx_pfahldorf', 'chronik');
  assert.equal(s.factStatus('wx_tower_strangers'), 'likely');
  assert.equal(s.factStatus('wx_collector'), 'likely', 'Starling und das Hauptbuch');
  assert.equal(s.combine('wx_tower_strangers', 'wx_collector').result, 'new');
  if (ally) {
    talk(s, 'hale', ['Lesen Sie']);
    talk(s, 'marlowe_wexmoor', ['Lichtmeisterin']);
    assert.ok(s.flags.has('k2_hale_ally') && s.flags.has('k2_marlowe_here'));
  }
  // Was mit den verhafteten Fremden geschah
  use(s, 'wx_wachhaus', 'register');
  talk(s, 'hale', ['Fremden']);
  assert.equal(s.combine('wx_ausgeliefert', 'wx_fremde_zug').result, 'new');
  talk(s, 'zunder', ['Es ist Brandt']);
  assert.equal(s.quests.k2_akt4, 'done');
  assert.equal(s.quests.k2_akt5, 'active');
  return s;
}

test('Akt IV: Hale, Zunder im Wachhaus, Brandt ist L., der Turm frisst Fremde', () => { afterAct4(); });

test('Vey taucht nur auf, wenn sie in Fall 5 geflohen ist', () => {
  const vey = content.maps.wx_pfahldorf.npcs.find((n) => n.id === 'miriam');
  const s = afterAct3();
  assert.ok(!s.meets(vey.visible_if));
  s.flags.add('vey_fled');
  assert.ok(s.meets(vey.visible_if));
  talk(s, 'vey_wexmoor', ['Warum']);
  assert.ok(s.hasClue('wx_vey_turm'));
});

/** Akt V: zum Leuchtturm, das Leuchtfeuer besiegen (Ausrüstung wie für Bosse der Stufe 4). */
function atTheTop(opts) {
  const s = afterAct4(opts);
  assert.ok(travelDestinations(s, 'wx_kahn').some((t) => t.map === 'wx_leuchtturm'));
  use(s, 'wx_leuchtturm', 'ankunft');
  s.flags.add('k2_am_turm');
  s.addItem('ossuarklinge');
  s.equip('ossuarklinge');
  s.addItem('tonikum', 4);
  s.addItem('verband', 2);
  s.heal(s.maxHp);
  const { result } = fight(s, 'leuchtfeuer', { defend: EXPERT, skill: 'double', healBelow: 18 });
  assert.equal(result.outcome, 'won');
  return s;
}

test('Akt V: mit Hale, Marlowe und Starling als Zeugen kommt Brandt vor Gericht', () => {
  const s = atTheTop();
  const path = talk(s, 'brandt', ['Warum ich', 'Wofür', 'verhaftet']);
  assert.equal(path.at(-1), 'rein');
  assert.equal(s.endings.kapitel2, 'k2_rein');
  assert.equal(s.quests.k2_akt5, 'done');
  assert.ok(s.flags.has('kapitel2_done'));
  assert.match(content.endings.k2_rein.chapter.title, /Ende von Kapitel 2/);
});

test('Akt V: ohne Verbündete bleiben Löschen, Übernehmen oder Flucht mit Kit', () => {
  for (const [pick, end] of [['lösche', 'k2_moor'], ['nicht Sie', 'k2_lichtmeister'], ['verschwinde', 'k2_meer']]) {
    const s = atTheTop({ ally: false });
    assert.throws(() => talk(s, 'brandt', ['Wofür', 'verhaftet']), /keine verfügbare Option/);
    talk(s, 'brandt', ['Wofür', pick]);
    assert.equal(s.endings.kapitel2, end);
  }
  // Jedes Ende schließt Kapitel 2 mit einer Kapiteltafel
  for (const id of ['k2_rein', 'k2_moor', 'k2_lichtmeister', 'k2_meer']) {
    assert.equal(content.endings[id].case, 'kapitel2');
    assert.ok(content.endings[id].chapter.text);
  }
});

test('Price lässt sich auch überzeugen oder verprügeln', () => {
  const s = afterAct1();
  s.startQuest('k2_akt3');
  ['wx_akte_starling', 'wx_briefe_L'].forEach((c) => s.addClue(c));
  s.combine('wx_starling_student', 'wx_letters_L');
  talk(s, 'price_wexmoor', ['Wer hat']);
  talk(s, 'price_wexmoor', ['benutzt']);
  assert.ok(s.flags.has('k2_price_ally'));
  const t = afterAct1();
  t.addItem('egelhaken');
  t.equip('egelhaken');
  t.addItem('tonikum', 3);
  t.addItem('verband', 2);
  talk(t, 'price_wexmoor', ['holen']);
  const { result } = fight(t, 'price_wx_fight', { defend: SKILLED, healBelow: 18 });
  assert.equal(result.outcome, 'won');
  assert.ok(t.flags.has('k2_price_done'));
  assert.ok(t.wanted >= 1, 'Prügelei macht dich bekannter');
});

test('Nebenauftrag Zimmer 3: Elsbeth Rowe aus der Torfwand holen', () => {
  const s = afterAct1();
  talk(s, 'hesper', ['besorgt']);
  assert.equal(s.quests.k2_s_zimmer3, 'active');
  use(s, 'wx_glocke', 'tagebuch');
  talk(s, 'sedge', ['Elsbeth']);
  assert.equal(s.combine('wx_rowe_moor', 'wx_fremde_zug').result, 'new');
  const els = content.maps.wx_torfstich.npcs.find((n) => n.id === 'elsbeth');
  assert.ok(s.meets(els.visible_if));
  talk(s, 'elsbeth', ['Elsbeth', 'Zug']);
  assert.ok(s.hasClue('wx_rowe_turm'));
  const money = s.money;
  talk(s, 'hesper', ['lebt']);
  assert.equal(s.quests.k2_s_zimmer3, 'done');
  assert.ok(s.money >= money + 30);
});

test('Nebenaufträge: Stille Bojen, Kits Ladung, Zunders Mutter, Paket aus Kettlegate', () => {
  const s = afterAct1();
  talk(s, 'brack', ['helfen']);
  s.flags.add('won_glockenmutter');
  talk(s, 'brack', ['schweigt']);
  assert.equal(s.quests.k2_s_bojen, 'done');
  talk(s, 'kit_wexmoor', ['Hilfe']);
  s.addItem('salzkristall', 3);
  talk(s, 'kit_wexmoor', ['Salzkristalle']);
  assert.equal(s.quests.k2_s_kit, 'done');
  assert.ok(s.flags.has('k2_kit_boot'));
  s.flags.add('k2_akt4_done');
  talk(s, 'zunder', ['Mutter']);
  assert.equal(s.quests.k2_s_fenn, 'active');
  s.flags.add('k2_fenn_found');
  talk(s, 'zunder', ['Namen deiner Mutter']);
  assert.equal(s.quests.k2_s_fenn, 'done');
  s.flags.add('k2_akt2_done');
  const t = s.itemCount('tonikum');
  use(s, 'wx_kahn', 'paket');
  assert.equal(s.itemCount('tonikum'), t + 2);
});

test('Versunkene Altstadt: unter Pfahldorf, ab Akt III, eigene Monster und ein Boss', () => {
  const zone = Object.entries(content.encounters).filter(([, e]) => e.zone === 'wx_altstadt' && !e.elite).map(([id]) => id).sort();
  assert.deepEqual(zone, ['buergermeister', 'kellerkrebs', 'namensmade', 'pfahlbohrer', 'ratsherr']);
  const s = afterAct1();
  s.flags.add('k2_known_pfahl');
  assert.ok(!travelDestinations(s, 'wx_pfahldorf').some((t) => t.map === 'wx_altstadt'), 'erst nach Akt II');
  s.flags.add('k2_akt2_done');
  assert.ok(travelDestinations(s, 'wx_pfahldorf').some((t) => t.map === 'wx_altstadt'));
  for (const i of ['moortee', 'salzbrot']) assert.equal(content.items[i].kind, 'consumable', i);
  for (const a of ['amtskette', 'veys_stimmgabel', 'schreintaefelchen']) assert.equal(content.items[a].kind, 'artifact', a);
});

test('Nebengeschichten: Das siebte Tor, Die Namen der Versunkenen, Zunders Tee', () => {
  const s = afterAct3();
  talk(s, 'druce', ['sechs Tore']);
  assert.equal(s.quests.k2_s_druce, 'active');
  use(s, 'wx_altstadt', 'tor');
  s.flags.add('k2_tor_zu');
  talk(s, 'druce', ['siebte Tor ist zu']);
  assert.equal(s.quests.k2_s_druce, 'done');
  assert.equal(s.itemCount('salzbrot'), 3);
  talk(s, 'sedge', ['unter Pfahldorf']);
  s.addItem('ratssiegel', 3);
  talk(s, 'sedge', ['drei Ratssiegel']);
  assert.equal(s.quests.k2_s_sedge, 'done');
  assert.equal(s.itemCount('ratssiegel'), 0);
  assert.equal(s.itemCount('schreintaefelchen'), 1);
  const tee = s.itemCount('moortee');
  talk(s, 'zunder', ['Tee']);
  talk(s, 'zunder', ['Tee']);
  assert.equal(s.itemCount('moortee'), tee + 6, 'einmal nach Akt I, einmal nach Akt III');
  assert.throws(() => talk(s, 'zunder', ['Tee']), /keine verfügbare Option/);
});

test('Miras Lied: Vey bekommt ihre Stimme zurück, wenn sie in Wexmoor ist', () => {
  const s = afterAct3();
  s.flags.add('vey_fled');
  assert.ok(s.meets(content.maps.wx_pfahldorf.npcs.find((n) => n.id === 'miriam').visible_if));
  talk(s, 'vey_wexmoor', ['Warum']);
  talk(s, 'vey_wexmoor', ['Singen']);
  use(s, 'wx_altstadt', 'kapelle');
  s.flags.add('k2_stimmgabel');
  talk(s, 'vey_wexmoor', ['Stimmgabel']);
  assert.equal(s.quests.k2_s_vey, 'done');
  assert.equal(s.itemCount('veys_stimmgabel'), 1);
});

test('Zwölf Jahre: Hale liest die Namen vor', () => {
  const s = afterAct4();
  talk(s, 'hale', ['bleibt']);
  use(s, 'wx_leuchtturm', 'liste');
  s.flags.add('k2_liste_found');
  talk(s, 'hale', ['Ablieferliste']);
  assert.equal(s.quests.k2_s_hale, 'done');
});

test('Das Ratsbuch: Brandt kommt auch ohne Starling als Zeugen vor Gericht', () => {
  const s = atTheTop();
  s.flags.delete('k2_starling_witness');
  assert.throws(() => talk(s, 'brandt', ['Wofür', 'verhaftet']), /keine verfügbare Option/);
  talk(s, 'marlowe_wexmoor', ['Haftbefehl']);
  assert.throws(() => use(s, 'wx_altstadt', 'ratsbuch'), /unsichtbar/, 'erst nach dem Bürgermeister');
  s.flags.add('won_buergermeister');
  use(s, 'wx_altstadt', 'ratsbuch');
  s.flags.add('k2_ratsbuch_found');
  talk(s, 'marlowe_wexmoor', ['Ratsbuch']);
  assert.equal(s.quests.k2_s_marlowe, 'done');
  assert.equal(talk(s, 'brandt', ['Wofür', 'Ratsbuch']).at(-1), 'rein');
  assert.equal(s.endings.kapitel2, 'k2_rein');
});
