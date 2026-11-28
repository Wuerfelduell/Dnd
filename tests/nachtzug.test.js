import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState, GESTRICHENE_AUFTRAEGE } from '../src/core/GameState.js';
import { loadContent, talk } from './helpers.js';

// Seb 2026-11-27: „Der letzte Zug nach Dunscar“ (früher Kapitel-3-Hauptakte, im Koop kaputt) kommt als freiwillige
// Nebengeschichte zurück. Sie läuft neben „Rache an Starling“, braucht kein Signalgerät und beendet kein Kapitel.
const content = loadContent();
const ACTS = { 1: ['11', '12', '13'], 2: ['21', '22', '23', '24'], 3: ['31', '32', '33', '34'], 4: ['41', '42', '43', '44'], 5: ['51', '52', '53', '54'] };

function dunscar({ koop = false } = {}) {
  const s = new GameState(content);
  s.flags.add('kapitel2_done'); s.flags.add('k3_arrived');
  s.dunscarOffen();
  if (koop) s.addP2();
  return s;
}

const visible = (s, mapId, id) => {
  const it = content.maps[mapId].interactables.find((i) => i.id === id);
  assert.ok(it, `${id} fehlt auf ${mapId}`);
  return s.sichtbar ? s.sichtbar(it) : s.meets(it.visible_if ?? {});
};

/** Eine Fährte friedlich durchspielen: Probe/Horchen richtig, alle Spuren, Fakten verbinden, Befund festhalten. */
function station(s, n) {
  const tree = content.dialogues[`k3a_${n}_dialog`];
  const nodes = tree.nodes;
  for (const [id, node] of Object.entries(nodes)) if (/_(probe_gut|horchen_richtig)$/.test(id)) s.applyEffects(node);
  for (const node of Object.values(nodes)) if (node.gives_clues) s.applyEffects(node);
  const d = content.deductions.find((x) => x.id === `k3a_${n}_d`);
  assert.equal(s.combine(...d.pairs[0]).result, 'new', `Fakten von ${n} lassen sich verbinden`);
  const start = typeof tree.start === 'string' ? tree.start : tree.start.at(-1).node;
  const verbinden = nodes[start].choices.find((c) => c.text === 'Die beiden Fakten verbinden.');
  assert.ok(s.meets(verbinden), `${n}: Verbinden möglich`);
  if (n === '51') { s.applyEffects(nodes.k3a_familien_ja); return; }
  if (n === '53') { s.applyEffects(nodes.k3a_gallowmere_konfrontation); return; }
  if (n === '23') { s.applyEffects(nodes.k3a_nellie_schutz); return; }
  s.applyEffects(nodes[`k3a_${n}_festhalten`]);
  assert.ok(s.flags.has(`k3a_${n}_geschlossen`), `${n} geschlossen`);
}

test('Nachtzug: ohne Annahme bei Pfiff stehen keine Fährten herum, Starling bleibt das Kapitelziel', () => {
  const s = dunscar();
  assert.equal(s.quests.k3_rache, 'active');
  assert.equal(s.quests.k3z_akt1, undefined);
  assert.ok(!visible(s, 'ds_endbahnhof', 'k3a_11_station'));
  assert.ok(s.openLeads().some((l) => l.quest === 'k3z_akt1'), 'Spur zu Pfiff im Journal');
  talk(s, 'k3a_pfiff', ['Was hat es mit dem Nachtzug', 'Ich sehe mir das an']);
  assert.equal(s.quests.k3z_akt1, 'active');
  assert.equal(content.quests.k3z_akt1.kind, 'side');
  assert.ok(visible(s, 'ds_endbahnhof', 'k3a_11_station'));
  assert.ok(!visible(s, 'ds_kalkmarkt', 'k3a_21_station'), 'Akt 2 erst nach Akt 1');
  assert.equal(s.quests.k3_rache, 'active');
});

