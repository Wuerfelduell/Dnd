// Aufstieg über Tränke, Händler, Kessel und Pfad-Fähigkeiten im Kampf.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { DIGEST_RATE, DIGEST_SLOW_FACTOR, fmtDigest, COMMON_DIGEST, FIGHT_DIGEST_MULT, ZONE_DIGEST_STEP } from '../src/core/Pathways.js';
import { loadContent, talk, fight } from './helpers.js';

const content = loadContent();
const never = () => 0.999; // Würfel, der nie einen Kontrollverlust auslöst
const always = () => 0;

/** Kauft Formel und Zutaten und braut einen Trank (Geld wird vorher aufgefüllt). */
function brewPotion(s, pid, seq) {
  s.money = 1000;
  s.honor = Math.max(s.honor, 40);
  assert.equal(s.buy('kittering', `formel_${pid}_${seq}`).ok, true, `Formel ${pid} ${seq}`);
  for (const [id, n] of Object.entries(content.items[`formel_${pid}_${seq}`].ingredients)) {
    const shop = s.shopStock('nell').some((e) => e.item === id) ? 'nell' : 'kittering';
    for (let i = 0; i < n; i++) assert.equal(s.buy(shop, id).ok, true, `Zutat ${id}`);
  }
  assert.equal(s.brew(`formel_${pid}_${seq}`).ok, true);
  return `trank_${pid}_${seq}`;
}

test('Zehn Pfade (sieben + Waage, Moor, Uhr aus Paket AF) mit je Sequenz 9 bis 1, Fertigkeit, Passiven und kaufbaren Zutaten', () => {
  const ids = Object.keys(content.pathways);
  assert.equal(ids.length, 10);
  const skillIds = new Set();
  for (const [pid, p] of Object.entries(content.pathways)) {
    assert.deepEqual(Object.keys(p.seqs).sort(), ['1', '2', '3', '4', '5', '6', '7', '8', '9'], pid);
    assert.ok(p.principle && p.digest_hint && Object.keys(p.digest).length >= 2, `${pid}: Grundsatz`);
    for (const [n, sd] of Object.entries(p.seqs)) {
      assert.ok(sd.name && sd.desc && sd.skill?.id && sd.skill.desc, `${pid} ${n}`);
      assert.ok(!skillIds.has(sd.skill.id), `Fertigkeit doppelt: ${sd.skill.id}`);
      skillIds.add(sd.skill.id);
      assert.ok(sd.passives?.length, `${pid} ${n}: Passive`);
      for (const id of Object.keys(sd.ingredients)) assert.equal(content.items[id]?.kind, 'ingredient', `${pid} ${n}: ${id}`);
      assert.ok(content.items[`trank_${pid}_${n}`] && content.items[`formel_${pid}_${n}`]);
    }
  }
  // Jede Zutat und Formel ist irgendwo zu kaufen (bei Händlern oder als Los auf einem geheimen Treffen)
  const lots = Object.values(content.gatherings.circles).flatMap((c) => (c.members ?? []).flatMap((m) => m.offers.map((e) => e.item)));
  const sold = new Set([...Object.values(content.market.merchants).flatMap((m) => m.stock.map((e) => e.item)), ...lots]);
  // Kernzutaten für 4 bis 1 gibt es nur aus Kapitel 3: Hedda nach der Pfadprüfung (4) und die Kernfächer der Hüter (3 bis 1)
  const given = new Set();
  (function walk(v) { if (!v || typeof v !== 'object') return; for (const id of Object.keys(v.gives_items ?? {})) given.add(id); for (const x of Object.values(v)) walk(x); })(content.dialogues);
  for (const [id, it] of Object.entries(content.items)) {
    if (!['ingredient', 'formula'].includes(it.kind)) continue;
    if (/^sq_zutat_\w+_[1-4]$/.test(id)) assert.ok(given.has(id), `${id} gibt es nirgends`);
    else if (/^formel_\w+_[1-3]$/.test(id)) assert.ok(Object.values(content.maps).some((m) => m.id?.startsWith('o3_') && (m.interactables ?? []).some((i) => i.effects?.gives_items?.[id])), `${id} liegt an keinem Ort`);
    else assert.ok(sold.has(id), `${id} wird nirgends verkauft`);
  }
  for (const m of Object.values(content.market.merchants)) for (const e of m.stock) assert.ok(content.items[e.item], `Händlerware ${e.item}`);
});

