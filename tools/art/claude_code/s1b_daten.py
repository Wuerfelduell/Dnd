"""Zuordnung Basisfigur -> Seq-1-Beyonder. Paletten aus src/data/seq1Beyonder.js (SEQ1_BEYONDER[*].palette)."""
AUGEN = {  # Leuchtfarbe je Pfad (Gegenlicht-Saum)
   'laterne': '#ffd890', 'faden': '#d8c0ff', 'maske': '#ff9aa8', 'echo': '#6fe0d0', 'kessel': '#b8f080',
         'eisen': '#e8f0ff', 'schluessel': '#f0c060', 'sq_waage': '#ffe080', 'sq_moor': '#a0d070', 'sq_uhr': '#d0d0ff'}
FIGUREN = {
    'laterne': {'basis': 'E_sufragette_walk', 'zeilen': (11, 24), 'anzahl': (2, 4, 2),
                'palette': {'coat': '#c8b888', 'hat': '#8a6a30', 'skin': '#e0c8a8', 'hair': '#f4ecd0', 'legs': '#6a5a30', 'scarf': '#fff4c0'}},
    'faden': {'basis': 'E_kutscher_walk', 'zeilen': (11, 24),
              'palette': {'coat': '#6a4a7a', 'hat': '#3a2a48', 'skin': '#d8b898', 'hair': '#2a2028', 'legs': '#2a2030', 'scarf': '#c0a0e0'}},
    'maske': {'basis': 'C_diva_walk', 'zeilen': (11, 26),
              'palette': {'coat': '#a03040', 'hat': '#401018', 'skin': '#f0d8c0', 'hair': '#101010', 'legs': '#301018', 'scarf': '#f0f0f0'}},
    'echo': {'basis': 'C_astronom_walk', 'zeilen': (11, 25),
             'palette': {'coat': '#405868', 'hat': '#203038', 'skin': '#d0c0b0', 'hair': '#a0a8b0', 'legs': '#203038', 'scarf': '#90c0d0'}},
    'kessel': {'basis': 'dsz_ofenmutter_walk', 'zeilen': (10, 24),
               'palette': {'coat': '#5a6a30', 'hat': '#303818', 'skin': '#c8b090', 'hair': '#e0e0d0', 'legs': '#303818', 'scarf': '#c0d060'}},
    'eisen': {'basis': 'J_brannock_walk', 'zeilen': (9, 24), 'anzahl': (2, 6, 4),
              'palette': {'coat': '#5a5a60', 'hat': '#2a2a30', 'skin': '#c8a888', 'hair': '#3a3028', 'legs': '#2a2a30', 'scarf': '#a0a0a8'}},
    'schluessel': {'basis': 'R_hale_walk', 'zeilen': (10, 24),
                   'palette': {'coat': '#2a3a30', 'hat': '#101810', 'skin': '#d0b898', 'hair': '#504030', 'legs': '#101810', 'scarf': '#80b090'}},
    'sq_waage': {'basis': 'C_uhrmacherin_walk', 'zeilen': (10, 24),
                 'palette': {'coat': '#706040', 'hat': '#40381c', 'skin': '#e0c8a8', 'hair': '#c0b090', 'legs': '#40381c', 'scarf': '#d0b060'}},
    'sq_moor': {'basis': 'S_ez_reetkoenig_walk', 'zeilen': (10, 24),
                'palette': {'coat': '#3a3020', 'hat': '#201810', 'skin': '#a08868', 'hair': '#605040', 'legs': '#201810', 'scarf': '#6a7a40'}},
    'sq_uhr': {'basis': 'C_maskenmacher_walk', 'zeilen': (11, 24), 'anzahl': (4, 5, 3), 'kopf_rolle': 'hair', 'kopf_eigen': False,
               'palette': {'coat': '#3a4450', 'hat': '#20262e', 'skin': '#d0b090', 'hair': '#d0d0d0', 'legs': '#20262e', 'scarf': '#d0a040'}},
}
