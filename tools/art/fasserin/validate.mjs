// Run from the repository root: node tools/art/fasserin/validate.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadContent} from '../../../tests/helpers.js';
import {GameState} from '../../../src/core/GameState.js';
import {itemRarity} from '../../../src/core/Loot.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const c=loadContent(), pack=read('docs/story/fasserin/rezepte_vorrat.json');
assert.equal(pack.recipes.length,10);assert.equal(Object.keys(pack.artifacts.list).length,10);
const keys=new Set('atk max_hp max_nerves parry_ap lock_bonus conclusion_honor carry unruhe_tick vision_cost composure_regen heal_bonus price sell honor_loss occult_mult money_bonus skill_composure calm_decay dodge_window damage_taken digest_mult dmg_mult'.split(' '));
const old=new Set(c.gatherings.artisan.recipes.map(r=>r.id));
const wx=read('src/data/wexmoor.json').items, city=read('src/data/stadtgegner.json').items;
let wxn=0,cityn=0;
for(const r of pack.recipes){
 assert(!old.has(r.id));old.add(r.id);
 const a=pack.artifacts.list[r.id], needs=Object.entries(r.needs);
 assert(needs.length>=2&&needs.length<=3);assert(r.fee>=90&&r.fee<=160);assert(r.line.length>10);
 assert(a.price>=120&&a.price<=200);assert.equal(a.source,'artisan');assert(r.needs[a.icon]);
 let special=false;
 for(const [id,n] of needs){assert.equal(c.items[id]?.kind,'trophy',id);assert(Number.isInteger(n)&&n>0);special ||= itemRarity(c.items[id])!=='gewoehnlich';}
 assert(special);wxn+=needs.some(([id])=>wx[id])?1:0;cityn+=needs.some(([id])=>city[id])?1:0;
 for(const list of [a.boons,a.curses]){assert(list.length>=1&&list.length<=2);for(const e of list){assert(keys.has(e.key));assert(Number.isFinite(e.value));assert(e.text);}}
 c.artifacts.list[r.id]=a;c.items[r.id]={...a,id:r.id,kind:'artifact'};
}
assert(wxn>=4);assert(cityn>=2);
c.gatherings.artisan.recipes.push(...pack.recipes);
assert.equal(c.gatherings.artisan.recipes.length,20);assert.equal(c.gatherings.artisan.chance,.3);assert.equal(c.gatherings.artisan.offers,4);
let s=new GameState(c);const seen=new Set();
for(let cycle=0;cycle<1000;cycle++){
 const offers=s.artisanRecipes('waage',cycle);
 assert.deepEqual(offers,s.artisanRecipes('waage',cycle));
 if(offers.length)assert.equal(offers.length,4);
 for(const r of offers){if(!pack.artifacts.list[r.id]||seen.has(r.id))continue;
  s=new GameState(c);
  s.auction={phase:'artisan',circle:'waage',cycle,crafted:[],log:[]};s.money=0;
  for(const [id,n] of Object.entries(r.needs))s.addItem(id,n);
  assert(s.recipeCheck(r).poor);assert.equal(s.craftArtifact(r.id).ok,false);
  s.money=r.fee+10;
  const first=Object.keys(r.needs)[0];s.removeItem(first,s.itemCount(first));
  assert(s.recipeCheck(r).missing.length);assert.equal(s.craftArtifact(r.id).ok,false);assert.equal(s.money,r.fee+10);
  s.addItem(first,r.needs[first]);
  const counts=Object.fromEntries(Object.keys(r.needs).map(id=>[id,s.itemCount(id)]));
  assert(s.craftArtifact(r.id).ok);assert.equal(s.money,10);assert.equal(s.itemCount(r.id),1);
  for(const [id,n]of Object.entries(r.needs))assert.equal(s.itemCount(id),counts[id]-n);
  seen.add(r.id);
 }
}
assert.equal(seen.size,10);
const g=read('docs/story/fasserin/gerede.json');let lines=0;
for(const maps of Object.values(g.gerede))for(const [map,rows]of Object.entries(maps)){assert(c.maps[map],map);lines+=rows.length;}
assert.equal(lines,8);assert.equal(g.zeitung.length,2);
const flags=new Set(Object.values(c.gatherings.circles).map(x=>x.member_flag));
for(const n of g.zeitung){for(const f of n.requires_flags)assert(flags.has(f));assert(['kurier','bote'].includes(n.zeitung));}
console.log(`BO: 10 valid recipes (${wxn} Wexmoor, ${cityn} city), 10 crafts with missing-material / money checks, 1000 offer cycles, 8 gossip lines and 2 notices passed.`);
