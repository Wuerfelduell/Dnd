#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const paths = ['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr'];
const forms = ['Leuchtgestalt','Nahtgespinst','Hundertmiene','Hohlklang','Siedeleib','Nietkoloss','Türhüter','Gewichtsträger','Torfleib','Pendelgestalt'];
const stages = [
 ['Dochtgezeichneter','Aschenprotokollant','Rußhorizont'], ['Nahtträger','Bruchhefter','Stadtversäumer'],
 ['Gesichtsvermieter','Rollenverwahrer','Publikumsfremder'], ['Stilleverwahrer','Nachrufgefäß','Schweigeufer'],
 ['Rückstandsbrauer','Kreislaufgefäß','Abwärmesammler'], ['Lastnieter','Gegenlast','Stadtwiderlager'],
 ['Schwellenlücke','Riegelabwesenheit','Innenrand'], ['Pfandkörper','Saldenhüter','Schuldgegengewicht'],
 ['Schichtträger','Namensediment','Vergessensufer'], ['Zwischentakter','Fristlauscher','Wiederkehrsaum'],
];
const files = ['trinktexte','kreaturform','furcht','rituale','encounters','dialogues','bestiarium','zeitung','gerede','lesestuecke','koop'];
const data = {};
let words = 0;
const explicitIds = new Set();
const textKeys = new Set(['trinken','ankunft','erste_nacht','stufe_kurz','beschreibung','karte','annehmen','ablegen','gesperrt','zu_lange','koop_sicht','text','title','name','desc','bestanden','gescheitert','bedingung','intro','lose_text','win_text','schwaeche','source','vorbereitung','beim_anblick','danach','fragen','antworten','je_pfad','antwort_je_pfad','koop']);
const wordCount = s => s.trim().split(/\s+/u).filter(Boolean).length;
function noDuplicateKeys(raw, label) {
  const tokens = raw.match(/"(?:\\.|[^"\\])*"|[{}\[\]:,]|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g) ?? [];
  const stack = [];
  for (let i=0;i<tokens.length;i++) {
    const t=tokens[i];
    if (t==='{' || t==='[') stack.push(t==='{' ? new Set() : null);
    else if (t==='}' || t===']') stack.pop();
    else if (t.startsWith('"') && tokens[i+1]===':') {
      const k=JSON.parse(t), seen=stack.at(-1);
      assert.ok(seen, `${label}: Schlüssel außerhalb Objekt`);
      assert.ok(!seen.has(k), `${label}: doppelter Schlüssel ${k}`); seen.add(k);
    }
  }
}
function inspect(value, where, prose=false) {
  if (typeof value==='string') {
    assert.ok(value.trim(), `${where}: leerer Text`);
    assert.ok(!/TODO|FIXME|\[STYLE BLOCK\]/.test(value), `${where}: Platzhalter`);

  } else if (Array.isArray(value)) value.forEach((v,i)=>inspect(v,`${where}[${i}]`,prose));
  else if (value && typeof value==='object') {
    if (typeof value.id==='string') {
      assert.match(value.id,/^[a-z0-9_]+$/,`${where}: ID`);
      assert.ok(!explicitIds.has(value.id),`${where}: doppelte ID ${value.id}`);
      explicitIds.add(value.id);
    }
    for(const [k,v] of Object.entries(value)) inspect(v,`${where}.${k}`,prose || textKeys.has(k));
  }
}
for(const f of files) {
  const raw=fs.readFileSync(path.join(here,f+'.json'),'utf8');
  noDuplicateKeys(raw,f); data[f]=JSON.parse(raw); inspect(data[f],f);
}
assert.equal(fs.readdirSync(here).filter(f=>f.endsWith('.json')).length,files.length);
// Nur redaktionelle Textfelder zählen: keine IDs, Bedingungen oder technischen Werte.
function proseWords(v, key = '') {
  if (typeof v === 'string') return textKeys.has(key) ? wordCount(v) : 0;
  if (Array.isArray(v)) return v.reduce((n, x) => n + proseWords(x, key), 0);
  if (!v || typeof v !== 'object') return 0;
  if (['je_pfad', 'antwort_je_pfad'].includes(key)) return Object.values(v).reduce((n, x) => n + wordCount(x), 0);
  return Object.entries(v).reduce((n, [k, x]) => n + proseWords(x, k), 0);
}
words = Object.values(data).reduce((n, v) => n + proseWords(v), 0);

