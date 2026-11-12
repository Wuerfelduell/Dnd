// Händler am Kalkmarkt in Dunscar (Seb, 2026-11-12): Es gibt kein Zurück nach Kettlegate oder Wexmoor, also braucht
// Dunscar selbst Läden für die alten Sachen. Bisher gab es dort nur Ida Marrow (Trödel, Schichtkleidung), den Steinmetz
// und den Lampenwart, und niemand kaufte Beute an.
//  - Ida Marrow kauft jetzt Beute an und führt die Grundvorräte aus Kettlegate/Wexmoor.
//  - Drei neue Stände rechts am Kalkmarkt: Waffen (Gorse + Kittering), Kleidung/Amulette (wie Fenn in Wexmoor),
//    Kräuter (Nells Zutaten für Sequenz 9/8, keine höheren, keine Formeln).
// Die Sortimente werden aus den alten Händlern abgeleitet, damit neue Stücke dort auch hier auftauchen.
// Seltenes (Treffen-Lose, Drop-Ausrüstung, Formeln, Zutaten ab Sequenz 7) bleibt bewusst draußen.

/** Dunscar-Preise gegenüber Kettlegate (Wexmoor liegt bei etwa 1,4). */
export const DS_PREIS = 2;

const at = (tile) => ({ tile, facing: 'down', visible_if: { requires_flags: ['k3_arrived'] } });

export const DS_HAENDLER = {
  ds_waffenhaendlerin: {
    npc: { name: 'Waffenhändlerin Greta Hask', role: 'Klingen, Stöcke und Eisen, Kalkmarkt', palette: { coat: '#3c4a5e', hat: '#26262e', skin: '#c99f7b', hair: '#2e2a26', legs: '#26262e', scarf: '#8a5a3a' } },
    tile: [32, 9],
    title: 'Hasks Eisenkiste',
    greeting: 'Was die Rangierer nicht mehr brauchen, schleife ich nach.',
    from: [['gorse', (i) => i.kind === 'weapon' || i.id === 'blitzpulver'], ['kittering', (i) => i.kind === 'weapon']],
    text: 'Unter einer Plane liegen Schlagringe, Stockdegen, ein Revolver mit abgegriffenem Griff. Die Frau dahinter wischt Öl von einer Klinge. „Hask. Alles aus Kettlegate und Wexmoor, was den Weg über die Schienen gefunden hat. Billig ist hier nichts mehr.“',
    why: '„Weil jedes Stück mit dem Güterzug kommt und der Schaffner mitverdient. Und weil keiner mehr zurückfährt, um es dort zu kaufen.“',
    shopText: 'Waffen ansehen.',
  },
  ds_kleiderhaendlerin: {
    npc: { name: 'Kleiderhändlerin Wilma Rook', role: 'Mäntel, Hüte und Anhänger, Kalkmarkt', palette: { coat: '#4a5a3e', hat: '#2a2a2a', skin: '#d8b89a', hair: '#6a4a3a', legs: '#2a2a2a', scarf: '#a8824a' } },
    tile: [35, 9],
    title: 'Rooks Kleiderstange',
    greeting: 'Kalkstaub frisst jeden Stoff. Kauf lieber zwei.',
    from: [['wx_schneiderin', () => true]],
    base: { wx_schneiderin: 1.4 }, // Fenns Preise sind schon Wexmoor-Preise
    extra: ['wachsamulett'], // sonst nur Beute; senkt Unruhe beim Heilen (Seb, 2026-11-12)
    text: 'Eine Stange voller Mäntel, darüber Hüte an Nägeln, in einer Zigarrenkiste Anhänger an Lederbändern. „Rook. Was in Kettlegate auf dem Nachtmarkt hing und in Wexmoor bei Fenn, hängt jetzt hier.“',
    why: '„Fenn schickt mir die Ballen mit dem Kahn bis zur Bahn, dann geht es über die Schienen. Jeder will seinen Teil.“',
    shopText: 'Kleidung und Schmuck ansehen.',
  },
  ds_kraeuterfrau: {
    npc: { name: 'Kräuterhändlerin Hester Wynn', role: 'Kräuter und einfache Zutaten, Kalkmarkt', palette: { coat: '#5a4a5e', hat: '#2e2a30', skin: '#c59e80', hair: '#8a8478', legs: '#2e2a30', scarf: '#6a8a4a' } },
    tile: [38, 9],
    title: 'Wynns Kräuterkorb',
    greeting: 'Trocken gelagert, ehrlich gewogen.',
    from: [['nell', (i) => i.kind === 'ingredient' || i.kind === 'consumable' || i.id === 'leeres_gefaess']],
    text: 'Körbe mit Bündeln, Gläser mit Staub und Federn, alles mit Kreide beschriftet. Eine alte Frau sortiert Wurzeln. „Wynn. Was Nell in Kettlegate hatte, habe ich auch. Was darüber hinausgeht, suchst du besser bei Leuten, die nachts handeln.“',
    why: '„Hier wächst nichts außer Kalk. Alles kommt von weit her.“',
    shopText: 'Kräuter ansehen.',
  },
};

