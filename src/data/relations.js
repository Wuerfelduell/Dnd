// Beziehungen (core/Relations.js): beziehungen.json und `beziehungen` aus Paketen zu content.relations zusammenführen
// und die Knoten-Wirkungen (`knoten: { "dialog/knoten": { figur: +1 } }`) als Effekt `relation` an die Dialogknoten hängen.

export function applyRelations(content, base, packs = []) {
  const rel = { rules: {}, texte: {}, allgemein: { freundlich: [], feindselig: [] }, figuren: {}, knoten: {}, quests: {} };
  for (const src of [base, ...packs.map((p) => p.beziehungen)]) {
    if (!src) continue;
    Object.assign(rel.rules, src.rules ?? {});
    Object.assign(rel.texte, src.texte ?? {});
    for (const m of ['freundlich', 'feindselig']) rel.allgemein[m] = [...rel.allgemein[m], ...(src.allgemein?.[m] ?? [])];
    for (const [id, f] of Object.entries(src.figuren ?? {})) {
      const old = rel.figuren[id] ?? {};
      rel.figuren[id] = { ...old, ...f, mag: [...new Set([...(old.mag ?? []), ...(f.mag ?? [])])], verabscheut: [...new Set([...(old.verabscheut ?? []), ...(f.verabscheut ?? [])])],
        begruessung: { ...(old.begruessung ?? {}), ...(f.begruessung ?? {}) } };
    }
    Object.assign(rel.knoten, src.knoten ?? {});
    Object.assign(rel.quests, src.quests ?? {});
  }
  for (const [key, delta] of Object.entries(rel.knoten)) {
    const [d, n] = key.split('/');
    const node = content.dialogues[d]?.nodes?.[n];
    if (!node) throw new Error(`Beziehungs-Wirkung für unbekannten Knoten ${key}`);
    node.relation = { ...(delta ?? {}), ...(node.relation ?? {}) };
  }
  // Auftragsbelohnungen: `quests: { "<auftrag>": { figur: +1 } }` wirkt beim Abschluss
  for (const [q, delta] of Object.entries(rel.quests)) {
    const quest = content.quests[q];
    if (!quest) throw new Error(`Beziehungs-Wirkung für unbekannten Auftrag ${q}`);
    quest.reward = { ...(quest.reward ?? {}), relation: { ...delta, ...(quest.reward?.relation ?? {}) } };
  }
  for (const id of Object.keys(rel.figuren)) if (!content.npcs[id]) throw new Error(`Beziehungs-Profil für unbekannte Figur ${id}`);
  content.relations = rel;
}
