// Codex DF: Tiergefährten (Seb, 2026-11-12: „alle restlichen Codex-Sachen einbauen“).
// Drei Tiere: Rabe Kessel (Sternwarte, Kettlegate), Kater Rußfleck (Salzmarkt, Wexmoor), Hund Pegel (Endbahnhof, Dunscar).
// Die Ratte „Siebzehn“ (Calderwick) bleibt draußen, Calderwick wird gerade neu gebaut.
// Fundszenen aus tiere.json werden Dialoge an einem Fundplatz neben dem Ortseingang (freie Kachel).
// Spiellogik: core/Tiere.js. Bilder: characters/tier_<art>.png (16er Lauf-Sheets aus DF).
export const TIERE_FILES = ['tiere', 'beziehung', 'lesestuecke', 'zeitung'];
export const TIER_IDS = ['tier_rabe', 'tier_kater', 'tier_hund'];
/** Fundplatz: Versatz vom Ortseingang (withSpawnOffset sucht die nächste freie Kachel). */
const FUND_OFFSET = { tier_rabe: [2, -1], tier_kater: [-2, -2], tier_hund: [3, -1] };

/** Codex-Knoten (next/end/effects) in Spieldialoge (choices/sets_flags/tier_claim) umsetzen. */
export function tierFundDialog(tier) {
  const nodes = {};
  for (const [k, n] of Object.entries(tier.fund.nodes)) {
    const out = { text: n.text };
    if (n.choices) out.choices = n.choices.map((c) => ({ text: c.text, next: c.next }));
    else if (n.next) out.choices = [{ text: 'Weiter', next: n.next }];
    if (n.effects?.set_flags) out.sets_flags = n.effects.set_flags;
    if (n.effects?.tier_claim) out.tier_claim = n.effects.tier_claim;
    nodes[k] = out;
  }
  return { start: tier.fund.start, nodes };
}

export function tierePack({ tiere, beziehung, lesestuecke, zeitung }) {
  const list = Object.fromEntries(TIER_IDS.map((id) => [id, tiere[id]]));
  const dialogues = Object.fromEntries(TIER_IDS.map((id) => [`fund_${id}`, tierFundDialog(list[id])]));
  const platzierung = TIER_IDS.map((id) => ({
    map: list[id].map, spawn_offset: FUND_OFFSET[id],
    interactable: { id: `fund_${id}`, kind: 'dialogue', dialogue: `fund_${id}`, title: list[id].name, role: 'Ein Tier', sprite: id, frame: 0,
      prompt: `${list[id].name} ansehen`, visible_if: { hide_if_flags: [`${id}_gefunden`] } },
  }));
  return {
    name: 'tiere', dialogues, platzierung_tiere: platzierung,
    zeitung: zeitung.filter((z) => TIER_IDS.some((id) => z.requires_flags?.includes(`${id}_gefunden`))).map(({ integration, city, kurz, ...z }) => z),
    tiere: { list, beziehung, lesestuecke: lesestuecke.filter((l) => TIER_IDS.some((id) => l.requires_flags?.includes(`${id}_gefunden`))) },
  };
}
