/**
 * Codex-Runde 8: Vorratspakete (BH Gegner, BJ Figuren, BL Items), Kapitel 4 Calderwick (CC/CD/CF),
 * Kapitel 5 Briarholt (CG/CH/CJ) und Feste-Leben (CK) als Pakete für buildContent.
 * Reine Datenfunktionen ohne Imports, damit src/data/index.js und tests/helpers.js dieselbe Zusammenstellung nutzen.
 *
 * Die Gefahrengebiete der Kapitel liefern keine eigenen Gegner: `zonen_bindung.json` (tools/packs/runde8_sync.mjs)
 * nennt je Gebiet das Vorratsgebiet und die Gegner und Bosse, die hier aus dem Vorrat eingesetzt werden; wildContent
 * macht daraus wie überall Eliten, Beute und Niederlagen. Briarholts Orte haben eine warme Zwillingskarte `<id>__warm`;
 * Figuren, Objekte und Lesestücke der Akte und Nebenaufträge stehen auf beiden Fassungen.
 */
const STD = ['quests', 'items', 'encounters', 'dialogues', 'npcs', 'case', 'dialog_zusaetze', 'platzierung'];
const std = (name, d) => {
  const arts = d.artifacts?.list ?? d.artefakte?.list ?? {};
  const items = Object.fromEntries(Object.entries(d.items ?? {}).filter(([id]) => !arts[id])); // Artefakte entstehen aus artifacts.list (mit Wirkung)
  return { name, ...Object.fromEntries(STD.map((k) => [k, d[k] ?? (k === 'platzierung' ? [] : {})])), items };
};
export const WARM = '__warm';

/** Alle Pakete der Runde in Einbaureihenfolge. `f` enthält je Paketordner die JSON-Dateien nach Dateiname. */
export function runde8Packs(f) {
  const vg = f.vorrat_gegner;
  const vorrat = { encounters: vg.encounters, bosses: vg.bosses, phasen: vg.phasen, zonen: vg.zonen_vorschlag };
  const used = new Set();
  const k4Orte = ortePack('k4_orte', f.k4_orte, vorrat, used);
  const k5Orte = ortePack('k5_orte', f.k5_orte, vorrat, used);
  // Gegner, die kein Gebiet eingesetzt hat (Marktschreier u. a.), stehen roh bereit: ohne Gebiet, aber mit Beute
  const rest = Object.fromEntries(Object.entries(vg.encounters).filter(([id]) => !used.has(id)));
  const vorratGegner = { ...std('vorrat_gegner', vg), encounters: Object.fromEntries(Object.entries(rest).map(([id, e]) => [id, stripLoot(e)])),
    loot: Object.fromEntries(Object.entries(rest).map(([id, e]) => [id, { repeat: true, ...(e.loot ?? {}) }])), bestiarium: vg.bestiarium };
  const vorratFiguren = std('vorrat_figuren', f.vorrat_figuren);
  const vi = f.vorrat_items;
  const vorratItems = { ...std('vorrat_items', vi), dialogues: { ...vi.dialogues, ...vi.fundstuecke }, artifacts: vi.artifacts, haendler: vi.handel };
  const k4Akte = { ...std('k4_akte', f.k4_akte), faelle: f.k4_akte.faelle, zeitung: f.k4_akte.zeitung, boss_texte: f.k4_akte.boss_texte, epiloge: f.k4_akte.epiloge };
  const k4Neben = nebenPack('k4_nebenquests', f.k4_nebenquests);
  const warm = new Set(k5Orte.maps.filter((m) => m.id.endsWith(WARM)).map((m) => m.id));
  const k5Akte = mirrorWarm({ ...std('k5_akte', f.k5_akte), faelle: f.k5_akte.faelle, zeitung: f.k5_akte.zeitung, boss_texte: f.k5_akte.boss_texte, epiloge: f.k5_akte.epiloge }, warm);
  const k5Neben = mirrorWarm(nebenPack('k5_nebenquests', f.k5_nebenquests), warm);
  // Die Akte kommt vor den Orten: die Reisegespräche (CH) hängen Optionen an das Finale (CG)
  // CN: Kettlegate lebt (Einwohner mit Tag/Nacht, Stände als Gespräch, Ereignisse, Gerede, Nebelbote, Koop-Geplauder, Wetter und Tiere)
  const kgLeben = f.kg_leben ? { ...nebenPack('kg_leben', f.kg_leben), streifen: f.kg_leben.streifen } : null;
  return [vorratGegner, vorratFiguren, vorratItems, k4Orte, k4Akte, k4Neben, k5Akte, k5Orte, k5Neben, festeLebenPack(f.feste_leben), ...(kgLeben ? [kgLeben] : [])];
}

const stripLoot = ({ loot, ...e }) => e;

