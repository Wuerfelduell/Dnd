import { journalQuestVisible } from './journal.js';
// Wegweiser für das Journal: Wohin muss ich für den nächsten Schritt eines Auftrags?
// Die Ziele werden aus den Daten abgeleitet: Welche Person oder welches Objekt gibt den
// fehlenden Hinweis oder setzt die fehlende Markierung? Ein Schritt kann das mit
// `target: { map, id, label? }` auch selbst festlegen.

import { knowledgeGaps, gapText, onlyKnowledgeMissing, nextDeduction, factGap } from './hints.js';

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
  // Gesprächsknoten merken sich, über welchen Knoten sie etwas geben (für die Erklärung, warum eine Figur blockiert);
  // ein Ende wirkt wie ein Knoten mit den Effekten des Endes.
  const walkDialogue = (dlgId, src) => {
    const tree = content.dialogues[dlgId];
    if (!tree) return;
    for (const [nodeId, node] of Object.entries(tree.nodes ?? {})) {
      const at = { ...src, dialogue: dlgId, node: nodeId };
      addEffects(node, at);
      if (node.ending) addEffects(content.endings?.[node.ending], at);
    }
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
    // Gegner auf der Karte (Gefahrengebiete, Stadtgegner, Kopfgeld-Ziele)
    for (const def of map.roamers ?? []) {
      const enc = content.encounters[def.encounter];
      add('flag', `won_${def.encounter}`, { map: mapId, id: def.encounter, kind: 'combat', name: enc?.name ?? def.encounter, def });
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

/**
 * Wegweiser zu einer Person: alle Karten, auf denen die Figur stehen kann, mit dem Bezirk auf der Stadtkarte.
 * Eine Figur kann je nach Lage an mehreren Orten sein (Greta am Altmarkt oder in Ashgrove, Kit je nach Auftrag);
 * `now` sagt, ob die Figur dort gerade anzutreffen ist (Sichtbedingung erfüllt), sonst nur unter anderen Umständen.
 * Ergebnis: [{ map, mapName, district, districtName, city, now, locked? }], aktuelle Orte zuerst.
 */
export function personPlaces(state, npcId) {
  const c = state.content;
  const out = [];
  for (const [mapId, map] of Object.entries(c.maps)) {
    const defs = (map.npcs ?? []).filter((n) => n.id === npcId);
    if (!defs.length) continue;
    const now = defs.some((d) => state.meets(d.visible_if));
    const district = districtOf(c, mapId);
    const locked = district && district !== state.map ? lockedDistrict(state, district) : null;
    const districtName = c.travel.find((t) => t.map === district)?.name ?? c.maps[district]?.name ?? null;
    out.push({ map: mapId, mapName: map.name ?? mapId, district, districtName, city: map.city ?? 'kettlegate', now, ...(locked ? { locked } : {}) });
  }
  return out.sort((a, b) => Number(b.now) - Number(a.now) || a.mapName.localeCompare(b.mapName));
}

/**
 * Ist der Bezirk auf der Stadtkarte noch gesperrt? Dann { name, how } mit einem Hinweis,
 * wer ihn freischaltet (falls die Daten das verraten), sonst null.
 */
export function lockedDistrict(state, district) {
  const c = state.content;
  const t = c.travel.find((x) => x.map === district);
  if (!t || state.meets(t)) return null;
  const idx = guideIndex(c);
  const missing = (t.requires_flags ?? []).filter((f) => !state.flags.has(f));
  const src = missing.flatMap((f) => idx.flag[f] ?? []).find((x) => x.map !== district);
  const how = src ? `freischalten über ${src.name}` : 'wird im Lauf der Fälle frei';
  return { name: t.name, how };
}

/**
 * Welche Bedingungen stehen auf dem Weg vom Gesprächsanfang zu einem Knoten? Sucht den Pfad mit den wenigsten
 * gerade unerfüllten Bedingungen (Startvarianten, Optionen, Folgevarianten) und gibt diese unerfüllten zurück.
 * So lässt sich erklären, warum Marlowe einen Fall noch nicht abschließt: z. B. `requires_certain` auf dem Weg zum Ende.
 */
export function dialogueGate(state, dialogueId, nodeId) {
  const tree = state.content.dialogues[dialogueId];
  if (!tree?.nodes?.[nodeId]) return [];
  const cost = (cond) => (state.meets(cond) ? 0 : 1);
  const best = {}; // node → { cost, unmet }
  const queue = [];
  const push = (node, c, unmet) => {
    if (!tree.nodes[node] || (best[node] && best[node].cost <= c)) return;
    best[node] = { cost: c, unmet };
    queue.push(node);
  };
  const starts = Array.isArray(tree.start) ? tree.start : [{ node: tree.start }];
  for (const v of starts) push(v.node, cost(v), cost(v) ? [v] : []);
  while (queue.length) {
    queue.sort((a, b) => best[a].cost - best[b].cost);
    const cur = queue.shift();
    const { cost: c0, unmet } = best[cur];
    for (const ch of tree.nodes[cur].choices ?? []) {
      const c1 = c0 + cost(ch);
      const u1 = cost(ch) ? [...unmet, ch] : unmet;
      if (typeof ch.next === 'string') push(ch.next, c1, u1);
      else if (Array.isArray(ch.next)) for (const v of ch.next) push(v.node, c1 + cost(v), cost(v) ? [...u1, v] : u1);
    }
  }
  return best[nodeId]?.unmet ?? [];
}

/**
 * Warum gibt eine Figur den Baustein noch nicht her? Wissenslücken auf dem Weg zum Knoten
 * (fehlende Quellen, offene Verknüpfungen) als [{ text, clues, notebook }], sonst [].
 */
export function sourceBlockers(state, src) {
  if (!src?.dialogue || !src.node) return [];
  const gaps = dialogueGate(state, src.dialogue, src.node).flatMap((cond) => knowledgeGaps(state, cond));
  const seen = new Set();
  return gaps.filter((g) => { const k = g.deduction?.id ?? g.weak.map((w) => w.fact).join('+'); if (seen.has(k)) return false; seen.add(k); return true; })
    .map((g) => ({ text: gapText(g), clues: g.weak.flatMap((w) => w.missing), notebook: g.combinable, gap: g }));
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
    if (!state.hasConclusion(d)) {
      // Erst verknüpfen, wenn beide Informationen eines Paares bekannt sind; sonst fehlen noch Quellen
      const ded = c.deductions.find((x) => x.id === d);
      const known = (f) => !['unknown', 'refuted'].includes(state.factStatus(f));
      const pairs = (ded?.pairs ?? []).filter((p) => !p.some((f) => state.factStatus(f) === 'refuted'));
      if (pairs.some((p) => p.every(known))) { out.notebook ??= 'Im Notizbuch zwei Informationen verknüpfen'; continue; }
      const bestPair = [...pairs].sort((a, b) => b.filter(known).length - a.filter(known).length)[0] ?? [];
      for (const f of bestPair) if (!known(f)) out.clues.push(...factClues(f));
      if (!bestPair.length) out.notebook ??= 'Im Notizbuch zwei Informationen verknüpfen';
      continue;
    }
    if ((done.requires_certain ?? []).includes(d) && !state.isCertain(d)) {
      const ded = c.deductions.find((x) => x.id === d);
      for (const f of (ded?.pairs ?? []).flat()) if (state.factStatus(f) !== 'likely') out.clues.push(...factClues(f));
    }
  }
  return out;
}

/** Ziel mit Ort, Ortsname, Bezirk und Sperrhinweis anreichern. */
function finishTarget(state, base, src) {
  const c = state.content;
  const district = districtOf(c, src.map);
  const locked = district && district !== state.map ? lockedDistrict(state, district) : null;
  return {
    ...base, map: src.map, id: src.id, name: src.label ?? src.name,
    mapName: c.maps[src.map]?.name ?? src.map, district, ...(locked ? { locked } : {}),
  };
}

/** Festes Ziel ({ map, id, label? }) um den sichtbaren Namen ergänzen. */
function namedTarget(c, target) {
  const def = [...(c.maps[target.map]?.npcs ?? []), ...(c.maps[target.map]?.interactables ?? [])].find((x) => x.id === target.id);
  return { ...target, name: target.label ?? c.npcs[target.id]?.name ?? def?.prompt ?? target.id };
}

/**
 * Ziel für eine offene Spur (GameState.openLeads): ein Auftrag, der noch abgeholt werden muss.
 * Gleiche Form wie questTarget, damit HUD, Journal und Stadtkarte sie genauso zeigen können.
 */
export function leadTarget(state, lead) {
  if (!lead?.target) return null;
  return finishTarget(state, { quest: lead.quest, step: lead.text, lead: true }, namedTarget(state.content, lead.target));
}

/**
 * Ziel für den nächsten offenen Schritt eines Auftrags.
 * Ergebnis: { quest, step, map, id, name, mapName, district, notebook? } oder null.
 */
export function questTarget(state, questId) {
  const c = state.content;
  const q = c.quests[questId];
  if (!q || state.quests[questId] !== 'active' || !journalQuestVisible(state, questId)) return null;
  const step = (q.steps ?? []).find((s) => !state.meets(s.done));
  if (!step) return null;
  const base = { quest: questId, step: step.text };
  const finish = (src) => finishTarget(state, base, src);
  if (step.target) return finish(namedTarget(c, step.target));
  const idx = guideIndex(c);
  const n = needs(state, step.done);
  const srcs = [
    ...n.clues.flatMap((id) => idx.clue[id] ?? []),
    ...n.flags.flatMap((id) => idx.flag[id] ?? []),
    ...n.items.flatMap((id) => idx.item[id] ?? []),
  ];
  const visible = (s) => state.meets(s.def.visible_if);
  // Ein Ende mit schlechtem Ausgang (negatives Ansehen) ist kein Ziel; das beste Ende steht vorn
  const honorOf = (s) => (s.node ? c.endings?.[c.dialogues[s.dialogue]?.nodes?.[s.node]?.ending]?.honor : undefined);
  const rank = (s) => (visible(s) ? 0 : 2) + (s.map === state.map ? 0 : 1) + ((honorOf(s) ?? 0) < 0 ? 10 : 0) - Math.min(9, Math.max(0, honorOf(s) ?? 0)) / 10;
  const sorted = [...srcs].sort((a, b) => rank(a) - rank(b));
  const best = sorted[0];
  if (best) {
    // Blockiert die Figur, weil Wissen fehlt (z. B. „zweite Quelle“)? Dann zeigt der Wegweiser auf die fehlende Quelle.
    const blockers = sourceBlockers(state, best);
    if (blockers.length) {
      // Geht es auch jetzt schon, nur mit schlechterem Ausgang? Dann sagt der Wegweiser das dazu.
      const easier = sorted.some((s) => s !== best && (honorOf(s) ?? 0) > 0 && !sourceBlockers(state, s).length);
      const shown = blockers.slice(0, 2).map((b) => b.text).join(' ');
      const because = `${best.name} braucht ${easier ? 'für den besten Ausgang ' : ''}erst: ${shown}${blockers.length > 2 ? ` (und ${blockers.length - 2} weitere Lücken, siehe Notizbuch)` : ''}`;
      const clueSrcs = blockers.flatMap((b) => b.clues).flatMap((id) => idx.clue[id] ?? []).filter((x) => !(x.map === best.map && x.id === best.id));
      const sub = [...clueSrcs].sort((a, b) => rank(a) - rank(b))[0];
      // Nur das Gebiet verraten, nicht den Fleck: ohne `id` gibt es in der Welt keine Markierung, nur den Weg zum Ort
      if (sub) {
        const t = finish(sub);
        return { ...t, id: c.npcs[sub.id] ? t.id : null, name: c.npcs[sub.id] ? t.name : 'Genauer umsehen', vague: !c.npcs[sub.id], because, via: best.name };
      }
      if (blockers.some((b) => b.notebook)) return { ...base, notebook: 'Im Notizbuch zwei Informationen verknüpfen', because };
      return { ...finish(best), because };
    }
    return finish(best);
  }
  if (n.notebook) return { ...base, notebook: n.notebook };
  return null;
}

/**
 * Rat der Inspektorin („Haben Sie einen Rat?“): konkrete Sätze in ihrer Stimme, wo man nachsehen und wen man
 * fragen soll. Für jeden offenen Hauptfall (der verfolgte zuerst): der nächste Schritt mit Ort oder Person,
 * was sie selbst noch braucht (zweite Quelle), welche Information noch schwach ist und welches Paar zu verknüpfen ist.
 * Danach offene Spuren und zuletzt Nebenaufträge. `speaker` ist die sprechende Figur (ihr eigener Name wird zu „ich“).
 */
export function advice(state, speaker = null) {
  const c = state.content;
  const me = c.npcs?.[speaker]?.name;
  const own = (text) => (me && text.startsWith(`${me} braucht `) ? text.replace(`${me} braucht `, 'Ich brauche ') : text);
  const q = (t) => `„${t}“`;
  const place = (t) => {
    const where = t.map === state.map ? 'gleich hier' : t.map === t.district ? `im ${t.mapName}`.replace('im Polizeirevier', 'hier im Revier') : `im ${t.mapName} (${c.maps[t.district]?.name ?? t.mapName})`;
    return t.locked ? `${where}. ${t.locked.name} ist noch gesperrt: ${t.locked.how}` : where;
  };
  const goTo = (t) => (c.npcs[t.id] ? `Fragen Sie ${t.name}, ${place(t)}.` : `Sehen Sie sich ${place(t)} genauer um.`);
  const lines = [];
  const active = Object.keys(state.quests).filter((id) => state.quests[id] === 'active' && journalQuestVisible(state, id));
  const mains = active.filter((id) => c.quests[id].kind === 'main').sort((a, b) => (a === state.tracked ? -1 : 0) - (b === state.tracked ? -1 : 0));
  for (const id of mains) {
    const quest = c.quests[id];
    const t = questTarget(state, id);
    if (!t) continue;
    let line = `${quest.title.replace(/^Fall (\d+):/, 'Fall $1,')}, als Nächstes: ${q(t.step)}.`;
    // Ein Paar, das sich schon verknüpfen lässt (beide Informationen bekannt, nichts widerlegt)
    const known = (f) => !['unknown', 'refuted'].includes(state.factStatus(f));
    const pair = c.deductions.filter((d) => d.case === quest.case && d.honor !== 0 && !state.hasConclusion(d.id)).flatMap((d) => d.pairs).find((p) => p.every(known));
    if (t.because) line += ` ${own(t.because)}`;
    else if (t.notebook) line += pair ? ` Das klären Sie in Ihrem Notizbuch: Verknüpfen Sie ${q(state.fact(pair[0]).text)} mit ${q(state.fact(pair[1]).text)}.` : ' Das klären Sie in Ihrem Notizbuch: Zwei Ihrer Informationen gehören zusammen.';
    else if (t.id === speaker) line += ' Dafür sind Sie bei mir richtig.';
    else line += ` ${goTo(t)}`;
    lines.push(line);
    // Die nächste offene Schlussfolgerung: schwache Information und ihr Fundort, oder das Paar zum Verknüpfen
    if (!t.because && !t.notebook && quest.case && quest.case !== 'side') {
      const d = nextDeduction(state, quest.case);
      if (d) {
        const weakIdx = d.status.findIndex((x) => x !== 'likely');
        if (weakIdx < 0) lines.push(`Verknüpfen Sie ${q(state.fact(d.pair[0]).text)} mit ${q(state.fact(d.pair[1]).text)}. Das trägt.`);
        else {
          const g = factGap(state, d.pair[weakIdx]);
          const where = g.where.slice(0, 2).join('; ');
          if (g.status === 'unknown') lines.push(`Zu ${q(g.text)} haben Sie noch nichts in der Hand.${where ? ` Versuchen Sie es hier: ${where}.` : ' Reden Sie mit den Leuten des Falls und sehen Sie sich die Orte genau an.'}`);
          else lines.push(`${q(g.text)} steht erst auf einer Quelle. ${where ? `Eine zweite: ${where}.` : 'Eine zweite finden Sie bei Leuten und an Orten, die Sie noch nicht ganz ausgeschöpft haben.'}`);
        }
      } else if (c.deductions.some((x) => x.case === quest.case && x.honor !== 0 && !state.isCertain(x.id))) {
        lines.push('Ihre Spur ist widerlegt. Suchen Sie eine andere Erklärung, und sichern Sie sie mit zwei Quellen ab.');
      }
    }
  }
  // Offene Spuren (z. B. Nan Kettle am Nachtmarkt): wer hat nach einem gefragt, und wo steht er
  for (const lead of state.openLeads()) {
    const t = leadTarget(state, lead);
    lines.push(t ? `Und ${t.name} hat nach Ihnen gefragt, ${place(t)}. Es geht um ${q(c.quests[lead.quest].title.replace(/^Fall \d+: /, ''))}.` : `Und noch etwas: ${lead.text}`);
  }
  if (!lines.length) {
    const side = active.find((id) => c.quests[id].kind !== 'main');
    const t = side ? questTarget(state, side) : null;
    if (t) lines.push(`Kein Fall auf dem Tisch. Aber ${c.quests[side].title}: ${t.step}.${t.notebook ? '' : ` ${goTo(t)}`}`);
    else lines.push('Im Moment liegt nichts an. Genießen Sie die Ruhe, solange sie dauert.');
  }
  return lines;
}
