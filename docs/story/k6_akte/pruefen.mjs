#!/usr/bin/env node
import {readFileSync,readdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {loadContent} from '../../../tests/helpers.js';
import {GameState} from '../../../src/core/GameState.js';
import {applyQuestPack} from '../../../src/data/questPacks.js';
const dir=dirname(fileURLToPath(import.meta.url)),root=resolve(dir,'../../..');
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const data=Object.fromEntries(readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),read(resolve(dir,f))]));
const {case:C,dialogues:D,platzierung:P,encounters:E}=data;
const check=(v,m)=>assert.ok(v,m);
function walk(v,fn){if(Array.isArray(v)){for(const e of v)walk(e,fn);}else if(v&&typeof v==='object'){fn(v);for(const e of Object.values(v))walk(e,fn);}}
const unique=(xs,label)=>check(xs.length===new Set(xs).size,'Doppelte IDs: '+label);
const maps=['vm_zollhafen','vm_stegviertel','vm_schlickgassen','vm_oberstrasse','vm_wrackfeld','vm_leuchtbank','vm_registerkeller','vm_grenzzaun'];
const npcs=['vmn_tam_verrin','vmn_nell_quarrie','vmn_osric_dale','vmn_pegelherrin','vmn_zollschreiber',...Array.from({length:7},(_,i)=>'vmn_rat_'+(i+1))];
const bosses=['wrackmutter','leuchtfeuerwaechter','pegelherrin','pegelherrin_register'];
const externalFlags=new Set(['kapitel5_done','bha_end_wahl','bha_end_winter','bha_end_verwahrt','bha_end_schmerzlos','koop_aktiv','gezeit_ebbe','gezeit_flut',...bosses.map(x=>'won_'+x)]);
const produced=new Set();walk(data,o=>{for(const f of o.sets_flags??[])produced.add(f);if(o.done_flag)produced.add(o.done_flag);});
walk(data,o=>{
 if(o.id)check(/^[a-z0-9_]+$/.test(o.id),'Ungültige ID '+o.id);
 for(const [k,v] of Object.entries(o))if(typeof v==='string')check(v.trim().length>0,'Leerer Text '+k);
 for(const f of [...o.requires_flags??[],...o.hide_if_flags??[]])check(produced.has(f)||externalFlags.has(f),'Flag ohne Quelle '+f);
 for(const f of [...o.sets_flags??[],...o.clears_flags??[]])check(f.startsWith('k6_'),'Fremdes Flag geschrieben '+f);
 for(const id of o.gives_clues??[])check(!!C.clues[id],'Unbekannter Hinweis '+id);
 for(const id of o.requires_clues??[])check(!!C.clues[id],'Unbekannte Hinweisbedingung '+id);
 for(const id of o.requires_conclusions??[])check(C.deductions.some(d=>d.id===id),'Unbekannter Schluss '+id);
 if(o.map)check(maps.includes(o.map)||o.map==='bh_buegelraum','Fremde Karte '+o.map);
 if(o.fundort)check(maps.includes(o.fundort),'Fremder Fundort '+o.fundort);
 if(o.npc)check(npcs.includes(o.npc),'Fremder NPC '+o.npc);
 if(o.sprecher)check(npcs.includes(o.sprecher),'Fremder Sprecher '+o.sprecher);
 if(o.encounter)check(bosses.includes(o.encounter),'Fremder Kampf '+o.encounter);
 if(o.dialogue)check(!!D[o.dialogue],'Dialog fehlt '+o.dialogue);
 if(o.ending)check(!!C.endings[o.ending],'Ende fehlt '+o.ending);
 for(const id of [...o.start_quests??[],...o.complete_quests??[]])check(!!data.quests[id],'Quest fehlt '+id);
});
for(const [id,d] of Object.entries(D)){
 check(id.startsWith('k6_'),'Dialogpräfix');
 const starts=typeof d.start==='string'?[d.start]:d.start.map(x=>x.node);
 for(const s of starts)check(!!d.nodes[s],'Start fehlt '+s);
 for(const [nid,n] of Object.entries(d.nodes)){
  check(nid.startsWith('k6_'),'Knotenpräfix '+nid);
  for(const c of n.choices??[])if(c.next)check(!!d.nodes[c.next],'next fehlt '+id+'/'+c.next);
 }
 // Structural graph reachability, independent of gameplay conditions.
 const found=new Set(starts),queue=[...starts];for(let i=0;i<queue.length;i++)for(const c of d.nodes[queue[i]].choices??[])if(c.next&&!found.has(c.next)){found.add(c.next);queue.push(c.next);}
 check(found.size===Object.keys(d.nodes).length,'Verwaiste Knoten '+id);
}
unique(Object.values(D).flatMap(d=>Object.keys(d.nodes)),'Dialogknoten');
unique(P.filter(p=>p.interactable).map(p=>p.interactable.id),'Objekte');
for(const f of ['zeitung','szenen','epiloge','koop_epiloge','anreise'])unique(data[f].map(x=>x.id),f);
check(C.akte.length===5,'Fünf Akte');check(C.deductions.length===20,'Zwanzig Deduktionen');
for(let a=1;a<=5;a++){
 const act=C.akte[a-1];check(act.id===`k6_akt${a}`&&act.faehrten.length===4,'Akt/Fährtenzahl');check(act.fuehrende_frage&&act.abschluss_text,'Akttexte');
 for(const t of act.faehrten){check(t.hinweise.length>=2&&t.hinweise.length<=3,'Hinweiszahl');for(const h of t.hinweise){check(!!C.clues[h.id],'Hinweis fehlt');check(P.some(p=>p.interactable?.effects?.gives_clues?.includes(h.id))||Object.values(D).some(d=>Object.values(d.nodes).some(n=>n.gives_clues?.includes(h.id))),'Hinweis nicht erhältlich '+h.id);}}
}
for(const d of C.deductions)for(const pair of d.pairs)for(const f of pair)check(!!C.facts[f],'Paar ohne Fakt');
for(let i=1;i<=7;i++){
 const d=D['k6_rat_'+i];check(!!d,'Rat fehlt');check(d.nodes[`k6_rat_${i}_start`].choices.filter(c=>c.next).length===3,'Drei Fragen');check(Object.values(d.nodes).filter(n=>n.luege===true).length===1,'Eine Lüge pro Rat');
}
check(data.anreise.length===5,'Anreisen');for(const a of data.anreise)check(a.zeilen.length>=8&&a.zeilen.length<=12,'Anreisezeilen');
check(data.szenen.length===12,'Szenenanzahl');for(const s of data.szenen)check(s.zeilen.length>=6&&s.zeilen.length<=10,'Szenenzeilen');
check(data.epiloge.length===40,'Epilogkarten');for(const e of Object.keys(C.endings)){check(data.epiloge.filter(x=>x.ending===e).length===10,'Zehn Karten '+e);check(data.abspann.find(x=>x.ending===e)?.abspann_zeilen.length===20,'20 Abspannzeilen '+e);check(data.zeitung.filter(x=>x.requires_flags.includes(e)).length===4,'Vier Endmeldungen');}
for(const e of [...data.epiloge,...data.koop_epiloge]){const sentences=e.text.match(/[.!?](?:\s|$)/g)??[];check(sentences.length>=2&&sentences.length<=4,'2–4 Sätze '+e.id);}
check(data.zeitung.length===36,'20 Akt- und 16 Endmeldungen');
for(const p of P){check(['ebbe','flut','beide'].includes(p.gezeit),'Gezeit fehlt');if(p.gezeit!=='beide')check(p.visible_if.requires_flags.includes('gezeit_'+p.gezeit),'Gezeit nicht als Bedingung');}
for(const [qid,q] of Object.entries(data.quests))for(const s of q.steps)check(P.some(p=>p.map===s.target.map&&(p.interactable?.id===s.target.id||p.npc===s.target.id)),'Questziel fehlt '+qid);
check(Object.keys(E).sort().join()===bosses.sort().join(),'Bossreferenzen');walk(E,o=>{for(const k of ['hp','armor','damage','attacks'])check(!(k in o),'CT dupliziert Kampfwerte');});

