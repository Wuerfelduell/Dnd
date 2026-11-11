#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../../../tests/helpers.js';

const here=dirname(fileURLToPath(import.meta.url)), root=resolve(here,'../../..');
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const own=Object.fromEntries(readdirSync(here).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),read(join(here,f))]));
const content=loadContent();
const cgArg=process.argv.indexOf('--cg-dir');
const cgDir=cgArg>=0?resolve(process.argv[cgArg+1]):join(root,'docs/story/k5_akte');
const cg=existsSync(join(cgDir,'dialogues.json'))?Object.fromEntries(['dialogues','dialog_zusaetze','platzierung','ventile','boss_texte'].filter(f=>existsSync(join(cgDir,f+'.json'))).map(f=>[f,read(join(cgDir,f+'.json'))])):null;
const banks=[['hof','pult','tee','palm'],['beete','akten','waesche','reserve'],['labor','wurzel','kuehlung','klappe']];
const circles=banks.flat();
// Exact, reviewed external contracts, never counted as local flag producers.
const cgFlags=new Set(['k5_arrived','kapitel5_done','bha_end_schmerzlos','bha_54_geschlossen',...Array.from({length:4},(_,i)=>`bha_akt${i+1}_done`),...['glasgaertner','atemkessel','bluetenmund'].map(k=>`bha_${k}_friedlich`),...circles.flatMap(c=>['offen','zu','behaelter','klinik','leer'].map(s=>`bha_ventil_${c}_${s}`))]);
const cgDialogs=new Set(circles.map(c=>'bha_ventil_'+c).concat('bha_finale'));
const errors=[],pending=new Set();
const check=(v,m)=>{if(!v)errors.push(m);};
const values=x=>Object.values(x??{});
function walk(x,fn,path=''){
 if(Array.isArray(x)){x.forEach((v,i)=>walk(v,fn,path+'/'+i));return;}
 if(!x||typeof x!=='object')return;
 fn(x,path);for(const [k,v] of Object.entries(x))walk(v,fn,path+'/'+k);
}
function jsonFiles(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?jsonFiles(join(dir,e.name)):e.name.endsWith('.json')?[join(dir,e.name)]:[]);}
const stock={};
for(const pack of ['vorrat_gegner','vorrat_figuren','vorrat_items'])stock[pack]=Object.fromEntries(jsonFiles(join(root,'docs/story',pack)).map(p=>[p.split('/').pop().slice(0,-5),read(p)]));
const allSources=jsonFiles(join(root,'src/data')).map(read).concat(values(own),...values(stock).map(values),cg?values(cg):[]);
const produced=new Set();
for(const data of allSources)walk(data,o=>{for(const f of o.sets_flags??[])produced.add(f);if(o.done_flag)produced.add(o.done_flag);});
const maps=new Map(own.maps.map(m=>[m.id,m]));
const allMaps=new Map([...Object.entries(content.maps),...maps]);
const items={...content.items,...stock.vorrat_gegner.items,...stock.vorrat_items.items,...own.items};
const npcs={...content.npcs,...stock.vorrat_figuren.npcs,...own.npcs};
const encounters={...content.encounters,...stock.vorrat_gegner.encounters,...stock.vorrat_gegner.bosses,...stock.vorrat_gegner.phasen,...own.encounters,...own.bosses};
const dialogues={...content.dialogues,...stock.vorrat_gegner.dialogues,...stock.vorrat_figuren.dialogues,...stock.vorrat_items.fundstuecke,...cg?.dialogues,...own.dialogues};
for(const [id,extra] of Object.entries(own.dialog_zusaetze)){
 check(!!dialogues[id]||(!cg&&cgDialogs.has(id)),'Zusatzdialog fehlt: '+id);
 if(!dialogues[id]){pending.add('CG-Dialog '+id);dialogues[id]={nodes:{}};}
 check(Object.keys(extra).every(k=>['choices_add','nodes_add'].includes(k)),'Zusatzformat '+id);
 for(const node of Object.keys(extra.nodes_add))check(!dialogues[id].nodes[node],'Fremdknoten überschrieben '+id+'/'+node);
 dialogues[id]={...dialogues[id],nodes:{...dialogues[id].nodes,...extra.nodes_add}};
 for(const c of extra.choices_add)check(!c.next||!!dialogues[id].nodes[c.next],'Zusatz-next '+id+'/'+c.next);
}

