// Konzentrations-Artefakte: mehr Konzentration (Höchstwert, Rundenstart, Angriff) gegen harte Flüche im Kampf.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, AP_MAX, AP_MAX_CAP, AP_START } from '../src/core/Combat.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const FOCUS_KEYS = ['ap_max', 'ap_round', 'attack_ap', 'ap_start', 'parry_ap'];
const NEW_CURSES = ['ap_blood', 'ap_burn', 'ap_reset', 'combat_drain', 'enemy_ramp', 'no_flee', 'no_items'];
const focusArts = Object.entries(content.artifacts.list).filter(([, a]) => a.konzentration);

/** Spieler mit genug Leben und einem Artefakt im Inventar, ohne Unruhe-Nebenwirkungen des Aufnehmens. */
function hero(...ids) {
  const s = new GameState(content);
  for (const id of ids) s.addItem(id);
  s.unruhe = 0;
  s.hp = s.maxHp;
  return s;
}

test('Es gibt mindestens zwölf Konzentrations-Artefakte, jedes mit Konzentrations-Segen und mindestens zwei Flüchen', () => {
  assert.ok(focusArts.length >= 12, `${focusArts.length}`);
  const sources = new Set();
  for (const [id, a] of focusArts) {
    sources.add(a.source);
    assert.ok(a.boons.some((b) => FOCUS_KEYS.includes(b.key) && b.value > 0), `${id}: kein Konzentrations-Segen`);
    assert.ok(a.curses.length >= 2, `${id}: zu wenige Flüche`);
    for (const e of [...a.boons, ...a.curses]) assert.ok(e.text?.length > 5, `${id}: Text fehlt`);
    assert.equal(content.items[id].kind, 'artifact');
    assert.ok(a.price >= 60);
    if (a.source === 'wild') assert.ok(a.zones?.length, `${id}: Gebiete`);
    if (a.source === 'revier') assert.ok(a.requires_honor >= 20, `${id}: Rang`);
  }
  assert.deepEqual([...sources].sort(), ['revier', 'treffen', 'wild']);
  // Jeder neue Fluch kommt mindestens einmal vor
  const used = new Set(focusArts.flatMap(([, a]) => a.curses.map((c) => c.key)));
  for (const k of NEW_CURSES) assert.ok(used.has(k), `Fluch ${k} ungenutzt`);
});

test('Höchstwert der Konzentration wächst mit Artefakten und bleibt gedeckelt', () => {
  const s = hero('gedankenkaefig'); // +3
  const c = new Combat(s, 'fog_hound');
  assert.equal(c.apMax, AP_MAX + 3);
  c.ap = 0;
  c.gainAp(20);
  assert.equal(c.ap, AP_MAX + 3);
  const s2 = hero('gedankenkaefig', 'hohle_krone', 'rangierlinse'); // +8 → Deckel
  assert.equal(new Combat(s2, 'fog_hound').apMax, AP_MAX_CAP);
  assert.equal(new Combat(hero(), 'fog_hound').apMax, AP_MAX);
});

test('Rundenstart bringt Konzentration, Metronom lässt dich ohne beginnen', () => {
  const s = hero('metronom_ohne_feder');
  const c = new Combat(s, 'fog_hound');
  assert.equal(c.fighters[1].ap, 0, 'ap_start −1');
  c.endRound();
  assert.equal(c.fighters[1].ap, 1);
  assert.equal(c.fighters[1].focusGain, 1);
  c.endRound();
  assert.equal(c.fighters[1].ap, 2);
  // Zweites Herz: +2 pro Runde, aber Rest verfällt
  const z = new Combat(hero('zweites_herz'), 'fog_hound');
  z.ap = 5;
  z.endRound();
  assert.equal(z.fighters[1].ap, 2, 'ap_reset, dann +2');
});

test('Flüche: ungenutzte Konzentration brennt Leben, ausgegebene kostet Blut, aber nie das letzte Leben', () => {
  const s = hero('tickender_zahn'); // ap_burn 3
  const c = new Combat(s, 'fog_hound');
  c.ap = 4;
  const hp = s.hp;
  c.endRound();
  assert.equal(hp - s.hp, 12);
  assert.equal(c.fighters[1].focusTick, 12);
  s.hp = 5;
  c.ap = 6;
  c.endRound();
  assert.equal(s.hp, 1, 'tötet nie');
  // ap_blood: Doppelschlag (2 K) kostet beim zweiten Herz 4 Leben
  const z = hero('zweites_herz');
  const zc = new Combat(z, 'fog_hound');
  zc.ap = 6;
  const before = z.hp;
  const r = zc.useSkill('double', ['good', 'good']);
  assert.equal(before - z.hp, 4);
  assert.ok(r.effects.some((e) => e.includes('Leben für die Konzentration')));
  // Ohne Fluch kostet es nichts
  const plain = hero();
  const pc = new Combat(plain, 'fog_hound');
  pc.ap = 6;
  const hp0 = plain.hp;
  pc.useSkill('double', ['good', 'good']);
  assert.equal(plain.hp, hp0);
});

