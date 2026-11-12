// Schlackengrube (Seb 2026-11-12): neues Dunscarer Gefahrengebiet Stufe 7 mit würdigen Farmgegnern. `npm test`
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { SG_ID, SG_FORMEL, SG_ZUTAT4, sgRang } from '../src/data/dunscarSchlacke.js';
import { FORMEL_K3_CHANCE, K3_ZUTAT4_CHANCE } from '../src/data/pfadHandel.js';

const content = loadContent();
const map = content.maps[SG_ID];

test('Schlackengrube: Ausgang vom Kalkmarkt mit Gefahrenstufe, Reiseziel und Pin, alle Gegner erreichbar', () => {
  assert.equal(map.danger, 7);
  assert.equal(content.zones[SG_ID].tier, 7);
  const tuer = content.maps.ds_kalkmarkt.interactables.find((d) => d.to === SG_ID);
  assert.ok(tuer && /⚠7/.test(tuer.label), 'Tür mit Schild und Stufe');
  assert.ok(map.interactables.some((d) => d.kind === 'door' && d.to === 'ds_kalkmarkt'));
  assert.ok(content.travel.some((t) => t.map === SG_ID && t.requires_flags.includes('k3_arrived')));
  assert.ok(content.travelRules.cities.dunscar.pins[SG_ID]);
  // alles vom Eingang aus zu Fuß erreichbar
  const seen = new Set([map.spawns.default.join()]);
  const todo = [map.spawns.default];
  while (todo.length) {
    const [x, y] = todo.pop();
    for (const [a, b] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (map.rows[b]?.[a] !== 's' || seen.has(`${a},${b}`)) continue;
      seen.add(`${a},${b}`);
      todo.push([a, b]);
    }
  }
  for (const r of map.roamers) assert.ok(seen.has(r.tile.join()), `${r.encounter} unerreichbar`);
});

test('Schlackengrube: 9 normale, 5 Elite, 3 Mittelbosse und ein wiederkehrender Gebietsboss mit eigenen Mechaniken', () => {
  const rang = (r) => sgRang(content.encounters[r.encounter]);
  const n = (k) => map.roamers.filter((r) => rang(r) === k).length;
  assert.deepEqual([n('normal'), n('elite'), n('mittel'), n('boss')], [9, 5, 3, 1]);
  assert.ok(map.roamers.find((r) => r.boss).respawn);
  const sg = Object.entries(content.encounters).filter(([id]) => id.startsWith('sg_') && !id.endsWith('_elite'));
  for (const [id, e] of sg) {
    const mechanik = e.ramp || e.ambush || e.sweep || e.phase2 || e.attacks.some((a) => a.action || a.bleed || a.nerves || a.unparryable);
    assert.ok(mechanik, `${id}: keine Eigenheit`);
    if (e.mittelboss || e.boss) assert.ok(e.phase2, `${id}: zweite Haltung`);
  }
});

test('Schlackengrube: Beute deutlich reicher als im übrigen Dunscar', () => {
  const wert = (id) => (content.loot[id].drops ?? []).reduce((s, d) => s + (content.items[d.item]?.price ?? 0) * (d.chance ?? 1), 0)
    + (content.loot[id].money[0] + content.loot[id].money[1]) / 2;
  assert.ok(wert('sg_schlackenlaeufer') > wert('schichtgaenger') * 2);
  assert.ok(wert('sg_schlackenbraut') > wert('nachhall_elite') * 2);
  assert.ok(wert('sg_schlackenvorhauer') > wert('ds_gb_tiefenvorarbeiter') * 1.5);
});

test('Schlackengrube: Formeln und Seq-4-Kernzutat fallen häufiger', () => {
  for (const k of ['normal', 'elite', 'boss']) assert.ok(SG_FORMEL[4][k] > FORMEL_K3_CHANCE[4][k], k);
  assert.ok(SG_ZUTAT4.elite > K3_ZUTAT4_CHANCE.elite && SG_ZUTAT4.boss > K3_ZUTAT4_CHANCE.boss);
  const s = new GameState(content);
  s.pathway = { ...(s.pathway ?? {}), id: 'laterne', seq: 5 };
  const roll = (id, r) => { const loot = { items: {} }; s.pfadExtraLoot({ enc: content.encounters[id], id }, loot, () => r); return loot.items; };
  assert.equal(roll('sg_schlackenbraut', SG_FORMEL[4].mittel - 0.001).formel_laterne_4, 1);
  s.flags.delete('ph_formel_laterne');
  assert.equal(roll('sg_schlackenbraut', SG_FORMEL[4].mittel + 0.001).formel_laterne_4, undefined);
  assert.equal(roll('sg_schlackenvorhauer', SG_ZUTAT4.boss - 0.001).sq_zutat_laterne_4, 1);
});
