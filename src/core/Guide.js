// Wegweiser für das Journal: Wohin muss ich für den nächsten Schritt eines Auftrags?
// Die Ziele werden aus den Daten abgeleitet: Welche Person oder welches Objekt gibt den
// fehlenden Hinweis oder setzt die fehlende Markierung? Ein Schritt kann das mit
// `target: { map, id, label? }` auch selbst festlegen.

const indexCache = new WeakMap();

/** Index: Hinweis/Markierung/Gegenstand → Quellen [{ map, id, kind, name, def }]. */
export function guideIndex(content) {
  if (indexCache.has(content)) return indexCache.get(content);
  const idx = { clue: {}, flag: {}, item: {} };
  const add = (type, key, src) => { (idx[type][key] ??= []).push(src); };
  const addEffects = (e, src) => {
    if (!e) return;
    for (const c of e.gives_clues ?? []) add('clue', c, src);
    for (const f of e.sets_flags ?? []) add('flag', f, src);
    for (const i of Object.keys(e.gives_items ?? {})) add('item', i, src);
  };
  const walkDialogue = (dlgId, src) => {
    const tree = content.dialogues[dlgId];
    if (!tree) return;
    for (const node of Object.values(tree.nodes ?? {})) addEffects(node, src);
  };
  for (const [mapId, map] of Object.entries(content.maps)) {
    for (const def of map.npcs ?? []) {
      const npc = content.npcs[def.id];
      if (!npc) continue;
      walkDialogue(def.dialogue ?? npc.dialogue, { map: mapId, id: def.id, kind: 'npc', name: npc.name, def });
    }
    for (const def of map.interactables ?? []) {
      const src = { map: mapId, id: def.id, kind: def.kind ?? 'clue', name: def.title ?? def.prompt ?? def.id, def };
      if (def.clue) add('clue', def.clue, src);
      if (def.done_flag) add('flag', def.done_flag, src);
      addEffects(def.effects, src);
      if (def.kind === 'dialogue') walkDialogue(def.dialogue, src);
      if (def.kind === 'combat') {
        const enc = content.encounters[def.encounter];
        add('flag', `won_${def.encounter}`, src);
        addEffects(enc?.on_win, src);
        addEffects(enc?.first_win, src);
      }
    }
  }
  indexCache.set(content, idx);
  return idx;
}

/** Ortsnetz: Türen und Stadtkarte. Liefert für jede Karte die Nachbarn mit dem Objekt, das dorthin führt. */
function graph(content) {
  const travelMaps = content.travel.map((t) => t.map);
  const g = {};
  for (const [mapId, map] of Object.entries(content.maps)) {
    g[mapId] = [];
    for (const def of map.interactables ?? []) {
      if (def.kind === 'door' && def.to) g[mapId].push({ to: def.to, via: def.id });
      if (def.kind === 'travel') for (const t of travelMaps) if (t !== mapId) g[mapId].push({ to: t, via: def.id, travel: true });
    }
  }
  return g;
}

/** Erster Schritt von `from` nach `to`: { via, travel } oder null. */
export function nextHop(content, from, to) {
  if (from === to) return null;
  const g = graph(content);
  const prev = { [from]: null };
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    for (const e of g[cur] ?? []) {
      if (e.to in prev || !content.maps[e.to]) continue;
      prev[e.to] = { from: cur, edge: e };
      if (e.to === to) {
        let step = prev[to];
        while (step.from !== from) step = prev[step.from];
        return step.edge;
      }
      queue.push(e.to);
    }
  }
  return null;
}

/** Ziel auf der Stadtkarte: der Ort selbst oder der Bezirk, über dessen Tür man hineinkommt. */
export function districtOf(content, mapId) {
  const travelMaps = content.travel.map((t) => t.map);
  if (travelMaps.includes(mapId)) return mapId;
  for (const t of travelMaps) {
    const hop = nextHop(content, t, mapId);
    if (hop && !hop.travel) return t;
  }
  return null;
}

/** Fehlende Bausteine eines Schritts als Liste von Quellen-Suchen. */
function needs(state, done) {
  const c = state.content;
  const out = { clues: [], flags: [], items: [], notebook: null };
  for (const id of done.requires_clues ?? []) if (!state.hasClue(id)) out.clues.push(id);
  if (done.requires_any_clues && !done.requires_any_clues.some((id) => state.hasClue(id))) out.clues.push(...done.requires_any_clues);
  for (const f of done.requires_flags ?? []) if (!state.flags.has(f)) out.flags.push(f);
  for (const i of done.requires_items ?? []) if (state.itemCount(i) < 1) out.items.push(i);
  // Informationen absichern: fehlende Quellen zu einer Information suchen
  const factClues = (f) => Object.entries(c.clues).filter(([id, cl]) => cl.fact === f && !state.hasClue(id)).map(([id]) => id);
  for (const f of done.requires_likely ?? []) if (state.factStatus(f) !== 'likely') out.clues.push(...factClues(f));
  for (const d of [...(done.requires_conclusions ?? []), ...(done.requires_certain ?? [])]) {
    if (!state.hasConclusion(d)) { out.notebook ??= 'Im Notizbuch zwei Informationen verknüpfen'; continue; }
    if ((done.requires_certain ?? []).includes(d) && !state.isCertain(d)) {
      const ded = c.deductions.find((x) => x.id === d);
      for (const f of (ded?.pairs ?? []).flat()) if (state.factStatus(f) !== 'likely') out.clues.push(...factClues(f));
    }
  }
  return out;
}

/**
 * Ziel für den nächsten offenen Schritt eines Auftrags.
 * Ergebnis: { quest, step, map, id, name, mapName, district, notebook? } oder null.
 */
export function questTarget(state, questId) {
  const c = state.content;
  const q = c.quests[questId];
  if (!q || state.quests[questId] !== 'active') return null;
  const step = (q.steps ?? []).find((s) => !state.meets(s.done));
  if (!step) return null;
  const base = { quest: questId, step: step.text };
  const finish = (src) => ({
    ...base, map: src.map, id: src.id, name: src.label ?? src.name,
    mapName: c.maps[src.map]?.name ?? src.map, district: districtOf(c, src.map),
  });
  if (step.target) {
    const def = [...(c.maps[step.target.map]?.npcs ?? []), ...(c.maps[step.target.map]?.interactables ?? [])].find((x) => x.id === step.target.id);
    return finish({ ...step.target, name: step.target.label ?? c.npcs[step.target.id]?.name ?? def?.prompt ?? step.target.id });
  }
  const idx = guideIndex(c);
  const n = needs(state, step.done);
  const srcs = [
    ...n.clues.flatMap((id) => idx.clue[id] ?? []),
    ...n.flags.flatMap((id) => idx.flag[id] ?? []),
    ...n.items.flatMap((id) => idx.item[id] ?? []),
  ];
  const visible = (s) => state.meets(s.def.visible_if);
  const rank = (s) => (visible(s) ? 0 : 2) + (s.map === state.map ? 0 : 1);
  const best = [...srcs].sort((a, b) => rank(a) - rank(b))[0];
  if (best) return finish(best);
  if (n.notebook) return { ...base, notebook: n.notebook };
  return null;
}
