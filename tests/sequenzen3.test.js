import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { AG_SKILL_FX, BATTLE_SHEETS, BATTLE_MANIFESTS, ANIM_SHEETS, pathwayEmblemUrl, pathwayCardUrl, ritualCardUrl, itemIconUrl, itemIcon32Url } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const pub = (url) => new URL(`../public/${url.replace(/^\.?\//, '')}`, import.meta.url);
const sprite = (p) => new URL(`../public/sprites/${p}`, import.meta.url);
const src = readFileSync(new URL('../src/world/assets.js', import.meta.url), 'utf8');
const manifestFile = Object.fromEntries([...src.matchAll(/scene\.load\.json\('(manifest\w+)', `\$\{BASE\}([\w-]+\.json)`\)/g)].map((m) => [m[1], m[2]]));
const manifests = BATTLE_MANIFESTS.map((m) => JSON.parse(readFileSync(sprite(manifestFile[m]), 'utf8')));

test('Paket AG: jede Fähigkeit ab Seq 4 und jede Stufe der neuen Pfade hat ihren eigenen Effekt', () => {
  for (const [pid, p] of Object.entries(content.pathways)) {
    for (const [n, sd] of Object.entries(p.seqs)) {
      if (Number(n) > 4 && !pid.startsWith('sq_')) continue;
      assert.ok(AG_SKILL_FX.includes(sd.skill.id), `${pid} ${n}: ${sd.skill.id}`);
    }
  }
  for (const id of AG_SKILL_FX) {
    const file = BATTLE_SHEETS[`fx_${id}`][0];
    assert.ok(existsSync(sprite(file)), file);
    assert.ok(manifests.some((m) => m.assets.some((a) => a.file === file && a.animations?.cast)), id);
  }
});

test('Paket AG: Embleme, Karten, Ritualbilder, Aura und Posen der neuen Pfade', () => {
  for (const pid of ['sq_waage', 'sq_moor', 'sq_uhr']) {
    for (const size of [16, 32, 64]) assert.ok(existsSync(pub(pathwayEmblemUrl(pid, size))), `${pid} ${size}`);
    assert.ok(existsSync(pub(pathwayCardUrl(pid))), pid);
    assert.ok(existsSync(pub(ritualCardUrl(pid))), pid);
    assert.ok(existsSync(sprite(ANIM_SHEETS[`sq_aura_${pid.slice(3)}`][0])), pid);
  }
  const poses = manifests.flatMap((m) => m.assets).find((a) => a.file === BATTLE_SHEETS.battle_player_skills2[0]);
  for (const pid of ['sq_waage', 'sq_moor', 'sq_uhr']) assert.ok(poses.animations[pid], pid);
});

test('Paket AG: Zutaten und Artefakte haben eigene Icons in 16 und 32', () => {
  const zutaten = JSON.parse(readFileSync(new URL('../src/data/packs/sequenzen/zutaten.json', import.meta.url), 'utf8'));
  const ids = [...Object.keys(zutaten), ...Object.keys(content.items).filter((id) => content.items[id].kind === 'artifact' && id.startsWith('sq_'))];
  assert.equal(ids.length, 61);
  for (const id of ids) {
    assert.ok(itemIconUrl(id).endsWith(`/${id}.png`), id);
    assert.ok(existsSync(pub(itemIconUrl(id))), id);
    assert.ok(existsSync(pub(itemIcon32Url(id))), id);
  }
});

test('Jedes Gegner-Kampfsheet hat seine Animationen in einem geladenen Manifest', () => {
  for (const [key, [file]] of Object.entries(BATTLE_SHEETS)) {
    if (!key.startsWith('enemy_') || !existsSync(sprite(file))) continue;
    assert.ok(manifests.some((m) => m.assets.some((a) => (a.file === file || a.id === key) && a.animations)), key);
  }
});
