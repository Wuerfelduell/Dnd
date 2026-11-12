// Codex DH: Die Nebelseite (Seb, 2026-11-12: „alle restlichen Codex-Sachen einbauen“).
// Neun Spiegelkarten (Kettlegate, Wexmoor, Dunscar je drei); Calderwick/Briarholt/Varrowmouth bleiben draußen.
// Übergang: verborgene Stelle auf der Originalkarte (nur in der Geistsicht zu sehen), nachts und ab Sequenz 5.
// Drüben: Kopie der Originalkarte ohne Figuren und Türen, dichter Nebel, ein stilles Wesen mit Fragen (3 je Spieltag
// vereinfacht zu: alle Fragen frei), zwei einmalige Funde, ein Wesen als Gegner. Alle 20 s +1 Unruhe (core/Nebelseite.js).
// Zurück nur am selben Übergang.
export const NS_FILES = ['karten', 'stilles_wesen', 'wesen', 'uebergaenge', 'gerede', 'lesestuecke', 'zeitung'];
export const NS_STAEDTE = ['kettlegate', 'wexmoor', 'dunscar'];
export const NS_WESEN = ['nsw_umrissgaenger', 'nsw_lampenfresser', 'nsw_rueckwaertsgeher'];
/** Gegnerstärke: Sequenz 5 erwartet (Leben/Schaden der Vorlage sind Kapitel-1-Werte). */
const STAERKE = { kettlegate: [5, 2.5], wexmoor: [7, 3], dunscar: [14, 5] };
const WALK = /[.,=wgpcsP]/;

const frei = (m, used) => (x, y) => WALK.test(m.rows[y]?.[x] ?? '') && !used.has(`${x},${y}`);
/** Nächste freie Kachel um (x, y), spiralförmig. */
function naechste(m, [x, y], used) {
  const ok = frei(m, used);
  for (let r = 0; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    if (ok(x + dx, y + dy)) { used.add(`${x + dx},${y + dy}`); return [x + dx, y + dy]; }
  }
  return null;
}

export function nebelseitePack({ karten, stilles_wesen, wesen, uebergaenge, gerede, lesestuecke, zeitung }) {
  const list = karten.filter((k) => NS_STAEDTE.includes(k.city));
  const items = {};
  for (const k of list) for (const it of k.items) items[it.id] = { name: it.name, kind: 'key', nebelseite: true, weight: 0, price: 0, desc: `${it.description} (Von der Nebelseite. ${it.effect_proposal?.text ?? ''})` };
  const encounters = {};
  const city = Object.fromEntries(list.map((k) => [k.id, k.city]));
  for (const k of list) for (const e of k.enemy_spawns) {
    const base = wesen.encounters[e.id];
    if (!base) continue;
    const [hp, dmg] = STAERKE[k.city];
    const id = `${e.id}_${k.city}`;
    encounters[id] ??= { ...base, sheet: `enemy_${e.id}`, zone: undefined, hp: Math.ceil(base.hp * hp), min_seq: 5, nebelseite: true,
      attacks: base.attacks.map((a) => (a.damage ? { ...a, damage: Math.ceil(a.damage * dmg) } : a)) };
    delete encounters[id].mechanic_proposal;
    delete encounters[id].bestiary;
  }
  const dialogues = {};
  const npcs = {};
  for (const s of stilles_wesen.filter((x) => NS_STAEDTE.includes(x.city))) {
    const nodes = { start: { text: `${s.appearance} Die Stimme ist ${s.voice}.`, choices: [...s.questions.slice(0, 12).map((q, i) => ({ text: q.question, next: `a${i}` })), { text: 'Schweigen und gehen.' }] } };
    s.questions.slice(0, 12).forEach((q, i) => { nodes[`a${i}`] = { text: q.answer, choices: [{ text: 'Noch etwas fragen.', next: 'start' }, { text: 'Gehen.' }] }; });
    dialogues[s.id] = { start: 'start', nodes };
    npcs[s.id] = { name: 'Das stille Wesen', role: 'Nebelseite', palette: { coat: '#48556b', hat: '#303446', skin: '#91a2ad', hair: '#303446', legs: '#303446' }, dialogue: s.id, sheet: 'nsw_still' };
  }
  return {
    name: 'nebelseite', items, encounters, dialogues, npcs,
    nebelseite: { karten: list, uebergaenge: uebergaenge.filter((u) => list.some((k) => k.id === u.target_map)), still: stilles_wesen.filter((x) => NS_STAEDTE.includes(x.city)), city },
    zeitung: zeitung.filter((z) => NS_STAEDTE.includes(z.city)).map(({ city: c, ...z }) => ({ id: z.id, title: z.title, text: z.text, requires_flags: z.requires_flags })),
  };
}

