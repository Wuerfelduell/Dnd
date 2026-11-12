// Bonusakte nach Kapitel 2: nach Brandt zeigt das Notizbuch den Weg nach Dunscar (`npm test`)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { questTarget } from '../src/core/Guide.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const ZIEL = { rein: 'wx_kahn', moor: 'wx_kahn', lichtmeister: 'wx_leuchtturm', meer: 'wx_kahn' };

test('Nach dem Leuchtfeuer zeigt der Wegweiser auf Brandt', () => {
  const s = new GameState(content);
  s.startQuest('k2_akt5');
  for (const s0 of content.quests.k2_akt5.steps.slice(0, -1)) for (const f of s0.done.requires_flags) s.flags.add(f);
  const t = questTarget(s, 'k2_akt5');
  assert.equal(t.map, 'wx_leuchtturm');
  assert.equal(t.id, 'brandt');
});

for (const [k, map] of Object.entries(ZIEL)) {
  test(`Ende ${k}: Bonusakte führt zur Nachricht und zur Reise nach Dunscar`, () => {
    const s = new GameState(content);
    s.startQuest('k2_akt5');
    s.applyEffects(content.endings[`k2_${k}`]);
    const q = `k2_weiter_${k}`;
    assert.equal(s.quests[q], 'active');
    let t = questTarget(s, q);
    assert.equal(t.map, map);
    assert.equal(t.id, `k3a_anreise_${k}_brief`);
    s.flags.add(`k3a_anreise_${k}_bereit`);
    t = questTarget(s, q);
    assert.equal(t.id, `k3a_anreise_${k}_reise`);
    const node = content.dialogues[`k3a_anreise_${k}`].nodes[`k3a_anreise_${k}_fahrt`];
    s.applyEffects(node);
    assert.equal(s.quests[q], 'done');
  });
}

test('Alte Spielstände nach Kapitel 2 bekommen die Bonusakte beim Laden', () => {
  const s = new GameState(content);
  s.flags.add('kapitel2_done');
  s.flags.add('k2_end_rein');
  s.startBonusakteK2();
  assert.equal(s.quests.k2_weiter_rein, 'active');
  const t = new GameState(content);
  t.flags.add('kapitel2_done'); t.flags.add('k2_end_rein'); t.flags.add('k3_arrived');
  t.startBonusakteK2();
  assert.equal(t.quests.k2_weiter_rein, undefined);
});

test('Kapitel 3: „Der Ruf durch die Wand“ lässt sich bei Pfiff überspringen', () => {
  const s = new GameState(content);
  s.flags.add('k3_arrived');
  s.startQuest('k3a_akt1');
  s.applyEffects(content.dialogues.k3a_14_dialog.nodes.k3a_14_ueberspringen);
  assert.ok(s.flags.has('k3a_14_geschlossen'));
  assert.ok(s.hasConclusion('k3a_14_d'));
  assert.ok(s.clues.has?.('k3a_14_c2') ?? s.clues.includes('k3a_14_c2'));
});

test('Kapitel 3: Horchstelle an der Drehscheibe lässt sich überspringen', () => {
  const s = new GameState(content);
  s.flags.add('k3_arrived');
  s.startQuest('k3a_akt1');
  const before = s.signal.charges;
  assert.ok(s.skipStation('k3o_horch_drehscheibe').ok);
  assert.ok(s.flags.has('k3a_14_geschlossen'));
  assert.ok(s.hasConclusion('k3a_14_d'));
  assert.ok(s.signal.revealedRoutes.has('k3o_horch_drehscheibe:east'));
  assert.equal(s.signal.charges, before);
});

test('Dunscar: alle Gebiete offen, Hör-Fährte gestrichen, Schichtbund offen (auch für alte Stände)', () => {
  for (const t of content.travel.filter((x) => x.city === 'dunscar')) {
    assert.ok(!(t.requires_flags ?? []).some((f) => /^k3a_akt\d_done$|^kapitel3_done$/.test(f)), `${t.map} noch gesperrt`);
  }
  assert.ok(!content.quests.k3a_akt1.steps.some((st) => JSON.stringify(st.done).includes('k3a_14')));
  const s = new GameState(content);
  s.flags.add('k3_arrived');
  s.dunscarOffen();
  for (const f of ['treffen_schichtbund', 'k3a_akt2_done', 'k3a_akt4_done']) assert.ok(s.flags.has(f), f);
  assert.ok(!s.flags.has('kapitel3_done'));
});

test('Dunscar: Trichter-/Drehscheiben-Aufträge sind gestrichen, laufende verschwinden', async () => {
  const { GESTRICHENE_AUFTRAEGE } = await import('../src/core/GameState.js');
  assert.ok(GESTRICHENE_AUFTRAEGE.includes('k3n_drehscheibe'));
  assert.ok(!content.dialogues.k3a_oren.nodes[content.dialogues.k3a_oren.start ?? 'start']?.choices?.some?.((c) => c.next === 'k3n_drehscheibe_beginn'));
  assert.ok(!content.maps.ds_schwellenring.interactables.some((i) => i.id === 'koop_ds_horchen_auftrag'));
  const s = new GameState(content);
  s.flags.add('k3_arrived');
  s.quests.k3n_drehscheibe = 'active';
  s.tracked = 'k3n_drehscheibe';
  s.dunscarOffen();
  assert.equal(s.quests.k3n_drehscheibe, undefined);
  assert.notEqual(s.tracked, 'k3n_drehscheibe');
});

test('Dunscar: Zug-/Hör-Story raus, Kapitelziel Rache an Starling (Seb 2026-11-12)', () => {
  // keine Fährten-Stationen mehr auf den Karten
  for (const m of Object.values(content.maps)) for (const i of m.interactables ?? []) assert.ok(!/^k3a_\d\d_/.test(i.id) && i.id !== 'k3a_urteil_station', i.id);
  const pfiff = content.dialogues.k3a_pfiff.nodes.k3a_start.choices;
  assert.ok(!pfiff.some((c) => (c.next ?? '').startsWith('k3a_abschluss')));
  // Ankunft startet das neue Ziel statt Akt 1
  const ank = content.maps.ds_endbahnhof.interactables.find((i) => i.id === 'k3a_ankunft');
  assert.deepEqual(ank.effects.start_quests, ['k3_rache']);
  // alter Stand mitten in Akt 2: Akt verschwindet, Ziel kommt
  const s = new GameState(content);
  s.flags.add('k3_arrived'); s.flags.add('k3a_akt1_done');
  s.quests.k3a_akt2 = 'active'; s.tracked = 'k3a_akt2';
  s.dunscarOffen();
  assert.equal(s.quests.k3a_akt2, undefined);
  assert.equal(s.quests.k3_rache, 'active');
  assert.ok(s.questSteps('k3_rache').every((st) => !st.done));
  s.applyEffects(content.dialogues.k3a_pfiff.nodes.k3r_starling);
  assert.ok(s.questSteps('k3_rache')[0].done);
  // Gerüchte über den alten Gott auch bei den Ortskundigen
  const ok = content.dialogues.ds_ok_bruchstufen ?? Object.values(content.dialogues).find((d) => d.nodes?.gott);
  assert.ok(ok.nodes.gott.sets_flags.includes('k3r_gott_gehoert'));
});
