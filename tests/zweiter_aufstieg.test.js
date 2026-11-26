// Kapitel 6 (Seb 2026-11-26): Narbe aus Licht, Bürgen in Calderwick, Schaffner ohne Gesicht, zweite Himmelsstadt, Starling, Thron
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { NARBE, narbeMult } from '../src/core/Narbe.js';
import { lookup, setDict } from '../src/core/I18n.js';
import { STURZ_FLAGS } from '../src/data/aufstieg.js';
import { BUERGEN, BUERGEN_FLAGS, HIMMEL2, K6_ENDE_FLAG, K6_QUEST, K6_STARLING, SCHAFFNER2 } from '../src/data/zweiterAufstieg.js';
import { zweiterAufstiegTexte } from '../tools/i18n-zweiter-aufstieg.mjs';
import { loadContent } from './helpers.js';

const content = loadContent();
const gestuerzt = () => { const s = new GameState(content); for (const f of STURZ_FLAGS) s.flags.add(f); s.startQuest('k4_aufstieg'); return s; };
const inter = (map, id) => content.maps[map].interactables.find((i) => i.id === id);
const dlg = (id) => content.dialogues[content.npcs[id].dialogue];
const start = (id) => dlg(id).nodes[dlg(id).start ?? 'cwn_start'];
const buergeWahl = (s, id) => start(id).choices.find((c) => c.text === 'Würdest du für mich bürgen?' && s.meets(c));

test('Bürgen: neun Calderwick-Leute mit neuen Rollen, ohne alte Akte-Zweige, auch nach Kapitel 4 in der Stadt', () => {
  assert.equal(Object.keys(BUERGEN).length, 9);
  for (const id of Object.keys(BUERGEN)) {
    assert.equal(content.npcs[id].role, BUERGEN[id].role);
    const d = dlg(id);
    assert.ok(!start(id).choices.some((c) => ['cwn_aushang', 'cwn_arbeit', 'cwn_ort'].includes(c.next)), `${id}: alte Zweige`);
    const zeugnis = start(id).choices.find((c) => c.next === 'cwn_zeugnis');
    assert.ok(!zeugnis || zeugnis.requires_any_quests_active, `${id}: Zeugnis nur zu Noels Nebenaufträgen`);
    for (const [k, n] of Object.entries(d.nodes)) for (const c of n.choices ?? []) {
      for (const next of Array.isArray(c.next) ? c.next.map((v) => v.node) : c.next ? [c.next] : []) assert.ok(d.nodes[next], `${id}.${k} → ${next}`);
    }
  }
  const s = gestuerzt();
  s.flags.add('kapitel4_done');
  for (const m of Object.values(content.maps)) for (const n of m.npcs ?? []) if (BUERGEN[n.id]) assert.ok(!(n.visible_if?.hide_if_flags ?? []).includes('kapitel4_done'), `${m.id}/${n.id}`);
});

test('Bürgschaft: erst nach dem Bürgschein, Unterschrift hängt an dem, was sie gesehen haben', () => {
  const s = gestuerzt();
  assert.ok(!buergeWahl(s, 'cwn_e_waescherin'), 'ohne Bürgschein keine Frage');
  s.flags.add('auf_zug2_gesehen');
  // Dora sieht die Narbe: unterschreibt sofort
  assert.equal(s.pick(buergeWahl(s, 'cwn_e_waescherin').next), 'k6_buerge');
  // Oskar erst, wenn Ida frei ist
  assert.equal(s.pick(buergeWahl(s, 'cwn_e_bote').next), 'k6_buerge_fehlt');
  s.flags.add('k4s_ida');
  assert.equal(s.pick(buergeWahl(s, 'cwn_e_bote').next), 'k6_buerge');
  // Selma: zwei Kopfgelder; Hanna: Geld
  s.flags.add('k4s_kg_vell_bezahlt');
  assert.equal(s.pick(buergeWahl(s, 'cwn_e_marktfrau').next), 'k6_buerge_fehlt');
  s.flags.add('k4s_kg_dorn_bezahlt');
  assert.equal(s.pick(buergeWahl(s, 'cwn_e_marktfrau').next), 'k6_buerge');
  s.money = 3000;
  assert.equal(s.pick(buergeWahl(s, 'cwn_e_griffmacherin').next), 'k6_buerge');
  s.applyEffects(dlg('cwn_e_griffmacherin').nodes.k6_buerge);
  assert.equal(s.money, 500);
  assert.ok(s.flags.has('k6_buerge_cwn_e_griffmacherin') && !buergeWahl(s, 'cwn_e_griffmacherin'), 'unterschreibt nur einmal');
});

