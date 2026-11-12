import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const m=read('public/audio/manifest-sfx4.json'),cat=read('docs/story/sfx4/catalog.json'),hashes=read('docs/story/sfx4/checksums.json');
const source=fs.readFileSync(path.join(root,'docs/story/sfx4/generate.py'),'utf8').split("SPEC='''")[1].split("'''")[0];
const expected=Object.fromEntries(source.split('\n').map(row=>{const [id,v,d,recipe,event]=row.split('|');return[id,{v:+v,d:+d,recipe,event}];}));
assert.deepEqual(Object.keys(m.sounds).sort(),Object.keys(expected).sort());assert.deepEqual(Object.keys(cat.events).sort(),Object.keys(expected).sort());
assert.equal(Object.keys(expected).length,92);assert.equal(Object.values(expected).reduce((n,e)=>n+e.v,0),117);
assert.equal(m.batch,'sfx4');assert.equal(m.base,'audio/sfx/');assert.deepEqual(m.formats,['ogg','mp3']);
const loops=new Set(['s4la_nachfuellen_loop','s4la_amb_nacht','s4fa_traum_amb','schatten_amb','sud_brodeln_loop']);
const ambient=new Set(['s4la_amb_nacht','s4fa_traum_amb','schatten_amb']);
const checks=new Set(),used=[],readme=fs.readFileSync(path.join(root,'docs/story/sfx4/README.md'),'utf8');
let files=0,variants=0,minRms=1,maxPeak=0,maxSeam=0,bytes=0;
for(const [id,s] of Object.entries(m.sounds)){
 const e=expected[id];assert.match(id,/^[a-z0-9_]+$/);assert.equal(s.variants||1,e.v);assert.equal(s.duration,e.d);assert.equal(cat.events[id],e.event);assert.equal(cat.recipes[id],e.recipe);
 assert.equal(s.group,id.startsWith('schatten_')?'schatten':id.startsWith('s4')?'s4r':'rituale56');
 assert.equal(!!s.loop,loops.has(id));assert(s.volume>=(ambient.has(id)?.15:.2)&&s.volume<=(ambient.has(id)?.35:.7));assert(readme.includes('`'+id+'`'),id+' missing mapping');
 variants+=e.v;
 for(let v=1;v<=e.v;v++)for(const ext of m.formats){
  const rel=m.base+id+(e.v>1?'_'+v:'')+'.'+ext,f=path.join(root,'public',rel);used.push(rel);
  const data=fs.readFileSync(f);bytes+=data.length;assert.equal(crypto.createHash('sha256').update(data).digest('hex'),hashes[rel]);
  const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',f]));
  assert.equal(info.streams.length,1);assert.equal(info.streams[0].codec_name,ext==='ogg'?'vorbis':'mp3');assert.equal(+info.streams[0].sample_rate,24000);assert.equal(info.streams[0].channels,1);
  assert(+info.format.duration<(s.loop?8.1:4),rel+' container limit including MP3 padding');
  const pcm=execFileSync('ffmpeg',['-v','error','-i',f,'-ac','1','-ar','24000','-f','f32le','pipe:1'],{maxBuffer:4e6});
  const len=pcm.length/4,duration=len/24000;assert(len>0&&Number.isInteger(len));assert(Math.abs(duration-s.duration)<.025,rel+' decoded duration');assert(s.loop?duration<=8.001:duration<4);
  let energy=0,peak=0;for(let i=0;i<len;i++){const x=pcm.readFloatLE(i*4);assert(Number.isFinite(x));energy+=x*x;peak=Math.max(peak,Math.abs(x));}
  const rms=Math.sqrt(energy/len);assert(rms>.001,rel+' silence');assert(peak<.98,rel+' clipping');minRms=Math.min(minRms,rms);maxPeak=Math.max(maxPeak,peak);
  const hash=crypto.createHash('sha256').update(pcm).digest('hex');assert(!checks.has(hash),rel+' duplicate PCM');checks.add(hash);
  if(s.loop){const seam=Math.abs(pcm.readFloatLE(0)-pcm.readFloatLE(pcm.length-4));assert(seam<.04,rel+' loop discontinuity');maxSeam=Math.max(seam,maxSeam);}
  files++;
 }
}
assert.deepEqual(Object.keys(hashes).sort(),used.sort());
for(const name of fs.readdirSync(path.join(root,'public/audio')).filter(n=>/^manifest-sfx.*\.json$/.test(n)&&n!=='manifest-sfx4.json')){
 const prev=read('public/audio/'+name);for(const id of Object.keys(m.sounds))assert(!prev.sounds?.[id],`${name}: duplicate ID ${id}`);
}
console.log(`PASS: ${Object.keys(m.sounds).length} IDs, ${variants} Varianten, ${files} OGG/MP3-Dateien, ${loops.size} Schleifen.`);
console.log('PASS: Sollkatalog, Ereignisse, SHA-256, Codecs, 24 kHz mono, Pegel, Dauergrenzen, keine identischen PCM-Dateien.');
console.log(`PASS: kleinster RMS ${minRms.toFixed(6)}, größte Spitze ${maxPeak.toFixed(6)}, größte Loop-Naht ${maxSeam.toFixed(6)}; ${(bytes/1e6).toFixed(3)} MB.`);
console.log('Dauerprüfung: dekodierte Nutzdaten; MP3-Container bei 8-s-Loops bis 8,1 s mit Encoder-Padding.');
await import('./pruefen_musik.mjs');
