import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const dir=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(dir,'../../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
// Eingebaut: Spieldaten in src/data/packs/k3_pruefungen, Herkunftstabelle bleibt hier
const pkgDir=path.join(root,'src/data/packs/k3_pruefungen');
const rd=d=>fs.readdirSync(d).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),read(path.join(d,f))]);
const pack=Object.fromEntries([...rd(dir),...rd(pkgDir)]);
const files=Object.keys(pack).map(k=>k+'.json');
const failures=[], pending=new Set();
const check=(ok,msg)=>{if(!ok)failures.push(msg);};
const walk=(o,fn)=>{if(!o||typeof o!=='object')return;if(!Array.isArray(o))fn(o);for(const v of Object.values(o))walk(v,fn);};
const source=[];
function scan(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())scan(p);else if(e.name.endsWith('.json'))source.push(read(p));}}
scan(path.join(root,'src/data'));
const keys=new Set(),flags=new Set(),maps=new Set(),npcs=new Set(),items=new Set(),encounters=new Set(),quests=new Set(),dialogues=new Set(),objects=new Set();
for(const doc of source)walk(doc,o=>{for(const k of Object.keys(o))keys.add(k);for(const f of o.sets_flags??[])flags.add(f);if(o.done_flag)flags.add(o.done_flag);if(o.id)keys.add(o.id);});
// Root dictionaries have distinct shapes; classify references, not arbitrary string values.
for(const doc of source)walk(doc,o=>{
 for(const [k,v] of Object.entries(o))if(v&&typeof v==='object'&&!Array.isArray(v)){
 if(v.kind&&v.name&&v.desc)items.add(k);
 if(v.hp&&v.attacks)encounters.add(k);
 if(v.role&&v.dialogue)npcs.add(k);
 if(v.steps&&v.summary)quests.add(k);
 if(v.nodes&&v.start)dialogues.add(k);
 }
 if(o.id&&o.interactables)maps.add(o.id);
});
for(const [file,set] of [['items',items],['encounters',encounters],['npcs',npcs],['quests',quests],['dialogues',dialogues]])for(const id of Object.keys(pack[file]))set.add(id);
// Existing items include formulas and ingredients without weight and generated potion IDs.
const baseItems=read(path.join(root,'src/data/items.json'));for(const id of Object.keys(baseItems))items.add(id);
const ingredients=read(path.join(root,'src/data/packs/sequenzen/zutaten.json'));for(const id of Object.keys(ingredients))items.add(id);
const af={...read(path.join(root,'src/data/packs/sequenzen/seq_4_bis_1.json')),...read(path.join(root,'src/data/packs/sequenzen/neue_pfade.json'))};
for(const [pid,p] of Object.entries(af))for(const seq of Object.keys(p.seqs)){items.add(`trank_${pid}_${seq}`);items.add(`formel_${pid}_${seq}`);if(p.seqs[seq].ritual)flags.add(`ritual_${pid}_${seq}`);}
const contractMaps=new Set(['ds_schwellenring','ds_kalkmarkt','ds_lohnbuero','ds_teesaal','ds_pruefhaus','ds_runddepot','ds_bruchstufen','ds_endbahnhof','ds_signalhang','ds_speisewagen']);
const contractEncounters=new Set(['schwellenhund','vorhauer','vielrufer','unterschicht']);
const contractFlags=new Set(['k3a_akt2_done','kapitel3_done',...['schwellenhund','vorhauer','vielrufer','unterschicht','uhrwerkwaechter'].map(x=>`k3p_${x}_friedlich`)]);
function ref(set,id,contracts=new Set()){if(set.has(id))return;if(contracts.has(id))pending.add(id);else failures.push(`Unbekannter Verweis: ${id}`);}
walk(pack,o=>{for(const f of o.sets_flags??[])flags.add(f);if(o.done_flag)flags.add(o.done_flag);});
for(const p of pack.platzierung)if(p.interactable)objects.add(p.interactable.id);
for(const f of ['quests','dialogues','items','encounters','npcs'])for(const id of Object.keys(pack[f]))check(id.startsWith('k3p_')||(f==='npcs'&&id==='k3_weichenstellerin'),`Fremde Definition ${f}/${id}`);
for(const d of Object.values(pack.dialogues)){
 for(const id of Object.keys(d.nodes))check(id.startsWith('k3p_'),`Knotenpräfix ${id}`);
 const starts=typeof d.start==='string'?[d.start]:d.start.map(x=>x.node);
 for(const id of starts)check(!!d.nodes[id],`Start fehlt ${id}`);
 const seen=new Set();function visit(id){if(seen.has(id)||!d.nodes[id])return;seen.add(id);for(const c of d.nodes[id].choices??[])if(c.next){check(!!d.nodes[c.next],`next fehlt ${c.next}`);visit(c.next);}}starts.forEach(visit);
 for(const id of Object.keys(d.nodes))check(seen.has(id),`Unerreichbarer Knoten ${id}`);
}
walk(pack,o=>{
 for(const f of o.requires_flags??[])if(f.startsWith('won_'))ref(encounters,f.slice(4),contractEncounters);else ref(flags,f,contractFlags);
 for(const f of o.sets_flags??[])check(f.startsWith('k3p_'),`Fremdes Flag gesetzt ${f}`);
 if(o.done_flag)check(o.done_flag.startsWith('k3p_'),`Fremdes done_flag ${o.done_flag}`);
 if(o.map)ref(maps,o.map,contractMaps);
 for(const m of o.also_maps??[])ref(maps,m,contractMaps);
 if(o.npc)ref(npcs,o.npc);
 if(o.dialogue)ref(dialogues,o.dialogue);
 if(o.encounter)ref(encounters,o.encounter);
 for(const field of ['gives_items','takes_items','consumes'])for(const id of Object.keys(o[field]??{}))ref(items,id);
 for(const field of ['requires_items','hide_if_items'])for(const id of o[field]??[])ref(items,id);
 for(const field of ['start_quests','complete_quests','requires_quests_active','requires_quests_done','hide_if_quests'])for(const id of o[field]??[])ref(quests,id);
 if(o.target)check(npcs.has(o.target.id)||objects.has(o.target.id),`Zielobjekt fehlt ${o.target.id}`);
 if(o.requires_pathway){const pid=Array.isArray(o.requires_pathway)?o.requires_pathway[0]:o.requires_pathway;check(!!af[pid],`Pfad fehlt ${pid}`);}
});
for(const p of pack.platzierung){check(p.tile.length===2&&p.tile.every(Number.isInteger),'Tile ungültig');if(p.interactable)check(p.interactable.id.startsWith('k3p_'),'Objektpräfix fehlt');}
check(Object.keys(pack.quests).length===20,'Erwartet 20 Quests');check(Object.keys(pack.encounters).length===10,'Erwartet 10 Kämpfe');
check(Object.keys(pack.rituale).length===10,'Erwartet 10 Ritualpfade');
check(JSON.stringify(Object.keys(ingredients).sort())===JSON.stringify(Object.keys(pack.zutaten_herkunft).sort()),'Zutatenherkunft unvollständig oder überzählig');
for(const [id,o] of Object.entries(pack.zutaten_herkunft)){
 check(Object.keys(o).sort().join()===['quelle','id','chance','requires_pathway','friedlich'].sort().join(),`Herkunftsschema ${id}`);
 check(o.chance===1,`Ungarantierte Zutat ${id}`);
 const seq=Number(id.at(-1)),pid=o.requires_pathway,short=pid.replace(/^sq_/,'');check(id===`sq_zutat_${short}_${seq}`,`Falscher Pfad ${id}`);
 const expected={5:'schwellenhund',3:'vorhauer',2:'vielrufer',1:'unterschicht'}[seq];if(expected)check(o.id===expected,`Falscher Boss ${id}`);
 if(['boss','pruefung'].includes(o.quelle))ref(encounters,o.id,contractEncounters);else if(o.quelle==='gebiet')ref(maps,o.id);else if(o.quelle==='haendler')ref(npcs,o.id);else check(false,`Unbekannte Quelle ${id}`);
 if(o.friedlich)ref(flags,o.friedlich,contractFlags);
}
for(const [pid,rs] of Object.entries(pack.rituale)){
 check(Object.keys(rs).sort().join()==='1,2,3,4',`Ritualstufen ${pid}`);
 for(const [seq,r] of Object.entries(rs)){
 check(!r.map.startsWith('neu:'),`Platzhalterkarte ${pid}/${seq}`);
 check(r.map.startsWith('ds_')||r.map.startsWith('wx_'),`Falsche Stadt ${pid}/${seq}`);
 check(r.consumes.nebeltau===2&&r.consumes.silberstaub===5-Number(seq),`Verbrauch ${pid}/${seq}`);
 if(seq==='1')check(r.requires.requires_flags.includes('kapitel3_done'),`Kapitelgate fehlt ${pid}`);
 if(seq==='3')check(r.also_maps.includes('ds_speisewagen'),`Rückweg fehlt ${pid}`);
 }
 const short=pid.replace(/^sq_/,''),pre=`k3p_${short}`,q=`${pre}_pruefung`,rq=`k3p_ritual1_${pid}`;
 check(pack.quests[q].steps.length===4,`Prüfungsschritte ${pid}`);check(pack.quests[rq].steps.length===3,`Ritualschritte ${pid}`);
 const d=pack.dialogues[`${pre}_probe_dialog`], hedda=pack.dialogues.k3p_hedda;
 const claim=hedda.nodes.k3p_start.choices.find(c=>c.next===`${pre}_belohnung`);
 check(claim.requires_pathway[0]===pid&&claim.hide_if_flags.includes(`${pre}_done`),`Auszahlungssperre ${pid}`);
 const gate=hedda.nodes[`${pre}_pfad`].choices[0];check(gate.requires_pathway[1]===5&&gate.hide_if_quests.includes(q),'Prüfungszugang');
 // Minimaler Vertragslauf mit getrennten Zuständen für beide Auflösungen.
 for(const route of ['friedlich','kampf']){
 const s={flags:new Set(),inventory:{},money:0,active:new Set([q])};
 const apply=n=>{for(const f of n.sets_flags??[])s.flags.add(f);for(const [i,v] of Object.entries(n.gives_items??{}))s.inventory[i]=(s.inventory[i]??0)+v;s.money+=n.gives_money??0;for(const q of n.complete_quests??[])s.active.delete(q);};
 const allowed=c=>(c.requires_flags??[]).every(f=>s.flags.has(f))&&(c.hide_if_flags??[]).every(f=>!s.flags.has(f))&&(c.requires_quests_active??[]).every(q=>s.active.has(q));
 check(!allowed(claim),`Vorzeitige Auszahlung ${pid}`);
 if(route==='friedlich')apply(d.nodes.k3p_frieden);else apply(pack.encounters[d.nodes.k3p_kampf.encounter].on_win);
 check(allowed(claim),`Kein Abschluss ${pid}/${route}`);apply(hedda.nodes[claim.next]);
 check(s.inventory[`sq_zutat_${short}_4`]===1&&s.money===25,`Ungleiche Belohnung ${pid}/${route}`);check(!allowed(claim),`Doppelte Auszahlung ${pid}`);
 }
 check(!d.nodes.k3p_irrtum.sets_flags&&!d.nodes.k3p_irrtum.gives_items,`Fehlantwort belohnt ${pid}`);
 const rg=hedda.nodes.k3p_start.choices.find(c=>c.next===`${pre}_ritual1_start`);check(rg.requires_flags.includes('kapitel3_done')&&rg.requires_pathway[1]===2,`Seq1-Zugang ${pid}`);
 const reward=hedda.nodes.k3p_start.choices.find(c=>c.next===`${pre}_ritual1_reward`);check(reward.requires_flags.includes(`ritual_${pid}_1`),'Ritualabschluss fehlt');
 check(!rs['1'].requires.requires_flags.includes(`${pre}_ritual1_paid`),'Zirkuläres Ritual');
}
for(const [id,e] of Object.entries(pack.encounters)){
 check(e.hp>=170&&e.hp<=220,`HP-Korridor ${id}`);
 for(const a of e.attacks)if(a.damage!==undefined)check(a.damage>=10&&a.damage<=14&&[1,2].includes(a.hits.length),`Schadenskorridor ${id}`);
 check(e.fleeable&&e.lose_to.map==='ds_speisewagen',`Rückweg ${id}`);check(!e.on_win.gives_items,`Doppelte Kampfbeute ${id}`);
}
if(process.argv.includes('--strict'))for(const id of pending)failures.push(`Integration fehlt: ${id}`);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else{
 assert.equal(files.length,10);
 console.log('OK: 10 JSON-Dateien; 20 Quests; 10 Prüfungsbosse; 40 Rituale; 55/55 Zutaten.');
 console.log('OK: Dialogziele, ID-Präfixe, Referenzen, gesetzte Flags, Pfad-/Kapitelgates und Verbrauch.');
 console.log('OK: 20 Abschlussläufe (10 friedlich + 10 Kampf), einmalige gleiche Auszahlung; Seq-1 ohne Zirkelschluss.');
 console.log(`OFFEN: ${pending.size} dokumentierte Integrationsverweise (AR/AS/Adapter): ${[...pending].sort().join(', ')}`);
 console.log('Keine Live-Integration oder Kampfbalancing-Abnahme; --strict verlangt vorhandene Fremdverträge.');
}
