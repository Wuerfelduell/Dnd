// Sammelt die deutschen Texte von Kapitel 7 Varrowmouth (Etappe 1: Anreise, Karten, Akt I, Läden, Hauptgespräche; Etappe 2: Akt II, Wrackfeld, Gegner), die von Hand ins
// EN-Wörterbuch gehören. Alltagsgerede der Figuren (CX) übersetzt die Chrome-Übersetzung.
// node tools/i18n-varrowmouth.mjs → listet fehlende Einträge in src/i18n/en/varrowmouth.json
import { readFileSync } from 'node:fs';
import { loadContent } from '../tests/helpers.js';
import { VM_LAEDEN } from '../src/data/varrowmouth.js';

const HAUPT = /^k6_([1-5]\d|bilanz\d|rat_\d|vertrauen|szene_|osric|harrow|zeuge|ende|kampf_|anreise|tam|zoll|nell|kampf_wrackmutter|szene_ankunft|szene_wartungsgang|szene_kielraum)/;

export function varrowmouthTexte(content = loadContent()) {
  const out = new Set();
  const add = (s) => { if (typeof s === 'string' && s.trim()) out.add(s); };
  const dlg = (d) => { for (const n of Object.values(d.nodes)) { add(n.text); for (const c of n.choices ?? []) add(c.text); } };
  for (const [id, d] of Object.entries(content.dialogues)) if (HAUPT.test(id)) dlg(d);
  for (const [id, m] of Object.entries(content.maps)) {
    if (!id.startsWith('vm_')) continue;
    add(m.name);
    for (const i of m.interactables) { add(i.prompt); add(i.title); add(i.text); }
  }
  for (const i of content.maps.bh_buegelraum.interactables.filter((x) => x.id.startsWith('k6_'))) { add(i.prompt); add(i.title); }
  for (const t of content.travel.filter((x) => x.map.startsWith('vm_'))) { add(t.name); add(t.desc); }
  for (const q of [1, 2, 3, 4, 5].map((n) => content.quests[`k6_akt${n}`])) { add(q.title); add(q.summary); for (const s of q.steps) { add(s.text); add(s.target?.label); } }
  const AKT = /^k6_[1-5]\d_/;
  for (const [id, c] of Object.entries(content.clues)) if (AKT.test(id)) { add(c.name); add(c.text); }
  for (const [id, f] of Object.entries(content.facts)) if (AKT.test(id)) add(f.text);
  for (const d of content.deductions) if (AKT.test(d.id)) { add(d.name); add(d.text); }
  for (const [id, e] of Object.entries(content.encounters)) {
    if (!/^(vme_|wrackmutter$|leuchtfeuerwaechter$|pegelherrin)/.test(id)) continue;
    for (const k of ['name', 'win_text', 'lose_text', 'flee_text', 'flut_text']) add(e[k]);
    if (!e.elite) add(e.intro); // Eliten hängen die Beyonder-Zeile an (gegner_beyonder.json)
    for (const a of [...e.attacks, ...(e.phase2?.attacks ?? [])]) if (!a.pfad && !e.elite) { add(a.name); add(a.text); } // Pfad-Fertigkeiten übersetzt gegner_beyonder
    add(e.phase2?.meldung);
  }
  for (const m of Object.values(content.maps)) add(m.flut_raus?.text);
  add('Die Flut kommt. Das Wasser steigt in die Gassen.'); add('Ebbe. Das Wasser zieht sich zurück und gibt den Schlick frei.'); // WorldScene.gezeitWechsel
  for (const [id, e] of Object.entries(content.endings)) if (id.startsWith('k6_ende_')) { add(e.title); add(e.text); add(e.chapter?.title); add(e.chapter?.text); add(e.chapter?.footer); }
  for (const e of content.epiloge) if (e.id?.startsWith('k6_')) { add(e.title); add(e.text); }
  for (const c of content.cases) if (c.id === 'kapitel6') add(c.title);
  for (const [id, it] of Object.entries(content.items)) if (id.startsWith('vmi_')) { add(it.name); add(it.desc); }
  for (const [id, l] of Object.entries(VM_LAEDEN)) { add(l.title); add(l.greeting); add(content.npcs[l.npc].role); }
  for (const [id, n] of Object.entries(content.npcs)) if (id.startsWith('vmn_')) add(n.role);
  add('Zur Sache.'); add('Ware ansehen.'); add('Stadtkarte von Varrowmouth');
  return [...out];
}

if (process.argv[1]?.endsWith('i18n-varrowmouth.mjs')) {
  const { setDict, lookup } = await import('../src/core/I18n.js');
  const { readdirSync } = await import('node:fs');
  const dir = new URL('../src/i18n/en/', import.meta.url);
  const d = Object.assign({}, ...readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8'))));
  setDict(d);
  const fehlt = varrowmouthTexte().filter((t) => !lookup(t));
  console.log(JSON.stringify(Object.fromEntries(fehlt.map((t) => [t, ''])), null, 1));
  console.error(`${fehlt.length} fehlen`);
}
