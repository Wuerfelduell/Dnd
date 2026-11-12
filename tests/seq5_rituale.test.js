// Seq-5-Rituale (Seb, 2026-11-12): jeder Pfad legt vor dem Trank der Sequenz 5 eine eigene Prüfung ab (core/Seq5.js),
// ortsunabhängig und ohne Fallbezug; der Kessel braut ab Sequenz 6 frei (core/Sude.js, data/sude.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, fight, passTrial } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { Combat } from '../src/core/Combat.js';
import { FAIL_PCT, FAIL_UNRUHE, LATERNEN, LAMPENOEL, KOKON_FAEDEN, EISEN, DIEBSTAHL, HANDEL, UHR, MASKE_PRUEFUNGEN, isBeyonderFoe } from '../src/core/Seq5.js';
import { SUDE, SUD_PFUSCH, LEERES_GEFAESS, sudRecipeFor } from '../src/data/sude.js';
import { SPINNENFADEN, GEFAESS_ERINNERUNG, UHR_ITEM } from '../src/data/seq5.js';

const content = loadContent();
const TRIALS = { laterne: 'laterne', faden: 'faden', maske: 'maske', echo: 'echo', kessel: 'kessel', eisen: 'eisen', schluessel: 'schluessel', sq_waage: 'waage', sq_moor: 'moor', sq_uhr: 'uhr' };

/** Auf Sequenz 6 eines Pfads, voll verdaut, mit allem, was das Ritual verbraucht, und dem Trank der 5. */
function at(pid, { consumes = true } = {}) {
  const s = new GameState(content);
  s.pathway = { id: pid, seq: 6, digestion: 100 };
  s.updateMaxHp();
  s.hp = s.maxHp;
  s.composure = s.maxComposure();
  if (consumes) for (const [id, n] of Object.entries(s.ritualDef(pid, 5).consumes ?? {})) s.addItem(id, n);
  s.addItem(`trank_${pid}_5`);
  return s;
}

test('Jede Sequenz 5 hat eine Prüfung ohne Ort, Fall, alte Schlüsse oder Tribut', () => {
  for (const [pid, p] of Object.entries(content.pathways)) {
    const r = p.seqs['5'].ritual;
    assert.equal(r.trial, TRIALS[pid], `${pid}: Prüfung`);
    assert.equal(r.map, undefined, `${pid}: kein Ritualort`);
    assert.equal(r.min_conclusions, undefined, pid);
    assert.equal(r.tribute, undefined, pid);
    assert.equal(r.requires, undefined, `${pid}: keine Fall- oder Siegbedingung`);
    assert.ok(FAIL_PCT[r.trial] >= 10 && FAIL_PCT[r.trial] <= 20, pid);
    for (const id of Object.keys(r.consumes)) assert.ok(content.items[id], `${pid}: Zutat ${id}`);
  }
  // Schritte und Hinweis stehen für jeden Pfad in der Liste
  for (const pid of Object.keys(TRIALS)) {
    const s = at(pid);
    const steps = s.ritualSteps(pid, 5);
    assert.ok(steps.some((x) => x.trial === TRIALS[pid]), pid);
    assert.ok(s.seq5Hint().length > 40, pid);
    if (pid !== 'sq_moor') assert.equal(s.performRitual().ok, false, `${pid}: ohne Prüfung kein Ritual`); // das Moor verlangt nur das gefüllte Gefäß
  }
});

