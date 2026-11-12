import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';

const content = loadContent();
const aussen = Object.values(content.maps).filter((m) => m.id.startsWith('ds_') && m.rows[0].length >= 40);
const floor = (m, x, y) => /[.swg]/.test(m.rows[y]?.[x] ?? '');

test('Dunscar-Kulisse: Ausgänge tragen Schilder, liegen auf eigenem Boden und führen an die Rückweg-Tür', () => {
  for (const m of aussen) {
    const doors = m.interactables.filter((d) => d.kind === 'door');
    const seen = new Set();
    for (const d of doors) {
      assert.ok(d.label, `${m.id}: ${d.id} ohne Schild`);
      assert.ok(floor(m, ...d.tile), `${m.id}: ${d.id} nicht auf Boden`);
      assert.ok(!seen.has(`${d.tile}`), `${m.id}: zwei Türen auf ${d.tile}`);
      seen.add(`${d.tile}`);
      const ziel = content.maps[d.to];
      assert.ok(ziel?.spawns?.[d.spawn ?? 'default'], `${m.id}: ${d.id} → ${d.to} Spawn ${d.spawn} fehlt`);
      if (d.spawn?.startsWith('von_')) {
        const back = ziel.interactables.find((b) => b.kind === 'door' && b.to === m.id);
        const [sx, sy] = ziel.spawns[d.spawn];
        assert.ok(back && Math.abs(back.tile[0] - sx) + Math.abs(back.tile[1] - sy) === 1, `${m.id} → ${d.to}: Ankunft nicht an der Rücktür`);
      }
    }
  }
});

test('Dunscar-Kulisse: feste Requisiten sperren keinen Weg zu Türen, Figuren und Lesestellen', () => {
  for (const m of aussen) {
    const blocked = new Set();
    for (const d of m.decor ?? []) {
      if (!d.solid || !d.sprite.startsWith('dsp_')) continue;
      const [x, y] = d.tile;
      const half = Math.ceil(d.solid[0] / 32);
      for (let dx = -half + 1; dx < half; dx++) blocked.add(`${x + dx},${y}`);
    }
    const start = m.spawns.default;
    const seen = new Set([`${start}`]);
    const queue = [start];
    while (queue.length) {
      const [x, y] = queue.shift();
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        const k = `${nx},${ny}`;
        if (seen.has(k) || !floor(m, nx, ny) || blocked.has(k)) continue;
        seen.add(k);
        queue.push([nx, ny]);
      }
    }
    const reach = ([x, y]) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`));
    for (const o of [...m.interactables, ...(m.npcs ?? [])]) assert.ok(reach(o.tile), `${m.id}: ${o.id} nicht erreichbar`);
  }
});
