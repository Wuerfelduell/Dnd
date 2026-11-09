// Fügt alle Inhaltsdateien zu einem Objekt zusammen (ohne JSON-Imports, damit Node-Tests es nutzen können).
// Hinweise, Informationen, Schlussfolgerungen und Dialoge teilen sich jeweils einen Namensraum über alle Fälle.
export function buildContent({ campaign, quests, cases, maps, dialogues, items = {}, encounters = {}, pathways = null, market = null, travel = null, wilds = null }) {
  const merge = (list, key) => Object.assign({}, ...list.map((x) => x[key] ?? {}));
  const wild = wildContent(wilds);
  return {
    ...campaign,
    npcs: { ...campaign.npcs, ...(market?.npcs ?? {}) },
    travel: [...(campaign.travel ?? []), ...(market?.travel ?? []), ...wild.travel],
    quests,
    items: { ...items, ...(pathways?.items ?? {}), ...pathwayItems(pathways?.pathways ?? {}), ...wild.items },
    encounters: { ...encounters, ...(market?.encounters ?? {}), ...(travel?.encounters ?? {}), ...wild.encounters },
    travelRules: travel,
    pathways: pathways?.pathways ?? {},
    market,
    loot: { ...(market?.loot ?? {}), ...wild.loot },
    zones: wild.zones,
    lootTables: wild.lootTables,
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

/**
 * Gefahrengebiete (wilds.json): Gegner bekommen die Daten ihres Gebiets (Niederlage, Raub),
 * und zu jedem normalen Gegner entsteht eine Elite-Variante `<id>_elite`:
 * mehr Leben, härtere Schläge, doppelte Drop-Chancen, doppeltes Geld und ein Bonus-Drop.
 */
function wildContent(wilds) {
  const out = { zones: {}, encounters: {}, loot: {}, items: {}, travel: [], lootTables: {} };
  if (!wilds) return out;
  Object.assign(out.items, wilds.items ?? {});
  for (const [zid, z] of Object.entries(wilds.zones ?? {})) {
    out.zones[zid] = z;
    Object.assign(out.lootTables, z.loot_tables ?? {});
    if (z.travel) out.travel.push({ map: zid, spawn: 'default', ...z.travel });
    for (const [id, e] of Object.entries(z.encounters ?? {})) {
      const { loot, elite, ...enc } = e;
      const base = {
        fleeable: !e.boss, occult: true, wild: true, zone: zid, lose_to: z.lose_to, lose_money: z.lose_money,
        lose_text: z.lose_text, flee_text: z.flee_text, ...enc,
      };
      out.encounters[id] = base;
      out.loot[id] = { repeat: true, ...loot };
      if (!elite) continue;
      const mult = elite.dmg_mult ?? 1.3;
      out.encounters[`${id}_elite`] = {
        ...base,
        name: elite.name,
        elite: true,
        hp: Math.round(base.hp * (elite.hp_mult ?? 1.5)),
        intro: elite.intro ?? base.intro,
        attacks: base.attacks.map((a) => ({ ...a, damage: Math.round(a.damage * mult) })),
        weak_if: undefined,
      };
      out.loot[`${id}_elite`] = {
        repeat: true,
        money: Array.isArray(loot?.money) ? loot.money.map((m) => m * 2) : (loot?.money ?? 0) * 2,
        drops: [...(loot?.drops ?? []).map((d) => ({ ...d, chance: Math.min(1, (d.chance ?? 1) * 2) })), ...(z.elite_drops ?? [])],
      };
    }
  }
  return out;
}
