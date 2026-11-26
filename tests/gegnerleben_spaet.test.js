import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, DUO_HP_MULT } from '../src/core/Combat.js';
import { SPAET_LEBEN, CALDERWICK_VERDAUUNG } from '../src/data/gegnerlebenSpaet.js';
import { loadContent } from './helpers.js';

const content = loadContent();
const hp = (id) => new Combat(new GameState(content), id).enemy.maxHp;

test('Seb 2026-11-26: Calderwick 10.000–25.000 Leben im Koop, Briarholt darüber, Heiligenstadt noch darüber', () => {
  assert.equal(hp('vg_cw_letternlaeufer'), SPAET_LEBEN.calderwick.normal);
  assert.equal(hp('o3_laterne_g1'), SPAET_LEBEN.calderwick.normal);
  assert.equal(hp('o3_laterne_siegel1'), SPAET_LEBEN.calderwick.elite);
  assert.equal(hp('vg_cw_boss_bleisammler'), SPAET_LEBEN.calderwick.boss);
  assert.ok(hp('o3_laterne_herd6') > hp('o3_laterne_herd1'), 'Herde bleiben gestaffelt');
  assert.equal(SPAET_LEBEN.calderwick.normal * DUO_HP_MULT, 10000);
  assert.equal(SPAET_LEBEN.calderwick.boss * DUO_HP_MULT, 25000);
  assert.equal(hp('vg_bh_glasmotte'), SPAET_LEBEN.briarholt.normal);
  assert.equal(hp('vg_bh_glasmotte_elite'), SPAET_LEBEN.briarholt.elite);
  assert.equal(hp('vg_bh_boss_glasgaertner'), SPAET_LEBEN.briarholt.boss);
  assert.ok(hp('hs2_halbgott_laterne') > SPAET_LEBEN.briarholt.normal && hp('hs2_engel_1') > SPAET_LEBEN.briarholt.boss);
  // Schaden ×1,3, Calderwick-Siege verdauen ×10
  assert.equal(content.encounters.vg_cw_letternlaeufer.attacks.find((a) => !a.action).damage > 0, true);
  assert.equal(content.encounters.o3_laterne_g1.verdau_mult, CALDERWICK_VERDAUUNG);
  assert.equal(content.encounters.vg_bh_glasmotte.verdau_mult, undefined);
});

test('Calderwick-Sieg verdaut ×10, der Boss-Fixwert bleibt 3 %', () => {
  const win = (id, verdau) => {
    const s = new GameState(content);
    s.pathway = { id: 'eisen', seq: 4, digestion: 0 };
    s.updateMaxHp();
    const c = new Combat(s, id);
    if (!verdau) c.enc = { ...c.enc, verdau_mult: 1 };
    c.outcome = 'won';
    c.finish();
    return s.pathway.digestion;
  };
  assert.ok(Math.abs(win('vg_cw_letternlaeufer', true) / win('vg_cw_letternlaeufer', false) - 10) < 0.01);
  const s = new GameState(content);
  s.pathway = { id: 'sq_moor', seq: 4, digestion: 0 };
  const c = new Combat(s, 'vg_cw_boss_bleisammler');
  c.outcome = 'won';
  c.finish();
  assert.equal(s.pathway.digestion, 3);
});
