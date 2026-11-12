// Geheime Zirkel in Dunscar (Seb, 2026-11-12):
//  - Alte Gegenstände zu alten Preisen, nur die neuen wertvollen Stücke im Tausenderbereich (Seb, nach PR #379).
//  - Neue seltene und „unmögliche“ Stücke (starke Artefakte mit heftigem Fluch, zwei Waffen), Bilder aus dem Vorrat nebel200.
//  - Zwei weitere Zirkel neben dem Schichtbund, ohne Aufnahme-Quest offen ab der Ankunft (offene, harte Welt):
//      Der Kalte Ofen   (Alchemie: Halbgott-Formeln aller Pfade, Seq-5-Zutaten, Tränke-Artefakte), alter Kalkofen am Kalkmarkt
//      Das Stumme Stellwerk (Formeln 6/5 der übrigen Pfade, Waffen, Schloss- und Signal-Artefakte), am Signalhang
//    Die Treffen wechseln sich ab (Uhr wie bisher: alle 5 Minuten eines, also jeder Zirkel alle 15 Minuten).
//  - Seq-3-Formeln nur mit 1 % je Los für 15.000 (Seb). Seq-4-Formel nur auf Treffen oder als Elite-Fund.

/**
 * Ausrufpreise (Startgebot = 60 %). Seb (2026-11-12): alte Gegenstände zu alten Preisen (wie auf den Wexmoorer
 * Treffen, data/sequenzen.js TREFFEN/ZUTAT_TREFFEN), nur die neuen, wertvolleren dsz_*-Stücke kosten Tausende.
 */
export const DS_LOS = {
  formel: { 6: 640, 5: 900, 4: 4000, 3: 15000 }, // Seq 3 (Seb 2026-11-12): 1 % je Treffen, 15.000
  formel3Chance: 0.01,
  zutat5: { price: 320, chance: 0.45 },
  formel4Chance: 0.3, // Seb 2026-11-12: Zirkel voller, Chancen spürbar höher (vorher 0,12)
  formel65Chance: 0.3, // vorher 0,2
};

/**
 * Gesuche der Dunscar-Zirkel (Seb 2026-11-12): die Leute kaufen die seltenen Dunscar-Wertstücke oft und teuer an,
 * nie unter 1000 Schilling, damit man nach dem ersten Treffen weiß: das lohnt sich zu farmen.
 */
export const DS_GESUCHE = {
  wants: ['ds_beute_signalsilber', 'ds_beute_schichtgold', 'ds_beute_kalkopal'],
  request_chance: 0.95,
  request_min: 1000,
  request_markup: 1.8,
};

const art = (name, price, desc, boons, curses) => ({ name, source: 'treffen', price, weight: 1, desc, boons, curses });
const b = (key, value, text) => ({ key, value, text });

