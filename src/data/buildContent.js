import { applyQuestPack } from './questPacks.js';
import { applyLore } from './lore.js';
import { withSequenzen, applySequenzen } from './sequenzen.js';
// Fügt alle Inhaltsdateien zu einem Objekt zusammen (ohne JSON-Imports, damit Node-Tests es nutzen können).
// Hinweise, Informationen, Schlussfolgerungen und Dialoge teilen sich jeweils einen Namensraum über alle Fälle.
// factions.json (Sekten) bringt eigene Figuren, Reiseziele, Gegner, Beute, Aufträge und Hinweise mit.
// gebaeude.json bringt betretbare Häuser mit: Innenräume, Türen in den Vierteln, Figuren, Händler, Dialoge.
// stadtgegner.json (Paket L) verteilt Stadtgegner als Streifen auf die Viertel und bringt Beute und Kopfgeld-Brett mit.
// treffen.json (geheime Treffen) bringt Zirkel, Treffpunkte, Gastgeber mit Händlern, Dialoge und Reiseziele mit.
// wexmoor.json (Kapitel 2) bringt die zweite Stadt mit: Karten mit `city: "wexmoor"`, eigene Reiseziele und -ereignisse, Figuren, Dialoge, Auftrag und Spuren.
export function buildContent({ campaign, quests, cases, maps, dialogues, items = {}, encounters = {}, pathways = null, market = null, travel = null, wilds = null, factions = null, buildings = null, gatherings = null, city = null, wexmoor = null, packs = [], lore = null, sequenzen = null }) {
  // Paket AF: neue Pfade, Zutaten und Artefakte gehören vor der Erzeugung der Trank-/Formel-Items dazu
  const sq = withSequenzen(pathways, sequenzen);
  pathways = sq.pathways;
  const merge = (list, key) => Object.assign({}, ...list.map((x) => x[key] ?? {}));
  const b = buildings ?? {};
  const g = gatherings ?? {};
  const wx = wexmoor ?? {};
  if (wx.case) cases = [...cases, wx.case];
  maps = withPlacements(withEntrances([...maps, ...(b.maps ?? []), ...(g.maps ?? []), ...(wx.maps ?? [])], b.entrances ?? []), g.placements ?? []);
  // Kapitel 2 bringt eigene Gefahrengebiete mit (Vergessmoor)
  const wild = wildContent(wexmoor?.zones ? { ...wilds, zones: { ...(wilds?.zones ?? {}), ...wexmoor.zones } } : wilds);
  const town = cityContent(city);
  maps = withCity(maps, city);
  const f = factions ?? {};
  if (f.facts || f.clues || f.deductions) cases = [...cases, { facts: f.facts, clues: f.clues, deductions: f.deductions }];
  const content = {
    ...campaign,
    npcs: { ...campaign.npcs, ...(market?.npcs ?? {}), ...(f.npcs ?? {}), ...(b.npcs ?? {}), ...(g.npcs ?? {}), ...(wx.npcs ?? {}) },
    travel: [...(campaign.travel ?? []), ...(market?.travel ?? []), ...wild.travel, ...(f.travel ?? []), ...(g.travel ?? []), ...(wx.travel ?? [])],
    quests: { ...quests, ...(f.quests ?? {}), ...(wx.quests ?? {}) },
    items: { ...items, ...(pathways?.items ?? {}), ...pathwayItems(pathways?.pathways ?? {}), ...artifactItems(pathways?.artifacts), ...wild.items, ...town.items, ...(f.items ?? {}), ...(wx.items ?? {}) },
    encounters: { ...encounters, ...(market?.encounters ?? {}), ...(travel?.encounters ?? {}), ...wild.encounters, ...town.encounters, ...(f.encounters ?? {}), ...(wx.encounters ?? {}) },
    travelRules: travel && {
      ...travel,
      pins: { ...travel.pins, ...(g.pins ?? {}) },
      events: [...(travel.events ?? []), ...(wx.events ?? [])],
      cities: { ...(travel.cities ?? {}), ...(wx.city ? { [wx.city.id]: wx.city } : {}) },
    },
    pathways: pathways?.pathways ?? {},
    market: market && { ...market, merchants: { ...market.merchants, ...(b.merchants ?? {}), ...(g.merchants ?? {}) }, sell_prices: { ...market.sell_prices, ...(f.sell_prices ?? {}) } },
    loot: { ...(market?.loot ?? {}), ...artifactDrops(wild.loot, wild.encounters, pathways?.artifacts), ...town.loot, ...(f.loot ?? {}), ...(wx.loot ?? {}) },
    artifacts: pathways?.artifacts ?? null,
    revierSupply: pathways?.revier_supply ?? null,
    ritualRules: pathways?.ritual_rules ?? null,
    zones: wild.zones,
    lootTables: wild.lootTables,
    factions: f.factions ?? {},
    gatherings: g.rules ? { rules: g.rules, circles: g.circles ?? {} } : null,
    police: wx.police ?? null,
    loners: wx.loners ?? null,
    facts: merge(cases, 'facts'),
    clues: merge(cases, 'clues'),
    endings: merge(cases, 'endings'),
    deductions: cases.flatMap((c) => c.deductions ?? []),
    maps: Object.fromEntries(maps.map((m) => [m.id, m])),
    dialogues: Object.assign({}, ...dialogues, b.dialogues ?? {}, g.dialogues ?? {}, wx.dialogues ?? {}),
  };
  // Nebenauftrags-Pakete (data/packs): eigene Aufträge, Zusatzoptionen und Platzierungen
  for (const pack of packs) applyQuestPack(content, pack);
  applyLore(content, lore); // Paket AD: Lesestücke, Itemtexte, Bestiarium, Zeitungen, Gerede
  applySequenzen(content, sequenzen, sq); // Paket AF: Händler, Treffen und Funde für die neuen Pfade
  return content;
}

