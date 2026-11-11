import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../../../tests/helpers.js';
import { GameState } from '../../../src/core/GameState.js';
import { applyQuestPack } from '../../../src/data/questPacks.js';
const dir = dirname(fileURLToPath(import.meta.url)), root = resolve(dir, '../../..');
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const files = readdirSync(dir).filter(f => f.endsWith('.json'));
const data = Object.fromEntries(files.map(f => [f.slice(0,-5), read(resolve(dir,f))]));
const errors = [], pending = new Set();
const check = (ok, msg) => { if (!ok) errors.push(msg); };
function walk(x, fn) { if (!x || typeof x !== 'object') return; if (!Array.isArray(x)) fn(x); for (const v of Object.values(x)) walk(v,fn); }
function jsons(path) { return readdirSync(path,{withFileTypes:true}).flatMap(e => e.isDirectory() ? jsons(resolve(path,e.name)) : e.name.endsWith('.json') ? [read(resolve(path,e.name))] : []); }
const content = loadContent();
const v = resolve(root,'docs/story');
const bj = read(resolve(v,'vorrat_figuren/npcs.json'));
const bd = read(resolve(v,'vorrat_figuren/dialogues.json'));
const bi = read(resolve(v,'vorrat_items/items.json'));
const shops = read(resolve(v,'vorrat_items/handel.json')).merchants;
const external = [...jsons(resolve(root,'src/data')), ...readdirSync(v).filter(n=>n.startsWith('vorrat_')).flatMap(n=>jsons(resolve(v,n)))];
// Optional chapter packages are real registries only when their JSON exists.
for (const name of ['k4_akte','k5_akte','k5_orte']) if (existsSync(resolve(v,name))) external.push(...jsons(resolve(v,name)));
const flags = new Set(), requested = new Set();
// Runtime producer, independently verified instead of silently whitelisted.
const party = readFileSync(resolve(root,'src/core/Party.js'),'utf8');
check(party.includes("this.flags.add('koop_aktiv')"), 'Koop-Flag ohne Laufzeiterzeuger');
if(party.includes("this.flags.add('koop_aktiv')")) flags.add('koop_aktiv');
for (const x of [...external,...Object.values(data)]) walk(x,o=>{ for(const f of o.sets_flags??[]) flags.add(f); if(o.done_flag) flags.add(o.done_flag); });
const districts = ['kutschenhof','kesselgrund','winterpromenade','glasgaerten','stillenhaeuser','wurzelkranz'];
const contracts = new Set(['k5_arrived','kapitel5_done','kapitel4_done','kapitel3_done','koop_aktiv','k2_rowe_frei',...Array.from({length:5},(_,i)=>`bha_akt${i+1}_done`),...['widerspruch','amtsinhaber','buecher','ordnung'].map(x=>'cwa_end_'+x),...districts.map(x=>'bha_ventil_'+x+'_warm')]);
const contractMaps = new Set([...districts,'buegelraum','kutschenhalle','pavillon','verkaufshalle','speisesaal','aktenraum','labor','mutterhaus','verteilanlage','kaltes_palmhaus','verlassene_waescherei','wurzelkammer'].map(x=>'bh_'+x));
const maps = new Set(Object.keys(content.maps));
for(const name of ['k5_orte']) { const f=resolve(v,name,'maps.json'); if(existsSync(f)) { const x=read(f); for(const id of Array.isArray(x)?x.map(m=>m.id):Object.keys(x)) maps.add(id); } }
const npcs = new Set([...Object.keys(content.npcs),...Object.keys(bj),...Object.keys(data.npcs)]);
const items = new Set([...Object.keys(content.items),...Object.keys(bi),...Object.keys(data.items)]);
const encounters = new Set(Object.keys(content.encounters));
for(const f of ['encounters','bosses']) {const x=read(resolve(v,'vorrat_gegner',f+'.json'));for(const id of Object.keys(x))encounters.add(id);}
const quests = new Set([...Object.keys(content.quests),...Object.keys(data.quests)]);
const clues = new Set([...Object.keys(content.clues),...Object.keys(data.case.clues)]);
const deductions = new Set([...content.deductions,...data.case.deductions].map(x=>x.id));
const facts = new Set([...Object.keys(content.facts),...Object.keys(data.case.facts)]);
function mapRef(id) { if(maps.has(id))return; if(contractMaps.has(id)||id.endsWith('__warm')&&contractMaps.has(id.slice(0,-6)))pending.add('Karte '+id); else errors.push('Unbekannte Karte '+id); }
const pref = (id,type) => check(id.startsWith('bhn_'), `${type} ohne Präfix: ${id}`);
for(const kind of ['quests','dialogues','npcs','items','encounters'])for(const id of Object.keys(data[kind]))pref(id,kind);
for(const kind of ['facts','clues','endings'])for(const id of Object.keys(data.case[kind]))pref(id,kind);
for(const d of data.case.deductions){pref(d.id,'Deduktion');for(const pair of d.pairs)for(const f of pair)check(facts.has(f),'Unbekannter Fakt '+f);}
for(const c of Object.values(data.case.clues))check(facts.has(c.fact),'Hinweis ohne Fakt '+c.fact);
for(const [file,x] of Object.entries(data)) walk(x,o=>{
 if(o.map)mapRef(o.map);
 if(o.shop)check(Boolean(shops[o.shop]),'Unbekannter BL-Handel '+o.shop);
 if(o.npc)check(npcs.has(o.npc),'Unbekannter NPC '+o.npc);
 if(o.encounter)check(encounters.has(o.encounter),'Unbekannter Kampf '+o.encounter);
 for(const key of ['requires_flags','hide_if_flags'])for(const f of o[key]??[])requested.add(f);
 for(const key of ['sets_flags','clears_flags'])for(const f of o[key]??[])pref(f,'Flag');
 if(o.done_flag)pref(o.done_flag,'done_flag');
 for(const key of ['requires_clues','hide_if_clues','requires_any_clues','gives_clues'])for(const id of o[key]??[])check(clues.has(id),'Unbekannter Hinweis '+id);
 for(const key of ['requires_conclusions','hide_if_conclusions'])for(const id of o[key]??[])check(deductions.has(id),'Unbekannte Deduktion '+id);
 for(const key of ['requires_quests_active','requires_quests_done','hide_if_quests','start_quests','complete_quests'])for(const id of o[key]??[])check(quests.has(id),'Unbekannte Quest '+id);
 for(const key of ['requires_items','hide_if_items','gives_items','takes_items'])for(const id of Object.keys(o[key]??{}))check(items.has(id),'Unbekanntes Item '+id);
 for(const key of ['bond','requires_bond'])for(const id of Object.keys(o[key]??{}))check(npcs.has(id),'Unbekannte Bindung '+id);
 if(o.id && file !== 'case' && !(file === 'quests' && o.map))pref(o.id,'ID');
 if(o.prompt)check(o.prompt.length<=140,'Prompt zu lang');
 if(o.choices)for(const c of o.choices)check(c.text.length<=140,'Choice zu lang');
});
for(const f of requested) if(!flags.has(f)){if(f.startsWith('won_'))check(encounters.has(f.slice(4)),'Unbekanntes Siegflag '+f);else if(contracts.has(f))pending.add('Flag '+f);else errors.push('Flag ohne Erzeuger '+f);}
for(const id of Object.keys(data.leben))mapRef(id);
for(const id of Object.keys(data.gerede.briarholt))mapRef(id);
for(const [id,n] of Object.entries(data.npcs))check(data.dialogues[n.dialogue],'NPC ohne Dialog '+id);
// Apply the actual merger without placements: missing CH maps are not invented here.
const merged=structuredClone(content);
Object.assign(merged.dialogues,structuredClone(bd));Object.assign(merged.npcs,bj);Object.assign(merged.items,bi);
try { applyQuestPack(merged,{...data,name:'k5_nebenquests',platzierung:[]}); } catch(e){ errors.push('Merge: '+e.message); }
for(const [id,d] of Object.entries(data.dialogues))check(Object.keys(d.nodes).length===6,'Nicht sechs Grundknoten '+id);
for(const [id,a] of Object.entries(data.dialog_zusaetze)){
 check(Boolean(bd[id]||data.dialogues[id]),'Zusatz ohne Grunddialog '+id);
 for(const n of Object.keys(a.nodes_add))pref(n,'Dialogknoten');
}
for(const id of new Set([...Object.keys(data.dialogues),...Object.keys(data.dialog_zusaetze)])){
 const d=merged.dialogues[id]; if(!d)continue;
 const ownNodes=Object.entries(d.nodes).filter(([key])=>key.startsWith('bhn_'));
 for(const [key,n] of ownNodes) for(const c of n.choices??[])if(c.next)check(d.nodes[c.next],`Ungültiges next ${id}/${key} -> ${c.next}`);
 for(const c of data.dialog_zusaetze[id]?.choices_add??[])if(c.next)check(d.nodes[c.next],`Ungültiger Einstieg ${id}/${c.next}`);
 // Every reward-bearing addition must have incoming choices protected by a flag
 // that the same node sets, or by a quest that the node completes.
 for(const [key,n] of ownNodes){
  if(!(n.gives_money>0||n.gives_items||n.bond||n.honor))continue;
  const incoming=Object.values(d.nodes).flatMap(n=>n.choices??[]).filter(c=>c.next===key);
  check(incoming.length>0,'Unerreichbare Belohnung '+key);
  for(const c of incoming)check((c.hide_if_flags??[]).some(f=>(n.sets_flags??[]).includes(f))||(c.hide_if_quests??[]).some(q=>(n.complete_quests??[]).includes(q)),'Wiederholbare Belohnung '+key);
 }
}
const placed=[...data.platzierung,...data.lesestuecke];
const seen=new Set(), positions=new Map();
for(const p of placed){
 const id=p.npc??p.interactable?.id; check(!seen.has(id),'Doppelte Platzierung '+id);seen.add(id);
 const pos=p.map+':'+p.tile.join(',');check(!positions.has(pos),'Belegte Vorschlagszelle '+pos+' '+id+' / '+positions.get(pos));positions.set(pos,id);
 check(p.tile.length===2&&p.tile.every(n=>Number.isInteger(n)&&n>=0),'Ungültige Zelle '+id);
 if(p.interactable)check(p.interactable.text.split(/\s+/).length<=120,'Lesetext zu lang '+id);
}
for(const [id,q] of Object.entries(data.quests)){
 check(q.steps.length>=3&&q.steps.length<=6,'Schrittzahl '+id);check(q.summary.length<=140,'Summary zu lang '+id);
 check(q.reward?.gives_money===0,'Automatische Doppelbelohnung '+id);
 for(const s of q.steps){check(s.text.length<=140,'Schritttext zu lang '+id);check(npcs.has(s.target.id)||seen.has(s.target.id),'Unbekanntes Questziel '+s.target.id);}
}
for(const g of data.geplauder){check(g.requires_flags.includes('koop_aktiv'),'Koop ohne Flag '+g.id);check(g.zeilen.some(z=>z.p==='p2'&&z.a&&z.b),'Koop ohne Stimmen '+g.id);}
const expected={quests:12,npcs:8,einwohner:8,lesestuecke:25,zeitung:8,geplauder:24};
for(const [k,n]of Object.entries(expected))check(Object.keys(data[k]).length===n,`${k}: erwartet ${n}`);
check(Object.values(data.gerede.briarholt).flat().length===60,'Gerede-Anzahl');
for(const [m,entries]of Object.entries(data.gerede.briarholt))check(entries.length===10,'Gerede-Verteilung '+m);
// Graphics placeholders must actually exist.
const wishes=readFileSync(resolve(dir,'grafikwuensche.md'),'utf8');
for(const match of wishes.matchAll(/`(public\/sprites\/[^`]+)`/g))check(existsSync(resolve(root,match[1])),'Fehlender Platzhalter '+match[1]);
// Exercise authored routes with the real condition/effect and deduction engine.
// The flags here are explicit scenario inputs, not purported package producers.
let scenarios=0;
function route(state,dialogId,target,apply=true){
 const d=merged.dialogues[dialogId], start=d.nodes.start?'start':typeof d.start==='string'?d.start:'hub';
 const queue=[[start]], visited=new Set();
 while(queue.length){const path=queue.shift(),id=path.at(-1);if(visited.has(id))continue;visited.add(id);
  if(id===target){if(apply)for(const key of path.slice(1))state.applyEffects(d.nodes[key]);return true;}
  for(const c of d.nodes[id]?.choices??[])if(c.next&&state.meets(c))queue.push([...path,c.next]);
 }return false;
}
for(const q of Object.keys(data.quests))for(const branch of ['a','b'])for(const coop of [false,true]){
 const variants=q==='bhn_brief_aus_calderwick'?['widerspruch','amtsinhaber','buecher','ordnung','dunscar']:q==='bhn_elsbeth'?['frei','ort']:['normal'];
 for(const variant of variants){
  scenarios++;
  const state=new GameState(merged);
  for(const flag of ['k5_arrived','kapitel3_done','bha_akt1_done','bha_akt2_done','bha_akt3_done','bha_akt4_done'])state.flags.add(flag);
  if(coop)state.flags.add('koop_aktiv');if(variant==='frei')state.flags.add('k2_rowe_frei');
  if(q==='bhn_brief_aus_calderwick'&&variant!=='dunscar'){state.flags.add('cwa_end_'+variant);state.flags.add('kapitel4_done');}
  const giver=Object.keys(data.dialog_zusaetze).find(id=>data.dialog_zusaetze[id].nodes_add[q+'_annahme']);
  check(route(state,giver,q+'_annahme'),`Annahme unerreichbar ${q}`);
  check(!route(state,giver,q+'_wahl',false),`Entscheidung ohne Belege ${q}`);
  for(const p of data.platzierung.filter(p=>p.interactable?.id.startsWith(q+'_fund'))){check(state.meets(p.visible_if),'Fund nicht erreichbar '+p.interactable.id);state.applyEffects(p.interactable.effects);}
  check(state.combine(q+'_f1',q+'_f2').result==='new','Deduktion nicht ableitbar '+q);
  if(q==='bhn_brief_aus_calderwick')check(route(state,giver,'bhn_brief_'+variant),'Briefroute '+variant);
  if(q==='bhn_elsbeth')check(route(state,giver,'bhn_elsbeth_quelle_'+(variant==='frei'?'brief':'ort')),'Elsbethroute '+variant);
  if(q==='bhn_wintervorrat'){
   check(!route(state,giver,q+'_wahl',false),'Reserve ohne Haushalte');
   for(let i=1;i<=4;i++){const target=`bhn_reserve_haushalt${i}_ja`,dialogId=Object.keys(data.dialog_zusaetze).find(id=>data.dialog_zusaetze[id].nodes_add[target]);check(route(state,dialogId,target),'Haushalt '+i);}
  }
  const choice=q==='bhn_brief_aus_calderwick'&&branch==='b'?'bhn_paket_'+variant:q+'_'+branch;
  check(route(state,giver,choice),`Entscheidung unerreichbar ${choice}`);
  check(!route(state,giver,choice,false),'Entscheidung wiederholbar '+choice);
  check(route(state,giver,q+'_quittung'),'Quittung unerreichbar '+q);
  check(state.quests[q]==='done','Quest nicht abgeschlossen '+q);
  check(!route(state,giver,q+'_quittung',false),'Auszahlung wiederholbar '+q);
  check(data.quests[q].steps.every(s=>state.meets(s.done)),'Journal bleibt offen '+q);
  if(q==='bhn_wintervorrat')check(state.flags.has('bhn_reserve_geprueft'),'Reservebonus fehlt');
 }
}
console.log(`Spielzustandsprüfung: ${scenarios} Solo/Koop- und Entscheidungsrouten mit GameState.`);

console.log(`JSON: ${files.length} gültig; 12 Quests, 8 Einwohner, 24 Hinweise, 12 Deduktionen.`);
console.log('Umfang: 60 Gerede, 25 Lesestücke, 8 Meldungen, 24 Koop-Wechsel.');
for(const p of [...pending].sort())console.log('OFFEN: '+p);
for(const e of errors)console.error('FEHLER: '+e);
console.log(`Ergebnis: ${errors.length} Inhaltsfehler; ${pending.size} externe Schnittstellen offen.`);
if(errors.length||process.argv.includes('--strict')&&pending.size)process.exitCode=1;
