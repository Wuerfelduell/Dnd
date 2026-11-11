// Kapitel 2 (Wexmoor) ist hart: Kettlegate war das Tutorial. Man kommt mit Sequenz 7 an, ist bis zur
// Namenlosen Sequenz 6 und für das Leuchtfeuer Sequenz 5. Normale Gegner kosten Geübte spürbar Leben,
// Eliten und Bosse schafft nur, wer fast jeden Schlag liest, und halbe Deckung verliert.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, ENEMY_HP_MULT, ENEMY_DMG_MULT, DUO_DMG_MULT } from '../src/core/Combat.js';
import { travelFast } from '../src/core/Travel.js';
import { loadContent, fight, seeded, EXPERT, SKILLED } from './helpers.js';

const content = loadContent();
const WX = Object.entries(content.encounters).filter(([, e]) => e.wild && e.zone.startsWith('wx_'));
// Ab Fall 5 hat man die Ossuarklinge aus den Katakomben; in Wexmoor rechnet niemand mehr mit weniger
const GEAR = { 2: 'ossuarklinge', 3: 'ossuarklinge', 4: 'ossuarklinge' };
const HALF = (i) => (i % 2 ? 'miss' : 'dodge');
const FLAWLESS = (i) => ['dodge', 'parry', 'dodge', 'parry', 'parry'][i % 5]; // liest jeden Schlag
/** Geübte Spielweise in Kapitel 2: die Pfad-Fertigkeit verkettet, dann der Angriff (siehe fall4_haerte.test.js) */
const PLAY = (defend, seq = 7, skill = 'wuchtschlag') => ({ defend, skill, chain: true, healBelow: 18 });

