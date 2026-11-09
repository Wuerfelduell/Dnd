import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
const load = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const data = Object.fromEntries(fs.readdirSync(dir).filter(p => p.endsWith('.json')).map(p => [p, load(path.join(dir,p))]));
const p = n => data[n+'.json'];
const walk = (v, fn, at = '') => { if (!v || typeof v !== 'object') return; if (!Array.isArray(v)) fn(v, at); for (const [k,x] of Object.entries(v)) walk(x,fn,at+'/'+k); };
const jsonFiles = d => fs.readdirSync(d,{withFileTypes:true}).flatMap(e => e.isDirectory() ? jsonFiles(path.join(d,e.name)) : e.name.endsWith('.json') ? [path.join(d,e.name)] : []);
const sourceFiles = jsonFiles(path.join(root,'src/data'));
const sources = sourceFiles.map(load);
const wx = load(path.join(root,'src/data/wexmoor.json'));
const maps = new Map(wx.maps.map(m=>[m.id,structuredClone(m)]));
const items = new Set(), npcs = new Set(), quests = new Set(), encs = new Set(), clues = new Set(), facts = new Set(), flags = new Set(), dialogues = new Set();
for (const v of sources) walk(v,o=>{
 for(const [key,set] of [['items',items],['npcs',npcs],['quests',quests],['encounters',encs],['clues',clues],['facts',facts],['dialogues',dialogues]])
  if(o[key] && !Array.isArray(o[key])) Object.keys(o[key]).forEach(x=>set.add(x));
 if(o.artifacts?.list)Object.keys(o.artifacts.list).forEach(x=>items.add(x));
 for(const f of o.sets_flags??[])flags.add(f); if(o.done_flag)flags.add(o.done_flag);
});
Object.keys(load(path.join(root,'src/data/items.json'))).forEach(x=>items.add(x));
for(const [name,set] of [['items',items],['npcs',npcs],['quests',quests],['encounters',encs],['dialogues',dialogues]])Object.keys(p(name)).forEach(x=>set.add(x));
Object.keys(p('artifacts').list).forEach(x=>items.add(x));
Object.keys(p('case').facts).forEach(x=>facts.add(x));Object.keys(p('case').clues).forEach(x=>clues.add(x));
for(const z of Object.values(p('zone')))Object.keys(z.encounters).forEach(x=>encs.add(x));
for(const m of p('maps')){assert(!maps.has(m.id),'Kartenkollision '+m.id);maps.set(m.id,structuredClone(m));}
for(const a of p('platzierung')){const m=maps.get(a.map);assert(m,'Platzierungskarte '+a.map);if(a.npc)m.npcs.push({id:a.npc,tile:a.tile});else m.interactables.push({...a.interactable,tile:a.tile});}
walk(data,o=>{for(const f of o.sets_flags??[])flags.add(f);if(o.done_flag)flags.add(o.done_flag);});
encs.forEach(x=>flags.add('won_'+x));
const fixed = {
 maps:new Set(['wx_flossfriedhof','wx_lichtamt','wx_torfbrueche']),
 npcs:new Set(['wxn_bestatterin','wxn_lichtschreiber','wxn_torfgraeber']),
 items:new Set(['schlickzahn','wurmseide','grubenglas','torfbernstein','brautschleier','brautring','brautkranz']),
 encounters:new Set(['torfleiche','grubenlicht','torfwurm','schlickhund','moorbraut'])
};
const prefix=(id,kind)=>assert(id.startsWith('k2o_')||fixed[kind]?.has(id),`Fremde neue ID ${kind}: ${id}`);
for(const name of ['quests','dialogues','npcs','items','encounters'])for(const id of Object.keys(p(name)))prefix(id,name);
Object.keys(p('artifacts').list).forEach(x=>prefix(x,'items'));
for(const name of ['facts','clues'])Object.keys(p('case')[name]).forEach(x=>prefix(x,name));
assert.deepEqual(p('case').deductions,[],'Bestehende Deduktionen bleiben unverändert');
for(const [zid,z] of Object.entries(p('zone'))){prefix(zid,'maps');Object.keys(z.encounters).forEach(x=>prefix(x,'encounters'));}
for(const [id,d] of Object.entries(p('dialogues'))){
 const names=new Set(Object.keys(d.nodes));names.forEach(x=>prefix(x,'nodes'));
 for(const start of typeof d.start==='string'?[{node:d.start}]:d.start)assert(names.has(start.node),'Start '+id+'/'+start.node);
 walk(d,o=>{if(o.next)assert(names.has(o.next),'next '+id+'/'+o.next);});
}
assert.deepEqual(p('dialog_zusaetze'),{},'Keine fremden Dialoge überschreiben');
walk(data,(o,at)=>{
 for(const flag of o.sets_flags??[])prefix(flag,'flags');if(o.done_flag)prefix(o.done_flag,'flags');
 for(const key of ['requires_flags','hide_if_flags'])for(const id of o[key]??[])assert(flags.has(id),`${at}: unbekanntes Flag ${id}`);
 for(const key of ['requires_items','hide_if_items'])for(const id of o[key]??[])assert(items.has(id),`${at}: Item ${id}`);
 for(const key of ['gives_items','takes_items'])for(const id of Object.keys(o[key]??{}))assert(items.has(id),`${at}: Item ${id}`);
 if(o.item)assert(items.has(o.item),`${at}: Drop ${o.item}`);
 for(const key of ['gives_clues','requires_clues','hide_if_clues','requires_any_clues'])for(const id of o[key]??[])assert(clues.has(id),`${at}: Hinweis ${id}`);
 if(o.fact)assert(facts.has(o.fact),`${at}: Fakt ${o.fact}`);
 for(const key of ['start_quests','complete_quests','requires_quests_active','requires_quests_done','hide_if_quests'])for(const id of o[key]??[])assert(quests.has(id),`${at}: Quest ${id}`);
 if(o.encounter)assert(encs.has(o.encounter),`${at}: Kampf ${o.encounter}`);
 if(o.dialogue)assert(dialogues.has(o.dialogue),`${at}: Dialog ${o.dialogue}`);
 if(o.npc)assert(npcs.has(o.npc),`${at}: NPC ${o.npc}`);
 if(o.map){assert(maps.has(o.map),`${at}: Karte ${o.map}`);if(o.spawn)assert(maps.get(o.map).spawns[o.spawn],`${at}: Spawn ${o.spawn}`);}
 if(o.kind==='door'){assert(maps.has(o.to),`${at}: Türziel ${o.to}`);assert(maps.get(o.to).spawns[o.spawn],`${at}: Türspawn ${o.spawn}`);}
 if(o.target){const m=maps.get(o.target.map);assert([...m.npcs,...m.interactables].some(x=>x.id===o.target.id),`${at}: Questziel ${o.target.id}`);}
});
for(const m of p('maps')){
 prefix(m.id,'maps');const w=m.rows[0].length,h=m.rows.length;
 assert(m.rows.every(r=>r.length===w),'Zeilenlängen '+m.id);
 const chars={r_torf:'P',r_wachhaus:'w',g_katakomben:'s'}[m.tiles];assert(chars,'Ungeprüftes Tileset '+m.tiles);
 const ok=([x,y])=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<w&&y<h&&chars.includes(m.rows[y][x]);
 const blocked=new Set((m.decor??[]).filter(d=>d.solid).map(d=>d.tile.join(',')));
 const nodes=new Map();
 for(const obj of [...(m.npcs??[]),...(m.interactables??[])]){assert(!nodes.has(obj.id),'Doppelte Karten-ID '+obj.id);nodes.set(obj.id,obj);assert(ok(obj.tile),'Objekt auf Wand/Wasser '+obj.id);assert(!blocked.has(obj.tile.join(',')),'Objekt in Deko '+obj.id);}
 m.npcs.forEach(n=>assert(npcs.has(n.id),'Unbekannter NPC '+n.id));
 for(const obj of m.interactables)prefix(obj.id,'objects');
 const visited=new Set(),queue=[m.spawns.default];
 for(let i=0;i<queue.length;i++){const a=queue[i],k=a.join(',');if(visited.has(k)||!ok(a)||blocked.has(k))continue;visited.add(k);const[x,y]=a;queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
 for(const [id,tile] of Object.entries(m.spawns)){assert(ok(tile),'Spawn '+id);assert(visited.has(tile.join(',')),'Abgetrennter Spawn '+id);}
 for(const o of [...m.interactables,...m.npcs,...(m.roamers??[]),...(m.lights??[])])assert(visited.has(o.tile.join(',')),'Unerreichbares Objekt '+m.id+'/'+(o.id??o.encounter??'Licht'));
 for(const patrol of m.patrols??[]){prefix(patrol.id,'patrols');for(let i=0;i<patrol.route.length;i++){
  const a=patrol.route[i],b=patrol.route[(i+1)%patrol.route.length];assert(a[0]===b[0]||a[1]===b[1],'Nur gerade Patrouillenabschnitte');
  const steps=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));
  for(let t=0;t<=steps;t++){const v=[a[0]+Math.sign(b[0]-a[0])*t,a[1]+Math.sign(b[1]-a[1])*t];assert(ok(v)&&!blocked.has(v.join(',')),'Blockierte Patrouille '+patrol.id);}
 }}
 const reads=m.interactables.filter(x=>x.kind==='read');assert(reads.length>=6&&reads.length<=10,'Lesetextanzahl '+m.id);
 for(const r of reads)assert(r.text.split(/\s+/u).length<=120,'Lesetext zu lang '+r.id);
 console.log(`Karte ${m.id}: ${w}x${h}, ${reads.length} Lesetexte, ${visited.size} erreichbare Kacheln; Spawns, Objekte, Ausgänge und Patrouillen OK.`);
}
// Platzierungen auf unveränderten Basiskarten prüfen, einschließlich schon eingebautem AB-Paket.
const existingPlacements=load(path.join(root,'src/data/packs/wx_nebenquests/platzierung.json'));
for(const sibling of ['k2_akten','k2_gilde']) { const filename=path.join(root,'docs/story',sibling,'platzierung.json'); if(fs.existsSync(filename)) existingPlacements.push(...load(filename)); }
for(const a of p('platzierung')){
 const m=wx.maps.find(x=>x.id===a.map),[x,y]=a.tile;
 assert('gpP.,w'.includes(m.rows[y]?.[x]),'Nicht begehbare Anschlusskachel '+a.map+'/'+a.tile);
 for(const o of [...m.npcs,...m.interactables,...existingPlacements.filter(e=>e.map===a.map)])assert(o.tile.join(',')!==a.tile.join(','),'Belegte Anschlusskachel '+a.map+'/'+a.tile);
}
assert.equal(p('maps')[0].roamers,undefined,'Keine Kämpfe am Friedhof');
assert.equal(p('zone').wx_torfbrueche.tier,3);
assert.equal(Object.keys(p('zone').wx_torfbrueche.encounters).length,5);
assert.equal(p('zone').wx_torfbrueche.encounters.moorbraut.hp,154);
assert(p('zone').wx_torfbrueche.encounters.moorbraut.hp>wx.zones.wx_salzwatt.encounters.glockenmutter.hp);
// Kleines Datenmodell der hier verwendeten Bedingungen und Effekte, kein Phaser-Ersatz.
const keys=['requires_flags','hide_if_flags','requires_items','hide_if_items','requires_quests_active','requires_quests_done','hide_if_quests'];
const make=()=>({flags:new Set(['k2_akt3_done']),items:{},quests:{},clues:new Set(),money:0,honor:0,wanted:0});
function meets(s,o={}){
 const all=(k,fn)=>(o[k]??[]).every(fn),none=(k,fn)=>!(o[k]??[]).some(fn);
 return all('requires_flags',x=>s.flags.has(x))&&none('hide_if_flags',x=>s.flags.has(x))&&all('requires_items',x=>(s.items[x]??0)>0)&&none('hide_if_items',x=>(s.items[x]??0)>0)&&all('requires_quests_active',x=>s.quests[x]==='active')&&all('requires_quests_done',x=>s.quests[x]==='done')&&none('hide_if_quests',x=>s.quests[x]!==undefined);
}
walk(data,o=>{for(const k of Object.keys(o))if(k.startsWith('requires_')||k.startsWith('hide_if_'))assert(keys.includes(k),'Szenariomodell erweitern: '+k);});
function effect(s,e){
 for(const f of e.sets_flags??[])s.flags.add(f);for(const f of e.clears_flags??[])s.flags.delete(f);
 for(const q of e.start_quests??[])s.quests[q]='active';for(const q of e.complete_quests??[])s.quests[q]='done';
 for(const [id,n] of Object.entries(e.gives_items??{}))s.items[id]=(s.items[id]??0)+n;
 for(const [id,n] of Object.entries(e.takes_items??{})){assert((s.items[id]??0)>=n,'Zu wenig '+id);s.items[id]-=n;}
 for(const c of e.gives_clues??[])s.clues.add(c);
 s.money+=e.gives_money??0;s.honor+=e.honor??0;s.wanted=Math.max(s.wanted,e.wanted??0);
}
function choose(s,did,next,from){const d=p('dialogues')[did],node=d.nodes[from??d.start];const choice=node.choices.find(c=>c.next===next);assert(choice&&meets(s,choice),'Option gesperrt '+next);effect(s,d.nodes[next]);return next;}
function read(s,id){const o=p('maps').flatMap(m=>m.interactables).find(x=>x.id===id);assert(o&&meets(s,o.visible_if),'Objekt gesperrt '+id);if(!o.done_flag||!s.flags.has(o.done_flag)){effect(s,o.effects??{});if(o.done_flag)s.flags.add(o.done_flag);}}
function hasChoice(s,did,next){const d=p('dialogues')[did];return d.nodes[d.start].choices.some(c=>c.next===next&&meets(s,c));}
const boss=p('zone').wx_torfbrueche.encounters.moorbraut;
const entrances=p('platzierung').filter(x=>x.map==='wx_oberstadt').map(x=>x.interactable.lock);
let scenarios=0;
for(const corvin of ['k2o_schuetzen','k2o_drohen'])for(const end of ['name','moor','verkauf']){
 let s=make();assert(!hasChoice({...s,flags:new Set()},'k2o_jonas','k2o_auftrag'));
 assert(!hasChoice(s,'k2o_braut','k2o_kampf'));assert(entrances.every(e=>!meets(s,e)));
 choose(s,'k2o_jonas','k2o_auftrag');assert(!hasChoice(s,'k2o_jonas','k2o_auftrag'));
 assert(!hasChoice(s,'k2o_agathe','k2o_sichtung'));read(s,'k2o_faehrmarke');read(s,'k2o_ringabdruck');choose(s,'k2o_agathe','k2o_sichtung');
 assert(!hasChoice(s,'k2o_agathe','k2o_schluessel'));read(s,'k2o_quittung');read(s,'k2o_taefelchen');choose(s,'k2o_agathe','k2o_schluessel');
 assert(!meets(s,entrances[0]));assert(meets(s,entrances[1]));s.flags.add('k2_wear_akademierobe');assert(meets(s,entrances[0]));s.flags.delete('k2_wear_akademierobe');
 s.items.k2o_amtsschluessel=0;assert(!meets(s,entrances[1]));choose(s,'k2o_agathe','k2o_ersatz');assert(meets(s,entrances[1]));
 choose(s,'k2o_corvin',corvin);assert.equal(s.wanted,corvin==='k2o_drohen'?2:0);assert(!hasChoice(s,'k2o_corvin',corvin));assert(meets(s,entrances[1]));
 read(s,'k2o_verfuegung');read(s,'k2o_trauregister');const before=s.clues.size;read(s,'k2o_trauregister');assert.equal(s.clues.size,before);
 choose(s,'k2o_jonas','k2o_bericht');assert(!hasChoice(s,'k2o_grab','k2o_namenwahl'));
 // Niederlage verändert weder Beweislage noch Questgates; erneuter Versuch bleibt offen.
 choose(s,'k2o_braut','k2o_kampf');assert(hasChoice(s,'k2o_braut','k2o_kampf'));
 const restore = state => { const v=JSON.parse(JSON.stringify({...state,flags:[...state.flags],clues:[...state.clues]})); return {...v,flags:new Set(v.flags),clues:new Set(v.clues)}; };
 s=restore(s);assert(hasChoice(s,'k2o_braut','k2o_kampf'));assert.equal(s.quests.k2o_grab_ohne_namen,'active');
 choose(s,'k2o_braut','k2o_kampf');effect(s,boss.on_win);s.flags.add('won_moorbraut');assert(!hasChoice(s,'k2o_braut','k2o_kampf'));assert.equal(s.items.brautring,1);
 // Zustandskopie nach Laden; ringlose Entscheidungen müssen gesperrt sein.
 s=restore(s);assert.equal(s.items.brautring,1);assert(!hasChoice(s,'k2o_braut','k2o_kampf'));const noRing={...s,items:{...s.items,brautring:0}};assert(!hasChoice(noRing,'k2o_corvin','k2o_kaufangebot'));
 const where={name:['k2o_grab','k2o_namenwahl','k2o_namenende'],moor:['k2o_braut','k2o_moorwahl','k2o_moorende'],verkauf:['k2o_corvin','k2o_kaufangebot','k2o_verkaufen']}[end];
 choose(s,where[0],where[1]);const money=s.money;assert.equal(s.items.brautring,1,'Bestätigung darf nicht vorab verbrauchen');choose(s,where[0],where[2],where[1]);
 assert.equal(s.money-money,{name:20,moor:30,verkauf:75}[end]);assert.equal(s.items.brautring,0);assert.equal(s.items.brautkranz??0,end==='name'?1:0);
 assert.equal(['k2o_ende_name','k2o_ende_moor','k2o_ende_verkauf'].filter(f=>s.flags.has(f)).length,1);
 for(const [did,next] of [['k2o_grab','k2o_namenwahl'],['k2o_braut','k2o_moorwahl'],['k2o_corvin','k2o_kaufangebot'],['k2o_braut','k2o_kampf']])assert(!hasChoice(s,did,next),'Wiederholbarer Abschluss '+next);
 for(const q of Object.keys(p('quests')))assert.equal(s.quests[q],'done',q);
 scenarios++;
}
// Hauptstory-Enden verändern nur das Verkaufsangebot, nicht die beiden anderen Abschlüsse.
for(const ending of ['k2_end_rein','k2_end_moor','k2_end_meer','k2_end_lichtmeister']){
 const s=make();s.flags.add(ending);s.flags.add('won_moorbraut');s.items.brautring=1;s.quests.k2o_grab_ohne_namen='active';
 assert.equal(hasChoice(s,'k2o_corvin','k2o_kaufangebot'),!['k2_end_rein','k2_end_moor'].includes(ending));assert(hasChoice(s,'k2o_grab','k2o_namenwahl'));assert(hasChoice(s,'k2o_braut','k2o_moorwahl'));
}
console.log(`JSON: ${Object.keys(data).length} Dateien gültig. Präfixe/Festausnahmen, lokale Dialogziele, Flag-Produzenten und Karten/NPC/Item/Kampf/Quest/Hinweis-Verweise OK.`);
console.log(`Anschluss: 5 freie Basiskacheln; keine Kollision mit AB sowie vorhandenen AL/AQ-Entwürfen. Zugang über Robe oder Schlüssel geprüft.`);
console.log(`Abläufe: ${scenarios} Kombinationen (2 Corvin-Entscheidungen x 3 Enden), frühe Sperren, Schlüsselersatz, Wiederholungen, Niederlagen-Retry, Save/Load-Modell und 4 Hauptstory-Enden OK.`);
console.log('Balancing: Tier 3; 4 Monster, 1 Boss (154 LP gegenüber 140 LP Glockenmutter), 4 Elite-Vorlagen. Keine Laufzeitintegration behauptet.');
// Integrationsprobe im Speicher mit dem echten Inhaltslader, ohne Quelldateien zu ändern.
const { buildContent } = await import(path.join(root,'src/data/buildContent.js'));
const pathways=load(path.join(root,'src/data/pathways.json'));
pathways.artifacts.list={...pathways.artifacts.list,...p('artifacts').list};
const assembled=buildContent({campaign:{npcs:{}},quests:{},cases:[],maps:[],dialogues:[],items:load(path.join(root,'src/data/items.json')),pathways,
 wexmoor:{...wx,maps:[...wx.maps,...p('maps')],zones:{...wx.zones,...p('zone')},travel:[...wx.travel,...p('travel')]},
 packs:[{name:'k2_orte',...Object.fromEntries(['quests','dialogues','dialog_zusaetze','npcs','case','items','encounters','platzierung'].map(k=>[k,p(k)]))}]});
assert.equal(assembled.items.brautkranz.kind,'artifact');
assert.equal(assembled.encounters.moorbraut.zone,'wx_torfbrueche');
assert.equal(assembled.loot.moorbraut.repeat,false);
assert.equal(assembled.encounters.torfleiche_elite.hp,75);
assert.equal(assembled.encounters.moorbraut.lose_to.map,'wx_torfstich');
assert.equal(assembled.travel.filter(t=>t.map==='wx_torfbrueche').length,1);
assert(!assembled.travel.some(t=>t.map==='wx_lichtamt'),'Stadtkarte darf Türkontrolle nicht umgehen');
assert.equal(assembled.dialogues.k2o_corvin.nodes.k2o_drohen.wanted,2);
console.log('Echter buildContent/applyQuestPack: Karten, Zone, 4 Eliten, Bossbeute, Artefakt und Reiseziele im Speicher korrekt zusammengesetzt.');
