// Verborgener Testmodus: Geschichte erledigt, Bosse leben, Zirkel immer offen, alle Städte erreichbar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { testCodeOk } from '../src/core/Testmodus.js';
import { lockedCities } from '../src/core/Travel.js';
import { Combat } from '../src/core/Combat.js';
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

test('Testmodus: alle Zutaten und Formeln im Inventar, keine Tragkraftgrenze, keine Unruhe', () => {
  const s = new GameState(content);
  const zutaten = Object.keys(content.items).filter((id) => content.items[id].kind === 'ingredient');
  const formeln = Object.keys(content.items).filter((id) => content.items[id].kind === 'formula');
  s.pathway = { id: 'laterne', seq: 9, digestion: 0 };
  s.setUnruhe(50);
  assert.ok(s.unruhe > 0);
  s.startTestmodus();
  assert.ok(zutaten.every((id) => s.itemCount(id) >= 10));
  assert.ok(formeln.every((id) => s.itemCount(id) >= 1));
  assert.equal(s.unruhe, 0);
  assert.equal(s.pathway.digestion, 100);
  s.pathway.digestion = 0;
  s.tick(5);
  assert.equal(s.pathway.digestion, 100);
  assert.ok(s.carryWeight() > s.carryCapacity());
  assert.equal(s.isOverloaded(), false);
  s.setUnruhe(90);
  s.tickPathway(5);
  assert.equal(s.unruhe, 0);
  s.inventory[zutaten[0]] = 0;
  s.tick(5);
  assert.equal(s.itemCount(zutaten[0]), 10);
  const t = new GameState(content);
  assert.ok(t.load(JSON.parse(JSON.stringify(s.serialize()))));
  assert.ok(formeln.every((id) => t.itemCount(id) >= 1));
});

test('Testmodus: Rituale vollzogen, Wächter mit 1 Leben', () => {
  const s = new GameState(content);
  s.pathway = { id: 'eisen', seq: 5, digestion: 100 };
  assert.equal(s.ritualDone('eisen', 4), false);
  const normal = new Combat(s, 'hg_schwellenwaechter_eisen');
  assert.ok(normal.enemy.hp > 1);
  s.startTestmodus();
  assert.equal(s.ritualDone('eisen', 4), true);
  assert.equal(s.drinkCheck('trank_eisen_4').ok, true);
  assert.equal(new Combat(s, 'hg_schwellenwaechter_eisen').enemy.hp, 1);
  assert.equal(new Combat(s, 'hg_grenzwaechter_eisen').enemy.hp, 1);
});

test('Testmodus: jeder Trank jedes Pfads lässt sich trinken (auch Kessel 5 ohne Sud), für beide Spieler', () => {
  const s = new GameState(content);
  s.testmodus = true;
  s.addP2();
  for (const pl of [1, 2]) {
    s.withPlayer(pl, () => {
      for (const pid of Object.keys(content.pathways)) {
        for (const seq of [8, 7, 6, 5, 4, 3, 2, 1]) {
          if (!content.items[`trank_${pid}_${seq}`]) continue;
          s.pathway = { id: pid, seq: seq + 1, digestion: 100 };
          s.addItem(`trank_${pid}_${seq}`);
          const c = s.drinkCheck(`trank_${pid}_${seq}`);
          assert.ok(c.ok, `Spieler ${pl}, ${pid} ${seq}: ${c.reason}`);
        }
      }
      s.pathway = { id: 'kessel', seq: 6, digestion: 100 };
      assert.equal(s.drink('trank_kessel_5', () => 0.99).ok, true);
      assert.equal(s.pathway.seq, 5);
    });
  }
});
