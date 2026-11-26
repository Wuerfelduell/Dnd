// Kopfgeld auf den Spieler: Kopfgeldjäger ab Dunscar, je Stadt höchstens einer pro Spieltag (Seb 2026-11-26).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { DAY_SECONDS } from '../src/core/Clock.js';
import { isBeyonderFoe } from '../src/core/Seq5.js';
import { KGJ_GRUPPEN, KGJ_AB_BEYONDERN, REST_CHANCE_JAEGER, kgjZonen } from '../src/data/kopfgeldjaeger.js';
import { restId } from '../src/data/beyonderRest.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const alle = Object.values(KGJ_GRUPPEN).flatMap((g) => g.jaeger.map((j) => [j[0], j[2], g.seq]));

test('jeder Jäger ist ein Beyonder im Boss-Rang mit Pfad-Fertigkeiten und gutem Rest', () => {
  for (const [id, pid, seq] of alle) {
    const e = content.encounters[id];
    assert.ok(e?.kopfgeldjaeger && e.boss, id);
    assert.ok(isBeyonderFoe(id, e), id);
    assert.equal(e.beyonder_pfad, pid);
    assert.ok(e.attacks.some((a) => a.pfad), id);
    assert.ok(e.chapter >= 3, id);
    const rest = content.loot[id].drops.find((d) => d.item === restId(pid, seq));
    assert.equal(rest?.chance, REST_CHANCE_JAEGER, id);
    assert.ok(content.loot[id].repeat, id);
  }
});

test('Jäger stehen in jedem Gefahrengebiet ihrer Stadt, Gebiete gibt es in jeder Gruppe', () => {
  for (const [gruppe, g] of Object.entries(KGJ_GRUPPEN)) {
    const zonen = kgjZonen(content, gruppe);
    assert.ok(zonen.length >= 3, gruppe);
    for (const z of zonen) for (const [id] of g.jaeger) assert.ok(content.maps[z].roamers.some((r) => r.kgj && r.encounter === id), `${z} ${id}`);
  }
});

test('ohne Kopfgeld kein Jäger; mit Kopfgeld genau einer je Stadt und Tag; nach dem Sieg erst am nächsten Tag', () => {
  const s = new GameState(content);
  const gruppe = 'dunscar';
  const zonen = kgjZonen(content, gruppe);
  const ids = KGJ_GRUPPEN[gruppe].jaeger.map((j) => j[0]);
  const zaehle = () => zonen.flatMap((z) => ids.filter((id) => s.kgjErscheint(id, z))).length;
  assert.equal(zaehle(), 0);
  const beyonder = Object.entries(content.encounters).filter(([id, e]) => !e.kopfgeldjaeger && isBeyonderFoe(id, e)).map(([id]) => id);
  beyonder.slice(0, KGJ_AB_BEYONDERN).forEach((id) => s.flags.add(`won_${id}`));
  assert.ok(s.kgjKopfgeld());
  s.playTime = 3 * DAY_SECONDS + 10;
  assert.equal(zaehle(), 1);
  const h = s.kgjHeute(gruppe);
  s.kgjSieg(h.id);
  assert.equal(zaehle(), 0);
  s.playTime += DAY_SECONDS;
  assert.equal(zaehle(), 1);
});
