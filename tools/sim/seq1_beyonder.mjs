// Seq-1-Beyonder in Briarholt (Seb 2026-11-26): zwei Engel (Seq 2) im Koop dürfen NICHT gewinnen, zwei Seq-1 sollen es können.
// WAFFE=… node tools/sim/seq1_beyonder.mjs [pfad|alle] [seeds]  → je Gegner: beste Seq-2-Paarung und Quote zweier Seq-1
const { duo, play } = await import('./zugwaechter.mjs');
const { loadContent, EXPERT } = await import('../../tests/helpers.js');
const content = loadContent();
const PIDS = Object.keys(content.pathways);
const ONLY = process.argv[2] && process.argv[2] !== 'alle' ? [process.argv[2]] : PIDS;
const SEEDS = Array.from({ length: Number(process.argv[3] ?? 3) }, (_, i) => i + 1);
// Gezählt wird jeder Sieg, auch wenn einer der beiden am Boden liegt (strenger als zugwaechter.mjs)
const rate = (enc, a, b, seq) => SEEDS.filter((x) => play(duo(a, seq, b, seq, 100), enc, x, EXPERT).left <= 0).length / SEEDS.length;
for (const pid of ONLY) {
  const enc = `s1b_${pid}`;
  let best2 = 0; let best1 = 0; let pair1 = '';
  for (let i = 0; i < PIDS.length; i++) for (let j = i; j < PIDS.length; j++) {
    best2 = Math.max(best2, rate(enc, PIDS[i], PIDS[j], 2));
    const r1 = rate(enc, PIDS[i], PIDS[j], 1);
    if (r1 > best1) { best1 = r1; pair1 = `${PIDS[i]}+${PIDS[j]}`; }
  }
  console.log(`${enc}: Seq2-Duo bestes ${Math.round(best2 * 100)}% | Seq1-Duo bestes ${Math.round(best1 * 100)}% (${pair1})`);
}
