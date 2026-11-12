// Kapitelübergänge: Abschied, Reise und Ankunft zwischen Kettlegate, Wexmoor und Dunscar (`npm test`)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { sceneUrl } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();

/** Alle Knoten eines Dialogs, die man vom Start aus erreicht. */
function reachable(tree) {
  const starts = Array.isArray(tree.start) ? tree.start.map((v) => v.node) : [tree.start];
  const seen = new Set();
  const todo = [...starts];
  while (todo.length) {
    const id = todo.pop();
    if (seen.has(id)) continue;
    assert.ok(tree.nodes[id], `Knoten fehlt: ${id}`);
    seen.add(id);
    for (const c of tree.nodes[id].choices ?? []) for (const n of [c.next].flat().filter(Boolean)) todo.push(typeof n === 'string' ? n : n.node);
  }
  return seen;
}

test('Zug nach Wexmoor öffnet die Abreise-Szene statt direkt zu fahren', () => {
  const zug = content.travel.find((t) => t.map === 'wx_bahnhof' && t.spawn === 'zug');
  assert.equal(zug.dialogue, 'uebergang_k1k2');
  const tree = content.dialogues.uebergang_k1k2;
  const nodes = reachable(tree);
  for (const id of nodes) if (tree.nodes[id].scene) assert.ok(sceneUrl(tree.nodes[id].scene), `Bild fehlt: ${tree.nodes[id].scene}`);
  // Nur die Einfahrt reist; der Abschied lässt dich noch in Kettlegate
  const travelling = [...nodes].filter((id) => tree.nodes[id].travel);
  assert.deepEqual(travelling, ['einfahrt']);
  assert.deepEqual(tree.nodes.einfahrt.travel, { map: 'wx_bahnhof', spawn: 'zug' });
});

test('Fall 9 startet den Wegweiser zum Zug, die Einfahrt schließt ihn', () => {
  for (const id of ['c9_perfect', 'c9_good', 'c9_early', 'c9_vey']) {
    const s = new GameState(content);
    s.startQuest('case_09');
    s.applyEffects(content.endings[id]);
    assert.equal(s.quests.k1_abreise, 'active', id);
    s.applyEffects(content.dialogues.uebergang_k1k2.nodes.einfahrt);
    assert.equal(s.quests.k1_abreise, 'done', id);
    assert.deepEqual(s.pendingTravel, { map: 'wx_bahnhof', spawn: 'zug' });
  }
});

for (const k of ['rein', 'moor', 'lichtmeister', 'meer']) {
  test(`Ende ${k}: Anreise nach Dunscar mit Abschied, Fahrt und Ankunft`, () => {
    const tree = content.dialogues[`k3a_anreise_${k}`];
    const nodes = reachable(tree);
    for (const n of ['abschied', 'fahrt', 'schlaf', 'bergmann', 'fenster', 'ankunft']) assert.ok(nodes.has(`k3a_anreise_${k}_${n}`), n);
    for (const id of nodes) if (tree.nodes[id].scene) assert.ok(sceneUrl(tree.nodes[id].scene), `Bild fehlt: ${tree.nodes[id].scene}`);
    assert.deepEqual([...nodes].filter((id) => tree.nodes[id].travel), [`k3a_anreise_${k}_ankunft`]);
    const s = new GameState(content);
    s.applyEffects(tree.nodes[`k3a_anreise_${k}_bergmann`]);
    assert.ok(s.flags.has('k3r_gott_gehoert'), 'Der Bergmann erzählt vom Alten unter dem Fels');
  });
}
