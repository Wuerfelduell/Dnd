import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(here,'../../..');
const pkgDir=path.join(root,'src/data/packs/k3_akte');
// Eingebaut: Spieldaten liegen in src/data/packs/k3_akte, Zusatzdateien bleiben hier. Leere Platzhalter ({}) im Spiel verdecken die Doku-Fassung nicht.
const rd=(dir)=>fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))]);
const isEmpty=(v)=>v&&typeof v==='object'&&!Array.isArray(v)&&!Object.keys(v).length;
const docPack=Object.fromEntries(rd(here));
const pack={...docPack,...Object.fromEntries(rd(pkgDir).filter(([k,v])=>!(isEmpty(v)&&k in docPack)))};
const files=Object.keys(pack).sort().map(k=>k+'.json');

const errors=[],pending=new Set();
function check(ok,msg){if(!ok)errors.push(msg);}
function walk(v,fn,p=''){if(!v||typeof v!=='object')return;fn(v,p);for(const [k,x] of Object.entries(v))walk(x,fn,p+'/'+k);}
function jsonFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?jsonFiles(path.join(dir,e.name)):e.name.endsWith('.json')?[path.join(dir,e.name)]:[]);}
const src=jsonFiles(path.join(root,'src/data')).filter(f=>!f.startsWith(pkgDir)).map(f=>({file:f,data:JSON.parse(fs.readFileSync(f,'utf8'))}));
const regs=Object.fromEntries(['maps','npcs','items','encounters','dialogues','quests','facts','clues','endings','deductions'].map(k=>[k,new Set()]));
const setFlags=new Set();
function index(data,file){
 walk(data,o=>{
  for(const f of o.sets_flags??[])setFlags.add(f);
  if(o.done_flag)setFlags.add(o.done_flag);
  for(const key of Object.keys(regs)){
   const val=o[key];if(Array.isArray(val))for(const x of val){if(x?.id)regs[key].add(x.id);}
   else if(val&&typeof val==='object')for(const id of Object.keys(val))regs[key].add(id);
  }
 });
 const base=path.basename(file,'.json');
 if(regs[base]&&!Array.isArray(data))for(const id of Object.keys(data))regs[base].add(id);
 if(base==='zutaten'||base==='artefakte')for(const id of Object.keys(data))regs.items.add(id);
}
for(const s of src)index(s.data,s.file);
for(const [f,v] of Object.entries(pack))index(v,f+'.json');
const fixedNPC=['k3_pfiff','k3_gallowmere','k3_willa','k3_oren','k3_mabel','k3_pelham','k3_nellie','k3_huxford','k3_esther','k3_adaine'];
const fixedEnd=['k3_feierabend','k3_stilllegung','k3_gegenstimme','k3_vollzaehlig'];
// Exakte, im AR-Auftrag fest zugesagte AS-Abhängigkeiten, keine allgemeine ds_-/won_-Freigabe.
const externalMaps=new Set(['ds_endbahnhof','ds_schwellenring','ds_arbeiterbogen','ds_kalkmarkt','ds_bruchstufen','ds_signalhang','ds_speisewagen','ds_runddepot','ds_pruefhaus','ds_teesaal','ds_lohnbuero','ds_nachtzug_wagen','ds_nachtzug_lok','ds_rangierwueste','ds_klopfbruch','ds_rufschlucht','ds_letzter_bahnsteig','ds_unterschicht']);
const externalBoss=new Set(['schwellenhund','vorhauer','vielrufer','gallowmere']);
function ref(kind,id,where){
 if(regs[kind].has(id))return;
 if((kind==='maps'&&externalMaps.has(id))||(kind==='encounters'&&externalBoss.has(id))){pending.add(kind+':'+id);return;}
 errors.push(`Unbekannte Referenz ${kind}:${id} (${where})`);
}
function pref(id,where){check(id.startsWith('k3a_')||fixedNPC.includes(id)||fixedEnd.includes(id),`Präfix ${id} (${where})`);}
for(const key of ['quests','dialogues','npcs','items','encounters'])for(const id of Object.keys(pack[key]))pref(id,key);
for(const key of ['facts','clues','endings'])for(const id of Object.keys(pack.case[key]))pref(id,'case/'+key);
for(const d of pack.case.deductions){pref(d.id,'deductions');for(const pair of d.pairs){check(pair.length===2,'Faktenpaar '+d.id);for(const id of pair)ref('facts',id,d.id);}}
for(const [id,c] of Object.entries(pack.case.clues))ref('facts',c.fact,id);
for(const [id,d] of Object.entries(pack.dialogues)){
 const nodes=d.nodes;for(const nid of Object.keys(nodes))pref(nid,id);
 for(const s of typeof d.start==='string'?[{node:d.start}]:d.start)check(nodes[s.node],`Start ${id}/${s.node}`);
 for(const [nid,n] of Object.entries(nodes))for(const c of n.choices??[])if(c.next)check(nodes[c.next],`next ${id}/${nid} -> ${c.next}`);
 // Alle Knoten strukturell erreichbar (Bedingungen zusätzlich in Durchläufen unten).
 const seen=new Set(),todo=(typeof d.start==='string'?[d.start]:d.start.map(s=>s.node));
 while(todo.length){const n=todo.pop();if(seen.has(n)||!nodes[n])continue;seen.add(n);todo.push(...(nodes[n].choices??[]).map(c=>c.next).filter(Boolean));}
 check(seen.size===Object.keys(nodes).length,`Unerreichbare Knoten in ${id}: ${Object.keys(nodes).filter(n=>!seen.has(n))}`);
}
for(const [filename,data] of Object.entries(pack))walk(data,(o,p)=>{
 for(const f of o.sets_flags??[])check(f.startsWith('k3a_')||['k3_arrived','kapitel3_done'].includes(f),`Fremdes Flag gesetzt: ${f}`);
 if(o.done_flag)check(o.done_flag.startsWith('k3a_')||o.done_flag==='k3_arrived','done_flag Präfix');
 for(const f of [...(o.requires_flags??[]),...(o.hide_if_flags??[]),...(o.clears_flags??[])]){
  if(f.startsWith('won_'))ref('encounters',f.slice(4),p);
  else check(setFlags.has(f),`Flag ohne Setzer ${f} (${filename}${p})`);
 }
 for(const [field,kind] of Object.entries({map:'maps',npc:'npcs',dialogue:'dialogues',encounter:'encounters',ending:'endings'}))if(typeof o[field]==='string')ref(kind,o[field],filename+p);
 for(const [field,kind] of Object.entries({requires_clues:'clues',hide_if_clues:'clues',requires_any_clues:'clues',gives_clues:'clues',requires_conclusions:'deductions',hide_if_conclusions:'deductions',start_quests:'quests',complete_quests:'quests',requires_quests_active:'quests',requires_quests_done:'quests',hide_if_quests:'quests'}))for(const id of o[field]??[])ref(kind,id,filename+p);
 for(const field of ['gives_items','takes_items','requires_items','hide_if_items'])if(o[field])for(const id of Array.isArray(o[field])?o[field]:Object.keys(o[field]))ref('items',id,filename+p);
 for(const id of Object.keys(o.bond??{}))ref('npcs',id,filename+p);
});
for(const p of pack.platzierung){if(p.interactable)pref(p.interactable.id,'platzierung');check(p.tile.length===2&&p.tile.every(Number.isInteger),'tile');}
const objects=new Set(pack.platzierung.flatMap(p=>p.npc?[p.npc]:[p.interactable.id]));
for(const q of Object.values(pack.quests))for(const s of q.steps)check(objects.has(s.target.id),'Questziel '+s.target.id);
const patternIds=new Set(pack.rufmuster.map(x=>x.id));
for(const r of pack.rufmuster){pref(r.id,'rufmuster');ref('clues',r.gefunden_durch,r.id);}
for(const h of pack.horchstellen)for(const id of [h.richtig,...Object.keys(h.falsch)])check(patternIds.has(id),'Horchmuster '+id);
for(const n of pack.zeitung)pref(n.id,'zeitung');
for(const i of Object.values(pack.items))if(i.kind==='gear')check(['hut','mantel','amulett'].includes(i.slot),'Unbekannter Ausrüstungsslot');
check(Object.keys(pack.quests).length===5,'Fünf Akte');check(pack.case.deductions.length===20,'20 Deduktionen');
check(Object.keys(pack.case.clues).length>=80&&Object.keys(pack.case.clues).length<=110,'Hinweisumfang');
const nodeCount=Object.values(pack.dialogues).reduce((n,d)=>n+Object.keys(d.nodes).length,0);check(nodeCount>=200&&nodeCount<=300,'Dialogumfang');
for(const e of fixedEnd)check(pack.epiloge.filter(x=>x.ending===e).length>=3,'Epilog fehlt '+e);
// Daten-Simulation: untersucht nur erreichbare Kartenobjekte/Choices. Keine AS-Geometrie simuliert.
function meets(o,s){return (o.requires_flags??[]).every(x=>s.flags.has(x))&&!(o.hide_if_flags??[]).some(x=>s.flags.has(x))&&(o.requires_clues??[]).every(x=>s.clues.has(x))&&!(o.hide_if_clues??[]).some(x=>s.clues.has(x))&&(o.requires_conclusions??[]).every(x=>s.cons.has(x))&&(o.requires_quests_active??[]).every(x=>s.active.has(x));}
function run(origin,combat,nellie,end){
 const s={flags:new Set(['kapitel2_done','k2_end_'+origin]),clues:new Set(),cons:new Set(),active:new Set(),visited:new Set(),maps:new Set(),travel:false};
 function effect(o){
  for(const x of o.sets_flags??[])s.flags.add(x);
  for(const x of o.clears_flags??[])s.flags.delete(x);
  for(const x of o.gives_clues??[])s.clues.add(x);
  for(const x of o.start_quests??[])s.active.add(x);
  for(const x of o.complete_quests??[])s.active.delete(x);
  if(o.travel?.map==='ds_endbahnhof')s.travel=true;
  if(o.encounter){assert(combat);s.flags.add('won_'+o.encounter);}
 }
 function allowed(n){
  if(n==='k3a_nellie_schutz'&&nellie==='offen')return false;
  if(n==='k3a_nellie_warnung'&&nellie==='geheim')return false;
  if(n==='k3a_namensantwort')return false;
  if(n==='k3a_gallowmere_kampf')return combat;
  if(n==='k3a_gallowmere_konfrontation')return !combat;
  if(/k3a_(24|33|52)_horchen_kampf/.test(n))return combat;
  if(/k3a_(24|33|52)_horchen_richtig/.test(n))return !combat;
  return !n.startsWith('k3a_urteil_');
 }
 function dialogue(id){
  const d=pack.dialogues[id];const starts=typeof d.start==='string'?[{node:d.start}]:d.start;
  const start=starts.find(o=>meets(o,s));if(!start)return;
  const todo=[start.node],seen=new Set();
  while(todo.length){const n=todo.shift();if(seen.has(n)||!allowed(n))continue;seen.add(n);const o=d.nodes[n];
   if(!s.visited.has(id+'/'+n)){effect(o);s.visited.add(id+'/'+n);}
   for(const c of o.choices??[])if(c.next&&meets(c,s))todo.push(c.next);
  }
 }
 for(let pass=0;pass<90;pass++){
  for(const p of pack.platzierung){
   if(p.map.startsWith('ds_')&&!s.travel)continue;
   if(!meets(p.visible_if??{},s))continue;s.maps.add(p.map);
   const o=p.interactable;
   if(p.npc)dialogue(pack.npcs[p.npc].dialogue);
   else if(o.kind==='dialogue')dialogue(o.dialogue);
   else if(!o.done_flag||!s.flags.has(o.done_flag)){effect(o.effects??{});if(o.done_flag)s.flags.add(o.done_flag);}
  }
  const facts=new Set([...s.clues].map(c=>pack.case.clues[c].fact));
  for(const d of pack.case.deductions)if(d.pairs.some(p=>p.every(f=>facts.has(f))))s.cons.add(d.id);
 }
 assert(s.travel,origin+' Reise');assert.equal(s.cons.size,20,'Alle Deduktionen erreichbar');
 assert.equal(s.clues.size,80,'Alle Hinweise erreichbar');
 assert(s.flags.has('k3a_bilanz5'),'Bilanz erreichbar');
 const target=pack.case.endings[end];assert(meets(target,s),end+' nicht erreichbar');
 // Jede verpflichtende Bedingung muss als fehlend das Ende sperren.
 for(const f of target.requires_flags){s.flags.delete(f);assert(!meets(target,s),end+' Flag-Gate '+f);s.flags.add(f);}
 for(const c of target.requires_conclusions){s.cons.delete(c);assert(!meets(target,s),end+' Deduktions-Gate '+c);s.cons.add(c);}
 effect(target);assert(s.flags.has('kapitel3_done'));for(const e of Object.values(pack.case.endings))assert(!meets(e,s),'Ende wiederholbar');
 for(const boss of externalBoss)assert(s.flags.has(combat?'won_'+boss:'k3a_'+boss+'_friedlich'),'Bossweg '+boss);
 return s;
}
let runs=0;
try{for(const o of ['rein','moor','lichtmeister','meer'])for(const combat of [false,true])for(const n of ['geheim','offen'])for(const e of fixedEnd){run(o,combat,n,e);runs++;}}catch(e){errors.push('Durchlauf: '+e.message);}
// Früh mögliche Enden ohne künstlich vorgezogene Akt-V-Bilanz.
try {
 const minimal=(flags,cons)=>({flags:new Set(flags),cons:new Set(cons),clues:new Set(),active:new Set()});
 assert(meets(pack.case.endings.k3_stilllegung,minimal(['k3a_akt4_done','k3a_lebende_draussen'],['k3a_44_d'])));
 assert(!meets(pack.case.endings.k3_stilllegung,minimal(['k3a_akt4_done'],['k3a_44_d'])));
 assert(meets(pack.case.endings.k3_vollzaehlig,minimal(['k3a_akt4_done'],['k3a_44_d'])));
 assert(meets(pack.case.endings.k3_gegenstimme,minimal(['k3a_akt4_done','k3a_lebende_draussen','k3a_anker_einwilligung'],['k3a_43_d','k3a_52_d'])));
 for(const [id,nodes] of Object.entries(pack.dialogues).map(([id,d])=>[id,d.nodes])) {
  for(const [nid,n] of Object.entries(nodes))if(n.gives_items||n.honor||n.bond) {
   const incoming=Object.values(nodes).flatMap(n=>n.choices??[]).filter(c=>c.next===nid);
   // Aktbelohnungen liegen hinter Bestätigung, deren erster Eingang gesperrt ist.
   if(nid.startsWith('k3a_abschluss')) {
    const entry=Object.values(nodes).flatMap(n=>n.choices??[]).find(c=>c.next===nid.replace('_ja',''));
    assert(entry?.hide_if_flags?.some(f=>(n.sets_flags??[]).includes(f)),`Belohnungssperre ${id}/${nid}`);
   } else assert(incoming.some(c=>c.hide_if_flags?.some(f=>(n.sets_flags??[]).includes(f))),`Belohnungssperre ${id}/${nid}`);
  }
 }
} catch(e) { errors.push('Frühe Enden/Belohnungen: '+e.message); }
console.log(`JSON: ${files.length} Dateien gültig. Akte: 5; Hinweise: ${Object.keys(pack.case.clues).length}; Deduktionen: 20; Dialogknoten: ${nodeCount}.`);
console.log(`Referenzen, Präfixe, Flag-Setzer, Dialogziele und Erreichbarkeit: ${errors.length?'FEHLER':'OK'}.`);
console.log(`Durchläufe: ${runs}/64 (4 Anreisen × 2 Bosswege × 2 Nellie-Entscheidungen × 4 Enden), einschließlich negativer Endbedingungen.`);
console.log(`Rufmuster: ${pack.rufmuster.length}; Horchstellen: ${pack.horchstellen.length}; Epiloge: ${pack.epiloge.length}; Zeitung: ${pack.zeitung.length}.`);
console.log('Externe AS-Referenzen noch offen: '+[...pending].sort().join(', '));
console.log('Keine Laufzeit-/Kartenprüfung: siehe offene_punkte.md (AS, Enden-Loader, Pfiff, Rufsystem, Beute).');
if(process.argv.includes('--strict-external')&&pending.size)errors.push('AS-Abhängigkeiten noch nicht integriert.');
if(errors.length){for(const e of errors)console.error('FEHLER: '+e);process.exitCode=1;}
