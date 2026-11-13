// Nervensystem im Kampf: Fertigkeiten kosten Nerven nach Konzentration, Gewöhnung mit der Sequenz,
// Atem holen beim einfachen Angriff, und die Nerven- und Konzentrations-Artefakte mit ihren Flüchen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, AP_MAX, AP_START, DODGE_COST, PARRY_GAIN, ATTACK_NERVES, ATTACK_NERVES_PERFECT, SKILLS } from '../src/core/Combat.js';
import { SKILL_COMPOSURE_BY_COST, HABIT_STEP, HABIT_MIN } from '../src/core/Pathways.js';
import { loadContent, seeded, fight, EXPERT } from './helpers.js';

const content = loadContent();

/** Ermittler auf dem Pfad des Eisens, voll bei Nerven, mit Waffe. */
function hero(seq = 7, pathway = 'eisen') {
  const s = new GameState(content);
  s.addItem('schlagstock');
  s.equip('schlagstock');
  if (seq) { s.pathway = { id: pathway, seq, digestion: 0 }; s.updateMaxHp(); s.hp = s.maxHp; }
  s.composure = s.maxComposure();
  return s;
}

// Die Konzentrations-Artefakte (ap_round, ap_max, ap_blood ...) kamen mit PR #227; hier die Nerven-Seite dazu.
const NERVEN_ARTEFAKTE = ['atemperle', 'blutsalz_phiole', 'knoechelring_preisboxer', 'trommelfell_ausrufer', 'glasnerv', 'nervenfaden_weberin', 'moorzunder',
  'taktgeber_uhrturm', 'kerze_der_nachtwache', 'zahnrad_schlafwandlerin', 'fiebermuenze', 'metronom_komponist']; // die letzten fünf kamen mit den BY-Icons

test('Jede Fertigkeit mit Konzentrationskosten kostet Nerven, je dicker, desto mehr; der einfache Angriff nie', () => {
  const s = hero(7);
  const c = new Combat(s, 'moorleiche');
  const costs = Object.fromEntries(c.skills().map((k) => [k.id, k.composure]));
  assert.equal(costs.attack, 0);
  for (const k of c.skills()) if (k.cost) assert.ok(k.composure > 0, `${k.id} kostet keine Nerven`);
  // Klingenwirbel (4 K, Sequenz 7 = aktuell) kostet voll, Wuchtschlag (2 K, Sequenz 9) ist Gewohnheit
  assert.equal(costs.klingenwirbel, SKILL_COMPOSURE_BY_COST[4]);
  assert.ok(costs.klingenwirbel > costs.eisenhaut && costs.eisenhaut > costs.wuchtschlag, JSON.stringify(costs));
  // Die sieben Pfade bis Sequenz 5: keine Fertigkeit trägt mehr eigene Nervenkosten, die Tabelle gilt überall.
  // Sequenz 4 bis 1 (Paket AF) behalten ihre eigenen, steilen Kosten (18 bis 42), auch sie unterliegen der Gewöhnung.
  for (const pid of ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel']) for (const [n, sd] of Object.entries(content.pathways[pid].seqs)) {
    if (Number(n) >= 5) assert.equal(sd.skill.composure, undefined, `${sd.skill.id} hat eigene Nervenkosten`);
    else assert.ok(sd.skill.composure >= 18, `${sd.skill.id}: hohe Sequenz, hohe Kosten`);
    assert.ok(!/Kostet \d+ Nerven/.test(sd.skill.desc), `${sd.skill.id}: Kostentext in der Beschreibung`);
  }
  const s1 = hero(1);
  const top = new Combat(s1, 'moorleiche').skills();
  assert.equal(top.find((k) => k.id === 'eisen_hoch_1').composure, Math.round(42 * s1.nervePoolFactor()), 'die neueste kostet voll (mit dem Nervenvorrat hochgerechnet)');
  assert.ok(s1.nervePoolFactor() > 2, 'Sequenz 1: dicke Fertigkeiten wachsen mit dem Vorrat');
  assert.ok(top.find((k) => k.id === 'eisen_hoch_4').composure < Math.round(18 * s1.nervePoolFactor()), 'die ältere ist Gewohnheit');
  // Bannwort behält seine eigenen Kosten (ohne Pfad: keine Gewöhnung)
  assert.equal(new Combat(hero(0), 'ash_warden').skills().find((k) => k.id === 'ward').composure, SKILLS.ward.composure);
});