for(const [file,data] of Object.entries(own))walk(data,(o,p)=>{
 const where=file+p;
 for(const f of [...o.requires_flags??[],...o.hide_if_flags??[]]){
  if(f.startsWith('won_'))check(!!encounters[f.slice(4)],'Unbekannter Sieg '+f);
  else if(!produced.has(f)){
   if(!cg&&cgFlags.has(f))pending.add('CG-Flag '+f);else errors.push('Flag ohne Quelle '+f+' @ '+where);
  }
 }
 for(const f of o.sets_flags??[])check(f.startsWith('bho_'),'Fremdes Flag gesetzt '+f);
 for(const f of o.clears_flags??[])check(f.startsWith('bho_'),'Fremdes Flag gelöscht '+f);
 if(o.done_flag)check(o.done_flag.startsWith('bho_'),'Fremdes done_flag '+o.done_flag);
 for(const key of ['gives_items','takes_items','requires_items','hide_if_items']){
  const refs=Array.isArray(o[key])?o[key]:Object.keys(o[key]??{});
  for(const id of refs)check(!!items[id],'Item fehlt '+id+' @ '+where);
 }
 if(o.item)check(!!items[o.item],'Drop-Item fehlt '+o.item);
 if(o.encounter)check(!!encounters[o.encounter],'Kampf fehlt '+o.encounter);
 if(o.dialogue&&!dialogues[o.dialogue]){
  if(!cg&&cgDialogs.has(o.dialogue))pending.add('CG-Dialog '+o.dialogue);else errors.push('Dialog fehlt '+o.dialogue);
 }
 for(const mid of [o.to,o.travel?.map,o.lose_to?.map].filter(Boolean))check(allMaps.has(mid),'Karte fehlt '+mid);
 if(o.travel?.map)check(!!allMaps.get(o.travel.map)?.spawns[o.travel.spawn??'default'],'Reisespawn fehlt '+where);
 if(o.shop)check(!!stock.vorrat_items.handel.merchants[o.shop],'BL-Händlerrolle fehlt '+o.shop);
 if(o.requires_pathway)check(!!content.pathways[Array.isArray(o.requires_pathway)?o.requires_pathway[0]:o.requires_pathway],'Pfad fehlt '+where);
 for(const key of ['prompt','title'])if(typeof o[key]==='string')check(o[key].length<=140,'Oberflächentext zu lang '+where+'/'+key);
 if(o.kind==='read')check(o.text.trim().split(/\s+/).length<=120,'Lesetext zu lang '+where);
});
for(const id of Object.keys(own.dialogues))check(id.startsWith('bho_'),'Dialogpräfix '+id);
for(const file of ['quests','items','npcs','encounters'])for(const id of Object.keys(own[file]))check(id.startsWith('bho_'),'Präfix '+file+'/'+id);
check(Object.keys(own.bosses).join()==='bha_aussaat_schwarm','Nur vertraglicher Aussaatschwarm in bosses.json');
for(const [id,d] of Object.entries({...own.dialogues,...Object.fromEntries(Object.keys(own.dialog_zusaetze).map(k=>[k,dialogues[k]]))})){
 const localNodes=own.dialogues[id]?.nodes??own.dialog_zusaetze[id].nodes_add;
 for(const [nid,n] of Object.entries(localNodes)){
  check(nid.startsWith('bho_'),'Knotenpräfix '+id+'/'+nid);
  for(const c of n.choices??[]){check(c.text.length<=140,'Choice zu lang '+id+'/'+nid);check(!c.next||!!d.nodes[c.next],'next fehlt '+id+'/'+nid+'/'+c.next);}
 }
 if(own.dialogues[id])for(const s of (Array.isArray(d.start)?d.start:[{node:d.start}]))check(!!d.nodes[s.node],'Start fehlt '+id);
}

