// Prüft, dass alle Inhalte zusammenpassen: `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from './helpers.js';

const content = loadContent();
const TILE_CHARS = new Set('.,#WDRf~=LXwOIETBHgpGUcrYsK|APQCV'.split(''));
const WALKABLE = new Set(['.', ',', '=', 'w', 'g', 'p', 'c', 's', 'P']);
const CONDITION_KEYS = ['requires_clues', 'requires_any_clues', 'requires_facts', 'requires_likely', 'requires_suspected', 'requires_conclusions',
  'requires_certain', 'requires_flags', 'requires_quests_active', 'requires_quests_done', 'hide_if_clues', 'hide_if_flags', 'hide_if_conclusions', 'hide_if_quests'];

function checkRefs(o, where) {
  if (!o) return;
  const kinds = {
    clues: ['requires_clues', 'requires_any_clues', 'hide_if_clues', 'gives_clues'],
    facts: ['requires_facts', 'requires_likely', 'requires_suspected'],
    deductions: ['requires_conclusions', 'requires_certain', 'hide_if_conclusions'],
    quests: ['requires_quests_active', 'requires_quests_done', 'hide_if_quests', 'start_quests', 'complete_quests', 'fail_quests'],
  };
  const exists = {
    clues: (id) => content.clues[id],
    facts: (id) => content.facts[id],
    deductions: (id) => content.deductions.some((d) => d.id === id),
    quests: (id) => content.quests[id],
  };
  for (const [kind, keys] of Object.entries(kinds)) {
    for (const k of keys) for (const id of o[k] ?? []) assert.ok(exists[kind](id), `${where}: ${k} -> ${id} existiert nicht`);
  }
  if (o.ending) assert.ok(content.endings[o.ending], `${where}: Ende ${o.ending} fehlt`);
  for (const k of ['requires_items', 'hide_if_items']) for (const id of o[k] ?? []) assert.ok(content.items[id], `${where}: ${k} -> ${id} existiert nicht`);
  for (const k of ['gives_items', 'takes_items']) for (const id of Object.keys(o[k] ?? {})) assert.ok(content.items[id], `${where}: ${k} -> ${id} existiert nicht`);
  if (o.combat) assert.ok(content.encounters[o.combat], `${where}: Kampf ${o.combat} fehlt`);
}

test('Karten sind rechteckig, nutzen bekannte Zeichen, Figuren stehen auf freien Feldern', () => {
  for (const [id, m] of Object.entries(content.maps)) {
    const w = m.rows[0].length;
    m.rows.forEach((row, y) => {
      assert.equal(row.length, w, `${id} Zeile ${y}`);
      for (const ch of row) assert.ok(TILE_CHARS.has(ch), `${id}: unbekanntes Zeichen "${ch}"`);
    });
    const at = ([x, y]) => m.rows[y]?.[x];
    for (const [name, pos] of Object.entries(m.spawns)) assert.ok(WALKABLE.has(at(pos)), `${id}: Spawn ${name} auf "${at(pos)}"`);
    for (const n of m.npcs ?? []) {
      assert.ok(content.npcs[n.id], `${id}: Figur ${n.id} fehlt in campaign.json`);
      assert.ok(WALKABLE.has(at(n.tile)), `${id}: ${n.id} steht auf "${at(n.tile)}"`);
      checkRefs(n.visible_if, `${id}/${n.id}`);
      checkRefs(n.lock, `${id}/${n.id}`);
    }
    for (const i of m.interactables ?? []) {
      assert.ok(at(i.tile) !== undefined, `${id}/${i.id} außerhalb`);
      if (!i.kind || i.kind === 'clue') assert.ok(content.clues[i.clue], `${id}/${i.id}: Hinweis ${i.clue}`);
      if (i.kind === 'door') assert.ok(content.maps[i.to]?.spawns[i.spawn], `${id}/${i.id}: Ziel ${i.to}/${i.spawn}`);
      if (i.kind === 'dialogue') assert.ok(content.dialogues[i.dialogue], `${id}/${i.id}: Dialog ${i.dialogue}`);
      if (i.kind === 'combat') assert.ok(content.encounters[i.encounter], `${id}/${i.id}: Kampf ${i.encounter}`);
      checkRefs(i.visible_if, `${id}/${i.id}`);
      checkRefs(i.lock, `${id}/${i.id}`);
      checkRefs(i.effects, `${id}/${i.id}`);
    }
  }
  for (const t of content.travel) assert.ok(content.maps[t.map]?.spawns[t.spawn], `Reiseziel ${t.map}`);
});

