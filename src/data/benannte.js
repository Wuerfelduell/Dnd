// Codex DJ: benannte Gegner – einmalige, stärkere Varianten bekannter Gebietsgegner (Daten: packs/benannte_gegner).
// Aufbau zur Ladezeit auf dem heutigen Grundgegner (Leben × faktoren.hp, Schaden × faktoren.damage), damit spätere
// Balance-Änderungen der Grundgegner mitziehen. Erscheinen (Nacht, Sequenz 6 oder höher, 10 % je Gebiet und Spieltag)
// prüft core/Benannte.js. Varrowmouth-Varianten fehlen, bis Kapitel 6 existiert (Grundgegner vme_* gibt es noch nicht).

export const BENANNTE_FILES = ['gegner', 'bestiarium', 'auftritt', 'beute'];

/** Wirkung der acht Fasserin-Artefakte aus DJ-Beute (Passiv-Schlüssel des Spiels, Text beschreibt die echte Wirkung). */
const BNL_WIRKUNG = {
  zollkrone: [{ key: 'damage_taken', value: 0.92, text: 'Du nimmst 8 % weniger Schaden.' }, { key: 'unruhe_tick', value: 0.05, text: 'Die Unruhe steigt langsam.' }],
  stilleschlacke: [{ key: 'skill_composure', value: 0.9, text: 'Fähigkeiten kosten 10 % weniger Nerven.' }, { key: 'dmg_mult', value: 0.95, text: 'Du verursachst 5 % weniger Schaden.' }],
  lohnwurzel: [{ key: 'dodge_window', value: 1.1, text: 'Das Ausweichfenster ist etwas größer.' }, { key: 'dmg_mult', value: 0.95, text: 'Du verursachst 5 % weniger Schaden.' }],
  lochzange: [{ key: 'parry_nerves', value: 1, text: 'Paraden geben eine Nervenkraft mehr zurück.' }, { key: 'carry', value: -1, text: 'Du trägst etwas weniger.' }],
  kalkband: [{ key: 'max_hp', value: 10, text: '+10 maximales Leben.' }, { key: 'heal_bonus', value: 0.9, text: 'Heilung wirkt ein Zehntel schwächer.' }],
  umkehrletter: [{ key: 'occult_mult', value: 1.1, text: 'Okkulte Angriffe treffen 10 % härter.' }, { key: 'unruhe_tick', value: 0.08, text: 'Die Unruhe steigt spürbar.' }],
  kaltventil: [{ key: 'composure_regen', value: 1.1, text: 'Nerven erholen sich 10 % schneller.' }, { key: 'unruhe_tick', value: 0.05, text: 'Die Unruhe steigt langsam.' }],
  gesichtsabdruck: [{ key: 'vision_cost', value: 0.85, text: 'Geistsicht kostet 15 % weniger.' }, { key: 'unruhe_tick', value: 0.1, text: 'Die Unruhe steigt deutlich.' }],
};

/** Paketteil für buildContent: Beutestücke (Items), Fasserin-Rezepte und -Artefakte, Bestiariumsseiten. */
export function benanntePack({ gegner, bestiarium, auftritt, beute }) {
  const items = Object.fromEntries(Object.entries(beute.beutestuecke).map(([id, b]) => [id, { name: b.name, kind: 'trophy', rarity: b.rarity, weight: b.weight ?? 0.2, price: 120, desc: b.desc }]));
  const rezepte = Object.values(beute.artefakte).map((a) => ({ id: a.id, artifact: a.id, needs: { [a.beutestueck]: 1 }, fee: a.lohn_vorschlag ?? 120, chance: a.chance ?? 0.6, line: a.oda_pruefen ?? '' }));
  const artefakte = Object.fromEntries(Object.values(beute.artefakte).map((a) => {
    const [boon, curse] = BNL_WIRKUNG[a.beutestueck.replace(/^bnl_/, '')] ?? BNL_WIRKUNG.zollkrone;
    return [a.id, { name: a.name, source: 'artisan', price: Math.round(120 + ((0.8 - (a.chance ?? 0.6)) / 0.4) * 80), icon: a.id, desc: a.beschreibung, untersuchen: a.untersuchen, oda: a.oda_zeile, beutestueck: a.beutestueck, chance: a.chance, boons: [boon], curses: [curse] }];
  }));
  const bestiaryTexts = Object.fromEntries(Object.entries(bestiarium).map(([id, b]) => [id, { titel: b.name, text: `${b.geschichte} ${b.schwaeche ? `Schwäche: ${b.schwaeche}` : ''}`.trim() }]));
  return { name: 'benannte_gegner', rezepte, artefakte, benannte: { gegner, auftritt, bestiaryTexts, items } };
}

