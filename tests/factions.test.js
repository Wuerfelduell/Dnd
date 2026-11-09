// Sektenfraktionen: Rostbrüder und Schleierschwestern über die echten Dialoge, Objekte und Kämpfe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { loadContent, talk, use, fight, SKILLED } from './helpers.js';

const content = loadContent();
const WIN = { defend: SKILLED, healBelow: 15 };

/** Zustand nach Fall 3: Kanalhafen und Altmarkt sind bekannt. */
function afterCase3() {
  const s = new GameState(content);
  s.honor = 40;
  ['briefed_01', 'travel_ashgrove', 'travel_ebba', 'travel_docks', 'case_01_closed', 'case_02_closed', 'case_03_closed'].forEach((f) => s.flags.add(f));
  s.addItem('schlagstock');
  s.equip('schlagstock');
  s.addItem('tonikum', 3);
  return s;
}

const canTravel = (s, map) => content.travel.some((t) => t.map === map && s.meets(t));
const won = (s, id) => assert.equal(fight(s, id, WIN).result.outcome, 'won', id);

test('Fraktionen: Daten vollständig, Gegner gehören zu einer Fraktion mit Rängen', () => {
  assert.deepEqual(Object.keys(content.factions).sort(), ['rostbrueder', 'schleierschwestern']);
  for (const f of Object.values(content.factions)) {
    assert.equal(f.ranks.length, 4);
    assert.ok(content.pathways[f.pathway], f.pathway);
  }
  const members = Object.values(content.encounters).filter((e) => e.faction);
  assert.equal(members.length, 10);
  // Jeder Sektengegner hat mindestens einen Kniff (Pfad-Fähigkeit)
  for (const e of members) assert.ok(e.attacks.some((a) => a.action), e.name);
});

test('Kampf: Panzer, Schleier, Blutung und Einschüchterung wirken', () => {
  const s = afterCase3();
  const c = new Combat(s, 'rost_vater');
  // Panzer fängt Schaden ab
  c.enemyAct({ name: 'Eisenschwur', action: 'guard', value: 6 });
  const hp = c.enemy.hp;
  const r = c.useSkill('attack', ['good']);
  assert.equal(c.enemyGuard, 0);
  assert.equal(r.total, Math.max(0, s.weaponStats().atk - 6));
  assert.equal(c.enemy.hp, hp - r.total);
  // Blutung: nach einem Treffer verliert man am Rundenende Leben
  const brecher = c.prepareAttack(content.encounters.rost_vater.attacks.find((a) => a.bleed));
  c.resolveHit(brecher, 'miss');
  assert.ok(c.bleed);
  const before = s.hp;
  c.endRound();
  assert.equal(c.bleedTick, 2);
  assert.equal(s.hp, before - 2);
  // Schleier: nur präzise Treffer zählen
  const v = new Combat(s, 'schleier_mutter');
  v.enemyAct({ name: 'Tausend Gesichter', action: 'veil' });
  assert.equal(v.useSkill('attack', ['good']).total, 0);
  assert.equal(v.veiled, false);
  v.enemyAct({ name: 'Tausend Gesichter', action: 'veil' });
  assert.ok(v.useSkill('attack', ['perfect']).total > 0);
  // Einschüchterung kostet Nerven, Heilung gibt Leben zurück
  const n = s.composure;
  v.enemyAct({ name: 'Lügenlied', action: 'taunt', value: 12 });
  assert.equal(s.composure, Math.max(0, n - 12));
  v.enemy.hp -= 10;
  v.enemyAct({ name: 'Neues Gesicht', action: 'heal', value: 6 });
  assert.equal(v.lastAction.action, 'heal');
  // Kniffe kommen in der Reihenfolge der Daten und ersetzen den Angriff dieser Runde
  const k = new Combat(s, 'rost_schlaeger');
  k.attackIndex = 2;
  assert.equal(k.nextEnemyAttack(), null);
  assert.equal(k.lastAction.name, 'Rostwasser');
  assert.equal(k.enemyGuard, 6);
});

test('Rostbrüder: Kettengeld, Kapelle, Harn ergibt sich mit Beweis gegen Vey', () => {
  const s = afterCase3();
  assert.ok(canTravel(s, 'ankerhof'));
  assert.equal(use(s, 'ankerhof', 'kapelle'), 'locked');
  use(s, 'ankerhof', 'notice');
  assert.equal(s.factStatus('drunk_brawlers'), 'suspected');
  talk(s, 'jory', ['Arm']);
  assert.equal(s.quests.rost_im_hafen, 'active');
  use(s, 'ankerhof', 'chalk');
  assert.equal(s.factStatus('rost_tribute'), 'likely');
  assert.equal(s.factStatus('drunk_brawlers'), 'refuted');
  talk(s, 'jory', ['Wo treffen']);
  use(s, 'ankerhof', 'rust');
  assert.equal(s.factStatus('rost_hideout'), 'likely');
  won(s, 'rost_schlaeger');
  assert.equal(use(s, 'ankerhof', 'kapelle'), 'ok');
  won(s, 'rost_werfer');
  s.applyEffects({ sets_flags: ['forge_doused'] }); // Löscheimer
  use(s, 'rostkapelle', 'book');
  const smith = fight(s, 'rost_schmied', WIN);
  assert.ok(smith.combat.weak, 'gelöschte Esse schwächt Bellamy');
  assert.equal(smith.result.outcome, 'won');
  assert.ok(s.hasClue('schmied_grumble'));
  use(s, 'rostkapelle', 'slip');
  assert.equal(s.factStatus('vey_unpaid'), 'likely');
  assert.equal(s.combine('rost_tribute', 'vey_unpaid').result, 'new');
  talk(s, 'harn', ['Vey hat euch', 'Gib auf']);
  assert.ok(s.flags.has('rost_broken') && s.flags.has('knows_vey_cage'));
  assert.equal(s.itemCount('rostanker'), 1);
  talk(s, 'jory', ['erledigt']);
  assert.equal(s.quests.rost_im_hafen, 'done');
});

