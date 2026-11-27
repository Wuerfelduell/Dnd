import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { KETTLEGATE_PLAN, BODEN } from '../src/data/kettlegateKulisse.js';
import { erreichbarMit } from '../src/data/briarholtKulisse.js';

const content = loadContent();
const near = (a, x, y) => Math.abs(a[0] - x) <= 2 && Math.abs(a[1] - y) <= 2;

test('Kettlegate-Feinschliff: jede geplante Requisite steht, auf freiem Boden und nicht auf Objekten oder Figuren', () => {
  for (const [id, plan] of Object.entries(KETTLEGATE_PLAN)) {
    const m = content.maps[id];
    const neu = m.decor.filter((d) => d.kulisse);
    for (const r of plan.dazu ?? []) assert.ok(neu.some((d) => d.sprite === r.sprite && near(d.tile, r.x, r.y)), `${id}: ${r.sprite} bei ${r.x},${r.y}`);
    const besetzt = new Set([...(m.interactables ?? []).map((i) => `${i.tile}`), ...(m.npcs ?? []).map((n) => `${n.tile}`)]);
    for (const d of neu) {
      assert.ok(!besetzt.has(`${d.tile}`), `${id}: ${d.sprite} auf ${d.tile}`);
      const ch = m.rows[d.tile[1]][d.tile[0]];
      assert.ok(BODEN.has(ch) || ch === '~', `${id}: ${d.sprite} auf „${ch}“`);
    }
  }
});

test('Kettlegate-Feinschliff: Einwohner verteilt, auf Boden, nicht mehr in einer Reihe', () => {
  for (const [id, plan] of Object.entries(KETTLEGATE_PLAN)) {
    const m = content.maps[id];
    for (const [fid, , [x, y]] of plan.figuren ?? []) {
      assert.ok(m.npcs.some((n) => n.id === fid && n.tile[0] === x && n.tile[1] === y), `${id}: ${fid}`);
      assert.ok(BODEN.has(m.rows[y][x]), `${id}: ${fid} auf Boden`);
    }
    const reihe4 = (m.npcs ?? []).filter((n) => n.id.startsWith('kgl_e_') && n.tile[1] === 4).length;
    assert.ok(reihe4 <= 1, `${id}: ${reihe4} Einwohner in der obersten Straßenreihe`);
  }
});

test('Kettlegate-Feinschliff: feste Requisiten versperren keinen Weg', () => {
  for (const id of Object.keys(KETTLEGATE_PLAN)) {
    const m = content.maps[id];
    const W = m.rows[0].length;
    const H = m.rows.length;
    const boden = (x, y) => BODEN.has(m.rows[y]?.[x]);
    const fest = m.decor.filter((d) => d.kulisse && d.solid).map((d) => `${d.tile[0]},${d.tile[1]}`);
    if (!fest.length) continue;
    assert.equal(erreichbarMit(m, { W, H, boden, fest: [], neu: fest }), erreichbarMit(m, { W, H, boden, fest: [], neu: [] }), id);
  }
});

test('Nachtmarkt: zehn Felder breiter, alle Reihen gleich lang, Feuerkörbe nicht mehr auf Figuren', () => {
  const m = content.maps.nachtmarkt;
  assert.equal(m.rows[0].length, 40);
  assert.ok(m.rows.every((r) => r.length === 40));
  const figuren = new Set(m.npcs.map((n) => `${n.tile}`));
  for (const d of m.decor.filter((e) => e.sprite === 'brazier')) assert.ok(!figuren.has(`${d.tile}`), `${d.tile}`);
});

test('Revier und Pestgassen: weniger Kleinkram', () => {
  assert.ok(!content.maps.revier.decor.some((d) => d.sprite === 'b_archiv_leiter'));
  assert.ok(content.maps.pestgassen.decor.length <= 42);
});
