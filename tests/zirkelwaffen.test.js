import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const items = JSON.parse(readFileSync('src/data/items.json', 'utf8'));
const treffen = JSON.parse(readFileSync('src/data/treffen.json', 'utf8'));
const WAFFEN = ['zirkel_ritualdolch', 'zirkel_bannglocke', 'zirkel_russhacke', 'zirkel_moorkette', 'zirkel_salzharpune'];

test('Zirkelwaffen sind Waffen mit Bild und werden genau auf einem Treffen angeboten', () => {
  const offers = Object.values(treffen.circles).flatMap((c) => c.members.flatMap((m) => m.offers.map((o) => o.item)));
  for (const id of WAFFEN) {
    assert.equal(items[id]?.kind, 'weapon', id);
    assert.ok(existsSync(`public/sprites/items/${id}.png`), `${id} 16er fehlt`);
    assert.ok(existsSync(`public/sprites/items/32/${id}.png`), `${id} 32er fehlt`);
    assert.equal(offers.filter((o) => o === id).length, 1, id);
  }
});

test('Vorrat nebel200: 200 Bilder laut Manifest vorhanden', () => {
  const m = JSON.parse(readFileSync('public/sprites/manifest-nebel200.json', 'utf8'));
  assert.equal(m.assets.length, 200);
  for (const a of m.assets) assert.ok(existsSync(`public/sprites/${a.file}`), a.file);
});
