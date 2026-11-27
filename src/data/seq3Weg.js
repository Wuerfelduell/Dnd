/**
 * Der Weg von Seq 4 zu Seq 3 und weiter (Seb 2026-11-27):
 * „Im pfadspezifischen Viertel sollte man die Seq 4 verdauen und die Seq 3 trinken. Die Seq-2-Sachen nimmt man dann mit,
 * aber da soll die Verdauung wieder stockend vorangehen. Ab Seq 3 kann man wieder zurückreisen.“
 *
 * - Viertel-Resonanz (nur Seq 4, nur im eigenen Pfadviertel o3_<pfad>): jeder Sieg verdaut fest, die einmaligen Gegner des
 *   Viertels (Herde, Rangprüfungen, Oberhaupt, Stellvertretung, Herz) beim ersten Sieg deutlich mehr. Zusammen mit dem Prüfstein
 *   (nur Seq 4) und den Pfadhandlungen trägt das Viertel den Trank der vierten Sequenz bis 100 %.
 * - Ab Seq 3 wirkt das Viertel nicht mehr (Prüfstein schweigt, keine Resonanz, Pfadhandlungen nur noch ein Bruchteil, siehe
 *   PATH_ACTION_SEQ_MULT in core/Pathways.js). Der Rest kommt aus Inhalten: Bosse (fest 3 %) und der Nachhall in den alten Städten
 *   (data/heimkehr.js), je Ort einmal.
 */
export const VIERTEL_VERDAU = {
  sieg: 0.5, // jeder Sieg im eigenen Viertel
  erst: { herd: 3, siegel: 2, boss: 5 }, // erster Sieg: Herd 1–6, Rangprüfung 1–5, Oberhaupt/Stellvertretung/Herz
};

/** Art eines Viertel-Gegners nach seiner Id (o3_<pfad>_herd3, _siegel2, _tiefe, _vize, _herz, _g1 …). */
export function viertelArt(encId) {
  if (/_herd\d+$/.test(encId)) return 'herd';
  if (/_siegel\d+$/.test(encId)) return 'siegel';
  if (/_(tiefe|vize|herz)$/.test(encId)) return 'boss';
  return null;
}

/** Nachhall in den alten Städten: feste Prozent je Fundort und Sequenz (ab Seq 3, je höher, desto weniger). */
export const NACHHALL_PCT = { 3: 2, 2: 0.4, 1: 0.08 };
export function nachhallPct(seq) { return NACHHALL_PCT[seq] ?? 0; }

/** Rückreise in die alten Städte: ab dieser Sequenz (oder besser). Im Koop reicht ein Spieler, der Halbgott nimmt den anderen mit. */
export const HEIMKEHR_SEQ = 3;
