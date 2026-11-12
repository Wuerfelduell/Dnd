#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const load = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const input = Object.fromEntries(readdirSync(here).filter(f => f.endsWith('.json')).map(f => [f, load(`docs/story/post/${f}`)]));
const words = text => text.trim().split(/\s+/u).filter(Boolean).length;
const idPattern = /^[a-z0-9_]+$/;
const expected = {
  ivy: 3, holt: 3, gouvernante: 3, elsbeth: 3, waescherin: 3, molly: 3, dunn: 3, pip: 3, tresswell: 3, quill: 3,
  wx_pfandleiherin: 4, wxn_krabbe: 4, zirkel_lichtlose: 3, wxn_maler: 3, sedge: 3, druce: 3,
  zirkel_schichtbund: 4, fasserin: 1, k3_oren: 4, k3_nellie: 4, k3_weichenstellerin: 3,
  cw_crayford: 3, cw_darnell: 3, cw_pritch: 3, cwn_e_griffmacherin: 3,
  bhn_e_patientin: 2, bhn_e_lehrer: 2, bh_orla_fencrest: 2, bh_henshall: 2, ohne_absender: 5,
};
const cities = ['kettlegate', 'wexmoor', 'dunscar', 'calderwick', 'briarholt', 'varrowmouth'];
function pointer(file, path) {
  assert(typeof file === 'string' && file.startsWith('src/data/'), `Ungültige Datenquelle ${file}`);
  return path.split('/').filter(Boolean).reduce((value, key) => {
    assert(value && Object.hasOwn(value, key), `Quellzeiger fehlt: ${file}#${path}`);
    return value[key];
  }, load(file));
}
function validate(data) {
  const letters = data['briefe.json'];
  const attachments = data['beilagen.json'];
  const post = data['post.json'];
  assert.deepEqual(Object.keys(data).sort(), ['beilagen.json', 'briefe.json', 'post.json']);
  const allIds = new Set();
  function walk(value, path = '') {
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}/${i}`));
    if (!value || typeof value !== 'object') return;
    if (Object.hasOwn(value, 'id')) {
      assert(idPattern.test(value.id), `Ungültige ID ${value.id}`);
      assert(!allIds.has(value.id), `Doppelte ID ${value.id}`); allIds.add(value.id);
    }
    for (const [key, v] of Object.entries(value)) {
      if (typeof v === 'string') assert(v.trim(), `Leerer Text ${path}/${key}`);
      walk(v, `${path}/${key}`);
    }
  }
  walk(data);
  assert.equal(letters.length, 91, '91 Briefe einschließlich fünf Durchschlägen');
  assert.equal(post.absender.length, 29, '29 belegte Absender');
  const senders = new Map();
  for (const sender of post.absender) {
    assert(!senders.has(sender.npc), `Absender doppelt ${sender.npc}`);
    assert(idPattern.test(sender.npc)); senders.set(sender.npc, sender);
    const npc = pointer(sender.quelle, sender.zeiger);
    assert.equal(npc.name, sender.name, `Absendername weicht ab: ${sender.npc}`);
    assert(sender.zeiger.endsWith('/' + sender.npc));
    const dialogue = pointer(sender.dialogquelle, sender.dialogzeiger);
    assert(dialogue.nodes, `Kein echter Dialog: ${sender.npc}`);
    if (sender.beziehungs_quelle) {
      assert.equal(sender.beziehungs_id, sender.npc);
      assert(load(sender.beziehungs_quelle).figuren[sender.beziehungs_id], `Beziehung fehlt ${sender.npc}`);
    } else assert.equal(sender.beziehungs_id, null);
    assert.equal(sender.freigabe_flag, `post_kontakt_${sender.npc}`);
  }
  const byId = new Map(letters.map(b => [b.id, b]));
  for (const [npc, count] of Object.entries(expected)) {
    const row = letters.filter(b => (b.absender ?? 'ohne_absender') === npc);
    assert.equal(row.length, count, `Umfang ${npc}`);
    for (let i = 1; i <= count; i++) assert(byId.has(`post_${npc}_${i}`), `Pflicht-ID fehlt post_${npc}_${i}`);
  }
  const byAttachment = new Map(attachments.map(a => [a.id, a]));
  assert(attachments.length <= 16); assert.equal(attachments.length, 11);
  for (let n = 1; n <= 6; n++) assert(byAttachment.has(`post_foto_${n}`));
  for (const item of attachments) {
    assert(Number.isFinite(item.gewicht) && item.gewicht >= 0);
    assert(Number.isFinite(item.wert) && item.wert >= 0);
    assert.equal(typeof item.handelbar, 'boolean');
    if (item.bestehend) assert.equal(pointer(item.quelle, item.zeiger).name, item.name);
    if (item.figur) assert(senders.has(item.figur));
  }
  const answerFlags = new Set();
  const incoming = new Map();
  let total = 0, exclusive = 0, variantWords = 0;
  for (const b of letters) {
    const local = b.id.slice(5);
    const n = Number(b.id.split('_').at(-1));
    assert(b.absender === null ? b.id.startsWith('post_ohne_absender_') : senders.has(b.absender), `Unbekannter Absender ${b.absender}`);
    assert(cities.includes(b.stadt)); assert(b.kapitel >= 2 && b.kapitel <= 6);
    assert(words(b.betreff) >= 3 && words(b.betreff) <= 6, `Betreffwortzahl ${b.id}`);
    const count = words(b.text); total += count;
    if (b.absender === 'fasserin') {
      assert.equal(b.kurzbrief_ausnahme, 'oda_drei_zeilen'); assert.equal(b.text.split('\n').length, 3); assert(count > 0);
    } else {
      assert(!b.kurzbrief_ausnahme, `Unzulässige Wortzahlausnahme ${b.id}`);
      assert(count >= 80 && count <= 220, `Wortzahl ${b.id}: ${count}`);
    }
    assert(b.antworten.length >= 2 && b.antworten.length <= 3);
    assert(Number.isInteger(b.ausloeser.tage_nach) && b.ausloeser.tage_nach >= 0);
    assert(Number.isInteger(b.ausloeser.beziehung_min));
    assert(b.ausloeser.requires_flags.includes(`k${b.kapitel}_arrived`));
    if (b.absender) assert(b.ausloeser.requires_flags.includes(`post_kontakt_${b.absender}`));
    if (b.ausloeser.requires_flags.some(f => f.startsWith('post_antwort_'))) exclusive++;
    for (const [i, a] of b.antworten.entries()) {
      assert.equal(a.folge_flag, `post_antwort_${local}_${i + 1}`);
      assert(!answerFlags.has(a.folge_flag)); answerFlags.add(a.folge_flag);
      assert(a.abschluss_text.trim(), `Antwort ohne sichtbare Folge ${b.id}`);
      if (a.folge_brief !== null) {
        const next = byId.get(a.folge_brief); assert(next, `Unbekannter Folgebrief ${a.folge_brief}`);
        assert.equal(next.reihe, b.reihe); assert(next.kapitel >= b.kapitel);
        assert(Number(next.id.split('_').at(-1)) > n, `Rückwärtskante ${b.id}`);
        const gates = [...next.ausloeser.requires_flags, ...(next.ausloeser.requires_any_flags ?? [])];
        assert(gates.includes(a.folge_flag), `Antwort öffnet ihr Ziel nicht ${b.id}`);
        const list = incoming.get(next.id) ?? []; list.push(a.folge_flag); incoming.set(next.id, list);
      }
    }
    for (const [id, amount] of Object.entries(b.beilage)) {
      assert(Number.isInteger(amount) && amount > 0);
      if (id === 'schilling') assert(amount <= 12 && attachments.some(a => a.schilling === amount));
      else assert(byAttachment.has(id), `Unbekannte Beilage ${id}`);
    }
    if (b.nachsatz_varianten) {
      assert.equal(b.nachsatz_varianten.length, 2);
      for (const v of b.nachsatz_varianten) {
        assert.equal(v.requires_flags.length, 1);
        assert(b.ausloeser.requires_any_flags.includes(v.requires_flags[0]));
        assert(count + words(v.text) <= 220, `Gerenderter Text zu lang ${b.id}`);
        variantWords += words(v.text);
      }
    }
  }
  assert(exclusive >= 20, 'Zu wenige strikt antwortabhängige Folgebriefe');
  const ext = new Set(post.externe_flags.map(f => f.flag));
  const adapters = new Set(post.adapter_flags.map(f => f.flag));
  assert.equal(adapters.size, post.adapter_flags.length);
  for (const external of post.externe_flags) {
    const source = readFileSync(resolve(root, external.quelle), 'utf8');
    // CT describes k6_akt<n>_done parametrically.
    assert(source.includes(external.flag) || (external.flag === 'k6_akt4_done' && source.includes('k6_akt<n>_done')), `Externer Flagbeleg fehlt ${external.flag}`);
  }
  for (const b of letters) {
    for (const flag of [...b.ausloeser.requires_flags, ...(b.ausloeser.requires_any_flags ?? [])]) {
      assert(idPattern.test(flag)); assert(ext.has(flag) || adapters.has(flag) || answerFlags.has(flag), `Flag ohne Produzent ${flag}`);
    }
    const n = Number(b.id.split('_').at(-1));
    if (b.absender && n > 1) {
      assert(incoming.has(b.id), `Verwaister Folgebrief ${b.id}`);
      assert.equal(b.ausloeser.zeitanker, b.id.replace(/\d+$/, String(n - 1)) + '_beantwortet');
    } else assert.equal(b.ausloeser.zeitanker, `post_ankunft_${b.kapitel}`);
    if (!b.absender) assert(!b.ausloeser.requires_flags.some(f => f.startsWith('post_antwort_')));
  }
  assert(byId.get('post_ohne_absender_5').ausloeser.requires_flags.includes('k6_akt4_done'));
  assert(byId.get('post_fasserin_1').ausloeser.requires_flags.includes('post_fasserin_auftrag_offen'));
  for (const item of attachments) assert(letters.some(b => Object.hasOwn(b.beilage, item.schilling ? 'schilling' : item.id)), `Unbenutzte Beilage ${item.id}`);
  for (const city of cities) {
    assert.equal(post.schalter.filter(t => t.stadt === city).length, 4);
    for (const state of ['nichts', 'ein_brief', 'mehrere', 'paket']) assert(post.schalter.some(t => t.id === `post_schalter_${city}_${state}`));
    assert(post.notizbuch.some(t => t.id === `post_notizbuch_${city}`));
  }
  assert.equal(post.notizbuch.length, 6); assert.equal(post.buero.length, 3); assert.equal(post.koop.length, 4);
  assert.equal(post.briefboegen.length, 30);
  assert.deepEqual(post.briefboegen.flatMap(s => s.briefe).sort(), [...byId.keys()].sort());
  assert.equal(post.regeln.limit_pro_spieltag, 2);
  const distribution = Object.fromEntries(cities.slice(0, 5).map(city => [city, letters.filter(b => b.absender && b.stadt === city).length]));
  assert.deepEqual(distribution, { kettlegate: 30, wexmoor: 20, dunscar: 16, calderwick: 12, briarholt: 8 });
  return { total, exclusive, variantWords, distribution };
}
const stats = validate(input);

// Pure reference cases for the documented adapter contract, not runtime game code.
function contractChecks() {
  const all = input['briefe.json'];
  const ready = all.slice(0, 5).map((b, index) => ({ ...b, faellig_seit: 1 + index }));
  const state = { day: 8, deliveredToday: 0, delivered: new Set(), inbox: new Set(), claimed: new Set(), answers: new Map() };
  function deliver(day) {
    if (state.day !== day) { state.day = day; state.deliveredToday = 0; }
    const sorted = ready.filter(b => !state.delivered.has(b.id)).sort((a, b) => a.kapitel - b.kapitel || a.faellig_seit - b.faellig_seit || a.id.localeCompare(b.id));
    for (const b of sorted.slice(0, Math.max(0, 2 - state.deliveredToday))) { state.delivered.add(b.id); state.inbox.add(b.id); state.deliveredToday++; }
  }
  deliver(8); deliver(8); assert.equal(state.inbox.size, 2, 'Stadtwechsel darf Tageslimit nicht zurücksetzen');
  deliver(9); assert.equal(state.inbox.size, 4, 'Ungelesene Briefe müssen liegenbleiben');
  deliver(10); assert.equal(state.inbox.size, 5, 'Restliche fällige Post muss nachrücken');
  function claim(key, capacity) { if (!capacity || state.claimed.has(key)) return 0; state.claimed.add(key); return 1; }
  assert.equal(claim('p2:post_molly_3', false), 0); assert.equal(state.claimed.size, 0);
  assert.equal(claim('p2:post_molly_3', true), 1); assert.equal(claim('p2:post_molly_3', true), 0);
  function answer(letter, choice) {
    if (state.answers.has(letter.id)) return false;
    state.answers.set(letter.id, letter.antworten[choice].folge_flag); return true;
  }
  const first = all.find(b => b.id === 'post_ivy_1');
  assert(answer(first, 1)); assert(!answer(first, 0));
  assert(!all.find(b => b.id === 'post_ivy_2').ausloeser.requires_flags.includes(state.answers.get(first.id)));
  const flags = new Set([...state.answers.values()]);
  const reachable = (b, day, anchors) => b.ausloeser.requires_flags.every(f => flags.has(f))
    && (!b.ausloeser.requires_any_flags || b.ausloeser.requires_any_flags.some(f => flags.has(f)))
    && Number.isInteger(anchors[b.ausloeser.zeitanker]) && day - anchors[b.ausloeser.zeitanker] >= b.ausloeser.tage_nach;
  const second = all.find(b => b.id === 'post_holt_2');
  second.ausloeser.requires_flags.forEach(f => flags.add(f));
  assert(!reachable(second, 7, { [second.ausloeser.zeitanker]: 7 }));
  assert(reachable(second, 8, { [second.ausloeser.zeitanker]: 7 }));
  const canRead = (owner, reader, shared) => owner === 'beide' || owner === reader || shared;
  assert(!canRead('p2', 'p1', false)); assert(canRead('p2', 'p1', true));
  const canAnswer = (owner, actor) => owner === actor;
  assert(!canAnswer('p2', 'p1')); assert(canAnswer('p2', 'p2'));
  const anonymous = all.find(b => b.id === 'post_ohne_absender_5');
  flags.add('k6_arrived'); assert(!reachable(anonymous, 10, { post_ankunft_6: 10 }));
  flags.add('k6_akt4_done'); assert(reachable(anonymous, 10, { post_ankunft_6: 10 }));
}
contractChecks();
if (process.argv.includes('--self-test')) {
  const mutations = [
    d => d['briefe.json'].pop(),
    d => d['briefe.json'][1].id = d['briefe.json'][0].id,
    d => d['briefe.json'][0].text = 'Zu kurz.',
    d => d['briefe.json'][0].betreff = 'Kurz',
    d => d['briefe.json'][0].absender = 'post_erfunden',
    d => d['briefe.json'][0].antworten[0].folge_brief = 'post_unbekannt_1',
    d => d['briefe.json'][0].antworten[0].folge_flag = '',
    d => d['briefe.json'][0].beilage = { post_fehlt: 1 },
    d => d['post.json'].absender[0].zeiger = '/npcs/falsch',
    d => d['briefe.json'].find(b => b.id === 'post_ohne_absender_5').ausloeser.requires_flags = ['k6_arrived'],
    d => d['briefe.json'][0].ausloeser.requires_flags.push('post_unproduziert'),
    d => d['briefe.json'].find(b => b.id === 'post_fasserin_1').text += '\nVierte Zeile.',
  ];
  for (const [index, mutate] of mutations.entries()) {
    const copy = structuredClone(input); mutate(copy);
    assert.throws(() => validate(copy), `Negativtest ${index + 1} wurde nicht erkannt`);
  }
  console.log(`Negativtests: ${mutations.length}/${mutations.length} erkannt`);
}
console.log('DI Post: OK');
console.log('JSON: 3 lesbar; IDs eindeutig; 91 Pflichtbriefe; 29 Absender mit geprüften Quellen');
console.log('Verteilung: Kettlegate 30 / Wexmoor 20 / Dunscar 16 / Calderwick 12 / Briarholt 8 / anonym 5');
console.log(`Wortzahl Briefkörper: ${stats.total}; zusätzliche Nachsatzvarianten: ${stats.variantWords}; Brieftexte gesamt: ${stats.total + stats.variantWords}`);
console.log('Wortgrenzen: 90 reguläre Briefe 80–220; Oda einmalig drei Zeilen; Varianten gerendert höchstens 220');
console.log(`Strikt antwortabhängige Folgebriefe: ${stats.exclusive}; alle Antworten mit Flag und sichtbarer Folge`);
console.log('Beilagen: 11/16, davon 6 Fotos; Schalter 24 / Notizbuch 6 / Büro 3 / Koop 4');
console.log('Vertragsszenarien: Tageslimit, Rückstau, Zeitanker, Antwortsperre, einmalige Beilage, Koop-Zugriff, Finalesperre OK');
