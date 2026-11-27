// Seb 2026-11-27: Story-Widersprüche nach anderen Enden finden (tools/schicksale.mjs)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { pruefeSchicksale, endenUebersicht } from '../tools/schicksale.mjs';
import { RIVALEN } from '../src/data/rivale.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const stand = (...flags) => { const s = new GameState(content); for (const f of flags) s.flags.add(f); return s; };
const npc = (map, id) => content.maps[map].npcs.find((n) => n.id === id);

test('niemand taucht nach seinem Ende wieder auf (verhaftet, suspendiert, verschwunden, tot)', () => {
  const fehler = pruefeSchicksale(content);
  assert.deepEqual(fehler, [], fehler.map((f) => `${f.wo}: ${f.warum}`).join('\n'));
});

test('Übersicht der Enden: jeder Fall mit mehreren Enden hat Flags, die nur manche Enden setzen', () => {
  const u = endenUebersicht(content);
  const c1 = u.find((f) => f.fall === 'case_01');
  assert.deepEqual(c1.flags.map((x) => x.flag).sort(), ['c1_wrong', 'elias_dead', 'elias_rescued']);
});

test('Kettlegate: Hester, Moll, Holt und Anselm passen zum gewählten Ende', () => {
  assert.equal(stand('briefed_03', 'hester_lost').meets(npc('revier', 'hester').visible_if), false, 'verschwundene Hester liegt nicht im Revier');
  assert.ok(stand('briefed_03', 'hester_saved').meets(npc('revier', 'hester').visible_if));
  assert.equal(stand('hester_saved').meets(npc('ebba', 'moll').visible_if), false, 'Moll sitzt in der Zelle');
  assert.ok(stand('hester_lost').meets(npc('ebba', 'moll').visible_if), 'falsches Ende: Moll bleibt frei');
  const holt = npc('altmarkt', 'holt');
  assert.equal(stand('fs_fest_laternennacht_aktiv', 'holt_suspended').meets(holt.visible_if), false, 'suspendierter Holt nicht beim Fest');
  const s = stand('c2_wrong');
  assert.match(s.nodeText(content.dialogues.anselm.nodes.start), /drei Nächten in der Zelle/);
  assert.match(stand().nodeText(content.dialogues.anselm.nodes.start), /^Gott zum Gruße/);
});

test('Fall 9: Miriam Vey kann man nicht anklagen, wenn sie schon in Haft sitzt', () => {
  const vey = content.dialogues.marlowe.nodes.accuse9.choices.find((c) => c.next === 'vey9');
  assert.equal(stand('vey_arrested').meets(vey), false);
  assert.ok(stand('vey_fled').meets(vey));
});

test('Post: Briefe von Verhafteten und Suspendierten kommen nicht', () => {
  for (const [id, flag] of [['post_holt_1', 'holt_suspended'], ['post_gouvernante_1', 'wren_arrested'], ['post_ivy_1', 'c2_wrong']]) {
    const b = content.post.briefe.find((x) => x.id === id);
    const s = stand('k2_arrived', ...b.ausloeser.requires_flags);
    s.post.anker[b.ausloeser.zeitanker] = 0;
    assert.ok(s.postFaellig(b), `${id} ohne ${flag}`);
    s.flags.add(flag);
    assert.equal(s.postFaellig(b), false, `${id} mit ${flag}`);
  }
  for (const b of content.post.briefe.filter((x) => x.absender === 'molly')) assert.doesNotMatch(b.text, /Miss Wren/, `${b.id}: Wren sitzt meist in Haft`);
  assert.equal(content.npcs.pip.name, 'Pip', 'der Zeitungsjunge heißt nicht wie das verschwundene Waisenkind Benji');
});

test('Wexmoor: Kit erinnert sich, wenn du ihn in Kettlegate hast festnehmen lassen', () => {
  const start = content.dialogues.kit_wexmoor.nodes.start;
  assert.match(stand('kit_arrested').nodeText(start), /Zelle/);
  assert.doesNotMatch(stand().nodeText(start), /Zelle/);
});

test('Heimkehr: Kahn, Leuchtturm und Rache in Wexmoor passen zum Ende von Kapitel 2', () => {
  const sichtbar = (s, map, id) => content.maps[map].interactables.filter((x) => (x.id === `hk_${id}` || x.id.startsWith(`hk_${id}__`)) && s.meets(x.visible_if));
  const held = (...flags) => { const s = stand('k2_arrived', 'k3_arrived', 'k4_arrived', 'kapitel2_done', ...flags); s.pathway = { id: 'eisen', seq: 3, digestion: 0 }; return s; };
  for (const ende of ['k2_end_rein', 'k2_end_moor', 'k2_end_lichtmeister', 'k2_end_meer']) {
    for (const [map, id] of [['wx_kahn', 'wx_kahn'], ['wx_leuchtturm', 'wx_leuchtturm']]) {
      const s = held(ende);
      const v = sichtbar(s, map, id);
      assert.equal(v.length, 1, `${ende} ${id}: genau ein Nachhall`);
      if (ende === 'k2_end_meer') assert.match(v[0].text, id === 'wx_kahn' ? /auf See/ : /brennt noch/);
      s.applyEffects(v[0].effects);
      assert.equal(sichtbar(s, map, id).length, 0, `${ende} ${id}: nach dem Lesen weg`);
    }
  }
  const boss = content.encounters.hkr_wexmoor_boss;
  const intro = (s) => boss.intro_varianten.find((v) => s.meets(v))?.text ?? boss.intro;
  assert.match(intro(held('k2_end_meer')), /über das Meer entkommen/);
  assert.match(intro(held('k2_end_lichtmeister')), /Lichtmeister/);
  assert.equal(intro(held('k2_end_moor')), boss.intro);
  const rost = content.encounters.hkr_kettlegate_trupp;
  const rostIntro = (s) => rost.intro_varianten.find((v) => s.meets(v))?.text ?? rost.intro;
  assert.match(rostIntro(held('rost_broken')), /zerschlagen/);
  assert.match(rostIntro(held('c5_wrong')), /verraten/);
  assert.doesNotMatch(rostIntro(held()), /zerschlagen|verraten/, 'wer die Rostbrüder nie bekämpft hat, hat sie auch nicht zerschlagen');
});

test('Rivale: nach dem Bogen-Finale wartet er nicht mehr im Pfadviertel', () => {
  for (const pid of Object.keys(RIVALEN)) {
    const s = new GameState(content);
    s.pathway = { id: pid, seq: 4, digestion: 0 };
    assert.ok(s.rivaleText('viertel_fort', 1)?.length > 20, pid);
  }
});
