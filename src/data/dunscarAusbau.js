// Dunscar-Ausbau (Seb, 2026-11-12: „Dunscar erweitern, ungenutzte Assets nutzen, Kessel, Spind und Bett einbauen,
// Shops verbessern, bessere Heilung, Nerven- und Ruhetränke“).
//
//  - Innenräume: Paket AV hatte für Speisewagen, Prüfhaus und Lohnbüro eigene Möbel geliefert (props/ds_*.png), die nie
//    platziert wurden. Jetzt stehen sie in den Räumen; die Platzhalter-Pfeilerblöcke in den Räumen sind weg.
//  - Speisewagen: Bett, Spind und Braukessel stehen sichtbar mit Schild in einer Schlafecke (vorher unsichtbare Punkte).
//  - Zwei neue Häuser: Gasthaus „Zum Prellbock“ (Arbeiterbogen: Wirtin mit Proviant, Bett, Truhe, Kessel) und die
//    Kalkapotheke (Kalkmarkt: starke Heil-, Nerven- und Ruhemittel für Seq 5/4). Türen setzt das Viertel-Raster.
//  - Neue Verbrauchsgüter `dsh_*` mit Bildern aus dem Vorrat reserve200 (versorgung/alchemie).
//  - Marktstände: hinter jedem Händler im Freien steht ein Stand mit Schild, der den Laden öffnet.

const P = 'reserve200/versorgung/reserve_';
const A = 'reserve200/alchemie/reserve_';

/** Neue Verbrauchsgüter. Preis = halber Ladenpreis (Ankauf), Ladenpreise in DSH_LADEN. */
export const DSH_ITEMS = {
  dsh_verbandrolle: { name: 'Kalkverband', kind: 'consumable', heal: 50, weight: 0.5, price: 60,
    desc: 'Eine dicke Rolle Leinen, in Kalkmilch getränkt und getrocknet. Stellt 50 Leben wieder her.' },
  dsh_schichttonikum: { name: 'Schichttonikum', kind: 'consumable', heal: 110, weight: 0.5, price: 160,
    desc: 'Was die Rangierer nach einer Doppelschicht trinken. Bitter wie Ruß. Stellt 110 Leben wieder her.' },
  dsh_kalkelixier: { name: 'Kalkmilch-Elixier', kind: 'consumable', heal: 260, weight: 0.5, price: 480,
    desc: 'Weiß, dick und kalt, aus dem Destillierkolben der Apotheke. Für Leute, die mehr aushalten müssen als Menschen. Stellt 260 Leben wieder her.' },
  dsh_honigtopf: { name: 'Bruchhonig', kind: 'consumable', heal: 60, composure: 40, weight: 0.5, price: 120,
    desc: 'Dunkler Honig von Bienen, die im Kalk überwintern. Stellt 60 Leben wieder her, +40 Nerven.' },
  dsh_bruchriechsalz: { name: 'Bruchriechsalz', kind: 'consumable', composure: 90, weight: 0.3, price: 100,
    desc: 'Riechsalz mit Kalkstaub gestreckt, schärfer als das aus Kettlegate. +90 Nerven.' },
  dsh_wachtrank: { name: 'Wachtrank', kind: 'consumable', composure: 190, weight: 0.5, price: 330,
    desc: 'Ein Trank für Signalwärter, die drei Nächte nicht schlafen dürfen. +190 Nerven.' },
  dsh_stellwerktee: { name: 'Stellwerktee', kind: 'consumable', calm: 22, composure: 40, weight: 0.3, price: 140,
    desc: 'Lose Blätter in einer Blechdose, die Stellwerker kauen sie gegen das Summen. Senkt die Unruhe um 22, +40 Nerven.' },
  dsh_stillschlaf: { name: 'Stillschlaf-Tropfen', kind: 'consumable', calm: 45, weight: 0.3, price: 300,
    desc: 'Zwölf Tropfen, und die Stimmen werden leiser. Senkt die Unruhe um 45.' },
  dsh_geisterblume: { name: 'Geisterblumen-Destillat', kind: 'consumable', calm: 85, composure: 80, heal: 40, weight: 0.5, price: 1000,
    desc: 'Aus einer Blume, die nur im Schatten der Hörrohre wächst. Selten und teuer. Senkt die Unruhe um 85, +80 Nerven, stellt 40 Leben wieder her.' },
  dsh_reisebrot: { name: 'Schichtbrot', kind: 'consumable', heal: 30, weight: 0.5, price: 25,
    desc: 'Dunkles Brot, das eine Woche hält. Stellt 30 Leben wieder her.' },
  dsh_hartkaese: { name: 'Kalkkäse', kind: 'consumable', heal: 45, composure: 10, weight: 0.5, price: 40,
    desc: 'Harter, salziger Käse aus dem Keller des Prellbocks. Stellt 45 Leben wieder her, +10 Nerven.' },
  dsh_kaffee: { name: 'Kanne Rangiererkaffee', kind: 'consumable', composure: 55, weight: 1, price: 45,
    desc: 'Schwarz und so stark, dass der Löffel steht. +55 Nerven.' },
};

