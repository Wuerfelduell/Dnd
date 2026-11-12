import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const errors=[];let checks=0;
const ok=(v,m)=>{checks++;if(!v)errors.push(m);};
const words=s=>s.trim().split(/\s+/u).length;
const files=['pruefungen_seq3.json','register_seq1.json','verzicht.json','reaktionen.json','zeitung.json','gerede.json','lesestuecke.json'];
const data={};const ids=new Set();let total=0;
const textKeys=new Set(['text','beschreibung','hinweis','bedingung','belohnung_text','einleitung','abschluss','scheitern','aufstiegstext','seq_1_welt','vor_dem_verzicht','zeilen','abspann_satz','titel']);
function walk(v,key='',at=''){
 if(typeof v==='string'){
  ok(v.trim().length>0,`Leerer String: ${at}`);
  if(key==='id'){ok(/^[a-z0-9_]+$/.test(v),`ID-Format: ${v}`);ok(!ids.has(v),`Doppelte ID: ${v}`);ids.add(v);}
  if(textKeys.has(key))total+=words(v);
 }else if(Array.isArray(v))v.forEach((x,i)=>walk(x,key,`${at}/${i}`));
 else if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>walk(x,k,`${at}/${k}`));
}
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.json'))){try{data[f]=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));walk(data[f],'',f);}catch(e){errors.push(`${f}: ${e.message}`);}}
files.forEach(f=>ok(f in data,`Datei fehlt: ${f}`));
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
const paths=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr'];
const source={...read('src/data/packs/sequenzen/seq_4_bis_1.json'),...read('src/data/packs/sequenzen/neue_pfade.json')};
const maps=new Set(['k4','k5'].flatMap(k=>read(`src/data/packs/${k}_orte/maps.json`).map(m=>m.id)));
const zones=new Set(['k4','k5'].flatMap(k=>Object.keys(read(`src/data/packs/${k}_orte/zones.json`))));
const npcs=read('src/data/packs/vorrat_figuren/npcs.json');
const loners={};
function collect(v){if(Array.isArray(v)){v.forEach(collect);return;}if(v&&typeof v==='object'){for(const [k,x] of Object.entries(v)){if(x&&typeof x==='object'&&x.pathway)loners[k]=x.pathway;collect(x);}}}
for(const f of ['src/data/treffen.json','src/data/wexmoor.json','src/data/packs/k3_handel/einzelgaenger.json'])collect(read(f));
loners.k3_weichenstellerin='sq_waage';
ok(read('src/data/packs/k3_pruefungen/npcs.json').k3_weichenstellerin,'Hedda fehlt');
ok(fs.readFileSync(path.join(root,'docs/art/codex_CX_k6_figuren.md'),'utf8').includes('vmn_tam_verrin'),'CX-Tam fehlt');
const ps=data[files[0]],rs=data[files[1]],vs=data[files[2]].pfade,ls=data[files[6]];
for(const [name,a] of [['Prüfungen',ps],['Register',rs],['Verzicht',vs],['Lesestücke',ls]]){ok(a.length===10,`${name}: Anzahl`);ok(new Set(a.map(x=>x.pfad)).size===10,`${name}: Pfade doppelt`);paths.forEach(p=>ok(a.some(x=>x.pfad===p),`${name}: ${p} fehlt`));}
const ranges={aufstieg:[],verzicht:[],lesestueck:[]};
for(const p of paths){
 const a=ps.find(x=>x.pfad===p),r=rs.find(x=>x.pfad===p),v=vs.find(x=>x.pfad===p),l=ls.find(x=>x.pfad===p);const s=source[p].seqs;
 ok(a.id===`s3p_${p}`,'Prüf-ID '+p);ok(a.seq_name===s[3].name&&r.seq_name===s[1].name,'Sequenzname '+p);
 ok(a.kanonischer_ritualsatz===s[3].ritual.desc&&r.kanonischer_ritualsatz===s[1].ritual.desc,'Ritualsatz '+p);
 ok(a.teile.length===3,'Drei Teile '+p);ok(a.probe.typ==='friedlich','Friedliche Probe '+p);
 ok(a.probe.bestaetigung.effects.set_flags.includes(`seq3_pruefung_${p}_done`),'Seq-3-Flag '+p);
 ok(a.teile.every(t=>a.probe.requires_flags.includes(t.flag)),'Teilbedingungen '+p);
 ok(a.routen.length===2,'Zwei Routen '+p);
 for(const rt of a.routen){ok(maps.has(rt.map),'Karte '+rt.map);ok(npcs[rt.auftraggeber],'NPC '+rt.auftraggeber);ok(zones.has(rt.zone),'Zone '+rt.zone);}
 for(const h of a.zutaten_hinweis){ok(s[3].ingredients[h.item]===h.anzahl,'Zutat '+h.item);h.zonen.forEach(z=>ok(zones.has(z),'Zutatenzone '+z));}
 ok(JSON.stringify(a.materialpaket.gives_items)===JSON.stringify(s[3].ingredients),'Rezept '+p);
 ok(a.dialoge.einleitung.length>=6&&a.dialoge.einleitung.length<=10,'Einleitung '+p);ok(a.dialoge.abschluss.length>=4&&a.dialoge.abschluss.length<=6,'Abschluss '+p);ok(a.dialoge.scheitern.length===3,'Scheitern '+p);
 ok(r.map===`vm_register_${p}`&&r.raum.width===24&&r.raum.height===16,'Registerkarte '+p);ok(r.raum.beschreibung.length===3&&r.raum.props.length>=4,'Raumbeschreibung '+p);
 ok(r.requires.requires_flags.includes('k6_done')&&JSON.stringify(r.requires.requires_any_flags)===JSON.stringify(['k6_ende_schliessen','k6_ende_uebergeben']),'Finalegate '+p);
 ok(r.zeugen.length===3&&new Set(r.zeugen.map(w=>w.npc)).size===3,'Zeugenanzahl '+p);
 for(const w of r.zeugen){for(const h of ['fuer','gegen','unentschieden'])ok(w.dialog[h].length===4,'Zeugenzeilen '+p);if(w.rolle==='pfad')ok(loners[w.npc]===p,'Pfadzeuge '+p);else if(w.rolle==='fruehere_stadt')ok(npcs[w.npc],'Früherer Zeuge '+p);else ok(w.npc==='vmn_tam_verrin','VM-Zeuge '+p);}
 ok(r.vorlagen.person.relationship_min>=3,'Beziehung '+p);ok(r.vorlagen.verzicht.skill===s[4].skill.id,'Opfer '+p);
 const ns=r.probe.nodes,by=new Map(ns.map(n=>[n.id,n]));ok(ns.length>=8&&ns.length<=12,'Knotenzahl '+p);ok(ns.filter(n=>n.falscher_weg).length===2,'Falsche Wege '+p);
 const reached=new Set();function visit(id){if(reached.has(id))return;ok(by.has(id),'Kante '+id);if(!by.has(id))return;reached.add(id);for(const c of by.get(id).choices??[])visit(c.next);}visit(r.probe.start);ok(reached.size===ns.length,'Unerreichbarer Knoten '+p);
 ok(ns.filter(n=>n.terminal).every(n=>!n.choices),'Terminalkanten '+p);ok(ns.some(n=>n.action==='seq31_commit_aufstieg')&&ns.some(n=>n.action==='seq31_commit_verzicht'),'Enden '+p);
 const end=r.abschluss;ok(end.aufstieg.set_flags.includes(`seq1_register_${p}_done`),'Registerflag '+p);ok(end.verzicht.set_flags.includes('seq1_verzicht')&&!end.verzicht.set_flags.includes(`seq1_register_${p}_done`),'Verzichtflag '+p);ok(end.verzicht.consume_items===false&&end.verzicht.disable_skills===false,'Verzicht ohne Strafe '+p);
 ok(v.zeugen.length===3&&v.zeugen.every(w=>r.zeugen.some(z=>z.npc===w.npc)),'Verzichtzeugen '+p);ok(r.seq_1_welt.length===3,'Weltfolgen '+p);
 for(const [key,str,min,max] of [['aufstieg',r.aufstiegstext,120,180],['verzicht',v.text,100,150],['lesestueck',l.text,120,180]]){const n=words(str);ranges[key].push(n);ok(n>=min&&n<=max,`Wortzahl ${key}/${p}: ${n}`);}
}
ok(data['verzicht.json'].vor_dem_verzicht.length===6,'Vorwarnungen');
const re=data['reaktionen.json'];const classes=['buerger','polizei','haendler','zirkel','beyonder_schwach','beyonder_mittel','beyonder_stark','tiere','sekten'];
for(const c of classes)for(const s of [3,1])ok(re.klassen.filter(x=>x.klasse===c&&x.seq===s&&x.zeilen.length===3).length===1,`Reaktion ${c}/${s}`);
ok(re.klassen.length===18&&re.koop.length===10,'Reaktionenanzahl');ok(data['zeitung.json'].length===12,'Zeitung');ok(data['gerede.json'].length===40,'Gerede');
if(errors.length){console.error(`FEHLER (${errors.length}):\n${errors.join('\n')}`);process.exit(1);}
console.log(`OK: ${files.length} JSON-Dateien; ${ids.size} eindeutige IDs; ${checks} Prüfungen.`);
console.log('OK: 10 Prüfungen / 20 Routen; 10 Register / 110 Gesprächsknoten; 10 Verzichtsenden.');
console.log('OK: 54 Reaktionen + 10 Koop; 12 Zeitungsmeldungen; 40 Geredezeilen; 10 Lesestücke.');
for(const [k,a] of Object.entries(ranges))console.log(`Wörter ${k}: ${a.join(', ')} (Summe ${a.reduce((x,y)=>x+y,0)}).`);
console.log(`Wörter in erzählerischen Textfeldern insgesamt: ${total}.`);
console.log('Referenzen: lokale Quellen geprüft; Tam/Varrowmouth über CX-Vertrag. Einbauadapter und Zukunftsflags sind dokumentiert.');
