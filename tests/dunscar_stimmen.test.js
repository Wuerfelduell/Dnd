// Dunscar-Stimmen (Seb 2026-11-13: Gespräche fühlten sich alle gleich an): eigene Begrüßungen, Varianten, Themen, Englisch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameState } from '../src/core/GameState.js';
import { loadContent } from './helpers.js';
import { stimmenDict } from '../tools/stimmen-en.mjs';

const content = loadContent();
const HAUPT = ['pfiff', 'nellie', 'huxford', 'esther', 'pelham', 'adaine', 'oren', 'willa', 'mabel', 'gallowmere'];
const start = (did) => { const d = content.dialogues[did]; return d.nodes[d.start] ?? d.nodes.start; };
const texte = (n) => [n.text, ...(n.texte ?? []).flatMap((v) => v.zufall ?? [v.text])].filter(Boolean);

test('Keine Hauptfigur beginnt mehr mit dem Schablonensatz, jede hat mindestens fünf eigene Anfänge', () => {
  const alle = new Set();
  for (const f of HAUPT) {
    const n = start(`k3a_${f}`);
    for (const t of texte(n)) {
      assert.ok(!t.includes('Unterlagen geordnet'), `${f}: Schablone`);
      assert.ok(!alle.has(t) || t === n.text, `${f}: Text doppelt bei anderer Figur: ${t}`);
      alle.add(t);
    }
    assert.ok(new Set(texte(n)).size >= 5, `${f}: zu wenig Varianten`);
  }
});

test('Erstes Treffen, Alltag, Rückkehr ins Menü und Sequenz wählen verschiedene Texte', () => {
  const s = new GameState(content);
  const n = start('k3a_oren');
  const erst = s.nodeText(n);
  assert.match(erst, /Fallowby\. Oren\./);
  s.flags.add('dsv_k3_oren');
  const alltag = n.texte.at(-1).zufall;
  assert.ok(alltag.includes(s.nodeText(n)));
  assert.ok(n.texte[0].zufall.includes(s.nodeText(n, { erneut: true })));
  s.pathway = { id: 'laterne', seq: 4 };
  s.random = () => 0;
  assert.match(s.nodeText(n), /Manometer/);
});

test('Jede Hauptfigur hat eigene Themen, eins davon zählt als Gerücht über den Alten', () => {
  for (const f of HAUPT) {
    const d = content.dialogues[`k3a_${f}`];
    const n = start(`k3a_${f}`);
    const themen = n.choices.filter((c) => typeof c.next === 'string' && c.next.startsWith('dsv_thema_'));
    assert.ok(themen.length >= 1, f);
    if (f !== 'pfiff') assert.ok(themen.some((c) => d.nodes[c.next].sets_flags?.includes('k3r_gott_gehoert')), `${f}: kein Gerücht`);
    assert.ok(!n.choices.some((c) => c.text === 'Ich komme später wieder.'), `${f}: alter Abschied`);
    assert.ok(!n.choices.some((c) => c.text === 'Die beiden Beobachtungen gemeinsam prüfen.'), `${f}: alte Prüf-Option`);
  }
});

test('Ortskundige fragen nicht mehr alle im gleichen Wortlaut', () => {
  const ids = Object.keys(content.dialogues).filter((k) => k.startsWith('ds_ok_'));
  assert.equal(ids.length, 6);
  const labels = ids.map((id) => content.dialogues[id].nodes.start.choices.find((c) => c.next === 'viertel').text);
  assert.equal(new Set(labels).size, ids.length);
});

test('Alle neuen Texte haben eine englische Übersetzung im Wörterbuch', () => {
  const file = JSON.parse(readFileSync(new URL('../src/i18n/en/kapitel3_stimmen.json', import.meta.url), 'utf8'));
  assert.deepEqual(file, stimmenDict(), 'node tools/stimmen-en.mjs ausführen');
  const strings = [];
  for (const did of [...HAUPT.map((f) => `k3a_${f}`), ...Object.keys(content.dialogues).filter((k) => k.startsWith('ds_ok_'))]) {
    const d = content.dialogues[did];
    for (const [k, n] of Object.entries(d.nodes)) {
      if (n.texte) strings.push(...texte(n).slice(1));
      if (k.startsWith('dsv_')) strings.push(n.text, ...n.choices.map((c) => c.text));
    }
  }
  for (const t of strings) assert.ok(file[t], `Englisch fehlt: ${t}`);
});
