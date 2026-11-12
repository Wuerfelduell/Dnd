#!/usr/bin/env node
// CR is a text package: this validates the editorial contract, not game mechanics.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const files = ['oda', 'gastgeber', 'texte', 'artefakte', 'gerede', 'zeitung', 'lesestuecke'];
const spec = [
  ['rattenkrone','Krone des Rattenkönigs',70,'sieben von zehn'],
  ['sternhirschgeweih','Sternhirsch-Reif',55,'elf von zwanzig'],
  ['geweihreif','Moorkrone',50,'eine von zwei'],
  ['geisterkern','Kernphiole',60,'drei von fünf'],
  ['glasfeder','Glaskiel',75,'drei von vier'],
  ['wachsherz','Schlagendes Herz',65,'dreizehn von zwanzig'],
  ['moorperle','Moorauge',80,'vier von fünf'],
  ['schlickperle','Schlicktropfen',80,'vier von fünf'],
  ['brutschale','Brutschale',60,'drei von fünf'],
  ['moewenglas','Möwenglas',75,'drei von vier'],
  ['irrlichtfunke','Funkenlaterne',70,'sieben von zehn'],
  ['schaedelsplitter','Splitteramulett',65,'dreizehn von zwanzig'],
  ['ratssiegel','Ratssiegel',45,'neun von zwanzig'],
  ['medaille_polizei','Ehrenmedaille',55,'elf von zwanzig'],
  ['fernrohr_messing','Sternsucher-Okular',50,'eine von zwei'],
  ['bronzeglocke_klein','Stimmglöckchen',60,'drei von fünf'],
  ['spinnfaden_lila','Nervenspule',40,'zwei von fünf'],
  ['linsenscherbe','Leuchtturm-Monokel',45,'neun von zwanzig'],
  ['madenwachs','Wachssiegel',70,'sieben von zehn'],
  ['russklumpen','Rußzeichen',65,'dreizehn von zwanzig'],
];
const circles = ['waage','kreide','russ','lichtlose','salz','schichtbund'];
const states = ['bestellt','in_arbeit','fertig','misslungen','abgeholt'];
const itemIds = spec.map(r => r[0]);
const artifactIds = itemIds.map(id => `fa_${id}`);
const load = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const sources = {
  circles: {...load('src/data/treffen.json').circles, ...load('src/data/packs/k3_handel/treffen_schichtbund.json').circles},
  items: new Set(), maps: new Set(), npcs: new Set(),
};
function sourceWalk(v) {
  if (Array.isArray(v)) v.forEach(sourceWalk);
  else if (v && typeof v === 'object') {
    if (typeof v.id === 'string' && Array.isArray(v.rows)) sources.maps.add(v.id);
    for (const [k,x] of Object.entries(v)) {
      if (x && typeof x === 'object' && typeof x.name === 'string') {
        sources.items.add(k);
        sources.npcs.add(k);
      }
      sourceWalk(x);
    }
  }
}
function readSources(dir) {
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,e.name);
    if(e.isDirectory()) readSources(p);
    else if(e.name.endsWith('.json')) sourceWalk(JSON.parse(fs.readFileSync(p,'utf8')));
  }
}
readSources(path.join(root,'src/data'));

