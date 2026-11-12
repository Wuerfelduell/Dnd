const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const m=read('public/audio/manifest-sfx3.json'),catalog=read('docs/story/sfx3/catalog.json'),hashes=read('docs/story/sfx3/checksums.json');
const groups=['varrowmouth','vm_kampf','halbgott','fasserin2','oberflaeche3'];
const source=fs.readFileSync(path.join(root,'docs/art/codex_DB_soundeffekte3.md'),'utf8');
const expected=new Map();
for(let i=1;i<=5;i++){
 const section=source.split(`## ${i}.`)[1].split('## ')[0];let last='';
 for(const hit of section.matchAll(/`([a-z0-9_]+)`/g)){
  let id=hit[1];if(groups.includes(id))continue;
  if(id.startsWith('_'))id=last.slice(0,last.lastIndexOf('_'))+id;
  last=id;assert(!expected.has(id),`Duplicate source ID ${id}`);expected.set(id,groups[i-1]);
 }
}
assert.equal(expected.size,91);assert.deepEqual(Object.keys(m.sounds).sort(),[...expected.keys()].sort());assert.deepEqual(catalog.sounds,m.sounds);assert.deepEqual(Object.keys(catalog.events).sort(),[...expected.keys()].sort());
assert.equal(Object.values(m.sounds).reduce((n,s)=>n+(s.variants||1),0),107);
const variants={vm_schritt_schlick:4,vm_schritt_steg:4,vm_schritt_wasser:3,vm_boot_ruder:2,vm_moewen:2,hg_form_schritt:2,hg_kreatur_stimme:3,fa_hammer:3,ui_tier_ruf:2};
const pcmHashes=new Set();let count=0,loops=0,total=0,minRms=Infinity,maxPeak=0,maxSeam=0;
const used=[];
for(const [id,s] of Object.entries(m.sounds)){
 assert.match(id,/^[a-z0-9_]+$/);assert.equal(s.group,expected.get(id));assert.equal(s.variants||1,variants[id]||1);assert.equal(!!s.loop,id.startsWith('vm_amb_'));
 assert.ok(s.note.trim().length>10&&catalog.events[id].trim());assert.ok(s.volume>=(s.loop?.15:.2)&&s.volume<=(s.loop?.35:.7));
 for(let v=1;v<=(s.variants||1);v++)for(const ext of ['ogg','mp3']){
  const rel=m.base+id+(s.variants?'_'+v:'')+'.'+ext,f=path.join(root,'public',rel);assert(fs.existsSync(f),f);
  const bytes=fs.readFileSync(f);used.push(rel);total+=bytes.length;assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hashes[rel],f+' hash');
  if(ext==='ogg')assert.equal(bytes.subarray(0,4).toString(),'OggS');
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',f]));assert.equal(probe.streams.length,1);const stream=probe.streams[0];assert.equal(stream.codec_name,ext==='ogg'?'vorbis':'mp3');assert.equal(+stream.sample_rate,24000);assert.equal(stream.channels,1);assert(+probe.format.duration<(s.loop?8.001:4),f+' container duration');
  const b=execFileSync('ffmpeg',['-v','error','-i',f,'-f','f32le','-ar','24000','-ac','1','pipe:1'],{maxBuffer:8e6});let energy=0,peak=0;
  assert(b.length>0&&b.length%4===0);
  for(let i=0;i<b.length;i+=4){const x=b.readFloatLE(i);assert(Number.isFinite(x));energy+=x*x;peak=Math.max(peak,Math.abs(x));}
  const duration=b.length/4/24000,rms=Math.sqrt(energy/(b.length/4));assert(Math.abs(duration-s.duration)<.03,f+' manifest duration');assert(rms>.001,f+' silent');assert(peak<.99,f+' clipping');minRms=Math.min(minRms,rms);maxPeak=Math.max(maxPeak,peak);
  const hash=crypto.createHash('sha256').update(b).digest('hex');assert(!pcmHashes.has(hash),f+' duplicate PCM');pcmHashes.add(hash);
  if(s.loop){const seam=Math.abs(b.readFloatLE(0)-b.readFloatLE(b.length-4));assert(seam<.08,f+' seam');maxSeam=Math.max(maxSeam,seam);loops++;}
  count++;
 }
}
assert.equal(count,214);assert.equal(loops,18);assert.deepEqual(Object.keys(hashes).sort(),used.sort());
for(const file of ['manifest-sfx.json','manifest-sfx2.json']){
 const p=path.join(root,'public/audio',file);if(!fs.existsSync(p))continue;
 const prev=JSON.parse(fs.readFileSync(p,'utf8'));for(const id of Object.keys(m.sounds))assert(!prev.sounds?.[id],`Existing ID in ${file}: ${id}`);
}
console.log(`PASS: ${expected.size} IDs, 107 Varianten, ${count} Dateien; ${loops} Loop-Dateien; vollständige Soll- und Ereigniszuordnung.`);
console.log('PASS: OGG/Vorbis und MP3, mono/24000 Hz; Dauergrenzen, Manifestdauer, Lautstärken, SHA-256, unterschiedliche PCM-Daten.');
console.log(`PASS: Nicht-Stille und Clipping; kleinster RMS ${minRms.toFixed(6)}, größte Spitze ${maxPeak.toFixed(6)}, größte Loop-Naht ${maxSeam.toFixed(6)}.`);
console.log(`Audio gesamt: ${total} Bytes (${(total/1e6).toFixed(3)} MB). Kein Laufzeit- oder Spielmix-Test.`);
