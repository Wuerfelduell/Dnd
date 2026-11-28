// Seb 2026-11-27: Seq 4 im Pfadviertel verdauen, Seq 3 stockend, ab Seq 3 Rückreise in die alten Städte mit sichtbaren Veränderungen
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { travelDestinations, lockedCities } from '../src/core/Travel.js';
import { pathActions, PATH_ACTION_DIGEST } from '../src/core/Pathways.js';
import { VIERTEL_VERDAU, NACHHALL_PCT } from '../src/data/seq3Weg.js';
import { NACHHALL, STIMMEN, HK_QUEST } from '../src/data/heimkehr.js';
import { heimkehrWoerterbuch } from '../tools/i18n-heimkehr.mjs';
import { loadContent } from './helpers.js';

const content = loadContent();
const held = (pid = 'eisen', seq = 4, map = `o3_${pid}`) => {
  const s = new GameState(content);
  for (const f of ['k2_arrived', 'k3_arrived', 'k4_arrived']) s.flags.add(f);
  s.addItem('revolver');
  s.weapon = 'revolver';
  s.pathway = { id: pid, seq, digestion: 0 };
  s.map = map;
  s.updateMaxHp();
  s.hp = s.maxHp;
  return s;
};
const sieg = (s, id) => {
  const c = new Combat(s, id);
  c.outcome = 'won';
  c.enemy.hp = 0;
  c.finish({ noLoot: true });
};

test('Seq 4 im eigenen Viertel: jeder Sieg verdaut fest, Herde/Rangprüfungen/Bosse beim ersten Mal mehr', () => {
  const s = held('faden');
  sieg(s, 'o3_faden_g1');
  assert.ok(Math.abs(s.pathway.digestion - VIERTEL_VERDAU.sieg) < 0.01, `${s.pathway.digestion}`);
  const vor = s.pathway.digestion;
  sieg(s, 'o3_faden_herd1');
  assert.ok(s.pathway.digestion - vor >= VIERTEL_VERDAU.sieg + VIERTEL_VERDAU.erst.herd - 0.01);
  const vor2 = s.pathway.digestion;
  sieg(s, 'o3_faden_herd1'); // zweites Mal: nur der normale Anteil
  assert.ok(s.pathway.digestion - vor2 < 1);
  // fremdes Viertel und Seq 3: nichts
  const t = held('faden');
  sieg(t, 'o3_maske_g1');
  assert.ok(t.pathway.digestion < 0.1);
  const u = held('faden', 3);
  sieg(u, 'o3_faden_herd1');
  assert.ok(u.pathway.digestion < 0.1, `${u.pathway.digestion}`);
});

test('Ab Seq 3 stockt die Verdauung: Pfadhandlungen nur noch ein Bruchteil, Prüfstein weg', () => {
  for (const pid of Object.keys(PATH_ACTION_DIGEST)) {
    const a4 = pathActions({ id: pid, seq: 4 });
    const a3 = pathActions({ id: pid, seq: 3 });
    for (const k of Object.keys(a4)) assert.ok(a3[k].pct <= a4[k].pct * 0.25, `${pid} ${k}`);
  }
  const s = held('eisen', 3);
  assert.ok(!s.digestTable().some((r) => r.kind === 'verdau_probe' || r.kind === 'viertel_sieg'));
  assert.ok(s.digestTable().some((r) => r.kind === 'nachhall'));
});

test('Rückreise: erst ab Seq 3, im Koop reicht ein Spieler', () => {
  const s = held('eisen', 4, 'cw_gleisfuss');
  assert.ok(lockedCities(s).includes('kettlegate'));
  assert.equal(travelDestinations(s, 'cw_gleisfuss').filter((t) => t.heimkehr).length, 0);
  s.pathway.seq = 3;
  assert.ok(!lockedCities(s).includes('kettlegate'));
  const ziele = travelDestinations(s, 'cw_gleisfuss').filter((t) => t.heimkehr).map((t) => t.map);
  assert.deepEqual(ziele.sort(), ['ds_endbahnhof', 'nordtor', 'wx_bahnhof']);
  for (const [map, city] of [['nordtor', 'kettlegate'], ['wx_bahnhof', 'wexmoor'], ['ds_endbahnhof', 'dunscar']]) {
    const von = travelDestinations(s, map).filter((t) => t.heimkehr);
    assert.ok(von.some((t) => t.map === 'cw_gleisfuss'), `${city} → Calderwick`);
    assert.equal(von.length, 3, city);
  }
  // Koop: P1 Seq 4, P2 Seq 3
  const k = held('eisen', 4, 'cw_gleisfuss');
  k.addP2();
  k.p2.pathway = { id: 'laterne', seq: 3, digestion: 0 };
  assert.ok(k.heimkehr());
  // ohne Calderwick keine Heimkehr
  const f = held('eisen', 3, 'ds_endbahnhof');
  f.flags.delete('k4_arrived');
  assert.equal(f.heimkehr(), false);
});

test('Spielstand in Kettlegate bleibt dort, wenn Heimkehr erlaubt ist', () => {
  const s = held('eisen', 3, 'altmarkt');
  const data = JSON.parse(JSON.stringify(s.serialize()));
  const t = new GameState(content);
  t.load(data);
  assert.equal(t.map, 'altmarkt');
  const s4 = held('eisen', 4, 'altmarkt');
  const t4 = new GameState(content);
  t4.load(JSON.parse(JSON.stringify(s4.serialize())));
  assert.equal(t4.map, 'wx_kahn');
});

