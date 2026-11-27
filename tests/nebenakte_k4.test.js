// Seb 2026-11-27: Die alte Kapitel-4-Akte „Die Stadt ohne Unterschrift“ als große Nebenquest in Calderwick (data/calderwickAkte.js, nebenakteCw.js)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { STURZ_FLAGS } from '../src/data/aufstieg.js';
import { K4S_WETHERBY } from '../src/data/calderwickStory.js';
import { IDA_FORT } from '../src/data/calderwickAkte.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const WALK = new Set([...'.,gpscwPK=']);
const gestuerzt = () => { const s = new GameState(content); for (const f of STURZ_FLAGS) s.flags.add(f); s.startQuest('k4_aufstieg'); return s; };
const dlg = (npc) => content.npcs[npc].dialogue;
const node = (npc, key) => content.dialogues[dlg(npc)].nodes[key];
const choice = (s, npc, text) => node(npc, 'hub').choices.find((c) => c.text.startsWith(text) && s.meets(c));
const alleInter = () => Object.values(content.maps).flatMap((m) => (m.interactables ?? []).map((i) => ({ m, i })));
const inter = (id) => alleInter().find((x) => x.i.id === id)?.i;
const idaInKueche = (s) => content.maps.cw_kueche.npcs.some((n) => n.id === 'cw_ida_bellcross' && s.meets(n.visible_if));

// Spielt mit dem echten GameState durch (wie docs/story/k4_akte/pruefen.mjs, aber auf dem eingebauten Inhalt)
function enter(s, d, key) { const D = content.dialogues[d]; key ??= s.pick(D.start); assert.ok(D.nodes[key], `${d}/${key}`); s.applyEffects(D.nodes[key], { nodeKey: `${d}.${key}` }); return key; }
function pick(s, d, cur, target) { const ch = content.dialogues[d].nodes[cur].choices.find((c) => c.next === target && s.meets(c)); assert.ok(ch, `Gesperrt: ${d}/${cur} → ${target}`); return enter(s, d, target); }
function addon(s, d, key) { let cur = enter(s, d); if (cur !== 'hub') cur = pick(s, d, cur, 'hub'); return pick(s, d, cur, key); }
function read(s, id) {
  const i = inter(id); assert.ok(i, id); assert.ok(s.meets(i.visible_if), `unsichtbar: ${id}`);
  if (!s.flags.has(i.done_flag)) s.applyEffects({ ...i.effects, sets_flags: [...(i.effects?.sets_flags ?? []), ...(i.done_flag ? [i.done_flag] : [])] });
}
function abgleich(s, n, privat) {
  const d = `cwa_abgleich${n}_dialog`; let k = enter(s, d); if (k.endsWith('_fertig')) return;
  const ersatz = content.dialogues[d].nodes[k].choices.find((c) => c.next?.endsWith('_ersatz') && s.meets(c));
  if (ersatz) { k = pick(s, d, k, ersatz.next); k = pick(s, d, k, `cwa_abgleich${n}_vorschau`); }
  const paar = content.dialogues[d].nodes[k].choices.find((c) => c.next?.includes('_paar') && s.meets(c)); assert.ok(paar, `Abgleich ${n}: kein Ankerpaar`);
  k = pick(s, d, k, paar.next); pick(s, d, k, `cwa_abgleich${n}_${privat}`);
}
const FIGUREN = ['cw_darnell', 'cw_crayford', 'cw_pritch', 'cw_wicksend', 'cw_hesk', 'cw_malliver', 'cw_noel_bellcross', 'cw_bexley'];
function folgen(s) {
  for (const npc of FIGUREN) if (s.flags.has(`cwa_verraten_${npc}`) && !s.flags.has(`cwa_folge_${npc}_gesichert`)) addon(s, dlg(npc), `cwa_folge_${npc}`);
  if (s.flags.has('cwa_verraten_cw_ida_bellcross') && !s.flags.has('cwa_folge_cw_ida_bellcross_gesichert')) { const k = enter(s, 'k4s_ida'); pick(s, 'k4s_ida', k, 'cwa_folge_cw_ida_bellcross'); }
  enter(s, 'cwa_kontaktpruefung'); assert.ok(s.flags.has('cwa_kontakte_geprueft'));
}
function boss(s, c, art) {
  const kurz = { 14: 'bleisammler', 24: 'blinder_zusteller', 52: 'nullfundament' }[c]; const p = `cwa_${kurz}`; const d = `${p}_dialog`; let k = enter(s, d);
  if (art === 'friedlich') { pick(s, d, k, `${p}_friedlich`); return; }
  for (let st = 1; st <= (c === '52' ? 3 : 2); st++) {
    k = pick(s, d, k, `${p}_kampf${st}`); const enc = s.pendingCombat; assert.ok(content.encounters[enc], `Kampf ${enc} fehlt`);
    s.pendingCombat = null; s.flags.add(`won_${enc}`); s.applyEffects(content.encounters[enc].on_win ?? {}); k = enter(s, d);
  }
  assert.ok(s.flags.has(`${p}_passiert`));
}
const VERHOER = { 11: 'cw_darnell', 13: 'cw_hesk', 21: 'cw_wicksend', 22: 'cw_pritch', 23: 'cw_hesk', 32: 'cw_malliver', 53: 'cw_wetherby' };
function verhoer(s, c, privat) {
  const d = dlg(VERHOER[c]); const p = `cwa_${c}_verhoer`; let k = addon(s, d, p);
  for (const x of ['_luege1', '_widerlegt1', '_luege2', '_widerlegt2', '_folgen']) k = pick(s, d, k, p + x);
  pick(s, d, k, `${p}_${privat}`);
}
const FAEHRTEN = ['11', '12', '13', '14', '21', '22', '23', '24', '31', '32', '33', '34', '41', '42', '43', '44', '51', '52', '53', '54'];
const ABGLEICH = { 14: 1, 22: 2, 33: 3, 42: 4, 51: 5, 54: 6 };

