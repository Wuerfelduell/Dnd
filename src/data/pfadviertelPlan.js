/**
 * Pfadviertel neu aufgebaut (Seb 2026-11-26: „die Viertel nicht gut aufgebaut, brauchen da Bosse usw.“).
 * Vorher: ein 48x30-Feld mit verstreuten Klötzen, Rangprüfungen, Herde, Spuren, Inschriften und Herz zufällig verteilt.
 * Jetzt hat jedes der zehn Viertel denselben klaren Aufbau (60x34), mit Wegweisern an jedem Durchgang:
 * - Gildenhof (links): Ausgang, Krämer, Prüfstein, Gildentafel, Bote und Beitritt. Keine Monster.
 * - Gildenhalle (oben): Gang mit fünf Nischen für die fünf Rangprüfungen, am Ende die Stellvertretung (Zwischenboss) vor dem Tor
 *   zum Saal des Oberhaupts (Boss) mit Archiv (Formel 2) und der Wahl töten/übernehmen.
 * - Boulevard (Mitte): verbindet alles, Inschriften an den Rändern, Streifen der Viertel-Monster.
 * - Verderbte Gassen (unten): drei Höfe als Schlangenweg, je zwei Herde mit ihrer Spur davor; Herd 3 und 6 sind Zwischenbosse.
 * - Herz des Viertels (rechts): Arena, nur über den letzten Hof erreichbar; das Herz (Boss) in der Mitte.
 * Läuft nach allen Modulen, die Objekte in die Viertel legen (direkt vor der Calderwick-Kulisse).
 */
const W = 60;
const H = 34;

/** Feste Plätze je Objekt-Endung (o3_<pid>_<endung>). */
const PLATZ = {
  ausgang: [1, 17], cw_tafel: [3, 13], bote: [6, 13], beitritt: [9, 13], beitritt_nachbar: [9, 13], kraemer: [4, 21], pruefstein: [9, 21],
  siegel1: [17, 3], siegel2: [23, 3], siegel3: [29, 3], siegel4: [35, 3], siegel5: [41, 3],
  vize: [42, 7], tiefe: [52, 4], chef_werden: [49, 6], chef_toeten: [55, 6], schrein2: [52, 2],
  inschrift1: [18, 13], inschrift2: [26, 20], inschrift3: [34, 13], inschrift4: [42, 20], inschrift5: [22, 17],
  spur1: [16, 25], herd1: [20, 27], spur2: [16, 30], herd2: [21, 31],
  spur3: [28, 31], herd3: [31, 29], spur4: [28, 26], herd4: [32, 25],
  spur5: [38, 27], herd5: [42, 25], spur6: [38, 30], herd6: [42, 31],
  herz: [52, 22],
};
/** Wegweiser an den Durchgängen: [Endung, Feld, Beschriftung, Text]. */
const WEGWEISER = [
  ['weg_hof', [11, 16], 'Boulevard →', 'Vom Gildenhof führt der Boulevard ins Viertel. Oben die Gildenhalle mit den Rangprüfungen, unten die verderbten Gassen, ganz hinten das Herz.'],
  ['weg_halle', [16, 12], '↑ Gildenhalle', 'Die Gildenhalle: fünf Nischen, fünf Rangprüfungen. Wer alle besteht, trifft am Ende des Gangs auf die Stellvertretung und dahinter auf das Oberhaupt.'],
  ['weg_gassen', [16, 21], '↓ Verderbte Gassen', 'Die verderbten Gassen: drei Höfe, sechs Herde der Verderbnis. Folge den Spuren, ein Herd nach dem anderen.'],
  ['weg_herz', [44, 28], 'Das Herz →', 'Hinter dem letzten Hof schlägt das Herz des Viertels. Es zeigt sich erst, wenn alle sechs Herde ausgebrannt sind.'],
  ['weg_saal', [44, 8], 'Saal des Oberhaupts →', 'Der Saal des Oberhaupts. Nur Mitglieder, die alle fünf Rangprüfungen bestanden haben, werden vorgelassen.'],
];
/** Streifen der Monster: Boulevard, Gang der Halle, Gassen. */
const STREIFEN = [[24, 14], [30, 18], [38, 15], [20, 19], [36, 19], [28, 7], [34, 8], [22, 8], [19, 25], [22, 29], [30, 27], [29, 31], [40, 27], [41, 29], [51, 16], [53, 27], [49, 30], [33, 16]];

