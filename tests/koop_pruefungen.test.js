// Koop: die Seq-5- und Seq-4-Prüfungen laufen auch, wenn Spieler 2 sie ablegt (Simulation tools/sim/pfade_koop.mjs).
// Offen und bewusst gesperrt: Laternennacht (Laterne) und Schattensteuerung (Schlüssel) führt nur die Hauptfigur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runChecks } from '../tools/sim/pfade_koop.mjs';

const OFFEN = ['s4 laterne (Laternennacht)', 's4 schluessel (Schatten)'];

for (const p of [1, 2]) {
  test(`Prüfungen als Spieler ${p} im Koop`, () => {
    const res = runChecks(p);
    for (const [k, v] of Object.entries(res)) if (!(p === 2 && OFFEN.includes(k))) assert.equal(v, 'ok', `${k}: ${v}`);
  });
}