test('Nachtmarkt-Dialoge: Händler öffnen Läden, Sabeth erklärt und schenkt Ruhetee', () => {
  const s = new GameState(content);
  talk(s, 'sabeth', ['Aufstieg']);
  assert.equal(s.itemCount('ruhetee'), 1);
  for (const [d, m] of [['nell', 'nell'], ['kittering', 'kittering'], ['gorse', 'gorse']]) {
    const choice = content.dialogues[d].nodes.start.choices.find((c) => c.shop);
    assert.equal(choice.shop, m);
  }
  assert.ok(s.travelDests ?? content.travel.some((t) => t.map === 'nachtmarkt'));
});

test('Trinken: Sequenz 9, Verdauen durch Handeln, dann Aufstieg auf 8 ohne Risiko', () => {
  const s = new GameState(content);
  const p9 = brewPotion(s, 'faden', 9);
  assert.equal(s.drink(p9, never).ok, true);
  assert.deepEqual({ id: s.pathway.id, seq: s.pathway.seq }, { id: 'faden', seq: 9 });
  assert.ok(s.unruhe > 0);
  assert.ok(s.pathwaySkills().schwachstelle, 'Kampffähigkeit freigeschaltet');
  // Handeln nach dem Grundsatz verdaut
  const before = s.pathway.digestion;
  s.act('conclusion');
  assert.ok(s.pathway.digestion > before);
  s.act('combat_win'); // passt nicht zum Faden
  assert.equal(s.pathway.digestion, before + 20);
  for (let i = 0; i < 10; i++) s.act('conclusion');
  assert.equal(s.pathway.digestion, 100);
  const p8 = brewPotion(s, 'faden', 8);
  assert.ok(s.drinkCheck(p8).risk < 0.1, 'verdaut = kaum Risiko');
  assert.equal(s.drink(p8, never).ok, true);
  assert.equal(s.pathway.seq, 8);
  assert.equal(s.pathway.digestion, 0);
});

test('Zu früh getrunken: hohes Risiko, Kontrollverlust kostet Geld und Leben, nie Game Over', () => {
  const s = new GameState(content);
  s.drink(brewPotion(s, 'eisen', 9), never);
  assert.equal(s.maxHp, 58, 'Raufbold: +10 Leben, dazu +8 für die erste Sequenz des Eisens');
  const p8 = brewPotion(s, 'eisen', 8);
  const { risk } = s.drinkCheck(p8);
  assert.ok(risk > 0.8, `Risiko ${risk}`);
  s.money = 100;
  let lost = null;
  s.on('lostcontrol', (e) => { lost = e; });
  const r = s.drink(p8, always);
  assert.equal(r.lost, true);
  assert.ok(lost);
  assert.equal(s.pathway.seq, 9, 'kein Aufstieg');
  assert.equal(s.money, 80);
  assert.ok(s.hp >= 1);
  assert.equal(s.itemCount(p8), 0, 'Trank ist verbraucht');
});

test('Regeln: kein zweiter Pfad, keine Stufe überspringen, Unruhe 100 löst Kontrollverlust aus', () => {
  const s = new GameState(content);
  const l8 = 'trank_laterne_8';
  s.addItem(l8);
  assert.equal(s.drink(l8, never).ok, false, 'ohne Sequenz 9 nicht trinkbar');
  s.drink(brewPotion(s, 'laterne', 9), never);
  s.addItem('trank_maske_9');
  assert.equal(s.drink('trank_maske_9', never).ok, false, 'zweiter Pfad verboten');
  s.addItem('trank_laterne_7');
  assert.equal(s.drink('trank_laterne_7', never).ok, false, 'Stufe überspringen verboten');
  let lost = false;
  s.on('lostcontrol', () => { lost = true; });
  s.setUnruhe(100);
  assert.ok(lost);
  assert.equal(s.unruhe, 40);
  // Ruhetee senkt Unruhe
  s.addItem('ruhetee');
  s.useItem('ruhetee');
  assert.equal(s.unruhe, 10);
});

test('Schilling: Aufträge und Kämpfe zahlen, Händler verkaufen und kaufen an', () => {
  const s = new GameState(content);
  assert.equal(s.money, content.market.start_money);
  talk(s, 'marlowe', ['auf den Weg']);
  const m0 = s.money;
  s.finishQuest('arrival', 'done');
  assert.ok(s.money > m0 || s.quests.arrival === 'done');
  const before = s.money;
  assert.equal(s.buy('gorse', 'verband').ok, true);
  assert.equal(s.money, before - 8);
  assert.equal(s.sell('verband').ok, true);
  assert.equal(s.money, before - 8 + 4);
  assert.equal(s.sellPrice('taschenuhr'), null, 'Schlüsselgegenstände sind unverkäuflich');
  s.money = 0;
  assert.equal(s.buy('gorse', 'verband').ok, false);
  // Formeln höherer Stufen sind gesperrt
  s.money = 500;
  assert.equal(s.buy('kittering', 'formel_eisen_8').ok, false);
});

