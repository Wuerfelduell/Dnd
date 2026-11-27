// Verweis-Prüfung: lädt das komplette Content-Objekt (wie das Spiel) und läuft jeden ID-Verweis ab:
// Gegenstände, Figuren, Aufträge, Kämpfe, Dialoge und Dialogknoten, Karten und Spawns, Hinweise,
// Informationen, Schlussfolgerungen, Enden, Pfade, Fraktionen, Gebiete, Beutetabellen.
// Aufruf: `node tools/verweise.mjs` (Exit-Code 1 bei kaputten Verweisen). Test: tests/verweise.test.js
// Markierungen (Flags) sind keine festen IDs; ihre Erreichbarkeit prüft tools/sackgassen.mjs.

/** Schlüssel, deren Wert (Text oder Liste) eine ID ist, und wo die ID stehen muss (eine der Arten genügt). */
export const KEY_KINDS = {
  item: ['item'], items: ['item'], weapon: ['item'], potion: ['item'], formula: ['item'], core: ['item'], icon: null,
  requires_items: ['item'], hide_if_items: ['item'], wants: ['item'], zutaten: ['item'], artifact: ['item'], cleanse_item: ['item'],
  likes: ['item'], dislikes: ['item'], mag: ['item'], verabscheut: ['item'], defaultItem: ['item'], dropItem: ['item'], choiceAtLevel1: ['item'],
  npc: ['npc'], host: ['npc'], absender: ['npc'], beziehungs_id: ['npc'],
  quests: ['quest'], start_quests: ['quest'], complete_quests: ['quest'], fail_quests: ['quest'], requires_quests_active: ['quest'],
  requires_any_quests_active: ['quest'], requires_quests_done: ['quest'], hide_if_quests: ['quest'], rueckholung: ['quest'], bei_quest: ['quest'],
  encounter: ['encounter'], combat: ['encounter'], fight: ['encounter'], wanted: ['encounter'], gegner: ['encounter'], won: ['encounter'],
  resist: ['encounter'], requires_alle_flag: ['encounter'], hide_if_alle_flag: ['encounter'], sieg_flag: ['encounter'],
  dialogue: ['dialogue'], inspect: ['dialogue'], resist_dialogue: ['dialogue'], daily: ['dialogue'], requires_daily: ['dialogue'], hide_if_daily: ['dialogue'], spiel: ['dialogue'],
  map: ['map'], maps: ['map'], to: ['map'], karten: ['map'], wanderkarten: ['map'], heimat: ['map'], original_map: ['map'], intended_original: ['map'], target_map: ['map'],
  zone: ['zone', 'map'], zones: ['zone', 'map'], zonen: ['zone', 'map'],
  clue: ['clue'], gives_clues: ['clue'], requires_clues: ['clue'], requires_any_clues: ['clue'], hide_if_clues: ['clue'], refuted_by: ['clue'], learnedFromClue: ['clue'],
  fact: ['fact'], requires_facts: ['fact'], requires_likely: ['fact'], requires_suspected: ['fact'], refuted_if_likely: ['fact'],
  requires_conclusions: ['ded'], requires_certain: ['ded'], hide_if_conclusions: ['ded'], gives_conclusions: ['ded'],
  ending: ['ending'],
  pathway: ['pathway'], pathways: ['pathway'], also_pathways: ['pathway'], beyonder_pfad: ['pathway'], pfad: ['pathway'], pid: ['pathway'], rivale: ['pathway'], viertel: ['pathway'], verdau_probe: ['pathway'],
  faction: ['faction'], table: ['lootTable'],
};
/** Schlüssel, deren Objekt-Schlüssel Gegenstands-IDs sind. */
const ITEM_MAP_KEYS = new Set(['gives_items', 'takes_items', 'requires_item_counts']);
/** Ausgewiesene Datenvorräte ohne Laufzeitanschluss (z. B. Varrowmouth-Entwürfe) werden übersprungen. */
const VORRAT = /kein(e)? Laufzeit|nicht in loadContent|vor Einbau/i;
/** Felder, die das Spiel nicht auswertet: Paket CP liefert zu Ritualen nur Texte (Karte/Kampf baut seqHoch.js selbst). */
const IGNORIERT = /^halbgott\.(rituale\.[^.]+\.map|encounters\.)/;

