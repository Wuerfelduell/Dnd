import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {compileStueck,validateInstrumente} from '../../../src/core/MusicSynth.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const bank=validateInstrumente(read('public/audio/musik/instrumente.json'));
const ids=['s4r_laternennacht','s4r_traum','s4r_schattenseite','s4r_waechter'];
const scores={};
for(const id of ids){
 const s=read(`public/audio/musik/${id}.json`);scores[id]=s;
 assert.equal(s.id,id);assert.equal(s.format,'nebel-musik-1');assert.equal(s.loop,true);
 assert(s.loop_ab>0&&s.loop_ab<s.ablauf.length);assert(new Set(s.ablauf).size>=3);
 for(const t of Object.values(s.spuren))assert(bank[t.instrument],`${id}: unknown instrument`);
 const c=compileStueck(s,bank);assert(c.events.length>0);assert(c.loopDuration>0);assert(s.hall<=.15);
 console.log(`PASS ${id}: ${s.bpm} BPM; Intro ${c.loopStart.toFixed(2)} s, Loop ${c.loopDuration.toFixed(2)} s; ${c.events.length} Ereignisse.`);
}
assert.deepEqual(Object.keys(scores.s4r_laternennacht.spuren).sort(),['halb','puls','rest','voll']);
const source=read('public/audio/musik/ritual.json'),dream=scores.s4r_traum;
for(const [id,p] of Object.entries(source.muster)){
 const lowered=p.noten.replace(/([a-g](?:#|b)?)([1-8])/g,(_,n,o)=>n+(+o-1));
 assert.equal(dream.muster[id].noten,lowered,`Traum: Motiv ${id}`);
}
assert(dream.bpm<source.bpm);assert.deepEqual(dream.abschnitte,source.abschnitte);assert.deepEqual(dream.ablauf,source.ablauf);
const guardian=read('public/audio/musik/hg_grenzwaechter.json');
assert(compileStueck(scores.s4r_waechter,bank).duration<compileStueck(guardian,bank).duration);
assert(scores.s4r_waechter.bpm>guardian.bpm);
for(const mutate of [s=>s.spuren.voll.instrument='unbekannt',s=>s.muster.A_voll.noten='c4:1',s=>s.ablauf=['unbekannt'],s=>s.loop_ab=999]){
 const bad=structuredClone(scores.s4r_laternennacht);mutate(bad);assert.throws(()=>compileStueck(bad,bank));
}
console.log('PASS Musik: Originalparser, Instrumentbank, Motivtreue Traum, kürzerer Wächter, vier negative Formatproben.');
