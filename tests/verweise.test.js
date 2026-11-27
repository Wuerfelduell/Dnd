// Jeder ID-Verweis im kompletten Content zeigt auf etwas, das existiert: `node tools/verweise.mjs` zeigt die Liste.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { pruefeVerweise } from '../tools/verweise.mjs';

test('Keine kaputten ID-Verweise (Gegenstände, Figuren, Aufträge, Karten, Kämpfe, Dialogknoten …)', () => {
  const { fehler } = pruefeVerweise(loadContent());
  assert.deepEqual(fehler.map((f) => `${f.path} -> ${f.id}`), []);
});

test('Die Prüfung findet eingebaute Fehler', () => {
  const c = loadContent();
  const tree = Object.values(c.dialogues)[0];
  Object.values(tree.nodes)[0].choices = [{ text: 'x', next: 'gibt_es_nicht', gives_items: { kein_gegenstand: 1 }, start_quests: ['kein_auftrag'] }];
  const ids = pruefeVerweise(c).fehler.map((f) => f.id);
  for (const id of ['gibt_es_nicht', 'kein_gegenstand', 'kein_auftrag']) assert.ok(ids.includes(id), id);
});