/** Ortepaket (CD/CH): Karten, Reiseziele, Stadtkarte, Artefakte und die aus dem Vorrat befüllten Gefahrengebiete. */
function ortePack(name, d, vorrat, used) {
  const zones = {};
  // Warme Zwillinge zuerst: ein Gegner, der in beiden Fassungen steht, gehört am Ende zur kalten (Grund-Id)
  const order = Object.entries(d.zones).sort(([a], [b]) => Number(b.endsWith(WARM)) - Number(a.endsWith(WARM)));
  for (const [zid, z] of order) {
    const b = d.zonen_bindung[zid];
    if (!b) throw new Error(`${name}: Gebiet ${zid} ohne Zonenbindung`);
    const q = vorrat.zonen[b.quelle];
    if (!q) throw new Error(`${name}: Vorratsgebiet ${b.quelle} fehlt`);
    const encounters = {};
    for (const id of [...b.gegner, ...(b.bosse ?? [])]) {
      const e = vorrat.encounters[id] ?? vorrat.bosses[id] ?? vorrat.phasen[id] ?? d.bosses?.[id];
      if (!e) throw new Error(`${name}: Gegner ${id} für ${zid} fehlt im Vorrat`);
      encounters[id] = e;
      used.add(id);
    }
    zones[zid] = {
      ...z, encounters, elite_chance: b.elite_chance ?? q.elite_chance ?? 0.12, elite_hp: q.elite_hp, elite_dmg: q.elite_dmg,
      elite_drops: [...(z.elite_drops ?? []), ...(q.elite_drops ?? [])], loot_tables: { ...(z.loot_tables ?? {}), ...(q.loot_tables ?? {}) },
      ...(b.schnellreise === false ? { travel: null } : {}), // Landstraße: nur über die Reise erreichbar
    };
  }
  for (const id of Object.keys(d.bosses ?? {})) if (!used.has(id)) throw new Error(`${name}: Boss ${id} ist keinem Gebiet zugeordnet`);
  const events = (d.landstrasse?.events ?? []).map((e) => ({ city: d.city.id, ...e }));
  return { ...std(name, d), maps: d.maps, travel: d.travel, zones, artifacts: d.artifacts, city: d.city, events };
}

/** Nebenauftragspaket (CF/CJ): Einwohner mit Tagesplan, Wetter, Gerede, Zeitung, Lesestücke, Geplauder. */
function nebenPack(name, d) {
  return { ...std(name, d), einwohner: d.einwohner, leben: d.leben, gerede: d.gerede, zeitung: d.zeitung, lesestuecke: d.lesestuecke, geplauder: d.geplauder };
}

/** Briarholt: alles, was auf einer kalten Karte steht, steht auch auf ihrer warmen Fassung. */
function mirrorWarm(pack, warm) {
  const twin = (id) => (warm.has(`${id}${WARM}`) ? `${id}${WARM}` : null);
  const both = (list, key = 'map') => list.flatMap((p) => (twin(p[key]) ? [p, { ...p, [key]: twin(p[key]) }] : [p]));
  const out = { ...pack, platzierung: both(pack.platzierung ?? []) };
  if (pack.lesestuecke) out.lesestuecke = both(pack.lesestuecke);
  if (pack.einwohner) {
    out.einwohner = pack.einwohner.flatMap((e) => {
      const maps = Object.values(e.zeit ?? {}).filter(Boolean).map((s) => s.map);
      if (!maps.some(twin)) return [e];
      const zeit = Object.fromEntries(Object.entries(e.zeit).map(([k, s]) => [k, s && twin(s.map) ? { ...s, map: twin(s.map) } : s]));
      return [e, { ...e, zeit }];
    });
  }
  return out;
}

/** CK: Feste-Leben. Buden als Händler, Andenken als Artefakte, saisonales Gerede und Lesestücke; Kalender und Wirkungen für die Laufzeit. */
function festeLebenPack(d) {
  const merchants = Object.assign({}, ...Object.values(d.feste).map((f) => f.merchants ?? {}));
  const gerede = {};
  const add = (city, map, lines) => { ((gerede[city] ??= {})[map] ??= []).push(...lines); };
  for (const perCity of Object.values(d.texte.gerede ?? {})) for (const [city, perMap] of Object.entries(perCity)) for (const [map, lines] of Object.entries(perMap)) add(city, map, lines);
  for (const [city, perMap] of Object.entries(d.texte.festgerede ?? {})) for (const [map, lines] of Object.entries(perMap)) add(city, map, lines);
  return {
    ...std('feste_leben', d), platzierung: [...d.platzierung, ...(d.wirkungen_platzierung ?? [])], haendler: { merchants }, artifacts: d.artefakte, zeitung: d.zeitung, geplauder: d.geplauder, gerede,
    lesestuecke: (d.texte.lesestuecke ?? []).filter((p) => p.map),
    festeLeben: { feste: d.feste, kalender: d.kalender, uebergaenge: d.kalender_uebergaenge, wirkungen: d.wirkungen, hud: d.texte.hud, verbuendete: d.texte.verbuendete, haendler: d.texte.haendler },
  };
}

/** Dateinamen je Paketordner (für index.js-Importe und den Testlader). */
export const RUNDE8_FILES = {
  vorrat_gegner: [...STD, 'bosses', 'phasen', 'bestiarium', 'zonen_vorschlag'],
  vorrat_figuren: STD,
  vorrat_items: [...STD, 'fundstuecke', 'artifacts', 'handel'],
  k4_orte: [...STD, 'maps', 'travel', 'zones', 'zonen_bindung', 'bosses', 'artifacts', 'city', 'landstrasse'],
  k4_akte: [...STD, 'faelle', 'zeitung', 'boss_texte', 'epiloge'],
  k4_nebenquests: [...STD, 'einwohner', 'leben', 'gerede', 'zeitung', 'lesestuecke', 'geplauder'],
  k5_orte: [...STD, 'maps', 'travel', 'zones', 'zonen_bindung', 'bosses', 'artifacts', 'city'],
  k5_akte: [...STD, 'faelle', 'zeitung', 'boss_texte', 'epiloge'],
  k5_nebenquests: [...STD, 'einwohner', 'leben', 'gerede', 'zeitung', 'lesestuecke', 'geplauder'],
  feste_leben: [...STD, 'feste', 'artefakte', 'zeitung', 'geplauder', 'texte', 'kalender', 'kalender_uebergaenge', 'wirkungen', 'wirkungen_platzierung'],
  kg_leben: [...STD, 'einwohner', 'leben', 'gerede', 'zeitung', 'geplauder', 'streifen'],
};
