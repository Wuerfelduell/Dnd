import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {loadContent} from '../../../tests/helpers.js';
import {applyQuestPack} from '../../../src/data/questPacks.js';
import {GameState} from '../../../src/core/GameState.js';
const here=new URL('./',import.meta.url),root=new URL('../../../',here);
const read=(p)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const own=Object.fromEntries(readdirSync(here).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),JSON.parse(readFileSync(new URL(f,here),'utf8'))]));
const check=(ok,msg)=>assert.ok(ok,msg);
function walk(x,fn,p=''){if(!x||typeof x!=='object')return;if(!Array.isArray(x))fn(x,p);for(const[k,v]of Object.entries(x))walk(v,fn,`${p}/${k}`);}
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(new URL(e.name+'/',dir)):e.name.endsWith('.json')?[new URL(e.name,dir)]:[]);}
const content=loadContent();
const bj=read('docs/story/vorrat_figuren/npcs.json');
const bjd=read('docs/story/vorrat_figuren/dialogues.json');
const bl=read('docs/story/vorrat_items/items.json');
const bh=read('docs/story/vorrat_gegner/encounters.json');
const base=structuredClone(content);
applyQuestPack(base,{name:'cf_vorrat_test',npcs:bj,dialogues:bjd,items:bl,encounters:bh});
applyQuestPack(base,{name:'cf_test',...own,platzierung:[]});
const pending=new Set(),producers=new Set();
for(const u of [...files(new URL('src/data/',root)),...files(new URL('docs/story/vorrat_figuren/',root)),...files(new URL('docs/story/vorrat_gegner/',root)),...files(new URL('docs/story/vorrat_items/',root))])walk(JSON.parse(readFileSync(u,'utf8')),o=>{for(const f of o.sets_flags??[])producers.add(f);if(o.done_flag)producers.add(o.done_flag);});
walk(own,o=>{for(const f of o.sets_flags??[]){check(f.startsWith('cwn_'),'Fremdes Flag gesetzt: '+f);producers.add(f);}if(o.done_flag){check(o.done_flag.startsWith('cwn_'),'Fremdes Leseflag');producers.add(o.done_flag);}});
const runtime=new Set(['koop_aktiv','k3h_nacht','saison_herbst','saison_winter','saison_fruehling','saison_sommer']);
const externalFlags=new Set(['k4_arrived','kapitel4_done','cwa_akt1_done','cwa_akt2_done','cwa_akt3_done','cwa_akt4_done']);
const spec=readFileSync(new URL('docs/art/codex_CF_k4_nebenquests.md',root),'utf8');
const contracts=new Set([...spec.matchAll(/^\| `(cw_[a-z_]+|reise_landstrasse)` \|/gm)].map(m=>m[1]));
check(contracts.size===18,'Kartenvertrag geändert, Abgleich nötig');
function map(id){if(content.maps[id])return;if(contracts.has(id)){pending.add('Karte '+id+' (CD)');return;}throw Error('Unbekannte Karte '+id);}
for(const [section,dict] of Object.entries(own)){if(['quests','dialogues','npcs','items','encounters'].includes(section))for(const id of Object.keys(dict))check(id.startsWith('cwn_'),'Fremde Definition '+id);}
for(const section of ['facts','clues'])for(const id of Object.keys(own.case[section]))check(id.startsWith('cwn_'),'Fremde Fall-ID');
for(const [did,d]of Object.entries(own.dialog_zusaetze)){check(base.dialogues[did],'Unbekannter Zusatz '+did);for(const nid of Object.keys(d.nodes_add))check(nid.startsWith('cwn_'),'Fremder Knoten');}
const ids=new Set();
walk(own,(o,p)=>{
 if(o.id&&!p.endsWith('/target')){check(o.id.startsWith('cwn_'),'Fremde ID '+o.id);check(!ids.has(o.id),'Doppelte ID '+o.id);ids.add(o.id);}
 if(o.map)map(o.map);
 for(const f of [...o.requires_flags??[],...o.hide_if_flags??[]]){if(producers.has(f)||runtime.has(f)||f.startsWith('won_'))continue;if(externalFlags.has(f)){pending.add('Flag '+f+' (CC)');continue;}throw Error('Flag ohne Quelle '+f+' in '+p);}
 for(const k of ['gives_items','takes_items'])for(const id of Object.keys(o[k]??{}))check(base.items[id],'Unbekanntes Item '+id);
 for(const k of ['requires_items','hide_if_items'])for(const id of o[k]??[])check(base.items[id],'Unbekanntes Item '+id);
 for(const k of ['start_quests','complete_quests','requires_quests_active','requires_quests_done','hide_if_quests'])for(const id of o[k]??[])check(base.quests[id],'Unbekannte Quest '+id);
 for(const id of o.gives_clues??[])check(base.clues[id],'Unbekannter Hinweis '+id);
 if(o.npc)check(base.npcs[o.npc],'Unbekannte Figur '+o.npc);
 if(o.dialogue)check(base.dialogues[o.dialogue],'Unbekannter Dialog '+o.dialogue);
 if(o.combat)check(base.encounters[o.combat],'Unbekannter Kampf '+o.combat);
 for(const id of Object.keys(o.relation??{}))check(base.npcs[id],'Unbekannte Beziehung '+id);
 for(const k of ['title','summary','prompt','footer','label'])if(typeof o[k]==='string')check([...o[k]].length<=140,`${p}/${k}: ${o[k].length} Zeichen`);
 if(o.choices)for(const c of o.choices)check(c.text.length<=140,'Choice zu lang '+p);
 if(o.kind==='read')check(o.text.split(/\s+/).length<=120,'Lesetext zu lang '+p);
});
for(const m of Object.keys(own.leben))map(m);
for(const m of Object.keys(own.gerede.calderwick))map(m);
for(const [did,d]of Object.entries(own.dialogues))for(const id of Object.keys(d.nodes))check(id.startsWith('cwn_'),'Fremder eigener Knoten '+id);
for(const [did,d]of Object.entries(base.dialogues)){
 if(!own.dialogues[did]&&!own.dialog_zusaetze[did])continue;
 const validate=(spec)=>{if(typeof spec==='string')check(d.nodes[spec],`Ungültiges next ${did}/${spec}`);else if(Array.isArray(spec))for(const n of spec)validate(n.node);};
 validate(d.start);for(const [nid,n]of Object.entries(d.nodes))for(const c of n.choices??[])if(c.next)validate(c.next);
}
const targets=new Set([...Object.keys(base.npcs),...own.platzierung.map(p=>p.interactable?.id).filter(Boolean),...own.lesestuecke.map(p=>p.interactable.id)]);
assert.equal(Object.keys(own.quests).length,12);assert.equal(own.einwohner.length,8);assert.equal(Object.keys(own.npcs).length,9);
assert.equal(own.lesestuecke.length,25);assert.equal(own.zeitung.length,8);assert.equal(Object.values(own.gerede.calderwick).flat().length,60);
assert.equal(own.geplauder.filter(g=>g.id.startsWith('cwn_geplauder_')).flatMap(g=>g.zeilen).length,24);
assert.equal(own.geplauder.filter(g=>g.id.endsWith('_geplauder')).length,4);
for(const e of own.einwohner){assert.equal(Object.keys(own.dialogues[e.id].nodes).length,6);for(const s of Object.values(e.zeit))map(s.map);check(!own.platzierung.some(p=>p.npc===e.id),'Einwohner doppelt platziert');}
for(const q of Object.values(own.quests)){check(q.steps.length>=3&&q.steps.length<=6,'Schrittzahl');for(const s of q.steps){map(s.target.map);check(targets.has(s.target.id),'Unbekanntes Ziel '+s.target.id);}check(q.reward,'Belohnung fehlt');}
assert.equal(Object.values(own.quests).filter(q=>q.summary.includes('bj_keim_cw_')).length,8);
const tiles=new Set();for(const p of [...own.platzierung,...own.lesestuecke,...own.einwohner.flatMap(e=>Object.values(e.zeit))]){const k=p.map+':'+p.tile.join(',');check(!tiles.has(k),'Doppelte vorgeschlagene Position '+k);tiles.add(k);check(p.tile[0]>=1&&p.tile[0]<15&&p.tile[1]>=1&&p.tile[1]<9,'Position außerhalb Mindest-Innenraum '+k);}
// Engine-level execution validates real effects, both outcomes, gated evidence and one-time rewards.
const make=()=>{const g=new GameState(base);g.money=1000;return g;};
let paths=0;
for(const [qid,q]of Object.entries(own.quests)){
 const [did,ex]=Object.entries(own.dialog_zusaetze).find(([,ex])=>ex.nodes_add[qid+'_annehmen']);
 const ns=ex.nodes_add,offer=ex.choices_add.find(c=>c.next===qid+'_angebot');
 const outcomes=ns[qid+'_abgleich'].choices.filter(c=>ns[c.next]?.complete_quests?.includes(qid));assert.equal(outcomes.length,2);
 for(const choice of outcomes){
  const g=make();check(!g.meets(offer),'Quest ohne Aktstart sichtbar');for(const f of offer.requires_flags)g.flags.add(f);check(g.meets(offer),'Quest nicht startbar');
  g.applyEffects(ns[qid+'_annehmen']);check(!g.meets(offer),'Quest erneut startbar');check(!g.meets(choice),'Abschluss ohne Belege');
  for(const step of q.steps.slice(0,-1)){
   const flag=step.done.requires_flags[0];let effect;
   if(own.npcs[step.target.id]){
    const d=own.dialogues[step.target.id];const c=d.nodes.cwn_start.choices.find(c=>c.next==='cwn_zeugnis');
    check(g.meets(c),'Bewohnerzeugnis gesperrt '+flag);effect=d.nodes.cwn_zeugnis;
   }else{
    const p=own.platzierung.find(p=>p.interactable?.id===step.target.id);check(p,'Quelle fehlt '+flag);
    const v=p.visible_if??p.interactable.visible_if;
    if(v.requires_flags?.includes('k3h_nacht')){check(!g.meets(v),'Nachtspur tagsüber sichtbar');g.flags.add('k3h_nacht');}
    check(g.meets(v),'Quelle trotz Auftrag gesperrt '+flag);
    if(p.interactable.kind==='dialogue'){g.flags.add('k3a_end_feierabend');const d=own.dialogues[p.interactable.dialogue];effect=d.nodes[g.pick(d.start)];}
    else effect=p.interactable.effects;
   }
   check(effect?.sets_flags?.includes(flag),'Hinweis ohne erreichbare Quelle '+flag);g.applyEffects(effect);
  }
  check(g.meets(choice),'Abschluss nach Belegen gesperrt');const money=g.money;g.applyEffects(ns[choice.next]);assert.equal(g.quests[qid],'done');check(q.steps.every(s=>g.meets(s.done)),'Schritte unvollständig');check(g.money>=money+60,'Grundbelohnung fehlt');
  check(outcomes.every(c=>!g.meets(c)),'Auszahlung erneut erreichbar');const after=g.money;g.finishQuest(qid,'done');assert.equal(g.money,after,'Doppelte Questbelohnung');
  if(choice.next==='cwn_warnbrief_vertrauen')assert.equal(g.relation('cw_crayford'),2);
  if(choice.next==='cwn_letzte_terrasse_liste')check(g.flags.has('cwn_kuechenliste'),'Küchenbonus fehlt');
  if(choice.next==='cwn_seilbahn_abkuerzung')check(g.flags.has('cwn_abkuerzung'),'Abkürzung fehlt');paths++;
 }
}
const pkg=own.dialogues.cwn_brief_aus_dunscar_spur1;
for(const end of ['feierabend','stilllegung','gegenstimme','vollzaehlig']){const g=make();g.flags.add('k3a_end_'+end);const n=g.pick(pkg.start);check(n.endsWith(end),'Paketvariante '+end);g.applyEffects(pkg.nodes[n]);check(g.pick(pkg.start).endsWith('_gelesen'),'Paket mehrfach abholbar');}
const market=own.dialogues.cwn_saisonmarkt;
for(const season of ['herbst','winter','fruehling','sommer'])for(const discount of [false,true]){const g=make();g.flags.add('saison_'+season);if(discount)g.flags.add('cwn_falscher_pfand_sammel');const available=market.nodes[market.start].choices.filter(c=>c.next&&g.meets(c));assert.equal(available.length,1);check(available[0].next.endsWith(discount?'nachlass':'preis'),'Falscher Preis');g.applyEffects(market.nodes[available[0].next]);check(!g.meets(available[0]),'Saisonstück erneut kaufbar');}
for(const [did,ex]of Object.entries(own.dialog_zusaetze))for(const n of Object.values(ex.nodes_add))for(const c of n.choices??[])if(c.next?.endsWith('_zeuge')){const g=make();check(!g.meets(c),'Koop im Solo');g.flags.add('koop_aktiv');check(g.meets(c),'Koop gesperrt');g.applyEffects(ex.nodes_add[c.next]);check(!g.meets(c),'Koop mehrfach');}
console.log(`CF lokal OK: 14 JSON, 12 Quests, ${paths} Entscheidungspfade, 8 Einwohner, 60 Gerede, 25 Lesestücke, 8 Meldungen, 24 Ambient-Zeilen + 4 Koop-Zweige.`);
console.log('Engine-Prüfung OK: Dialogzusätze, 4 Dunscar-Pakete, 8 Saisonkäufe, Belohnungen und Wiederholungssperren.');
console.log(`Externe Integration offen: ${pending.size} Karten-/Flag-Verträge. Keine räumliche Spielbarkeitsbestätigung.`);
for(const p of [...pending].sort())console.log('  AUSSTEHEND: '+p);
if(process.argv.includes('--strict')&&pending.size){console.error('STRICT FEHLER: CC/CD sind noch nicht vollständig in loadContent() verfügbar.');process.exitCode=1;}