test('Kampfgrube: Einsatz zahlen, Sieg bringt Schilling und verdaut den Pfad des Eisens', () => {
  const s = new GameState(content);
  s.drink(brewPotion(s, 'eisen', 9), never);
  s.money = 10;
  talk(s, 'brock', ['Ich kämpfe']);
  assert.equal(s.money, 7);
  assert.equal(s.pendingCombat, 'grubenkampf');
  const d0 = s.pathway.digestion;
  const { result } = fight(s, 'grubenkampf', { attack: 'perfect', skill: 'wuchtschlag', defend: () => 'parry' });
  assert.equal(result.outcome, 'won');
  assert.equal(s.money, 7 + Math.round(12 * s.passive('money_bonus')));
  assert.ok(s.pathway.digestion > d0 + 20);
});

test('Pfad-Fähigkeiten im Kampf: Schutz, Ausweichen, Verwirrung, Gift, Heilung, Betäubung', () => {
  const s = new GameState(content);
  s.drink(brewPotion(s, 'kessel', 9), never);
  for (let i = 0; i < 10; i++) s.act('brew');
  s.drink(brewPotion(s, 'kessel', 8), never);
  let c = new Combat(s, 'schattenpuppe');
  c.ap = 6;
  s.hp = 10;
  const heal = c.useSkill('wundsalbe');
  assert.ok(heal.effects[0].startsWith('+'), 'Wundsalbe heilt');
  const hp0 = c.enemy.hp;
  c.useSkill('giftphiole', ['good']);
  assert.equal(c.burn.rounds, 3);
  assert.equal(c.endRound(), 4);
  assert.equal(c.enemy.hp, hp0 - 5 - 4);

  const m = new GameState(content);
  m.drink(brewPotion(m, 'maske', 9), never);
  for (let i = 0; i < 10; i++) m.act('side_quest');
  m.drink(brewPotion(m, 'maske', 8), never);
  c = new Combat(m, 'schattenpuppe');
  c.ap = 6;
  c.useSkill('trugbild');
  const atk = c.nextEnemyAttack();
  const r = c.resolveHit(atk, 'miss');
  assert.equal(r.damage, 0, 'Trugbild fängt den Schlag ab');
  c.useSkill('verwirrung', ['good']);
  const hpBefore = c.enemy.hp;
  assert.equal(c.nextEnemyAttack(), null, 'verwirrt: kein Angriff');
  assert.ok(c.enemy.hp < hpBefore, 'trifft sich selbst');

  const f = new GameState(content);
  f.drink(brewPotion(f, 'faden', 9), never);
  for (let i = 0; i < 10; i++) f.act('conclusion');
  f.drink(brewPotion(f, 'faden', 8), never);
  c = new Combat(f, 'schattenpuppe');
  c.ap = 6;
  c.useSkill('schwachstelle');
  assert.equal(c.weak, true);
  c.useSkill('vorahnung');
  const a2 = c.nextEnemyAttack();
  assert.equal(c.resolveHit(a2, 'miss').result, 'dodge', 'Vorahnung: Angriff geht ins Leere');
  c.endEnemyTurn();
  assert.equal(c.resolveHit(a2, 'miss').result, 'miss', 'nur für einen Angriff');
});

test('Passive: Schmeichler zahlt weniger, Schlossflüsterer öffnet Akten früher', () => {
  const s = new GameState(content);
  s.drink(brewPotion(s, 'maske', 9), never);
  const price = s.shopStock('gorse').find((e) => e.item === 'tonikum').price;
  assert.equal(price, Math.round(18 * 0.85));

  const k = new GameState(content);
  k.drink(brewPotion(k, 'schluessel', 9), never);
  for (let i = 0; i < 4; i++) k.act('lock');
  k.drink(brewPotion(k, 'schluessel', 8), never);
  k.honor = 36;
  const lock = content.maps.revier.interactables.find((i) => i.id === 'archive_b').lock;
  assert.equal(k.meets(lock), false);
  assert.equal(k.meetsLock(lock), true);
});

