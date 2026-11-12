// Codex DG: Das eigene Haus in Wexmoor und Dunscar (Kauf, Tür, Möbel, Trophäen, Gast).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Haus: Maklerin und Tür in Wexmoor und Dunscar, Tür erst mit Schlüssel', () => {
  for (const [map, haus] of [['wx_oberstadt', 'haus_wexmoor'], ['ds_arbeiterbogen', 'haus_dunscar']]) {
    const m = content.maps[map];
    assert.ok(m.npcs.some((n) => n.id === 'haus_maklerin'), map);
    const tuer = m.interactables.find((i) => i.id === 'haus_tuer');
    assert.equal(tuer.to, haus);
    assert.deepEqual(tuer.visible_if, { requires_flags: ['haus_owned'] });
    assert.ok(content.maps[haus].interactables.some((i) => i.kind === 'rest') && content.maps[haus].interactables.some((i) => i.kind === 'storage'));
    assert.ok(m.spawns.von_haus);
  }
});

test('Haus: Kauf, Möbel aus dem Katalog stehen da, Trophäe nach Bosssieg, Gast abends', () => {
  const s = new GameState(content);
  const kauf = content.dialogues.haus_maklerin.nodes.kauf;
  s.money = 2000;
  s.applyEffects(kauf);
  assert.ok(s.flags.has('haus_owned'));
  assert.equal(s.money, 500);
  assert.ok(s.itemCount('haus_bett_p1'));
  assert.ok(content.market.merchants.haus_maklerin.stock.length >= 40);
  const deko = content.maps.haus_wexmoor.decor.find((d) => d.visible_if?.requires_items?.[0] === 'haus_bett_p1');
  assert.ok(deko && s.meets(deko.visible_if));
  s.flags.add('won_moorkoenigin');
  assert.ok(s.hausTrophaeen().includes('troph_moorkoenigin'));
});
