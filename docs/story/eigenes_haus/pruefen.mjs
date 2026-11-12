import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const local=n=>read(`docs/story/eigenes_haus/${n}.json`);
const h=local('haus'),g=local('gaeste'),d=local('gedanken'),m=read('public/sprites/manifest-haus.json');
const unique=a=>assert.equal(new Set(a).size,a.length,'Duplicate ID');
const regions=new Set(m.assets.flatMap(a=>Object.keys(a.regions)));
assert.equal(h.maps.length,6);assert.equal(h.furniture.length,40);unique(h.furniture.map(p=>p.id));
assert(h.purchase.lines.length>=10&&h.purchase.lines.length<=14);assert.equal(h.purchase.price_schilling,600);assert.equal(h.purchase.requires.case_at_least,4);
for(const map of h.maps){
 assert.equal(map.rows.length,20);map.rows.forEach(r=>assert.equal(r.length,32));assert.equal(map.move_lines.length,3);assert.equal(Object.keys(map.room_text).length,4);Object.values(map.room_text).forEach(r=>assert.equal(r.length,3));
 const seen=new Set(),todo=[map.spawn];
 while(todo.length){const [x,y]=todo.pop(),key=`${x},${y}`;if(seen.has(key)||map.rows[y]?.[x]!=='.')continue;seen.add(key);todo.push([x-1,y],[x+1,y],[x,y-1],[x,y+1]);}
 for(const [x,y,w,z] of Object.values(map.rooms))assert(seen.has(`${x},${y}`),'Unreachable room');
 assert(seen.has('8,19'),'Exit unreachable');
}
for(const p of h.furniture){assert(regions.has(p.sprite_region));assert(p.inspect.length>15);assert(['wand','boden','tisch','regal'].includes(p.place_type));assert(['Kauf','Quest-Belohnung','Fund','Fasserin'].includes(p.source.type));assert.equal(p.bonus.flag,`haus_bonus_${p.id.slice(5)}`);assert(p.bonus.group_cap>0);if(p.state)assert(regions.has(p.state.region));}
const bossIds=new Set();
function walk(v,key){if(!v||typeof v!=='object')return;if(v.boss===true&&v.name&&Object.hasOwn(v,'hp'))bossIds.add(key);for(const [k,x]of Object.entries(v))walk(x,k);}
function scan(p){for(const f of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,f.name);if(f.isDirectory())scan(q);else if(f.name.endsWith('.json'))walk(JSON.parse(fs.readFileSync(q,'utf8')));}}
scan(path.join(root,'src/data'));
const covered=h.trophies.flatMap(t=>t.encounter_ids);unique(covered);assert.deepEqual([...new Set(covered)].sort(),[...bossIds].sort(),'Boss coverage changed: review new source IDs');
for(const t of h.trophies){assert(regions.has(t.sprite_region));assert(t.encounter_ids.includes(t.unlock.encounter));assert(t.inspect.length>15);for(const r of t.source_refs){let v=read(r.file);for(const s of r.pointer.slice(1).split('/'))v=v[s];assert(v.boss&&v.name&&v.hp);assert(t.encounter_ids.includes(r.id));}const last=t.encounter_ids.find(x=>x.endsWith('_phase3'))??t.encounter_ids.find(x=>x.endsWith('_phase2'));if(last)assert.equal(t.unlock.encounter,last);}
assert.equal(h.trophies.find(t=>t.boss_id==='starling_fight').unlock.encounter,'starling_stern');
const items=read('src/data/items.json');assert.equal(g.guests.length,12);unique(g.guests.map(v=>v.id));assert.equal(g.rules.max_per_evening,1);assert.equal(g.guests.filter(v=>v.coop).length,3);
const cities={};
for(const v of g.guests){cities[v.city]=(cities[v.city]??0)+1;assert.equal(v.condition.relation[v.npc_id],4);assert(v.condition.requires_flags.includes('haus_owned'));assert(Object.hasOwn(items,v.gift.item),'Unknown gift '+v.gift.item);assert(v.gift.once_per_campaign);const nodes=v.dialogue.nodes,start=nodes[v.dialogue.start];assert.deepEqual(start.choices.map(c=>c.id),['tee','geschichte','fall']);assert.equal(Object.values(nodes).filter(n=>n.choices).length,1);for(const c of start.choices){let current=c.next,count=start.lines.length;const seen=new Set();while(current){assert(!seen.has(current),'Dialogue cycle');seen.add(current);const n=nodes[current];assert(n,'Missing dialogue target');count+=n.lines.length;current=n.next;}assert(count>=8&&count<=12,'Dialogue path length');}assert.equal(nodes.ende.gift_once.item,v.gift.item);if(v.coop){assert.equal(v.coop.prepend.length,3);assert.deepEqual(v.coop.prepend.map(x=>x.speaker),['p1','p2',v.npc_id]);}}
assert.equal((cities.kettlegate??0)+(cities.wexmoor??0),6);assert.equal(cities.dunscar,2);assert.equal(cities.calderwick,2);assert.equal(cities.briarholt,1);assert.equal(cities.varrowmouth,1);
assert.equal(d.solo.length,40);assert.equal(d.coop.length,10);unique([...d.solo,...d.coop].map(x=>x.id));assert.equal(local('zeitung').length,4);assert.equal(local('gerede').length,20);
console.log(`DG Daten: 6 Häuser, 72 Raumsätze, 40 Möbel, ${h.trophies.length} Trophäen / ${bossIds.size} Boss-IDs, 12 Gäste / 36 Dialogpfade, 3 Koop-Varianten, 40+10 Gedanken, 4 Artikel, 20 Gerüchte; 0 Fehler.`);
console.log('Einbauabhängigkeiten dokumentiert: CX/Tam, AZ-Erweiterung für CW/BH, CU-Eingang, Quest-/Fasserin-Herkünfte, Endflag-Bindungen; kein Spielcode geändert.');
