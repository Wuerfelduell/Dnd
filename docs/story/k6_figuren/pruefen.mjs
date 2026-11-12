import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const fail=(m)=>{throw new Error(m);};
const check=(v,m)=>{if(!v)fail(m);};
const id=/^[a-z0-9_]+$/;
const names=['npcs','tagesplaene','beziehungen','dialogues','gerede','stimmungen'];
// Small structural parser detects duplicate keys that JSON.parse would silently overwrite.
function uniqueKeys(raw,file){
 const ts=raw.match(/"(?:\\.|[^"\\])*"|[{}\[\]:,]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g)||[];let i=0;
 function value(){const t=ts[i++];if(t==='{'){const seen=new Set();if(ts[i]==='}'){i++;return;}while(true){const k=JSON.parse(ts[i++]);check(!seen.has(k),`${file}: doppelter Schlüssel ${k}`);seen.add(k);check(ts[i++]===':',file+': Doppelpunkt');value();const c=ts[i++];if(c==='}')break;check(c===',',file+': Komma');}}else if(t==='['){if(ts[i]===']'){i++;return;}while(true){value();const c=ts[i++];if(c===']')break;check(c===',',file+': Array');}}}
 value();check(i===ts.length,file+': restliche Tokens');
}
function walk(v,fn,p='root'){if(typeof v==='string'){check(v.trim().length>0,`Leerer Text ${p}`);fn(v,p);}else if(Array.isArray(v))v.forEach((x,i)=>walk(x,fn,p+'.'+i));else if(v&&typeof v==='object')for(const [k,x]of Object.entries(v))walk(x,fn,p+'.'+k);}
const data={};for(const name of names){const raw=fs.readFileSync(path.join(dir,name+'.json'),'utf8');data[name]=JSON.parse(raw);uniqueKeys(raw,name);walk(data[name],()=>{});}
check(fs.readdirSync(dir).filter(x=>x.endsWith('.json')).length===6,'Unerwartete JSON-Dateien');
const required=['vmn_tam_verrin','vmn_osric_dale','vmn_nell_quarrie','vmn_pegelherrin',...Array.from({length:7},(_,i)=>'vmn_rat_'+(i+1)),'vmn_zollschreiber','vmn_fischerin','vmn_kantinenwirt','vmn_apothekerin','vmn_faehrmann','vmn_kielwirtin','vmn_mutter','vmn_mechaniker','vmn_zollknecht','vmn_taucherin','vmn_zeuge_kettlegate','vmn_kurgast'];
const same=(arr,expected,label)=>check(arr.length===expected.length&&new Set(arr).size===arr.length&&expected.every(x=>arr.includes(x)),label);
same(Object.keys(data.npcs),required,'23 Pflichtfiguren');same(Object.keys(data.dialogues),required,'Dialogsprecher');same(data.tagesplaene.map(x=>x.id),required,'Tagespläne');
const fixed={vmn_tam_verrin:'Tam Verrin',vmn_osric_dale:'Pater Osric Dale',vmn_nell_quarrie:'Nell Quarrie',vmn_pegelherrin:'Ismay Harrow'};
for(const [k,v]of Object.entries(fixed))check(data.npcs[k].name===v,'Fester Name '+k);
const defined=new Set();function def(x){check(id.test(x),'Ungültige ID '+x);check(!defined.has(x),'Doppelte Definition '+x);defined.add(x);}
required.forEach(def);
for(const [k,n]of Object.entries(data.npcs)){check(n.dialogue===k&&n.sheet===`characters/${k}.png`,'NPC-Vertrag '+k);check(Object.values(n.palette).every(c=>/^#[0-9a-f]{6}$/.test(c)),'Palette '+k);check(n.cx.examples.length===2,'Sprechbeispiele '+k);}
const maps=['vm_zollhafen','vm_stegviertel','vm_schlickgassen','vm_oberstrasse','vm_wrackfeld','vm_leuchtbank','vm_registerkeller','vm_grenzzaun'];
for(const p of data.tagesplaene){check(p.zeit.length===3,'Fenster '+p.id);let end=6;for(const w of p.zeit){check(w.von===end&&w.bis>w.von,'Zeitlücke '+p.id);end=w.bis;for(const t of ['ebbe','flut']){check(maps.includes(w[t].map),'Karte '+p.id);check(w[t].position_hint.length>12,'Position '+p.id);if(t==='flut')check(!['vm_schlickgassen','vm_wrackfeld','vm_leuchtbank'].includes(w[t].map),'Überfluteter Standplatz '+p.id);}}check(end===24,'Tagesende '+p.id);check(p.visible_if.hide_if_flags.includes('k6_done'),'Finale-Routine');}
const ends=['schliessen','verbrennen','uebergeben','teilen'];let lines=0,pre=0;
const allNodes=new Set();
for(const [speaker,d]of Object.entries(data.dialogues)){
 const short=speaker.slice(4);Object.keys(d.nodes).forEach(n=>{def(n);allNodes.add(n);});
 const reachable=new Set();function visit(n){if(reachable.has(n))return;check(d.nodes[n],'Fehlender Knoten '+n);reachable.add(n);for(const c of d.nodes[n].choices){check(c.text,'Auswahl ohne Text');if(c.next)visit(c.next);}}
 for(const s of d.start)visit(s.node);
 same([...reachable],Object.keys(d.nodes),'Verwaiste Knoten '+speaker);
 function chain(tag,count){let n=`k6_cx_${short}_${tag}_1`;let num=0;const seen=new Set();while(n){check(!seen.has(n),'Dialogzyklus '+n);seen.add(n);const node=d.nodes[n];check(node,'Fehlende Zeile '+n);num++;n=node.choices[0].next;}check(num===count,'Zeilenzahl '+speaker+' '+tag);lines+=num;return `k6_cx_${short}_${tag}_1`;}
 for(const t of ['ebbe','flut']){const n=chain(t,5);const st=d.start.find(s=>s.node===n);check(st.requires_flags.includes('gezeit_'+t)&&st.hide_if_flags.includes('k6_done'),'Alltagsrouting');}
 for(const e of ends){const n=chain(e,4);const st=d.start.find(s=>s.node===n);check(st.requires_flags.includes('k6_done')&&st.requires_flags.includes('k6_ende_'+e),'Endrouting');if(speaker==='vmn_pegelherrin')for(let i=1;i<=4;i++)check(d.nodes[n.slice(0,-1)+i].cx_medium==='nachlass','Lebende Pegelherrin nach Finale');}
 if(/^vmn_rat_[1-7]$/.test(speaker)){chain('vor_akt3',4);pre++;}
 if(speaker==='vmn_zollschreiber')check(Object.values(d.nodes).every(n=>n.text.startsWith('Du liest auf der Tafel:')),'Stummer Schreiber spricht');
}
check(pre===7,'Sieben Ratsvorgespräche');
const rels=['vmn_tam_verrin','vmn_osric_dale','vmn_nell_quarrie','vmn_rat_1','vmn_rat_3','vmn_kielwirtin'];
same(Object.keys(data.beziehungen.figuren),rels,'Beziehungsfiguren');const oldItems=['taschentuch','verband','tonikum','blitzpulver','schlagstock'];const itemSet=new Set([...oldItems,...Object.keys(data.beziehungen.items)]);Object.keys(data.beziehungen.items).forEach(def);
let levels=0;for(const [npc,r]of Object.entries(data.beziehungen.figuren)){same(Object.keys(r.stufen),Array.from({length:9},(_,i)=>String(i-3)),'Stufen '+npc);for(const [level,s]of Object.entries(r.stufen)){levels++;check(s.begruessungen.length===2&&new Set(s.begruessungen).size===2,'Grüße '+npc+level);check(s.mag.length===3&&s.verabscheut.length===2,'Geschenke '+npc+level);same([...s.mag,...s.verabscheut].map(x=>x.item),[...new Set([...s.mag,...s.verabscheut].map(x=>x.item))],'Geschenkduplikat');for(const g of [...s.mag,...s.verabscheut])check(itemSet.has(g.item)&&g.begruendung.length>10,'Unbekanntes Geschenk');check(s.freischaltung.requires_relation===Number(level),'Schwelle');def(s.freischaltung.id);}}
const rel=data.beziehungen.figuren;
check(rel.vmn_tam_verrin.stufen['3'].freischaltung.target==='unverzeichnete','Tam Zirkel +3');check(rel.vmn_tam_verrin.stufen['4'].freischaltung.uhrzeit==='jederzeit','Tam Boot +4');
const nell=rel.vmn_nell_quarrie.stufen['3'].freischaltung;check(nell.duration_game_hours===24&&!nell.permanent&&nell.consent_required&&nell.actor_scope==='ausgewaehlter_spieler','Nell Dauer/Zustimmung/Koop');check(rel.vmn_osric_dale.stufen['2'].freischaltung.text_inhalt.length>100,'Lesestück fehlt');
const groups={allgemein:0,ebbe:0,flut:0,wrackmutter:0,leuchtfeuer:0};const rumorTexts=new Set();
for(const [map,arr]of Object.entries(data.gerede.varrowmouth)){check(maps.includes(map),'Gerede-Karte');for(const r of arr){def(r.id);const group=r.id.replace('k6_cx_gerede_','').replace(/_\d+$/,'');check(group in groups,'Geredegruppe');groups[group]++;check(!rumorTexts.has(r.text),'Doppeltes Gerede');rumorTexts.add(r.text);check(r.hide_if_flags.includes('k6_done'),'Gerede nach Ende');const flag={ebbe:'gezeit_ebbe',flut:'gezeit_flut',wrackmutter:'k6_cx_wrackmutter_besiegt',leuchtfeuer:'k6_cx_leuchtfeuer_befreit'}[group];if(flag)check(r.requires_flags.includes(flag),'Gerede-Bedingung');}}
check(JSON.stringify(Object.values(groups))==='[20,20,20,10,10]','Geredeumfang');
const expectedMoods=required.slice(0,7);same(Object.keys(data.stimmungen.figuren),expectedMoods,'Stimmungsfiguren');
for(const [npc,arr]of Object.entries(data.stimmungen.figuren)){same(arr.map(x=>x.emotion),data.stimmungen.emotions,'Acht Emotionen '+npc);for(const m of arr){def(m.id);if(m.when.dialogue)check(allNodes.has(m.when.dialogue),'Stimmungsdialog');if(npc==='vmn_tam_verrin'&&m.emotion==='lächelnd')check(m.when.requires_flags.includes('gezeit_ebbe'),'Tam lacht bei Flut');}}
const flags=new Set(['k6_arrived','k6_done','k6_akt2_done','k6_akt3_done','gezeit_ebbe','gezeit_flut',...ends.map(e=>'k6_ende_'+e),...['wahl','winter','verwahrt','schmerzlos'].map(e=>'bha_end_'+e),'k6_cx_zirkelzugang','k6_cx_nell_pause','k6_cx_wrackmutter_besiegt','k6_cx_leuchtfeuer_befreit','k6_cx_pegelstoss','k6_cx_vertrauen_verletzt',...Array.from({length:7},(_,i)=>`k6_cx_rat_${i+1}_vorgespraech`)]);
for(const v of Object.values(data))walk(v,(s,p)=>{if(/\.(requires_flags|hide_if_flags|sets_flags)\.\d+$/.test(p))check(flags.has(s),'Undokumentiertes Flag '+s);if(/\.(id|item|target|map)$/.test(p))check(id.test(s),'ID-Format '+p);});
const md=fs.readFileSync(path.join(dir,'figuren.md'),'utf8');const sections=md.split(/^## /m).slice(1);check(sections.length===23,'Bogenanzahl');const wordCount=s=>s.trim().split(/\s+/u).filter(Boolean).length;const counts=[];
for(const section of sections){const [head,...body]=section.split('\n');const npc=head.split(' · ')[1];check(required.includes(npc),'Bogen-ID');const n=wordCount(body.join('\n'));check(n>=120&&n<=200,`Bogen ${npc}: ${n} Wörter`);counts.push(n);}
let total=wordCount(md)+wordCount(fs.readFileSync(path.join(dir,'README.md'),'utf8'));for(const v of Object.values(data))walk(v,s=>{if(/\s/u.test(s)&&!s.startsWith('characters/'))total+=wordCount(s);});
console.log('CX OK: 6 JSON-Dateien lesbar; keine doppelten Schlüssel/Definitions-IDs oder leeren Texte.');
console.log(`23 Figuren; 23 Tagespläne; ${levels} Beziehungsstufen; 80 Geredezeilen; 7 Portraits × 8 Emotionen.`);
console.log(`${lines} Dialogzeilen in Hauptketten + 4 Briarholt-Zusätze; 7 Ratsvorgespräche; 4 Enden je Figur.`);
console.log(`Charakterbögen: ${counts.reduce((a,b)=>a+b,0)} Wörter; je Bogen ${Math.min(...counts)}–${Math.max(...counts)} (Vorgabe 120–200).`);
console.log(`Redaktionelle Gesamtwortzahl inkl. mehrfach gespeicherter Texte: ${total}.`);
console.log('Referenzen, sichere Flutpositionen, Gezeiten-/Endrouting, Geschenk-IDs und Freischaltungen geprüft.');
