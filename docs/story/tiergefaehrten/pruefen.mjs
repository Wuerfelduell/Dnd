import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../../..');
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
const errors=[];const ok=(v,m)=>{if(!v)errors.push(m)};
const tiere=read('tiere.json'),b=read('beziehung.json'),r=read('reaktionen.json'),z=read('zeitung.json'),l=read('lesestuecke.json');
const ids=['tier_rabe','tier_kater','tier_hund','tier_ratte'];
const cities=['kettlegate','wexmoor','dunscar','calderwick','briarholt','varrowmouth'];
const source=ref=>{const [file,ptr]=ref.split('#');let d=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));for(const key of (ptr||'').split('/').filter(Boolean))d=d[key];return d;};
ok(JSON.stringify(Object.keys(tiere).sort())===JSON.stringify([...ids].sort()),'Tier-IDs');
const maps=new Set();
for(const name of fs.readdirSync(path.join(root,'src/data/maps')).filter(n=>n.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(path.join(root,'src/data/maps',name),'utf8'));if(d.id)maps.add(d.id);}
for(const f of ['src/data/wexmoor.json','src/data/packs/k3_orte/maps.json','src/data/packs/k4_orte/maps.json']){const d=JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));for(const m of (Array.isArray(d)?d:d.maps||[]))maps.add(m.id);}
let feed=0;
for(const id of ids){
 const a=tiere[id];ok(a.id===id,'id '+id);ok(maps.has(a.map),'Karte '+a.map);
 ok(a.description.split(/[.!?]+/u).filter(v=>v.trim()).length===3,'3 Sätze '+id);
 ok(a.flags.found===id+'_gefunden'&&a.flags.level===id+'_stufe'&&a.flags.active==='tier_aktiv','Flags '+id);
 const n=a.fund.nodes;ok(Object.keys(n).length>=8&&Object.keys(n).length<=12,'Fundumfang '+id);ok(n[a.fund.start],'Start '+id);
 const visited=new Set();const visit=k=>{if(visited.has(k))return;visited.add(k);const v=n[k];if(!v){errors.push('Fehlender Knoten '+id+'/'+k);return;}ok(typeof v.text==='string'&&v.text.length>12,'Fundtext '+id+'/'+k);if(v.next)visit(v.next);for(const c of v.choices||[])visit(c.next);};visit(a.fund.start);
 ok(visited.size===Object.keys(n).length,'unerreichbarer Fundtext '+id);ok(Object.values(n).filter(v=>v.choices?.length>=2).length===1,'genau eine Entscheidung '+id);
 const claims=Object.values(n).filter(v=>v.effects?.tier_claim);ok(claims.length===1&&claims[0].effects.tier_claim===id&&claims[0].effects.set_flags.includes(id+'_gefunden'),'Annahme '+id);
 ok(Object.values(n).filter(v=>v.end&&!v.effects).length===1,'Aufschub ohne Fundflag '+id);
 ok(Object.keys(a.feedReactions).join(',')==='0,1,2,3','Fütterstufen '+id);
 for(let i=0;i<4;i++){ok(a.feedReactions[i]?.length===2,'Fütterreaktionen '+id+'/'+i);feed+=a.feedReactions[i]?.length||0;}
 for(const [k,c] of [['giftMessages',4],['battleMessages',4],['officeLines',3],['coopLines',2]])ok(a[k]?.length===c,k+' '+id);
 for(const p of Object.values(a.art))ok(fs.existsSync(path.join(root,'public/sprites',p)),'Grafik fehlt '+p);
 const f=b.animals[id];ok(f.likes.length===3&&f.dislikes.length===1,'Futteranzahl '+id);ok(new Set([...f.likes,...f.dislikes]).size===4,'Futterduplikat '+id);
 for(const item of [...f.likes,...f.dislikes]){ok(item in b.foodSources,'Futterquelle '+item);try{ok(source(b.foodSources[item])?.kind==='consumable','kein vorhandenes Verbrauchsitem '+item);}catch(e){errors.push(item+': '+e.message);}}
 ok(f.levelBenefits.map(v=>v.level).join(',')==='0,1,2,3','Stufenvorteile '+id);
}
ok(b.levels.map(v=>v.level).join(',')==='0,1,2,3','Stufen');ok(b.levels.map(v=>v.points).join(',')==='0,2,5,9','Schwellen');
ok(b.levels.map(v=>v.combatUses).join(',')==='1,1,1,2','Kampfladungen');
ok(b.feeding.maxProgressFeedsPerAnimalPerDay===1&&!b.feeding.dislikedConsumesItem,'Fütterlimits');
for(const id of [b.mechanics.cat.defaultItem,...b.mechanics.cat.choiceAtLevel1]){let found=false;for(const ref of Object.values(b.foodSources))if(ref.endsWith('/'+id))found=true;const base=JSON.parse(fs.readFileSync(path.join(root,'src/data/items.json'),'utf8'));ok(found||id in base,'Belohnungsitem '+id);}
ok(r.stadtgerede.length===30,'30 Gerüchte');for(const c of cities)ok(r.stadtgerede.filter(v=>v.city===c).length===5,'5 Gerüchte '+c);
ok(new Set(r.stadtgerede.map(v=>v.text)).size===30,'Gerüchtduplikate');ok(r.figuren.length===10,'10 Meinungen');
for(const x of r.stadtgerede){ok(x.requires_active_companion===true,'Begleiterbedingung');if(x.requires_active_tier)ok(ids.includes(x.requires_active_tier),'Gerücht-Tier');}
let pending=0;
for(const x of r.figuren){ok(ids.includes(x.requires_active_tier),'Meinung-Tier');if(x.speaker==='vme_zollgeist'){pending++;ok(x.integration.includes('Sprecherbindung'),'Zollgeist-Einbaunotiz');continue;}try{ok(source(x.source)?.name,'Figurenquelle '+x.speaker);}catch(e){errors.push(e.message);}}
ok(r.figuren.some(v=>v.speaker==='wx_pfandleiherin'&&v.requires_active_tier==='tier_kater'),'Maud/Kater');
ok(z.length===4&&l.length===4,'Zeitung/Lesestücke');const words=[];
for(const [i,id] of ids.entries()){ok(z[i].requires_flags.includes(id+'_gefunden'),'Zeitungflag '+id);ok(l[i].requires_flags.includes(id+'_gefunden'),'Leseflag '+id);const count=l[i].text.trim().split(/\s+/u).length;words.push(count);ok(count>=100&&count<=150,'Lesestück-Wortzahl '+id+' '+count);}
const all=[...r.stadtgerede,...r.figuren,...z,...l];ok(new Set(all.map(v=>v.id)).size===all.length,'doppelte Text-ID');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'public/sprites/manifest-tiere.json'),'utf8'));ok(manifest.assets.length===20,'20 Grafikassets');
console.log(`DF Daten: ${ids.length} Tiere, 40 Fundknoten, ${feed} Fütterzeilen, 30 Gerüchte, 10 Meinungen, 4 Artikel, 4 Lesestücke (${words.join('/')} Wörter); ${errors.length} Fehler. ${pending} dokumentierte neue Sprecherbindung.`);
for(const e of errors)console.error(e);process.exitCode=errors.length?1:0;
