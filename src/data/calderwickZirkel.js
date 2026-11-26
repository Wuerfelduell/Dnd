/**
 * Geheime Zirkel in Calderwick (Seb 2026-11-26): „Calderwick soll eigene Zirkel bekommen, aber hauptsächlich für
 * Artefakte, Waffen und Rüstungen.“ Kettlegate und Wexmoor sind ab Calderwick nicht mehr erreichbar, Dunscar nur per
 * Pendelzug; darum zwei eigene Runden in der Stadt der Gefallenen.
 *
 * - Der Bleisatz (Hinterzimmer der Setzergasse): Waffen und Rüstungen (Mäntel, Hüte, Amulette) über dem Ladenniveau.
 * - Die Pfandrunde (unter dem Quittungsmarkt): Artefakte mit starkem Segen und spürbarem Fluch.
 * - Am Rand: Seq-4-Kernzutaten (selten); die zufällige Seq-3-Formel legt core/Auction.js zirkelFormel3 von selbst auf.
 * - Aufnahme wie in Wexmoor über Bürgen: Die Türsteherin am Quittungsmarkt lässt ein, wer einen der Calderwicker
 *   Bürgen (data/zweiterAufstieg.js BUERGEN) auf seiner Seite hat (dieselben Bedingungen wie für die Unterschrift).
 * - Treffen im üblichen 5-Minuten-Takt (rules.interval_min), die beiden Runden wechseln sich ab.
 * - Beyonder-Reste lassen sich hier wie überall im Zirkel als eigenes Los versteigern (core/Auction.js ownOfferables).
 */
import { BUERGEN, BUERGEN_FLAGS } from './zweiterAufstieg.js';

export const CWZ_FLAG = 'cwz_aufnahme';
export const CWZ_TUER = 'cwz_tuersteherin';

const L = (item, price, chance, extra = {}) => ({ item, price, chance, ...extra });
const EINMAL = { once: true };
const b = (key, value, text) => ({ key, value, text });
const art = (name, price, desc, boons, curses) => ({ name, source: 'treffen', price, weight: 1, desc, boons, curses });

/** Waffen über den Calderwicker Läden (dort 12.000–31.000, Angriff 32–50). */
export const CWZ_WAFFEN = {
  cwz_setzerbeil: { weight: 3, name: 'Setzerbeil der Nachtschicht', kind: 'weapon', atk: 54, price: 36000,
    desc: 'Damit trennten die Nachtsetzer Bleizeilen, die niemand drucken durfte. Die Schneide ist noch schwarz von Druckerschwärze.' },
  cwz_quittungsdegen: { weight: 2, name: 'Quittungsdegen', kind: 'weapon', atk: 52, occult: 1.6, price: 38000,
    desc: 'Eine dünne Klinge, auf der jede Quittung der Stadt eingeritzt ist. Sie trifft, was sich nicht bezahlt hat.' },
  cwz_archivlanze: { weight: 4, name: 'Lanze des Kronenarchivs', kind: 'weapon', atk: 58, occult: 1.4, price: 48000,
    desc: 'Die Archivwache trug sie gegen das, was nachts aus den Akten stieg. Der Schaft ist aus einem Regal gedreht.' },
  cwz_gleishammer: { weight: 6, name: 'Hammer vom Gleisfuß', kind: 'weapon', atk: 62, price: 52000,
    desc: 'Mit ihm wurden die Aufschlagstellen der Gefallenen eingeebnet. Wer ihn hebt, spürt jeden Sturz.' },
  cwz_verbranntes_zepter: { weight: 3, name: 'Verbranntes Zepter', kind: 'weapon', atk: 68, occult: 1.8, price: 75000,
    desc: 'Ein Zepter von oben, mit dem Halbgott, der es trug, heruntergefallen. Es glüht noch, wenn man es schwingt.' },
};

