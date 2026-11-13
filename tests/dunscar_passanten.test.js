import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadContent } from './helpers.js';
import { VIERTEL_ART, DICHTE, EREIGNISSE, GEMURMEL, tagesabschnitt, alleTexte, gemurmelFuer } from '../src/data/dunscarPassanten.js';
import { RASTER } from '../src/data/dunscarKulisse.js';
import { DAY_NIGHT_SECONDS } from '../src/core/Clock.js';

const content = loadContent();

test('Passanten: alle Dunscar-Viertel sind markiert, Gefahrengebiete nicht', () => {
  for (const [id, art] of Object.entries(VIERTEL_ART)) {
    assert.ok(content.maps[id], id);
    assert.equal(content.maps[id].passanten?.art, art, id);
    assert.ok(DICHTE[art], art);
  }
  for (const id of ['ds_schlackengrube', 'ds_klopfbruch', 'ds_rangierwueste']) assert.equal(content.maps[id]?.passanten, undefined, id);
});

test('Passanten: Straßenkreuz und Straßenenden sind begehbar', () => {
  for (const id of Object.keys(VIERTEL_ART)) {
    const m = content.maps[id];
    const floor = (x, y) => /[.swg]/.test(m.rows[y]?.[x] ?? '');
    for (let x = 1; x < RASTER.W - 1; x++) for (const y of RASTER.strasseY) assert.ok(floor(x, y), `${id} Straße ${x},${y}`);
  }
});

test('Passanten: Tagesablauf Morgen, Mittag, Abend, Nacht', () => {
  assert.equal(tagesabschnitt(0), 'morgen');
  assert.equal(tagesabschnitt(DAY_NIGHT_SECONDS * 0.5), 'mittag');
  assert.equal(tagesabschnitt(DAY_NIGHT_SECONDS * 0.9), 'abend');
  assert.equal(tagesabschnitt(DAY_NIGHT_SECONDS * 1.5), 'nacht');
  for (const e of Object.values(EREIGNISSE)) for (const w of e.wann) assert.ok(['morgen', 'mittag', 'abend', 'nacht'].includes(w));
});

test('Passanten: bedingtes Gemurmel folgt dem Spielstand', () => {
  const ohne = gemurmelFuer({ meets: () => false }, 'markt', 'mittag');
  assert.equal(ohne.bedingt.length, 0);
  assert.ok(ohne.normal.includes(GEMURMEL.markt[0]) && ohne.normal.includes(GEMURMEL.mittag[0]));
  const gesucht = gemurmelFuer({ meets: (c) => c.requires_wanted === 1 }, 'bahn', 'nacht');
  assert.deepEqual(gesucht.bedingt, ['Ist das nicht die Gestalt vom Aushang?']);
});

test('Passanten: jeder Text steht im englischen Wörterbuch, alle Töne gibt es', () => {
  const en = JSON.parse(fs.readFileSync('src/i18n/en/kapitel3_passanten.json', 'utf8'));
  for (const t of alleTexte()) assert.ok(en[t], `fehlt im Wörterbuch: ${t}`);
  const sfx = ['manifest-sfx.json', 'manifest-sfx2.json'].map((f) => JSON.parse(fs.readFileSync(`public/audio/${f}`, 'utf8')).sounds);
  for (const id of [...Object.values(EREIGNISSE).map((e) => e.ton).filter(Boolean), 'zug_pfeife', 'tuer_zu']) assert.ok(sfx.some((m) => m[id] && !m[id].loop), id);
});