test('Speichern und Laden behält Schilling, Pfad und Unruhe', () => {
  const s = new GameState(content);
  s.drink(brewPotion(s, 'echo', 9), never);
  s.money = 77;
  s.act('hidden_clue');
  const data = JSON.parse(JSON.stringify(s.serialize([10, 10])));
  const t = new GameState(content);
  assert.equal(t.load(data), true);
  assert.equal(t.money, 77);
  assert.equal(t.pathway.id, 'echo');
  assert.equal(t.pathway.digestion, s.pathway.digestion);
  assert.equal(Math.round(t.unruhe), Math.round(s.unruhe));
});

test('Verdauung ab Sequenz 6: jede Stufe zehnmal so langsam wie die davor', () => {
  assert.equal(DIGEST_RATE[7], 0.5, 'Sequenz 7 bleibt wie gehabt');
  for (let seq = 6; seq >= 1; seq--) {
    assert.ok(Math.abs(DIGEST_RATE[seq] * DIGEST_SLOW_FACTOR - DIGEST_RATE[seq + 1]) < 1e-12, `Sequenz ${seq} = Sequenz ${seq + 1} / 10`);
  }
  const s = new GameState(content);
  const gain = (seq) => { s.pathway = { id: 'eisen', seq, digestion: 0 }; return s.act('combat_win'); };
  const at7 = gain(7);
  const at6 = gain(6);
  const at5 = gain(5);
  assert.ok(at7 > 0);
  assert.ok(Math.abs(at6 * 10 - at7) < 1e-9, `Sequenz 6 (${at6}) ist ein Zehntel von 7 (${at7})`);
  assert.ok(Math.abs(at5 * 100 - at7) < 1e-9, `Sequenz 5 (${at5}) ist ein Hundertstel von 7 (${at7})`);
  // Zu zweit: Spieler 2 verdaut nach seiner eigenen Sequenz
  const d = new GameState(content);
  d.pathway = { id: 'eisen', seq: 7, digestion: 0 };
  d.addP2();
  d.withPlayer(2, () => { d.pathway = { id: 'eisen', seq: 6, digestion: 0 }; });
  d.act('combat_win');
  const p1 = d.pathway.digestion;
  const p2 = d.withPlayer(2, () => d.pathway.digestion);
  // Spieler 2 verdaut dreißigmal schneller (P2_DIGEST_MULT): auf Sequenz 6 dreimal so viel wie Spieler 1 auf 7
  assert.ok(p1 > 0 && Math.abs(p2 - p1 * 3) < 1e-9, `Koop: Spieler 2 auf Sequenz 6 (${p2}) mit Bonus x30 = 3x Spieler 1 auf 7 (${p1})`);
  assert.equal(fmtDigest(0.014), '0.014');
  assert.equal(fmtDigest(14), '14');
});

