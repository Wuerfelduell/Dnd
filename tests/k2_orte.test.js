import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { AN_ENEMIES, BATTLE_SHEETS, ENCOUNTER_SHEETS, OVERWORLD_SHEETS, bestiaryUrl, BOSS_INTROS, BOSS_INTRO_IMAGES, mapMarkerOf, itemIconUrl, itemIcon32Url } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const pub = (url) => new URL(`../public/${url.replace(/^\.?\//, '')}`, import.meta.url);
const sprite = (p) => new URL(`../public/sprites/${p}`, import.meta.url);

test('Paket AM: drei neue Wexmoorer Orte mit Reiseziel, Pin und Marker', () => {
  for (const id of ['wx_flossfriedhof', 'wx_lichtamt', 'wx_torfbrueche']) {
    assert.equal(content.maps[id]?.city, 'wexmoor', id);
    assert.ok(mapMarkerOf(id)[0].includes('AN_marker') && mapMarkerOf(id)[4].row === 1, id);
  }
  const pins = content.travelRules.cities.wexmoor.pins;
  for (const id of ['wx_flossfriedhof', 'wx_torfbrueche']) {
    assert.ok(pins[id], id);
    assert.ok(content.travel.some((t) => t.map === id && t.city === 'wexmoor'), id);
  }
  assert.ok(content.zones.wx_torfbrueche);
  assert.equal(content.items.brautkranz.kind, 'artifact');
  for (const q of ['k2o_ring_im_torf', 'k2o_leeres_floss', 'k2o_gestrichene_braut', 'k2o_grab_ohne_namen']) assert.ok(content.quests[q], q);
});

test('Paket AN: Monster der Torfbrüche mit Kampf-, Karten- und Bestiariumsbild, Moorbraut mit Bossbild', () => {
  for (const id of Object.keys(AN_ENEMIES)) {
    assert.ok(content.encounters[id], id);
    assert.ok(existsSync(sprite(BATTLE_SHEETS[ENCOUNTER_SHEETS[id]][0])), id);
    assert.ok(existsSync(sprite(OVERWORLD_SHEETS[id][0])), id);
    assert.ok(existsSync(pub(bestiaryUrl(id))), id);
  }
  assert.ok(existsSync(sprite(BOSS_INTRO_IMAGES[BOSS_INTROS.moorbraut][1])));
  for (const id of ['schlickzahn', 'wurmseide', 'grubenglas', 'torfbernstein', 'brautschleier', 'brautring', 'brautkranz']) {
    assert.ok(existsSync(pub(itemIconUrl(id))), id);
    assert.ok(existsSync(pub(itemIcon32Url(id))), id);
  }
});
