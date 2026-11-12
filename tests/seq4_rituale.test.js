// Seq-4-Rituale (Seb, 2026-11-12): zehn Halbgott-Prüfungen (core/Seq4.js), jede endet mit dem Schwellenwächter,
// jede ist solo, Fehlschlag −17 % Verdauung. Laternennacht in Echtzeit: core/Laternenwacht.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, fight, seeded, EXPERT } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { ordealId } from '../src/core/Pathways.js';
import { HG_FAIL_PCT, HG_FAIL_UNRUHE, TRAUM_ID, ECHO_FIGHTS, EISEN, SCHATTEN, UHR, PERFECT_DODGE } from '../src/core/Seq4.js';
import { Laternenwacht, inTriangle } from '../src/core/Laternenwacht.js';
import { HG_KIND, HG_SUDE, RELIKT, WX_MONEY_MULT } from '../src/data/seq4.js';
import { isPerfectDodge } from '../src/core/Combat.js';

const content = loadContent();
const MONSTER = 'torfgaenger'; // Wexmoor, Gebiet wx_vergessmoor
const ZONE = content.encounters[MONSTER].zone;

/** Auf Sequenz 5 eines Pfads, voll verdaut, stark ausgerüstet, im Monstergebiet. */
function at(pid, { seq = 5 } = {}) {
  const s = new GameState(content);
  s.addItem('revolver');
  s.weapon = 'revolver';
  s.pathway = { id: pid, seq, digestion: 100 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  s.map = ZONE;
  s.rng = seeded(5);
  return s;
}

/** Kampf wie im Spiel, aber nur so weit, bis der Gegner kaum noch steht (für Verschonen). */
function beatDown(c, pct = 0.1) {
  c.enemy.hp = Math.max(1, Math.floor(c.enemy.maxHp * pct));
}

test('Jede Sequenz 4 hat eine Halbgott-Prüfung ohne Ort und Fall, mit Wächter als Abschluss', () => {
  for (const [pid, p] of Object.entries(content.pathways)) {
    const r = p.seqs[4].ritual;
    assert.equal(r.hg, HG_KIND[pid], pid);
    assert.ok(r.ordeal && !r.map && !r.also_maps && !r.vision && !r.requires?.requires_flags, pid);
    assert.ok(content.encounters[ordealId(pid, 4)], `${pid}: Wächter`);
    const s = at(pid);
    s.addItem(`trank_${pid}_4`);
    const steps = s.ritualSteps(pid, 4);
    assert.ok(steps.at(-2).ordeal || steps.some((x) => x.ordeal && x.hg), `${pid}: der letzte Prüfungsschritt ist der Wächter`);
    assert.ok(s.seq4Hint().length > 80, pid);
    assert.equal(s.performRitual().ok, false, `${pid}: ohne Prüfung kein Ritual`);
  }
  for (const e of HG_SUDE) for (const id of Object.keys(e.zutaten)) assert.ok(content.items[id], `${e.id}: Zutat ${id}`);
  for (const id of ['wurf_saeure', 'wurf_gift', 'wurf_spreng', RELIKT, ...HG_SUDE.map((e) => e.id)]) assert.ok(content.items[id], id);
  assert.ok(content.market.merchants.wx_pfandleiherin.stock.some((e) => e.item === 'wurf_spreng'));
});

test('Wexmoor: Gegner tragen deutlich mehr Geld (Waage braucht bis 10 000 Schilling)', () => {
  assert.ok(content.loot[MONSTER].money[1] >= 6 * WX_MONEY_MULT / 2, JSON.stringify(content.loot[MONSTER].money));
  assert.ok(content.loot.torfgaenger_elite.money[0] >= 4 * WX_MONEY_MULT);
});

test('Fehlschlag: −17 % Verdauung, +5 Unruhe (halbiert ab Seq 5); Abbruch vor dem ersten Schritt ist umsonst', () => {
  const s = at('echo');
  assert.equal(s.startEcho().ok, true);
  assert.equal(s.seq4Cancel().text, 'Abgebrochen, ohne Folgen.');
  s.startEcho();
  s.seq4().wins = 1;
  const r = s.seq4Cancel();
  assert.equal(r.passed, false);
  assert.equal(s.pathway.digestion, 100 - HG_FAIL_PCT);
  assert.equal(s.unruhe, HG_FAIL_UNRUHE / 2); // ab Seq 5 halbe Unruhe-Steigerung
});

test('Solo: Spieler 2 kämpft in keiner Prüfung mit, und der Wächter zählt nur aus der Prüfung', () => {
  const s = at('echo');
  s.addP2();
  s.startEcho();
  const c = new Combat(s, MONSTER);
  assert.equal(c.duo, false);
  assert.ok(c.rules.deaf);
  // Den Wächter außerhalb der Prüfung zu schlagen, besteht nichts
  const t = at('eisen');
  t.flags.add(`won_${ordealId('eisen', 4)}`);
  assert.equal(t.ordealDone('eisen', 4), false);
});

// --- Laterne ---------------------------------------------------------------------------------------
test('Laterne: sechs Laternen im Monstergebiet; wer nur zusieht, verliert, wer das Licht hält, ruft den Sonnenaufgang', () => {
  const s = at('laterne');
  s.map = 'buero';
  s.addItem('lampenoel', 6);
  assert.match(s.startSiege().text, /Monstergebiet/);
  s.map = ZONE;
  assert.equal(s.startSiege().ok, true);
  assert.equal(s.itemCount('lampenoel'), 0);
  const run = (bot) => {
    let nerves = 100;
    let hp = 300;
    const w = new Laternenwacht({ x: 0, y: 0 }, { rng: seeded(3), hooks: { nerves: () => nerves, spend: (n) => { nerves = Math.max(0, nerves - n); }, hurt: (n) => { hp = Math.max(1, hp - n); return hp; }, unruhe: () => {} } });
    const p = { x: 0, y: 0 };
    for (let t = 0; t < 400 && !w.outcome; t += 0.1) {
      w.update(0.1, bot(w, p));
      nerves = Math.min(100, nerves + 0.1);
    }
    return w;
  };
  const idle = run((w, p) => ({ ...p }));
  assert.equal(idle.outcome, 'lost');
  const good = run((w, p) => {
    if (w.guardian && w.sunriseReady()) return { ...p, sunrise: true };
    const low = [...w.lanterns].sort((a, b) => a.oil - b.oil).find((l) => l.oil < 60 && !(w.guardian && Math.hypot(w.guardian.x - l.x, w.guardian.y - l.y) < 30));
    if (!low) return { ...p };
    const d = Math.hypot(low.x - p.x, low.y - p.y);
    if (d > 12) { p.x += ((low.x - p.x) / d) * 6; p.y += ((low.y - p.y) / d) * 6; return { ...p }; }
    return { ...p, refill: true };
  });
  assert.equal(good.outcome, 'won');
  assert.equal(good.kills, 15);
  assert.ok(inTriangle({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }));
  // Ergebnis an den Stand
  assert.equal(s.endSiege({ won: true }).passed, true);
  assert.ok(s.hgPassed('laterne'));
});

// --- Faden -----------------------------------------------------------------------------------------
test('Faden: fünf Fäden an fünf Wesen aus fünf Gebieten, Schlaf, Traum gegen alle, dann der Wächter, ohne Heilung', () => {
  const s = at('faden');
  const zones = Object.entries(content.encounters).filter(([, e]) => e.zone && e.attacks?.length && !e.boss).map(([id, e]) => [id, e.zone]);
  const seen = new Set();
  const picks = zones.filter(([, z]) => (seen.has(z) ? false : seen.add(z))).slice(0, 5);
  assert.equal(picks.length, 5);
  for (const [i, [id, z]] of picks.entries()) {
    s.map = z;
    const c = new Combat(s, id);
    assert.ok(c.rules?.mark, id);
    assert.equal(c.canMarkFate(), true);
    c.markFate();
    assert.equal(c.canMarkFate(), false, 'ein Faden pro Kampf');
    assert.equal(s.seq4().marks.length, i + 1);
  }
  assert.equal(s.canMarkFate(picks[0][0]), false, 'jedes Wesen und jedes Gebiet nur einmal');
  assert.match(s.seq4Rest(), /fünf/);
  assert.equal(s.pendingCombat, TRAUM_ID);
  const dream = content.encounters[TRAUM_ID];
  assert.equal(dream.attacks.length, 5);
  const c = new Combat(s, TRAUM_ID);
  assert.ok(c.rules.noHeal && c.rules.solo);
  s.hp = 10;
  assert.equal(s.heal(20), 0, 'im Traum heilt nichts');
  c.outcome = 'won';
  c.finish();
  assert.equal(s.pendingCombat, ordealId('faden', 4), 'der Wächter ist der letzte Traumgegner');
  const g = new Combat(s, ordealId('faden', 4));
  assert.ok(g.rules.noHeal);
  g.outcome = 'won';
  g.finish();
  assert.ok(s.hgPassed('faden'));
});

// --- Maske -----------------------------------------------------------------------------------------
test('Maske: ohne Artefakte, nur der einfache Angriff, verschonen; töten scheitert; danach der Wächter', () => {
  const target = Object.keys(content.encounters).find((id) => /^enemy_sk_.*_hand$/.test(id));
  const s = at('maske');
  s.addItem('sq_torfsiegel');
  assert.equal(s.startMaske().ok, false, 'Artefakte verboten');
  s.removeItem('sq_torfsiegel');
  assert.equal(s.startMaske().ok, true);
  assert.ok(s.maskeTarget(target), target);
  const c = new Combat(s, target);
  assert.ok(c.rules.onlyAttack);
  assert.equal(c.canUse('attack'), true);
  c.fighters[1].ap = 6;
  assert.ok(c.skills().filter((k) => k.id !== 'attack').every((k) => !k.usable), 'keine Fähigkeit');
  assert.ok(c.enemy.maxHp > new Combat(at('eisen'), target).enemy.maxHp, 'schwächere Beyonder kämpfen auf Stufe 5');
  beatDown(c);
  assert.equal(c.canSpare(), true);
  c.spare();
  c.finish();
  assert.ok(s.flags.has(`zweifel_${target}`));
  assert.equal(s.pendingCombat, ordealId('maske', 4));
  const g = new Combat(s, ordealId('maske', 4));
  assert.ok(g.rules.onlyAttack && !g.rules.spare, 'auch beim Wächter keine Fähigkeit');
  g.outcome = 'won';
  g.finish();
  assert.ok(s.hgPassed('maske'));
  // Töten heißt scheitern
  const t = at('maske');
  t.startMaske();
  const k = new Combat(t, target);
  k.outcome = 'won';
  k.finish();
  assert.equal(t.pathway.digestion, 100 - HG_FAIL_PCT);
});

// --- Echo ------------------------------------------------------------------------------------------
test('Echo: taub drei Kämpfe, dann der Wächter; Niederlage scheitert', () => {
  const s = at('echo');
  s.startEcho();
  assert.equal(s.seq4Deaf(), true);
  for (let i = 0; i < ECHO_FIGHTS; i++) {
    const c = new Combat(s, MONSTER);
    assert.ok(c.rules.deaf);
    c.outcome = 'won';
    c.finish();
  }
  assert.equal(s.pendingCombat, ordealId('echo', 4));
  const g = new Combat(s, ordealId('echo', 4));
  assert.ok(g.rules.deaf);
  g.outcome = 'lost';
  g.finish();
  assert.equal(s.hgPassed('echo'), false);
  assert.equal(s.pathway.digestion, 100 - HG_FAIL_PCT);
  assert.equal(s.seq4Deaf(), false, 'nach dem Scheitern hört man wieder');
});

// --- Kessel ----------------------------------------------------------------------------------------
test('Kessel: Essenzen erst ab voll verdauter 5 mit Formel der 4; fünf getrunken, dann Wächter nur mit Flaschen', () => {
  const s = at('kessel');
  assert.equal(s.hgRecipes().length, 0, 'ohne Formel der 4 keine Rezepte');
  s.addItem('formel_kessel_4');
  s.pathway.digestion = 90;
  assert.equal(s.hgRecipes().length, 0, 'erst voll verdaut');
  s.pathway.digestion = 100;
  assert.equal(s.hgRecipes().length, 5);
  for (const [i, e] of s.content.seq4Sude.entries()) {
    for (const [id, n] of Object.entries(e.zutaten)) s.addItem(id, n);
    s.addItem('leeres_gefaess');
    assert.equal(s.brewEssence(i).ok, true, e.id);
    const r = s.drinkEssence(i);
    assert.equal(r.ok, true);
    if (i === 4) assert.equal(r.fight, ordealId('kessel', 4));
  }
  s.addItem('wurf_spreng', 2);
  const c = new Combat(s, ordealId('kessel', 4));
  assert.ok(c.rules.potionOnly);
  assert.equal(c.canUse('attack'), false, 'kein Angriff');
  const hp = c.enemy.hp;
  c.resolveHit(c.prepareAttack(c.enc.attacks[0]), 'parry');
  assert.equal(c.enemy.hp, hp, 'Konter prallen ab');
  assert.ok(c.useItem('wurf_spreng'));
  assert.ok(c.enemy.hp < hp, 'die Flasche trifft');
  assert.ok(hp - c.enemy.hp > 34 * 2 * 1.4 - 10, 'die fünf Essenzen verstärken die Flaschen');
});

// --- Eisen -----------------------------------------------------------------------------------------
test('Eisen: fünf Artefakte, doppelte Last, nichts angelegt ruft den Wächter; nie ausweichen, erst ab Runde 6 tödlich', () => {
  const s = at('eisen');
  const arts = Object.entries(content.items).filter(([, it]) => it.kind === 'artifact' && !(it.boons ?? []).some((b) => b.key === 'carry')).slice(0, EISEN.artifacts).map(([id]) => id);
  for (const id of arts) s.addItem(id);
  s.addItem('moorwasser', Math.ceil(s.carryCapacity() * EISEN.load) + 2);
  assert.ok(s.eisenConditions().ok, JSON.stringify(s.eisenConditions()));
  s.seq4Tick();
  assert.equal(s.pendingCombat, ordealId('eisen', 4));
  const c = new Combat(s, ordealId('eisen', 4));
  const atk = c.prepareAttack(c.enc.attacks[0]);
  assert.equal(c.resolveHit(atk, 'dodge').result, 'miss', 'Ausweichen verboten');
  c.enemy.hp = 5;
  c.hurtEnemy(500);
  assert.equal(c.enemy.hp, 1, 'vor Runde 6 fällt er nicht');
  for (let i = 0; i < 5; i++) c.endRound();
  c.hurtEnemy(500);
  assert.equal(c.outcome, 'won');
  c.finish();
  assert.ok(s.hgPassed('eisen'));
});

// --- Schlüssel -------------------------------------------------------------------------------------
test('Schlüssel: der Schatten hat 40 % Leben, Schattenattacke plus eine Fähigkeit je Runde; stirbt er, lebt der Körper', () => {
  const s = at('schluessel');
  const body = s.hp;
  assert.equal(s.startShadow().ok, true);
  const c = new Combat(s, MONSTER);
  assert.ok(c.rules.shadow && c.rules.noParry && c.rules.noItems);
  assert.equal(s.hp, Math.round(s.seq4().shadowMax), 'der Schatten kämpft mit eigenem Leben');
  assert.equal(c.skillDef('attack').name, 'Schattenattacke');
  assert.ok(c.skills().length <= 2, 'Schattenattacke und genau eine Fähigkeit');
  assert.equal(c.canUseItem(), false);
  c.outcome = 'won';
  c.finish();
  assert.equal(s.hp, body, 'der Körper bleibt unberührt');
  assert.equal(s.seq4().wins, 1);
  const d = new Combat(s, MONSTER);
  d.outcome = 'lost';
  d.finish();
  assert.equal(s.hp, body);
  assert.equal(s.shadowActive(), false);
  assert.equal(s.pathway.digestion, 100 - HG_FAIL_PCT);
  // Zwei Siege rufen den Wächter
  const t = at('schluessel');
  t.startShadow();
  for (let i = 0; i < SCHATTEN.fights; i++) { const f = new Combat(t, MONSTER); f.outcome = 'won'; f.finish(); }
  assert.equal(t.pendingCombat, ordealId('schluessel', 4));
});

// --- Waage -----------------------------------------------------------------------------------------
test('Waage: Besitz verwahrt, jedes Los gekauft, dann der Wächter; ein ausgelassenes Los scheitert', () => {
  const play = (buyAll) => {
    const s = at('sq_waage');
    s.money = 20000;
    s.addItem('tonikum', 3);
    s.gatheringOpen = () => true;
    s.isMember = () => true;
    assert.equal(s.startWaage(15000).ok, true);
    assert.equal(s.itemCount('tonikum'), 0);
    assert.equal(s.money, 15000);
    s.startSession('salz');
    const a = s.auction;
    let guard = 0;
    while ((a.phase === 'lot' || a.phase === 'request') && guard++ < 60) {
      if (a.phase === 'lot') {
        if (!buyAll) { s.passLot(); continue; }
        let r = s.bid();
        while (r.outbid) r = s.bid();
      } else s.declineRequest();
    }
    s.endSession();
    return s;
  };
  const ok = play(true);
  assert.ok(ok.seq4().allBought);
  assert.equal(ok.pendingCombat, ordealId('sq_waage', 4));
  const g = new Combat(ok, ordealId('sq_waage', 4));
  g.outcome = 'won';
  g.finish();
  assert.ok(ok.hgPassed('sq_waage'));
  assert.equal(ok.itemCount('tonikum'), 3, 'der Besitz ist zurück');
  assert.ok(ok.money > 5000);
  const bad = play(false);
  assert.equal(bad.pathway.digestion, 100 - HG_FAIL_PCT);
  assert.equal(bad.itemCount('tonikum'), 3);
});

// --- Moor ------------------------------------------------------------------------------------------
test('Moor: fünf Dinge zersetzen, Relikt mit Eigenschaften, Wächter mit Moorwasser je Runde', () => {
  const s = at('sq_moor');
  const things = Object.entries(content.items).filter(([id, it]) => it.kind === 'artifact' && id !== RELIKT).slice(0, 5).map(([id]) => id);
  for (const id of things) s.addItem(id);
  for (const id of things) assert.equal(s.decayItem(id).ok, true, id);
  assert.ok(s.pathway.relikt.boons.length >= 1);
  assert.equal(s.itemCount(RELIKT), 1);
  assert.ok(s.artifactEffects().some((l) => l === s.pathway.relikt.boons), 'das Relikt wirkt mit seinen eigenen Eigenschaften');
  assert.equal(s.summonMoor().ok, false, 'ohne Moorwasser nicht');
  s.addItem('moorwasser', 2);
  assert.equal(s.summonMoor().ok, true);
  const c = new Combat(s, ordealId('sq_moor', 4));
  assert.equal(s.itemCount('moorwasser'), 1, 'Runde 1 trinkt');
  c.endRound();
  assert.equal(s.itemCount('moorwasser'), 0);
  c.endRound();
  assert.equal(c.outcome, 'lost', 'kein Moorwasser mehr');
  c.finish();
  assert.equal(s.pathway.digestion, 100 - HG_FAIL_PCT);
  // das Relikt bleibt nach dem Aufstieg
  s.flags.add(s.hgFlag('sq_moor'));
  s.flags.add('ritual_sq_moor_4');
  s.addItem('trank_sq_moor_4');
  s.drink('trank_sq_moor_4', () => 0.99);
  assert.ok(s.pathway.relikt, 'Relikt bleibt');
});

// --- Uhr -------------------------------------------------------------------------------------------
test('Uhr: Perfect-Dodge-Fenster, bei Monstern kein Fehler, beim Wächter drei', () => {
  assert.equal(isPerfectDodge('dodge', PERFECT_DODGE - 1), true);
  assert.equal(isPerfectDodge('dodge', PERFECT_DODGE + 30), false);
  const s = at('sq_uhr');
  s.startUhr4();
  for (let i = 0; i < UHR.monsters; i++) {
    const c = new Combat(s, MONSTER);
    const atk = c.nextEnemyAttack();
    for (const _ of atk.hits) c.resolveHit(atk, 'perfect');
    assert.equal(c.outcome, null);
    c.outcome = 'won';
    c.finish();
  }
  assert.equal(s.pendingCombat, ordealId('sq_uhr', 4));
  const g = new Combat(s, ordealId('sq_uhr', 4));
  const atk = g.prepareAttack(g.enc.attacks[0]);
  for (let i = 0; i < UHR.guardianMisses; i++) g.resolveHit(atk, 'dodge');
  assert.equal(g.outcome, null, 'drei Fehler gehen');
  g.resolveHit(atk, 'parry');
  assert.equal(g.outcome, 'lost', 'der vierte nicht (Parieren zählt als Fehler)');
  g.finish();
  assert.equal(s.pathway.digestion, 100 - HG_FAIL_PCT);
  // Bei Monstern ist schon ein gewöhnliches Ausweichen zu viel
  const t = at('sq_uhr');
  t.startUhr4();
  const m = new Combat(t, MONSTER);
  const a2 = m.nextEnemyAttack();
  m.resolveHit(a2, 'dodge');
  assert.equal(m.outcome, 'lost');
});

test('Ein Seq-4-Ritual lässt sich nach bestandener Prüfung vollziehen und der Halbgott-Trank trinken', () => {
  const s = at('echo');
  const r = s.ritualDef('echo', 4);
  for (const [id, n] of Object.entries(r.consumes ?? {})) s.addItem(id, n);
  s.money = r.tribute;
  s.wins = r.requires.min_wins;
  s.conclusions = content.deductions.slice(0, r.min_conclusions).map((d) => d.id);
  s.addItem('trank_echo_4');
  s.flags.add(s.hgFlag('echo'));
  const done = s.performRitual();
  assert.equal(done.ok, true, done.text);
  assert.equal(s.drinkCheck('trank_echo_4').ok, true);
  void fight; void EXPERT;
});

test('Solo als Spieler 2: der Prüfling kämpft allein, danach sind die Werte wieder bei ihren Besitzern', () => {
  const s = at('eisen');
  s.addP2();
  s.withPlayer(2, () => { s.pathway = { id: 'echo', seq: 5, digestion: 100 }; s.updateMaxHp(); s.hp = s.maxHp; s.startEcho(); });
  const p1hp = s.hp;
  s.combatBy = 2;
  const c = new Combat(s, MONSTER);
  assert.ok(c.rules?.deaf && !c.duo);
  assert.equal(s.pathway.id, 'echo', 'Spieler 2 ist Kämpfer 1');
  c.outcome = 'won';
  c.finish();
  assert.equal(s.pathway.id, 'eisen');
  assert.equal(s.hp, p1hp);
  assert.equal(s.withPlayer(2, () => s.seq4().wins), 1);
});

test('Unruhe steigt ab Seq 5 nur halb so stark, sinkt aber normal', () => {
  const s = new GameState(loadContent());
  s.pathway = { id: 'starling', seq: 6, digestion: 0 };
  s.setUnruhe(10);
  assert.equal(s.unruhe, 10);
  s.unruhe = 0;
  s.pathway.seq = 5;
  s.setUnruhe(10);
  assert.equal(s.unruhe, 5);
  s.setUnruhe(2);
  assert.equal(s.unruhe, 2);
});
