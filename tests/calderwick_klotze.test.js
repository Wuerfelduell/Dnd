// Calderwick-Requisiten auf den Platzhalter-Klötzen (data/calderwickKlotze.js, tools/art/cw_kulissen)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { CW_KLOTZ_PLAN, CW_KULISSEN_SPRITES, klotze } from '../src/data/calderwickKlotze.js';
import { ANIM_SHEETS } from '../src/world/assets.js';
import { erreichbarMit } from '../src/data/briarholtKulisse.js';

const content = loadContent();
const man = JSON.parse(readFileSync(new URL('../public/sprites/manifest-cw-kulissen.json', import.meta.url), 'utf8'));

test('Calderwick-Requisiten: zehn Dateien, registriert', () => {
  assert.equal(man.assets.length, 10);
  for (const a of man.assets) {
    assert.ok(existsSync(new URL('../public/sprites/' + a.file, import.meta.url)), a.file);
    assert.deepEqual(ANIM_SHEETS[a.id], [a.file, ...CW_KULISSEN_SPRITES[a.id]]);
    assert.deepEqual(CW_KULISSEN_SPRITES[a.id], [a.width, a.height]);
  }
});

test('Calderwick-Requisiten: kein geplanter Platzhalter-Klotz mehr, jedes Requisit steht auf seinem Y-Block, alles erreichbar', () => {
  for (const [id, plan] of Object.entries(CW_KLOTZ_PLAN)) {
    const m = content.maps[id];
    const rest = klotze(m.rows).filter((k) => plan[(k.x1 - k.x0 + 1) + 'x' + (k.y1 - k.y0 + 1)]);
    assert.deepEqual(rest, [], id + ': Klotz ohne Requisit');
    const neu = m.decor.filter((d) => d.kulisse === 'cw2');
    assert.ok(neu.length >= 1, id);
    for (const d of neu) {
      const [x0, y0, x1, y1] = d.block;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) assert.equal(m.rows[y][x], 'Y', id + ' ' + d.sprite);
      assert.ok(!d.solid, id);
    }
    const W = m.rows[0].length;
    const H = m.rows.length;
    const boden = (x, y) => '.swg'.includes(m.rows[y]?.[x] ?? 'I');
    const fest = m.decor.filter((d) => d.solid).map((d) => d.tile[0] + ',' + d.tile[1]);
    assert.ok(erreichbarMit(m, { W, H, boden, fest, neu: [] }), id + ': nicht alles erreichbar');
    for (const i of m.interactables ?? []) assert.notEqual(m.rows[i.tile[1]][i.tile[0]], 'Y', id + ': ' + i.id);
  }
});
