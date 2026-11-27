/**
 * Kapitel 7: Varrowmouth, die Stadt, die das Meer vergaß (Seb 2026-11-27: nach dem Thron, Anreise ab Briarholt).
 * Codex-Entwürfe CT (Hauptakte), CU (Orte), CX (Figuren); die internen Flags behalten die Codex-Namen `k6_*`.
 *
 * Etappe 1: Anreise vom Bügelraum (nach `kapitel6_done` und einem Briarholt-Ende), vier Karten mit eigenen Grundrissen
 * (tools/vm/karten.py: Zollhafen, Stegviertel, Schlickgassen, Oberstraße), die Menschen der Stadt, Akt I der Hauptakte,
 * drei Läden, Schlafplatz, Kessel und Lager.
 * Etappe 2: Akt II (Ebbe). Das Wrackfeld (nur bei Ebbe über den Oststeg), die CZ-Gegner der Ebbe (Salzkruste, Tauwerk, Hafenkrähe)
 * auf Kapitel-7-Niveau (nach dem Thron, um Sequenz 2) und die Wrackmutter mit zwei Tauwerken. Leuchtbank, Registerkeller und Grenzzaun sind noch zu.
 * Hauptgespräche (CT) hängen als Option „Zur Sache.“ an den Alltagsgesprächen (CX) derselben Figur (sprecher_bindung.json).
 */
import { freieKachel } from './calderwickStory.js';

export const VM_CITY = 'varrowmouth';
const WALK = new Set([...'.,=']);
export const VM_ANKUNFT = 'k6_arrived';
/** Der Oststeg ins Wrackfeld trägt nur bei Ebbe, und erst wenn Tam einen Grund hat (Akt II). */
export const WRACK_OFFEN = ['k6_akt1_done', 'gezeit_ebbe'];
/** Erst nach dem Thron (Kapitel 6) und einem der vier Briarholt-Enden. */
export const VM_VORAUS = 'kapitel6_done';
export const VM_FILES = { k6_orte: ['city', 'items', 'vm_karten'], k6_akte: ['case', 'quests', 'dialogues', 'faelle', 'anreise', 'sprecher_bindung', 'platzierung'], k6_figuren: ['npcs', 'dialogues'], k6_gegner: ['encounters', 'bosses'] };

/** Karte → Name, Kachelthema (manifest-varrowmouth1), Licht. */
const KARTEN = {
  vm_zollhafen: { name: 'Zollhafen', tiles: 'vm_hafen', fog: 0.2 },
  vm_stegviertel: { name: 'Stegviertel', tiles: 'vm_stege', fog: 0.25 },
  vm_schlickgassen: { name: 'Schlickgassen', tiles: 'vm_schlick', fog: 0.3 },
  vm_oberstrasse: { name: 'Oberstraße', tiles: 'vm_oberstrasse', fog: 0.12 },
  vm_wrackfeld: { name: 'Wrackfeld', tiles: 'vm_wrack', fog: 0.35, danger: 7 },
};
/** Gebaut sind Akt I und II; Stationen der späteren Akte kommen mit ihren Karten und Gegnern. */
const BIS_AKT2 = (p) => !(p.visible_if?.requires_flags ?? []).some((f) => /^k6_akt[2-5]_done$/.test(f) || (f.startsWith('won_') && f !== 'won_wrackmutter') || f === 'k6_done');
/** Kämpfe, die schon da sind (die übrigen Bosse kommen mit Leuchtbank und Registerkeller). */
const KAEMPFE = new Set(['wrackmutter']);

/** Wo die Fundstellen und Stationen der Akte ungefähr liegen (Anker aus vm_karten.json). */
const FUND_ANKER = { k6_11: 'zollschalter', k6_12: 'kai_ost', k6_13: 'markt_ost', k6_14: 'kai_west', k6_bilanz1: 'lotsenkammer', k6_szene_ankunft: 'faehre', k6_szene_wartungsgang: 'kreuzung', k6_anreise_koop: 'faehre',
  k6_21: 'gasse_west', k6_22: 'rippen', k6_23: 'gasse_ost', k6_24: 'wrack_sued', k6_bilanz2: 'flickerei', k6_kampf_wrackmutter: 'wrack', k6_szene_kielraum: 'kielraum' };

