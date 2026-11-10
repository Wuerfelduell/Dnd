// Zwei Fähigkeiten je Sequenz: zweite Kampffertigkeit (skill2) und Welt-Fähigkeit (talent) aus faehigkeiten2.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, SLOW_MULT, ENEMY_DMG_MULT } from '../src/core/Combat.js';
import { hurryCost, canHurry } from '../src/core/Travel.js';
import { faehigkeitenIds } from '../src/data/faehigkeiten.js';
import { loadContent, seeded } from './helpers.js';
import { readFileSync } from 'node:fs';

const content = loadContent();
const raw = JSON.parse(readFileSync(new URL('../src/data/packs/sequenzen/faehigkeiten2.json', import.meta.url), 'utf8'));
const KAMPF_KEYS = new Set(['id', 'name', 'cost', 'hits', 'flat', 'mult', 'holy', 'sure', 'pierce', 'stun', 'weak', 'evade', 'confuse', 'shield', 'heal', 'drain', 'burn', 'composure', 'desc', 'fx',
  'ap_gain', 'nerves_gain', 'calm', 'weaken', 'slow', 'armor_break', 'guard_break', 'steal', 'cleanse', 'read', 'focus', 'shield_all', 'heal_all', 'extend_burn']);
const WELT_KEYS = new Set(['id', 'name', 'nerves', 'unruhe', 'cooldown', 'desc', 'buff', 'buff2', 'calm', 'nerves_gain', 'heal_pct', 'hint', 'review', 'reveal', 'scare', 'clock', 'digest', 'wanted', 'money', 'scout']);

/** Spieler mit Pfad auf Sequenz seq (ohne Trinken). */
function beyonder(pid, seq, s = new GameState(content)) {
  s.pathway = { id: pid, seq, digestion: 0 };
  s.updateMaxHp();
  s.composure = s.maxComposure();
  return s;
}

test('Jede Sequenz jedes Pfades hat zwei Kampffertigkeiten und eine Welt-Fähigkeit, alle Ids eindeutig', () => {
  const ids = new Set();
  for (const [pid, p] of Object.entries(content.pathways)) {
    for (const [n, sd] of Object.entries(p.seqs)) {
      assert.ok(sd.skill?.id, `${pid} ${n}: skill`);
      assert.ok(sd.skill2?.id && sd.skill2.name && sd.skill2.desc && sd.skill2.cost >= 1, `${pid} ${n}: skill2`);
      assert.ok(sd.talent?.id && sd.talent.name && sd.talent.desc && sd.talent.cooldown >= 60, `${pid} ${n}: talent`);
      for (const id of [sd.skill.id, sd.skill2.id, sd.talent.id]) { assert.ok(!ids.has(id), `doppelt: ${id}`); ids.add(id); }
      for (const k of Object.keys(sd.skill2)) assert.ok(KAMPF_KEYS.has(k), `${pid} ${n}: unbekanntes Kampffeld ${k}`);
      for (const k of Object.keys(sd.talent)) assert.ok(WELT_KEYS.has(k), `${pid} ${n}: unbekanntes Weltfeld ${k}`);
      // Nicht übermächtig: zweite Fertigkeit kostet höchstens so viel wie die erste und hat nie mehr als 4 Konzentration
      assert.ok(sd.skill2.cost <= Math.max(sd.skill.cost, 4), `${pid} ${n}: ${sd.skill2.id} zu teuer`);
      // Welt-Fähigkeit hat mindestens eine Wirkung
      assert.ok(['buff', 'calm', 'nerves_gain', 'heal_pct', 'hint', 'review', 'reveal', 'scare', 'clock', 'digest', 'wanted', 'money', 'scout'].some((k) => sd.talent[k] !== undefined), `${pid} ${n}: ${sd.talent.id} ohne Wirkung`);
    }
  }
  const all = faehigkeitenIds(raw);
  assert.equal(all.kampf.length, 90);
  assert.equal(all.welt.length, 90);
  // Geliehene Effekte zeigen auf bestehende Fertigkeiten des eigenen Pfades
  for (const [pid, p] of Object.entries(content.pathways)) {
    const own = new Set(Object.values(p.seqs).map((sd) => sd.skill.id));
    for (const sd of Object.values(p.seqs)) assert.ok(own.has(sd.skill2.fx), `${pid}: fx ${sd.skill2.fx} fremd`);
  }
});

test('Erreichte Sequenzen bringen beide Fertigkeiten ins Kampfmenü, höhere bleiben verborgen', () => {
  const s = beyonder('laterne', 8);
  const ids = Object.keys(s.pathwaySkills());
  assert.deepEqual(ids.sort(), ['dochtfunke', 'funkenregen', 'glutnadel', 'lichtstoss'].sort());
  const c = new Combat(s, 'archive_rats');
  assert.ok(c.skills().find((k) => k.id === 'dochtfunke' && k.pathway === 'laterne'));
  assert.ok(!c.skills().find((k) => k.id === 'signalfeuer'));
  // Welt-Fähigkeiten ebenso
  assert.deepEqual(s.talents().map((t) => t.id), ['laternenschein', 'ruhiges_licht']);
});

