// Geheime Treffen ab Fall 4 und der knappe normale Markt ab Sequenz 7.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, talk } from './helpers.js';
import { GameState } from '../src/core/GameState.js';

const content = loadContent();
const MIN = 60;
const rules = content.gatherings.rules;

/** Spielzeit vorspulen, so wie WorldScene den Tick aufruft. */
function play(s, seconds, step = 5) {
  for (let t = 0; t < seconds; t += step) s.tickGatherings(step);
}

/** Spielstand nach dem Briefing zu Fall 4, mit Geld. */
function fall4() {
  const s = new GameState(content);
  s.flags.add('briefed_04');
  s.money = 500;
  return s;
}

/** Spielzeit auf den Beginn der nächsten Runde dieses Zirkels setzen. */
function jumpTo(s, id) {
  let c = s.marketCycle() + 1;
  while (s.gatheringSlot(c).id !== id) c++;
  s.playTime = s.gatheringSlot(c).start + 1;
  return c;
}

const seq7Ingredients = Object.values(content.pathways).map((p) => Object.keys(p.seqs[7].ingredients)).flat()
  .filter((i) => !['nebeltau', 'silberstaub'].includes(i));

const highIngredients = Object.values(content.pathways).flatMap((p) => [7, 6, 5].flatMap((q) => Object.keys(p.seqs[q]?.ingredients ?? {})))
  .filter((i) => !['nebeltau', 'silberstaub'].includes(i));

test('Normaler Markt: Zutaten ab Sequenz 7 (auch 6 und 5) sind nicht mehr käuflich', () => {
  assert.ok(highIngredients.includes('sternglas') && highIngredients.includes('geisteressenz'));
  for (const [id, m] of Object.entries(content.market.merchants)) {
    if (m.gathering) continue;
    for (const e of m.stock) assert.ok(!highIngredients.includes(e.item), `${id} verkauft ${e.item}`);
  }
});

test('Jede Zutat ab Sequenz 7 gibt es auf mindestens einem Treffen', () => {
  const sold = new Set(Object.values(content.market.merchants).filter((m) => m.gathering).flatMap((m) => m.stock.map((e) => e.item)));
  for (const id of new Set(highIngredients)) assert.ok(sold.has(id), id);
});

test('Normaler Markt: Formeln für Sequenz 7 gibt es nur selten', () => {
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 8, digestion: 100 };
  s.honor = 50;
  let seen = 0;
  const rounds = 200;
  for (let c = 0; c < rounds; c++) {
    s.playTime = c * rules.interval_min * MIN;
    if (s.shopStock('kittering').some((e) => e.item === 'formel_laterne_7')) seen++;
  }
  assert.ok(seen > 0, 'kommt überhaupt vor');
  assert.ok(seen < rounds * 0.3, `zu oft: ${seen}/${rounds}`);
  // Innerhalb einer Runde bleibt das Angebot gleich (kein Neuladen-Trick)
  s.playTime = 0;
  const a = s.shopStock('kittering').map((e) => e.item).join();
  s.playTime = 5 * MIN;
  assert.equal(s.shopStock('kittering').map((e) => e.item).join(), a);
});

test('Vor Fall 4 gibt es keine Treffen und keinen Boten', () => {
  const s = new GameState(content);
  s.money = 500;
  assert.equal(s.gatheringsUnlocked(), false);
  const bote = content.maps.nachtmarkt.npcs.find((n) => n.id === 'schleierbote');
  assert.ok(bote, 'Bote steht auf dem Nachtmarkt');
  assert.equal(s.meets(bote.visible_if), false);
  s.flags.add('briefed_04');
  assert.equal(s.meets(bote.visible_if), true);
});

test('Beitreten: Waage für Geld, Kreidezirkel nur mit Pfad, Ruß gegen Geisteressenz', () => {
  const s = fall4();
  talk(s, 'schleierbote', ['Stillen Waage']);
  assert.ok(s.isMember('waage'));
  assert.equal(s.money, 460);
  assert.throws(() => talk(s, 'schleierbote', ['Kreidezirkel beitreten']), /keine verfügbare Option/);
  talk(s, 'schleierbote', ['Und der Kreidezirkel?']);
  s.pathway = { id: 'faden', seq: 9, digestion: 0 };
  talk(s, 'schleierbote', ['Kreidezirkel beitreten']);
  assert.ok(s.isMember('kreide'));
  assert.throws(() => talk(s, 'schleierbote', ['Rußgesellschaft beitreten']), /keine verfügbare Option/);
  s.addItem('geisteressenz');
  talk(s, 'schleierbote', ['Rußgesellschaft beitreten']);
  assert.ok(s.isMember('russ'));
  assert.equal(s.itemCount('geisteressenz'), 0);
  assert.deepEqual(s.memberships().sort(), ['kreide', 'russ', 'waage']);
});

