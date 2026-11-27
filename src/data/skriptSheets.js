/**
 * Skript-Grafik Runde 9 (tools/art/claude_code/themen_varianten.py): Gegner, die das Kampfbild eines anderen liehen,
 * bekommen eine eigene Fassung <basis>__<begegnung>. Begegnung -> Kampfblatt. Registriert in world/assets.js (THEMEN_VARIANTEN).
 */
export const SKRIPT_SHEETS = {
  reise_irrlicht: 'enemy_spiegelschatten__reise_irrlicht',
  kg_schlotgeist: 'enemy_spiegelschatten__kg_schlotgeist',
  kg_kanalrettung: 'enemy_spiegelschatten__kg_kanalrettung',
  ph_ds_grundwasser: 'enemy_unterschicht__ph_ds_grundwasser',
  ds_gb_tiefenvorarbeiter: 'enemy_unterschicht__ds_gb_tiefenvorarbeiter',
  k6_schaffner2: 'enemy_bn_schaffner_ohne_zug__k6_schaffner2',
  sg_glutschaffner: 'enemy_bn_schaffner_ohne_zug__sg_glutschaffner',
  hkr_dunscar_boss: 'enemy_bn_schaffner_ohne_zug__hkr_dunscar_boss',
  za_brask_elite: 'enemy_k3p_gangaufseher__za_brask_elite',
  za_stieg_elite: 'enemy_k3p_gangaufseher__za_stieg_elite',
  za_kropp_elite: 'enemy_k3p_gangaufseher__za_kropp_elite',
  za_fehr_elite: 'enemy_k3p_gangaufseher__za_fehr_elite',
  fs_boxer_1: 'enemy_holt__fs_boxer_1',
  reise_ratten: 'enemy_aktenfresser__reise_ratten',
  kg_rattenschwarm: 'enemy_aktenfresser__kg_rattenschwarm',
  reise_kultist: 'enemy_chorfanatiker__reise_kultist',
  hkr_kettlegate_boss: 'enemy_chorfanatiker__hkr_kettlegate_boss',
  hs_starling: 'enemy_starling2__hs_starling',
  ph_ertrunkener_1: 'enemy_nebelfischer__ph_ertrunkener_1',
  ph_ertrunkener_2: 'enemy_nebelfischer__ph_ertrunkener_2',
  ph_ertrunkener_3: 'enemy_nebelfischer__ph_ertrunkener_3',
  ph_ds_prellbock: 'enemy_vorhauer__ph_ds_prellbock',
  ph_ds_bruchfaden: 'enemy_vorhauer__ph_ds_bruchfaden',
  ds_gb_bruchmeister: 'enemy_vorhauer__ds_gb_bruchmeister',
  sg_aschenkraehe: 'enemy_signalkraehe__sg_aschenkraehe',
  sg_aschenkraehe_elite: 'enemy_signalkraehe__sg_aschenkraehe_elite',
  za_salzkraehe_elite: 'enemy_signalkraehe__za_salzkraehe_elite',
  sg_glutstaub: 'enemy_kalkstaubgeist__sg_glutstaub',
  sg_glutstaub_elite: 'enemy_kalkstaubgeist__sg_glutstaub_elite',
  za_kalkfresser_elite: 'enemy_kalkstaubgeist__za_kalkfresser_elite',
  reise_nebelhund: 'enemy_nebelhund__reise_nebelhund',
  reise_strassenraeuber: 'enemy_silas__reise_strassenraeuber',
  hkr_wexmoor_trupp: 'enemy_k3p_lampengutachter__hkr_wexmoor_trupp',
  k4s_erntehelfer: 'enemy_vg_cw_rohrpostwespe__k4s_erntehelfer',
  cwx_cw_roehrenhof_waechter: 'enemy_vg_cw_rohrpostwespe__cwx_cw_roehrenhof_waechter',
  ph_leuchtfeuer_elite: 'enemy_leuchtfeuer__ph_leuchtfeuer_elite',
  hkr_wexmoor_boss: 'enemy_leuchtfeuer__hkr_wexmoor_boss',
  ph_ds_kalklicht: 'enemy_schwellenhund__ph_ds_kalklicht',
  ds_gb_weichenfresser: 'enemy_schwellenhund__ds_gb_weichenfresser',
  ph_ds_vielrufer: 'enemy_vielrufer__ph_ds_vielrufer',
  ds_gb_schluchtrufer: 'enemy_vielrufer__ds_gb_schluchtrufer',
  sg_schlackenlaeufer: 'enemy_schichtgaenger__sg_schlackenlaeufer',
  sg_schlackenlaeufer_elite: 'enemy_schichtgaenger__sg_schlackenlaeufer_elite',
  sg_ofenpanzer: 'enemy_geruestklang__sg_ofenpanzer',
  za_gerueststimme_elite: 'enemy_geruestklang__za_gerueststimme_elite',
  sg_kesselbrecher: 'enemy_nachhall__sg_kesselbrecher',
  za_stellwerksecho_elite: 'enemy_nachhall__za_stellwerksecho_elite',
  hs2_starling: 'enemy_starling2__hs_starling',
};

/** Setzt die eigenen Blätter (ganz zuletzt, nach allen Umbauten der Begegnungen). */
export function applySkriptSheets(content) {
  for (const [id, sheet] of Object.entries(SKRIPT_SHEETS)) {
    const e = content.encounters[id];
    if (e) content.encounters[id] = { ...e, sheet };
  }
}
