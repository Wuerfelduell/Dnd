// Dunscar lebt: Passanten auf den Straßen der Viertel (world/DunscarPassanten.js).
// Reine Kulisse ohne Dialogfenster: Leute laufen von Haustüren und Straßenenden über das Straßenkreuz,
// folgen einem Tagesablauf (morgens zur Schicht, mittags Markt, abends heim, nachts nur Nachtvolk),
// murmeln im Vorbeigehen einen Satz, bleiben zu zweit kurz stehen und tratschen.
// Dazu kleine Straßenereignisse (Schichtglocke, Zeitungsjunge, Kalkböe, Streit, Nachtwache, Betrunkener, Güterzug).
// Figuren: Lauf-Blätter aus Kettlegate und Wexmoor, aber eingefärbt (Kalk, Ruß, Rost).

import { DAY_NIGHT_SECONDS, isNightAt } from '../core/Clock.js';

/** Art je Viertel; bestimmt Dichte und Gerede. Andere Dunscar-Außenkarten (Gefahrengebiete) bekommen keine Passanten. */
export const VIERTEL_ART = {
  ds_endbahnhof: 'bahn', ds_schwellenring: 'bahn', ds_signalhang: 'bahn', ds_letzter_bahnsteig: 'bahn',
  ds_arbeiterbogen: 'wohnen', ds_kalkmarkt: 'markt', ds_bruchstufen: 'bruch',
};

/** Wie viele Passanten gleichzeitig unterwegs sind, je Art und Tagesabschnitt. */
export const DICHTE = {
  bahn: { morgen: 7, mittag: 5, abend: 7, nacht: 2 },
  wohnen: { morgen: 6, mittag: 5, abend: 8, nacht: 3 },
  markt: { morgen: 5, mittag: 9, abend: 6, nacht: 2 },
  bruch: { morgen: 6, mittag: 3, abend: 5, nacht: 1 },
};

/** Tagesabschnitt aus der Spielzeit: die Tagphase (15 Min.) teilt sich in Morgen, Mittag und Abend. */
export function tagesabschnitt(playTime = 0) {
  if (isNightAt(playTime)) return 'nacht';
  const p = (playTime % DAY_NIGHT_SECONDS) / DAY_NIGHT_SECONDS;
  return p < 0.3 ? 'morgen' : p < 0.7 ? 'mittag' : 'abend';
}

/**
 * Wohin die Leute wollen: morgens weg von den Häusern zu den Straßenenden (zur Schicht),
 * abends von den Straßenenden zu den Haustüren (heim), sonst gemischt.
 */
export const RICHTUNG = { morgen: 'raus', abend: 'heim', mittag: 'gemischt', nacht: 'gemischt' };

/**
 * Lauf-Blätter aus alten Gebieten (16x32, 4 Richtungen) mit Rolle. Sie werden in Dunscar immer eingefärbt (FARBSTICH),
 * damit sie nicht wie die Leute aus Kettlegate oder Wexmoor aussehen.
 */
export const FIGUREN = [
  { sheet: 'npc_kaminkehrer', rollen: ['arbeiter', 'nacht'] },
  { sheet: 'npc_gaswerker', rollen: ['arbeiter'] },
  { sheet: 'npc_lehrling', rollen: ['arbeiter', 'markt'] },
  { sheet: 'npc_kutscher', rollen: ['arbeiter'] },
  { sheet: 'npc_matrose', rollen: ['arbeiter', 'nacht'] },
  { sheet: 'npc_waescherin', rollen: ['markt', 'wohnen'] },
  { sheet: 'npc_marktfrau', rollen: ['markt'] },
  { sheet: 'npc_student', rollen: ['markt'] },
  { sheet: 'npc_kind_streuner', rollen: ['kind'] },
  { sheet: 'npc_nachtwaechter', rollen: ['nacht'] },
  { sheet: 'npc_rattenfaenger', rollen: ['nacht', 'arbeiter'] },
  { sheet: 'npc_kgl_e_schornsteinfegerin', rollen: ['arbeiter'] },
  { sheet: 'npc_kgl_e_fischweib', rollen: ['markt'] },
  { sheet: 'npc_kgl_e_uhrlehrling', rollen: ['arbeiter', 'markt'] },
  { sheet: 'npc_kgl_e_bettler', rollen: ['nacht', 'wohnen'] },
  { sheet: 'npc_kgl_e_waescherin', rollen: ['wohnen', 'markt'] },
  { sheet: 'npc_kgl_e_kutscher', rollen: ['arbeiter'] },
  { sheet: 'npc_kgl_e_laternenanzuender', rollen: ['nacht'] },
  { sheet: 'npc_wxn_torfgraeber', rollen: ['arbeiter'] },
  { sheet: 'npc_wxn_telegrafist', rollen: ['arbeiter', 'markt'] },
  { sheet: 'npc_wxn_krabbe', rollen: ['kind'] },
  { sheet: 'npc_fs_salzsegen_gast_1', rollen: ['wohnen', 'markt'] },
  { sheet: 'npc_fs_salzsegen_gast_3', rollen: ['wohnen'] },
  { sheet: 'npc_fs_laternennacht_gast_2', rollen: ['wohnen', 'nacht'] },
  { sheet: 'npc_fs_laternennacht_gast_4', rollen: ['markt'] },
];