/** Bilder aus dem Vorrat reserve200 (64x64). */
export const DSH_ICONS = {
  dsh_verbandrolle: `${P}145_verbandrolle`, dsh_schichttonikum: `${P}141_heiltonikum`, dsh_kalkelixier: `${A}042_destillierkolben`,
  dsh_honigtopf: `${P}148_honigtopf`, dsh_bruchriechsalz: `${P}147_riechsalz`, dsh_wachtrank: `${P}143_wachtrank`,
  dsh_stellwerktee: `${P}154_teedose`, dsh_stillschlaf: `${P}144_schlafmittel`, dsh_geisterblume: `${A}055_geisterblume`,
  dsh_reisebrot: `${P}149_reisebrot`, dsh_hartkaese: `${P}150_hartkaese`, dsh_kaffee: `${P}155_kaffeekanne`,
};

const FIG = { hat: '#2a2a2e', skin: '#c99f7b', hair: '#4a3a2e', legs: '#2a2a2e' };
const fig = (name, role, coat, extra = {}) => ({ name, role, palette: { ...FIG, coat, ...extra } });
const nachAnkunft = { requires_flags: ['k3_arrived'] };

/** Läden in den neuen Häusern: [item, Preis]. */
const DSH_LADEN = {
  dsa_apothekerin: {
    title: 'Kalkapotheke', greeting: 'Was tut weh? Kopf, Leib oder das, was dazwischen sitzt?',
    stock: [['dsh_verbandrolle', 120], ['dsh_schichttonikum', 320], ['dsh_kalkelixier', 950], ['dsh_bruchriechsalz', 200], ['dsh_wachtrank', 650],
      ['dsh_stellwerktee', 280], ['dsh_stillschlaf', 600], ['dsh_geisterblume', 2000], ['tonikum', 36], ['riechsalz', 24], ['verband', 16]],
  },
  dsg_wirtin: {
    title: 'Schanktisch im Prellbock', greeting: 'Setz dich, iss was. Hier drin gibt es keine Schicht.',
    stock: [['dsh_reisebrot', 50], ['dsh_hartkaese', 80], ['dsh_kaffee', 90], ['dsh_honigtopf', 240], ['gewuerzwein', 40], ['salzbrot', 20], ['ruhetee', 20], ['moortee', 24]],
  },
};

// --- Möbel ------------------------------------------------------------------------------------------------------------
// 64er-Möbel aus Paket AV: Fuß unten Mitte auf der Kachel, Block am Fuß. 32er-Möbel (i2_*) eine halbe Kachel versetzt.
const M = (sprite, x, y, opt = {}) => ({ sprite, tile: [x, y], offset: [opt.half ? 8 : 0, 8], origin: [0.5, 1], alpha: 1, ysort: true, ...(/^(i2_|locker$|cauldron$)/.test(sprite) ? { bw: true } : {}),
  ...(opt.solid === false ? {} : { solid: opt.solid ?? (opt.small ? [28, 8, 0, -4] : [56, 14, 0, -7]) }), ...(opt.light ? { light: opt.light } : {}) });
const ofenLicht = { dy: -20, radius: 70, intensity: 0.7, color: '#ff9a50', flicker: 0.2, glow: 0.25 };
const SW = 'dspi_speisewagen_';
const PH = 'dspi_pruefhaus_';
const LB = 'dspi_lohnbuero_';

