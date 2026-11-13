// Kapitel 4: Der Aufstieg (Seb 2026-11-12): Zug nach oben ab Seq 4, Himmelsstadt ohne Chance, Sturz nach Calderwick
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { travelDestinations, lockedCities } from '../src/core/Travel.js';
import { HIMMEL, STURZ_ZIEL, SCHAFFNER, SCHAFFNER_FLAG } from '../src/data/aufstieg.js';
import { Combat } from '../src/core/Combat.js';
import { loadContent, use, fight, EXPERT } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);
const visible = (s, map, id) => s.meets(content.maps[map].interactables.find((i) => i.id === id).visible_if);

test('Aufstieg: Starling am Endbahnhof ohne Sequenz-Abfrage, einsteigen erst nach dem Sieg über den Schaffner', () => {
  const s = fresh();
  s.flags.add('k3_arrived');
  s.pathway = { id: 'eisen', seq: 6, digestion: 0 };
  assert.ok(visible(s, 'ds_endbahnhof', 'auf_starling_bahnsteig'));
  s.flags.add('auf_starling_gesehen'); // done_flag der Lesestelle
  assert.ok(visible(s, 'ds_endbahnhof', 'auf_schaffner_tuer'));
  assert.equal(visible(s, 'ds_endbahnhof', 'auf_zug_nach_oben'), false);
  use(s, 'ds_endbahnhof', 'auf_schaffner_tuer');
  assert.equal(s.pendingCombat, SCHAFFNER);
  s.flags.add(SCHAFFNER_FLAG(1));
  assert.equal(visible(s, 'ds_endbahnhof', 'auf_schaffner_tuer'), false);
  assert.ok(visible(s, 'ds_endbahnhof', 'auf_zug_nach_oben'));
  use(s, 'ds_endbahnhof', 'auf_zug_nach_oben');
  assert.deepEqual(s.pendingTravel, { map: HIMMEL, spawn: 'default' });
  assert.ok(content.quests.k3_rache.steps.some((st) => st.done.requires_flags?.includes('auf_verbrannt')));
});

test('Schaffner: Seq 5 verliert, Seq 4 gewinnt (tools/sim/zugwaechter.mjs für alle Pfade)', () => {
  const held = (seq) => { const s = fresh(); s.addItem('dsz_schienennagel'); s.equip('dsz_schienennagel'); s.addItem('verband', 4); s.addItem('tonikum', 4); s.pathway = { id: 'eisen', seq, digestion: 100 }; s.updateMaxHp(); s.hp = s.maxHp; return s; };
  const s5 = held(5);
  const a = fight(s5, SCHAFFNER, { defend: EXPERT, chain: true, skill: 'double', healBelow: s5.maxHp * 0.4 });
  assert.equal(a.combat.outcome, 'lost');
  assert.ok(!s5.flags.has(SCHAFFNER_FLAG(1)));
  const s4 = held(4);
  const b = fight(s4, SCHAFFNER, { defend: EXPERT, chain: true, skill: 'double', healBelow: s4.maxHp * 0.4 });
  assert.equal(b.combat.outcome, 'won');
  assert.ok(s4.flags.has(SCHAFFNER_FLAG(1)));
});

test('Schaffner im Koop: gemeinsamer Kampf, mitfahren darf nur, wer am Ende noch steht', () => {
  const pair = () => {
    const s = fresh();
    s.flags.add('k3_arrived'); s.flags.add('auf_starling_gesehen');
    s.pathway = { id: 'eisen', seq: 4, digestion: 0 }; s.updateMaxHp(); s.hp = s.maxHp;
    s.addP2();
    s.withPlayer(2, () => { s.pathway = { id: 'laterne', seq: 4, digestion: 0 }; s.updateMaxHp(); s.hp = s.maxHp; });
    return s;
  };
  const s = pair();
  const c = new Combat(s, SCHAFFNER);
  assert.ok(c.duo, 'zu zweit');
  assert.equal(c.duoHpMult, 2.5, 'fester Koop-Aufschlag, ein schwacher Partner macht ihn nicht leichter');
  c.outcome = 'won'; c.finish();
  assert.ok(s.flags.has(SCHAFFNER_FLAG(1)) && s.flags.has(SCHAFFNER_FLAG(2)));
  assert.ok(visible(s, 'ds_endbahnhof', 'auf_zug_nach_oben'));
  const t = pair();
  const d = new Combat(t, SCHAFFNER);
  d.fighters[2].down = true; d.outcome = 'won'; d.finish();
  assert.ok(t.flags.has(SCHAFFNER_FLAG(1)) && !t.flags.has(SCHAFFNER_FLAG(2)), 'wer am Boden liegt, ist zu leicht');
  assert.equal(visible(t, 'ds_endbahnhof', 'auf_zug_nach_oben'), false);
  assert.ok(visible(t, 'ds_endbahnhof', 'auf_schaffner_tuer'));
});

