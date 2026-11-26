// Seb 2026-11-26: Schutz-Fertigkeiten waren ab Dunscar zu schwach (feste 10–40 gegen Schläge von 50–150).
// Jetzt wächst der Schutz ab SHIELD_HP_REF Leben mit dem Höchstleben des Wirkenden, gestapelt höchstens SHIELD_CAP_PCT davon.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, SHIELD_HP_REF, SHIELD_CAP_PCT } from '../src/core/Combat.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const hero = (pid, seq) => {
  const s = new GameState(content);
  s.pathway = { id: pid, seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  return s;
};
const shieldOf = (pid, seq, id) => {
  const c = new Combat(hero(pid, seq), 'rook_fight');
  c.ap = 10;
  c.useSkill(id, []);
  return c.shield;
};

test('Schutz wächst mit der Sequenz: Seq 8 unverändert, Seq 5 deutlich, Seq 1 vielfach', () => {
  const s8 = shieldOf('eisen', 8, content.pathways.eisen.seqs[8].skill.id);
  assert.equal(s8, content.pathways.eisen.seqs[8].skill.shield);
  const base = content.pathways.eisen.seqs[8].skill.shield;
  const s5 = shieldOf('eisen', 5, content.pathways.eisen.seqs[8].skill.id);
  const s1 = shieldOf('eisen', 1, content.pathways.eisen.seqs[8].skill.id);
  assert.ok(s5 >= base * 1.5, `Seq 5: ${s5}`);
  assert.ok(s1 >= base * 4.5, `Seq 1: ${s1}`);
});

test('Gestapelter Schutz bleibt unter dem Deckel', () => {
  const s = hero('eisen', 5);
  const c = new Combat(s, 'rook_fight');
  for (let i = 0; i < 6; i++) { c.ap = 10; c.useSkill('unbeugsam', []); }
  assert.ok(c.shield <= Math.round(s.maxHp * SHIELD_CAP_PCT));
  assert.ok(SHIELD_HP_REF > 0);
});