/** Innenraum mit Rand, ohne Pfeilerblöcke. */
const raum = (fc = 'w') => Array.from({ length: 14 }, (_, y) => (y === 0 || y === 13 ? 'I'.repeat(24) : `I${fc.repeat(22)}I`));
const ohnePfeiler = (m) => {
  const fc = (m.rows.join('').match(/[.sw]/) ?? ['w'])[0];
  m.rows = m.rows.map((r, y) => (y === 0 || y === m.rows.length - 1 ? r : r[0] + r.slice(1, -1).replace(/I/g, fc) + r.at(-1)));
};

/** Schild über einem Interactable, dy = Höhe des Möbels über dem Punkt. */
const schild = (label, dy) => ({ label, label_dy: dy });

/** Speisewagen: Schlafecke mit Bett, Spind und Kessel, Fallwand und Ofen in einer Reihe (Fuß auf Reihe 8, Zugang von Reihe 9). */
function speisewagen(content) {
  const m = content.maps.ds_speisewagen;
  if (!m) return;
  ohnePfeiler(m);
  const byKind = (k) => m.interactables.find((i) => i.kind === k);
  const set = (k, tile, extra) => { const d = byKind(k); if (d) Object.assign(d, { tile, ...extra }); };
  set('casewall', [4, 9], { prompt: 'Fallwand ansehen', ...schild('Fallwand', 74) });
  set('rest', [21, 9], { prompt: 'Im Bett schlafen', title: 'Dein Bett im Speisewagen', text: 'Das Stockbett knarrt bei jeder Rangierfahrt. Pfiff hat dir das untere gegeben. Oben schläft niemand, aber manchmal hörst du dort jemanden umdrehen.', ...schild('Bett', 74) });
  set('storage', [18, 9], { prompt: 'Spind öffnen (Lager)', store_title: 'Dein Spind', ...schild('Spind', 42) });
  set('brew', [15, 8], { ...schild('Braukessel', 20) });
  const pfiff = m.npcs.find((n) => n.id === 'k3_pfiff');
  if (pfiff) pfiff.tile = [3, 11];
  // alte Klapptische standen mitten im Gang
  m.decor = m.decor.filter((d) => !/klapptisch/.test(d.sprite));
  m.decor.push(
    M(`${SW}investigation_case_wall`, 4, 8),
    M(`${SW}stove`, 8, 8, { light: ofenLicht }),
    M(`${SW}table_soup_bowl`, 12, 8),
    M('locker', 18, 8, { solid: [14, 8, 0, -4] }),
    M(`${SW}bunk`, 20, 8, { half: true }),
    M(`${SW}phonograph`, 11, 12),
  );
  m.lights.push({ tile: [20, 8], radius: 50, intensity: 0.45, color: '#ffc782', flicker: 0.05 });
}

/** Weitere alte Innenräume: Pfeiler weg, AV-Möbel dazu (immer unterhalb der Lesereihe 3, Gänge frei). */
function moeblieren(content) {
  const add = (id, list, lights = []) => {
    const m = content.maps[id];
    if (!m) return;
    ohnePfeiler(m);
    m.decor = [...(m.decor ?? []).filter((d) => d.tile[1] <= 2), ...list];
    m.lights = [...(m.lights ?? []), ...lights];
  };
  add('ds_teesaal', [
    M(`${SW}stove`, 20, 8, { light: ofenLicht }),
    M(`${SW}table_soup_bowl`, 8, 8), M(`${SW}table_soup_bowl`, 13, 8), M(`${SW}table_soup_bowl`, 16, 12),
    M(`${SW}phonograph`, 9, 12),
  ]);
  add('ds_pruefhaus', [
    M(`${PH}acoustic_horn`, 8, 8), M(`${PH}wax_cylinder_shelving`, 13, 8), M(`${PH}brass_measuring_instrument`, 18, 8),
    M(`${PH}victorian_headphones`, 14, 12, { solid: false }), M('i2_akademie_lesepult', 10, 12, { small: true, half: true }),
  ]);
  add('ds_lohnbuero', [
    M(`${LB}filing_cabinets`, 8, 8), M(`${LB}standing_writing_desk`, 13, 8), M(`${LB}wage_envelope_shelf`, 18, 8),
    M('i2_lohnbuero_schreibtisch', 13, 12, { small: true, half: true }), M('i2_schreibmaschine', 17, 12, { small: true, half: true }),
  ]);
  add('ds_runddepot', [
    M('dsp_schwellenring_mechanic_workbench', 10, 8), M('dsp_schwellenring_locomotive_wheel', 15, 8), M('dsp_schwellenring_coal_heap', 20, 8),
    M('dsp_schwellenring_water_crane', 16, 12),
  ]);
  add('ds_nachtzug_wagen', [M(`${SW}bunk`, 9, 8), M(`${SW}bunk`, 14, 8), M(`${SW}table_soup_bowl`, 19, 8)]);
}

