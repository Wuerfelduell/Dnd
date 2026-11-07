import { readFileSync } from 'node:fs';
import { buildContent } from '../src/data/buildContent.js';

const load = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url), 'utf8'));

export function loadContent() {
  return buildContent({
    campaign: load('campaign.json'),
    quests: load('quests.json'),
    cases: [load('case_01.json'), load('case_02.json')],
    maps: ['revier', 'ashgrove', 'ebba', 'crypt'].map((m) => load(`maps/${m}.json`)),
    dialogues: ['revier', 'ashgrove', 'ebba'].map((d) => load(`dialogues/${d}.json`)),
  });
}

/**
 * Spielt ein Gespräch wie im UI: Startknoten wählen, Effekte anwenden und
 * nacheinander die Optionen anklicken, deren Text die angegebenen Stücke enthält.
 */
export function talk(state, dialogueId, picks = []) {
  const tree = state.content.dialogues[dialogueId];
  let nodeId = state.pick(tree.start);
  const visited = [nodeId];
  state.applyEffects(tree.nodes[nodeId]);
  for (const want of picks) {
    const node = tree.nodes[nodeId];
    const choice = (node.choices ?? []).find((c) => c.text.includes(want) && state.meets(c));
    if (!choice) {
      const avail = (node.choices ?? []).filter((c) => state.meets(c)).map((c) => c.text);
      throw new Error(`${dialogueId}.${nodeId}: keine verfügbare Option "${want}". Verfügbar: ${avail.join(' | ')}`);
    }
    nodeId = state.pick(choice.next);
    if (!nodeId) return visited;
    visited.push(nodeId);
    state.applyEffects(tree.nodes[nodeId]);
  }
  return visited;
}

/** Interaktion mit einem Objekt der Karte (wie WorldScene.interact, ohne Grafik). */
export function use(state, mapId, objectId) {
  const def = state.content.maps[mapId].interactables.find((i) => i.id === objectId);
  if (!def) throw new Error(`Objekt ${objectId} fehlt auf ${mapId}`);
  if (def.visible_if && !state.meets(def.visible_if)) throw new Error(`${objectId} ist gerade unsichtbar`);
  if (def.lock && !state.meets(def.lock)) return 'locked';
  if (def.kind === 'read') state.applyEffects(def.effects);
  else if (!def.kind || def.kind === 'clue') { state.addClue(def.clue); state.applyEffects(def.effects); }
  return 'ok';
}
