// Node ohne Abhängigkeiten. Aus jedem Arbeitsverzeichnis aufrufbar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const errors = [];
const check = (ok, msg) => { if (!ok) errors.push(msg); };
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const pkgDir = path.join(root, 'src/data/packs/wx_nebenquests'); // seit dem Einbau dort
const files = fs.readdirSync(pkgDir).filter(f => f.endsWith('.json')).sort();
const data = {};
for (const f of files) {
  try { data[f] = read(path.join(pkgDir, f)); } catch (e) { errors.push(`${f}: ${e.message}`); }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const [q, dialogues, additions, npcs, placements, cases, items, encounters, upgrades] =
  ['quests','dialogues','dialog_zusaetze','npcs','platzierung','case','items','encounters','kahn_ausbau'].map(f => data[`${f}.json`]);
function walk(x, fn) {
  if (!x || typeof x !== 'object') return;
  if (!Array.isArray(x)) fn(x);
  for (const v of Object.values(x)) walk(v, fn);
}
function jsonFiles(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e =>
    e.isDirectory() ? jsonFiles(path.join(dir,e.name)) : e.name.endsWith('.json') ? [path.join(dir,e.name)] : []);
}
const source = jsonFiles(path.join(root, 'src/data')).filter(f => !f.startsWith(pkgDir)).map(read);
const wx = read(path.join(root,'src/data/wexmoor.json'));
const meeting = read(path.join(root,'src/data/treffen.json'));
const registry = {maps:new Map(),npcs:new Set(),items:new Set(),encounters:new Set(),quests:new Set(),clues:new Set(),facts:new Set(),deductions:new Set()};
for (const s of source) walk(s, o => {
  for (const type of ['npcs','items','encounters','quests','clues','facts']) {
    if (o[type] && !Array.isArray(o[type])) Object.keys(o[type]).forEach(id=>registry[type].add(id));
  }
  if (Array.isArray(o.deductions)) o.deductions.forEach(d=>registry.deductions.add(d.id));
  if (o.id && o.rows) registry.maps.set(o.id,o);
});
Object.keys(read(path.join(root,'src/data/items.json'))).forEach(id=>registry.items.add(id));
const existingIds = new Set(Object.values(registry).flatMap(s=>[...s.keys()]));
for (const [type, defs] of Object.entries({npcs,items,encounters,quests:q,clues:cases.clues,facts:cases.facts})) {
  for (const id of Object.keys(defs)) {
    check(id.startsWith('k2n_'),`Präfix fehlt: ${type}.${id}`);
    check(!existingIds.has(id),`Kollision mit Bestand: ${id}`);
    registry[type].add(id);
  }
}
for (const d of cases.deductions) {
  check(d.id.startsWith('k2n_') && !existingIds.has(d.id),`Deduktions-ID: ${d.id}`);
  registry.deductions.add(d.id);
  check(d.case==='kapitel2',`Deduktionsfall: ${d.id}`);
  for (const pair of d.pairs) check(pair.length===2 && pair.every(f=>registry.facts.has(f)),`Deduktionspaar: ${d.id}`);
}
for (const [id, c] of Object.entries(cases.clues)) check(registry.facts.has(c.fact),`Hinweis-Fakt: ${id}`);
for (const [id, f] of Object.entries(cases.facts)) check(f.case==='kapitel2',`Fakt-Fall: ${id}`);

const sourceFlags = new Set();
const newFlags = new Set();
const collectFlags = set => o => { (o.sets_flags??[]).forEach(f=>set.add(f)); if(o.done_flag)set.add(o.done_flag); };
source.forEach(s=>walk(s,collectFlags(sourceFlags)));
Object.values(data).forEach(s=>walk(s,collectFlags(newFlags)));
// Automatische Gewonnen-Flags werden nur für tatsächlich existierende Kämpfe anerkannt.
const flagKnown = f => sourceFlags.has(f)||newFlags.has(f)||(f.startsWith('won_')&&registry.encounters.has(f.slice(4)));
for(const f of newFlags) check(f.startsWith('k2n_')||sourceFlags.has(f),`Neues Flag ohne Präfix: ${f}`);

