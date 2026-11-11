import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {loadContent} from '../../../tests/helpers.js';
const here=path.dirname(new URL(import.meta.url).pathname), root=path.resolve(here,'../../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const own=Object.fromEntries(fs.readdirSync(here).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),read(path.join(here,f))]));
function walk(v,fn){if(!v||typeof v!=='object')return;fn(v);for(const x of Object.values(v))walk(x,fn);}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(path.join(dir,d.name)):d.name.endsWith('.json')?[path.join(dir,d.name)]:[]);}
const stock={};for(const type of ['figuren','gegner','items'])for(const f of files(path.join(root,'docs/story/vorrat_'+type))){stock[f]=read(f);}
const live=loadContent();const flags=new Set();for(const data of [...Object.values(own),...Object.values(stock),...files(path.join(root,'src/data')).map(read)])walk(data,o=>{for(const f of o.sets_flags??[])flags.add(f);if(o.done_flag)flags.add(o.done_flag);});
// Exact external contracts from CG/CC briefs. Missing implementations remain visible, not silently accepted.
const externalFlags=new Set(['cwa_end_widerspruch','cwa_end_amtsinhaber','cwa_end_buecher','cwa_end_ordnung','kapitel4_done']);
const externalMaps=new Set([...fs.readFileSync(path.join(root,'docs/art/codex_CG_k5_akte.md'),'utf8').matchAll(/\| `(bh_[a-z_]+)` \|/g)].map(m=>m[1]).concat(['cw_buchbinderei','reise_landstrasse']));
const ids={npc:new Set(Object.keys(live.npcs)),item:new Set(Object.keys(live.items)),encounter:new Set(Object.keys(live.encounters)),map:new Set(Object.keys(live.maps))};
for(const [file,d] of Object.entries(stock))for(const [name,type] of [['npcs.json','npc'],['items.json','item'],['encounters.json','encounter'],['bosses.json','encounter']])if(file.endsWith('/'+name))for(const id of Object.keys(d))ids[type].add(id);
for(const [name,type] of [['npcs','npc'],['items','item'],['encounters','encounter']])for(const id of Object.keys(own[name])){assert(id.startsWith('bha_'),id);ids[type].add(id);}
const dialogs={...live.dialogues};for(const [f,d] of Object.entries(stock))if(f.endsWith('/dialogues.json'))Object.assign(dialogs,d);Object.assign(dialogs,own.dialogues);
for(const [id,x] of Object.entries(own.dialog_zusaetze)){assert(dialogs[id],id);const nodes={...dialogs[id].nodes};for(const n of Object.keys(x.nodes_add)){assert(!nodes[n],`overwrite ${n}`);assert(n.startsWith('bha_'));}dialogs[id]={...dialogs[id],nodes:{...nodes,...x.nodes_add}};}
let nodeCount=0;for(const [id,d] of Object.entries(own.dialogues)){assert(id.startsWith('bha_'));assert(d.nodes[d.start]);}
for(const [id,d] of Object.entries({...own.dialogues,...Object.fromEntries(Object.keys(own.dialog_zusaetze).map(id=>[id,dialogs[id]]))})){const nodes=d.nodes;walk(nodes,o=>{if(typeof o.next==='string')assert(nodes[o.next],`${id}/${o.next}`);});nodeCount+=id in own.dialogues?Object.keys(nodes).length:Object.keys(own.dialog_zusaetze[id].nodes_add).length;}
for(const [id,x] of Object.entries(own.dialog_zusaetze))for(const c of x.choices_add)assert(dialogs[id].nodes[c.next],c.next);
const pendingFlags=new Set(),pendingMaps=new Set();
walk(own,o=>{
 for(const f of o.requires_flags??[]){if(f.startsWith('won_')){assert(ids.encounter.has(f.slice(4)),f);continue;}if(!flags.has(f)){assert(externalFlags.has(f),'unset '+f);pendingFlags.add(f);}}
 for(const key of ['map','karte'])if(typeof o[key]==='string'&&!ids.map.has(o[key])){assert(externalMaps.has(o[key]),'map '+o[key]);pendingMaps.add(o[key]);}
 if(o.npc)assert(ids.npc.has(o.npc),o.npc);
 for(const key of ['gives_items','takes_items'])for(const id of Object.keys(o[key]??{}))assert(ids.item.has(id),'item '+id);
 if(o.encounter)assert(ids.encounter.has(o.encounter),o.encounter);
 if(o.dialogue)assert(dialogs[o.dialogue],o.dialogue);
 for(const key of ['gives_clues','requires_clues'])for(const id of o[key]??[])assert(own.case.clues[id]||live.clues[id],id);
 for(const id of Object.keys(o.bond??{}))assert(ids.npc.has(id),id);
});
assert.equal(Object.keys(own.quests).length,5);assert.equal(Object.keys(own.case.clues).length,80);assert.equal(own.case.deductions.length,20);assert.equal(own.patienten.length,12);assert.equal(own.ventile.length,12);assert.equal(Object.keys(own.case.endings).length,4);assert(nodeCount>=200&&nodeCount<=300,nodeCount);
for(const c of Object.values(own.case.clues))assert(own.case.facts[c.fact],c.fact);
for(const d of own.case.deductions){assert(d.id.startsWith('bha_'));for(const pair of d.pairs)for(const f of pair)assert(own.case.facts[f],f);}
// Each valve opening closes all other members of its bank, proving the <=3 invariant by induction.
const valves=own.ventile;for(let i=0;i<12;i++){const v=valves[i],n=own.dialogues[v.id].nodes[v.id+'_warm'];for(let j=Math.floor(i/4)*4;j<Math.floor(i/4)*4+4;j++)if(i!==j)assert(n.clears_flags.includes(valves[j].id+'_offen'));}
for(const p of own.patienten){assert.equal(p.entscheidung,null);assert(own.dialogues[p.dialog]);if(!p.rest_vorhanden)assert(!own.dialogues[p.dialog].nodes[p.id+'_rueckgabe']);}
console.log(`OK: ${Object.keys(own).length} JSON; ${nodeCount} Knoten; 80 Hinweise; 20 Deduktionen; 5 Akte; 12 Patienten; 12 Ventile; 4 Enden.`);
console.log('OK: Dialogziele, interne Flags, NPCs, Items, Kämpfe, Präfixe, Belege und Drei-Kreise-Invariante.');
console.log(`EXTERNE VERTRÄGE (noch nicht eingebaut): ${[...pendingMaps].sort().join(', ')}`);
console.log(`EXTERNE FLAGS: ${[...pendingFlags].sort().join(', ')}`);