test('Neue Gegenstände, Händler und Beute', () => {
  for (const id of [LEERES_GEFAESS, GEFAESS_ERINNERUNG, UHR_ITEM, SPINNENFADEN, 'laternenbestie', 'kokonspinne']) assert.ok(content.items[id] || content.encounters[id], id);
  for (const m of ['nell', 'crane', 'wx_pfandleiherin', 'k3h_troedlerin']) assert.ok(content.market.merchants[m].stock.some((e) => e.item === LEERES_GEFAESS), `${m}: leeres Gefäß`);
  for (const m of ['crane', 'wx_pfandleiherin', 'k3h_troedlerin']) assert.ok(content.market.merchants[m].stock.some((e) => e.item === UHR_ITEM), `${m}: Uhr`);
  assert.ok(content.loot.fadenspinne.drops.some((d) => d.item === SPINNENFADEN));
  assert.ok(content.encounters.laternenbestie.mirror && content.encounters.laternenbestie.occult);
  const s = new GameState(content);
  assert.equal(s.sellPrice(GEFAESS_ERINNERUNG), null, 'die fremde Erinnerung ist unverkäuflich');
});

test('Fehlschlag kostet Verdauung und Unruhe, Abbruch ohne Beginn ist umsonst', () => {
  const s = at('eisen');
  assert.equal(s.seq5Cancel().ok, false);
  s.hp = Math.floor(s.maxHp * 0.3);
  assert.equal(s.startEisen().ok, true);
  assert.equal(s.seq5Cancel().text, 'Abgebrochen, ohne Folgen.');
  assert.equal(s.pathway.digestion, 100);
  s.startEisen();
  const r = s.seq5Heal(5);
  assert.equal(r, undefined);
  assert.equal(s.pathway.digestion, 100 - FAIL_PCT.eisen);
  assert.equal(s.unruhe, FAIL_UNRUHE);
  assert.equal(s.seq5().active, undefined, 'der Stand ist zurückgesetzt');
});

// --- Laterne --------------------------------------------------------------------------------------
test('Laterne: zehn Laternen im Monstergebiet rufen die Bestie, nur ein Leuchten als Todesstoß zählt', () => {
  const s = at('laterne');
  s.map = 'buero';
  s.addItem(LAMPENOEL, LATERNEN);
  assert.match(s.lightLantern().text, /Monstergebiet/);
  s.map = 'marsch';
  for (let i = 1; i < LATERNEN; i++) assert.equal(s.lightLantern().text.startsWith(`Laterne ${i} von`), true);
  const r = s.lightLantern();
  assert.equal(r.fight, 'laternenbestie');
  assert.equal(s.pendingCombat, 'laternenbestie');
  assert.equal(s.itemCount(LAMPENOEL), 0);
  // Die Bestie spiegelt den Spieler: Leben nach seinem Höchstleben, Schaden nach seiner Schlagkraft
  const c = new Combat(s, 'laternenbestie');
  assert.ok(Math.abs(c.enemy.maxHp - s.maxHp * 1.4) <= 2, `${c.enemy.maxHp} ~ ${s.maxHp * 1.4}`);
  assert.ok(c.enc.attacks.every((a) => Number.isInteger(a.damage) && a.damage >= 1));
  assert.ok(!s.awes('laternenbestie'));
  // Todesstoß mit gewöhnlichem Angriff: gescheitert
  c.rng = () => 0.5;
  c.enemy.hp = 1;
  c.ap = 6;
  c.useSkill('attack', ['good']);
  assert.equal(c.outcome, 'won');
  assert.equal(c.killedBy.holy, false);
  c.finish();
  assert.equal(s.pathway.digestion, 100 - FAIL_PCT.laterne);
  assert.ok(!s.seq5().done);
  // Noch einmal, diesmal mit Lichtstoß
  s.pathway.digestion = 100;
  const c2 = new Combat(s, 'laternenbestie');
  c2.rng = () => 0.5;
  c2.enemy.hp = 1;
  c2.ap = 6;
  c2.useSkill('lichtstoss', ['good']);
  assert.equal(c2.outcome, 'won');
  assert.equal(c2.killedBy.holy, true);
  const res = c2.finish();
  assert.match(res.text, /bestanden/);
  assert.ok(s.seq5().done);
  assert.equal(s.performRitual().ok, true);
  assert.equal(s.drinkCheck('trank_laterne_5').ok, true);
});

