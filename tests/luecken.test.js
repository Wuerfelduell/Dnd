// Fehlende Quellen sichtbar machen: Warum blockiert Marlowe, welche Vermutung braucht noch eine Quelle,
// und zeigt der Wegweiser auf die fehlende Quelle? (`npm test`)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { questTarget, dialogueGate, sourceBlockers, guideIndex } from '../src/core/Guide.js';
import { clueOrigins, deductionGap, gapText, openGuesses, knowledgeGaps, onlyKnowledgeMissing } from '../src/core/hints.js';
import { loadContent } from './helpers.js';

const content = loadContent();

/** Fall 7/8 wie bei Seb: alles gesichert bis auf „Miss Wrens Grund“, Claras Aussage ist die einzige Quelle. */
function stuckInCase7() {
  const s = new GameState(content);
  s.quests.case_07 = 'active';
  s.quests.case_08 = 'active';
  s.flags.add('briefed_07'); s.flags.add('briefed_08');
  ['police_thorne', 'finch_found', 'chute_prints', 'finch_coal', 'water_glass', 'hale_weed', 'clara_protest',
    'tea_tin', 'molly_tea', 'nan_sleepwalk', 'molly_walk'].forEach((c) => s.addClue(c));
  assert.equal(s.combine('coal_prints', 'drowned_dry').result, 'new');
  assert.equal(s.combine('canal_water', 'drowned_dry').result, 'new');
  assert.equal(s.combine('foreclosure', 'sleep_tea').result, 'new');
  assert.equal(s.combine('sleep_tea', 'sleepwalk').result, 'new');
  assert.equal(s.factStatus('foreclosure'), 'suspected');
  assert.ok(!s.isCertain('link_motive'));
  return s;
}

test('Fall 7: Marlowe blockiert → Wegweiser zeigt auf die Briefe im Kontor Thorne und sagt warum', () => {
  const s = stuckInCase7();
  const t = questTarget(s, 'case_07');
  assert.equal(t.step, 'Berichte Marlowe, wer Thorne getötet hat');
  assert.equal(t.map, 'kontor_thorne');
  assert.equal(t.id, 'letter');
  assert.equal(t.via, 'Inspektorin Marlowe');
  assert.match(t.because, /Marlowe braucht/);
  assert.match(t.because, /„Miss Wrens Grund“ ist erst eine Vermutung/);
  assert.match(t.because, /1 von 2 Quellen/);
  assert.match(t.because, /Briefe auf dem Pult/);
  // Mit der zweiten Quelle ist der Weg frei: zurück zu Marlowe, ohne Erklärung
  s.addClue('pfaendung_letter');
  const t2 = questTarget(s, 'case_07');
  assert.equal(t2.id, 'marlowe');
  assert.equal(t2.because, undefined);
});

test('Gesprächsgatter: der Weg zu Marlowes Anklage scheitert nur an „gesichert“', () => {
  const s = stuckInCase7();
  const unmet = dialogueGate(s, 'marlowe', 'wren7');
  assert.equal(unmet.length, 1);
  assert.deepEqual(unmet[0].requires_certain, ['d7_child', 'link_motive']);
  assert.ok(onlyKnowledgeMissing(s, unmet[0]));
  const gaps = knowledgeGaps(s, unmet[0]);
  assert.equal(gaps.length, 1, 'd7_child ist gesichert, nur link_motive fehlt');
  assert.equal(gaps[0].deduction.id, 'link_motive');
  assert.ok(gaps[0].drawn);
  assert.equal(gaps[0].weak.length, 1);
  assert.equal(gaps[0].weak[0].fact, 'foreclosure');
  assert.deepEqual(gaps[0].weak[0].missing, ['pfaendung_letter']);
  // Der schlechte Ausgang (Neffe) steht ohne Bedingungen offen und ist kein Ziel
  assert.equal(dialogueGate(s, 'marlowe', 'end_heir').length, 0);
  const src = guideIndex(content).flag.case_07_closed.find((x) => x.node === 'wren7_go');
  assert.equal(sourceBlockers(s, src).length, 1);
});

