/**
 * Sprachwahl Deutsch / Englisch.
 *
 * Das Spiel ist auf Deutsch geschrieben (Code, JSON-Daten). Statt jede Stelle umzubauen, übersetzt diese Schicht
 * den angezeigten Text: Ein MutationObserver ersetzt Textknoten (und title/placeholder) im DOM, Phaser-Texte laufen
 * über setText. Gesucht wird
 *   1. exakt im Wörterbuch (src/i18n/en/*.json, deutscher Satz → englischer Satz),
 *   2. mit Zahlen als Platzhalter („450 Schilling“ → Schlüssel „{0} Schilling“),
 *   3. sonst – wenn der Browser es kann (Chrome: Translator-API, läuft auf dem Gerät) – automatisch übersetzt
 *      und im localStorage zwischengespeichert. Ohne Übersetzer bleibt der deutsche Text stehen.
 * Das Wörterbuch wächst Stück für Stück (tools/i18n-extract.mjs listet, was noch fehlt) und gewinnt immer
 * gegen die automatische Übersetzung.
 */

const LANG_KEY = 'nebelakten-lang';
const MT_KEY = 'nebelakten-mt-en';
const NUM = /\d+(?:[.,]\d+)*/g;

// Wörterbuch: alle JSON-Dateien unter src/i18n/en (Vite bündelt sie mit)
let DICT = {};
try {
  const mods = import.meta.glob('../i18n/en/*.json', { eager: true, import: 'default' });
  for (const m of Object.values(mods)) Object.assign(DICT, m);
} catch { /* außerhalb von Vite (Node-Tests): leeres Wörterbuch */ }
DICT = splitParagraphs(DICT);

/**
 * Lange Texte stehen im Spiel als einzelne Absätze im DOM (<p> je Absatz, <br> je Zeile). Einträge mit
 * Absätzen werden deshalb zusätzlich Absatz für Absatz (und Zeile für Zeile) eingetragen, wenn die Anzahl passt.
 */
function splitParagraphs(d) {
  const out = { ...d };
  for (const [de, en] of Object.entries(d)) {
    for (const sep of ['\n\n', '\n']) {
      if (!de.includes(sep)) continue;
      const a = de.split(sep);
      const b = en.split(sep);
      if (a.length !== b.length) continue;
      a.forEach((x, i) => { const k = x.trim(); if (k && !(k in out)) out[k] = b[i].trim(); });
    }
  }
  return out;
}

let lang = 'de';
try { lang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'de'; } catch { /* kein Speicher */ }

const listeners = new Set();
// Angezeigte Texte ohne Wörterbuch-Eintrag (Entwicklerhilfe: in der Konsole __i18nMissing() aufrufen)
const MISSES = new Set();
export function missingTexts() { return [...MISSES]; }
if (typeof window !== 'undefined') window.__i18nMissing = () => JSON.stringify(Object.fromEntries([...MISSES].map((s) => [s, ''])), null, 1);
if (typeof window !== 'undefined') window.__i18nLookup = (s) => lookup(s);

export function getLang() { return lang; }
export function isEnglish() { return lang === 'en'; }
export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
/** Nur für Tests: eigenes Wörterbuch setzen. */
export function setDict(d) { DICT = splitParagraphs(d); memo = new Map(); }

export function setLang(l) {
  lang = l === 'en' ? 'en' : 'de';
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* egal */ }
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
  if (lang === 'en') prepareMachine();
  retranslateAll();
  listeners.forEach((fn) => fn(lang));
}

// --- Nachschlagen ---------------------------------------------------------------

/** Wörterbuch-Treffer (exakt oder mit Zahlen-Platzhaltern), sonst null. */
export function lookup(s) {
  if (!s) return null;
  if (Object.prototype.hasOwnProperty.call(DICT, s)) return DICT[s];
  const nums = s.match(NUM);
  if (nums) {
    let i = 0;
    const key = s.replace(NUM, () => `{${i++}}`);
    const hit = DICT[key];
    if (hit != null) return hit.replace(/\{(\d+)\}/g, (m, k) => nums[Number(k)] ?? m);
  }
  return composite(s);
}

/**
 * Zusammengesetzte Anzeigen („Neuer Hinweis: <Name>“, „○ Lampenöl ×2 (wird verbraucht)“, „A · 4: B · 3: C“)
 * bestehen aus Teilen, die einzeln im Wörterbuch stehen. Nur wenn ALLE Teile bekannt sind, gibt es einen Treffer.
 */
