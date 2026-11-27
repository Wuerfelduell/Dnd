"""Runde 9: eigene Fassungen für die letzten kleinen Leihgruppen (ein Gegner lieh das Bild eines anderen).

Jedes Thema bildet die Helligkeit der Vorlage auf eine eigene Farbrampe ab (dunkel -> hell), mischt das mit der
Vorlage (Stärke t, Zeichnung bleibt) und setzt Merkmale: Glut-Funken, Kruste an Oberkanten, Moos/Algen an Unterkanten,
Tropfen, Fäden/Netz, Risse. Menschen behalten auf Wunsch ihre Hautfarbe. Leuchtpixel der Vorlage werden in die
Leuchtfarbe des Themas übertragen. Saum (Gegenlicht rechts/unten) in Themenfarbe, geweihte Oberkante bei Bossen.
Aufruf: python3 themen_varianten.py <battle-ordner> <sheets.json> [liste.json]
"""
import sys, os, json
from PIL import Image
from o3_varianten import Frame, outline, mix, lum, hsv, rgb, hsh, OUTL
from waechter_varianten import weihe as _weihe
from hgb_varianten import saum_farbe
import o3_varianten

R = {  # Farbrampen dunkel -> hell
    'irrlicht': [(20, 40, 52), (34, 92, 96), (70, 170, 150), (150, 236, 200), (230, 255, 236)],
    'russ': [(16, 14, 18), (34, 30, 32), (58, 50, 50), (92, 82, 78), (140, 128, 118)],
    'gas': [(30, 40, 20), (70, 96, 34), (140, 170, 60), (206, 222, 110), (246, 250, 190)],
    'grundwasser': [(14, 22, 36), (26, 46, 66), (50, 84, 104), (98, 140, 152), (170, 206, 210)],
    'ocker': [(34, 22, 16), (78, 50, 30), (130, 92, 52), (184, 148, 96), (226, 210, 170)],
    'asche': [(30, 30, 34), (70, 68, 72), (118, 114, 116), (170, 166, 164), (222, 218, 212)],
    'glut': [(26, 12, 10), (80, 28, 18), (150, 60, 26), (226, 130, 50), (255, 220, 140)],
    'bremse': [(26, 16, 16), (70, 30, 28), (120, 50, 40), (168, 96, 70), (214, 170, 140)],
    'ertrunken': [(18, 30, 38), (38, 62, 72), (78, 110, 116), (136, 168, 166), (206, 226, 218)],
    'salz': [(40, 44, 52), (96, 102, 110), (160, 166, 170), (214, 218, 218), (248, 248, 244)],
    'kalk': [(46, 44, 40), (104, 100, 92), (168, 164, 152), (220, 216, 204), (250, 248, 240)],
    'rost': [(28, 16, 12), (76, 36, 22), (128, 66, 36), (176, 112, 64), (220, 176, 128)],
    'kupfer': [(30, 18, 14), (84, 44, 28), (150, 84, 48), (208, 138, 84), (246, 204, 150)],
    'stein': [(28, 26, 26), (66, 60, 56), (110, 102, 94), (160, 152, 140), (210, 204, 192)],
    'papier': [(40, 32, 24), (96, 80, 58), (156, 138, 104), (210, 196, 160), (244, 236, 210)],
    'messing': [(34, 24, 12), (90, 64, 28), (150, 112, 50), (206, 170, 92), (246, 224, 160)],
    'karmin': [(28, 10, 16), (78, 20, 34), (138, 36, 52), (196, 84, 90), (240, 170, 160)],
    'weissgold': [(48, 36, 20), (120, 92, 50), (196, 160, 96), (240, 216, 160), (255, 250, 230)],
    'signal': [(14, 30, 30), (26, 70, 64), (50, 126, 108), (110, 190, 160), (200, 240, 220)],
    'holz': [(36, 26, 20), (86, 62, 42), (140, 108, 74), (192, 162, 118), (232, 214, 178)],
    'moos': [(20, 24, 16), (44, 56, 32), (84, 98, 54), (134, 146, 90), (196, 204, 150)],
    'vorhof': [(36, 40, 52), (80, 80, 84), (138, 132, 120), (196, 186, 162), (240, 232, 208)],
}
LEUCHT = {'irrlicht': (180, 255, 220), 'russ': (255, 150, 60), 'gas': (230, 255, 120), 'grundwasser': (140, 220, 240), 'ocker': (255, 200, 120),
          'asche': (220, 220, 230), 'glut': (255, 230, 150), 'bremse': (255, 120, 80), 'ertrunken': (170, 240, 230), 'salz': (255, 255, 255),
          'kalk': (255, 250, 220), 'rost': (255, 160, 90), 'kupfer': (255, 190, 120), 'stein': (230, 220, 200), 'papier': (255, 240, 200),
          'messing': (255, 230, 150), 'karmin': (255, 150, 140), 'weissgold': (255, 255, 230), 'signal': (140, 255, 200), 'holz': (255, 220, 160),
          'moos': (200, 240, 140), 'vorhof': (255, 236, 180)}

