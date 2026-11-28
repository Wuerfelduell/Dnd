// Kettlegate-Märkte: zehn Requisiten für Altmarkt und Nachtmarkt (data/kettlegateMaerkte.js, tools/art/kg_maerkte)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { KG_MAERKTE_SPRITES, KG_MAERKTE_PLAN } from '../src/data/kettlegateMaerkte.js';
import { ANIM_SHEETS } from '../src/world/assets.js';
import { erreichbarMit } from '../src/data/briarholtKulisse.js';

const content = loadContent();
const man = JSON.parse(readFileSync(new URL('../public/sprites/manifest-kg-maerkte.json', import.meta.url), 'utf8'));
const BODEN = '.,gPswpc=';

test('Kettlegate-Märkte: zehn Dateien, registriert, keine Doppelung', () => {
  assert.equal(man.assets.length, 10);
  assert.equal(new Set(man.assets.map((a) => a.id)).size, 10);
  for (const a of man.assets) {
    assert.ok(existsSync(new URL('../public/sprites/' + a.file, import.meta.url)), a.file);
    assert.deepEqual(KG_MAERKTE_SPRITES[a.id], [a.width, a.height], a.id);
    assert.deepEqual(ANIM_SHEETS[a.id], [a.file, a.width, a.height], a.id);
  }
  const geplant = Object.values(KG_MAERKTE_PLAN).flat().map((e) => e[0]);
  assert.deepEqual([...geplant].sort(), Object.keys(KG_MAERKTE_SPRITES).sort());
});

test('Altmarkt und Nachtmarkt: alle Stücke gesetzt, auf Boden, nicht auf Objekten, Wege bleiben frei', () => {
  for (const [id, plan] of Object.entries(KG_MAERKTE_PLAN)) {
    const m = content.maps[id];
    const neu = m.decor.filter((d) => d.kulisse === 'kgm');
    assert.deepEqual(neu.map((d) => d.sprite).sort(), plan.map((e) => e[0]).sort(), id);
    const besetzt = new Set([...(m.interactables ?? []).map((i) => i.tile + ''), ...(m.npcs ?? []).map((n) => n.tile + ''), ...Object.values(m.spawns ?? {}).map((t) => t + '')]);
    for (const d of neu) {
      const [x, y] = d.tile;
      for (const dx of [-1, 0, 1]) assert.ok(BODEN.includes(m.rows[y][x + dx]), id + ' ' + d.sprite + ' auf ' + m.rows[y][x + dx]);
      assert.ok(!besetzt.has(d.tile + ''), id + ' ' + d.sprite + ' auf Objekt');
      assert.ok(d.solid, id + ' ' + d.sprite + ' ohne Kollision');
    }
    const W = m.rows[0].length;
    const H = m.rows.length;
    const boden = (x, y) => BODEN.includes(m.rows[y]?.[x] ?? 'I');
    assert.ok(erreichbarMit(m, { W, H, boden, fest: m.decor.filter((d) => d.solid).map((d) => d.tile.join(',')), neu: [] }), id);
  }
});

test('Nachtmarkt: Kerzenstand und Amulettgestell leuchten', () => {
  const m = content.maps.nachtmarkt;
  for (const s of ['kgm_kerzenstand', 'kgm_amulettgestell']) assert.ok(m.decor.find((d) => d.sprite === s)?.light, s);
});