test('Nachtzug: zu zweit komplett spielbar, jeder darf jede Fährte übernehmen, kein Kapitelende', () => {
  const s = dunscar({ koop: true });
  talk(s, 'k3a_pfiff', ['Was hat es mit dem Nachtzug', 'Ich sehe mir das an']);
  const before = s.money;
  for (const [akt, list] of Object.entries(ACTS)) {
    // abwechselnd: Spieler 2 übernimmt die geraden Fährten
    list.forEach((n, i) => (i % 2 ? s.withPlayer(2, () => station(s, n)) : station(s, n)));
    for (const n of list) assert.ok(visible(s, content.quests[`k3z_akt${akt}`].steps.find((st) => st.target?.id === `k3a_${n}_station`).target.map, `k3a_${n}_station`) || s.flags.has(`k3a_${n}_geschlossen`));
    const who = akt % 2 ? 1 : 2;
    s.withPlayer(who, () => talk(s, 'k3a_pfiff', [`Nachtzug, Akt ${akt}`, 'Den bestätigten nächsten Schritt']));
    if (akt < 5) assert.equal(s.quests[`k3z_akt${akt}`], 'done', `Akt ${akt} fertig`);
  }
  assert.ok(s.money > before, 'Akte zahlen aus');
  assert.ok(!s.hasSignalDevice(), 'kein Signalgerät nötig');
  assert.ok(s.flags.has('k3a_bilanz5') && s.flags.has('k3a_lebende_draussen') && s.flags.has('k3a_familien_zustimmung'));
  s.withPlayer(2, () => talk(s, 'k3a_urteil', ['Feierabend für die Toten', 'Dieses Ende endgültig bestätigen.']));
  assert.equal(s.endings.k3_nachtzug, 'k3_feierabend');
  assert.equal(s.endings.kapitel3, undefined);
  assert.equal(s.quests.k3z_akt5, 'done');
  for (const f of ['k3a_akt5_done', 'k3a_end_feierabend']) assert.ok(s.flags.has(f), f);
  assert.ok(!s.flags.has('kapitel3_done'), 'Kapitel 3 endet weiterhin mit Starling');
  assert.equal(content.endings.k3_feierabend.chapter, undefined, 'keine Kapitel-Tafel');
  assert.equal(s.quests.k3_rache, 'active');
  assert.ok(!visible(s, 'ds_letzter_bahnsteig', 'k3a_urteil_station'), 'Urteil nur einmal');
  assert.ok(s.epilogue('k3_feierabend').length > 0, 'Epilog-Tafeln kommen');
  // Welt reagiert: Gerede und Einwohner zum Ende hängen an k3a_end_*
  const t = new GameState(content);
  assert.ok(t.load(JSON.parse(JSON.stringify(s.serialize()))));
  assert.equal(t.endings.k3_nachtzug, 'k3_feierabend');
});

test('Nachtzug: Story-Kämpfe starten wirklich und führen nach dem Sieg weiter', () => {
  for (const [dlg, node, enc] of [['k3a_24_dialog', 'k3a_24_horchen_kampf', 'schwellenhund'], ['k3a_33_dialog', 'k3a_33_horchen_kampf', 'vorhauer'], ['k3a_52_dialog', 'k3a_52_horchen_kampf', 'vielrufer'], ['k3a_53_dialog', 'k3a_gallowmere_kampf', 'gallowmere']]) {
    const nodes = content.dialogues[dlg].nodes;
    assert.equal(nodes[node].combat, enc, `${node} startet ${enc}`);
    const starts = content.dialogues[dlg].start;
    assert.ok(Array.isArray(starts) && starts.some((st) => (st.requires_flags ?? []).includes(`won_${enc}`)), `${dlg}: nach dem Sieg geht es weiter`);
  }
});

test('Nachtzug: gestrichene alte Akte bleiben gestrichen, die neue Nebengeschichte nicht', () => {
  assert.ok(GESTRICHENE_AUFTRAEGE.includes('k3a_akt1'));
  assert.ok(!GESTRICHENE_AUFTRAEGE.some((q) => q.startsWith('k3z_')));
  const s = dunscar();
  talk(s, 'k3a_pfiff', ['Was hat es mit dem Nachtzug', 'Ich sehe mir das an']);
  s.dunscarOffen();
  assert.equal(s.quests.k3z_akt1, 'active');
  // Fallakte und Enden gehören zur Nebengeschichte, nicht zu „Rache an Starling“
  assert.ok(content.cases.some((c) => c.id === 'k3_nachtzug'));
  for (const id of ['k3_feierabend', 'k3_stilllegung', 'k3_gegenstimme', 'k3_vollzaehlig']) {
    assert.equal(content.endings[id].case, 'k3_nachtzug');
    assert.ok(!content.endings[id].sets_flags.includes('kapitel3_done'), id);
  }
});