/** Rüstungen (Mantel, Hut, Amulett) über den Calderwicker Läden (dort bis 22.000). */
export const CWZ_RUESTUNG = {
  cwz_aschemantel: { weight: 4, name: 'Aschemantel der Gefallenen', kind: 'gear', slot: 'mantel', price: 40000,
    boons: [b('max_hp', 420, '+420 maximales Leben.'), b('damage_taken', 0.9, '10 % weniger erlittener Schaden.')],
    desc: 'Aus den Mänteln derer genäht, die beim Sturz verbrannten. Er hält, was sie nicht halten konnten.' },
  cwz_quittungsrobe: { weight: 3, name: 'Robe der Quittungsschreiber', kind: 'gear', slot: 'mantel', price: 34000,
    boons: [b('max_hp', 300, '+300 maximales Leben.'), b('max_nerves', 40, '+40 maximale Nerven.')],
    desc: 'Schwer von eingenähten Belegen. Wer sie trägt, weiß immer, was er schuldet, und lässt sich nichts vormachen.' },
  cwz_fallhut: { weight: 1, name: 'Fallhut', kind: 'gear', slot: 'hut', price: 30000,
    boons: [b('max_hp', 280, '+280 maximales Leben.'), b('dodge_window', 1.2, 'Ausweichfenster +20 %.')],
    desc: 'Ein Hut mit Krempe aus Blech. Er ist schon einmal von ganz oben gefallen und hat seinen Träger überlebt.' },
  cwz_setzerzylinder: { weight: 1, name: 'Zylinder des Obersetzers', kind: 'gear', slot: 'hut', price: 32000,
    boons: [b('max_hp', 200, '+200 maximales Leben.'), b('ap_start', 1, '+1 Konzentration zum Kampfbeginn.')],
    desc: 'Im Futter steckt eine Bleiletter für jeden Satz, den der Obersetzer nie gesetzt hat.' },
  cwz_kassenamulett: { weight: 0.5, name: 'Amulett der Gefallenenkasse', kind: 'gear', slot: 'amulett', price: 42000,
    boons: [b('damage_taken', 0.65, '35 % weniger erlittener Schaden.'), b('max_hp', 60, '+60 maximales Leben.')],
    desc: 'Die erste Münze, die je in die Kasse der Gefallenen gezahlt wurde, an einer Kette. Sie zahlt für dich.' },
  cwz_glutsiegel: { weight: 0.5, name: 'Glutsiegel', kind: 'gear', slot: 'amulett', price: 38000,
    boons: [b('dmg_mult', 1.15, 'Schaden ×1,15.'), b('max_hp', 80, '+80 maximales Leben.')],
    desc: 'Ein Siegel aus dem Kronenarchiv, das nie ganz abgekühlt ist. Was es berührt, ist besiegelt.' },
};

