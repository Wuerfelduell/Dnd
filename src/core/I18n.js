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

let lang = 'de';
try { lang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'de'; } catch { /* kein Speicher */ }

const listeners = new Set();
// Angezeigte Texte ohne Wörterbuch-Eintrag (Entwicklerhilfe: in der Konsole __i18nMissing() aufrufen)
const MISSES = new Set();
export function missingTexts() { return [...MISSES]; }
if (typeof window !== 'undefined') window.__i18nMissing = () => JSON.stringify(Object.fromEntries([...MISSES].map((s) => [s, ''])), null, 1);

export function getLang() { return lang; }
export function isEnglish() { return lang === 'en'; }
export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
/** Nur für Tests: eigenes Wörterbuch setzen. */
export function setDict(d) { DICT = d; }

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
  if (!nums) return null;
  let i = 0;
  const key = s.replace(NUM, () => `{${i++}}`);
  const hit = DICT[key];
  if (hit == null) return null;
  return hit.replace(/\{(\d+)\}/g, (m, k) => nums[Number(k)] ?? m);
}

const HAS_WORD = /[A-Za-zÄÖÜäöüß]{2,}/;

/**
 * Text für die aktuelle Sprache. Führende/abschließende Leerzeichen bleiben erhalten.
 * Ohne Treffer: automatischer Übersetzer (asynchron, `onLate` wird danach aufgerufen) oder der Originaltext.
 */
export function tr(s, onLate) {
  if (lang !== 'en' || typeof s !== 'string' || !HAS_WORD.test(s)) return s;
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const core = m[2];
  const hit = lookup(core);
  if (hit != null) return m[1] + hit + m[3];
  if (MISSES.size < 20000) MISSES.add(core);
  const mt = machine(core, onLate && ((t) => onLate(m[1] + t + m[3])));
  return mt != null ? m[1] + mt + m[3] : s;
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
  if (lang !== 'en' || skip(node)) { SHOWN.delete(node); return; }
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
    if (lang !== 'en') continue;
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
