import { NIGHT_FLAG } from '../core/Clock.js';
import { applyQuestPack } from './questPacks.js';
import { applyDunscarZirkel } from './dunscarZirkel.js';
import { applyZirkelAuftraege } from './zirkelAuftraege.js';
import { applyLore } from './lore.js';
import { withSequenzen, applySequenzen } from './sequenzen.js';
import { applyPfadHandel } from './pfadHandel.js';
import { applySeq5 } from './seq5.js';
import { applySeq4 } from './seq4.js';
import { applySeqHoch, addRitualformeln } from './seqHoch.js';
import { applyAufstieg } from './aufstieg.js';
import { withFaehigkeiten } from './faehigkeiten.js';
import { applyMoods } from './moods.js';
import { applyRelations } from './relations.js';
import { applySchmuggel } from './schmuggel.js';
import { applyAltbeute } from './altbeute.js';
import { applyDunscarHaendler } from './dunscarHaendler.js';
import { applyDunscarKulisse } from './dunscarKulisse.js';
import { applyBenannte } from './benannte.js';
import { applyDunscarSchlacke } from './dunscarSchlacke.js';
import { applyHaendlerAbgleich } from './haendlerAbgleich.js';
// Fügt alle Inhaltsdateien zu einem Objekt zusammen (ohne JSON-Imports, damit Node-Tests es nutzen können).
// Hinweise, Informationen, Schlussfolgerungen und Dialoge teilen sich jeweils einen Namensraum über alle Fälle.
// factions.json (Sekten) bringt eigene Figuren, Reiseziele, Gegner, Beute, Aufträge und Hinweise mit.
// gebaeude.json bringt betretbare Häuser mit: Innenräume, Türen in den Vierteln, Figuren, Händler, Dialoge.
// stadtgegner.json (Paket L) verteilt Stadtgegner als Streifen auf die Viertel und bringt Beute und Kopfgeld-Brett mit.
// treffen.json (geheime Treffen) bringt Zirkel, Treffpunkte, Gastgeber mit Händlern, Dialoge und Reiseziele mit.
// wexmoor.json (Kapitel 2) bringt die zweite Stadt mit: Karten mit `city: "wexmoor"`, eigene Reiseziele und -ereignisse, Figuren, Dialoge, Auftrag und Spuren.
export function buildContent({ campaign, quests, cases, maps, dialogues, items = {}, encounters = {}, pathways = null, market = null, travel = null, wilds = null, factions = null, buildings = null, gatherings = null, city = null, wexmoor = null, packs = [], lore = null, sequenzen = null, beziehungen = null }) {
  // Paket AF: neue Pfade, Zutaten und Artefakte gehören vor der Erzeugung der Trank-/Formel-Items dazu
  const sq = withSequenzen(pathways, sequenzen);
  pathways = withFaehigkeiten(sq.pathways, sequenzen?.faehigkeiten); // zweite Kampffertigkeit und Welt-Fähigkeit je Sequenz
  ({ gatherings, pathways, wexmoor } = withPackTreffen(packs, gatherings, pathways, wexmoor));
  const merge = (list, key) => Object.assign({}, ...list.map((x) => x[key] ?? {}));
  const b = buildings ?? {};
  const g = gatherings ?? {};
  const wx = wexmoor ?? {};
  if (wx.case) cases = [...cases, wx.case];
  maps = withPlacements(withEntrances([...maps, ...(b.maps ?? []), ...(g.maps ?? []), ...(wx.maps ?? [])], b.entrances ?? []), g.placements ?? []);
  // Kapitel 2 bringt eigene Gefahrengebiete mit (Vergessmoor)
  const wild = wildContent(wexmoor?.zones ? { ...wilds, zones: { ...(wilds?.zones ?? {}), ...wexmoor.zones } } : wilds);
  // Stadtgegner: Kettlegate (stadtgegner.json) und je Paket ein eigener Stadtausschnitt mit eigenen Niederlagen-/Elitenregeln (BD: Dunscar)
  const towns = [city, ...packs.map((p) => p.stadtgegner)].filter(Boolean).map(cityContent);
  const town = { encounters: Object.assign({}, ...towns.map((t) => t.encounters)), loot: Object.assign({}, ...towns.map((t) => t.loot)), items: Object.assign({}, ...towns.map((t) => t.items)) };
  for (const c of [city, ...packs.map((p) => p.stadtgegner)]) maps = withCity(maps, c);
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
      events: [...(travel.events ?? []), ...(wx.events ?? []), ...packs.flatMap((p) => p.events ?? [])], // CD: Landstraßen-Ereignisse der schnellen Reise in Calderwick
      cities: { ...(travel.cities ?? {}), ...(wx.city ? { [wx.city.id]: wx.city } : {}), ...(wx.cities ?? {}) },
    },
    pathways: pathways?.pathways ?? {},
    market: market && { ...market,
      merchants: { ...market.merchants, ...(b.merchants ?? {}), ...(g.merchants ?? {}), ...(wx.merchants ?? {}), ...Object.assign({}, ...packs.map((p) => p.haendler?.merchants ?? {})) }, // wexmoor.json: Pfandleiherin am Salzmarkt
      sell_prices: { ...market.sell_prices, ...(f.sell_prices ?? {}), ...Object.assign({}, ...packs.map((p) => p.haendler?.sell_prices ?? {})) } }, // BC: Händler und Verkaufswerte aus Paketen
    loot: { ...(market?.loot ?? {}), ...artifactDrops(wild.loot, wild.encounters, pathways?.artifacts), ...town.loot, ...(f.loot ?? {}), ...(wx.loot ?? {}) },
    artifacts: pathways?.artifacts ?? null,
    revierSupply: pathways?.revier_supply ?? null,
    corruption: pathways?.corruption ?? null,
    ritualRules: pathways?.ritual_rules ?? null,
    zones: wild.zones,
    lootTables: wild.lootTables,
    factions: f.factions ?? {},
    gatherings: g.rules ? { rules: g.rules, circles: g.circles ?? {}, artisan: g.artisan ?? null } : null,
    police: wx.police ?? null,
    polices: { ...(wx.police ? { wexmoor: wx.police } : {}), ...Object.assign({}, ...packs.map((p) => p.police ?? {})) }, // Fahndung je Stadt (K1-Finale: Kettlegate)
    loners: wx.loners ? { ...wx.loners, list: { ...wx.loners.list, ...Object.assign({}, ...packs.map((p) => p.einzelgaenger?.loners?.list ?? {})) } } : null, // BC: Dunscarer Einzelgänger
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
  for (const pack of packs) if (pack.zeitung) content.newspapers = [...(content.newspapers ?? []), ...pack.zeitung]; // Paket AL
  content.epiloge = packs.flatMap((pack) => pack.epiloge ?? []); // AP/AR: Epilogszenen je Ende, in Dateireihenfolge
  for (const pack of packs) withPackLore(content, pack); // Paket AT: Gerede, Bestiarium und Lesestücke aus Nebenauftragspaketen
  for (const pack of packs) withPackLeben(content, pack); // Paket BD: Einwohner mit Tagesplan, Aufseher-Streifen, Wetter und Tiere
  for (const pack of packs) withPackBosses(content, pack); // Kapitel 3: Bosse, Folgeabschnitte und Kampftexte
  applySequenzen(content, sequenzen, sq); // Paket AF: Händler, Treffen und Funde für die neuen Pfade
  addRitualformeln(content); // Seq 3: eigene Ritualformel je Pfad (Zirkel-Los und Monster-Beute wie die Trankformel)
  applyDunscarZirkel(content); // Dunscar: Zirkel-Lose im Tausenderbereich, Kalter Ofen + Stummes Stellwerk
  applySeq5(content); // Seq-5-Rituale: Gefäße, Fäden, Uhr, Sude, Laternenbestie und Kokonspinne
  applySeq4(content, packs.find((p) => p.seq4Dr)?.seq4Dr ?? null); // Seq-4-Rituale: zehn Halbgott-Prüfungen samt Wächter, Wurfflaschen, Relikt, Wexmoor-Einnahmen
  applySeqHoch(content); // Seq 3 bis 1: Rituale, Orte der Sequenz 3 mit den Formeln 3/2/1, Weltwandel-Gerede
  applyAufstieg(content); // Kapitel 4: Zug nach oben, Himmelsstadt (immer verbrannt), Sturz nach Calderwick
  applyPfadHandel(content); // Pfad-Beyonder in Wexmoor: Zutaten für Seq 5/4, drei neue Einzelgänger, Laufplan
  applySchmuggel(content); // Kein Zurück nach Kettlegate: Zirkelware von dort in Zunders Schmuggelkiste
  applyMoods(content); // Paket AK: Stimmungen für Schlüsselstellen
  applyRelations(content, beziehungen, packs); // Beziehungen: Regeln, Vorlieben, Knoten-Wirkungen
  applyDunscarHaendler(content); // Dunscar: Waffen, Kleidung, Kräuter und Ankauf am Kalkmarkt (kein Zurück in alte Städte)
  applyBenannte(content); // Codex DJ: benannte Gegner auf den Grundgegnern, nachts in ihren Gebieten
  applyAltbeute(content); // Wexmoor-Monster tragen ab und zu Kettlegater Beute (kein Zurück dorthin)
  applyDunscarGebietsbosse(content); // Dunscar: je Gefahrengebiet ein frei stehender Gebietsboss wie in Wexmoor
  applyDunscarDichte(content); // Dunscar-Gefahrengebiete so dicht besetzt wie Wexmoor (vorher nur 3–4 Gegner)
  applyDunscarSchlacke(content); // Dunscar: Schlackengrube (Stufe 7) mit harten Farmgegnern, Mittelbossen und reicher Beute
  applyDunscarGeld(content); // Dunscar zahlt mehr als Wexmoor: Gegnergeld und Kopfgelder
  applyDunscarBeute(content); // Dunscar-Beute 3–5× so viel wert wie in Wexmoor
  applyHaendlerAbgleich(content); // Händler aller Gebiete: Stärke und Preise je Gebiet, alte Stücke auch später
  applyZirkelAuftraege(content); // Dunscar: Zirkelmitglieder vergeben Aufträge (Monster, Polizisten)
  applyDunscarKulisse(content); // Dunscar: Ausgänge nach Himmelsrichtung mit Schild, Rückkehr an der passenden Tür, Requisiten je Viertel
  return content;
}