export function pruefeVerweise(content) {
  const reg = {
    item: content.items, npc: content.npcs, quest: content.quests, encounter: content.encounters, dialogue: content.dialogues,
    map: content.maps, clue: content.clues, fact: content.facts, ending: content.endings, pathway: content.pathways,
    faction: content.factions, zone: content.zones, lootTable: content.lootTables,
    ded: Object.fromEntries((content.deductions ?? []).map((d) => [d.id, d])),
  };
  const fehler = [];
  const melde = (path, kind, id, info) => IGNORIERT.test(path) || fehler.push({ path, kind, id, ...(info ? { info } : {}) });
  const has = (kinds, id) => kinds.some((k) => reg[k]?.[id] !== undefined);
  const check = (path, kinds, id) => { if (typeof id === 'string' && id && !has(kinds, id)) melde(path, kinds.join('|'), id); };
  let uebersprungen = 0;

  const walk = (o, path) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${path}[${i}]`));
    if (!o || typeof o !== 'object') return;
    if ([o.integration, o.status].some((s) => typeof s === 'string' && VORRAT.test(s))) { uebersprungen++; return; }
    for (const [k, v] of Object.entries(o)) {
      const p = `${path}.${k}`;
      const kinds = KEY_KINDS[k];
      if (kinds) {
        if (typeof v === 'string') check(p, kinds, v);
        else if (Array.isArray(v)) v.forEach((x, i) => check(`${p}[${i}]`, kinds, x));
      }
      if (ITEM_MAP_KEYS.has(k) && v && typeof v === 'object' && !Array.isArray(v)) for (const id of Object.keys(v)) check(`${p}.${id}`, ['item'], id);
      if (k === 'sprite' && typeof v === 'string' && v.startsWith('npc:')) check(p, ['npc'], v.slice(4));
      walk(v, p);
    }
  };
  for (const [k, v] of Object.entries(content)) walk(v, k);

  // Dialogknoten: Start und jedes "next" müssen im selben Baum stehen.
  for (const [id, tree] of Object.entries(content.dialogues)) {
    const node = (p, n) => { if (n && !tree.nodes?.[n]) melde(p, 'dialogknoten', n, id); };
    if (typeof tree.start === 'string') node(`dialogues.${id}.start`, tree.start);
    else (tree.start ?? []).forEach((s, i) => node(`dialogues.${id}.start[${i}]`, s.node));
    for (const [nid, n] of Object.entries(tree.nodes ?? {})) (n.choices ?? []).forEach((ch, i) => {
      const p = `dialogues.${id}.nodes.${nid}.choices[${i}].next`;
      if (typeof ch.next === 'string') node(p, ch.next);
      else if (Array.isArray(ch.next)) ch.next.forEach((x, j) => node(`${p}[${j}]`, x.node));
    });
  }

  // Karten: Figuren aus campaign, Türen/Reisen mit Ziel-Spawn.
  const spawn = (p, map, sp) => { if (sp && content.maps[map] && content.maps[map].spawns?.[sp] === undefined) melde(p, 'spawn', `${map}/${sp}`); };
  for (const [mid, m] of Object.entries(content.maps)) {
    (m.npcs ?? []).forEach((n, i) => check(`maps.${mid}.npcs[${i}].id`, ['npc'], n.id));
    (m.interactables ?? []).forEach((it, i) => { if (it.kind === 'door') spawn(`maps.${mid}.interactables[${i}]`, it.to, it.spawn); });
  }
  (content.travel ?? []).forEach((t, i) => spawn(`travel[${i}]`, t.map, t.spawn));
  for (const [id, e] of Object.entries(content.encounters)) if (e.lose_to) spawn(`encounters.${id}.lose_to`, e.lose_to.map, e.lose_to.spawn);
  for (const [id, n] of Object.entries(content.npcs)) if (n.dialogue) check(`npcs.${id}.dialogue`, ['dialogue'], n.dialogue);

  return { fehler, uebersprungen };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { loadContent } = await import('../tests/helpers.js');
  const { fehler, uebersprungen } = pruefeVerweise(loadContent());
  const nachArt = {};
  for (const f of fehler) (nachArt[f.kind] ??= []).push(f);
  console.log(`Kaputte Verweise: ${fehler.length} (übersprungene Datenvorräte: ${uebersprungen})`);
  for (const [k, l] of Object.entries(nachArt)) {
    console.log(`\n${k}: ${l.length}`);
    for (const f of l) console.log(`  ${f.path} -> ${f.id}${f.info ? ` (${f.info})` : ''}`);
  }
  process.exitCode = fehler.length ? 1 : 0;
}
