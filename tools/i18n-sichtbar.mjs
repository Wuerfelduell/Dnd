// Prüft im laufenden Spiel (Englisch), welche sichtbaren Texte noch ohne Übersetzung sind.
// Aufruf: npx vite --port 5179 & node tools/i18n-sichtbar.mjs [http://localhost:5179/]
// Rendert Notizbuch (alle Reiter, Pfad-Reiter jedes Pfades auf mehreren Sequenzen, alle Fälle mit allen
// Hinweisen), Enden, Fallwand und Meldungen und prüft die Untersuchungstexte an allen Orten sowie alle Dialoge.
// Ausgabe: fehlende Texte, Exit-Code 1 wenn etwas fehlt.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:5179/';

const b = await chromium.launch(); const p = await b.newPage();
p.on('pageerror', (e) => console.log('Seitenfehler:', e.message.slice(0, 200)));
await p.goto(url); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('nebelakten-lang', 'en'); });
await p.goto(url); await p.waitForTimeout(2500);
await p.evaluate(() => window.__nebel.ui.titleNew()); await p.waitForTimeout(2500);
const r = await p.evaluate(async () => {
  const { ui, state, content } = window.__nebel; const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const errs = [];
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
    add(mid, m.name);
    for (const o of m.interactables ?? []) { for (const k of ['title', 'text', 'prompt', 'name', 'label']) add(mid, o[k]); for (const x of [].concat(o.lines ?? [], o.pages ?? [])) add(mid, typeof x === 'string' ? x : x?.text); }
  }
  // Dialoge: Sprecher, Knotentexte und Antworten
  const dlg = {};
  const addD = (did, s) => { if (typeof s !== 'string' || !/[A-Za-zÄÖÜäöüß]{2,}/.test(s)) return; for (const para of s.split(/\n+/)) { const t = para.trim(); if (t && L(t) == null) dlg[t] = did; } };
  for (const [did, d] of Object.entries(content.dialogues)) { addD(did, d.speaker); addD(did, d.name); for (const n of Object.values(d.nodes ?? {})) { addD(did, n.speaker); addD(did, n.text); for (const ch of n.choices ?? []) { addD(did, ch.text); addD(did, ch.label); } } }
  return { miss: Object.keys(miss), orte, dlg, errs };
});
await b.close();
const ignor = /^k\dk_[a-z_]+$/; // interne Begegnungs-Kennungen
const ui = r.miss.filter((s) => !ignor.test(s)); const orte = Object.entries(r.orte).filter(([s]) => !ignor.test(s)); const dlg = Object.entries(r.dlg);
for (const e of r.errs) console.log('Fehler:', e);
for (const s of ui) console.log('Oberfläche:', s);
for (const [s, mid] of orte) console.log(`Ort ${mid}:`, s);
for (const [s, did] of dlg) console.log(`Dialog ${did}:`, s);
console.log(`\n${ui.length} fehlende Oberflächentexte, ${orte.length} fehlende Ortstexte, ${dlg.length} fehlende Dialogtexte, ${r.errs.length} Fehler`);
process.exit(ui.length || orte.length || dlg.length || r.errs.length ? 1 : 0);
