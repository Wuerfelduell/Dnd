// Gestufte Tipps im Notizbuch: Was fehlt noch für die nächste Schlussfolgerung eines Falls?
// Stufe 1 sagt grob, woran es hakt; Stufe 2 nennt die schwache Information und wo es eine
// weitere Quelle gibt; Stufe 3 nennt das Paar, das verknüpft werden muss.

const SCORE = { likely: 2, suspected: 1, unknown: 0 };

/**
 * Wo man einen Hinweis bekommt: { clueId: [{ text, when: [bedingungen…] }] } (Gespräche, Kartenobjekte, Kämpfe).
 * "when" sind Bedingungsobjekte, die alle erfüllt sein müssen (Sichtbarkeit der Figur, Sperren, Dialogoption).
 * Wird pro Inhalt gecacht.
 */
const originCache = new WeakMap();
export function clueOrigins(content) {
  if (originCache.has(content)) return originCache.get(content);
  const out = {};
  const add = (clue, text, when = [], via = null) => { (out[clue] ??= []).push({ text, when: when.filter(Boolean), via }); };
  const maps = Object.values(content.maps ?? {});
  // Dialog → wer ihn spricht, wo und wann
  const speakers = {};
  for (const m of maps) {
    for (const n of m.npcs ?? []) {
      const npc = content.npcs?.[n.id];
      const dlg = n.dialogue ?? npc?.dialogue;
      if (dlg && npc) (speakers[dlg] ??= []).push({ text: `Sprich mit ${npc.name} (${m.name})`, when: [n.visible_if] });
    }
    for (const i of m.interactables ?? []) {
      const when = [i.visible_if, i.lock];
      if (i.dialogue) (speakers[i.dialogue] ??= []).push({ text: `${i.prompt ?? i.title ?? 'Untersuchen'} (${m.name})`, when });
      const clues = [i.clue, ...(i.effects?.gives_clues ?? [])].filter(Boolean);
      for (const c of clues) add(c, `${i.prompt ?? i.title ?? 'Sieh dich genau um'} (${m.name})`, when);
    }
  }
  for (const [dlg, tree] of Object.entries(content.dialogues ?? {})) {
    const who = speakers[dlg] ?? [];
    for (const [nid, node] of Object.entries(tree.nodes ?? {})) {
      for (const c of node.gives_clues ?? []) for (const w of who) add(c, w.text, w.when, { dialogue: dlg, node: nid });
    }
  }
  for (const e of Object.values(content.encounters ?? {})) {
    for (const k of ['on_win', 'first_win']) for (const c of e[k]?.gives_clues ?? []) add(c, `Besiege ${e.name}`);
  }
  originCache.set(content, out);
  return out;
}

/** Knoten eines Dialogs, die man im aktuellen Zustand erreichen kann (ab dem gewählten Start, über erfüllte Optionen). */
export function reachableNodes(state, dialogueId) {
  const tree = state.content.dialogues[dialogueId];
  const seen = new Set();
  const queue = [state.pick(tree.start)];
  while (queue.length) {
    const id = queue.shift();
    if (!id || seen.has(id) || !tree.nodes[id]) continue;
    seen.add(id);
    for (const ch of tree.nodes[id].choices ?? []) {
      if (!state.meets(ch)) continue;
      if (typeof ch.next === 'string') queue.push(ch.next);
      else if (Array.isArray(ch.next)) ch.next.filter((v) => state.meets(v)).forEach((v) => queue.push(v.node));
    }
  }
  return seen;
}

/** Ist ein Fundort gerade erreichbar? Figur/Objekt sichtbar und nicht gesperrt, Gesprächsknoten erreichbar. */
export function originOpen(state, o) {
  if (!o.when.every((c) => state.meets(c))) return false;
  return !o.via || reachableNodes(state, o.via.dialogue).has(o.via.node);
}

/** Die nächste offene Schlussfolgerung und das vielversprechendste Paar dafür. */
export function nextDeduction(state, caseId) {
  const open = state.content.deductions.filter((d) => d.case === caseId && d.honor !== 0 && !state.isCertain(d.id));
  let best = null;
  for (const d of open) {
    for (const pair of d.pairs) {
      const st = pair.map((f) => state.factStatus(f));
      if (st.includes('refuted')) continue;
      const score = st.reduce((s, x) => s + SCORE[x], 0) + (state.hasConclusion(d.id) ? 0.5 : 0);
      if (!best || score > best.score) best = { deduction: d, pair, status: st, score };
    }
  }
  return best;
}

/** Tipps für einen Fall, Stufe 1 bis 3. Gibt { key, lines } zurück; key wechselt, wenn sich das Ziel ändert. */
export function caseHints(state, caseId, level = 1) {
  const t = nextDeduction(state, caseId);
  if (!t) {
    const open = state.content.deductions.some((d) => d.case === caseId && d.honor !== 0 && !state.isCertain(d.id));
    return open
      ? { key: 'stuck', lines: ['Deine Spur ist widerlegt. Such nach einer anderen Erklärung und weiteren Quellen.'] }
      : { key: 'done', lines: ['Alle Schlussfolgerungen sind gesichert. Zeit für die Auflösung.'] };
  }
  const { deduction: d, pair, status } = t;
  const fact = (f) => `„${state.fact(f).text}“`;
  const weakIdx = status.findIndex((s) => s !== 'likely');
  const weak = weakIdx >= 0 ? pair[weakIdx] : null;
  const key = `${d.id}:${pair.join('+')}:${status.join('+')}`;
  const lines = [];
  // Stufe 1
  if (!weak) lines.push(state.hasConclusion(d.id) ? 'Alles Nötige liegt vor.' : 'Zwei deiner sehr wahrscheinlichen Informationen gehören zusammen. Wähle sie aus und verknüpfe sie.');
  else if (status[weakIdx] === 'suspected') lines.push('Eine Vermutung braucht noch eine zweite Quelle, bevor die Schlussfolgerung hält.');
  else lines.push('Dir fehlt noch eine Information. Sprich mit den Leuten und untersuche die Orte des Falls.');
  if (level < 2) return { key, lines };
  // Stufe 2
  if (!weak) lines.push(`Eine davon: ${fact(pair[0])}.`);
  else {
    const missing = Object.entries(state.content.clues).filter(([id, c]) => c.fact === weak && !state.hasClue(id)).map(([id]) => id);
    const origins = clueOrigins(state.content);
    const where = [...new Set(missing.flatMap((c) => (origins[c] ?? []).filter((o) => originOpen(state, o)).map((o) => o.text)))].slice(0, 3);
    if (status[weakIdx] === 'suspected') lines.push(`${fact(weak)} ist erst eine Vermutung (1 Quelle).`);
    lines.push(where.length ? `Eine weitere Quelle: ${where.join('; ')}.` : 'Achte auf Orte und Gespräche, die du noch nicht ganz ausgeschöpft hast.');
  }
  if (level < 3) return { key, lines };
  // Stufe 3
  lines.push(`Verknüpfe ${fact(pair[0])} mit ${fact(pair[1])}.`);
  return { key, lines };
}