// --- Neue Häuser ------------------------------------------------------------------------------------------------------
const NEUE_NPCS_ROH = {
  dsg_wirtin: fig('Wirtin Marta Prell', 'Gasthaus „Zum Prellbock“, Arbeiterbogen', '#6a4a3a', { scarf: '#a8824a', hair: '#8a5a3a' }),
  dsg_heizer: fig('Heizer Bodo Ruß', 'Stammgast im Prellbock', '#3a3a3e', { hat: '#1e1e22' }),
  dsg_naeherin: fig('Näherin Lene Faden', 'Übernachtungsgast im Prellbock', '#5a4a6a', { hair: '#2e2a26' }),
  dsa_apothekerin: fig('Apothekerin Edda Kalb', 'Kalkapotheke, Kalkmarkt', '#d8d4c8', { hat: '#3a3a3a', hair: '#8a8478', scarf: '#6a8a4a' }),
  dsa_lehrling: fig('Apothekerlehrling Till Mörser', 'Lehrling in der Kalkapotheke', '#4a5a4a'),
};

const NEUE_NPCS = Object.fromEntries(Object.entries(NEUE_NPCS_ROH).map(([id, n]) => [id, { ...n, dialogue: id }]));

const shop = (id, h) => ({
  start: 'start',
  nodes: {
    start: { text: h.text, choices: [{ text: h.shopText, shop: id }, { text: h.frage, next: 'mehr' }, { text: 'Auf Wiedersehen.' }] },
    mehr: { text: h.antwort, choices: [{ text: h.shopText, shop: id }, { text: 'Danke.' }] },
  },
});
const gespraech = (text, frage, antwort) => ({
  start: 'start',
  nodes: { start: { text, choices: [{ text: frage, next: 'b' }, { text: 'Gute Nacht.' }] }, b: { text: antwort, choices: [{ text: 'Danke.' }] } },
});

const NEUE_DIALOGE = {
  dsg_wirtin: shop('dsg_wirtin', {
    text: 'Eine breite Frau stellt zwei Krüge ab, ohne hinzusehen. „Prell. Das Haus heißt nach dem Prellbock draußen: Hier hält alles an. Essen, Kaffee, ein Bett oben in der Ecke. Wer zahlt, schläft. Wer nicht zahlt, schläft auch, aber in der Kälte.“',
    shopText: 'Was gibt es zu essen?',
    frage: 'Kann ich hier übernachten?',
    antwort: '„Das Bett in der Ecke ist frei, die Truhe daneben auch. Was du hineinlegst, liegt bei dir im Speisewagen genauso, Pfiff und ich teilen uns den Schlüssel. Und der Kessel am Ofen gehört jedem, der weiß, was er tut.“',
  }),
  dsa_apothekerin: shop('dsa_apothekerin', {
    text: 'Hinter der Theke reihen sich Flaschen, jede mit Kreide beschriftet. Eine Frau im hellen Kittel wiegt Pulver auf einer Messingwaage. „Kalb. Was Hester Wynn auf dem Markt hat, reicht für Leute mit einem Herzen. Ich mische für die anderen.“',
    shopText: 'Heilmittel und Tränke ansehen.',
    frage: 'Für die anderen?',
    antwort: '„Für Leute, die drei Rangierer mit der Hand aufhalten und danach Stimmen hören. Kalkmilch für den Leib, Wachtrank für die Nerven, Stillschlaf gegen das, was in dir unruhig wird. Das Geisterblumen-Destillat ist teuer, weil die Blume nur unter den Hörrohren wächst.“',
  }),
  dsg_heizer: gespraech('Ein Mann mit rußschwarzen Unterarmen löffelt Suppe. „Ruß. Heizer auf der Nachtlok, als sie noch fuhr. Jetzt heize ich den Ofen hier.“',
    'Warum fährt die Nachtlok nicht mehr?', '„Weil keiner mehr zurück will. Und weil die Strecke nach oben nicht im Fahrplan steht. Die Alten sagen, die Gleise hören hinter dem letzten Bahnsteig nicht auf. Sie gehen nur nicht mehr geradeaus.“'),
  dsg_naeherin: gespraech('Eine junge Frau flickt einen Mantel im Licht des Ofens. „Faden. Ich nähe für die Schicht. Kalkstaub frisst die Nähte schneller, als ich sie setzen kann.“',
    'Schläfst du hier?', '„Oben in der Ecke, wenn das Bett frei ist. Im Speisewagen ist es wärmer, aber dort hört man die Walze. Hier hört man nur Bodo schnarchen. Das ist ehrlicher.“'),
  dsa_lehrling: gespraech('Ein Junge zerstößt etwas Weißes im Mörser, so konzentriert, dass er dich erst spät bemerkt. „Mörser. Till. Lehrling. Nicht anfassen, das ätzt.“',
    'Was mischt ihr da?', '„Kalkmilch. Frau Kalb sagt, für Halbgötter braucht man das Zehnfache, und dann noch mal das Doppelte, weil sie nie stillhalten. Ich weiß nicht, ob sie Witze macht.“'),
};

