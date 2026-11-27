// Geistsicht (Seb 2026-11-27): Beyonder tragen kein Schild mehr; die Geistsicht zeigt ihre Aura, den Pfad verrät erst ein Gespräch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('Jede Beyonder-Figur hat einen Pfad; Einzelgänger ihren eigenen', () => {
  const s = new GameState(content);
  for (const [id, l] of Object.entries(content.loners?.list ?? {})) if (content.npcs[id]) assert.equal(s.npcPfad(id), l.pathway, id);
  assert.ok(content.pathways[s.npcPfad('sabeth')]);
  assert.equal(s.npcPfad('marlowe'), null);
});

test('Nach dem Pfad fragen geht nur mit Geistsicht, einmal, und färbt die Aura', () => {
  const s = new GameState(content);
  const id = 'ez_reetkoenig';
  assert.equal(s.canAskPfad(id), false);
  s.spiritVision = true;
  assert.equal(s.canAskPfad(id), true);
  assert.equal(s.npcPfadBekannt(id), null);
  const r = s.askPfad(id);
  assert.ok(r.ok && r.text.includes(content.pathways.kessel.name));
  assert.equal(s.npcPfadBekannt(id), 'kessel');
  assert.equal(s.canAskPfad(id), false);
});

test('Dunscarer Einzelgänger: Schild nur mit Namen, ohne Pfad', () => {
  for (const m of Object.values(content.maps)) for (const n of m.npcs ?? []) if (n.label && content.npcs[n.id]) assert.equal(n.label, content.npcs[n.id].name, n.id);
});
