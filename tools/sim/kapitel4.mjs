// Kapitel 4 (Calderwick-Geschichte): Siegquoten je Pfad für Seq 4 und Seq 3 gegen die neuen Gegner.
// WAFFE=vi_waffe_bleihammer node tools/sim/kapitel4.mjs [encounter] [seeds]
process.env.WAFFE ??= 'vi_waffe_bleihammer';
const { held, play } = await import('./zugwaechter.mjs');
const { loadContent, SKILLED, EXPERT } = await import('../../tests/helpers.js');
const content = loadContent();
const ENCS = process.argv[2] ? [process.argv[2]] : ['k4s_erntehelfer', 'k4s_kg_aschmann', 'k4s_wetherby'];
const SEEDS = Array.from({ length: Number(process.argv[3] ?? 8) }, (_, i) => i + 1);
const rate = (enc, pid, seq, def) => { const r = SEEDS.map((x) => play(held(pid, seq, 60), enc, x, def)); return `${Math.round(100 * r.filter((x) => x.won).length / r.length)}%`; };
for (const enc of ENCS) {
  console.log(`\n${enc} (${content.encounters[enc].hp} Leben) | S4 geübt | S4 Experte | S3 geübt | S3 Experte`);
  for (const pid of Object.keys(content.pathways)) console.log([pid, rate(enc, pid, 4, SKILLED), rate(enc, pid, 4, EXPERT), rate(enc, pid, 3, SKILLED), rate(enc, pid, 3, EXPERT)].join(' | '));
}
