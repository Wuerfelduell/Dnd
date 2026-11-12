#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {compileStueck,validateInstrumente} from '../../../src/core/MusicSynth.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const dir=path.join(root,'public/audio/musik');
const read=id=>JSON.parse(fs.readFileSync(path.join(dir,id+'.json'),'utf8'));
const bank=validateInstrumente(read('instrumente'));
const ids=['s4r_laternennacht','s4r_traum','s4r_schattenseite','s4r_waechter'];
for(const id of ids){const s=read(id);assert.equal(s.id,id);assert.equal(s.format,'nebel-musik-1');assert(s.loop);assert(s.loop_ab>0);assert(new Set(s.ablauf.slice(s.loop_ab)).size>=3);assert(fs.statSync(path.join(dir,id+'.json')).size<60000);const c=compileStueck(s,bank);assert(c.events.length>0);assert(c.loopDuration>0);console.log(`${id}: ${s.bpm} BPM, total ${c.duration.toFixed(2)} s, intro ${c.loopStart.toFixed(2)} s, loop ${c.loopDuration.toFixed(2)} s, ${c.events.length} events`);}
const dream=read('s4r_traum'),ritual=read('ritual');
assert.deepEqual(dream.muster,ritual.muster,'Traum must preserve all written pitches and durations');assert.deepEqual(dream.abschnitte,ritual.abschnitte);assert.deepEqual(dream.ablauf,ritual.ablauf);assert(dream.bpm<ritual.bpm);assert.equal(dream.spuren.melodie.oktave,-1);
const ward=read('s4r_waechter'),source=read('hg_grenzwaechter');assert(compileStueck(ward,bank).duration<compileStueck(source,bank).duration);assert(ward.bpm>source.bpm);for(const s of ['A','B','C'])assert.equal(ward.muster[s+'_melodie'].noten,source.muster[s+'_melodie'].noten.split('|').slice(0,4).join('|').trim());
const lantern=read('s4r_laternennacht');for(const track of ['voll','halb','rest'])assert(lantern.spuren[track]);assert.equal(lantern.spuren.puls.instrument,'pauke');
for(const state of [[],['voll'],['voll','halb']]){const muted=structuredClone(lantern);for(const k of state)muted.spuren[k].lautstaerke=0;const c=compileStueck(muted,bank);assert(c.events.length>0);}
assert.deepEqual(new Set(Object.values(read('s4r_schattenseite').spuren).map(t=>t.instrument)),new Set(['kontrabass','celesta']));
console.log('PASS: 4 scores; parser, instruments, patterns, loops, stems, exact ritual derivation and shorter guardian variation.');
