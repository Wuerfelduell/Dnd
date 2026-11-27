/**
 * Kapitel 7: Varrowmouth, die Stadt, die das Meer vergaß (Seb 2026-11-27: nach dem Thron, Anreise ab Briarholt).
 * Codex-Entwürfe CT (Hauptakte), CU (Orte), CX (Figuren); die internen Flags behalten die Codex-Namen `k6_*`.
 *
 * Etappe 1: Anreise vom Bügelraum (nach `kapitel6_done` und einem Briarholt-Ende), vier Karten mit eigenen Grundrissen
 * (tools/vm/karten.py: Zollhafen, Stegviertel, Schlickgassen, Oberstraße), die Menschen der Stadt, Akt I der Hauptakte,
 * drei Läden, Schlafplatz, Kessel und Lager. Die Wege zu Wrackfeld, Leuchtbank, Registerkeller und Grenzzaun sind noch zu.
 * Hauptgespräche (CT) hängen als Option „Zur Sache.“ an den Alltagsgesprächen (CX) derselben Figur (sprecher_bindung.json).
 */
import { freieKachel } from './calderwickStory.js';

export const VM_CITY = 'varrowmouth';
const WALK = new Set([...'.,=']);
export const VM_ANKUNFT = 'k6_arrived';
/** Erst nach dem Thron (Kapitel 6) und einem der vier Briarholt-Enden. */
export const VM_VORAUS = 'kapitel6_done';
export const VM_FILES = { k6_orte: ['city', 'items', 'vm_karten'], k6_akte: ['case', 'quests', 'dialogues', 'faelle', 'anreise', 'sprecher_bindung', 'platzierung'], k6_figuren: ['npcs', 'dialogues'] };

/** Karte → Name, Kachelthema (manifest-varrowmouth1), Licht. */
const KARTEN = {
  vm_zollhafen: { name: 'Zollhafen', tiles: 'vm_hafen', fog: 0.2 },
  vm_stegviertel: { name: 'Stegviertel', tiles: 'vm_stege', fog: 0.25 },
  vm_schlickgassen: { name: 'Schlickgassen', tiles: 'vm_schlick', fog: 0.3 },
  vm_oberstrasse: { name: 'Oberstraße', tiles: 'vm_oberstrasse', fog: 0.12 },
};
/** Etappe 1 zeigt nur Akt I (und was davor liegt); spätere Akte kommen mit Karten und Gegnern. */
const AKT1 = (p) => !(p.visible_if?.requires_flags ?? []).some((f) => /^k6_akt[1-5]_done$/.test(f) || f.startsWith('won_') || f.startsWith('gezeit_') || f === 'k6_done');

/** Wo die Fundstellen und Stationen der Akte ungefähr liegen (Anker aus vm_karten.json). */
const FUND_ANKER = { k6_11: 'zollschalter', k6_12: 'kai_ost', k6_13: 'markt_ost', k6_14: 'kai_west', k6_bilanz1: 'lotsenkammer', k6_szene_ankunft: 'faehre', k6_szene_wartungsgang: 'kreuzung', k6_anreise_koop: 'faehre' };

/** Zwischenszenen bekommen lesbare Namen statt „Zwischenszene: ankunft“. */
const SZENE_TITEL = { k6_szene_ankunft: 'Die Pegeluhr über dem Anleger', k6_szene_wartungsgang: 'Der trockene Wartungsgang' };

