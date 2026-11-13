// Sackgassen-Suche: optimistische Erreichbarkeit aller Hinweise, Markierungen, Gegenstände, Aufträge und Enden.
// Negative Bedingungen (hide_if_*, max_*), Geld, Ansehen, Sequenz, Stimmung usw. gelten als erfüllbar.
// Was hier trotzdem unerreichbar bleibt, kann im Spiel nie passieren: Auftragsschritt hängt fest.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Markierungen, die der Code zur Laufzeit aus Mustern baut: Nacht (Clock.NIGHT_FLAG), Rituale (Pathways.ritualFlag), Siege je Spieler (aufstieg.js). */
export const DYNAMIC_FLAG = /^(k3h_nacht|(p2_)?ritual_[a-z_]+_\d|\w+_p[12])$/;

export function analyse(content, { codeFlags = [], dynamicFlag = DYNAMIC_FLAG } = {}) {
  const R = { clue: new Set(), flag: new Set(codeFlags), item: new Set(), qs: new Set(), qd: new Set(), concl: new Set(), map: new Set([content.start.map]), ending: new Set(), dlg: new Set() };
  for (const q of content.start.quests ?? []) R.qs.add(q);
  for (const i of Object.keys(content.start.items ?? {})) R.item.add(i);
  // Gegenstände, die man kaufen oder erbeuten kann: alles, was irgendwo anders als in Bedingungen genannt ist
  const itemIds = new Set(Object.keys(content.items));
  const scan = (o, key) => {
    if (typeof o === 'string') { if (itemIds.has(o) && !/^(requires_items|hide_if_items|takes_items|requires_item_counts)$/.test(key)) R.item.add(o); return; }
    if (Array.isArray(o)) return o.forEach((x) => scan(x, key));
    if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) {
      if (/^(requires_items|hide_if_items|takes_items|requires_item_counts|requires_clues|hide_if_clues)$/.test(k)) continue;
      if (itemIds.has(k) && k !== key && !/^(requires|hide|takes)/.test(key ?? '')) R.item.add(k);
      scan(v, k);
    }
  };
  for (const [k, v] of Object.entries(content)) if (!['items', 'quests', 'dialogues', 'maps'].includes(k)) scan(v, k);
  for (const tree of Object.values(content.dialogues)) for (const n of Object.values(tree.nodes ?? {})) { for (const ch of n.choices ?? []) if (ch.shop) scan(ch.shop, 'shop'); if (n.shop) scan(n.shop, 'shop'); }

  const factSrc = (f) => Object.entries(content.clues).filter(([c, d]) => d.fact === f && R.clue.has(c)).length;
  const known = (f) => factSrc(f) >= 1;
  const likely = (f) => factSrc(f) >= 2;
  const dedById = Object.fromEntries((Array.isArray(content.deductions) ? content.deductions : Object.entries(content.deductions).map(([id, d]) => ({ id, ...d }))).map((d) => [d.id, d]));
  const certain = (d) => R.concl.has(d) && dedById[d]?.pairs.some(([a, b]) => likely(a) && likely(b));
  const all = (l, t) => (l ?? []).every(t);
  const ok = (o) => !o || (
    all(o.requires_clues, (c) => R.clue.has(c)) && (!o.requires_any_clues || o.requires_any_clues.some((c) => R.clue.has(c))) &&
    all(o.requires_facts, known) && all(o.requires_likely, likely) && all(o.requires_suspected, known) &&
    all(o.requires_conclusions, (c) => R.concl.has(c)) && all(o.requires_certain, certain) &&
    all(o.requires_flags, (f) => R.flag.has(f) || dynamicFlag.test(f)) && (!o.requires_any_flags || o.requires_any_flags.some((f) => R.flag.has(f))) &&
    (!o.requires_n_flags || o.requires_n_flags.of.filter((f) => R.flag.has(f)).length >= o.requires_n_flags.n) &&
    all(o.requires_quests_active, (q) => R.qs.has(q)) && (!o.requires_any_quests_active || o.requires_any_quests_active.some((q) => R.qs.has(q))) &&
    all(o.requires_quests_done, (q) => R.qd.has(q)) && all(o.requires_items, (i) => R.item.has(i)) &&
    all(Object.keys(o.requires_item_counts ?? {}), (i) => R.item.has(i)) &&
    (o.requires_alle_flag === undefined || R.flag.has(`${o.requires_alle_flag}_p1`) || dynamicFlag.test(`${o.requires_alle_flag}_p1`)));
  let changed = true;
  const add = (set, x) => { if (x !== undefined && !set.has(x)) { set.add(x); changed = true; } };
  const effects = (e) => {
    if (!e) return;
    for (const c of e.gives_clues ?? []) add(R.clue, c);
    for (const f of e.sets_flags ?? []) add(R.flag, f);
    for (const c of e.gives_conclusions ?? []) add(R.concl, c);
    for (const q of e.start_quests ?? []) add(R.qs, q);
    for (const q of e.complete_quests ?? []) { add(R.qs, q); add(R.qd, q); }
    for (const i of Object.keys(e.gives_items ?? {})) add(R.item, i);
    if (e.ending && !R.ending.has(e.ending)) { add(R.ending, e.ending); effects({ ...content.endings[e.ending], ending: undefined }); }
    if (e.combat) fight(e.combat);
    if (e.encounter) fight(e.encounter);
    if (e.travel?.map) add(R.map, e.travel.map);
  };
  const fight = (id) => { const enc = content.encounters[id]; add(R.flag, `won_${id}`); effects(enc?.on_win); effects(enc?.first_win); };
  const walk = (dlgId) => {
    const tree = content.dialogues[dlgId];
    if (!tree) return;
    add(R.dlg, dlgId);
    const starts = Array.isArray(tree.start) ? tree.start.filter(ok).map((s) => s.node) : [tree.start];
    const seen = new Set(); const todo = [...starts];
    while (todo.length) {
      const id = todo.pop(); if (seen.has(id)) continue; seen.add(id);
      const n = tree.nodes[id]; if (!n) continue;
      effects(n);
      for (const ch of n.choices ?? []) if (ok(ch) && ch.next) {
        if (typeof ch.next === 'string') todo.push(ch.next);
        else for (const v of ch.next) if (ok(v)) todo.push(v.node);
      }
    }
  };
  while (changed) {
    changed = false;
    for (const t of content.travel) if (ok(t)) add(R.map, t.map);
    for (const [d, ded] of Object.entries(dedById)) if (ded.pairs.some(([a, b]) => known(a) && known(b))) add(R.concl, d);
    for (const mapId of [...R.map]) {
      const map = content.maps[mapId]; if (!map) continue;
      for (const def of map.npcs ?? []) {
        if (!ok(def.visible_if) || !ok(def.lock)) continue;
        walk(def.dialogue ?? content.npcs[def.id]?.dialogue);
      }
      for (const def of map.interactables ?? []) {
        if (!ok(def.visible_if) || !ok(def.lock)) continue;
        if (def.clue) add(R.clue, def.clue);
        add(R.flag, def.done_flag);
        effects(def.effects);
        if ((def.kind === 'door' || def.kind === 'nebel') && def.to) add(R.map, def.to);
        if (def.kind === 'dialogue') walk(def.dialogue);
        if (def.kind === 'combat') fight(def.encounter);
      }
      for (const def of map.roamers ?? []) fight(def.encounter);
    }
    // Fundstücke: „Untersuchen“ im Inventar öffnet einen Dialog
    for (const [id, it] of Object.entries(content.items)) if (it.inspect && R.item.has(id)) walk(it.inspect);
    for (const [id, q] of Object.entries(content.quests)) {
      if (!q.lead || R.qs.has(id)) continue;
      for (const l of Array.isArray(q.lead) ? q.lead : [q.lead]) if (ok(l)) { /* Spur sichtbar, Auftrag noch nicht */ }
    }
  }
  const out = { R, ok };
  out.stuck = [];
  for (const [id, q] of Object.entries(content.quests)) {
    if (!R.qs.has(id)) continue;
    (q.steps ?? []).forEach((s, i) => { if (!ok(s.done)) out.stuck.push({ quest: id, kind: q.kind, step: i, text: s.text, done: s.done }); });
  }
  out.neverStarted = Object.keys(content.quests).filter((q) => !R.qs.has(q));
  out.endingsUnreached = Object.keys(content.endings).filter((e) => !R.ending.has(e));
  return out;
}

