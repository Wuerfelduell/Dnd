// Varrowmouth-Kulissen Runde 1 (src/data/varrowmouthKulisse.js, tools/art/vm_kulissen): Requisiten auf den Y/Z-Blöcken, nichts versperrt
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadContent } from './helpers.js';
import { VM_KULISSE } from '../src/data/varrowmouthKulisse.js';
import { ANIM_SHEETS, VM_KULISSEN_SHEETS, REGION_SHEETS, SHEETS } from '../src/world/assets.js';
import { erreichbarMit } from '../src/data/briarholtKulisse.js';

const content = loadContent();
const pub = (p) => new URL(`../public/sprites/${p}`, import.meta.url);
const man = JSON.parse(readFileSync(pub('manifest-vm-kulissen.json'), 'utf8'));
const cv = JSON.parse(readFileSync(pub('manifest-varrowmouth1.json'), 'utf8'));
const WALK = new Set([...'.,=']);

test('Kulissen-Runde 1: zehn Assets, registriert, Datei und Manifest passen zusammen', () => {
  assert.equal(man.assets.length, 10);
  for (const a of man.assets) {
    assert.ok(existsSync(pub(a.file)), a.file);
    assert.deepEqual(VM_KULISSEN_SHEETS[a.id], [a.frameWidth, a.frameHeight], a.id);
    assert.deepEqual(ANIM_SHEETS[a.id], [a.file, a.frameWidth, a.frameHeight], a.id);
  }
  assert.deepEqual(REGION_SHEETS.vmf, ['manifestVarrowmouth1', 'vm_fassaden']);
  assert.equal(SHEETS.vmf, 'facades/vm_fassaden.png');
});

test('Kulissen-Runde 1: jede geplante Requisite steht in ihrer Karte, Sprites gibt es', () => {
  const regionen = Object.fromEntries(cv.assets.filter((a) => a.regions).flatMap((a) => Object.keys(a.regions).map((r) => [`${a.id === 'vm_fassaden' ? 'vmf' : 'vmp'}_${r}`, true])));
  for (const [id, plan] of Object.entries(VM_KULISSE)) {
    const decor = content.maps[id].decor.filter((d) => d.kulisse === 'vm1');
    assert.equal(decor.length, plan.decor.length, id);
    for (const d of decor) {
      const frames = VM_KULISSEN_SHEETS[d.sprite];
      assert.ok(frames || regionen[d.sprite], `${id}: ${d.sprite}`);
      if (frames && d.frame) assert.ok(man.assets.find((a) => a.id === d.sprite).frames > d.frame, `${id}: ${d.sprite}#${d.frame}`);
    }
  }
});

test('Kulissen-Runde 1: Requisiten stehen auf festen Y/Z-Blöcken, der Nebel ist nicht fest, kein Weg und kein Eingang versperrt', () => {
  for (const id of Object.keys(VM_KULISSE)) {
    const m = content.maps[id];
    const W = m.rows[0].length;
    const H = m.rows.length;
    for (const d of m.decor.filter((e) => e.kulisse === 'vm1')) {
      assert.ok(!d.solid, `${id}: ${d.sprite} blockiert zusätzlich`);
      if (d.nebel) continue;
      const [x0, y0, x1, y1] = d.block ?? [d.tile[0], d.tile[1], d.tile[0], d.tile[1]];
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const rand = x === x0 || x === x1;
        if (d.durchgang && !rand) assert.ok(WALK.has(m.rows[y][x]), `${id}: Durchgang unter ${d.sprite} bei ${x},${y} zu`);
        else assert.ok('YZ'.includes(m.rows[y][x]), `${id}: ${d.sprite} über ${x},${y} = ${m.rows[y][x]}`);
      }
    }
    // Y/Z sind fest, alles Begehbare bleibt erreichbar: Spawns, Türen, Figuren, Fundstellen
    assert.ok(erreichbarMit(m, { W, H, boden: (x, y) => WALK.has(m.rows[y]?.[x]), fest: [], neu: [] }), id);
    for (const i of m.interactables ?? []) assert.ok(!'YZI'.includes(m.rows[i.tile[1]][i.tile[0]]), `${id}: ${i.id} steht auf einem Block`);
  }
});

test('Kulissen-Runde 1: Y/Z nur in den vier Orten, ihre Felder waren vorher Hauswand-Blöcke (gleiche Begehbarkeit)', () => {
  for (const [id, m] of Object.entries(content.maps)) {
    if (m.city !== 'varrowmouth') continue;
    const n = m.rows.join('').replace(/[^YZ]/g, '').length;
    assert.equal(n > 0, id in VM_KULISSE, id);
  }
  // Grenzzaun: das Tor (22..25) bleibt offen, der Zaun bleibt durchgehend fest
  const g = content.maps.vm_grenzzaun.rows[15];
  assert.equal(g.slice(22, 26), '....');
  assert.equal(g.slice(1, 22) + g.slice(26, 47), 'Z'.repeat(42));
});