/**
 * Hängt die Haustüren aus gebaeude.json an die Karten der Viertel: eine Tür ins Innere
 * und einen Spawn davor (benannt nach dem Innenraum), auf dem man beim Hinausgehen landet.
 */
function withEntrances(maps, entrances) {
  return maps.map((m) => {
    const own = entrances.filter((e) => e.map === m.id);
    if (!own.length) return m;
    return {
      ...m,
      spawns: { ...m.spawns, ...Object.fromEntries(own.map((e) => [e.to, e.out])) },
      interactables: [...(m.interactables ?? []), ...own.map((e) => ({
        id: e.id, kind: 'door', to: e.to, spawn: e.spawn ?? 'default', tile: e.tile, prompt: e.prompt, marker: false, reach: e.reach ?? 26,
        ...(e.lock ? { lock: e.lock } : {}),
      }))],
    };
  });
}

/** Stellt zusätzliche Figuren auf bestehende Karten (z. B. den Boten der geheimen Treffen). */
/** Stadtgegner: Streifen (roamers) und zusätzliche Objekte in die Viertel einsetzen, ohne die Kartendateien anzufassen. */
function withCity(maps, city) {
  if (!city) return maps;
  return maps.map((m) => {
    const roamers = city.roamers?.[m.id] ?? [];
    const extra = city.interactables?.[m.id] ?? [];
    if (!roamers.length && !extra.length) return m;
    return { ...m, roamers: [...(m.roamers ?? []), ...roamers], interactables: [...(m.interactables ?? []), ...extra] };
  });
}

/**
 * Stadtgegner (stadtgegner.json): wie die Gefahrengebiete mit Beute und Elite-Variante `<id>_elite`,
 * aber ohne Gebiet; wer verliert, wacht im Revier auf.
 */
function cityContent(city) {
  const out = { encounters: {}, loot: {}, items: {} };
  if (!city) return out;
  Object.assign(out.items, city.items ?? {});
  for (const [id, e] of Object.entries(city.encounters ?? {})) {
    const { loot, elite, ...enc } = e;
    const base = {
      sprite: 'wild', fleeable: !e.boss, city: true, lose_to: city.lose_to, lose_money: city.lose_money, lose_text: city.lose_text, flee_text: city.flee_text, ...enc,
    };
    out.encounters[id] = base;
    out.loot[id] = { repeat: !e.boss && !id.startsWith('kopfgeld_'), ...loot };
    if (!elite) continue;
    out.encounters[`${id}_elite`] = {
      ...base,
      name: elite.name,
      elite: true,
      hp: Math.round(base.hp * (city.elite_hp ?? 1.5)),
      attacks: base.attacks.map((a) => (a.damage ? { ...a, damage: Math.round(a.damage * (city.elite_dmg ?? 1.3)) } : a)),
    };
    out.loot[`${id}_elite`] = {
      repeat: true,
      money: (loot?.money ?? [0, 0]).map((m) => m * 2),
      drops: [...(loot?.drops ?? []).map((d) => ({ ...d, chance: Math.min(1, d.chance * 2) })), ...(city.elite_drops ?? [])],
    };
  }
  return out;
}

function withPlacements(maps, placements) {
  return maps.map((m) => {
    const own = placements.filter((p) => p.map === m.id);
    if (!own.length) return m;
    return { ...m, npcs: [...(m.npcs ?? []), ...own.filter((p) => p.npc).map((p) => p.npc)] };
  });
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

/** Artefakte (pathways.json → artifacts.list) werden Gegenstände der Art 'artifact'. */
function artifactItems(artifacts) {
  const out = {};
  for (const [id, a] of Object.entries(artifacts?.list ?? {})) {
    const { icon, zones, ...rest } = a;
    out[id] = { ...rest, kind: 'artifact', rarity: 'okkult', zones };
  }
  return out;
}

/**
 * Artefakte aus der Wildnis: Jeder Gegner eines Gebiets kann eines der dort heimischen Artefakte fallen lassen
 * (selten, Bosse häufiger; Eliten verdoppeln die Chance wie bei allen Drops).
 */
function artifactDrops(loot, encounters, artifacts) {
  if (!artifacts) return loot;
  const out = { ...loot };
  const chance = artifacts.drop_chance ?? { normal: 0.02, boss: 0.3 };
  for (const [id, table] of Object.entries(loot)) {
    const enc = encounters[id];
    const ids = Object.entries(artifacts.list).filter(([, a]) => a.source === 'wild' && a.zones?.includes(enc?.zone)).map(([aid]) => aid);
    if (!ids.length) continue;
    const base = enc.boss ? chance.boss : chance.normal * (enc.elite ? 2 : 1);
    out[id] = { ...table, drops: [...(table.drops ?? []), ...ids.map((item) => ({ item, chance: base / ids.length }))] };
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
