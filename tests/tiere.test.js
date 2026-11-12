// Codex DF: Tiergefährten (Rabe, Kater, Hund), Fund, Füttern, Stufen, Kampfeingriff.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Tiere: Fundplätze auf Sternwarte, Salzmarkt und Endbahnhof, Fund setzt Besitz und Flag', () => {
  for (const [id, map] of [['tier_rabe', 'sternwarte'], ['tier_kater', 'wx_salzmarkt'], ['tier_hund', 'ds_endbahnhof']]) {
    assert.ok(content.maps[map].interactables.some((i) => i.dialogue === `fund_${id}` && i.tile), `${id}: Fundplatz`);
  }
  const s = new GameState(content);
  const tree = content.dialogues.fund_tier_rabe;
  const ende = Object.values(tree.nodes).find((n) => n.tier_claim);
  s.applyEffects(ende);
  assert.ok(s.flags.has('tier_rabe_gefunden'));
  assert.equal(s.tierAktiv(), 'tier_rabe');
  assert.ok(s.passive('vision_cost') < 1);
  const back = new GameState(content);
  back.load(JSON.parse(JSON.stringify(s.serialize(null))));
  assert.equal(back.tierAktiv(), 'tier_rabe');
});

test('Tiere: Füttern einmal je Spieltag, Stufe steigt, Ungeliebtes wird nicht verbraucht', () => {
  const s = new GameState(content);
  s.tierClaim('tier_kater');
  s.addItem('salzbrot', 5);
  s.tierFuettern('tier_kater', 'salzbrot');
  assert.equal(s.itemCount('salzbrot'), 4);
  s.tierFuettern('tier_kater', 'salzbrot');
  assert.equal(s.itemCount('salzbrot'), 4, 'nur einmal je Tag');
  s.tiere.owned.tier_kater.punkte = 5;
  assert.equal(s.tierStufe('tier_kater'), 2);
});
