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

test('Bündnis: Tratsch, gemeinsame Jagd 1× am Tag, Wache halbiert Ritualkosten, Verrat wenn zu weit hinten', () => {
  const s = spieler('laterne', 6);
  const r = s.rivalen.p1;
  r.status = 'verbuendet';
  r.getroffen = true;
  let kampf = null;
  s.startCombat = (id) => { kampf = id; };
  const lage = s.rivaleTreffen(1);
  assert.ok(lage.optionen.includes('jagd'));
  assert.match(lage.text, /beugt sich|grinst/);
  assert.ok(s.rivaleJagd(1));
  assert.equal(kampf, `rivale_jagd_${r.seq}`);
  assert.ok(content.encounters[kampf].rivale_jagd);
  assert.equal(s.rivaleJagd(1), null, 'nur einmal am Tag');
  assert.match(s.rivaleKampfEnde({ outcome: 'won', enc: content.encounters[kampf] }), /Beute/);
  assert.ok(s.rivaleWache(1));
  // Verrat: Rivale eine Sequenz voraus, viele Tage
  r.seq = 5;
  let tag = s.rivaleTagNr();
  s.rivaleTagNr = () => tag;
  for (let i = 0; i < 60 && r.status === 'verbuendet'; i++) { tag++; r.seq = 5; s.rivaleDaten(1); }
  assert.equal(r.status, 'rivale');
  assert.equal(r.siege, 0);
  r.treff_tag = -1;
  assert.match(s.rivaleTreffen(1).text, /Bündnis ist vorbei/);
});

test('gemeinsame Jagd: Gegner je Sequenz', () => {
  for (let q = 9; q >= 1; q--) assert.ok(content.encounters[`rivale_jagd_${q}`]?.beyonder, `jagd ${q}`);
});

test('Eskalation ab Seq 4: Gefolge, mythische Gestalt, Hass mit verdorbenem Ritual', () => {
  const e4 = content.encounters.rivale_eisen_4;
  assert.equal(e4.begleiter.length, 1);
  assert.equal(content.encounters.rivale_eisen_3.begleiter.length, 2);
  assert.ok(!content.encounters.rivale_eisen_5.begleiter);
  assert.ok(e4.phase2.attacks.length && /mythische Gestalt/.test(e4.phase2.meldung));
  assert.ok(content.encounters.rivale_gefolge_4);
  const s = spieler('eisen', 4);
  const r = s.rivalen.p1;
  r.seq = 4; r.siege = 2; r.niederlagen = 1;
  assert.ok(s.rivaleHass(r));
  r.kreis_kampf = s.rivaleTagNr();
  const u = s.unruhe;
  const t = s.rivaleKampfEnde({ outcome: 'lost', enc: content.encounters[`rivale_eisen_${r.seq}`] });
  assert.match(t, /verdorben/);
  assert.ok(s.unruhe > u);
});