// --- Faden ----------------------------------------------------------------------------------------
test('Faden: Fäden aus okkulten Wesen, Kokon macht schwer, Spinne erst unter 20 %', () => {
  const s = at('faden');
  // Solange man den Kokon sucht, tragen okkulte Wesen die Fäden (40 %)
  const c = new Combat(s, 'moorleiche');
  c.rng = () => 0.1;
  const loot = c.rollLoot(true);
  assert.equal(loot.items[SPINNENFADEN], 1);
  assert.match(s.wrapCocoon().text, /brauchst du 10/);
  s.addItem(SPINNENFADEN, KOKON_FAEDEN);
  assert.equal(s.wrapCocoon().ok, true);
  assert.equal(s.itemCount(SPINNENFADEN), 0);
  assert.ok(s.isOverloaded(), 'im Kokon läuft man wie überladen');
  assert.match(s.lureSpider().text, /unter 20 %/);
  s.hp = Math.floor(s.maxHp * 0.15);
  s.composure = Math.floor(s.maxComposure() * 0.15);
  assert.equal(s.lureSpider().fight, 'kokonspinne');
  const c2 = new Combat(s, 'kokonspinne');
  c2.enemy.hp = 1;
  c2.ap = 6;
  c2.rng = () => 0.5;
  c2.useSkill('attack', ['good']);
  assert.match(c2.finish().text, /bestanden/);
  assert.ok(!s.cocoonActive());
  assert.ok(!s.isOverloaded());
  assert.equal(s.performRitual().ok, true);
});

test('Faden: Niederlage gegen die Spinne zerreißt den Kokon und kostet Verdauung', () => {
  const s = at('faden');
  s.addItem(SPINNENFADEN, KOKON_FAEDEN);
  s.wrapCocoon();
  const c = new Combat(s, 'kokonspinne');
  c.outcome = 'lost';
  c.finish();
  assert.equal(s.pathway.digestion, 100 - FAIL_PCT.faden);
  assert.ok(!s.cocoonActive());
});

// --- Maske ----------------------------------------------------------------------------------------
test('Maske: Gesicht eines besiegten Beyonders, zwei überzeugte Beyonder; eine falsche Antwort kostet alles', () => {
  const s = at('maske');
  assert.ok(isBeyonderFoe('enemy_sk_asche_hand', content.encounters.enemy_sk_asche_hand));
  assert.ok(!isBeyonderFoe('moorleiche', content.encounters.moorleiche));
  assert.ok(!isBeyonderFoe('laternenbestie', content.encounters.laternenbestie));
  assert.ok(!s.canImpersonate('tresswell'));
  const c = new Combat(s, 'enemy_sk_asche_hand');
  c.outcome = 'won';
  assert.match(c.finish().text, /Steckbrief/);
  const id = s.maskeIdentity();
  assert.ok(id && content.pathways[id.pathway] && id.mark);
  assert.ok(s.isBeyonderNpc('tresswell') && s.isBeyonderNpc('sabeth') && !s.isBeyonderNpc('marlowe'));
  assert.ok(s.canImpersonate('tresswell') && !s.canImpersonate('marlowe'));
  const right = (quiz) => quiz.rounds[quiz.step].options.indexOf(quiz.rounds[quiz.step].answer);
  // Erster Beyonder: zwei richtige Antworten
  let q = s.startImpersonation('tresswell').quiz;
  assert.equal(q.rounds.length, 2);
  assert.ok(s.answerImpersonation(right(q)).next);
  let r = s.answerImpersonation(right(q));
  assert.equal(r.passed, true);
  assert.ok(!s.seq5IsDone('maske'));
  assert.ok(!s.canImpersonate('tresswell'), 'jeder nur einmal');
  // Zweiter: eine falsche Antwort
  q = s.startImpersonation('sabeth').quiz;
  const wrong = (q.rounds[0].options.indexOf(q.rounds[0].answer) + 1) % 3;
  r = s.answerImpersonation(wrong);
  assert.equal(r.passed, false);
  assert.equal(s.pathway.digestion, 100 - FAIL_PCT.maske);
  assert.ok(s.flags.has('misstrauen_sabeth') && s.flags.has('misstrauen_tresswell'), 'alle Angesprochenen misstrauen');
  assert.equal(s.maskeIdentity(), null);
  // Neuer Anlauf: Gesicht nehmen, zwei andere überzeugen, Ritual
  const c2 = new Combat(s, 'enemy_sk_flut_hand');
  c2.outcome = 'won';
  c2.finish();
  for (const npc of ['kittering', 'nell']) {
    q = s.startImpersonation(npc).quiz;
    s.answerImpersonation(right(q));
    r = s.answerImpersonation(right(q));
  }
  assert.equal(s.seq5().convinced.length, MASKE_PRUEFUNGEN);
  assert.ok(s.seq5IsDone('maske'));
  assert.equal(s.performRitual().ok, true);
});

