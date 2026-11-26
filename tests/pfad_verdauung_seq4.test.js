// Seb 2026-11-26: Ab Seq 4 hat jeder Pfad eigene feste Verdauungs-Handlungen im Kampf (wie das Moor), je Kampf gedeckelt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, PATH_ACTION_DIGEST } from '../src/core/Combat.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const hero = (id, seq) => {
  const s = new GameState(content);
  s.pathway = { id, seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  return s;
};

test('alle 10 Pfade haben feste Handlungen, ab Seq 4 in der Verdauungsliste', () => {
  assert.equal(Object.keys(PATH_ACTION_DIGEST).length, 10);
  for (const [id, d] of Object.entries(PATH_ACTION_DIGEST)) {
    const kinds = Object.keys(d.acts);
    const t4 = hero(id, 4).digestTable().map((r) => r.kind);
    for (const k of kinds) assert.ok(t4.includes(k), `${id}: ${k} fehlt auf Seq 4`);
    if (id !== 'sq_moor') assert.ok(!hero(id, 5).digestTable().some((r) => kinds.includes(r.kind)), `${id}: schon auf Seq 5`);
    const max = Object.values(d.acts).reduce((n, a) => n + a.pct * a.cap, 0);
    assert.ok(max >= 1 && max <= 1.6, `${id}: ${max} % je Kampf`);
  }
});

test('Deckel je Kampf, nur eigener Pfad, nicht im Übungskampf', () => {
  const s = hero('eisen', 4);
  const c = new Combat(s, 'rook_fight');
  for (let i = 0; i < 10; i++) c.pathAct('eisen_parade');
  assert.ok(Math.abs(s.pathway.digestion - 0.15 * 6) < 1e-9);
  assert.equal(c.pathAct('uhr_perfekt'), 0);
  const c2 = new Combat(s, 'rook_fight');
  assert.ok(c2.pathAct('eisen_parade') > 0);
  c2.enc = { ...c2.enc, practice: true };
  assert.equal(c2.pathAct('eisen_parade'), 0);
});

test('Eisen: Parade und eingesteckter Treffer verdauen fest', () => {
  const s = hero('eisen', 4);
  const c = new Combat(s, 'rook_fight');
  c.resolveHit({ damage: 5 }, 'parry', 1);
  const afterParry = s.pathway.digestion;
  assert.ok(afterParry >= 0.15 - 1e-9);
  c.resolveHit({ damage: 5 }, 'none', 1);
  assert.ok(s.pathway.digestion > afterParry);
});

test('Uhr: perfektes Ausweichen verdaut fest', () => {
  const s = hero('sq_uhr', 4);
  const c = new Combat(s, 'rook_fight');
  c.resolveHit({ damage: 5 }, 'perfect', 1);
  assert.ok(Math.abs(s.pathway.digestion - 0.15) < 1e-9);
});

test('Waage: eigener Schutz, der abfängt, verdaut den Wirker', () => {
  const s = hero('sq_waage', 4);
  const c = new Combat(s, 'rook_fight');
  assert.ok(c.shieldDigests(1));
  c.fighters[1].shield = 50;
  c.fighters[1].shieldFrom = 1;
  c.resolveHit({ damage: 30 }, 'none', 1);
  assert.ok(Math.abs(s.pathway.digestion - 0.1) < 1e-9);
});
