/**
 * Zehn eigene Kampfblätter für Gegner, die bisher das Bild eines anderen Gegners trugen (tools/art/kampf_eigen/figuren.py,
 * manifest-kampf-eigen.json, Bilder docs/art/agent-kampf-eigen/). 48er-Zellen, 6x5 wie die Codex-Kampfblätter.
 * Gesucht über alle Begegnungen: gleiche Bilddatei bei verschiedenen Gegnern (nicht Elite/Phase/Pfadviertel-Spielart desselben Gegners).
 * Läuft zuletzt in buildContent, nach Kopfgeldjägern, Rivalen-Gefolge, Heimkehr und den Skript-Blättern, und setzt e.sheet.
 */
export const KAMPF_EIGEN = {
  enemy_ke_thorne: ['kgj_bh_thorne'], // bisher enemy_kgj_eisen wie Mara Harrow
  enemy_ke_dunmore: ['kgj_bh_dunmore'], // bisher enemy_kgj_maske wie Silas Quill
  enemy_ke_lerch: ['kgj_bh_lerch'], // bisher enemy_kgj_laterne wie Ilka Barlow
  enemy_ke_kopfgeldrotte: ['hkr_dunscar_trupp'], // bisher enemy_kgj_eisen
  enemy_ke_rostbrueder: ['hkr_kettlegate_trupp'], // bisher enemy_schlachtergehilfe wie Knox
  enemy_ke_gefolge: ['rivale_gefolge_1', 'rivale_gefolge_2', 'rivale_gefolge_3', 'rivale_gefolge_4'], // bisher hg_battle_kessel wie die Rivalen
  enemy_ke_grauer_schleier: ['schleier_schatten'], // bisher enemy_schleier_messerin wie Fräulein Grau
  enemy_ke_aschenweberin: ['sg_aschenweberin'], // bisher enemy_lohnlistenmotte
  enemy_ke_aussaatschwarm: ['bha_aussaat_schwarm'], // bisher das Blatt des Bosses Mutterwurzel
  enemy_ke_registerleib_rest: ['cwa_registerleib_rest'], // bisher das Blatt des Bosses Nullfundament
};

export function applyKampfEigen(content) {
  for (const [sheet, ids] of Object.entries(KAMPF_EIGEN)) {
    for (const id of ids) if (content.encounters?.[id]) content.encounters[id].sheet = sheet;
  }
}
