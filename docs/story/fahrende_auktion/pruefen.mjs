import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const dir = path.join(root, 'docs/story/fahrende_auktion');
const read = p => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const own = p => read('docs/story/fahrende_auktion/' + p + '.json');
const [v,b,l,f,z,g,s] = ['vance','bieter','lose','fahrplan','zeitung','gerede','lesestuecke'].map(own);
let checks = 0;
function check(condition, message) { checks++; assert.ok(condition, message); }
function count(array, n, message) { check(Array.isArray(array) && array.length === n, message); }
const cities = ['kettlegate','wexmoor','dunscar','calderwick','briarholt','varrowmouth'];
check(JSON.stringify(Object.keys(v.begruessung)) === JSON.stringify(cities), 'six greeting cities');
for (const city of cities) count(v.begruessung[city], 2, city + ' greetings');
for (const [key,n] of Object.entries({los_aufruf:8,gebot_angenommen:6,ueberboten:6,zuschlag_spieler:6,erloes_auszahlen:4,abschied:4,koop:6})) count(v[key],n,key);
check(v.los_aufruf.every(t=>t.includes('{los}')), 'every call has {los}');
count(v.einliefern.annehmen,4,'accept lines');
check(JSON.stringify(Object.keys(v.einliefern.ablehnen)) === JSON.stringify(['zu_billig','zu_gefaehrlich','gestohlen']), 'three rejection reasons');
count(b.bieter,3,'bidders');
for (const bidder of b.bieter) {
  count(bidder.gebote,6,bidder.id+' bids'); count(bidder.aufgeben,3,bidder.id+' withdrawals'); count(v.zuschlag_bieter[bidder.id],3,bidder.id+' awards');
  check(bidder.vorlieben.every(k=>k in b.kategorien), bidder.id+' categories');
  check(bidder.hoechstgebot.jitter_prozent===10,'budget jitter');
  check(bidder.hoechstgebot.teilnahme_chance>=0 && bidder.hoechstgebot.teilnahme_chance<=1,'participation chance');
}
const widow=b.bieter.find(x=>x.id==='fa2_bieter_witwe');
check(widow.hoechstgebot.vorliebe_prozent===null && widow.hoechstgebot.unbegrenzt_kategorien.includes('erinnerung') && widow.aufgeben_nur_ohne_vorliebe,'widow exception');
check(Boolean(widow.hoechstgebot.warnung),'widow warning visible');
const registry=Object.assign({},...l.quellen.map(read));
let poolCount=0;
function lotCheck(lot) {
  check(Boolean(registry[lot.item]),'existing item '+lot.item);
  check(read(lot.quelle)[lot.item]?.price===lot.wert,'source value '+lot.item);
  check(Number.isInteger(lot.startpreis) && lot.startpreis===Math.max(1,Math.ceil(lot.wert*.6)),'start price '+lot.item);
  check(lot.kategorien.every(k=>k in b.kategorien),'known category '+lot.item);
}
check(JSON.stringify(Object.keys(l.staedte))===JSON.stringify(cities),'six pools');
for (const [city,pool] of Object.entries(l.staedte)) {
  check(pool.length>=12 && pool.length<=20, city+' size');
  check(new Set(pool.map(x=>x.item)).size===pool.length, city+' duplicates');
  pool.forEach(lotCheck); poolCount+=pool.length;
}
count(l.neue_lose,10,'new lots');
check(new Set(l.neue_lose.map(x=>x.id)).size===10,'unique new lots');
for (const [i,item] of l.neue_lose.entries()) {
  check(item.id.startsWith('fa2_los_') && !registry[item.id],'new ID '+item.id);
  check(item.atlas_frame===i,'icon index');
  check(item.startpreis===Math.ceil(item.wert*.6) && item.gewicht>0,'new price/weight');
  check(item.wirkung_vorschlag.verbrauchbar && item.wirkung_vorschlag.nur_ausserhalb_kampf,'single use');
  for (const file of [item.icon,item.icon32]) check(existsSync(path.join(root,'public/sprites',file)),'icon '+file);
  check(item.kategorien.every(k=>k in b.kategorien),'new category');
}
// Collect actual producers, not mere text matches or requirements.
function files(base) {
  return readdirSync(base,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(base,e.name)):e.name.endsWith('.json')?[path.join(base,e.name)]:[]);
}
const producers=new Map();
function walk(value, fn) { if (Array.isArray(value)) value.forEach(x=>walk(x,fn)); else if(value && typeof value==='object') {fn(value);Object.values(value).forEach(x=>walk(x,fn));} }
for (const pack of ['k3_akte','k4_akte','k5_akte']) for (const file of files(path.join(root,'src/data/packs',pack))) {
  walk(JSON.parse(readFileSync(file,'utf8')),node=>{for(const flag of node.sets_flags??[]) {if(!producers.has(flag))producers.set(flag,[]);producers.get(flag).push(file);}});
}
count(l.nachholangebote,6,'catchups');
for (const lot of l.nachholangebote) {
  lotCheck(lot);
  check(registry[lot.item].kind==='artifact','catchup must be artifact');
  check(lot.ab_kapitel===5 || lot.ab_kapitel===6,'catchup chapter');
  check(lot.requires_flags.includes(`kapitel${lot.ab_kapitel-1}_done`),'chapter completion gate');
  check(lot.hide_if_flags.length>0,'missed trail gate');
  for (const flag of [...lot.requires_flags,...lot.hide_if_flags]) check(producers.get(flag)?.some(file=>file.includes(`k${lot.ab_kapitel-1}_akte`)),'actual flag producer '+flag);
  check(lot.zuordnung.includes('DE-Vorschlag') && lot.einmal_je_kampagne && lot.nicht_im_besitz,'explicit proposed mapping and uniqueness');
}
lotCheck(l.auswahl.fasserin_beute);
check(read('src/data/treffen.json').artisan.recipes.some(r=>r.needs[l.auswahl.fasserin_beute.item]),'usable by Fasserin');
check(Object.keys(read('src/data/treffen.json').circles).length>0,'circle registry exists');
check(f.dauer_spieltage===2 && f.pause_spieltage===3 && f.lose_pro_halt===6 && l.auswahl.anzahl===6,'schedule quantities');
check(JSON.stringify(f.reihenfolge)===JSON.stringify(cities),'route order');
const ck=new Set();walk(read('docs/story/feste_leben/kalender.json'),n=>(n.sets_flags??[]).forEach(x=>ck.add(x)));
for (const exception of f.ausnahmen) {
  check(existsSync(path.join(root,exception.quelle)),'exception source');
  if (exception.city==='varrowmouth') check(exception.flag==='gezeit_flut' && readFileSync(path.join(root,exception.quelle),'utf8').includes('gezeit_flut'),'CU tidal contract');
  else check(ck.has(exception.flag),'real CK producer '+exception.flag);
}
count(f.ausnahmen,5,'three local festivals, silent evening, flood');
count(z,8,'newspaper');count(g,30,'gossip');count(s,3,'readings');
for (const entries of [z,g,s]) {
  check(new Set(entries.map(x=>x.id)).size===entries.length,'unique text IDs');
  for (const entry of entries) check(entry.id.startsWith('fa2_') && entry.text.trim().length>20,'nonempty text '+entry.id);
}
check(s.every(x=>x.text.length>450),'complete readings');
const allowed=new Set(['los','stadt','brutto','gebuehr','netto']);
for (const file of readdirSync(dir).filter(x=>x.endsWith('.json'))) {
  const text=readFileSync(path.join(dir,file),'utf8');
  for(const match of text.matchAll(/\{([a-z_]+)\}/g)) check(allowed.has(match[1]),'unknown placeholder '+match[1]);
  check(!text.includes('vmn_'),'wrong prefix');
}
// Executable arithmetic examples of the contract, not runtime integration tests.
const bid=(current,percent)=>current+Math.max(1,Math.ceil(current*percent/100));
check(bid(60,10)===66 && bid(66,10)===73 && bid(73,25)===92,'bid examples');
check(bid(1,10)===2 && bid(100,50)===150,'rounding and 50%');
const net=gross=>gross-Math.ceil(gross*15/100);
check(net(92)===78 && net(1)===0 && net(100)===85,'commission boundary');
const phase=(start,day)=>day<start+2?'halt':day<start+5?'pause':'next';
check(phase(10,11)==='halt'&&phase(10,12)==='pause'&&phase(10,14)==='pause'&&phase(10,15)==='next','2+3 day boundaries');
const eligible=(offer,chapter,flags,owned)=>chapter>=offer.ab_kapitel && offer.requires_flags.every(x=>flags.has(x)) && !offer.hide_if_flags.some(x=>flags.has(x)) && !owned.has(offer.item);
for (const offer of l.nachholangebote) {
  const flags=new Set(offer.requires_flags);
  check(eligible(offer,offer.ab_kapitel,flags,new Set()),'catchup positive');
  check(!eligible(offer,offer.ab_kapitel-1,flags,new Set()),'catchup too early');
  check(!eligible(offer,offer.ab_kapitel,new Set(),new Set()),'catchup unfinished');
  check(!eligible(offer,offer.ab_kapitel,new Set([...flags,...offer.hide_if_flags]),new Set()),'catchup visited');
  check(!eligible(offer,offer.ab_kapitel,flags,new Set([offer.item])),'catchup owned');
}
const manifest=read('public/sprites/manifest-auktion.json');
check(manifest.assets.length===55,'55 exports');
check(read('docs/art/batch-auktion-validation.json').ok,'Pillow validation passed');
console.log(`DE Fahrende Auktion: PASS — ${checks} checks; ${poolCount} city entries, 10 curiosities, 6 catchups; 8/30/3 newspaper/gossip/readings. No runtime integration claimed.`);
