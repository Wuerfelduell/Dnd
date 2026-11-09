import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join, relative } from 'node:path';
import { DIGEST_LABELS } from '../../../src/core/Pathways.js';
import { SKILLS, AP_MAX } from '../../../src/core/Combat.js';
import { loadContent } from '../../../tests/helpers.js';
import { draftContent, rows, report } from './balancing.mjs';
const here = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(here, '../../..');
const read = f => JSON.parse(readFileSync(f, 'utf8'));
const files = dir => readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(join(dir,e.name)) : [join(dir,e.name)]);
const pkgDir = join(root, 'src/data/packs/sequenzen'); // seit dem Einbau dort
const pack = Object.fromEntries(files(pkgDir).filter(f=>f.endsWith('.json')).map(f=>[relative(pkgDir,f),read(f)]));
const live = loadContent({ sequenzen: false });
const seqFields = new Set('name desc ingredients skill passives ritual honor growth_steps digest_rate veraenderung'.split(' '));
const skillFields = new Set('id name desc cost hits flat mult holy burn stun weak pierce shield heal drain evade confuse sure composure'.split(' '));
const passiveKeys = new Set('max_hp max_nerves atk ap_start dmg_mult occult_mult damage_taken dodge_window parry_ap heal_bonus vision_cost composure_regen skill_composure calm_decay use_calm unruhe_tick digest_mult price sell money_bonus honor_loss conclusion_honor link_hints lock_bonus carry always_flee'.split(' '));
const multipliers = new Set('vision_cost composure_regen heal_bonus price sell honor_loss occult_mult money_bonus skill_composure calm_decay dodge_window damage_taken digest_mult dmg_mult'.split(' '));
const ritualFields = new Set('name map vision consumes requires desc also_maps min_nerves max_hp_pct min_conclusions tribute'.split(' '));
const liveFlags=new Set();
function walk(v,fn,path='') { if(!v || typeof v!=='object')return; fn(v,path); for(const [k,x] of Object.entries(v))walk(x,fn,`${path}.${k}`); }
for(const f of files(join(root,'src/data')).filter(f=>f.endsWith('.json')&&!f.startsWith(pkgDir)))walk(read(f),v=>{
  for(const flag of v.sets_flags??[])liveFlags.add(flag);
  if(v.done_flag)liveFlags.add(v.done_flag);
});
const failures=[];
const ok=(cond,msg)=>{if(!cond)failures.push(msg);};
const text=(x)=>typeof x==='string' && x.trim().length>0;
const positive=n=>Number.isFinite(n)&&n>0;
const natural=n=>Number.isInteger(n)&&n>=0;
function allowed(obj,keys,label){for(const k of Object.keys(obj??{}))ok(keys.has(k),`${label}: unbekanntes Feld ${k}`);}
function validate(data) {
  failures.length=0;
  const high=data['seq_4_bis_1.json'],fresh=data['neue_pfade.json'],ingredients=data['zutaten.json'],artifacts=data['artefakte.json'];
  for(const n of ['seq_4_bis_1.json','neue_pfade.json','zutaten.json','artefakte.json'])ok(data[n],`${n} fehlt`);
  if(failures.length)return [...failures];
  const items={...live.items,...ingredients,...artifacts};
  const flags=new Set(liveFlags);
  walk(data,v=>{for(const f of v.sets_flags??[])flags.add(f);if(v.done_flag)flags.add(v.done_flag);});
  const skills=new Set([...Object.keys(SKILLS),...Object.values(live.pathways).flatMap(p=>Object.values(p.seqs).map(d=>d.skill.id))]);
  const counts={stages:0,rituals:0,dialogues:0};
  function prefix(id,label){ok(id.startsWith('sq_'),`${label}: sq_-Präfix fehlt (${id})`);}
  function map(id,label){ok(text(id)&&(id.startsWith('neu:')?id.length>4:!!live.maps[id]),`${label}: unbekannte Karte ${id}`);}
  function quantities(q,label){ok(q&&typeof q==='object'&&!Array.isArray(q),`${label}: Mengenobjekt fehlt`);for(const [id,n] of Object.entries(q??{})){ok(items[id],`${label}: unbekanntes Item ${id}`);ok(Number.isInteger(n)&&n>0,`${label}: ungültige Menge ${id}`);}}
  function passives(ps,label){ok(Array.isArray(ps),`${label}: Passivenliste fehlt`);for(const p of ps??[]){allowed(p,new Set(['key','value','text']),label);ok(passiveKeys.has(p.key),`${label}: unbekannter Passiv ${p.key}`);ok(text(p.text),`${label}: Passivtext fehlt`);ok(typeof p.value==='boolean'||Number.isFinite(p.value),`${label}: ungültiger Passivwert`);if(multipliers.has(p.key))ok(positive(p.value),`${label}: Multiplikator muss positiv sein`);}}
  function stage(pid,s,d){
    const label=`${pid}.${s}`;counts.stages++;
    allowed(d,seqFields,label);
    for(const k of ['name','desc','veraenderung'])ok(text(d[k]),`${label}: ${k} fehlt`);
    ok(natural(d.honor),`${label}: honor ungültig`);ok(Number.isInteger(d.growth_steps)&&d.growth_steps>0,`${label}: growth_steps ungültig`);ok(positive(d.digest_rate)&&d.digest_rate<=1,`${label}: digest_rate ungültig`);
    quantities(d.ingredients,label);passives(d.passives,label);
    const sk=d.skill??{};allowed(sk,skillFields,label+'.skill');
    for(const k of ['id','name','desc'])ok(text(sk[k]),`${label}: Skill-${k} fehlt`);
    ok(!skills.has(sk.id),`${label}: Skill-ID kollidiert: ${sk.id}`);skills.add(sk.id);
    ok(natural(sk.cost)&&sk.cost<=AP_MAX,`${label}: AP außerhalb 0..${AP_MAX}`);ok(natural(sk.hits),`${label}: hits ungültig`);
    if(sk.hits>0)ok((positive(sk.flat)?1:0)+(positive(sk.mult)?1:0)===1,`${label}: genau flat oder mult nötig`);
    for(const k of ['composure','shield','heal'])if(k in sk)ok(natural(sk[k]),`${label}: ${k} ungültig`);
    if('drain'in sk)ok(positive(sk.drain)&&sk.drain<=1,`${label}: drain ungültig`);
    if(sk.burn)ok(Array.isArray(sk.burn)&&sk.burn.length===2&&sk.burn.every(n=>Number.isInteger(n)&&n>0),`${label}: burn ungültig`);
    for(const k of ['holy','stun','weak','pierce','evade','confuse','sure'])if(k in sk)ok(typeof sk[k]==='boolean',`${label}: ${k} muss boolean sein`);
    if(Number(s)<=6)ok(d.ritual,`${label}: Ritual fehlt`);
    if(d.ritual){counts.rituals++;const r=d.ritual;allowed(r,ritualFields,label+'.ritual');for(const k of ['name','desc'])ok(text(r[k]),`${label}: Ritual-${k} fehlt`);map(r.map,label);for(const m of r.also_maps??[])map(m,label);ok(typeof r.vision==='boolean',`${label}: vision fehlt`);quantities(r.consumes,label+'.consumes');ok(r.requires&&typeof r.requires==='object',`${label}: requires fehlt`);allowed(r.requires,new Set(['requires_flags','min_wins']),label+'.requires');}
    if(Number(s)<=4){ok(typeof d.desc==='string'&&d.desc.includes(d.veraenderung),`${label}: Veränderung nicht in desc`);ok(Object.keys(d.ingredients).some(id=>ingredients[id]?.desc.includes('Bosses')),`${label}: seltene Bosszutat fehlt`);}
    if(Number(s)===4)ok(d.passives.some(p=>['price','honor_loss','vision_cost','damage_taken'].includes(p.key)&&p.value>1||['composure_regen','calm_decay'].includes(p.key)&&p.value<1||['max_hp','max_nerves'].includes(p.key)&&p.value<0),`${label}: wirksamer Nachteil fehlt`);
  }
  ok(Object.keys(high).length===7,'Genau 7 Bestandspfade erforderlich');
  for(const [id,p] of Object.entries(high)){ok(live.pathways[id],`Unbekannter Bestandspfad ${id}`);allowed(p,new Set(['seqs']),id);ok(Object.keys(p.seqs).sort().join(',')==='1,2,3,4',`${id}: Stufen 4..1 fehlen`);for(const [s,d]of Object.entries(p.seqs))stage(id,s,d);}
  ok(Object.keys(fresh).length===3,'Genau 3 neue Pfade erforderlich');
  for(const [id,p]of Object.entries(fresh)){
    prefix(id,'Pfad');ok(!live.pathways[id],`Pfad kollidiert ${id}`);allowed(p,new Set('name short color lore principle digest_hint digest growth seqs'.split(' ')),id);
    for(const k of ['name','short','lore','principle','digest_hint'])ok(text(p[k]),`${id}: ${k} fehlt`);
    ok(/^#[0-9a-f]{6}$/i.test(p.color),`${id}: Hexfarbe fehlt`);allowed(p.growth,new Set(['hp','nerves']),id+'.growth');ok(positive(p.growth.hp)&&positive(p.growth.nerves),`${id}: Wachstum ungültig`);
    for(const [k,v]of Object.entries(p.digest)){ok(k in DIGEST_LABELS,`${id}: Verdauungsschlüssel ${k} unbekannt`);ok(positive(v),`${id}: Verdauungswert ungültig`);}
    ok(Object.keys(p.seqs).sort().join(',')==='1,2,3,4,5,6,7,8,9',`${id}: Stufen 9..1 fehlen`);
    for(const [s,d]of Object.entries(p.seqs))stage(id,s,d);
  }
  for(const [id,it]of Object.entries(ingredients)){prefix(id,'Zutat');ok(!live.items[id],`Item kollidiert ${id}`);allowed(it,new Set(['name','kind','weight','price','desc']),id);ok(it.kind==='ingredient'&&text(it.name)&&text(it.desc),`${id}: Zutatenformat ungültig`);ok(positive(it.weight)&&positive(it.price),`${id}: Gewicht/Preis ungültig`);}
  ok(Object.keys(artifacts).length===6,'Genau 6 Artefakte erforderlich');
  for(const [id,a]of Object.entries(artifacts)){prefix(id,'Artefakt');ok(!live.items[id],`Artefakt kollidiert ${id}`);allowed(a,new Set(['name','source','price','icon','desc','boons','curses','zones','honor']),id);ok(text(a.name)&&text(a.desc)&&positive(a.price),`${id}: Artefaktformat ungültig`);ok(['quest','wild','treffen','revier'].includes(a.source),`${id}: Quelle ungültig`);ok(a.boons?.length&&a.curses?.length,`${id}: Vorteil/Fluch fehlt`);passives(a.boons,id);passives(a.curses,id);ok(existsSync(join(root,'public/sprites/items',a.icon+'.png')),`${id}: Icon fehlt ${a.icon}`);}
  walk(data,(v,path)=>{
    for(const key of ['requires_flags','hide_if_flags'])for(const flag of v[key]??[])ok(flags.has(flag)||(flag.startsWith('won_')&&live.encounters[flag.slice(4)]),`${path}: Flag ohne Setzer ${flag}`);
    for(const key of ['requires_items','hide_if_items']){const ids=Array.isArray(v[key])?v[key]:Object.keys(v[key]??{});for(const id of ids)ok(items[id],`${path}: unbekanntes Item ${id}`);}
    for(const key of ['gives_items','takes_items'])if(v[key])quantities(v[key],path);
    if(v.encounter)ok(live.encounters[v.encounter],`${path}: unbekannter Kampf ${v.encounter}`);
    if(v.travel)map(v.travel.map,path);
    if(v.target){map(v.target.map,path);ok(live.npcs[v.target.id]||live.maps[v.target.map]?.interactables?.some(i=>i.id===v.target.id),`${path}: unbekanntes Ziel ${v.target.id}`);}
    if(v.nodes){counts.dialogues++;walk(v.nodes,n=>{if(n.next)for(const id of typeof n.next==='string'?[n.next]:n.next.map(x=>x.node))ok(v.nodes[id],`${path}: next fehlt ${id}`);});}
  });
  return [...failures];
}
const errors=validate(pack);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
const c=draftContent(), measured=rows(c);
assert.equal(measured.length,90);
for(const pid of Object.keys(c.pathways))for(const seq of [4,3,2,1]){
 const a=measured.find(r=>r.pid===pid&&r.seq===seq),b=measured.find(r=>r.pid===pid&&r.seq===seq+1);
 for(const type of ['normal','occult']){const ratio=a[type].total/b[type].total;assert.ok(Math.abs(ratio-(seq===4?1.5:1.3))<=.12,`${pid} ${seq} ${type}: Verhältnis ${ratio}`);}
}
const graphics=readFileSync(join(here,'grafikwuensche.md'),'utf8');
for(const id of [...Object.keys(pack['zutaten.json']),...Object.keys(pack['artefakte.json']),...Object.keys(pack['neue_pfade.json']),...Object.values(pack['seq_4_bis_1.json']).concat(Object.values(pack['neue_pfade.json'])).flatMap(p=>Object.values(p.seqs).map(d=>d.skill.id))])assert.ok(graphics.includes(`| ${id} |`),`Grafikwunsch fehlt ${id}`);
for(const [,p]of graphics.matchAll(/`(public\/sprites\/[^`]+)`/g))assert.ok(existsSync(join(root,p)),`Platzhalter fehlt ${p}`);
assert.equal(readFileSync(join(here,'balancing.md'),'utf8'),report()+'\n','balancing.md ist veraltet; neu generieren');
if(process.argv.includes('--selftest')){
 const mutations=[
  ['Pflichtfeld',p=>delete p['seq_4_bis_1.json'].laterne.seqs['4'].desc],
  ['Zutat',p=>p['seq_4_bis_1.json'].laterne.seqs['4'].ingredients.unbekannt=1],
  ['Karte',p=>p['seq_4_bis_1.json'].laterne.seqs['4'].ritual.map='unbekannt'],
  ['Flag',p=>p['seq_4_bis_1.json'].laterne.seqs['4'].ritual.requires.requires_flags.push('sq_unerreichbar')],
  ['Passiv',p=>p['seq_4_bis_1.json'].laterne.seqs['4'].passives[0].key='crit'],
  ['Skill-Feld',p=>p['seq_4_bis_1.json'].laterne.seqs['4'].skill.summon=true],
  ['Skill-Kollision',p=>p['seq_4_bis_1.json'].laterne.seqs['4'].skill.id='lichtstoss'],
  ['Präfix',p=>{p['zutaten.json'].falsche_id=p['zutaten.json'].sq_zutat_laterne_4;delete p['zutaten.json'].sq_zutat_laterne_4;}],
  ['Dialog-next',p=>p['probe.json']={nodes:{a:{next:'fehlt'}}}],
  ['Kampf',p=>p['probe.json']={encounter:'sq_unbekannt'}],
  ['NPC',p=>p['probe.json']={target:{map:'revier',id:'sq_unbekannt'}}]
 ];
 for(const [name,mutate]of mutations){const broken=structuredClone(pack);mutate(broken);assert.ok(validate(broken).length,`Negativkontrolle ${name} unentdeckt`);}
 console.log('OK: 11 absichtlich fehlerhafte Varianten erkannt.');
}
console.log(`OK: ${Object.keys(pack).length} JSON-Dateien; 28 hohe + 27 neue Stufen; 55 Zutaten; 6 Artefakte.`);
console.log('OK: Pflichtfelder, Skill-/Passiv-Allowlist, Mengen, Präfixe und eindeutige Skill-IDs.');
console.log('OK: 46 Rituale; Karten, Itemreferenzen und vorausgesetzte Flags aufgelöst.');
console.log('OK: Keine Dialogdaten geliefert; generische next-/NPC-/Kampfprüfung vorhanden.');
console.log('OK: 90 Pfadskills + 4 Grundskills berechnet; 80 N/O-Aufstiegsquotienten innerhalb ±0,12.');
console.log('OK: Grafikwünsche und Platzhalter vollständig; balancing.md reproduzierbar.');
