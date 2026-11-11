import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../../../tests/helpers.js';
import { applyQuestPack } from '../../../src/data/questPacks.js';
import { GameState } from '../../../src/core/GameState.js';
const dir=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(dir,'../../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
const data=Object.fromEntries(files.map(f=>[f.slice(0,-5),read(path.join(dir,f))]));
const base=loadContent();
const walk=(v,fn)=>{if(!v||typeof v!=='object')return;fn(v);for(const x of Object.values(v))walk(x,fn)};
const allJson=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?allJson(path.join(p,e.name)):e.name.endsWith('.json')?[path.join(p,e.name)]:[]);
const external=[...allJson(path.join(root,'src/data')),...fs.readdirSync(path.join(root,'docs/story')).filter(n=>n.startsWith('vorrat_')).flatMap(n=>allJson(path.join(root,'docs/story',n)))].map(read);
const flags=new Set();for(const tree of [...external,...Object.values(data)])walk(tree,o=>{for(const f of o.sets_flags??[])flags.add(f);if(o.done_flag)flags.add(o.done_flag)});
const clock=fs.readFileSync(path.join(root,'src/core/Clock.js'),'utf8');assert(clock.includes("NIGHT_FLAG = 'k3h_nacht'")&&clock.includes('this.flags.add(NIGHT_FLAG)'));flags.add('k3h_nacht');
assert(fs.readFileSync(path.join(root,'src/core/Party.js'),'utf8').includes("this.flags.add('koop_aktiv')"));flags.add('koop_aktiv');
const registries={item:new Set(Object.keys(base.items)),npc:new Set(Object.keys(base.npcs)),encounter:new Set(Object.keys(base.encounters)),dialogue:new Set(Object.keys(base.dialogues)),quest:new Set(Object.keys(base.quests)),clue:new Set(Object.keys(base.clues))};
for(const [kind,file] of Object.entries({item:'items',npc:'npcs',encounter:'encounters',dialogue:'dialogues',quest:'quests'}))for(const id of Object.keys(data[file])){assert(id.startsWith('kgl_'),id);assert(!registries[kind].has(id),`collision ${id}`);registries[kind].add(id)}
for(const tree of Object.values(data))walk(tree,o=>{
 for(const f of o.requires_flags??[])assert(flags.has(f)||(f.startsWith('won_')&&registries.encounter.has(f.slice(4))),`undefined flag ${f}`);
 for(const f of o.sets_flags??[])assert(f.startsWith('kgl_'),`foreign flag ${f}`);
 if(typeof o.map==='string')assert(base.maps[o.map],`map ${o.map}`);
 for(const key of ['npc','item','dialogue','encounter'])if(typeof o[key]==='string')assert(registries[key].has(o[key]),`${key} ${o[key]}`);
 for(const [key,kind] of Object.entries({requires_items:'item',hide_if_items:'item',takes_items:'item',start_quests:'quest',complete_quests:'quest',requires_quests_active:'quest',requires_quests_done:'quest',requires_clues:'clue',gives_clues:'clue'}))for(const id of o[key]??[])assert(registries[kind].has(id),`${key}: ${id}`);
 for(const id of Object.keys(o.gives_items??{}))assert(registries.item.has(id),id);
 if(o.requires_pathway)assert(base.pathways[o.requires_pathway[0]],'pathway');
 if(o.id)assert(o.id.startsWith('kgl_'),o.id);
 if(o.text){assert(!/[—–]/u.test(o.text),'dash');assert(o.text.split(/\s+/).length<=120,'text length');}
});
for(const [id,t] of Object.entries(data.dialogues)){
 for(const node of typeof t.start==='string'?[t.start]:t.start.map(x=>x.node))assert(t.nodes[node],`${id} start ${node}`);
 for(const [k,n] of Object.entries(t.nodes)){assert(k.startsWith('kgl_'));for(const ch of n.choices??[]){assert(t.nodes[ch.next],`${id}/${ch.next}`);assert(ch.text.length<=140,'choice too long');}}
 if(id.startsWith('kgl_e_'))assert.equal(Object.keys(t.nodes).length,8);
}
assert.equal(Object.keys(data.npcs).length,10);assert.equal(data.einwohner.length,10);
assert.equal(new Set(data.einwohner.map(x=>x.id)).size,10);
const refs=new Map();for(const p of data.platzierung){const o=p.interactable;assert(!refs.has(o.id),`duplicate ${o.id}`);refs.set(o.id,p)}
const occupied={};
function place(map,tile){
 const m=base.maps[map];const [x,y]=tile;assert('.wpc'.includes(m.rows[y]?.[x]),`floor ${map} ${tile}`);
 for(const o of [...m.interactables,...m.npcs,...(m.decor??[])])if(o.tile)assert(Math.abs(x-o.tile[0])+Math.abs(y-o.tile[1])>=3,`blocked ${map}/${o.id}`);
 for(const a of Object.values(m.spawns??{}))assert(Math.abs(x-a[0])+Math.abs(y-a[1])>=3,`spawn ${map}`);
 const k=map+':'+tile;assert(!occupied[k],`overlap ${k}`);occupied[k]=true;
 for(let yy=Math.max(0,y-2);yy<=Math.min(m.rows.length-1,y+2);yy++)for(let xx=Math.max(0,x-2);xx<=x+2;xx++)assert(m.rows[yy][xx]!=='D',`door ${map}`);
}
for(const p of data.platzierung)place(p.map,p.interactable.tile);
for(const e of data.einwohner){assert.equal(new Set(Object.values(e.zeit).map(x=>x.map)).size,2);for(const s of Object.values(e.zeit))place(s.map,s.tile)}
for(const q of Object.values(data.quests))for(const s of q.steps){assert(refs.has(s.target.id),s.target.id);assert.equal(refs.get(s.target.id).map,s.target.map)}
const barks=Object.values(data.gerede.kettlegate).flat();assert.equal(barks.length,100);assert.equal(new Set(barks.map(x=>x.text)).size,100);
const oldBarks=new Set();walk(base.lore??{},o=>{if(o.text)oldBarks.add(o.text)});walk(read(path.join(root,'src/data/packs/lore/gerede.json')),o=>{if(o.text)oldBarks.add(o.text)});
for(const b of barks){assert(b.text.length<=140);assert(!oldBarks.has(b.text),'AD duplicate');assert([...(b.requires_flags??[]),...(b.hide_if_flags??[])].includes('k3h_nacht'),'time gate')}
assert.equal(Object.keys(data.staende.merchants).length,8);for(const id of Object.keys(data.staende.merchants))assert(data.dialogues[id]);
assert.equal(data.zeitung.length,12);assert.equal(data.geplauder.length,20);for(const list of [data.zeitung,data.geplauder])assert.equal(new Set(list.map(x=>x.id)).size,list.length);
for(const x of data.geplauder){assert(x.requires_flags.includes('koop_aktiv'));for(const z of x.zeilen)for(const k of ['text','a','b'])if(z[k])assert(z[k].length<=140)}
assert.equal(Object.keys(data.leben).length,fs.readdirSync(path.join(root,'src/data/maps')).filter(x=>x.endsWith('.json')).length);
// Integration of standard fields and all twelve event endings through the real engine.
const content=loadContent();applyQuestPack(content,{...data,name:'kg_leben'});
let simulations=0;
for(const [id,t] of Object.entries(data.ereignisse)){
 assert.deepEqual(t,data.dialogues[id]);
 for(const branch of ['kgl_a','kgl_b']){
  const s=new GameState(content);s.honor=10;s.honorCarry=0;
  const enter=n=>{s.applyEffects(t.nodes[n]);return t.nodes[n]};
  enter(s.pick(t.start));
  if(id==='kgl_ev_tasche'){enter('kgl_fragen');enter('kgl_zeugen')}
  assert(!s.meets(t.nodes.kgl_entscheid.choices[0]),'premature reward');
  for(const p of data.platzierung)if(p.interactable.id.startsWith(id+'_hinweis')){assert(s.meets(p.interactable.visible_if));s.applyEffects(p.interactable.effects)}
  assert.equal(s.pick(t.start),'kgl_entscheid');
  const choice=t.nodes.kgl_entscheid.choices.find(x=>x.next===branch);assert(s.meets(choice),'locked branch');
  const money=s.money, honor=s.honor;enter(branch);
  assert.equal(s.quests['kgl_q_'+id.slice(7)],'done');
  if(branch==='kgl_a')assert(s.money-money>=10&&s.money-money<=40,'reward range');else assert(s.honor>honor,'honor reward');
  assert.equal(s.pick(t.start),'kgl_nachher');const after=s.money;enter(s.pick(t.start));assert.equal(s.money,after);simulations++;
 }
}
console.log(`OK: ${files.length} JSON; 10 Einwohner × 8 Knoten; 20 Tagesplätze; 100 eindeutige Gerede-Zeilen; 8 Stände; 6 Ereignisse; 12 Meldungen; 20 Koop-Dialoge.`);
console.log(`OK: ${Object.keys(base.maps).length} loadContent-Karten geprüft; ${Object.keys(occupied).length} sichere Plätze; Flags, IDs, Verweise, Textlängen, AD-Abgleich.`);
console.log(`OK: ${simulations} Ereignis-Enden mit GameState geprüft; keine vorzeitigen oder wiederholten Auszahlungen.`);
console.log('HINWEIS: Zufallsauslöser 0,1/Besuch, Fahndung >=2, Saisonsperre und Dekoranimationen brauchen den dokumentierten Einbau.');
