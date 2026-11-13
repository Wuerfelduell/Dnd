// Reisen über die Stadtkarte: zwei Reisearten (Daten in src/data/travel.json).
// - sicher: langsam, regeneriert Leben und Nerven, unterwegs liest man im Journal.
// - schnell: kostet Nerven, Zufallsereignis (Monster mit Beute, Fundstück, Taschendieb, nichts).
// Reine Spiellogik ohne Grafik, damit die Tests sie direkt prüfen können.

const randInt = (rng, [min, max]) => min + Math.floor(rng() * (max - min + 1));

function weighted(list, rng) {
  const total = list.reduce((s, x) => s + (x.weight ?? 1), 0);
  let r = rng() * total;
  for (const x of list) {
    r -= x.weight ?? 1;
    if (r < 0) return x;
  }
  return list[list.length - 1];
}

export function travelData(state) {
  return state.content.travelRules;
}

/** Stadt einer Karte (Kapitel 2: Wexmoor). Alles ohne Feld `city` gehört zu Kettlegate. */
export function cityOf(state, mapId) {
  return state.content.maps[mapId]?.city ?? 'kettlegate';
}

/**
 * Städte, in die es kein Zurück gibt (Seb, 2026-11-11): Wer mit dem Zug in Wexmoor angekommen ist, kehrt nie nach
 * Kettlegate zurück. Dort läuft die Fahndung, und alles Nötige (Kessel, Formeln, Zutaten, Vorräte) steht im Unterschlupf.
 */
export function lockedCities(state) {
  if (state.testmodus) return [];
  // Kapitel 4: nach dem Sturz gibt es weder Dunscar noch die Himmelsstadt (erst beim zweiten Aufstieg wieder).
  // Ausnahme auf_rueckweg: zu früh Gestürzte sind per Lastenzug zurück in Dunscar, bis sie am Schaffner vorbeikommen (data/aufstieg.js).
  return [...(state.flags.has('k2_arrived') ? ['kettlegate'] : []), ...(state.flags.has('k4_arrived') ? (state.flags.has('auf_rueckweg') ? ['himmel', 'calderwick'] : ['dunscar', 'himmel']) : [])];
}

export function cityLocked(state, city) {
  return lockedCities(state).includes(city);
}

/** Reiseziele, die von dieser Karte aus auf der Stadtkarte stehen: nur die eigene Stadt, nie eine gesperrte Stadt. */
export function travelDestinations(state, current) {
  const city = cityOf(state, current);
  return state.content.travel.filter((t) => t.map !== current && (t.city ?? 'kettlegate') === city
    && !cityLocked(state, cityOf(state, t.map)) && (state.testmodus || state.meets(t)));
}

/** Nervenkosten der schnellen Reise (Welt-Fähigkeiten senken sie über das Passiv hurry_cost). */
export function hurryCost(state) {
  return Math.round(travelData(state).modes.schnell.nerves_cost * (state.passive?.('hurry_cost') ?? 1));
}

/** Darf der schnelle Weg genommen werden? */
export function canHurry(state) {
  if (state.isOverloaded?.()) return false;
  return state.composure >= hurryCost(state);
}

/**
 * Langsam und sicher: Leben und Nerven zurück, dazu ein Blick ins Journal.
 * Ergebnis: { healed, nerves, hint, review } (hint/review können fehlen).
 */
export function travelSafe(state, rng = Math.random) {
  const m = travelData(state).modes.sicher;
  const healed = state.heal(Math.max(1, Math.round(state.maxHp * m.heal_pct)));
  state.healPartner?.(0, { pct: m.heal_pct });
  const before = state.composure;
  state.setComposure(before + m.nerves);
  const nerves = Math.round(state.composure - before);
  const hint = state.nextHint();
  // Eine Vermutung mit nur einer Quelle in Erinnerung rufen: Wer eine zweite findet, bestätigt sie.
  const open = state.content.cases.flatMap((c) => state.knownFacts(c.id))
    .filter((f) => state.factStatus(f) === 'suspected');
  const review = open.length ? state.fact(open[Math.floor(rng() * open.length)]).text : null;
  state.emit('changed');
  return { healed, nerves, hint, review };
}

/** Beute würfeln und gutschreiben. Ergebnis: Liste lesbarer Zeilen. */
export function rollLoot(state, tableId, rng = Math.random) {
  const t = travelData(state).loot[tableId];
  if (!t) throw new Error(`Unbekannte Beutetabelle: ${tableId}`);
  const got = {};
  let money = 0;
  if (t.money) money = state.addMoney(randInt(rng, t.money), { loot: true, reason: 'Beute' });
  for (let i = 0; i < (t.rolls ?? 1); i++) {
    const pool = (t.items ?? []).filter((x) => !(x.unique && (state.itemCount(x.id) > 0 || got[x.id])));
    if (!pool.length) break;
    const pick = weighted(pool, rng);
    if (!pick.id) continue;
    got[pick.id] = (got[pick.id] ?? 0) + (pick.n ?? 1);
  }
  for (const [id, n] of Object.entries(got)) state.addItem(id, n);
  const lines = Object.entries(got).map(([id, n]) => `${state.item(id).name}${n > 1 ? ` ×${n}` : ''}`);
  if (money > 0) lines.unshift(`${money} Schilling`);
  return lines;
}

/**
 * Schnell und gefährlich: kostet Nerven und würfelt ein Ereignis.
 * Ergebnis: das Ereignis plus { loot?: [...], lostMoney? }. Hat es eine `encounter`,
 * muss der Aufrufer den Kampf starten und danach `afterHurryFight` aufrufen.
 */
export function travelFast(state, rng = Math.random) {
  const rules = travelData(state);
  state.setComposure(state.composure - hurryCost(state));
  const city = cityOf(state, state.map);
  const ev = weighted(rules.events.filter((e) => (e.city ?? 'kettlegate') === city && state.meets(e)), rng);
  const out = { ...ev };
  if (ev.takes_money) {
    const before = state.money;
    state.addMoney(-Math.min(state.money, randInt(rng, ev.takes_money)));
    out.lostMoney = before - state.money;
  }
  // Fallen (Wexmoor): Treibsand, Flutlöcher, Fußangeln kosten Leben, Nerven oder machen dich bekannter (nie tödlich)
  if (ev.effects) {
    const hp = state.hp;
    state.applyEffects(ev.effects);
    if (state.hp < hp) out.damage = hp - state.hp;
  }
  if (!ev.encounter && ev.loot) out.loot = rollLoot(state, ev.loot, rng);
  state.emit('changed');
  return out;
}

/** Nach einem Kampf unterwegs: bei Sieg Beute. */
export function afterHurryFight(state, ev, outcome, rng = Math.random) {
  if (outcome !== 'won' || !ev.loot) return [];
  return rollLoot(state, ev.loot, rng);
}