/** Grundvorräte, die Ida Marrow zusätzlich führt (Dunscar-Preise). */
const IDA_VORRAT = ['bannsalz', 'ruhetee', 'lampenoel', 'salzbrot', 'moortee'];

function dialogue(id, h) {
  return {
    start: 'start',
    nodes: {
      start: { text: h.text, choices: [{ text: h.shopText, shop: id }, { text: 'Warum so teuer?', next: 'preis' }, { text: 'Auf Wiedersehen.' }] },
      preis: { text: h.why, choices: [{ text: 'Dann zeigen Sie mal.', shop: id }, { text: 'Später.' }] },
    },
  };
}

// Braukessel in Pfiffs Speisewagen (Seb, 2026-11-12): Unterkunft mit Koje und Lager, gleiche Kessel-Logik wie im Kahn.
export const DS_KESSEL = {
  id: 'ds_kessel', kind: 'brew', tile: [15, 5], prompt: 'Am Braukessel brauen', sprite: 'cauldron', marker: false,
  solid: [14, 10], title: 'Pfiffs Kessel', anim: ['cauldron_bubble', 'bubble'], reach: 24,
};

export function applyDunscarHaendler(content) {
  const wagen = content.maps.ds_speisewagen;
  if (wagen && !wagen.interactables.some((i) => i.kind === 'brew')) wagen.interactables.push({ ...DS_KESSEL });
  const merchants = content.market?.merchants;
  const map = content.maps.ds_kalkmarkt;
  if (!merchants || !map) return;
  const high = new Set(Object.values(content.pathways ?? {}).flatMap((p) => [7, 6, 5, 4, 3, 2, 1].flatMap((q) => Object.keys(p.seqs?.[q]?.ingredients ?? {}))));
  for (const basic of ['nebeltau', 'silberstaub']) high.delete(basic); // Grundzutaten, auch bei Nell frei käuflich
  for (const [id, h] of Object.entries(DS_HAENDLER)) {
    const stock = [];
    const seen = new Set();
    for (const [src, ok] of h.from) {
      const mult = DS_PREIS / (h.base?.[src] ?? 1);
      for (const e of merchants[src]?.stock ?? []) {
        const item = content.items[e.item];
        if (!item || seen.has(e.item) || e.rare !== undefined || item.kind === 'formula' || high.has(e.item)) continue;
        if (!ok({ ...item, id: e.item })) continue;
        seen.add(e.item);
        stock.push({ item: e.item, price: Math.round(e.price * mult) });
      }
    }
    for (const item of h.extra ?? []) {
      if (content.items[item] && !seen.has(item)) stock.push({ item, price: Math.round((content.items[item].price ?? 20) * DS_PREIS) });
    }
    merchants[id] = { name: h.npc.name, title: h.title, greeting: h.greeting, stock };
    content.npcs[id] = { ...h.npc, dialogue: id };
    content.dialogues[id] = dialogue(id, h);
    if (!map.npcs.some((n) => n.id === id)) map.npcs.push({ id, ...at(h.tile) });
  }
  // Ida Marrow: Ankauf und Grundvorräte
  const ida = merchants.k3h_troedlerin;
  if (ida) {
    ida.buys = true;
    const pfand = merchants.wx_pfandleiherin?.stock ?? [];
    for (const item of IDA_VORRAT) {
      if (!content.items[item] || ida.stock.some((e) => e.item === item)) continue;
      const wx = pfand.find((e) => e.item === item)?.price;
      if (wx) ida.stock.push({ item, price: Math.round((wx * DS_PREIS) / 1.4) });
    }
    const d = content.dialogues.k3h_troedlerin?.nodes?.start;
    if (d && !d.choices.some((c) => c.shop_mode === 'sell')) d.choices.splice(1, 0, { text: 'Beute verkaufen.', shop: 'k3h_troedlerin', shop_mode: 'sell' });
  }
}
