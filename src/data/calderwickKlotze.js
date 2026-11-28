/**
 * Calderwick-Requisiten für die Platzhalter-Klötze (tools/art/cw_kulissen/assets.py; Bilder docs/art/agent-calderwick/).
 * Die Innenräume (Pfandhaus, Buchbinderei, Archivsaal, Villa, Druckkammer, Sortier- und Gepäckhalle, Küche) hatten in der Raummitte einen
 * Mauerklotz 3x1, die drei Gefahrengebiete je acht Klötze 3x3 und vier 3x1. Die Kulisse belegte sie nur mit Wand- und Dachzellen.
 * Läuft zwischen applyCalderwickStadtplan und applyCalderwickKulisse: Die Klötze werden zu Y (fest, Bodenoptik: Gruppe kulisse im Thema),
 * darauf steht das passende Requisit. Die Begehbarkeit ändert sich nicht (Y ist genau dort, wo vorher I war).
 */
export const CW_KLOTZ_PLAN = {
  cw_pfandhaus: { '3x1': 'cwk_quittungsstand' },
  cw_buchbinderei: { '3x1': 'cwk_heftlade' },
  cw_archivsaal: { '3x1': 'cwk_aktenturm' },
  cw_villa: { '3x1': 'cwk_aktenturm' },
  cw_druckkammer: { '3x1': 'cwk_siegelpresse' },
  cw_sortierhalle: { '3x1': 'cwk_sortiertisch' },
  cw_gepaeckhalle: { '3x1': 'cwk_sortiertisch' },
  cw_kueche: { '3x1': 'cwk_anrichte' },
  cw_alte_setzerei: { '3x3': 'cwk_satzregal', '3x1': 'cwk_setzertisch' },
  cw_sortiergrube: { '3x3': 'cwk_sortiertrommel', '3x1': 'cwk_sortiertisch' },
  cw_nullfundament: { '3x3': 'cwk_fundamentpfeiler', '3x1': 'cwk_aktenturm' },
};
export const CW_KULISSEN_SPRITES = { cwk_quittungsstand: [48, 32], cwk_heftlade: [48, 32], cwk_aktenturm: [48, 48], cwk_siegelpresse: [48, 32], cwk_sortiertisch: [48, 40],
  cwk_anrichte: [48, 32], cwk_satzregal: [48, 48], cwk_setzertisch: [48, 32], cwk_sortiertrommel: [48, 48], cwk_fundamentpfeiler: [48, 48] };

/** Freistehende rechteckige Mauerklötze (nicht am Kartenrand): [{ x0, y0, x1, y1 }]. */
export function klotze(rows) {
  const H = rows.length;
  const W = rows[0].length;
  const seen = new Set();
  const out = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (rows[y][x] !== 'I' || seen.has(x + ',' + y)) continue;
    const q = [[x, y]];
    const teil = [];
    let rand = false;
    seen.add(x + ',' + y);
    while (q.length) {
      const [a, b] = q.pop();
      teil.push([a, b]);
      if (a === 0 || b === 0 || a === W - 1 || b === H - 1) rand = true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = (a + dx) + ',' + (b + dy);
        if (rows[b + dy]?.[a + dx] === 'I' && !seen.has(k)) { seen.add(k); q.push([a + dx, b + dy]); }
      }
    }
    const xs = teil.map((p) => p[0]);
    const ys = teil.map((p) => p[1]);
    const r = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    if (!rand && teil.length === (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1)) out.push(r);
  }
  return out;
}

export function applyCalderwickKlotze(content) {
  for (const [id, plan] of Object.entries(CW_KLOTZ_PLAN)) {
    const m = content.maps?.[id];
    if (!m?.rows) continue;
    const rows = m.rows.map((r) => [...r]);
    m.decor ??= [];
    for (const k of klotze(m.rows)) {
      const sprite = plan[(k.x1 - k.x0 + 1) + 'x' + (k.y1 - k.y0 + 1)];
      if (!sprite) continue;
      for (let y = k.y0; y <= k.y1; y++) for (let x = k.x0; x <= k.x1; x++) rows[y][x] = 'Y';
      const cx = ((k.x0 + k.x1 + 1) / 2) * 16;
      m.decor.push({ sprite, tile: [k.x0, k.y1], offset: [cx - (k.x0 * 16 + 8), 8], origin: [0.5, 1], alpha: 1, ysort: true, kulisse: 'cw2', block: [k.x0, k.y0, k.x1, k.y1] });
    }
    m.rows = rows.map((r) => r.join(''));
  }
}