// Use real GameState conditions, clues, deductions and effects. CU geometry,
// CZ combat and UI transitions are explicitly outside these narrative tests.
const content=loadContent();
// Minimal, test-only speaker identities: changeRelation ignores absent CX NPCs.
// No names, appearance, dialogue or production definitions are invented.
for(const id of npcs)content.npcs[id]??={name:id};
applyQuestPack(content,{name:'ct_test',case:C,faelle:data.faelle,quests:data.quests,dialogues:D});
const effect=(s,n,key)=>{const {encounter,travel,...e}=n;s.applyEffects(e,{nodeKey:key});};
const apply=(s,d,n)=>effect(s,D[d].nodes[n],d+'/'+n);
const flags=s=>[...s.flags].sort().join();
let runs=0;
for(const arrival of ['wahl','winter','verwahrt','schmerzlos'])for(const rat of [1,4])for(const peaceful of [false,true])for(const route of ['solo_schliessen','solo_verbrennen','solo_uebergeben','koop_p1','koop_p2','koop_verbrennen','koop_uebergeben','koop_teilen']){
 const s=new GameState(content);s.flags.add('kapitel5_done');s.flags.add('bha_end_'+arrival);s.flags.add('gezeit_ebbe');const coop=route.startsWith('koop');if(coop)s.flags.add('koop_aktiv');
 const arrivalId='k6_anreise_'+arrival;check(s.meets(D[arrivalId].nodes[arrivalId+'_start'].choices[0]),'Anreise gesperrt');apply(s,arrivalId,arrivalId+'_ankunft');if(coop)apply(s,'k6_anreise_koop','k6_anreise_koop_ankunft');
 const visited=new Set();
 function advance(){
  let changed=true,iterations=0;
  while(changed&&iterations++<40){changed=false;
   for(const p of P){if(!p.interactable||!s.meets(p.visible_if))continue;const ob=p.interactable;
    if(ob.kind==='read'&&!visited.has(ob.id)){visited.add(ob.id);effect(s,ob.effects??{},ob.id);if(ob.done_flag)s.flags.add(ob.done_flag);changed=true;}
    if(ob.kind!=='dialogue')continue;
    const id=ob.dialogue;if(id.startsWith('k6_anreise_')||['k6_ende','k6_traeger','k6_vertrauen','k6_harrow'].includes(id))continue;
    const d=D[id],start=s.pick(d.start);if(!start)continue;const queue=[start],seen=new Set();
    for(let q=0;q<queue.length;q++){
     const nid=queue[q];if(seen.has(nid))continue;seen.add(nid);const n=d.nodes[nid];
     if(nid==='k6_nell_nein')continue;
     if(n.encounter){if(!visited.has(nid)){
       check(s.meets(E[n.encounter]),'Unvorbereiteter Kampf '+n.encounter);
       // Simulate only successful CZ result, never infer it from starting combat.
       s.flags.add('won_'+n.encounter);visited.add(nid);changed=true;
      }continue;}
     if(!visited.has(nid)){effect(s,n,id+'/'+nid);visited.add(nid);changed=true;}
     for(const c of n.choices??[])if(c.next&&s.meets(c))queue.push(c.next);
    }
   }
   for(const d of C.deductions)if(!s.hasConclusion(d.id)){const [a,b]=d.pairs[0];if(s.factStatus(a)!=='unknown'&&s.factStatus(b)!=='unknown'){check(s.combine(a,b).result==='new','Deduktion nicht bildbar');changed=true;}}
   const choice=D.k6_vertrauen.nodes.k6_vertrauen_start.choices.find(c=>c.next===`k6_vertrauen_${rat}`);if(!s.flags.has('k6_vertrauen_gewaehlt')&&s.meets(choice)){apply(s,'k6_vertrauen',choice.next);changed=true;}
  }
  check(iterations<40,'Progressionsschleife');
 }
 advance();check(s.flags.has('k6_akt4_done'),'Akt IV nicht erreichbar '+route);check(!s.flags.has('k6_akt5_done'),'Vorzeitiges Finale');
 // A tide change hides low-ground sources but must not revoke evidence.
 const before=s.clues.length;s.flags.delete('gezeit_ebbe');s.flags.add('gezeit_flut');for(const p of P.filter(p=>p.gezeit==='ebbe'))check(!s.meets(p.visible_if),'Ebbequelle bei Flut sichtbar');check(s.clues.length===before,'Belege bei Flut verloren');s.flags.delete('gezeit_flut');s.flags.add('gezeit_ebbe');
 const first=D.k6_harrow.nodes.k6_harrow_vor.choices.find(c=>c.next==='k6_harrow_phase1');check(s.meets(first),'Phase 1 gesperrt');s.flags.add('won_pegelherrin');check(!s.flags.has('k6_pegelherrin_geloest'),'Phase 1 bereits Gesamtsieg');
 const mid=D.k6_harrow.nodes.k6_harrow_zwischen.choices[0];check(s.relation('vmn_osric_dale')>=3,'Osrics Beziehung nicht aus Dialogen erreichbar');s.relations.vmn_osric_dale=2;check(!s.meets(mid),'Friedlich unter Beziehung +3');s.relations.vmn_osric_dale=3;check(s.meets(mid),'Friedlich trotz vier Fährten nicht erreichbar');
 if(peaceful)apply(s,'k6_harrow','k6_harrow_vorlesen');else{s.flags.add('won_pegelherrin_register');apply(s,'k6_harrow','k6_harrow_sieg');}
 advance();check(s.flags.has('k6_akt5_done'),'Akt V nicht erreichbar');
 const end=route.includes('p1')||route.includes('p2')?'schliessen':route.split('_')[1];
 if(end==='schliessen')apply(s,'k6_traeger',route==='koop_p2'?'k6_traeger_p2':'k6_traeger_p1');
 const id='k6_ende_'+end;const choice=D.k6_ende.nodes.k6_ende_start.choices.find(c=>c.next===id+'_vorschau');check(s.meets(choice),'Ende gesperrt '+route);
 const old=flags(s);apply(s,'k6_ende',id+'_vorschau');check(flags(s)===old,'Vorschau verändert Flags');check(!s.flags.has('k6_done'),'Vorschau setzt Ende');
 apply(s,'k6_ende',id+'_setzen');check(s.flags.has('k6_done')&&s.flags.has(id),'Ende setzt Flags nicht');check(Object.keys(C.endings).filter(f=>s.flags.has(f)).length===1,'Mehrere Enden');for(const c of D.k6_ende.nodes.k6_ende_start.choices.filter(c=>c.next))check(!s.meets(c),'Zweites Ende wählbar');
 check(data.epiloge.filter(x=>s.meets(x)).length===10,'Epilogfilter');if(!coop)check(data.koop_epiloge.every(x=>!s.meets(x)),'Koop-Epilog solo');
 runs++;
}
let words=0;walk(data,o=>{for(const [key,v] of Object.entries(o))if(['text','zeilen','abspann_zeilen','fuehrende_frage','abschluss_text'].includes(key)){for(const t of Array.isArray(v)?v:[v])if(typeof t==='string')words+=(t.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)??[]).length;}});
console.log(`OK: ${Object.keys(data).length} JSON-Dateien; 5 Akte, 20 Fährten, 60 Hinweise, 20 Deduktionen.`);
console.log(`OK: ${Object.keys(D).length} Dialoge, ${Object.values(D).reduce((n,d)=>n+Object.keys(d.nodes).length,0)} Knoten; 7 Verhöre mit je 3 Fragen und 1 Lüge.`);
console.log('OK: 5 Anreisen, 12 Szenen, 40 Epilogkarten, 4 Koop-Karten, 80 Abspannzeilen, 36 Meldungen.');
console.log(`OK: ${runs} vollständige Datenabläufe mit echtem GameState; beide Ratszeugen, beide Bosswege und alle Solo-/Koop-Enden.`);
console.log('OK: Gezeitenfilter, eindeutige Enden, Abbruch der Endvorschau, Phasengrenzen und Osric-Beziehungsschwelle.');
console.log(`Wortzahl: ${words} Textwörter in JSON (inklusive wiederholter UI-/Quelltexte; keine geschätzte Spielzeit).`);
console.log('EXTERN: 12 minimale CX-Sprecherhüllen nur im Test; CU-Geometrie, CX-Profile, CZ-Kämpfe und DD-Rituale nicht integriert.');
