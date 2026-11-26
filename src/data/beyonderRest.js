/**
 * Beyonder-Rest (Seb 2026-11-26): Ein Beyonder, der fällt, lässt manchmal zurück, was der Trank aus ihm gemacht hat.
 *
 * - Für jeden Pfad und jede Sequenz gibt es einen Rest (`rest_<pfad>_<seq>`, Art 'ingredient', Felder `rest`, `pathway`, `seq`).
 * - Am Braukessel ersetzt der Rest die HAUPTZUTAT (die erste Zutat der Formel) im Trank seines Pfades und seiner Sequenz.
 *   Die Formel braucht man weiterhin, die Nebenzutaten auch.
 * - Ein Trank aus einem Rest (`trank_<pfad>_<seq>_rest`) wirkt genauso, schlägt beim Trinken aber öfter fehl (REST_RISIKO).
 * - Wer ihn trägt: alle Gegner mit `beyonder_pfad`/`beyonder_seq` (Kopfgeld-Beyonder, PR #546), ausgenommen die
 *   Wächter der Rituale (hg_*): Die stehen nur einmal im Weg, und ihr Rest wäre genau die Hauptzutat, für die das Ritual da ist.
 * - `restVonGegner(enc)` / `restDrop(pid, seq)` sind für spätere Gegner da (Rivale auf dem eigenen Pfad).
 */

/** Chance auf den Rest je Sequenz des Gegners (selten; Kopfgeld-Ziele kämpfen meist nur einmal). */
export const REST_CHANCE = { 9: 0.12, 8: 0.12, 7: 0.1, 6: 0.07, 5: 0.05, 4: 0.03, 3: 0.02, 2: 0.01, 1: 0.01 };
/** Zusätzliches Fehlschlag-Risiko beim Trinken eines Tranks aus einem Rest (wird zum normalen Risiko addiert). */
export const REST_RISIKO = 0.2;
/** Ritualwächter: tragen keinen Rest. */
const OHNE_REST = /^hg_/;

export const restId = (pid, seq) => `rest_${pid}_${seq}`;
export const restTrankId = (pid, seq) => `trank_${pid}_${seq}_rest`;
/** Ist das ein Trank aus einem Rest? */
export const isRestTrank = (id) => /^trank_.+_\d_rest$/.test(id ?? '');
/** Normaler Trank zum Rest-Trank (für Icons, Rituale, Revier). */
export const grundTrank = (id) => (isRestTrank(id) ? id.replace(/_rest$/, '') : id);

/** Beute-Eintrag für den Rest eines Beyonders (für weitere Gegner, z. B. den Rivalen). */
export function restDrop(pid, seq, chance = REST_CHANCE[seq] ?? 0.01) {
  return { item: restId(pid, seq), chance };
}

/** Welchen Rest trägt dieser Gegner? null, wenn keinen. */
export function restVonGegner(enc, id = enc?.id) {
  if (!enc?.beyonder_pfad || !enc.beyonder_seq || OHNE_REST.test(id ?? '')) return null;
  return { pid: enc.beyonder_pfad, seq: enc.beyonder_seq, item: restId(enc.beyonder_pfad, enc.beyonder_seq) };
}

/** Hauptzutat einer Formel: die erste Zutat. */
export function hauptzutat(formula) {
  return Object.keys(formula?.ingredients ?? {})[0] ?? null;
}

/** Rest-Items und Rest-Tränke für alle Pfade und Sequenzen. */
export function restItems(content) {
  const out = {};
  for (const [pid, p] of Object.entries(content.pathways ?? {})) {
    for (const [k, sd] of Object.entries(p.seqs ?? {})) {
      const seq = Number(k);
      const formel = content.items[`formel_${pid}_${seq}`];
      const trank = content.items[`trank_${pid}_${seq}`];
      const haupt = content.items[hauptzutat(formel)];
      if (!formel || !trank || !haupt) continue;
      out[restId(pid, seq)] = {
        name: `Rest: ${sd.name}`, kind: 'ingredient', rest: true, pathway: pid, seq,
        price: Math.max(5, Math.round((haupt.price ?? 20) * 0.8)),
        desc: `Was von einem Beyonder des ${p.name.replace('Pfad', 'Pfads')} (Sequenz ${seq}) übrig blieb, als er fiel. Ersetzt am Braukessel ${haupt.name} im Trank der Sequenz ${seq}. Ein Trank aus einem Rest schlägt öfter fehl.`,
      };
      out[restTrankId(pid, seq)] = {
        ...trank, name: `${trank.name} (aus Rest)`, rest: true,
        desc: `${trank.desc} Aus einem Rest gebraut: Er wirkt wie jeder andere, aber er wehrt sich öfter.`,
      };
    }
  }
  return out;
}

/** In buildContent nach applyGegnerBeyonder: Items anlegen, Beyonder-Gegnern ihren Rest in die Beute legen. */
export function applyBeyonderRest(content) {
  Object.assign(content.items, restItems(content));
  for (const [id, enc] of Object.entries(content.encounters)) {
    const r = restVonGegner(enc, id);
    if (!r || !content.items[r.item]) continue;
    const loot = content.loot[id] ?? {};
    const drops = (loot.drops ?? []).filter((d) => !content.items[d.item]?.rest);
    drops.push(restDrop(r.pid, r.seq));
    content.loot[id] = { ...loot, drops };
  }
  return content;
}