test('Alte Stände zu früh in Calderwick: Lastenzug nach Dunscar, zurück nur am Schaffner vorbei', () => {
  const s = fresh();
  s.applyEffects({ sets_flags: ['k3_arrived', 'auf_starling_gesehen', 'k4_arrived', 'auf_verbrannt'] });
  s.pathway = { id: 'eisen', seq: 4, digestion: 0 };
  assert.equal(visible(s, 'cw_gleisfuss', 'auf_cw_lastenzug'), false, 'Seq 4 braucht keinen Rückweg');
  s.addP2();
  s.withPlayer(2, () => { s.pathway = { id: 'faden', seq: 5, digestion: 0 }; });
  assert.ok(visible(s, 'cw_gleisfuss', 'auf_cw_lastenzug'), 'Spieler 2 ist noch Seq 5');
  use(s, 'cw_gleisfuss', 'auf_cw_lastenzug');
  assert.deepEqual(s.pendingTravel, { map: 'ds_endbahnhof', spawn: 'default' });
  assert.ok(!lockedCities(s).includes('dunscar') && lockedCities(s).includes('calderwick'));
  assert.equal(visible(s, 'ds_endbahnhof', 'auf_zug_nach_oben'), false);
  assert.equal(visible(s, 'ds_endbahnhof', 'auf_zug_zurueck'), false);
  s.flags.add(SCHAFFNER_FLAG(1)); s.flags.add(SCHAFFNER_FLAG(2));
  assert.ok(visible(s, 'ds_endbahnhof', 'auf_zug_zurueck'));
  use(s, 'ds_endbahnhof', 'auf_zug_zurueck');
  assert.deepEqual(s.pendingTravel, STURZ_ZIEL);
  assert.ok(!s.flags.has('auf_rueckweg') && lockedCities(s).includes('dunscar'));
});

test('Himmelsstadt: keine Monster, nur Halbgötter, Heilige, Engel und Starling; keiner fällt, jede Niederlage stürzt nach Calderwick', () => {
  const map = content.maps[HIMMEL];
  assert.ok(map.roamers.length >= 10);
  const [sx, sy] = map.spawns.default;
  for (const r of map.roamers) {
    assert.match(r.encounter, /^hs_(halbgott|heiliger|engel)_/);
    assert.ok(map.rows[r.tile[1]][r.tile[0]] !== 'I', `${r.id} in der Wand`);
    assert.ok(Math.abs(r.tile[0] - sx) + Math.abs(r.tile[1] - sy) >= 10, `${r.id} zu nah`);
  }
  for (const id of ['hs_halbgott_laterne', 'hs_heiliger_eisen', 'hs_engel_1', 'hs_starling']) {
    const s = fresh();
    s.pathway = { id: 'eisen', seq: 2, digestion: 0 };
    s.updateMaxHp();
    s.maxHp = s.hp = 999999; // selbst unsterblich verliert man nicht gegen sie, man gewinnt nur nie
    const { combat } = fight(s, id, { defend: EXPERT, maxRounds: 200 });
    assert.notEqual(combat.outcome, 'won', id);
    assert.ok(combat.enemy.hp >= combat.enemy.maxHp * 0.5, id);
    const t = fresh();
    t.pathway = { id: 'eisen', seq: 3, digestion: 0 };
    t.updateMaxHp(); t.hp = t.maxHp;
    const lost = fight(t, id, { defend: EXPERT });
    assert.equal(lost.combat.outcome, 'lost', `${id}: man wird verbrannt`);
    assert.deepEqual(lost.result.travel, STURZ_ZIEL);
    assert.ok(t.flags.has('auf_verbrannt') && t.flags.has('k4_arrived') && t.quests.k4_aufstieg === 'active');
  }
});

