// Sequenz 3 bis 1 (Seb 2026-11-12): Orte der 3, Rituale aus Schritten, Weltwandel, Proben, Zeit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { HOCH, HOCH_WAECHTER, ORTE, ortMap, gildeFlag, kernzutat } from '../src/data/seqHoch.js';
import { NACHBARPFADE } from '../src/data/nachbarpfade.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const hero = (seq, pid) => {
  const s = new GameState(content);
  if (seq === 4) { s.addItem(`ritualformel_${pid}_3`); s.flags.add(gildeFlag(pid, 'mitglied')); } // Seq 3: Ritualformel + Gilde
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

test('Alle zehn Pfade: Rituale 3/2/1 werden je Stufe größer, enden mit Wächtern, je ein Ort', () => {
  for (const pid of Object.keys(content.pathways)) {
    for (const n of [3, 2, 1]) assert.ok(content.pathways[pid].seqs[n].ritual.hoch, `${pid} ${n}`);
    // Seb 2026-11-26: immer nach oben. Mehr Schritte, längere Ketten, Wächter am Ende (1: Grenz- und Engelswächter am Stück)
    const [s3, s2, s1] = [3, 2, 1].map((n) => HOCH[pid][n].steps);
    assert.ok(s3.length < s2.length && s2.length <= s1.length, `${pid}: Schrittzahl steigt`);
    assert.equal(s3.at(-1).w, 'heilig', pid);
    assert.ok(HOCH[pid][2].welt && s2.at(-1).w === 'grenz', pid);
    assert.deepEqual(s1.slice(-2).map((x) => x.w), ['grenz', 'engel'], pid);
    assert.ok(s1.slice(-2).every((x) => x.noHealAll), `${pid}: keine Heilung zwischen den Wächtern`);
    const kette = (st) => st.find((x) => x.type === 'kampf');
    assert.ok(kette(s3).n <= kette(s2).n && kette(s2).n < kette(s1).n, `${pid}: Ketten wachsen`);
    assert.ok((kette(s3).rules.gruppe ?? 0) <= (kette(s2).rules.gruppe ?? 0), `${pid}: Gruppen wachsen`);
    for (const w of Object.values(HOCH_WAECHTER)) {
      const e = content.encounters[w.id(pid)];
      assert.ok(e?.beyonder && e.beyonder_pfad === pid && e.boss, `${pid}: ${w.titel} kämpft mit dem eigenen Pfad`);
    }
    const m = content.maps[ortMap(pid)];
    assert.ok(m && ORTE[pid], pid);
    for (const r of m.roamers) assert.notEqual(m.rows[r.tile[1]][r.tile[0]], 'I', `${pid}: ${r.id} in der Wand`);
    for (const it of m.interactables) assert.notEqual(m.rows[it.tile[1]][it.tile[0]], 'I', `${pid}: ${it.id} in der Wand`);
    for (const n of [2, 1]) assert.ok(m.interactables.some((i) => i.effects?.gives_items?.[`formel_${pid}_${n}`]), `${pid}: Formel ${n}`);
    assert.ok(!m.interactables.some((i) => i.effects?.gives_items?.[`formel_${pid}_3`]), `${pid}: Formel 3 nicht am Sitz`);
    const kern = m.interactables.filter((i) => i.effects?.gives_items?.[kernzutat(pid, 3)]);
    assert.equal(kern.length, 2, `${pid}: töten oder Oberhaupt werden`);
    const join = m.interactables.filter((i) => i.effects?.sets_flags?.includes(gildeFlag(pid, 'mitglied')));
    assert.deepEqual(join.map((i) => i.visible_if.requires_pathway), [[pid, 9], [NACHBARPFADE[pid], 4]], `${pid}: Beitritt eigener Pfad oder Nachbar ab 4`);
    assert.ok(m.interactables.some((i) => /nirgends sonst/.test(i.text ?? '')), `${pid}: ein Mitglied erklärt den Kern`);
    assert.ok(content.items[`ritualformel_${pid}_3`], `${pid}: Ritualformel`);
    assert.equal(m.city, 'calderwick');
    assert.deepEqual(content.travel.filter((t) => t.map === m.id).map((t) => t.city), ['calderwick']);
  }
  assert.ok(!content.market.merchants.kittering.stock.some((e) => /^formel_\w+_[123]$/.test(e.item)), 'Kittering ohne Formeln 3 bis 1');
});

test('Gilden: ab Calderwick meldet sich die eigene Gilde, ab Seq 4 auch die des Nachbarpfads; Seq 3 verlangt nur die Ritualformel', () => {
  const s = hero(5, 'eisen');
  s.tick(1);
  s.flags.add('k3_arrived');
  s.tick(1);
  assert.ok(!s.flags.has(gildeFlag('eisen', 'bekannt')), 'in Dunscar noch nicht');
  s.flags.add('k4_arrived');
  s.tick(1);
  assert.ok(s.flags.has(gildeFlag('eisen', 'bekannt')));
  assert.ok(!s.flags.has(gildeFlag(NACHBARPFADE.eisen, 'bekannt')));
  s.pathway.seq = 4;
  s.tick(1);
  assert.ok(s.flags.has(gildeFlag(NACHBARPFADE.eisen, 'bekannt')));
  assert.equal(s.startHoch().ok, false, 'ohne Ritualformel');
  s.addItem('ritualformel_eisen_3');
  assert.equal(s.startHoch().ok, true, 'Seb 2026-11-26: auch in Dunscar, ohne Gildenbeitritt');
  assert.ok(!content.dialogues.k3o_vorhauer_beute.nodes.k3o_start.choices.some((c) => /Kern/.test(c.text) && c.next), 'kein Kern 3 mehr aus dem Kernfach');
});

