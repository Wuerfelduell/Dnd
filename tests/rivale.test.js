// Rivale auf dem eigenen Pfad (Seb 2026-11-26): ab Wexmoor, steigt parallel auf, kauft weg, stört Rituale, Kampf/Diebstahl/Bündnis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { DAY_SECONDS } from '../src/core/Clock.js';
import { Combat } from '../src/core/Combat.js';
import { RIVALEN, RIVALE_REGELN, RIVALE_TEXTE, rivaleEncId, rivaleText, rivaleWoerterbuch } from '../src/data/rivale.js';
import { restId } from '../src/data/beyonderRest.js';
import { loadContent } from './helpers.js';

const content = loadContent();

function spieler(pid = 'laterne', seq = 7) {
  const s = new GameState(content);
  s.pathway = { id: pid, seq, digestion: 0 };
  s.flags.add('k2_arrived');
  return s;
}

test('je Pfad und Sequenz ein Rivalen-Gegner: Beyonder seines Pfades, mit Rest als Beute', () => {
  for (const pid of Object.keys(RIVALEN)) {
    assert.ok(content.pathways[pid], pid);
    for (let seq = 9; seq >= 1; seq--) {
      const id = rivaleEncId(pid, seq);
      const enc = content.encounters[id];
      assert.ok(enc, id);
      assert.equal(enc.rivale, pid);
      assert.equal(enc.beyonder_pfad, pid);
      assert.equal(enc.beyonder_seq, seq);
      assert.ok(!enc.lose_to && !enc.on_win?.sets_flags?.length, `${id}: keine Story-Folgen der Vorlage`);
      assert.ok(content.loot[id].drops.some((d) => d.item === restId(pid, seq) && d.chance === RIVALE_REGELN.rest), id);
    }
    assert.ok(content.encounters[rivaleEncId(pid, 4)].hp > content.encounters[rivaleEncId(pid, 6)].hp);
  }
});

test('erst ab Wexmoor, dann auf der Sequenz des Spielers', () => {
  const s = spieler('eisen', 7);
  s.flags.delete('k2_arrived');
  assert.equal(s.rivaleDaten('eisen'), null);
  assert.equal(s.rivaleBegegnung('wx_salzmarkt', () => 0), null);
  s.flags.add('k2_arrived');
  assert.equal(s.rivaleDaten('eisen').seq, 7);
  assert.equal(s.rivaleBegegnung('ashgrove', () => 0), null, 'nicht in Kettlegate');
  assert.equal(s.rivaleBegegnung('wx_vergessmoor', () => 0), null, 'nicht im Gefahrengebiet');
  assert.deepEqual(s.rivaleBegegnung('wx_salzmarkt', () => 0.99), { pid: 'eisen', treffen: false }, 'die erste Begegnung kommt sicher');
});

test('steigt parallel auf: holt auf, zieht höchstens eine Sequenz davon', () => {
  const s = spieler('faden', 7);
  s.rivaleDaten('faden');
  s.playTime = DAY_SECONDS * 40;
  assert.equal(s.rivaleDaten('faden').seq, 6, 'nach vielen Tagen eine voraus');
  s.pathway.seq = 4;
  s.playTime += DAY_SECONDS;
  assert.equal(s.rivaleDaten('faden').seq, 5, 'holt einen Tag auf');
  s.playTime += DAY_SECONDS * 3;
  assert.ok(s.rivaleDaten('faden').seq >= 3 && s.rivaleDaten('faden').seq <= 4);
});

test('kauft Zutaten des nächsten Tranks weg (nur Zutaten, an manchen Tagen)', () => {
  const s = spieler('laterne', 7);
  const f = content.items.formel_laterne_6;
  const haendler = Object.entries(content.market.merchants).filter(([, m]) => !m.gathering && m.stock.some((e) => e.item in f.ingredients)).map(([id]) => id);
  assert.ok(haendler.length);
  let weg = 0;
  for (let tag = 0; tag < 40; tag++) {
    s.playTime = tag * DAY_SECONDS;
    for (const mid of haendler) {
      const stock = s.shopStock(mid);
      for (const e of stock.filter((x) => x.rivale)) {
        weg++;
        assert.ok(e.item in f.ingredients);
        assert.equal(s.buy(mid, e.item).ok, false);
      }
      assert.ok(stock.filter((x) => x.rivale).length <= 1);
    }
  }
  assert.ok(weg > 0, 'an manchen Tagen ist etwas weg');
  s.rivalen.laterne.status = 'verbuendet';
  for (const mid of haendler) assert.ok(!s.shopStock(mid).some((x) => x.rivale), 'Verbündete kaufen nichts weg');
});