test('Der Thron verbrennt immer; danach Calderwick, kein Zurück nach Dunscar oder nach oben', () => {
  const s = fresh();
  s.flags.add('k3_arrived');
  s.startQuest('k3_rache');
  use(s, HIMMEL, 'hs_thron');
  assert.deepEqual(s.pendingTravel, STURZ_ZIEL);
  assert.equal(s.quests.k3_rache, 'done');
  assert.ok(s.flags.has('kapitel3_done'));
  assert.ok(lockedCities(s).includes('dunscar') && lockedCities(s).includes('himmel'));
  s.map = STURZ_ZIEL.map;
  assert.ok(travelDestinations(s, s.map).every((t) => content.maps[t.map].city === 'calderwick'));
  assert.ok(visible(s, 'cw_gleisfuss', 'auf_cw_aufschlag'));
});

test('Calderwick: zehn verdorbene Pfadgebiete mit Gildensitz, je zwei benannte Beyonder, Monster in Halbgott-Stärke, keine Akte mehr', async () => {
  const { CW_GEBIETE } = await import('../src/data/aufstieg.js');
  assert.equal(Object.keys(CW_GEBIETE).length, 10);
  const names = new Set();
  for (const [pid, cw] of Object.entries(CW_GEBIETE)) {
    const m = content.maps[`o3_${pid}`];
    assert.equal(m.city, 'calderwick');
    assert.ok(m.danger >= 7, `${pid}: Gefahr (keine Angst vor Seq-4-Spielern)`);
    assert.ok(m.roamers.length >= 18, `${pid}: ${m.roamers.length} Monster`);
    for (const r of [...m.roamers, ...m.interactables]) assert.notEqual(m.rows[r.tile[1]][r.tile[0]], 'I', `${pid}: ${r.id}`);
    assert.ok(content.encounters[`o3_${pid}_tiefe`].name.startsWith(cw.oberhaupt));
    assert.ok(content.encounters[`o3_${pid}_vize`].name.startsWith(cw.vize));
    assert.ok(m.interactables.some((i) => i.encounter === `o3_${pid}_vize`));
    for (const n of [cw.oberhaupt, cw.vize]) { assert.ok(!names.has(n), n); names.add(n); }
    assert.ok(content.travelRules.cities.calderwick.pins[`o3_${pid}`]);
    // Alle Viertel gleich stark, egal welcher Pfad (Seb 2026-11-13: Stillviertel hatte nur 800 Leben)
    for (const id of Object.keys(content.encounters).filter((x) => x.startsWith(`o3_${pid}_g`))) assert.ok(content.encounters[id].hp >= 1700, id);
  }
  for (const m of Object.values(content.maps).filter((x) => x.city === 'calderwick')) assert.ok(!m.interactables?.some((i) => i.id.startsWith('cwa_')), m.id);
  // Nach dem Sturz sind alle Viertel offen
  const s = fresh();
  s.applyEffects({ sets_flags: ['k4_arrived', ...['cwa_ankunft_sicher', 'cwa_werkstatt', 'cwa_akt1_done', 'cwa_akt2_done', 'cwa_akt3_done', 'cwa_akt4_done']] });
  s.map = 'cw_gleisfuss';
  const ziele = travelDestinations(s, s.map).map((t) => t.map);
  for (const id of ['cw_kronenarchiv', 'cw_witwenterrasse', 'o3_eisen', 'o3_laterne']) assert.ok(ziele.includes(id), id);
  // Alte Stände in Calderwick: Akte weg, neues Kapitelziel
  const alt = fresh();
  alt.flags.add('k4_arrived');
  alt.quests.cwa_akt1 = 'active';
  alt.calderwickOffen();
  assert.equal(alt.quests.cwa_akt1, undefined);
  assert.equal(alt.quests.k4_aufstieg, 'active');
  assert.ok(alt.flags.has('cwa_akt4_done'));
});
