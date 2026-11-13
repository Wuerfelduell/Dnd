/**
 * Kapitel 4: Der Aufstieg (Seb, 2026-11-12, Konzept „Nach Dunscar: Der Aufstieg“).
 *
 * - Auslöser: Starling flieht am Endbahnhof von Dunscar in den Zug nach OBEN. Einsteigen darf nur, wer den Schaffner des Alten
 *   besiegt (Seq 4 schafft ihn, Seq 5 praktisch nie; im Koop jeder allein). Keine Sequenz-Abfrage (Seb 2026-11-13).
 * - Die Himmelsstadt: keine Monster, nur Halbgötter (Vorhof), Heilige/Halbengel (Höfe) und Engel (Grat), dazu Starling vor dem
 *   Thron des Alten. Echte Kämpfe, man darf versuchen alle zu töten, aber niemand dort fällt (`unbesiegbar` in Combat.js).
 * - Die Verbrennung: man wird IMMER verbrannt, egal wie stark (jede Niederlage oben, spätestens am Thron).
 * - Der Sturz: man stirbt nicht, man fällt nach Calderwick. Dort beginnt Kapitel 4 (k4_aufstieg).
 */
import { seeded } from '../core/Gatherings.js';

export const HIMMEL = 'hs_himmelsstadt';
export const STURZ_ZIEL = { map: 'cw_gleisfuss', spawn: 'default' };
/** Was die Verbrennung setzt: Kapitel 3 ist vorbei, Calderwick erreicht, Kapitel 4 beginnt. */
export const STURZ_FLAGS = ['auf_verbrannt', 'k4_arrived', 'kapitel3_done', 'cwa_ankunft_sicher', 'cwa_werkstatt', 'cwa_akt1_done', 'cwa_akt2_done', 'cwa_akt3_done', 'cwa_akt4_done'];
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

/**
 * Prüfung vor dem Zug nach oben (Seb 2026-11-13): keine Sequenz-Abfrage, sondern ein Gegner, den ein Seq-5-Held praktisch nie
 * schafft und ein Seq-4-Held meist (tools/sim/zugwaechter.mjs). Calderwick ist eine Einbahnstraße und das Seq-3-Ritual gibt es nur dort.
 * Im Koop kämpft jeder allein (`solo_je_spieler`), der Zug nimmt nur mit, wer gewonnen hat (Flag auf_schaffner_p1/_p2).
 */
export const SCHAFFNER = 'auf_schaffner';
export const SCHAFFNER_FLAG = (n) => `auf_schaffner_p${n}`;
function schaffnerKampf() {
  return {
    id: SCHAFFNER, name: 'Der Schaffner des Alten', sprite: 'wild', sheet: 'enemy_bn_schaffner_ohne_zug', tint: '#fff2c8', occult: true,
    chapter: 3, boss: false, elite: true, tier_seq: 4, hp: 1600, armor: 35, fleeable: true, solo_je_spieler: true, sieg_flag: 'auf_schaffner',
    intro: 'Vor der offenen Tür steht ein Schaffner ohne Gesicht. Er hält die Zange hoch wie eine Waage. „Fahrkarte“, sagt er. „Oben zahlt man mit Gewicht. Wer zu leicht ist, kommt nicht an, er verbrennt unterwegs. Zeig mir, was du wiegst.“',
    attacks: [schlag('Lochzange', 14, [1200, 1900]), schlag('Pfiff zur Abfahrt', 13, [900, 1400, 1900], { nerves: 8 }),
      { name: 'Fahrplan', action: 'guard', value: 8, text: 'Er schlägt im Fahrplan nach. Seine Uniform wird schwer wie Gusseisen: +8 Abwehr.' }, schlag('Türen schließen', 17, [1500, 2400], { unparryable: true })],
    phase2: { meldung: 'Der Schaffner reißt die Uniform auf. Darunter ist nur Licht.', attacks: [schlag('Licht aus dem Waggon', 15, [1000, 1600, 2200], { unparryable: true }), schlag('Lochzange', 17, [1100, 1700]),
      { name: 'Nachzahlung', action: 'heal', value: 300, text: 'Er bucht nach: +300 Leben.' }, schlag('Letzter Pfiff', 20, [1800], { nerves: 10 })] },
    on_win: {}, lose_money: 0,
    lose_text: 'Der Schaffner tippt dir mit der Zange gegen die Brust, fast freundlich. „Zu leicht. Komm wieder, wenn du ein Halbgott bist.“ Du wachst auf dem Bahnsteig auf, der Zug wartet immer noch.',
  };
}