/** Figuren: Karte, Anker, Sichtbarkeit. Tam steht erst am Hafen, nach dem Schmuggelweg im Stegviertel. */
const FIGUREN = [
  ['vmn_tam_verrin', 'vm_zollhafen', 'kai_mitte', { hide_if_flags: ['k6_tam_weg'] }],
  ['vmn_tam_verrin', 'vm_stegviertel', 'lotsenkammer', { requires_flags: ['k6_tam_weg'] }],
  ['vmn_zollschreiber', 'vm_zollhafen', 'zollschalter'],
  ['vmn_kantinenwirt', 'vm_zollhafen', 'kantine'],
  ['vmn_faehrmann', 'vm_zollhafen', 'faehre'],
  ['vmn_zollknecht', 'vm_zollhafen', 'kai_west'],
  ['vmn_mechaniker', 'vm_zollhafen', 'pegeluhr'],
  ['vmn_zeuge_kettlegate', 'vm_zollhafen', 'kai_ost'],
  ['vmn_fischerin', 'vm_stegviertel', 'markt'],
  ['vmn_taucherin', 'vm_stegviertel', 'taucherhaus'],
  ['vmn_kurgast', 'vm_stegviertel', 'markt_ost'],
  ['vmn_mutter', 'vm_schlickgassen', 'nells_haus'],
  ['vmn_nell_quarrie', 'vm_schlickgassen', 'nells_haus', { requires_flags: ['k6_akt1_done'] }],
  ['vmn_apothekerin', 'vm_oberstrasse', 'apotheke'],
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => [`vmn_rat_${n}`, 'vm_oberstrasse', n < 4 ? 'rat_west' : n === 4 ? 'rat' : 'rat_ost', { requires_flags: ['k6_akt2_done'] }]), // der Pegelrat tagt erst ab Akt III
];

/** Läden (CU city.json), Preise auf Kapitel-7-Niveau. */
export const VM_LAEDEN = {
  vm_fischerin: { npc: 'vmn_fischerin', title: 'Sennicks Stegmarkt', greeting: 'Was das Wasser hergibt, solange es das noch tut.',
    stock: [['vmi_trockenfisch', 180], ['vmi_schlicksohlen', 1400], ['vmi_lotsenmarke', 300], ['verband', 260]] },
  vm_kantine: { npc: 'vmn_kantinenwirt', title: 'Zollhaus-Kantine', greeting: 'Tee gibt es immer. Den Rest nur, wenn der Zug Kohlen gebracht hat.',
    stock: [['vmi_zollkantinen_tee', 240], ['vmi_gezeitenkalender', 250], ['riechsalz', 520], ['tonikum', 600]] },
  vm_apotheke: { npc: 'vmn_apothekerin', title: 'Reederei-Apotheke', greeting: 'Die Reeder zahlen für das Beste. Sie zahlen heute auch dafür.',
    stock: [['vmi_reeder_tinktur', 650], ['vmi_salzlaterne', 1000], ['vmi_pegelglocke', 900], ['laeutersalz', 1100]] },
};
/** Wirkungen der Codex-Vorschläge (CU items.json): Essen und Tee heilen auf Kapitel-7-Niveau. */
const ITEM_WIRKUNG = {
  vmi_trockenfisch: { kind: 'consumable', heal: 160, desc: 'Salzig, zäh, sättigend. Stellt 160 Leben wieder her.' },
  vmi_zollkantinen_tee: { kind: 'consumable', composure: 30, desc: 'Schwarz wie Hafenwasser. Stellt 30 Nerven wieder her.' },
  vmi_reeder_tinktur: { kind: 'consumable', heal: 420, desc: 'Was die Reeder ihren Kapitänen mitgeben. Stellt 420 Leben wieder her.' },
};

const TUEREN = {
  vm_zollhafen: [['tuer_oberstrasse', 'vm_oberstrasse', 'von_zollhafen', 'Treppe zur Oberstraße'], ['tuer_stegviertel', 'vm_stegviertel', 'von_zollhafen', 'Stege ins Stegviertel']],
  vm_stegviertel: [['tuer_zollhafen', 'vm_zollhafen', 'von_stegviertel', 'Zum Zollhafen'], ['tuer_schlickgassen', 'vm_schlickgassen', 'von_stegviertel', 'Leiter hinab in die Schlickgassen']],
  vm_schlickgassen: [['tuer_stegviertel', 'vm_stegviertel', 'von_schlickgassen', 'Leiter hinauf ins Stegviertel']],
  vm_oberstrasse: [['tuer_zollhafen', 'vm_zollhafen', 'von_oberstrasse', 'Treppe zum Zollhafen']],
};
/** Noch verschlossene Wege (spätere Etappen). */
const ZU = {
  vm_zollhafen: [['bootssteg', 'Bootssteg zur Leuchtbank', 'Draußen im Nebel blinkt das alte Leuchtfeuer. Ohne Lotsin fährt von hier niemand hinaus, und Tam hat gerade anderes zu tun.']],
  vm_stegviertel: [['steg_ost', 'Steg zum Wrackfeld', 'Hinter dem letzten Pfahl liegt das Wrackfeld. Die Leute vom Steg schütteln den Kopf: Wer dorthin will, braucht einen Grund und die richtige Ebbe.']],
  vm_oberstrasse: [
    ['keller', 'Kellertür des Ratsgebäudes', 'Die Tür ist versiegelt. Durch die Ritze riecht es nach nassem Papier, viel nassem Papier.'],
    ['grenze', 'Weg zum Grenzzaun', 'Ein Zollknecht verstellt dir den Weg. „Am Zaun hat niemand etwas verloren, der noch einen Namen hat.“'],
  ],
};

