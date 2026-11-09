import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const data = Object.fromEntries(files.map(f => [f.slice(0,-5), read(path.join(dir,f))]));
const walk = (v, fn) => { if (!v || typeof v !== 'object') return; fn(v); for(const x of Object.values(v)) walk(x,fn); };
const source = [];
function loadTree(p) { for(const e of fs.readdirSync(p,{withFileTypes:true})) {const f=path.join(p,e.name); if(e.isDirectory())loadTree(f); else if(e.name.endsWith('.json'))source.push(read(f));} }
loadTree(path.join(root,'src/data'));
const prefix = id => assert.ok(id.startsWith('k3n_'),`Fremde neue ID: ${id}`);
const fixedMaps = ['ds_endbahnhof','ds_schwellenring','ds_arbeiterbogen','ds_kalkmarkt','ds_bruchstufen','ds_signalhang','ds_speisewagen','ds_runddepot','ds_pruefhaus','ds_teesaal','ds_lohnbuero'];
const fixedNPCs = ['k3_pfiff','k3_mabel','k3_pelham','k3_nellie','k3_huxford','k3_adaine','k3_oren','k3_esther'];
const fixedEncounters = ['geruestklang','schichtgaenger','kalkstaubgeist','signalkraehe','lohnlistenmotte','nachhall'];
const externalFlags = ['k3_arrived', ...[1,2,3,4,5].map(n=>`k3a_akt${n}_done`),'koop_aktiv'];
// These are named contracts from the AT prompt, not local stub entities or forged producers.
const sets={map:new Set(),npc:new Set(),item:new Set(),encounter:new Set(),flag:new Set(),quest:new Set(),clue:new Set(),conclusion:new Set(),object:new Set()};
for(const s of source) walk(s,o=>{
 for(const [k,t] of [['items','item'],['npcs','npc'],['encounters','encounter'],['quests','quest'],['clues','clue']]) if(o[k]&&!Array.isArray(o[k])&&typeof o[k]==='object')Object.keys(o[k]).forEach(id=>sets[t].add(id));
 if(o.maps) {if(Array.isArray(o.maps)) o.maps.forEach(m=>sets.map.add(m.id));else Object.keys(o.maps).forEach(m=>sets.map.add(m));}
 for(const f of o.sets_flags??[])sets.flag.add(f);
 if(o.done_flag)sets.flag.add(o.done_flag);
});
for(const s of source) { if(Array.isArray(s)) continue; for(const [id,o] of Object.entries(s)) {
 if(o?.kind&&o?.weight!==undefined)sets.item.add(id);
 if(o?.nodes&&o?.start)sets.object.add(id);
 if(o?.hp&&o?.attacks)sets.encounter.add(id);
 if(o?.role&&o?.dialogue)sets.npc.add(id);
}}
for(const [f,t] of [['quests','quest'],['npcs','npc'],['items','item'],['encounters','encounter']])for(const id of Object.keys(data[f])){prefix(id);sets[t].add(id);}
for(const id of Object.keys(data.dialogues))prefix(id);
for(const id of Object.keys(data.case.facts))prefix(id);
for(const id of Object.keys(data.case.clues)){prefix(id);sets.clue.add(id);assert.ok(data.case.facts[data.case.clues[id].fact]);}
for(const d of data.case.deductions){prefix(d.id);sets.conclusion.add(d.id);for(const pair of d.pairs)for(const f of pair)assert.ok(data.case.facts[f],`Unbekannter Fakt ${f}`);}
for(const p of [...data.platzierung,...data.lesestuecke])if(p.interactable){prefix(p.interactable.id);assert.ok(!sets.object.has(p.interactable.id),`Doppeltes Objekt ${p.interactable.id}`);sets.object.add(p.interactable.id);}
for(const n of data.zeitung)prefix(n.id);
walk(data,o=>{for(const f of o.sets_flags??[]){prefix(f);sets.flag.add(f);}if(o.done_flag){prefix(o.done_flag);sets.flag.add(o.done_flag);}});
const deferred = new Set();
function ref(type,id) {
 if(sets[type].has(id))return;
 const contracts={map:fixedMaps,npc:fixedNPCs,encounter:fixedEncounters,flag:externalFlags};
 if(contracts[type]?.includes(id)){deferred.add(`${type}:${id}`);return;}
 if(type==='flag'&&id.startsWith('won_'))return ref('encounter',id.slice(4));
 assert.fail(`Ungelöste Referenz ${type}:${id}`);
}
function checkDialog(id,nodes,choices=[],start) {
 for(const key of Object.keys(nodes))prefix(key);
 const entryChoices=[...choices];
 if(typeof start==='string')assert.ok(nodes[start],`${id}: Start fehlt`);
 else for(const s of start??[])assert.ok(nodes[s.node]);
 walk({nodes,entryChoices},o=>{if(o.next)assert.ok(nodes[o.next],`${id}: next ${o.next} fehlt`);});
 // Every own node must be reachable through an existing choice or standalone start.
 const todo=[...choices.map(c=>c.next).filter(Boolean),...(typeof start==='string'?[start]:(start??[]).map(s=>s.node))];const seen=new Set();
 while(todo.length){const n=todo.pop();if(seen.has(n))continue;seen.add(n);for(const c of nodes[n]?.choices??[])if(c.next)todo.push(c.next);}
 for(const n of Object.keys(nodes))assert.ok(seen.has(n),`${id}: unerreichbarer Knoten ${n}`);
}
for(const [id,d] of Object.entries(data.dialogues))checkDialog(id,d.nodes,[],d.start);
for(const [id,d] of Object.entries(data.dialog_zusaetze)){assert.ok(fixedNPCs.includes(id),`Ungeplanter Dialogzusatz ${id}`);deferred.add(`dialog:${id}`);checkDialog(id,d.nodes_add,d.choices_add);}
const condRefs={requires_flags:'flag',hide_if_flags:'flag',requires_items:'item',hide_if_items:'item',requires_clues:'clue',hide_if_clues:'clue',requires_any_clues:'clue',requires_conclusions:'conclusion',hide_if_conclusions:'conclusion',requires_quests_active:'quest',requires_quests_done:'quest',hide_if_quests:'quest',gives_clues:'clue',start_quests:'quest',complete_quests:'quest'};
walk(data,o=>{
 for(const [k,t] of Object.entries(condRefs))for(const id of o[k]??[])ref(t,id);
 for(const k of ['gives_items','takes_items'])if(o[k])for(const id of Array.isArray(o[k])?o[k]:Object.keys(o[k]))ref('item',id);
 if(typeof o.map==='string')ref('map',o.map);
 if(o.npc)ref('npc',o.npc);
 if(o.encounter)ref('encounter',o.encounter);
 if(o.target){const id=o.target.id;if(!sets.object.has(id))ref('npc',id);}
 if(o.dialogue)assert.ok(data.dialogues[o.dialogue],`Dialog fehlt ${o.dialogue}`);
});
for(const id of Object.keys(data.bestiarium)){assert.ok(fixedEncounters.includes(id));ref('encounter',id);}
assert.equal(Object.keys(data.quests).length,12);
assert.equal(Object.values(data.gerede.dunscar).flat().length,60);
assert.equal(data.lesestuecke.length,25);assert.equal(data.zeitung.length,8);assert.equal(Object.keys(data.bestiarium).length,6);
assert.equal([...Object.values(data.dialog_zusaetze).flatMap(d=>d.choices_add),...Object.values(data.dialogues).flatMap(d=>Object.values(d.nodes).flatMap(n=>n.choices??[]))].filter(c=>c.requires_flags?.includes('koop_aktiv')).length,4);
for(const [map,rows]of Object.entries(data.gerede.dunscar)){ref('map',map);assert.equal(rows.length,10);for(let a=1;a<=5;a++)assert.equal(rows.filter(r=>r.requires_flags.includes(a===1?'k3_arrived':`k3a_akt${a-1}_done`)).length,2);}
for(const l of data.lesestuecke)assert.ok(l.interactable.text.split(/\s+/).length<=120,`${l.interactable.id}: zu lang`);
const allNodes=[...Object.values(data.dialogues).map(d=>d.nodes),...Object.values(data.dialog_zusaetze).map(d=>d.nodes_add)];
for(const [id,q]of Object.entries(data.quests)){
 assert.ok(q.steps.length>=3&&q.steps.length<=6,`${id}: Schritte`);assert.equal(q.kind,'side');assert.equal(q.case,'kapitel3');
 const completions=allNodes.flatMap(ns=>Object.entries(ns)).filter(([,n])=>n.complete_quests?.includes(id));assert.equal(completions.length,2,`${id}: zwei Ausgänge`);
 for(const [nid,n]of completions){assert.ok(n.gives_money>0||n.honor>0||n.gives_items,`${id}: Belohnung fehlt`);assert.ok(n.sets_flags.includes(id+'_done'));
  // Award nodes have no outgoing next. Every inbound is active-quest + done guarded.
  assert.ok(n.choices.every(c=>!c.next),`${nid}: Auszahlungszyklus`);
  const incoming=allNodes.flatMap(ns=>Object.values(ns)).flatMap(n=>n.choices??[]).filter(c=>c.next===nid);
  assert.ok(incoming.length>0);for(const c of incoming){assert.ok(c.requires_quests_active?.includes(id));assert.ok(c.hide_if_flags?.includes(id+'_done'));}
 }
 for(const step of q.steps)assert.ok(step.done&&step.target);
}
// Monotonic content walk for all 24 resolution branches (journal + flags + quest effects).
// This verifies authored reachability only, not the absent host chapter/map/Party code.
function playable(chosen, world){
 const st={flags:new Set(world),quests:new Set(),done:new Set(),clues:new Set(),conclusions:new Set(),paid:new Set()};
 const ok=o=>{
  for(const f of o.requires_flags??[])if(!st.flags.has(f))return false;
  for(const f of o.hide_if_flags??[])if(st.flags.has(f))return false;
  for(const q of o.requires_quests_active??[])if(!st.quests.has(q)||st.done.has(q))return false;
  for(const q of o.hide_if_quests??[])if(st.quests.has(q)||st.done.has(q))return false;
  for(const q of o.requires_quests_done??[])if(!st.done.has(q))return false;
  for(const c of o.requires_clues??[])if(!st.clues.has(c))return false;
  for(const c of o.requires_conclusions??[])if(!st.conclusions.has(c))return false;
  return true;
 };
 const apply=o=>{for(const f of o.sets_flags??[])st.flags.add(f);if(o.done_flag)st.flags.add(o.done_flag);for(const q of o.start_quests??[])st.quests.add(q);for(const q of o.complete_quests??[])st.done.add(q);for(const c of o.gives_clues??[])st.clues.add(c);};
 const visited=new Set();
 function node(ns,id){if(visited.has(id))return;const n=ns[id];if(!n)return;if(n.complete_quests&&!chosen.has(id))return;visited.add(id);apply(n);}
 for(let cycle=0;cycle<50;cycle++){
  for(const p of data.platzierung){if(ok(p.visible_if??{})&&p.interactable){apply(p.interactable);apply(p.interactable.effects??{});}}
  for(const [id,d]of Object.entries(data.dialog_zusaetze))for(const c of d.choices_add)if(ok(c)&&c.next)node(d.nodes_add,c.next);
  for(const d of Object.values(data.dialogues))node(d.nodes,d.start);
  for(const ns of allNodes)for(const [id,n]of Object.entries(ns))if(visited.has(id))for(const c of n.choices??[])if(ok(c)&&c.next)node(ns,c.next);
  for(const d of data.case.deductions)if(d.pairs.some(pair=>pair.every(f=>[...st.clues].some(c=>data.case.clues[c]?.fact===f))))st.conclusions.add(d.id);
 }
 for(const q of Object.keys(data.quests))assert.ok(st.done.has(q),`${q}: nicht erreichbar (${[...world].join(',')})`);
 for(const id of chosen)assert.ok(visited.has(id),`Ausgang nicht erreichbar ${id}`);
}
const resolutions=Object.keys(data.quests).map(q=>allNodes.flatMap(ns=>Object.entries(ns)).filter(([,n])=>n.complete_quests?.includes(q)).map(([id])=>id));
let runs=0;
for(const end of ['rein','moor','lichtmeister','meer'])for(const k1 of ['marlowe_trusts','star_shattered','star_fallen'])for(const coop of [false,true])for(const branch of [0,1]){
 playable(new Set(resolutions.map(r=>r[branch])),[...externalFlags.filter(f=>f!=='koop_aktiv'),`k2_end_${end}`,k1,...(coop?['koop_aktiv']:[])]);runs++;
}
console.log(`OK: ${files.length} JSON-Dateien; 12 Quests; 24 Ausgänge; 60 Gerede; 25 Lesestücke; 8 Meldungen; 6 Bestiarium; 4 Koop-Zweige.`);
console.log('OK: Schema-Grundformen, Präfixe, Knoten/next/Erreichbarkeit, Flags, Fakten, Hinweise, Karten/NPC/Item/Kampf-Referenzen und Auszahlungssperren.');
console.log(`OK: ${runs} Inhaltsdurchläufe (4 Wexmoor-Enden × 3 Kettlegate-Absender × Solo/Koop × 2 Ausgangsgruppen).`);
console.log(`OFFEN: ${deferred.size} ausdrücklich deklarierte Fremdverträge aus AR/AS/AI; keine lokalen Ersatzdefinitionen.`);
for(const r of [...deferred].sort())console.log(`  ${r}`);
if(process.argv.includes('--strict-integration')&&deferred.size){console.error('NICHT INTEGRIERT: Fremdverträge müssen vor Aktivierung im Spiel aufgelöst werden.');process.exitCode=1;}
// Detect misspelled or invented engine fields in the authored core structures.
const conditions=['requires_flags','hide_if_flags','requires_items','hide_if_items','requires_clues','hide_if_clues','requires_any_clues','requires_conclusions','hide_if_conclusions','requires_quests_active','requires_quests_done','hide_if_quests','requires_money','requires_honor','requires_nerves','max_nerves','requires_bond','requires_pathway'];
const effects=['sets_flags','clears_flags','gives_items','takes_items','gives_money','takes_money','gives_clues','start_quests','complete_quests','honor','bond','wanted','encounter','travel','nerves','unruhe','damage','heal','scene','shop'];
function keys(o,allowed,label){for(const k of Object.keys(o))assert.ok(allowed.includes(k),`${label}: unbekanntes Feld ${k}`);}
for(const [id,q] of Object.entries(data.quests)){keys(q,['title','kind','case','summary','steps'],id);for(const s of q.steps){keys(s,['text','done','target'],id);keys(s.done,conditions,id);keys(s.target,['map','id','label'],id);}}
for(const ns of allNodes)for(const [id,n]of Object.entries(ns)){keys(n,['text','choices',...effects],id);for(const c of n.choices??[])keys(c,['text','next',...conditions],id);}
for(const d of Object.values(data.dialog_zusaetze))for(const c of d.choices_add)keys(c,['text','next',...conditions],'Zusatz');
for(const p of [...data.platzierung,...data.lesestuecke]){keys(p,['map','tile','npc','interactable','visible_if'],'Platzierung');if(p.visible_if)keys(p.visible_if,conditions,'Sichtbarkeit');if(p.interactable){const o=p.interactable;keys(o,['id','kind','sprite','prompt','title','text','footer','done_flag','effects','visible_if'],'Leseobjekt');if(o.effects)keys(o.effects,effects,'Leseeffekt');if(o.visible_if)keys(o.visible_if,conditions,'Lesebedingung');}}
console.log('OK: Feld-Whitelist für Quests, Schritte, Dialogknoten, Choices, Platzierungen und Effekte.');
