// Nur Node-Standardbibliothek und vorhandene, DOM-freie Spielmodule. Keine Installation nötig.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { loadContent, fight } from '../../../tests/helpers.js';
import { applyQuestPack } from '../../../src/data/questPacks.js';
import { GameState } from '../../../src/core/GameState.js';
import { Combat } from '../../../src/core/Combat.js';
const dir=dirname(fileURLToPath(import.meta.url)), root=resolve(dir,'../../..');
const read=(p)=>JSON.parse(readFileSync(p,'utf8'));
// Seit dem Einbau liegen die Daten in src/data/packs/k2_akten; der Bestand wird ohne dieses Paket geladen
const pkgDir=join(root,'src/data/packs/k2_akten');
const filenames=readdirSync(pkgDir).filter(f=>f.endsWith('.json'));
const data=Object.fromEntries(filenames.map(f=>[f.slice(0,-5),read(join(pkgDir,f))]));
const base=loadContent({without:['k2_akten']}), pack={name:'k2_akten',...data};
const errors=[];const check=(ok,msg)=>{if(!ok)errors.push(msg)};
const own=s=>typeof s==='string'&&s.startsWith('k2a_');
const reserved=new Set(['wxn_apothekerin','wxn_telegrafist','wxn_hafenmeisterin','wxn_maler']);
const walk=(v,fn,p='')=>{if(!v||typeof v!=='object')return;if(!Array.isArray(v))fn(v,p);for(const [k,x]of Object.entries(v))walk(x,fn,p+'/'+k)};
const source=[];
function allJson(p){for(const x of readdirSync(p,{withFileTypes:true})){const f=join(p,x.name);if(x.isDirectory())allJson(f);else if(x.name.endsWith('.json'))source.push(read(f));}}
allJson(join(root,'src/data'));
const flags=new Set();
for(const v of [...source,...Object.values(data)])walk(v,o=>{for(const x of o.sets_flags??[])flags.add(x);if(o.done_flag)flags.add(o.done_flag)});
const maps=base.maps;
const sets={quests:new Set([...Object.keys(base.quests),...Object.keys(data.quests)]),items:new Set([...Object.keys(base.items),...Object.keys(data.items)]),npcs:new Set([...Object.keys(base.npcs),...Object.keys(data.npcs)]),encounters:new Set([...Object.keys(base.encounters),...Object.keys(data.encounters)]),clues:new Set([...Object.keys(base.clues),...Object.keys(data.case.clues)]),facts:new Set([...Object.keys(base.facts),...Object.keys(data.case.facts)]),conclusions:new Set([...base.deductions,...data.case.deductions].map(d=>d.id)),dialogues:new Set([...Object.keys(base.dialogues),...Object.keys(data.dialogues)]),endings:new Set([...Object.keys(base.endings),...Object.keys(data.case.endings)])};
function known(type,id,path){check(sets[type].has(id),`${path}: unbekannte ${type}-Referenz ${id}`)}
for(const name of ['quests','items','encounters','dialogues','npcs'])for(const id of Object.keys(data[name])){
 check(own(id)||(name==='npcs'&&reserved.has(id)),`${name}: Präfix fehlt ${id}`);
 check(!Object.hasOwn(base[name],id),`${name}: überschreibt Bestand ${id}`);
}
for(const name of ['facts','clues','endings'])for(const id of Object.keys(data.case[name])){
 check(own(id),`${name}: Präfix fehlt ${id}`);check(!Object.hasOwn(base[name],id),`${name}: überschreibt Bestand ${id}`);
}
for(const d of data.case.deductions){check(own(d.id),`Deduktion ohne Präfix ${d.id}`);check(!base.deductions.some(x=>x.id===d.id),`Deduktion doppelt ${d.id}`);for(const pair of d.pairs){check(pair.length===2,`${d.id}: kein Paar`);pair.forEach(f=>known('facts',f,d.id))}}
for(const [id,f]of Object.entries(data.case.facts))for(const c of f.refuted_by??[])known('clues',c,id);
for(const [id,c]of Object.entries(data.case.clues)){known('facts',c.fact,id);check(c.case===data.case.facts[c.fact].case,`${id}: falsche Akte`)}
const conditionKeys=new Set(['requires_flags','hide_if_flags','requires_items','hide_if_items','requires_clues','hide_if_clues','requires_any_clues','requires_conclusions','hide_if_conclusions','requires_quests_active','requires_quests_done','hide_if_quests','requires_money','requires_honor','requires_nerves','max_nerves','requires_bond','requires_pathway']);
for(const [file,v] of Object.entries(data))walk(v,(o,path)=>{
 for(const k of Object.keys(o))if(k.startsWith('requires_')||k.startsWith('hide_if_'))check(conditionKeys.has(k),`${file}${path}: unbekannte Bedingung ${k}`);
 for(const k of ['requires_flags','hide_if_flags','sets_flags','clears_flags'])for(const f of o[k]??[]){
  check(flags.has(f)||(f.startsWith('won_')&&sets.encounters.has(f.slice(4))),`${file}${path}: Flag ohne Produzent ${f}`);
  if(k==='sets_flags'||k==='clears_flags')check(own(f),`${file}${path}: schreibt fremdes Flag ${f}`);
 }
 if(o.done_flag)check(own(o.done_flag),`${file}${path}: fremdes done_flag`);
 for(const [keys,type]of [[['requires_items','hide_if_items'],'items'],[['gives_clues','requires_clues','hide_if_clues','requires_any_clues','refuted_by'],'clues'],[['requires_conclusions','hide_if_conclusions'],'conclusions'],[['requires_quests_active','requires_quests_done','hide_if_quests','start_quests','complete_quests'],'quests']])for(const k of keys)for(const id of o[k]??[])known(type,id,file+path+'/'+k);
 for(const k of ['gives_items','takes_items'])for(const id of Object.keys(o[k]??{}))known('items',id,file+path+'/'+k);
 for(const k of ['combat','encounter'])if(o[k])known('encounters',o[k],file+path);
 if(typeof o.sprite==='string'&&o.sprite.startsWith('npc:'))known('npcs',o.sprite.slice(4),file+path);
 if(o.npc)known('npcs',o.npc,file+path);if(o.dialogue)known('dialogues',o.dialogue,file+path);if(o.ending)known('endings',o.ending,file+path);
 if(o.map)check(Object.hasOwn(maps,o.map),`${file}${path}: Karte fehlt ${o.map}`);
 if(o.spawn&&o.map)check(Object.hasOwn(maps[o.map]?.spawns??{},o.spawn),`${file}${path}: Spawn fehlt`);
});
for(const [id,e]of Object.entries(data.case.endings)){check(e.complete_quests.includes(e.case),`${id}: Abschlussquest fehlt`);check(e.sets_flags.includes(e.case+'_done'),`${id}: Abschlussflag fehlt`);check(e.gives_money>0||e.honor>0,`${id}: keine Belohnung`)}
function dialogCheck(id,d,extra=false){
 const nodes=extra?{...base.dialogues[id]?.nodes,...d.nodes_add}:d.nodes;
 check(!!nodes,`Dialog fehlt ${id}`);
 const ownNodes=extra?d.nodes_add:nodes;
 for(const n of Object.keys(ownNodes)){check(own(n),`${id}/${n}: Knoten ohne Präfix`);if(extra)check(!Object.hasOwn(base.dialogues[id].nodes,n),`${id}/${n}: überschreibt Knoten`)}
 function next(v,p){if(typeof v==='string')check(Object.hasOwn(nodes,v),`${id}${p}: next fehlt ${v}`);else if(Array.isArray(v))for(const x of v){check(typeof x.node==='string',`${id}${p}: ungültige Variante`);next(x.node,p)}}
 if(!extra)next(d.start,'/start');
 walk(extra?{nodes:d.nodes_add,choices:d.choices_add}:d,(o,p)=>{if(o.next!==undefined)next(o.next,p)});
 if(extra)check(!!base.dialogues[id]?.nodes?.start,`${id}: Zusatz benötigt start-Knoten`);
}
for(const [id,d]of Object.entries(data.dialogues))dialogCheck(id,d);
for(const [id,d]of Object.entries(data.dialog_zusaetze))dialogCheck(id,d,true);
// Kartenbelegung gegen Hauptspiel UND die bereits eingebauten Pakete/Lore.
const occupied=new Map();
for(const [id,m]of Object.entries(maps))for(const p of [...m.npcs??[],...m.interactables??[],...m.roamers??[]])if(p.tile)occupied.set(`${id}:${p.tile}`,p.id??p.encounter);
const walkable=new Set('.,P=pwgs');
const reachable=new Map();
for(const [id,m]of Object.entries(maps)){const seen=new Set(),todo=Object.values(m.spawns??{}).map(t=>[...t]);while(todo.length){const [x,y]=todo.shift(),k=`${x},${y}`;if(seen.has(k)||!walkable.has(m.rows[y]?.[x]))continue;seen.add(k);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])todo.push([x+dx,y+dy]);}reachable.set(id,seen)}
for(const p of data.platzierung){
 const id=p.npc??p.interactable.id,m=maps[p.map],key=`${p.map}:${p.tile}`;
 check(own(id)||reserved.has(id),`Platzierung: Präfix fehlt ${id}`);
 check(!occupied.has(key),`${id}: Kachel ${key} schon belegt durch ${occupied.get(key)}`);occupied.set(key,id);
 const [x,y]=p.tile;check(Number.isInteger(x)&&Number.isInteger(y)&&!!m.rows[y]?.[x],`${id}: außerhalb Karte`);
 check(reachable.get(p.map).has(`${x},${y}`),`${id}: keine Bodenroute vom Spawn`);
 check(walkable.has(m.rows[y]?.[x]),`${id}: kein freier Boden (${m.rows[y]?.[x]})`);
 if(p.interactable?.kind==='read')check(p.interactable.text.split(/\s+/).length<=120,`${id}: Lesetext über 120 Wörter`);
}
for(const q of Object.values(data.quests))for(const s of q.steps){const m=maps[s.target.map];check([...m.npcs??[],...m.interactables??[],...data.platzierung.filter(p=>p.map===s.target.map).map(p=>({id:p.npc??p.interactable.id}))].some(p=>p.id===s.target.id),`Questziel fehlt ${s.target.map}/${s.target.id}`)}
for(const z of data.zeitung)check(own(z.id),`Zeitungs-ID ohne Präfix ${z.id}`);
check(data.faelle.length===4,'Fallwand braucht vier Einträge');check(data.zeitung.length===12,'Zeitung braucht zwölf Endmeldungen');
for(const f of data.faelle){const q=f.id;check(own(q)&&!!data.quests[q],`Fall fehlt ${q}`);const clues=Object.values(data.case.clues).filter(c=>c.case===q),ds=data.case.deductions.filter(d=>d.case===q),ends=Object.values(data.case.endings).filter(e=>e.case===q);check(clues.length>=12&&clues.length<=18,`${q}: Hinweiszahl`);check(ds.length>=4&&ds.length<=6,`${q}: Deduktionszahl`);check(ends.length>=2&&ends.length<=3,`${q}: Endzahl`);check(data.quests[q].steps.length>=4&&data.quests[q].steps.length<=7,`${q}: Schrittzahl`);for(const [id,end]of Object.entries(data.case.endings).filter(([,e])=>e.case===q)){check(data.zeitung.some(z=>z.requires_flags.includes(id+'_gesetzt')),`${id}: Zeitung fehlt`);check(Object.values(data.dialog_zusaetze).some(d=>d.choices_add.some(c=>c.requires_flags?.includes(id+'_gesetzt'))),`${id}: NPC-Nachspiel fehlt`)}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`OK: ${filenames.length} JSON-Dateien, Präfixe, Flags, Verweise, Dialogkanten und ${data.platzierung.length} freie Platzierungen.`);
// Nur im Prüfspeicher: dokumentierte Einbauadapter für Enden, Fallregister und Zeitung.
const content=applyQuestPack(structuredClone(base),pack);
Object.assign(content.endings,data.case.endings);
content.cases.push(...data.faelle.map(({id,title})=>({id,title})));
content.newspapers.push(...data.zeitung);
const fresh=q=>{const s=new GameState(content);s.money=0;for(const f of ['k2_arrived','k2_met_zunder','k2_hideout','k2_known_bahnhof','k2_known_torf','k2_known_salz','k2_known_hafen','k2_known_ober','k2_known_pfahl',...data.faelle.find(f=>f.id===q).requires_flags])s.flags.add(f);return s};
// Der Runner folgt ausschließlich aktuell sichtbaren Choices. Kein direktes Setzen von Inhaltsflags.
function enter(s,id){const d=content.dialogues[id];return s.pick(d.start)}
function pathTo(s,id,target){
 const d=content.dialogues[id],queue=[[enter(s,id)]],seen=new Set();
 while(queue.length){const p=queue.shift(),n=p.at(-1);if(seen.has(n))continue;seen.add(n);if(n===target)return p;const node=d.nodes[n];if(node.combat||node.ending)continue;for(const c of node.choices??[])if(s.meets(c)){const next=s.pick(c.next);if(next)queue.push([...p,next])}}
 throw new Error(`Unerreichbar ${id}/${target}`);
}
function visit(s,id,target){const p=pathTo(s,id,target);for(const n of p){s.applyEffects(content.dialogues[id].nodes[n]);s.visitNode(id,n)}return p}
function interact(s,p){assert(s.meets(p.visible_if));const o=p.interactable;if(o.kind==='read'&&!s.flags.has(o.done_flag)){s.applyEffects(o.effects);s.flags.add(o.done_flag)}}
function investigate(s,q){
 const before=s.money;visit(s,q+'_kontakt',q+'_auftrag');assert.throws(()=>visit(s,q=="k2a_letztes_bild"?q+'_kontakt':q+'_verhoer',q+'_widerlegen'),/Unerreichbar/);assert.equal(s.quests[q],'active');assert.equal(s.money,before);
 let refuted=0;const off=s.on('fact',e=>{if(e.status==='refuted')refuted++});
 for(let round=0;round<3;round++){
  for(const p of data.platzierung.filter(p=>p.interactable?.id.startsWith(q+'_ort_')))if(s.meets(p.visible_if))interact(s,p);
  for(const [id,d]of Object.entries(content.dialogues))for(const [n,v]of Object.entries(d.nodes))if(n.startsWith(q+'_')&&v.gives_clues?.length&&!v.start_quests)try{visit(s,id,n)}catch(e){if(!e.message.startsWith('Unerreichbar'))throw e}
  if(!s.flags.has(q+'_kontrolle_done'))visit(s,q+'_kontrolle',q+'_pol_warten');
 }
 assert.equal(s.factStatus(q+'_f_lie'),'refuted');assert(refuted>0,'fact_refuted muss durch Hinweise entstehen');
 for(const d of data.case.deductions.filter(d=>d.case===q&&!d.id.endsWith('_falsch'))){const [a,b]=d.pairs[0];assert.equal(s.combine(a,b).result,'new',d.id)}
 const own=Object.keys(data.case.clues).filter(k=>data.case.clues[k].case===q);assert(own.every(c=>s.hasClue(c)),`${q}: nicht alle Hinweise erreichbar`);
 const id=q==='k2a_letztes_bild'?q+'_kontakt':q+'_verhoer';visit(s,id,q+'_widerlegen');assert(s.flags.has(q+'_gestellt'));
 return s;
}
let endRuns=0;
for(const f of data.faelle){const q=f.id;
 const locked=new GameState(content);assert.throws(()=>visit(locked,q+'_kontakt',q+'_auftrag'),/Unerreichbar/);
 const late=fresh(q);late.flags.add('kapitel2_done');assert.throws(()=>visit(late,q+'_kontakt',q+'_auftrag'),/Unerreichbar/);
 const start=investigate(fresh(q),q);assert.throws(()=>visit(start,q+'_showdown',Object.keys(data.case.endings).find(id=>data.case.endings[id].case===q)),/Unerreichbar/);const nerves=start.composure,wanted=start.wanted;visit(start,q+'_kontrolle',q+'_pol_fertig');assert.equal(start.composure,nerves);assert.equal(start.wanted,wanted);const save=start.serialize();
 for(const [id,end]of Object.entries(data.case.endings).filter(([,e])=>e.case===q)){
  const s=new GameState(content);s.load(save);s.flags.add('kapitel2_done'); // laufender Fall bleibt nach dem Hauptende lösbar
  if(q==='k2a_letztes_bild')visit(s,q+'_showdown',q+'_richtig');
  visit(s,q+'_showdown',q+'_kampf_jetzt');assert.equal(s.pendingCombat,q+'_kampf');
  const won=fight(s,q+'_kampf',{attack:'perfect',defend:()=> 'parry'});assert.equal(won.combat.outcome,'won');s.pendingCombat=null;
  visit(s,q+'_showdown',id);assert.equal(s.quests[q],'done');assert(s.questSteps(q).every(x=>x.done));assert.equal(s.endings[q],id);assert.equal(Object.keys(s.endings).filter(x=>x.startsWith('k2a_')).length,1);
  const money=s.money,honor=s.honor;assert.throws(()=>visit(s,q+'_showdown',id),/Unerreichbar/);visit(s,q+'_showdown',q+'_geschlossen');assert.equal(s.money,money);assert.equal(s.honor,honor);
  const papers=s.papers.filter(id=>id.startsWith(q+'_bote_'));assert.equal(papers.length,1);
  const reload=new GameState(content);reload.load(s.serialize());assert.equal(reload.money,money);assert.equal(reload.endings[q],id);assert.equal(reload.papers.filter(x=>x.startsWith(q+'_bote_')).length,1);
  const post=q+'_reaktion_'+id.split('_ende_')[1];const extra=Object.entries(data.dialog_zusaetze).find(([,d])=>d.nodes_add[post]);visit(reload,extra[0],post);assert.equal(reload.money,money);endRuns++;
 }
 // Niederlage und Flucht: vorhandene Combat-Auswertung, keine Belohnung und kein Abschluss.
 for(const outcome of ['lost','fled']){const s=new GameState(content);s.load(save);if(q==='k2a_letztes_bild')visit(s,q+'_showdown',q+'_richtig');visit(s,q+'_showdown',q+'_kampf_jetzt');const c=new Combat(s,q+'_kampf');c.outcome=outcome;c.finish();assert(!s.flags.has('won_'+q+'_kampf'));assert.equal(s.quests[q],'active');assert.doesNotThrow(()=>pathTo(s,q+'_showdown',q+'_kampf_jetzt'))}
}
// Falsche Bildentscheidung erzwingt Vane UND Frau, einschließlich Wiederaufnahme nach Verlust.
{
 const q='k2a_letztes_bild',s=investigate(fresh(q),q);visit(s,q+'_showdown',q+'_falsch');assert.equal(s.pendingCombat,q+'_vane_kampf');
 const lost=new Combat(s,q+'_vane_kampf');lost.outcome='lost';lost.finish();assert.equal(enter(s,q+'_showdown'),q+'_vane_retry');
 visit(s,q+'_showdown',q+'_vane_again');s.heal('full');assert.equal(fight(s,q+'_vane_kampf',{attack:'perfect',defend:()=> 'parry'}).combat.outcome,'won');assert.equal(enter(s,q+'_showdown'),q+'_kampf_start');assert.throws(()=>visit(s,q+'_showdown',q+'_ende_bruch'),/Unerreichbar/);
 s.heal('full');visit(s,q+'_showdown',q+'_kampf_jetzt');assert.equal(fight(s,q+'_kampf',{attack:'perfect',defend:()=> 'parry'}).combat.outcome,'won');visit(s,q+'_showdown',q+'_ende_bruch');assert.equal(s.endings[q],q+'_ende_bruch');
}
console.log(`OK: ${endRuns} Endpfade, 8 Niederlage-/Fluchtpfade, falscher Bildpfad mit beiden Kämpfen.`);
console.log('OK: 64 erreichbare Hinweise, 4 automatisch widerlegte Lügen, 16 echte Deduktionen, 12 Zeitungen und 12 Nachspiele.');
console.log('OK: Startgates, Abschluss nach Kapitelende, Wiederaufnahme, Save/Load und einmalige Abschlussbelohnungen.');
console.log('HINWEIS: Fallwand, case.endings und Zeitung wurden ausschließlich im Prüfspeicher ergänzt; Live-Einbau bleibt offen.');