/** Neue Artefakte (selten und „unmöglich“). Bilder: items/<id>.png aus nebel200. */
export const DS_ARTEFAKTE = {
  dsz_kalkherz: art('Kalkherz', 3500, 'Ein Uhrwerkherz, mit Kalk verfugt. Es schlägt, wenn deins aussetzt.',
    [b('max_hp', 80, '+80 maximales Leben.')], [b('composure_regen', 0.7, 'Nervenerholung nur 70 %.')]),
  dsz_weichenuhr: art('Stehengebliebene Weichenuhr', 4800, 'Steht auf 4:12, der Minute des Unglücks im Runddepot. Wer sie trägt, ist immer eine Minute früher da.',
    [b('ap_start', 1, '+1 Konzentration zum Kampfbeginn.'), b('ap_max', 1, '+1 Höchstkonzentration.')], [b('unruhe_tick', 0.25, '+0,25 Unruhe pro Sekunde.')]),
  dsz_signallinse: art('Rote Signallinse', 3200, 'Aus dem Signal, das niemand mehr stellt. Durch sie sieht man, was im Nebel steht.',
    [b('occult_mult', 1.35, '35 % mehr Schaden gegen Okkultes.')], [b('max_nerves', -10, '10 weniger maximale Nerven.')]),
  dsz_lohnbuch: art('Lohnbuch der Toten Schicht', 2800, 'Jede Seite ein Name, jeder Name ein offener Lohn. Das Buch zahlt, aber es merkt sich, wer nimmt.',
    [b('money_bonus', 1.5, 'Beutegeld ×1,50.')], [b('honor_loss', 1.5, 'Ansehensverluste wiegen 50 % schwerer.')]),
  dsz_rohrpost: art('Rohrpostkapsel ohne Absender', 2600, 'Kommt jeden Morgen wieder in der Tasche an, auch wenn man sie wegwirft.',
    [b('dodge_window', 1.35, 'Ausweichfenster +35 %.')], [b('damage_taken', 1.1, '10 % mehr Schaden.')]),
  dsz_glasschluessel: art('Okkulter Glasschlüssel', 2200, 'Passt in kein Schloss und öffnet trotzdem jedes.',
    [b('lock_bonus', 15, 'Gesperrte Schränke und Türen öffnen sich mit 15 Ansehen weniger.'), b('carry', 10, '+10 Pfund Tragkraft.')], [b('price', 1.15, 'Händlerpreise ×1,15.')]),
  dsz_augenamulett: art('Auge des Stellwerks', 3800, 'Ein Amulett mit einem Glasauge, das nie blinzelt. Es sieht den Schlag, bevor er kommt.',
    [b('damage_taken', 0.85, '15 % weniger Schaden.'), b('parry_ap', 1, 'Paraden bringen +1 Konzentration.')], [b('heal_bonus', 0.75, 'Heilmittel wirken nur zu 75 %.')]),
  // „Unmögliche“ Stücke: sehr stark, sehr teuer, selten im Angebot, mit heftigem Preis
  dsz_sanduhr: art('Sanduhr, die rückwärts läuft', 12000, 'Unmöglich, sagt der Ofen. Der Sand steigt. Jede Runde gibt sie dir Zeit, die du nie hattest, und nimmt dir dafür Leben, das du noch hast.',
    [b('ap_round', 1, 'Zu Beginn jeder weiteren Runde +1 Konzentration.'), b('ap_start', 2, '+2 Konzentration zum Kampfbeginn.')],
    [b('max_hp', -60, '60 weniger maximales Leben.'), b('unruhe_tick', 0.5, '+0,5 Unruhe pro Sekunde.')]),
  dsz_spiegel: art('Spiegel ohne Gestern', 10000, 'Zeigt dich so, wie du morgen zuschlägst. Wer zu lange hineinsieht, vergisst, wie man sich wehrt.',
    [b('dmg_mult', 1.4, 'Schaden ×1,40.')], [b('damage_taken', 1.3, '30 % mehr Schaden.'), b('composure_regen', 0.5, 'Nervenerholung nur 50 %.')]),
  dsz_herzwalze: art('Walze, die dein Herz spielt', 14000, 'Eine Spieluhrwalze, gestanzt nach deinem Puls. Solange sie läuft, stirbst du schwer, und du verdaust schwer.',
    [b('max_hp', 150, '+150 maximales Leben.'), b('heal_bonus', 1.5, 'Heilmittel wirken 50 % stärker.')],
    [b('digest_mult', 0.6, 'Tränke verdauen 40 % langsamer.'), b('honor_loss', 1.3, 'Ansehensverluste wiegen 30 % schwerer.')]),
  dsz_tresorscheibe: art('Tresorscheibe der Dunscar-Bank', 9000, 'Die Bank gibt es nicht mehr. Die Scheibe dreht sich weiter und rechnet für dich.',
    [b('price', 0.75, 'Einkaufen kostet 25 % weniger.'), b('sell', 1.4, '40 % höherer Erlös beim Verkaufen.')], [b('money_bonus', 0.6, 'Geldbeute fällt 40 % geringer aus.')]),
};

/** Neue Waffen und Verbrauchsgüter. */
export const DS_ITEMS = {
  dsz_schienennagel: { weight: 2, name: 'Geweihter Schienennagel', kind: 'weapon', atk: 16, occult: 1.8, price: 1200,
    desc: 'Ein Nagel aus der ersten Schwelle von Dunscar, über drei Schichten mit Namen beschrieben. Trifft, was keinen Körper hat.' },
  dsz_ofenhammer: { weight: 4, name: 'Hammer der Ofenmutter', kind: 'weapon', atk: 19, occult: 1.3, price: 1500,
    desc: 'Damit wurde der Kalte Ofen zum letzten Mal geschlossen. Unmöglich schwer für seine Größe.' },
  dsz_geisterlaterne: { weight: 1, name: 'Geisterlaterne', kind: 'consumable', price: 300, calm: 60, composure: 40,
    desc: 'Brennt mit einem Licht, das nicht wärmt. Ein Atemzug davon beruhigt Kopf und Nerven. Senkt die Unruhe um 60 und beruhigt die Nerven (+40).' },
};

// Lose der Zirkel. Feste Lose hier, Formeln und Zutaten werden in applyDunscarZirkel je Pfad ergänzt.
const L = (item, price, chance, extra = {}) => ({ item, price, chance, ...extra });
const EINMAL = { once: true };

