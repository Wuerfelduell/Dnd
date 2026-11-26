// Seb 2026-11-26: Ab Seq 4 (Halbgott) sind alle Kampffertigkeiten waffenunabhängig und teilen richtig aus (halbgottFertigkeiten.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { HG_SKILL_SEQ } from '../src/data/halbgottFertigkeiten.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const en = JSON.parse(readFileSync(new URL('../src/i18n/en/faehigkeiten.json', import.meta.url), 'utf8'));
const skills = (pred) => Object.entries(content.pathways).flatMap(([pid, p]) => Object.entries(p.seqs).filter(([n]) => pred(+n))
  .flatMap(([n, s]) => ['skill', 'skill2'].map((k) => ({ pid, n: +n, k, sk: s[k] })).filter((x) => x.sk)));

test('Seq 4–1: keine Fertigkeit hängt an der Waffe, alle mit Grundschaden und englischem Text', () => {
  for (const { pid, n, k, sk } of skills((n) => n <= HG_SKILL_SEQ)) {
    assert.equal(sk.mult, undefined, `${pid} ${n} ${k} rechnet noch mit Waffe`);
    if (sk.hits) assert.ok(sk.flat > 0, `${pid} ${n} ${k} ohne Grundschaden`);
    assert.ok(!/Waffenschaden/.test(sk.desc), `${pid} ${n} ${k}: Text nennt noch Waffenschaden`);
    assert.ok(en[sk.desc], `${pid} ${n} ${k}: EN fehlt für „${sk.desc}“`);
  }
});

const hero = (pid, weapon, seq = 4) => {
  const s = new GameState(content);
  if (weapon) { s.addItem(weapon); s.weapon = weapon; }
  s.pathway = { id: pid, seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  s.ap = 10;
  return s;
};
const dmg = (pid, weapon, id, seq = 4) => {
  const c = new Combat(hero(pid, weapon, seq), 'rook_fight');
  c.ap = 10;
  return c.useSkill(id, ['good', 'good', 'good', 'good']).hits.reduce((a, h) => a + h.damage, 0);
};

test('Seq 4: Fäuste und beste Waffe machen mit Pfadfertigkeiten gleich viel Schaden (beide Spieler gleiche Regel)', () => {
  const best = Object.entries(content.items).filter(([, it]) => it.kind === 'weapon').sort((a, b) => b[1].atk - a[1].atk)[0][0];
  for (const pid of Object.keys(content.pathways)) {
    const id = content.pathways[pid].seqs[4].skill.id;
    assert.equal(dmg(pid, null, id), dmg(pid, best, id), `${pid}: Seq-4-Fertigkeit hängt an der Waffe`);
  }
});

test('Seq 4: die große Fertigkeit trifft weit härter als die Seq-5-Fertigkeit mit Revolver', () => {
  for (const pid of Object.keys(content.pathways)) {
    const s4 = dmg(pid, 'revolver', content.pathways[pid].seqs[4].skill.id);
    const s5 = dmg(pid, 'revolver', content.pathways[pid].seqs[5].skill.id, 5);
    assert.ok(s4 >= 2 * s5, `${pid}: Seq 4 ${s4} vs Seq 5 ${s5}`);
  }
});
