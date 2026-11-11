import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { loadContent } from '../../../tests/helpers.js';
import { applyQuestPack } from '../../../src/data/questPacks.js';
import { GameState } from '../../../src/core/GameState.js';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../../..');
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const files=readdirSync(here).filter(f=>f.endsWith('.json'));
const data=Object.fromEntries(files.map(f=>[f.slice(0,-5),json(join(here,f))]));
const prefix=id=>assert(id.startsWith('cwa_'),`Fremde neue ID: ${id}`);
const walk=(x,fn)=>{if(Array.isArray(x)) x.forEach(v=>walk(v,fn));else if(x&&typeof x==='object'){fn(x);Object.values(x).forEach(v=>walk(v,fn));}};
const allJson=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?allJson(join(dir,d.name)):d.name.endsWith('.json')?[join(dir,d.name)]:[]);
const base=loadContent();
const sourceFiles=allJson(join(root,'src/data')).concat(['vorrat_gegner','vorrat_figuren','vorrat_items'].flatMap(p=>allJson(join(root,'docs/story',p))));
const suppliedFlags=new Set();
for(const path of [...sourceFiles,...files.map(f=>join(here,f))]) walk(json(path),o=>{for(const f of o.sets_flags??[]) suppliedFlags.add(f);if(o.done_flag)suppliedFlags.add(o.done_flag);});

// Assemble the unchanged inventory packs. No definitions are copied into CC.
const stock={};
for(const folder of ['vorrat_gegner','vorrat_figuren','vorrat_items']) {
 const load=name=>json(join(root,'docs/story',folder,name+'.json'));
 const pack={name:folder,...Object.fromEntries(['quests','items','npcs','dialogues','case','encounters','dialog_zusaetze','platzierung'].map(f=>[f,load(f)]))};
 if(folder==='vorrat_gegner') Object.assign(pack.encounters,load('bosses'),load('phasen'));
 if(folder==='vorrat_items') Object.assign(pack.dialogues,load('fundstuecke'));
 applyQuestPack(base,pack);stock[folder]=pack;
}
const pending=[];
// CD is a separate authorized package. Missing definitions are reported, never
// disguised as runtime content. Fixtures below exist only for the dry-run.
for(const id of data.schnittstellen.maps) if(!base.maps[id]) {
 const cd=join(root,'docs/story/k4_orte/maps.json');
 const actual=existsSync(cd)?json(cd).find(m=>m.id===id):undefined;
 if(actual) base.maps[id]=structuredClone(actual);
 else {pending.push(`Karte ${id} (CD)`);base.maps[id]={id,name:`PRÜFFIXTUR ${id}`,npcs:[],interactables:[],spawns:{default:[1,1],aufzug:[1,1]}};}
}
for(const id of data.schnittstellen.encounters) if(!base.encounters[id]) {
 const cd=join(root,'docs/story/k4_orte/encounters.json');const actual=existsSync(cd)?json(cd)[id]:undefined;
 if(actual)base.encounters[id]=actual;
 else {pending.push(`Kampfwerte ${id} (CD)`);base.encounters[id]={name:'PRÜFFIXTUR Registerrest',on_win:{},on_lose:{}};}
}
const own={name:'k4_akte',...data};
applyQuestPack(base,own);
base.epiloge=[...(base.epiloge??[]),...data.epiloge];
for(const [id,text] of Object.entries(data.boss_texte)) {assert(base.encounters[id],id);Object.assign(base.encounters[id],text);}

const counts={json:files.length,quests:Object.keys(data.quests).length,clues:Object.keys(data.case.clues).length,deductions:data.case.deductions.length,
 nodes:Object.values(data.dialogues).reduce((n,d)=>n+Object.keys(d.nodes).length,0)+Object.values(data.dialog_zusaetze).reduce((n,d)=>n+Object.keys(d.nodes_add).length,0)};
