// Kapitel 7 Varrowmouth, Etappe 1: Anreise nach dem Thron, Karten ohne Rückweg, Akt I, Gezeiten (`npm test`)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { gezeitAt, GEZEIT_SECONDS } from '../src/core/Clock.js';
import { loadContent } from './helpers.js';
import { varrowmouthTexte } from '../tools/i18n-varrowmouth.mjs';

const content = loadContent();
const VM = Object.keys(content.maps).filter((m) => m.startsWith('vm_'));

test('Varrowmouth: vier Karten, kein Weg zurück in frühere Städte', () => {
  assert.deepEqual(VM.sort(), ['vm_oberstrasse', 'vm_schlickgassen', 'vm_stegviertel', 'vm_zollhafen']);
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

test('Akt I: Bilanz schließt den Akt ohne Akt II zu starten', () => {
  const ja = content.dialogues.k6_bilanz1.nodes.k6_bilanz1_ja;
  assert.deepEqual(ja.sets_flags, ['k6_akt1_done']);
  assert.equal(ja.start_quests, undefined);
  assert.equal(content.quests.k6_akt2, undefined);
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
