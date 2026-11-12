// Codex-Runde 9 (CP Halbgott-Texte, CR Fasserin-Auftragstexte): aus den gelieferten JSON-Dateien (docs/story/<pack>/,
// Kopien in packs/<pack>/) werden zwei Pakete für buildContent. Die Grafik (CO, CQ) hängt in world/assets.js.

/** Die 20 festen Aufträge: Beutestück → fa_<stueck>, Chance und Lohn nach der CR-Balancetabelle (Rückgabe = halber Lohn). */
export const FA_AUFTRAEGE = [
  ['rattenkrone', 0.70, 120], ['sternhirschgeweih', 0.55, 180], ['geweihreif', 0.50, 200], ['geisterkern', 0.60, 160], ['glasfeder', 0.75, 100],
  ['wachsherz', 0.65, 140], ['moorperle', 0.80, 80], ['schlickperle', 0.80, 80], ['brutschale', 0.60, 160], ['moewenglas', 0.75, 100],
  ['irrlichtfunke', 0.70, 120], ['schaedelsplitter', 0.65, 140], ['ratssiegel', 0.45, 210], ['medaille_polizei', 0.55, 180], ['fernrohr_messing', 0.50, 200],
  ['bronzeglocke_klein', 0.60, 160], ['spinnfaden_lila', 0.40, 220], ['linsenscherbe', 0.45, 210], ['madenwachs', 0.70, 120], ['russklumpen', 0.65, 140],
];
/**
 * Wirkung und kleiner Haken je Artefakt, mit den Passiv-Schlüsseln, die das Spiel kennt (Pathways.passive). CR liefert nur
 * Prosa; wo das Spiel keinen passenden Schalter hat, steht der nächstliegende (z. B. Erstschlag → eine Konzentration mehr zu Beginn).
 */
const FA_WIRKUNG = {
  rattenkrone: [{ key: 'always_flee', value: true }, { key: 'unruhe_tick', value: 0.05 }],
  sternhirschgeweih: [{ key: 'vision_cost', value: 0.8 }, { key: 'dodge_cost', value: 1 }],
  geweihreif: [{ key: 'damage_taken', value: 0.92 }, { key: 'dodge_window', value: 0.9 }],
  geisterkern: [{ key: 'damage_taken', value: 0.9 }, { key: 'unruhe_tick', value: 0.1 }],
  glasfeder: [{ key: 'ap_start', value: 1 }, { key: 'dmg_mult', value: 0.95 }],
  wachsherz: [{ key: 'round_nerves', value: 1 }, { key: 'ap_max', value: -1 }],
  moorperle: [{ key: 'composure_regen', value: 1.1 }, { key: 'unruhe_tick', value: 0.05 }],
  schlickperle: [{ key: 'money_bonus', value: 1.1 }, { key: 'composure_regen', value: 0.9 }],
  brutschale: [{ key: 'atk', value: 2 }, { key: 'unruhe_tick', value: 0.1 }],
  moewenglas: [{ key: 'price', value: 0.9 }, { key: 'unruhe_tick', value: 0.05 }],
  irrlichtfunke: [{ key: 'vision_cost', value: 0.85 }, { key: 'enemy_ramp', value: 0.01 }],
  schaedelsplitter: [{ key: 'occult_mult', value: 1.15 }, { key: 'ap_max', value: -1 }],
  ratssiegel: [{ key: 'lock_bonus', value: 2 }, { key: 'unruhe_tick', value: 0.1 }],
  medaille_polizei: [{ key: 'honor_loss', value: 0.9 }, { key: 'carry', value: -1 }],
  fernrohr_messing: [{ key: 'link_hints', value: true }, { key: 'unruhe_tick', value: 0.08 }],
  bronzeglocke_klein: [{ key: 'parry_nerves', value: 1 }, { key: 'skill_composure', value: 1.1 }],
  spinnfaden_lila: [{ key: 'skill_composure', value: 0.9 }, { key: 'unruhe_tick', value: 0.1 }],
  linsenscherbe: [{ key: 'conclusion_honor', value: 1 }, { key: 'unruhe_tick', value: 0.08 }],
  madenwachs: [{ key: 'max_hp', value: 10 }, { key: 'heal_bonus', value: 0.95 }],
  russklumpen: [{ key: 'composure_regen', value: 1.1 }, { key: 'price', value: 1.05 }],
};
/** Zirkel → Stadt der Treffen-Karte (für das Gerede „treffen_allgemein“ und die Lesestücke). */
export const FA_ZIRKEL_STADT = { waage: 'kettlegate', kreide: 'kettlegate', russ: 'kettlegate', lichtlose: 'wexmoor', salz: 'wexmoor', schichtbund: 'dunscar' };