const STARLING_TEXT = 'Er steht am Ende des Bahnsteigs, wo die Gleise nicht weiterführen, sondern nach oben. Professor Lucius Starling, unverändert, nur heller.\n\n„Sie sind also gekommen“, sagt er, ohne sich umzudrehen. „Er hat mir gesagt, dass Sie kommen. Er hat mir auch gesagt, was dann geschieht.“\n\nEin Zug ohne Lok fährt ein. Starling steigt ein, die Türen bleiben offen. Der Zug fährt nicht los. Er wartet. Auf dich. Vor der offenen Tür steht ein Schaffner ohne Gesicht.';
const SCHAFFNER_TEXT = 'Der Schaffner hebt die Zange. „Oben zahlt man mit Gewicht, nicht mit Geld. Wer leichter ist als ein Halbgott, verbrennt schon auf der Fahrt, und dort, wo der Zug am Ende hält, gibt es keinen Weg zurück.“\n\nEr tritt dir in den Weg. „Zeig mir, was du wiegst. Wer reist, zahlt selbst: Jeder von euch kommt einzeln an mir vorbei.“';

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

  content.encounters[SCHAFFNER] = schaffnerKampf();
  content.loot[SCHAFFNER] = { money: [0, 0], drops: [] };

  // Dunscar, Endbahnhof: Starling flieht in den Zug nach oben. Einsteigen darf nur, wer den Schaffner des Alten besiegt
  // (Seq 4 schafft ihn, Seq 5 praktisch nie). Keine Sequenz-Abfrage, sondern eine Aufgabe (Seb 2026-11-13).
  const bahnhof = content.maps.ds_endbahnhof;
  if (bahnhof) {
    bahnhof.interactables = [...(bahnhof.interactables ?? []),
      { id: 'auf_starling_bahnsteig', kind: 'read', tile: [8, 10], prompt: 'Ein Mann im hellen Mantel', title: 'Starling', marker: true, done_flag: 'auf_starling_gesehen',
        visible_if: { requires_flags: ['k3_arrived'], hide_if_flags: ['auf_starling_gesehen'] },
        text: STARLING_TEXT },
      { id: 'auf_schaffner_tuer', kind: 'read', tile: [5, 10], prompt: 'Der Schaffner an der Zugtür', title: 'Der Schaffner des Alten', marker: true,
        visible_if: { requires_flags: ['auf_starling_gesehen'], hide_if_alle_flag: 'auf_schaffner' },
        text: SCHAFFNER_TEXT, effects: { combat: SCHAFFNER } },
      { id: 'auf_zug_nach_oben', kind: 'read', tile: [4, 10], prompt: 'Der Zug nach oben', title: 'Der Zug nach oben', marker: true,
        visible_if: { requires_flags: ['auf_starling_gesehen'], requires_alle_flag: 'auf_schaffner', hide_if_flags: ['k4_arrived'] },
        text: 'Du steigst ein. Die Türen schließen sich ohne Laut, und der Boden unter dem Zug kippt weg. Kein Rattern, kein Pfiff, nur ein langes Steigen durch Rauch, dann durch Wolken, dann durch etwas, das heller ist als jedes Licht, das du kennst.\n\nDunscar bleibt unter dir zurück. Du wirst es nicht wiedersehen.',
        effects: { travel: { map: HIMMEL, spawn: 'default' } } },
      // Rückkehrer (alte Spielstände, die zu früh gestürzt sind): der Zug bringt sie ohne zweite Himmelsstadt zurück nach Calderwick
      { id: 'auf_zug_zurueck', kind: 'read', tile: [4, 10], prompt: 'Der Zug nach oben', title: 'Zurück nach Calderwick', marker: true,
        visible_if: { requires_flags: ['k4_arrived', 'auf_rueckweg'], requires_alle_flag: 'auf_schaffner' },
        text: 'Diesmal lässt der Schaffner dich ohne ein Wort durch. Der Zug steigt, aber nicht bis ganz nach oben. Irgendwo zwischen Rauch und Wolken öffnen sich die Türen, und Calderwick fängt dich auf wie beim ersten Mal, nur weniger hart.',
        effects: { clears_flags: ['auf_rueckweg'], travel: STURZ_ZIEL } },
    ];
  }
  // Kapitel 3 bekommt sein Ende: Starling am Endbahnhof
  const rache = content.quests.k3_rache;
  if (rache && !rache.steps.some((s) => s.done?.requires_flags?.includes('auf_starling_gesehen'))) {
    rache.steps = [...rache.steps, { text: 'Starling am Endbahnhof stellen', done: { requires_flags: ['auf_starling_gesehen'] }, target: { map: 'ds_endbahnhof', id: 'auf_starling_bahnsteig', label: 'Endbahnhof' } },
      { text: 'Den Schaffner des Alten besiegen (im Koop jeder selbst)', done: { requires_alle_flag: 'auf_schaffner' }, target: { map: 'ds_endbahnhof', id: 'auf_schaffner_tuer', label: 'Endbahnhof' } },
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
      // Absicherung alter Spielstände: wer zu früh (unter Seq 4) gestürzt ist, käme hier nie zum Seq-3-Ritual. Ein Lastenzug fährt
      // ihn zurück nach Dunscar, solange einer von euch schwächer als ein Halbgott ist; zurück geht es nur am Schaffner vorbei.
      { id: 'auf_cw_lastenzug', kind: 'read', tile: [6, 17], prompt: 'Ein Lastenzug nach unten', title: 'Der Lastenzug nach unten', marker: true,
        visible_if: { requires_flags: ['k4_arrived'], requires_einer_unter_seq: 4, hide_if_flags: ['auf_rueckweg'] },
        text: 'Am Rand der Aufschlagstelle steht ein Lastenzug, der Kalk und Schutt nach unten bringt. Ein Bremser mustert dich. „Du bist zu leicht für Calderwick. Hier oben wirst du nie ein Heiliger, dir fehlt das Gewicht eines Halbgotts. Ich nehm dich mit nach Dunscar. Komm wieder, wenn du Sequenz 4 bist, der Schaffner am Endbahnhof lässt dich dann durch.“',
        effects: { sets_flags: ['auf_rueckweg'], travel: { map: 'ds_endbahnhof', spawn: 'default' } } },
    ];
  }
  applyCalderwick(content);
  return content;
}

