// Zehn eigene Icons (16 und 32) für Nebelseiten-Fundstücke, die paarweise fremde Bilder trugen (tools/art/nsi_icons)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadContent } from './helpers.js';
import { NSI_ICONS, itemIconUrl, itemIcon32Url } from '../src/world/assets.js';

const content = loadContent();
const man = JSON.parse(readFileSync(new URL('../public/sprites/manifest-nsi-icons.json', import.meta.url), 'utf8'));
const datei = (url) => new URL('../public/' + url.replace(/^\.\//, ''), import.meta.url);
const pixelHash = (url) => createHash('sha256').update(readFileSync(datei(url))).digest('hex');

test('Nebelseiten-Icons: zehn Items, 16er und 32er vorhanden und im Manifest', () => {
  assert.equal(NSI_ICONS.length, 10);
  assert.deepEqual(man.assets.map((a) => a.id).sort(), [...NSI_ICONS].sort());
  for (const id of NSI_ICONS) {
    assert.ok(content.items[id], id);
    const a = man.assets.find((x) => x.id === id);
    assert.ok(itemIconUrl(id).endsWith(a.file16), id);
    assert.ok(itemIcon32Url(id)?.endsWith(a.file32), id + ' 32');
    assert.ok(existsSync(datei(itemIconUrl(id))) && existsSync(datei(itemIcon32Url(id))), id);
    assert.equal(pixelHash(itemIconUrl(id)), a.sha256_16, id);
    assert.equal(pixelHash(itemIcon32Url(id)), a.sha256_32, id);
  }
});

test('Nebelseiten-Fundstücke: kein Bild mehr doppelt vergeben', () => {
  const nsi = Object.keys(content.items).filter((id) => id.startsWith('nsi_'));
  assert.ok(nsi.length >= 18);
  const seen = new Map();
  for (const id of nsi) {
    const h = pixelHash(itemIconUrl(id));
    assert.ok(!seen.has(h), id + ' hat dasselbe Bild wie ' + seen.get(h));
    seen.set(h, id);
  }
});
