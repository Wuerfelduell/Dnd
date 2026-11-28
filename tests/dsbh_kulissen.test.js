// Je fünf Requisiten für Dunscar und Briarholt (data/dsbhKulissen.js, data/briarholtKulisse2.js, tools/art/ds_bh_kulissen)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { DS_BH_SPRITES, DS_KLOTZ_PLAN, DS_BH_DAZU } from '../src/data/dsbhKulissen.js';
import { klotze } from '../src/data/calderwickKlotze.js';
import { ANIM_SHEETS } from '../src/world/assets.js';
import { erreichbarMit } from '../src/data/briarholtKulisse.js';

const content = loadContent();
const man = JSON.parse(readFileSync(new URL('../public/sprites/manifest-ds-bh-kulissen.json', import.meta.url), 'utf8'));
const boden = (m) => (x, y) => '.swgc,'.includes(m.rows[y]?.[x] ?? 'I');

test('Dunscar/Briarholt: zehn Dateien, je fünf, registriert', () => {
  assert.equal(man.assets.length, 10);
  assert.equal(man.assets.filter((a) => a.id.startsWith('dsk_')).length, 5);
  for (const a of man.assets) {
    assert.ok(existsSync(new URL('../public/sprites/' + a.file, import.meta.url)), a.file);
    assert.deepEqual(DS_BH_SPRITES[a.id], [a.width, a.height], a.id);
    assert.deepEqual(ANIM_SHEETS[a.id], [a.file, a.width, a.height], a.id);
  }
});

test('Klopfbruch: Kalkbrecher und Kalkkarren statt der Klötze, auf Y', () => {
  const m = content.maps.ds_klopfbruch;
  assert.deepEqual(klotze(m.rows).filter((k) => DS_KLOTZ_PLAN.ds_klopfbruch[(k.x1 - k.x0 + 1) + 'x' + (k.y1 - k.y0 + 1)]), []);
  const neu = m.decor.filter((d) => d.kulisse === 'dsbh' && d.block);
  assert.equal(neu.filter((d) => d.sprite === 'dsk_kalkbrecher').length, 6);
  assert.equal(neu.filter((d) => d.sprite === 'dsk_kalkkarren').length, 3);
  for (const d of neu) { const [x0, y0, x1, y1] = d.block; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) assert.equal(m.rows[y][x], 'Y'); }
});

test('Neue Stücke auf freiem Boden, nicht auf Objekten, alles bleibt erreichbar', () => {
  for (const id of new Set(DS_BH_DAZU.map((e) => e[0]))) {
    const m = content.maps[id];
    const neu = m.decor.filter((d) => d.kulisse === 'dsbh' && !d.block);
    assert.ok(neu.length >= 1, id);
    const besetzt = new Set([...(m.interactables ?? []).map((i) => i.tile + ''), ...(m.npcs ?? []).map((n) => n.tile + '')]);
    for (const d of neu) {
      assert.ok(boden(m)(...d.tile), id + ' ' + d.sprite + ' nicht auf Boden');
      assert.ok(!besetzt.has(d.tile + ''), id + ' ' + d.sprite + ' auf Objekt');
    }
    const W = m.rows[0].length;
    const H = m.rows.length;
    const fest = m.decor.filter((d) => d.solid).map((d) => d.tile[0] + ',' + d.tile[1]);
    assert.ok(erreichbarMit(m, { W, H, boden: boden(m), fest, neu: [] }), id);
  }
});

test('Briarholt: Laternen je Viertel, Probenkisten und Gepäck statt der Leihstücke', () => {
  const erwartet = { bh_glasgaerten: ['bhk_glashauslaterne', 'bhp_promenade_gaslaterne'], bh_kesselgrund: ['bhk_rohrlaterne', 'bhp_promenade_gaslaterne'],
    bh_stillenhaeuser: ['bhk_stillenlaterne', 'bhp_promenade_gaslaterne'], bh_wurzelkammer: ['bhk_probenkiste', 'bhp_kesselgrund_kiste'],
    bh_kutschenhof: ['bhk_gepaeckstapel', 'bhp_kesselgrund_kiste'] };
  for (const [base, [neu, alt]] of Object.entries(erwartet)) for (const id of [base, base + '__warm']) {
    const m = content.maps[id];
    if (!m) continue;
    assert.ok(m.decor.some((d) => d.sprite === neu), id + ' ' + neu);
    assert.ok(!m.decor.some((d) => d.sprite === alt), id + ' ' + alt + ' noch da');
  }
});