test('Rostbrüder: Harn im Kampf besiegen geht auch ohne Beweis', () => {
  const s = afterCase3();
  ['rost_guard_down', 'rost_werfer_down', 'schmied_down'].forEach((f) => s.flags.add(f));
  s.startQuest('rost_im_hafen');
  talk(s, 'harn', ['Kettengeld hört auf']);
  assert.equal(s.flags.has('knows_vey_cage'), false);
  const { combat, result } = fight(s, 'rost_vater', WIN);
  assert.equal(combat.weak, false);
  assert.equal(result.outcome, 'won');
  assert.ok(s.flags.has('rost_broken'));
  assert.equal(s.itemCount('ankerhaken'), 1, 'Harns Haken als Beute');
});

test('Schleierschwestern: falsche Tilly, Putzmacherei, echte Tilly befreit', () => {
  const s = afterCase3();
  assert.ok(canTravel(s, 'haus_morrow'));
  assert.equal(canTravel(s, 'schleierhaus'), false);
  talk(s, 'lavinia', ['Polizei gerufen']);
  assert.equal(s.quests.graue_schleier, 'active');
  use(s, 'haus_morrow', 'note');
  assert.equal(s.factStatus('tilly_thief'), 'suspected');
  use(s, 'haus_morrow', 'shard');
  assert.equal(s.factStatus('tilly_replaced'), 'likely');
  assert.equal(s.factStatus('tilly_thief'), 'refuted');
  talk(s, 'fake_tilly', ['Wer bist du']);
  won(s, 'schleier_novizin');
  talk(s, 'lavinia', ['donnerstags']);
  assert.equal(s.factStatus('schleier_house'), 'likely');
  assert.ok(canTravel(s, 'schleierhaus'));
  assert.equal(use(s, 'schleierhaus', 'workshop'), 'locked');
  talk(s, 'grau', ['Tilly Brooks']);
  won(s, 'schleier_messerin');
  assert.equal(use(s, 'schleierhaus', 'workshop'), 'ok');
  s.applyEffects({ sets_flags: ['mirrors_broken'] }); // Spiegelwand
  const seer = fight(s, 'schleier_seherin', WIN);
  assert.ok(seer.combat.weak);
  assert.equal(seer.result.outcome, 'won');
  use(s, 'schleierhaus', 'ledger');
  assert.equal(s.factStatus('veil_in_police'), 'likely');
  assert.equal(s.combine('veil_in_police', 'schleier_house').result, 'new');
  s.applyEffects({ sets_flags: ['faces_burned'] }); // Gesichterbuch
  talk(s, 'ysolde', ['vorbei']);
  const boss = fight(s, 'schleier_mutter', WIN);
  assert.ok(boss.combat.weak);
  assert.equal(boss.result.outcome, 'won');
  assert.equal(s.itemCount('schleierdolch'), 1);
  talk(s, 'tilly_cellar', ['nach Hause']);
  talk(s, 'lavinia', ['Die echte']);
  assert.equal(s.quests.graue_schleier, 'done');
});

test('Schleierschwestern: Handel mit Ysolde verrät Veys Versteck, kostet aber Ansehen', () => {
  const s = afterCase3();
  ['messerin_down', 'seherin_down'].forEach((f) => s.flags.add(f));
  s.startQuest('graue_schleier');
  const honor = s.honor;
  talk(s, 'ysolde', ['Miriam Vey', 'Abgemacht']);
  assert.ok(s.flags.has('knows_vey_hideout') && s.flags.has('ysolde_resolved'));
  assert.equal(s.honor, honor - 3);
  assert.equal(s.itemCount('porzellanmaske'), 1);
});

test('Schleierschwestern: wer der Polizei glaubt, verliert den Auftrag', () => {
  const s = afterCase3();
  talk(s, 'lavinia', ['Polizei gerufen']);
  use(s, 'haus_morrow', 'note');
  talk(s, 'lavinia', ['Polizei hat recht']);
  assert.equal(s.quests.graue_schleier, 'failed');
  assert.equal(canTravel(s, 'schleierhaus'), false);
});
