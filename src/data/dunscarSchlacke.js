/**
 * Schlackengrube (Seb 2026-11-12): „in Dunscar soll man auf Seq 4 steigen können, aber nicht easy; Dunscar hat nicht genug
 * würdige Farmgegner … neues Gebiet ist safe nötig“.
 *
 * Neues Gefahrengebiet Stufe 7 südlich vom Kalkmarkt, gebaut wie die übrigen (Kulisse: Eingang mit Schild, Lager,
 * Boss hinten). Hier stehen ausschließlich harte Gegner, die auf Seq 5 fordern und sich immer wieder lohnen:
 *   normal      drei Arten mit je einer Eigenheit (Blutung, Nervenzehrung, Aufheizen)
 *   Elite       drei Arten, immer Elite (Panzer + unparierbarer Hammer, Schleier + Konzentrationsraub, Flächenschläge + Aufheizen)
 *   Mittelboss  Schlackenbraut, Glutschaffner, Glutschwellenhund (zweite Haltung bei halben Leben), kommen nach dem Verlassen wieder
 *   Gebietsboss Schlackenvorhauer, kommt wieder (respawn)
 * Beute: eigenes Geld, drei Wertstücke (Glutperle, Ofenherz, Kronglas), Formel 4/3 und Seq-4-Kernzutat deutlich häufiger
 * als im übrigen Dunscar (Feld `formel_chance` / `zutat4_chance` am Gebiet, gelesen in PfadHandel.pfadExtraLoot).
 */

export const SG_ID = 'ds_schlackengrube';
export const SG_PIN = [250, 125]; // südlich vom Kalkmarkt [235, 45] → Ausgang dort im Süden

/** Rang eines Gegners für Beute-Tabellen: boss / mittel / elite / normal. */
export const sgRang = (enc) => (enc.boss ? 'boss' : enc.mittelboss ? 'mittel' : enc.elite ? 'elite' : 'normal');

/** Formel- und Zutatenchancen in der Schlackengrube (übriges Dunscar: Formel 4 0,2/0,5/1 %, Zutat Elite 6 %/Boss 15 %). */
export const SG_FORMEL = {
  4: { normal: 0.006, elite: 0.02, mittel: 0.04, boss: 0.08 },
  3: { normal: 0, elite: 0.003, mittel: 0.006, boss: 0.012 },
};
export const SG_ZUTAT4 = { normal: 0, elite: 0.12, mittel: 0.25, boss: 0.4 };

export const SG_ITEMS = {
  ds_schlacke_glutperle: { name: 'Glutperle', kind: 'trophy', weight: 0.1, price: 400, desc: 'Eine Perle aus erstarrter Schlacke, innen noch warm. Am Kalkmarkt gut zu verkaufen.' },
  ds_schlacke_ofenherz: { name: 'Ofenherz', kind: 'trophy', rarity: 'selten', weight: 0.4, price: 1500, desc: 'Der glühende Kern eines Wesens aus der Schlackengrube. Hehler zahlen viel, fragen wenig.' },
  ds_schlacke_kronglas: { name: 'Kronglas', kind: 'trophy', rarity: 'selten', weight: 0.3, price: 4000, desc: 'Klares Glas aus der heißesten Stelle der Grube, so rein, dass man darin die Zukunft zu sehen meint. Ein Vermögen wert.' },
};

const LOOT = {
  normal: { money: [25, 40], drops: [{ item: 'ds_schlacke_glutperle', chance: 0.25 }] },
  elite: { money: [70, 100], drops: [{ item: 'ds_schlacke_ofenherz', chance: 0.3 }, { item: 'ds_schlacke_glutperle', chance: 1 }] },
  mittel: { money: [150, 200], drops: [{ item: 'ds_schlacke_ofenherz', chance: 1 }, { item: 'ds_schlacke_kronglas', chance: 0.15 }] },
  boss: { money: [300, 400], drops: [{ item: 'ds_schlacke_kronglas', chance: 1 }, { item: 'ds_schlacke_ofenherz', chance: 1 }] },
};

