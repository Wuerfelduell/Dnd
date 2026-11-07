// Prüft Falldaten und Spiellogik ohne Browser: `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';

const caseData = JSON.parse(readFileSync(new URL('../src/data/case_01.json', import.meta.url), 'utf8'));
const KNOWN_TILES = new Set(Object.keys(caseData.map_legend));

test('Karte ist rechteckig und nutzt nur bekannte Zeichen', () => {
  const w = caseData.map[0].length;
  caseData.map.forEach((row, y) => {
    assert.equal(row.length, w, `Zeile ${y} hat Länge ${row.length}, erwartet ${w}`);
    for (const ch of row) assert.ok(KNOWN_TILES.has(ch), `Unbekanntes Zeichen "${ch}" in Zeile ${y}`);
  });
});

test('Spieler, NPCs und Hinweise stehen auf begehbaren bzw. sinnvollen Feldern', () => {
  const at = ([x, y]) => caseData.map[y]?.[x];
  const walkable = new Set(['.', ',', '=']);
  assert.ok(walkable.has(at(caseData.player_start)), 'Startfeld nicht begehbar');
  for (const n of caseData.npcs) assert.ok(walkable.has(at(n.tile)), `NPC ${n.id} steht auf ${at(n.tile)}`);
  for (const i of caseData.interactables) assert.ok(at(i.tile) !== undefined, `Hinweis ${i.id} außerhalb der Karte`);
});

test('Alle Verweise in den Falldaten existieren', () => {
  const clues = new Set(Object.keys(caseData.clues));
  const deductions = new Set(caseData.deductions.map((d) => d.id));
  for (const i of caseData.interactables) assert.ok(clues.has(i.clue), `Interactable ${i.id}: Hinweis ${i.clue} fehlt`);
  for (const d of caseData.deductions) for (const pair of d.pairs) for (const c of pair) assert.ok(clues.has(c), `${d.id}: ${c} fehlt`);
  for (const n of caseData.npcs) assert.ok(caseData.dialogues[n.dialogue], `Dialog ${n.dialogue} fehlt`);
  for (const [id, tree] of Object.entries(caseData.dialogues)) {
    assert.ok(tree.nodes[tree.start], `${id}: Startknoten fehlt`);
    for (const [nid, node] of Object.entries(tree.nodes)) {
      for (const c of node.gives_clues ?? []) assert.ok(clues.has(c), `${id}.${nid}: Hinweis ${c} fehlt`);
      if (node.ending) assert.ok(caseData.endings[node.ending], `${id}.${nid}: Ende ${node.ending} fehlt`);
      for (const ch of node.choices ?? []) {
        if (ch.next) assert.ok(tree.nodes[ch.next], `${id}.${nid}: Knoten ${ch.next} fehlt`);
        for (const c of [...(ch.requires_clues ?? []), ...(ch.hide_if_clues ?? [])]) assert.ok(clues.has(c), `${id}.${nid}: ${c} fehlt`);
        for (const c of ch.requires_conclusions ?? []) assert.ok(deductions.has(c), `${id}.${nid}: ${c} fehlt`);
      }
    }
  }
});

test('Verknüpfen von Hinweisen', () => {
  const s = new GameState(caseData);
  assert.equal(s.combine('frosted_lamp', 'testimony_humming').result, 'none', 'ohne gefundene Hinweise');
  s.addClue('frosted_lamp');
  s.addClue('testimony_humming');
  s.addClue('gin_bottle');
  assert.equal(s.combine('gin_bottle', 'frosted_lamp').result, 'none');
  assert.equal(s.combine('testimony_humming', 'frosted_lamp').result, 'new', 'Reihenfolge egal');
  assert.equal(s.combine('frosted_lamp', 'testimony_humming').result, 'known');
  assert.deepEqual(s.conclusions, ['unnatural_cold']);
});

test('Geistsicht kostet Nerven und schaltet sich bei 0 ab', () => {
  const s = new GameState(caseData);
  const notices = [];
  s.on('notice', (t) => notices.push(t));
  s.setSpiritVision(true);
  s.tick(5);
  assert.ok(s.composure < 100);
  s.tick(60);
  assert.equal(s.composure, 0);
  assert.equal(s.spiritVision, false);
  assert.equal(s.setSpiritVision(true), false, 'mit leeren Nerven nicht aktivierbar');
  s.tick(10);
  assert.ok(s.composure > 50);
  assert.equal(notices.length, 2);
});

test('Das gute Ende ist erreichbar, und erst mit allen drei Schlussfolgerungen', () => {
  const s = new GameState(caseData);
  const accuse = caseData.dialogues.price.nodes.accuse;
  const goodChoice = accuse.choices.find((c) => c.next === 'end_good');
  assert.equal(s.isChoiceAvailable(goodChoice), false);
  // Alle Hinweise, die man in der Welt oder im Gespräch bekommt
  for (const id of ['frosted_lamp', 'dropped_pole', 'wax_seal', 'footprints', 'testimony_humming', 'pawn_ledger']) s.addClue(id);
  s.combine('frosted_lamp', 'testimony_humming');
  s.combine('wax_seal', 'pawn_ledger');
  assert.equal(s.isChoiceAvailable(goodChoice), false);
  s.combine('dropped_pole', 'footprints');
  assert.equal(s.isChoiceAvailable(goodChoice), true);
  s.enterDialogueNode(caseData.dialogues.price.nodes.end_good);
  assert.equal(s.ending, 'good');
});

test('Halloway rückt das Pfandbuch nur gegen die Fußspuren heraus', () => {
  const s = new GameState(caseData);
  const choice = caseData.dialogues.halloway.nodes.start.choices.find((c) => c.next === 'prints');
  assert.equal(s.isChoiceAvailable(choice), false);
  s.addClue('footprints');
  assert.equal(s.isChoiceAvailable(choice), true);
  s.enterDialogueNode(caseData.dialogues.halloway.nodes.prints);
  assert.ok(s.hasClue('pawn_ledger'));
  assert.equal(s.isChoiceAvailable(choice), false, 'danach ausgeblendet');
});