/** Lore aus einem Paket: Gerede je Stadt und Karte anhängen, Bestiariumstexte nur ergänzen, Lesestücke platzieren. */
function withPackLore(content, pack) {
  for (const [city, perMap] of Object.entries(pack.gerede ?? {})) {
    const own = (content.gossip[city] = { ...(content.gossip[city] ?? {}) });
    for (const [map, lines] of Object.entries(perMap)) own[map] = [...(own[map] ?? []), ...lines];
  }
  for (const [id, t] of Object.entries(pack.bestiarium ?? {})) content.bestiaryTexts[id] ??= t;
  if (pack.lesestuecke?.length) {
    // Lesestücke ohne feste Kachel stehen auch auf der warmen Zwillingskarte (Briarholt), damit sie beim Umschalten nicht verschwinden
    const twin = (l) => (l.spawn_offset && content.maps[`${l.map}__warm`] ? [l, { ...l, map: `${l.map}__warm` }] : [l]);
    applyQuestPack(content, { name: `${pack.name}_lese`, platzierung: pack.lesestuecke.flatMap(twin).map((l) => withSpawnOffset(content, l)).filter(Boolean) });
  }
  // Codex-Runde 9: Textvorräte für Halbgott/Engel (CP) und die Fasserin-Aufträge (CR) liegen als Ganzes im Inhalt
  if (pack.halbgott) content.halbgott = pack.halbgott;
  if (pack.fasserin_auftrag) content.fasserinAuftrag = pack.fasserin_auftrag;
  if (pack.erfolge) content.erfolge = pack.erfolge; // Codex DL: Akte des Ermittlers
  if (pack.benannte) content.benannte = pack.benannte; // Codex DJ: benannte Gegner (Aufbau in applyBenannte)
  if (pack.post) { // Codex DI: Briefe; Beilagen als Andenken (nicht handelbar), vorhandene Items bleiben wie sie sind
    content.post = pack.post;
    for (const b of pack.post.beilagen) {
      if (content.items[b.id] || b.kind === 'currency') continue;
      content.items[b.id] = { name: b.name, desc: b.text, weight: b.gewicht ?? 0, price: 0, kind: 'key', post: true };
    }
  }
}

