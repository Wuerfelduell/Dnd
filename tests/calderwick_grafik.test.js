import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { SHEETS, THEME_TILES, THEME_TILE_LIST, CW_THEME_KEYS, CW_MAP_THEMES, CW_MAP_IDS, CW_MAP_MARKERS_URL, mapMarkerOf, BATTLE_BACKGROUNDS, BATTLE_BACKGROUNDS_NIGHT,
  battleBackgroundFor, REGION_SHEETS, CHAPTER_CARDS, CW_SCENES, sceneUrl, endingImageUrl, ANIM_SHEETS, CW_ABGLEICH } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

// Pakete CE1 (calderwick1: Tilesets und Props) und CE2 (calderwick2: Abgleich-Atlas, Szenen, Kampfkulissen, Stadtkarte, Marker, Kapitelbild)
const content = loadContent();
const sprite = (p) => new URL(`../public/sprites/${p}`, import.meta.url);
const pub = (url) => new URL(`../public/${url.replace(/^\.?\//, '')}`, import.meta.url);
const m1 = JSON.parse(readFileSync(sprite('manifest-calderwick1.json'), 'utf8'));
const m2 = JSON.parse(readFileSync(sprite('manifest-calderwick2.json'), 'utf8'));
const asset = (id) => [...m1.assets, ...m2.assets].find((a) => a.id === id);
const CW_MAPS = Object.keys(content.maps).filter((id) => id.startsWith('cw_'));

test('CE1/CE2: alle 13 + 22 Dateien der Manifeste liegen vor', () => {
  assert.equal(m1.assets.length, 13);
  assert.equal(m2.assets.length, 22);
  for (const a of [...m1.assets, ...m2.assets]) assert.ok(existsSync(sprite(a.file)), a.file);
});

test('CE1: acht Themen zeigen auf die sechs Calderwick-Blätter, Zellen liegen im Raster, Boden/Wand/Fenster vorhanden', () => {
  assert.equal(CW_THEME_KEYS.length, 8);
  for (const key of CW_THEME_KEYS) {
    const spec = THEME_TILES[key];
    const def = asset(spec.sheet);
    assert.ok(def, `${key}: Blatt ${spec.sheet}`);
    assert.equal(SHEETS[spec.sheet], def.file, key);
    for (const t of THEME_TILE_LIST.filter((x) => x.theme === key)) assert.ok(t.region >= 0 && t.region < def.columns * def.rows, `${t.key}: Zelle ${t.region}`);
    for (const g of ['floor', 'wallTop', 'wallFace', ...(key === 'cw_gleis' ? [] : ['window'])]) assert.ok(spec[g]?.length, `${key}.${g}`);
    for (const g of Object.keys(spec).filter((x) => Array.isArray(spec[x]))) for (const r of spec[g]) assert.ok(def.tileNames[r] !== undefined, `${key}.${g}: Zelle ${r} ohne Namen`);
  }
  assert.equal(asset('cw_terrasse').tileNames[THEME_TILES.cw_terrasse.floor[0]], 'paving_1');
  assert.equal(asset('cw_amt').tileNames[THEME_TILES.cw_sortierhalle.floor[0]], 'sheetmetal_passage_floor');
  assert.equal(asset('cw_amt').tileNames[THEME_TILES.cw_archivsaal.floor[0]], 'reading_carpet_center');
  assert.equal(asset('cw_fundament').tileNames[THEME_TILES.cw_fundament.wallTop[0]], 'ancient_wall_top');
  // Nur begehbare Gruppen mischen den Boden
  for (const t of THEME_TILE_LIST.filter((x) => x.theme.startsWith('cw_') && ['floor', 'wet', 'debris', 'wear', 'edge'].includes(x.group))) assert.ok(!t.solid, t.key);
});

test('CE1: jede Calderwicker Karte nutzt ihr Thema; die Landstraße bleibt beim Gefahrengebiets-Blatt', () => {
  assert.equal(CW_MAPS.length, 17);
  for (const id of CW_MAPS) assert.equal(content.maps[id].tiles, CW_MAP_THEMES[id], id);
  assert.equal(content.maps.cw_nullfundament.tiles, 'cw_fundament');
  assert.equal(content.maps.reise_landstrasse.tiles, 'g_katakomben');
});

test('CE1: Deko aus den sieben Props-Blättern steht auf Boden und nennt nur vorhandene Regionen; Schienen und Waggons am Gleisfuß', () => {
  const known = new Set();
  for (const [prefix, [manifest, id]] of Object.entries(REGION_SHEETS).filter(([p]) => p.startsWith('cwp_'))) {
    assert.equal(manifest, 'manifestCalderwick1');
    const def = asset(id);
    assert.ok(def, prefix);
    assert.equal(SHEETS[prefix], def.file);
    for (const n of [...Object.keys(def.regions), ...Object.keys(def.animations ?? {})]) known.add(`${prefix}_${n}`);
    for (const a of Object.values(def.animations ?? {})) for (const r of a.regions) assert.ok(def.regions[r], `${id}: Animationsregion ${r}`);
  }
  assert.ok(known.has('cwp_gleisfuss_aufzug') && known.has('cwp_kronenarchiv_hauptpresse') && known.has('cwp_buchbinderei_buergenbrett_leer'));
  let decor = 0;
  for (const id of CW_MAPS) {
    const m = content.maps[id];
    for (const d of m.decor) {
      decor += 1;
      if (d.sprite === 'cwt_gleis') continue;
      assert.ok(known.has(d.sprite), `${id}: ${d.sprite}`);
      assert.match(m.rows[d.tile[1]][d.tile[0]], /[.swg]/, `${id}: ${d.sprite} auf ${d.tile}`);
    }
    assert.ok(m.decor.length >= 3, `${id}: kaum Deko`);
  }
  assert.ok(decor > 80);
  assert.deepEqual(ANIM_SHEETS.cwt_gleis, ['tilesets/cw_gleis.png', 16, 16]);
  const rails = content.maps.cw_gleisfuss.decor.filter((d) => d.sprite === 'cwt_gleis');
  assert.ok(rails.length >= 20 && rails.every((d) => d.tile[1] === 20));
  assert.ok(content.maps.cw_gleisfuss.decor.some((d) => d.sprite === 'cwp_gleisfuss_gueterwaggon_offen' && d.tile[1] === 20));
});

