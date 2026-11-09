// Kampfregeln, Leben und Inventar: `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, judgeDefense, judgeTiming, WINDOW, ENEMY_HP_MULT, ENEMY_DMG_MULT, DODGE_COST, RING_CURVES } from '../src/core/Combat.js';
import { loadContent, fight, SKILLED, EXPERT, seeded } from './helpers.js';

const content = loadContent();
const fresh = () => new GameState(content);

test('Timing: Parade eng, Ausweichen großzügig, zu früh ist daneben', () => {
  assert.equal(judgeDefense('parry', 0), 'parry');
  assert.equal(judgeDefense('parry', WINDOW.parry + 1), 'miss');
  assert.equal(judgeDefense('dodge', -WINDOW.dodge), 'dodge');
  assert.equal(judgeDefense('dodge', -WINDOW.dodge - 50), 'miss');
  const zone = { center: 0.6, perfect: 0.05, good: 0.12 };
  assert.equal(judgeTiming(0.62, zone), 'perfect');
  assert.equal(judgeTiming(0.7, zone), 'good');
  assert.equal(judgeTiming(0.9, zone), 'miss');
  assert.equal(judgeTiming(null, zone), 'miss');
});

test('Startausrüstung, Heilen, Ausrüsten und Gegenstände benutzen', () => {
  const s = fresh();
  assert.equal(s.hp, 40);
  assert.equal(s.weapon, 'spazierstock');
  assert.equal(s.itemCount('verband'), 2);
  assert.equal(s.useItem('verband'), 'Du bist unverletzt.');
  s.damage(20);
  assert.match(s.useItem('verband'), /\+12 Leben/);
  assert.equal(s.hp, 32);
  assert.equal(s.itemCount('verband'), 1);
  s.applyEffects({ gives_items: { schlagstock: 1, bannsalz: 1 } });
  assert.equal(s.weapon, 'schlagstock', 'bessere Waffe wird angelegt');
  assert.match(s.useItem('bannsalz'), /nur im Kampf/);
  assert.ok(s.equip('spazierstock'));
  assert.ok(s.meets({ requires_items: ['bannsalz'] }));
  assert.ok(!s.meets({ hide_if_items: ['bannsalz'] }));
});

test('Spielstand enthält Leben und Inventar, alte Stände laden weiter', () => {
  const s = fresh();
  s.damage(15);
  s.applyEffects({ gives_items: { tonikum: 2 } });
  const t = fresh();
  assert.ok(t.load(JSON.parse(JSON.stringify(s.serialize(null)))));
  assert.equal(t.hp, 25);
  assert.equal(t.itemCount('tonikum'), 2);
  const old = { ...s.serialize(null), v: 2 };
  delete old.hp; delete old.inventory;
  assert.ok(t.load(old));
  assert.equal(t.hp, 40);
  assert.equal(t.itemCount('verband'), 2);
});

test('Parade gibt Konzentration und Konter, Treffer kosten Leben', () => {
  const s = fresh();
  const c = new Combat(s, 'fog_hound');
  const atk = c.nextEnemyAttack();
  const hp = c.enemy.hp;
  const r = c.resolveHit(atk, 'parry');
  assert.equal(r.damage, 0);
  assert.ok(c.enemy.hp < hp);
  assert.equal(c.ap, 2);
  c.resolveHit(atk, 'miss');
  assert.equal(s.hp, 40 - atk.damage);
  assert.equal(c.resolveHit(atk, 'dodge').damage, 0);
});

test('Präziser Angriff macht mehr Schaden und bringt mehr Konzentration', () => {
  const a = new Combat(fresh(), 'fog_hound');
  const b = new Combat(fresh(), 'fog_hound');
  const ra = a.useSkill('attack', ['perfect']);
  const rb = b.useSkill('attack', ['miss']);
  assert.ok(ra.total > rb.total);
  assert.equal(a.ap, 3);
  assert.equal(b.ap, 2);
  assert.throws(() => b.useSkill('ward', ['good']), /nicht möglich/);
});

test('Laternenblende lässt den Gegner aussetzen, Bannwort kostet Nerven', () => {
  const s = fresh();
  const c = new Combat(s, 'ash_warden');
  c.ap = 6;
  assert.ok(c.useSkill('blind', ['good']).stunned);
  assert.equal(c.nextEnemyAttack(), null);
  assert.ok(c.nextEnemyAttack());
  const before = s.composure;
  const r = c.useSkill('ward', ['good']);
  assert.equal(r.total, 24, 'doppelt gegen Okkultes');
  assert.equal(s.composure, before - 15);
});

