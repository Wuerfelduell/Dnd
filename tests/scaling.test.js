// Balance der späten Stufen: Sequenz 7 und 6 sind Durchbrüche, Fall 7/8 sind härter als die Fälle davor,
// und zu zweit hält der Gegner mehr aus.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, AP_START, ENEMY_HP_MULT, duoHpMult } from '../src/core/Combat.js';
import { loadContent, fight, EXPERT, SKILLED, SKILLED_HIT } from './helpers.js';

const content = loadContent();

function hero(seq = null, id = 'eisen') {
  const s = new GameState(content);
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem('verband', 3);
  if (seq) {
    s.pathway = { id, seq, digestion: 0 };
    s.updateMaxHp();
    s.hp = s.maxHp;
  }
  return s;
}

test('Durchbrüche: Sequenz 7 und 6 bringen doppeltes Wachstum, Konzentration zu Beginn und mehr Schaden', () => {
  const hp = (seq) => hero(seq).maxHp;
  const step98 = hp(8) - hp(9);
  assert.ok(hp(7) - hp(8) >= 2 * step98, 'Seq 7 wächst doppelt');
  assert.ok(hp(6) - hp(7) >= 2 * step98, 'Seq 6 wächst doppelt');
  assert.equal(new Combat(hero(8), 'miriam').fighters[1].ap, AP_START);
  assert.equal(new Combat(hero(7), 'miriam').fighters[1].ap, AP_START + 1);
  assert.equal(new Combat(hero(6), 'miriam').fighters[1].ap, AP_START + 2);
  const hit = (seq) => new Combat(hero(seq), 'rook_fight').hitDamage(2, 'good');
  assert.ok(hit(7) > hit(8) && hit(6) > hit(7), 'Seq 7 und 6 treffen härter');
  for (const [id, p] of Object.entries(content.pathways)) {
    for (const seq of ['7', '6']) {
      const keys = p.seqs[seq].passives.map((x) => x.key);
      assert.ok(keys.includes('ap_start') && keys.includes('dmg_mult'), `${id} Seq ${seq}: Durchbruch fehlt`);
    }
  }
});

test('Fall 7/8: Gegner halten mehr aus als in den Fällen davor', () => {
  const E = content.encounters;
  // Zähigkeit: Leben plus Panzer (jeder Punkt Panzer nimmt jedem Treffer etwas, über einen Kampf etwa 8 Leben wert)
  const tough = (id) => E[id].hp + 8 * (E[id].armor ?? 0);
  const early = ['miriam', 'dreizehnter_gast', 'bronzeengel', 'felix_fight', 'rook_fight'];
  const maxEarly = Math.max(...early.map(tough));
  assert.ok(tough('miss_wren') > maxEarly + 8, 'Miss Wren ist der zäheste Boss bis Fall 8');
  const normals = ['gasgeist', 'schlachtergehilfe', 'chorwaechter', 'stimmenfresser', 'negativ_geist', 'silberbad_schleim'];
  assert.ok(tough('traumfaden') > Math.max(...normals.map(tough)), 'Traumfäden zäher als jeder normale Gegner davor');
  for (const id of ['ertrunkener', 'pfandeintreiber']) assert.ok(E[id].hp >= 60, id);
});

test('Fall 9: Starling ist der härteste Boss von Kapitel 1, härter als Miss Wren', () => {
  const E = content.encounters;
  assert.ok(E.starling_fight.hp > E.miss_wren.hp);
  assert.ok(E.sternlicht.hp > E.traumfaden.hp);
  const maxHit = (id) => Math.max(...E[id].attacks.map((a) => a.damage ?? 0));
  assert.ok(maxHit('starling_fight') > maxHit('miss_wren'));
  for (const seq of [null, 8]) assert.equal(fight(hero(seq), 'starling_fight', { defend: EXPERT, healBelow: 15 }).result.outcome, 'lost', `Seq ${seq ?? 'ohne'}`);
  // Mit Durchbruch zu schaffen, aber es bleibt knapper als bei Wren
  const wren = hero(7); const star = hero(7);
  assert.equal(fight(wren, 'miss_wren', { defend: SKILLED, skill: 'klingenwirbel', healBelow: 15 }).result.outcome, 'won');
  assert.equal(fight(star, 'starling_fight', { defend: SKILLED, skill: 'klingenwirbel', healBelow: 15 }).result.outcome, 'won');
});

