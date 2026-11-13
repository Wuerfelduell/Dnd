#!/usr/bin/env node
/**
 * Listet deutsche Texte, die im englischen Wörterbuch (src/i18n/en/*.json) noch fehlen.
 *
 *   node tools/i18n-extract.mjs [Pfad ...] [--out datei.json] [--stats]
 *
 * Ohne Pfad: ganz src/. Aus JS werden String-Literale gelesen (in Template-Literalen gelten ${…} als Trenner,
 * reine Zahlen-Ausdrücke werden zu {0}, {1} …), aus JSON alle Textwerte. HTML-Tags trennen Textstücke, so wie
 * sie später als Textknoten im DOM stehen. Ausgabe: { "deutscher Text": "" } zum Ausfüllen.
 */
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? args.splice(outIdx, 2)[1] : null;
const stats = args.includes('--stats');
const targets = args.filter((a) => !a.startsWith('--'));
if (!targets.length) targets.push('src');

const dict = {};
const dictDir = 'src/i18n/en';
if (fs.existsSync(dictDir)) for (const f of fs.readdirSync(dictDir)) if (f.endsWith('.json')) Object.assign(dict, JSON.parse(fs.readFileSync(path.join(dictDir, f), 'utf8')));

const files = [];
const walkDir = (p) => {
  if (fs.statSync(p).isDirectory()) { if (!p.includes('i18n')) fs.readdirSync(p).forEach((f) => walkDir(path.join(p, f))); } else if (/\.(js|json)$/.test(p) && !p.endsWith('I18n.js')) files.push(p);
};
targets.forEach(walkDir);

const GERMANISH = /[A-Za-zÄÖÜäöüß]{2,}/;
const IDLIKE = /^[\w./#:-]+$/; // ids, Pfade, Schlüssel
const found = new Map(); // Text → Datei

function addText(s, file) {
  for (let piece of s.split(/<[^>]*>/)) {
    piece = piece.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
    if (!piece || !GERMANISH.test(piece)) continue;
    if (IDLIKE.test(piece) && !/^[A-ZÄÖÜ][a-zäöüß]+$/.test(piece)) continue; // einzelnes großgeschriebenes Wort darf durch
    if (/^[a-z_]+$/.test(piece)) continue;
    if (/^(#|rgba?\(|url\(|\d)/.test(piece) && !/\s[a-zäöü]{3,}/.test(piece)) continue;
    if (!found.has(piece)) found.set(piece, file);
  }
}

function fromJs(src, file) {
  // Kommentare grob entfernen (keine Regex-Literale mit // erwartet)
  src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
  const re = /'((?:\\.|[^'\\\n])*)'|"((?:\\.|[^"\\\n])*)"|`((?:\\.|\$\{(?:[^{}]|\{[^{}]*\})*\}|[^`\\])*)`/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[3] != null) {
      const t = m[3].replace(/\\n/g, '\n');
      let i = 0;
      const numbered = t.replace(/\$\{((?:[^{}]|\{[^{}]*\})*)\}/g, () => `{${i++}}`);
      if (!/<|\{\d+\}.*\{\d+\}/.test(numbered) && i > 0 && i <= 3) addText(numbered, file);
      t.split(/\$\{(?:[^{}]|\{[^{}]*\})*\}/).forEach((p) => addText(p, file));
    } else {
      addText((m[1] ?? m[2]).replace(/\\n/g, '\n').replace(/\\(.)/g, '$1'), file);
    }
  }
}

function fromJson(v, file, key = '') {
  if (typeof v === 'string') { if (!/^(id|icon|sprite|sheet|map|flag|scene|url|img|type|tile|texture|music|sound|portrait)s?$/.test(key)) addText(v, file); } else if (Array.isArray(v)) v.forEach((x) => fromJson(x, file, key)); else if (v && typeof v === 'object') for (const k in v) fromJson(v[k], file, k);
}

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (src.startsWith('// i18n: ignorieren')) continue;
  if (f.endsWith('.json')) { try { fromJson(JSON.parse(src), f); } catch { /* kaputt */ } } else fromJs(src, f);
}

const missing = {};
let chars = 0;
const perFile = {};
for (const [s, f] of found) {
  if (Object.prototype.hasOwnProperty.call(dict, s)) continue;
  missing[s] = '';
  chars += s.length;
  perFile[f] = (perFile[f] ?? 0) + s.length;
}
if (stats) {
  console.log(`gefunden ${found.size}, übersetzt ${found.size - Object.keys(missing).length}, fehlend ${Object.keys(missing).length} (${chars} Zeichen)`);
  Object.entries(perFile).sort((a, b) => b[1] - a[1]).slice(0, 40).forEach(([f, c]) => console.log(String(c).padStart(8), f));
}
if (out) fs.writeFileSync(out, JSON.stringify(missing, null, 1));
else if (!stats) console.log(JSON.stringify(missing, null, 1));