// Feste Satzanfänge vor einem Namen („freischalten über Inspektorin Marlowe“)
const LEADS = [['freischalten über ', 'unlock via '], ['Spur prüfen', 'Check trace'], ['bringt ', 'grants ']];
// Feste Satzrahmen um einen Namen („„X“ lesen“, „X ansehen“, „In X“)
const FRAMES = [
  [/^„(.+)“ lesen$/, (a) => `Read “${a}”`],
  [/^(.+) lesen$/, (a) => `Read ${a}`],
  [/^(.+) ansehen$/, (a) => `Look at ${a}`],
  [/^(.+) untersuchen$/, (a) => `Examine ${a}`],
  [/^(.+) aufheben$/, (a) => `Pick up ${a}`],
  [/^Du hältst den Auftrag „(.+)“ getrennt von der Hauptuntersuchung fest\.$/, (a) => `You record the job “${a}” separately from the main investigation.`],
  [/^Die ausgeführte Vereinbarung zu „(.+)“ ist quittiert\.$/, (a) => `The executed agreement on “${a}” is signed off.`],
  [/^(.+) herausfordern$/, (a) => `Challenge ${a}`],
  [/^Mit (.+) sprechen$/, (a) => `Talk to ${a}`],
  [/^(.+) \(Taste (\d+)\)$/, (a, m) => `${a} (key ${m[2]})`],
  [/^(.+) glaubt jetzt an dich\. Ein Gläubiger mehr\.$/, (a) => `${a} now believes in you. One more believer.`],
  [/^(.+) erkennt, wer zurückgekehrt ist, und bricht zusammen\.$/, (a) => `${a} recognises who has returned and collapses.`],
  [/^Fernzug (.+) prüfen$/, (a) => `Check remote pull: ${a}`],
  [/^Fernzug (.+)$/, (a) => `Remote pull: ${a}`],
  [/^(.+) hält inne, als du näherkommst\.$/, (a) => `${a} pauses as you approach.`],
  [/^Der Weg nach (.+) ist warm\.$/, (a) => `The way to ${a} is warm.`],
  [/^Der Weg nach (.+) ist kalt, aber begehbar\.$/, (a) => `The way to ${a} is cold but passable.`],
  [/^(.+) nickt\.$/, (a) => `${a} nods.`],
  [/^(.+) zählt dir (\d+) Schilling hin und legt etwas Schweres dazu\.$/, (a, m) => `${a} counts out ${m[2]} shillings for you and adds something heavy.`],
  [/^Was ich habe, taugt nur für den (Pfad .+?), und nur, wenn du schon weit bist: ab Sequenz (\d) für die Zutat der (\d), ab Sequenz (\d) für die Zutat der (\d)\.$/, (a, m) => `What I have is only good for the ${a}, and only if you're already far along: from Sequence ${m[2]} for the ingredient of ${m[3]}, from Sequence ${m[4]} for the ingredient of ${m[5]}.`],
  [/^(.+) legt ein kleines Mitbringsel neben die Tasse\.$/, (a) => `${a} places a small gift beside the cup.`],
  [/^(.+) nickt dir zu\.$/, (a) => `${a} nods to you.`],
  [/^(.+) sitzt nicht am Tisch\.$/, (a) => `${a} isn't at the table.`],
  [/^(?:Die|Der) (.+) trifft sich wieder, wenn die Uhr es sagt\.$/, (a) => `The ${a} meets again when the clock says so.`],
  [/^(.+) versperrt nur den inneren Bereich\.$/, (a) => `${a} only blocks the inner area.`],
  [/^In (.+)$/, (a) => `Enter ${a}`],
  [/^Nach (.+)$/, (a) => `To ${a}`],
];
const SEPS = [' · ', ' — ', ' – ', ': ', ' | ', ', ', '; '];
const NO_WORD = /^[^A-Za-zÄÖÜäöüß]*$/;
let memo = new Map();
let depth = 0;
const part = (x) => (NO_WORD.test(x) || !/[A-Za-zÄÖÜäöüß]{2,}/.test(x) ? x : lookup(x));
function composite(s) {
  if (depth > 24 || s.length > 800) return null;
  if (memo.has(s)) return memo.get(s);
  if (memo.size > 50000) memo = new Map();
  memo.set(s, null); // gegen Schleifen
  depth++;
  let out = null;
  try { out = compose(s); } finally { depth--; }
  memo.set(s, out);
  return out;
}
function compose(s) {
  let m = s.match(/^([^\p{L}\p{N}„“"(\[]+)([\p{L}\p{N}„“"(\[][\s\S]*)$/u); // Zeichen davor („○ “, „✧ +“)
  if (m) { const a = part(m[2]); return a == null ? null : m[1] + a; }
  m = s.match(/^([\s\S]*?\S) ×(\d+)$/); // Menge hinten
  if (m) { const a = part(m[1]); return a == null ? null : `${a} ×${m[2]}`; }
  m = s.match(/^([\s\S]*?[\p{L}\p{N}“”"')])(\s+[^\p{L}\s„“"(][^\p{L}]*)$/u); // Zeichen dahinter („Kalkmarkt →“, „Klopfbruch ⚠3“)
  if (m) { const a = part(m[1]); if (a != null) return a + m[2]; }
  for (const [de, en] of LEADS) if (s.startsWith(de)) { const a = part(s.slice(de.length)); if (a != null) return en + a; }
  for (const [re, fn] of FRAMES) { m = s.match(re); if (m) { const a = part(m[1]); if (a != null) return fn(a, m); } }
  m = s.match(/^([\s\S]*[^.!?…])([.:])$/); // Satzzeichen hinten
  if (m) { const a = lookup(m[1]); if (a != null) return /[.:!?…]$/.test(a) ? a : a + m[2]; }
  m = s.match(/^„([^„“]+)“$/); // ganz in Anführungszeichen
  if (m) { const a = part(m[1]); return a == null ? null : `“${a}”`; }
  m = s.match(/^([\s\S]*?\S) ([(\[])([^()[\]]+)([)\]])([.:]?)$/); // Klammer hinten
  if (m) { const a = part(m[1]); const b = a == null ? null : part(m[3]); if (b != null) return `${a} ${m[2]}${b}${m[4]}${m[5]}`; }
  // Sätze: „<bekannter Satz>. <bekannter Satz>.“ (z. B. Hinweistext + feste Schlusszeile)
  const cuts = [...s.matchAll(/[.!?…“](\s+)(?=[A-ZÄÖÜ„])/g)].slice(0, 12);
  for (const c of cuts) {
    const i = c.index + 1;
    const a = part(s.slice(0, i));
    if (a == null) continue;
    const b = part(s.slice(i + c[1].length));
    if (b != null) return `${a} ${b}`;
  }
  for (const sep of SEPS) {
    for (let i = s.indexOf(sep), n = 0; i > 0 && n < 8; i = s.indexOf(sep, i + 1), n++) {
      const a = part(s.slice(0, i)) ?? (sep === ': ' ? lookup(`${s.slice(0, i)}:`)?.replace(/:$/, '') : null);
      if (a == null) continue;
      const b = part(s.slice(i + sep.length));
      if (b != null) return a + sep + b;
    }
  }
  return null;
}

/** Kleinster fehlender Teil eines zusammengesetzten Textes (für die Fehlliste), sonst der Text selbst. */
function missingPart(s, d = 0) {
  if (d > 8) return s;
  const m = s.match(/^[^\p{L}\p{N}„“"(\[]+([\p{L}\p{N}„“"(\[][\s\S]*)$/u);
  if (m) return missingPart(m[1], d + 1);
  for (const c of [...s.matchAll(/[.!?…“](\s+)(?=[A-ZÄÖÜ„])/g)].slice(0, 12)) {
    const a = s.slice(0, c.index + 1);
    const b = s.slice(c.index + 1 + c[1].length);
    if (part(a) != null && part(b) == null) return missingPart(b, d + 1);
    if (part(b) != null && part(a) == null) return missingPart(a, d + 1);
  }
  for (const sep of SEPS) {
    for (let i = s.indexOf(sep), n = 0; i > 0 && n < 8; i = s.indexOf(sep, i + 1), n++) {
      const a = s.slice(0, i);
      const b = s.slice(i + sep.length);
      if (part(a) != null && part(b) == null) return missingPart(b, d + 1);
      if (part(b) != null && part(a) == null) return missingPart(a, d + 1);
    }
  }
  return s;
}

const HAS_WORD = /[A-Za-zÄÖÜäöüß]{2,}/;

/**
 * Text für die aktuelle Sprache. Führende/abschließende Leerzeichen bleiben erhalten.
 * Ohne Treffer: automatischer Übersetzer (asynchron, `onLate` wird danach aufgerufen) oder der Originaltext.
 */
export function tr(s, onLate) {
  return withNames(trLang(s, onLate && ((t) => onLate(withNames(t)))));
}

function trLang(s, onLate) {
  if (lang !== 'en' || typeof s !== 'string' || !HAS_WORD.test(s)) return s;
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const core = m[2];
  const hit = lookup(core);
  if (hit != null) return m[1] + hit + m[3];
  if (MISSES.size < 20000) MISSES.add(missingPart(core));
  const mt = machine(core, onLate && ((t) => onLate(m[1] + t + m[3])));
  return mt != null ? m[1] + mt + m[3] : s;
}

// --- Eigene Spielernamen (Seb: im Inventar umbenennbar, max. 9 Zeichen) ---------
// Statt jede Stelle mit „Spieler 1/2“ umzubauen, ersetzt die Anzeige-Schicht den Text nach der Übersetzung.

export const NAME_MAX = 9;
let NAMES = ['', ''];
const NAME_RE = /\b(?:Spieler|Player|player)\s([12])\b/g;

/** Name für Spieler n (leer = Standard „Spieler n“). */
export function cleanName(v) { return String(v ?? '').replace(/[<>&"\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX); }
export function playerName(n) { return NAMES[n - 1] || `${lang === 'en' ? 'Player' : 'Spieler'} ${n}`; }
export function setPlayerNames(list) {
  const next = [cleanName(list?.[0]), cleanName(list?.[1])];
  if (next[0] === NAMES[0] && next[1] === NAMES[1]) return;
  NAMES = next;
  retranslateAll();
}
function withNames(s) {
  if (typeof s !== 'string' || (!NAMES[0] && !NAMES[1])) return s;
  return s.replace(NAME_RE, (m, n) => NAMES[n - 1] || m);
}

// --- Automatische Übersetzung (Chrome Translator-API) ---------------------------

let translator = null;
let mtCache = {};
let mtDirty = false;
const pending = new Map();
try { mtCache = JSON.parse(localStorage.getItem(MT_KEY) ?? '{}') ?? {}; } catch { mtCache = {}; }

/** Gibt es einen Übersetzer im Browser? (für den Hinweis im Menü) */
export function machineAvailable() { return typeof self !== 'undefined' && 'Translator' in self; }

let preparing = null;
function prepareMachine() {
  if (translator || preparing || !machineAvailable()) return preparing;
  preparing = (async () => {
    try {
      const a = await self.Translator.availability({ sourceLanguage: 'de', targetLanguage: 'en' });
      if (a === 'unavailable') return;
      translator = await self.Translator.create({ sourceLanguage: 'de', targetLanguage: 'en' });
      retranslateAll();
    } catch { /* kein Modell / keine Nutzergeste: dann eben ohne */ } finally { preparing = null; }
  })();
  return preparing;
}

function machine(s, onLate) {
  if (Object.prototype.hasOwnProperty.call(mtCache, s)) return mtCache[s];
  if (!translator) return null;
  if (s.length > 4000) return null;
  let p = pending.get(s);
  if (!p) {
    p = translator.translate(s).then((t) => {
      mtCache[s] = t;
      saveCacheSoon();
      return t;
    }).catch(() => null).finally(() => pending.delete(s));
    pending.set(s, p);
  }
  if (onLate) p.then((t) => { if (t != null && lang === 'en') onLate(t); });
  return null;
}

let cacheTimer = null;
function saveCacheSoon() {
  mtDirty = true;
  clearTimeout(cacheTimer);
  cacheTimer = setTimeout(() => {
    if (!mtDirty) return;
    mtDirty = false;
    try { localStorage.setItem(MT_KEY, JSON.stringify(mtCache)); } catch {
      // Speicher voll: Zwischenspeicher halbieren
      const keys = Object.keys(mtCache);
      keys.slice(0, keys.length >> 1).forEach((k) => delete mtCache[k]);
      try { localStorage.setItem(MT_KEY, JSON.stringify(mtCache)); } catch { /* egal */ }
    }
  }, 2000);
}

// --- DOM ------------------------------------------------------------------------

const ORIG = new WeakMap(); // Textknoten → deutscher Originaltext
const SHOWN = new WeakMap(); // Textknoten → zuletzt von uns gesetzter Text
const ATTRS = ['title', 'placeholder', 'aria-label'];
const roots = [];
let observer = null;

function skip(node) {
  const p = node.parentElement;
  return !p || p.closest('script, style, textarea, input, [data-no-tr]');
}

function doText(node) {
  const cur = node.nodeValue;
  if (SHOWN.get(node) === cur) return; // unser eigener Text
  ORIG.set(node, cur);
  if ((lang !== 'en' && !NAMES[0] && !NAMES[1]) || skip(node)) { SHOWN.delete(node); return; }
  const set = (t) => {
    if (ORIG.get(node) !== cur) return; // inzwischen neuer Text
    SHOWN.set(node, t);
    if (node.nodeValue !== t) node.nodeValue = t;
  };
  const out = tr(cur, set);
  if (out !== cur) set(out);
}

function doAttrs(el) {
  for (const a of ATTRS) {
    if (!el.hasAttribute?.(a) || el.closest?.('[data-no-tr]')) continue;
    const key = `data-de-${a}`;
    const cur = el.getAttribute(a);
    if (el.getAttribute(`data-en-${a}`) === cur) continue;
    el.setAttribute(key, cur);
    if (lang !== 'en' && !NAMES[0] && !NAMES[1]) continue;
    const out = tr(cur, (t) => { if (el.getAttribute(key) === cur) { el.setAttribute(`data-en-${a}`, t); el.setAttribute(a, t); } });
    if (out !== cur) { el.setAttribute(`data-en-${a}`, out); el.setAttribute(a, out); }
  }
}

function walk(node) {
  if (node.nodeType === 3) { doText(node); return; }
  if (node.nodeType !== 1) return;
  doAttrs(node);
  const it = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n = it.nextNode();
  while (n) {
    if (n.nodeType === 3) doText(n); else doAttrs(n);
    n = it.nextNode();
  }
}

/** Beobachtet die angegebenen Wurzeln und übersetzt jede Änderung. */
export function watchDom(...els) {
  if (typeof MutationObserver === 'undefined') return;
  document.documentElement.lang = lang;
  if (!observer) {
    observer = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') doAttrs(m.target);
        else m.addedNodes.forEach(walk);
      }
    });
  }
  for (const el of els) {
    if (!el || roots.includes(el)) continue;
    roots.push(el);
    observer.observe(el, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    walk(el);
  }
  if (lang === 'en') prepareMachine();
}

const phaserTexts = new Set();

/** Alles neu übersetzen (nach Sprachwechsel oder wenn der Übersetzer bereit ist). */
function retranslateAll() {
  if (typeof document === 'undefined') return;
  for (const r of roots) {
    const it = document.createTreeWalker(r, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n = it.nextNode();
    while (n) {
      if (n.nodeType === 3) {
        const orig = ORIG.has(n) && SHOWN.get(n) === n.nodeValue ? ORIG.get(n) : n.nodeValue;
        SHOWN.delete(n);
        n.nodeValue = orig; // löst characterData aus → doText übersetzt neu
        doText(n);
      } else {
        for (const a of ATTRS) {
          const de = n.getAttribute(`data-de-${a}`);
          if (de != null && n.getAttribute(a) === n.getAttribute(`data-en-${a}`)) { n.removeAttribute(`data-en-${a}`); n.setAttribute(a, de); }
        }
        doAttrs(n);
      }
      n = it.nextNode();
    }
  }
  for (const t of phaserTexts) {
    if (!t.scene) { phaserTexts.delete(t); continue; }
    t.setText(t.__de ?? t.text);
  }
}

/** Phaser-Texte (Namen über Figuren, Kampfanzeigen) über setText mitübersetzen. */
export function patchPhaser(Phaser) {
  const proto = Phaser?.GameObjects?.Text?.prototype;
  if (!proto || proto.__i18n) return;
  proto.__i18n = true;
  const orig = proto.setText;
  proto.setText = function setText(value) {
    const de = Array.isArray(value) ? value.join('\n') : value == null ? '' : String(value);
    this.__de = de;
    phaserTexts.add(this);
    const out = tr(de, (t) => { if (this.__de === de && this.scene) orig.call(this, t); });
    return orig.call(this, out);
  };
}