test('Kampf: Konzentration zurück, Nerven zurück, Schutz und Heilung für alle, Blutung versiegt', () => {
  const s = beyonder('echo', 6);
  const c = new Combat(s, 'archive_rats');
  c.rng = seeded(1);
  c.ap = 3;
  s.composure = 50;
  c.bleed = { damage: 3, rounds: 2 };
  // Flüstern: 8 Nerven, hits 0
  const r = c.useSkill('fluestern', []);
  assert.equal(s.composure, 58);
  assert.ok(r.effects.includes('+8 Nerven'));
  // Chorschild: Schutz für alle Stehenden + Nerven
  c.useSkill('chorschild', []);
  assert.equal(c.shield, 10);
  assert.equal(s.composure, 63);
  // Riechsalz (Kessel) als Beispiel für cleanse/ap_gain: Spieler wechseln
  const k = beyonder('kessel', 9);
  const ck = new Combat(k, 'archive_rats');
  ck.ap = 1;
  ck.bleed = { damage: 3, rounds: 2 };
  const rk = ck.useSkill('riechsalz', []);
  assert.equal(ck.bleed, null);
  assert.ok(rk.effects.includes('Blutung versiegt'));
  // Dochtfunke (Laterne): kostet 1, gibt 1 zurück
  const l = beyonder('laterne', 9);
  const cl = new Combat(l, 'archive_rats');
  cl.ap = 1;
  cl.useSkill('dochtfunke', ['good']);
  assert.equal(cl.ap, 1);
  // heal_all heilt den Handelnden
  const m = beyonder('sq_moor', 6);
  const cm = new Combat(m, 'archive_rats');
  cm.ap = 6;
  m.hp = 10;
  cm.useSkill('moor_uferhalt', []);
  assert.equal(m.hp, 22);
  assert.equal(cm.shield, 6);
});

test('Kampf: weaken dämpft den Gegner für n Runden, slow dehnt seinen Angriff, read macht ihn parierbar', () => {
  const s = beyonder('faden', 8);
  const c = new Combat(s, 'rook_fight');
  c.rng = seeded(3);
  c.ap = 6;
  // Vorgefühl: slow + read, hits 0
  c.useSkill('vorgefuehl', []);
  assert.equal(c.slowed, true);
  assert.equal(c.readNext, true);
  const plain = new Combat(s, 'rook_fight');
  plain.rng = seeded(3);
  // Beide ziehen die gleiche Attacke (Index 0): die gedehnte kommt später
  const a1 = c.nextEnemyAttack();
  const a0 = plain.nextEnemyAttack();
  assert.equal(a1.slowed, true);
  assert.ok(a1.hits[0] >= a0.hits[0], `${a1.hits[0]} >= ${a0.hits[0]}`);
  assert.equal(a1.readable, true);
  assert.equal(a1.unparryable, false);
  assert.equal(c.slowed, false, 'verbraucht');
  // Danach wieder normal
  c.endEnemyTurn();
  c.endRound();
  assert.equal(c.nextEnemyAttack().slowed, false);

  // weaken: Signalfeuer (Laterne 7) 20 % schwächer, 2 Runden
  const l = beyonder('laterne', 7);
  const cl = new Combat(l, 'rook_fight');
  cl.rng = seeded(3);
  cl.ap = 6;
  const ref = new Combat(l, 'rook_fight');
  ref.rng = seeded(3);
  cl.useSkill('signalfeuer', []);
  const w1 = cl.nextEnemyAttack();
  const r1 = ref.nextEnemyAttack();
  assert.equal(w1.weakened, true);
  assert.ok(w1.damage < r1.damage);
  assert.equal(w1.damage, Math.max(1, Math.round(content.encounters.rook_fight.attacks[0].damage * ENEMY_DMG_MULT * 0.8)));
  cl.endEnemyTurn(); cl.endRound(); ref.endEnemyTurn(); ref.endRound();
  assert.equal(cl.nextEnemyAttack().weakened, true, 'Runde 2 noch gedämpft');
  cl.endEnemyTurn(); cl.endRound();
  assert.equal(cl.weakened, null);
  assert.equal(cl.nextEnemyAttack().weakened, false, 'Runde 3 wieder voll');
});