/** Zwischenszenen bekommen lesbare Namen statt „Zwischenszene: ankunft“. */
const SZENE_TITEL = { k6_szene_ankunft: 'Die Pegeluhr über dem Anleger', k6_szene_wartungsgang: 'Der trockene Wartungsgang', k6_kampf_wrackmutter: 'Der Rumpf der Wrackmutter', k6_szene_kielraum: 'Der Kielraum' };

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
  vm_stegviertel: [['tuer_zollhafen', 'vm_zollhafen', 'von_stegviertel', 'Zum Zollhafen'], ['tuer_schlickgassen', 'vm_schlickgassen', 'von_stegviertel', 'Leiter hinab in die Schlickgassen'],
    ['steg_ost', 'vm_wrackfeld', 'von_stegviertel', 'Über den Oststeg ins Wrackfeld']],
  vm_wrackfeld: [['tuer_stegviertel', 'vm_stegviertel', 'von_wrackfeld', 'Über den Steg zurück ins Stegviertel']],
  vm_schlickgassen: [['tuer_stegviertel', 'vm_stegviertel', 'von_schlickgassen', 'Leiter hinauf ins Stegviertel']],
  vm_oberstrasse: [['tuer_zollhafen', 'vm_zollhafen', 'von_oberstrasse', 'Treppe zum Zollhafen']],
};
/** Noch verschlossene Wege (spätere Etappen). */
const ZU = {
  vm_zollhafen: [['bootssteg', 'Bootssteg zur Leuchtbank', 'Draußen im Nebel blinkt das alte Leuchtfeuer. Ohne Lotsin fährt von hier niemand hinaus, und Tam hat gerade anderes zu tun.']],
  vm_oberstrasse: [
    ['keller', 'Kellertür des Ratsgebäudes', 'Die Tür ist versiegelt. Durch die Ritze riecht es nach nassem Papier, viel nassem Papier.'],
    ['grenze', 'Weg zum Grenzzaun', 'Ein Zollknecht verstellt dir den Weg. „Am Zaun hat niemand etwas verloren, der noch einen Namen hat.“'],
  ],
};

// ---------------------------------------------------------------------------------------------------------------------
// Gegner (Codex CZ, Etappe 2: die Ebbe). Die CZ-Werte sind Entwürfe für Sequenz 4/3; hier kommt man nach dem Thron an,
// um Sequenz 2. Darum eigene Zahlen auf Höhe der zweiten Himmelsstadt (Heilige ~13.300, Engel ~18.200 Leben allein):
// gewöhnlich 9000, Elite 13.400, die Wrackmutter 21.700 (mit zwei Tauwerken als Begleitern, je zur Hälfte).
const schlag = (name, damage, hits, extra = {}) => ({ name, damage, hits, ...extra });
const BILANZ_GELD = 3000;
const VM_ART = { chapter: 5, occult: true, armor: 9, dmg_mult: 1, fleeable: true, tier_seq: 3, duo_hp_mult: 1.6, lose_money: 0,
  lose_to: { map: 'vm_stegviertel', spawn: 'default' }, lose_text: 'Tam zieht dich an einem Bootshaken aus dem Schlick und legt dich in ihre Koje. „Das Feld nimmt, was liegen bleibt“, sagt sie. „Diesmal nicht dich.“',
  flee_text: 'Du stapfst durch den Schlick davon. Es saugt an deinen Stiefeln, aber es hält dich nicht.' };
