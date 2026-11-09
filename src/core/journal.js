// Notizbuch-Helfer: gelöste Fälle fürs Archiv und die Liste der Personen, die man getroffen hat.

/** Ein Fall gilt als gelöst, wenn er ein Ende hat oder sein Hauptauftrag erledigt ist. */
export function isSolved(state, caseId) {
  if (caseId === 'side') return false;
  if (state.endings?.[caseId]) return true;
  return Object.entries(state.content.quests).some(([id, q]) => q.case === caseId && q.kind === 'main' && state.quests[id] === 'done');
}

/** Wo eine Figur steht: Kartennamen (Reihenfolge der Karten). */
function placesOf(content, npcId) {
  return Object.values(content.maps ?? {}).filter((m) => (m.npcs ?? []).some((n) => n.id === npcId)).map((m) => m.name);
}

/**
 * Personen, mit denen man gesprochen hat: [{ id, name, role, places, quests }]
 * quests: Titel aktiver Aufträge, in deren Dialogen die Figur vorkommt (Auftrag gestartet oder abzuschließen).
 */
export function knownPeople(state) {
  const { content } = state;
  const seen = [...(state.seenNodes ?? [])];
  const out = [];
  for (const [id, npc] of Object.entries(content.npcs ?? {})) {
    const dlg = npc.dialogue;
    if (!dlg || !seen.some((k) => k.startsWith(`${dlg}.`))) continue;
    const tree = content.dialogues?.[dlg];
    const questIds = new Set();
    for (const node of Object.values(tree?.nodes ?? {})) {
      for (const q of [...(node.start_quests ?? []), ...(node.complete_quests ?? [])]) questIds.add(q);
      for (const ch of node.choices ?? []) for (const q of ch.requires_quests_active ?? []) questIds.add(q);
    }
    const quests = [...questIds].filter((q) => state.quests[q] === 'active').map((q) => content.quests[q].title);
    out.push({ id, name: npc.name, role: npc.role ?? '', places: placesOf(content, id), quests });
  }
  // Wer gerade für einen Auftrag wichtig ist, steht oben; sonst nach Ort und Name
  return out.sort((a, b) => (b.quests.length > 0) - (a.quests.length > 0)
    || (a.places[0] ?? '~').localeCompare(b.places[0] ?? '~') || a.name.localeCompare(b.name));
}
