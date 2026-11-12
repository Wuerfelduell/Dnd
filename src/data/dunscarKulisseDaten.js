/**
 * Dunscar-Kulisse je Karte (siehe dunscarKulisse.js). Bilder: Paket AV (props/ds_*.png → `dsp_<blatt>_<region>`,
 * Tilesets als 16er-Zellen → `dst_<blatt>`, Zellnummern laut manifest-dunscar1.json).
 * Viertel haben feste Kulissenplätze: oben y=4 bei x 4/18/25/40 (zwischen den Haustüren), unten y=20 bei x 3/11/33/40.
 * props: [sprite, x, y, { solid, light }] (x/y = Fußkachel), reihen: [sheet, frame, y, x0?, x1?],
 * zellen: [sheet, frame, x, y], streu: [sheet, frames, anteil], lampen: [[x, y]].
 * Was auf einem Spielobjekt läge, lässt dunscarKulisse.js weg.
 */
const RAIL_H = 0; // ds_bahn: rail horizontal
const PRELL = 8; // ds_bahn: buffer stop
const MINE_H = 24; // ds_bruch: mine rail horizontal

/** Hauptstraßen je Tileset: gepflastert in der Stadt, Bretter im Bruch. */
export const DS_STRASSE = { ds_stadt: ['dst_stadt', 3], ds_bahn: ['dst_stadt', 3], ds_bruch: ['dst_bruch', 30] };

/** Laternen an Platz und Straßenenden, in jedem Viertel gleich. */
const LAMPEN = [[19, 13], [24, 13], [3, 9], [40, 9], [11, 12], [32, 12]];
const oben = (a, b, c, d) => [[a, 4, 4], [b, 18, 4], [c, 25, 4], [d, 40, 4]].filter(([s]) => s);
const unten = (a, b, c, d) => [[a, 3, 20], [b, 11, 20], [c, 33, 20], [d, 40, 20]].filter(([s]) => s);
const P = (list, opt = {}) => list.map(([s, x, y]) => [s, x, y, typeof opt === 'function' ? opt(s) : opt]);
const fest = { solid: true };
const gleis = (y) => [['dst_bahn', RAIL_H, y, 2, 40]];

