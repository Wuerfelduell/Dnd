import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { SHEETS, THEME_TILES, THEME_TILE_LIST, BH_THEME_KEYS, BH_MAP_THEMES, BH_MAP_IDS, BH_MAP_MARKERS_URL, mapMarkerOf, BATTLE_BACKGROUNDS, REGION_SHEETS,
  CHAPTER_CARDS, BH_SCENES, sceneUrl, endingImageUrl, ENDING_SCENE_IMAGES } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

// Paket CI „Briarholt als Grafik, kalt und warm“ (Batch briarholt1, von Grok geliefert): Tilesets, Props, Kulissen, Stadtkarte, Szenen
const content = loadContent();
const sprite = (p) => new URL(`../public/sprites/${p}`, import.meta.url);
const pub = (url) => new URL(`../public/${url.replace(/^\.?\//, '')}`, import.meta.url);
const manifest = JSON.parse(readFileSync(sprite('manifest-briarholt1.json'), 'utf8'));
const asset = (id) => manifest.assets.find((a) => a.id === id);
const BH_MAPS = Object.keys(content.maps).filter((id) => id.startsWith('bh_'));

test('CI: alle 41 Dateien des Manifests liegen vor, Tilesets kalt/warm im gleichen Raster', () => {
  assert.equal(manifest.assets.length, 41);
  for (const a of manifest.assets) assert.ok(existsSync(sprite(a.file)), a.file);
  for (const t of ['promenade', 'kessel', 'glas', 'stille', 'klinik', 'wurzel']) {
    const kalt = asset(`bh_${t}_kalt`);
    const warm = asset(`bh_${t}_warm`);
    assert.deepEqual(kalt.tileNames, warm.tileNames, t);
    assert.equal(kalt.variants.warm, warm.file);
  }
});

test('CI: 16 Themen (8 je kalt/warm) zeigen auf die Briarholt-Blätter, Zellen liegen im Raster und Labor/Mutterhaus teilen das Klinik-Blatt', () => {
  assert.equal(BH_THEME_KEYS.length, 16);
  for (const key of BH_THEME_KEYS) {
    const spec = THEME_TILES[key];
    const variant = key.endsWith('_warm') ? 'warm' : 'kalt';
    assert.ok(spec?.sheet.endsWith(`_${variant}`), key);
    const def = asset(spec.sheet);
    assert.equal(SHEETS[spec.sheet], def.file, key);
    for (const t of THEME_TILE_LIST.filter((x) => x.theme === key)) assert.ok(t.region >= 0 && t.region < def.columns * def.rows, `${t.key}: Zelle ${t.region}`);
    for (const g of ['floor', 'wallTop', 'wallFace']) assert.ok(spec[g]?.length, `${key}.${g}`);
  }
  assert.equal(THEME_TILES.bh_labor_kalt.sheet, 'bh_klinik_kalt');
  assert.equal(THEME_TILES.bh_mutterhaus_warm.sheet, 'bh_klinik_warm');
  assert.equal(asset('bh_klinik_kalt').tileNames[THEME_TILES.bh_labor_kalt.floor[0]], 'labor_fliesen');
  assert.equal(asset('bh_kessel_kalt').tileNames[THEME_TILES.bh_kessel_kalt.wallFace[0]], 'waescherei_wand');
});

test('CI: jede Briarholter Karte nutzt ihr Thema, warm auf der Zwillingskarte, der Bügelraum immer warm', () => {
  assert.equal(BH_MAPS.length, 35);
  for (const id of BH_MAPS) {
    const base = id.replace(/__warm$/, '');
    const warm = id.endsWith('__warm') || base === 'bh_buegelraum';
    assert.equal(content.maps[id].tiles, `${BH_MAP_THEMES[base]}_${warm ? 'warm' : 'kalt'}`, id);
  }
  assert.equal(content.maps.bh_labor.tiles, 'bh_labor_kalt');
  assert.equal(content.maps.bh_wurzelkammer__warm.tiles, 'bh_wurzel_warm');
});

