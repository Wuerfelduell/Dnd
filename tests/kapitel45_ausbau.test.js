// Kapitel 4/5 ausgebaut (Seb 2026-11-15): Die Ernte der Gefallenen (Calderwick) und die Kur der Gefallenen (Briarholt)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { STURZ_FLAGS } from '../src/data/aufstieg.js';
import { K4S_KOPFGELDER, K4S_WETHERBY } from '../src/data/calderwickStory.js';
import { K5S_SAMMLER } from '../src/data/briarholtStory.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const gestuerzt = () => { const s = new GameState(content); for (const f of STURZ_FLAGS) s.flags.add(f); s.startQuest('k4_aufstieg'); return s; };
const node = (npc, key) => content.dialogues[content.npcs[npc].dialogue].nodes[key];
const inter = (map, id) => content.maps[map].interactables.find((i) => i.id === id);
const choice = (s, npc, text) => node(npc, 'hub').choices.find((c) => c.text.startsWith(text) && s.meets(c));

test('Calderwick: Figuren haben neue Rollen, keine Akte-Zweige mehr, alle Sprünge im Gespräch führen ins Leere nicht', () => {
  for (const id of ['cw_darnell', 'cw_hesk', 'cw_noel_bellcross', 'cw_malliver', 'cw_crayford', 'cw_wetherby', 'cw_pritch', 'cw_bexley', 'cw_wicksend']) {
    const d = content.dialogues[content.npcs[id].dialogue];
    assert.ok(!d.nodes.hub.choices.some((c) => /^(cwa_|thema_|bitte)/.test(c.next ?? '')), `${id}: alte Zweige`);
    for (const [k, n] of Object.entries(d.nodes)) for (const c of n.choices ?? []) if (c.next) assert.ok(d.nodes[c.next], `${id}.${k} → ${c.next}`);
  }
  assert.equal(content.dialogues.k4s_ida.nodes.start.choices.length, 3);
});

test('Kapitel 4: Fallbuch, Hesk, Ida, Seiten, Akte, Wetherby, Linie nach Briarholt', () => {
  const s = gestuerzt();
  assert.ok(choice(s, 'cw_darnell', 'Trag mich'));
  s.applyEffects(node('cw_darnell', 'k4s_fallbuch'));
  s.applyEffects(node('cw_hesk', 'k4s_hesk'));
  assert.ok(choice(s, 'cw_noel_bellcross', 'Ich weiß, wo Ida'));
  // Idas Kiste: erst der Erntehelfer, dann die Kiste
  const kiste = inter('cw_sortiergrube', 'k4s_kiste');
  assert.ok(s.meets(inter('cw_sortiergrube', 'k4s_kiste_waechter').visible_if) && !s.meets(kiste.visible_if));
  s.flags.add('won_k4s_erntehelfer');
  assert.ok(s.meets(kiste.visible_if));
  s.applyEffects(kiste.effects);
  assert.ok(content.maps.cw_kueche.npcs.some((n) => n.id === 'cw_ida_bellcross' && s.meets(n.visible_if)));
  // Drei verbrannte Seiten, Ruth liest Starlings Eintrag
  s.applyEffects(node('cw_malliver', 'k4s_malliver'));
  assert.ok(!choice(s, 'cw_malliver', 'Hier sind'));
  for (const i of [1, 2, 3]) s.flags.add(`k4s_brand${i}`);
  assert.ok(choice(s, 'cw_malliver', 'Hier sind'));
  s.applyEffects(node('cw_malliver', 'k4s_seite'));
  assert.ok(choice(s, 'cw_crayford', 'Binde mir'));
  s.applyEffects(node('cw_crayford', 'k4s_akte'));
  assert.equal(s.itemCount('k4s_akte_starling'), 1);
  // Wetherby: Kampf aus dem Gespräch, danach die Linie
  assert.equal(node('cw_wetherby', 'k4s_wetherby').combat, K4S_WETHERBY);
  const linie = inter('cw_kronenarchiv', 'k4s_linie');
  assert.ok(!s.meets(linie.visible_if));
  s.flags.add(`won_${K4S_WETHERBY}`);
  assert.ok(s.meets(linie.visible_if));
  s.applyEffects(linie.effects);
  assert.ok(s.flags.has('kapitel4_done') && s.flags.has('bha_reise_frei') && s.quests.k4_aufstieg === 'done');
  assert.equal(s.pendingTravel.map, 'bh_kutschenhof');
  assert.ok(s.quests.k5_kur !== undefined);
  // Am Kutschenhof wartet Frost (Codex-Akte): erst er setzt k5_arrived und startet Akt 1
  assert.ok(s.meets(inter('bh_kutschenhof', 'bha_ankunft_station').visible_if));
  s.applyEffects(content.dialogues.bha_ankunft.nodes.bha_ankunft_frost);
  assert.ok(s.flags.has('k5_arrived') && s.quests.bha_akt1 !== undefined);
  // Die Linie fährt in beide Richtungen (Gildensitze bleiben erreichbar)
  assert.ok(s.meets(inter('bh_kutschenhof', 'k5s_linie_hoch').visible_if) && s.meets(inter('cw_kronenarchiv', 'k5s_linie_runter').visible_if));
});

test('Kasse der Gefallenen: vier Kopfgelder in den Gefahrengebieten, Lohn bei Pritch', () => {
  const s = gestuerzt();
  for (const k of K4S_KOPFGELDER) {
    assert.ok(content.encounters[k.id]?.boss && content.maps[k.zone].interactables.some((i) => i.encounter === k.id));
    s.flags.add(`won_${k.id}`);
    const lohn = node('cw_pritch', `${k.id}_lohn`);
    const before = s.money;
    s.applyEffects(lohn);
    assert.ok(s.money > before);
  }
  assert.ok(content.quests.k4s_kasse.steps.every((st) => s.meets(st.done)));
});

test('Briarholt: Gegner auf Sequenz 3, dichter besetzt; Sammler der Linie erst nach dem Kapitelende', () => {
  const bh = Object.values(content.encounters).filter((e) => /^bh_/.test(e.zone ?? ''));
  assert.ok(bh.length > 10 && bh.every((e) => e.bh_seq3 && e.hp_floor_mult > 1 && e.dmg_mult > 1.4));
  for (const id of ['bh_kaltes_palmhaus', 'bh_wurzelkammer', 'bh_verlassene_waescherei']) assert.ok(content.maps[id].roamers.length >= 12, id);
  const s = gestuerzt();
  s.flags.add('k5_arrived');
  const sammler = inter('bh_verteilanlage', 'k5s_sammler');
  s.flags.add('k5s_leitung');
  assert.ok(!s.meets(sammler.visible_if));
  s.flags.add('kapitel5_done');
  assert.ok(s.meets(sammler.visible_if) && sammler.encounter === K5S_SAMMLER);
});
