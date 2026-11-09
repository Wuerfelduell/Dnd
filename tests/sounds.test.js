import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { footstepSound, ambienceFor, eventSound, SOUND_EVENTS } from '../src/core/sounds.js';

const manifest = JSON.parse(readFileSync(new URL('../public/audio/manifest-sfx.json', import.meta.url), 'utf8'));
const has = (id) => {
  const s = manifest.sounds[id];
  if (!s) return false;
  const file = s.variants > 1 ? `${id}_1` : id;
  return manifest.formats.every((f) => existsSync(new URL(`../public/${manifest.base}${file}.${f}`, import.meta.url)));
};

test('Paket Y: jeder Klang, den das Spiel abspielt, liegt als Datei vor', () => {
  const content = loadContent();
  const ids = new Set();
  for (const [id, m] of Object.entries(content.maps)) {
    const a = ambienceFor(id, m);
    if (a) ids.add(a);
    for (const row of m.rows ?? []) for (const ch of new Set(row)) ids.add(footstepSound(m.tiles, ch));
  }
  const samples = { quest: [{ status: 'active' }, { status: 'done' }], money: [{ delta: 5 }, { delta: 80 }], item: [{ delta: 1 }],
    artifact: [{ active: true }], vision: [true, false], wanted: [{ delta: 1, level: 1 }, { delta: 1, level: 3 }, { delta: -1, level: 0 }] };
  for (const ev of SOUND_EVENTS) for (const d of samples[ev] ?? [undefined]) ids.add(eventSound(ev, d));
  for (const id of ['ui_klick', 'kampf_start', 'boss_auftritt', 'sieg', 'niederlage', 'flucht', 'gegner_tod', 'geist_tod', 'treffer', 'treffer_krit',
    'treffer_spieler', 'parade', 'ausweichen', 'verfehlt', 'heilen', 'trank', 'nerven']) ids.add(id);
  ids.delete(null);
  for (const id of ids) assert.ok(has(id), id);
});

test('Paket Y: Schritte und Hintergrund passen zum Ort', () => {
  assert.equal(footstepSound('r_wexmoor', 'P'), 'schritt_holz');
  assert.equal(footstepSound('g_marsch', 'g'), 'schritt_schlick');
  assert.equal(footstepSound('w_altstadt', '~'), 'schritt_wasser');
  assert.equal(ambienceFor('docks', {}), 'atmo_hafen');
  assert.equal(ambienceFor('wx_vergessmoor', { tiles: 'r_vergessmoor' }), 'atmo_moor');
  assert.equal(ambienceFor('tavern_keller', { ambient: { fog: 0 } }), null);
});
