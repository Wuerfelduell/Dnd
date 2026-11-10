import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent } from '../../../tests/helpers.js';
const root = new URL('../../../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const data = name => read(`src/data/packs/koop_beute/${name}.json`);
const c = loadContent({ without: ['koop_beute'] }), sources = data('ansprueche'), replacements = data('ersatz');
const texts = data('texte'), dialogs = data('dialog_zusaetze');
const declared = new Set();
function walk(v, fn) { fn(v); if (v && typeof v === 'object') for (const x of Object.values(v)) walk(x, fn); }
walk(c, v => { if (v?.sets_flags) for (const f of v.sets_flags) declared.add(f); });
// Combat.finish erzeugt diese Flags für real existierende Begegnungen.
for (const id of Object.keys(c.encounters)) declared.add(`won_${id}`);
let rewards = 0;
for (const [id, def] of Object.entries(sources)) {
  assert.ok(def.flags.includes(id), `${id}: kanonisches Flag fehlt`);
  for (const flag of [...def.flags, ...(def.blocked_by ?? [])]) assert.ok(declared.has(flag), `Flag nicht im Inhalt: ${flag}`);
  assert.ok(def.rewards.length > 0);
  for (const r of def.rewards) {
    assert.ok(c.items[r.item], `Item fehlt: ${r.item}`);assert.equal(r.qty, 1);
    if (r.requires_pathway) { const [pid, max] = r.requires_pathway;assert.ok(c.pathways[pid]?.seqs[max]); }
    assert.ok(!['key'].includes(c.items[r.item].kind));
    if(c.items[r.item].kind==='artifact') assert.equal(r.personal,true);
    rewards++;
  }
  assert.equal(typeof texts.k3b_offen[id], 'string');
}
// 33 Hüterzutaten aus AS exakt übernehmen, inklusive dessen Sequenzgrenzen.
const loot = read('src/data/packs/k3_orte/beute_vorschlag.json');
for (const boss of ['schwellenhund','vorhauer','vielrufer','unterschicht']) {
  const d=loot[`k3o_${boss}_beute`];
  const expected=d.nodes.k3o_start.choices.filter(v=>v.requires_pathway).map(v=>({item:Object.keys(d.nodes[v.next].gives_items)[0],qty:1,requires_pathway:v.requires_pathway}));
  assert.deepEqual(sources[`won_${boss}`].rewards,expected);
}
assert.equal(replacements.length,90);
assert.equal(new Set(replacements.map(r=>`${r.pathway}:${r.seq}`)).size,90);
for(const pid of Object.keys(c.pathways)) for(let seq=1;seq<=9;seq++) {
  const r=replacements.find(v=>v.pathway===pid&&v.seq===seq);assert.ok(r,`${pid}/${seq}`);
  for(const key of ['item','core','potion','formula']) assert.ok(c.items[r[key]],`${r.id}.${key}`);
  assert.ok(Object.hasOwn(c.pathways[pid].seqs[seq].ingredients,r.core));
  assert.equal(c.items[r.potion].pathway,pid);assert.equal(c.items[r.potion].seq,seq);
  const price=c.market.merchants.kittering.stock.find(v=>v.item===r.formula);
  assert.equal(r.formula_cost,price.price);assert.equal(r.formula_honor,price.requires_honor??0);
  assert.equal(r.cost,seq<=5?0:price.price);assert.equal(r.where,seq<=5?'hedda':'pfiff');
  if(r.source_type==='claim') assert.ok(sources[r.source].rewards.some(v=>v.item===r.core));
  else {assert.equal(r.source_type,'acquisition');assert.equal(r.source,`k3b_erworben_${pid}_${seq}`);}
}
let messages=0;
walk(texts,v=>{if(typeof v==='string'){assert.ok([...v].length<=140,`Text zu lang: ${v}`);messages++;}});
for(const [id,patch] of Object.entries(dialogs)) {
  assert.ok(c.dialogues[id],`Dialog fehlt: ${id}`);
  assert.deepEqual(Object.keys(patch).sort(),['choices_add','nodes_add']);
  for(const key of Object.keys(patch.nodes_add)){assert.ok(key.startsWith('k3b_'));assert.ok(!c.dialogues[id].nodes[key]);}
  walk(patch,v=>{
    if(!v||typeof v!=='object'||Array.isArray(v)) return;
    if(v.next) assert.ok(patch.nodes_add[v.next]||c.dialogues[id].nodes[v.next],`${id}: Ziel ${v.next} fehlt`);
    for(const k of ['claim','requires_claim','requires_claim_missing']) if(v[k]) assert.ok(sources[v[k]]);
    const r=v.requires_replacement??v.replacement;if(r) assert.ok(replacements.some(x=>x.seq===r.seq&&x.pathway===r.pathway));
    for(const k of ['gives_items','gives_money','takes_money','honor','sets_flags','complete_quests']) assert.ok(!v[k],`${id}: ungesicherter Effekt ${k}`);
    if(v.text) assert.ok([...v.text].length<=140,`${id}: langer Text ${v.text}`);
  });
}
console.log(`OK: ${Object.keys(sources).length} Quellen, ${rewards} persönliche Zutaten, 90 Ersatzzeilen, ${messages} Kurztexte, ${Object.keys(dialogs).length} Dialogzusätze.`);
console.log('Hinweis: Erwerbsquellen sind persönliche BG-Quittungen, keine erfundenen Bestandsflags. Artefakt-Fundflags fehlen im Bestand; siehe offene_punkte.md.');