/** Artefakte: starker Segen, spürbarer Fluch (Calderwick-Niveau). */
export const CWZ_ARTEFAKTE = {
  cwz_kronsplitter: art('Splitter der Krone', 28000, 'Ein Zacken der Krone, die oben jemand verloren hat. Er schneidet in die Hand, die ihn hält, und in alles andere.',
    [b('dmg_mult', 1.5, 'Schaden ×1,50.'), b('max_hp', 100, '+100 maximales Leben.')], [b('unruhe_tick', 0.35, '+0,35 Unruhe pro Sekunde.'), b('honor_loss', 1.5, 'Ansehensverluste wiegen 50 % schwerer.')]),
  cwz_aschequittung: art('Aschequittung', 26000, 'Eine Quittung über einen Sturz, ausgestellt auf deinen Namen. Solange du sie trägst, ist er schon bezahlt.',
    [b('damage_taken', 0.7, '30 % weniger Schaden.'), b('max_hp', 120, '+120 maximales Leben.')], [b('composure_regen', 0.6, 'Nervenerholung nur 60 %.')]),
  cwz_fallfeder: art('Feder vom ersten Sturz', 22000, 'Grau, angesengt, federleicht. Sie fällt nie zu Boden.',
    [b('dodge_window', 1.5, 'Ausweichfenster +50 %.'), b('ap_start', 1, '+1 Konzentration zum Kampfbeginn.')], [b('heal_bonus', 0.75, 'Heilmittel wirken nur zu 75 %.')]),
  cwz_kassenbuch: art('Kassenbuch der Gefallenen', 20000, 'Jede Einzahlung seit vierzig Jahren. Es rechnet mit, und es rechnet ab.',
    [b('money_bonus', 1.6, 'Beutegeld ×1,60.')], [b('damage_taken', 1.15, '15 % mehr Schaden.')]),
  cwz_zweiter_fahrschein: art('Zweiter Fahrschein', 35000, 'Ein Fahrschein für den zweiten Zug, ungestempelt. Er gibt dir Zeit, die du oben brauchen wirst, und nimmt dir Leben, das du unten hast.',
    [b('ap_round', 1, 'Zu Beginn jeder weiteren Runde +1 Konzentration.'), b('ap_max', 1, '+1 Höchstkonzentration.')], [b('max_hp', -80, '80 weniger maximales Leben.'), b('digest_mult', 0.8, 'Tränke verdauen 20 % langsamer.')]),
  cwz_sturzherz: art('Herz des ersten Sturzes', 60000, 'Unmöglich, sagt die Pfandrunde. Das Herz des ersten Halbgottes, der in Calderwick aufschlug. Es schlägt noch, und es will wieder hinauf.',
    [b('dmg_mult', 1.7, 'Schaden ×1,70.'), b('damage_taken', 0.8, '20 % weniger Schaden.'), b('ap_max', 2, '+2 Höchstkonzentration.'), b('max_hp', 150, '+150 maximales Leben.')],
    [b('unruhe_tick', 0.7, '+0,7 Unruhe pro Sekunde.'), b('honor_loss', 2, 'Ansehensverluste wiegen doppelt.')]),
};

/** Bilder: Leihbilder aus dem Vorrat (vi_*), bis eigene Grafik kommt (assets.js). */
export const CWZ_ICONS = {
  cwz_setzerbeil: 'vi_waffe_setzhaken', cwz_quittungsdegen: 'vi_waffe_veredelungsschere', cwz_archivlanze: 'vi_waffe_richterstab',
  cwz_gleishammer: 'vi_waffe_bleihammer', cwz_verbranntes_zepter: 'vi_waffe_dampfrohr',
  cwz_aschemantel: 'vi_mantel_dampfmantel', cwz_quittungsrobe: 'vi_mantel_archivrobe', cwz_fallhut: 'vi_hut_fuhrmannshut',
  cwz_setzerzylinder: 'vi_hut_zylinder_vermesser', cwz_kassenamulett: 'vi_amulett_rohrpostkapsel', cwz_glutsiegel: 'vi_amulett_bleiletter',
  cwz_kronsplitter: 'dsz_signalzunge', cwz_aschequittung: 'dsz_lohnbuch', cwz_fallfeder: 'dsz_rohrpost', cwz_kassenbuch: 'dsz_lohnbuch',
  cwz_zweiter_fahrschein: 'dsz_weichenuhr', cwz_sturzherz: 'dsz_lohnherz',
};

/** Seq-4-Kernzutaten am Rand (Dunscar: 2000; hier selten und teurer), ab Seq 5 des Pfades. */
export const CWZ_ZUTAT4 = { price: 3000, chance: 0.12 };

/**
 * Gesuche: Calderwicker Trophäen (Bosse und seltene Gegner). Seltener und knapper als in Dunscar, damit es kein Farmweg wird
 * (Seb 2026-11-13 zu Dunscar: zu leicht zu farmen). Preise ×15 durch applySpaetBeute (PR #578).
 */