/** Varrowmouth als Paket für buildContent. `f` enthält je Ordner die JSON-Dateien (VM_FILES). */
export function varrowmouthPack(f) {
  const { city: cu, items: cuItems, vm_karten: plan } = f.k6_orte;
  const ct = f.k6_akte;
  const cx = f.k6_figuren;

  // Karten
  const maps = Object.entries(KARTEN).map(([id, k]) => ({
    id, name: k.name, city: VM_CITY, tiles: k.tiles, outdoor: true, rows: plan[id].rows, spawns: plan[id].spawns,
    ambient: { night: 0.45, fog: k.fog }, lights: [{ tile: plan[id].spawns.default, radius: 64, intensity: 0.6, color: '#e6c58a' }],
    npcs: [], interactables: [],
  }));
  const map = Object.fromEntries(maps.map((m) => [m.id, m]));
  const anker = (m, a) => plan[m].anker[a] ?? plan[m].spawns.default;
  // Freie Kachel nahe am Anker, mit einem Feld Abstand zu allem anderen (Spawns, Türen, Figuren, Fundstellen)
  const platz = (m, a) => {
    const k = map[m];
    const [ax, ay] = anker(m, a);
    const belegt = [...k.npcs, ...k.interactables].map((o) => o.tile).concat(Object.values(k.spawns));
    const frei = (x, y) => WALK.has(k.rows[y]?.[x]) && !belegt.some(([bx, by]) => Math.abs(bx - x) <= 1 && Math.abs(by - y) <= 1);
    let best = null;
    k.rows.forEach((row, y) => [...row].forEach((_, x) => {
      if (x < 1 || y < 1 || !frei(x, y)) return;
      const d = Math.abs(x - ax) + Math.abs(y - ay);
      if (!best || d < best[2]) best = [x, y, d];
    }));
    return best ? [best[0], best[1]] : freieKachel(k, { near: [ax, ay] }) ?? [ax, ay];
  };
  for (const [m, list] of Object.entries(TUEREN)) {
    for (const [a, to, spawn, prompt] of list) {
      // Ins Stegviertel kommt man erst über Tams Schmuggelweg; vorher hält das Drehkreuz
      const zoll = m === 'vm_zollhafen' && to === 'vm_stegviertel';
      map[m].interactables.push({ id: `${m}_${a}`, kind: 'door', tile: anker(m, a), to, spawn, prompt, visible_if: { requires_flags: [VM_ANKUNFT, ...(zoll ? ['k6_tam_weg'] : [])] } });
      if (zoll) map[m].interactables.push({ id: `${m}_drehkreuz`, kind: 'read', tile: anker(m, a), prompt: 'Drehkreuz zum Stegviertel', title: 'Drehkreuz', marker: false,
        text: 'Das Drehkreuz verlangt einen gestempelten Eintrag. Deiner liegt beim Zoll, aber nicht in deiner Hand. Vielleicht kennt die Lotsin am Kai einen anderen Weg.', visible_if: { requires_flags: [VM_ANKUNFT], hide_if_flags: ['k6_tam_weg'] } });
    }
  }
  for (const [m, list] of Object.entries(ZU)) {
    for (const [a, title, text] of list) map[m].interactables.push({ id: `${m}_${a}_zu`, kind: 'read', tile: platz(m, a), prompt: title, title, text, marker: false });
  }
  // Schlafen, Kessel, Lager (keine Rückkehr: alles Nötige muss hier sein)
  map.vm_stegviertel.interactables.push(
    { id: 'vm_koje', kind: 'rest', tile: platz('vm_stegviertel', 'lotsenkammer'), prompt: 'In Tams Lotsenkoje schlafen', marker: false, title: 'Tams Lotsenkammer', text: 'Die Koje schaukelt mit jeder Welle. Unten rauscht das Wasser, oben knarren die Planken. Du schläfst trotzdem.', visible_if: { requires_flags: ['k6_tam_weg'] } },
    { id: 'vm_kessel', kind: 'brew', tile: platz('vm_stegviertel', 'nordhaus'), prompt: 'Am Kesselofen des Pfahlhauses brauen', marker: false });
  map.vm_oberstrasse.interactables.push({ id: 'vm_archiv_lager', kind: 'storage', tile: platz('vm_oberstrasse', 'archiv'), prompt: 'Altes Zollarchiv (Lager)', store: 'buero', marker: false });

  // Figuren und Gespräche
  const sheetFix = ({ sheet, cx: _meta, ...n }) => ({ ...n, city: VM_CITY });
  const npcs = Object.fromEntries(Object.entries(cx.npcs).map(([id, n]) => [id, sheetFix(n)]));
  // Kämpfe der späteren Akte (Wrackmutter, Leuchtfeuerwächter, Pegelherrin) kommen mit den CZ-Gegnern
  const spaeter = (d) => JSON.stringify(d).includes('"encounter"');
  const dialogues = Object.fromEntries(Object.entries(ct.dialogues).filter(([, d]) => !spaeter(d)));
  for (const [id, d] of Object.entries(cx.dialogues)) dialogues[id] = d;
  // Hauptgespräch als Option am Alltagsgespräch (CT sprecher_bindung): jede Einstiegsstelle bekommt „Zur Sache.“
  const vorne = (d, choice) => {
    const starts = Array.isArray(d.start) ? d.start.map((s) => s.node) : [d.start];
    const nodes = { ...d.nodes };
    for (const s of new Set(starts)) nodes[s] = { ...nodes[s], choices: [choice, ...(nodes[s].choices ?? [])] };
    return { ...d, nodes };
  };
  const gebunden = new Set();
  for (const b of ct.sprecher_bindung) {
    const npc = npcs[b.npc];
    const main = dialogues[b.dialogue];
    if (!npc || !main) continue;
    const merged = vorne(dialogues[npc.dialogue], { text: 'Zur Sache.', next: main.start, requires_flags: b.requires_flags, hide_if_flags: b.hide_if_flags });
    dialogues[npc.dialogue] = { ...merged, nodes: { ...merged.nodes, ...main.nodes } };
    gebunden.add(b.dialogue);
  }
  const merchants = {};
  for (const [id, l] of Object.entries(VM_LAEDEN)) {
    merchants[id] = { name: npcs[l.npc].name, title: l.title, greeting: l.greeting, stock: l.stock.map(([item, price]) => ({ item, price })) };
    dialogues[npcs[l.npc].dialogue] = vorne(dialogues[npcs[l.npc].dialogue], { text: 'Ware ansehen.', shop: id });
  }
  for (const [id, m, a, vis] of FIGUREN) {
    map[m].npcs.push({ id, tile: platz(m, a), facing: 'down', visible_if: { requires_flags: [VM_ANKUNFT, ...(vis?.requires_flags ?? [])], ...(vis?.hide_if_flags ? { hide_if_flags: vis.hide_if_flags } : {}) } });
  }

  // Akt I: Fundstellen und Stationen (CT platzierung, Positionen neu auf den eigenen Grundrissen)
  const platzierung = [];
  for (const p of ct.platzierung ?? []) {
    if (!p.interactable || !map[p.map] || !AKT1(p) || gebunden.has(p.interactable?.dialogue)) continue;
    const key = Object.keys(FUND_ANKER).find((k) => p.interactable.id.startsWith(k));
    if (!key) continue;
    const tile = platz(p.map, FUND_ANKER[key]);
    map[p.map].interactables.push({ ...p.interactable, ...(SZENE_TITEL[key] ? { title: SZENE_TITEL[key], prompt: SZENE_TITEL[key] } : {}), tile, ...(p.visible_if ? { visible_if: p.visible_if } : {}) });
  }
  // Bilanz von Akt I: Akt II öffnet erst die nächste Etappe
  const b1 = dialogues.k6_bilanz1;
  if (b1) {
    const { start_quests: _s, ...ja } = b1.nodes.k6_bilanz1_ja;
    dialogues.k6_bilanz1 = { ...b1, nodes: { ...b1.nodes, k6_bilanz1_ja: { ...ja, text: `${ja.text}\n\nNell aus den Schlickgassen, sagt Tam, wisse mehr über das Vergessen. Aber nicht heute: Das Wasser steigt.` } } };
  }

  // Gespräche, die spätere Akte starten oder abschließen (Bilanzen II–V, Enden), kommen mit ihren Karten
  for (const [id, d] of Object.entries(dialogues)) if (/"k6_akt[2-5]"|"ending"/.test(JSON.stringify(d))) delete dialogues[id];
  for (const n of Object.values(map)) n.interactables = n.interactables.filter((i) => i.kind !== 'dialogue' || dialogues[i.dialogue]);

  // Anreise: vier Briarholt-Herkünfte (CT anreise.json) am Bügelraum, erst nach dem Thron
  for (const a of ct.anreise.filter((x) => x.map === 'bh_buegelraum')) {
    const vis = { ...a.visible_if, requires_flags: [...new Set([...(a.visible_if?.requires_flags ?? []), VM_VORAUS])] };
    platzierung.push({ map: a.map, tile: [17, 9], interactable: { ...a.interactable, title: 'Küstenbahn nach Varrowmouth', marker: true }, visible_if: vis });
    const d = dialogues[a.interactable.dialogue];
    const s = d.nodes[d.start];
    dialogues[a.interactable.dialogue] = { ...d, nodes: { ...d.nodes, [d.start]: { ...s,
      text: `Kapitel 7. Der Thron hat dich entlassen, nicht verbrannt. Oben ruft dich nichts mehr, unten wartet die Küste.\n\n${s.text}`,
      choices: s.choices.map((c) => (c.requires_flags ? { ...c, requires_flags: [...c.requires_flags, VM_VORAUS] } : c)) } } };
  }

  const items = {};
  for (const [id, it] of Object.entries(cuItems)) {
    const { wirkungsvorschlag: _w, ...rest } = it;
    items[id] = { ...rest, kind: rest.kind === 'quest' || rest.kind === 'misc' ? 'key' : rest.kind, ...(ITEM_WIRKUNG[id] ?? {}) };
  }
  const pins = { vm_zollhafen: [150, 112], vm_stegviertel: [312, 118], vm_schlickgassen: [228, 206], vm_oberstrasse: [92, 34] };
  const travel = maps.map((m) => ({ map: m.id, spawn: 'default', name: m.name, desc: cu.pins.find((p) => p.map === m.id) ? cu.desc : '', city: VM_CITY,
    requires_flags: [VM_ANKUNFT, ...(m.id === 'vm_stegviertel' || m.id === 'vm_schlickgassen' ? ['k6_tam_weg'] : [])] }));
  for (const t of travel) t.desc = { vm_zollhafen: 'Zollhaus, Pegeluhr und Fähranleger.', vm_stegviertel: 'Pfahlbauten, Stegmarkt und Tams Lotsenkammer.', vm_schlickgassen: 'Bei Ebbe begehbar. Die Ärmsten wohnen am tiefsten.', vm_oberstrasse: 'Trocken, teuer, Sitz des Pegelrats.' }[t.map];

  return {
    name: 'varrowmouth', maps, travel, city: { id: VM_CITY, title: 'Stadtkarte von Varrowmouth', map_image: 'ui/vm_stadtkarte_ebbe.png', fog_image: 'ui/vm_nebel.png', pins },
    npcs, dialogues, items, quests: { k6_akt1: ct.quests.k6_akt1 }, case: { facts: ct.case.facts, clues: ct.case.clues, deductions: ct.case.deductions }, faelle: ct.faelle, platzierung, haendler: { merchants },
  };
}