test('Fall 7/8: ohne Durchbruch verliert man gegen Miss Wren, mit Sequenz 7 gewinnt man', () => {
  for (const seq of [null, 8]) {
    const { result } = fight(hero(seq), 'miss_wren', { defend: EXPERT, healBelow: 15 });
    assert.equal(result.outcome, 'lost', `Seq ${seq ?? 'ohne'} sollte verlieren`);
  }
  for (const seq of [7, 6]) {
    const { result } = fight(hero(seq), 'miss_wren', { defend: SKILLED, skill: 'klingenwirbel', healBelow: 15 });
    assert.equal(result.outcome, 'won', `Seq ${seq} sollte gewinnen`);
  }
});

test('Zu zweit: der Gegner hält mehr aus', () => {
  const s = hero();
  s.addP2();
  const c = new Combat(s, 'miss_wren');
  assert.equal(c.enemy.maxHp, Math.round(content.encounters.miss_wren.hp * ENEMY_HP_MULT * duoHpMult(s)));
  assert.ok(c.enemy.maxHp > new Combat(hero(), 'miss_wren').enemy.maxHp * 1.4);
  assert.equal(new Combat(hero(), 'miss_wren').enemy.maxHp, Math.round(content.encounters.miss_wren.hp * ENEMY_HP_MULT));
  // Übungskämpfe bleiben gleich
  assert.equal(new Combat(s, 'sparring').enemy.maxHp, content.encounters.sparring.hp);
});

test('Kurve: die Bosse werden von Fall zu Fall zäher', () => {
  const E = content.encounters;
  // Fall 2, 3, 5, 6, 8, 9 (Felix in Fall 4 ist schwächer, dafür ist man dort erst Seq 9)
  const order = ['ash_warden', 'rook_fight', 'miriam', 'dreizehnter_gast', 'miss_wren', 'starling_fight'];
  for (let i = 1; i < order.length; i++) assert.ok(E[order[i]].hp >= E[order[i - 1]].hp, `${order[i]} mindestens so zäh wie ${order[i - 1]}`);
});

// Sequenz-Schranke: die Enden der Kapitel verlangen eine Mindest-Sequenz (Seb: Kapitel 1 nicht mit Seq 8, Kapitel 2 nur mit Seq 5)
const GATES = [
  ['starling_fight', 7, 'revolver', 2],
  ['namenlose', 6, 'ossuarklinge', 4],
  ['leuchtfeuer', 5, 'ossuarklinge', 5], // für den Endkampf nimmt man alles mit, was man hat
];
for (const [boss, min, weapon, tonics] of GATES) {
  test(`Sequenz-Schranke: ${boss} nur ab Sequenz ${min}, für jeden Pfad`, () => {
    assert.equal(content.encounters[boss].min_seq, min);
    const armed = (pid, seq) => {
      const s = hero(seq, pid);
      s.addItem(weapon);
      s.equip(weapon);
      s.addItem('tonikum', tonics);
      return s;
    };
    for (const pid of Object.keys(content.pathways)) {
      const skills = [...Object.keys(armed(pid, min).pathwaySkills()), 'attack', 'double']; // Doppelschlag hat jeder
      const best = (seq, defend) => skills.some((skill) => fight(armed(pid, seq), boss, { defend, attack: SKILLED_HIT, skill, healBelow: 18 }).result.outcome === 'won');
      assert.equal(best(min + 1, EXPERT), false, `${pid}: mit Sequenz ${min + 1} darf man ${boss} nicht schaffen`);
      assert.equal(best(min, SKILLED), true, `${pid}: mit Sequenz ${min} schafft man ${boss}`);
    }
  });
}

test('Sequenz 5 ist der große Durchbruch: mehr Leben, mehr Schaden, weniger Schaden genommen', () => {
  for (const [id, p] of Object.entries(content.pathways)) {
    const keys = p.seqs['5'].passives.map((x) => x.key);
    for (const k of ['ap_start', 'dmg_mult', 'damage_taken']) assert.ok(keys.includes(k), `${id} Seq 5: ${k} fehlt`);
  }
  assert.ok(hero(5).maxHp - hero(6).maxHp >= 3 * (hero(8).maxHp - hero(9).maxHp), 'Seq 5 wächst dreifach');
});
