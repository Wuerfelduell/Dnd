/**
 * Nebenauftrags-Pakete (Codex AA, AB): eigene Ordner unter data/packs mit quests, items, encounters,
 * dialogues, npcs, case (facts/clues/deductions), dialog_zusaetze (Optionen und Knoten für bestehende
 * Gespräche) und platzierung (NPCs und Objekte auf vorhandenen Karten). Wird nach buildContent angewendet.
 */
/** Pro Paket: Figur → Flag, das sie an ihrem alten Platz ausblendet (Haft; Ersatzkontakt im Paket). */
export const PACK_GUARDS = {
  kg_nebenquests: { erbe: 'edmund_arrested', gouvernante: 'wren_arrested', rattenfaenger: 'piper_arrested' },
};

/** Kahn-Ausbau: Platz in der Kajüte und einmalige Wirkung (Flag, das die Auszahlung sperrt). */
const KAHN_SPOTS = {
  k2n_kahn_reet: { tile: [1, 4] },
  k2n_kahn_kiste: { tile: [6, 5], effects: { gives_items: { salzbrot: 2 } }, done: 'k2n_kiste_entnommen' },
  k2n_kahn_glocke: { tile: [6, 7], effects: { nerves: 8 }, done: 'k2n_glocke_gelaeutet' },
  k2n_kahn_waschtisch: { tile: [14, 4] },
  k2n_kahn_ofen: { tile: [4, 2] },
  k2n_kahn_kartentisch: { tile: [12, 4], effects: { nerves: 5 }, done: 'k2n_kartentisch_gelesen' },
};

export function applyQuestPack(content, pack) {
  const { quests = {}, items = {}, encounters = {}, dialogues = {}, npcs = {}, case: cas = {}, dialog_zusaetze: extra = {}, platzierung = [] } = pack;
  const guards = PACK_GUARDS[pack.name] ?? {};
  Object.assign(content.quests, quests);
  Object.assign(content.items, items);
  Object.assign(content.encounters, encounters);
  for (const [id, d] of Object.entries(dialogues)) {
    if (content.dialogues[id]) throw new Error(`Paket überschreibt Dialog ${id}`);
    content.dialogues[id] = d;
  }
  // Bestehende Figuren behalten Palette und Grafik, neue kommen dazu
  for (const [id, n] of Object.entries(npcs)) content.npcs[id] = { ...content.npcs[id], ...n, ...(content.npcs[id]?.palette ? { palette: content.npcs[id].palette } : {}) };
  Object.assign(content.facts, cas.facts ?? {});
  Object.assign(content.clues, cas.clues ?? {});
  content.deductions = [...content.deductions, ...(cas.deductions ?? [])];
  // Paket AL: Fall-Enden und Fallregister (Titel fürs Notizbuch)
  for (const [id, e] of Object.entries(cas.endings ?? {})) {
    if (content.endings[id]) throw new Error(`Paket überschreibt Ende ${id}`);
    content.endings[id] = e;
  }
  for (const f of pack.faelle ?? []) {
    if (content.cases.some((c) => c.id === f.id)) throw new Error(`Paket überschreibt Fall ${f.id}`);
    content.cases = [...content.cases, { id: f.id, title: f.title }];
  }
  // Neue Optionen vor die letzte (Abschieds-)Option des Startknotens, neue Knoten anhängen
  for (const [id, a] of Object.entries(extra)) {
    const d = content.dialogues[id];
    if (!d) throw new Error(`Zusatz für unbekannten Dialog ${id}`);
    // Marlowe hat kein `start`, ihr Menü heißt `hub` (Paket AI)
    // Kapitel-3-Figuren (AR) beginnen bei ihrem eigenen `start`-Knoten
    const key = d.nodes.start ? 'start' : d.start && d.nodes[d.start] ? d.start : 'hub';
    const start = d.nodes[key];
    if (!start) throw new Error(`Dialog ${id} hat weder start noch hub`);
    const choices = [...(start.choices ?? [])];
    choices.splice(Math.max(0, choices.length - 1), 0, ...(a.choices_add ?? []));
    for (const n of Object.keys(a.nodes_add ?? {})) if (d.nodes[n]) throw new Error(`Paket überschreibt Knoten ${id}/${n}`);
    content.dialogues[id] = { ...d, nodes: { ...d.nodes, [key]: { ...start, choices }, ...(a.nodes_add ?? {}) } };
  }
  // Figuren, die verhaftet werden können, verschwinden von ihrem alten Platz (Besuch dann im Revier)
  const touched = new Set();
  const own = (mapId) => {
    if (!touched.has(mapId)) {
      const m = content.maps[mapId];
      if (!m) throw new Error(`Paket nennt unbekannte Karte ${mapId}`);
      content.maps[mapId] = { ...m, npcs: [...(m.npcs ?? [])], interactables: [...(m.interactables ?? [])] };
      touched.add(mapId);
    }
    return content.maps[mapId];
  };
  for (const [mapId, m] of Object.entries(content.maps)) {
    if (!(m.npcs ?? []).some((n) => guards[n.id])) continue;
    const mm = own(mapId);
    mm.npcs = mm.npcs.map((n) => (guards[n.id]
      ? { ...n, visible_if: { ...(n.visible_if ?? {}), hide_if_flags: [...(n.visible_if?.hide_if_flags ?? []), guards[n.id]] } } : n));
  }
  // Paket AB: Ausbauten von Zunders Kahn als Objekte in der Kajüte (Wirkung in core/Kahn.js oder einmalig hier)
  for (const [flag, k] of Object.entries(pack.kahn_ausbau ?? {})) {
    const spot = KAHN_SPOTS[flag];
    if (!spot) continue;
    const m = own('wx_kahn');
    m.interactables.push({ id: flag, kind: 'read', tile: spot.tile, sprite: flag, prompt: k.name, title: k.name, text: k.deko, footer: k.wirkung,
      visible_if: { requires_flags: [flag] }, ...(spot.effects ? { effects: spot.effects, done_flag: spot.done } : {}) });
  }
  // Paket AI: Geplauder und Kampfsprüche zu zweit
  if (pack.geplauder || pack.kampf) content.koop = { geplauder: pack.geplauder ?? [], kampf: pack.kampf ?? {} };
  for (const p of platzierung) {
    const m = own(p.map);
    if (p.npc) m.npcs.push({ id: p.npc, tile: p.tile, ...(p.visible_if ? { visible_if: p.visible_if } : {}) });
    else m.interactables.push({ ...p.interactable, tile: p.tile, ...(p.visible_if ? { visible_if: p.visible_if } : {}) });
  }
  return content;
}
