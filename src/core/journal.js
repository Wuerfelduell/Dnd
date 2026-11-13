// Notizbuch-Helfer: gelöste Fälle fürs Archiv und die Liste der Personen, die man getroffen hat.

/** Ab der Ankunft bleiben alte Kettlegate-Einträge ausgeblendet, auch nach dem Laden. */
export function leftKettlegate(state) {
  return state.flags?.has('k2_arrived') || (state.content.maps?.[state.map]?.city ?? 'kettlegate') !== 'kettlegate';
}

const questCitiesCache = new WeakMap();
function questCities(content) {
  if (questCitiesCache.has(content)) return questCitiesCache.get(content);
  const cities = new Map();
  const add = (id, city) => { if (!cities.has(id)) cities.set(id, new Set()); cities.get(id).add(city); };
  for (const map of Object.values(content.maps ?? {})) {
    const city = map.city ?? 'kettlegate';
    const dialogues = [
      ...(map.npcs ?? []).map((n) => n.dialogue ?? content.npcs?.[n.id]?.dialogue),
      ...(map.interactables ?? []).map((i) => i.dialogue),
    ];
    for (const id of dialogues) for (const node of Object.values(content.dialogues?.[id]?.nodes ?? {})) {
      for (const q of node.start_quests ?? []) add(q, city);
    }
  }
  for (const [id, q] of Object.entries(content.quests ?? {})) {
    if (q.city) add(id, q.city);
    for (const step of q.steps ?? []) {
      const map = content.maps?.[step.target?.map];
      if (map) add(id, map.city ?? 'kettlegate');
    }
    for (const lead of Array.isArray(q.lead) ? q.lead : [q.lead]) {
      const map = content.maps?.[lead?.target?.map];
      if (map) add(id, map.city ?? 'kettlegate');
    }
  }
  questCitiesCache.set(content, cities);
  return cities;
}

/**
 * Städte, in die man nie mehr zurückkommt (keine Rückreise): Kettlegate ab Wexmoor, Wexmoor ab Dunscar,
 * Dunscar und die Himmelsstadt ab dem Sturz nach Calderwick (außer auf dem Lastenzug-Rückweg, data/aufstieg.js).
 */
export function leftCities(state) {
  const f = state.flags;
  return [
    ...(leftKettlegate(state) ? ['kettlegate'] : []),
    ...(f?.has('k3_arrived') ? ['wexmoor'] : []),
    ...(f?.has('k4_arrived') && !f?.has('auf_rueckweg') ? ['dunscar', 'himmel'] : []),
  ];
}

/**
 * Unerledigte Aufträge, die nur in verlassenen Städten zu erledigen sind, ausblenden: sonst stehen sie für immer
 * offen im Notizbuch und der Wegweiser zeigt auf einen Ort, den man nie wieder erreicht (Sackgasse).
 */
export function journalQuestVisible(state, id) {
  if (state.quests[id] === 'done') return true;
  const left = leftCities(state);
  if (!left.length) return true;
  const q = state.content.quests?.[id];
  if (!q) return false;
  const cities = questCities(state.content).get(id);
  // Kapitelaufträge ohne eigenen Ort (vom Code gestartet) bleiben sichtbar
  if (!cities) return q.chapter > 1 || /^kapitel[2-9]/.test(q.case ?? '');
  // Bisherige Regel für Kettlegate: Kapitelaufträge zählen nie als Kettlegate-Auftrag
  const only = [...cities].filter((city) => !(city === 'kettlegate' && (q.chapter > 1 || /^kapitel[2-9]/.test(q.case ?? ''))));
  return only.length === 0 || only.some((city) => !left.includes(city));
}

/** Mehrteilige Hauptfälle bleiben bis zum letzten Akt außerhalb des Archivs. */
export function isSolved(state, caseId) {
  if (caseId === 'side') return false;
  if (state.endings?.[caseId]) return true;
  const main = Object.entries(state.content.quests).filter(([, q]) => q.case === caseId && q.kind === 'main');
  // Kettlegate-Fälle haben zusätzlich Anreise-/Berichtsaufträge; dort bleibt
  // der bisherige Abschluss gültig. Kapitelakten bestehen aus mehreren Akten.
  if (!caseId.startsWith('kapitel')) return main.some(([id]) => state.quests[id] === 'done');
  return main.length > 0 && main.every(([id]) => state.quests[id] === 'done');
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
    if (leftKettlegate(state) && !Object.values(content.maps ?? {}).some((m) => (m.city ?? 'kettlegate') !== 'kettlegate' && (m.npcs ?? []).some((n) => n.id === id))) continue;
    const dlg = npc.dialogue;
    if (!dlg || !seen.some((k) => k.startsWith(`${dlg}.`))) continue;
    const tree = content.dialogues?.[dlg];
    const questIds = new Set();
    for (const node of Object.values(tree?.nodes ?? {})) {
      for (const q of [...(node.start_quests ?? []), ...(node.complete_quests ?? [])]) questIds.add(q);
      for (const ch of node.choices ?? []) for (const q of [...(ch.requires_quests_active ?? []), ...(ch.requires_any_quests_active ?? [])]) questIds.add(q);
    }
    const quests = [...questIds].filter((q) => state.quests[q] === 'active' && journalQuestVisible(state, q)).map((q) => content.quests[q].title);
    out.push({ id, name: npc.name, role: npc.role ?? '', places: placesOf(content, id), quests });
  }
  // Wer gerade für einen Auftrag wichtig ist, steht oben; sonst nach Ort und Name
  return out.sort((a, b) => (b.quests.length > 0) - (a.quests.length > 0)
    || (a.places[0] ?? '~').localeCompare(b.places[0] ?? '~') || a.name.localeCompare(b.name));
}