const conditions = new Set(['requires_flags','hide_if_flags','requires_items','hide_if_items','requires_clues','hide_if_clues','requires_any_clues','requires_conclusions','hide_if_conclusions','requires_quests_active','requires_quests_done','hide_if_quests','requires_money','requires_honor','requires_nerves','max_nerves','requires_bond','requires_pathway']);
const effects = new Set(['sets_flags','clears_flags','gives_items','takes_items','gives_money','takes_money','gives_clues','start_quests','complete_quests','honor','bond','wanted','encounter','travel','nerves','unruhe','damage','heal','scene','shop']);
const keys = (o, allowed, at) => Object.keys(o).forEach(k=>check(allowed.has(k),`Unbekanntes Feld ${at}.${k}`));
Object.values(data).forEach(s=>walk(s,o=>{
  for(const k of ['requires_flags','hide_if_flags','clears_flags']) for(const f of o[k]??[]) check(flagKnown(f),`Flag ohne Erzeuger: ${f}`);
  for(const k of ['requires_items','hide_if_items']) for(const id of o[k]??[])check(registry.items.has(id),`Item fehlt: ${id}`);
  for(const k of ['gives_items','takes_items']) for(const [id,n] of Object.entries(o[k]??{}))check(registry.items.has(id)&&Number.isInteger(n)&&n>0,`Item/Anzahl: ${id}`);
  for(const k of ['requires_clues','hide_if_clues','requires_any_clues','gives_clues']) for(const id of o[k]??[])check(registry.clues.has(id),`Hinweis fehlt: ${id}`);
  for(const k of ['requires_conclusions','hide_if_conclusions']) for(const id of o[k]??[])check(registry.deductions.has(id),`Deduktion fehlt: ${id}`);
  for(const k of ['start_quests','complete_quests','requires_quests_active','requires_quests_done','hide_if_quests']) for(const id of o[k]??[])check(registry.quests.has(id),`Quest fehlt: ${id}`);
  if(o.map)check(registry.maps.has(o.map),`Karte fehlt: ${o.map}`);
  if(o.npc)check(registry.npcs.has(o.npc),`NPC fehlt: ${o.npc}`);
  for(const id of Object.keys(o.bond??{}))check(registry.npcs.has(id),`Bindungs-NPC fehlt: ${id}`);
  if(o.encounter)check(registry.encounters.has(o.encounter),`Kampf fehlt: ${o.encounter}`);
  if(o.travel)check(registry.maps.get(o.travel.map)?.spawns[o.travel.spawn],`Reiseziel fehlt: ${JSON.stringify(o.travel)}`);
  if(o.effects)keys(o.effects,effects,'effects');
}));

const merged = {};
for(const [id,d] of Object.entries(dialogues)) {
  check(id.startsWith('k2n_') && !wx.dialogues[id],`Neue Dialog-ID: ${id}`);
  keys(d,new Set(['start','nodes']),id); merged[id]=structuredClone(d);
}
for(const [id,a] of Object.entries(additions)) {
  check(!!wx.dialogues[id],`Zusatzdialog fehlt im Bestand: ${id}`);
  keys(a,new Set(['choices_add','nodes_add']),id);
  const old=wx.dialogues[id];
  merged[id]={start:'start',nodes:{start:nodeRoot(a.choices_add),...a.nodes_add}};
  for(const n of Object.keys(a.nodes_add))check(!old.nodes[n],`Überschriebener Bestandsknoten: ${id}.${n}`);
}
function nodeRoot(choices){return {text:'Prüf-Hub',choices};}
let nodeCount=0;
function links(spec){return typeof spec==='string'?[spec]:Array.isArray(spec)?spec.map(x=>x.node):[];}
for(const [id,d] of Object.entries(merged)) {
  for(const n of links(d.start))check(!!d.nodes[n],`Start fehlt: ${id}.${n}`);
  for(const [n,v] of Object.entries(d.nodes)) {
    if(n==='start' && additions[id])continue;
    nodeCount++;
    check(n.startsWith('k2n_'),`Knotenpräfix: ${id}.${n}`);
    keys(v,new Set(['text','choices',...effects]),`${id}.${n}`);
    check(typeof v.text==='string' && v.text.length>10,`Knotentext: ${id}.${n}`);
    for(const c of v.choices??[])keys(c,new Set(['text','next',...conditions]),`${id}.${n}.choice`);
  }
  walk(d,o=>{for(const n of links(o.next))check(!!d.nodes[n],`next fehlt im selben Dialog: ${id}.${n}`);});
}
for(const n of Object.values(npcs))check(!!dialogues[n.dialogue],`NPC-Dialog fehlt: ${n.dialogue}`);