const FIG = { coat: '#4a4f58', hat: '#2a2c30', skin: '#c99f7b', hair: '#5a4a3a', legs: '#2a2c30' };
const npc = (name, role, coat) => ({ name, role, palette: { ...FIG, coat } });

export const DS_ZIRKEL = {
  kalkofen: {
    name: 'Die Rußgesellschaft',
    short: 'Raritäten und Halbgott-Formeln, im Kalten Ofen',
    alt: 'russ', // Seb 2026-11-12: die Rußgesellschaft ist nach Dunscar gezogen und hat den Kalten Ofen aufgenommen
    host: 'kohlenjem',
    pin: [300, 72],
    exit: 'ds_kalkmarkt',
    mapName: 'Rußgesellschaft im Kalten Ofen',
    desc: 'Kohlen-Jem und seine Leute sind aus Kettlegate nachgekommen und handeln jetzt im stillgelegten Kalkofen hinter dem Kalkmarkt, zusammen mit der Ofenrunde. Wer in Dunscar angekommen ist, darf hinein.',
    invite: 'Die Rußgesellschaft tagt im Kalten Ofen. Hinter dem Kalkmarkt wird heute versteigert, was nicht verkauft werden darf. Der Treffpunkt steht auf der Stadtkarte.',
    light: '#ff9a5a',
    npcs: {
      dsz_ofenmutter: npc('Ofenmutter Selma Grau', 'Hüterin des Kalten Ofens', '#6a3a2a'),
      dsz_brenner: npc('Jonas Brenn', 'Kalkbrenner', '#5a4a3a'),
      dsz_aschenleserin: npc('Ilse Aschgrund', 'Aschenleserin', '#4a3a5a'),
      dsz_loeschmeister: npc('Ruben Lösch', 'Löschmeister', '#3a4a3a'),
      dsz_glasblaeserin: npc('Greta Glut', 'Glasbläserin', '#7a4a2a'),
    },
    members: [
      { id: 'tm_dot', offers: [] },
      { id: 'tm_brann', offers: [] },
      { id: 'dsz_ofenmutter', offers: [] },
      { id: 'dsz_brenner', offers: [L('dsz_ofenhammer', 6500, 0.15, EINMAL), L('dsz_kalkherz', 3500, 0.25, EINMAL), L('dsz_herzwalze', 14000, 0.06, EINMAL)], wants: ['k3o_schichtknopf', 'k3o_stillkiesel'] },
      { id: 'dsz_aschenleserin', offers: [L('dsz_geisterlaterne', 1500, 0.5), L('dsz_spiegel', 10000, 0.07, EINMAL)], wants: ['k3o_schraubenzahn', 'k3o_schichtknopf'] },
      { id: 'dsz_loeschmeister', offers: [L('dsz_lohnbuch', 2800, 0.25, EINMAL), L('dsz_sanduhr', 12000, 0.06, EINMAL)], wants: ['k3o_stillkiesel', 'k3o_schraubenzahn'] },
      { id: 'dsz_glasblaeserin', offers: [L('dsz_geisterlaterne', 1500, 0.5)] },
    ],
    say: {
      dsz_ofenmutter: '„Der Ofen ist kalt, seit die Bank fiel“, sagt Selma. „Was hier brennt, brennt nicht für Kalk. Wer in Dunscar lebt, darf zusehen. Wer bieten will, bringt Tausender mit.“',
      dsz_brenner: 'Jonas wischt Ruß von einem Hammerkopf. „Alles hier hat einmal jemandem gehört, der es nicht hergeben wollte.“',
      dsz_aschenleserin: 'Ilse streut Asche auf ein Blech und liest darin. „Du suchst etwas, das es nicht geben dürfte. Gut. Ich habe es.“',
      dsz_loeschmeister: 'Ruben zählt Münzen in einen Eimer. „Ich lösche keine Feuer. Ich lösche Schulden.“',
      dsz_glasblaeserin: 'Greta dreht eine Glaskugel in der Glut, die es nicht mehr gibt. „Bring mir Signalsilber, und ich zahle dir mehr, als die Bank je hatte.“',
    },
  },
  stellwerk: {
    name: 'Der Kreidezirkel',
    short: 'Formeln, Signale und verbotene Rezepte, im Stummen Stellwerk',
    alt: 'kreide', // der Kreidezirkel hat das Stumme Stellwerk übernommen
    host: 'vellacourt',
    pin: [255, 150],
    exit: 'ds_signalhang',
    mapName: 'Kreidezirkel im Stummen Stellwerk',
    desc: 'Ada Vellacourt hat den Kreidezirkel nach Dunscar geholt und sitzt mit der Hebelrunde im abgeschalteten Stellwerk am Signalhang. Wer in Dunscar angekommen ist, darf hinein.',
    invite: 'Der Kreidezirkel tagt im Stummen Stellwerk am Signalhang. Ein rotes Licht brennt. Der Treffpunkt steht auf der Stadtkarte.',
    light: '#ff5a5a',
    npcs: {
      dsz_stellwerker: npc('Stellwerksmeister Corvin Lathe', 'Hält die Hebelrunde', '#2a3a5a'),
      dsz_telegrafistin: npc('Mira Tackt', 'Telegrafistin', '#5a2a3a'),
      dsz_weichenwaerter: npc('Ansgar Weich', 'Weichenwärter', '#3a5a4a'),
      dsz_fundsammler: npc('Bertolt Fund', 'Sammler aus den Gleisen', '#4a4a3a'),
      dsz_rangierer: npc('Kurt Rangier', 'Rangierer', '#3a3a5a'),
    },
    members: [
      { id: 'tm_sallow', offers: [] },
      { id: 'tm_corve', offers: [] },
      { id: 'dsz_stellwerker', offers: [] },
      { id: 'dsz_telegrafistin', offers: [L('dsz_rohrpost', 2600, 0.3, EINMAL), L('dsz_weichenuhr', 4800, 0.2, EINMAL)], wants: ['k3o_schichtknopf', 'k3o_stillkiesel'] },
      { id: 'dsz_weichenwaerter', offers: [L('dsz_schienennagel', 5000, 0.2, EINMAL), L('dsz_signallinse', 3200, 0.25, EINMAL), L('dsz_augenamulett', 3800, 0.2, EINMAL)], wants: ['k3o_schraubenzahn', 'k3o_schichtknopf'] },
      { id: 'dsz_fundsammler', offers: [L('dsz_glasschluessel', 2200, 0.3, EINMAL), L('dsz_tresorscheibe', 9000, 0.07, EINMAL)], wants: ['k3o_stillkiesel', 'k3o_schraubenzahn'] },
      { id: 'dsz_rangierer', offers: [L('dsz_geisterlaterne', 1500, 0.5)] },
    ],
    say: {
      dsz_stellwerker: '„Hier wird nichts mehr gestellt“, sagt Corvin und legt die Hand auf einen Hebel. „Nur noch gehandelt. Wer in Dunscar angekommen ist, sitzt mit am Pult.“',
      dsz_telegrafistin: 'Mira tippt ohne Strom auf die Morsetaste. „Die Leitung ist tot. Antworten kommen trotzdem.“',
      dsz_weichenwaerter: 'Ansgar ölt einen Nagel, als wäre er eine Klinge. „Auf der falschen Weiche fährt man nur einmal.“',
      dsz_fundsammler: 'Bertolt kippt einen Sack Gleisschotter aus und sortiert mit spitzen Fingern. „Die Gleise geben alles zurück. Irgendwann.“',
      dsz_rangierer: 'Kurt hat Öl bis zu den Ellbogen. „Signalsilber aus den Leitungen? Her damit. Ich zahle besser als jeder Pfandleiher.“',
    },
  },
  salzds: {
    alt: 'salz', // die Salzbrüder aus Wexmoor haben in Dunscar einen Speicher gefunden
    name: 'Die Salzbrüder',
    short: 'Salz, Zutaten und Wertstücke, im Salzspeicher am Arbeiterbogen',
    host: 'zirkel_salzbruder',
    pin: [205, 190],
    exit: 'ds_arbeiterbogen',
    mapName: 'Salzbrüder im alten Streusalzspeicher',
    desc: 'Bruder Kliff und die Salzbrüder sind aus Wexmoor nach Dunscar gekommen. Im alten Streusalzspeicher am Arbeiterbogen wiegen sie wieder. Wer in Dunscar angekommen ist, darf hinein.',
    invite: 'Im alten Streusalzspeicher am Arbeiterbogen stehen die Waagen der Salzbrüder. Heute wird gewogen. Der Treffpunkt steht auf der Stadtkarte.',
    light: '#a0c8ff',
    npcs: {
      dsz_kalkhexe: npc('Alma Kalk', 'Kalkhexe', '#5a5a4a'),
      dsz_apotheker: npc('Doktor Fenwick Staub', 'Apotheker ohne Apotheke', '#3a3a4a'),
    },
    members: [
      { id: 'tm_gischt', offers: [] },
      { id: 'tm_lake', offers: [] },
      { id: 'dsz_sb_kassiererin', offers: [L('dsz_geisterlaterne', 1500, 0.5)] },
      { id: 'dsz_sb_heizer', offers: [] },
      { id: 'dsz_sb_vorarbeiterin', offers: [] },
      { id: 'dsz_kalkhexe', offers: [] },
      { id: 'dsz_apotheker', offers: [L('dsz_geisterlaterne', 1500, 0.5)] },
    ],
    say: {
      dsz_kalkhexe: 'Alma kratzt mit dem Fingernagel Kalk von der Ofenwand. „Ein Kalkopal aus den unteren Stollen, und du kannst dir aussuchen, was auf dem Tisch liegt.“',
      dsz_apotheker: 'Doktor Staub sortiert Fläschchen ohne Etikett. „Rezepte, Zutaten, Wertstücke. Ich kaufe alles, was die Gegner da draußen bei sich tragen.“',
    },
  },
};

