// Briarholt-Kulissen Runde 2 (src/data/briarholtKulisse2.js, tools/art/bh_kulissen): eigene Dächer statt future200, Innenräume ohne Leihstücke
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { BH_DACH_ERSATZ, BH_INNEN, DACH_FRAMES } from '../src/data/briarholtKulisse2.js';
import { ANIM_SHEETS, BH_KULISSEN_SHEETS } from '../src/world/assets.js';
import { erreichbarMit } from '../src/data/briarholtKulisse.js';

const content = loadContent();
const pub = (p) => new URL(`../public/sprites/${p}`, import.meta.url);
const man = JSON.parse(readFileSync(pub('manifest-bh-kulissen.json'), 'utf8'));
const BH = Object.values(content.maps).filter((m) => m.city === 'briarholt' && m.id.startsWith('bh_'));

test('Briarholt-Kulissen: zehn Assets, registriert, Datei und Manifest passen', () => {
  assert.equal(man.assets.length, 10);
  for (const a of man.assets) {
    assert.ok(existsSync(pub(a.file)), a.file);
    assert.deepEqual(BH_KULISSEN_SHEETS[a.id], [a.frameWidth, a.frameHeight], a.id);
    assert.deepEqual(ANIM_SHEETS[a.id], [a.file, a.frameWidth, a.frameHeight], a.id);
  }
  for (const id of Object.values(BH_DACH_ERSATZ)) assert.equal(man.assets.find((a) => a.id === id).frames, DACH_FRAMES.length * 2, id);
});

test('Briarholt-Kulissen: keine future200-Dachtextur mehr in den Karten, kalt Zeile 0, warm Zeile 1', () => {
  let daecher = 0;
  for (const m of BH) {
    const warm = m.tiles.endsWith('_warm');
    for (const d of m.decor ?? []) {
      assert.ok(!BH_DACH_ERSATZ[d.sprite], `${m.id}: ${d.sprite}`);
      if (!d.sprite.startsWith('bhk_dach_')) continue;
      daecher++;
      assert.equal(d.frame >= DACH_FRAMES.length, warm, `${m.id}: Frame ${d.frame}`);
      assert.ok(!d.solid && d.alpha === 1, m.id);
    }
  }
  assert.ok(daecher > 500, `nur ${daecher} Dachfelder`);
});

test('Briarholt-Kulissen: Leihstücke in den Innenräumen getauscht, neue Stücke auf Boden, alles erreichbar', () => {
  for (const [base, plan] of Object.entries(BH_INNEN)) {
    for (const id of [base, `${base}__warm`]) {
      const m = content.maps[id];
      if (!m) continue;
      for (const [alt, neu] of plan.tausch ?? []) {
        assert.ok(!m.decor.some((d) => d.sprite === alt), `${id}: ${alt} noch da`);
        assert.ok(m.decor.some((d) => d.sprite === neu), `${id}: ${neu} fehlt`);
      }
      for (const [sprite] of plan.dazu ?? []) assert.ok(m.decor.some((d) => d.sprite === sprite && !d.getauscht), `${id}: ${sprite} fehlt`);
      const besetzt = new Set([...(m.interactables ?? []).map((i) => `${i.tile}`), ...(m.npcs ?? []).map((n) => `${n.tile}`)]);
      for (const d of m.decor.filter((e) => e.kulisse === 'bh2' && !e.sprite.startsWith('bhk_dach_'))) {
        assert.ok(!besetzt.has(`${d.tile}`), `${id}: ${d.sprite} auf einem Objekt`);
        assert.ok('.swg'.includes(m.rows[d.tile[1]][d.tile[0]]), `${id}: ${d.sprite} nicht auf Boden`);
      }
      const W = m.rows[0].length;
      const H = m.rows.length;
      const boden = (x, y) => '.swg'.includes(m.rows[y]?.[x] ?? 'I');
      const fest = m.decor.filter((d) => d.solid).map((d) => `${d.tile[0]},${d.tile[1]}`);
      assert.ok(erreichbarMit(m, { W, H, boden, fest, neu: [] }), `${id}: nicht alles erreichbar`);
    }
  }
});