/** Farbstiche (Phaser-Tint, multipliziert): Kalkstaub, Ruß, Rost, Schlacke, kaltes Signalblau. */
export const FARBSTICH = [0xe4ddcf, 0xd2cabb, 0xb9b2a8, 0xd8b9a0, 0xc4cbd6, 0xcfc3a6, 0xa9a39b];

/** Dunscarer Arbeitskleidung für Figuren aus dem Zeichner (createCharacterSheet), nur falls keine Lauf-Blätter geladen sind. */
export const PALETTEN = [
  { rollen: ['arbeiter'], palette: { coat: '#6b6358', hat: '#2e3036', skin: '#c49c80', hair: '#4a3f36', legs: '#3a3c42' } },
  { rollen: ['arbeiter'], palette: { coat: '#8a8170', hat: '#5b5040', skin: '#b38a6c', hair: '#2b2622', legs: '#45403a' } },
  { rollen: ['arbeiter', 'nacht'], palette: { coat: '#3f4248', hat: '#24262b', skin: '#a8826a', hair: '#1f1c1a', legs: '#2c2e33' } },
  { rollen: ['markt', 'wohnen'], palette: { coat: '#7a6a5c', hat: '#9b8f7c', skin: '#d0a98c', hair: '#6e5a48', legs: '#4a4038' } },
  { rollen: ['markt'], palette: { coat: '#5d6a70', hat: '#c9c0ae', skin: '#c49c80', hair: '#8a7a66', legs: '#3a3c42' } },
  { rollen: ['wohnen', 'nacht'], palette: { coat: '#5a4a48', hat: '#2e2a2a', skin: '#b8917a', hair: '#9a9088', legs: '#33302e' } },
  { rollen: ['kind'], palette: { coat: '#8c7d64', hat: '#4a4038', skin: '#d2ad90', hair: '#5a4632', legs: '#4a4038' } },
];

/** Welche Rollen in welchem Abschnitt unterwegs sind (gewichtet durch Wiederholung). */
export const ROLLEN = {
  morgen: ['arbeiter', 'arbeiter', 'arbeiter', 'markt', 'kind'],
  mittag: ['markt', 'markt', 'wohnen', 'arbeiter', 'kind'],
  abend: ['arbeiter', 'arbeiter', 'wohnen', 'markt'],
  nacht: ['nacht', 'nacht', 'arbeiter'],
};

/**
 * Sätze im Vorbeigehen. Einträge sind Text oder { text, if } mit einer Bedingung für state.meets
 * (requires_flags, requires_wanted, requires_seq, requires_p2 …).
 */