/** Markierungen, die der Code selbst setzt (flags.add('x'), sets_flags: ['x', ...], Listen *_FLAGS). */
export function codeFlags(root) {
  const flags = new Set();
  const files = [];
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.js')) files.push(p); } };
  walk(root);
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/flags\.add\(\s*['"`]([\w]+)['"`]/g)) flags.add(m[1]);
    for (const m of src.matchAll(/(?:sets_flags|_FLAGS\s*=)\s*:?\s*\[([^\]]*)\]/g)) for (const s of m[1].matchAll(/['"`]([\w]+)['"`]/g)) flags.add(s[1]);
  }
  return [...flags];
}

// Aufruf: node tools/sackgassen.mjs  → Bericht über hängende Auftragsschritte, nie startbare Aufträge, unerreichte Enden und Orte
if (import.meta.url === `file://${process.argv[1]}`) {
  const { loadContent } = await import('../tests/helpers.js');
  const content = loadContent();
  const a = analyse(content, { codeFlags: codeFlags(new URL('../src', import.meta.url).pathname) });
  console.log(`Orte erreichbar: ${a.R.map.size}/${Object.keys(content.maps).length}, Aufträge startbar: ${a.R.qs.size}/${Object.keys(content.quests).length}`);
  console.log(`\nHängende Schritte (${a.stuck.length}):`);
  for (const s of a.stuck) console.log(`  ${s.quest} #${s.step + 1}: ${s.text}  ${JSON.stringify(s.done)}`);
  console.log(`\nNie gestartet (Code-Start oder gestrichen?): ${a.neverStarted.join(' ')}`);
  console.log(`\nEnden nie erreicht: ${a.endingsUnreached.join(' ')}`);
  console.log(`\nOrte nie erreicht: ${Object.keys(content.maps).filter((m) => !a.R.map.has(m)).join(' ')}`);
}
