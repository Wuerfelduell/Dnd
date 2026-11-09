import { readFileSync } from 'node:fs';
import { Combat } from '../src/core/Combat.js';
import { buildContent } from '../src/data/buildContent.js';

const load = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url), 'utf8'));

const PACKS = ['kg_nebenquests', 'wx_nebenquests'];
const PACK_FILES = ['quests', 'items', 'encounters', 'dialogues', 'npcs', 'case', 'dialog_zusaetze', 'platzierung'];

export function loadContent() {
  return buildContent({
    campaign: load('campaign.json'),
    quests: load('quests.json'),
    items: load('items.json'),
    encounters: load('encounters.json'),
    cases: [load('case_01.json'), load('case_02.json'), load('case_03.json'), load('case_altmarkt.json'), load('case_04.json'), load('case_05.json'), load('case_06.json'), load('case_07.json'), load('case_08.json'), load('case_09.json')],
    maps: ['revier', 'ashgrove', 'ebba', 'crypt', 'docks', 'warehouse', 'altmarkt', 'tavern', 'nachtmarkt', 'nordtor', 'theater', 'uhrturm', 'gaskanaele', 'schlachthof', 'sternwarte', 'marsch', 'katakomben', 'pestgassen', 'kraterwald', 'ankerhof', 'rostkapelle', 'haus_morrow', 'schleierhaus', 'giesserei', 'haus_vey', 'resonanzkammer', 'atelier', 'ballsaal', 'spiegelkabinett', 'kontor_thorne', 'waisenhaus', 'traumkeller'].map((m) => load(`maps/${m}.json`)),
    dialogues: ['revier', 'ashgrove', 'ebba', 'hafen', 'altmarkt', 'nachtmarkt', 'nordtor', 'fundstuecke', 'factions', 'fall5', 'fall6', 'fall78', 'fall9', 'kopfgeld'].map((d) => load(`dialogues/${d}.json`)),
    pathways: load('pathways.json'),
    market: load('market.json'),
    travel: load('travel.json'),
    wilds: load('wilds.json'),
    factions: load('factions.json'),
    buildings: load('gebaeude.json'),
    gatherings: load('treffen.json'),
    city: load('stadtgegner.json'),
    wexmoor: load('wexmoor.json'),
    packs: PACKS.map((name) => ({ name, ...Object.fromEntries(PACK_FILES.map((f) => [f, load(`packs/${name}/${f}.json`)])),
      ...(name === 'wx_nebenquests' ? { kahn_ausbau: load('packs/wx_nebenquests/kahn_ausbau.json') } : {}) })),
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

/** Kleiner deterministischer Zufallsgenerator (mulberry32). */
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Geübte Spielweise: von drei Schlägen einer ausgewichen, einer pariert, einer kassiert. */
export const SKILLED = (i) => ['dodge', 'parry', 'miss'][i % 3];
/** Sehr geübt: von fünf Schlägen nur einer kassiert. So schafft man Eliten und Bosse. */
export const EXPERT = (i) => ['dodge', 'parry', 'dodge', 'parry', 'miss'][i % 5];

/**
 * Spielt einen Kampf mit festen Ergebnissen durch (wie CombatScene, ohne Timing).
 * attack: Bewertung der Angriffe, defend(i): Ergebnis des i-ten gegnerischen Schlags.
 */
export function fight(state, encounterId, { attack = 'good', defend = () => 'dodge', skill = 'attack', items = [], healBelow = 0, maxRounds = 60 } = {}) {
  const c = new Combat(state, encounterId);
  c.rng = seeded(7); // fester Zufall: Takt und Nachsetzen sind in Tests reproduzierbar
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
      // Wer Ringe lesen kann, pariert keine nicht parierbaren Angriffe, sondern weicht aus
      const results = atk.hits.map(() => { const r = defend(n++); return r === 'parry' && atk.unparryable ? 'dodge' : r; });
      for (const r of results) { c.resolveHit(atk, r); if (c.outcome) break; }
      if (!c.outcome && results.every((r) => r === 'parry')) c.riposte();
      c.endEnemyTurn();
    }
    c.endRound();
  }
  return { combat: c, result: c.finish() };
}
