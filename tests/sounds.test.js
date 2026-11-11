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

// --- Y/CM vollständig eingebaut: jede gelieferte Id hat eine Stelle im Spiel ---------------------------------
import { weatherLoop, randomSoundsFor, sektenSound, flagSound, uiSound, worldSound, skillSound, combatSound, variantFor, wireSounds } from '../src/core/sounds.js';

const sourceOf = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');
const usedText = ['core/sounds.js', 'world/WorldScene.js', 'world/CombatScene.js', 'world/Patrols.js', 'ui/Ui.js'].map(sourceOf).join('\n');

test('Y/CM: jede Id aus beiden Manifesten wird irgendwo im Spiel angesprochen', () => {
  const missing = [];
  for (const m of manifests) for (const id of Object.keys(m.sounds)) if (!new RegExp(`(^|[^a-z0-9_])${id}([^a-z0-9_]|$)`).test(usedText)) missing.push(id);
  assert.deepEqual(missing, []);
});

test('CM: Schritte nach Jahreszeit und Stadt, Wetter- und Festschleifen, Zufallsklänge', () => {
  assert.equal(footstepSound('w_altstadt', 'g', { season: 'winter', outdoor: true }), 'schritt_schnee');
  assert.equal(footstepSound('w_altstadt', 'g', { season: 'herbst', outdoor: true }), 'schritt_laub');
  assert.equal(footstepSound('g_kraterwald', 'g', { season: 'winter', outdoor: false }), 'schritt_gras');
  assert.equal(footstepSound('w_altstadt', '~', { season: 'winter', outdoor: true }), 'schritt_wasser');
  assert.equal(footstepSound('ds_stadt', 'g'), 'schritt_kalk');
  assert.equal(footstepSound('cw_terrassen', 'P'), 'schritt_terrasse');
  assert.equal(footstepSound('bh_glasgaerten_warm', 'g'), 'schritt_glas');
  assert.equal(footstepSound('ds_zug', '.'), 'schritt_metall');
  assert.equal(weatherLoop({ mapId: 'altmarkt', outdoor: true, season: 'winter' }), 'saison_schnee');
  assert.equal(weatherLoop({ mapId: 'altmarkt', outdoor: false, season: 'winter' }), null);
  assert.equal(weatherLoop({ mapId: 'altmarkt', outdoor: true, season: 'herbst', fest: 'laternennacht' }), 'fest_menge');
  assert.equal(weatherLoop({ mapId: 'tavern', outdoor: false, season: 'herbst', fest: 'laternennacht' }), 'fest_lachen');
  assert.equal(weatherLoop({ mapId: 'ds_kalkmarkt', outdoor: true, season: 'sommer' }), 'saison_hitze');
  assert.equal(weatherLoop({ mapId: 'wx_torfstich', outdoor: true, season: 'sommer' }), 'atmo_regen');
  assert.equal(ambienceFor('wx_leuchtturm', {}), 'leuchtfeuer');
  assert.equal(ambienceFor('ds_nachtzug_lok', {}), 'zug_fahrt');
  const content = loadContent();
  for (const [id, m] of Object.entries(content.maps)) {
    for (const r of randomSoundsFor(id, m, { night: true, fest: 'laternennacht' })) { assert.ok(has(r.id), `${id}: ${r.id}`); if (r.then) assert.ok(has(r.then[0]), r.then[0]); }
    for (const season of ['herbst', 'winter', 'fruehling', 'sommer']) {
      const w = weatherLoop({ mapId: id, outdoor: true, season, fest: 'schichtwechsel' });
      if (w) assert.ok(has(w), w);
      for (const row of m.rows ?? []) for (const ch of new Set(row)) assert.ok(has(footstepSound(m.tiles, ch, { season, outdoor: true })), `${id}/${season}/${ch}`);
    }
  }
  assert.ok(randomSoundsFor('altmarkt', content.maps.altmarkt, { night: true, fest: 'laternennacht' }).some((r) => r.id === 'fest_feuerwerk_start'));
  assert.ok(randomSoundsFor('wx_torfstich', content.maps.wx_torfstich).some((r) => r.id === 'frosch'));
});

