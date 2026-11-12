import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { Combat, HP_FLOOR } from '../src/core/Combat.js';
import { loadContent } from './helpers.js';

const C = loadContent();
const ids = (pred) => Object.entries(C.encounters).filter(([, e]) => pred(e)).map(([id]) => id);

test('Kapitel 4: Untergrenze doppelt so hoch wie in Dunscar, Gebietsgegner zahlen mindestens Dunscar-Geld', () => {
  const s = new GameState(C);
  for (const id of ids((e) => e.chapter === 4 && !e.boss && !e.elite && e.zone && !e.unbesiegbar && !e.flees_after)) {
    assert.ok(new Combat(s, id).enemy.maxHp >= HP_FLOOR.normal * 2, id);
    const m = C.loot[id]?.money;
    if (m?.[1]) assert.ok(m[1] >= 100, `${id} zahlt ${m}`);
  }
  const bosse = ids((e) => e.chapter === 4 && e.boss && e.zone).filter((id) => !/_phase\d/.test(id) && C.loot[id]);
  assert.ok(bosse.length > 0);
  for (const id of bosse) assert.ok(C.loot[id].money[0] >= 1000, `${id} zahlt ${C.loot[id].money}`);
});

test('Dunscar: wiederkehrende Bosse (Sekten-Häupter) zahlen wie ein Gebietsboss', () => {
  for (const id of ids((e) => e.chapter === 3 && e.boss)) {
    const L = C.loot[id];
    if (L?.repeat && L.money?.[1]) assert.ok(L.money[0] >= 700, `${id} zahlt ${L.money}`);
  }
});
