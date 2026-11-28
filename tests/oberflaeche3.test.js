// Codex DM: Titelbild je Kapitel, Spielstand-Karten, Ladebilder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { DM_CITIES, dmTitleLayers, spielstandUrl, ladenUrl, itemIconUrl, CANAL_TITLE_LAYERS } from '../src/world/assets.js';

const file = (url) => existsSync(new URL(String(url).replace(/^.*\/sprites\//, '../public/sprites/'), import.meta.url));

test('DM: Titel-Ebenen für Kapitel 2–6, Kettlegate behält AE, Hauptmenü ohne Spielstand zeigt den Kanal', () => {
  assert.equal(dmTitleLayers('kettlegate'), null);
  for (const c of ['wexmoor', 'dunscar', 'calderwick', 'briarholt', 'varrowmouth']) for (const l of dmTitleLayers(c)) assert.ok(file(l.url), l.url);
  assert.ok(dmTitleLayers('briarholt', { warm: true }).some((l) => /vordergrund_warm/.test(l.url)));
  for (const l of CANAL_TITLE_LAYERS.filter((x) => x.url)) assert.ok(file(l.url), l.url);
  for (const f of ['abspann_rahmen', 'abspann_trenner', 'spielstand_rahmen', 'spielstand_marken', 'AE_regler']) assert.ok(file(`./sprites/ui/${f}.png`), f);
});

test('DM: Spielstand-Karte und drei Ladebilder je Stadt, Post-Fotos mit eigenem Bild', () => {
  for (const c of DM_CITIES) {
    assert.ok(file(spielstandUrl(c)), c);
    for (let n = 0; n < 3; n++) assert.ok(file(ladenUrl(c, n)), `${c} ${n}`);
  }
  for (let i = 1; i <= 6; i++) assert.match(itemIconUrl(`post_foto_${i}`), new RegExp(`items/post_foto_${i}\\.png$`));
});