test('Notizbuch: offene Vermutungen nennen die schwache Information und ihren Fundort', () => {
  const s = stuckInCase7();
  const open = openGuesses(s, 'case_08');
  assert.deepEqual(open.map((g) => g.deduction.id), ['link_motive']);
  const text = gapText(open[0]);
  assert.match(text, /Thorne wollte das Waisenhaus/);
  assert.match(text, /1 von 2 Quellen → Die Briefe auf dem Pult lesen \(Kontor Thorne am Altmarkt\)/);
  assert.equal(openGuesses(s, 'case_07').length, 0, 'd7_child und d7_canal sind gesichert');
  // Gesichert → keine Lücke mehr
  s.addClue('pfaendung_letter');
  assert.equal(deductionGap(s, 'link_motive'), null);
});

test('Lücke einer noch nicht gezogenen Schlussfolgerung: verknüpfen, sobald beide Informationen bekannt sind', () => {
  const s = new GameState(content);
  s.quests.case_07 = 'active';
  s.addClue('police_thorne');
  let g = deductionGap(s, 'd7_child');
  assert.equal(g.combinable, false);
  assert.ok(g.weak.some((w) => w.fact === 'coal_prints' && w.status === 'unknown'));
  assert.match(gapText(g), /ist noch unbekannt/);
  s.addClue('chute_prints');
  g = deductionGap(s, 'd7_child');
  assert.ok(g.combinable);
  assert.match(gapText(g), /Verknüpfe sie im Notizbuch/);
});

test('Wegweiser: fehlt die Information für eine Schlussfolgerung noch ganz, zeigt er auf die Quelle statt ins Notizbuch', () => {
  const s = new GameState(content);
  s.quests.case_07 = 'active';
  s.flags.add('briefed_07');
  s.addClue('police_thorne');
  s.addClue('finch_found');
  // Schritt 2 „wie kam jemand ins Kontor“ braucht d7_child; coal_prints ist unbekannt → zum Kohlenschacht statt „verknüpfen“
  const t = questTarget(s, 'case_07');
  assert.equal(t.step, 'Finde heraus, wie jemand in das verschlossene Kontor kam');
  assert.equal(t.map, 'kontor_thorne');
  assert.equal(t.notebook, undefined);
  s.addClue('chute_prints');
  assert.ok(questTarget(s, 'case_07').notebook, 'jetzt sind beide bekannt: verknüpfen');
});

test('Fundstücke zählen als Fundort: Hinweise aus „Untersuchen“ im Inventar haben eine Herkunft', () => {
  const origins = clueOrigins(content);
  assert.ok(origins.vial_voice?.some((o) => /Untersuche „.*“ im Inventar/.test(o.text)), 'Stimmphiole');
  assert.ok(origins.bell_tones?.length, 'Glocke von St. Ebba');
});

test('Jede Information, die irgendwo gesichert sein muss, hat für jeden Hinweis einen Fundort', () => {
  const origins = clueOrigins(content);
  const certain = new Set();
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    for (const d of o.requires_certain ?? []) certain.add(d);
    for (const v of Object.values(o)) walk(v);
  };
  walk(content.dialogues); walk(content.quests);
  const missing = [];
  for (const d of content.deductions) {
    if (!certain.has(d.id)) continue;
    for (const f of new Set(d.pairs.flat())) {
      const clues = Object.entries(content.clues).filter(([, c]) => c.fact === f);
      assert.ok(clues.length >= 2, `${f} (${d.id}) hat nur ${clues.length} Quelle(n) und kann nie gesichert werden`);
      for (const [id] of clues) if (!origins[id]?.length) missing.push(`${id} (${f}, ${d.id})`);
    }
  }
  assert.deepEqual(missing, []);
});

test('Wartezeit für den Tipp beginnt bei jedem Fortschritt neu', () => {
  const s = new GameState(content);
  s.tick(100);
  assert.equal(s.idleSeconds, 100);
  s.addClue('police_thorne');
  assert.equal(s.idleSeconds, 0);
  s.tick(50);
  s.applyEffects({ sets_flags: ['irgendwas_neues'] });
  assert.equal(s.idleSeconds, 0);
  s.tick(50);
  s.applyEffects({ sets_flags: ['irgendwas_neues'] });
  assert.equal(s.idleSeconds, 50, 'eine schon gesetzte Markierung ist kein Fortschritt');
});
