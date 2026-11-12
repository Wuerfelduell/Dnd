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
  for (const f of ['k3a_14_geschlossen', 'treffen_schichtbund']) assert.ok(s.flags.has(f), f);
  assert.ok(s.hasConclusion('k3a_14_d'));
});