test('Y/CM: Ereignisse, Sekten, Flags, Oberfläche, Welt und Kampf zeigen auf vorhandene Klänge', () => {
  assert.equal(eventSound('party', { active: true, joined: true }), 'koop_beitritt');
  assert.equal(eventSound('party', { active: true, joined: false }), null);
  assert.equal(eventSound('ending', { honor: 20 }), 'ui_ende_hell');
  assert.equal(eventSound('ending', { honor: -5 }), 'ui_ende_dunkel');
  assert.equal(eventSound('lostcontrol', { corrupted: ['x'] }), 'kontrolle_tentakel');
  assert.equal(eventSound('lostcontrol', { corrupted: [] }), 'kontrolle_verlust');
  assert.equal(eventSound('item', { delta: 1, rare: true }), 'ui_item_selten');
  assert.equal(eventSound('money', { delta: 12, reason: 'lohn' }), 'ds_lohntuete');
  assert.equal(eventSound('season', { season: 'herbst', fest: true }), 'ui_fest_banner');
  assert.equal(eventSound('unruhe', { rising: true }), 'artefakt_unruhe');
  assert.equal(eventSound('claim_forfeit', {}), 'koop_anspruch_streit');
  assert.equal(sektenSound({ kind: 'stufe', stufe: 2, prev: 1 }), 'sk_stufe_hoch');
  assert.equal(sektenSound({ kind: 'stufe', stufe: 0, prev: 1 }), 'sk_stufe_runter');
  assert.equal(sektenSound({ kind: 'start', ev: { art: 'spur', kult: 'sk_asche' } }), 'sk_asche_kreis');
  assert.equal(sektenSound({ kind: 'start', ev: { art: 'ueberfall', kult: 'sk_flut' } }), 'sk_ueberfall');
  assert.equal(sektenSound({ kind: 'ende', ev: { art: 'schrein' } }), 'sk_schrein_abbau');
  assert.equal(flagSound('bha_ventil_tee_offen'), 'bh_ventil_rast');
  assert.equal(variantFor('bh_ventil_rast', { status: true }), 3);
  assert.equal(flagSound('cwa_anker_kueche_noel'), 'cw_anker_setzen');
  assert.equal(flagSound('cwa_abgleich3_done'), 'cw_abgleich_rueckweg');
  assert.equal(flagSound('irgendwas'), null);
  assert.equal(uiSound('travel'), 'ui_karte');
  assert.equal(uiSound('notebook', 'close'), 'ui_schliessen');
  assert.equal(uiSound('dialogue'), null);
  assert.equal(worldSound('door', { to: 'wx_zelle' }), 'tuer_metall');
  assert.equal(worldSound('door', { to: 'altmarkt' }), 'tuer_auf');
  assert.equal(worldSound('wear', { slot: 'hut' }), 'ausruestung_hut');
  assert.equal(worldSound('travel', { direct: true, to: 'ds_endbahnhof' }), 'ds_zug_einfahrt');
  assert.equal(worldSound('travel', { mode: 'sicher' }), 'kutsche');
  assert.equal(skillSound({ hits: 1, burn: [5, 3] }, 'laterne'), 'feuer');
  assert.equal(skillSound({ hits: 1 }, 'kessel'), 'eis_salz');
  assert.equal(skillSound({ hits: 0, heal: 10 }, 'kessel'), null);
  assert.equal(skillSound({ hits: 0, stun: true }, 'echo'), 'debuff');
  assert.equal(combatSound('start', { id: 'enemy_sk_asche_haupt' }), 'sk_ueberfall');
  assert.equal(combatSound('start', { id: 'holt_training' }), 'kampf_start');
  assert.equal(combatSound('over', { id: 'starling_stern', outcome: 'won' }), 'starling_ende');
  assert.equal(combatSound('defeated', { sheet: 'schichtgaenger', human: true }), 'ds_schichtgaenger_fall');
  // Alle Zweige der Zuordnungen liegen als Datei vor
  const ids = [
    ...['travel', 'personmap', 'notebook', 'brew', 'shop', 'vault', 'auction', 'storage', 'pause', 'signal', 'gift', 'loot', 'sonst'].map((k) => uiSound(k)),
    ...['close', 'tab', 'page', 'dialog', 'error', 'ok', 'save', 'write', 'locked', 'chapter', 'epilog', 'bestiary', 'wegweiser', 'scroll', 'season', 'heavy', 'hover'].map((w) => uiSound('x', w)),
    ...['rest', 'loot', 'storage', 'read', 'locked', 'disguise', 'arrest', 'spotted', 'whistle', 'lantern', 'hammer', 'artisan', 'equip', 'candle'].map((a) => worldSound(a)),
    worldSound('door', { to: 'ds_speisewagen' }), worldSound('door', { to: 'cw_gleisfuss' }), worldSound('train', { arrive: true }), worldSound('train'),
    worldSound('brew', { ok: true }), worldSound('brew', { ok: false }), worldSound('ritual', { ok: true }), worldSound('ritual', { ok: false }),
    worldSound('gift', { ok: true }), worldSound('gift', { ok: false }), worldSound('wear', { slot: 'mantel' }), worldSound('wear', { slot: 'amulett' }),
    worldSound('bid', { ok: true }), worldSound('craft', { ok: true }), worldSound('travel', { city: 'wexmoor' }), worldSound('use', { id: 'verband' }),
    ...['telegraph'].map((e) => combatSound(e)), combatSound('act', { action: 'taunt' }), combatSound('act', { action: 'heal' }), combatSound('star'),
    combatSound('start', { id: 'fs_boxer_1' }), combatSound('start', { id: 'vg_all_boss_schlafkutsche' }), combatSound('start', { id: 'starling_stern' }), combatSound('start', { id: 'x', boss: true }),
    combatSound('hit', { id: 'fs_boxer_1', kind: 'blunt' }), combatSound('defeated', { human: false }), combatSound('defeated', { human: true }),
    ...['won', 'lost', 'fled', 'escaped'].map((o) => combatSound('over', { outcome: o })),
    ...['laterne', 'kessel', 'schluessel', 'echo', 'maske', 'faden', 'sq_waage', 'sq_moor', 'sq_uhr'].flatMap((p) => [skillSound({ hits: 1 }, p), skillSound({ hits: 1, holy: true }, p), skillSound({ hits: 0, weaken: true }, p)]),
    ...['sk_asche', 'sk_flut', 'sk_chor'].flatMap((kult) => ['spur', 'werbung', 'zeichen_am_haus', 'abwerbung', 'sabotage', 'schrein', 'ueberfall'].map((art) => sektenSound({ kind: 'start', ev: { art, kult } }))),
    sektenSound({ kind: 'ende', ev: { art: 'schrein' } }), sektenSound({ kind: 'ende', ev: { art: 'abwerbung' } }),
    ...['bha_ventil_tee_offen', 'bha_ventil_tee_leer', 'bha_ventil_klappe', 'cwa_anker_x', 'cwa_abgleich1_done', 'cwa_rohrpostsiegel', 'ls_zoll', 'ls_x', 'fs_laterne_x', 'fs_feuerwerk_x'].map(flagSound),
  ].filter(Boolean);
  for (const id of ids) assert.ok(has(id), id);
});

