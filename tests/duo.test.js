// Zwei Spieler: eigener Pfad für Spieler 2 und Kämpfe, die zu zweit fair bleiben.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, ENEMY_HP_MULT, DUO_HP_SHARE, DUO_POWER_MIN, DUO_DMG_MULT, ENEMY_DMG_MULT, SWEEP_DMG_MULT, SWEEP_CHANCE, SWEEP_CHANCE_TOUGH, duoHpMult } from '../src/core/Combat.js';
import { loadContent, seeded, SKILLED, EXPERT } from './helpers.js';

const content = loadContent();
const always = () => 0.99; // Zufall, der nie Kontrollverlust auslöst

// Ab Fall 4 trägt man eine bessere Waffe: Stockdegen bei Sequenz 9, ab Fall 5 die Ossuarklinge
const weaponFor = (seq) => (!seq || seq === 9 ? 'schlagstock' : 'ossuarklinge');
function hero(seq = null, id = 'eisen') {
  const s = new GameState(content);
  s.addItem(weaponFor(seq));
  s.equip(weaponFor(seq));
  s.addItem('verband', 3);
  if (seq) {
    s.pathway = { id, seq, digestion: 0 };
    s.updateMaxHp();
    s.hp = s.maxHp;
  }
  return s;
}

/** Ermittler und Spieler 2, beide mit Schlagstock; Spieler 2 auf seinem eigenen Pfad. */
function pair(seq = null, seq2 = seq, id2 = 'laterne') {
  const s = hero(seq);
  s.addP2();
  s.withPlayer(2, () => {
    s.addItem(weaponFor(seq2));
    s.equip(weaponFor(seq2));
    s.addItem('verband', 1);
    if (seq2) {
      s.pathway = { id: id2, seq: seq2, digestion: 0 };
      s.updateMaxHp();
      s.hp = s.maxHp;
    }
  });
  return s;
}

// --- Eigener Pfad für Spieler 2 ------------------------------------------------------

test('Spieler 2 trinkt seinen eigenen Trank: eigener Pfad, eigene Sequenz, mehr Leben, Ermittler bleibt unberührt', () => {
  const s = hero(9, 'eisen');
  s.addP2();
  const before = s.p2.maxHp;
  s.withPlayer(2, () => s.addItem('trank_laterne_9'));
  const r = s.withPlayer(2, () => s.drink('trank_laterne_9', always));
  assert.equal(r.ok, true, r.text);
  assert.deepEqual(s.pathway, { id: 'eisen', seq: 9, digestion: 0 });
  assert.equal(s.p2.pathway.id, 'laterne');
  assert.equal(s.p2.pathway.seq, 9);
  assert.ok(s.p2.maxHp > before, 'Spieler 2 wächst mit seiner Sequenz');
  assert.ok(s.p2.unruhe > 0, 'Unruhe gehört Spieler 2');
  assert.equal(s.unruhe, 0);
  assert.equal(s.playerView(2).pathway.name, content.pathways.laterne.name);
});

test('Beide dürfen denselben Pfad gehen, jeder steigt für sich auf', () => {
  const s = hero(9, 'laterne');
  s.addP2();
  s.withPlayer(2, () => s.addItem('trank_laterne_9'));
  assert.equal(s.withPlayer(2, () => s.drink('trank_laterne_9', always)).ok, true);
  s.withPlayer(2, () => s.addItem('trank_laterne_8'));
  // Unverdaut ist der nächste Trank riskant, aber möglich, und betrifft nur Spieler 2
  assert.equal(s.withPlayer(2, () => s.drink('trank_laterne_8', always)).ok, true);
  assert.equal(s.p2.pathway.seq, 8);
  assert.equal(s.pathway.seq, 9);
});

