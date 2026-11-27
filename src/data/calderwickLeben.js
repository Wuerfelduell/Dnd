/**
 * Calderwick lebt (Seb 2026-11-27: „Calderwick fühlt sich immer noch nicht belebt an“).
 * Wie in Dunscar (dunscarPassanten.js, world/DunscarPassanten.js) laufen auf den sechs Terrassen Passanten mit Tagesablauf,
 * murmeln im Vorbeigehen, tratschen zu zweit, und es gibt kleine Straßenereignisse (Rohrpost, Fallglocke, Zeitung, Nachtwache …).
 * Unterschied: Calderwicks Terrassen haben kein festes Straßenkreuz. Die Karten bekommen `passanten.frei`, dann sucht die
 * Welt die Wege selbst über freie Kacheln (Breitensuche) zwischen den Rändern (Treppe unten links, oben rechts) und den Haustüren.
 * Calderwick ist die Stadt der Gefallenen: Wer von oben stürzt, landet hier, wird ins Fallbuch eingetragen und hofft auf den Zug nach oben.
 */
import { CW_TERRASSEN } from './calderwickStadtplan.js';

/** Art je Terrasse; bestimmt Dichte, Gerede und Ereignisse. */
export const CW_ART = {
  cw_gleisfuss: 'cw_gleis', cw_setzergasse: 'cw_werk', cw_quittungsmarkt: 'cw_markt',
  cw_roehrenhof: 'cw_werk', cw_witwenterrasse: 'cw_wohnen', cw_kronenarchiv: 'cw_archiv',
};

export const CW_DICHTE = {
  cw_gleis: { morgen: 8, mittag: 6, abend: 8, nacht: 2 },
  cw_werk: { morgen: 7, mittag: 6, abend: 6, nacht: 2 },
  cw_markt: { morgen: 6, mittag: 10, abend: 7, nacht: 2 },
  cw_wohnen: { morgen: 6, mittag: 6, abend: 9, nacht: 3 },
  cw_archiv: { morgen: 5, mittag: 6, abend: 4, nacht: 1 },
};

/** Calderwick: blasser, kühler Stich (Papier, Tinte, Messing), damit niemand wie aus Dunscar aussieht. */
export const CW_FARBSTICH = [0xe8e4f0, 0xd6dbe6, 0xc8c3d6, 0xe6dccb, 0xbfc9d0, 0xd9cfe0, 0xb4b0c4];

