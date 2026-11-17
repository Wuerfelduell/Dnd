// Seb 2026-11-17: Neue Kampffertigkeiten von Maske und Moor müssen sich mit jeder Sequenz spürbar stärker anfühlen.
// Erwartungswert je Fertigkeit: Präzise Fertigkeiten treffen meist nur „good“ (0,45), daher müssen sie nominell deutlich höher liegen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { isPrecise } from '../src/core/Combat.js';

const content = loadContent();
const ATK = 10; // Waffenwert fest, damit Grund- und Waffenschaden vergleichbar bleiben
function ev(sk) {
  const per = sk.flat ?? (sk.mult ?? 0) * ATK;
  const grade = isPrecise(sk) ? (1.3 + 5 * 0.45) / 6 : (1.3 + 2 * 1) / 3; // wie SKILLED_HIT: jeder 6. bzw. 3. Takt perfekt
  return (sk.hits ?? 0) * per * grade;
}

for (const pid of ['maske', 'sq_moor']) {
  test(`${pid}: jede neue Sequenz bringt mehr Schaden als die vorige (Seq 6 bis 1)`, () => {
    const seqs = content.pathways[pid].seqs;
    for (let q = 6; q >= 1; q--) {
      for (const k of ['skill', 'skill2']) {
        const prev = ev(seqs[q + 1][k]);
        const cur = ev(seqs[q][k]);
        if (prev > 0 && cur > 0) assert.ok(cur > prev, `${pid} Seq ${q} ${k} ${seqs[q][k].id}: ${cur.toFixed(1)} <= ${prev.toFixed(1)}`);
      }
      // reine Stütz-Fertigkeiten (ohne Treffer) zählen nur über die beste Fertigkeit der Sequenz
      const prevBest = Math.max(ev(seqs[q + 1].skill), ev(seqs[q + 1].skill2));
      assert.ok(Math.max(ev(seqs[q].skill), ev(seqs[q].skill2)) > prevBest, `${pid} Seq ${q}: beste Fertigkeit nicht stärker`);
    }
  });
}
