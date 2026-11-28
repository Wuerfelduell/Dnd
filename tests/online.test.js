import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRoomCode, cleanRoomCode, validRoomCode, translateGuestKey, keyCodeOf, padCodes, CODE_LEN } from '../src/net/keys.js';
import { SUPABASE_KEY, SUPABASE_URL, CHANNEL_PREFIX } from '../src/net/config.js';
import en from '../src/i18n/en/online_koop.json' with { type: 'json' };

const keys = (steps) => steps.map((s) => s.act ?? `${s.type === 'keydown' ? '+' : '-'}${s.code}`);

test('Raumcode: fünf gut lesbare Zeichen, Eingabe wird gesäubert', () => {
  let i = 0;
  const code = makeRoomCode(() => ((i++ * 0.37) % 1));
  assert.equal(code.length, CODE_LEN);
  assert.ok(validRoomCode(code));
  assert.ok(!/[IO01]/.test(makeRoomCode()));
  assert.equal(cleanRoomCode(' k7q-mr x'), 'K7QMR');
  assert.equal(validRoomCode('K7QM'), false);
  assert.equal(validRoomCode('K7QM0'), false);
});

test('Welt: WASD wird zu den Pfeilen von Spieler 2 (halten und loslassen)', () => {
  assert.deepEqual(keys(translateGuestKey({ place: 'world' }, 'KeyD', true)), ['+ArrowRight']);
  assert.deepEqual(keys(translateGuestKey({ place: 'world' }, 'KeyD', false)), ['-ArrowRight']);
  assert.deepEqual(keys(translateGuestKey({ place: 'world' }, 'PadUp', true)), ['+ArrowUp']);
});

test('Welt: Aktionen des Gastes werden zu Tasten oder Aufträgen von Spieler 2', () => {
  const w = { place: 'world' };
  assert.deepEqual(keys(translateGuestKey(w, 'KeyE', true)), ['+Enter', '-Enter']);
  assert.deepEqual(keys(translateGuestKey(w, 'KeyQ', true)), ['+Numpad0', '-Numpad0']);
  assert.deepEqual(keys(translateGuestKey(w, 'Digit3', true)), ['+Numpad3', '-Numpad3']);
  assert.deepEqual(keys(translateGuestKey(w, 'Digit0', true)), ['+NumpadDecimal', '-NumpadDecimal']);
  assert.deepEqual(keys(translateGuestKey(w, 'KeyR', true)), ['+NumpadAdd', '-NumpadAdd']);
  assert.deepEqual(keys(translateGuestKey(w, 'KeyI', true)), ['inventory']);
  assert.deepEqual(keys(translateGuestKey(w, 'KeyJ', true)), ['notebook']);
  assert.deepEqual(keys(translateGuestKey(w, 'PadX', true)), ['talent:sel']);
  assert.deepEqual(translateGuestKey(w, 'Escape', true), []); // kein Pausemenü des Hosts aus der Welt heraus
  assert.deepEqual(translateGuestKey(w, 'KeyE', false), []);
});

test('Kampf: E Takt, Leertaste ausweichen, F parieren, Zahlen fürs Menü; A/D tun nichts', () => {
  const c = { place: 'combat' };
  assert.deepEqual(keys(translateGuestKey(c, 'KeyE', true)), ['+Enter', '-Enter']);
  assert.deepEqual(keys(translateGuestKey(c, 'Space', true)), ['+ArrowLeft', '-ArrowLeft']);
  assert.deepEqual(keys(translateGuestKey(c, 'KeyF', true)), ['+ArrowRight', '-ArrowRight']);
  assert.deepEqual(keys(translateGuestKey(c, 'Digit2', true)), ['+Numpad2', '-Numpad2']);
  assert.equal(translateGuestKey(c, 'Digit2', true)[0].key, '2');
  assert.deepEqual(translateGuestKey(c, 'KeyA', true), []);
  assert.deepEqual(keys(translateGuestKey(c, 'KeyW', true)), ['+ArrowUp', '-ArrowUp']);
  assert.deepEqual(translateGuestKey(c, 'PadB', true), [{ act: 'combatPad', button: 1 }]);
});

test('Fenster: Buchstaben bleiben Buchstaben, Esc schließt (im Splitscreen Ziffernblock 0)', () => {
  const m = { place: 'menu' };
  assert.deepEqual(translateGuestKey(m, 'KeyA', true, 'a').map((s) => s.key), ['a', 'a']);
  assert.deepEqual(keys(translateGuestKey(m, 'KeyG', true, 'g')), ['+KeyG', '-KeyG']);
  assert.deepEqual(keys(translateGuestKey(m, 'Escape', true)), ['+Escape', '-Escape']);
  assert.deepEqual(keys(translateGuestKey({ place: 'menu', split: true }, 'Escape', true)), ['+Numpad0', '-Numpad0']);
  assert.deepEqual(keys(translateGuestKey({ place: 'menu', split: true }, 'Digit4', true)), ['+Numpad4', '-Numpad4']);
  assert.deepEqual(keys(translateGuestKey(m, 'ArrowRight', true)), ['+ArrowRight', '-ArrowRight']);
});

test('keyCode für Phaser stimmt', () => {
  assert.equal(keyCodeOf('ArrowLeft'), 37);
  assert.equal(keyCodeOf('Enter'), 13);
  assert.equal(keyCodeOf('Numpad0'), 96);
  assert.equal(keyCodeOf('Numpad9'), 105);
  assert.equal(keyCodeOf('NumpadAdd'), 107);
  assert.equal(keyCodeOf('KeyG'), 71);
});

test('Gamepad des Gastes: Stick und Knöpfe als virtuelle Tasten', () => {
  const pad = { axes: [0.9, -0.1], buttons: Array.from({ length: 16 }, (_, i) => ({ pressed: i === 0 || i === 3 })) };
  assert.deepEqual([...padCodes(pad)].sort(), ['PadA', 'PadRight', 'PadY']);
  assert.equal(padCodes(null).size, 0);
});

test('Supabase: nur öffentlicher Schlüssel im Code, eigenes Kanal-Präfix', () => {
  assert.match(SUPABASE_URL, /^https:\/\/[a-z0-9]+\.supabase\.co$/);
  assert.match(SUPABASE_KEY, /^sb_publishable_/);
  assert.ok(CHANNEL_PREFIX.startsWith('nebelakten-'));
});

test('Online-Texte haben englische Fassungen', () => {
  for (const de of ['Online zu zweit', 'Online beitreten', 'Raum öffnen', 'Warte auf deinen Freund …', 'Verbindung beendet']) assert.ok(en[de], de);
});