/** Weitere Leute (Seb 2026-11-12: zu wenig Leute im Zirkel) (Seb 2026-11-12: zu wenig Leute im Zirkel). */
const SCHICHTBUND_LEUTE = { // Hauer sitzt bei der Stillen Waage, die anderen drei bei den Salzbrüdern
  dsz_sb_hauer: { ...npc('Hauer Mats Stollen', 'Hauer der Nachtschicht', '#4a4030'), zirkel: 'schichtbund',
    say: 'Mats klopft Kalk aus den Stiefeln. „Wer aus den Stollen Schichtgold mitbringt, kriegt hier mehr als in der Bank, die es nicht mehr gibt.“' },
  dsz_sb_kassiererin: { ...npc('Kassiererin Ada Pfennig', 'Führt die Schichtkasse', '#5a4a2a'), zirkel: 'salzds',
    say: 'Ada schiebt Münzen zu ordentlichen Türmen. „Signalsilber, Schichtgold, Kalkopal. Die Kasse zahlt für alles, was rar ist.“' },
  dsz_sb_heizer: { ...npc('Heizer Lutz Kohl', 'Heizer der letzten Lok', '#3a3030'), zirkel: 'salzds',
    say: 'Lutz wärmt sich die Hände an einem kalten Kessel. „Die Gegner da draußen tragen Silber in den Taschen. Bring es her.“' },
  dsz_sb_vorarbeiterin: { ...npc('Vorarbeiterin Grete Hub', 'Teilt die Schichten ein', '#3a4a4a'), zirkel: 'salzds',
    say: 'Grete hakt Namen auf einer Tafel ab. „Wer viel bringt, sitzt vorn. Wer nichts bringt, schaut zu.“' },
};