export const DS_KULISSE = {
  ds_endbahnhof: {
    reihen: gleis(18), zellen: [['dst_bahn', PRELL, 41, 18]],
    props: P([...oben('dsp_endbahnhof_ticket_counter_with_iron_grille', 'dsp_endbahnhof_blank_timetable_board', 'dsp_endbahnhof_station_clock_without_numerals', 'dsp_endbahnhof_telegraph_desk'),
      ...unten('dsp_endbahnhof_waiting_bench', 'dsp_endbahnhof_luggage_trolley', 'dsp_endbahnhof_waiting_bench', 'dsp_endbahnhof_luggage_trolley')], fest),
    lampen: LAMPEN, streu: [['dst_bahn', [46, 47], 0.02]],
  },
  ds_schwellenring: {
    reihen: gleis(18), zellen: [['dst_bahn', PRELL, 41, 18]],
    props: P([...oben('dsp_schwellenring_water_crane', 'dsp_schwellenring_signal', 'dsp_schwellenring_mechanic_workbench', 'dsp_schwellenring_coal_heap'),
      ...unten('dsp_schwellenring_coal_heap', 'dsp_schwellenring_locomotive_wheel', 'dsp_schwellenring_signal', 'dsp_schwellenring_water_crane')], (s) => (/signal|wheel/.test(s) ? {} : fest)),
    lampen: LAMPEN, streu: [['dst_stadt', [5, 6], 0.02]],
  },
  ds_arbeiterbogen: {
    props: P([...oben('dsp_arbeiterbogen_washing_line', 'dsp_arbeiterbogen_stone_well', 'dsp_arbeiterbogen_washing_line', 'dsp_arbeiterbogen_windblown_picnic_table'),
      ...unten('dsp_arbeiterbogen_outdoor_dinner_table_one_empty_place', 'dsp_arbeiterbogen_washing_line', 'dsp_arbeiterbogen_windblown_picnic_table', 'dsp_arbeiterbogen_stone_well')], (s) => (/washing/.test(s) ? {} : fest)),
    lampen: LAMPEN, streu: [['dst_stadt', [5, 6], 0.02]],
  },
  ds_kalkmarkt: {
    props: P([...oben('dsp_kalkmarkt_flea_stall_memory_plaques', 'dsp_kalkmarkt_stonemason_workshop', 'dsp_kalkmarkt_blank_gravestone_round', 'dsp_kalkmarkt_blank_gravestone_cross'),
      ...unten('dsp_kalkmarkt_blank_gravestone_pointed', 'dsp_kalkmarkt_flea_stall_memory_plaques', 'dsp_kalkmarkt_blank_gravestone_square', 'dsp_kalkmarkt_stonemason_workshop')], (s) => (/gravestone/.test(s) ? {} : fest)),
    lampen: LAMPEN, streu: [['dst_stadt', [4], 0.008]],
  },
  ds_bruchstufen: {
    reihen: [['dst_bruch', MINE_H, 18, 2, 41]],
    props: P([...oben('dsp_bruchsignal_scaffold', 'dsp_bruchsignal_survey_theodolite', 'dsp_bruchsignal_scaffold', 'dsp_bruchsignal_survey_theodolite'),
      ...unten('dsp_bruchsignal_scaffold', 'dsp_bruchsignal_survey_theodolite', 'dsp_bruchsignal_scaffold', 'dsp_bruchsignal_scaffold')], (s) => (/scaffold/.test(s) ? fest : {})),
    lampen: LAMPEN, streu: [['dst_bruch', [4, 5], 0.025], ['dst_bruch', [6, 7], 0.01]],
  },
  ds_signalhang: {
    reihen: gleis(18), zellen: [['dst_bahn', PRELL, 41, 18]],
    props: P([...oben('dsp_bruchsignal_signal_cabin', 'dsp_bruchsignal_listening', 'dsp_schwellenring_signal', 'dsp_bruchsignal_listening'),
      ...unten('dsp_bruchsignal_listening', 'dsp_schwellenring_signal', 'dsp_bruchsignal_signal_cabin', 'dsp_bruchsignal_listening')], (s) => (/listening/.test(s) ? { solid: true, light: '#6fe0d0' } : /cabin/.test(s) ? fest : {})),
    lampen: LAMPEN, streu: [['dst_bahn', [46, 47], 0.02]],
  },
  ds_letzter_bahnsteig: {
    reihen: gleis(18), zellen: [['dst_bahn', PRELL, 41, 18]],
    props: P([...oben('dsp_endbahnhof_waiting_bench', 'dsp_endbahnhof_station_clock_without_numerals', 'dsp_endbahnhof_blank_timetable_board', 'dsp_endbahnhof_waiting_bench'),
      ...unten('dsp_endbahnhof_luggage_trolley', 'dsp_endbahnhof_waiting_bench', 'dsp_endbahnhof_waiting_bench', 'dsp_endbahnhof_luggage_trolley')], fest),
    lampen: LAMPEN, streu: [['dst_bahn', [46, 31], 0.02]],
  },
  // Gefahrengebiete behalten ihre Pfeilerreihen; Kulisse dort, wo kein Gegner oder Lager liegt
  ds_rangierwueste: {
    reihen: [['dst_bahn', RAIL_H, 4, 2, 44], ['dst_bahn', RAIL_H, 11, 2, 44], ['dst_bahn', RAIL_H, 18, 2, 44], ['dst_bahn', RAIL_H, 25, 2, 44]],
    zellen: [['dst_bahn', PRELL, 45, 4], ['dst_bahn', PRELL, 45, 11], ['dst_bahn', PRELL, 45, 18], ['dst_bahn', PRELL, 45, 25]],
    props: P([['dsp_schwellenring_signal', 13, 6], ['dsp_schwellenring_coal_heap', 30, 13], ['dsp_schwellenring_locomotive_wheel', 20, 20], ['dsp_schwellenring_water_crane', 42, 13],
      ['dsp_endbahnhof_luggage_trolley', 37, 27], ['dsp_schwellenring_signal', 25, 27]]),
    lampen: [[10, 13], [36, 6], [10, 20], [30, 20], [44, 27]],
    streu: [['dst_bahn', [46, 47, 31], 0.04]],
  },
  ds_klopfbruch: {
    reihen: [['dst_bruch', MINE_H, 5, 2, 45], ['dst_bruch', MINE_H, 13, 2, 45], ['dst_bruch', MINE_H, 21, 2, 45]],
    props: P([['dsp_bruchsignal_scaffold', 18, 7], ['dsp_bruchsignal_scaffold', 32, 7], ['dsp_bruchsignal_survey_theodolite', 44, 12], ['dsp_bruchsignal_scaffold', 8, 20], ['dsp_bruchsignal_scaffold', 30, 27]]),
    lampen: [[10, 11], [33, 19], [22, 27], [44, 4]],
    streu: [['dst_bruch', [4, 5, 31], 0.05], ['dst_bruch', [6, 7], 0.015]],
  },
  ds_rufschlucht: {
    zellen: [['dst_schlucht', 24, 23, 4], ['dst_schlucht', 25, 25, 9], ['dst_schlucht', 26, 23, 12], ['dst_schlucht', 27, 25, 19], ['dst_schlucht', 24, 23, 22], ['dst_schlucht', 26, 25, 25]],
    props: P([['dsp_bruchsignal_listening', 12, 4], ['dsp_bruchsignal_listening', 36, 4], ['dsp_bruchsignal_listening', 12, 16], ['dsp_bruchsignal_listening', 36, 16], ['dsp_bruchsignal_listening', 36, 27]], { light: '#6fe0d0' }),
    lampen: [[20, 8], [28, 20], [20, 26]],
  },
  ds_unterschicht: {
    reihen: [['dst_bruch', MINE_H, 4, 2, 45], ['dst_bruch', MINE_H, 11, 2, 45], ['dst_bruch', MINE_H, 18, 2, 45], ['dst_bruch', MINE_H, 25, 2, 45]],
    props: P([['dsp_bruchsignal_scaffold', 9, 13], ['dsp_bruchsignal_scaffold', 25, 13], ['dsp_bruchsignal_scaffold', 41, 20], ['dsp_bruchsignal_survey_theodolite', 13, 27]]),
    lampen: [[12, 6], [37, 6], [24, 20], [44, 27]],
    streu: [['dst_bruch', [4, 5, 31], 0.05], ['dst_bruch', [6, 7], 0.02]],
  },
};