function raster() {
  const g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 'I' : '.')));
  const wand = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = 'I'; };
  const frei = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = '.'; };
  // Gildenhof | Viertel
  wand(12, 1, 13, H - 2); frei(12, 15, 13, 19);
  // Gildenhalle oben (Nischen y 1–5, Gang y 6–10), Saal des Oberhaupts rechts
  wand(14, 10, 46, 11); frei(15, 10, 18, 11);
  for (const x of [20, 26, 32, 38]) wand(x, 1, x, 5);
  wand(14, 1, 14, 5); wand(44, 1, 44, 5);
  wand(45, 1, 46, 11); frei(45, 7, 46, 8);
  wand(47, 10, W - 2, 11);
  // Verderbte Gassen unten: drei Höfe als Schlangenweg
  wand(14, 22, 46, 23); frei(15, 22, 18, 23);
  wand(24, 24, 25, H - 2); frei(24, 30, 25, 32);
  wand(35, 24, 36, H - 2); frei(35, 24, 36, 26);
  // Herz-Arena rechts, Zugang nur aus dem letzten Hof
  wand(45, 12, 46, H - 2); frei(45, 29, 46, 31);
  // Arena: Pfeilerkranz um das Herz
  for (const [x, y] of [[49, 17], [55, 17], [49, 27], [55, 27], [48, 22], [57, 22]]) wand(x, y, x, y + 1);
  // Boulevard: Sockel und Brunnenblöcke
  for (const [x, y] of [[27, 15], [39, 16]]) wand(x, y, x + 2, y + 1);
  // Gildenhof: Stände und Bänke
  wand(3, 3, 5, 5); wand(8, 3, 10, 5); wand(3, 27, 5, 29); wand(8, 27, 10, 29);
  return g;
}

export function applyPfadviertelPlan(content) {
  for (const m of Object.values(content.maps)) {
    if (!m.id?.startsWith('o3_') || m.city !== 'calderwick' || !m.rows?.length) continue;
    umbauen(content, m);
  }
}

function umbauen(content, m) {
  const pid = m.id.slice(3);
  const g = raster();
  const boden = (x, y) => g[y]?.[x] === '.';
  const belegt = new Set();
  const key = (x, y) => `${x},${y}`;
  const rest = [];
  for (const o of [...(m.interactables ?? []), ...(m.npcs ?? [])]) {
    const endung = o.id.startsWith(`${m.id}_`) ? o.id.slice(m.id.length + 1) : null;
    const t = endung && PLATZ[endung];
    if (t) { o.tile = [...t]; belegt.add(key(...t)); } else rest.push(o);
  }
  // Zwischenbosse: Herd 3 und 6 deutlich als solche erkennbar
  for (const n of [3, 6]) {
    const e = content.encounters[`${m.id}_herd${n}`];
    if (e && !/Zwischenboss/.test(e.intro ?? '')) { e.intro = `Zwischenboss. ${e.intro ?? ''}`; e.zwischenboss = true; }
    const it = m.interactables.find((i) => i.id === `${m.id}_herd${n}`);
    if (it) it.label = 'Zwischenboss';
  }
  for (const [suffix, label] of [['vize', 'Stellvertretung'], ['tiefe', 'Oberhaupt'], ['herz', 'Herz des Viertels']]) {
    const it = m.interactables.find((i) => i.id === `${m.id}_${suffix}`);
    if (it) it.label = label;
  }
  // Übrige Objekte (andere Module): in den Gildenhof bzw. an den Boulevard, mit Abstand
  const kandidaten = [];
  for (let y = 12; y <= 21; y++) for (let x = 1; x <= 44; x++) if (boden(x, y) && (x < 13 || y === 12 || y === 21)) kandidaten.push([x, y]);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (boden(x, y) && x > 13) kandidaten.push([x, y]); // Rückfall: irgendwo im Viertel
  for (const o of rest) {
    const t = kandidaten.find(([x, y]) => ![[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => belegt.has(key(x + dx, y + dy))));
    if (t) { o.tile = [...t]; belegt.add(key(...t)); }
  }
  for (const [suffix, tile, label, text] of WEGWEISER) {
    m.interactables.push({ id: `${m.id}_${suffix}`, kind: 'read', tile, prompt: 'Wegweiser lesen', title: label, label, text, marker: false });
    belegt.add(key(...tile));
  }
  (m.roamers ?? []).forEach((r, i) => { const t = STREIFEN.filter(([x, y]) => boden(x, y))[i % STREIFEN.length] ?? [30, 17]; r.tile = [...t]; });
  m.rows = g.map((r) => r.join(''));
  m.spawns = { ...m.spawns, default: [2, 17] };
  m.decor = (m.decor ?? []).filter((d) => d.kulisse || boden(...d.tile));
  for (const d of m.decor) if (belegt.has(key(...d.tile))) d.solid = undefined;
  m.lights = (m.lights ?? []).filter((l) => boden(...l.tile));
  const farbe = content.pathways?.[pid]?.color ?? '#b78cff';
  for (const t of [[52, 22], [52, 4], [7, 17], [42, 8]]) m.lights.push({ tile: t, radius: 70, intensity: 0.55, color: farbe, glow: 0.25, flicker: 0.12 });
}