export const CW_GEMURMEL = {
  allgemein: [
    'Wer von oben fällt, fällt nicht weich.',
    'Bist du schon im Fallbuch? Alle sind im Fallbuch.',
    'Oben hatte ich einen Namen. Hier hab ich eine Nummer.',
    'Der Zug nach oben? Ja, der fährt. Für andere.',
    'Pass auf die Treppen auf. Die zählen mit.',
    'Hier unten stempelt man sogar das Wetter.',
    'Neu hier? Man sieht’s an den Schuhen. Noch ganz.',
  ],
  morgen: [
    'Erste Rohrpost schon da. Nichts für mich.',
    'Die Setzer sind wieder vor der Sonne wach.',
    'Frühstück? Quittung zuerst.',
    'Heute fällt bestimmt wieder einer. Fällt immer einer.',
  ],
  mittag: [
    'Am Quittungsmarkt zahlen sie mit Zetteln. Und Zettel mit Zetteln.',
    'Die Küche oben hat Suppe. Witwensuppe, sagen sie.',
    'Mittag. Die Röhren pfeifen leiser.',
    'Wer im Archiv nachfragt, kommt mit mehr Fragen raus.',
  ],
  abend: [
    'Feierabend. Wenigstens das gibt es auch hier unten.',
    'Die Laternen auf den Terrassen gehen eine nach der anderen an.',
    'Heim. Falls man das so nennen darf.',
    'Heut Abend singen sie wieder in der Küche. Leise.',
  ],
  nacht: [
    'Nachts hört man oben die Züge. Ganz fern.',
    'Die Kisten fahren nur nachts. Frag nicht, welche.',
    'Psst. Im Kronenarchiv brennt noch Licht.',
    'Wer nachts die Treppen nimmt, hat was zu verbergen. Oder nichts zu verlieren.',
  ],
  cw_gleis: [
    'Der Pendelzug nach Dunscar hat wieder Verspätung.',
    'Hesk trägt wieder einen vom Krater weg.',
    'Am Gleisfuß warten sie auf den Zug nach oben. Seit Jahren.',
    'Telegramm nach oben? Kostet extra. Antwort kostet doppelt.',
  ],
  cw_werk: [
    'Die Setzerei druckt mehr Namen, als es Leute gibt.',
    'In den Röhren klopft es. Das ist nur die Post. Meistens.',
    'Bleilettern im Brot. Berufskrankheit.',
    'Die Sortiergrube schluckt Kapseln. Und manchmal Sortierer.',
  ],
  cw_markt: [
    'Drei Quittungen für ein Brot? Gestern waren es zwei.',
    'Lottie nimmt alles ins Pfand. Sogar Erinnerungen, heißt es.',
    'Mina hat heute frische Ware. Frisch gefallen.',
    'Feilschen ist hier Pflicht. Wer nicht feilscht, ist verdächtig.',
  ],
  cw_wohnen: [
    'Die Witwenkasse zahlt diesen Monat wieder nicht.',
    'Oben auf der Terrasse hängt die Wäsche schief. Wie alles.',
    'Kinder, weg von der Kante!',
    'Meine Nachbarin war mal Gräfin. Oben.',
  ],
  cw_archiv: [
    'Im Archiv stehen zwölf Namen mit derselben Tinte gestrichen.',
    'Die Villa da hinten hat nie Besuch. Nur Kisten.',
    'Ruth Malliver findet jedes Blatt. Fast jedes.',
    'Wer ins Kronenarchiv will, braucht einen Stempel. Für den Stempel auch.',
  ],
  bedingt: [
    { text: 'Ist das nicht die Gestalt vom Aushang?', if: { requires_wanted: 1 } },
    { text: 'Weg hier, die suchen jemanden.', if: { requires_wanted: 2 } },
    { text: 'Ihr zwei seid doch frisch gefallen, oder?', if: { requires_p2: true } },
    { text: 'Du riechst nach oben. Nach Licht.', if: { requires_seq: 4 } },
    { text: 'Die Laternen flackern, wenn du vorbeigehst.', if: { requires_seq: 3 } },
  ],
};

export const CW_TRATSCH = [
  ['Wieder einer gefallen heute Nacht.', 'Lebt er?', 'Er steht im Fallbuch. Das reicht Vera.'],
  ['Hast du deine Quittung?', 'Welche?', 'Die für die Quittung.'],
  ['Kommt der Zug nach oben noch mal?', 'Sagen sie jedes Jahr.'],
  ['Die Rohrpost hat mir einen leeren Zettel gebracht.', 'Dann hat dir oben einer geschrieben.'],
  ['Was war deine Arbeit oben?', 'Fragt man hier nicht.', '… Richter.', 'Hab ich nicht gehört.'],
  ['Hesk trägt manche zweimal, heißt es.', 'Sag so was nicht auf der Treppe.'],
  ['Die Setzer drucken die Namen neu.', 'Und die alten?', 'Werden gestrichen.'],
  ['Wer ist der Fremde da?', 'Ein Neuer. Guck, wie er nach oben schaut.'],
  ['Suppe heute Abend?', 'Wenn die Witwen kochen, immer.'],
  ['Die Kisten nach Briarholt …', 'Psst. Kur. Man sagt Kur.'],
];