# id: (basis, rampe, stärke, haut behalten, merkmale, boss)
T = {
    'reise_irrlicht': ('spiegelschatten', 'irrlicht', 0.8, False, ['leuchtkern'], False),
    'kg_schlotgeist': ('spiegelschatten', 'russ', 0.85, False, ['funken'], False),
    'kg_kanalrettung': ('spiegelschatten', 'gas', 0.8, False, ['blasen'], False),
    'ph_ds_grundwasser': ('unterschicht', 'grundwasser', 0.7, False, ['tropfen'], True),
    'ds_gb_tiefenvorarbeiter': ('unterschicht', 'ocker', 0.65, False, ['staub'], False),
    'k6_schaffner2': ('bn_schaffner_ohne_zug', 'asche', 0.75, False, [], True),
    'sg_glutschaffner': ('bn_schaffner_ohne_zug', 'glut', 0.7, False, ['funken'], False),
    'hkr_dunscar_boss': ('bn_schaffner_ohne_zug', 'bremse', 0.7, False, ['risse'], True),
    'za_brask_elite': ('k3p_gangaufseher', 'grundwasser', 0.6, True, [], False),
    'za_stieg_elite': ('k3p_gangaufseher', 'moos', 0.6, True, [], False),
    'za_kropp_elite': ('k3p_gangaufseher', 'holz', 0.6, True, [], False),
    'za_fehr_elite': ('k3p_gangaufseher', 'signal', 0.55, True, ['kruste:(214,180,96)'], False),
    'fs_boxer_1': ('holt', 'karmin', 0.6, True, [], False),
    'reise_ratten': ('aktenfresser', 'stein', 0.6, False, ['moosunten'], False),
    'kg_rattenschwarm': ('aktenfresser', 'ocker', 0.55, False, ['faeden'], False),
    'reise_kultist': ('chorfanatiker', 'asche', 0.55, True, [], False),
    'hkr_kettlegate_boss': ('chorfanatiker', 'karmin', 0.7, True, [], True),
    'hs_starling': ('starling2', 'vorhof', 0.7, False, [], True),
    'ph_ertrunkener_1': ('nebelfischer', 'ertrunken', 0.75, False, ['algen'], True),
    'ph_ertrunkener_2': ('nebelfischer', 'ertrunken', 0.7, False, ['netz', 'algen'], True),
    'ph_ertrunkener_3': ('nebelfischer', 'ertrunken', 0.7, False, ['messing', 'algen'], True),
    'ph_ds_prellbock': ('vorhauer', 'rost', 0.65, False, ['risse'], True),
    'ph_ds_bruchfaden': ('vorhauer', 'stein', 0.6, False, ['draht'], True),
    'ds_gb_bruchmeister': ('vorhauer', 'kalk', 0.65, False, ['risse'], False),
    'sg_aschenkraehe': ('signalkraehe', 'asche', 0.75, False, ['funken'], False),
    'sg_aschenkraehe_elite': ('signalkraehe', 'glut', 0.7, False, ['funken'], False),
    'za_salzkraehe_elite': ('signalkraehe', 'salz', 0.7, False, ['kruste:(252,252,248)'], False),
    'sg_glutstaub': ('kalkstaubgeist', 'glut', 0.65, False, ['funken'], False),
    'sg_glutstaub_elite': ('kalkstaubgeist', 'russ', 0.8, False, ['funken', 'leuchtkern'], True),
    'za_kalkfresser_elite': ('kalkstaubgeist', 'kalk', 0.75, False, ['staub'], False),
    'reise_nebelhund': ('nebelhund', 'holz', 0.5, False, ['moosunten'], False),
    'reise_strassenraeuber': ('silas', 'moos', 0.55, True, [], False),
    'hkr_wexmoor_trupp': ('k3p_lampengutachter', 'asche', 0.55, True, ['risse'], True),
    'k4s_erntehelfer': ('vg_cw_rohrpostwespe', 'papier', 0.7, False, [], False),
    'cwx_cw_roehrenhof_waechter': ('vg_cw_rohrpostwespe', 'messing', 0.7, False, [], False),
    'ph_leuchtfeuer_elite': ('leuchtfeuer', 'weissgold', 0.55, False, ['leuchtkern'], True),
    'hkr_wexmoor_boss': ('leuchtfeuer', 'karmin', 0.6, False, [], True),
    'ph_ds_kalklicht': ('schwellenhund', 'kalk', 0.65, False, ['leuchtkern'], True),
    'ds_gb_weichenfresser': ('schwellenhund', 'rost', 0.65, False, ['risse'], False),
    'ph_ds_vielrufer': ('vielrufer', 'asche', 0.7, False, [], True),
    'ds_gb_schluchtrufer': ('vielrufer', 'stein', 0.65, False, ['moosunten'], False),
    'sg_schlackenlaeufer': ('schichtgaenger', 'russ', 0.7, False, ['funken'], False),
    'sg_schlackenlaeufer_elite': ('schichtgaenger', 'glut', 0.7, False, ['funken'], False),
    'sg_ofenpanzer': ('geruestklang', 'russ', 0.65, False, ['funken'], False),
    'za_gerueststimme_elite': ('geruestklang', 'holz', 0.6, False, [], False),
    'sg_kesselbrecher': ('nachhall', 'kupfer', 0.65, False, ['funken'], False),
    'za_stellwerksecho_elite': ('nachhall', 'bremse', 0.7, False, [], False),
}


