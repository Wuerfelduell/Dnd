// Paket AI: Koop-Aufträge, Geplauder und Kampfsprüche zu zweit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { koopRoleOf, koopVoice, pickChat, koopBark, koopGreeting } from '../src/core/Koop.js';
import { loadContent } from './helpers.js';

const content = loadContent();

test('AI: koop_aktiv folgt Spieler 2, Platz-Flags verfallen', () => {
  const s = new GameState(content);
  assert.ok(!s.flags.has('koop_aktiv'));
  s.addP2();
  assert.ok(s.flags.has('koop_aktiv'));
  s.flags.add('koop_zwei_schluessel_p1');
  s.flags.add('koop_zwei_schluessel_offen'); // Fortschritt bleibt
  s.removeP2();
  assert.ok(!s.flags.has('koop_aktiv'));
  assert.ok(!s.flags.has('koop_zwei_schluessel_p1'));
  assert.ok(s.flags.has('koop_zwei_schluessel_offen'));
  // Ein gespeichertes Flag täuscht keinen zweiten Spieler vor
  const data = s.serialize(null);
  data.flags.push('koop_aktiv', 'koop_spiegelbild_p2');
  const t = new GameState(content);
  t.load(data);
  assert.ok(!t.flags.has('koop_aktiv') && !t.flags.has('koop_spiegelbild_p2'));
});

test('AI: Rollenobjekte gehören einem Spieler', () => {
  assert.equal(koopRoleOf('koop_zwei_schluessel_p1'), 1);
  assert.equal(koopRoleOf('koop_spiegelbild_rad_p2'), 2);
  assert.equal(koopRoleOf('koop_zwei_schluessel_drehen'), null);
  assert.equal(koopRoleOf('lampe_p1'), null);
  // Jedes Rollenobjekt aus der Platzierung steht auf seiner Karte
  const ids = Object.values(content.maps).flatMap((m) => (m.interactables ?? []).map((i) => i.id)).filter((id) => koopRoleOf(id));
  assert.equal(ids.length, 12); // AI: 10, BF: Horchen (Rufplatz, Hinterzugang)
});

test('AI: Geplauder je Karte einmal, Stimme passend zur Figur', () => {
  const s = new GameState(content);
  assert.equal(pickChat(s, 'revier'), null); // allein kein Geplauder
  s.addP2();
  const chat = pickChat(s, 'revier');
  assert.ok(chat && chat.map === 'revier');
  s.koopSeen.add(chat.id);
  assert.notEqual(pickChat(s, 'revier')?.id, chat.id);
  assert.equal(koopVoice('p2b'), 'b');
  for (const z of chat.zeilen) assert.ok(z.p === 'p1' ? z.text : z.a && z.b);
  const again = new GameState(content);
  again.load(JSON.parse(JSON.stringify(s.serialize(null))));
  assert.ok(again.koopSeen.has(chat.id));
});

test('AI: Kampfsprüche je Figur, ohne direkte Wiederholung', () => {
  const s = new GameState(content);
  s.addP2();
  s.setP2Look('p2b');
  const b = koopBark(s, 'koop_sieg', 2);
  assert.ok(content.koop.kampf.koop_sieg.p2b.includes(b));
  assert.ok(content.koop.kampf.koop_sieg.p1.includes(koopBark(s, 'koop_sieg', 1)));
  for (let i = 0; i < 20; i++) assert.notEqual(koopBark(s, 'koop_parade', 2, b), b);
  assert.equal(koopBark(s, 'gibt_es_nicht', 1), null);
  assert.match(koopGreeting('join', 'p2b', true), /Laternenkegel/);
});

test('AI: Marlowes Koop-Zusatz hängt am Menü (hub)', () => {
  const hub = content.dialogues.marlowe.nodes.hub;
  assert.ok(hub.choices.some((c) => String(c.next ?? '').startsWith('koop_')));
  assert.ok(!content.dialogues.marlowe.nodes.start);
});
