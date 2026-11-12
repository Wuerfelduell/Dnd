// Codex DM: Titelbild je Kapitel, Spielstand-Karten, Ladebilder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { DM_CITIES, dmTitleLayers, spielstandUrl, ladenUrl, itemIconUrl } from '../src/world/assets.js';

const file = (url) => existsSync(new URL(String(url).replace(/^.*\/sprites\//, '../public/sprites/'), import.meta.url));

test('DM: Titel-Ebenen für Kapitel 2–5, Kettlegate behält AE', () => {
  assert.equal(dmTitleLayers('kettlegate'), null);
  for (const c of ['wexmoor', 'dunscar', 'calderwick', 'briarholt']) for (const l of dmTitleLayers(c)) assert.ok(file(l.url), l.url);
  assert.match(dmTitleLayers('briarholt', { warm: true }).at(-1).url, /vordergrund_warm/);
});

test('DM: Spielstand-Karte und drei Ladebilder je Stadt, Post-Fotos mit eigenem Bild', () => {
  for (const c of DM_CITIES) {
    assert.ok(file(spielstandUrl(c)), c);
    for (let n = 0; n < 3; n++) assert.ok(file(ladenUrl(c, n)), `${c} ${n}`);
  }
  for (let i = 1; i <= 6; i++) assert.match(itemIconUrl(`post_foto_${i}`), new RegExp(`items/post_foto_${i}\\.png$`));
});