/** Lesestellen in den neuen Häusern. */
const lesen = (id, tile, title, text) => ({ id, kind: 'read', tile, prompt: title, title, text, marker: false, done_flag: `${id}_gelesen` });

function gasthaus() {
  const id = 'ds_gasthaus';
  return {
    id, name: 'Gasthaus „Zum Prellbock“', city: 'dunscar', tiles: 'ds_teesaal', tiles_wunsch: id,
    rows: raum('w'), spawns: { default: [4, 11] }, leben: { weather: [], animals: {} },
    ambient: { night: 0.55, fog: 0 },
    lights: [{ tile: [3, 10], radius: 70, intensity: 0.6, color: '#ffc782', glow: 0.2, flicker: 0.1 }],
    decor: [
      M('i2_laden_theke', 5, 6, { small: true }), M('i2_laden_regal_flaschen', 3, 3, { small: true }), M('i2_laden_regal_flaschen', 7, 3, { small: true }),
      M(`${SW}table_soup_bowl`, 11, 6), M(`${SW}table_soup_bowl`, 11, 11),
      M(`${SW}stove`, 15, 6, { light: ofenLicht }),
      M(`${SW}phonograph`, 15, 11),
      M(`${SW}bunk`, 20, 6, { half: true }), M(`${SW}storage_chest`, 20, 11, { half: true }),
    ],
    interactables: [
      { id: 'dsg_nach_arbeiterbogen', kind: 'door', tile: [4, 12], to: 'ds_arbeiterbogen', spawn: `von_${id}`, prompt: 'Nach Arbeiterbogen', marker: true, label: 'Arbeiterbogen' },
      { id: 'dsg_bett', kind: 'rest', tile: [21, 7], prompt: 'Im Bett schlafen', marker: false, title: 'Ein Bett im Prellbock',
        text: 'Das Stockbett riecht nach Kohle und Seife. Unten im Schankraum klappern Löffel, irgendwann wird es still. Du schläfst tief.', ...schild('Bett', 74) },
      { id: 'dsg_truhe', kind: 'storage', tile: [21, 12], prompt: 'Truhe öffnen (Lager)', marker: false, store_title: 'Truhe im Prellbock', ...schild('Truhe', 74) },
      { id: 'dsg_kessel', kind: 'brew', tile: [18, 9], prompt: 'Am Braukessel brauen', sprite: 'cauldron', marker: false, solid: [14, 10], title: 'Kessel im Prellbock',
        anim: ['cauldron_bubble', 'bubble'], reach: 24, ...schild('Braukessel', 20) },
      lesen('dsg_lesen_karte', [9, 3], 'Speisekarte', '„Suppe. Brot. Käse. Kaffee. Was anderes gibt es nicht, und wer fragt, bekommt Suppe.“ Darunter, in anderer Schrift: „Seit dem Ruf: keine Lieder nach Mitternacht.“'),
      lesen('dsg_lesen_kerben', [13, 3], 'Kerben im Türrahmen', 'Striche in Fünfergruppen, daneben Namen. Manche Gruppen hören mitten in der Woche auf. Neben dem letzten Namen steht nur: „oben“.'),
    ],
    npcs: [
      { id: 'dsg_wirtin', tile: [5, 5], facing: 'down', visible_if: nachAnkunft },
      { id: 'dsg_heizer', tile: [11, 8], facing: 'up', visible_if: nachAnkunft },
      { id: 'dsg_naeherin', tile: [17, 11], facing: 'left', visible_if: nachAnkunft },
    ],
  };
}

