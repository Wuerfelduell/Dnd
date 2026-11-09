import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
const entries = (x) => Object.entries(x ?? {});
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? files(resolve(dir,d.name)) : [resolve(dir,d.name)]);
}
function parse(path) {
  try { return JSON.parse(readFileSync(path,'utf8')); }
  catch (e) { errors.push(`${relative(root,path)}: ${e.message}`); return {}; }
}
function walk(x, fn, at='') {
  if (!x || typeof x !== 'object') return;
  fn(x, at);
  for (const [k,v] of entries(x)) walk(v,fn,`${at}/${k}`);
}
const json = files(here).filter(f => f.endsWith('.json'));
const pack = Object.fromEntries(json.map(f => [f.slice(f.lastIndexOf('/')+1,-5),parse(f)]));
const expected = ['geplauder','kampf','dialog_zusaetze','quests','dialogues','case','items','encounters','platzierung'];
check(expected.every(k=>k in pack) && json.length===expected.length,'JSON-Lieferumfang stimmt nicht.');
for (const f of ['README.md','hintergrund.md','grafikwuensche.md','offene_punkte.md']) check(files(here).includes(resolve(here,f)),`${f} fehlt.`);
const names = ['maps','npcs','items','encounters','quests','dialogues','facts','clues','deductions'];
const registries = Object.fromEntries(names.map(n=>[n,new Map()]));
const flags = new Set(['koop_aktiv']);
const externalIds = Object.fromEntries(names.map(n=>[n,new Set()]));
function flagsIn(x) {
  walk(x,o=>{
    for (const f of o.sets_flags ?? []) flags.add(f);
    if (typeof o.done_flag==='string') flags.add(o.done_flag);
  });
}
function register(kind,data) {
  if (!data || typeof data!=='object') return;
  for (const [k,v] of (Array.isArray(data) ? data.map(v=>[v.id,v]) : entries(data))) {
    if (k) registries[kind].set(k,v);
  }
}
const sourceFiles = files(resolve(root,'src/data')).filter(f=>f.endsWith('.json'));
for (const file of sourceFiles) {
  const data=parse(file), path=relative(resolve(root,'src/data'),file).replaceAll('\\','/');
  flagsIn(data);
  if (/^maps\//.test(path)) register('maps',[data]);
  if (/^dialogues\//.test(path)) register('dialogues',data);
  for (const kind of names) {
    if (path===`${kind}.json` || path.startsWith('packs/') && path.endsWith(`/${kind}.json`)) register(kind,data);
    if (kind in data) register(kind,data[kind]);
    if (data.case?.[kind]) register(kind,data.case[kind]);
  }
}
for (const kind of names) externalIds[kind]=new Set(registries[kind].keys());
const prefix = (id,where) => check(typeof id==='string' && id.startsWith('koop_'),`${where}: neue ID ohne koop_: ${id}`);
for (const kind of ['quests','dialogues','items','encounters']) {
  for (const id of Object.keys(pack[kind]??{})) {
    prefix(id,kind); check(!externalIds[kind].has(id),`${kind}: Kollision ${id}`);
  }
  register(kind,pack[kind]);
}
for (const kind of ['facts','clues','deductions']) {
  const data=pack.case?.[kind]??{};
  for (const id of Array.isArray(data)?data.map(x=>x.id):Object.keys(data)) {
    prefix(id,kind); check(!externalIds[kind].has(id),`${kind}: Kollision ${id}`);
  }
  register(kind,data);
}
flagsIn(pack);
const ref=(kind,id,where)=>check(registries[kind].has(id),`${where}: unbekannte ${kind}-ID ${id}`);
const listRefs = {requires_items:'items',hide_if_items:'items',takes_items:'items',requires_clues:'clues',hide_if_clues:'clues',requires_any_clues:'clues',gives_clues:'clues',requires_conclusions:'deductions',hide_if_conclusions:'deductions',start_quests:'quests',complete_quests:'quests',requires_quests_active:'quests',requires_quests_done:'quests',hide_if_quests:'quests'};
walk(pack,(o,at)=>{
  for (const key of ['requires_flags','hide_if_flags','clears_flags']) for (const f of o[key]??[]) {
    const battle=f.startsWith('won_') && registries.encounters.has(f.slice(4));
    check(flags.has(f)||battle,`${at}/${key}: Flag ohne Quelle ${f}`);
  }
  for (const f of o.sets_flags??[]) prefix(f,at);
  if(o.done_flag) prefix(o.done_flag,at);
  if(typeof o.map==='string') ref('maps',o.map,at);
  if(typeof o.npc==='string') ref('npcs',o.npc,at);
  if(typeof o.dialogue==='string') ref('dialogues',o.dialogue,at);
  if(typeof o.encounter==='string') ref('encounters',o.encounter,at);
  if(typeof o.fact==='string') ref('facts',o.fact,at);
  for(const [key,kind] of entries(listRefs)) if(o[key]) for(const id of Array.isArray(o[key])?o[key]:Object.keys(o[key])) ref(kind,id,`${at}/${key}`);
  for(const id of Object.keys(o.gives_items??{})) ref('items',id,at);
  if(o.pairs) for(const pair of o.pairs) for(const id of pair) ref('facts',id,at);
  for(const [k,v] of entries(o)) if(typeof v==='string' && ['text','a','b','summary','intro','desc'].includes(k)) check(!/[—–]/.test(v),`${at}/${k}: Gedankenstrich im Text`);
});
const nodeFields = new Set(['text','choices','sets_flags','clears_flags','gives_items','takes_items','gives_money','takes_money','gives_clues','start_quests','complete_quests','honor','bond','wanted','encounter','travel','nerves','unruhe','damage','heal','scene','shop']);
const conditions = new Set(['requires_flags','hide_if_flags','requires_items','hide_if_items','requires_clues','hide_if_clues','requires_any_clues','requires_conclusions','hide_if_conclusions','requires_quests_active','requires_quests_done','hide_if_quests','requires_money','requires_honor','requires_nerves','max_nerves','requires_bond','requires_pathway']);
const shape=(obj,allowed,at)=>{ for(const key of Object.keys(obj??{})) check(allowed.has(key),`${at}: unerlaubtes Feld ${key}`); };
function links(value,nodes,at) {
  if(value==null) return;
  if(typeof value==='string') check(value in nodes,`${at}: Zielknoten fehlt: ${value}`);
  else if(Array.isArray(value)) for(const b of value) {shape(b,new Set(['node',...conditions]),at);links(b.node,nodes,at);}
  else errors.push(`${at}: ungültiges Routing`);
}
let nodeCount=0;
function dialogue(id,d,added=false) {
  const own=added?d.nodes_add:d.nodes;
  const base=added?registries.dialogues.get(id)?.nodes??{}:{};
  const nodes={...base,...own};
  shape(d,new Set(added?['choices_add','nodes_add']:['start','nodes']),id);
  if(!added) links(d.start,nodes,`${id}/start`);
  const choices=(cs,at)=>{
    for(const c of cs??[]) {shape(c,new Set(['text','next',...conditions]),at);check(typeof c.text==='string'&&c.text.length>0,`${at}: leere Choice`);links(c.next,nodes,at);}
  };
  if(added) choices(d.choices_add,id);
  for(const [n,o] of entries(own)) {
    prefix(n,`${id}/nodes`);check(!(n in base),`${id}: überschreibt Knoten ${n}`);shape(o,nodeFields,`${id}/${n}`);
    check(typeof o.text==='string'&&o.text.length>0,`${id}/${n}: Text fehlt`);choices(o.choices,`${id}/${n}`);nodeCount++;
  }
}
for(const [id,d] of entries(pack.dialogues)) dialogue(id,d);
const npcList=['marlowe','holt','pimm','greta','quill','kit','zunder','sedge','hale','brack','druce','elsbeth'];
check(Object.keys(pack.dialog_zusaetze??{}).sort().join()===npcList.sort().join(),'Die zwölf Figuren stimmen nicht.');
for(const [id,d] of entries(pack.dialog_zusaetze)) {
  ref('dialogues',id,'Zusatz');ref('npcs',id,'Zusatz');dialogue(id,d,true);
  check(Object.keys(d.nodes_add??{}).length>=2&&Object.keys(d.nodes_add??{}).length<=4,`${id}: 2–4 Knoten nötig`);
  check(d.choices_add?.every(c=>c.requires_flags?.includes('koop_aktiv')),`${id}: Koop-Sperre fehlt`);
}
const ids=new Set(); const objects=new Map([...registries.maps].map(([id,m])=>[id,new Set([...(m.interactables??[]),...(m.npcs??[])].map(o=>o.id))]));
for(const p of pack.platzierung??[]) {
  shape(p,new Set(['map','tile','visible_if','interactable','npc']),'Platzierung');
  shape(p.visible_if,conditions,'visible_if');
  const o=p.interactable;
  if(!o) {ref('npcs',p.npc,'Platzierung');continue;}
  prefix(o.id,'Interactable');check(!ids.has(o.id),`Doppelte Objekt-ID ${o.id}`);ids.add(o.id);
  const m=registries.maps.get(p.map);if(!m) continue;
  check(!objects.get(p.map).has(o.id),`Objektkollision ${p.map}/${o.id}`);objects.get(p.map).add(o.id);
  check(Array.isArray(p.tile)&&p.tile.length===2&&p.tile.every(Number.isInteger),`${o.id}: ungültige Kachel`);
  const [x,y]=p.tile??[];check(y>=0&&y<m.rows.length&&x>=0&&x<m.rows[y].length,`${o.id}: außerhalb der Karte`);
  shape(o,new Set(['id','kind','marker','title','prompt','role','dialogue','text','footer','done_flag','effects']),o.id);
  check(p.visible_if?.requires_flags?.includes('koop_aktiv'),`${o.id}: Koop-Sichtbarkeit fehlt`);
  if(o.kind==='read')check(o.text.split(/\s+/).length<=120,`${o.id}: Lesetext zu lang`);
}
check(Object.keys(pack.quests??{}).length===3,'Drei Quests erwartet.');
for(const [id,q] of entries(pack.quests)) {
  shape(q,new Set(['title','kind','case','summary','steps','reward']),id);check(q.kind==='side',`${id}: kein Nebenauftrag`);check(q.reward?.gives_money===0,`${id}: automatische Nebenquest-Prämie nicht unterdrückt`);
  for(const s of q.steps??[]) {
    shape(s,new Set(['text','done','target']),id);shape(s.done,conditions,id);
    ref('maps',s.target?.map,id);check(objects.get(s.target?.map)?.has(s.target?.id),`${id}: Questziel fehlt ${s.target?.id}`);
  }
  const rewards=Object.values(pack.dialogues).flatMap(d=>Object.values(d.nodes)).filter(n=>n.complete_quests?.includes(id));
  check(rewards.length===2&&rewards.every(n=>n.gives_money>0),`${id}: zwei belohnte Entscheidungen erwartet`);
}
const g=pack.geplauder??[], seen=new Set();let kg=0,wx=0;
check(Array.isArray(g)&&g.length===80,'Genau 80 Gespräche erwartet.');
for(const r of g) {
  shape(r,new Set(['id','map','zeilen',...conditions]),r.id);prefix(r.id,'Geplauder');check(!seen.has(r.id),`Doppelte ID ${r.id}`);seen.add(r.id);
  ref('maps',r.map,r.id);const isWx=r.map.startsWith('wx_')||['treffen_salz','treffen_lichtlose'].includes(r.map);isWx?wx++:kg++;
  check(r.requires_flags?.includes('koop_aktiv'),`${r.id}: Koop-Sperre fehlt`);
  check(r.zeilen?.length>=2&&r.zeilen.length<=4,`${r.id}: 2–4 Zeilen nötig`);
  check(r.zeilen?.some(z=>z.p==='p1')&&r.zeilen?.some(z=>z.p==='p2'),`${r.id}: beide Sprecher nötig`);
  for(const z of r.zeilen??[]) {
    check(['p1','p2'].includes(z.p),`${r.id}: unbekannter Sprecher`);
    shape(z,new Set(z.p==='p2'?['p','a','b']:['p','text']),r.id);
    if(z.p==='p2') check(typeof z.a==='string'&&typeof z.b==='string'&&z.a.trim()&&z.b.trim()&&z.a!==z.b,`${r.id}: beide eigenständigen p2-Stimmen nötig`);
    else check(typeof z.text==='string'&&z.text.trim(),`${r.id}: p1-Text fehlt`);
  }
}
check(kg===40&&wx===40,`Verteilung ist ${kg}/${wx}, erwartet 40/40.`);
const events=['kampfbeginn','bossbeginn','partner_ko','partner_aufgestellt','parade','kombi','sieg','knapper_sieg','flucht'].map(x=>'koop_'+x);
check(Object.keys(pack.kampf??{}).sort().join()===events.sort().join(),'Kampfanlässe stimmen nicht.');let shouts=0;
for(const [id,event] of entries(pack.kampf)) {
  prefix(id,'Kampf');shape(event,new Set(['p1','p2a','p2b']),id);
  for(const [speaker,count] of [['p2a',10],['p2b',10],['p1',5]]) {
    const lines=event[speaker]??[];check(lines.length===count,`${id}/${speaker}: ${count} Varianten nötig`);
    check(new Set(lines).size===lines.length,`${id}/${speaker}: doppelte Sprüche`);
    for(const s of lines){check(typeof s==='string'&&s.trim().split(/\s+/).length>=1&&s.trim().split(/\s+/).length<=6,`${id}/${speaker}: Spruch außerhalb 1–6 Wörter: ${s}`);shouts++;}
  }
}
// Inspect route reachability and terminal reward isolation without pretending to implement spatial logic.
for(const [id,d] of entries(pack.dialogues)) {
  const reachable=new Set();const visit=n=>{if(reachable.has(n)||!d.nodes[n])return;reachable.add(n);for(const c of d.nodes[n].choices??[])for(const target of typeof c.next==='string'?[c.next]:(c.next??[]).map(b=>b.node))visit(target);};
  for(const n of typeof d.start==='string'?[d.start]:d.start.map(b=>b.node))visit(n);
  check(reachable.size===Object.keys(d.nodes).length,`${id}: unerreichbare Knoten`);
  for(const [n,o] of entries(d.nodes)) if(o.gives_money) {
    const incoming=Object.values(d.nodes).flatMap(v=>v.choices??[]).filter(c=>c.next===n);
    check(incoming.length>0&&incoming.every(c=>c.requires_flags?.includes('koop_aktiv')&&c.requires_quests_active?.length),`${id}/${n}: Auszahlung ohne Koop-/Quest-Sperre`);
    check(o.complete_quests?.length===1&&o.sets_flags?.some(f=>f.endsWith('_fertig')),`${id}/${n}: Auszahlung ohne Abschluss`);
    check(o.choices.every(c=>!c.next),`${id}/${n}: Belohnung darf keine Schleife haben`);
  }
}
if(errors.length) { console.error(`FEHLER (${errors.length}):\n`+errors.map(e=>`- ${e}`).join('\n'));process.exitCode=1; }
else {
  console.log(`OK: ${json.length} JSON-Dateien gültig; ${sourceFiles.length} Quelldateien eingelesen.`);
  console.log(`OK: 80 Gespräche (Kettlegate ${kg}, Wexmoor ${wx}); alle p2-Zeilen mit a/b.`);
  console.log(`OK: 9 Kampfanlässe, ${shouts} Sprüche, je 1–6 Wörter.`);
  console.log(`OK: 12 Figuren mit je 3 Zusatzknoten; ${nodeCount} neue Dialogknoten insgesamt.`);
  console.log(`OK: 3 Quests, 6 belohnte Endentscheidungen, ${ids.size} Kartenobjekte.`);
  console.log('OK: Start/next, Flagquellen, Referenzen, Präfixe, Questziele und Koordinatengrenzen.');
  console.log('HINWEIS: koop_aktiv ist extern. Gleichzeitigkeit, Rollenbindung und Ereignisanbindung sind noch einzubauen.');
}
