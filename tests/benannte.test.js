// Codex DJ: benannte Gegner.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { DAY_SECONDS, DAY_NIGHT_SECONDS } from '../src/core/Clock.js';
import { BN_IDS, BATTLE_SHEETS, OVERWORLD_SHEETS, bestiaryUrl, itemIconUrl } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const file = (p) => existsSync(new URL(`../public/sprites/${String(p).replace(/^.*\/sprites\//, '')}`, import.meta.url));

test('DJ: 20 benannte Gegner auf ihren Grundgegnern, stärker, mit Beute und Karten-Auftritt', () => {
  for (const id of BN_IDS) {
    const e = content.encounters[id];
    assert.ok(e, id);
    const g = content.benannte.gegner[id];
    assert.ok(e.hp > content.encounters[g.grundlage].hp, id);
    assert.ok(content.loot[id].drops.length, id);
    for (const z of g.erscheinen.zonen) assert.ok(content.maps[z].roamers.some((r) => r.encounter === id && r.bn), `${id} auf ${z}`);
    assert.ok(file(BATTLE_SHEETS[`enemy_${id}`][0]) && file(OVERWORLD_SHEETS[id][0]) && file(bestiaryUrl(id)), id);
  }
  for (const r of content.gatherings.artisan.recipes.filter((x) => x.id.startsWith('fa_bnl_'))) {
    assert.ok(content.items[Object.keys(r.needs)[0]] && content.items[r.artifact], r.id);
    assert.ok(file(itemIconUrl(r.artifact)), r.artifact);
  }
  assert.ok(!content.encounters.bn_der_zollgeist_mit_gesicht, 'Varrowmouth erst mit Kapitel 6');
});

test('DJ: erscheint nur nachts, ab Seq 6, unbesiegt, und nur in einem Gebiet', () => {
  const s = new GameState(content);
  const id = 'bn_grubenlicht_mutter';
  const zonen = content.benannte.gegner[id].erscheinen.zonen;
  const night = (tag) => { s.playTime = tag * DAY_SECONDS + DAY_NIGHT_SECONDS + 1; s.syncClock?.(); s.flags.add('nacht'); };
  s.isNight = () => true;
  s.pathway = { id: 'laterne', seq: 7, digestion: 0 };
  s.flags.add('k2_arrived');
  let seen = 0;
  for (let t = 0; t < 60; t++) { night(t); seen += zonen.filter((z) => s.bnErscheint(id, z)).length; }
  assert.equal(seen, 0, 'Seq 7 sieht ihn nicht');
  s.pathway.seq = 6;
  let days = 0;
  for (let t = 0; t < 200; t++) {
    night(t);
    const n = zonen.filter((z) => s.bnErscheint(id, z)).length;
    assert.ok(n <= 1);
    days += n;
  }
  assert.ok(days > 5 && days < 60, `etwa 10–20 % der Nächte: ${days}`);
  s.isNight = () => false;
  assert.ok(zonen.every((z) => !s.bnErscheint(id, z)));
  s.isNight = () => true;
  s.flags.add(`${id}_besiegt`);
  for (let t = 0; t < 50; t++) { night(t); assert.ok(zonen.every((z) => !s.bnErscheint(id, z))); }
});