function apotheke() {
  const id = 'ds_apotheke';
  return {
    id, name: 'Kalkapotheke', city: 'dunscar', tiles: 'ds_innen', tiles_wunsch: id,
    rows: raum('w'), spawns: { default: [4, 11] }, leben: { weather: [], animals: {} },
    ambient: { night: 0.5, fog: 0 },
    lights: [{ tile: [11, 4], radius: 80, intensity: 0.6, color: '#d8f0e0', glow: 0.2, flicker: 0.04 }],
    decor: [
      M(`${PH}wax_cylinder_shelving`, 6, 4), M(`${PH}wax_cylinder_shelving`, 16, 4),
      M('i2_laden_theke', 10, 7, { small: true, half: true }), M('i2_laden_waage', 13, 7, { small: true }),
      M('i2_laden_vitrine', 19, 8, { small: true }), M('i2_laden_regal_flaschen', 21, 4, { small: true }),
      M(`${PH}brass_measuring_instrument`, 15, 11), M('cauldron', 9, 11, { small: true, solid: [14, 8, 0, -4] }),
    ],
    interactables: [
      { id: 'dsa_nach_kalkmarkt', kind: 'door', tile: [4, 12], to: 'ds_kalkmarkt', spawn: `von_${id}`, prompt: 'Nach Kalkmarkt', marker: true, label: 'Kalkmarkt' },
      lesen('dsa_lesen_rezept', [3, 7], 'Rezeptbuch', 'Mengenangaben in drei Spalten: „Mensch“, „Beyonder“, „über Fünf“. In der letzten Spalte steht oft nur ein Fragezeichen und das Wort „mehr“.'),
      lesen('dsa_lesen_schild', [21, 10], 'Schild an der Vitrine', '„Geisterblume: nur gegen Vorkasse. Wer sie im Laden öffnet, zahlt die Fenster.“'),
    ],
    npcs: [
      { id: 'dsa_apothekerin', tile: [11, 6], facing: 'down', visible_if: nachAnkunft },
      { id: 'dsa_lehrling', tile: [12, 11], facing: 'left', visible_if: nachAnkunft },
    ],
  };
}

/** Türen von den Vierteln; das Raster legt sie auf einen freien Hausplatz an der Nordseite. */
const NEUE_HAEUSER = [[gasthaus, 'ds_arbeiterbogen'], [apotheke, 'ds_kalkmarkt']];

/** Stände hinter Händlern im Freien (BA_staende: 10 Stände, je offen/geschlossen). */
const STAND = { ds_waffenhaendlerin: 10, ds_kleiderhaendlerin: 18, ds_kraeuterfrau: 8, k3h_troedlerin: 4, k3h_steinmetz: 6, k3h_lampenwart: 16 };
const SCHILD = { k3h_troedlerin: 'Idas Trödel und Ankauf', k3h_lampenwart: 'Licht und Öl' };

