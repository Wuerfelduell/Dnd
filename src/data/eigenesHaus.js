// Codex DG: Das eigene Haus (Seb, 2026-11-12: „alle restlichen Codex-Sachen einbauen“).
// Vereinfachter Einbau ohne Möbel-Editor: Maklerin Leda Voss steht in Wexmoor (Oberstadt) und Dunscar (Arbeiterbogen).
// Man kauft einmal (haus_owned); der Hausrat reist mit, jede Stadt hat ihr eigenes Haus mit denselben Möbeln.
// Möbel kauft man im Katalog der Maklerin, sie stehen dann an festen Plätzen (Deko mit visible_if requires_items).
// Trophäen besiegter Bosse (Kapitel 1–3) stehen im Arbeitszimmer und Keller (Flag troph_<id>, core/Haus.js).
// Bett (Schlafen), Hauslager (Lager „haus“), jeden Abend höchstens ein Gast aus der Stadt (gaeste.json).
// Kettlegate, Calderwick, Briarholt und Varrowmouth bleiben draußen (kein Zurück bzw. wird gerade neu gebaut).
export const HAUS_FILES = ['haus', 'gaeste', 'gedanken', 'gerede', 'zeitung'];
export const HAUS_STAEDTE = {
  wexmoor: { map: 'wx_oberstadt', door: [2, 2], spawn: [2, 4], maklerin: [4, 4] },
  dunscar: { map: 'ds_arbeiterbogen', door: [29, 4], spawn: [29, 5], maklerin: [31, 6] }, // freies Haus der Häuserzeile (dunscarKulisse RASTER.haeuser)
};
export const HAUS_PREIS = 1500;
/** Möbel-IDs (Icons in items/ aus dem Atlas haus_stuecke geschnitten). */
export const HAUS_MOEBEL = ['haus_sessel', 'haus_lesepult', 'haus_kraeuterbrett', 'haus_landkarte', 'haus_pegelglocke', 'haus_grammophon', 'haus_aktenschrank', 'haus_waschzuber', 'haus_ofen', 'haus_vorhang', 'haus_spiegel', 'haus_weinregal', 'haus_werkbank', 'haus_teekessel', 'haus_lampe_tisch', 'haus_lampe_stand', 'haus_lampe_wand', 'haus_bildrahmen', 'haus_schachbrett', 'haus_fernrohr', 'haus_truhe', 'haus_reisekoffer', 'haus_stiefelbank', 'haus_nachttisch', 'haus_bett_p1', 'haus_bett_p2', 'haus_schreibtisch_p1', 'haus_schreibtisch_p2', 'haus_buecherstapel', 'haus_globus', 'haus_uhr', 'haus_vitrine', 'haus_teppich_lang', 'haus_teppich_rund', 'haus_teppich_schmal', 'haus_pflanze_farn', 'haus_pflanze_efeu', 'haus_pflanze_bluete', 'haus_moorlampe', 'haus_registerseite'];
/** Möbelpreise: Katalogpreis ×4 (Wexmoor-Niveau), Stücke ohne Kaufpreis 120. */
const MOEBEL_MULT = 4;
const MOEBEL_OHNE_PREIS = 120;
/** Trophäen nur für Bosse bis Kapitel 3 (der Rest gehört zu Calderwick und später). */
const TROPH_RAUS = /^troph_(vg_|cwa_|bha_)/;
const FRAME = (region) => (region.y / 32) * 16 + region.x / 32;

/** Feste Plätze in den vier Räumen (x, y), Bodenstücke unten in der Reihe, Wandstücke an der oberen Wand. */
function plaetze() {
  const out = [];
  const rooms = [[1, 1, 14, 8], [16, 1, 15, 8], [1, 10, 14, 9], [16, 10, 15, 9]];
  for (const [rx, ry, w, h] of rooms) {
    for (const dy of [2, 5, h - 1]) for (let dx = 1; dx < w - 1; dx += 3) {
      const x = rx + dx;
      const y = ry + dy;
      if ((x >= 6 && x <= 9 && y >= 16) || (x >= 6 && x <= 9 && (y === 8 || y === 10)) || (x >= 22 && x <= 25 && (y === 8 || y === 10)) || x === 14 || x === 15 || x === 16) continue;
      out.push([x, y]);
    }
  }
  return out;
}

