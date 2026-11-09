#!/usr/bin/env node
// Nur Node-Standardbibliothek und die vorhandenen, DOM-freien Inhalts-/Zustandsmodule.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { buildContent } from '../../../src/data/buildContent.js';
import { GameState } from '../../../src/core/GameState.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const data = join(root, 'src/data');
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const load = p => read(join(data, p));
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]);
const sourceFiles = files(data).filter(p => p.endsWith('.json') && !p.includes('/packs/lore/'));
const sources = sourceFiles.map(read);
const content = buildContent({
  campaign: load('campaign.json'), quests: load('quests.json'), items: load('items.json'), encounters: load('encounters.json'),
  cases: readdirSync(data).filter(n => /^case_.*\.json$/.test(n)).sort().map(load),
  maps: readdirSync(join(data, 'maps')).filter(n => n.endsWith('.json')).sort().map(n => load(`maps/${n}`)),
  dialogues: readdirSync(join(data, 'dialogues')).filter(n => n.endsWith('.json')).sort().map(n => load(`dialogues/${n}`)),
  pathways: load('pathways.json'), market: load('market.json'), travel: load('travel.json'), wilds: load('wilds.json'),
  factions: load('factions.json'), buildings: load('gebaeude.json'), gatherings: load('treffen.json'), city: load('stadtgegner.json'), wexmoor: load('wexmoor.json'),
});
const pkgDir = join(root, 'src/data/packs/lore'); // seit dem Einbau dort
const packageFiles = files(pkgDir).filter(p => p.endsWith('.json'));
const docs = Object.fromEntries(packageFiles.map(p => [p.slice(pkgDir.length + 1), read(p)]));
const expectedFiles = ['bestiarium.json', 'gerede.json', 'item_texte.json', 'lesestuecke.json', 'zeitungen.json'];
assert.deepEqual(Object.keys(docs).sort(), expectedFiles.sort(), 'Unerwartete/fehlende Datendatei: Schema ergänzen');
const news = docs['zeitungen.json'], readings = docs['lesestuecke.json'], gossip = docs['gerede.json'];
const items = docs['item_texte.json'], bestiary = docs['bestiarium.json'];
const words = s => s.trim().split(/\s+/u).filter(Boolean).length;
const object = (x, where) => assert(x && typeof x === 'object' && !Array.isArray(x), `${where}: Objekt erwartet`);
function fields(x, required, optional, where) {
  object(x, where);
  for (const k of required) assert(k in x, `${where}: ${k} fehlt`);
  for (const k of Object.keys(x)) assert([...required, ...optional].includes(k), `${where}: unbekanntes Feld ${k}`);
}
function walk(x, fn, path = '') {
  if (!x || typeof x !== 'object') return;
  fn(x, path);
  for (const [k, v] of Object.entries(x)) walk(v, fn, `${path}/${k}`);
}
const setFlags = new Set();
for (const doc of [...sources, ...Object.values(docs)]) walk(doc, x => {
  for (const f of x.sets_flags ?? []) setFlags.add(f);
  if (x.done_flag) setFlags.add(x.done_flag);
});
// Einige vorhandene Flags (z. B. Festnahme) setzt der Spielzustand statt JSON.
for (const p of files(join(root, 'src/core')).filter(p => p.endsWith('.js'))) {
  const text = readFileSync(p, 'utf8');
  for (const m of text.matchAll(/\.flags\.add\(['"]([^'"]+)['"]\)/g)) setFlags.add(m[1]);
}
const conditions = new Set(['requires_flags', 'hide_if_flags']);
let flagRefs = 0, dialogueEdges = 0;
function checkConditions(x, where) {
  fields(x, [], [...conditions], where);
  for (const [k, flags] of Object.entries(x)) {
    assert(Array.isArray(flags), `${where}/${k}: Array erwartet`);
    assert.equal(new Set(flags).size, flags.length, `${where}: doppelte Flags`);
    for (const f of flags) {
      assert(typeof f === 'string', `${where}: ungültiges Flag`);
      const autoWin = f.startsWith('won_') && content.encounters[f.slice(4)];
      assert(setFlags.has(f) || autoWin, `${where}: Flag wird nirgends gesetzt: ${f}`);
      flagRefs++;
    }
  }
  for (const f of x.requires_flags ?? []) assert(!(x.hide_if_flags ?? []).includes(f), `${where}: unerfüllbare Bedingung ${f}`);
}
const newIds = new Set();
const existingIds = new Set();
for (const source of sources) walk(source, x => {
  if (typeof x.id === 'string') existingIds.add(x.id);
  for (const k of Object.keys(x)) existingIds.add(k);
});
function newId(id) {
  assert.match(id, /^lore_[a-z0-9_]+$/, `Neues Objekt ohne Paketpräfix: ${id}`);
  assert(!existingIds.has(id), `Neue ID kollidiert mit Quelldaten: ${id}`);
  assert(!newIds.has(id), `Doppelte neue ID: ${id}`); newIds.add(id);
}
function existing(table, id, where) { assert(Object.hasOwn(table, id), `${where}: unbekannte Referenz ${id}`); }
// Generische Prüfung auch für spätere Dialog-/Effektzusätze; keine neuen Dialoge in AD.
for (const [name, doc] of Object.entries(docs)) walk(doc, (x, path) => {
  const where = `${name}${path}`;
  for (const key of ['requires_flags', 'hide_if_flags']) if (x[key]) checkConditions({ [key]: x[key] }, where);
  if (x.done && typeof x.done === 'object') checkConditions(x.done, `${where}/done`);
  for (const key of ['map', 'to']) if (typeof x[key] === 'string') existing(content.maps, x[key], where);
  for (const key of ['encounter', 'combat']) if (typeof x[key] === 'string') existing(content.encounters, x[key], where);
  if (typeof x.npc === 'string') existing(content.npcs, x.npc, where);
  for (const key of ['gives_items', 'takes_items']) for (const id of Object.keys(x[key] ?? {})) existing(content.items, id, where);
  for (const key of ['requires_items', 'hide_if_items']) for (const id of x[key] ?? []) existing(content.items, id, where);
  if (x.nodes) {
    for (const id of Object.keys(x.nodes)) assert(id.startsWith('lore_'), `${where}: neuer Knoten ${id}`);
    const edge = spec => {
      if (spec === undefined) return;
      if (typeof spec === 'string') { assert(Object.hasOwn(x.nodes, spec), `${where}: fehlendes next/start ${spec}`); dialogueEdges++; }
      else { assert(Array.isArray(spec), `${where}: unbekanntes Sprungformat`); for (const branch of spec) edge(branch.node); }
    };
    edge(x.start);
    for (const node of Object.values(x.nodes)) for (const choice of node.choices ?? []) edge(choice.next);
  }
});
for (const n of news) {
  fields(n, ['id', 'zeitung', 'requires_flags', 'hide_if_flags', 'title', 'text', 'kurz'], [], n.id);
  newId(n.id); assert(['kurier', 'bote'].includes(n.zeitung));
  assert(words(n.text) >= 60 && words(n.text) <= 120, `${n.id}: Haupttext ${words(n.text)} Wörter`);
  assert(n.kurz.length >= 2 && n.kurz.length <= 3, `${n.id}: Kurzmeldungen`);
  assert(n.kurz.every(s => typeof s === 'string' && s.length));
}
const state = new GameState(content);
function available(rows, flags) { state.flags = new Set(flags); return rows.filter(r => state.meets(r)); }
const chapter1 = Object.entries(content.endings).filter(([id, e]) => /^case_0[1-9]$/.test(e.case) && /^c\d_/.test(id));
assert.equal(chapter1.length, 32, 'Quell-Enden geändert: Zeitungen aktualisieren');
assert.equal(news.filter(n => n.zeitung === 'kurier').length, chapter1.length);
for (const [eid, ending] of chapter1) {
  const candidates = news.filter(n => n.id.startsWith(`lore_kurier_${eid.split('_')[0]}_`));
  assert.deepEqual(available(candidates, ending.sets_flags).map(n => n.id), [`lore_kurier_${eid}`], `${eid}: Ende nicht eindeutig`);
  assert.equal(available(candidates, []).length, 0, `${eid}: vor Abschluss sichtbar`);
}
// Der gemeinsame Abschluss 8 darf nicht zusätzlich die direkte c7_wren-Ausgabe erzeugen.
for (const eid of ['c8_perfect', 'c8_good', 'c8_early']) {
  assert.equal(available(news.filter(n => n.id === 'lore_kurier_c7_wren'), content.endings[eid].sets_flags).length, 0);
  const flags = [...content.endings.c7_heir.sets_flags, ...content.endings[eid].sets_flags];
  assert.deepEqual(available(news.filter(n => n.id.startsWith('lore_kurier_c8_')), flags).map(n => n.id), [`lore_kurier_${eid}`]);
}
const actFlags = [1, 2, 3, 4].map(i => `k2_akt${i}_done`);
let wxScenarios = 0;
for (let count = 0; count <= 4; count++) for (const dispute of [false, true]) {
  const flags = [...actFlags.slice(0, count), ...(dispute ? ['k2_price_beaten'] : [])];
  const result = available(news.filter(n => n.zeitung === 'bote'), flags);
  assert.equal(result.length, count ? 1 : 0, `Wexmoor Akt ${count}, Hafenstreit ${dispute}`);
  if (count) assert.equal(result[0].id, `lore_bote_akt${count}${count >= 3 && dispute ? '_hafenstreit' : ''}`);
  wxScenarios++;
}
for (const end of ['rein', 'moor', 'lichtmeister', 'meer']) for (const dispute of [false, true]) {
  const flags = [...actFlags, ...content.endings[`k2_${end}`].sets_flags, ...(dispute ? ['k2_price_beaten'] : [])];
  assert.deepEqual(available(news.filter(n => n.zeitung === 'bote'), flags).map(n => n.id), [`lore_bote_${end}`]); wxScenarios++;
}
// Tileprüfung: konservative Boden-Zeichen; Figuren, Interactables und Deko bleiben frei.
const floor = new Set('.,wsgpPc=');
const key = (x, y) => `${x},${y}`;
function placementData(m) {
  const occupied = new Set(); const rects = [];
  for (const category of ['interactables', 'npcs', 'decor', 'roamers', 'patrols']) for (const o of m[category] ?? []) {
    if (!o.tile) continue;
    occupied.add(key(...o.tile));
    if (o.solid) {
      const [w, h, dx = 0, dy = 0] = o.solid, [ox, oy] = category === 'decor' ? (o.offset ?? [0, 0]) : [0, 2];
      rects.push([o.tile[0] * 16 + 8 + ox + dx, o.tile[1] * 16 + 8 + oy + dy, w, h]);
    }
  }
  const passable = (x, y) => floor.has(m.rows[y]?.[x]) && !rects.some(([cx, cy, w, h]) => Math.abs(x * 16 + 8 - cx) < w / 2 + 5 && Math.abs(y * 16 + 8 - cy) < h / 2 + 4);
  const reachable = new Set(), queue = Object.values(m.spawns ?? {}).map(p => [...p]);
  while (queue.length) {
    const [x, y] = queue.pop(); if (reachable.has(key(x, y)) || !passable(x, y)) continue;
    reachable.add(key(x, y)); queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
  }
  return { occupied, passable, reachable };
}
const placementCache = new Map();
assert.equal(readings.length, 40);
assert.equal(readings.filter(r => r.map.startsWith('wx_')).length, 20);
for (const r of readings) {
  fields(r, ['map', 'tile', 'interactable'], [], 'Lesestück');
  existing(content.maps, r.map, 'Lesestück');
  const i = r.interactable; newId(i.id);
  fields(i, ['id', 'kind', 'sprite', 'prompt', 'title', 'text', 'footer', 'visible_if'], [], i.id);
  assert.equal(i.kind, 'read'); assert.equal(i.sprite, 'paper'); checkConditions(i.visible_if, i.id);
  assert(words(i.text) > 0 && words(i.text) <= 120, `${i.id}: Wortgrenze`);
  assert(r.tile.length === 2 && r.tile.every(Number.isInteger), `${i.id}: Kachel`);
  const m = content.maps[r.map];
  if (!placementCache.has(r.map)) placementCache.set(r.map, placementData(m));
  const p = placementCache.get(r.map), [x, y] = r.tile;
  assert(p.passable(x, y), `${i.id}: kein freier begehbarer Boden bei ${r.map}:${r.tile}`);
  assert(p.reachable.has(key(x, y)), `${i.id}: vom Spawn unerreichbar`);
  assert(!p.occupied.has(key(x, y)), `${i.id}: Platz bereits belegt`);
  assert(!Object.values(m.spawns ?? {}).some(t => t[0] === x && t[1] === y), `${i.id}: Spawn belegt`);
  const furniture = new Set((m.decor ?? []).filter(o => o.solid).map(o => key(...o.tile)));
  const walls = new Set(r.map === 'wx_altstadt' ? '#IBTHCV|Ar' : '#IBTHCV|A');
  assert([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => walls.has(m.rows[y + dy]?.[x + dx]) || furniture.has(key(x + dx, y + dy))), `${i.id}: nicht neben Wand/Möbel/Ruine`);
  p.occupied.add(key(x, y));
}
const counts = {};
for (const city of ['kettlegate', 'wexmoor']) {
  const rows = [];
  for (const [map, list] of Object.entries(gossip[city])) {
    existing(content.maps, map, city); assert.equal(map.startsWith('wx_'), city === 'wexmoor');
    for (const r of list) {
      fields(r, ['text'], [...conditions], `${city}/${map}`);
      assert(words(r.text) <= 14 && words(r.text) > 0, `Gerede zu lang: ${r.text}`);
      const cond = Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'text')); checkConditions(cond, `${city}/${map}`);
      rows.push(r);
    }
  }
  assert.equal(rows.length, 60, `${city}: Anzahl Gerede`);
  assert.equal(new Set(rows.map(r => r.text)).size, 60, `${city}: Wiederholung`);
  assert.equal(rows.filter(r => r.requires_flags?.length).length, 20, `${city}: Fortschrittsreaktionen`);
  counts[city] = rows.length;
}
assert(Object.keys(items).length >= 40);
const shortItems = Object.entries(content.items).filter(([, i]) => !i.desc || words(i.desc) < 8);
for (const [id] of shortItems) assert(items[id], `Kurze/fehlende Beschreibung übersehen: ${id}`);
for (const [id, r] of Object.entries(items)) {
  existing(content.items, id, 'Itemtext'); fields(r, ['alt', 'neu'], [], id);
  assert.equal(r.alt, content.items[id].desc ?? '', `${id}: Ausgangstext geändert`);
  assert.notEqual(r.neu, r.alt); assert(words(r.neu) >= 8);
  // Alle bisherigen numerischen Angaben bleiben in derselben Formulierung erhalten.
  for (const sentence of r.alt.split(/(?<=[.!?])\s+/u).filter(s => /\d/.test(s))) assert(r.neu.includes(sentence), `${id}: Wert-/Effektsatz verändert: ${sentence}`);
  const oldNumbers = r.alt.match(/\d+(?:[.,]\d+)?/g) ?? [], newNumbers = r.neu.match(/\d+(?:[.,]\d+)?/g) ?? [];
  assert.deepEqual(newNumbers, oldNumbers, `${id}: Zahlen geändert/erfunden`);
}
assert.deepEqual(Object.keys(bestiary).sort(), Object.keys(content.encounters).sort(), 'Bestiarium deckt Runtime-Gegner nicht vollständig ab');
for (const [id, r] of Object.entries(bestiary)) {
  const e = content.encounters[id]; fields(r, ['titel', 'text', 'hinweis'], [], id); assert.equal(r.titel, e.name);
  const sentences = r.text.match(/[^.!?]+[.!?]+/gu) ?? [];
  assert(sentences.length >= 2 && sentences.length <= 4, `${id}: 2–4 Sätze erforderlich`);
  const named = [...r.hinweis.matchAll(/„([^“]+)“/g)].map(m => m[1]); assert.equal(named.length, 1, `${id}: genau ein belegter Angriff im Tipp`);
  const attack = e.attacks.find(a => a.name.replace(/[ .]+$/u, '') === named[0]); assert(attack, `${id}: Angriff im Tipp fehlt`);
  const a = attack;
  if (a.action === 'taunt') assert(r.hinweis.includes(`${a.value}`) && r.hinweis.includes('Nerven'), `${id}: Nervenwert`);
  else if (a.action === 'guard') assert(r.hinweis.includes(`${a.value}`) && r.hinweis.includes('Panzer'), `${id}: Panzerwert`);
  else if (a.action === 'heal') assert(r.hinweis.includes(`${a.value}`) && r.hinweis.includes('Leben'), `${id}: Heilwert`);
  else if (a.action === 'veil') assert(r.hinweis.includes('präzisen'), `${id}: Schleiertipp`);
  else if (a.bleed) assert(r.hinweis.includes('Blutung'));
  else if (r.hinweis.includes('alle ')) assert(r.hinweis.includes(`alle ${a.hits.length} Treffer`), `${id}: Trefferzahl`);
  else assert(r.hinweis.includes(`${String(a.hits[0] / 1000).replace('.', ',')} Sekunden`), `${id}: Timing`);
}
for (const [name, doc] of Object.entries(docs)) walk(doc, x => {
  for (const [k, v] of Object.entries(x)) if (typeof v === 'string' && !['alt'].includes(k)) {
    assert(!/[—–]/u.test(v), `${name}: Gedankenstrich in neuem Text`);
    assert(!/\b(?:TODO|TBD|Lorem ipsum)\b/u.test(v), `${name}: Platzhalter`);
  }
});
console.log(`OK: ${packageFiles.length} JSON-Dateien, ${newIds.size} neue lore_-IDs ohne Kollision.`);
console.log(`OK: ${news.length} Zeitungen; 32 Kettlegate-Enden eindeutig, ${wxScenarios} Wexmoor-Szenarien geprüft.`);
console.log('OK: 40 Lesestücke (20 + 20), Wortgrenzen, freie Kacheln, Nachbarschaft und Spawn-Erreichbarkeit.');
console.log(`OK: 120 Passantensätze (60 + 60), je 20 Fortschrittsreaktionen, höchstens 14 Wörter.`);
console.log(`OK: ${Object.keys(items).length} Itemtexte; ${Object.keys(content.items).length} Runtime-Items gesichtet, alle ${shortItems.length} kurzen/fehlenden Texte erfasst, Zahlen unverändert.`);
console.log(`OK: ${Object.keys(bestiary).length} Gegner inklusive ${Object.values(content.encounters).filter(e => e.elite).length} Eliten; Angriffsnamen und Kampftipps mit Runtime-Daten abgeglichen.`);
console.log(`OK: ${flagRefs} Flagreferenzen mit Setzstelle; Karten-, NPC-, Item- und Gegnerreferenzen gültig; ${dialogueEdges} Dialogsprünge (Paket enthält keine Dialoge).`);
console.log('OK: Nur Datenentwurf; keine Spielintegration und keine neuen Fortschrittsflags.');
