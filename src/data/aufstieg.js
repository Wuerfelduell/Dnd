/**
 * Kapitel 4: Der Aufstieg (Seb, 2026-11-12, Konzept „Nach Dunscar: Der Aufstieg“).
 *
 * - Auslöser: Ab Sequenz 4 steht Starling am Endbahnhof von Dunscar und flieht in den Zug, der nach OBEN fährt.
 * - Die Himmelsstadt: keine Monster, nur Halbgötter (Vorhof), Heilige/Halbengel (Höfe) und Engel (Grat), dazu Starling vor dem
 *   Thron des Alten. Echte Kämpfe, man darf versuchen alle zu töten, aber niemand dort fällt (`unbesiegbar` in Combat.js).
 * - Die Verbrennung: man wird IMMER verbrannt, egal wie stark (jede Niederlage oben, spätestens am Thron).
 * - Der Sturz: man stirbt nicht, man fällt nach Calderwick. Dort beginnt Kapitel 4 (k4_aufstieg).
 */
import { seeded } from '../core/Gatherings.js';

export const HIMMEL = 'hs_himmelsstadt';
export const STURZ_ZIEL = { map: 'cw_gleisfuss', spawn: 'default' };
/** Was die Verbrennung setzt: Kapitel 3 ist vorbei, Calderwick erreicht, Kapitel 4 beginnt. */
export const STURZ_FLAGS = ['auf_verbrannt', 'k4_arrived', 'kapitel3_done'];
export const STURZ_EFFECTS = { sets_flags: STURZ_FLAGS, complete_quests: ['k3_rache'], start_quests: ['k4_aufstieg'] };
const STURZ_TEXT = 'Das Licht frisst dich nicht, es wiegt dich. Du bist zu leicht für diesen Ort. Der Boden der Himmelsstadt lässt dich los, und du fällst, durch Wolken, durch Rauch, durch die Nacht, bis Stein dich auffängt.\n\nDu liegst in einer fremden Stadt. Über dir hängt kein Himmel, nur eine Narbe aus Licht, wo du durchgebrochen bist. Calderwick.';

const PFADE = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr'];

/** Ein Gegner der Himmelsstadt: echte Werte, aber er fällt nicht (Combat: `unbesiegbar`). */
function himmelsGegner(id, name, { sheet, sprite = 'wild', tint, hp, armor, attacks, intro, boss = false, pathway }) {
  return {
    id, name, sprite, ...(sheet ? { sheet } : {}), ...(tint ? { tint } : {}), ...(pathway ? { pathway } : {}),
    occult: true, chapter: 4, boss, elite: false, hp, armor, dmg_mult: 1, hp_mult: 1, max_round_dmg: 0.02, fleeable: false, unbesiegbar: true, himmel: true,
    attacks, intro,
    on_win: {}, on_lose: STURZ_EFFECTS, lose_to: STURZ_ZIEL, lose_money: 0, lose_text: STURZ_TEXT,
  };
}

const schlag = (name, damage, hits, extra = {}) => ({ name, damage, hits, ...extra });