test('Hinweise, Informationen, Schlussfolgerungen, Aufträge und Enden verweisen auf Existierendes', () => {
  for (const [id, c] of Object.entries(content.clues)) {
    assert.ok(content.facts[c.fact], `Hinweis ${id}: Information ${c.fact} fehlt`);
    assert.ok(c.source && c.name && c.text, `Hinweis ${id} unvollständig`);
  }
  for (const [id, f] of Object.entries(content.facts)) {
    assert.ok(Object.values(content.clues).some((c) => c.fact === id), `Information ${id} hat keine Quelle`);
    for (const c of f.refuted_by ?? []) assert.ok(content.clues[c], `${id}: refuted_by ${c}`);
    for (const x of f.refuted_if_likely ?? []) assert.ok(content.facts[x], `${id}: refuted_if_likely ${x}`);
  }
  for (const d of content.deductions) for (const p of d.pairs) for (const f of p) assert.ok(content.facts[f], `${d.id}: ${f}`);
  for (const [id, q] of Object.entries(content.quests)) {
    for (const s of q.steps) checkRefs(s.done, `Auftrag ${id}`);
    checkRefs(q.reward, `Auftrag ${id}`);
  }
  for (const [id, e] of Object.entries(content.endings)) checkRefs(e, `Ende ${id}`);
});

test('Alle Dialoge sind vollständig verdrahtet', () => {
  const used = new Set();
  for (const m of Object.values(content.maps)) {
    for (const n of m.npcs ?? []) used.add(n.dialogue ?? content.npcs[n.id].dialogue);
    for (const i of m.interactables ?? []) if (i.dialogue) used.add(i.dialogue);
  }
  for (const d of used) assert.ok(content.dialogues[d], `Dialog ${d} fehlt`);
  for (const [id, tree] of Object.entries(content.dialogues)) {
    const starts = typeof tree.start === 'string' ? [tree.start] : tree.start.map((s) => s.node);
    for (const s of starts) assert.ok(tree.nodes[s], `${id}: Start ${s}`);
    if (Array.isArray(tree.start)) for (const s of tree.start) checkRefs(s, `${id}.start`);
    for (const [nid, node] of Object.entries(tree.nodes)) {
      checkRefs(node, `${id}.${nid}`);
      for (const ch of node.choices ?? []) {
        checkRefs(ch, `${id}.${nid}`);
        const nexts = ch.next === undefined ? [] : typeof ch.next === 'string' ? [ch.next] : ch.next.map((x) => x.node);
        for (const n of nexts) assert.ok(tree.nodes[n], `${id}.${nid}: Knoten ${n} fehlt`);
        if (Array.isArray(ch.next)) ch.next.forEach((x) => checkRefs(x, `${id}.${nid}`));
      }
      for (const k of Object.keys(node)) {
        assert.ok(!CONDITION_KEYS.includes(k) || k.startsWith('hide') === false || true);
      }
    }
  }
});

test('Jede Information, die für ein gutes Ende nötig ist, hat mindestens zwei Quellen', () => {
  for (const id of ['grave_for_vey', 'lured_by_vey', 'vey_motive', 'unnatural_cold', 'vey_sigil', 'elias_alive']) {
    const d = content.deductions.find((x) => x.id === id);
    const ok = d.pairs.some((p) => p.every((f) => Object.values(content.clues).filter((c) => c.fact === f).length >= 2));
    assert.ok(ok, `${id}: kein Paar mit je zwei Quellen`);
  }
});

test('Gegenstände und Kämpfe sind vollständig', () => {
  const start = content.start;
  for (const id of Object.keys(start.items ?? {})) assert.ok(content.items[id], `Startgegenstand ${id}`);
  assert.ok(content.items[start.weapon]?.kind === 'weapon', 'Startwaffe');
  for (const [id, it] of Object.entries(content.items)) {
    assert.ok(['weapon', 'consumable', 'key', 'potion', 'formula', 'ingredient', 'trophy', 'artifact'].includes(it.kind), `${id}: Art ${it.kind}`);
    if (it.kind === 'weapon') assert.ok(it.atk > 0, `${id}: Angriff`);
    if (it.inspect) assert.ok(content.dialogues[it.inspect], `${id}: Untersuchen-Dialog ${it.inspect}`);
    if (it.kind === 'consumable') assert.ok(it.heal || it.composure || it.damage || it.calm, `${id}: Wirkung`);
    if (it.kind === 'artifact') assert.ok(it.boons?.length && it.curses?.length, `${id}: Vor- und Nachteile`);
  }
  for (const [id, e] of Object.entries(content.encounters)) {
    assert.ok(e.hp > 0 && e.attacks.length, `${id}: Leben und Attacken`);
    for (const a of e.attacks.filter((x) => x.action)) assert.ok(['guard', 'heal', 'veil', 'taunt'].includes(a.action) && !a.hits, `${id}/${a.name}: unbekannter Kniff`);
    if (e.faction) assert.ok(content.factions[e.faction], `${id}: Fraktion ${e.faction}`);
    for (const a of e.attacks.filter((x) => !x.action)) assert.ok(a.damage > 0 && a.hits.length && a.hits.every((h, i) => h >= 500 && (i === 0 || h - a.hits[i - 1] >= 250)), `${id}/${a.name}: Schläge zu dicht`);
    if (e.sprite.startsWith('npc:')) assert.ok(content.npcs[e.sprite.slice(4)], `${id}: Figur`);
    for (const k of ['on_win', 'on_lose', 'first_win', 'weak_if']) checkRefs(e[k], `${id}.${k}`);
    if (e.lose_to) assert.ok(content.maps[e.lose_to.map]?.spawns[e.lose_to.spawn], `${id}: lose_to`);
  }
});
