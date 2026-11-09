#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {compileStueck,validateInstrumente} from '../../../src/core/MusicSynth.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const dir=path.join(root,'public/audio/musik');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bank=validateInstrumente(read(path.join(dir,'instrumente.json')));
const music=read(path.join(root,'public/audio/manifest-musik-dunscar.json'));
const sounds=read(path.join(root,'public/audio/manifest-klang-dunscar.json'));
const expectedMusic='ankunft stadt_tag stadt_nacht speisewagen pruefhaus horchen nachtzug brueche rufschlucht kampf boss gallowmere unterschicht pruefung feierabend stilllegung vollzaehlig'.split(' ').map(x=>'ds_'+x);
const expectedSounds=[...Array.from({length:16},(_,i)=>`ds_ruf_${String(i+1).padStart(2,'0')}`),...Array.from({length:16},(_,i)=>`ds_hall_${String(i+1).padStart(2,'0')}`),...'horch_an horch_aus ladung_leer ladung_voll falsches_muster richtiges_muster zug_pfiff_fern zug_fahrt zug_bremse schalter_klingel phonograph walze_start kalkstaub geruest_wind klopfen_fern stimmen_murmeln schwellenhund_bellen vorhauer_schlag vielrufer_chor gallowmere_pfeife unterschicht_atem'.split(' ').map(x=>'ds_'+x)];
const expectedMaps='endbahnhof schwellenring arbeiterbogen kalkmarkt bruchstufen signalhang speisewagen runddepot pruefhaus teesaal lohnbuero nachtzug_wagen nachtzug_lok rangierwueste klopfbruch rufschlucht letzter_bahnsteig unterschicht'.split(' ').map(x=>'ds_'+x);
const eqKeys=(o,expected)=>assert.deepEqual(Object.keys(o).sort(),expected.toSorted?expected.toSorted():[...expected].sort());
eqKeys(music.tracks,expectedMusic);eqKeys(sounds.klaenge,expectedSounds);eqKeys(music.zuordnung.maps,expectedMaps);
assert.deepEqual(music.zuordnung.kampf,{standard_kapitel3:'ds_kampf',boss_kapitel3:'ds_boss',gallowmere:'ds_gallowmere',unterschicht:'ds_unterschicht',pruefung:'ds_pruefung'});
const scores=new Map(),compiled=new Map(),files=fs.readdirSync(dir).filter(x=>x.startsWith('ds_'));
for(const file of files){
 assert(file.endsWith('.json'));assert(fs.statSync(path.join(dir,file)).size<=60000,file);
 const raw=read(path.join(dir,file));assert.equal(raw.format,'nebel-musik-1');
 const entries=raw.art==='sammlung'?Object.entries(raw.stuecke):[[raw.id,raw]];
 for(const [id,s]of entries){assert.equal(s.id,id);assert(!scores.has(id));const c=compileStueck(s,bank);assert(c.events.length>0,id);scores.set(id,{s,file});compiled.set(id,c);
 if(s.art==='musik'){
  assert.equal(file,id+'.json');
  if(s.loop){assert(s.loop_ab>0);assert.equal(s.ablauf.filter(x=>x==='intro').length,1);assert(new Set(s.ablauf.slice(s.loop_ab)).size>=3);}
  else assert(['ds_feierabend','ds_stilllegung','ds_vollzaehlig'].includes(id));
 }
 console.log(`${id}: ${c.duration.toFixed(2)} s${s.loop?` (intro ${c.loopStart.toFixed(2)} s, loop ${c.loopDuration.toFixed(2)} s)`:''}`);
 }
}
for(const [manifest,key]of [[music,'tracks'],[sounds,'klaenge']]){
 assert.equal(manifest.format,'nebel-musik-1');assert.equal(manifest.base,'audio/musik/');
 for(const[id,e]of Object.entries(manifest[key])){assert.equal(scores.get(id)?.file,e.file);assert(e.volume>=0&&e.volume<=1);const s=scores.get(id).s;assert.equal(s.art,key==='tracks'?'musik':'klang');if(key==='klaenge'){assert.equal(e.loop,s.loop);if(e.zeichen)assert.equal(e.zeichen,s.zeichen);}}
}
const leaves=x=>x&&typeof x==='object'?Object.values(x).flatMap(leaves):[x];
for(const id of leaves(music.zuordnung))assert(id in music.tracks,id);
assert.equal(scores.size,70);assert.equal(files.length,21);
const signatures=new Set();
for(let i=1;i<=16;i++){
 const n=String(i).padStart(2,'0'),a=scores.get('ds_ruf_'+n).s,b=scores.get('ds_hall_'+n).s;
 assert(compiled.get(a.id).duration>=.5&&compiled.get(a.id).duration<=2);assert(a.zeichen);
 assert.deepEqual(a.muster,b.muster);assert.deepEqual(a.spuren,b.spuren);assert.equal(a.zeichen,b.zeichen);
 assert(b.lautstaerke<a.lautstaerke);assert(b.echo.verzoegerung_ms>=250&&b.echo.verzoegerung_ms<=600);assert(b.echo.tiefpass);
 const signature=a.muster.signal.noten;assert(!signatures.has(signature));signatures.add(signature);
}
const full='e5:3 r:1 e5:3 r:1 c5:8 | g5:16';
for(const[id,{s}]of scores){const patterns=Object.values(s.muster).map(p=>p.noten);assert.equal(patterns.includes(full),id==='ds_feierabend',id);}
const packagePaths=[...files.map(f=>path.join(dir,f)),path.join(root,'public/audio/manifest-musik-dunscar.json'),path.join(root,'public/audio/manifest-klang-dunscar.json'),path.join(root,'docs/audio/README-dunscar.md'),fileURLToPath(import.meta.url)];
assert(packagePaths.length<=30);for(const p of packagePaths)assert(fs.statSync(p).size<=60000,p);
console.log(`PASS: 17 music pieces, 53 sounds, 16 exact call/echo pairs, 18 maps, 5 combat mappings; ${packagePaths.length} files, each <= 60000 bytes.`);