const atk = (name, damage, hits, more = {}) => ({ name, damage, hits, ...more });
const ROAM = { normal: { speed: 26, chase: 56, aggro: 86 }, elite: { speed: 22, chase: 54, aggro: 90 }, mittel: { speed: 16, chase: 50, aggro: 84 }, boss: { speed: 0, chase: 45, aggro: 70 } };

/**
 * Leben: Kapitel 3 hat eine Untergrenze (Combat.HP_FLOOR solo 800/1600/3200). Hier liegen die Gegner darüber:
 * hp × 1,4 ≈ normal 1000, Elite 2000, Mittelboss 3000, Boss 4000 (zu zweit ×2,5).
 */
export const SG_GEGNER = {
  // --- normal -----------------------------------------------------------------------------------------------------
  sg_schlackenlaeufer: {
    name: 'Schlackenläufer', sheet: 'enemy_schichtgaenger', tint: '#ff9a5a', hp: 715, armor: 3, ambush: 0.25,
    intro: 'Ein Arbeiter, dessen Haut zu Schlacke erstarrt ist. Er läuft, als hätte er es eilig, und schneidet tief.',
    attacks: [atk('Schlackenschnitt', 15, [1100, 1700], { bleed: [8, 2] }), atk('Glühender Tritt …', 18, [2200])],
  },
  sg_aschenkraehe: {
    name: 'Aschenkrähe', sheet: 'enemy_signalkraehe', tint: '#c8a070', hp: 700, armor: 2,
    intro: 'Eine Krähe aus Asche, die krächzt wie ein Kessel kurz vor dem Bersten. Ihr Schrei frisst an den Nerven.',
    attacks: [atk('Aschenschnabel', 14, [1000, 1500, 2000], { nerves: 3 }), { name: 'Kesselschrei', action: 'taunt', value: 10, text: 'Der Schrei kratzt an den Nerven: -10 Nerven.' }, atk('Sturz aus dem Rauch …', 19, [2300])],
  },
  sg_glutstaub: {
    name: 'Glutstaub', sheet: 'enemy_kalkstaubgeist', tint: '#ff7040', hp: 730, armor: 2, ramp: 0.08, sweep: 0.6,
    intro: 'Eine Wolke glühender Staubkörner. Mit jeder Runde wird sie heißer, und sie streift gern beide zugleich.',
    attacks: [atk('Glutwehen', 15, [1200, 1800]), atk('Funkenmantel …', 18, [2300])],
  },
  // --- Elite (immer Elite) ----------------------------------------------------------------------------------------
  sg_ofenpanzer: {
    name: 'Ofenpanzer', elite: true, sheet: 'enemy_geruestklang', tint: '#d08040', hp: 1430, armor: 6,
    intro: 'Ein Ofen auf Beinen, die Klappe als Gesicht. Er verriegelt sich, bevor er zuschlägt, und sein Hammer lässt sich nicht parieren.',
    attacks: [{ name: 'Klappe zu', action: 'guard', value: 6, text: 'Die Ofenklappe schlägt zu: Panzer +6.' }, atk('Rosthieb', 20, [1200, 1800]), atk('Ofenhammer …', 26, [2500], { unparryable: true })],
  },
  sg_aschenweberin: {
    name: 'Aschenweberin', elite: true, sheet: 'enemy_lohnlistenmotte', tint: '#b080ff', hp: 1400, armor: 3,
    intro: 'Eine Motte so groß wie ein Mensch, die aus Asche Schleier webt. Sie trinkt deine Konzentration und wird davon satt.',
    attacks: [{ name: 'Ascheschleier', action: 'veil', text: 'Ein Schleier aus Asche: nur präzise Treffer zählen.' }, atk('Staubfäden', 19, [1000, 1600, 2100], { nerves: 3 }),
      { name: 'Glut trinken', action: 'drain', value: 3, heal: 60, heal_per_ap: 90, text: '' }, atk('Flügelbrand …', 24, [2300])],
  },
  sg_kesselbrecher: {
    name: 'Kesselbrecher', elite: true, sheet: 'enemy_nachhall', tint: '#ff5a3a', hp: 1450, armor: 4, ramp: 0.12, sweep: 1,
    intro: 'Was aus einem geplatzten Kessel herauskroch. Jeder Schlag trifft alle, die vor ihm stehen, und er wird heißer, je länger es dauert.',
    attacks: [atk('Dampfstoß', 18, [1100, 1700], { bleed: [12, 2] }), atk('Berstender Kessel …', 23, [2400])],
  },
  // --- Mittelbosse (Blätter der Codex-DJ-Gestalten, umgefärbt; die benannten selbst bleiben einmalig) ---------------
  sg_schlackenbraut: {
    name: 'Schlackenbraut', elite: true, mittelboss: true, sheet: 'enemy_bn_kalkbraut', tint: '#ff9a6a', hp: 2150, armor: 4,
    intro: 'Ein glühender Schleier steht zwischen den Halden. Darunter ist nur die Form einer wartenden Person. Sie wartet nicht auf dich.',
    attacks: [{ name: 'Brautschleier', action: 'veil', text: 'Der Schleier legt sich über sie: nur präzise Treffer zählen.' }, atk('Staubhusten', 22, [1100, 1700], { nerves: 6 }), atk('Kalkmantel …', 27, [2200], { nerves: 6 })],
    phase2: { meldung: 'Der Schleier reißt. Darunter atmet etwas, das nie geheiratet hat.', attacks: [{ name: 'Leere Hochzeit', action: 'heal', value: 260, text: 'Kalk füllt die Risse: +260 Leben.' }, atk('Kalkkranz', 24, [900, 1400, 1900], { nerves: 6 }), { name: 'Klage', action: 'taunt', value: 14, text: '-14 Nerven.' }, atk('Brautgang …', 30, [2400], { unparryable: true })] },
  },
  sg_glutschaffner: {
    name: 'Glutschaffner', elite: true, mittelboss: true, sheet: 'enemy_bn_schaffner_ohne_zug', tint: '#ffb070', hp: 2100, armor: 4, ambush: 0.5,
    intro: 'Eine glühende Lochzange klickt zwischen den Schlackehalden. Der Schaffner wartet, bis du stehen bleibst, und dann pfeift er.',
    attacks: [atk('Fahrschein, bitte', 22, [1100, 1700]), atk('Lochzange', 21, [900, 1400, 1900], { bleed: [16, 3] }), atk('Abfahrtspfiff …', 28, [2400])],
    phase2: { meldung: 'Der Pfiff wird zum Signal für einen Zug, den es nicht gibt. Er schlägt jetzt doppelt.', attacks: [atk('Doppelpfiff', 22, [1000, 1500, 2000, 2500]), { name: 'Entwerten', action: 'drain', value: 3, heal: 80, heal_per_ap: 100, text: '' }, atk('Endstation …', 32, [2400], { unparryable: true })] },
  },
  sg_glutschwellenhund: {
    name: 'Glutschwellenhund', elite: true, mittelboss: true, sheet: 'enemy_bn_schwellenhund_weiss', tint: '#ff8050', hp: 2200, armor: 5, sweep: 0.5,
    intro: 'Ein glühender Rücken schiebt sich aus der Schlacke. Das Licht über seinem Auge zählt die Schwellen und dann dich.',
    attacks: [atk('Suchlichtbogen', 23, [1400, 2100], { nerves: 5 }), atk('Schwellenbiss', 21, [1000, 1600], { bleed: [18, 3] }), atk('Schwellensprung …', 28, [2400])],
    phase2: { meldung: 'Der Scheinwerfer flackert und springt von einem Ziel zum nächsten. Der Hund jagt jetzt beide.', attacks: [atk('Wandernder Lichtbogen', 23, [1200, 1800], { sweep: true, nerves: 5 }), { name: 'Rußfell', action: 'guard', value: 8, text: 'Ruß legt sich wie Panzer an: +8.' }, atk('Glutsprung …', 31, [2300])] },
  },
  // --- Gebietsboss ------------------------------------------------------------------------------------------------
  sg_schlackenvorhauer: {
    name: 'Schlackenvorhauer', boss: true, sheet: 'enemy_bn_der_zweite_vorhauer', tint: '#ff7a40', hp: 2500, armor: 4, fleeable: false,
    intro: 'Zwei Helme drehen sich mit derselben Schulter. Der zweite Schlag ist schon im ersten Geräusch zu hören. Ganz hinten in der Grube schlägt er seit Jahren den Takt.',
    attacks: [atk('Werkzeugspur', 22, [1400, 2100], { nerves: 6 }), { name: 'Schlackenhaut', action: 'guard', value: 6, text: 'Schlacke erstarrt auf seinem Panzer: +6.' }, atk('Hammerschluss …', 24, [1400, 2400]), atk('Zweiter Hieb', 20, [1000, 1700], { bleed: [12, 2] })],
    phase2: { meldung: 'Der zweite Helm wacht auf. Jetzt schlagen beide.', attacks: [atk('Doppelhieb', 21, [1000, 1600, 2200], { nerves: 6 }), { name: 'Glut aus der Tiefe', action: 'heal', value: 200, text: 'Die Grube heizt ihn nach: +200 Leben.' }, atk('Hammerschluss …', 25, [1400, 2400], { unparryable: true, sweep: true }), atk('Schlackenregen', 21, [1100, 1700], { sweep: true })] },
  },
};

