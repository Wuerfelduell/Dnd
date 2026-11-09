// Zwei Spieler: eigener Pfad für Spieler 2 und Kämpfe, die zu zweit fair bleiben.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, ENEMY_HP_MULT, DUO_HP_SHARE, DUO_POWER_MIN, duoHpMult } from '../src/core/Combat.js';
import { loadContent, seeded, SKILLED, EXPERT } from './helpers.js';

const content = loadContent();
const always = () => 0.99; // Zufall, der nie Kontrollverlust auslöst

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

/** Ermittler und Spieler 2, beide mit Schlagstock; Spieler 2 auf seinem eigenen Pfad. */
function pair(seq = null, seq2 = seq, id2 = 'laterne') {
  const s = hero(seq);
  s.addP2();
  s.withPlayer(2, () => {
    s.addItem('schlagstock');
    s.equip('schlagstock');
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
      if (c.nextEnemyAttack()) hit.push(c.target);
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
function duoFight(state, enc, defend) {
  const c = new Combat(state, enc);
  c.rng = seeded(7);
  let n = 0;
  while (!c.outcome && c.round <= 80) {
    for (const p of [1, 2]) {
      if (!c.fighters[p] || c.fighters[p].down || c.outcome) continue;
      c.actor = p;
      c.on(p, () => { if (state.hp < state.maxHp * 0.35 && state.itemCount('verband') && c.canUseItem()) c.useItemNow('verband'); });
      c.useSkill('attack', ['good']);
    }
    if (c.outcome) break;
    do {
      const atk = c.nextEnemyAttack();
      if (atk) {
        const rs = atk.hits.map(() => { const r = defend(n++); return r === 'parry' && atk.unparryable ? 'dodge' : r; });
        for (const r of rs) { c.resolveHit(atk, r); if (c.outcome) break; }
        if (!c.outcome && rs.every((r) => r === 'parry')) c.riposte();
        c.endEnemyTurn();
      }
    } while (c.moreStrikes());
    c.endRound();
  }
  return c;
}

test('Balance zu zweit: Bosse bleiben fordernd, gleich starke Paare schaffen sie mit Übung', () => {
  for (const [enc, seq] of [['rook_fight', 9], ['miriam', 8], ['dreizehnter_gast', 8], ['miss_wren', 7], ['starling_fight', 7]]) {
    const c = duoFight(pair(seq), enc, EXPERT);
    assert.equal(c.outcome, 'won', `${enc} zu zweit (geübt)`);
    // Keiner kommt ungeschoren davon: beide müssen sich verteidigen
    for (const n of [1, 2]) {
      const lost = c.on(n, () => 1 - c.state.hp / c.state.maxHp);
      assert.ok(lost >= 0.2, `${enc}: Spieler ${n} verliert spürbar Leben (${lost.toFixed(2)})`);
    }
    // Zu zweit dauert ein Bosskampf nicht viel kürzer als allein
    const solo = duoFight(hero(seq), enc, EXPERT);
    assert.ok(c.round >= solo.round * 0.65, `${enc}: ${c.round} Runden zu zweit, ${solo.round} allein`);
  }
  // Ohne Durchbruch reicht es auch zu zweit nicht gegen Starling, wenn man nur mittelmäßig verteidigt
  assert.notEqual(duoFight(pair(8), 'starling_fight', SKILLED).outcome, 'won');
});