test('Kampf: focus hebt die Bewertung der nächsten Fertigkeit, Panzer und Schild brechen, Brand verlängert sich, Stehlen nur bei Menschen', () => {
  const s = beyonder('sq_uhr', 7);
  const c = new Combat(s, 'rook_fight');
  c.rng = seeded(5);
  c.ap = 6;
  c.useSkill('uhr_pendel', ['good', 'good']); // focus
  assert.equal(c.focused, true);
  const r = c.useSkill('uhr_vorgriff', ['miss']);
  assert.equal(r.hits[0].grade, 'good', 'Daneben wird zu Treffer');
  assert.equal(c.focused, false);
  // Panzer (armor) und Schild (enemyGuard)
  const e = beyonder('eisen', 7);
  const ce = new Combat(e, 'rook_fight');
  ce.rng = seeded(5);
  ce.ap = 6;
  ce.armor = 2;
  ce.enemyGuard = 20;
  const re = ce.useSkill('klingenbruch', ['good']);
  assert.equal(ce.enemyGuard, 0);
  assert.equal(ce.armor, 1);
  assert.ok(re.effects.some((x) => x.startsWith('Panzer')) && re.effects.includes('Rüstung -1'));
  // Brand verlängern (Laterne 8: Glutnadel)
  const l = beyonder('laterne', 8);
  const cl = new Combat(l, 'archive_rats');
  cl.rng = seeded(5);
  cl.ap = 6;
  cl.useSkill('funkenregen', ['good', 'good', 'good']); // Brand 3 Schaden, 2 Runden
  assert.deepEqual([cl.burn.damage, cl.burn.rounds], [3, 2]);
  cl.useSkill('glutnadel', ['good']); // gleich starker Brand: Runden bleiben, dann +1
  assert.deepEqual([cl.burn.damage, cl.burn.rounds], [3, 3]);
  // Stehlen: Mensch ja, Okkultes nein, Übung nein
  const k = beyonder('schluessel', 9);
  const ck = new Combat(k, 'rook_fight');
  ck.rng = seeded(5);
  ck.ap = 6;
  const money = k.money;
  ck.useSkill('griff_in_die_tasche', ['good']);
  assert.ok(k.money > money, 'Schilling vom Menschen');
  const co = new Combat(k, 'archive_rats'); // Ratten sind nicht okkult, aber die Moorleiche schon
  const occ = Object.entries(content.encounters).find(([, en]) => en.occult && !en.practice && !en.min_seq && en.attacks?.length)[0];
  const cocc = new Combat(k, occ);
  cocc.ap = 6;
  const m2 = k.money;
  cocc.useSkill('griff_in_die_tasche', ['good']);
  assert.equal(k.money, m2, 'nichts von Okkultem');
  assert.ok(co);
});

test('Welt-Fähigkeit: Kosten, Abklingzeit, Buff zählt in passive() und läuft ab, Spielstand bewahrt beides', () => {
  const s = beyonder('maske', 9);
  s.composure = 50;
  assert.equal(s.passive('price'), 0.85); // Sequenz-Passive
  const r = s.useTalent('gefaellige_miene');
  assert.equal(r.ok, true, r.text);
  assert.equal(s.composure, 44);
  assert.equal(s.unruhe, 2);
  assert.ok(Math.abs(s.passive('price') - 0.85 * 0.85) < 1e-9, 'Buff multipliziert sich mit der Passive');
  assert.equal(s.useTalent('gefaellige_miene').ok, false, 'noch nicht bereit');
  assert.match(s.talentBlock('gefaellige_miene'), /bereit/);
  // Spielstand
  const data = JSON.parse(JSON.stringify(s.serialize(null)));
  const t = new GameState(content);
  assert.equal(t.load(data), true);
  assert.ok(Math.abs(t.passive('price') - 0.85 * 0.85) < 1e-9);
  assert.ok(t.talentBlock('gefaellige_miene'));
  // Zeit vergeht: Buff läuft nach 180 s ab, Abklingzeit nach 240 s
  t.tick(181);
  assert.equal(t.passive('price'), 0.85);
  assert.ok(t.talentBlock('gefaellige_miene'));
  t.tick(60);
  assert.equal(t.talentBlock('gefaellige_miene'), null);
  // Zu wenig Nerven
  t.composure = 2;
  assert.match(t.useTalent('gefaellige_miene').text, /Nerven/);
});

