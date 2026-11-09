import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { COMPANIONS } from '../src/core/Bonds.js';
import { DS_FIGURES, DS_ENEMIES, DS_MAP_MARKERS_URL, SHEETS, PORTRAITS, BATTLE_SHEETS, ENCOUNTER_SHEETS, OVERWORLD_SHEETS, bestiaryUrl, mapMarkerOf, CHAPTER_CARDS } from '../src/world/assets.js';
import { loadContent, fight, EXPERT, SKILLED } from './helpers.js';

// Kapitel 3 „Der letzte Zug nach Dunscar“ (Codex AR Akte, AS Orte/Gegner, AV/AW/AX Grafik)
const content = loadContent();
const pub = (url) => new URL(`../public/${url.replace(/^\.?\//, '')}`, import.meta.url);
const sprite = (p) => new URL(`../public/sprites/${p}`, import.meta.url);
const DS_MAPS = Object.keys(content.maps).filter((id) => id.startsWith('ds_'));

test('Kapitel 3: 18 Dunscarer Karten, eigene Stadtkarte mit Pins und Markern', () => {
  assert.equal(DS_MAPS.length, 18);
  const city = content.travelRules.cities.dunscar;
  assert.ok(city, 'Stadt Dunscar');
  assert.ok(existsSync(sprite(city.map_image)) && existsSync(sprite(city.fog_image)));
  assert.ok(existsSync(pub(DS_MAP_MARKERS_URL)));
  for (const id of Object.keys(city.pins)) {
    assert.ok(content.maps[id], id);
    assert.ok(mapMarkerOf(id)[0].includes('ds_marker'), id);
  }
  for (const id of ['ds_endbahnhof', 'ds_schwellenring', 'ds_arbeiterbogen']) assert.ok(content.travel.some((t) => t.map === id), id);
  assert.ok(CHAPTER_CARDS.includes('kapitel3_karte'));
});

test('Kapitel 3: jedes Reiseziel aus Dialogen und Türen hat Karte und Ankunftspunkt', () => {
  const targets = [];
  (function walk(v) {
    if (!v || typeof v !== 'object') return;
    if (typeof v.map === 'string' && typeof v.spawn === 'string') targets.push(v);
    for (const x of Object.values(v)) walk(x);
  })({ d: content.dialogues, m: DS_MAPS.map((id) => content.maps[id]) });
  for (const t of targets.filter((x) => x.map.startsWith('ds_'))) {
    const m = content.maps[t.map];
    assert.ok(m, t.map);
    assert.ok(m.spawns[t.spawn], `${t.map}/${t.spawn}`);
  }
  assert.deepEqual(content.maps.ds_endbahnhof.spawns.zug, [6, 4]);
});

test('Kapitel 3: Figuren, Gegner und Bosse haben ihre Grafiken', () => {
  for (const id of DS_FIGURES) {
    assert.ok(existsSync(sprite(SHEETS[`ds_${id}`])), id);
    assert.ok(existsSync(sprite(`portraits/${PORTRAITS[id]}`)), id);
  }
  for (const id of Object.keys(DS_ENEMIES)) {
    assert.ok(content.encounters[id], id);
    assert.ok(existsSync(sprite(BATTLE_SHEETS[ENCOUNTER_SHEETS[id]][0])), id);
    assert.ok(existsSync(sprite(OVERWORLD_SHEETS[id][0])), id);
    assert.ok(existsSync(pub(bestiaryUrl(id))), id);
  }
});

test('Kapitel 3: Pfiff ist Begleiterin wie Zunder', () => {
  assert.ok(COMPANIONS.includes('k3_pfiff'));
  assert.ok(content.npcs.k3_pfiff);
});

const seq = (n) => {
  const s = new GameState(content);
  s.addItem('ossuarklinge');
  s.equip('ossuarklinge');
  s.pathway = { id: 'eisen', seq: n, digestion: 0 };
  s.updateMaxHp();
  s.addItem('tonikum', 4);
  s.addItem('verband', 2);
  s.heal(s.maxHp);
  return s;
};

test('Balance Kapitel 3: mit Sequenz 5 schaffen sehr Geübte jeden Gegner und jeden Bossabschnitt', () => {
  const ch3 = Object.entries(content.encounters).filter(([, e]) => e.chapter === 3);
  assert.ok(ch3.length >= 20);
  for (const [id, e] of ch3) {
    const tough = e.elite || e.boss;
    const { result, combat } = fight(seq(5), id, { defend: EXPERT, skill: tough ? 'double' : 'attack', healBelow: 18 });
    assert.equal(result.outcome, 'won', `${id}: verloren in Runde ${combat.round}`);
  }
});

test('Balance Kapitel 3: mit Sequenz 6 reicht es nicht für Vielrufer und Unterschicht', () => {
  for (const id of ['vielrufer', 'unterschicht']) {
    const { result } = fight(seq(6), id, { defend: SKILLED, skill: 'double', healBelow: 18 });
    assert.equal(result.outcome, 'lost', id);
  }
});
