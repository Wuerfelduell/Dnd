import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { footstepSound, ambienceFor, eventSound, SOUND_EVENTS } from '../src/core/sounds.js';

// Paket Y (manifest-sfx.json) und CM (manifest-sfx2.json) werden wie in core/Audio.js in einen Topf geladen; CM gewinnt bei gleicher Id
const manifests = ['sfx', 'sfx2'].map((k) => JSON.parse(readFileSync(new URL(`../public/audio/manifest-${k}.json`, import.meta.url), 'utf8')));
const has = (id) => {
  const m = [...manifests].reverse().find((x) => x.sounds[id]);
  if (!m) return false;
  const s = m.sounds[id];
  const file = s.variants > 1 ? `${id}_1` : id;
  return m.formats.every((f) => existsSync(new URL(`../public/${m.base}${file}.${f}`, import.meta.url)));
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
    artifact: [{ active: true }], vision: [true, false], wanted: [{ delta: 1, level: 1 }, { delta: 1, level: 3 }, { delta: -1, level: 0 }],
    relation: [{ delta: 1 }, { delta: -1 }], bond: [{ companion: true, delta: 1 }, { companion: true, delta: -1 }], gathering: [{ open: true }], signal_route: [{ ok: true }, { kind: 'alarm' }] };
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
  // CM: Calderwick, Briarholt (kalt unter Reif, warm wie das Glashaus oder still), Landstraße
  assert.equal(ambienceFor('cw_roehrenhof', {}), 'atmo_rohrpost');
  assert.equal(ambienceFor('bh_kutschenhof', {}), 'atmo_frost');
  assert.equal(ambienceFor('bh_kutschenhof__warm', {}), null);
  assert.equal(ambienceFor('bh_glasgaerten__warm', {}), 'atmo_glashaus');
  assert.equal(ambienceFor('reise_landstrasse', {}), 'atmo_hochebene');
});

test('CM: alle 120 Klänge des zweiten Pakets liegen als Datei vor, die Zugereignisse und Beziehungen klingen', () => {
  for (const id of Object.keys(manifests[1].sounds)) assert.ok(has(id), id);
  assert.equal(eventSound('season'), 'saison_wechsel');
  assert.equal(eventSound('newspaper', { id: 'x' }), 'ui_zeitung');
  assert.equal(eventSound('relation', { delta: 2 }), 'beziehung_hoch');
  assert.equal(eventSound('bond', { companion: false, delta: 1 }), null);
  assert.equal(manifests[1].sounds.auktion_hammer.variants, 2); // Konflikt mit Y: der CM-Eintrag mit zwei Varianten gilt
});
