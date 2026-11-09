#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { parseNoten, compileStueck, validateInstrumente, MusicSynth } from '../../../src/core/MusicSynth.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const directory = path.join(root, 'public/audio/musik');

async function selfTest() {
  let count = 0;
  const pass = fn => { fn(); count++; };
  pass(() => assert.equal(parseNoten('c#4:4 bb2:4 [d4,f4,a4]:8 | r:16', 16).length, 32));
  for (const bad of ['d4:0', 'd4:-2', 'q4:4', 'd4:4@1.1', 'd4:4 |', '[d4,no]:16', 'r:4~', 'c99:4']) {
    if (bad === 'q4:4') continue; // Named percussion hits are checked against the bank during compilation.
    pass(() => assert.throws(() => parseNoten(bad, 16)));
  }
  const bank = { tone: { typ: 'osc', welle: 'sine' }, drum: { typ: 'noise', schlaege: { kick: {} } } };
  const score = { format: 'nebel-musik-1', id: 'test', bpm: 120, takt: [4, 4], loop: true, loop_ab: 1,
    spuren: { m: { instrument: 'tone' }, p: { instrument: 'drum' } },
    muster: { m: { spur: 'm', takte: 1, noten: 'c4:8~ c4:8' }, tick: { spur: 'p', takte: 1, noten: 'kick:4 x:4 r:8' } },
    abschnitte: { intro: ['m'], A: ['m*2', 'tick'], B: { basis: 'A', transponieren: 2 } }, ablauf: ['intro', 'A', 'B'] };
  pass(() => { const c = compileStueck(score, bank); assert.equal(c.duration, 10); assert.equal(c.loopStart, 2); assert.equal(c.events.filter(e => e.track === 'm').length, 5); assert.equal(c.events.at(-1).pitches[0] ?? 62, 62); });
  const bad = fn => { const copy = structuredClone(score); fn(copy); assert.throws(() => compileStueck(copy, bank)); };
  pass(() => bad(s => { s.loop_ab = 3; }));
  pass(() => bad(s => { s.muster.m.noten = 'c4:8~ d4:8'; }));
  pass(() => bad(s => { s.muster.m.noten = 'c4:8'; }));
  pass(() => bad(s => { s.muster.tick.noten = 'not_a_hit:16'; }));
  pass(() => bad(s => { s.abschnitte.B = { basis: 'B', transponieren: 1 }; }));
  pass(() => bad(s => { s.abschnitte.A = ['absent']; }));
  pass(() => bad(s => { s.spuren.m.instrument = 'absent'; }));
  pass(() => bad(s => { s.echo = { verzoegerung_ms: 100, rueckkopplung: 1, nass: .5 }; }));
  pass(() => { const c = structuredClone(score); c.muster.m.noten = 'c4:16'; c.muster.long = { spur: 'p', takte: 3, noten: 'x:16 x:16 x:16' }; c.abschnitte.A = ['m*2', 'long']; assert.equal(compileStueck(c, bank).sections[1].duration, 6); });
  pass(() => {
    // Direct scheduler evidence: intro once, then loop body, even across a boundary.
    const c = compileStueck(score, bank), synth = new MusicSynth({ instrumente: bank });
    const calls = []; synth._voice = (_layer, e, at) => calls.push({ e, at });
    const layer = { data: c, origin: 0 };
    synth._scheduleRange(layer, 0, 19);
    assert.equal(calls.filter(x => x.e.at < c.loopStart).length, 1);
    assert.equal(calls.filter(x => x.at >= 10 && x.e.at < c.loopStart).length, 0);
    assert(calls.some(x => x.at === 10)); synth.zerstoere();
  });
  pass(() => {
    const c = compileStueck(score, bank), synth = new MusicSynth({ instrumente: bank });
    const calls = []; synth._voice = (_l, e, at) => calls.push(at); const layer = { data: c, origin: 0 };
    for (let i = 0; i < 100; i++) synth._scheduleRange(layer, i * .1, (i + 1) * .1);
    assert.equal(calls.length, c.events.length); synth.zerstoere();
  });
  // Minimal WebAudio doubles exercise transport without any browser globals.
  class Param { constructor(){this.value=0;} setValueAtTime(v){this.value=v;} linearRampToValueAtTime(v){this.value=v;} exponentialRampToValueAtTime(v){this.value=v;} setTargetAtTime(v){this.value=v;} cancelScheduledValues(){} cancelAndHoldAtTime(){} }
  class Node { constructor(){ for(const name of ['gain','frequency','detune','pan','Q','threshold','knee','ratio','attack','release','delayTime']) this[name]=new Param(); } connect(){} disconnect(){} start(){} stop(){} setPeriodicWave(){} }
  class Context { constructor(){this.currentTime=0;this.sampleRate=1000;this.state='running';this.destination=new Node();} async resume(){this.state='running';} close(){this.state='closed';} createBuffer(c,n,sr){const data=Array.from({length:c},()=>new Float32Array(n));return {getChannelData:i=>data[i],sampleRate:sr,length:n};} }
  for(const method of ['createGain','createDynamicsCompressor','createConvolver','createStereoPanner','createOscillator','createBufferSource','createBiquadFilter','createDelay','createPeriodicWave']) Context.prototype[method]=()=>new Node();
  const context=new Context(), transport=new MusicSynth({context,instrumente:bank});
  const pitched=structuredClone(score); delete pitched.spuren.p; delete pitched.muster.tick; pitched.abschnitte.A=['m*2'];
  await transport.lade(pitched); await transport.spiele('test',{blende:0});
  assert.equal(transport.layers.size,1); context.currentTime=1; transport.pause();
  assert.equal(transport.status.pausiert,true);assert.equal(transport.layers.size,0);
  const saved=transport.status.position;await transport.weiter();assert(Math.abs(transport.status.position-saved)<.031);count++;
  await transport.spiele('test',{blende:.2});assert.equal(transport.layers.size,2);context.currentTime+=.3;transport._tick();assert.equal(transport.layers.size,1);count++;
  transport.stopp({blende:0});assert.equal(transport.layers.size,0);assert.equal(transport.timer,null);transport.zerstoere();assert.equal(context.state,'running');count++;
  const pending=new MusicSynth({context:new Context(),instrumente:bank});let resolve;
  pending.lade=()=>new Promise(r=>{resolve=r;});const promise=pending.spiele('test');await Promise.resolve();pending.stopp({blende:0});resolve(compileStueck(pitched,bank));await promise;assert.equal(pending.layers.size,0);pending.zerstoere();count++;
  console.log(`SELFTEST: ${count} checks passed (parser, ties, errors, sections, transposition, scheduler, pause/resume, crossfade, stale loads).`);
}