assert.equal(counts.quests,5);assert.equal(counts.clues,80);assert.equal(counts.deductions,20);assert(counts.nodes>=200&&counts.nodes<=320);
assert.equal(data.anker.length,22);assert.equal(data.abgleiche.length,6);assert.equal(Object.keys(data.case.endings).length,4);assert.equal(data.anreise.length,4);
assert.deepEqual(data.npcs,{});assert.deepEqual(data.encounters,{});
for(const [i,q] of Object.values(data.quests).entries()){assert.equal(q.kind,'main');assert.equal(q.steps.length,5);assert(q.reward);assert.equal(q.case,'cwa_kapitel4');assert.equal(q.reward.gives_money,i===0?25:0);}
for(const field of ['quests','items','dialogues'])Object.keys(data[field]).forEach(prefix);
for(const field of ['facts','clues','endings'])Object.keys(data.case[field]).forEach(prefix);
data.case.deductions.forEach(d=>prefix(d.id));data.anker.forEach(d=>prefix(d.id));
for(const [id,d] of Object.entries({...data.dialogues,...Object.fromEntries(Object.entries(data.dialog_zusaetze).map(([k,e])=>[k,{nodes:e.nodes_add}]))})) {
 const merged=base.dialogues[id];assert(merged,`Unbekannter Zusatzdialog ${id}`);
 for(const [key,n] of Object.entries(d.nodes)){prefix(key);assert(typeof n.text==='string'&&n.text.length);assert(!/[–—]/u.test(n.text),`Gedankenstrich ${id}/${key}`);
  for(const ch of n.choices??[]){assert(ch.text.length<=140,`Oberfläche >140: ${ch.text}`);if(ch.next)assert(merged.nodes[ch.next],`Offenes next: ${id}/${key} -> ${ch.next}`);}
 }
 walk(merged,o=>{if(o.node)assert(merged.nodes[o.node],`Offener Start ${id}/${o.node}`);if(o.next)assert(merged.nodes[o.next],`Offenes next ${id}/${o.next}`);});
}
const objects=new Set(data.platzierung.flatMap(p=>p.interactable?[p.interactable.id]:[]));
assert.equal(objects.size,data.platzierung.filter(p=>p.interactable).length);
for(const p of data.platzierung){assert(base.maps[p.map]);if(p.npc)assert(base.npcs[p.npc],p.npc);else prefix(p.interactable.id);assert(p.tile.length===2&&p.tile.every(Number.isInteger));}
const ownFlags=new Set(['k4_arrived','kapitel4_done']);
const checkRefs=o=>{
 for(const f of o.requires_flags??[])assert(suppliedFlags.has(f)||(f.startsWith('won_')&&base.encounters[f.slice(4)]),`Flag ohne Erzeuger: ${f}`);
 for(const f of [...(o.sets_flags??[]),...(o.clears_flags??[])])assert(f.startsWith('cwa_')||ownFlags.has(f),`Fremdes Flag wird geschrieben: ${f}`);
 for(const key of ['requires_clues','hide_if_clues','requires_any_clues','gives_clues'])for(const id of o[key]??[])assert(base.clues[id],`Hinweis ${id}`);
 for(const key of ['requires_conclusions','hide_if_conclusions'])for(const id of o[key]??[])assert(base.deductions.some(d=>d.id===id),`Deduktion ${id}`);
 for(const key of ['requires_items','hide_if_items'])for(const id of o[key]??[])assert(base.items[id],`Item ${id}`);
 for(const key of ['gives_items','takes_items'])for(const id of Object.keys(o[key]??{}))assert(base.items[id],`Item ${id}`);
 for(const key of ['start_quests','complete_quests','requires_quests_active','requires_quests_done','hide_if_quests'])for(const id of o[key]??[])assert(base.quests[id],`Quest ${id}`);
 for(const id of Object.keys(o.bond??{}))assert(base.npcs[id],`Bindungsfigur ${id}`);
 if(o.combat)assert(base.encounters[o.combat],`Kampf ${o.combat}`);
 if(o.map)assert(base.maps[o.map],`Karte ${o.map}`);
 if(o.npc)assert(base.npcs[o.npc],`NPC ${o.npc}`);
 if(o.dialogue)assert(base.dialogues[o.dialogue],`Dialog ${o.dialogue}`);
 if(o.ending)assert(base.endings[o.ending],`Ende ${o.ending}`);
 if(o.requires_pathway)assert(base.pathways[o.requires_pathway[0]],`Pfad ${o.requires_pathway[0]}`);
 assert(!('encounter' in o),'Benutze das tatsächlich unterstützte Feld combat');
};
for(const name of ['quests','items','dialogues','dialog_zusaetze','case','platzierung','epiloge','zeitung','boss_texte']) walk(data[name],checkRefs);
for(const d of data.case.deductions){assert.equal(d.pairs.length,1);for(const f of d.pairs[0]){assert(data.case.facts[f]);assert.equal(Object.values(data.case.clues).filter(c=>c.fact===f).length,2);}}
const cluePlaces=new Set(data.platzierung.flatMap(p=>p.interactable?.effects?.gives_clues??[]));
assert.equal(cluePlaces.size,80);
for(const a of data.anker){assert(base.maps[a.ort]||base.npcs[a.ort],a.ort);assert(base.npcs[a.person],a.person);assert(base.clues[a.gefunden_durch]);assert(['zeuge','gegenstand','dokument'].includes(a.quelle));}
for(const ab of data.abgleiche){assert(ab.bei_fehlen.nerves<=-3&&ab.bei_fehlen.nerves>=-6);for(const pair of ab.benoetigt){assert.equal(pair.length,2);const aa=pair.map(id=>data.anker.find(a=>a.id===id));assert(aa.every(Boolean));assert.notEqual(aa[0].quelle,aa[1].quelle);assert.equal(aa[0].person,aa[1].person,`Anker gehören nicht zur selben Person: ${ab.id}`);}}