/** Lesestück ohne feste Kachel (`spawn_offset`): neben dem Standard-Spawn seiner Karte; ohne Karte entfällt es. */
function withSpawnOffset(content, p) {
  if (!p.spawn_offset) return p;
  const m = content.maps[p.map];
  const base = m?.spawns?.default ?? Object.values(m?.spawns ?? {})[0];
  if (!base) return null;
  const { spawn_offset: off, ...rest } = p;
  const taken = new Set([...(m.npcs ?? []), ...(m.interactables ?? [])].filter((o) => o.tile).map((o) => `${o.tile[0]},${o.tile[1]}`));
  const free = (x, y) => !taken.has(`${x},${y}`) && /[.swg]/.test(m.rows?.[y]?.[x] ?? ''); // außerhalb der Karte ist nichts frei
  // Vorgabe-Versatz, sonst die nächste freie Bodenkachel rund um den Spawn, damit kein Objekt eines anderen Pakets überdeckt wird
  const candidates = [off, [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [1, 1], [-1, 1], [1, -1], [-1, -1], [0, 2], [0, -2]];
  const pick = candidates.find(([dx, dy]) => free(base[0] + dx, base[1] + dy)) ?? off;
  return { ...rest, tile: [base[0] + pick[0], base[1] + pick[1]] };
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
/**
 * Tag und Nacht (BD): `zeit: { tag: { map?, tile } | null, nacht: { map?, tile } | null }` wird zu je einem Eintrag pro Tageszeit,
 * sichtbar über das flüchtige Nachtflag (core/Clock.js). `null` heißt: zu dieser Tageszeit nicht da. Ohne `zeit` bleibt der Eintrag wie er ist.
 */
function timed(def) {
  if (!def.zeit) return [def];
  const { zeit, ...rest } = def;
  const v = rest.visible_if ?? {};
  const out = [];
  if (zeit.tag) out.push({ ...rest, tile: zeit.tag.tile ?? rest.tile, visible_if: { ...v, hide_if_flags: [...(v.hide_if_flags ?? []), NIGHT_FLAG] } });
  if (zeit.nacht) out.push({ ...rest, tile: zeit.nacht.tile ?? rest.tile, visible_if: { ...v, requires_flags: [...(v.requires_flags ?? []), NIGHT_FLAG] } });
  return out;
}

/**
 * Paket BD: Einwohner mit Tagesplan (`einwohner`: Varianten derselben Figur je Storyzustand, mit Tag-/Nachtplatz),
 * zivile Aufseher-Streifen (`streifen.patrols`, Kartenfeld `patrols`) und Wetter/Tiere je Karte (`leben` → Kartenfeld `leben`).
 */
function withPackLeben(content, pack) {
  const own = (mapId) => {
    const m = content.maps[mapId];
    if (!m) throw new Error(`${pack.name}: unbekannte Karte ${mapId}`);
    return (content.maps[mapId] = { ...m, npcs: [...(m.npcs ?? [])], patrols: [...(m.patrols ?? [])] });
  };
  for (const e of pack.einwohner ?? []) {
    if (!content.npcs[e.id]) throw new Error(`${pack.name}: Einwohner ${e.id} ohne Figur`);
    for (const [when, spot] of Object.entries(e.zeit ?? {})) {
      if (!spot) continue;
      const v = e.visible_if ?? {};
      const visible_if = when === 'nacht'
        ? { ...v, requires_flags: [...(v.requires_flags ?? []), NIGHT_FLAG] }
        : { ...v, hide_if_flags: [...(v.hide_if_flags ?? []), NIGHT_FLAG] };
      own(spot.map).npcs.push({ id: e.id, tile: spot.tile, visible_if, ...(e.roam ? { roam: e.roam } : {}), ...(e.fahndung ? { fahndung: e.fahndung } : {}) }); // CN: Ausweichknoten bei Fahndung
    }
  }
  for (const [mapId, defs] of Object.entries(pack.streifen?.patrols ?? {})) {
    const m = own(mapId);
    for (const def of defs) m.patrols.push(...timed({ kind: 'aufsicht', ...def }));
  }
  for (const [mapId, life] of Object.entries(pack.leben ?? {})) {
    if (!content.maps[mapId]) throw new Error(`${pack.name}: Wetter für unbekannte Karte ${mapId}`);
    content.maps[mapId] = { ...content.maps[mapId], leben: life };
  }
}

/** Stadtgegner: Streifen (roamers) und zusätzliche Objekte in die Viertel einsetzen, ohne die Kartendateien anzufassen. */
function withCity(maps, city) {
  if (!city) return maps;
  return maps.map((m) => {
    const roamers = (city.roamers?.[m.id] ?? []).flatMap(timed);
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
    const bounty = id.startsWith('kopfgeld_') || (e.on_win?.sets_flags ?? []).some((f) => /^(won_kopfgeld_|k3k_)/.test(f)); // BD: Dunscarer Ziele heißen k3k_*
    out.loot[id] = { repeat: !e.boss && !bounty, ...loot };
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
/**
 * Paket AQ/AM: Ein Pack kann einen Treffen-Ausschnitt (`treffen`: Zirkel, Karten, Pins, Reiseziele, Reihenfolge je Stadt)
 * und Artefakte (`artefakte`) mitbringen. Beides gehört vor den Build; die Spiegel `npcs`/`dialogues` im Ausschnitt
 * bleiben weg, weil das Pack sie selbst einbringt. Pins einer Stadt landen auch auf deren Stadtkarte.
 * Wexmoorer Orte bringen `maps`, `zone`, `travel` und `pins` mit.
 */
function withPackTreffen(packs, gatherings, pathways, wexmoor) {
  for (const pack of packs) {
    const t = pack.treffen;
    if (t) {
      const g = gatherings ?? {};
      gatherings = {
        ...g,
        rules: { ...g.rules, orders: { ...(g.rules?.orders ?? {}), ...(t.rules?.orders ?? {}) } },
        circles: { ...(g.circles ?? {}), ...(t.circles ?? {}) },
        pins: { ...(g.pins ?? {}), ...(t.pins ?? {}) },
        travel: [...(g.travel ?? []), ...(t.travel ?? [])],
        maps: [...(g.maps ?? []), ...(t.maps ?? [])],
        placements: [...(g.placements ?? []), ...(t.placements ?? [])],
      };
      const cityPins = Object.fromEntries(Object.entries(t.pins ?? {}).filter(([id]) => t.travel?.some((x) => x.map === id && x.city === wexmoor?.city?.id)));
      if (Object.keys(cityPins).length) wexmoor = { ...wexmoor, city: { ...wexmoor.city, pins: { ...(wexmoor.city.pins ?? {}), ...cityPins } } };
      // BC: Pins eines Treffpunkts in einer weiteren Stadt (Dunscar) landen auf deren Stadtkarte
      for (const [cid, c] of Object.entries(wexmoor?.cities ?? {})) {
        const own = Object.fromEntries(Object.entries(t.pins ?? {}).filter(([id]) => t.travel?.some((x) => x.map === id && x.city === cid)));
        if (Object.keys(own).length) wexmoor = { ...wexmoor, cities: { ...wexmoor.cities, [cid]: { ...c, pins: { ...(c.pins ?? {}), ...own } } } };
      }
    }
    // BO: weitere Rezepte und der Textvorrat der Fasserin hängen sich an treffen.json → artisan
    if (gatherings?.artisan && (pack.rezepte || pack.fasserin_texte)) {
      gatherings = { ...gatherings, artisan: { ...gatherings.artisan, recipes: [...(gatherings.artisan.recipes ?? []), ...(pack.rezepte ?? [])], texte: pack.fasserin_texte ?? gatherings.artisan.texte } };
    }
    const arts = pack.artefakte ?? pack.artifacts?.list;
    if (arts && pathways?.artifacts) {
      pathways = { ...pathways, artifacts: { ...pathways.artifacts, list: { ...pathways.artifacts.list, ...arts } } };
    }
    // Paket AM: neue Wexmoorer Orte (Karten, Gefahrengebiet, Reiseziele, Pins auf der Stadtkarte).
    // Kapitel 3 (AS): ein Pack mit eigener Stadt (`city`) bringt seine Karten genauso mit; die Stadtkarte kommt zu den übrigen.
    if (wexmoor && (pack.maps || pack.zone || pack.zones || pack.travel || pack.pins)) {
      const known = new Set((wexmoor.maps ?? []).map((m) => m.id));
      for (const m of pack.maps ?? []) if (known.has(m.id)) throw new Error(`${pack.name}: Karte ${m.id} gibt es schon`);
      const own = pack.city ? { ...pack.city, pins: { ...(pack.city.pins ?? {}), ...(pack.pins ?? {}) } } : null;
      wexmoor = {
        ...wexmoor,
        maps: [...(wexmoor.maps ?? []), ...(pack.maps ?? [])],
        zones: { ...(wexmoor.zones ?? {}), ...(pack.zone ?? {}), ...(pack.zones ?? {}) },
        travel: [...(wexmoor.travel ?? []), ...(pack.travel ?? [])],
        city: own ? wexmoor.city : { ...wexmoor.city, pins: { ...(wexmoor.city?.pins ?? {}), ...(pack.pins ?? {}) } },
        cities: own ? { ...(wexmoor.cities ?? {}), [own.id]: own } : wexmoor.cities,
      };
    }
  }
  return { gatherings, pathways, wexmoor };
}

/**
 * Kapitel 3 (AS/AR): Bosse werden an ihrer Station begonnen. Ein Boss, den schon ein Gefahrengebiet erzeugt hat,
 * bleibt dessen Fassung (mit Beute); Folgeabschnitte (`phasen`) kommen dazu. `boss_texte` ergänzt Intro, Sieg und Niederlage.
 */
function withPackBosses(content, pack) {
  for (const [id, e] of Object.entries({ ...(pack.bosses ?? {}), ...(pack.phasen ?? {}) })) {
    if (!content.encounters[id]) content.encounters[id] = e;
  }
  for (const [id, t] of Object.entries(pack.boss_texte ?? {})) {
    if (!content.encounters[id]) throw new Error(`${pack.name}: Kampftext für unbekannten Kampf ${id}`);
    Object.assign(content.encounters[id], t);
  }
}

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

/** Gegner je Dunscar-Gefahrengebiet (Wexmoor: 17–19 in den großen Gebieten). */
export const DUNSCAR_ROAMERS = 18;
/** Füllt die Dunscar-Gefahrengebiete mit weiteren Laufgegnern aus dem eigenen Gebiet auf, verteilt über die begehbaren Felder. */
function applyDunscarDichte(content) {
  for (const [id, m] of Object.entries(content.maps)) {
    const zone = content.zones?.[id];
    if (!id.startsWith('ds_') || !m.danger || !zone || !m.rows) continue;
    const pool = Object.entries(zone.encounters ?? {}).filter(([k, e]) => !e.boss && !e.flees_after && !k.endsWith('_elite') && content.encounters[k]).map(([k]) => k);
    const roamers = [...(m.roamers ?? [])];
    if (!pool.length || roamers.length >= DUNSCAR_ROAMERS) continue;
    const taken = [...(m.npcs ?? []), ...(m.interactables ?? []), ...roamers].filter((o) => o.tile).map((o) => o.tile);
    const spawns = Object.values(m.spawns ?? {});
    const free = [];
    m.rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '.' || /[gpscwPK=,]/.test(ch)) free.push([x, y]); }));
    const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    // Feste Reihenfolge (kein Zufall beim Laden): immer das Feld mit dem größten Abstand zu Eingängen und anderen Gegnern
    let n = 0;
    while (roamers.length < DUNSCAR_ROAMERS) {
      let best = null;
      for (const t of free) {
        if (spawns.some((sp) => dist(t, sp) < 8)) continue;
        const d = Math.min(99, ...taken.map((o) => dist(t, o)));
        if (d >= 4 && (!best || d > best.d)) best = { d, t };
      }
      if (!best) break;
      roamers.push({ id: `${id}_dichte${++n}`, encounter: pool[(roamers.length + n) % pool.length], tile: best.t, elite_chance: 0.12 });
      taken.push(best.t);
    }
    content.maps[id] = { ...m, roamers };
  }
}

/** Seb 2026-11-12: Dunscar zahlt mehr als Wexmoor (dort Gegnergeld ×3, Kopfgelder 150–800). */
export const DS_MONEY_MULT = 10; // Seb 2026-11-12: ×4 war noch zu wenig
export const DS_KOPFGELD_MULT = 15; // 45–80 → 675–1200 Schilling
function applyDunscarGeld(content) {
  const loot = { ...content.loot };
  for (const [id, enc] of Object.entries(content.encounters)) {
    if (enc.chapter !== 3 || !Array.isArray(loot[id]?.money) || loot[id].ds_buffed) continue;
    loot[id] = { ...loot[id], money: loot[id].money.map((v) => Math.round(v * DS_MONEY_MULT)), ds_buffed: true };
  }
  content.loot = loot;
  const d = content.dialogues?.kopfgeldbrett_ds;
  if (!d) return;
  const amounts = {};
  for (const n of Object.values(d.nodes)) if (n.gives_money) amounts[n.gives_money] = n.gives_money * DS_KOPFGELD_MULT;
  const fix = (t) => (typeof t === 'string' ? t.replace(/(\d+) Schilling/g, (m, v) => (amounts[v] ? `${amounts[v]} Schilling` : m)) : t);
  const nodes = {};
  for (const [k, n] of Object.entries(d.nodes)) {
    nodes[k] = { ...n, text: fix(n.text), ...(n.gives_money ? { gives_money: amounts[n.gives_money] } : {}), ...(n.choices ? { choices: n.choices.map((c) => ({ ...c, text: fix(c.text) })) } : {}) };
  }
  content.dialogues = { ...content.dialogues, kopfgeldbrett_ds: { ...d, nodes } };
  for (const [qid, q] of Object.entries(content.quests)) if (qid.startsWith('kopfgeld_ds_')) content.quests[qid] = { ...q, summary: fix(q.summary) };
}

/** Seb 2026-11-12: Dunscars Monstergebiete hatten keine Bosse (die Story-Bosse kommen nur über die Akte).
 *  Je Gebiet ein eigener Gebietsboss auf der Karte, aufgebaut auf dem Story-Boss des Gebiets, ohne Story-Flags. Kommt nach dem Verlassen des Gebiets wieder (respawn). */
export const DS_GEBIETSBOSSE = {
  ds_rangierwueste: { id: 'ds_gb_weichenfresser', from: 'schwellenhund', name: 'Weichenfresser', intro: 'Zwischen den toten Waggons richtet sich etwas auf, das zu lange Eisen gefressen hat. Es kennt jede Weiche dieser Wüste.' },
  ds_klopfbruch: { id: 'ds_gb_bruchmeister', from: 'vorhauer', name: 'Bruchmeister', intro: 'Der Bruchmeister schlägt den Takt, nach dem hier alles bricht. Seine Hämmer sind älter als die Stadt.' },
  ds_rufschlucht: { id: 'ds_gb_schluchtrufer', from: 'vielrufer', name: 'Schluchtrufer', intro: 'Hundert Stimmen aus der Schlucht werden zu einer. Sie ruft deinen Namen, bevor du ihn sagst.' },
  ds_unterschicht: { id: 'ds_gb_tiefenvorarbeiter', from: 'unterschicht', name: 'Tiefenvorarbeiter', intro: 'Ganz unten führt noch jemand die Schicht. Er hat nie aufgehört und lässt niemanden gehen.' },
};
function applyDunscarGebietsbosse(content) {
  for (const [mapId, b] of Object.entries(DS_GEBIETSBOSSE)) {
    const m = content.maps[mapId];
    const base = content.encounters[b.from];
    if (!m?.rows || !base || content.encounters[b.id]) continue;
    const { weak_if, on_win, phase2, ...rest } = base;
    content.encounters[b.id] = { ...rest, name: b.name, intro: b.intro, boss: true, chapter: 3, zone: mapId, on_win: {}, win_text: `${b.name} fällt. Das Gebiet atmet für einen Moment auf.` };
    const l = content.loot[b.from] ?? {};
    content.loot[b.id] = { ...l, repeat: true, money: [160, 240], drops: (l.drops ?? []).filter((d) => !String(d.item).startsWith('k3o_')) };
    if (content.zones?.[mapId]?.encounters) content.zones[mapId].encounters[b.id] = content.encounters[b.id];
    // Platz: gut sichtbar mitten im Gebiet, auf der dem Eingang abgewandten Seite (wie die Wexmoor-Bosse), nicht in einer Ecke
    const spawns = Object.values(m.spawns ?? {});
    const taken = new Set([...(m.npcs ?? []), ...(m.interactables ?? []), ...(m.roamers ?? [])].filter((o) => o.tile).map((o) => `${o.tile[0]},${o.tile[1]}`));
    const w = m.rows[0].length;
    const h = m.rows.length;
    const sx = spawns[0]?.[0] ?? 0;
    const goal = [sx < w / 2 ? Math.round(w * 0.75) : Math.round(w * 0.25), Math.round(h / 2)];
    let best = null;
    m.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (!(ch === '.' || /[gpscwPK=,]/.test(ch)) || taken.has(`${x},${y}`)) return;
      if (spawns.some(([a, b]) => Math.abs(x - a) + Math.abs(y - b) < 12)) return;
      const d = Math.abs(x - goal[0]) + Math.abs(y - goal[1]);
      if (!best || d < best.d) best = { d, tile: [x, y] };
    }));
    if (best) content.maps[mapId] = { ...m, roamers: [...(m.roamers ?? []), { id: `${mapId}_gebietsboss`, encounter: b.id, tile: best.tile, boss: true, respawn: true }] };
  }
}

