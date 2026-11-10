/**
 * Zwei weitere Fähigkeiten je Sequenz (data/packs/sequenzen/faehigkeiten2.json):
 * - `kampf`: eine zweite Kampffertigkeit neben der bestehenden (`skill`), eher Tempo, Schutz und Kniffe als rohe Wucht.
 *   Landet als `skill2` an der Sequenz und läuft über dieselbe Kampflogik (Combat.js, Fertigkeitenmenü).
 * - `welt`: eine Fähigkeit außerhalb des Kampfes (Erkundung, Ermittlung, Handel, Reisen), eingesetzt im Pfad-Tab (Talents.js).
 *   Landet als `talent` an der Sequenz. Kosten: Nerven und Unruhe, danach Abklingzeit in Sekunden Spielzeit.
 *
 * Beides gilt nur für erreichte Sequenzen. Ohne Daten (alte Tests) ändert sich nichts.
 */

/** Zusätzliche Fähigkeits-Ids, die keine eigenen Grafiken haben (Icons sind Platzhalter, Effekte geliehen über `fx`). */
export function faehigkeitenIds(data) {
  const out = { kampf: [], welt: [] };
  for (const seqs of Object.values(data ?? {})) {
    if (typeof seqs !== 'object' || Array.isArray(seqs)) continue;
    for (const sd of Object.values(seqs)) {
      if (sd?.kampf?.id) out.kampf.push(sd.kampf.id);
      if (sd?.welt?.id) out.welt.push(sd.welt.id);
    }
  }
  return out;
}

/** Vor buildContent (nach withSequenzen): skill2 und talent an die Sequenzen aller Pfade hängen. */
export function withFaehigkeiten(pathways, data) {
  if (!pathways?.pathways || !data) return pathways;
  const out = { ...pathways.pathways };
  for (const [pid, perSeq] of Object.entries(data)) {
    const p = out[pid];
    if (!p || typeof perSeq !== 'object') continue;
    const seqs = { ...p.seqs };
    for (const [n, extra] of Object.entries(perSeq)) {
      if (!seqs[n] || !extra) continue;
      seqs[n] = {
        ...seqs[n],
        ...(extra.kampf ? { skill2: { ...extra.kampf } } : {}),
        ...(extra.welt ? { talent: { ...extra.welt } } : {}),
      };
    }
    out[pid] = { ...p, seqs };
  }
  return { ...pathways, pathways: out };
}
