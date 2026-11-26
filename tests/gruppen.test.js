// Gegnergruppen (1–3 Gegner) und Flächenfertigkeiten (Seb 2026-11-26).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, GROUP_HP_SHARE, AOE_DMG_MULT, MAX_FOES, GROUP_LOOT_BONUS } from '../src/core/Combat.js';
import { AOE_SKILLS } from '../src/data/flaechenFaehigkeiten.js';
import { loadContent, seeded } from './helpers.js';

const content = loadContent();

function beyonder(pid, seq, s = new GameState(content)) {
  s.pathway = { id: pid, seq, digestion: 0 };
  s.updateMaxHp();
  s.composure = s.maxComposure();
  return s;
}

test('Alle Flächenfertigkeiten gibt es, und sie sind als aoe markiert', () => {
  const found = new Set();
  for (const p of Object.values(content.pathways)) {
    for (const sd of Object.values(p.seqs)) for (const sk of [sd.skill, sd.skill2]) if (sk?.aoe) found.add(sk.id);
  }
  assert.deepEqual([...found].sort(), Object.keys(AOE_SKILLS).sort());
  // jeder Pfad hat mindestens eine Flächenfertigkeit
  for (const [pid, p] of Object.entries(content.pathways)) {
    assert.ok(Object.values(p.seqs).some((sd) => sd.skill?.aoe || sd.skill2?.aoe), `${pid}: keine Flächenfertigkeit`);
  }
});

test('Gruppe: Begleiter mit geteiltem Leben, höchstens drei Gegner, Sieg erst beim letzten', () => {
  const s = beyonder('eisen', 7);
  const solo = new Combat(s, 'moorleiche');
  const c = new Combat(s, 'moorleiche', { pack: ['irrlicht', 'schlammegel', 'irrlicht'] });
  assert.equal(c.foes.length, MAX_FOES);
  assert.ok(c.group);
  assert.equal(c.enemy.maxHp, solo.enemy.maxHp);
  const ref = new Combat(s, 'irrlicht');
  assert.equal(c.foes[1].enemy.maxHp, Math.round(ref.enemy.maxHp * GROUP_HP_SHARE));
  // Einzelziel trifft nur das Ziel
  c.setAim(1);
  c.ap = 6;
  c.useSkill('attack', ['good']);
  assert.ok(c.foes[1].enemy.hp < c.foes[1].enemy.maxHp);
  assert.equal(c.foes[0].enemy.hp, c.foes[0].enemy.maxHp);
  assert.equal(c.foes[2].enemy.hp, c.foes[2].enemy.maxHp);
  // zwei fallen: noch kein Sieg, das Ziel springt weiter
  c.foes[1].enemy.hp = 0;
  c.foes[2].enemy.hp = 0;
  assert.equal(c.aim, 0);
  assert.equal(c.outcome, null);
  c.focusAim();
  c.hurtEnemy(c.enemy.hp);
  assert.equal(c.outcome, 'won');
});

test('Flächenfertigkeit trifft alle stehenden Gegner, je mit AOE_DMG_MULT', () => {
  const s = beyonder('eisen', 7);
  const single = new Combat(s, 'moorleiche');
  single.ap = 6;
  const plain = single.useSkill('klingenwirbel', ['good', 'good', 'good']);
  const c = new Combat(s, 'moorleiche', { pack: ['moorleiche', 'moorleiche'] });
  c.ap = 6;
  const r = c.useSkill('klingenwirbel', ['good', 'good', 'good']);
  assert.ok(r.aoe);
  assert.equal(r.per.length, 3);
  for (const f of c.foes) assert.ok(f.enemy.hp < f.enemy.maxHp);
  // gleicher Schaden je Gegner wie allein, nur gedämpft (Treffer für Treffer gerundet)
  assert.ok(Math.abs(r.per[0].total - plain.total) <= 3, `${r.per[0].total} vs ${plain.total}`);
  assert.ok(plain.total > 0 && AOE_DMG_MULT < 1);
});

test('Gegnerzug: jeder Begleiter greift einmal an, der Anführer zu zweit jeden Spieler', () => {
  const s = beyonder('eisen', 7);
  const c = new Combat(s, 'moorleiche', { pack: ['irrlicht', 'irrlicht'] });
  c.rng = seeded(3);
  const attackers = [];
  let guard = 0;
  do { const a = c.nextEnemyAttack(); attackers.push(c.fi); if (a) c.endEnemyTurn(); } while (c.moreStrikes() && ++guard < 10);
  assert.deepEqual(attackers, [0, 1, 2]);
  c.endRound();
  // Duo
  const d = beyonder('eisen', 7);
  d.addP2();
  const cd = new Combat(d, 'moorleiche', { pack: ['irrlicht'] });
  cd.rng = seeded(4);
  const seen = [];
  guard = 0;
  do { cd.nextEnemyAttack(); seen.push(cd.fi); } while (cd.moreStrikes() && ++guard < 10);
  assert.equal(seen.filter((i) => i === 0).length + seen.filter((i) => i === 1).length, seen.length);
  assert.equal(seen.filter((i) => i === 1).length, 1);
  assert.ok(seen.filter((i) => i === 0).length >= 1 && seen.length <= 3);
});

test('Brand wirkt auf jeden Gegner, Beute und Verdauung zählen jeden Gegner', () => {
  const s = beyonder('laterne', 8);
  const c = new Combat(s, 'moorleiche', { pack: ['moorleiche', 'moorleiche'] });
  c.ap = 6;
  c.useSkill('funkenregen', ['good', 'good', 'good']);
  assert.ok(c.foes.every((f) => f.burn));
  const dot = c.endRound();
  assert.equal(c.dots.length, 3);
  assert.equal(dot, c.dots.reduce((a, d) => a + d.dmg, 0));
  const acts = [];
  const orig = s.act.bind(s);
  s.act = (kind, mult) => { acts.push([kind, mult]); return orig(kind, mult); };
  for (const f of c.foes) f.enemy.hp = 0;
  c.outcome = 'won';
  const res = c.finish({ deferLoot: true });
  assert.equal(res.outcome, 'won');
  assert.equal(acts.filter(([k]) => k === 'combat_win').length, 3);
  assert.equal(c.fi, 0);
});

test('Prüfungen und Übungen bleiben Einzelkämpfe', () => {
  const s = beyonder('eisen', 7);
  const practice = Object.keys(content.encounters).find((k) => content.encounters[k].practice);
  const c = new Combat(s, practice, { pack: ['moorleiche'] });
  assert.equal(c.foes.length, 1);
});

test('Gruppenbeute: jeder Begleiter bringt eigene Beute, dazu Gruppenbonus auf Geld', () => {
  const geld = (pack) => {
    let sum = 0;
    for (let k = 0; k < 40; k++) {
      const s = beyonder('eisen', 7);
      s.flags.add('won_moorleiche');
      const c = new Combat(s, 'moorleiche', { pack });
      c.rng = seeded(k + 1);
      c.outcome = 'won';
      const before = s.money;
      c.finish();
      sum += s.money - before;
    }
    return sum;
  };
  const solo = geld([]);
  assert.ok(solo > 0);
  const trio = geld(['moorleiche', 'moorleiche']);
  // zwei Begleiter: dreimal Beute, jede ×(1 + 2·GROUP_LOOT_BONUS)
  assert.ok(trio > solo * 3 * (1 + GROUP_LOOT_BONUS) , `${trio} vs ${solo}`);
});
