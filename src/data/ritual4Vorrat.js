// Seq-4-Rituale in Wexmoor UND Dunscar (Seb, 2026-11-17): keine Rückreise, also muss jede Halbgott-Prüfung in beiden Städten
// abschließbar sein. Die Prüfungen selbst bleiben unverändert hart; hier kommt nur Ware dazu, die in einer Stadt sonst fehlte.
// - Kessel: Zutaten der fünf Essenzen samt Leerem Gefäß. Wexmoor fehlten Mondmohn und Glühwurmasche (nur als Altfund),
//   Dunscar das Sternglas. Grundstoffe in den Laden, Preise wie beim Seq-6-Vorrat (Wexmoor ×1,5, Dunscar ×2);
//   Hauptzutaten (Sternglas) gibt es in Dunscar nie im Laden, sondern wie beim Seq-6-Vorrat als Los beim Schichtbund.
// - Moor: Moorwasser fiel nur in Wexmoor und der Marsch. In Dunscar tropft es in der Unterschicht (Nachhall, 30 % wie der Torfgänger).
import { RITUAL6_LAEDEN, RITUAL6_TREFFEN, treffenWare } from './ritual6Vorrat.js';
import { LEERES_GEFAESS } from './sude.js';

export const RITUAL4_STAEDTE = ['wexmoor', 'dunscar'];
/** Dunscar: Moorwasser-Quelle (Gegner → Chance), Gegner samt Elite. */
export const DS_MOORWASSER = { nachhall: 0.3, nachhall_elite: 0.3 };

/** Alle Zutaten der Kessel-Essenzen plus Gefäß. */
export function kesselZutaten(content) {
  return [...new Set([...(content.seq4Sude ?? []).flatMap((s) => Object.keys(s.zutaten ?? {})), LEERES_GEFAESS])].filter((id) => content.items[id]);
}

function grundpreis(content, id) {
  const nell = content.market?.merchants?.nell?.stock?.find((s) => s.item === id)?.price;
  return nell ?? content.items[id]?.price ?? content.items[id]?.value ?? 20;
}

/** Wie der Seq-6-Vorrat: Los beim ersten Schichtbund-Mitglied, Preis = teuerstes altes Los ×2, Chance 0,5. */
function treffenLos(content, id) {
  const circle = content.gatherings?.circles?.[RITUAL6_TREFFEN.circle];
  const member = circle?.members?.[0];
  if (!member || (circle.members ?? []).some((m) => m.offers?.some((o) => o.item === id))) return;
  const lots = Object.values(content.gatherings.circles).flatMap((c) => (c.members ?? []).flatMap((m) => m.offers ?? []));
  const alt = Math.max(0, ...lots.filter((o) => o.item === id).map((o) => o.price)) || grundpreis(content, id) * 3;
  (member.offers ??= []).push({ item: id, price: alt * RITUAL6_TREFFEN.mult, chance: RITUAL6_TREFFEN.chance });
}

export function applyRitual4Vorrat(content) {
  const merchants = content.market?.merchants ?? {};
  const high = treffenWare(content);
  const zutaten = kesselZutaten(content);
  for (const stadt of RITUAL4_STAEDTE) {
    const { shops, mult } = RITUAL6_LAEDEN[stadt];
    const m = merchants[shops[0]];
    if (!m) continue;
    m.stock ??= [];
    const inStadt = new Set(shops.flatMap((sid) => (merchants[sid]?.stock ?? []).filter((s) => !s.rare && !s.requires_flags && !s.requires_honor).map((s) => s.item)));
    for (const id of zutaten) {
      if (inStadt.has(id)) continue;
      // Hauptzutaten: Wexmoor hat eigene Quellen (Glasmöwe, Brennerin), Dunscar bekommt ein Schichtbund-Los
      if (high.has(id)) { if (stadt === 'dunscar') treffenLos(content, id); continue; }
      m.stock.push({ item: id, price: Math.max(1, Math.round(grundpreis(content, id) * mult)) });
    }
  }
  for (const [enc, chance] of Object.entries(DS_MOORWASSER)) {
    const l = content.loot?.[enc];
    if (!l || (l.drops ??= []).some((d) => d.item === 'moorwasser')) continue;
    l.drops.push({ item: 'moorwasser', chance });
  }
}