export const GEMURMEL = {
  allgemein: [
    'Kalk im Brot, Kalk im Bett. Man gewöhnt sich.',
    'Schon wieder Staub in den Augen.',
    'Die Uhr da oben geht vor. Sagen alle.',
    'Pass auf die Weichen auf, Fremder.',
    'Hier zählt man die Leute zweimal.',
    'Wer stehen bleibt, steht im Weg.',
    'Mein Husten hat einen eigenen Takt.',
    'Lohn ist Freitag. Heute ist nicht Freitag.',
    'Die Krähen wissen mehr als der Vorarbeiter.',
    'Neue Gesichter halten nicht lange.',
  ],
  morgen: [
    'Erste Glocke verpasst. Zweite schaff ich.',
    'Kaffee? Kalkwasser mit Farbe.',
    'Noch dunkel im Kopf, schon hell am Gleis.',
    'Schicht fängt an, ob ich will oder nicht.',
    'Wer zuerst am Tor ist, kriegt die gute Schaufel.',
  ],
  mittag: [
    'Brot und Zwiebel, mehr braucht kein Mensch.',
    'Am Kalkmarkt gibt’s heute Fisch. Grauen Fisch.',
    'Zehn Minuten Pause. Neun sind schon um.',
    'Die Sonne brennt den Staub fest.',
    'Hast du gesehen, wer am Stand gefeilscht hat?',
  ],
  abend: [
    'Feierabend. Die Knochen wissen es zuerst.',
    'Heim, Suppe, Bett. In der Reihenfolge.',
    'Der Prellbock schenkt heute billig aus.',
    'Die Lohntüte wird jede Woche leichter.',
    'Bloß nicht im Dunkeln über die Bruchstufen.',
  ],
  nacht: [
    'Psst. Nachts redet man hier leise.',
    'Die Gleise summen. Es kommt kein Zug.',
    'Lampe aus, Augen auf.',
    'Wer nachts unterwegs ist, hat Gründe.',
    'Hörst du das? … Nein? Gut.',
  ],
  bahn: [
    'Der Fahrplan ist ein Gedicht. Keiner glaubt dran.',
    'Wagen sieben ist wieder ausgeblieben.',
    'Auf diesem Gleis fährt nur noch der Wind.',
    'Pfiff weiß, wann die Züge kommen. Pfiff sagt’s keinem.',
  ],
  wohnen: [
    'Die Wäsche bleibt grau, egal wie oft.',
    'Nebenan streiten sie wieder über die Kohle.',
    'Am Abendtisch fehlt immer einer.',
    'Kinder, rein da! Der Staub kommt.',
  ],
  markt: [
    'Drei Schilling für die Rübe? Raub.',
    'Ida kauft alles. Auch, was man nicht verkaufen sollte.',
    'Die Händlerin hat zwei Waagen. Eine für Fremde.',
    'Frische Ware! Also, gestrige.',
  ],
  bruch: [
    'Im Bruch klopft es, auch wenn keiner arbeitet.',
    'Hab heute einen Stein gefunden, der warm war.',
    'Halt dich an der Leiter fest, nicht am Fels.',
    'Unten wird’s still. Zu still.',
  ],
  bedingt: [
    { text: 'Ist das nicht die Gestalt vom Aushang?', if: { requires_wanted: 1 } },
    { text: 'Schnell weg, da kommt Ärger.', if: { requires_wanted: 2 } },
    { text: 'Ich hab nichts gesehen. Gar nichts.', if: { requires_wanted: 2 } },
    { text: 'Ihr zwei seid doch die Neuen, oder?', if: { requires_p2: true } },
    { text: 'Unter dem Fels schläft was Altes. Sagt Oma.', if: { requires_flags: ['k3r_gott_gehoert'] } },
    { text: 'Starling? Den Namen sagt man hier nicht laut.', if: { requires_flags: ['k3r_gott_gehoert'] } },
    { text: 'Die Luft wird kalt, wenn du vorbeigehst.', if: { requires_seq: 5 } },
    { text: 'Die Krähen ducken sich vor dir. Komisch.', if: { requires_seq: 4 } },
    { text: 'Schichtwechsel! Heut zahlt der Boss die Runde!', if: { requires_flags: ['fest_aktiv_schichtwechsel'] } },
  ],
};

/** Zwei Passanten bleiben stehen und tratschen: abwechselnd A, B. */
export const TRATSCH = [
  ['Hast du’s gehört? Wagen sieben.', 'Schon wieder? Und keiner fragt nach.'],
  ['Wie geht’s dem Rücken?', 'Gebogen. Wie die Schienen.'],
  ['Die Neue am Kalkmarkt …', '… hat zwei Waagen, ich weiß.'],
  ['Kommst du heut Abend in den Prellbock?', 'Wenn die Lohntüte reicht.'],
  ['Mein Junge will in den Bruch.', 'Sag ihm, der Bruch will ihn auch.'],
  ['Hörst du nachts auch das Summen?', 'Nein. Und du auch nicht. Klar?'],
  ['Der Vorarbeiter hat wieder gezählt.', 'Und? Waren wir vollzählig?', 'Einer zu viel.'],
  ['Regen kommt.', 'Regen? Hier? Erzähl mir was.'],
  ['Hast du Kalk in der Suppe?', 'Kalk ist die Suppe.'],
  ['Die Krähen sitzen heute tief.', 'Dann bleib ich auch tief.'],
  ['Wer ist der Fremde da?', 'Weiß nicht. Guck nicht hin.'],
  ['Morgen frei?', 'Frei gibt’s in Dunscar nicht. Nur kürzer.'],
];