// JSON.parse validates syntax; this extra scan rejects silently overwritten object keys.
function uniqueKeys(raw,label) {
  let i=0;
  const ws=()=>{while(/\s/.test(raw[i]??'') && i<raw.length)i++;};
  function str(){const start=i++;while(i<raw.length){const c=raw[i++];if(c==='\\')i++;else if(c==='"')return JSON.parse(raw.slice(start,i));}throw Error(label+': unterminated string');}
  function value(){
    ws();
    if(raw[i]==='{'){
      i++;ws();const keys=new Set();
      if(raw[i]==='}'){i++;return;}
      while(i<raw.length){ws();const k=str();assert(!keys.has(k),`${label}: duplicate JSON key ${k}`);keys.add(k);ws();i++;value();ws();if(raw[i++]==='}')return;}
    }else if(raw[i]==='['){
      i++;ws();if(raw[i]===']'){i++;return;}
      while(i<raw.length){value();ws();if(raw[i++]===']')return;}
    }else if(raw[i]==='"')str();
    else {while(i<raw.length&&!/[\s,\]}]/.test(raw[i]))i++;}
  }
  value();
}
const data={};
for(const name of files){
  const raw=fs.readFileSync(path.join(here,name+'.json'),'utf8');
  data[name]=JSON.parse(raw);uniqueKeys(raw,name);
}
const words = s => (s.replace(/\{[a-z_]+\}/g,'').match(/[\p{L}\p{N}]+(?:[’'’-][\p{L}\p{N}]+)*/gu)??[]).length;
const sentences = s => (s.match(/[.!?](?:\s|$)/g)??[]).length;
const skip=new Set(['id','host','zeitung','requires_flags','hide_if_flags']);
function playerStrings(v,key='') {
  if(skip.has(key))return [];
  if(typeof v==='string')return [v];
  if(Array.isArray(v))return v.flatMap(x=>playerStrings(x,key));
  return Object.entries(v??{}).flatMap(([k,x])=>playerStrings(x,k));
}
function validate(d) {
  const errors=[];
  const check=(ok,msg)=>{if(!ok)errors.push(msg);};
  const exact=(v,keys,label)=>check(JSON.stringify(Object.keys(v??{}).sort())===JSON.stringify([...keys].sort()),label+': keys');
  const length=(v,n,label)=>check(Array.isArray(v)&&v.length===n,label+': expected '+n);
  function walk(v,label){
    if(typeof v==='string')check(v.trim().length>0,label+': empty text');
    else if(Array.isArray(v))v.forEach((x,i)=>walk(x,label+'.'+i));
    else if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>walk(x,label+'.'+k));
    else check(false,label+': unexpected non-text value');
  }
  for(const [k,v] of Object.entries(d))walk(v,k);
  const o=d.oda;
  const lengths={begruessung_auftrag:6,annehmen:4,kein_geld:3,kein_stueck:3,zu_viele:2,warten:6,nachfrage_misslungen:3,abschied:4,koop:6};
  exact(o,[...Object.keys(lengths),'je_zirkel','pruefen','uebergabe_erfolg','uebergabe_misslungen'],'oda');
  for(const [k,n] of Object.entries(lengths))length(o[k],n,'oda.'+k);
  exact(o.je_zirkel,circles,'oda.je_zirkel');
  exact(o.pruefen,itemIds,'oda.pruefen');exact(o.uebergabe_misslungen,itemIds,'oda.misslungen');exact(o.uebergabe_erfolg,artifactIds,'oda.erfolg');
  for(const [id,,chance,fraction] of spec){
    const text=o.pruefen[id]??'';
    check(text.toLowerCase().includes(fraction),id+': exact spoken chance '+chance);
    check(!/[\d%]/.test(text),id+': chance must be words');
    check((o.uebergabe_misslungen[id]??'').includes('die Hälfte Ihres Lohns')&&(o.uebergabe_misslungen[id]??'').includes('verloren'),id+': loss and refund');
    check(sources.items.has(id),id+': source item missing');
  }
  exact(d.gastgeber,circles,'gastgeber');
  for(const c of circles){
    const g=d.gastgeber[c];
    exact(g,['host','uebergabe_erfolg','uebergabe_misslungen','nach_oda'],'host '+c);
    check(g.host===sources.circles[c]?.host,c+': source host mismatch');
    check(sources.npcs.has(g.host),c+': NPC undefined');
    length(g.uebergabe_erfolg,3,c+' success');length(g.uebergabe_misslungen,2,c+' failure');length(g.nach_oda,1,c+' absent');
  }
  length(d.texte.einladung_mit_abholung,6,'invitation pickup');length(d.texte.einladung_oda_dabei,4,'invitation presence');
  exact(d.texte.auftragskarte.zustand,states,'states');
  exact(d.texte.auftragskarte.chance,['40','50','60','70','80'],'chance labels');
  for(const p of [40,50,60,70,80])check(d.texte.auftragskarte.chance[p]===`Hält mit ${p/10} von 10`,'chance '+p);
  check(d.texte.auftragskarte.chance_genau==='Hält mit {zaehler} von {nenner}','exact chance template');
  exact(d.texte.hinweise,['auftrag_erteilt','naechstes_treffen','artefakt_bereit','artefakt_misslungen','lohn_zurueck','treffen_verpasst','zweiter_auftrag_offen','koop_hinweis'],'notebook');
  const allowed=new Set(['zirkel','artefakt','beutestueck','lohn','erstattung','auftraggeber','tage','zaehler','nenner']);
  for(const s of playerStrings(d.texte))for(const m of s.matchAll(/\{([^}]+)\}/g))check(allowed.has(m[1]),'unknown placeholder '+m[1]);
  for(const s of d.texte.einladung_mit_abholung)check(s.includes('{zirkel}')&&sentences(s)>=1&&sentences(s)<=2,'pickup invitation format');
  for(const s of d.texte.einladung_oda_dabei)check(s.includes('{zirkel}'),'presence circle placeholder');
  length(d.artefakte,20,'artifacts');
  check(new Set(d.artefakte.map(a=>a.id)).size===20,'duplicate artifact IDs');
  check(artifactIds.every(id=>d.artefakte.some(a=>a.id===id)),'required artifact IDs');
  for(const a of d.artefakte){
    exact(a,['id','name','beschreibung','untersuchen','wirkung_text','nachteil_text','oda_zeile'],a.id);
    check(a.name===spec.find(r=>'fa_'+r[0]===a.id)?.[1],a.id+': fixed name');
    check([2,3].includes(sentences(a.beschreibung)),a.id+': description sentences');
    check(sentences(a.untersuchen)===2,a.id+': inspect sentences');
    for(const k of ['wirkung_text','nachteil_text','oda_zeile'])check(sentences(a[k])===1,a.id+': '+k+' sentence count');
    check(!/[\d%]/.test(playerStrings(a).join(' ')),a.id+': numeric balance belongs in README');
  }
  exact(d.gerede,['kettlegate','wexmoor','dunscar','calderwick','briarholt','treffen_allgemein'],'gossip groups');
  for(const [city,places] of Object.entries(d.gerede)){
    check(Object.values(places).flat().length===4,city+': four gossip lines');
    for(const [map,entries] of Object.entries(places)){
      check(city==='treffen_allgemein'?map==='allgemein':sources.maps.has(map),map+': undefined map');
      for(const e of entries)exact(e,['text'],'gossip '+map);
    }
  }
  length(d.zeitung,6,'news');length(d.lesestuecke,4,'readings');
  const knownFlags=new Set(['fa_auftrag_erteilt','fa_misslungen_1',...circles.map(c=>sources.circles[c].member_flag)]);
  const papers=new Set(['kurier','bote','dunscarer_kalkblatt','calderwicker_anzeiger','briarholter_kurblatt']);
  for(const n of d.zeitung){
    exact(n,['id','zeitung','requires_flags','title','text','kurz'],n.id);
    check(papers.has(n.zeitung),n.id+': newspaper');
    check(Array.isArray(n.requires_flags)&&n.requires_flags.length>0&&n.requires_flags.every(f=>knownFlags.has(f)),n.id+': flag contract');
    length(n.kurz,1,n.id+' summary');
  }
  for(const r of d.lesestuecke){
    exact(r,['id','title','text'],r.id);const n=words(r.text);check(n>=100&&n<=160,r.id+': word count '+n);
  }
  const ids=[...d.artefakte,...d.zeitung,...d.lesestuecke].map(x=>x.id);
  check(ids.length===new Set(ids).size,'duplicate record IDs');
  check(ids.every(id=>/^fa_[a-z0-9_]+$/.test(id)),'new ID prefix');
  for(const s of [...playerStrings(d.oda),...playerStrings(d.gastgeber),...d.artefakte.map(a=>a.oda_zeile)])check(!/\b(du|dich|dir|dein\w*)\b/i.test(s),'spoken line uses du: '+s);
  return errors;
}
const errors=validate(data);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
if(process.argv.includes('--self-test')){
  const mutations=[
    d=>{d.oda.pruefen.rattenkrone='Vier von fünf halten.';},
    d=>{d.artefakte[1].id=d.artefakte[0].id;},
    d=>{d.gastgeber.schichtbund.host='tresswell';},
    d=>{d.texte.hinweise.auftrag_erteilt='';},
    d=>{d.lesestuecke[0].text='Zu kurz.';},
    d=>{d.zeitung[0].requires_flags=['fa_erfunden'];},
    d=>{d.gerede.briarholt.nicht_vorhanden=d.gerede.briarholt.bh_kesselgrund;delete d.gerede.briarholt.bh_kesselgrund;},
    d=>{d.texte.auftragskarte.chance_genau='Hält mit {falsch}';},
  ];
  for(const mutate of mutations){const d=structuredClone(data);mutate(d);assert(validate(d).length>0,'negative check accepted broken data');}
  assert.throws(()=>uniqueKeys('{"fa_x":"a","fa_x":"b"}','self-test'));
  console.log('PASS: 9 Negativprüfungen (Chance, IDs, Gastgeber, Leertext, Länge, Flag, Karte, Platzhalter, doppelte JSON-Schlüssel).');
}
const total=Object.values(data).flatMap(v=>playerStrings(v)).reduce((n,s)=>n+words(s),0);
console.log('PASS: 7 JSON-Dateien; 103 Oda-Zeilen; 36 Gastgeber-Zeilen; 20 Artefakte; 10 Einladungen; 8 Notizbuch-Meldungen.');
console.log('PASS: 20 feste Chancen, 6 Gastgeber, 20 Beutestücke, Kartenreferenzen, 5 Zustände, IDs, Satzgrenzen und Platzhalter.');
console.log('PASS: 24 Gerede-Zeilen; 6 Zeitungsmeldungen; 4 Lesestücke (100–160 Wörter).');
for(const r of data.lesestuecke)console.log(`WÖRTER ${r.id}: ${words(r.text)}`);
console.log(`WÖRTER Spielertexte gesamt: ${total}`);
console.log('OFFEN: Laufzeitanschluss, neue Artefaktdefinitionen/Effekte, Zwei-Auftrags-Limit, stabile Ergebnisse und Koop-Besitzer; siehe README.');
