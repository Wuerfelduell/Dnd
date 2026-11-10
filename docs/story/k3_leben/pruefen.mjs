import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { loadContent, talk } from '../../../tests/helpers.js';
import { GameState } from '../../../src/core/GameState.js';
import { Combat } from '../../../src/core/Combat.js';

const pkgDir = new URL('../../../src/data/packs/k3_leben/', import.meta.url); // seit dem Einbau liegen die Daten im Spielpaket
const read = name => JSON.parse(readFileSync(new URL(`${name}.json`, pkgDir), 'utf8'));
const names = readdirSync(pkgDir).filter(f => f.endsWith('.json')).map(f => f.slice(0,-5));
const data = Object.fromEntries(names.map(n => [n, read(n)]));
const base = loadContent({ without: ['k3_leben'] }); // Bestand ohne das Paket: für Kollisions- und Belegungsvergleich
const c = loadContent(); // der echte Spielinhalt mit dem Paket (buildContent: Stadtgegner, Einwohner, Streifen, Leben)
const city = data.stadtgegner_dunscar;
function walk(v, fn) { if (!v || typeof v !== 'object') return; if (!Array.isArray(v)) fn(v); for (const x of Object.values(v)) walk(x, fn); }
const own = ['quests','items','npcs','dialogues'];
for (const k of own) for (const id of Object.keys(data[k])) assert.ok(!base[k][id], `Überschreibt ${k}:${id}`);
for (const id of Object.keys({...city.encounters,...data.phasen})) { assert.ok(!base.encounters[id], `Fremder Kampf ${id}`); assert.ok(c.encounters[id] && (c.loot[id] || data.phasen[id]), `Kampf ${id} geladen`); }
assert.ok(c.encounters.k3k_staubschmuggler_elite?.elite, 'Elite-Fassung aus dem Dunscar-Stadtausschnitt');
const flags = new Set();
walk(c, o => { for (const f of o.sets_flags??[]) flags.add(f); if (o.done_flag) flags.add(o.done_flag); });
for (const id of Object.keys(c.encounters)) flags.add('won_'+id);
walk(data, o => { for(const f of o.sets_flags??[]) flags.add(f); if(o.done_flag) flags.add(o.done_flag); });
let refs=0;
function ref(type,id) { refs++; assert.ok(c[type]?.[id], `${type}: unbekannt ${id}`); }
const objects = {};
for (const [mid,m] of Object.entries(c.maps)) objects[mid] = new Set([...(m.npcs??[]).map(n=>n.id),...(m.interactables??[]).map(o=>o.id),...(m.roamers??[]).map(o=>o.encounter)]);
for (const [mid,rs] of Object.entries(city.roamers)) for(const r of rs) objects[mid].add(r.encounter);
walk(data,o=>{
  assert.ok(!('platzhalter' in o),'Platzhalterfeld in Spieldaten');
  for(const key of ['requires_flags','hide_if_flags']) for(const f of o[key]??[]) { refs++; assert.ok(flags.has(f),`Unproduziertes Flag ${f}`); }
  for(const f of o.sets_flags??[]) assert.match(f,/^(k3e_|k3k_|won_kopfgeld_ds_)/,`Fremdes Flag wird geschrieben: ${f}`);
  if(typeof o.map==='string')ref('maps',o.map);
  if(o.dialogue)ref('dialogues',o.dialogue);
  if(o.encounter)ref('encounters',o.encounter);
  if(o.combat)ref('encounters',o.combat);
  if(typeof o.npc==='string')ref('npcs',o.npc);
  if(o.requires_pathway)ref('pathways',Array.isArray(o.requires_pathway)?o.requires_pathway[0]:o.requires_pathway);
  for(const k of ['requires_items','hide_if_items'])for(const id of o[k]??[])ref('items',id);
  for(const k of ['gives_items','takes_items'])for(const id of Object.keys(o[k]??{}))ref('items',id);
  if(o.item)ref('items',o.item);
  for(const k of ['start_quests','complete_quests','requires_quests_active','hide_if_quests'])for(const id of o[k]??[])ref('quests',id);
  if(o.target){ref('maps',o.target.map);assert.ok(objects[o.target.map].has(o.target.id),`Ziel fehlt: ${o.target.id}`);}
  if(o.lose_to){ref('maps',o.lose_to.map);assert.ok(c.maps[o.lose_to.map].spawns[o.lose_to.spawn]);}
  if(o.text)assert.ok(o.text.trim().split(/\s+/u).length<=90,'Lesetext über 90 Wörter');
});
// Alle Dialogknoten müssen über einen echten Start erreichbar sein; unbekannte Felder vermeiden.
let nodeCount=0;
const nodeFields=new Set(['text','choices','sets_flags','start_quests','complete_quests','gives_money','takes_money','gives_items','takes_items','honor','nerves','combat']);
const choiceFields=new Set(['text','next','requires_flags','hide_if_flags','requires_items','requires_money','requires_pathway','requires_quests_active','hide_if_quests']);
for(const [id,d] of Object.entries(data.dialogues)) {
  const seen=new Set(),todo=[d.start];
  while(todo.length){const n=todo.pop();if(seen.has(n))continue;seen.add(n);assert.ok(d.nodes[n],`${id}: Knoten ${n}`);for(const ch of d.nodes[n].choices??[])if(ch.next)todo.push(ch.next);}
  assert.equal(seen.size,Object.keys(d.nodes).length,`${id}: unerreichbare Knoten`);
  for(const n of Object.values(d.nodes)){nodeCount++;for(const k of Object.keys(n))assert.ok(nodeFields.has(k),`Knotenfeld ${k}`);for(const ch of n.choices??[])for(const k of Object.keys(ch))assert.ok(choiceFields.has(k),`Optionsfeld ${k}`);}
}
const board=data.dialogues.kopfgeldbrett_ds;
const started=new Set();walk(board,o=>{for(const q of o.start_quests??[])started.add(q);});
assert.deepEqual([...started].sort(),Object.keys(data.quests).sort());
assert.equal(started.size,6);assert.equal(Object.keys(city.encounters).length,6);
assert.equal(Object.keys(data.npcs).length,8);assert.equal(data.einwohner.length,24);
assert.equal(Object.values(data.gerede.dunscar).flat().length,80);
assert.equal(data.zeitung.length,26);assert.equal(new Set(data.zeitung.map(x=>x.id)).size,26);
assert.equal(data.zeitung.filter(x=>x.title.startsWith('Anzeige:')).length,6);
for(const z of data.zeitung){assert.equal(z.zeitung,'dunscarer_kalkblatt');assert.ok(Array.isArray(z.kurz));}
assert.ok(base.newspapers.some(n=>n.zeitung==='dunscarer_kalkblatt'));
assert.equal(Object.values(data.dialogues).flatMap(d=>Object.keys(d.nodes)).filter(n=>/^akt[1-5]_[1-6]$/.test(n)).length,240);