test('Uhr: alle 20 Minuten ein Treffen, reihum, nur kurz offen', () => {
  const s = fall4();
  talk(s, 'schleierbote', ['Stillen Waage']);
  const notes = [];
  s.on('gathering', (e) => notes.push(e));
  const order = rules.order;
  assert.equal(rules.interval_min, 20);
  for (let c = 0; c < order.length * 2; c++) assert.equal(s.gatheringSlot(c).id, order[c % order.length]);
  // Eine ganze Stunde spielen: genau ein Waage-Treffen öffnet und schließt wieder
  s.playTime = s.gatheringSlot(1).start; // nach der ersten Runde einsteigen
  s.lastGatheringCycle = null;
  play(s, order.length * rules.interval_min * MIN);
  assert.deepEqual(notes.map((n) => [n.id, n.open]), [['waage', true], ['waage', false]]);
  // Status fürs HUD
  jumpTo(s, 'kreide');
  assert.match(s.gatheringStatus().text, /Stille Waage in \d+:\d\d/);
  jumpTo(s, 'waage');
  assert.match(s.gatheringStatus().text, /Stille Waage: offen noch \d+:\d\d/);
});

test('Treffpunkt erscheint nur für Mitglieder während des Treffens auf der Stadtkarte', () => {
  const s = fall4();
  const dest = content.travel.find((t) => t.map === 'treffen_waage');
  jumpTo(s, 'waage');
  assert.equal(s.meets(dest), false, 'kein Mitglied');
  talk(s, 'schleierbote', ['Stillen Waage']);
  assert.equal(s.meets(dest), true);
  s.playTime += rules.open_min * MIN;
  assert.equal(s.meets(dest), false, 'Treffen vorbei');
  assert.ok(content.travelRules.pins.treffen_waage, 'Pin auf der Stadtkarte');
});

test('Handel auf dem Treffen: Zutaten für Sequenz 7, begrenzte Menge, danach geschlossen', () => {
  const s = fall4();
  talk(s, 'schleierbote', ['Stillen Waage']);
  let stock;
  // Ein Treffen suchen, auf dem Geisteressenz liegt
  for (let i = 0; i < 30; i++) {
    jumpTo(s, 'waage');
    stock = s.shopStock('tresswell');
    if (stock.some((e) => e.item === 'geisteressenz')) break;
  }
  assert.equal(talk(s, 'tresswell', [])[0], 'open');
  const ess = stock.find((e) => e.item === 'geisteressenz');
  assert.ok(ess && !ess.locked);
  for (let i = 0; i < ess.limit; i++) assert.equal(s.buy('tresswell', 'geisteressenz').ok, true);
  const again = s.buy('tresswell', 'geisteressenz');
  assert.equal(again.ok, false);
  assert.match(again.text, /nichts mehr/);
  // Das Angebot über viele Treffen enthält die Zutaten für Sequenz 7
  const seen = new Set();
  for (let i = 0; i < 40; i++) { jumpTo(s, 'waage'); s.shopStock('tresswell').forEach((e) => seen.add(e.item)); }
  for (const id of seq7Ingredients) assert.ok(seen.has(id), `${id} taucht auf`);
  // Nach dem Treffen ist alles zu
  s.playTime += rules.open_min * MIN;
  assert.equal(talk(s, 'tresswell', [])[0], 'closed');
  assert.ok(s.shopStock('tresswell').every((e) => e.locked));
  assert.equal(s.buy('tresswell', 'nebeltau').ok, false);
});

test('Kreidezirkel bietet die Formel für Sequenz 7 des eigenen Pfades öfter an als Kittering', () => {
  const s = fall4();
  s.pathway = { id: 'eisen', seq: 8, digestion: 100 };
  talk(s, 'schleierbote', ['Kreidezirkel beitreten']);
  let hits = 0;
  for (let i = 0; i < 40; i++) {
    jumpTo(s, 'kreide');
    const e = s.shopStock('vellacourt').find((x) => x.item === 'formel_eisen_7');
    if (e) { hits++; assert.equal(e.locked, null); }
    assert.ok(!s.shopStock('vellacourt').some((x) => x.item === 'formel_laterne_7'), 'fremde Pfade bleiben unsichtbar');
  }
  assert.ok(hits >= 10, `nur ${hits}/40`);
});

test('Spielzeit und Einkäufe überstehen Speichern und Laden', () => {
  const s = fall4();
  talk(s, 'schleierbote', ['Stillen Waage']);
  jumpTo(s, 'waage');
  s.buy('tresswell', 'nebeltau');
  const t = s.playTime;
  const data = JSON.parse(JSON.stringify(s.serialize()));
  const l = new GameState(content);
  assert.ok(l.load(data));
  assert.ok(Math.abs(l.playTime - t) <= 1);
  assert.ok(l.isMember('waage'));
  assert.equal(l.shopStock('tresswell').find((e) => e.item === 'nebeltau').left, s.shopStock('tresswell').find((e) => e.item === 'nebeltau').left);
  // Ein laufendes Treffen wird nach dem Laden nicht noch einmal angekündigt
  const notes = [];
  l.on('gathering', (e) => notes.push(e));
  l.tickGatherings(1);
  assert.equal(notes.length, 0);
});

test('Treffpunkte haben einen Ausgang und Gastgeber mit Händler', () => {
  for (const g of Object.values(content.gatherings.circles)) {
    const map = content.maps[g.map];
    assert.ok(map, g.map);
    assert.ok(map.interactables.some((i) => i.kind === 'travel'), `${g.map}: Ausgang`);
    const host = map.npcs[0].id;
    assert.ok(content.npcs[host] && content.dialogues[host], host);
    assert.equal(content.market.merchants[host].gathering, Object.keys(content.gatherings.circles).find((k) => content.gatherings.circles[k] === g));
    for (const e of content.market.merchants[host].stock) assert.ok(content.items[e.item], `${host}: ${e.item}`);
  }
});
