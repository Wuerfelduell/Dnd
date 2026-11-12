// Pfadwechsel (Seb 2026-11-12): ab Seq 4 einmal zum Nachbarpfad, über dessen Seq-3-Trank; Stufen 9–4 bleiben.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';
import { GameState } from '../src/core/GameState.js';

const content = loadContent();

function halbgott(pid = 'laterne', seq = 4) {
  const s = new GameState(content);
  s.pathway = { id: pid, seq, digestion: 100 };
  s.flags.add(`ritual_${pid}_${seq - 1}`);
  s.updateMaxHp();
  return s;
}

test('Pfadwechsel: nur ab Seq 4, nur Nachbarpfad, einmal', () => {
  const s = halbgott('laterne', 4);
  s.flags.add(s.ritualFlag('laterne', 3));
  s.addItem('trank_faden_3');
  assert.equal(s.drinkCheck('trank_faden_3').ok, false, 'kein Nachbar');
  s.addItem('trank_schluessel_3');
  const c = s.drinkCheck('trank_schluessel_3');
  assert.equal(c.ok, true, c.reason);
  const r = s.drink('trank_schluessel_3', () => 0.999);
  assert.equal(r.ok, true, r.text);
  assert.deepEqual(s.pathway.wechsel, { von: 'laterne', ab: 3 });
  assert.equal(s.pathway.id, 'schluessel');
  assert.match(r.text, /Du verlässt den/);
  // Stufen 9–4 vom alten Pfad, 3 vom neuen
  const reached = s.reachedSeqs();
  assert.equal(reached.find((x) => x.seq === 9).pid, 'laterne');
  assert.equal(reached.find((x) => x.seq === 4).pid, 'laterne');
  assert.equal(reached.find((x) => x.seq === 3).pid, 'schluessel');
  const skills = Object.values(s.pathwaySkills());
  assert.ok(skills.some((k) => k.pathway === 'laterne' && k.seq === 9));
  assert.ok(skills.some((k) => k.pathway === 'schluessel' && k.seq === 3));
  // bleibt beim Speichern/Laden
  const s2 = new GameState(content);
  s2.loadPathway(JSON.parse(JSON.stringify(s.serializePathway())));
  assert.deepEqual(s2.pathway.wechsel, { von: 'laterne', ab: 3 });
  assert.equal(s2.wechselZiel('laterne'), null, 'kein zweiter Wechsel');
});

test('Pfadwechsel: auf Seq 5 noch gesperrt, mit Hinweis', () => {
  const s = halbgott('echo', 5);
  s.addItem('trank_maske_4');
  const c = s.drinkCheck('trank_maske_4');
  assert.equal(c.ok, false);
  assert.match(c.reason, /Sequenz 4/);
});

test('Pfadwechsel: Formel 3 des Nachbarpfads auf Seq 4 auf Zirkeln sichtbar', () => {
  const s = halbgott('sq_waage', 4);
  const e = { item: 'formel_eisen_3', price: 1, requires_pathway: ['eisen', 4], nachbar: true };
  const nb = (x) => x.nachbar && x.requires_pathway[1] === 4 && s.wechselZiel(x.requires_pathway[0]);
  assert.ok(nb(e));
  assert.equal(s.wechselZiel('laterne'), null);
});

test('Pfadwechsel: Mutter Sedge und Anton Riegel erklären ihn', () => {
  assert.ok(content.dialogues.sedge.nodes.pfadwechsel2);
  const riegel = Object.values(content.dialogues).find((d) => d?.nodes?.wechsel);
  assert.ok(riegel, 'Dunscar-Ortskundiger mit Wechsel-Knoten');
});