/** 18 Gegner: 9 normal, 5 Elite, 3 Mittelbosse, Gebietsboss. Kachel nur vorläufig, die Kulisse verteilt sie. */
const BESETZUNG = [
  ['sg_schlackenlaeufer', 3], ['sg_aschenkraehe', 3], ['sg_glutstaub', 3],
  ['sg_ofenpanzer', 2], ['sg_aschenweberin', 2], ['sg_kesselbrecher', 1],
  ['sg_schlackenbraut', 1], ['sg_glutschaffner', 1], ['sg_glutschwellenhund', 1],
];

/** Karte 48x30: Schlackehalden (Wand) als unregelmäßige Hügel, dazwischen Wege. Fest berechnet, kein Zufall. */
export function sgRows() {
  const W = 48;
  const H = 30;
  const halden = [[12, 7, 4, 2], [27, 6, 5, 2], [39, 9, 3, 3], [9, 18, 3, 3], [20, 15, 4, 2], [33, 19, 5, 2], [24, 24, 3, 2], [41, 24, 2, 2], [15, 25, 2, 1]];
  return Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    if (x === 0 || y === 0 || x === W - 1 || y === H - 1) return 'I';
    const halde = halden.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1);
    return halde ? 'I' : 's';
  }).join(''));
}

function sgMap() {
  const roamers = [];
  let i = 0;
  for (const [enc, n] of BESETZUNG) for (let k = 0; k < n; k++) roamers.push({ id: `${SG_ID}_${++i}`, encounter: enc, tile: [4 + (i % 10) * 4, 3 + Math.floor(i / 10) * 20], elite_chance: 0.15 });
  roamers.push({ id: `${SG_ID}_gebietsboss`, encounter: 'sg_schlackenvorhauer', tile: [24, 27], boss: true, respawn: true });
  const lesen = (n, title, text) => ({ id: `sg_lesen${n}`, kind: 'read', tile: [2 + n * 2, 2], prompt: title, title, text, marker: false, done_flag: `sg_gelesen${n}` });
  return {
    id: SG_ID, name: 'Schlackengrube', city: 'dunscar', tiles: 'ds_bruch', tiles_wunsch: SG_ID, danger: 7,
    rows: sgRows(), spawns: { default: [2, 15] },
    lights: [{ tile: [24, 15], radius: 90, intensity: 0.6, color: '#ff8a4a', glow: 0.3, flicker: 0.2 }, { tile: [40, 6], radius: 70, intensity: 0.5, color: '#ff6a3a', glow: 0.25, flicker: 0.25 },
      { tile: [10, 24], radius: 70, intensity: 0.5, color: '#ff6a3a', glow: 0.25, flicker: 0.25 }],
    ambient: { night: 0.8, fog: 0.22 },
    interactables: [
      { id: 'sg_nach_kalkmarkt', kind: 'door', tile: [1, 15], to: 'ds_kalkmarkt', spawn: 'default', prompt: 'Nach Kalkmarkt', marker: true },
      lesen(1, 'Warntafel der Hütte', 'Gefahr Stufe 7. Hier wurde die Schlacke der ganzen Stadt abgekippt, und etwas darin ist nie abgekühlt. Wer hier besteht, kann sich alles kaufen. Wer nicht besteht, wird von Pfiff hinter die Schallschleuse geholt.'),
      lesen(2, 'Kreide an der Lore', '„Läufer schneiden, Krähen schreien, Staub wird heißer. Die Großen mit dem Stern: Ofen erst knacken, Motte nicht hungrig lassen, Brecher schnell fällen. Die mit zwei Sternen sind schlimmer. Und hinten der Vorhauer. Lass ihn.“'),
      lesen(3, 'Hehlerzettel', 'Ankauf am Kalkmarkt: Glutperle 400, Ofenherz 1500, Kronglas 4000. Formeln und Kerne von hier unten bitte nicht am Markt zeigen.'),
    ],
    npcs: [], decor: [], roamers, leben: { weather: ['nachtnebel', 'kalkstaub'], animals: {} },
  };
}