export const CWZ_GESUCHE = {
  wants: ['vt_cw_boss_bleisammler', 'vt_cw_boss_blinder_zusteller', 'vt_cw_boss_nullfundament', 'vt_cw_seilbahnwaechter', 'vt_cw_registerratte'],
  request_chance: 0.35, request_min: 1500, request_markup: 1.2,
};

const FIG = { coat: '#4a4f58', hat: '#2a2c30', skin: '#c99f7b', hair: '#5a4a3a', legs: '#2a2c30' };
const npc = (name, role, coat) => ({ name, role, palette: { ...FIG, coat } });

/** Figuren und welches vorhandene Lauf-Sheet sie leihen (assets.js), bis eigene Grafik kommt. */
export const CWZ_SHEETS = {
  [CWZ_TUER]: 'cs_cwn_e_waescherin',
  cwz_bleisetzer: 'cs_cwn_e_nachtsetzer', cwz_waffenwart: 'cs_cwn_e_griffmacherin', cwz_schneiderin: 'cs_cwn_e_fensterputzerin',
  cwz_kesselflicker: 'cs_cwn_e_laternenwart', cwz_letternfrau: 'cs_cwn_e_archivdienerin',
  cwz_pfandmeister: 'cs_cwn_e_marktfrau', cwz_schaetzerin: 'cs_cwn_e_archivdienerin', cwz_kassenwart: 'cs_cwn_e_bote',
  cwz_sammlerin: 'cs_cwn_e_waescherin', cwz_aschehaendler: 'cs_cwn_e_nachtsetzer',
};