/** Ein Lesestück als Platzierung neben dem Standard-Spawn einer Karte (Reichweite genügt, die Figur steht daneben). */
function lesePlatz(id, map, title, text, footer, requires = []) {
  return { map, spawn_offset: [1, 0], interactable: { id, kind: 'read', sprite: 'paper', prompt: `„${title}“ lesen`, title, text, footer, visible_if: requires.length ? { requires_flags: requires } : {} } };
}

/** CR: Fasserin-Aufträge (Rezepte fa_*, Artefakte mit Wirkung und Haken, Texte, Gerede, Zeitung, Lesestücke). */
export function fasserinAuftragPack(f) {
  const byId = Object.fromEntries(f.artefakte.map((a) => [a.id, a]));
  const rezepte = FA_AUFTRAEGE.map(([stueck, chance, fee]) => ({ id: `fa_${stueck}`, artifact: `fa_${stueck}`, needs: { [stueck]: 1 }, fee, chance, line: f.oda.pruefen?.[stueck] ?? '' }));
  const artefakte = Object.fromEntries(FA_AUFTRAEGE.map(([stueck, chance, fee]) => {
    const a = byId[`fa_${stueck}`];
    const [boon, curse] = FA_WIRKUNG[stueck];
    return [`fa_${stueck}`, { name: a.name, source: 'artisan', price: Math.round(120 + ((0.8 - chance) / 0.4) * 80), icon: `fa_${stueck}`, desc: a.beschreibung, untersuchen: a.untersuchen, oda: a.oda_zeile, beutestueck: stueck, chance,
      boons: [{ ...boon, text: a.wirkung_text }], curses: [{ ...curse, text: a.nachteil_text }] }];
  }));
  // Gerede: die Sondergruppe treffen_allgemein auf die sechs Treffen-Karten verteilen
  const gerede = {};
  for (const [city, perMap] of Object.entries(f.gerede)) {
    if (city === 'treffen_allgemein') continue;
    gerede[city] = { ...(gerede[city] ?? {}), ...perMap };
  }
  for (const [zirkel, city] of Object.entries(FA_ZIRKEL_STADT)) {
    const map = `treffen_${zirkel}`;
    gerede[city] = gerede[city] ?? {};
    gerede[city][map] = [...(gerede[city][map] ?? []), ...(f.gerede.treffen_allgemein?.allgemein ?? [])];
  }
  // Lesestücke: Odas Lehrbrief und die übrigen an vier Treffen-Tischen (Waage, Kreide, Lichtlose, Schichtbund)
  const leseMaps = ['treffen_waage', 'treffen_kreide', 'treffen_lichtlose', 'treffen_schichtbund'];
  const lesestuecke = f.lesestuecke.map((l, i) => lesePlatz(l.id, leseMaps[i % leseMaps.length], l.title, l.text, 'Aus Oda Kessels Papieren.', [leseMaps[i % leseMaps.length]]));
  return { name: 'fasserin_auftrag', rezepte, artefakte, fasserin_auftrag: { oda: f.oda, gastgeber: f.gastgeber, texte: f.texte }, gerede, zeitung: f.zeitung, lesestuecke };
}

/** CP: Halbgott und Engel (Kreaturformen, Trinktexte, Furcht, Rituale, Bestiarium, Zeitung, Gerede, Lesestücke). */
export function halbgottPack(h, { maps = new Set() } = {}) {
  const lesestuecke = h.lesestuecke.filter((l) => !maps.size || maps.has(l.map))
    .map((l) => lesePlatz(l.id, l.map, l.title, l.text, l.source, l.map.startsWith('treffen_') ? [l.map] : []));
  return {
    name: 'halbgott',
    halbgott: {
      kreaturform: Object.fromEntries(h.kreaturform.map((k) => [k.pfad, k])),
      trinktexte: Object.fromEntries(h.trinktexte.map((t) => [`${t.pfad}_${t.seq}`, t])),
      furcht: h.furcht,
      rituale: Object.fromEntries(h.rituale.map((r) => [r.id, r])),
      encounters: h.encounters,
      koop: h.koop,
    },
    bestiarium: h.bestiarium,
    zeitung: h.zeitung,
    gerede: h.gerede,
    lesestuecke,
  };
}

export const FASSERIN_AUFTRAG_FILES = ['oda', 'gastgeber', 'texte', 'artefakte', 'gerede', 'zeitung', 'lesestuecke'];
export const HALBGOTT_FILES = ['trinktexte', 'kreaturform', 'furcht', 'rituale', 'encounters', 'bestiarium', 'zeitung', 'gerede', 'lesestuecke', 'koop'];