/** Ermittler in Wexmoor: Sequenz 7 (nach Kapitel 1), Waffe der Gefahrenstufe, ein paar Tränke. */
function hero(tier, seq = 7, id = 'eisen') {
  const s = new GameState(content);
  s.map = 'wx_torfstich';
  s.flags.add('kapitel1_done');
  s.flags.add('k2_arrived');
  const w = GEAR[Math.min(4, tier)];
  s.addItem(w);
  s.equip(w);
  s.addItem('tonikum', tier);
  s.addItem('verband', 2);
  s.pathway = { id, seq, digestion: 0 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  return s;
}
const tierOf = (e) => Math.min(4, content.zones[e.zone].tier + (e.boss ? 1 : 0));
const seqOf = (e) => e.min_seq ?? 7;

test('Wexmoor: Geübte schaffen normale Gegner, verlieren dabei aber Leben; halbe Deckung reicht nirgends', () => {
  for (const [id, e] of WX) {
    if (e.elite || e.boss) continue;
    const s = hero(tierOf(e));
    const { result, combat } = fight(s, id, PLAY(SKILLED));
    assert.equal(result.outcome, 'won', `${id}: verloren in Runde ${combat.round}`);
    const h = hero(tierOf(e));
    const half = fight(h, id, { defend: HALF, healBelow: 0 }); // wer nur halb deckt, verkettet auch nichts
    assert.ok(half.result.outcome === 'lost' || h.hp < h.maxHp * 0.6, `${id}: mit halber Deckung kommt man nicht ungeschoren davon (${h.hp}/${h.maxHp})`);
  }
});

test('Wexmoor: Eliten und Bosse schafft nur, wer fast jeden Schlag liest; halbe Deckung verliert', () => {
  for (const [id, e] of WX) {
    if (!(e.elite || e.boss)) continue;
    const s = hero(tierOf(e), seqOf(e));
    const { result, combat } = fight(s, id, PLAY(EXPERT, seqOf(e)));
    // Die Eliten der Torfbrüche (Gefahr ☠☠☠) verlangen mehr: wer dort einen von fünf Schlägen kassiert, kann verlieren
    const flawless = e.elite && content.zones[e.zone].tier >= 3 && result.outcome !== 'won' ? fight(hero(tierOf(e), seqOf(e)), id, PLAY(FLAWLESS, seqOf(e))) : null;
    assert.ok(result.outcome === 'won' || flawless?.result.outcome === 'won', `${id}: verloren in Runde ${combat.round}`);
    assert.ok(s.hp < s.maxHp || combat.round <= 3, `${id}: auch Könner verlieren Leben, wenn der Kampf länger dauert`);
    assert.equal(fight(hero(tierOf(e), seqOf(e)), id, PLAY(HALF, seqOf(e))).result.outcome, 'lost', `${id}: halbe Deckung`);
  }
});

test('Wexmoor: Bosse sind zäher als alles in Kettlegate, mit Panzer und Kniffen; das Leuchtfeuer ist der härteste', () => {
  const E = content.encounters;
  const k1 = Math.max(E.starling_fight.hp, E.miss_wren.hp, E.sternhirsch.hp);
  for (const [id, e] of WX) {
    if (!e.boss) continue;
    assert.ok(e.hp > k1, `${id}: ${e.hp} Leben, Kapitel 1 höchstens ${k1}`);
    assert.ok(e.armor >= 3, `${id}: Panzer`);
    assert.ok(e.ramp >= 0.03, `${id}: wird mit jeder Runde härter`);
    assert.ok(e.attacks.some((a) => a.action), `${id}: hat einen Kniff`);
    assert.ok(e.hp <= E.leuchtfeuer.hp, `${id}: das Leuchtfeuer bleibt der härteste`);
  }
  const maxHit = (id) => Math.max(...E[id].attacks.map((a) => a.damage ?? 0));
  assert.ok(maxHit('leuchtfeuer') > maxHit('starling_fight') && maxHit('namenlose') > maxHit('starling_fight'));
  // Geübte (nicht Könner) scheitern an den Bossen von Wexmoor
  for (const id of ['glockenmutter', 'buergermeister', 'moorbraut']) assert.equal(fight(hero(4), id, PLAY(SKILLED)).result.outcome, 'lost', id);
});

test('Wexmoor: Einzelgänger und Price halten mehr aus als jeder Mensch in Kettlegate', () => {
  const E = content.encounters;
  for (const id of Object.keys(content.loners.list).filter((x) => !x.startsWith('ez_ds_'))) { // Dunscar hat seine eigene Balance
    assert.ok(E[id].hp >= 120 && E[id].armor >= 2 && E[id].ramp > 0, id);
    assert.ok(E[id].attacks.find((a) => a.action === 'taunt').value >= 12, `${id}: Wut kostet Nerven`);
  }
  assert.ok(E.price_wx_fight.hp > E.rook_fight.hp);
});

test('Das Moor zehrt: in den Gebieten von Wexmoor kosten die Runden Nerven, in Kettlegate nicht', () => {
  for (const [zid, z] of Object.entries(content.zones)) assert.equal(z.drain > 0, zid.startsWith('wx_'), zid);
  const s = hero(3);
  const c = new Combat(s, 'salzgeist');
  c.rng = seeded(1);
  c.useSkill('attack', ['good']);
  const before = s.composure; // nach dem Angriff (der bringt Nerven zurück), vor dem Rundenende
  c.endRound();
  assert.equal(before - s.composure, content.zones.wx_salzwatt.drain);
  assert.equal(c.drainTick, content.zones.wx_salzwatt.drain);
  const k = new Combat(hero(3), 'schnabelmaske');
  k.useSkill('attack', ['good']);
  k.endRound();
  assert.equal(k.drainTick, 0);
  // Übungskämpfe zehren nicht
  assert.equal(new Combat(hero(3), 'sparring').drain, 0);
});

test('Hinterhalt: in Wexmoor schlägt der Gegner manchmal zu, bevor man handeln kann', () => {
  for (const [zid, z] of Object.entries(content.zones)) assert.equal((z.ambush ?? 0) > 0, zid.startsWith('wx_'), zid);
  const s = hero(3);
  const c = new Combat(s, 'salzgeist');
  c.rng = () => 0; // Zufall unter der Chance: Hinterhalt
  assert.equal(c.ambush(), true);
  assert.equal(c.ambush(), true, 'wird einmal entschieden');
  const d = new Combat(hero(3), 'salzgeist');
  d.rng = () => 0.99;
  assert.equal(d.ambush(), false);
  assert.equal(new Combat(hero(3), 'schnabelmaske').ambushChance, 0);
  // fight() spielt den Hinterhalt: der erste Schlag trifft, bevor der Spieler dran ist
  const h = hero(3);
  const seen = [];
  const def = (i) => { if (i === 0) seen.push(h.hp); return 'miss'; };
  const orig = Combat.prototype.ambush;
  Combat.prototype.ambush = function () { return true; };
  try { fight(h, 'salzgeist', { defend: def }); } finally { Combat.prototype.ambush = orig; }
  assert.equal(seen[0], h.maxHp, 'der erste Schlag kommt bei vollem Leben, vor dem ersten eigenen Zug');
});

test('Reisefallen: Treibsand, Flutloch und Fußangel kosten Leben, Nerven oder Geld, aber nie das Leben', () => {
  const events = content.travelRules.events.filter((e) => e.city === 'wexmoor');
  const traps = events.filter((e) => e.id.startsWith('wx_falle_'));
  assert.ok(traps.length >= 4);
  assert.ok(events.find((e) => e.id === 'wx_reise_ruhig').weight < 25, 'ruhige Reisen sind seltener geworden');
  const hit = new Set();
  for (let r = 0.005; r < 1; r += 0.01) {
    const s = hero(3);
    s.money = 100;
    s.hp = 5;
    const ev = travelFast(s, () => r);
    if (!ev.id.startsWith('wx_falle_')) continue;
    hit.add(ev.id);
    assert.ok(s.hp >= 1, `${ev.id}: nie tödlich`);
    if (ev.effects?.damage) assert.equal(ev.damage, 5 - s.hp);
    if (ev.takes_money) assert.ok(ev.lostMoney >= ev.takes_money[0]);
    if (ev.effects?.wanted) assert.equal(s.wanted, 1);
  }
  assert.equal(hit.size, traps.length, [...hit].join());
  // Kettlegate kennt keine Fallen
  const k = hero(3);
  k.map = 'revier';
  for (let r = 0.005; r < 1; r += 0.01) assert.ok(!travelFast(k, () => r).id.startsWith('wx_falle_'));
});

test('Grauspäher greifen härter durch: ein Viertel des Geldes, nur einmal umsonst raus, schneller gefasst', () => {
  const p = content.police;
  assert.equal(p.seize_pct, 0.25);
  assert.equal(p.free_bails, 1);
  assert.ok(p.catch_sec <= 1.2 && p.decay_sec >= 420);
  // Gebiete: öfter Eliten, teurere Niederlagen, weniger Tränke als Beute
  for (const [zid, z] of Object.entries(content.zones)) {
    if (!zid.startsWith('wx_')) continue;
    assert.equal(z.lose_money, 0.35, zid);
    assert.equal(content.maps[zid].elite_chance, 0.3, zid);
    for (const [id, e] of Object.entries(z.encounters)) for (const d of e.loot?.drops ?? []) if (d.item === 'tonikum') assert.ok(d.chance <= 0.3, `${id}: Tonikum`);
  }
});

test('Akt-Beschriftungen: keine Option und kein Auftrag in Wexmoor beginnt mit „Akt …“', () => {
  for (const [id, q] of Object.entries(content.quests)) assert.ok(!/^Akt\s+[IV]+\s*[·:]/.test(q.title ?? ''), `${id}: ${q.title}`);
  for (const [id, d] of Object.entries(content.dialogues)) {
    for (const [nid, n] of Object.entries(d.nodes)) for (const c of n.choices ?? []) assert.ok(!/^Akt\s+[IV]+\s*[·:]/.test(c.text), `${id}.${nid}: ${c.text}`);
  }
});

// --- Zu zweit -------------------------------------------------------------------

function pair(tier, seq) {
  const s = hero(tier, seq);
  s.addP2();
  s.withPlayer(2, () => {
    const w = GEAR[Math.min(4, tier)];
    s.addItem(w);
    s.equip(w);
    s.addItem('verband', 2);
    s.pathway = { id: 'laterne', seq, digestion: 0 };
    s.updateMaxHp();
    s.hp = s.maxHp;
  });
  return s;
}

function duoFight(state, enc, defend) {
  const c = new Combat(state, enc);
  c.rng = seeded(7);
  let n = 0;
  while (!c.outcome && c.round <= 80) {
    for (const p of [1, 2]) {
      if (!c.fighters[p] || c.fighters[p].down || c.outcome) continue;
      c.actor = p;
      c.on(p, () => { if (state.hp < state.maxHp * 0.35 && state.itemCount('verband') && c.canUseItem()) c.useItemNow('verband'); });
      // Wie geübte Spieler: Pfad-Fertigkeit verkettet, solange Konzentration und Nerven reichen, dann der Angriff
      let guard = 0;
      const path = ['klingenwirbel', 'lichtstoss'].find((id) => c.canUse(id));
      while (path && !c.outcome && c.canUse(path) && state.composure - c.composureCost(c.skillDef(path)) >= 15 && !c.endsTurn(path) && guard++ < 5) c.useSkill(path, Array(c.skillDef(path).hits).fill('good'));
      if (!c.outcome) c.useSkill('attack', ['good']);
    }
    if (c.outcome) break;
    do {
      const atk = c.nextEnemyAttack();
      if (atk) {
        // Flächenangriff: jeder Getroffene wehrt jeden Schlag für sich ab
        for (const p of atk.targets) {
          const rs = atk.hits.map(() => { const r = defend(n++); return r === 'parry' && atk.unparryable ? 'dodge' : r === 'dodge' && atk.undodgeable ? 'parry' : r; });
          for (const r of rs) { c.resolveHit(atk, r, p); if (c.outcome) break; }
          if (!c.outcome && !c.fighters[p].down && rs.every((r) => r === 'parry')) c.riposte(p);
        }
        c.endEnemyTurn();
      }
    } while (c.moreStrikes());
    c.endRound();
  }
  return c;
}

test('Zu zweit bleibt Wexmoor hart: Könner-Paare schaffen die Bosse, halbe Deckung verliert oder blutet', () => {
  for (const [enc, tier, seq] of [['glockenmutter', 4, 7], ['buergermeister', 4, 7], ['namenlose', 3, 6], ['leuchtfeuer', 4, 5]]) {
    const c = duoFight(pair(tier, seq), enc, EXPERT);
    assert.equal(c.outcome, 'won', `${enc} zu zweit (Könner)`);
    // Keiner steht nur daneben: der Gegner trifft beide
    for (const n of [1, 2]) assert.ok(c.on(n, () => c.state.hp < c.state.maxHp), `${enc}: Spieler ${n} wird getroffen`);
    // Zu zweit geht es nicht viel schneller als allein (der Gegner hält entsprechend mehr aus)
    const solo = duoFight(hero(tier, seq), enc, EXPERT);
    assert.ok(c.round >= solo.round * 0.6, `${enc}: ${c.round} Runden zu zweit, ${solo.round} allein`);
    // Halbe Deckung bei beiden (die Schläge wechseln zwischen den Spielern, also paarweise zählen)
    const halfEach = (i) => (Math.floor(i / 2) % 2 ? 'miss' : 'dodge');
    const h = duoFight(pair(tier, seq), enc, halfEach);
    const bled = [1, 2].reduce((sum, n) => sum + h.on(n, () => 1 - h.state.hp / h.state.maxHp), 0) >= 0.9; // zusammen fast ein ganzes Leben
    assert.ok(h.outcome !== 'won' || bled, `${enc}: halbe Deckung zu zweit (${h.outcome})`);
  }
});

test('Wexmoor-Gegner schlagen 50 % härter und halten 40 % mehr aus; zu zweit ohne Abschlag (Seb: „nicht brutal genug“)', () => {
  for (const [zid, z] of Object.entries(content.zones)) {
    if (!zid.startsWith('wx_')) { assert.ok(!z.dmg_mult && !z.hp_mult, zid); continue; }
    assert.equal(z.dmg_mult, 1.5, zid);
    assert.deepEqual(z.hp_mult, { normal: 2, elite: 1.6, boss: 1.4 }, zid);
    assert.equal(z.duo_full, true, zid);
  }
  for (const id of ['ez_reetkoenig', 'ez_spinnerin', 'price_wx_fight', 'k2a_tinte_kampf', 'k2a_letztes_bild_kampf']) assert.equal(content.encounters[id].dmg_mult, 1.5, id);
  assert.ok(!content.encounters.wx_grauspaeher_fight.dmg_mult, 'Grauspäher bleiben, wie sie sind');
  // Leben: Daten × ENEMY_HP_MULT × Gebietsfaktor je Rang (normal 2, Elite 1,6, Boss 1,4); Schaden: Daten × ENEMY_DMG_MULT × 1,5
  const s = hero(3);
  const c = new Combat(s, 'salzgeist');
  const e = content.encounters.salzgeist;
  assert.equal(c.enemy.maxHp, Math.round(e.hp * ENEMY_HP_MULT * 2));
  assert.equal(new Combat(hero(3), 'salzgeist_elite').enemy.maxHp, Math.round(content.encounters.salzgeist_elite.hp * ENEMY_HP_MULT * 1.6));
  assert.equal(new Combat(hero(4), 'glockenmutter').enemy.maxHp, Math.round(content.encounters.glockenmutter.hp * ENEMY_HP_MULT * 1.4));
  c.rng = seeded(3);
  const atk = c.nextEnemyAttack();
  const base = e.attacks.find((a) => a.name === atk.name);
  assert.equal(atk.damage, Math.max(1, Math.round(base.damage * (ENEMY_DMG_MULT * 1.5))));
  // Zu zweit: Kettlegate-Gegner schlagen pro Schlag schwächer (DUO_DMG_MULT), Wexmoor-Gegner nicht
  const d = pair(3, 7);
  const w = new Combat(d, 'salzgeist');
  w.rng = seeded(3);
  w.targets = [1];
  const duo = w.nextEnemyAttack();
  assert.equal(duo.damage, Math.max(1, Math.round(content.encounters.salzgeist.attacks.find((a) => a.name === duo.name).damage * (ENEMY_DMG_MULT * 1.5))));
  const kg = new Combat(pair(3, 7), 'schnabelmaske');
  kg.rng = seeded(3);
  kg.targets = [1];
  const kgAtk = kg.nextEnemyAttack();
  assert.equal(kgAtk.damage, Math.max(1, Math.round(content.encounters.schnabelmaske.attacks.find((a) => a.name === kgAtk.name).damage * (ENEMY_DMG_MULT * DUO_DMG_MULT))));
});

test('Kein Schadensdeckel in Wexmoor: der Spieler macht vollen Schaden, die Gegner tanken über mehr Leben (Seb: „unlogisch, er soll mehr Leben haben“)', () => {
  for (const [zid, z] of Object.entries(content.zones)) if (zid.startsWith('wx_')) assert.equal(z.max_round_dmg, undefined, zid);
  for (const [id, e] of WX) assert.equal(e.max_round_dmg, undefined, id);
  for (const id of [...Object.keys(content.loners.list).filter((x) => !x.startsWith('ez_ds_')), 'price_wx_fight', 'k2a_tinte_kampf', 'k2a_letztes_bild_vane_kampf']) {
    assert.equal(content.encounters[id].max_round_dmg, undefined, id);
    assert.equal(content.encounters[id].hp_mult, 1.8, id);
  }
  assert.equal(new Combat(hero(3), 'torfgaenger').maxRoundDmg, 0);
  assert.equal(new Combat(hero(3), 'namenlose').maxRoundDmg, 0);
  // Grauspäher (nur mit Seq 4 zu schlagen) und Kettlegate-Bosse behalten ihre Grenze am Gegner
  assert.equal(new Combat(hero(3), 'wx_grauspaeher_fight').maxRoundDmg, 0.25);
  assert.ok(new Combat(hero(3), 'starling_fight').maxRoundDmg > 0);
  // Voller Schaden kommt an: ein Treffer über dem alten Viertel wird nicht mehr gekappt
  const c = new Combat(hero(3), 'torfgaenger');
  c.hurtEnemy(Math.round(c.enemy.maxHp * 0.6));
  assert.equal(c.capped, 0);
  assert.ok(c.enemy.hp <= c.enemy.maxHp * 0.4 + 1);
  // Ein Paar aus Eisen (Seq 7) und Laterne mit Ossuarklingen, das alles trifft und jedem Schlag ausweicht:
  // normale Gegner halten mindestens vier Runden, Eliten und Bosse fünf. Das ist, was der Deckel erzwingen sollte.
  for (const [id, e] of WX) {
    const c = duoFight(pair(tierOf(e), e.min_seq ?? 7), id, () => 'dodge');
    assert.ok(c.round >= (e.boss || e.elite ? 5 : 4), `${id}: fällt schon in Runde ${c.round}`);
  }
});