/** Flickerin: bei jedem Dunscar-Treffen dabei, repariert korrumpierte Stücke (core/Corruption.js repairAt, 500). */
export const FLICKERIN = 'dsz_flickerin';
const FLICKERIN_PLATZ = [20, 11];
const FLICKERIN_DIALOG = { start: 'start', nodes: { start: {
  text: 'Eine Frau mit Kalkstaub im Haar sitzt auf einer Kiste, eine lange Nadel zwischen den Lippen. „Hanne Saum. Ich gehe von Treffen zu Treffen und flicke, was das Andere angefressen hat. Fünfhundert das Stück.“',
  choices: [{ text: 'Korrumpierte Stücke reparieren lassen.', repair: true }, { text: 'Auf Wiedersehen.' }] } } };

/** Sitzplätze im Raum (Gastgeber oben, sieben Mitglieder ringsum). */
const SEATS = [[12, 4], [5, 7], [12, 8], [19, 7], [8, 5], [16, 5], [8, 10], [16, 10]];

function room(id, z) {
  return {
    id: `treffen_${id}`,
    name: z.mapName,
    city: 'dunscar',
    tiles: 'ds_bahn',
    rows: ['IIIIIIIIIIIIIIIIIIIIIIII', ...Array(12).fill('I......................I'), 'IIIIIIIIIIIIIIIIIIIIIIII'],
    spawns: { default: [3, 11] },
    lights: [{ tile: [12, 6], radius: 100, intensity: 0.7, color: z.light }],
    ambient: { night: 0.62, fog: 0 },
    npcs: [...[z.host, ...z.members.map((m) => m.id)].map((n, i) => ({ id: n, tile: SEATS[i] })), { id: FLICKERIN, tile: FLICKERIN_PLATZ }],
    interactables: [{ id: `dsz_${id}_ausgang`, kind: 'door', tile: [3, 12], to: z.exit, spawn: 'default', prompt: 'Hinaus nach Dunscar', marker: true }],
    decor: [],
  };
}

const REGEL = '„Vier Zirkel teilen sich die Nacht in Dunscar: die Stille Waage, der Kreidezirkel, die Rußgesellschaft und die Salzbrüder. Alle fünf Minuten hält einer Runde. Wer zu spät kommt, wartet zwanzig Minuten.“';

