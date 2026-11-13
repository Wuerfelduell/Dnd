// Händler-Abgleich über alle Gebiete (Seb, 2026-11-12): Was ein Laden verkauft, soll zu den Gegnern und Sequenzen
// im jeweiligen Gebiet passen, und in jedem späteren Gebiet gibt es weiter einen Weg zu alten Stücken.
// Feste Regeln: Alte Stücke kosten ihren alten Preis (Kettlegate-Laden oder alter Zirkelpreis), nur neue, wertvolle
// Stücke werden teuer. Formeln und Zutaten fasst dieser Abgleich nicht an. Zirkelstücke stehen in Läden nur als
// Restposten (`rare`), damit sie auf den Treffen etwas Besonderes bleiben.
//
//  Kettlegate (Seq 9–7): Gorse/Kittering bleiben, wie sie sind.
//  Wexmoor (Seq 7–5): Maud Keel führt die alten Kettlegater Waffen und als Pfand-Restposten Zirkelstücke von dort.
//  Dunscar (Seq 5–4): Greta Hask führt auch die alten Zirkelwaffen (Atk 7–12, je Markttag die Hälfte), Wilma Rook alte Zirkelkleidung als
//    Restposten, Ida Marrow alte Artefakte als Nachlass-Restposten (Dunscar-Gegner droppen keine alten Artefakte mehr).
//    Dunscar-Ware selbst wird stärker: Kupplungsring, Filzverband, Schichttee.
//  Calderwick/Briarholt (Seq 4–3): Kleidung und Waffen dort lagen unter Dunscar-Niveau (Atk 9–12, +6–10 Leben).
//    Jetzt Atk 16–18, +25–40 Leben, −20 % Schaden; dazu Verpflegung zum Heilen und ein Restposten-Kasten mit allem Alten.
//    Endwerte (Atk 32–50, +100–300 Leben über den Dunscar-Zirkelstücken, Heilung 60–260) setzt seit 2026-11-13 preisAbgleich.js.

/** Kettlegater Läden und Zirkel, deren Preise als „alte Preise“ gelten. */
const ALT_LAEDEN = ['gorse', 'kittering'];
const ALT_ZIRKEL = ['waage', 'kreide', 'russ', 'lichtlose', 'salz', 'namensgilde'];

/** Restposten wechseln mit jedem Markttag (Feld `rare` = Chance je Stück). */
const REST = { wexmoor: 0.3, dunscarWaffe: 0.5, dunscarKleidung: 0.35, dunscarArtefakt: 0.12, spaet: 0.15 };

/** Neue Werte für Dunscar-Ware: [Feld, Wert, Preis]. */
const DUNSCAR_STAERKER = {
  k3h_kupplungsring: { boons: [{ key: 'max_hp', value: 30, text: '30 zusätzliche Leben.' }], price: 450 },
  k3o_filzverband: { heal: 60, price: 60 },
  k3o_schichttee: { heal: 35, price: 35 },
};

/** Calderwick/Briarholt (Kapitel 4/5, Seq 4–3): neue Werte und Preise. */
const SPAET_GEAR = {
  vi_hut_setzerkappe: [[['max_nerves', 20, '+20 maximale Nerven.']], 400],
  vi_hut_kurhaube: [[['max_hp', 35, '+35 maximales Leben.'], ['max_nerves', -6, '−6 maximale Nerven.']], 700],
  vi_hut_zylinder_vermesser: [[['sell', 1.2, '20 % höherer Erlös beim Verkaufen.']], 600],
  vi_hut_fuhrmannshut: [[['max_hp', 25, '+25 maximales Leben.']], 550],
  vi_mantel_druckerschurz: [[['max_nerves', 20, '+20 maximale Nerven.']], 500],
  vi_mantel_dampfmantel: [[['max_hp', 40, '+40 maximales Leben.']], 900],
  vi_mantel_reisepelerine: [[['carry', 20, '+20 Pfund Tragkraft.']], 450],
  vi_mantel_archivrobe: [[['lock_bonus', 20, 'Amtsschlösser verlangen 20 Ansehen weniger.'], ['honor_loss', 0.7, '30 % weniger Ansehensverlust.']], 500],
  vi_amulett_bleiletter: [[['vision_cost', 0.7, 'Geistsicht kostet 30 % weniger Nerven.']], 500],
  vi_amulett_pfirsichkern: [[['calm_decay', 0.75, 'Unruhe klingt 25 % langsamer ab.'], ['max_nerves', 20, '+20 maximale Nerven.']], 600],
  vi_amulett_grenzsteinsplitter: [[['dodge_window', 1.25, 'Ausweichfenster +25 %.']], 600],
  vi_amulett_rohrpostkapsel: [[['damage_taken', 0.8, '20 % weniger Schaden.']], 1200],
};