test('CE2: eigene Marker für alle 18 Orte (statt der Dunscarer Leihzellen), Stadtkarte mit Nebel, Pins für Terrassen und Gefahrengebiete', () => {
  assert.ok(existsSync(pub(CW_MAP_MARKERS_URL)));
  assert.deepEqual(Object.keys(asset('cw_marker').regions), CW_MAP_IDS);
  for (const [i, id] of CW_MAP_IDS.entries()) {
    const [url, cell, cols, , grid] = mapMarkerOf(id);
    assert.equal(url, CW_MAP_MARKERS_URL, id);
    assert.equal(cell, i);
    assert.equal(cols, 6);
    assert.equal(grid.row, Math.floor(i / 6));
  }
  assert.notEqual(mapMarkerOf('ds_endbahnhof')[0], CW_MAP_MARKERS_URL);
  const city = content.travelRules.cities.calderwick;
  assert.equal(city.map_image, 'ui/cw_karte.png');
  assert.equal(city.fog_image, 'ui/cw_karte_nebel.png');
  for (const img of [city.map_image, city.fog_image]) assert.ok(existsSync(sprite(img)), img);
  for (const id of ['cw_gleisfuss', 'cw_setzergasse', 'cw_quittungsmarkt', 'cw_roehrenhof', 'cw_witwenterrasse', 'cw_kronenarchiv', 'cw_alte_setzerei', 'cw_sortiergrube', 'cw_nullfundament']) {
    const [x, y] = city.pins[id];
    assert.ok(x >= 0 && x <= 480 && y >= 0 && y <= 270, id);
  }
  // Terrassen von unten nach oben
  const ys = ['cw_gleisfuss', 'cw_setzergasse', 'cw_quittungsmarkt', 'cw_roehrenhof', 'cw_witwenterrasse', 'cw_kronenarchiv'].map((id) => city.pins[id][1]);
  assert.deepEqual(ys, [...ys].sort((a, b) => b - a));
});

test('CE2: neun Kampfkulissen – Terrassen, Innenräume beim Viertel, Druckkammer eigen, Landstraße Tag und Nacht; Gefahrengebiete behalten BI', () => {
  for (const id of CW_MAPS.concat('reise_landstrasse')) assert.ok(BATTLE_BACKGROUNDS[id], id);
  for (const [id, bg] of [['cw_gleisfuss', 'bg_cw_gleisfuss'], ['cw_gepaeckhalle', 'bg_cw_gleisfuss'], ['cw_buchbinderei', 'bg_cw_setzergasse'], ['cw_pfandhaus', 'bg_cw_quittungsmarkt'],
    ['cw_sortierhalle', 'bg_cw_roehrenhof'], ['cw_kueche', 'bg_cw_witwenterrasse'], ['cw_villa', 'bg_cw_kronenarchiv'], ['cw_druckkammer', 'bg_cw_druckkammer'], ['cw_alte_setzerei', 'bg_vorrat_alte_setzerei']]) {
    assert.equal(BATTLE_BACKGROUNDS[id], bg, id);
  }
  assert.equal(battleBackgroundFor('reise_landstrasse', false), 'bg_cw_landstrasse_tag');
  assert.equal(battleBackgroundFor('reise_landstrasse', true), 'bg_cw_landstrasse_nacht');
  for (const bg of new Set(CW_MAPS.concat('reise_landstrasse').flatMap((id) => [BATTLE_BACKGROUNDS[id], BATTLE_BACKGROUNDS_NIGHT[id]]).filter(Boolean))) assert.ok(existsSync(sprite(`battle/${bg}.png`)), bg);
});

test('CE2: Kapitel-4-Karte, Aufzug/Teller/Sortierkabine an den Gesprächen, Schlussbilder der vier Enden', () => {
  assert.ok(CHAPTER_CARDS.includes('kapitel4_karte'));
  for (const id of ['kapitel4_karte', ...CW_SCENES]) assert.ok(existsSync(pub(sceneUrl(id))), id);
  const d = content.dialogues;
  assert.equal(d.cwa_ankunft.nodes.cwa_ankunft_zone.scene, 'cw_aufzug');
  assert.equal(d.cwa_12_dialog.nodes.cwa_12_start.scene, 'cw_zwei_teller');
  assert.equal(d.cwa_24_dialog.nodes.cwa_24_schluss.scene, 'cw_sortierkabine');
  for (const id of ['cwa_widerspruch', 'cwa_amtsinhaber', 'cwa_buecher', 'cwa_ordnung']) {
    assert.ok(content.endings[id], id);
    assert.ok(existsSync(pub(endingImageUrl(id, 'kapitel4'))), id);
  }
  // Abgleich-Atlas: Regionen im Bild (Gameplay dafür gibt es noch nicht; die Felder liegen bereit)
  const atlas = asset('cw_abgleich');
  for (const [name, [x, y, w, h, n]] of Object.entries(CW_ABGLEICH)) {
    const r = atlas.regions[name];
    assert.ok(r, name);
    assert.deepEqual([r.x, r.y, r.frameWidth, r.frameHeight, r.columns], [x, y, w, h, n], name);
  }
});
