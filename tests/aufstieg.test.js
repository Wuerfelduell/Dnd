// Kapitel 4: Der Aufstieg (Seb 2026-11-12): Zug nach oben ab Seq 4, Himmelsstadt ohne Chance, Sturz nach Calderwick
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { travelDestinations, lockedCities } from '../src/core/Travel.js';
import { HIMMEL, STURZ_ZIEL } from '../src/data/aufstieg.js';
import { loadContent, use, fight, EXPERT } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);
const visible = (s, map, id) => s.meets(content.maps[map].interactables.find((i) => i.id === id).visible_if);

test('Aufstieg: Starling erst ab Sequenz 4 am Endbahnhof, dann der Zug nach oben', () => {
  const s = fresh();
  s.flags.add('k3_arrived');
  s.pathway = { id: 'eisen', seq: 5, digestion: 0 };
  assert.equal(visible(s, 'ds_endbahnhof', 'auf_starling_bahnsteig'), false);
  s.pathway.seq = 4;
  assert.ok(visible(s, 'ds_endbahnhof', 'auf_starling_bahnsteig'));
  assert.equal(visible(s, 'ds_endbahnhof', 'auf_zug_nach_oben'), false);
  s.flags.add('auf_starling_gesehen');
  assert.ok(visible(s, 'ds_endbahnhof', 'auf_zug_nach_oben'));
  use(s, 'ds_endbahnhof', 'auf_zug_nach_oben');
  assert.deepEqual(s.pendingTravel, { map: HIMMEL, spawn: 'default' });
  assert.ok(content.quests.k3_rache.steps.some((st) => st.done.requires_flags?.includes('auf_verbrannt')));
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
