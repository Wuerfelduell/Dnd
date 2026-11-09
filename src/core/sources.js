// Woher stammt ein Hinweis? Für das Notizbuch: Gesicht der Person, die ihn erzählt hat,
// oder ein Symbol für Gelesenes, Gesehenes und Polizeiberichte.
//
// Ergebnis: { type, npc? }
//   type: 'npc' (mit npc-id), 'observation' (eigene Beobachtung), 'vision' (Geistsicht),
//         'police' (Bericht), 'archive' (Akte), 'note' (Buch, Zettel, Brief), 'object' (Gegenstand, Ort)
// Ein Hinweis kann die Zuordnung mit dem Feld "by" festlegen: eine npc-id oder einer der Typen.

export const SOURCE_TYPES = ['npc', 'observation', 'vision', 'police', 'archive', 'note', 'object'];

const TITLES = new Set(['madame', 'professor', 'meisterin', 'mr.', 'miss', 'dr.', 'der', 'die', 'pater', 'küster', 'constable', 'sergeant', 'inspektorin']);
const words = (s) => s.toLowerCase().split(/\s+/).filter(Boolean);

/** Findet die Figur zu einem Quellennamen ("Madame Varenne" → diva). */
export function npcByName(npcs, source) {
  const src = source.trim();
  const entries = Object.entries(npcs ?? {});
  for (const [id, n] of entries) if (n.name === src) return id;
  for (const [id, n] of entries) if (src.startsWith(`${n.name} `) || src.startsWith(`${n.name},`)) return id;
  const sw = words(src);
  const core = sw.filter((w) => !TITLES.has(w));
  if (!core.length) return null;
  for (const [id, n] of entries) {
    const nw = new Set(words(n.name));
    if (sw.every((w) => nw.has(w))) return id;
  }
  return null;
}

export function sourceOf(content, clue) {
  const npcs = content.npcs ?? {};
  if (clue.by) {
    if (npcs[clue.by]) return { type: 'npc', npc: clue.by };
    if (SOURCE_TYPES.includes(clue.by)) return { type: clue.by };
  }
  const src = String(clue.source ?? '');
  if (/geistsicht/i.test(src)) return { type: 'vision' };
  if (/beobachtung/i.test(src)) return { type: 'observation' };
  if (/bericht/i.test(src)) return { type: 'police' };
  if (/akte\b|akte /i.test(src)) return { type: 'archive' };
  if (/buch|zettel|notenblatt|brief|tagebuch|liste|notiz/i.test(src)) return { type: 'note' };
  const npc = npcByName(npcs, src);
  if (npc) return { type: 'npc', npc };
  return { type: 'object' };
}