const VM_GEGNER = {
  vme_salzkruste: { name: 'Salzkruste', elite: 'Salzbootsmann', hp: 6400, armor: 11, intro: 'Was du für einen Haufen Salz gehalten hast, steht auf. Darunter war einmal ein Matrose. Die Kruste knirscht, als er die Faust hebt.',
    attacks: [schlag('Krustenfaust', 96, [900, 1500]), schlag('Salzstoß', 70, [700, 1100, 1500], { nerves: 8 }), { name: 'Neue Kruste', action: 'guard', value: 8, text: 'Salz wächst über die Risse: +8 Abwehr.' }],
    drops: [{ item: 'laeutersalz', chance: 0.6 }] },
  vme_tauwerk: { name: 'Tauwerk', elite: 'Ankertau', hp: 6000, armor: 6, intro: 'Ein Knäuel nasser Taue richtet sich auf. An den Enden hängen Haken, und die Haken suchen.',
    attacks: [schlag('Hakenhieb', 88, [800, 1300]), schlag('Fesselschlinge', 52, [600, 900, 1200, 1500], { nerves: 10 }), schlag('Ankerzug', 120, [1900], { unparryable: true })],
    drops: [{ item: 'verband', chance: 0.7 }] },
  vme_hafenkraehe: { name: 'Hafenkrähenschwarm', elite: 'Krähenkönigin', hp: 5600, armor: 4, intro: 'Ein Schwarm Krähen hebt von einem Mast ab, und alle sehen dich an. Sie haben gelernt, wer im Schlick stecken bleibt.',
    attacks: [schlag('Sturzflug', 64, [500, 800, 1100, 1400]), schlag('Vorratsraub', 40, [600, 1000], { nerves: 14 }), schlag('Hundert Schnäbel', 110, [1700])],
    drops: [{ item: 'riechsalz', chance: 0.6 }] },
};
const VM_ELITE = { hp: 1.5, dmg: 1.2, geld: 1.7 };
const VM_GELD = [700, 1100];

function vmGegner(cz) {
  const gegner = {};
  const loot = {};
  for (const [id, g] of Object.entries(VM_GEGNER)) {
    const base = { ...VM_ART, id, name: g.name, sheet: `enemy_${id}`, sprite: 'wild', zone: cz.encounters[id]?.spawn?.maps?.[0], hp: g.hp, armor: g.armor, intro: g.intro, attacks: g.attacks,
      on_win: {}, win_text: `${g.name} zerfällt im Schlick.` };
    gegner[id] = base;
    gegner[`${id}_elite`] = { ...base, id: `${id}_elite`, name: g.elite, win_text: `${g.elite} zerfällt im Schlick.`, elite: true, tier_seq: 2.5, hp: Math.round(g.hp * VM_ELITE.hp),
      attacks: g.attacks.map((a) => (a.damage ? { ...a, damage: Math.round(a.damage * VM_ELITE.dmg) } : a)) };
    loot[id] = { repeat: true, money: VM_GELD, drops: g.drops };
    loot[`${id}_elite`] = { repeat: true, money: VM_GELD.map((v) => Math.round(v * VM_ELITE.geld)), drops: g.drops.map((d) => ({ ...d, chance: 1 })) };
  }
  const w = cz.bosses.wrackmutter;
  gegner.wrackmutter = { ...VM_ART, id: 'wrackmutter', name: 'Die Wrackmutter', sheet: 'enemy_wrackmutter', sprite: 'wild', boss: true, fleeable: false, tier_seq: 2, hp: 15500, armor: 12, max_round_dmg: 0.14,
    begleiter: ['vme_tauwerk', 'vme_tauwerk'],
    intro: 'Der Rumpf atmet. Aus dem Kiel schiebt sich etwas, das aus Netzen, Tauen und den Namen auf alten Planken gemacht ist. Es hält eine Seite an die Brust gedrückt, wie eine Mutter ihr Kind. Zwei Taue lösen sich von ihr und kommen auf dich zu.',
    attacks: [schlag('Tauschlag', 124, [1000, 1600]), schlag('Rumpfstoß', 92, [700, 1200, 1700], { nerves: 10 }),
      { name: 'Kielruf', action: 'guard', value: 12, text: 'Die Wrackmutter ruft in den Kiel. Planken schließen sich um sie: +12 Abwehr.' }, schlag('Kielbruch', 178, [2300], { unparryable: true, nerves: 16 })],
    phase2: { meldung: 'Die Wrackmutter lässt die Seite los. Sie schwebt über dem Schlick, und die Netze greifen jetzt nach dir statt nach ihr.',
      attacks: [schlag('Netz aus Namen', 72, [500, 800, 1100, 1400, 1700], { nerves: 12 }), schlag('Tauschlag', 136, [900, 1400]), schlag('Das Feld nimmt', 210, [2400], { unparryable: true })] },
    on_win: { sets_flags: w.on_win?.sets_flags ?? [] },
    win_text: 'Die Netze hängen schlaff. Die Seite sinkt langsam in den Schlick, und du fängst sie, bevor er sie nimmt.',
    lose_text: VM_ART.lose_text };
  loot.wrackmutter = { money: [9000, 9000], drops: [{ item: 'vmi_registerseite', chance: 1 }] };
  return { gegner, loot };
}

