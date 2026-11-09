// Stadtkarte und Reisearten (travel.json): `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { canHurry, travelSafe, travelFast, afterHurryFight, rollLoot } from '../src/core/Travel.js';
import { loadContent, fight } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);
const seq = (...vals) => { let i = 0; return () => vals[i++ % vals.length]; };
const rules = content.travelRules;

test('Daten: Pins, Ereignisse, Beute und Gegner passen zusammen', () => {
  for (const t of content.travel) assert.ok(rules.pins[t.map], `Pin fehlt für ${t.map}`);
  for (const [x, y] of Object.values(rules.pins)) assert.ok(x >= 8 && x <= 472 && y >= 8 && y <= 262);
  for (const ev of rules.events) {
    if (ev.encounter) assert.ok(content.encounters[ev.encounter], `Gegner fehlt: ${ev.encounter}`);
    if (ev.loot) assert.ok(rules.loot[ev.loot], `Beute fehlt: ${ev.loot}`);
  }
  for (const [tid, t] of Object.entries(rules.loot)) {
    for (const it of t.items ?? []) if (it.id) assert.ok(content.items[it.id], `${tid}: Gegenstand fehlt: ${it.id}`);
  }
  for (const id of Object.keys(rules.encounters)) {
    const e = content.encounters[id];
    assert.deepEqual(e.on_win, {}, `${id} darf keine Story-Folgen haben`);
    assert.ok(!e.lose_to, `${id}: Niederlage führt ans Reiseziel, nicht woandershin`);
  }
});

test('Langsam und sicher: Leben und Nerven zurück, Journal zeigt den nächsten Schritt', () => {
  const s = fresh();
  s.startQuest(Object.keys(content.quests).find((q) => content.quests[q].kind === 'main'));
  s.hp = 10;
  s.setComposure(40);
  const r = travelSafe(s, () => 0);
  assert.equal(r.healed, Math.round(s.maxHp * rules.modes.sicher.heal_pct));
  assert.equal(s.composure, 40 + rules.modes.sicher.nerves);
  assert.ok(r.hint?.text, 'Journal-Tipp fehlt');
});

test('Schnell und gefährlich: kostet Nerven, gesperrt bei zu wenig', () => {
  const s = fresh();
  s.setComposure(rules.modes.schnell.nerves_cost - 1);
  assert.equal(canHurry(s), false);
  s.setComposure(60);
  assert.equal(canHurry(s), true);
  travelFast(s, () => 0); // erstes Ereignis: ruhig
  assert.equal(s.composure, 60 - rules.modes.schnell.nerves_cost);
});

test('Schnell: Fundstück gibt Beute, Taschendieb nimmt Geld', () => {
  const s = fresh();
  const pickEvent = (id) => {
    const pool = rules.events.filter((e) => s.meets(e));
    const total = pool.reduce((a, e) => a + e.weight, 0);
    let acc = 0;
    for (const e of pool) { if (e.id === id) return (acc + e.weight / 2) / total; acc += e.weight; }
    throw new Error(`${id} nicht verfügbar`);
  };
  const money = s.money;
  const ev = travelFast(s, seq(pickEvent('reise_fund'), 0.5, 0.01));
  assert.equal(ev.id, 'reise_fund');
  assert.ok(ev.loot.length >= 2, 'Geld und ein Gegenstand');
  assert.ok(s.money > money);
  const before = s.money;
  const thief = travelFast(s, seq(pickEvent('reise_taschendieb'), 0.5));
  assert.equal(thief.id, 'reise_taschendieb');
  assert.equal(before - s.money, thief.lostMoney);
  assert.ok(thief.lostMoney >= 3);
});

test('Schnell: Monster freigeschaltet nach Fortschritt, Sieg gibt Beute', () => {
  const s = fresh();
  const ids = () => rules.events.filter((e) => s.meets(e)).map((e) => e.id);
  assert.ok(!ids().includes('reise_kultpatrouille'));
  s.flags.add('travel_ebba');
  s.flags.add('travel_docks');
  assert.ok(ids().includes('reise_kultpatrouille') && ids().includes('reise_nebel'));
  const ev = rules.events.find((e) => e.id === 'reise_ratten');
  const { result } = fight(s, ev.encounter, { attack: 'perfect', defend: () => 'parry' });
  assert.equal(result.outcome, 'won');
  assert.equal(result.travel, null);
  const money = s.money;
  const loot = afterHurryFight(s, ev, 'won', () => 0.1);
  assert.ok(loot.length >= 1 && s.money > money);
  assert.deepEqual(afterHurryFight(s, ev, 'fled'), []);
});

test('Einmalige Beute (Schlagstock) kommt nicht doppelt', () => {
  const s = fresh();
  s.addItem('schlagstock', 1);
  for (let i = 0; i < 20; i++) rollLoot(s, 'raeuber', () => i / 20);
  assert.equal(s.itemCount('schlagstock'), 1);
});