async function main() {
  await selfTest();
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.json')).sort();
  const bank = {};
  for (const f of files.filter(f => /^instrumente(?:_.*)?\.json$/.test(f))) {
    const raw = JSON.parse(fs.readFileSync(path.join(directory, f), 'utf8'));
    assert.equal(raw.format, 'nebel-instrumente-1', f); Object.assign(bank, validateInstrumente(raw));
  }
  const rows = new Map(); let total = 0;
  for (const f of files) {
    const size = fs.statSync(path.join(directory, f)).size; assert(size <= 60000, `${f}: exceeds 60 KB`); total += size;
    if (/^instrumente/.test(f)) continue;
    const score = JSON.parse(fs.readFileSync(path.join(directory, f), 'utf8'));
    assert.equal(f, `${score.id}.json`, 'ID / filename mismatch');
    const c = compileStueck(score, bank); rows.set(score.id, { c, size });
    console.log(`${score.id}: ${score.takt.join('/')} · ${score.bpm} BPM · intro ${c.loopStart.toFixed(2)} s + ${score.loop ? 'loop' : 'piece'} ${(score.loop ? c.loopDuration : c.duration).toFixed(2)} s · total ${c.duration.toFixed(2)} s · ${size} bytes`);
    if (score.loop && score.art !== 'klang') { assert(score.loop_ab > 0, `${score.id}: missing intro`); assert(new Set(score.ablauf).size >= 3, `${score.id}: need three sections`); }
  }
  const audioDir = path.join(root, 'public/audio');
  const manifests = fs.readdirSync(audioDir).filter(f => /^manifest-(?:musik|klang)-.*\.json$/.test(f));
  const allTracks = new Set(), allMappings = [];
  for (const f of manifests) {
    const full = path.join(audioDir, f), size = fs.statSync(full).size; assert(size <= 60000, f); total += size;
    const m = JSON.parse(fs.readFileSync(full)); assert.equal(m.format, 'nebel-musik-1', f);
    const base = path.resolve(root, 'public', m.base); assert(base.startsWith(path.join(root, 'public') + path.sep), `${f}: unsafe base`);
    for (const bankFile of m.instrumente || ['instrumente.json']) assert(fs.existsSync(path.join(base, bankFile)), `${f}: missing instrument bank ${bankFile}`);
    for (const [id, t] of Object.entries(m.tracks)) {
      assert(!allTracks.has(id), `Duplicate manifest ID ${id}`); allTracks.add(id);
      assert(fs.existsSync(path.join(base, t.file)), `${f}: missing file ${t.file}`);
      assert(rows.has(id), `${f}: no compiled score ${id}`);
    }
    allMappings.push(m.zuordnung || {});
    if (f === 'manifest-musik-kettlegate.json') assert.deepEqual(Object.keys(m.zuordnung.maps).sort(), fs.readdirSync(path.join(root, 'src/data/maps')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort());
    if (f === 'manifest-musik-wexmoor.json') {
      const w = JSON.parse(fs.readFileSync(path.join(root, 'src/data/wexmoor.json')));
      assert.deepEqual(Object.keys(m.zuordnung.maps).sort(), w.maps.map(m => m.id).sort());
      assert.deepEqual(Object.keys(m.zuordnung.zonen).sort(), Object.keys(w.zones).sort());
    }
  }
  const leaves = v => typeof v === 'object' && v !== null ? Object.values(v).flatMap(leaves) : [v];
  for (const mapping of allMappings) for (const id of leaves(mapping)) assert(allTracks.has(id), `Unknown mapped music ${id}`);
  for (const id of rows.keys()) assert(allTracks.has(id), `Unregistered score ${id}`);
  console.log(`PASS: ${rows.size} pieces, ${Object.keys(bank).length} instruments, ${manifests.length} manifests, ${total} JSON bytes; all files <= 60 KB.`);
}
main().catch(error => { console.error(`FAIL: ${error.stack}`); process.exitCode = 1; });