// Prüfen gegen alle bereits eingebauten Pakete, nicht nur rohe AS-Karten.
const used=new Map();const observed=new Map();let positions=0;
for(const [mid,m] of Object.entries(base.maps)){
 const set=new Set();for(const k of ['npcs','interactables','roamers','decor','lights'])for(const e of m[k]??[])if(e.tile)set.add(e.tile.join(','));
 for(const t of Object.values(m.spawns??{}))set.add(t.join(','));used.set(mid,set);
}
function place(mid,tile,owner) {
 ref('maps',mid);assert.ok(Array.isArray(tile)&&tile.length===2);const [x,y]=tile;
 assert.ok(Number.isInteger(x)&&Number.isInteger(y));const rows=base.maps[mid].rows;
 assert.ok(y>=0&&y<rows.length&&x>=0&&x<rows[y].length,`${mid}: außerhalb ${tile}`);
 // dsTheme() in WorldScene: . s g w sind die vier Bodenzeichen, I ist Mauer.
 assert.match(base.maps[mid].tiles,/^ds_/);assert.ok('.sgw'.includes(rows[y][x]),`${mid}: Kollision ${tile}`);
 assert.ok(!used.get(mid).has(tile.join(',')),`${mid}: belegte Bestandskachel ${tile}`);
 const key=mid+':'+tile.join(',');assert.ok(!observed.has(key)||observed.get(key)===owner,`${key}: ${owner} kollidiert mit ${observed.get(key)}`);observed.set(key,owner);positions++;
 // Freier Fußweg vom regulären Karteneingang zur vorgeschlagenen Kachel.
 const start=base.maps[mid].spawns.default, todo=[start], seen=new Set();
 while(todo.length){const [a,b]=todo.pop();const k=`${a},${b}`;if(seen.has(k))continue;seen.add(k);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=a+dx,yy=b+dy;if(rows[yy]?.[xx]&&'.sgw'.includes(rows[yy][xx])&&!seen.has(`${xx},${yy}`))todo.push([xx,yy]);}}
 assert.ok(seen.has(tile.join(',')),`${mid}: kein Fußweg zu ${tile}`);
}
for(const p of data.platzierung)place(p.map,p.tile,p.npc??p.interactable.id);
for(const e of data.einwohner){ref('npcs',e.id);for(const v of Object.values(e.zeit))if(v)place(v.map,v.tile,e.id);}
for(const [mid,rs]of Object.entries(city.roamers))for(const [i,r]of rs.entries())place(mid,r.tile,r.encounter+'_'+i);
for(const [mid,rs]of Object.entries(data.streifen.patrols))for(const r of rs){for(const t of r.route)place(mid,t,r.id);assert.equal(r.zeit.tag,null);}
assert.equal(Object.values(data.streifen.patrols).flat().length,2);
const stands=data.platzierung.filter(p=>p.interactable?.kind==='read');assert.equal(stands.length,10);assert.equal(stands.filter(p=>p.map==='ds_kalkmarkt').length,6);
assert.deepEqual(Object.keys(data.leben).sort(),Object.keys(base.maps).filter(m=>m.startsWith('ds_')).sort());
for(const [mid,l]of Object.entries(data.leben)){
 for(const w of l.weather)assert.ok(['kalkstaub','wind','nachtnebel'].includes(w));
 for(const [a,n]of Object.entries(l.animals)){assert.ok(['ds_kraehe','ds_kalkziege','ds_staubteufel','ds_motte','ds_eidechse','ds_schwalbe'].includes(a));assert.ok(Number.isInteger(n)&&n>0);}
 if(['ds_speisewagen','ds_runddepot','ds_pruefhaus','ds_teesaal','ds_lohnbuero','ds_nachtzug_wagen','ds_nachtzug_lok','ds_rufschlucht'].includes(mid))assert.deepEqual(l,{weather:[],animals:{}});
}
assert.equal(data.leben.ds_bruchstufen.animals.ds_kalkziege,3);assert.deepEqual(data.leben.ds_unterschicht,{weather:['nachtnebel'],animals:{}});