test('Wissen aus den Ermittlungen deckt Schwachstellen auf', () => {
  const s = fresh();
  assert.ok(!new Combat(s, 'ash_warden').weak);
  s.flags.add('box_destroyed');
  const c = new Combat(s, 'ash_warden');
  assert.ok(c.weak);
  assert.ok(c.useSkill('attack', ['good']).total > new Combat(fresh(), 'ash_warden').useSkill('attack', ['good']).total);
});

test('Übungskampf: kein Schaden bleibt, erster Sieg gibt eine Belohnung', () => {
  const s = fresh();
  const honor = s.honor;
  const { result } = fight(s, 'sparring', { defend: (i) => (i % 2 ? 'miss' : 'dodge') });
  assert.equal(result.outcome, 'won');
  assert.equal(s.hp, 40, 'Leben nach Übung wiederhergestellt');
  assert.equal(s.itemCount('verband'), 3);
  assert.equal(s.honor, honor + 2);
  fight(s, 'sparring');
  assert.equal(s.itemCount('verband'), 3, 'Belohnung nur einmal');
});

test('Niederlage: Ohnmacht mit wenig Leben, im Wächterkampf zurück an die Treppe', () => {
  const s = fresh();
  const { result } = fight(s, 'ash_warden', { attack: 'miss', defend: () => 'miss' });
  assert.equal(result.outcome, 'lost');
  assert.equal(s.hp, 16);
  assert.deepEqual(result.travel, { map: 'ebba', spawn: 'altar' });
  assert.ok(!s.flags.has('warden_defeated'));
});

const LATE = ['choir_zealots', 'rook_fight', 'gasgeist', 'felix_fight', 'uhrwerkwaechter', 'kanalkroete', 'maskenspieler', 'schlachtergehilfe',
  'chorwaechter', 'stimmenfresser', 'bronzeengel', 'glockenecho', 'miriam', 'schattenabzug', 'negativ_geist', 'silberbad_schleim', 'dreizehnter_gast', 'pratt_fight', // Fall 5/6
  'ertrunkener', 'pfandeintreiber', 'traumfaden', 'miss_wren', // Fall 7/8
  ...Object.keys(content.encounters).filter((id) => content.encounters[id].faction)]; // Sekten kommen nach Fall 2/3

const BOSSES = ['ash_warden', 'rook_fight', 'felix_fight', 'mirror_shade', 'fog_hound', 'rost_schmied', 'rost_vater', 'schleier_seherin', 'schleier_mutter',
  'bronzeengel', 'miriam', 'dreizehnter_gast', 'traumfaden', 'miss_wren'];

test('Balance: Geübte Spieler (Bosse: sehr Geübte) schaffen mit Startausrüstung jeden Kampf', () => {
  // Wer von drei Schlägen einem ausweicht, einen pariert und unter 15 Leben verbindet, gewinnt.
  // Vor dem Aschewächter gibt Küster Anselm zwei Beutel Bannsalz.
  for (const [id, enc] of Object.entries(content.encounters)) {
    if (enc.wild) continue; // Gefahrengebiete brauchen bessere Ausrüstung (tests/wilds.test.js)
    const s = fresh();
    const items = id === 'ash_warden' ? ['bannsalz', 'bannsalz'] : [];
    if (items.length) s.addItem('bannsalz', 2);
    // Ab Fall 3 hat man längst den Dienstschlagstock von Holt.
    if (LATE.includes(id)) s.addItem('schlagstock');
    // Bosse der Geschichte verlangen sauberes Timing
    const defend = BOSSES.includes(id) ? EXPERT : SKILLED;
    const { result, combat } = fight(s, id, { defend, items, healBelow: 15 });
    assert.equal(result.outcome, 'won', `${id}: verloren in Runde ${combat.round}`);
  }
});

test('Balance: Wer nur jedem zweiten Schlag ausweicht, verliert gegen die harten Gegner', () => {
  for (const id of ['ash_warden', 'rook_fight', 'felix_fight', 'rost_schmied', 'rost_vater', 'schleier_mutter']) {
    const s = fresh();
    if (id === 'ash_warden') s.addItem('bannsalz', 2);
    if (LATE.includes(id)) s.addItem('schlagstock');
    const { result } = fight(s, id, { defend: (i) => (i % 2 ? 'miss' : 'dodge'), items: id === 'ash_warden' ? ['bannsalz', 'bannsalz'] : [], healBelow: 15 });
    assert.equal(result.outcome, 'lost', id);
  }
});

