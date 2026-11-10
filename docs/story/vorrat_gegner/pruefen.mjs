import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent, fight, EXPERT, SKILLED, talk } from '../../../tests/helpers.js';
import { GameState } from '../../../src/core/GameState.js';
import { Combat } from '../../../src/core/Combat.js';
import { rollLoot } from '../../../src/core/Loot.js';

const dir = new URL('./', import.meta.url);
const read = n => JSON.parse(readFileSync(new URL(`${n}.json`, dir), 'utf8'));
const data = Object.fromEntries(['encounters','bosses','phasen','items','bestiarium','dialogues','zonen_vorschlag','quests','npcs','case','dialog_zusaetze','platzierung'].map(n => [n, read(n)]));
const task = readFileSync(new URL('../../art/codex_BH_vorrat_gegner.md', dir), 'utf8');
const bl = readFileSync(new URL('../../art/codex_BL_vorrat_items.md', dir), 'utf8');
const shared = new Set([...bl.matchAll(/^\| `(vi_[a-z_]+)` \|/gm)].map(x => x[1]));
assert.equal(shared.size, 72);
const expected = new Set([...task.matchAll(/`(vg_(?:cw|bh|all)_[a-z_]+)`/g)].map(x=>x[1]).filter(x=>!x.endsWith('_')));
const all = {...data.encounters,...data.bosses,...data.phasen};
const principal = {...data.encounters,...data.bosses};
assert.equal(Object.keys(data.encounters).length,24); assert.equal(Object.keys(data.bosses).length,8); assert.equal(Object.keys(data.phasen).length,10);
assert.deepEqual(new Set(Object.keys(principal)),expected);
assert.equal(Object.keys(data.items).length,32);
assert.deepEqual(new Set(Object.keys(data.bestiarium)),expected);
assert.equal(Object.keys(data.zonen_vorschlag).length,7);
for(const key of ['quests','npcs','case','dialog_zusaetze']) assert.deepEqual(data[key],{});
assert.deepEqual(data.platzierung,[]);
const content=loadContent();
const normalBases = [
 ['schichtgaenger','signalkraehe','geruestklang','nachhall','schichtgaenger','geruestklang','kalkstaubgeist','nachhall'],
 ['kalkstaubgeist','geruestklang','signalkraehe','lohnlistenmotte','geruestklang','schichtgaenger','kalkstaubgeist','nachhall'],
 ['schichtgaenger','nachhall','geruestklang','signalkraehe','lohnlistenmotte','geruestklang','kalkstaubgeist','nachhall'],
].flat();
for (const [[id,e],base] of Object.entries(data.encounters).map((entry,i)=>[entry,normalBases[i]])) {
 const ref=content.encounters[base];assert.equal(e.hp,Math.round(ref.hp*1.3),id+' HP-Skalierung');
 for(let i=0;i<2;i++)assert.equal(e.attacks[i].damage,Math.round(ref.attacks[i].damage*1.3),id+' Schaden-Skalierung');
}
for (const[id,e]of Object.entries(data.bosses))assert.equal(e.hp,Math.round(content.encounters[/nullfundament|mutterwurzel/.test(id)?'vielrufer':'vorhauer'].hp*1.3));
for (const[id,e]of Object.entries(data.phasen))assert.equal(e.hp,Math.round(content.encounters[id.endsWith('phase3')?'k3o_unterschicht_phase3':'k3o_gallowmere_phase2'].hp*1.3));