const walkable=(m,[x,y])=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&y<m.rows.length&&x<m.rows[0].length&&'.wsg'.includes(m.rows[y][x]);
function flood(m,start){const seen=new Set([start.join()]),queue=[start];for(let q=0;q<queue.length;q++){const [x,y]=queue[q];for(const p of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]])if(walkable(m,p)&&!seen.has(p.join())){seen.add(p.join());queue.push(p);}}return seen;}
check(own.maps.length===36&&maps.size===36,'36 eindeutige Karten erwartet');
const expected=['kutschenhof','kesselgrund','winterpromenade','glasgaerten','stillenhaeuser','wurzelkranz','buegelraum','kutschenhalle','pavillon','verkaufshalle','speisesaal','aktenraum','labor','mutterhaus','verteilanlage','kaltes_palmhaus','verlassene_waescherei','wurzelkammer'].map(x=>'bh_'+x);
let reads=0,exits=0;
for(const base of expected){
 const a=maps.get(base),b=maps.get(base+'__warm');check(!!a&&!!b,'Kartenpaar fehlt '+base);if(!a||!b)continue;
 check(JSON.stringify(a.rows)===JSON.stringify(b.rows),'Grundriss verschieden '+base);
 check(JSON.stringify(a.spawns)===JSON.stringify(b.spawns),'Spawns verschieden '+base);
 check(a.tiles_wunsch.endsWith(base==='bh_buegelraum'?'_warm':'_kalt')&&b.tiles_wunsch.endsWith('_warm'),'CI-Zustände '+base);
 const has=kind=>a.interactables.some(i=>i.kind===kind);
 if(base==='bh_buegelraum')for(const k of ['rest','storage','casewall','read'])check(has(k),'Unterschlupf fehlt '+k);
 for(const m of [a,b]){
  check(m.city==='briarholt','Stadt '+m.id);
  check(m.rows.every(r=>r.length===m.rows[0].length),'Zeilenlänge '+m.id);
  const reach=flood(m,m.spawns.default),ids=new Set();
  for(const [spawn,p] of Object.entries(m.spawns))check(walkable(m,p)&&reach.has(p.join()),'Spawn unerreichbar '+m.id+'/'+spawn);
  for(const i of [...m.interactables,...m.npcs,...m.roamers]){
   check(walkable(m,i.tile)&&reach.has(i.tile.join()),'Objekt/NPC unerreichbar '+m.id+'/'+i.id+' '+i.tile);
   check(!ids.has(i.id),'Doppelte ID auf Karte '+m.id+'/'+i.id);ids.add(i.id);
   if(m.npcs.includes(i))check(!!npcs[i.id],'NPC fehlt '+i.id);
   else check(i.id.startsWith('bho_')||circles.some(c=>i.id==='bha_ventil_'+c),'Objektpräfix '+i.id);
   if(i.kind==='door'){exits++;check(!!allMaps.get(i.to)?.spawns[i.spawn??'default'],'Türziel '+m.id+'/'+i.id);}
  }
  const count=m.interactables.filter(i=>i.kind==='read').length;reads+=count;
  check(count>=6&&count<=12,'6–12 Lesestellen '+m.id+' hat '+count);
  const cabinet=m.interactables.find(i=>i.id.endsWith('_wartung'));
  check(cabinet?.effects?.gives_items?.vi_m_kupferrohrstueck===1,'Garantiertes Material '+m.id);
 }
 // No doubled grants when the same physical object exists in both states.
 for(const i of a.interactables.filter(i=>i.effects?.gives_items))check(b.interactables.find(j=>j.id===i.id)?.done_flag===i.done_flag,'Doppelte Zustandsbeute '+base+'/'+i.id);
}
for(const p of own.travel){check(allMaps.has(p.map),'Reisekarte '+p.map);check(!!allMaps.get(p.map)?.spawns[p.spawn],'Reisespawn '+p.map);}
for(const [qid,q] of Object.entries(own.quests))for(const s of q.steps){const m=maps.get(s.target.map);check(!!m&&[...m.npcs,...m.interactables].some(o=>o.id===s.target.id),'Questziel '+qid+'/'+s.target.id);}

