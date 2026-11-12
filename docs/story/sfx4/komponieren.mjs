#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const dir=path.join(root,'public/audio/musik');
const read=id=>JSON.parse(fs.readFileSync(path.join(dir,id+'.json'),'utf8'));
const save=s=>fs.writeFileSync(path.join(dir,s.id+'.json'),JSON.stringify(s,null,2)+'\n');
const ritual=read('ritual'),guardian=read('hg_grenzwaechter');
// Same written pitches, durations, pattern graph and transpositions as ritual.json.
// Octave offsets distort the register, not the motif's pitch classes.
const dream=structuredClone(ritual);
Object.assign(dream,{id:'s4r_traum',titel:'Das Netz der fünf Träume',art:'musik',bpm:48,lautstaerke:.5,hall:.16,filter:{tiefpass:1900}});
dream.spuren.melodie.oktave=-1;dream.spuren.melodie.lautstaerke=.45;
dream.spuren.akkorde.oktave=-1;dream.spuren.akkorde.lautstaerke=.18;
dream.spuren.takt.lautstaerke=.16;save(dream);
const ward=structuredClone(guardian);
Object.assign(ward,{id:'s4r_waechter',titel:'Die letzte Bedingung',art:'musik',bpm:128,lautstaerke:.57,hall:.09});
// Compress each eight-bar movement to four bars, preserving each opening cell.
for(const [id,p]of Object.entries(ward.muster)){
 if(p.takte===8){p.noten=p.noten.split('|').slice(0,4).join('|').trim();p.takte=4;}
 if(id.endsWith('_schlag')&&!id.startsWith('intro'))p.noten=Array(4).fill('c2:2@0.65 r:6 c2:2@0.45 r:4 c2:2@0.3').join(' | ');
}
ward.spuren.schlag.lautstaerke=.28;ward.spuren.melodie.lautstaerke=.4;ward.spuren.gezeit.lautstaerke=.12;save(ward);
function score(id,titel,bpm,tracks){return {format:'nebel-musik-1',id,titel,art:'musik',bpm,takt:[4,4],loop:true,loop_ab:1,lautstaerke:.52,hall:.12,spuren:tracks,muster:{},abschnitte:{},ablauf:['intro','A','B','C','A','C','B']};}
function pat(s,id,spur,takte,noten){s.muster[id]={spur,takte,noten};}
const lantern=score('s4r_laternennacht','Öl für die letzte Nacht',60,{
 voll:{instrument:'celesta',lautstaerke:.3,pan:.2},halb:{instrument:'streicher',lautstaerke:.24,pan:-.2},rest:{instrument:'kontrabass',lautstaerke:.22},puls:{instrument:'pauke',lautstaerke:.22}});
pat(lantern,'rest_a','rest',4,'d2:8 r:8 | r:8 a2:4 r:4 | bb1:8 r:8 | a1:4 r:12');
pat(lantern,'rest_b','rest',4,'g2:8 r:8 | r:8 d2:4 r:4 | bb1:8 r:8 | a1:4 r:12');
pat(lantern,'rest_c','rest',4,'d2:4 r:12 | bb1:4 r:12 | g1:8 r:8 | a1:4 r:12');
pat(lantern,'voll_a','voll',4,'a4:4 f4:4 e4:4 r:4 | d4:8 r:8 | f4:4 g4:4 a4:4 r:4 | e4:8 r:8');
pat(lantern,'voll_b','voll',4,'g4:4 bb4:4 a4:4 r:4 | f4:8 r:8 | e4:4 f4:4 d4:4 r:4 | c#4:8 r:8');
pat(lantern,'voll_c','voll',4,'f4:4 e4:4 d4:4 r:4 | a4:8 r:8 | g4:4 f4:4 e4:4 r:4 | c#4:8 r:8');
pat(lantern,'halb_a','halb',4,'[d3,f3]:8 r:8 | [a2,e3]:8 r:8 | [bb2,d3]:8 r:8 | [a2,c#3]:8 r:8');
pat(lantern,'halb_b','halb',4,'[g2,bb2]:8 r:8 | [d3,f3]:8 r:8 | [bb2,d3]:8 r:8 | [a2,e3]:8 r:8');
pat(lantern,'halb_c','halb',4,'[d3,a3]:8 r:8 | [bb2,f3]:8 r:8 | [g2,d3]:8 r:8 | [a2,e3]:8 r:8');
pat(lantern,'puls','puls',2,'x:2@0.5 r:14 | x:2@0.35 r:14');
lantern.abschnitte.intro=['rest_a','puls'];
for(const s of ['A','B','C'])lantern.abschnitte[s]=['voll_'+s.toLowerCase(),'halb_'+s.toLowerCase(),'rest_'+s.toLowerCase(),'puls'];save(lantern);
const shadow=score('s4r_schattenseite','Vierzig Prozent eines Körpers',52,{boden:{instrument:'kontrabass',lautstaerke:.32},splitter:{instrument:'celesta',lautstaerke:.18,pan:.15}});
pat(shadow,'boden_a','boden',4,'d2:4 r:12 | r:16 | a1:4 r:12 | r:16');
pat(shadow,'boden_b','boden',4,'bb1:4 r:12 | r:16 | f2:4 r:12 | a1:4 r:12');
pat(shadow,'boden_c','boden',4,'g1:4 r:12 | r:16 | a1:4 r:12 | r:16');
pat(shadow,'splitter_a','splitter',4,'r:12 a4:2 r:2 | r:16 | r:8 eb5:2 r:6 | r:16');
pat(shadow,'splitter_b','splitter',4,'r:16 | f4:2 r:14 | r:12 e5:2 r:2 | r:16');
pat(shadow,'splitter_c','splitter',4,'r:8 d5:2 r:6 | r:16 | r:4 c#5:2 r:10 | r:16');
shadow.abschnitte.intro=['boden_a'];for(const s of ['A','B','C'])shadow.abschnitte[s]=['boden_'+s.toLowerCase(),'splitter_'+s.toLowerCase()];save(shadow);
console.log('4 DS scores composed; ritual and hg_grenzwaechter source files unchanged.');
