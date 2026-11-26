import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { CW_TERRASSEN } from '../src/data/calderwickStadtplan.js';

// Calderwick-Stadtplan: eigene Terrassen-Pläne, alles erreichbar, Rückwege vor der richtigen Haustür
const content = loadContent();
const frei = (m, x, y) => '.swg'.includes(m.rows[y]?.[x] ?? 'I');
function erreichbar(m) {
  const zu = new Set(m.decor.filter((d) => d.solid).map((d) => `${d.tile[0]},${d.tile[1]}`));
  const s = m.spawns.default;
  const seen = new Set([`${s[0]},${s[1]}`]);
  const q = [s];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${x + dx},${y + dy}`;
      if (seen.has(k) || zu.has(k) || !frei(m, x + dx, y + dy)) continue;
      seen.add(k);
      q.push([x + dx, y + dy]);
    }
  }
  return seen;
}

test('Stadtplan: jede Terrasse hat Häuser, Platz und alle Objekte sind erreichbar', () => {
  for (const id of CW_TERRASSEN) {
    const m = content.maps[id];
    assert.equal(m.rows.length, 28);
    assert.ok(m.rows.every((r) => r.length === 52), id);
    assert.ok(m.rows.join('').split('R').length > 150, `${id}: Dächer`);
    const r = erreichbar(m);
    const nah = ([x, y]) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => r.has(`${x + dx},${y + dy}`));
    for (const o of [...m.interactables, ...m.npcs]) assert.ok(nah(o.tile), `${id}: ${o.id} auf ${o.tile} nicht erreichbar`);
    for (const [n, s] of Object.entries(m.spawns)) assert.ok(r.has(`${s[0]},${s[1]}`), `${id}: Spawn ${n}`);
    // Aushänge in der alten Reihe oben links sind verteilt
    assert.ok(m.interactables.filter((o) => o.tile[1] === 3 && o.tile[0] < 14).length <= 2, `${id}: Objekte noch gestapelt`);
  }
});

test('Stadtplan: wer aus einem Innenraum kommt, steht vor dessen Haustür', () => {
  for (const [raum, terrasse] of [['cw_gepaeckhalle', 'cw_gleisfuss'], ['cw_buchbinderei', 'cw_setzergasse'], ['cw_alte_setzerei', 'cw_setzergasse'], ['cw_pfandhaus', 'cw_quittungsmarkt'],
    ['cw_sortierhalle', 'cw_roehrenhof'], ['cw_sortiergrube', 'cw_roehrenhof'], ['cw_kueche', 'cw_witwenterrasse'], ['cw_archivsaal', 'cw_kronenarchiv'], ['cw_villa', 'cw_kronenarchiv'], ['cw_nullfundament', 'cw_kronenarchiv']]) {
    const raus = content.maps[raum].interactables.find((i) => i.kind === 'door' && i.to === terrasse);
    const rein = content.maps[terrasse].interactables.find((i) => i.kind === 'door' && i.to === raum);
    const s = content.maps[terrasse].spawns[raus.spawn];
    assert.ok(s, `${raum}: Spawn ${raus.spawn}`);
    assert.ok(Math.abs(s[0] - rein.tile[0]) + Math.abs(s[1] - rein.tile[1]) <= 1, `${raum}: Spawn neben der Tür`);
    assert.equal(content.maps[terrasse].rows[rein.tile[1] - 1][rein.tile[0]], 'D', `${raum}: Haustür`);
  }
});
