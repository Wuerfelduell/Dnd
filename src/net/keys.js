// Online-Koop: reine Regeln ohne Phaser und ohne DOM (Raumcode, Tastenübersetzung für den Gast).
//
// Der Gast spielt auf seinem Rechner mit der gewohnten Belegung von Spieler 1 (WASD, E, Q, 1–9, Leertaste, F ...).
// Beim Host kommen diese Tasten als die Tasten von Spieler 2 an (Pfeile, Enter, Ziffernblock), je nachdem, was dort
// gerade offen ist: Welt, Kampf oder ein Fenster. So läuft im Spiel selbst alles genau wie im lokalen Koop.

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne I, O, 0, 1: am Telefon gut vorzulesen
export const CODE_LEN = 5;

/** Neuer Raumcode, z. B. "K7QMR". rnd: Zufallsquelle (für Tests). */
export function makeRoomCode(rnd = Math.random) {
  let s = '';
  for (let i = 0; i < CODE_LEN; i++) s += CODE_CHARS[Math.floor(rnd() * CODE_CHARS.length)];
  return s;
}

/** Eingabe säubern: Großbuchstaben, nur erlaubte Zeichen, höchstens CODE_LEN. */
export function cleanRoomCode(raw) {
  return String(raw ?? '').toUpperCase()
    .split('').filter((ch) => CODE_CHARS.includes(ch)).join('').slice(0, CODE_LEN);
}

export const validRoomCode = (c) => typeof c === 'string' && c.length === CODE_LEN && [...c].every((ch) => CODE_CHARS.includes(ch));

const KEYCODES = {
  ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, Enter: 13, Escape: 27, Tab: 9, Backspace: 8, Space: 32,
  NumpadAdd: 107, NumpadDecimal: 110,
};
/** keyCode für ein KeyboardEvent (Phaser liest keyCode). */
export function keyCodeOf(code) {
  if (KEYCODES[code]) return KEYCODES[code];
  let m = /^Numpad([0-9])$/.exec(code);
  if (m) return 96 + Number(m[1]);
  m = /^Digit([0-9])$/.exec(code);
  if (m) return 48 + Number(m[1]);
  m = /^Key([A-Z])$/.exec(code);
  if (m) return m[1].charCodeAt(0);
  return 0;
}
const KEYNAMES = { Space: ' ', NumpadAdd: '+', NumpadDecimal: ',' };
/** Passendes e.key zu einem code (für Tasten, die der Gast nicht selbst mitschickt). */
export function keyOf(code) {
  if (KEYNAMES[code]) return KEYNAMES[code];
  let m = /^(Numpad|Digit)([0-9])$/.exec(code);
  if (m) return m[2];
  m = /^Key([A-Z])$/.exec(code);
  if (m) return m[1].toLowerCase();
  return code; // ArrowUp, Enter, Escape, Tab, Backspace
}
const ev = (code, key = keyOf(code)) => ({ code, key, keyCode: keyCodeOf(code) });

/** Laufen: WASD, Pfeile und Steuerkreuz/Stick des Gastes (PadUp ...) → Pfeiltasten von Spieler 2. */
const MOVE = {
  KeyW: 'ArrowUp', ArrowUp: 'ArrowUp', PadUp: 'ArrowUp',
  KeyS: 'ArrowDown', ArrowDown: 'ArrowDown', PadDown: 'ArrowDown',
  KeyA: 'ArrowLeft', ArrowLeft: 'ArrowLeft', PadLeft: 'ArrowLeft',
  KeyD: 'ArrowRight', ArrowRight: 'ArrowRight', PadRight: 'ArrowRight',
};
export const isMoveCode = (code) => !!MOVE[code];

/**
 * Was soll beim Host passieren, wenn der Gast eine Taste drückt (down = true) oder loslässt?
 * ctx: { place: 'world' | 'combat' | 'menu', split: Splitscreen aktiv }
 * Rückgabe: Liste von Schritten, jeweils { type: 'keydown'|'keyup', code, key, keyCode } (wird als Tastendruck beim Host
 * ausgelöst) oder { act } (direkter Auftrag an die Szene, z. B. Inventar von Spieler 2, für den es keine Taste gibt).
 * Gamepad-Knöpfe kommen als PadA, PadB, PadX, PadY, PadLB, PadRB, PadBack.
 */