// ---------------------------------------------------------------------------------------------------------------------
// Schritt 2: Calderwick, die Stadt der Gefallenen (Seb 2026-11-12)
// - Die Detektivgeschichte um Wetherby und Bellcross fliegt raus: keine Akte-Stationen (cwa_*), alle Terrassen offen ab dem Sturz.
// - 10 verdorbene Pfadgebiete, je eins pro Pfad. Sie sind die bisherigen Gildensitze der Sequenz 3 (o3_<pfad>, PR #416), die von Dunscar
//   nach Calderwick ziehen. Je Gebiet 2 benannte Beyonder: das Gildenoberhaupt (Seq 3, Heiliger) und der Stellvertreter (Seq 4, Halbgott).
//   Alles andere sind Monster mit Halbgott-Stärke.
// - Sequenz 0 als Gerede und Kreideschrift; irgendwo fährt der nächste Zug nach oben (zweiter Aufstieg, noch nicht gebaut).

/** Was in Calderwick ohne dich passiert ist (die gestrichene Akte gilt als gelaufen, damit Viertel und Nebenaufträge offen sind). */
export const CALDERWICK_WELT_FLAGS = ['cwa_ankunft_sicher', 'cwa_werkstatt', 'cwa_akt1_done', 'cwa_akt2_done', 'cwa_akt3_done', 'cwa_akt4_done'];
export const CW_GEBIET_DANGER = 8;

