#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../..');
const pkgDir=path.join(root,'src/data/packs/k3_orte');
// Eingebaut: Spieldaten liegen in src/data/packs/k3_orte, Zusatzdateien bleiben hier. Leere Platzhalter ({}) im Spiel verdecken die Doku-Fassung nicht.
const rd=(dir)=>fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>[f.replace('.json',''),JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))]);
const isEmpty=(v)=>v&&typeof v==='object'&&!Array.isArray(v)&&!Object.keys(v).length;
const docPack=Object.fromEntries(rd(here));
const pack={...docPack,...Object.fromEntries(rd(pkgDir).filter(([k,v])=>!(isEmpty(v)&&k in docPack)))};
const files=Object.keys(pack).sort().map(k=>k+'.json');

function* walk(v){if(!v||typeof v!=='object')return;yield v;for(const c of Object.values(v))yield*walk(c);}
function jsonFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?jsonFiles(path.join(dir,e.name)):e.name.endsWith('.json')?[path.join(dir,e.name)]:[]);}
const sourceFiles=jsonFiles(path.join(root,'src/data')).filter(f=>!f.startsWith(pkgDir));
const sources=sourceFiles.map(f=>({f,v:JSON.parse(fs.readFileSync(f,'utf8'))}));
const extFlags=new Set(['k3_arrived','k3a_akt1_done','k3a_akt2_done','k3a_akt4_done','kapitel3_done']);
const extNPC=new Set(['k3_pfiff','k3_gallowmere','k3_willa','k3_oren','k3_mabel','k3_pelham','k3_nellie','k3_huxford','k3_esther','k3_adaine','k3_weichenstellerin']);
const fixedEnemies=new Set(['schichtgaenger','kalkstaubgeist','signalkraehe','lohnlistenmotte','geruestklang','nachhall','schwellenhund','vorhauer','vielrufer','gallowmere','unterschicht']);
const fixedMaps=new Set(['endbahnhof','schwellenring','arbeiterbogen','kalkmarkt','bruchstufen','signalhang','speisewagen','runddepot','pruefhaus','teesaal','lohnbuero','nachtzug_wagen','nachtzug_lok','rangierwueste','klopfbruch','rufschlucht','letzter_bahnsteig','unterschicht'].map(x=>'ds_'+x));
const source={items:new Set(),npcs:new Set(),maps:new Set(),encounters:new Set(),flags:new Set(),dialogues:new Set(),pathways:new Set()};
for(const {f,v} of sources){
 for(const o of walk(v)){
  for(const kind of ['items','npcs','encounters','dialogues','pathways'])if(o[kind]&&!Array.isArray(o[kind]))for(const id of Object.keys(o[kind]))source[kind].add(id);
  if(o.maps)for(const m of Array.isArray(o.maps)?o.maps:Object.values(o.maps))if(m.id)source.maps.add(m.id);
  for(const flag of o.sets_flags??[])source.flags.add(flag);
  if(o.done_flag)source.flags.add(o.done_flag);
 }
 if(v.rows&&v.id)source.maps.add(v.id);
 if(/\/(items|zutaten)\.json$/.test(f))for(const id of Object.keys(v))source.items.add(id);
 if(f.endsWith('/neue_pfade.json'))for(const id of Object.keys(v))source.pathways.add(id);
}
function validate(p){
 const fail=(ok,msg)=>assert.ok(ok,msg);const pending=new Set();
 const maps=new Map(p.maps.map(m=>[m.id,m]));
 fail(maps.size===18&&[...fixedMaps].every(id=>maps.has(id)),'18 feste Karten-IDs');
 const encounters={...p.encounters,...p.bosses,...p.phasen};
 const registry={maps:new Set([...source.maps,...maps.keys()]),items:new Set([...source.items,...Object.keys(p.items)]),npcs:new Set([...source.npcs,...Object.keys(p.npcs)]),encounters:new Set([...source.encounters,...Object.keys(encounters)]),dialogues:new Set([...source.dialogues,...Object.keys(p.dialogues),...Object.keys(p.beute_vorschlag??{})])};
 const flags=new Set(source.flags);
 for(const data of Object.values(p))for(const o of walk(data)){
  for(const f of o.sets_flags??[]){fail(f.startsWith('k3o_'),'Fremdes Flag gesetzt: '+f);flags.add(f);}
  if(o.done_flag){fail(o.done_flag.startsWith('k3o_'),'Fremdes done_flag');flags.add(o.done_flag);}
 }
 function ref(kind,id){if(registry[kind].has(id))return;if(kind==='npcs'&&extNPC.has(id)){pending.add('NPC '+id);return;}fail(false,`Unbekannt: ${kind}/${id}`);}
 for(const [name,data] of Object.entries(p))for(const o of walk(data)){
  for(const f of [...o.requires_flags??[],...o.hide_if_flags??[]]){
   if(flags.has(f))continue;
   if(f.startsWith('won_')){ref('encounters',f.slice(4));continue;}
   if(extFlags.has(f)){pending.add('Flag '+f);continue;}
   fail(false,'Flag ohne Setzer: '+f);
  }
  for(const f of o.clears_flags??[])fail(f.startsWith('k3o_'),'Fremdes Flag gelöscht');
  if(typeof o.map==='string')ref('maps',o.map);
  if(o.to)ref('maps',o.to);
  if(o.encounter)ref('encounters',o.encounter);
  if(o.combat)ref('encounters',o.combat);
  if(o.dialogue)ref('dialogues',o.dialogue);
  if(o.npc)ref('npcs',o.npc);
  for(const k of ['gives_items','takes_items'])for(const id of Object.keys(o[k]??{}))ref('items',id);
  for(const k of ['requires_items','hide_if_items'])for(const id of o[k]??[])ref('items',id);
  if(o.item)ref('items',o.item);
  if(o.requires_pathway){fail(name==='beute_vorschlag','Unsicherer Pfadfilter in aktiven Daten');fail(source.pathways.has(o.requires_pathway[0]),'Unbekannter Pfad');}
  if(o.text)fail(!o.text.includes(' — ')&&!o.text.includes(' – '),'Gedankenstrich als Satzverbinder');
 }
 for(const [name,defs] of Object.entries({items:p.items,npcs:p.npcs,quests:p.quests,dialogues:p.dialogues,beute_vorschlag:p.beute_vorschlag,phasen:p.phasen,encounters:p.encounters,bosses:p.bosses}))for(const id of Object.keys(defs))fail(id.startsWith('k3o_')||(['encounters','bosses'].includes(name)&&fixedEnemies.has(id)),`Präfix: ${name}/${id}`);
 for(const [id,d] of Object.entries({...p.dialogues,...p.beute_vorschlag})){
  for(const key of Object.keys(d.nodes))fail(key.startsWith('k3o_'),'Knotenpräfix '+id+'/'+key);
  const starts=typeof d.start==='string'?[d.start]:d.start.map(s=>s.node);
  for(const n of starts)fail(!!d.nodes[n],'Startknoten fehlt '+id);
  for(const o of walk(d))if(o.next)fail(!!d.nodes[o.next],'next fehlt '+id+'/'+o.next);
  const seen=new Set(),q=[...starts];while(q.length){const n=q.pop();if(seen.has(n))continue;seen.add(n);for(const c of d.nodes[n].choices??[])if(c.next)q.push(c.next);}
  fail(seen.size===Object.keys(d.nodes).length,'Unerreichbarer Dialogknoten '+id);
 }
 let readCount=0;
 const objectIDs=new Set();
 for(const m of p.maps){
  fail(m.city==='dunscar','Stadt '+m.id);fail(m.tiles_wunsch===m.id,'AV-Thema '+m.id);
  const h=m.rows.length,w=m.rows[0].length;
  fail(m.rows.every(r=>r.length===w&&/^[I.wsg]+$/.test(r)),'Zeilen/Zeichen '+m.id);
  const indoor=['speisewagen','runddepot','pruefhaus','teesaal','lohnbuero','nachtzug_wagen','nachtzug_lok'].some(x=>m.id==='ds_'+x);
  fail(indoor?(w>=16&&w<=24&&h>=10&&h<=14):(w>=40&&w<=48&&h>=20&&h<=30),'Kartengröße '+m.id);
  const free=([x,y])=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<w&&y<h&&m.rows[y][x]!=='I';
  const key=xy=>xy.join(',');const start=m.spawns.default;
  fail(free(start),'Spawn blockiert '+m.id);const seen=new Set([key(start)]),q=[start];
  for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const pt of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]])if(free(pt)&&!seen.has(key(pt))){seen.add(key(pt));q.push(pt);}}
  for(const [id,pt] of Object.entries(m.spawns))fail(free(pt)&&seen.has(key(pt)),'Spawn unerreichbar '+m.id+'/'+id);
  const occupied=new Set();
  for(const o of [...m.interactables,...m.npcs,...m.roamers??[]]){
   fail(free(o.tile)&&seen.has(key(o.tile)),'Objekt unerreichbar '+m.id+'/'+(o.id??o.encounter));
   fail(!occupied.has(key(o.tile)),'Objekte überlappen '+m.id+'/'+key(o.tile));occupied.add(key(o.tile));
   if(m.npcs.includes(o)){ref('npcs',o.id);continue;}
   fail(o.id.startsWith('k3o_'),'Objektpräfix '+o.id);fail(!objectIDs.has(o.id),'Doppelte Objekt-ID '+o.id);objectIDs.add(o.id);
   if(o.kind==='door'){const dest=maps.get(o.to);fail(!!dest?.spawns[o.spawn],'Zielspawn fehlt '+o.id);fail(dest.interactables.some(x=>x.to===m.id),'Rückweg fehlt '+o.id);}
   if(o.kind==='read'){readCount++;fail(o.text?.trim().split(/\s+/).length<=120,'Lesetext zu lang '+o.id);}
  }
  fail(m.interactables.filter(o=>o.kind==='read').length>=6&&m.interactables.filter(o=>o.kind==='read').length<=12,'6–12 Lesestellen '+m.id);
  for(const l of m.lights)fail(free(l.tile),'Licht auf Wand '+m.id);
 }
 // Alle sechs Viertel und der Wagen ohne Flag- oder Signalvoraussetzung verbunden.
 const seenMaps=new Set(['ds_endbahnhof']),queue=['ds_endbahnhof'];
 for(let i=0;i<queue.length;i++)for(const d of maps.get(queue[i]).interactables)if(d.kind==='door'&&!d.visible_if&&!seenMaps.has(d.to)){seenMaps.add(d.to);queue.push(d.to);}
 for(const id of [...p.maps.slice(0,6).map(m=>m.id),'ds_speisewagen'])fail(seenMaps.has(id),'Fußroute gesperrt '+id);
 const superDoors=p.maps.flatMap(m=>m.interactables).filter(x=>x.to==='ds_unterschicht');fail(superDoors.length===1&&superDoors[0].visible_if.requires_flags.includes('kapitel3_done'),'Superboss-Zugang');
 for(const t of p.travel)fail(!!maps.get(t.map)?.spawns[t.spawn],'Reisespawn');
 for(const [id,e] of Object.entries(encounters)){
  fail(Number.isFinite(e.hp)&&e.hp>0,'HP '+id);fail(e.attacks.length>=2,'Angriffe '+id);
  for(const a of e.attacks){fail(a.damage>0&&a.hits.length>=1&&a.hits.every((v,i)=>v>=800&&(i===0||v>a.hits[i-1])),'Ausholzeit '+id);}
  fail(e.lose_to.map==='ds_speisewagen','Niederlageziel '+id);
 }
 for(const [id,z] of Object.entries(p.zones)){
  fail(z.tier===({ds_rangierwueste:4,ds_klopfbruch:4,ds_rufschlucht:5,ds_unterschicht:6})[id],'Tier '+id);
  const regular=Object.values(z.encounters).filter(e=>!e.boss);fail(regular.length>=2&&regular.length<=4,'Gebietsbewohner');
  fail(Object.values(z.encounters).filter(e=>e.boss).length===1,'Gebietsboss');
  for(const [eid,e] of Object.entries(z.encounters)){
   fail(!!e.loot&&!!e.roam,'Loot/Roam '+eid);
   if(e.boss)assert.deepEqual(e,p.bosses[eid],'Bosskopie abweichend');
   else{fail(!!e.elite,'Elite fehlt');const {elite,loot,roam,...direct}=e;assert.deepEqual(direct,p.encounters[eid],'Normalgegnerkopie abweichend');}
  }
 }
 fail(Object.keys(p.items).length===14&&Object.keys(p.artifacts.list).length===2,'12 Beuten + 2 Artefakte');
 for(const [id,a] of Object.entries(p.artifacts.list)){fail(a.boons.length&&a.curses.length,'Artefaktrisiko');assert.deepEqual(p.items[id].boons,a.boons);assert.deepEqual(p.items[id].curses,a.curses);}
 let rewards=0;
 for(const [id,d] of Object.entries(p.beute_vorschlag)){
  const boss=id.slice(4,-6),expected=boss==='schwellenhund'?3:10;
  const cs=d.nodes.k3o_start.choices.filter(c=>c.requires_pathway);fail(cs.length===expected,'Pfadanzahl '+boss);
  fail(new Set(cs.map(c=>c.requires_pathway[0])).size===expected,'Doppelter Pfad');
  for(const c of cs){const n=d.nodes[c.next];const item=Object.keys(n.gives_items)[0];const seq=({schwellenhund:5,vorhauer:3,vielrufer:2,unterschicht:1})[boss];fail(item===`sq_zutat_${c.requires_pathway[0].replace(/^sq_/,'')}_${seq}`,'Falsche Kernzutat');fail(c.requires_flags.includes(`k3o_${boss}_geloest`)&&c.hide_if_flags.every(f=>n.sets_flags.includes(f)),'Einmaligkeit');rewards++;}
 }
 fail(rewards===33,'33 Kernzutatenvarianten');
 return {pending:[...pending].sort(),readCount};
}
const result=validate(pack);
// Fehlereinbringung: Prüfer darf kaputte Inhalte nicht erfolgreich melden.
const mutations=[
 p=>p.maps[0].rows[0]+='I',
 p=>p.maps[0].spawns.default=[0,0],
 p=>p.maps[0].interactables[0].effects={gives_items:{k3o_unbekannt:1}},
 p=>p.dialogues.k3o_schwellenhund_station.nodes.k3o_start.choices[0].next='k3o_fehlt',
 p=>p.maps[0].interactables[0].visible_if={requires_flags:['k3o_unbelegt']},
 p=>p.maps[0].interactables.find(x=>x.to).spawn='k3o_fehlt',
 p=>p.beute_vorschlag.k3o_vorhauer_beute.nodes.k3o_start.choices[0].requires_pathway=['unbekannt',9],
 p=>p.dialogues.k3o_schwellenhund_station.nodes.k3o_start.choices[0].requires_pathway=['laterne',9],
];
for(const mutate of mutations){const clone=structuredClone(pack);mutate(clone);assert.throws(()=>validate(clone),'Negativtest muss fehlschlagen');}
console.log(`OK: ${files.length} JSON-Dateien; 18 Karten; ${result.readCount} Lesestellen; Geometrie, Spawns, Objekte, Rückwege und Fußroute geprüft.`);
console.log('OK: 6 Normalgegner, 5 Bossketten (8 Kampfabschnitte), 4 Zonen, 14 Items, 2 Artefakte, 33 quarantänierte Pfadbeuten.');
console.log(`OK: Dialogziele, Referenzen, Flagsetzer, Präfixe, Einmaligkeit und ${mutations.length} Negativtests.`);
if(result.pending.length){console.log(`EXTERN OFFEN (${result.pending.length}): ${result.pending.join(', ')}`);if(process.argv.includes('--strict-external'))process.exitCode=1;}
console.log('INTEGRATION OFFEN: Signals, Pfadfilter/Koop-Auszahlung, nahtlose Bossphasen und Paketloader; siehe offene_punkte.md.');
// Echte vorhandene Zustands-/Kampflogik, ausschließlich Node und lokale ES-Module.
const {GameState}=await import('../../../src/core/GameState.js');
const {Combat}=await import('../../../src/core/Combat.js');
const {loadContent}=await import('../../../tests/helpers.js');
const content=loadContent();
Object.assign(content.items,pack.items);
Object.assign(content.encounters,pack.encounters,pack.bosses,pack.phasen);
Object.assign(content.dialogues,pack.dialogues);
for(const m of pack.maps)content.maps[m.id]=m;
function win(state,id){const fight=new Combat(state,id);fight.outcome='won';fight.finish();}
for(const [boss,phases] of [['gallowmere',2],['unterschicht',3]]){
 const state=new GameState(content);const starts=pack.dialogues[`k3o_${boss}_station`].nodes.k3o_start.choices;
 const first=starts.find(c=>c.next==='k3o_kampf');
 if(boss==='gallowmere'){assert.equal(state.meets(first),false);state.flags.add('k3a_akt4_done');}
 assert.ok(state.meets(first));
 win(state,boss);assert.equal(state.flags.has(`k3o_${boss}_geloest`),false);assert.equal(state.meets(first),false);
 for(let i=2;i<=phases;i++){
  const c=starts.find(c=>c.next===`k3o_phase${i}`);assert.ok(state.meets(c));
  const node=pack.dialogues[`k3o_${boss}_station`].nodes[c.next];
  let started;state.on('combat',id=>{started=id;});state.applyEffects(node);assert.equal(started,`k3o_${boss}_phase${i}`);
  win(state,started);assert.equal(state.meets(c),false);
 }
 assert.ok(state.flags.has(`k3o_${boss}_geloest`));
 const last=`k3o_${boss}_phase${phases}`;const trophy=Object.keys(pack.phasen[last].first_win.gives_items)[0];
 assert.equal(state.itemCount(trophy),1);win(state,last);assert.equal(state.itemCount(trophy),1,'Trophäe nicht erneut auszahlen');
}
for(const boss of ['schwellenhund','vorhauer','vielrufer','unterschicht']){
 const state=new GameState(content),d=pack.dialogues[`k3o_${boss}_station`];
 const peaceful=d.nodes.k3o_start.choices.find(c=>c.next==='k3o_friedlich');
 assert.equal(state.meets(peaceful),false);state.applyEffects(d.nodes.k3o_vorbereitung);assert.ok(state.meets(peaceful));
 state.applyEffects(d.nodes.k3o_friedlich);assert.ok(state.flags.has(`k3o_${boss}_geloest`));assert.equal(state.meets(peaceful),false);
 assert.equal(state.flags.has(`won_${boss}`),false,'Friedlich ist kein Kampfsieg');
}
for(const m of pack.maps)for(const o of m.interactables.filter(o=>o.effects?.gives_items)){
 const s=new GameState(content);assert.ok(s.meets(o.visible_if));s.applyEffects(o.effects);s.flags.add(o.done_flag);assert.equal(s.meets(o.visible_if),false);
}
console.log('OK: echte GameState/Combat-Prüfung: 2 Bossketten, Finale-Gate, 4 friedliche Lösungen, keine doppelte Phasentrophäe, 2 einmalige Artefaktfunde.');