/** Freie Bodenkachel weit weg vom Eingang (wie die Gebietsbosse). */
function freeTile(m, skip = 0) {
  const spawns = Object.values(m.spawns ?? {});
  const taken = new Set([...(m.npcs ?? []), ...(m.interactables ?? []), ...(m.roamers ?? [])].filter((o) => o.tile).map((o) => `${o.tile[0]},${o.tile[1]}`));
  const w = m.rows[0].length;
  const h = m.rows.length;
  const sx = spawns[0]?.[0] ?? 0;
  const goal = [sx < w / 2 ? Math.round(w * (0.62 + skip * 0.08)) : Math.round(w * (0.38 - skip * 0.08)), Math.round(h * (0.35 + skip * 0.15))];
  let best = null;
  m.rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!(ch === '.' || /[gpscwPK=,]/.test(ch)) || taken.has(`${x},${y}`)) return;
    if (spawns.some(([a, b]) => Math.abs(x - a) + Math.abs(y - b) < 10)) return;
    const d = Math.abs(x - goal[0]) + Math.abs(y - goal[1]);
    if (!best || d < best.d) best = { d, tile: [x, y] };
  }));
  return best?.tile ?? null;
}

/** Nach dem Aufbau aller Gegner: Begegnungen, Beute und Karten-Auftritte anlegen. */
export function applyBenannte(content) {
  const bn = content.benannte;
  if (!bn) return;
  for (const [id, it] of Object.entries(bn.items ?? {})) content.items[id] ??= it;
  for (const [id, g] of Object.entries(bn.gegner)) {
    const base = content.encounters[g.grundlage];
    const zonen = (g.erscheinen?.zonen ?? []).filter((z) => content.maps[z]?.rows);
    if (!base || !zonen.length || content.encounters[id]) continue;
    const { weak_if, on_win, phase2, elite, boss, ...rest } = base;
    const f = g.faktoren ?? {};
    content.encounters[id] = {
      ...rest, name: g.name, intro: g.intro, sheet: g.sheet, elite: true, benannt: true, zone: zonen[0],
      hp: Math.round(base.hp * (f.hp ?? 1.5)),
      attacks: (base.attacks ?? []).map((a) => ({ ...a, damage: Math.max(1, Math.round(a.damage * (f.damage ?? 1.5))), nerves: Math.max(a.nerves ?? 0, g.nerven_schaden ?? 0) })),
      on_win: { sets_flags: g.on_win?.set_flags ?? [`${id}_besiegt`] }, win_text: g.win_text ?? `${g.name} fällt.`,
      eigenheit: g.eigenheit, schwaeche: g.schwaeche,
    };
    const l = content.loot[g.grundlage] ?? {};
    content.loot[id] = { ...l, money: Array.isArray(l.money) ? l.money.map((n) => n * 3) : typeof l.money === 'number' ? l.money * 3 : [30, 60], drops: [...(g.loot?.drops ?? []).filter((d) => content.items[d.item]), ...(l.drops ?? [])] };
    if (bn.bestiaryTexts[id]) content.bestiaryTexts[id] = bn.bestiaryTexts[id];
    zonen.forEach((z, i) => {
      const m = content.maps[z];
      const tile = freeTile(m, (m.roamers ?? []).filter((r) => r.bn).length + i * 0);
      if (tile) content.maps[z] = { ...m, roamers: [...(m.roamers ?? []), { id: `${z}_${id}`, encounter: id, tile, bn: true }] };
    });
  }
}