// --- Echo -----------------------------------------------------------------------------------------
test('Echo: unter 10 % verschonen und die Stimme rauben, die Zutaten gehen drauf, das Ritual ist bezahlt', () => {
  const s = at('echo');
  const c = new Combat(s, 'enemy_sk_asche_hand');
  c.rng = () => 0.5;
  assert.ok(!c.canStealVoice());
  c.enemy.hp = Math.floor(c.enemy.maxHp * 0.08);
  c.hurtEnemy(0);
  assert.ok(c.voiceWindow);
  assert.ok(c.canStealVoice());
  const r = c.stealVoice();
  assert.equal(c.outcome, 'spared');
  assert.match(r.text, /bestanden/);
  const res = c.finish();
  assert.equal(res.outcome, 'spared');
  assert.equal(res.loot, null);
  assert.ok(!s.flags.has('won_enemy_sk_asche_hand'));
  assert.ok(s.flags.has('stimmlos_enemy_sk_asche_hand'));
  for (const id of Object.keys(s.ritualDef('echo', 5).consumes)) assert.equal(s.itemCount(id), 0, id);
  const steps = s.ritualSteps('echo', 5);
  assert.ok(steps.filter((x) => x.consume).every((x) => x.done), 'bezahlte Zutaten gelten als erledigt');
  assert.equal(s.performRitual().ok, true);
  assert.equal(s.drinkCheck('trank_echo_5').ok, true);
});

test('Echo: wer den Beyonder unter 10 % doch tötet, scheitert; ohne Zutaten gibt es kein Rauben', () => {
  const s = at('echo', { consumes: false });
  const c = new Combat(s, 'enemy_sk_asche_hand');
  c.rng = () => 0.5;
  c.enemy.hp = Math.floor(c.enemy.maxHp * 0.08);
  c.hurtEnemy(0);
  assert.ok(!c.canStealVoice(), 'Zutaten fehlen');
  c.enemy.hp = 1;
  c.ap = 6;
  c.useSkill('attack', ['good']);
  c.finish();
  assert.equal(s.pathway.digestion, 100 - FAIL_PCT.echo);
});

