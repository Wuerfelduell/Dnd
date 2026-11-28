"""Rendert Varrowmouth-Karten wie WorldScene.vmTheme (Ebbe/Flut), optional mit Deko. Nur für Vorschauen."""
import json, os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SPR = os.path.join(ROOT, 'public', 'sprites')
T = 16

def _i32(v):
    v &= 0xFFFFFFFF
    return v - (1 << 32) if v >= (1 << 31) else v

def _imul(a, b):
    return _i32((a & 0xFFFFFFFF) * (b & 0xFFFFFFFF))

def hash2(x, y, seed=0):
    h = _i32(x * 374761393 + y * 668265263 + seed * 2147483647)
    h = _imul(h ^ ((h & 0xFFFFFFFF) >> 13), 1274126177)
    return (((h ^ ((h & 0xFFFFFFFF) >> 16)) & 0xFFFFFFFF)) / 4294967295

SPEC = dict(floor=[1, 1, 7], wear=[0, 6], mud=list(range(8, 16)), water=list(range(16, 32)), bridge=[36, 37],
            wallFace=[42, 43, 42, 46], door=[44], wallTop=[48, 49, 48, 49, 48, 49, 48, 50, 49, 51])
SOLID = {'wallFace', 'door', 'wallTop', 'water', 'kulisse', 'kulisseSchlick'}

def pick(keys, x, y, seed):
    return keys[int(hash2(x, y, seed) * len(keys))]

def cell(rows, x, y):
    ch = rows[y][x]
    at = lambda dx, dy: rows[y + dy][x + dx] if 0 <= y + dy < len(rows) and 0 <= x + dx < len(rows[0]) else None
    if ch == '.':
        return ('wear', pick(SPEC['wear'], x, y, 1)) if hash2(x, y, 91) > 0.88 else ('floor', pick(SPEC['floor'], x, y, 0))
    if ch == 'Y':
        return ('kulisse', pick(SPEC['floor'], x, y, 0))
    if ch == 'Z':
        return ('kulisseSchlick', 8)
    if ch == ',':
        r = hash2(x, y, 92)
        return ('mud', SPEC['mud'][1 if r > 0.97 else 5 if r > 0.93 else 4 if r > 0.89 else 0])
    if ch == '=':
        quer = at(-1, 0) == '=' or at(1, 0) == '='
        laengs = at(0, -1) == '=' or at(0, 1) == '='
        return ('bridge', SPEC['bridge'][1 if laengs and not quer else 0])
    if ch == '~':
        def nass(dx, dy):
            c = at(dx, dy)
            return c is None or c in '~=IYZ'
        m = 0
        if nass(-1, 0) and nass(0, -1) and nass(-1, -1): m |= 1
        if nass(1, 0) and nass(0, -1) and nass(1, -1): m |= 2
        if nass(1, 0) and nass(0, 1) and nass(1, 1): m |= 4
        if nass(-1, 0) and nass(0, 1) and nass(-1, 1): m |= 8
        return ('water', SPEC['water'][m or 15])
    unten = at(0, 1)
    if unten is not None and unten != 'I':
        return ('door', 44) if hash2(x, y, 94) > 0.9 else ('wallFace', pick(SPEC['wallFace'], x, y, 3))
    return ('wallTop', pick(SPEC['wallTop'], x, y, 5))

_cache = {}
def sheet(name):
    if name not in _cache:
        _cache[name] = Image.open(os.path.join(SPR, name)).convert('RGBA')
    return _cache[name]

def tile(theme, idx, flut=False):
    s = sheet(f'tilesets/{theme}_{"flut" if flut else "ebbe"}.png')
    return s.crop(((idx % 16) * T, (idx // 16) * T, (idx % 16) * T + T, (idx // 16) * T + T))

def render_ground(rows, theme, flut=False):
    w, h = len(rows[0]), len(rows)
    im = Image.new('RGBA', (w * T, h * T), (26, 28, 44, 255))
    for y in range(h):
        for x in range(w):
            g, idx = cell(rows, x, y)
            if g in SOLID:
                im.alpha_composite(tile(theme, 1, flut), (x * T, y * T))
            im.alpha_composite(tile(theme, idx, flut), (x * T, y * T))
    return im
