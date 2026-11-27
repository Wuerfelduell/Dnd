// Kapitel 7 Varrowmouth: Anreise nach dem Thron, Karten ohne Rückweg, Akt I und II, Gezeiten, Wrackfeld (`npm test`)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { gezeitAt, GEZEIT_SECONDS } from '../src/core/Clock.js';
import { loadContent } from './helpers.js';
import { varrowmouthTexte } from '../tools/i18n-varrowmouth.mjs';

const content = loadContent();
const VM = Object.keys(content.maps).filter((m) => m.startsWith('vm_'));

test('Varrowmouth: acht Karten, kein Weg zurück in frühere Städte', () => {
  assert.deepEqual(VM.sort(), ['vm_grenzzaun', 'vm_leuchtbank', 'vm_oberstrasse', 'vm_registerkeller', 'vm_schlickgassen', 'vm_stegviertel', 'vm_wrackfeld', 'vm_zollhafen']);
  for (const m of VM) for (const i of content.maps[m].interactables) if (i.kind === 'door') assert.ok(i.to.startsWith('vm_'), `${m}: Tür nach ${i.to}`);
  for (const t of content.travel.filter((x) => x.city === 'varrowmouth')) assert.ok(t.map.startsWith('vm_'));
});

test('Anreise am Bügelraum erst nach dem Thron und einem Briarholt-Ende', () => {
  const s = new GameState(content);
  const station = content.maps.bh_buegelraum.interactables.find((i) => i.id === 'k6_anreise_wahl_station');
  for (const f of ['kapitel5_done', 'bha_end_wahl']) s.flags.add(f);
  assert.equal(s.meets(station.visible_if), false, 'vor dem Thron unsichtbar');
  s.flags.add('kapitel6_done');
  assert.equal(s.meets(station.visible_if), true);
  const d = content.dialogues.k6_anreise_wahl;
  const ankunft = d.nodes.k6_anreise_wahl_ankunft;
  s.applyEffects(ankunft);
  assert.ok(s.flags.has('k6_arrived'));
  assert.equal(s.pendingTravel.map, 'vm_zollhafen');
  assert.equal(s.quests.k6_akt1, 'active');
});

test('Tam und der Zollschreiber tragen die Hauptakte als „Zur Sache.“', () => {
  for (const id of ['vmn_tam_verrin', 'vmn_zollschreiber']) {
    const d = content.dialogues[content.npcs[id].dialogue];
    const first = d.nodes[d.start.find((v) => v.requires_flags?.includes('gezeit_ebbe')).node];
    assert.equal(first.choices[0].text, 'Zur Sache.');
    assert.ok(d.nodes[first.choices[0].next], `${id}: Hauptknoten fehlt`);
  }
});

test('Die fünf Akte hängen aneinander, Bilanz V öffnet das Ende „Die Namen tragen“', () => {
  const ja = content.dialogues.k6_bilanz1.nodes.k6_bilanz1_ja;
  assert.deepEqual(ja.sets_flags, ['k6_akt1_done']);
  assert.deepEqual(ja.start_quests, ['k6_akt2']);
  assert.deepEqual(content.dialogues.k6_bilanz2.nodes.k6_bilanz2_ja.start_quests, ['k6_akt3']);
  assert.deepEqual(content.dialogues.k6_bilanz3.nodes.k6_bilanz3_ja.start_quests, ['k6_akt4']);
  assert.deepEqual(content.dialogues.k6_bilanz4.nodes.k6_bilanz4_ja.start_quests, ['k6_akt5']);
  assert.ok(content.dialogues.k6_bilanz5.nodes.k6_bilanz5_ja.sets_flags.includes('k6_traeger_festgelegt'));
  for (const id of ['k6_31_station', 'k6_vertrauen_station']) assert.ok(content.maps.vm_oberstrasse.interactables.some((i) => i.id === id), id);
  for (const id of ['k6_41_station', 'k6_44_station', 'k6_kampf_leuchtfeuerwaechter_station']) assert.ok(content.maps.vm_leuchtbank.interactables.some((i) => i.id === id), id);
  for (const id of ['k6_51_station', 'k6_54_station', 'k6_bilanz5_station', 'k6_ende_station', 'k6_zeuge_station']) assert.ok(content.maps.vm_registerkeller.interactables.some((i) => i.id === id), id);
  assert.ok(content.maps.vm_registerkeller.npcs.some((n) => n.id === 'vmn_pegelherrin'));
  assert.ok(content.maps.vm_leuchtbank.npcs.some((n) => n.id === 'vmn_osric_dale'));
});