test('Seq 3 Echo: Kette gegen Zweiergruppen in höchstens fünf Runden, eine Flucht lässt scheitern (−17 %)', () => {
  const s = hero(4, 'echo');
  assert.equal(s.startHoch().ok, true);
  const c = new Combat(s, wild);
  assert.equal(c.rules.solo, true);
  assert.equal(c.rules.maxRounds, 5);
  assert.equal(c.foes.length, 2, 'Zweiergruppe');
  assert.equal(c.foes[1].enc.hp, c.foes[0].enc.hp, 'Begleiter mit Ritualwerten');
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

test('Seq 3 Eisen: Kette, Artefaktopfer, Heiligenwächter; danach Ritual vollziehbar', () => {
  const s = hero(4, 'eisen');
  s.startHoch();
  const c = new Combat(s, wild);
  assert.ok(s.hp <= Math.round(s.maxHp * 0.25));
  s.combatRules = null;
  for (let i = 0; i < 6; i++) end(s, wild, 'won');
  assert.equal(s.hochStep().type, 'opfer');
  const arts = Object.keys(content.items).filter((id) => content.items[id].kind === 'artifact').slice(0, 2);
  for (const a of arts) { s.addItem(a); assert.equal(s.hochOpfer(a).ok, true); }
  assert.equal(s.hochStep().w, 'heilig');
  const g = s.hochGuardian();
  assert.equal(g.fight, 'hg_heiligenwaechter_eisen');
  const w = new Combat(s, g.fight);
  assert.equal(w.rules.minKillRound, 10);
  assert.ok(w.enemy.maxHp > 8000, `Heiligenwächter ${w.enemy.maxHp}`);
  w.outcome = 'won'; w.round = 12; w.enemy.hp = 0; w.finish({ noLoot: true });
  assert.ok(s.hochPassed('eisen', 3));
  s.addItem('trank_eisen_3');
  for (const [id, n] of Object.entries(s.ritualDef('eisen', 3).consumes ?? {})) s.addItem(id, n);
  s.money = 99999; s.wins = 999;
  assert.equal(s.performRitual().ok, true);
  void c;
});

test('Seq 2: Weltwandel bleibt, Kette gegen Dreiergruppen, Probe und brutaler Grenzwächter', () => {
  const s = hero(3, 'faden');
  const before = new Combat(s, wild).enemy.maxHp;
  s.combatRules = null;
  s.startHoch();
  assert.equal(s.hochWelt().ok, true);
  assert.ok(s.flags.has('weltwandel_faden'));
  const k = new Combat(s, wild);
  assert.ok(k.enemy.maxHp > before * 1.2, `${before} → ${k.enemy.maxHp}`);
  assert.equal(k.foes.length, 3, 'Dreiergruppe');
  s.combatRules = null;
  assert.ok(s.weltTint());
  for (let i = 0; i < 6; i++) end(s, wild, 'won');
  for (let i = 0; i < 10; i++) { assert.ok(s.pendingProbe().hoch); s.probe = { ...s.pendingProbe(), step: 0, rounds: [] }; s.finishProbe(true, ''); }
  assert.equal(s.hochStep().type, 'waechter');
  const g = s.hochGuardian();
  assert.equal(g.fight, 'hg_grenzwaechter_faden');
  const c = new Combat(s, g.fight);
  assert.ok(c.enemy.maxHp > 15000, `Grenzwächter ${c.enemy.maxHp}`);
  assert.equal(c.rules.noDodge, true);
  c.outcome = 'won'; c.enemy.hp = 0; c.finish({ noLoot: true });
  assert.ok(s.hochPassed('faden', 2));
});

test('Seq 1: freigegeben; Zeit ohne Kampf, dann Grenz- und Engelswächter am Stück ohne Heilung', () => {
  const s = hero(2, 'laterne');
  assert.equal(s.startHoch().ok, true);
  s.map = ortMap('laterne');
  s.tick(10);
  assert.equal(s.hochState().t ?? 0, 0, 'ohne Geistsicht steht die Zeit');
  s.spiritVision = true;
  s.hochTick(10);
  assert.equal(s.hochState().t, 10);
  end(s, wild, 'won');
  assert.equal(s.hochRunning(), false, 'Kampf = gescheitert');
  // direkt zu den Wächtern
  const steps = HOCH.laterne[1].steps;
  Object.assign(s.hochState(), { active: true, step: steps.length - 2, n: 0, t: 0 });
  assert.ok(s.hochHealBlocked(), 'keine Heilung zwischen den Wächtern');
  let g = s.hochGuardian();
  assert.equal(g.fight, 'hg_grenzwaechter_laterne');
  let c = new Combat(s, g.fight);
  c.outcome = 'won'; c.enemy.hp = 0; c.finish({ noLoot: true });
  assert.equal(s.hochStep().w, 'engel');
  g = s.hochGuardian();
  assert.equal(g.fight, 'hg_engelswaechter_laterne');
  c = new Combat(s, g.fight);
  assert.ok(c.enemy.maxHp > 30000, `Engelswächter ${c.enemy.maxHp}`);
  assert.equal(c.rules.noParry, true);
  c.outcome = 'won'; c.enemy.hp = 0; c.finish({ noLoot: true });
  assert.ok(s.hochPassed('laterne', 1));
});

test('Spieler 2: Prüfungsstand bleibt beim Speichern erhalten', () => {
  const s = hero(4, 'maske');
  s.startHoch();
  s.hochState().n = 2;
  const t = new GameState(content);
  t.load(JSON.parse(JSON.stringify(s.serialize())));
  assert.equal(t.pathway.hoch.n, 2);
});