const read = f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const high=read('src/data/packs/sequenzen/seq_4_bis_1.json');
const newer=read('src/data/packs/sequenzen/neue_pfade.json');
const seqOf=(p,s)=>high[p]?.seqs?.[s] ?? newer[p]?.seqs?.[s];
const sentenceCount=t=>(t.match(/[.!?](?:\s|$)/g)??[]).length;
function sentences(t,min,max,label){const n=sentenceCount(t);assert.ok(n>=min&&n<=max,`${label}: ${n} Sätze statt ${min}–${max}`);}
function fields(o,names,label){for(const n of names)assert.ok(o[n]!==undefined,`${label}: ${n} fehlt`);}
assert.equal(data.trinktexte.length,30);
const combinations=new Set();
for(const t of data.trinktexte) {
 assert.ok(paths.includes(t.pfad));assert.ok([4,3,2].includes(t.seq));
 const k=`${t.pfad}_${t.seq}`;assert.ok(!combinations.has(k));combinations.add(k);
 fields(t,['trinken','ankunft','erste_nacht','stufe_kurz'],k);
 sentences(t.trinken,4,6,k);sentences(t.ankunft,2,2,k);sentences(t.erste_nacht,3,3,k);sentences(t.stufe_kurz,1,1,k);
 const name=stages[paths.indexOf(t.pfad)][[4,3,2].indexOf(t.seq)];
 assert.equal(seqOf(t.pfad,t.seq).name,name);
 assert.ok(t.ankunft.includes(name));if(t.seq===4)assert.match(t.ankunft,/Halbgott/);if(t.seq===2)assert.match(t.ankunft,/Engel/);
}
assert.equal(data.kreaturform.length,10);
for(const [i,p] of paths.entries()) {
 const f=data.kreaturform.find(f=>f.id==='hg_form_'+p);assert.ok(f,p);assert.equal(f.name,forms[i]);assert.equal(f.pfad,p);
 fields(f,['beschreibung','karte','annehmen','ablegen','gesperrt','zu_lange','koop_sicht'],'form '+p);
 sentences(f.beschreibung,3,4,p);for(const k of ['karte','annehmen','ablegen'])sentences(f[k],1,2,p);
 sentences(f.gesperrt,1,1,p);sentences(f.zu_lange,2,2,p);sentences(f.koop_sicht,1,1,p);
 assert.equal(f.freischaltung.seq4_verdauung_min,50);assert.equal(f.freischaltung.bleibt_nach_aufstieg,true);
}
const classes=['buerger','polizei','haendler','zirkel','beyonder_schwach','beyonder_mittel','beyonder_stark','tiere','sekten'];
assert.deepEqual(Object.keys(data.furcht.klassen).sort(),classes.sort());
for(const [k,v] of Object.entries(data.furcht.klassen)) {
 assert.ok(['umfallen','fliehen','zoegern','senken','knien','nichts'].includes(v.wirkung));
 assert.ok(Number.isFinite(v.dauer_sek)&&v.dauer_sek>=0);assert.equal(v.beim_anblick.length,4);assert.equal(v.danach.length,2);
}
assert.equal(data.furcht.folgen.length,8);assert.equal(data.furcht.ausnahmen.length,12);
assert.equal(data.furcht.klassen.haendler.laden_zu_spieltage,1);
assert.equal(data.furcht.klassen.beyonder_mittel.skip_first_turn,1);
assert.equal(data.furcht.regeln.ohnmacht_toedlich,false);
assert.equal(data.rituale.length,20);
const guardians=['hg_schwellenwaechter','hg_grenzwaechter'];
for(const p of paths)for(const seq of [4,2]) {
 const id=`hg_ritual_${p}_${seq}`,r=data.rituale.find(r=>r.id===id);assert.ok(r,id);
 assert.equal(r.pfad,p);assert.equal(r.seq,seq);assert.equal(r.map,seq===4?'ds_schwellenring':'hg_grenzbezirk');
 assert.equal(r.ort_bindend,false);assert.equal(r.vorbereitung.length,3);
 assert.deepEqual(r.consumes,seqOf(p,seq).ingredients,`${id}: Rezeptzutaten`);
 for(const [item,n] of Object.entries(r.consumes)){assert.match(item,/^[a-z0-9_]+$/);assert.ok(Number.isInteger(n)&&n>0);}
 assert.equal(r.requires.seq,seq+1);assert.equal(r.requires.digest_min,100);
 assert.equal(r.friedlich.requires.no_carried_potions,'party');assert.equal(r.friedlich.requires.accept_form_lock_days,1);
 assert.equal(r.friedlich.requires.answers_without_help,3);assert.equal(r.ablauf.unlock_flag,id);assert.equal(r.ablauf.personal,true);
 assert.equal(r.koop.required_seq_each,seq+1);assert.equal(r.ablauf.refund_on_loss,false);
 fields(r,['desc','bestanden','gescheitert'],id);
 assert.equal(r.waechter,guardians[seq===4?0:1]);
}
assert.deepEqual(Object.keys(data.encounters).sort(),[...guardians,'hg_leerer_umriss'].sort());
for(const [i,g] of guardians.entries()) {
 const e=data.encounters[g];assert.equal(e.hp,[520,1400][i]);assert.equal(e.min_seq,[5,3][i]);
 assert.equal(e.phases.length,3);assert.deepEqual(e.phases.map(p=>p.from_hp_ratio),[1,.6,.25]);
 assert.equal(e.phases[0].behavior,'counter_only');assert.equal(e.phases[0].dot_triggers_counter,false);
 assert.equal(e.phases[1].attacks[0].target,'all_players');assert.ok(e.phases[1].attacks[0].nerves_loss>0);
 assert.equal(e.phases[2].window_player_turns,1);assert.equal(e.phases[2].on_window_failure.heal_max_hp_ratio,.15);
 assert.deepEqual(Object.keys(e.phases[2].siegel_wirkung).sort(),[...paths].sort());
 for(const v of Object.values(e.phases[2].siegel_wirkung)){sentences(v.text,1,1,g);assert.equal(typeof v.value,'number');fields(v,['effect','unit','duration'],g);}
 assert.equal(e.mechanics.phase_latched,true);assert.equal(e.mechanics.form_fear_immune,true);assert.equal(e.on_loss.game_over,false);
 assert.equal(e.loot.money,0);assert.deepEqual(e.loot.items,{});assert.equal(e.koop.length,2);
 assert.equal(e.on_win.sets_personal_flag_from,'active_ritual.id');assert.ok(data.bestiarium[g]);
 sentences(data.bestiarium[g].text,3,3,g);assert.ok(data.bestiarium[g].schwaeche);
 const d=data.dialogues[g];assert.ok(d.nodes[d.start]);assert.equal(Object.keys(d.nodes).length,15);
 assert.deepEqual(Object.keys(d.pfadfragen).sort(),[...paths].sort());
 for(const [p,q]of Object.entries(d.pfadfragen)){assert.equal(q.fragen.length,3);assert.equal(q.antworten.length,3);assert.equal(q.id,`hg_fragen_${p}_${[4,2][i]}`);}
 for(const [id,n]of Object.entries(d.nodes)) {
  assert.ok(n.text);assert.ok(Array.isArray(n.options));
  for(const o of n.options){assert.ok(o.text);assert.ok(o.requires);assert.ok(o.effects);if(o.next)assert.ok(d.nodes[o.next],`${g}.${id}: unbekanntes Ziel ${o.next}`);}
 }
 for(let n=1;n<=3;n++)for(const p of paths){assert.equal(d.nodes['frage_'+n].je_pfad[p],d.pfadfragen[p].fragen[n-1]);assert.equal(d.nodes['frage_'+n].antwort_je_pfad[p],d.pfadfragen[p].antworten[n-1]);}
 assert.equal(d.nodes.friedlich.effects.form_lock_days,1);
}
assert.equal(data.encounters.hg_grenzwaechter.phases[2].spawn_once,'hg_leerer_umriss');
assert.equal(data.encounters.hg_leerer_umriss.hp,300);assert.equal(data.encounters.hg_leerer_umriss.independent_ritual_unlock,false);
assert.equal(data.encounters.hg_leerer_umriss.copy.max_total_damage,36);
assert.deepEqual(Object.keys(data.bestiarium).sort(),[...guardians].sort());
assert.equal(data.zeitung.length,12);
const paperSource=fs.readFileSync(path.join(root,'src/data/lore.js'),'utf8');
for(const z of data.zeitung){assert.ok(paperSource.includes(z.zeitung+':'),`Unbekannte Zeitung ${z.zeitung}`);assert.ok(z.requires_flags.includes('hg_in_'+z.city));}
const cities=['kettlegate','wexmoor','dunscar','calderwick','briarholt'];
assert.deepEqual(Object.keys(data.gerede).sort(),cities.sort());
for(const [city,maps]of Object.entries(data.gerede)){
 const lines=Object.values(maps).flat();assert.equal(lines.length,12,city);
 for(const flag of ['seq4_erreicht','hg_form_oeffentlich','seq2_erreicht'])assert.equal(lines.filter(l=>l.requires_flags.includes(flag)).length,4);
 assert.equal(new Set(lines.map(l=>l.text)).size,12);
}
assert.equal(data.lesestuecke.length,10);
const lengths=data.lesestuecke.map(l=>wordCount(l.text));for(const n of lengths)assert.ok(n>=120&&n<=200,`Lesestück: ${n} Wörter`);
assert.ok(data.lesestuecke.some(l=>l.id==='hg_lese_umriss'&&l.text.includes('zweite Umriss')));
for(const [key,n]of Object.entries({geplauder:20,kampfsprueche:6,tragen:4})){
 assert.equal(data.koop[key].length,n);for(const l of data.koop[key])assert.equal(l.mirror_players,true);
}
// Quellenprüfung ohne Laufzeitimporte: vorhandene Karten-/Figuren-/Item-Definitionen einlesen.
const sourceIds=new Set(), named=new Map();
function index(v){if(!v||typeof v!=='object')return;if(typeof v.id==='string')sourceIds.add(v.id);for(const [k,x]of Object.entries(v)){sourceIds.add(k);if(x&&typeof x==='object'&&typeof x.name==='string')named.set(k,x.name);index(x);}}
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.json'))index(JSON.parse(fs.readFileSync(f,'utf8')));}}
walk(path.join(root,'src/data'));
for(const n of data.furcht.ausnahmen)assert.equal(named.get(n.id),n.name,`Figur ${n.id}`);
for(const l of data.lesestuecke)assert.ok(sourceIds.has(l.map)||l.map==='hg_grenzbezirk',`Karte ${l.map}`);
for(const maps of Object.values(data.gerede))for(const m of Object.keys(maps))assert.ok(sourceIds.has(m),`Gerede-Karte ${m}`);
for(const r of data.rituale)for(const id of Object.keys(r.consumes))assert.ok(sourceIds.has(id),`Zutat ${id}`);
for(const f of ['README.md','pruefen.mjs'])assert.ok(fs.existsSync(path.join(here,f)));
console.log('CP OK: 11 JSON-Dateien, keine doppelten Schlüssel/IDs, keine leeren Texte.');
console.log('30 Trinktexte; 10 Formen; 9 Furchtklassen; 8 Folgen; 12 Figuren-Ausnahmen.');
console.log('20 Rituale; 2 Wächter × 3 Phasen; 1 Umriss; 2 Bestiariumseinträge.');
console.log('2 Dialoge × 15 Knoten; 20 Pfadfragesätze × 3 Fragen/Antworten.');
console.log('12 Zeitungen; 60 Geredezeilen (5 × 12); Koop 20 + 6 + 4.');
console.log(`10 Lesestücke: ${lengths.join(', ')} Wörter; Summe ${lengths.reduce((a,b)=>a+b,0)}.`);
console.log(`Wortzahl Textfelder: ${words} (inklusive wiederholter Anzeigevarianten; ohne README/technische Schlüssel).`);
console.log('Quellenabgleich: 10 Pfade, 30 Stufennamen, 20 Rezeptlisten, Figuren, Karten, Zeitungen OK.');
console.log('Ortsfreiheit, persönliche Freigaben, Niederlagen, Siegeleffekte und Dialogziele OK.');