/** Streifende Gegner: im Wrackfeld immer, in den Schlickgassen nur bei Ebbe (CZ spawn). */
const STREIFEN = { vm_wrackfeld: [['vme_salzkruste', 4], ['vme_tauwerk', 4], ['vme_hafenkraehe', 3]], vm_schlickgassen: [['vme_salzkruste', 4]] };

/** Varrowmouth als Paket für buildContent. `f` enthält je Ordner die JSON-Dateien (VM_FILES). */
export function varrowmouthPack(f) {
  const { city: cu, items: cuItems, vm_karten: plan } = f.k6_orte;
  const ct = f.k6_akte;
  const cx = f.k6_figuren;

  // Karten
  const maps = Object.entries(KARTEN).map(([id, k]) => ({
    id, name: k.name, city: VM_CITY, tiles: k.tiles, outdoor: true, rows: plan[id].rows, spawns: plan[id].spawns, ...(k.danger ? { danger: k.danger } : {}),
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
      const wrack = to === 'vm_wrackfeld';
      map[m].interactables.push({ id: `${m}_${a}`, kind: 'door', tile: anker(m, a), to, spawn, prompt, visible_if: { requires_flags: [VM_ANKUNFT, ...(zoll ? ['k6_tam_weg'] : []), ...(wrack ? WRACK_OFFEN : [])] } });
      // Das Wrackfeld: erst mit Akt II, und nur bei Ebbe
      if (wrack) map[m].interactables.push(
        { id: `${m}_${a}_zu`, kind: 'read', tile: anker(m, a), prompt: 'Steg zum Wrackfeld', title: 'Steg zum Wrackfeld', marker: false, visible_if: { requires_flags: [VM_ANKUNFT], hide_if_flags: ['k6_akt1_done'] },
          text: 'Hinter dem letzten Pfahl liegt das Wrackfeld. Die Leute vom Steg schütteln den Kopf: Wer dorthin will, braucht einen Grund und die richtige Ebbe.' },
        { id: `${m}_${a}_flut`, kind: 'read', tile: anker(m, a), prompt: 'Steg zum Wrackfeld (Flut)', title: 'Flut', marker: false, visible_if: { requires_flags: ['k6_akt1_done'], hide_if_flags: ['gezeit_ebbe'] },
          text: 'Der Oststeg endet im Wasser. Unter dir schaukeln die Masten der Wracks, als winkten sie. Bei Ebbe läuft das Feld trocken; die Pegeluhr am Zollhafen sagt, wann.' });
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
  const spaeter = (d) => Object.values(d.nodes ?? {}).some((n) => n.encounter && !KAEMPFE.has(n.encounter));
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
    if (!p.interactable || !map[p.map] || !BIS_AKT2(p) || gebunden.has(p.interactable?.dialogue)) continue;
    const key = Object.keys(FUND_ANKER).find((k) => p.interactable.id.startsWith(k));
    if (!key) continue;
    const tile = platz(p.map, FUND_ANKER[key]);
    map[p.map].interactables.push({ ...p.interactable, ...(SZENE_TITEL[key] ? { title: SZENE_TITEL[key], prompt: SZENE_TITEL[key] } : {}), tile, ...(p.visible_if ? { visible_if: p.visible_if } : {}) });
  }
  // Bilanzen: Akt I öffnet Akt II; Akt III (Pegelrat, Leuchtbank) kommt mit der nächsten Etappe. Geld auf Kapitel-7-Niveau.
  const b1 = dialogues.k6_bilanz1;
  if (b1) {
    const ja = b1.nodes.k6_bilanz1_ja;
    dialogues.k6_bilanz1 = { ...b1, nodes: { ...b1.nodes, k6_bilanz1_ja: { ...ja, gives_money: BILANZ_GELD, text: `${ja.text}\n\nNell aus den Schlickgassen, sagt Tam, wisse mehr über das Vergessen. Und das Wrackfeld liegt bei Ebbe trocken, hinter dem Oststeg.` } } };
  }
  const b2 = dialogues.k6_bilanz2;
  if (b2) {
    const { start_quests: _s, ...ja } = b2.nodes.k6_bilanz2_ja;
    dialogues.k6_bilanz2 = { ...b2, nodes: { ...b2.nodes, k6_bilanz2_ja: { ...ja, gives_money: BILANZ_GELD * 2, text: `${ja.text}\n\nDer Pegelrat tagt in der Oberstraße. Bis er dich vorlässt, vergeht noch eine Weile.` } } };
  }

  // Gespräche, die spätere Akte starten oder abschließen (Bilanzen III–V, Enden), kommen mit ihren Karten
  for (const [id, d] of Object.entries(dialogues)) if (/"k6_akt[3-5]"|"ending"/.test(JSON.stringify(d))) delete dialogues[id];
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
  // Gegner und ihre Streifgebiete
  const { gegner, loot } = vmGegner(f.k6_gegner);
  for (const [m, list] of Object.entries(STREIFEN)) {
    const k = map[m];
    k.roamers = [];
    let i = 0;
    for (const [enc, n] of list) for (let j = 0; j < n; j++, i++) {
      const tile = freieKachel(k, { seed: `vm|${m}|${i}`, minDist: 9 });
      if (tile) k.roamers.push({ id: `${m}_r${i}`, encounter: enc, tile, elite_chance: 0.15, ...(m === 'vm_schlickgassen' ? { visible_if: { requires_flags: ['gezeit_ebbe'] } } : {}) });
    }
  }

  const pins = { vm_zollhafen: [150, 112], vm_stegviertel: [312, 118], vm_schlickgassen: [228, 206], vm_oberstrasse: [92, 34], vm_wrackfeld: [430, 186] };
  const travel = maps.map((m) => ({ map: m.id, spawn: 'default', name: m.name, desc: cu.pins.find((p) => p.map === m.id) ? cu.desc : '', city: VM_CITY,
    requires_flags: [VM_ANKUNFT, ...(m.id === 'vm_stegviertel' || m.id === 'vm_schlickgassen' ? ['k6_tam_weg'] : []), ...(m.id === 'vm_wrackfeld' ? WRACK_OFFEN : [])] }));
  for (const t of travel) t.desc = { vm_zollhafen: 'Zollhaus, Pegeluhr und Fähranleger.', vm_stegviertel: 'Pfahlbauten, Stegmarkt und Tams Lotsenkammer.', vm_schlickgassen: 'Bei Ebbe begehbar. Die Ärmsten wohnen am tiefsten.', vm_oberstrasse: 'Trocken, teuer, Sitz des Pegelrats.', vm_wrackfeld: 'Nur bei Ebbe. Schlick, Priele und die Rümpfe alter Schiffe.' }[t.map];

  return {
    name: 'varrowmouth', maps, travel, city: { id: VM_CITY, title: 'Stadtkarte von Varrowmouth', map_image: 'ui/vm_stadtkarte_ebbe.png', fog_image: 'ui/vm_nebel.png', pins },
    npcs, dialogues, items, quests: { k6_akt1: ct.quests.k6_akt1, k6_akt2: ct.quests.k6_akt2 }, case: { facts: ct.case.facts, clues: ct.case.clues, deductions: ct.case.deductions }, faelle: ct.faelle, platzierung, haendler: { merchants },
    bosses: gegner, loot,
  };
}