test('CI: Deko aus den Props-Blättern steht auf Boden, Regionen existieren, warme Karten zeigen entfaltete Palmen und offene Anlage', () => {
  const known = new Set();
  for (const [prefix, [, id]] of Object.entries(REGION_SHEETS).filter(([p]) => p.startsWith('bhp_'))) {
    const def = asset(id);
    assert.ok(def, prefix);
    assert.equal(SHEETS[prefix], def.file);
    for (const n of [...Object.keys(def.regions), ...Object.keys(def.regionAnimations ?? {})]) known.add(`${prefix}_${n}`);
  }
  assert.ok(known.has('bhp_kutschenhof_pferde') && known.has('bhp_waerme_dampf_rohr') && known.has('bhp_kesselgrund_ventiltafel'));
  let decor = 0;
  for (const id of BH_MAPS) {
    const m = content.maps[id];
    for (const d of m.decor) {
      decor += 1;
      assert.ok(known.has(d.sprite), `${id}: ${d.sprite}`);
      assert.match(m.rows[d.tile[1]][d.tile[0]], /[.swg]/, `${id}: ${d.sprite} auf ${d.tile}`);
    }
  }
  assert.ok(decor > 100);
  const palms = (id) => content.maps[id].decor.filter((d) => d.sprite.includes('palme')).map((d) => d.sprite);
  assert.ok(palms('bh_winterpromenade').every((s) => s.endsWith('_kalt')) && palms('bh_winterpromenade__warm').every((s) => s.endsWith('_warm')));
  assert.ok(content.maps.bh_verteilanlage.decor.some((d) => d.sprite === 'bhp_wurzelkranz_verteilanlage_zu'));
  assert.ok(content.maps.bh_verteilanlage__warm.decor.some((d) => d.sprite === 'bhp_wurzelkranz_verteilanlage_offen'));
  assert.ok(content.maps.bh_buegelraum.decor.some((d) => d.sprite === 'bhp_kesselgrund_ventiltafel'));
});

test('CI: Stadtkarte mit Nebel und Leitungsplan, eigene Marker für alle 18 Orte und ihre warmen Zwillinge', () => {
  const city = content.travelRules.cities.briarholt;
  for (const f of [city.map_image, city.fog_image, city.overlay_image]) assert.ok(existsSync(sprite(f)), f);
  assert.ok(existsSync(pub(BH_MAP_MARKERS_URL)));
  assert.equal(BH_MAP_IDS.length, 18);
  assert.deepEqual(BH_MAP_IDS, Object.keys(asset('bh_marker').regions));
  for (const id of BH_MAPS) {
    const [url, cell, cols, , grid] = mapMarkerOf(id);
    assert.equal(url, BH_MAP_MARKERS_URL, id);
    assert.equal(cols, 6);
    assert.equal(cell, BH_MAP_IDS.indexOf(id.replace(/__warm$/, '')));
    assert.equal(grid.row, Math.floor(cell / 6));
  }
  for (const id of Object.keys(city.pins)) assert.ok(content.maps[id], id);
  for (const t of content.travel.filter((x) => x.city === 'briarholt')) assert.ok(city.pins[t.map], `Pin ${t.map}`);
});

test('CI: Kampfkulissen der Viertel kalt/warm, Gefahrengebiete behalten die Vorrat-Kulissen', () => {
  for (const [id, bg] of Object.entries({ bh_kutschenhof: 'bg_bh_kutschenhof', bh_kesselgrund: 'bg_bh_kesselgrund_kalt', bh_kesselgrund__warm: 'bg_bh_kesselgrund_warm', bh_buegelraum: 'bg_bh_kesselgrund_warm',
    bh_glasgaerten__warm: 'bg_bh_glasgaerten_warm', bh_verkaufshalle: 'bg_bh_glasgaerten_kalt', bh_pavillon__warm: 'bg_bh_promenade', bh_speisesaal: 'bg_bh_stillenhaeuser',
    bh_labor__warm: 'bg_bh_wurzelkranz', bh_verteilanlage: 'bg_bh_verteilanlage', bh_kaltes_palmhaus: 'bg_vorrat_kaltes_palmhaus', bh_wurzelkammer__warm: 'bg_vorrat_wurzelkammer' })) {
    assert.equal(BATTLE_BACKGROUNDS[id], bg, id);
    assert.ok(existsSync(sprite(`battle/${bg}.png`)), bg);
  }
  for (const id of BH_MAPS) assert.ok(BATTLE_BACKGROUNDS[id], `Kulisse ${id}`);
});

test('CI: Kapitelkarte, Ankunfts- und Zwischenbilder an den Gesprächen, Schlussbilder der vier Enden', () => {
  assert.ok(CHAPTER_CARDS.includes('kapitel5_karte') && existsSync(pub(sceneUrl('kapitel5_karte'))));
  for (const id of BH_SCENES) assert.ok(existsSync(pub(sceneUrl(id))), id);
  const d = content.dialogues;
  for (const id of ['bha_anreise_widerspruch', 'bha_anreise_amtsinhaber', 'bha_anreise_ordnung', 'bha_anreise_dunscar']) assert.equal(d[id].nodes[d[id].start].scene, 'bh_ankunft', id);
  assert.equal(d.bha_anreise_buecher.nodes.bha_anreise_buecher.scene, 'bh_pfirsich');
  assert.equal(d.bha_34_dialog.nodes.bha_34_start.scene, 'bh_trockenraum');
  for (const id of ['bha_wahl', 'bha_winter', 'bha_verwahrt', 'bha_schmerzlos']) {
    assert.ok(content.endings[id], id);
    assert.ok(existsSync(pub(endingImageUrl(id, 'kapitel5'))), id);
  }
  assert.ok(existsSync(pub(endingImageUrl('bha_schmerzlos_lichtmeister'))));
  assert.equal(Object.keys(ENDING_SCENE_IMAGES).length, 5);
});
