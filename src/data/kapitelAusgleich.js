// Kapitel-Abgleich (Seb 2026-11-12, „Scaling checken: Leben, Geld, Items“).
// Kapitel 4 (Calderwick, Briarholt, Landstraße) zahlte noch Wexmoor-Geld (normal ~13, Elite ~30, Bosse 0),
// obwohl Dunscar davor schon ×10 zahlt und die Läden dort 1200–2000 für Waffen nehmen.
// Und die Sekten-Häupter in Dunscar (Bosse mit 3200 Leben) zahlten nur 300, Gebietsbosse dort 1000–1250.

// Seb 2026-11-26 („Preise und Beute nach Dunscar richtig skalieren“): ×15 → ×22. Mit ×15 zahlte ein Calderwick-Kampf kaum mehr
// als Dunscar (Geld+Beute ~220 je normalem Gegner), obwohl dort Formeln 3 je 15.000 und Waffen bis 31.000 kosten.
export const K4_MONEY_MULT = 22;
export const K4_BH_MULT = 1.25; // Briarholt (Gebiete bh_*): zähere Gegner als Calderwick, zahlt ein Viertel mehr
/** Trophäen der Kapitel 4/5 (vi_m_*, vt_*) waren 6–54 Schilling wert, Dunscar-Beute 100–600 je Kampf: Wert ×15. */
export const SPAET_TROPHAEE_MULT = 15;
export const SPAET_TROPHAEE = /^(vi_m_|vt_(cw|bh|all)_)/;
/** Koop ab Kapitel 4: eine gemeinsame Kasse, aber zwei Formeln je Sequenz; Gegnergeld ×1,5 (Combat.rollLoot). */
export const KOOP_GELD_SPAET = 1.5;
export const K4_BOSS_MONEY = [100, 160]; // vor ×15: 1500–2400, Bosse hatten gar kein Geld
export const K5_BOSS_MONEY_MIN = [3500, 5000];
export const K3_BOSS_MONEY_MIN = [700, 1000]; // so viel wie der kleinste Dunscar-Gebietsboss

export function applyKapitelAusgleich(content) {
  const loot = { ...content.loot };
  for (const [id, enc] of Object.entries(content.encounters)) {
    const L = loot[id];
    if (!L || !Array.isArray(L.money) || enc.practice) continue;
    if (enc.chapter === 4 && !L.k4_buffed) {
      const base = enc.boss && !/_phase\d/.test(id) && !L.money[1] ? K4_BOSS_MONEY : L.money;
      const bh = /^(bh_|vg_bh)/.test(enc.zone ?? '') || id.startsWith('vg_bh') ? K4_BH_MULT : 1;
      loot[id] = { ...L, money: base.map((v) => Math.round(v * K4_MONEY_MULT * bh)), k4_buffed: true };
    } else if (enc.chapter === 3 && enc.boss && L.repeat && L.money[1] && L.money[1] < K3_BOSS_MONEY_MIN[0]) {
      loot[id] = { ...L, money: [...K3_BOSS_MONEY_MIN] };
    }
  }
  content.loot = loot;
}

/**
 * Trophäen aus Calderwick, Briarholt und von der Landstraße auf Kapitel-4-Wert heben (nach allen Händlern, ganz am Ende von buildContent).
 * Kauf- und Verkaufspreis steigen gemeinsam, damit der Händler-Deckel (Ankauf ≤ 80 % des billigsten Kaufpreises, PR #552) bleibt.
 */
export function applySpaetBeute(content) {
  // Kapitel-5-Bosse (5000 Leben, erst spät angelegt) zahlten mit 2000 weniger als ein Calderwick-Boss
  for (const [id, enc] of Object.entries(content.encounters)) {
    const L = content.loot?.[id];
    if (enc.chapter === 5 && enc.boss && !enc.practice && L?.repeat && L.money?.[1] && L.money[1] < K5_BOSS_MONEY_MIN[0]) content.loot[id] = { ...L, money: [...K5_BOSS_MONEY_MIN] };
  }
  for (const [id, it] of Object.entries(content.items)) {
    if (!SPAET_TROPHAEE.test(id) || it.kind !== 'trophy' || it.spaet_buffed || !it.price) continue;
    content.items[id] = { ...it, price: Math.round(it.price * SPAET_TROPHAEE_MULT), spaet_buffed: true };
    const sp = content.market?.sell_prices;
    if (sp?.[id]) sp[id] = Math.round(sp[id] * SPAET_TROPHAEE_MULT);
  }
  for (const m of Object.values(content.market?.merchants ?? {})) {
    for (const e of m.stock ?? []) if (e.price && content.items[e.item]?.spaet_buffed) e.price = Math.round(e.price * SPAET_TROPHAEE_MULT);
  }
}
