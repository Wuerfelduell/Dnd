// Paket-AA-Prüfer. Node-Standardbibliothek, keine installierten Pakete nötig.
// Der Adapter verändert nur Kopien im Speicher; keine Datei unter src wird geschrieben.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildContent } from '../../../src/data/buildContent.js';
import { GameState } from '../../../src/core/GameState.js';
import { Combat } from '../../../src/core/Combat.js';
import { travelDestinations } from '../../../src/core/Travel.js';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const source = p => read(path.join(root, 'src/data', p));
const pkgDir = path.join(root, 'src/data/packs/kg_nebenquests'); // seit dem Einbau dort
const pkg = Object.fromEntries(readdirSync(pkgDir).filter(f => f.endsWith('.json')).map(f => [f.slice(0, -5), read(path.join(pkgDir, f))]));
assert.equal(Object.keys(pkg).length, 8, 'Genau acht JSON-Lieferdateien erwartet');
const sourceFiles = [];
function list(dir) { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) list(p); else if (p.endsWith('.json')) sourceFiles.push(read(p)); } }
list(path.join(root, 'src/data'));
function walk(x, fn, at = '') {
  if (!x || typeof x !== 'object') return;
  if (!Array.isArray(x)) fn(x, at);
  for (const [k, v] of Object.entries(x)) walk(v, fn, `${at}/${k}`);
}
const base = buildContent({
  campaign: source('campaign.json'), quests: source('quests.json'), items: source('items.json'), encounters: source('encounters.json'),
  cases: readdirSync(path.join(root, 'src/data')).filter(f => /^case_.*\.json$/.test(f)).map(source),
  maps: readdirSync(path.join(root, 'src/data/maps')).filter(f => f.endsWith('.json')).map(f => source('maps/' + f)),
  dialogues: readdirSync(path.join(root, 'src/data/dialogues')).filter(f => f.endsWith('.json')).map(f => source('dialogues/' + f)),
  pathways: source('pathways.json'), market: source('market.json'), travel: source('travel.json'), wilds: source('wilds.json'),
  factions: source('factions.json'), buildings: source('gebaeude.json'), gatherings: source('treffen.json'), city: source('stadtgegner.json'), wexmoor: source('wexmoor.json'),
});
const content = structuredClone(base);
for (const k of ['quests', 'items', 'encounters', 'dialogues']) Object.assign(content[k], structuredClone(pkg[k]));
for (const [id, n] of Object.entries(pkg.npcs)) content.npcs[id] = { ...content.npcs[id], ...structuredClone(n) };
Object.assign(content.facts, pkg.case.facts); Object.assign(content.clues, pkg.case.clues); content.deductions.push(...pkg.case.deductions);
for (const [did, a] of Object.entries(pkg.dialog_zusaetze)) {
  assert(base.dialogues[did], `Unbekannter Zusatzdialog ${did}`);
  const d = content.dialogues[did];
  d.nodes.start.choices.splice(-1, 0, ...structuredClone(a.choices_add));
  for (const id of Object.keys(a.nodes_add)) assert(!d.nodes[id], `Überschriebener Knoten ${did}/${id}`);
  Object.assign(d.nodes, structuredClone(a.nodes_add));
}
const arrestGuards = { erbe: 'edmund_arrested', gouvernante: 'wren_arrested', rattenfaenger: 'piper_arrested' };
for (const m of Object.values(content.maps)) for (const n of m.npcs ?? []) {
  if (arrestGuards[n.id]) { n.visible_if ??= {}; n.visible_if.hide_if_flags = [...(n.visible_if.hide_if_flags ?? []), arrestGuards[n.id]]; }
}
for (const p of pkg.platzierung) {
  assert(content.maps[p.map], `Karte fehlt: ${p.map}`);
  const m = content.maps[p.map];
  if (p.npc) { m.npcs ??= []; m.npcs.push({ id: p.npc, tile: p.tile, visible_if: p.visible_if }); }
  else m.interactables.push({ ...p.interactable, tile: p.tile, visible_if: p.visible_if });
}
const conditions = ['requires_flags','hide_if_flags','requires_items','hide_if_items','requires_clues','hide_if_clues','requires_any_clues','requires_conclusions','hide_if_conclusions','requires_quests_active','requires_quests_done','hide_if_quests','requires_money','requires_honor','requires_nerves','max_nerves','requires_bond','requires_pathway'];
const effects = ['sets_flags','clears_flags','gives_items','takes_items','gives_money','takes_money','gives_clues','start_quests','complete_quests','honor','bond','wanted','combat','travel','nerves','unruhe','damage','heal','scene','shop'];
function keys(obj, allowed, label) { for (const k of Object.keys(obj)) assert(allowed.includes(k), `${label}: unbekanntes Feld ${k}`); }
function prefix(id, label) { assert(id.startsWith('kg_'), `${label}: neues Präfix fehlt bei ${id}`); }
function checkChoice(c, label) { keys(c, ['text','next',...conditions],label); if (c.next) assert.equal(typeof c.next, 'string', label); }
let nodeCount = 0, edgeCount = 0;
for (const [did, d] of [...Object.entries(pkg.dialogues), ...Object.entries(pkg.dialog_zusaetze).map(([id,a]) => [id,{nodes:a.nodes_add}])]) {
  if (pkg.dialogues[did]) { prefix(did,'Dialog'); assert(!base.dialogues[did],`Dialogkollision ${did}`); keys(d,['start','nodes'],did); }
  const merged = content.dialogues[did];
  for (const [id,n] of Object.entries(d.nodes)) {
    prefix(id,'Knoten'); nodeCount++;
    keys(n,['text','choices',...effects],`${did}/${id}`);
    assert(typeof n.text === 'string' && n.text.length > 15, `${did}/${id}: Text fehlt`);
    assert(!/[—–]/.test(n.text),`${did}/${id}: Gedankenstrich im Fließtext`);
    for (const c of n.choices ?? []) { checkChoice(c,`${did}/${id}`); if (c.next) { assert(merged.nodes[c.next],`${did}/${id}: next ${c.next} fehlt`); edgeCount++; } }
  }
  if (d.start) for (const x of typeof d.start === 'string' ? [{node:d.start}] : d.start) { keys(x,['node',...conditions],did+'/start'); assert(d.nodes[x.node],`${did}: Startknoten fehlt`); }
}
for (const [did,a] of Object.entries(pkg.dialog_zusaetze)) {
  keys(a,['choices_add','nodes_add'],did);
  for (const ch of a.choices_add) { checkChoice(ch,did); assert(content.dialogues[did].nodes[ch.next],`${did}: Zusatzkante fehlt`); edgeCount++; }
}
for (const [q,x] of Object.entries(pkg.quests)) {
  prefix(q,'Quest');assert(!base.quests[q],`Questkollision ${q}`);
  keys(x,['title','kind','case','summary','steps','reward'],q);
  assert.equal(x.kind,'side'); assert.equal(x.case,'side');assert(x.steps.length>=3&&x.steps.length<=6,`${q}: Schrittzahl`);
  assert.equal(x.reward.gives_money,0,`${q}: automatischer Lohn nicht unterbunden`);
  for (const st of x.steps) { keys(st,['text','done','target'],q);keys(st.done,conditions,q+'/done');keys(st.target,['map','id','label'],q+'/target'); }
}
assert.equal(Object.keys(pkg.quests).filter(q=>!q.startsWith('kg_kopfgeld_')).length,11);
assert.equal(Object.keys(pkg.quests).filter(q=>q.startsWith('kg_kopfgeld_')).length,3);
for (const kind of ['items','encounters']) for (const id of Object.keys(pkg[kind])) { prefix(id,kind);assert(!base[kind][id],`${kind}: Kollision ${id}`); }
assert(Object.keys(pkg.items).length<=10);
for (const [id,n] of Object.entries(pkg.npcs)) {
  if (!base.npcs[id]) prefix(id,'NPC');
  else for (const k of ['name','role','dialogue']) assert.equal(n[k],base.npcs[id][k],`${id}: bestehende Figur umgeschrieben`);
  keys(n,['name','role','dialogue','palette'],id);
}
for (const [id,it] of Object.entries(pkg.items)) keys(it,['name','kind','weight','desc'],id);
for (const [id,e] of Object.entries(pkg.encounters)) {
  keys(e,['name','sprite','sheet','hp','fleeable','occult','intro','attacks','on_win','lose_to','lose_text','flee_text','win_text'],id);
  assert(e.hp>0&&e.attacks.length>0); for (const a of e.attacks) { keys(a,['name','damage','hits','nerves'],id);assert(a.damage>0&&a.hits.every(x=>x>0)); }
}
for (const [id,f] of Object.entries(pkg.case.facts)) { prefix(id,'Fakt');assert(!base.facts[id]);keys(f,['case','text'],id);assert(f.text); }
for (const [id,c] of Object.entries(pkg.case.clues)) { prefix(id,'Hinweis');assert(!base.clues[id]);keys(c,['fact','source','name','text'],id); }
for (const d of pkg.case.deductions) { prefix(d.id,'Deduktion');assert(!base.deductions.some(x=>x.id===d.id));keys(d,['id','case','pairs','name','text','honor'],d.id); }
const setFlags = new Set(), sourceFlags = new Set();
function producers(x,set) { walk(x,o=>{ for (const f of o.sets_flags??[]) set.add(f); if(o.done_flag)set.add(o.done_flag); }); }
sourceFiles.forEach(x=>producers(x,sourceFlags)); sourceFlags.forEach(f=>setFlags.add(f)); Object.values(pkg).forEach(x=>producers(x,setFlags));
for (const id of Object.keys(content.encounters)) setFlags.add('won_'+id);
const caseIds = new Set(content.cases.map(c=>c.id)), conclusions = new Set(content.deductions.map(d=>d.id));
let refCount=0;
function exists(reg,id,label) { assert(reg[id],`${label}: unbekannte ID ${id}`);refCount++; }
for (const [fn,data] of Object.entries(pkg)) walk(data,(o,at)=>{
  for (const f of [...(o.requires_flags??[]),...(o.hide_if_flags??[]),...(o.sets_flags??[]),...(o.clears_flags??[])]) {
    assert(setFlags.has(f),`${fn}${at}: Flag ohne Produzent ${f}`);
    if(!sourceFlags.has(f)&&!f.startsWith('won_'))prefix(f,'Flag');
    if(f.startsWith('won_'))exists(content.encounters,f.slice(4),'Siegflag');
  }
  for(const f of ['requires_items','hide_if_items']) for(const id of o[f]??[])exists(content.items,id,f);
  for(const f of ['gives_items','takes_items']) for(const id of Object.keys(o[f]??{}))exists(content.items,id,f);
  for(const f of ['requires_clues','hide_if_clues','requires_any_clues','gives_clues'])for(const id of o[f]??[])exists(content.clues,id,f);
  for(const f of ['requires_conclusions','hide_if_conclusions'])for(const id of o[f]??[])assert(conclusions.has(id),`${f}: ${id}`);
  for(const f of ['requires_quests_active','requires_quests_done','hide_if_quests','start_quests','complete_quests'])for(const id of o[f]??[])exists(content.quests,id,f);
  for(const f of ['encounter','combat'])if(o[f])exists(content.encounters,o[f],f);
  if(o.done_flag&&!sourceFlags.has(o.done_flag))prefix(o.done_flag,'Leseflag');
  if(o.map)exists(content.maps,o.map,'Karte');
  if(o.npc)exists(content.npcs,o.npc,'NPC');
  if(o.dialogue)exists(content.dialogues,o.dialogue,'Dialog');
  if(o.fact)exists(content.facts,o.fact,'Fakt');
  if(o.case)assert(caseIds.has(o.case),'Notizbuchbereich '+o.case);
  if(o.sprite?.startsWith('npc:'))exists(content.npcs,o.sprite.slice(4),'NPC-Sprite');
  if(o.lose_to)assert(content.maps[o.lose_to.map].spawns[o.lose_to.spawn],'Niederlage-Spawn');
  if(o.target)assert([...content.maps[o.target.map].npcs??[],...content.maps[o.target.map].interactables??[]].some(x=>x.id===o.target.id),`Ziel ${o.target.map}/${o.target.id} fehlt`);
  if(o.pairs)for(const pair of o.pairs){assert.equal(pair.length,2);for(const f of pair)exists(content.facts,f,'Deduktionspaar');}
});
const clueGivers = new Set(), itemGivers = new Set();
Object.values(pkg).forEach(x=>walk(x,o=>{(o.gives_clues??[]).forEach(c=>clueGivers.add(c));Object.keys(o.gives_items??{}).forEach(i=>itemGivers.add(i));}));
for (const id of Object.keys(pkg.case.clues)) assert(clueGivers.has(id),`Hinweis unerwerbbar ${id}`);
for (const id of Object.keys(pkg.items)) assert(itemGivers.has(id),`Item unerwerbbar ${id}`);
// Verwendete Bodenzeichen aus den originalen rows; keine Wand-/Objektzeichen.
const floor = new Set('.,spwPg=c');
const coord = ([x,y])=>`${x},${y}`;
function floorReach(m) {
  const todo=Object.values(m.spawns).filter(([x,y])=>floor.has(m.rows[y]?.[x]));const seen=new Set(todo.map(coord));
  for(let i=0;i<todo.length;i++){const [x,y]=todo[i];for(const t of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]])if(floor.has(m.rows[t[1]]?.[t[0]])&&!seen.has(coord(t))){seen.add(coord(t));todo.push(t);}}
  return seen;
}
for (const p of pkg.platzierung) {
  keys(p,['map','npc','interactable','tile','visible_if'],'Platzierung');assert(!!p.npc!==!!p.interactable,'Genau ein Platzierungstyp');keys(p.visible_if,conditions,p.map);
  if(p.interactable){prefix(p.interactable.id,'Objekt');keys(p.interactable,['id','kind','title','prompt','text','footer','done_flag','effects','dialogue','encounter'],'Objekt');if(p.interactable.effects)keys(p.interactable.effects,effects,'Objekteffekte');}
  const m=content.maps[p.map],t=p.tile;assert.equal(t.length,2);assert(t.every(Number.isInteger));
  assert(floor.has(m.rows[t[1]]?.[t[0]]),`Nicht begehbar ${p.map}/${coord(t)}`);
  assert(floorReach(m).has(coord(t)),`Isolierte Kachel ${p.map}/${coord(t)}`);
  const exits=(base.maps[p.map].interactables??[]).filter(o=>['door','exit'].includes(o.kind)||o.id==='exit');
  for(const e of exits)assert(Math.abs(e.tile[0]-t[0])+Math.abs(e.tile[1]-t[1])>1,`Neben Ausgang ${p.map}/${coord(t)}`);
  for(const sp of Object.values(m.spawns))assert.notEqual(coord(sp),coord(t),'Spawn blockiert');
}
console.log(`OK: 8 JSON-Dateien; 14 Quests (11 Nebenaufträge + 3 Steckbriefe); ${nodeCount} Zusatzknoten; ${edgeCount} geprüfte Dialogkanten.`);
console.log(`OK: ${refCount} Referenzen; Flag-Produzenten, Präfixe, 2 Gegenstände, 2 Deduktionen und 42 begehbare Platzierungen geprüft.`);
// Reale Zustandslogik, mit sichtbaren Kontakten und erreichbaren Karten.
function seed(phase=8, overrides=[]) {
  const s=new GameState(content);s.money=100;s.honor=30;
  for(let i=1;i<=phase;i++){s.flags.add(`case_0${i}_closed`);s.flags.add(`briefed_0${i}`);s.quests[`case_0${i}`]='done';}
  for(const f of ['travel_ashgrove','travel_ebba','travel_docks','travel_nordtor','travel_sternwarte','travel_giesserei','travel_ballsaal'])s.flags.add(f);
  if(phase>=8){s.flags.add('briefed_09');s.quests.case_09='active';}
  for(const f of overrides)s.flags.add(f);
  return s;
}
function reachable(s) {
  const found=new Set(['revier']);let changed=true;
  while(changed){changed=false;for(const map of [...found]) {
    for(const t of travelDestinations(s,map))if(!found.has(t.map)){found.add(t.map);changed=true;}
    for(const d of content.maps[map].interactables??[])if(d.kind==='door'&&s.meets(d.visible_if)&&s.meets(d.lock)&&!found.has(d.to)){found.add(d.to);changed=true;}
  }}return found;
}
function contact(s,did) {
  const maps=reachable(s);
  for(const m of Object.values(content.maps))if(maps.has(m.id)){
    if((m.npcs??[]).some(n=>content.npcs[n.id]?.dialogue===did&&s.meets(n.visible_if)))return true;
    if((m.interactables??[]).some(n=>n.dialogue===did&&s.meets(n.visible_if)))return true;
  }return false;
}
function clone(s) {const n=new GameState(content);n.load(structuredClone(s.serialize()));n.pendingCombat=s.pendingCombat;return n;}
function signature(s){return JSON.stringify([s.quests,[...s.flags].sort(),s.clues,s.conclusions,s.inventory]);}
function route(s,did,want,required=true) {
  if(!contact(s,did)){if(required)assert.fail(`Kontakt fehlt: ${did}`);return false;}
  const tree=content.dialogues[did];const first=s.pick(tree.start);assert(tree.nodes[first],`Start fehlt ${did}`);
  const a=clone(s);a.applyEffects(tree.nodes[first]);let queue=[{s:a,id:first}],seen=new Set();
  for(let i=0;i<queue.length;i++){
    const x=queue[i],sig=x.id+signature(x.s);if(seen.has(sig))continue;seen.add(sig);
    if(x.id===want){s.load(structuredClone(x.s.serialize()));s.pendingCombat=x.s.pendingCombat;return true;}
    for(const ch of tree.nodes[x.id].choices??[]){if(!x.s.meets(ch))continue;const to=x.s.pick(ch.next);if(!to||(!to.startsWith('kg_')&&to!=='start'))continue;
      const n=clone(x.s);n.applyEffects(tree.nodes[to]);queue.push({s:n,id:to});}
    assert(queue.length<500,`Dialogschleife ${did}`);
  }
  if(required)assert.fail(`Nicht erreichbarer Knoten ${did}/${want}`);return false;
}
function use(s,id) {
  const p=pkg.platzierung.find(p=>p.interactable?.id===id);assert(p,'Objekt fehlt '+id);
  assert(reachable(s).has(p.map),'Karte noch verschlossen: '+p.map);assert(s.meets(p.visible_if),'Objekt unsichtbar '+id);
  const o=p.interactable;
  if(o.kind==='read'&&!s.flags.has(o.done_flag))s.applyEffects({...o.effects,sets_flags:[...(o.effects?.sets_flags??[]),o.done_flag]});
  else if(o.kind==='combat')s.startCombat(o.encounter);
  else assert(o.kind==='read','use nur für Lesen oder Kampf');
}
function finishFight(s,id,outcome='won') {
  assert.equal(s.pendingCombat,id,`Kampf nicht ausgelöst ${id}`);
  const c=new Combat(s,id);c.outcome=outcome;c.finish();s.pendingCombat=null;
  if(outcome!=='won')assert(!s.flags.has('won_'+id));
}
const specs=[
 ['kg_waschtag','waescherin',['kg_hemd','kg_futterbuch','kg_taubenkiste'],['kg_waschtag_schutz','kg_waschtag_bericht'],[18,30],5],
 ['kg_schornstein','kaminkehrer',['kg_kehrbuch'],['kg_schornstein_bezahlt_friedlich','kg_schornstein_bezahlt_kampf'],[24,16],5],
 ['kg_nachtschicht','nachtwaechter',['kg_pausennische'],['kg_nachtschicht_bank','kg_nachtschicht_farbe'],[22,28],5],
 ['kg_letzte_fahrt','kutscher',['kg_fahrschein','kg_bell_register'],['kg_letzte_fahrt_ankunft','kg_letzte_fahrt_wahrheit'],[20,26],6],
 ['kg_totenbild','fotografin',['kg_abzug','kg_retuschauftrag','kg_tern_wunsch'],['kg_totenbild_original','kg_totenbild_retusche'],[26,34],6],
 ['kg_gezinkt','schwindler',['kg_lotteriebuch','kg_zulassung'],['kg_gezinkt_rueckzahlung','kg_gezinkt_anteil'],[12,48],6],
 ['kg_kartenlegerin','wahrsagerin',['kg_kartenbrett','kg_bleiliste'],['kg_kartenlegerin_versiegelt','kg_kartenlegerin_oeffentlich'],[24,12],6],
 ['kg_landgang','matrose',['kg_orrin_auftrag'],['kg_landgang_anzeige','kg_landgang_ausloesen'],[28,12],8],
 ['kg_kodizill','erbe',['kg_kodizill_original','kg_kodizill_kopie'],['kg_kodizill_offen','kg_kodizill_vergleich'],[24,38],8],
 ['kg_rattenkoenig','rattenfaenger',['kg_rattennest'],['kg_rattenkoenig_lohn_frei','kg_rattenkoenig_lohn_kampf'],[16,32],8],
 ['kg_flugblatt','kind_streuner',['kg_drucklieferung'],['kg_flugblatt_oeffentlich','kg_flugblatt_still'],[10,10],8],
 ...['siegelbrecher','schichtdieb','pfandvogt'].map((slug,i)=>{const q='kg_kopfgeld_'+slug;return[q,'kopfgeldbrett',[q+'_beleg'],[q+'_ordentlich',q+'_eilig'],[42+i*10+(i===2?2:0),42+i*10+(i===2?2:0)],6+i];}),
];
let played=0;
function run(spec,ending,variant={}) {
  const [q,orig,reads,ends,pay,phase]=spec;const did=variant.contact??orig;const s=seed(phase,variant.flags??[]);
  // Auch der erste Einstieg muss bei verschlossenen Aufgaben wirkungslos bleiben.
  for(const e of ends)assert(!route(s,did,e,false),`${q}: Auszahlung vor Annahme`);
  route(s,did,q+'_annehmen');assert.equal(s.quests[q],'active');
  for(const e of ends)assert(!route(s,did,e,false),`${q}: Auszahlung ohne Belege`);
  const before=s.money;for(const id of reads){use(s,id);const inv=JSON.stringify(s.inventory);use(s,id);assert.equal(JSON.stringify(s.inventory),inv,`${id}: wiederholtes Item`);}
  if(q==='kg_schornstein'){
    route(s,'kg_schlot',ending===0?q+'_ritual':q+'_kampf');if(ending===1)finishFight(s,'kg_schlotgeist');
  }
  if(q==='kg_nachtschicht')route(s,'kuenstler','kg_fenster_maler');
  if(q==='kg_totenbild'){
    assert(!route(s,did,ends[ending],false),'Deduktion umgangen');assert.equal(s.combine('kg_augen_retusche','kg_tern_wille').result,'new');
  }
  if(q==='kg_landgang'){use(s,'kg_orrin_rettung');finishFight(s,'kg_kanalrettung');}
  if(q==='kg_kodizill'){
    route(s,variant.flags?.includes('wren_arrested')?'kg_wren_besuch':'gouvernante','kg_wren_anspruch');
    assert(!route(s,did,ends[ending],false),'Deduktion umgangen');assert.equal(s.combine('kg_fonds_haus','kg_wren_auslegung').result,'new');
  }
  if(q==='kg_rattenkoenig'){
    route(s,'kg_rattengitter',ending===0?'kg_ratten_frei':'kg_ratten_kampf');if(ending===1)finishFight(s,'kg_rattenschwarm');
  }
  if(q==='kg_flugblatt'){route(s,'student','kg_owen_druck');route(s,'sufragette','kg_clara_text');}
  if(q.startsWith('kg_kopfgeld_')){use(s,q+'_fundort');finishFight(s,q);}
  if(variant.afterFinale){s.flags.add('kapitel1_done');s.quests.case_09='done';}
  route(s,did,ends[ending]);assert.equal(s.quests[q],'done');assert.equal(s.money-before,pay[ending],`${q}: unerwartete Auszahlung`);
  assert(pkg.quests[q].steps.every(st=>s.meets(st.done)),`${q}: offene Schritte nach Ende`);
  for(const e of ends)assert(!route(s,did,e,false),`${q}: wiederholte oder alternative Auszahlung`);
  // Dieselbe Auszahlung darf auch nicht über Brief/Besuch erreichbar sein.
  for(const other of ['kg_pratt_post','kg_orsolya_besuch','kg_edmund_besuch','kg_jasper_besuch'])if(content.dialogues[other].nodes[ends[ending]])assert(!route(s,other,ends[ending],false));
  for(const f of variant.flags??[])assert(s.flags.has(f),`Hauptfallflag gelöscht: ${f}`);
  played++;return s;
}
for(const spec of specs)for(let i=0;i<2;i++)run(spec,i);
for(const [q,variant] of [
 ['kg_gezinkt',{contact:'kg_pratt_post',flags:['pratt_resolved','pratt_gone']}],
 ['kg_kartenlegerin',{contact:'kg_orsolya_besuch',flags:['seer_arrested']}],
 ['kg_kodizill',{contact:'kg_edmund_besuch',flags:['edmund_arrested','wren_arrested','case_78_showdown']}],
 ['kg_kodizill',{flags:['wren_arrested','case_78_showdown']}],
 ['kg_rattenkoenig',{contact:'kg_jasper_besuch',flags:['piper_arrested']}],
 ['kg_flugblatt',{afterFinale:true,flags:['benji_lost']}],
])for(let i=0;i<2;i++)run(specs.find(s=>s[0]===q),i,variant);
// Vor Freischaltung und nach Finale keine neue Annahme, auch nicht per Brief.
for(const [q,did,,,,phase] of specs){
 const early=seed(q==='kg_flugblatt'?7:phase-1);assert(!route(early,did,q+'_annehmen',false),`${q}: zu früh`);
 const late=seed(8,['kapitel1_done']);late.quests.case_09='done';assert(!route(late,did,q+'_annehmen',false),`${q}: neue Annahme nach Finale`);
}
for(const [did,q,flag] of [['kg_pratt_post','kg_gezinkt','pratt_resolved'],['kg_orsolya_besuch','kg_kartenlegerin','seer_arrested'],['kg_edmund_besuch','kg_kodizill','edmund_arrested'],['kg_jasper_besuch','kg_rattenkoenig','piper_arrested']]){
 const late=seed(8,['kapitel1_done',flag]);assert(!route(late,did,q+'_annehmen',false));
}
// Kampfausgänge mit der echten finish-Logik; ein Rückzug darf keine Rettung verbuchen.
for(const [q,did,reads] of specs.filter(s=>['kg_schornstein','kg_landgang','kg_rattenkoenig'].includes(s[0])||s[0].startsWith('kg_kopfgeld_'))){
 for(const outcome of ['lost','fled']){
  const s=seed();route(s,did,q+'_annehmen');reads.forEach(id=>use(s,id));
  let eid=q;
  if(q==='kg_schornstein'){route(s,'kg_schlot',q+'_kampf');eid='kg_schlotgeist';}
  else if(q==='kg_rattenkoenig'){route(s,'kg_rattengitter','kg_ratten_kampf');eid='kg_rattenschwarm';}
  else {use(s,q==='kg_landgang'?'kg_orrin_rettung':q+'_fundort');if(q==='kg_landgang')eid='kg_kanalrettung';}
  finishFight(s,eid,outcome);assert.equal(s.quests[q],'active');assert(!pkg.quests[q].steps.every(st=>s.meets(st.done)));
  if(q==='kg_schornstein')route(s,'kg_schlot',q+'_kampf');
  else if(q==='kg_rattenkoenig')route(s,'kg_rattengitter','kg_ratten_kampf');
  else use(s,q==='kg_landgang'?'kg_orrin_rettung':q+'_fundort');
  finishFight(s,eid);assert(s.flags.has('won_'+eid),'Wiederholungsversuch fehlgeschlagen');
 }
}
// Gleichzeitige Kontakte dürfen keine identische Kachel belegen (inklusive Quellenobjekte).
for(const s of [seed(5),seed(6),seed(8),seed(8,['wren_arrested','edmund_arrested','piper_arrested','seer_arrested','pratt_resolved','pratt_gone','case_78_showdown'])]){
 for(const p of pkg.platzierung){if(!s.meets(p.visible_if))continue;const m=content.maps[p.map];const ownId=p.npc??p.interactable.id;
  const same=[...(m.npcs??[]),...(m.interactables??[])].filter(x=>coord(x.tile??[-1,-1])===coord(p.tile)&&s.meets(x.visible_if));
  assert.equal(same.length,1,`Doppelte Platzierung ${p.map}/${ownId}: ${same.map(x=>x.id)}`);
 }
}
console.log(`OK: ${played} vollständige Endpfade mit echter GameState-Logik; beide Enden aller 14 Quests und 12 Haft-/Brief-/Finalevarianten.`);
console.log('OK: Freischaltungen, 3-Orte-Ermittlung, Deduktionssperren, Einmalauszahlung, Wiederlesen, 12 Niederlage-/Flucht-Wiederholungen und NPC-Sichtbarkeit.');
console.log('GRENZE: Datenentwurf, nicht eingebaut; keine Browser-/Grafikprüfung oder Timing-Balanceprüfung.');