test('Y/CM: wireSounds hängt Partei, Enden, Unruhe und Folgeklänge an den Zustand', () => {
  const handlers = {};
  const played = [];
  const state = { on: (ev, fn) => { handlers[ev] = fn; }, hasP2: () => false, unruhe: 0, flags: new Set(['cwa_anker_a', 'cwa_anker_b', 'cwa_anker_c']), content: { endings: { c1_good: { honor: 20 } } }, item: (id) => ({ kind: id === 'herz' ? 'artifact' : 'misc' }) };
  const audio = { play: (id, opts) => played.push(opts?.variant ? `${id}#${opts.variant}` : id) };
  wireSounds(state, audio, null);
  handlers.party({ active: true }); handlers.party({ active: true }); handlers.party({ active: false }); handlers.party({ active: true });
  handlers.ending('c1_good');
  handlers.unruhe(3); handlers.unruhe(2);
  handlers.item({ id: 'herz', delta: 1 }); handlers.item({ id: 'brot', delta: 1 });
  handlers.fact({ id: 'cwa_anker_c', status: true });
  handlers.fact({ id: 'bha_ventil_tee_offen', status: true });
  assert.deepEqual(played, ['koop_beitritt', 'koop_beitritt', 'ui_ende_hell', 'artefakt_unruhe', 'ui_item_selten', 'ui_item', 'cw_anker_verbunden', 'bh_ventil_drehen']);
});
