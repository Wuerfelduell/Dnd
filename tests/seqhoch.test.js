// Sequenz 3 bis 1 (Seb 2026-11-12): Orte der 3, Rituale aus Schritten, Weltwandel, Proben, Zeit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { HOCH, ORTE, ortMap, ortFlag, SPUREN } from '../src/data/seqHoch.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const hero = (seq, pid) => {
  const s = new GameState(content);
  s.addItem('revolver');
  s.weapon = 'revolver';
  s.pathway = { id: pid, seq, digestion: 100 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  return s;
};
const wild = Object.keys(content.encounters).find((id) => content.encounters[id].zone === 'ds_unterschicht' && !content.encounters[id].boss && !content.encounters[id].elite);
const end = (s, id, outcome, round = 3) => {
  const c = new Combat(s, id);
  c.outcome = outcome;
  c.round = round;
  if (outcome === 'won') c.enemy.hp = 0;
  return c.finish({ noLoot: true });
};

test('Alle zehn Pfade: Rituale 3/2/1 mit eigenen Schritten, 2 mit Weltwandel und Grenzwächter, 1 ohne Gegner, je ein Ort', () => {
  for (const pid of Object.keys(content.pathways)) {
    for (const n of [3, 2, 1]) assert.ok(content.pathways[pid].seqs[n].ritual.hoch, `${pid} ${n}`);
    assert.ok(HOCH[pid][2].welt && HOCH[pid][2].steps.at(-1).type === 'waechter', pid);
    assert.ok(!HOCH[pid][1].steps.some((x) => ['kampf', 'waechter'].includes(x.type)), `${pid} 1 ohne Gegner`);
    const m = content.maps[ortMap(pid)];
    assert.ok(m && ORTE[pid], pid);
    for (const r of m.roamers) assert.notEqual(m.rows[r.tile[1]][r.tile[0]], 'I', `${pid}: ${r.id} in der Wand`);
    for (const it of m.interactables) assert.notEqual(m.rows[it.tile[1]][it.tile[0]], 'I', `${pid}: ${it.id} in der Wand`);
    for (const n of [3, 2, 1]) assert.ok(m.interactables.some((i) => i.effects?.gives_items?.[`formel_${pid}_${n}`]), `${pid}: Formel ${n}`);
    for (const city of ['dunscar', 'calderwick', 'briarholt']) assert.ok(content.travel.some((t) => t.map === m.id && t.city === city && t.requires_flags.includes(ortFlag(pid))));
  }
  assert.ok(!content.market.merchants.kittering.stock.some((e) => /^formel_\w+_[123]$/.test(e.item)), 'Kittering ohne Formeln 3 bis 1');
});

test('Spuren: ab Sequenz 4 führen Siege in späten Monstergebieten zum Ort', () => {
  const s = hero(4, 'eisen');
  s.rng = () => 0;
  for (let i = 0; i < SPUREN; i++) end(s, wild, 'won');
  assert.ok(s.flags.has(ortFlag('eisen')));
  assert.equal(s.spurStand('eisen').found, true);
});

test('Seq 3 Echo: Kette von Siegen in höchstens fünf Runden, eine Flucht lässt scheitern (−17 %)', () => {
  const s = hero(4, 'echo');
  assert.equal(s.startHoch().ok, true);
  const c = new Combat(s, wild);
  assert.equal(c.rules.solo, true);
  assert.equal(c.rules.maxRounds, 5);
  c.round = 5;
  c.endRound();
  assert.ok(c.ruleBroken, 'nach Runde 5 gebrochen');
  s.combatRules = null;
  s.hochState().active = true;
  s.hochState().step = 0;
  end(s, wild, 'won');
  assert.equal(s.hochState().n, 1);
  end(s, wild, 'fled');
  assert.equal(s.hochRunning(), false);
  assert.equal(s.pathway.digestion, 83);
});

test('Seq 3 Eisen: Kampf beginnt mit 25 % Leben; sechs Siege bestehen die Prüfung', () => {
  const s = hero(4, 'eisen');
  s.startHoch();
  const c = new Combat(s, wild);
  assert.ok(s.hp <= Math.round(s.maxHp * 0.25));
  s.combatRules = null;
  for (let i = 0; i < 6; i++) end(s, wild, 'won');
  assert.ok(s.hochPassed('eisen', 3));
  s.addItem('trank_eisen_3');
  for (const [id, n] of Object.entries(s.ritualDef('eisen', 3).consumes ?? {})) s.addItem(id, n);
  s.money = 99999; s.wins = 999;
  assert.equal(s.performRitual().ok, true);
  void c;
});

test('Seq 2: Weltwandel bleibt und macht alle Gegner stärker, dann Probe und brutaler Grenzwächter', () => {
  const s = hero(3, 'faden');
  const before = new Combat(s, wild).enemy.maxHp;
  s.combatRules = null;
  s.startHoch();
  assert.equal(s.hochWelt().ok, true);
  assert.ok(s.flags.has('weltwandel_faden'));
  const after = new Combat(s, wild).enemy.maxHp;
  s.combatRules = null;
  assert.ok(after > before * 1.2, `${before} → ${after}`);
  assert.ok(s.weltTint());
  for (let i = 0; i < 5; i++) { assert.ok(s.pendingProbe().hoch); s.probe = { ...s.pendingProbe(), step: 0, rounds: [] }; s.finishProbe(true, ''); }
  assert.equal(s.hochStep().type, 'waechter');
  const g = s.hochGuardian();
  assert.ok(g.fight);
  const c = new Combat(s, g.fight);
  assert.ok(c.enemy.maxHp > 10000, `Grenzwächter ${c.enemy.maxHp}`);
  assert.equal(c.rules.noDodge, true);
  c.outcome = 'won'; c.enemy.hp = 0; c.finish({ noLoot: true });
  assert.ok(s.hochPassed('faden', 2));
});

test('Seq 1: ohne Gegner; ein Kampf bricht die Zeitprüfung, Zeit zählt nur unter den Bedingungen', () => {
  const s = hero(2, 'laterne');
  s.startHoch();
  s.map = ortMap('laterne');
  s.tick(10);
  assert.equal(s.hochState().t ?? 0, 0, 'ohne Geistsicht steht die Zeit');
  s.spiritVision = true;
  s.hochTick(10);
  assert.equal(s.hochState().t, 10);
  end(s, wild, 'won');
  assert.equal(s.hochRunning(), false, 'Kampf = gescheitert');
  const w = hero(2, 'sq_waage');
  w.startHoch();
  w.money = 100000;
  assert.equal(w.hochOpfer().ok, true);
  assert.ok(w.hochPassed('sq_waage', 1));
});

test('Spieler 2: Prüfungsstand bleibt beim Speichern erhalten', () => {
  const s = hero(4, 'maske');
  s.startHoch();
  s.hochState().n = 2;
  const t = new GameState(content);
  t.load(JSON.parse(JSON.stringify(s.serialize())));
  assert.equal(t.pathway.hoch.n, 2);
});
