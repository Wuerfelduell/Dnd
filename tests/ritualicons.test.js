// Codex DP (Batch ritualicons): 39 eigene Icons ersetzen die Leihbilder der Seq-5-Rituale, Sude und Seq-4-Rituale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { loadContent, seeded } from './helpers.js';
import { GameState } from '../src/core/GameState.js';
import { DP_ICONS, ITEM_ICON_ALIASES, itemIconUrl, itemIcon32Url, reliktIcon, RELIKT_LOOKS, SEQ4_RITUAL_ICONS } from '../src/world/assets.js';

const content = loadContent();

test('DP: alle 39 Icons liegen in 16 und 32 vor und werden ohne Leihbild benutzt', () => {
  assert.equal(DP_ICONS.length, 39);
  for (const id of DP_ICONS) {
    assert.equal(ITEM_ICON_ALIASES[id], undefined, `${id} hat noch ein Leihbild`);
    assert.ok(itemIconUrl(id).endsWith(`items/${id}.png`), id);
    assert.ok(itemIcon32Url(id)?.endsWith(`items/32/${id}.png`), id);
    assert.ok(existsSync(`public/sprites/items/${id}.png`) && existsSync(`public/sprites/items/32/${id}.png`), id);
  }
});

test('DP: jedes Sud- und Seq-4-Essenz-Item im Spiel hat ein eigenes Icon', () => {
  const ids = Object.keys(content.items).filter((id) => /^(sud_|s4ke_|s4mo_|s4sc_)/.test(id) || ['leeres_gefaess', 'gefaess_erinnerung', 'uhr_taschen'].includes(id));
  assert.ok(ids.length >= 25, ids.join());
  for (const id of ids) assert.ok(DP_ICONS.includes(id), `${id} ohne DP-Icon`);
  for (const id of Object.values(SEQ4_RITUAL_ICONS)) assert.ok(DP_ICONS.includes(id), id);
});

test('DP: das Relikt des Verfalls zeigt seine stärkste Moor-Kategorie', () => {
  for (const l of RELIKT_LOOKS) assert.ok(DP_ICONS.includes(reliktIcon(l)), l);
  assert.equal(reliktIcon(undefined), 's4mo_relikt');
  const s = new GameState(content);
  s.pathway = { id: 'sq_moor', seq: 5, digestion: 100 };
  s.seq4().decayed = [1, 2, 3, 4, 5].map((i) => ({ id: `x${i}`, name: `Ding ${i}`, boons: [], curses: [] }));
  s.formRelic(seeded(3));
  assert.ok(RELIKT_LOOKS.includes(s.pathway.relikt.look), JSON.stringify(s.pathway.relikt));
});
