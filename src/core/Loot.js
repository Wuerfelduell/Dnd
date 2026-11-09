// Beute: Würfeln von Drops, Seltenheit und Behälter (ohne Phaser, in Node testbar).
//
// Eine Beutetabelle sieht so aus:
//   { "money": [4, 9], "drops": [{ "item": "moorwasser", "chance": 0.7, "n": [1, 2] }, ...] }
// `money` darf auch eine feste Zahl sein, `n` ebenso (Standard 1).

export const RARITIES = ['gewoehnlich', 'ungewoehnlich', 'selten', 'okkult'];
export const RARITY_NAMES = { gewoehnlich: 'gewöhnlich', ungewoehnlich: 'ungewöhnlich', selten: 'selten', okkult: 'okkult' };
export const RARITY_COLORS = { gewoehnlich: '#c8c0b0', ungewoehnlich: '#8fd07a', selten: '#f0c060', okkult: '#6fe0d0' };
/** Behälter nach der höchsten Seltenheit der Beute. */
export const CONTAINERS = { gewoehnlich: 'beutel', ungewoehnlich: 'kiste', selten: 'truhe', okkult: 'okkulter_schrein' };
export const CONTAINER_NAMES = { beutel: 'Beutel', kiste: 'Kiste', truhe: 'Truhe', okkulter_schrein: 'Okkulter Schrein' };

/** Seltenheit eines Gegenstands: aus den Daten, sonst geschätzt aus Art und Preis. */
export function itemRarity(it) {
  if (!it) return 'gewoehnlich';
  if (it.rarity) return it.rarity;
  if (it.kind === 'potion' || it.kind === 'formula') return 'okkult';
  if (it.kind === 'weapon') return (it.atk ?? 0) >= 7 ? 'selten' : 'ungewoehnlich';
  const p = it.price ?? 0;
  if (p >= 40) return 'selten';
  if (p >= 20) return 'ungewoehnlich';
  return 'gewoehnlich';
}

const between = (v, rng) => {
  if (Array.isArray(v)) return v[0] + Math.floor(rng() * (v[1] - v[0] + 1));
  return v ?? 0;
};

/**
 * Würfelt eine Beutetabelle aus. `luck` vervielfacht die Chancen (Elite: 2),
 * `moneyMult` das Geld. Ergebnis: { money, items: {id: n} }
 */
export function rollLoot(table, rng = Math.random, { luck = 1, moneyMult = 1 } = {}) {
  const out = { money: 0, items: {} };
  if (!table) return out;
  out.money = Math.round(between(table.money, rng) * moneyMult);
  for (const d of table.drops ?? []) {
    if (rng() >= Math.min(1, (d.chance ?? 1) * luck)) continue;
    const n = Math.max(1, between(d.n ?? 1, rng));
    out.items[d.item] = (out.items[d.item] ?? 0) + n;
  }
  return out;
}

export const isEmptyLoot = (loot) => !loot || (!loot.money && !Object.keys(loot.items ?? {}).length);

/** Höchste Seltenheit in einer Beute. */
export function lootRarity(loot, items) {
  let best = 0;
  for (const id of Object.keys(loot?.items ?? {})) best = Math.max(best, RARITIES.indexOf(itemRarity(items[id])));
  return RARITIES[best];
}

/** Gibt die Beute in die Taschen (Geld zählt als Beute für Verdauung und Boni). */
export function takeLoot(state, loot, reason = '') {
  if (isEmptyLoot(loot)) return;
  if (loot.money) state.addMoney(loot.money, { loot: true, reason });
  for (const [id, n] of Object.entries(loot.items ?? {})) state.addItem(id, n);
  state.emit('changed');
}

/** Beute als Liste für die Anzeige, seltenes zuerst. */
export function lootList(loot, items) {
  return Object.entries(loot?.items ?? {})
    .map(([id, n]) => ({ id, n, name: items[id]?.name ?? id, rarity: itemRarity(items[id]) }))
    .sort((a, b) => RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity));
}

/** Häufigkeit einer Drop-Chance als Wort fürs Bestiarium. */
export function chanceWord(chance) {
  if (chance >= 1) return 'immer';
  if (chance >= 0.5) return 'häufig';
  if (chance >= 0.2) return 'gelegentlich';
  return 'kaum';
}

/**
 * Was ein Gegner fallen lassen kann (fürs Bestiarium): Drops mit Chance,
 * feste Items (nur beim ersten Sieg) und Elite-Extras, seltenes zuerst.
 * `elite` ist die Tabelle der Elite-Variante (oder null, wenn noch nicht besiegt).
 */
export function lootPreview(table, items, elite = null) {
  const entries = new Map();
  const add = (id, data) => { if (!entries.has(id)) entries.set(id, { id, name: items[id]?.name ?? id, rarity: itemRarity(items[id]), ...data }); };
  for (const d of table?.drops ?? []) add(d.item, { chance: d.chance ?? 1 });
  for (const id of Object.keys(table?.items ?? {})) add(id, { chance: 1, first: true });
  for (const d of elite?.drops ?? []) add(d.item, { chance: Math.min(1, d.chance ?? 1), elite: true });
  for (const id of Object.keys(elite?.items ?? {})) add(id, { chance: 1, first: true, elite: true });
  const list = [...entries.values()].sort((a, b) => RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) || b.chance - a.chance);
  const money = table?.money ?? 0;
  return { money: Array.isArray(money) ? money : [money, money], repeat: !!table?.repeat, items: list };
}
