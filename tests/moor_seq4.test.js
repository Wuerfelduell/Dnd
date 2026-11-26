// Seb 2026-11-26: Moor Seq 4 spielt sich anders, nicht nur stärker: Torfschicht (Überheilung wird Schutz),
// Begraben (Gegner setzt aus, Gift springt über) und der Torf-Retter als Halbgott-Eigenheit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, BURY_LOCK } from '../src/core/Combat.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const hero = (seq, pid = 'sq_moor') => {
  const s = new GameState(content);
  s.pathway = { id: pid, seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  return s;
};
const duo = (seq1, seq2, pid2 = 'eisen') => {
  const s = hero(seq1);
  s.addP2();
  s.withPlayer(2, () => { s.pathway = { id: pid2, seq: seq2, digestion: 0 }; s.updateMaxHp(); s.hp = s.maxHp; s.composure = s.maxComposure(); });
  return s;
};

test('Daten: Begraben statt Verlangsamen, Torfschicht auf Seq 4, Eigenheit Torf-Retter', () => {
  const sd = content.pathways.sq_moor.seqs[4];
  assert.equal(sd.skill2.name, 'Begraben');
  assert.ok(sd.skill2.bury && !sd.skill2.slow);
  assert.ok(sd.passives.some((p) => p.key === 'torfschicht'));
  assert.ok(sd.passives.some((p) => p.key === 'torf_retter'));
  assert.ok(!sd.passives.some((p) => p.key === 'heal_bonus'));
  assert.equal(hero(5).passive('torfschicht'), 0);
  assert.equal(hero(4).passive('torfschicht'), 1);
  assert.equal(hero(3).passive('torf_retter'), 1, 'bleibt nach dem Aufstieg');
});

test('Torfschicht: Überheilung wird Schutz, auf Seq 5 nicht', () => {
  for (const [seq, want] of [[4, true], [5, false]]) {
    const s = hero(seq);
    s.hp = s.maxHp - 1;
    const c = new Combat(s, 'rook_fight');
    c.ap = 20;
    const id = Object.keys(s.pathwaySkills()).find((k) => s.pathwaySkills()[k].heal && s.pathwaySkills()[k].cost <= 6 && k.startsWith('moor_hoch_4')) ?? `moor_stufe_${seq}`;
    c.useSkill(id, ['good', 'good']);
    assert.equal(c.fighters[1].shield > 0, want, `Seq ${seq}`);
    if (want) assert.equal(c.fighters[1].shieldFrom, 1);
  }
});

test('Torfschicht im Koop: Partnerheilung über volle Leben gibt dem Partner Schutz', () => {
  const s = duo(4, 7);
  s.hp = 5;
  const c = new Combat(s, 'fog_hound');
  c.ap = 20;
  c.healTarget = 2;
  const r = c.useSkill('moor_hoch_4', ['good', 'good']);
  assert.ok(c.fighters[2].shield > 0);
  assert.equal(c.fighters[1].shield, 0);
  assert.ok(r.effects.some((e) => e.includes('Torfschicht')));
});

test('Begraben: Gegner setzt aus, Bosse graben sich erst frei', () => {
  const s = hero(4);
  const c = new Combat(s, 'rook_fight');
  c.ap = 20;
  c.enemy.hp = c.enemy.maxHp = 100000;
  const r = c.useSkill('moor_schichtdruck', ['good', 'good']);
  assert.ok(c.stunned && r.stunned);
  c.enc = { ...c.enc, boss: true };
  c.stunned = false;
  c.useSkill('moor_schichtdruck', ['good', 'good']);
  assert.ok(c.stunned);
  assert.equal(c.buryLock, BURY_LOCK.boss + 1);
  c.stunned = false;
  c.endRound();
  const r2 = c.useSkill('moor_schichtdruck', ['good', 'good']);
  assert.ok(!c.stunned && r2.effects.some((e) => e.includes('gräbt sich')));
});

test('Begraben: Gift des Ziels springt auf den nächsten Gegner über', () => {
  const s = hero(4);
  const c = new Combat(s, 'moorleiche', { pack: ['irrlicht', 'irrlicht'] });
  c.ap = 20;
  for (const f of c.foes) f.enemy.hp = f.enemy.maxHp = 100000;
  c.burn = { damage: 40, rounds: 3, source: 'moor_hoch_4' };
  c.useSkill('moor_schichtdruck', ['good', 'good']);
  assert.deepEqual(c.foes[1].burn, { damage: 40, rounds: 3, source: 'moor_hoch_4' });
  assert.equal(c.foes[2].burn, null, 'nur auf einen');
});

test('Torf-Retter: einmal je Kampf, auch für den Partner', () => {
  const s = duo(4, 7);
  const c = new Combat(s, 'fog_hound');
  c.on(2, () => { s.hp = 1; });
  const r = c.resolveHit({ damage: 9999 }, 'none', 2);
  assert.ok(!r.down && r.rescued?.n === 2 && r.rescued.by === 1);
  assert.equal(s.p2.hp, 1);
  assert.ok(c.fighters[2].shield > 0);
  c.fighters[2].shield = 0;
  const r2 = c.resolveHit({ damage: 9999 }, 'none', 2);
  assert.ok(r2.down, 'zweites Mal fällt er');
  s.hp = 1;
  const r3 = c.resolveHit({ damage: 9999 }, 'none', 1);
  assert.ok(r3.down, 'Retter je Moor-Spieler nur einmal');
});

test('Torf-Retter: Moor auf Seq 5 und andere Pfade retten nicht', () => {
  const s = hero(5);
  const c = new Combat(s, 'fog_hound');
  s.hp = 1;
  assert.ok(c.resolveHit({ damage: 9999 }, 'none', 1).down);
});

// Seb 2026-11-26: Das Relikt des Verfalls soll richtig stark sein (auch Relikte aus alten Spielständen).
test('Relikt des Verfalls: verstärkte Eigenschaften, Moorkern, Rundenheilung und Moorgift', async () => {
  const { reliktEffects } = await import('../src/core/Artifacts.js');
  const alt = { boons: [{ key: 'dmg_mult', value: 1.4, text: 'Schaden ×1,40.' }, { key: 'damage_taken', value: 0.95, text: 'X: −5 %.', name: 'X', kat: 'stein' }], curses: [{ key: 'unruhe_tick', value: 0.4, text: 'Fluch.' }], name: 'Altes', desc: '' };
  const w = reliktEffects(alt);
  assert.equal(w.boons[0].value, 1.6, 'geerbt ×1,5');
  assert.equal(w.boons[1].value, 0.85, 'Moor-Eigenschaft ×3');
  assert.equal(w.curses[0].value, 0.2, 'Fluch halb');
  assert.ok(w.boons.some((b) => b.key === 'moor_relikt'));
  const s = hero(4);
  const hp0 = s.maxHp;
  s.pathway.relikt = alt;
  s.addItem('s4mo_relikt');
  s.updateMaxHp();
  assert.ok(s.maxHp >= hp0 + 100);
  assert.ok(s.passive('dmg_mult') > 1.9);
  assert.equal(s.item('s4mo_relikt').boons.length, w.boons.length, 'Anzeige zeigt die echte Wirkung');
  s.hp = 50;
  const c = new Combat(s, 'fog_hound');
  c.reliktRound();
  assert.ok(s.hp > 50);
  assert.ok(c.withFoe(0, () => c.burn?.relikt));
});
