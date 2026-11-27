// Schreibt src/i18n/en/heimkehr.json aus den Textpaaren in src/data/heimkehr.js (plus feste Meldungen aus core). Aufruf: node tools/i18n-heimkehr.mjs
import { writeFileSync } from 'node:fs';
import { HEIMKEHR_EN } from '../src/data/heimkehr.js';

export const HEIMKEHR_EXTRA = {
  'Nachhall: Etwas in dir erinnert sich.': 'Echo: something within you remembers.',
  'Der Prüfstein schweigt. Ab der dritten Sequenz hat er dir nichts mehr zu geben.': 'The touchstone is silent. From the third Sequence on it has nothing left to give you.',
  'Spieler 2: Der Prüfstein schweigt. Ab der dritten Sequenz hat er dir nichts mehr zu geben.': 'Player 2: The touchstone is silent. From the third Sequence on it has nothing left to give you.',
  'Prüfstein im Pfadviertel bestanden (1× je Spieltag, nur Seq 4)': 'Touchstone in the pathway district passed (once per game day, Seq 4 only)',
  'Sieg im eigenen Pfadviertel (Seq 4; Herde, Rangprüfungen, Bosse beim ersten Mal mehr)': 'Victory in your own pathway district (Seq 4; hearths, rank trials and bosses give more the first time)',
  'Erster Sieg über einen Herd, eine Rangprüfung oder einen Boss im eigenen Pfadviertel': 'First victory over a hearth, a rank trial or a boss in your own pathway district',
  'Nachhall in Kettlegate, Wexmoor oder Dunscar gefunden (je Ort einmal, ab Seq 3)': 'Echo found in Kettlegate, Wexmoor or Dunscar (once per place, from Seq 3)',
};

export function heimkehrWoerterbuch() {
  return { ...HEIMKEHR_EN, ...HEIMKEHR_EXTRA };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL('../src/i18n/en/heimkehr.json', import.meta.url), `${JSON.stringify(heimkehrWoerterbuch(), null, 1)}\n`);
  console.log('heimkehr.json geschrieben');
}