/** Seb 2026-11-12: Beute der Dunscar-Gegner wertvoller (Wexmoor ~58 Schilling Beutewert je Kampf, Dunscar vorher ~10).
 *  Drei Wertstücke nur für Verkauf, je Rang: normal ~190, Elite ~620, Boss ~1250 erwarteter Beutewert. */
export const DS_BEUTE_ITEMS = {
  ds_beute_messingmarke: { name: 'Messing-Schichtmarke', kind: 'trophy', weight: 0.1, price: 160, desc: 'Eine schwere Marke aus der alten Schichtkasse. Die Pfandleiher zahlen gut dafür.' },
  ds_beute_signalsilber: { name: 'Signalsilber', kind: 'trophy', rarity: 'selten', weight: 0.2, price: 350, desc: 'Silberdraht aus den Signalleitungen, ungewöhnlich rein. Wird in Dunscar mit Gold aufgewogen.' },
  ds_beute_schichtgold: { name: 'Schichtgold', kind: 'trophy', rarity: 'selten', weight: 0.3, price: 900, desc: 'Ein Klumpen Gold aus der tiefsten Schicht. Niemand fragt, woher es kommt.' },
  ds_beute_kalkopal: { name: 'Kalkopal', kind: 'trophy', rarity: 'selten', weight: 0.2, price: 2500, desc: 'Ein milchiger Opal, im Kalk der untersten Stollen gewachsen. Die Hehler am Kalkmarkt reißen sich darum.' },
};
/** Seb 2026-11-12: Dunscar-Gegner droppen keine alten Artefakte mehr (die aus Kettlegate/Wexmoor-Tabellen).
 *  Ihre Chance geht stattdessen an den Kalkopal (2500). Dunscar-eigene Artefakte (z. B. Rangierlinse) bleiben. */
