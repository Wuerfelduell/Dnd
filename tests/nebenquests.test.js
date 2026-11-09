import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';

const content = loadContent();

test('Paket AA: elf Kettlegate-Nebenaufträge und drei Steckbriefe sind im Spiel', () => {
  const kg = Object.keys(content.quests).filter((id) => id.startsWith('kg_'));
  assert.equal(kg.length, 14);
  for (const id of kg) assert.equal(content.quests[id].kind, 'side', id);
  // Zusatzoptionen stehen vor der Abschiedsoption, die neuen Knoten hängen am selben Dialog
  const martha = content.dialogues[content.npcs.waescherin.dialogue];
  assert.ok(martha.nodes.start.choices.some((c) => c.next?.startsWith('kg_')));
  assert.ok(!martha.nodes.start.choices.at(-1).next?.startsWith('kg_'));
  // Verhaftete Figuren verschwinden von ihrem alten Platz
  const erbe = Object.values(content.maps).flatMap((m) => m.npcs ?? []).find((n) => n.id === 'erbe' && !n.visible_if?.requires_flags?.includes('case_08_closed'));
  assert.ok(erbe.visible_if.hide_if_flags.includes('edmund_arrested'));
  // Neue Fundstellen liegen auf den Karten
  assert.ok(content.maps.ashgrove.interactables.some((i) => i.id === 'kg_hemd'));
});

test('Paket AA: Martha bietet nach Fall 5 den Waschtag an', () => {
  const s = new GameState(content);
  s.flags.add('case_05_closed');
  const d = content.dialogues[content.npcs.waescherin.dialogue];
  const start = s.pickStart ? s.pickStart(d) : 'start';
  const choices = d.nodes[start].choices.filter((c) => s.meets(c));
  assert.ok(choices.some((c) => c.next?.startsWith('kg_')), 'Option für den neuen Auftrag sichtbar');
});