/** Halbgötter im Vorhof (Seq 4), Heilige in den Höfen (Seq 3), Engel am Grat (Seq 2), Starling vor dem Thron. */
function himmelsEncounters(content) {
  const out = {};
  const seqName = (pid, n) => content.pathways[pid]?.seqs?.[n]?.name ?? 'Unbekannt';
  PFADE.forEach((pid) => {
    if (!content.pathways[pid]) return;
    const pn = content.pathways[pid].name;
    out[`hs_halbgott_${pid}`] = himmelsGegner(`hs_halbgott_${pid}`, `${seqName(pid, 4)} des Vorhofs`, {
      sheet: `hg_battle_${pid}`, pathway: pid, hp: 60000, armor: 30,
      attacks: [schlag('Halbgöttlicher Schlag', 420, [900, 1500]), schlag('Mythische Gestalt', 780, [2100], { unparryable: true }), schlag('Wille des Pfades', 260, [600, 900, 1200, 1500])],
      intro: `Ein Halbgott des Pfades ${pn}, so alt wie eine Stadt. Er sieht dich an wie einen Gast, der den falschen Eingang genommen hat. „Noch einer von unten. Zeig, was du mitgebracht hast.“`,
    });
    out[`hs_heiliger_${pid}`] = himmelsGegner(`hs_heiliger_${pid}`, `${seqName(pid, 3)} der Höfe`, {
      sheet: `hg_battle_${pid}`, tint: '#fff0c0', pathway: pid, hp: 180000, armor: 50,
      attacks: [schlag('Heiliges Urteil', 900, [1200], { unparryable: true }), schlag('Lichtkette', 520, [700, 1300, 1900]), schlag('Segen, der brennt', 1400, [2400])],
      intro: `Ein Heiliger des Pfades ${pn} unterbricht sein Gebet. „Ein Halbgott. Wie rührend. Hier oben bist du ein Kind mit einem Streichholz.“`,
    });
  });
  for (let i = 1; i <= 3; i++) {
    out[`hs_engel_${i}`] = himmelsGegner(`hs_engel_${i}`, ['Engel des Grats', 'Engel der Schwelle', 'Engel des Thrones'][i - 1], {
      sheet: 'hg_grenzwaechter', tint: '#fff8e0', hp: 999999, armor: 80, boss: true,
      attacks: [schlag('Flügelschlag aus Licht', 2400, [1100]), schlag('Chor der Zerstörung', 1200, [800, 1400, 2000], { unparryable: true }), schlag('Das Wort', 6000, [2600], { unparryable: true })],
      intro: 'Er hat keine Augen, nur Licht, das dorthin fällt, wo Augen wären. Er sagt nichts. Er muss nichts sagen.',
    });
  }
  out.hs_starling = himmelsGegner('hs_starling', 'Lucius Starling, Hand des Alten', {
    sprite: 'npc:cultist', tint: '#fff2b0', hp: 999999, armor: 80, boss: true,
    attacks: [schlag('Brennglas des Alten', 1800, [900, 1300]), schlag('Sternregen', 700, [500, 750, 1000, 1250, 1500]), schlag('Ernte', 5000, [2400], { unparryable: true })],
    intro: 'Starling sitzt auf der untersten Stufe des Thrones, die Beine übereinandergeschlagen. „Mein bester Ermittler. Sie sind wirklich hinterhergekommen.“ Er lacht leise. „Hier oben bin ich nicht mehr der Professor aus Kettlegate. Hier bin ich, was Er aus mir gemacht hat.“',
  });
  return out;
}

