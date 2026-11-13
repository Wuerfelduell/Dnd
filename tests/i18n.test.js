import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { lookup, setDict, setLang, tr } from '../src/core/I18n.js';

test('Wörterbuch: exakt und mit Zahlen-Platzhaltern', () => {
  setDict({ 'Neues Spiel': 'New Game', '{0} Schilling': '{0} shillings', 'Runde {0} von {1}': 'Round {0} of {1}' });
  assert.equal(lookup('Neues Spiel'), 'New Game');
  assert.equal(lookup('450 Schilling'), '450 shillings');
  assert.equal(lookup('Runde 2 von 5'), 'Round 2 of 5');
  assert.equal(lookup('Unbekannt'), null);
});

test('tr übersetzt nur auf Englisch und behält Leerraum', () => {
  setDict({ 'Neues Spiel': 'New Game' });
  setLang('de');
  assert.equal(tr(' Neues Spiel '), ' Neues Spiel ');
  setLang('en');
  assert.equal(tr(' Neues Spiel '), ' New Game ');
  assert.equal(tr('Nicht im Wörterbuch'), 'Nicht im Wörterbuch');
  setLang('de');
});

test('Wörterbuch-Dateien: gültiges JSON, Platzhalter passen', () => {
  const dir = 'src/i18n/en';
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
    for (const [de, en] of Object.entries(d)) {
      assert.equal(typeof en, 'string', `${f}: ${de}`);
      const ph = (s) => (s.match(/\{\d+\}/g) ?? []).sort().join();
      assert.equal(ph(en), ph(de), `${f}: Platzhalter in „${de}“`);
    }
  }
});