/** Gespräch einer Dunscar-Figur am Zirkeltisch. */
function memberDialog(circleId, text) {
  return { start: 'start', nodes: {
    start: { text, choices: [
      { text: 'Die Angebote der Runde ansehen.', auction: circleId, requires_gathering: circleId },
      { text: 'Wann trefft ihr euch?', next: 'regel' },
      { text: 'Auf Wiedersehen.' }] },
    regel: { text: REGEL, choices: [{ text: 'Auf Wiedersehen.' }] },
  } };
}

function dialogues(id, z) {
  return Object.fromEntries(Object.keys(z.npcs).map((n) => [n, memberDialog(id, z.say[n])]));
}

/** Die Stille Waage in Dunscar (Kennung schichtbund). */
const WAAGE = {
  host: 'tresswell',
  alt: ['tm_halloran', 'tm_rusk'],
  mapName: 'Stille Waage unter dem Runddepot',
  desc: 'Ignaz Tresswell hat die Stille Waage nach Dunscar gebracht und mit dem Schichtbund unter dem Runddepot zusammengelegt. Wer in Dunscar angekommen ist, darf hinein.',
  circle: { name: 'Die Stille Waage', short: 'Zutaten und Schichtbund-Ware, unter dem Runddepot',
    invite: 'Die Stille Waage wiegt heute unter dem Runddepot, zusammen mit dem Schichtbund. Der Treffpunkt steht auf der Stadtkarte.' },
};

/** Was die alten Gastgeber in Dunscar sagen. */
const ALT_GESICHTER = {
  schichtbund: { host: 'Tresswell legt die Lupe ab und lächelt dünn. „Du. In Kettlegate hast du ruhig geboten. Hier unten haben wir uns mit dem Schichtbund zusammengetan. Die Waage ist dieselbe, nur die Preise sind schwerer.“' },
  stellwerk: { host: 'Ada Vellacourt wischt Kreide von einem Signalhebel. „Wir haben die Tafeln eingepackt, als Kettlegate zu heiß wurde. Die Hebelrunde hat uns aufgenommen. Lesen ist immer noch umsonst.“' },
  kalkofen: { host: 'Kohlen-Jem sitzt auf einem Sack Kalk statt auf Kohle. „Der Krater ist weit weg, aber die Ware findet uns. Der Ofen gehört jetzt uns und den Ofenleuten zusammen.“' },
  salzds: { host: 'Bruder Kliff tariert eine Waage zwischen Säcken mit Streusalz. „Das Meer ist weit, das Salz nicht. Die Brüder haben gesagt, dass du kommst. Wiegen wir, wie in Wexmoor.“' },
};

/** Pack für buildContent: Zirkel, Räume, Reiseziele, Figuren, Gespräche, Artefakte und Gegenstände. Nach k3_handel einhängen. */
export function dunscarZirkelPack() {
  const circles = {};
  const pins = {};
  const travel = [];
  const maps = [];
  let npcs = {};
  let dlg = {};
  for (const [id, z] of Object.entries(DS_ZIRKEL)) {
    circles[id] = { name: z.name, member_flag: 'k3_arrived', map: `treffen_${id}`, short: z.short, city: 'dunscar', invite: z.invite, host: z.host,
      members: z.members.map((m) => ({ id: m.id, offers: m.offers.map((o) => ({ ...o })), wants: [...DS_GESUCHE.wants] })) };
    pins[`treffen_${id}`] = z.pin;
    travel.push({ map: `treffen_${id}`, spawn: 'default', name: z.name, desc: `${z.desc} Nur während eines offenen Treffens.`, requires_gathering: id, requires_flags: ['k3_arrived'], city: 'dunscar' });
    maps.push(room(id, z));
    npcs = { ...npcs, ...Object.fromEntries(Object.entries(z.npcs).map(([n, d]) => [n, { ...d, dialogue: n }])) };
    dlg = { ...dlg, ...dialogues(id, z) };
  }
  for (const [n, { say, zirkel, ...d }] of Object.entries(SCHICHTBUND_LEUTE)) {
    npcs[n] = { ...d, dialogue: n };
    dlg[n] = memberDialog(zirkel, say);
  }
  npcs[FLICKERIN] = { ...npc('Flickerin Hanne Saum', 'Repariert Korrumpiertes, jedes Treffen', '#3a5a5a'), dialogue: FLICKERIN };
  dlg[FLICKERIN] = FLICKERIN_DIALOG;
  return {
    name: 'ds_zirkel',
    items: { ...DS_ITEMS },
    npcs,
    dialogues: dlg,
    artifacts: { list: DS_ARTEFAKTE },
    treffen: { rules: { orders: { dunscar: ['schichtbund', 'stellwerk', 'kalkofen', 'salzds'] } }, circles, pins, travel, maps },
  };
}

