/**
 * Ausstattung der vier Dunscar-Zirkelräume (Seb 2026-11-26: „geheime Zirkelräume schöner, vor allem die kleinen Räume“).
 * Jeder Zirkel bekommt das Tileset und die Möbel seines Kettlegater Gegenstücks (Paket O / Wexmoor-Salz)
 * plus Dunscar-Stücke (AV-Innenmöbel, BW-Innenräume). Raster 24x14 wie bisher: Wand Reihe 0–1 und 13,
 * Sitzplätze siehe SEATS in dunscarZirkel.js, Ankunft [3,11], Ausgang [3,12], Flickerin [20,11].
 */

/** Möbel mit Fuß auf der Kachel (half: um eine halbe Kachel nach rechts, für 2 Kacheln breite Stücke). */
const M = (sprite, x, y, opt = {}) => ({ sprite, tile: [x, y], offset: [opt.half ? 8 : 0, opt.dy ?? 8], origin: [0.5, 1], alpha: opt.alpha ?? 1,
  ...(opt.depth ? { depth: opt.depth } : { ysort: true }), ...(opt.solid ? { solid: opt.solid } : {}), ...(opt.light ? { light: opt.light } : {}),
  ...(opt.flip ? { flip: true } : {}) });
/** Bild an der Wand (hinter allem). */
const WAND = (sprite, x, y = 1, opt = {}) => M(sprite, x, y, { ...opt, depth: 40 });
/** Stück auf einem Tisch, dessen Fuß in Reihe ty liegt. */
const AUF = (sprite, x, ty, dy = -3) => M(sprite, x, ty, { dy, depth: 100 + ty * 16 + 17 });
/** Bodenzeichen (Kreide, Ruß, Salzspuren). */
const BODEN = (sprite, x, y, alpha = 0.8) => ({ sprite, tile: [x, y], alpha, depth: 40 });
const KLEIN = [10, 6, 0, -3];
const BREIT = [28, 8, 0, -4];
const TISCH = [44, 8, 0, -4];
const licht = (color, radius = 40, intensity = 0.7, dy = -8) => ({ dy, radius, intensity, color, flicker: 0.25, glow: 0.25 });

const rows = (wall, floor, { top = '', exit = true } = {}) => Array.from({ length: 14 }, (_, y) => {
  if (y <= 1) return wall.repeat(24);
  if (y === 13) return exit ? `${wall.repeat(3)}EE${wall.repeat(19)}` : wall.repeat(24);
  if (y === 2 && top) return `${wall}${top}${wall}`;
  return `${wall}${floor.repeat(22)}${wall}`;
});

const KERZE = '#e0b070';
const OFEN = '#ff8a4a';
const KREIDE = '#e8c080';
const SALZ = '#e0d8b0';