test('Alte Städte: gewöhnliche Gegner fallen, Bosse nicht', () => {
  const s = held('eisen', 3, 'altmarkt');
  const r = content.maps.altmarkt.roamers.find((x) => !content.encounters[x.encounter].boss);
  assert.ok(s.awes(r.encounter));
  const boss = Object.keys(content.encounters).find((id) => content.encounters[id].boss);
  assert.equal(s.awes(boss), false);
  s.map = 'cw_gleisfuss';
  assert.equal(s.heimkehrHier(), false);
});

test('Nachhall: 6 Orte je Stadt, je einmal, verdaut ab Seq 3', () => {
  for (const [city, liste] of Object.entries(NACHHALL)) {
    assert.equal(liste.length, 6, city);
    for (const [id, map] of liste) {
      assert.equal(content.maps[map]?.city ?? 'kettlegate', city, id);
      assert.ok(content.maps[map].interactables.some((x) => x.id === `hk_${id}`), id);
    }
  }
  const s = held('eisen', 3, 'revier');
  s.applyEffects({ nachhall: 'kg_revier' });
  assert.equal(s.pathway.digestion, NACHHALL_PCT[3]);
  s.applyEffects({ nachhall: 'kg_revier' });
  assert.equal(s.pathway.digestion, NACHHALL_PCT[3]);
  const it = content.maps.revier.interactables.find((x) => x.id === 'hk_kg_revier');
  assert.equal(s.meets(it.visible_if), false, 'nach dem Lesen weg');
  assert.ok(content.quests[HK_QUEST].steps.length === 3);
});

test('Stimmen: bekannte Leute erkennen den Heimkehrer', () => {
  const s = held('eisen', 3, 'ashgrove');
  const t = held('eisen', 4, 'ashgrove');
  for (const [npc, text] of Object.entries(STIMMEN)) {
    const d = content.dialogues[content.npcs?.[npc]?.dialogue ?? npc];
    assert.ok(d, npc);
    const key = typeof d.start === 'string' ? d.start : 'start';
    if (!d.nodes[key]) continue;
    assert.equal(s.nodeText(d.nodes[key]), text, npc);
    assert.notEqual(t.nodeText(d.nodes[key]), text, npc);
  }
});

test('Englisch: Wörterbuch heimkehr.json ist aktuell', () => {
  const en = JSON.parse(readFileSync(new URL('../src/i18n/en/heimkehr.json', import.meta.url), 'utf8'));
  assert.deepEqual(en, heimkehrWoerterbuch());
});

test('Gebete: Kettlegate ab Seq 4 hören, ab Seq 3 helfen; Wexmoor ab Seq 3; Dunscar ab Seq 2; Helfen macht Gläubige', async () => {
  const { GEBETE } = await import('../src/data/heimkehr.js');
  assert.equal(GEBETE.length, 6);
  const s = held('eisen', 4, 'cw_gleisfuss');
  s.gebeteTick();
  assert.equal(s.quests.hkg_kg_krypta, 'active', 'Kettlegate flüstert ab Seq 4');
  assert.equal(s.quests.hkg_wx_lake, undefined);
  const ziel = content.maps.crypt.interactables.find((x) => x.id === 'hkg_kg_krypta_ziel');
  s.map = 'crypt';
  assert.equal(s.meets(ziel.visible_if), false, 'auf Seq 4 noch nicht helfen');
  s.pathway.seq = 3;
  s.gebeteTick();
  assert.equal(s.quests.hkg_wx_lake, 'active');
  assert.equal(s.quests.hkg_ds_signalkinder, undefined, 'Dunscar erst ab Seq 2');
  assert.ok(s.meets(ziel.visible_if));
  const geld = s.money;
  s.applyEffects(ziel.effects);
  assert.ok(s.money > geld);
  assert.ok(s.flags.has('glaeubiger_kg_krypta'));
  assert.deepEqual(s.glaeubiger(), { gesamt: 1, kettlegate: ['Pater Ambrose'] });
  assert.equal(s.quests.hkg_kg_krypta, 'done');
  const ds = content.maps.ds_signalhang.interactables.find((x) => x.id === 'hkg_ds_signalkinder_ziel');
  s.map = 'ds_signalhang';
  s.pathway.seq = 2;
  s.gebeteTick();
  assert.equal(s.quests.hkg_ds_signalkinder, 'active');
  assert.ok(s.meets(ds.visible_if));
});

test('Rache: je alte Stadt ein Trupp, danach ein Anführer; beide Bosse (fallen nicht vor dem Heimkehrer)', () => {
  const s = held('eisen', 3, 'ankerhof');
  for (const city of ['kettlegate', 'wexmoor', 'dunscar']) {
    for (const art of ['trupp', 'boss']) {
      const id = `hkr_${city}_${art}`;
      assert.ok(content.encounters[id]?.boss, id);
      assert.equal(s.awes(id), false, id);
    }
  }
  const boss = content.maps.ankerhof.interactables.find((x) => x.id === 'hkr_kettlegate_boss');
  assert.equal(s.meets(boss.visible_if), false);
  s.flags.add('won_hkr_kettlegate_trupp');
  assert.ok(s.meets(boss.visible_if));
});