test('Welt-Fähigkeit: Spuren sichtbar, Gegner weichen, Uhr steht, Verdauung, Fahndung, Schilling, Hinweis', () => {
  const s = beyonder('laterne', 9);
  assert.equal(s.seesHidden(), false);
  assert.equal(s.useTalent('laternenschein').ok, true);
  assert.equal(s.seesHidden(), true);
  s.tick(21);
  assert.equal(s.seesHidden(), false);
  // Furcht (Laterne 5)
  const l5 = beyonder('laterne', 5);
  l5.useTalent('wandelndes_signal');
  assert.equal(l5.scaresEnemies(), true);
  l5.tick(46);
  assert.equal(l5.scaresEnemies(), false);
  // Uhr anhalten (Uhr 6): Spielzeit der Treffen läuft nicht, Abklingzeiten schon
  const u = beyonder('sq_uhr', 6);
  const pt = u.playTime;
  assert.equal(u.useTalent('uhr_anhalten').ok, true);
  assert.equal(u.clockStopped(), true);
  u.tick(30);
  assert.equal(u.playTime, pt, 'Stadtuhr steht');
  assert.equal(u.talentDef('uhr_anhalten').remaining < 480, true, 'Abklingzeit läuft weiter');
  u.tick(31);
  assert.equal(u.clockStopped(), false);
  u.tick(10);
  assert.ok(u.playTime > pt);
  // Verdauung (Moor 5)
  const m = beyonder('sq_moor', 5);
  m.useTalent('moor_torfgedaechtnis');
  assert.equal(m.pathway.digestion, 8);
  // Fahndung (Maske 8)
  const w = beyonder('maske', 8);
  if (w.policeRules()) {
    w.setWanted(2, 'Test');
    w.useTalent('fremdes_gesicht');
    assert.equal(w.wanted, 1);
  }
  // Schilling (Schlüssel 9), deterministisch
  const k = beyonder('schluessel', 9);
  k.rng = () => 0.5;
  const before = k.money;
  const rk = k.useTalent('muenzen_finden');
  assert.ok(k.money > before && k.money - before >= 4, rk.text);
  // Hinweis (Faden 9) nennt den nächsten Schritt des Hauptauftrags
  const f = beyonder('faden', 9);
  const rf = f.useTalent('spur_lesen');
  const hint = f.nextHint();
  assert.ok(rf.text.includes(hint.text), rf.text);
  // Heilung (Kessel 9) und Beruhigung (Kessel 8)
  const kes = beyonder('kessel', 8);
  kes.hp = 10;
  kes.unruhe = 40;
  kes.useTalent('kraeuterwickel');
  assert.equal(kes.hp, 10 + Math.round(kes.maxHp * 0.2));
  kes.useTalent('beruhigender_sud');
  assert.equal(Math.round(kes.unruhe), 25);
});

test('Welt-Fähigkeit: schnelle Reise wird mit hurry_cost günstiger', () => {
  const s = beyonder('schluessel', 7);
  const base = content.travelRules.modes.schnell.nerves_cost;
  assert.equal(hurryCost(s), base);
  s.composure = 5;
  assert.equal(canHurry(s), false);
  s.composure = s.maxComposure();
  s.useTalent('schattenweg');
  assert.equal(hurryCost(s), 0);
  s.composure = 5;
  assert.equal(canHurry(s), true);
});

test('Zu zweit: Spieler 2 hat eigene Abklingzeiten und Buffs', () => {
  const s = beyonder('maske', 9);
  s.addP2();
  s.withPlayer(2, () => { s.pathway = { id: 'eisen', seq: 7, digestion: 0 }; s.updateMaxHp(); s.composure = 100; });
  assert.equal(s.useTalent('gefaellige_miene').ok, true);
  const r2 = s.withPlayer(2, () => s.useTalent('waffenpflege'));
  assert.equal(r2.ok, true, r2.text);
  assert.equal(s.passive('atk'), 0, 'Spieler 1 ohne Eisen-Buff');
  assert.equal(s.withPlayer(2, () => s.passive('atk')), 5, 'Spieler 2: Passive +2 und Buff +3');
  assert.equal(s.withPlayer(2, () => s.passive('price')), 1, 'Spieler 2 ohne Masken-Buff');
  assert.ok(s.withPlayer(2, () => s.talentBlock('waffenpflege')));
  assert.equal(s.talentBlock('gefaellige_miene') !== null, true);
  // Spielstand hält beides
  const data = JSON.parse(JSON.stringify(s.serialize(null)));
  const t = new GameState(content);
  t.load(data);
  assert.equal(t.withPlayer(2, () => t.passive('atk')), 5);
  assert.ok(Math.abs(t.passive('price') - 0.85 * 0.85) < 1e-9);
});

test('Spielstände ohne Welt-Fähigkeiten laden sauber', () => {
  const s = beyonder('echo', 9);
  const data = JSON.parse(JSON.stringify(s.serialize(null)));
  delete data.talentTime; delete data.talentCd; delete data.buffs; delete data.revealUntil; delete data.scareUntil; delete data.clockFrozen;
  const t = new GameState(content);
  assert.equal(t.load(data), true);
  assert.equal(t.talents().length, 1);
  assert.equal(t.useTalent('lauschen').ok, true);
});

test('SLOW_MULT dehnt sichtbar', () => {
  assert.ok(SLOW_MULT > 1.2 && SLOW_MULT < 1.6);
});