for(const [zid,z] of Object.entries(own.zones)){
 const m=maps.get(zid);check(!!m,'Zonenkarte '+zid);
 check(z.tier===(zid.includes('wurzelkammer')?6:5),'Zonentier '+zid);
 check(z.lose_to.map==='bh_buegelraum','Sicheres Niederlagenziel '+zid);
 check(m.roamers.length===(zid.endsWith('__warm')?3:2),'Kalt/warm-Gegnerzahl '+zid);
 check(Object.keys(z.encounters).length===0,'Keine Kopie von BH-Werten in zones.json');
 for(const r of m.roamers){const e=stock.vorrat_gegner.encounters[r.encounter];check(!!e?.roam&&!!e?.elite,'BH roam/elite fehlt '+r.encounter);}
 for(const it of m.interactables.filter(i=>i.kind==='loot'))check(!!z.loot_tables[it.table],'Zonenbeutetabelle '+it.table);
 if(zid.includes('wurzelkammer'))check(z.travel.requires_flags.includes('bha_akt4_done'),'Wurzelkammer vor Akt IV');
}
const phase=stock.vorrat_gegner.phasen.vg_bh_boss_mutterwurzel_phase2, swarm=own.bosses.bha_aussaat_schwarm;
for(const k of ['hp','armor'])check(swarm[k]===Math.round(phase[k]*.7),'Schwarm 0,7 '+k);
check(swarm.attacks.every((a,i)=>a.damage===Math.round(phase.attacks[i].damage*.7)&&JSON.stringify(a.hits)===JSON.stringify(phase.attacks[i].hits)),'Schwarm Schaden/Timing');
check(!swarm.sheet,'Kein neuer Grafikplatzhalter in Spieldaten');
for(const short of ['glasgaertner','atemkessel','bluetenmund']){
 const d=own.dialogues['bho_'+short+'_ersatz'];const cs=d.nodes[d.start].choices.filter(c=>c.requires_pathway);
 check(cs.length===10,'Zehn eigene Pfadquellen '+short);
 for(const c of cs){check(c.requires_flags.includes('bho_'+short+'_geloest'),'Vollständiger Bossabschluss nötig '+short);check(c.hide_if_items?.length===1&&c.hide_if_flags?.includes('bho_'+short+'_zutat_entnommen'),'Doppelte Ersatzzutat '+short);}
}

// Even if every glass shortcut is blocked, each state has an exterior route
// back to the independent shelter. Evaluate the real route-dialog branches.
function visible(o,flags){return (o.requires_flags??[]).every(f=>flags.has(f))&&!(o.hide_if_flags??[]).some(f=>flags.has(f));}
let routeStates=0;
for(const a of [null,...banks[0]])for(const b of [null,...banks[1]])for(const c of [null,...banks[2]]){
 const flags=new Set(['k5_arrived','bha_akt1_done','bha_akt2_done','bha_akt3_done','bha_akt4_done',...circles.map(k=>'bha_ventil_'+k+'_leer'),...[a,b,c].filter(Boolean).map(k=>'bha_ventil_'+k+'_offen')]);
 const edges=new Map();
 for(const m of own.maps){
  const dest=[];
  for(const i of m.interactables){
   if(!visible(i.visible_if??{},flags))continue;
   if(i.kind==='door')dest.push(i.to);
   if(i.kind==='dialogue'&&i.dialogue.startsWith('bho_reise_')){
    const d=own.dialogues[i.dialogue],starts=d.start.filter(x=>visible(x,flags));
    check(starts.length===1,'Reisezustand nicht eindeutig '+i.dialogue);
    if(starts.length){const first=d.nodes[starts[0].node];for(const ch of first.choices){const travel=d.nodes[ch.next]?.travel;if(travel)dest.push(travel.map);}}
   }
  }
  edges.set(m.id,dest);
 }
 for(const m of own.maps){
  const reached=new Set([m.id]),queue=[m.id];for(let q=0;q<queue.length;q++)for(const target of edges.get(queue[q])??[])if(!reached.has(target)){reached.add(target);queue.push(target);}
  check(reached.has('bh_buegelraum__warm'),'Kein Rückweg bei gesperrten Glasgängen '+m.id);
 }
 routeStates++;
}
for(const [id,d] of Object.entries(own.dialogues).filter(([id])=>id.endsWith('_ablauf'))){
 const entry=d.nodes[d.start];
 for(const ch of entry.choices.filter(ch=>ch.text.startsWith('Abschnitt '))){
  check(ch.requires_flags.some(f=>f.endsWith('_offen')),'Kalter Bosskampf '+id);
  check(!visible(ch,new Set()),'Bosskampf ohne Freigabe '+id);
 }
 const solved=d.nodes[id+'_fertig'];
 check(entry.choices.filter(ch=>ch.next===id+'_fertig').every(ch=>ch.requires_flags.every(f=>!f.startsWith('won_'))),'Basis-Sieg als Gesamtabschluss '+id);
 check(solved?.sets_flags?.length===1,'Abschluss setzt fremde Flags '+id);
}

