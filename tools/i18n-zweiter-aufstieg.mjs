// Sammelt alle deutschen Texte des zweiten Aufstiegs (data/zweiterAufstieg.js), die ins EN-Wörterbuch gehören.
// node tools/i18n-zweiter-aufstieg.mjs → listet fehlende Einträge in src/i18n/en/zweiter_aufstieg.json
import { readFileSync } from 'node:fs';
import { loadContent } from '../tests/helpers.js';
import { BUERGEN, HIMMEL2, K6_QUEST, SCHAFFNER2 } from '../src/data/zweiterAufstieg.js';

export function zweiterAufstiegTexte(content = loadContent()) {
  const out = new Set();
  const add = (s) => { if (typeof s === 'string' && s.trim()) out.add(s); };
  const angriffe = (l) => (l ?? []).forEach((a) => { add(a.name); add(a.text); });
  for (const [id, e] of Object.entries(content.encounters)) {
    if (!id.startsWith('hs2_') && id !== SCHAFFNER2) continue;
    for (const k of ['name', 'intro', 'win_text', 'lose_text', 'flee_text']) add(e[k]);
    angriffe(e.attacks); angriffe(e.phase2?.attacks); add(e.phase2?.meldung);
  }
  const inters = [...content.maps[HIMMEL2].interactables, ...content.maps.cw_kronenarchiv.interactables.filter((i) => i.id.startsWith('k6_') || i.id === 'auf_cw_zug2'),
    ...['bh_verteilanlage', 'bh_verteilanlage__warm'].flatMap((m) => content.maps[m]?.interactables.filter((i) => i.id === 'k5s_zug2') ?? [])];
  for (const i of inters) { add(i.prompt); add(i.title); add(i.text); }
  for (const id of Object.keys(BUERGEN)) {
    const npc = content.npcs[id];
    add(npc.role);
    const d = content.dialogues[npc.dialogue];
    const start = d.nodes[d.start ?? 'cwn_start'];
    add(start.text);
    for (const c of start.choices) if (String(JSON.stringify(c.next)).includes('k6_')) add(c.text);
    for (const [k, n] of Object.entries(d.nodes)) if (k.startsWith('k6_')) { add(n.text); for (const c of n.choices ?? []) add(c.text); }
  }
  const dd = content.dialogues[content.npcs.cw_darnell.dialogue];
  add(dd.nodes.k6_starling_eintrag.text);
  for (const c of dd.nodes.hub.choices) if (c.next === 'k6_starling_eintrag') add(c.text);
  const q = content.quests[K6_QUEST];
  add(q.title); add(q.summary); for (const s of q.steps) add(s.text);
  for (const c of content.cases) if (c.id === 'kapitel6_aufstieg2') add(c.title);
  for (const list of Object.values(content.gossip?.calderwick ?? {})) for (const g of list) if (/zweiten Zug\. Fünf|Die Narbe\?|Starling ist gefallen/.test(g.text)) add(g.text);
  add('Narbe aus Licht');
  add('Oben wurdest du verbrannt. Die Narbe bleibt. Die Wesen der Himmelsstadt erkennen sie: Du triffst sie um 15 % härter, sie dich um 10 %.');
  return [...out];
}

if (process.argv[1]?.endsWith('i18n-zweiter-aufstieg.mjs')) {
  const { setDict, lookup } = await import('../src/core/I18n.js');
  const { readdirSync } = await import('node:fs');
  const dir = new URL('../src/i18n/en/', import.meta.url);
  const d = Object.assign({}, ...readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8'))));
  setDict(d);
  const fehlt = zweiterAufstiegTexte().filter((t) => !lookup(t));
  console.log(JSON.stringify(Object.fromEntries(fehlt.map((t) => [t, ''])), null, 1));
  console.error(`${fehlt.length} fehlen`);
}