test('Gewöhnung: mit jeder höheren Sequenz kosten die älteren Fertigkeiten weniger Nerven, die neueste immer voll', () => {
  const at = (seq) => Object.fromEntries(new Combat(hero(seq), 'moorleiche').skills().map((k) => [k.id, k.composure]));
  const s9 = at(9), s7 = at(7), s5 = at(5);
  const f5 = hero(5).nervePoolFactor(); // Nerven-Abgleich: Kosten wachsen mit dem Vorrat über 120 (bis Seq 6: 1)
  assert.equal(hero(7).nervePoolFactor(), 1);
  assert.equal(s9.wuchtschlag, SKILL_COMPOSURE_BY_COST[2]);
  assert.equal(s7.wuchtschlag, Math.round(SKILL_COMPOSURE_BY_COST[2] * (1 - 2 * HABIT_STEP)));
  assert.equal(s5.wuchtschlag, Math.round(SKILL_COMPOSURE_BY_COST[2] * HABIT_MIN * f5), 'Sequenz 9 ist mit 5 bei der Untergrenze');
  assert.equal(s5.hammerfall, Math.round(SKILL_COMPOSURE_BY_COST[5] * f5), 'die Fertigkeit der aktuellen Sequenz kostet voll');
  assert.ok(s5.klingenwirbel < s7.klingenwirbel);
  // Grundfertigkeiten gewöhnt man sich mit jeder Sequenz nach der ersten an
  assert.equal(s9.double, SKILL_COMPOSURE_BY_COST[2]);
  assert.ok(s5.double < s7.double && s7.double < s9.double, `${s9.double} > ${s7.double} > ${s5.double}`);
  // Pfad des Echos: Passive senken die Kosten zusätzlich
  const echo = Object.fromEntries(new Combat(hero(6, 'echo'), 'moorleiche').skills().map((k) => [k.id, k.composure]));
  assert.ok(echo.totenchor < SKILL_COMPOSURE_BY_COST[4] * HABIT_MIN + 1 || echo.totenchor <= Math.round(SKILL_COMPOSURE_BY_COST[4] * 0.35), JSON.stringify(echo));
});

test('Wer die dicke Fertigkeit spammt und ausweicht, steht bald ohne Nerven da: keine Fertigkeit, kein Ausweichen', () => {
  const s = hero(7);
  const c = new Combat(s, 'starling_stern');
  c.rng = seeded(3);
  let exhausted = false;
  let blocked = false;
  for (let round = 0; round < 40 && !c.outcome; round++) {
    // Spammen: Klingenwirbel sobald die Konzentration reicht, sonst Angriff; nie Atem holen, wenn es anders geht
    if (c.canUse('klingenwirbel')) c.useSkill('klingenwirbel', ['good', 'good', 'good']);
    else if (c.ap >= 4 && s.composure < c.composureCost(c.skillDef('klingenwirbel'))) { blocked = true; c.useSkill('attack', ['good']); }
    else c.useSkill('attack', ['good']);
    if (c.outcome) break;
    const atk = c.nextEnemyAttack();
    if (atk) {
      for (const h of atk.hits) { void h; const r = c.resolveHit(atk, 'dodge'); if (r.note === 'exhausted') exhausted = true; if (c.outcome) break; }
      c.endEnemyTurn();
    }
    c.endRound();
  }
  assert.ok(blocked, 'die Fertigkeit war wegen leerer Nerven nie gesperrt');
  assert.ok(exhausted, 'das Ausweichen hat nie an leeren Nerven gescheitert');
});

test('Atem holen: der einfache Angriff bringt Nerven zurück, präzise mehr; Paraden weiterhin', () => {
  const s = hero(7);
  const c = new Combat(s, 'moorleiche');
  s.setComposure(40);
  const r = c.useSkill('attack', ['good']);
  assert.equal(s.composure, 40 + ATTACK_NERVES);
  assert.ok(r.effects.includes(`+${ATTACK_NERVES} Nerven`));
  c.startTurn();
  c.useSkill('attack', ['perfect']);
  assert.equal(s.composure, 40 + ATTACK_NERVES + ATTACK_NERVES_PERFECT);
  const atk = c.nextEnemyAttack();
  const before = s.composure;
  c.resolveHit(atk, 'parry');
  assert.equal(s.composure, before + PARRY_GAIN);
});

