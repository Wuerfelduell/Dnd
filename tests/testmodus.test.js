// Verborgener Testmodus: Geschichte erledigt, Bosse leben, Zirkel immer offen, alle Städte erreichbar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { testCodeOk } from '../src/core/Testmodus.js';
import { lockedCities } from '../src/core/Travel.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Falsches Kennwort wird abgelehnt', async () => {
  assert.equal(await testCodeOk(''), false);
  assert.equal(await testCodeOk('test'), false);
});

test('Testmodus: Aufträge erledigt, keine Siege, Bosse sichtbar, Zirkel offen, nichts gesperrt', () => {
  const s = new GameState(content);
  s.flags.add('k2_arrived');
  assert.ok(lockedCities(s).length);
  s.startTestmodus();
  assert.ok(Object.keys(content.quests).every((q) => s.quests[q] === 'done'));
  assert.ok(![...s.flags].some((f) => f.startsWith('won_')));
  assert.deepEqual(lockedCities(s), []);
  for (const id of Object.keys(content.gatherings.circles)) {
    assert.ok(s.gatheringOpen(id) && s.isMember(id) && !s.sessionHeld(id), id);
  }
  for (const m of Object.values(content.maps)) {
    for (const o of [...(m.interactables ?? []), ...(m.roamers ?? [])]) {
      if (o.encounter && content.encounters[o.encounter]?.boss) assert.ok(s.sichtbar(o), `${m.id}:${o.encounter}`);
    }
  }
  const data = s.serialize();
  const t = new GameState(content);
  assert.ok(t.load(data) && t.testmodus);
});

test('Ohne Testmodus bleibt alles wie es war', () => {
  const s = new GameState(content);
  assert.equal(s.testmodus, false);
  assert.equal(s.serialize().testmodus, undefined);
});
