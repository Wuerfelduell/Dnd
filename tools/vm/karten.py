"""Varrowmouth (Kapitel 7): Grundrisse der Etappe-1-Karten. Schreibt src/data/packs/k6_orte/vm_karten.json.
Zeichen: I Mauer/Dach, . Pflaster/Planken, , Schlick, ~ Wasser, = Steg (begehbar).
Anker (benannte Punkte für Türen, Figuren, Fundstellen) stehen in `anker`. python3 tools/vm/karten.py
"""
import json, os, random

W, H = 48, 32

def leer(w=W, h=H, fill='.'):
    g = [[fill] * w for _ in range(h)]
    for x in range(w): g[0][x] = g[h - 1][x] = 'I'
    for y in range(h): g[y][0] = g[y][w - 1] = 'I'
    return g

def rect(g, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            g[y][x] = ch

def rows(g):
    return [''.join(r) for r in g]

karten = {}

# --- Zollhafen: Zollhaus, Pegeluhr und Kantine oben, Kai in der Mitte, Hafenbecken mit drei Stegen unten --------------
g = leer()
rect(g, 1, 1, 46, 3, 'I')            # Häuserzeile am oberen Rand
rect(g, 4, 4, 15, 6, 'I')            # Zollhaus
rect(g, 20, 4, 23, 7, 'I')           # Pegeluhrturm
rect(g, 28, 4, 37, 6, 'I')           # Kantine
rect(g, 41, 4, 46, 5, 'I')
rect(g, 1, 17, 46, 30, '~')          # Hafenbecken
rect(g, 1, 15, 3, 16, '~')
rect(g, 44, 15, 46, 16, '~')
rect(g, 8, 17, 9, 26, '=')           # Fischersteg
rect(g, 22, 17, 23, 28, '=')         # Fähranleger
rect(g, 21, 27, 24, 28, '=')
rect(g, 36, 17, 37, 24, '=')         # Bootssteg zur Leuchtbank
rect(g, 10, 22, 21, 22, '=')         # Querbalken
karten['vm_zollhafen'] = dict(rows=rows(g), spawns={'default': [22, 27], 'von_oberstrasse': [2, 11], 'von_stegviertel': [45, 11]},
    anker={'tuer_oberstrasse': [1, 11], 'tuer_stegviertel': [46, 11], 'zollschalter': [10, 7], 'pegeluhr': [21, 8], 'kantine': [32, 7],
           'faehre': [23, 26], 'bootssteg': [36, 24], 'fischersteg': [9, 25], 'kai_west': [6, 12], 'kai_mitte': [24, 12], 'kai_ost': [40, 12], 'post': [14, 9]})
for (x, y) in [(1, 11), (46, 11)]: g[y][x] = '.'
karten['vm_zollhafen']['rows'] = rows(g)

# --- Stegviertel: Pfahlbauten im Wasser, Planken und Stege, Markt in der Mitte -------------------------------------------
g = leer(fill='~')
rect(g, 1, 9, 6, 14, '.')            # Plattform West (vom Zollhafen)
rect(g, 6, 11, 42, 12, '=')          # Hauptsteg
rect(g, 22, 2, 23, 29, '=')          # Quersteg Nord-Süd
rect(g, 15, 14, 31, 21, '.')         # Marktplattform
rect(g, 3, 2, 12, 7, '.'); rect(g, 3, 2, 12, 5, 'I')     # Pfahlhaus NW
rect(g, 8, 8, 9, 10, '=')
rect(g, 32, 2, 42, 8, '.'); rect(g, 33, 2, 41, 5, 'I')   # Tams Lotsenkammer
rect(g, 37, 9, 38, 10, '=')
rect(g, 28, 24, 40, 29, '.'); rect(g, 29, 24, 39, 26, 'I')   # Taucherhaus
rect(g, 24, 26, 27, 27, '=')
rect(g, 4, 20, 12, 27, '.'); rect(g, 5, 20, 11, 22, 'I')     # Flickerei
rect(g, 13, 23, 21, 24, '=')
rect(g, 42, 11, 46, 12, '=')         # Steg nach Osten (Wrackfeld, noch gesperrt)
rect(g, 22, 30, 23, 30, '=')
for (x, y) in [(0, 11), (0, 12)]: g[y][x] = 'I'
g[11][1] = '.'; g[12][1] = '.'
karten['vm_stegviertel'] = dict(rows=rows(g), spawns={'default': [3, 11], 'von_zollhafen': [2, 11], 'von_schlickgassen': [22, 28], 'von_wrackfeld': [44, 11]},
    anker={'tuer_zollhafen': [1, 11], 'tuer_schlickgassen': [22, 30], 'steg_ost': [45, 11], 'lotsenkammer': [37, 7], 'markt': [20, 16],
           'markt_ost': [28, 18], 'nordhaus': [7, 7], 'taucherhaus': [33, 28], 'flickerei': [8, 24], 'kreuzung': [23, 12]})

# --- Schlickgassen: tiefe Gassen im Schlick, niedrige Häuser, Pfützen -------------------------------------------------------
random.seed(7)
g = leer(fill=',')
for (x0, y0, x1, y1) in [(3, 3, 9, 6), (13, 3, 19, 5), (27, 3, 33, 6), (37, 3, 44, 5), (3, 11, 8, 14), (12, 10, 17, 13), (30, 10, 36, 13),
                         (40, 10, 45, 13), (5, 19, 11, 22), (16, 19, 21, 21), (28, 19, 34, 22), (38, 18, 44, 21), (3, 26, 9, 28), (14, 26, 20, 28),
                         (26, 26, 32, 28), (36, 26, 43, 28)]:
    rect(g, x0, y0, x1, y1, 'I')
for (x0, y0, x1, y1) in [(20, 14, 23, 16), (8, 16, 10, 17), (36, 15, 38, 16), (24, 23, 26, 24), (44, 23, 45, 24)]:
    rect(g, x0, y0, x1, y1, '~')
rect(g, 22, 1, 23, 2, '.')
karten['vm_schlickgassen'] = dict(rows=rows(g), spawns={'default': [22, 3], 'von_stegviertel': [22, 3]},
    anker={'tuer_stegviertel': [22, 1], 'nells_haus': [24, 7], 'gasse_mitte': [26, 16], 'gasse_west': [11, 24], 'gasse_ost': [40, 24], 'pfuetze': [19, 15]})
g[1][22] = '.'; g[1][23] = '.'
karten['vm_schlickgassen']['rows'] = rows(g)

# --- Oberstraße: trockene Hochstraße, Reederhäuser, Ratsgebäude, Apotheke, altes Zollarchiv ------------------------------
g = leer()
rect(g, 1, 1, 46, 3, 'I')
for (x0, x1) in [(3, 9), (11, 16), (31, 36), (38, 44)]: rect(g, x0, 4, x1, 6, 'I')     # Reederhäuser Nord
rect(g, 18, 4, 29, 9, 'I')           # Ratsgebäude
rect(g, 1, 28, 46, 30, 'I')
for (x0, x1) in [(3, 10), (13, 19), (23, 30), (34, 41)]: rect(g, x0, 21, x1, 23, 'I')   # Häuser Süd (Apotheke, Archiv)
rect(g, 20, 14, 27, 16, '.')
g[14][46] = '.'
karten['vm_oberstrasse'] = dict(rows=rows(g), spawns={'default': [44, 14], 'von_zollhafen': [44, 14]},
    anker={'tuer_zollhafen': [46, 14], 'rat': [23, 10], 'rat_west': [17, 11], 'rat_ost': [30, 11], 'apotheke': [6, 20], 'archiv': [26, 20],
           'keller': [27, 10], 'grenze': [40, 7], 'platz': [23, 15], 'reeder': [13, 7]})

# --- Wrackfeld (Etappe 2): nur bei Ebbe, Schlickebene mit Prielen und Wrackrümpfen, die Wrackmutter im Osten -------------
random.seed(11)
g = leer(fill=',')
for (x0, y0, x1, y1) in [(1, 1, 46, 2), (1, 29, 46, 30)]:
    rect(g, x0, y0, x1, y1, '~')
for (x0, y0, x1, y1) in [(10, 3, 12, 9), (19, 14, 21, 26), (27, 3, 29, 8), (30, 23, 33, 28), (8, 17, 10, 23), (44, 3, 46, 9), (44, 22, 46, 28)]:
    rect(g, x0, y0, x1, y1, '~')     # Priele
for (x0, y0, x1, y1) in [(14, 4, 18, 6), (5, 25, 11, 27), (24, 18, 28, 20), (33, 4, 37, 6), (13, 20, 16, 22)]:
    rect(g, x0, y0, x1, y1, 'I')     # kleine Wracks
rect(g, 37, 11, 44, 17, 'I')         # Rumpf der Wrackmutter
rect(g, 1, 11, 9, 12, '=')           # Steg vom Stegviertel
rect(g, 10, 11, 12, 12, '=')         # über den Priel
rect(g, 19, 11, 21, 12, '=')
rect(g, 19, 27, 21, 28, ',')
rect(g, 28, 9, 28, 10, '=')
for (x, y) in [(0, 11), (0, 12)]: g[y][x] = 'I'
karten['vm_wrackfeld'] = dict(rows=rows(g), spawns={'default': [2, 11], 'von_stegviertel': [2, 11]},
    anker={'tuer_stegviertel': [1, 11], 'rippen': [16, 8], 'priel': [24, 10], 'wrack': [35, 14], 'wrack_sued': [36, 20], 'kielraum': [40, 19],
           'sued': [15, 25], 'nord': [32, 8], 'ost': [42, 24], 'mitte': [26, 15]})

out = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'packs', 'k6_orte', 'vm_karten.json')
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, 'w', encoding='utf-8') as f:
    json.dump(karten, f, ensure_ascii=False, indent=1)
for k, v in karten.items():
    print(k); print('\n'.join(v['rows']))