export const DS_ALT_ERSATZ = 'ds_beute_kalkopal';
const DS_BEUTE = {
  normal: [{ item: 'ds_beute_messingmarke', chance: 0.8 }, { item: 'ds_beute_signalsilber', chance: 0.15 }],
  elite: [{ item: 'ds_beute_signalsilber', chance: 1 }, { item: 'ds_beute_schichtgold', chance: 0.3 }],
  boss: [{ item: 'ds_beute_schichtgold', chance: 1 }, { item: 'ds_beute_signalsilber', chance: 1 }],
};
function applyDunscarBeute(content) {
  content.items = { ...content.items, ...DS_BEUTE_ITEMS };
  const loot = { ...content.loot };
  // alte Artefakte = Artefakte, die auch ein Gegner vor Kapitel 3 droppt
  const altArt = new Set();
  for (const [id, t] of Object.entries(loot)) {
    if ((content.encounters[id]?.chapter ?? 0) >= 3) continue;
    for (const d of t.drops ?? []) if (content.items[d.item]?.kind === 'artifact') altArt.add(d.item);
  }
  for (const [id, e] of Object.entries(content.encounters)) {
    if (e.chapter !== 3 || !loot[id]?.drops?.some((d) => altArt.has(d.item))) continue;
    const alt = loot[id].drops.filter((d) => altArt.has(d.item));
    const chance = Math.min(1, alt.reduce((s, d) => s + (d.chance ?? 1), 0));
    loot[id] = { ...loot[id], drops: [...loot[id].drops.filter((d) => !altArt.has(d.item)), { item: DS_ALT_ERSATZ, chance }] };
  }
  for (const [id, e] of Object.entries(content.encounters)) {
    if (e.chapter !== 3 || e.practice || e.mirror || e.waechter || id.startsWith('hg_') || !loot[id] || loot[id].ds_beute) continue;
    const rank = e.boss ? 'boss' : e.elite || id.endsWith('_elite') ? 'elite' : 'normal';
    loot[id] = { ...loot[id], drops: [...(loot[id].drops ?? []), ...DS_BEUTE[rank]], ds_beute: true };
  }
  content.loot = loot;
}