/** Je Pfad: Name des verdorbenen Viertels, Verderbnis, Oberhaupt (Seq 3) und Stellvertreter (Seq 4). */
export const CW_GEBIETE = {
  laterne: { viertel: 'Das Dunkelglasviertel', oberhaupt: 'Ansgar Lumen', vize: 'Helke Docht', verderbnis: 'Alle Laternen brennen schwarz. Wer hier Licht macht, sieht Dinge, die noch nicht geschehen sind, und nichts von dem, was vor ihm steht.' },
  faden: { viertel: 'Das Garnviertel', oberhaupt: 'Morwenna Spindel', vize: 'Tobit Haspel', verderbnis: 'Fäden hängen zwischen den Häusern wie Wäsche. Wer einen berührt, wacht an einem anderen Ort auf, mit Erinnerungen, die nicht seine sind.' },
  maske: { viertel: 'Das Larvenviertel', oberhaupt: 'Vesper Larve', vize: 'Ilse Ohnebild', verderbnis: 'Niemand hier trägt sein eigenes Gesicht. In den Fenstern hängen abgelegte Gesichter zum Trocknen.' },
  echo: { viertel: 'Das Hallviertel', oberhaupt: 'Cassian Hall', vize: 'Rike Nachklang', verderbnis: 'Jeder Laut kommt dreimal zurück, das dritte Mal mit fremden Worten. Die Monster hier jagen nach Gehör.' },
  kessel: { viertel: 'Das Sudviertel', oberhaupt: 'Brannagh Sud', vize: 'Oswin Schaum', verderbnis: 'Aus den Gullys steigt grüner Dampf. Die Pfützen kochen, und was darin schwimmt, war einmal ein Nachbar.' },
  eisen: { viertel: 'Das Nietenviertel', oberhaupt: 'Gerwin Amboss', vize: 'Hedda Niet', verderbnis: 'Rost wächst wie Moos über alles, auch über Menschen. Jeder Schritt wiegt doppelt, und die Wände rücken nachts zusammen.' },
  schluessel: { viertel: 'Das Türenviertel', oberhaupt: 'Quirin Bart', vize: 'Lotte Falz', verderbnis: 'Jede Tür führt woandershin als gestern. Manche Bewohner suchen seit Jahren den Weg zurück in ihre eigene Küche.' },
  sq_waage: { viertel: 'Das Gewichtsviertel', oberhaupt: 'Edmund Lot', vize: 'Saskia Gran', verderbnis: 'Alles hat hier einen Preis, auch ein Atemzug. Wer nicht zahlt, wird leichter, bis der Wind ihn mitnimmt.' },
  sq_moor: { viertel: 'Das Faulviertel', oberhaupt: 'Mutter Torva', vize: 'Jorin Ried', verderbnis: 'Torf quillt aus den Kellern. Die Straßen erinnern sich an jeden, der sie betreten hat, und manche halten ihn fest.' },
  sq_uhr: { viertel: 'Das Stillviertel', oberhaupt: 'Severin Unruh', vize: 'Klara Hemmung', verderbnis: 'Die Zeit läuft hier in Stücken. Ein Schritt dauert eine Stunde, der nächste einen Herzschlag. Die Monster sind schneller als ihre Schatten.' },
};
// Seb 2026-11-13: Die Pfadgebiete stammen aus alten Seq-3-Entwürfen und waren je Pfad völlig ungleich (Schlüssel 136 Leben, Moor 2394).
// Darum bekommen alle zehn Viertel dieselben Werte je Rang, unabhängig vom Pfad und vom Spieler: Leben, stärkster Schlag (die übrigen
// Angriffe behalten ihr Verhältnis dazu) und Rundendeckel. Ziel: Seq 4 (Eisen, geübt) gewinnt etwa 65 % der normalen Kämpfe.
export const CW_MONSTER = {
  normal: { hp: 1700, dmg: 54, max_round_dmg: 0.34 },
  elite: { hp: 1850, dmg: 52, max_round_dmg: 0.34 },
  boss: { hp: 8500, dmg: 72, max_round_dmg: 0.15 },
};
function cwAngleichen(e, rang) {
  const z = CW_MONSTER[rang];
  const top = Math.max(1, ...e.attacks.filter((a) => !a.action).map((a) => a.damage ?? 0));
  Object.assign(e, { cw_stark: true, hp: z.hp, max_round_dmg: z.max_round_dmg, attacks: e.attacks.map((a) => (a.action ? a : { ...a, damage: Math.round(((a.damage ?? 0) * z.dmg) / top) })) });
}
const CW_STREIFEN = 18;
const SEQ0_TEXT = 'Sequenz 0. Über dem Engel, über der ersten Sequenz, steht keine Stufe mehr, sondern ein Thron. Wer Sequenz 0 erreicht, wird kein Heiliger und kein Engel. Er wird ein Gott, wie der Alte. Jeder in Calderwick will dorthin. Niemand von ihnen ist je angekommen.';

