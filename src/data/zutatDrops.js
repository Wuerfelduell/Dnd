// Hauptzutaten als seltene Monsterbeute (Seb, 2026-11-17): Jede Hauptzutat hat genau EIN Monster, das sie tragen kann.
//  - Kettlegate (Marsch, Katakomben, Pestgassen, Kraterwald): Sequenz 7, je ein normaler Gegner (und seine Elite) 8 % (Seb, vorher 3 %).
//  - Wexmoor: Sequenz 6 je eine Elite 8 %, Sequenz 5 je eine Elite 1 %.
// Andere Gegner dieser Gebiete verlieren ihre bisherigen Drops dieser Zutaten; Bosse (einmalig) behalten ihre.
// Formeln stehen ohnehin nie in der Beute-Anzeige (hiddenLoot in core/Loot.js).

export const KG_ZONES = ['marsch', 'katakomben', 'pestgassen', 'kraterwald'];

/** Zutat → [Gegner, Chance]. Kettlegate: Gegner samt `_elite`; Wexmoor: nur die genannte Elite. */
export const KG_SEQ7 = {
  sternglas: ['glaskraehe', 0.08], sternschlacke: ['kraterbrut', 0.08], spiegelquecksilber: ['splitterling', 0.08],
  seufzerstein: ['schaedelschwarm', 0.08], puppenglas: ['schnabelmaske', 0.08], schwarzbernstein: ['schlammegel', 0.08],
  nachtfalterstaub: ['kerzenfresser', 0.08], sq_zutat_waage_7: ['pestratte', 0.08], sq_zutat_moor_7: ['moorleiche', 0.08],
  sq_zutat_uhr_7: ['knochenwurm', 0.08],
};
export const WX_SEQ6 = {
  flammenkern: 'lichtbrut_elite', knotengarn: 'reetmann_elite', spiegelwachs: 'ratsherr_elite', glockenerz: 'bojenglocke_elite',
  salamanderoel: 'grubenlicht_elite', ambossstaub: 'pfahlbohrer_elite', dietrichsilber: 'kellerkrebs_elite',
  sq_zutat_waage_6: 'namensmade_elite', sq_zutat_moor_6: 'torfgaenger_elite', sq_zutat_uhr_6: 'schlickaal_elite',
};
export const WX_SEQ5 = {
  lichtperle: 'linsensplitter_elite', spindelknochen: 'weisslicht_elite', schminkasche: 'glasmoewe_elite', atemglas: 'salzgeist_elite',
  goldschimmel: 'torfwurm_elite', schwertsplitter: 'schlickhund_elite', schattenseide: 'nebelfischer_elite',
  sq_zutat_waage_5: 'ratsherr_elite', sq_zutat_moor_5: 'torfleiche_elite', sq_zutat_uhr_5: 'kellerkrebs_elite',
};
export const WX_CHANCE = { 6: 0.08, 5: 0.01 };

export function applyZutatDrops(content) {
  const want = new Map(); // Gegner → [{item, chance}]
  const put = (enc, item, chance) => { if (content.encounters[enc] && content.items[item]) want.set(enc, [...(want.get(enc) ?? []), { item, chance }]); };
  for (const [item, [enc, ch]] of Object.entries(KG_SEQ7)) { put(enc, item, ch); put(`${enc}_elite`, item, ch); }
  for (const [item, enc] of Object.entries(WX_SEQ6)) put(enc, item, WX_CHANCE[6]);
  for (const [item, enc] of Object.entries(WX_SEQ5)) put(enc, item, WX_CHANCE[5]);
  const kg = new Set(Object.keys(KG_SEQ7));
  const wx = new Set([...Object.keys(WX_SEQ6), ...Object.keys(WX_SEQ5)]);
  for (const [id, e] of Object.entries(content.encounters)) {
    const zone = String(e.zone ?? '');
    const scope = KG_ZONES.includes(zone) ? kg : zone.startsWith('wx_') ? wx : null;
    if (!scope) continue;
    const table = content.loot[id];
    if (!table && !want.has(id)) continue;
    const boss = e.boss && !e.elite;
    const drops = (table?.drops ?? []).filter((d) => boss || !scope.has(d.item));
    for (const d of want.get(id) ?? []) if (!drops.some((x) => x.item === d.item)) drops.push(d);
    content.loot[id] = { ...(table ?? {}), drops };
  }
  return content;
}
