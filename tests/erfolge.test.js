// Codex DL: Akte des Ermittlers (80 stille Erfolge).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { resetErfolgeProfile } from '../src/core/Erfolge.js';
import { loadContent } from './helpers.js';

const content = loadContent();
beforeEach(() => resetErfolgeProfile());

test('DL: 80 Erfolge mit Gruppe und Atlas-Index 0–79', () => {
  const defs = content.erfolge.list;
  assert.equal(defs.length, 80);
  assert.deepEqual(defs.map((d) => d.index), [...Array(80).keys()]);
  for (const d of defs) assert.ok(d.gruppe && d.name, d.id);
});

test('DL: erster Lauf trägt still nach, danach meldet sich ein neuer Erfolg genau einmal', () => {
  const s = new GameState(content);
  s.flags.add('case_01_closed');
  const seen = [];
  s.on('erfolg', (d) => seen.push(d.id));
  assert.deepEqual(s.checkErfolge().map((d) => d.id), ['erf_fall_1']);
  assert.deepEqual(seen, []);
  s.flags.add('case_02_closed');
  s.checkErfolge();
  s.checkErfolge();
  assert.deepEqual(seen, ['erf_fall_2']);
  assert.ok(s.erfolgFrei('erf_fall_2'));
  assert.match(s.erfolgMeldung(content.erfolge.list[1]), /Zweite Ablage/);
});

test('DL: Profil überlebt einen neuen Durchlauf; Zähler für Kämpfe, Zirkel, Sequenz', () => {
  const s = new GameState(content);
  s.checkErfolge();
  s.flags.add('treffen_waage'); s.flags.add('treffen_russ');
  for (let i = 0; i < 100; i++) s.erfolgKampf();
  s.pathway = { id: 'laterne', seq: 7, digestion: 0 };
  s.checkErfolge();
  for (const id of ['erf_zwei_zirkel', 'erf_hundert_kaempfe', 'erf_sequenz_8', 'erf_sequenz_7']) assert.ok(s.erfolgFrei(id), id);
  assert.ok(!s.erfolgFrei('erf_sequenz_6'));
  const t = new GameState(content);
  assert.ok(t.erfolgFrei('erf_hundert_kaempfe'));
  assert.equal(t.erfolgZaehler.kaempfe ?? 0, 0);
  // Zähler steht im Spielstand
  const u = new GameState(content);
  u.erfolgKampf();
  const v = new GameState(content);
  v.load(u.serialize(null));
  assert.equal(v.erfolgZaehler.kaempfe, 1);
});

test('DL: Systeme, die es noch nicht gibt, lösen nichts aus', () => {
  const s = new GameState(content);
  s.checkErfolge();
  for (const id of ['erf_kapitel_6', 'erf_tier', 'erf_haus', 'erf_nebelseiten', 'erf_briefe']) {
    const d = content.erfolge.list.find((x) => x.id === id);
    assert.ok(!s.erfolgErfuellt(d), id);
  }
});