test('Spieler 2 kämpft mit den Fähigkeiten seines Pfades und den Durchbruch-Passiven', () => {
  const s = pair(9, 7, 'laterne');
  const c = new Combat(s, 'fog_hound');
  c.passTurn();
  const ids = c.skills().map((x) => x.id);
  assert.ok(ids.includes(content.pathways.laterne.seqs[9].skill.id), 'Fähigkeit von Spieler 2');
  assert.ok(!ids.includes(content.pathways.eisen.seqs[9].skill.id), 'nicht die des Ermittlers');
  assert.equal(c.fighters[2].ap, c.fighters[1].ap + 1, 'Seq 7 beginnt mit mehr Konzentration');
});

test('Gemeinsame Taten verdauen beide Tränke, Paraden nur den eigenen', () => {
  const s = pair(9, 9, 'laterne');
  s.act('quest'); // Eisen und Laterne verdauen beide durch erledigte Aufträge
  assert.ok(s.pathway.digestion > 0, 'Ermittler verdaut');
  assert.ok(s.p2.pathway.digestion > 0, 'Spieler 2 verdaut mit');
  const d1 = s.pathway.digestion;
  const d2 = s.p2.pathway.digestion;
  s.withPlayer(2, () => s.act('parry'));
  assert.equal(s.pathway.digestion, d1, 'Parade von Spieler 2 verdaut nicht beim Ermittler');
  s.act('combat_win');
  assert.equal(s.wins, 1, 'Siege zählen einmal');
  assert.ok(s.p2.pathway.digestion >= d2);
});

test('Rituale gelten nur für den, der sie vollzieht', () => {
  const s = hero(7, 'laterne');
  s.addP2();
  s.withPlayer(2, () => { s.pathway = { id: 'laterne', seq: 7, digestion: 100 }; });
  s.flags.add('ritual_laterne_6'); // der Ermittler hat sein Ritual schon
  s.withPlayer(2, () => s.addItem('trank_laterne_6'));
  const chk = s.withPlayer(2, () => s.drinkCheck('trank_laterne_6'));
  assert.equal(chk.ok, false);
  assert.equal(chk.ritual, true);
  s.flags.add('p2_ritual_laterne_6');
  assert.equal(s.withPlayer(2, () => s.drinkCheck('trank_laterne_6')).ok, true);
});

test('Unruhe von Spieler 2 klingt mit der Zeit ab, der Pfad bleibt beim Speichern erhalten', () => {
  const s = pair(9, 8, 'faden');
  s.p2.unruhe = 50;
  s.tick(10);
  assert.ok(s.p2.unruhe < 50);
  assert.equal(s.acting, 1);
  const data = JSON.parse(JSON.stringify(s.serialize()));
  const t = new GameState(content);
  t.load(data);
  assert.deepEqual(t.p2.pathway, s.p2.pathway);
  assert.equal(t.p2.maxHp, s.p2.maxHp);
});

// --- Kampf zu zweit ---------------------------------------------------------------------

test('Zu zweit greift der Gegner jeden stehenden Spieler einmal pro Runde an', () => {
  const s = pair();
  const c = new Combat(s, 'fog_hound');
  c.rng = seeded(4);
  for (let round = 0; round < 4; round++) {
    const hit = [];
    do {
      if (c.nextEnemyAttack()) hit.push(...c.targets);
      c.endEnemyTurn();
    } while (c.moreStrikes());
    if (hit.length) assert.deepEqual([...hit].sort(), [1, 2], `Runde ${round}`);
    c.endRound();
  }
  // Liegt einer, trifft es nur noch den anderen
  c.target = 2;
  c.resolveHit({ name: 'Test', damage: 999, hits: [500] }, 'miss');
  c.nextEnemyAttack();
  assert.equal(c.target, 1);
  assert.equal(c.moreStrikes(), false);
});