test('Geübte gewinnen die Bosse von Kapitel 1 weiterhin, kommen aber mit sichtbar angegriffenen Nerven heraus', () => {
  for (const id of ['miriam', 'miss_wren', 'starling_stern']) {
    const s = hero(7);
    const { result } = fight(s, id, { defend: EXPERT, skill: 'klingenwirbel', healBelow: 15, chain: true, weak: true });
    assert.equal(result.outcome, 'won', id);
    assert.ok(s.composure < s.maxComposure() * 0.7, `${id}: ${s.composure} von ${s.maxComposure()} Nerven übrig, der Kampf hat nicht gezehrt`);
  }
});

test('Artefakte: Nervenfaden und Trommelfell drehen an Höchst- und Startkonzentration, der Start fällt nie unter 0', () => {
  const base = new Combat(hero(7), 'moorleiche'); // der Pfad des Eisens bringt ab Sequenz 7 selbst Startkonzentration
  const s = hero(7);
  s.addItem('nervenfaden_weberin'); // +3 Höchstkonzentration; -5 Nerven je Runde, -20 Nerven
  const c = new Combat(s, 'moorleiche');
  assert.equal(c.apMax, Math.min(base.apMax + 3, 9));
  assert.equal(s.maxComposure(), hero(7).maxComposure() - 20);
  c.ap = c.apMax;
  c.useSkill('attack', ['good']);
  c.gainAp(10);
  assert.equal(c.ap, c.apMax, 'Höchstwert hält');
  const nerves = s.composure;
  c.endRound();
  assert.equal(s.composure, nerves - 5);
  assert.equal(c.drainTick, 5);
  const t = hero(7);
  t.addItem('trommelfell_ausrufer'); // +25 Nerven, Erholung +30 %; -1 Höchstwert, -1 Start, 10 % mehr Schaden
  t.addItem('atemperle'); // +5 Nerven je Runde; -2 Höchstwert, Heilung 60 %
  const k = new Combat(t, 'moorleiche');
  assert.equal(k.ap, Math.max(0, base.ap - 1));
  assert.equal(k.apMax, base.apMax - 3);
  const z = hero(0);
  z.addItem('trommelfell_ausrufer');
  assert.equal(new Combat(z, 'moorleiche').ap, Math.max(0, AP_START - 1), 'nie unter 0');
});

test('Artefakte: Nerven pro Runde zurück, Blutzoll und Unruhe je Fertigkeit, teureres Ausweichen, bessere Paraden', () => {
  const s = hero(7);
  s.addItem('blutsalz_phiole'); // +4 Nerven je Runde, Paraden +2 Nerven; jeder Punkt Konzentration kostet 1 Leben
  s.addItem('knoechelring_preisboxer'); // Paraden +1 K, +4 Nerven; Ausweichen +4 Nerven, 15 % mehr Schaden
  s.addItem('moorzunder'); // Fertigkeiten 60 % billiger, aber 4 Unruhe je Fertigkeit
  const c = new Combat(s, 'moorleiche');
  c.rng = seeded(5);
  assert.equal(c.dodgeCost(), DODGE_COST + 4);
  s.setComposure(60);
  const hp = s.hp;
  const unruhe = s.unruhe;
  c.ap = 6;
  const r = c.useSkill('klingenwirbel', ['good', 'good', 'good']);
  assert.equal(s.hp, hp - 4, 'Blutzoll: 4 K Klingenwirbel');
  assert.ok(r.effects.some((e) => e.includes('Leben für die Konzentration')));
  assert.equal(s.unruhe, unruhe + 4);
  assert.equal(s.composure, 60 - Math.round(16 * 0.4), 'Moorzunder senkt die Kosten');
  const atk = c.nextEnemyAttack();
  let before = s.composure;
  c.resolveHit(atk, 'dodge');
  assert.equal(s.composure, before - DODGE_COST - 4);
  before = s.composure;
  const ap = c.ap;
  c.resolveHit(atk, 'parry');
  assert.equal(s.composure, before + PARRY_GAIN + 2 + 4);
  assert.equal(c.ap, Math.min(c.apMax, ap + 1 + s.passive('parry_ap')));
  assert.ok(s.passive('parry_ap') >= 1);
  c.endEnemyTurn();
  before = s.composure;
  c.endRound();
  assert.equal(s.composure, before + 4);
  assert.equal(c.regenTick, 4);
  // Blutzoll bringt nie um
  s.hp = 2;
  c.ap = 6;
  c.useSkill('klingenwirbel', ['good', 'good', 'good']);
  assert.equal(s.hp, 1);
});

