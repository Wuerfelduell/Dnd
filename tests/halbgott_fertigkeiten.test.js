// Seb 2026-11-26: Ab Seq 4 (Halbgott) sind die Kampffertigkeiten in der mythischen Gestalt waffenunabhängig und teilen
// richtig aus (halbgottFertigkeiten.js); in normaler Form gehen sie über die Waffe. Die Gestalt treibt die Unruhe hoch
// (Seq 4 1,5/s, Seq 3 0,7/s, ab Seq 2 nicht), diese Unruhe senkt kein Tee, und annehmen geht nur unter 15 % Unruhe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { HG_SKILL_SEQ } from '../src/data/halbgottFertigkeiten.js';
import { FORM_MAX_UNRUHE } from '../src/core/Pathways.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const en = JSON.parse(readFileSync(new URL('../src/i18n/en/faehigkeiten.json', import.meta.url), 'utf8'));
const skills = (pred) => Object.entries(content.pathways).flatMap(([pid, p]) => Object.entries(p.seqs).filter(([n]) => pred(+n))
  .flatMap(([n, s]) => ['skill', 'skill2'].map((k) => ({ pid, n: +n, k, sk: s[k] })).filter((x) => x.sk)));

test('Seq 4–1: jede Schadensfertigkeit hat eine waffenunabhängige Gestalt-Fassung, beide Texte auf Englisch', () => {
  for (const { pid, n, k, sk } of skills((n) => n <= HG_SKILL_SEQ)) {
    if (!sk.hits && !sk.burn) continue;
    assert.ok(sk.hg, `${pid} ${n} ${k} ohne Gestalt-Fassung`);
    if (sk.hits) assert.ok(sk.hg.flat > 0, `${pid} ${n} ${k} ohne Grundschaden`);
    assert.ok(!/Waffenschaden/.test(sk.hg.desc), `${pid} ${n} ${k}: Gestalt-Text nennt Waffenschaden`);
    assert.match(sk.desc, /In mythischer Gestalt/);
    assert.ok(en[sk.desc], `${pid} ${n} ${k}: EN fehlt für „${sk.desc}“`);
    assert.ok(en[sk.hg.desc], `${pid} ${n} ${k}: EN fehlt für „${sk.hg.desc}“`);
  }
});

const hero = (pid, weapon, seq = 4, form = false) => {
  const s = new GameState(content);
  if (weapon) { s.addItem(weapon); s.weapon = weapon; }
  s.pathway = { id: pid, seq, digestion: 0, ...(form ? { form: true } : {}) };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  return s;
};
const dmg = (pid, weapon, id, seq = 4, form = false) => {
  const c = new Combat(hero(pid, weapon, seq, form), 'rook_fight');
  c.ap = 10;
  return c.useSkill(id, ['good', 'good', 'good', 'good']).hits.reduce((a, h) => a + h.damage, 0);
};
const FORM_MULT = 1.3; // FORM_KAMPF dmg_mult

test('Gestalt: Fäuste und beste Waffe gleich, weit über der normalen Form; normal zählt die Waffe', () => {
  const best = Object.entries(content.items).filter(([, it]) => it.kind === 'weapon').sort((a, b) => b[1].atk - a[1].atk)[0][0];
  for (const pid of Object.keys(content.pathways)) {
    const sk = content.pathways[pid].seqs[4].skill;
    const fist = dmg(pid, null, sk.id, 4, true);
    assert.equal(fist, dmg(pid, best, sk.id, 4, true), `${pid}: in der Gestalt hängt der Schaden an der Waffe`);
    assert.ok(fist > 2 * FORM_MULT * dmg(pid, 'revolver', sk.id), `${pid}: Gestalt nicht deutlich stärker`);
    if (sk.mult) assert.ok(dmg(pid, best, sk.id) > dmg(pid, null, sk.id), `${pid}: normale Form ohne Waffenschaden`);
  }
});

test('Gestalt-Unruhe: Seq 4 1,5/s, Seq 3 0,7/s, ab Seq 2 keine; kein Tee senkt sie; annehmen nur unter 15 %', () => {
  for (const [seq, rate] of [[4, 1.5], [3, 0.7], [2, 0]]) {
    const s = hero('eisen', 'revolver', seq);
    s.pathway.digestion = 100;
    s.unruhe = 0;
    assert.ok(s.toggleForm().active, `Seq ${seq}: annehmen`);
    const start = s.unruhe;
    s.tick(10);
    assert.ok(Math.abs(s.unruhe - start - rate * 10) < 0.01, `Seq ${seq}: ${s.unruhe - start} statt ${rate * 10}`);
  }
  const s = hero('eisen', 'revolver', 4);
  s.pathway.digestion = 100;
  s.unruhe = 0;
  s.toggleForm();
  s.tick(10); // 5 beim Annehmen + 15
  const u = s.unruhe;
  s.addItem('ruhetee');
  s.useItem('ruhetee');
  assert.ok(s.unruhe >= u - 0.01, 'Ruhetee senkt die Gestalt-Unruhe nicht');
  s.toggleForm();
  assert.equal(s.formActive(), false);
  assert.match(s.formBlock(), /Unruhe/);
  assert.equal(s.toggleForm().ok, false, `erst wieder unter ${FORM_MAX_UNRUHE} %`);
  s.tick(40); // natürliches Abklingen nimmt sie mit
  assert.ok(s.unruhe < u - 5);
});
