import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../../../tests/helpers.js';
import { applyQuestPack } from '../../../src/data/questPacks.js';
import { GameState } from '../../../src/core/GameState.js';

const dir = new URL('./', import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(`${name}.json`, dir), 'utf8'));
const names = ['quests', 'items', 'encounters', 'dialogues', 'npcs', 'case', 'dialog_zusaetze', 'platzierung', 'geplauder', 'kampf', 'bindung'];
const pack = { name: 'koop_k3', ...Object.fromEntries(names.map(n => [n, read(n)])) };
const content = loadContent();
const walk = (v, f, path = '') => {
  if (!v || typeof v !== 'object') return;
  f(v, path);
  for (const [k, x] of Object.entries(v)) walk(x, f, `${path}/${k}`);
};
const effectFlags = new Set();
function definitions(v) {
  walk(v, o => {
    for (const f of o.sets_flags ?? []) effectFlags.add(f);
    if (o.done_flag) effectFlags.add(o.done_flag);
  });
}
// Definitions must come from actual setters, never from a reference just being present.
function scan(path) {
  for (const e of readdirSync(path, { withFileTypes: true })) {
    const p = `${path}/${e.name}`;
    if (e.isDirectory()) scan(p);
    else if (e.name.endsWith('.json')) definitions(JSON.parse(readFileSync(p, 'utf8')));
  }
}
scan(fileURLToPath(new URL('../../../src/data', dir)));
definitions(pack);
const external = new Set(['koop_aktiv', 'koop_ds_schleuse_bindung_bestaetigt', 'koop_ds_schleuse_rueckkehr_geprueft']);
for (const f of external) effectFlags.add(f);
for (const f of ['koop_ds_schleuse_bindung_bestaetigt', 'koop_ds_schleuse_rueckkehr_geprueft']) {
  walk(pack, o => assert(!(o.sets_flags ?? []).includes(f), `${f} darf nur der Adapter erzeugen`));
}
const before = new Set(Object.keys(content.dialogues));
applyQuestPack(content, pack);
const all = [...Object.values(pack.dialogues), ...Object.entries(pack.dialog_zusaetze).map(([id]) => content.dialogues[id])];
const refs = new Set(); let textCount = 0;
walk(pack, (o, path) => {
  for (const k of ['requires_flags', 'hide_if_flags', 'sets_flags', 'clears_flags']) {
    for (const f of o[k] ?? []) { assert(effectFlags.has(f), `${path}: unbekanntes Flag ${f}`); refs.add(f); }
  }
  for (const k of ['sets_flags', 'clears_flags']) for (const f of o[k] ?? []) assert(f.startsWith('koop_ds_'), `fremdes Schreibflag ${f}`);
  for (const id of o.requires_clues ?? []) assert(content.clues[id], `Hinweis ${id}`);
  for (const id of o.requires_items ?? []) assert(content.items[id], `Item ${id}`);
  for (const k of ['gives_items', 'takes_items']) for (const id of Object.keys(o[k] ?? {})) assert(content.items[id], `Item ${id}`);
  for (const k of ['start_quests', 'complete_quests', 'requires_quests_active']) for (const id of o[k] ?? []) assert(content.quests[id], `Quest ${id}`);
  for (const id of Object.keys(o.bond ?? {})) assert(content.npcs[id], `Bindungsfigur ${id}`);
  if (typeof o.map === 'string') assert(content.maps[o.map], `Karte ${o.map}`);
  if (o.dialogue) assert(content.dialogues[o.dialogue], `Dialog ${o.dialogue}`);
  if (o.requires_pathway) assert(content.pathways[o.requires_pathway[0]], `Pfad ${o.requires_pathway}`);
  for (const k of ['text', 'a', 'b', 'title', 'summary', 'prompt', 'footer']) if (typeof o[k] === 'string') {
    assert([...o[k]].length <= 160, `${path}/${k}: ${[...o[k]].length} Zeichen`); textCount++;
  }
  assert(!('platzhalter' in o));
});
// Also validate raw string catalogues (barks, warnings, rule).
function strings(v, p = '') {
  if (typeof v === 'string') { assert([...v].length <= 160, `${p}: zu lang`); textCount++; }
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) strings(x, `${p}/${k}`);
}
strings(pack.kampf); strings(pack.bindung);
const g = pack.geplauder;
assert.equal(g.length, 40);
assert.deepEqual(g.map(x => x.id), Array.from({ length: 40 }, (_, i) => `koop_pl_ds_${String(i + 1).padStart(2, '0')}`));
const ds = Object.keys(content.maps).filter(x => x.startsWith('ds_'));
assert.equal(ds.length, 18);
for (const m of ds) assert(g.some(x => x.map === m), `kein Gespräch auf ${m}`);
for (const m of ['endbahnhof', 'schwellenring', 'arbeiterbogen', 'kalkmarkt', 'bruchstufen', 'signalhang']) {
  for (const act of [1, 3, 5]) assert(g.some(x => x.map === `ds_${m}` && x.hide_if_flags?.includes(`k3a_akt${act}_done`)), `${m} Akt ${act}`);
}
assert.equal(g.filter(x => x.map === 'ds_speisewagen').length, 4);
for (const m of ['ds_nachtzug_wagen', 'ds_nachtzug_lok', 'ds_letzter_bahnsteig']) assert.equal(g.filter(x => x.map === m).length, 2);
assert.equal(g.filter(x => x.requires_flags.some(f => f.startsWith('k2_end_'))).length, 6);
assert.equal(g.filter(x => x.requires_pathway).length, 4);
const patterns = JSON.parse(readFileSync(new URL('../k3_akte/rufmuster.json', dir), 'utf8'));
assert.equal(g.filter(x => x.requires_clues).length, 4);
for (const x of g) {
  assert(x.requires_flags.includes('koop_aktiv'));
  assert(x.zeilen.length >= 3 && x.zeilen.length <= 5);
  for (const z of x.zeilen) assert(z.p === 'p1' ? !!z.text : z.p === 'p2' && !!z.a && !!z.b);
  for (const clue of x.requires_clues ?? []) assert(patterns.some(p => p.gefunden_durch === clue));
}
assert.deepEqual(Object.keys(pack.kampf).sort(), ['koop_nachhall', 'koop_pruefung', 'koop_schichtgaenger']);
for (const v of Object.values(pack.kampf)) for (const [voice, n] of [['p2a', 10], ['p2b', 10], ['p1', 5]]) {
  assert.equal(v[voice].length, n); assert.equal(new Set(v[voice]).size, n);
}
for (const s of ['p1', 'p2a', 'p2b']) assert.equal(pack.bindung.koop_ds_partner_gebunden[s].length, 5);
const contract = readFileSync(new URL('../k3_orte/rufmechanik.md', dir), 'utf8');
for (const station of ['drehscheibe', 'hund', 'vorhauer', 'verteiler', 'bahnsteig', 'tiefe']) {
  assert(contract.includes(`k3o_horch_${station}`));
  for (const suffix of ['p1_ruft', 'p2_ruft', 'warnung', 'gebunden', 'schleuse']) assert(pack.bindung[`koop_ds_bindung_${station}_${suffix}`]);
  for (const voice of ['p1', 'p2a', 'p2b']) {
    assert(pack.bindung[`koop_ds_bindung_${station}_warnung`][voice]);
    assert(pack.bindung[`koop_ds_bindung_${station}_gebunden`][voice].length >= 3);
    assert.equal(pack.bindung[`koop_ds_bindung_${station}_schleuse`][voice].length, 2);
  }
}
const npcs = ['pfiff', 'gallowmere', 'willa', 'oren', 'mabel', 'pelham', 'nellie', 'huxford', 'esther', 'adaine', 'weichenstellerin'];
assert.equal(Object.keys(pack.dialog_zusaetze).length, 11);
for (const n of npcs) {
  const id = content.npcs[`k3_${n}`]?.dialogue; const extra = pack.dialog_zusaetze[id];
  assert(extra, `Zusatz fehlt: ${n}`); assert.deepEqual(Object.keys(extra).sort(), ['choices_add', 'nodes_add']);
  assert.equal(extra.choices_add.length, 1); assert(extra.choices_add[0].requires_flags.includes('koop_aktiv'));
  assert.equal(Object.keys(extra.nodes_add).length, 2);
  assert(content.dialogues[id].nodes[content.dialogues[id].start].choices.some(c => c.next === extra.choices_add[0].next));
  walk(extra, o => { assert(!o.gives_money && !o.gives_items && !o.bond); assert((o.nerves ?? 0) <= 5); });
}
function targets(x) {
  if (!x) return [];
  if (typeof x === 'string') return [x];
  return x.map(c => c.node);
}
let nodeCount = 0;
for (const [id, d] of Object.entries(pack.dialogues)) {
  const reached = new Set(); const pending = targets(d.start);
  while (pending.length) {
    const n = pending.pop(); assert(d.nodes[n], `${id}/${n} fehlt`);
    if (reached.has(n)) continue;
    reached.add(n);
    for (const c of d.nodes[n].choices ?? []) pending.push(...targets(c.next));
  }
  assert.equal(reached.size, Object.keys(d.nodes).length, `${id}: unerreichbare Knoten`); nodeCount += reached.size;
}
for (const d of all) for (const n of Object.values(d.nodes)) for (const c of n.choices ?? []) for (const t of targets(c.next)) assert(d.nodes[t], `Knotenziel ${t}`);
const objectIds = new Set();
for (const p of pack.platzierung) {
  const [x, y] = p.tile; const map = content.maps[p.map];
  assert(Number.isInteger(x) && Number.isInteger(y) && y >= 0 && x >= 0 && y < map.rows.length && x < map.rows[y].length);
  assert(!['I', '#'].includes(map.rows[y][x]), `Wand: ${p.interactable.id}`);
  assert(!objectIds.has(p.interactable.id)); objectIds.add(p.interactable.id);
  if (/_p[12]$/.test(p.interactable.id)) assert(!p.interactable.done_flag);
}
for (const [id, q] of Object.entries(pack.quests)) {
  assert(pack.platzierung.some(p => p.interactable.dialogue === `${id}_auftrag`));
  assert.equal(q.reward.gives_money, 0);
  for (const step of q.steps) assert(content.maps[step.target.map].interactables.some(o => o.id === step.target.id));
}
const lever = pack.platzierung.find(p => p.interactable.id === 'koop_ds_schleuse_p2').tile;
const shard = pack.platzierung.find(p => p.interactable.id === 'koop_ds_schleuse_fund').tile;
assert.equal(Math.abs(lever[0] - shard[0]) + Math.abs(lever[1] - shard[1]), 6);
for (let x = lever[0]; x <= shard[0]; x++) assert.notEqual(content.maps.ds_rufschlucht.rows[lever[1]][x], 'I');

