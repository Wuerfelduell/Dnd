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
  assert.ok(pickTrack(z, { map: 'ds_endbahnhof', city: 'dunscar' }).startsWith('ds_'));
  // Kapitel 3 (AY): Dunscar-Kämpfe, Bosse mit eigenem Stück auch in ihren Folgeabschnitten, Pfadprüfungen
  assert.equal(pickTrack(z, { map: 'ds_rangierwueste', city: 'dunscar', combat: { id: 'schichtgaenger', enc: { chapter: 3 } } }), 'ds_kampf');
  assert.equal(pickTrack(z, { map: 'ds_klopfbruch', city: 'dunscar', combat: { id: 'vorhauer', enc: { boss: true, chapter: 3 } } }), 'ds_boss');
  assert.equal(pickTrack(z, { map: 'ds_letzter_bahnsteig', city: 'dunscar', combat: { id: 'k3o_gallowmere_phase2', enc: { boss: true, chapter: 3 } } }), 'ds_gallowmere');
  assert.equal(pickTrack(z, { map: 'ds_bruchstufen', city: 'dunscar', combat: { id: 'k3p_brueckenpresser', enc: { chapter: 3 } } }), 'ds_pruefung');
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

test('CL: Calderwick, Briarholt (kalt/warm), Landstraße, Bosse, Feste und der Kettlegater Winter haben ihre Stücke', () => {
  assert.equal(pickTrack(z, { map: 'cw_gleisfuss', city: 'calderwick', playTime: 0 }), 'cw_terrassen_tag');
  assert.equal(pickTrack(z, { map: 'cw_gleisfuss', city: 'calderwick', playTime: NIGHT }), 'cw_terrassen_nacht');
  assert.equal(pickTrack(z, { map: 'bh_kutschenhof', city: 'briarholt' }), 'bh_kalt');
  assert.equal(pickTrack(z, { map: 'bh_kutschenhof__warm', city: 'briarholt' }), 'bh_warm');
  assert.equal(pickTrack(z, { map: 'bh_buegelraum', city: 'briarholt' }), 'bh_buegelraum');
  assert.equal(pickTrack(z, { map: 'reise_landstrasse', city: 'calderwick', playTime: 0 }), 'ls_fahrt_tag');
  assert.equal(pickTrack(z, { map: 'cw_setzergasse', city: 'calderwick', combat: { id: 'vg_cw_letternlaeufer', enc: { chapter: 4 } } }), 'cw_kampf');
  assert.equal(pickTrack(z, { map: 'cw_alte_setzerei', city: 'calderwick', combat: { id: 'vg_cw_boss_bleisammler_phase2', enc: { boss: true, chapter: 4 } } }), 'cw_boss');
  assert.equal(pickTrack(z, { map: 'bh_wurzelkammer__warm', city: 'briarholt', combat: { id: 'bha_aussaat_schwarm', enc: { boss: true } } }), 'bh_kampf');
  assert.equal(pickTrack(z, { map: 'reise_landstrasse', city: 'calderwick', combat: { id: 'vg_all_zollhund', enc: { chapter: 4 } } }), 'ls_ueberfall');
  assert.equal(pickTrack(z, { map: 'reise_landstrasse', city: 'calderwick', combat: { id: 'vg_all_boss_schlafkutsche_phase2', enc: { boss: true } } }), 'ls_schlafkutsche');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: 0, fest: 'laternennacht' }), 'fest_laternennacht');
  assert.equal(pickTrack(z, { map: 'ashgrove', city: 'kettlegate', playTime: 0, fest: 'laternennacht' }), 'kettlegate_tag', 'abseits der Festplätze die Stadt');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: 0, season: 'winter' }), 'kettlegate_tag_winter');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: NIGHT, season: 'winter' }), 'kettlegate_nacht');
  for (const id of ['fest_salzsegen', 'fest_schichtwechsel', 'saison_herbst', 'saison_winter', 'saison_fruehling', 'saison_sommer']) assert.ok(tracks.has(id), id);
});
