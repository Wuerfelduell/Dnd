import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(dir,'../../..');
const allowPending=process.argv.includes('--allow-pending');
const errors=[], pending=[];
const check=(v,m)=>{if(!v)errors.push(m)};
// Parse JSON with duplicate-key rejection, including escaped spellings of the same key.
function parseStrict(s){
 let i=0; const ws=()=>{while(/\s/.test(s[i]??'')&&i<s.length)i++};
 function str(){const start=i++;while(i<s.length){if(s[i]==='\\'){i+=2;continue}if(s[i++]==='"')return JSON.parse(s.slice(start,i))}throw Error('Unvollständige Zeichenfolge')}
 function value(){ws();if(s[i]==='{'){i++;ws();const seen=new Set();if(s[i]==='}'){i++;return}while(i<s.length){ws();if(s[i]!== '"')throw Error('Schlüssel erwartet');const k=str();if(seen.has(k))throw Error('Doppelter JSON-Schlüssel: '+k);seen.add(k);ws();if(s[i++]!==':')throw Error('Doppelpunkt erwartet');value();ws();const c=s[i++];if(c==='}')return;if(c!==',')throw Error('Komma erwartet')}}else if(s[i]==='['){i++;ws();if(s[i]===']'){i++;return}while(i<s.length){value();ws();const c=s[i++];if(c===']')return;if(c!==',')throw Error('Komma erwartet')}}else if(s[i]==='"')str();else {const m=s.slice(i).match(/^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/);if(!m)throw Error('Wert erwartet');i+=m[0].length}}
 value();ws();if(i!==s.length)throw Error('Rest hinter JSON');return JSON.parse(s);
}
const cache=new Map();
function sourceBytes(p){const pin=pins.get(p);if(pin){check(/^[a-f0-9]{40}$/.test(pin),'Ungültiger Quellcommit');return execFileSync('git',['show',pin+':'+p],{cwd:root,maxBuffer:32*1024*1024})}return fs.readFileSync(path.join(root,p))}
function read(p){if(!cache.has(p))cache.set(p,parseStrict(sourceBytes(p).toString('utf8')));return cache.get(p)}
const files=fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort(), data={};
for(const f of files){try{data[f]=parseStrict(fs.readFileSync(path.join(dir,f),'utf8'))}catch(e){errors.push(f+': '+e.message)}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
function* walk(v,p=[]){yield [p,v];if(v&&typeof v==='object')for(const[k,x]of Object.entries(v))yield*walk(x,[...p,k])}
const ownIds=new Set();
for(const [f,d]of Object.entries(data))for(const[p,v]of walk(d)){
 if(typeof v==='string'&&p.at(-1)!=='pointer')check(v.trim().length>0,`${f}/${p.join('/')}: leere Zeichenfolge`);
 if(v&&typeof v==='object'&&!Array.isArray(v)&&v.id&&!p.includes('source_target')){
  check(/^[a-z0-9_]+$/.test(v.id),'Ungültige ID '+v.id);check(!ownIds.has(v.id),'Doppelte ID '+v.id);ownIds.add(v.id);
 }
}
const q=data['quellen.json'];const pins=new Map(q.gelesen.filter(f=>f.commit).map(f=>[f.path,f.commit]));const known=new Set(q.referenzen.map(r=>r.kind+':'+r.value));const declared=new Set(q.offene_definitionen.map(r=>r.kind+':'+r.value));
function ptr(d,p){return p.split('/').slice(1).reduce((a,k)=>a?.[k.replaceAll('~1','/').replaceAll('~0','~')],d)}
for(const r of q.referenzen){try{const v=ptr(read(r.source),r.pointer);check(v!==undefined,'Fehlende Definition '+r.value);if(['flag','ending'].includes(r.kind))check(v===r.value,'Falsche Quelldefinition '+r.value);else check(typeof v==='object'&&v!==null,'Definition ist kein Objekt '+r.value)}catch(e){errors.push(r.source+': '+e.message)}}
for(const f of q.gelesen){try{const hash=crypto.createHash('sha256').update(sourceBytes(f.path)).digest('hex');check(hash===f.sha256,'Quelle geändert, neu abgleichen: '+f.path)}catch(e){errors.push('Quelle fehlt: '+f.path)}}
// Pending references require an actual structured definition before they can be cleared.
for(const r of q.offene_definitionen){pending.push(`${r.kind} ${r.value} -> ${r.expected_source}`)}
for(const p of q.offene_dateien)if(!fs.existsSync(path.join(root,p)))pending.push('Datei '+p);
function ref(kind,id,where){if(id?.startsWith('np_')&&kind==='npc')return;check(known.has(kind+':'+id)||declared.has(kind+':'+id),`Nicht inventarisierter ${kind}-Verweis ${id} in ${where}`)}
for(const[f,d]of Object.entries(data)){
 if(f==='quellen.json')continue;
 for(const[p,v]of walk(d)){
  const key=p.at(-1);
  if(['npc','map','quest','path'].includes(key)&&typeof v==='string')ref(key==='path'?'path':key,v,f+'/'+p.join('/'));
  if(key==='speaker'&&typeof v==='string'&&!v.startsWith('np_'))ref('npc',v,f+'/'+p.join('/'));
  if(['item','furniture'].includes(key)&&typeof v==='string')ref(key,v,f+'/'+p.join('/'));
  if(key==='reaction_ref')ref('entry',v,f+'/'+p.join('/'));
  if(key==='verbrennen_house_map')ref('map',v,f+'/'+p.join('/'));
  if(['requires_flags','any_flags','hide_if_flags'].includes(key)&&Array.isArray(v))for(const flag of v)if(!flag.startsWith('np_'))ref('flag',flag,f+'/'+p.join('/'));
 }
}
const states=data['zustaende.json'], conv=data['gespraeche.json'], threads=data['offene_faeden.json'], travel=data['reise.json'], finish=data['abschluss.json'], wiring=data['anschluss.json'];
const cities=['kettlegate','wexmoor','dunscar','calderwick','briarholt','varrowmouth'];
check(states.length===16,'16 Zustände erforderlich');check(states.reduce((n,s)=>n+s.gerede.length,0)===160,'160 Geredezeilen erforderlich');
for(const s of states){check(s.id===`nachspiel_${s.city}_${s.zustand}`,'Zustands-ID '+s.id);check(s.gerede.length===10,'Geredezahl '+s.id);check(new Set(s.gerede).size===10,'Doppeltes Gerede '+s.id);const n=s.ankunft.match(/[.!?](?:\s|$)/g)?.length??0;check(n>=4&&n<=6,'Ankunft 4–6 Sätze '+s.id);check(s.nacht.nachspiel_sprechstunde==='06_18','Nachtregel fehlt '+s.id)}
for(const city of cities){const ds=conv.gespraeche.filter(d=>d.city===city);check(ds.filter(d=>d.kind==='haupt').length===3,'Hauptgespräche '+city);check(ds.filter(d=>d.kind==='neben').length===6,'Nebengespräche '+city);check(conv.koop.filter(d=>d.city===city).length===1,'Koop '+city)}
let routeCount=0;
for(const d of conv.gespraeche){
 const seen=new Set(), lengths=[];let decisions=0;
 for(const[k,n]of Object.entries(d.nodes)){if(n.choices){decisions++;check(n.choices.length===2,'Zwei Entscheidungen '+d.id)}if(n.text_by_state)check(JSON.stringify(Object.keys(n.text_by_state).sort())===JSON.stringify(states.filter(s=>s.city===d.city).map(s=>s.id).sort()),'Zustandsvarianten '+d.id);if(n.text_by_ending){const g=wiring.start.ende_gruppen[d.city];check(JSON.stringify(Object.keys(n.text_by_ending).sort())===JSON.stringify((g.ending_ids??g.values).slice().sort()),'Endvarianten '+d.id)}}
 function visit(k,trail=[]){check(!!d.nodes[k],`Dialogziel ${d.id}/${k}`);if(!d.nodes[k])return;if(trail.includes(k)){errors.push('Dialogzyklus '+d.id);return}seen.add(k);const n=d.nodes[k],targets=n.choices?n.choices.map(x=>x.next):n.next?[n.next]:[];if(!targets.length)lengths.push(trail.length+1);for(const x of targets)visit(x,[...trail,k])}
 visit(d.start);check(seen.size===Object.keys(d.nodes).length,'Unerreichbare Knoten '+d.id);check(decisions===(d.kind==='haupt'?1:0),'Entscheidungsknoten '+d.id);for(const n of lengths)check(d.kind==='haupt'?n>=10&&n<=16:n>=4&&n<=6,'Pfadlänge '+d.id);routeCount+=lengths.length;
}
const packs=['kg_nebenquests','wx_nebenquests','k3_nebenquests','k4_nebenquests','k5_nebenquests','k3_pruefungen'];
for(const pack of packs){const source=read(`src/data/packs/${pack}/quests.json`);for(const[id,def]of Object.entries(source)){const found=threads.bestand.filter(x=>x.quest===id);check(found.length===1,'Bestandsauftrag fehlt/doppelt '+id);if(found[0])check(JSON.stringify(found[0].abgeschlossen_wenn)===JSON.stringify(def.steps.at(-1).done),'Abschlussbedingung verändert '+id)}}
check(threads.bestand.length===90,'90 offene Fäden');check(threads.neu.length===6,'6 neue Aufträge');
for(const c of cities)check(threads.neu.filter(x=>x.city===c).length===1,'Neuer Auftrag '+c);
for(const t of threads.neu){check(t.steps.length===3,'Drei Schritte '+t.id);check(t.reward.gives_money===0&&t.reward.quantity===1,'Belohnung '+t.id);check(t.reward.once_flag===t.id+'_bezahlt','Einmalsperre '+t.id);for(let i=0;i<3;i++)check(t.steps[i].sets_flags[0]===t.id+'_schritt_'+(i+1),'Schrittflag '+t.id)}
check(travel.id==='nachspiel_bahn'&&travel.ereignisse.length===6,'Bahn und sechs Ereignisse');check(travel.verbindungen.length===30,'Alle 30 gerichteten Verbindungen');
for(const a of cities)for(const b of cities)if(a!==b)check(travel.verbindungen.filter(x=>x.von===a&&x.nach===b).length===1,'Reise fehlt '+a+'->'+b);
// Exhaustive cross-product of all six chapter endings and the independent state inputs.
function match(r,flags){return (!r.requires_flags?.length||r.requires_flags.every(f=>flags.has(f)))&&(!r.any_flags?.length||r.any_flags.some(f=>flags.has(f)))&&(!r.hide_if_flags?.some(f=>flags.has(f)))&&(!r.alternativen||r.alternativen.some(a=>match(a,flags)))}
const groups=cities.map(c=>wiring.start.ende_gruppen[c].values);let scenarios=0;
function testCombination(selected=[]){if(selected.length<6){for(const e of groups[selected.length])testCombination([...selected,e]);return}for(let bits=0;bits<16;bits++){const flags=new Set(['k6_done',...selected]);['np_fahndung_aufgehoben','np_gilde_zerschlagen','treffen_namensgilde','bha_ventil_hof_offen'].forEach((f,i)=>{if(bits&(1<<i))flags.add(f)});const picked={};for(const c of cities){const candidates=wiring.zustandsregeln.filter(r=>r.city===c&&match(r,flags)).sort((a,b)=>b.priority-a.priority);check(candidates.length===1,`Zustand nicht eindeutig ${c} ${selected} ${bits}`);picked[c]=candidates[0]?.state;check(states.some(s=>s.id===picked[c]),'Fehlender Zustand '+picked[c])}for(const mode of ['solo','koop']){const rendered=finish.abspann.map(x=>mode==='koop'&&x.koop?x.koop:x.text??x.text_by_state?.[picked[x.city]]??x.text_by_ending?.[(wiring.start.ende_gruppen[x.city].ending_ids??groups[cities.indexOf(x.city)])[groups[cities.indexOf(x.city)].indexOf(selected[cities.indexOf(x.city)])]]);check(rendered.length===30&&rendered.every(t=>typeof t==='string'&&t.trim()),'Abspannlücke '+selected)}scenarios++}}
testCombination();
const wc=t=>t.trim().split(/\s+/u).length;const wordRanges=[];
for(const r of finish.lesestuecke){const counts=Object.values(r.zustand_saetze).map(s=>wc(r.text.replace('{zustand_satz}',s)));check((r.text.match(/\{zustand_satz\}/g)??[]).length===1,'Platzhalter '+r.id);check(counts.every(n=>n>=150&&n<=200),'Lesestücklänge '+r.id+': '+counts);wordRanges.push(`${r.city} ${Math.min(...counts)}–${Math.max(...counts)}`)}
check(finish.lesestuecke.length===6&&finish.abspann.length===30&&finish.titelbild.length===6,'Abschlussumfang');
check(finish.ausloeser.sets_flags.includes('nachspiel_abschluss'),'Abschlussflag');
check(wiring.seq1.gesperrte_enden.includes('k6_ende_verbrennen')&&wiring.seq1.gesperrte_enden.includes('k6_ende_teilen'),'Sequenz-1-Sperren');
// Text count excludes identifiers, source metadata, and technical control strings.
const textKeys=new Set(['text','ankunft','empfang_text','abschluss_text','bestaetigung_text','summary','title']);let words=0;
for(const[f,d]of Object.entries(data))if(!['quellen.json','anschluss.json'].includes(f))for(const[p,v]of walk(d))if(typeof v==='string'&&(textKeys.has(p.at(-1))||['gerede','gerede_zusatz','text_by_state','text_by_ending','zustand_saetze'].includes(p.at(-2))||(p.at(-1)==='koop'&&!['beide_bestaetigen'].includes(v))))words+=wc(v);
if(process.argv.includes('--self-test')){
 for(const s of ['{"a":1,"a":2}','{"a":1,"\\u0061":2}']){let rejected=false;try{parseStrict(s)}catch{rejected=true}check(rejected,'Negativtest doppelte Schlüssel')}
 check(!match({requires_flags:['a']},new Set()),'Negativtest fehlendes Flag');check(!match({hide_if_flags:['a']},new Set(['a'])),'Negativtest Ausschluss');
 console.log('PASS: Negativprüfungen für doppelte/escaped Schlüssel und Flag-Bedingungen.');
}
console.log(`INHALT: ${files.length} JSON; 16 Zustände / 160 Gerede; 18 Haupt- und 36 Nebengespräche / 6 Koop.`);
console.log(`INHALT: ${routeCount} vollständige Dialogpfade; 90 Bestandsfäden / 6 neue Aufträge; 6 Reiseereignisse / 30 Verbindungen.`);
console.log(`PRÜFUNG: ${scenarios} Kombinationen; jeweils 30 Solo- und Koop-Abspannzeilen; 6 Titelzeilen.`);
console.log(`WÖRTER Lesestücke: ${wordRanges.join('; ')}.`);console.log(`WÖRTER Spielertexte: ${words} (alle Varianten, einschließlich Titel; ohne README/Steuerdaten).`);
console.log(`QUELLEN: ${q.gelesen.length} gelesene Dateien / ${q.referenzen.length} belegte Referenzen; ${pending.length} offene Definitionen/Dateien.`);
for(const e of errors)console.error('FEHLER: '+e);
for(const p of pending)console.log('OFFEN: '+p);
console.log(errors.length?'FAIL: Inhaltsfehler.':pending.length?'INHALT PASS; QUELLENVOLLSTÄNDIGKEIT BLOCKIERT.':'PASS: Inhalt und Quellen vollständig.');
process.exitCode=errors.length||(!allowPending&&pending.length)?1:0;
