// Fügt alle Inhaltsdateien zu einem Objekt zusammen (ohne JSON-Imports, damit Node-Tests es nutzen können).
// Hinweise, Informationen, Schlussfolgerungen und Dialoge teilen sich jeweils einen Namensraum über alle Fälle.
export function buildContent({ campaign, quests, cases, maps, dialogues, items = {}, encounters = {}, pathways = null, market = null, travel = null }) {
  const merge = (list, key) => Object.assign({}, ...list.map((x) => x[key] ?? {}));
  return {
    ...campaign,
    npcs: { ...campaign.npcs, ...(market?.npcs ?? {}) },
    travel: [...(campaign.travel ?? []), ...(market?.travel ?? [])],
    quests,
    items: { ...items, ...(pathways?.items ?? {}), ...pathwayItems(pathways?.pathways ?? {}) },
    encounters: { ...encounters, ...(market?.encounters ?? {}), ...(travel?.encounters ?? {}) },
    travelRules: travel,
    pathways: pathways?.pathways ?? {},
    market,
    loot: market?.loot ?? {},
    facts: merge(cases, 'facts'),
    clues: merge(cases, 'clues'),
    endings: merge(cases, 'endings'),
    deductions: cases.flatMap((c) => c.deductions ?? []),
    maps: Object.fromEntries(maps.map((m) => [m.id, m])),
    dialogues: Object.assign({}, ...dialogues),
  };
}

/** Erzeugt für jede Sequenz eine Formel und einen Trank als Gegenstand. */
function pathwayItems(pathways) {
  const out = {};
  for (const [pid, p] of Object.entries(pathways)) {
    for (const [seqKey, sd] of Object.entries(p.seqs)) {
      const seq = Number(seqKey);
      const potion = `trank_${pid}_${seq}`;
      out[potion] = {
        name: `Trank: ${sd.name}`, kind: 'potion', pathway: pid, seq,
        desc: `${p.short}, Sequenz ${seq}. ${sd.desc}`,
      };
      out[`formel_${pid}_${seq}`] = {
        name: `Formel: ${sd.name}`, kind: 'formula', pathway: pid, seq, potion, ingredients: sd.ingredients,
        desc: `Sequenz ${seq} des ${p.name.replace('Pfad', 'Pfads')}. „${p.principle}“ Am Braukessel brauen.`,
      };
    }
  }
  return out;
}
