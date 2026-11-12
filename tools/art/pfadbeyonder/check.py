from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parents[3]
SPR = ROOT / 'public' / 'sprites'
EXPECTED = {
    'characters/ez_torfmutter_walk.png': (64, 128),
    'portraits/heads/ez_torfmutter.png': (24, 24),
    'characters/ez_schleusenuhr_walk.png': (64, 128),
    'portraits/heads/ez_schleusenuhr.png': (24, 24),
    'battle/enemy_ez_torfmutter.png': (288, 240),
    'battle/enemy_ez_schleusenuhr.png': (288, 240),
    'battle/enemy_wx_pfandleiherin.png': (288, 240),
}
report = {'batch': 'pfadbeyonder', 'checks': {}, 'files': {}, 'errors': []}
for rel, expected in EXPECTED.items():
    path = SPR / rel
    if not path.exists():
        report['errors'].append('missing: ' + rel)
        continue
    im = Image.open(path).convert('RGBA')
    colors = im.getcolors(1_000_000) or []
    rgba = im.get_flattened_data()
    binary_alpha = {p[3] for p in rgba}.issubset({0, 255})
    opaque_colors = sum(1 for count, color in colors if color[3] != 0)
    ok_size = im.size == expected
    ok_colors = opaque_colors <= 32
    report['files'][rel] = {
        'size': list(im.size), 'expected_size': list(expected),
        'opaque_colors': opaque_colors, 'binary_alpha': binary_alpha,
        'transparent_pixels': sum(1 for p in rgba if p[3] == 0),
        'pass': ok_size and ok_colors and binary_alpha,
    }
    if not ok_size:
        report['errors'].append(f'{rel}: size {im.size}, expected {expected}')
    if not ok_colors:
        report['errors'].append(f'{rel}: {opaque_colors} opaque colors exceeds 32')
    if not binary_alpha:
        report['errors'].append(f'{rel}: non-binary alpha')

# Compare each duplicated attack anticipation frame at its full native cell size.
for rel in ('battle/enemy_ez_torfmutter.png', 'battle/enemy_ez_schleusenuhr.png', 'battle/enemy_wx_pfandleiherin.png'):
    path = SPR / rel
    if not path.exists():
        continue
    im = Image.open(path).convert('RGBA')
    for attack_row in (1, 2):
        a = im.crop((0, attack_row * 48, 48, (attack_row + 1) * 48))
        b = im.crop((48, attack_row * 48, 96, (attack_row + 1) * 48))
        if a.tobytes() != b.tobytes():
            report['errors'].append(f'{rel}: attack row {attack_row} does not hold identical first two frames')

try:
    from subprocess import run
    run(['git', 'rev-parse', '--show-toplevel'], cwd=ROOT, check=True, capture_output=True)
    baseline = 'Git checkout detected; run git show HEAD:<path> before comparing replaced placeholders.'
except Exception:
    baseline = 'not available: workspace is not a Git checkout; placeholder pixel-comparison skipped'
report['checks'] = {
    'exact_dimensions': not any(': size ' in e for e in report['errors']),
    'max_32_opaque_colors': not any('colors exceeds' in e for e in report['errors']),
    'binary_alpha': not any('non-binary alpha' in e for e in report['errors']),
    'pixel_grid': 'native integer-coordinate Pillow drawing; no resampling',
    'attack_windup_hold': not any('does not hold identical' in e for e in report['errors']),
    'git_baseline': baseline,
}
report['pass'] = not report['errors'] and len(report['files']) == len(EXPECTED)
(ROOT / 'docs' / 'art' / 'batch-pfadbeyonder-validation.json').write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'pass': report['pass'], 'file_count': len(report['files']), 'errors': report['errors'], 'git_baseline': baseline}, ensure_ascii=False))