def neu_id(eid):
    return f"enemy_{T[eid][0]}__{eid}"


def rampe(r, l):
    l = max(0.0, min(1.0, (l - 0.08) / 0.8))
    i = min(len(r) - 2, int(l * (len(r) - 1)))
    t = l * (len(r) - 1) - i
    return mix(r[i], r[i + 1], t)


def haut(c):
    h, s, v = hsv(c)
    return 0.02 < h < 0.11 and 0.18 < s < 0.62 and v > 0.45


def leucht(c):
    h, s, v = hsv(c)
    return s > 0.45 and v > 0.82


def farbe(eid, c, x, y, f):
    basis, rn, t, hb, mm, boss = T[eid]
    if outline(c):
        return c
    if hb and haut(c):
        return c
    r = R[rn]
    if leucht(c):
        return mix(LEUCHT[rn], (255, 255, 255), 0.2)
    ziel = rampe(r, lum(c))
    out = mix(c, ziel, t)
    fx, fy = x - f.x0, y - f.y0
    obenfrei = not f.inside(x, y - 1)
    untenfrei = not f.inside(x, y + 1)
    for m in mm:
        if m == 'funken' and lum(c) > 0.25 and hsh(x, y, 7) < 0.014:
            return (255, 170, 70) if hsh(x, y, 8) < 0.6 else (255, 230, 150)
        if m == 'blasen' and obenfrei and hsh(x, y, 9) < 0.5:
            return (230, 250, 150)
        if m == 'tropfen' and untenfrei and hsh(x, 0, 10) < 0.35:
            return (150, 210, 230)
        if m == 'staub' and hsh(x, y, 11) < 0.05:
            return mix(r[4], (255, 255, 255), 0.3)
        if m.startswith('kruste') and obenfrei and hsh(x, y, 17) < 0.6:
            return mix(out, tuple(int(v) for v in m.split(':')[1].strip('()').split(',')), 0.7)
        if m == 'moosunten' and untenfrei and hsh(x, y, 12) < 0.7:
            return (88, 104, 60)
        if m == 'algen' and (untenfrei or not f.inside(x, y + 2)) and hsh(x, y, 13) < 0.75:
            return (70, 112, 74) if hsh(x, y, 14) < 0.5 else (102, 140, 86)
        if m == 'faeden' and (fy - fx // 3) % 13 == 0:
            return (226, 214, 180)
        if m == 'netz' and ((fx + fy) % 11 == 0 or (fx - fy) % 11 == 0) and 0.25 < lum(c) < 0.7:
            return mix(out, (200, 210, 190), 0.35)
        if m == 'messing' and lum(c) > 0.6 and hsh(x, y, 15) < 0.5:
            return mix(out, (214, 176, 96), 0.7)
        if m == 'draht' and (fy + fx // 2) % 17 == 0:
            return (214, 140, 84)
        if m == 'risse' and hsh(x // 2, y, 16) < 0.025:
            return mix(out, (30, 20, 20), 0.7)
        if m == 'leuchtkern':
            cx, cy = (f.bx0 + f.bx1) / 2, (f.by0 + f.by1) / 2
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 / max(1, (f.bx1 - f.bx0) / 2)
            if d < 0.45:
                out = mix(out, LEUCHT[rn], 0.35 * (1 - d / 0.45))
    return out


def bauen(eid, pfad, fw, fh):
    im = Image.open(pfad).convert('RGBA')
    out = im.copy()
    rn, boss = T[eid][1], T[eid][5]
    for y0 in range(0, im.height - fh + 1, fh):
        for x0 in range(0, im.width - fw + 1, fw):
            f = Frame(im, x0, y0, fw, fh)
            if not f.ok:
                continue
            for y in range(y0, y0 + fh):
                for x in range(x0, x0 + fw):
                    p = im.getpixel((x, y))
                    if p[3]:
                        out.putpixel((x, y), farbe(eid, p[:3], x, y, f) + (p[3],))
            if boss:
                o3_varianten.FARBE['_t'] = LEUCHT[rn]
                _weihe(out, f, '_t')
            saum_farbe(out, f, mix(R[rn][3], LEUCHT[rn], 0.4))
    return out


if __name__ == '__main__':
    bdir, sheets = sys.argv[1], json.load(open(sys.argv[2]))
    liste = {}
    for eid, (basis, *_r) in T.items():
        src, fw, fh = sheets[f'enemy_{basis}']
        nid = neu_id(eid)
        bauen(eid, os.path.join(bdir, '..', src), fw, fh).save(os.path.join(bdir, nid + '.png'))
        liste[nid] = f'enemy_{basis}'
    if len(sys.argv) > 3:
        json.dump(liste, open(sys.argv[3], 'w'), indent=1)
    print(len(liste))
