#!/usr/bin/env node
// No npm packages. FFmpeg/ffprobe executables are required to decode OGG/MP3.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const m=read('public/audio/manifest-sfx4.json'),catalog=read('docs/story/sfx4/catalog.json');
const task=fs.readFileSync(path.join(root,'docs/art/codex_DS_rituale_klang.md'),'utf8');
const source=task.split('## 1.')[1].split('## 4.')[0];
const expected=[...new Set([...source.matchAll(/`([a-z0-9_]+)`/g)].map(x=>x[1]).filter(x=>!['s4r','schatten','rituale56'].includes(x)))];
assert.equal(expected.length,92,'Task ID set changed; inspect new task');assert.deepEqual(Object.keys(m.sounds).sort(),expected.sort());
const variants={s4la_laterne_angegriffen:2,s4la_monster_zischt:3,s4ma_faust:3,s4ke_trinken_reihe:5,s4ei_last_aechzt:2,s4wa_kauf:3,s4mo_zersetzen:3,s4mo_moorwasser_trinken:2,schatten_schritt:2,schatten_attacke:3,sud_zutat:3,s5_diebstahl:2,probe_echo_stimme:3,schloss_dietrich:3};
const loopIds=['s4la_nachfuellen_loop','s4la_amb_nacht','s4la_unruhe_puls','s4fa_traum_amb','schatten_amb','sud_brodeln_loop'];
const ambient=new Set(['s4la_amb_nacht','s4fa_traum_amb','schatten_amb']);
assert.equal(m.batch,'sfx4');assert.equal(m.base,'audio/sfx/');assert.deepEqual(m.formats,['ogg','mp3']);assert.equal(catalog.length,117);
const cats=new Map(catalog.map(r=>[r.id,r]));assert.equal(cats.size,117);
const seen=new Set(),decoded=new Set();let files=0,loops=0,bytes=0,minRms=Infinity,maxPeak=0,maxSeam=0,maxDC=0;
const report=[];
for(const[id,s]of Object.entries(m.sounds)){
 assert.match(id,/^[a-z0-9_]+$/);assert.equal(s.variants||1,variants[id]||1);assert.equal(s.loop,loopIds.includes(id));assert(s.note.length>15);
 assert(s.volume>=(ambient.has(id)?.15:.2)&&s.volume<=(ambient.has(id)?.35:.7));
 assert.equal(s.group,id.startsWith('schatten_')?'schatten':id.startsWith('s4')?'s4r':'rituale56');
 for(let v=1;v<=(s.variants||1);v++){
  const name=id+(s.variants?'_'+v:'');const c=cats.get(name);assert(c);assert.equal(c.base_id,id);assert.equal(c.variant,v);assert.equal(c.duration,s.duration);seen.add(name);
  for(const ext of m.formats){
   const f=path.join(root,'public',m.base,name+'.'+ext),data=fs.readFileSync(f);bytes+=data.length;
   if(ext==='ogg')assert.equal(data.subarray(0,4).toString(),'OggS');
   const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',f]));
   assert.equal(probe.streams.length,1);const stream=probe.streams[0];assert.equal(stream.codec_name,ext==='ogg'?'vorbis':'mp3');assert.equal(+stream.sample_rate,44100);assert.equal(stream.channels,1);
   // MP3 container duration includes codec padding. Audible gapless duration is checked below.
   assert(+probe.format.duration<(s.loop?8.08:4),name+' container duration');
   const b=execFileSync('ffmpeg',['-v','error','-i',f,'-f','f32le','-ac','1','-ar','44100','pipe:1'],{maxBuffer:4e6});
   assert(b.length>0&&b.length%4===0);let sum=0,power=0,peak=0;
   for(let j=0;j<b.length;j+=4){const x=b.readFloatLE(j);assert(Number.isFinite(x));sum+=x;power+=x*x;peak=Math.max(peak,Math.abs(x));}
   const n=b.length/4,duration=n/44100,rms=Math.sqrt(power/n),dc=Math.abs(sum/n);
   assert(Math.abs(duration-s.duration)<(s.loop?.004:.03),name+' decoded duration');assert(duration<=(s.loop?8.001:3.999),name+' duration limit');assert(rms>.001,name+' silence');assert(peak<.95,name+' clipping');assert(dc<.01,name+' DC');
   minRms=Math.min(minRms,rms);maxPeak=Math.max(maxPeak,peak);maxDC=Math.max(maxDC,dc);
   const hash=crypto.createHash('sha256').update(b).digest('hex');assert(!decoded.has(hash),name+' duplicated waveform');decoded.add(hash);
   let seam=0;
   if(s.loop){seam=Math.abs(b.readFloatLE(0)-b.readFloatLE(b.length-4));assert(seam<.04,name+' loop discontinuity');maxSeam=Math.max(maxSeam,seam);loops++;
    // A seamless loop must not conceal its boundary behind a silence gap.
    let edgeEnergy=0;const edge=441;for(let j=0;j<edge;j++)edgeEnergy+=b.readFloatLE(j*4)**2+b.readFloatLE(b.length-4-j*4)**2;assert(Math.sqrt(edgeEnergy/(2*edge))>.001,name+' silent loop edge');
   }
   report.push({id:name,format:ext,duration,rms,peak,seam,sha256:crypto.createHash('sha256').update(data).digest('hex')});files++;
  }
 }
}
assert.equal(seen.size,117);assert.equal(files,234);assert.equal(loops,12);
for(const file of fs.readdirSync(path.join(root,'public/audio')).filter(f=>/^manifest-sfx.*\.json$/.test(f)&&f!=='manifest-sfx4.json')){
 const prior=read('public/audio/'+file);for(const id of Object.keys(m.sounds))assert(!prior.sounds?.[id],`Duplicate existing ID in ${file}: ${id}`);
}
console.log(`PASS: 92 required IDs, 117 variants, ${files} decoded OGG/MP3 files, ${loops} loop files; complete task coverage.`);
console.log(`PASS: mono 44100 Hz; limits, manifest duration, variant counts, levels, non-silence, unique decoded audio, codec signatures.`);
console.log(`PASS: RMS min ${minRms.toFixed(6)}, peak max ${maxPeak.toFixed(6)}, seam max ${maxSeam.toFixed(6)}, DC max ${maxDC.toFixed(6)}; ${bytes} bytes.`);
fs.writeFileSync(path.join(here,'validation.json'),JSON.stringify({files,loops,bytes,minRms,maxPeak,maxSeam,maxDC,report},null,2)+'\n');
execFileSync(process.execPath,[path.join(here,'pruefen_musik.mjs')],{stdio:'inherit'});
