// Seq-1-Beyonder (data/seq1Beyonder.js): schreibt src/i18n/en/seq1_beyonder.json aus den DE/EN-Paaren der Daten.
// node tools/i18n-seq1-beyonder.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { loadContent } from '../tests/helpers.js';
import { SEQ1_BEYONDER, SEQ1_TEXTE, seq1Namen } from '../src/data/seq1Beyonder.js';

export function seq1Woerterbuch(content = loadContent()) {
  const dir = new URL('../src/i18n/en/', import.meta.url);
  const dict = {};
  for (const f of readdirSync(dir)) if (f !== 'seq1_beyonder.json') Object.assign(dict, JSON.parse(readFileSync(new URL(f, dir), 'utf8')));
  const out = {};
  for (const [k, v] of Object.entries(SEQ1_TEXTE)) {
    if (k === 'schlaege') for (const [de, en] of v) out[de] = en;
    else out[v[0]] = v[1];
  }
  for (const pid of Object.keys(SEQ1_BEYONDER)) {
    if (!content.pathways[pid]) continue;
    const b = SEQ1_BEYONDER[pid];
    out[b.gruss] = b.gruss_en;
    for (const [de, en] of Object.values(seq1Namen(content, pid, dict))) out[de] = en;
    const intro = content.encounters[`s1b_${pid}`].intro;
    out[intro] = `${b.gruss_en.split('\n\n')[0]}\n\n${SEQ1_TEXTE.intro[1]}`;
  }
  return out;
}

if (process.argv[1]?.endsWith('i18n-seq1-beyonder.mjs')) {
  writeFileSync(new URL('../src/i18n/en/seq1_beyonder.json', import.meta.url), `${JSON.stringify(seq1Woerterbuch(), null, 1)}\n`);
  console.log('src/i18n/en/seq1_beyonder.json geschrieben');
}
