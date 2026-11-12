// Codex DN (seq4rit1), DO (schatten), DQ (rituale56), DT (ritualicons2): Ritualgrafiken sind vollständig verdrahtet.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { RITUAL_ART } from '../src/data/ritualArt.js';
import { BATTLE_SHEETS, ENCOUNTER_SHEETS, DT_ICONS, ITEM_ICON_ALIASES, ritualBattleSheet } from '../src/world/assets.js';

const sprite = (p) => new URL(`../public/sprites/${p}`, import.meta.url);
const manifest = (n) => JSON.parse(readFileSync(sprite(`manifest-${n}.json`), 'utf8'));

test('Codex DN/DO/DQ: die erzeugte Tabelle deckt jedes Bild der drei Manifeste ab, Maße stimmen', () => {
  const files = ['seq4rit1', 'schatten', 'rituale56'].flatMap((n) => manifest(n).assets.map((a) => a.file));
  assert.equal(files.length, 132);
  const table = Object.values(RITUAL_ART).map((e) => e.file).sort();
  assert.deepEqual(table, [...files].sort(), 'tools/art/ritual_art_table.py neu laufen lassen');
  for (const [key, e] of Object.entries(RITUAL_ART)) {
    assert.ok(existsSync(sprite(e.file)), e.file);
    assert.equal(e.sw % e.w, 0, key);
    assert.equal(e.sh % e.h, 0, key);
  }
});

test('Codex DN/DO: Zivilist und Schatten kämpfen mit eigenen Blättern je Figur, die Laternenbestie mit ihrem', () => {
  for (const look of ['player', 'p2a', 'p2b']) {
    for (const kind of ['zivil', 'shadow']) {
      const key = ritualBattleSheet(kind, look);
      assert.ok(BATTLE_SHEETS[key], key);
      assert.ok(existsSync(sprite(BATTLE_SHEETS[key][0])), key);
    }
    assert.ok(RITUAL_ART[`s4ma_zivil_${look}`] && RITUAL_ART[`schatten_${look}`] && RITUAL_ART[`schatten_koerper_${look}`] && RITUAL_ART[`s5_kokon_${look}`], look);
  }
  assert.equal(ENCOUNTER_SHEETS.laternenbestie, 'enemy_laternenbestie');
});

test('Codex DT: die 13 Leihbilder sind ersetzt (16 und 32 px)', () => {
  assert.equal(DT_ICONS.length, 13);
  for (const id of DT_ICONS) {
    assert.ok(!ITEM_ICON_ALIASES[id], id);
    assert.ok(existsSync(sprite(`items/${id}.png`)) && existsSync(sprite(`items/32/${id}.png`)), id);
  }
});