test('Ritual: steht er im Kreis, muss man ihn hinauswerfen; verloren = heute besetzt', () => {
  const s = spieler('laterne', 6);
  let tag = 0;
  for (; tag < 200; tag++) {
    s.playTime = tag * DAY_SECONDS;
    s.rivaleDaten('laterne').seq = 5;
    s.pendingCombat = null;
    if (s.rivaleImKreis('laterne', 5)) break;
  }
  assert.ok(tag < 200);
  assert.equal(s.pendingCombat, rivaleEncId('laterne', 5));
  const c = new Combat(s, s.pendingCombat);
  c.outcome = 'lost';
  const r = c.finish();
  assert.match(r.text ?? '', /besetzt/);
  assert.match(s.rivaleImKreis('laterne', 5).text, /besetzt/);
  s.playTime += DAY_SECONDS * 400; // ein anderer Tag: wieder frei oder neuer Wurf
  s.rivalen.laterne.status = 'verbuendet';
  assert.equal(s.rivaleImKreis('laterne', 5), null, 'Verbündete stören kein Ritual');
});

test('Bündnis erst nach zwei Siegen; Bestehlen einmal am Tag', () => {
  const s = spieler('schluessel', 7);
  s.addItem('formel_schluessel_6');
  const lage = s.rivaleTreffen('schluessel');
  assert.deepEqual(lage.optionen, ['kampf', 'stehlen', 'buendnis', 'gehen']);
  assert.equal(s.rivaleBuendnis('schluessel').ok, false);
  for (let i = 0; i < RIVALE_REGELN.buendnis_siege; i++) {
    const c = new Combat(s, s.rivaleKampf('schluessel'));
    c.outcome = 'won';
    c.finish();
    s.pendingCombat = null;
  }
  assert.equal(s.rivalen.schluessel.siege, 2);
  assert.ok(!s.rivaleTreffen('schluessel').optionen.includes('kampf'), 'frisch geschlagen: kein Kampf');
  const vorher = Object.values(s.inventory).reduce((a, b) => a + b, 0);
  const st = s.rivaleStehlen('schluessel', () => 0);
  assert.equal(st.ok, true);
  assert.ok(Object.values(s.inventory).reduce((a, b) => a + b, 0) > vorher, 'Zutat in der Tasche');
  assert.ok(!Object.keys(content.items.formel_schluessel_6.ingredients).slice(0, 1).some((id) => s.itemCount(id)), 'nie die Hauptzutat');
  assert.equal(s.rivaleStehlen('schluessel', () => 0).ok, false);
  assert.equal(s.rivaleBuendnis('schluessel').ok, true);
  assert.equal(s.rivalen.schluessel.status, 'verbuendet');
});

test('misslungener Diebstahl startet den Kampf', () => {
  const s = spieler('maske', 6);
  const r = s.rivaleStehlen('maske', () => 0.999);
  assert.equal(r.ok, false);
  assert.equal(s.pendingCombat, rivaleEncId('maske', 6));
});

test('Koop: jeder Spieler hat den Rivalen seines Pfades', () => {
  const s = spieler('laterne', 7);
  s.addP2();
  s.p2.pathway = { id: 'eisen', seq: 6, digestion: 0 };
  assert.deepEqual(s.rivalePfade().sort(), ['eisen', 'laterne']);
  assert.equal(s.rivaleDaten('eisen').seq, 6);
});

test('Speichern und Laden; alte Stände ohne Rivalen', () => {
  const s = spieler('echo', 7);
  s.rivaleTreffen('echo');
  s.rivalen.echo.siege = 1;
  const t = new GameState(content);
  assert.ok(t.load(JSON.parse(JSON.stringify(s.serialize()))));
  assert.equal(t.rivalen.echo.siege, 1);
  assert.equal(t.rivalen.echo.getroffen, true);
  const alt = s.serialize();
  delete alt.rivalen;
  assert.ok(t.load(alt));
  assert.deepEqual(t.rivalen, {});
});

test('englisches Wörterbuch ist aktuell und deckt alle Texte ab', () => {
  const en = JSON.parse(readFileSync(new URL('../src/i18n/en/rivale.json', import.meta.url), 'utf8'));
  assert.deepEqual(en, rivaleWoerterbuch());
  for (const pid of Object.keys(RIVALEN)) for (const key of Object.keys(RIVALE_TEXTE)) assert.ok(en[rivaleText(key, pid)], `${pid} ${key}`);
});