test('Zweiter Zug: fünf Bürgen, dann der Schaffner (Koop: beide), dann hinauf', () => {
  const s = gestuerzt();
  s.flags.add('auf_zug2_gesehen');
  const tuer = inter('cw_kronenarchiv', 'k6_schaffner2_tuer');
  const zug = inter('cw_kronenarchiv', 'k6_zug_hoch');
  BUERGEN_FLAGS.slice(0, 4).forEach((f) => s.flags.add(f));
  assert.ok(!s.meets(tuer.visible_if));
  s.flags.add(BUERGEN_FLAGS[4]);
  assert.ok(!s.meets(tuer.visible_if), 'Seb 2026-11-26: erst nach Briarholt hinauf');
  s.flags.add('kapitel5_done');
  assert.ok(s.meets(tuer.visible_if) && !s.meets(zug.visible_if));
  assert.equal(tuer.effects.combat, SCHAFFNER2);
  assert.equal(content.encounters[SCHAFFNER2].min_seq, 3, 'höheres Wesen: schwächer als Heiliger kratzt nur');
  s.flags.add(`${SCHAFFNER2}_p1`);
  assert.ok(!s.meets(tuer.visible_if) && s.meets(zug.visible_if));
  assert.equal(zug.effects.travel.map, HIMMEL2);
  s.addP2();
  assert.ok(!s.meets(zug.visible_if), 'zu zweit muss auch Spieler 2 den Schaffner besiegt haben');
  s.flags.add(`${SCHAFFNER2}_p2`);
  assert.ok(s.meets(zug.visible_if));
});

test('Himmelsstadt 2: echte Kämpfe, keiner unbesiegbar, Niederlage = Fall nach Calderwick ohne Kapitel-Reset', () => {
  const m = content.maps[HIMMEL2];
  assert.ok(m && m.city === 'himmel' && m.roamers.length >= 12);
  for (const r of m.roamers) {
    const e = content.encounters[r.encounter];
    assert.ok(e, r.encounter);
    assert.ok(e.himmel && !e.unbesiegbar && !e.on_lose, r.encounter);
    assert.equal(e.lose_to.map, 'cw_gleisfuss');
  }
  assert.equal(content.encounters.hs2_engel_1.min_seq, 2);
  assert.equal(content.encounters[K6_STARLING].min_seq, 2);
  // Der erste Besuch bleibt, wie er war
  assert.ok(content.encounters.hs_halbgott_eisen.unbesiegbar);
});

test('Starling und Thron: Kapitel 6 endet, Vera trägt Starling ein, Briarholt zeigt auf den zweiten Zug', () => {
  const s = gestuerzt();
  s.startQuest(K6_QUEST);
  const thron = inter(HIMMEL2, 'hs2_thron');
  assert.ok(!s.meets(thron.visible_if));
  s.flags.add(`won_${K6_STARLING}`);
  assert.ok(s.meets(thron.visible_if) && !s.meets(inter(HIMMEL2, K6_STARLING).visible_if));
  s.applyEffects({ ...thron.effects, travel: undefined });
  assert.ok(s.flags.has(K6_ENDE_FLAG));
  assert.equal(s.quests[K6_QUEST], 'done');
  assert.ok(dlg('cw_darnell').nodes.hub.choices.some((c) => c.next === 'k6_starling_eintrag' && s.meets(c)));
  const kalt = inter('bh_verteilanlage', 'k5s_zug2');
  assert.ok(!/noch nicht gebaut/.test(kalt.text));
  assert.deepEqual(kalt.effects.start_quests, [K6_QUEST]);
});

test('Alte Stände: wer die Leitung schon abgedreht hat, bekommt Kapitel 6 beim Laden', () => {
  const s = gestuerzt();
  s.flags.add('k5s_leitung_kalt');
  s.calderwickOffen();
  assert.equal(s.quests[K6_QUEST], 'active');
});

test('Narbe: gegen Wesen von oben härter treffen und härter getroffen werden, sonst nichts', () => {
  const ohne = new GameState(content);
  const mit = new GameState(content);
  mit.flags.add('auf_verbrannt');
  const oben = content.encounters.hs2_halbgott_eisen;
  assert.equal(narbeMult(ohne, oben, 'schaden'), 1);
  assert.equal(narbeMult(mit, oben, 'schaden'), NARBE.schaden);
  assert.equal(narbeMult(mit, oben, 'erlitten'), NARBE.erlitten);
  assert.equal(narbeMult(mit, content.encounters.k4s_wetherby, 'schaden'), 1);
  const treffer = (s) => { s.pathway = { id: 'eisen', seq: 3, digestion: 50 }; const c = new Combat(s, 'hs2_halbgott_eisen'); c.armor = 0; c.maxRoundDmg = 0; return c.hurtEnemy(1000); };
  assert.ok(treffer(mit) > treffer(ohne));
});

test('EN: alle Texte des zweiten Aufstiegs stehen im Wörterbuch', () => {
  const dir = new URL('../src/i18n/en/', import.meta.url);
  setDict(Object.assign({}, ...readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')))));
  const fehlt = zweiterAufstiegTexte(content).filter((t) => !lookup(t));
  assert.deepEqual(fehlt, []);
});
