// Die Fasserin auf geheimen Treffen: 30 % Chance, ein starkes Beutestück je Rezept, Auftrag bis zum
// nächsten Treffen desselben Zirkels, Erfolgschance 40–80 % (stärker = unsicherer).
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

test('Rezepte: genau ein Beutestück, nie gewöhnlich, jedes Artefakt vollständig, Chance 40–80 % fallend mit Stärke', () => {
  const s = new GameState(content);
  const E = artisan.erfolg;
  assert.equal(E.min, 0.4);
  assert.equal(E.max, 0.8);
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
    assert.equal(needs.length, 1, `${r.id}: ein einzelnes Stück, kein Rezept aus Teilen`);
    const [item, n] = needs[0];
    const it = content.items[item];
    assert.ok(it && it.kind === 'trophy', `${r.id}: ${item} ist kein Beutestück`);
    assert.equal(n, 1);
    assert.notEqual(itemRarity(it), 'gewoehnlich', `${r.id}: ${item} ist zu gewöhnlich`);
    const chance = s.recipeChance(r);
    assert.ok(chance >= E.min && chance <= E.max, `${r.id}: Chance ${chance}`);
    assert.equal(s.recipeCheck(r).chance, chance);
  }
  // Stärkere Artefakte (höherer Preis) gelingen seltener, die Spanne wird ausgenutzt
  const byPrice = [...artisan.recipes].sort((a, b) => content.artifacts.list[a.id].price - content.artifacts.list[b.id].price);
  for (let i = 1; i < byPrice.length; i++) assert.ok(s.recipeChance(byPrice[i]) <= s.recipeChance(byPrice[i - 1]), `${byPrice[i].id} dürfte nicht leichter gelingen als ${byPrice[i - 1].id}`);
  assert.equal(s.recipeChance(byPrice[0]), E.max);
  assert.equal(s.recipeChance(byPrice[byPrice.length - 1]), E.min);
  // Rattenkönig-Krone und Sternhirschgeweih sind je allein ein Auftrag
  assert.deepEqual(artisan.recipes.find((r) => r.id === 'krone_der_sieben').needs, { rattenkrone: 1 });
  assert.deepEqual(artisan.recipes.find((r) => r.id === 'sternlicht_gespinst').needs, { sternhirschgeweih: 1 });
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

/** Zur Runde durchklicken, bis man selbst dran ist. */
function toOwn(s) {
  while (s.auction.phase !== 'own') {
    if (s.auction.phase === 'lot') s.passLot();
    else if (s.auction.phase === 'request') s.declineRequest();
  }
}

test('Auftrag: Stück und Lohn weg, Artefakt noch nicht; ohne Stück oder Geld nicht', () => {
  const s = session(true);
  assert.equal(s.startSession('waage').ok, true);
  assert.equal(s.auction.artisan, true);
  assert.equal(s.openArtisan().ok, false, 'erst wenn alle dran waren');
  toOwn(s);
  assert.equal(s.openArtisan().ok, true);
  assert.equal(s.auction.phase, 'artisan');
  assert.equal(s.auctionSpeaker(), s.artisanId());
  const [r] = s.artisanRecipes('waage', s.auction.cycle);
  const artifact = r.artifact ?? r.id;
  const [piece] = Object.keys(r.needs);
  // Ohne Beute
  let res = s.orderArtifact(r.id);
  assert.equal(res.ok, false);
  assert.match(res.text, /fehlt/i);
  // Mit Beute, ohne Geld
  s.addItem(piece, 2);
  s.money = r.fee - 1;
  res = s.orderArtifact(r.id);
  assert.equal(res.ok, false);
  assert.match(res.text, /lohn/i);
  // Mit allem: Auftrag, kein Artefakt
  s.money = 1000;
  res = s.orderArtifact(r.id);
  assert.equal(res.ok, true, res.text);
  assert.equal(s.money, 1000 - r.fee);
  assert.equal(s.itemCount(piece), 1, 'ein Stück verbraucht');
  assert.equal(s.itemCount(artifact), 0, 'nichts sofort');
  assert.deepEqual(s.pendingOrders().map((o) => [o.circle, o.recipe, o.artifact, o.fee]), [['waage', r.id, artifact, r.fee]]);
  assert.equal(s.pendingOrders()[0].cycle, s.auction.cycle);
  assert.equal(s.pendingOrders()[0].chance, s.recipeChance(r));
  assert.ok(artisan.texte.auftrag.some((l) => s.auction.log.at(-1).includes(l)), s.auction.log.at(-1));
  assert.deepEqual(s.auction.crafted, [{ item: artifact, price: r.fee, chance: s.recipeChance(r) }]);
  // Rezept, das heute nicht auf dem Tisch liegt
  const other = artisan.recipes.find((x) => !s.artisanRecipes('waage', s.auction.cycle).some((y) => y.id === x.id));
  for (const [item, n] of Object.entries(other.needs)) s.addItem(item, n);
  assert.equal(s.orderArtifact(other.id).ok, false);
  // Zurück zur Runde; die Fassung kann man noch nicht anbieten, sie ist ja nicht da
  assert.equal(s.leaveArtisan().ok, true);
  assert.equal(s.auction.phase, 'own');
  assert.ok(!s.ownOfferables().some((o) => o.id === artifact));
  const sum = s.endSession();
  assert.equal(sum.crafted.length, 1);
  assert.deepEqual(sum.collected, []);
  // Noch in derselben Runde des Zirkels ist nichts bereit
  assert.deepEqual(s.readyOrders('waage', s.marketCycle()), []);
});

test('Abholen: erst beim nächsten Treffen desselben Zirkels; andere Zirkel übergeben nichts', () => {
  const s = session(true);
  s.startSession('waage');
  toOwn(s);
  s.openArtisan();
  const [r] = s.artisanRecipes('waage', s.auction.cycle);
  const artifact = r.artifact ?? r.id;
  s.addItem(Object.keys(r.needs)[0], 1);
  assert.ok(s.orderArtifact(r.id).ok);
  s.endSession();
  // Ein anderer Zirkel kommt vorher dran: Mitglied werden, hingehen, nichts passiert
  s.flags.add(content.gatherings.circles.kreide.member_flag);
  const ck = jumpTo(s, 'kreide');
  assert.deepEqual(s.readyOrders('kreide', ck), []);
  assert.ok(s.startSession('kreide').ok);
  assert.deepEqual(s.auction.collected, []);
  assert.equal(s.itemCount(artifact), 0);
  assert.equal(s.pendingOrders().length, 1);
  s.endSession();
  // HUD vor dem Waage-Treffen: Fassung abholen
  const cw = jumpTo(s, 'waage');
  s.playTime = s.gatheringSlot(cw).start - 30;
  const st = s.gatheringStatus();
  assert.equal(st.next.id, 'waage');
  assert.equal(st.orders.length, 1);
  assert.match(st.text, /Fassung abholen/);
  // Einladung nennt die bereitliegende Fassung
  const notes = [];
  s.on('gathering', (e) => notes.push(e));
  s.lastGatheringCycle = null;
  s.tickGatherings(31);
  assert.ok(notes.some((n) => n.open && n.text.includes(content.items[artifact].name)), notes.map((n) => n.text).join('|'));
  // Beim Waage-Treffen übergibt der Gastgeber, ob die Fasserin dabei ist oder nicht
  const money = s.money;
  assert.ok(s.startSession('waage').ok);
  assert.equal(s.auction.collected.length, 1);
  const [c] = s.auction.collected;
  assert.equal(c.item, artifact);
  assert.equal(s.pendingOrders().length, 0, 'Auftrag erledigt');
  if (c.ok) {
    assert.equal(s.itemCount(artifact), 1);
    assert.equal(c.refund, 0);
    assert.equal(s.money, money);
    assert.ok(s.activeArtifacts().includes(artifact), 'wirkt sofort beim Mitführen');
    assert.ok(artisan.texte.gelungen.some((l) => s.auction.log.some((t) => t.includes(l))));
  } else {
    assert.equal(s.itemCount(artifact), 0);
    assert.equal(c.refund, Math.floor(r.fee * artisan.erfolg.erstattung));
    assert.equal(s.money, money + c.refund, 'halber Lohn zurück');
    assert.ok(artisan.texte.missglueckt.some((l) => s.auction.log.some((t) => t.includes(l))));
  }
  const sum = s.endSession();
  assert.equal(sum.collected.length, 1);
});

test('Der Würfel ist fest je Auftrag und trifft die Chance: Gelingen und Misslingen kommen beide vor', () => {
  const s = new GameState(content);
  const weak = [...artisan.recipes].sort((a, b) => content.artifacts.list[a.id].price - content.artifacts.list[b.id].price);
  const easy = weak[0], hard = weak[weak.length - 1];
  const rate = (r) => {
    let ok = 0;
    const n = 1000;
    for (let c = 0; c < n; c++) {
      const o = { circle: 'waage', cycle: c, recipe: r.id, chance: s.recipeChance(r) };
      assert.equal(s.orderSucceeds(o), s.orderSucceeds(o), 'Neuladen ändert nichts');
      if (s.orderSucceeds(o)) ok++;
    }
    return ok / n;
  };
  const e = rate(easy), h = rate(hard);
  assert.ok(Math.abs(e - s.recipeChance(easy)) < 0.06, `leicht: ${e}`);
  assert.ok(Math.abs(h - s.recipeChance(hard)) < 0.06, `schwer: ${h}`);
  assert.ok(e > h);
});

test('Spielstand: offene Aufträge überleben Laden', () => {
  const s = session(true);
  s.startSession('waage');
  toOwn(s);
  s.openArtisan();
  const [r] = s.artisanRecipes('waage', s.auction.cycle);
  s.addItem(Object.keys(r.needs)[0], 1);
  assert.ok(s.orderArtifact(r.id).ok);
  s.endSession();
  const l = new GameState(content);
  assert.ok(l.load(JSON.parse(JSON.stringify(s.serialize()))));
  assert.deepEqual(l.pendingOrders(), s.pendingOrders());
  // Ein Spielstand von vor dem Umbau hat keine Aufträge
  const old = new GameState(content);
  const data = JSON.parse(JSON.stringify(s.serialize()));
  delete data.artisanOrders;
  assert.ok(old.load(data));
  assert.deepEqual(old.pendingOrders(), []);
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

// --- BO: Vorrats-Rezepte, Begrüßungen je Zirkel, Zeilen bei fehlender Beute und fehlendem Geld ---------------
test('BO: 20 Rezepte im Vorrat (plus Nerven-Artefakte), fass_-Artefakte nur bei ihr, Texte je Zirkel', () => {
  const fass = artisan.recipes.filter((r) => r.id.startsWith('fass_'));
  assert.equal(fass.length, 10);
  assert.ok(artisan.recipes.length >= 20);
  for (const r of fass) assert.equal(content.artifacts.list[r.id].source, 'artisan');
  const s = session(true);
  for (const circle of ['waage', 'kreide', 'russ', 'lichtlose', 'salz', 'namensgilde']) {
    assert.equal(artisan.texte.begruessung[circle].length, 2, circle);
    assert.notEqual(s.artisanGreeting(circle, 0), s.artisanGreeting(circle, 1));
  }
  assert.ok(s.artisanGreeting('schichtbund', 3).length > 10, 'Dunscar nutzt die allgemeine Werkstattstimme');
  // Fehlende Beute und fehlendes Geld bekommen ihre eigene Zeile
  const cycle = s.marketCycle();
  s.auction = { phase: 'artisan', circle: 'waage', cycle, crafted: [], log: [] };
  const r = s.artisanRecipes('waage', cycle)[0];
  const miss = s.craftArtifact(r.id);
  assert.equal(miss.ok, false);
  assert.ok(artisan.texte.fehlende_beute.some((l) => miss.text.includes(l)), miss.text);
  for (const [id, n] of Object.entries(r.needs)) s.addItem(id, n);
  s.money = 0;
  const poor = s.craftArtifact(r.id);
  assert.equal(poor.ok, false);
  assert.ok(artisan.texte.fehlendes_geld.some((l) => poor.text.includes(l)), poor.text);
  s.money = 500;
  assert.ok(s.craftArtifact(r.id).ok, 'alter Name führt zum Auftrag');
  assert.equal(s.pendingOrders().length, 1);
  assert.ok(s.leaveArtisan().ok);
});