// --- Kessel ---------------------------------------------------------------------------------------
test('Kessel: freies Brauen ab Sequenz 6, Rezepte und Pfusch, Wirkung auf Zeit', () => {
  const s = new GameState(content);
  s.pathway = { id: 'kessel', seq: 7, digestion: 100 };
  assert.match(s.freeBrewBlock(), /Sequenz 6/);
  s.pathway.seq = 6;
  assert.ok(s.freeBrewUnlocked());
  const other = new GameState(content);
  other.pathway = { id: 'eisen', seq: 5, digestion: 0 };
  assert.match(other.freeBrewBlock(), /Pfad des Kessels/);
  assert.ok(SUDE.length >= 10 && SUDE.length <= 20);
  assert.equal(new Set(SUDE.map((x) => [...x.zutaten].sort().join('+'))).size, SUDE.length, 'keine zwei Rezepte mit gleicher Mischung');
  for (const r of SUDE) { assert.ok(r.zutaten.length <= 3 && content.items[`sud_${r.id}`], r.id); for (const z of r.zutaten) assert.equal(content.items[z]?.kind, 'ingredient', z); }
  assert.equal(sudRecipeFor(['bitterwurz', 'nebeltau']).id, 'nebelsud');
  assert.equal(sudRecipeFor(['nebeltau', 'bitterwurz', 'bitterwurz']), null);
  assert.match(s.brewSud(['nebeltau']).text, /Gefäß/);
  s.addItem(LEERES_GEFAESS, 3);
  s.addItem('nebeltau', 3);
  s.addItem('gluehwurmasche', 1);
  s.addItem('bitterwurz', 1);
  assert.equal(s.brewSud([]).ok, false);
  assert.equal(s.brewSud(['nebeltau', 'nebeltau', 'nebeltau', 'nebeltau']).ok, false);
  let r = s.brewSud(['nebeltau', 'gluehwurmasche']);
  assert.equal(r.item, 'sud_gluehtrunk');
  assert.ok(r.neu, 'erste Begegnung mit dem Rezept = eigene Schöpfung');
  assert.deepEqual(s.knownSude().map((k) => k.id), ['gluehtrunk']);
  r = s.brewSud(['nebeltau', 'nebeltau']);
  assert.equal(r.item, SUD_PFUSCH);
  assert.equal(s.itemCount(LEERES_GEFAESS), 1);
  // Die Wirkung läuft wie eine Welt-Fähigkeit auf Zeit
  const before = s.passive('dmg_mult');
  assert.match(s.useItem('sud_gluehtrunk'), /Schlagkraft|Schaden|×|%/);
  assert.ok(s.passive('dmg_mult') > before);
  assert.ok(s.activeSudBuff());
  s.tick(89);
  assert.ok(s.activeSudBuff());
  s.tick(2);
  assert.equal(s.activeSudBuff(), null);
  // Speichern und laden hält die eigenen Rezepte
  const copy = new GameState(content);
  copy.load(JSON.parse(JSON.stringify(s.serialize())));
  assert.deepEqual(copy.sudeBekannt, ['gluehtrunk']);
});

test('Kessel-Ritual: nur unter laufender Sud-Wirkung, der Trank auch; verfliegt sie vorher, verfällt das Ritual', () => {
  const s = at('kessel');
  s.addItem(LEERES_GEFAESS, 2);
  s.addItem('nebeltau', 2);
  s.addItem('gluehwurmasche', 2);
  assert.equal(s.performRitual().ok, false);
  s.brewSud(['nebeltau', 'gluehwurmasche']);
  assert.equal(s.performRitual().ok, false, 'der Sud muss wirken, nicht nur im Beutel liegen');
  s.useItem('sud_gluehtrunk');
  assert.equal(s.performRitual().ok, true);
  assert.ok(s.seq5().armed);
  s.tick(80);
  assert.equal(s.drinkCheck('trank_kessel_5').ok, true);
  s.tick(11);
  assert.ok(!s.ritualDone('kessel', 5), 'das Ritual ist verfallen');
  assert.match(s.drinkCheck('trank_kessel_5').reason, /Ritual/);
  assert.equal(s.pathway.digestion, 100 - FAIL_PCT.kessel);
  // Noch einmal, diesmal schnell genug
  s.pathway.digestion = 100;
  for (const [id, n] of Object.entries(s.ritualDef('kessel', 5).consumes)) s.addItem(id, n);
  s.brewSud(['nebeltau', 'gluehwurmasche']);
  s.useItem('sud_gluehtrunk');
  assert.equal(s.performRitual().ok, true);
  assert.equal(s.drink('trank_kessel_5', () => 0.99).ok, true);
  assert.equal(s.pathway.seq, 5);
  assert.equal(s.pathway.seq5, undefined);
});

