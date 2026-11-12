import { readFileSync } from 'node:fs';
import { Combat, isPrecise, skillBars } from '../src/core/Combat.js';
import { buildK3Ruf } from '../src/data/k3Ruf.js';
import { buildContent } from '../src/data/buildContent.js';
import { runde8Packs, RUNDE8_FILES } from '../src/data/runde8.js';
import { fasserinAuftragPack, halbgottPack, FASSERIN_AUFTRAG_FILES, HALBGOTT_FILES } from '../src/data/runde9.js';
import { seq4DrPack, SEQ4_DR_FILES } from '../src/data/seq4Dr.js';
import { dunscarZirkelPack } from '../src/data/dunscarZirkel.js';

const load = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url), 'utf8'));

const PACKS = ['kg_nebenquests', 'wx_nebenquests', 'koop', 'k2_akten', 'k2_orte', 'k2_gilde', 'k2_akte', 'k3_orte', 'k3_akte', 'k3_nebenquests', 'k3_pruefungen', 'k3_handel', 'k3_leben', 'koop_k3'];
const PACK_FILES = ['quests', 'items', 'encounters', 'dialogues', 'npcs', 'case', 'dialog_zusaetze', 'platzierung'];

/** sequenzen: false lädt den Stand ohne Paket AF (für docs/story/sequenzen/pruefen.mjs). */
export function loadContent({ sequenzen = true, without = [] } = {}) {
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
    packs: [...PACKS.filter((name) => !without.includes(name)).map((name) => ({ name, ...Object.fromEntries(PACK_FILES.map((f) => [f, load(`packs/${name}/${f}.json`)])),
      ...(name === 'wx_nebenquests' ? { kahn_ausbau: load('packs/wx_nebenquests/kahn_ausbau.json') } : {}),
      ...(name === 'k2_akten' ? { faelle: load('packs/k2_akten/faelle.json'), zeitung: load('packs/k2_akten/zeitung.json') } : {}),
      ...(name === 'k2_akte' ? (() => {
        const akt5 = load('packs/k2_akte/akt5_neu.json');
        return { epiloge: load('packs/k2_akte/epiloge.json'), quests: { ...load('packs/k2_akte/quests.json'), ...akt5.quests }, dialogues: { ...load('packs/k2_akte/dialogues.json'), ...akt5.dialogues },
          platzierung: [...load('packs/k2_akte/platzierung.json'), ...akt5.platzierung, ...load('packs/k2_akte/turm_sperren.json')] };
      })() : {}),
      ...(name === 'k2_orte' ? Object.fromEntries(['artifacts', 'maps', 'travel', 'zone', 'pins'].map((f) => [f, load(`packs/k2_orte/${f}.json`)])) : {}),
      ...(name === 'k3_orte' ? Object.fromEntries(['maps', 'travel', 'zones', 'bosses', 'phasen', 'artifacts', 'city'].map((f) => [f, load(`packs/k3_orte/${f}.json`)])) : {}),
      ...(name === 'k3_akte' ? { faelle: load('packs/k3_akte/faelle.json'), zeitung: load('packs/k3_akte/zeitung.json'), boss_texte: load('packs/k3_akte/boss_texte.json'), epiloge: load('packs/k3_akte/epiloge.json') } : {}),
      // Kapitel 3: die Kernfächer der Hüter (pfadgefilterte Beute) gehören zu den Dialogen von AS
      ...(name === 'k3_orte' ? { dialogues: { ...load('packs/k3_orte/dialogues.json'), ...load('packs/k3_orte/beute_vorschlag.json') } } : {}),
      ...(name === 'k3_nebenquests' ? Object.fromEntries(['zeitung', 'gerede', 'bestiarium', 'lesestuecke'].map((f) => [f, load(`packs/k3_nebenquests/${f}.json`)])) : {}),
      ...(name === 'k3_handel' ? { haendler: load('packs/k3_handel/haendler.json'), treffen: load('packs/k3_handel/treffen_schichtbund.json'), einzelgaenger: load('packs/k3_handel/einzelgaenger.json'), artifacts: load('packs/k3_handel/artifacts.json') } : {}),
      ...(name === 'k3_leben' ? { platzierung: load('packs/k3_leben/platzierung.json').filter((p) => !p.npc), einwohner: load('packs/k3_leben/einwohner.json'), stadtgegner: load('packs/k3_leben/stadtgegner_dunscar.json'),
        ...Object.fromEntries(['phasen', 'streifen', 'gerede', 'zeitung', 'leben'].map((f) => [f, load(`packs/k3_leben/${f}.json`)])) } : {}),
      ...(name === 'k2_gilde' ? { artefakte: load('packs/k2_gilde/artefakte.json'), treffen: load('packs/k2_gilde/treffen_namensgilde.json') } : {}),
      ...(name === 'koop' ? { geplauder: load('packs/koop/geplauder.json'), kampf: load('packs/koop/kampf.json') } : {}),
      ...(name === 'koop_k3' ? { platzierung: load('packs/koop_k3/platzierung.json').filter((p) => !p.interactable.id.startsWith('koop_ds_schleuse')),
        ...Object.fromEntries(['geplauder', 'kampf', 'bindung'].map((f) => [f, load(`packs/koop_k3/${f}.json`)])) } : {}) })),
    // Dunscar: zwei weitere Zirkel und Lose im Tausenderbereich (nach k3_handel)
    ...(without.includes('ds_zirkel') ? [] : [dunscarZirkelPack()]),
    // Kapitel-1-Finale: Epilogtafeln nach Fall 9 und Prices Fahndung in Kettlegate
    ...(without.includes('k1_finale') ? [] : [{ name: 'k1_finale', epiloge: load('packs/k1_finale/epiloge.json'), police: load('packs/k1_finale/police.json') }]),
    // Paket BG bringt nur Zusätze, Ansprüche, Ersatzzeilen und Texte
    ...(without.includes('k3_ruf') ? [] : [buildK3Ruf(Object.fromEntries(['stationen', 'klang_zuordnung', 'bindungen', 'texte'].map((f) => [f, load(`packs/k3_ruf/${f}.json`)])))]),
    ...(without.includes('beziehungen') ? [] : [{ name: 'beziehungen', dialog_zusaetze: load('packs/beziehungen/dialog_zusaetze.json') }]),
    ...(without.includes('fasserin') ? [] : [(() => { const r = load('packs/fasserin/rezepte.json'); return { name: 'fasserin', rezepte: r.recipes, artifacts: r.artifacts, fasserin_texte: load('packs/fasserin/texte.json'), gerede: load('packs/fasserin/gerede.json'), zeitung: load('packs/fasserin/zeitung.json') }; })()]),
    ...(without.includes('feste') ? [] : [{ name: 'feste', zeitung: load('packs/feste/zeitung.json') }]),
    ...(without.includes('fasserin_auftrag') ? [] : [fasserinAuftragPack(Object.fromEntries(FASSERIN_AUFTRAG_FILES.map((f) => [f, load(`packs/fasserin_auftrag/${f}.json`)])))]),
    ...(without.includes('halbgott') ? [] : [halbgottPack(Object.fromEntries(HALBGOTT_FILES.map((f) => [f, load(`packs/halbgott/${f}.json`)])))]),
    ...(without.includes('sekten') ? [] : [(() => { const f = load('packs/sekten/figuren.json'); const g = load('packs/sekten/gegner.json'); const a = load('packs/sekten/auftraege.json');
      return { name: 'sekten', npcs: f.npcs, dialogues: f.dialogues, einwohner: f.einwohner, items: g.items, encounters: g.encounters, loot: g.loot, quests: a.quests, artifacts: a.artifacts,
        dialog_zusaetze: load('packs/sekten/dialog_zusaetze.json'), platzierung: load('packs/sekten/platzierung.json'), zeitung: load('packs/sekten/zeitung.json'), gerede: load('packs/sekten/gerede.json'), geplauder: load('packs/sekten/geplauder.json'), sekten: load('packs/sekten/daten.json') }; })()]),
    // Codex-Runde 8: Vorrat, Kapitel 4 und 5, Feste-Leben (Zusammenstellung in src/data/runde8.js)
    ...(without.includes('runde8') ? [] : runde8Packs(Object.fromEntries(Object.entries(RUNDE8_FILES).map(([pack, files]) => [pack, Object.fromEntries(files.map((f) => [f, load(`packs/${pack}/${f}.json`)]))])))),
    ...(without.includes('seq4_dr') ? [] : [seq4DrPack(Object.fromEntries(SEQ4_DR_FILES.map((f) => [f, load(`packs/seq4_dr/${f}.json`)])))]),
    ...(without.includes('koop_beute') ? [] : [{ name: 'koop_beute', dialog_zusaetze: load('packs/koop_beute/dialog_zusaetze.json'), ansprueche: load('packs/koop_beute/ansprueche.json'), ersatz: load('packs/koop_beute/ersatz.json'), texte: load('packs/koop_beute/texte.json') }])],
    beziehungen: load('beziehungen.json'),
    lore: Object.fromEntries(['bestiarium', 'gerede', 'item_texte', 'lesestuecke', 'zeitungen'].map((f) => [f, load(`packs/lore/${f}.json`)])),
    sequenzen: sequenzen ? { ...Object.fromEntries(['neue_pfade', 'seq_4_bis_1', 'zutaten', 'artefakte'].map((f) => [f, load(`packs/sequenzen/${f}.json`)])),
      rituale: load('packs/k3_pruefungen/rituale.json'), faehigkeiten: load('packs/sequenzen/faehigkeiten2.json') } : null,
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
  state.applyEffects(tree.nodes[nodeId], { nodeKey: `${dialogueId}.${nodeId}` });
  state.visitNode(dialogueId, nodeId);
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
    state.applyEffects(tree.nodes[nodeId], { nodeKey: `${dialogueId}.${nodeId}` });
    state.visitNode(dialogueId, nodeId);
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
/**
 * Geübter Angreifer: jeder dritte Takt sitzt präzise. Bei präzisen Fertigkeiten (Fenster ein Fünftel) nur jeder sechste.
 * Für fight({ attack }) als Funktion (i, precise) => Bewertung.
 */
export const SKILLED_HIT = (i, precise) => ((precise ? i % 6 === 5 : i % 3 === 2) ? 'perfect' : 'good');

/** Sehr geübt: von fünf Schlägen nur einer kassiert. So schafft man Eliten und Bosse. */
export const EXPERT = (i) => ['dodge', 'parry', 'dodge', 'parry', 'miss'][i % 5];

/**
 * Spielt einen Kampf mit festen Ergebnissen durch (wie CombatScene, ohne Timing).
 * attack: Bewertung der Angriffe (fest oder (i, precise) => Bewertung), defend(i): Ergebnis des i-ten gegnerischen Schlags.
 */
/** Seq-5-Prüfung (core/Seq5.js) als bestanden setzen, damit Tests das Ritual vollziehen können. */
export function passTrial(state, kind, now = Date.now()) {
  const st = state.seq5();
  for (const key of Object.keys(st)) delete st[key];
  if (kind === 'maske') { st.identity = { name: 'X', enc: 'x', pathway: 'maske', city: 'kettlegate', mark: 'x' }; st.convinced = ['a', 'b']; st.asked = ['a', 'b']; }
  else if (kind === 'kessel') { state.sudeBekannt = ['nebelsud']; state.buffs ??= []; state.buffs.push({ key: 'dmg_mult', value: 1.15, until: (state.talentTime ?? 0) + 90, source: 'sud:test' }); }
  else if (kind === 'uhr') { st.armed = true; st.phase = 'wait2'; st.t = now - 30000; if (!state.hasWatch()) state.addItem('uhr_taschen'); }
  else if (kind !== 'moor') st.done = true;
}

export function fight(state, encounterId, { attack = 'good', defend = () => 'dodge', skill = 'attack', items = [], healBelow = 0, maxRounds = 60, chain = false, weak = false } = {}) {
  const c = new Combat(state, encounterId);
  c.rng = seeded(7); // fester Zufall: Takt und Nachsetzen sind in Tests reproduzierbar
  if (weak && c.enc.weak_if) c.weak = true; // Schwachstelle aus den Ermittlungen bekannt
  let n = 0;
  let bars = 0;
  const grade = (sk) => (typeof attack === 'function' ? attack(bars++, isPrecise(sk)) : attack);
  // Fertigkeiten kosten Nerven: Geübte halten eine Reserve fürs Ausweichen zurück (fünf Mal ausweichen)
  const NERVE_RESERVE = 15;
  const afford = (id) => c.canUse(id) && (id === 'attack' || state.composure - c.composureCost(c.skillDef(id)) >= NERVE_RESERVE);
  const enemyTurn = () => {
    const atk = c.nextEnemyAttack();
    if (atk) {
      // Wer Ringe lesen kann, pariert keine nicht parierbaren Angriffe, sondern weicht aus
      const results = atk.hits.map(() => { const r = defend(n++); return r === 'parry' && atk.unparryable ? 'dodge' : r; });
      for (const r of results) { c.resolveHit(atk, r); if (c.outcome) break; }
      if (!c.outcome && results.every((r) => r === 'parry')) c.riposte();
      c.endEnemyTurn();
    }
  };
  // Hinterhalt (Wexmoor): der Gegner schlägt zu, bevor du handeln kannst
  if (c.ambush()) { enemyTurn(); c.endRound(); }
  while (!c.outcome && c.round <= maxRounds) {
    const heal = ['tonikum', 'verband'].find((i) => state.itemCount(i));
    if (state.hp < healBelow && heal) c.useItem(heal);
    else if (items.length && state.itemCount(items[0])) c.useItem(items.shift());
    else if (chain) {
      // Wie geübte Spieler: Fertigkeit, solange Konzentration und Nerven reichen, dann beendet der Angriff den Zug
      let guard = 0;
      while (!c.outcome && skill !== 'attack' && afford(skill) && !c.endsTurn(skill) && guard++ < 5) c.useSkill(skill, Array(c.skillDef(skill).hits).fill(attack));
      if (!c.outcome) c.useSkill('attack', [attack]);
    } else {
      const sk = afford(skill) ? skill : 'attack';
      const def = c.skillDef(sk);
      c.useSkill(sk, Array.from({ length: skillBars(def) }, () => grade(def)));
    }
    if (c.outcome) break;
    enemyTurn();
    c.endRound();
  }
  return { combat: c, result: c.finish() };
}
