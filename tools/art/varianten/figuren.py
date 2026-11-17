"""Lauf-Sheets (64x128, 4x4 Frames 16x32) für Figuren ohne eigene Grafik: Codex-Figuren umfärben und Teile tauschen.

Aufruf aus dem Repo-Wurzelordner:  python3 tools/art/varianten/figuren.py [vorschau.png]
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vlib import load, recolor_main, swap_top, soot, sheet

CH = 'public/sprites/characters'
c = lambda n: load(os.path.join(CH, n + '.png'))

def wirtin():  # Schichtwitwe mit rotbraunem Tuch statt Grau
    return recolor_main(c('k3e_schichtwitwe_walk'), (150, 70, 50))

def heizer():  # Aufseher in rußgrauer Jacke statt Dienstgrün
    return soot(recolor_main(c('k3e_aufseher_a_walk'), (80, 78, 84), val=0.8), 'dsg_heizer', 0.08)

def naeherin():  # Briarholter Näherin in Pflaumenblau
    return recolor_main(c('bhn_e_naeherin'), (110, 70, 130))

def apothekerin():  # Archivdienerin in Apothekergrün
    return recolor_main(c('cwn_e_archivdienerin'), (60, 120, 90))

def lehrling():  # Kalkjunge mit der Mütze des Signalkinds
    return recolor_main(swap_top(c('k3e_kalkjunge_walk'), c('k3e_signalkind_walk'), 9), (70, 110, 90))

def aufzugswaerter():  # Laternenwart mit der Dienstmütze des Boten, Uniform weinrot
    return recolor_main(swap_top(c('cwn_e_laternenwart'), c('cwn_e_bote'), 10), (140, 40, 50))

FIGUREN = {'dsg_wirtin': wirtin, 'dsg_heizer': heizer, 'dsg_naeherin': naeherin, 'dsa_apothekerin': apothekerin,
           'dsa_lehrling': lehrling, 'cwn_aufzugswaerter': aufzugswaerter}

if __name__ == '__main__':
    shown = []
    for fid, fn in FIGUREN.items():
        im = fn()
        im.save(os.path.join(CH, fid + '_walk.png'))
        shown.append(im)
    if len(sys.argv) > 1:
        sheet(shown, 6, 3).save(sys.argv[1])
    print(len(FIGUREN), 'Figuren geschrieben')
