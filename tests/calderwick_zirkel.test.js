// Calderwicker Zirkel und Beyonder-Reste als eigenes Los (Seb 2026-11-26).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { REST_ZIRKEL_WERT } from '../src/core/Auction.js';
import { CW_ZIRKEL, CWZ_FLAG, CWZ_TUER } from '../src/data/calderwickZirkel.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Calderwick hat zwei eigene Zirkel: Waffen/Rüstungen und Artefakte, Seq-4-Zutaten nur am Rand', () => {
  assert.deepEqual(content.gatherings.rules.orders.calderwick, Object.keys(CW_ZIRKEL));
  const kinds = (cid) => content.gatherings.circles[cid].members.flatMap((m) => m.offers.map((o) => content.items[o.item].kind));
  const blei = kinds('cw_bleisatz');
  const pfand = kinds('cw_pfandrunde');
  assert.ok(blei.filter((k) => ['weapon', 'gear'].includes(k)).length > blei.length / 2);
  assert.ok(pfand.filter((k) => k === 'artifact').length > pfand.length / 2);
  for (const cid of Object.keys(CW_ZIRKEL)) {
    const c = content.gatherings.circles[cid];
    assert.equal(c.city, 'calderwick');
    assert.equal(c.member_flag, CWZ_FLAG);
    assert.ok(content.travelRules.cities.calderwick.pins[c.map], 'Pin auf der Stadtkarte');
    assert.ok(content.travel.some((t) => t.map === c.map && t.requires_gathering === cid && t.city === 'calderwick'));
  }
  // Calderwick-Niveau: Waffen stärker und teurer als in den Läden (dort Angriff bis 50)
  const waffen = Object.values(content.items).filter((i) => i.kind === 'weapon' && /^cwz_/.test(Object.keys(content.items).find((k) => content.items[k] === i)));
  assert.ok(waffen.every((w) => w.atk > 50 && w.price >= 30000));
});

test('Türsteherin: Aufnahme nur mit einem Calderwicker Bürgen', () => {
  const tree = content.dialogues[CWZ_TUER];
  assert.ok(content.maps.cw_quittungsmarkt.npcs.some((n) => n.id === CWZ_TUER));
  assert.deepEqual(tree.nodes.ok.sets_flags, [CWZ_FLAG]);
  const s = new GameState(content);
  const offen = tree.nodes.start.choices.filter((c) => c.next === 'ok' && s.meets(c));
  assert.equal(offen.length, 0, 'ohne Bürgen kein Weg hinein');
  s.flags.add('k4s_ida'); // Oskar bürgt, wenn Ida zurück ist
  assert.ok(tree.nodes.start.choices.some((c) => c.next === 'ok' && s.meets(c)));
});

test('Beyonder-Reste lassen sich in jedem Zirkel versteigern, Wert nach Sequenz', () => {
  const s = new GameState(content);
  s.addItem('rest_laterne_4');
  s.addItem('rest_eisen_6');
  const list = s.ownOfferables();
  assert.equal(list.find((o) => o.id === 'rest_laterne_4').value, REST_ZIRKEL_WERT[4]);
  assert.equal(list.find((o) => o.id === 'rest_eisen_6').value, REST_ZIRKEL_WERT[6]);
  assert.ok(REST_ZIRKEL_WERT[3] > REST_ZIRKEL_WERT[4] && REST_ZIRKEL_WERT[4] > REST_ZIRKEL_WERT[5]);
  // Ein ganzes Treffen: Rest anbieten und zuschlagen
  s.flags.add(CWZ_FLAG);
  s.testmodus = true;
  s.map = 'treffen_cw_pfandrunde';
  s.startSession('cw_pfandrunde');
  s.auction.phase = 'own';
  let sold = false;
  for (let i = 0; i < 5 && !sold; i++) {
    s.offerOwn('rest_laterne_4');
    if (s.auction.own?.bids.length) { const p = s.auction.own.bids[0].price; const vor = s.money; s.acceptOwn(); assert.equal(s.money - vor, p); sold = true; } else s.withdrawOwn();
  }
  if (sold) assert.equal(s.itemCount('rest_laterne_4'), 0);
});

test('★-Warnung: Rest des eigenen Pfads taugt als Hauptzutat, solange die echte fehlt', () => {
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 4, digestion: 0 };
  s.addItem('rest_laterne_3');
  const e = s.pfadBedarf().get('rest_laterne_3');
  assert.ok(e?.reasons.some((r) => r.seq === 3 && r.main));
  assert.equal(s.verkaufWarnung('rest_laterne_3').length, 1);
  assert.ok(!s.pfadBedarf().has('rest_eisen_3'), 'fremder Pfad: keine Marke');
  s.addItem('sq_zutat_laterne_3'); // echte Hauptzutat da: Rest ist frei
  assert.ok(!s.pfadBedarf().has('rest_laterne_3'));
});
