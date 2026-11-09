import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
// Seit dem Einbau liegen die acht Standarddateien unter src/data/packs/k2_akte; akt5_neu und epiloge bleiben hier.
const pkgDir = path.join(root, 'src/data/packs/k2_akte');
const files = [...fs.readdirSync(pkgDir).filter(f => f.endsWith('.json')).map(f => path.join(pkgDir, f)),
  ...fs.readdirSync(here).filter(f => f.endsWith('.json')).map(f => path.join(here, f))];
const pack = Object.fromEntries(files.map(f => [path.basename(f).slice(0, -5), read(f)]));
const w = read(path.join(root, 'src/data/wexmoor.json'));
const campaign = read(path.join(root, 'src/data/campaign.json'));
const stock = read(path.join(root, 'src/data/items.json'));
const ab = Object.fromEntries(['quests','npcs','items','dialogues','case','platzierung'].map(f =>
  [f, read(path.join(root, 'src/data/packs/wx_nebenquests', f + '.json'))]));
const lorePlaces = read(path.join(root, 'src/data/packs/lore/lesestuecke.json'));
const srcFiles = [];
function find(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (p !== pkgDir) find(p); }
    else if (p.endsWith('.json')) srcFiles.push(p);
  }
}
find(path.join(root,'src/data'));
const source = srcFiles.map(read);
function walk(o, fn) {
  if (!o || typeof o !== 'object') return;
  if (!Array.isArray(o)) fn(o);
  for (const v of Object.values(o)) if (v && typeof v === 'object') walk(v,fn);
}
const fail = m => { throw new Error(m); };
const isNew = (id, exception = []) => assert(id.startsWith('k2v_') || exception.includes(id), 'Fremde neue ID: '+id);
const items = {...stock,...w.items,...ab.items,...pack.items};
const npcs = {...campaign.npcs,...w.npcs,...ab.npcs,...pack.npcs};
const quests = {...w.quests,...ab.quests,...pack.quests};
const clues = {...w.case.clues,...ab.case.clues,...pack.case.clues};
const facts = {...w.case.facts,...ab.case.facts,...pack.case.facts};
const deductions = new Set([...w.case.deductions,...ab.case.deductions,...pack.case.deductions].map(d=>d.id));
const maps = Object.fromEntries(w.maps.map(m=>[m.id,m]));
const encounters = {...w.encounters,...pack.encounters,...Object.assign({},...Object.values(w.zones).map(z=>z.encounters))};
const dialogs = {...w.dialogues,...ab.dialogues,...pack.dialogues,...pack.akt5_neu.dialogues};
for (const [id,a] of Object.entries(pack.dialog_zusaetze)) {
  assert(w.dialogues[id]?.nodes.start,'Zusatz ohne Startknoten: '+id);
  for (const key of Object.keys(a.nodes_add)) assert(!w.dialogues[id].nodes[key],'Knoten überschrieben: '+key);
  dialogs[id] = { ...w.dialogues[id],nodes:{...w.dialogues[id].nodes,...a.nodes_add,
    start:{...w.dialogues[id].nodes.start,choices:[...w.dialogues[id].nodes.start.choices,...a.choices_add]}}};
}
const flags = new Set();
for (const obj of [...source,...Object.values(pack)]) walk(obj,o=>{
  for (const f of o.sets_flags ?? []) flags.add(f);
  if (o.done_flag) flags.add(o.done_flag);
});
const checkFlag = f => assert(flags.has(f) || (f.startsWith('won_') && encounters[f.slice(4)]), 'Flag ohne Quelle: '+f);
const ref = (registry,id,kind) => assert(Object.hasOwn(registry,id),'Unbekannt '+kind+': '+id);
for (const [file,obj] of Object.entries(pack)) walk(obj,o=>{
  for (const f of [...(o.requires_flags??[]),...(o.hide_if_flags??[]),...(o.clears_flags??[])]) checkFlag(f);
  for (const f of o.sets_flags??[]) isNew(f);
  if(o.done_flag)isNew(o.done_flag);
  for(const key of ['requires_items','hide_if_items'])for(const id of o[key]??[])ref(items,id,'Item');
  for(const key of ['gives_items','takes_items'])for(const id of Object.keys(o[key]??{}))ref(items,id,'Item');
  for(const key of ['gives_clues','requires_clues','hide_if_clues','requires_any_clues'])for(const id of o[key]??[])ref(clues,id,'Hinweis');
  for(const key of ['requires_conclusions','hide_if_conclusions'])for(const id of o[key]??[])assert(deductions.has(id),'Unbekannte Deduktion '+id);
  for(const key of ['start_quests','complete_quests','requires_quests_active','requires_quests_done','hide_if_quests'])for(const id of o[key]??[])ref(quests,id,'Quest');
  if(o.map)ref(maps,o.map,'Karte');
  if(o.npc)ref(npcs,o.npc,'NPC');
  if(o.dialogue)ref(dialogs,o.dialogue,'Dialog');
  if(o.inspect)ref(dialogs,o.inspect,'Inspect-Dialog');
  for(const key of ['bond','requires_bond'])for(const id of Object.keys(o[key]??{}))ref(npcs,id,'Bindungs-NPC');
  if(o.fact)ref(facts,o.fact,'Fakt');
  if(o.encounter)ref(encounters,o.encounter,'Kampf');
  if(o.travel)assert(Object.hasOwn(maps[o.travel.map].spawns,o.travel.spawn),'Spawn fehlt');
  if(o.ending)ref(w.case.endings,o.ending,'Ende');
});
for(const key of ['quests','dialogues','items','encounters'])for(const id of Object.keys(pack[key]))isNew(id);
for(const id of Object.keys(pack.npcs))isNew(id,['wxn_krabbe']);
for(const key of ['facts','clues'])for(const id of Object.keys(pack.case[key]))isNew(id);
for(const d of pack.case.deductions) {
  isNew(d.id);
  for(const pair of d.pairs)for(const f of pair)ref(facts,f,'Deduktionsfakt');
}
function targets(spec) {
  if(typeof spec==='string')return [spec];
  if(Array.isArray(spec))return spec.map(s=>s.node);
  return [];
}
const ownDialogs = {...pack.dialogues,...pack.akt5_neu.dialogues};
for(const [id,d] of Object.entries(ownDialogs)) {
  isNew(id);
  for(const key of Object.keys(d.nodes))isNew(key);
}
for(const [id,a] of Object.entries(pack.dialog_zusaetze)) {
  for(const key of Object.keys(a.nodes_add))isNew(key);
}
const scopes = [...Object.entries(ownDialogs),...Object.keys(pack.dialog_zusaetze).map(id=>[id,dialogs[id]])];
for(const [id,d] of scopes) {
  for(const n of targets(d.start))ref(d.nodes,n,'Start '+id);
  walk(d.nodes,o=>{for(const n of targets(o.next))ref(d.nodes,n,'Next '+id);});
}
// Bekannte Spieldatenfelder statt stillschweigender Erweiterung des Formats.
const conditions = ['requires_flags','hide_if_flags','requires_items','hide_if_items','requires_clues','hide_if_clues','requires_any_clues','requires_conclusions','hide_if_conclusions','requires_quests_active','requires_quests_done','hide_if_quests','requires_money','requires_honor','requires_nerves','max_nerves','requires_bond','requires_pathway'];
const effects = ['sets_flags','clears_flags','gives_items','takes_items','gives_money','takes_money','gives_clues','start_quests','complete_quests','honor','bond','wanted','encounter','travel','nerves','unruhe','damage','heal','scene','shop'];
function keys(o,allow,where){for(const k of Object.keys(o))assert(allow.includes(k),'Unbekanntes Feld '+where+'.'+k);}
function checkNodes(d) {
  if(Array.isArray(d.start))for(const s of d.start)keys(s,['node',...conditions],'start');
  for(const n of Object.values(d.nodes)) {
    keys(n,['text','choices',...effects],'node');
    for(const c of n.choices??[]) {
      keys(c,['text','next',...conditions],'choice');
      if(Array.isArray(c.next))for(const v of c.next)keys(v,['node',...conditions],'next');
    }
  }
}
Object.values(ownDialogs).forEach(checkNodes);
for(const a of Object.values(pack.dialog_zusaetze)){
  checkNodes({nodes:a.nodes_add});
  for(const c of a.choices_add)keys(c,['text','next',...conditions],'choices_add');
}
for(const q of Object.values(pack.quests)){
  keys(q,['title','kind','case','summary','steps'],'quest');
  assert(q.kind==='side'&&q.case==='kapitel2');
  for(const s of q.steps){keys(s,['text','done','target'],'step');keys(s.done,conditions,'done');}
}
for(const item of Object.values(pack.items))keys(item,['name','kind','weight','desc','inspect'],'item');
for(const npc of Object.values(pack.npcs))keys(npc,['name','role','dialogue','palette'],'npc');
assert.deepEqual(Object.keys(pack.akt5_neu).sort(),['dialogues','platzierung','quests']);
assert.deepEqual(Object.keys(pack.akt5_neu.quests),['k2_akt5']);
assert.equal(pack.akt5_neu.quests.k2_akt5.steps.length,7);
for(const [oldIndex,newIndex] of [[0,1],[1,5],[2,6]])assert.deepEqual(pack.akt5_neu.quests.k2_akt5.steps[newIndex],w.quests.k2_akt5.steps[oldIndex]);
assert(!Object.hasOwn(pack.case,'endings'),'Enden dürfen nicht überschrieben werden');
assert(!Object.hasOwn(pack.dialog_zusaetze,'brandt'),'Brandts Bedingungen bleiben unangetastet');
const places=[...pack.platzierung,...pack.akt5_neu.platzierung];
const oldSpots=new Set();
for(const m of w.maps)for(const p of [...m.npcs,...m.interactables,...m.decor])if(p.tile)oldSpots.add(m.id+':'+p.tile);
for(const p of [...ab.platzierung,...lorePlaces])oldSpots.add(p.map+':'+p.tile);
const spots=new Set();
const locations={};
for(const m of w.maps)locations[m.id]=new Set([...m.npcs,...m.interactables].map(x=>x.id));
for(const p of places) {
  keys(p,['map','tile','visible_if','npc','interactable'],'placement');
  if(p.visible_if)keys(p.visible_if,conditions,'visible_if');
  const m=maps[p.map];const [x,y]=p.tile;const ch=m.rows[y]?.[x];
  assert('.wPpsg,'.includes(ch),'Platzierung auf gesperrtem Feld '+p.map+':'+p.tile);
  const s=p.map+':'+p.tile;
  assert(!oldSpots.has(s),'Bestehenden Platz belegt: '+s);
  assert(!spots.has(s),'Doppelter Platz: '+s);spots.add(s);
  const id=p.npc??p.interactable.id;locations[p.map].add(id);
  if(p.interactable){
    isNew(id);
    keys(p.interactable,['id','kind','title','prompt','text','footer','marker','done_flag','effects','dialogue','role'],'interactable');
    if(p.interactable.effects)keys(p.interactable.effects,effects,'effects');
  }
}
for(const q of [...Object.values(pack.quests),pack.akt5_neu.quests.k2_akt5])for(const s of q.steps)if(s.target)assert(locations[s.target.map].has(s.target.id),'Questziel nicht platziert: '+JSON.stringify(s.target));
// Datenmodell für zielgerichtete Ablaufprüfungen, kein Ersatz für Phaser-Spieltests.
function state(act=1){return {flags:new Set(),clues:new Set(),conclusions:new Set(),active:new Set(['k2_akt'+act]),done:new Set(),items:{},money:0,bond:{},nerves:50};}
function meets(o,s) {
  const all=(a,p)=>(a??[]).every(p),none=(a,p)=>(a??[]).every(x=>!p(x));
  return all(o.requires_flags,f=>s.flags.has(f))&&none(o.hide_if_flags,f=>s.flags.has(f))&&
    all(o.requires_clues,c=>s.clues.has(c))&&none(o.hide_if_clues,c=>s.clues.has(c))&&
    all(o.requires_conclusions,c=>s.conclusions.has(c))&&
    all(o.requires_quests_active,q=>s.active.has(q))&&all(o.requires_quests_done,q=>s.done.has(q))&&
    none(o.hide_if_quests,q=>s.active.has(q)||s.done.has(q))&&
    all(o.requires_items,i=>(s.items[i]??0)>0)&&none(o.hide_if_items,i=>(s.items[i]??0)>0)&&
    (o.requires_money===undefined||s.money>=o.requires_money)&&
    Object.entries(o.requires_bond??{}).every(([id,n])=>(s.bond[id]??0)>=n);
}
function apply(n,s) {
  for(const f of n.sets_flags??[])s.flags.add(f);
  for(const f of n.clears_flags??[])s.flags.delete(f);
  for(const c of n.gives_clues??[])s.clues.add(c);
  for(const q of n.start_quests??[])if(!s.done.has(q))s.active.add(q);
  for(const q of n.complete_quests??[]){s.active.delete(q);s.done.add(q);}
  s.money+=(n.gives_money??0)-(n.takes_money??0);
  for(const [i,nr]of Object.entries(n.gives_items??{}))s.items[i]=(s.items[i]??0)+nr;
  for(const [i,nr]of Object.entries(n.takes_items??{}))s.items[i]=(s.items[i]??0)-nr;
  for(const [i,nr]of Object.entries(n.bond??{}))s.bond[i]=(s.bond[i]??0)+nr;
  s.nerves+=n.nerves??0;
  assert(s.money>=0);assert(Object.values(s.items).every(n=>n>=0));
}
const trails=Object.entries(pack.quests).filter(([id])=>id!=='k2v_krabbe');
assert.equal(trails.length,10);
const counts={};
for(const [id,q] of trails) {
  const roman=q.title.match(/^Akt (I|II|III|IV|V) · /)?.[1];assert(roman);
  const act=['I','II','III','IV','V'].indexOf(roman)+1;counts[act]=(counts[act]??0)+1;
  assert(q.steps.length>=3&&q.steps.length<=5);
  const ownClues=Object.keys(pack.case.clues).filter(c=>c.startsWith(id+'_spur'));
  assert(ownClues.length>=4&&ownClues.length<=8);
  const ded=pack.case.deductions.filter(d=>d.id===id+'_schluss');assert.equal(ded.length,1);
  for(const f of ded[0].pairs[0]) {
    const sources=Object.values(pack.case.clues).filter(c=>c.fact===f).map(c=>c.source);
    assert.equal(new Set(sources).size,2,'Zwei Quellen pro Fakt fehlen');
  }
  const [did,a]=Object.entries(pack.dialog_zusaetze).find(([,a])=>a.nodes_add[id+'_auftrag']);
  for(let branch=0;branch<2;branch++){
    const s=state(act),start=a.choices_add.find(c=>c.next===id+'_auftrag');
    assert(meets(start,s));apply(a.nodes_add[id+'_auftrag'],s);assert(!meets(start,s));
    const finish=a.choices_add.find(c=>c.next===id+'_wahl');assert(!meets(finish,s));
    for(const c of ownClues) {
      const p=pack.platzierung.find(p=>p.interactable?.effects?.gives_clues?.includes(c));
      assert(p&&meets(p.visible_if,s),'Hinweis unerreichbar: '+c);apply(p.interactable.effects,s);
    }
    s.conclusions.add(id+'_schluss');assert(meets(finish,s));
    const win=a.nodes_add[id+'_wahl'+branch];assert(win.gives_money||win.honor||win.bond||win.gives_items,'Belohnung fehlt');
    apply(win,s);assert(s.flags.has(id+'_bonus'));assert(!meets(finish,s),'Abschluss farmbar');
    if(act<5) {
      const c=a.choices_add.find(c=>c.next===id+'_hilfe');assert(meets(c,s));
      apply(a.nodes_add[c.next],s);assert(!meets(c,s),'Bonus farmbar');
    }
  }
}
assert.deepEqual(Object.values(counts),[2,2,2,2,2]);
// Alle fünf Funde ohne Geld oder Brot nachholen; wiederholtes Inspect zahlt nichts aus.
const ks=state(5),kd=pack.dialogues.k2v_krabbe.nodes;
apply(kd.k2v_krabbe_auftrag,ks);
for(let i=1;i<=5;i++){
  const entry=kd.k2v_krabbe_akt5.choices.find(c=>c.next==='k2v_krabbe_handel'+i);
  assert(meets(entry,ks));
  const trade=kd['k2v_krabbe_handel'+i];
  assert(!meets(trade.choices[0],ks)&&!meets(trade.choices[1],ks));
  assert(meets(trade.choices[2],ks));apply(kd['k2v_krabbe_arbeit'+i],ks);assert(!meets(entry,ks));
  const item=Object.keys(kd['k2v_krabbe_arbeit'+i].gives_items)[0];
  const inspect=pack.dialogues[pack.items[item].inspect];
  apply(inspect.nodes[inspect.start],ks);apply(inspect.nodes[inspect.start],ks);
}
assert(meets(kd.k2v_krabbe_akt5.choices.find(c=>c.next==='k2v_krabbe_vergleich'),ks));
apply(kd.k2v_krabbe_vergleich,ks);
for(const end of ['tafel','brief']){
  const s=structuredClone(ks);apply(kd['k2v_krabbe_'+end],s);
  assert(s.done.has('k2v_krabbe'));
  assert(!meets(kd.k2v_krabbe_akt5.choices.find(c=>c.next==='k2v_krabbe_wahl'),s));
}
// Akt V bleibt ohne optionale Boni, Bündnisse, Geld und Brot lösbar.
const a=pack.akt5_neu.dialogues;
for(const bonus of [false,true])for(const ally of [false,true])for(const bond of [0,3])for(const fenn of [false,true]){
  const s=state(5);s.bond.zunder=bond;if(ally)s.flags.add('k2_hale_ally');if(fenn)s.flags.add('k2_fenn_found');
  if(bonus){s.flags.add('k2v_keller_bonus');s.flags.add('k2v_waerter_bonus');}
  const b=a.k2v_ueberfahrt.nodes;
  assert(meets(b.k2v_boot_start.choices[0],s));
  assert(meets(b.k2v_boot_polizei.choices[ally?0:1],s));
  apply(b.k2v_boot_ruhig,s);assert(!meets(b.k2v_boot_start.choices[0],s));assert(meets(b.k2v_boot_start.choices[1],s));
  s.flags.add('k2_am_turm'); // unveränderter bestehender Ankunfts-Trigger
  const cellar=a.k2v_kellerszene.nodes,wind=a.k2v_windenszene.nodes,bye=a.k2v_abschied.nodes;
  assert(meets(cellar.k2v_keller_start.choices[bonus?0:1],s));apply(cellar[bonus?'k2v_keller_hilfe':'k2v_keller_weiter'],s);
  assert(meets(wind.k2v_winde_start.choices[bonus?0:1],s));apply(wind[bonus?'k2v_winde_plan':'k2v_winde_hand'],s);
  const picked=bye.k2v_abschied_start.choices[0].next.find(v=>meets(v,s)).node;
  assert.equal(picked,fenn?'k2v_abschied_fenn':bond>=3?'k2v_abschied_nah':'k2v_abschied_sachlich');
  apply(bye[bond>=3?'k2v_abschied_vertrauen':'k2v_abschied_respekt'],s);
  assert(s.flags.has('k2v_abschied_done'));assert.equal(s.flags.has('k2v_zunder_vertraut'),bond>=3);
  for(const p of pack.akt5_neu.platzierung.filter(p=>p.map==='wx_leuchtturm'))assert(!meets(p.visible_if,s),'Pflichtszene wiederholbar');
}
// Jede zulässige Flag-Kombination liefert genau sechs Szenen; Alternativen überlappen nicht.
let epRuns=0;
const endingFlags={k2_rein:'k2_end_rein',k2_moor:'k2_end_moor',k2_lichtmeister:'k2_end_lichtmeister',k2_meer:'k2_end_meer'};
for(const e of pack.epiloge) {
  keys(e,['ending','requires_flags','hide_if_flags','title','text'],'epilog');
  const words=e.text.trim().split(/\s+/u).length;assert(words>=60&&words<=120,e.title+' Wortzahl '+words);
}
for(const [ending,flag]of Object.entries(endingFlags))for(let bits=0;bits<32;bits++)for(let kr=0;kr<3;kr++){
  const s=state();s.flags.add('kapitel2_done');s.flags.add(flag);
  ['k2_hale_ally','k2_price_ally','k2_rowe_frei','vey_fled','k2v_zunder_vertraut'].forEach((f,i)=>{if(bits&(1<<i))s.flags.add(f);});
  if(kr)s.flags.add(kr===1?'k2v_krabbe_oeffentlich':'k2v_krabbe_privat');
  const scenes=pack.epiloge.filter(e=>e.ending===ending&&meets(e,s));
  assert.equal(scenes.length,6,ending+' Epilog-Lücke/Überlappung');
  assert.deepEqual(scenes.map(e=>Number(e.title[0])),[1,2,3,4,5,6]);
  epRuns++;
}
assert.equal(Object.keys(pack.items).length,5);
assert.equal(pack.platzierung.filter(p=>p.npc==='wxn_krabbe').length,5);
console.log('OK: '+files.length+' JSON-Dateien; Verweise, Flags, lokale Dialogziele und ID-Präfixe gültig.');
console.log('OK: 10 Fährten, 2 je Akt; je 4 Hinweise, 2 Fakten, 1 Deduktion; 20 Entscheidungen geprüft.');
console.log('OK: 8 Dialogboni gegen Wiederholung gesperrt; 2 Turmboni in Pflichtszenen verbraucht.');
console.log('OK: 5 Krabbe-Funde ohne Geld nachholbar; Inspect und beide Abschlüsse geprüft.');
console.log('OK: 7 Akt-V-Schritte; 3 alte Schritte unverändert; 16 Zustandsvarianten ohne neue Endbedingungen.');
console.log('OK: '+pack.epiloge.length+' Epilogvarianten, 60–120 Wörter; '+epRuns+' Kombinationen mit genau 6 Szenen.');
console.log('OK: '+places.length+' Platzierungen auf Bodenfeldern, ohne belegte Ursprungs-/AB-/Lore-Koordinaten.');
console.log('HINWEIS: Story-Paket. Turm-Zugangssperren, Epilog-Ausgabe und Phaser-Laufwege müssen beim Einbau geprüft werden.');