/** Spiegelkarten bauen und die Übergänge auf die Originalkarten setzen. Läuft am Ende von buildContent. */
export function applyNebelseite(content) {
  const ns = content.nebelseite;
  if (!ns) return content;
  for (const k of ns.karten) {
    const orig = content.maps[k.original_map];
    if (!orig) continue;
    const u = ns.uebergaenge.find((x) => x.target_map === k.id);
    const usedO = new Set([...(orig.npcs ?? []), ...(orig.interactables ?? [])].filter((o) => o.tile).map((o) => `${o.tile}`));
    const spawnO = orig.spawns?.default ?? Object.values(orig.spawns ?? {})[0];
    const tor = naechste(orig, [spawnO[0] + 3, spawnO[1]], usedO);
    if (!tor) continue;
    const back = `ns_rueck_${k.id}`;
    const m = { id: k.id, name: `Nebelseite: ${orig.name}`, city: orig.city, tiles: orig.tiles, rows: orig.rows, nebelseite: true,
      ambient: { night: 0.82, fog: 0.5 }, spawns: { default: tor }, npcs: [], interactables: [], decor: [], roamers: [] };
    const used = new Set([`${tor}`]);
    m.interactables.push({ id: `${k.id}_rueckweg`, kind: 'door', tile: tor, to: orig.id, spawn: back, prompt: 'Durch den Übergang zurück nach diesseits', marker: true, reach: 22, label: 'Rückweg' });
    const still = ns.still.find((s) => s.map === k.id);
    if (still) { const t = naechste(m, [tor[0] + 2, tor[1] - 2], used); if (t) m.npcs.push({ id: still.id, tile: t }); }
    const fund = naechste(m, k.geometry?.find_location?.tile ?? [tor[0] + 6, tor[1]], used) ?? naechste(m, [tor[0] + 5, tor[1]], used);
    k.items.forEach((it, i) => {
      const t = i === 0 ? fund : naechste(m, [fund[0] + 3, fund[1] + 1], used);
      if (!t) return;
      m.interactables.push({ id: `${it.id}_fund`, kind: 'read', tile: t, title: it.name, text: it.description, prompt: `${it.name} aufheben`, marker: true, done_flag: `${it.id}_gefunden`,
        effects: { gives_items: { [it.id]: 1 } }, visible_if: { hide_if_flags: [`${it.id}_gefunden`] } });
    });
    for (const e of k.enemy_spawns) {
      const id = `${e.id}_${k.city}`;
      if (!content.encounters[id]) continue;
      const t = naechste(m, e.tile, used);
      if (t && Math.abs(t[0] - tor[0]) + Math.abs(t[1] - tor[1]) >= 6) m.roamers.push({ encounter: id, tile: t });
    }
    content.maps[k.id] = m;
    content.maps[orig.id] = { ...orig, spawns: { ...orig.spawns, [back]: tor },
      interactables: [...orig.interactables, { id: `${k.id}_uebergang`, kind: 'nebel', label: 'Dünne Stelle', tile: tor, to: k.id, spawn: 'default', hidden: true, marker: true, reach: 20,
        prompt: u?.kind === 'wasser' ? 'In das stille Wasser treten' : u?.kind === 'nebelbank' ? 'In die Nebelbank gehen' : 'Durch den Spiegel treten',
        lock: { requires_flags: ['ns_nacht'], requires_seq: 5, text: u?.first_entry_text ? 'Hier ist die Welt dünn. Aber noch hält sie.' : 'Hier ist die Welt dünn.', footer: 'Nur nachts, mit Geistsicht und ab Sequenz 5 kommt man hinüber.' } }] };
  }
  return content;
}
