import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../../..');
function parseUnique(text){
 const value=JSON.parse(text),stack=[];
 const tokens=text.match(/"(?:\\.|[^"\\])*"|[{}\[\],:]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g)||[];
 for(const t of tokens){
  if(t==='{')stack.push({object:true,keys:new Set(),key:true});
  else if(t==='[')stack.push({object:false});
  else if(t==='}'||t===']')stack.pop();
  else if(t===','&&stack.at(-1)?.object)stack.at(-1).key=true;
  else if(t.startsWith('"')&&stack.at(-1)?.object&&stack.at(-1).key){const frame=stack.at(-1),k=JSON.parse(t);assert(!frame.keys.has(k),'Doppelter JSON-Schlüssel: '+k);frame.keys.add(k);frame.key=false;}
 }
 return value;
}
const read=f=>parseUnique(fs.readFileSync(path.join(root,f),'utf8'));
if(process.argv.includes('--self-test')){
 assert.throws(()=>parseUnique('{"a":1,"a":2}'));
 assert.throws(()=>parseUnique('{"x":{"a":1,"a":2}}'));
 assert.deepEqual(parseUnique('{"a":{"x":1},"b":{"x":2}}'),{a:{x:1},b:{x:2}});
 console.log('PASS: doppelte Schlüssel erkannt; getrennte Objekte erlaubt.');
}
const local=f=>read('docs/story/benannte_gegner/'+f+'.json');
const enemies=local('gegner'),best=local('bestiarium'),appear=local('auftritt'),loot=local('beute');
const ids=Object.keys(enemies),cities=['kettlegate','wexmoor','dunscar','calderwick','briarholt','varrowmouth'];
function nonempty(o){if(typeof o==='string')assert(o.trim().length,'Leertext');else if(o&&typeof o==='object')Object.values(o).forEach(nonempty);}
[enemies,best,appear,loot].forEach(nonempty);
assert.equal(ids.length,24);assert.deepEqual(Object.keys(best).sort(),[...ids].sort());assert.deepEqual(Object.keys(appear.gegner).sort(),[...ids].sort());
const known=new Set(),baseData=new Map(),zones=new Set();
function scan(o){if(!o||typeof o!=='object')return;for(const[k,v]of Object.entries(o)){known.add(k);if(v&&typeof v==='object'&&v.hp&&v.attacks)baseData.set(k,v);if(v&&typeof v==='object'&&v.encounters&&v.travel)zones.add(k);scan(v);}}
function files(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(d,e.name)):e.name.endsWith('.json')?[path.join(d,e.name)]:[]);}
for(const p of [...files(path.join(root,'src/data')), ...files(path.join(root,'docs/story/vorrat_gegner'))])scan(JSON.parse(fs.readFileSync(p,'utf8')));
const cz=path.join(root,'docs/story/k6_gegner/encounters.json');if(fs.existsSync(cz))scan(JSON.parse(fs.readFileSync(cz,'utf8')));
const cu=path.join(root,'docs/story/k6_orte/zones.json');if(fs.existsSync(cu))scan(JSON.parse(fs.readFileSync(cu,'utf8')));
let pending=[];
for(const city of cities)assert.equal(ids.filter(id=>enemies[id].stadt===city).length,4,city);
for(const id of ids){
 const e=enemies[id];assert.match(id,/^bn_[a-z0-9_]+$/);assert.equal(e.einmalig,true);assert(e.fleeable);assert(e.eigenheit&&e.schwaeche);
 for(const x of Object.values(e.faktoren))assert(x>=1.6&&x<=2.5);
 assert(Number.isInteger(e.nerven_schaden)&&e.nerven_schaden>0);assert.equal(e.erscheinen.chance,.1);assert(e.erscheinen.zonen.includes(e.zone));for(const z of e.erscheinen.zonen)assert(zones.has(z)||['vm_grenzzaun','vm_leuchtbank','vm_wrackfeld'].includes(z),z);assert.deepEqual(e.erscheinen.sequenz_nummern,[1,2,3,4,5,6]);
 assert.deepEqual(e.erscheinen.forbids_flags,[id+'_besiegt']);assert.deepEqual(e.on_win.set_flags,[id+'_besiegt']);assert.equal(e.erscheinen.sichtung_flag,id+'_gesichtet');
 assert.equal(e.beute_fest.n,1);assert.equal(e.loot.drops.length,1);assert.equal(e.loot.drops[0].chance,1);assert.equal(e.loot.drops[0].item,e.beute_fest.item);
 assert(known.has(e.beute_fest.item)||loot.beutestuecke[e.beute_fest.item],`Item ${e.beute_fest.item}`);
 assert.equal(appear.gegner[id].erscheinen.length,2);assert(appear.gegner[id].fall);assert(best[id].seite_eigen);
 const sentences=best[id].geschichte.match(/[^.!?]+[.!?]+/g)||[];assert(sentences.length>=3&&sentences.length<=5,`Sätze ${id}`);
 if(!baseData.has(e.grundlage)){assert(e.ableitung,`Basis ${e.grundlage}`);assert(e.grundlage.startsWith('vme_'));pending.push(e.grundlage);}
 else if(!e.hp){pending.push('Zahlenableitung '+e.grundlage);}else if(e.hp){assert.equal(e.hp,Math.ceil(e.basis_snapshot.hp*e.faktoren.hp));assert(e.attacks.length);for(let i=0;i<e.attacks.length;i++){const a=e.attacks[i];assert.equal(a.damage,id==='bn_der_leise_waechter'?0:Math.ceil(e.basis_snapshot.damage[i]*e.faktoren.damage));assert.equal(a.nerves,e.nerven_schaden);assert(a.hits.length);}}
 if(!zones.has(e.zone)){assert(e.zone.startsWith('vm_'),`Zone ${e.zone}`);if(!fs.existsSync(cu))pending.push(e.zone);else assert(zones.has(e.zone),`CU-Zone ${e.zone}`);}
}
assert.equal(Object.keys(loot.beutestuecke).length,8);assert.equal(Object.keys(loot.artefakte).length,8);
for(const [id,l] of Object.entries(loot.beutestuecke)){
 assert.match(id,/^bnl_[a-z_]+$/);assert.equal(l.id,id);assert.equal(ids.filter(k=>enemies[k].beute_fest.item===id).length,1);
 const a=loot.artefakte['fa_'+id];assert(a);assert.equal(a.id,'fa_'+id);assert.equal(a.beutestueck,id);assert(a.chance>=.4&&a.chance<=.7);assert(a.lohn_vorschlag>=80&&a.lohn_vorschlag<=220);assert.equal(a.auftrag.menge,1);assert.equal(a.auftrag.misslungen.lohn_rueckgabe_faktor,.5);
 for(const k of ['beschreibung','untersuchen','wirkung_text','nachteil_text','oda_zeile','oda_pruefen'])assert(a[k]);assert(!a.oda_pruefen.includes('%'));
}
for(const xs of [appear.gerede,appear.zeitung])assert.equal(new Set(xs.map(x=>x.id)).size,xs.length);
assert.equal(appear.gerede.length,12);assert.equal(appear.zeitung.length,6);
for(const city of cities){assert.equal(appear.gerede.filter(x=>x.stadt===city).length,2);assert.equal(appear.zeitung.filter(x=>x.stadt===city).length,1);}
for(const x of [...appear.gerede,...appear.zeitung])for(const flag of x.requires_flags)assert(ids.some(id=>flag===id+'_gesichtet'));
if(process.argv.includes('--art')){const m=read('public/sprites/manifest-benannte.json'),assetFiles=new Set(m.assets.map(a=>a.file));for(const id of ids)for(const f of [`battle/enemy_${id}.png`,`characters/${id}.png`,`portraits/heads/${id}.png`,`ui/bestiar/${id}.png`])assert(assetFiles.has(f),f);for(const id of [...Object.keys(loot.beutestuecke),...Object.keys(loot.artefakte)])for(const sub of ['items/','items/32/'])assert(assetFiles.has(sub+id+'.png'));assert(assetFiles.has('fx/bn_auftritt.png'));assert(assetFiles.has('ui/bn_symbole.png'));for(const a of m.assets)assert(fs.existsSync(path.join(root,'public/sprites',a.file)));console.log('PASS: 130 Grafikdateien vollständig referenziert.');}
pending=[...new Set(pending)];if(pending.length){console.log('OFFEN (CZ/CU): '+pending.join(', '));assert(!process.argv.includes('--strict-dependencies'),'CZ/CU fehlen noch; kein Laufzeiteinbau freigegeben.');}
console.log('PASS: 24 Gegner / 6 Städte; 24 Geschichten; 72 Auftrittszeilen; 12 Gerüchte; 6 Meldungen.');
console.log('PASS: 8 Beutestücke / 8 Artefakte; Faktoren, berechnete Werte, Referenzen, Flags, Chancen und Texte.');
