// Die Fasserin auf geheimen Treffen: 30 % Chance, Rezepte aus Beutestücken, Artefakte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { itemRarity } from '../src/core/Loot.js';

const content = loadContent();
const artisan = content.gatherings.artisan;
const MIN = 60;

/** Spielzeit auf den Beginn der nächsten Runde dieses Zirkels setzen. */
function jumpTo(s, id) {
  let c = s.marketCycle() + 1;
  while (s.gatheringSlot(c).id !== id) c++;
  s.playTime = s.gatheringSlot(c).start + 1;
  return c;
}

/** Mitglied der Stillen Waage, mit Geld, bei einem Treffen, bei dem die Fasserin dabei ist (oder nicht). */
function session(withArtisan = true, circle = 'waage') {
  const s = new GameState(content);
  s.flags.add('briefed_04');
  s.flags.add(content.gatherings.circles[circle].member_flag);
  s.money = 2000;
  for (let i = 0; i < 400; i++) {
    const cycle = jumpTo(s, circle);
    if (s.artisanPresent(circle, cycle) === withArtisan) return s;
  }
  throw new Error('kein passendes Treffen gefunden');
}

test('Die Fasserin ist mit etwa 30 % dabei, pro Treffen fest', () => {
  assert.equal(artisan.chance, 0.3);
  const s = new GameState(content);
  let seen = 0;
  const rounds = 600;
  for (let c = 0; c < rounds; c++) if (s.artisanPresent(s.gatheringSlot(c).id, c)) seen++;
  assert.ok(seen > rounds * 0.22 && seen < rounds * 0.38, `${seen}/${rounds}`);
  // Innerhalb einer Runde ändert sich nichts (kein Neuladen-Trick)
  assert.equal(s.artisanPresent('waage', 7), s.artisanPresent('waage', 7));
  assert.deepEqual(s.artisanRecipes('waage', 7).map((r) => r.id), s.artisanRecipes('waage', 7).map((r) => r.id));
});

test('Rezepte: nur ungewöhnliche, seltene oder okkulte Beutestücke, jedes Artefakt vollständig', () => {
  assert.ok(artisan.recipes.length >= 8);
  const ids = new Set();
  for (const r of artisan.recipes) {
    assert.ok(!ids.has(r.id), `${r.id} doppelt`);
    ids.add(r.id);
    const art = content.items[r.artifact ?? r.id];
    assert.ok(art && art.kind === 'artifact', `${r.id}: Artefakt fehlt`);
    assert.equal(content.artifacts.list[r.artifact ?? r.id].source, 'artisan');
    assert.ok(art.boons.length && art.curses.length, `${r.id}: Vor- und Nachteile`);
    assert.ok(r.fee >= 50 && r.fee <= 250, `${r.id}: Lohn ${r.fee}`);
    const needs = Object.entries(r.needs);
    assert.ok(needs.length >= 2, `${r.id}: zu wenige Zutaten`);
    let special = 0;
    for (const [item, n] of needs) {
      const it = content.items[item];
      assert.ok(it && it.kind === 'trophy', `${r.id}: ${item} ist kein Beutestück`);
      assert.ok(n >= 1);
      if (itemRarity(it) !== 'gewoehnlich') special++;
    }
    assert.ok(special >= 1, `${r.id}: braucht etwas Ungewöhnliches`);
  }
  // Artefakte der Fasserin gibt es nur bei ihr, nicht als Los auf den Treffen
  const lots = new Set(Object.values(content.gatherings.circles).flatMap((c) => c.members.flatMap((m) => m.offers.map((e) => e.item))));
  for (const id of ids) assert.ok(!lots.has(id), `${id} wird auch versteigert`);
});

test('Pro Treffen liegen vier Rezepte auf dem Tisch, über die Treffen wechseln sie', () => {
  const s = new GameState(content);
  const seen = new Set();
  for (let c = 0; c < 400; c++) {
    const id = s.gatheringSlot(c).id;
    if (!s.artisanPresent(id, c)) { assert.equal(s.artisanRecipes(id, c).length, 0); continue; }
    const r = s.artisanRecipes(id, c);
    assert.equal(r.length, artisan.offers);
    assert.equal(new Set(r.map((x) => x.id)).size, r.length);
    r.forEach((x) => seen.add(x.id));
  }
  assert.equal(seen.size, artisan.recipes.length, 'jedes Rezept kommt vor');
});

test('Ohne Fasserin gibt es in der Runde keinen Weg zu ihr', () => {
  const s = session(false);
  assert.equal(s.startSession('waage').ok, true);
  assert.equal(s.auction.artisan, false);
  while (s.auction.phase !== 'own') {
    if (s.auction.phase === 'lot') s.passLot();
    else if (s.auction.phase === 'request') s.declineRequest();
  }
  assert.equal(s.openArtisan().ok, false);
  assert.equal(s.craftArtifact(artisan.recipes[0].id).ok, false);
});

