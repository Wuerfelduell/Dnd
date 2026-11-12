import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUDE } from '../../../src/data/sude.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
const files = ['rituale','meldungen','waechter','kessel_rezepte','moor_relikt','nebentexte','wexmoor_einnahmen','einbau'];
const pfade = ['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr'];
const keys = pfade.map(p => `s4r_${p}`);
const allowed = new Set(['n','pct','runde','name','item','eigenschaften']);
const errors = [];
const check = (ok, at) => { if (!ok) errors.push(at); };
const data = {};
let strings = 0;
const size = (a, min, max, at) => check(Array.isArray(a) && a.length >= min && a.length <= max, `${at}: Anzahl ${min}–${max}`);
const count = (a, n, at) => check(a && Object.keys(a).length === n, `${at}: genau ${n} Einträge`);
const sentences = (s, min, max, at) => {
  const n = typeof s === 'string' ? (s.match(/[.!?](?:\s|$)/g) ?? []).length : 0;
  check(n >= min && n <= max, `${at}: ${min}–${max} Sätze, gefunden ${n}`);
};
function walk(x, at) {
  if (typeof x === 'string') {
    strings++;
    check(x.trim().length > 0, `${at}: leerer Text`);
    const rest = x.replace(/\{([^{}]+)\}/g, (_, p) => { check(allowed.has(p), `${at}: Platzhalter ${p}`); return ''; });
    check(!/[{}]/.test(rest), `${at}: beschädigter Platzhalter`);
  } else if (Array.isArray(x)) x.forEach((v, n) => walk(v, `${at}/${n}`));
  else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) {
    check(/^[a-z0-9_]+$/.test(k), `${at}/${k}: ungültiger Schlüssel`);
    walk(v, `${at}/${k}`);
  }
}
// JSON.parse alone silently overwrites duplicate object keys. Scan valid JSON tokens
// recursively before using parsed data, including escaped equivalents of a key.
function duplicateKeys(raw, file) {
  const tokens = raw.match(/"(?:[^"\\]|\\.)*"|[{}\[\]:,]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g);
  let pos = 0;
  function value(at) {
    const t = tokens[pos++];
    if (t === '{') {
      const seen = new Set();
      while (tokens[pos] !== '}') {
        const k = JSON.parse(tokens[pos++]); pos++;
        check(!seen.has(k), `${file}${at}: doppelter Schlüssel ${k}`); seen.add(k);
        value(`${at}/${k}`);
        if (tokens[pos] !== ',') break;
        pos++;
      }
      pos++;
    } else if (t === '[') {
      let n = 0;
      while (tokens[pos] !== ']') {
        value(`${at}/${n++}`);
        if (tokens[pos] !== ',') break;
        pos++;
      }
      pos++;
    }
  }
  value('');
}
const actual = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
check(JSON.stringify(actual) === JSON.stringify(files.map(f => f+'.json').sort()), 'Dateiliste: genau die acht vorgesehenen JSON-Dateien');
for (const file of files) {
  try {
    const raw = fs.readFileSync(path.join(dir, file+'.json'), 'utf8');
    data[file] = JSON.parse(raw); duplicateKeys(raw, file); walk(data[file], file);
  } catch (e) { errors.push(`${file}: ${e.message}`); }
}
const ids = new Set();
function id(s, at) { check(typeof s === 'string' && /^[a-z0-9_]+$/.test(s), `${at}: ungültige ID`); check(!ids.has(s), `${at}: doppelte ID ${s}`); ids.add(s); }
function fields(o, names, at) { for (const n of names) check(o && Object.hasOwn(o,n), `${at}: fehlt ${n}`); }
function unique(a, at) { check(new Set(a).size === a.length, `${at}: Wiederholung`); }
function validate() {
  const {rituale:r,meldungen:m,waechter:w,kessel_rezepte:k,moor_relikt:mo,nebentexte:n,wexmoor_einnahmen:wx,einbau:e} = data;
  for (const [file,obj] of [['rituale',r],['meldungen',m],['waechter',w],['koop',n.koop_zuschauer]]) {
    count(obj,10,file); for (const key of keys) check(Object.hasOwn(obj,key), `${file}: fehlt ${key}`);
  }
  count(e.pfade,10,'einbau/pfade');
  const requiredEvents = [
    'laterne_aufgestellt laterne_angegriffen laterne_schwach laterne_erloschen nachfuellen_unterbrochen monster_weicht monster_zerfaellt nerven_schwinden unruhe_1 unruhe_2 unruhe_3 waechter_erscheint waechter_immun sonnenaufgang_moeglich sonnenaufgang',
    'kreatur_markiert gebiet_belegt art_belegt alle_markiert einschlafen traumbeginn heilung_versagt erwachen waechter_erscheint',
    'verwandlung herausforderung_angenommen herausforderung_abgelehnt faehigkeit_benutzt artefakt_abgelegt verschonen_frage verschont gegner_tot waechter_erscheint',
    'taubheit_beginn taubheit_ende gegner_besiegt waechter_erscheint ausweichen_gelungen ausweichen_misslungen',
    'rezept_frei rezept_gesperrt gebraut getrunken waechter_erscheint angriff_verboten trank_trifft',
    'artefakte_fehlen traglast_fehlt ruestung_an helm_an amulett_an bereit waechter_erscheint runde_ueberstanden todesstoss_abgewehrt verwundbar ausweichen_verboten bedingung_gebrochen',
    'schatten_getrennt koerper_zurueck faehigkeit_runde heilung_versagt parieren_unmoeglich gegner_besiegt waechter_erscheint schatten_zurueck schatten_zerfasert schattenattacke',
    'besitz_versiegelt kapital_gewaehlt kauf waren_offen kapital_zu_knapp alles_gekauft waechter_erscheint nur_gekauftes besitz_zurueck',
    'zersetzt falsche_zersetzung relikt_geformt waechter_erscheint moorwasser_getrunken moorwasser_leer',
    'monster_angriff perfekt normal waechter_fehler vierter_fehler parieren_verboten vorpruefung_fehler gegner_ohne_angriff waechter_erscheint'
  ];
  const fixedNames = ['Die Nacht der Laternen','Das Netz der fünf Träume','Das Gesicht ohne Gabe','Die Welt ohne Klang','Die fünffache Essenz','Die Last des Halbgottes','Der Schatten ohne Körper','Der Preis der Macht','Das Relikt des Verfalls','Der perfekte Augenblick'];
  const seqs = ['Dochtgezeichneter','Nahtträger','Gesichtsvermieter','Stilleverwahrer','Rückstandsbrauer','Lastnieter','Schwellenlücke','Pfandkörper','Schichtträger','Zwischentakter'];
  const prefixes = ['s4la_','s4fa_','s4ma_','s4ec_','s4ke_','s4ei_','s4sc_','s4wa_','s4mo_','s4uh_'];
  for (const [idx,key] of keys.entries()) {
    const v = r[key], p = pfade[idx]; id(key,'rituale');
    fields(v,['pfad','praefix','sequenz_4','name','desc','regeln','vorbereitung','beginn','erfolg','fehlschlag','notizbuch'],key);
    check(v.pfad === p && v.praefix === prefixes[idx] && v.sequenz_4 === seqs[idx],`${key}: feste Pfaddaten`);
    check(v.name === fixedNames[idx] || (idx<3 && v.name_vorschlag),`${key}: fester Ritualname`);
    sentences(v.desc,3,4,key+'/desc'); sentences(v.beginn,2,3,key+'/beginn'); sentences(v.erfolg,2,3,key+'/erfolg'); sentences(v.notizbuch,1,1,key+'/notizbuch');
    size(v.regeln,3,6,key+'/regeln'); size(v.vorbereitung,2,3,key+'/vorbereitung');
    for (const t of v.regeln) check(t.length <= 60,`${key}: Regel über 60 Zeichen`);
    check(Object.keys(v.fehlschlag).length>0,`${key}: keine Fehlergründe`);
    for (const [reason,t] of Object.entries(v.fehlschlag)) { sentences(t,1,1,key+'/'+reason); check(t.includes('{pct}'),`${key}/${reason}: Verlustplatzhalter fehlt`); }
    fields(m[key],requiredEvents[idx].split(' '),key+'/meldungen');
    for (const [event,t] of Object.entries(m[key])) check(typeof t==='string' && t.length <=80,`${key}/${event}: Meldung über 80 Zeichen`);
    size(w[key].intro,2,2,key+'/intro'); size(w[key].zwischenrufe,4,4,key+'/zwischenrufe'); size(w[key].sieg_spieler,2,2,key+'/sieg_spieler');
    for (const field of ['intro','zwischenrufe','sieg_spieler']) for (const t of w[key][field]) sentences(t,1,1,key+'/'+field);
    sentences(w[key].sieg_waechter,1,1,key+'/sieg_waechter'); size(n.koop_zuschauer[key],2,2,key+'/koop');
    const ep = e.pfade[p]; fields(ep,['ritual','meldungen','waechter','koop_zuschauer','aktiv_flag','done_flag','fehlschlag_flag','verlust_pct','ereignisse'],p+'/einbau');
    for (const f of ['ritual','meldungen','waechter','koop_zuschauer']) check(ep[f]===key,`${p}/${f}: falscher Verweis`);
    for (const f of ['aktiv','done','fehlschlag']) check(ep[f+'_flag']===`${key}_${f}`,`${p}: falsches Flag`);
    const fixedLoss = {laterne:20,maske:20,echo:25,kessel:25,sq_moor:25};
    check(ep.verlust_pct === (fixedLoss[p] ?? '{pct}'),`${p}: erfundener/falscher Verdauungsverlust`);
    check(JSON.stringify(Object.keys(ep.ereignisse).sort())===JSON.stringify(Object.keys(m[key]).sort()),`${p}: Ereigniszuordnung unvollständig`);
    for (const [ev,ref] of Object.entries(ep.ereignisse)) check(ev===ref && Object.hasOwn(m[key],ref),`${p}: ungültiger Ereignisverweis`);
  }
  fields(w.s4r_laterne,['immun','sonnenaufgang'],'laterne/waechter');
  fields(w.s4r_eisen,['runde_1','runde_2','runde_3','runde_4','runde_5','verwundbar'],'eisen/waechter');
  for (const f of ['runde_1','runde_2','runde_3','runde_4','runde_5','verwundbar']) sentences(w.s4r_eisen[f],1,1,'eisen/'+f);
  const spoken = Object.entries(w).filter(([key])=>key!=='s4r_echo').map(([,v])=>v);
  for (const field of ['intro','sieg_spieler','sieg_waechter']) unique(spoken.map(v=>JSON.stringify(v[field])),`waechter/${field}`);
  check(!/„|“|spricht|ruft|flüstert|sagt/.test(JSON.stringify(w.s4r_echo)), 'echo: hörbare Wächterrede');
  const recipeIds = ['nachtschierling','aetzwasser','knallsud','frostlauge','glutschleim'].map(v=>'s4ke_'+v);
  count(k,5,'rezepte'); fields(k,recipeIds,'rezepte');
  const json = f => JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
  // These base item dictionaries feed content.items in buildContent.js; no loot-reference guesswork.
  const baseItems = {...json('src/data/items.json'),...json('src/data/pathways.json').items,...json('src/data/wilds.json').items};
  const signatures = new Set(SUDE.map(v=>[...v.zutaten].sort().join('+')));
  for (const [key,v] of Object.entries(k)) {
    id(key,'rezepte'); fields(v,['name','desc','zutaten_vorschlag','wirkung_trinken','wirkung_wurf','sperrtext'],key); sentences(v.desc,2,2,key+'/desc'); size(v.zutaten_vorschlag,2,3,key+'/zutaten');
    for (const item of v.zutaten_vorschlag) check(Object.hasOwn(baseItems,item),`${key}: unbekannte Zutat ${item}`);
    const sig=[...v.zutaten_vorschlag].sort().join('+'); check(!signatures.has(sig),`${key}: doppelte Zutatenkombination`); signatures.add(sig);
  }
  unique(Object.values(k).map(v=>v.desc),'rezepte/desc');
  size(mo.eigenschaften,20,20,'moor/eigenschaften');
  for (const v of mo.eigenschaften) { id(v.id,'moor'); check(/^s4mo_e_/.test(v.id),'moor: Präfix'); fields(v,['name','kategorie','wirkung_vorschlag'],v.id); check(['glut','faden','stein','schatten','salz'].includes(v.kategorie),v.id+': Kategorie'); }
  for (const f of ['vorsilben','nachsilben']) { size(mo.namensteile[f],10,10,'moor/'+f); unique(mo.namensteile[f],'moor/'+f); }
  size(mo.desc_vorlagen,5,5,'moor/vorlagen'); for(const t of mo.desc_vorlagen) check(t.includes('{name}') && t.includes('{eigenschaften}'),'moor: Vorlagenplatzhalter fehlen');
  count(mo.zersetzen,10,'moor/zersetzen'); fields(mo.zersetzen,['artefakt','trank','formel','zutat','knochen','metall','papier','stoff','glas','edelstein'],'moor/zersetzen');
  size(n.maske_zweifel,8,8,'zweifel'); size(n.gerede,20,20,'gerede'); size(n.zeitung,5,5,'zeitung'); size(n.lesestueck,2,2,'lesestuecke');
  unique(Object.values(n.koop_zuschauer).flat(),'koop'); unique(n.gerede,'gerede');
  for (const v of n.zeitung) { fields(v,['ueberschrift','text'],'zeitung'); sentences(v.text,2,2,'zeitung'); }
  for (const v of n.lesestueck) { id(v.id,'lesestueck'); fields(v,['titel','text'],v.id); sentences(v.text,6,10,v.id); }
  const world=json('src/data/wexmoor.json'); const maps=new Map(world.maps.map(v=>[v.id,v]));
  const targets=new Set(['wx_bahnhof','wx_torfstich','wx_salzmarkt','wx_bojenhafen','wx_oberstadt','wx_pfahldorf','wx_altstadt','wx_salzwatt','wx_vergessmoor','wx_leuchtturm']);
  const wage = v => check(['klein','mittel','gross'].includes(v.lohn_stufe),'wexmoor: Lohnstufe');
  count(wx.kopfgelder,8,'kopfgelder'); count(wx.gelegenheitsarbeiten,6,'arbeiten'); count(wx.seltene_funde,10,'funde'); size(wx.maud_keel,3,3,'maud');
  for (const [key,v] of Object.entries(wx.kopfgelder)) {
    id(key,'kopfgeld'); check(key.startsWith('kopfgeld_wx_'),key+': Präfix'); fields(v,['title','kind','case','summary','reward','lohn_stufe','auftraggeber','gesuchter','steps','abgabetext'],key); wage(v);
    id(v.gesuchter.id,key); check(v.gesuchter.id===key.replace('kopfgeld_wx_','wxk_'),key+': Gesuchter-ID'); fields(v.gesuchter,['steckbrief'],key); size(v.steps,2,2,key+'/steps');
    check(v.kind==='side' && v.case==='kapitel2' && v.auftraggeber==='wx_wachhaus',key+': Auftragsdaten'); check(v.reward.gives_money===0,key+': kein fester Lohn');
    const [first,last]=v.steps; check(targets.has(first.target.map) && maps.has(first.target.map),key+': Zielkarte'); check(first.target.id===v.gesuchter.id,key+': Ziel-ID');
    check(last.target.map==='wx_wachhaus' && maps.get('wx_wachhaus').npcs.some(npc=>npc.id===last.target.id),key+': Abgabeziel');
    check(first.done.requires_flags[0] === 'won_'+key && last.done.requires_flags[0] === key+'_bezahlt',key+': Abschlussflags');
  }
  for(const [key,v] of Object.entries(wx.gelegenheitsarbeiten)) {
    id(key,'arbeit'); check(key.startsWith('wxj_'),key+': Präfix'); fields(v,['title','wiederholbar','ort','lohn_stufe','auftraggeber','ablauf','zwischenfaelle','abschluss'],key); wage(v); check(v.wiederholbar===true,key+': nicht wiederholbar'); check(maps.has(v.ort),key+': Ort'); sentences(v.ablauf,2,2,key+'/ablauf'); size(v.zwischenfaelle,3,3,key+'/zwischenfaelle'); for(const t of v.zwischenfaelle) sentences(t,1,1,key+'/zwischenfall');
  }
  unique(Object.values(wx.gelegenheitsarbeiten).flatMap(v=>v.zwischenfaelle),'arbeiten/zwischenfaelle');
  for(const [key,v] of Object.entries(wx.seltene_funde)) { id(key,'fund'); check(key.startsWith('wxf_'),key+': Präfix'); fields(v,['name','desc','fundort','lohn_stufe','ankaeufer'],key); wage(v); check(Object.hasOwn(world.zones,v.fundort),key+': kein Monstergebiet'); check(v.ankaeufer==='wx_pfandleiherin' && world.npcs[v.ankaeufer],key+': Käufer'); }
  unique(Object.values(wx.seltene_funde).map(v=>v.desc),'funde/desc');
}
if (files.every(f=>data[f])) { try { validate(); } catch (e) { errors.push('Strukturfehler: '+e.message); } }
console.log(`DR Prüfung: ${Object.keys(data).length} JSON-Dateien; ${pfade.length} Pfade; ${strings} Zeichenketten; Fehler: ${errors.length}`);
if (!errors.length) {
  console.log('OK: Pflichtfelder, Mengen, Satz- und Zeichenlimits, IDs, doppelte JSON-Schlüssel, Platzhalter.');
  console.log('OK: Ereignisreferenzen, zehn Pfade, Rezeptzutaten und Kombinationen gegen bestehende Sude.');
  console.log('OK: Wexmoor-Karten, Wachhaus-Abgabe, Monstergebiete, Lohnstufen und eigenständige Texte.');
} else { errors.forEach(e=>console.error(e)); process.exitCode=1; }
