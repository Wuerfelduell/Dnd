/**
 * Dunscar-Kulisse je Außenkarte (siehe dunscarKulisse.js). Bilder: Paket AV (props/ds_*.png → `dsp_<blatt>_<region>`,
 * Tilesets als 16er-Zellen → `dst_<blatt>`, Zellnummern laut manifest-dunscar1.json).
 * props: [sprite, x, y, { solid, light, anim }] (x/y = Fußkachel), reihen: [sheet, frame, y, x0?, x1?],
 * spalten: [sheet, frame, x, y0?, y1?], zellen: [sheet, frame, x, y], streu: [sheet, frames, anteil], lampen: [[x, y]].
 * Was auf einem Spielobjekt läge, lässt dunscarKulisse.js weg.
 */
const RAIL_H = 0; // ds_bahn: rail horizontal
const PRELL = 8; // ds_bahn: buffer stop
const MINE_H = 24; // ds_bruch: mine rail horizontal

export const DS_KULISSE = {
  ds_endbahnhof: {
    reihen: [['dst_bahn', RAIL_H, 8, 3, 40], ['dst_bahn', RAIL_H, 15, 3, 40], ['dst_bahn', 10, 14, 3, 40]],
    zellen: [['dst_bahn', PRELL, 2, 8], ['dst_bahn', PRELL, 2, 15]],
    props: [
      ['dsp_endbahnhof_ticket_counter_with_iron_grille', 15, 4, { solid: true, light: '#ffc782' }],
      ['dsp_endbahnhof_blank_timetable_board', 25, 4, { solid: true }],
      ['dsp_endbahnhof_station_clock_without_numerals', 35, 4, { solid: true }],
      ['dsp_endbahnhof_waiting_bench', 15, 13, { solid: true }],
      ['dsp_endbahnhof_waiting_bench', 25, 13, { solid: true }],
      ['dsp_endbahnhof_luggage_trolley', 36, 13, {}],
      ['dsp_endbahnhof_telegraph_desk', 38, 20, { solid: true, light: '#ffc782' }],
      ['dsp_endbahnhof_waiting_bench', 26, 20, { solid: true }],
    ],
    lampen: [[8, 11], [18, 7], [28, 11], [38, 7], [14, 18], [33, 18]],
    streu: [['dst_bahn', [46, 47, 31], 0.03]],
  },
  ds_schwellenring: {
    reihen: [['dst_bahn', RAIL_H, 11, 2, 34], ['dst_bahn', RAIL_H, 18, 2, 34]],
    zellen: [
      ['dst_bahn', 16, 37, 10], ['dst_bahn', 17, 38, 10], ['dst_bahn', 18, 39, 10], ['dst_bahn', 19, 40, 10],
      ['dst_bahn', 24, 37, 11], ['dst_bahn', 25, 38, 11], ['dst_bahn', 26, 39, 11], ['dst_bahn', 27, 40, 11],
      ['dst_bahn', 32, 37, 12], ['dst_bahn', 33, 38, 12], ['dst_bahn', 34, 39, 12], ['dst_bahn', 35, 40, 12],
      ['dst_bahn', RAIL_H, 35, 11], ['dst_bahn', RAIL_H, 36, 11],
    ],
    props: [
      ['dsp_schwellenring_roundhouse_doors', 19, 4, { solid: true, light: '#ffc782' }],
      ['dsp_schwellenring_water_crane', 31, 4, { solid: true }],
      ['dsp_schwellenring_coal_heap', 9, 13, { solid: true }],
      ['dsp_schwellenring_locomotive_wheel', 19, 13, {}],
      ['dsp_schwellenring_mechanic_workbench', 31, 13, { solid: true, light: '#ffc782' }],
      ['dsp_schwellenring_signal', 40, 6, {}],
      ['dsp_schwellenring_signal', 40, 17, {}],
      ['dsp_schwellenring_coal_heap', 24, 20, { solid: true }],
    ],
    lampen: [[13, 6], [25, 6], [13, 13], [25, 13], [37, 15], [6, 17]],
    streu: [['dst_stadt', [5, 6], 0.025]],
  },
  ds_arbeiterbogen: {
    props: [
      ['dsp_arbeiterbogen_washing_line', 13, 6, {}],
      ['dsp_arbeiterbogen_washing_line', 25, 6, {}],
      ['dsp_arbeiterbogen_stone_well', 31, 13, { solid: true }],
      ['dsp_arbeiterbogen_outdoor_dinner_table_one_empty_place', 19, 13, { solid: true, light: '#ffc782' }],
      ['dsp_arbeiterbogen_windblown_picnic_table', 7, 13, { solid: true }],
      ['dsp_arbeiterbogen_washing_line', 37, 6, {}],
      ['dsp_arbeiterbogen_outdoor_dinner_table_one_empty_place', 31, 20, { solid: true }],
      ['dsp_arbeiterbogen_windblown_picnic_table', 19, 20, { solid: true }],
    ],
    lampen: [[10, 9], [22, 9], [34, 9], [10, 16], [22, 16], [41, 13]],
    streu: [['dst_stadt', [5, 6], 0.025]],
  },
  ds_kalkmarkt: {
    props: [
      ['dsp_kalkmarkt_stonemason_workshop', 27, 4, { solid: true, light: '#ffc782' }],
      ['dsp_kalkmarkt_blank_gravestone_round', 31, 4, {}],
      ['dsp_kalkmarkt_blank_gravestone_pointed', 34, 4, {}],
      ['dsp_kalkmarkt_blank_gravestone_square', 37, 4, {}],
      ['dsp_kalkmarkt_blank_gravestone_cross', 40, 4, {}],
      ['dsp_kalkmarkt_flea_stall_memory_plaques', 15, 4, { solid: true }],
      ['dsp_kalkmarkt_flea_stall_memory_plaques', 27, 20, { solid: true }],
      ['dsp_kalkmarkt_blank_gravestone_cross', 18, 20, {}],
    ],
    lampen: [[20, 6], [24, 6], [20, 15], [24, 15], [8, 11], [36, 11], [12, 18], [33, 17]],
    streu: [['dst_stadt', [4], 0.012]],
  },
  ds_bruchstufen: {
    reihen: [['dst_bruch', MINE_H, 15, 2, 41]],
    props: [
      ['dsp_bruchsignal_scaffold', 15, 4, { solid: true }],
      ['dsp_bruchsignal_survey_theodolite', 25, 4, {}],
      ['dsp_bruchsignal_scaffold', 36, 4, { solid: true }],
      ['dsp_bruchsignal_scaffold', 15, 13, { solid: true }],
      ['dsp_bruchsignal_survey_theodolite', 36, 13, {}],
      ['dsp_bruchsignal_scaffold', 25, 20, { solid: true }],
    ],
    lampen: [[8, 7], [24, 8], [40, 8], [8, 14], [30, 14], [40, 18]],
    streu: [['dst_bruch', [4, 5], 0.03], ['dst_bruch', [6, 7], 0.012]],
  },
  ds_signalhang: {
    reihen: [['dst_bahn', RAIL_H, 11, 2, 38], ['dst_bahn', RAIL_H, 18, 2, 38]],
    zellen: [['dst_bahn', PRELL, 39, 11], ['dst_bahn', PRELL, 39, 18]],
    props: [
      ['dsp_bruchsignal_signal_cabin', 19, 4, { solid: true, light: '#ffc782' }],
      ['dsp_bruchsignal_listening', 31, 4, { solid: true, light: '#6fe0d0' }],
      ['dsp_bruchsignal_listening', 9, 13, { solid: true, light: '#6fe0d0' }],
      ['dsp_schwellenring_signal', 25, 13, {}],
      ['dsp_bruchsignal_listening', 31, 13, { solid: true, light: '#6fe0d0' }],
      ['dsp_schwellenring_signal', 40, 6, {}],
      ['dsp_bruchsignal_signal_cabin', 37, 20, { solid: true }],
    ],
    lampen: [[13, 6], [25, 6], [13, 13], [36, 15], [6, 9], [20, 20]],
    streu: [['dst_bahn', [46, 47], 0.03]],
  },
  ds_letzter_bahnsteig: {
    reihen: [['dst_bahn', RAIL_H, 8, 3, 40], ['dst_bahn', RAIL_H, 15, 3, 40], ['dst_bahn', 10, 7, 3, 40]],
    zellen: [['dst_bahn', PRELL, 41, 8], ['dst_bahn', PRELL, 41, 15]],
    props: [
      ['dsp_endbahnhof_waiting_bench', 15, 4, { solid: true }],
      ['dsp_endbahnhof_station_clock_without_numerals', 25, 4, { solid: true }],
      ['dsp_endbahnhof_waiting_bench', 35, 4, { solid: true }],
      ['dsp_endbahnhof_blank_timetable_board', 15, 13, { solid: true }],
      ['dsp_endbahnhof_luggage_trolley', 25, 20, {}],
    ],
    lampen: [[8, 11], [18, 11], [28, 11], [38, 11], [14, 18], [34, 18]],
    streu: [['dst_bahn', [46, 31], 0.03]],
  },
  ds_rangierwueste: {
    reihen: [['dst_bahn', RAIL_H, 4, 2, 44], ['dst_bahn', RAIL_H, 11, 2, 44], ['dst_bahn', RAIL_H, 18, 2, 44], ['dst_bahn', RAIL_H, 25, 2, 44]],
    zellen: [['dst_bahn', PRELL, 45, 4], ['dst_bahn', PRELL, 45, 11], ['dst_bahn', PRELL, 45, 18], ['dst_bahn', PRELL, 45, 25]],
    props: [
      ['dsp_schwellenring_signal', 13, 6, {}],
      ['dsp_schwellenring_coal_heap', 30, 13, {}],
      ['dsp_schwellenring_locomotive_wheel', 20, 20, {}],
      ['dsp_schwellenring_water_crane', 42, 13, {}],
      ['dsp_endbahnhof_luggage_trolley', 37, 27, {}],
      ['dsp_schwellenring_signal', 25, 27, {}],
    ],
    lampen: [[10, 13], [36, 6], [10, 20], [30, 20], [44, 27]],
    streu: [['dst_bahn', [46, 47, 31], 0.04]],
  },
  ds_klopfbruch: {
    reihen: [['dst_bruch', MINE_H, 5, 2, 45], ['dst_bruch', MINE_H, 13, 2, 45], ['dst_bruch', MINE_H, 21, 2, 45]],
    props: [
      ['dsp_bruchsignal_scaffold', 18, 7, {}],
      ['dsp_bruchsignal_scaffold', 32, 7, {}],
      ['dsp_bruchsignal_survey_theodolite', 44, 12, {}],
      ['dsp_bruchsignal_scaffold', 8, 20, {}],
      ['dsp_bruchsignal_scaffold', 30, 27, {}],
    ],
    lampen: [[10, 11], [33, 19], [22, 27], [44, 4]],
    streu: [['dst_bruch', [4, 5, 31], 0.05], ['dst_bruch', [6, 7], 0.015]],
  },
  ds_rufschlucht: {
    zellen: [['dst_schlucht', 24, 23, 4], ['dst_schlucht', 25, 25, 9], ['dst_schlucht', 26, 23, 12], ['dst_schlucht', 27, 25, 19], ['dst_schlucht', 24, 23, 22], ['dst_schlucht', 26, 25, 25]],
    props: [
      ['dsp_bruchsignal_listening', 12, 4, { light: '#6fe0d0' }],
      ['dsp_bruchsignal_listening', 36, 4, { light: '#6fe0d0' }],
      ['dsp_bruchsignal_listening', 12, 16, { light: '#6fe0d0' }],
      ['dsp_bruchsignal_listening', 36, 16, { light: '#6fe0d0' }],
      ['dsp_bruchsignal_listening', 36, 27, { light: '#6fe0d0' }],
    ],
    lampen: [[20, 8], [28, 20], [20, 26]],
  },
  ds_unterschicht: {
    reihen: [['dst_bruch', MINE_H, 4, 2, 45], ['dst_bruch', MINE_H, 11, 2, 45], ['dst_bruch', MINE_H, 18, 2, 45], ['dst_bruch', MINE_H, 25, 2, 45]],
    props: [
      ['dsp_bruchsignal_scaffold', 9, 13, {}],
      ['dsp_bruchsignal_scaffold', 25, 13, {}],
      ['dsp_bruchsignal_scaffold', 41, 20, {}],
      ['dsp_bruchsignal_survey_theodolite', 13, 27, {}],
    ],
    lampen: [[12, 6], [37, 6], [24, 20], [44, 27]],
    streu: [['dst_bruch', [4, 5, 31], 0.05], ['dst_bruch', [6, 7], 0.02]],
  },
};
