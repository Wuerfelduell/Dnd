/**
 * Altfunde in Wexmoor (Seb, 2026-11-12): Weil es kein Zurück nach Kettlegate gibt, tragen Wexmoors Monster ab und zu
 * noch Beute aus den alten Kettlegater Gefahrengebieten (Marsch, Katakomben, Pestgassen, Kraterwald) mit sich.
 * Jede Wexmoor-Beutetabelle bekommt dafür ein Feld `alt`: mit `chance` fällt genau EIN zufälliges Stück aus `pool`
 * (gewichtet: Artefakte/okkult selten, Alltagskram häufiger). Formeln sind nie dabei (Seq-4-Formel bleibt 0,5 %
 * Elite-Drop bzw. Zirkel, siehe core/PfadHandel.js).
 * Läuft in buildContent nach allen Paketen, damit auch nachträglich ergänzte Wexmoor-Gegner etwas bekommen.
 */
export const ALT_ZONES = ['marsch', 'katakomben', 'pestgassen', 'kraterwald'];
/** Kettlegater Zirkel: deren Zutaten (keine Formeln) kommen mit Gewicht 8 in den Topf. */
export const ALT_CIRCLES = ['waage', 'russ'];
export const ALT_CIRCLE_WEIGHT = 8;
/** Feste Extra-Drops je Wexmoor-Zone (Seb: Nachtfalterstaub 5 % im Leuchtturm). */
export const ZONE_DROPS = { wx_leuchtturm: [{ item: 'nachtfalterstaub', chance: 0.05 }] };
/** Chance auf einen Altfund je Sieg. */
export const ALT_CHANCE = { normal: 0.08, elite: 0.3, boss: 0.35 };

/** Gewicht eines Stücks im Altfund-Topf. */
export function altWeight(item) {
  if (!item) return 0;
  if (item.rarity === 'okkult' || item.boons) return 1;
  if (item.rarity === 'selten' || item.kind === 'gear' || item.kind === 'weapon') return 2;
  return 4;
}

export function applyAltbeute(content) {
  const isFormel = (id) => id.startsWith('formel_') || content.items[id]?.kind === 'formula';
  const pool = new Map();
  for (const [id, e] of Object.entries(content.encounters)) {
    if (!ALT_ZONES.includes(e.zone)) continue;
    for (const d of content.loot[id]?.drops ?? []) {
      if (isFormel(d.item) || !content.items[d.item] || ['quest', 'key'].includes(content.items[d.item].kind)) continue;
      pool.set(d.item, altWeight(content.items[d.item]));
    }
  }
  // Zutaten der Kettlegater Zirkel (z. B. Nachtfalterstaub), die man sonst nur dort bekam
  for (const cid of ALT_CIRCLES) {
    const circle = content.gatherings?.circles?.[cid];
    if (!circle) continue;
    JSON.stringify(circle).replace(/"item":"([a-z0-9_]+)"/g, (m, id) => {
      if (!isFormel(id) && content.items[id]?.kind === 'ingredient') pool.set(id, Math.max(pool.get(id) ?? 0, ALT_CIRCLE_WEIGHT));
      return m;
    });
  }
  if (!pool.size) return content;
  for (const [id, e] of Object.entries(content.encounters)) {
    if (!String(e.zone ?? '').startsWith('wx_')) continue;
    let table = content.loot[id];
    if (!table) continue;
    const extra = (ZONE_DROPS[e.zone] ?? []).filter((d) => content.items[d.item] && !(table.drops ?? []).some((x) => x.item === d.item));
    if (extra.length) table = { ...table, drops: [...(table.drops ?? []), ...extra] };
    const own = new Set((table.drops ?? []).map((d) => d.item));
    const entries = [...pool].filter(([item]) => !own.has(item)).map(([item, w]) => ({ item, w }));
    const chance = e.boss ? ALT_CHANCE.boss : e.elite ? ALT_CHANCE.elite : ALT_CHANCE.normal;
    content.loot[id] = { ...table, alt: { chance, label: 'Altfund aus Kettlegate', pool: entries } };
  }
  return content;
}