// Konservative Kachelprüfung: nur eindeutig begehbarer Boden, Dekokollisionen,
// belegte Objektkacheln, erreichbare Bodenkomponente und sämtliche Streifensegmente.
const floors=new Set(['.',',','g','p','P','w','=','s','c']);
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
function blocked(m,[x,y]) {
  if(!floors.has(m.rows[y]?.[x]))return true;
  return (m.decor??[]).some(d=>{
    if(!d.solid)return false;
    const cx=d.tile[0]*16+8+(d.offset?.[0]??0)+(d.solid[2]??0);
    const cy=d.tile[1]*16+8+(d.offset?.[1]??0)+(d.solid[3]??0);
    return Math.abs(x*16+8-cx)<d.solid[0]/2+5 && Math.abs(y*16+8-cy)<d.solid[1]/2+5;
  });
}
function onPatrol(m,[x,y]) {
  return (m.patrols??[]).some(p=>p.route.some((a,i)=>{
    const b=p.route[(i+1)%p.route.length];
    return (x-a[0])*(b[1]-a[1])===(y-a[1])*(b[0]-a[0]) && x>=Math.min(a[0],b[0])&&x<=Math.max(a[0],b[0])&&y>=Math.min(a[1],b[1])&&y<=Math.max(a[1],b[1]);
  }));
}
function reachable(m,t){
  const todo=[m.spawns.default],seen=new Set();
  while(todo.length){const a=todo.pop(),k=a.join(',');if(seen.has(k)||blocked(m,a))continue;seen.add(k);if(same(a,t))return true;for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])todo.push([a[0]+dx,a[1]+dy]);}
  return false;
}
const placedIds=new Set();
for(const p of placements){
  keys(p,new Set(['map','tile','npc','interactable','visible_if']),'platzierung');
  keys(p.visible_if??{},conditions,'platzierung.visible_if');
  const m=registry.maps.get(p.map),id=p.npc??p.interactable?.id;
  check(p.map!=='wx_altstadt','Unzulässige Altstadt-Platzierung');
  check(!!p.npc!==!!p.interactable,`NPC oder Interactable erforderlich: ${id}`);
  check(id?.startsWith('k2n_'),`Platzierungs-ID: ${id}`);
  check(!placedIds.has(id),`Doppelte Platzierung: ${id}`);placedIds.add(id);
  if(!m)continue;
  check(!blocked(m,p.tile),`Blockierte Kachel: ${id} ${p.tile}`);
  check(reachable(m,p.tile),`Kachel nicht vom Standardspawn erreichbar: ${id}`);
  check(!onPatrol(m,p.tile),`Streifenroute berührt: ${id}`);
  check(![...(m.npcs??[]),...(m.interactables??[])].some(o=>same(o.tile,p.tile)),`Bestandsobjekt belegt Kachel: ${id}`);
  if(p.interactable){
    const it=p.interactable;
    keys(it,new Set(['id','kind','title','text','prompt','marker','done_flag','effects']),'interactable');
    check(it.kind==='read'&&it.done_flag?.startsWith('k2n_'),`Read ohne Einmal-Flag: ${id}`);
    check(it.text.split(/\s+/).length<=120,`Lesetext länger als 120 Wörter: ${id}`);
  }
}
for(const [id,def]of Object.entries(q)){
  keys(def,new Set(['title','kind','case','summary','steps']),id);
  check(def.kind==='side'&&def.case==='kapitel2',`Questformat: ${id}`);
  check(def.steps.length>=3&&def.steps.length<=6,`Schrittzahl: ${id}`);
  for(const s of def.steps){
    keys(s,new Set(['text','done','target']),id+'.step');keys(s.done,conditions,id+'.done');
    const m=registry.maps.get(s.target.map);
    check(m && ([...(m.npcs??[]),...(m.interactables??[])].some(o=>o.id===s.target.id)||placements.some(p=>p.map===m.id&&(p.npc??p.interactable?.id)===s.target.id)),`Questziel fehlt auf Karte: ${id} ${s.target.id}`);
  }
}
for(const [id,u]of Object.entries(upgrades)){
  keys(u,new Set(['name','flag','quelle','wirkung','deko']),id);
  check(id.startsWith('k2n_')&&id===u.flag&&newFlags.has(u.flag)&&!!q[u.quelle],`Ausbau ohne Quelle/Erzeuger: ${id}`);
}
check(Object.keys(q).length===10,'Es müssen zehn Quests sein.');
check(Object.keys(npcs).length<=4,'Mehr als vier neue NPCs.');
check(Object.keys(upgrades).length===6,'Es müssen sechs Ausbauten sein.');

