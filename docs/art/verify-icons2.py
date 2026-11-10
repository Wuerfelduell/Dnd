#!/usr/bin/env python3
"""Verify the complete BB delivery. Run from any directory; requires Pillow."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / 'public/sprites'
PATHS = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel',
         'sq_waage', 'sq_moor', 'sq_uhr']
ITEMS = '''k2a_tinte_abschrift k2a_bittere_mittel_abschrift k2a_hafenrecht_abschrift k2a_letztes_bild_abschrift
k2g_kerbstaub k2g_moorharz k2g_rufpastille k2g_schreinbruehe k2g_zeugenklammer k2g_nachhallspule
k2o_amtsschluessel k2v_drucksplitter k2v_messingknopf k2v_fahrkartenhaelfte k2v_saumbrief k2v_tonnenholz
k3o_kalkpastille k3o_schichttee k3o_filzverband k3o_ventilspan k3o_kreidestaub k3o_rufwachs
k3o_schraubenzahn k3o_schlagkern k3o_trichterglas k3o_schichtknopf k3o_leitungsklemme k3o_stillkiesel
k3o_stillring k3o_prueflinse k3a_signalgeraet k3a_depotmarke k3a_leitungspruefer k3a_bahnkarte
k3a_werkzeuge k3a_aufsichtsmarke k3n_brief_aus_wexmoor_brief_rein k3n_brief_aus_wexmoor_brief_moor
k3n_brief_aus_wexmoor_brief_lichtmeister k3n_brief_aus_wexmoor_brief_meer'''.split()
LARGE = '''k2g_rufpastille k2g_schreinbruehe k2g_zeugenklammer k2g_nachhallspule
k3o_stillring k3o_prueflinse k3a_signalgeraet k3o_kalkpastille k3o_schichttee k3o_filzverband'''.split()

def verify():
    expected = {f'items/{id}.png': 16 for id in ITEMS}
    expected.update({f'items/32/{id}.png': 32 for id in LARGE})
    for path in PATHS:
        for seq in range(9 if path.startswith('sq_') else 4, 0, -1):
            for kind in ['trank', 'formel']:
                id = f'{kind}_{path}_{seq}'
                expected[f'items/{id}.png'] = 16
                if kind == 'trank':
                    expected[f'items/32/{id}.png'] = 32
    assert len(expected) == 215
    manifest = json.loads((SPRITES / 'manifest-icons2.json').read_text())
    generation = json.loads((ROOT / 'docs/art/batch-icons2-generation.json').read_text())
    entries = manifest['assets']
    assert len(entries) == 215, 'Expected 215 manifest entries'
    assert len({a['id'] for a in entries}) == 215, 'Duplicate manifest IDs'
    assert {a['file'] for a in entries} == set(expected), 'Missing or unexpected files'
    jobs = generation['jobs']
    assert len(jobs) == len({j['id'] for j in jobs}) == 150
    assert {f for j in jobs for f in j['outputFiles']} == set(expected)
    palette = {tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
    assert len(palette) <= 32
    seen = {}; used = set()
    for entry in entries:
        file = entry['file']; size = expected[file]
        assert (SPRITES / file).is_file(), file
        with Image.open(SPRITES / file) as image:
            assert image.format == 'PNG', file
            assert image.size == (size, size), (file, image.size)
            assert image.mode in ('RGBA', 'P'), (file, image.mode)
            rgba = image.convert('RGBA')
            pixels = list(rgba.getdata())
            assert {p[3] for p in pixels} == {0, 255}, f'{file}: alpha must be binary and include transparency'
            visible = {p[:3] for p in pixels if p[3]}
            assert visible <= palette, f'{file}: color outside shared palette'
            assert 2 <= len(visible) <= 32, (file, len(visible))
            used |= visible
            bbox = rgba.getbbox()
            assert bbox and bbox[0] > 0 and bbox[1] > 0 and bbox[2] < size and bbox[3] < size, f'{file}: no safe margin'
            digest = hashlib.sha256(rgba.tobytes()).hexdigest()
            assert (size, digest) not in seen, f'Duplicate artwork: {file} / {seen.get((size, digest))}'
            seen[size, digest] = file
        assert entry['width'] == entry['height'] == entry['frameWidth'] == entry['frameHeight'] == size, file
        assert entry['columns'] == entry['rows'] == 1, file
        assert entry['animations']['idle']['frames'] == [0], file
    assert len(used) <= 32
    for job in jobs:
        assert job['prompt'] and job['references'] and job['sourceSha256'] and job['sourceCropBox'], job['id']
        assert len(job['outputFiles']) == len(job['sizes']), job['id']
    with Image.open(ROOT / 'docs/art/preview-icons2.png') as preview:
        assert preview.width >= 1000 and preview.height >= 1000
    print(f'PASS: 150 items, 150 small + 65 large PNGs; {len(used)} shared colors; binary alpha; unique artwork; manifest/provenance/preview complete.')

if __name__ == '__main__':
    verify()