// --- Eisen ----------------------------------------------------------------------------------------
test('Eisen: fünf Siege in zwölf Runden unter 40 % Leben ohne Heilung', () => {
  const s = at('eisen');
  assert.match(s.startEisen().text, /Erst unter 40 %/);
  s.hp = Math.floor(s.maxHp * 0.35);
  assert.equal(s.startEisen().ok, true);
  const win = (rounds) => { const c = new Combat(s, 'archive_rats'); c.round = rounds; c.outcome = 'won'; return c.finish(); };
  for (let i = 1; i < EISEN.wins; i++) assert.match(win(2).text, new RegExp(`${i}/${EISEN.wins} Siege`));
  assert.match(win(2).text, /bestanden/);
  assert.ok(s.seq5().done);
  assert.equal(s.performRitual().ok, true);
  // Zu viele Runden: gescheitert
  const t = at('eisen');
  t.hp = Math.floor(t.maxHp * 0.35);
  t.startEisen();
  const c = new Combat(t, 'archive_rats'); c.round = EISEN.rounds + 1; c.outcome = 'won'; c.finish();
  assert.equal(t.pathway.digestion, 100 - FAIL_PCT.eisen);
  // Verband im Kampf: gescheitert
  const u = at('eisen');
  u.hp = Math.floor(u.maxHp * 0.35);
  u.startEisen();
  u.addItem('verband');
  const c2 = new Combat(u, 'archive_rats');
  c2.useItem('verband');
  assert.equal(u.pathway.digestion, 100 - FAIL_PCT.eisen);
  assert.ok(!u.seq5().active);
});

// --- Schlüssel -------------------------------------------------------------------------------------
test('Schlüssel: Schillingbonus am Leib, 50 Schilling in einem Kampf gestohlen und gewonnen', () => {
  const s = at('schluessel');
  assert.match(s.startDiebstahl().text, /Schillingbonus/);
  s.addItem('hut_maskenball');
  s.wear('hut_maskenball');
  assert.ok(s.moneyBonusFromGear() > 1);
  assert.equal(s.startDiebstahl().ok, true);
  const money = s.money;
  const c = new Combat(s, 'archive_rats');
  c.rng = () => 0.5;
  c.stolen = DIEBSTAHL - 1;
  c.outcome = 'won';
  c.finish();
  assert.equal(s.pathway.digestion, 100 - FAIL_PCT.schluessel);
  s.pathway.digestion = 100;
  s.startDiebstahl();
  const c2 = new Combat(s, 'archive_rats');
  c2.rng = () => 0.5;
  c2.ap = 6;
  // Griff in die Tasche stiehlt wirklich Geld
  c2.useSkill('griff_in_die_tasche', ['good']);
  assert.ok(c2.stolen > 0 && s.money > money);
  c2.stolen = DIEBSTAHL;
  c2.outcome = 'won';
  assert.match(c2.finish().text, /bestanden/);
  assert.ok(s.money >= money + DIEBSTAHL - 50, 'das Geld bleibt');
  assert.equal(s.performRitual().ok, true);
});