/** Vor applyDunscarKulisse: neue Häuser, Läden, Gegenstände. */
export function applyDunscarAusbau(content) {
  if (!content.maps.ds_kalkmarkt || content.maps.ds_apotheke) return;
  content.items = { ...content.items, ...DSH_ITEMS };
  Object.assign(content.npcs, NEUE_NPCS);
  Object.assign(content.dialogues, NEUE_DIALOGE);
  const merchants = content.market?.merchants;
  if (merchants) {
    for (const [id, l] of Object.entries(DSH_LADEN)) {
      merchants[id] = { name: NEUE_NPCS[id].name, title: l.title, greeting: l.greeting, stock: l.stock.filter(([i]) => content.items[i]).map(([item, price]) => ({ item, price })) };
    }
    // Wynn führt die einfachen neuen Heilmittel mit
    const wynn = merchants.ds_kraeuterfrau;
    if (wynn) for (const [item, price] of [['dsh_verbandrolle', 130], ['dsh_honigtopf', 260], ['dsh_bruchriechsalz', 220]]) if (!wynn.stock.some((e) => e.item === item)) wynn.stock.push({ item, price });
    // Seb 2026-11-13: „in Dunscar brauchen wir stärkere Heiltränke“: Kalkverband (50) und Schichttonikum (110) auch dort, wo man zuerst einkauft
    for (const id of ['k3h_troedlerin', 'k3_mabel']) {
      const m = merchants[id];
      if (m) for (const [item, price] of [['dsh_verbandrolle', 120], ['dsh_schichttonikum', 320]]) if (!m.stock.some((e) => e.item === item)) m.stock.push({ item, price });
    }
  }
  for (const [bau, viertel] of NEUE_HAEUSER) {
    const m = bau();
    content.maps[m.id] = m;
    const v = content.maps[viertel];
    v.interactables = [...v.interactables, { id: `${viertel}_nach_${m.id.slice(3)}`, kind: 'door', tile: [2, 2], to: m.id, spawn: 'default', prompt: `In ${m.name}`, marker: true }];
  }
  speisewagen(content);
  moeblieren(content);
  steinmetzPreise(content);
}

/** Steinmetz-Werkzeug war für seine Stärke viel zu billig (Fäustel Angriff 15 für 150, Duellsäbel 15 für 950). */
const STEINMETZ_PREISE = { k3h_faeustel: 900, k3h_steinmeissel: 650 };
function steinmetzPreise(content) {
  for (const [id, preis] of Object.entries(STEINMETZ_PREISE)) {
    if (!content.items[id]) continue;
    content.items[id] = { ...content.items[id], price: preis };
    for (const m of Object.values(content.market?.merchants ?? {})) for (const e of m.stock ?? []) if (e.item === id) e.price = preis;
  }
}

/** Marktplätze im Südwesten: zwei Reihen à drei Stände, breit genug für die Schilder. */
const STANDPLAETZE = [[4, 14], [10, 14], [16, 14], [4, 17], [10, 17], [16, 17]];

/** Nach applyDunscarKulisse: Händler im Freien in Standreihen, jeder mit Stand und Schild (Plätze stehen erst nach dem Raster fest). */
export function applyDunscarStaende(content) {
  for (const m of Object.values(content.maps)) {
    if (!m.id?.startsWith('ds_') || (m.rows?.[0]?.length ?? 0) < 40 || m.danger) continue;
    const haendler = (m.npcs ?? []).filter((n) => STAND[n.id] !== undefined && content.market?.merchants?.[n.id]);
    if (!haendler.length) continue;
    const besetzt = new Set([...m.interactables, ...m.npcs.filter((n) => !haendler.includes(n))].map((o) => `${o.tile}`));
    const frei = STANDPLAETZE.filter(([x, y]) => !besetzt.has(`${x},${y}`) && !besetzt.has(`${x},${y - 1}`));
    for (const n of haendler) {
      const platz = frei.shift();
      if (!platz) break;
      const merchant = content.market.merchants[n.id];
      n.tile = platz;
      n.facing = 'down';
      m.interactables.push({ id: `${n.id}_stand`, kind: 'dialogue', tile: [platz[0], platz[1] - 1], sprite: 'BA_staende', frame: STAND[n.id], prompt: `${SCHILD[n.id] ?? merchant.title} ansehen`,
        marker: false, title: content.npcs[n.id]?.name ?? merchant.name, dialogue: content.npcs[n.id]?.dialogue ?? n.id, label: SCHILD[n.id] ?? merchant.title, label_dy: 20 });
      m.lights.push({ tile: [platz[0], platz[1] - 1], radius: 36, intensity: 0.45, color: '#ffc782', flicker: 0.08 });
    }
  }
}