test('Flächenangriff: manchmal trifft der Gegner beide Spieler zugleich, jeder wehrt für sich ab', () => {
  const s = pair();
  const c = new Combat(s, 'fog_hound');
  c.rng = () => 0.01; // Zufall unter der Flächen-Wahrscheinlichkeit
  const atk = c.nextEnemyAttack();
  assert.equal(atk.sweep, true);
  assert.deepEqual(c.targets, [1, 2]);
  assert.deepEqual(atk.targets, [1, 2]);
  assert.equal(c.moreStrikes(), false, 'nach dem Flächenangriff ist die Runde des Gegners vorbei');
  const base = c.enc.attacks[0];
  assert.equal(atk.damage, Math.max(1, Math.round(base.damage * ENEMY_DMG_MULT * DUO_DMG_MULT * SWEEP_DMG_MULT)));
  const hp1 = s.hp;
  const hp2 = s.p2.hp;
  const r1 = c.resolveHit(atk, 'miss', 1);
  const r2 = c.resolveHit(atk, 'parry', 2);
  assert.ok(r1.damage > 0 && s.hp < hp1, 'Spieler 1 steckt ein');
  assert.equal(r2.damage, 0);
  assert.ok(r2.counter > 0, 'Spieler 2 pariert und kontert');
  assert.equal(s.p2.hp, hp2);
  // Gegenschlag kann jeder führen, der alles pariert hat
  const before = c.enemy.hp;
  c.riposte(2);
  assert.ok(c.enemy.hp < before);
  // Liegt einer, gibt es keine Flächenangriffe mehr
  c.endEnemyTurn();
  c.endRound();
  c.target = 1;
  c.resolveHit({ name: 'Test', damage: 999, hits: [500] }, 'miss', 1);
  assert.equal(c.fighters[1].down, true);
  const next = c.nextEnemyAttack();
  assert.equal(next.sweep, false);
  assert.deepEqual(c.targets, [2]);
});

test('Flächenangriffe: nie allein oder in der Übung, bei Bossen öfter, Daten können es erzwingen oder verbieten', () => {
  assert.equal(new Combat(hero(), 'fog_hound').sweeps({}), false);
  const c = new Combat(pair(), 'fog_hound');
  let n = 0;
  c.rng = () => (n++ % 100) / 100;
  let sweeps = 0;
  for (let i = 0; i < 100; i++) if (c.sweeps({})) sweeps += 1;
  assert.equal(sweeps, Math.round(SWEEP_CHANCE * 100));
  assert.equal(c.sweeps({ sweep: true }), true);
  assert.equal(c.sweeps({ sweep: false }), false);
  const boss = new Combat(pair(7), 'starling_fight');
  assert.ok(boss.enc.boss);
  n = 0;
  boss.rng = () => (n++ % 100) / 100;
  sweeps = 0;
  for (let i = 0; i < 100; i++) if (boss.sweeps({})) sweeps += 1;
  assert.equal(sweeps, Math.round(SWEEP_CHANCE_TOUGH * 100));
  assert.equal(new Combat(pair(), 'sparring').sweeps({}), false);
});

test('Blendung lässt die ganze Gegnerrunde ausfallen', () => {
  const c = new Combat(pair(), 'fog_hound');
  c.stunned = true;
  assert.equal(c.nextEnemyAttack(), null);
  assert.equal(c.moreStrikes(), false);
});

test('Gegnerleben zu zweit richtet sich nach der Schlagkraft von Spieler 2', () => {
  const strong = pair();
  const weak = hero();
  weak.addP2(); // Spieler 2 mit Spazierstock
  const base = content.encounters.miss_wren.hp * ENEMY_HP_MULT;
  assert.equal(new Combat(strong, 'miss_wren').enemy.maxHp, Math.round(base * (1 + DUO_HP_SHARE)));
  const w = new Combat(weak, 'miss_wren').enemy.maxHp;
  assert.ok(w < base * (1 + DUO_HP_SHARE) && w >= Math.round(base * (1 + DUO_HP_SHARE * DUO_POWER_MIN)));
  assert.ok(duoHpMult(weak) < duoHpMult(strong));
});

