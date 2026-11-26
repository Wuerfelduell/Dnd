import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ANIM_SHEETS, SHEETS } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

// Calderwick-Kulisse (data/calderwickKulisse.js): Häuser, Möbelblöcke, Fassaden, Rohrpost, Laternen, Licht und Nebel
const content = loadContent();
const MAPS = Object.values(content.maps).filter((m) => m.id.startsWith('cw_') || (m.id.startsWith('o3_') && m.city === 'calderwick'));
const m1 = JSON.parse(readFileSync(new URL('../public/sprites/manifest-calderwick1.json', import.meta.url), 'utf8'));
const zellen = (file) => { const a = m1.assets.find((x) => x.file === file); return a ? a.columns * a.rows : 64; };

/** Felder, die man von der Ankunft aus erreicht; `zu` sind zusätzlich blockierte Felder. */
function erreichbar(m, zu) {
  const start = m.spawns.default ?? Object.values(m.spawns)[0];
  const seen = new Set([`${start[0]},${start[1]}`]);
  const q = [start];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${x + dx},${y + dy}`;
      if (seen.has(k) || zu.has(k) || !'.swg'.includes(m.rows[y + dy]?.[x + dx] ?? 'I')) continue;
      seen.add(k);
      q.push([x + dx, y + dy]);
    }
  }
  return seen;
}
const ziele = (m) => [...(m.interactables ?? []).map((i) => i.tile), ...(m.npcs ?? []).map((n) => n.tile), ...Object.values(m.spawns ?? {})];
const nah = (seen, [x, y]) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`));

test('Calderwick-Kulisse: alle Stadtkarten und Pfadviertel bekommen Deko und Licht', () => {
  assert.equal(MAPS.length, 27);
  for (const m of MAPS) {
    const k = m.decor.filter((d) => d.kulisse || d.sprite.startsWith('bht_') || d.sprite.startsWith('bhd_'));
    assert.ok(k.length >= 10, `${m.id}: nur ${k.length} Kulissenstücke`);
    assert.ok(m.lights.length >= 3, `${m.id}: Licht`);
  }
  // Terrassen: Häuser mit Dach und Fenstern, Laternen, Geländer, dichterer Nebel
  for (const id of ['cw_gleisfuss', 'cw_setzergasse', 'cw_quittungsmarkt', 'cw_roehrenhof', 'cw_witwenterrasse', 'cw_kronenarchiv']) {
    const m = content.maps[id];
    assert.ok(m.facades?.length >= 3 && m.rows.join('').split('D').length > 4, `${id}: Häuser mit Fassaden und Türen (Stadtplan)`);
    assert.ok(m.decor.filter((d) => d.sprite === 'lamp_lit').length >= 3, `${id}: Laternen`);
    assert.ok(m.decor.some((d) => d.sprite === 'cwt_terrasse' && d.frame === 7 && d.tile[1] === m.rows.length - 1), `${id}: Geländer`);
    assert.equal(m.ambient.fog, 0.13);
  }
  assert.ok(content.maps.cw_nullfundament.decor.some((d) => d.anim?.[1] === 'namensnische'), 'Nullfundament: glimmende Nischen');
  for (const id of ['o3_laterne', 'o3_eisen', 'o3_echo']) assert.equal(content.maps[id].ambient.fog, 0.22, `${id}: Nebel bleibt dicht`);
});

test('Calderwick-Kulisse: Zellen liegen im Blatt, Texturen sind registriert, flache Stücke auf Boden', () => {
  for (const m of MAPS) for (const d of m.decor.filter((x) => x.kulisse)) {
    const sheet = ANIM_SHEETS[d.sprite] ?? (SHEETS[d.sprite] ? [SHEETS[d.sprite]] : null);
    assert.ok(sheet || d.sprite.startsWith('cwp_') || ['lamp_lit', 'oil_lamp'].includes(d.sprite), `${m.id}: ${d.sprite}`);
    if (d.sprite.startsWith('cwt_')) assert.ok(d.frame >= 0 && d.frame < zellen(sheet[0]), `${m.id}: ${d.sprite} Zelle ${d.frame}`);
    if (d.depth === 39 || d.depth === 38) assert.match(m.rows[d.tile[1]][d.tile[0]], /[.swg]/, `${m.id}: ${d.sprite} auf ${d.tile}`);
  }
});

test('Calderwick-Kulisse: feste Stücke versperren keinen Weg, nichts steht auf Objekten', () => {
  for (const m of MAPS) {
    const ohne = erreichbar(m, new Set());
    const zu = new Set(m.decor.filter((d) => d.solid && (d.kulisse || d.sprite.startsWith('bht_'))).map((d) => d.tile.join(',')));
    const mit = erreichbar(m, zu);
    for (const z of ziele(m)) if (nah(ohne, z)) assert.ok(nah(mit, z), `${m.id}: ${z} nicht mehr erreichbar`);
    const objekte = new Set(ziele(m).map((t) => t.join(',')));
    for (const d of m.decor.filter((x) => x.solid && x.kulisse)) assert.ok(!objekte.has(d.tile.join(',')), `${m.id}: ${d.sprite} auf Objekt ${d.tile}`);
  }
});