// Simulations use real GameState conditions/effects. External spatial/BN verdicts are deliberately explicit.
function state() {
  const s = new GameState(content); s.addP2(); s.flags.add('k3_arrived');
  for (let i = 1; i <= 4; i++) s.flags.add(`k3a_akt${i}_done`);
  s.addItem('k3a_signalgeraet', 1); s.signal.charges = 3; return s;
}
function enter(s, id) {
  const tree = content.dialogues[id]; let current = s.pick(tree.start);
  const apply = () => s.applyEffects(tree.nodes[current], { nodeKey: `${id}.${current}` }); apply();
  return {
    get current() { return current; },
    choose(text) {
      const c = tree.nodes[current].choices.find(c => c.text === text && s.meets(c));
      assert(c, `${id}/${current}: nicht verfügbar: ${text}`);
      current = s.pick(c.next); if (current) apply(); return current;
    },
    enabled() { return tree.nodes[current].choices.filter(c => s.meets(c)).map(c => c.text); },
  };
}
function accept(s, q) { enter(s, `${q}_auftrag`).choose('Wir übernehmen das.'); assert.equal(s.quests[q], 'active'); }
function occupy(s, q) { s.flags.add(`${q}_p1`); s.flags.add(`${q}_p2`); }
function revokeEach(s, flags, c) {
  for (const f of flags) { s.flags.delete(f); assert(!s.meets(c), `fehlende Rolle akzeptiert: ${f}`); s.flags.add(f); }
}
const h = 'koop_ds_horchen';
{
  const s = state(); accept(s, h); const initial = enter(s, `${h}_ruf`);
  assert(!initial.enabled().includes('Den Depotpfiff senden. Eine Ladung.'));
  occupy(s, h); s.signal.charges = 0;
  assert(!initial.enabled().includes('Den Depotpfiff senden. Eine Ladung.'));
  s.signal.charges = 3;
  const run = (direction) => { const d = enter(s, `${h}_ruf`); d.choose('Den Depotpfiff senden. Eine Ladung.'); d.choose('Spieler 2 liest die Antwort.'); d.choose('Spieler 1 wählt die gemeldete Richtung.'); d.choose(direction); };
  run('Norden.'); assert.equal(s.signal.charges, 2); assert(!s.flags.has(`${h}_p1`)); assert(!s.flags.has(`${h}_ruf_laeuft`));
  occupy(s, h); const money = s.money; const bond = s.bond('k3_pfiff'); run('Osten.');
  assert.equal(s.signal.charges, 1); assert.equal(s.money - money, 40); assert.equal(s.bond('k3_pfiff') - bond, 1);
  assert.equal(s.quests[h], 'done'); assert(s.flags.has('koop_ds_hinterzugang'));
  assert.equal(enter(s, `${h}_ruf`).current, `${h}_quittung`);
  assert.equal(enter(s, `${h}_auftrag`).current, `${h}_quittung`);
  assert.equal(s.money - money, 40);
}
const q = 'koop_ds_schleuse';
for (const swap of [false, true]) {
  const s = state(); accept(s, q); occupy(s, q); const money = s.money;
  s.addItem('k3o_trichterglas', 2); const oldShard = s.itemCount('k3o_trichterglas'); const oldRing = s.itemCount('k3o_stillring');
  const d = enter(s, `${q}_gang`);
  d.choose(swap ? 'Rollen tauschen: Spieler 2 geht; Spieler 1 hält.' : 'Spieler 1 geht hinaus; Spieler 2 hält innen.');
  assert(s.flags.has(`${q}_p${swap ? 2 : 1}_draussen`)); assert(!s.flags.has(`${q}_p${swap ? 1 : 2}_draussen`));
  d.choose('Die persönliche Bindungswarnung lesen.'); d.choose('Ich stimme der privaten Namensantwort ausdrücklich zu.');
  assert(!d.enabled().includes('Gebunden hinausgehen: zwei Kacheln.'));
  // Assumption: BN confirmed this actor's explicit private consent, not a dialogue-side fake binding.
  s.flags.add(`${q}_bindung_bestaetigt`);
  d.choose('Gebunden hinausgehen: zwei Kacheln.'); d.choose('Zum Splitter weitergehen.'); d.choose('Splitter greifen und sofort zurück.');
  assert.equal(s.itemCount('k3o_trichterglas'), oldShard); assert(!d.enabled().includes('Die geprüfte Rückkehr abschließen.'));
  // Assumption: adapter moved walker through the held sluice before round 3 and BN cleared only their binding.
  s.flags.add(`${q}_rueckkehr_geprueft`);
  const success = pack.dialogues[`${q}_gang`].nodes[`${q}_rueckweg`].choices[0];
  revokeEach(s, ['koop_aktiv', `${q}_p1`, `${q}_p2`, `${q}_bindung_bestaetigt`, `${q}_rueckkehr_geprueft`], success);
  d.choose('Die geprüfte Rückkehr abschließen.'); assert.equal(s.money - money, 60);
  assert.equal(s.itemCount('k3o_trichterglas'), oldShard + 1); assert.equal(s.itemCount('k3o_stillring'), oldRing + 1);
  assert.equal(s.quests[q], 'done'); assert(!s.flags.has(`${q}_p1`)); assert(!s.flags.has(`${q}_bindung_bestaetigt`));
  assert.equal(enter(s, `${q}_gang`).current, `${q}_quittung`); assert.equal(s.money - money, 60);
}
for (const fail of ['decline', 'detour', 'return']) {
  const s = state(); accept(s, q); occupy(s, q); s.addItem('k3o_trichterglas', 2);
  const money = s.money, inventory = s.itemCount('k3o_trichterglas'); const d = enter(s, `${q}_gang`);
  d.choose('Spieler 1 geht hinaus; Spieler 2 hält innen.'); d.choose('Die persönliche Bindungswarnung lesen.');
  if (fail === 'decline') d.choose('Nein. Wir brechen ab.');
  else {
    d.choose('Ich stimme der privaten Namensantwort ausdrücklich zu.'); s.flags.add(`${q}_bindung_bestaetigt`);
    d.choose('Gebunden hinausgehen: zwei Kacheln.'); d.choose(fail === 'detour' ? 'Nach dem Suchlaut sehen.' : 'Sofort zurück.');
  }
  assert.equal(s.money, money); assert.equal(s.itemCount('k3o_trichterglas'), inventory);
  assert.equal(s.quests[q], 'active'); assert(!s.flags.has(`${q}_p1`));
  assert.equal(enter(s, `${q}_gang`).current, `${q}_start`);
}
console.log(`OK: 40 eindeutige Gespräche, 18 Karten, 6 Endenbezüge, 4 p2-Pfade, 4 Rufmuster-Hinweise.`);
console.log('OK: 75 Kampfsprüche + 15 Bindungsreaktionen; 6 Horchstellen; 11 NPC-Zusätze.');
console.log(`OK: ${refs.size} Flag-Referenzen, ${pack.platzierung.length} Platzierungsvorschläge, ${nodeCount} erreichbare eigene Dialogknoten; Texte <= 160 Zeichen.`);
console.log('OK: 2 Quests vom Einstieg bis Abschluss; Horchen richtig/falsch/leer; Schleuse beide Rollen, Ablehnen, Umweg und Rückzug; Einmalprämien.');
console.log('GRENZE: Räumliche Gleichzeitigkeit, private Bindung, Rückkehr und p2-Pfadkontext benötigen den dokumentierten Adapter; keine Laufzeitfreigabe.');
