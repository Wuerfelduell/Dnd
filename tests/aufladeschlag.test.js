// Aufladeschlag (Seb 2026-11-27): Eliten und Bosse holen sichtbar aus; die Aufladung ist nicht unterbrechbar.
// Dazu mehr Timing-Muster für alle Gegner (Ringkurven und Takt der Kombos).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, CHARGE_MULT, CHARGE_HP_CAP, CHARGE_COOLDOWN, CHARGE_LEAD, RING_CURVES, RHYTHMS, RING_LEAD_MIN } from '../src/core/Combat.js';
import { loadContent, seeded } from './helpers.js';

const content = loadContent();

function hero(p2 = false) {
  const s = new GameState(content);
  s.addItem('schlagstock');
  s.equip('schlagstock');
  if (p2) { s.addP2(); s.withPlayer(2, () => { s.addItem('schlagstock'); s.equip('schlagstock'); }); }
  return s;
}

const bossId = 'starling_fight';

test('Aufladeschlag: Ankündigung, dann voller Schlag in der nächsten Runde, Betäubung unterbricht nicht', () => {
  const c = new Combat(hero(), bossId);
  assert.ok(c.enc.boss);
  c.enc = { ...c.enc, attacks: c.enc.attacks.filter((a) => !a.action) };
  c.rng = () => 0.01; c.taktRng = () => 0.01;
  // Runde 1: noch keine Aufladung
  c.nextEnemyAttack(); c.endEnemyTurn(); c.endRound();
  // Runde 2: er greift an und holt dabei sichtbar aus
  const first = c.nextEnemyAttack();
  assert.ok(first?.chargeStart);
  assert.ok(c.charging);
  c.endEnemyTurn();
  c.stunned = true; // Blendung zwischendurch: unterbricht die Aufladung nicht
  c.endRound();
  const atk = c.nextEnemyAttack();
  assert.ok(atk?.charged, 'der angekündigte Schlag kommt trotz Betäubung');
  assert.equal(c.stunned, true, 'die Betäubung wartet bis danach');
  assert.equal(atk.rings[0].lead, CHARGE_LEAD);
  assert.ok(atk.hits[0] > CHARGE_LEAD, 'der erste Ring kommt langsam');
  const normal = c.prepareAttack(c.enc.attacks.find((a) => a.name === atk.name.replace('Aufladeschlag: ', '')));
  assert.ok(atk.damage >= Math.round(normal.damage * CHARGE_MULT) - 1, 'jeder Schlag mit voller Wucht');
  assert.equal(c.charging, null);
  assert.equal(c.chargeCool, CHARGE_COOLDOWN);
  // Verpasst: harter Treffer, aber höchstens CHARGE_HP_CAP der Leben
  c.state.hp = c.state.maxHp;
  const r = c.resolveHit(atk, 'miss');
  assert.ok(r.damage > 0 && r.damage <= Math.round(c.state.maxHp * CHARGE_HP_CAP));
  // Ausgewichen: nichts
  c.state.hp = c.state.maxHp;
  assert.equal(c.resolveHit(atk, 'dodge').damage, 0);
});

test('Aufladeschlag: nur Eliten und Bosse, nicht in Runde 1, nicht in Übung, Abklingzeit danach', () => {
  const normal = new Combat(hero(), 'fog_hound');
  normal.rng = () => 0.01; normal.taktRng = () => 0.01;
  normal.round = 3;
  assert.equal(normal.startsCharge(), false);
  const sparring = new Combat(hero(), 'sparring');
  sparring.rng = () => 0.01; sparring.taktRng = () => 0.01;
  sparring.round = 3;
  assert.equal(sparring.startsCharge(), false);
  const street = new Combat(hero(), 'glockenhund_elite'); // Kettlegate-Straße: noch keine Aufladeschläge
  street.taktRng = () => 0.01;
  street.round = 3;
  assert.equal(street.startsCharge(), false);
  const boss = new Combat(hero(), bossId);
  boss.enc = { ...boss.enc, attacks: boss.enc.attacks.filter((a) => !a.action) };
  boss.rng = () => 0.01; boss.taktRng = () => 0.01;
  assert.equal(boss.startsCharge(), false, 'Runde 1');
  boss.round = 2;
  assert.equal(boss.startsCharge(), true);
  boss.chargeCool = 1;
  assert.equal(boss.startsCharge(), false, 'Abklingzeit');
  boss.chargeCool = 0;
  boss.taktRng = () => 0.99;
  assert.equal(boss.startsCharge(), false, 'Zufall');
});

test('Aufladeschlag im Koop trifft beide Stehenden', () => {
  const c = new Combat(hero(true), bossId);
  assert.ok(c.duo);
  c.enc = { ...c.enc, attacks: c.enc.attacks.filter((a) => !a.action) };
  c.rng = () => 0.01; c.taktRng = () => 0.01;
  c.round = 2;
  while (c.moreStrikes()) { c.nextEnemyAttack(); c.endEnemyTurn(); }
  assert.ok(c.charging);
  c.endRound();
  const atk = c.nextEnemyAttack();
  assert.ok(atk.charged && atk.sweep);
  assert.deepEqual(atk.targets, [1, 2]);
  assert.equal(c.moreStrikes(), false);
});

test('Timing-Muster: jede Ringkurve endet geschlossen, Takte halten Mindestvorlauf', () => {
  for (const [name, f] of Object.entries(RING_CURVES)) {
    assert.ok(Math.abs(f(1) - 1) < 1e-9, `${name} schließt beim Einschlag`);
    assert.ok(Math.abs(f(0)) < 0.05, `${name} beginnt offen`);
    for (let u = 0; u <= 1; u += 0.01) assert.ok(f(u) <= 1.0001 && f(u) >= -0.5, `${name} bleibt im Rahmen bei ${u}`);
  }
  assert.ok(Object.keys(RING_CURVES).length >= 10);
  const c = new Combat(hero(), bossId);
  const multi = c.enc.attacks.find((a) => !a.action && a.hits.length > 1) ?? { name: 'Test', damage: 5, hits: [500, 900, 1300] };
  const seen = new Set();
  for (let seed = 1; seed < 60; seed++) {
    c.rng = seeded(seed); c.taktRng = seeded(seed + 100);
    const a = c.prepareAttack(multi);
    seen.add(a.rhythm);
    assert.ok(a.rings.every((r) => r.lead >= RING_LEAD_MIN));
    for (let i = 1; i < a.hits.length; i++) assert.ok(a.hits[i] - a.hits[i - 1] >= a.rings[i].lead, 'Ringe überlappen nicht');
  }
  assert.equal(seen.size, Object.keys(RHYTHMS).length, 'alle Takte kommen vor');
});
