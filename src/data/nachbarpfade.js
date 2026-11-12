/** Seb (2026-11-12): je Pfad genau ein Nachbarpfad, fünf feste Paare (Seq-4-Rezept, Pfadwechsel ab Seq 4). { pid: nachbarPid } */
export const PAARE = [['laterne', 'schluessel'], ['echo', 'maske'], ['faden', 'sq_uhr'], ['sq_waage', 'eisen'], ['kessel', 'sq_moor']];
export const NACHBARPFADE = Object.fromEntries(PAARE.flatMap(([a, b]) => [[a, b], [b, a]]));