/** Die Himmelsstadt: unten der Vorhof, in der Mitte die Höfe der Heiligen, oben der Engelsgrat mit dem Thron. */
function himmelsKarte(enc) {
  const W = 56, H = 40, F = 'g';
  const rng = seeded('himmelsstadt');
  const g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 'I' : F)));
  // Trennmauern zwischen den Ebenen, je ein Tor in der Mitte
  for (const wy of [27, 13]) for (let x = 1; x < W - 1; x++) if (x < 25 || x > 30) g[wy][x] = 'I';
  // Säulenreihen (Vorhof, Höfe), der Grat bleibt offen bis auf den Thron
  for (const [y0, y1] of [[30, 36], [16, 24]]) for (let by = y0; by <= y1; by += 4) for (let bx = 5; bx < W - 5; bx += 7) {
    if (bx > 21 && bx < 33) continue; // Mittelweg frei
    if (rng() < 0.2) continue;
    g[by][bx] = 'I'; g[by][bx + 1] = 'I';
  }
  for (let x = 24; x <= 32; x++) g[2][x] = 'I'; // Thronwand
  const rows = g.map((r) => r.join(''));
  const spawn = [28, 37];
  const free = [];
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) if (rows[y][x] === F && rows[y][x - 1] !== 'I' && rows[y][x + 1] !== 'I' && Math.abs(x - spawn[0]) + Math.abs(y - spawn[1]) >= 10) free.push([x, y]);
  const pickIn = (y0, y1) => {
    const opts = free.filter(([, y]) => y >= y0 && y <= y1);
    const t = opts[Math.floor(rng() * opts.length)];
    free.splice(free.indexOf(t), 1);
    return t;
  };
  const halbgoetter = Object.keys(enc).filter((k) => k.startsWith('hs_halbgott_'));
  const heilige = Object.keys(enc).filter((k) => k.startsWith('hs_heiliger_'));
  const roamers = [
    ...halbgoetter.slice(0, 6).map((e, i) => ({ id: `hs_vorhof_${i + 1}`, encounter: e, tile: pickIn(28, 36), elite_chance: 0 })),
    ...heilige.slice(0, 5).map((e, i) => ({ id: `hs_hoefe_${i + 1}`, encounter: e, tile: pickIn(15, 25), elite_chance: 0 })),
    ...[1, 2].map((i) => ({ id: `hs_grat_${i}`, encounter: `hs_engel_${i}`, tile: pickIn(9, 11), elite_chance: 0 })),
  ];
  const interactables = [
    { id: 'hs_ankunft', kind: 'read', tile: [26, 36], prompt: 'Der Bahnsteig über den Wolken', title: 'Die Himmelsstadt', marker: true, done_flag: 'hs_angekommen',
      text: 'Der Zug hält an einem Bahnsteig aus weißem Stein. Unter dir liegen Wolken, und unter den Wolken irgendwo Dunscar, klein wie ein Kiesel.\n\nHier oben gibt es keine Monster. Hier gibt es nur die, die über dir stehen: Halbgötter im Vorhof, Heilige in den Höfen, Engel auf dem Grat. Ganz oben ein Thron, und auf seinen Stufen Starling.\n\nJeder hier ist so stark wie du oder stärker. Viel stärker.' },
    { id: 'hs_tafel_vorhof', kind: 'read', tile: [30, 36], prompt: 'Tafel: Der Vorhof', title: 'Der Vorhof', marker: false,
      text: 'Hier warten die Halbgötter, bis man sie hinauflässt. Manche warten seit Jahrhunderten. Keiner von ihnen hat vor, dir den Platz in der Schlange zu überlassen.' },
    { id: 'hs_tafel_hoefe', kind: 'read', tile: [24, 25], prompt: 'Tafel: Die Höfe der Heiligen', title: 'Die Höfe der Heiligen', marker: false,
      text: 'Wer die dritte Sequenz trinkt, wird ein Heiliger und darf hier beten. Die Gebete sind keine Bitten. Es sind Befehle an die Welt unter den Wolken.' },
    { id: 'hs_tafel_grat', kind: 'read', tile: [24, 12], prompt: 'Tafel: Der Engelsgrat', title: 'Der Engelsgrat', marker: false,
      text: 'Die Engel stehen hier nicht, um etwas zu bewachen. Sie stehen hier, weil es der einzige Ort ist, der ihr Gewicht aushält.' },
    { id: 'hs_starling', kind: 'combat', encounter: 'hs_starling', tile: [28, 6], prompt: 'Starling stellen', marker: true },
    { id: 'hs_thron', kind: 'read', tile: [28, 3], prompt: 'Vor den Thron des Alten treten', title: 'Der Thron des Alten', marker: true, scene: 'kapitel_ende',
      text: `Auf dem Thron sitzt niemand, und doch ist er voll. Der Alte ist kein Körper, er ist das Gewicht, das auf allem liegt. Er sieht dich an, und das genügt.\n\nDu brennst. Nicht deine Haut, sondern alles, was du über dich geglaubt hast. Halbgott, sagtest du? Hier oben ist das ein Wort für Asche.\n\n${STURZ_TEXT}`,
      effects: { ...STURZ_EFFECTS, travel: STURZ_ZIEL } },
  ];
  return {
    id: HIMMEL, name: 'Die Himmelsstadt', city: 'himmel', danger: 7, tiles: 'bh_glas_warm', rows, spawns: { default: spawn },
    lights: [{ tile: [28, 36], radius: 90, intensity: 0.8, color: '#fff2c8', glow: 0.3 }, { tile: [28, 20], radius: 110, intensity: 0.8, color: '#ffe8a0', glow: 0.3 },
      { tile: [28, 4], radius: 140, intensity: 1, color: '#fff8e0', glow: 0.5, flicker: 0.05 }],
    ambient: { night: 0.25, fog: 0.35 }, interactables, roamers,
  };
}

