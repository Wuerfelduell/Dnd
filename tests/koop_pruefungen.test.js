// Koop: die Seq-5- und Seq-4-Prüfungen laufen auch, wenn Spieler 2 sie ablegt (Simulation tools/sim/pfade_koop.mjs).
// Seb (2026-11-13): Spieler 2 legt auch Laternennacht und Schatten selbst ab.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runChecks } from '../tools/sim/pfade_koop.mjs';

for (const p of [1, 2]) {
  test(`Prüfungen als Spieler ${p} im Koop`, () => {
    const res = runChecks(p);
    for (const [k, v] of Object.entries(res)) assert.equal(v, 'ok', `${k}: ${v}`);
  });
}