/** Ereignisse: `rufe` wie in Dunscar; `typ` wählt das Verhalten in world/DunscarPassanten.js. */
export const CW_EREIGNISSE = {
  rohrpost: {
    wann: ['morgen', 'mittag', 'abend'], arten: ['cw_werk', 'cw_markt', 'cw_gleis', 'cw_archiv'], ton: 'ui_zeitung', typ: 'ausruf',
    rufe: ['Rohrpost! Kapsel für die Setzergasse!', 'Da zischt eine. Wieder nicht für mich.', 'Die Röhre spuckt Zettel aus!'],
  },
  fallglocke: {
    wann: ['morgen', 'mittag', 'abend', 'nacht'], arten: [], ton: 'ds_schichtglocke', typ: 'ausruf', wackeln: true,
    rufe: ['Die Fallglocke! Wieder einer von oben!', 'Hört ihr? Es ist einer gefallen.', 'Zum Krater! … Ach, Hesk holt ihn schon.'],
  },
  zeitung: {
    wann: ['morgen', 'mittag'], arten: [], ton: 'ui_zeitung', typ: 'zeitung',
    rufe: ['Fallblatt! Die Liste von heute!', 'Wer ist gefallen? Alle Namen, ein Schilling!', 'Neu im Fallbuch! Lest selbst!'],
  },
  streit: {
    wann: ['mittag', 'abend'], arten: ['cw_markt', 'cw_wohnen'], ton: null, typ: 'streit',
    zeilen: [
      ['Das ist mein Stempel!', 'Steht nicht dein Name drauf.', 'Doch. Gestempelt!'],
      ['Du schuldest mir drei Quittungen!', 'Und du mir eine Antwort von oben!', 'Dann sind wir quitt.'],
      ['Ich war oben Kapitän!', 'Und ich war oben König.', 'Hier unten seid ihr beide nass.'],
    ],
  },
  nachtwache: { wann: ['nacht'], arten: [], ton: null, typ: 'nachtwache', rufe: ['Lampen runter, Türen zu!', 'Niemand fällt nach Mitternacht. Angeblich.', 'Wer da? … Ins Fallbuch mit dir. Morgen.'] },
  zug_oben: {
    wann: ['abend', 'nacht'], arten: ['cw_gleis', 'cw_archiv'], ton: 'ds_zug_fern', typ: 'ausruf', wackeln: true,
    rufe: ['Hört ihr? Oben fährt ein Zug.', 'Der fährt nicht für uns.', 'Eines Tages bin ich da drin.'],
  },
};

export const CW_ROLLEN = {
  morgen: ['arbeiter', 'arbeiter', 'markt', 'wohnen', 'kind'],
  mittag: ['markt', 'markt', 'wohnen', 'arbeiter', 'kind'],
  abend: ['arbeiter', 'wohnen', 'wohnen', 'markt'],
  nacht: ['nacht', 'nacht', 'wohnen'],
};

/** Alle Texte für Wörterbuch und Tests. */
export function cwTexte() {
  const out = [];
  for (const v of Object.values(CW_GEMURMEL)) for (const e of v) out.push(typeof e === 'string' ? e : e.text);
  for (const t of CW_TRATSCH) out.push(...t);
  for (const e of Object.values(CW_EREIGNISSE)) { out.push(...(e.rufe ?? [])); for (const z of e.zeilen ?? []) out.push(...z); }
  return out;
}

export function cwGemurmelFuer(state, art, abschnitt) {
  const bedingt = CW_GEMURMEL.bedingt.filter((e) => state?.meets?.(e.if)).map((e) => e.text);
  return { normal: [...CW_GEMURMEL.allgemein, ...(CW_GEMURMEL[abschnitt] ?? []), ...(CW_GEMURMEL[art] ?? [])], bedingt };
}

const LAUF = new Set(['.']);

/** Markiert die Terrassen (nach dem Stadtplan): Ränder = Treppen unten links und oben rechts, Türen = Feld vor jeder 'D'-Fassadentür. */
export function applyCalderwickLeben(content) {
  for (const id of CW_TERRASSEN) {
    const m = content.maps?.[id];
    if (!m?.rows?.length) continue;
    const frei = (x, y) => LAUF.has(m.rows[y]?.[x]);
    const raender = [];
    const unten = m.spawns?.default;
    const oben = m.spawns?.oben;
    if (unten && frei(...unten)) raender.push({ tile: [...unten], seite: 'W' });
    if (oben && frei(...oben)) raender.push({ tile: [...oben], seite: 'E' });
    const tueren = [];
    m.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch !== 'D' || !frei(x, y + 1)) return;
      if (tueren.some((t) => t.tile[1] === y + 1 && Math.abs(t.tile[0] - x) <= 1)) return; // breite Tür nur einmal
      tueren.push({ tile: [x, y + 1], seite: 'H' });
    }));
    m.passanten = { art: CW_ART[id] ?? 'cw_wohnen', frei: true, stadt: 'calderwick', raender, tueren };
  }
}
