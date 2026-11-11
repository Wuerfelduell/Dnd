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
    if (m.gathering || m.treffen_ersatz) continue; // Zunders Schmuggelkiste vertritt die Kettlegate-Treffen in Wexmoor
    for (const e of m.stock) assert.ok(!highIngredients.includes(e.item), `${id} verkauft ${e.item}`);
  }
});

const lotsOf = (c) => (c.members ?? []).flatMap((m) => m.offers.map((e) => e.item));

test('Jede Zutat ab Sequenz 7 gibt es auf mindestens einem Treffen', () => {
  const sold = new Set(Object.values(content.gatherings.circles).flatMap(lotsOf));
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

test('Uhr: alle 5 Minuten ein Treffen, reihum, nur kurz offen', () => {
  const s = fall4();
  talk(s, 'schleierbote', ['Stillen Waage']);
  const notes = [];
  s.on('gathering', (e) => notes.push(e));
  const order = rules.order;
  assert.equal(rules.interval_min, 5);
  assert.ok(rules.open_min < rules.interval_min, 'ein Treffen endet, bevor das nächste beginnt');
  assert.equal(rules.sleep_skip_min, undefined, 'Schlafen verkürzt die Wartezeit nicht mehr');
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

/** Mitglied der Waage, Treffen offen, Runde eröffnet. */
function session(id = 'waage', setup = () => {}) {
  const s = fall4();
  s.pathway = { id: 'eisen', seq: 8, digestion: 0 };
  setup(s);
  if (id === 'waage') talk(s, 'schleierbote', ['Stillen Waage']);
  if (id === 'kreide') talk(s, 'schleierbote', ['Kreidezirkel beitreten']);
  jumpTo(s, id);
  return s;
}

test('Jeder Zirkel ist eine Gruppe aus 4 bis 5 Leuten (Täfelchengilde: 3), alle sitzen am Treffpunkt', () => {
  for (const [id, c] of Object.entries(content.gatherings.circles)) {
    assert.ok(c.members.length >= (['namensgilde', 'schichtbund'].includes(id) ? 3 : 4) && c.members.length <= 5, `${id}: ${c.members.length}`);
    const map = content.maps[c.map];
    for (const m of c.members) {
      assert.ok(content.npcs[m.id], m.id);
      assert.ok(map.npcs.some((n) => n.id === m.id), `${m.id} sitzt in ${c.map}`);
      const nodes = Object.values(content.dialogues[content.npcs[m.id].dialogue ?? m.id].nodes); // AQ: eigener Dialog mit Startknoten
      assert.ok(nodes.some((n) => n.choices?.some((ch) => ch.auction === id)), `${m.id} eröffnet die Runde`);
      assert.ok(m.offers.length && m.wants.length, `${m.id}: Angebote und Gesuche`);
      for (const e of m.offers) assert.ok(content.items[e.item], e.item);
      for (const w of m.wants) assert.ok(content.items[w], w);
    }
    assert.ok(map.interactables.some((i) => i.kind === 'travel' || (i.kind === 'door' && i.to)), `${c.map}: Ausgang`); // Schichtbund (BC): Tür zurück ins Runddepot
  }
});

test('Runde: reihum ein Los mit Mitbietern, danach ein Gesuch, am Ende das eigene Angebot', () => {
  const s = session();
  assert.equal(s.startSession('waage').ok, true);
  const a = s.auction;
  assert.equal(a.members.length, content.gatherings.circles.waage.members.length);
  const seen = [];
  let guard = 0;
  while (a.phase === 'lot' || a.phase === 'request') {
    assert.ok(guard++ < 50);
    seen.push(`${a.turn}:${a.phase}`);
    if (a.phase === 'lot') {
      assert.equal(s.auctionSpeaker(), a.lot.seller);
      // so lange mitbieten, bis man gewinnt oder überboten wird
      let r = s.bid();
      let n = 0;
      while (r.outbid && n++ < 30) r = s.bid();
      if (a.phase === 'lot') s.passLot();
    } else {
      s.declineRequest();
    }
  }
  assert.equal(a.phase, 'own');
  assert.ok(new Set(seen.map((x) => x.split(':')[0])).size >= a.members.length - 1, 'jedes Mitglied war dran');
  assert.ok(a.bought.length > 0, 'mit genug Geld gewinnt man auch etwas');
  for (const b of a.bought) assert.ok(s.itemCount(b.item) > 0);
  // Pro Treffen nur eine Runde
  s.endSession();
  assert.equal(s.startSession('waage').ok, false);
});

test('Auktion: Mitbieter treiben den Preis, Aussteigen kostet nichts', () => {
  const s = session();
  s.startSession('waage');
  const a = s.auction;
  // Ein Los mit Mitbieter suchen
  let guard = 0;
  while (!(a.phase === 'lot' && a.lot.leader) && guard++ < 20) { if (a.phase === 'lot') s.passLot(); else if (a.phase === 'request') s.declineRequest(); else break; }
  if (a.phase !== 'lot') return; // in dieser Runde bot nie jemand mit (sehr selten)
  const start = a.lot.price;
  const money = s.money;
  const r = s.bid();
  assert.ok(r.ok);
  assert.ok(a.phase !== 'lot' || a.lot.price > start, 'Preis steigt');
  if (a.phase === 'lot') {
    s.passLot();
    assert.equal(s.money, money, 'überboten und ausgestiegen: nichts bezahlt');
  }
});

test('Gesuche: stehen vorher fest, werden angekündigt und zahlen gut', () => {
  const s = fall4();
  talk(s, 'schleierbote', ['Stillen Waage']);
  jumpTo(s, 'kreide');
  const next = s.nextGathering();
  const reqs = s.sessionRequests('waage', next.cycle);
  assert.ok(reqs.length > 0, 'die Waage sucht etwas');
  assert.match(s.gatheringStatus().text, /gesucht: /);
  for (const q of reqs) assert.ok(s.gatheringStatus().text.includes(s.item(q.item).name));
  // Mitbringen und abgeben
  for (const q of reqs) s.addItem(q.item);
  s.playTime = next.start + 1;
  s.startSession('waage');
  const a = s.auction;
  const before = s.money;
  let got = 0;
  let guard = 0;
  while ((a.phase === 'lot' || a.phase === 'request') && guard++ < 50) {
    if (a.phase === 'lot') s.passLot();
    else { const q = a.request; assert.ok(q.price >= s.itemValue(q.item)); s.fulfillRequest(); got += q.price; }
  }
  assert.equal(got, reqs.reduce((t, q) => t + q.price, 0));
  assert.equal(s.money, before + got);
});

test('Ohne die Zutat kann man ein Gesuch nur ablehnen', () => {
  const s = session();
  s.startSession('waage');
  const a = s.auction;
  let guard = 0;
  while (a.phase === 'lot' && guard++ < 10) s.passLot();
  if (a.phase !== 'request') return;
  const q = a.request;
  s.inventory[q.item] = 0; delete s.inventory[q.item];
  assert.equal(s.fulfillRequest().ok, false);
  assert.equal(s.declineRequest().ok, true);
});

test('Eigenes Angebot: eigene Artefakte und Formeln, geliehene nicht', () => {
  const s = session();
  s.addItem('formel_eisen_9');
  s.addItem('hungriger_ring');
  s.borrowed = ['uhr_ertrunkener'];
  s.addItem('uhr_ertrunkener');
  s.startSession('waage');
  const a = s.auction;
  let guard = 0;
  while ((a.phase === 'lot' || a.phase === 'request') && guard++ < 50) { if (a.phase === 'lot') s.passLot(); else s.declineRequest(); }
  const ids = s.ownOfferables().map((o) => o.id);
  assert.ok(ids.includes('formel_eisen_9') && ids.includes('hungriger_ring'));
  assert.ok(!ids.includes('uhr_ertrunkener'), 'Leihgabe des Reviers');
  // Ring anbieten, bis jemand bietet (Gebote hängen vom Würfel ab), dann annehmen
  s.offerOwn('hungriger_ring');
  if (!a.own.bids.length) { s.withdrawOwn(); return; }
  const best = a.own.bids[0].price;
  const money = s.money;
  s.withdrawOwn();
  assert.equal(s.itemCount('hungriger_ring'), 1, 'zurückgezogen');
  s.offerOwn('formel_eisen_9');
  if (a.own.bids.length) {
    const p = a.own.bids[0].price;
    s.acceptOwn();
    assert.equal(s.itemCount('formel_eisen_9'), 0);
    assert.equal(s.money, money + p);
  }
  assert.ok(best > 0);
});

test('Formeln kommen auf Treffen oft vor, die für den eigenen Pfad aber selten', () => {
  const s = fall4();
  s.pathway = { id: 'eisen', seq: 8, digestion: 100 };
  let lots = 0;
  let formulas = 0;
  let own = 0;
  for (let cycle = 0; cycle < 300; cycle++) {
    for (const [cid, c] of Object.entries(content.gatherings.circles)) {
      for (const m of c.members) {
        const lot = s.memberLot(cid, cycle, m.id);
        if (!lot) continue;
        lots++;
        if (lot.item.startsWith('formel_')) formulas++;
        if (lot.item.startsWith('formel_eisen_')) own++;
      }
    }
  }
  assert.ok(formulas / lots > 0.3, `Formeln ${formulas}/${lots}`);
  assert.ok(own / lots < 0.08, `eigener Pfad ${own}/${lots}`);
  assert.ok(own > 0, 'kommt aber vor');
});

test('Neue Artefakte sind auf den Treffen im Umlauf', () => {
  const fromMeetings = Object.entries(content.artifacts.list).filter(([, a]) => a.source === 'treffen').map(([id]) => id);
  assert.ok(fromMeetings.length >= 10);
  const offered = new Set(Object.values(content.gatherings.circles).flatMap((c) => c.members.flatMap((m) => m.offers.map((e) => e.item))));
  for (const id of fromMeetings) {
    assert.ok(offered.has(id), `${id} wird nirgends angeboten`);
    assert.equal(content.items[id].kind, 'artifact');
    assert.ok(content.items[id].boons.length && content.items[id].curses.length, `${id}: Vor- und Nachteile`);
  }
});

test('Gehaltene Runden überstehen Speichern und Laden', () => {
  const s = session();
  s.startSession('waage');
  s.endSession();
  const l = new GameState(content);
  assert.ok(l.load(JSON.parse(JSON.stringify(s.serialize()))));
  assert.ok(l.sessionHeld('waage'));
  assert.equal(l.startSession('waage').ok, false);
  // Ein laufendes Treffen wird nach dem Laden nicht noch einmal angekündigt
  const notes = [];
  l.on('gathering', (e) => notes.push(e));
  l.tickGatherings(1);
  assert.equal(notes.length, 0);
});

test('Nach dem Treffen ist Schluss', () => {
  const s = session();
  s.playTime += rules.open_min * MIN;
  assert.equal(talk(s, 'tresswell', [])[0], 'closed');
  assert.equal(s.startSession('waage').ok, false);
});

test('Wegweiser: Während ein eigenes Treffen läuft, zeigt der Pfeil dorthin', async () => {
  const { nextHop } = await import('../src/core/Guide.js');
  const s = fall4();
  s.pathway = { id: 'faden', seq: 9, digestion: 0 };
  s.map = 'altmarkt';
  jumpTo(s, 'kreide');
  assert.equal(s.gatheringTarget(), null, 'kein Mitglied');
  talk(s, 'schleierbote', ['Kreidezirkel beitreten']);
  const t = s.gatheringTarget();
  assert.equal(t.map, 'treffen_kreide');
  assert.match(t.step, /Stadtkarte/);
  assert.match(s.gatheringStatus().text, /über die Stadtkarte/);
  // Vom Altmarkt führt der Weg über die Stadtkarte
  const hop = nextHop(content, 'altmarkt', 'treffen_kreide');
  assert.ok(hop?.travel, 'über die Stadtkarte');
  assert.equal(content.maps.altmarkt.interactables.find((i) => i.id === hop.via).kind, 'travel');
  // Am Treffpunkt zeigt er auf den Gastgeber
  s.map = 'treffen_kreide';
  assert.equal(s.gatheringTarget().id, 'vellacourt');
  // Nach dem Treffen gibt es kein Ziel mehr
  s.playTime += rules.open_min * MIN;
  assert.equal(s.gatheringTarget(), null);
});

test('Formeln für Sequenz 6 und 5: nur auf geheimen Treffen oder als seltener Fund', () => {
  const pids = Object.keys(content.pathways);
  // In Wexmoor bieten Lichtlose und Salzbrüder zusammen jeden Pfad an
  const wx = ['lichtlose', 'salz'].flatMap((c) => content.gatherings.circles[c].members.flatMap((m) => m.offers.map((o) => o.item)));
  for (const pid of pids) for (const q of [6, 5]) assert.ok(wx.includes(`formel_${pid}_${q}`), `Wexmoor-Treffen: formel_${pid}_${q}`);
  // Seltene Funde in späten Gefahrengebieten, jeweils mit kleiner Chance
  const drops = Object.values(content.loot).flatMap((t) => t.drops ?? []).filter((d) => /^formel_\w+_[65]$/.test(d.item));
  for (const pid of pids) for (const q of [6, 5]) assert.ok(drops.some((d) => d.item === `formel_${pid}_${q}`), `Fund: formel_${pid}_${q}`);
  assert.ok(drops.every((d) => d.chance <= 0.05), 'Formel-Funde bleiben selten');
});

test('Besuchte Treffen verschwinden sofort und die Anzeige zählt auf das nächste', () => {
  const s = fall4();
  talk(s, 'schleierbote', ['Stillen Waage']);
  jumpTo(s, 'waage');
  const dest = content.travel.find((t) => t.map === 'treffen_waage');
  assert.ok(s.meets(dest));
  const notes = [];
  s.on('gathering', (e) => notes.push(e));
  s.lastGatheringCycle = s.marketCycle();
  assert.equal(s.startSession('waage').ok, true);
  s.endSession();
  assert.equal(s.gatheringOpen('waage'), false);
  assert.equal(s.meets(dest), false, 'nicht mehr auf der Stadtkarte');
  assert.equal(s.gatheringTarget(), null, 'kein Wegweiser mehr');
  assert.match(s.gatheringStatus().text, /Stille Waage in \d+:\d\d/);
  s.tickGatherings(1);
  assert.deepEqual(notes.map((n) => n.open), [false], 'Meldung: aufgelöst');
  // Das nächste Treffen läuft ganz normal
  jumpTo(s, 'waage');
  assert.ok(s.gatheringOpen('waage'));
});

test('Auf den Treffen gibt es nur seltene Dinge fürs große Geld, nichts vom normalen Markt', () => {
  const regular = new Set(Object.values(content.market.merchants).filter((m) => !m.gathering)
    .flatMap((m) => m.stock.filter((e) => e.rare === undefined).map((e) => e.item)));
  // Einzige gewollte Überschneidung (Seb, 2026-11-11): die Halbgott-Formel (Seq 4) kostet 4000 bei Kittering wie auf den Treffen
  for (const id of regular) if (/^formel_.*_4$/.test(id)) regular.delete(id);
  const arts = [];
  for (const [id, c] of Object.entries(content.gatherings.circles)) {
    if (id === 'schichtbund') continue; // BC: der Arbeiterzirkel in Dunscar handelt bewusst auch mit Alltagsware und billigen Zutaten
    for (const m of c.members) {
      for (const e of m.offers) {
        assert.ok(!regular.has(e.item), `${id}/${m.id} bietet ${e.item} an, das gibt es auch so`);
        assert.ok(e.price >= 90, `${id}/${m.id}: ${e.item} für ${e.price} ist zu billig`);
        if (content.items[e.item].kind === 'artifact') arts.push(e);
      }
      for (const w of m.wants) assert.ok(!regular.has(w), `${id}/${m.id} sucht ${w}, das gibt es auch so`);
    }
  }
  assert.ok(arts.length >= 8, 'Artefakte als Lose');
  for (const e of arts) assert.ok(e.price >= 390 && e.price <= 650, `${e.item}: ${e.price}`); // seit dem Balancing teurer (vorher 300–500)
  // Eigene Artefakte bringen beim Versteigern auch ordentlich Geld
  const s = new GameState(content);
  assert.ok(s.itemValue('hungriger_ring') >= 300);
});

// Sebs Regel (2026-11-10): Kein Los ist ein blinder Kauf. Was auf den Treffen gehandelt wird,
// zeigt Segen und Fluch (Artefakte, Kleidung) bzw. Pfad und Sequenz (Formeln) schon beim Angebot.
test('offerInfo: jedes Los eines Zirkels verrät vorher, was es taugt', () => {
  const s = new GameState(content);
  for (const c of Object.values(content.gatherings.circles)) {
    for (const m of c.members ?? []) {
      for (const o of m.offers) {
        const info = s.offerInfo(o.item);
        assert.ok(info, `${o.item} ohne Angebotsinfo`);
        if (['artifact', 'gear'].includes(info.kind)) assert.ok(info.boons.length + info.curses.length > 0, `${o.item}: Artefakt ohne Segen/Fluch-Text`);
        if (info.kind === 'formula') assert.match(info.notes[0], /Pfad|Stufe/, `${o.item}: Formel ohne Hinweis zum Pfad`);
        if (info.kind === 'weapon') assert.match(info.notes[0], /Angriff \d/);
      }
    }
  }
  // Fasser-Artefakte ebenso
  for (const r of content.gatherings.artisan.recipes) {
    const info = s.offerInfo(r.artifact ?? r.id);
    assert.ok(info.boons.length + info.curses.length > 0, `${r.id}: Fasser-Artefakt ohne Segen/Fluch-Text`);
  }
});

test('offerInfo: Formeln sagen, ob sie zum eigenen Pfad passen', () => {
  const s = new GameState(content);
  const fid = Object.keys(content.items).find((id) => content.items[id].kind === 'formula' && content.items[id].pathway === 'laterne' && content.items[id].seq === 8);
  assert.ok(fid);
  assert.match(s.offerInfo(fid).notes[0], /keinen Pfad/);
  s.pathway = { id: 'laterne', seq: 9 };
  assert.match(s.offerInfo(fid).notes[0], /nächste Stufe/);
  s.pathway = { id: 'laterne', seq: 8 };
  assert.match(s.offerInfo(fid).notes[0], /hinter dir/);
  s.pathway = { id: 'faden', seq: 9 };
  assert.match(s.offerInfo(fid).notes[0], /Nicht dein Pfad/);
});
