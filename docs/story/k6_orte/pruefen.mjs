import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const dir=path.dirname(fileURLToPath(import.meta.url));
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n+'.json'),'utf8'));
const files=fs.readdirSync(dir).filter(n=>n.endsWith('.json'));
function walk(v){if(typeof v==='string')assert(v.trim(),'Leerer Text');else if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')Object.values(v).forEach(walk)}
files.forEach(n=>walk(JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'))));
const maps=read('maps'),ids=['zollhafen','stegviertel','schlickgassen','oberstrasse','wrackfeld','leuchtbank','registerkeller','grenzzaun'].map(s=>'vm_'+s);
assert.deepEqual(maps.map(m=>m.id).sort(),ids.sort());
const seen=new Set();
for(const m of maps){assert.equal(m.rows.length,m.size[1]);assert(m.rows.every(r=>r.length===m.size[0]));for(const d of m.interactables){assert(!seen.has(d.id));seen.add(d.id);if(d.kind==='door')assert(ids.includes(d.to)||d.to==='hg_grenzbezirk');}
for(const t of ['ebbe','flut']){const g=m.gezeiten[t];assert(g);for(const [x,y,w,h] of g.begehbar)assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=m.size[0]&&y+h<=m.size[1]);for(const d of g.offene_tueren)assert(m.interactables.some(i=>i.id===d&&i.kind==='door'));assert(ids.includes(g.rettung.map));for(const e of g.gegnerplaetze)assert(g.begehbar.some(([x,y,w,h])=>e.tile[0]>=x&&e.tile[0]<x+w&&e.tile[1]>=y&&e.tile[1]<y+h));}}
const items={...read('items'),...read('artifacts').list};assert.equal(Object.keys(items).length,12);assert.equal(Object.keys(read('items')).length,10);
const travel=read('travel');assert.equal(travel.length,12);assert.equal(new Set(travel.map(t=>t.id)).size,12);assert.equal(travel.filter(t=>t.koop.only).length,2);travel.forEach(t=>{assert(ids.includes(t.map));assert(t.choices.length>=2)});
assert.equal(read('city').pins.length,8);assert.equal(read('bosses').length,3);assert.equal(Object.keys(read('zones')).length,3);
const ingredients=JSON.parse(fs.readFileSync(path.join(dir,'../../../src/data/packs/sequenzen/zutaten.json'),'utf8'));
for(const z of Object.values(read('zones')))for(const t of Object.values(z.loot_tables))for(const d of t.drops)assert(items[d.item]||ingredients[d.item],d.item);
for(const d of Object.values(read('dialogues'))){for(const s of d.start)assert(d.nodes[s.node]);for(const n of Object.values(d.nodes))for(const c of n.choices)if(c.next)assert(d.nodes[c.next]);}
console.log(`CU OK: ${files.length} JSON-Dateien; 8 Karten; 3 Zonen; 3 Bosse; 12 Reisen (2 Koop); 12 Gegenstände. IDs, Texte, Raster, Türen, Gezeitenflächen, Zutaten und Dialogziele geprüft.`);
