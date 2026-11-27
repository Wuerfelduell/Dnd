// Rivalen Etappe 1 (Seb 2026-11-27): eigenes Wesen, Ziel, Spruch und eine eigene Aktion je Pfad, Anzeige im Pfad-Tab.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { RIVALEN, RIVALE_ART, rivaleArtText, rivaleWoerterbuch } from '../src/data/rivale.js';
import { loadContent } from './helpers.js';

const content = loadContent();

function spieler(pid, seq = 6) {
  const s = new GameState(content);
  s.pathway = { id: pid, seq, digestion: 0 };
  s.flags.add('k2_arrived');
  s.money = 10000;
  s.rivaleDaten(1);
  return s;
}

test('jeder Pfad hat Wesen, Ziel, Spruch und Aktion, alles im englischen Wörterbuch', () => {
  const en = rivaleWoerterbuch();
  for (const pid of Object.keys(RIVALEN)) {
    assert.ok(RIVALE_ART[pid], pid);
    for (const nr of [1, 2]) for (const f of ['wesen', 'ziel', 'spruch', 'aktion']) assert.ok(en[rivaleArtText(f, pid, nr)], `${pid} ${f}`);
  }
  assert.equal(new Set(Object.values(RIVALE_ART).map((a) => a.art)).size, 10, 'jede Aktion ist anders');
});

test('die Aktionen wirken', () => {
  let s = spieler('schluessel');
  s.rivaleAktion(1);
  assert.equal(s.rivalen.p1.kreis_besetzt, s.rivaleTagNr());
  s = spieler('sq_waage');
  s.rivaleAktion(1);
  assert.equal(s.money, 9500);
  s = spieler('echo');
  const u = s.unruhe;
  s.rivaleAktion(1);
  assert.ok(s.unruhe > u);
  s = spieler('kessel');
  const hp = s.hp;
  s.rivaleAktion(1);
  assert.ok(s.hp < hp);
  s = spieler('sq_uhr');
  s.rivalen.p1.seq = 6;
  s.rivaleAktion(1);
  assert.equal(s.rivalen.p1.seq, 5);
  const ue = s.rivaleUebersicht(1);
  assert.ok(ue.wesen && ue.ziel && ue.aktion);
});

test('Eisen: nach dem Stoß nur Kämpfen oder feige Gehen', () => {
  for (let tag = 0; tag < 40; tag++) {
    const s = spieler('eisen');
    s.rivalen.p1.getroffen = true;
    s.rivaleTagNr = () => tag;
    const lage = s.rivaleTreffen(1);
    if (lage.aktion !== 'stoss') continue;
    assert.deepEqual(lage.optionen, ['kampf', 'gehen']);
    assert.ok(lage.feige);
    return;
  }
  assert.fail('kein Stoß in 40 Tagen');
});
