"""Item-Varianten für Gegenstände ohne eigenes Bild (vorher Leihbilder in ITEM_ICON_ALIASES).

Aufruf aus dem Repo-Wurzelordner:  python3 tools/art/varianten/items.py [vorschau.png]
Schreibt public/sprites/items/<id>.png (16x16) aus einem vorhandenen Icon + Varianten-Schritten.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vlib import load, apply, sheet

ITEMS = 'public/sprites/items'
RED, BLUE, GREEN, AMBER = (194, 58, 42), (70, 110, 180), (90, 140, 70), (232, 165, 74)
PFAD_FARBE = {'laterne': (232, 165, 74), 'faden': (126, 90, 134), 'maske': (194, 90, 74), 'echo': (111, 224, 208), 'kessel': (122, 150, 70),
              'eisen': (110, 120, 134), 'schluessel': (213, 173, 104), 'sq_waage': (220, 200, 120), 'sq_moor': (94, 106, 82), 'sq_uhr': (150, 162, 176)}

# id: (Basis-Icon, [Schritte])
VARIANTEN = {
    # Fasserin-Arbeiten: gefasste Beutestücke, okkult
    'fass_aschenlicht': ('fremdlicht_phiole', [('hue', -30), ('soot', 0.2), ('cursed',)]),
    'fass_salzspange': ('moewenglas', [('mat', 'silber'), ('speckle', (240, 240, 235), 0.15), ('cursed',)]),
    'fass_pfahlherz': ('schwarzes_herz', [('mat', 'holz'), ('moss', 0.3), ('cursed',)]),
    'fass_kerbhuelse': ('madenwachs', [('mat', 'messing'), ('damaged', 1, 1), ('cursed',)]),
    'fass_wattpendel': ('schlickperle', [('hue', 160), ('wet',), ('cursed',)]),
    'fass_pausendose': ('spieldose_klein', [('mat', 'kupfer'), ('cursed',)]),
    'fass_regenzeuge': ('wachszylinder', [('tint', BLUE, 0.6), ('wet',), ('cursed',)]),
    'fass_gassenfuchs': ('fuchsfell', [('hue', -10, 1.2), ('soot', 0.15), ('cursed',)]),
    'fass_schalenfunke': ('lichtperle', [('mat', 'opal'), ('glow', (111, 224, 208)), ('cursed',)]),
    'fass_knochenkiel': ('schaedelsplitter', [('mat', 'kalk'), ('damaged', 1, 1), ('cursed',)]),
    # Artefakte aus Kapitel 4/5
    'cwo_getrennte_klammer': ('k2g_zeugenklammer', [('mat', 'messing'), ('damaged', 2, 2), ('cursed',)]),
    'bho_kalte_handhabe': ('vi_art_die_kurglocke', [('mat', 'eisen'), ('frost', 0.8), ('cursed',)]),
    # Fest-Andenken (Artefakte)
    'fs_laternennacht_andenken': ('vi_m_kutschenlaterne', [('tint', AMBER, 0.7), ('glow', (255, 217, 138)), ('cursed', 0.6)]),
    'fs_salzsegen_andenken': ('brautkranz', [('mat', 'kalk'), ('speckle', (250, 250, 245), 0.2), ('cursed', 0.6)]),
    'fs_schichtwechsel_andenken': ('namenssiegel', [('mat', 'kupfer'), ('soot', 0.2), ('cursed', 0.6)]),
    # Fest-Verbrauchsgüter
    'fs_laternennacht_papierlaterne': ('vi_m_kutschenlaterne', [('tint', (200, 70, 50), 0.7), ('glow', (255, 200, 120))]),
    'fs_laternennacht_kerzenboot': ('kerze_der_nachtwache', [('tint', AMBER, 0.4), ('wet',)]),
    'fs_laternennacht_gluehwein': ('gewuerzwein', [('tint', (150, 40, 50), 0.6)]),
    'fs_laternennacht_kastanien': ('vi_v_wegzehrung', [('mat', 'holz'), ('glow', (240, 165, 74), 2)]),
    'fs_laternennacht_kandis': ('salzkristall', [('mat', 'glut')]),
    'fs_laternennacht_apfel': ('vi_v_wegzehrung', [('tint', (180, 50, 40), 0.8)]),
    'fs_laternennacht_docht': ('schwarzer_docht', [('hue', 30), ('glow', (255, 217, 138), 2)]),
    'fs_laternennacht_tee': ('ruhetee', [('tint', (120, 60, 110), 0.5)]),
    'fs_salzsegen_raeucherfisch': ('vmi_trockenfisch', [('mat', 'holz'), ('soot', 0.15)]),
    'fs_salzsegen_salzkranz': ('brautkranz', [('mat', 'kalk')]),
    'fs_salzsegen_bruehe': ('moortee', [('tint', (170, 140, 80), 0.6)]),
    'fs_salzsegen_brot': ('salzbrot', [('speckle', (250, 250, 245), 0.18)]),
    'fs_salzsegen_birne': ('vi_m_sudflasche', [('tint', (170, 170, 70), 0.7)]),
    'fs_salzsegen_kraeuter': ('eisenkraut', [('hue', 25), ('speckle', (200, 160, 220), 0.1)]),
    'fs_salzsegen_wasser': ('wasserprobe', [('tint', (120, 190, 220), 0.6)]),
    'fs_salzsegen_bonbon': ('kinder_murmel', [('mat', 'opal')]),
    'fs_schichtwechsel_lohntuetenlos': ('pfandschein', [('mat', 'papier'), ('seal', (60, 90, 150))]),
    'fs_schichtwechsel_bierkrug': ('flasche_gin', [('mat', 'kalk'), ('seal', (150, 110, 50), 'tr')]),
    'fs_schichtwechsel_kandis': ('salzkristall', [('mat', 'messing')]),
    'fs_schichtwechsel_stulle': ('vi_v_setzerbrot', [('soot', 0.18)]),
    'fs_schichtwechsel_kaffee': ('schlaftee', [('tint', (90, 55, 35), 0.8)]),
    'fs_schichtwechsel_gurke': ('vi_v_wegzehrung', [('tint', (80, 120, 60), 0.8)]),
    'fs_schichtwechsel_wasser': ('wasserprobe', [('mat', 'kalk')]),
    'fs_schichtwechsel_gebinde': ('vi_m_registerband', [('tint', (200, 110, 50), 0.7), ('soot', 0.12)]),
    # Calderwick Orte
    'cwo_aufzugsmarke': ('pfandmarke_alt', [('mat', 'messing')]),
    'cwo_aufzugsschluessel': ('schluessel_rostig', [('mat', 'messing')]),
    'cwo_letternset': ('vi_m_bleiletter', [('mat', 'kupfer')]),
    'cwo_terrassen_kaltbrot': ('salzbrot', [('frost', 0.6)]),
    'cwo_walzenkeil': ('k2v_tonnenholz', [('mat', 'holz'), ('damaged', 1, 1)]),
    'cwo_kabinenfenster_scherbe': ('vi_m_glasscherbe_beschlagen', [('hue', 25), ('damaged', 1, 2)]),
    'cwo_haushaltsknoten': ('knotengarn', [('hue', 40)]),
    'cwo_satzwinkel': ('vi_waffe_setzhaken', [('mat', 'eisen'), ('damaged', 1, 0)]),
    'cwo_gartenetikett': ('vi_k_bh_beetschild', [('mat', 'papier'), ('soot', 0.12)]),
    'cwo_ruecklaufpfropfen': ('vi_m_kupferrohrstueck', [('mat', 'holz'), ('soot', 0.2)]),
    'cwa_rohrpostsiegel': ('vi_m_rohrpostkapsel_leer', [('mat', 'messing'), ('seal', RED)]),
    'cwa_originalsatz': ('vi_k_cw_ungestempelter_durchschlag', [('mat', 'papier'), ('seal', (40, 60, 120))]),
    'cwa_zeugensiegel': ('namenssiegel', [('mat', 'gold')]),
    'cwa_amtsschluessel': ('ossuarschluessel', [('mat', 'messing')]),
    # Briarholt Orte und Akte
    'bha_heizvorrat': ('russklumpen', [('glow', (240, 165, 74), 3)]),
    'bha_kapselhalter': ('vi_k_bh_pflanzenkapsel', [('mat', 'messing')]),
    'bha_formelbeleg': ('formeln_2', [('mat', 'papier'), ('seal', GREEN)]),
    'bha_laborschluessel': ('schluessel_rostig', [('mat', 'silber'), ('frost', 0.4)]),
    'bho_ventilschluessel': ('schluessel_rostig', [('mat', 'eisen'), ('frost', 0.7)]),
    'bho_kondensatglas': ('vi_m_sudflasche', [('mat', 'opal'), ('frost', 0.6)]),
    'bho_kurgastmarke': ('vi_v_kurkarte', [('hue', 150)]),
    'bho_palmhausdattel': ('vi_v_wurzelpastille', [('mat', 'holz')]),
    'bho_ruecklaufplombe': ('s4wa_plombe', [('mat', 'kupfer'), ('damaged', 1, 1)]),
    'bho_porzellanschieber': ('vi_m_glasscherbe_beschlagen', [('mat', 'porzellan')]),
    'bho_reifkamm': ('fa2_los_kamm', [('mat', 'silber'), ('frost', 0.9)]),
    'bho_ventilrose': ('bnl_kaltventil', [('mat', 'messing')]),
    'bho_kuehlfilz': ('vi_m_kurwaesche', [('mat', 'kalk'), ('frost', 0.6)]),
    'bho_ruecklaufstreifen': ('vi_m_registerband', [('tint', (90, 150, 190), 0.7)]),
    # Kapitel 4 Story
    'k4s_akte_starling': ('sq_gegenakte', [('tint', (150, 40, 40), 0.5), ('soot', 0.15), ('seal', (60, 20, 20))]),
    # Wexmoor Pfad-Beyonder
    'ph_torfprobe': ('wasserprobe', [('tint', (110, 75, 45), 0.8)]),
    'ph_hales_siegel': ('vs_siegelring', [('mat', 'eisen')]),
    # Dunscar Schlacke und Wertstücke
    'ds_schlacke_glutperle': ('lichtperle', [('mat', 'glut')]),
    'ds_schlacke_ofenherz': ('schwarzes_herz', [('mat', 'glut'), ('soot', 0.25)]),
    'ds_schlacke_kronglas': ('grubenglas', [('hue', 20), ('soot', 0.2)]),
    'ds_beute_messingmarke': ('pfandmarke_alt', [('mat', 'messing'), ('soot', 0.15)]),
    'ds_beute_signalsilber': ('spiegelmuenze', [('mat', 'silber')]),
    'ds_beute_schichtgold': ('vs_goldbarren', [('soot', 0.18)]),
    'ds_beute_kalkopal': ('lichtperle', [('mat', 'opal'), ('speckle', (230, 150, 200), 0.12)]),
}
# Ritualformeln Seq 3: Formel der Stufe 3 mit Pfad-Siegel und Okkult-Saum
for pid, col in PFAD_FARBE.items():
    VARIANTEN[f'ritualformel_{pid}_3'] = (f'formel_{pid}_3', [('seal', col), ('cursed', 0.7)])


def build(preview=None):
    shown = []
    for vid, (base, ops) in VARIANTEN.items():
        im = load(os.path.join(ITEMS, base + '.png'), (16, 16))
        out = apply(im, ops, vid)
        out.save(os.path.join(ITEMS, vid + '.png'))
        shown += [im, out]
    if preview:
        sheet(shown, 20, 4).save(preview)
    return list(VARIANTEN)


if __name__ == '__main__':
    ids = build(sys.argv[1] if len(sys.argv) > 1 else None)
    print(len(ids), 'Varianten geschrieben')