/** Spielt einen Kampf zu zweit durch: beide greifen an, der Gegner schlägt jeden einmal. */
function duoFight(state, enc, defend, seed = 7) {
  const c = new Combat(state, enc);
  c.rng = seeded(seed);
  let n = 0;
  while (!c.outcome && c.round <= 80) {
    for (const p of [1, 2]) {
      if (!c.fighters[p] || c.fighters[p].down || c.outcome) continue;
      c.actor = p;
      c.on(p, () => { if (state.hp < state.maxHp * 0.35 && state.itemCount('verband') && c.canUseItem()) c.useItemNow('verband'); });
      // Wie geübte Spieler ab Fall 5 (Sequenz 8): die stärkste Pfad-Fertigkeit, solange Konzentration reicht, dann der Angriff
      let guard = 0;
      while (!c.outcome && (state.pathway?.seq ?? 9) <= 8 && guard++ < 5) {
        const sk = c.skills().filter((x) => x.usable && x.cost > 0 && x.hits > 0 && x.id !== 'blind' && x.id !== 'ward').sort((a, b) => (b.flat ?? b.mult * 10) * b.hits - (a.flat ?? a.mult * 10) * a.hits)[0];
        if (!sk) break;
        c.useSkill(sk.id, Array(sk.hits).fill('good'));
      }
      if (!c.outcome) c.useSkill('attack', ['good']);
    }
    if (c.outcome) break;
    do {
      const atk = c.nextEnemyAttack();
      if (atk) {
        if (atk.sweep) c.sweepCount = (c.sweepCount ?? 0) + 1;
        // Flächenangriff: jeder Getroffene wehrt jeden Schlag für sich ab
        for (const p of atk.targets) {
          const rs = atk.hits.map(() => { const r = defend(n++); return r === 'parry' && atk.unparryable ? 'dodge' : r; });
          for (const r of rs) { c.resolveHit(atk, r, p); if (c.outcome) break; }
          if (!c.outcome && !c.fighters[p].down && rs.every((r) => r === 'parry')) c.riposte(p);
        }
        c.endEnemyTurn();
      }
    } while (c.moreStrikes());
    c.endRound();
  }
  c.sweepCount ??= 0;
  return c;
}

test('Balance zu zweit: Bosse bleiben fordernd, gleich starke Paare schaffen sie mit Übung', () => {
  const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  for (const [enc, seq] of [['rook_fight', 9], ['miriam', 8], ['dreizehnter_gast', 8], ['miss_wren', 7], ['starling_fight', 7]]) {
    const fights = seeds.map((seed) => duoFight(pair(seq), enc, EXPERT, seed));
    // Starling (zwei Phasen, höheres Wesen) darf auch Geübte gelegentlich schlagen
    const wins = fights.filter((c) => c.outcome === 'won').length;
    assert.ok(wins >= (enc === 'starling_fight' ? 5 : seeds.length), `${enc} zu zweit (geübt): ${wins} von ${seeds.length} Siegen`);
    // Keiner kommt ungeschoren davon: beide müssen sich verteidigen (im Schnitt über mehrere Kämpfe)
    for (const n of [1, 2]) {
      const lost = mean(fights.map((c) => c.on(n, () => 1 - c.state.hp / c.state.maxHp)));
      assert.ok(lost >= 0.2, `${enc}: Spieler ${n} verliert spürbar Leben (${lost.toFixed(2)})`);
    }
    // Flächenangriffe kommen vor, aber nicht in jeder Runde
    const sweeps = mean(fights.map((c) => c.sweepCount));
    assert.ok(sweeps >= 1 && sweeps < mean(fights.map((c) => c.round)) * 0.6, `${enc}: ${sweeps} Flächenangriffe je Kampf`);
    // Zu zweit dauert ein Bosskampf nicht viel kürzer als allein
    const solo = mean(seeds.map((seed) => duoFight(hero(seq), enc, EXPERT, seed).round));
    const duo = mean(fights.map((c) => c.round));
    assert.ok(duo >= solo * 0.65, `${enc}: ${duo} Runden zu zweit, ${solo} allein`);
  }
  // Ohne Durchbruch reicht es auch zu zweit nicht gegen Starling, wenn man nur mittelmäßig verteidigt
  assert.notEqual(duoFight(pair(8), 'starling_fight', SKILLED).outcome, 'won');
});
