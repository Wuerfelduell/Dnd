// Quellen im Notizbuch und Fundstücke untersuchen (Risiko gegen Bonus-Hinweise).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { sourceOf } from '../src/core/sources.js';
import { loadContent, talk, fight, SKILLED } from './helpers.js';

const content = loadContent();
const lucky = () => 0; // jede Wagnis-Variante greift
const unlucky = () => 0.99; // keine greift

function afterCase3() {
  const s = new GameState(content);
  ['case_01', 'case_02', 'case_03'].forEach((q) => { s.quests[q] = 'done'; });
  s.addItem('schlagstock');
  s.equip('schlagstock');
  return s;
}

test('Quellen: Gesichter für Personen, Symbole für Gelesenes, Gesehenes und Berichte', () => {
  const of = (id) => sourceOf(content, content.clues[id]);
  assert.deepEqual(of('agnes_felix'), { type: 'npc', npc: 'agnes' });
  assert.deepEqual(of('diva_felix'), { type: 'npc', npc: 'diva' }); // „Madame Varenne“ → Madame Odile Varenne
  assert.deepEqual(of('starling_glass'), { type: 'npc', npc: 'astronom' });
  assert.deepEqual(of('ezra_tones'), { type: 'npc', npc: 'turmwaechter' });
  assert.equal(of('prompter_box').type, 'observation');
  assert.equal(of('police_mask').type, 'police');
  assert.equal(of('hymnal_list').type, 'note');
  assert.equal(of('vial_voice').type, 'vision'); // per "by" festgelegt
  // Jeder Hinweis bekommt eine Zuordnung, Figuren existieren
  for (const [id, c] of Object.entries(content.clues)) {
    const r = sourceOf(content, c);
    assert.ok(r.type, id);
    if (r.type === 'npc') assert.ok(content.npcs[r.npc], `${id}: ${r.npc}`);
  }
});

test('Das verschwundene Gesangbuch: Pimm, Quill, Einband lesen und ungeöffnet zurückgeben', () => {
  const s = afterCase3();
  talk(s, 'pimm', ['Fehlt im Archiv']);
  assert.equal(s.quests.lost_hymnal, 'active');
  talk(s, 'quill', ['Gesangbuch']);
  assert.equal(s.itemCount('verlorenes_gesangbuch'), 1);
  // Einband: wenig Risiko, sicherer Hinweis auf Felix
  const nerves = s.composure;
  talk(s, 'inspect_gesangbuch', ['Einband']);
  assert.ok(s.hasClue('hymnal_list'));
  assert.ok(s.composure < nerves, 'kostet Nerven (kein Beyonder: statt Unruhe)');
  talk(s, 'pimm', ['Hier ist das Gesangbuch']);
  assert.equal(s.quests.lost_hymnal, 'done');
  assert.equal(s.itemCount('verlorenes_gesangbuch'), 0);
  assert.ok(!s.flags.has('hymnal_opened'));
});

test('Gesangbuch aufschlagen: mit ruhigen Nerven und Glück ein Bonus-Hinweis, sonst Fluch und Kampf', () => {
  const calm = afterCase3();
  calm.random = lucky;
  calm.addItem('verlorenes_gesangbuch');
  talk(calm, 'inspect_gesangbuch', ['aufschlagen']);
  assert.ok(calm.hasClue('hymnal_ash'));
  assert.equal(calm.pendingCombat, null);

  const cursed = afterCase3();
  cursed.random = unlucky;
  cursed.addItem('verlorenes_gesangbuch');
  const hp = cursed.hp;
  talk(cursed, 'inspect_gesangbuch', ['aufschlagen']);
  assert.ok(cursed.hp < hp, 'Verletzung');
  assert.ok(cursed.hp >= 1, 'nie tödlich');
  assert.equal(cursed.pendingCombat, 'gesangbuchgeist');
  assert.ok(!cursed.hasClue('hymnal_ash'));
  const { combat } = fight(cursed, 'gesangbuchgeist', { defend: SKILLED, healBelow: 15 });
  assert.equal(combat.outcome, 'won');
  assert.ok(cursed.hasClue('hymnal_ash'), 'Hinweis nach dem Sieg');
  // Pimm merkt, dass es geöffnet wurde
  cursed.quests.lost_hymnal = 'active';
  assert.deepEqual(talk(cursed, 'pimm', ['Hier ist das Gesangbuch']).at(-1), 'hymnal_back_read');
});

test('Unruhe trifft Beyonder, Schaden aus Effekten tötet nie', () => {
  const s = afterCase3();
  s.pathway = { id: Object.keys(content.pathways ?? {})[0] ?? 'echo', seq: 9, digestion: 0 };
  s.random = unlucky;
  s.addItem('stimmphiole');
  s.hp = 3;
  const before = s.unruhe;
  talk(s, 'inspect_phiole', ['Korken']);
  assert.ok(s.unruhe > before);
  assert.equal(s.hp, 1);
  assert.ok(!s.hasClue('vial_voice'), 'Pech: nur der Schrei');
  s.random = lucky;
  s.setComposure(100);
  talk(s, 'inspect_phiole', ['Korken']);
  assert.ok(s.hasClue('vial_voice'));
});

test('Glocke, Splitter und Spiegelscherbe geben Bonus-Hinweise für Fall 4 und den Chor', () => {
  const s = afterCase3();
  s.random = lucky;
  s.quests.case_04 = 'active';
  ['glocke', 'sternsplitter'].forEach((i) => s.addItem(i));
  talk(s, 'inspect_glocke', ['Ohr']);
  assert.ok(s.hasClue('bell_tones'));
  talk(s, 'inspect_splitter', ['singenden']);
  assert.ok(s.hasClue('shard_vision'));
  // Nach Fall 4 spricht Vey aus der Glocke
  s.quests.case_04 = 'done';
  talk(s, 'inspect_glocke', ['Ohr']);
  assert.ok(s.flags.has('bell_vey_heard'));
  // Spiegelschatten lässt die Scherbe fallen
  fight(s, 'mirror_shade', { defend: SKILLED, healBelow: 15 });
  assert.equal(s.itemCount('spiegelscherbe'), 1);
  s.setComposure(100);
  talk(s, 'inspect_scherbe', ['hineinsehen']);
  assert.ok(s.hasClue('mirror_choir'));
});
