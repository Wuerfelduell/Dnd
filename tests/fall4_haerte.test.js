// Ab Fall 4 werden die Gegner deutlich stärker (Seb, 2026-11-10): ohne Pfad ist am Nordtor Schluss,
// Fall 5/6 verlangen Sequenz 8, Fall 7/8 den Durchbruch auf 7. Wer nur jedem zweiten Schlag ausweicht, verliert.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent, fight, EXPERT, SKILLED } from './helpers.js';

const content = loadContent();

function hero(seq = null, id = 'eisen') {
  const s = new GameState(content);
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem('verband', 3);
  if (seq) {
    s.pathway = { id, seq, digestion: 0 };
    s.updateMaxHp();
    s.hp = s.maxHp;
  }
  return s;
}

const SKILL = (seq) => (seq ? (seq <= 7 ? 'klingenwirbel' : 'wuchtschlag') : 'attack');
const HALF = (i) => (i % 2 ? 'miss' : 'dodge');

// [Gegner, Sequenz die man braucht, Boss?]
const FALL4 = [['kanalkroete', 9], ['gasgeist', 9], ['uhrwerkwaechter', 9], ['maskenspieler', 9], ['schlachtergehilfe', 9], ['felix_fight', 9, true]];
const FALL56 = [['chorwaechter', 8], ['stimmenfresser', 8], ['glockenecho', 8], ['bronzeengel', 8, true], ['miriam', 8, true],
  ['schattenabzug', 8], ['negativ_geist', 8], ['silberbad_schleim', 8], ['pratt_fight', 8], ['dreizehnter_gast', 8, true]];
const FALL78 = [['ertrunkener', 7], ['pfandeintreiber', 7], ['traumfaden', 7, true], ['miss_wren', 7, true]];
const KG = [['kg_schlotgeist', 8], ['kg_kanalrettung', 8], ['kg_rattenschwarm', 8], ['kg_kopfgeld_siegelbrecher', 8, true], ['kg_kopfgeld_schichtdieb', 8, true], ['kg_kopfgeld_pfandvogt', 8, true]];

test('Fall 4: ohne Pfad verliert man am Nordtor (oder kommt kaum lebend raus), mit Sequenz 9 schafft man es', () => {
  for (const [id, seq, boss] of FALL4) {
    const defend = boss ? EXPERT : SKILLED;
    const s = hero();
    const { result } = fight(s, id, { defend, healBelow: 15 });
    assert.ok(result.outcome === 'lost' || s.hp < 20, `${id}: ohne Pfad (${result.outcome}, ${s.hp} Leben)`);
    assert.equal(fight(hero(seq), id, { defend, skill: SKILL(seq), healBelow: 15 }).result.outcome, 'won', `${id}: mit Sequenz ${seq}`);
  }
});

test('Fall 5/6 und Nebenaufträge Kettlegate: Sequenz 9 reicht gegen die Bosse nicht mehr, Sequenz 8 schafft sie', () => {
  for (const [id, seq, boss] of [...FALL56, ...KG]) {
    const defend = boss ? EXPERT : SKILLED;
    // Nur die echten Bosse (Miriam, der Gast, die Kopfgelder) sperren die Sequenz darüber; der Bronzeengel ist ein Wächter
    if (content.encounters[id].boss || id.startsWith('kg_kopfgeld')) {
      // Geübtes Spiel reicht eine Sequenz darüber nicht mehr (nur sehr geübtes, und auch das knapp)
      const s = hero(seq + 1);
      const { result } = fight(s, id, { defend: SKILLED, skill: SKILL(seq + 1), healBelow: 15 });
      assert.ok(result.outcome === 'lost' || s.hp < 20, `${id}: mit Sequenz ${seq + 1} (${result.outcome}, ${s.hp} Leben)`);
    }
    assert.equal(fight(hero(seq), id, { defend, skill: SKILL(seq), healBelow: 15 }).result.outcome, 'won', `${id}: mit Sequenz ${seq}`);
  }
});

test('Fall 7/8: mit Sequenz 8 verliert man gegen die Bosse, mit dem Durchbruch auf 7 gewinnt man', () => {
  for (const [id, seq, boss] of FALL78) {
    const defend = boss ? EXPERT : SKILLED;
    if (content.encounters[id].boss) assert.equal(fight(hero(8), id, { defend, skill: SKILL(8), healBelow: 15 }).result.outcome, 'lost', `${id}: mit Sequenz 8`);
    assert.equal(fight(hero(seq), id, { defend, skill: SKILL(seq), healBelow: 15 }).result.outcome, 'won', `${id}: mit Sequenz ${seq}`);
  }
});

test('Ab Fall 4: wer nur jedem zweiten Schlag ausweicht, verliert auch mit der passenden Sequenz', () => {
  // Mit dem Durchbruch auf 7 steckt man die Laufgegner und Traumfäden von Fall 7/8 weg, Miss Wren nicht
  for (const [id, seq] of [...FALL4, ...FALL56, ...KG, ...FALL78.filter(([id]) => content.encounters[id].boss)]) {
    if (id === 'schattenabzug') continue; // der Schattenabzug bleibt ein Laufgegner
    const s = hero(seq);
    const { result } = fight(s, id, { defend: HALF, skill: SKILL(seq), healBelow: 15 });
    assert.equal(result.outcome, 'lost', `${id} (${s.hp} Leben)`);
  }
});

test('Kurve: ab Fall 4 hält jeder Gegner mehr aus als die Laufgegner der Fälle 1 bis 3, jeder Boss mehr als Rook', () => {
  const E = content.encounters;
  const maxEarly = Math.max(...['fog_hound', 'archive_rats', 'choir_zealots', 'silas_fight', 'mirror_shade'].map((id) => E[id].hp));
  for (const [id, , boss] of [...FALL4, ...FALL56, ...FALL78, ...KG]) {
    assert.ok(E[id].hp > maxEarly, `${id}: ${E[id].hp} Leben`);
    if (boss) assert.ok(E[id].hp > E.rook_fight.hp, `${id}: zäher als Rook`);
  }
  // Bosse ab Fall 4 haben Panzer und werden mit jeder Runde stärker (gegen endloses Abwarten)
  for (const id of ['felix_fight', 'miriam', 'dreizehnter_gast']) assert.ok(E[id].armor >= 1 && E[id].ramp > 0, id);
});