/** Alle Figuren der neuen Zirkel (für Lauf-Sheets in assets.js). */
export const DS_ZIRKEL_FIGUREN = [...Object.values(DS_ZIRKEL).flatMap((z) => Object.keys(z.npcs)), ...Object.keys(SCHICHTBUND_LEUTE), 'dsz_flickerin'];
/** Alle neuen Gegenstände mit eigenem Bild. */
export const DS_ZIRKEL_ICONS = [...Object.keys(DS_ARTEFAKTE), ...Object.keys(DS_ITEMS)];

/** Seltene neue Stücke zusätzlich beim Schichtbund. */
const SCHICHTBUND_NEU = {
  tm_ds_lampe: [L('dsz_geisterlaterne', 1500, 0.4)],
  tm_ds_kerbholz: [L('dsz_lohnbuch', 2800, 0.15, EINMAL)],
  tm_ds_stimme: [L('dsz_rohrpost', 2600, 0.15, EINMAL)],
};

/**
 * Nach applySequenzen: neue Stücke in den Schichtbund (alte Lose bleiben zu alten Preisen),
 * Halbgott-Formeln (alle Pfade) und Seq-5-Zutaten in den Kalten Ofen, Formeln 6/5 der übrigen Pfade ins Stellwerk.
 */
export function applyDunscarZirkel(content) {
  const circles = content.gatherings?.circles;
  if (!circles?.kalkofen || !circles?.stellwerk || !circles?.salzds) return;
  // Die Flickerin sitzt auch beim Schichtbund
  const bundMap = content.maps[circles.schichtbund?.map];
  if (bundMap && !bundMap.npcs.some((n) => n.id === FLICKERIN)) bundMap.npcs = [...bundMap.npcs, { id: FLICKERIN, tile: FLICKERIN_PLATZ }];
  // Seb 2026-11-12: Die Stille Waage ist nach Dunscar gezogen und hat den Schichtbund aufgenommen.
  // Die Kennung bleibt `schichtbund` (Aufnahme, Post, Erfolge, Fasserin-Aufträge, Spielstände), Name und Gastgeber wechseln.
  if (circles.schichtbund && circles.schichtbund.host !== WAAGE.host) {
    const sb = circles.schichtbund;
    const members = [...WAAGE.alt.map((id) => ({ id, offers: [], wants: [] })), { id: sb.host, offers: [], wants: [] }, ...sb.members,
      ...Object.entries(SCHICHTBUND_LEUTE).filter(([, d]) => d.zirkel === 'schichtbund').map(([id]) => ({ id, offers: [], wants: [] }))];
    circles.schichtbund = { ...sb, ...WAAGE.circle, host: WAAGE.host, members };
    if (bundMap) {
      content.maps[sb.map] = { ...bundMap, name: WAAGE.mapName,
        npcs: [...[WAAGE.host, ...members.map((m) => m.id)].map((id, i) => ({ id, tile: SEATS[i] })), { id: FLICKERIN, tile: FLICKERIN_PLATZ }] };
    }
    content.travel = (content.travel ?? []).map((t) => (t.map === sb.map ? { ...t, name: WAAGE.circle.name, desc: `${WAAGE.desc} Nur während eines offenen Treffens.` } : t));
  }
  // Die alten Gesichter: in Dunscar (nach der Ankunft) eigener Gesprächsanfang mit dem Dunscar-Treffen
  for (const [cid, c] of Object.entries(circles)) {
    if (c.city !== 'dunscar') continue;
    const alt = ALT_GESICHTER[cid];
    for (const id of [c.host, ...c.members.map((m) => m.id)]) {
      const tree = content.dialogues[id];
      if (!tree || id.startsWith('dsz_') || !Array.isArray(tree.start) || tree.nodes.ds_open) continue;
      const name = content.npcs[id]?.name ?? id;
      tree.nodes = { ...tree.nodes,
        ds_open: { text: id === c.host ? alt.host : `${name} nickt dir zu. „Kettlegate, Wexmoor, jetzt Dunscar. Wir ziehen dahin, wo noch gehandelt wird. Und wir vergessen keine Gesichter.“`,
          choices: [{ text: 'Die Runde eröffnen.', auction: cid }, { text: 'Wann trefft ihr euch?', next: 'ds_regel' }, { text: 'Ich gehe.' }] },
        ds_regel: { text: REGEL, choices: [{ text: 'Gut.' }] },
        ds_closed: { text: `${name} sitzt nicht am Tisch. ${c.name} trifft sich wieder, wenn die Uhr es sagt. Die Einladung kommt wie immer.`, choices: [{ text: 'Gut.' }] },
      };
      tree.start = [{ node: 'ds_open', requires_gathering: cid }, { node: 'ds_closed', requires_flags: ['k3_arrived'] }, ...tree.start];
    }
  }
  const pids = Object.keys(content.pathways ?? {});
  const has = (id) => !!content.items[id];
  const seat = (cid, i) => circles[cid].members[i % circles[cid].members.length];
  // Halbgott-Formel (Seq 4): nur auf Treffen oder als Elite-Fund, nie bei Pfad-Beyondern. Seq-5-Zutaten dazu.
  pids.filter((p) => has(`formel_${p}_4`)).forEach((p, i) => seat('kalkofen', i).offers.push(
    L(`formel_${p}_4`, DS_LOS.formel[4], DS_LOS.formel4Chance, { once: true, requires_pathway: [p, 5], locked_text: 'Erst ab Sequenz 5 dieses Pfades' })));
  // Kernzutat der Formel 5 (die erste Zutat, z. B. Lichtperle oder sq_zutat_waage_5)
  const kern5 = (p) => Object.keys(content.items[`formel_${p}_5`]?.ingredients ?? {})[0];
  pids.filter((p) => kern5(p) && has(kern5(p))).forEach((p, i) => seat(circles.salzds ? 'salzds' : 'kalkofen', i + 1).offers.push(
    L(kern5(p), DS_LOS.zutat5.price, DS_LOS.zutat5.chance, { requires_pathway: [p, 6], locked_text: 'Erst ab Sequenz 6 dieses Pfades' })));
  // Formeln 6/5 der Pfade, die der Schichtbund nicht führt
  const bund = new Set((circles.schichtbund?.members ?? []).flatMap((m) => m.offers.map((o) => o.item)));
  pids.filter((p) => !bund.has(`formel_${p}_5`)).forEach((p, i) => {
    for (const s of [6, 5]) {
      if (has(`formel_${p}_${s}`)) seat('stellwerk', i).offers.push(L(`formel_${p}_${s}`, DS_LOS.formel[s], DS_LOS.formel65Chance, { once: true, requires_pathway: [p, s + 1], locked_text: `Erst ab Sequenz ${s + 1} dieses Pfades` }));
    }
  });
  // Schichtbund: billiges raus, seltenes rein
  for (const m of circles.schichtbund?.members ?? []) m.offers.push(...(SCHICHTBUND_NEU[m.id] ?? []).map((o) => ({ ...o })));
  // Seq-3-Formel (Seb 2026-11-12): taucht mit 1 % auf, für 15.000; reihum über alle drei Dunscar-Zirkel
  const seats3 = Object.values(circles).filter((c) => c.city === 'dunscar').flatMap((c) => c.members);
  pids.filter((p) => has(`formel_${p}_3`)).forEach((p, i) => seats3[i % seats3.length].offers.push(
    L(`formel_${p}_3`, DS_LOS.formel[3], DS_LOS.formel3Chance, { once: true, requires_pathway: [p, 4], nachbar: true, locked_text: 'Erst ab Sequenz 4 dieses Pfades oder seines Nachbarpfads' })));
  // Formeln unter Sequenz 3 nie
  for (const c of Object.values(circles)) {
    if (c.city !== 'dunscar') continue;
    for (const m of c.members) m.offers = m.offers.filter((o) => content.items[o.item] && !(content.items[o.item].kind === 'formula' && content.items[o.item].seq <= 2));
  }
  // Seb 2026-11-12: Jedes Mitglied legt pro Runde genau ein Los auf. Darum alle Lose eines Dunscar-Zirkels gleichmäßig
  // auf alle Leute verteilen (häufige zuerst, damit jeder etwas Gängiges hat). Mehr Leute = mehr Lose je Runde,
  // kleinere Töpfe je Person = bessere Chance für jedes einzelne Stück. Alle kaufen Dunscar-Wertstücke teuer an.
  for (const [cid, c] of Object.entries(circles)) {
    if (c.city !== 'dunscar') continue;
    const all = c.members.flatMap((m) => m.offers).sort((x, y) => (y.chance ?? 1) - (x.chance ?? 1));
    const members = c.members.map((m) => ({ ...m, offers: [], wants: [...DS_GESUCHE.wants] }));
    all.forEach((o, i) => members[i % members.length].offers.push(o));
    circles[cid] = { ...c, members, request_chance: DS_GESUCHE.request_chance, request_min: DS_GESUCHE.request_min, request_markup: DS_GESUCHE.request_markup };
  }
}
