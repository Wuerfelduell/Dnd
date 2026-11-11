import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadContent } from '../../../tests/helpers.js';
import { GameState } from '../../../src/core/GameState.js';
const dir=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(dir,'../../..');
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const own=Object.fromEntries(readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),read(path.join(dir,f))]));
function files(d){return readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(d,e.name)):e.name.endsWith('.json')?[path.join(d,e.name)]:[]);}
function walk(o,fn){if(!o||typeof o!=='object')return;if(!Array.isArray(o))fn(o);for(const v of Object.values(o))walk(v,fn);}
const c=loadContent();
const reserves=['vorrat_gegner','vorrat_figuren','vorrat_items'];
const reserve=n=>read(path.join(root,'docs/story',n));
const rzones=reserve('vorrat_gegner/zonen_vorschlag.json');
const npcs={...c.npcs,...reserve('vorrat_figuren/npcs.json'),...own.npcs};
const items={...c.items,...reserve('vorrat_items/items.json'),...reserve('vorrat_items/artifacts.json').list,...own.items,...own.artifacts.list};
const encounters={...c.encounters,...reserve('vorrat_gegner/encounters.json'),...reserve('vorrat_gegner/bosses.json'),...reserve('vorrat_gegner/phasen.json'),...own.encounters,...own.bosses};
const dialogues={...c.dialogues,...reserve('vorrat_figuren/dialogues.json'),...reserve('vorrat_gegner/dialogues.json'),...own.dialogues};
const maps={...c.maps,...Object.fromEntries(own.maps.map(m=>[m.id,m]))};
const merchantIds=new Set([...Object.keys(c.market.merchants),...Object.keys(reserve('vorrat_items/handel.json').merchants)]);
const externalFlags=new Set(['k4_arrived','cwa_werkstatt',...Array.from({length:4},(_,i)=>`cwa_akt${i+1}_done`),...['gleisfuss_vera','gleisfuss_hesk','sortierhalle_fahrplan','sortierhalle_empfaenger','kronenarchiv_gehalt','kronenarchiv_malliver','witwenterrasse_noel','witwenterrasse_nachbar','nullfundament_register','nullfundament_haushalt'].map(x=>'cwa_anker_'+x)]);
const externalItems=new Set(['cwa_rohrpostsiegel']);
const flags=new Set();
for(const f of [...files(path.join(root,'src/data')),...reserves.flatMap(x=>files(path.join(root,'docs/story',x))),...files(dir)])walk(read(f),o=>{for(const f of o.sets_flags??[])flags.add(f);if(o.done_flag)flags.add(o.done_flag);});
const pending=new Set();
const known=(dict,id,kind)=>assert(id in dict,`${kind} fehlt: ${id}`);
for(const [id,d] of Object.entries(own.dialogues)){
 assert(id.startsWith('cwo_'));
 const next=n=>{if(n===undefined||n===null)return;if(Array.isArray(n)){for(const x of n)known(d.nodes,x.node,`Start/next in ${id}`);}else known(d.nodes,n,`Start/next in ${id}`);};
 next(d.start);for(const [nid,n]of Object.entries(d.nodes)){assert(nid.startsWith('cwo_'));walk(n,o=>{if('next'in o)next(o.next);});}
}
for(const [id,e]of Object.entries(own.dialog_zusaetze)){
 known(dialogues,id,'Basisdialog');const nodes={...dialogues[id].nodes,...e.nodes_add};
 for(const nid of Object.keys(e.nodes_add)){assert(nid.startsWith('cwo_'));assert(!(nid in dialogues[id].nodes));}
 walk(e,o=>{if(o.next)known(nodes,o.next,'Zusatzknoten');});
}
for(const [file,data]of Object.entries(own))walk(data,o=>{
 for(const f of [...o.requires_flags??[],...o.hide_if_flags??[]]){
  if(flags.has(f))continue;
  if(f.startsWith('won_')){known(encounters,f.slice(4),'Siegkampf');continue;}
  if(externalFlags.has(f)){pending.add(f);continue;}
  assert.fail(`Flag ohne Produzent: ${f} (${file})`);
 }
 for(const f of [...o.sets_flags??[],...o.clears_flags??[]])assert(f.startsWith('cwo_'),`Fremder Schreibzugriff ${f}`);
 if(o.done_flag)assert(o.done_flag.startsWith('cwo_'));
 for(const i of [...o.requires_items??[],...o.hide_if_items??[],...Object.keys(o.gives_items??{}),...Object.keys(o.takes_items??{})]){
  if(externalItems.has(i)){pending.add(i);continue;}known(items,i,'Item');
 }
 for(const k of ['encounter','combat'])if(o[k])known(encounters,o[k],k);
 if(o.dialogue)known(dialogues,o.dialogue,'Dialog');
 if(o.npc)known(npcs,o.npc,'NPC');
 if(o.shop)assert(merchantIds.has(o.shop),`Shop fehlt ${o.shop}`);
 if(o.map)known(maps,o.map,'Karte');
 if(o.to)known(maps,o.to,'Zielkarte');
 if(o.travel?.map){known(maps,o.travel.map,'Reiseziel');known(maps[o.travel.map].spawns,o.travel.spawn??'default','Reisespawn');}
 if(o.prompt)assert(o.prompt.length<=140,'Prompt zu lang');
 if(o.kind==='read')assert(o.text.split(/\s+/).length<=120,'Lesetext zu lang');
});
for(const f of ['quests','items','npcs','dialogues','encounters'])for(const id of Object.keys(own[f]))assert(id.startsWith('cwo_'),`Präfix ${f}/${id}`);
assert.deepEqual(Object.keys(own.bosses),['cwa_registerleib_rest']);
assert(Object.keys(own.artifacts.list).every(id=>id.startsWith('cwo_')));
assert.equal(own.maps.length,18);assert.equal(Object.keys(own.items).length,10);
const floor=(m,[x,y])=>m.rows[y]?.[x]==='.';
function reachable(m,start){const q=[start],seen=new Set([start.join(',')]);for(let i=0;i<q.length;i++){const[x,y]=q[i];for(const p of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]])if(floor(m,p)&&!seen.has(p.join(','))){seen.add(p.join(','));q.push(p);}}return seen;}
let reads=0;
for(const m of own.maps){
 assert.equal(m.city,'calderwick');assert(m.tiles_wunsch);assert(m.rows.every(r=>r.length===m.rows[0].length));assert(m.rows.every(r=>/^[I.]+$/.test(r)));
 const r=m.interactables.filter(o=>o.kind==='read');assert(r.length>=6&&r.length<=12,`${m.id}: ${r.length} Lesestellen`);reads+=r.length;
 const spots=new Set();for(const [key,p]of Object.entries(m.spawns))assert(floor(m,p),`${m.id}: Spawn ${key} blockiert`);
 const all=m.interactables.concat(own.platzierung.filter(p=>p.map===m.id));
 for(const o of all){assert(floor(m,o.tile),`${m.id}: Objekt ${o.id??o.npc} blockiert ${o.tile}`);const key=o.tile.join(',');assert(!spots.has(key),`${m.id}: Objektüberlappung ${key}`);spots.add(key);}
 for(const spawn of Object.values(m.spawns)){const seen=reachable(m,spawn);for(const o of all)assert(seen.has(o.tile.join(',')),`${m.id}: unerreichbar ${o.id??o.npc}`);}
 for(const o of m.interactables.filter(o=>o.kind==='door')){known(maps[o.to].spawns,o.spawn,'Türspawn');assert(o.id.startsWith('cwo_'));}
}
for(const p of own.platzierung.filter(p=>!own.maps.some(m=>m.id===p.map))){assert(floor(maps[p.map],p.tile),'Externe Platzierung blockiert');assert(reachable(maps[p.map],maps[p.map].spawns.default).has(p.tile.join(',')));}
// Free terrace graph must stay connected with zero act flags and money.
const terraces=own.maps.slice(0,6).map(m=>m.id);for(const a of terraces){const reached=new Set([a]),todo=[a];for(const cur of todo)for(const o of maps[cur].interactables)if(o.kind==='door'&&!o.visible_if&&terraces.includes(o.to)&&!reached.has(o.to)){reached.add(o.to);todo.push(o.to);}assert.equal(reached.size,6,'Freie Treppenkette unterbrochen');}
assert.equal(own.maps.flatMap(m=>m.interactables).filter(o=>o.visible_if?.requires_items?.includes('cwa_rohrpostsiegel')).length,8);
assert.equal(own.platzierung.filter(p=>p.npc?.startsWith('vn_')).length,8);
// Bindings are an explicit integration table, not invented runtime fields.
const bindings=[...readFileSync(path.join(dir,'verknuepfungen.md'),'utf8').matchAll(/^\| (cw_\w+|reise_landstrasse) \| (vg_zone_\w+) \|$/gm)];assert.equal(bindings.length,4);
for(const [,mid,zid]of bindings){known(rzones,zid,'Vorratszone');assert.deepEqual(own.zones[mid].encounters,{});const z={...rzones[zid],...own.zones[mid],encounters:rzones[zid].encounters,loot_tables:rzones[zid].loot_tables,elite_drops:rzones[zid].elite_drops};assert.deepEqual(z.encounters,rzones[zid].encounters);for(const id of Object.keys(z.encounters))known(encounters,id,'Vorratskampf');}
const base=reserve('vorrat_gegner/phasen.json').vg_cw_boss_nullfundament_phase2,rest=own.bosses.cwa_registerleib_rest;
assert.equal(rest.hp,Math.round(base.hp*.7));assert.equal(rest.armor,Math.round(base.armor*.7));rest.attacks.forEach((a,i)=>{assert.equal(a.damage,Math.round(base.attacks[i].damage*.7));assert.deepEqual(a.hits,base.attacks[i].hits);});
// Exercise the real GameState condition/effect implementation, not a replacement evaluator.
Object.assign(c.items,items);Object.assign(c.encounters,encounters);Object.assign(c.dialogues,own.dialogues);Object.assign(c.quests,own.quests);
const make=()=>new GameState(c), enter=(s,id,key)=>{const n=own.dialogues[id].nodes[key];assert(n);s.applyEffects(n);return n;};
const begin=(s,id)=>enter(s,id,s.pick(own.dialogues[id].start));
const choose=(s,id,n,p)=>{const ch=n.choices.find(p);assert(ch,'Choice fehlt');assert(s.meets(ch),'Choice gesperrt');return ch.next?enter(s,id,ch.next):null;};
for(const origin of ['ds_endbahnhof','cw_gleisfuss'])for(const payment of ['geld','marke']){
 const s=make();s.flags.add('kapitel3_done');s.money=20;if(payment==='marke')s.addItem('vi_m_wegzoll_marke',1);
 const did='cwo_fahrt_'+origin,n=begin(s,did);choose(s,did,n,x=>x.next==='cwo_'+payment);
 assert.equal(s.money,payment==='geld'?16:20);assert.equal(s.itemCount('vi_m_wegzoll_marke'),0);assert.equal(s.pendingTravel.map,'reise_landstrasse');
 const rid='cwo_reise_etappen';let r=begin(s,rid);assert(!r.choices.some(x=>x.next==='cwo_ziel'));
 choose(s,rid,r,x=>x.text===own.landstrasse.events[10].title);r=begin(s,rid);
 assert(!r.choices.filter(x=>s.meets(x)).some(x=>x.text===own.landstrasse.events[11].title),'Beide Bosse auswählbar');assert(!r.choices.some(x=>x.next==='cwo_ziel'));
 choose(s,rid,r,x=>x.text===own.landstrasse.events[0].title);r=begin(s,rid);
 assert(r.choices.some(x=>x.next==='cwo_ziel'));choose(s,rid,r,x=>x.text===own.landstrasse.events[1].title);r=begin(s,rid);
 assert(r.choices.every(x=>['cwo_ds','cwo_cw'].includes(x.next)),'Vierte Etappe möglich');choose(s,rid,r,x=>x.next==='cwo_cw');assert.equal(s.pendingTravel.map,'cw_gleisfuss');assert(!s.flags.has('cwo_reise_aktiv'));
}
for(const boss of [10,11]){const s=make();s.flags.add('cwo_reise_aktiv');const id='cwo_reise_etappen';let n=begin(s,id);choose(s,id,n,x=>x.text===own.landstrasse.events[boss].title);n=begin(s,id);assert(!n.choices.filter(x=>s.meets(x)).some(x=>x.text===own.landstrasse.events[boss===10?11:10].title));choose(s,id,n,x=>x.text===own.landstrasse.events[1].title);n=begin(s,id);n=choose(s,id,n,x=>x.next==='cwo_ziel');choose(s,id,n,x=>x.next==='cwo_ds');assert.equal(s.pendingTravel.map,'ds_endbahnhof');assert(!s.flags.has('cwo_reise_3_done'));}
for(let i=1;i<=5;i++)for(const free of [false,true]){const s=make();s.money=2;if(free)s.flags.add('cwa_werkstatt');const id='cwo_lift_'+i,n=begin(s,id);choose(s,id,n,x=>x.next===(free?'cwo_frei':'cwo_zahlen'));assert.equal(s.money,free?2:0);assert.equal(s.pendingTravel.map,terraces[i]);}
for(const mode of ['vertraulich','oeffentlich']){const s=make();s.money=0;s.addItem('cwo_aufzugsschluessel',1);const d='cwo_wartung',n=begin(s,d);choose(s,d,n,x=>x.next==='cwo_'+mode);assert.equal(s.money,12);assert.equal(s.itemCount('cwo_getrennte_klammer'),1);begin(s,d);assert.equal(s.money,12);assert.equal(s.itemCount('cwo_getrennte_klammer'),1);}
for(let seq=1;seq<=3;seq++){const d='cwo_kern_'+seq;for(const choice of own.dialogues[d].nodes.cwo_start.choices.filter(x=>x.next)){
 const s=make();const item=choice.hide_if_items[0];choice.requires_flags.forEach(f=>s.flags.add(f));
 s.pathway={id:choice.requires_pathway[0],seq:3,digestion:0};
 assert(s.meets(choice));s.addItem(item,1);assert(!s.meets(choice));s.removeItem(item,1);choose(s,d,own.dialogues[d].nodes.cwo_start,x=>x.next===choice.next);assert.equal(s.itemCount(item),1);s.removeItem(item,1);assert(!s.meets(choice),'Kernzutat erneut farmbar');
}}
for(let i=1;i<=5;i++){const s=make(),d='cwo_abgleich_'+i;let n=begin(s,d);const mark=n.choices.find(x=>x.next==='cwo_mark');assert(!s.meets(mark));for(const f of mark.requires_flags)s.flags.add(f);choose(s,d,n,x=>x.next==='cwo_mark');n=enter(s,d,'cwo_start');choose(s,d,n,x=>x.next==='cwo_private');assert(s.flags.has(d+'_private'));assert(!s.flags.has(d+'_public'));assert.equal(s.pick(own.dialogues[d].start),'cwo_done');}
console.log(`OK: ${Object.keys(own).length} JSON-Dateien; 18 Karten; ${reads} Lesestellen; 8 Rohrpoststationen; ${own.platzierung.filter(p=>p.npc).length} Figurenplätze.`);
console.log('OK: Dialogziele, Präfixe, Quellenverweise, bekannte Flags, BFS ab allen Spawns, kostenlose Terrassenkette.');
console.log('OK: 4 Vorratsbindungen; Restboss ×0,7; 12 Reiseereignisse; Fahrpreis, 2/3 Etappen, Boss-Ausschluss, 30 Pfad-Ausgaben, Quest-Einmaligkeit, 5 Abgleich-Brücken.');
console.log('OFFEN (CC-Vertrag, kein lokaler Fehler): '+[...pending].sort().join(', '));
console.log('OFFEN (Einbau): Vorratsresolver, Reiseadapter, Händlerregistrierung, CC-Fortsetzungen und Briarholt-Anschluss.');