function starten({ wetherbyZuerst = false } = {}) {
  const s = gestuerzt();
  for (const f of ['k4s_fallbuch', 'k4s_hesk', 'k4s_noel', 'won_k4s_erntehelfer', 'k4s_ida']) s.flags.add(f);
  if (wetherbyZuerst) s.flags.add(`won_${K4S_WETHERBY}`);
  assert.ok(choice(s, 'cw_noel_bellcross', 'Wo ist Ida?'));
  const k = addon(s, dlg('cw_noel_bellcross'), 'cwa_neben_start');
  assert.equal(k, 'cwa_neben_start');
  return s;
}

function durchspielen(s, ende, art, privat) {
  for (const c of FAEHRTEN) {
    for (const x of [1, 2, 3, 4]) if (inter(`cwa_${c}_obj${x}`)) read(s, `cwa_${c}_obj${x}`);
    const ded = content.deductions.find((d) => d.id === `cwa_${c}_d`);
    assert.ok(ded.pairs[0].every((f) => s.factStatus(f) === 'likely'), `Fährte ${c}: Fakten fehlen`);
    s.combine(...ded.pairs[0]);
    if (VERHOER[c]) verhoer(s, c, privat);
    if (['14', '24', '52'].includes(c)) boss(s, c, art);
    if (c === '54') folgen(s);
    if (ABGLEICH[c]) abgleich(s, ABGLEICH[c], privat);
    if (c === '54') folgen(s);
    assert.ok(s.meets(inter(`cwa_${c}_station`).visible_if), `Station ${c} unsichtbar`);
    const d = `cwa_${c}_dialog`; let k = enter(s, d); k = pick(s, d, k, `cwa_${c}_schluss`); pick(s, d, k, `cwa_${c}_bestaetigt`);
    if (c === '42' && ende === 'widerspruch') for (const [npc, g] of [['cw_wicksend', 'markt'], ['cw_noel_bellcross', 'kuechen'], ['cw_darnell', 'bahnhof']]) addon(s, dlg(npc), `cwa_zeugen_${g}`);
    if (c === '51' && ende === 'widerspruch') addon(s, dlg('cw_noel_bellcross'), 'cwa_kuechenbuerge');
    if (c.endsWith('4')) { const a = c[0]; const k2 = addon(s, dlg('cw_crayford'), `cwa_bilanz${a}`); pick(s, dlg('cw_crayford'), k2, `cwa_bilanz${a}_ja`); }
  }
  let k = enter(s, 'cwa_finale'); k = pick(s, 'cwa_finale', k, `cwa_${ende}_warnung`); pick(s, 'cwa_finale', k, `cwa_${ende}_bestaetigt`);
}

