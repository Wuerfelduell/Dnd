import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pickTrack, MUSIC_MANIFESTS, DAY_NIGHT_SECONDS } from '../src/core/MusicDirector.js';
import { loadContent } from './helpers.js';

// Paket Z: die Musik-Zuordnung aller Manifeste, wie MusicSynth.ladeManifest sie zusammenführt
const content = loadContent();
const manifests = MUSIC_MANIFESTS.map((m) => JSON.parse(readFileSync(new URL(`../public/${m}`, import.meta.url), 'utf8')));
const tracks = new Set(manifests.flatMap((m) => Object.keys(m.tracks)));
const merge = (a, b) => { for (const [k, v] of Object.entries(b)) { if (v && typeof v === 'object' && !Array.isArray(v)) { if (!a[k] || typeof a[k] !== 'object') a[k] = {}; merge(a[k], v); } else a[k] = v; } return a; };
const z = manifests.reduce((acc, m) => merge(acc, m.zuordnung ?? {}), {});
const NIGHT = DAY_NIGHT_SECONDS + 1;

test('Musik: jede Zuordnung zeigt auf ein geladenes Stück und eine echte Karte', () => {
  for (const [map, entry] of Object.entries(z.maps)) {
    assert.ok(content.maps[map], `Karte ${map}`);
    for (const id of typeof entry === 'string' ? [entry] : Object.values(entry)) assert.ok(tracks.has(id), `${map}: ${id}`);
  }
  for (const id of [...Object.values(z.kampf), ...Object.values(z.ereignisse)]) assert.ok(tracks.has(id), id);
});

test('Musik: Titel, Karte mit Tag und Nacht, Stadt, Geistsicht und Kampf', () => {
  assert.equal(pickTrack(z, { title: true }), 'titel');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: 0 }), 'kettlegate_tag');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: NIGHT }), 'kettlegate_nacht');
  assert.equal(pickTrack(z, { map: 'revier', city: 'kettlegate' }), 'revier');
  assert.equal(pickTrack(z, { map: 'wx_leuchtturm', city: 'wexmoor' }), 'leuchtturm');
  assert.equal(pickTrack(z, { map: 'ds_endbahnhof', city: 'dunscar' }), 'ermittlung');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', vision: true }), 'geistsicht');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', combat: { id: 'taschendieb', enc: {} } }), 'kampf');
  assert.equal(pickTrack(z, { map: 'crypt', city: 'kettlegate', combat: { id: 'moorleiche', enc: {} } }), 'kampf_okkult');
  assert.equal(pickTrack(z, { map: 'uhrturm', city: 'kettlegate', combat: { id: 'x', enc: { boss: true } } }), 'boss');
  assert.equal(pickTrack(z, { map: 'wx_leuchtturm', city: 'wexmoor', combat: { id: 'leuchtfeuer', enc: { boss: true } } }), 'boss_wexmoor');
  // Jede Karte des Spiels bekommt irgendein vorhandenes Stück
  for (const [id, m] of Object.entries(content.maps)) {
    for (const playTime of [0, NIGHT]) assert.ok(tracks.has(pickTrack(z, { map: id, city: m.city ?? 'kettlegate', playTime })), id);
  }
});
