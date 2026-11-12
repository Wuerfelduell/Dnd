import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';

const content = loadContent();

test('Codex DH: neun Spiegelkarten mit Übergang, Rückweg, stillem Wesen und Funden', () => {
  const ns = Object.values(content.maps).filter((m) => m.nebelseite);
  assert.equal(ns.length, 9);
  assert.equal(ns.filter((m) => m.npcs.some((n) => content.npcs[n.id])).length, 3, 'ein stilles Wesen je Stadt');
  for (const m of ns) {
    const back = m.interactables.find((i) => i.id.endsWith('_rueckweg'));
    const orig = content.maps[back.to];
    const tor = orig.interactables.find((i) => i.kind === 'nebel' && i.to === m.id);
    assert.ok(tor?.hidden && tor.lock.requires_seq === 5, m.id);
    assert.ok(orig.spawns[back.spawn], m.id);
    assert.ok(m.interactables.filter((i) => i.kind === 'read').length >= 1, `${m.id}: Funde`);
  }
});

test('Codex DH: drüben steigt die Unruhe', () => {
  const s = new GameState(content);
  s.pathway = { id: 'laterne', seq: 5, digestion: 0 };
  s.map = Object.values(content.maps).find((m) => m.nebelseite).id;
  const u = s.unruhe ?? 0;
  s.nsTick(25);
  assert.ok(s.unruhe > u);
});
