// Paket BG, Einbau: Ansprüche hängen am Spielstand, Hüterkämpfe zahlen jedem Beteiligten seine Kernzutat,
// Heddas Bestandsauszahlung erfüllt den eigenen Anspruch, der Partner holt seinen Anteil bei Hedda, Ersatzproben bei Pfiff.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const hedda = content.dialogues.k3p_hedda;
const cmd = (() => { let n = 0; return () => `test:${++n}`; })();

function duo(p1 = 'laterne', p2 = 'laterne', seq = 4) {
  const s = new GameState(content);
  s.pathway = { id: p1, seq, digestion: 0 };
  s.addP2();
  s.withPlayer(2, () => { s.pathway = { id: p2, seq, digestion: 0 }; }, { quiet: true });
  return s;
}

test('BG: Quellen, Ersatzzeilen und Texte sind geladen, Hedda/Pfiff/Kittering haben ihre Zusätze', () => {
  assert.equal(Object.keys(content.claimSources).length, 14);
  assert.equal(content.claimReplacements.length, 90);
  assert.equal(content.claimTexts.k3b_notizbuch, 'Offene Ansprüche');
  const hub = hedda.nodes[hedda.start].choices;
  assert.equal(hub.filter((c) => c.requires_claim).length, 14);
  assert.ok(content.dialogues.k3a_pfiff.nodes.k3a_start.choices.some((c) => c.requires_replacement?.seq === 9));
  assert.ok(content.dialogues.kittering.nodes.start.choices.some((c) => c.next === 'k3b_formeln'));
  const s = new GameState(content);
  assert.equal(Object.keys(s.claims).length, 0);
});

test('BG: gewonnener Hüterkampf gibt keine Kernzutat 3 mehr (Seb 2026-11-12: nur von der eigenen Gilde)', () => {
  const s = duo('eisen', 'laterne');
  s.applyEffects({ sets_flags: ['won_vorhauer'] });
  assert.equal(s.claimAfterWin('vorhauer', [1, 2]).length, 0);
  assert.equal(s.itemCount('sq_zutat_eisen_3'), 0);
  // Prüfungen werden im Kampf nur geöffnet, nicht ausgezahlt
  assert.equal(s.claimAfterWin('k3p_lampengutachter', [1]).length, 0);
});

test('BG: Heddas Belohnung erfüllt den eigenen Anspruch, der Partner holt seinen Anteil mit „Mein Anspruch“', () => {
  const s = duo();
  s.flags.add('k3p_laterne_bewaeltigt');
  s.startQuest('k3p_laterne_pruefung');
  s.applyEffects(hedda.nodes.k3p_laterne_belohnung, { nodeKey: 'k3p_hedda.k3p_laterne_belohnung' });
  assert.equal(s.itemCount('sq_zutat_laterne_4'), 1);
  assert.equal(s.claims.k3p_laterne_bewaeltigt[1], 'eingeloest');
  assert.equal(s.claims.k3p_laterne_bewaeltigt[2], 'offen');
  const mine = hedda.nodes[hedda.start].choices.find((c) => c.requires_claim === 'k3p_laterne_bewaeltigt');
  assert.equal(s.meets(mine), false, 'Spieler 1 hat nichts mehr offen');
  s.withPlayer(2, () => {
    assert.equal(s.meets(mine), true);
    s.applyEffects(hedda.nodes[mine.next]); // ohne Befehl keine Auszahlung
    assert.equal(s.itemCount('sq_zutat_laterne_4'), 0);
    s.applyEffects(hedda.nodes[mine.next], { commandId: cmd() });
    assert.equal(s.itemCount('sq_zutat_laterne_4'), 1);
    s.applyEffects(hedda.nodes[mine.next], { commandId: cmd() });
    assert.equal(s.itemCount('sq_zutat_laterne_4'), 1, 'nur einmal');
  }, { quiet: true });
  assert.equal(s.itemCount('sq_zutat_laterne_4'), 1, 'Spieler 1 unverändert');
  assert.deepEqual(s.openClaimTexts(2), []);
});

test('BG: Ansprüche überleben Speichern und Laden, alte Spielstände rechnen Spieler 1 ab', () => {
  const s = duo('sq_waage', 'sq_waage');
  s.applyEffects({ sets_flags: ['won_schwellenhund'] });
  s.claimAfterWin('schwellenhund', [1]);
  const data = JSON.parse(JSON.stringify(s.serialize(null)));
  const t = new GameState(content);
  t.load(data);
  assert.equal(t.claims.won_schwellenhund[1], 'eingeloest');
  assert.equal(t.claims.won_schwellenhund[2], 'offen');
  assert.equal(t.openClaimTexts(2).length, 1);
  delete data.claims; delete data.claimCommands; delete data.claimAcquisitions; delete data.claimSelections;
  data.flags.push('k3o_schwellenhund_geloest', 'k3o_schwellenhund_kern_abgeholt', 'k3p_laterne_bewaeltigt', 'k3p_laterne_done');
  const old = new GameState(content);
  old.load(data);
  assert.equal(old.claims.won_schwellenhund[1], 'eingeloest');
  assert.equal(old.claims.won_schwellenhund[2], 'offen');
  assert.equal(old.claims.k3p_laterne_bewaeltigt[1], 'eingeloest');
});

test('BG: Kauf quittiert den Erwerb, Pfiff ersetzt den verlorenen Trank aus dem gemeinsamen Beutel', () => {
  const s = new GameState(content);
  s.addP2();
  assert.ok(s.selectClaimPathway(1, 'laterne'));
  assert.equal(s.replacementFor(1, 9, { pathway: 'laterne' }), null, 'ohne Erwerb kein Ersatz');
  s.addItem('trank_laterne_9', 1);
  s.removeItem('trank_laterne_9', 1);
  assert.deepEqual(s.replacementFor(1, 9, { pathway: 'laterne' }), { item: 'trank_laterne_9', where: 'pfiff', cost: 30 });
  const pfiff = content.dialogues.k3a_pfiff;
  const choice = pfiff.nodes.k3a_start.choices.find((c) => c.requires_replacement?.seq === 9 && c.requires_replacement.pathway === 'laterne');
  assert.ok(s.meets(choice));
  assert.equal(s.withPlayer(2, () => s.meets(choice), { quiet: true }), false, 'der Partner hat keinen Erwerb');
  s.money = 100;
  s.applyEffects(pfiff.nodes[choice.next], { commandId: cmd() });
  assert.equal(s.money, 70);
  assert.equal(s.itemCount('trank_laterne_9'), 1);
  assert.equal(s.meets(choice), false, 'Trank ist wieder da');
});