// Zustandsraumsuche nur für das neue Paket. Kartenwege/Kämpfe der Hauptstory sind
// nicht simuliert; jeder Akt beginnt mit seinen kanonischen Freischaltungen.
// Nerven und Bindung zählen hier nicht als Zugangssperren. Runtime-Lücken stehen
// in offene_punkte.md. Negative wanted-Werte werden nicht als funktionierend getestet.
const starts=[1,1,2,2,3,3,3,4,4,5];
let pathsChecked=0;
function meets(o,s){
  const all=(xs,f)=>(xs??[]).every(f),none=(xs,f)=>(xs??[]).every(x=>!f(x));
  return all(o.requires_flags,f=>s.flags.includes(f))&&none(o.hide_if_flags,f=>s.flags.includes(f))&&
    all(o.requires_clues,c=>s.clues.includes(c))&&none(o.hide_if_clues,c=>s.clues.includes(c))&&
    (!o.requires_any_clues||o.requires_any_clues.some(c=>s.clues.includes(c)))&&
    all(o.requires_conclusions,c=>s.conclusions.includes(c))&&none(o.hide_if_conclusions,c=>s.conclusions.includes(c))&&
    all(o.requires_quests_active,x=>s.quests[x]==='active')&&all(o.requires_quests_done,x=>s.quests[x]==='done')&&none(o.hide_if_quests,x=>!!s.quests[x])&&
    all(o.requires_items,i=>(s.items[i]??0)>0)&&none(o.hide_if_items,i=>(s.items[i]??0)>0)&&s.money>=(o.requires_money??0);
}
function apply(e,s){
  const n=structuredClone(s);
  n.flags=[...new Set([...n.flags,...e.sets_flags??[]])].filter(f=>!(e.clears_flags??[]).includes(f)).sort();
  n.clues=[...new Set([...n.clues,...e.gives_clues??[]])].sort();
  for(const id of e.start_quests??[])n.quests[id]='active';
  for(const id of e.complete_quests??[])n.quests[id]='done';
  for(const [id,v]of Object.entries(e.gives_items??{}))n.items[id]=(n.items[id]??0)+v;
  for(const [id,v]of Object.entries(e.takes_items??{})){check((n.items[id]??0)>=v,`Unbezahlbare Item-Abgabe: ${id}`);n.items[id]-=v;}
  n.money+=(e.gives_money??0)-(e.takes_money??0);check(n.money>=0,'Geld unter null');
  for(const d of cases.deductions)if(d.pairs.some(pair=>pair.every(f=>n.clues.some(c=>cases.clues[c]?.fact===f))))n.conclusions=[...new Set([...n.conclusions,d.id])].sort();
  return n;
}
for(const [qi,[qid,quest]]of Object.entries(Object.entries(q))){
  const act=starts[qi],flags=['k2_met_zunder','k2_zunder_free',...Array.from({length:act-1},(_,i)=>`k2_akt${i+1}_done`)];
  // New quest roots are existing hubs or NPC start nodes. Internal choices keep
  // their dialog-local destination; terminal reward nodes return to the world.
  const roots=[];
  for(const [did,d]of Object.entries(merged)){
    const rootNode=additions[did]?d.nodes.start:d.nodes[d.start];
    for(const c of rootNode.choices??[]){
      const n=d.nodes[c.next];
      if(n?.start_quests?.includes(qid)||c.requires_quests_active?.includes(qid))roots.push({did,c});
    }
  }
  const reads=placements.filter(p=>p.interactable&&(p.interactable.effects?.start_quests?.includes(qid)||p.visible_if.requires_quests_active?.includes(qid)));
  const endings=new Set();
  for(const [did,d]of Object.entries(merged))for(const[n,e]of Object.entries(d.nodes))if(e.complete_quests?.includes(qid))endings.add(did+':'+n);
  const seenEnds=new Set(), queue=[{flags,clues:[],conclusions:[],quests:{['k2_akt'+act]:'active'},items:{akademierobe:1,torfkittel:1,fischerjacke:1},money:0,at:null}];
  const seen=new Set();let states=0;
  while(queue.length){
    const s=queue.pop(),key=JSON.stringify(s);if(seen.has(key))continue;seen.add(key);states++;
    if(states>30000){errors.push(`Zustandsraum zu groß: ${qid}`);break;}
    function enter(did,n){
      const e=merged[did].nodes[n];if(!e)return;
      const t=apply(e,s);t.at=[did,n];
      if(e.complete_quests?.includes(qid)){
        seenEnds.add(did+':'+n);pathsChecked++;
        check(quest.steps.every(step=>meets(step.done,t)),`Offener Schritt trotz Abschluss: ${qid}/${n}`);
        check((e.gives_money??0)>0||Object.keys(e.gives_items??{}).length>0||(e.honor??0)>0||Object.values(e.bond??{}).some(v=>v>0),`Abschluss ohne Belohnung: ${qid}/${n}`);
        // No terminal may link back to a reward or leave a quest entry enabled.
        check(!(e.choices??[]).some(c=>c.next),`Belohnungsknoten nicht terminal: ${qid}/${n}`);
        check(!roots.some(({did,c})=>meets(c,t)&&merged[did].nodes[c.next]?.start_quests?.includes(qid)),`Wiederholbarer Queststart: ${qid}`);
        continueAfterEnd(t);
      } else queue.push(t);
    }
    function continueAfterEnd(t){check(!roots.some(({c})=>c.requires_quests_active?.includes(qid)&&meets(c,t)),`Abgeschlossene Quest erneut abgebbar: ${qid}`);}
    if(s.at){
      const[did,n]=s.at;for(const c of merged[did].nodes[n].choices??[])if(meets(c,s)){if(c.next)enter(did,c.next);else queue.push({...s,at:null});}
    }else{
      // Verkleidungen am vorhandenen Kleiderhaken wechseln, nie mehrere zugleich.
      for(const outfit of ['torfkittel','fischerjacke','akademierobe']){
        const f='k2_wear_'+outfit;if(!s.flags.includes(f))queue.push({...s,flags:[...s.flags.filter(f=>!f.startsWith('k2_wear_')),f].sort()});
      }
      for(const {did,c} of roots)if(meets(c,s))enter(did,c.next);
      for(const p of reads){const e=p.interactable;if(meets(p.visible_if,s)&&!s.flags.includes(e.done_flag)){const t=apply({...e.effects,sets_flags:[...e.effects?.sets_flags??[],e.done_flag]},s);queue.push(t);}}
    }
  }
  check(endings.size>=2,`Keine echte Endauswahl: ${qid}`);
  for(const e of endings)check(seenEnds.has(e),`Unerreichbares Ende: ${qid}/${e}`);
  console.log(`${qid}: ${seenEnds.size}/${endings.size} Enden erreichbar (${states} Zustände)`);
}

if(errors.length){console.error([...new Set(errors)].map(e=>'FEHLER: '+e).join('\n'));process.exit(1);}
console.log(`OK: ${files.length} JSON-Dateien; 10 Quests; ${nodeCount} Dialogknoten; ${placements.length} Platzierungen; 6 Ausbauten.`);
console.log('OK: IDs, next, Flag-Erzeuger, Referenzen, Kacheln, Streifenrouten und Questziele.');
console.log('OK: Alle 22 Questenden erreichbar; Abschlussbedingungen und Einmal-Abgaben geprüft.');
console.log('HINWEIS: Datenprüfung, kein Ingame-Test. wanted:-1, Zunder-Bindung und Kahn-Wirkungen brauchen den dokumentierten Einbau.');