function state(act=1,end=null,boss=false){const s=new GameState(c);s.money=500;s.flags.add('k3_arrived');for(let i=1;i<act;i++)s.flags.add(`k3a_akt${i}_done`);if(end){s.flags.add('kapitel3_done');s.flags.add('k3a_akt5_done');s.flags.add('k3a_end_'+end);}if(boss)s.flags.add('k3o_unterschicht_geloest');return s;}
const scenarios=[...Array.from({length:5},(_,i)=>({act:i+1})),...['feierabend','stilllegung','gegenstimme','vollzaehlig'].flatMap(end=>[{act:5,end},{act:5,end,boss:true}])];
for(const sc of scenarios){const s=state(sc.act,sc.end,sc.boss);
 const residents=data.einwohner.filter(e=>s.meets(e.visible_if));assert.equal(residents.length,8,JSON.stringify(sc));assert.equal(new Set(residents.map(e=>e.id)).size,8);
 assert.equal(Object.values(data.gerede.dunscar).flat().filter(g=>s.meets(g)).length,8);
 for(const e of residents){assert.ok(e.zeit.tag);if(sc.end==='vollzaehlig')assert.equal(e.zeit.nacht,null);if(['k3e_wagenputzer','k3e_steinmetzgeselle'].includes(e.id)){if(sc.end&&sc.end!=='vollzaehlig')assert.equal(e.zeit.nacht.map,'ds_arbeiterbogen');else if(sc.act>=4)assert.equal(e.zeit.nacht,null);}}
 const shifts=Object.values(city.roamers).flat().filter(r=>r.encounter==='schichtgaenger'&&s.meets(r.visible_if));assert.equal(shifts.length,!sc.end&&sc.act>=4?2:0);
 const paper=c.dialogues.k3e_zeitungsfrau.nodes.start.choices.filter(ch=>ch.next?.startsWith('ausgabe_')&&s.meets(ch));assert.equal(paper.length,1,`Ausgabe ${JSON.stringify(sc)}`);
}
// Akt V zwischen abgeschlossener Fährte und Endentscheidung darf nicht verstummen.
{const s=state(5);s.flags.add('k3a_akt5_done');assert.equal(Object.values(data.gerede.dunscar).flat().filter(g=>s.meets(g)).length,8);}
const available=(s,text)=>board.nodes.start.choices.filter(ch=>ch.text.startsWith(text)&&s.meets(ch));
function take(s,f){talk(s,'kopfgeldbrett_ds',['Steckbrief: '+city.encounters['k3k_'+f].name,'Auftrag übernehmen.','Zurück zum Brett.']);}
// Kein Kampf wird als gespielt vorgetäuscht: diese Prüfungen injizieren Ergebnisse,
// prüfen anschließend die echten Combat.finish-/GameState-Effekte, nicht das Timing/Balancing.
function outcome(s,id,result){const battle=new Combat(s,id);battle.outcome=result;return battle.finish();}
const payouts=[45,50,55,60,65,80];let chains=0;
for(const [i,f]of ['kupferdieb','schienenlaeufer','lohnfaelscher','staubschmuggler','walzenhehler','signalbrecher'].entries()){
 const q='kopfgeld_ds_'+f,id='k3k_'+f,trophy=id+'_trophaee';const s=state(4);take(s,f);assert.equal(s.quests[q],'active');
 assert.ok(!available(s,'Kopfgeld kassieren:').length);
 for(const result of ['fled','lost']){outcome(s,id,result);assert.ok(!s.flags.has('won_'+q));assert.equal(s.itemCount(trophy),0);assert.equal(s.quests[q],'active');}
 outcome(s,id,'won');
 if(f==='signalbrecher'){
  assert.ok(!s.flags.has('won_'+q));assert.equal(s.itemCount(trophy),0);assert.ok(!available(s,'Kopfgeld kassieren:').length);
  talk(s,'k3k_signalbrecher_fortsetzen',['Den zweiten Geber']);assert.equal(s.pendingCombat,'k3k_signalbrecher_phase2');s.pendingCombat=null;
  outcome(s,'k3k_signalbrecher_phase2','lost');assert.ok(!s.flags.has('won_'+q));
  outcome(s,'k3k_signalbrecher_phase2','won');
 }
 assert.equal(s.itemCount(trophy),1);assert.equal(available(s,'Kopfgeld kassieren:').length,1);const before=s.money;
 talk(s,'kopfgeldbrett_ds',['Kopfgeld kassieren: '+city.encounters[id].name,'Zurück zum Brett.']);
 assert.equal(s.money-before,payouts[i]);assert.equal(s.itemCount(trophy),0);assert.equal(s.quests[q],'done');
 assert.ok(!available(s,'Kopfgeld kassieren:').length);assert.throws(()=>take(s,f),/keine verfügbare Option/);
 assert.equal(s.money,before+payouts[i]);chains++;
}
// Friedlicher Weg nur Faden <=7; gleicher Abschluss ohne Gewalt, nicht wiederholbar.
for(const [path,seq,ok] of [['faden',7,true],['faden',6,true],['faden',8,false],['eisen',5,false]]){
 const s=state(2);s.pathway={id:path,seq,digestion:0};take(s,'lohnfaelscher');
 if(!ok){assert.throws(()=>talk(s,'k3k_lohnfaelscher',['Verknüpfungen']),/keine verfügbare Option/);continue;}
 talk(s,'k3k_lohnfaelscher',['Verknüpfungen']);assert.ok(s.flags.has('won_kopfgeld_ds_lohnfaelscher'));assert.equal(s.itemCount('k3k_lohnfaelscher_trophaee'),1);assert.equal(s.pendingCombat,null);
 assert.throws(()=>talk(s,'k3k_lohnfaelscher',['Verknüpfungen']),/keine verfügbare Option/);
 const b=s.money;talk(s,'kopfgeldbrett_ds',['Kopfgeld kassieren: Lohnfälscher']);assert.equal(s.money-b,55);
}
{const s=state(3);take(s,'staubschmuggler');outcome(s,'k3k_staubschmuggler_elite','won');assert.ok(s.flags.has('won_kopfgeld_ds_staubschmuggler'));assert.equal(s.itemCount('k3k_staubschmuggler_trophaee'),1);assert.equal(city.roamers.ds_kalkmarkt[0].elite_chance,0.2);assert.ok(!s.meets(city.roamers.ds_kalkmarkt[0].visible_if));}
{const s=state();s.money=2;s.composure=40;assert.throws(()=>talk(s,'k3e_schichtwitwe',['Kartoffeln essen']),/keine verfügbare Option/);s.money=9;talk(s,'k3e_schichtwitwe',['Kartoffeln essen']);assert.equal(s.money,6);assert.equal(s.composure,45);talk(s,'k3e_schichtwitwe',['Kartoffeln essen']);assert.equal(s.money,3);assert.equal(s.composure,50);}
{const s=state();talk(s,'k3e_kalkjunge',['Nische zeigen']);assert.ok(s.flags.has('k3e_nische_ds_schwellenring'));assert.throws(()=>talk(s,'k3e_kalkjunge',['Nische zeigen']),/keine verfügbare Option/);}
{const s=state();assert.throws(()=>talk(s,'k3e_bahnbettler',['Schichttee gegen']),/keine verfügbare Option/);s.addItem('k3o_schichttee',1);talk(s,'k3e_bahnbettler',['Schichttee gegen']);assert.equal(s.itemCount('k3o_schichttee'),0);assert.ok(s.flags.has('k3e_tee_getauscht'));}
{const s=state();const before=s.money;talk(s,'k3e_zeitungsfrau',['Aktuelle Ausgabe']);assert.equal(s.money,before-1);assert.equal(s.itemCount('k3e_ausgabe_1'),1);assert.throws(()=>talk(s,'k3e_zeitungsfrau',['Aktuelle Ausgabe']),/keine verfügbare Option/);s.flags.add('k3a_akt1_done');talk(s,'k3e_zeitungsfrau',['Aktuelle Ausgabe']);assert.equal(s.itemCount('k3e_ausgabe_2'),1);}
console.log(`BD OK: ${names.length} JSON-Dateien; ${refs} Referenzen; ${nodeCount} erreichbare Dialogknoten.`);
console.log(`BD OK: ${positions} Positionsprüfungen; alle begehbar, vom Eingang erreichbar und ohne Bestandskollision.`);
console.log('BD OK: 8 Einwohner; 13 Storyzustände; 240 Aktvarianten + 40 Nachgespräche; genau 80 Gerede-Einträge.');
console.log(`BD OK: ${chains}/6 Kopfgeldketten; Auszahlung exakt einmal; Flucht/Niederlage ohne Fortschritt; Faden-Alternative, Elite und zwei Phasen geprüft.`);
console.log('BD OK: 26 Zeitungseinträge; 10 Stände; 18 Lebenszuordnungen; 2 nächtliche Aufseher; Dienste und Ausgabekäufe geprüft.');
console.log('EINGEBAUT: Tag/Nacht über k3h_nacht (Clock.js), Aufseher-Sichtkontakt (Patrols.js), Gegnerflucht nach Runde 3 (flees_after), BE/BA-Grafik. OFFEN: Nachhall-Begleiter des Walzenhehlers, Zeitungs-Snapshot gekaufter Ausgaben.');
