// Schreibt die englischen Texte aus src/data/dunscarStimmen.js nach src/i18n/en/kapitel3_stimmen.json.
// Zahlen werden wie im Wörterbuch zu {0}, {1} … (core/I18n.js).
import { writeFileSync } from 'node:fs';
import { DUNSCAR_STIMMEN_EN } from '../src/data/dunscarStimmen.js';
import { DS_ORTSKUNDIGE } from '../src/data/dunscarOrtskundige.js';
import { DS_ORTSKUNDIGE_EN } from '../src/data/dunscarOrtskundigeEn.js';

const NUM = /\d+(?:[.,]\d+)*/g;
const ph = (s) => { let i = 0; return s.replace(NUM, () => `{${i++}}`); };
const ROLLEN = { Gepäckträgerin: 'Porter', Weichenwärter: 'Switchman', Wäscherin: 'Washerwoman', Marktruferin: 'Market crier', Steinbrecher: 'Quarryman', Signalgehilfe: 'Signal assistant' };
const ORTE = { endbahnhof: 'at the terminus', schwellenring: 'at the Sleeper Ring', arbeiterbogen: 'in the Workers’ Arch', kalkmarkt: 'at the Lime Market', bruchstufen: 'at the Quarry Steps', signalhang: 'on the Signal Slope' };

/** Ortskundige: deutscher Knotentext → Englisch je Karte/Knoten, dazu Name und Rolle. */
function ortskundigePaare() {
  const out = {};
  for (const [map, o] of Object.entries(DS_ORTSKUNDIGE)) {
    const en = DS_ORTSKUNDIGE_EN[map];
    if (!en) continue;
    const nodes = o.dialog.nodes;
    out[nodes.start.text] = en.gruss;
    for (const k of ['viertel', 'wege', 'gefahr', 'gerede', 'gerede2', 'gott', 'wechsel']) if (nodes[k] && en[k]) out[nodes[k].text] = en[k];
    if (o.tafel && en.tafel) out[o.tafel] = en.tafel;
    const [titel, ...rest] = o.name.split(' ');
    if (ROLLEN[titel]) out[o.name] = `${ROLLEN[titel]} ${rest.join(' ')}`;
    const ort = map.replace(/^ds_/, '');
    out[o.role] = `Local guide ${ORTE[ort]}`;
  }
  return out;
}

export function stimmenDict() {
  const paare = { ...ortskundigePaare(), ...DUNSCAR_STIMMEN_EN };
  return Object.fromEntries(Object.entries(paare).map(([de, en]) => [ph(de), ph(en)]));
}
if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL('../src/i18n/en/kapitel3_stimmen.json', import.meta.url), `${JSON.stringify(stimmenDict(), null, 2)}\n`);
  console.log('kapitel3_stimmen.json:', Object.keys(stimmenDict()).length, 'Einträge');
}
