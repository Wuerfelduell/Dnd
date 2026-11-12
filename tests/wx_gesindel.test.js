import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GESINDEL } from '../src/data/seq4Dr.js';
import { DIEBSTAHL } from '../src/core/Seq5.js';

const c = loadContent();

test('Wexmoorer Gesindel: Menschen mit Taschen streifen wiederkehrend durch Wexmoor', () => {
  for (const [base, g] of Object.entries(GESINDEL)) {
    const id = `wxs_${base}`;
    const e = c.encounters[id];
    assert.ok(e, id);
    assert.equal(e.occult, false, `${id}: muss bestehlbar sein`);
    assert.equal(c.loot[id].repeat, true, `${id}: kommt wieder`);
    assert.equal(e.lose_to.map, 'wx_kahn');
    assert.ok(e.hp >= 120, `${id}: hält lang genug für ${DIEBSTAHL} Schilling Diebstahl`);
    for (const m of g.maps) {
      const map = c.maps[m];
      const r = map.roamers.find((x) => x.encounter === id);
      assert.ok(r?.visible_if.requires_flags.includes('k2_arrived'), `${id} auf ${m}`);
      for (const [sx, sy] of Object.values(map.spawns)) assert.ok(Math.abs(r.tile[0] - sx) + Math.abs(r.tile[1] - sy) >= 10, `${id}: zu nah am Eingang von ${m}`);
    }
  }
});