// --- Waage ----------------------------------------------------------------------------------------
test('Waage: mit 3000 Schilling genau drei kaufen und drei verkaufen, nichts doppelt', () => {
  const s = at('sq_waage');
  s.flags.add('briefed_04');
  s.flags.add(content.gatherings.circles.waage.member_flag);
  s.money = 100;
  assert.match(s.startHandel().text, /3000/);
  s.money = HANDEL.money;
  assert.equal(s.startHandel().ok, true);
  let c = s.marketCycle() + 1;
  while (s.gatheringSlot(c).id !== 'waage') c++;
  s.playTime = s.gatheringSlot(c).start + 1;
  assert.equal(s.startSession('waage').ok, true);
  // Über die Haken der Runde (bid/fulfillRequest/acceptOwn) zählt der Stand mit
  s.seq5Trade('buy', 'a'); s.seq5Trade('buy', 'b'); s.seq5Trade('buy', 'c');
  s.seq5Trade('sell', 'd'); s.seq5Trade('sell', 'e');
  assert.ok(!s.seq5().done);
  s.seq5Trade('sell', 'f');
  s.endSession();
  assert.ok(s.seq5().done);
  assert.equal(s.performRitual().ok, true);
  // Ein viertes Los oder ein Kreis: gescheitert
  const t = at('sq_waage');
  t.money = HANDEL.money;
  t.startHandel();
  t.seq5Trade('buy', 'a'); t.seq5Trade('sell', 'a');
  assert.equal(t.pathway.digestion, 100 - FAIL_PCT.waage);
  t.pathway.digestion = 100;
  t.money = HANDEL.money;
  t.startHandel();
  for (const x of ['a', 'b', 'c', 'd']) t.seq5Trade('buy', x);
  assert.equal(t.pathway.digestion, 100 - FAIL_PCT.waage);
  // Die Runde endet mit zwei und zwei: gescheitert
  t.pathway.digestion = 100;
  t.startHandel();
  t.seq5Trade('buy', 'a'); t.seq5Trade('sell', 'b');
  t.seq5SessionEnd();
  assert.equal(t.pathway.digestion, 100 - FAIL_PCT.waage);
});

// --- Moor -----------------------------------------------------------------------------------------
test('Moor: Erinnerung eines Bürgers im Gespräch ins leere Gefäß, nie die seiner Herkunft', () => {
  const s = at('sq_moor', { consumes: false });
  for (const [id, n] of Object.entries(s.ritualDef('sq_moor', 5).consumes)) if (id !== GEFAESS_ERINNERUNG) s.addItem(id, n);
  assert.ok(s.canTakeMemory('marlowe'));
  assert.ok(!s.canTakeMemory('tresswell'), 'kein Beyonder');
  const mems = s.moorMemories('marlowe');
  assert.equal(mems.length, 3);
  assert.equal(mems.filter((m) => m.herkunft).length, 1);
  assert.deepEqual(s.moorMemories('marlowe'), mems, 'fest je Figur');
  assert.match(s.takeMemory('marlowe', 0).text, /leeres Gefäß/);
  s.addItem(LEERES_GEFAESS, 2);
  // Die Herkunft: das Glas springt
  const r = s.takeMemory('marlowe', mems.findIndex((m) => m.herkunft));
  assert.equal(r.passed, false);
  assert.equal(s.pathway.digestion, 100 - FAIL_PCT.moor);
  assert.equal(s.itemCount(LEERES_GEFAESS), 1);
  assert.ok(!s.canTakeMemory('marlowe'), 'jede Figur nur einmal');
  // Eine andere Erinnerung bei einer anderen Figur
  const mems2 = s.moorMemories('pimm');
  const r2 = s.takeMemory('pimm', mems2.findIndex((m) => !m.herkunft));
  assert.equal(r2.passed, true);
  assert.equal(s.itemCount(GEFAESS_ERINNERUNG), 1);
  assert.ok(!s.canTakeMemory('holt'), 'mit vollem Gefäß nimmt man keine zweite');
  assert.equal(s.performRitual().ok, true);
  assert.equal(s.itemCount(GEFAESS_ERINNERUNG), 0);
});