test('Härtere Kämpfe: nicht parierbare Angriffe, Ausweichen kostet Nerven, Zufallstakt, Rage', () => {
  const s = fresh();
  const c = new Combat(s, 'fog_hound');
  assert.equal(c.enemy.maxHp, Math.round(34 * ENEMY_HP_MULT));
  // Die härteste Einzelattacke („Lauern ... Biss“) ist nicht parierbar
  c.attackIndex = 2;
  const bite = c.nextEnemyAttack();
  assert.equal(bite.unparryable, true);
  assert.equal(bite.damage, Math.round(9 * ENEMY_DMG_MULT));
  const r = c.resolveHit(bite, 'parry');
  assert.equal(r.result, 'miss');
  assert.equal(r.note, 'unparryable');
  // Ausweichen kostet Nerven, ohne Nerven klappt es nicht
  const n = s.composure;
  assert.equal(c.resolveHit(bite, 'dodge').result, 'dodge');
  assert.equal(s.composure, n - DODGE_COST);
  s.setComposure(1);
  assert.equal(c.resolveHit(bite, 'dodge').note, 'exhausted');
  // Takt schwankt, Schläge bleiben spielbar
  const times = new Set();
  for (let i = 0; i < 6; i++) { c.attackIndex = 1; times.add(c.nextEnemyAttack().hits.join(',')); }
  assert.ok(times.size > 1, 'Takt ist nicht immer gleich');
  // Rage unter 40 % Leben
  c.enemy.hp = 5;
  c.attackIndex = 0;
  const raged = c.nextEnemyAttack();
  assert.equal(raged.enraged, true);
  assert.ok(raged.damage > Math.round(6 * ENEMY_DMG_MULT));
  // Übungskämpfe bleiben mild
  const p = new Combat(fresh(), 'sparring');
  assert.equal(p.enemy.maxHp, 34);
});

test('Balance: Wer nur einsteckt, verliert gegen den Aschewächter', () => {
  const { result } = fight(fresh(), 'ash_warden', { defend: () => 'miss' });
  assert.equal(result.outcome, 'lost');
});

test('Nebelhund: Sieg erledigt den Auftrag und bringt Belohnungen', () => {
  const s = fresh();
  s.startQuest('fog_hound');
  fight(s, 'fog_hound', { attack: 'perfect', defend: () => 'parry' });
  assert.equal(s.quests.fog_hound, 'done');
  assert.ok(s.flags.has('hound_defeated'));
  assert.equal(s.itemCount('bannsalz'), 1);
});

test('Noch härter: wechselndes Ringtempo, engeres Parieren bei Eliten, Panzer, schwächere Konter', () => {
  // Ringkurven: Start offen, Einschlag geschlossen, dazwischen unterschiedlich schnell
  for (const [name, f] of Object.entries(RING_CURVES)) {
    assert.equal(f(0), 0, name);
    assert.ok(Math.abs(f(1) - 1) < 1e-9, name);
  }
  assert.ok(RING_CURVES.schnell_langsam(0.3) > 0.5 && RING_CURVES.langsam_schnell(0.3) < 0.1);
  assert.ok(RING_CURVES.finte(0.65) < RING_CURVES.finte(0.45), 'Finte zuckt zurück');
  const s = fresh();
  const c = new Combat(s, 'fog_hound');
  c.rng = seeded(3);
  const atk = c.nextEnemyAttack();
  assert.equal(atk.rings.length, atk.hits.length);
  assert.ok(atk.rings.every((r) => RING_CURVES[r.curve] && r.lead >= 560 && r.lead <= 920));
  // Übung bleibt gleichmäßig
  const p = new Combat(fresh(), 'sparring');
  assert.ok(p.nextEnemyAttack().rings.every((r) => r.curve === 'linear'));
  // Eliten: engeres Parierfenster, Panzer
  const elite = new Combat(fresh(), 'kerzenfresser_elite');
  assert.ok(elite.parryWindow() < c.parryWindow());
  assert.ok(elite.armor >= 1);
  const hp = elite.enemy.hp;
  elite.hurtEnemy(10);
  assert.equal(elite.enemy.hp, hp - (10 - elite.armor));
  assert.equal(judgeDefense('parry', 70, 1, elite.parryWindow()), 'miss');
  assert.equal(judgeDefense('parry', 70), 'parry');
  // Konter nach Parade ist klein
  const r = c.resolveHit({ ...atk, unparryable: false }, 'parry');
  assert.ok(r.counter <= Math.ceil(s.weaponStats().atk * 0.3) + 1, `Konter ${r.counter}`);
});
