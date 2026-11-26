// Beyonder-Rest (Ersatz-Hauptzutat, Trank schlägt öfter fehl) und bleibende Macken (Seb 2026-11-26).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { KOPFGELD_BEYONDER } from '../src/data/gegnerBeyonder.js';
import { REST_CHANCE, REST_RISIKO, restId, restTrankId, hauptzutat } from '../src/data/beyonderRest.js';
import { MACKEN, MACKE_MAX, MACKE_NAH } from '../src/data/macken.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('jeder Kopfgeld-Beyonder trägt selten den Rest seines Pfades und seiner Sequenz, Ritualwächter nicht', () => {
  for (const [id, [pid, seq]] of Object.entries(KOPFGELD_BEYONDER)) {
    const d = content.loot[id].drops.find((x) => x.item === restId(pid, seq));
    assert.equal(d?.chance, REST_CHANCE[seq], id);
    assert.ok(d.chance <= 0.12, id);
  }
  for (const id of Object.keys(content.encounters).filter((k) => k.startsWith('hg_'))) {
    assert.ok(!(content.loot[id]?.drops ?? []).some((x) => content.items[x.item]?.rest), id);
  }
});

test('Rest und Rest-Trank gibt es für jeden Pfad und jede Sequenz', () => {
  for (const [pid, p] of Object.entries(content.pathways)) {
    for (const seq of Object.keys(p.seqs).map(Number)) {
      const r = content.items[restId(pid, seq)];
      assert.equal(r?.kind, 'ingredient', `${pid} ${seq}`);
      assert.equal(content.items[restTrankId(pid, seq)]?.kind, 'potion');
      assert.equal(content.items[restTrankId(pid, seq)].seq, seq);
    }
  }
});

test('Brauen: Rest ersetzt die Hauptzutat, echte Hauptzutat geht vor', () => {
  const s = new GameState(content);
  const f = content.items.formel_laterne_8;
  s.addItem('formel_laterne_8');
  for (const [id, n] of Object.entries(f.ingredients)) if (id !== hauptzutat(f)) s.addItem(id, n);
  assert.equal(s.brew('formel_laterne_8').ok, false);
  s.addItem(restId('laterne', 8));
  const r = s.brew('formel_laterne_8');
  assert.ok(r.ok && r.rest);
  assert.equal(s.itemCount(restTrankId('laterne', 8)), 1);
  assert.equal(s.itemCount(restId('laterne', 8)), 0);
  // mit echter Hauptzutat: normaler Trank, Rest bleibt
  for (const [id, n] of Object.entries(f.ingredients)) s.addItem(id, n);
  s.addItem(restId('laterne', 8));
  assert.ok(!s.brew('formel_laterne_8').rest);
  assert.equal(s.itemCount('trank_laterne_8'), 1);
  assert.equal(s.itemCount(restId('laterne', 8)), 1);
});

test('Trank aus Rest: gleiche Wirkung, höheres Risiko', () => {
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 9, digestion: 100 };
  s.unruhe = 0;
  s.addItem('trank_laterne_8');
  s.addItem(restTrankId('laterne', 8));
  const a = s.drinkCheck('trank_laterne_8').risk;
  const b = s.drinkCheck(restTrankId('laterne', 8)).risk;
  assert.ok(Math.abs(b - a - REST_RISIKO) < 1e-9);
  const r = s.drink(restTrankId('laterne', 8), () => 0.99);
  assert.ok(r.ok);
  assert.equal(s.pathway.seq, 8);
});

test('Macken: knapp vorbei → Macke des eigenen Pfades, wirkt, höchstens MACKE_MAX, Kontrollverlust zählt nicht', () => {
  const s = new GameState(content);
  s.pathway = { id: 'echo', seq: 7, digestion: 10 };
  s.rng = () => 0; // Wurf gelingt immer
  const calm = s.passive('calm_decay');
  s.setUnruhe(MACKE_NAH + 2);
  s.setUnruhe(30);
  assert.equal(s.mackenList().length, 1);
  assert.ok(MACKEN.echo.some((m) => m.id === s.macken.ids[0]));
  assert.ok(s.passive('calm_decay') < calm || s.passive('vision_cost') > 1);
  // Kontrollverlust: kein Vorbeischrammen
  s.setUnruhe(MACKE_NAH + 2);
  s.setUnruhe(100);
  s.setUnruhe(20);
  assert.equal(s.mackenList().length, 1);
  // zweite Macke, dann ist der Pfad erschöpft
  s.setUnruhe(95); s.setUnruhe(10);
  s.setUnruhe(95); s.setUnruhe(10);
  assert.equal(s.mackenList().length, 2);
  assert.ok(s.mackenList().length <= MACKE_MAX);
});

test('Macken: Spieler getrennt, Speichern und alte Stände', () => {
  const s = new GameState(content);
  s.pathway = { id: 'eisen', seq: 7, digestion: 10 };
  s.addP2();
  s.rng = () => 0;
  s.withPlayer(2, () => { s.pathway = { id: 'kessel', seq: 8, digestion: 0 }; s.setUnruhe(95); s.setUnruhe(10); });
  assert.equal(s.mackenList().length, 0);
  const p2 = s.withPlayer(2, () => s.mackenList().map((m) => m.id));
  assert.equal(p2.length, 1);
  assert.ok(p2[0].startsWith('kessel_'));
  const data = JSON.parse(JSON.stringify(s.serialize()));
  const t = new GameState(content);
  t.load(data);
  assert.deepEqual(t.withPlayer(2, () => t.mackenList().map((m) => m.id)), p2);
  delete data.macken; delete data.p2.macken;
  const u = new GameState(content);
  u.load(data);
  assert.equal(u.mackenList().length, 0);
  assert.equal(u.withPlayer(2, () => u.mackenList().length), 0);
});
