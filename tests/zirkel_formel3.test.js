// Seb 2026-11-26: Seq-3-Formeln beim Gildenkrämer 30.000; ab Seq 4 (irgendein Spieler) legt jeder Zirkel je Treffen genau eine zufällige auf.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { ZIRKEL_FORMEL3_PREIS } from '../src/core/Auction.js';
import { FORMEL3_PREIS } from '../src/data/pfadviertel.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const circles = Object.keys(content.gatherings.circles);
const isF3 = (id) => /^(ritual)?formel_.+_3$/.test(id ?? '');
const lots = (s, cid, cycle) => s.circleMembers(cid).map((m) => s.memberLot(cid, cycle, m.id)?.item).filter(isF3);

test('Krämer 30.000, Zirkel-Los günstiger', () => {
  assert.equal(FORMEL3_PREIS, 30000);
  assert.ok(ZIRKEL_FORMEL3_PREIS * 1.45 < FORMEL3_PREIS, 'auch der teuerste Mitbieter bleibt unter dem Krämerpreis');
  for (const c of Object.values(content.gatherings.circles)) for (const m of c.members) assert.ok(!m.offers.some((o) => isF3(o.item)), `${m.id}: kein 1-%-Los mehr`);
});

test('Unter Seq 4 keine Seq-3-Formel, ab Seq 4 in jedem Zirkel genau eine je Treffen', () => {
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 5, digestion: 0 };
  for (const cid of circles) for (let c = 1; c < 6; c++) assert.equal(lots(s, cid, c).length, 0, `${cid}/${c}`);
  s.pathway = { id: 'laterne', seq: 4, digestion: 0 };
  const seen = new Set();
  let eigen = 0;
  let n = 0;
  for (const cid of circles) for (let c = 1; c < 40; c++) {
    const l = lots(s, cid, c);
    assert.equal(l.length, 1, `${cid}/${c}`);
    seen.add(l[0]);
    n++;
    if (l[0].includes('_laterne_')) eigen++;
  }
  assert.ok([...seen].some((id) => id.startsWith('ritualformel_')) && [...seen].some((id) => id.startsWith('formel_')), 'Trank- und Ritualformeln');
  assert.ok(new Set([...seen].map((id) => id.replace(/^(ritual)?formel_|_3$/g, ''))).size >= 6, 'Pfad zufällig');
  assert.ok(eigen / n > 0.1, `eigener Pfad bevorzugt: ${eigen}/${n}`);
});

test('Gilt auch, wenn nur Spieler 2 Seq 4 ist', () => {
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 6, digestion: 0 };
  s.addP2();
  s.withPlayer(2, () => { s.pathway = { id: 'eisen', seq: 4, digestion: 0 }; });
  assert.equal(lots(s, circles[0], 3).length, 1);
  s.withPlayer(2, () => assert.equal(lots(s, circles[0], 3).length, 1));
});

test('Markierung: Trank- und Ritualformel 3 sind Bedarf ab Seq 4', () => {
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 4, digestion: 0 };
  const b = s.pfadBedarf();
  assert.ok(b.has('formel_laterne_3') && b.has('ritualformel_laterne_3'));
});