let heatTransitions=0;
if(cg){
 check(cg.ventile?.length===12,'CG hat nicht zwölf Ventile');
 const cgSet=new Set();walk(cg,o=>{for(const f of o.sets_flags??[])cgSet.add(f);});
 for(const f of cgFlags)check(cgSet.has(f),'CG-Vertrag ohne Setter '+f);
 for(const v of cg.ventile){
  const m=maps.get(v.karte);check(!!m?.interactables.find(i=>i.id===v.id&&i.kind==='read'),'CG-Ventilposition fehlt '+v.id);
 }
 // 125 valid bank configurations; test every open/close/return transition.
 const options=banks.map(bank=>[null,...bank]);
 for(const a of options[0])for(const b of options[1])for(const c of options[2]){
  const before=new Set([a,b,c].filter(Boolean).map(x=>'bha_ventil_'+x+'_offen'));
  for(const circle of circles)for(const action of ['warm','kalt','behaelter','klinik','leer']){
   const did='bha_ventil_'+circle,node=cg.dialogues[did]?.nodes[did+'_'+action];check(!!node,'CG-Aktion fehlt '+did+'/'+action);if(!node)continue;
   const after=new Set(before);for(const f of node.clears_flags??[])after.delete(f);for(const f of node.sets_flags??[])after.add(f);
   for(const bank of banks)check(bank.filter(k=>after.has('bha_ventil_'+k+'_offen')).length<=1,'CG Banklimit '+did+'/'+action);
   check(circles.filter(k=>after.has('bha_ventil_'+k+'_offen')).length<=3,'CG Dreierlimit');
   if(['behaelter','klinik','leer'].includes(action))check(circles.every(k=>before.has('bha_ventil_'+k+'_offen')===after.has('bha_ventil_'+k+'_offen')),'Rücklauf verändert Wärme');
   heatTransitions++;
  }
 }
 // CG reserves investigation positions in rows 3/4. Check geometry without
 // copying its story objects into CH or pretending to merge all placements.
 for(const p of cg.platzierung??[])if(maps.has(p.map))check(walkable(maps.get(p.map),p.tile),'CG-Platz liegt in Wand '+p.map+'/'+p.tile);
}

if(errors.length){console.error(errors.join('\n'));console.error(`FEHLER: ${errors.length}`);process.exitCode=1;}
else{
 console.log(`OK: ${Object.keys(own).length} JSON-Dateien; 36 Karten / 18 identische Zustandspaare.`);
 console.log(`OK: ${reads} Lesestellen über beide Zustände; ${exits} Tür-Ausgänge; alle Spawns und Objekte erreichbar.`);
 console.log(`OK: ${Object.keys(own.dialogues).length} Dialoge, 1 Quest, 11 Items, 6 Zonen; IDs, next-Ziele und Referenzen geprüft.`);
 console.log(`OK: ${routeStates} Netzbelegungen: Rückwege aus allen 36 Karten auch ohne Glasgänge offen.`);
 console.log('OK: 30 pfadgefilterte Ersatzzutaten; endgültige Bossabschlüsse; Schwarm 0,7; keine fremden Flag-Setter.');
 if(cg)console.log(`OK: CG-Quellen geladen; ${heatTransitions} Wärme-/Rücklaufübergänge halten die Drei-Kreise-Grenze.`);
 if(pending.size)console.log(`OFFEN: ${pending.size} explizite CG-Verträge, nicht als lokale Quellen gewertet. Vollprüfung mit --cg-dir <k5_akte>.\n`+[...pending].sort().join('\n'));
 console.log('EINBAU OFFEN: BH-Zonenbindung, CG-Endphasenprüfung, Variantenwechsel ohne Neuladen und CD-Landstraßenanschluss.');
}
