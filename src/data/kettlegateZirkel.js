// Kettlegater Zirkel aufgeräumt (Seb, 2026-11-17): Dort wird nur noch gehandelt, was man in Kettlegate nicht kaufen kann.
//  - Lose: Hauptzutaten der Sequenzen 7 und 6, Formeln (7, 6 und seltener 5) und Artefakte.
//    Raus: Kleidung, Waffen, Kleinkram und die Zutaten für Sequenz 5 (die gibt es in Wexmoor).
//  - Gesuche: nur noch Zutaten, keine funktionslosen Verkaufsstücke (Trophäen) mehr.
// Läuft als letzter Schritt in buildContent, damit spätere Städte (Schmuggelkiste, Restposten, alte Preise)
// die alten Zirkelstücke weiter kennen.

/** Chance je Treffen für ein Los „Formel 5“ (vorher 0,4). */
export const KG_FORMEL5_CHANCE = 0.15;

export function applyKettlegateZirkel(content) {
  const circles = content.gatherings?.circles;
  if (!circles) return content;
  const items = content.items;
  const seqOf = (id) => {
    const seqs = Object.values(content.pathways ?? {}).flatMap((p) => Object.entries(p.seqs ?? {})
      .filter(([, sd]) => sd.ingredients?.[id]).map(([n]) => Number(n)));
    return seqs.length ? Math.max(...seqs) : null;
  };
  const hauptzutat = (id) => items[id]?.kind === 'ingredient' && [6, 7].includes(seqOf(id));
  const behalten = (id) => items[id]?.kind === 'formula' || items[id]?.kind === 'artifact' || hauptzutat(id);
  const copy = { ...circles };
  for (const [cid, c] of Object.entries(circles)) {
    if (c.city) continue; // nur Kettlegate
    const members = c.members.map((m) => ({
      ...m,
      offers: m.offers.filter((o) => behalten(o.item))
        .map((o) => (items[o.item]?.kind === 'formula' && items[o.item].seq === 5 ? { ...o, chance: KG_FORMEL5_CHANCE } : o)),
      wants: (m.wants ?? []).filter((w) => hauptzutat(w)),
    }));
    // Wer nichts mehr sucht, sucht Hauptzutaten, die andere im Zirkel anbieten
    const pool = [...new Set(members.flatMap((m) => m.offers.map((o) => o.item)).filter(hauptzutat))];
    members.forEach((m, i) => {
      if (m.wants.length) return;
      const fremd = pool.filter((id) => !m.offers.some((o) => o.item === id));
      m.wants = [0, 1, 2].map((k) => fremd[(i * 3 + k) % fremd.length]).filter((id, k, a) => id && a.indexOf(id) === k);
    });
    copy[cid] = { ...c, members };
  }
  content.gatherings = { ...content.gatherings, circles: copy };
  return content;
}