/** Die beiden Zirkel. Mitglied 0 ist der Gastgeber. */
export const CW_ZIRKEL = {
  cw_bleisatz: {
    name: 'Der Bleisatz', short: 'Waffen und Rüstungen, im Hinterzimmer der Setzergasse',
    pin: [168, 214], exit: 'cw_setzergasse', mapName: 'Bleisatz im Hinterzimmer der Setzergasse', light: '#e0b070',
    desc: 'Im Hinterzimmer einer stillgelegten Setzerei versteigern Gefallene, was sie von oben mitgebracht oder hier unten geschmiedet haben: Waffen und Rüstungen.',
    invite: 'Der Bleisatz trifft sich im Hinterzimmer der Setzergasse. Heute liegen Klingen und Mäntel auf dem Setzkasten. Der Treffpunkt steht auf der Stadtkarte.',
    npcs: {
      cwz_bleisetzer: npc('Obersetzer Konrad Blei', 'Gastgeber des Bleisatzes', '#3a3a40'),
      cwz_waffenwart: npc('Waffenwartin Hedda Kling', 'Fiel als Halbgott des Eisens', '#4a3a30'),
      cwz_schneiderin: npc('Schneiderin Vera Saum', 'Näht aus Verbranntem', '#4a4a5a'),
      cwz_kesselflicker: npc('Kesselflicker Bruno Ruß', 'Repariert Rüstungen von oben', '#3a3430'),
      cwz_letternfrau: npc('Letternfrau Ilse Zeile', 'Sammelt Bleilettern und Amulette', '#50463a'),
    },
    say: {
      cwz_bleisetzer: 'Konrad Blei wischt Schwärze von einem Setzkasten, in dem Klingen statt Lettern liegen. „Wir setzen keine Sätze mehr. Wir setzen Preise.“',
      cwz_waffenwart: 'Hedda Kling prüft eine Schneide mit dem Daumen. „Was in den Läden hängt, ist für Leute, die nicht fallen. Hier liegt, was oben getragen wurde.“',
      cwz_schneiderin: 'Vera Saum zieht einen Faden aus einem verkohlten Ärmel. „Jeder Mantel hier hat schon einmal gebrannt. Darum hält er.“',
      cwz_kesselflicker: 'Bruno Ruß klopft auf einen Helm, bis er klingt. „Oben war das Rüstung. Hier unten ist es Lebensversicherung.“',
      cwz_letternfrau: 'Ilse Zeile lässt eine Kette durch die Finger laufen. „Bring mir, was die Beyonder fallen lassen, wenn sie fallen. Ich kenne Leute, die dafür zahlen.“',
    },
    members: [
      { id: 'cwz_bleisetzer', offers: [L('cwz_setzerbeil', 36000, 0.45), L('cwz_verbranntes_zepter', 75000, 0.08, EINMAL)] },
      { id: 'cwz_waffenwart', offers: [L('cwz_quittungsdegen', 38000, 0.4), L('cwz_archivlanze', 48000, 0.3), L('cwz_gleishammer', 52000, 0.25)] },
      { id: 'cwz_schneiderin', offers: [L('cwz_aschemantel', 40000, 0.35), L('cwz_quittungsrobe', 34000, 0.45)] },
      { id: 'cwz_kesselflicker', offers: [L('cwz_fallhut', 30000, 0.45), L('cwz_setzerzylinder', 32000, 0.4)] },
      { id: 'cwz_letternfrau', offers: [L('cwz_kassenamulett', 42000, 0.3), L('cwz_glutsiegel', 38000, 0.35)] },
    ],
  },
  cw_pfandrunde: {
    name: 'Die Pfandrunde', short: 'Artefakte, im Keller unter dem Quittungsmarkt',
    pin: [262, 176], exit: 'cw_quittungsmarkt', mapName: 'Pfandrunde unter dem Quittungsmarkt', light: '#c0a0e0',
    desc: 'Unter dem Quittungsmarkt verpfänden Gefallene, was sie von oben mitgebracht haben. Wer genug bietet, löst es aus: Artefakte, die mehr können, als sie sollten.',
    invite: 'Die Pfandrunde trifft sich im Keller unter dem Quittungsmarkt. Heute werden Artefakte ausgelöst. Der Treffpunkt steht auf der Stadtkarte.',
    npcs: {
      cwz_pfandmeister: npc('Pfandmeister Ambros Kerb', 'Gastgeber der Pfandrunde', '#3a3048'),
      cwz_schaetzerin: npc('Schätzerin Liesl Lupe', 'Schätzt, was von oben kommt', '#45405a'),
      cwz_kassenwart: npc('Kassenwart Emil Groschen', 'Führt das Pfandbuch', '#4a4a38'),
      cwz_sammlerin: npc('Sammlerin Margit Asch', 'Sammelt Gefallenes', '#503a3a'),
      cwz_aschehaendler: npc('Aschehändler Ferdinand Glut', 'Handelt mit Verbranntem', '#3a3a30'),
    },
    say: {
      cwz_pfandmeister: 'Ambros Kerb legt einen Pfandschein nach dem anderen auf den Tisch. „Alles hier hat jemand verpfändet, der nicht wiederkam. Ausgelöst wird gegen Gebot.“',
      cwz_schaetzerin: 'Liesl Lupe hält ein Artefakt gegen das Licht. „Stark. Und es nimmt sich, was es gibt. Das ist bei allem so, was von oben fällt.“',
      cwz_kassenwart: 'Emil Groschen blättert im Pfandbuch. „Wer einen Rest mitbringt, bekommt hier einen fairen Preis. Fairer als draußen jedenfalls.“',
      cwz_sammlerin: 'Margit Asch streicht über eine angesengte Feder. „Ich sammle, was den Sturz überstanden hat. Und ich kaufe, was Beyonder zurücklassen.“',
      cwz_aschehaendler: 'Ferdinand Glut riecht an einem Siegel. „Riecht nach oben. Das zahlt sich aus.“',
    },
    members: [
      { id: 'cwz_pfandmeister', offers: [L('cwz_kronsplitter', 28000, 0.35), L('cwz_sturzherz', 60000, 0.08, EINMAL)] },
      { id: 'cwz_schaetzerin', offers: [L('cwz_aschequittung', 26000, 0.4), L('cwz_zweiter_fahrschein', 35000, 0.25)] },
      { id: 'cwz_kassenwart', offers: [L('cwz_kassenbuch', 20000, 0.45), L('cwz_aschequittung', 26000, 0.2)] },
      { id: 'cwz_sammlerin', offers: [L('cwz_fallfeder', 22000, 0.45)] },
      { id: 'cwz_aschehaendler', offers: [L('cwz_kronsplitter', 28000, 0.2), L('cwz_glutsiegel', 38000, 0.2)] },
    ],
  },
};

