// Prüft im laufenden Spiel (Englisch), welche sichtbaren Texte noch ohne Übersetzung sind.
// Aufruf: npx vite --port 5179 & node tools/i18n-sichtbar.mjs [http://localhost:5179/] [--alle-orte]
// Rendert Notizbuch (alle Reiter, Pfad-Reiter jedes Pfades auf mehreren Sequenzen, alle Fälle mit allen
// Hinweisen), Enden, Fallwand und Meldungen und prüft die Untersuchungstexte an Orten. Ohne --alle-orte
// werden nur Orte bis Kapitel 3 geprüft (spätere Kapitel sind noch nicht vollständig übersetzt).
// Ausgabe: fehlende Texte, Exit-Code 1 wenn etwas fehlt.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:5179/';
const alleOrte = process.argv.includes('--alle-orte');
const SPAET = /^(bh_|cw_|o3_|vm_)/;

const b = await chromium.launch(); const p = await b.newPage();
p.on('pageerror', (e) => console.log('Seitenfehler:', e.message.slice(0, 200)));
await p.goto(url); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('nebelakten-lang', 'en'); });
await p.goto(url); await p.waitForTimeout(2500);
await p.evaluate(() => window.__nebel.ui.titleNew()); await p.waitForTimeout(2500);
const r = await p.evaluate(async ({ alleOrte, spaet }) => {
  const { ui, state, content } = window.__nebel; const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const errs = []; const late = new RegExp(spaet);
  const tabs = async () => { for (const t of ['quests', 'items', 'pfad', 'personen', 'kulte', 'bestiar', 'zeitung', 'archiv', 'erfolge', 'post', 'tiere', ...content.cases.map((c) => c.id)]) { try { ui.modal = 'notebook'; ui.tab = t; ui.renderNotebook(''); } catch (e) { errs.push(t + ': ' + e.message); } await wait(30); } };
  await tabs();
  for (const pid of Object.keys(content.pathways)) for (const seq of [9, 7, 5, 4, 3, 1]) { state.pathway = { id: pid, seq, digestion: 60 }; try { ui.modal = 'notebook'; ui.tab = 'pfad'; ui.renderNotebook(''); } catch (e) { errs.push(pid + seq + ': ' + e.message); } await wait(20); }
  state.clues.push(...Object.keys(content.clues)); state.conclusions.push(...content.deductions.map((d) => d.id));
  for (const q of Object.keys(content.quests)) state.quests[q] = 'active';
  await tabs();
  for (const id of Object.keys(content.endings)) { try { ui.showEnding(id); } catch (e) { errs.push('Ende ' + id + ': ' + e.message); } await wait(10); }
  try { ui.close(); ui.showCaseWall(); } catch (e) { errs.push('Fallwand: ' + e.message); }
  for (const q of Object.values(content.quests)) { ui.toast(`Neuer Auftrag: ${q.title}`); ui.toast(`Auftrag erledigt: ${q.title}`); }
  for (const q of Object.values(content.clues)) ui.toast(`Neuer Hinweis: ${q.name}`);
  for (const q of Object.values(content.facts)) ui.toast(`Bestätigt: ${q.text}`);
  for (const q of Object.values(content.items)) if (q.name) ui.toast(`Erhalten: ${q.name}`);
  for (const d of content.deductions) ui.toast(`Schlussfolgerung: ${d.name}`);
  await wait(500);
  const miss = JSON.parse(window.__i18nMissing());
  // Untersuchungstexte an Orten (werden erst beim Betreten gezeigt, daher direkt nachschlagen)
  const L = window.__i18nLookup; const orte = {};
  const add = (mid, s) => { if (typeof s !== 'string' || !/[A-Za-zÄÖÜäöüß]{2,}/.test(s)) return; for (const para of s.split(/\n+/)) { const t = para.trim(); if (t && L(t) == null) orte[t] = mid; } };
  for (const [mid, m] of Object.entries(content.maps)) {
    if (!alleOrte && late.test(mid)) continue;
    add(mid, m.name);
    for (const o of m.interactables ?? []) { for (const k of ['title', 'text', 'prompt', 'name', 'label']) add(mid, o[k]); for (const x of [].concat(o.lines ?? [], o.pages ?? [])) add(mid, typeof x === 'string' ? x : x?.text); }
  }
  return { miss: Object.keys(miss), orte, errs };
}, { alleOrte, spaet: SPAET.source });
await b.close();
const ignor = /^k\dk_[a-z_]+$/; // interne Begegnungs-Kennungen
const ui = r.miss.filter((s) => !ignor.test(s)); const orte = Object.entries(r.orte).filter(([s]) => !ignor.test(s));
for (const e of r.errs) console.log('Fehler:', e);
for (const s of ui) console.log('Oberfläche:', s);
for (const [s, mid] of orte) console.log(`Ort ${mid}:`, s);
console.log(`\n${ui.length} fehlende Oberflächentexte, ${orte.length} fehlende Ortstexte, ${r.errs.length} Fehler`);
process.exit(ui.length || orte.length || r.errs.length ? 1 : 0);