export function translateGuestKey(ctx, code, down, key = null) {
  const place = ctx?.place ?? 'world';
  const out = [];
  const press = (e) => { out.push({ type: 'keydown', ...e }); out.push({ type: 'keyup', ...e }); };
  // Gehaltene Richtungen: in der Welt (und im Kampf nur hoch/runter für die Zielwahl) Taste halten und wieder loslassen
  if (MOVE[code]) {
    const arrow = MOVE[code];
    if (place === 'combat' && (arrow === 'ArrowLeft' || arrow === 'ArrowRight')) return out; // ←/→ sind im Kampf Ausweichen/Parieren
    if (place === 'menu' && /^Key[WASD]$/.test(code)) { // im Fenster gehören Buchstaben dem Fenster (A = alles verknüpfen ...)
      if (down) press(ev(code, key ?? keyOf(code)));
      return out;
    }
    if (place === 'world') out.push({ type: down ? 'keydown' : 'keyup', ...ev(arrow) });
    else if (down) press(ev(arrow));
    return out;
  }
  if (!down) return out; // alles andere zählt nur beim Drücken
  const digit = /^Digit([0-9])$/.exec(code)?.[1];
  if (place === 'combat') {
    if (code === 'KeyE' || code === 'Enter' || code === 'NumpadEnter') press(ev('Enter'));
    else if (code === 'Space') press(ev('ArrowLeft')); // ausweichen
    else if (code === 'KeyF') press(ev('ArrowRight')); // parieren
    else if (digit && digit !== '0') press(ev(`Numpad${digit}`));
    else if (code === 'Escape' || code === 'Backspace' || code === 'Tab') press(ev(code));
    else if (/^Pad(A|B|X|LB|RB)$/.test(code)) out.push({ act: 'combatPad', button: { PadA: 0, PadB: 1, PadX: 2, PadLB: 4, PadRB: 5 }[code] });
    return out;
  }
  if (place === 'menu') {
    if (code === 'KeyE' || code === 'Enter' || code === 'NumpadEnter' || code === 'PadA') press(ev('Enter'));
    else if (code === 'Escape' || code === 'PadB') press(ctx.split ? ev('Numpad0', '0') : ev('Escape'));
    else if (digit && ctx.split) press(ev(`Numpad${digit}`));
    else if (/^Pad/.test(code)) return out;
    else press(ev(code, key ?? keyOf(code)));
    return out;
  }
  // Welt
  if (code === 'KeyE' || code === 'Enter' || code === 'NumpadEnter' || code === 'Space' || code === 'PadA') press(ev('Enter'));
  else if (code === 'KeyQ' || code === 'PadB') press(ev('Numpad0'));
  else if (digit === '0') press(ev('NumpadDecimal'));
  else if (digit) press(ev(`Numpad${digit}`));
  else if (code === 'KeyR' || code === 'PadBack') press(ev('NumpadAdd'));
  else if (code === 'KeyI' || code === 'PadY') out.push({ act: 'inventory' });
  else if (code === 'KeyJ' || code === 'Tab') out.push({ act: 'notebook' });
  else if (code === 'KeyP') out.push({ act: 'pathway' });
  else if (code === 'PadX') out.push({ act: 'talent:sel' });
  else if (code === 'PadLB' || code === 'PadRB') out.push({ act: 'talentMove', dir: code === 'PadLB' ? -1 : 1 });
  return out;
}

/** Tasten, die der Gast im Browser abfängt (sonst scrollt die Seite oder der Fokus springt). */
export const GUEST_CAPTURE = new Set(['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace']);

/** Gamepad-Zustand des Gastes → gedrückte virtuelle Tasten (Steuerkreuz/Stick als PadUp ..., Knöpfe als PadA ...). */
export function padCodes(pad) {
  if (!pad) return new Set();
  const b = (i) => !!pad.buttons?.[i]?.pressed;
  const ax = pad.axes?.[0] ?? 0;
  const ay = pad.axes?.[1] ?? 0;
  const s = new Set();
  if (b(12) || ay < -0.45) s.add('PadUp');
  if (b(13) || ay > 0.45) s.add('PadDown');
  if (b(14) || ax < -0.45) s.add('PadLeft');
  if (b(15) || ax > 0.45) s.add('PadRight');
  [['PadA', 0], ['PadB', 1], ['PadX', 2], ['PadY', 3], ['PadLB', 4], ['PadRB', 5], ['PadBack', 8]].forEach(([n, i]) => { if (b(i)) s.add(n); });
  return s;
}