const REGEL = '„Zwei Runden teilen sich die Nacht in Calderwick: der Bleisatz in der Setzergasse und die Pfandrunde unter dem Quittungsmarkt. Alle fünf Minuten hält eine Runde. Wer zu spät kommt, wartet zehn Minuten.“';

function memberDialog(circleId, text) {
  return { start: 'start', nodes: {
    start: { text, choices: [
      { text: 'Die Angebote der Runde ansehen.', auction: circleId, requires_gathering: circleId },
      { text: 'Wann trefft ihr euch?', next: 'regel' },
      { text: 'Auf Wiedersehen.' }] },
    regel: { text: REGEL, choices: [{ text: 'Auf Wiedersehen.' }] },
  } };
}

/** Türsteherin am Quittungsmarkt: lässt ein, wer einen Calderwicker Bürgen hat (Bedingungen wie für die Unterschrift). */
function tuerDialog(content) {
  const buergen = Object.entries(BUERGEN).filter(([id]) => content.npcs[id]).map(([id, bu]) => ({
    text: `„${content.npcs[id].name.split(' ')[0]} bürgt für mich.“`, next: 'ok', ...bu.bedingung, hide_if_flags: [CWZ_FLAG],
  }));
  return { start: 'start', nodes: {
    start: { text: 'Eine Frau mit Waschbrett unter dem Arm steht vor einer Kellertür, die es eigentlich nicht gibt. „Lene Riegel. Hier unten und in der Setzergasse treffen sich die Zirkel von Calderwick. Rein kommt nur, für wen einer aus der Stadt bürgt.“',
      choices: [
        ...buergen,
        { text: '„Ich habe schon eine Unterschrift für den zweiten Zug.“', next: 'ok', requires_n_flags: { n: 1, of: BUERGEN_FLAGS }, hide_if_flags: [CWZ_FLAG] },
        { text: 'Wer könnte denn für mich bürgen?', next: 'wer', hide_if_flags: [CWZ_FLAG] },
        { text: 'Wann trefft ihr euch?', next: 'regel' },
        { text: 'Auf Wiedersehen.' }] },
    ok: { text: 'Lene nickt langsam. „Wenn das so ist. Der Bleisatz handelt Waffen und Rüstungen, die Pfandrunde Artefakte. Und beide kaufen, was gefallene Beyonder zurücklassen. Die Treffpunkte stehen ab jetzt auf deiner Stadtkarte.“',
      sets_flags: [CWZ_FLAG], choices: [{ text: 'Danke.' }] },
    wer: { text: '„Die Leute, die hier schon länger fallen: der Aufzugswärter, der Rohrpostbote, der Laternenwart und die anderen. Hilf ihnen, dann helfen sie dir. Ein Wort von einem genügt.“', choices: [{ text: 'Verstanden.', next: 'start' }] },
    regel: { text: REGEL, choices: [{ text: 'Gut.', next: 'start' }] },
  } };
}

const SEATS = [[12, 4], [5, 7], [19, 7], [8, 10], [16, 10]];