test('Alle Nerven-Artefakte sind erreichbar: Asservatenkammer, Beute in ihren Gebieten, Treffen oder die Fasserin', () => {
  const list = content.artifacts.list;
  const recipes = content.gatherings.artisan.recipes;
  const offers = Object.values(content.gatherings.circles).flatMap((c) => c.members ?? []).flatMap((m) => m.offers ?? []).map((o) => o.item);
  for (const id of NERVEN_ARTEFAKTE) {
    const a = list[id];
    assert.ok(a, id);
    assert.equal(content.items[id].kind, 'artifact');
    assert.ok(a.boons.length && a.curses.length, `${id}: Vorteil und Nachteil`);
    const strong = a.curses.length >= 2 || a.curses.some((c) => ['ap_blood', 'round_nerves', 'hit_nerves'].includes(c.key));
    assert.ok(strong, `${id}: der Preis ist zu mild`);
    for (const e of [...a.boons, ...a.curses]) assert.ok(e.text && typeof e.value === 'number', `${id}: ${e.key}`);
    if (a.source === 'revier') assert.ok(a.requires_honor >= 35 && a.price > 0, id);
    if (a.source === 'wild') {
      for (const z of a.zones) assert.ok(content.zones[z], `${id}: Gebiet ${z}`);
      assert.ok(Object.values(content.loot).some((t) => (t.drops ?? []).some((d) => d.item === id)), `${id} fällt nirgends`);
    }
    if (a.source === 'treffen') assert.ok(offers.includes(id), `${id} wird auf keinem Treffen angeboten`);
    if (a.source === 'artisan') {
      const r = recipes.find((x) => (x.artifact ?? x.id) === id);
      assert.ok(r, `${id}: kein Rezept bei der Fasserin`);
      for (const need of Object.keys(r.needs)) assert.ok(content.items[need], `${id}: Zutat ${need}`);
    }
  }
  // Keine doppelten Ids mit den Konzentrations-Artefakten aus PR #227
  assert.equal(new Set(Object.keys(list)).size, Object.keys(list).length);
});

test('Nerven-Abgleich: Geistsicht wird mit jeder Sequenz billiger, dicke Fertigkeiten und Welt-Fähigkeiten wachsen mit dem Vorrat', () => {
  const drain = (seq, pid = 'eisen') => hero(seq, pid).visionDrainPerSec();
  assert.equal(new GameState(content).visionDrainPerSec(), 6, 'ohne Pfad 6 Nerven pro Sekunde');
  assert.ok(drain(9) > drain(7) && drain(7) > drain(5), `${drain(9)} > ${drain(7)} > ${drain(5)}`);
  assert.ok(drain(1) >= 3 - 1e-9, 'höchstens halbiert');
  // Seq 5 hält die Geistsicht von voll an mindestens eine halbe Minute
  for (const pid of Object.keys(content.pathways)) { const s = hero(5, pid); assert.ok(s.maxComposure() / s.visionDrainPerSec() >= 30, pid); }
  // Gegenstände mit mehr Nerven machen die Fertigkeiten nicht teurer
  const a = hero(5, 'laterne'), b = hero(5, 'laterne');
  b.buffs = [{ key: 'max_nerves', value: 80, until: 1e9, source: 'test' }];
  assert.equal(a.nervePoolFactor(), b.nervePoolFactor());
  // Welt-Fähigkeiten: Grundwert × 2,5 × Vorrat; die Verdauung richtet sich weiter nach dem Grundwert
  const t = a.talents().find((x) => x.seq === 5);
  assert.equal(t.nerves, Math.round(t.baseNerves * 2.5 * a.nervePoolFactor()));
});
