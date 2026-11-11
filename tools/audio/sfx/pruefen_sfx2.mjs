#!/usr/bin/env node
// Node built-ins only. Optional --decode uses the system ffmpeg executable.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=p=>fs.readFileSync(path.join(root,p));
const manifest=JSON.parse(read('public/audio/manifest-sfx2.json'));
const brief=read('docs/art/codex_CM_soundeffekte2.md').toString().split('## 1.')[1].split('## 10.')[0];
const expected=new Set([...brief.matchAll(/`([a-z][a-z0-9_]+)`/g)].map(m=>m[1]).filter(x=>x.includes('_')&&x!=='kampf_start'));
const variants={ds_ruf_senden:3,ds_kalk_rieseln:2,schritt_kalk:3,sk_chor_summen:3,fest_laterne_an:2,fest_boxring_treffer:3,fest_feuerwerk_knall:3,saison_laub:3,schritt_schnee:3,schritt_laub:3,starling_stern:8,auktion_hammer:2,cw_stempel:3,cw_letter_fall:3,schritt_terrasse:3,bh_ventil_rast:3,bh_dampf_austritt:2,schritt_glas:3,ls_landvermesser_tick:3};
const loops=new Set(['ds_zug_innen','ds_drehscheibe','ds_wachswalze','atmo_hochebene','sk_chor_summen','fest_menge','fest_lachen','saison_regen','saison_schnee','saison_hitze','fasserin_werkbank','cw_presse','cw_schraegaufzug','atmo_rohrpost','bh_ventil_drehen','bh_kondensat','bh_pflanze_spricht','atmo_glashaus','atmo_frost','ls_schlafkutsche']);
const groups=['dunscar','sekten','feste','okkult2','sozial','calderwick','briarholt','reise2','ui2'];
assert.equal(expected.size,120,'Task ID extraction changed; review brief');
assert.deepEqual(new Set(Object.keys(manifest.sounds)),expected,'Missing/extra IDs');
assert.equal(manifest.batch,'sfx2'); assert.equal(manifest.base,'audio/sfx/');
assert.deepEqual(manifest.formats,['ogg','mp3']);
const report=JSON.parse(read('tools/audio/sfx/validation-sfx2.json'));
const reported=new Map(report.files.map(x=>[x.file,x]));
const crcTable=Array.from({length:256},(_,i)=>{let r=i<<24;for(let b=0;b<8;b++)r=(r<<1)^((r&0x80000000)?0x04c11db7:0);return r>>>0;});
function oggInfo(buf){
  let p=0,granule=0n,serial=null,seq=0,packet=Buffer.alloc(0),header=null,eos=false;
  while(p<buf.length){
    assert.ok(p+27<=buf.length,'Truncated Ogg page');
    assert.equal(buf.toString('ascii',p,p+4),'OggS');assert.equal(buf[p+4],0);
    const count=buf[p+26],table=buf.subarray(p+27,p+27+count);
    assert.equal(table.length,count);
    const end=p+27+count+[...table].reduce((a,b)=>a+b,0);
    assert.ok(end<=buf.length,'Truncated Ogg payload');
    assert.equal(buf.readUInt32LE(p+18),seq++);
    serial??=buf.readUInt32LE(p+14);assert.equal(buf.readUInt32LE(p+14),serial);
    if(p===0) assert.ok(buf[p+5]&2,'Missing BOS');
    assert.ok(!eos,'Data after EOS');eos=!!(buf[p+5]&4);
    const gp=buf.readBigUInt64LE(p+6);if(gp!==0xffffffffffffffffn)granule=gp;
    const page=Buffer.from(buf.subarray(p,end));const checksum=page.readUInt32LE(22);page.writeUInt32LE(0,22);
    let crc=0;for(const byte of page)crc=((crc<<8)^crcTable[((crc>>>24)^byte)&255])>>>0;
    assert.equal(crc,checksum,'Ogg CRC mismatch');
    let offset=p+27+count;
    for(const len of table){packet=Buffer.concat([packet,buf.subarray(offset,offset+len)]);offset+=len;if(len<255){if(!header)header=packet;packet=Buffer.alloc(0);}}
    p=end;
  }
  assert.ok(eos,'Missing EOS');assert.equal(packet.length,0);
  assert.equal(header[0],1);assert.equal(header.toString('ascii',1,7),'vorbis');
  assert.equal(header.readUInt32LE(7),0);assert.equal(header[11],1,'Not mono');assert.equal(header.readUInt32LE(12),44100);
  return Number(granule)/44100;
}
let total=0,count=0,decoded=0,minPeak=0,maxPeak=-100,maxSeam=0;
const hashes=new Set(),pcmHashes=new Set();const counts={};const wantFiles=new Set();
for(const [id,s] of Object.entries(manifest.sounds)){
 assert.ok(groups.includes(s.group));counts[s.group]=(counts[s.group]??0)+1;
 assert.ok(Number.isFinite(s.volume)&&s.volume>0&&s.volume<=1);assert.ok(typeof s.note==='string'&&s.note.length>10);
 assert.equal(s.variants??1,variants[id]??1,`${id}: variants`);assert.equal(!!s.loop,loops.has(id),`${id}: loop`);
 assert.ok(s.duration>0&&(s.loop?s.duration<=6:s.duration<4),`${id}: manifest duration`);
 for(let v=1;v<=(s.variants??1);v++)for(const ext of manifest.formats){
  const file=`${id}${s.variants>1?'_'+v:''}.${ext}`;wantFiles.add(file);
  const rel='public/audio/sfx/'+file,buf=read(rel);total+=buf.length;count++;
  assert.ok(buf.length>300,`${file}: empty`);
  const hash=createHash('sha256').update(buf).digest('hex');assert.ok(!hashes.has(hash),`${file}: duplicate`);hashes.add(hash);
  assert.equal(reported.get(file)?.sha256,hash,`${file}: render report hash`);assert.equal(reported.get(file)?.bytes,buf.length);
  if(ext==='ogg'){
   const duration=oggInfo(buf);assert.ok(Math.abs(duration-s.duration)<1/44100+.00001,`${file}: actual duration ${duration}`);
   assert.ok(s.loop||duration<4,`${file}: too long`);
  }
  if(ext==='mp3'){
   let off=0;
   if(buf.toString('ascii',0,3)==='ID3')off=10+((buf[6]<<21)|(buf[7]<<14)|(buf[8]<<7)|buf[9]);
   assert.ok(off+4<buf.length);const h=buf.readUInt32BE(off);
   assert.equal(h>>>21,0x7ff,`${file}: MP3 frame sync`);
   assert.equal((h>>>19)&3,3,`${file}: MPEG-1`);assert.equal((h>>>17)&3,1,`${file}: Layer III`);
   assert.equal((h>>>12)&15,7,`${file}: 96 kbit/s`);assert.equal((h>>>10)&3,0,`${file}: 44100 Hz`);
   assert.equal((h>>>6)&3,3,`${file}: mono`);
  }
  if(process.argv.includes('--decode')){
   const result=spawnSync('ffmpeg',['-v','error','-i',path.join(root,rel),'-f','f32le','-acodec','pcm_f32le','-'],{maxBuffer:8*1024*1024});
   assert.equal(result.status,0,`${file}: decoder failed ${result.stderr}`);
   const b=result.stdout,n=b.length/4;let peak=0,sum=0,sq=0;
   assert.ok(Math.abs(n/44100-s.duration)<.035,`${file}: decoded duration`);
   for(let i=0;i<n;i++){const x=b.readFloatLE(i*4);assert.ok(Number.isFinite(x));peak=Math.max(peak,Math.abs(x));sum+=x;sq+=x*x;}
   const db=20*Math.log10(peak);minPeak=Math.min(minPeak,db);maxPeak=Math.max(maxPeak,db);
   assert.ok(db<=-2.99&&db>=-3.6,`${file}: peak ${db}`);assert.ok(Math.sqrt(sq/n)>.0005,`${file}: silent`);assert.ok(Math.abs(sum/n)<.012,`${file}: DC`);
   const pcmHash=createHash('sha256').update(b).digest('hex');assert.ok(!pcmHashes.has(pcmHash),`${file}: identical decoded audio`);pcmHashes.add(pcmHash);
   if(s.loop){const seam=Math.abs(b.readFloatLE(0)-b.readFloatLE((n-1)*4));maxSeam=Math.max(maxSeam,seam);assert.ok(seam<.065,`${file}: loop seam ${seam}`);}
   decoded++;
  }
 }
}
assert.deepEqual(new Set(reported.keys()),wantFiles);assert.equal(count,318);assert.equal(total,report.totalBytes);
assert.ok(total<12_000_000,`12 MB exceeded: ${total}; split PR required`);
const mappingIds=[...read('docs/audio/sfx2_zuordnung.md').toString().matchAll(/^\| `([^`]+)` \|/gm)].map(m=>m[1]);
assert.equal(mappingIds.length,120,'Mapping table must cover all 120 IDs');assert.deepEqual(new Set(mappingIds),expected,'Wrong mapping IDs');
console.log(`PASS: ${expected.size} IDs, 159 variants, ${count} files, OGG mono/44100 Hz, duration/CRC/coverage/hash checks.`);
console.log(`Groups: ${JSON.stringify(counts)}`);
console.log(`Total: ${total} bytes (${(total/1e6).toFixed(3)} MB), below 12 MB; OGG q4 + MP3 96k.`);
if(decoded)console.log(`Decoded ${decoded} files: peak ${minPeak.toFixed(3)}..${maxPeak.toFixed(3)} dBFS; maximum loop seam ${maxSeam.toFixed(5)}; non-silent, finite, no duplicates.`);