function calderwickGebiete(content) {
  const cwPins = content.travelRules?.cities?.calderwick?.pins;
  for (const [pid, cw] of Object.entries(CW_GEBIETE)) {
    const map = content.maps[`o3_${pid}`];
    if (!map) continue;
    const o3 = `o3_${pid}`;
    map.city = 'calderwick';
    map.danger = CW_GEBIET_DANGER;
    map.name = cw.viertel;
    // Monster: Halbgott-Stärke
    const normal = Object.keys(content.encounters).filter((id) => new RegExp(`^${o3}_g\\d+$`).test(id));
    for (const id of normal) {
      const e = content.encounters[id];
      if (e.cw_stark) continue;
      cwAngleichen(e, 'normal');
      content.loot[id] = { ...(content.loot[id] ?? {}), repeat: true, money: [600, 1200], drops: content.loot[id]?.drops ?? [] };
    }
    for (const id of Object.keys(content.encounters).filter((x) => new RegExp(`^${o3}_siegel\\d+$`).test(x))) if (!content.encounters[id].cw_stark) cwAngleichen(content.encounters[id], 'elite');
    // Oberhaupt (Seq 3, Heiliger) bekommt einen Namen
    const chef = content.encounters[`${o3}_tiefe`];
    if (chef && !chef.cw_stark) cwAngleichen(chef, 'boss');
    if (chef && !chef.name.startsWith(cw.oberhaupt)) chef.name = `${cw.oberhaupt}, ${chef.name}`;
    // Stellvertreter (Seq 4, Halbgott): frei herausforderbar, kommt nicht wieder
    const vizeId = `${o3}_vize`;
    content.encounters[vizeId] = {
      id: vizeId, name: `${cw.vize}, Stellvertretung`, sprite: 'wild', sheet: `hg_battle_${pid}`, pathway: pid, occult: true, chapter: 5, boss: true, elite: false,
      hp: 12000, armor: 8, max_round_dmg: 0.12, fleeable: true, zone: o3, wild: true,
      attacks: [{ name: 'Halbgöttlicher Schlag', damage: 140, hits: [900, 1500] }, { name: 'Mythische Gestalt', damage: 260, hits: [2200], unparryable: true }, { name: 'Wille des Pfades', damage: 90, hits: [600, 900, 1200, 1500] }],
      intro: `${cw.vize}, Halbgott und Stellvertretung des Oberhaupts, tritt dir in den Weg. „Ein Neuer von oben. Alle fallen hierher, und alle glauben, sie wären die Ausnahme.“`,
      win_text: `${cw.vize} geht in die Knie. „Dann versuch es eben bei ${cw.oberhaupt}“, keucht der Halbgott. „Oben warst du Asche. Hier bist du wenigstens Glut.“`,
      lose_to: { map: o3, spawn: 'default' }, lose_money: 0, lose_text: 'Du kommst am Rand des Viertels zu dir. Die Stellvertretung hat dich nicht einmal getötet. Das ist schlimmer.',
      flee_text: 'Du ziehst dich zurück. Hinter dir lacht jemand.', on_win: {},
    };
    content.loot[vizeId] = { money: [3000, 5000], drops: [{ item: kernzutatId(pid, 4), chance: 0.15 }] };
    // Karte: Viertel-Tafel, Stellvertreter, mehr Monster
    const taken = new Set([...(map.interactables ?? []), ...(map.roamers ?? [])].map((i) => i.tile.join(',')));
    const [sx, sy] = map.spawns.default;
    const free = [];
    map.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === 'I' || x < 2 || y < 2 || x > row.length - 3 || y > map.rows.length - 3 || row[x - 1] === 'I' || row[x + 1] === 'I' || taken.has(`${x},${y}`)) return;
      if (Math.abs(x - sx) + Math.abs(y - sy) >= 10) free.push([x, y]);
    }));
    const rng = seeded(`cw|${pid}`);
    const pick = () => free.splice(Math.floor(rng() * free.length), 1)[0];
    map.interactables = [...map.interactables.filter((i) => !['cw_tafel', 'vize'].some((k) => i.id === `${o3}_${k}`)),
      { id: `${o3}_cw_tafel`, kind: 'read', tile: [2, 13], prompt: cw.viertel, title: `Calderwick: ${cw.viertel}`, marker: false,
        text: `${cw.verderbnis}\n\nHier sitzt ${content.encounters[`${o3}_tiefe`] ? `die Gilde „${chefGilde(content, pid)}“` : 'eine Gilde'}. Oberhaupt: ${cw.oberhaupt}. Stellvertretung: ${cw.vize}. Beide sind Beyonder in Menschengestalt, alles andere hier sind Monster.` },
      { id: `${o3}_vize`, kind: 'combat', encounter: vizeId, tile: pick(), prompt: `${cw.vize} herausfordern`, marker: true, visible_if: { hide_if_flags: [`won_${vizeId}`] } }];
    const more = Math.max(0, CW_STREIFEN - (map.roamers ?? []).length);
    map.roamers = [...(map.roamers ?? []), ...Array.from({ length: more }, (_, i) => ({ id: `${o3}_cw${i + 1}`, encounter: normal[i % normal.length], tile: pick(), elite_chance: 0 })).filter((r) => r.tile)];
    // Reisen: nur noch aus Calderwick, ab dem Sturz
    content.travel = content.travel.filter((t) => t.map !== o3);
    content.travel.push({ map: o3, spawn: 'default', city: 'calderwick', name: cw.viertel, desc: `Gefahr ${CW_GEBIET_DANGER}. ${cw.verderbnis}`, requires_flags: ['k4_arrived'] });
    for (const [cid, c] of Object.entries(content.travelRules?.cities ?? {})) if (cid !== 'calderwick' && c.pins?.[o3]) delete c.pins[o3];
    if (cwPins) cwPins[o3] = [24 + 43 * Object.keys(CW_GEBIETE).indexOf(pid), 262];
  }
}
const kernzutatId = (pid, n) => `sq_zutat_${pid.replace(/^sq_/, '')}_${n}`;
const chefGilde = (content, pid) => content.maps[`o3_${pid}`]?.interactables?.find((i) => i.id === `o3_${pid}_bote`)?.title?.replace(/^Ein Mitglied von /, '') ?? '';