/** Waffen Kapitel 4/5: [Laden, Atk, Preis]. Dunscar: Steinmetz 13/15, Zirkel 16/19 für 5000+. */
const SPAET_WAFFEN = {
  vi_waffe_setzhaken: ['vi_handel_druckerei', 16, 1200],
  vi_waffe_bleihammer: ['vi_handel_druckerei', 18, 2000],
  vi_waffe_veredelungsschere: ['vi_handel_garten', 17, 1500],
  vi_waffe_dampfrohr: ['vi_handel_garten', 18, 1800],
  vi_waffe_kutschpeitsche: ['vi_handel_reise', 16, 1300],
  vi_waffe_richterstab: ['vi_handel_reise', 17, 1600],
};

/** Verpflegung Kapitel 4/5 (heilt 14–45), bisher in keinem Laden: [Laden, Preis]. */
const SPAET_VERPFLEGUNG = {
  vi_v_setzerbrot: ['vi_handel_druckerei', 30],
  vi_v_bitterwasser: ['vi_handel_garten', 30],
  vi_v_dampfkompresse: ['vi_handel_garten', 35],
  vi_v_pfirsichsud: ['vi_handel_garten', 70],
  vi_v_wegzehrung: ['vi_handel_reise', 45],
  vi_v_riechsalz_stark: ['vi_handel_reise', 60],
};

const isArtefakt = (content, id) => Boolean(content.artifacts?.[id]) || content.items[id]?.kind === 'artifact';

/** Alte Preise: Kettlegater Läden, dann alte Zirkel (der erste Fund zählt). */
export function altePreise(content) {
  const p = {};
  for (const mid of ALT_LAEDEN) for (const e of content.market.merchants[mid]?.stock ?? []) p[e.item] ??= e.price;
  for (const cid of ALT_ZIRKEL) for (const m of content.gatherings?.circles?.[cid]?.members ?? []) for (const e of m.offers ?? []) p[e.item] ??= e.price;
  return p;
}

/** Zirkelstücke (Waffen, Kleidung, Artefakte) aus den alten Zirkeln, ohne Formeln und Zutaten. */
function zirkelWare(content, cities) {
  const out = [];
  const seen = new Set();
  for (const cid of ALT_ZIRKEL) {
    const c = content.gatherings?.circles?.[cid];
    if (!c || !cities.includes(c.city ?? 'kettlegate')) continue;
    for (const m of c.members ?? []) for (const e of m.offers ?? []) {
      if (seen.has(e.item) || !content.items[e.item]) continue;
      const kind = isArtefakt(content, e.item) ? 'artifact' : content.items[e.item].kind;
      if (!['weapon', 'gear', 'artifact'].includes(kind)) continue;
      seen.add(e.item);
      out.push({ item: e.item, price: e.price, kind });
    }
  }
  return out;
}

function addStock(content, mid, entries) {
  const m = content.market.merchants[mid];
  if (!m) return;
  const have = new Set(m.stock.map((e) => e.item));
  const add = entries.filter((e) => content.items[e.item] && !have.has(e.item));
  content.market.merchants[mid] = { ...m, stock: [...m.stock, ...add] };
}

function setItem(content, id, patch) {
  if (content.items[id]) content.items[id] = { ...content.items[id], ...patch };
}