// --- Uhr ------------------------------------------------------------------------------------------
test('Uhr: zwei Gegner in je drei Runden, dazwischen und danach 20 Sekunden, die Uhr bleibt', () => {
  const s = at('sq_uhr');
  assert.match(s.startUhr().text, /Uhr/);
  s.addItem(UHR_ITEM);
  assert.equal(s.startUhr().ok, true);
  // Der Kampfbeginn liest die echte Uhr (Combat-Konstruktor); die Pausen stellt der Test am Zeitstempel nach
  const fightIn = (rounds) => { const c = new Combat(s, 'archive_rats'); c.round = rounds; c.outcome = 'won'; return s.seq5CombatEnd(c); };
  assert.match(fightIn(2), /Erster Takt/);
  assert.equal(s.seq5().phase, 'wait1');
  // Zu früh zum zweiten Kampf: gescheitert
  new Combat(s, 'archive_rats');
  assert.equal(s.pathway.digestion, 100 - FAIL_PCT.uhr);
  s.pathway.digestion = 100;
  s.startUhr();
  fightIn(3);
  s.seq5().t -= UHR.waitMs + 1000;
  assert.match(fightIn(3), /Zweiter Takt/);
  const now = s.seq5().t;
  assert.ok(!s.seq5IsDone('uhr', now + 1000));
  assert.match(s.seq5DrinkBlock('sq_uhr', 5, now + 1000), /warten/);
  assert.ok(s.seq5IsDone('uhr', now + UHR.waitMs));
  s.seq5().t -= UHR.waitMs + 1000;
  assert.equal(s.performRitual().ok, true);
  assert.equal(s.itemCount(UHR_ITEM), 1, 'die Uhr wird nicht verbraucht');
  // Vier Runden: gescheitert
  const t = at('sq_uhr');
  t.addItem(UHR_ITEM);
  t.startUhr();
  const c2 = new Combat(t, 'archive_rats'); c2.round = UHR.rounds + 1; c2.outcome = 'won'; c2.finish();
  assert.equal(t.pathway.digestion, 100 - FAIL_PCT.uhr);
});

// --- Speichern, Koop, Aufstieg -------------------------------------------------------------------------
test('Der Prüfungsstand liegt am Pfad: gespeichert, je Spieler, und mit dem Trank vorbei', () => {
  const s = at('eisen');
  s.hp = Math.floor(s.maxHp * 0.3);
  s.startEisen();
  const copy = new GameState(content);
  copy.load(JSON.parse(JSON.stringify(s.serialize())));
  assert.ok(copy.pathway.seq5.active);
  // Spieler 2 hat seinen eigenen Stand
  copy.togglePlayer2?.();
  if (copy.hasP2()) {
    copy.withPlayer(2, () => { copy.pathway = { id: 'eisen', seq: 6, digestion: 100 }; assert.equal(copy.seq5().active, undefined); });
    const again = new GameState(content);
    again.load(JSON.parse(JSON.stringify(copy.serialize())));
    assert.ok(again.pathway.seq5.active);
  }
  passTrial(s, 'eisen');
  assert.equal(s.performRitual().ok, true);
  assert.equal(s.drink('trank_eisen_5', () => 0.99).ok, true);
  assert.equal(s.pathway.seq5, undefined, 'mit dem Trank ist der Stand weg');
});

test('Jeder Pfad kommt mit bestandener Prüfung von 6 auf 5', () => {
  for (const [pid, kind] of Object.entries(TRIALS)) {
    const s = at(pid);
    passTrial(s, kind);
    const steps = s.ritualSteps(pid, 5);
    assert.ok(steps.every((x) => x.done), `${pid}: ${JSON.stringify(steps.filter((x) => !x.done))}`);
    assert.equal(s.performRitual().ok, true, pid);
    const d = s.drink(`trank_${pid}_5`, () => 0.99);
    assert.equal(d.ok, true, `${pid}: ${d.text}`);
    assert.equal(s.pathway.seq, 5);
  }
});

test('Balance: die Kokonspinne ist eine gewöhnliche Spinne, die man mit Sequenz 6 und Startwaffe schafft', () => {
  const s = at('faden');
  const { result } = fight(s, 'kokonspinne', { defend: (i) => (i % 3 === 0 ? 'parry' : 'dodge') });
  assert.equal(result.outcome, 'won');
});
