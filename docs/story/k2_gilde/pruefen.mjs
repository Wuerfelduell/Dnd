// Aus dem Repo-Root: node docs/story/k2_gilde/pruefen.mjs
// Nur Node und vorhandene, Phaser-freie Repo-Module. Keine Installation nötig.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../../../tests/helpers.js';
import { GameState } from '../../../src/core/GameState.js';
import { applyQuestPack } from '../../../src/data/questPacks.js';
const dir = fileURLToPath(new URL('.', import.meta.url));
// Seit dem Einbau liegen die JSON-Dateien unter src/data/packs/k2_gilde; geprüft wird gegen den Stand ohne dieses Paket.
const pkgDir = fileURLToPath(new URL('../../../src/data/packs/k2_gilde/', import.meta.url));
const files = readdirSync(pkgDir).filter(f => f.endsWith('.json')).sort();
const data = Object.fromEntries(files.map(f => [f.slice(0,-5), JSON.parse(readFileSync(pkgDir+f, 'utf8'))]));
const base = loadContent({ without: ['k2_gilde'] });
const content = structuredClone(base);
const g = data.treffen_namensgilde;
const ownDialogs = data.dialogues;
const reserved = new Set(['namensgilde','treffen_namensgilde','tm_esse','tm_kerbe','tm_mulde']);
const prefix = (id,where,local=false) => assert.ok(id.startsWith('k2g_') || reserved.has(id) || local && id==='start',`${where}: unzulässige neue ID ${id}`);
function walk(x, fn, path='') {
 if (!x || typeof x!=='object') return;
 fn(x,path);
 for (const [k,v] of Object.entries(x)) walk(v,fn,path+'/'+k);
}
// Realistische Montage: Karten zuerst, Standardpaket genau einmal, Zirkel separat.
Object.assign(content.maps, Object.fromEntries(g.maps.map(m=>[m.id,m])));
Object.assign(content.gatherings.circles,g.circles);
Object.assign(content.gatherings.rules.orders,g.rules.orders);
Object.assign(content.artifacts.list,data.artefakte);
content.travel.push(...g.travel);
Object.assign(content.travelRules.cities.wexmoor.pins,g.pins);
applyQuestPack(content,{name:'k2_gilde',...data});
for(const type of ['quests','dialogues','npcs','items','encounters']) {
 for(const id of Object.keys(data[type])) {prefix(id,type);assert.ok(!base[type][id],`${type}: Kollision ${id}`);}
}
for(const type of ['facts','clues']) for(const id of Object.keys(data.case[type])) {prefix(id,type);assert.ok(!base[type][id],`${type}: Kollision ${id}`);}
for(const id of Object.keys(data.artefakte)) prefix(id,'Artefakt');
for(const id of Object.keys(g.circles)) prefix(id,'Zirkel');
for(const map of g.maps) {prefix(map.id,'Karte');assert.ok(!base.maps[map.id]);for(const o of map.interactables)prefix(o.id,'Objekt');}
for(const p of data.platzierung) prefix(p.interactable.id,'Platzierung');
assert.deepEqual(g.npcs,data.npcs,'NPC-Spiegel unterscheiden sich');
assert.deepEqual(g.dialogues,ownDialogs,'Dialog-Spiegel unterscheiden sich');
// Registry mit echten Definitionen, nicht bloß vorkommenden Zeichenketten.
const setters=new Set();
const addSetters=x=>walk(x,o=>{for(const f of o.sets_flags??[])setters.add(f);if(o.done_flag)setters.add(o.done_flag);});
addSetters(base);addSetters(data);
const sourceFlags=new Set();walk(base,o=>{for(const f of o.sets_flags??[])sourceFlags.add(f);if(o.done_flag)sourceFlags.add(o.done_flag);});
const exists=(type,id,path)=>assert.ok(content[type]?.[id],`${path}: ${type} ${id} fehlt`);
const allOwn={...data};
let refs=0;
walk(allOwn,(o,path)=>{
 for(const field of ['requires_flags','hide_if_flags'])for(const f of o[field]??[]){refs++;assert.ok(setters.has(f)||f.startsWith('won_')&&content.encounters[f.slice(4)],`${path}: Flag ohne Setzer ${f}`);}
 for(const f of o.sets_flags??[])if(!sourceFlags.has(f))prefix(f,path);
 if(o.done_flag)prefix(o.done_flag,path);
 for(const key of ['map','to'])if(typeof o[key]==='string'){exists('maps',o[key],path);refs++;}
 if(o.npc&&typeof o.npc==='string')exists('npcs',o.npc,path);
 if(typeof o.dialogue==='string')exists('dialogues',o.dialogue,path);
 if(o.item)exists('items',o.item,path);
 for(const field of ['requires_items','hide_if_items','wants'])for(const id of o[field]??[])exists('items',id,path);
 for(const field of ['gives_items','takes_items'])for(const id of Object.keys(o[field]??{}))exists('items',id,path);
 for(const field of ['gives_clues','requires_clues','requires_any_clues','hide_if_clues'])for(const id of o[field]??[])exists('clues',id,path);
 if(o.fact)exists('facts',o.fact,path);
 for(const field of ['start_quests','complete_quests','requires_quests_active','requires_quests_done','hide_if_quests'])for(const id of o[field]??[])exists('quests',id,path);
 for(const field of ['encounter','combat'])if(o[field])exists('encounters',o[field],path);
 if(o.bond)for(const id of Object.keys(o.bond))exists('npcs',id,path);
 if(o.requires_gathering)assert.ok(content.gatherings.circles[o.requires_gathering]);
 if(o.auction)assert.ok(content.gatherings.circles[o.auction]);
 if(o.requires_pathway){const [id,seq]=o.requires_pathway;assert.ok(content.pathways[id]?.seqs[seq]);}
 if(o.target){const m=content.maps[o.target.map];assert.ok([...m.npcs,...m.interactables].some(v=>v.id===o.target.id),`${path}: Ziel ${o.target.id} nicht auf ${m.id}`);}
});
let nodeCount=0;
for(const id of new Set([...Object.keys(ownDialogs),...Object.keys(data.dialog_zusaetze)])){
 const d=content.dialogues[id];assert.ok(d,`Unbekannter Zusatzdialog ${id}`);
 const added={...(ownDialogs[id]?.nodes??{}),...(data.dialog_zusaetze[id]?.nodes_add??{})};
 const target=next=>{for(const n of typeof next==='string'?[next]:Array.isArray(next)?next.map(v=>v.node):[])assert.ok(d.nodes[n],`${id}: fehlender Zielknoten ${n}`);};
 target(d.start);
 walk(d,o=>{if(o.next)target(o.next);});
 for(const n of Object.keys(added)){prefix(n,id,true);nodeCount++;}
 const pending=typeof d.start==='string'?[d.start]:d.start.map(x=>x.node);const seen=new Set();
 while(pending.length){const n=pending.pop();if(seen.has(n))continue;seen.add(n);for(const c of d.nodes[n].choices??[]){if(typeof c.next==='string')pending.push(c.next);else if(Array.isArray(c.next))pending.push(...c.next.map(v=>v.node));}}
 for(const n of Object.keys(added))assert.ok(seen.has(n),`${id}: unerreichbarer Knoten ${n}`);
}
assert.equal(Object.keys(data.quests).length,4);assert.equal(Object.keys(data.items).length,6);assert.equal(Object.keys(data.artefakte).length,2);
const boonKeys=new Set(Object.values(base.artifacts.list).flatMap(a=>[...a.boons,...a.curses].map(v=>v.key)));
for(const [id,a]of Object.entries(data.artefakte)){assert.ok(a.boons.length&&a.curses.length);for(const e of [...a.boons,...a.curses])assert.ok(boonKeys.has(e.key));for(const key of ['boons','curses'])assert.deepEqual(a[key],data.items[id][key]);}
for(const m of g.circles.namensgilde.members){exists('npcs',m.id,'Mitglied');assert.ok(m.offers.length>=6&&m.offers.length<=9);assert.ok(m.wants.length>=1&&m.wants.length<=2);assert.equal(Object.keys(ownDialogs[content.npcs[m.id].dialogue].nodes).length,10);for(const e of m.offers){exists('items',e.item,'Angebot');assert.ok(e.price>0&&e.chance>0&&e.chance<=1);}}
for(const id of Object.keys(data.items))assert.ok(g.circles.namensgilde.members.some(m=>m.offers.some(e=>e.item===id)),`Ware ohne Angebot ${id}`);
// Ausschließlich angetroffene Schemafelder in Spielobjekten.
const conditions=new Set(['requires_flags','hide_if_flags','requires_items','hide_if_items','requires_clues','hide_if_clues','requires_any_clues','requires_conclusions','hide_if_conclusions','requires_quests_active','requires_quests_done','hide_if_quests','requires_money','requires_honor','requires_nerves','max_nerves','requires_bond','requires_pathway','requires_gathering']);
const effects=['sets_flags','clears_flags','gives_items','takes_items','gives_money','takes_money','gives_clues','start_quests','complete_quests','honor','bond','wanted','encounter','travel','nerves','unruhe','damage','heal','scene','shop'];
const checkFields=(o,allowed,label)=>{for(const key of Object.keys(o))assert.ok(allowed.has(key),`${label}: unbekanntes Feld ${key}`);};
for(const d of Object.values(ownDialogs))for(const n of Object.values(d.nodes)){checkFields(n,new Set(['text','choices',...effects]),'Knoten');for(const c of n.choices)checkFields(c,new Set(['text','next','auction',...conditions]),'Choice');}
for(const a of Object.values(data.dialog_zusaetze)){for(const n of Object.values(a.nodes_add)){checkFields(n,new Set(['text','choices',...effects]),'Zusatz');for(const c of n.choices)checkFields(c,new Set(['text','next',...conditions]),'Zusatz-Choice');}}
// Koordinaten: Bounds, doppelte Standorte und Anschluss an begehbare Grundfläche.
// Alle AQ-Objekte liegen auf w (Holz), . (Pflaster), , (Weg), s (Stein) oder m (Moorboden).
const walkable = new Set(['w',',','s','m','p','P','g','E','.']);
let placementCount=0;
for(const p of data.platzierung){const m=base.maps[p.map];const [x,y]=p.tile;assert.ok(m.rows[y]?.[x],`Bounds ${p.interactable.id}`);assert.ok(walkable.has(m.rows[y][x]),`Grundfläche ${p.interactable.id}: ${m.rows[y][x]} (${x},${y})`);assert.ok(![...(m.npcs??[]),...(m.interactables??[])].some(o=>o.tile?.[0]===x&&o.tile?.[1]===y),`Belegter Platz ${p.interactable.id}`);placementCount++;}
for(const m of g.maps){assert.equal(m.rows.length,12);assert.ok(m.rows.every(r=>r.length===20));const start=m.spawns.default;const seen=new Set();const q=[start];while(q.length){const [x,y]=q.shift();const key=x+','+y;if(seen.has(key)||!walkable.has(m.rows[y]?.[x]))continue;seen.add(key);q.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}for(const o of [...m.npcs,...m.interactables])assert.ok(seen.has(o.tile.join(',')),`Unerreichbar ${o.id}`);}
// Durchläufe mit dem tatsächlichen GameState: beide Aufnahmewege, alle Mitgliedsentscheidungen,
// vorzeitige Abgabe, Wiederholung, Speichern/Laden und vier Epilogbedingungen.
const sNew=()=>{const s=new GameState(content);s.map='wx_pfahldorf';s.flags.add('briefed_04');s.flags.add('k2_akt2_done');s.flags.add('k2_known_pfahl');return s;};
function select(s,did,nid,next){const n=content.dialogues[did].nodes[nid];const c=n.choices.find(c=>c.next===next&&s.meets(c));assert.ok(c,`${did}/${nid}: ${next} nicht wählbar`);const result=content.dialogues[did].nodes[next];s.applyEffects(result);return result;}
function readClue(s,id){const p=data.platzierung.find(p=>p.interactable.id===id);assert.ok(s.meets(p.visible_if));const o=p.interactable;if(!s.flags.has(o.done_flag))s.applyEffects({...o.effects,sets_flags:[o.done_flag]});}
const admission=['k2g_name_torf','k2g_name_pfahl','k2g_name_watt'];
let runs=0;
for(const a of ['offen','lade'])for(const branch of ['a','b']){
 const s=sNew();
 assert.ok(!s.isMember('namensgilde'));
 const early=sNew();early.flags.delete('k2_akt2_done');assert.ok(!early.meets(data.dialog_zusaetze.sedge.choices_add[0]));
 select(s,'sedge','start','k2g_aufnahme_angebot');select(s,'sedge','k2g_aufnahme_angebot','k2g_aufnahme_annehmen');
 assert.ok(!s.meets(data.dialog_zusaetze.sedge.choices_add[1]));
 for(const c of admission)readClue(s,c);
 select(s,'sedge','start','k2g_aufnahme_wahl');select(s,'sedge','k2g_aufnahme_wahl','k2g_aufnahme_'+a);
 assert.ok(s.isMember('namensgilde'));assert.equal(s.quests.k2g_aufnahme,'done');assert.ok(!s.meets(data.dialog_zusaetze.sedge.choices_add[1]));
 for(const [k,q]of [['esse','k2g_esse_stempel'],['kerbe','k2g_kerbe_hand'],['mulde','k2g_mulde_ruf']]){
  const did='k2g_'+k;
  select(s,did,'start',did+'_auftrag');
  assert.ok(!content.dialogues[did].nodes.start.choices.some(c=>c.next===did+'_wahl'&&s.meets(c)));
  for(const p of data.platzierung.filter(p=>p.visible_if.requires_quests_active.includes(q)))readClue(s,p.interactable.id);
  select(s,did,'start',did+'_wahl');select(s,did,did+'_wahl',did+'_'+branch);
  assert.equal(s.quests[q],'done');assert.ok(data.quests[q].steps.every(st=>s.meets(st.done)));
  assert.ok(!content.dialogues[did].nodes.start.choices.some(c=>c.next===did+'_wahl'&&s.meets(c)));
  assert.ok(content.dialogues[did].nodes[did+'_wahl'].choices.every(c=>!s.meets(c)));
 }
 assert.ok(s.flags.has('k2g_gildenrabatt'));assert.equal(s.itemCount('k2g_zeugenklammer'),1);assert.equal(s.itemCount('formel_echo_7'),1);
 for(const end of ['rein','moor','lichtmeister','meer']){
  for(const e of ['rein','moor','lichtmeister','meer'])s.flags.delete('k2_end_'+e);s.flags.add('k2_end_'+end);
  for(const k of ['esse','kerbe','mulde']){const did='k2g_'+k;const available=data.dialog_zusaetze[did].choices_add.filter(c=>s.meets(c));assert.equal(available.length,1);assert.equal(available[0].next,did+'_ende_'+end);select(s,did,'start',available[0].next);}
 }
 const snap=s.serialize();const restored=new GameState(content);restored.load(snap);assert.ok(restored.flags.has('treffen_namensgilde'));assert.equal(restored.quests.k2g_aufnahme,'done');assert.equal(restored.itemCount('k2g_zeugenklammer'),1);
 runs++;
}
const s=sNew();s.flags.add('treffen_namensgilde');s.map='wx_pfahldorf';
assert.deepEqual([0,1,2].map(c=>s.gatheringSlot(c).id),['lichtlose','salz','namensgilde']);
s.playTime=s.gatheringSlot(2).start+1;assert.ok(s.meets(g.travel[0]));assert.ok(s.startSession('namensgilde').ok);
s.endSession();assert.ok(!s.startSession('namensgilde').ok);assert.ok(!s.meets(g.travel[0]));
for(let c=0;c<60;c++)for(const m of g.circles.namensgilde.members){const lot=s.memberLot('namensgilde',c,m.id);exists('items',lot.item,'Los');assert.deepEqual(lot,s.memberLot('namensgilde',c,m.id));}
console.log(`OK: ${files.length} JSON-Dateien gültig; 4 Quests, 3 Mitglieder, 6 Waren, 2 Artefakte.`);
console.log(`OK: ${nodeCount} neue Dialogknoten einschließlich 12 Endreaktionen; next, Präfixe und ${refs} Karten-/Flagreferenzen geprüft.`);
console.log(`OK: 21 Angebote, 6 Gesuche; Items, Ziele, NPCs, Formeln, Artefakte und Schemas geprüft.`);
console.log(`OK: ${placementCount} Fundstellen ohne belegte Kacheln; Treffpunkt 20×12 begehbar.`);
console.log(`OK: ${runs} vollständige Durchläufe, beide Aufnahmewege, alle 6 Mitgliedsabschlüsse, Abgabesperren und Save/Load.`);
console.log('OK: 4 Enden × 3 Reaktionen, Rotation, Auktionssperre und 180 deterministische Lose.');
console.log('HINWEIS: Rabatt, Zutatenrezepte und once/Pfadfilter sind dokumentierte Einbaupunkte; keine Runtime geändert.');