function room(id, z) {
  return {
    id: `treffen_${id}`, name: z.mapName, city: 'calderwick', tiles: 'cw_druckerei',
    rows: ['IIIIIIIIIIIIIIIIIIIIIIII', ...Array(12).fill('I......................I'), 'IIIIIIIIIIIIIIIIIIIIIIII'],
    spawns: { default: [3, 11] },
    lights: [{ tile: [12, 6], radius: 100, intensity: 0.7, color: z.light }],
    ambient: { night: 0.6, fog: 0 },
    npcs: z.members.map((m, i) => ({ id: m.id, tile: SEATS[i] })),
    interactables: [{ id: `${id}_ausgang`, kind: 'door', tile: [3, 12], to: z.exit, spawn: 'default', prompt: 'Hinaus nach Calderwick', marker: true }],
    decor: [],
  };
}

/** In buildContent nach der Calderwick-Kulisse: Zirkel, Räume, Figuren, Gespräche, Gegenstände, Stadtkarte. */
export function applyCalderwickZirkel(content) {
  const g = content.gatherings;
  if (!g?.rules || !content.maps.cw_quittungsmarkt) return;
  Object.assign(content.items, CWZ_WAFFEN, CWZ_RUESTUNG);
  content.artifacts ??= { list: {} };
  content.artifacts.list ??= {};
  for (const [id, a] of Object.entries(CWZ_ARTEFAKTE)) {
    content.artifacts.list[id] = { ...a };
    content.items[id] = { ...a, kind: 'artifact', rarity: 'okkult' };
  }
  const pids = Object.keys(content.pathways ?? {});
  const kern4 = (p) => Object.keys(content.items[`formel_${p}_4`]?.ingredients ?? {})[0];
  const cityPins = content.travelRules?.cities?.calderwick?.pins;
  for (const [cid, z] of Object.entries(CW_ZIRKEL)) {
    const wants = CWZ_GESUCHE.wants.filter((w) => content.items[w]);
    const members = z.members.map((m) => ({ id: m.id, offers: m.offers.map((o) => ({ ...o })), wants: [...wants] }));
    const { request_chance, request_min, request_markup } = CWZ_GESUCHE;
    g.circles[cid] = { name: z.name, member_flag: CWZ_FLAG, map: `treffen_${cid}`, short: z.short, city: 'calderwick', invite: z.invite, host: z.members[0].id, members,
      request_chance, request_min, request_markup };
    content.maps[`treffen_${cid}`] = room(cid, z);
    if (cityPins) cityPins[`treffen_${cid}`] = z.pin;
    content.travel.push({ map: `treffen_${cid}`, spawn: 'default', name: z.name, desc: `${z.desc} Nur während eines offenen Treffens.`,
      requires_gathering: cid, requires_flags: [CWZ_FLAG], city: 'calderwick' });
    for (const [n, d] of Object.entries(z.npcs)) {
      content.npcs[n] = { ...d, dialogue: n };
      content.dialogues[n] = memberDialog(cid, z.say[n]);
    }
  }
  // Am Rand: Seq-4-Kernzutaten (Bleisatz und Pfandrunde abwechselnd), ab Seq 5 des Pfades
  pids.filter((p) => kern4(p) && content.items[kern4(p)]).forEach((p, i) => {
    const c = g.circles[i % 2 ? 'cw_pfandrunde' : 'cw_bleisatz'];
    c.members[(i >> 1) % c.members.length].offers.push(L(kern4(p), CWZ_ZUTAT4.price, CWZ_ZUTAT4.chance, { requires_pathway: [p, 5], locked_text: 'Erst ab Sequenz 5 dieses Pfades' }));
  });
  g.rules.orders = { ...(g.rules.orders ?? {}), calderwick: Object.keys(CW_ZIRKEL) };
  // Türsteherin am Quittungsmarkt
  content.npcs[CWZ_TUER] = { ...npc('Lene Riegel', 'Türsteherin der Calderwicker Zirkel', '#5a4a5a'), dialogue: CWZ_TUER };
  content.dialogues[CWZ_TUER] = tuerDialog(content);
  const qm = content.maps.cw_quittungsmarkt;
  qm.npcs = [...(qm.npcs ?? []).filter((n) => n.id !== CWZ_TUER), { id: CWZ_TUER, tile: [12, 18] }];
}