/** Akte raus, Stadt offen, Sequenz 0, der nächste Zug nach oben. */
function calderwickOffen(content) {
  for (const m of Object.values(content.maps)) {
    if (m.city !== 'calderwick' || !m.interactables) continue;
    m.interactables = m.interactables.filter((i) => !i.id.startsWith('cwa_'));
  }
  const fuss = content.maps.cw_gleisfuss;
  if (fuss) fuss.interactables.push({ id: 'auf_cw_seq0', kind: 'read', tile: [8, 18], prompt: 'Kreideschrift an der Wand', title: 'Sequenz 0', marker: false, visible_if: { requires_flags: ['k4_arrived'] }, done_flag: 'auf_seq0_gelesen', text: SEQ0_TEXT });
  const archiv = content.maps.cw_kronenarchiv;
  if (archiv) archiv.interactables.push({ id: 'auf_cw_zug2', kind: 'read', tile: [30, 13], prompt: 'Ein Gleis, das in den Himmel führt', title: 'Der nächste Zug nach oben', marker: true, visible_if: { requires_flags: ['k4_arrived'] }, done_flag: 'auf_zug2_gesehen',
    text: 'Über dem Kronenarchiv endet ein Gleis in der Luft. Ein Schaffner ohne Gesicht wartet daneben, seit Jahren, sagen die Leute.\n\n„Der Zug nach oben fährt wieder“, sagt er. „Nicht für dich. Nicht so, wie du jetzt bist. Wer oben bestehen will, kommt als Heiliger oder gar nicht.“\n\n(Der zweite Aufstieg ist noch nicht gebaut.)' });
  const gossip = content.gossip?.calderwick;
  if (gossip) for (const map of Object.keys(gossip)) gossip[map] = [...gossip[map].filter((g) => !g.requires_flags?.some((f) => /^cwa_akt|^cwa_end/.test(f))),
    { text: 'Sequenz 0. Darüber redet hier jeder, und keiner war da. Ein Gott werden, wie der Alte. Dafür sind wir alle hier unten.', requires_flags: ['k4_arrived'] },
    { text: 'Jede Woche fällt einer von oben. Die meisten bleiben. Die wenigsten werden stark genug für den zweiten Zug.', requires_flags: ['k4_arrived'] }];
  const q = content.quests.k4_aufstieg;
  if (q) q.steps = [...q.steps.filter((s) => !s.done?.requires_flags?.some((f) => ['auf_seq0_gelesen', 'auf_zug2_gesehen'].includes(f))),
    { text: 'Lies, was an der Wand am Gleisfuß steht', done: { requires_flags: ['auf_seq0_gelesen'] }, target: { map: 'cw_gleisfuss', id: 'auf_cw_seq0', label: 'Gleisfuß' } },
    { text: 'Finde den nächsten Zug nach oben', done: { requires_flags: ['auf_zug2_gesehen'] }, target: { map: 'cw_kronenarchiv', id: 'auf_cw_zug2', label: 'Kronenarchiv' } }];
}

export function applyCalderwick(content) {
  calderwickGebiete(content);
  calderwickOffen(content);
  return content;
}
