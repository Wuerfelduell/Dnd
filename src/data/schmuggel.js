// Kein Zurück nach Kettlegate (Seb, 2026-11-11): Wer in Wexmoor angekommen ist, kommt nie mehr zurück. Damit nichts
// Nötiges allein in Kettlegate bleibt, steht im Unterschlupf (wx_kahn) eine Schmuggelkiste. Ihr Dialog öffnet die
// Kettlegate-Händler (Kittering, Nell, Gorse) und diesen Händler hier: alle Zutaten, die sonst nur auf den geheimen
// Treffen in Kettlegate zu haben sind, zum Schmuggelpreis und mit der Chance des Treffens (wechselt je Marktzyklus).
export const SCHMUGGEL_ID = 'schmuggel';
const AUFSCHLAG = 1.25;

export function applySchmuggel(content) {
  const circles = content.gatherings?.circles;
  if (!circles || !content.market) return content;
  const inWexmoor = new Set();
  for (const c of Object.values(circles)) if ((c.city ?? 'kettlegate') !== 'kettlegate') for (const m of c.members) for (const o of m.offers ?? []) inWexmoor.add(o.item);
  const nell = new Set((content.market.merchants.nell?.stock ?? []).map((e) => e.item));
  const stock = {};
  for (const c of Object.values(circles)) {
    if ((c.city ?? 'kettlegate') !== 'kettlegate') continue;
    for (const m of c.members) for (const o of m.offers ?? []) {
      const it = content.items[o.item];
      if (!it || it.kind !== 'ingredient' || inWexmoor.has(o.item) || nell.has(o.item)) continue;
      const price = Math.round((o.price ?? it.price ?? 50) * AUFSCHLAG);
      const rare = Math.min(1, Math.max(0.3, (o.chance ?? 1) * 1.2)); // nie seltener als jede dritte Lieferung
      const have = stock[o.item];
      stock[o.item] = { item: o.item, price: have ? Math.min(have.price, price) : price, rare: have ? Math.max(have.rare, rare) : rare };
    }
  }
  const merchant = {
    treffen_ersatz: true, // Ausnahme vom knappen Markt: ersetzt die Kettlegate-Treffen, die ab Wexmoor unerreichbar sind
    name: 'Zunders Schmuggelkiste', title: 'Zirkelware aus Kettlegate, per Nachtzug',
    greeting: 'Zunder hat einen Zettel beigelegt: „Was drin ist, ist drin. Was fehlt, kommt vielleicht mit dem nächsten Zug.“',
    stock: Object.values(stock).sort((a, b) => a.price - b.price || a.item.localeCompare(b.item)),
  };
  content.market = { ...content.market, merchants: { ...content.market.merchants, [SCHMUGGEL_ID]: merchant } };
  return content;
}
