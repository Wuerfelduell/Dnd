// Fügt alle Inhaltsdateien zu einem Objekt zusammen (ohne JSON-Imports, damit Node-Tests es nutzen können).
// Hinweise, Informationen, Schlussfolgerungen und Dialoge teilen sich jeweils einen Namensraum über alle Fälle.
export function buildContent({ campaign, quests, cases, maps, dialogues }) {
  const merge = (list, key) => Object.assign({}, ...list.map((x) => x[key] ?? {}));
  return {
    ...campaign,
    quests,
    facts: merge(cases, 'facts'),
    clues: merge(cases, 'clues'),
    endings: merge(cases, 'endings'),
    deductions: cases.flatMap((c) => c.deductions ?? []),
    maps: Object.fromEntries(maps.map((m) => [m.id, m])),
    dialogues: Object.assign({}, ...dialogues),
  };
}