const ZONE_BASE = {
  lose_to: { map: 'ds_speisewagen', spawn: 'default' }, lose_money: 0,
  lose_text: 'Pfiff zieht dich aus der Schlacke und bringt dich hinter die Schallschleuse. Deine Aufzeichnungen bleiben bei dir.',
  flee_text: 'Du rennst zwischen den Halden zurück zum Kalkmarkt.',
};

export function applyDunscarSchlacke(content) {
  if (!content.maps.ds_kalkmarkt || content.maps[SG_ID]) return;
  content.items = { ...content.items, ...SG_ITEMS };
  const encs = {};
  for (const [id, e] of Object.entries(SG_GEGNER)) {
    const rang = sgRang(e);
    const enc = { sprite: 'wild', occult: true, wild: true, fleeable: !e.boss, zone: SG_ID, chapter: 3, roam: ROAM[rang], on_win: {}, ...ZONE_BASE,
      win_text: e.boss ? `${e.name} sinkt in die Schlacke. Für eine Weile ist es still in der Grube.` : `${e.name} zerfällt zu kalter Schlacke.`, ...e };
    content.encounters[id] = enc;
    encs[id] = enc;
    content.loot[id] = { repeat: true, ...LOOT[rang], drops: [...LOOT[rang].drops] };
    if (rang !== 'normal') continue;
    // Normale Gegner werden manchmal (15 %) als Elite-Variante gerufen: +50 % Leben, +30 % Schaden, Elite-Beute
    const el = { ...enc, name: `${e.name} der Glut`, elite: true, hp: Math.round(e.hp * 1.5), attacks: e.attacks.map((a) => (a.damage ? { ...a, damage: Math.round(a.damage * 1.3) } : a)) };
    content.encounters[`${id}_elite`] = el;
    encs[`${id}_elite`] = el;
    content.loot[`${id}_elite`] = { repeat: true, money: LOOT.elite.money, drops: [...LOOT.normal.drops, ...LOOT.elite.drops] };
  }
  content.zones[SG_ID] = {
    name: 'Schlackengrube', tier: 7, ...ZONE_BASE, encounters: encs, loot_tables: {},
    travel: { name: 'Schlackengrube', desc: 'Gefahr Stufe 7. Nur für Erfahrene: Seq 5 zu zweit, allein besser Seq 4.', requires_flags: ['k3_arrived'], city: 'dunscar' },
    formel_chance: SG_FORMEL, zutat4_chance: SG_ZUTAT4,
  };
  content.maps[SG_ID] = sgMap();
  const km = content.maps.ds_kalkmarkt;
  content.maps.ds_kalkmarkt = { ...km, interactables: [...km.interactables, { id: 'k3o_kalkmarkt_nach_schlackengrube', kind: 'door', tile: [10, 19], to: SG_ID, spawn: 'default', prompt: 'Nach Schlackengrube', marker: true }] };
  content.travel = [...content.travel, { map: SG_ID, spawn: 'default', ...content.zones[SG_ID].travel }];
  const ds = content.travelRules?.cities?.dunscar;
  if (ds) content.travelRules.cities.dunscar = { ...ds, pins: { ...(ds.pins ?? {}), [SG_ID]: SG_PIN } };
}
