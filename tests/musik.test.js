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

// --- Z/AY/CL: Ereignisstücke (Stinger und Lagen), die keine Karte und kein Kampf auslöst -------------------------
import { endingCue, arrivalCue, flagCue, combatCue, modeFor, wireMusicCues } from '../src/core/musicCues.js';
import { MusicDirector } from '../src/core/MusicDirector.js';

test('Musik: Stinger schlägt alles außer dem Titel, Lagen schlagen die Karte', () => {
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: 0, stinger: 'fall_geloest' }), 'fall_geloest');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: 0, stinger: 'sieg', combat: { id: 'x', enc: {} } }), 'sieg');
  assert.equal(pickTrack(z, { title: true, stinger: 'sieg' }), 'titel');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: 0, stinger: 'gibt_es_nicht' }), 'kettlegate_tag');
  assert.equal(pickTrack(z, { map: 'ds_kalkmarkt', city: 'dunscar', playTime: 0, mode: 'horchen' }), 'ds_horchen');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: 0, mode: 'treffen' }), 'treffen');
  assert.equal(pickTrack(z, { map: 'wx_altstadt', city: 'wexmoor', playTime: 0, mode: 'streife' }), 'wexmoor_streife');
  assert.equal(pickTrack(z, { map: 'altmarkt', city: 'kettlegate', playTime: 0, mode: 'streife', combat: { id: 'x', enc: {} } }), 'kampf');
});

test('Musik: jedes Ereignisstück der Manifeste hat einen Auslöser', () => {
  const content = loadContent();
  const cues = new Set();
  for (const [id, e] of Object.entries(content.endings)) { const c = endingCue(id, e.honor ?? 0); if (c) cues.add(c); }
  for (const m of ['cw_gleisfuss', 'bh_kutschenhof', 'ds_endbahnhof']) cues.add(arrivalCue(m, new Set()));
  for (const f of ['cwa_abgleich1_oeffentlich', 'bha_ventil_tee_offen']) cues.add(flagCue(f).cue);
  cues.add(combatCue('won', { boss: true })); cues.add(combatCue('fled'));
  for (const m of [{ modal: 'signal' }, { auction: true }, { wanted: 1, police: true, outdoor: true }]) cues.add(modeFor(m));
  for (const s of ['herbst', 'winter', 'fruehling', 'sommer']) cues.add(`saison_${s}`);
  for (const f of ['laternennacht', 'salzsegen', 'schichtwechsel']) cues.add(`fest_${f}`);
  cues.add('ritual'); cues.add('fest_feuerwerk'); cues.add('feuerwerk'); cues.add('ls_ereignis'); cues.add('geistsicht'); cues.add('cw_wetherby'); cues.add('bh_greavesend'); cues.add('titel'); cues.add('kettlegate_winter_tag'); cues.add('bh_zustand_kalt'); cues.add('bh_zustand_warm'); // Verhöre über ihre Karten, Reiseereignis über den Dialog, Feuerwerk über die Festnacht
  const unused = Object.keys(z.ereignisse).filter((k) => !cues.has(k));
  assert.deepEqual(unused, []);
  for (const c of cues) assert.ok(z.ereignisse[c] || tracks.has(c), c);
  assert.equal(endingCue('k2_rein', 45), 'abspann_k2');
  assert.equal(endingCue('c3_holt', -12), 'ende_dunkel');
  assert.equal(endingCue('c4_early', 10), null);
  assert.equal(combatCue('won', {}), null);
  assert.equal(modeFor({ wanted: 1, police: true, outdoor: false }), null);
  assert.deepEqual(flagCue('cwa_abgleich2_done'), { clear: 'cw_abgleich' });
});

test('Musik: MusicDirector.cue legt ein Stück für begrenzte Zeit vor die Lage', () => {
  const d = new MusicDirector({ audio: null, base: './' });
  let t = 100;
  d.now = () => t;
  const played = [];
  d.synth = { zuordnung: z, tracks: new Map([...tracks].map((id) => [id, { duration: 10, score: { loop: false } }])), spiele: async (id) => { played.push(id); } };
  const ctx = { map: 'altmarkt', city: 'kettlegate', playTime: 0 };
  d.update(ctx);
  d.cue('sieg');
  d.update(ctx);
  t += 5; d.update(ctx);
  t += 7; d.update(ctx);
  assert.deepEqual(played, ['kettlegate_tag', 'sieg', 'kettlegate_tag']);
  d.cue('cw_abgleich', 60); d.update(ctx); d.clearCue('cw_abgleich'); d.update(ctx);
  assert.deepEqual(played.slice(3), ['cw_abgleich', 'kettlegate_tag']);
  // wireMusicCues: Ende, Ankunft, Flag, Ritual, Jahreszeit
  const handlers = {}; const cues = [];
  const state = { on: (ev, fn) => { handlers[ev] = fn; }, season: () => 'herbst', content: { endings: { c1_good: { honor: 20 }, bha_wahl: { honor: 3 } } } };
  wireMusicCues(state, { cue: (id, s) => cues.push([id, s ?? null]), clearCue: (id) => cues.push(['clear', id]) });
  handlers.ending('c1_good'); handlers.ending('bha_wahl'); handlers.travel('cw_gleisfuss'); handlers.travel('cw_setzergasse');
  handlers.fact({ id: 'bha_ventil_tee_offen', status: true }); handlers.fact({ id: 'cwa_abgleich1_done', status: true });
  handlers.ritual({}); handlers.season({ season: 'herbst' }); handlers.season({ season: 'winter' });
  assert.deepEqual(cues, [['fall_geloest', null], ['bh_ende_wahl', null], ['cw_ankunft', 40], ['bh_leitungen', 45], ['clear', 'cw_abgleich'], ['ritual', 25], ['saison_winter', null]]);
});
