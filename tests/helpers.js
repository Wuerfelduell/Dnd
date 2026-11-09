import { readFileSync } from 'node:fs';
import { Combat } from '../src/core/Combat.js';
import { buildContent } from '../src/data/buildContent.js';

const load = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url), 'utf8'));

export function loadContent() {
  return buildContent({
    campaign: load('campaign.json'),
    quests: load('quests.json'),
    items: load('items.json'),
    encounters: load('encounters.json'),
    cases: [load('case_01.json'), load('case_02.json'), load('case_03.json'), load('case_altmarkt.json'), load('case_04.json'), load('case_05.json'), load('case_06.json')],
    maps: ['revier', 'ashgrove', 'ebba', 'crypt', 'docks', 'warehouse', 'altmarkt', 'tavern', 'nachtmarkt', 'nordtor', 'theater', 'uhrturm', 'gaskanaele', 'schlachthof', 'sternwarte', 'marsch', 'katakomben', 'pestgassen', 'kraterwald', 'ankerhof', 'rostkapelle', 'haus_morrow', 'schleierhaus', 'giesserei', 'haus_vey', 'resonanzkammer', 'atelier', 'ballsaal', 'spiegelkabinett'].map((m) => load(`maps/${m}.json`)),
    dialogues: ['revier', 'ashgrove', 'ebba', 'hafen', 'altmarkt', 'nachtmarkt', 'nordtor', 'fundstuecke', 'factions', 'fall5', 'fall6'].map((d) => load(`dialogues/${d}.json`)),
    pathways: load('pathways.json'),
    market: load('market.json'),
    travel: load('travel.json'),
    wilds: load('wilds.json'),
    factions: load('factions.json'),
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

/** Geübte Spielweise: von drei Schlägen einer ausgewichen, einer pariert, einer kassiert. */
export const SKILLED = (i) => ['dodge', 'parry', 'miss'][i % 3];

/**
 * Spielt einen Kampf mit festen Ergebnissen durch (wie CombatScene, ohne Timing).
 * attack: Bewertung der Angriffe, defend(i): Ergebnis des i-ten gegnerischen Schlags.
 */
export function fight(state, encounterId, { attack = 'good', defend = () => 'dodge', skill = 'attack', items = [], healBelow = 0, maxRounds = 60 } = {}) {
  const c = new Combat(state, encounterId);
  let n = 0;
  while (!c.outcome && c.round <= maxRounds) {
    const heal = ['tonikum', 'verband'].find((i) => state.itemCount(i));
    if (state.hp < healBelow && heal) c.useItem(heal);
    else if (items.length && state.itemCount(items[0])) c.useItem(items.shift());
    else {
      const sk = c.canUse(skill) ? skill : 'attack';
      c.useSkill(sk, Array(c.skillDef(sk).hits).fill(attack));
    }
    if (c.outcome) break;
    const atk = c.nextEnemyAttack();
    if (atk) {
      const results = atk.hits.map(() => defend(n++));
      for (const r of results) { c.resolveHit(atk, r); if (c.outcome) break; }
      if (!c.outcome && results.every((r) => r === 'parry')) c.riposte();
      c.endEnemyTurn();
    }
    c.endRound();
  }
  return { combat: c, result: c.finish() };
}
