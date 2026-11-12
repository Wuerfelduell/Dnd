import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../..');
let checks=0;
const ok=(condition,message)=>{checks++;assert.ok(condition,message);};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function strings(v,p){
  if(typeof v==='string')ok(v.trim().length>0,`Leerer Text: ${p}`);
  else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))strings(x,p+'.'+k);
}
const files=['encounters.json','bosses.json','bestiarium.json','status.json'];
const data=Object.fromEntries(files.map(f=>{const raw=fs.readFileSync(path.join(here,f),'utf8');const d=JSON.parse(raw);strings(d,f);
  const ids=[...raw.matchAll(/^  "([a-z0-9_]+)":/gm)].map(m=>m[1]);ok(new Set(ids).size===ids.length,`Doppelte Top-Level-IDs ${f}`);return[f,d];}));
const e=data['encounters.json'],b=data['bosses.json'],s=data['status.json'],best=data['bestiarium.json'];
const enemies=['vme_zollgeist','vme_gezeitenlaeufer','vme_salzkruste','vme_salzkruste_rest','vme_tauwerk','vme_hafenkraehe','vme_pegelknecht'];
ok(JSON.stringify(Object.keys(e).sort())===JSON.stringify([...enemies].sort()),'Exakt sieben Gegnerformen inklusive Elite');
ok(Object.keys(b).sort().join()===['leuchtfeuerwaechter','pegelherrin','wrackmutter'].join(),'Exakt drei Bosse');
ok(Object.keys(s).sort().join()==='geblendet,gefesselt,verzeichnet','Exakt drei Status');
ok(new Set([...Object.keys(e),...Object.keys(b)]).size===10,'Kampf-IDs eindeutig');
const manifest=read(path.join(root,'public/sprites/manifest-varrowmouth4.json'));
const assets=new Map(manifest.assets.map(a=>[a.file,a]));
const external=new Set(manifest.externalAssets.map(a=>a.file));
const items=read(path.join(root,'src/data/items.json'));
const cuKnown=new Set(['vmi_zollsiegel','vmi_registerseite']);
const warnings=[];
const cuFile=path.join(root,'docs/story/k6_orte/items.json');
const cu=fs.existsSync(cuFile)?read(cuFile):{};
for(const [id,v] of Object.entries({...e,...b})){
  ok(/^[a-z0-9_]+$/.test(id),'ID '+id);ok(v.hp>0&&Number.isInteger(v.hp),id+' Leben');
  ok(v.chapter===6,id+' Kapitel');ok(v.attacks.length>0,id+' Angriffe');
  ok(v.balance.incoming_damage_cap_per_round>0,id+' Deckel positiv');
  const threshold=id==='vme_hafenkraehe'?v.hp*.5:id==='leuchtfeuerwaechter'?v.hp*.6:v.hp;
  const min=v.boss?5:4;
  ok(Math.ceil(threshold/v.balance.incoming_damage_cap_per_round)>=min,id+' Mindestdauer');
  // Adversarial solo and coop hit streams share one budget; more attackers must not shorten duration.
  for(const players of [1,2]){
    let hp=threshold,round=0;
    while(hp>0&&round<100){round++;let budget=v.balance.incoming_damage_cap_per_round;
      for(let hit=0;hit<players*12;hit++){const applied=Math.min(999999,budget);hp-=applied;budget-=applied;}}
    ok(round>=min,id+' Deckelsimulation '+players+' Spieler');
  }
  const sprite='battle/'+v.sprite+'.png';ok(assets.has(sprite)||external.has(sprite),id+' Sprite-Verweis');
  for(const a of v.attacks){
    ok(Number.isFinite(a.damage)&&a.damage>=0,id+' numerischer Basisschaden');
    ok(a.damage_range.length===2&&a.damage_range[0]>=0&&a.damage_range[0]<=a.damage&&a.damage<=a.damage_range[1],id+' Schadensspanne');
    ok(a.nerve_damage>=0&&a.hits.every(Number.isFinite),id+' Nerven/Timing');
    if(a.apply_status)ok(a.apply_status in s,id+' Status');
    if(a.effect)ok(assets.has(a.effect),id+' Effekt');
    if(assets.has(sprite))ok(a.animation in assets.get(sprite).animations,id+' Animation');
  }
  for(const d of v.loot.drops){ok(d.chance>=0&&d.chance<=1&&d.count>=1,id+' Beutechance');ok(d.item in items||cuKnown.has(d.item),id+' Beute-ID '+d.item);
    if(cuKnown.has(d.item)&&!(d.item in cu))warnings.push('CU-Auflösung ausstehend: '+d.item);}
  ok(best[id]?.description&&best[id]?.weakness_hint,id+' Bestiarium');
  for(const [type,multiplier] of Object.entries(v.resistances))ok(multiplier>0&&multiplier<=2,id+' Resistenz '+type);
  for(const phase of v.phases??[]){ok(phase.hp>0,id+' Phasenleben');ok(assets.has('battle/'+phase.sprite+'.png')||external.has('battle/'+phase.sprite+'.png'),id+' Phasengrafik');}
}
ok(e.vme_salzkruste.split.spawn[0].enemy==='vme_salzkruste_rest'&&e.vme_salzkruste.split.spawn[0].count===2,'Salzteilung');
ok(!e.vme_salzkruste_rest.split&&e.vme_salzkruste_rest.loot.drops.length===0,'Keine rekursiven Reste/Beute');
ok(e.vme_hafenkraehe.steal.max_items_per_battle===1,'Ein Vorrat insgesamt');
ok(e.vme_hafenkraehe.steal.eligible_items.every(id=>id in items),'Nur vorhandene Grundvorräte');
ok(e.vme_pegelknecht.spawn.group_size===2&&!e.vme_pegelknecht.partner_fall.stacking,'Elitepaar');
ok(b.wrackmutter.summon.count===2&&b.wrackmutter.summon.max_active_summons===2,'Beschwörung begrenzt');
const human=b.leuchtfeuerwaechter.phases[1];ok(human.attacks.length===0&&human.player_choice_required&&human.cancel_queued_hits&&human.clear_damage_over_time,'Mensch wehrlos und Entscheidung geschützt');
const p=b.pegelherrin;ok(p.phases[0].hp===1600&&p.phases[1].hp===2200,'Pegelherrin Leben');
for(const phase of p.phases)ok(Math.ceil(phase.hp/phase.incoming_damage_cap_per_round)>=5,'Pegelherrin fünf Runden pro Phase');
ok(p.peace.requires.all_four_act_iv_leads&&p.peace.lead_topics.length===4&&p.peace.requires.relationship.gte===3&&p.peace.skip_phase_2,'Friedlicher Pfad');
ok(p.ability_lock.every_n_rounds===3&&p.ability_lock.first_round===3,'Eintragen-Takt');
ok(p.ability_lock.countermeasures.protected_duration_rounds*2===p.ability_lock.countermeasures.reference_duration_rounds,'Gegenmittel halbiert Referenzdauer');
ok(!p.on_win.sets_flags.includes('k6_done'),'Finalentscheidung bleibt CT');
for(const [id,status] of Object.entries(s)){ok(status.duration_rounds>0&&status.clear_on_battle_end,id+' Dauer');ok(assets.has(status.icon),id+' Statusgrafik');}
warnings.push('CT: vier Fährten, Ratszeuge und Gesprächsknoten semantisch binden.','CU: Namenlos-Ring-Item-ID semantisch binden.','CY: beide Pegelherrin-Sheets werden extern geliefert.','Datenvertrag geprüft; kein Laufzeit- oder Playtest, da kein Spielcode geändert wird.');
const report={package:'CZ',status:'passed',checks,enemies:7,bosses:3,statuses:3,externalDependencies:[...new Set(warnings)]};
fs.writeFileSync(path.join(here,'pruefbericht.json'),JSON.stringify(report,null,2)+'\n');
console.log(`CZ: ${checks} Prüfungen bestanden; 7 Gegnerformen, 3 Bosse, 3 Status.`);
for(const warning of report.externalDependencies)console.log('ANSCHLUSS: '+warning);