export function eigenesHausPack({ haus, gaeste, gedanken, gerede, zeitung }, manifest) {
  const stueck = manifest.assets.find((a) => a.id === 'haus_stuecke').regions;
  const trophRegion = manifest.assets.find((a) => a.id === 'haus_trophaeen').regions;
  const items = {};
  for (const f of haus.furniture) {
    const p = f.source.price_schilling;
    items[f.id] = { name: f.name, kind: 'key', moebel: true, weight: 0, price: p ? p * MOEBEL_MULT : MOEBEL_OHNE_PREIS, desc: `Möbel fürs eigene Haus. ${f.inspect}` };
  }
  const p = haus.purchase;
  const npcs = { haus_maklerin: { name: p.name, role: 'Maklerin, vermittelt Häuser in jeder Stadt', palette: { coat: '#4a4a5a', hat: '#2a2a30', skin: '#d8b090', hair: '#6a4a3a', legs: '#2a2a30' }, dialogue: 'haus_maklerin' } };
  const dialogues = {
    haus_maklerin: { start: [{ node: 'besitz', requires_flags: ['haus_owned'] }, { node: 'start' }], nodes: {
      start: { text: `${p.lines.slice(0, 6).join(' ')}\n\n„${HAUS_PREIS} Schilling, einmalig und schriftlich. Wenn Sie weiterziehen, gilt der Vertrag für unsere Häuser mit. Der Hausrat reist, die Wände wechseln.“`,
        choices: [{ text: `Das Haus kaufen (${HAUS_PREIS} Schilling).`, requires_money: HAUS_PREIS, next: 'kauf' }, { text: 'Ich überlege es mir noch.' }] },
      kauf: { text: `${p.lines.slice(9).join(' ')}\n\nDer Schlüssel gehört jetzt dir. Bett und Schreibtisch stehen schon drin. Die Tür ist gleich hier.`, takes_money: HAUS_PREIS, sets_flags: ['haus_owned'],
        gives_items: { haus_bett_p1: 1, haus_schreibtisch_p1: 1 }, choices: [{ text: 'Danke.' }] },
      besitz: { text: '„Ihr Hausrat ist angekommen, wie versprochen. Brauchen Sie noch etwas für die Räume?“', choices: [{ text: 'Den Möbelkatalog ansehen.', shop: 'haus_maklerin' }, { text: 'Danke, alles gut.' }] },
    } },
  };
  // Gäste: je Stadt die Figuren aus gaeste.json, die es im Spiel gibt
  const gast = (g) => {
    const nodes = {};
    for (const [k, n] of Object.entries(g.dialogue.nodes)) {
      nodes[k] = { text: n.lines.join(' '), ...(n.choices ? { choices: n.choices.map((c) => ({ text: c.text, next: c.next })) } : n.next ? { choices: [{ text: 'Weiter', next: n.next }] } : { choices: [{ text: 'Auf Wiedersehen.' }] }) };
      if (n.sets_flags) nodes[k].sets_flags = n.sets_flags;
      if (n.gift_once) { // Mitbringsel nur einmal
        nodes[k].choices = [{ text: 'Das Mitbringsel annehmen.', next: `${k}_gabe`, hide_if_flags: [n.gift_once.flag] }, { text: 'Auf Wiedersehen.' }];
        nodes[`${k}_gabe`] = { text: 'Du nimmst es dankend an.', gives_items: { [n.gift_once.item]: n.gift_once.count }, sets_flags: [n.gift_once.flag], choices: [{ text: 'Auf Wiedersehen.' }] };
      }
    }
    return { start: g.dialogue.start, nodes };
  };
  const guests = gaeste.guests.filter((g) => HAUS_STAEDTE[g.city]);
  for (const g of guests) dialogues[`haus_gast_${g.npc_id}`] = gast(g);
  const merchants = { haus_maklerin: { name: p.name, title: 'Möbelkatalog', greeting: 'Alles, was in vier Räume passt.', stock: haus.furniture.map((f) => ({ item: f.id, price: items[f.id].price })) } };
  // Karten: je Stadt ein Haus mit denselben Plätzen
  const spots = plaetze();
  const maps = haus.maps.filter((m) => HAUS_STAEDTE[m.city]).map((m) => {
    const s = HAUS_STAEDTE[m.city];
    const decor = [];
    haus.furniture.forEach((f, i) => {
      const r = stueck[f.sprite_region];
      const t = spots[i % spots.length];
      if (r) decor.push({ sprite: 'haus_stuecke', frame: FRAME(r), tile: t, offset: [8, 8], origin: [0.5, 1], alpha: 1, ysort: true, visible_if: { requires_items: [f.id] } });
    });
    haus.trophies.filter((t) => !TROPH_RAUS.test(t.id)).forEach((t, i) => {
      const r = trophRegion[t.sprite_region];
      const tile = spots[(haus.furniture.length + i) % spots.length];
      if (r) decor.push({ sprite: 'haus_trophaeen', frame: (r.y / 32) * 16 + r.x / 32, tile, offset: [8, 8], origin: [0.5, 1], alpha: 1, ysort: true, visible_if: { requires_flags: [t.id] } });
    });
    return {
      id: m.id, name: `Dein Haus in ${m.city === 'wexmoor' ? 'Wexmoor' : 'Dunscar'}`, city: m.city, tiles: 'b_interieur',
      ambient: { night: 0.6, fog: 0 }, spawns: { default: m.spawn },
      rows: m.rows.map((r) => r.replace(/#/g, 'I').replace(/\./g, 'w')),
      npcs: guests.filter((g) => g.city === m.city).map((g, i) => ({ id: g.npc_id, tile: [4 + i * 3, 4], dialogue: `haus_gast_${g.npc_id}`, visible_if: { requires_flags: [`haus_gast_${g.npc_id}`] } })),
      interactables: [
        { id: 'haus_ausgang', kind: 'door', tile: [m.spawn[0], m.spawn[1]], to: s.map, spawn: 'von_haus', prompt: 'Hinaus auf die Straße', marker: true, reach: 20 },
        { id: 'haus_bett', kind: 'rest', tile: [2, 12], sprite: 'cot', prompt: 'Im eigenen Bett schlafen', marker: false, title: 'Dein Bett', text: 'Die Matratze kennt dich schon. Draußen ist die Stadt fremd, hier drin nicht.' },
        { id: 'haus_lager', kind: 'storage', store: 'haus', store_title: 'Hauslager', tile: [27, 17], prompt: 'Das Hauslager öffnen', marker: false, reach: 24 },
      ],
      decor,
    };
  });
  const gedankenSolo = gedanken.solo.filter((g) => HAUS_STAEDTE[g.condition?.city]);
  return {
    name: 'eigenes_haus', items, npcs, dialogues, haendler: { merchants },
    haus: { maps, guests: guests.map((g) => ({ npc: g.npc_id, city: g.city })), gedanken: gedankenSolo, trophies: haus.trophies.filter((t) => !TROPH_RAUS.test(t.id)).map((t) => ({ id: t.id, won: t.encounter_ids, flags: t.unlock.backfill_any_flags ?? [] })) },
    zeitung: zeitung.filter((z) => !(z.requires_flags ?? []).some((f) => f === 'haus_umgezogen')).map(({ requires_package, ...z }) => z),
    gerede: { wexmoor: { wx_oberstadt: gerede.slice(0, 10).map((g) => ({ text: g.text, requires_flags: g.requires_flags })) }, dunscar: { ds_arbeiterbogen: gerede.slice(10, 20).map((g) => ({ text: g.text, requires_flags: g.requires_flags })) } },
  };
}

/** Häuser, Türen (nur mit Schlüssel) und die Maklerin auf den Stadtkarten. */
export function applyEigenesHaus(content) {
  const h = content.haus;
  if (!h) return content;
  for (const m of h.maps) content.maps[m.id] = m;
  for (const [city, s] of Object.entries(HAUS_STAEDTE)) {
    const m = content.maps[s.map];
    const house = h.maps.find((x) => x.city === city);
    if (!m || !house) continue;
    content.maps[s.map] = { ...m, spawns: { ...m.spawns, von_haus: s.spawn }, npcs: [...m.npcs, { id: 'haus_maklerin', tile: s.maklerin }],
      interactables: [...m.interactables, { id: 'haus_tuer', kind: 'door', tile: s.door, to: house.id, spawn: 'default', prompt: 'Dein Haus betreten', label: 'Dein Haus', marker: true, reach: 24, visible_if: { requires_flags: ['haus_owned'] } }] };
  }
  return content;
}
