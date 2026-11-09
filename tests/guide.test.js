// Journal-Wegweiser: Ziel des nächsten Auftragsschritts (`npm test`)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { questTarget, nextHop, districtOf } from '../src/core/Guide.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);

test('Jeder Auftrag hat für seinen ersten Schritt ein Ziel', () => {
  const s = fresh();
  for (const q of Object.keys(content.quests)) {
    s.quests[q] = 'active';
    const t = questTarget(s, q);
    assert.ok(t && (t.map || t.notebook), `Kein Ziel für ${q}`);
    if (t.map) {
      assert.ok(content.maps[t.map], `${q}: unbekannte Karte ${t.map}`);
      assert.ok(t.district, `${q}: ${t.map} ist über die Stadtkarte nicht erreichbar`);
    }
  }
});

test('Neues Spiel verfolgt den ersten Auftrag, neuer Hauptfall wird übernommen', () => {
  const s = fresh();
  assert.equal(s.tracked, content.start.quests[0]);
  assert.equal(questTarget(s, s.tracked).id, 'marlowe');
  s.track(null);
  s.startQuest('pickpocket');
  assert.equal(s.tracked, 'pickpocket');
  s.startQuest('case_01');
  assert.equal(s.tracked, 'case_01', 'Hauptfall verdrängt Nebenauftrag');
  s.finishQuest('case_01', 'done');
  assert.equal(s.tracked, null);
  const saved = fresh();
  saved.load({ ...s.serialize(), tracked: 'pickpocket' });
  assert.equal(saved.tracked, 'pickpocket');
});

test('Fall 1: Elias lebt → Halloway am Pfandhaus in Ashgrove Lane', () => {
  const s = fresh();
  s.startQuest('case_01');
  for (const f of ['briefed_01']) s.flags.add(f);
  s.addClue('frosted_lamp');
  s.conclusions.push('unnatural_cold', 'vey_sigil', 'elias_alive');
  const t = questTarget(s, 'case_01');
  assert.ok(t.map === 'ashgrove', JSON.stringify(t));
});

test('Wege: Untergeschosse laufen über ihren Bezirk', () => {
  assert.equal(districtOf(content, 'tavern'), 'ashgrove');
  assert.equal(districtOf(content, 'theater'), 'nordtor');
  assert.equal(nextHop(content, 'revier', 'theater').via, 'exit');
  assert.equal(nextHop(content, 'nordtor', 'theater').via, 'theater_door');
  assert.equal(nextHop(content, 'tavern', 'revier').via, 'out');
});

test('Fall 3, falsches Ende (Holt): Kanalhafen wird trotzdem freigeschaltet, alte Stände werden repariert', () => {
  const s = fresh();
  s.setEnding('c3_holt');
  assert.ok(s.flags.has('travel_docks'), 'Kanalhafen nach c3_holt erreichbar');
  // Alter Spielstand: Ende erreicht, aber ohne Freischaltung gespeichert
  const data = s.serialize();
  data.flags = data.flags.filter((f) => f !== 'travel_docks');
  const old = fresh();
  old.load(data);
  assert.ok(old.flags.has('travel_docks'), 'Freischaltung wird beim Laden nachgetragen');
});

test('Ziel in gesperrtem Viertel: Wegweiser sagt, dass es gesperrt ist und wer es freischaltet', () => {
  const s = fresh();
  s.quests.drowned = 'active';
  const t = questTarget(s, 'drowned');
  assert.equal(t.district, 'docks');
  assert.equal(t.locked?.name, 'Kanalhafen');
  assert.match(t.locked.how, /Marlowe/);
  s.flags.add('travel_docks');
  assert.equal(questTarget(s, 'drowned').locked, undefined);
});
