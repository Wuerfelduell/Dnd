import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { WX_ORDNUNG, belegteFelder } from '../src/data/wexmoorOrdnung.js';
import { PROP_CELLS, PROP_ANIMS } from '../src/world/assets.js';

// Seb 2026-11-27: Wexmoor-Orte harmonischer – neue Requisiten nur auf freien Feldern, alles bleibt erreichbar
const content = loadContent();
const FREI = '.swgPpOE,L';
// Bild bekannt: als Prop-Zelle/Animation oder schon als Requisite auf einer anderen Karte im Einsatz (Manifest-Blätter)
const BEKANNT = new Set(Object.values(content.maps).flatMap((m) => (m.decor ?? []).filter((d) => !d.ordnung).map((d) => d.sprite)));

/** Felder, die man von der Ankunft aus erreicht; feste Requisiten (solid) sperren ihr Feld. */
function erreichbar(m) {
  const zu = new Set((m.decor ?? []).filter((d) => d.solid && d.ordnung).map((d) => `${d.tile[0]},${d.tile[1]}`));
  const start = m.spawns.default ?? Object.values(m.spawns)[0];
  const seen = new Set([`${start[0]},${start[1]}`]);
  const q = [start];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${x + dx},${y + dy}`;
      if (seen.has(k) || zu.has(k) || !FREI.includes(m.rows[y + dy]?.[x + dx] ?? 'I')) continue;
      seen.add(k);
      q.push([x + dx, y + dy]);
    }
  }
  return seen;
}

test('Wexmoor-Ordnung: neue Requisiten gibt es als Bild und sie liegen auf freien Feldern', () => {
  for (const id of Object.keys(WX_ORDNUNG)) {
    const m = content.maps[id];
    assert.ok(m, id);
    const neu = m.decor.filter((d) => d.ordnung);
    assert.ok(neu.length >= 5, `${id}: zu wenig neue Requisiten (${neu.length})`);
    const zu = belegteFelder(m);
    for (const d of neu) {
      assert.ok(PROP_CELLS[d.sprite] || PROP_ANIMS[d.sprite] || BEKANNT.has(d.sprite), `${id}: kein Bild für ${d.sprite}`);
      assert.ok(!zu.has(`${d.tile[0]},${d.tile[1]}`), `${id}: ${d.sprite} auf belegtem Feld ${d.tile}`);
      const ch = m.rows[d.tile[1]][d.tile[0]];
      if (d.solid) assert.ok(FREI.includes(ch), `${id}: feste Requisite ${d.sprite} auf ${ch}`);
      if (d.depth === 6) assert.equal(ch, '~', `${id}: ${d.sprite} gehört ins Wasser`);
    }
  }
});

test('Wexmoor-Ordnung: Ausgänge, Aufträge und Figuren bleiben erreichbar', () => {
  for (const id of Object.keys(WX_ORDNUNG)) {
    const m = content.maps[id];
    const vorher = erreichbar({ ...m, decor: [] });
    const nachher = erreichbar(m);
    const ziele = [...(m.interactables ?? []).map((i) => i.tile), ...(m.npcs ?? []).map((n) => n.tile), ...Object.values(m.spawns ?? {})];
    const nah = (seen, [x, y]) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`));
    for (const z of ziele) if (nah(vorher, z)) assert.ok(nah(nachher, z), `${id}: ${z} nicht mehr erreichbar`);
  }
});

test('Wexmoor-Ordnung: Vergessmoor und Salzwatt ohne einzelne Wasserlöcher, Wasser bleibt', () => {
  for (const id of ['wx_vergessmoor', 'wx_salzwatt']) {
    const r = content.maps[id].rows;
    const boote = new Set(content.maps[id].decor.filter((d) => (d.depth ?? 0) >= 5).map((d) => `${d.tile[0]},${d.tile[1]}`));
    let wasser = 0;
    for (let y = 1; y < r.length - 1; y++) for (let x = 1; x < r[0].length - 1; x++) {
      if (r[y][x] !== '~') continue;
      wasser++;
      if (boote.has(`${x},${y}`)) continue;
      assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => r[y + dy][x + dx] === '~'), `${id}: einzelnes Wasserloch bei ${x},${y}`);
    }
    assert.ok(wasser > 80, `${id}: zu wenig Wasser (${wasser})`);
  }
});
