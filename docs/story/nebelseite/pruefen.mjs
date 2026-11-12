import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../..');
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
const files=['karten.json','stilles_wesen.json','wesen.json','uebergaenge.json','zeitung.json','gerede.json','lesestuecke.json'];
const all=Object.fromEntries(files.map(n=>[n,read(n)]));
const ids=new Set();
function walk(x){if(typeof x==='string')assert(x.trim(),'Leerer Text');else if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object'){if(x.id){assert(/^[a-z0-9_]+$/.test(x.id),x.id);/* enemy spawn IDs are references */ if(!('expected_sequence' in x)){assert(!ids.has(x.id),'Doppelte ID '+x.id);ids.add(x.id);}}Object.values(x).forEach(walk);}}
Object.values(all).forEach(walk);
const maps=all['karten.json'];const transitions=all['uebergaenge.json'];
const required='altmarkt sternwarte katakomben salzmarkt flossfriedhof torfbrueche bahnhof schwellenring speisewagen terrasse_3 landstrasse kurhaus leitungsplan zollhafen registerkeller'.split(' ').map(x=>'ns_'+x);
assert.deepEqual(maps.map(x=>x.id).sort(),required.sort());
const enemy=all['wesen.json'].encounters;
assert.equal(Object.keys(enemy).length,5);
for(const id of ['umrissgaenger','lampenfresser','rueckwaertsgeher','namenlose_kutsche','spiegelspieler'])assert(enemy['nsw_'+id]);
let itemCount=0;
for(const m of maps){assert.equal(m.description.match(/[.!?](?:\s|$)/g)?.length,3,m.id+' Sätze');assert(m.items.length>=2&&m.items.length<=3);itemCount+=m.items.length;assert.equal(m.visited_flag,'ns_betreten_'+m.id.slice(3));assert(fs.existsSync(path.join(root,m.source)),m.source);const raw=JSON.parse(fs.readFileSync(path.join(root,m.source)));const originals=Array.isArray(raw)?raw:raw.maps||[raw];const original=originals.find(x=>x.id===m.original_map);assert(original,m.original_map);assert.equal(m.geometry.height,original.rows.length);assert.equal(m.geometry.width,original.rows[0].length);for(const item of m.items){assert(item.id.startsWith('nsi_'));assert.equal(item.category,'nebelseite');assert.equal(item.effect_proposal.mandatory_for_main_case,false);}for(const e of m.enemy_spawns)assert(enemy[e.id],e.id);}
assert.equal(itemCount,30);assert.equal(transitions.length,20);
for(let i=0;i<20;i++){const t=transitions[i];assert.equal(t.id,'ns_uebergang_'+(i+1));const m=maps.find(x=>x.id===t.target_map);assert(m);assert.equal(t.original_map,m.original_map);for(const p of [t.position_proposal,t.target_position_proposal]){assert(p[0]>=0&&p[0]<m.geometry.width);assert(p[1]>=0&&p[1]<m.geometry.height);}assert.equal(t.condition.sequence_at_most,5);assert(t.condition.night&&t.condition.spirit_sight_active);assert(t.return_condition.always_while_inside);assert.equal(t.first_entry_text.match(/[.!?](?:\s|$)/g)?.length,3);assert(t.koop.atomic_transfer);}
const silent=all['stilles_wesen.json'];assert.equal(silent.length,6);for(const s of silent){assert.equal(s.questions.length,20);assert.equal(s.refusals.length,3);assert.equal(s.daily_limit,3);assert.equal(s.daily_counter,'ns_still_'+s.city+'_fragen');assert.equal(s.appearance.match(/[.!?](?:\s|$)/g)?.length,2);for(const q of s.questions)assert.equal(q.answer.match(/[.!?](?:\s|$)/g)?.length,2,q.id);}
assert.equal(all['zeitung.json'].length,6);assert.equal(all['gerede.json'].length,30);assert.equal(all['lesestuecke.json'].length,6);
const wordCounts=all['lesestuecke.json'].map(x=>{const n=x.text.trim().split(/\s+/u).length;assert(n>=120&&n<=180,x.id+': '+n);return n;});
const nodes=all['wesen.json'].peace_dialogue;assert.equal(Object.keys(nodes).length,8);
const visited=new Set();function visit(id){if(visited.has(id))return;visited.add(id);const n=nodes[id];assert(n,id);for(const c of n.choices){if(c.next)visit(c.next);else assert(c.end&&c.effects.sets_flags.includes('ns_spiegelspieler_done'));}}visit('ns_spiegel_1');assert.equal(visited.size,8);
const peaceful=enemy.nsw_spiegelspieler.mechanic_proposal.peaceful;assert.equal(peaceful.consecutive_rounds,3);assert(peaceful.pet_autoattack_disabled&&peaceful.reflect_damage_disabled);
console.log(JSON.stringify({ok:true,jsonFiles:files.length,maps:15,items:itemCount,transitions:20,questions:120,news:6,rumours:30,readings:6,readingWordCounts:wordCounts,peaceNodes:8,sourceMapsVerified:true,limits:'Data validation only; proposed geometry, runtime hooks and combat balance require integration.'},null,2));
