"""Kampf-Sheets für menschliche Gegner ohne eigene Grafik: vorhandene Codex-Gegner umfärben (+ Moos/Nässe/Ruß).

Aufruf aus dem Repo-Wurzelordner:  python3 tools/art/varianten/gegner.py [vorschau.png]
Neue Sheets: public/sprites/battle/<neu>.png; Animationen übernimmt das Spiel vom Basis-Sheet (GEGNER_VARIANTEN in assets.js).
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from vlib import load, recolor_main, moss, puddle, soot, sheet

B = 'public/sprites/battle'
# neu: (Basis, Zielfarbe Hauptkleidung, Extras, Rang der umzufärbenden Farbe)
GEGNER = {
    # Wexmoorer Gesindel: Kettlegater Diebe in Moor- und Salztönen
    'enemy_wxs_laternendieb': ('enemy_laternendieb', (70, 90, 60), ['wet'], 0),
    'enemy_wxs_kanalschmuggler': ('enemy_kanalschmuggler', (110, 120, 120), ['moss'], 0),
    'enemy_wxs_nachtkraemer': ('enemy_nachtkraemer', (100, 70, 50), ['wet'], 0),
    'enemy_wxs_falschgeldpraeger': ('enemy_falschgeldpraeger', (60, 80, 100), ['moss'], 0),
    # Gesuchte (Wexmoor-Einnahmen): jeder mit eigener Farbe statt geteiltem Sheet
    'enemy_wxk_gleispluenderer': ('enemy_ez_schleusendieb', (120, 80, 50), ['soot'], 0),
    'enemy_wxk_torfschneider': ('enemy_k3k_kupferdieb', (90, 70, 45), ['moss'], 0),
    'enemy_wxk_salzfaelscher': ('enemy_falschgeldpraeger', (150, 150, 140), [], 0),
    'enemy_wxk_bojenbrecher': ('enemy_kanalschmuggler', (150, 60, 40), ['wet'], 0),
    'enemy_wxk_pfahlraeuber': ('enemy_pfandeintreiber', (80, 100, 70), ['moss'], 0),
    'enemy_wxk_wattgaenger': ('enemy_vg_all_wegelagerer', (90, 110, 120), ['wet'], 0),
    'enemy_wxk_moorhehler': ('enemy_k3k_walzenhehler', (60, 80, 55), ['moss'], 0),
    'enemy_wxk_linsendieb': ('enemy_laternendieb', (120, 100, 150), [], 0),
    # Einzelgängerin Maud Keel (Pfad der Waage): Walzenstimme in Pfandleiher-Violett
    'enemy_wx_pfandleiherin': ('enemy_ez_ds_walzenstimme', (110, 70, 120), [], 0),
    # Sammler der Linie (Briarholt): Starlings heller Mantel, kühl statt golden
    'enemy_k5s_sammler': ('enemy_starling', (170, 190, 210), [], 0),
}

def build(preview=None):
    shown = []
    for neu, (base, col, extra, rank) in GEGNER.items():
        src = load(os.path.join(B, base + '.png'))
        f = 96 if base == 'enemy_starling' else 48
        im = recolor_main(src, col, rank=rank, fw=f, fh=f)
        for e in extra:
            im = {'moss': lambda i: moss(i, neu, 0.2), 'wet': lambda i: puddle(i, neu), 'soot': lambda i: soot(i, neu, 0.08)}[e](im)
        im.save(os.path.join(B, neu + '.png'))
        if preview:
            shown += [src.crop((0, 0, f, f)).resize((48, 48)), im.crop((0, 0, f, f)).resize((48, 48))]
    if preview:
        sheet(shown, 8, 3).save(preview)
    json.dump({k: v[0] for k, v in GEGNER.items()}, open('tools/art/varianten/gegner.json', 'w'), indent=1)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else None)
    print(len(GEGNER), 'Gegner geschrieben')
