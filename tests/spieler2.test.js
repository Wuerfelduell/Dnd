// Paket AH: eigene Figur für Spieler 2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { P2_LOOKS, SHEETS, ANIM_SHEETS, BATTLE_SHEETS, TURN_PORTRAIT_URLS, CHARACTER_SHEETS, DISGUISE_SHEETS, skinKeyOf, battleSheetsOf } from '../src/world/assets.js';
import { loadContent } from './helpers.js';

const pub = (path) => new URL(`../public/sprites/${path}`, import.meta.url);

test('AH: beide Figuren haben Lauf-, Verkleidungs-, Trink- und Kampf-Sheets', () => {
  for (const look of Object.keys(P2_LOOKS)) {
    for (const key of [look, ...Object.keys(DISGUISE_SHEETS).map((w) => skinKeyOf(look, w))]) {
      assert.ok(existsSync(pub(SHEETS[CHARACTER_SHEETS[key]])), key);
    }
    assert.ok(existsSync(pub(ANIM_SHEETS[`${look}_drink`][0])));
    for (const sheet of Object.values(battleSheetsOf(look))) assert.ok(existsSync(pub(BATTLE_SHEETS[sheet][0])), sheet);
    assert.ok(existsSync(pub(TURN_PORTRAIT_URLS[look][0].replace(/^.*?sprites\//, ''))));
    for (const f of [`ui/heads/${look}.png`, `portraits/${look}_emotions.png`]) assert.ok(existsSync(pub(f)), f);
  }
  assert.ok(existsSync(pub('ui/AH_wahl.png')) && existsSync(pub('ui/AH_koop.png')));
});

test('AH: Verkleidungen zeigen auf geladene Lauf-Sheets (auch beim Ermittler)', () => {
  for (const w of Object.keys(DISGUISE_SHEETS)) assert.ok(CHARACTER_SHEETS[skinKeyOf('player', w)], w);
  assert.equal(skinKeyOf('p2b', null), 'p2b');
});

test('AH: Spieler 2 wählt seine Figur, sie bleibt im Spielstand', () => {
  const content = loadContent();
  const s = new GameState(content);
  assert.equal(s.setP2Look('p2b'), false); // ohne Spieler 2 nichts zu wählen
  s.addP2();
  assert.equal(s.p2Look(), 'p2a');
  assert.ok(s.setP2Look('p2b'));
  assert.equal(s.setP2Look('quatsch'), false);
  const again = new GameState(content);
  again.load(JSON.parse(JSON.stringify(s.serialize(null))));
  assert.equal(again.p2Look(), 'p2b');
  // Alte Spielstände ohne Figur bekommen die Schiebermütze
  const old = s.serialize(null);
  delete old.p2.look;
  const third = new GameState(content);
  third.load(old);
  assert.equal(third.p2Look(), 'p2a');
});