// Exercise actual GameState conditions/effects and actual merged dialogue
// choices, never a separate permissive condition interpreter.
function enter(s,dialogue,key){const d=base.dialogues[dialogue];key??=s.pick(d.start);assert(d.nodes[key],`${dialogue}/${key}`);s.applyEffects(d.nodes[key],{nodeKey:`${dialogue}.${key}`});return key;}
function pick(s,dialogue,current,target){const n=base.dialogues[dialogue].nodes[current];const ch=n.choices.find(c=>c.next===target&&s.meets(c));assert(ch,`Gesperrter Schritt ${dialogue}/${current} -> ${target}`);return enter(s,dialogue,target);}
function addon(s,dialogue,key){let current=enter(s,dialogue);if(current!=='hub'&&current!=='k3a_start')current=pick(s,dialogue,current,'hub');return pick(s,dialogue,current,key);}
function read(s,p){assert(s.meets(p.visible_if),`Unsichtbar: ${p.interactable.id}`);const i=p.interactable;if(!s.flags.has(i.done_flag))s.applyEffects({...i.effects,sets_flags:[...(i.effects?.sets_flags??[]),i.done_flag]});}
function compare(s,num,privacy){const d='cwa_abgleich'+num+'_dialog';let k=enter(s,d);if(k.endsWith('_fertig'))return;
 const n=base.dialogues[d].nodes[k];const replacement=n.choices.find(c=>c.next?.endsWith('_ersatz')&&s.meets(c));if(replacement){k=pick(s,d,k,replacement.next);k=pick(s,d,k,'cwa_abgleich'+num+'_vorschau');}
 const pair=base.dialogues[d].nodes[k].choices.find(c=>c.next?.includes('_paar')&&s.meets(c));assert(pair,`Kein Ankerpaar ${num}`);k=pick(s,d,k,pair.next);pick(s,d,k,'cwa_abgleich'+num+'_'+privacy);
}
function repairs(s){for(const npc of ['cw_darnell','cw_crayford','cw_pritch','cw_wicksend','cw_hesk','cw_malliver','cw_noel_bellcross','cw_bexley','cw_ida_bellcross'])if(s.flags.has('cwa_verraten_'+npc)&&!s.flags.has('cwa_folge_'+npc+'_gesichert'))addon(s,'bj_'+npc,'cwa_folge_'+npc);enter(s,'cwa_kontaktpruefung');assert(s.flags.has('cwa_kontakte_geprueft'));}
function boss(s,c,mode){const short={14:'bleisammler',24:'blinder_zusteller',52:'nullfundament'}[c],p='cwa_'+short,d=p+'_dialog';let k=enter(s,d);
 if(mode==='friedlich'){pick(s,d,k,p+'_friedlich');return;}
 const stages=c==='52'?3:2;
 for(let stage=1;stage<=stages;stage++){k=pick(s,d,k,p+'_kampf'+stage);const enc=s.pendingCombat;assert(enc);s.pendingCombat=null;s.flags.add('won_'+enc);s.applyEffects(base.encounters[enc].on_win);k=enter(s,d);}
 assert(s.flags.has(p+'_passiert'));assert(s.flags.has('cwa_beleg_verloren_'+({14:1,24:2,52:3}[c])));
}
const interro={11:'cw_darnell',13:'cw_hesk',21:'cw_wicksend',22:'cw_pritch',23:'cw_hesk',32:'cw_malliver',53:'cw_wetherby'};
function question(s,c,privacy){const npc=interro[c],d='bj_'+npc,p='cwa_'+c+'_verhoer';let k=addon(s,d,p);for(const suffix of ['_luege1','_widerlegt1','_luege2','_widerlegt2','_folgen'])k=pick(s,d,k,p+suffix);pick(s,d,k,p+'_'+privacy);}
const codeList=['11','12','13','14','21','22','23','24','31','32','33','34','41','42','43','44','51','52','53','54'];
const comparisons={14:1,22:2,33:3,42:4,51:5,54:6};
let runs=0;let finalProbe;
for(const prior of ['feierabend','stilllegung','gegenstimme','vollzaehlig'])for(const outcome of ['widerspruch','amtsinhaber','buecher','ordnung'])for(const mode of ['friedlich','kampf'])for(const privacy of ['oeffentlich','vertraulich']) {
 const s=new GameState(base);s.flags.add('kapitel3_done');s.flags.add('k3a_end_'+prior);
 const paper=data.platzierung.find(p=>p.interactable?.id===`cwa_anreise_${prior}_papier`);read(s,paper);
 let p=`cwa_anreise_${prior}`,k=addon(s,'k3a_pfiff',p);k=pick(s,'k3a_pfiff',k,p+'_weg');pick(s,'k3a_pfiff',k,p+'_abfahrt');assert.deepEqual(s.pendingTravel,{map:'cw_gleisfuss',spawn:'aufzug'});s.pendingTravel=null;
 k=enter(s,'cwa_ankunft');pick(s,'cwa_ankunft',k,'cwa_ankunft_rettung');assert.equal(s.quests.cwa_akt1,'active');
 for(const c of codeList){
  for(const p of data.platzierung.filter(p=>p.interactable?.id.match(new RegExp(`^cwa_${c}_obj[1-4]$`))))read(s,p);
  const ded=data.case.deductions.find(d=>d.id===`cwa_${c}_d`);assert(ded.pairs[0].every(f=>s.factStatus(f)==='likely'));s.combine(...ded.pairs[0]);
  if(interro[c])question(s,c,privacy);
  if(['14','24','52'].includes(c))boss(s,c,mode);
  if(c==='54')repairs(s);
  if(comparisons[c])compare(s,comparisons[c],privacy);
  if(c==='54')repairs(s);
  const d='cwa_'+c+'_dialog';k=enter(s,d);k=pick(s,d,k,'cwa_'+c+'_schluss');pick(s,d,k,'cwa_'+c+'_bestaetigt');
  if(c==='42'&&outcome==='widerspruch')for(const [npc,g] of [['cw_wicksend','markt'],['cw_noel_bellcross','kuechen'],['cw_darnell','bahnhof']])addon(s,'bj_'+npc,'cwa_zeugen_'+g);
  if(c==='51'&&outcome==='widerspruch')addon(s,'bj_cw_noel_bellcross','cwa_kuechenbuerge');
  if(c.endsWith('4')){const a=c[0];k=addon(s,'bj_cw_crayford','cwa_bilanz'+a);pick(s,'bj_cw_crayford',k,'cwa_bilanz'+a+'_ja');}
 }
 if(prior==='vollzaehlig'&&outcome==='ordnung'&&mode==='kampf'&&privacy==='vertraulich')finalProbe=s.serialize();
 const before=s.money;const eh=s.honor;k=enter(s,'cwa_finale');k=pick(s,'cwa_finale',k,'cwa_'+outcome+'_warnung');assert(!s.flags.has('kapitel4_done'),'Warnung beendet Kapitel');pick(s,'cwa_finale',k,'cwa_'+outcome+'_bestaetigt');
 assert(s.flags.has('kapitel4_done'));assert.equal(s.quests.cwa_akt5,'done');assert.equal(Object.keys(data.case.endings).filter(id=>s.meets(data.case.endings[id])).length,0,'Ende wiederholbar');
 if(['amtsinhaber','ordnung'].includes(outcome)){assert.equal(s.honor,eh);assert.equal(s.itemCount('cwa_amtsschluessel'),1);assert.equal(s.money,before);}
 const epi=s.epilogue('cwa_'+outcome);assert(epi.length>=3&&epi.length<=5);if(prior==='vollzaehlig'&&outcome==='amtsinhaber')assert(epi.some(e=>e.text.includes('Opferverwaltung jetzt ein zweites Mal')));
 runs++;
}

