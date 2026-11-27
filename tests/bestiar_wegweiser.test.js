// Bestiarium als Wegweiser (Seb 2026-11-27): Begegnung → Name + Ort, Siege → Beschreibung, Beute, Schwächen; Pfad-Zutaten-Wegweiser
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { beastPlaces, beastDrops, beastEinmalig, beastSchwaechen, BEAST_STUFEN } from '../src/core/Bestiar.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);
// ein Gegner, der über eine Karte streift und Beute hat
const roamer = Object.values(content.maps).flatMap((m) => m.roamers ?? []).find((r) => !r.boss && content.loot[r.encounter] && !r.encounter.endsWith('_elite')).encounter;

test('Begegnung schaltet Name und Ort frei, Siege nach und nach den Rest', () => {
  const s = fresh();
  assert.equal(s.bestiarEintrag(roamer).seen, false);
  s.bestiarBegegnet(roamer);
  let st = s.bestiarStufe(roamer);
  assert.ok(st.seen && !st.info && !st.beute && !st.schwaechen);
  assert.ok(beastPlaces(content, roamer).length > 0, 'Fundort bekannt');
  for (let i = 0; i < BEAST_STUFEN.beute; i++) s.bestiarSieg(roamer);
  st = s.bestiarStufe(roamer);
  assert.ok(st.info && st.beute && !st.schwaechen);
  assert.equal(st.next.teil, 'schwaechen');
  for (let i = BEAST_STUFEN.beute; i < BEAST_STUFEN.schwaechen; i++) s.bestiarSieg(`${roamer}_elite`); // Elite zählt zum Grundgegner
  assert.ok(s.bestiarStufe(roamer).schwaechen);
  assert.equal(s.bestiarStufe(roamer).next, null);
});

test('Einmalige Gegner (Bosse) zeigen nach dem ersten Sieg alles', () => {
  const boss = Object.entries(content.encounters).find(([id, e]) => e.boss && !e.respawn && beastEinmalig(content, id))[0];
  const s = fresh();
  s.bestiarSieg(boss);
  const st = s.bestiarStufe(boss);
  assert.ok(st.info && st.beute && st.schwaechen);
});

test('Spielstand: Zählung bleibt erhalten, alte Stände zählen won_-Flags als einen Sieg', () => {
  const s = fresh();
  s.bestiarBegegnet(roamer);
  s.bestiarSieg(roamer);
  s.bestiarSieg(roamer);
  const t = fresh();
  t.load(JSON.parse(JSON.stringify(s.serialize())));
  assert.equal(t.bestiarEintrag(roamer).wins, 2);
  const alt = JSON.parse(JSON.stringify(s.serialize()));
  delete alt.bestiar;
  alt.flags.push(`won_${roamer}`);
  const u = fresh();
  u.load(alt);
  assert.equal(u.bestiarEintrag(roamer).wins, 1);
  u.bestiarSieg(roamer);
  assert.equal(u.bestiarEintrag(roamer).wins, 2);
});

test('Übungskämpfe stehen nicht im Bestiarium', () => {
  const s = fresh();
  s.bestiarBegegnet('sparring');
  s.bestiarSieg('sparring');
  assert.equal(s.bestiarEintrag('sparring').seen, false);
});

test('Drop-Verzeichnis verrät keine Formeln', () => {
  for (const item of beastDrops(content).keys()) assert.ok(!item.startsWith('formel_'), item);
});

test('Schwächen: okkulte Gegner nennen Licht und Weihgaben', () => {
  const occ = Object.keys(content.encounters).find((id) => content.encounters[id].occult);
  assert.ok(beastSchwaechen(content, occ).some((t) => t.startsWith('Okkult')));
});

test('Wegweiser nennt Gegner, die eine fehlende Pfad-Zutat fallen lassen', () => {
  const s = fresh();
  const pid = Object.keys(content.pathways).find((p) => {
    s.pathway = { ...s.pathway, id: p, seq: 8 };
    return s.bestiarWegweiser().length > 0;
  });
  assert.ok(pid, 'mindestens ein Pfad hat einen Gegner-Wegweiser');
  const w = s.bestiarWegweiser()[0];
  assert.ok(w.sources.length && w.need > w.have);
  for (const src of w.sources) assert.ok(beastDrops(content).get(w.item).some((d) => d.id === src.id));
  // unerforschte Quelle: nur Stadt bzw. Name; nach genug Siegen „known“
  const src = w.sources[0];
  assert.equal(src.known, false);
  for (let i = 0; i < src.needWins; i++) s.bestiarSieg(src.id);
  assert.ok(s.bestiarWegweiser().find((x) => x.item === w.item).sources.find((x) => x.id === src.id).known);
});