test('Mehr Verdauungsquellen: Bosse, Elite, Gefahrenstufe, Welt-Fähigkeiten, Ritual, Treffen', () => {
  const s = new GameState(content);
  s.pathway = { id: 'eisen', seq: 9, digestion: 0 };
  // Gemeinsame Quellen gelten für jeden Pfad, die pfadeigene Tabelle bleibt
  assert.equal(s.digestWeights().boss_win, COMMON_DIGEST.boss_win);
  assert.equal(s.digestWeights().combat_win, 24);
  assert.ok(s.digestTable().some((r) => r.kind === 'boss_win'), 'Pfad-Seite zeigt den Boss');
  assert.equal(s.act('boss_win'), 30);
  s.pathway.digestion = 0;
  assert.equal(s.act('talent', 1), 6);
  // Ein Pfad ohne Kampf in der Tabelle verdaut Bosse trotzdem (Prüfung für jeden Pfad)
  s.pathway = { id: 'faden', seq: 9, digestion: 0 };
  assert.equal(s.act('boss_win'), 30);
  assert.equal(s.act('combat_win', 4), 0, 'normaler Kampfsieg verdaut den Faden weiterhin nicht');
  // Kampfende: Boss = 4x Kampfsieg + Bosspunkte, Elite = 2x + Elitepunkte, Gefahrenstufe obendrauf
  const won = (id, seq = 9) => {
    const g = new GameState(content);
    g.pathway = { id: 'eisen', seq, digestion: 0 };
    const c = new Combat(g, id);
    c.rng = () => 0.99;
    c.outcome = 'won';
    c.finish({ noLoot: true });
    return { got: g.pathway.digestion, tier: c.zoneTier };
  };
  const plain = won('rook_fight');
  const boss = won('starling_fight');
  const zone = (t) => 1 + Math.max(0, t - 1) * ZONE_DIGEST_STEP;
  assert.ok(Math.abs(plain.got - 24 * zone(plain.tier)) < 1e-9, `normaler Sieg ${plain.got} (Stufe ${plain.tier})`);
  assert.ok(Math.abs(boss.got - Math.min(100, (24 * FIGHT_DIGEST_MULT.boss + COMMON_DIGEST.boss_win) * zone(boss.tier))) < 1e-9, `Boss ${boss.got} (Stufe ${boss.tier})`);
  assert.ok(boss.got > plain.got * 3, 'Boss verdaut ein Vielfaches');
  // Welt-Fähigkeit außerhalb des Kampfes: je 10 Nerven ein Schritt, zwischen 0.5 und 2.5
  const t = new GameState(content);
  t.pathway = { id: 'eisen', seq: 9, digestion: 0 };
  t.updateMaxHp(); t.composure = t.maxComposure();
  const tal = t.talents()[0];
  assert.ok(tal, 'Eisen 9 hat eine Welt-Fähigkeit');
  const r = t.useTalent(tal.id);
  assert.equal(r.ok, true, r.text);
  const steps = Math.min(2.5, Math.max(0.5, (tal.nerves ?? 0) / 10));
  assert.ok(Math.abs(t.pathway.digestion - 6 * steps) < 1e-9, `Fähigkeit verdaut ${t.pathway.digestion} (${steps} Schritte)`);
  assert.ok(r.text.includes('verdaut'), r.text);
  // Zu zweit bleibt die Fähigkeit persönlich, der Boss verdaut beide
  const d = new GameState(content);
  d.pathway = { id: 'eisen', seq: 9, digestion: 0 };
  d.addP2();
  d.withPlayer(2, () => { d.pathway = { id: 'faden', seq: 9, digestion: 0 }; });
  d.act('talent', 1);
  assert.equal(d.withPlayer(2, () => d.pathway.digestion), 0, 'Fähigkeit von Spieler 1 verdaut Spieler 2 nicht');
  d.act('boss_win');
  assert.equal(d.withPlayer(2, () => d.pathway.digestion), 100, 'Boss verdaut auch Spieler 2 (Bonus x30, gedeckelt bei 100)');
  // Gefahrenstufe und Bremse ab Sequenz 6 greifen zusammen
  const deep = won('starling_fight', 5);
  assert.ok(Math.abs(deep.got * 100 - boss.got) < 1e-6 || boss.got === 100, `Sequenz 5: ${deep.got}`);
});

test('Seq 5 hebt die maximalen Leben jedes Pfades um mindestens 35 % gegenüber Seq 6, auch für Spieler 2', () => {
  for (const id of Object.keys(content.pathways)) {
    const s = new GameState(content);
    s.pathway = { id, seq: 6, digestion: 0 };
    const hp6 = s.calcMaxHp();
    s.pathway.seq = 5;
    assert.ok(s.calcMaxHp() >= hp6 * 1.35, `${id}: ${hp6} → ${s.calcMaxHp()}`);
    s.pathway.seq = 4;
    assert.ok(s.calcMaxHp() >= hp6 * 1.35, `${id} Seq 4`);
  }
});

test('Seq 4 (Halbgott): doppelte Leben, +50 % Nerven, +1 max. Konzentration, mehr als +50 % Schaden gegenüber Seq 5, auch für Spieler 2', () => {
  for (const id of Object.keys(content.pathways)) {
    for (const n of [1, 2]) {
      const s = new GameState(content);
      s.addP2();
      const at = (seq) => s.withPlayer(n, () => {
        s.pathway = { id, seq, digestion: 0 };
        s.updateMaxHp();
        const c = new Combat(s, 'fog_hound');
        return { hp: s.calcMaxHp(), nerves: s.maxComposure(), dmg: s.passive('dmg_mult'), ap: c.apMaxOf(n) };
      });
      const v5 = at(5);
      const v4 = at(4);
      assert.ok(v4.hp >= v5.hp * 2, `${id} P${n} Leben: ${v5.hp} → ${v4.hp}`);
      assert.ok(v4.hp <= v5.hp * 2 + 30, `${id} P${n} Leben nicht unnötig mehr: ${v5.hp} → ${v4.hp}`);
      assert.ok(v4.nerves >= v5.nerves * 1.5, `${id} P${n} Nerven: ${v5.nerves} → ${v4.nerves}`);
      assert.ok(v4.dmg >= v5.dmg * 1.5, `${id} P${n} Schaden`);
      assert.equal(v4.ap, v5.ap + 1, `${id} P${n} Konzentration`);
    }
  }
});
