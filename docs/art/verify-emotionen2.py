#!/usr/bin/env python3
"""Validate AK exports and build the old/new contact sheet. Requires Pillow."""
import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SPRITES = ROOT / 'public/sprites'


def main():
    manifest = json.loads((SPRITES / 'manifest-emotionen2.json').read_text())
    spec = json.loads((HERE / 'batch-emotionen2-generation.json').read_text())
    expected = re.findall(r'\| `([^`]+)` \| `([^`]+\.png)` \|', (HERE / 'codex_AK_emotionen.md').read_text())
    assert len(expected) == 32
    assert [a['characterId'] for a in manifest['assets']] == [i for i, _ in expected]
    assert len(spec['jobs']) == len(manifest['assets']) == 32
    colors = {tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
    assert len(colors) <= 32
    report = []
    preview = Image.new('RGB', (1160, 60 + 32 * 138), '#171e29')
    draw = ImageDraw.Draw(preview)
    font = ImageFont.load_default(size=15)
    draw.text((12, 12), 'AK / emotionen2 — 32 Figuren, 128 neue Ausdrücke', font=font, fill='#eee2c5')
    draw.text((120, 35), 'BISHER — Reihenfolge der Originaldatei', font=font, fill='#b4ac91')
    for i, label in enumerate(['Wütend', 'Traurig', 'Nachdenklich', 'Entschlossen']):
        draw.text((644 + 128 * i, 35), label, font=font, fill='#eee2c5')
    for row, (a, j, (identifier, ref)) in enumerate(zip(manifest['assets'], spec['jobs'], expected)):
        assert j['id'] == identifier
        assert a['file'] == f'portraits/AK_{identifier}_emotions2.png'
        assert a['reference'] == f'portraits/{ref}'
        assert a['emotions'] == ['angry', 'sad', 'thoughtful', 'determined']
        assert a['frames'] == dict(zip(a['emotions'], range(4)))
        assert [a[k] for k in ['width', 'height', 'frameWidth', 'frameHeight', 'columns', 'rows']] == [256, 64, 64, 64, 4, 1]
        old_path = SPRITES / a['reference']
        assert hashlib.sha256(old_path.read_bytes()).hexdigest() == j['referenceSha256'], identifier
        im = Image.open(SPRITES / a['file'])
        assert im.mode == 'P' and im.size == (256, 64), identifier
        rgba = im.convert('RGBA')
        assert rgba.getchannel('A').getextrema() == (255, 255), identifier
        visible = set(im.convert('RGB').getdata())
        assert visible <= colors and len(visible) <= 32, identifier
        frames = [rgba.crop((64 * i, 0, 64 * (i + 1), 64)) for i in range(4)]
        assert len({f.tobytes() for f in frames}) == 4, identifier
        assert all(len(f.getcolors(4096)) > 8 for f in frames), identifier
        face_hashes = {f.crop((12, 14, 54, 53)).tobytes() for f in frames}
        assert len(face_hashes) == 4, identifier
        assert len(j['sourceBoxes']) == 4
        for box in j['sourceBoxes']:
            assert 0 <= box[0] < box[2] <= j['sourceSize'][0]
            assert 0 <= box[1] < box[3] <= j['sourceSize'][1]
        y = 60 + row * 138
        draw.text((8, y + 52), identifier, font=font, fill='#eee2c5')
        preview.paste(Image.open(old_path).convert('RGB').resize((512, 128), Image.Resampling.NEAREST), (120, y))
        preview.paste(im.convert('RGB').resize((512, 128), Image.Resampling.NEAREST), (644, y))
        draw.line((0, y + 132, 1159, y + 132), fill='#425360')
        report.append({'characterId': identifier, 'size': list(im.size), 'colors': len(visible),
                       'distinctFrames': 4, 'opaque': True, 'referenceUnchanged': True,
                       'sha256': hashlib.sha256((SPRITES / a['file']).read_bytes()).hexdigest()})
    preview.save(HERE / 'AK_vorschau.png', optimize=True)
    result = {'batch': 'emotionen2', 'passed': True, 'sheets': 32, 'expressions': 128,
              'paletteColors': len(colors), 'assets': report,
              'scope': 'Technical validation; identity, expressions and framing reviewed visually; runtime integration pending.'}
    (HERE / 'validation-emotionen2.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print('PASS: 32 sheets, 128 distinct frames, dimensions, common palette, opaque alpha, reference hashes, source boxes.')


if __name__ == '__main__':
    main()