// Negative cases and one-time behavior, outside the complete playthroughs.
{
 const s=new GameState(base);s.flags.add('k4_arrived');const d='cwa_abgleich1_dialog';let k=enter(s,d);
 assert(!base.dialogues[d].nodes[k].choices.some(c=>c.next?.includes('_paar')&&s.meets(c)));
 const nerves=s.composure;const clues=[...s.clues];pick(s,d,k,'cwa_abgleich1_fehlen');
 assert.equal(s.composure,nerves-3);assert.deepEqual(s.pendingTravel,{map:'cw_gleisfuss',spawn:'aufzug'});assert.deepEqual(s.clues,clues);assert(!s.flags.has('cwa_abgleich1_done'));
 k=enter(s,d);assert(!base.dialogues[d].nodes[k].choices.some(c=>c.next?.endsWith('_fehlen')&&s.meets(c)));
}
{
 const s=new GameState(base);s.load(finalProbe);
 assert(s.meets(data.case.endings.cwa_amtsinhaber));assert(s.meets(data.case.endings.cwa_buecher));assert(s.meets(data.case.endings.cwa_ordnung));assert(!s.meets(data.case.endings.cwa_widerspruch));
 for(const group of ['markt','kuechen','bahnhof'])s.flags.add('cwa_zeugen_'+group);
 assert(!s.meets(data.case.endings.cwa_widerspruch),'Küchenbürgschaft umgehbar');s.flags.add('cwa_kuechenbuerge');assert(s.meets(data.case.endings.cwa_widerspruch));
 s.flags.delete('cwa_ida_frei');assert(!s.meets(data.case.endings.cwa_widerspruch));assert(!s.meets(data.case.endings.cwa_buecher));
}
{
 const s=new GameState(base);s.flags.add('k4_arrived');const p=data.platzierung.find(p=>p.interactable?.id==='cwa_11_obj1');read(s,p);const count=s.itemCount('vi_k_cw_ungestempelter_durchschlag');read(s,p);assert.equal(s.itemCount('vi_k_cw_ungestempelter_durchschlag'),count);
 s.startQuest('cwa_akt1');s.finishQuest('cwa_akt1','done');const money=s.money;s.finishQuest('cwa_akt1','done');assert.equal(s.money,money);
}
for(const short of ['bleisammler','blinder_zusteller','nullfundament']) {
 const p='cwa_'+short,d=p+'_dialog',bossId='vg_cw_boss_'+short,s=new GameState(base);let k=enter(s,d);k=pick(s,d,k,p+'_kampf1');s.pendingCombat=null;s.flags.add('won_'+bossId);s.applyEffects(base.encounters[bossId].on_win);k=enter(s,d);
 assert.equal(k,p+'_weiter1');pick(s,d,k,p+'_abbruch');assert.equal(enter(s,d),p+'_start');
 k=pick(s,d,p+'_start',p+'_kampf1');s.pendingCombat=null;s.applyEffects(base.encounters[bossId].on_lose);assert.equal(enter(s,d),p+'_start');assert(!s.flags.has(p+'_passiert'));
}
let kernels=0;
for(const [short,seq] of [['bleisammler',3],['blinder_zusteller',2],['nullfundament',1]])for(const path of ['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']){
 const s=new GameState(base);s.pathway={...s.pathway,id:path,seq:9};s.inventory={};s.flags.add('cwa_'+short+'_passiert');
 const d='cwa_'+short+'_kern_dialog',item=`sq_zutat_${path.replace(/^sq_/,'')}_${seq}`;let k=enter(s,d);
 const eligible=base.dialogues[d].nodes[k].choices.filter(c=>c.next&&s.meets(c));assert.equal(eligible.length,1);pick(s,d,k,eligible[0].next);assert.equal(s.itemCount(item),1);
 s.removeItem(item);k=enter(s,d);assert(!base.dialogues[d].nodes[k].choices.some(c=>c.next&&s.meets(c)),'Kern nach Verbrauch wiederholbar');
 const already=new GameState(base);already.pathway={...already.pathway,id:path,seq:9};already.flags.add('cwa_'+short+'_passiert');already.addItem(item);k=enter(already,d);assert(!base.dialogues[d].nodes[k].choices.some(c=>c.next&&already.meets(c)),'Vorhandene Zutat doppelt angeboten');kernels++;
}
console.log(`PASS ${counts.json} JSON-Dateien; 5 Hauptquests, 20 Fährten/Deduktionen, 80 Hinweise, ${counts.nodes} Dialogknoten, 22 Anker, 6 Abgleiche, 4 Enden.`);
console.log('PASS IDs, next/Start-Knoten, Flag-Erzeuger, Quellenpaare, Referenzen, Präfixe, Kartenobjekte und Oberflächentexte.');
console.log(`PASS ${runs} vollständige GameState-Durchläufe: 4 Dunscar-Anreisen × 4 Enden × friedlich/Kampf × öffentlich/vertraulich; nur Stadtende verlangt alle Zeugengruppen.`);
console.log(`PASS Fehlversuch/Rückweg, fehlende Zeugen/Küchenbürgschaft/Ida, einmalige Lese- und Questbelohnungen, Bossabbruch/Niederlage sowie ${kernels} pfadgefilterte Ersatzkerne ohne Wiederholung.`);
console.log(`OFFEN ${pending.length} CD-Definitionen, im Test ausdrücklich durch Platzhalter ersetzt: ${pending.join('; ')}`);
console.log('OFFEN Kartenpositionen/Spawns, Landstraßen-Adapter, Unterkunft und neue Bindungsfiguren benötigen separaten Einbau; keine Kampfwerte oder Kartengeometrie geprüft.');