test('Fassen: Beute und Lohn weg, Artefakt da und wirksam; ohne Beute oder Geld nicht', () => {
  const s = session(true);
  assert.equal(s.startSession('waage').ok, true);
  assert.equal(s.auction.artisan, true);
  assert.equal(s.openArtisan().ok, false, 'erst wenn alle dran waren');
  while (s.auction.phase !== 'own') {
    if (s.auction.phase === 'lot') s.passLot();
    else if (s.auction.phase === 'request') s.declineRequest();
  }
  assert.equal(s.openArtisan().ok, true);
  assert.equal(s.auction.phase, 'artisan');
  assert.equal(s.auctionSpeaker(), s.artisanId());
  const [r] = s.artisanRecipes('waage', s.auction.cycle);
  const artifact = r.artifact ?? r.id;
  // Ohne Beute
  let res = s.craftArtifact(r.id);
  assert.equal(res.ok, false);
  assert.match(res.text, /fehlt/i);
  // Mit Beute, ohne Geld
  for (const [item, n] of Object.entries(r.needs)) s.addItem(item, n + 1);
  s.money = r.fee - 1;
  res = s.craftArtifact(r.id);
  assert.equal(res.ok, false);
  assert.match(res.text, /lohn/i);
  // Mit allem
  s.money = 1000;
  const unruhe = s.unruhe;
  res = s.craftArtifact(r.id);
  assert.equal(res.ok, true, res.text);
  assert.equal(s.money, 1000 - r.fee);
  for (const [item] of Object.entries(r.needs)) assert.equal(s.itemCount(item), 1, `${item} verbraucht`);
  assert.equal(s.itemCount(artifact), 1);
  assert.ok(s.activeArtifacts().includes(artifact), 'wirkt sofort beim Mitführen');
  assert.ok(s.unruhe > unruhe, 'Aufnehmen bringt Unruhe');
  assert.ok(!s.borrowed.includes(artifact), 'gehört dir, nicht dem Revier');
  assert.deepEqual(s.auction.crafted, [{ item: artifact, price: r.fee }]);
  // Rezept, das heute nicht auf dem Tisch liegt
  const other = artisan.recipes.find((x) => !s.artisanRecipes('waage', s.auction.cycle).some((y) => y.id === x.id));
  for (const [item, n] of Object.entries(other.needs)) s.addItem(item, n);
  assert.equal(s.craftArtifact(other.id).ok, false);
  // Zurück zur Runde, dann darf man das neue Artefakt sogar gleich anbieten
  assert.equal(s.leaveArtisan().ok, true);
  assert.equal(s.auction.phase, 'own');
  assert.ok(s.ownOfferables().some((o) => o.id === artifact));
  const sum = s.endSession();
  assert.equal(sum.crafted.length, 1);
});

test('Ankündigung: Einladung und HUD nennen die Fasserin, wenn sie kommt', () => {
  const s = new GameState(content);
  s.flags.add('briefed_04');
  s.flags.add(content.gatherings.circles.waage.member_flag);
  for (let i = 0; i < 400; i++) {
    const cycle = jumpTo(s, 'waage');
    s.playTime = s.gatheringSlot(cycle).start - 30; // kurz vor dem Treffen
    const st = s.gatheringStatus();
    s.playTime = s.gatheringSlot(cycle).start + 1; // damit die Suche in der nächsten Schleife weiterläuft
    assert.equal(st.next.cycle, cycle);
    assert.equal(st.artisan, s.artisanPresent('waage', cycle));
    assert.equal(/Fasserin dabei/.test(st.text), st.artisan);
    if (!st.artisan) continue;
    const notes = [];
    s.on('gathering', (e) => notes.push(e));
    s.playTime = s.gatheringSlot(cycle).start - 30;
    s.lastGatheringCycle = null;
    s.tickGatherings(31);
    assert.ok(notes.some((n) => n.open && /fasst Beute/.test(n.text)), notes.map((n) => n.text).join('|'));
    return;
  }
  throw new Error('nie dabei');
});

test('Spielstand: Fassen bleibt pro Treffen nur einmal möglich, Rezepte überleben Laden', () => {
  const s = session(true);
  s.startSession('waage');
  const want = s.artisanRecipes('waage', s.auction.cycle).map((r) => r.id);
  s.endSession();
  const l = new GameState(content);
  assert.ok(l.load(JSON.parse(JSON.stringify(s.serialize()))));
  assert.deepEqual(l.artisanRecipes('waage', s.marketCycle()).map((r) => r.id), want);
  assert.equal(l.startSession('waage').ok, false);
});