/** Nach applySeqHoch: Auslöser in Dunscar, Himmelsstadt, Sturz, Kapitel-4-Ziel. */
export function applyAufstieg(content) {
  const enc = himmelsEncounters(content);
  Object.assign(content.encounters, enc);
  for (const id of Object.keys(enc)) content.loot[id] = { money: [0, 0], drops: [] };
  content.maps[HIMMEL] = himmelsKarte(enc);
  if (content.travelRules?.cities) content.travelRules.cities.himmel = { id: 'himmel', title: 'Die Himmelsstadt', pins: {} };

  // Dunscar, Endbahnhof: ab Sequenz 4 steht Starling am Bahnsteig und flieht in den Zug nach oben
  const bahnhof = content.maps.ds_endbahnhof;
  if (bahnhof) {
    bahnhof.interactables = [...(bahnhof.interactables ?? []),
      { id: 'auf_starling_bahnsteig', kind: 'read', tile: [8, 10], prompt: 'Ein Mann im hellen Mantel', title: 'Starling', marker: true, done_flag: 'auf_starling_gesehen',
        visible_if: { requires_flags: ['k3_arrived'], requires_seq: 4, hide_if_flags: ['auf_starling_gesehen'] },
        text: 'Er steht am Ende des Bahnsteigs, wo die Gleise nicht weiterführen, sondern nach oben. Professor Lucius Starling, unverändert, nur heller.\n\n„Sie haben es also bis zum Halbgott geschafft“, sagt er, ohne sich umzudrehen. „Er hat mir gesagt, dass Sie kommen. Er hat mir auch gesagt, was dann geschieht.“\n\nEin Zug ohne Lok fährt ein. Starling steigt ein, die Türen bleiben offen. Der Zug fährt nicht los. Er wartet. Auf dich.' },
      { id: 'auf_zug_nach_oben', kind: 'read', tile: [4, 10], prompt: 'Der Zug nach oben', title: 'Der Zug nach oben', marker: true,
        visible_if: { requires_flags: ['auf_starling_gesehen'], hide_if_flags: ['k4_arrived'] },
        text: 'Du steigst ein. Die Türen schließen sich ohne Laut, und der Boden unter dem Zug kippt weg. Kein Rattern, kein Pfiff, nur ein langes Steigen durch Rauch, dann durch Wolken, dann durch etwas, das heller ist als jedes Licht, das du kennst.\n\nDunscar bleibt unter dir zurück. Du wirst es nicht wiedersehen.',
        effects: { travel: { map: HIMMEL, spawn: 'default' } } },
    ];
  }
  // Kapitel 3 bekommt sein Ende: Starling am Endbahnhof
  const rache = content.quests.k3_rache;
  if (rache && !rache.steps.some((s) => s.done?.requires_flags?.includes('auf_starling_gesehen'))) {
    rache.steps = [...rache.steps, { text: 'Starling am Endbahnhof stellen', done: { requires_flags: ['auf_starling_gesehen'] }, target: { map: 'ds_endbahnhof', id: 'auf_starling_bahnsteig', label: 'Endbahnhof' } },
      { text: 'Ihm in den Zug nach oben folgen', done: { requires_flags: ['auf_verbrannt'] }, target: { map: 'ds_endbahnhof', id: 'auf_zug_nach_oben', label: 'Endbahnhof' } }];
  }
  // Kapitel 4: Der Sturz. Calderwick, die Stadt der Gefallenen
  content.cases = [...(content.cases ?? []).filter((c) => c.id !== 'kapitel4_aufstieg'), { id: 'kapitel4_aufstieg', title: 'Kapitel 4: Der Aufstieg' }];
  content.quests.k4_aufstieg = {
    title: 'Kapitel 4: Die Stadt der Gefallenen', kind: 'main', case: 'kapitel4_aufstieg',
    summary: 'Oben wurdest du verbrannt, egal wie stark du warst. Jetzt liegst du in Calderwick, wo die Gefallenen leben: Halbgötter, Halbengel und Engel, die oben gescheitert sind. Werde stärker. Irgendwo hier fährt der nächste Zug nach oben.',
    steps: [
      { text: 'Sieh dich an der Aufschlagstelle um', done: { requires_flags: ['auf_cw_aufgewacht'] }, target: { map: 'cw_gleisfuss', id: 'auf_cw_aufschlag', label: 'Gleisfuß' } },
      { text: 'Werde stärker: Sequenz 3 (Heiliger)', done: { requires_seq: 3 } },
    ],
  };
  const fuss = content.maps[STURZ_ZIEL.map];
  if (fuss) {
    fuss.interactables = [...(fuss.interactables ?? []),
      { id: 'auf_cw_aufschlag', kind: 'read', tile: [4, 18], prompt: 'Die Aufschlagstelle', title: 'Calderwick', marker: true, done_flag: 'auf_cw_aufgewacht',
        visible_if: { requires_flags: ['auf_verbrannt'] },
        text: 'Ein Krater im Kalk, noch warm. Du hast ihn gemacht. Ringsum stehen Leute, die nicht erschrecken. Einer zuckt mit den Schultern: „Wieder einer von oben. Jede Woche einer.“\n\nCalderwick ist die Stadt der Gefallenen. Halbgötter, Halbengel, sogar Engel, die oben gescheitert sind, leben hier zwischen Monstern, die so stark sind wie sie selbst. Du weißt nicht, ob du die Prüfung bestanden hast oder ob sie gerade erst beginnt.\n\nNiemand hier hilft dir. Werde stärker.' },
    ];
  }
  return content;
}