export const ZIRKEL_RAEUME = {
  // Die Stille Waage unter dem Runddepot: Gewölbe mit Vorhang, Waage auf dem Tisch, Kerzen, Lohntüten und eine Uhr ohne Zahlen
  schichtbund: {
    tiles: 'o_waage',
    rows: rows('|', 's', { exit: false }),
    ambient: { night: 0.86, fog: 0.12 },
    lights: [{ tile: [12, 5], radius: 80, intensity: 0.75, color: KERZE, glow: 0.3, flicker: 0.2 }],
    decor: [
      BODEN('circle', 12, 7, 0.35),
      WAND('o_waage_props_curtain', 12),
      M('dsp_endbahnhof_station_clock_without_numerals', 9, 2, { dy: 4, depth: 41 }),
      WAND('dspi_lohnbuero_wage_envelope_shelf', 17),
      M('o_waage_props_cabinet', 3, 2, { half: true, solid: [28, 10] }),
      M('o_waage_props_cabinet', 20, 2, { half: true, solid: [28, 10] }),
      M('i2_pendeluhr', 22, 4, { solid: KLEIN }),
      M('o_waage_props_table', 12, 6, { solid: TISCH }),
      AUF('o_waage_props_weights', 11, 6),
      AUF('o_waage_props_scale', 13, 6, -1),
      M('o_waage_props_bench', 10, 11, { half: true, solid: [28, 6] }),
      M('o_waage_props_bench', 13, 11, { half: true, solid: [28, 6] }),
      M('dspi_lohnbuero_filing_cabinets', 2, 4, { solid: BREIT }),
      M('i2_laden_waage', 22, 12, { solid: KLEIN }),
      ...[[6, 2], [18, 2], [2, 8], [22, 8], [6, 12]].map(([x, y]) => M('o_waage_props_candles', x, y, { solid: KLEIN, light: licht(KERZE, 38) })),
    ],
  },
  // Der Kreidezirkel im Stummen Stellwerk: Kreideboden, Regale, Lesepult, Fernschreiber und ein Horchtrichter
  stellwerk: {
    tiles: 'o_kreide',
    rows: rows('I', 'w', { top: 'BBBBB' + 'w'.repeat(12) + 'BBBBB' }),
    ambient: { night: 0.74, fog: 0.06 },
    lights: [{ tile: [12, 5], radius: 70, intensity: 0.6, color: KREIDE, glow: 0.25, flicker: 0.1 }],
    decor: [
      M('o_kreide_props_table', 11, 6, { half: true, solid: [28, 10] }),
      M('o_kreide_props_lamp', 11, 6, { half: true, dy: -4, depth: 213, light: licht(KREIDE, 44, 0.75, -4) }),
      M('o_kreide_props_chair_a', 10, 7),
      M('o_kreide_props_chair_c', 14, 7),
      M('o_kreide_props_lectern', 6, 3, { solid: KLEIN }),
      M('o_kreide_props_scroll_rack', 16, 3, { half: true, solid: BREIT }),
      M('dspi_pruefhaus_wax_cylinder_shelving', 9, 3, { solid: BREIT }),
      M('o_kreide_props_telescope', 21, 4, { solid: KLEIN }),
      M('i2_fernschreiber', 2, 5, { solid: KLEIN }),
      M('dspi_pruefhaus_acoustic_horn', 22, 9, { solid: BREIT, light: licht('#6fe0d0', 34, 0.5, -16) }),
      M('dspi_pruefhaus_brass_measuring_instrument', 2, 9, { solid: KLEIN }),
      M('o_kreide_props_chalk_box', 14, 10, { solid: KLEIN }),
      M('o_kreide_props_lamp', 19, 3, { dy: 2, light: licht(KREIDE, 36) }),
      ...[[9, 8], [17, 9], [6, 11], [12, 11], [19, 5]].map(([x, y]) => BODEN('o_kreide_props_dust', x, y, 0.75)),
    ],
  },
  // Die Rußgesellschaft im Kalten Ofen: Theke mit Kohlenwaage, Öfen, Kohlehaufen, Haken und Käfig
  kalkofen: {
    tiles: 'o_russ',
    rows: rows('I', 'w'),
    ambient: { night: 0.78, fog: 0.2 },
    lights: [{ tile: [12, 5], radius: 80, intensity: 0.75, color: OFEN, glow: 0.3, flicker: 0.3 }, { tile: [8, 10], radius: 60, intensity: 0.45, color: '#e09050', flicker: 0.2 }],
    decor: [
      M('o_russ_props_counter', 12, 6, { solid: TISCH }),
      M('o_russ_props_coal_scale', 15, 6, { solid: KLEIN }),
      M('o_russ_props_stove', 3, 3, { solid: [10, 8], light: licht(OFEN, 54, 0.85) }),
      M('dspi_speisewagen_stove', 21, 3, { solid: BREIT, light: licht(OFEN, 60, 0.8, -18) }),
      M('dsp_schwellenring_coal_heap', 7, 3, { solid: [40, 8, 0, -4] }),
      M('i2_kessel', 17, 3, { solid: KLEIN }),
      WAND('o_russ_props_lantern', 5, 1, { light: licht('#e09050', 40, 0.6, 0) }),
      WAND('o_russ_props_lantern', 15, 1, { light: licht('#e09050', 40, 0.6, 0) }),
      WAND('o_russ_props_hooks', 11, 1),
      M('o_russ_props_cage', 21, 8, { half: true, solid: [28, 10] }),
      M('o_russ_props_coal_cart', 10, 12, { half: true, solid: [28, 6] }),
      M('i2_laden_regal_flaschen', 22, 12, { solid: BREIT }),
      M('o_russ_props_stool', 10, 8),
      M('o_russ_props_stool', 14, 9),
      M('o_russ_props_stool', 6, 9),
    ],
  },
  // Die Salzbrüder im alten Streusalzspeicher: Salzberge, Säcke, Kassenbuch, Banner der Brüder
  salzds: {
    tiles: 's_salz',
    rows: rows('I', 'w'),
    ambient: { night: 0.8, fog: 0.14 },
    lights: [{ tile: [12, 5], radius: 70, intensity: 0.65, color: SALZ, glow: 0.25, flicker: 0.25 }],
    decor: [
      M('s_salz_props_table', 12, 6, { solid: [44, 6, 0, -2] }),
      AUF('s_salz_props_ledger', 11, 6, -2),
      WAND('s_salz_props_banner', 5, 2),
      WAND('s_salz_props_banner', 19, 2),
      M('s_salz_props_salt_a', 3, 4, { solid: [28, 10, 0, -4] }),
      M('s_salz_props_salt_b', 21, 4, { solid: [28, 10, 0, -4] }),
      M('s_salz_props_sacks', 2, 8, { solid: [12, 6, 0, -2] }),
      M('s_salz_props_sacks', 22, 8, { solid: [12, 6, 0, -2] }),
      M('s_salz_props_sacks', 14, 12, { solid: [12, 6, 0, -2] }),
      M('s_salz_props_fish_barrel', 10, 12, { solid: [12, 6, 0, -2] }),
      M('dsp_endbahnhof_luggage_trolley', 22, 12, { solid: BREIT }),
      M('s_salz_props_fish_barrel', 7, 12, { solid: [12, 6, 0, -2] }),
      M('s_salz_props_lantern', 8, 2, { light: licht(SALZ, 44) }),
      M('s_salz_props_lantern', 9, 4, { light: licht(SALZ, 44) }),
      M('dspi_lohnbuero_standing_writing_desk', 16, 4, { solid: BREIT }),
    ],
  },
};
