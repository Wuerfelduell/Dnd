/**
 * Seq-6-Rituale überall durchführbar (Seb, 2026-11-17): Weil es keine Rückreise in frühere Städte gibt, muss jede
 * Zutat eines Seq-6-Rituals in jeder Stadt zu kaufen sein. Kettlegate hat Nell, Dunscar Hester Wynn (beide fast
 * vollständig), Wexmoor hatte bisher gar keinen Kräuterladen. Ab Wexmoor bekommt in jeder Stadt ein Laden die fehlenden
 * Ritualzutaten aller zehn Pfade dazu, zum Kettlegater Preis mal Stadtfaktor.
 * Zutaten, die zugleich Trankzutaten ab Sequenz 7 sind (Puppenglas), bleiben Treffen-Ware: Kettlegate hat sie auf
 * den Treffen, Wexmoor in Zunders Schmuggelkiste, Dunscar bekommt sie als Los beim Schichtbund (offen ab Ankunft).
 * Calderwick/Briarholt erreicht man unter Seq 4 nicht (Lastenzug zurück nach Dunscar).
 * Läuft in buildContent nach dem Preisabgleich, damit die Preise so bleiben.
 */

/** Laden je Stadt und Preisfaktor gegenüber Nell (Kettlegate). Calderwick: die Krämer der Pfadviertel. */
export const RITUAL6_LAEDEN = {
  wexmoor: { shops: ['wx_pfandleiherin'], mult: 1.5, treffenWare: true }, // Seb 2026-11-17: Maud führt auch Puppenaugen (Maske-Ritual)
  dunscar: { shops: ['ds_kraeuterfrau'], mult: 2 },
  calderwick: { shops: ['o3_laterne_kraemer', 'o3_faden_kraemer', 'o3_maske_kraemer', 'o3_echo_kraemer', 'o3_kessel_kraemer', 'o3_eisen_kraemer', 'o3_schluessel_kraemer', 'o3_sq_waage_kraemer', 'o3_sq_moor_kraemer', 'o3_sq_uhr_kraemer'], mult: 3 },
  briarholt: { shops: ['vi_handel_garten'], mult: 3 },
};

/** Alle Zutaten, die ein Seq-6-Ritual verbraucht. */
export function ritual6Zutaten(content) {
  const ids = new Set();
  for (const p of Object.values(content.pathways ?? {})) for (const id of Object.keys(p.seqs?.['6']?.ritual?.consumes ?? {})) ids.add(id);
  return [...ids];
}

/** Treffen-Ware: Trankzutaten der Sequenzen 7 bis 5 (ohne die Grundstoffe und ohne Kräuter der Sequenz 9/8). */
export function treffenWare(content) {
  const P = Object.values(content.pathways ?? {});
  const high = new Set(P.flatMap((p) => [7, 6, 5].flatMap((q) => Object.keys(p.seqs?.[q]?.ingredients ?? {}))));
  for (const id of ['nebeltau', 'silberstaub', ...P.flatMap((p) => [9, 8].flatMap((q) => Object.keys(p.seqs?.[q]?.ingredients ?? {})))]) high.delete(id);
  return high;
}

/** Dunscar: Treffen-Ware unter den Ritualzutaten als Los beim Schichtbund (Preis und Chance wie auf Kettlegater Treffen, mal 2). */
export const RITUAL6_TREFFEN = { circle: 'schichtbund', mult: 2, chance: 0.5 };

/** Kettlegater Grundpreis: Nells Preis, sonst der Itempreis. */
function grundpreis(content, id) {
  const nell = content.market?.merchants?.nell?.stock?.find((s) => s.item === id)?.price;
  return nell ?? content.items[id]?.price ?? content.items[id]?.value ?? 20;
}

export function applyRitual6Vorrat(content) {
  const merchants = content.market?.merchants ?? {};
  const high = treffenWare(content);
  const alle = ritual6Zutaten(content).filter((id) => content.items[id]);
  const zutaten = alle.filter((id) => !high.has(id));
  for (const { shops, mult, treffenWare: auchTreffen } of Object.values(RITUAL6_LAEDEN)) {
    for (const sid of shops) {
      const m = merchants[sid];
      if (!m) continue;
      m.stock ??= [];
      for (const id of auchTreffen ? alle : zutaten) {
        if (m.stock.some((s) => s.item === id && !s.rare && !s.requires_flags)) continue;
        m.stock.push({ item: id, price: Math.max(1, Math.round(grundpreis(content, id) * mult)), ...(high.has(id) ? { ritual_ausnahme: true } : {}) });
      }
    }
  }
  const circle = content.gatherings?.circles?.[RITUAL6_TREFFEN.circle];
  const member = circle?.members?.[0];
  if (!member) return;
  const lots = Object.values(content.gatherings.circles).flatMap((c) => (c.members ?? []).flatMap((m) => m.offers ?? []));
  for (const id of alle.filter((i) => high.has(i))) {
    if ((circle.members ?? []).some((m) => m.offers?.some((o) => o.item === id))) continue;
    const alt = Math.max(0, ...lots.filter((o) => o.item === id).map((o) => o.price)) || grundpreis(content, id) * 3;
    (member.offers ??= []).push({ item: id, price: alt * RITUAL6_TREFFEN.mult, chance: RITUAL6_TREFFEN.chance });
  }
}