test('Nebenakte: startet erst nach Idas Befreiung bei Noel, gehört nicht zur Hauptstory, nichts davon ist vorher sichtbar', () => {
  const s = gestuerzt();
  assert.ok(!choice(s, 'cw_noel_bellcross', 'Wo ist Ida?'), 'vor der Kiste noch nicht');
  for (const { m, i } of alleInter()) if (m.city === 'calderwick' && i.id.startsWith('cwa_')) assert.ok(!s.meets(i.visible_if), `${i.id} schon nach dem Sturz sichtbar`);
  for (const npc of [...FIGUREN, 'cw_wetherby']) for (const c of node(npc, 'hub').choices) if (/^cwa_/.test(c.next ?? '')) assert.ok(!s.meets(c), `${npc}: ${c.next} schon sichtbar`);
  for (let a = 1; a <= 5; a++) assert.equal(content.quests[`cwa_akt${a}`].kind, 'side');
  assert.equal(content.cases.find((c) => c.id === 'cwa_kapitel4').title, 'Nebenakte: Die Stadt ohne Unterschrift');
  // Kein Ende beendet Kapitel 4, keins zeigt ein Kapitelende-Bild
  for (const id of ['cwa_widerspruch', 'cwa_amtsinhaber', 'cwa_buecher', 'cwa_ordnung']) {
    const e = content.endings[id];
    assert.ok(!e.sets_flags.includes('kapitel4_done') && e.sets_flags.includes('cwa_akte_fertig') && !e.chapter, id);
  }
  // Keine Ersatzkerne für Seq 3/2/1 und keine Anreise aus Dunscar
  assert.ok(!Object.keys(content.dialogues).some((d) => /^cwa_.*_kern_dialog$/.test(d)));
  assert.ok(!alleInter().some(({ i }) => /^cwa_anreise_|_kern_station$|^cwa_ankunft_station$/.test(i.id)));
  // Die Hauptstory-Orte sind ab dem Sturz offen (früher erst nach Akt I bis IV)
  for (const door of ['cwo_cw_kronenarchiv_12', 'cwo_cw_archivsaal_8']) assert.ok(s.meets(inter(door).visible_if), door);
  for (const npc of ['cw_malliver', 'cw_bexley']) assert.ok(content.maps.cw_archivsaal.npcs.some((n) => n.id === npc && s.meets(n.visible_if)), npc);
  assert.ok(content.maps.cw_druckkammer.npcs.some((n) => n.id === 'cw_wetherby' && s.meets(n.visible_if)));
});

test('Nebenakte: Ida ist während der Akte fort, hinter Glas gefangen und nach Akt IV zurück in der Küche', () => {
  const s = starten();
  assert.equal(s.quests.cwa_akt1, 'active');
  assert.ok(!idaInKueche(s), 'Ida ist weg');
  assert.ok(s.flags.has(IDA_FORT));
  assert.ok(choice(s, 'cw_crayford', 'Ida ist wieder verschwunden.'));
  assert.ok(choice(s, 'cw_darnell', 'Die leere Ankunft'));
  assert.equal(s.pick(content.dialogues.k4s_ida.start), 'cwa_gefangen');
  for (const id of ['cwa_11_station', 'cwa_12_station', 'cwa_13_station', 'cwa_14_station', 'cwa_11_obj1']) assert.ok(s.meets(inter(id).visible_if), id);
  durchspielen(s, 'buecher', 'friedlich', 'vertraulich');
  assert.ok(s.flags.has('cwa_ida_frei') && !s.flags.has(IDA_FORT));
  assert.ok(idaInKueche(s), 'Ida wieder in der Küche');
  assert.equal(s.pick(content.dialogues.k4s_ida.start), 'start');
});

