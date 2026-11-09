import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { SHEETS, BATTLE_SHEETS, ANIM_SHEETS, TILE_CELLS, PROP_CELLS, PROP_ANIMS, CHARACTER_SHEETS, ENCOUNTER_SHEETS, ENEMY_BATTLE_SHEETS, BATTLE_BACKGROUNDS, ENCOUNTER_BACKGROUNDS, SKILL_FX, SKILL_ICONS, STATUS_ICONS, PATHWAY_POSES, WEAPON_POSES, itemIconUrl, itemIcon32Url, pathwayEmblemUrl, pathwayCardUrl, COIN_URL } from '../src/world/assets.js';
import { TILE_KEYS } from '../src/world/textures.js';

// Spiel-URLs ('./sprites/...') zeigen auf public/sprites/
const file = (url) => new URL(`../public/${url.replace(/^\.\//, '')}`, import.meta.url);
const sprite = (path) => new URL(`../public/sprites/${path}`, import.meta.url);
const content = loadContent();

test('alle Sheets aus assets.js liegen unter public/sprites', () => {
  const paths = [...Object.values(SHEETS), ...Object.values(BATTLE_SHEETS).map(([p]) => p), ...Object.values(ANIM_SHEETS).map(([p]) => p)];
  for (const p of paths) assert.ok(existsSync(sprite(p)), p);
});

test('Tabellen verweisen nur auf bekannte Sheets und Tiles', () => {
  for (const [key, [sheet, , base]] of Object.entries(TILE_CELLS)) {
    assert.ok(TILE_KEYS.includes(key), `Tile-Key ${key}`);
    assert.ok(SHEETS[sheet], `Sheet ${sheet}`);
    if (base) assert.ok(TILE_KEYS.includes(base), `Basis ${base}`);
  }
  for (const [sheet] of [...Object.values(PROP_CELLS), ...Object.values(PROP_ANIMS)]) assert.ok(SHEETS[sheet], sheet);
  for (const sheet of Object.values(CHARACTER_SHEETS)) assert.ok(SHEETS[sheet], sheet);
});

test('jede Figur mit Karteneinsatz und jeder Händler hat ein Lauf-Sheet', () => {
  for (const id of Object.keys(content.market.npcs)) assert.ok(CHARACTER_SHEETS[`npc_${id}`], id);
});

test('jedes Item hat ein Icon, Tränke auch in 32px', () => {
  for (const [id, it] of Object.entries(content.items)) {
    assert.ok(existsSync(file(itemIconUrl(id))), `Icon fehlt: ${id}`);
    if (it.kind === 'potion') assert.ok(existsSync(file(itemIcon32Url(id))), `32er fehlt: ${id}`);
  }
  assert.ok(existsSync(file(COIN_URL)));
});

test('jeder Pfad hat Embleme und eine Karte', () => {
  for (const pid of Object.keys(content.pathways)) {
    for (const size of [16, 32, 64]) assert.ok(existsSync(file(pathwayEmblemUrl(pid, size))), `${pid} ${size}`);
    assert.ok(existsSync(file(pathwayCardUrl(pid))), pid);
  }
});

test('Deko auf den Karten nutzt bekannte Sprites', () => {
  const known = new Set([...Object.keys(PROP_CELLS), ...Object.keys(PROP_ANIMS)]);
  for (const map of Object.values(content.maps)) {
    if (map.tiles !== 'nachtmarkt') continue;
    for (const d of map.decor) assert.ok(known.has(d.sprite), `${map.id}: ${d.sprite}`);
  }
});

const kampf = JSON.parse(readFileSync(sprite('manifest-kampf.json'), 'utf8'));
const kampfAsset = (id) => kampf.assets.find((a) => a.id === id);

test('Kampf: jede Begegnung hat ein Gegner-Sheet und jede Karte/Begegnung einen vorhandenen Hintergrund', () => {
  for (const [id, enc] of Object.entries(content.encounters)) {
    const sheet = ENCOUNTER_SHEETS[id] ?? ENEMY_BATTLE_SHEETS[enc.sprite];
    assert.ok(sheet && BATTLE_SHEETS[sheet], `kein Kampf-Sheet für ${id}`);
  }
  for (const key of Object.keys(ENCOUNTER_SHEETS)) assert.ok(content.encounters[key], `unbekannte Begegnung ${key}`);
  for (const bg of [...Object.values(BATTLE_BACKGROUNDS), ...Object.values(ENCOUNTER_BACKGROUNDS)]) assert.ok(existsSync(sprite(`battle/${bg}.png`)), bg);
  for (const map of Object.keys(BATTLE_BACKGROUNDS)) assert.ok(content.maps[map], map);
});

test('Kampf: jede Pfad-Fähigkeit hat Effekt und Icon wie im Manifest', () => {
  const icons = kampfAsset('skill_icons').icons;
  assert.deepEqual(SKILL_ICONS, icons);
  assert.deepEqual(STATUS_ICONS, kampfAsset('status_icons').icons);
  for (const p of Object.values(content.pathways)) {
    for (const sd of Object.values(p.seqs)) {
      const id = sd.skill.id;
      assert.ok(SKILL_FX[id], `Effekt fehlt: ${id}`);
      const fx = kampfAsset(`fx_${id}`);
      assert.equal(fx.frameWidth, SKILL_FX[id], `Framegröße ${id}`);
      assert.ok(fx.animations.cast, id);
    }
  }
});

test('Kampf: Posen und Gegner-Animationen stehen im Manifest', () => {
  const skills = kampfAsset('battle_player_skills').animations;
  for (const pid of Object.keys(content.pathways)) assert.ok(skills[PATHWAY_POSES[pid]], pid);
  const weapons = kampfAsset('battle_player_weapons').animations;
  for (const pose of [...Object.values(WEAPON_POSES), 'victory']) assert.ok(weapons[pose], pose);
  for (const [key, [, size]] of Object.entries(BATTLE_SHEETS)) {
    if (!key.startsWith('enemy_')) continue;
    const a = kampfAsset(key);
    if (!a) continue; // 14b-Gegner stehen in manifest-14b.json
    assert.equal(a.frameWidth, size, key);
    for (const anim of ['idle', 'attack', 'special', 'hurt', 'defeated']) assert.ok(a.animations[anim], `${key}.${anim}`);
  }
});