/** Kleine Ereignisse auf der Straße; `wann` sind die Tagesabschnitte, `arten` die Viertel (leer = alle). */
export const EREIGNISSE = {
  schichtglocke: {
    wann: ['morgen', 'abend'], arten: [], ton: 'ds_schichtglocke',
    rufe: { morgen: ['Schicht! Los, los!', 'Die Glocke! Ich bin zu spät!', 'Antreten am Tor!'], abend: ['Feierabend!', 'Endlich. Heim.', 'Glocke! Werkzeug fallen lassen!'] },
  },
  zeitung: {
    wann: ['morgen', 'mittag'], arten: [], ton: 'ui_zeitung',
    rufe: ['Kalkblatt! Frisch gedruckt!', 'Neues aus Dunscar! Zwei Schilling!', 'Lest es, bevor’s verstaubt!'],
  },
  kalkboe: { wann: ['morgen', 'mittag', 'abend'], arten: ['markt', 'bruch', 'wohnen', 'bahn'], ton: 'ds_kalk_rieseln', rufe: ['*hust*', 'Augen zu!', 'Schon wieder!'] },
  streit: {
    wann: ['mittag', 'abend'], arten: ['markt', 'wohnen'], ton: null,
    zeilen: [
      ['Das war meine Schaufel!', 'Steht nicht dein Name drauf.', 'Steht Kalk drauf. Meiner!'],
      ['Du schuldest mir zwei Schilling!', 'Und du mir eine Schicht!', 'Dann sind wir quitt?'],
      ['Wer hat meine Wäsche grau gemacht?', 'Die Stadt!', '… Na gut. Die Stadt.'],
    ],
  },
  nachtwache: { wann: ['nacht'], arten: [], ton: null, rufe: ['Lampen aus, Türen zu!', 'Zwölf und still. Alles still.', 'Wer da? … Na, geh weiter.'] },
  betrunken: { wann: ['nacht', 'abend'], arten: ['wohnen', 'markt'], ton: null, rufe: ['Noch eine … Runde …', 'Wo’s mein Haus? Waren doch … drei.', 'Ich lieb euch alle. Auch den Kalk.'] },
  gueterzug: { wann: ['morgen', 'mittag', 'abend', 'nacht'], arten: ['bahn'], ton: 'ds_zug_fern', rufe: ['Der Güterzug! Pünktlich wie nie.', 'Weg vom Gleis!', 'Wohin der wohl fährt?'] },
};

/** Abstand der Ereignisse (Sekunden, zufällig dazwischen) und Plauder-Abstände in Millisekunden. */
export const TAKT = { ereignis: [55, 120], gemurmelPause: 4500, gemurmelReichweite: 26, tratschChance: 0.3, tratschZeile: 2600 };

/** Alle Texte für Wörterbuch und Tests. */
export function alleTexte() {
  const out = [];
  for (const v of Object.values(GEMURMEL)) for (const e of v) out.push(typeof e === 'string' ? e : e.text);
  for (const t of TRATSCH) out.push(...t);
  for (const e of Object.values(EREIGNISSE)) {
    const r = e.rufe;
    if (Array.isArray(r)) out.push(...r);
    else if (r) for (const l of Object.values(r)) out.push(...l);
    for (const z of e.zeilen ?? []) out.push(...z);
  }
  return out;
}

/** Sätze, die gerade passen: allgemein + Abschnitt + Viertelart + erfüllte Bedingungen. */
export function gemurmelFuer(state, art, abschnitt) {
  const bedingt = GEMURMEL.bedingt.filter((e) => state?.meets?.(e.if)).map((e) => e.text);
  return { normal: [...GEMURMEL.allgemein, ...(GEMURMEL[abschnitt] ?? []), ...(GEMURMEL[art] ?? [])], bedingt };
}

/** Markiert die Viertel: `passanten: { art }` auf jeder Karte aus VIERTEL_ART (nach applyDunscarKulisse). */
export function applyDunscarPassanten(content) {
  for (const [id, art] of Object.entries(VIERTEL_ART)) {
    const m = content.maps?.[id];
    if (m) content.maps[id] = { ...m, passanten: { art } };
  }
}