/** Preis eines Stücks in allen Läden und Zirkeln nachziehen (neue Dunscar-/Spätware). */
function setPrice(content, id, price) {
  for (const [mid, m] of Object.entries(content.market.merchants)) {
    if (m.stock.some((e) => e.item === id)) content.market.merchants[mid] = { ...m, stock: m.stock.map((e) => (e.item === id ? { ...e, price } : e)) };
  }
  for (const c of Object.values(content.gatherings?.circles ?? {})) for (const mem of c.members ?? []) {
    if (mem.offers?.some((e) => e.item === id)) mem.offers = mem.offers.map((e) => (e.item === id ? { ...e, price } : e));
  }
}

export function applyHaendlerAbgleich(content) {
  const merchants = content.market?.merchants;
  if (!merchants) return;
  content.market = { ...content.market, merchants: { ...merchants } };
  const alt = altePreise(content);
  const altWaffen = ALT_LAEDEN.flatMap((mid) => (merchants[mid]?.stock ?? []).filter((e) => content.items[e.item]?.kind === 'weapon'))
    .map((e) => ({ item: e.item, price: alt[e.item] }));

  // Wexmoor: Maud Keel bekommt Waffen (alte Ladenpreise) und Kettlegater Zirkelstücke als Pfand-Restposten.
  const kgZirkel = zirkelWare(content, ['kettlegate']).filter((e) => e.kind !== 'artifact');
  addStock(content, 'wx_pfandleiherin', [...altWaffen, ...kgZirkel.map((e) => ({ item: e.item, price: e.price, rare: REST.wexmoor }))]);

  // Dunscar: alte Zirkelwaffen fest bei Hask, alte Zirkelkleidung als Restposten bei Rook, alte Artefakte bei Ida.
  const alleZirkel = zirkelWare(content, ['kettlegate', 'wexmoor']);
  addStock(content, 'ds_waffenhaendlerin', alleZirkel.filter((e) => e.kind === 'weapon').map(({ item, price }) => ({ item, price, rare: REST.dunscarWaffe })));
  addStock(content, 'ds_kleiderhaendlerin', alleZirkel.filter((e) => e.kind === 'gear').map(({ item, price }) => ({ item, price, rare: REST.dunscarKleidung })));
  addStock(content, 'k3h_troedlerin', alleZirkel.filter((e) => e.kind === 'artifact').map(({ item, price }) => ({ item, price, rare: REST.dunscarArtefakt })));
  for (const [id, patch] of Object.entries(DUNSCAR_STAERKER)) {
    setItem(content, id, patch);
    setPrice(content, id, patch.price);
  }

  // Calderwick/Briarholt: stärkere Kleidung und Waffen, Verpflegung, Ankauf und Restposten mit allem Alten.
  for (const [id, [boons, price]] of Object.entries(SPAET_GEAR)) {
    setItem(content, id, { boons: boons.map(([key, value, text]) => ({ key, value, text })), price });
    setPrice(content, id, price);
  }
  for (const [id, [mid, atk, price]] of Object.entries(SPAET_WAFFEN)) {
    setItem(content, id, { atk, price });
    addStock(content, mid, [{ item: id, price }]);
  }
  for (const [id, [mid, price]] of Object.entries(SPAET_VERPFLEGUNG)) addStock(content, mid, [{ item: id, price }]);
  if (merchants.vi_handel_reise) content.market.merchants.vi_handel_reise = { ...content.market.merchants.vi_handel_reise, buys: true };
  const dunscarAlt = ['k3h_troedlerin', 'k3h_steinmetz'].flatMap((mid) => (merchants[mid]?.stock ?? [])
    .filter((e) => ['weapon', 'gear'].includes(content.items[e.item]?.kind)).map((e) => ({ item: e.item, price: content.market.merchants[mid].stock.find((x) => x.item === e.item).price })));
  const kgKleidung = ['gorse', 'kittering'].flatMap((mid) => (merchants[mid]?.stock ?? []).filter((e) => content.items[e.item]?.kind === 'gear')).map((e) => ({ item: e.item, price: alt[e.item] }));
  addStock(content, 'vi_handel_reise', [...altWaffen, ...kgKleidung, ...alleZirkel.map(({ item, price }) => ({ item, price })), ...dunscarAlt]
    .map((e) => ({ ...e, rare: REST.spaet })));
}