test('Kapitelende: jedes Ende setzt kapitel7_done, Bosse auf Kapitel-7-Niveau', () => {
  for (const id of ['k6_ende_schliessen', 'k6_ende_verbrennen', 'k6_ende_uebergeben', 'k6_ende_teilen']) assert.ok(content.endings[id].sets_flags.includes('kapitel7_done'), id);
  const s = new GameState(content);
  s.setEnding('k6_ende_schliessen');
  assert.ok(s.flags.has('kapitel7_done') && s.flags.has('k6_done'));
  assert.ok(s.epilogue('k6_ende_schliessen').length > 0);
  for (const [id, min] of [['leuchtfeuerwaechter', 16000], ['pegelherrin', 18000], ['pegelherrin_register', 20000]]) assert.ok(content.encounters[id].hp >= min && content.encounters[id].boss, id);
  assert.equal(new Combat(new GameState(content), 'pegelherrin_register').foes.length, 3);
});

test('Wrackfeld: Oststeg erst mit Akt II und nur bei Ebbe', () => {
  const s = new GameState(content);
  const steg = content.maps.vm_stegviertel.interactables.find((i) => i.kind === 'door' && i.to === 'vm_wrackfeld');
  for (const f of ['k6_arrived', 'k6_tam_weg', 'gezeit_ebbe']) s.flags.add(f);
  assert.equal(s.meets(steg.visible_if), false, 'vor Akt II zu');
  s.flags.add('k6_akt1_done');
  assert.equal(s.meets(steg.visible_if), true);
  s.flags.delete('gezeit_ebbe');
  s.flags.add('gezeit_flut');
  assert.equal(s.meets(steg.visible_if), false, 'bei Flut zu');
  assert.ok(content.maps.vm_wrackfeld.roamers.length >= 8);
  for (const r of content.maps.vm_wrackfeld.roamers) assert.ok(content.encounters[r.encounter] && content.loot[r.encounter], r.encounter);
});

test('Wrackmutter: Kapitel-7-Boss mit zwei Tauwerken, Sieg schließt die Station auf', () => {
  const s = new GameState(content);
  const c = new Combat(s, 'wrackmutter');
  assert.equal(c.foes.length, 3);
  assert.ok(content.encounters.wrackmutter.hp * 1.4 > 18000, 'mindestens Engel-Niveau');
  assert.ok(content.loot.wrackmutter.drops.some((d) => d.item === 'vmi_registerseite'));
  const station = content.maps.vm_wrackfeld.interactables.find((i) => i.dialogue === 'k6_kampf_wrackmutter');
  assert.ok(station, 'Kampfstation im Wrackfeld');
  const kampf = content.dialogues.k6_kampf_wrackmutter;
  assert.equal(kampf.nodes.k6_kampf_wrackmutter_kampf.encounter, 'wrackmutter');
  assert.ok(content.maps.vm_wrackfeld.interactables.some((i) => i.dialogue === 'k6_24_dialog'));
});

test('Gezeiten wechseln alle 360 Sekunden', () => {
  assert.equal(gezeitAt(0), 'ebbe');
  assert.equal(gezeitAt(GEZEIT_SECONDS + 1), 'flut');
  const s = new GameState(content);
  s.playTime = GEZEIT_SECONDS * 3 + 5;
  s.syncSeason();
  assert.ok(s.flags.has('gezeit_flut') && !s.flags.has('gezeit_ebbe'));
});

test('Varrowmouth: alle Haupttexte stehen im EN-Wörterbuch', () => {
  const dir = new URL('../src/i18n/en/', import.meta.url);
  const all = Object.assign({}, ...readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8'))));
  const fehlt = varrowmouthTexte(content).filter((t) => !(t in all));
  assert.deepEqual(fehlt, []);
});