test('Nebenakte: alle vier Enden vollständig spielbar, mit Folgen, ohne Kapitel 4 zu beenden', () => {
  let runs = 0;
  for (const ende of ['widerspruch', 'amtsinhaber', 'buecher', 'ordnung']) for (const [art, privat] of [['friedlich', 'oeffentlich'], ['kampf', 'vertraulich']]) {
    const s = starten({ wetherbyZuerst: ende === 'amtsinhaber' });
    const geld = s.money;
    durchspielen(s, ende, art, privat);
    assert.ok(s.flags.has(`cwa_end_${ende}`) && s.flags.has('cwa_akte_fertig'), ende);
    assert.ok(!s.flags.has('kapitel4_done'), `${ende}: Kapitel 4 bleibt offen`);
    assert.equal(s.quests.k4_aufstieg, 'active');
    assert.equal(s.quests.cwa_akt5, 'done');
    assert.ok(s.money - geld >= 18000, `${ende}: Belohnungen auf Calderwick-Niveau (${s.money - geld})`);
    assert.ok(s.epilogue(`cwa_${ende}`).length >= 3);
    for (const npc of ['cw_noel_bellcross', 'cw_crayford', 'cw_wetherby']) assert.ok(node(npc, 'hub').choices.some((c) => c.next === `cwa_nachher_${ende}` && s.meets(c)), `${npc} nach ${ende}`);
    assert.ok(content.dialogues.k4s_ida.nodes.start.choices.some((c) => c.next === `cwa_nachher_${ende}` && s.meets(c)));
    assert.ok(Object.values(content.gossip.calderwick).flat().some((g) => g.requires_flags?.includes(`cwa_end_${ende}`)));
    runs++;
  }
  assert.equal(runs, 8);
});

test('Nebenakte: Wetherby bleibt nach seiner Niederlage in der Druckkammer (Titel statt Engel), Verhör in Akt V bleibt möglich', () => {
  const s = gestuerzt();
  s.flags.add(`won_${K4S_WETHERBY}`);
  assert.ok(content.maps.cw_druckkammer.npcs.some((n) => n.id === 'cw_wetherby' && s.meets(n.visible_if)));
  assert.ok(choice(s, 'cw_wetherby', 'Sie sind noch hier?'));
  assert.ok(!choice(s, 'cw_wetherby', 'Die Akte Starling'), 'Hauptstory-Kampf nicht doppelt');
});

test('Nebenakte: Stationen und Spuren stehen begehbar, alle Sprünge führen zu Knoten, alte Stände werden aufgeräumt', () => {
  for (const { m, i } of alleInter()) if (i.id.startsWith('cwa_')) {
    assert.ok(i.tile && WALK.has(m.rows[i.tile[1]]?.[i.tile[0]]), `${m.id}: ${i.id} auf ${i.tile} nicht begehbar (${m.rows[i.tile?.[1]]?.[i.tile?.[0]]})`);
    if (i.dialogue) assert.ok(content.dialogues[i.dialogue], `${i.id}: Dialog ${i.dialogue}`);
  }
  for (const [id, d] of Object.entries(content.dialogues)) for (const [k, n] of Object.entries(d.nodes ?? {})) for (const c of n.choices ?? []) {
    if (typeof c.next === 'string' && (id.startsWith('cwa_') || c.next.startsWith('cwa_') || k.startsWith('cwa_'))) assert.ok(d.nodes[c.next], `${id}.${k} → ${c.next}`);
  }
  // Stand von vor diesem Umbau: Akt-Flags waren beim Sturz geschenkt
  const alt = new GameState(content);
  for (const f of ['k4_arrived', 'cwa_ankunft_sicher', 'cwa_werkstatt', 'cwa_akt1_done', 'cwa_akt2_done', 'cwa_akt3_done', 'cwa_akt4_done']) alt.flags.add(f);
  alt.quests.cwa_akt3 = 'active';
  alt.calderwickOffen();
  assert.ok(!alt.flags.has('cwa_akt1_done') && !alt.flags.has('cwa_akt4_done'), 'geschenkte Akte zurückgenommen');
  assert.equal(alt.quests.cwa_akt3, undefined);
  assert.ok(alt.flags.has('cwa_werkstatt') && alt.flags.has('cwa_nebenakte_v1'));
  // Wer die Nebenakte schon spielt, behält sie
  alt.flags.add('cwa_akte_offen'); alt.flags.add('cwa_akt1_done'); alt.quests.cwa_akt2 = 'active';
  alt.calderwickOffen();
  assert.ok(alt.flags.has('cwa_akt1_done')); assert.equal(alt.quests.cwa_akt2, 'active');
});