for (const id of Object.keys(all)) assert(!content.encounters[id],`bereits aktiv: ${id}`);
Object.assign(content.items,data.items);Object.assign(content.dialogues,data.dialogues);
const defs=new Set();const externalItems=new Set();
const visit=(v,f,p='')=>{if(!v||typeof v!=='object')return;f(v,p);for(const[k,x]of Object.entries(v))visit(x,f,p+'/'+k);};
visit(data,(o)=>{for(const f of o.sets_flags??[])defs.add(f);});
visit(data,(o,p)=>{
  for(const k of ['requires_flags','hide_if_flags','sets_flags','clears_flags']) for(const f of o[k]??[]){assert(f.startsWith('vg_'),`${p}: fremdes Flag ${f}`);assert(defs.has(f),`${p}: Flag ohne Quelle ${f}`);}
  for(const k of ['map','travel','quests','gives_clues','requires_clues'])if(Object.hasOwn(o,k)&&p!=='')assert.fail(`${p}: unerlaubte laufende Weltreferenz ${k}`);
  for(const id of [...Object.keys(o.gives_items??{}),...Object.keys(o.takes_items??{}),...(o.requires_items??[]),...(o.item?[o.item]:[])]) {
    if(id.startsWith('vi_')){assert(shared.has(id),`BL-ID fehlt: ${id}`);externalItems.add(id);}else assert(data.items[id],`Trophäe fehlt: ${id}`);
  }
  assert(!('platzhalter'in o));
});
for(const[id,it]of Object.entries(data.items)){assert.equal(it.kind,'trophy');assert(it.price>0&&it.weight>0&&it.name&&it.desc);assert.equal(it.icon,id);}
for(const[id,e]of Object.entries(all)) {
  assert.equal(e.chapter,4);assert(e.hp>0&&e.armor>=0&&e.fleeable===true);assert(e.attacks.length>=2);
  assert(/^enemy_vg_/.test(e.sheet));
  for(const a of e.attacks){assert(a.damage>0);assert.equal(typeof a.unparryable,'boolean');assert(a.hits.length&&a.hits.every((n,i)=>n>=900&&(!i||n>a.hits[i-1])));assert(a.name.includes(':'));}
  assert(e.attacks.some(a=>a.unparryable)&&e.attacks.some(a=>!a.unparryable));
}
for(const[id,e]of Object.entries(data.encounters)){
  const trophy=id.replace(/^vg_/,'vt_');assert(data.items[trophy]);assert.deepEqual(e.loot.drops.map(x=>x.chance),[1,1]);
  assert.equal(e.loot.drops[0].item,trophy);assert(e.loot.drops[1].item.startsWith('vi_m_'));
  assert.equal(e.elite.hp_mult,1.4);assert.equal(e.elite.dmg_mult,1.2);
  const loot=rollLoot(e.loot,()=>0.99999);assert.equal(loot.items[trophy],1);
}
const chains={};
for(const id of Object.keys(data.bosses)){
  const count=/nullfundament|mutterwurzel/.test(id)?3:2;const chain=[id,...Array.from({length:count-1},(_,i)=>`${id}_phase${i+2}`)];chains[id]=chain;
  for(let i=0;i<chain.length;i++) {
    const e=all[chain[i]];assert(e);assert.equal(e.on_win.sets_flags[0],i===chain.length-1?`${id}_geloest`:`${id}_phase${i+1}_done`);
    assert.equal(e.loot.drops.length,0,'Boss-Beute ausschließlich über gemeinsamen Einmalanspruch');
    if(i){assert.notEqual(e.intro,all[chain[i-1]].intro);assert(e.attacks.some(a=>!all[chain[i-1]].attacks.some(b=>b.name===a.name)),`${id}: keine neue Angriffsart`);}
  }
  const reward=data.dialogues[id+'_dialog'].nodes[id+'_ausgabe'];
  assert.equal(reward.gives_items[id.replace(/^vg_/,'vt_')],1);assert.equal(Object.keys(reward.gives_items).length,3);
  assert(Object.keys(reward.gives_items).some(x=>/^vi_(hut|mantel|amulett|art)_/.test(x)));
}
for(const id of ['vg_cw_durchschlag','vg_bh_wurzelgaenger','vg_bh_postkartenschreiber','vg_all_marktschreier'])assert(/zerfällt|atmet|bewusstlos|flieht/.test(data.encounters[id].win_text),id);
for(const[id,b]of Object.entries(data.bestiarium)){
  assert(b.titel&&b.hinweis.includes('Beobachtung:'));assert.equal((b.text.match(/Gerede:/g)??[]).length,2);assert.equal((b.text.match(/Zeitung:/g)??[]).length,1);
  assert(b.text.split(/\s+/).length<=90,`${id}: Lesestück >90 Wörter`);
}
const assigned=new Set();
for(const[zid,z]of Object.entries(data.zonen_vorschlag)){
  assert(z.tier===5||z.tier===6);assert(z.elite_chance>0&&z.elite_chance<1);assert.equal(z.elite_hp,1.4);assert.equal(z.elite_dmg,1.2);
  assert(Object.values(z.encounters).some(x=>x.boss));assert(Object.keys(z.loot_tables).length);
  for(const[id,e]of Object.entries(z.encounters)){assert.deepEqual(e,principal[id],`${zid}/${id}: abweichende Kopie`);assert(!assigned.has(id));assigned.add(id);}
}
assert.deepEqual(assigned,expected);
// Start selectors are roots, including explicitly conditioned post-combat continuations.
const targets=x=>typeof x==='string'?[x]:Array.isArray(x)?x.map(r=>r.node):[];
for(const[id,d]of Object.entries(data.dialogues)){
 const seen=new Set(), todo=targets(d.start);
 while(todo.length){const key=todo.pop();assert(d.nodes[key],`${id}/${key}`);if(seen.has(key))continue;seen.add(key);for(const c of d.nodes[key].choices??[])todo.push(...targets(c.next));}
 assert.equal(seen.size,Object.keys(d.nodes).length,`${id}: unerreichbarer Knoten`);
 for(const n of Object.values(d.nodes))if(n.combat)assert(all[n.combat],`Kampf ${n.combat}`);
}
// BH does not own BL definitions. Missing BL records are not invented; combat loot is suppressed only in the sandbox.
let blAvailable=false;
const blPath=new URL('../vorrat_items/items.json',dir);
if(existsSync(blPath)){const items=JSON.parse(readFileSync(blPath,'utf8'));Object.assign(content.items,items);blAvailable=[...externalItems].every(id=>content.items[id]);}
for(const[id,e]of Object.entries(all)){
 const {loot,elite,...combat}=e;content.encounters[id]=combat;content.loot[id]={money:[0,0],drops:[]};
 if(elite){content.encounters[id+'_elite']={...combat,name:elite.name,elite:true,hp:Math.round(e.hp*elite.hp_mult),attacks:e.attacks.map(a=>({...a,damage:Math.round(a.damage*elite.dmg_mult)}))};content.loot[id+'_elite']={money:[0,0],drops:[]};}
}
function equipped(seq=4){const s=new GameState(content);s.addItem('ossuarklinge');s.equip('ossuarklinge');s.pathway={id:'eisen',seq,digestion:0};s.updateMaxHp();for(const id of ['mantel_giesser','hut_helm','k3a_leitungspruefer']){s.addItem(id);s.wear(id);}s.hp=s.maxHp;s.composure=s.maxComposure();s.inventory.tonikum=4;s.inventory.verband=2;return s;}
const summary=[];let simulations=0;
for(const[id,e]of Object.entries(content.encounters).filter(([id])=>id.startsWith('vg_'))){
 const s=equipped();const r=fight(s,id,{defend:e.boss||e.elite?EXPERT:SKILLED,skill:e.boss||e.elite?'double':'attack',healBelow:35,maxRounds:100});simulations++;
 assert.equal(r.result.outcome,'won',`${id}: ${r.result.outcome} Runde ${r.combat.round}`);
 assert(r.combat.round>=4,`${id}: nur ${r.combat.round} Runden`);
 if(principal[id])summary.push({id,rounds:r.combat.round,hp:s.hp,maxHp:s.maxHp});
 const stronger=fight(equipped(3),id,{defend:EXPERT,skill:e.boss||e.elite?'double':'attack',healBelow:35,maxRounds:100});simulations++;
 assert.equal(stronger.result.outcome,'won',`${id} Seq3`);
}
const bossRounds={};
for(const[id,chain]of Object.entries(chains)){
 const s=equipped();let rounds=0;
 for(const phase of chain){const r=fight(s,phase,{defend:EXPERT,skill:'double',healBelow:35,maxRounds:100});simulations++;assert.equal(r.result.outcome,'won',`${id}: durchgehende Kette scheitert bei ${phase}`);rounds+=r.combat.round;}
 assert(s.flags.has(id+'_geloest'));assert.equal(s.pick(data.dialogues[id+'_dialog'].start),id+'_bergung');bossRounds[id]=rounds;const row=summary.find(r=>r.id===id);row.hp=s.hp;row.maxHp=s.maxHp;
}
// Peace, failed starts, voluntary retreat, shared payout routing (no external item effects needed).
const peaceful=Object.entries(data.dialogues).filter(([id,d])=>Object.keys(d.nodes).some(n=>n.endsWith('_friedlich')));
assert.equal(peaceful.length,3);
for(const[dialog,d]of peaceful){
 const id=dialog.replace(/_dialog$/,'');const s=equipped();const inspect=d.nodes[id+'_start'].choices[0].text;const action=d.nodes[id+'_pruefen'].choices[0].text;
 talk(s,dialog,[inspect,action]);assert(s.flags.has(id+'_geloest'));assert(!s.flags.has(id+'_beute'));assert.equal(s.pick(d.start),id+'_bergung');
 // Claim is atomically guarded by its own paid flag for either resolution. Do not simulate BL ownership with fake items.
 const claim=d.nodes[id+'_bergung'].choices[0];assert(s.meets(claim));s.flags.add(id+'_beute');assert(!s.meets(claim));assert.equal(s.pick(d.start),id+'_quittung');
}
for(const[id,chain]of Object.entries(chains)){
 const s=equipped();s.flags.add(id+'_phase1_done');const d=data.dialogues[id+'_dialog'];assert.equal(s.pick(d.start),id+'_weiter1');
 talk(s,id+'_dialog',['Abbrechen']);assert(!s.flags.has(id+'_phase1_done'));assert.equal(s.pick(d.start),id+'_start');
}
for(const[id,chain]of Object.entries(chains))for(const phase of chain){
 const s=equipped();for(let j=1;j<chain.length;j++)s.flags.add(id+`_phase${j}_done`);
 const combat=new Combat(s,phase);combat.outcome='lost';combat.finish();
 for(let j=1;j<chain.length;j++)assert(!s.flags.has(id+`_phase${j}_done`),phase+' Niederlagenreset');
 assert.equal(s.pick(data.dialogues[id+'_dialog'].start),id+'_start');
}
const m='vg_all_marktschreier_dialog';const s=equipped();const money=s.money;talk(s,m,['Garantie vor','Ich kaufe nichts']);assert(s.flags.has('vg_all_marktschreier_geloest'));assert.equal(s.money,money);
console.log('OK: 24 Gegner, 8 Bosse, 10 Folgephasen, 32 Trophäen, 32 Bestiariumseinträge, 7 kartenlose Zonen.');
console.log(`OK: ${externalItems.size} BL-Verweise gegen 72 feste IDs geprüft; Beute ohne Kernzutaten; Dialoggraphen und eigene Flags geschlossen.`);
console.log(`OK: ${simulations} Kämpfe (Seq4/Seq3, Eliten, vollständige Bossketten); Seq4 je Abschnitt mindestens 4 Runden.`);
console.log('OK: 3 friedliche Bosslösungen, gemeinsamer Einmalanspruch, Abbruch und Marktschreier-Gespräch.');
console.log(`BL-Definitionen vollständig vorhanden: ${blAvailable ? 'ja' : 'nein – nur ID-Vertrag geprüft; kein erfundener Item-Datensatz'}.`);
console.log('| Gegner/Boss | Runden Seq4 | Restleben |');console.log('|---|---:|---:|');
for(const r of summary)console.log(`| ${r.id} | ${bossRounds[r.id]??r.rounds} | ${r.hp}/${r.maxHp} |`);
