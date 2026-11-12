// Kein Zurück nach Kettlegate (Seb, 2026-11-11): Nach der Ankunft in Wexmoor ist Kettlegate gesperrt, auch für alte
// Spielstände und im Koop. Was man dort brauchte, steht im Unterschlupf: Braukessel und Zunders Schmuggelkiste.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { travelDestinations, cityOf, cityLocked } from '../src/core/Travel.js';
import { loadContent, talk } from './helpers.js';

const content = loadContent();

function inWexmoor() {
  const s = new GameState(content);
  for (const f of ['kapitel1_done', 'k2_arrived', 'k2_met_zunder', 'k2_hideout']) s.flags.add(f);
  s.map = 'wx_kahn';
  return s;
}

test('Von keiner Wexmoorer Karte führt ein Reiseziel nach Kettlegate', () => {
  const s = inWexmoor();
  assert.ok(cityLocked(s, 'kettlegate'));
  assert.ok(!cityLocked(s, 'wexmoor'));
  for (const f of ['k2_akt1_done', 'k2_zunder_free', 'kapitel2_done']) s.flags.add(f);
  const wxMaps = Object.values(content.maps).filter((m) => m.city === 'wexmoor').map((m) => m.id);
  assert.ok(wxMaps.length > 10);
  for (const map of wxMaps) {
    const bad = travelDestinations(s, map).map((t) => t.map).filter((m) => cityOf(s, m) === 'kettlegate');
    assert.deepEqual(bad, [], `${map} führt nach Kettlegate: ${bad.join(',')}`);
  }
  assert.ok(!content.travel.some((t) => /Nachtzug nach (Kettlegate|Wexmoor)/.test(t.name)), 'Nachtzug-Rückfahrt existiert nicht mehr');
});

test('Vor der Abreise bleibt Kettlegate offen, nur der Zug nach Wexmoor kommt dazu', () => {
  const s = new GameState(content);
  s.flags.add('kapitel1_done');
  s.addItem('fahrkarte_wexmoor');
  assert.ok(!cityLocked(s, 'kettlegate'));
  const dests = travelDestinations(s, 'revier').map((t) => t.map);
  assert.ok(dests.some((m) => cityOf(s, m) === 'kettlegate'), dests.join(','));
  assert.ok(dests.includes('wx_bahnhof'));
});

test('Alte Spielstände in Kettlegate wachen nach der Ankunft im Unterschlupf auf (auch im Koop)', () => {
  const s = new GameState(content);
  s.flags.add('kapitel1_done');
  s.flags.add('k2_arrived');
  s.flags.add('k2_hideout');
  s.map = 'docks';
  s.position = { x: 100, y: 100 };
  s.addP2?.();
  const data = JSON.parse(JSON.stringify(s.serialize()));
  const t = new GameState(content);
  assert.ok(t.load(data));
  assert.equal(t.map, 'wx_kahn');
  assert.equal(t.spawn, 'default');
  assert.equal(t.position, null);
  if (s.hasP2?.()) assert.ok(t.hasP2(), 'Spieler 2 bleibt dabei');
  // Wer noch in Kettlegate ist, bleibt dort
  const u = new GameState(content);
  u.flags.add('kapitel1_done');
  u.map = 'docks';
  const v = new GameState(content);
  v.load(JSON.parse(JSON.stringify(u.serialize())));
  assert.equal(v.map, 'docks');
});

test('Der Unterschlupf hat Braukessel und Schmuggelkiste, die Kiste öffnet die Kettlegate-Händler', () => {
  const kahn = content.maps.wx_kahn;
  const kessel = kahn.interactables.find((i) => i.id === 'kessel');
  assert.equal(kessel?.kind, 'brew');
  const kiste = kahn.interactables.find((i) => i.id === 'schmuggelkiste');
  assert.equal(kiste?.kind, 'dialogue');
  const s = inWexmoor();
  assert.ok(s.meets(kessel.visible_if));
  assert.ok(s.meets(kiste.visible_if));
  const tree = content.dialogues[kiste.dialogue];
  const shops = tree.nodes[tree.start].choices.map((c) => c.shop).filter(Boolean);
  assert.deepEqual(shops.sort(), ['gorse', 'kittering', 'nell', 'schmuggel']);
  for (const id of shops) assert.ok(s.merchant(id), id);
  talk(s, kiste.dialogue, []);
  // Brauen geht am Kessel wie am Nachtmarkt: Rezeptliste kommt aus dem Pfad
  s.drinkFirst?.('laterne');
  assert.ok(Array.isArray(s.recipes()));
});

test('Jede Zutat der Sequenzen 7 bis 5 ist in Wexmoor zu haben (Händler, Schmuggelkiste oder Wexmoorer Treffen)', () => {
  const sources = new Set();
  for (const m of Object.values(content.market.merchants)) if (!m.gathering) for (const e of m.stock ?? []) sources.add(e.item);
  for (const c of Object.values(content.gatherings.circles)) if ((c.city ?? 'kettlegate') === 'wexmoor') for (const mem of c.members) for (const o of mem.offers ?? []) sources.add(o.item);
  const missing = [];
  for (const [pid, p] of Object.entries(content.pathways)) for (const [n, sd] of Object.entries(p.seqs)) {
    if (Number(n) > 7 || Number(n) < 5) continue;
    for (const ing of Object.keys(sd.ingredients ?? {})) if (!sources.has(ing)) missing.push(`${pid}/${n}: ${ing}`);
  }
  assert.deepEqual(missing, []);
  const sm = content.market.merchants.schmuggel;
  assert.ok(sm.stock.length >= 10);
  for (const e of sm.stock) {
    assert.equal(content.items[e.item].kind, 'ingredient');
    assert.ok(e.rare >= 0.3 && e.rare <= 1, `${e.item}: ${e.rare}`);
  }
  // Kittering führt die Formeln 3 bis 1; die Halbgott-Formel (4) gibt es nur auf Treffen oder als Elite-Beute (Seb 2026-11-12)
  const kit = content.market.merchants.kittering.stock.map((e) => e.item);
  for (const pid of Object.keys(content.pathways)) if (content.items[`formel_${pid}_4`]) assert.ok(sources.has(`formel_${pid}_4`), `${pid} 4 auf Wexmoorer Treffen`);
  for (const pid of Object.keys(content.pathways)) for (const n of [3, 2, 1]) if (content.items[`formel_${pid}_${n}`]) assert.ok(kit.includes(`formel_${pid}_${n}`), `${pid} ${n}`);
});
