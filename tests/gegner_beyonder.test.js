// Gegner-Beyonder (Seb 2026-11-26): Kopfgeld-Ziele nutzen die Kampffertigkeiten ihres Pfades und tragen selten ihre Formel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { isBeyonderFoe } from '../src/core/Seq5.js';
import { KOPFGELD_BEYONDER, FORMEL_CHANCE, FORMEL_CHANCE_SEQ4, gegnerFaehigkeit, beyonderSatz } from '../src/data/gegnerBeyonder.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('alle zehn Pfade kommen unter den Kopfgeld-Beyondern vor, jedes Ziel existiert', () => {
  const pfade = new Set(Object.values(KOPFGELD_BEYONDER).map(([p]) => p));
  assert.equal(pfade.size, 10);
  for (const p of pfade) assert.ok(content.pathways[p], p);
  for (const id of Object.keys(KOPFGELD_BEYONDER)) assert.ok(content.encounters[id], id);
});

test('jedes Ziel ist Beyonder mit Pfad-Fertigkeiten, Satz im Intro und Formel in der Beute', () => {
  for (const [id, [pid, seq]] of Object.entries(KOPFGELD_BEYONDER)) {
    const enc = content.encounters[id];
    assert.ok(isBeyonderFoe(id, enc), id);
    assert.equal(enc.tier_seq, seq);
    const sd = content.pathways[pid].seqs[seq];
    const namen = enc.attacks.filter((a) => a.pfad).map((a) => a.name);
    const erwartet = [sd.skill, sd.skill2].filter(Boolean).map((s) => s.name);
    assert.ok(namen.length >= 1 && namen.every((n) => erwartet.includes(n)), id);
    assert.ok(enc.attacks.some((a) => !a.action), `${id} hat noch normale Angriffe`);
    assert.ok(enc.intro.includes(beyonderSatz(content, pid, seq)), id);
    const f = content.loot[id].drops.find((d) => d.item === `formel_${pid}_${seq}`);
    assert.equal(f?.chance, seq <= 4 ? FORMEL_CHANCE_SEQ4 : FORMEL_CHANCE, id);
  }
});

test('Umwandlung: Schaden, Kniffe und Flächenwirkung', () => {
  assert.deepEqual(gegnerFaehigkeit({ name: 'A', hits: 2, flat: 9, sure: true, burn: [5, 3] }, { base: 20 }),
    { name: 'A', damage: 16, hits: [1100, 1800], pfad: true, unparryable: true, bleed: [6, 3] });
  assert.equal(gegnerFaehigkeit({ name: 'B', hits: 0, heal: 14 }, { hp: 300 }).value, 30);
  assert.equal(gegnerFaehigkeit({ name: 'C', hits: 0, shield: 16 }, { base: 10 }).action, 'guard');
  assert.equal(gegnerFaehigkeit({ name: 'D', hits: 0, evade: true }).action, 'veil');
  assert.ok(gegnerFaehigkeit({ name: 'E', hits: 0, stun: true }, { seq: 6 }).nerves > 0);
  assert.equal(gegnerFaehigkeit({ name: 'F', hits: 1, flat: 9, drain: 0.5 }).action, 'drain');
  assert.equal(gegnerFaehigkeit({ name: 'G', hits: 3, flat: 9, aoe: true }).sweep, true);
});

test('jeder Kopfgeld-Beyonder kann seine ganze Rotation im Kampf ausführen', () => {
  for (const id of Object.keys(KOPFGELD_BEYONDER)) {
    const s = new GameState(content);
    s.pathway = { id: 'eisen', seq: 5, digestion: 10 };
    const c = new Combat(s, id);
    for (let i = 0; i < c.enc.attacks.length; i++) {
      c.struck = [];
      const atk = c.nextEnemyAttack();
      if (atk) assert.ok(atk.damage > 0 && atk.hits.length > 0, id);
    }
  }
});
