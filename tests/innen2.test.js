// Mutterhaus, Labor und Dunscarer Zirkelräume (data/innen2.js, tools/art/innen2)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { INNEN2_SPRITES, INNEN2_TAUSCH, INNEN2_DAZU } from '../src/data/innen2.js';
import { ANIM_SHEETS } from '../src/world/assets.js';
import { erreichbarMit } from '../src/data/briarholtKulisse.js';

const content = loadContent();
const man = JSON.parse(readFileSync(new URL('../public/sprites/manifest-innen2-kulissen.json', import.meta.url), 'utf8'));

test('Innenräume 2: zehn Dateien, registriert', () => {
  assert.equal(man.assets.length, 10);
  for (const a of man.assets) {
    assert.ok(existsSync(new URL('../public/sprites/' + a.file, import.meta.url)), a.file);
    assert.deepEqual(INNEN2_SPRITES[a.id], [a.width, a.height]);
    assert.deepEqual(ANIM_SHEETS[a.id], [a.file, a.width, a.height]);
  }
});

test('Zirkelräume: Leihmöbel getauscht, Kollision unverändert', () => {
  for (const [id, liste] of Object.entries(INNEN2_TAUSCH)) {
    const m = content.maps[id];
    for (const [alt, neu] of liste) {
      assert.ok(!m.decor.some((d) => d.sprite === alt), id + ': ' + alt);
      assert.ok(m.decor.some((d) => d.sprite === neu && d.getauscht === alt), id + ': ' + neu);
    }
  }
});

test('Mutterhaus und Labor: neue Stücke auf freiem Boden, alles erreichbar, dichter als vorher', () => {
  for (const base of Object.keys(INNEN2_DAZU)) for (const id of [base, base + '__warm']) {
    const m = content.maps[id];
    const neu = m.decor.filter((d) => d.kulisse === 'innen2');
    assert.equal(neu.length, INNEN2_DAZU[base].length, id);
    const besetzt = new Set([...(m.interactables ?? []).map((i) => i.tile + ''), ...(m.npcs ?? []).map((n) => n.tile + '')]);
    for (const d of neu) assert.ok('.swg'.includes(m.rows[d.tile[1]][d.tile[0]]) && !besetzt.has(d.tile + ''), id + ' ' + d.sprite);
    const W = m.rows[0].length;
    const H = m.rows.length;
    const boden = (x, y) => '.swg'.includes(m.rows[y]?.[x] ?? 'I');
    assert.ok(erreichbarMit(m, { W, H, boden, fest: m.decor.filter((d) => d.solid).map((d) => d.tile.join(',')), neu: [] }), id);
  }
});