test('Angriff bringt mehr Konzentration, Paraden keine, Flucht und Gegenstände gesperrt', () => {
  const s = hero('schlagzaehler'); // attack_ap +1, no_flee
  const c = new Combat(s, 'fog_hound');
  assert.equal(c.fighters[1].ap, AP_START);
  c.useSkill('attack', ['good']);
  assert.equal(c.ap, AP_START + 2);
  assert.equal(c.canFlee(), false, 'Schlagzähler verbietet Flucht');
  assert.equal(new Combat(hero(), 'fog_hound').canFlee(), true);
  // Gedankenkäfig: keine Gegenstände, Paraden ohne Konzentration
  const k = hero('gedankenkaefig');
  k.addItem('verband');
  const kc = new Combat(k, 'fog_hound');
  assert.equal(kc.canUseItem(), false);
  assert.equal(kc.itemBlockedText(), 'ein Artefakt verbietet es');
  assert.equal(kc.useItem('verband'), null);
  kc.ap = 0;
  const atk = kc.prepareAttack(kc.enc.attacks[0]);
  kc.resolveHit(atk, 'parry');
  assert.equal(kc.ap, 0, 'parry_ap −1');
});

test('Nervenzehrung und Gegner-Steigerung pro Runde', () => {
  const s = hero('nadel_der_naeherin'); // combat_drain 4, ap_start +2
  const c = new Combat(s, 'fog_hound');
  assert.equal(c.fighters[1].ap, AP_START + 2);
  const n = s.composure;
  c.endRound();
  assert.equal(n - s.composure, 4);
  assert.equal(c.drainTick, 4);
  // Rangierlinse: Gegner +8 % pro Runde
  const r = hero('rangierlinse');
  const rc = new Combat(r, 'fog_hound');
  rc.rng = () => 0.5;
  const d1 = rc.prepareAttack(rc.enc.attacks[0]).damage;
  rc.round = 6;
  const d6 = rc.prepareAttack(rc.enc.attacks[0]).damage;
  assert.ok(d6 > d1, `${d6} > ${d1}`);
  assert.equal(d6, Math.max(1, Math.round(rc.enc.attacks[0].damage * 1.4 * 1.4)));
  const plain = new Combat(hero(), 'fog_hound');
  plain.rng = () => 0.5;
  plain.round = 6;
  assert.equal(plain.prepareAttack(plain.enc.attacks[0]).damage, d1);
  // Übungskämpfe kennen keine Flüche
  const p = new Combat(hero('rangierlinse', 'tickender_zahn'), 'sparring');
  p.ap = 5;
  const hp = p.state.hp;
  p.endRound();
  assert.equal(p.state.hp, hp);
});

test('Spieler 2 hat eigene Konzentrations-Artefakte', () => {
  const s = hero();
  s.addP2();
  assert.ok(s.hasP2());
  s.withPlayer(2, () => { s.addItem('gedankenkaefig'); s.unruhe = 0; });
  const c = new Combat(s, 'fog_hound');
  assert.equal(c.apMaxOf(1), AP_MAX);
  assert.equal(c.apMaxOf(2), AP_MAX + 3);
});

test('Revier-Artefakte liegen in der Asservatenkammer, Treffen-Artefakte sind im Umlauf', () => {
  const s = new GameState(content);
  s.honor = 80;
  const stock = s.vaultStock().map((e) => e.id);
  for (const [id, a] of focusArts) if (a.source === 'revier') assert.ok(stock.includes(id), id);
  const offered = new Set(Object.values(content.gatherings.circles).flatMap((c) => c.members.flatMap((m) => m.offers.map((e) => e.item))));
  for (const [id, a] of focusArts) if (a.source === 'treffen') assert.ok(offered.has(id), id);
});

test('Sequenz 5 gibt +1 maximale Konzentration (alle Pfade, je Spieler)', () => {
  const s = hero();
  const c0 = new Combat(s, 'fog_hound');
  const base = c0.apMaxOf(1);
  s.pathway = { ...(s.pathway || { id: 'eisen' }), seq: 5 };
  assert.equal(new Combat(s, 'fog_hound').apMaxOf(1), Math.min(AP_MAX_CAP, base + 1));
  s.pathway.seq = 6;
  assert.equal(new Combat(s, 'fog_hound').apMaxOf(1), base);
});
