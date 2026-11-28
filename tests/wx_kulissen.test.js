// Zehn Requisiten für Wexmoor: Torf, Moor, Salz, Friedhof, Lichtamt (data/wexmoorKulissen.js, tools/art/wx_kulissen)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { WX_KULISSEN_SPRITES, WX_KULISSEN_PLAN } from '../src/data/wexmoorKulissen.js';
import { ANIM_SHEETS } from '../src/world/assets.js';
import { erreichbarMit } from '../src/data/briarholtKulisse.js';

const content = loadContent();
const man = JSON.parse(readFileSync(new URL('../public/sprites/manifest-wx-kulissen.json', import.meta.url), 'utf8'));

test('Wexmoor-Requisiten: zehn Dateien, registriert, je zwei Themen-Orte', () => {
  assert.equal(man.assets.length, 10);
  for (const a of man.assets) {
    assert.ok(existsSync(new URL('../public/sprites/' + a.file, import.meta.url)), a.file);
    assert.deepEqual(WX_KULISSEN_SPRITES[a.id], [a.width, a.height], a.id);
    assert.deepEqual(ANIM_SHEETS[a.id], [a.file, a.width, a.height], a.id);
  }
  const geplant = new Set(Object.values(WX_KULISSEN_PLAN).flatMap(([, , l]) => l.map((e) => e[0])));
  assert.deepEqual([...geplant].sort(), Object.keys(WX_KULISSEN_SPRITES).sort());
  for (const [id, [, , liste]] of Object.entries(WX_KULISSEN_PLAN)) assert.equal(new Set(liste.map((e) => e[0])).size, 2, id);
});

test('Wexmoor-Requisiten: auf Boden (nicht Geröll), nicht auf Objekten, fest, alles bleibt erreichbar', () => {
  for (const [id, [boden, begehbar, liste]] of Object.entries(WX_KULISSEN_PLAN)) {
    const m = content.maps[id];
    const neu = m.decor.filter((d) => d.kulisse === 'wxr');
    assert.equal(neu.length, liste.length, id);
    const besetzt = new Set([...(m.interactables ?? []), ...(m.npcs ?? []), ...(m.roamers ?? [])].map((o) => o.tile + ''));
    for (const d of neu) {
      const [x, y] = d.tile;
      for (const dx of [-1, 0, 1]) assert.ok(boden.includes(m.rows[y][x + dx]), id + ' ' + d.sprite + ' auf ' + m.rows[y][x + dx]);
      assert.ok(!besetzt.has(d.tile + ''), id + ' ' + d.sprite);
      assert.ok(d.solid, id + ' ' + d.sprite + ' ohne Kollision');
    }
    const W = m.rows[0].length;
    const H = m.rows.length;
    const geh = (x, y) => begehbar.includes(m.rows[y]?.[x] ?? 'I');
    assert.ok(erreichbarMit(m, { W, H, boden: geh, fest: m.decor.filter((d) => d.solid).map((d) => d.tile.join(',')), neu: [] }), id);
  }
});

test('Wexmoor-Requisiten: leere Orte werden dichter, Kerzen und Prüflampe leuchten', () => {
  const dichte = (m) => (m.decor ?? []).filter((d) => d.ysort || d.solid).length / m.rows.join('').replace(/[^.sgwc,=P]/g, '').length;
  assert.ok(dichte(content.maps.wx_torfbrueche) > 0.012);
  assert.ok(content.maps.wx_flossfriedhof.decor.find((d) => d.sprite === 'wxr_totenfloss')?.light);
  assert.ok(content.maps.wx_lichtamt.decor.find((d) => d.sprite === 'wxr_lichtmessbank')?.light);
});
